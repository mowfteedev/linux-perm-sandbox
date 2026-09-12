import {
  FileAccessOperation,
  LinuxUser,
  PosixEvaluationResult,
  TraceStep,
  VFSNode,
} from '@/types';
import { getParentPath, InMemoryVFS, normalizePath } from '../vfs/vfs';
import { modeToOctal, modeToSymbolic } from './mode';

/**
 * Evaluates whether a user can traverse a specific directory node
 */
function checkDirectoryTraversal(
  node: VFSNode,
  user: LinuxUser,
): { allowed: boolean; matchedRole: 'root' | 'owner' | 'group' | 'other'; testedBit: string; reason: string } {
  // Root bypass on directory traversal
  if (user.uid === 0) {
    return {
      allowed: true,
      matchedRole: 'root',
      testedBit: 'none (root bypass)',
      reason: 'Root user (UID 0) can search any directory regardless of x permission bit.',
    };
  }

  // Owner check (Non-cumulative)
  if (user.uid === node.ownerUid) {
    const ok = node.mode.user.execute;
    return {
      allowed: ok,
      matchedRole: 'owner',
      testedBit: `user.execute (${ok ? 'x' : '-'})`,
      reason: ok
        ? `Owner '${node.ownerUser}' has execute/search 'x' bit set.`
        : `Owner '${node.ownerUser}' does NOT have search 'x' bit. Non-cumulative check stops here.`,
    };
  }

  // Group check (Non-cumulative)
  const isGroupMember = user.gid === node.groupGid || user.groups.includes(node.groupGid);
  if (isGroupMember) {
    const ok = node.mode.group.execute;
    return {
      allowed: ok,
      matchedRole: 'group',
      testedBit: `group.execute (${ok ? 'x' : '-'})`,
      reason: ok
        ? `User is member of group '${node.groupName}' which has search 'x' bit set.`
        : `User is member of group '${node.groupName}', but group lacks search 'x' bit. Non-cumulative check stops here.`,
    };
  }

  // Other check
  const ok = node.mode.other.execute;
  return {
    allowed: ok,
    matchedRole: 'other',
    testedBit: `other.execute (${ok ? 'x' : '-'})`,
    reason: ok
      ? 'Other users have search \'x\' bit set on this directory.'
      : 'User falls under \'Others\', and search \'x\' bit is not granted.',
  };
}

/**
 * Core Linux POSIX Permission Evaluator with Micro-step Kernel Tracing
 */
