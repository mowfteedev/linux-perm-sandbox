/**
 * Default /etc/sudoers file content and educational sandbox presets.
 */

export const DEFAULT_SUDOERS_CONTENT = `# /etc/sudoers
#
# This file MUST be edited with the 'visudo' command as root.
#
# Please see the man page for details on how to write a sudoers file.
#

# Host alias specification

# User alias specification
User_Alias ADMINS = mowftee, %sudo
User_Alias DEVTEAM = developer, %devteam

# Cmnd alias specification
Cmnd_Alias WEB_OPS = /usr/bin/systemctl restart nginx, /usr/bin/systemctl reload nginx, /usr/bin/nginx -t
Cmnd_Alias LOG_VIEW = /usr/bin/tail -f /var/log/*, /usr/bin/cat /var/log/*
Cmnd_Alias DANGEROUS = /bin/su, /bin/bash, /bin/sh

# Defaults specification
Defaults env_reset
Defaults mail_badpass
Defaults secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# User privilege specification
root ALL=(ALL:ALL) ALL

# Members of the admin group may gain root privileges
%admin ALL=(ALL) ALL

# Allow members of group sudo to execute any command
%sudo ALL=(ALL:ALL) ALL

# Developer restricted deployment rules (Last-match-wins example)
developer ALL=(ALL) /usr/bin/apt update, /usr/bin/git pull, !/usr/bin/apt install

# Mowftee primary sysadmin
mowftee ALL=(ALL) NOPASSWD: ALL
`;

export const SUDOERS_PRESET_MISCONFIGURED = `# /etc/sudoers - Insecure Misconfigured Scenario
Defaults env_reset

# Developer allowed to edit configuration files, but vim spawns root shell!
developer ALL=(ALL) NOPASSWD: /usr/bin/vim /etc/nginx/nginx.conf

# Auditor allowed to search files, but find has -exec flag
auditor ALL=(ALL) NOPASSWD: /usr/bin/find /var/log/

# Rule ordering bug (Last-match-wins clash)
# Line 11 intends to block su, but Line 12 re-enables ALL!
bob ALL=(ALL) ALL, !/bin/su
bob ALL=(ALL) ALL
`;

export const SUDOERS_PRESET_HARDENED = `# /etc/sudoers - Hardened Least Privilege Policy
Defaults env_reset
Defaults secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
Defaults use_pty
Defaults log_input, log_output

Cmnd_Alias SERVICE_CONTROL = /usr/bin/systemctl restart nginx, /usr/bin/systemctl status nginx
Cmnd_Alias LOG_INSPECT = /usr/bin/journalctl -u nginx

# Specific least-privilege commands with strict arguments
%devops ALL=(root) NOPASSWD: SERVICE_CONTROL, LOG_INSPECT

root ALL=(ALL:ALL) ALL
`;
