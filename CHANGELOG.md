# 📜 Nhật Ký Thay Đổi (Changelog)

Toàn bộ các thay đổi đáng chú ý của dự án **`linux-perm-sandbox`** sẽ được lưu lại trong tài liệu này.  
Định dạng dựa theo chuẩn quốc tế [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), và dự án tuân thủ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-09-13

### Added
- **Core POSIX & VFS Engine (`src/core/`)**:
  - `InMemoryVFS`: Quản lý cây thư mục và Inodes ảo trong bộ nhớ RAM, hỗ trợ tạo file, thư mục, `chmod`, `chown`, đệ quy xóa và kế thừa nhóm `SGID`.
  - `evaluateAccess`: Bộ giải trình logic kiểm tra phân quyền kernel chuẩn POSIX, bao gồm kiểm tra duyệt đường dẫn tổ tiên (Path Traversal `x` bit), cơ chế Root bypass, quy tắc Không cộng dồn (Non-cumulative: Owner, Group, Others), và cờ xóa Sticky Bit (`1777` trên `/tmp`).
  - `mode.ts`: Chuyển đổi hai chiều mượt mà giữa chuỗi Bát phân (`0755`), chuỗi Ký hiệu (`-rwxr-xr-x`) và cấu trúc đối tượng `PosixMode`.
- **Sudoers AST Parser & Matcher Engine (`src/core/sudoers/`)**:
  - Bộ tách từ khóa (Lexer) và bộ dựng cây cú pháp trừu tượng (AST Parser) chuẩn cú pháp `/etc/sudoers(5)`.
  - Hỗ trợ đầy đủ các bí danh: `User_Alias`, `Runas_Alias`, `Host_Alias`, `Cmnd_Alias`.
  - Thực thi chính xác cơ chế đối soát quy tắc từ trên xuống dưới (Top-to-bottom) và quy tắc người đến sau chiến thắng (Last-Match-Wins).
  - Tích hợp phát hiện xung đột cấu hình (Rule Clash Detector) và cảnh báo phủ định vô hiệu hóa lệnh cấm (Accidental Bypass).
  - Cơ sở dữ liệu 27 công cụ nhị phân leo thang đặc quyền **GTFOBins** kèm liên kết tài liệu khai thác trực tiếp.
- **SysAdmin Cyber-Terminal Design System (`src/ui/tokens/`, `src/index.css`)**:
  - Bộ từ điển Design Tokens chuẩn thang đo nghiêm ngặt **8pt Grid** (4, 8, 12, 16, 24, 32px).
  - Bảng màu phân cấp thị giác UGO: User (Sky), Group (Indigo), Others (Violet).
  - Bảng màu phân cấp bit quyền hạn: Read (Emerald), Write (Amber), Exec (Blue).
  - Cảnh báo Bit đặc biệt: SUID (Rose), SGID (Orange), Sticky Bit (Fuchsia).
  - Tỉ lệ tương phản văn bản đạt chuẩn **WCAG 2.1 AA** (từ 4.6:1 đến 17.6:1 AAA).
- **Interactive Multi-Panel Dashboard (`src/ui/components/`)**:
  - `VFSTree`: Cây thư mục tệp tin ảo trực quan, hỗ trợ đóng/mở đệ quy, tìm kiếm đường dẫn và hiển thị cờ SUID/SGID/Sticky.
  - `PermissionMatrix`: Bảng 3x3 UGO tương tác cảm ứng phím cơ Tactile (`active:scale-95`), thanh công cụ Bit đặc biệt, tự động sinh mã `$ chmod` và `$ chown` với nút sao chép một chạm.
  - `KernelTracer`: Bộ giải trình từng bước suy luận của kernel, chỉ rõ thư mục chặn duyệt hoặc bit quyền thiếu hụt.
  - `SudoersStudio`: Trạm soạn thảo trực tiếp `/etc/sudoers` với các kịch bản mẫu (Ubuntu chuẩn, cấu hình hổng, chính sách Least-Privilege), cùng bộ mô phỏng thực thi `$ sudo [lệnh]`.
  - `CheatsheetModal`: Cẩm nang tra cứu nhanh các công thức bát phân, bit đặc biệt và cú pháp sudoers mở nhanh bằng phím tắt hoặc nút bấm.
  - Bố cục đáp ứng linh hoạt: 3 cột trên Desktop và thanh chuyển tab mượt mà trên điện thoại di động (Mobile-First).
- **Security Audit & Verification (`src/core/sudoers/security-audit.test.ts`)**:
  - Bổ sung 10 kịch bản kiểm thử bảo mật chuyên sâu cho GTFOBins, Rule Clash, Path Traversal và SUID EUID elevation.
  - Biên bản thẩm định an toàn thông tin đầy đủ tại `.memory/security-audit-report.md`.

### Changed
- Cập nhật `App.tsx` ghép nối hoàn chỉnh toàn bộ các Panel điều khiển vào `SandboxProvider` tập trung, đảm bảo thời gian phản hồi `< 1ms`.
- Tối ưu hóa bundle production đạt **`95.20 kB gzip`** (vượt xa ngân sách trần `< 200 kB`).

### Security
- Rà soát toàn diện và xác nhận 0% sử dụng `eval()`, `new Function()` hay `dangerouslySetInnerHTML`.
- 100% xử lý diễn ra trên Client-side, loại bỏ hoàn toàn bề mặt tấn công máy chủ.
