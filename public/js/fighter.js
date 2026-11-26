// 캐릭터(Fighter) 클래스

class Fighter {
    constructor({x, y, data, isP1, charId}) {
        this.pos = {x, y}; this.v = {x: 0, y: 0};
        this.w = 50; this.h = 150;
        this.data = data; this.isP1 = isP1; this.charId = charId;
        this.skills = data.skills.map(s => ({...s})); 
        this.color = data.color;
        this.facing = isP1 ? 1 : -1;
        this.health = 100;
        this.skillCds = [0, 0, 0, 0, 0];
        
        // State
        this.isAttacking = false;
        this.stunned = 0;
        this.attackBox = { pos: {x:0, y:0}, w: 0, h: 50, active: false };
        this.lastBasicAttack = 0; // 평타 0.2초 쿨타임 변수 추가
        
        // 추가 상태 변수
        this.zoneTimer = 0; 
        this.sukunaAITimer = 0;
        this.slowedByDomain = false;
        this.frameStun = 0; 
        this.frameGauge = 0; 
        this.poisonTimer = 0; 
        this.jackpotTimer = 0; 
        this.invincibleTimer = 0; 
        this.wheelAngle = 0; 
        this.prevPos = {x, y}; 
        
        // 토우지, 유타 추가 패시브 관련
        this.tojiSpinTimer = 0;
        this.rikaActive = false;
        this.rimuruAITimer = 0;
        this.yujiSummonTimer = 0; // 토도 이타도리 소환 타이머
        this.swapTimer = 0;
        this.originalName = '';
        this.originalColor = '';
        this.originalSkills = [];
        
        // 아이젠 전용 상태
        this.aizenStage = 0;
        this.hogyokuGauge = 0;

        // 각성 관련 변수
        this.sukunaFingers = 13;
        this.mahitoDomainUsed = false;
        this.mahitoBFHits = 0;
        this.naoyaSkill5Hit = false;
        this.naoyaUltHit = false;
        this.getoUltUsed = false;
        this.dioRoadRoller = false;
        this.dioTimeStop = false;
        this.standTimer = 0; // 스탠드 현현 타이머
        this.rimuruSouls = 0;
        this.evolutionStage = 0; // 리무루 진화 단계

        this.canAwaken = false;
        this.awakened = false;
        this.isHeian = false; // 헤이안 스쿠나 외형 플래그
        this.isDistorted = false; // 편살즉영체 외형 플래그
        this.isCursedNaoya = false; // 주령 나오야 외형 플래그
        this.isKenjaku = false; // 켄자쿠 외형 플래그

        this.baseSpeed = this.charId === 'naoya' ? 10.5 : 7;
        
        if (this.charId === 'rentaro') {
            this.baseSpeed = 12; // 기본 이속 매우 높음
            this.damageMultiplier = 1.5; // 기본 공격력 매우 높음
        }

        this.globalSkillCooldown = 0; // 글로벌 스킬 쿨타임 (0.5초 간격)

        this.yujiAwakened = false;
        this.megumiAwakened = false;
        this.ryuAwakened = false;
        this.hakariRevive = true;
        this.damageMultiplier = 1.0;

        this.getoOrbs = 0;
        this.mahoragaMeleeHits = 0;
        this.mahoragaProjHits = 0;
        this.mahoragaMeleeStacks = 0;
        this.mahoragaProjStacks = 0;

        // 에스카노르 & 렌타로 추가 기믹 변수
        this.escanorReflectTimer = 0;
        this.escanorTheOneGauge = 0;
        this.escanorCharging = false;
        
        this.rentaroSkillsUsed = { s1: false, s2: false, s3: false, s4: false };
        this.rentaroComboTimer = 0;
        this.rentaroAwakenGauge = 0;
        this.rentaroCharging = false;
        this.rentaroVisualTimer = 0;
        this.rentaroVisualName = '';
        this.rentaroSkillSet = 1; // 스킬셋 상태 저장 변수 추가
    }

