// 맵 / 캐릭터 데이터

const MAPS = [
    { id: 'shibuya', name: '시부야 사변 (폐허)', bg: '#1a0505', floor: '#222', details: '#333' },
    { id: 'school', name: '도쿄 도립 주술 고등전문학교', bg: '#0f172a', floor: '#475569', details: '#1e293b' },
    { id: 'subway', name: '지하철 역', bg: '#111827', floor: '#374151', details: '#fbbf24' }
];
let currentMapIdx = 0;

/**
 * Character & Skill Database
 * Skill Types:
 * 'm': Melee, 'p': Projectile, 'd': Dash, 'a': AoE, 'x': Domain/Ultimate, 'laser': Beam, 'buff': Custom mechanics
 */
const CHAR_DATA = {
    yuji: { name: '이타도리 유지', color: '#b45309', passive: '각성: 체력 50% 이하 시 회복 및 데미지 증가',
        skills: [
            { name: '경정권', key: 'B/2', type: 'm', cd: 120, dmg: 8, w: 70, c: '#3b82f6' },
            { name: '흑섬', key: 'N/3', type: 'm', cd: 300, dmg: 25, w: 100, c: '#000000', eff: 'shake' },
            { name: '만지차기', key: 'M/4', type: 'd', cd: 200, dmg: 12, speed: 12, c: '#ffffff' },
            { name: '돌 던지기', key: ',/5', type: 'p', cd: 150, dmg: 10, speed: 10, w: 20, h: 20, c: '#6b7280', count: 3, delay: 100 },
            { name: '계활', key: './6', type: 'buff', cd: 900, dmg: 0, c: '#991b1b' }
        ]
    },
    gojo: { name: '고죠 사토루', color: '#0ea5e9', passive: '무하한: 15% 확률로 모든 피해 무효화',
        skills: [
            { name: '창(蒼)', key: 'B/2', type: 'p', cd: 180, dmg: 15, speed: 8, w: 40, h: 40, c: '#3b82f6', count: 1 },
            { name: '혁(赫)', key: 'N/3', type: 'm', cd: 240, dmg: 20, w: 120, c: '#ef4444', knockback: 20 },
            { name: '자(茈)', key: 'M/4', type: 'p', cd: 400, dmg: 35, speed: 15, w: 80, h: 80, c: '#a855f7', count: 1 },
            { name: '순간이동', key: ',/5', type: 'd', cd: 200, dmg: 0, speed: 25, c: 'transparent' },
            { name: '무량공처', key: './6', type: 'x', cd: 900, dmg: 30, duration: 240, c: '#ffffff', eff: 'stun' }
        ]
    },
    sukuna: { name: '료멘스쿠나', color: '#991b1b', passive: '반전술식: 체력 30% 이하 시 자동 지속 회복',
        skills: [
            { name: '해(解)', key: 'B/2', type: 'p', cd: 60, dmg: 8, speed: 18, w: 40, h: 60, c: '#ffffff', count: 3, delay: 120 },
            { name: '팔(捌)', key: 'N/3', type: 'm', cd: 150, dmg: 18, w: 90, c: '#fca5a5' },
            { name: '푸가', key: 'M/4', type: 'p', cd: 360, dmg: 30, speed: 12, w: 70, h: 70, c: '#ea580c', count: 1 },
            { name: '거미줄', key: ',/5', type: 'a', cd: 300, dmg: 10, radius: 200, c: '#1f2937', eff: 'stun' },
            { name: '복마어주자', key: './6', type: 'x', cd: 900, dmg: 40, duration: 240, c: '#991b1b' }
        ]
    },
    hakari: { name: '하카리 킨지', color: '#d97706', passive: '불사: 사망 시 25% 확률로 부활 및 영역전개',
        skills: [
            { name: '셔터문', key: 'B/2', type: 'm', cd: 150, dmg: 12, w: 80, c: '#94a3b8' },
            { name: '파칭코 공', key: 'N/3', type: 'p', cd: 120, dmg: 8, speed: 14, w: 20, h: 20, c: '#fbbf24', count: 5, delay: 80, spreadY: 30 },
            { name: '거친 돌진', key: 'M/4', type: 'd', cd: 180, dmg: 15, speed: 15, c: '#fb923c' },
            { name: '대박(회복)', key: ',/5', type: 'a', cd: 500, dmg: -30, radius: 50, c: '#22c55e' },
            { name: '좌살박도', key: './6', type: 'x', cd: 800, dmg: 0, duration: 400, c: '#f59e0b' }
        ]
    },
    megumi: { name: '후시구로 메구미', color: '#166534', passive: '십종영법술: 체력 30% 이하 시 식신 진화',
        skills: [
            { name: '옥견', key: 'B/2', type: 'p', cd: 150, dmg: 12, speed: 10, w: 50, h: 40, c: '#000000', count: 2, delay: 200 },
            { name: '누에', key: 'N/3', type: 'p', cd: 180, dmg: 10, speed: 14, w: 60, h: 30, c: '#fef08a', count: 4, delay: 50, spreadY: 60 },
            { name: '두꺼비', key: 'M/4', type: 'm', cd: 200, dmg: 8, w: 200, c: '#4ade80', knockback: -10 },
            { name: '만상', key: ',/5', type: 'a', cd: 350, dmg: 20, radius: 120, c: '#3b82f6' },
            { name: '감합암예정', key: './6', type: 'x', cd: 900, dmg: 0, duration: 250, c: '#064e3b' }
        ]
    },
    mahito: { name: '마히토', color: '#6b7280', passive: '개조된 영혼: 피격 시 70% 확률로 피해 반감',
        skills: [
            { name: '무위전변', key: 'B/2', type: 'm', cd: 180, dmg: 20, w: 60, c: '#14b8a6' },
            { name: '다중혼', key: 'N/3', type: 'p', cd: 150, dmg: 8, speed: 10, w: 40, h: 40, c: '#475569', count: 6, spreadY: 120, delay: 0 },
            { name: '기형발도', key: 'M/4', type: 'd', cd: 200, dmg: 18, speed: 16, c: '#9ca3af' },
            { name: '흑섬', key: ',/5', type: 'm', cd: 480, dmg: 25, w: 100, c: '#000000', eff: 'shake' }, // 기존 4번을 흑섬으로 변경
            { name: '자폐원돈과', key: './6', type: 'x', cd: 900, dmg: 40, duration: 240, c: '#115e59', eff: 'stun' }
        ]
    },
    geto: { name: '게토 스구루', color: '#4c1d95', passive: '주령 흡수: 맵에 생성되는 구슬 3개 흡수 시 데미지 6% 무한 증가',
        skills: [
            { name: '주령조술', key: 'B/2', type: 'p', cd: 120, dmg: 8, speed: 9, w: 40, h: 40, c: '#8b5cf6', count: 4, spreadY: 80, delay: 60 },
            { name: '특급주령', key: 'N/3', type: 'p', cd: 240, dmg: 22, speed: 6, w: 80, h: 80, c: '#5b21b6', count: 1 },
            { name: '유운', key: 'M/4', type: 'm', cd: 150, dmg: 15, w: 100, c: '#ef4444' },
            { name: '주령폭주', key: ',/5', type: 'a', cd: 400, dmg: 25, radius: 130, c: '#a855f7' },
            { name: '소용돌이', key: './6', type: 'x', cd: 850, dmg: 45, duration: 150, c: '#4c1d95' }
        ]
    },
    naoya: { name: '젠인 나오야', color: '#eab308', passive: '투사주법: 이속 1.5배 & 평타 2회 시 1초 프레임 락 (추가 피해 1.5배)',
        skills: [
            { name: '투사타격', key: 'B/2', type: 'm', cd: 90, dmg: 8, w: 60, c: '#facc15', eff: 'frame_1' },
            { name: '초고속이동', key: 'N/3', type: 'd', cd: 150, dmg: 12, speed: 50, c: 'rgba(250,204,21,0.5)', knockback: 15 },
            { name: '마하 3', key: 'M/4', type: 'd', cd: 300, dmg: 25, speed: 70, c: '#ffffff', eff: 'shake', knockback: 25 },
            { name: '정지', key: ',/5', type: 'a', cd: 300, dmg: 0, radius: 100, c: '#ca8a04', eff: 'frame_3' },
            { name: '최고 속도로 부딪혀주마', key: './6', type: 'd', cd: 400, dmg: 35, speed: 60, c: '#eab308', knockback: 20 }
        ]
    },
    mahoraga: { name: '마허라', color: '#f1f5f9', passive: '적응: 피격 3회마다 피해 7% 감소 (최대 70%)',
        skills: [
            { name: '퇴마의 검', key: 'B/2', type: 'm', cd: 120, dmg: 18, w: 90, c: '#7dd3fc' },
            { name: '대지 분쇄', key: 'N/3', type: 'd', cd: 180, dmg: 15, speed: 12, c: '#94a3b8', knockback: 20 },
            { name: '파편 튀기기', key: 'M/4', type: 'p', cd: 150, dmg: 8, speed: 12, w: 20, h: 20, c: '#64748b', count: 4, spreadY: 40, delay: 0 },
            { name: '위압', key: ',/5', type: 'a', cd: 300, dmg: 10, radius: 150, c: '#cbd5e1', eff: 'stun' },
            { name: '세계참', key: './6', type: 'p', cd: 900, dmg: 55, speed: 25, w: 200, h: 400, c: '#ffffff', count: 1 }
        ]
    },
    toji: { name: '후시구로 토우지', color: '#14532d', passive: '천여주박: 상대의 영역 전개 효과 완전 무시',
        skills: [
            { name: '천역모', key: 'B/2', type: 'm', cd: 100, dmg: 18, w: 90, c: '#a3a3a3', knockback: 10, eff: 'true_dmg' },
            { name: '권총 난사', key: 'N/3', type: 'p', cd: 150, dmg: 5, speed: 20, w: 10, h: 5, c: '#cbd5e1', count: 5, delay: 30 },
            { name: '만리사슬', key: 'M/4', type: 'p', cd: 180, dmg: 12, speed: 25, w: 80, h: 20, c: '#475569', eff: 'stun' },
            { name: '석혼도', key: ',/5', type: 'm', cd: 200, dmg: 25, w: 80, c: '#000000', eff: 'shake' },
            { name: '승부는 지금부터다', key: './6', type: 'buff', cd: 600, dmg: 40, c: '#1f2937' } // 3초 광역 난무 (Buff 형태로 발동)
        ]
    },
    yuta: { name: '옷코츠 유타', color: '#e2e8f0', passive: '모방: 리카 타격 시 적 일반기술 중 1개 복사',
        skills: [
            { name: '주력 방출', key: 'B/2', type: 'a', cd: 120, dmg: 12, radius: 80, c: '#cbd5e1' },
            { name: '주언: 멈춰라', key: 'N/3', type: 'a', cd: 240, dmg: 0, radius: 150, c: '#64748b', eff: 'frame_3' }, // 3초 스턴, 노데미지
            { name: '반전술식', key: 'M/4', type: 'buff', cd: 400, dmg: 0, c: '#22c55e' },
            { name: '이리와 리카', key: ',/5', type: 'buff', cd: 600, dmg: 0, c: '#ef4444' }, // 식신 소환 및 스킬셋 변환
            { name: '진안상애', key: './6', type: 'x', cd: 850, dmg: 30, duration: 250, c: '#f1f5f9' }
        ]
    },
    ryu: { name: '이시고리 류', color: '#2563eb', passive: '넘치는 주력: 체력 50% 이하 시 격투술로 기술 변경',
        skills: [
            { name: '그라니테 블라스트', key: 'B/2', type: 'laser', cd: 120, dmg: 15, w: 40, c: '#60a5fa' },
            { name: '블라스트 3연사', key: 'N/3', type: 'laser', cd: 180, dmg: 10, w: 20, c: '#93c5fd' },
            { name: '주력 킥', key: 'M/4', type: 'm', cd: 150, dmg: 12, w: 70, c: '#3b82f6' },
            { name: '레이저 돌진', key: ',/5', type: 'd', cd: 300, dmg: 15, speed: 22, c: '#3b82f6', eff: 'laser_ring' },
            { name: '최대출력 그라니테 블라스트', key: './6', type: 'laser', cd: 800, dmg: 50, w: 150, c: '#1d4ed8' } // 거대 푸른 레이저
        ]
    },
    dio: { name: 'DIO (디오)', color: '#facc15', passive: '더 월드: 스킬 사용 시 스탠드 발현, 모든 투사체 반사', secret: true,
        skills: [
            { name: '무다무다 러쉬', key: 'B/2', type: 'm', cd: 90, dmg: 12, w: 80, c: '#eab308' },
            { name: '스탠드 연타', key: 'N/3', type: 'm', cd: 150, dmg: 4, w: 85, c: '#facc15', count: 6, delay: 15 },
            { name: 'WRYYY! (흡혈)', key: 'M/4', type: 'd', cd: 180, dmg: 18, speed: 18, c: '#991b1b', eff: 'vampire' },
            { name: '로드롤러다!!', key: ',/5', type: 'a', cd: 360, dmg: 35, radius: 120, c: '#f59e0b', eff: 'shake' },
            { name: '시간이여 멈춰라!', key: './6', type: 'buff', cd: 900, dmg: 0, c: '#ffffff' } // 상대 3초 정지
        ]
    },
    rimuru: { name: '리무루 템페스트', color: '#60a5fa', passive: '대현자/라파엘: 10초마다 능력치 진화, 영혼 3개 흡수 시 각성', secret: true,
        skills: [
            { name: '물칼날', key: 'B/2', type: 'p', cd: 90, dmg: 10, speed: 18, w: 40, h: 40, c: '#93c5fd', count: 2, delay: 30 },
            { name: '흑염뢰', key: 'N/3', type: 'p', cd: 150, dmg: 10, speed: 15, w: 40, h: 40, c: '#1e1b4b', count: 1, eff: 'black_lightning' }, // 투사체로 변경
            { name: '포식자', key: 'M/4', type: 'm', cd: 180, dmg: 20, w: 90, c: '#1e3a8a', eff: 'vampire' },
            { name: '메기도 (신의 분노)', key: ',/5', type: 'laser', cd: 400, dmg: 30, w: 60, c: '#bae6fd' },
            { name: '라파엘 씨!', key: './6', type: 'buff', cd: 900, dmg: 0, c: '#38bdf8' }
        ]
    },
    higuruma: { name: '히구루마 히로미', color: '#991b1b', passive: '재판: 공격 적중 시 상대의 스킬 쿨타임 무작위 증가',
        skills: [
            { name: '가벨 타격', key: 'B/2', type: 'm', cd: 90, dmg: 10, w: 80, c: '#b91c1c' },
            { name: '유죄 판결', key: 'N/3', type: 'p', cd: 150, dmg: 15, speed: 12, w: 40, h: 40, c: '#fca5a5', count: 1 },
            { name: '몰수', key: 'M/4', type: 'm', cd: 300, dmg: 5, w: 100, c: '#f87171', eff: 'seal_1' },
            { name: '가벨 거대화', key: ',/5', type: 'm', cd: 200, dmg: 25, w: 150, c: '#7f1d1d', knockback: 15, eff: 'shake' },
            { name: '주복사사 (재판)', key: './6', type: 'buff', cd: 850, dmg: 0, c: '#450a0a' }
        ]
    },
    todo: { name: '토도 아오이', color: '#0f766e', passive: '부기우기: 피격 시 20% 확률로 상대와 위치 교환',
        skills: [
            { name: '격투술', key: 'B/2', type: 'm', cd: 90, dmg: 12, w: 70, c: '#14b8a6' },
            { name: '부기우기 수플렉스', key: 'N/3', type: 'buff', cd: 300, dmg: 0, c: '#0f766e' },
            { name: '박수 치기', key: 'M/4', type: 'buff', cd: 60, dmg: 0, c: '#2dd4bf' },
            { name: '브라더!! (유지 소환)', key: ',/5', type: 'buff', cd: 480, dmg: 0, c: '#0ea5e9' },
            { name: '흑섬 (발차기)', key: './6', type: 'm', cd: 500, dmg: 35, w: 120, c: '#000', eff: 'black_flash_kick', knockback: 30 }
        ]
    },
    escanor: { name: '에스카노르', color: '#f59e0b', passive: '태양: 시간에 비례해 공격력 증가 (정오에 각성)', secret: true,
        skills: [
            { name: '무자비한 태양(크루얼 선)', key: 'B/2', type: 'p', cd: 150, dmg: 18, speed: 12, w: 80, h: 80, c: '#fbbf24', count: 1, eff: 'shake' },
            { name: '성검 에스카노르', key: 'N/3', type: 'm', cd: 120, dmg: 25, w: 100, c: '#fcd34d', eff: 'shake' },
            { name: '오만함 (반사)', key: 'M/4', type: 'buff', cd: 300, dmg: 0, c: '#f59e0b' },
            { name: '정하는 건 나다', key: ',/5', type: 'p', cd: 540, dmg: 40, speed: 15, w: 150, h: 150, c: '#fbbf24', count: 1, eff: 'shake' },
            { name: '더 원 (준비)', key: './6', type: 'buff', cd: 900, dmg: 0, c: '#ffffff' }
        ]
    },
    rentaro: { name: '아이죠 렌타로', color: '#ec4899', passive: '100명의 여친: 피격 시 15% 확률 피해무효 & R키 스킬 스왑', secret: true,
        skills: [
            { name: '하카리&카라네의 태클', key: 'B/2', type: 'buff', cd: 120, dmg: 20, c: '#fbcfe8', gf: '하카리&카라네' },
            { name: '나노의 정밀 레이저', key: 'N/3', type: 'buff', cd: 150, dmg: 25, c: '#e2e8f0', gf: '나노' },
            { name: '쿠스리의 영약 (아기 돌진)', key: 'M/4', type: 'buff', cd: 300, dmg: 20, c: '#86efac', gf: '아기 여친들' },
            { name: '시즈카의 노래 (밀치기)', key: ',/5', type: 'buff', cd: 300, dmg: 25, c: '#93c5fd', gf: '시즈카' },
            { name: '그 긴거', key: './6', type: 'buff', cd: 900, dmg: 0, c: '#db2777', gf: '모두' }
        ],
        skills2: [
            { name: '하하리의 헬기 지원', key: 'B/2', type: 'buff', cd: 150, dmg: 25, c: '#fbcfe8', gf: '하하리' },
            { name: '쿠루미의 굶주림', key: 'N/3', type: 'buff', cd: 180, dmg: 30, c: '#000000', gf: '쿠루미' },
            { name: '메이의 철통 호위', key: 'M/4', type: 'buff', cd: 200, dmg: 0, c: '#ffffff', gf: '메이' },
            { name: '이쿠의 특훈 (반사)', key: ',/5', type: 'buff', cd: 240, dmg: 0, c: '#a8a29e', gf: '이쿠' },
            { name: '미미미의 눈부심', key: './6', type: 'buff', cd: 300, dmg: 20, c: '#fef08a', gf: '미미미' }
        ]
    },
    aizen: { name: '아이젠 소스케', color: '#f8fafc', passive: '붕옥의 의지: 전투 중 지속적인 다단계 진화', secret: true,
        skills: [
            { name: '참격', key: 'B/2', type: 'm', cd: 60, dmg: 12, w: 80, c: '#cbd5e1' },
            { name: '파도 90. 흑관', key: 'N/3', type: 'a', cd: 200, dmg: 25, radius: 100, c: '#000000', eff: 'stun' },
            { name: '경화수월', key: 'M/4', type: 'buff', cd: 300, dmg: 0, c: '#bae6fd' },
            { name: '순보', key: ',/5', type: 'd', cd: 150, dmg: 10, speed: 25, c: '#f1f5f9' },
            { name: '파도 99. 오룡전멸', key: './6', type: 'a', cd: 800, dmg: 40, radius: 150, c: '#4c1d95', eff: 'shake' }
        ]
    }
};
