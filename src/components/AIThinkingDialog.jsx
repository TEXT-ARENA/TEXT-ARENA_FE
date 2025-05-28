import React, { useEffect, useState } from "react";

export default function AIThinkingDialog({ character, onDone }) {
  const [messages, setMessages] = useState([]);
  const thoughts = [
    `음... 이름이 ${character.name}이라... 뭔가 강한 인상인데? 체력 +`,
    `캐릭터가 ${character.desc}니까, 싸움도 잘할지도 몰라! 공격력 +`,
    `그런데 덩치가 클 것 같아서... 속도는 조금 느릴지도? 속도 -`,
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setMessages(prev => [...prev, thoughts[i]]);
      i++;
      if (i >= thoughts.length) {
        clearInterval(interval);
        setTimeout(onDone, 1500); // 마지막 생각 후 StatRevealDialog로 전환
      }
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto bg-white/20 rounded-2xl p-8 text-white text-lg backdrop-blur-lg border border-white/30 shadow-2xl mt-12">
      <h3 className="text-xl font-semibold text-blue-200 mb-4">AI가 캐릭터를 분석 중...</h3>
      <div className="space-y-3 leading-relaxed font-medium text-slate-100">
        {messages.map((msg, idx) => (
          <div key={idx} className="animate-fadeIn">
            🤔 {msg}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
}
