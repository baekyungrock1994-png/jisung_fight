// Tone.js 오디오

// ================= Tone.js 오디오 시스템 =================
const AudioSys = {
    ready: false,
    lastMelee: 0,
    lastRanged: 0,
    lastSkill: 0,
    lastClap: 0,
    init() {
        if(this.ready) return;
        this.ready = true;
        
        // 주술회전 느낌의 어둡고 긴장감 있는 브금
        this.bgm = new Tone.PolySynth(Tone.FMSynth).toDestination();
        this.bgm.volume.value = -12;
        const seq = new Tone.Sequence((time, note) => {
            if(config.soundEnabled) this.bgm.triggerAttackRelease(note, 0.1, time);
        }, ["D3", "F3", "A3", "G3", "Bb3", "A3", "F3", "D3"], "8n");
        Tone.Transport.bpm.value = 140;
        seq.start(0);
        Tone.Transport.start();

        // 효과음 신스 설정
        this.melee = new Tone.MembraneSynth().toDestination();
        this.melee.volume.value = -5; // 타격음
        
        this.ranged = new Tone.Synth({oscillator: {type: 'square'}}).toDestination();
        this.ranged.volume.value = -12; // 원거리
        
        this.skill = new Tone.MetalSynth({ harmonicity: 12, resonance: 800 }).toDestination();
        this.skill.volume.value = -15; // 스킬음

        this.clap = new Tone.NoiseSynth({noise: {type: 'white'}, envelope: {attack: 0.005, decay: 0.1, sustain: 0}}).toDestination();
        this.clap.volume.value = 0; // 토도 박수

        this.timeStop = new Tone.Oscillator(400, "sine").toDestination();
        this.timeStop.volume.value = -10; // 디오 시간정지
    },
    getPitch(charId, defaultPitch) {
        const pitches = {
            'yuji': 'C2', 'gojo': 'E3', 'sukuna': 'G1', 'hakari': 'A2', 'megumi': 'D2',
            'mahito': 'F2', 'geto': 'B2', 'naoya': 'C3', 'mahoraga': 'C1', 'toji': 'G2',
            'yuta': 'E2', 'ryu': 'F3', 'dio': 'A1', 'rimuru': 'C4', 'higuruma': 'D3',
            'todo': 'E1', 'escanor': 'G1', 'rentaro': 'C3'
        };
        return pitches[charId] || defaultPitch;
    },
    playMelee(charId) { 
        if(!this.ready || !config.soundEnabled) return; 
        const now = performance.now();
        if (now - this.lastMelee > 50) { 
            this.melee.triggerAttackRelease(this.getPitch(charId, "C2"), "8n", Tone.now()); 
            this.lastMelee = now;
        }
    },
    playRanged(charId) { 
        if(!this.ready || !config.soundEnabled) return; 
        const now = performance.now();
        if (now - this.lastRanged > 50) {
            this.ranged.triggerAttackRelease(this.getPitch(charId, "C5"), "16n", Tone.now()); 
            this.lastRanged = now;
        }
    },
    playSkill(charId) { 
        if(!this.ready || !config.soundEnabled) return; 
        const now = performance.now();
        if (now - this.lastSkill > 50) {
            this.skill.triggerAttackRelease("32n", Tone.now()); 
            this.lastSkill = now;
        }
    },
    playClap() { 
        if(!this.ready || !config.soundEnabled) return; 
        const now = performance.now();
        if (now - this.lastClap > 50) {
            this.clap.triggerAttackRelease("16n", Tone.now()); 
            this.lastClap = now;
        }
    },
    playTimeStop() {
        if(!this.ready || !config.soundEnabled) return;
        if (this.timeStop.state === "started") this.timeStop.stop(Tone.now());
        this.timeStop.frequency.value = 400;
        this.timeStop.start(Tone.now());
        this.timeStop.frequency.rampTo(50, 1.5, Tone.now()); 
        this.timeStop.stop(Tone.now() + 1.5);
    }
};
// =========================================================
