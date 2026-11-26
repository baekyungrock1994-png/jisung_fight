// 설정 / 메인 메뉴

let config = { showDamage: true, soundEnabled: true };
let isTrainingMode = false;
let damageTexts = [];

function toggleSettings() {
    const el = document.getElementById('settings-ui');
    el.style.display = el.style.display === 'flex' ? 'none' : 'flex';
}
function updateConfig() {
    config.showDamage = document.getElementById('toggle-damage').checked;
    config.soundEnabled = document.getElementById('toggle-sfx').checked;
}

function toggleMap() {
    currentMapIdx = (currentMapIdx + 1) % MAPS.length;
    document.getElementById('map-btn').innerText = MAPS[currentMapIdx].name;
}

let p1Selection = 'yuji';
let p2Selection = 'gojo';
let hoveredChar = null;
let unlockedSecrets = [];

// Init Menu
const charGrid = document.getElementById('char-grid');

function renderCharGrid() {
    charGrid.innerHTML = '';
    Object.keys(CHAR_DATA).forEach(key => {
        const char = CHAR_DATA[key];
        if (char.secret && !unlockedSecrets.includes(key)) return;
        
        const el = document.createElement('div');
        el.className = 'char-card';
        el.id = `card-${key}`;
        el.innerHTML = `<div class="char-color-box" style="background:${char.color}"></div><div class="text-xs text-white">${char.name}</div>`;
        
        el.onmouseenter = () => { hoveredChar = key; el.style.borderColor = 'white'; };
        el.onmouseleave = () => { if(hoveredChar === key) hoveredChar = null; el.style.borderColor = ''; updateMenuUI(); };
        
        charGrid.appendChild(el);
    });
    updateMenuUI();
}

function showMenuMessage(text, color) {
    const msg = document.createElement('div');
    msg.innerText = text;
    msg.style.cssText = `position:absolute; top:30px; left:50%; transform:translateX(-50%); background:${color}; color:white; padding:12px 24px; border-radius:8px; z-index:9999; font-size:18px; font-weight:bold; box-shadow:0 0 15px ${color}; transition:opacity 0.5s; pointer-events:none;`;
    document.body.appendChild(msg); // 로비 화면 위에도 보이도록 body에 추가
    setTimeout(() => {
        msg.style.opacity = '0';
        setTimeout(() => msg.remove(), 500);
    }, 3000);
}

function checkSecretCode() {
    const input = document.getElementById('secret-code').value.toUpperCase().trim();
    if (input === 'THEWORLD' && !unlockedSecrets.includes('dio')) {
        unlockedSecrets.push('dio');
        showMenuMessage('비밀 캐릭터 [DIO]가 해금되었습니다!', '#facc15');
        renderCharGrid();
    } else if (input === 'SLIME' && !unlockedSecrets.includes('rimuru')) {
        unlockedSecrets.push('rimuru');
        showMenuMessage('비밀 캐릭터 [리무루 템페스트]가 해금되었습니다!', '#60a5fa');
        renderCharGrid();
    } else if (input === 'SUNSHINE' && !unlockedSecrets.includes('escanor')) {
        unlockedSecrets.push('escanor');
        showMenuMessage('비밀 캐릭터 [에스카노르]가 해금되었습니다!', '#f59e0b');
        renderCharGrid();
    } else if (input === '100LOVE' && !unlockedSecrets.includes('rentaro')) {
        unlockedSecrets.push('rentaro');
        showMenuMessage('비밀 캐릭터 [아이죠 렌타로]가 해금되었습니다!', '#ec4899');
        renderCharGrid();
    } else if (input === 'AIZEN' && !unlockedSecrets.includes('aizen')) {
        unlockedSecrets.push('aizen');
        showMenuMessage('비밀 캐릭터 [아이젠 소스케]가 해금되었습니다!', '#f8fafc');
        renderCharGrid();
    } else {
        showMenuMessage('코드가 올바르지 않거나 이미 해금된 상태입니다.', '#ef4444');
    }
    document.getElementById('secret-code').value = '';
}

renderCharGrid();

function selectChar(playerNum, key) {
    if(playerNum === 1) p1Selection = key;
    else p2Selection = key;
    updateMenuUI();
}

function updateMenuUI() {
    document.querySelectorAll('.char-card').forEach(el => {
        el.classList.remove('selected-p1', 'selected-p2');
        if (hoveredChar !== el.id.replace('card-', '')) el.style.borderColor = ''; // 호버 상태 초기화
    });
    
    const p1Card = document.getElementById(`card-${p1Selection}`);
    if (p1Card) p1Card.classList.add('selected-p1');
    
    const p2Card = document.getElementById(`card-${p2Selection}`);
    if (p2Card) p2Card.classList.add('selected-p2');
    
    const p1NameEl = document.getElementById('p1-sel-name');
    if (p1NameEl && CHAR_DATA[p1Selection]) p1NameEl.innerText = CHAR_DATA[p1Selection].name;
    
    const p2NameEl = document.getElementById('p2-sel-name');
    if (p2NameEl && CHAR_DATA[p2Selection]) p2NameEl.innerText = CHAR_DATA[p2Selection].name;
}
updateMenuUI();
