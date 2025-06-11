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

export async function fetchEquipment({ type, name, desc }) {
  await new Promise(r => setTimeout(r, 800));
  return {
    [type]: {
      name,
      description: desc,
      attackBonus: 3,
      effects: [
        {
          type: "poison",
          type_reason: "독이라니, 진짜 상대방 고생 좀 하겠는데?",
        },
      ],
    },
  };
}


export async function fetchCharacterFromServer({ name, desc, userId }) {
  try {
    if (!userId) {
      throw new Error("userId가 제공되지 않았습니다. 로그인을 확인해주세요.");
    }

    const response = await fetch(`http://18.209.30.21:8080/api/characters/${userId}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ characterName: name, description: desc }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`HTTP ${response.status}: ${errorJson.detail || errorText}`);
      } catch {
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    }

    const data = await response.json();
    
    if (!data.isSuccess) {
      throw new Error(data.message || "서버에서 캐릭터 생성 실패");
    }
    
    return data.result;
    
  } catch (error) {
    console.error("API 통신 에러:", error);
    throw error;
  }
}