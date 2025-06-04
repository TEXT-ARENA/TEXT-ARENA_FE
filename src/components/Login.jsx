// Login.jsx
import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "로그인 실패");

      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-80 text-center">
        <h2 className="text-2xl font-bold mb-6">🔐 로그인</h2>
        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-3 px-4 py-2 rounded-lg bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading || !username || !password}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-110 transition font-bold"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </div>
    </div>
  );
}