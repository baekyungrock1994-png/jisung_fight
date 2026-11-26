// 영역 / 격돌 / 교체 / 재판

// Domain & Clash logic
function activateDomain(owner, skill) {
    currentDomain = { charId: owner.charId, life: skill.duration, maxLife: skill.duration, owner: owner, dmg: skill.dmg };
    canvas.style.transform = `scale(1.05)`;
    setTimeout(() => canvas.style.transform = 'none', 400);

    if (owner.charId === 'hakari') {
        setTimeout(() => {
            if (Math.random() < 0.5) {
                owner.jackpotTimer = 1200; 
                showSkillText('JACKPOT! (무한 재생)', '#fcd34d');
            } else {
                showSkillText('꽝...', '#9ca3af');
            }
        }, 800);
    }
}

function startDomainClash(challenger, challengerSkill) {
    if(!currentDomain || currentDomain.life <= 0) {
        activateDomain(challenger, challengerSkill);
        return;
    }
    
    clashActive = true;
    beamClashActive = false; // 영역 대전 명시
    clashTimer = 180; 
    clashValue = 50;
    pendingDomainOwner = challenger;
    pendingDomainSkill = challengerSkill;
    
    document.getElementById('clash-ui').style.display = 'flex';
    document.getElementById('clash-bar-fill').style.width = '50%';
    document.querySelector('#clash-ui h2').innerText = '영역 대전 (Domain Clash)';
    document.querySelector('#clash-ui h2').className = 'text-4xl text-white italic drop-shadow-[0_0_10px_white]';
}

function resolveDomainClash() {
    clashActive = false;
    document.getElementById('clash-ui').style.display = 'none';
    
    const p1 = players[0]; const p2 = players[1];
    if(clashValue === 50) {
        currentDomain = null;
        showSkillText('영역 동시 붕괴!', '#fff');
    } else if (clashValue < 50) {
        activateDomain(p1, pendingDomainOwner === p1 ? pendingDomainSkill : p1.data.skills[4]);
        p2.takeDamage(15, 10, 'stun'); 
        showSkillText('P1 영역 장악!', p1.data.color);
    } else {
        activateDomain(p2, pendingDomainOwner === p2 ? pendingDomainSkill : p2.data.skills[4]);
        p1.takeDamage(15, 10, 'stun');
        showSkillText('P2 영역 장악!', p2.data.color);
    }
}

// 빔 격돌 관련 로직
function checkBeamClash() {
    let p1Laser = activeLasers.find(l => l.owner.isP1 && (l.name === '순애포' || l.name === '최대출력 그라니테 블라스트'));
    let p2Laser = activeLasers.find(l => !l.owner.isP1 && (l.name === '순애포' || l.name === '최대출력 그라니테 블라스트'));
    
    if (p1Laser && p2Laser && !beamClashActive) {
        beamClashActive = true;
        clashActive = true;
        clashTimer = 180;
        clashValue = 50;
        document.getElementById('clash-ui').style.display = 'flex';
        document.getElementById('clash-bar-fill').style.width = '50%';
        
        let p1Color = p1Laser.name === '순애포' ? 'text-pink-400' : 'text-blue-400';
        document.querySelector('#clash-ui h2').innerText = '빔 격돌 (Beam Clash!)';
        document.querySelector('#clash-ui h2').className = `text-4xl italic drop-shadow-[0_0_10px_white] ${p1Color}`;
    }
}

function resolveBeamClash() {
    clashActive = false;
    beamClashActive = false;
    document.getElementById('clash-ui').style.display = 'none';
    
    const p1 = players[0]; 
    const p2 = players[1];
    
    if (clashValue === 50) {
        showSkillText('격돌 무승부!', '#ffffff');
    } else if (clashValue < 50) {
        p2.takeDamage(40, 30, 'shake');
        showSkillText('P1 격돌 승리!', p1.color);
    } else {
        p1.takeDamage(40, 30, 'shake');
        showSkillText('P2 격돌 승리!', p2.color);
    }
    
    // 격돌을 일으킨 레이저들을 배열에서 제거
    activeLasers = activeLasers.filter(l => !(l.name === '순애포' || l.name === '최대출력 그라니테 블라스트'));
}

