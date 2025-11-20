---
'slug': '/use-cases/observability/clickstack/integrations/postgresql-logs'
'title': 'ClickStack으로 PostgreSQL 로그 모니터링'
'sidebar_label': 'PostgreSQL 로그'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack으로 PostgreSQL 로그 모니터링'
'doc_type': 'guide'
'keywords':
- 'PostgreSQL'
- 'Postgres'
- 'logs'
- 'OTEL'
- 'ClickStack'
- 'database monitoring'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import logs_search_view from '@site/static/images/clickstack/postgres/postgres-logs-search-view.png';
import log_view from '@site/static/images/clickstack/postgres/postgres-log-view.png';
import logs_dashboard from '@site/static/images/clickstack/postgres/postgres-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-logs-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# PostgreSQL 로그를 ClickStack으로 모니터링하기 {#postgres-logs-clickstack}

:::note[TL;DR]
이 가이드는 OpenTelemetry 수집기를 구성하여 PostgreSQL 서버 로그를 수집함으로써 ClickStack으로 PostgreSQL을 모니터링하는 방법을 보여줍니다. 여러분은 다음을 배우게 됩니다:

- PostgreSQL을 CSV 형식으로 로그를 출력하도록 구성하여 구조적으로 파싱
- 로그 수집을 위한 사용자 정의 OTel 수집기 구성 만들기
- 사용자 정의 구성으로 ClickStack 배포하기
- 미리 구축된 대시보드를 사용하여 PostgreSQL 로그 인사이트(오류, 느린 쿼리, 연결)를 시각화하기

프로덕션 PostgreSQL을 구성하기 전에 통합을 테스트하고 싶다면 샘플 로그가 포함된 데모 데이터셋을 사용하실 수 있습니다.

소요 시간: 10-15분
:::

## 기존 PostgreSQL과의 통합 {#existing-postgres}

이 섹션에서는 ClickStack OTel 수집기 구성을 수정하여 기존 PostgreSQL 설치에서 로그를 ClickStack으로 보내는 방법을 다룹니다.

