---
'slug': '/use-cases/observability/clickstack/ingesting-data/otel-collector'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack을 위한 OpenTelemetry collector - ClickHouse 관찰 가능성 스택'
'sidebar_label': 'OpenTelemetry collector'
'title': 'ClickStack OpenTelemetry Collector'
'doc_type': 'guide'
'keywords':
- 'ClickStack'
- 'OpenTelemetry collector'
- 'ClickHouse observability'
- 'OTel collector configuration'
- 'OpenTelemetry ClickHouse'
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import clickstack_with_gateways from '@site/static/images/use-cases/observability/clickstack-with-gateways.png';
import clickstack_with_kafka from '@site/static/images/use-cases/observability/clickstack-with-kafka.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

이 페이지에서는 공식 ClickStack OpenTelemetry (OTel) 수집기의 구성 세부정보를 포함합니다.

## 수집기 역할 {#collector-roles}

OpenTelemetry 수집기는 두 가지 주요 역할로 배포될 수 있습니다:

- **에이전트** - 에이전트 인스턴스는 서버나 Kubernetes 노드와 같은 엣지에서 데이터를 수집하거나 OpenTelemetry SDK로 계측된 애플리케이션에서 직접 이벤트를 수신합니다. 후자의 경우, 에이전트 인스턴스는 애플리케이션과 함께 또는 애플리케이션과 같은 호스트(예: 사이드카 또는 DaemonSet)에서 실행됩니다. 에이전트는 데이터를 ClickHouse로 직접 전송하거나 게이트웨이 인스턴스로 보낼 수 있습니다. 전자의 경우, 이것은 [에이전트 배포 패턴](https://opentelemetry.io/docs/collector/deployment/agent/)이라고 합니다.

- **게이트웨이** - 게이트웨이 인스턴스는 클러스터, 데이터 센터 또는 지역별로 일반적으로 독립형 서비스(예: Kubernetes의 배포)를 제공합니다. 이러한 인스턴스는 단일 OTLP 엔드포인트를 통해 애플리케이션(또는 에이전트 역할의 다른 수집기)에서 이벤트를 수신합니다. 일반적으로는 게이트웨이 인스턴스 세트를 배포하고, 기본 제공 로드 밸런서를 사용하여 부하를 분산합니다. 모든 에이전트와 애플리케이션이 이 단일 엔드포인트에 신호를 전송하는 경우, 이는 종종 [게이트웨이 배포 패턴](https://opentelemetry.io/docs/collector/deployment/gateway/)이라고 합니다.

**중요: ClickStack의 기본 배포를 포함한 수집기는 아래에 설명된 [게이트웨이 역할](#collector-roles)을 가정하고, 에이전트 또는 SDK로부터 데이터를 수신합니다.**

에이전트 역할로 OTel 수집기를 배포하는 사용자는 일반적으로 [수집기의 기본 contrib 배포판](https://github.com/open-telemetry/opentelemetry-collector-contrib)을 사용하고 ClickStack 버전을 사용하지 않지만, [Fluentd](https://www.fluentd.org/) 및 [Vector](https://vector.dev/)와 같은 다른 OTLP 호환 기술을 자유롭게 사용할 수 있습니다.

## 수집기 배포 {#configuring-the-collector}

자체적으로 OpenTelemetry 수집기를 독립형 배포로 관리하는 경우, HyperDX 전용 배포를 사용할 경우 [가능한 경우 ClickStack 수집기의 공식 배포를 사용하는 것이 좋습니다](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector). 그러나 직접 가져오는 경우 [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)가 포함되어 있는지 확인하십시오.

### 독립형 {#standalone}

독립형 모드에서 OTel 커넥터의 ClickStack 배포를 배포하려면, 다음의 도커 명령을 실행하십시오:

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

`CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USERNAME`, 및 `CLICKHOUSE_PASSWORD`의 환경 변수를 통해 대상 ClickHouse 인스턴스를 덮어쓸 수 있습니다. `CLICKHOUSE_ENDPOINT`는 프로토콜과 포트를 포함한 전체 ClickHouse HTTP 엔드포인트여야 합니다. 예를 들어, `http://localhost:8123`입니다.

**이러한 환경 변수는 커넥터를 포함한 모든 도커 배포와 함께 사용할 수 있습니다.**

`OPAMP_SERVER_URL`은 HyperDX 배포를 가리켜야 합니다. 예를 들어, `http://localhost:4320`입니다. HyperDX는 기본적으로 포트 4320에서 `/v1/opamp`에 OpAMP(Open Agent Management Protocol) 서버를 노출합니다. HyperDX를 실행 중인 컨테이너에서 이 포트를 노출하도록 하십시오(예: `-p 4320:4320` 사용).

:::note OpAMP 포트 노출 및 연결
수집기가 OpAMP 포트에 연결하려면 HyperDX 컨테이너에서 포트가 노출되어야 합니다. 예를 들어 `-p 4320:4320`입니다. 로컬 테스트의 경우, OSX 사용자는 `OPAMP_SERVER_URL=http://host.docker.internal:4320`를 설정할 수 있습니다. Linux 사용자는 `--network=host`로 수집기 컨테이너를 시작할 수 있습니다.
:::

사용자는 프로덕션에서 [적절한 자격 증명](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)을 갖춘 사용자를 사용해야 합니다.

### 구성 수정 {#modifying-otel-collector-configuration}

#### 도커 사용 {#using-docker}

OpenTelemetry 수집기를 포함하는 모든 도커 이미지는 환경 변수 `OPAMP_SERVER_URL`, `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USERNAME` 및 `CLICKHOUSE_PASSWORD`를 통해 ClickHouse 인스턴스를 사용하도록 구성할 수 있습니다:

예를 들어, 올인원 이미지:

```shell
export OPAMP_SERVER_URL=<OPAMP_SERVER_URL>
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

#### Docker Compose {#docker-compose-otel}

Docker Compose를 사용할 때 위와 동일한 환경 변수를 사용하여 수집기 구성을 수정하십시오:

```yaml
otel-collector:
  image: hyperdx/hyperdx-otel-collector
  environment:
    CLICKHOUSE_ENDPOINT: 'https://mxl4k3ul6a.us-east-2.aws.clickhouse-staging.com:8443'
    HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
    CLICKHOUSE_USER: 'default'
    CLICKHOUSE_PASSWORD: 'password'
    OPAMP_SERVER_URL: 'http://app:${HYPERDX_OPAMP_PORT}'
  ports:
    - '13133:13133' # health_check extension
    - '24225:24225' # fluentd receiver
    - '4317:4317' # OTLP gRPC receiver
    - '4318:4318' # OTLP http receiver
    - '8888:8888' # metrics extension
  restart: always
  networks:
    - internal
```

### 고급 구성 {#advanced-configuration}

ClickStack 배포의 OTel 수집기는 사용자 정의 구성 파일을 탑재하고 환경 변수를 설정하여 기본 구성을 확장하는 것을 지원합니다. 사용자 정의 구성은 OpAMP를 통해 HyperDX가 관리하는 기본 구성과 병합됩니다.

#### 수집기 구성 확장 {#extending-collector-config}

사용자 정의 수신기, 프로세서 또는 파이프라인을 추가하려면:

1. 추가 구성을 포함하는 사용자 정의 구성 파일을 만듭니다.
2. 해당 파일을 `/etc/otelcol-contrib/custom.config.yaml`에 탑재합니다.
3. 환경 변수를 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`로 설정합니다.

**예시 사용자 정의 구성:**

```yaml
receivers:
  # Collect logs from local files
  filelog:
    include:
      - /var/log/**/*.log
      - /var/log/syslog
      - /var/log/messages
    start_at: beginning

  # Collect host system metrics
  hostmetrics:
    collection_interval: 30s
    scrapers:
      cpu:
        metrics:
          system.cpu.utilization:
            enabled: true
      memory:
        metrics:
          system.memory.utilization:
            enabled: true
      disk:
      network:
      filesystem:
        metrics:
          system.filesystem.utilization:
            enabled: true

service:
  pipelines:
    # Logs pipeline
    logs/host:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse

    # Metrics pipeline
    metrics/hostmetrics:
      receivers: [hostmetrics]
      processors:
        - memory_limiter
        - batch
      exporters:
        - clickhouse
```

**올인원 이미지로 배포:**
```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

**독립형 수집기로 배포:**
```bash
docker run -d \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

:::note
사용자 정의 구성에 새로운 수신기, 프로세서 및 파이프라인만 정의합니다. 기본 프로세서(`memory_limiter`, `batch`) 및 내보내기(`clickhouse`)는 이미 정의되어 있습니다. 이름으로 참조하십시오. 사용자 정의 구성은 기본 구성과 병합되며 기존 구성 요소를 덮어쓸 수 없습니다.
:::

더 복잡한 구성을 위해서는 [기본 ClickStack 수집기 구성](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml)과 [ClickHouse exporter 문서](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)를 참조하십시오.

#### 구성 구조 {#configuration-structure}

수신기([`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/)), 연산자([`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)), 및 프로세서([`processors`](https://opentelemetry.io/docs/collector/configuration/#processors))를 포함하여 OTel 수집기를 구성하는 방법에 대한 자세한 내용은 [공식 OpenTelemetry 수집기 문서](https://opentelemetry.io/docs/collector/configuration)를 추천합니다.

## 수집기 보안 {#securing-the-collector}

ClickStack 배포의 OpenTelemetry 수집기는 OpAMP(Open Agent Management Protocol)에 대한 기본 지원을 포함하고 있으며, 이를 사용하여 OTLP 엔드포인트를 안전하게 구성하고 관리합니다. 시작 시 사용자는 `OPAMP_SERVER_URL` 환경 변수를 제공해야 하며, 이는 OpAMP API가 `/v1/opamp`에서 호스팅되는 HyperDX 앱을 가리켜야 합니다.

이 통합은 HyperDX 앱이 배포될 때 생성된 자동 생성된 인제스트 API 키를 사용하여 OTLP 엔드포인트가 안전하게 보호되도록 보장합니다. 수집기로 전송되는 모든 텔레메트리 데이터는 인증을 위해 이 API 키를 포함해야 합니다. 키는 HyperDX 앱의 `팀 설정 → API 키`에서 찾을 수 있습니다.

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

배포를 추가로 안전하게 하려면 다음을 권장합니다:

- 수집기가 ClickHouse와 HTTPS를 통해 통신하도록 구성합니다.
- 권한이 제한된 인제스트 전용 사용자를 생성합니다 - 아래를 참조하십시오.
- OTLP 엔드포인트의 TLS를 활성화하여 SDK/에이전트와 수집기 간의 암호화된 통신을 보장합니다. 이는 [사용자 정의 수집기 구성](#extending-collector-config)을 통해 구성할 수 있습니다.

### 인제스트 사용자 생성 {#creating-an-ingestion-user}

ClickHouse로 인제스트하기 위해 OTel 수집기에 전용 데이터베이스 및 사용자를 만드는 것이 좋습니다. 이 사용자는 [ClickStack에 의해 생성되고 사용되는 테이블](https://use-cases/observability/clickstack/ingesting-data/schemas)에 생성 및 삽입할 수 있어야 합니다.

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

이는 수집기가 데이터베이스 `otel`을 사용하도록 구성되었다고 가정합니다. 이는 환경 변수 `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`를 통해 제어할 수 있습니다. 이를 수집기를 호스팅하는 이미지에 [기타 환경 변수와 유사하게](#modifying-otel-collector-configuration) 전달하십시오.

## 처리 - 필터링, 변환 및 보강 {#processing-filtering-transforming-enriching}

사용자는 인제스트하는 동안 이벤트 메시지를 필터링, 변환 및 보강하고자 할 것입니다. ClickStack 커넥터의 구성은 수정할 수 없으므로, 추가 이벤트 필터링 및 처리가 필요한 사용자는 아래의 두 가지 방법을 권장합니다:

- 필터링 및 처리 기능을 수행하는 OTel 수집기의 자체 버전을 배포하고 ClickHouse로 인제스트하기 위해 ClickStack 수집기로 이벤트를 OTLP를 통해 전송합니다.
- OTel 수집기의 자체 버전을 배포하고 ClickHouse exporter를 사용하여 직접 ClickHouse로 이벤트를 전송합니다.

OTel 수집기를 사용하여 처리를 수행하는 경우, 게이트웨이 인스턴스에서 변환을 처리하고 에이전트 인스턴스에서 수행되는 작업을 최소화하는 것이 좋습니다. 이를 통해 서버에서 실행되는 에지의 에이전트에 필요한 리소스를 최소화할 수 있습니다. 일반적으로 사용자는 불필요한 네트워크 사용을 최소화하기 위해 필터링을 수행하고(timestamp 설정(연산자 사용)과 함께) 에이전트에서 컨텍스트를 필요로 하는 보강 작업만 수행합니다. 예를 들어, 게이트웨이 인스턴스가 다른 Kubernetes 클러스터에 위치할 경우, k8s 보강 작업은 에이전트에서 수행해야 합니다.

OpenTelemetry는 사용자가 활용할 수 있는 다음과 같은 처리 및 필터링 기능을 지원합니다:

- **프로세서** - 프로세서는 [수신기에 의해 수집된 데이터를 수정하거나 변환](https://opentelemetry.io/docs/collector/transforming-telemetry/)하여 내보내기 전에 보냅니다. 프로세서는 수집기 구성의 `processors` 섹션에 구성된 대로 순서대로 적용됩니다. 이는 선택 사항이지만, 최소 세트는 [일반적으로 권장되는](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors) 것입니다. ClickHouse와 함께 OTel 수집기를 사용할 때, 프로세서를 다음과 같이 제한하는 것이 좋습니다:

- [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)는 수집기에서 메모리 부족 상황을 방지합니다. 권장 사항에 대한 [리소스 추정](#estimating-resources)을 참조하십시오.
- 컨텍스트 기반 보강을 수행하는 프로세서. 예를 들어, [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)는 k8s 메타데이터를 사용하여 스팬, 메트릭 및 로그 리소스 속성을 자동으로 설정할 수 있습니다. 이는 이벤트에 출처 pod ID를 보강하는 데 유용합니다.
- 추적에 필요할 경우 [끝 또는 머리 샘플링](https://opentelemetry.io/docs/concepts/sampling/)을 수행합니다.
- [기본 필터링](https://opentelemetry.io/docs/collector/transforming-telemetry/) - 연산자를 통해 이 작업이 수행될 수 없는 경우 필요 없는 이벤트를 삭제합니다.
- [배치 처리](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - ClickHouse와 작업할 때 매우 중요하여 데이터가 배치로 전송되도록 보장합니다. ["삽입 최적화"](#optimizing-inserts)를 참조하십시오.

- **연산자** - [연산자](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)는 수신기에서 사용 가능한 가장 기본적인 처리 단위를 제공합니다. 기본 분석이 지원되며, 필드(예: Severity 및 Timestamp)를 설정할 수 있습니다. 여기서는 JSON 및 정규 표현식 분석과 함께 이벤트 필터링 및 기본 변환이 지원됩니다. 이곳에서 이벤트 필터링을 수행하는 것이 좋습니다.

사용자는 연산자 또는 [변환 프로세서](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md)를 사용하여 과도한 이벤트 처리를 수행하는 것을 피해야 합니다. 이는 상당한 메모리 및 CPU 오버헤드를 유발할 수 있습니다, 특히 JSON 분석에서 그렇습니다. 특정 예외를 제외하고, 물리화된 뷰 및 열을 사용하여 ClickHouse에서 삽입 시간에 모든 처리를 수행할 수 있습니다. 더 자세한 내용은 [SQL을 사용한 구조 추출](/use-cases/observability/schema-design#extracting-structure-with-sql)을 참조하십시오.

### 예시 {#example-processing}

다음 구성은 이 [비구조화 로그 파일](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)의 수집을 보여줍니다. 이 구성은 ClickStack 게이트웨이에 데이터를 전송하는 에이전트 역할의 수집기에서 사용될 수 있습니다.

로그 라인에서 구조를 추출하고(`regex_parser`) 이벤트를 필터링하며, 이벤트를 배치하고 메모리 사용을 제한하기 위한 프로세서 사용에 주의하십시오.

```yaml file=code_snippets/ClickStack/config-unstructured-logs-with-processor.yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-unstructured.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P<ip>[\d.]+)\s+-\s+-\s+\[(?P<timestamp>[^\]]+)\]\s+"(?P<method>[A-Z]+)\s+(?P<url>[^\s]+)\s+HTTP/[^\s]+"\s+(?P<status>\d+)\s+(?P<size>\d+)\s+"(?P<referrer>[^"]*)"\s+"(?P<user_agent>[^"]*)"'
        timestamp:
          parse_from: attributes.timestamp
          layout: '%d/%b/%Y:%H:%M:%S %z'
          #22/Jan/2019:03:56:14 +0330
processors:
  batch:
    timeout: 1s
    send_batch_size: 100
  memory_limiter:
    check_interval: 1s
    limit_mib: 2048
    spike_limit_mib: 256
exporters:
  # HTTP setup
  otlphttp/hdx:
    endpoint: 'http://localhost:4318'
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    compression: gzip

  # gRPC setup (alternative)
  otlp/hdx:
    endpoint: 'localhost:4317'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
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

모든 OTLP 통신에서 [인증 헤더를 포함하여 인제스트 API 키를 포함해야 하는 필요성](#securing-the-collector)에 유의하십시오.

더 고급 구성에 대해서는 [OpenTelemetry 수집기 문서](https://opentelemetry.io/docs/collector/)를 참고하십시오.

## 삽입 최적화 {#optimizing-inserts}

강력한 일관성 보장을 얻으면서 높은 삽입 성능을 달성하기 위해, 사용자는 ClickHouse로 ClickStack 수집기를 통해 관찰 가능성 데이터를 삽입할 때 간단한 규칙을 준수해야 합니다. OTel 수집기의 올바른 구성으로 인해, 다음 규칙을 따르기가 쉽습니다. 또한 [사용자가 ClickHouse를 처음 사용할 때 자주 발생하는 문제](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)를 피할 수 있습니다.

### 배치 처리 {#batching}

기본적으로 ClickHouse에 전송되는 각 삽입은 ClickHouse가 즉시 삽입의 데이터를 포함한 저장 파트를 생성하게 만듭니다. 이는 저장해야 하는 다른 메타데이터와 함께 저장됩니다. 따라서 데이터가 더 많고 각각 더 적은 삽입보다 더 적은 수의 삽입을 보내는 것이 필수적으로 감소됩니다. 우리는 최소 1,000개의 행을 포함하는 상당히 큰 배치로 데이터를 삽입할 것을 권장합니다. [자세한 내용은 여기](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)를 참조하십시오.

기본적으로 ClickHouse로의 삽입은 동기식이며 동일한 경우에 멱등입니다. Merge tree 엔진 계열의 테이블의 경우, ClickHouse는 기본적으로 자동으로 [삽입을 중복 제거](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)합니다. 이는 다음과 같은 경우에 삽입이 허용되는 것을 의미합니다:

- (1) 데이터를 수신하는 노드에 문제가 발생하면 삽입 쿼리는 타임아웃됩니다(또는 보다 구체적인 오류를 받게 되며) 확인을 받지 못합니다.
- (2) 데이터가 노드에 기록되었지만, 네트워크 중단으로 인해 쿼리를 보낸 쪽에 확인을 반환할 수 없는 경우, 발신자는 타임아웃 또는 네트워크 오류를 받게 됩니다.

수집기의 관점에서 (1)과 (2)는 구별하기 어려울 수 있습니다. 그러나 두 경우 모두, 확인되지 않은 삽입은 즉시 재시도할 수 있습니다. 재시도된 삽입 쿼리가 동일한 데이터로 동일한 순서를 포함하는 한, ClickHouse는 원래(확인되지 않은) 삽입이 성공한 경우 재시도된 삽입을 자동으로 무시할 것입니다.

이러한 이유로, OTel 수집기의 ClickStack 배포는 [배치 프로세서](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)를 사용합니다. 이는 삽입이 위의 요구 사항을 충족하는 일관된 행 배치로 전송되도록 보장합니다. 수집기가 높은 처리량(초당 이벤트)을 가져야 하는 경우, 각 삽입에서 최소 5,000개의 이벤트를 보낼 수 있는 경우, 이것이 일반적으로 파이프라인에서 요구되는 유일한 배치입니다. 이 경우 수집기는 배치 프로세서의 `timeout`에 도달하기 전에 배치를 플러시하여 파이프라인의 종단 간 지연을 낮게 유지하고 배치가 일관된 크기를 유지하도록 합니다.

### 비동기 삽입 사용 {#use-asynchronous-inserts}

일반적으로 사용자는 수집기의 처리량이 낮을 때 더 작은 배치를 보내야 하고 여전히 데이터가 최소 종단 간 지연 내에 ClickHouse에 도달할 것이라고 기대합니다. 이 경우, 배치 프로세서의 `timeout`이 만료될 때 작은 배치가 전송됩니다. 이는 문제를 일으킬 수 있으며, 비동기 삽입이 필요합니다. 이 문제는 사용자가 게이트웨이 역할을 하는 ClickStack 수집기로 데이터를 전송하는 경우 드물게 발생하는 문제입니다. 게이트웨이가 집계기로 작용하므로 이러한 문제를 완화합니다 - [수집기 역할](#collector-roles)를 참조하십시오.

큰 배치를 보장할 수 없는 경우, 사용자는 [비동기 삽입](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)을 사용하여 ClickHouse에 배치 처리를 위임할 수 있습니다. 비동기 삽입을 사용하면 데이터가 먼저 버퍼에 삽입된 다음 데이터베이스 스토리지에 나중에 비동기적으로 기록됩니다.

<Image img={observability_6} alt="Async inserts" size="md"/>

[비동기 삽입이 활성화된 상태에서](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), ClickHouse가 ① 삽입 쿼리를 수신하면 쿼리의 데이터가 ② 먼저 인메모리 버퍼에 즉시 기록됩니다. ③ 다음 버퍼 플러시가 발생할 때, 버퍼의 데이터는 [정렬되어](guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) 데이터베이스 스토리지의 일부로 기록됩니다. 쿼리가 실행되기 전에 데이터가 데이터베이스 스토리지에 플러시되기 전까지는 쿼리로 검색할 수 없습니다; 버퍼 플러시는 [구성할 수 있습니다](/optimize/asynchronous-inserts).

수집기를 위한 비동기 삽입을 활성화하려면 연결 문자열에 `async_insert=1`을 추가합니다. 보장 제공을 얻기 위해 사용자가 `wait_for_async_insert=1`(기본값)으로 설정하는 것이 좋습니다. 더 자세한 내용은 [여기](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)를 참조하십시오.

비동기 삽입에서 ClickHouse 버퍼가 플러시된 후에 데이터가 삽입됩니다. 이는 [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size)가 초과되었거나 첫 번째 INSERT 쿼리 이후 [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) 밀리초가 경과한 경우 발생합니다. `async_insert_stale_timeout_ms`가 0이 아닌 값을 가진 경우, 데이터는 마지막 쿼리 이후 `async_insert_stale_timeout_ms 밀리초`가 지나면 삽입됩니다. 사용자는 이러한 설정을 조정하여 파이프라인의 종단 간 지연을 제어할 수 있습니다. 버퍼 플러시를 조정하는 데 사용할 수 있는 추가 설정은 [여기](/operations/settings/settings#async_insert)에 문서화되어 있습니다. 일반적으로 기본값이 적합합니다.

:::note 적응형 비동기 삽입 고려
적은 수의 에이전트가 사용되고 처리량이 낮지만 엄격한 종단 간 지연 요구 사항이 있는 경우 [적응형 비동기 삽입](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts)이 유용할 수 있습니다. 일반적으로 이는 ClickHouse와 관련된 높은 처리량 관측 가능성 사용 사례에 적용되지 않습니다.
:::

마지막으로, 비동기 삽입을 사용할 때 ClickHouse로의 동기 삽입과 관련된 이전의 중복 제거 동작은 기본적으로 활성화되지 않습니다. 필요한 경우 설정 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate)를 참조하십시오.

이 기능을 구성하는 데 대한 전체 세부정보는 이 [문서 페이지](/optimize/asynchronous-inserts#enabling-asynchronous-inserts) 또는 심층 블로그 게시물에서 확인할 수 있습니다 [여기](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).

## 확장 {#scaling}

ClickStack OTel 수집기는 게이트웨이 인스턴스 역할을 합니다 - [수집기 역할](#collector-roles)을 참조하십시오. 이러한 인스턴스는 일반적으로 데이터 센터별 또는 지역별로 독립 서비스를 제공합니다. 이러한 인스턴스는 단일 OTLP 엔드포인트를 통해 애플리케이션(또는 에이전트 역할의 다른 수집기)에서 이벤트를 수신합니다. 일반적으로 수집기 인스턴스를 배포하고, 기본 제공 로드 밸런서를 사용하여 부하를 분산합니다.

<Image img={clickstack_with_gateways} alt="Scaling with gateways" size="lg"/>

이 아키텍처의 목적은 에이전트에서 컴퓨팅 집약적인 처리를 오프로드하여 리소스 사용량을 최소화하는 것입니다. 이러한 ClickStack 게이트웨이는 에이전트에서 수행해야 할 변환 작업을 수행할 수 있습니다. 또한 여러 에이전트의 이벤트를 집계함으로써, 게이트웨이는 ClickHouse에 대규모 배치를 보낼 수 있어 효율적인 삽입을 가능하게 합니다. 이러한 게이트웨이 수집기는 에이전트와 SDK 소스가 증가하고 이벤트 처리량이 증가함에 따라 쉽게 확장할 수 있습니다.

### Kafka 추가 {#adding-kafka}

독자들은 위의 아키텍처에서 Kafka를 메시지 큐로 사용하지 않았음을 알아챌 수 있습니다.

흔히 보이는 설계 패턴인 Kafka 큐를 메시지 버퍼로 사용하는 것은 로깅 아키텍처에서 인기 있는 방법이며 ELK 스택에 의해 유명해졌습니다. 이는 몇 가지 이점을 제공합니다: 주로, 더 강력한 메시지 전달 보장을 제공하며 백프레셔를 처리하는 데 도움이 됩니다. 메시지는 수집 에이전트에서 Kafka로 보내지고 디스크에 기록됩니다. 이론상 클러스터 형태의 Kafka 인스턴스는 데이터를 디스크에 선형으로 작성하는 데 드는 계산적 오버헤드가 적기 때문에 높은 처리량의 메시지 버퍼를 제공할 것입니다. 예를 들어 Elastic에서는 토큰화와 색인이 상당한 오버헤드를 유발합니다. 데이터를 에이전트에서 이동시키면 소스에서 로그 순환으로 인해 메시지를 잃을 위험도 줄어듭니다. 마지막으로, 일부 사용 사례에 매력적일 수 있는 메시지 재전송 및 크로스 리전 복제 기능을 제공합니다.

그러나 ClickHouse는 데이터를 매우 빠르게 삽입할 수 있습니다 - 보통 하드웨어에서 초당 수백만 행을 기록할 수 있습니다. ClickHouse의 백프레셔는 드뭅니다. 종종 Kafka 큐를 활용하는 것은 더 많은 아키텍처 복잡성과 비용을 초래합니다. 로그가 은행 거래 및 기타 미션 크리티컬 데이터와 같은 동일한 전달 보장을 필요로 하지 않는다는 원칙을 수용할 수 있다면 Kafka의 복잡성을 피할 것을 권장합니다.

그러나 높은 전달 보장 또는 데이터를 재생할 수 있는 능력이 필요한 경우(Kafka may be a useful architectural addition) Kafka를 사용할 수 있습니다.

<Image img={observability_8} alt="Adding kafka" size="lg"/>

이 경우 OTel 에이전트는 [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md)를 통해 Kafka로 데이터를 전송하도록 구성될 수 있습니다. 게이트웨이 인스턴스는 [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md)를 사용하여 메시지를 소비합니다. 추가 세부정보는 Confluent 및 OTel 문서를 참조하십시오.

:::note OTel 수집기 구성
ClickStack OpenTelemetry 수집기 배포는 [사용자 정의 수집기 구성](#extending-collector-config)을 통해 Kafka와 함께 구성할 수 있습니다.
:::

## 리소스 추정 {#estimating-resources}

OTel 수집기에 대한 리소스 요구 사항은 이벤트 처리량, 메시지 크기 및 수행되는 처리량에 따라 달라집니다. OpenTelemetry 프로젝트는 사용자가 리소스 요구 사항을 추정하는 데 사용할 수 있는 [벤치마크](https://opentelemetry.io/docs/collector/benchmarks/)를 유지합니다.

[우리의 경험에 따르면](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), 3개 코어와 12GB의 RAM을 가진 ClickStack 게이트웨이 인스턴스는 초당 약 60,000개의 이벤트를 처리할 수 있습니다. 이는 필드 이름 변경을 담당하는 최소 처리 파이프라인을 가정하며 정규 표현식은 사용하지 않습니다.

게이트웨이로 이벤트를 수출하는 것을 책임지는 에이전트 인스턴스의 경우, 사용자는 예상되는 초당 로그 수를 기반으로 크기를 조정할 것을 권장합니다. 다음은 사용자가 시작 포인트로 사용할 수 있는 대략적인 수치를 나타냅니다:

| 로깅 속도 | 수집기 에이전트 리소스 |
|-----------|------------------------|
| 1k/초     | 0.2CPU, 0.2GiB        |
| 5k/초     | 0.5 CPU, 0.5GiB       |
| 10k/초    | 1 CPU, 1GiB           |

## JSON 지원 {#json-support}

<BetaBadge/>

:::warning 베타 기능
**ClickStack**의 JSON 형식 지원은 **베타 기능**입니다. JSON 형식 자체는 ClickHouse 25.3+에서 프로덕션 준비가 되었지만, ClickStack 내에서의 통합은 여전히 적극 개발 중이며 제한이 있거나, 향후 변경될 수 있거나, 버그가 있을 수 있습니다.
:::

ClickStack은 버전 `2.0.4`부터 [JSON 형식](/interfaces/formats/JSON)에 대한 베타 지원을 제공합니다.

### JSON 형식의 이점 {#benefits-json-type}

JSON 형식은 ClickStack 사용자에게 다음과 같은 이점을 제공합니다:

- **형식 보존** - 숫자는 숫자로, 불리언은 불리언으로 유지됩니다. 모든 것을 문자열로 평탄화할 필요가 없습니다. 이는 더 적은 캐스트, 더 간단한 쿼리, 더 정확한 집계를 의미합니다.
- **경로 수준의 컬럼** - 각 JSON 경로는 자체 서브 컬럼이 되어 I/O가 줄어듭니다. 쿼리는 필요한 필드만 읽으므로, 특정 필드를 쿼리하기 위해 전체 컬럼을 읽어야 했던 이전 Map 형식에 비해 크게 향상된 성능을 얻을 수 있습니다.
- **깊은 중첩도 정상 작동** - 복잡하고 깊게 중첩된 구조를 수동으로 평탄화(이전 Map 형식이 필요로 하는)할 필요 없이 자연스럽게 처리합니다.
- **동적, 발전하는 스키마** - 시간이 지남에 따라 팀이 새로운 태그와 속성을 추가하는 관측 가능성 데이터에 적합합니다. JSON은 이러한 변화를 자동으로 처리하며, 스키마 마이그레이션이 필요하지 않습니다.
- **더 빠른 쿼리, 낮은 메모리** - `LogAttributes`와 같은 속성에 대한 전형적인 집계에서 5-10배 적은 데이터가 읽히고 속도가 눈에 띄게 빨라집니다. 쿼리 시간과 피크 메모리 사용량이 모두 감소합니다.
- **간단한 관리** - 성능을 위해 미리 재료화된 컬럼을 만들 필요가 없습니다. 각 필드는 자체 서브 컬럼이 되어 원주율적 ClickHouse 컬럼과 동일한 속도를 제공합니다.

### JSON 지원 활성화 {#enabling-json-support}

수집기에 대한 이 지원을 활성화하려면, 수집기를 포함하는 모든 배포에 대해 환경 변수를 `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'`로 설정하십시오. 이렇게 하면 ClickHouse에서 JSON 형식을 사용하여 스키마가 생성됩니다.

:::note HyperDX 지원
JSON 형식을 쿼리하기 위해, HyperDX 애플리케이션 레이어에서도 환경 변수 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`를 통해 지원이 활성화되어야 합니다.
:::

예:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

### map 기반 스키마에서 JSON 형식으로의 마이그레이션 {#migrating-from-map-based-schemas-to-json}

:::important 하위 호환성
[JSON 형식](/interfaces/formats/JSON)은 기존의 map 기반 스키마와 **하위 호환되지 않습니다**. 이 기능을 활성화하면 `JSON` 형식을 사용하여 새로운 테이블이 생성되며, 수동 데이터 마이그레이션이 필요합니다.
:::

Map 기반 스키마에서 마이그레이션하려면 다음 단계를 따르십시오:

<VerticalStepper headerLevel="h4">

#### OTel 수집기 중지 {#stop-the-collector}

#### 기존 테이블 이름 변경 및 소스 업데이트 {#rename-existing-tables-sources}

기존 테이블의 이름을 변경하고 HyperDX의 데이터 소스를 업데이트합니다.

예:

```sql
RENAME TABLE otel_logs TO otel_logs_map;
RENAME TABLE otel_metrics TO otel_metrics_map;
```

#### 수집기 배포  {#deploy-the-collector}

`OTEL_AGENT_FEATURE_GATE_ARG`가 설정된 상태로 수집기를 배포합니다.

#### JSON 스키마 지원으로 HyperDX 컨테이너 재시작 {#restart-the-hyperdx-container}

```shell
export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
```

#### 새로운 데이터 소스 생성 {#create-new-data-sources}

JSON 테이블을 가리키도록 HyperDX에 새로운 데이터 소스를 생성합니다.

</VerticalStepper>

#### 기존 데이터 마이그레이션 (선택 사항) {#migrating-existing-data}

새로운 JSON 테이블로 이전 데이터를 이동하려면:

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
~100억 행보다 작은 데이터 세트에 대해서만 권장됩니다. 이전에 Map 형식으로 저장된 데이터는 유형 정밀도를 저장하지 않았습니다(모든 값이 문자열이었습니다). 결과적으로, 이 오래된 데이터는 새로운 스키마에서 문자열로 표시되며, 만기가 되기 전까지는 일부 캐스팅이 필요합니다. 새로운 데이터의 유형은 JSON 형식으로 보존됩니다.
:::
