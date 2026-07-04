import React, { useState, useMemo } from "react";
import { 
  Material, 
  Labor, 
  Overhead, 
  Product, 
  ProductMaterialComponent, 
  ProductLaborComponent, 
  ProductOverheadComponent 
} from "../types";
import { calculateProductHpp, formatRupiah } from "../utils/hppCalculator";
import { 
  Plus, 
  Trash2, 
  Layers, 
  ArrowLeft, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle, 
  Calculator, 
  Printer, 
  FileText,
  DollarSign,
  TrendingUp,
  Percent,
  Clock,
  Briefcase
} from "lucide-react";

interface ProductsTabProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  materials: Material[];
  labors: Labor[];
  overheads: Overhead[];
  monthlyVolume: number;
}

export default function ProductsTab({
  products,
  setProducts,
  materials,
  labors,
  overheads,
  monthlyVolume,
}: ProductsTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingCostSheet, setViewingCostSheet] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [batchSize, setBatchSize] = useState<number>(1);
  const [selectedMaterials, setSelectedMaterials] = useState<ProductMaterialComponent[]>([]);
  const [selectedLabors, setSelectedLabors] = useState<ProductLaborComponent[]>([]);
  const [selectedOverheads, setSelectedOverheads] = useState<ProductOverheadComponent[]>([]);
  const [targetMargin, setTargetMargin] = useState<number>(40);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [formError, setFormError] = useState("");

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setBatchSize(1);
    setSelectedMaterials([]);
    setSelectedLabors([]);
    // Pre-populate overheads as automatic by default
    const initialOverheads = overheads.map(o => ({
      overheadId: o.id,
      isAutomatic: true,
      manualCost: 0
    }));
    setSelectedOverheads(initialOverheads);
    setTargetMargin(40);
    setSellingPrice(0);
    setFormError("");
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description || "");
    setBatchSize(p.batchSize || 1);
    setSelectedMaterials([...p.materials]);
    setSelectedLabors([...p.labors]);
    
    // Ensure all overheads in the DB are present in selectedOverheads
    const existingOverheadMap = new Map(p.overheads.map(oh => [oh.overheadId, oh]));
    const syncedOverheads = overheads.map(o => {
      if (existingOverheadMap.has(o.id)) {
        return existingOverheadMap.get(o.id)!;
      }
      return { overheadId: o.id, isAutomatic: true, manualCost: 0 };
    });
    
    setSelectedOverheads(syncedOverheads);
    setTargetMargin(p.targetMargin || 40);
    setSellingPrice(p.sellingPrice || 0);
    setFormError("");
    setIsFormOpen(true);
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Nama produk wajib diisi.");
      return;
    }
    if (batchSize <= 0) {
      setFormError("Ukuran batch produksi wajib minimal 1 unit.");
      return;
    }

    const payload: Product = {
      id: editingProduct ? editingProduct.id : "prod_" + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      description: description.trim() || undefined,
      batchSize,
      materials: selectedMaterials.filter(m => m.materialId && m.quantityUsed > 0),
      labors: selectedLabors.filter(l => l.laborId && l.timeOrQty > 0),
      overheads: selectedOverheads,
      targetMargin,
      sellingPrice,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? payload : p));
    } else {
      setProducts(prev => [payload, ...prev]);
    }

    setIsFormOpen(false);
  };

  // Delete product
  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus perhitungan produk ini?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // Material helpers
  const handleAddMaterialRow = () => {
    setSelectedMaterials(prev => [...prev, { materialId: "", quantityUsed: 0 }]);
  };

  const handleUpdateMaterialRow = (index: number, field: keyof ProductMaterialComponent, value: string | number) => {
    setSelectedMaterials(prev => prev.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          [field]: field === "quantityUsed" ? Math.max(0, parseFloat(value as string) || 0) : value
        };
      }
      return item;
    }));
  };

  const handleRemoveMaterialRow = (index: number) => {
    setSelectedMaterials(prev => prev.filter((_, idx) => idx !== index));
  };

  // Labor helpers
  const handleAddLaborRow = () => {
    setSelectedLabors(prev => [...prev, { laborId: "", timeOrQty: 0 }]);
  };

  const handleUpdateLaborRow = (index: number, field: keyof ProductLaborComponent, value: string | number) => {
    setSelectedLabors(prev => prev.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          [field]: field === "timeOrQty" ? Math.max(0, parseFloat(value as string) || 0) : value
        };
      }
      return item;
    }));
  };

  const handleRemoveLaborRow = (index: number) => {
    setSelectedLabors(prev => prev.filter((_, idx) => idx !== index));
  };

  // Overhead helpers
  const handleUpdateOverheadToggle = (overheadId: string, isAutomatic: boolean) => {
    setSelectedOverheads(prev => prev.map(item => {
      if (item.overheadId === overheadId) {
        return { ...item, isAutomatic, manualCost: isAutomatic ? 0 : item.manualCost };
      }
      return item;
    }));
  };

  const handleUpdateOverheadManualCost = (overheadId: string, value: number) => {
    setSelectedOverheads(prev => prev.map(item => {
      if (item.overheadId === overheadId) {
        return { ...item, manualCost: value };
      }
      return item;
    }));
  };

  // Live calculation for the active form
  const liveCalculation = useMemo(() => {
    const dummyProduct: Product = {
      id: "temp",
      name: name || "Produk Baru",
      batchSize: batchSize || 1,
      materials: selectedMaterials.filter(m => m.materialId && m.quantityUsed > 0),
      labors: selectedLabors.filter(l => l.laborId && l.timeOrQty > 0),
      overheads: selectedOverheads,
      targetMargin,
      sellingPrice,
      createdAt: "",
      updatedAt: ""
    };
    return calculateProductHpp(dummyProduct, materials, labors, overheads, monthlyVolume);
  }, [name, batchSize, selectedMaterials, selectedLabors, selectedOverheads, targetMargin, sellingPrice, materials, labors, overheads, monthlyVolume]);

  return (
    <div className="space-y-6" id="products-tab">
      
      {/* Header section */}
      {!isFormOpen && !viewingCostSheet && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-sans font-bold text-slate-800">
              Kalkulator & Daftar HPP Produk
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Buat resep produksi (batch), alokasikan upah kerja serta overhead, lalu simulasikan harga jual dan margin kotor produk Anda.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-sans font-medium px-4.5 py-2.5 rounded-xl transition duration-150 shadow-md shadow-slate-900/10 text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Hitung HPP Baru
          </button>
        </div>
      )}

      {/* Main product gallery / list */}
      {!isFormOpen && !viewingCostSheet && (
        <>
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 font-sans text-sm flex flex-col items-center justify-center gap-2">
              <Calculator className="w-10 h-10 text-slate-200" />
              Belum ada produk yang dihitung. Klik tombol "Hitung HPP Baru" untuk memulai!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                const hppData = calculateProductHpp(p, materials, labors, overheads, monthlyVolume);
                
                return (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-sans font-bold text-slate-800 text-base line-clamp-1">{p.name}</h3>
                          <span className="text-[10px] font-sans font-semibold text-slate-400">
                            Batch Size: {p.batchSize} unit
                          </span>
                        </div>
                        <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full ${
                          hppData.actualMargin < 25 
                            ? "bg-rose-50 text-rose-600" 
                            : hppData.actualMargin < 45 
                              ? "bg-amber-50 text-amber-600" 
                              : "bg-emerald-50 text-emerald-600"
                        }`}>
                          Margin {hppData.actualMargin.toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 h-8">
                        {p.description || "Tidak ada rincian produk."}
                      </p>
                    </div>

                    {/* Cost Structure Indicators */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-50">
                      <div className="flex justify-between text-xs font-sans">
                        <span className="text-slate-400 font-medium">HPP per Unit:</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {formatRupiah(hppData.hppPerUnit)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-sans">
                        <span className="text-slate-400 font-medium">Harga Jual:</span>
                        <span className="font-bold text-indigo-600 font-mono">
                          {formatRupiah(p.sellingPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-sans">
                        <span className="text-slate-400 font-medium">Laba Kotor per Unit:</span>
                        <span className={`font-bold font-mono ${hppData.actualProfitPerUnit < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {formatRupiah(hppData.actualProfitPerUnit)}
                        </span>
                      </div>
                    </div>

                    {/* Progress bars representing proportions */}
                    <div className="space-y-1">
                      <div className="flex h-2 rounded-full overflow-hidden bg-slate-50">
                        {/* Material cost segment */}
                        <div 
                          style={{ width: `${(hppData.totalMaterialCost / hppData.totalBatchCost) * 100}%` }}
                          className="bg-sky-400"
                          title={`Bahan Baku: ${Math.round((hppData.totalMaterialCost / hppData.totalBatchCost) * 100)}%`}
                        />
                        {/* Labor cost segment */}
                        <div 
                          style={{ width: `${(hppData.totalLaborCost / hppData.totalBatchCost) * 100}%` }}
                          className="bg-indigo-400"
                          title={`Pekerja: ${Math.round((hppData.totalLaborCost / hppData.totalBatchCost) * 100)}%`}
                        />
                        {/* Overhead cost segment */}
                        <div 
                          style={{ width: `${(hppData.totalOverheadCost / hppData.totalBatchCost) * 100}%` }}
                          className="bg-emerald-400"
                          title={`Overhead: ${Math.round((hppData.totalOverheadCost / hppData.totalBatchCost) * 100)}%`}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                        <span>Bahan</span>
                        <span>Pekerja</span>
                        <span>Overhead</span>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                      <button
                        onClick={() => setViewingCostSheet(p)}
                        className="flex items-center gap-1.5 text-xs font-sans font-semibold text-slate-700 hover:text-indigo-600 transition bg-slate-50 hover:bg-slate-100 py-1.5 px-3 rounded-lg cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Cost Card
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-2.5 py-1.5 text-xs font-sans text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="px-2.5 py-1.5 text-xs font-sans text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Product Creation / Edit Form Panel */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <button
              onClick={() => setIsFormOpen(false)}
              className="flex items-center gap-1.5 text-xs font-sans font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Daftar
            </button>
            <h3 className="text-base font-sans font-extrabold text-slate-800">
              {editingProduct ? "Edit Formulir HPP Produk" : "Formulir Perhitungan HPP Baru"}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {formError && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 flex gap-3 text-xs text-rose-600">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <div>{formError}</div>
              </div>
            )}

            {/* Part 1: Product info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-sans font-bold text-slate-700 block">
                  Nama Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm"
                  placeholder="Contoh: Roti Tawar Spesial Butter"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold text-slate-700 block">
                  Ukuran Batch Produksi (Resep) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full pr-16 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm font-semibold"
                    min="1"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-sans font-semibold text-slate-400">
                    unit
                  </span>
                </div>
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-sans font-bold text-slate-700 block">
                  Rincian Deskripsi / Catatan Produk
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm resize-none h-16"
                  placeholder="Misal: Resep roti tawar premium dengan mentega wysman"
                />
              </div>
            </div>

            {/* Part 2: Raw materials selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-sans font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-500" />
                    1. Penggunaan Bahan Baku
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Tentukan bahan yang digunakan beserta takaran yang dimasukkan dalam resep ini.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddMaterialRow}
                  className="flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-sans font-semibold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Bahan
                </button>
              </div>

              {selectedMaterials.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200/80 rounded-2xl p-6 text-center text-xs text-slate-400">
                  Belum ada bahan baku yang dimasukkan dalam resep ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedMaterials.map((comp, idx) => {
                    const matchedMaterial = materials.find(m => m.id === comp.materialId);
                    const calculatedCost = matchedMaterial ? matchedMaterial.costPerUnit * comp.quantityUsed : 0;
                    
                    return (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-6">
                          <select
                            value={comp.materialId}
                            onChange={(e) => handleUpdateMaterialRow(idx, "materialId", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-xs text-slate-700"
                            required
                          >
                            <option value="">-- Pilih Bahan Baku dari Database --</option>
                            {materials.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({formatRupiah(m.costPerUnit)}/{m.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-3 relative">
                          <input
                            type="number"
                            value={comp.quantityUsed || ""}
                            onChange={(e) => handleUpdateMaterialRow(idx, "quantityUsed", e.target.value)}
                            className="w-full pr-12 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-xs text-right font-mono"
                            placeholder="Takaran"
                            min="0.01"
                            step="any"
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-sans font-bold text-slate-400">
                            {matchedMaterial ? matchedMaterial.unit : "unit"}
                          </span>
                        </div>

                        {/* Calculated Subtotal Cost */}
                        <div className="sm:col-span-2 text-right">
                          <span className="text-xs font-mono font-bold text-slate-700">
                            {formatRupiah(calculatedCost)}
                          </span>
                        </div>

                        <div className="sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterialRow(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer inline-flex"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Part 3: Labor selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-sans font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    2. Upah Kerja Langsung
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Sebutkan pekerja atau peran yang terlibat beserta waktu/unit yang dihabiskan untuk menyelesaikan resep ini.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddLaborRow}
                  className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-sans font-semibold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Pekerja
                </button>
              </div>

              {selectedLabors.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200/80 rounded-2xl p-6 text-center text-xs text-slate-400">
                  Belum ada upah kerja langsung yang dikonfigurasikan dalam resep ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedLabors.map((comp, idx) => {
                    const matchedLabor = labors.find(l => l.id === comp.laborId);
                    const calculatedCost = matchedLabor ? matchedLabor.rate * comp.timeOrQty : 0;
                    
                    return (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-6">
                          <select
                            value={comp.laborId}
                            onChange={(e) => handleUpdateLaborRow(idx, "laborId", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-xs text-slate-700"
                            required
                          >
                            <option value="">-- Pilih Pekerja dari Database --</option>
                            {labors.map(l => (
                              <option key={l.id} value={l.id}>
                                {l.role} ({formatRupiah(l.rate)}/
                                {l.rateType === "hour" ? "jam" : l.rateType === "day" ? "hari" : "unit"})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-3 relative">
                          <input
                            type="number"
                            value={comp.timeOrQty || ""}
                            onChange={(e) => handleUpdateLaborRow(idx, "timeOrQty", e.target.value)}
                            className="w-full pr-12 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-xs text-right font-mono"
                            placeholder="Waktu/Kuantitas"
                            min="0.01"
                            step="any"
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-sans font-bold text-slate-400 uppercase">
                            {matchedLabor 
                              ? matchedLabor.rateType === "hour" ? "jam" : matchedLabor.rateType === "day" ? "hari" : "unit"
                              : "nilai"}
                          </span>
                        </div>

                        {/* Cost */}
                        <div className="sm:col-span-2 text-right">
                          <span className="text-xs font-mono font-bold text-slate-700">
                            {formatRupiah(calculatedCost)}
                          </span>
                        </div>

                        <div className="sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveLaborRow(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer inline-flex"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Part 4: Overhead allocation */}
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-100">
                <h4 className="text-sm font-sans font-bold text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  3. Alokasi Overhead Pabrik (BOP)
                </h4>
                <p className="text-[10px] text-slate-400">
                  Berikut adalah daftar BOP bulanan Anda. Gunakan opsi alokasi otomatis berdasarkan kapasitas volume produksi bulanan ({monthlyVolume} unit) atau masukkan biaya manual.
                </p>
              </div>

              {overheads.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200/80 rounded-2xl p-6 text-center text-xs text-slate-400">
                  Belum ada biaya overhead yang didaftarkan di database.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedOverheads.map((comp) => {
                    const oh = overheads.find(o => o.id === comp.overheadId);
                    if (!oh) return null;
                    
                    // Calc auto overhead allocated for the batch
                    const autoBatchCost = monthlyVolume > 0 
                      ? (oh.cost / monthlyVolume) * batchSize 
                      : 0;
                    
                    const finalCost = comp.isAutomatic ? autoBatchCost : (comp.manualCost || 0);

                    return (
                      <div key={comp.overheadId} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center border-b border-slate-50 pb-3">
                        <div className="sm:col-span-4">
                          <span className="text-xs font-semibold text-slate-700">{oh.name}</span>
                          <span className="text-[10px] text-slate-400 block">Rp {oh.cost.toLocaleString('id-ID')}/bulan</span>
                        </div>

                        <div className="sm:col-span-4">
                          <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button
                              type="button"
                              onClick={() => handleUpdateOverheadToggle(comp.overheadId, true)}
                              className={`flex-1 text-center py-1 text-[10px] font-sans font-bold rounded-md transition cursor-pointer ${
                                comp.isAutomatic 
                                  ? "bg-white text-emerald-700 shadow-xs" 
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              Otomatis
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateOverheadToggle(comp.overheadId, false)}
                              className={`flex-1 text-center py-1 text-[10px] font-sans font-bold rounded-md transition cursor-pointer ${
                                !comp.isAutomatic 
                                  ? "bg-white text-slate-800 shadow-xs" 
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              Manual
                            </button>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          {!comp.isAutomatic ? (
                            <input
                              type="number"
                              value={comp.manualCost || ""}
                              onChange={(e) => handleUpdateOverheadManualCost(comp.overheadId, Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-right"
                              placeholder="Ketik biaya"
                            />
                          ) : (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-sans font-semibold px-2 py-1 rounded-md block text-center">
                              Auto: Rp {autoBatchCost.toFixed(0)}
                            </span>
                          )}
                        </div>

                        <div className="sm:col-span-2 text-right">
                          <span className="text-xs font-mono font-bold text-slate-700">
                            {formatRupiah(finalCost)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Part 5: Live Summary Cost & HPP indicators */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="md:border-r border-slate-800 pb-4 md:pb-0">
                <span className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider block">Total Bahan Baku</span>
                <span className="text-xl font-sans font-bold font-mono block text-sky-400">
                  {formatRupiah(liveCalculation.totalMaterialCost)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {Math.round((liveCalculation.totalMaterialCost / (liveCalculation.totalBatchCost || 1)) * 100) || 0}% proporsi batch
                </span>
              </div>

              <div className="md:border-r border-slate-800 pb-4 md:pb-0">
                <span className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider block">Total Pekerja</span>
                <span className="text-xl font-sans font-bold font-mono block text-indigo-400">
                  {formatRupiah(liveCalculation.totalLaborCost)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {Math.round((liveCalculation.totalLaborCost / (liveCalculation.totalBatchCost || 1)) * 100) || 0}% proporsi batch
                </span>
              </div>

              <div className="md:border-r border-slate-800 pb-4 md:pb-0">
                <span className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider block">Total Overhead (BOP)</span>
                <span className="text-xl font-sans font-bold font-mono block text-emerald-400">
                  {formatRupiah(liveCalculation.totalOverheadCost)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {Math.round((liveCalculation.totalOverheadCost / (liveCalculation.totalBatchCost || 1)) * 100) || 0}% proporsi batch
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-300 font-sans font-bold uppercase tracking-wider block">HPP per Unit</span>
                <span className="text-2xl font-sans font-extrabold font-mono block text-white">
                  {formatRupiah(liveCalculation.hppPerUnit)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Biaya Batch: {formatRupiah(liveCalculation.totalBatchCost)}
                </span>
              </div>

            </div>

            {/* Part 6: Selling price & profit margins simulation */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 space-y-5">
              <h4 className="text-sm font-sans font-bold text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-slate-700" />
                4. Simulasi Harga & Laba Kotor Produk
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Simulation 1: Input Target Margin, Get Suggested Price */}
                <div className="space-y-2">
                  <label className="text-xs font-sans font-bold text-slate-700 block">
                    Target Margin Kotor (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={targetMargin || ""}
                      onChange={(e) => setTargetMargin(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      className="w-full pr-12 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-bold text-slate-700"
                      placeholder="Contoh: 40"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-sans font-bold text-slate-400">
                      %
                    </span>
                  </div>
                  <div className="pt-1.5 text-xs text-slate-500">
                    Saran Harga Jual (Margin {targetMargin}%):{" "}
                    <span className="font-mono font-bold text-indigo-600">
                      {formatRupiah(liveCalculation.suggestedSellingPrice)}
                    </span>
                  </div>
                </div>

                {/* Simulation 2: Input Actual Price, Get Actual Margin */}
                <div className="space-y-2">
                  <label className="text-xs font-sans font-bold text-slate-700 block">
                    Harga Jual Aktual per Unit (Rupiah)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={sellingPrice || ""}
                      onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-bold font-mono text-indigo-700"
                      placeholder="Contoh: 15000"
                    />
                  </div>
                  <div className="pt-1.5 text-xs text-slate-500">
                    Laba per Unit:{" "}
                    <span className={`font-mono font-bold ${liveCalculation.actualProfitPerUnit < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {formatRupiah(liveCalculation.actualProfitPerUnit)}
                    </span>{" "}
                    (Margin Aktual: <span className="font-bold">{liveCalculation.actualMargin.toFixed(1)}%</span>)
                  </div>
                </div>

              </div>

              {/* Warnings and alerts */}
              {sellingPrice > 0 && sellingPrice < liveCalculation.hppPerUnit && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-xs text-rose-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 animate-bounce text-rose-600" />
                  <div>
                    <span className="font-bold block">Peringatan: Harga Jual di Bawah HPP!</span>
                    Harga jual Anda (Rp {sellingPrice.toLocaleString()}) lebih rendah dari HPP per unit (Rp {Math.round(liveCalculation.hppPerUnit).toLocaleString()}). Setiap unit yang terjual akan mendatangkan kerugian sebesar {formatRupiah(Math.abs(liveCalculation.actualProfitPerUnit))}. Mohon koreksi harga jual Anda!
                  </div>
                </div>
              )}

              {sellingPrice > 0 && sellingPrice >= liveCalculation.hppPerUnit && liveCalculation.actualMargin < targetMargin && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-xs text-amber-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Info: Di bawah Target Margin</span>
                    Harga jual saat ini memberikan profit margin sebesar {liveCalculation.actualMargin.toFixed(1)}%, sedikit di bawah target profit margin kotor Anda ({targetMargin}%).
                  </div>
                </div>
              )}

              {sellingPrice > 0 && liveCalculation.actualMargin >= targetMargin && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 text-xs text-emerald-700">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Selamat: Target Margin Terpenuhi!</span>
                    Strategi harga Anda sangat sehat. Anda berhasil mencapai margin keuntungan {liveCalculation.actualMargin.toFixed(1)}%, di atas target minimum Anda ({targetMargin}%).
                  </div>
                </div>
              )}

            </div>

            {/* Submit & Cancel */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-sans font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-sans font-semibold transition shadow-md cursor-pointer"
              >
                {editingProduct ? "Simpan Perubahan HPP" : "Simpan Perhitungan HPP"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* cost card (View Product Details) printable report modal */}
      {viewingCostSheet && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6" id="cost-sheet-view">
          
          {/* Header Action bar */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 print:hidden">
            <button
              onClick={() => setViewingCostSheet(null)}
              className="flex items-center gap-1.5 text-xs font-sans font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Produk
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-sans font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Faktur HPP
            </button>
          </div>

          {/* Cost sheet document container */}
          <div className="p-4 md:p-8 bg-white border border-slate-200/90 rounded-2xl max-w-3xl mx-auto space-y-8 text-slate-800 print:border-0 print:p-0">
            
            {/* Invoice Header */}
            <div className="text-center space-y-1.5 border-b-2 border-slate-800 pb-5">
              <h2 className="text-xl md:text-2xl font-sans font-extrabold tracking-tight uppercase">
                FAKTUR RINCIAN BIAYA & HPP PRODUK
              </h2>
              <p className="text-[11px] font-sans font-bold text-slate-500 uppercase tracking-wide">
                Laporan Akuntansi Manajemen Pokok Produksi
              </p>
              <div className="text-[10px] font-mono text-slate-400">
                Tanggal Dibuat: {new Date(viewingCostSheet.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})} | Diperbarui: {new Date(viewingCostSheet.updatedAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
              </div>
            </div>

            {/* Summary Identity Card */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-sans font-semibold text-slate-400 uppercase tracking-wider block">Identitas Produk</span>
                <h3 className="text-base font-sans font-extrabold text-slate-800">{viewingCostSheet.name}</h3>
                <p className="text-xs text-slate-500">{viewingCostSheet.description || "Tidak ada deskripsi produk."}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-sans font-semibold text-slate-400 uppercase tracking-wider block">Spesifikasi Batch</span>
                <span className="text-sm font-sans font-extrabold text-slate-800 font-mono">
                  {viewingCostSheet.batchSize} unit
                </span>
                <p className="text-xs text-slate-500">Estimasi total unit per resep</p>
              </div>
            </div>

            {/* Calculations Breakdown */}
            {(() => {
              const hppDetail = calculateProductHpp(viewingCostSheet, materials, labors, overheads, monthlyVolume);
              
              return (
                <div className="space-y-6">
                  
                  {/* 1. Materials section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-sans font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5">
                      1. Komponen Biaya Bahan Baku
                    </h4>
                    {viewingCostSheet.materials.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Tidak ada bahan baku yang terdaftar dalam resep.</p>
                    ) : (
                      <table className="w-full text-xs font-sans text-left">
                        <thead>
                          <tr className="text-slate-400 font-semibold border-b border-slate-100">
                            <th className="py-2">Nama Bahan</th>
                            <th className="py-2 text-right">Kebutuhan Resep</th>
                            <th className="py-2 text-right">Tarif per Satuan</th>
                            <th className="py-2 text-right">Subtotal Biaya</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {viewingCostSheet.materials.map((comp, i) => {
                            const mat = materials.find(m => m.id === comp.materialId);
                            if (!mat) return null;
                            const subtotal = mat.costPerUnit * comp.quantityUsed;
                            return (
                              <tr key={i} className="text-slate-700">
                                <td className="py-2 font-medium">{mat.name}</td>
                                <td className="py-2 text-right font-mono">{comp.quantityUsed} {mat.unit}</td>
                                <td className="py-2 text-right font-mono">{formatRupiah(mat.costPerUnit)}</td>
                                <td className="py-2 text-right font-mono font-semibold">{formatRupiah(subtotal)}</td>
                              </tr>
                            );
                          })}
                          <tr className="font-bold border-t border-slate-800 text-slate-800">
                            <td colSpan={3} className="py-2 text-left uppercase">TOTAL BIAYA BAHAN BAKU</td>
                            <td className="py-2 text-right font-mono">{formatRupiah(hppDetail.totalMaterialCost)}</td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* 2. Labor Section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-sans font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5">
                      2. Komponen Biaya Tenaga Kerja Langsung
                    </h4>
                    {viewingCostSheet.labors.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Tidak ada alokasi upah kerja langsung.</p>
                    ) : (
                      <table className="w-full text-xs font-sans text-left">
                        <thead>
                          <tr className="text-slate-400 font-semibold border-b border-slate-100">
                            <th className="py-2">Nama Peran</th>
                            <th className="py-2 text-right">Waktu/Kuantitas Kerja</th>
                            <th className="py-2 text-right">Tarif Upah</th>
                            <th className="py-2 text-right">Subtotal Biaya</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {viewingCostSheet.labors.map((comp, i) => {
                            const lab = labors.find(l => l.id === comp.laborId);
                            if (!lab) return null;
                            const subtotal = lab.rate * comp.timeOrQty;
                            return (
                              <tr key={i} className="text-slate-700">
                                <td className="py-2 font-medium">{lab.role}</td>
                                <td className="py-2 text-right font-mono">{comp.timeOrQty} {lab.rateType === "hour" ? "jam" : lab.rateType === "day" ? "hari" : "unit"}</td>
                                <td className="py-2 text-right font-mono">{formatRupiah(lab.rate)}</td>
                                <td className="py-2 text-right font-mono font-semibold">{formatRupiah(subtotal)}</td>
                              </tr>
                            );
                          })}
                          <tr className="font-bold border-t border-slate-800 text-slate-800">
                            <td colSpan={3} className="py-2 text-left uppercase">TOTAL BIAYA TENAGA KERJA</td>
                            <td className="py-2 text-right font-mono">{formatRupiah(hppDetail.totalLaborCost)}</td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* 3. Overhead section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-sans font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5">
                      3. Komponen Alokasi Overhead Pabrik (BOP)
                    </h4>
                    {viewingCostSheet.overheads.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Tidak ada biaya overhead pabrik yang dibebankan.</p>
                    ) : (
                      <table className="w-full text-xs font-sans text-left">
                        <thead>
                          <tr className="text-slate-400 font-semibold border-b border-slate-100">
                            <th className="py-2">Nama Biaya Overhead</th>
                            <th className="py-2 text-right">Tipe Pembebanan</th>
                            <th className="py-2 text-right">Beban Bulanan</th>
                            <th className="py-2 text-right">Subtotal Alokasi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {viewingCostSheet.overheads.map((comp, i) => {
                            const oh = overheads.find(o => o.id === comp.overheadId);
                            if (!oh) return null;
                            const finalCost = comp.isAutomatic 
                              ? (monthlyVolume > 0 ? (oh.cost / monthlyVolume) * viewingCostSheet.batchSize : 0) 
                              : (comp.manualCost || 0);

                            return (
                              <tr key={i} className="text-slate-700">
                                <td className="py-2 font-medium">{oh.name}</td>
                                <td className="py-2 text-right">
                                  <span className="text-[10px] font-semibold text-slate-500 uppercase">
                                    {comp.isAutomatic ? "Auto (Kapasitas)" : "Manual"}
                                  </span>
                                </td>
                                <td className="py-2 text-right font-mono">{formatRupiah(oh.cost)}</td>
                                <td className="py-2 text-right font-mono font-semibold">{formatRupiah(finalCost)}</td>
                              </tr>
                            );
                          })}
                          <tr className="font-bold border-t border-slate-800 text-slate-800">
                            <td colSpan={3} className="py-2 text-left uppercase">TOTAL BIAYA OVERHEAD (BOP)</td>
                            <td className="py-2 text-right font-mono">{formatRupiah(hppDetail.totalOverheadCost)}</td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* 4. Grand summary sheet block */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-3.5 print:bg-transparent print:border-t-2 print:border-b-2 print:border-slate-800 print:rounded-none">
                    <h4 className="text-xs font-sans font-extrabold text-slate-800 uppercase tracking-wider block">
                      Ringkasan Akuntansi Hasil Perhitungan
                    </h4>

                    <div className="grid grid-cols-2 gap-y-2.5 text-xs font-sans pt-1">
                      <div className="text-slate-500 font-semibold uppercase">A. TOTAL BIAYA SATU BATCH RESEP</div>
                      <div className="text-right font-mono font-bold text-slate-800">
                        {formatRupiah(hppDetail.totalBatchCost)}
                      </div>

                      <div className="text-slate-500 font-semibold uppercase">B. UKURAN BATCH PRODUKSI</div>
                      <div className="text-right font-mono font-bold text-slate-800">
                        {viewingCostSheet.batchSize} unit
                      </div>

                      <div className="text-slate-800 font-extrabold uppercase border-t border-slate-200 pt-2 text-sm">C. HPP PER UNIT PRODUK (A / B)</div>
                      <div className="text-right font-mono font-extrabold text-indigo-700 border-t border-slate-200 pt-2 text-base">
                        {formatRupiah(hppDetail.hppPerUnit)}
                      </div>

                      <div className="text-slate-500 font-semibold uppercase">D. HARGA JUAL DISARANKAN (TARGET MARGIN {viewingCostSheet.targetMargin}%)</div>
                      <div className="text-right font-mono font-bold text-slate-800">
                        {formatRupiah(hppDetail.suggestedSellingPrice)}
                      </div>

                      <div className="text-slate-800 font-extrabold uppercase border-t border-slate-200 pt-2 text-sm">E. HARGA JUAL AKTUAL DI PASAR</div>
                      <div className="text-right font-mono font-extrabold text-indigo-700 border-t border-slate-200 pt-2 text-base">
                        {formatRupiah(viewingCostSheet.sellingPrice)}
                      </div>

                      <div className="text-slate-500 font-semibold uppercase">F. LABA KOTOR BERSIH PER UNIT (E - C)</div>
                      <div className={`text-right font-mono font-bold ${hppDetail.actualProfitPerUnit < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatRupiah(hppDetail.actualProfitPerUnit)}
                      </div>

                      <div className="text-slate-500 font-semibold uppercase">G. PERSENTASE MARGIN KOTOR AKTUAL</div>
                      <div className="text-right font-sans font-bold text-slate-800">
                        {hppDetail.actualMargin.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Signatures for Print validation */}
                  <div className="hidden print:grid grid-cols-2 gap-12 pt-16 text-center text-xs font-sans">
                    <div className="space-y-12">
                      <p>Pembuat Laporan HPP,</p>
                      <div className="border-b border-slate-800 w-44 mx-auto" />
                      <p className="font-semibold text-slate-700">Pemilik Usaha</p>
                    </div>
                    <div className="space-y-12">
                      <p>Divalidasi Oleh,</p>
                      <div className="border-b border-slate-800 w-44 mx-auto" />
                      <p className="font-semibold text-slate-700">Akuntan Keuangan</p>
                    </div>
                  </div>

                </div>
              );
            })()}

          </div>
        </div>
      )}

    </div>
  );
}
