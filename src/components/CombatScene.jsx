// CombatScene.jsx
import React, { useEffect, useRef, useState } from "react";

const statIcons = {
  attack: "⚔️",
  defense: "🛡️",
  speed: "💨",
  criticalChance: "💥",
  criticalDamage: "⚡",
  dodgeChance: "🌪️",
  accuracy: "🎯",
};

// CharacterStatPanel and AnimatedCharacterIcon components remain the same as your provided version
// ... (CharacterStatPanel code) ...
const CharacterStatPanel = ({ character = {}, currentHP = 0, isPlayerCharacter, compareTarget = {} }) => {
  const hpRatio = character.hp > 0 ? Math.max(0, currentHP / character.hp) : 0;

  const getStatColor = (key) => {
    if (compareTarget[key] === undefined || character[key] === undefined) return isPlayerCharacter ? 'text-sky-100' : 'text-red-100';
    const a = character[key];
    const b = compareTarget[key];
    if (a > b) return 'text-blue-400';
    if (a < b) return 'text-red-400';
    return isPlayerCharacter ? 'text-sky-100' : 'text-red-100';
  };

  return (
    <div
      className={`
        w-full max-w-[22rem] h-[13rem] p-4
        rounded-2xl shadow-xl flex flex-col justify-between
        ${isPlayerCharacter ? 'bg-sky-900/80 border border-sky-700/40' : 'bg-red-900/80 border border-red-700/40'}
      `}
    >
      {/* 이름 + HP */}
      <div className="text-center h-[3.5rem] mb-2">
        <h3 className={`truncate text-sm font-semibold ${isPlayerCharacter ? 'text-sky-100' : 'text-red-100'}`}>
          {character.name || ' '}
        </h3>
        <div className={`text-xs font-medium ${isPlayerCharacter ? 'text-sky-300' : 'text-red-300'}`}>
          HP: {currentHP} / {character.hp || 0}
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-3 mt-1 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ease-out 
              ${isPlayerCharacter ? 'bg-gradient-to-r from-sky-400 to-sky-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
            style={{ width: `${hpRatio * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 스탯 7개 */}
      <div className="grid grid-cols-4 gap-2 grow">
        {Object.entries(statIcons).map(([key, icon]) => {
          if (character[key] !== undefined) {
            let value = character[key];
            if (["criticalChance", "dodgeChance", "accuracy"].includes(key)) {
              value = `${Math.round(value * 100)}%`;
            } else if (key === "criticalDamage") {
              value = `${parseFloat(value).toFixed(2)}x`;
            }

            return (
              <div
                key={key}
                className={`flex flex-col items-center justify-center px-1.5 py-1 rounded-md bg-black/20
                  ${getStatColor(key)} text-[10px] leading-tight`}
              >
                <div className="text-base">{icon}</div> {/* 👈 아이콘 크기 줄임 */}
                <div className="font-semibold font-mono whitespace-nowrap text-[10px]">{value}</div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

// ... (AnimatedCharacterIcon code) ...
const AnimatedCharacterIcon = ({ character = {}, animation, damageText, isPlayer }) => {
  let animationClass = '';
  if (animation) {
    if (animation.type === 'attack') animationClass = isPlayer ? 'animate-playerAttack' : 'animate-opponentAttack';
    else if (animation.type === 'hit') animationClass = 'animate-hitShake animate-hitFlash';
    else if (animation.type === 'dodge') animationClass = 'animate-dodgeEffect';
  }

  return (
    <div className={`relative ${isPlayer ? 'self-start' : 'self-end'}`}>
      {/* 캐릭터 본체 */}
      <div
        className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full text-white text-4xl md:text-5xl font-semibold flex items-center justify-center shadow-xl transition-all duration-300
                    ${isPlayer ? 'bg-sky-500' : 'bg-red-500'} ${animationClass}`}
      >
        {/* 모자: 몸통 위 */}
        {character.equipments && character.equipments.find(eq => eq.type === 'hat') && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-7 w-8 h-8 flex items-center justify-center z-20">
            {character.equipments.find(eq => eq.type === 'hat').imageUrl ? (
              <img
                src={character.equipments.find(eq => eq.type === 'hat').imageUrl}
                alt={character.equipments.find(eq => eq.type === 'hat').name}
                className="w-8 h-8 object-contain rounded-full border border-gray-400 bg-white/80"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
              />
            ) : (
              <span className="text-[10px] text-gray-500 bg-gray-300/60 rounded-full px-2 py-1 border border-gray-400">{character.equipments.find(eq => eq.type === 'hat').name}</span>
            )}
          </div>
        )}
        {/* 무기: 플레이어는 오른팔 끝, 상대는 왼팔 끝 */}
        {character.equipments && character.equipments.find(eq => eq.type === 'weapon') && (
          <div className={`absolute ${isPlayer ? 'right-[-18px]' : 'left-[-18px]'} top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center z-20`}>
            {character.equipments.find(eq => eq.type === 'weapon').imageUrl ? (
              <img
                src={character.equipments.find(eq => eq.type === 'weapon').imageUrl}
                alt={character.equipments.find(eq => eq.type === 'weapon').name}
                className="w-8 h-8 object-contain rounded-lg border border-gray-400 bg-white/80"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
              />
            ) : (
              <span className="text-[10px] text-gray-500 bg-gray-300/60 rounded-lg px-2 py-1 border border-gray-400">{character.equipments.find(eq => eq.type === 'weapon').name}</span>
            )}
          </div>
        )}
        {/* 상의: 몸통 중앙 */}
        {character.equipments && character.equipments.find(eq => eq.type === 'top') && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center z-10">
            {character.equipments.find(eq => eq.type === 'top').imageUrl ? (
              <img
                src={character.equipments.find(eq => eq.type === 'top').imageUrl}
                alt={character.equipments.find(eq => eq.type === 'top').name}
                className="w-10 h-10 object-contain rounded-lg border border-gray-400 bg-white/80"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
              />
            ) : (
              <span className="text-[10px] text-gray-500 bg-gray-300/40 rounded-lg px-2 py-1 border border-gray-400">{character.equipments.find(eq => eq.type === 'top').name}</span>
            )}
          </div>
        )}
        {/* 신발: 발 아래 */}
        {character.equipments && character.equipments.find(eq => eq.type === 'shoes') && (
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-7 w-8 h-8 flex items-center justify-center z-20">
            {character.equipments.find(eq => eq.type === 'shoes').imageUrl ? (
              <img
                src={character.equipments.find(eq => eq.type === 'shoes').imageUrl}
                alt={character.equipments.find(eq => eq.type === 'shoes').name}
                className="w-8 h-8 object-contain rounded-full border border-gray-400 bg-white/80"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
              />
            ) : (
              <span className="text-[10px] text-gray-500 bg-gray-300/60 rounded-full px-2 py-1 border border-gray-400">{character.equipments.find(eq => eq.type === 'shoes').name}</span>
            )}
          </div>
        )}
        {/* 캐릭터 본체 */}
        {character.icon || '?'}
        
        {/* 왼팔 */}
        <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-6 rounded-full
          ${isPlayer ? 'bg-sky-400' : 'bg-red-400'} 
          ${animation?.type === 'attack' ? (isPlayer ? 'animate-leftArmAttack' : 'animate-leftArmAttackOpp') : 'animate-armIdle animate-tubeWobble'}`}
        ></div>
        
        {/* 오른팔 */}
        <div className={`absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-6 rounded-full
          ${isPlayer ? 'bg-sky-400' : 'bg-red-400'}
          ${animation?.type === 'attack' ? (isPlayer ? 'animate-rightArmAttack' : 'animate-rightArmAttackOpp') : 'animate-armIdle animate-tubeWobble'}`}
        ></div>
        
        {/* 왼다리 */}
        <div className={`absolute -bottom-1 left-[35%] -translate-x-1/2 w-3 h-4 rounded-full
          ${isPlayer ? 'bg-sky-600' : 'bg-red-600'}
          ${animation?.type === 'dodge' ? 'animate-legDodge' : 'animate-legIdle'}`}
        ></div>
        
        {/* 오른다리 */}
        <div className={`absolute -bottom-1 right-[20%] translate-x-1/2 w-3 h-4 rounded-full
          ${isPlayer ? 'bg-sky-600' : 'bg-red-600'}
          ${animation?.type === 'dodge' ? 'animate-legDodge' : 'animate-legIdle'}`}
        ></div>
      </div>

      {damageText && (
        <div
          key={damageText.key}
          className={`absolute -top-5 left-1/2 -translate-x-1/2 z-10 font-bold animate-damagePopup ${
            damageText.isCritical ? 'text-yellow-400 text-3xl' : damageText.type === 'miss' ? 'text-sky-300 text-xl' : 'text-red-400 text-2xl'
          }`}
        >
          {damageText.type === 'miss' ? 'MISS!' : `-${damageText.amount}${damageText.isCritical ? ' 🔥' : ''}`}
        </div>
      )}
      {animation && animation.type === 'dodge' && (
         <div key={Date.now() + '-dodge'} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-sky-300 animate-actionText">DODGE!</div>
      )}
    </div>
  );
};


const CombatScene = ({ player = {}, opponent = {}, onBattleEnd }) => {
  const [playerHP, setPlayerHP] = useState(player.hp || 0);
  const [opponentHP, setOpponentHP] = useState(opponent.hp || 0);

  const [playerAnimation, setPlayerAnimation] = useState(null);
  const [opponentAnimation, setOpponentAnimation] = useState(null);
  const [playerDamageText, setPlayerDamageText] = useState(null);
  const [opponentDamageText, setOpponentDamageText] = useState(null);

  const battleLogRef = useRef([]);
  const [battleLog, setBattleLog] = useState([]);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const battleOverRef = useRef(false);
  const turnStats = useRef({ totalTurns: 0, totalDamage: 0, criticalHits: 0, dodges: 0, startTime: Date.now() });

  const [activeTurn, setActiveTurn] = useState(null);
  const [isBattleReady, setIsBattleReady] = useState(false); // New state for battle start delay

  const battleLogDivRef = useRef(null); // battleLog div ref 추가

  // Effect for initializing and resetting the battle
  useEffect(() => {
    if (!player.name || !opponent.name) return;

    setPlayerHP(player.hp);
    setOpponentHP(opponent.hp);
    turnStats.current = { totalTurns: 0, totalDamage: 0, criticalHits: 0, dodges: 0, startTime: Date.now() };
    battleLogRef.current = [];
    setBattleLog([]);
    setIsBattleOver(false);
    battleOverRef.current = false;
    setPlayerAnimation(null);
    setOpponentAnimation(null);
    setPlayerDamageText(null);
    setOpponentDamageText(null);
    setActiveTurn(null); // Reset active turn
    setIsBattleReady(false); // Reset battle readiness

    // Delay battle start by 1 second after component mounts/props change
    const battleStartTimer = setTimeout(() => {
      setActiveTurn(player.speed >= opponent.speed ? 'player' : 'opponent');
      setIsBattleReady(true); // Now the battle can proceed
    }, 1000);

    return () => clearTimeout(battleStartTimer);

  }, [player, opponent]);

  // 한글 조사 자동 변환 함수
  function josa(name, josaStr) {
    // 받침 유무에 따라 조사 선택 (을/를, 이/가 등)
    const lastChar = name.charAt(name.length - 1);
    const uni = lastChar.charCodeAt(0);
    if (uni < 0xac00 || uni > 0xd7a3) return josaStr.split('/')[1] || josaStr; // 한글이 아니면 두번째
    const jong = (uni - 0xac00) % 28;
    return jong === 0 ? josaStr.split('/')[1] : josaStr.split('/')[0];
  }

  // Effect for managing the game loop (turns)
  useEffect(() => {
    // Only run if battle is ready, activeTurn is set, not over, and characters exist
    if (!isBattleReady || !activeTurn || battleOverRef.current || !player.name || !opponent.name) {
      return;
    }

    // ... (rest of the game loop useEffect remains the same as your provided version)
    if (playerHP <= 0 || opponentHP <= 0) {
      if (!battleOverRef.current) endBattle();
      return;
    }

    const currentAttacker = activeTurn === 'player' ? player : opponent;
    const currentDefender = activeTurn === 'player' ? opponent : player;
    const defenderId = activeTurn === 'player' ? 'opponent' : 'player';

    const processTurn = async () => {
      if (battleOverRef.current) return;

      turnStats.current.totalTurns++;
      let logEntry = `${currentAttacker.name}${josa(currentAttacker.name, '이/가')} ${currentDefender.name}${josa(currentDefender.name, '을/를')} 향해 공격!`;

      setPlayerAnimation(null); setOpponentAnimation(null);
      setPlayerDamageText(null); setOpponentDamageText(null);

      if (activeTurn === 'player') setPlayerAnimation({ type: 'attack' });
      else setOpponentAnimation({ type: 'attack' });
      
      await new Promise(resolve => setTimeout(resolve, 100)); // Attack animation duration

      if (battleOverRef.current) return;

      const hitRoll = Math.random();
      const effectiveAccuracy = currentAttacker.accuracy || 0.9; 
      const effectiveDodge = currentDefender.dodgeChance || 0;   

      if (hitRoll > effectiveAccuracy - effectiveDodge) {
        logEntry += ` 하지만 ${currentDefender.name}${josa(currentDefender.name, '이/가')} 재빠르게 회피!`;
        turnStats.current.dodges++;
        if (defenderId === 'player') {
            setPlayerAnimation({ type: 'dodge' });
            setPlayerDamageText({ type: 'miss', key: Date.now() }); 
        } else {
            setOpponentAnimation({ type: 'dodge' });
            setOpponentDamageText({ type: 'miss', key: Date.now() }); 
        }
        
        battleLogRef.current = [...battleLogRef.current, logEntry];
        setBattleLog([...battleLogRef.current]);

        setTimeout(() => {
          if (battleOverRef.current) return;
          if (defenderId === 'player') setPlayerAnimation(null); else setOpponentAnimation(null);
          if (playerHP > 0 && opponentHP > 0) {
            setActiveTurn(defenderId); 
          } else {
            if (!battleOverRef.current) endBattle();
          }
        }, 700); 
        return;
      }

      let damage = Math.max(1, Math.round((currentAttacker.attack || 10) * (1 - (currentDefender.defense || 0) / ((currentDefender.defense || 0) + 100))));
      const critRoll = Math.random();
      const isCritical = critRoll < (currentAttacker.criticalChance || 0);
      if (isCritical) {
        damage = Math.round(damage * (currentAttacker.criticalDamage || 1.5));
        logEntry += ` 치명타!`; // 한글 치명타
        turnStats.current.criticalHits++;
      }
      turnStats.current.totalDamage += damage;
      logEntry += ` ${currentDefender.name}${josa(currentDefender.name, '이/가')} ${damage}의 데미지를 입었습니다!`;

      const damageTextInfo = { amount: damage, isCritical, type: 'damage', key: Date.now() };
      let newDefenderHP;

      if (defenderId === 'player') {
        setPlayerHP(prev => {
          newDefenderHP = Math.max(0, prev - damage);
          return newDefenderHP;
        });
        setPlayerAnimation({ type: 'hit' });
        setPlayerDamageText(damageTextInfo);
      } else {
        setOpponentHP(prev => {
          newDefenderHP = Math.max(0, prev - damage);
          return newDefenderHP;
        });
        setOpponentAnimation({ type: 'hit' });
        setOpponentDamageText(damageTextInfo);
      }
      
      battleLogRef.current = [...battleLogRef.current, logEntry];
      setBattleLog([...battleLogRef.current]);

      setTimeout(() => {
        if (battleOverRef.current) return;
        if (defenderId === 'player') setPlayerAnimation(null); else setOpponentAnimation(null);

        if (newDefenderHP <= 0 || (defenderId === 'player' ? opponentHP : playerHP) <= 0) {
           if (!battleOverRef.current) endBattle();
        } else {
          setActiveTurn(defenderId);
        }
      }, 600);
    };
    
    const turnProcessDelay = battleLogRef.current.length > 0 ? 800 : 200; 
    const timeoutId = setTimeout(processTurn, turnProcessDelay);

    return () => clearTimeout(timeoutId); 

  }, [activeTurn, playerHP, opponentHP, isBattleOver, player, opponent, isBattleReady]); // Added isBattleReady

  // ... (endBattle function remains the same)
  const endBattle = () => {
    if (battleOverRef.current) return;
    battleOverRef.current = true;
    setIsBattleOver(true);

    setPlayerAnimation(null); setOpponentAnimation(null);

    let winner;
    let finalLogMessage = "";

    if (playerHP <= 0 && opponentHP <= 0) {
      winner = Math.random() < 0.5 ? player : opponent; 
      finalLogMessage = "무승부! 심판이 랜덤으로 승자를 결정합니다...";
    } else if (playerHP <= 0) {
      winner = opponent;
      finalLogMessage = `${opponent.name}${josa(opponent.name, '이/가')} 승리! ${player.name}${josa(player.name, '은/는')} 패배했습니다.`;
    } else if (opponentHP <= 0) {
      winner = player;
      finalLogMessage = `${player.name}${josa(player.name, '이/가')} 승리! ${opponent.name}${josa(opponent.name, '은/는')} 패배했습니다.`;
    } else {
      console.warn("endBattle called without a clear KO. This might be an issue or premature call.");
      winner = playerHP > opponentHP ? player : opponentHP > playerHP ? opponent : (Math.random() < 0.5 ? player : opponent);
      finalLogMessage = `${winner.name}${josa(winner.name, '이/가')} 판정승! (예상치 못한 종료)`;
    }
    
    battleLogRef.current = [...battleLogRef.current, finalLogMessage];
    setBattleLog([...battleLogRef.current]);

    const duration = ((Date.now() - turnStats.current.startTime) / 1000).toFixed(1);
    const reportedTurns = Math.ceil(turnStats.current.totalTurns / 2); 

    // null 방어: winner.wins, player.losses, opponent.losses
    winner.wins = typeof winner.wins === 'number' && !isNaN(winner.wins) && winner.wins >= 0 ? winner.wins : 0;
    player.losses = typeof player.losses === 'number' && !isNaN(player.losses) && player.losses >= 0 ? player.losses : 0;
    opponent.losses = typeof opponent.losses === 'number' && !isNaN(opponent.losses) && opponent.losses >= 0 ? opponent.losses : 0;

    setTimeout(() => {
        onBattleEnd(winner, { ...turnStats.current, duration, totalTurns: reportedTurns });
    }, 800); 
  };

  // battleLog가 갱신될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (battleLogDivRef.current) {
      battleLogDivRef.current.scrollTop = battleLogDivRef.current.scrollHeight;
    }
  }, [battleLog]);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 p-4">
      {/* Battle Arena and Stat Panels remain the same */}
      <div className="w-full h-48 md:h-60 flex items-center justify-around relative mb-4 p-2 bg-slate-900/30 rounded-xl shadow-inner">
        <AnimatedCharacterIcon character={player} animation={playerAnimation} damageText={playerDamageText} isPlayer={true} />
        <div className="text-3xl md:text-5xl text-slate-400 font-black animate-pulseVS">VS</div>
        <AnimatedCharacterIcon character={opponent} animation={opponentAnimation} damageText={opponentDamageText} isPlayer={false} />
      </div>

      <div className="w-full flex flex-col md:flex-row gap-4 px-4">
        <div className="w-full md:w-1/2">
          <CharacterStatPanel character={player} currentHP={playerHP} isPlayerCharacter={true} compareTarget={opponent} />
        </div>
        <div className="w-full md:w-1/2">
          <CharacterStatPanel character={opponent} currentHP={opponentHP} isPlayerCharacter={false} compareTarget={player} />
        </div>
      </div>

      <div
        ref={battleLogDivRef}
        className="w-full max-w-md mt-4 bg-slate-800/50 p-3 rounded-lg h-32 overflow-y-auto text-xs"
      >
        <h4 className="text-sm font-semibold text-slate-300 mb-2">Battle Log:</h4>
        {battleLog.map((log, index) => (
          <p key={index} className="text-slate-400 leading-tight">{log}</p>
        ))}
        {isBattleOver && <p className="text-yellow-400 font-semibold mt-2">Battle Ended!</p>}
      </div>

      {/* Styles remain the same */}
      <style>{`
        @keyframes damagePopup {
          0% { transform: scale(0.8) translateY(0) translateX(-50%); opacity: 1; }
          50% { transform: scale(1.3) translateY(-20px) translateX(-50%); }
          100% { transform: scale(1) translateY(-35px) translateX(-50%); opacity: 0; }
        }
        .animate-damagePopup { animation: damagePopup 0.8s ease-out forwards; }

        @keyframes hitShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px) rotate(-2deg); }
          50% { transform: translateX(10px) rotate(2deg); }
          75% { transform: translateX(-6px) rotate(-1deg); }
        }
        .animate-hitShake { animation: hitShake 0.35s ease-in-out; }
        
        @keyframes hitFlash {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(2.5) contrast(2); }
        }
        .animate-hitFlash { animation: hitFlash 0.3s ease-out; }

        @keyframes dodgeEffect { 
          0% { transform: translateX(0) scale(1); opacity: 1; }
          30% { transform: translateX(30px) scale(0.9) rotate(5deg); opacity: 0.7; }
          70% { transform: translateX(-20px) scale(0.95) rotate(-3deg); opacity: 0.8; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        .animate-dodgeEffect { animation: dodgeEffect 0.5s ease-out; }

        @keyframes playerAttack { 
          0% { transform: translateX(0) scale(1); }
          40% { transform: translateX(60px) scale(1.1) rotate(5deg); } 
          60% { transform: translateX(50px) scale(1.05) rotate(2deg); } 
          100% { transform: translateX(0) scale(1); } 
        }
        .animate-playerAttack { animation: playerAttack 0.7s ease-in-out; }

        @keyframes opponentAttack { 
          0% { transform: translateX(0) scale(1); }
          40% { transform: translateX(-60px) scale(1.1) rotate(-5deg); } 
          60% { transform: translateX(-50px) scale(1.05) rotate(-2deg); } 
          100% { transform: translateX(0) scale(1); } 
        }
        .animate-opponentAttack { animation: opponentAttack 0.7s ease-in-out; }
        
        @keyframes actionText { 
            0% { opacity: 1; transform: translateY(0) scale(1) translateX(-50%) translateY(-50%); }
            100% { opacity: 0; transform: translateY(-30px) scale(1.2) translateX(-50%) translateY(-50%); }
        }
        .animate-actionText { animation: actionText 0.8s ease-out forwards; }

        @keyframes pulseVS {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        .animate-pulseVS { animation: pulseVS 1.5s ease-in-out infinite; }

        /* 팔 애니메이션 */
        @keyframes leftArmAttack {
          0% { transform: translateY(-50%) rotate(0deg); }
          50% { transform: translateY(-70%) rotate(-45deg); }
          100% { transform: translateY(-50%) rotate(0deg); }
        }
        .animate-leftArmAttack { animation: leftArmAttack 0.7s ease-in-out; }

        @keyframes rightArmAttack {
          0% { transform: translateY(-50%) rotate(0deg); }
          50% { transform: translateY(-70%) rotate(45deg); }
          100% { transform: translateY(-50%) rotate(0deg); }
        }
        .animate-rightArmAttack { animation: rightArmAttack 0.7s ease-in-out; }

        @keyframes leftArmAttackOpp {
          0% { transform: translateY(-50%) rotate(0deg); }
          50% { transform: translateY(-70%) rotate(-45deg); }
          100% { transform: translateY(-50%) rotate(0deg); }
        }
        .animate-leftArmAttackOpp { animation: leftArmAttackOpp 0.7s ease-in-out; }

        @keyframes rightArmAttackOpp {
          0% { transform: translateY(-50%) rotate(0deg); }
          50% { transform: translateY(-70%) rotate(45deg); }
          100% { transform: translateY(-50%) rotate(0deg); }
        }
        .animate-rightArmAttackOpp { animation: rightArmAttackOpp 0.7s ease-in-out; }

        @keyframes armIdle {
          0%, 100% { transform: translateY(-50%) rotate(-15deg); }
          50% { transform: translateY(-50%) rotate(15deg); }
        }
        .animate-armIdle { animation: armIdle 2s ease-in-out infinite; }

        /* 다리 애니메이션 */
        @keyframes legDodge {
          0% { transform: translateX(-50%) rotate(0deg); }
          25% { transform: translateX(-60%) rotate(-15deg); }
          75% { transform: translateX(-40%) rotate(15deg); }
          100% { transform: translateX(-50%) rotate(0deg); }
        }
        .animate-legDodge { animation: legDodge 0.5s ease-out; }

        @keyframes legIdle {
          0%, 100% { transform: translateX(-50%) rotate(-8deg); }
          50% { transform: translateX(-50%) rotate(8deg); }
        }
        .animate-legIdle { animation: legIdle 3s ease-in-out infinite; }
        @keyframes tubeWobble {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          50% { transform: rotate(-10deg); }
          75% { transform: rotate(12deg); }
        }
        .animate-tubeWobble {
          animation: tubeWobble 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CombatScene;