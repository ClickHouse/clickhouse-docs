---
slug: /use-cases/observability/clickstack/sdks/elixir
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: 'ClickStack용 Elixir SDK - ClickHouse 관측성 스택'
title: 'Elixir'
doc_type: 'guide'
keywords: ['Elixir ClickStack SDK', 'Elixir 관측성', 'HyperDX Elixir', 'Elixir 로깅 SDK', 'ClickStack Elixir 통합']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 로그</td>
      <td className="pe-2">✖️ 메트릭</td>
      <td className="pe-2">✖️ 트레이스</td>
    </tr>
  </tbody>
</table>

*🚧 OpenTelemetry metrics &amp; tracing 계측 기능이 곧 제공될 예정입니다!*


## 시작하기 \{#getting-started\}

### ClickStack 로거 백엔드 패키지 설치 \{#install-hyperdx-logger-backend-package\}

`mix.exs`의 종속성 목록에 `hyperdx`를 추가하여 패키지를 설치합니다.

```elixir
def deps do
  [
    {:hyperdx, "~> 0.1.6"}
  ]
end
```


### 로거 설정 \{#configure-logger\}

다음을 `config.exs` 파일에 추가하십시오:

```elixir
# config/releases.exs

config :logger,
  level: :info,
  backends: [:console, {Hyperdx.Backend, :hyperdx}]
```


### 환경 변수 구성 \{#configure-environment-variables\}

다음으로 OpenTelemetry collector를 통해 텔레메트리를 ClickStack에 전송하기 위해
셸에서 다음 환경 변수를 설정해야 합니다:

<Tabs groupId="service-type">
<TabItem value="clickstack-managed" label="관리형 ClickStack" default>

```shell
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

</TabItem>

<TabItem value="clickstack-oss" label="ClickStack 오픈 소스" >

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

</TabItem>
</Tabs>

_`OTEL_SERVICE_NAME` 환경 변수는 HyperDX 앱에서 서비스를 식별하는 데 사용되며,
원하는 이름을 아무거나 사용할 수 있습니다._