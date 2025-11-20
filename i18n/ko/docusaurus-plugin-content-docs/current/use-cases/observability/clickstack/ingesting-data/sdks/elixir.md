---
'slug': '/use-cases/observability/clickstack/sdks/elixir'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 1
'description': 'Elixir SDK for ClickStack - ClickHouse 가시성 스택'
'title': 'Elixir'
'doc_type': 'guide'
'keywords':
- 'Elixir ClickStack SDK'
- 'Elixir observability'
- 'HyperDX Elixir'
- 'Elixir logging SDK'
- 'ClickStack Elixir integration'
---

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 로그</td>
      <td className="pe-2">✖️ 메트릭</td>
      <td className="pe-2">✖️ 트레이스</td>
    </tr>
  </tbody>
</table>
_🚧 OpenTelemetry 메트릭 및 트레이싱 계측 기능이 곧 제공될 예정입니다!_

## 시작하기 {#getting-started}

### ClickStack 로거 백엔드 패키지 설치 {#install-hyperdx-logger-backend-package}

패키지는 `mix.exs`의 종속성 목록에 `hyperdx`를 추가하여 설치할 수 있습니다:

```elixir
def deps do
  [
    {:hyperdx, "~> 0.1.6"}
  ]
end
```

### 로거 구성 {#configure-logger}

다음 내용을 `config.exs` 파일에 추가하세요:

```elixir

# config/releases.exs

config :logger,
  level: :info,
  backends: [:console, {Hyperdx.Backend, :hyperdx}]
```

### 환경 변수 구성 {#configure-environment-variables}

이후 ClickStack에 텔레메트를 전송하기 위해 셸에서 다음 환경 변수를 설정해야 합니다:

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

_`OTEL_SERVICE_NAME` 환경 변수는 HyperDX 앱에서 귀하의 서비스를 식별하는 데 사용되며, 원하시는 이름으로 설정할 수 있습니다._
