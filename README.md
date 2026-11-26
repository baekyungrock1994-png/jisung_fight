# 아레나 (jisung_fight)

브라우저에서 즐기는 2D 격투게임. 온라인 1V1은 Firebase(익명 로그인 + Firestore)로 두 사람을 이어 주고,
연결된 뒤의 게임 데이터는 WebRTC로 직접 주고받습니다.

## 폴더 구조

    public/
      index.html          화면(HTML)
      css/style.css       스타일
      js/
        firebase-config.js  ★ Firebase 설정값 입력
        firebase.js         Firebase 연결
        online.js           방 만들기 / 참가 / 동기화
        data.js             맵, 캐릭터, 스킬 수치
        fighter.js          캐릭터 동작
        loop.js             메인 게임 루프
        game.js             시작 / 종료 / UI / AI
        awakening.js        각성
        domain.js           영역 / 격돌 / 교체 / 재판
        effects.js          파티클 / 투사체
        render.js           충돌 판정 / 배경
        menu.js, input.js, audio.js, state.js
    firestore.rules       DB 보안 규칙
    firebase.json         배포 설정

스크립트는 전역 변수를 공유하므로 `index.html` 의 로드 순서를 바꾸지 마세요.

## Firebase 설정 (처음 한 번)

1. https://console.firebase.google.com 에서 **프로젝트 추가**
2. 프로젝트 개요 > **웹 앱 추가(</>)** > 표시되는 `firebaseConfig` 값을 `public/js/firebase-config.js` 에 붙여넣기
3. **Authentication** > 시작하기 > 로그인 방법 > **익명** 사용 설정
4. **Firestore Database** > 데이터베이스 만들기 (위치 예: `asia-northeast3` 서울, 프로덕션 모드)
5. Firestore > **규칙** 탭에 `firestore.rules` 내용을 붙여넣고 **게시**

## 실행

`public/index.html` 을 브라우저로 열거나:

    python -m http.server 5500 --directory public

http://localhost:5500 접속 후 창 두 개로 방 만들기 / 참가를 시험합니다.
(뒤에 가려진 창은 브라우저가 게임을 느리게 만들 수 있으니 두 창을 나란히 놓으세요.)

## 인터넷에 올리기 (친구와 대전)

    npm install -g firebase-tools
    firebase login
    firebase use --add
    firebase deploy

배포 후 나오는 `https://<프로젝트ID>.web.app` 주소를 친구에게 보내면 됩니다.

## 알아둘 점

- STUN 서버만 사용하므로 학교·회사 등 일부 네트워크에서는 연결이 안 될 수 있습니다 (TURN 서버 필요).
- 위치 · 체력 · 시간은 방장 기준으로 맞춥니다. 쿨타임, 각성, 랜덤 효과, 투사체는 각자 계산해서 화면이 다를 수 있습니다.
- 비정상 종료(탭 강제 종료 등)한 방은 Firestore의 `rooms` 에 남을 수 있습니다.
