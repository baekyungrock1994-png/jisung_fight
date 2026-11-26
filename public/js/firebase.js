// Firebase 연결 (익명 로그인 + Realtime Database)
// 파일을 더블클릭해 열어도 동작하도록 일반 스크립트에서 동적 import 를 사용합니다.

const FIREBASE_SDK = 'https://www.gstatic.com/firebasejs/11.6.1';
let firebasePromise = null; // 앱은 한 번만 초기화하고 재사용

async function connectFirebase() {
    const [{ initializeApp }, { getAuth, signInAnonymously }, rtdb] = await Promise.all([
        import(`${FIREBASE_SDK}/firebase-app.js`),
        import(`${FIREBASE_SDK}/firebase-auth.js`),
        import(`${FIREBASE_SDK}/firebase-database.js`)
    ]);
    const app = initializeApp(window.FIREBASE_CONFIG);
    const { user } = await signInAnonymously(getAuth(app));
    const { getDatabase, ref, get, set, push, remove, onValue, onChildAdded, onDisconnect, runTransaction } = rtdb;
    return { db: getDatabase(app), user, ref, get, set, push, remove, onValue, onChildAdded, onDisconnect, runTransaction };
}

window.initOnlineMultiplayer = async () => {
    const config = window.FIREBASE_CONFIG;
    if (!config || !config.databaseURL || Object.values(config).some(v => v === '여기에_입력')) {
        showMenuMessage('Firebase 설정이 필요합니다. js/firebase-config.js 를 채워주세요.', '#ef4444');
        return null;
    }
    try {
        if (!firebasePromise) firebasePromise = connectFirebase();
        return await firebasePromise;
    } catch (e) {
        firebasePromise = null; // 다음 시도에서 다시 연결
        console.error('Firebase init failed:', e);
        showMenuMessage('서버 연결에 실패했습니다.', '#ef4444');
        return null;
    }
};
