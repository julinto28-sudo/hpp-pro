import { Material, Labor, Overhead, Product, HppBreakdown } from "../types";

export function calculateProductHpp(
  product: Product,
  materialsList: Material[],
  laborList: Labor[],
  overheadsList: Overhead[],
  monthlyProductionVolume: number // Kapasitas produksi bulanan untuk alokasi overhead
): HppBreakdown {
  const batchSize = product.batchSize || 1;

  // 1. Hitung Biaya Bahan Baku
  let totalMaterialCost = 0;
  product.materials.forEach((comp) => {
    const mat = materialsList.find((m) => m.id === comp.materialId);
    if (mat) {
      const costPerUnit = mat.purchasePrice / (mat.packageSize || 1);
      totalMaterialCost += comp.quantityUsed * costPerUnit;
    }
  });

  // 2. Hitung Biaya Tenaga Kerja Langsung
  let totalLaborCost = 0;
  product.labors.forEach((comp) => {
    const lab = laborList.find((l) => l.id === comp.laborId);
    if (lab) {
      totalLaborCost += comp.timeOrQty * lab.rate;
    }
  });

  // 3. Hitung Biaya Overhead Pabrik (BOP)
  let totalOverheadCost = 0;
  product.overheads.forEach((comp) => {
    if (comp.isAutomatic) {
      // Alokasi otomatis: (Biaya overhead per bulan / Volume produksi bulanan) * Ukuran Batch
      const overhead = overheadsList.find((o) => o.id === comp.overheadId);
      if (overhead && monthlyProductionVolume > 0) {
        const costPerUnit = overhead.cost / monthlyProductionVolume;
        totalOverheadCost += costPerUnit * batchSize;
      }
    } else {
      totalOverheadCost += comp.manualCost || 0;
    }
  });

  const totalBatchCost = totalMaterialCost + totalLaborCost + totalOverheadCost;
  const hppPerUnit = totalBatchCost / batchSize;

  // Suggested Selling Price based on Target Margin: Harga Jual = HPP / (1 - Margin%)
  const marginFrac = product.targetMargin / 100;
  let suggestedSellingPrice = 0;
  if (marginFrac < 1) {
    suggestedSellingPrice = hppPerUnit / (1 - marginFrac);
  } else {
    suggestedSellingPrice = hppPerUnit * 2; // Fallback jika target margin 100% atau lebih
  }

  const actualProfitPerUnit = product.sellingPrice - hppPerUnit;
  const actualMargin = product.sellingPrice > 0 
    ? (actualProfitPerUnit / product.sellingPrice) * 100 
    : 0;

  return {
    totalMaterialCost,
    totalLaborCost,
    totalOverheadCost,
    totalBatchCost,
    hppPerUnit,
    suggestedSellingPrice,
    actualProfitPerUnit,
    actualMargin,
  };
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