// 리무루 교체 시스템 로직
function showSwapUI(player) {
    swapTargetPlayer = player;
    swapUIActive = true;
    document.getElementById('swap-ui').style.display = 'flex';
}

function selectSwap(charName) {
    swapUIActive = false;
    document.getElementById('swap-ui').style.display = 'none';
    if(!swapTargetPlayer) return;
    
    let p = swapTargetPlayer;
    p.originalName = p.data.name;
    p.originalColor = p.color;
    p.originalSkills = p.skills.map(s => ({...s}));
    p.swapTimer = 1200; // 20초 (1200 프레임)
    
    if (charName === 'shion') {
        p.data.name = '시온';
        p.color = '#7e22ce';
        p.skills = [
            { name: '대검 휘두르기', key: p.skills[0].key, type: 'm', cd: 60, dmg: 15, w: 100, c: '#a855f7' },
            { name: '호용 강격', key: p.skills[1].key, type: 'd', cd: 120, dmg: 25, speed: 20, c: '#9333ea', knockback: 30 },
            { name: '요리(?) 먹이기', key: p.skills[2].key, type: 'a', cd: 200, dmg: 30, radius: 100, c: '#4ade80', eff: 'poison' },
            { name: '강철의 육체', key: p.skills[3].key, type: 'buff', cd: 300, dmg: 0, c: '#d8b4fe' },
            { name: '단죄의 일격', key: p.skills[4].key, type: 'm', cd: 500, dmg: 50, w: 120, c: '#4c1d95', eff: 'shake' }
        ];
    } else if (charName === 'veldora') {
        p.data.name = '폭풍룡 베루도라';
        p.color = '#ca8a04';
        p.skills = [
            { name: '파멸의 폭풍', key: p.skills[0].key, type: 'p', cd: 90, dmg: 15, speed: 12, w: 50, h: 50, c: '#fef08a', count: 3, delay: 10 },
            { name: '드래곤 클로', key: p.skills[1].key, type: 'm', cd: 120, dmg: 25, w: 120, c: '#eab308' },
            { name: '검은 번개', key: p.skills[2].key, type: 'a', cd: 180, dmg: 30, radius: 150, c: '#000000', eff: 'stun' },
            { name: '폭풍룡의 위엄', key: p.skills[3].key, type: 'a', cd: 300, dmg: 20, radius: 200, c: '#facc15' },
            { name: '베루도라 소드(투기)', key: p.skills[4].key, type: 'laser', cd: 600, dmg: 55, w: 100, c: '#eab308' }
        ];
    } else if (charName === 'diablo') {
        p.data.name = '디아블로';
        p.color = '#1f2937';
        p.skills = [
            { name: '절망의 시간', key: p.skills[0].key, type: 'a', cd: 120, dmg: 0, radius: 150, c: '#111827', eff: 'frame_1' },
            { name: '마조', key: p.skills[1].key, type: 'm', cd: 90, dmg: 18, w: 80, c: '#374151' },
            { name: '종말의 유혹', key: p.skills[2].key, type: 'p', cd: 150, dmg: 25, speed: 15, w: 40, h: 40, c: '#000000', count: 2, delay: 30 },
            { name: '유혹자', key: p.skills[3].key, type: 'buff', cd: 200, dmg: 0, c: '#4b5563' },
            { name: '엔드 오브 월드', key: p.skills[4].key, type: 'x', cd: 800, dmg: 60, duration: 150, c: '#000000', eff: 'shake' }
        ];
    }
    
    document.getElementById(p.isP1 ? 'p1-name' : 'p2-name').innerHTML = `${p.data.name} <span class="text-xs text-gray-300 ml-2">(${charName.toUpperCase()})</span>`;
    buildSkillUI(p, p.isP1 ? 'p1-skills' : 'p2-skills');
    spawnParticles(p.pos.x + p.w/2, p.pos.y + p.h/2, p.color, 50);
    showSkillText(`${p.data.name} 강림!`, p.color);
}

// 히구루마 재판 미니게임 로직
function startTrialMiniGame(player) {
    trialTargetPlayer = player;
    trialUIActive = true;
    document.getElementById('trial-ui').style.display = 'flex';
    activateDomain(player, { duration: 600, dmg: 0 }); // 재판 영역 시각 효과
}

