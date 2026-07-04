import React, { useState, useMemo } from "react";
import { Overhead } from "../types";
import { formatRupiah } from "../utils/hppCalculator";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  DollarSign, 
  X, 
  Scale, 
  HelpCircle,
  AlertCircle 
} from "lucide-react";

interface OverheadTabProps {
  overheads: Overhead[];
  setOverheads: React.Dispatch<React.SetStateAction<Overhead[]>>;
  monthlyVolume: number;
}

export default function OverheadTab({ overheads, setOverheads, monthlyVolume }: OverheadTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOverhead, setEditingOverhead] = useState<Overhead | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [cost, setCost] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  // Sum total monthly overhead
  const totalMonthlyOverhead = useMemo(() => {
    return overheads.reduce((sum, o) => sum + o.cost, 0);
  }, [overheads]);

  // Overhead cost allocated per single unit
  const allocatedCostPerUnit = useMemo(() => {
    if (monthlyVolume > 0) {
      return totalMonthlyOverhead / monthlyVolume;
    }
    return 0;
  }, [totalMonthlyOverhead, monthlyVolume]);

  // Open create form
  const handleOpenCreate = () => {
    setEditingOverhead(null);
    setName("");
    setCost("");
    setDescription("");
    setFormError("");
    setIsFormOpen(true);
  };

  // Open edit form
  const handleOpenEdit = (o: Overhead) => {
    setEditingOverhead(o);
    setName(o.name);
    setCost(o.cost);
    setDescription(o.description || "");
    setFormError("");
    setIsFormOpen(true);
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Nama biaya overhead wajib diisi.");
      return;
    }
    if (cost === "" || cost <= 0) {
      setFormError("Nilai biaya per bulan wajib lebih dari 0.");
      return;
    }

    if (editingOverhead) {
      setOverheads((prev) =>
        prev.map((o) =>
          o.id === editingOverhead.id
            ? {
                ...o,
                name: name.trim(),
                cost: Number(cost),
                description: description.trim() || undefined,
              }
            : o
        )
      );
    } else {
      const newOverhead: Overhead = {
        id: "oh_" + Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        cost: Number(cost),
        description: description.trim() || undefined,
      };
      setOverheads((prev) => [newOverhead, ...prev]);
    }

    setIsFormOpen(false);
  };

  // Delete overhead
  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus biaya overhead ini?")) {
      setOverheads((prev) => prev.filter((o) => o.id !== id));
    }
  };

  return (
    <div className="space-y-6" id="overhead-tab">
      
      {/* Header section with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-slate-800">
            Database Biaya Overhead (BOP)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Catat pengeluaran tetap bulanan usaha Anda (seperti sewa gedung, listrik, penyusutan aset) yang akan dialokasikan secara otomatis ke produk.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-sans font-medium px-4.5 py-2.5 rounded-xl transition duration-150 shadow-md shadow-slate-900/10 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Biaya BOP
        </button>
      </div>

      {/* Cost Accounting Educational Cards / Allocation Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-sm md:col-span-2 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider block">
              Ringkasan Alokasi BOP Otomatis
            </span>
            <h3 className="text-lg font-sans font-bold text-slate-100">
              Metode Alokasi Biaya Tradisional (Volume-Based)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              Biaya overhead (BOP) dihitung per unit secara otomatis dengan membagi **Total BOP Bulanan** dengan **Kapasitas Produksi Bulanan** Anda. Sistem kami melakukan alokasi ini secara otomatis pada resep produk Anda.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-center md:text-left">
            <div>
              <span className="text-[10px] text-slate-400 font-sans font-bold block">TOTAL BOP</span>
              <span className="text-sm font-sans font-bold text-white font-mono">
                {formatRupiah(totalMonthlyOverhead)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-sans font-bold block">VOLUME TARGET</span>
              <span className="text-sm font-sans font-bold text-white font-mono">
                {monthlyVolume.toLocaleString('id-ID')} <span className="text-xs text-slate-400">unit</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-sans font-bold block">BEBAN PER UNIT</span>
              <span className="text-sm font-sans font-bold text-emerald-400 font-mono">
                {formatRupiah(allocatedCostPerUnit)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              <Scale className="w-3.5 h-3.5" />
              Formula Akuntansi
            </span>
            <p className="text-xs text-slate-500 leading-normal pt-1">
              Beban BOP per Unit dihitung dengan rumus:
            </p>
            <div className="bg-slate-50 rounded-xl p-3 font-mono text-[11px] text-slate-700 font-semibold border border-slate-100 text-center">
              BOP per Unit = Total BOP / Volume
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3">
            *Silakan sesuaikan target kapasitas volume produksi di bagian dashboard utama atau kotak input.
          </p>
        </div>

      </div>

      {/* Overhead List Table */}
      {overheads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 font-sans text-sm flex flex-col items-center justify-center gap-2">
          <DollarSign className="w-10 h-10 text-slate-200" />
          Database overhead kosong. Daftarkan biaya pengeluaran overhead bulanan Anda!
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-sans font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Nama Biaya Overhead</th>
                <th className="py-4 px-6">Beban per Bulan</th>
                <th className="py-4 px-6">Deskripsi</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overheads.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition font-sans text-sm text-slate-700">
                  <td className="py-4 px-6 font-semibold text-slate-800">{o.name}</td>
                  <td className="py-4 px-6 font-mono font-bold text-slate-800">{formatRupiah(o.cost)}</td>
                  <td className="py-4 px-6 text-slate-400 max-w-[280px] truncate">{o.description || "-"}</td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(o)}
                      className="inline-flex items-center p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(o.id)}
                      className="inline-flex items-center p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-over Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsFormOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between transform transition duration-300">
            
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-sans font-bold text-slate-800">
                {editingOverhead ? "Edit Biaya Overhead" : "Tambah Biaya Overhead"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              
              {formError && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 flex gap-3 text-xs text-rose-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <div>{formError}</div>
                </div>
              )}

              {/* Overhead Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold text-slate-700 block">
                  Nama Biaya Overhead <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm"
                  placeholder="Contoh: Sewa Gedung Pabrik, Internet Kantor, Listrik Abodemen"
                  required
                />
              </div>

              {/* Monthly Cost */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold text-slate-700 block">
                  Biaya per Bulan (Rupiah) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value === "" ? "" : Math.max(0, parseFloat(e.target.value)))}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm font-mono font-bold"
                    placeholder="Contoh: 1500000"
                    min="0"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Masukkan nilai pengeluaran bulanan. Beban ini nantinya dialokasikan per unit secara rata dan otomatis berdasarkan kapasitas volume produksi Anda.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold text-slate-700 block">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm resize-none h-20"
                  placeholder="Misal: Biaya sewa ruko produksi dibayarkan setiap tanggal 10"
                />
              </div>

            </form>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-sans font-medium transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-sans font-medium transition shadow-sm cursor-pointer"
              >
                {editingOverhead ? "Simpan Perubahan" : "Simpan Biaya"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
