import React, { useEffect, useRef, useState } from "react";

export default function CombatScene({ player, opponent, onBattleEnd }) {
  const [log, setLog] = useState([]);
  const [playerHP, setPlayerHP] = useState(player.hp);
  const [opponentHP, setOpponentHP] = useState(opponent.hp);
  const [turn, setTurn] = useState(0);
  const logRef = useRef(null);

  useEffect(() => {
    const attacker = turn % 2 === 0 ? player : opponent;
    const defender = turn % 2 === 0 ? opponent : player;
    const isPlayerTurn = turn % 2 === 0;

    const attackerHP = isPlayerTurn ? playerHP : opponentHP;
    const defenderHP = isPlayerTurn ? opponentHP : playerHP;

    if (playerHP <= 0 || opponentHP <= 0) {
      setTimeout(() => onBattleEnd(playerHP > 0 ? player : opponent), 1500);
      return;
    }

    setTimeout(() => {
      let logs = [];
      logs.push(`${attacker.name}의 공격!`);
      if (Math.random() < defender.dodgeChance) {
        logs.push(`${defender.name}이(가) 회피했다!`);
      } else {
        const isCrit = Math.random() < attacker.criticalChance;
        let dmg = attacker.attack - defender.defense;
        dmg = Math.max(1, dmg);
        if (isCrit) dmg = Math.floor(dmg * attacker.criticalDamage);
        logs.push(`${isCrit ? '💥' : '🗡️'} ${defender.name}이(가) ${dmg} 데미지를 입었다!`);

        if (isPlayerTurn) setOpponentHP((hp) => Math.max(0, hp - dmg));
        else setPlayerHP((hp) => Math.max(0, hp - dmg));
      }
      setLog((prev) => [...prev, ...logs]);
      setTurn((t) => t + 1);
    }, 1200);
  }, [turn]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* 전투 캐릭터 UI */}
      <div className="flex justify-between items-center mb-6">
        {[player, opponent].map((char, idx) => (
          <div key={char.name} className="flex flex-col items-center">
            <div
              className={`w-24 h-24 rounded-full text-white text-2xl font-black flex items-center justify-center shadow-lg transition-transform duration-300 ${
                (turn % 2 === idx) ? 'animate-bounce' : ''
              } ${idx === 0 ? 'bg-blue-500' : 'bg-red-500'}`}
            >
              {char.icon}
            </div>
            <div className="mt-2 text-center text-sm">
              <div>{char.name}</div>
              <div className="w-32 bg-gray-200 h-2 rounded-full mt-1">
                <div
                  className={`h-2 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                  style={{ width: `${idx === 0 ? (playerHP / player.hp) * 100 : (opponentHP / opponent.hp) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 전투 로그 */}
      <div className="bg-black/80 text-white p-4 rounded-xl h-48 overflow-y-auto text-sm space-y-2" ref={logRef}>
        {log.map((entry, i) => (
          <div key={i} className="animate-fadeIn">
            {entry}
          </div>
        ))}
      </div>

      {/* 애니메이션 스타일 */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
}
