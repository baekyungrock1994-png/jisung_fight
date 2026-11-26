// 온라인 1V1 (WebRTC + Firebase 시그널링)

// ================= 온라인 멀티플레이 (WebRTC + Firebase) 시스템 =================
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

class MultiplayerManager {
    constructor() {
        this.pc = new RTCPeerConnection({ iceServers: [
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' }
        ] });
        this.dc = null; 
        this.roomId = null; 
        this.fb = null; 
        this.unsub = null; 
        this.connected = false;
        this.remoteDescSet = false;
        this.candidateQueue = [];
        
        this.pc.onicecandidate = (e) => {
            if(e.candidate && this.fb && this.roomId) {
                const roomRef = this.fb.doc(this.fb.db, 'rooms', this.roomId);
                const field = isHost ? 'hostCandidates' : 'guestCandidates';
                // Firebase arrayUnion의 객체 매칭 버그 방지를 위해 통신 데이터를 문자열로 완벽하게 변환하여 저장
                const candStr = JSON.stringify(e.candidate.toJSON()); 
                
                this.fb.updateDoc(roomRef, { [field]: this.fb.arrayUnion(candStr) })
                       .catch(err => console.warn("ICE Update Delay:", err));
            }
        };
        
        this.pc.onconnectionstatechange = () => {
            if (this.pc.connectionState === 'disconnected' || this.pc.connectionState === 'failed') {
                showMenuMessage("상대방과의 연결이 끊어졌습니다.", "#ef4444");
                if (typeof gameActive !== 'undefined' && gameActive) backToMenu();
                else leaveOnlineRoom();
            }
        };
    }
    
    async initFB() {
        if(!this.fb) this.fb = await window.initOnlineMultiplayer();
        return this.fb !== null;
    }

    addCandidate(candidateObj) {
        if (!candidateObj) return;
        try {
            const c = typeof candidateObj === 'string' ? JSON.parse(candidateObj) : candidateObj;
            if (this.remoteDescSet) {
                this.pc.addIceCandidate(new RTCIceCandidate(c)).catch(e=>{});
            } else {
                this.candidateQueue.push(c);
            }
        } catch(e) {}
    }

    processQueue() {
        while(this.candidateQueue.length > 0) {
            const c = this.candidateQueue.shift();
            this.pc.addIceCandidate(new RTCIceCandidate(c)).catch(e=>{});
        }
    }

    async createRoom() {
        try {
            if(!await this.initFB()) return;
            if(this.pc.signalingState === 'closed') return;
            isHost = true;
            this.roomId = String(Math.floor(100000 + Math.random() * 900000));
            
            this.dc = this.pc.createDataChannel('game', { ordered: true });
            this.setupDataChannel();
            
            const roomRef = this.fb.doc(this.fb.db, 'rooms', this.roomId);
            
            // 1. 방을 DB에 가장 먼저 생성 (이후 발생할 ICE 데이터가 유실되지 않도록 보장)
            await this.fb.setDoc(roomRef, {
                hostUid: this.fb.user.uid, // 보안 규칙: 방을 만든 사람만 삭제 가능
                hostCandidates: [], 
                guestCandidates: [],
                createdAt: Date.now()
            });

            // 2. 초대장(Offer) 생성
            const offer = await this.pc.createOffer();
            
            // 3. 로컬 연결 정보 적용 (이 순간부터 내 인터넷 회선 정보(ICE)가 수집되기 시작함)
            await this.pc.setLocalDescription(offer);
            
            // 4. DB에 초대장 업데이트 (게스트가 볼 수 있게 됨)
            await this.fb.updateDoc(roomRef, {
                offer: { type: offer.type, sdp: offer.sdp }
            });
            
            showReadyRoom(this.roomId);
            
            let answerProcessed = false;
            let processedGuestCandidates = new Set();

            // 5. 게스트의 응답(Answer) 및 접속 정보(ICE) 대기
            this.unsub = this.fb.onSnapshot(roomRef, async (snap) => {
                if(!snap.exists()) return; // 방이 삭제된 경우 무시
                
                const data = snap.data();
                
                // 게스트가 방을 나갔다는 플래그를 확인하면 방 폭파 처리
                if (data.guestLeft) {
                    showMenuMessage("게스트가 방을 나갔습니다. 방을 다시 생성해주세요.", "#ef4444");
                    leaveOnlineRoom();
                    return;
                }
                
                if(data.answer && !answerProcessed && this.pc.signalingState !== 'closed') {
                    answerProcessed = true;
                    p2Selection = data.p2Char || p2Selection; 
                    updateMenuUI();
                    await this.pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                    this.remoteDescSet = true;
                    this.processQueue();
                }
                
                if(data.guestCandidates) {
                    data.guestCandidates.forEach(cStr => {
                        if(!processedGuestCandidates.has(cStr)) {
                            processedGuestCandidates.add(cStr);
                            this.addCandidate(cStr);
                        }
                    });
                }
            });

        } catch(e) { 
            console.error(e); 
            showMenuMessage('방 생성에 실패했습니다.', '#ef4444'); 
            closeLobby(); 
        }
    }

