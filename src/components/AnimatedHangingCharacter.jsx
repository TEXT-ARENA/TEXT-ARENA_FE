// AnimatedHangingCharacter.jsx
import React, { useState, useEffect } from 'react'; // useState와 useEffect를 임포트합니다.

export default function AnimatedHangingCharacter({ className = "" }) {
  // 랜덤으로 선택할 이모지 목록을 정의합니다.
  const emojis = [
    "😀", "😂", "🥰", "🤩", "🥳", "😎", "😇",
    "😬", "🤯", "😴", "🥴", "😵", "🥳", "🤩", "🥰", "😂", "😊"
  ];

  // 현재 표시할 이모지를 저장할 상태를 선언합니다.
  const [currentEmoji, setCurrentEmoji] = useState('');

  // 컴포넌트가 처음 마운트될 때 한 번만 실행됩니다.
  useEffect(() => {
    // 이모지 목록에서 랜덤 인덱스를 선택합니다.
    const randomIndex = Math.floor(Math.random() * emojis.length);
    // 선택된 이모지를 상태에 설정합니다.
    setCurrentEmoji(emojis[randomIndex]);
  }, []); // 빈 의존성 배열은 이 효과가 컴포넌트 마운트 시 한 번만 실행되도록 합니다.

  return (
    <div className={`absolute -top-10 -right-10 z-10 w-28 h-36 pointer-events-none select-none ${className}`}>
      <div className="relative w-full h-full flex flex-col items-center">
        {/* 줄 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-1 h-12 bg-slate-100 z-20 animate-rope-swing" style={{}} />
        {/* 머리/몸통 */}
        <div className="relative mx-auto mt-10 w-20 h-20 rounded-full bg-gradient-to-b from-sky-400 to-blue-700 shadow-xl border-4 border-white animate-hang-swing flex items-center justify-center z-10">
          {/* 얼굴 - currentEmoji 상태를 사용하여 랜덤 이모지를 표시합니다. */}
          <span className="text-5xl select-none pointer-events-none">{currentEmoji}</span>
          {/* 왼손 */}
          <div className="absolute left-[0px] top-[58px] w-6 h-5 bg-sky-200 rounded-full border-2 border-blue-500 z-30 rotate-[-25deg] animate-armLeft" />
          {/* 오른손 */}
          <div className="absolute right-[0px] top-[58px] w-6 h-5 bg-sky-200 rounded-full border-2 border-blue-500 z-30 rotate-[25deg] animate-armRight" />
          {/* 왼발 */}
          <div className="absolute left-[-15px] bottom-[18px] w-5 h-5 bg-sky-400 rounded-full border-2 border-blue-700 z-10 rotate-[-18deg] animate-legLeft" />
          {/* 오른발 */}
          <div className="absolute right-[-18px] bottom-[28px] w-5 h-8 bg-sky-400 rounded-full border-2 border-blue-700 z-10 rotate-[18deg] animate-legRight" />
        </div>
      </div>
      <style>{`
        @keyframes hang-swing {
          0%   { transform: rotate(-10deg);}
          50%  { transform: rotate(10deg);}
          100% { transform: rotate(-10deg);}
        }
        .animate-hang-swing { animation: hang-swing 2.2s cubic-bezier(.4,0,.2,1) infinite; transform-origin: top center; }
        @keyframes rope-swing {
          0%   { transform: rotate(-4deg);}
          50%  { transform: rotate(7deg);}
          100% { transform: rotate(-4deg);}
        }
        .animate-rope-swing { animation: rope-swing 2.2s cubic-bezier(.4,0,.2,1) infinite; transform-origin: top center;}
        @keyframes armRight {
          0%,100% { transform: rotate(25deg);}
          50% { transform: rotate(45deg);}
        }
        .animate-armRight { animation: armRight 2.2s cubic-bezier(.4,0,.2,1) infinite;}
        @keyframes armLeft {
          0%,100% { transform: rotate(-25deg);}
          50% { transform: rotate(-45deg);}
        }
        .animate-armLeft { animation: armLeft 2.2s cubic-bezier(.4,0,.2,1) infinite;}
        @keyframes legRight {
          0%,100% { transform: rotate(18deg);}
          50% { transform: rotate(35deg);}
        }
        .animate-legRight { animation: legRight 2.2s cubic-bezier(.4,0,.2,1) infinite;}
        @keyframes legLeft {
          0%,100% { transform: rotate(-18deg);}
          50% { transform: rotate(-35deg);}
        }
        .animate-legLeft { animation: legLeft 2.2s cubic-bezier(.4,0,.2,1) infinite;}
      `}</style>
    </div>
  );
}