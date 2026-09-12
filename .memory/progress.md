# 📌 Bảng Tiến Độ & Bộ Nhớ Tác Chiến: linux-perm-sandbox
*Cập nhật lần cuối: 2026-09-12 14:06*

## 🎯 Mục Tiêu Phiên Hiện Tại (Current Milestone)
- **Giai đoạn**: Xây dựng Core Engines (Pure TypeScript) - Hoàn tất STT 3
- **Trọng tâm**: Hoàn thành In-Memory VFS và POSIX Kernel Evaluator (Path Traversal, Root Bypass, Non-cumulative UGO, SUID/SGID/Sticky bit, micro-step trace). Bộ 28 tests pass 100%. Báo cáo Bang chủ duyệt trước khi bắt đầu STT 4.

---

## 📋 Danh Sách Nhiệm Vụ Phân Bổ (Task Delegation Matrix)

| STT | Nhiệm vụ | Chuyên gia phụ trách | Trạng thái | Ghi chú & Tiêu chí đạt |
|:---:|:---|:---:|:---:|:---|
| 1 | Hoạch định kiến trúc, chốt ADR-0001 & Memory | `@tech-lead` | 🟢 Đã xong | Đã chốt kiến trúc React + Core POSIX VFS tách biệt |
| 2 | Khởi tạo dự án Vite + React + Tailwind CSS | `@devops` / `@tech-lead` | 🟢 Đã xong | Bundle 75KB gzip (< 200KB), Strict TS, Vitest pass, phân tầng thư mục |
| 3 | Xây dựng Core POSIX Engine & VFS | `@backend` | 🟢 Đã xong | Pure TS, traversal, Non-cumulative UGO, SUID/SGID/Sticky, 28/28 tests pass |
| 4 | Xây dựng Sudoers Lexer/Parser & Matcher | `@backend` | ⚪ Chờ duyệt | Parse User_Alias, Cmnd_Alias, NOPASSWD, last-match |
| 5 | Thiết kế UI & Theme Terminal SysAdmin | `@designer` | ⚪ Chờ duyệt | Giao diện tối màu, phân cấp màu bit UGO rõ nét |
| 6 | Dựng giao diện Matrix, Tracer, VFS Tree | `@frontend` | ⚪ Chờ duyệt | Phản hồi < 150ms, tương tác kéo thả mượt mà |
| 7 | Thẩm định mã nguồn, rà soát GTFOBins & Rules | `@security` | ⚪ Chờ duyệt | Cảnh báo leo thang đặc quyền trong Sudoers |
| 8 | Viết bộ Unit Test kiểm tra chuẩn POSIX | `@tester` | ⚪ Chờ duyệt | Kiểm thử toàn bộ edge case của kernel permission |
| 9 | Soát mã nguồn & dọn sạch nợ kỹ thuật | `@code-reviewer` | ⚪ Chờ duyệt | Clean code, không leak state, không duplicate |
| 10| Viết tài liệu README & Cẩm nang SysAdmin | `@doc-writer` | ⚪ Chờ duyệt | Hướng dẫn sử dụng và cheatsheet trực quan |

*Quy ước trạng thái*: 🟢 Đã xong | ⏳ Đang làm | 🔴 Gặp lỗi/Blocker | ⚪ Chờ duyệt

---

## 🧠 Nhật Ký Quyết Định & Lưu Ý Bối Cảnh (Context Notes)
- **Quyết định loại bỏ Monaco Editor**: Nhằm đảm bảo tiêu chí "tối ưu và gọn nhất có thể" của Bang chủ, loại bỏ Monaco (~4MB) và thay bằng Custom Lightweight Sudoers Studio + Highlighting (< 10KB).
- **Core Decoupling**: Mọi logic kernel và sudoers parser nằm trong `src/core/`, không phụ thuộc React, cho phép test coverage 100% cực nhanh bằng Vitest.
