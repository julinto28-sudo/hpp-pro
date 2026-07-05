var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);

// src/server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var DB_PATH = import_path.default.join(process.cwd(), "db-store.json");
var JWT_SECRET = process.env.JWT_SECRET || "hpp_master_super_secret_key_12345!";
var initialMaterials = [
  { id: "mat_1", name: "Tepung Terigu Cakra Kembar", purchasePrice: 18e3, packageSize: 1e3, unit: "gram", costPerUnit: 18, notes: "Beli kartonan di Grosir Sinar Abadi" },
  { id: "mat_2", name: "Mentega Butter Wysman", purchasePrice: 145e3, packageSize: 500, unit: "gram", costPerUnit: 290, notes: "Mentega premium import untuk rasa maksimal" },
  { id: "mat_3", name: "Gula Pasir Gulaku", purchasePrice: 175e3, packageSize: 1e4, unit: "gram", costPerUnit: 17.5, notes: "Kemasan karung isi 10 kg" },
  { id: "mat_4", name: "Kuning Telur Ayam Ras", purchasePrice: 32e3, packageSize: 1e3, unit: "gram", costPerUnit: 32, notes: "Diambil dari supplier lokal segar harian" },
  { id: "mat_5", name: "Ragi Instan Fermipan", purchasePrice: 6500, packageSize: 44, unit: "gram", costPerUnit: 147.7, notes: "Sachet kecil isi 44 gram" },
  { id: "mat_6", name: "Kotak Dus Box Premium", purchasePrice: 3500, packageSize: 1, unit: "pcs", costPerUnit: 3500, notes: "Cetak logo emas di percetakan Jaya" }
];
var initialLabors = [
  { id: "lab_1", role: "Baker Utama (Kepala Dapur)", rate: 25e3, rateType: "hour", description: "Mengatur resep dan proses pemanggangan adonan utama" },
  { id: "lab_2", role: "Staf Packer / Finishing", rate: 15e3, rateType: "hour", description: "Melakukan quality control dan memasukkan roti ke kemasan dus" }
];
var initialOverheads = [
  { id: "oh_1", name: "Sewa Ruko Dapur Produksi", cost: 2e6, description: "Dibayar tahunan, diamortisasi bulanan" },
  { id: "oh_2", name: "Listrik & Air Pabrik", cost: 75e4, description: "Beban daya mixer industri dan pompa air bersih" },
  { id: "oh_3", name: "Penyusutan Oven & Mixer", cost: 5e5, description: "Depresiasi alat produksi metode garis lurus" },
  { id: "oh_4", name: "Gas Elpiji 12kg (Dapur)", cost: 25e4, description: "Rata-rata habis 1 tabung per minggu" }
];
var initialProducts = [
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
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1e3).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var emptyUserData = {
  materials: initialMaterials,
  labors: initialLabors,
  overheads: initialOverheads,
  products: initialProducts,
  monthlyVolume: 1e3
};
function loadDb() {
  try {
    if (import_fs.default.existsSync(DB_PATH)) {
      const data = import_fs.default.readFileSync(DB_PATH, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Gagal membaca database file, menginisialisasi baru:", error);
  }
  const initialDb = {
    users: [],
    userData: {}
  };
  saveDb(initialDb);
  return initialDb;
}
function saveDb(db) {
  try {
    import_fs.default.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (error) {
    console.error("Gagal menyimpan database file:", error);
  }
}
function hashPassword(password, salt) {
  return import_crypto.default.createHmac("sha256", salt).update(password).digest("hex");
}
function generateSalt() {
  return import_crypto.default.randomBytes(16).toString("hex");
}
function generateToken(payload, secret = JWT_SECRET) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 30 * 24 * 60 * 60 * 1e3 })).toString("base64url");
  const hmac = import_crypto.default.createHmac("sha256", secret);
  hmac.update(`${header}.${data}`);
  const signature = hmac.digest("base64url");
  return `${header}.${data}.${signature}`;
}
function verifyToken(token, secret = JWT_SECRET) {
  try {
    const [header, data, signature] = token.split(".");
    if (!header || !data || !signature) return null;
    const hmac = import_crypto.default.createHmac("sha256", secret);
    hmac.update(`${header}.${data}`);
    const expectedSignature = hmac.digest("base64url");
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (payload.exp && payload.exp < Date.now()) {
      return null;
    }
    return { userId: payload.userId, username: payload.username };
  } catch (err) {
    return null;
  }
}
var dbOps = {
  findUserByUsername(username) {
    const db = loadDb();
    const normalized = username.toLowerCase().trim();
    return db.users.find((u) => u.username.toLowerCase() === normalized);
  },
  createUser(username, passwordPlain, securityQuestion, securityAnswerPlain) {
    const db = loadDb();
    const salt = generateSalt();
    const passwordHash = hashPassword(passwordPlain, salt);
    const id = "user_" + import_crypto.default.randomBytes(8).toString("hex");
    const newUser = {
      id,
      username: username.trim(),
      passwordHash,
      salt,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (securityQuestion && securityAnswerPlain) {
      newUser.securityQuestion = securityQuestion;
      newUser.securityAnswerHash = hashPassword(securityAnswerPlain.toLowerCase().trim(), salt);
    }
    db.users.push(newUser);
    db.userData[id] = JSON.parse(JSON.stringify(emptyUserData));
    saveDb(db);
    return newUser;
  },
  resetPassword(username, securityQuestion, securityAnswerPlain, newPasswordPlain) {
    const db = loadDb();
    const normalized = username.toLowerCase().trim();
    const user = db.users.find((u) => u.username.toLowerCase() === normalized);
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
    user.passwordHash = hashPassword(newPasswordPlain, user.salt);
    saveDb(db);
    return user;
  },
  updateUserSecurity(username, securityQuestion, securityAnswerPlain) {
    const db = loadDb();
    const normalized = username.toLowerCase().trim();
    const user = db.users.find((u) => u.username.toLowerCase() === normalized);
    if (!user) {
      throw new Error("Username tidak ditemukan.");
    }
    user.securityQuestion = securityQuestion;
    user.securityAnswerHash = hashPassword(securityAnswerPlain.toLowerCase().trim(), user.salt);
    saveDb(db);
    return user;
  },
  getUserData(userId) {
    const db = loadDb();
    if (!db.userData[userId]) {
      db.userData[userId] = JSON.parse(JSON.stringify(emptyUserData));
      saveDb(db);
    }
    return db.userData[userId];
  },
  updateUserData(userId, data) {
    const db = loadDb();
    const current = db.userData[userId] || JSON.parse(JSON.stringify(emptyUserData));
    db.userData[userId] = {
      materials: data.materials !== void 0 ? data.materials : current.materials,
      labors: data.labors !== void 0 ? data.labors : current.labors,
      overheads: data.overheads !== void 0 ? data.overheads : current.overheads,
      products: data.products !== void 0 ? data.products : current.products,
      monthlyVolume: data.monthlyVolume !== void 0 ? data.monthlyVolume : current.monthlyVolume
    };
    saveDb(db);
    return db.userData[userId];
  }
};

// server.ts
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
  const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Otorisasi ditolak. Silakan login terlebih dahulu." });
    }
    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: "Sesi login kedaluwarsa atau tidak valid. Silakan login kembali." });
    }
    req.user = payload;
    next();
  };
  app.post("/api/auth/register", (req, res) => {
    try {
      const { username, password, securityQuestion, securityAnswer } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username dan password wajib diisi." });
      }
      if (username.trim().length < 3) {
        return res.status(400).json({ message: "Username minimal 3 karakter." });
      }
      if (password.length < 5) {
        return res.status(400).json({ message: "Password minimal 5 karakter." });
      }
      if (!securityQuestion || !securityAnswer) {
        return res.status(400).json({ message: "Pertanyaan dan jawaban keamanan wajib diisi untuk pemulihan akun." });
      }
      const existing = dbOps.findUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username sudah terdaftar. Gunakan nama lain." });
      }
      const user = dbOps.createUser(username, password, securityQuestion, securityAnswer);
      const token = generateToken({ userId: user.id, username: user.username });
      res.status(201).json({
        message: "Registrasi berhasil!",
        token,
        user: { id: user.id, username: user.username }
      });
    } catch (error) {
      res.status(500).json({ message: "Terjadi kesalahan: " + error.message });
    }
  });
  app.post("/api/auth/forgot-password", (req, res) => {
    try {
      const { username, password, securityQuestion, securityAnswer } = req.body;
      if (!username || !password || !securityQuestion || !securityAnswer) {
        return res.status(400).json({ message: "Semua field wajib diisi." });
      }
      if (password.length < 5) {
        return res.status(400).json({ message: "Password baru minimal 5 karakter." });
      }
      const user = dbOps.resetPassword(username, securityQuestion, securityAnswer, password);
      const token = generateToken({ userId: user.id, username: user.username });
      res.json({
        message: "Password berhasil direset! Anda otomatis masuk.",
        token,
        user: { id: user.id, username: user.username }
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app.post("/api/auth/login", (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username dan password wajib diisi." });
      }
      const user = dbOps.findUserByUsername(username);
      if (!user) {
        return res.status(400).json({ message: "Username atau password salah." });
      }
      const hash = hashPassword(password, user.salt);
      if (hash !== user.passwordHash) {
        return res.status(400).json({ message: "Username atau password salah." });
      }
      const token = generateToken({ userId: user.id, username: user.username });
      res.json({
        message: "Login berhasil!",
        token,
        user: { id: user.id, username: user.username }
      });
    } catch (error) {
      res.status(500).json({ message: "Terjadi kesalahan: " + error.message });
    }
  });
  app.get("/api/auth/me", authMiddleware, (req, res) => {
    const user = dbOps.findUserByUsername(req.user.username);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }
    res.json({
      user: {
        id: user.id,
        username: user.username,
        hasSecurityQuestion: !!user.securityQuestion
      }
    });
  });
  app.post("/api/auth/setup-security", authMiddleware, (req, res) => {
    try {
      const { securityQuestion, securityAnswer } = req.body;
      if (!securityQuestion || !securityAnswer) {
        return res.status(400).json({ message: "Pertanyaan dan jawaban keamanan wajib diisi." });
      }
      const user = dbOps.findUserByUsername(req.user.username);
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan." });
      }
      const updatedUser = dbOps.updateUserSecurity(req.user.username, securityQuestion, securityAnswer);
      res.json({
        message: "Pertanyaan keamanan berhasil diperbarui!",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          hasSecurityQuestion: true
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Gagal memperbarui pertanyaan keamanan: " + error.message });
    }
  });
  app.get("/api/data", authMiddleware, (req, res) => {
    try {
      const data = dbOps.getUserData(req.user.userId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Gagal memuat data: " + error.message });
    }
  });
  app.post("/api/data", authMiddleware, (req, res) => {
    try {
      const { materials, labors, overheads, products, monthlyVolume } = req.body;
      const updated = dbOps.updateUserData(req.user.userId, {
        materials,
        labors,
        overheads,
        products,
        monthlyVolume
      });
      res.json({ message: "Data berhasil disimpan ke cloud hosting!", data: updated });
    } catch (error) {
      res.status(500).json({ message: "Gagal menyimpan data: " + error.message });
    }
  });
  app.use(import_express.default.static(import_path2.default.join(process.cwd(), "public")));
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(import_express.default.static(import_path2.default.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(process.cwd(), "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