function selectTrial(playerChoice) {
    trialUIActive = false;
    document.getElementById('trial-ui').style.display = 'none';
    if(!trialTargetPlayer) return;
    
    const p = trialTargetPlayer;
    const target = players[p.isP1 ? 1 : 0];
    
    const choices = ['rock', 'paper', 'scissors'];
    const aiChoice = choices[Math.floor(Math.random() * choices.length)];
    
    let result = '';
    if (playerChoice === aiChoice) result = 'draw';
    else if (
        (playerChoice === 'rock' && aiChoice === 'scissors') ||
        (playerChoice === 'paper' && aiChoice === 'rock') ||
        (playerChoice === 'scissors' && aiChoice === 'paper')
    ) result = 'win';
    else result = 'lose';
    
    if (result === 'lose') {
        showSkillText('무죄 (Not Guilty)!', '#ffffff');
        currentDomain = null;
    } else if (result === 'draw') {
        showSkillText('유죄 (Guilty)! 2개 봉인!', '#facc15');
        currentDomain = null;
        let available = [0,1,2,3,4].sort(() => 0.5 - Math.random());
        target.skillCds[available[0]] += 600; // 10초 봉인
        target.skillCds[available[1]] += 600;
    } else if (result === 'win') {
        showSkillText('사형 (Death Penalty)!', '#991b1b');
        currentDomain = null;
        let available = [0,1,2,3,4].sort(() => 0.5 - Math.random());
        target.skillCds[available[0]] += 600;
        
        // 처형인의 검 각성
        p.data.name = '히구루마 (처형인의 검)';
        p.color = '#450a0a';
        p.skills = [
            { name: '처형의 일격', key: p.skills[0].key, type: 'm', cd: 60, dmg: 35, w: 100, c: '#fca5a5', eff: 'true_dmg' },
            { name: '빛나는 검기', key: p.skills[1].key, type: 'p', cd: 120, dmg: 25, speed: 20, w: 80, h: 40, c: '#fef08a', count: 1 },
            { name: '즉사 판결', key: p.skills[2].key, type: 'm', cd: 200, dmg: 50, w: 120, c: '#ef4444', eff: 'shake' },
            { name: '검의 춤', key: p.skills[3].key, type: 'd', cd: 180, dmg: 40, speed: 30, c: '#b91c1c' },
            { name: '마지막 선고', key: p.skills[4].key, type: 'm', cd: 300, dmg: 80, w: 150, c: '#ffffff', eff: 'shake' }
        ];
        document.getElementById(p.isP1 ? 'p1-name' : 'p2-name').innerHTML = `${p.data.name} <span class="text-xs text-gray-300 ml-2">[${p.data.passive}]</span>`;
        buildSkillUI(p, p.isP1 ? 'p1-skills' : 'p2-skills');
        spawnParticles(p.pos.x + p.w/2, p.pos.y + p.h/2, '#fef08a', 50);
    }
}

// 누락된 함수 추가: 히구루마 유죄 스택 패시브
window.applyGuiltyStack = function(attacker) {
    if (!attacker || attacker.health <= 0) return;
    let randSkill = Math.floor(Math.random() * 5);
    attacker.skillCds[randSkill] += 60; // 1초 연장
    showSkillText('유죄! 쿨타임 증가', '#b91c1c');
    spawnParticles(attacker.pos.x + attacker.w/2, attacker.pos.y + attacker.h/2, '#b91c1c', 10);
};

// 누락된 함수 추가: 렌타로 스킬셋 스왑
window.swapRentaroSkills = function(player) {
    if (!player.data.skills2) return;
    if (player.rentaroSkillSet === 1) {
        player.rentaroSkillSet = 2;
        player.skills = player.data.skills2.map(s => ({...s}));
        showSkillText('여친 교대! (세트 2)', '#db2777');
    } else {
        player.rentaroSkillSet = 1;
        player.skills = player.data.skills.map(s => ({...s}));
        showSkillText('여친 교대! (세트 1)', '#db2777');
    }
    buildSkillUI(player, player.isP1 ? 'p1-skills' : 'p2-skills');
};
