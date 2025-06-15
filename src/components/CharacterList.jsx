// CharacterList.jsx
import React, { useState } from "react";
import { Plus, Trash2, ChevronLeft } from "lucide-react";

export default function CharacterList({ onSelect, onBack, onCreate, characters, onRefresh }) {
  //const [characters, setCharacters] = useState(initialCharacters);
  const [isDeleting, setIsDeleting] = useState(null);


  const handleDelete = async (character) => {
    if (!confirm(`${character.name} 캐릭터를 삭제하시겠습니까?`)) return;
    
    try {
      setIsDeleting(character.character_id);
      const response = await fetch(`/api/characters/${character.character_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        onRefresh(); // 목록 새로고침
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.message || '캐릭터 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('캐릭터 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto text-white p-4">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="text-sm text-slate-300 flex items-center gap-1">
          <ChevronLeft size={16} /> 뒤로
        </button>
        <h2 className="mx-auto text-xl font-bold">캐릭터 목록</h2>
      </div>

       <div className="space-y-2 mb-6">
        {characters.map((char, i) => (
          <div
            key={char.character_id}
            className="bg-white/10 p-3 rounded-xl flex justify-between items-center hover:bg-white/20 transition cursor-pointer"
            onClick={() => onSelect(char)}
          >
            <div>
              <div className="font-bold text-lg flex items-center gap-2">
                <span>{char.name}</span>
              </div>
              <div className="text-xs text-slate-400">
                HP: {char.hp} | 공격: {char.attack} | 방어: {char.defense}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={e => { e.stopPropagation(); onSelect(char); }}
                className="text-sm bg-sky-600 px-3 py-1 rounded-lg hover:bg-sky-700"
              >
                선택
              </button>
              <button
                onClick={e => { e.stopPropagation(); handleDelete(char); }}
                disabled={isDeleting === char.character_id}
                className="text-red-400 hover:text-red-600 disabled:opacity-50"
              >
                {isDeleting === char.character_id ? "삭제중..." : <Trash2 size={18} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {characters.length < 5 && (
        <button
          onClick={onCreate}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-bold text-white hover:brightness-110 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
        >
          <Plus size={18} /> 새 캐릭터 생성 ({characters.length}/5)
        </button>
      )}
    </div>
  );
}
