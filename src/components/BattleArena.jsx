// BattleArena.jsx
import React, { useState, useEffect } from "react";
import CombatSceneWrapper from "./CombatSceneWrapper";
import CharacterList from "./CharacterList";
import CharacterForm from "./CharacterForm";
import LevelUpModal from "./LevelUpModal";
import { Menu } from "lucide-react";
import StatRevealDialog from "./StatRevealDialog";
import AIThinkingDialog from "./AIThinkingDialog";

const equipmentTypes = [
  { key: "weapon", label: "무기" },
  { key: "hat", label: "모자" },
  { key: "top", label: "상의" },
  { key: "shoes", label: "신발" },
];

const expNeeded = [0, 100, 150, 200, 250, 300];

const defaultStats = {
  hp: 100,
  attack: 20,
  defense: 10,
  speed: 50,
  criticalChance: 0.1,
  criticalDamage: 1.5,
  dodgeChance: 0.05,
  accuracy: 0.9,
  level: 1,
  exp: 0,
  maxExp: expNeeded[1],
  wins: 0,
  losses: 0
};

// bonusType -> statKey 매핑 (컴포넌트 전체에서 사용)
const bonusTypeToStatKey = {
  hpBonus: "hp",
  attackBonus: "attack",
  defenseBonus: "defense",
  speedBonus: "speed",
  criticalChanceBonus: "criticalChance",
  criticalDamageBonus: "criticalDamage",
  dodgeChanceBonus: "dodgeChance",
  accuracyBonus: "accuracy"
};

