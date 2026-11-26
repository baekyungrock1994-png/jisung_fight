// 파티클 / 컷인 / 투사체

// Engine Classes
class Particle {
    constructor({x, y, radius, color, velocity, life}) {
        this.x = x; this.y = y; this.radius = radius; this.color = color;
        this.velocity = velocity; this.life = life; this.maxLife = life;
    }
    update() {
        c.globalAlpha = Math.max(0, this.life / this.maxLife);
        c.beginPath(); c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color; c.fill(); c.globalAlpha = 1;
        this.x += this.velocity.x; this.y += this.velocity.y;
        this.life--;
    }
}
function spawnParticles(x, y, color, amount = 10) {
    for(let i=0; i<amount; i++) particles.push(new Particle({
        x, y, radius: Math.random()*3+1, color, life: Math.random()*20+10,
        velocity: { x: (Math.random()-0.5)*10, y: (Math.random()-0.5)*10 }
    }));
}

// 스킬 텍스트 컷인 애니메이션 함수
function showSkillText(name, color) {
    const el = document.getElementById('skill-text');
    el.innerText = name;
    el.style.color = color;
    el.classList.remove('show');
    void el.offsetWidth; // 리플로우 트리거로 애니메이션 초기화
    el.classList.add('show');
    
    if(window.skillTextTimeout) clearTimeout(window.skillTextTimeout);
    window.skillTextTimeout = setTimeout(() => el.classList.remove('show'), 1200);
}

