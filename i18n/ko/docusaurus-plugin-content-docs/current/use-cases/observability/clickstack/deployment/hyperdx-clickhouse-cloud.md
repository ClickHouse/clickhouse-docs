---
'slug': '/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud'
'title': 'ClickHouse Cloud'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 1
'description': 'ClickHouse Cloud로 ClickStack 배포하기'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'deployment'
- 'setup'
- 'configuration'
- 'observability'
---

import Image from '@theme/IdealImage';
import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import cloud_connect from '@site/static/images/use-cases/observability/clickhouse_cloud_connection.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';
import hyperdx_cloud_landing from '@site/static/images/use-cases/observability/hyperdx_cloud_landing.png';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import read_only from '@site/static/images/clickstack/read-only-access.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import JSONSupport from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

<PrivatePreviewBadge/>

::::note[비공식 미리보기]
이 기능은 ClickHouse Cloud 비공식 미리보기에서 제공됩니다. 귀하의 조직이 우선 접근 권한을 받고 싶다면,
<TrackedLink href="https://clickhouse.com/cloud/clickstack-private-preview" eventName="docs.clickstack_deployment.waitlist_cta">대기자 명단에 가입하세요</TrackedLink>.

ClickHouse Cloud를 처음 사용하는 경우, 클릭하여
<TrackedLink href="/docs/cloud/overview" eventName="docs.clickstack_deployment.cloud_learn_more_cta">더 알아보세요</TrackedLink> 또는 <TrackedLink href="https://clickhouse.cloud/signUp" eventName="docs.clickstack_deployment.cloud_signup_cta" target="_blank" rel="noopener noreferrer">무료 체험에 가입하세요</TrackedLink> 시작할 수 있습니다.
::::

이 옵션은 ClickHouse Cloud를 사용하는 사용자들을 위해 설계되었습니다. 이 배포 패턴에서는 ClickHouse와 HyperDX가 모두 ClickHouse Cloud에 호스트되어, 사용자가 자체적으로 호스팅해야 할 구성 요소의 수를 최소화합니다.

인프라 관리 비용을 줄이는 것 외에도, 이 배포 패턴은 인증이 ClickHouse Cloud SSO/SAML과 통합되어 있음을 보장합니다. 자체 호스팅 배포와 달리 애플리케이션 상태(예: 대시보드, 저장된 검색, 사용자 설정, 경고)를 저장하기 위한 MongoDB 인스턴스를 프로비저닝할 필요도 없습니다.

이 모드에서는 데이터 수집이 전적으로 사용자에게 맡겨집니다. 사용자는 자신의 호스팅 OpenTelemetry 수집기, 클라이언트 라이브러리의 직접 수집, ClickHouse 기본 테이블 엔진(예: Kafka 또는 S3), ETL 파이프라인 또는 ClickPipes(ClickHouse Cloud의 관리형 수집 서비스)를 사용하여 ClickHouse Cloud로 데이터를 수집할 수 있습니다. 이 접근 방식은 ClickStack을 운영하는 가장 간단하고 성능이 뛰어난 방법을 제공합니다.

### 적합한 경우 {#suitable-for}

이 배포 패턴은 다음 시나리오에서 이상적입니다:

1. 이미 ClickHouse Cloud에 관측 가능성 데이터를 보유하고 있으며, 이를 HyperDX를 사용하여 시각화하고 싶습니다.
2. 대규모 관측 가능성 배포를 운영하고 있으며 ClickHouse Cloud와 ClickStack의 전용 성능 및 확장성이 필요합니다.
3. 이미 ClickHouse Cloud를 분석에 사용하고 있으며 ClickStack 계측 라이브러리를 사용하여 애플리케이션에 계측하고 싶습니다 — 데이터를 동일한 클러스터로 전송합니다. 이 경우, 관측 가능성 작업을 위한 컴퓨트를 격리하기 위해 [warehouses](/cloud/reference/warehouses)를 사용하는 것을 권장합니다.

## 배포 단계 {#deployment-steps}