export default function BattleArena({ player, onStartCombat, characters, onCharacterSelect, onRefreshCharacters, user, onCreateCharacter, onRequestCreateCharacter, fetchCharacters }) {
  const [opponent, setOpponent] = useState(null);
  const [showCombat, setShowCombat] = useState(false);
  const [matchmakingPhase, setMatchmakingPhase] = useState("idle");
  const [searchTime, setSearchTime] = useState(0);
  const [equipped, setEquipped] = useState({});
  const [allEquipments, setAllEquipments] = useState([]); // 전체 보유 장비
  const [showEquipModal, setShowEquipModal] = useState(null);
  const [showCharacterList, setShowCharacterList] = useState(false);
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState({ ...defaultStats, ...player, wins: player?.wins ?? 0, losses: player?.losses ?? 0 });

  const [levelUp, setLevelUp] = useState(null);
  const [showStatDialog, setShowStatDialog] = useState(false);
  const [showThinkingDialog, setShowThinkingDialog] = useState(false);
  const [newCharacter, setNewCharacter] = useState(null);
  const [shakeEquip, setShakeEquip] = useState({}); // 장비 흔들림 상태
  const [emptyMsg, setEmptyMsg] = useState({}); // 비어있는 칸 클릭 메시지 상태

  const handleFindOpponent = async () => {
    if (!currentPlayer?.character_id) {
      alert('캐릭터가 정상적으로 생성되지 않았습니다. 다시 시도해 주세요.');
      return;
    }
    setMatchmakingPhase("searching");
    setSearchTime(0);
    const searchInterval = setInterval(() => setSearchTime(prev => prev + 0.1), 100);
    try {
      // 서버에서 상대방 정보 받아오기
      const res = await fetch(`http://18.209.30.21:8080/api/characters/battle/${currentPlayer.character_id}`);
      const data = await res.json();
      clearInterval(searchInterval);
      if (data.isSuccess && Array.isArray(data.result) && data.result[1]) {
        // 1번 인덱스가 상대방
        const opp = data.result[1];
        // 상대방 장비 보정 적용
        let oppStats = { ...opp };
        if (Array.isArray(opp.equipments)) {
          const statKeys = [
            "hp", "attack", "defense", "speed", "criticalChance", "criticalDamage", "dodgeChance", "accuracy"
          ];
          // bonusType -> statKey 매핑
          const bonusSum = {};
          statKeys.forEach(key => { bonusSum[key] = 0; });
          opp.equipments.forEach(eq => {
            if (eq && eq.bonusType && eq.bonusValue !== undefined) {
              const statKey = bonusTypeToStatKey[eq.bonusType] || eq.bonusType.replace(/Bonus$/, '');
              if (bonusSum.hasOwnProperty(statKey)) {
                bonusSum[statKey] += Number(eq.bonusValue) || 0;
              }
            }
          });
          statKeys.forEach(key => {
            oppStats[key] = (opp[key] ?? 0) + (bonusSum[key] ?? 0);
          });
        }
        const enemy = {
          character_id: opp.characterId,
          name: opp.name,
          icon: opp.name ? opp.name[0] : '?',
          desc: opp.hp_reason || opp.name,
          hp: oppStats.hp, attack: oppStats.attack, defense: oppStats.defense,
          criticalChance: oppStats.criticalChance, criticalDamage: oppStats.criticalDamage,
          speed: oppStats.speed, dodgeChance: oppStats.dodgeChance, accuracy: oppStats.accuracy,
          wins: opp.wins ?? 0,
          losses: opp.losses ?? 0
        };
        setOpponent(enemy);
        setMatchmakingPhase("found");
        setTimeout(() => setShowCombat(true), 2500); // 2.5초 후 전투로 진입
      } else {
        setMatchmakingPhase("fail"); // 매칭 실패 안내
      }
    } catch (e) {
      clearInterval(searchInterval);
      setMatchmakingPhase("fail"); // 매칭 실패 안내
    }
  };

  const handleBattleEnd = (winner, battleResult) => {
    setShowCombat(false);
    setOpponent(null);
    setMatchmakingPhase("idle");

    if (onStartCombat) onStartCombat(winner, battleResult);
    if (typeof onRefreshCharacters === 'function') {
      onRefreshCharacters();
    }
  };

  // 캐릭터가 바뀔 때마다 장비 정보 불러오기
  async function fetchEquipments() {
    if (!currentPlayer?.character_id) return;
    try {
      const res = await fetch(`http://18.209.30.21:8080/api/characters/equipments/${currentPlayer.character_id}`);
      const data = await res.json();
      console.log("Fetched equipments:", data);

      if (data.isSuccess && Array.isArray(data.result)) {
        // type: weapon, hat, top, shoes
        const eqMap = {};
        data.result.forEach(eq => {
          eqMap[eq.type] = eq;
        });
        setEquipped(eqMap);
        setAllEquipments(data.result); // 전체 장비 저장
      } else {
        setEquipped({});
        setAllEquipments([]);
      }
    } catch (e) {
      setEquipped({});
      setAllEquipments([]);
    }
  }
  useEffect(() => {
    fetchEquipments();
  }, [currentPlayer?.character_id]);

  // currentPlayer의 level, exp, maxExp가 캐릭터 정보와 연동되도록 보정
  useEffect(() => {
    if (!player) return;
    setCurrentPlayer(prev => ({
      ...defaultStats,
      ...player,
      wins: player?.wins ?? 0,
      losses: player?.losses ?? 0,
      level: player?.level ?? 1,
      exp: player?.exp ?? 0,
      maxExp: player?.maxExp ?? 100
    }));
  }, [player]);

  // 각 장비별로 4레벨마다 반복적으로 획득 모달이 뜨도록 (2,6,10,.../3,7,11,.../4,8,12,.../5,9,13,...)
  const equipConfigs = [
    { type: 'weapon', base: 2 },
    { type: 'hat', base: 3 },
    { type: 'top', base: 4 },
    { type: 'shoes', base: 5 }
  ];
  useEffect(() => {
    for (const { type, base } of equipConfigs) {
      if ((currentPlayer.level - base) % 4 === 0 && currentPlayer.level >= base) {
        const neededCount = Math.floor((currentPlayer.level - base) / 4) + 1;
        const owned = allEquipments.filter(eq => eq.type === type).length;
        if (owned < neededCount) {
          const key = `${type}Prompted_${neededCount}_${currentPlayer.character_id}`;
          const prompted = localStorage.getItem(key);
          if (!prompted) {
            setLevelUp(currentPlayer.level);
            localStorage.setItem(key, '1');
          }
          break;
        }
      }
    }
  }, [currentPlayer.level, allEquipments]);

  // 흔들림 애니메이션 트리거 함수
  const handleEmptyEquipClick = (key) => {
    setShakeEquip((prev) => ({ ...prev, [key]: true }));
    setEmptyMsg((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setShakeEquip((prev) => ({ ...prev, [key]: false }));
    }, 600); // 애니메이션 지속 시간
    setTimeout(() => {
      setEmptyMsg((prev) => ({ ...prev, [key]: false }));
    }, 1500); // 메시지 사라지는 시간
  };

  if (showCharacterList) {
    return <CharacterList
      characters={characters} // 서버에서 가져온 캐릭터 목록 전달
      onBack={() => setShowCharacterList(false)}
      onSelect={(char) => {
        onCharacterSelect(char); // 상위 컴포넌트의 핸들러 사용
        setCurrentPlayer({ ...defaultStats, ...char, wins: char?.wins ?? 0, losses: char?.losses ?? 0 });
        setShowCharacterList(false);
      }}
      onCreate={() => {
        setShowCharacterList(false);
        if (typeof onRequestCreateCharacter === 'function') {
          onRequestCreateCharacter();
        }
      }}
      onRefresh={onRefreshCharacters} // 목록 새로고침 함수 전달
    />;
  }

  if (showCombat && opponent) {
    // 장비 보정값을 합산한 실제 전투용 플레이어 객체 생성
    const statKeys = [
      "hp", "attack", "defense", "speed", "criticalChance", "criticalDamage", "dodgeChance", "accuracy"
    ];
    // bonusType -> statKey 매핑
    const bonusSum = {};
    statKeys.forEach(key => { bonusSum[key] = 0; });
    Object.values(equipped).forEach(eq => {
      if (eq && eq.bonusType && eq.bonusValue !== undefined) {
        const statKey = bonusTypeToStatKey[eq.bonusType] || eq.bonusType.replace(/Bonus$/, '');
        if (bonusSum.hasOwnProperty(statKey)) {
          bonusSum[statKey] += Number(eq.bonusValue) || 0;
        }
      }
    });
    const playerWithEquip = { ...currentPlayer };
    statKeys.forEach(key => {
      playerWithEquip[key] = (currentPlayer[key] ?? 0) + (bonusSum[key] ?? 0);
    });
    return <CombatSceneWrapper player={playerWithEquip} opponent={opponent} onBattleEnd={handleBattleEnd} />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-6 min-h-screen text-white">
      {/* Header with hamburger */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCharacterList(true)}
          className="text-white p-2 rounded-xl hover:bg-white/20 transition"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Player Info + Stats */}
          <div className="
            bg-gradient-to-br from-white/15 via-white/10 to-white/5 
            backdrop-blur-2xl border border-white/30 
            rounded-3xl shadow-2xl shadow-black/20
            p-6 mb-6 
            relative overflow-hidden
            hover:shadow-3xl hover:shadow-black/30 
            transition-all duration-500
          ">
          {/* 배경 글로우 */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />
          <div className="relative z-10"></div>
          <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-black mb-1">{currentPlayer.name}</h3>
            <span className="text-lg font-medium text-blue-300">{currentPlayer.desc}Lv.{currentPlayer.level}</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-300">전적</div>
            <div className="text-lg font-bold">{currentPlayer.wins}승 {currentPlayer.losses}패</div>
          </div>
        </div>
        <div className="mb-3">
          <div className="text-xs text-slate-300 mb-1 flex justify-between">
            <span>경험치</span>
            <span>{currentPlayer.exp} / {currentPlayer.maxExp} XP</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-green-400 h-2 rounded-full"
              style={{ width: `${(currentPlayer.exp / currentPlayer.maxExp) * 100}%` }}
            />
          </div>
        </div>

        {/* Stat Grid - 3D 호버 효과와 글래스모피즘 적용 */}
        <div className="grid grid-cols-4 gap-3 text-xs">
          {(() => {
            // 장비 보너스 누적 계산
            const statKeys = [
              "hp", "attack", "defense", "speed", "criticalChance", "criticalDamage", "dodgeChance", "accuracy"
            ];
            const statLabels = [
              "체력", "공격", "방어", "속도", "치명타", "치명피해", "회피", "정확도"
            ];
            const statIcons = [
              "❤️", "⚔️", "🛡️", "💨", "💥", "⚡", "🌪️", "🎯"
            ];
            const statGradients = [
              "from-red-500/20 to-pink-500/20", // HP
              "from-orange-500/20 to-red-500/20", // Attack
              "from-blue-500/20 to-cyan-500/20", // Defense
              "from-green-500/20 to-emerald-500/20", // Speed
              "from-yellow-500/20 to-orange-500/20", // Critical Chance
              "from-purple-500/20 to-pink-500/20", // Critical Damage
              "from-cyan-500/20 to-blue-500/20", // Dodge
              "from-indigo-500/20 to-purple-500/20" // Accuracy
            ];
            
            // 장비 보너스 합산
            const bonusSum = {};
            statKeys.forEach(key => { bonusSum[key] = 0; });
            Object.values(equipped).forEach(eq => {
              if (eq && eq.bonusType && eq.bonusValue !== undefined) {
                const statKey = bonusTypeToStatKey[eq.bonusType] || eq.bonusType.replace(/Bonus$/, '');
                if (bonusSum.hasOwnProperty(statKey)) {
                  bonusSum[statKey] += Number(eq.bonusValue) || 0;
                }
              }
            });
            
            return statKeys.map((key, i) => {
              const base = currentPlayer[key] ?? 0;
              const bonus = bonusSum[key] ?? 0;
              let display, bonusDisplay = null;
              if (key === "criticalChance" || key === "dodgeChance" || key === "accuracy") {
                // %로 표기
                display = `${Math.round(base * 100)}%`;
                if (bonus !== 0) bonusDisplay = <span className="text-green-400 ml-1">(+{Math.round(bonus * 100)}%)</span>;
              } else if (key === "criticalDamage") {
                display = `${base}x`;
                if (bonus !== 0) bonusDisplay = <span className="text-green-400 ml-1">(+{bonus}x)</span>;
              } else {
                display = base;
                if (bonus !== 0) bonusDisplay = <span className="text-green-400 ml-1">(+{bonus})</span>;
              }
              
              return (
                <div
                  key={key}
                  className={`
                    stat-card group cursor-pointer
                    bg-gradient-to-br ${statGradients[i]}
                    backdrop-blur-xl border border-white/30
                    rounded-2xl px-3 py-4 
                    flex flex-col items-center justify-center h-24 w-full text-center
                    transition-all duration-300 ease-out
                    hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/20
                    hover:border-white/50 hover:backdrop-blur-2xl
                    relative overflow-hidden
                  `}
                >
                  {/* 배경 글로우 효과 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  
                  {/* 아이콘 */}
                  <div className="text-2xl mb-2 transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                    {statIcons[i]}
                  </div>
                  
                  {/* 수치 */}
                  <div className="text-sm font-bold text-white flex items-center justify-center mb-1 relative z-10">
                    <span className="group-hover:text-white transition-colors duration-300">
                      {display}
                    </span>
                    {bonusDisplay}
                  </div>
                  
                  {/* 라벨 */}
                  <div className="text-[10px] text-slate-300 group-hover:text-slate-200 transition-colors duration-300 relative z-10">
                    {statLabels[i]}
                  </div>
                  
                  {/* 호버 시 나타나는 광택 효과 */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Equipment Panel */}
      <div className="
        bg-gradient-to-br from-white/12 via-white/8 to-white/4
        backdrop-blur-2xl border border-white/25
        rounded-3xl shadow-xl shadow-black/10
        p-6 mb-6
        relative
      ">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/3 via-purple-500/3 to-pink-500/3 rounded-3xl" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            {equipmentTypes.map(({ key, label }) => {
              const isEmpty = !equipped[key];
              return (
                <div key={key} className="flex flex-col items-center w-18 relative">
                  <button
                    onClick={() => {
                      if (isEmpty) {
                        handleEmptyEquipClick(key);
                      } else {
                        setShowEquipModal(key);
                      }
                    }}
                    className={`
                      w-18 h-18 rounded-2xl 
                      border border-white/40 
                      transition-all duration-300 ease-out
                      shadow-lg flex items-center justify-center text-xl
                      backdrop-blur-xl
                      hover:scale-110 hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/20
                      ${isEmpty ? 
                        `bg-gradient-to-br from-slate-800/60 to-slate-900/60 hover:from-slate-700/60 hover:to-slate-800/60
                        ${shakeEquip[key] ? 'animate-equip-shake border-red-500/80 bg-gradient-to-br from-red-900/60 to-red-800/60' : ''}` 
                        : 
                        'bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:from-blue-400/30 hover:to-purple-400/30'
                      }
                    `}
                    style={{ cursor: 'pointer' }}
                    aria-label={label + (isEmpty ? ' 비어있음' : '')}
                  >
                    {isEmpty ? (
                      <span className="inline-block w-10 h-10 rounded-full border-2 border-dashed border-slate-400/60 bg-transparent"></span>
                    ) : (
                      equipped[key]?.name && 
                      <span className="text-sm font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        [{equipped[key]?.name[0]}]
                      </span>
                    )}
                  </button>
                  <span className="text-xs text-slate-300 mt-2 font-medium">{label}</span>
                  
                  {/* 비어있는 칸 클릭 메시지 개선 */}
                  {emptyMsg[key] && (
                    <div className="
                      absolute left-1/2 -translate-x-1/2 top-20 
                      animate-equip-msg
                      bg-gradient-to-r from-red-500/95 to-pink-500/95 
                      backdrop-blur-xl border border-red-300/50
                      text-white text-xs font-bold 
                      px-4 py-2 rounded-2xl 
                      shadow-xl shadow-red-500/30
                      pointer-events-none select-none z-30 
                      w-max whitespace-nowrap
                    ">
                      ⚠️ {label}{label === '신발' ? '이' : '가'} 없습니다!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
            <p className="text-slate-300">지금 바로 대결해 보세요</p>
          </div>
          <button
            onClick={handleFindOpponent}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-110 text-white font-black py-4 px-12 rounded-2xl shadow-xl transition-all duration-200 hover:scale-105"
            disabled={!currentPlayer?.character_id}
            style={!currentPlayer?.character_id ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            🔍 게임 찾기
          </button>
          {!currentPlayer?.character_id && (
            <div className="text-red-400 mt-2 text-sm font-bold">캐릭터가 정상적으로 생성되지 않았습니다. 새로고침 후 다시 시도해 주세요.</div>
          )}
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
              <div>• 랜덤 매칭!</div>
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

      {/* 매칭 실패 안내 */}
      {matchmakingPhase === "fail" && (
        <div className="text-center bg-gradient-to-br from-red-900/40 to-orange-900/40 backdrop-blur-xl p-8 rounded-3xl border border-red-500/30 animate-pulse">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-2xl font-black mb-2 text-red-300">상대를 찾지 못했습니다</h2>
            <p className="text-red-200">잠시 후 다시 시도해 주세요</p>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white text-black p-6 rounded-2xl shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">{equipmentTypes.find(e=>e.key===showEquipModal)?.label || showEquipModal} 장비 선택</h3>
            <div className="grid grid-cols-1 gap-3">
              {allEquipments.filter(eq => eq.type === showEquipModal).length === 0 && (
                <div className="text-center text-slate-400 py-4">보유한 장비가 없습니다.</div>
              )}
              {allEquipments.filter(eq => eq.type === showEquipModal).map(eq => (
                <button
                  key={eq.id || eq.name}
                  onClick={() => {
                    setEquipped(prev => ({ ...prev, [showEquipModal]: eq }));
                    // 장비 선택 시 localStorage에 저장
                    if (showEquipModal === 'weapon' && eq.id) {
                      localStorage.setItem(`selectedWeapon_${currentPlayer.character_id}`, eq.id);
                    }
                    if (showEquipModal === 'hat' && eq.id) {
                      localStorage.setItem(`selectedHat_${currentPlayer.character_id}`, eq.id);
                    }
                    if (showEquipModal === 'top' && eq.id) {
                      localStorage.setItem(`selectedTop_${currentPlayer.character_id}`, eq.id);
                    }
                    if (showEquipModal === 'shoes' && eq.id) {
                      localStorage.setItem(`selectedShoes_${currentPlayer.character_id}`, eq.id);
                    }
                    setShowEquipModal(null);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-base text-center font-bold border border-slate-300"
                >
                  {eq.name} {eq.description ? <span className='text-xs text-slate-500'>({eq.description})</span> : null}
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

      {levelUp && (
        <LevelUpModal
          level={levelUp}
          characterId={currentPlayer.character_id}
          onEquip={async (equipType, newEquipment, updatedCharacter) => {
            await fetchEquipments();
            if (user?.userId && fetchCharacters) {
              const updatedCharacters = await fetchCharacters(user.userId, false);
              const found = updatedCharacters.find(c => String(c.character_id) === String(currentPlayer.character_id));
              if (found) setCurrentPlayer({ ...found, wins: found?.wins ?? 0, losses: found?.losses ?? 0 });
            }
            setLevelUp(null);
          }}
          onClose={() => setLevelUp(null)}
          equipDisplayName={showEquipModal || "장비"}
          equipType={showEquipModal || "무기"}
          character={currentPlayer}
          userId={user?.userId}
          onRefreshCharacters={onRefreshCharacters}
          onCharacterSelect={(char) => {
            setCurrentPlayer({ ...defaultStats, ...char, wins: char?.wins ?? 0, losses: char?.losses ?? 0 });
            setShowCharacterList(false);
          }}
          onBack={() => setShowCharacterList(false)}
          onCreate={() => {
            setShowCharacterList(false);
            setShowCharacterForm(true);
          }}
          characters={characters} // 서버에서 가져온 캐릭터 목록 전달
          onRefresh={onRefreshCharacters} // 목록 새로고침 함수 전달
        />
      )}

      {/* 커스텀 흔들림/메시지 애니메이션 스타일 */}
      <style>{`
        @keyframes equip-shake {
          0% { transform: translateX(0); }
          15% { transform: translateX(-8px) scale(1.02); }
          30% { transform: translateX(8px) scale(1.02); }
          45% { transform: translateX(-8px) scale(1.02); }
          60% { transform: translateX(8px) scale(1.02); }
          75% { transform: translateX(-4px) scale(1.01); }
          100% { transform: translateX(0) scale(1); }
        }
        .animate-equip-shake {
          animation: equip-shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        @keyframes equip-msg {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          15% {
            opacity: 1;
            transform: translateY(0) scale(1.05);
          }
          20% {
            transform: translateY(-2px) scale(1);
          }
          25% {
            opacity: 1;
            transform: scale(1);
          }
          /* 쇽 위로 올라가는 부분 */
          35% {
            opacity: 1;
            transform: translateY(-25px) scale(.9);
            filter: blur(0px);
          }
          100% {
            opacity: 0;
            transform: translateY(10px) scale(0.1);
            filter: blur(4px);
          }
        }
        .animate-equip-msg {
          animation: equip-msg 1.8s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        /* 글래스모피즘 효과 강화 */
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          border-radius: 1rem;
          pointer-events: none;
        }
        
        /* 3D 그림자 효과 */
        .stat-card:hover {
          box-shadow: 
            0 20px 40px rgba(0,0,0,0.3),
            0 15px 25px rgba(255,255,255,0.1),
            inset 0 1px 0 rgba(255,255,255,0.2);
        }
        
        /* 미세한 애니메이션 개선 */
        .stat-card {
          transform-style: preserve-3d;
        }
        
        .stat-card:hover {
          transform: 
            translateY(-8px) 
            scale(1.05) 
            rotateX(5deg) 
            rotateY(5deg);
        }
      `}</style>
    </div>
  );
}