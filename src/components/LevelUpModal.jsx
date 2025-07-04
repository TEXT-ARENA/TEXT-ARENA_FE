import React, { useState } from "react";
import ConfettiEffect from "./ConfettiEffect";
import AnimatedHangingCharacter from "./AnimatedHangingCharacter";
import { PartyConfettiEffect } from "./ConfettiEffect";

const equipmentMap = {
  2: "무기",
  3: "모자", 
  4: "상의",
  5: "신발",
};

const equipmentDisplayMap = {
  2: "무기",
  3: "모자", 
  4: "상의",
  5: "신발",
};

// 한글-영문 장비 타입 매핑
const typeMap = {
  '무기': 'weapon',
  '모자': 'hat',
  '상의': 'top',
  '신발': 'shoes'
};

export default function LevelUpModal({ level, characterId, onEquip }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bonusReason, setBonusReason] = useState("");
  
  const equipType = equipmentMap[level];
  const equipDisplayName = equipmentDisplayMap[level];

  // onEquip 호출 시 한글 타입을 영문 타입으로 변환해서 전달
  const handleEquip = async (selectedType, ...rest) => {
    const apiType = typeMap[selectedType] || selectedType;
    await onEquip(apiType, ...rest);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!equipType || !characterId) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`http://18.209.30.21:8080/api/characters/${characterId}/equipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipmentType: typeMap[equipType] || equipType,
          equipmentName: name,
          description: desc
        })
      });
      const data = await response.json();
      if (!response.ok) {
        console.error('장비 생성 실패', {
          status: response.status,
          statusText: response.statusText,
          requestBody: {
            equipmentType: typeMap[equipType] || equipType,
            equipmentName: name,
            description: desc
          },
          response: data
        });
        throw new Error(data.message || '장비 생성에 실패했습니다.');
      }
      if (data.isSuccess) {
        console.log('장비 생성 성공:', data.result);
        // bonusType_reason 추출
        let bonusReason = data.result.bonusType_reason;
        if (!bonusReason) {
          const fallback = ["흠", "고민중", "고민중학교", "뭘로할까"];
          bonusReason = fallback[Math.floor(Math.random() * fallback.length)];
        }
        setBonusReason(bonusReason);
        const newEquipment = data.result.equipments?.find(
          equipment => equipment.type === equipType && equipment.name === name
        );
        handleEquip(equipType, newEquipment || { name, type: equipType }, data.result);
      } else {
        throw new Error(data.message || '장비 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('장비 생성 중 예외 발생:', err);
      setError(err.message || '장비 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  // 그래픽 스타일 개선
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900/80 via-purple-900/80 to-slate-900/80 backdrop-blur-sm">
      {/* 파티컬러 confetti 배경 */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <PartyConfettiEffect />
      </div>
      <div className="relative bg-gradient-to-br from-white/90 to-blue-100/90 rounded-3xl shadow-2xl border-2 border-purple-300/40 p-8 w-full max-w-2xl min-h-[480px] animate-fadeInUp overflow-visible flex flex-col items-center justify-center z-20 min-w-[400px]">
        {/* 축하 이펙트 */}
        <ConfettiEffect />
        <div className="absolute -top-8 left-16/30 -translate-x-1/2 flex justify-center pointer-events-none select-none z-20">
          <AnimatedHangingCharacter />
        </div>

        <h3 className="text-2xl font-black text-purple-700 mb-2 mt-8 text-center drop-shadow">레벨 {level} 달성!</h3>
        {equipDisplayName ? (
          <p className="mb-6 text-center text-blue-700 font-semibold animate-fadeIn">'{equipDisplayName}' 장비를 획득했습니다!<br/>어떤 {equipDisplayName}인지 설명해 주세요.</p>
        ) : (
          <p className="mb-6 text-center text-red-500 font-semibold">장비 타입을 찾을 수 없습니다. (level: {level})</p>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-center shadow animate-shake">
            <span className="font-bold">⚠️ {error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-lg mx-auto">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600 ml-1">장비 이름</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="예: 강력한 검"
              className="w-full rounded-xl px-4 py-3 border-2 border-purple-200 bg-white/80 text-slate-800 font-bold shadow-inner focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition text-lg placeholder-slate-400 animate-fadeIn"
              required
              disabled={loading || !equipType}
              maxLength={12}
            />
            <div className="text-right text-xs text-slate-400">{name.length} / 12자</div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600 ml-1">장비 설명</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="예: 전설의 힘이 깃든 검입니다."
              className="w-full rounded-xl px-4 py-3 border-2 border-blue-200 bg-white/80 text-slate-800 font-medium shadow-inner focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition min-h-[64px] placeholder-slate-400 animate-fadeIn"
              rows={3}
              required
              disabled={loading || !equipType}
              maxLength={30}
            />
            <div className="text-right text-xs text-slate-400">{desc.length} / 30자</div>
          </div>
          <button
            type="submit"
            disabled={loading || !equipType || !name.trim() || !desc.trim()}
            className={`w-full py-3 rounded-2xl font-extrabold text-lg shadow-xl transition-all duration-200
              ${loading || !equipType || !name.trim() || !desc.trim()
                ? 'bg-slate-400 text-white cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:brightness-110 text-white hover:scale-[1.03]'}
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></span>
                생성 중...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="text-xl">🛡️</span> 확인
              </span>
            )}
          </button>
        </form>
        {/* bonusType_reason 상상 말풍선 이펙트 */}
        {bonusReason && (
          <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bonusBalloon">
            <div className="bg-white text-blue-700 font-bold px-6 py-3 rounded-2xl shadow-xl border-2 border-blue-300 text-lg relative">
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-l-2 border-b-2 border-blue-300 rotate-45"></span>
              {bonusReason}
            </div>
          </div>
        )}
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeInUp { animation: fadeInUp 0.7s cubic-bezier(.4,2,.3,1) forwards; }
          @keyframes shake {
            0% { transform: translateX(0); }
            20% { transform: translateX(-6px); }
            40% { transform: translateX(6px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
            100% { transform: translateX(0); }
          }
          .animate-shake { animation: shake 0.4s; }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn { animation: fadeIn 1.2s cubic-bezier(.4,2,.3,1) forwards; }
          .animate-bounce { animation: bounce 1.2s infinite alternate cubic-bezier(.4,2,.3,1); }
          @keyframes bounce {
            0% { transform: translateY(0); }
            100% { transform: translateY(-8px); }
          }
          @keyframes bonusBalloon {
            0% { opacity: 0; transform: translateY(40px) scale(0.95); }
            10% { opacity: 1; transform: translateY(0) scale(1); }
            80% { opacity: 1; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(-40px) scale(0.95); }
          }
          .animate-bonusBalloon {
            animation: bonusBalloon 2.5s cubic-bezier(.36,.07,.19,.97) both;
          }
        `}</style>
      </div>
    </div>
  );
}