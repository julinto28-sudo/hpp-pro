import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Material, Labor, Overhead, Product } from "../types";

// Path to the JSON database store in the root of the project
const DB_PATH = path.join(process.cwd(), "db-store.json");
const JWT_SECRET = process.env.JWT_SECRET || "hpp_master_super_secret_key_12345!";

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  securityQuestion?: string;
  securityAnswerHash?: string;
}

export interface UserData {
  materials: Material[];
  labors: Labor[];
  overheads: Overhead[];
  products: Product[];
  monthlyVolume: number;
}

interface DatabaseSchema {
  users: User[];
  userData: Record<string, UserData>;
}

// Indonesian Culinary Mockup Seed Data for new users
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

const emptyUserData: UserData = {
  materials: initialMaterials,
  labors: initialLabors,
  overheads: initialOverheads,
  products: initialProducts,
  monthlyVolume: 1000,
};

// Initialize or load database from file
function loadDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Gagal membaca database file, menginisialisasi baru:", error);
  }
  
  const initialDb: DatabaseSchema = {
    users: [],
    userData: {}
  };
  saveDb(initialDb);
  return initialDb;
}

function saveDb(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (error) {
    console.error("Gagal menyimpan database file:", error);
  }
}

// Password Hashing and Crypto helper
export function hashPassword(password: string, salt: string): string {
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

// Pure-Node JWT Implementation (Base64url token signing with HS256)
export function generateToken(payload: { userId: string; username: string }, secret: string = JWT_SECRET): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 })).toString("base64url");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${header}.${data}`);
  const signature = hmac.digest("base64url");
  return `${header}.${data}.${signature}`;
}

export function verifyToken(token: string, secret: string = JWT_SECRET): { userId: string; username: string } | null {
  try {
    const [header, data, signature] = token.split(".");
    if (!header || !data || !signature) return null;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${header}.${data}`);
    const expectedSignature = hmac.digest("base64url");
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (payload.exp && payload.exp < Date.now()) {
      return null; // Expired
    }
    return { userId: payload.userId, username: payload.username };
  } catch (err) {
    return null;
  }
}

// DB Query & Mutate Methods
export const dbOps = {
  findUserByUsername(username: string): User | undefined {
    const db = loadDb();
    const normalized = username.toLowerCase().trim();
    return db.users.find(u => u.username.toLowerCase() === normalized);
  },

  createUser(username: string, passwordPlain: string, securityQuestion?: string, securityAnswerPlain?: string): User {
    const db = loadDb();
    const salt = generateSalt();
    const passwordHash = hashPassword(passwordPlain, salt);
    const id = "user_" + crypto.randomBytes(8).toString("hex");
    
    const newUser: User = {
      id,
      username: username.trim(),
      passwordHash,
      salt,
      createdAt: new Date().toISOString()
    };

    if (securityQuestion && securityAnswerPlain) {
      newUser.securityQuestion = securityQuestion;
      newUser.securityAnswerHash = hashPassword(securityAnswerPlain.toLowerCase().trim(), salt);
    }

    db.users.push(newUser);
    // Seed new user with default demo data so they have a starting template!
    db.userData[id] = JSON.parse(JSON.stringify(emptyUserData));
    
    saveDb(db);
    return newUser;
  },

  resetPassword(username: string, securityQuestion: string, securityAnswerPlain: string, newPasswordPlain: string): User {
    const db = loadDb();
    const normalized = username.toLowerCase().trim();
    const user = db.users.find(u => u.username.toLowerCase() === normalized);
    if (!user) {
      throw new Error("Username tidak ditemukan.");
    }

    if (!user.securityQuestion || !user.securityAnswerHash) {
      throw new Error("Akun ini belum mengonfigurasi pertanyaan keamanan. Silakan hubungi admin.");
    }

    if (user.securityQuestion !== securityQuestion) {
      throw new Error("Pertanyaan keamanan tidak cocok dengan yang didaftarkan.");
    }

    const answerHash = hashPassword(securityAnswerPlain.toLowerCase().trim(), user.salt);
    if (answerHash !== user.securityAnswerHash) {
      throw new Error("Jawaban keamanan salah.");
    }

    // Reset password hash
    user.passwordHash = hashPassword(newPasswordPlain, user.salt);
    saveDb(db);
    return user;
  },

  updateUserSecurity(username: string, securityQuestion: string, securityAnswerPlain: string): User {
    const db = loadDb();
    const normalized = username.toLowerCase().trim();
    const user = db.users.find(u => u.username.toLowerCase() === normalized);
    if (!user) {
      throw new Error("Username tidak ditemukan.");
    }

    user.securityQuestion = securityQuestion;
    user.securityAnswerHash = hashPassword(securityAnswerPlain.toLowerCase().trim(), user.salt);
    saveDb(db);
    return user;
  },

  getUserData(userId: string): UserData {
    const db = loadDb();
    if (!db.userData[userId]) {
      db.userData[userId] = JSON.parse(JSON.stringify(emptyUserData));
      saveDb(db);
    }
    return db.userData[userId];
  },

  updateUserData(userId: string, data: Partial<UserData>): UserData {
    const db = loadDb();
    const current = db.userData[userId] || JSON.parse(JSON.stringify(emptyUserData));
    
    db.userData[userId] = {
      materials: data.materials !== undefined ? data.materials : current.materials,
      labors: data.labors !== undefined ? data.labors : current.labors,
      overheads: data.overheads !== undefined ? data.overheads : current.overheads,
      products: data.products !== undefined ? data.products : current.products,
      monthlyVolume: data.monthlyVolume !== undefined ? data.monthlyVolume : current.monthlyVolume,
    };

    saveDb(db);
    return db.userData[userId];
  }
};
