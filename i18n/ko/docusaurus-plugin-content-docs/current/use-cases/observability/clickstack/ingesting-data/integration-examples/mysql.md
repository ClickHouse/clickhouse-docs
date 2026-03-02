---
slug: /use-cases/observability/clickstack/integrations/mysql-logs
title: 'ClickStack를 사용한 MySQL 로그 모니터링'
sidebar_label: 'MySQL 로그'
pagination_prev: null
pagination_next: null
description: 'ClickStack를 사용한 MySQL 로그 모니터링'
doc_type: 'guide'
keywords: ['MySQL', '로그', 'OTel', 'ClickStack', '데이터베이스 모니터링', '느린 쿼리']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import search_view from '@site/static/images/clickstack/mysql/search-view.png';
import log_view from '@site/static/images/clickstack/mysql/log-view.png';
import finish_import from '@site/static/images/clickstack/mysql/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/mysql/example-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack로 MySQL 로그 모니터링하기 \{#mysql-logs-clickstack\}

:::note[요약]
이 가이드는 OpenTelemetry collector를 구성하여 MySQL 서버 로그를 수집하고, ClickStack으로 MySQL을 모니터링하는 방법을 설명합니다. 다음 내용을 학습할 수 있습니다:

- MySQL이 오류 로그와 느린 쿼리 로그를 출력하도록 구성하기
- 로그 수집용 사용자 정의 OTel collector 구성 생성하기
- 사용자 정의 구성을 사용해 ClickStack 배포하기
- 미리 준비된 대시보드를 사용해 MySQL 로그 분석 결과(오류, 느린 쿼리, 연결)를 시각화하기

프로덕션 MySQL을 구성하기 전에 통합을 테스트하려는 경우, 샘플 로그가 포함된 데모 데이터셋을 사용할 수 있습니다.

소요 시간: 10~15분
:::

## 기존 MySQL과의 연동 \{#existing-mysql\}

이 섹션에서는 기존 MySQL 설치 환경에서 ClickStack OTel collector 구성을 수정하여, 로그를 ClickStack으로 전송하도록 설정하는 방법을 설명합니다.

