# ADR-0001: Lựa Chọn Kiến Trúc Siêu Nhẹ 100% Client-side Cho Linux Perm Sandbox

- **Ngày quyết định**: 2026-09-12
- **Người đề xuất**: `@tech-lead`
- **Trạng thái**: Đã phê duyệt

## 1. Bối Cảnh & Thách Thức (Context)
Dự án cần một môi trường tương tác mô phỏng cơ chế phân quyền tập tin POSIX (UGO + Special Bits SUID/SGID/Sticky) và bộ đánh giá đặc quyền `/etc/sudoers` trong hệ điều hành Linux.
Yêu cầu cốt lõi từ Bang chủ:
1. Sử dụng React.
2. Tối ưu và gọn nhất có thể (bundle nhẹ, tải tức thì, zero-lag, không phụ thuộc server).
3. Có các tính năng độc đáo, chiều sâu kỹ thuật cao để tạo dấu ấn portfolio SysAdmin/DevOps.

## 2. Quyết Định (Decision)

### 2.1. Nền tảng Công nghệ (Tech Stack)
- **Framework**: **React 19 / 18 + Vite + TypeScript**.
  - Không sử dụng SSR/Next.js để tránh cồng kềnh không cần thiết.
  - Tận dụng Vite để HMR tức thì và bundle tree-shaking tối đa.
- **Trình soạn thảo Sudoers**:
  - **LOẠI BỎ Monaco Editor**: Monaco kéo theo hơn 4MB JavaScript, nhiều web worker phức tạp và cấu hình custom syntax tốn tài nguyên.
  - **LỰA CHỌN**: Custom Lightweight Sudoers Studio kết hợp Syntax Highlighter chuyên dụng (regex/token-based parser nhẹ dưới 10KB). Tải trang < 100ms.
- **Styling**: **Tailwind CSS** kết hợp bảng màu Dark Mode chuẩn Linux Terminal (Slate/Emerald/Amber/Rose).
- **State Management**: Zero-dependency Custom Store hoặc Zustand siêu nhẹ (~1KB). Không Redux, không boilerplates.

### 2.2. Kiến Trúc Phân Tầng Độc Lập (Clean Decoupled Architecture)
Tách biệt triệt để Logic mô phỏng POSIX Kernel khỏi React UI:
- `src/core/vfs/`: In-Memory Virtual File System (Node, Inode, UID, GID, Mode, Special Bits, Paths).
- `src/core/posix/`: POSIX Permission Evaluator (Directory Traversal `x`, Non-cumulative UGO match, SUID/SGID/Sticky bit behaviors, Inode delete rules).
- `src/core/sudoers/`: Sudoers Lexer, Parser, AST Builder, và Rule Matcher (User_Alias, Cmnd_Alias, NOPASSWD, Wildcards, Last-match-wins engine).
- `src/core/challenges/`: Kịch bản thử thách SysAdmin (Quests & Verification).
- `src/ui/`: Các React Components chỉ nhận dữ liệu từ Core Engine và dispatch event.

## 3. Các Tính Năng Độc Đáo Đột Phá (Unique Features)
1. **Visual POSIX Kernel Tracer ("Why Was Access Denied/Granted?")**:
   - Trực quan hóa từng bước suy luận của kernel Linux: Path Traversal -> Root Bypass -> Owner Match -> Group Match -> Others -> Special Bits.
2. **Sudoers Rule Clash & Last-Match-Wins Visualizer**:
   - Quét file `/etc/sudoers`, hiển thị trực quan dòng rule nào bị override bởi dòng rule bên dưới, phát hiện lỗ hổng leo thang đặc quyền tiềm ẩn (GTFOBins warning).
3. **Interactive 4-Way Synced Permission Matrix**:
   - Đồng bộ tức thì: Octal (0755/4755) <-> Symbolic (`-rwsr-xr-x`) <-> Matrix Grid <-> Terminal Commands (`chmod`, `chown`).
4. **SysAdmin Quests (Chế độ Thử thách Thực tế)**:
   - Các bài toán kinh điển: Sticky bit `/tmp`, SGID Shared Directory, Sudoers NOPASSWD Hardening.

## 4. Đánh Đổi & Hệ Quả (Trade-offs & Consequences)
- **Ưu điểm**:
  - Tải trang siêu tốc (< 150KB gzip toàn bộ app).
  - Chi phí hosting = 0đ (Deploy bất kỳ static host nào: Vercel, GitHub Pages, Cloudflare Pages).
  - An toàn bảo mật 100%, không lo RCE.
  - Core engine có thể chạy độc lập, viết Unit Test 100% không cần mock DOM.
- **Đánh đổi / Thách thức**:
  - Đòi hỏi bộ Parser Sudoers và POSIX Engine phải được viết bằng TypeScript với độ chính xác cao và xử lý đầy đủ các corner-case của Linux spec.
