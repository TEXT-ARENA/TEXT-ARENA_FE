import React, { useState } from "react";

export default function BattleArena({ player, onStartCombat }) {
  const [opponent, setOpponent] = useState(null);

  const handleFindOpponent = () => {
    setOpponent({
      name: "알베르토",
      icon: "A",
      desc: "용병",
      hp: 460, attack: 34, defense: 12,
      criticalChance: 0.13, criticalDamage: 1.5, speed: 66, dodgeChance: 0.06, accuracy: 0.94,
      wins: 5, losses: 3
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 min-h-screen">
      {/* 캐릭터 정보 */}
      <div className="bg-white/20 backdrop-blur-lg p-5 rounded-2xl shadow-lg border border-white/30 mb-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-slate-100">
            {player.name}
            <span className="text-sm font-medium text-slate-300/90 ml-2">
              ({player.desc})
            </span>
          </h3>
          <div className="text-sm text-slate-300/80">Lv.5</div>
        </div>

        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-1">경험치 65%</div>
          <div className="w-full bg-slate-600/30 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full w-[65%]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-slate-100">
          <div className="flex items-center gap-2">❤️ 체력 {player.hp}</div>
          <div className="flex items-center gap-2">⚔️ 공격력 {player.attack}</div>
          <div className="flex items-center gap-2">🛡️ 방어력 {player.defense}</div>
          <div className="flex items-center gap-2">💥 치명타 {Math.round(player.criticalChance * 100)}%</div>
          <div className="flex items-center gap-2">⚡ 치명피해 {player.criticalDamage}x</div>
          <div className="flex items-center gap-2">💨 속도 {player.speed}</div>
          <div className="flex items-center gap-2">🌪️ 회피 {Math.round(player.dodgeChance * 100)}%</div>
          <div className="flex items-center gap-2">🎯 정확도 {Math.round(player.accuracy * 100)}%</div>
        </div>
      </div>

      {/* 장비 슬롯 */}
      <div className="bg-white/20 backdrop-blur-lg p-5 rounded-2xl shadow-lg border border-white/30 mb-4">
        <h3 className="text-lg font-bold text-slate-100 mb-4">🎒 장비 장착</h3>
        <div className="grid grid-cols-4 gap-2 justify-center">
          {["무기", "모자", "상의", "신발"].map((slot, i) => (
            <div key={i} className="relative group flex flex-col items-center">
              <div className="w-[72px] h-[72px] bg-slate-600/20 rounded-xl border-2 border-slate-400/30 flex items-center justify-center text-xs text-slate-200/80 font-medium transition hover:brightness-110">
                + {slot}
              </div>
              <div className="mt-1 text-xs text-slate-400/80 text-center">{slot}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 전투 상대 UI (장비 슬롯 바로 아래) */}
      <div>
        {opponent ? (
          <div className="text-center bg-purple-600/20 backdrop-blur-lg p-6 rounded-2xl border border-purple-400/30">
            <h2 className="text-xl font-black text-slate-100 mb-2">
              {opponent.name}
              <span className="text-sm font-medium text-purple-200">({opponent.desc})</span>
            </h2>
            <button
              onClick={() => onStartCombat(opponent)}
              className="bg-gradient-to-br from-green-500 to-emerald-600 hover:brightness-110 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition"
            >
              ⚔️ 전투 시작
            </button>
          </div>
        ) : (
          <div className="text-center bg-slate-700/20 backdrop-blur-lg p-6 rounded-2xl border border-slate-500/30">
            <button
              onClick={handleFindOpponent}
              className="bg-gradient-to-br from-purple-600 to-blue-600 hover:brightness-110 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition w-full"
            >
              🔍 상대 찾기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
