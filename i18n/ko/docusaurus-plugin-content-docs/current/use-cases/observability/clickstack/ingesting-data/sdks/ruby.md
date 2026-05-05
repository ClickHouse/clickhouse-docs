---
slug: /use-cases/observability/clickstack/sdks/ruby-on-rails
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'ClickStack용 Ruby on Rails SDK - ClickHouse 관측성 스택'
title: 'Ruby on Rails'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', '로깅', '통합', '애플리케이션 모니터링']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

이 가이드는 다음을 통합합니다:

<table>
  <tbody>
    <tr>
      <td className="pe-2">✖️ 로그</td>
      <td className="pe-2">✖️ ️️메트릭</td>
      <td className="pe-2">✅ 트레이스</td>
    </tr>
  </tbody>
</table>

*로그를 ClickStack으로 전송하려면 [OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)를 통해 전송하십시오.*


## 시작하기 \{#getting-started\}

### OpenTelemetry 패키지 설치 \{#install-otel-packages\}

다음 명령으로 OpenTelemetry 패키지를 설치합니다.

```shell
bundle add opentelemetry-sdk opentelemetry-instrumentation-all opentelemetry-exporter-otlp
```


### OpenTelemetry + 로거 포맷터 구성 \{#configure-otel-logger-formatter\}

다음으로 OpenTelemetry 트레이싱 계측을 초기화하고, Rails 로거의 로그 메시지
포맷터를 구성하여 로그가 자동으로 트레이스와 연관되도록 해야 합니다.
사용자 정의 포맷터가 없으면 로그가 ClickStack 내에서 서로 자동으로 연관되지 않습니다.

`config/initializers` 폴더에 `hyperdx.rb`라는 파일을 만들고 다음 내용을
추가하십시오:

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


### 환경 변수 구성 \{#configure-environment-variables\}

이후 OpenTelemetry collector를 통해 ClickStack으로 텔레메트리를 전송하기 위해 셸에서 다음 환경 변수를 설정해야 합니다:

<Tabs groupId="service-type">
<TabItem value="clickstack-managed" label="Managed ClickStack" default>

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
```

</TabItem>

<TabItem value="clickstack-oss" label="ClickStack Open Source" >

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

</TabItem>
</Tabs>

_`OTEL_SERVICE_NAME` 환경 변수는 HyperDX 앱에서 서비스를 식별하는 데 사용되며,
원하는 이름을 자유롭게 사용할 수 있습니다._

`OTEL_EXPORTER_OTLP_HEADERS` 환경 변수에는 HyperDX 앱의 `Team Settings → API Keys`에서 확인할 수 있는 API Key가 포함됩니다.