    draw() {
        if (this.charId === 'naoya' && Math.abs(this.v.x) > 15 && globalFrame % 3 === 0) {
            effects.push({ type: 'afterimage', x: this.pos.x, y: this.pos.y, color: 'rgba(250,204,21,0.4)', life: 10 });
        }

        if (this.jackpotTimer > 0) {
            this.jackpotTimer--;
            this.health = 100; 
            if(Math.random() < 0.2) spawnParticles(this.pos.x + this.w/2, this.pos.y + this.h, '#fcd34d', 2);
        }

        // 유타 리카 식신 현현 시 렌더링
        if (this.charId === 'yuta' && this.rikaActive) {
            c.save();
            let rX = this.pos.x + (this.facing === 1 ? -60 : 60);
            let rY = this.pos.y - 30;
            c.fillStyle = 'rgba(239, 68, 68, 0.7)'; 
            c.beginPath(); c.ellipse(rX + this.w/2, rY + this.h/2, 60, 90, 0, 0, Math.PI*2); c.fill();
            c.fillStyle = 'black'; 
            c.beginPath(); c.arc(rX + this.w/2 + (this.facing*15), rY + 30, 8, 0, Math.PI*2); c.fill(); 
            c.fillStyle = 'white'; c.font = '20px Arial'; c.fillText('리카', rX + 15, rY - 10);
            c.restore();
        }

        // 토도 아오이 이타도리 유지 소환 렌더링
        if (this.charId === 'todo' && this.yujiSummonTimer > 0) {
            this.yujiSummonTimer--;
            c.save();
            let rX = this.pos.x + (this.facing === 1 ? -60 : 60);
            let rY = this.pos.y + 30;
            c.fillStyle = '#b45309'; 
            c.fillRect(rX, rY, 50, 120);
            c.fillStyle = 'white'; c.font = '16px Arial'; c.fillText('유지', rX + 5, rY - 10);
            c.restore();
            
            if (this.yujiSummonTimer % 60 === 0) {
                const target = players[this.isP1 ? 1 : 0];
                if (Math.hypot(target.pos.x - rX, target.pos.y - rY) < 120) {
                    target.takeDamage(12, 5, 'shake');
                    spawnParticles(target.pos.x + target.w/2, target.pos.y + target.h/2, '#b45309', 15);
                }
            }
        }

        if (this.isCursedNaoya) {
            // 주령 나오야 (제트기/애벌레 형태)
            c.fillStyle = '#422006';
            c.beginPath(); c.ellipse(this.pos.x + this.w/2, this.pos.y + this.h/2, 60, 40, 0, 0, Math.PI*2); c.fill();
            c.fillStyle = '#facc15';
            c.beginPath(); c.arc(this.pos.x + (this.facing===1 ? this.w + 10 : -10), this.pos.y + this.h/2, 8, 0, Math.PI*2); c.fill();
            c.strokeStyle = '#a16207'; c.lineWidth = 8;
            c.beginPath(); c.moveTo(this.pos.x + this.w/2, this.pos.y + this.h/2); c.lineTo(this.pos.x - 20, this.pos.y + this.h); c.stroke();
            c.beginPath(); c.moveTo(this.pos.x + this.w/2, this.pos.y + this.h/2); c.lineTo(this.pos.x + this.w + 20, this.pos.y + this.h); c.stroke();
        } else {
            // 에스카노르 각성 시 열기/연기 이펙트
            if (this.charId === 'escanor' && this.awakened) {
                if(Math.random() < 0.3) spawnParticles(this.pos.x + Math.random()*this.w, this.pos.y + this.h, '#fbbf24', 1);
                if(Math.random() < 0.2) spawnParticles(this.pos.x + Math.random()*this.w, this.pos.y, '#ffffff', 1); // 연기
            }

            // 디오 스탠드 시각화 (스킬 사용 또는 반사 시 뒤에 더 월드 현현)
            if (this.charId === 'dio' && this.standTimer > 0) {
                c.fillStyle = 'rgba(234, 179, 8, 0.5)'; // 더 월드 황금색 반투명
                let standX = this.pos.x + (this.facing === 1 ? -20 : 20);
                c.fillRect(standX, this.pos.y - 10, this.w + 10, this.h + 20);
                c.fillStyle = 'rgba(255, 255, 255, 0.8)';
                c.fillRect(standX + (this.facing === 1 ? 30 : 10), this.pos.y + 10, 15, 15); // 스탠드 눈
                this.standTimer--;
            }

            if (this.charId === 'aizen') {
                c.fillStyle = (this.aizenStage >= 1 && this.aizenStage < 3) ? '#e2e8f0' : (this.aizenStage === 5 ? 'transparent' : this.color);
                if (this.aizenStage < 5) c.fillRect(this.pos.x, this.pos.y, this.w, this.h);
                
                if (this.aizenStage >= 1 && this.aizenStage < 3) {
                    c.fillStyle = '#cbd5e1'; c.fillRect(this.pos.x - 5, this.pos.y - 5, this.w + 10, this.h + 10);
                    if (this.aizenStage === 2) {
                        c.fillStyle = 'black'; c.fillRect(this.pos.x + (this.facing===1?-10:this.w), this.pos.y, 10, 40); // 장발
                        c.fillStyle = '#94a3b8'; c.fillRect(this.pos.x + (this.facing===1?this.w:-40), this.pos.y + 40, 40, 10); // 팔 검
                    }
                }
                if (this.aizenStage >= 3 && this.aizenStage < 5) {
                    c.fillStyle = 'rgba(216, 180, 254, 0.6)'; // 나방 날개
                    c.beginPath(); c.ellipse(this.pos.x + this.w/2, this.pos.y + 20, 30, 80, (Math.PI/6) * this.facing, 0, Math.PI*2); c.fill();
                    c.beginPath(); c.ellipse(this.pos.x + this.w/2, this.pos.y + 60, 25, 60, (Math.PI/4) * this.facing, 0, Math.PI*2); c.fill();
                    if (this.aizenStage === 4) {
                        c.fillStyle = 'black'; c.fillRect(this.pos.x + (this.facing===1?this.w-20:0), this.pos.y, 20, 20); // 검은 얼굴
                        c.fillStyle = 'white'; c.fillRect(this.pos.x + (this.facing===1?this.w-10:5), this.pos.y+5, 5, 5); // 붉은/하얀 눈
                    }
                }
                if (this.aizenStage === 5) { // 무간 의자 폼
                    c.fillStyle = '#1e293b'; c.fillRect(this.pos.x - 10, this.pos.y + 60, this.w + 20, 90); 
                    c.fillRect(this.pos.x - 10, this.pos.y + 10, 20, 140);
                    c.fillStyle = 'black'; c.fillRect(this.pos.x, this.pos.y + 30, this.w, this.h - 30); // 묶인 몸
                    c.fillStyle = '#f8fafc'; c.fillRect(this.pos.x + (this.facing===1?this.w-25:5), this.pos.y + 10, 20, 25); // 얼굴
                    c.fillStyle = 'black'; c.fillRect(this.pos.x + (this.facing===1?this.w-20:5), this.pos.y+15, 10, 8); // 안대
                }
                
                // 붕옥 진화 게이지
                if (this.aizenStage < 5 && this.hogyokuGauge > 0 && this.aizenStage < 3) {
                    let maxGauge = this.aizenStage === 0 ? 1000 : (this.aizenStage === 1 ? 2500 : 4500);
                    c.fillStyle = '#444'; c.fillRect(this.pos.x, this.pos.y - 15, this.w, 5);
                    c.fillStyle = '#c084fc'; c.fillRect(this.pos.x, this.pos.y - 15, this.w * Math.min(1, this.hogyokuGauge / maxGauge), 5);
                }
            } else {
                c.fillStyle = this.color;
                c.fillRect(this.pos.x, this.pos.y, this.w, this.h);
            }
            
            if (this.charId !== 'aizen' || this.aizenStage < 4) {
                c.fillStyle = 'white'; 
                let eyeX = this.pos.x + (this.facing === 1 ? this.w - 15 : 5);
                c.fillRect(eyeX, this.pos.y + 20, 10, 10);
            }

            // 각성 외형 렌더링 (인간형 베이스에 추가)
            if (this.isHeian) {
                c.fillStyle = '#450a0a';
                // 팔 칼날 렌더링
                c.fillRect(this.pos.x + (this.facing === 1 ? this.w : -30), this.pos.y + 40, 30, 80);
            }
            
            if (this.isKenjaku) {
                c.strokeStyle = 'black'; c.lineWidth = 2;
                c.beginPath(); c.moveTo(this.pos.x + 5, this.pos.y + 10); c.lineTo(this.pos.x + this.w - 5, this.pos.y + 10); c.stroke();
                for(let i=10; i<this.w-5; i+=8) {
                    c.beginPath(); c.moveTo(this.pos.x + i, this.pos.y + 7); c.lineTo(this.pos.x + i, this.pos.y + 13); c.stroke();
                }
            }

            // 에스카노르 게이지
            if (this.charId === 'escanor' && this.escanorCharging) {
                c.fillStyle = '#444'; c.fillRect(this.pos.x - 10, this.pos.y - 40, this.w + 20, 8);
                c.fillStyle = '#f59e0b'; c.fillRect(this.pos.x - 10, this.pos.y - 40, (this.w + 20) * (this.escanorTheOneGauge / 900), 8);
                c.fillStyle = 'white'; c.font = '10px Arial'; c.fillText('정오가 다가온다...', this.pos.x - 10, this.pos.y - 45);
            }

            // 렌타로 게이지
            if (this.charId === 'rentaro' && this.rentaroCharging) {
                c.fillStyle = '#444'; c.fillRect(this.pos.x - 10, this.pos.y - 40, this.w + 20, 8);
                c.fillStyle = '#ec4899'; c.fillRect(this.pos.x - 10, this.pos.y - 40, (this.w + 20) * (this.rentaroAwakenGauge / 600), 8);
                c.fillStyle = 'white'; c.font = '10px Arial'; c.fillText('사랑의 각성...', this.pos.x - 10, this.pos.y - 45);
            }

            // 렌타로 여친 소환 시각화 (앞으로 튀어나와 공격하는 연출)
            if (this.charId === 'rentaro' && this.rentaroVisualTimer > 0) {
                this.rentaroVisualTimer--;
                c.fillStyle = 'pink';
                // 공격 방향의 앞쪽으로 튀어나오도록 위치 변경
                let gfX = this.pos.x + (this.facing===1 ? this.w + 10 : -40);
                c.fillRect(gfX, this.pos.y + 20, 30, 60);
                c.fillStyle = 'white'; c.font = '12px Arial'; c.fillText(this.rentaroVisualName, gfX - 10, this.pos.y + 15);
            }
        }
        
        if (this.globalSkillCooldown > 0) this.globalSkillCooldown--;

        if (this.frameGauge > 0) {
            c.fillStyle = '#444';
            c.fillRect(this.pos.x, this.pos.y - 20, this.w, 8);
            c.fillStyle = '#facc15';
            c.fillRect(this.pos.x, this.pos.y - 20, this.w * (this.frameGauge / 100), 8);
        }

        if (this.frameStun > 0) {
            this.frameStun--;
            c.strokeStyle = 'rgba(250, 204, 21, 0.8)';
            c.lineWidth = 6;
            c.setLineDash([10, 5]);
            c.strokeRect(this.pos.x - 10, this.pos.y - 10, this.w + 20, this.h + 20);
            c.setLineDash([]);
            c.fillStyle = 'rgba(250, 204, 21, 0.2)';
            c.fillRect(this.pos.x - 10, this.pos.y - 10, this.w + 20, this.h + 20);
        }

        if (this.poisonTimer > 0) {
            c.fillStyle = 'rgba(167, 243, 208, 0.5)';
            c.fillRect(this.pos.x, this.pos.y, this.w, this.h);
        }
        
        // 토우지 승부는 지금부터다 (광역 지속 데미지 렌더링)
        if (this.tojiSpinTimer > 0) {
            this.tojiSpinTimer--;
            c.save();
            c.translate(this.pos.x + this.w/2, this.pos.y + this.h/2);
            c.rotate(this.tojiSpinTimer * 0.4);
            c.strokeStyle = '#475569'; c.lineWidth = 4;
            c.beginPath(); c.arc(0, 0, 150, 0, Math.PI * 2); c.stroke();
            
            c.fillStyle = '#1f2937'; c.fillRect(150, -10, 50, 20); 
            c.fillStyle = '#a3a3a3'; c.fillRect(-180, -10, 30, 20); 
            c.restore();
            
            // 데미지 판정
            if (this.tojiSpinTimer % 10 === 0) {
                const target = players[this.isP1 ? 1 : 0];
                if (Math.hypot(target.pos.x - this.pos.x, target.pos.y - this.pos.y) < 170) {
                    target.takeDamage(4, 2, 'shake');
                }
            }
        }

        if (this.attackBox.active) {
            c.save();
            if (this.charId === 'ryu' && this.currentEff === 'laser_ring') {
                c.translate(this.pos.x + this.w/2, this.pos.y + this.h/2);
                let angle = (globalFrame * 0.4) % (Math.PI * 2);
                c.rotate(angle);
                c.strokeStyle = '#60a5fa'; c.lineWidth = 12; c.shadowBlur = 20; c.shadowColor = '#2563eb';
                c.beginPath(); c.arc(0, 0, 70, 0, Math.PI*2); c.stroke();
                c.fillStyle = 'white';
                c.beginPath(); c.arc(70, 0, 12, 0, Math.PI*2); c.fill();
                c.beginPath(); c.arc(-70, 0, 12, 0, Math.PI*2); c.fill();
            } else if (this.charId === 'megumi' && this.attackBox.w === 200) {
                c.fillStyle = '#f472b6'; 
                let startX = this.facing === 1 ? this.pos.x + this.w : this.pos.x;
                c.fillRect(startX, this.pos.y + 30, this.facing === 1 ? this.attackBox.w : -this.attackBox.w, 20);
                c.fillStyle = '#4ade80';
                c.fillRect(this.pos.x + (this.facing === 1 ? this.w : -40), this.pos.y + 10, 40, 50);
                c.fillStyle = 'black'; c.fillRect(this.pos.x + (this.facing === 1 ? this.w + 20 : -20), this.pos.y + 20, 5, 5);
            } else {
                c.fillStyle = this.attackBox.color || 'rgba(255,255,255,0.5)';
                c.shadowBlur = 20; c.shadowColor = this.attackBox.color;
                
                c.beginPath();
                let startX = this.facing === 1 ? this.pos.x + this.w : this.pos.x;
                if(this.currentEff === 'shake' || Math.random() > 0.5) {
                    c.arc(startX, this.pos.y + 40, this.attackBox.w, Math.PI*(this.facing===1?-0.2:0.8), Math.PI*(this.facing===1?0.2:1.2), this.facing===-1);
                    c.lineWidth = 15; c.strokeStyle = this.attackBox.color; c.stroke();
                } else {
                    c.globalAlpha = 0.6;
                    c.fillRect(this.attackBox.pos.x, this.attackBox.pos.y, this.attackBox.w, this.attackBox.h);
                }
            }
            c.globalAlpha = 1;
            c.restore();
        }

        if (this.zoneTimer > 0) {
            this.zoneTimer--;
            if(Math.random() < 0.3) spawnParticles(this.pos.x + this.w/2, this.pos.y + this.h, '#000000', 1);
            if(Math.random() < 0.3) spawnParticles(this.pos.x + this.w/2, this.pos.y + this.h, '#991b1b', 1);
        }
        
        if(this.stunned > 0) this.stunned--;
        for(let i=0; i<5; i++) if(this.skillCds[i] > 0) this.skillCds[i]--;

        if(this.poisonTimer > 0) {
            this.poisonTimer--;
            if(this.poisonTimer % 30 === 0) this.takeDamage(1);
        }

        if(this.charId === 'hakari' && this.health <= 50 && Math.random() < 0.016) {
            this.takeDamage(-1); 
        }

        if(this.charId === 'sukuna' && this.health <= 30 && this.health > 0 && Math.random() < 0.03) {
            this.takeDamage(-1);
            if(Math.random() < 0.5) spawnParticles(this.pos.x+25, this.pos.y+75, '#fca5a5', 2);
        }

        this.attackBox.pos.x = this.facing === 1 ? this.pos.x + this.w : this.pos.x - this.attackBox.w;
        this.attackBox.pos.y = this.pos.y + 30;

        this.prevPos = {x: this.pos.x, y: this.pos.y};

        this.pos.x += this.v.x;
        this.pos.y += this.v.y;
        if (this.pos.y + this.h + this.v.y >= canvas.height - 50) {
            this.v.y = 0; this.pos.y = canvas.height - 50 - this.h;
        } else this.v.y += gravity;
        
        if(this.pos.x <= 0) { 
            this.pos.x = 0; 
            if (this.charId === 'naoya' && this.v.x < 0) this.v.x = 0;
        }
        if(this.pos.x + this.w >= canvas.width) { 
            this.pos.x = canvas.width - this.w; 
            if (this.charId === 'naoya' && this.v.x > 0) this.v.x = 0;
        }

        if (this.charId === 'mahoraga') {
            c.save();
            c.translate(this.pos.x + this.w/2, this.pos.y - 30);
            this.wheelAngle += 0.02;
            if (this.invincibleTimer > 0) this.wheelAngle += 0.1; 
            c.rotate(this.wheelAngle);
            c.strokeStyle = '#facc15'; c.lineWidth = 3;
            c.beginPath(); c.arc(0, 0, 20, 0, Math.PI*2); c.stroke();
            for(let i=0; i<8; i++) {
                c.rotate(Math.PI/4);
                c.beginPath(); c.moveTo(0, 15); c.lineTo(0, 25); c.stroke();
                c.beginPath(); c.arc(0, 25, 3, 0, Math.PI*2); c.fillStyle = '#facc15'; c.fill();
            }
            c.restore();

            if (this.invincibleTimer > 0) {
                this.invincibleTimer--;
                c.strokeStyle = 'rgba(250, 204, 21, 0.5)'; c.lineWidth = 4;
                c.strokeRect(this.pos.x - 5, this.pos.y - 5, this.w + 10, this.h + 10);
                if(Math.random() < 0.1) spawnParticles(this.pos.x + this.w/2, this.pos.y + this.h, '#facc15', 1);
            }
        }
    }

