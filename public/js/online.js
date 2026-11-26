// 온라인 1V1 (Firebase Realtime Database)

// ================= 온라인 멀티플레이 시스템 =================
let isOnline = false;
let isHost = false;
let mpManager = null;
let isLocalReady = false;
let isRemoteReady = false;
let isOnlineCharLocked = false;
let isRemoteCharLocked = false;
let hostKeys = ['w','a','s','d','v','b','n','m',',','.','t','r','W','A','S','D','V','B','N','M','T','R'];
let guestKeys = ['ArrowUp','ArrowLeft','ArrowRight','ArrowDown','1','2','3','4','5','6','7','8', 'arrowup', 'arrowleft', 'arrowright', 'arrowdown'];

// Guest가 WASD를 눌러도 내부적으로 Arrow키로 변환하여 P2를 정상적으로 조작하게 돕는 매핑 배열
const guestKeyRemap = {
    'w': 'ArrowUp', 'a': 'ArrowLeft', 's': 'ArrowDown', 'd': 'ArrowRight',
    'v': '1', 'b': '2', 'n': '3', 'm': '4', ',': '5', '.': '6', 't': '7', 'r': '8'
};

// 게임 데이터는 Firebase Realtime Database 를 거쳐 주고받습니다.
// (직접 연결(P2P)은 학교 와이파이처럼 기기 간 통신을 막는 네트워크에서 실패합니다.)
//
// rooms/{방코드}
//   host, guest        참가자 uid
//   toHost, toGuest    한 번씩 전달하는 메시지 (받은 쪽이 삭제)
//   state              방장이 덮어쓰는 최신 위치/체력/시간
class MultiplayerManager {
    constructor() {
        this.roomId = null;
        this.fb = null;
        this.unsubs = [];
        this.connected = false;
        this.closed = false;
    }

    async initFB() {
        if(!this.fb) this.fb = await window.initOnlineMultiplayer();
        return this.fb !== null && !this.closed;
    }

    path(sub) {
        return this.fb.ref(this.fb.db, `rooms/${this.roomId}${sub ? '/' + sub : ''}`);
    }

    async createRoom() {
        try {
            if(!await this.initFB()) return;
            isHost = true;

            // 이미 쓰는 코드면 다른 코드로 다시 시도
            for (let i = 0; i < 5; i++) {
                this.roomId = String(Math.floor(100000 + Math.random() * 900000));
                if (!(await this.fb.get(this.path('host'))).exists()) break;
                this.roomId = null;
            }
            if (!this.roomId) throw new Error('빈 방 코드를 찾지 못했습니다.');
            if (this.closed) return;

            await this.fb.set(this.path(), { host: this.fb.user.uid });
            // 창을 닫으면 방 삭제 (방을 만든 뒤에 예약해야 보안 규칙을 통과함)
            await this.fb.onDisconnect(this.path()).remove();
            if (this.closed) return this.cleanupRoom();

            showReadyRoom(this.roomId);

            let guestJoined = false;
            this.watch(this.fb.onValue(this.path('guest'), (snap) => {
                if (snap.exists() && !guestJoined) {
                    guestJoined = true;
                    this.open();
                } else if (!snap.exists() && guestJoined) {
                    this.peerLeft('게스트가 방을 나갔습니다. 방을 다시 생성해주세요.');
                }
            }));
        } catch(e) {
            console.error(e);
            showMenuMessage('방 생성에 실패했습니다.', '#ef4444');
            closeLobby();
        }
    }

    async joinRoom(code) {
        try {
            if(!await this.initFB()) return;
            isHost = false;
            this.roomId = code.trim();

            // 데이터베이스 경로에 쓸 수 없는 문자를 막기 위해 형식 확인
            if (!/^\d{6}$/.test(this.roomId) || !(await this.fb.get(this.path('host'))).exists()) {
                this.roomId = null;
                showMenuMessage('존재하지 않거나 이미 종료된 방입니다.', '#ef4444');
                return;
            }

            // 빈자리일 때만 게스트로 등록
            const uid = this.fb.user.uid;
            const result = await this.fb.runTransaction(this.path('guest'), cur => cur === null ? uid : undefined);
            if (!result.committed) {
                this.roomId = null; // 남의 자리를 지우지 않도록
                showMenuMessage('이미 가득 찬 방입니다.', '#ef4444');
                return;
            }
            if (this.closed) return this.cleanupRoom();
            await this.fb.onDisconnect(this.path('guest')).remove();

            showReadyRoom(this.roomId);
            this.open();

            this.watch(this.fb.onValue(this.path('host'), (snap) => {
                if (!snap.exists()) this.peerLeft('호스트가 방을 나갔습니다.');
            }));
        } catch(e) {
            console.error(e);
            showMenuMessage(`방 참가에 실패했습니다: ${e.message}`, '#ef4444');
            closeLobby();
        }
    }

