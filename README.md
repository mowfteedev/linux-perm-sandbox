# 🛡️ Linux Permissions & Sudoers Sandbox

> **Mô phỏng phân quyền tập tin POSIX & thẩm định `/etc/sudoers` chuẩn Linux ngay trên trình duyệt.**  
> 100% Client-side • Zero Latency (< 1ms) • Không cần máy chủ.  
> 🌐 **Live Demo**: [https://mowfteedev.github.io/linux-perm-sandbox/](https://mowfteedev.github.io/linux-perm-sandbox/)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React: 19](https://img.shields.io/badge/React-19-61DAFB.svg)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](tsconfig.json)
[![Tailwind: v4](https://img.shields.io/badge/Tailwind-v4-38BDF8.svg)](src/index.css)

---

## ✨ Tính Năng Nổi Bật

- **POSIX Permissions Engine**: Tinh chỉnh `rwx`, cờ đặc biệt `SUID (4000)`, `SGID (2000)`, `Sticky Bit (1000)` và sinh câu lệnh `chmod` / `chown` tức thì.
- **Kernel Traversal Tracer**: Mô phỏng chuẩn xác quy tắc dừng kiểm tra khi khớp Owner (Non-cumulative) và kiểm tra bit `x` duyệt thư mục tổ tiên (`-EACCES`).
- **Sudoers Studio & GTFOBins**: Soạn thảo `/etc/sudoers`, kiểm tra cơ chế Last-Match-Wins, phát hiện xung đột Rule Clash và cảnh báo 27 công cụ leo thang đặc quyền GTFOBins.
- **VFS Explorer Trực Quan**: Cây thư mục Linux chuẩn (`/etc/shadow`, `/tmp`, `/usr/bin/passwd`...) phản hồi tức thì trong RAM.

---

## ⚡ Cài Đặt & Chạy Nhanh (Quickstart)

```bash
# Clone và khởi chạy
git clone https://github.com/mowfteedev/linux-perm-sandbox.git
cd linux-perm-sandbox
npm install
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`.

---

## 📚 Bảng Tra Cứu Nhanh (Cheatsheet)

| Giá trị | Quyền | Ký hiệu | Mức quyền thông dụng |
|:---:|:---:|:---:|:---|
| **4** | Read (Đọc) | `r` | `chmod 755`: Thư mục công khai / binary (`rwxr-xr-x`) |
| **2** | Write (Ghi) | `w` | `chmod 644`: File tài liệu chuẩn (`rw-r--r--`) |
| **1** | Execute (Chạy) | `x` | `chmod 600`: Khóa bảo mật SSH (`rw-------`) |
| **+1000** | Sticky Bit | `t` | `chmod 1777`: Thư mục chia sẻ `/tmp` (chống xóa file) |

---

## 🛠️ Công Nghệ & Giấy Phép

- **Công nghệ**: React 19, TypeScript (Strict), Vite, Tailwind CSS v4, Lucide Icons.
- **Giấy phép**: Phân phối mã nguồn mở theo [MIT License](LICENSE) — Phát triển bởi **mowftee-guild**.
