# 🏛️ Kiến Trúc Hệ Thống: Linux Permissions & Sudoers Sandbox (linux-perm-sandbox)

> *Tài liệu này là nguồn chân lý kỹ thuật (Single Source of Truth) do `@tech-lead` quản lý.*

## 1. Tổng Quan & Mục Tiêu Kỹ Thuật
- **Mục tiêu sản phẩm**: Môi trường tương tác mô phỏng cơ chế phân quyền tập tin POSIX (UGO + Special Bits SUID/SGID/Sticky) và bộ đánh giá đặc quyền `/etc/sudoers` 100% Client-side, zero latency, zero backend cost.
- **Kiến trúc chủ đạo**: **Modular Decoupled SPA (Single Page Application)**. Tách rời hoàn toàn Logic mô phỏng POSIX Kernel (`src/core`) khỏi tầng giao diện (`src/ui`).
- **Môi trường chạy**: 100% Client-side trên trình duyệt hiện đại (Browser-native ES Modules).

## 2. Công Nghệ Sử Dụng (Tech Stack)
- **Frontend Core**: React 19 / 18 + Vite + TypeScript (Strict Type Safety).
- **Styling**: Tailwind CSS v4 + Lucide React Icons (Giao diện Dark Theme chuyên nghiệp phong cách Terminal SysAdmin).
- **Trình soạn thảo & Syntax Highlighting**: Custom Tokenizer / Lightweight Sudoers Studio (thay thế Monaco Editor để tối ưu bundle < 150KB gzip).
- **Quản lý trạng thái (State Management)**: Custom Hook Store hoặc Zustand (~1KB), không dùng Redux để tránh phình mã nguồn.
- **Kiểm thử (Unit Tests)**: Vitest (kiểm thử 100% logic POSIX permission evaluation và Sudoers parser).

## 3. Ranh Giới Nghiệp Vụ & Cấu Trúc Module

```
src/
├── core/                        # Pure TypeScript Kernel & Engine (Zero UI Dependency)
│   ├── vfs/                     # In-Memory Virtual File System (Inode, Mode, Tree)
│   ├── posix/                   # POSIX Permission Evaluator & Traversal Tracer
│   ├── sudoers/                 # Sudoers Lexer, Parser, AST, Rule Matcher
│   └── challenges/              # SysAdmin Quests & Validation Logic
├── store/                       # Application State Store
├── ui/                          # React Presentation Layer
│   ├── components/
│   │   ├── permission-matrix/   # Interactive UGO & Special Bits Grid
│   │   ├── kernel-tracer/       # "Why Was Access Denied/Granted" Inspector Tree
│   │   ├── vfs-tree/            # Virtual File System Browser
│   │   ├── sudoers-studio/      # Sudoers Rule Inspector & Clash Visualizer
│   │   ├── quests/              # SysAdmin Challenge Quests Panel
│   │   └── cheatsheet/          # Live Command Exporter (chmod, chown, umask)
│   └── layout/                  # Main Shell, Header, Terminal Status Bar
└── types/                       # Shared Domain Types
```

## 4. Quy Chuẩn Kỹ Thuật Bắt Buộc (Guild Standards)
1. **Zero UI Leaks in Core**: Module `src/core/` không được import bất kỳ file nào từ React hoặc DOM. Toàn bộ là Pure Functions / Data Structures để đạt 100% Test Coverage.
2. **POSIX Compliance**:
   - Directory traversal phải kiểm tra `x` bit trên mọi thư mục tổ tiên.
   - Non-cumulative permission check: Owner match -> evaluate Owner only; Group match -> evaluate Group only; Else Others.
   - Special bits: SUID/SGID/Sticky bit được xử lý đúng chuẩn POSIX/Linux.
3. **Bundle Performance**: Tổng dung lượng bundle khi nén gzip phải dưới 200KB; thời gian First Contentful Paint (FCP) dưới 200ms.
4. **Responsive & Accessible**: Tối ưu hiển thị mượt mà từ màn hình Desktop (Multi-panel Dashboard) tới Mobile.