다음 가이드는 이미 ClickHouse Cloud 서비스를 생성했다고 가정합니다. 서비스 생성이 완료되지 않았다면, 빠른 시작 가이드의 ["ClickHouse 서비스 생성하기"](/getting-started/quick-start/cloud#1-create-a-clickhouse-service) 단계를 따르세요.

<VerticalStepper headerLevel="h3">

### 서비스 자격 증명 복사 (선택 사항) {#copy-service-credentials}

**서비스에서 시각화하고 싶은 기존 관측 가능성 이벤트가 있는 경우, 이 단계를 건너뛸 수 있습니다.**

주요 서비스 목록으로 이동하여 HyperDX에서 시각화할 이벤트를 관측할 서비스를 선택합니다.

탐색 메뉴에서 `연결` 버튼을 클릭합니다. 다양한 인터페이스와 언어를 통해 연결하는 방법에 대한 지침과 함께 서비스를 위한 자격 증명이 제공되는 모달이 열립니다. 드롭다운에서 `HTTPS`를 선택하고 기록한 연결 엔드포인트와 자격 증명을 기록합니다.

<Image img={cloud_connect} alt="ClickHouse Cloud connect" size="lg"/>

### Open Telemetry 수집기 배포 (선택 사항) {#deploy-otel-collector} 

**서비스에서 시각화하고 싶은 기존 관측 가능성 이벤트가 있는 경우, 이 단계를 건너뛸 수 있습니다.**

이 단계는 Open Telemetry (OTel) 스키마로 테이블이 생성되도록 하여 HyperDX에서 데이터 소스를 원활하게 생성할 수 있도록 합니다. 또한 [샘플 데이터셋](/use-cases/observability/clickstack/sample-datasets)을 로드하고 OTel 이벤트를 ClickStack으로 전송하는 데 사용할 수 있는 OLTP 엔드포인트를 제공합니다.

:::note 표준 Open Telemetry 수집기 사용
다음 지침은 ClickStack 배포가 아닌 OTel 수집기의 표준 배포를 사용합니다. 후자는 구성을 위해 OpAMP 서버가 필요하며, 이는 비공식 미리보기에서 현재 지원되지 않습니다. 아래의 구성은 ClickStack 배포의 수집기에서 사용된 버전을 복제하며, 이벤트를 전송할 수 있는 OTLP 엔드포인트를 제공합니다.
:::

OTel 수집기의 구성을 다운로드하십시오:

```bash
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/deployment/_snippets/otel-cloud-config.yaml
```

<details>
<summary>otel-cloud-config.yaml</summary>

```yaml file=docs/use-cases/observability/clickstack/deployment/_snippets/otel-cloud-config.yaml
receivers:
  otlp/hyperdx:
    protocols:
      grpc:
        include_metadata: true
        endpoint: '0.0.0.0:4317'
      http:
        cors:
          allowed_origins: ['*']
          allowed_headers: ['*']
        include_metadata: true
        endpoint: '0.0.0.0:4318'
processors:
  transform:
    log_statements:
      - context: log
        error_mode: ignore
        statements:
          # JSON parsing: Extends log attributes with the fields from structured log body content, either as an OTEL map or
          # as a string containing JSON content.
          - set(log.cache, ExtractPatterns(log.body, "(?P<0>(\\{.*\\}))")) where
            IsString(log.body)
          - merge_maps(log.attributes, ParseJSON(log.cache["0"]), "upsert")
            where IsMap(log.cache)
          - flatten(log.attributes) where IsMap(log.cache)
          - merge_maps(log.attributes, log.body, "upsert") where IsMap(log.body)
      - context: log
        error_mode: ignore
        conditions:
          - severity_number == 0 and severity_text == ""
        statements:
          # Infer: extract the first log level keyword from the first 256 characters of the body
          - set(log.cache["substr"], log.body.string) where Len(log.body.string)
            < 256
          - set(log.cache["substr"], Substring(log.body.string, 0, 256)) where
            Len(log.body.string) >= 256
          - set(log.cache, ExtractPatterns(log.cache["substr"],
            "(?i)(?P<0>(alert|crit|emerg|fatal|error|err|warn|notice|debug|dbug|trace))"))
          # Infer: detect FATAL
          - set(log.severity_number, SEVERITY_NUMBER_FATAL) where
            IsMatch(log.cache["0"], "(?i)(alert|crit|emerg|fatal)")
          - set(log.severity_text, "fatal") where log.severity_number ==
            SEVERITY_NUMBER_FATAL
          # Infer: detect ERROR
          - set(log.severity_number, SEVERITY_NUMBER_ERROR) where
            IsMatch(log.cache["0"], "(?i)(error|err)")
          - set(log.severity_text, "error") where log.severity_number ==
            SEVERITY_NUMBER_ERROR
          # Infer: detect WARN
          - set(log.severity_number, SEVERITY_NUMBER_WARN) where
            IsMatch(log.cache["0"], "(?i)(warn|notice)")
          - set(log.severity_text, "warn") where log.severity_number ==
            SEVERITY_NUMBER_WARN
          # Infer: detect DEBUG
          - set(log.severity_number, SEVERITY_NUMBER_DEBUG) where
            IsMatch(log.cache["0"], "(?i)(debug|dbug)")
          - set(log.severity_text, "debug") where log.severity_number ==
            SEVERITY_NUMBER_DEBUG
          # Infer: detect TRACE
          - set(log.severity_number, SEVERITY_NUMBER_TRACE) where
            IsMatch(log.cache["0"], "(?i)(trace)")
          - set(log.severity_text, "trace") where log.severity_number ==
            SEVERITY_NUMBER_TRACE
          # Infer: else
          - set(log.severity_text, "info") where log.severity_number == 0
          - set(log.severity_number, SEVERITY_NUMBER_INFO) where log.severity_number == 0
      - context: log
        error_mode: ignore
        statements:
          # Normalize the severity_text case
          - set(log.severity_text, ConvertCase(log.severity_text, "lower"))
  resourcedetection:
    detectors:
      - env
      - system
      - docker
    timeout: 5s
    override: false
  batch:
  memory_limiter:
    # 80% of maximum memory up to 2G, adjust for low memory environments
    limit_mib: 1500
    # 25% of limit up to 2G, adjust for low memory environments
    spike_limit_mib: 512
    check_interval: 5s
connectors:
  routing/logs:
    default_pipelines: [logs/out-default]
    error_mode: ignore
    table:
      - context: log
        statement: route() where IsMatch(attributes["rr-web.event"], ".*")
        pipelines: [logs/out-rrweb]
exporters:
  debug:
    verbosity: detailed
    sampling_initial: 5
    sampling_thereafter: 200
  clickhouse/rrweb:
    database: ${env:CLICKHOUSE_DATABASE}
    endpoint: ${env:CLICKHOUSE_ENDPOINT}
    password: ${env:CLICKHOUSE_PASSWORD}
    username: ${env:CLICKHOUSE_USER}
    ttl: 720h
    logs_table_name: hyperdx_sessions
    timeout: 5s
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
  clickhouse:
    database: ${env:CLICKHOUSE_DATABASE}
    endpoint: ${env:CLICKHOUSE_ENDPOINT}
    password: ${env:CLICKHOUSE_PASSWORD}
    username: ${env:CLICKHOUSE_USER}
    ttl: 720h
    timeout: 5s
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
extensions:
  health_check:
    endpoint: :13133
service:
  pipelines:
    traces:
      receivers: [otlp/hyperdx]
      processors: [memory_limiter, batch]
      exporters: [clickhouse]
    metrics:
      receivers: [otlp/hyperdx]
      processors: [memory_limiter, batch]
      exporters: [clickhouse]
    logs/in:
      receivers: [otlp/hyperdx]
      exporters: [routing/logs]
    logs/out-default:
      receivers: [routing/logs]
      processors: [memory_limiter, transform, batch]
      exporters: [clickhouse]
    logs/out-rrweb:
      receivers: [routing/logs]
      processors: [memory_limiter, batch]
      exporters: [clickhouse/rrweb]

```

</details>

아래 Docker 명령을 사용하여 수집기를 배포하고, 이전에 기록한 연결 설정에 따라 각각의 환경 변수를 설정합니다. 운영 체제에 따라 적절한 명령을 사용하세요.

```bash

# modify to your cloud endpoint
export CLICKHOUSE_ENDPOINT=
export CLICKHOUSE_PASSWORD=

# optionally modify 
export CLICKHOUSE_DATABASE=default


# osx
docker run --rm -it \
  -p 4317:4317 -p 4318:4318 \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -e CLICKHOUSE_DATABASE=${CLICKHOUSE_DATABASE} \
  --user 0:0 \
  -v "$(pwd)/otel-cloud-collector.yaml":/etc/otel/config.yaml \
  -v /var/log:/var/log:ro \
  -v /private/var/log:/private/var/log:ro \
  otel/opentelemetry-collector-contrib:latest \
  --config /etc/otel/config.yaml


# linux command


# docker run --network=host --rm -it \

#   -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \

#   -e CLICKHOUSE_USER=default \

#   -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \

#   -e CLICKHOUSE_DATABASE=${CLICKHOUSE_DATABASE} \

#   --user 0:0 \

#   -v "$(pwd)/otel-cloud-config.yaml":/etc/otel/config.yaml \

#   -v /var/log:/var/log:ro \

#   -v /private/var/log:/private/var/log:ro \

#   otel/opentelemetry-collector-contrib:latest \

#   --config /etc/otel/config.yaml
```

:::note
운영 환경에서는 ingestion 전용의 전용 사용자를 만드는 것을 권장하며, 데이터베이스 및 필요한 테이블에 대한 접근 권한을 제한합니다. 더 자세한 내용은 ["데이터베이스 및 ingestion 사용자"](/use-cases/observability/clickstack/production#database-ingestion-user)를 참조하세요.
:::

### HyperDX에 연결 {#connect-to-hyperdx}

서비스를 선택한 다음, 왼쪽 메뉴에서 `HyperDX`를 선택합니다.

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

사용자는 별도의 사용자 생성을 요구하지 않으며, 자동으로 인증됩니다. 이후 데이터 소스를 생성하라는 프롬프트가 표시됩니다.

HyperDX 인터페이스만 탐색하려는 사용자에게는 OTel 데이터를 사용하는 [샘플 데이터셋](/use-cases/observability/clickstack/sample-datasets)을 권장합니다.

<Image img={hyperdx_cloud_landing} alt="ClickHouse Cloud HyperDX Landing" size="lg"/>

### 사용자 권한 {#user-permissions}

HyperDX에 접근하는 사용자는 ClickHouse Cloud 콘솔 자격 증명을 사용하여 자동으로 인증됩니다. 접근은 서비스 설정에서 구성된 SQL 콘솔 권한에 따라 제어됩니다.

#### 사용자 접근을 구성하려면 {#configure-access}

1. ClickHouse Cloud 콘솔에서 서비스를 탐색합니다.
2. **설정** → **SQL 콘솔 접근**으로 이동합니다.
3. 각 사용자에 대해 적절한 권한 수준을 설정합니다:
   - **서비스 관리 → 전체 접근** - 경고를 활성화하는 데 필요합니다.
   - **서비스 읽기 전용 → 읽기 전용** - 관측 가능성 데이터를 보고 대시보드를 생성할 수 있습니다.
   - **접근 없음** - HyperDX에 접근할 수 없습니다.

<Image img={read_only} alt="ClickHouse Cloud Read Only"/>

:::important 경고를 활성화하려면 관리자 접근이 필요합니다
경고를 활성화하려면, **서비스 관리자** 권한이 있는 사용자(한 번 이상 HyperDX에 로그인 한 사용자)가 적어도 한 명 있어야 합니다. 이를 통해 경고 쿼리를 실행하는 전용 사용자가 데이터베이스에 프로비저닝됩니다.
:::

### 데이터 소스 생성 {#create-a-datasource}

HyperDX는 Open Telemetry에 기본적으로 적합하지만 Open Telemetry에 국한되지 않으며, 사용자는 원할 경우 자신만의 테이블 스키마를 사용할 수 있습니다.

#### Open Telemetry 스키마 사용하기 {#using-otel-schemas}

위의 OTel 수집기를 사용하여 ClickHouse 내에서 데이터베이스와 테이블을 생성하는 경우, 생성 소스 모델의 모든 기본 값을 유지하며 `Table` 필드를 `otel_logs`로 채워 로그 소스를 생성합니다. 다른 모든 설정은 자동으로 감지되어 `새 소스 저장`을 클릭할 수 있습니다.

<Image img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX Datasource" size="lg"/>

추적 및 OTel 메트릭에 대한 소스를 생성하려면, 상단 메뉴에서 `새 소스 생성`을 선택할 수 있습니다.

<Image img={hyperdx_create_new_source} alt="HyperDX create new source" size="lg"/>

여기서 필요한 소스 유형을 선택한 다음 적절한 테이블(예: 추적의 경우 `otel_traces` 테이블)을 선택합니다. 모든 설정은 자동으로 감지되어야 합니다.

<Image img={hyperdx_create_trace_datasource} alt="HyperDX create trace source" size="lg"/>

:::note 소스 상관관계
ClickStack의 서로 다른 데이터 소스(예: 로그 및 추적)는 서로 상관관계가 있을 수 있습니다. 이를 활성화하려면 각 소스에서 추가 구성이 필요합니다. 예를 들어, 로그 소스에서 해당 추적 소스를 지정할 수 있으며, 반대로 추적 소스에서도 지원합니다. 더 자세한 내용은 ["상관된 소스"](/use-cases/observability/clickstack/config#correlated-sources)를 참조하세요.
:::

#### 사용자 정의 스키마 사용하기 {#using-custom-schemas}

기존 서비스에 데이터를 연결하려는 사용자는 필요한 대로 데이터베이스 및 테이블 설정을 완료할 수 있습니다. 테이블이 ClickHouse의 Open Telemetry 스키마에 부합하는 경우 설정은 자동으로 감지됩니다.

자체 스키마를 사용하는 경우, 필요한 필드를 지정하여 로그 소스를 생성하는 것을 권장합니다 - 더 자세한 내용은 ["로그 소스 설정"](/use-cases/observability/clickstack/config#logs)를 참고하세요.

</VerticalStepper>

<JSONSupport/>

추가로, 사용자는 JSON이 ClickHouse Cloud 서비스에 활성화되도록 지원팀에 support@clickhouse.com에 연락해야 합니다.