    takeDamage(dmg, knockback = 0, eff = null, isProjectile = false) {
        let isTrueDamage = (eff === 'true_dmg');

        if (this.invincibleTimer > 0 && dmg > 0 && !isTrueDamage) return; 
        
        // 아이죠 렌타로 패시브
        if (this.charId === 'rentaro' && dmg > 0 && Math.random() < 0.15 && !isTrueDamage) {
            const gfNames = ['하카리', '카라네', '시즈카', '나노', '쿠스리', '하하리', '쿠루미', '메이', '이쿠', '미미미'];
            this.rentaroVisualName = gfNames[Math.floor(Math.random()*gfNames.length)];
            this.rentaroVisualTimer = 30;
            showSkillText('여친의 가호! (방어)', '#ec4899');
            spawnParticles(this.pos.x + this.w/2, this.pos.y + this.h/2, '#fbcfe8', 20);
            return;
        }

        // 토도 아오이 부기우기 패시브 처리
        if (this.charId === 'todo' && dmg > 0 && !isTrueDamage && Math.random() < 0.2) {
            let target = players[this.isP1 ? 1 : 0];
            let tempX = this.pos.x;
            this.pos.x = target.pos.x;
            target.pos.x = tempX;
            showSkillText('부기우기! (위치교환)', '#0f766e');
            AudioSys.playClap();
            spawnParticles(this.pos.x + this.w/2, this.pos.y + this.h/2, '#2dd4bf', 20);
            spawnParticles(target.pos.x + target.w/2, target.pos.y + target.h/2, '#2dd4bf', 20);
        }

        if (this.charId === 'rimuru' && dmg > 0 && !isTrueDamage) {
            let reduction = 1.0;
            if (this.evolutionStage >= 3) {
                reduction = 0.1; // 3단계 이상: 데미지를 10%만 받음
            } else if (this.awakened) {
                reduction = 0.70; // 각성 상태: 30% 감소
            } else {
                reduction = 0.85; // 기본 상태: 15% 감소
            }
            dmg = Math.floor(dmg * reduction);
        }

        if (this.frameStun > 0 && dmg > 0) {
            dmg = Math.floor(dmg * 1.5);
            spawnParticles(this.pos.x + this.w/2, this.pos.y + this.h/2, '#facc15', 5);
        }

        if (this.charId === 'gojo' && dmg > 0 && Math.random() < 0.15 && !isTrueDamage) {
            showSkillText('무하한 방어', '#0ea5e9');
            return;
        }

        // 에스카노르 방어력 증가 기믹 및 각성(더 원) 방어
        if (this.charId === 'escanor') {
            if (this.escanorReflectTimer > 0) dmg = Math.floor(dmg * 0.5); // 방어 버프
            if (this.awakened) dmg = Math.floor(dmg * 0.7); // 더 원 방어 30% 증가
        }
        
        if(this.charId === 'mahito' && this.awakened && dmg > 0 && !isTrueDamage) {
            dmg = Math.max(1, Math.floor(dmg * 0.5)); // 각성 마히토 고정 50% 반감
        } else if(this.charId === 'mahito' && dmg > 0 && Math.random() < 0.7 && !isTrueDamage && !this.awakened) {
            dmg = Math.max(1, Math.floor(dmg * 0.5));
            showSkillText('영혼 보호', '#6b7280');
        }

        if (this.charId === 'mahoraga' && dmg > 0 && !isTrueDamage) {
            if (isProjectile) {
                this.mahoragaProjHits++;
                if (this.mahoragaProjHits % 3 === 0 && this.mahoragaProjStacks < 10) {
                    this.mahoragaProjStacks++;
                    showSkillText(`원거리 적응! (-${this.mahoragaProjStacks*7}%)`, '#facc15');
                }
            } else {
                this.mahoragaMeleeHits++;
                if (this.mahoragaMeleeHits % 3 === 0 && this.mahoragaMeleeStacks < 10) {
                    this.mahoragaMeleeStacks++;
                    showSkillText(`근접 적응! (-${this.mahoragaMeleeStacks*7}%)`, '#facc15');
                }
            }
        }
            
        // 아이젠 붕옥 데미지 흡수 및 진화 트리거
        if (this.charId === 'aizen' && dmg > 0 && !isTrueDamage) {
            this.hogyokuGauge += dmg * 15;
            
            if (this.aizenStage >= 3 && this.aizenStage <= 4) dmg = Math.floor(dmg * 0.5); // 3,4단계 체력 효율 2배
            if (this.aizenStage === 5) dmg = Math.floor(dmg * 0.2); // 무간 방어력
            
            if (this.aizenStage === 3 && this.health - dmg <= 15 && this.health - dmg > 0) {
                this.aizenStage = 4;
                this.health = 30; // 4단계 진입 시 약간 회복
                this.damageMultiplier = 2.0;
                showSkillText('붕옥 융합: 4단계 (괴물)', '#000000');
                this.skills[1] = { name: '완전영창 흑관', key: this.skills[1].key, type: 'a', cd: 200, dmg: 40, radius: 250, c: '#000000', eff: 'stun' };
                this.skills[4] = { name: '프라골라 난사', key: this.skills[4].key, type: 'p', cd: 300, dmg: 20, speed: 25, w: 60, h: 60, c: '#a855f7', count: 5, spreadY: 100, delay: 20 };
                buildSkillUI(this, this.isP1 ? 'p1-skills' : 'p2-skills');
                return; 
            } else if (this.aizenStage === 4 && this.health - dmg <= 20 && this.health > 0) {
                this.aizenStage = 5;
                this.health = 100; // 무간 진입 시 체력 완전 회복
                this.damageMultiplier = 3.5;
                showSkillText('무간... 의자 아이젠', '#1e293b');
                this.skills = [
                    { name: '영압 짓누르기', key: this.skills[0].key, type: 'a', cd: 90, dmg: 30, radius: 300, c: '#4c1d95', eff: 'stun' },
                    { name: '흑관', key: this.skills[1].key, type: 'a', cd: 150, dmg: 50, radius: 150, c: '#000000', eff: 'shake' },
                    { name: '경화수월', key: this.skills[2].key, type: 'buff', cd: 300, dmg: 0, c: '#bae6fd' },
                    { name: '파도 99. 오룡전멸', key: this.skills[3].key, type: 'a', cd: 400, dmg: 80, radius: 800, c: '#7e22ce', eff: 'shake' },
                    { name: '붕옥의 의지', key: this.skills[4].key, type: 'buff', cd: 600, dmg: 0, c: '#f1f5f9' }
                ];
                buildSkillUI(this, this.isP1 ? 'p1-skills' : 'p2-skills');
                return; 
            }
        }

        // === 누락되었던 실제 체력 차감 로직 ===
        if (dmg > 0) {
            if (isTrainingMode && !this.isP1) {
                this.health = 100; // 훈련모드: 상대 체력 무한 유지
            } else {
                this.health = Math.max(0, this.health - dmg);
            }
            
            // 데미지 텍스트 추가 (설정 확인)
            if (config.showDamage) {
                let dtColor = (eff === 'true_dmg' || eff === 'shake') ? '#facc15' : '#ef4444';
                damageTexts.push({ x: this.pos.x + this.w/2 + (Math.random()*40-20), y: this.pos.y, text: dmg, life: 40, color: dtColor });
            }
        }

        // 각성 가능 체력 체크 (나오야, 게토, 디오)
        if (this.health <= 20 && this.health > 0 && !this.awakened && !this.canAwaken) {
            if (this.charId === 'naoya' && this.naoyaUltHit) {
                this.canAwaken = true;
                document.getElementById(this.isP1 ? 'p1-awaken-btn' : 'p2-awaken-btn').style.display = 'block';
                showSkillText('각성 가능!', '#facc15');
            } else if (this.charId === 'geto' && this.getoOrbs >= 6 && this.getoUltUsed) {
                this.canAwaken = true;
                document.getElementById(this.isP1 ? 'p1-awaken-btn' : 'p2-awaken-btn').style.display = 'block';
                showSkillText('각성 가능!', '#8b5cf6');
            }
        }

        if (this.charId === 'dio' && this.health <= 50 && this.health > 0 && !this.awakened && !this.canAwaken) {
            if (this.dioRoadRoller && this.dioTimeStop) {
                this.canAwaken = true;
                document.getElementById(this.isP1 ? 'p1-awaken-btn' : 'p2-awaken-btn').style.display = 'block';
                showSkillText('스탠드 파워 전개 가능!', '#facc15');
            }
        }

        if (this.charId === 'megumi' && this.health <= 30 && this.health > 0 && !this.megumiAwakened) {
            this.megumiAwakened = true;
            this.skills[0] = { name: '옥견 혼', key: this.skills[0].key, type: 'p', cd: 120, dmg: 20, speed: 12, w: 70, h: 60, c: '#111', count: 1 };
            this.skills[1] = { name: '오로치', key: this.skills[1].key, type: 'a', cd: 180, dmg: 10, radius: 100, c: '#cbd5e1', eff: 'poison' };
            this.skills[2] = { name: '감마+', key: this.skills[2].key, type: 'm', cd: 150, dmg: 15, w: 250, c: '#4ade80' };
            this.skills[3] = { name: '범위 탈토', key: this.skills[3].key, type: 'p', cd: 300, dmg: 35, speed: 18, w: 130, h: 130, c: '#ffffff', count: 1, eff: 'shake' };
            showSkillText('식신 진화!', '#166534');
            buildSkillUI(this, this.isP1 ? 'p1-skills' : 'p2-skills');
        }

        // 류 패시브 (6번 기술은 유지되도록 처리)
        if (this.charId === 'ryu' && this.health <= 50 && this.health > 0 && !this.ryuAwakened) {
            this.ryuAwakened = true;
            this.skills[0] = { name: '헤비 펀치', key: this.skills[0].key, type: 'm', cd: 90, dmg: 18, w: 80, c: '#60a5fa', knockback: 15 };
            this.skills[1] = { name: '내려찍기', key: this.skills[1].key, type: 'm', cd: 120, dmg: 22, w: 90, c: '#3b82f6', eff: 'shake' };
            this.skills[2] = { name: '그라니테 러쉬', key: this.skills[2].key, type: 'd', cd: 150, dmg: 25, speed: 20, c: '#2563eb' };
            this.skills[3] = { name: '초근접 블라스트', key: this.skills[3].key, type: 'm', cd: 200, dmg: 35, w: 120, c: '#1d4ed8', eff: 'shake' };
            this.skills[4] = { name: '최대출력 그라니테 블라스트', key: this.skills[4].key, type: 'laser', cd: 800, dmg: 55, w: 150, c: '#1d4ed8' };
            showSkillText('열기가 달아오른다!', '#3b82f6');
            buildSkillUI(this, this.isP1 ? 'p1-skills' : 'p2-skills');
        }

        if (this.charId === 'yuji' && this.health <= 50 && this.health > 0 && !this.yujiAwakened) {
            this.yujiAwakened = true;
            this.takeDamage(-10);
            this.damageMultiplier = 1.1; 
            showSkillText('각성 (공격력 증가)', '#ef4444');
        }

        if (this.charId === 'hakari' && this.health <= 0 && this.hakariRevive) {
            this.hakariRevive = false; 
            if (Math.random() < 0.25) {
                this.health = 50; 
                this.jackpotTimer = 1200;
                showSkillText('기사회생! (대박)', '#fcd34d');
                activateDomain(this, this.data.skills[4]);
                return; 
            }
        }

        if(knockback) this.v.x = knockback * (this.facing === 1 ? -1 : 1);
        
        if(eff === 'shake') {
            canvas.style.transform = `translate(${Math.random()*25-12}px, ${Math.random()*25-12}px)`;
            setTimeout(() => canvas.style.transform = 'none', 150);
        }
        if(eff === 'stun') this.stunned = 30; 
        if(eff === 'frame_1') { this.stunned = 60; this.frameStun = 60; } 
        if(eff === 'frame_3') { this.stunned = 180; this.frameStun = 180; } 
        if(eff === 'poison') this.poisonTimer = 300; 
        
        if(dmg > 0) spawnParticles(this.pos.x+25, this.pos.y+75, dmg > 15 ? 'white' : 'red', dmg > 15 ? 30 : 15);
    }

