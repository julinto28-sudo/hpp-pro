import React, { useMemo, useState } from "react";
import { Material, Labor, Overhead, Product } from "../types";
import { calculateProductHpp, formatRupiah } from "../utils/hppCalculator";
import { 
  DollarSign, 
  Layers, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Settings,
  Scale,
  Percent,
  CheckCircle2,
  BarChart3,
  List,
  Sparkles,
  ArrowUpRight,
  Info,
  HelpCircle,
  Database,
  Trash2
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 shadow-xl text-xs font-sans space-y-2 max-w-sm">
        <p className="font-sans font-bold text-sm border-b border-slate-800 pb-1.5 text-white">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => {
            const isPercent = entry.name.includes("Margin") || entry.name.includes("Target");
            const value = isPercent 
              ? `${entry.value}%` 
              : formatRupiah(entry.value);
            return (
              <p key={index} className="flex justify-between gap-6 items-center">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color || entry.fill }} />
                  {entry.name}:
                </span>
                <span className="font-mono font-bold text-white text-right">{value}</span>
              </p>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

interface DashboardTabProps {
  materials: Material[];
  labors: Labor[];
  overheads: Overhead[];
  products: Product[];
  monthlyVolume: number;
  setMonthlyVolume: (volume: number) => void;
  setActiveTab: (tab: string) => void;
  onResetAll: () => void;
  onLoadDemoData: () => void;
}

export default function DashboardTab({
  materials,
  labors,
  overheads,
  products,
  monthlyVolume,
  setMonthlyVolume,
  setActiveTab,
  onResetAll,
  onLoadDemoData,
}: DashboardTabProps) {
  
  // 1. Calculate Aggregate Statistics
  const stats = useMemo(() => {
    const totalMaterials = materials.length;
    const totalLaborRoles = labors.length;
    
    // Total monthly overhead cost
    const totalMonthlyOverhead = overheads.reduce((sum, o) => sum + o.cost, 0);
    
    // Calculate total overhead allocated per unit under current monthly production volume
    const overheadAllocatedPerUnit = monthlyVolume > 0 ? totalMonthlyOverhead / monthlyVolume : 0;

    let totalProducts = products.length;
    let avgMargin = 0;
    let productsWithLowMarginCount = 0;
    let totalBusinessRevenueSim = 0;
    let totalBusinessCostSim = 0;

    if (totalProducts > 0) {
      let marginSum = 0;
      products.forEach((p) => {
        const hpp = calculateProductHpp(p, materials, labors, overheads, monthlyVolume);
        marginSum += hpp.actualMargin;
        if (hpp.actualMargin < 25) {
          productsWithLowMarginCount++;
        }
        // Assume monthly production volume is split equally or just use individual scale
        totalBusinessRevenueSim += p.sellingPrice * (monthlyVolume / totalProducts);
        totalBusinessCostSim += hpp.hppPerUnit * (monthlyVolume / totalProducts);
      });
      avgMargin = marginSum / totalProducts;
    }

    const projectedMonthlyProfit = totalBusinessRevenueSim - totalBusinessCostSim;

    return {
      totalMaterials,
      totalLaborRoles,
      totalMonthlyOverhead,
      overheadAllocatedPerUnit,
      totalProducts,
      avgMargin,
      productsWithLowMarginCount,
      projectedMonthlyProfit,
      totalBusinessRevenueSim,
    };
  }, [materials, labors, overheads, products, monthlyVolume]);

  // 2. Prepare cost aggregates for the chart (Aggregate average across products)
  const costAggregate = useMemo(() => {
    let materialCostSum = 0;
    let laborCostSum = 0;
    let overheadCostSum = 0;
    let totalHppSum = 0;

    products.forEach((p) => {
      const hpp = calculateProductHpp(p, materials, labors, overheads, monthlyVolume);
      materialCostSum += hpp.totalMaterialCost / p.batchSize;
      laborCostSum += hpp.totalLaborCost / p.batchSize;
      overheadCostSum += hpp.totalOverheadCost / p.batchSize;
      totalHppSum += hpp.hppPerUnit;
    });

    if (totalHppSum === 0) {
      return { materialPct: 0, laborPct: 0, overheadPct: 0 };
    }

    return {
      materialPct: Math.round((materialCostSum / totalHppSum) * 100),
      laborPct: Math.round((laborCostSum / totalHppSum) * 100),
      overheadPct: Math.round((overheadCostSum / totalHppSum) * 100),
    };
  }, [materials, labors, overheads, products, monthlyVolume]);

  const [chartView, setChartView] = useState<"margin" | "structure" | "list">("margin");
  const [targetMarginMode, setTargetMarginMode] = useState<"individual" | "custom">("individual");
  const [customTargetMargin, setCustomTargetMargin] = useState<number>(40);

  const chartData = useMemo(() => {
    return products.map((p) => {
      const hppData = calculateProductHpp(p, materials, labors, overheads, monthlyVolume);
      const hpp = hppData.hppPerUnit;
      const price = p.sellingPrice;
      const margin = hppData.actualMargin;
      const profit = hppData.actualProfitPerUnit;
      
      const matCost = hppData.totalMaterialCost / p.batchSize;
      const labCost = hppData.totalLaborCost / p.batchSize;
      const ovhCost = hppData.totalOverheadCost / p.batchSize;

      return {
        name: p.name,
        margin: parseFloat(margin.toFixed(1)),
        targetMargin: p.targetMargin,
        hpp: Math.round(hpp),
        sellingPrice: Math.round(price),
        profit: Math.round(profit),
        bahanBaku: Math.round(matCost),
        tenagaKerja: Math.round(labCost),
        overhead: Math.round(ovhCost),
      };
    });
  }, [products, materials, labors, overheads, monthlyVolume]);

  return (
    <div className="space-y-8" id="dashboard-tab">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-sans font-bold tracking-tight mb-2">
            Analisis Harga Pokok Penjualan (HPP)
          </h2>
          <p className="text-slate-300 font-sans text-sm md:text-base max-w-xl">
            Selamat datang! Kelola database biaya bahan baku, jam kerja, dan overhead bulanan, lalu hitung HPP produk secara presisi demi margin keuntungan optimal.
          </p>
        </div>
      </div>

      {/* Global Config Card: Monthly production capacity */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-sans font-semibold text-slate-800 flex items-center gap-2">
              Kapasitas Produksi Bulanan
              <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Sangat Penting
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Digunakan untuk membagi biaya overhead bulanan secara otomatis ke setiap unit produk berdasarkan volume produksi Anda.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <input
              type="number"
              id="global-monthly-volume-input"
              value={monthlyVolume || ""}
              onChange={(e) => setMonthlyVolume(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full md:w-44 pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 font-sans font-semibold"
              placeholder="Misal: 500"
              min="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-sans text-slate-400 font-semibold">
              unit
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono hidden md:block">
            BOP Terporsi: {formatRupiah(stats.overheadAllocatedPerUnit)}/unit
          </div>
        </div>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider">
              Total Bahan Baku
            </p>
            <h4 className="text-2xl font-sans font-bold text-slate-800">
              {stats.totalMaterials}
            </h4>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold">Terdaftar</span> dalam database
            </p>
          </div>
          <div className="bg-sky-50 text-sky-600 p-3.5 rounded-2xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider">
              BOP / Overhead Bulanan
            </p>
            <h4 className="text-2xl font-sans font-bold text-slate-800">
              {formatRupiah(stats.totalMonthlyOverhead)}
            </h4>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              Alokasi: <span className="font-semibold">{formatRupiah(stats.overheadAllocatedPerUnit)}</span> /unit
            </p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider">
              Rata-rata Margin Kotor
            </p>
            <h4 className="text-2xl font-sans font-bold text-slate-800">
              {stats.avgMargin.toFixed(1)}%
            </h4>
            <p className="text-xs text-slate-400">
              {stats.productsWithLowMarginCount > 0 ? (
                <span className="text-rose-500 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 inline" />
                  {stats.productsWithLowMarginCount} Produk margin tipis
                </span>
              ) : (
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 inline" />
                  Seluruh margin sehat
                </span>
              )}
            </p>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider">
              Simulasi Profit Bulanan
            </p>
            <h4 className="text-2xl font-sans font-bold text-slate-800">
              {formatRupiah(stats.projectedMonthlyProfit)}
            </h4>
            <p className="text-xs text-slate-400">
              Berdasarkan kapasitas produksi bulanan
            </p>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3.5 rounded-2xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Sections: Bento Style Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cost Structure Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-sans font-bold text-slate-800">
              Rata-rata Struktur Biaya HPP
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Proporsi gabungan komponen HPP pada seluruh produk Anda.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-sans text-sm flex flex-col items-center justify-center gap-2">
              <Layers className="w-10 h-10 text-slate-200" />
              Belum ada produk yang dihitung.
            </div>
          ) : (
            <div className="my-6 space-y-6">
              {/* Custom SVG Donut or Progress Bars */}
              <div className="flex justify-center items-center h-40 relative">
                {/* Custom circular progress SVG */}
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-100"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Bahan Baku Segment */}
                  {costAggregate.materialPct > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-sky-500 transition-all duration-500"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - costAggregate.materialPct / 100)}`}
                    />
                  )}
                  {/* Tenaga Kerja Segment */}
                  {costAggregate.laborPct > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-indigo-500 transition-all duration-500"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - (costAggregate.materialPct + costAggregate.laborPct) / 100)}`}
                    />
                  )}
                  {/* Overhead Segment */}
                  {costAggregate.overheadPct > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-emerald-500 transition-all duration-500"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - (costAggregate.materialPct + costAggregate.laborPct + costAggregate.overheadPct) / 100)}`}
                    />
                  )}
                </svg>
                {/* Center label */}
                <div className="absolute text-center">
                  <span className="text-xl font-sans font-extrabold text-slate-800">HPP</span>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Komponen</p>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-50 text-center">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-slate-600 justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    Bahan Baku
                  </span>
                  <p className="text-base font-sans font-bold text-slate-800">
                    {costAggregate.materialPct}%
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-slate-600 justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    Pekerja
                  </span>
                  <p className="text-base font-sans font-bold text-slate-800">
                    {costAggregate.laborPct}%
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-slate-600 justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Overhead
                  </span>
                  <p className="text-base font-sans font-bold text-slate-800">
                    {costAggregate.overheadPct}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Pricing Comparison Graph */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-lg font-sans font-bold text-slate-800">
                Analisis Margin & Perbandingan Harga
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Visualisasi interaktif margin keuntungan dan rincian harga jual produk Anda.
              </p>
            </div>
            
            {/* View Selector Tabs */}
            {products.length > 0 && (
              <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-center">
                <button
                  onClick={() => setChartView("margin")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition cursor-pointer ${
                    chartView === "margin"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  Margin (%)
                </button>
                <button
                  onClick={() => setChartView("structure")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition cursor-pointer ${
                    chartView === "structure"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Struktur Biaya (Rp)
                </button>
                <button
                  onClick={() => setChartView("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition cursor-pointer ${
                    chartView === "list"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  List Detail
                </button>
              </div>
            )}
          </div>

          {products.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-sans text-sm flex flex-col items-center justify-center gap-2">
              <TrendingUp className="w-10 h-10 text-slate-200" />
              Selesaikan input di tab Bahan Baku, Tenaga Kerja, & Overhead terlebih dahulu.
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center min-h-[320px]">
              {chartView === "margin" && (
                <div className="h-80 w-full" id="margin-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748B" 
                        fontSize={10} 
                        fontWeight={500}
                        tickLine={false} 
                      />
                      <YAxis 
                        stroke="#64748B" 
                        fontSize={10} 
                        fontWeight={500}
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(val) => `${val}%`}
                        domain={[0, 100]}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                      <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                      <ReferenceLine y={25} stroke="#FDA4AF" strokeDasharray="3 3" label={{ value: 'Margin Tipis (25%)', fill: '#E11D48', fontSize: 9, position: 'top' }} />
                      <Bar dataKey="margin" name="Margin Keuntungan" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => {
                          let color = "#10B981"; // Emerald-500 for high margin
                          if (entry.margin < 25) {
                            color = "#F43F5E"; // Rose-500 for thin margin
                          } else if (entry.margin < 40) {
                            color = "#F59E0B"; // Amber-500 for medium margin
                          }
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                      <Bar dataKey="targetMargin" name="Target Margin" fill="#6366F1" radius={[4, 4, 0, 0]} opacity={0.4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {chartView === "structure" && (
                <div className="h-80 w-full" id="structure-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748B" 
                        fontSize={10} 
                        fontWeight={500}
                        tickLine={false} 
                      />
                      <YAxis 
                        stroke="#64748B" 
                        fontSize={10} 
                        fontWeight={500}
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(val) => `Rp ${val >= 1000 ? (val/1000) + 'k' : val}`}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                      <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                      <Bar dataKey="bahanBaku" name="Bahan Baku" stackId="cost" fill="#38BDF8" />
                      <Bar dataKey="tenagaKerja" name="Tenaga Kerja" stackId="cost" fill="#6366F1" />
                      <Bar dataKey="overhead" name="Overhead (BOP)" stackId="cost" fill="#34D399" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="sellingPrice" name="Harga Jual" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {chartView === "list" && (
                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                  {products.map((p) => {
                    const hppData = calculateProductHpp(p, materials, labors, overheads, monthlyVolume);
                    const hpp = hppData.hppPerUnit;
                    const price = p.sellingPrice;
                    const margin = hppData.actualMargin;
                    
                    // Calculate percentage widths for horizontal comparison bars
                    const maxVal = Math.max(...products.map(prod => prod.sellingPrice), 1);
                    const hppWidth = Math.min(100, Math.max(8, (hpp / maxVal) * 100));
                    const priceWidth = Math.min(100, Math.max(8, (price / maxVal) * 100));

                    return (
                      <div key={p.id} className="space-y-2 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-sans font-semibold text-slate-700 truncate max-w-[180px] md:max-w-xs">
                            {p.name}
                          </span>
                          <span className={`text-xs font-sans font-bold px-2 py-0.5 rounded-full ${
                            margin < 25 
                              ? "bg-rose-50 text-rose-600" 
                              : margin < 40 
                                ? "bg-amber-50 text-amber-600" 
                                : "bg-emerald-50 text-emerald-600"
                          }`}>
                            Margin {margin.toFixed(0)}%
                          </span>
                        </div>
                        
                        <div className="space-y-1.5">
                          {/* HPP Bar */}
                          <div className="flex items-center gap-2">
                            <div className="w-14 text-[10px] font-sans text-slate-400 font-bold uppercase">HPP</div>
                            <div className="flex-1 bg-slate-50 h-5 rounded-md overflow-hidden relative">
                              <div 
                                style={{ width: `${hppWidth}%` }} 
                                className="bg-slate-300 hover:bg-slate-400 transition-all duration-500 h-full rounded-md flex items-center pl-2"
                              >
                                <span className="text-[10px] text-slate-800 font-mono font-bold">
                                  {formatRupiah(hpp)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Selling Price Bar */}
                          <div className="flex items-center gap-2">
                            <div className="w-14 text-[10px] font-sans text-slate-400 font-bold uppercase">JUAL</div>
                            <div className="flex-1 bg-slate-50 h-5 rounded-md overflow-hidden relative">
                              <div 
                                style={{ width: `${priceWidth}%` }} 
                                className="bg-emerald-500 hover:bg-emerald-600 transition-all duration-500 h-full rounded-md flex items-center pl-2"
                              >
                                <span className="text-[10px] text-white font-mono font-bold">
                                  {formatRupiah(price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Smart Pricing & Profit Recommendations Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6 animate-fade-in" id="pricing-recommendations-panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h3 className="text-lg font-sans font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              Kalkulator & Prediksi Harga Jual Ideal
            </h3>
            <p className="text-xs text-slate-500">
              Analisis cerdas berdasarkan target margin untuk mengoptimalkan profitabilitas bisnis Anda.
            </p>
          </div>

          {/* Config Controls */}
          {products.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTargetMarginMode("individual")}
                className={`px-3.5 py-2 rounded-xl text-xs font-sans font-bold transition cursor-pointer ${
                  targetMarginMode === "individual"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Gunakan Target Produk (%)
              </button>
              <button
                onClick={() => setTargetMarginMode("custom")}
                className={`px-3.5 py-2 rounded-xl text-xs font-sans font-bold transition cursor-pointer ${
                  targetMarginMode === "custom"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Simulasi Margin Global (%)
              </button>
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-sans text-sm flex flex-col items-center justify-center gap-2">
            <Sparkles className="w-10 h-10 text-slate-200" />
            Input produk terlebih dahulu untuk melihat rekomendasi harga jual.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Custom margin slider if custom mode is active */}
            {targetMarginMode === "custom" && (
              <div className="bg-slate-50 rounded-xl p-4 md:p-5 border border-slate-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-sans font-bold text-slate-700 block">
                      Tentukan Target Margin Keuntungan Global
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Geser untuk mensimulasikan harga jual ideal pada seluruh produk Anda sekaligus.
                    </span>
                  </div>
                  <div className="bg-indigo-50 text-indigo-700 font-mono font-extrabold text-lg px-4 py-1.5 rounded-xl border border-indigo-100 shrink-0 self-start sm:self-center">
                    {customTargetMargin}% Margin
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-slate-400">10%</span>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={customTargetMargin}
                    onChange={(e) => setCustomTargetMargin(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-xs font-mono text-slate-400">80%</span>
                </div>

                {/* Pre-defined target margin strategies */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/40">
                  <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider mr-2">Strategi Industri:</span>
                  <button
                    onClick={() => setCustomTargetMargin(25)}
                    className="bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
                  >
                    Volume Tinggi (25%)
                  </button>
                  <button
                    onClick={() => setCustomTargetMargin(40)}
                    className="bg-white hover:bg-slate-100 text-indigo-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-indigo-100 transition cursor-pointer"
                  >
                    Sweet Spot UMKM (40%)
                  </button>
                  <button
                    onClick={() => setCustomTargetMargin(55)}
                    className="bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
                  >
                    Premium / Specialty (55%)
                  </button>
                </div>
              </div>
            )}

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => {
                const hppData = calculateProductHpp(p, materials, labors, overheads, monthlyVolume);
                const hpp = hppData.hppPerUnit;
                const currentPrice = p.sellingPrice;
                const activeMarginTarget = targetMarginMode === "individual" ? p.targetMargin : customTargetMargin;

                // Calculate Suggested Price: HPP / (1 - Margin%)
                const marginFrac = activeMarginTarget / 100;
                let suggestedPriceRaw = 0;
                if (marginFrac < 1) {
                  suggestedPriceRaw = hpp / (1 - marginFrac);
                } else {
                  suggestedPriceRaw = hpp * 2;
                }

                // Smart Rounding to nearest Rp 500 for Indonesian context
                let suggestedPrice = suggestedPriceRaw;
                if (suggestedPrice > 1000) {
                  suggestedPrice = Math.round(suggestedPriceRaw / 500) * 500;
                } else {
                  suggestedPrice = Math.round(suggestedPriceRaw / 100) * 100;
                }

                const suggestedProfit = suggestedPrice - hpp;
                const currentProfit = currentPrice - hpp;
                const isUnderpriced = currentPrice < suggestedPrice;
                const priceDiff = suggestedPrice - currentPrice;
                const priceDiffPct = currentPrice > 0 ? (priceDiff / currentPrice) * 100 : 100;
                
                // Volume for this product in simulation
                const vol = products.length > 0 ? monthlyVolume / products.length : 0;
                const currentMonthlyProductProfit = currentProfit * vol;
                const suggestedMonthlyProductProfit = suggestedProfit * vol;

                return (
                  <div 
                    key={p.id} 
                    className={`rounded-2xl border p-5 transition flex flex-col justify-between h-full space-y-4 ${
                      isUnderpriced 
                        ? "border-amber-200 bg-amber-50/5 hover:border-amber-300 shadow-sm" 
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    {/* Header */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-sm font-sans font-bold text-slate-800 line-clamp-1">
                          {p.name}
                        </span>
                        <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          activeMarginTarget < 25 
                            ? "bg-rose-50 text-rose-600 border border-rose-100" 
                            : activeMarginTarget < 45 
                              ? "bg-indigo-50 text-indigo-600 border border-indigo-100" 
                              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        }`}>
                          Target {activeMarginTarget}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-sans">
                        <span>HPP:</span>
                        <span className="font-mono font-bold text-slate-700">{formatRupiah(hpp)}</span>
                        <span className="text-slate-300">|</span>
                        <span>Isi batch: {p.batchSize} unit</span>
                      </div>
                    </div>

                    {/* Price Comparison Block */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">
                          Harga Sekarang
                        </span>
                        <span className="text-sm font-mono font-extrabold text-slate-600 block">
                          {formatRupiah(currentPrice)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          Profit: {formatRupiah(currentProfit)}
                        </span>
                      </div>
                      <div className="space-y-0.5 border-l border-slate-200/60 pl-3">
                        <span className="text-[10px] text-indigo-500 font-sans font-bold uppercase block flex items-center justify-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Rekomendasi
                        </span>
                        <span className="text-sm font-mono font-extrabold text-slate-900 block">
                          {formatRupiah(suggestedPrice)}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-sans font-bold block">
                          Profit: {formatRupiah(suggestedProfit)}
                        </span>
                      </div>
                    </div>

                    {/* Simulation metrics for monthly profit */}
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-sans">Proyeksi Laba Bulanan ({Math.round(vol)} unit):</span>
                        <div className="text-right">
                          <span className="text-slate-500 font-mono text-[11px] block line-through">
                            {formatRupiah(currentMonthlyProductProfit)}
                          </span>
                          <span className="font-mono font-bold text-slate-800 text-xs block">
                            {formatRupiah(suggestedMonthlyProductProfit)}
                          </span>
                        </div>
                      </div>

                      {/* Diagnostic status badge */}
                      <div className="pt-1">
                        {isUnderpriced ? (
                          <div className="flex items-center gap-1.5 text-[10px] font-sans font-semibold text-amber-800 bg-amber-100/50 border border-amber-200/30 rounded-lg px-2.5 py-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>
                              Naikkan harga {formatRupiah(priceDiff)} ({priceDiffPct.toFixed(0)}%) untuk profit sehat.
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] font-sans font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>
                              Sesuai target! Margin sekarang ({hppData.actualMargin.toFixed(0)}%) aman.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simulation Aggregate Summary Box */}
            <div className="bg-gradient-to-r from-indigo-50/60 to-sky-50/60 rounded-2xl p-5 border border-indigo-100/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-sans font-bold text-indigo-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Estimasi Kenaikan Profit Bersih Bisnis Anda
                </h4>
                <p className="text-xs text-indigo-700/80 max-w-2xl leading-relaxed">
                  Jika Anda menerapkan Harga Rekomendasi di atas pada kapasitas produksi bulanan Anda (<span className="font-bold">{monthlyVolume} unit</span> total), maka total laba kotor bulanan Anda diproyeksikan meningkat dari <span className="font-semibold">{formatRupiah(stats.projectedMonthlyProfit)}</span> menjadi:
                </p>
              </div>
              <div className="bg-white rounded-xl px-4 py-3 border border-indigo-100 shrink-0 self-start md:self-center shadow-sm">
                <span className="text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider block">PROYEKSI TOTAL PROFIT BARU</span>
                <span className="text-lg font-mono font-extrabold text-indigo-600 block">
                  {formatRupiah(
                    products.reduce((sum, p) => {
                      const hppData = calculateProductHpp(p, materials, labors, overheads, monthlyVolume);
                      const hpp = hppData.hppPerUnit;
                      const activeMarginTarget = targetMarginMode === "individual" ? p.targetMargin : customTargetMargin;
                      
                      const marginFrac = activeMarginTarget / 100;
                      let suggestedPriceRaw = marginFrac < 1 ? hpp / (1 - marginFrac) : hpp * 2;
                      let suggestedPrice = suggestedPriceRaw;
                      if (suggestedPrice > 1000) {
                        suggestedPrice = Math.round(suggestedPriceRaw / 500) * 500;
                      } else {
                        suggestedPrice = Math.round(suggestedPriceRaw / 100) * 100;
                      }

                      const suggestedProfit = suggestedPrice - hpp;
                      const vol = monthlyVolume / products.length;
                      return sum + (suggestedProfit * vol);
                    }, 0)
                  )}
                </span>
                <span className="text-[10px] text-emerald-600 font-sans font-bold block mt-0.5">
                  Selisih Kenaikan: +{formatRupiah(
                    Math.max(0, 
                      products.reduce((sum, p) => {
                        const hppData = calculateProductHpp(p, materials, labors, overheads, monthlyVolume);
                        const hpp = hppData.hppPerUnit;
                        const activeMarginTarget = targetMarginMode === "individual" ? p.targetMargin : customTargetMargin;
                        
                        const marginFrac = activeMarginTarget / 100;
                        let suggestedPriceRaw = marginFrac < 1 ? hpp / (1 - marginFrac) : hpp * 2;
                        let suggestedPrice = suggestedPriceRaw;
                        if (suggestedPrice > 1000) {
                          suggestedPrice = Math.round(suggestedPriceRaw / 500) * 500;
                        } else {
                          suggestedPrice = Math.round(suggestedPriceRaw / 100) * 100;
                        }

                        const suggestedProfit = suggestedPrice - hpp;
                        const vol = monthlyVolume / products.length;
                        return sum + (suggestedProfit * vol);
                      }, 0) - stats.projectedMonthlyProfit
                    )
                  )} / bulan
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Grid: Advice + Data Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Strategic cost advice banner */}
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col justify-between gap-6">
          <div className="flex gap-4 items-start">
            <div className="bg-white text-slate-800 p-3 rounded-xl border border-slate-200/60 shadow-sm shrink-0">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-sans font-bold text-slate-800">
                Optimalkan Margin dengan "Skala Ekonomi"
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Saat Anda meningkatkan volume produksi bulanan di kotak atas, beban biaya overhead tetap bulanan (seperti sewa gedung atau penyusutan mixer) akan dibagi ke lebih banyak unit produk. Hal ini secara otomatis menurunkan HPP per unit dan melambungkan laba bersih Anda tanpa menaikkan harga jual!
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("products")}
            className="bg-slate-900 hover:bg-slate-800 text-white font-sans font-medium text-xs px-4.5 py-3 rounded-xl w-full sm:w-fit text-center transition cursor-pointer self-start lg:self-end"
          >
            Lihat Simulasi Produk
          </button>
        </div>

        {/* Data Management Card */}
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col justify-between gap-6">
          <div className="flex gap-4 items-start">
            <div className="bg-white text-slate-800 p-3 rounded-xl border border-slate-200/60 shadow-sm shrink-0">
              <Database className="w-6 h-6 text-rose-600" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-sans font-bold text-slate-800">
                Manajemen Data Aplikasi (Reset / Demo)
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kosongkan seluruh database (Bahan baku, Pekerja, BOP, dan Produk) untuk memasukkan data resep kuliner Anda sendiri dari awal, atau muat ulang data contoh (demo) kapan saja.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2.5 w-full">
            <button
              onClick={() => {
                if (window.confirm("Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan dan akan mengosongkan seluruh database Anda saat ini.")) {
                  onResetAll();
                  alert("Berhasil menghapus seluruh data! Sekarang database Anda bersih dan kosong.");
                }
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-sans font-bold px-3.5 py-2.5 rounded-xl transition text-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Kosongkan Semua Data
            </button>
            <button
              onClick={() => {
                if (window.confirm("Apakah Anda yakin ingin memuat ulang data demo kuliner? Tindakan ini akan menimpa data Anda saat ini dengan resep simulasi Roti Tawar Butter Premium bawaan.")) {
                  onLoadDemoData();
                  alert("Berhasil memuat ulang data demo kuliner!");
                }
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 font-sans font-bold px-3.5 py-2.5 rounded-xl transition text-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Muat Ulang Data Demo
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