기존 환경을 직접 구성하기 전에 MySQL 로그 연동을 시험해 보고자 한다면, ["데모 데이터셋"](/use-cases/observability/clickstack/integrations/mysql-logs#demo-dataset) 섹션에 있는 미리 구성된 환경과 샘플 데이터를 사용해 테스트할 수 있습니다.

##### 사전 요구 사항 \{#prerequisites\}

- 실행 중인 ClickStack 인스턴스
- 기존 MySQL 설치(버전 5.7 이상)
- MySQL 설정 파일을 수정할 수 있는 권한
- 로그 파일용 충분한 디스크 공간

<VerticalStepper headerLevel="h4">
  #### MySQL 로깅 설정

  MySQL은 여러 로그 유형을 지원합니다. OpenTelemetry를 사용한 포괄적인 모니터링을 위해 오류 로그와 슬로우 쿼리 로그를 활성화하십시오.

  `my.cnf` 또는 `my.ini` 설정 파일은 일반적으로 다음 위치에 있습니다:

  * **Linux (apt/yum)**: `/etc/mysql/my.cnf` 또는 `/etc/my.cnf`
  * **macOS (Homebrew)**: `/usr/local/etc/my.cnf` 또는 `/opt/homebrew/etc/my.cnf`
  * **Docker**: 구성은 일반적으로 환경 변수나 마운트된 설정 파일을 통해 설정합니다

  `[mysqld]` 섹션에서 다음 설정을 추가하거나 수정하세요:

  ```ini
  [mysqld]
  # Error log configuration
  log_error = /var/log/mysql/error.log

  # Slow query log configuration
  slow_query_log = ON
  slow_query_log_file = /var/log/mysql/mysql-slow.log
  long_query_time = 1
  log_queries_not_using_indexes = ON

  # Optional: General query log (verbose, use with caution in production)
  # general_log = ON
  # general_log_file = /var/log/mysql/mysql-general.log
  ```

  :::note
  슬로우 쿼리 로그는 `long_query_time`초보다 오래 걸리는 쿼리를 캡처합니다. 애플리케이션의 성능 요구사항에 따라 이 임계값을 조정하세요. 너무 낮게 설정하면 과도한 로그가 생성됩니다.
  :::

  이러한 변경 사항을 적용한 후 MySQL을 재시작하세요:

  ```bash
  # For systemd
  sudo systemctl restart mysql

  # For Docker
  docker restart <mysql-container>
  ```

  로그가 기록되고 있는지 확인하세요:

  ```bash
  # Check error log
  tail -f /var/log/mysql/error.log

  # Check slow query log
  tail -f /var/log/mysql/mysql-slow.log
  ```

  #### 사용자 정의 OTel collector 구성 생성하기

  ClickStack은 사용자 정의 구성 파일을 마운트하고 환경 변수를 설정하여 기본 OpenTelemetry Collector 구성을 확장할 수 있습니다. 사용자 정의 구성은 OpAMP를 통해 HyperDX가 관리하는 기본 구성과 병합됩니다.

  다음 구성으로 `mysql-logs-monitoring.yaml` 파일을 생성하세요:

  ```yaml
  receivers:
    filelog/mysql_error:
      include:
        - /var/log/mysql/error.log
      start_at: end
      multiline:
        line_start_pattern: '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}'
      operators:
        - type: regex_parser
          parse_from: body
          parse_to: attributes
          regex: '^(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}[+-]\d{2}:\d{2})\s+(?P<thread_id>\d+)\s+\[(?P<level>[^\]]+)\]\s+(\[(?P<error_code>[^\]]+)\]\s+)?(?P<message>.*)$'
          
        - type: time_parser
          parse_from: attributes.timestamp
          layout_type: gotime
          layout: '2006-01-02T15:04:05.999999-07:00'
          parse_to: body
        
        - type: add
          field: attributes.source
          value: "mysql-error"
        
        - type: add
          field: resource["service.name"]
          value: "mysql-production"

    filelog/mysql_slow:
      include:
        - /var/log/mysql/mysql-slow.log
      start_at: end
      multiline:
        line_start_pattern: '^# Time:'
      operators:
        - type: regex_parser
          parse_from: body
          parse_to: attributes
          regex: '^# Time: (?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\n# User@Host: (?P<user>[^\[]+)\[(?P<user_host>[^\]]*)\]\s+@\s+(?P<host>[^\[]*)\[(?P<ip>[^\]]*)\].*\n# Query_time: (?P<query_time>[\d.]+)\s+Lock_time: (?P<lock_time>[\d.]+)\s+Rows_sent: (?P<rows_sent>\d+)\s+Rows_examined: (?P<rows_examined>\d+)'
        
        - type: time_parser
          parse_from: attributes.timestamp
          layout_type: gotime
          layout: '2006-01-02T15:04:05.999999Z'
          parse_to: body
        
        - type: add
          field: attributes.source
          value: "mysql-slow"
        
        - type: add
          field: resource["service.name"]
          value: "mysql-production"

  service:
    pipelines:
      logs/mysql:
        receivers: [filelog/mysql_error, filelog/mysql_slow]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  ```

  이 구성:

  * 기본 위치에서 MySQL 오류 로그와 슬로 쿼리 로그를 읽습니다
  * 여러 줄로 된 로그 항목(여러 줄에 걸쳐 기록되는 느린 쿼리 포함)을 처리합니다
  * 두 가지 로그 형식을 모두 파싱하여 구조화된 필드(level, error&#95;code, query&#95;time, rows&#95;examined)를 추출합니다.
  * 원본 로그 타임스탬프를 그대로 유지합니다
  * HyperDX에서 필터링에 사용할 수 있도록 `source: mysql-error` 및 `source: mysql-slow` 속성을 추가합니다.
  * 전용 파이프라인을 통해 로그를 ClickHouse exporter로 전송합니다

  :::note
  MySQL 오류 로그와 슬로우 쿼리 로그는 완전히 다른 형식을 가지므로 두 개의 리시버가 필요합니다. `time_parser`는 `gotime` 레이아웃을 사용하여 타임존 오프셋이 포함된 MySQL의 ISO8601 타임스탬프 형식을 처리합니다.
  :::

  #### ClickStack에서 사용자 정의 구성 로드하도록 설정하기

  기존 ClickStack 배포에서 사용자 정의 컬렉터 구성을 활성화하려면 `/etc/otelcol-contrib/custom.config.yaml` 경로에 사용자 정의 구성 파일을 마운트하고 환경 변수 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`을 설정하십시오.

  ClickStack 배포 구성을 업데이트하세요:

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # ... other environment variables ...
      volumes:
        - ./mysql-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - /var/log/mysql:/var/log/mysql:ro
        # ... other volumes ...
  ```

  :::note
  ClickStack 수집기가 MySQL 로그 파일을 읽을 수 있는 적절한 권한을 보유하고 있는지 확인하세요. 읽기 전용 마운트(`:ro`)를 사용하고 최소 권한 원칙을 준수하세요.
  :::

  #### HyperDX에서 로그 확인

  구성을 완료한 후 HyperDX에 로그인하여 로그가 수집되고 있는지 확인하세요:

  1. 검색 화면으로 이동합니다
  2. Source를 「Logs」로 설정하십시오
  3. MySQL 전용 로그를 보려면 `source:mysql-error` 또는 `source:mysql-slow`로 필터링하십시오.
  4. `level`, `error_code`, `message` (에러 로그의 경우) 및 `query_time`, `rows_examined`, `query` (슬로우 쿼리 로그의 경우)와 같은 필드를 포함한 구조화된 로그 항목을 확인할 수 있습니다.

  <Image img={search_view} alt="검색 화면" />

  <Image img={log_view} alt="로그 보기" />
</VerticalStepper>

## 데모 데이터세트 {#demo-dataset}

운영 환경을 구성하기 전에 MySQL 로그 연동을 테스트하려는 사용자를 위해, 현실적인 패턴을 가진 미리 생성된 MySQL 로그의 샘플 데이터세트를 제공합니다.

<VerticalStepper headerLevel="h4">
  #### 샘플 데이터셋 다운로드하기

  샘플 로그 파일을 다운로드하세요:

  ```bash
  # Download error log
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/mysql/error.log

  # Download slow query log
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/mysql/mysql-slow.log
  ```

  데이터셋에는 다음이 포함되어 있습니다:

  * 오류 로그 항목 (시작 메시지, 경고, 연결 오류, InnoDB 메시지)
  * 실제 환경의 성능 특성을 반영한 느린 쿼리
  * 연결 라이프사이클 이벤트
  * 데이터베이스 서버 시작 및 종료 절차

  #### 테스트 수집기 구성 생성하기

  다음 구성으로 `mysql-logs-demo.yaml` 파일을 생성하세요:

  ```yaml
  cat > mysql-logs-demo.yaml << 'EOF'
  receivers:
    filelog/mysql_error:
      include:
        - /tmp/mysql-demo/error.log
      start_at: beginning  # Read from beginning for demo data
      multiline:
        line_start_pattern: '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}'
      operators:
        - type: regex_parser
          parse_from: body
          parse_to: attributes
          regex: '^(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}[+-]\d{2}:\d{2})\s+(?P<thread_id>\d+)\s+\[(?P<level>[^\]]+)\]\s+(\[(?P<error_code>[^\]]+)\]\s+)?(?P<message>.*)$'
        - type: time_parser
          parse_from: attributes.timestamp
          layout_type: gotime
          layout: '2006-01-02T15:04:05.999999-07:00'
          parse_to: body
        - type: add
          field: attributes.source
          value: "mysql-demo-error"
        - type: add
          field: resource["service.name"]
          value: "mysql-demo"

    filelog/mysql_slow:
      include:
        - /tmp/mysql-demo/mysql-slow.log
      start_at: beginning  # Read from beginning for demo data
      multiline:
        line_start_pattern: '^# Time:'
      operators:
        - type: regex_parser
          parse_from: body
          parse_to: attributes
          regex: '^# Time: (?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\n# User@Host: (?P<user>[^\[]+)\[(?P<user_host>[^\]]*)\]\s+@\s+(?P<host>[^\[]*)\[(?P<ip>[^\]]*)\].*\n# Query_time: (?P<query_time>[\d.]+)\s+Lock_time: (?P<lock_time>[\d.]+)\s+Rows_sent: (?P<rows_sent>\d+)\s+Rows_examined: (?P<rows_examined>\d+)'
        - type: time_parser
          parse_from: attributes.timestamp
          layout_type: gotime
          layout: '2006-01-02T15:04:05.999999Z'
          parse_to: body
        - type: add
          field: attributes.source
          value: "mysql-demo-slow"
        - type: add
          field: resource["service.name"]
          value: "mysql-demo"

  service:
    pipelines:
      logs/mysql-demo:
        receivers: [filelog/mysql_error, filelog/mysql_slow]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  EOF
  ```

  #### 데모 구성으로 ClickStack 실행

  데모 로그 및 구성을 사용하여 ClickStack을 실행하세요:

  ```bash
  docker run --name clickstack-demo \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/mysql-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/error.log:/tmp/mysql-demo/error.log:ro" \
    -v "$(pwd)/mysql-slow.log:/tmp/mysql-demo/mysql-slow.log:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  #### HyperDX에서 로그 확인하기

  ClickStack이 실행되고 나면:

  1. ClickStack가 완전히 초기화될 때까지 잠시 기다리십시오 (일반적으로 30–60초 정도 걸립니다)
  2. [HyperDX](http://localhost:8080/)를 열어 계정으로 로그인하십시오 (먼저 계정을 생성해야 할 수도 있습니다)
  3. Search 뷰로 이동한 후 소스를 `Logs`로 설정합니다.
  4. 시간 범위를 **2025-11-13 00:00:00 - 2025-11-16 00:00:00**로 설정하세요
  5. 총 40개의 로그가 표시되어야 합니다 (`source:mysql-demo-error` 소스의 오류 로그 30개 + `source:mysql-demo-slow` 소스의 느린 쿼리 10개).

  :::note
  40개의 로그가 즉시 표시되지 않는 경우, 수집기가 처리를 완료할 때까지 약 1분 정도 기다리세요. 대기 후에도 로그가 표시되지 않으면 `docker restart clickstack-demo`를 실행하고 1분 후에 다시 확인하세요. 이는 `start_at: beginning` 설정으로 기존 파일을 대량 로드할 때 OpenTelemetry filelog 수신기에서 발생하는 알려진 문제입니다. `start_at: end`를 사용하는 프로덕션 배포에서는 로그가 작성되는 즉시 실시간으로 처리되므로 이 문제가 발생하지 않습니다.
  :::

  <Image img={search_view} alt="검색 화면" />

  <Image img={log_view} alt="로그 뷰" />

  :::note[타임존 표시]
  HyperDX는 브라우저의 로컬 타임존으로 타임스탬프를 표시합니다. 데모 데이터는 **2025-11-14 00:00:00 - 2025-11-15 00:00:00 (UTC)** 기간을 포함합니다. 넓은 시간 범위로 인해 위치에 관계없이 데모 로그를 확인할 수 있습니다. 로그를 확인한 후에는 더 명확한 시각화를 위해 범위를 24시간 기간으로 좁히세요.
  :::
</VerticalStepper>

## 대시보드와 시각화 {#dashboards}

ClickStack으로 MySQL을 모니터링하기 시작할 수 있도록 MySQL 로그를 위한 필수 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### 대시보드 구성 파일을 <TrackedLink href={useBaseUrl('/examples/mysql-logs-dashboard.json')} download="mysql-logs-dashboard.json" eventName="docs.mysql_logs_monitoring.dashboard_download">다운로드</TrackedLink> \{#download\}

#### 미리 구성된 대시보드 가져오기 \{#import-dashboard\}

1. HyperDX를 연 다음 Dashboards 섹션으로 이동합니다.
2. 오른쪽 상단의 줄임표 아이콘(…) 아래에서 **Import Dashboard**를 클릭합니다.

<Image img={import_dashboard} alt="대시보드 가져오기 버튼"/>

3. `mysql-logs-dashboard.json` 파일을 업로드한 뒤 **Finish Import**를 클릭합니다.

<Image img={finish_import} alt="가져오기 완료"/>

#### 대시보드 보기 {#created-dashboard}

모든 시각화가 사전 구성된 상태로 대시보드가 생성됩니다.

<Image img={example_dashboard} alt="예시 대시보드"/>

:::note
데모 데이터셋의 경우 시간 범위를 **2025-11-14 00:00:00 - 2025-11-15 00:00:00 (UTC)**로 설정합니다(로컬 시간대에 맞게 조정). 가져온 대시보드는 기본적으로 시간 범위가 지정되어 있지 않습니다.
:::

</VerticalStepper>

## 문제 해결 {#troubleshooting}

### 사용자 정의 구성이 로드되지 않음

환경 변수가 설정되어 있는지 확인합니다:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

사용자 정의 구성 파일이 마운트되어 있고 읽을 수 있는지 확인하십시오:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```


### HyperDX에 로그가 표시되지 않음

실제 적용 중인 구성에 `filelog` 수신기가 포함되어 있는지 확인하십시오:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

Collector 로그에서 오류가 있는지 확인하십시오.

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i mysql
```

데모 데이터 세트를 사용하는 경우 로그 파일에 정상적으로 접근할 수 있는지 확인하십시오:

```bash
docker exec <container> cat /tmp/mysql-demo/error.log | wc -l
docker exec <container> cat /tmp/mysql-demo/mysql-slow.log | wc -l
```


### 슬로우 쿼리 로그가 표시되지 않음

MySQL에서 슬로우 쿼리 로그가 활성화되어 있는지 확인하십시오:

```sql
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';
```

MySQL이 느린 쿼리를 로그로 남기고 있는지 확인하십시오:

```bash
tail -f /var/log/mysql/mysql-slow.log
```

테스트용 느린 쿼리를 생성하십시오:

```sql
SELECT SLEEP(2);
```


### 로그가 제대로 파싱되지 않는 경우

MySQL 로그 형식이 예상되는 형식과 일치하는지 확인하십시오. 이 가이드의 정규식 패턴(regex pattern)은 MySQL 5.7+ 및 8.0+의 기본 로그 형식을 기준으로 설계되었습니다.

에러 로그에서 몇 줄을 직접 확인하십시오:

```bash
head -5 /var/log/mysql/error.log
```

예상 형식:

```text
2025-11-14T10:23:45.123456+00:00 0 [System] [MY-010116] [Server] /usr/sbin/mysqld (mysqld 8.0.35) starting as process 1
```

형식이 크게 다르면 설정의 정규식 패턴을 조정하십시오.


## 다음 단계 {#next-steps}

MySQL 로그 모니터링을 설정한 후 다음 단계를 진행합니다:

- 중요 이벤트(연결 실패, 임계값을 초과하는 느린 쿼리, 오류 급증)에 대한 [알림](/use-cases/observability/clickstack/alerts)을 설정합니다
- 쿼리 패턴별 느린 쿼리 분석을 위한 사용자 지정 대시보드를 만듭니다
- 관찰된 쿼리 성능 패턴에 따라 `long_query_time`을 조정합니다

## 프로덕션 환경으로 전환 {#going-to-production}

이 가이드는 빠른 설정을 위해 ClickStack에 내장된 OpenTelemetry Collector의 기본 구성을 확장합니다. 프로덕션 배포 환경에서는 별도의 OTel Collector를 운영하고 ClickStack의 OTLP 엔드포인트로 데이터를 전송하는 구성을 권장합니다. 프로덕션 구성에 대해서는 [OpenTelemetry 데이터 전송](/use-cases/observability/clickstack/ingesting-data/opentelemetry)을 참조하십시오.