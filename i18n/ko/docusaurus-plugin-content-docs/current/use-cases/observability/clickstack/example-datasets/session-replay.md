---
slug: /use-cases/observability/clickstack/example-datasets/session-replay-demo
title: '세션 리플레이 데모'
sidebar_position: 4
pagination_prev: null
pagination_next: null
description: 'ClickStack 세션 리플레이를 위한 웹 앱 계측 방법을 보여주는 대화형 데모 애플리케이션'
doc_type: 'guide'
keywords: ['clickstack', '세션 리플레이', '브라우저 SDK', '데모', '관측성', '계측']
---

import Image from '@theme/IdealImage';
import api_key from '@site/static/images/clickstack/api-key.png';
import demo_app from '@site/static/images/clickstack/session-replay/demo-app.png';
import session_replay from '@site/static/images/clickstack/session-replay/session-replay.png';
import replay_search from '@site/static/images/clickstack/session-replay/replay-search-view.png';

:::note[TL;DR]
이 가이드는 ClickStack Browser SDK를 사용해 웹 애플리케이션을 세션 리플레이용으로 인스트루먼트하는 방법을 단계별로 설명합니다. 미리 생성된 데이터를 불러오는 다른 샘플 데이터셋과 달리, 이 데모는 사용자의 상호작용을 통해 직접 세션 데이터를 생성하는 인터랙티브 애플리케이션을 제공합니다.

소요 시간: 10-15분
:::


## 개요 \{#overview\}

