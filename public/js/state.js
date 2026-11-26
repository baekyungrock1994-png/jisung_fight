// 게임 전역 상태

// Game Engine
const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');
canvas.width = 1024;
canvas.height = 576;

const gravity = 0.7;
let gameActive = false;
let gameFinished = false;
let projectiles = [];
let particles = [];
let effects = []; // AoE
let activeLasers = []; // 레이저 빔 배열
let players = [];
let keys = {};
let currentDomain = null; 
let clashActive = false; 
let beamClashActive = false; // 빔 격돌 여부
let clashTimer = 0;
let clashValue = 50; // 50이 중앙 (0: P1 승리, 100: P2 승리)
let pendingDomainOwner = null;
let pendingDomainSkill = null;

let globalTimeStop = { active: false, timer: 0, owner: null }; // 디오 시간정지 글로벌 객체

let swapTargetPlayer = null;
let swapUIActive = false;

let trialTargetPlayer = null;
let trialUIActive = false;

let getoOrbs = []; // 게토 구슬 배열
let sukunaFingersList = []; // 스쿠나 손가락 배열
let rimuruSoulsList = []; // 리무루 영혼 배열
let globalFrame = 0; // 글로벌 프레임 (구슬 생성 등에 사용)
let isCutscene = false; // 컷씬 중 멈춤 플래그