    watch(unsubscribe) {
        if (this.closed) unsubscribe();
        else this.unsubs.push(unsubscribe);
    }

    // 두 사람이 모두 방에 들어온 시점
    open() {
        if (this.connected || this.closed) return;
        this.connected = true;
        isOnline = true;

        const inbox = isHost ? 'toHost' : 'toGuest';
        const onError = (e) => console.warn('수신 중단:', e.message);

        this.watch(this.fb.onChildAdded(this.path(inbox), (snap) => {
            this.fb.remove(snap.ref).catch(() => {});
            this.handleMessage(JSON.parse(snap.val()));
        }, onError));

        if (!isHost) {
            this.watch(this.fb.onValue(this.path('state'), (snap) => {
                if (snap.exists()) this.handleMessage(JSON.parse(snap.val()));
            }, onError));
        }

        this.sendMsg({type: 'sync', ready: isLocalReady});

        let remoteStatusEl = document.getElementById(isHost ? 'ready-p2-status' : 'ready-p1-status');
        if (remoteStatusEl.innerText.includes('접속')) {
            remoteStatusEl.innerText = '준비 대기 중...';
            remoteStatusEl.className = 'text-lg mt-2 text-yellow-400 font-bold';
        }
    }

    peerLeft(text) {
        if (this.closed) return;
        showMenuMessage(text, '#ef4444');
        if (gameActive) backToMenu();
        else leaveOnlineRoom();
    }

    handleMessage(msg) {
        if (msg.type === 'key') {
            handleInput(msg.key, msg.state, true);
        } else if (msg.type === 'state') {
            if (!isHost && players.length === 2 && gameActive) {
                players[0].pos.x = msg.p1.x; players[0].pos.y = msg.p1.y;
                players[0].v.x = msg.p1.vx; players[0].v.y = msg.p1.vy;
                players[0].health = msg.p1.hp; players[0].facing = msg.p1.face;
                
                players[1].pos.x = msg.p2.x; players[1].pos.y = msg.p2.y;
                players[1].v.x = msg.p2.vx; players[1].v.y = msg.p2.vy;
                players[1].health = msg.p2.hp; players[1].facing = msg.p2.face;
                time = msg.time;
                document.getElementById('timer').innerText = time;
            }
        } else if (msg.type === 'sync') {
            isRemoteReady = msg.ready;
            let statEl = document.getElementById(isHost ? 'ready-p2-status' : 'ready-p1-status');
            if (isRemoteReady) {
                statEl.innerText = '준비 완료 (Ready)';
                statEl.className = 'text-lg mt-2 text-green-400 font-bold';
            } else {
                statEl.innerText = '준비 대기 중...';
                statEl.className = 'text-lg mt-2 text-yellow-400 font-bold';
            }
            checkAllReady();
        } else if (msg.type === 'goto_char_select') {
            document.getElementById('ready-content').style.display = 'none';
            document.getElementById('online-char-select').style.display = 'flex';
            
            isOnlineCharLocked = false;
            isRemoteCharLocked = false;
            
            if (isHost) { p1Selection = 'yuji'; p2Selection = 'gojo'; }
            else { p2Selection = 'yuji'; p1Selection = 'gojo'; }
            
            document.getElementById('online-p1-char-name').innerText = CHAR_DATA[p1Selection].name;
            document.getElementById('online-p2-char-name').innerText = CHAR_DATA[p2Selection].name;
            document.getElementById('online-p1-status').innerText = '고르는 중...';
            document.getElementById('online-p1-status').className = 'text-yellow-400 font-bold';
            document.getElementById('online-p2-status').innerText = '고르는 중...';
            document.getElementById('online-p2-status').className = 'text-yellow-400 font-bold';
            
            document.getElementById('btn-online-lockin').innerText = '캐릭터 확정';
            document.getElementById('btn-online-lockin').className = 'mt-8 px-12 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-2xl rounded-full font-bold transition-colors shadow-[0_0_15px_rgba(79,70,229,0.8)]';

            renderOnlineCharGrid();
            selectOnlineChar(isHost ? p1Selection : p2Selection, true);
            
        } else if (msg.type === 'hover_char') {
            if (isHost) {
                p2Selection = msg.char;
                document.getElementById('online-p2-char-name').innerText = CHAR_DATA[p2Selection].name;
            } else {
                p1Selection = msg.char;
                document.getElementById('online-p1-char-name').innerText = CHAR_DATA[p1Selection].name;
            }
        } else if (msg.type === 'lock_char') {
            isRemoteCharLocked = true;
            let statEl = document.getElementById(isHost ? 'online-p2-status' : 'online-p1-status');
            statEl.innerText = '확정 (Locked)';
            statEl.className = 'text-green-400 font-bold';
            if (isHost) p2Selection = msg.char;
            else p1Selection = msg.char;
            checkAllCharLocked();
        } else if (msg.type === 'start_online_game') {
            document.getElementById('multiplayer-lobby').style.display = 'none';
            startGame(false, 'normal', false);
        }
    }