    basicAttack() {
        if(this.stunned > 0 || this.attackBox.active) return;
        
        const now = performance.now();
        if(now - this.lastBasicAttack < 200) return; // 0.2초(200ms) 쿨타임 제한
        this.lastBasicAttack = now;

        this.activateHitbox(60, 5, '#fff', 100, 5, 'basic');
        AudioSys.playMelee(this.charId);

        if (this.charId === 'rentaro') {
            const gfNames = ['하카리', '카라네', '시즈카', '나노', '쿠스리', '하하리'];
            this.rentaroVisualName = gfNames[Math.floor(Math.random()*gfNames.length)];
            this.rentaroVisualTimer = 15;
        }
    }

    useSkill(idx) {
        if(this.stunned > 0 || this.skillCds[idx] > 0 || this.globalSkillCooldown > 0) return;
        const skill = this.skills[idx];
        
        let cdToApply = skill.cd;
        if(this.charId === 'megumi') cdToApply = Math.floor(cdToApply * 0.85);
        if (isTrainingMode && this.isP1) cdToApply = 30; // 훈련모드: 쿨타임 0.5초(30프레임)
        
        this.skillCds[idx] = cdToApply;
        this.globalSkillCooldown = 30; // 스킬 사용 후 0.5초 동안 다른 스킬 사용 불가
        
        showSkillText(skill.name, skill.c);
        AudioSys.playSkill(this.charId);

        // 렌타로 스킬 사용 시 무조건 지정된 여친 등장
        if (this.charId === 'rentaro') {
            this.rentaroVisualName = skill.gf || '여친';
            this.rentaroVisualTimer = 45; // 0.75초 동안 화면에 표시
        }

        if (skill.type === 'x' && skill.name === '자폐원돈과') {
            this.mahitoDomainUsed = true;
        }
        
        if (this.charId === 'geto' && skill.name === '소용돌이') {
            this.getoUltUsed = true;
            if (this.getoOrbs >= 6) {
                showSkillText('각성 조건 만족!', '#8b5cf6');
                if (this.health <= 20 && !this.canAwaken) {
                    this.canAwaken = true;
                    document.getElementById(this.isP1 ? 'p1-awaken-btn' : 'p2-awaken-btn').style.display = 'block';
                }
            }
        }

        if (this.charId === 'dio') {
            this.standTimer = 60; // 스킬 사용 시 1초간 스탠드 현현
            if (skill.name === '로드롤러다!!') this.dioRoadRoller = true;
            if (skill.name === '시간이여 멈춰라!') this.dioTimeStop = true;
        }

        if (this.charId === 'yuta' && idx === 0 && skill.name.startsWith('(복사)')) {
            setTimeout(() => {
                this.skills[0] = {...this.data.skills[0]};
                buildSkillUI(this, this.isP1 ? 'p1-skills' : 'p2-skills');
            }, 100);
        }

        if(skill.type === 'm') {
            const count = skill.count || 1;
            const delay = skill.delay || 0;
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    this.activateHitbox(skill.w, skill.dmg, skill.c, 150, skill.knockback, skill.eff, skill.name);
                }, i * delay);
            }
        } else if(skill.type === 'p') {
            const count = skill.count || 1;
            const delay = skill.delay || 0;
            const spreadY = skill.spreadY || 0;
            const finalDmg = Math.floor(skill.dmg * this.damageMultiplier);

            for(let i=0; i<count; i++) {
                setTimeout(() => {
                    let yOffset = 0;
                    if(spreadY > 0 && delay === 0) yOffset = (i - (count-1)/2) * (spreadY / count);
                    else if (spreadY > 0) yOffset = (Math.random() - 0.5) * spreadY;

                    AudioSys.playRanged(this.charId);
                    projectiles.push(new Projectile({
                        x: this.facing === 1 ? this.pos.x + this.w : this.pos.x - skill.w,
                        y: this.pos.y + 40 + yOffset,
                        v: { x: this.facing === 1 ? skill.speed : -skill.speed, y: (Math.random()-0.5)*2 }, 
                        color: skill.c, owner: this, w: skill.w, h: skill.h, dmg: finalDmg, eff: skill.eff, name: skill.name
                    }));
                }, i * delay);
            }
        } else if(skill.type === 'd') {
            this.v.x = this.facing === 1 ? skill.speed : -skill.speed;
            this.activateHitbox(this.w + 20, skill.dmg, skill.c, 300, skill.knockback || 5, skill.eff, skill.name);
        } else if(skill.type === 'a') {
            const finalDmg = skill.dmg > 0 ? Math.floor(skill.dmg * this.damageMultiplier) : skill.dmg;
            effects.push({ type: 'a', x: this.pos.x+this.w/2, y: this.pos.y+this.h/2, r: skill.radius, color: skill.c, life: 30, owner: this, dmg: finalDmg, eff: skill.eff, name: skill.name });
        } else if (skill.type === 'laser') {
            // 레이저 기술 처리
            activeLasers.push({
                owner: this,
                name: skill.name,
                color: skill.c,
                dmg: Math.floor(skill.dmg * this.damageMultiplier),
                w: skill.w || 60,
                life: skill.name === '블라스트 3연사' ? 90 : 60,
                maxLife: skill.name === '블라스트 3연사' ? 90 : 60
            });
            checkBeamClash(); // 발사 즉시 빔 격돌 여부 확인
        } else if(skill.type === 'x') {
            if(currentDomain && currentDomain.life > 0 && currentDomain.owner !== this) {
                startDomainClash(this, skill);
            } else {
                activateDomain(this, skill);
            }
        } else if(skill.type === 'buff') {
            if(skill.name === '계활') {
                this.sukunaAITimer = 1200; 
                spawnParticles(this.pos.x+25, this.pos.y+75, '#991b1b', 50);
            } else if (skill.name === '적응 완료') {
                this.invincibleTimer = 360; 
                spawnParticles(this.pos.x+25, this.pos.y+75, '#facc15', 30);
            } else if (skill.name === '반전술식') {
                this.health = Math.min(100, this.health + 30);
                spawnParticles(this.pos.x+25, this.pos.y+75, '#22c55e', 40);
                showSkillText('반전술식 (회복)', '#22c55e');
            } else if (skill.name === '초월적 신체') { // 스쿠나 각성 버프
                this.health = Math.min(100, this.health + 40);
                this.invincibleTimer = 180; // 3초 무적
                spawnParticles(this.pos.x+this.w/2, this.pos.y+this.h/2, '#ef4444', 50);
                showSkillText('초월적 신체 (회복+무적)', '#ef4444');
            } else if (skill.name === '승부는 지금부터다') {
                this.tojiSpinTimer = 180; 
                showSkillText('승부는 지금부터다!', '#1f2937');
            } else if (skill.name === '이리와 리카') {
                this.rikaActive = true;
                this.skills[0] = { name: '리카, 떨어트려', key: this.skills[0].key, type: 'm', cd: 100, dmg: 20, w: 100, c: '#ef4444', eff: 'shake' };
                this.skills[1] = { name: '우수나탄', key: this.skills[1].key, type: 'a', cd: 150, dmg: 25, radius: 120, c: '#60a5fa', eff: 'stun' };
                this.skills[2] = { name: '복사: 야곱의 사다리', key: this.skills[2].key, type: 'laser', cd: 300, dmg: 35, w: 80, c: '#fef08a' };
                this.skills[3] = { name: '합동공격', key: this.skills[3].key, type: 'd', cd: 200, dmg: 30, speed: 25, c: '#cbd5e1' };
                this.skills[4] = { name: '순애포', key: this.skills[4].key, type: 'laser', cd: 400, dmg: 45, w: 150, c: '#fbcfe8' };
                spawnParticles(this.pos.x+25, this.pos.y+75, '#ef4444', 50);
                showSkillText('이리와, 리카!', '#ef4444');
                buildSkillUI(this, this.isP1 ? 'p1-skills' : 'p2-skills');
            } else if (skill.name === '술식 복사') {
                const target = players[this.isP1 ? 1 : 0];
                let randomSkill = target.data.skills[Math.floor(Math.random() * 4)];
                this.skills[0] = {...randomSkill, name: '(복사) ' + randomSkill.name, key: this.skills[0].key};
                showSkillText('술식 복사 완료!', '#e2e8f0');
                buildSkillUI(this, this.isP1 ? 'p1-skills' : 'p2-skills');
            } else if (skill.name === '시간이여 멈춰라!') {
                const target = players[this.isP1 ? 1 : 0];
                target.frameStun = 180; // 3초 정지
                target.stunned = 180;
                globalTimeStop = { active: true, timer: 180, owner: this }; // 투사체 정지 시스템 활성화
                AudioSys.playTimeStop();
                showSkillText('THE WORLD! 시간이여 멈춰라!', '#facc15');
                canvas.style.filter = 'grayscale(1) invert(0.8)';
                setTimeout(() => canvas.style.filter = 'none', 3000);
            } else if (skill.name === '9초의 시간정지') {
                const target = players[this.isP1 ? 1 : 0];
                target.frameStun = 540; // 9초 정지
                target.stunned = 540;
                globalTimeStop = { active: true, timer: 540, owner: this }; // 투사체 정지 시스템 활성화
                AudioSys.playTimeStop();
                showSkillText('9초 경과!! WRYYYYY!!', '#facc15');
                canvas.style.filter = 'grayscale(1) invert(1)';
                setTimeout(() => canvas.style.filter = 'none', 9000);
            } else if (skill.name === '라파엘 (회복/무적)') {
                this.health = Math.min(100, this.health + 30);
                this.invincibleTimer = 180; // 3초 무적
                spawnParticles(this.pos.x+this.w/2, this.pos.y+this.h/2, '#38bdf8', 50);
                showSkillText('라파엘: 최적의 행동을 실행합니다', '#38bdf8');
            } else if (skill.name === '라파엘 씨!') {
                this.rimuruAITimer = 900; // 15초 자동 조종
                spawnParticles(this.pos.x+this.w/2, this.pos.y+this.h/2, '#38bdf8', 50);
                showSkillText('라파엘: 전투를 대행합니다.', '#38bdf8');
            } else if (skill.name === '오만함 (슈퍼아머)' || skill.name === '천상천하 유아독존') {
                this.invincibleTimer = skill.name === '천상천하 유아독존' ? 300 : 180;
                spawnParticles(this.pos.x+this.w/2, this.pos.y+this.h/2, skill.c, 30);
                showSkillText(skill.name, skill.c);
            } else if (skill.name === '오만함 (반사)') {
                this.escanorReflectTimer = 360; // 6초간 방어 및 투사체/레이저 반사
                spawnParticles(this.pos.x+this.w/2, this.pos.y+this.h/2, skill.c, 30);
                showSkillText('태양의 방패! (반사)', skill.c);
            } else if (skill.name === '더 원 (준비)') {
                this.escanorCharging = true;
                this.escanorTheOneGauge = 0;
                showSkillText('정오가 다가온다...', '#ffffff');
            } else if (skill.name === '하카리&카라네의 태클') {
                this.rentaroVisualName = '하카리&카라네';
                this.rentaroVisualTimer = 30;
                this.v.x = this.facing === 1 ? 30 : -30;
                this.activateHitbox(this.w + 60, skill.dmg, '#fbcfe8', 300, 30, 'shake', skill.name);
                this.rentaroSkillsUsed.s1 = true;
            } else if (skill.name === '나노의 정밀 레이저') {
                this.rentaroVisualName = '나노';
                this.rentaroVisualTimer = 30;
                activeLasers.push({ owner: this, name: skill.name, color: skill.c, dmg: Math.floor(skill.dmg * this.damageMultiplier), w: 50, life: 40, maxLife: 40 });
                this.rentaroSkillsUsed.s2 = true;
            } else if (skill.name === '쿠스리의 영약 (아기 돌진)') {
                this.rentaroVisualName = '아기 여친들';
                this.rentaroVisualTimer = 30;
                this.health = Math.min(100, this.health + 20); // 회복
                effects.push({ type: 'a', x: this.pos.x+this.w/2, y: this.pos.y+this.h/2, r: 150, color: '#86efac', life: 40, owner: this, dmg: Math.floor(skill.dmg * this.damageMultiplier), eff: 'shake', name: skill.name });
                this.rentaroSkillsUsed.s3 = true;
                showSkillText('회복 & 아기 돌진!', '#86efac');
            } else if (skill.name === '시즈카의 노래 (밀치기)') {
                this.rentaroVisualName = '시즈카';
                this.rentaroVisualTimer = 60;
                this.damageMultiplier += 0.2; // 공격력 버프 추가
                
                const target = players[this.isP1 ? 1 : 0];
                let pushDir = target.pos.x > this.pos.x ? 50 : -50;
                target.v.x = pushDir;
                this.v.x = -pushDir;
                target.takeDamage(Math.floor(skill.dmg * this.damageMultiplier), 0, 'stun');
                
                showSkillText('공격력 버프 & 밀치기!', '#93c5fd');
                this.rentaroSkillsUsed.s4 = true;
            } else if (skill.name === '그 긴거') {
                if (!this.rentaroSkillsUsed.s1 || !this.rentaroSkillsUsed.s2 || !this.rentaroSkillsUsed.s3 || !this.rentaroSkillsUsed.s4) {
                    showSkillText('여친들(2~5번)이 모두 활약해야 합니다!', '#db2777');
                    this.skillCds[4] = 0; // 쿨타임 반환
                    return;
                }
                if (this.rentaroComboTimer < 600) {
                    showSkillText(`아직 준비가 안됐습니다! (${10 - Math.floor(this.rentaroComboTimer/60)}초 남음)`, '#db2777');
                    this.skillCds[4] = 0; // 쿨타임 반환
                    return;
                }
                showSkillText('그 긴거...!! (능력치 100% 증가)', '#db2777');
                this.damageMultiplier *= 2; 
                this.baseSpeed *= 1.5;
                this.health = Math.min(100, this.health + 50); // 체력 대폭 회복
                this.rentaroCharging = true;
                this.rentaroAwakenGauge = 0;
            } else if (skill.name === '더 원 (정오)') {
                if (!this.awakened && !this.canAwaken) {
                    this.canAwaken = true;
                    document.getElementById(this.isP1 ? 'p1-awaken-btn' : 'p2-awaken-btn').style.display = 'block';
                    showSkillText('정오가 되었다!', '#ffffff');
                }
            } else if (skill.name === '쿠스리의 영약 (회복)') {
                this.health = Math.min(100, this.health + 40);
                spawnParticles(this.pos.x+this.w/2, this.pos.y+this.h/2, '#86efac', 40);
                showSkillText('회복!', '#86efac');
            } else if (skill.name === '시즈카의 응원 (버프)') {
                this.damageMultiplier += 0.2;
                spawnParticles(this.pos.x+this.w/2, this.pos.y+this.h/2, '#93c5fd', 40);
                showSkillText('공격력 상승!', '#93c5fd');
            } else if (skill.name === '경화수월') {
                const target = players[this.isP1 ? 1 : 0];
                target.stunned = 120; // 2초 기절 (오감 지배)
                target.v.x = (Math.random()-0.5)*20; // 혼란 넉백
                showSkillText('깨져라, 경화수월', '#bae6fd');
                canvas.style.filter = 'invert(1)';
                setTimeout(() => canvas.style.filter = 'none', 500);
            } else if (skill.name === '붕옥의 의지') {
                this.health = Math.min(100, this.health + 50);
                this.damageMultiplier += 0.5;
                showSkillText('내가 바로 하늘에 서겠다', '#f1f5f9');
            } else if (skill.name === '강철의 육체' || skill.name === '유혹자') {
                this.health = Math.min(100, this.health + 20);
                this.invincibleTimer = 120;
                spawnParticles(this.pos.x+this.w/2, this.pos.y+this.h/2, skill.c, 30);
                showSkillText(`${skill.name} (회복+무적)`, skill.c);
            } else if (skill.name === '박수 치기') {
                // 토도 아오이 위치교환 스킬
                let target = players[this.isP1 ? 1 : 0];
                let tempX = this.pos.x;
                this.pos.x = target.pos.x;
                target.pos.x = tempX;
                AudioSys.playClap();
                spawnParticles(this.pos.x + this.w/2, this.pos.y + this.h/2, '#2dd4bf', 30);
                spawnParticles(target.pos.x + target.w/2, target.pos.y + target.h/2, '#2dd4bf', 30);
            } else if (skill.name === '수하 소환 (교체)') {
                showSwapUI(this);
            } else if (skill.name === '부기우기 수플렉스') {
                const target = players[this.isP1 ? 1 : 0];
                this.pos.x = target.facing === 1 ? target.pos.x - this.w : target.pos.x + target.w;
                this.pos.y = target.pos.y;
                AudioSys.playClap();
                spawnParticles(this.pos.x + this.w/2, this.pos.y + this.h/2, '#2dd4bf', 30);
                setTimeout(() => {
                    this.activateHitbox(80, 25, '#0f766e', 200, 20, 'shake');
                    showSkillText('수플렉스!!', '#0f766e');
                }, 200);
            } else if (skill.name === '브라더!! (유지 소환)') {
                this.yujiSummonTimer = 240; // 4초 소환
                showSkillText('브라더!!!', '#0ea5e9');
                spawnParticles(this.pos.x + this.w/2, this.pos.y + this.h/2, '#ef4444', 50);
            } else if (skill.name === '주복사사 (재판)') {
                startTrialMiniGame(this);
            } else if (skill.name === '하하리의 헬기 지원') {
                projectiles.push(new Projectile({x: this.pos.x, y: this.pos.y - 40, v: {x: this.facing === 1 ? 12 : -12, y: 5}, color: skill.c, owner: this, w: 50, h: 40, dmg: Math.floor(skill.dmg * this.damageMultiplier), name: '미사일'}));
                showSkillText('돈의 힘이다앗!', skill.c);
            } else if (skill.name === '쿠루미의 굶주림') {
                this.activateHitbox(120, skill.dmg, skill.c, 300, 15, 'vampire', skill.name);
                showSkillText('배고파아아!!', skill.c);
            } else if (skill.name === '메이의 철통 호위') {
                this.invincibleTimer = 180;
                spawnParticles(this.pos.x+this.w/2, this.pos.y+this.h/2, skill.c, 30);
                showSkillText('메이: 보호합니다!', skill.c);
            } else if (skill.name === '이쿠의 특훈 (반사)') {
                this.escanorReflectTimer = 240; // 반사 버프 4초
                spawnParticles(this.pos.x+this.w/2, this.pos.y+this.h/2, skill.c, 30);
                showSkillText('이쿠: 더 때려주세요!', skill.c);
            } else if (skill.name === '미미미의 눈부심') {
                effects.push({ type: 'a', x: this.pos.x+this.w/2, y: this.pos.y+this.h/2, r: 150, color: skill.c, life: 40, owner: this, dmg: Math.floor(skill.dmg * this.damageMultiplier), eff: 'stun', name: skill.name });
                showSkillText('아름다움은 죄!', skill.c);
            }
        }
    }

    activateHitbox(w, dmg, color, duration, kb=5, eff=null, skillName=null) {
        this.attackBox.w = w; this.attackBox.color = color;
        this.attackBox.active = true;
        this.currentDmg = Math.floor(dmg * this.damageMultiplier); this.currentKb = kb; this.currentEff = eff;
        this.currentSkillName = skillName;
        spawnParticles(this.facing === 1 ? this.pos.x + this.w + w/2 : this.pos.x - w/2, this.pos.y + 40, color, 15);
        setTimeout(() => this.attackBox.active = false, duration);
    }
}
