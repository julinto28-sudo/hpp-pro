import React, { useState, useMemo } from "react";
import { Labor } from "../types";
import { formatRupiah } from "../utils/hppCalculator";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Users, 
  X, 
  AlertCircle 
} from "lucide-react";

interface LaborTabProps {
  labors: Labor[];
  setLabors: React.Dispatch<React.SetStateAction<Labor[]>>;
}

export default function LaborTab({ labors, setLabors }: LaborTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLabor, setEditingLabor] = useState<Labor | null>(null);

  // Form states
  const [role, setRole] = useState("");
  const [rate, setRate] = useState<number | "">("");
  const [rateType, setRateType] = useState<"hour" | "day" | "unit">("hour");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  // Filtered labor list
  const filteredLabor = useMemo(() => {
    return labors.filter((l) =>
      l.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [labors, searchTerm]);

  // Open form for creating
  const handleOpenCreate = () => {
    setEditingLabor(null);
    setRole("");
    setRate("");
    setRateType("hour");
    setDescription("");
    setFormError("");
    setIsFormOpen(true);
  };

  // Open form for editing
  const handleOpenEdit = (l: Labor) => {
    setEditingLabor(l);
    setRole(l.role);
    setRate(l.rate);
    setRateType(l.rateType);
    setDescription(l.description || "");
    setFormError("");
    setIsFormOpen(true);
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) {
      setFormError("Nama peran atau pekerja wajib diisi.");
      return;
    }
    if (rate === "" || rate <= 0) {
      setFormError("Tarif upah wajib lebih dari 0.");
      return;
    }

    if (editingLabor) {
      setLabors((prev) =>
        prev.map((l) =>
          l.id === editingLabor.id
            ? {
                ...l,
                role: role.trim(),
                rate: Number(rate),
                rateType,
                description: description.trim() || undefined,
              }
            : l
        )
      );
    } else {
      const newLab: Labor = {
        id: "lab_" + Math.random().toString(36).substring(2, 9),
        role: role.trim(),
        rate: Number(rate),
        rateType,
        description: description.trim() || undefined,
      };
      setLabors((prev) => [newLab, ...prev]);
    }

    setIsFormOpen(false);
  };

  // Delete labor
  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus peran tenaga kerja ini?")) {
      setLabors((prev) => prev.filter((l) => l.id !== id));
    }
  };

  return (
    <div className="space-y-6" id="labor-tab">
      
      {/* Header section with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-slate-800">
            Database Tenaga Kerja
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Daftarkan tarif upah pekerja langsung untuk melacak kontribusi biaya waktu kerja terhadap produk Anda.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-sans font-medium px-4.5 py-2.5 rounded-xl transition duration-150 shadow-md shadow-slate-900/10 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Pekerja
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          id="labor-search-input"
          placeholder="Cari peran tenaga kerja..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/85 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm text-slate-700 shadow-sm transition"
        />
      </div>

      {/* Labor List */}
      {filteredLabor.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 font-sans text-sm flex flex-col items-center justify-center gap-2">
          <Users className="w-10 h-10 text-slate-200" />
          {searchTerm ? "Peran tenaga kerja tidak ditemukan." : "Database tenaga kerja kosong. Tambahkan peran tenaga kerja baru!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLabor.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-sans font-bold text-slate-800 text-base line-clamp-1">{l.role}</h3>
                  <div className="flex shrink-0">
                    <button
                      onClick={() => handleOpenEdit(l)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 h-8">
                  {l.description || "Tidak ada deskripsi peran."}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider block">Tarif Upah</span>
                  <span className="text-slate-800 font-sans font-bold text-base font-mono">
                    {formatRupiah(l.rate)}
                  </span>
                </div>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-sans font-bold px-2.5 py-1 rounded-lg uppercase">
                  per {l.rateType === "hour" ? "jam" : l.rateType === "day" ? "hari" : "unit"}
                </span>
              </div>
            </div>
          ))}
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
                {editingLabor ? "Edit Tenaga Kerja" : "Tambah Tenaga Kerja"}
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

              {/* Peran / Nama Pekerja */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold text-slate-700 block">
                  Nama Peran / Jabatan Pekerja <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm"
                  placeholder="Contoh: Chef Utama, Staf Packer, Supir Pengirim"
                  required
                />
              </div>

              {/* Rate Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold text-slate-700 block">
                  Basis Penghitungan Tarif Upah <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormTypeAndFixValue("hour")}
                    className={`px-3 py-2.5 rounded-xl border font-sans font-medium text-xs text-center transition cursor-pointer ${
                      rateType === "hour"
                        ? "bg-slate-950 border-slate-950 text-white shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    Per Jam
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTypeAndFixValue("day")}
                    className={`px-3 py-2.5 rounded-xl border font-sans font-medium text-xs text-center transition cursor-pointer ${
                      rateType === "day"
                        ? "bg-slate-950 border-slate-950 text-white shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    Per Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTypeAndFixValue("unit")}
                    className={`px-3 py-2.5 rounded-xl border font-sans font-medium text-xs text-center transition cursor-pointer ${
                      rateType === "unit"
                        ? "bg-slate-950 border-slate-950 text-white shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    Per Unit Produk
                  </button>
                </div>
              </div>

              {/* Wage rate */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold text-slate-700 block">
                  Tarif Upah (Rupiah) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value === "" ? "" : Math.max(0, parseFloat(e.target.value)))}
                    className="w-full pl-9 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm font-mono font-bold"
                    placeholder="Contoh: 25000"
                    min="0"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-sans font-bold text-slate-400 uppercase">
                    / {rateType === "hour" ? "jam" : rateType === "day" ? "hari" : "unit"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {rateType === "hour" && "Masukkan upah per jam kerja. Saat membuat resep, Anda cukup memasukkan berapa jam pekerjaan ini berlangsung."}
                  {rateType === "day" && "Masukkan upah per hari kerja (8 jam). Digunakan jika pekerja digaji harian."}
                  {rateType === "unit" && "Masukkan tarif borongan per unit produk yang berhasil diselesaikan oleh pekerja."}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold text-slate-700 block">
                  Deskripsi Peran (Opsional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm resize-none h-20"
                  placeholder="Misal: Bertanggung jawab mengolah bahan utama sampai masuk ke pemanggangan"
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
                {editingLabor ? "Simpan Perubahan" : "Simpan Pekerja"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  function setFormTypeAndFixValue(type: "hour" | "day" | "unit") {
    setRateType(type);
  }
}
