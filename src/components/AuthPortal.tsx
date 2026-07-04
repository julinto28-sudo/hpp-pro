import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { KeyRound, User, Sparkles, ChefHat, AlertCircle, ArrowRight, Loader2, Server } from "lucide-react";

interface AuthPortalProps {
  onAuthSuccess: (token: string, user: { id: string; username: string }) => void;
}

export default function AuthPortal({ onAuthSuccess }: AuthPortalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    setIsLoading(true);
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan pada server.");
      }

      // Success
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Gagal menghubungi server. Periksa koneksi Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Background radial gradient accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Header App Identity */}
        <div className="flex flex-col items-center mb-8 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-indigo-600/20 border border-indigo-500/30"
          >
            <ChefHat className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h2 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-white tracking-tight"
          >
            HPP Master <span className="text-indigo-400 font-medium">Pro</span>
          </motion.h2>
          
          <motion.p 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed"
          >
            Sistem kalkulasi resep, HPP, & margin terintegrasi dengan penyimpanan aman di Hosting Mandiri.
          </motion.p>
        </div>

        {/* Auth Card Container */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-2xl p-6 sm:p-8"
        >
          {/* Custom sliding tab switcher */}
          <div className="flex bg-slate-950/60 rounded-xl p-1 mb-6 border border-slate-700/40 relative">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all duration-150 relative z-10 cursor-pointer ${
                isLogin ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all duration-150 relative z-10 cursor-pointer ${
                !isLogin ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Daftar Baru
            </button>
            <div 
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-indigo-600 rounded-lg transition-all duration-300 ease-out ${
                isLogin ? "translate-x-0" : "translate-x-full"
              }`}
            ></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama pengguna"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm py-2.5 pl-10 pr-4 rounded-xl text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder={isLogin ? "Masukkan sandi Anda" : "Buat sandi minimal 5 karakter"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm py-2.5 pl-10 pr-4 rounded-xl text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Error Message Box */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 flex gap-2.5 items-start text-xs text-rose-300 overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-lg shadow-indigo-600/10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses Akses...
                </>
              ) : (
                <>
                  {isLogin ? "Masuk ke Dashboard" : "Daftarkan Akun Baru"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Secure indicator label */}
          <div className="mt-6 pt-5 border-t border-slate-700/40 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span>Server Terkoneksi: Hosting Mandiri Anda</span>
          </div>
        </motion.div>

        {/* Selling Pitch Info Card */}
        <div className="mt-4 bg-slate-800/30 rounded-xl border border-slate-700/30 p-4 text-[11px] text-slate-400 leading-relaxed flex gap-3 items-start">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300 block mb-0.5">Nilai Jual Software HPP</span>
            Sebagai pemilik, Anda bisa menjual software ini ke ratusan pengusaha kuliner. Setiap pembeli mendapatkan akun login pribadi dengan database terisolasi aman tanpa biaya langganan Firebase bulanan.
          </div>
        </div>

      </div>
    </div>
  );
}
