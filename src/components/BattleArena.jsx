// BattleArena.jsx
import React, { useState, useEffect } from "react";
import CombatSceneWrapper from "./CombatSceneWrapper";

const equipmentTypes = ["무기", "모자", "상의", "신발"];

export default function BattleArena({ player, onStartCombat }) {
  const [opponent, setOpponent] = useState(null);
  const [showCombat, setShowCombat] = useState(false);
  const [matchmakingPhase, setMatchmakingPhase] = useState("idle");
  const [searchTime, setSearchTime] = useState(0);
  const [equipped, setEquipped] = useState({});
  const [showEquipModal, setShowEquipModal] = useState(null);

  const handleFindOpponent = () => {
    setMatchmakingPhase("searching");
    setSearchTime(0);
    const searchInterval = setInterval(() => setSearchTime(prev => prev + 0.1), 100);
    const foundTimer = setTimeout(() => {
      clearInterval(searchInterval);
      const enemy = {
        name: "알베르토 드 라 로사",
        icon: "🗡️",
        desc: "전직 기사",
        rank: "골드 II",
        hp: 180, attack: 80, defense: 18,
        criticalChance: 0.15, criticalDamage: 1.8,
        speed: 72, dodgeChance: 0.08, accuracy: 0.92,
        wins: 127, losses: 89
      };
      setOpponent(enemy);
      setMatchmakingPhase("found");
      setTimeout(() => setShowCombat(true), 3000);
    }, Math.random() * 2000 + 2000);
    return () => { clearInterval(searchInterval); clearTimeout(foundTimer); };
  };

  const handleBattleEnd = (winner, battleResult) => {
    setShowCombat(false);
    setOpponent(null);
    setMatchmakingPhase("idle");
    if (onStartCombat) onStartCombat(winner, battleResult);
  };

  if (showCombat && opponent) {
    return <CombatSceneWrapper player={player} opponent={opponent} onBattleEnd={handleBattleEnd} />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-6 min-h-screen text-white">
      {/* Player Info + Stats */}
      <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-black mb-1">{player.name}</h3>
            <span className="text-lg font-medium text-blue-300">Lv.{player.level} • {player.desc} • 실버 III</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-300">전적</div>
            <div className="text-lg font-bold">{player.wins}승 {player.losses}패</div>
          </div>
        </div>
        <div className="mb-3">
          <div className="text-xs text-slate-300 mb-1 flex justify-between">
            <span>경험치</span>
            <span>{player.exp} / {player.maxExp} XP</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-green-400 h-2 rounded-full"
              style={{ width: `${(player.exp / player.maxExp) * 100}%` }}
            />
          </div>
        </div>

        {/* Stat Grid */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          {[
            { icon: "❤️", label: "체력", value: player.hp },
            { icon: "⚔️", label: "공격", value: player.attack },
            { icon: "🛡️", label: "방어", value: player.defense },
            { icon: "💨", label: "속도", value: player.speed },
            { icon: "💥", label: "치명타", value: `${Math.round(player.criticalChance * 100)}%` },
            { icon: "⚡", label: "치명피해", value: `${player.criticalDamage}x` },
            { icon: "🌪️", label: "회피", value: `${Math.round(player.dodgeChance * 100)}%` },
            { icon: "🎯", label: "정확도", value: `${Math.round(player.accuracy * 100)}%` },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-black/30 rounded-xl px-2 py-1 flex flex-col items-center justify-center h-20 w-full text-center"
            >
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-sm font-bold text-white">{stat.value}</div>
              <div className="text-[10px] text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Panel */}
      <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 mb-6">
        <div className="flex justify-between items-center">
          {equipmentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setShowEquipModal(type)}
              className="w-16 h-16 rounded-xl border border-white/30 hover:brightness-110 transition-all duration-200 shadow-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xl"
            >
              {equipped[type] ? equipped[type] : "❔"}
            </button>
          ))}
        </div>
      </div>

      {/* Idle State */}
      {matchmakingPhase === "idle" && (
        <div className="text-center bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-600/30">
          <div className="mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span className="text-3xl">⚔️</span>
            </div>
            <h2 className="text-2xl font-black mb-2">랭크 게임 준비완료</h2>
            <p className="text-slate-300">실력이 비슷한 상대를 찾아드립니다</p>
          </div>
          <button
            onClick={handleFindOpponent}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-110 text-white font-black py-4 px-12 rounded-2xl shadow-xl transition-all duration-200 hover:scale-105"
          >
            🔍 게임 찾기
          </button>
        </div>
      )}

      {/* Searching State */}
      {matchmakingPhase === "searching" && (
        <div className="text-center bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-xl p-8 rounded-3xl border border-orange-500/30">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
              <span className="text-3xl">🔍</span>
            </div>
            <h2 className="text-2xl font-black mb-2 text-orange-300">대결 상대를 찾는 중...</h2>
            <p className="text-orange-200">최적의 상대를 매칭하고 있습니다</p>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <div className="text-orange-300 font-mono text-lg">
              {searchTime.toFixed(1)}초 경과
            </div>
          </div>

          <div className="bg-black/30 rounded-2xl p-4 max-w-sm mx-auto">
            <div className="text-sm text-orange-200 mb-2">📊 매칭 조건</div>
            <div className="space-y-1 text-xs text-orange-300">
              <div>• 랭크: 실버 I ~ 골드 I</div>
              <div>• 실력 점수: ±200 LP</div>
              <div>• 지역: 아시아 서버</div>
            </div>
          </div>
        </div>
      )}

      {/* Found State */}
      {matchmakingPhase === "found" && opponent && (
        <div className="text-center bg-gradient-to-br from-green-900/40 to-blue-900/40 backdrop-blur-xl p-8 rounded-3xl border border-green-500/30 animate-pulse">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-2xl font-black mb-2 text-green-300">상대를 찾았습니다!</h2>
            <p className="text-green-200">곧 전투가 시작됩니다</p>
          </div>
          
          <div className="bg-black/40 rounded-2xl p-6 max-w-md mx-auto mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-4xl">{opponent.icon}</div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-green-300">{opponent.name}</h3>
                <p className="text-green-200 text-sm">{opponent.desc}</p>
                <p className="text-green-400 text-sm font-bold">{opponent.rank}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-red-900/50 rounded-lg p-2 text-center">
                <div className="text-red-300">⚔️</div>
                <div className="text-white font-bold">{opponent.attack}</div>
              </div>
              <div className="bg-blue-900/50 rounded-lg p-2 text-center">
                <div className="text-blue-300">🛡️</div>
                <div className="text-white font-bold">{opponent.defense}</div>
              </div>
              <div className="bg-yellow-900/50 rounded-lg p-2 text-center">
                <div className="text-yellow-300">💨</div>
                <div className="text-white font-bold">{opponent.speed}</div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-slate-300">
              전적: {opponent.wins}승 {opponent.losses}패
            </div>
          </div>

          <div className="text-green-300 font-mono text-lg animate-pulse">
            🎮 전투 준비 중...
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white text-black p-6 rounded-2xl shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">{showEquipModal} 장비 선택</h3>
            <div className="grid grid-cols-3 gap-3">
              {["⚪", "🟦", "🟨"].map(item => (
                <button
                  key={item}
                  onClick={() => {
                    setEquipped(prev => ({ ...prev, [showEquipModal]: item }));
                    setShowEquipModal(null);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-2xl text-center"
                >
                  {item}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowEquipModal(null)}
              className="mt-4 text-sm text-blue-600 hover:underline w-full text-center"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}