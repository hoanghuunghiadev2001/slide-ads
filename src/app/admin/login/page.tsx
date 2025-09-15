"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });
    const data = await res.json();
    if (res.ok) {
      window.location.href = "/admin";
    } else {
      alert(data.error || "Đăng nhập thất bại");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white shadow rounded w-96">
        <h1 className="text-xl mb-4 font-bold">Admin Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 mb-3 w-full"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 mb-3 w-full"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}
