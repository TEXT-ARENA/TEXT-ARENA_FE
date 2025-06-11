import React, { useEffect, useState } from "react";

export default function AIThinkingDialog({ character, onDone }) {
  const [messages, setMessages] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!character) {
      setReasons(["캐릭터 정보가 없습니다."]);
      setLoading(false);
      return;
    }

    // character 객체에서 _reason으로 끝나는 모든 키를 찾아서 해당 값들을 배열로 만듭니다
    const nextReasons = Object.entries(character)
      .filter(([key, value]) => key.includes('_reason') && value)
      .map(([key, value]) => value);

    console.log('Found reasons:', nextReasons); // 디버깅을 위한 로그

    setReasons(nextReasons.length ? nextReasons : [
      "AI가 특별한 설명을 남기지 않았어요.",
    ]);
    setLoading(false);
  }, [character]);

  // reason 하나씩 보여주기
  useEffect(() => {
    if (loading || reasons.length === 0) return;
    let i = 0;
    const interval = setInterval(() => {
      setMessages(prev => [...prev, reasons[i]]);
      i++;
      if (i >= reasons.length) {
        clearInterval(interval);
        setTimeout(onDone, 1300);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [reasons, loading, onDone]);

  return (
    <div className="w-full max-w-xl mx-auto bg-white/20 rounded-2xl p-8 text-white text-lg backdrop-blur-lg border border-white/30 shadow-2xl mt-12">
      <h3 className="text-xl font-semibold text-blue-200 mb-4">AI가 캐릭터를 분석 중...</h3>
      <div className="space-y-3 leading-relaxed font-medium text-slate-100 min-h-[64px]">
        {loading
          ? <div className="animate-pulse text-slate-300">🤔 AI가 생각 중...</div>
          : messages.map((msg, idx) => (
              <div 
                key={idx} 
                style={{
                  animation: 'fadeIn 0.6s ease-out both',
                  animationDelay: `${idx * 0.2}s`
                }}
              >
                🤔 {msg}
              </div>
            ))}
      </div>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
}
