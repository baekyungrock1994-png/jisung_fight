// 키보드 입력

// 통합 입력 처리 함수 (로컬 및 네트워크 동기화용)
function handleInput(key, isDown, fromNetwork = false) {
    if (document.getElementById('main-menu').style.display !== 'none' && isDown && !fromNetwork) {
        if (hoveredChar) {
            if (key === ' ' || key === 'Spacebar') { selectChar(1, hoveredChar); return; }
            if (key === 'Enter') { selectChar(2, hoveredChar); return; }
        }
        return;
    }

    if(!gameActive || gameFinished) return;
    
    if(clashActive && isDown) {
        if(key === 'v' || key === 'V') clashValue = Math.max(0, clashValue - 2); 
        if(key === '1') clashValue = Math.min(100, clashValue + 2); 
        return;
    }

    if (isCutscene || swapUIActive || trialUIActive) return; 

    // 키를 모두 소문자로 변환하여 일관되게 처리 ('ArrowUp' -> 'arrowup' 매칭 문제 해결)
    let normalizedKey = key.toLowerCase();
    keys[normalizedKey] = isDown;
    keys[key] = isDown; // 대소문자 모두 호환

    if (!isDown) return; 

    const p1 = players[0]; const p2 = players[1];
    
    if((normalizedKey === 't') && p1.canAwaken) triggerAwakening(p1);
    if(normalizedKey === '7' && p2.canAwaken) triggerAwakening(p2);

    if(normalizedKey === 'r') {
        if(p1.charId === 'rentaro' && !p1.awakened) window.swapRentaroSkills(p1);
    }
    if(normalizedKey === '8') {
        if(p2.charId === 'rentaro' && !p2.awakened) window.swapRentaroSkills(p2);
    }

    if(normalizedKey === 'w' && Math.abs(p1.v.y) < 1.5) p1.v.y = -15;
    if(normalizedKey === 'v') p1.basicAttack();
    if(normalizedKey === 'b') p1.useSkill(0);
    if(normalizedKey === 'n') p1.useSkill(1);
    if(normalizedKey === 'm') p1.useSkill(2);
    if(normalizedKey === ',') p1.useSkill(3);
    if(normalizedKey === '.') p1.useSkill(4);

    if(normalizedKey === 'arrowup' && Math.abs(p2.v.y) < 1.5) p2.v.y = -15;
    if(normalizedKey === '1') p2.basicAttack(); 
    if(normalizedKey === '2') p2.useSkill(0); 
    if(normalizedKey === '3') p2.useSkill(1); 
    if(normalizedKey === '4') p2.useSkill(2); 
    if(normalizedKey === '5') p2.useSkill(3); 
    if(normalizedKey === '6') p2.useSkill(4); 
}

window.addEventListener('keydown', (e) => {
    let k = e.key;
    if (e.code === 'Space') k = ' '; 
    
    let normalizedK = k.toLowerCase();

    // 온라인 게스트(P2) 조작을 W,A,S,D 등의 기본 키로 가능하도록 내부 매핑 변환
    if (isOnline && gameActive && !isHost) {
        if (guestKeyRemap[normalizedK]) {
            k = guestKeyRemap[normalizedK]; // 매핑된 화살표 키/넘버패드 키로 신호 전송
        }
    }

    if (isOnline && gameActive) {
        if (isHost && !hostKeys.includes(k) && k !== ' ' && k !== 'Enter') return; 
        if (!isHost && !guestKeys.includes(k) && k !== ' ' && k !== 'Enter') return; 
        if (mpManager && mpManager.connected) mpManager.sendInput(k, true);
    }
    handleInput(k, true, false);
    if (k === ' ' || e.code === 'Space') e.preventDefault(); 
});

window.addEventListener('keyup', (e) => {
    let k = e.key;
    if (e.code === 'Space') k = ' ';
    
    let normalizedK = k.toLowerCase();

    // 키 뗄 때도 게스트(P2) 기본 키 매핑 지원
    if (isOnline && gameActive && !isHost) {
        if (guestKeyRemap[normalizedK]) {
            k = guestKeyRemap[normalizedK];
        }
    }

    if (isOnline && gameActive) {
        if (isHost && !hostKeys.includes(k) && k !== ' ' && k !== 'Enter') return; 
        if (!isHost && !guestKeys.includes(k) && k !== ' ' && k !== 'Enter') return; 
        if (mpManager && mpManager.connected) mpManager.sendInput(k, false);
    }
    handleInput(k, false, false);
});
