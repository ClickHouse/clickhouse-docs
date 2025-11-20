---
'slug': '/use-cases/observability/clickstack/sdks/ruby-on-rails'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 7
'description': '루비 온 레일스 SDK for ClickStack - ClickHouse 관측 스택'
'title': '루비 온 레일스'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'sdk'
- 'logging'
- 'integration'
- 'application monitoring'
---

This guide integrates:

<table>
  <tbody>
    <tr>
      <td className="pe-2">✖️ 로그</td>
      <td className="pe-2">✖️ 메트릭스</td>
      <td className="pe-2">✅ 트레이스</td>
    </tr>
  </tbody>
</table>

_로그를 ClickStack에 전송하려면 [OpenTelemetry 수집기](/use-cases/observability/clickstack/ingesting-data/otel-collector)를 통해 로그를 전송해 주세요._

## 시작하기 {#getting-started}

### OpenTelemetry 패키지 설치 {#install-otel-packages}

다음 명령어를 사용하여 OpenTelemetry 패키지를 설치합니다.

```shell
bundle add opentelemetry-sdk opentelemetry-instrumentation-all opentelemetry-exporter-otlp
```

### OpenTelemetry + 로거 포맷터 구성 {#configure-otel-logger-formatter}

다음으로 OpenTelemetry 추적 계측을 초기화하고 로그 메시지 포맷터를 Rails 로거에 설정하여 로그가 자동으로 트레이스에 연결될 수 있도록 해야 합니다. 커스텀 포맷터가 없으면 ClickStack에서 로그가 자동으로 상관관계가 형성되지 않습니다.

`config/initializers` 폴더에 `hyperdx.rb`라는 파일을 만들고 다음 내용을 추가합니다:

```ruby

# config/initializers/hyperdx.rb

require 'opentelemetry-exporter-otlp'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry/sdk'

OpenTelemetry::SDK.configure do |c|
  c.use_all() # enables all trace instrumentation!
end

Rails.application.configure do
  Rails.logger = Logger.new(STDOUT)
  # Rails.logger.log_level = Logger::INFO # default is DEBUG, but you might want INFO or above in production
  Rails.logger.formatter = proc do |severity, time, progname, msg|
    span_id = OpenTelemetry::Trace.current_span.context.hex_span_id
    trace_id = OpenTelemetry::Trace.current_span.context.hex_trace_id
    if defined? OpenTelemetry::Trace.current_span.name
      operation = OpenTelemetry::Trace.current_span.name
    else
      operation = 'undefined'
    end

    { "time" => time, "level" => severity, "message" => msg, "trace_id" => trace_id, "span_id" => span_id,
      "operation" => operation }.to_json + "\n"
  end

  Rails.logger.info "Logger initialized !! 🐱"
end
```

### 환경 변수 구성 {#configure-environment-variables}

그 다음 ClickStack으로 원격 측정을 전송하기 위해 셸에서 다음 환경 변수를 구성해야 합니다:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

_`OTEL_SERVICE_NAME` 환경 변수는 HyperDX 앱에서 서비스를 식별하는 데 사용되며 원하는 이름으로 설정할 수 있습니다._

`OTEL_EXPORTER_OTLP_HEADERS` 환경 변수는 `팀 설정 → API 키`에서 HyperDX 앱을 통해 제공되는 API 키를 포함합니다.