기존 설정을 구성하기 전에 PostgreSQL 로그 통합을 테스트하고 싶다면 ["데모 데이터셋"](/use-cases/observability/clickstack/integrations/postgresql-logs#demo-dataset) 섹션의 미리 구성된 설정 및 샘플 데이터를 사용하여 테스트하실 수 있습니다.

##### 전제조건 {#prerequisites}
- ClickStack 인스턴스 실행 중
- 기존 PostgreSQL 설치(버전 9.6 이상)
- PostgreSQL 구성 파일 수정 권한
- 로그 파일을 위한 충분한 디스크 공간

<VerticalStepper headerLevel="h4">

#### PostgreSQL 로깅 구성 {#configure-postgres}

PostgreSQL은 여러 로그 형식을 지원합니다. OpenTelemetry로 구조적으로 파싱하기 위해서는 일관되고 파싱 가능한 출력을 제공하는 CSV 형식을 추천합니다.

`postgresql.conf` 파일은 일반적으로 다음 위치에 있습니다:
- **Linux (apt/yum)**: `/etc/postgresql/{version}/main/postgresql.conf`
- **macOS (Homebrew)**: `/usr/local/var/postgres/postgresql.conf` 또는 `/opt/homebrew/var/postgres/postgresql.conf`
- **Docker**: 구성은 일반적으로 환경 변수 또는 마운트된 구성 파일을 통해 설정됩니다.

`postgresql.conf`에서 다음 설정을 추가하거나 수정합니다:

```conf

# Required for CSV logging
logging_collector = on
log_destination = 'csvlog'


# Recommended: Connection logging
log_connections = on
log_disconnections = on


# Optional: Tune based on your monitoring needs
#log_min_duration_statement = 1000  # Log queries taking more than 1 second
#log_statement = 'ddl'               # Log DDL statements (CREATE, ALTER, DROP)
#log_checkpoints = on                # Log checkpoint activity
#log_lock_waits = on                 # Log lock contention
```

:::note
이 가이드는 신뢰할 수 있는 구조적 파싱을 위해 PostgreSQL의 `csvlog` 형식을 사용합니다. `stderr` 또는 `jsonlog` 형식을 사용하는 경우 OpenTelemetry 수집기 구성을 조정해야 합니다.
:::

변경 사항을 적용한 후 PostgreSQL을 재시작합니다:

```bash

# For systemd
sudo systemctl restart postgresql


# For Docker
docker restart 
```

로그가 기록되고 있는지 확인합니다:

```bash

# Default log location on Linux
tail -f /var/lib/postgresql/{version}/main/log/postgresql-*.log


# macOS Homebrew
tail -f /usr/local/var/postgres/log/postgresql-*.log
```

#### 사용자 정의 OTel 수집기 구성 만들기 {#custom-otel}

ClickStack은 사용자 정의 구성 파일을 마운트하고 환경 변수를 설정하여 기본 OpenTelemetry Collector 구성을 확장할 수 있도록 합니다. 사용자 정의 구성은 OpAMP를 통해 HyperDX에서 관리하는 기본 구성과 병합됩니다.

다음 구성이 포함된 `postgres-logs-monitoring.yaml`라는 파일을 만듭니다:

```yaml
receivers:
  filelog/postgres:
    include:
      - /var/lib/postgresql/*/main/log/postgresql-*.csv # Adjust to match your PostgreSQL installation
    start_at: end
    multiline:
      line_start_pattern: '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'
    operators:
      - type: csv_parser
        parse_from: body
        parse_to: attributes
        header: 'log_time,user_name,database_name,process_id,connection_from,session_id,session_line_num,command_tag,session_start_time,virtual_transaction_id,transaction_id,error_severity,sql_state_code,message,detail,hint,internal_query,internal_query_pos,context,query,query_pos,location,application_name,backend_type,leader_pid,query_id'
        lazy_quotes: true

      - type: time_parser
        parse_from: attributes.log_time
        layout: '%Y-%m-%d %H:%M:%S.%L %Z'

      - type: add
        field: attributes.source
        value: "postgresql"

      - type: add
        field: resource["service.name"]
        value: "postgresql-production"

service:
  pipelines:
    logs/postgres:
      receivers: [filelog/postgres]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
```

이 구성은:
- PostgreSQL CSV 로그를 표준 위치에서 읽습니다.
- 다중 행 로그 항목을 처리합니다(오류는 종종 여러 행에 걸쳐 있습니다).
- 모든 표준 PostgreSQL 로그 필드로 CSV 형식을 파싱합니다.
- 원래 로그 타이밍을 유지하기 위해 타임스탬프를 추출합니다.
- HyperDX에서 필터링을 위해 `source: postgresql` 속성을 추가합니다.
- 전용 파이프라인을 통해 ClickHouse 익스포터로 로그를 라우트합니다.

:::note
- 사용자 정의 구성이 있는 경우 새로운 수신기 및 파이프라인만 정의합니다.
- 프로세서(`memory_limiter`, `transform`, `batch`)와 익스포터(`clickhouse`)는 기본 ClickStack 구성에 이미 정의되어 있으므로 이름으로 참조하기만 하면 됩니다.
- `csv_parser` 연산자는 모든 표준 PostgreSQL CSV 로그 필드를 구조화된 속성으로 추출합니다.
- 이 구성은 수집기 재시작 시 로그를 다시 수집하지 않도록 `start_at: end`를 사용합니다. 테스트를 위해 `start_at: beginning`으로 변경하여 역사적 로그를 즉시 확인할 수 있습니다.
- `include` 경로를 PostgreSQL 로그 디렉토리 위치에 맞게 조정합니다.
:::

#### ClickStack을 사용자 정의 구성으로 로드하도록 구성 {#load-custom}

기존 ClickStack 배포에서 사용자 정의 수집기 구성을 활성화하려면 다음을 수행해야 합니다:

1. 사용자 정의 구성 파일을 `/etc/otelcol-contrib/custom.config.yaml`에 마운트합니다.
2. 환경 변수를 설정합니다: `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. 수집기가 로그를 읽을 수 있도록 PostgreSQL 로그 디렉토리를 마운트합니다.

##### 옵션 1: Docker Compose {#docker-compose}

ClickStack 배포 구성을 업데이트합니다:
```yaml
services:
  clickstack:
    # ... existing configuration ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... other environment variables ...
    volumes:
      - ./postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/lib/postgresql:/var/lib/postgresql:ro
      # ... other volumes ...
```

##### 옵션 2: Docker Run (올인원 이미지) {#all-in-one}

올인원 이미지를 사용하여 docker run을 사용하는 경우:
```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/lib/postgresql:/var/lib/postgresql:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
ClickStack 수집기가 PostgreSQL 로그 파일을 읽을 수 있는 적절한 권한을 가지고 있는지 확인합니다. 프로덕션에서는 읽기 전용 마운트(`:ro`)를 사용하고 최소 권한 원칙을 따르십시오.
:::

#### HyperDX에서 로그 확인 {#verifying-logs}

구성이 완료되면 HyperDX에 로그인하여 로그가 흐르고 있는지 확인합니다:

1. 검색 보기로 이동합니다.
2. 소스를 Logs로 설정합니다.
3. `source:postgresql`로 필터링하여 PostgreSQL 관련 로그를 확인합니다.
4. `user_name`, `database_name`, `error_severity`, `message`, `query` 등의 필드가 포함된 구조화된 로그 항목을 확인해야 합니다.

<Image img={logs_search_view} alt="로그 검색 보기"/>

<Image img={log_view} alt="로그 보기"/>

</VerticalStepper>

## 데모 데이터셋 {#demo-dataset}

프로덕션 시스템을 구성하기 전에 PostgreSQL 로그 통합을 테스트하고자 하는 사용자를 위해, 현실적인 패턴의 사전 생성된 PostgreSQL 로그 샘플 데이터셋을 제공합니다.

<VerticalStepper headerLevel="h4">

#### 샘플 데이터셋 다운로드 {#download-sample}

샘플 로그 파일을 다운로드합니다:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgresql.log
```

#### 테스트 수집기 구성 만들기 {#test-config}

다음 구성을 포함하는 `postgres-logs-demo.yaml`이라는 파일을 만듭니다:

```yaml
cat > postgres-logs-demo.yaml << 'EOF'
receivers:
  filelog/postgres:
    include:
      - /tmp/postgres-demo/postgresql.log
    start_at: beginning  # Read from beginning for demo data
    multiline:
      line_start_pattern: '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'
    operators:
      - type: csv_parser
        parse_from: body
        parse_to: attributes
        header: 'log_time,user_name,database_name,process_id,connection_from,session_id,session_line_num,command_tag,session_start_time,virtual_transaction_id,transaction_id,error_severity,sql_state_code,message,detail,hint,internal_query,internal_query_pos,context,query,query_pos,location,application_name,backend_type,leader_pid,query_id'
        lazy_quotes: true

      - type: time_parser
        parse_from: attributes.log_time
        layout: '%Y-%m-%d %H:%M:%S.%L %Z'

      - type: add
        field: attributes.source
        value: "postgresql-demo"

      - type: add
        field: resource["service.name"]
        value: "postgresql-demo"

service:
  pipelines:
    logs/postgres-demo:
      receivers: [filelog/postgres]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### 데모 구성으로 ClickStack 실행 {#run-demo}

데모 로그와 구성으로 ClickStack을 실행합니다:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/postgresql.log:/tmp/postgres-demo/postgresql.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### HyperDX에서 로그 확인 {#verify-demo-logs}

ClickStack이 실행 중이면:

1. [HyperDX](http://localhost:8080/)를 열고 계정에 로그인합니다(계정을 먼저 생성해야 할 수 있습니다).
2. 검색 보기로 이동하고 소스를 `Logs`로 설정합니다.
3. 시간 범위를 **2025-11-10 00:00:00 - 2025-11-11 00:00:00**으로 설정합니다.

<Image img={logs_search_view} alt="로그 검색 보기"/>

<Image img={log_view} alt="로그 보기"/>

</VerticalStepper>

## 대시보드 및 시각화 {#dashboards}

ClickStack으로 PostgreSQL을 모니터링하기 위해 시작하는 데 도움이 되는 PostgreSQL 로그에 대한 필수 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-logs-dashboard.json')} download="postgresql-logs-dashboard.json" eventName="docs.postgres_logs_monitoring.dashboard_download">대시보드 구성 다운로드</TrackedLink> {#download}

#### 미리 구축된 대시보드 가져오기 {#import-dashboard}

1. HyperDX를 열고 대시보드 섹션으로 이동합니다.
2. 오른쪽 상단의 줄임표 아래에서 **대시보드 가져오기**를 클릭합니다.

<Image img={import_dashboard} alt="대시보드 가져오기 버튼"/>

3. `postgresql-logs-dashboard.json` 파일을 업로드하고 **가져오기 완료**를 클릭합니다.

<Image img={finish_import} alt="가져오기 완료"/>

#### 대시보드 보기 {#created-dashboard}

모든 시각화가 사전 구성된 상태로 대시보드가 생성됩니다:

<Image img={logs_dashboard} alt="로그 대시보드"/>

:::note
데모 데이터셋의 경우 시간 범위를 2025-11-10 00:00:00 - 2025-11-11 00:00:00으로 설정해야 합니다. 기본적으로 가져온 대시보드는 시간 범위를 지정하지 않습니다.
:::

</VerticalStepper>

## 문제 해결 {#troubleshooting}

### 사용자 정의 구성이 로드되지 않음 {#troubleshooting-not-loading}

환경 변수가 설정되어 있는지 확인하십시오:
```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

사용자 정의 구성 파일이 마운트되고 읽을 수 있는지 확인합니다:
```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```

### HyperDX에 로그가 나타나지 않음 {#no-logs}

효과적인 구성에 filelog 수신기가 포함되어 있는지 확인하십시오:
```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

수집기 로그에서 오류를 확인합니다:
```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

데모 데이터셋을 사용하는 경우 로그 파일에 접근할 수 있는지 확인합니다:
```bash
docker exec <container> cat /tmp/postgres-demo/postgresql.log | wc -l
```

## 다음 단계 {#next-steps}

PostgreSQL 로그 모니터링을 설정한 후:

- [경고](/use-cases/observability/clickstack/alerts)를 설정하여 중요한 이벤트(연결 실패, 느린 쿼리, 오류 급증)를 모니터링합니다.
- [PostgreSQL 메트릭](/use-cases/observability/clickstack/integrations/postgresql-metrics)과 로그를 상관관계 분석하여 포괄적인 데이터베이스 모니터링을 수행합니다.
- 애플리케이션 전용 쿼리 패턴을 위한 사용자 정의 대시보드를 생성합니다.
- `log_min_duration_statement`를 구성하여 성능 요구 사항에 특화된 느린 쿼리를 식별합니다.

## 프로덕션으로 가기 {#going-to-production}

이 가이드는 Quick Setup을 위해 ClickStack의 내장 OpenTelemetry Collector를 확장합니다. 프로덕션 배포에서는 자체 OTel Collector를 실행하고 데이터를 ClickStack의 OTLP 엔드포인트에 전송하는 것을 권장합니다. 프로덕션 구성에 대해서는 [OpenTelemetry 데이터 전송](/use-cases/observability/clickstack/ingesting-data/opentelemetry)을 참조하세요.
