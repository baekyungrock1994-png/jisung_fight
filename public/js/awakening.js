// 각성

// 각성 및 컷씬 관련 로직
function triggerAwakening(player) {
    player.canAwaken = false;
    player.awakened = true;
    document.getElementById(player.isP1 ? 'p1-awaken-btn' : 'p2-awaken-btn').style.display = 'none';

    isCutscene = true; 
    
    // 이펙트 및 초기화
    player.stunned = 0; player.attackBox.active = false;
    
    let cutsceneUI = document.getElementById('cutscene-ui');
    let cutsceneText = document.getElementById('cutscene-text');
    
    cutsceneUI.style.display = 'flex';
    
    if (player.charId === 'sukuna') {
        cutsceneUI.style.background = 'radial-gradient(circle, rgba(69,10,10,0.95), rgba(0,0,0,0.95))';
        cutsceneText.innerText = '조건 달성 : 완전 현현';
        cutsceneText.style.color = '#ef4444';
    } else if (player.charId === 'mahito') {
        cutsceneUI.style.background = 'radial-gradient(circle, rgba(30,41,59,0.95), rgba(0,0,0,0.95))';
        cutsceneText.innerText = '편살즉영체';
        cutsceneText.style.color = '#94a3b8';
    } else if (player.charId === 'naoya') {
        cutsceneUI.style.background = 'radial-gradient(circle, rgba(66,32,6,0.95), rgba(0,0,0,0.95))';
        cutsceneText.innerText = '원한 전생... 주령 나오야';
        cutsceneText.style.color = '#facc15';
    } else if (player.charId === 'geto') {
        cutsceneUI.style.background = 'radial-gradient(circle, rgba(46,16,101,0.95), rgba(0,0,0,0.95))';
        cutsceneText.innerText = '뇌를 빼앗은 자 : 켄자쿠';
        cutsceneText.style.color = '#c084fc';
    } else if (player.charId === 'dio') {
        cutsceneUI.style.background = 'radial-gradient(circle, rgba(234,179,8,0.95), rgba(0,0,0,0.95))';
        cutsceneText.innerText = '최고로 HIGH한 기분이다!!';
        cutsceneText.style.color = '#fef08a';
    } else if (player.charId === 'rimuru') {
        cutsceneUI.style.background = 'radial-gradient(circle, rgba(30,58,138,0.95), rgba(0,0,0,0.95))';
        cutsceneText.innerText = '마왕 진화 완료';
        cutsceneText.style.color = '#93c5fd';
    } else if (player.charId === 'escanor') {
        cutsceneUI.style.background = 'radial-gradient(circle, rgba(245,158,11,0.95), rgba(0,0,0,0.95))';
        cutsceneText.innerText = '천상천하 유아독존 (더 원)';
        cutsceneText.style.color = '#ffffff';
    } else if (player.charId === 'rentaro') {
        cutsceneUI.style.background = 'radial-gradient(circle, rgba(236,72,153,0.95), rgba(0,0,0,0.95))';
        cutsceneText.innerText = '너희를 정말정말정말정말정말 좋아해!';
        cutsceneText.style.color = '#fbcfe8';
    }

    setTimeout(() => cutsceneText.classList.add('show'), 50);

    setTimeout(() => {
        cutsceneText.classList.remove('show');
        cutsceneUI.style.display = 'none';
        applyAwakening(player);
        isCutscene = false;
    }, 2000);
}

