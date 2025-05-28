import React, { useState } from "react";

export default function CharacterForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      onSubmit({ name, desc, icon: name[0] || "?" });
      setName("");
      setDesc("");
      setIsSubmitting(false);
    }, 1000);
  }

  return (
    <div className="min-h-screen flex items-start justify-center px-4 pt-0">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent mb-3">
            ✨ 캐릭터 생성
          </h2>
          <p className="text-slate-300/90 font-medium text-lg">
            나만의 특별한 캐릭터를 디자인하세요
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/20 backdrop-blur-lg rounded-[2rem] shadow-2xl p-8 border border-white/30"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.15), inset 0 2px 2px rgba(255,255,255,0.2)',
          }}
        >
          <div className="mb-7">
            <label className="block text-base font-semibold text-slate-100/90 mb-3 flex items-center gap-2">
              <span className="text-xl opacity-90">🎭</span>
              캐릭터 이름
            </label>
            <div className="relative">
              <input
                className="w-full px-5 py-3.5 text-base font-semibold bg-white/10 backdrop-blur-sm rounded-xl
                           border-2 border-white/20 focus:border-purple-300/80 focus:bg-white/20
                           outline-none transition-all duration-200 shadow-lg
                           placeholder-slate-300/70 text-slate-100"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={12}
                placeholder="예: 돼지, 공대생, 용감한 전사 등..."
                required
                disabled={isSubmitting}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300/70 text-sm font-medium">
                {name.length}/12
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-base font-semibold text-slate-100/90 mb-3 flex items-center gap-2">
              <span className="text-xl opacity-90">📘</span>
              캐릭터 설명
            </label>
            <div className="relative">
              <textarea
                className="w-full px-5 py-3.5 text-base font-normal bg-white/10 backdrop-blur-sm rounded-xl
                           border-2 border-white/20 focus:border-purple-300/80 focus:bg-white/20
                           outline-none transition-all duration-200 shadow-lg resize-none
                           placeholder-slate-300/70 text-slate-100 leading-relaxed"
                style={{
                  minHeight: '7rem',
                  maxHeight: '7rem',
                  lineHeight: '1.6rem',
                  overflow: 'auto',
                }}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                maxLength={30}
                placeholder="예: 이 캐릭터는 항상 돼지처럼 먹고 자는 것을 좋아합니다. 하지만 전투에서는 용감한 전사로 변신합니다!"
                disabled={isSubmitting}
              />
              <div className="absolute right-4 bottom-3 text-slate-300/70 text-sm font-medium">
                {desc.length}/30
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className={`w-full py-4 font-bold text-lg rounded-xl shadow-xl transition-all duration-300 ${
              isSubmitting || !name.trim()
                ? 'bg-slate-600/30 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-br from-purple-500/90 to-blue-500/90 hover:from-purple-400/90 hover:to-blue-400/90 text-white hover:shadow-2xl active:scale-[98%]'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
                <span>생성 중...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 tracking-wide">
                <span className="text-xl opacity-90">🌟</span>
                캐릭터 완성하기
              </span>
            )}
          </button>

          <div className="mt-7 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-start gap-3 text-slate-200/90">
              <span className="text-xl mt-0.5">💡</span>
              <div className="text-sm leading-relaxed">
                <p className="font-semibold mb-1.5">AI 분석 팁</p>
                <p className="opacity-90">
                  캐릭터 이름과 설명은 AI가 분석하여<br />
                  고유한 능력치를 생성하는 데 사용됩니다!
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}