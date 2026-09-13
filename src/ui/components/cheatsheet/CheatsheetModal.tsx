import { useEffect } from 'react';
import { X, BookOpen, Key, Flame, Shield, Terminal } from 'lucide-react';
import { useSandbox } from '@/store';

export function CheatsheetModal() {
  const { cheatsheetOpen, setCheatsheetOpen } = useSandbox();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCheatsheetOpen(false);
    };
    if (cheatsheetOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cheatsheetOpen, setCheatsheetOpen]);

  if (!cheatsheetOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="max-w-3xl w-full max-h-[90vh] bg-[#0c1222] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200 font-sans"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <h3 className="font-mono font-bold text-sm text-slate-100">
              Linux Permissions & Sudoers Cheatsheet
            </h3>
          </div>
          <button
            onClick={() => setCheatsheetOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed font-mono">
          {/* Section 1: Octal & Symbolic Values */}
          <div className="space-y-3">
            <h4 className="text-sky-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4" />
              1. Bảng Giá Trị Bát Phân & Ký Hiệu
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-emerald-400 font-bold text-sm">4 (100₂)</div>
                <div className="text-slate-400 mt-0.5">r-- (Read)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-amber-400 font-bold text-sm">2 (010₂)</div>
                <div className="text-slate-400 mt-0.5">-w- (Write)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-blue-400 font-bold text-sm">1 (001₂)</div>
                <div className="text-slate-400 mt-0.5">--x (Execute)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-purple-400 font-bold text-sm">7 (111₂)</div>
                <div className="text-slate-400 mt-0.5">rwx (Full)</div>
              </div>
            </div>
          </div>

          {/* Section 2: Non-cumulative rule */}
          <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/30 space-y-2">
            <h4 className="text-sky-300 font-bold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              2. Quy Tắc Bất Di Bất Dịch POSIX (Non-cumulative Rule)
            </h4>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">
              Trong Linux, quyền hạn <strong>KHÔNG CỘNG DỒN</strong>. Kernel kiểm tra theo thứ tự ưu tiên:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-2 font-sans">
              <li>Nếu người dùng là chủ sở hữu (Owner) ➔ Kernel <strong>CHỈ</strong> xét quyền Owner. Dù Group hay Others có quyền ghi thì Owner vẫn bị chặn nếu bit Owner thiếu!</li>
              <li>Nếu không phải Owner nhưng thuộc Group ➔ Kernel <strong>CHỈ</strong> xét quyền Group. Quyền Others bị bỏ qua.</li>
              <li>Nếu không khớp Owner và không thuộc Group ➔ Kernel xét quyền Others.</li>
            </ol>
          </div>

          {/* Section 3: Special Bits */}
          <div className="space-y-3">
            <h4 className="text-rose-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4" />
              3. Bit Đặc Biệt (Special Bits)
            </h4>
            <div className="space-y-2 font-sans text-xs">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong className="text-rose-400 font-mono">SUID (4000 / 's'):</strong> File thực thi với đặc quyền của UID sở hữu file thay vì người gọi lệnh (ví dụ: <code>/usr/bin/passwd</code>).
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong className="text-orange-400 font-mono">SGID (2000 / 's'):</strong> File chạy với đặc quyền GID nhóm; trên thư mục, các file/folder con tạo ra sẽ tự động kế thừa GID của thư mục cha.
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong className="text-fuchsia-400 font-mono">Sticky Bit (1000 / 't'):</strong> Áp dụng cho thư mục chia sẻ như <code>/tmp (1777)</code>. Chỉ có Root, chủ sở hữu file, hoặc chủ sở hữu thư mục mới có quyền xóa file bên trong.
              </div>
            </div>
          </div>

          {/* Section 4: Sudoers Syntax */}
          <div className="space-y-3">
            <h4 className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              4. Cú Pháp /etc/sudoers Chuẩn
            </h4>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-[11px] space-y-1">
              <div className="text-slate-500"># Cấu trúc: [User/Group] [Hosts]=([RunAsUsers]:[RunAsGroups]) [Tags:] [Commands]</div>
              <div className="text-emerald-300">root ALL=(ALL:ALL) ALL</div>
              <div className="text-sky-300">%sudo ALL=(ALL:ALL) ALL</div>
              <div className="text-amber-300">deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx</div>
              <div className="text-rose-300">alice ALL=(ALL) ALL, !/bin/su, !/bin/bash</div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end">
          <button
            onClick={() => setCheatsheetOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
