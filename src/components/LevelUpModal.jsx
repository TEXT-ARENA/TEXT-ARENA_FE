import React, { useState } from "react";

const equipmentMap = {
  2: "weapon",
  3: "hat", 
  4: "top",
  5: "shoes",
};

const equipmentDisplayMap = {
  2: "무기",
  3: "모자", 
  4: "상의",
  5: "신발",
};

export default function LevelUpModal({ level, characterId, onEquip }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const equipType = equipmentMap[level];
  const equipDisplayName = equipmentDisplayMap[level];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!equipType || !characterId) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`/api/characters/${characterId}/equipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipmentType: equipType,
          equipmentName: name,
          description: desc
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '장비 생성에 실패했습니다.');
      }

      if (data.isSuccess) {
        // 새로 생성된 장비 정보를 찾기
        const newEquipment = data.result.equipments?.find(
          equipment => equipment.type === equipType && equipment.name === name
        );
        
        onEquip(equipType, newEquipment || { name, type: equipType }, data.result);
      } else {
        throw new Error(data.message || '장비 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('Equipment creation error:', err);
      setError(err.message || '장비 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-2xl shadow-xl w-full max-w-sm">
        <h3 className="text-xl font-bold mb-2">축하합니다! 레벨 {level} 달성</h3>
        <p className="mb-4">'{equipDisplayName}'를 획득했습니다! 어떤 {equipDisplayName}인지 설명해 주세요.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            className="w-full border rounded-lg px-3 py-2"
            required
            disabled={loading}
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="설명"
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !name.trim() || !desc.trim()}
            className="w-full py-2 rounded-lg bg-purple-600 text-white font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "생성 중..." : "확인"}
          </button>
        </form>
      </div>
    </div>
  );
}