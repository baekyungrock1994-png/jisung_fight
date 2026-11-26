// 메인 게임 루프

// Main Loop
function animate() {
    if(!gameActive) return;
    requestAnimationFrame(animate);
    
    globalFrame++;

    // 에스카노르 패시브: 20초(1200프레임) 마다 공/방 증가
    if (globalFrame % 1200 === 0) {
        players.forEach(p => {
            if (p.charId === 'escanor') {
                p.escanorSunStacks++;
                p.damageMultiplier += 0.05; // 공격력 5% 상승
                showSkillText('태양이 솟아오른다... (공/방 증가)', '#fbbf24');
                spawnParticles(p.pos.x + p.w/2, p.pos.y + p.h/2, '#f59e0b', 40);
            }
        });
    }

    // 글로벌 시간정지 시스템 업데이트
    if (globalTimeStop.active) {
        globalTimeStop.timer--;
        if (globalTimeStop.timer <= 0) {
            globalTimeStop.active = false;
        }
    }

    // 전체 지속 체력 회복 (1초 = 60프레임 마다 1씩 회복)
    if (globalFrame % 60 === 0) {
        players.forEach(p => {
            // 렌타로 "그 긴거" 사용 시 체력 회복 속도 100% 증가 (초당 2씩)
            let regenAmount = (p.charId === 'rentaro' && p.rentaroCharging) ? 2 : 1;
            
            if (p.charId === 'aizen') {
                if (p.aizenStage === 1) regenAmount = 3;
                else if (p.aizenStage === 2) regenAmount = 2;
                else if (p.aizenStage === 3 || p.aizenStage === 4) regenAmount = 0; // 재생 정지
                else if (p.aizenStage === 5) regenAmount = 15; // 무간 폼 초고속 재생
            }

            if (p.health > 0 && p.health < 100 && regenAmount > 0) {
                p.health = Math.min(100, p.health + regenAmount);
                spawnParticles(p.pos.x + p.w/2, p.pos.y - 10, '#4ade80', 1);
            }
        });
    }

    // 아이젠 붕옥 진화 체크
    players.forEach(p => {
        if (p.charId === 'aizen' && p.aizenStage < 3) {
            p.hogyokuGauge += 1;
            if (p.aizenStage === 0 && p.hogyokuGauge > 1000) {
                p.aizenStage = 1; p.damageMultiplier = 1.2;
                showSkillText('붕옥 융합 1단계 (갑옷)', '#e2e8f0');
                p.skills[0].dmg = 18; p.skills[1].dmg = 35; // 스킬 강화
            } else if (p.aizenStage === 1 && p.hogyokuGauge > 2500) {
                p.aizenStage = 2; p.damageMultiplier = 1.4;
                showSkillText('붕옥 융합 2단계', '#94a3b8');
            } else if (p.aizenStage === 2 && p.hogyokuGauge > 4500) {
                p.aizenStage = 3; p.damageMultiplier = 1.6;
                showSkillText('붕옥 융합 3단계 (나방)', '#d8b4fe');
                p.skills = [
                    { name: '프라골라', key: p.skills[0].key, type: 'p', cd: 60, dmg: 18, speed: 20, w: 50, h: 50, c: '#c084fc', count: 1 },
                    { name: '울트라 프라골라', key: p.skills[1].key, type: 'a', cd: 150, dmg: 35, radius: 150, c: '#a855f7', eff: 'shake' },
                    { name: '순간이동', key: p.skills[2].key, type: 'd', cd: 120, dmg: 0, speed: 40, c: 'transparent' },
                    { name: '날개 베기', key: p.skills[3].key, type: 'm', cd: 90, dmg: 25, w: 120, c: '#e9d5ff', knockback: 20 },
                    { name: '완전영창 흑관', key: p.skills[4].key, type: 'a', cd: 400, dmg: 50, radius: 200, c: '#000000', eff: 'stun' }
                ];
                buildSkillUI(p, p.isP1 ? 'p1-skills' : 'p2-skills');
            }
        }
    });

    if (isCutscene) {
        drawMap(c);
        players.forEach(p => p.draw());
        return; 
    }

    if (clashActive || swapUIActive || trialUIActive) {
        c.fillStyle = 'rgba(0,0,0,0.5)';
        c.fillRect(0,0,canvas.width, canvas.height);
        
        if (clashActive) {
            document.getElementById('clash-bar-fill').style.width = (100 - clashValue) + '%';
            
            // 빔 격돌 전용 렌더링
            if (beamClashActive) {
                let clashX = canvas.width * (clashValue / 100);
                let p1 = players[0], p2 = players[1];
                
                c.fillStyle = p1.charId === 'yuta' ? '#fbcfe8' : '#2563eb';
                c.fillRect(p1.pos.x + p1.w, p1.pos.y - 10, clashX - (p1.pos.x + p1.w), 80);
                
                c.fillStyle = p2.charId === 'yuta' ? '#fbcfe8' : '#2563eb';
                c.fillRect(clashX, p2.pos.y - 10, p2.pos.x - clashX, 80);
                
                spawnParticles(clashX, canvas.height/2, 'white', 5);
                c.beginPath(); c.arc(clashX, canvas.height/2, Math.random()*50 + 30, 0, Math.PI*2);
                c.fillStyle = 'white'; c.fill();
            }
            
            clashTimer--;
            if(clashTimer <= 0) {
                if (beamClashActive) resolveBeamClash();
                else resolveDomainClash();
            }
        }
        return; 
    }

    if (currentDomain && currentDomain.life > 0) {
        drawDomain(c, currentDomain);
        
        const target = currentDomain.owner === players[0] ? players[1] : players[0];
        let isImmune = (target.charId === 'toji' || target.charId === 'todo'); // 토우지 및 토도 간이 영역 면역
        
        if (currentDomain.charId === 'megumi') {
            if (!isImmune) target.slowedByDomain = true;
            for(let i=0; i<4; i++) { 
                if(currentDomain.owner.skillCds[i] > 0) currentDomain.owner.skillCds[i] -= 0.5;
            }
        } else if (currentDomain.charId === 'geto') {
            if(currentDomain.life % 10 === 0) {
                let owner = currentDomain.owner;
                projectiles.push(new Projectile({
                    x: owner.pos.x + owner.w/2, 
                    y: owner.pos.y + 40 + (Math.random()*60-30), 
                    v: { x: (owner.facing === 1 ? 1 : -1) * (Math.random()*5 + 10), y: (Math.random()-0.5)*5 }, 
                    color: '#8b5cf6', owner: owner, w: 40, h: 40, dmg: 4, name: '다중혼'
                }));
            }
        } else if (currentDomain.charId === 'gojo') {
            if (!isImmune) {
                target.stunned = 10;
                target.v.x = 0;
                target.v.y = 0;
            }
        } else if (currentDomain.charId === 'naoya') {
            if (!isImmune && (Math.abs(target.pos.x - target.prevPos.x) > 0.5 || Math.abs(target.pos.y - target.prevPos.y) > 0.5)) {
                target.takeDamage(1, 0, null, false);
                spawnParticles(target.pos.x + target.w/2, target.pos.y + target.h/2, '#ef4444', 2);
            }
        } else {
            if (!isImmune) target.slowedByDomain = false;
            if(!isImmune && currentDomain.life % 30 === 0 && currentDomain.dmg > 0) {
                target.takeDamage(Math.floor(currentDomain.dmg/5));
            }
        }
        
        if (isImmune) target.slowedByDomain = false; 
        
        currentDomain.life--;
        if (currentDomain.life <= 0) {
            currentDomain = null;
            players[0].slowedByDomain = false;
            players[1].slowedByDomain = false;
        }
    } else {
        drawMap(c);
        players[0].slowedByDomain = false;
        players[1].slowedByDomain = false;
    }

    // 에스카노르 더 원 게이지 및 지속 효과
    let escanor = players.find(p => p.charId === 'escanor');
    if (escanor) {
        if (escanor.escanorCharging) {
            escanor.escanorTheOneGauge++;
            if (escanor.escanorTheOneGauge >= 900 && !escanor.canAwaken && !escanor.awakened) {
                escanor.canAwaken = true;
                escanor.escanorCharging = false;
                document.getElementById(escanor.isP1 ? 'p1-awaken-btn' : 'p2-awaken-btn').style.display = 'block';
                showSkillText('더 원 개방 가능!', '#ffffff');
            }
        }
        if (escanor.escanorReflectTimer > 0) escanor.escanorReflectTimer--;
        
        if (escanor.awakened && globalFrame % 180 === 0) {
            escanor.damageMultiplier += 0.025; // 3초마다 공격력 2.5% 증가
        }
    }

    // 렌타로 콤보 및 각성 게이지
    let rentaro = players.find(p => p.charId === 'rentaro');
    if (rentaro) {
        if (rentaro.rentaroSkillsUsed.s1 && rentaro.rentaroSkillsUsed.s2 && rentaro.rentaroSkillsUsed.s3 && rentaro.rentaroSkillsUsed.s4) {
            rentaro.rentaroComboTimer++;
        }
        if (rentaro.rentaroCharging) {
            rentaro.rentaroAwakenGauge++;
            if (rentaro.rentaroAwakenGauge >= 600 && !rentaro.canAwaken && !rentaro.awakened) {
                rentaro.canAwaken = true;
                rentaro.rentaroCharging = false;
                document.getElementById(rentaro.isP1 ? 'p1-awaken-btn' : 'p2-awaken-btn').style.display = 'block';
                showSkillText('사랑 각성 가능!', '#db2777');
            }
        }
    }

    let getoPlayer = players.find(p => p.charId === 'geto');
    if (getoPlayer && globalFrame % 300 === 0) {
        getoOrbs.push({ x: 50 + Math.random() * (canvas.width - 100), y: canvas.height - 70, r: 15 });
    }

    for (let i = getoOrbs.length - 1; i >= 0; i--) {
        let orb = getoOrbs[i];
        c.beginPath(); c.arc(orb.x, orb.y, orb.r, 0, Math.PI*2);
        c.fillStyle = '#4c1d95'; c.fill();
        c.strokeStyle = '#a855f7'; c.lineWidth = 2; c.stroke();
        
        if (getoPlayer && rectIntersect({x: getoPlayer.pos.x, y: getoPlayer.pos.y, w: getoPlayer.w, h: getoPlayer.h}, {x: orb.x - orb.r, y: orb.y - orb.r, w: orb.r*2, h: orb.r*2})) {
            getoOrbs.splice(i, 1);
            getoPlayer.getoOrbs++;
            spawnParticles(getoPlayer.pos.x + getoPlayer.w/2, getoPlayer.pos.y + getoPlayer.h/2, '#4c1d95', 20);
            if (getoPlayer.getoOrbs % 3 === 0) {
                getoPlayer.damageMultiplier += 0.06; 
                showSkillText(`주령 흡수! (공격력 +${Math.round((getoPlayer.damageMultiplier-1)*100)}%)`, '#a855f7');
            }
        }
    }

    // 스쿠나 손가락 생성 및 흡수
    let sukunaPlayer = players.find(p => p.charId === 'sukuna');
    if (sukunaPlayer && globalFrame % 360 === 0 && !sukunaPlayer.awakened && !sukunaPlayer.canAwaken) {
        sukunaFingersList.push({ x: 50 + Math.random() * (canvas.width - 100), y: canvas.height - 70, w: 15, h: 30 });
    }

    for (let i = sukunaFingersList.length - 1; i >= 0; i--) {
        let f = sukunaFingersList[i];
        c.fillStyle = '#450a0a'; c.fillRect(f.x, f.y, f.w, f.h);
        c.fillStyle = '#fef08a'; c.fillRect(f.x, f.y, f.w, 8); 
        
        if (sukunaPlayer && rectIntersect({x: sukunaPlayer.pos.x, y: sukunaPlayer.pos.y, w: sukunaPlayer.w, h: sukunaPlayer.h}, {x: f.x, y: f.y, w: f.w, h: f.h})) {
            sukunaFingersList.splice(i, 1);
            sukunaPlayer.sukunaFingers++;
            showSkillText(`손가락 섭취 (${sukunaPlayer.sukunaFingers}/19)`, '#991b1b');
            if (sukunaPlayer.sukunaFingers >= 19 && !sukunaPlayer.canAwaken) {
                sukunaPlayer.canAwaken = true;
                document.getElementById(sukunaPlayer.isP1 ? 'p1-awaken-btn' : 'p2-awaken-btn').style.display = 'block';
            }
        }
    }

    // 리무루 패시브 진화 및 영혼 수집
    let rimuruPlayer = players.find(p => p.charId === 'rimuru');
    if (rimuruPlayer) {
        // 10초마다 자동 진화 (대현자/라파엘)
        if (globalFrame % 600 === 0) {
            rimuruPlayer.damageMultiplier += 0.05;
            rimuruPlayer.evolutionStage++;
            rimuruPlayer.health = Math.min(100, rimuruPlayer.health + 5);
            let stageMsg = rimuruPlayer.evolutionStage >= 3 ? ' (피해 90% 감소!)' : '';
            showSkillText(rimuruPlayer.awakened ? '라파엘: 능력치 상승' + stageMsg : '대현자: 능력치 진화' + stageMsg, '#60a5fa');
            spawnParticles(rimuruPlayer.pos.x + rimuruPlayer.w/2, rimuruPlayer.pos.y + rimuruPlayer.h/2, '#93c5fd', 20);
        }
        // 8초(480프레임)마다 영혼 생성
        if (globalFrame % 480 === 0 && !rimuruPlayer.awakened && !rimuruPlayer.canAwaken) {
            rimuruSoulsList.push({ x: 50 + Math.random() * (canvas.width - 100), y: canvas.height - 70, r: 12 });
        }
    }

    // 리무루 영혼 렌더링 및 획득 판정 (누락되었던 부분 추가)
    for (let i = rimuruSoulsList.length - 1; i >= 0; i--) {
        let soul = rimuruSoulsList[i];
        
        // 영혼 그리기 (푸른 빛나는 구슬 형태)
        c.beginPath(); c.arc(soul.x, soul.y, soul.r, 0, Math.PI*2);
        c.fillStyle = '#60a5fa'; c.fill();
        c.strokeStyle = '#bae6fd'; c.lineWidth = 2; c.stroke();
        
        // 획득(충돌) 처리
        if (rimuruPlayer && rectIntersect({x: rimuruPlayer.pos.x, y: rimuruPlayer.pos.y, w: rimuruPlayer.w, h: rimuruPlayer.h}, {x: soul.x - soul.r, y: soul.y - soul.r, w: soul.r*2, h: soul.r*2})) {
            rimuruSoulsList.splice(i, 1); // 영혼 제거
            rimuruPlayer.rimuruSouls++;
            
            showSkillText(`영혼 흡수! (${rimuruPlayer.rimuruSouls}/3)`, '#60a5fa');
            spawnParticles(rimuruPlayer.pos.x + rimuruPlayer.w/2, rimuruPlayer.pos.y + rimuruPlayer.h/2, '#93c5fd', 30);
            
            // 영혼 3개 획득 시 각성 가능 처리
            if (rimuruPlayer.rimuruSouls >= 3 && !rimuruPlayer.canAwaken && !rimuruPlayer.awakened) {
                rimuruPlayer.canAwaken = true;
                document.getElementById(rimuruPlayer.isP1 ? 'p1-awaken-btn' : 'p2-awaken-btn').style.display = 'block';
                showSkillText('마왕 각성 조건 달성!', '#60a5fa');
            }
        }
    }

    players.forEach(p => {
        if (p.swapTimer > 0) {
            p.swapTimer--;
            if (p.swapTimer <= 0) {
                // 교체 타이머 종료 후 리무루 복귀
                p.data.name = p.originalName;
                p.color = p.originalColor;
                p.skills = p.originalSkills.map(s => ({...s}));
                document.getElementById(p.isP1 ? 'p1-name' : 'p2-name').innerHTML = `${p.data.name} <span class="text-xs text-gray-300 ml-2">[${p.data.passive}]</span>`;
                buildSkillUI(p, p.isP1 ? 'p1-skills' : 'p2-skills');
                spawnParticles(p.pos.x + p.w/2, p.pos.y + p.h/2, p.color, 50);
                showSkillText('리무루 복귀!', p.color);
            }
        }
    });

    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => p.update());
    
    players.forEach(p => p.draw());

    // 데미지 텍스트(카운터) 애니메이션 렌더링
    c.textAlign = 'center';
    c.font = '900 28px "Black Han Sans", sans-serif';
    for (let i = damageTexts.length - 1; i >= 0; i--) {
        let dt = damageTexts[i];
        c.globalAlpha = Math.max(0, dt.life / 40);
        
        // 텍스트 테두리(그림자) 효과
        c.lineWidth = 4;
        c.strokeStyle = 'black';
        c.strokeText(dt.text, dt.x, dt.y);
        
        // 실제 텍스트 채우기
        c.fillStyle = dt.color;
        c.fillText(dt.text, dt.x, dt.y);
        
        dt.y -= 1.5; // 위로 떠오르는 효과
        dt.life--;
        if (dt.life <= 0) damageTexts.splice(i, 1);
    }
    c.globalAlpha = 1;

    // 레이저 빔 렌더링 및 타격 처리
    for(let i = activeLasers.length - 1; i >= 0; i--) {
        let l = activeLasers[i];
        
        c.save();
        let startX = l.owner.facing === 1 ? l.owner.pos.x + l.owner.w : l.owner.pos.x;
        let endX = l.owner.facing === 1 ? canvas.width : 0;
        
        let isActiveFrame = true;
        if (l.name === '블라스트 3연사') isActiveFrame = Math.floor(l.life / 10) % 2 === 0; // 깜빡임 효과
        
        if (isActiveFrame) {
            c.globalAlpha = l.life / l.maxLife;
            c.fillStyle = l.color;
            c.shadowBlur = 10; c.shadowColor = l.color;
            
            let bW = l.w;
            let yOffset = l.owner.pos.y + 40 - bW/2;
            
            c.fillRect(l.owner.facing === 1 ? startX : 0, yOffset, Math.abs(endX - startX), bW);
            
            c.fillStyle = 'white';
            c.fillRect(l.owner.facing === 1 ? startX : 0, yOffset + bW/3, Math.abs(endX - startX), bW/3);
            
            const target = l.owner === players[0] ? players[1] : players[0];
            if (l.life % 10 === 0) {
                let hitY = (target.pos.y + target.h > yOffset) && (target.pos.y < yOffset + bW);
                let hitX = l.owner.facing === 1 ? (target.pos.x > startX) : (target.pos.x + target.w < startX);
                
                // 에스카노르 레이저 반사
                if (target.charId === 'escanor' && target.escanorReflectTimer > 0 && hitX && hitY) {
                    l.owner.takeDamage(Math.floor(l.dmg / (l.maxLife/10)), 0, 'shake');
                    showSkillText('레이저 반사!', '#f59e0b');
                    spawnParticles(target.pos.x + target.w/2, target.pos.y + target.h/2, '#f59e0b', 10);
                } else if (hitX && hitY) {
                    if (target.charId === 'higuruma') window.applyGuiltyStack(l.owner);
                    target.takeDamage(Math.floor(l.dmg / (l.maxLife/10)), 0, 'shake');
                }
            }
        }
        c.restore();

        l.life--;
        if (l.life <= 0) activeLasers.splice(i, 1);
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.update();
        const target = p.owner === players[0] ? players[1] : players[0];
        
        // 에스카노르 투사체 반사 (오만함 반사 버프)
        if (p.active && target.charId === 'escanor' && target.escanorReflectTimer > 0) {
            if (rectIntersect({x:p.pos.x, y:p.pos.y, w:p.w, h:p.h}, {x:target.pos.x, y:target.pos.y, w:target.w, h:target.h})) {
                p.v.x = -p.v.x;
                p.owner = target;
                p.color = '#f59e0b';
                showSkillText('태양의 반사!', '#f59e0b');
                spawnParticles(p.pos.x, p.pos.y, '#f59e0b', 10);
                continue;
            }
        }

        // DIO 투사체 반사 (스탠드 효과)
        if (p.active && target.charId === 'dio' && target.health > 0) {
            if (rectIntersect({x:p.pos.x, y:p.pos.y, w:p.w, h:p.h}, {x:target.pos.x, y:target.pos.y, w:target.w, h:target.h})) {
                p.v.x = -p.v.x; // 방향 튕겨내기
                p.owner = target; // 주인을 DIO로 변경
                p.color = '#facc15'; // 스탠드 황금빛 색상으로 변경
                target.standTimer = 30; // 튕겨낼 때 스탠드 현현
                showSkillText('무다무다! (반사)', '#eab308');
                spawnParticles(p.pos.x, p.pos.y, '#facc15', 10);
                continue; // 아래 피격 처리를 무시하고 다음 루프로 이동
            }
        }

        if (p.active && rectIntersect({x:p.pos.x, y:p.pos.y, w:p.w, h:p.h}, {x:target.pos.x, y:target.pos.y, w:target.w, h:target.h})) {
            target.takeDamage(p.dmg, 5, p.eff, true); 
            p.active = false;
            
            if (p.name === '리카 공격' && p.owner.charId === 'yuta') {
                let randomSkill = target.data.skills[Math.floor(Math.random() * 4)];
                p.owner.skills[0] = {...randomSkill, name: '(복사) ' + randomSkill.name, key: p.owner.skills[0].key};
                showSkillText('술식 모방!', '#e2e8f0');
                buildSkillUI(p.owner, p.owner.isP1 ? 'p1-skills' : 'p2-skills');
            }
            
            // 흑염뢰 폭발 효과 연계
            if (p.eff === 'black_lightning') {
                effects.push({ type: 'a', x: target.pos.x + target.w/2, y: target.pos.y + target.h/2, r: 100, color: '#1e1b4b', life: 20, owner: p.owner, dmg: 15, eff: 'stun' });
                showSkillText('흑염뢰 폭발!', '#1e1b4b');
            }

            if(p.name === '푸가') {
                effects.push({ type: 'pillar', x: target.pos.x + target.w/2, y: canvas.height - 50, w: 200, h: canvas.height, color: '#ea580c', life: 45, owner: p.owner, dmg: 20 });
                canvas.style.transform = `translate(${Math.random()*30-15}px, ${Math.random()*30-15}px)`; 
                setTimeout(() => canvas.style.transform = 'none', 300);
            } else {
                spawnParticles(p.pos.x, p.pos.y, p.color, 15);
            }
            
            if (target.charId === 'higuruma') window.applyGuiltyStack(p.owner); // 히구루마 피격 시 투사체 발사자 유죄
        }
        if(!p.active) projectiles.splice(i, 1);
    }

    for(let i = effects.length - 1; i >= 0; i--) {
        let e = effects[i];
        
        if (e.type === 'afterimage') {
            c.globalAlpha = e.life / 10;
            c.fillStyle = e.color;
            c.fillRect(e.x, e.y, 50, 150);
            c.globalAlpha = 1;
            e.life--;
            if (e.life <= 0) effects.splice(i, 1);
            continue;
        }

        const target = e.owner === players[0] ? players[1] : players[0];
        
        if(e.type === 'a') { 
            c.save();
            if (e.name === '오로치') {
                c.globalAlpha = e.life/30;
                let startY = e.y + e.r;
                let headY = e.y - e.r + (30-e.life)*4; 
                
                // 거대 뱀(오로치) 몸통
                c.fillStyle = '#cbd5e1';
                c.beginPath();
                c.moveTo(e.x - 30, startY);
                c.quadraticCurveTo(e.x - 80, (startY+headY)/2, e.x - 25, headY);
                c.lineTo(e.x + 25, headY);
                c.quadraticCurveTo(e.x + 80, (startY+headY)/2, e.x + 30, startY);
                c.fill();
                
                // 거대 뱀(오로치) 눈과 송곳니
                c.fillStyle = '#ef4444';
                c.beginPath(); c.arc(e.x - 12, headY + 15, 6, 0, Math.PI*2); c.fill();
                c.beginPath(); c.arc(e.x + 12, headY + 15, 6, 0, Math.PI*2); c.fill();
                c.fillStyle = 'white';
                c.beginPath(); c.moveTo(e.x - 10, headY + 25); c.lineTo(e.x - 5, headY + 40); c.lineTo(e.x, headY + 25); c.fill();
                c.beginPath(); c.moveTo(e.x + 10, headY + 25); c.lineTo(e.x + 5, headY + 40); c.lineTo(e.x, headY + 25); c.fill();
                
                // 독 장판 이펙트
                c.fillStyle = 'rgba(167, 243, 208, 0.3)';
                c.beginPath(); c.arc(e.x, e.y, e.r, 0, Math.PI*2); c.fill();
            } else {
                c.globalAlpha = e.life/30; 
                c.beginPath(); c.arc(e.x, e.y, e.r, 0, Math.PI*2);
                c.fillStyle = e.color; c.fill();
            }
            
            if (e.name === '만상' || (e.owner.charId === 'megumi' && e.dmg === 20 && !e.name)) {
                c.globalAlpha = e.life/30;
                let dropY = e.y - e.r + (30-e.life)*6;
                c.fillStyle = '#3b82f6';
                c.beginPath(); c.ellipse(e.x, dropY, 80, 60, 0, 0, Math.PI*2); c.fill(); 
                c.beginPath(); c.ellipse(e.x - 30, dropY - 20, 35, 50, -0.2, 0, Math.PI*2); c.fill(); 
                c.beginPath(); 
                c.moveTo(e.x + 50, dropY - 10);
                c.quadraticCurveTo(e.x + 100, dropY + 50, e.x + 60, dropY + 90);
                c.lineWidth = 25; c.strokeStyle = '#3b82f6'; c.stroke();
                c.beginPath(); 
                c.moveTo(e.x + 50, dropY + 30); c.lineTo(e.x + 90, dropY + 10);
                c.lineWidth = 8; c.strokeStyle = 'white'; c.stroke();
            }
            c.restore();
            
            if(e.life === 30) {
                const dist = Math.hypot(target.pos.x+target.w/2 - e.x, target.pos.y+target.h/2 - e.y);
                if(dist < e.r + target.w/2) {
                    if (target.charId === 'higuruma') window.applyGuiltyStack(e.owner); // 히구루마 피격 시 AoE 소유자 유죄
                    target.takeDamage(e.dmg, 0, e.eff || 'stun');
                    if (e.owner.charId === 'naoya' && e.name === '정지' && !e.owner.awakened) {
                        e.owner.naoyaSkill5Hit = true;
                    }
                }
                else if(e.dmg < 0) e.owner.takeDamage(e.dmg); 
            }
        } else if (e.type === 'pillar') { 
            c.save();
            const grad = c.createLinearGradient(e.x - e.w/2, e.y, e.x + e.w/2, e.y - e.h);
            grad.addColorStop(0, '#fde047'); 
            grad.addColorStop(0.2, e.color); 
            grad.addColorStop(1, 'transparent');
            
            c.fillStyle = grad;
            c.globalAlpha = e.life / 45;
            
            c.beginPath();
            c.moveTo(e.x - e.w/2, e.y);
            c.lineTo(e.x + e.w/2, e.y);
            c.lineTo(e.x + e.w/4 + Math.sin(e.life)*20, e.y - e.h);
            c.lineTo(e.x - e.w/4 - Math.sin(e.life)*20, e.y - e.h);
            c.fill();
            
            if(Math.random() < 0.5) spawnParticles(e.x + (Math.random()-0.5)*e.w, e.y - Math.random()*e.h/2, e.color, 3);
            c.restore();
            
            if(e.life % 10 === 0 && Math.abs(target.pos.x + target.w/2 - e.x) < e.w/2) {
                if (target.charId === 'higuruma') window.applyGuiltyStack(e.owner);
                target.takeDamage(Math.floor(e.dmg / 3), 0, 'shake');
            }
        }
        
        e.life--;
        if(e.life <= 0) effects.splice(i, 1);
    }

    players.forEach(p => {
        p.v.x = 0;
        if (p.charId === 'aizen' && p.aizenStage === 5) {
            p.v.x = 0; p.v.y = 0; // 무간 아이젠 이동 불가 처리
            p.pos.y = canvas.height - 50 - p.h;
        }
    }); 
    
    function runSukunaAI(p, target, speed) {
        p.sukunaAITimer--;
        p.color = '#991b1b'; 
        if(p.sukunaAITimer <= 0) p.color = p.data.color;
        
        if(p.stunned > 0 || p.attackBox.active) return;
        
        const distX = target.pos.x - p.pos.x;
        if (Math.abs(distX) > 90) {
            p.v.x = distX > 0 ? speed : -speed;
            p.facing = distX > 0 ? 1 : -1;
        } else {
            p.facing = distX > 0 ? 1 : -1;
            if (Math.random() < 0.1) p.basicAttack(); 
        }
        
        if (Math.random() < 0.03) {
            if(Math.random() < 0.5 && p.skillCds[0] <= 0) { 
                projectiles.push(new Projectile({
                    x: p.facing === 1 ? p.pos.x + p.w : p.pos.x - 40, y: p.pos.y + 40,
                    v: { x: p.facing === 1 ? 18 : -18, y: 0 }, color: '#ffffff', owner: p, w: 40, h: 60, dmg: 10, name: '해(解)'
                }));
                p.skillCds[0] = 40;
            } else if (p.skillCds[1] <= 0) { 
                p.activateHitbox(90, 20, '#fca5a5', 150);
                p.skillCds[1] = 80;
            }
        }
    }

    function runRimuruAI(p, target, speed) {
        p.rimuruAITimer--;
        c.strokeStyle = '#38bdf8'; c.lineWidth = 3;
        c.strokeRect(p.pos.x - 5, p.pos.y - 5, p.w + 10, p.h + 10);
        
        if(p.stunned > 0 || p.attackBox.active) return;
        
        const distX = target.pos.x - p.pos.x;
        if (Math.abs(distX) > 80) {
            p.v.x = distX > 0 ? speed : -speed;
            p.facing = distX > 0 ? 1 : -1;
        } else {
            p.facing = distX > 0 ? 1 : -1;
            if (Math.random() < 0.2) p.basicAttack(); 
        }
        
        if (Math.random() < 0.05) {
            let availableSkills = [];
            for(let i=0; i<4; i++) if (p.skillCds[i] <= 0) availableSkills.push(i);
            if (availableSkills.length > 0) {
                p.useSkill(availableSkills[Math.floor(Math.random() * availableSkills.length)]);
            }
        }
    }

    let p1Speed = players[0].baseSpeed * (players[0].slowedByDomain ? 0.4 : 1);
    if (players[0].sukunaAITimer > 0) {
        runSukunaAI(players[0], players[1], p1Speed);
    } else if (players[0].rimuruAITimer > 0) {
        runRimuruAI(players[0], players[1], p1Speed);
    } else if(players[0].stunned <= 0) {
        if(keys['a']) { players[0].v.x = -p1Speed; players[0].facing = -1; }
        else if(keys['d']) { players[0].v.x = p1Speed; players[0].facing = 1; }
    }
    
    let p2Speed = players[1].baseSpeed * (players[1].slowedByDomain ? 0.4 : 1);
    if (isTrainingMode) {
        // 훈련장 샌드백은 이동 및 공격을 하지 않음
    } else if (players[1].sukunaAITimer > 0) {
        runSukunaAI(players[1], players[0], p2Speed);
    } else if (players[1].rimuruAITimer > 0) {
        runRimuruAI(players[1], players[0], p2Speed);
    } else if (isAIBattle) {
        runGeneralAI(players[1], players[0], p2Speed);
    } else if(players[1].stunned <= 0) {
        if(keys['ArrowLeft']) { players[1].v.x = -p2Speed; players[1].facing = -1; }
        else if(keys['ArrowRight']) { players[1].v.x = p2Speed; players[1].facing = 1; }
    }

    players.forEach((p, idx) => {
        const target = players[idx === 0 ? 1 : 0];
        if(p.attackBox.active) {
            if(!p.hitRegistered) {
                const ab = {x: p.attackBox.pos.x, y: p.attackBox.pos.y, w: p.attackBox.w, h: p.attackBox.h};
                const tb = {x: target.pos.x, y: target.pos.y, w: target.w, h: target.h};
                if(rectIntersect(ab, tb)) {
                    
                    AudioSys.playMelee(); // 타격 성공음
                    
                    let dmgToDeal = p.currentDmg;
                    
                    if(p.charId === 'yuji' && p.currentEff === 'shake') { 
                        if(p.zoneTimer <= 0) showSkillText('THE ZONE 진입', '#ef4444');
                        p.zoneTimer = 300; 
                        p.takeDamage(-5); 
                        spawnParticles(target.pos.x, target.pos.y, 'black', 20); 
                    }
                    
                    if(p.zoneTimer > 0) dmgToDeal = Math.floor(dmgToDeal * 1.5);
                    
                    if(p.charId === 'yuji' && Math.random() < 0.2 && p.currentEff !== 'shake') {
                        dmgToDeal *= 2;
                        p.currentEff = 'shake';
                    }
                    
                    // 히구루마 몰수 효과 (6초 봉인)
                    if (p.currentEff === 'seal_1' && (!isTrainingMode || !target.isP1)) { // 훈련모드 P1 봉인 면역
                        let available = [0,1,2,3,4].filter(i => target.skillCds[i] < 360);
                        if(available.length > 0) {
                            let randSkill = available[Math.floor(Math.random() * available.length)];
                            target.skillCds[randSkill] = 360; 
                            showSkillText('스킬 1개 몰수! (6초)', '#f87171');
                        }
                    }

                    // 토도 흑섬 발차기 특수 연출
                    if (p.currentEff === 'black_flash_kick') {
                        spawnParticles(target.pos.x + target.w/2, target.pos.y + target.h/2, '#000000', 40);
                        spawnParticles(target.pos.x + target.w/2, target.pos.y + target.h/2, '#dc2626', 40);
                        canvas.style.filter = 'invert(1) grayscale(1)';
                        setTimeout(() => canvas.style.filter = 'none', 150);
                        canvas.style.transform = `scale(1.1) translate(${Math.random()*20-10}px, ${Math.random()*20-10}px)`;
                        setTimeout(() => canvas.style.transform = 'none', 200);
                        showSkillText('흑섬!!', '#000000');
                    }

                    // 나오야 5번/6번 스킬 연계 조건 달성 (각성 조건)
                    if(p.charId === 'naoya' && !p.awakened) {
                        if(p.currentSkillName === '최고 속도로 부딪혀주마' && p.naoyaSkill5Hit && !p.naoyaUltHit) {
                            p.naoyaUltHit = true;
                            showSkillText('원한 축적... (조건 달성!)', '#eab308');
                            if (p.health <= 20 && !p.canAwaken) {
                                p.canAwaken = true;
                                document.getElementById(p.isP1 ? 'p1-awaken-btn' : 'p2-awaken-btn').style.display = 'block';
                            }
                        }
                    }

                    if (p.charId === 'naoya' && p.currentEff === 'basic') {
                        target.frameGauge += 50;
                        if (target.frameGauge >= 100) {
                            target.frameGauge = 0;
                            target.takeDamage(0, 0, 'frame_1', false); 
                            showSkillText('프레임 락!', '#facc15');
                        }
                    }

                    // 마히토 흑섬 각성 스텍 카운트
                    if (p.charId === 'mahito' && p.currentSkillName === '흑섬' && p.currentEff === 'shake' && p.mahitoDomainUsed && !p.awakened && !p.canAwaken) {
                        p.mahitoBFHits++;
                        showSkillText(`흑섬 적중! (${p.mahitoBFHits}/2)`, '#000');
                        if (p.mahitoBFHits >= 2) {
                            p.canAwaken = true;
                            document.getElementById(p.isP1 ? 'p1-awaken-btn' : 'p2-awaken-btn').style.display = 'block';
                        }
                    }

                    // DIO 흡혈 패시브 및 스킬 타격 처리
                    if (p.charId === 'dio') {
                        if (p.health > 0 && p.health < 100) {
                            p.health = Math.min(100, p.health + 2); // 기본 타격 흡혈
                        }
                        if (p.currentEff === 'vampire') {
                            p.health = Math.min(100, p.health + 15);
                            showSkillText('흡혈!', '#991b1b');
                        }
                    }

                    // 히구루마 피격 패시브 처리 (상대가 때릴 때)
                    if (target.charId === 'higuruma') window.applyGuiltyStack(p);

                    // 히구루마 재판 패시브: 적중 시 상대 쿨타임 무작위 증가
                    if (p.charId === 'higuruma') {
                        let randSkill = Math.floor(Math.random() * 5);
                        target.skillCds[randSkill] += 120; // 2초 추가
                        showSkillText('재판: 쿨타임 연장!', '#b91c1c');
                    }
                    
                    // 리무루 포식자 스킬 처리
                    if (p.charId === 'rimuru' && p.currentEff === 'vampire') {
                        p.health = Math.min(100, p.health + 10);
                        showSkillText('포식!', '#1e3a8a');
                    }
                    
                    target.takeDamage(dmgToDeal, p.currentKb, p.currentEff, false);
                    
                    if(p.charId === 'sukuna') {
                        p.takeDamage(-Math.floor(dmgToDeal * 0.3));
                    }
                    
                    p.hitRegistered = true;
                }
            }
        } else p.hitRegistered = false;
    });

    updateGameUI();
    if(players[0].health <= 0 || players[1].health <= 0) endGame();

    // 멀티플레이 상태 동기화 (호스트 -> 게스트 강제 동기화)
    if (isOnline && isHost && mpManager && mpManager.connected && globalFrame % 2 === 0) {
        mpManager.sendMsg({
            type: 'state',
            p1: { x: players[0].pos.x, y: players[0].pos.y, vx: players[0].v.x, vy: players[0].v.y, hp: players[0].health, face: players[0].facing },
            p2: { x: players[1].pos.x, y: players[1].pos.y, vx: players[1].v.x, vy: players[1].v.y, hp: players[1].health, face: players[1].facing },
            time: time
        });
    }
}
