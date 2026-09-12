# 📌 Bảng Tiến Độ & Bộ Nhớ Tác Chiến: linux-perm-sandbox
*Cập nhật lần cuối: 2026-09-12 11:57*

## 🎯 Mục Tiêu Phiên Hiện Tại (Current Milestone)
- **Giai đoạn**: Hoạch định Kiến Trúc & Thiết Kế Module Hệ Thống
- **Trọng tâm**: Thống nhất giải pháp React siêu tối ưu (zero-bloat), định nghĩa 4 tính năng độc đáo và thiết lập sơ đồ phân tầng `src/core` vs `src/ui`.

---

## 📋 Danh Sách Nhiệm Vụ Phân Bổ (Task Delegation Matrix)

| STT | Nhiệm vụ | Chuyên gia phụ trách | Trạng thái | Ghi chú & Tiêu chí đạt |
|:---:|:---|:---:|:---:|:---|
| 1 | Hoạch định kiến trúc, chốt ADR-0001 & Memory | `@tech-lead` | 🟢 Đã xong | Đã chốt kiến trúc React + Core POSIX VFS tách biệt |
| 2 | Khởi tạo dự án Vite + React + Tailwind CSS | `@devops` / `@tech-lead` | ⚪ Chờ duyệt | Bundle nhẹ < 200KB gzip, strict TS |
| 3 | Xây dựng Core POSIX Engine & VFS | `@backend` | ⚪ Chờ duyệt | Pure TS, traversal, UGO, SUID/SGID/Sticky |
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
