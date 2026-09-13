# 📌 Bảng Tiến Độ & Bộ Nhớ Tác Chiến: linux-perm-sandbox
*Cập nhật lần cuối: 2026-09-13 12:35*

## 🎯 Mục Tiêu Phiên Hiện Tại (Current Milestone)
- **Giai đoạn**: Hoàn tất STT 5 (Thiết kế UI & Theme Terminal SysAdmin - `@designer`).
- **Trọng tâm**: Xây dựng bộ Design Tokens (`src/ui/tokens/index.ts`), bảng màu SysAdmin Dark Terminal, phân cấp thị giác UGO & Special Bits (SUID/SGID/Sticky), chuẩn 8pt Grid, kiểm định độ tương phản WCAG 2.1 AA (17.6:1), và bộ tài liệu bàn giao `.memory/design-system.md`.
- **Kỷ luật Guild**: Tuyệt đối KHÔNG tự ý làm STT 6 (để `@frontend` triển khai khi có lệnh).

---

## 📋 Danh Sách Nhiệm Vụ Phân Bổ (Task Delegation Matrix)

| STT | Nhiệm vụ | Chuyên gia phụ trách | Trạng thái | Ghi chú & Tiêu chí đạt |
|:---:|:---|:---:|:---:|:---|
| 1 | Hoạch định kiến trúc, chốt ADR-0001 & Memory | `@tech-lead` | 🟢 Đã xong | Đã chốt kiến trúc React + Core POSIX VFS tách biệt |
| 2 | Khởi tạo dự án Vite + React + Tailwind CSS | `@devops` / `@tech-lead` | 🟢 Đã xong | Bundle 72KB gzip (< 200KB), Strict TS, Vitest pass, phân tầng thư mục |
| 3 | Xây dựng Core POSIX Engine & VFS | `@backend` | 🟢 Đã xong | Pure TS, traversal, Non-cumulative UGO, SUID/SGID/Sticky, 28 tests pass |
| 4 | Xây dựng Sudoers Lexer/Parser & Matcher | `@backend` | 🟢 Đã xong | Lexer/Parser, Aliases, NOPASSWD, Last-Match-Wins, Clash & GTFOBins, 17 tests pass |
| 5 | Thiết kế UI & Theme Terminal SysAdmin | `@designer` | 🟢 Đã xong | Tokens chuẩn 8pt, Dark Theme SysAdmin, phân cấp màu UGO & SUID/SGID/Sticky, WCAG AA, spec bàn giao |
| 6 | Dựng giao diện Matrix, Tracer, VFS Tree | `@frontend` | ⚪ Chờ duyệt | Phản hồi < 150ms, tương tác kéo thả mượt mà (Chờ Bang chủ chỉ đạo) |
| 7 | Thẩm định mã nguồn, rà soát GTFOBins & Rules | `@security` | ⚪ Chờ duyệt | Cảnh báo leo thang đặc quyền trong Sudoers |
| 8 | Viết bộ Unit Test kiểm tra chuẩn POSIX | `@tester` | ⚪ Chờ duyệt | Kiểm thử toàn bộ edge case của kernel permission |
| 9 | Soát mã nguồn & dọn sạch nợ kỹ thuật | `@code-reviewer` | ⚪ Chờ duyệt | Clean code, không leak state, không duplicate |
| 10| Viết tài liệu README & Cẩm nang SysAdmin | `@doc-writer` | ⚪ Chờ duyệt | Hướng dẫn sử dụng và cheatsheet trực quan |

*Quy ước trạng thái*: 🟢 Đã xong | ⏳ Đang làm | 🔴 Gặp lỗi/Blocker | ⚪ Chờ duyệt

---

## 🧠 Nhật Ký Quyết Định & Lưu Ý Bối Cảnh (Context Notes)
- **Quyết định loại bỏ Monaco Editor**: Nhằm đảm bảo tiêu chí "tối ưu và gọn nhất có thể" của Bang chủ, loại bỏ Monaco (~4MB) và thay bằng Custom Lightweight Sudoers Studio + Highlighting (< 10KB).
- **Core Decoupling**: Mọi logic kernel và sudoers parser nằm trong `src/core/`, không phụ thuộc React, cho phép test coverage 100% cực nhanh bằng Vitest (45/45 tests pass trong < 400ms).
- **Design Tokens & Theme System**:
  - Toàn bộ tokens màu UGO, Special bits, Terminal surfaces, và Micro-interactions được tập trung tại `src/ui/tokens/index.ts`.
  - Đặc tả bàn giao kỹ thuật chi tiết tại `.memory/design-system.md` cho `@frontend` sử dụng ngay trong STT 6.
  - Tuân thủ quy tắc nghiêm ngặt: `@designer` hoàn tất STT 5, giữ nguyên STT 6 chờ lệnh của Bang chủ.
