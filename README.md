# 아레나 (jisung_fight)

브라우저에서 즐기는 2D 격투게임. 온라인 1V1은 Firebase(익명 로그인 + Realtime Database)를 거쳐 게임 데이터를 주고받습니다.

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
    database.rules.json   DB 보안 규칙
    firebase.json         배포 설정

스크립트는 전역 변수를 공유하므로 `index.html` 의 로드 순서를 바꾸지 마세요.

## Firebase 설정 (처음 한 번)

1. https://console.firebase.google.com 에서 **프로젝트 추가**
2. 프로젝트 개요 > **웹 앱 추가(</>)** > 표시되는 `firebaseConfig` 값을 `public/js/firebase-config.js` 에 붙여넣기
3. **Authentication** > 시작하기 > 로그인 방법 > **익명** 사용 설정
4. **Realtime Database** > 데이터베이스 만들기 (위치 `asia-southeast1` 싱가포르, 잠금 모드)
5. 데이터베이스 주소를 `public/js/firebase-config.js` 의 `databaseURL` 에 붙여넣기
6. Realtime Database > **규칙** 탭에 `database.rules.json` 내용을 붙여넣고 **게시**

## 실행

`public/index.html` 을 브라우저로 열거나:

    python -m http.server 5500 --directory public

http://localhost:5500 접속 후 창 두 개로 방 만들기 / 참가를 시험합니다.
(뒤에 가려진 창은 브라우저가 게임을 느리게 만들 수 있으니 두 창을 나란히 놓으세요.)

## 인터넷에 올리기 (친구와 대전)

프로젝트 폴더에서 실행합니다. 대상 프로젝트(`jisungfight`)는 `.firebaserc` 에 지정되어 있습니다.

처음 한 번:

    npm install -g firebase-tools
    firebase login

배포 (코드를 고칠 때마다):

    firebase deploy --only hosting

배포 후 https://jisungfight.web.app 주소를 친구에게 보내면 됩니다.
`database.rules.json` 을 고쳤을 때는 `firebase deploy --only database` 를 실행합니다.

PowerShell에서 "스크립트를 실행할 수 없습니다" 오류가 나면 `npm`, `firebase` 대신 `npm.cmd`, `firebase.cmd` 로 입력합니다.

## 알아둘 점

- 모든 데이터가 서버를 거치므로 상대 화면에 약간의 지연이 있습니다.
- 위치 · 체력 · 시간은 방장 기준으로 맞춥니다. 쿨타임, 각성, 랜덤 효과, 투사체는 각자 계산해서 화면이 다를 수 있습니다.
- 무료 요금제는 동시 접속 100, 월 다운로드 10GB까지입니다.
