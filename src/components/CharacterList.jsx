// CharacterList.jsx
import React, { useState } from "react";
import { Plus, Trash2, ChevronLeft } from "lucide-react";

const initialCharacters = [
  { name: "돼지", desc: "돼지다", icon: "🐷" },
  { name: "컴공 4학년 대학생", desc: "불쌍하다", icon: "😓" },
];

export default function CharacterList({ onSelect, onBack, onCreate }) {
  const [characters, setCharacters] = useState(initialCharacters);

  const handleDelete = (index) => {
    setCharacters(characters.filter((_, i) => i !== index));
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
            key={i}
            className="bg-white/10 p-3 rounded-xl flex justify-between items-center hover:bg-white/20 transition"
          >
            <div>
              <div className="font-bold text-lg">{char.name}</div>
              <div className="text-sm text-slate-300">{char.desc}</div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => onSelect(char)}
                className="text-sm bg-sky-600 px-3 py-1 rounded-lg hover:bg-sky-700"
              >
                선택
              </button>
              <button
                onClick={() => handleDelete(i)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={18} />
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
          <Plus size={18} /> 새 캐릭터 생성
        </button>
      )}
    </div>
  );
}
