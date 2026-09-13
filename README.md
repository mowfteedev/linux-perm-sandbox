# 🛡️ Linux Permissions & Sudoers Sandbox (`linux-perm-sandbox`)

> **Môi trường tương tác trực quan mô phỏng cơ chế phân quyền tập tin POSIX và thẩm định quy tắc `/etc/sudoers` chuẩn Linux.**  
> 100% Client-side • Không máy chủ • Zero Latency (< 1ms) • Siêu nhẹ (~95KB Gzip).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React: 19](https://img.shields.io/badge/React-19.0-61DAFB.svg)](package.json)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-5.7%20Strict-3178C6.svg)](tsconfig.json)
[![Tailwind: v4](https://img.shields.io/badge/Tailwind-v4.0-38BDF8.svg)](src/index.css)

---

## 📖 Giới Thiệu (Introduction)

**`linux-perm-sandbox`** là công cụ học tập và mô phỏng thực hành quản trị hệ thống Linux trực quan ngay trên trình duyệt web. Ứng dụng tái hiện chân thực các cơ chế phân quyền cốt lõi của Linux Kernel mà không cần cài máy ảo, không rủi ro làm hỏng hệ điều hành thật:

- **POSIX File Permissions**: Cơ chế phân quyền đối tượng **UGO** (User / Group / Others) kết hợp cờ đặc biệt **SUID**, **SGID** và **Sticky Bit**.
- **Kernel Traversal & Non-cumulative**: Mô phỏng chính xác quy tắc bất di bất dịch của kernel: *Kiểm tra Owner trước (nếu khớp dừng ngay, bỏ qua Group và Others)* và *Kiểm tra quyền tìm kiếm (bit `x`) trên toàn bộ các thư mục tổ tiên*.
- **Sudoers Rule Engine**: Phân tích cú pháp `/etc/sudoers(5)`, xử lý bí danh (Aliases), thứ tự ưu tiên **Last-Match-Wins**, phát hiện xung đột ghi đè quy tắc (**Rule Clash**) và cảnh báo 27 công cụ leo thang đặc quyền (**GTFOBins**).

---

## ⚡ Cài Đặt & Khởi Chạy (Quickstart)

### Điều kiện tiên quyết
- **Node.js**: Phiên bản `18.0` trở lên (Khuyến nghị Node 20 LTS hoặc mới hơn).
- **npm** (đi kèm Node.js).

### Các bước thực hiện
```bash
# 1. Tải mã nguồn về máy
git clone https://github.com/mowfteedev/linux-perm-sandbox.git
cd linux-perm-sandbox

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Khởi chạy ứng dụng ở chế độ phát triển
npm run dev
```

> Mở trình duyệt tại địa chỉ: `http://localhost:5173` để bắt đầu trải nghiệm.

Để đóng gói bản phát hành tối ưu cho production:
```bash
npm run build
npm run preview
```

---

## 🖥️ Hướng Dẫn Sử Dụng Cơ Bản (User Guide)

Giao diện ứng dụng được chia làm 3 không gian làm việc chính (hỗ trợ cả Desktop đa cột lẫn Mobile chuyển tab tiện lợi):

### 1. Thanh Điều Khiển Trên Cùng (Header Bar)
- **Chọn người dùng thử nghiệm (`User`)**: Chuyển đổi giữa `root (UID 0)`, `mowftee (UID 1000)`, `developer (UID 1001)`, `guest (UID 1002)`.
- **Chọn thao tác cần kiểm tra (`Op`)**:
  - `Read (r)`: Kiểm tra quyền đọc dữ liệu tệp tin.
  - `Write (w)`: Kiểm tra quyền chỉnh sửa hoặc ghi đè nội dung.
  - `Exec (x)`: Kiểm tra quyền chạy file thực thi hoặc duyệt thư mục.
  - `Delete (rm)`: Kiểm tra quyền xóa file (áp dụng quy tắc bảo vệ của Sticky Bit).
- **Nút Cheatsheet**: Mở bảng tra cứu nhanh công thức tính quyền bát phân.
- **Nút Reset**: Đưa hệ thống tệp tin và cấu hình về trạng thái ban đầu.

### 2. Trình Duyệt Tệp Tin Ảo (VFS Explorer - Cột Trái)
- Xem cấu trúc cây thư mục ảo chuẩn Linux: `/`, `/etc/passwd`, `/etc/shadow`, `/etc/sudoers`, `/tmp`, `/usr/bin/passwd`, `/home/...`.
- Nhấp vào bất kỳ tệp tin hoặc thư mục nào để kiểm tra quyền hạn chi tiết.
- Ô tìm kiếm hỗ trợ lọc nhanh đường dẫn.

### 3. Bảng Phân Quyền & Giải Trình Kernel (Cột Giữa)
- **Permission Matrix**:
  - Nhấp trực tiếp vào các ô `r`, `w`, `x` của User, Group, Others để thay đổi quyền.
  - Bật/tắt các cờ đặc biệt: `SUID (4000)`, `SGID (2000)`, `Sticky Bit (1000)`.
  - Nhập trực tiếp mã bát phân vào ô `Octal` (ví dụ: `0755`, `0644`, `4755`).
  - Đổi chủ sở hữu (`chown`) qua menu thả xuống.
  - Tự động sinh lệnh `$ chmod` và `$ chown` kèm nút bấm sao chép một chạm.
- **Kernel Permission Tracer**:
  - Tự động hiển thị kết luận **ACCESS GRANTED** hoặc **ACCESS DENIED**.
  - Giải thích chi tiết từng bước: Thư mục cha nào cho phép duyệt, rule nào được kernel áp dụng, và gợi ý câu lệnh khắc phục nếu bị từ chối.

### 4. Xưởng Thẩm Định Sudoers & GTFOBins (Cột Phải)
- **Tab Sudoers Text**: Soạn thảo và chỉnh sửa trực tiếp nội dung `/etc/sudoers`.
- **Tab Security Alerts**:
  - Cảnh báo xung đột quy tắc (Rule Clash): Khi một dòng lệnh bên dưới vô tình xóa bỏ lệnh cấm của dòng bên trên theo cơ chế Last-Match-Wins.
  - Cảnh báo GTFOBins: Phát hiện các binary nguy hiểm như `vim`, `find`, `python3`, `nano`, `bash`, `nmap`... cho phép người dùng chiếm quyền root shell.
- **Tab Live Simulator**: Gõ thử bất kỳ lệnh nào (ví dụ: `vim /etc/shadow` hoặc `apt update`) để xem người dùng hiện tại có được phép thực thi với `sudo` không và có cần mật khẩu hay không.

---

## 📚 Bảng Tra Cứu Phân Quyền Linux Cơ Bản (Cheatsheet)

### Bảng Giá Trị Bát Phân & Ký Hiệu
| Quyền | Ký hiệu | Nhị phân | Giá trị bát phân | Ý nghĩa đối với File | Ý nghĩa đối với Thư mục |
|:---:|:---:|:---:|:---:|:---|:---|
| **Read** | `r` | `100₂` | **4** | Đọc nội dung tệp tin | Xem danh sách file bên trong (`ls`) |
| **Write** | `w` | `010₂` | **2** | Sửa đổi nội dung tệp tin | Tạo, xóa, đổi tên file trong thư mục |
| **Execute** | `x` | `001₂` | **1** | Chạy chương trình / script | Duyệt vào thư mục (`cd`, tìm kiếm path) |
| **None** | `-` | `000₂` | **0** | Không có quyền | Không có quyền |

### Các Mức Phân Quyền Thông Dụng
- `chmod 755`: Owner toàn quyền (`rwx`), Group và Others được đọc và duyệt (`r-x`). Thường dùng cho thư mục công khai và file thực thi.
- `chmod 644`: Owner đọc/ghi (`rw-`), Group và Others chỉ đọc (`r--`). Chuẩn cho hầu hết tệp tin văn bản và tài liệu.
- `chmod 600`: Chỉ duy nhất Owner được đọc/ghi (`rw-`). Dùng cho khóa bí mật SSH, file cấu hình nhạy cảm.
- `chmod 700`: Chỉ duy nhất Owner được toàn quyền (`rwx`). Dùng cho thư mục cá nhân `/home/username`.
- `chmod 1777`: Bật Sticky bit cho thư mục chia sẻ công cộng (`/tmp`), ngăn người dùng xóa nhầm file của nhau.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend Core**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/) (Strict Mode).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/).
- **Kiến trúc**: Clean Decoupled — Tầng lõi Linux Engine (`src/core/`) thuần TypeScript độc lập hoàn toàn với tầng giao diện.

---

## 📄 Bản Quyền & Giấy Phép (License)

Dự án được phân phối mã nguồn mở theo giấy phép [MIT License](LICENSE).  
Phát triển bởi **`mowftee-guild`**.
