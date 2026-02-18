---
slug: /use-cases/observability/clickstack/integrations/postgresql-logs
title: 'ClickStack를 사용한 PostgreSQL 로그 모니터링'
sidebar_label: 'PostgreSQL 로그'
pagination_prev: null
pagination_next: null
description: 'ClickStack를 사용한 PostgreSQL 로그 모니터링'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'logs', 'OTel', 'ClickStack', '데이터베이스 모니터링']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import logs_search_view from '@site/static/images/clickstack/postgres/postgres-logs-search-view.png';
import log_view from '@site/static/images/clickstack/postgres/postgres-log-view.png';
import logs_dashboard from '@site/static/images/clickstack/postgres/postgres-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-logs-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack를 사용한 PostgreSQL 로그 모니터링 \{#postgres-logs-clickstack\}

:::note[TL;DR]
이 가이드는 OpenTelemetry collector를 구성하여 PostgreSQL 서버 로그를 수집하도록 설정함으로써 ClickStack를 사용해 PostgreSQL을 모니터링하는 방법을 설명합니다. 다음과 같은 내용을 알 수 있습니다:

- 구조화된 파싱을 위해 PostgreSQL이 로그를 CSV 형식으로 출력하도록 구성하기
- 로그 수집을 위한 맞춤형 OTel collector 구성 파일 작성하기
- 사용자 정의 구성을 사용하여 ClickStack 배포하기
- 미리 준비된 대시보드를 사용해 PostgreSQL 로그 인사이트(에러, 느린 쿼리, 연결 상태)를 시각화하기

운영 환경의 PostgreSQL을 구성하기 전에 연동을 테스트하고자 하는 경우, 샘플 로그가 포함된 데모 데이터셋을 사용할 수 있습니다.

소요 시간: 10-15분
:::

## 기존 PostgreSQL과의 통합 \{#existing-postgres\}

이 섹션에서는 기존에 운영 중인 PostgreSQL 인스턴스에서 ClickStack OTel collector 구성을 수정하여 로그를 ClickStack으로 전송하도록 설정하는 방법을 다룹니다.

