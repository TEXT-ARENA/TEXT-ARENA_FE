import React, { useState } from "react";
import { fetchEquipment } from "../api/aiPrompt";

const equipmentMap = {
  2: "무기",
  3: "상의",
  4: "하의",
  5: "신발",
};

export default function LevelUpModal({ level, onEquip }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const equipType = equipmentMap[level];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!equipType) return;
    setLoading(true);
    try {
      const data = await fetchEquipment({ type: equipType, name, desc });
      onEquip(equipType, data[equipType] || { name, desc });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-2xl shadow-xl w-full max-w-sm">
        <h3 className="text-xl font-bold mb-2">축하합니다! 레벨 {level} 달성</h3>
        <p className="mb-4">'{equipType}'를 획득했습니다! 어떤 {equipType}인지 설명해 주세요.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            className="w-full border rounded-lg px-3 py-2"
            required
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="설명"
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-purple-600 text-white font-bold"
          >
            {loading ? "생성 중..." : "확인"}
          </button>
        </form>
      </div>
    </div>
  );
}
