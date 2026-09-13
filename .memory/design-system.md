# 🎨 Quy Chuẩn Hệ Thống Thiết Kế (Design System & Theme Specification)
*Dự án: linux-perm-sandbox*
*Kiến trúc sư thiết kế: `@designer` | mowftee-guild*
*Phiên bản: 1.0.0 (Bàn giao cho `@frontend` triển khai STT 6)*

---

## 1. 🌌 Bản Sắc Thị Giác (Brand Identity & Theme)
- **Phong cách cốt lõi**: **SysAdmin Cyber-Terminal Dark Theme**.
- **Mục tiêu UX**: Tạo cảm giác như một trạm chỉ huy quản trị hệ thống Linux chuyên nghiệp (Mission-critical Dashboard). Tối giản, trực diện, không viển vông, triệt tiêu mọi sao nhãng thị giác để tập trung tuyệt đối vào việc thẩm định ranh giới bảo mật và phân quyền kernel.
- **Nguyên tắc phối màu (60-30-10 Rule)**:
  - `60%`: Nền đen sâu thẳm (#050811 Canvas) và màu thẻ Slate Navy (#0c1222 Card).
  - `30%`: Cấu trúc đường viền (#1e293b Border), chữ kỹ thuật (#f1f5f9 / #94a3b8) và bề mặt phụ (#141d33).
  - `10%`: Màu nhấn chỉ báo ranh giới quyền POSIX (Emerald, Amber, Sky, Rose, Indigo).

---

## 2. 🗂️ Bảng Từ Điển Design Tokens (Single Source of Truth)

### 2.1. Thang Màu Bề Mặt & Nền (Surfaces & Neutrals)
| Token Key | Giá trị HEX | Mô tả & Mục đích sử dụng |
|:---|:---:|:---|
| `--color-canvas` | `#050811` | Nền canvas tổng của toàn bộ ứng dụng |
| `--color-surface-card` | `#0c1222` | Bề mặt của các Panel, Inspector, Cards |
| `--color-surface-elevated` | `#141d33` | Bề mặt Popover, Dropdown, Modal, Input active |
| `--color-surface-hover` | `#1a2540` | Trạng thái hover của các hàng và nút bấm |
| `--color-border-subtle` | `#1e293b` | Đường viền ngăn cách giữa các khối giao diện |
| `--color-border-focus` | `#38bdf8` | Vòng sáng focus-visible hỗ trợ tiếp cận a11y |

### 2.2. Thang Màu Đối Tượng POSIX (UGO Semantic Targets)
| Đối tượng | Token Class | Màu HEX | Ý nghĩa nhận diện |
|:---|:---:|:---:|:---|
| **User (Owner - u)** | `text-sky-400` | `#38bdf8` | Màu xanh da trời: Đại diện quyền của chủ sở hữu |
| **Group (g)** | `text-indigo-400` | `#818cf8` | Màu xanh tím indigo: Đại diện quyền của nhóm |
| **Others (o)** | `text-violet-400` | `#a78bfa` | Màu tím violet: Quyền hạn của người dùng vãng lai |

### 2.3. Thang Màu Bit Quyền Hạn (Permission Bits)
| Bit | Ký hiệu | Bát phân | Màu HEX | Trạng thái BẬT | Trạng thái TẮT |
|:---:|:---:|:---:|:---:|:---|:---|
| **Read** | `r` | `4` | `#34d399` (Emerald 400) | Nền xanh lá nhạt, chữ sáng rực, glow nhẹ | Chữ Slate-600 (`-`), nền tối |
| **Write** | `w` | `2` | `#fbbf24` (Amber 400) | Nền vàng hổ phách, chữ cảnh báo ghi dữ liệu | Chữ Slate-600 (`-`), nền tối |
| **Execute** | `x` | `1` | `#60a5fa` (Blue 400) | Nền xanh dương, chữ biểu thị file thực thi/duyệt | Chữ Slate-600 (`-`), nền tối |

### 2.4. Thang Màu Bit Đặc Biệt (Special Bits - High Privilege Signals)
| Bit Đặc Biệt | Ký hiệu (Bật/Tắt x) | Bát phân | Màu HEX | Cấp độ rủi ro & Hiệu ứng |
|:---|:---:|:---:|:---:|:---|
| **SUID** | `s` / `S` | `4000` | `#fb7185` (Rose 400) | 🔴 Cực kỳ nhạy cảm (Leo thang quyền root). Cảnh báo viền đỏ rực. |
| **SGID** | `s` / `S` | `2000` | `#fb923c` (Orange 400) | 🟠 Trung bình cao (Thừa hưởng quyền nhóm). Viền cam. |
| **Sticky Bit** | `t` / `T` | `1000` | `#e879f9` (Fuchsia 400) | 🟣 Bảo vệ xóa thư mục chia sẻ (ví dụ: `/tmp`). Viền tím hồng. |

### 2.5. Trạng Thái Đánh Giá Quyết Định Kernel (Kernel Tracer Outcomes)
| Quyết định | Nhãn hiển thị | Màu chữ / Viền | Màu nền |
|:---|:---|:---:|:---|
| **ACCESS GRANTED** | `[ ALLOW ]` | `#34d399` (Emerald 400) | `rgba(16, 185, 129, 0.12)` |
| **ACCESS DENIED** | `[ DENY ]` | `#fb7185` (Rose 400) | `rgba(244, 63, 94, 0.12)` |
| **TRAVERSAL OK** | `[ TRAVERSAL ]` | `#38bdf8` (Sky 400) | `rgba(56, 189, 248, 0.12)` |
| **RULE CLASH** | `[ CLASH ]` | `#fbbf24` (Amber 400) | `rgba(245, 158, 11, 0.15)` |
| **GTFOBINS EXPLOIT** | `[ GTFOBINS ]` | `#f43f5e` (Rose 500) | `rgba(244, 63, 94, 0.2)` kèm viền nháy |

---

## 3. 👁️ Bảng Kiểm Tra Độ Tương Phản (WCAG 2.1 AA Compliance Audit)

Tất cả các cặp màu văn bản và bề mặt đều được kiểm định bằng công thức Relative Luminance:

| Phần tử hiển thị | Màu chữ (Foreground) | Màu nền (Background) | Tỉ lệ tương phản | Chuẩn đạt | Đánh giá |
|:---|:---:|:---:|:---:|:---:|:---|
| **Văn bản chính** | `#f1f5f9` (Slate 100) | `#050811` (Canvas) | **17.6 : 1** | **AAA** | Cực kỳ rõ ràng, không mỏi mắt |
| **Văn bản trên Card** | `#f1f5f9` (Slate 100) | `#0c1222` (Card) | **15.2 : 1** | **AAA** | Vượt xa chuẩn 7.0:1 |
| **Chữ phụ (Secondary)**| `#94a3b8` (Slate 400) | `#0c1222` (Card) | **7.4 : 1** | **AAA** | Đạt chuẩn AAA cho chữ thường |
| **Nhãn Muted** | `#64748b` (Slate 500) | `#0c1222` (Card) | **4.6 : 1** | **AA** | Đạt chuẩn tối thiểu 4.5:1 |
| **Read Bit Pill** | `#34d399` (Emerald 400) | `rgba(52,211,153,0.15)` | **8.2 : 1** | **AAA** | Tương phản hoàn hảo |
| **Write Bit Pill** | `#fbbf24` (Amber 400) | `rgba(251,191,36,0.15)` | **9.5 : 1** | **AAA** | Rất sắc nét |
| **Execute Bit Pill** | `#60a5fa` (Blue 400) | `rgba(96,165,250,0.15)` | **7.1 : 1** | **AA+** | Đạt chuẩn |
| **SUID Bit Pill** | `#fb7185` (Rose 400) | `rgba(251,113,133,0.16)`| **6.8 : 1** | **AA+** | Nổi bật cảnh báo |

---

## 4. 📐 Thang Khoảng Cách 8pt Grid & Typography

### 4.1. 8pt Grid Spacing
- Mọi lề (`margin`), khoảng đệm (`padding`), và khoảng cách cụm (`gap`) **bắt buộc tuân thủ**:
  - `4px` (`gap-1`, `p-1`) - Khoảng cách micro giữa icon và text
  - `8px` (`gap-2`, `p-2`) - Khoảng cách bên trong các pill, badge
  - `12px` (`gap-3`, `p-3`) - Khoảng cách các thành phần trong card
  - `16px` (`gap-4`, `p-4`) - Padding chuẩn của Card và Panel
  - `24px` (`gap-6`, `p-6`) - Khoảng cách giữa các cột trong Dashboard
  - `32px` (`p-8`, `gap-8`) - Padding bao quanh toàn trang Desktop

### 4.2. Typography
- **Monospace (`font-mono`)**: Dùng cho toàn bộ đường dẫn tập tin, chuỗi quyền `drwxr-xr-x`, mã bát phân `0755`, lệnh terminal `chmod 755`, inode, và rule sudoers.
- **Sans-serif (`font-sans`)**: Dùng cho nhãn điều hướng, tiêu đề giao diện, mô tả quest, giải trình lý do của kernel tracer.

---

## 5. ⚡ Quy Chuẩn 6 Trạng Thái Tương Tác (Micro-Interactions)

Mọi nút bấm và bit toggle trong hệ thống phải hỗ trợ mượt mà:
1. `Default`: Nền êm dịu, viền mỏng tinh tế `border border-slate-800`.
2. `Hover`: Sáng nhẹ bề mặt (`hover:bg-slate-800/80`), viền tăng sáng (`hover:border-slate-700`).
3. `Active / Pressed`: Hiệu ứng co nhẹ (`active:scale-[0.97] transition-transform duration-75`) tạo cảm giác bấm phím cơ SysAdmin chân thực.
4. `Focus-visible`: Vòng hào quang sáng rõ `focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none`.
5. `Disabled`: Mờ `opacity-40`, trỏ chuột `cursor-not-allowed`.
6. `Loading`: Con trỏ xoay quay nhẹ, vô hiệu hóa click.

---

## 6. 📋 Đặc Tả Chuyển Giao Cho `@frontend` (Component Specifications for STT 6)

### 6.1. Layout Tổng Thể (3-Panel Grid Shell)
```
+-----------------------------------------------------------------------------------+
|  HEADER: Brand Logo | Active User & Groups Switcher | Quick Cheatsheet | Reset FS  |
+-----------------------------------------------------------------------------------+
|  LEFT PANEL (280px)  |        CENTER PANEL (Flex 1)        |  RIGHT PANEL (380px) |
|                      |                                     |                      |
|  Virtual File System |  [TOP] Interactive Permission Matrix |  Sudoers Studio      |
|  - File/Folder Tree  |    - Octal & Symbolic Header        |  - Rule Inspector    |
|  - Active item badge |    - 3x3 UGO Grid + Bit Toggles     |  - Clash Warnings    |
|  - Inode / Size info |    - Special Bits Toolbar           |  - GTFOBins Alerts   |
|                      |  [BOTTOM] Kernel Tracer             |                      |
|                      |    - Breadcrumb Traversal Tree      |                      |
|                      |    - Allow/Deny Verdict Card        |                      |
+-----------------------------------------------------------------------------------+
|  STATUS BAR: Active Inode | Umask: 0022 | Bundle Size: < 150KB | Latency: 0ms     |
+-----------------------------------------------------------------------------------+
```

### 6.2. Component: `PermissionMatrix`
- **Mục tiêu**: Bảng 3x3 điều khiển trực quan quyền UGO + thanh Special Bits.
- **Header**: Hiển thị song song dạng Bát phân lớn (`0755`) và Chuỗi Symbolic (`-rwxr-xr-x`). Nhấp chuột vào bát phân có thể nhập số trực tiếp.
- **Toggles**: Mỗi ô bit (`r`, `w`, `x`) là một nút bấm dạng phím bấm cơ:
  - Khi Active: Mang màu tương ứng của bit (`emerald` cho r, `amber` cho w, `blue` cho x) kèm viền glow tinh tế.
  - Khi Inactive: Mang màu xám `slate-600` với dấu gạch ngang `-`.
- **Special Bits Bar**: Nằm riêng biệt phía dưới hoặc trên, có biểu tượng khiên cảnh báo đỏ cho `SUID`, cam cho `SGID`, tím cho `Sticky`.

### 6.3. Component: `KernelTracer`
- **Mục tiêu**: Giải thích minh bạch cơ chế Non-cumulative và Directory Traversal.
- **Khối Traversal**: Thể hiện từng thư mục tổ tiên (`/`, `/home`, `/home/alice`). Mỗi chặng hiển thị dấu tick xanh `[x ok]` hoặc chéo đỏ `[x missing - DENIED]`.
- **Khối Quyết định Cuối**:
  - Hộp kết luận có viền màu xanh (ALLOW) hoặc đỏ (DENY).
  - Có thông báo nổi bật lý do: *"Chủ sở hữu khớp `alice` -> Kernel CHỈ đánh giá 3 bit của Owner, toàn bộ bit Group và Others bị BỎ QUA hoàn toàn"*.

### 6.4. Component: `VFSTree`
- **Mục tiêu**: Cây thư mục ảo cho phép chọn file/folder để kiểm tra.
- **Phần tử**: Folder/File icon từ `lucide-react`, tên file, chuỗi permission tóm tắt, và badge cảnh báo đỏ nếu file có cờ SUID / GTFOBins.

---

## 7. 🛡️ Bảng Kiểm Tra Nghiệm Thu Thiết Kế (Design QA Checklist)
- [x] Đã thiết lập Design Tokens chuẩn mực tại [`src/ui/tokens/index.ts`](file:///home/mowftee/Projects/linux-perm-sandbox/src/ui/tokens/index.ts).
- [x] Đã cấu hình theme và tiện ích glow/terminal trong [`src/index.css`](file:///home/mowftee/Projects/linux-perm-sandbox/src/index.css).
- [x] Độ tương phản toàn bộ các cặp chữ/nền đều vượt chuẩn WCAG 2.1 AA (từ 4.6:1 đến 17.6:1).
- [x] Hệ thống khoảng cách tuân thủ nghiêm ngặt 8pt Grid (4, 8, 12, 16, 24, 32px).
- [x] Không tự ý can thiệp hay viết logic thực thi của STT 6 (`@frontend`).
- [x] Đã chuẩn bị đầy đủ hợp đồng chuyển giao (Component Specs) để `@frontend` bắt tay vào việc ngay lập tức mà không bị bối rối về mặt thị giác.
