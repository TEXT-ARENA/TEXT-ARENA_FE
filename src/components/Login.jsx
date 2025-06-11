//login.jsx
import React, { useState } from "react";
import AnimatedHangingCharacter from "./AnimatedHangingCharacter";
import { Loader2, User, KeyRound } from "lucide-react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://18.209.30.21:8080/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "로그인 실패");
      localStorage.setItem('userId', data.result);
      onLogin({ userId: data.result });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-purple-900 to-indigo-900 text-white transition-all duration-500">
      <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-md text-center border border-white/15 animate-fade-in">
        <AnimatedHangingCharacter />

        <div className="flex flex-col items-center mb-7">
          <span className="text-3xl mb-1 font-black tracking-widest bg-gradient-to-r from-pink-500 via-purple-400 to-blue-400 text-transparent bg-clip-text animate-text-pop">
            ⚔ TEXT ARENA ⚔
          </span>
          <p className="text-slate-300/90 text-xs mt-2 tracking-wide">
            회원가입 없이 <b>간편하게 로그인</b>하세요
          </p>
        </div>
        <div className="space-y-4 mb-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/60 text-white placeholder-gray-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-inner"
              disabled={loading}
            />
          </div>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/60 text-white placeholder-gray-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-inner"
              disabled={loading}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>
        {error && (
          <div className="mb-2">
            <p className="text-red-400 text-xs font-bold animate-shake">{error}</p>
          </div>
        )}
        <button
          onClick={handleLogin}
          disabled={loading || !username || !password}
          className={`w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-500 hover:scale-[1.04] transition-all duration-200 font-extrabold shadow-lg flex items-center justify-center gap-2
          ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "로그인"}
        </button>
        <div className="mt-7 text-xs text-slate-400/80 tracking-wide">
          <span className="opacity-70">ⓒ 2025 TEXT ARENA</span>
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeInUp 1s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-shake {
          animation: shake 0.25s cubic-bezier(.4,0,.2,1) 2;
        }
        @keyframes shake {
          0% { transform: translateX(0);}
          20% { transform: translateX(-4px);}
          40% { transform: translateX(4px);}
          60% { transform: translateX(-2px);}
          80% { transform: translateX(2px);}
          100% { transform: translateX(0);}
        }
        .animate-text-pop {
          animation: textPop .9s cubic-bezier(.4,0,.2,1) 1;
        }
        @keyframes textPop {
          0% { transform: scale(.75); opacity: 0;}
          60% { transform: scale(1.10);}
          100% { transform: scale(1); opacity: 1;}
        }
      `}</style>
    </div>
  );
}
