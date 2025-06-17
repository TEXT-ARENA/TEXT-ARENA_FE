import React, { useEffect, useState } from "react";

export default function AIThinkingDialog({ character, onDone }) {
  const [messages, setMessages] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setMessages([]); // messages 초기화 추가
    
    if (!character) {
      setReasons(["캐릭터 정보가 없습니다."]);
      setLoading(false);
      return;
    }

    console.log('Character data received:', character); // 디버깅을 위한 로그

    // character 객체에서 _reason으로 끝나는 모든 키를 찾아서 해당 값들을 배열로 만듭니다
    const statOrder = [
      { key: 'hp', label: '체력' },
      { key: 'attack', label: '공격력' },
      { key: 'defense', label: '방어력' },
      { key: 'criticalChance', label: '치명타 확률' },
      { key: 'criticalDamage', label: '치명타 피해' },
      { key: 'speed', label: '속도' },
      { key: 'dodgeChance', label: '회피 확률' },
      { key: 'accuracy', label: '명중률' }
    ];
    let nextReasons = statOrder.map(({ key, label }) => {
      // 다양한 케이스 지원: hp_reason, hpReason, hp_reason, hp_Reason 등
      const snake = key.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
      const candidates = [
        `${key}_reason`,
        `${key}Reason`,
        `${snake}_reason`,
        `${snake}Reason`,
        `${key}_Reason`,
        `${snake}_Reason`
      ];
      let reason = null;
      for (const cand of candidates) {
        if (character[cand]) {
          reason = character[cand];
          break;
        }
      }
      if (reason) return `${label}: ${reason}`;
      return null;
    }).filter(Boolean);

    // 만약 reason이라는 키가 있다면(단일 문자열)
    if (nextReasons.length === 0 && character.reason) {
      if (Array.isArray(character.reason)) {
        nextReasons = character.reason;
      } else if (typeof character.reason === 'string') {
        nextReasons = [character.reason];
      }
    }

    const finalReasons = nextReasons.length ? nextReasons : [
      "AI가 특별한 설명을 남기지 않았어요.",
    ];
    
    setReasons(finalReasons);
    setLoading(false);
  }, [character]);

  // reason 하나씩 보여주기
  useEffect(() => {
    if (loading || reasons.length === 0) return;
        
    setMessages([]); // 메시지 초기화
    
    // 즉시 첫 번째 메시지 표시
    setMessages([reasons[0]]);
    
    if (reasons.length === 1) {
      setTimeout(() => {
        onDone();
      }, 2000);
      return;
    }
    
    // 나머지 메시지들을 순차적으로 표시
    let i = 1;
    const interval = setInterval(() => {
      setMessages(prev => [...prev, reasons[i]]);
      i++;
      if (i >= reasons.length) {
        clearInterval(interval);
        setTimeout(() => {
          console.log('All messages displayed, calling onDone'); // 디버깅 로그 추가
          onDone();
        }, 2000);
      }
    }, 1200);
    
    return () => clearInterval(interval);
  }, [reasons.length, loading, onDone]); // reasons 대신 reasons.length 사용

  return (
    <div className="w-full max-w-xl mx-auto bg-white/20 rounded-2xl p-8 text-white text-lg backdrop-blur-lg border border-white/30 shadow-2xl mt-12">
      <h3 className="text-xl font-semibold text-blue-200 mb-4">AI가 캐릭터를 분석 중...</h3>
      <div className="space-y-3 leading-relaxed font-medium text-slate-100 min-h-[64px]">
        {loading ? (
          <div className="animate-pulse text-slate-300">🤔 AI가 생각 중...</div>
        ) : (
          messages.map((msg, idx) => (
            <div 
              key={idx} 
              style={{
                animation: 'fadeIn 0.6s ease-out both',
                animationDelay: `${idx * 0.2}s`
              }}
            >
              🤔 {msg}
            </div>
          ))
        )}
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