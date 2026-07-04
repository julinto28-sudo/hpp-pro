import React, { useState } from "react";
import { Material, Labor, Overhead, Product } from "./types";
import DashboardTab from "./components/DashboardTab";
import MaterialsTab from "./components/MaterialsTab";
import LaborTab from "./components/LaborTab";
import OverheadTab from "./components/OverheadTab";
import ProductsTab from "./components/ProductsTab";
import BackupRestore from "./components/BackupRestore";
import AuthPortal from "./components/AuthPortal";
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  Scale, 
  Calculator, 
  Database,
  ChefHat,
  TrendingUp,
  Percent,
  LogOut,
  Cloud,
  CloudOff,
  RefreshCw
} from "lucide-react";

// Standard high-fidelity Indonesian culinary mockup seed data (fallbacks)
const initialMaterials: Material[] = [
  { id: "mat_1", name: "Tepung Terigu Cakra Kembar", purchasePrice: 18000, packageSize: 1000, unit: "gram", costPerUnit: 18, notes: "Beli kartonan di Grosir Sinar Abadi" },
  { id: "mat_2", name: "Mentega Butter Wysman", purchasePrice: 145000, packageSize: 500, unit: "gram", costPerUnit: 290, notes: "Mentega premium import untuk rasa maksimal" },
  { id: "mat_3", name: "Gula Pasir Gulaku", purchasePrice: 175000, packageSize: 10000, unit: "gram", costPerUnit: 17.5, notes: "Kemasan karung isi 10 kg" },
  { id: "mat_4", name: "Kuning Telur Ayam Ras", purchasePrice: 32000, packageSize: 1000, unit: "gram", costPerUnit: 32, notes: "Diambil dari supplier lokal segar harian" },
  { id: "mat_5", name: "Ragi Instan Fermipan", purchasePrice: 6500, packageSize: 44, unit: "gram", costPerUnit: 147.7, notes: "Sachet kecil isi 44 gram" },
  { id: "mat_6", name: "Kotak Dus Box Premium", purchasePrice: 3500, packageSize: 1, unit: "pcs", costPerUnit: 3500, notes: "Cetak logo emas di percetakan Jaya" }
];

const initialLabors: Labor[] = [
  { id: "lab_1", role: "Baker Utama (Kepala Dapur)", rate: 25000, rateType: "hour", description: "Mengatur resep dan proses pemanggangan adonan utama" },
  { id: "lab_2", role: "Staf Packer / Finishing", rate: 15000, rateType: "hour", description: "Melakukan quality control dan memasukkan roti ke kemasan dus" }
];

const initialOverheads: Overhead[] = [
  { id: "oh_1", name: "Sewa Ruko Dapur Produksi", cost: 2000000, description: "Dibayar tahunan, diamortisasi bulanan" },
  { id: "oh_2", name: "Listrik & Air Pabrik", cost: 750000, description: "Beban daya mixer industri dan pompa air bersih" },
  { id: "oh_3", name: "Penyusutan Oven & Mixer", cost: 500000, description: "Depresiasi alat produksi metode garis lurus" },
  { id: "oh_4", name: "Gas Elpiji 12kg (Dapur)", cost: 250000, description: "Rata-rata habis 1 tabung per minggu" }
];

