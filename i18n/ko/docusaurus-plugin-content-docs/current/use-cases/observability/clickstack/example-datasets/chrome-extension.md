---
slug: /use-cases/observability/clickstack/example-datasets/chrome-extension
title: 'Chrome 확장 프로그램'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: 'HyperDX Chrome 확장 프로그램을 사용해 모든 웹사이트에서 ClickStack 세션 리플레이와 RUM을 계측합니다'
doc_type: 'guide'
keywords: ['ClickStack', 'Chrome 확장 프로그램', '세션 리플레이', '브라우저 SDK', 'RUM', '관측성', 'HyperDX']
---

import Image from '@theme/IdealImage';
import extension_config from '@site/static/images/clickstack/chrome-extension/extension-config.png';

:::note[요약]
이 가이드에서는 [HyperDX Chrome 확장 프로그램](https://github.com/kyreddie/hyperdx-chrome-extension)을 사용해 ClickStack Browser SDK를 모든 웹사이트에 주입하는 방법을 설명합니다. 대상 애플리케이션의 소스 코드를 변경할 필요는 없습니다. 확장 프로그램을 한 번만 설정한 다음 사이트를 탐색하면 ClickStack에서 세션 리플레이를 확인할 수 있습니다.

소요 시간: 10-15분
:::

## 개요 \{#overview\}

[HyperDX Chrome 확장 프로그램](https://github.com/kyreddie/hyperdx-chrome-extension)은 방문하는 페이지에 [@hyperdx/browser](https://github.com/hyperdxio/hyperdx-js) SDK를 주입합니다. 이 확장 기능은 코드베이스를 수정하지 않고도 사이트에서 세션 리플레이, RUM 또는 트레이스 전파를 디버깅해야 할 때 유용합니다. 예를 들어 서드파티 애플리케이션, 프로덕션 빌드 또는 엄격한 Content Security Policy(CSP)가 적용된 로컬 개발 서버에서 활용할 수 있습니다.

SDK는 확장 기능 내부에 번들로 포함되어 있으므로(~480 KB) 페이지가 런타임에 CDN에서 스크립트를 로드할 필요가 없습니다. 확장 기능은 먼저 외부 `chrome-extension://` 스크립트 주입을 시도하고, CSP가 확장 기능 출처의 스크립트를 차단하면 인라인 주입으로 대체합니다.

제어할 수 있는 데모 애플리케이션에 계측을 적용하는 [Session Replay Demo](session-replay.md)와 달리, 이 방식은 Chrome에서 여는 **모든** URL에서 작동합니다. 일반 사용자처럼 사이트와 상호작용하면 세션 데이터가 생성됩니다.

세션 리플레이의 배경과 이것이 ClickStack에서 어떤 역할을 하는지 알아보려면 [Session Replay](/use-cases/observability/clickstack/session-replay) 기능 페이지를 참조하십시오.

## 사전 준비 사항 \{#prerequisites\}

* Google Chrome 또는 Chromium 기반 브라우저(Edge, Brave 등)
* ClickStack을 로컬에서 실행하는 경우 [Docker](https://docs.docker.com/get-docker/)가 설치되어 있어야 합니다
* 포트 4317, 4318, 8080을 사용할 수 있어야 합니다(로컬 ClickStack용)

## 데모 실행하기 \{#running-the-demo\}

<VerticalStepper headerLevel="h3">
  ### 확장 기능 리포지토리 복제하기 \{#clone-extension\}

  ```shell
  git clone https://github.com/kyreddie/hyperdx-chrome-extension
  cd hyperdx-chrome-extension
  ```

  ### 확장 기능 설치하기 \{#install-extension\}

  1. Chrome을 열고 `chrome://extensions`로 이동합니다.
  2. **개발자 모드**를 켭니다(오른쪽 상단).
  3. **압축해제된 확장 프로그램을 로드합니다**를 클릭합니다.
  4. 복제한 `hyperdx-chrome-extension` 디렉터리를 선택합니다.

  확장 기능이 도구 모음에 **HyperDX Browser Extension**으로 표시됩니다.

  ### ClickStack 시작하기 \{#start-clickstack\}

  이미 ClickStack 또는 HyperDX 수집 endpoint가 있으면 [확장 기능 구성하기](#configure-extension)로 건너뛰십시오.

  로컬 ClickStack 스택에서는 OpenTelemetry collector를 시작합니다. `{{CLICKHOUSE_ENDPOINT}}` 및 `{{CLICKHOUSE_PASSWORD}}`를 ClickHouse 연결 정보로 바꾸십시오:

  ```shell
  export CLICKHOUSE_ENDPOINT={{CLICKHOUSE_ENDPOINT}}
  export CLICKHOUSE_PASSWORD={{CLICKHOUSE_PASSWORD}}

  docker run \
    -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
    -e CLICKHOUSE_USER=default \
    -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
    -p 8080:8080 \
    -p 4317:4317 \
    -p 4318:4318 \
    clickhouse/clickstack-otel-collector:latest
  ```

  UI가 실행 중인지 확인하려면 [http://localhost:8080](http://localhost:8080)에서 HyperDX를 엽니다.

  ClickHouse 및 HyperDX UI를 포함한 전체 로컬 배포 방법은 [ClickStack 시작하기](/use-cases/observability/clickstack/getting-started/oss)를 참조하십시오.

  ### API Key 가져오기 \{#get-api-key\}

  로컬 ClickStack에서는 API Key가 필요하지 않을 수 있습니다. `http://localhost:4318`의 자체 호스팅 collector로 telemetry를 보낼 경우 확장 기능에서 이 필드를 비워 두십시오.

  ClickStack Cloud 또는 HyperDX Cloud로 수집하는 경우 HyperDX를 열고 **Team Settings → API Keys**로 이동한 다음 **Ingestion API Key**를 복사합니다.

  ### 확장 기능 구성하기 \{#configure-extension\}

  Chrome 도구 모음에서 **HyperDX Browser Extension** 아이콘을 클릭한 다음 설정을 입력합니다:

  | 필드                               | 로컬 ClickStack 예시                      | 참고                                                               |
  | -------------------------------- | ------------------------------------- | ---------------------------------------------------------------- |
  | **Enable HyperDX Monitoring**    | On                                    | 주입을 제어하는 기본 토글                                                   |
  | **Service Name**                 | `my-frontend-app`                     | 필수 — ClickStack에서 서비스를 식별합니다                                     |
  | **API Key**                      | *(비어 있음)*                             | Cloud 수집에는 필수이며, 일부 자체 호스팅 환경에서는 선택 사항입니다                        |
  | **Collector URL**                | `http://localhost:4318`               | OTLP HTTP endpoint이며, Cloud 기본값은 `https://in-otel.hyperdx.io`입니다 |
  | **Environment**                  | `development`                         | 선택 사항 — `deployment.environment` 리소스 속성을 설정합니다                   |
  | **Trace Propagation Targets**    | `/api\.myapp\.domain/i, /localhost/i` | 선택 사항 — trace header 전파를 위한 쉼표로 구분된 JavaScript regex 패턴입니다       |
  | **Only inject on matching URLs** | Off                                   | 계측할 사이트를 제한하려면 켭니다                                               |
  | **Capture console logs**         | Off                                   | 브라우저 콘솔 출력을 전달하려면 켭니다                                            |
  | **Advanced network capture**     | Off                                   | 자세한 네트워크 요청 수집을 위해 켭니다                                           |

  **Save Configuration**을 클릭한 다음, 계측하려는 탭을 새로고침합니다.

  <Image img={extension_config} alt="로컬 ClickStack 설정이 표시된 HyperDX Chrome 확장 기능 구성 팝업" size="sm" />

  위 스크린샷은 일반적인 로컬 설정을 보여줍니다. 모니터링이 활성화되어 있고, 서비스 이름이 설정되어 있으며, collector가 `http://localhost:4318`을 가리키고 있고, trace 전파는 API 및 localhost URL로 제한됩니다.

  ### 사이트를 탐색하고 session 생성하기 \{#browse-site\}

  Chrome에서 웹사이트나 로컬 애플리케이션을 엽니다. 예를 들어 프런트엔드 개발 서버라면 [http://localhost:3000](http://localhost:3000)을 사용할 수 있습니다.

  평소처럼 페이지와 상호작용합니다. 링크를 클릭하고, 양식을 제출하고, 오류를 발생시키고, 화면 간에 이동합니다. 구성이 올바르면 확장 기능이 페이지를 로드할 때마다 Browser SDK를 자동으로 주입합니다.

  ### 세션 리플레이 보기 \{#view-session-replay\}

  [http://localhost:8080](http://localhost:8080)에서 HyperDX로 돌아가 왼쪽 사이드바의 **Client Sessions**로 이동합니다.

  duration과 이벤트 수가 표시된 session이 목록에 나타나야 합니다. 재생하려면 ▶️ 버튼을 클릭합니다.

  타임라인의 세부 수준을 조정하려면 **Highlighted** 모드와 **All Events** 모드 사이를 전환합니다.
</VerticalStepper>

## URL 필터링 \{#url-filtering\}

기본적으로 모니터링이 활성화되어 있으면 확장 기능은 방문하는 모든 페이지에 SDK를 주입합니다. 특정 사이트에만 주입되도록 제한하려면 **일치하는 URL에만 주입**을 켜고 패턴을 한 줄에 하나씩 추가하십시오(또는 쉼표로 구분):

| 패턴                         | 일치 대상                          |
| -------------------------- | ------------------------------ |
| `http://homedepot.com/*`   | `homedepot.com`에서 HTTP만        |
| `*://homedepot.com/*`      | `homedepot.com`에서 HTTP 및 HTTPS |
| `*://*.homedepot.com/*`    | `www.homedepot.com`과 같은 하위 도메인 |
| `https://localhost:3000/*` | 포트 3000의 로컬 개발 서버              |

URL 패턴을 저장한 후 탭을 새로고침하십시오.

## 주입 확인 \{#verify-injection\}

모니터링 중인 페이지에서 DevTools를 열고(**Console** 탭) 페이지를 새로고침한 다음, 다음 사항을 확인합니다:

```text
[HyperDX Extension] Configuration valid, injecting HyperDX
[HyperDX Extension] Injected via extension scripts
[HyperDX Extension] HyperDX initialized
```

확장 프로그램에서 제공된 스크립트가 CSP에 의해 차단되면, 확장 프로그램은 폴백 메시지를 남기고 인라인 삽입으로 다시 시도합니다.

## 문제 해결 \{#troubleshooting\}

<details>
  <summary>HyperDX에 세션이 표시되지 않음</summary>

  1. 브라우저 콘솔에서 `[HyperDX Extension]` 로그 메시지나 오류를 확인합니다
  2. **Enable HyperDX Monitoring**이 켜져 있고 **Service Name**이 설정되어 있는지 확인합니다
  3. ClickStack이 실행 중이고 collector URL이 올바른지 확인합니다(예: `http://localhost:4318`)
  4. Client Sessions 보기에서 시간 범위를 조정합니다(**Last 15 minutes** 시도)
  5. 브라우저를 강력 새로고침합니다: `Cmd+Shift+R` (Mac) 또는 `Ctrl+Shift+R` (Windows/Linux)
</details>

<details>
  <summary>`chrome-extension://invalid/` 오류 </summary>

  `chrome://extensions`에서 확장 프로그램을 다시 로드한 다음 탭을 강력 새로고침합니다. 탭이 아직 열려 있는 상태에서 확장 프로그램이 업데이트되거나 다시 로드되면 이 문제가 발생합니다.
</details>

<details>
  <summary>사이트에 주입되지 않음</summary>

  1. 모니터링이 활성화되어 있고 서비스 이름이 설정되어 있는지 확인합니다
  2. **Only inject on matching URLs**가 켜져 있다면 현재 페이지 URL이 패턴 중 하나와 일치하는지 확인합니다
  3. 일부 사이트는 CSP를 통해 확장 프로그램 출처와 인라인 스크립트 주입을 모두 차단하므로, 해당 페이지에서는 주입이 불가능할 수 있습니다
  4.
</details>

<details>
  <summary>콘솔에 `HyperDX: Missing apiKey`가 표시됨 </summary>

  API key 필드가 비어 있으면 예상되는 동작입니다. Cloud endpoint를 사용하는 경우 HyperDX에서 수집 API key를 추가하거나, 자체 호스팅 collector가 인증되지 않은 로컬 트래픽을 허용한다면 무시합니다.
</details>

## 개인정보 보호 \{#privacy\}

이 확장 기능은 방문한 페이지에 관측성 관련 코드를 삽입합니다. 디버깅이 허용된 사이트에서만 사용하십시오. API Key를 공유하거나 버전 관리 시스템에 커밋하지 마십시오.

## 자세히 알아보기 \{#learn-more\}

* [세션 리플레이](/use-cases/observability/clickstack/session-replay) — 기능 개요, SDK 옵션, 개인정보 보호 제어
* [브라우저 SDK 참고](/use-cases/observability/clickstack/sdks/browser) — 전체 SDK 옵션 및 고급 구성
* [세션 리플레이 데모](session-replay.md) — 소스 코드로 데모 애플리케이션 계측하기
* [ClickStack 시작하기](/use-cases/observability/clickstack/getting-started) — ClickStack를 배포하고 첫 데이터를 수집하기
* [GitHub의 HyperDX Chrome 확장 프로그램](https://github.com/kyreddie/hyperdx-chrome-extension) — 소스 코드 및 이슈 추적기