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
  const [newCharacterId, setNewCharacterId] = useState(null);

  const fetchCharacters = async (userId, shouldSetPlayer = true) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/characters/list/${userId}`);
      const data = await response.json();
      const charactersArr = Array.isArray(data.result) ? data.result : [];
      console.log('Fetched characters:', charactersArr); // 디버깅을 위한 로그
      const formattedCharacters = charactersArr.map(char => ({
        character_id: char.characterId,
        name: char.name,
        desc: '',
        icon: char.name ? char.name[0] : '?',
        hp: char.hp,
        attack: char.attack,
        defense: char.defense,
        experience: char.exp || 0,
        wins: char.wins ?? 0,
        losses: char.losses ?? 0,
        userId: userId
      }));
      setCharacters(formattedCharacters);
      const lastUsedId = localStorage.getItem(`lastCharacter_${userId}`);
      if (shouldSetPlayer && formattedCharacters.length > 0) {
        let selectedCharacter = null;
        if (lastUsedId) {
          selectedCharacter = formattedCharacters.find(c => String(c.character_id) === String(lastUsedId));
        }
        if (!selectedCharacter) {
          selectedCharacter = formattedCharacters[0];
        }
        setPlayer(selectedCharacter);
        localStorage.setItem(`lastCharacter_${userId}`, selectedCharacter.character_id);
      }
      return formattedCharacters;
    } catch (error) {
      console.error('캐릭터 로드 실패:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUser({ userId: storedUserId });
    }
  }, []);

  useEffect(() => {
    if (user?.userId) {
      fetchCharacters(user.userId);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (characters.length > 0) {
      if (stage === 'form') {
        setStage('battle');
      }
    } else {
      setStage('form');
    }
  }, [characters, user]);

  async function handleCreate(character) {
    setStage("thinking");
    if (user?.userId) {
      // 캐릭터 생성 후, 서버에서 최신 목록을 받아옴
      const updatedCharacters = await fetchCharacters(user.userId, false);
      // 방금 만든 캐릭터를 찾음 (이름, 스탯 등으로 매칭)
      const found = updatedCharacters.find(
        c => c.name === character.name && c.hp === character.hp && c.attack === character.attack
      );
      if (found) {
        setPlayer(found);
        setNewCharacterId(found.character_id);
        localStorage.setItem(`lastCharacter_${user.userId}`, found.character_id);
      }
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

  if (loading || (user && characters.length === 0 && stage !== 'form')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-lg font-bold mt-2">로딩 중...</div>
        </div>
      </div>
    );
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
          {stage === "form" && user?.userId && !loading && (
            <div className="transform transition-all duration-500 animate-fadeIn w-full">
              <CharacterForm onSubmit={handleCreate} userId={user.userId} />
            </div>
          )}

          {stage === "thinking" && player && (
            <AIThinkingDialog character={player} onDone={() => setStage("stat")} />
          )}

          {stage === "stat" && player && (
            <StatRevealDialog character={player} onDone={async () => {
              if (user?.userId && player?.character_id) {
                localStorage.setItem(`lastCharacter_${user.userId}`, player.character_id);
                const updatedCharacters = await fetchCharacters(user.userId, false);
                if (newCharacterId) {
                  const found = updatedCharacters.find(c => String(c.character_id) === String(newCharacterId));
                  if (found) setPlayer(found);
                  setNewCharacterId(null);
                }
              }
              setStage("battle");
            }} />
          )}

          {stage === "battle" && player && (
            <div className="transform transition-all duration-500 animate-fadeIn w-full">
              <BattleArena 
                player={player} 
                characters={characters}
                onCharacterSelect={handleCharacterSelect}
                onRefreshCharacters={() => fetchCharacters(user.userId)}
                user={user}
                onCreateCharacter={handleCreate}
                onRequestCreateCharacter={() => setStage('form')}
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