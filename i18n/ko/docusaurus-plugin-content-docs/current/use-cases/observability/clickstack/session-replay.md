---
slug: /use-cases/observability/clickstack/session-replay
title: '세션 리플레이'
sidebar_label: '세션 리플레이'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: 'ClickStack에서 사용자 세션을 캡처하고 재생하여 프론트엔드 문제를 디버깅하고, 사용자 행동을 파악하며, 브라우저 활동을 백엔드 로그 및 트레이스와 연관시켜 분석합니다.'
doc_type: 'guide'
keywords: ['clickstack', '세션 리플레이', '브라우저 SDK', '프론트엔드 관측성', '사용자 세션', '디버깅']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import session_replay from '@site/static/images/clickstack/session-replay/session-replay.png';
import replay_search from '@site/static/images/clickstack/session-replay/replay-search-view.png';
import trace_to_replay from '@site/static/images/clickstack/session-replay/trace-to-replay.png';
import clickpy_trace from '@site/static/images/clickstack/session-replay/clickpy-trace.gif';

ClickStack의 세션 리플레이 기능은 웹 애플리케이션에서 사용자의 상호작용을 캡처하고 재구성하여, 세션 동안 사용자가 화면에서 무엇을 보고 무엇을 했는지 정확히 시각적으로 재생할 수 있도록 합니다. 비디오를 녹화하는 대신 SDK는 DOM 변경, 마우스 움직임, 클릭, 스크롤, 키보드 입력, 콘솔 로그, 네트워크 요청(XHR, Fetch, WebSocket), JavaScript 예외를 기록한 뒤 브라우저에서 그 경험을 재구성합니다.

세션 리플레이는 로그, 트레이스, 메트릭과 함께 ClickHouse에 저장되므로, 몇 번의 클릭만으로 사용자의 경험을 재생하는 화면에서 곧바로 이를 뒷받침한 백엔드 트레이스와 데이터베이스 쿼리를 확인할 수 있습니다. 이를 통해 세션 리플레이는 프로덕션 이슈 디버깅, 사용자 행동 이해, UX 마찰 지점 파악, 그리고 지원팀에 보고된 문제를 시각적으로 확인하는 데 유용하게 활용됩니다.


## 애플리케이션 계측하기 \{#instrumentation\}

ClickStack은 OpenTelemetry와 완전히 호환되므로, 표준 OpenTelemetry JavaScript SDK나 [ClickStack 언어별 SDK](/use-cases/observability/clickstack/sdks)를 사용하여 브라우저 텔레메트리(트레이스, 예외)를 전송할 수 있습니다. 다만, **세션 리플레이에는 ClickStack Browser SDK**(`@hyperdx/browser`)가 필요합니다. 이 SDK는 OpenTelemetry SDK를 확장하여 세션 기록, 콘솔 캡처, 네트워크 요청 캡처 기능을 제공합니다. 세션 리플레이 없이 트레이스만 필요하다면, OTel과 호환되는 브라우저 SDK라면 어떤 것이든 ClickStack과 함께 사용할 수 있습니다.

아래 예시는 ClickStack Browser SDK를 사용합니다. 애플리케이션에 세션 리플레이를 추가하는 단계는 세 가지입니다. 패키지를 설치하고 SDK를 초기화하면 이후 모든 사용자 상호작용이 자동으로 캡처되며, 추가 코드 변경은 필요하지 않습니다.

:::tip
SDK는 앱이 시작될 때 반드시 로드되는 위치에서 초기화하십시오. 예를 들어 Next.js 애플리케이션에서는 루트 `layout.js`가 될 수 있습니다. 이렇게 하면 세션 기록이 즉시 시작되어 전체 사용자 경험이 캡처됩니다.
:::

<Tabs groupId="install">
<TabItem value="npm" label="NPM" default>

```shell
npm install @hyperdx/browser
```

