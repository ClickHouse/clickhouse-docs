---
'slug': '/use-cases/observability/clickstack/ingesting-data/opentelemetry'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack을 위한 OpenTelemetry 데이터 수집 - ClickHouse 가시성 스택'
'title': 'OpenTelemetry로 데이터 수집'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'opentelemetry'
- 'traces'
- 'observability'
- 'telemetry'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

All data is ingested into ClickStack via an **OpenTelemetry (OTel) collector** instance, which acts as the primary entry point for logs, metrics, traces, and session data. We recommend using the official [ClickStack distribution](#installing-otel-collector) of the collector for this instance.

Users send data to this collector from [language SDKs](/use-cases/observability/clickstack/sdks) or through data collection agents collecting infrastructure metrics and logs (such OTel collectors in an [agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) role or other technologies e.g. [Fluentd](https://www.fluentd.org/) or [Vector](https://vector.dev/)).

## ClickStack OpenTelemetry 수집기 설치하기 {#installing-otel-collector}

ClickStack OpenTelemetry 수집기는 다음과 같은 대부분의 ClickStack 배포판에 포함됩니다:

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
- [Helm](/use-cases/observability/clickstack/deployment/helm)

### 독립 실행형 {#standalone}

ClickStack OTel 수집기는 스택의 다른 구성 요소와 독립적으로 독립 실행형으로 배포될 수 있습니다.

[HyperDX-only](/use-cases/observability/clickstack/deployment/hyperdx-only) 배포판을 사용하는 경우, ClickHouse로 데이터를 전달할 책임은 사용자에게 있습니다. 이는 다음과 같이 수행할 수 있습니다:

- OpenTelemetry 수집기를 직접 실행하고 ClickHouse를 가리키도록 설정합니다 - 아래를 참조하세요.
- [Vector](https://vector.dev/), [Fluentd](https://www.fluentd.org/) 등과 같은 대체 도구를 사용하여 ClickHouse에 직접 전송하거나 기본 [OTel contrib collector distribution](https://github.com/open-telemetry/opentelemetry-collector-contrib)을 사용할 수 있습니다.

:::note ClickStack OpenTelemetry 수집기 사용을 권장합니다
이렇게 하면 사용자는 표준화된 수집, 강제 스키마 및 HyperDX UI와의 즉시 호환성의 혜택을 누릴 수 있습니다. 기본 스키마를 사용하면 자동 소스 감지 및 사전 구성된 컬럼 매핑이 가능합니다.
:::

자세한 내용은 ["수집기 배포하기"](/use-cases/observability/clickstack/ingesting-data/otel-collector)를 참조하십시오.

## OpenTelemetry 데이터 전송 {#sending-otel-data}

ClickStack으로 데이터를 전송하려면 OpenTelemetry 도구를 OpenTelemetry 수집기가 제공하는 다음 엔드포인트로 지정하십시오:

- **HTTP (OTLP):** `http://localhost:4318`
- **gRPC (OTLP):** `localhost:4317`

대부분의 [language SDKs](/use-cases/observability/clickstack/sdks) 및 OpenTelemetry를 지원하는 텔레메트리 라이브러리에서 사용자는 애플리케이션의 `OTEL_EXPORTER_OTLP_ENDPOINT` 환경 변수를 간단히 설정할 수 있습니다:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

또한 API 수집 키를 포함하는 인증 헤더가 필요합니다. 이 키는 HyperDX 앱의 `팀 설정 → API 키`에서 찾을 수 있습니다.

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

언어 SDK의 경우, 이는 `init` 함수에 의해 설정되거나 `OTEL_EXPORTER_OTLP_HEADERS` 환경 변수를 통해 설정될 수 있습니다. 예를 들어:

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

에이전트는 OTLP 통신을 포함하는 모든 통신에도 이 인증 헤더를 포함해야 합니다. 예를 들어 [OTel 수집기의 contrib 배포판](https://github.com/open-telemetry/opentelemetry-collector-contrib)을 에이전트 역할로 배포하는 경우, OTLP 내보내기를 사용할 수 있습니다. 이 [구조화된 로그 파일](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)을 소비하는 에이전트 구성 예제가 아래에 나와 있습니다. 인증 키를 지정해야 하므로 `<YOUR_API_INGESTION_KEY>`를 확인하십시오.

```yaml

# clickhouse-agent-config.yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
exporters:
  # HTTP setup
  otlphttp/hdx:
    endpoint: 'http://localhost:4318'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip

  # gRPC setup (alternative)
  otlp/hdx:
    endpoint: 'localhost:4317'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
processors:
  batch:
    timeout: 5s
    send_batch_size: 1000
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]
```
