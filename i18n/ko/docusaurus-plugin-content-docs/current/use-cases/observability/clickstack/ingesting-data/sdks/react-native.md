---
'slug': '/use-cases/observability/clickstack/sdks/react-native'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 7
'description': 'ClickStack을 위한 React Native SDK - ClickHouse 관측 스택'
'title': 'React Native'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'sdk'
- 'logging'
- 'integration'
- 'application monitoring'
---

The ClickStack React Native SDK를 사용하면 React Native 애플리케이션을 계측하여 ClickStack에 이벤트를 보낼 수 있습니다. 이를 통해 모바일 네트워크 요청과 예외를 백엔드 이벤트와 동일한 타임라인에서 확인할 수 있습니다.

이 가이드는 다음을 통합합니다:

- **XHR/Fetch 요청**

## 시작하기 {#getting-started}

### NPM을 통한 설치 {#install-via-npm}

다음 명령어를 사용하여 [ClickStack React Native 패키지](https://www.npmjs.com/package/@hyperdx/otel-react-native)를 설치합니다.

```shell
npm install @hyperdx/otel-react-native
```

### ClickStack 초기화 {#initialize-clickstack}

라이브러리는 가능한 한 빨리 앱 생애 주기 내에서 초기화해야 합니다:

```javascript
import { HyperDXRum } from '@hyperdx/otel-react-native';

HyperDXRum.init({
  service: 'my-rn-app',
  apiKey: '<YOUR_INGESTION_API_KEY>',
  tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
});
```

### 사용자 정보 또는 메타데이터 연결 (선택 사항) {#attach-user-information-metadata}

사용자 정보를 연결하면 HyperDX에서 세션과 이벤트를 검색/필터링할 수 있습니다. 이는 클라이언트 세션의 어느 시점에서든 호출될 수 있습니다. 현재 클라이언트 세션 및 호출 후 전송된 모든 이벤트는 사용자 정보와 연결됩니다.

`userEmail`, `userName`, 및 `teamName`은 세션 UI에 해당 값을 채워넣지만 생략할 수도 있습니다. 다른 추가 값을 지정할 수 있으며 이를 사용하여 이벤트를 검색할 수 있습니다.

```javascript
HyperDXRum.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Other custom properties...
});
```

### 하위 버전 계측 {#instrument-lower-versions}

0.68보다 낮은 React Native 버전에서 실행되는 애플리케이션을 계측하려면 `metro.config.js` 파일을 편집하여 메트로가 브라우저 전용 패키지를 사용하도록 강제합니다. 예를 들어:

```javascript
const defaultResolver = require('metro-resolver');

module.exports = {
  resolver: {
    resolveRequest: (context, realModuleName, platform, moduleName) => {
      const resolved = defaultResolver.resolve(
        {
          ...context,
          resolveRequest: null,
        },
        moduleName,
        platform,
      );

      if (
        resolved.type === 'sourceFile' &&
        resolved.filePath.includes('@opentelemetry')
      ) {
        resolved.filePath = resolved.filePath.replace(
          'platform\\node',
          'platform\\browser',
        );
        return resolved;
      }

      return resolved;
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
```

## 뷰 내비게이션 {#view-navigation}

[react-navigation](https://github.com/react-navigation/react-navigation) 버전 5와 6이 지원됩니다.

다음 예제는 내비게이션을 계측하는 방법을 보여줍니다:

```javascript
import { startNavigationTracking } from '@hyperdx/otel-react-native';

export default function App() {
  const navigationRef = useNavigationContainerRef();
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        startNavigationTracking(navigationRef);
      }}
    >
      <Stack.Navigator>...</Stack.Navigator>
    </NavigationContainer>
  );
}
```