```javascript
import HyperDX from '@hyperdx/browser';

HyperDX.init({
  url: 'http://your-otel-collector:4318',
  apiKey: 'YOUR_INGESTION_API_KEY', // Managed ClickStack의 경우 생략
  service: 'my-frontend-app',
  tracePropagationTargets: [/api.myapp.domain/i],
  consoleCapture: true,
  advancedNetworkCapture: true,
});
```

</TabItem>
<TabItem value="yarn" label="Yarn">

```shell
yarn add @hyperdx/browser
```

```javascript
import HyperDX from '@hyperdx/browser';

HyperDX.init({
  url: 'http://your-otel-collector:4318',
  apiKey: 'YOUR_INGESTION_API_KEY', // Managed ClickStack의 경우 생략
  service: 'my-frontend-app',
  tracePropagationTargets: [/api.myapp.domain/i],
  consoleCapture: true,
  advancedNetworkCapture: true,
});
```

</TabItem>
<TabItem value="script_tag" label="Script 태그">

번들러를 사용하지 않는 애플리케이션의 경우, script 태그를 통해 SDK를 직접 포함하십시오. 이렇게 하면 전역 변수 `HyperDX`가 노출되며, NPM 패키지와 동일한 방식으로 사용할 수 있습니다.

```html
<script src="https://unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: 'http://your-otel-collector:4318',
    apiKey: 'YOUR_INGESTION_API_KEY', // Managed ClickStack의 경우 생략
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i],
    consoleCapture: true,
    advancedNetworkCapture: true,
  });
</script>
```

</TabItem>
</Tabs>

:::note
`tracePropagationTargets` 옵션은 세션 리플레이를 백엔드 트레이스와 연결하는 데 핵심입니다. 이 값을 API 도메인으로 설정하면, 프런트엔드에서 백엔드까지 전체 분산 트레이싱이 활성화됩니다. 개인정보 보호 제어, 사용자 정의 액션, React 에러 바운더리, 소스맵 등 전체 SDK 옵션 목록은 [Browser SDK 참조 문서](/use-cases/observability/clickstack/sdks/browser)를 참고하십시오.
:::

