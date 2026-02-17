---
slug: /use-cases/observability/clickstack/sdks/browser
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'ClickHouse 관측성 스택인 ClickStack용 브라우저 SDK'
title: '브라우저 JS'
doc_type: 'guide'
keywords: ['ClickStack', 'browser-sdk', 'javascript', 'session-replay', 'frontend']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack 브라우저 SDK를 사용하면 프론트엔드 애플리케이션을 계측하여
이벤트를 ClickStack으로 전송할 수 있습니다. 이를 통해 네트워크
요청과 예외를 백엔드 이벤트와 함께 단일 타임라인에서 확인할 수 있습니다.

또한 세션 리플레이 데이터를 자동으로 캡처하고 연관시켜,
애플리케이션 사용 시 화면에서 어떤 내용이 보였는지를
시각적으로 단계별로 따라가며 디버깅할 수 있습니다.

이 가이드에서는 다음을 통합합니다.

* **콘솔 로그(Console Logs)**
* **세션 리플레이(Session Replays)**
* **XHR/Fetch/Websocket 요청(XHR/Fetch/Websocket Requests)**
* **예외(Exceptions)**


## 시작하기 \{#getting-started\}

<br/>

<Tabs groupId="install">
<TabItem value="package_import" label="패키지 임포트" default>

**패키지 임포트를 통한 설치(권장)**

다음 명령으로 [브라우저 패키지](https://www.npmjs.com/package/@hyperdx/browser)를 설치합니다.

```shell
npm install @hyperdx/browser
```
**ClickStack 초기화**

```javascript
import HyperDX from '@hyperdx/browser';

HyperDX.init({
    url: 'http://your-otel-collector:4318',
    apiKey: 'YOUR_INGESTION_API_KEY', // Managed ClickStack에서는 생략
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // 프론트엔드 트레이스를 백엔드 요청과 연결하도록 설정
    consoleCapture: true, // 콘솔 로그 수집 (기본값 false)
    advancedNetworkCapture: true, // 전체 HTTP 요청/응답 헤더와 바디 수집 (기본값 false)
});
```

</TabItem>
<TabItem value="script_tag" label="스크립트 태그">

**스크립트 태그를 통한 설치(대안)**

NPM을 통한 설치 대신, 스크립트 태그를 사용해 스크립트를 포함하여 설치할 수도 있습니다.
이 방법은 전역 변수 `HyperDX`를 노출하며, NPM 패키지와 동일한 방식으로 사용할 수 있습니다.

사이트가 현재 번들러를 사용해 빌드되지 않고 있는 경우 이 방법을 권장합니다.

```html
<script src="//www.unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY', // Managed ClickStack에서는 생략
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // 프론트엔드 트레이스를 백엔드 요청과 연결하도록 설정
  });
</script>
```

</TabItem>
</Tabs>

### Options \{#options\}

- `apiKey` - ClickStack 수집 API key입니다.
- `service` - 이벤트가 HyperDX UI에 표시될 서비스 이름입니다.
- `tracePropagationTargets` - HTTP 요청에 대해 정규식 패턴 목록을 지정하여 프런트엔드와 백엔드 트레이스를 연결합니다. 패턴과 일치하는 모든 요청에 추가 `traceparent` 헤더를 추가합니다. 백엔드 API 도메인(예: `api.yoursite.com`)으로 설정해야 합니다.
- `consoleCapture` - (선택 사항) 모든 콘솔 로그를 수집합니다(기본값 `false`).
- `advancedNetworkCapture` - (선택 사항) 전체 요청/응답 헤더와 본문을 수집합니다(기본값 `false`).
- `url` - (선택 사항) OpenTelemetry collector URL입니다. self-hosted 인스턴스에서만 필요합니다.
- `maskAllInputs` - (선택 사항) 세션 리플레이에서 모든 입력 필드를 마스킹할지 여부입니다(기본값 `false`).
- `maskAllText` - (선택 사항) 세션 리플레이에서 모든 텍스트를 마스킹할지 여부입니다(기본값
  `false`).
- `disableIntercom` - (선택 사항) Intercom 연동을 비활성화할지 여부입니다(기본값 `false`)
- `disableReplay` - (선택 사항) 세션 리플레이를 비활성화할지 여부입니다(기본값 `false`)

## 추가 설정 \{#additional-configuration\}

### 사용자 정보 또는 메타데이터 첨부 \{#attach-user-information-or-metadata\}

사용자 정보를 첨부하면 HyperDX UI에서 세션과 이벤트를 검색하거나 필터링할 수 있습니다.
이 함수는 클라이언트 세션 중 언제든지 호출할 수 있습니다. 현재 클라이언트 세션과
해당 호출 이후 전송되는 모든 이벤트는 사용자 정보와 연관됩니다.

`userEmail`, `userName`, `teamName`은 세션 UI에 해당 값을 표시하지만, 생략해도 됩니다.
그 외의 추가 값도 지정할 수 있으며, 이벤트 검색에 사용할 수 있습니다.

```javascript
HyperDX.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Other custom properties...
});
```


### React error boundary 오류 자동 캡처 \{#auto-capture-react-error-boundary-errors\}

React를 사용하는 경우, `attachToReactErrorBoundary` 함수에
error boundary 컴포넌트를 전달하여 React error boundary 내부에서 발생하는
오류를 자동으로 캡처할 수 있습니다.

```javascript
// Import your ErrorBoundary (we're using react-error-boundary as an example)
import { ErrorBoundary } from 'react-error-boundary';

// This will hook into the ErrorBoundary component and capture any errors that occur
// within any instance of it.
HyperDX.attachToReactErrorBoundary(ErrorBoundary);
```


### 사용자 지정 액션 전송 \{#send-custom-actions\}

특정 애플리케이션 이벤트(예: 회원 가입, 제출 등)를 명시적으로 추적하려면
이벤트 이름과 선택적 이벤트 메타데이터를 인자로 하여 `addAction` 함수를 호출하면 됩니다.

예시:

```javascript
HyperDX.addAction('Form-Completed', {
  formId: 'signup-form',
  formName: 'Signup Form',
  formType: 'signup',
});
```


### 네트워크 캡처를 동적으로 활성화하기 \{#enable-network-capture-dynamically\}

네트워크 캡처를 동적으로 활성화하거나 비활성화하려면 필요에 따라 `enableAdvancedNetworkCapture` 또는 `disableAdvancedNetworkCapture` 함수를 호출하면 됩니다.

```javascript
HyperDX.enableAdvancedNetworkCapture();
```


### CORS 요청에 대한 리소스 타이밍 활성화 \{#enable-resource-timing-for-cors-requests\}

프론트엔드 애플리케이션이 다른 도메인으로 API 요청을 보내는 경우, 선택적으로 요청과 함께 전송되는 `Timing-Allow-Origin` [헤더](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin)를 활성화할 수 있습니다. 이렇게 하면 ClickStack이 [`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming)을 통해 DNS 조회, 응답 다운로드 등과 같은 요청에 대한 세밀한 리소스 타이밍 정보를 수집할 수 있습니다.

`express`와 `cors` 패키지를 사용하는 경우, 다음 코드 스니펫을 사용하여 해당 헤더를 활성화할 수 있습니다:

```javascript
var cors = require('cors');
var onHeaders = require('on-headers');

// ... all your stuff

app.use(function (req, res, next) {
  onHeaders(res, function () {
    var allowOrigin = res.getHeader('Access-Control-Allow-Origin');
    if (allowOrigin) {
      res.setHeader('Timing-Allow-Origin', allowOrigin);
    }
  });
  next();
});
app.use(cors());
```