export function evaluateAccess(
  vfs: InMemoryVFS,
  rawPath: string,
  operation: FileAccessOperation,
  user: LinuxUser,
): PosixEvaluationResult {
  const path = normalizePath(rawPath);
  const targetNode = vfs.getNode(path);
  const traces: TraceStep[] = [];

  // Default effective identities
  let effectiveUid = user.uid;
  let effectiveGid = user.gid;

  // If target does not exist
  if (!targetNode) {
    traces.push({
      stepId: 'node-lookup',
      stage: 'PATH_TRAVERSAL',
      title: 'Inode Lookup',
      status: 'DENIED',
      detail: `ENOENT: No such file or directory at '${path}'.`,
      pathChecked: path,
    });

    return {
      allowed: false,
      operation,
      user,
      targetNode: {
        id: path,
        name: path.split('/').pop() || '',
        path,
        type: 'file',
        ownerUid: 0,
        ownerUser: 'root',
        groupGid: 0,
        groupName: 'root',
        mode: {
          special: { suid: false, sgid: false, sticky: false },
          user: { read: false, write: false, execute: false },
          group: { read: false, write: false, execute: false },
          other: { read: false, write: false, execute: false },
        },
      },
      effectiveUid,
      effectiveGid,
      traces,
      denialReason: `ENOENT: No such file or directory: ${path}`,
    };
  }

  // 1. STEP 1: Ancestor Directory Path Traversal Check
  const ancestors = vfs.getAncestors(path);
  let traversalFailed = false;

  for (const ancestor of ancestors) {
    const check = checkDirectoryTraversal(ancestor, user);

    if (!check.allowed) {
      traces.push({
        stepId: `traverse-${ancestor.path}`,
        stage: 'PATH_TRAVERSAL',
        title: `Traverse Directory '${ancestor.path}'`,
        status: 'DENIED',
        detail: `Access Denied: Cannot traverse directory '${ancestor.path}'. ${check.reason}`,
        pathChecked: ancestor.path,
        testedBit: check.testedBit,
        codeSnippet: `chmod +x ${ancestor.path}`,
      });
      traversalFailed = true;
      break;
    } else {
      traces.push({
        stepId: `traverse-${ancestor.path}`,
        stage: 'PATH_TRAVERSAL',
        title: `Traverse Directory '${ancestor.path}'`,
        status: 'GRANTED',
        detail: `Traversal allowed through '${ancestor.path}': ${check.reason}`,
        pathChecked: ancestor.path,
        testedBit: check.testedBit,
      });
    }
  }

  if (traversalFailed) {
    return {
      allowed: false,
      operation,
      user,
      targetNode,
      effectiveUid,
      effectiveGid,
      traces,
      denialReason: 'EACCES: Permission denied (Path traversal search bit missing on ancestor directory)',
    };
  }

  // 2. STEP 2: Special Handling for DELETE operation (Sticky Bit & Parent Directory Write)
  if (operation === 'delete') {
    const parentPath = getParentPath(path);
    const parentNode = vfs.getNode(parentPath);

    if (!parentNode) {
      traces.push({
        stepId: 'delete-parent-lookup',
        stage: 'STICKY_BIT',
        title: 'Parent Directory Lookup',
        status: 'DENIED',
        detail: `Parent directory '${parentPath}' not found.`,
      });
      return {
        allowed: false,
        operation,
        user,
        targetNode,
        effectiveUid,
        effectiveGid,
        traces,
        denialReason: 'ENOENT: Parent directory does not exist',
      };
    }

    // Checking write & execute on parent directory
    const parentWriteCheck = evaluateAccess(vfs, parentPath, 'write', user);
    if (!parentWriteCheck.allowed) {
      traces.push({
        stepId: 'delete-parent-write',
        stage: 'OWNER_MATCH',
        title: `Parent Directory '${parentPath}' Write Permission`,
        status: 'DENIED',
        detail: `EACCES: Deleting a file requires write permission on parent directory '${parentPath}'.`,
        pathChecked: parentPath,
      });
      return {
        allowed: false,
        operation,
        user,
        targetNode,
        effectiveUid,
        effectiveGid,
        traces,
        denialReason: `EACCES: Cannot delete file. Write permission denied on parent directory '${parentPath}'.`,
      };
    }

    // Check Sticky Bit on parent directory (e.g. /tmp with mode 1777)
    if (parentNode.mode.special.sticky) {
      const isRoot = user.uid === 0;
      const isFileOwner = user.uid === targetNode.ownerUid;
      const isParentOwner = user.uid === parentNode.ownerUid;

      if (isRoot || isFileOwner || isParentOwner) {
        traces.push({
          stepId: 'sticky-bit-check',
          stage: 'STICKY_BIT',
          title: 'Sticky Bit Enforcement (mode 1xxx)',
          status: 'GRANTED',
          detail: `Parent '${parentPath}' has Sticky Bit set. Delete permitted because user '${user.username}' is ${
            isRoot ? 'Root (UID 0)' : isFileOwner ? 'File Owner' : 'Directory Owner'
          }.`,
          testedBit: 'sticky (1000)',
        });
      } else {
        traces.push({
          stepId: 'sticky-bit-check',
          stage: 'STICKY_BIT',
          title: 'Sticky Bit Enforcement (mode 1xxx)',
          status: 'DENIED',
          detail: `EPERM: Sticky bit is set on '${parentPath}'. Only root, file owner ('${targetNode.ownerUser}'), or directory owner ('${parentNode.ownerUser}') can delete this file.`,
          testedBit: 'sticky (1000)',
        });

        return {
          allowed: false,
          operation,
          user,
          targetNode,
          effectiveUid,
          effectiveGid,
          traces,
          denialReason: `EPERM: Operation not permitted (Sticky bit protected in '${parentPath}')`,
        };
      }
    }

    // Delete allowed!
    return {
      allowed: true,
      operation,
      user,
      targetNode,
      effectiveUid,
      effectiveGid,
      traces,
    };
  }

  // 3. STEP 3: Root Bypass Rule (UID 0) on target node
  if (user.uid === 0) {
    if (operation === 'read' || operation === 'write') {
      traces.push({
        stepId: 'root-bypass',
        stage: 'ROOT_BYPASS',
        title: 'Root Superuser Bypass (UID 0)',
        status: 'GRANTED',
        detail: `Root bypass granted for '${operation}' on '${path}' (${modeToOctal(targetNode.mode)} / ${modeToSymbolic(targetNode.mode, targetNode.type)}).`,
      });

      return {
        allowed: true,
        operation,
        user,
        targetNode,
        effectiveUid,
        effectiveGid,
        traces,
      };
    }

    if (operation === 'execute') {
      // Real Linux kernel rule: Root can only execute if at least ONE 'x' bit is set!
      const hasAnyExecuteBit =
        targetNode.mode.user.execute ||
        targetNode.mode.group.execute ||
        targetNode.mode.other.execute;

      if (hasAnyExecuteBit) {
        traces.push({
          stepId: 'root-exec-pass',
          stage: 'ROOT_BYPASS',
          title: 'Root Execution Check',
          status: 'GRANTED',
          detail: `Root granted execution because at least one execute bit is set (${modeToSymbolic(targetNode.mode, targetNode.type)}).`,
        });

        return {
          allowed: true,
          operation,
          user,
          targetNode,
          effectiveUid,
          effectiveGid,
          traces,
        };
      } else {
        traces.push({
          stepId: 'root-exec-fail',
          stage: 'ROOT_BYPASS',
          title: 'Root Execution Restriction (Linux Kernel Spec)',
          status: 'DENIED',
          detail: 'Linux Kernel execve() returns EACCES: Even Root cannot execute a file without at least one execute bit (mode has no \'x\' bit).',
          codeSnippet: `chmod +x ${path}`,
        });

        return {
          allowed: false,
          operation,
          user,
          targetNode,
          effectiveUid,
          effectiveGid,
          traces,
          denialReason: 'EACCES: Permission denied (File has no execute bits set anywhere, even root cannot execute it)',
        };
      }
    }
  }

  // 4. STEP 4: Non-cumulative POSIX UGO Matching (Normal Users)
  const opKey = operation === 'traverse' ? 'execute' : operation;

  // 4A: Owner Matching
  if (user.uid === targetNode.ownerUid) {
    const isAllowed = targetNode.mode.user[opKey];

    if (isAllowed) {
      traces.push({
        stepId: 'owner-match',
        stage: 'OWNER_MATCH',
        title: `Owner Match: ${user.username}`,
        status: 'GRANTED',
        detail: `User '${user.username}' matches file owner. User permission '${opKey}' bit is granted.`,
        testedBit: `user.${opKey} = true`,
      });
    } else {
      traces.push({
        stepId: 'owner-match',
        stage: 'OWNER_MATCH',
        title: `Owner Match: ${user.username}`,
        status: 'DENIED',
        detail: `POSIX Non-cumulative Rule: User '${user.username}' matches file owner, but user bit lacks '${opKey}'. Linux Kernel stops immediately and does NOT check group or others!`,
        testedBit: `user.${opKey} = false`,
        codeSnippet: `chmod u+${opKey[0]} ${path}`,
      });

      return {
        allowed: false,
        operation,
        user,
        targetNode,
        effectiveUid,
        effectiveGid,
        traces,
        denialReason: `EACCES: Permission denied (Owner '${user.username}' lacks '${opKey}' permission)`,
      };
    }
  } else {
    // 4B: Group Matching (Primary or Supplementary)
    const isGroupMember =
      user.gid === targetNode.groupGid || user.groups.includes(targetNode.groupGid);

    if (isGroupMember) {
      const isAllowed = targetNode.mode.group[opKey];

      if (isAllowed) {
        traces.push({
          stepId: 'group-match',
          stage: 'GROUP_MATCH',
          title: `Group Match: ${targetNode.groupName} (GID ${targetNode.groupGid})`,
          status: 'GRANTED',
          detail: `User '${user.username}' belongs to group '${targetNode.groupName}'. Group permission '${opKey}' bit is granted.`,
          testedBit: `group.${opKey} = true`,
        });
      } else {
        traces.push({
          stepId: 'group-match',
          stage: 'GROUP_MATCH',
          title: `Group Match: ${targetNode.groupName} (GID ${targetNode.groupGid})`,
          status: 'DENIED',
          detail: `POSIX Non-cumulative Rule: User '${user.username}' belongs to group '${targetNode.groupName}', but group bit lacks '${opKey}'. Evaluation stops immediately without checking Others!`,
          testedBit: `group.${opKey} = false`,
          codeSnippet: `chmod g+${opKey[0]} ${path}`,
        });

        return {
          allowed: false,
          operation,
          user,
          targetNode,
          effectiveUid,
          effectiveGid,
          traces,
          denialReason: `EACCES: Permission denied (Group '${targetNode.groupName}' lacks '${opKey}' permission)`,
        };
      }
    } else {
      // 4C: Others Matching
      const isAllowed = targetNode.mode.other[opKey];

      if (isAllowed) {
        traces.push({
          stepId: 'other-match',
          stage: 'OTHER_MATCH',
          title: 'Others Match',
          status: 'GRANTED',
          detail: `User '${user.username}' is neither owner nor group member. Other permission '${opKey}' bit is granted.`,
          testedBit: `other.${opKey} = true`,
        });
      } else {
        traces.push({
          stepId: 'other-match',
          stage: 'OTHER_MATCH',
          title: 'Others Match',
          status: 'DENIED',
          detail: `User '${user.username}' is evaluated under 'Others'. Other permission '${opKey}' bit is missing.`,
          testedBit: `other.${opKey} = false`,
          codeSnippet: `chmod o+${opKey[0]} ${path}`,
        });

        return {
          allowed: false,
          operation,
          user,
          targetNode,
          effectiveUid,
          effectiveGid,
          traces,
          denialReason: `EACCES: Permission denied (Others lack '${opKey}' permission)`,
        };
      }
    }
  }

  // 5. STEP 5: Special Execution Bits (SUID & SGID on successful execution)
  if (operation === 'execute') {
    if (targetNode.mode.special.suid) {
      effectiveUid = targetNode.ownerUid;
      traces.push({
        stepId: 'suid-elevation',
        stage: 'SPECIAL_BITS',
        title: 'SUID (Set Owner User ID) Active',
        status: 'INFO',
        detail: `Process Effective UID (EUID) elevates from ${user.uid} (${user.username}) to ${targetNode.ownerUid} (${targetNode.ownerUser}).`,
      });
    }

    if (targetNode.mode.special.sgid) {
      effectiveGid = targetNode.groupGid;
      traces.push({
        stepId: 'sgid-elevation',
        stage: 'SPECIAL_BITS',
        title: 'SGID (Set Group ID) Active',
        status: 'INFO',
        detail: `Process Effective GID (EGID) elevates from ${user.gid} (${user.username}) to ${targetNode.groupGid} (${targetNode.groupName}).`,
      });
    }
  }

  return {
    allowed: true,
    operation,
    user,
    targetNode,
    effectiveUid,
    effectiveGid,
    traces,
  };
}