[세션 리플레이 데모 애플리케이션](https://github.com/ClickHouse/clickstack-session-replay-demo)은 바닐라 JavaScript로 구현된 문서 탐색기입니다. 하나의 스크립트 태그와 한 번의 초기화 호출만으로 모든 사용자 상호작용을 자동으로 캡처할 수 있을 정도로, 세션 리플레이 계측을 얼마나 최소한의 코드로 구현할 수 있는지 보여 줍니다.

이 리포지토리에는 두 개의 브랜치가 포함되어 있습니다.

- **`main`** — 계측이 모두 완료되어 바로 사용할 수 있는 브랜치
- **`pre-instrumented`** — 계측이 아직 추가되지 않은 클린 버전으로, 어디에 계측을 추가해야 하는지 코드 주석으로 표시되어 있는 브랜치

이 가이드는 먼저 `main` 브랜치를 사용하여 세션 리플레이가 실제로 동작하는 것을 살펴본 다음, 동일한 패턴을 애플리케이션에도 적용할 수 있도록 계측 코드를 단계별로 설명합니다.

세션 리플레이가 무엇이며 ClickStack 내에서 어떤 역할을 하는지에 대한 배경 설명은 [Session Replay](/use-cases/observability/clickstack/session-replay) 기능 페이지를 참고하십시오.

## 사전 준비 사항 \{#prerequisites\}

- Docker 및 Docker Compose가 설치되어 있어야 합니다
- 포트 3000, 4317, 4318 및 8080이 사용 가능해야 합니다

## 데모 실행하기 \{#running-the-demo\}

<VerticalStepper headerLevel="h3">

### 리포지토리 클론하기 \{#clone-repository\}

```shell
git clone https://github.com/ClickHouse/clickstack-session-replay-demo
cd clickstack-session-replay-demo
```

### ClickStack 시작하기 \{#start-clickstack\}

```shell
docker-compose up -d clickstack
```

### API key 가져오기 \{#get-api-key\}

1. [http://localhost:8080](http://localhost:8080)에서 HyperDX를 엽니다.
2. 필요하면 계정을 생성하거나 로그인합니다.
3. **Team Settings → API Keys**로 이동합니다.
4. **Ingestion API Key**를 복사합니다.

<Image img={api_key} alt="ClickStack API Key"/>

5. 환경 변수로 설정합니다:

```shell
export CLICKSTACK_API_KEY='your-api-key-here'
```

### 데모 애플리케이션 시작하기 \{#start-demo-app\}

```shell
docker-compose --profile demo up demo-app
```

:::note
`CLICKSTACK_API_KEY` 변수를 export한 것과 동일한 터미널에서 이 명령을 실행해야 합니다.
:::

브라우저에서 [http://localhost:3000](http://localhost:3000)을 연 다음 애플리케이션을 사용해 보십시오. 토픽을 검색하고, 카테고리로 필터링하며, 코드 예제를 보고, 항목을 북마크합니다.

<Image img={demo_app} alt="Session replay demo app"/>

모든 상호작용은 ClickStack Browser SDK에 의해 자동으로 캡처됩니다.

### 세션 리플레이 보기 \{#view-session-replay\}

[http://localhost:8080](http://localhost:8080)의 HyperDX로 돌아가서 왼쪽 사이드바에서 **Client Sessions**로 이동합니다.

<Image img={replay_search} alt="Session replay search"/>

세션 목록에서 각 세션의 지속 시간과 이벤트 수를 확인할 수 있습니다. ▶️ 버튼을 클릭하여 재생합니다.

<Image img={session_replay} alt="Session replay"/>

타임라인에서 세부 수준을 조정하려면 **Highlighted**와 **All Events** 모드 간에 전환합니다.

</VerticalStepper>

## 계측 \{#instrumentation\}

데모 애플리케이션은 세션 리플레이를 활성화하는 데 얼마나 적은 코드만으로도 충분한지 보여줍니다. 애플리케이션에 두 가지만 추가하면 됩니다:

**1. SDK 포함하기 (`app/public/index.html`):**

```html
<script src="https://unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
```

**2. ClickStack 초기화하기 (`app/public/js/app.js`):**

```javascript
window.HyperDX.init({
  url: 'http://localhost:4318',
  apiKey: window.CLICKSTACK_API_KEY,
  service: 'clickhouse-session-replay-demo',
  consoleCapture: true,
  advancedNetworkCapture: true,
});
```

나머지 코드는 모두 일반적인 애플리케이션 코드입니다. SDK는 사용자 상호 작용, 콘솔 로그, 네트워크 요청, 오류를 모두 자동으로 수집하므로 별도의 계측 작업은 필요하지 않습니다.


### 직접 시도해 보기 \{#try-it-yourself\}

애플리케이션을 처음부터 계측하려면 `pre-instrumented` 브랜치로 전환하십시오:

```shell
git checkout pre-instrumented
```

이 브랜치에는 ClickStack 계측이 전혀 없는 동일한 애플리케이션이 포함되어 있습니다. `app/public/index.html` 및 `app/public/js/app.js`의 코드 주석에 위의 두 코드 스니펫을 정확히 어디에 추가해야 하는지 표시되어 있습니다. 코드를 추가한 후 데모 앱을 다시 시작하면 상호 작용이 ClickStack에 나타나기 시작합니다.


## 문제 해결 \{#troubleshooting\}

### HyperDX에 세션이 표시되지 않는 경우 \{#sessions-not-appearing\}

1. 브라우저 콘솔에 오류가 있는지 확인하십시오.
2. ClickStack이 실행 중인지 확인하십시오: `docker-compose ps`
3. API 키가 설정되어 있는지 확인하십시오: `echo $CLICKSTACK_API_KEY`
4. Client Sessions 뷰에서 시간 범위를 조정하십시오 (예: **Last 15 minutes**(최근 15분)을 선택)
5. 브라우저를 강제로 새로 고침하십시오: `Cmd+Shift+R` (Mac) 또는 `Ctrl+Shift+R` (Windows/Linux)

### 401 Unauthorized 오류 \{#401-errors\}

API 키가 올바르게 설정되지 않았습니다. 다음을 확인하십시오:

1. 터미널에서 다음 명령으로 환경 변수로 설정했는지: `export CLICKSTACK_API_KEY='your-key'`
2. 키를 export한 **동일한 터미널**에서 데모 앱을 시작했는지
3. 임의로 생성한 문자열이 아니라 HyperDX UI에서 발급된 키를 사용했는지

## 정리 \{#cleanup\}

서비스를 중지하십시오:

```bash
docker-compose down
```

모든 데이터 삭제:

```bash
docker-compose down -v
```


## 더 알아보기 \{#learn-more\}

- [Session Replay](/use-cases/observability/clickstack/session-replay) — 기능 개요, SDK 옵션, 개인정보 보호 설정
- [Browser SDK Reference](/use-cases/observability/clickstack/sdks/browser) — 전체 SDK 옵션과 고급 구성
- [ClickStack 시작하기](/use-cases/observability/clickstack/getting-started) — ClickStack을 배포하고 처음 데이터를 수집하는 방법
- [모든 샘플 데이터셋](/use-cases/observability/clickstack/sample-datasets) — 기타 예제 데이터셋 및 가이드