class Projectile {
    constructor({x, y, v, color, owner, w, h, dmg, eff, name}) {
        this.pos = {x, y}; this.v = v; this.color = color;
        this.owner = owner; this.w = w; this.h = h; this.dmg = dmg; this.eff = eff;
        this.name = name; // 스킬 이름 저장
        this.active = true;
        this.angle = 0; // 회전 효과용
    }
    update() {
        c.save();
        c.translate(this.pos.x + this.w/2, this.pos.y + this.h/2);
        
        // 시간정지 중에는 투사체도 애니메이션 회전 정지
        if(!globalTimeStop.active || this.owner === globalTimeStop.owner) {
            this.angle += 0.2;
        }

        if (this.name === '자(茈)' || this.name === '푸가' || this.name === '창(蒼)' || this.name.includes('태양')) {
            c.beginPath(); c.arc(0, 0, this.w/2, 0, Math.PI*2);
            c.fillStyle = this.color; c.fill();
            if(this.name === '자(茈)' || this.name.includes('태양')) {
                c.strokeStyle = 'white'; c.lineWidth = 3; c.stroke();
                c.shadowBlur = 20; c.shadowColor = this.color;
            }
        } else if (this.name === '특급주령' || this.name === '소용돌이') {
            c.beginPath(); c.ellipse(0, 0, this.w/2, this.h/2, this.angle*0.3, 0, Math.PI*2);
            c.fillStyle = this.color; c.fill();
            c.fillStyle = '#ef4444'; 
            c.beginPath(); c.arc(-this.w/4, -this.h/6, 12, 0, Math.PI*2); c.fill();
            c.beginPath(); c.arc(this.w/4, -this.h/6, 12, 0, Math.PI*2); c.fill();
            c.fillStyle = 'white'; 
            for(let i=-20; i<=20; i+=10) { c.fillRect(i, this.h/4, 6, 20); }
        } else if (this.name === '해(解)') {
            c.beginPath();
            let dir = this.v.x > 0 ? 1 : -1;
            c.arc(0, 0, this.h, Math.PI * 1.5, Math.PI * 0.5, dir < 0);
            c.quadraticCurveTo(dir * 20, 0, 0, -this.h);
            c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
        } else if (this.name === '누에') {
            let dir = this.v.x > 0 ? 1 : -1;
            c.fillStyle = this.color;
            c.beginPath(); c.ellipse(0, 0, this.w/2, this.h/2, 0, 0, Math.PI*2); c.fill(); 
            c.beginPath(); c.moveTo(0, -this.h/4); c.lineTo(-this.w/2, -this.h - Math.sin(this.angle)*20); c.lineTo(this.w/2, -this.h/2); c.fill(); 
            c.fillStyle = 'white'; c.beginPath(); c.arc(dir * this.w/3, -this.h/4, 5, 0, Math.PI*2); c.fill(); 
            c.fillStyle = 'orange'; c.beginPath(); c.moveTo(dir * this.w/2, 0); c.lineTo(dir * (this.w/2 + 20), 5); c.lineTo(dir * this.w/2, 10); c.fill(); 
            c.strokeStyle = '#3b82f6'; c.lineWidth = 3; 
            c.beginPath(); c.moveTo(-20, -20); c.lineTo(-5, 10); c.lineTo(-25, 15); c.lineTo(5, 30); c.stroke();
        } else if (this.name === '세계참') {
            let dir = this.v.x > 0 ? 1 : -1;
            c.beginPath();
            c.arc(0, 0, this.h/2, Math.PI * 1.5, Math.PI * 0.5, dir < 0);
            c.quadraticCurveTo(dir * 50, 0, 0, -this.h/2);
            c.lineWidth = 20; c.strokeStyle = '#ffffff'; c.stroke();
            c.fillStyle = 'rgba(255, 255, 255, 0.8)'; c.fill();
            c.shadowBlur = 30; c.shadowColor = 'white';
        } else if (this.name === '다중혼' || this.name === '주령조술') {
            let dir = this.v.x > 0 ? 1 : -1;
            c.beginPath();
            c.arc(0, 0, this.h/2, 0, Math.PI*2); 
            c.moveTo(0, this.h/2);
            c.quadraticCurveTo(-dir * this.w, this.h, -dir * this.w * 1.5, Math.sin(this.angle)*15); 
            c.quadraticCurveTo(-dir * this.w/2, -this.h/2, 0, -this.h/2);
            c.fillStyle = this.color; c.fill();
            c.fillStyle = 'black'; 
            c.beginPath(); c.arc(dir * 10, -5, 4, 0, Math.PI*2); c.fill();
            c.beginPath(); c.arc(dir * 10, 5, 4, 0, Math.PI*2); c.fill();
        } else if (this.name === '흑염뢰') {
            c.beginPath(); c.arc(0, 0, this.w/2, 0, Math.PI*2);
            c.fillStyle = this.color; c.fill();
            c.strokeStyle = '#4c1d95'; c.lineWidth = 3; c.stroke();
            c.shadowBlur = 15; c.shadowColor = '#4c1d95';
        } else if (this.name === '옥견') {
            let dir = this.v.x > 0 ? 1 : -1;
            c.beginPath(); 
            c.moveTo(dir * this.w/2, 0); 
            c.lineTo(dir * this.w/4, -this.h/2); 
            c.lineTo(-dir * this.w/4, -this.h); 
            c.lineTo(-dir * this.w/2, -this.h/2); 
            c.lineTo(-dir * this.w/2, this.h/2); 
            c.lineTo(0, this.h/4); 
            c.fillStyle = this.color; c.fill();
            c.fillStyle = 'white';
            c.beginPath(); c.arc(dir * 5, -this.h/4, 4, 0, Math.PI*2); c.fill();
        } else if (this.name === '파칭코 공') {
            c.beginPath(); c.arc(0, 0, this.w/2, 0, Math.PI*2);
            c.fillStyle = this.color; c.fill();
            c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
        } else if (this.name === '범위 탈토') {
            let dir = this.v.x > 0 ? 1 : -1;
            c.save();
            c.rotate(this.angle);
            c.fillStyle = '#ffffff';
            for(let i=0; i<20; i++) {
                let rx = Math.sin(i * 123.4) * (this.w/2.2);
                let ry = Math.cos(i * 321.4) * (this.h/2.2);
                c.beginPath(); c.arc(rx, ry, 20, 0, Math.PI*2); c.fill();
            }
            c.fillStyle = '#fbcfe8'; // 핑크색 귀와 코
            for(let i=0; i<20; i++) {
                let rx = Math.sin(i * 123.4) * (this.w/2.2);
                let ry = Math.cos(i * 321.4) * (this.h/2.2);
                c.beginPath(); c.arc(rx + (dir*8), ry - 5, 4, 0, Math.PI*2); c.fill(); 
                c.beginPath(); c.ellipse(rx - 8, ry - 18, 5, 12, -0.3, 0, Math.PI*2); c.fill(); 
            }
            c.restore();
        } else {
            c.rotate(this.angle);
            c.fillStyle = this.color;
            c.fillRect(-this.w/2, -this.h/2, this.w, this.h);
        }
        c.restore();
        
        if(Math.random() > 0.4) spawnParticles(this.pos.x + this.w/2, this.pos.y + this.h/2, this.color, 2);

        // 시간정지 중에는 주인의 투사체가 아니면 멈춤
        if (globalTimeStop.active && this.owner !== globalTimeStop.owner) return;

        this.pos.x += this.v.x;
        if(this.pos.x > canvas.width || this.pos.x + this.w < 0) this.active = false;
    }
}
