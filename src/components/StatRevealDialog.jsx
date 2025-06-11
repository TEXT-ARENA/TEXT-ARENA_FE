import React, { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

export default function StatRevealDialog({ character, onDone }) {
  const [step, setStep] = useState(0);
  const containerRef = useRef(null);
  const statRefs = useRef([]); // 각 스탯 항목을 위한 ref 리스트

  useEffect(() => {
    if (step < 8) {
      const timer = setTimeout(() => setStep((prev) => prev + 1), 600);
      return () => clearTimeout(timer);
    } else {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        onDone && onDone();
      }, 2000);
    }
  }, [step, onDone]);

  useEffect(() => {
  if (!containerRef.current || step === 0) return;

  const container = containerRef.current;
  const currentItem = statRefs.current[step - 1];
  if (!currentItem) return;

  const itemRect = currentItem.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const isBelowView = itemRect.bottom > containerRect.bottom;

  if (isBelowView) {
    currentItem.scrollIntoView({ behavior: "smooth", block: "end" });
  }
}, [step]);



  const stats = [
    { label: "체력", value: character?.hp || 100, icon: "❤️", color: "from-red-500 to-pink-500" },
    { label: "공격력", value: character?.attack || 50, icon: "⚔️", color: "from-orange-500 to-red-500" },
    { label: "방어력", value: character?.defense || 30, icon: "🛡️", color: "from-blue-500 to-indigo-500" },
    { label: "치명타율", value: `${Math.round((character?.criticalChance || 0.1) * 100)}%`, icon: "💥", color: "from-yellow-500 to-orange-500" },
    { label: "치명타피해", value: `${character?.criticalDamage || 1.5}x`, icon: "⚡", color: "from-purple-500 to-pink-500" },
    { label: "속도", value: character?.speed || 25, icon: "💨", color: "from-green-500 to-emerald-500" },
    { label: "회피율", value: `${Math.round((character?.dodgeChance || 0.05) * 100)}%`, icon: "🌪️", color: "from-cyan-500 to-blue-500" },
    { label: "정확도", value: `${Math.round((character?.accuracy || 1) * 100)}%`, icon: "🎯", color: "from-indigo-500 to-purple-500" },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border-2 border-gray-100 overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">
              🤖
            </div>
            <div>
              <h3 className="text-xl font-black">AI 분석 완료!</h3>
              <p className="text-blue-100 text-sm font-medium">캐릭터 스탯을 분석했습니다</p>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500 ease-out shadow-lg"
              style={{ width: `${(step / 8) * 100}%` }}
            />
          </div>
          <p className="text-xs text-blue-100 mt-1 font-medium">{step}/8 스탯 공개됨</p>
        </div>

        {/* 스탯 목록 */}
        <div
          ref={containerRef}
          className="p-6 space-y-3 max-h-96 overflow-y-auto scroll-smooth"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              ref={(el) => (statRefs.current[index] = el)}
              className={`transform transition-all duration-500 ${
                index < step ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
              }`}
            >
              <div className={`bg-gradient-to-r ${stat.color} rounded-2xl p-4 text-white shadow-lg relative`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl filter drop-shadow-lg">{stat.icon}</span>
                    <span className="font-bold text-lg">{stat.label}</span>
                  </div>
                  <span className="text-2xl font-black text-white drop-shadow-lg">{stat.value}</span>
                </div>
                {index === step - 1 && (
                  <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse pointer-events-none" />
                )}
              </div>
            </div>
          ))}
          {/* 장비 정보 */}
          {character.equipments && character.equipments.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bold text-base mb-2">장비</h4>
              <ul className="space-y-1">
                {character.equipments.map(eq => (
                  <li key={eq.id} className="text-xs bg-slate-200/20 rounded px-2 py-1">
                    {eq.name} ({eq.type}) +{eq.bonusValue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* 상태이상 정보 */}
          {character.statusEffects && character.statusEffects.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold text-base mb-2">상태이상</h4>
              <ul className="space-y-1">
                {character.statusEffects.map((se, idx) => (
                  <li key={idx} className="text-xs bg-red-200/20 rounded px-2 py-1">
                    {se.type}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 푸터 */}
        {step >= 8 && (
          <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <div className="text-center">
              <div className="text-3xl mb-2">🎊</div>
              <h4 className="font-black text-lg">분석 완료!</h4>
              <p className="text-green-100 text-sm font-medium">모든 스탯이 공개되었습니다</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
