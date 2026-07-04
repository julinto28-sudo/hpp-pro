import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { dbOps, generateToken, verifyToken, hashPassword } from "./src/server/db";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // JWT Auth Middleware
  const authMiddleware = (req: any, res: any, next: any) => {
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

  // --- API ROUTES ---

  // Auth: Register
  app.post("/api/auth/register", (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username dan password wajib diisi." });
      }
      if (username.trim().length < 3) {
        return res.status(400).json({ message: "Username minimal 3 karakter." });
      }
      if (password.length < 5) {
        return res.status(400).json({ message: "Password minimal 5 karakter." });
      }

      const existing = dbOps.findUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username sudah terdaftar. Gunakan nama lain." });
      }

      const user = dbOps.createUser(username, password);
      const token = generateToken({ userId: user.id, username: user.username });

      res.status(201).json({
        message: "Registrasi berhasil!",
        token,
        user: { id: user.id, username: user.username }
      });
    } catch (error: any) {
      res.status(500).json({ message: "Terjadi kesalahan: " + error.message });
    }
  });

  // Auth: Login
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
    } catch (error: any) {
      res.status(500).json({ message: "Terjadi kesalahan: " + error.message });
    }
  });

  // Auth: Get Current Profile
  app.get("/api/auth/me", authMiddleware, (req: any, res: any) => {
    res.json({ user: req.user });
  });

  // Data: Load user specific calculation data
  app.get("/api/data", authMiddleware, (req: any, res: any) => {
    try {
      const data = dbOps.getUserData(req.user.userId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: "Gagal memuat data: " + error.message });
    }
  });

  // Data: Save user specific calculation data
  app.post("/api/data", authMiddleware, (req: any, res: any) => {
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
    } catch (error: any) {
      res.status(500).json({ message: "Gagal menyimpan data: " + error.message });
    }
  });

  // Serve static files
  app.use(express.static(path.join(process.cwd(), "public")));
  app.use(express.static(process.cwd()));

  app.get("*", (req, res) => {
    res.sendFile(path.join(process.cwd(), "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
