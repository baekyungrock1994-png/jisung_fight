// 충돌 판정 / 배경 그리기

// Collisions
function rectIntersect(r1, r2) {
    return !(r2.x > r1.x+r1.w || r2.x+r2.w < r1.x || r2.y > r1.y+r1.h || r2.y+r2.h < r1.y);
}

// Draw Custom Domain Backgrounds
function drawDomain(ctx, domain) {
    const w = canvas.width; const h = canvas.height;
    ctx.save();
    
    let alpha = Math.min(1, (domain.maxLife - domain.life) / 30);
    ctx.globalAlpha = alpha;

    if (domain.charId === 'gojo') {
        ctx.fillStyle = '#05051a'; ctx.fillRect(0,0,w,h);
        ctx.fillStyle = 'white';
        for(let i=0; i<10; i++) {
            let sx = (Math.random() * w + (domain.maxLife - domain.life) * 5) % w;
            let sy = Math.random() * h;
            ctx.beginPath(); ctx.arc(sx, sy, Math.random()*2, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillStyle = 'rgba(30, 64, 175, 0.3)'; ctx.fillRect(0,0,w,h); 
    } 
    else if (domain.charId === 'sukuna') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#450a0a'); grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
        
        if (domain.owner.isHeian) {
            // Incomplete Malevolent Shrine (불완전 복마어주자) - 거대한 눈알과 참격
            const sx = w/2, sy = h/2 - 50;
            ctx.fillStyle = '#1a0505';
            ctx.beginPath(); ctx.ellipse(sx, sy, 200, 100, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath(); ctx.arc(sx, sy, 50, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.ellipse(sx, sy, 10, 40, 0, 0, Math.PI*2); ctx.fill();
            
            if(Math.random() < 0.6) {
                ctx.beginPath();
                let rx = Math.random()*w, ry = Math.random()*h;
                ctx.moveTo(rx - 150, ry - 150 + (Math.random()*100));
                ctx.lineTo(rx + 150, ry + 150 - (Math.random()*100));
                ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = Math.random()*8+2; ctx.stroke();
            }
        } else {
            // 복마어주자 (기존 사당)
            ctx.fillStyle = '#0a0000'; 
            const sx = w/2, sy = h - 80;
            ctx.fillRect(sx - 150, sy - 40, 300, 40);
            ctx.fillRect(sx - 100, sy - 120, 200, 80);
            ctx.beginPath(); ctx.moveTo(sx - 180, sy - 120); ctx.lineTo(sx, sy - 180); ctx.lineTo(sx + 180, sy - 120); ctx.fill();
            ctx.beginPath(); ctx.moveTo(sx - 130, sy - 180); ctx.lineTo(sx, sy - 230); ctx.lineTo(sx + 130, sy - 180); ctx.fill();
            ctx.fillStyle = '#ff0000';
            for(let i=0; i<5; i++) {
                ctx.beginPath(); ctx.arc(sx - 80 + i*40, sy - 80, 5, 0, Math.PI*2); ctx.fill();
            }
        }
        
        ctx.fillStyle = 'rgba(153, 27, 27, 0.6)';
        ctx.fillRect(0, h-80, w, 80); 
        
        if(!domain.owner.isHeian && Math.random() < 0.4) {
            ctx.beginPath();
            let rx = Math.random()*w, ry = Math.random()*h;
            ctx.moveTo(rx - 100, ry - 100 + (Math.random()*50));
            ctx.lineTo(rx + 100, ry + 100 - (Math.random()*50));
            ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = Math.random()*3+1; ctx.stroke();
        }
    }
    else if (domain.charId === 'hakari') {
        ctx.fillStyle = '#000'; ctx.fillRect(0,0,w,h);
        let shift = (domain.maxLife - domain.life) * 10;
        ctx.fillStyle = (Math.floor(shift/50) % 2 === 0) ? 'rgba(251, 191, 36, 0.2)' : 'rgba(236, 72, 153, 0.2)';
        for(let i=-200; i<w; i+=80) {
            ctx.fillRect(i + (shift%80), 0, 40, h);
        }
    }
    else if (domain.charId === 'megumi') {
        ctx.fillStyle = '#000'; ctx.fillRect(0,0,w,h);
        ctx.fillStyle = 'rgba(6, 78, 59, 0.4)'; 
        ctx.beginPath();
        let waveY = h - 100 + Math.sin(domain.life/10) * 20;
        ctx.moveTo(0, h); ctx.lineTo(0, waveY);
        ctx.quadraticCurveTo(w/2, waveY-50, w, waveY); ctx.lineTo(w, h); ctx.fill();
    }
    else if (domain.charId === 'mahito') {
        ctx.fillStyle = '#1e293b'; ctx.fillRect(0,0,w,h);
        ctx.fillStyle = 'rgba(20, 184, 166, 0.15)';
        for(let i=0; i<10; i++) {
            ctx.beginPath();
            ctx.arc(w/2 + Math.cos(domain.life/20 + i)*200, h/2 + Math.sin(domain.life/20 + i)*200, 100, 0, Math.PI*2);
            ctx.fill();
        }
    }
    else if (domain.charId === 'geto') {
        ctx.fillStyle = '#110022'; ctx.fillRect(0,0,w,h);
        let ownerX = domain.owner.pos.x + domain.owner.w/2;
        let ownerY = domain.owner.pos.y - 50;
        ctx.translate(ownerX, ownerY);
        ctx.rotate((domain.maxLife - domain.life) * 0.1); 
        const grad = ctx.createConicGradient(0, 0, 0);
        grad.addColorStop(0, '#4c1d95'); grad.addColorStop(0.5, '#000000'); grad.addColorStop(1, '#a855f7');
        ctx.fillStyle = grad; 
        ctx.beginPath(); ctx.arc(0, 0, 300, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(0, 0, 80, 0, Math.PI*2); ctx.fill();
        
        if (domain.owner.isKenjaku) {
            ctx.fillStyle = '#0f0518'; ctx.fillRect(-400,-400,800,800); // 덮어쓰기
            ctx.fillStyle = '#4c1d95';
            ctx.beginPath(); ctx.moveTo(-100, 400); ctx.lineTo(-50, -100); ctx.lineTo(50, -100); ctx.lineTo(100, 400); ctx.fill();
            ctx.beginPath(); ctx.arc(0, -100, 150, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'black';
            ctx.beginPath(); ctx.arc(0, -100, 50, 0, Math.PI*2); ctx.fill();
        }
    }
    else if (domain.charId === 'naoya') {
        ctx.fillStyle = domain.owner.isCursedNaoya ? '#271103' : '#422006'; 
        ctx.fillRect(0,0,w,h);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
        let offset = (domain.maxLife - domain.life) * 20;
        for(let i=-200; i<w; i+=120) {
            ctx.fillRect(i + (offset%120), 0, 100, h); 
            ctx.fillStyle = 'black'; ctx.fillRect(i + (offset%120) + 10, 10, 80, 20); ctx.fillRect(i + (offset%120) + 10, h-30, 80, 20);
            ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
        }
    }
    else if (domain.charId === 'yuta') {
        ctx.fillStyle = '#f1f5f9'; ctx.fillRect(0,0,w,h);
        ctx.fillStyle = '#94a3b8';
        for(let i=10; i<w; i+=80) {
            ctx.fillRect(i, h-50, 10, 50); 
            ctx.beginPath(); ctx.moveTo(i-5, h-50); ctx.lineTo(i+5, h-100); ctx.lineTo(i+15, h-50); ctx.fill();
        }
    }
    else if (domain.charId === 'ryu') {
        ctx.fillStyle = '#1e3a8a'; ctx.fillRect(0,0,w,h);
        if(domain.life % 10 === 0) {
            ctx.fillStyle = 'rgba(96, 165, 250, 0.3)';
            ctx.fillRect(0, Math.random()*h, w, Math.random()*80 + 20); 
        }
    } else {
        ctx.fillStyle = 'rgba(153, 27, 27, 0.8)'; ctx.fillRect(0,0,w,h);
    }
    ctx.restore();
}

function drawMap(ctx) {
    const map = MAPS[currentMapIdx];
    const w = canvas.width; const h = canvas.height;
    
    ctx.fillStyle = map.bg; ctx.fillRect(0,0,w,h);
    
    if (map.id === 'shibuya') {
        ctx.fillStyle = map.details;
        ctx.fillRect(50, h-300, 150, 300);
        ctx.fillRect(250, h-400, 200, 400);
        ctx.fillRect(700, h-250, 180, 250);
        if(Math.random() < 0.1) spawnParticles(Math.random()*w, h-50, '#ef4444', 1);
    } else if (map.id === 'school') {
        ctx.fillStyle = map.details;
        ctx.fillRect(0, h-150, w, 100);
        ctx.fillStyle = '#334155'; ctx.fillRect(0, h-160, w, 10); 
        ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.2;
        ctx.beginPath(); ctx.arc(150, 100, 40, 0, Math.PI*2); ctx.fill(); 
        ctx.globalAlpha = 1;
    } else if (map.id === 'subway') {
        ctx.fillStyle = map.details;
        for(let i=100; i<w; i+=300) {
            ctx.fillRect(i, 0, 40, h-50);
            ctx.fillStyle = '#fef08a'; ctx.fillRect(i-10, 50, 60, 20); 
            ctx.fillStyle = map.details;
        }
    }
    
    ctx.fillStyle = map.floor; 
    ctx.fillRect(0, h-50, w, 50);
}
