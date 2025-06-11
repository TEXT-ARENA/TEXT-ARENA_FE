import React, { useState } from "react";
import Login from "./components/Login";
import CharacterForm from "./components/CharacterForm";
import StatRevealDialog from "./components/StatRevealDialog";
import BattleArena from "./components/BattleArena";
import AIThinkingDialog from "./components/AIThinkingDialog";


export default function App() {
  const [user, setUser] = useState(null);
  const [player, setPlayer] = useState(null);
  const [stage, setStage] = useState("form");

  function handleCreate(character) {
    setPlayer({
      ...character,
      hp: 500,
      attack: 33,
      defense: 9,
      criticalChance: 0.13,
      criticalDamage: 1.45,
      speed: 70,
      dodgeChance: 0.04,
      accuracy: 0.95,
      wins: 0,
      losses: 0,
    });
    setStage("thinking");
  }

  // 2. 로그인 안 되어 있으면 로그인창만 보이게
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // 3. 로그인 된 경우 원래 앱 UI
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden transition-all duration-700 text-xs"
      style={{ fontFamily: "'Noto Sans KR', Pretendard, sans-serif" }}
    >

      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* 타이틀 */}
      <div
        className="relative z-10 text-center mt-8 mb-4 cursor-pointer"
        onClick={() => setStage(player ? "battle" : "form")}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center shadow-md animate-bounce">
            <span className="text-lg">⚔️</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text select-none animate-pulse">
            Text Arena
          </h1>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center shadow-md animate-bounce" style={{ animationDelay: "0.5s" }}>
            <span className="text-lg">🏟️</span>
          </div>
        </div>
        <p className="text-slate-300 font-normal max-w-md mx-auto leading-relaxed text-xs">
          AI와 함께하는 텍스트 기반 전투 게임
        </p>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-2xl -z-10 rounded-full" />
      </div>


      {/* 메인 컨텐츠 */}
      <div className="relative z-10 w-full max-w-md px-4 py-4 flex flex-col gap-6 items-center justify-center">
        {stage === "form" && (
          <div className="transform transition-all duration-500 animate-fadeIn w-full">
            <CharacterForm onSubmit={handleCreate} />
          </div>
        )}

        {stage === "thinking" && player && (
          <AIThinkingDialog character={player} onDone={() => setStage("stat")} />
        )}

        {stage === "stat" && player && (
          <StatRevealDialog character={player} onDone={() => setStage("battle")} />
        )}

        {stage === "battle" && player && (
          <div className="transform transition-all duration-500 animate-fadeIn w-full">
            <BattleArena player={player} />
          </div>
        )}
      </div>

      {/* 하단 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-slate-400 text-xs font-medium opacity-60">
        <div className="flex items-center gap-1">
          <span>Powered by AI</span>
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
        </div>
      </div>

      {/* 애니메이션 정의 */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