    async joinRoom(code) {
        try {
            if(!await this.initFB()) return;
            if(this.pc.signalingState === 'closed') return;
            isHost = false;
            this.roomId = code.trim(); 
            
            const roomRef = this.fb.doc(this.fb.db, 'rooms', this.roomId);
            const snap = await this.fb.getDoc(roomRef);
            
            if(!snap.exists()) {
                showMenuMessage(`존재하지 않거나 이미 종료된 방입니다.`, '#ef4444');
                return; 
            }
            
            const data = snap.data();
            if(!data.offer) {
                showMenuMessage(`방 정보가 유효하지 않습니다.`, '#ef4444');
                return;
            }

            if(data.answer) {
                this.roomId = null; // 남의 방에 퇴장 기록을 남기지 않도록
                showMenuMessage(`이미 가득 찬 방입니다.`, '#ef4444');
                return;
            }

            this.pc.ondatachannel = (event) => {
                this.dc = event.channel;
                this.setupDataChannel();
            };
            
            p1Selection = data.p1Char || p1Selection;
            updateMenuUI();
            showReadyRoom(this.roomId);
            
            let processedHostCandidates = new Set();
            this.unsub = this.fb.onSnapshot(roomRef, (s) => {
                if(!s.exists()) {
                    showMenuMessage("호스트가 방을 삭제했거나 방이 터졌습니다.", "#ef4444");
                    leaveOnlineRoom();
                    return;
                }
                
                let d = s.data();
                if(d && d.hostCandidates) {
                    d.hostCandidates.forEach(cStr => {
                        if(!processedHostCandidates.has(cStr)) {
                            processedHostCandidates.add(cStr);
                            this.addCandidate(cStr);
                        }
                    });
                }
            });
            
            // 호스트의 초대장을 내 연결에 적용
            await this.pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            this.remoteDescSet = true;
            this.processQueue();
            
            // 참가장(Answer) 생성
            const answer = await this.pc.createAnswer();
            
            // 로컬 연결 정보 적용 (내 접속 정보(ICE) 수집 시작)
            await this.pc.setLocalDescription(answer);
            
            // DB에 참가장 전송
            await this.fb.updateDoc(roomRef, {
                answer: { type: answer.type, sdp: answer.sdp }
            });
            
        } catch(e) { 
            console.error(e); 
            showMenuMessage(`방 참가에 실패했습니다: ${e.message}`, '#ef4444'); 
            closeLobby(); 
        }
    }

    setupDataChannel() {
        if (!this.dc) return;
        const onOpenHandler = () => {
            if(this.connected) return;
            this.connected = true;
            if(this.unsub) { this.unsub(); this.unsub = null; }
            isOnline = true;
            
            this.sendMsg({type: 'sync', ready: isLocalReady});
            
            let remoteStatusEl = document.getElementById(isHost ? 'ready-p2-status' : 'ready-p1-status');
            if (remoteStatusEl.innerText.includes('접속')) {
                remoteStatusEl.innerText = '준비 대기 중...';
                remoteStatusEl.className = 'text-lg mt-2 text-yellow-400 font-bold';
            }
        };

        // 진짜로 누락되었던 바로 그 이벤트 리스너 할당 코드입니다!!
        this.dc.onopen = onOpenHandler;

        this.dc.onmessage = (e) => {
            const msg = JSON.parse(e.data);
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
        };

        if (this.dc.readyState === 'open') {
            onOpenHandler();
        }
    }
    
    sendMsg(data) {
        if(this.connected && this.dc.readyState === 'open') {
            this.dc.send(JSON.stringify(data));
        }
    }
    
    sendInput(key, state) {
        this.sendMsg({type: 'key', key, state});
    }

    async disconnect() {
        this.connected = false;
        if (this.unsub) { this.unsub(); this.unsub = null; }
        if (this.dc) { this.dc.close(); this.dc = null; }
        if (this.pc) { this.pc.close(); }

        // 서버(DB)에서 확실하게 방 데이터 삭제 또는 퇴장 플래그 기록
        if (this.roomId && this.fb) {
            try {
                const roomRef = this.fb.doc(this.fb.db, 'rooms', this.roomId);
                if (isHost) {
                    await this.fb.deleteDoc(roomRef); // 호스트가 나가면 방 자체를 파괴
                } else {
                    await this.fb.updateDoc(roomRef, { guestLeft: true }); // 게스트가 나가면 호스트에게 알림
                }
            } catch(e) {
                console.warn("DB Cleanup error:", e);
            }
        }
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
