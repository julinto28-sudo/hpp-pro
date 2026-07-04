import React, { useState, useRef } from "react";
import { Material, Labor, Overhead, Product } from "../types";
import { 
  Download, 
  Upload, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  FileJson,
  X,
  Trash2,
  Sparkles
} from "lucide-react";

interface BackupRestoreProps {
  materials: Material[];
  labors: Labor[];
  overheads: Overhead[];
  products: Product[];
  monthlyVolume: number;
  onRestore: (data: {
    materials: Material[];
    labors: Labor[];
    overheads: Overhead[];
    products: Product[];
    monthlyVolume: number;
  }) => void;
  onResetAll: () => void;
  onLoadDemoData: () => void;
}

export default function BackupRestore({
  materials,
  labors,
  overheads,
  products,
  monthlyVolume,
  onRestore,
  onResetAll,
  onLoadDemoData,
}: BackupRestoreProps) {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Export entire application state to a local JSON file
  const handleExportBackup = () => {
    try {
      const backupData = {
        appIdentifier: "hpp-profesional-backup",
        version: "1.0",
        timestamp: new Date().toISOString(),
        monthlyVolume,
        materials,
        labors,
        overheads,
        products,
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `hpp-profesional-cadangan-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccessMessage("Berhasil mengekspor data cadangan! Berkas tersimpan di perangkat Anda.");
      setErrorMessage("");
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal membuat berkas cadangan data.");
    }
  };

  // 2. Import and validate JSON file
  const processJsonFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result as string;
        const parsed = JSON.parse(jsonContent);

        // Simple validation checks to ensure structure is valid
        if (
          !Array.isArray(parsed.materials) ||
          !Array.isArray(parsed.labors) ||
          !Array.isArray(parsed.overheads) ||
          !Array.isArray(parsed.products)
        ) {
          throw new Error("Format berkas tidak valid. Berkas cadangan HPP Profesional harus mengandung array bahan baku, tenaga kerja, bop, dan produk.");
        }

        // Apply restoring callback to trigger React state updates in App.tsx
        onRestore({
          materials: parsed.materials,
          labors: parsed.labors,
          overheads: parsed.overheads,
          products: parsed.products,
          monthlyVolume: Math.max(1, parseInt(parsed.monthlyVolume) || 500)
        });

        setSuccessMessage(`Berhasil memulihkan data cadangan! Berhasil mengimpor ${parsed.materials.length} Bahan Baku, ${parsed.labors.length} Tenaga Kerja, ${parsed.overheads.length} Overhead, dan ${parsed.products.length} Kalkulasi Produk.`);
        setErrorMessage("");
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "Format berkas JSON salah atau rusak. Mohon unggah berkas cadangan resmi yang valid.");
        setSuccessMessage("");
      }
    };
    reader.readAsText(file);
  };

  // Triggered when file input changes
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processJsonFile(e.target.files[0]);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processJsonFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6" id="backup-restore-tab">
      
      {/* Intro header */}
      <div>
        <h2 className="text-xl font-sans font-bold text-slate-800 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Ekspor & Impor Cadangan Data
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Simpan seluruh database biaya resep dan HPP Anda ke komputer pribadi secara aman, atau pulihkan data lama Anda seketika.
        </p>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4.5 flex gap-3 text-xs text-emerald-700 items-start">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Pemulihan Sukses!</span>
            <p className="leading-relaxed">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage("")} className="ml-auto text-emerald-400 hover:text-emerald-600 cursor-pointer p-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorErrorMessage()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Column */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl w-fit">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-sans font-bold text-slate-800">Ekspor Data (Backup)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mengekspor seluruh data yang telah Anda catat (Bahan baku, Pekerja, BOP, dan Produk) ke dalam satu berkas format `.json` yang aman. Data ini diunduh secara offline di komputer Anda tanpa dikirim ke server luar.
            </p>
          </div>

          <button
            onClick={handleExportBackup}
            className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-sans font-medium px-4.5 py-3 rounded-xl transition shadow-sm text-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Ekspor Menjadi File JSON
          </button>
        </div>

        {/* Import Column (Drag and Drop) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl w-fit">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-base font-sans font-bold text-slate-800">Impor Data (Restore)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unggah berkas cadangan JSON yang telah Anda ekspor sebelumnya. Tindakan ini akan menimpa seluruh database Anda saat ini dengan data yang ada di dalam berkas cadangan.
            </p>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
              isDragging 
                ? "border-indigo-500 bg-indigo-50/50" 
                : "border-slate-200 hover:border-slate-400 bg-slate-50"
            }`}
          >
            <FileJson className={`w-8 h-8 ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`} />
            <span className="text-xs font-sans font-bold text-slate-700">
              {isDragging ? "Lepaskan berkas di sini..." : "Seret berkas di sini atau Klik untuk memilih"}
            </span>
            <span className="text-[10px] text-slate-400 font-sans">Mendukung berkas ekstensi .json</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".json"
              className="hidden"
            />
          </div>

        </div>

      </div>

      {/* Reset & Demo Data Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-sans font-bold text-slate-800">Manajemen Data Aplikasi</h3>
            <p className="text-xs text-slate-500">Mulai bisnis baru dengan mengosongkan data atau gunakan data simulasi bawaan.</p>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 leading-relaxed">
          Gunakan opsi di bawah ini jika Anda ingin mengosongkan seluruh database (Bahan baku, Pekerja, BOP, dan Produk) agar Anda bisa langsung menginput resep & komponen bisnis kuliner/produksi Anda sendiri dari nol. Anda juga bisa memuat kembali data demo kapan saja.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              if (window.confirm("Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan dan akan mengosongkan seluruh database Anda saat ini.")) {
                onResetAll();
                setSuccessMessage("Berhasil menghapus seluruh data! Sekarang workspace Anda bersih dan kosong.");
                setErrorMessage("");
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-sans font-bold px-4 py-3 rounded-xl transition text-sm cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Semua Data (Mulai dari Nol)
          </button>
          <button
            onClick={() => {
              if (window.confirm("Apakah Anda yakin ingin memuat ulang data demo kuliner? Tindakan ini akan menimpa data Anda saat ini dengan resep simulasi Roti Tawar Butter Premium bawaan.")) {
                onLoadDemoData();
                setSuccessMessage("Berhasil memuat ulang data demo kuliner! Silakan eksplorasi fitur kalkulasi HPP.");
                setErrorMessage("");
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 font-sans font-bold px-4 py-3 rounded-xl transition text-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            Muat Ulang Data Contoh (Demo)
          </button>
        </div>
      </div>

    </div>
  );

  function errorErrorMessage() {
    if (errorMessage) {
      return (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4.5 flex gap-3 text-xs text-rose-700 items-start">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Gagal Impor Cadangan</span>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage("")} className="ml-auto text-rose-400 hover:text-rose-600 cursor-pointer p-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }
    return null;
  }
}