기존 환경을 구성하기 전에 PostgreSQL 로그 통합을 먼저 시험해 보고자 한다면, ["Demo dataset"](/use-cases/observability/clickstack/integrations/postgresql-logs#demo-dataset) 섹션에 있는 사전 구성된 환경과 샘플 데이터를 사용하여 테스트할 수 있습니다.

##### 사전 요구 사항 \{#prerequisites\}

- 실행 중인 ClickStack 인스턴스
- 버전 9.6 이상이 설치된 PostgreSQL
- PostgreSQL 설정 파일을 수정할 수 있는 권한
- 로그 파일용 충분한 디스크 공간

<VerticalStepper headerLevel="h4">
  #### PostgreSQL 로깅 구성하기

  PostgreSQL은 여러 로그 형식을 지원합니다. OpenTelemetry를 사용한 구조화된 파싱을 위해서는 일관되고 파싱 가능한 출력을 제공하는 CSV 형식을 권장합니다.

  `postgresql.conf` 파일은 일반적으로 다음 위치에 있습니다:

  * **Linux (apt/yum)**: `/etc/postgresql/{version}/main/postgresql.conf`
  * **macOS (Homebrew)**: `/usr/local/var/postgres/postgresql.conf` 또는 `/opt/homebrew/var/postgres/postgresql.conf`
  * **Docker**: 구성은 일반적으로 환경 변수 또는 마운트된 설정 파일을 통해 설정합니다

  `postgresql.conf`에서 다음 설정을 추가하거나 수정하세요:

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
  이 가이드는 안정적인 구조화된 파싱을 위해 PostgreSQL의 `csvlog` 형식을 사용합니다. `stderr` 또는 `jsonlog` 형식을 사용하는 경우 OpenTelemetry 수집기 구성을 그에 맞게 조정하십시오.
  :::

  이러한 변경 사항을 적용한 후 PostgreSQL을 재시작하세요:

  ```bash
  # For systemd
  sudo systemctl restart postgresql

  # For Docker
  docker restart 
  ```

  로그가 정상적으로 기록되고 있는지 확인하세요:

  ```bash
  # Default log location on Linux
  tail -f /var/lib/postgresql/{version}/main/log/postgresql-*.log

  # macOS Homebrew
  tail -f /usr/local/var/postgres/log/postgresql-*.log
  ```

  #### 사용자 정의 OTel collector 구성 생성하기

  ClickStack을 사용하면 사용자 정의 구성 파일을 마운트하고 환경 변수를 설정하여 기본 OpenTelemetry Collector 구성을 확장할 수 있습니다. 사용자 정의 구성은 HyperDX가 OpAMP를 통해 관리하는 기본 구성과 병합됩니다.

  다음 구성으로 `postgres-logs-monitoring.yaml` 파일을 생성하세요:

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

  이 구성:

  * 기본 위치에서 PostgreSQL CSV 로그를 읽습니다
  * 여러 줄로 구성된 로그 항목을 처리합니다(오류는 여러 줄에 걸쳐 기록되는 경우가 많습니다)
  * 모든 표준 PostgreSQL 로그 필드가 포함된 CSV 형식을 파싱합니다.
  * 원본 로그의 시간 정보를 보존하기 위해 타임스탬프를 추출합니다
  * HyperDX에서 필터링에 사용할 수 있도록 `source: postgresql` 속성을 추가합니다
  * 전용 파이프라인을 통해 로그를 ClickHouse exporter로 전달합니다

  :::note

  * 사용자 정의 구성에서는 새로운 receiver와 pipeline만 정의합니다
  * 프로세서(`memory_limiter`, `transform`, `batch`)와 exporter(내보내기)(`clickhouse`)는 기본 ClickStack 구성에 이미 정의되어 있으므로 이름만 참조하면 됩니다.
  * `csv_parser` 연산자는 모든 표준 PostgreSQL CSV 로그 필드를 구조화된 속성으로 추출합니다.
  * 이 구성은 collector가 다시 시작될 때 로그를 재수집하지 않도록 `start_at: end`를 사용합니다. 테스트 시에는 `start_at: beginning`으로 변경하여 과거 로그를 바로 확인할 수 있습니다.
  * PostgreSQL 로그 디렉터리 위치에 맞도록 `include` 경로를 조정하십시오
    :::

  #### 사용자 지정 구성을 로드하도록 ClickStack 구성하기

  기존 ClickStack 배포에서 사용자 정의 수집기 구성을 활성화하려면 다음을 수행하십시오:

  1. `/etc/otelcol-contrib/custom.config.yaml`에 사용자 정의 구성 파일을 마운트하십시오.
  2. 환경 변수 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`를 설정하십시오.
  3. PostgreSQL 로그 디렉터리를 마운트하여 수집기가 로그를 읽을 수 있도록 합니다

  ##### 옵션 1: Docker Compose

  ClickStack 배포 구성을 업데이트하세요:

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

  ##### 옵션 2: Docker Run (올인원 이미지)

  `docker run`으로 올인원 이미지를 사용하는 경우:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/lib/postgresql:/var/lib/postgresql:ro \
    clickhouse/clickstack-all-in-one:latest
  ```

  :::note
  ClickStack 수집기가 PostgreSQL 로그 파일을 읽을 수 있는 적절한 권한을 보유하고 있는지 확인하세요. 프로덕션 환경에서는 읽기 전용 마운트(`:ro`)를 사용하고 최소 권한 원칙을 준수하세요.
  :::

  #### HyperDX에서 로그 확인

  구성을 완료한 후 HyperDX에 로그인하여 로그가 수집되고 있는지 확인하세요:

  1. 검색 화면으로 이동합니다
  2. Source를 「Logs」로 설정하십시오
  3. PostgreSQL 전용 로그만 보려면 `source:postgresql`로 필터링합니다
  4. `user_name`, `database_name`, `error_severity`, `message`, `query` 등의 필드를 포함한 구조화된 로그 엔트리가 표시되어야 합니다.

  <Image img={logs_search_view} alt="로그 검색 화면" />

  <Image img={log_view} alt="로그 뷰" />
</VerticalStepper>

## 데모 데이터세트 {#demo-dataset}

운영 환경을 설정하기 전에 PostgreSQL 로그 연동을 테스트하려는 사용자를 위해, 현실적인 패턴을 포함한 미리 생성된 PostgreSQL 로그의 샘플 데이터세트를 제공합니다.

<VerticalStepper headerLevel="h4">

#### 샘플 데이터세트 다운로드 \{#download-sample\}

샘플 로그 파일을 다운로드합니다:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgresql.log
```

#### 테스트용 collector 구성 생성 \{#test-config\}

다음 구성이 포함된 `postgres-logs-demo.yaml` 파일을 생성합니다:

```yaml
cat > postgres-logs-demo.yaml << 'EOF'
receivers:
  filelog/postgres:
    include:
      - /tmp/postgres-demo/postgresql.log
    start_at: beginning  # 데모 데이터에 대해 처음부터 읽습니다
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

#### 데모 설정으로 ClickStack 실행 {#run-demo}

데모 로그와 구성을 사용하여 ClickStack을 실행합니다:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/postgresql.log:/tmp/postgres-demo/postgresql.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

#### HyperDX에서 로그 확인 {#verify-demo-logs}

ClickStack이 실행되면 다음 단계를 수행합니다:

1. [HyperDX](http://localhost:8080/)를 열고 계정으로 로그인합니다(먼저 계정을 생성해야 할 수 있습니다)
2. Search 뷰로 이동한 다음 source를 `Logs`로 설정합니다
3. 시간 범위를 **2025-11-09 00:00:00 - 2025-11-12 00:00:00**으로 설정합니다

:::note[Timezone Display]
HyperDX는 브라우저의 로컬 시간대를 기준으로 타임스탬프를 표시합니다. 데모 데이터는 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** 구간에 해당합니다. 넓은 시간 범위를 사용하면 위치와 상관없이 데모 로그를 확인할 수 있습니다. 로그가 표시되면, 보다 명확한 시각화를 위해 범위를 24시간 구간으로 좁힐 수 있습니다.
:::

<Image img={logs_search_view} alt="로그 검색 뷰"/>

<Image img={log_view} alt="로그 상세 뷰"/>

</VerticalStepper>

## 대시보드와 시각화 {#dashboards}

ClickStack으로 PostgreSQL을 모니터링하기 시작하는 데 도움이 되도록 PostgreSQL 로그를 위한 핵심 시각화 대시보드를 제공합니다.

<VerticalStepper headerLevel="h4">

#### 대시보드 구성 파일을 <TrackedLink href={useBaseUrl('/examples/postgres-logs-dashboard.json')} download="postgresql-logs-dashboard.json" eventName="docs.postgres_logs_monitoring.dashboard_download">다운로드</TrackedLink> {#download}

#### 사전 구성된 대시보드 가져오기 \{#import-dashboard\}

1. HyperDX를 열고 Dashboards 섹션으로 이동합니다.
2. 오른쪽 상단의 줄임표(…) 아이콘 아래에 있는 **Import Dashboard**를 클릭합니다.

<Image img={import_dashboard} alt="대시보드 가져오기 버튼"/>

3. `postgresql-logs-dashboard.json` 파일을 업로드한 후 **Finish Import**를 클릭합니다.

<Image img={finish_import} alt="가져오기 완료"/>

#### 대시보드 보기 \{#created-dashboard\}

대시보드는 모든 시각화가 사전 구성된 상태로 생성됩니다.

<Image img={logs_dashboard} alt="로그 대시보드"/>

:::note
데모 데이터셋의 경우 시간 범위를 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**로 설정합니다(로컬 시간대에 맞게 조정하십시오). 가져온 대시보드는 기본적으로 시간 범위가 지정되어 있지 않습니다.
:::

</VerticalStepper>

## 문제 해결 {#troubleshooting}

### 사용자 정의 설정이 로드되지 않음

환경 변수가 설정되어 있는지 확인합니다:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

사용자 정의 구성 파일이 마운트되어 있고 읽을 수 있는지 확인하십시오:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```


### HyperDX에 로그가 표시되지 않는 경우

실제 적용되는 구성에 `filelog` receiver가 포함되어 있는지 확인하십시오:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

수집기 로그에서 오류가 있는지 확인하십시오:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

데모 데이터 세트를 사용하는 경우, 로그 파일에 액세스할 수 있는지 확인합니다:

```bash
docker exec <container> cat /tmp/postgres-demo/postgresql.log | wc -l
```


## 다음 단계 {#next-steps}

PostgreSQL 로그 모니터링을 설정한 후에는 다음 작업을 진행합니다.

- 중요한 이벤트(연결 실패, 느린 쿼리, 오류 급증)에 대한 [알림](/use-cases/observability/clickstack/alerts)을 설정합니다.
- 포괄적인 데이터베이스 모니터링을 위해 로그를 [PostgreSQL metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics)와 연관시킵니다.
- 애플리케이션별 쿼리 패턴을 위한 사용자 지정 대시보드를 생성합니다.
- 성능 요구 사항에 따라 느린 쿼리를 식별할 수 있도록 `log_min_duration_statement`를 구성합니다.

## 프로덕션 환경으로 전환하기 {#going-to-production}

이 가이드는 빠른 설정을 위해 ClickStack에 내장된 OpenTelemetry Collector를 기반으로 합니다. 프로덕션 배포 환경에서는 자체 OTel Collector를 실행하고 데이터를 ClickStack의 OTLP 엔드포인트로 전송할 것을 권장합니다. 프로덕션 구성을 위해서는 [OpenTelemetry 데이터 전송](/use-cases/observability/clickstack/ingesting-data/opentelemetry)을 참조하십시오.