    sendMsg(data) {
        if (!this.connected) return;
        const text = JSON.stringify(data);
        const sending = data.type === 'state'
            ? this.fb.set(this.path('state'), text)
            : this.fb.set(this.fb.push(this.path(isHost ? 'toGuest' : 'toHost')), text);
        sending.catch(e => console.warn('전송 실패:', e.message));
    }

    sendInput(key, state) {
        this.sendMsg({type: 'key', key, state});
    }

    // 호스트는 방 전체를, 게스트는 자기 자리만 지움
    async cleanupRoom() {
        if (!this.roomId || !this.fb) return;
        const target = this.path(isHost ? '' : 'guest');
        this.roomId = null;
        try {
            await this.fb.onDisconnect(target).cancel();
            await this.fb.remove(target);
        } catch(e) {
            console.warn('DB Cleanup error:', e);
        }
    }

    async disconnect() {
        this.closed = true;
        this.connected = false;
        this.unsubs.splice(0).forEach(off => off());
        await this.cleanupRoom();
    }
}

function openLobby() { 
    document.getElementById('multiplayer-lobby').style.display = 'flex'; 
    document.getElementById('lobby-content').style.display = 'block';
    document.getElementById('ready-content').style.display = 'none';
    document.getElementById('online-char-select').style.display = 'none';
    document.getElementById('join-code').value = '';
    
    // 이전에 비활성화된 참가 버튼 초기화
    const joinBtn = document.querySelector('#lobby-content button.bg-green-600');
    if(joinBtn) { joinBtn.innerText = "참가하기"; joinBtn.disabled = false; }
}

function closeLobby() { 
    document.getElementById('multiplayer-lobby').style.display = 'none'; 
    if(mpManager && !mpManager.connected) {
        mpManager.disconnect();
        mpManager = null; // 인스턴스 초기화
    } 
}

function leaveOnlineRoom() {
    if(mpManager) mpManager.disconnect();
    mpManager = null; // 인스턴스를 완전히 비워 새 방 생성시 꼬이지 않게 함
    isLocalReady = false; isRemoteReady = false;
    isHost = false; isOnline = false;
    closeLobby();
}

function showReadyRoom(code) {
    document.getElementById('lobby-content').style.display = 'none';
    document.getElementById('ready-content').style.display = 'block';
    document.getElementById('ready-room-code-display').innerText = code;
    
    isLocalReady = false;
    isRemoteReady = false;
    const btn = document.getElementById('btn-online-ready');
    btn.innerText = '준비 (Ready)';
    btn.className = 'px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded text-xl font-bold w-full mb-3 shadow-lg transition-colors';
    
    if (isHost) {
        document.getElementById('ready-p1-status').innerText = '준비 대기 중...';
        document.getElementById('ready-p1-status').className = 'text-lg mt-2 text-yellow-400 font-bold';
        
        document.getElementById('ready-p2-status').innerText = '접속 대기 중...';
        document.getElementById('ready-p2-status').className = 'text-lg mt-2 text-gray-400 font-bold';
    } else {
        document.getElementById('ready-p2-status').innerText = '준비 대기 중...';
        document.getElementById('ready-p2-status').className = 'text-lg mt-2 text-yellow-400 font-bold';
        
        document.getElementById('ready-p1-status').innerText = '접속 대기 중...';
        document.getElementById('ready-p1-status').className = 'text-lg mt-2 text-gray-400 font-bold';
    }
}

function toggleOnlineReady() {
    if (!mpManager || !mpManager.connected) {
        showMenuMessage('아직 상대방과 연결되지 않았습니다. 상대방이 접속할 때까지 기다려주세요.', '#eab308');
        return;
    }
    
    isLocalReady = !isLocalReady;
    document.getElementById('btn-online-ready').innerText = isLocalReady ? '준비 취소' : '준비 (Ready)';
    mpManager.sendMsg({type: 'sync', ready: isLocalReady});
    
    let myStatusId = isHost ? 'ready-p1-status' : 'ready-p2-status';
    let statEl = document.getElementById(myStatusId);
    statEl.innerText = isLocalReady ? '준비 완료 (Ready)' : '준비 대기 중...';
    statEl.className = isLocalReady ? 'text-lg mt-2 text-green-400 font-bold' : 'text-lg mt-2 text-yellow-400 font-bold';
    
    checkAllReady();
}

