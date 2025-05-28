// src/api/aiPrompt.js
// 실제 구현 시 백엔드로 POST { name, desc } 전송, 결과 반환
export async function fetchCharacterStats({ name, desc, onStream }) {
  // onStream: 프롬프트 중간중간 딥서치-style 로그를 리턴하는 콜백
  // 여기서는 예시로 setTimeout/await로 딥서치 느낌 주기 (실제로는 SSE/Stream API 활용)

  await new Promise(r => setTimeout(r, 800));
  onStream?.(`"${name}"에 어울리는 직업/성격을 분석 중...`);
  await new Promise(r => setTimeout(r, 1100));
  onStream?.(`능력치 균형과 콘셉트를 생성 중...`);
  await new Promise(r => setTimeout(r, 900));
  onStream?.(`최종 스탯을 조정 중...`);

  // 실제론 AI 응답값!
  return {
    hp: 472,
    attack: 36,
    defense: 14,
    criticalChance: 0.12,
    criticalDamage: 1.5,
    speed: 78,
    dodgeChance: 0.07,
    accuracy: 0.95,
    // 추가 정보
    name,
    desc,
    icon: name[0] || "😃",
    wins: 0,
    losses: 0
  };
}