function applyAwakening(player) {
    player.health = 100; // 각성 시 체력 100% 회복
    
    if (player.charId === 'sukuna') {
        player.data.name = '헤이안 료멘스쿠나';
        player.data.passive = '완전 현현: 압도적인 스킬 강화';
        player.color = '#7f1d1d';
        player.damageMultiplier = 1.3;
        player.w = 70; player.h = 170; // 크기 증가
        player.isHeian = true; // 외형 플래그
        player.skills = [
            { name: '차원참', key: player.skills[0].key, type: 'p', cd: 90, dmg: 10, speed: 25, w: 80, h: 100, c: '#ffffff', count: 3, delay: 30, eff: 'true_dmg' },
            { name: '카무토케 뇌격', key: player.skills[1].key, type: 'a', cd: 180, dmg: 25, radius: 200, c: '#fef08a', eff: 'stun' },
            { name: '공간 붕괴', key: player.skills[2].key, type: 'm', cd: 200, dmg: 40, w: 150, c: '#000000', eff: 'shake', knockback: 30 },
            { name: '완전영창 푸가', key: player.skills[3].key, type: 'p', cd: 300, dmg: 45, speed: 20, w: 120, h: 120, c: '#ea580c', count: 1, eff: 'shake' },
            { name: '불완전 복마어주자', key: player.skills[4].key, type: 'x', cd: 800, dmg: 50, duration: 300, c: '#450a0a' }
        ];
    } else if (player.charId === 'mahito') {
        player.data.name = '편살즉영체 마히토';
        player.data.passive = '200%의 장갑: 기본 데미지 강화 및 받는 피해 50% 감소';
        player.color = '#374151';
        player.damageMultiplier = 1.5; 
        player.w = 65; player.h = 160; // 크기 증가
        player.isDistorted = true; // 외형 플래그
        player.skills = [
            { name: '영혼 폭발', key: player.skills[0].key, type: 'a', cd: 120, dmg: 15, radius: 150, c: '#14b8a6' },
            { name: '초월적 흑섬', key: player.skills[1].key, type: 'm', cd: 150, dmg: 35, w: 120, c: '#000000', eff: 'shake', knockback: 25 },
            { name: '편살 난무', key: player.skills[2].key, type: 'd', cd: 200, dmg: 25, speed: 25, c: '#475569', eff: 'shake' },
            { name: '생일 축하해', key: player.skills[3].key, type: 'd', cd: 180, dmg: 30, speed: 35, c: '#9ca3af', eff: 'shake', knockback: 20 },
            { name: '절대적 자폐원돈과', key: player.skills[4].key, type: 'x', cd: 800, dmg: 45, duration: 300, c: '#0f766e', eff: 'stun' }
        ];
    } else if (player.charId === 'naoya') {
        player.data.name = '주령 나오야';
        player.data.passive = '마하 3의 저주: 이속 증가 및 방어력 상승';
        player.color = '#854d0e';
        player.damageMultiplier = 1.3;
        player.baseSpeed = 14;
        player.w = 90; player.h = 60; // 형태 변화
        player.isCursedNaoya = true;
        player.skills = [
            { name: '촉수 강타', key: player.skills[0].key, type: 'm', cd: 90, dmg: 15, w: 100, c: '#a16207', knockback: 20 },
            { name: '주력 분사', key: player.skills[1].key, type: 'p', cd: 120, dmg: 10, speed: 20, w: 40, h: 30, c: '#facc15', count: 3, delay: 10 },
            { name: '주령: 마하 3', key: player.skills[2].key, type: 'd', cd: 200, dmg: 35, speed: 75, c: '#ffffff', eff: 'shake', knockback: 35 },
            { name: '세포 붕괴', key: player.skills[3].key, type: 'a', cd: 240, dmg: 20, radius: 150, c: '#422006', eff: 'stun' },
            { name: '시포월궁전 (완성)', key: player.skills[4].key, type: 'x', cd: 800, dmg: 45, duration: 300, c: '#713f12' }
        ];
    } else if (player.charId === 'geto') {
        player.data.name = '켄자쿠';
        player.data.passive = '천 년의 모략: 주력 강화 및 스킬 업그레이드';
        player.color = '#581c87';
        player.damageMultiplier = 1.3;
        player.isKenjaku = true;
        player.skills = [
            { name: '반중력 기구', key: player.skills[0].key, type: 'a', cd: 120, dmg: 15, radius: 120, c: '#c084fc', eff: 'stun' },
            { name: '백귀야행', key: player.skills[1].key, type: 'p', cd: 150, dmg: 8, speed: 12, w: 40, h: 40, c: '#4c1d95', count: 6, delay: 20, spreadY: 100 },
            { name: '특급 주령: 악로왕', key: player.skills[2].key, type: 'm', cd: 200, dmg: 25, w: 120, c: '#3b0764', eff: 'shake' },
            { name: '극번: 소용돌이', key: player.skills[3].key, type: 'p', cd: 300, dmg: 40, speed: 18, w: 100, h: 100, c: '#a855f7', count: 1, eff: 'shake' },
            { name: '태장편야', key: player.skills[4].key, type: 'x', cd: 800, dmg: 45, duration: 300, c: '#1e1b4b' }
        ];
    } else if (player.charId === 'dio') {
        player.data.name = '최고로 HIGH한 DIO';
        player.data.passive = '스탠드 파워 전개: 압도적인 흡혈과 무제한 시간 지배';
        player.color = '#facc15';
        player.damageMultiplier = 1.4;
        player.skills = [
            { name: '무다무다 난무', key: player.skills[0].key, type: 'm', cd: 90, dmg: 20, w: 100, c: '#eab308', knockback: 15 },
            { name: '공열안자경', key: player.skills[1].key, type: 'laser', cd: 150, dmg: 25, w: 40, c: '#ef4444' },
            { name: '흡혈 돌진', key: player.skills[2].key, type: 'd', cd: 180, dmg: 25, speed: 25, c: '#991b1b', eff: 'vampire' },
            { name: '체크메이트다!', key: player.skills[3].key, type: 'p', cd: 200, dmg: 10, speed: 22, w: 30, h: 10, c: '#d1d5db', count: 10, delay: 10, spreadY: 150 },
            { name: '9초의 시간정지', key: player.skills[4].key, type: 'buff', cd: 800, dmg: 0, c: '#ffffff' }
        ];
    } else if (player.charId === 'rimuru') {
        player.data.name = '마왕 리무루';
        player.data.passive = '시공간 지배자: 받는 피해 30% 감소 및 무한 진화';
        player.color = '#1e3a8a';
        player.damageMultiplier = 1.3;
        player.w = 50; player.h = 140;
        player.skills = [
            { name: '마력참', key: player.skills[0].key, type: 'p', cd: 90, dmg: 15, speed: 20, w: 60, h: 60, c: '#93c5fd', count: 3, delay: 20 },
            { name: '진·벨제붑', key: player.skills[1].key, type: 'd', cd: 180, dmg: 35, speed: 30, c: '#0f172a', eff: 'vampire' },
            { name: '마왕 패기', key: player.skills[2].key, type: 'a', cd: 240, dmg: 10, radius: 150, c: '#4c1d95', eff: 'stun' },
            { name: '신의 분노 (메기도)', key: player.skills[3].key, type: 'laser', cd: 300, dmg: 40, w: 80, c: '#bae6fd' },
            { name: '수하 소환 (교체)', key: player.skills[4].key, type: 'buff', cd: 1500, dmg: 0, c: '#ffffff' }
        ];
    } else if (player.charId === 'escanor') {
        player.data.name = '에스카노르 (더 원)';
        player.data.passive = '정오의 힘: 매 3초마다 공격력 상승';
        player.color = '#ffffff';
        player.damageMultiplier = 2.0; // 더원의 강력한 데미지 증폭
        player.w = 70; player.h = 160;
        player.skills = [
            { name: '신성검 에스카노르', key: player.skills[0].key, type: 'm', cd: 90, dmg: 40, w: 150, c: '#fef08a', eff: 'shake' },
            { name: '태양 폭발', key: player.skills[1].key, type: 'a', cd: 150, dmg: 35, radius: 200, c: '#fbbf24', eff: 'stun' },
            { name: '무자비한 태양(대)', key: player.skills[2].key, type: 'p', cd: 200, dmg: 45, speed: 15, w: 120, h: 120, c: '#f59e0b', count: 1, eff: 'shake' },
            { name: '오만의 불꽃', key: player.skills[3].key, type: 'laser', cd: 240, dmg: 50, w: 100, c: '#fb923c' },
            { name: '천상천하 유아독존', key: player.skills[4].key, type: 'buff', cd: 900, dmg: 0, c: '#ffffff' }
        ];
    } else if (player.charId === 'rentaro') {
        player.data.name = '각성한 아이죠 렌타로';
        player.data.passive = '100명의 여친의 사랑: 방어, 속도, 공격력 최고조';
        player.color = '#db2777';
        player.damageMultiplier = 3.0; // 사랑의 힘
        player.baseSpeed = 16;
        player.skills = [
            { name: '100배 태클', key: player.skills[0].key, type: 'm', cd: 60, dmg: 30, w: 150, c: '#fbcfe8', eff: 'shake', gf: '하카리&카라네' },
            { name: '100배 레이저', key: player.skills[1].key, type: 'laser', cd: 120, dmg: 40, w: 100, c: '#e2e8f0', gf: '나노' },
            { name: '초 쿠스리 영약', key: player.skills[2].key, type: 'a', cd: 200, dmg: -30, radius: 200, c: '#86efac', gf: '쿠스리' },
            { name: '시즈카의 확성기', key: player.skills[3].key, type: 'a', cd: 200, dmg: 50, radius: 250, c: '#93c5fd', eff: 'stun', gf: '시즈카' },
            { name: '모두를 사랑해!!', key: player.skills[4].key, type: 'x', cd: 900, dmg: 60, duration: 300, c: '#ec4899', eff: 'shake', gf: '100명의 여친' }
        ];
    }
    
    document.getElementById(player.isP1 ? 'p1-name' : 'p2-name').innerHTML = `${player.data.name} <span class="text-xs text-gray-300 ml-2">[${player.data.passive}]</span>`;
    document.getElementById(player.isP1 ? 'p1-hp' : 'p2-hp').style.width = '100%';
    buildSkillUI(player, player.isP1 ? 'p1-skills' : 'p2-skills');
    spawnParticles(player.pos.x + player.w/2, player.pos.y + player.h/2, player.color, 100);
}
