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

export default function BattleArena({ player, onStartCombat, characters, onCharacterSelect, onRefreshCharacters, user, onCreateCharacter, onRequestCreateCharacter }) {
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
      const res = await fetch(`/api/characters/battle/${currentPlayer.character_id}`);
      const data = await res.json();
      clearInterval(searchInterval);
      if (data.isSuccess && Array.isArray(data.result) && data.result[1]) {
        // 1번 인덱스가 상대방
        const opp = data.result[1];
        const enemy = {
          character_id: opp.characterId,
          name: opp.name,
          icon: opp.name ? opp.name[0] : '?',
          desc: opp.hp_reason || opp.name,
          hp: opp.hp, attack: opp.attack, defense: opp.defense,
          criticalChance: opp.criticalChance, criticalDamage: opp.criticalDamage,
          speed: opp.speed, dodgeChance: opp.dodgeChance, accuracy: opp.accuracy,
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

  useEffect(() => {
    // 캐릭터가 바뀔 때마다 장비 정보 불러오기
    async function fetchEquipments() {
      if (!currentPlayer?.character_id) return;
      try {
        const res = await fetch(`/api/characters/battle/${currentPlayer.character_id}`);
        const data = await res.json();
        console.log("Fetched equipments:", data);

        if (data.isSuccess && Array.isArray(data.result) && data.result[0]?.equipments) {
          // type: weapon, hat, top, shoes
          const eqMap = {};
          data.result[0].equipments.forEach(eq => {
            eqMap[eq.type] = eq;
          });
          setEquipped(eqMap);
          setAllEquipments(data.result[0].equipments); // 전체 장비 저장
        } else {
          setEquipped({});
          setAllEquipments([]);
        }
      } catch (e) {
        setEquipped({});
        setAllEquipments([]);
      }
    }
    fetchEquipments();
  }, [currentPlayer?.character_id]);

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
    return <CombatSceneWrapper player={currentPlayer} opponent={opponent} onBattleEnd={handleBattleEnd} />;
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
      <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 mb-6">
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

        {/* Stat Grid */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          {[
            { icon: "❤️", label: "체력", value: currentPlayer.hp },
            { icon: "⚔️", label: "공격", value: currentPlayer.attack },
            { icon: "🛡️", label: "방어", value: currentPlayer.defense },
            { icon: "💨", label: "속도", value: currentPlayer.speed },
            { icon: "💥", label: "치명타", value: `${Math.round(currentPlayer.criticalChance * 100)}%` },
            { icon: "⚡", label: "치명피해", value: `${currentPlayer.criticalDamage}x` },
            { icon: "🌪️", label: "회피", value: `${Math.round(currentPlayer.dodgeChance * 100)}%` },
            { icon: "🎯", label: "정확도", value: `${Math.round(currentPlayer.accuracy * 100)}%` },
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
          {equipmentTypes.map(({ key, label }) => {
            const isEmpty = !equipped[key];
            return (
              <div key={key} className="flex flex-col items-center w-16 relative">
                <button
                  onClick={() => {
                    if (isEmpty) {
                      handleEmptyEquipClick(key);
                    } else {
                      setShowEquipModal(key);
                    }
                  }}
                  className={`w-16 h-16 rounded-xl border border-white/30 transition-all duration-200 shadow-xl flex items-center justify-center text-xl
                    bg-slate-800 hover:bg-slate-700
                    ${isEmpty ? `empty-equip ${shakeEquip[key] ? 'animate-equip-shake border-red-500 bg-red-900/40' : ''}` : ''}`}
                  style={{ cursor: 'pointer' }}
                  aria-label={label + (isEmpty ? ' 비어있음' : '')}
                >
                  {isEmpty ? (
                    <span className="inline-block w-8 h-8 rounded-full border-2 border-dashed border-slate-500 bg-transparent"></span>
                  ) : (
                    equipped[key]?.name
                  )}
                </button>
                <span className="text-[10px] text-slate-300 mt-1">{label}</span>
                {/* 비어있는 칸 클릭 메시지 */}
                {emptyMsg[key] && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-20 animate-equip-msg bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-xl shadow-lg pointer-events-none select-none z-20 w-max whitespace-nowrap">
                    ⚠️ {label}{label === '신발' ? '이' : '가'} 없습니다!
                  </div>
                )}
              </div>
            );
          })}
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
          onEquip={(equipType, newEquipment, updatedCharacter) => {
            setEquipped(prev => ({ ...prev, [equipType]: newEquipment }));
            setCurrentPlayer({ ...updatedCharacter, wins: updatedCharacter?.wins ?? 0, losses: updatedCharacter?.losses ?? 0 });
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
          15% { transform: translateX(-6px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }
        .animate-equip-shake {
          animation: equip-shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
        .empty-equip {
          border-style: dashed !important;
        }
        @keyframes equip-msg {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          20% { opacity: 1; transform: translateY(0) scale(1); }
          80% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-20px) scale(0.95); }
        }
        .animate-equip-msg {
          animation: equip-msg 1.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}