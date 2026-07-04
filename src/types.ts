export interface Material {
  id: string;
  name: string;
  purchasePrice: number; // Harga beli total
  packageSize: number; // Ukuran/berat kemasan (misal 1000)
  unit: string; // Satuan kemasan (misal "gram", "ml", "pcs", "meter")
  costPerUnit: number; // Harga per satuan (derived: purchasePrice / packageSize)
  notes?: string;
}

export interface Labor {
  id: string;
  role: string; // Nama peran/pekerja (misal "Staf Produksi", "Koki")
  rate: number; // Tarif upah
  rateType: "hour" | "day" | "unit"; // Per jam, per hari, atau per unit produk
  description?: string;
}

export interface Overhead {
  id: string;
  name: string; // Nama biaya overhead (misal "Listrik", "Sewa Tempat", "Penyusutan Alat")
  cost: number; // Nilai biaya per bulan
  description?: string;
}

export interface ProductMaterialComponent {
  materialId: string;
  quantityUsed: number; // Jumlah yang digunakan dalam resep/batch
}

export interface ProductLaborComponent {
  laborId: string;
  timeOrQty: number; // Waktu (jam) atau kuantitas unit yang dikerjakan per resep/batch
}

export interface ProductOverheadComponent {
  overheadId: string;
  isAutomatic: boolean; // Jika true, biaya dialokasikan otomatis dari database overhead bulanan
  manualCost?: number; // Jika isAutomatic false, gunakan nilai manual ini
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  batchSize: number; // Ukuran batch produksi (misal resep untuk menghasilkan 10 pcs roti)
  materials: ProductMaterialComponent[];
  labors: ProductLaborComponent[];
  overheads: ProductOverheadComponent[];
  targetMargin: number; // Target Margin Kotor dalam persen (misal 40)
  sellingPrice: number; // Harga jual aktual per unit produk
  createdAt: string;
  updatedAt: string;
}

export interface HppBreakdown {
  totalMaterialCost: number;
  totalLaborCost: number;
  totalOverheadCost: number;
  totalBatchCost: number;
  hppPerUnit: number;
  suggestedSellingPrice: number; // Berdasarkan targetMargin
  actualProfitPerUnit: number; // sellingPrice - hppPerUnit
  actualMargin: number; // ((sellingPrice - hppPerUnit) / sellingPrice) * 100
}