Browser SDK는 개인정보 보호가 중요한 애플리케이션을 위해 [입력값과 텍스트 마스킹](/use-cases/observability/clickstack/sdks/browser#options)을 지원하며, [사용자 정보 첨부](/use-cases/observability/clickstack/sdks/browser#attach-user-information-or-metadata) 기능을 통해 ClickStack UI에서 사용자별로 세션을 검색하고 필터링할 수 있습니다.

## 세션 재생 보기 \{#viewing-replays\}

ClickStack UI (HyperDX)의 왼쪽 사이드바에서 **Client Sessions**로 이동합니다. 이 화면에는 캡처된 모든 브라우저 세션과 각 세션의 지속 시간, 이벤트 개수가 표시됩니다.

<Image img={replay_search} alt="세션 재생 검색 화면" size="lg"/>

원하는 세션에서 재생 버튼을 클릭하여 세션을 다시 재생합니다. 재생 화면에서는 오른쪽에 복원된 사용자 경험이 표시되고, 왼쪽에는 브라우저 이벤트(네트워크 요청, 콘솔 로그, 오류)의 타임라인이 표시됩니다.

<Image img={session_replay} alt="세션 재생 화면" size="lg"/>

타임라인에 표시되는 세부 수준을 조정하려면 **Highlighted**와 **All Events** 모드 사이를 전환합니다. 오류는 빨간색으로 표시되며, 이벤트를 클릭하면 해당 세션 시점으로 재생이 이동합니다.

### 세션에서 트레이스로 \{#session-to-trace\}

세션 타임라인에서 네트워크 요청이나 오류를 선택하면 **Trace** 탭으로 이동하여, 해당 요청이 백엔드 서비스에서 어떻게 처리되는지와 함께 그 사용자 상호작용으로 트리거된 로그, span, 데이터베이스 쿼리를 확인할 수 있습니다.

이는 `tracePropagationTargets` 구성이 `traceparent` 헤더를 통해 브라우저 span을 서버 span과 연결하여, 사용자의 클릭부터 데이터베이스까지 이어지는 연결된 분산 트레이스를 생성하기 때문에 가능합니다. 프론트엔드와 백엔드를 모두 계측하는 방법을 포함한 실제 단계별 예시는 [Instrumenting your NextJS application with OpenTelemetry and ClickStack](https://clickhouse.com/blog/instrumenting-nextjs-opentelemetry-clickstack)을 참조하십시오.

<img src={clickpy_trace} alt="ClickStack에서 세션 리플레이에서 백엔드 트레이스로 탐색하는 화면" />

### 트레이스에서 세션으로 \{#trace-to-session\}

상관관계는 반대 방향으로도 적용됩니다. **Search** 뷰에서 트레이스를 볼 때 해당 항목을 클릭하여 트레이스 상세 화면을 연 다음 **Session Replay** 탭을 선택하면, 해당 트레이스가 발생했을 때 사용자가 어떤 경험을 하고 있었는지 정확히 확인할 수 있습니다. 이는 오류나 느린 요청을 조사할 때 특히 유용하며, 백엔드 문제에서 시작해 곧바로 사용자의 관점을 확인할 수 있습니다.

<Image img={trace_to_replay} alt="세션 재생 트레이스 뷰" size="lg"/>

## 세션 데이터가 저장되는 방식 \{#data-storage\}

세션 리플레이 데이터는 로그 및 트레이스와는 별도로 ClickHouse의 전용 [`hyperdx_sessions`](/use-cases/observability/clickstack/ingesting-data/schemas#sessions) 테이블에 저장됩니다. 각 세션 이벤트는 하나의 행이며, 이벤트 페이로드를 포함하는 `Body` 필드와 이벤트 메타데이터를 저장하는 `LogAttributes` 맵으로 구성됩니다. `Body`와 `LogAttributes` 컬럼은 함께 리플레이를 재구성하는 데 사용되는 실제 세션 이벤트의 세부 정보를 보관합니다.

테이블 스키마에 대한 전체 정보는 [ClickStack에서 사용하는 테이블 및 스키마](/use-cases/observability/clickstack/ingesting-data/schemas)를 참고하십시오.

## 직접 사용해 보기 \{#try-it-out\}

세션 리플레이를 실제로 확인하는 방법은 두 가지입니다.

- **라이브 예제** — [clickpy.clickhouse.com](https://clickpy.clickhouse.com)에 방문하여 애플리케이션을 사용한 다음, [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)에서 **ClickPy Sessions** 소스 아래에 있는 세션 리플레이를 확인합니다. ClickPy가 어떻게 계측되었는지에 대한 자세한 내용은 블로그 글 [Instrumenting your NextJS application with OpenTelemetry and ClickStack](https://clickhouse.com/blog/instrumenting-your-app-with-otel-clickstack)을 참고하십시오.
- **로컬 데모** — [Session Replay Demo](/use-cases/observability/clickstack/example-datasets/session-replay-demo)는 데모 애플리케이션을 단계별로 계측하는 과정을 안내하며, 여기에는 로컬에서 ClickStack을 실행하고 세션 리플레이를 확인하는 과정이 포함됩니다.

## 더 알아보기 \{#learn-more\}

- [Session Replay 데모](/use-cases/observability/clickstack/example-datasets/session-replay-demo) — 단계별 안내가 포함된 대화형 로컬 데모 애플리케이션
- [Browser SDK 참조](/use-cases/observability/clickstack/sdks/browser) — 전체 SDK 옵션, 소스 맵, 사용자 정의 동작 및 고급 구성 옵션
- [Search](/use-cases/observability/clickstack/search) — 세션과 이벤트를 필터링하기 위한 검색 구문
- [Dashboards](/use-cases/observability/clickstack/dashboards) — 세션 및 트레이스 데이터를 기반으로 시각화와 대시보드를 생성
- [Alerts](/use-cases/observability/clickstack/alerts) — 오류, 지연 시간 및 기타 신호에 대한 알림 설정
- [ClickStack 아키텍처](/use-cases/observability/clickstack/architecture) — ClickHouse, HyperDX, OTel collector가 함께 동작하도록 구성되는 방식