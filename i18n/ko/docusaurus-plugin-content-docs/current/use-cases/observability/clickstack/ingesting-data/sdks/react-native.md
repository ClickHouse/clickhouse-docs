---
slug: /use-cases/observability/clickstack/sdks/react-native
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'ClickStack용 React Native SDK - ClickHouse 관측성 스택'
title: 'React Native'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', '로깅', '통합', '애플리케이션 모니터링']
---

ClickStack React Native SDK를 사용하면 React Native 애플리케이션을 계측하여
이벤트를 ClickStack으로 전송할 수 있습니다. 이를 통해 모바일 네트워크 요청과 예외를
백엔드 이벤트와 함께 하나의 타임라인에서 확인할 수 있습니다.

이 가이드에서는 다음을 연동합니다:

- **XHR/Fetch 요청**

## 시작하기 \{#getting-started\}

### NPM으로 설치 \{#install-via-npm\}

다음 명령을 실행하여 [ClickStack React Native 패키지](https://www.npmjs.com/package/@hyperdx/otel-react-native)를 설치합니다.

```shell
npm install @hyperdx/otel-react-native
```


### ClickStack 초기화 \{#initialize-clickstack\}

애플리케이션 라이프사이클 초기에 라이브러리를 최대한 빨리 초기화하십시오:

```javascript
import { HyperDXRum } from '@hyperdx/otel-react-native';

HyperDXRum.init({
  url: 'http://your-otel-collector:4318',
  service: 'my-rn-app',
  apiKey: '<YOUR_INGESTION_API_KEY>', // Omit for Managed ClickStack
  tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
});
```


### 사용자 정보 또는 메타데이터 첨부하기 (선택 사항) \{#attach-user-information-metadata\}

사용자 정보를 첨부하면 HyperDX에서 세션과 이벤트를 검색하고 필터링할 수 있습니다.
이 함수는 클라이언트 세션 중 언제든지 호출할 수 있습니다. 현재 클라이언트
세션과 이 호출 이후 전송되는 모든 이벤트는 사용자 정보와 연결됩니다.

`userEmail`, `userName`, `teamName`은 세션 UI에서 해당 값을 표시하는 데 사용되지만,
제공하지 않아도 됩니다. 그 외 추가 값도 지정할 수 있으며, 이벤트를 검색하는 데 활용할 수
있습니다.

```javascript
HyperDXRum.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Other custom properties...
});
```


### 하위 버전 계측하기 \{#instrument-lower-versions\}

React Native 0.68 미만 버전에서 실행 중인 애플리케이션을 계측하려면,
`metro.config.js` 파일을 편집하여 metro가 브라우저 전용 패키지를
사용하도록 강제해야 합니다. 예를 들어 다음과 같이 설정합니다:

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


## 뷰 내비게이션 \{#view-navigation\}

[react-navigation](https://github.com/react-navigation/react-navigation) 버전 5와 6을 지원합니다.

다음 예제는 내비게이션을 계측하는 방법을 보여줍니다.

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
