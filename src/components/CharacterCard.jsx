import React, { useRef } from "react";

export default function CharacterCard({ character, isPlayer }) {
  const cardRef = useRef();

  function handleMouseMove(e) {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    card.style.transform = `perspective(1000px) rotateY(${x / 15}deg) rotateX(${-y / 15}deg) scale(1.02) translateZ(20px)`;
  }

  function resetTilt() {
    cardRef.current.style.transform = "perspective(1000px) rotateY(0) rotateX(0) scale(1) translateZ(0)";
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      className={`relative w-[280px] h-[380px] rounded-3xl shadow-2xl cursor-pointer overflow-hidden transition-all duration-300 transform-gpu group ${
        isPlayer
          ? "bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700"
          : "bg-gradient-to-br from-pink-500 via-rose-600 to-red-700"
      }`}
      style={{
        minWidth: '400px',
        boxShadow: isPlayer 
          ? '0 25px 50px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255,255,255,0.1)'
          : '0 25px 50px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(255,255,255,0.1)',
      }}
    >
      {/* 글래스모피즘 오버레이 */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      
      {/* 상단 글로우 효과 */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 blur-3xl rounded-full opacity-60 group-hover:opacity-80 transition-opacity"></div>
      
      {/* 하단 컬러 글로우 */}
      <div className={`absolute bottom-0 right-0 w-32 h-32 blur-2xl rounded-full opacity-40 group-hover:opacity-60 transition-opacity ${
        isPlayer ? "bg-cyan-300" : "bg-yellow-300"
      }`}></div>
      
      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-white">
        {/* 캐릭터 아바타 */}
        <div className="relative mb-6 group-hover:scale-110 transition-transform duration-300">
          <div className="w-24 h-24 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-white/20">
            {character.icon}
          </div>
          <div className="absolute -inset-2 bg-white/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        
        {/* 캐릭터 정보 */}
        <div className="text-center mb-6">
          <h3 className="font-black text-2xl mb-2 drop-shadow-lg">{character.name}</h3>
          <p className="text-sm opacity-90 font-medium bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
            {character.desc}
          </p>
        </div>
        
        {/* 구분선 */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-6"></div>
        
        {/* 스탯 정보 */}
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center bg-black/20 rounded-xl px-4 py-2 backdrop-blur-sm border border-white/10">
            <span className="font-bold text-sm">체력</span>
            <span className="font-black text-lg">{character.hp}</span>
          </div>
          <div className="flex justify-between items-center bg-black/20 rounded-xl px-4 py-2 backdrop-blur-sm border border-white/10">
            <span className="font-bold text-sm">공격력</span>
            <span className="font-black text-lg">{character.attack}</span>
          </div>
          <div className="flex justify-between items-center bg-black/20 rounded-xl px-4 py-2 backdrop-blur-sm border border-white/10">
            <span className="font-bold text-sm">방어력</span>
            <span className="font-black text-lg">{character.defense}</span>
          </div>
        </div>
        
        {/* 전적 */}
        <div className="flex gap-4 mt-6 text-sm font-bold">
          <div className="bg-green-500/20 px-3 py-1 rounded-full border border-green-400/30">
            <span className="text-green-200">승 {character.wins ?? 0}</span>
          </div>
          <div className="bg-red-500/20 px-3 py-1 rounded-full border border-red-400/30">
            <span className="text-red-200">패 {character.losses ?? 0}</span>
          </div>
        </div>
      </div>
      
      {/* 호버 시 테두리 글로우 */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
           style={{
             background: `linear-gradient(45deg, ${isPlayer ? '#3B82F6' : '#EF4444'}, transparent, ${isPlayer ? '#8B5CF6' : '#F97316'})`,
             padding: '2px',
             WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
             WebkitMaskComposite: 'exclude'
           }}>
      </div>
    </div>
  );
}