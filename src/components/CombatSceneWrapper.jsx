// CombatSceneWrapper.jsx
import React, { useState, useEffect } from "react";
import CombatScene from "./CombatScene";
import { fetchBattleResult } from "../api/aiPrompt";

const GREETINGS = ["안녕", "안녕하세요", "좋은 하루", "하이", "맞짱떠요", "무서워요", "집에 가고 싶다"];

export default function CombatSceneWrapper({ player, opponent, onBattleEnd }) {
  const [phase, setPhase] = useState("loading");
  const [battleResult, setBattleResult] = useState(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingText, setGreetingText] = useState("");
  const [opponentGreetingText, setOpponentGreetingText] = useState("");

  useEffect(() => {
    let timer;
    if (phase === "loading") {
      timer = setTimeout(() => {
        setGreetingText(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
        setOpponentGreetingText(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
        setPhase("greeting");
        setShowGreeting(true);
      }, 1200);
    } else if (phase === "greeting") {
      timer = setTimeout(() => {
        setShowGreeting(false);
        setTimeout(() => setPhase("battle"), 800);
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [phase]);

  const handleBattleComplete = async (winner, resultStats) => {
    setBattleResult({ winner, ...resultStats });
    setPhase("result");

    // 전투 결과 서버 전송
    try {
      // player, opponent에 character_id가 있는 경우만 전송
      if (player?.character_id && opponent?.character_id) {
        const winnerId = winner.character_id;
        const loserId = winner.character_id === player.character_id ? opponent.character_id : player.character_id;
        await fetchBattleResult({ winnerId, loserId });
        console.log("전투 결과 서버 전송 성공");
      } else {
        console.warn("character_id가 없어 전투 결과를 서버에 전송하지 않음");
      }
    } catch (e) {
      console.error("전투 결과 서버 전송 실패:", e);
    }
  };

  const handleReturnToArena = () => onBattleEnd(battleResult.winner, battleResult);

  const SpeechBubble = ({ message, side, isVisible }) => (
    <div
      className={`absolute -top-16 ${side === 'left' ? 'left-2' : 'right-2'} transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 -translate-y-0' : 'opacity-0 -translate-y-5'}`}
    >
      <div className="bg-white text-black px-4 py-2 rounded-xl shadow-lg text-sm md:text-base whitespace-nowrap relative">
        {message}
        <div className={`absolute w-0 h-0 border-[10px] ${side === 'left' ? 'border-l-transparent border-b-transparent border-t-white left-4 -bottom-4' : 'border-r-transparent border-b-transparent border-t-white right-4 -bottom-4'}`}></div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-4 pb-16 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 overflow-x-hidden overflow-y-auto min-h-screen">
      {phase === "loading" && (
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-6 border border-slate-600 shadow-lg text-center w-full max-w-md animate-fadeInUp">
          <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-purple-300">전투 준비 중...</h2>
          <p className="text-sm text-slate-400 mt-2">전투 시스템 초기화 중입니다</p>
        </div>
      )}

      {phase === "greeting" && (
        <div className="w-full max-w-2xl flex justify-around items-end gap-8 relative animate-crossFadeInOut">
          <div className="relative flex flex-col items-center animate-deepBow">
            <div className="w-24 h-24 md:w-28 md:h-28 bg-sky-500 rounded-full text-5xl flex items-center justify-center shadow-xl">
              {player.icon}
            </div>
            <SpeechBubble message={greetingText} side="left" isVisible={showGreeting} />
            <div className="mt-2 text-sky-300 font-semibold">{player.name}</div>
          </div>

          <div className="text-3xl md:text-4xl text-slate-400 font-bold animate-pulseVS">🤝</div>

          <div className="relative flex flex-col items-center animate-deepBow">
            <div className="w-24 h-24 md:w-28 md:h-28 bg-red-500 rounded-full text-5xl flex items-center justify-center shadow-xl">
              {opponent.icon}
            </div>
            <SpeechBubble message={opponentGreetingText} side="right" isVisible={showGreeting} />
            <div className="mt-2 text-red-300 font-semibold">{opponent.name}</div>
          </div>
        </div>
      )}

      {phase === "battle" && (
        <div className="w-full animate-crossFadeIn" style={{ minWidth: '400px' }}>
          <CombatScene player={player} opponent={opponent} onBattleEnd={handleBattleComplete} />
        </div>
      )}

      {phase === "result" && battleResult && (
        <div className={`mt-6 bg-slate-800/70 border rounded-xl p-6 text-center max-w-md w-full animate-fadeInUp ${battleResult.winner.name === player.name ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <div className="text-5xl mb-4">{battleResult.winner.name === player.name ? '🏆' : '💀'}</div>
          <h2 className={`text-2xl font-bold ${battleResult.winner.name === player.name ? 'text-green-300' : 'text-red-300'}`}>{battleResult.winner.name === player.name ? '승리!' : '패배'}</h2>
          <p className="text-sm text-slate-300 mb-3">{battleResult.winner.name} (이)가 전투에서 승리했습니다.</p>
          <div className="text-left text-slate-200 text-sm space-y-1 bg-slate-900/70 rounded-lg p-4 mb-4">
            <div className="flex justify-between"><span>총 턴:</span><span>{battleResult.totalTurns}</span></div>
            <div className="flex justify-between"><span>총 데미지:</span><span>{battleResult.totalDamage}</span></div>
            <div className="flex justify-between"><span>치명타:</span><span>{battleResult.criticalHits}회</span></div>
            <div className="flex justify-between"><span>회피:</span><span>{battleResult.dodges}회</span></div>
            <div className="flex justify-between"><span>소요 시간:</span><span>{battleResult.duration}초</span></div>
          </div>
          <button onClick={handleReturnToArena} className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-purple-500 text-white font-semibold rounded-lg shadow hover:scale-105 transition-transform">
            🏟️ 아레나로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
}