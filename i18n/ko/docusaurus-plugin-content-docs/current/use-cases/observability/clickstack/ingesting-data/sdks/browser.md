---
'slug': '/use-cases/observability/clickstack/sdks/browser'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 0
'description': '브라우저 SDK for ClickStack - The ClickHouse Observability Stack'
'title': '브라우저 JS'
'doc_type': 'guide'
'keywords':
- 'ClickStack'
- 'browser-sdk'
- 'javascript'
- 'session-replay'
- 'frontend'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The ClickStack browser SDK를 사용하면 프론트엔드 애플리케이션에 이벤트를 ClickStack으로 전송하도록 계측할 수 있습니다. 이를 통해 네트워크 요청과 예외를 백엔드 이벤트와 함께 단일 타임라인에서 볼 수 있습니다.

또한, 세션 리플레이 데이터가 자동으로 캡처되고 상관관계가 설정되므로 사용자가 애플리케이션을 사용하는 동안 어떤 것을 보고 있었는지를 시각적으로 단계별로 탐색하고 디버그할 수 있습니다.

이 가이드는 다음을 통합합니다:

- **콘솔 로그**
- **세션 리플레이**
- **XHR/Fetch/Websocket 요청**
- **예외**

## 시작하기 {#getting-started}

<br/>

<Tabs groupId="install">
<TabItem value="package_import" label="패키지 가져오기" default>

**패키지 가져기를 통한 설치 (권장)**

다음 명령어를 사용하여 [브라우저 패키지](https://www.npmjs.com/package/@hyperdx/browser)를 설치합니다.

```shell
npm install @hyperdx/browser
```

**ClickStack 초기화**

```javascript
import HyperDX from '@hyperdx/browser';

HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
    consoleCapture: true, // Capture console logs (default false)
    advancedNetworkCapture: true, // Capture full HTTP request/response headers and bodies (default false)
});
```

</TabItem>
<TabItem value="script_tag" label="스크립트 태그">

**스크립트 태그를 통한 설치 (대안)**

NPM을 통해 설치하는 대신 스크립트 태그를 통해 스크립트를 포함하고 설치할 수도 있습니다. 이렇게 하면 `HyperDX` 전역 변수가 노출되며 NPM 패키지와 동일한 방식으로 사용할 수 있습니다.

귀하의 사이트가 현재 번들러를 사용하여 구축되지 않은 경우 이 방법이 권장됩니다.

```html
<script src="//www.unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
  });
</script>
```

</TabItem>
</Tabs>

### 옵션 {#options}

- `apiKey` - 귀하의 ClickStack 수집 API 키.
- `service` - 이벤트가 HyperDX UI에 표시될 서비스 이름.
- `tracePropagationTargets` - 프론트엔드와 백엔드 트레이스를 연결하기 위해 HTTP 요청에 대해 일치할 정규 표현식 패턴 목록. 일치하는 패턴의 모든 요청에 추가 `traceparent` 헤더를 추가합니다. 이는 귀하의 백엔드 API 도메인(예: `api.yoursite.com`)으로 설정해야 합니다.
- `consoleCapture` - (선택 사항) 모든 콘솔 로그 캡처 (기본값 `false`).
- `advancedNetworkCapture` - (선택 사항) 전체 요청/응답 헤더 및 본문 캡처 (기본값 `false`).
- `url` - (선택 사항) OpenTelemetry 수집기 URL, 자체 호스팅 인스턴스에 필요.
- `maskAllInputs` - (선택 사항) 세션 리플레이에서 모든 입력 필드를 마스크할지 여부 (기본값 `false`).
- `maskAllText` - (선택 사항) 세션 리플레이에서 모든 텍스트를 마스크할지 여부 (기본값 `false`).
- `disableIntercom` - (선택 사항) Intercom 통합 비활성화 여부 (기본값 `false`).
- `disableReplay` - (선택 사항) 세션 리플레이 비활성화 여부 (기본값 `false`).

## 추가 구성 {#additional-configuration}

### 사용자 정보 또는 메타데이터 첨부 {#attach-user-information-or-metadata}

사용자 정보를 첨부하면 HyperDX UI에서 세션과 이벤트를 검색/필터링할 수 있습니다. 이는 클라이언트 세션 중 언제든지 호출할 수 있습니다. 현재 클라이언트 세션 및 호출 이후에 전송된 모든 이벤트는 사용자 정보와 연관됩니다.

`userEmail`, `userName`, 및 `teamName`은 해당 값으로 세션 UI를 채우며 생략할 수 있습니다. 다른 추가 값도 지정할 수 있으며 이벤트 검색에 사용할 수 있습니다.

```javascript
HyperDX.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Other custom properties...
});
```

### React 오류 경계 오류 자동 캡처 {#auto-capture-react-error-boundary-errors}

React를 사용하는 경우 `attachToReactErrorBoundary` 함수에 오류 경계 구성 요소를 전달하여 React 오류 경계 내에서 발생하는 오류를 자동으로 캡처할 수 있습니다.

```javascript
// Import your ErrorBoundary (we're using react-error-boundary as an example)
import { ErrorBoundary } from 'react-error-boundary';

// This will hook into the ErrorBoundary component and capture any errors that occur
// within any instance of it.
HyperDX.attachToReactErrorBoundary(ErrorBoundary);
```

### 사용자 정의 작업 전송 {#send-custom-actions}

특정 애플리케이션 이벤트(예: 가입, 제출 등)를 명시적으로 추적하려면 이벤트 이름과 선택적 이벤트 메타데이터를 사용하여 `addAction` 함수를 호출할 수 있습니다.

예시:

```javascript
HyperDX.addAction('Form-Completed', {
  formId: 'signup-form',
  formName: 'Signup Form',
  formType: 'signup',
});
```

### 네트워크 캡처 동적으로 활성화 {#enable-network-capture-dynamically}

네트워크 캡처를 동적으로 활성화하거나 비활성화하려면 필요에 따라 `enableAdvancedNetworkCapture` 또는 `disableAdvancedNetworkCapture` 함수를 호출하면 됩니다.

```javascript
HyperDX.enableAdvancedNetworkCapture();
```

### CORS 요청을 위한 리소스 타이밍 활성화 {#enable-resource-timing-for-cors-requests}

프론트엔드 애플리케이션이 다른 도메인에 API 요청을 하는 경우 요청과 함께 전송되도록 `Timing-Allow-Origin`[헤더](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin)를 선택적으로 활성화할 수 있습니다. 이를 통해 ClickStack이 DNS 조회, 응답 다운로드 등과 같은 요청에 대한 세분화된 리소스 타이밍 정보를 캡처할 수 있습니다. [`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming)을 통해 가능합니다.

`express`와 `cors` 패키지를 사용하는 경우 다음 스니펫을 사용하여 헤더를 활성화할 수 있습니다:

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
