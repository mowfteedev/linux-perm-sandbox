# 📌 Bảng Tiến Độ & Bộ Nhớ Tác Chiến: linux-perm-sandbox
*Cập nhật lần cuối: 2026-09-13 12:40*

## 🎯 Mục Tiêu Phiên Hiện Tại (Current Milestone)
- **Giai đoạn**: Hoàn tất STT 6 (`@frontend`) và STT 7 (`@security`).
- **Trọng tâm**:
  - STT 6: Hoàn thành kiến trúc UI Dashboard 3 cột đa bảng điều khiển (VFSTree Inode Explorer, Interactive Permission Matrix 3x3 UGO + Special Bits, Kernel Tracer chi tiết từng chặng, Sudoers Studio với mô phỏng trực tiếp và Cheatsheet tra cứu). Phản hồi tính bằng micro-giây (< 1ms), bundle 95KB gzip.
  - STT 7: Rà soát bảo mật toàn diện OWASP Client-side, mở rộng 27 công cụ leo thang GTFOBins, kiểm định cơ chế Rule Clash & Accidental Bypass. Bộ 55/55 Unit & Security Tests đạt 100% Pass.

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
| 8 | Viết bộ Unit Test kiểm tra chuẩn POSIX | `@tester` | ⚪ Chờ duyệt | Kiểm thử toàn bộ edge case của kernel permission |
| 9 | Soát mã nguồn & dọn sạch nợ kỹ thuật | `@code-reviewer` | ⚪ Chờ duyệt | Clean code, không leak state, không duplicate |
| 10| Viết tài liệu README & Cẩm nang SysAdmin | `@doc-writer` | ⚪ Chờ duyệt | Hướng dẫn sử dụng và cheatsheet trực quan |

*Quy ước trạng thái*: 🟢 Đã xong | ⏳ Đang làm | 🔴 Gặp lỗi/Blocker | ⚪ Chờ duyệt

---

## 🧠 Nhật Ký Quyết Định & Lưu Ý Bối Cảnh (Context Notes)
- **STT 6 Delivery**:
  - Giao diện Dashboard 3 cột kết nối trực tiếp vào `InMemoryVFS` và `POSIX Evaluator` qua lightweight reactive store.
  - Hỗ trợ responsive chuyển tab mượt mà trên di động (Files / Matrix / Sudoers) mà không bị vỡ giao diện.
- **STT 7 Delivery**:
  - Mở rộng kho nhận diện GTFOBins lên 27 binaries (bổ sung: `git`, `nmap`, `sed`, `man`, `apt`, `curl`, `wget`, `pkexec`).
  - Thêm 10 test cases bảo mật chuyên sâu (`security-audit.test.ts`), nâng tổng số test của toàn dự án lên 55 tests pass 100%.
  - Bàn giao báo cáo an ninh hoàn chỉnh tại `.memory/security-audit-report.md`.
