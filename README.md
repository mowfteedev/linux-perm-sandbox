# 🛡️ Linux Permissions & Sudoers Sandbox (`linux-perm-sandbox`)

> **Interactive Linux chmod, special bits, and sudoers rules evaluator.**  
> 100% Client-side • Zero Latency • Zero-Bloat Architecture (< 150KB Gzip).

---

## 📖 Giới Thiệu (Overview)

**`linux-perm-sandbox`** là môi trường tương tác trực quan mô phỏng chuẩn xác cơ chế phân quyền tập tin POSIX (UGO + Special Bits SUID/SGID/Sticky bit) và thẩm định quy tắc đặc quyền hệ thống `/etc/sudoers` trong hệ điều hành Linux.

Dự án được thiết kế chạy **100% phía Client (Trình duyệt)**, loại bỏ hoàn toàn các rủi ro bảo mật (zero attack surface) và không đòi hỏi chi phí duy trì máy chủ backend.

---

## ✨ Tính Năng Nổi Bật & Độc Bản (Signature Features)

### 1. 🔍 Visual POSIX Kernel Tracer ("Why was access denied?")
- Trực quan hóa từng bước suy luận (micro-steps) của Linux Kernel theo thời gian thực:
  - **Path Traversal Check**: Kiểm tra cờ `x` trên mọi thư mục tổ tiên từ `/` đến file đích.
  - **Root Bypass (UID 0)**: Cơ chế bỏ qua quyền hạn của siêu người dùng.
  - **Non-cumulative Matching**: Kiểm tra Owner trước (nếu khớp dừng ngay, không xét Group/Others), rồi đến Group, rồi đến Others.
  - **Special Bits Evaluator**: Mô phỏng hành vi SUID (chạy bằng EUID của owner), SGID (kế thừa group thư mục), Sticky Bit (chỉ owner hoặc root mới được xóa file).

### 2. 🛡️ Live Sudoers Studio & Rule Clash Visualizer
- **Lightweight Tokenizer & Linter**: Soạn thảo và kiểm tra cú pháp `/etc/sudoers` thời gian thực mà không làm nặng ứng dụng (thay thế Monaco Editor 4MB bằng Custom Studio < 10KB).
- **Rule Clash / Last-Match-Wins**: Highlight trực quan rule nào trong sudoers thực sự có hiệu lực và rule nào bị ghi đè bởi rule phía dưới.
- **GTFOBins Security Warning**: Cảnh báo tức thì nếu cấp quyền sudo cho các binary nguy hiểm có khả năng leo thang đặc quyền (như `vim`, `find`, `bash`, `awk` kèm `NOPASSWD:`).

### 3. ⚡ 4-Way Real-time Synced Permission Matrix
- Đồng bộ tức thì 4 chiều không độ trễ:
  1. **Numeric (Octal)**: `0755`, `4755`, `1777`...
  2. **Symbolic String**: `-rwxr-xr-x`, `-rwsr-xr-x`, `drwxrwxrwt`...
  3. **Interactive Matrix**: Lưới checkbox 3x3 UGO + hàng Special Bits.
  4. **CLI Command Exporter**: Tự sinh câu lệnh chuẩn `chmod`, `chown` kèm 1-click copy.

### 4. 🎯 SysAdmin Quests (Chế độ Thử thách Thực chiến)
- Bộ bài tập mô phỏng các bài toán hóc búa thực tế của SysAdmin & DevOps:
  - Cấu hình thư mục dùng chung an toàn cho nhóm lập trình viên (`SGID` + `Sticky Bit`).
  - Phát hiện và vô hiệu hóa binary leo thang đặc quyền SUID root.
  - Thiết lập rule `/etc/sudoers` chặt chẽ, loại bỏ backdoor leo thang đặc quyền.

---

## 🏛️ Kiến Trúc Hệ Thống (Architecture)

Dự án áp dụng mô hình **Clean Decoupled Architecture**:
- `src/core/`: Toàn bộ logic POSIX Kernel và Sudoers AST Parser được viết bằng **Pure TypeScript** (0% phụ thuộc React hay DOM), cho phép Unit Test bao phủ 100%.
- `src/ui/`: Giao diện React tối ưu, phong cách Terminal Dark Mode chuyên nghiệp.

Chi tiết về quyết định kỹ thuật và kiến trúc:
- [Biên bản Quyết định Kiến trúc (ADR-0001)](.memory/adr/0001-khoi-tao-du-an.md)
- [Tài liệu Thiết kế Kiến trúc](.memory/architecture.md)
- [Bảng Tiến độ & Tác chiến Guild](.memory/progress.md)

---

## 🛠️ Tech Stack Đề Xuất
- **Core**: React 19 / 18 + Vite + TypeScript (Strict Mode).
- **Styling**: Tailwind CSS + Lucide Icons.
- **Testing**: Vitest.
- **Hosting Target**: GitHub Pages / Cloudflare Pages / Vercel (100% Static).

---

## 📜 Giấy Phép (License)
MIT License. Phát triển bởi `mowftee-guild`.