function checkAllReady() {
    if (isLocalReady && isRemoteReady && isHost) {
        setTimeout(() => {
            mpManager.sendMsg({type: 'goto_char_select'});
            
            // 호스트 로컬 전환
            document.getElementById('ready-content').style.display = 'none';
            document.getElementById('online-char-select').style.display = 'flex';
            isOnlineCharLocked = false;
            isRemoteCharLocked = false;
            
            p1Selection = 'yuji'; p2Selection = 'gojo'; // 기본값
            document.getElementById('online-p1-status').innerText = '고르는 중...';
            document.getElementById('online-p1-status').className = 'text-yellow-400 font-bold';
            document.getElementById('online-p2-status').innerText = '고르는 중...';
            document.getElementById('online-p2-status').className = 'text-yellow-400 font-bold';
            
            renderOnlineCharGrid();
            selectOnlineChar(p1Selection, true);
        }, 500);
    }
}

// ================= 온라인 캐릭터 선택창 로직 =================
function renderOnlineCharGrid() {
    const grid = document.getElementById('online-char-grid');
    grid.innerHTML = '';
    Object.keys(CHAR_DATA).forEach(key => {
        const char = CHAR_DATA[key];
        if (char.secret && !unlockedSecrets.includes(key)) return;
        
        const el = document.createElement('div');
        el.className = 'char-card';
        el.id = `online-card-${key}`;
        el.innerHTML = `<div class="char-color-box" style="background:${char.color}"></div><div class="text-xs text-white">${char.name}</div>`;
        
        el.onclick = () => selectOnlineChar(key, false);
        grid.appendChild(el);
    });
}

function selectOnlineChar(key, isInit = false) {
    if (isOnlineCharLocked) return;
    if (isHost) {
        p1Selection = key;
        document.getElementById('online-p1-char-name').innerText = CHAR_DATA[key].name;
    } else {
        p2Selection = key;
        document.getElementById('online-p2-char-name').innerText = CHAR_DATA[key].name;
    }
    
    document.querySelectorAll('#online-char-grid .char-card').forEach(el => {
        el.classList.remove('selected-p1', 'selected-p2');
    });
    const myCard = document.getElementById(`online-card-${key}`);
    if (myCard) myCard.classList.add(isHost ? 'selected-p1' : 'selected-p2');

    if (!isInit) mpManager.sendMsg({type: 'hover_char', char: key});
}

function lockInOnlineChar() {
    if (isOnlineCharLocked) return;
    let myChar = isHost ? p1Selection : p2Selection;
    if (!myChar) return;
    
    isOnlineCharLocked = true;
    document.getElementById('btn-online-lockin').innerText = '확정 대기 중...';
    document.getElementById('btn-online-lockin').className = 'mt-8 px-12 py-4 bg-gray-600 text-white text-2xl rounded-full font-bold shadow-lg';
    
    let myStatusEl = document.getElementById(isHost ? 'online-p1-status' : 'online-p2-status');
    myStatusEl.innerText = '확정 (Locked)';
    myStatusEl.className = 'text-green-400 font-bold';

    mpManager.sendMsg({type: 'lock_char', char: myChar});
    checkAllCharLocked();
}

function checkAllCharLocked() {
    if (isOnlineCharLocked && isRemoteCharLocked && isHost) {
        mpManager.sendMsg({type: 'start_online_game'});
        setTimeout(() => {
            document.getElementById('multiplayer-lobby').style.display = 'none';
            startGame(false, 'normal', false);
        }, 500);
    }
}

function createOnlineRoom() { 
    mpManager = new MultiplayerManager(); 
    mpManager.createRoom(); 
}

function joinOnlineRoom() {
    const code = document.getElementById('join-code').value.trim();
    if(!code) return showMenuMessage("방 코드를 입력해주세요.", "#ef4444");
    
    const joinBtn = document.querySelector('#lobby-content button.bg-green-600');
    if(joinBtn) { joinBtn.innerText = "연결 중..."; joinBtn.disabled = true; }
    
    mpManager = new MultiplayerManager(); 
    mpManager.joinRoom(code).finally(() => {
        if(joinBtn) { joinBtn.innerText = "참가하기"; joinBtn.disabled = false; }
    });
}
