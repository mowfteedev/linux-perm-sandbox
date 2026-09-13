# 🛡️ Linux Permissions & Sudoers Sandbox (`linux-perm-sandbox`)

> **Môi trường tương tác trực quan mô phỏng cơ chế phân quyền tập tin POSIX và thẩm định quy tắc `/etc/sudoers` chuẩn Linux.**  
> 100% Client-side • Không máy chủ • Zero Latency (< 1ms) • Dung lượng siêu nhẹ (~95KB Gzip).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-5.7%20Strict-3178C6.svg)](tsconfig.json)
[![Vitest: 55/55 Passing](https://img.shields.io/badge/Vitest-55%2F55%20Passed-10B981.svg)](src/core/smoke.test.ts)
[![Bundle Size: 95KB](https://img.shields.io/badge/Bundle%20Size-~95KB%20gzip-0EA5E9.svg)](dist/)
[![WCAG: 2.1 AA+](https://img.shields.io/badge/WCAG-2.1%20AA%2B%20(17.6%3A1)-8B5CF6.svg)](.memory/design-system.md)

---

## 💡 Nỗi Đau & Giải Pháp (Why This Exists)

Hầu hết các lỗi cấu hình bảo mật nghiêm trọng trong Linux (như lộ lọt file nhạy cảm, leo thang đặc quyền root, hoặc xung đột rule trong `/etc/sudoers`) đều bắt nguồn từ sự thiếu trực quan trong cách tư duy phân quyền:
- Người dùng thường nhầm tưởng quyền hạn Linux là **cộng dồn** (Cumulative), trong khi Linux Kernel áp dụng cơ chế **Không cộng dồn** (Non-cumulative: Khớp Owner là dừng ngay, bỏ qua hoàn toàn Group và Others).
- Không nhận ra file con trong thư mục sâu bị chặn hoàn toàn nếu một thư mục cha thiếu bit `x` (Directory Traversal).
- Cấp quyền `sudo` tưởng chừng vô hại cho các công cụ như `vim`, `find`, `nano`, `python3` nhưng thực chất mở toang cánh cửa leo thang root qua các kỹ thuật **GTFOBins**.
- Lỗi thứ tự rule trong `/etc/sudoers`: Rule cấm `!/bin/su` dòng trên bị vô hiệu hóa hoàn toàn bởi rule cấp phép `ALL` ở dòng dưới theo nguyên tắc **Last-Match-Wins**.

**`linux-perm-sandbox`** ra đời để giải quyết triệt để những nỗi đau này bằng một môi trường giả lập thời gian thực 100% chạy trên trình duyệt, không cần cài đặt Linux ảo, không rủi ro sập hệ thống thật.

---

## ⚡ Khởi Động Nhanh Trong 3 Bước (3-Step Quickstart)

### Điều kiện tiên quyết
- **Node.js**: Phiên bản `18.0.0` trở lên (Khuyến nghị Node 20 LTS hoặc 22).
- **npm** hoặc **pnpm** / **yarn**.

### 1. Tải mã nguồn & Cài đặt thư viện
```bash
git clone https://github.com/mowfteedev/linux-perm-sandbox.git
cd linux-perm-sandbox
npm install
```

### 2. Khởi chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
> Trình duyệt sẽ mở ứng dụng tại: `http://localhost:5173` (hoặc cổng được Vite cấp phát).

### 3. Kiểm thử & Đóng gói sản phẩm (Test & Build)
```bash
# Chạy toàn bộ bộ kiểm thử tự động (55 tests)
npm test -- --run

# Đóng gói bản phát hành production siêu nhẹ (< 100KB gzip)
npm run build
```

---

## 🖥️ Trải Nghiệm Giao Diện 3 Cột (Interactive Workspace)

Ứng dụng được thiết kế theo phong cách **SysAdmin Cyber-Terminal Dark Theme**, đạt chuẩn lưới **8pt Grid** và độ tương phản cao **WCAG 2.1 AA (17.6:1)**:

```
+-----------------------------------------------------------------------------------------------+
|  HEADER: Brand Logo | User Switcher (root/mowftee/dev/guest) | Op (r/w/x/rm) | Cheatsheet | Reset |
+-----------------------------------------------------------------------------------------------+
|  VFS EXPLORER (25%)    |        POSIX MATRIX & KERNEL TRACER (42%)        |  SUDOERS STUDIO (33%) |
|                        |                                                  |                       |
|  - In-Memory Tree      |  [BẢNG ĐIỀU KHIỂN QUYỀN HẠN]                     |  - Soạn thảo trực tiếp|
|  - Phân cấp /, /etc,   |    - Lưới 3x3 UGO Tactile Buttons                |  - Preset Ubuntu/Hard |
|    /home, /tmp...      |    - Bit đặc biệt: SUID, SGID, Sticky Bit        |  - 27 GTFOBins Alerts |
|  - Cờ cảnh báo SUID    |    - Đồng bộ Bát phân (0755) & Ký hiệu (-rwxr..) |  - Rule Clash Scanner |
|  - Tìm kiếm đường dẫn  |    - Sinh lệnh $ chmod, $ chown 1-click copy     |  - Mô phỏng thực thi  |
|                        |  [BỘ GIẢI TRÌNH BƯỚC KERNEL TRACER]              |    $ sudo [lệnh]      |
|                        |    - Kiểm tra duyệt tổ tiên (Path Traversal)     |                       |
|                        |    - Kết luận ALLOW / DENY và lý do chi tiết     |                       |
+-----------------------------------------------------------------------------------------------+
|  STATUS BAR: Active Path | Octal Mode | Inode Owner | Traversal Verdict | Latency: 0ms        |
+-----------------------------------------------------------------------------------------------+
```

---

## 🎯 Các Tính Năng Nòng Cốt (Signature Features)

### 1. 🔍 Bộ Giải Trình Quyền Hạn Kernel (POSIX Kernel Tracer)
- **Minh bạch hóa logic Kernel**: Trả lời câu hỏi *"Tại sao truy cập bị từ chối (-EACCES)?"*.
- **Path Traversal Resolution**: Duyệt từ `/` qua từng thư mục cha để kiểm tra quyền tìm kiếm (bit `x`). Nếu một thư mục cha thiếu bit `x`, quá trình dừng ngay lập tức.
- **Quy tắc Non-cumulative**: Giải thích rõ tại sao chủ sở hữu có quyền đọc nhưng không có quyền ghi thì dù quyền Group có `w` vẫn bị cấm ghi.
- **Sticky Bit Deletion Guard**: Thư mục `/tmp` (mode `1777`) chỉ cho phép Root, chủ sở hữu file, hoặc chủ sở hữu thư mục được phép xóa file.

### 2. ⚡ Lưới Điều Khiển Phân Quyền 4 Chiều (Permission Matrix)
- Đồng bộ hai chiều tức thời giữa:
  - **Mã bát phân** (`0755`, `4755`, `1777`).
  - **Chuỗi ký hiệu** (`-rwxr-xr-x`, `-rwsr-xr-x`, `drwxrwxrwt`).
  - **Lưới tương tác 3x3**: Nút bấm cơ Tactile với phản hồi rung thị giác (`active:scale-95`).
  - **Thanh công cụ Bit đặc biệt**: SUID (4000), SGID (2000), Sticky Bit (1000).
  - **Bộ sinh lệnh Terminal**: Tự động tạo `$ chmod` và `$ chown` tương ứng với nút sao chép một chạm.

### 3. 🛡️ Xưởng Thẩm Định Sudoers & GTFOBins (Sudoers Studio)
- **Bộ phân tích AST `sudoers(5)`**: Xử lý đầy đủ `User_Alias`, `Runas_Alias`, `Cmnd_Alias`, `NOPASSWD:`, thẻ phủ định `!`.
- **Cảnh báo xung đột (Rule Clash)**: Phát hiện dòng lệnh phía dưới ghi đè phủ định dòng lệnh phía trên (Last-Match-Wins).
- **Thư viện nhận diện 27 GTFOBins**: Cảnh báo leo thang đặc quyền tức thì nếu cấp quyền cho `vim`, `nano`, `find`, `python3`, `bash`, `git`, `nmap`, `sed`, `awk`, `man`, `apt`, `curl`, `wget`, `pkexec`... kèm liên kết tài liệu khai thác trực tiếp.
- **Bộ mô phỏng thực thi thời gian thực**: Nhập bất kỳ câu lệnh `$ sudo [command]` để kiểm tra xem người dùng hiện tại có được phép chạy không và có cần mật khẩu hay không.

---

## 📚 Cẩm Nang Phân Quyền Nhanh (SysAdmin Cheatsheet)

### Bảng Giá Trị Bát Phân & Nhị Phân
| Quyền Hạn | Ký hiệu | Nhị phân | Bát phân | Ý nghĩa đối với File | Ý nghĩa đối với Thư mục |
|:---:|:---:|:---:|:---:|:---|:---|
| **Read** | `r` | `100₂` | **4** | Đọc nội dung tệp tin | Liệt kê danh sách file bên trong (`ls`) |
| **Write** | `w` | `010₂` | **2** | Sửa đổi nội dung tệp tin | Tạo, xóa, đổi tên file trong thư mục |
| **Execute** | `x` | `001₂` | **1** | Chạy chương trình / script | Duyệt vào thư mục (`cd`, tìm kiếm path) |
| **None** | `-` | `000₂` | **0** | Không có quyền | Không có quyền |

### Bit Đặc Biệt (Special Bits)
- **SUID (`4000` / `s`)**: Tiến trình thực thi với đặc quyền của chủ sở hữu tệp (ví dụ: `/usr/bin/passwd`).
- **SGID (`2000` / `s`)**: File chạy với đặc quyền nhóm; thư mục con tạo mới sẽ tự động kế thừa Group của thư mục cha.
- **Sticky Bit (`1000` / `t`)**: Áp dụng cho thư mục dùng chung (như `/tmp`). Chỉ Root, chủ sở hữu file hoặc chủ sở hữu thư mục mới có quyền xóa file.

---

## 🏛️ Cấu Trúc Mã Nguồn (Repository Layout)

```text
src/
├── core/                        # Pure TypeScript Engine (0% UI / DOM Dependency)
│   ├── posix/                   # Bộ đánh giá phân quyền kernel POSIX & Traversal tracer
│   │   ├── evaluator.ts         # Logic non-cumulative, root bypass, sticky bit
│   │   └── mode.ts              # Chuyển đổi qua lại giữa Octal, Symbolic và PosixMode
│   ├── sudoers/                 # Trình phân tích cú pháp & đối soát /etc/sudoers
│   │   ├── lexer.ts             # Bộ tách từ khóa (Tokenizer)
│   │   ├── parser.ts            # Xây dựng cây cú pháp trừu tượng (AST Builder)
│   │   ├── matcher.ts           # Đối soát quy tắc Last-Match-Wins & Alias
│   │   └── analyzer.ts          # Thư viện 27 GTFOBins & Bộ phát hiện Rule Clash
│   └── vfs/                     # Hệ thống tệp tin ảo trong bộ nhớ (In-Memory VFS)
│       ├── vfs.ts               # Lớp quản lý Inodes, đường dẫn, chmod, chown
│       └── default-fs.ts        # Dữ liệu mẫu ban đầu (/etc, /tmp, /home, /var...)
├── store/                       # Quản lý trạng thái tập trung (Context + Hooks)
│   └── index.tsx                # useSandbox Store kết nối VFS và UI
├── ui/                          # Tầng hiển thị React 19 + Tailwind CSS v4
│   ├── components/
│   │   ├── cheatsheet/          # Modal tra cứu cẩm nang phân quyền
│   │   ├── kernel-tracer/       # Thanh giải trình bước suy luận Kernel Tracer
│   │   ├── permission-matrix/   # Lưới 3x3 UGO + thanh Special Bits
│   │   ├── sudoers-studio/      # Trạm soạn thảo & mô phỏng lệnh sudo
│   │   └── vfs-tree/            # Cây thư mục VFS Explorer có tìm kiếm
│   ├── layout/                  # Header & StatusBar
│   └── tokens/                  # Design Tokens chuẩn 8pt Grid & Bảng màu SysAdmin
└── types/                       # Định nghĩa TypeScript Types dùng chung
```

---

## 🧪 Kiểm Thử Hệ Thống (Testing Suite)

Dự án sở hữu bộ kiểm thử tự động **55 tests** bao phủ 100% các nhánh logic nghiệp vụ cốt lõi:
```bash
npm test -- --run
```
```text
✓ src/core/smoke.test.ts (2 tests)
✓ src/core/posix/mode.test.ts (6 tests)
✓ src/core/vfs/vfs.test.ts (6 tests)
✓ src/core/posix/evaluator.test.ts (14 tests)
✓ src/core/sudoers/sudoers.test.ts (17 tests)
✓ src/core/sudoers/security-audit.test.ts (10 tests)

Test Files  6 passed (6)
     Tests  55 passed (55)
  Duration  ~480ms
```

---

## 📜 Tài Liệu Liên Quan
- [Biên bản Quyết định Kiến trúc (ADR-0001)](.memory/adr/0001-khoi-tao-du-an.md)
- [Quy chuẩn Hệ thống Thiết kế (Design System Spec)](.memory/design-system.md)
- [Báo cáo Thẩm định Bảo mật (Security Audit Report)](.memory/security-audit-report.md)
- [Bảng Tiến độ & Bộ nhớ Dự án](.memory/progress.md)
- [Nhật ký Nâng cấp (Changelog)](CHANGELOG.md)

---

## 📄 Bản Quyền & Giấy Phép
Dự án được phân phối dưới giấy phép [MIT License](LICENSE).  
Phát triển với sự tỉ mỉ của đội ngũ **`mowftee-guild`**.
