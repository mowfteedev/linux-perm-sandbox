# 📌 Bảng Tiến Độ & Bộ Nhớ Tác Chiến: linux-perm-sandbox
*Cập nhật lần cuối: 2026-09-13 12:45*

## 🎯 Mục Tiêu Phiên Hiện Tại (Current Milestone)
- **Giai đoạn**: Hoàn tất STT 10 (Biên soạn tài liệu README & Cẩm nang SysAdmin - `@doc-writer`).
- **Trọng tâm**:
  - Soạn thảo `README.md` đạt chuẩn quốc tế, vượt qua "Bài kiểm tra 5 giây", hướng dẫn cài đặt 3 bước, sơ đồ kiến trúc và bảng tra cứu cẩm nang.
  - Biên soạn `CHANGELOG.md` chuẩn Keep a Changelog cho bản phát hành v0.1.0.
  - **Kỷ luật Guild**: Giữ nguyên STT 8 (`@tester`) và STT 9 (`@code-reviewer`) ở trạng thái chờ lệnh theo chỉ đạo của Bang chủ ("chưa thực hiện các công việc 8").

---

## 📋 Danh Sách Nhiệm Vụ Phân Bổ (Task Delegation Matrix)

| STT | Nhiệm vụ | Chuyên gia phụ trách | Trạng thái | Ghi chú & Tiêu chí đạt |
|:---:|:---|:---:|:---:|:---|
| 1 | Hoạch định kiến trúc, chốt ADR-0001 & Memory | `@tech-lead` | 🟢 Đã xong | Đã chốt kiến trúc React + Core POSIX VFS tách biệt |
| 2 | Khởi tạo dự án Vite + React + Tailwind CSS | `@devops` / `@tech-lead` | 🟢 Đã xong | Bundle 72KB gzip (< 200KB), Strict TS, Vitest pass, phân tầng thư mục |
| 3 | Xây dựng Core POSIX Engine & VFS | `@backend` | 🟢 Đã xong | Pure TS, traversal, Non-cumulative UGO, SUID/SGID/Sticky, 28 tests pass |
| 4 | Xây dựng Sudoers Lexer/Parser & Matcher | `@backend` | 🟢 Đã xong | Lexer/Parser, Aliases, NOPASSWD, Last-Match-Wins, Clash & GTFOBins, 17 tests pass |
| 5 | Thiết kế UI & Theme Terminal SysAdmin | `@designer` | 🟢 Đã xong | Tokens chuẩn 8pt, Dark Theme SysAdmin, phân cấp màu UGO & SUID/SGID/Sticky, WCAG AA, spec bàn giao |
| 6 | Dựng giao diện Matrix, Tracer, VFS Tree & Studio | `@frontend` | 🟢 Đã xong | 3-panel responsive layout, Interactive UGO Matrix, Live Traversal Tracer, Sudoers Studio, bundle 95KB |
| 7 | Thẩm định mã nguồn, rà soát GTFOBins & Rules | `@security` | 🟢 Đã xong | 27 GTFOBins, kiểm định Rule Clash & Negation Bypass, 10 security tests pass, báo cáo bảo mật đầy đủ |
| 8 | Viết bộ Unit Test kiểm tra chuẩn POSIX | `@tester` | ⚪ Chờ duyệt | Kiểm thử toàn bộ edge case của kernel permission (Chờ lệnh) |
| 9 | Soát mã nguồn & dọn sạch nợ kỹ thuật | `@code-reviewer` | ⚪ Chờ duyệt | Clean code, không leak state, không duplicate (Chờ lệnh) |
| 10| Viết tài liệu README & Cẩm nang SysAdmin | `@doc-writer` | 🟢 Đã xong | README đạt chuẩn 5 giây, Quickstart 3 bước, CHANGELOG v0.1.0, Cheatsheet |

*Quy ước trạng thái*: 🟢 Đã xong | ⏳ Đang làm | 🔴 Gặp lỗi/Blocker | ⚪ Chờ duyệt

---

## 🧠 Nhật Ký Quyết Định & Lưu Ý Bối Cảnh (Context Notes)
- **Tài liệu hóa hoàn thiện**:
  - `README.md` được tái cấu trúc toàn diện: Nêu bật nỗi đau, giải pháp, hướng dẫn khởi động 3 bước copy-paste chạy ngay, bảng giá trị bát phân, sơ đồ bố cục 3 cột và cấu trúc thư mục.
  - `CHANGELOG.md` được tạo mới theo chuẩn Keep a Changelog ghi nhận toàn bộ các tính năng đã bàn giao của v0.1.0.
  - Tuân thủ chỉ đạo của Bang chủ: Hoàn tất tài liệu và push code, chưa đụng chạm đến STT 8 (`@tester`).
