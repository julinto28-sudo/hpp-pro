import React, { useState, useMemo } from "react";
import { Material } from "../types";
import { formatRupiah } from "../utils/hppCalculator";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Layers, 
  HelpCircle, 
  X, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface MaterialsTabProps {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
}

export default function MaterialsTab({ materials, setMaterials }: MaterialsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState<number | "">("");
  const [packageSize, setPackageSize] = useState<number | "">("");
  const [unit, setUnit] = useState("gram");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  // Filtered materials list
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [materials, searchTerm]);

  // Handle open form for creating new material
  const handleOpenCreate = () => {
    setEditingMaterial(null);
    setName("");
    setPurchasePrice("");
    setPackageSize("");
    setUnit("gram");
    setNotes("");
    setFormError("");
    setIsFormOpen(true);
  };

  // Handle open form for editing existing material
  const handleOpenEdit = (m: Material) => {
    setEditingMaterial(m);
    setName(m.name);
    setPurchasePrice(m.purchasePrice);
    setPackageSize(m.packageSize);
    setUnit(m.unit);
    setNotes(m.notes || "");
    setFormError("");
    setIsFormOpen(true);
  };

  // Handle submit form (Save / Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Nama bahan baku wajib diisi.");
      return;
    }
    if (purchasePrice === "" || purchasePrice <= 0) {
      setFormError("Harga beli wajib lebih dari 0.");
      return;
    }
    if (packageSize === "" || packageSize <= 0) {
      setFormError("Ukuran kemasan wajib lebih dari 0.");
      return;
    }

    const costPerUnit = Number(purchasePrice) / Number(packageSize);

    if (editingMaterial) {
      // Update existing
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === editingMaterial.id
            ? {
                ...m,
                name: name.trim(),
                purchasePrice: Number(purchasePrice),
                packageSize: Number(packageSize),
                unit,
                costPerUnit,
                notes: notes.trim() || undefined,
              }
            : m
        )
      );
    } else {
      // Create new
      const newMat: Material = {
        id: "mat_" + Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        purchasePrice: Number(purchasePrice),
        packageSize: Number(packageSize),
        unit,
        costPerUnit,
        notes: notes.trim() || undefined,
      };
      setMaterials((prev) => [newMat, ...prev]);
    }

    setIsFormOpen(false);
  };

  // Handle delete material
  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus bahan baku ini?")) {
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // Live auto calculation values for the form helper
  const liveCostPerUnit = useMemo(() => {
    if (purchasePrice && packageSize && Number(packageSize) > 0) {
      return Number(purchasePrice) / Number(packageSize);
    }
    return 0;
  }, [purchasePrice, packageSize]);

  return (
    <div className="space-y-6" id="materials-tab">
      
      {/* Header section with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-slate-800">
            Database Bahan Baku
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Daftarkan bahan baku mentah beserta harga pembelian dan ukuran kemasannya untuk perhitungan resep otomatis.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-sans font-medium px-4.5 py-2.5 rounded-xl transition duration-150 shadow-md shadow-slate-900/10 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Bahan Baku Baru
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          id="material-search-input"
          placeholder="Cari bahan baku..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/85 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm text-slate-700 shadow-sm transition"
        />
      </div>

      {/* Materials List Table / Cards */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 font-sans text-sm flex flex-col items-center justify-center gap-2">
          <Layers className="w-10 h-10 text-slate-200" />
          {searchTerm ? "Bahan baku tidak ditemukan." : "Database bahan baku kosong. Mulai dengan menambahkan bahan baku baru!"}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-sans font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Nama Bahan</th>
                  <th className="py-4 px-6">Harga Beli Kemasan</th>
                  <th className="py-4 px-6">Ukuran Kemasan</th>
                  <th className="py-4 px-6">Biaya per Satuan</th>
                  <th className="py-4 px-6">Catatan</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition font-sans text-sm text-slate-700">
                    <td className="py-4 px-6 font-semibold text-slate-800">{m.name}</td>
                    <td className="py-4 px-6 font-mono">{formatRupiah(m.purchasePrice)}</td>
                    <td className="py-4 px-6">
                      {m.packageSize} <span className="text-slate-400 font-medium">{m.unit}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      <span className="text-indigo-600 font-mono">
                        {formatRupiah(m.costPerUnit)}
                      </span>
                      <span className="text-slate-400 text-xs font-medium"> / {m.unit}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 max-w-[200px] truncate">{m.notes || "-"}</td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="inline-flex items-center p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
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

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredMaterials.map((m) => (
              <div key={m.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-sans font-bold text-slate-800 text-sm">{m.name}</h4>
                    {m.notes && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{m.notes}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">Harga Kemasan</span>
                    <span className="font-mono text-slate-700 font-semibold">{formatRupiah(m.purchasePrice)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Isi Kemasan</span>
                    <span className="text-slate-700 font-medium">
                      {m.packageSize} <span className="text-slate-400 font-normal">{m.unit}</span>
                    </span>
                  </div>
                  <div className="col-span-2 pt-1">
                    <span className="text-slate-400 block font-semibold">Biaya per Satuan</span>
                    <span className="text-indigo-600 font-mono font-bold text-sm">
                      {formatRupiah(m.costPerUnit)}
                    </span>
                    <span className="text-slate-400 font-normal"> / {m.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Material Slide-over Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsFormOpen(false)}
          />

          {/* Panel Container */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between transform transition duration-300">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-sans font-bold text-slate-800">
                {editingMaterial ? "Edit Bahan Baku" : "Tambah Bahan Baku Baru"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              
              {formError && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 flex gap-3 text-xs text-rose-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <div>{formError}</div>
                </div>
              )}

              {/* Material Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold text-slate-700 block">
                  Nama Bahan Baku <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm"
                  placeholder="Contoh: Tepung Terigu Segitiga Biru"
                  required
                />
              </div>

              {/* Purchase Price & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-bold text-slate-700 block">
                    Harga Beli Kemasan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value === "" ? "" : Math.max(0, parseFloat(e.target.value)))}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm font-mono"
                      placeholder="Contoh: 15000"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-bold text-slate-700 block">
                    Satuan Ukur <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm"
                  >
                    <option value="gram">gram (g)</option>
                    <option value="ml">mililiter (ml)</option>
                    <option value="pcs">pieces (pcs)</option>
                    <option value="lembar">lembar</option>
                    <option value="meter">meter (m)</option>
                    <option value="kg">kilogram (kg)</option>
                    <option value="liter">liter (L)</option>
                  </select>
                </div>
              </div>

              {/* Package size */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold text-slate-700 block">
                  Ukuran/Berat Kemasan <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={packageSize}
                    onChange={(e) => setPackageSize(e.target.value === "" ? "" : Math.max(0, parseFloat(e.target.value)))}
                    className="w-full pr-16 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm"
                    placeholder="Contoh: 1000"
                    min="1"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-sans font-semibold text-slate-400">
                    {unit}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Masukkan total kuantitas per kemasan yang dibeli (Misal: ketik 1000 untuk 1 kg Tepung jika Anda menggunakan gram dalam resep).
                </p>
              </div>

              {/* Automatic Calculation Preview */}
              {liveCostPerUnit > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-sans font-bold text-indigo-500 uppercase tracking-wider block">
                    Kalkulasi Otomatis Biaya Satuan
                  </span>
                  <div className="text-slate-800 font-sans text-sm font-semibold flex items-baseline gap-1.5">
                    <span className="text-indigo-700 text-lg font-mono font-bold">
                      {formatRupiah(liveCostPerUnit)}
                    </span>
                    <span className="text-slate-500 text-xs">/ {unit}</span>
                  </div>
                  <p className="text-[10px] text-indigo-500">
                    Biaya ini akan langsung digunakan untuk menghitung porsi resep bahan baku Anda.
                  </p>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold text-slate-700 block">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm resize-none h-20"
                  placeholder="Misal: Beli di Toko Sinar Jaya, grosir lebih murah"
                />
              </div>

              <button type="submit" className="hidden" />
            </form>

            {/* Footer Buttons */}
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
                {editingMaterial ? "Simpan Perubahan" : "Simpan Bahan"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
