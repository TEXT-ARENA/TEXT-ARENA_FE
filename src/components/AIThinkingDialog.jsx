import React, { useEffect, useState } from "react";

export default function AIThinkingDialog({ character, onDone }) {
  const [messages, setMessages] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 캐릭터 분석 요청
    async function fetchAIAnalysis() {
      setLoading(true);
      setReasons([]);
      setMessages([]);
      try {
        const response = await fetch("http://18.209.30.21:8080/api/ai-thoughts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: character.name,
            desc: character.desc,
          }),
        });
        const result = await response.json();

        // reason만 모아 배열로 뽑기
        const nextReasons = [
          result.hp_reason,
          result.speed_reason, // 필요에 따라 reason 항목 추가
          result.attack_reason, // 만약 이런 키가 있다면
          result.defense_reason, // 만약 이런 키가 있다면
          // ... 추가적으로 출력하고 싶은 reason 순서대로
        ].filter(Boolean); // undefined/null 제거

        setReasons(nextReasons.length ? nextReasons : [
          "AI가 특별한 설명을 남기지 않았어요.",
        ]);
      } catch (err) {
        setReasons(["AI 분석에 실패했습니다. 다시 시도해 주세요."]);
      } finally {
        setLoading(false);
      }
    }

    fetchAIAnalysis();
  }, [character]);

  // 2. reason 하나씩 보여주기
  useEffect(() => {
    if (loading || reasons.length === 0) return;
    let i = 0;
    setMessages([]);
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
              <div key={idx} className="animate-fadeIn">🤔 {msg}</div>
            ))}
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out both; }
      `}</style>
    </div>
  );
}
