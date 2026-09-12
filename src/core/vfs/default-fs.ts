import { LinuxGroup, LinuxUser, VFSNode } from '@/types';
import { octalToMode } from '../posix/mode';

export const DEFAULT_USERS: LinuxUser[] = [
  {
    uid: 0,
    username: 'root',
    gid: 0,
    groups: [0],
  },
  {
    uid: 1000,
    username: 'mowftee',
    gid: 1000,
    groups: [1000, 4, 27], // primary: mowftee, supplementary: adm, sudo
  },
  {
    uid: 1001,
    username: 'developer',
    gid: 1001,
    groups: [1001, 1005], // primary: developer, supplementary: devteam
  },
  {
    uid: 1002,
    username: 'guest',
    gid: 1002,
    groups: [1002],
  },
];

export const DEFAULT_GROUPS: LinuxGroup[] = [
  { gid: 0, groupname: 'root' },
  { gid: 4, groupname: 'adm' },
  { gid: 27, groupname: 'sudo' },
  { gid: 42, groupname: 'shadow' },
  { gid: 1000, groupname: 'mowftee' },
  { gid: 1001, groupname: 'developer' },
  { gid: 1005, groupname: 'devteam' },
  { gid: 1002, groupname: 'guest' },
];

export function createInitialFileSystem(): Map<string, VFSNode> {
  const nodes = new Map<string, VFSNode>();

  const addNode = (
    path: string,
    name: string,
    type: VFSNode['type'],
    ownerUid: number,
    ownerUser: string,
    groupGid: number,
    groupName: string,
    octal: string,
    options: Partial<VFSNode> = {},
  ) => {
    const node: VFSNode = {
      id: path,
      name,
      path,
      type,
      ownerUid,
      ownerUser,
      groupGid,
      groupName,
      mode: octalToMode(octal),
      children: type === 'directory' ? [] : undefined,
      ...options,
    };
    nodes.set(path, node);

    // Link child to parent directory
    if (path !== '/') {
      const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
      const parent = nodes.get(parentPath);
      if (parent && parent.children && !parent.children.includes(path)) {
        parent.children.push(path);
      }
    }
  };

  // Root directory
  addNode('/', '/', 'directory', 0, 'root', 0, 'root', '0755');

  // /etc
  addNode('/etc', 'etc', 'directory', 0, 'root', 0, 'root', '0755');
  addNode('/etc/passwd', 'passwd', 'file', 0, 'root', 0, 'root', '0644', {
    content: 'root:x:0:0:root:/root:/bin/bash\nmowftee:x:1000:1000:Mowftee:/home/mowftee:/bin/bash',
  });
  addNode('/etc/shadow', 'shadow', 'file', 0, 'root', 42, 'shadow', '0640', {
    content: 'root:$6$encryptedpassword...:19000:0:99999:7:::',
  });
  addNode('/etc/sudoers', 'sudoers', 'file', 0, 'root', 0, 'root', '0440', {
    content: 'root ALL=(ALL:ALL) ALL\n%sudo ALL=(ALL:ALL) ALL\nmowftee ALL=(ALL) NOPASSWD: ALL',
  });

  // /tmp (with Sticky Bit: 1777)
  addNode('/tmp', 'tmp', 'directory', 0, 'root', 0, 'root', '1777');
  addNode('/tmp/user_notes.txt', 'user_notes.txt', 'file', 1000, 'mowftee', 1000, 'mowftee', '0644', {
    content: 'Meeting notes on server hardening.',
  });
  // /tmp/shared_project (SGID + Sticky Bit: 3770)
  addNode('/tmp/shared_project', 'shared_project', 'directory', 1001, 'developer', 1005, 'devteam', '3770');

  // /usr & /usr/bin
  addNode('/usr', 'usr', 'directory', 0, 'root', 0, 'root', '0755');
  addNode('/usr/bin', 'bin', 'directory', 0, 'root', 0, 'root', '0755');
  // /usr/bin/passwd (SUID: 4755)
  addNode('/usr/bin/passwd', 'passwd', 'file', 0, 'root', 0, 'root', '4755');
  // /usr/bin/wall (SGID: 2755)
  addNode('/usr/bin/wall', 'wall', 'file', 0, 'root', 4, 'adm', '2755');

  // /home
  addNode('/home', 'home', 'directory', 0, 'root', 0, 'root', '0755');
  // /home/mowftee (0700 - private)
  addNode('/home/mowftee', 'mowftee', 'directory', 1000, 'mowftee', 1000, 'mowftee', '0700');
  addNode('/home/mowftee/secret.txt', 'secret.txt', 'file', 1000, 'mowftee', 1000, 'mowftee', '0600', {
    content: 'CONFIDENTIAL_API_KEY=sk-live-992381283',
  });
  // /home/developer (0750)
  addNode('/home/developer', 'developer', 'directory', 1001, 'developer', 1005, 'devteam', '0750');
  addNode('/home/developer/workspace', 'workspace', 'directory', 1001, 'developer', 1005, 'devteam', '0755');

  // /var & /var/log
  addNode('/var', 'var', 'directory', 0, 'root', 0, 'root', '0755');
  addNode('/var/log', 'log', 'directory', 0, 'root', 0, 'root', '0755');
  addNode('/var/log/syslog', 'syslog', 'file', 0, 'root', 4, 'adm', '0640', {
    content: 'kernel: [0.000000] Linux version 6.8.0-generic',
  });

  return nodes;
}
