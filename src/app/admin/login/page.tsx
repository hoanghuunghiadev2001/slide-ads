"use client";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // State cho thông báo lỗi
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // Tự động đóng popup sau 4 giây
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  async function handleLogin() {
    if (!email || !password) {
      triggerError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        window.location.href = "/admin";
      } else {
        triggerError(data.error || "Tài khoản hoặc mật khẩu không chính xác");
      }
    } catch (error) {
      triggerError("Lỗi kết nối hệ thống. Thử lại sau!");
    } finally {
      setLoading(false);
    }
  }

  // Hàm tạo hiệu ứng rung và hiện lỗi
  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500); // Tắt hiệu ứng rung sau 0.5s
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] relative overflow-hidden font-sans">
      {/* POPUP THÔNG BÁO LỖI (TOAST) */}
      <div
        className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out transform ${
          errorMsg
            ? "translate-y-0 opacity-100"
            : "-translate-y-20 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-red-500/10 backdrop-blur-md border border-red-500/50 text-red-500 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <div className="bg-red-500 text-white rounded-full p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <span className="font-bold text-sm tracking-wide">{errorMsg}</span>
        </div>
      </div>

      {/* Hiệu ứng ánh sáng nền */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />

      <div
        className={`z-10 w-full max-w-md p-8 transition-transform duration-500 ${shake ? "animate-shake" : ""}`}
      >
        {/* Logo / Branding */}
        <div className="text-center mb-10">
          <div className="inline-block p-3 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            Control <span className="text-blue-500">Center</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            Hệ thống quản trị Toyota Bình Dương
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@toyota.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full relative overflow-hidden group py-4 rounded-2xl font-bold text-white transition-all shadow-xl ${
                loading
                  ? "bg-slate-700 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 active:scale-[0.98]"
              }`}
            >
              <span className={loading ? "opacity-0" : "opacity-100"}>
                ĐĂNG NHẬP HỆ THỐNG
              </span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-500 text-xs font-medium tracking-wide uppercase">
          &copy; 2026 Toyota Bình Dương
        </p>
      </div>

      {/* Thêm CSS cho hiệu ứng rung (Shake) */}
      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-8px);
          }
          50% {
            transform: translateX(8px);
          }
          75% {
            transform: translateX(-8px);
          }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
}