const initialProducts: Product[] = [
  {
    id: "prod_1",
    name: "Roti Tawar Butter Premium (Batch 10 Unit)",
    description: "Roti tawar mentega wangi premium untuk segmen pasar menengah ke atas.",
    batchSize: 10,
    materials: [
      { materialId: "mat_1", quantityUsed: 2500 },
      { materialId: "mat_2", quantityUsed: 250 },
      { materialId: "mat_3", quantityUsed: 300 },
      { materialId: "mat_4", quantityUsed: 400 },
      { materialId: "mat_5", quantityUsed: 50 },
      { materialId: "mat_6", quantityUsed: 10 }
    ],
    labors: [
      { laborId: "lab_1", timeOrQty: 3 },
      { laborId: "lab_2", timeOrQty: 1.5 }
    ],
    overheads: [
      { overheadId: "oh_1", isAutomatic: true, manualCost: 0 },
      { overheadId: "oh_2", isAutomatic: true, manualCost: 0 },
      { overheadId: "oh_3", isAutomatic: true, manualCost: 0 },
      { overheadId: "oh_4", isAutomatic: true, manualCost: 0 }
    ],
    targetMargin: 40,
    sellingPrice: 32500,
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  
  // Auth & Cloud State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("hpp_token"));
  const [user, setUser] = useState<{ id: string; username: string } | null>(() => {
    const saved = localStorage.getItem("hpp_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Core Data States (Initialized empty, will load from cloud upon auth)
  const [materials, setMaterials] = useState<Material[]>([]);
  const [labors, setLabors] = useState<Labor[]>([]);
  const [overheads, setOverheads] = useState<Overhead[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [monthlyVolume, setMonthlyVolume] = useState<number>(1000);

  // Authentication Success Callback
  const handleAuthSuccess = (newToken: string, newUser: { id: string; username: string }) => {
    localStorage.setItem("hpp_token", newToken);
    localStorage.setItem("hpp_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  // Authentication Logout
  const handleLogout = () => {
    localStorage.removeItem("hpp_token");
    localStorage.removeItem("hpp_user");
    setToken(null);
    setUser(null);
    setIsInitialLoadComplete(false);
    setMaterials([]);
    setLabors([]);
    setOverheads([]);
    setProducts([]);
    setMonthlyVolume(1000);
    setActiveTab("dashboard");
  };

  // Load cloud data upon login / token presence
  React.useEffect(() => {
    if (!token) return;

    const loadCloudData = async () => {
      try {
        setIsSyncing(true);
        const res = await fetch("/api/data", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setMaterials(data.materials || []);
          setLabors(data.labors || []);
          setOverheads(data.overheads || []);
          setProducts(data.products || []);
          setMonthlyVolume(data.monthlyVolume || 1000);
          setSaveStatus("saved");
          setIsInitialLoadComplete(true);
        } else if (res.status === 401) {
          // Session expired/invalid
          handleLogout();
        }
      } catch (err) {
        console.error("Gagal mengambil data dari cloud hosting:", err);
        setSaveStatus("error");
      } finally {
        setIsSyncing(false);
      }
    };

    loadCloudData();
  }, [token]);

  // Debounced auto-save data back to the cloud hosting
  React.useEffect(() => {
    if (!token || !user || !isInitialLoadComplete) return;

    setSaveStatus("saving");
    
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch("/api/data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            materials,
            labors,
            overheads,
            products,
            monthlyVolume
          })
        });

        if (res.ok) {
          setSaveStatus("saved");
          setLastSaved(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        } else {
          setSaveStatus("error");
        }
      } catch (err) {
        console.error("Gagal otomatis menyimpan ke cloud:", err);
        setSaveStatus("error");
      }
    }, 1500); // 1.5 seconds typing debounce

    return () => clearTimeout(delayDebounceFn);
  }, [materials, labors, overheads, products, monthlyVolume, token, user, isInitialLoadComplete]);

  // Restore everything on upload (Backup screen)
  const handleRestoreBackup = (data: {
    materials: Material[];
    labors: Labor[];
    overheads: Overhead[];
    products: Product[];
    monthlyVolume: number;
  }) => {
    setMaterials(data.materials);
    setLabors(data.labors);
    setOverheads(data.overheads);
    setProducts(data.products);
    setMonthlyVolume(data.monthlyVolume);
  };

  // Clear all data to start fresh (will auto-sync)
  const handleResetAll = () => {
    setMaterials([]);
    setLabors([]);
    setOverheads([]);
    setProducts([]);
    setMonthlyVolume(1000);
  };

  // Force reload initial demo/seed data (will auto-sync)
  const handleLoadDemoData = () => {
    setMaterials(initialMaterials);
    setLabors(initialLabors);
    setOverheads(initialOverheads);
    setProducts(initialProducts);
    setMonthlyVolume(1000);
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, title: "Dashboard Analisis", subtitle: "Ringkasan metrik finansial, volume produksi, dan margin bisnis" },
    { id: "materials", label: "Bahan Baku", icon: Layers, title: "Database Bahan Baku", subtitle: "Kelola harga beli, ukuran kemasan, dan harga satuan bahan baku" },
    { id: "labor", label: "Tenaga Kerja", icon: Users, title: "Tenaga Kerja Langsung", subtitle: "Atur tarif gaji per jam atau per unit untuk karyawan produksi" },
    { id: "overhead", label: "Overhead (BOP)", icon: Scale, title: "Biaya Overhead Pabrik", subtitle: "Daftar beban operasional tetap bulanan dapur/pabrik (BOP)" },
    { id: "products", label: "Hitung HPP", icon: Calculator, title: "Formulas & Kalkulasi HPP", subtitle: "Penyusunan resep produk dan penentuan margin laba bersih" },
    { id: "backup", label: "Cadangan", icon: Database, title: "Cadangan & Backup", subtitle: "Ekspor data Anda ke file lokal atau impor untuk memulihkan data" }
  ];

  // Render Login Portal if not authenticated
  if (!token || !user) {
    return <AuthPortal onAuthSuccess={handleAuthSuccess} />;
  }

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC] font-sans text-slate-900 antialiased">
      
      {/* Sidebar Navigation - Desktop */}
      <aside className="w-64 bg-[#0F172A] hidden md:flex flex-col shrink-0 min-h-screen sticky top-0 border-r border-slate-800">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/40">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-base tracking-tight leading-none">HPP Master</span>
            <span className="text-[10px] text-indigo-300 font-sans font-semibold tracking-wider uppercase mt-1">Sistem Kalkulasi</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 font-semibold" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4 opacity-80" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* User Account Details & Logout */}
        <div className="p-6 mt-auto border-t border-slate-800/60 bg-slate-950/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-full bg-indigo-600 border border-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight truncate">{user.username}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Online
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (window.confirm("Apakah Anda yakin ingin keluar dari akun Anda?")) {
                  handleLogout();
                }
              }}
              title="Keluar dari akun"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Top Header & Horizontal Nav - Mobile */}
      <div className="md:hidden flex flex-col bg-[#0F172A] text-white sticky top-0 z-50 border-b border-slate-800">
        <div className="px-4 py-3.5 flex items-center justify-between border-b border-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
              <div className="w-3.5 h-3.5 border-2 border-white rounded-sm"></div>
            </div>
            <span className="text-white font-bold text-base tracking-tight">HPP Master</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mobile User Avatar & Logout */}
            <div className="flex items-center gap-2 border-r border-slate-800 pr-3">
              <span className="text-[11px] font-bold text-indigo-300 max-w-[80px] truncate">{user.username}</span>
              <button
                onClick={() => {
                  if (window.confirm("Keluar dari akun?")) {
                    handleLogout();
                  }
                }}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans font-semibold text-slate-400 uppercase tracking-wider">Kapasitas:</span>
              <div className="relative">
                <input
                  type="number"
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center bg-slate-800 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-sans font-bold py-1 px-1.5 rounded text-white"
                  min="1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-2 py-2 overflow-x-auto scrollbar-none flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive 
                    ? "bg-indigo-600 text-white font-semibold" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-5 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">{currentTab.title}</h1>
            <p className="text-xs md:text-sm text-slate-500">{currentTab.subtitle}</p>
          </div>
          
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <span className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-wider">Kapasitas Bulanan:</span>
            <div className="relative">
              <input
                type="number"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 text-center bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-xs font-sans font-bold py-1.5 px-2 rounded-lg text-slate-800"
                min="1"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-sans font-bold text-slate-400 uppercase pointer-events-none">
                unit
              </span>
            </div>
          </div>
        </header>

        {/* Content View Container */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto relative">
          
          {/* Cloud Synchronization Progress Indicator */}
          {isSyncing && (
            <div className="absolute top-4 right-4 bg-white/95 border border-indigo-100 shadow-lg px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-indigo-600 animate-fade-in z-50">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Sinkronisasi Cloud...
            </div>
          )}

          {activeTab === "dashboard" && (
            <DashboardTab
              materials={materials}
              labors={labors}
              overheads={overheads}
              products={products}
              monthlyVolume={monthlyVolume}
              setMonthlyVolume={setMonthlyVolume}
              setActiveTab={setActiveTab}
              onResetAll={handleResetAll}
              onLoadDemoData={handleLoadDemoData}
            />
          )}
          {activeTab === "materials" && (
            <MaterialsTab
              materials={materials}
              setMaterials={setMaterials}
            />
          )}
          {activeTab === "labor" && (
            <LaborTab
              labors={labors}
              setLabors={setLabors}
            />
          )}
          {activeTab === "overhead" && (
            <OverheadTab
              overheads={overheads}
              setOverheads={setOverheads}
              monthlyVolume={monthlyVolume}
            />
          )}
          {activeTab === "products" && (
            <ProductsTab
              products={products}
              setProducts={setProducts}
              materials={materials}
              labors={labors}
              overheads={overheads}
              monthlyVolume={monthlyVolume}
            />
          )}
          {activeTab === "backup" && (
            <BackupRestore
              materials={materials}
              labors={labors}
              overheads={overheads}
              products={products}
              monthlyVolume={monthlyVolume}
              onRestore={handleRestoreBackup}
              onResetAll={handleResetAll}
              onLoadDemoData={handleLoadDemoData}
            />
          )}
        </div>

        {/* Status Bar Footer */}
        <footer className="h-12 bg-white border-t border-slate-200 px-6 md:px-8 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex gap-6 uppercase font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Server: Online
            </span>
            
            {/* Dynamic Sync Status Label */}
            <span className="flex items-center gap-1.5">
              {saveStatus === "saving" && (
                <>
                  <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                  <span className="text-amber-500">Sync: Menyimpan...</span>
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <Cloud className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500">Sync: Tersimpan di Cloud {lastSaved && `(${lastSaved})`}</span>
                </>
              )}
              {saveStatus === "error" && (
                <>
                  <CloudOff className="w-3 h-3 text-rose-500" />
                  <span className="text-rose-500">Sync: Gagal Terkoneksi</span>
                </>
              )}
              {saveStatus === "idle" && (
                <>
                  <Cloud className="w-3 h-3 text-slate-400" />
                  <span>Sync: Aktif</span>
                </>
              )}
            </span>
          </div>
          <div className="font-medium italic hidden lg:block">
            *Formula & resep tersimpan aman di database server hosting mandiri Anda.
          </div>
        </footer>
      </main>

    </div>
  );
}
