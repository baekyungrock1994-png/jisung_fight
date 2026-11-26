// 게임 UI / AI / 시작과 종료

// UI Helper Functions
function buildSkillUI(player, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    player.skills.forEach((skill) => {
        const slot = document.createElement('div');
        slot.className = 'skill-slot ready';
        slot.innerText = `${skill.name} (${skill.key})`;
        container.appendChild(slot);
    });
}

function updateGameUI() {
    if (!players[0] || !players[1]) return;
    document.getElementById('p1-hp').style.width = Math.max(0, players[0].health) + '%';
    document.getElementById('p2-hp').style.width = Math.max(0, players[1].health) + '%';

    const p1Container = document.getElementById('p1-skills');
    const p2Container = document.getElementById('p2-skills');
    
    for (let i = 0; i < 5; i++) {
        if (p1Container.children[i]) {
            if (players[0].skillCds[i] > 0) {
                p1Container.children[i].className = 'skill-slot cd';
                p1Container.children[i].innerText = `${players[0].skills[i].name} (${Math.ceil(players[0].skillCds[i] / 60)})`;
            } else {
                p1Container.children[i].className = 'skill-slot ready';
                p1Container.children[i].innerText = `${players[0].skills[i].name} (${players[0].skills[i].key})`;
            }
        }
        if (p2Container.children[i]) {
            if (players[1].skillCds[i] > 0) {
                p2Container.children[i].className = 'skill-slot cd';
                p2Container.children[i].innerText = `${players[1].skills[i].name} (${Math.ceil(players[1].skillCds[i] / 60)})`;
            } else {
                p2Container.children[i].className = 'skill-slot ready';
                p2Container.children[i].innerText = `${players[1].skills[i].name} (${players[1].skills[i].key})`;
            }
        }
    }
}

function runGeneralAI(p, target, speed) {
    if(p.stunned > 0 || p.attackBox.active) return;
    const distX = target.pos.x - p.pos.x;
    
    // 타겟을 향해 이동
    if (Math.abs(distX) > 80) {
        p.v.x = distX > 0 ? speed : -speed;
        p.facing = distX > 0 ? 1 : -1;
    } else {
        p.facing = distX > 0 ? 1 : -1;
        if (Math.random() < 0.1) p.basicAttack(); 
    }
    
    // 무작위 스킬 사용
    if (Math.random() < 0.02) {
        let availableSkills = [];
        for(let i=0; i<5; i++) if (p.skillCds[i] <= 0) availableSkills.push(i);
        if (availableSkills.length > 0) {
            p.useSkill(availableSkills[Math.floor(Math.random() * availableSkills.length)]);
        }
    }
}

// Game Flow
let time = 120; let timerId;
let isAIBattle = false;
let aiDifficulty = 'normal';

async function startGame(ai = false, diff = 'normal', training = false) {
    // 오디오 컨텍스트 시작 및 초기화
    await Tone.start();
    AudioSys.init();

    isAIBattle = ai;
    aiDifficulty = diff;
    isTrainingMode = training;
    
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    
    if(!CHAR_DATA[p1Selection].passive) CHAR_DATA[p1Selection].passive = '패시브: 없음';
    if(!CHAR_DATA[p2Selection].passive) CHAR_DATA[p2Selection].passive = '패시브: 없음';
    
    // 각성 버그를 완벽하게 막기 위해 JSON을 통한 Deep Copy로 캐릭터 데이터 주입
    players = [
        new Fighter({x: 150, y: 0, data: JSON.parse(JSON.stringify(CHAR_DATA[p1Selection])), isP1: true, charId: p1Selection}),
        new Fighter({x: 800, y: 0, data: JSON.parse(JSON.stringify(CHAR_DATA[p2Selection])), isP1: false, charId: p2Selection})
    ];
    
    // 훈련 모드 시 즉시 각성 가능 처리
    if (isTrainingMode) {
        players[0].canAwaken = true;
        document.getElementById('p1-awaken-btn').style.display = 'block';
    }
    
    document.getElementById('p1-name').innerText = players[0].data.name;
    document.getElementById('p2-name').innerHTML = `${players[1].data.name} <span id="p2-passive" class="text-xs text-gray-300 mr-2">[${players[1].data.passive}]</span>`;
    
    document.getElementById('p1-awaken-btn').style.display = 'none';
    document.getElementById('p2-awaken-btn').style.display = 'none';

    if (isTrainingMode) {
        document.getElementById('exit-training-btn').style.display = 'block';
        document.getElementById('timer').innerText = '∞';
    } else {
        document.getElementById('exit-training-btn').style.display = 'none';
    }

    buildSkillUI(players[0], 'p1-skills');
    buildSkillUI(players[1], 'p2-skills');

    gameActive = true;
    gameFinished = false;
    time = 120; projectiles = []; particles = []; effects = []; activeLasers = []; currentDomain = null; getoOrbs = []; sukunaFingersList = []; rimuruSoulsList = []; globalFrame = 0; clashActive = false; beamClashActive = false; isCutscene = false;
    decreaseTimer();
    animate();
}

// 타이머 및 시간정지 상태 업데이트 추가
function decreaseTimer() {
    if(!gameActive) return;
    
    // 시간 정지 발동 중에는 타이머도 멈춤
    if(clashActive || isCutscene || swapUIActive || trialUIActive || globalTimeStop.active) {
        timerId = setTimeout(decreaseTimer, 1000); 
        return;
    }
    
    if (isTrainingMode) {
        document.getElementById('timer').innerText = '∞';
        timerId = setTimeout(decreaseTimer, 1000);
        return;
    }

    if(time > 0) {
        timerId = setTimeout(decreaseTimer, 1000);
        time--; document.getElementById('timer').innerText = time;
    }
    if(time === 0) endGame();
}

function endGame() {
    clearTimeout(timerId); gameActive = false; gameFinished = true;
    const res = document.getElementById('result-screen');
    const txt = document.getElementById('result-text');
    res.style.display = 'flex';
    if(players[0].health === players[1].health) txt.innerText = '무승부';
    else if(players[0].health > players[1].health) txt.innerText = 'Player 1 승리!';
    else txt.innerText = 'Player 2 승리!';
}

function backToMenu() {
    // 모든 캐릭터의 이름과 스킬을 원본(base) 상태로 롤백하여 각성 초기화
    Object.values(CHAR_DATA).forEach(char => {
        if (char.baseName) char.name = char.baseName; 
        if (char.baseSkills) char.skills = char.baseSkills.map(skill => ({ ...skill }));
    });
    
    // 게임 루프 및 타이머 완전 종료 처리 (이 부분이 추가되었습니다!)
    gameActive = false;
    gameFinished = true;
    clearTimeout(timerId);
    
    if (isOnline && mpManager) {
        mpManager.disconnect();
    }
    isOnline = false; isHost = false; isLocalReady = false; isRemoteReady = false;

    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('game-ui').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('skill-text').classList.remove('show');
    document.getElementById('clash-ui').style.display = 'none';
    currentDomain = null; clashActive = false; beamClashActive = false; isCutscene = false; swapUIActive = false; trialUIActive = false;
    c.clearRect(0,0,canvas.width,canvas.height);
}
