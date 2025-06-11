import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import CharacterForm from "./components/CharacterForm";
import StatRevealDialog from "./components/StatRevealDialog";
import BattleArena from "./components/BattleArena";
import AIThinkingDialog from "./components/AIThinkingDialog";


export default function App() {
  const [user, setUser] = useState(null);
  const [player, setPlayer] = useState(null);
  const [stage, setStage] = useState("form");
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCharacters = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/characters?userId=${userId}`);
      const data = await response.json();
      
      const formattedCharacters = data.map(char => ({
        character_id: char.character_id,
        name: char.character_name,
        desc: char.hp_reason || "설명 없음",
        icon: "⚔️",
        hp: char.hp,
        attack: char.attack,
        defense: char.defense,
        speed: char.speed,
        criticalChance: char.critical_chance,
        criticalDamage: char.critical_damage,
        dodgeChance: char.dodge_chance,
        accuracy: char.accuracy,
        level: char.level,
        exp: char.exp,
        wins: char.wins || 0,
        losses: char.losses || 0,
        userId: char.user_id
      }));
      
      setCharacters(formattedCharacters);
      
      const lastUsedId = localStorage.getItem(`lastCharacter_${userId}`);
      if (lastUsedId && formattedCharacters.length > 0) {
        const lastCharacter = formattedCharacters.find(c => c.character_id === lastUsedId);
        if (lastCharacter) {
          setPlayer(lastCharacter);
          setStage("battle");
        }
      }
    } catch (error) {
      console.error('캐릭터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUser({ userId: storedUserId });
      fetchCharacters(storedUserId);
    }
  }, []);

  function handleCreate(character) {
    setPlayer(character);
    setStage("thinking");
    if (user?.userId) {
      fetchCharacters(user.userId);
    }
  }

  function handleCharacterSelect(character) {
    setPlayer(character);
    localStorage.setItem(`lastCharacter_${user.userId}`, character.character_id);
    setStage("battle");
  }

  function handleLogout() {
    localStorage.removeItem('userId');
    setUser(null);
    setPlayer(null);
    setStage("form");
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    // 전체 앱을 감싸는 컨테이너
    <div
      className="text-xs"
      style={{ fontFamily: "'Noto Sans KR', Pretendard, sans-serif" }}
    >
      {/* 1. 고정된 배경 레이어 */}
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute -top-40 -left-40 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>
      
      {/* 2. 스크롤 가능한 콘텐츠 레이어 */}
      <div className="relative min-h-screen w-full flex flex-col items-center justify-start pt-8 pb-20 transition-all duration-700">
        
        {/* 타이틀 */}
        <div
          className="relative z-10 text-center mb-4 cursor-pointer"
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

        {/* 로그아웃 버튼 */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={handleLogout}
            className="bg-red-500/80 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
          >
            로그아웃
          </button>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="relative z-10 w-full max-w-md px-4 py-4 flex flex-col gap-6 items-center justify-center">
          {stage === "form" && user?.userId && (
            <div className="transform transition-all duration-500 animate-fadeIn w-full">
              <CharacterForm onSubmit={handleCreate} userId={user.userId} />
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
              <BattleArena 
                player={player} 
                characters={characters}
                onCharacterSelect={handleCharacterSelect}
                onRefreshCharacters={() => fetchCharacters(user.userId)}
              />
            </div>
          )}
        </div>

        {/* 하단 */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-slate-400 text-xs font-medium opacity-60">
          <div className="flex items-center gap-1">
            <span>Powered by AI</span>
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
          </div>
        </div>

        {/* 애니메이션 정의 */}
        <style dangerouslySetInnerHTML={{
          __html: `
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
          `
        }} />
      </div>
    </div>
  );
}