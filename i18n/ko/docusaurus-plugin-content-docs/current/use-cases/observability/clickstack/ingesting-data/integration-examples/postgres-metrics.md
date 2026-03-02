---
slug: /use-cases/observability/clickstack/integrations/postgresql-metrics
title: 'ClickStack를 사용한 PostgreSQL 메트릭 모니터링'
sidebar_label: 'PostgreSQL 메트릭'
pagination_prev: null
pagination_next: null
description: 'ClickStack를 사용한 PostgreSQL 메트릭 모니터링'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'metrics', 'OTEL', 'ClickStack', 'database monitoring']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/postgres/postgres-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack으로 PostgreSQL 메트릭 모니터링하기 \{#postgres-metrics-clickstack\}

:::note[요약]
이 가이드는 OpenTelemetry collector의 PostgreSQL receiver를 구성하여 ClickStack을 사용해 PostgreSQL 성능 메트릭을 모니터링하는 방법을 설명합니다. 다음 내용을 학습할 수 있습니다:

- PostgreSQL 메트릭을 수집하도록 OTel collector 구성하기
- 사용자 정의 구성을 사용해 ClickStack 배포하기
- 미리 준비된 대시보드를 사용해 PostgreSQL 성능(트랜잭션, 연결 수, 데이터베이스 크기, 캐시 히트 비율) 시각화하기

운영 PostgreSQL 데이터베이스를 구성하기 전에 이 통합을 테스트하려는 경우, 샘플 메트릭이 포함된 데모 데이터셋을 사용할 수 있습니다.

소요 시간: 10–15분
:::

## 기존 PostgreSQL과의 통합 \{#existing-postgres\}

이 섹션에서는 PostgreSQL receiver가 설정된 ClickStack OTel collector를 구성하여 기존 PostgreSQL 설치 환경에서 ClickStack으로 메트릭을 전송하도록 설정하는 방법을 다룹니다.

기존 환경을 구성하기 전에 PostgreSQL 메트릭 통합을 먼저 테스트해 보고 싶다면, [다음 섹션](#demo-dataset)에 있는 사전 구성된 데모 데이터셋으로 테스트할 수 있습니다.

##### 사전 준비 사항 \{#prerequisites\}

- 실행 중인 ClickStack 인스턴스
- 기존 PostgreSQL 설치(버전 9.6 이상)
- ClickStack에서 PostgreSQL로의 네트워크 액세스(기본 포트 5432)
- 적절한 권한을 가진 PostgreSQL 모니터링용 사용자

<VerticalStepper headerLevel="h4">

#### 모니터링용 사용자가 필요한 권한을 갖추었는지 확인 \{#monitoring-permissions\}

PostgreSQL 수신기(receiver)는 STATISTICS 뷰에 대한 읽기 권한이 있는 사용자가 필요합니다. 모니터링용 사용자에게 `pg_monitor` 롤을 부여하십시오:

```sql
GRANT pg_monitor TO your_monitoring_user;
```

#### 사용자 정의 OTel collector 설정 생성 \{#create-custom-config\}

ClickStack에서는 사용자 정의 설정 파일을 마운트하고 환경 변수를 설정하여 기본 OpenTelemetry collector 설정을 확장할 수 있습니다.

`postgres-metrics.yaml` 파일을 생성합니다:

```yaml
receivers:
  postgresql:
    endpoint: postgres-host:5432
    transport: tcp
    username: otel_monitor
    password: ${env:POSTGRES_PASSWORD}
    databases:
      - postgres
      - your_application_db # 실제 데이터베이스 이름으로 바꾸십시오
    collection_interval: 30s
    tls:
      insecure: true

processors:
  resourcedetection:
    detectors: [env, system, docker]
    timeout: 5s
  batch:
    timeout: 10s
    send_batch_size: 1024

exporters:
  clickhouse:
    endpoint: tcp://localhost:9000
    database: default
    ttl: 96h

service:
  pipelines:
    metrics/postgres:
      receivers: [postgresql]
      processors: [resourcedetection, batch]
      exporters: [clickhouse]
```

:::note
`tls: insecure: true` 설정은 개발/테스트 환경에서 SSL 검증을 비활성화합니다. SSL이 활성화된 운영 환경의 PostgreSQL에서는 이 줄을 제거하거나 적절한 인증서를 구성해야 합니다.
:::

#### 사용자 정의 설정으로 ClickStack 배포 \{#deploy-clickstack\}

사용자 정의 설정을 마운트합니다:

```bash
docker run -d \
  --name clickstack-postgres \
  -p 8123:8123 -p 9000:9000 -p 4317:4317 -p 4318:4318 \
  -e HYPERDX_API_KEY=your-api-key \
  -e CLICKHOUSE_PASSWORD=your-clickhouse-password \
  -e POSTGRES_PASSWORD=secure_password_here \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  clickhouse/clickstack:latest
```

#### 메트릭 수집 확인 \{#verify-metrics\}

구성이 완료되면 HyperDX에 로그인하여 메트릭이 정상적으로 유입되는지 확인합니다:

1. Metrics Explorer로 이동합니다.
2. `postgresql.`로 시작하는 메트릭을 검색합니다. (예: `postgresql.backends`, `postgresql.commits`)
3. 설정한 수집 주기마다 메트릭 데이터 포인트가 나타나는지 확인합니다.

메트릭 수집이 정상적으로 이루어지면, 미리 빌드된 대시보드를 가져오기 위해 [Dashboards and visualization](#dashboards) 섹션으로 이동합니다.

</VerticalStepper>

## 데모 데이터 세트 \{#demo-dataset\}

운영 환경을 구성하기 전에 PostgreSQL 메트릭 연동을 테스트하려는 사용자를 위해, 현실적인 PostgreSQL 메트릭 패턴이 포함된 미리 생성된 데이터 세트를 제공합니다.

:::note[데이터베이스 수준 메트릭 전용]
이 데모 데이터 세트에는 샘플 데이터를 가볍게 유지하기 위해 데이터베이스 수준 메트릭만 포함되어 있습니다. 실제 PostgreSQL 데이터베이스를 모니터링할 때는 테이블 및 인덱스 메트릭이 자동으로 수집됩니다.
:::

<VerticalStepper headerLevel="h4">

#### 샘플 메트릭 데이터 세트 다운로드 \{#download-sample\}

미리 생성된 메트릭 파일(현실적인 패턴이 적용된 24시간 분량의 PostgreSQL 메트릭)을 다운로드하십시오:

```bash
# gauge 메트릭 다운로드 (connections, database size)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-gauge.csv

# sum 메트릭 다운로드 (commits, rollbacks, operations)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-sum.csv
```

데이터 세트에는 다음과 같은 현실적인 패턴이 포함되어 있습니다.
- **아침 연결 급증(08:00)** - 로그인 급증
- **캐시 성능 문제(11:00)** - Blocks_read 급증
- **애플리케이션 버그(14:00-14:30)** - 롤백 비율이 15%까지 상승
- **데드락 발생(14:15, 16:30)** - 드문 데드락

#### ClickStack 시작 \{#start-clickstack\}

ClickStack 인스턴스를 시작하십시오:

```bash
docker run -d --name clickstack-postgres-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

ClickStack이 완전히 시작될 때까지 약 30초 정도 기다리십시오.

#### 메트릭을 ClickStack에 적재 \{#load-metrics\}

메트릭을 ClickHouse에 직접 적재합니다:

```bash
# gauge 메트릭 적재
cat postgres-metrics-gauge.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# sum 메트릭 적재
cat postgres-metrics-sum.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### HyperDX에서 메트릭 확인 \{#verify-metrics-demo\}

메트릭을 적재한 후, 가장 빠르게 메트릭을 확인하는 방법은 미리 만들어진 대시보드를 사용하는 것입니다.

[Dashboards and visualization](#dashboards) 섹션으로 이동하여 대시보드를 불러오고, 여러 PostgreSQL 메트릭을 한 번에 확인하십시오.

:::note[시간대 표시]
HyperDX는 브라우저의 로컬 시간대에 맞춰 타임스탬프를 표시합니다. 데모 데이터는 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** 범위의 데이터를 포함합니다. 위치와 관계없이 데모 메트릭이 보이도록 시간 범위를 **2025-11-09 00:00:00 - 2025-11-12 00:00:00**로 설정하십시오. 메트릭이 표시되면, 시각화를 더 명확하게 하기 위해 범위를 24시간으로 좁힐 수 있습니다.
:::

</VerticalStepper>

## 대시보드와 시각화 \{#dashboards\}

ClickStack으로 PostgreSQL을 모니터링하기 시작할 수 있도록, PostgreSQL 메트릭을 위한 핵심 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-metrics-dashboard.json')} download="postgres-metrics-dashboard.json" eventName="docs.postgres_metrics_monitoring.dashboard_download">대시보드 구성 다운로드</TrackedLink> \{#download\}

#### 미리 구성된 대시보드 가져오기 \{#import-dashboard\}

1. HyperDX를 열고 Dashboards 섹션으로 이동합니다.
2. 오른쪽 상단의 줄임표 메뉴 아래에서 **Import Dashboard**를 클릭합니다.

<Image img={import_dashboard} alt="대시보드 가져오기 버튼"/>

3. `postgres-metrics-dashboard.json` 파일을 업로드한 후 **Finish Import**를 클릭합니다.

<Image img={finish_import} alt="가져오기 완료 대화 상자"/>

#### 대시보드 보기 \{#created-dashboard\}

대시보드는 모든 시각화가 미리 구성된 상태로 생성됩니다.

<Image img={example_dashboard} alt="PostgreSQL 메트릭 대시보드"/>

:::note
데모 데이터셋을 사용하는 경우, 시간 범위를 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**로 설정합니다(로컬 시간대에 맞게 조정하십시오). 가져온 대시보드는 기본적으로 시간 범위가 지정되어 있지 않습니다.
:::

</VerticalStepper>

## 문제 해결 \{#troubleshooting\}

### 사용자 정의 구성이 로드되지 않는 경우 \{#troubleshooting-not-loading\}

환경 변수가 설정되어 있는지 확인하십시오:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

사용자 정의 구성 파일이 마운트되었는지 확인하십시오:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```


### HyperDX에 메트릭이 표시되지 않는 경우 \{#no-metrics\}

PostgreSQL에 정상적으로 접속 가능한지 확인하십시오:

```bash
docker exec <clickstack-container> psql -h postgres-host -U otel_monitor -d postgres -c "SELECT 1"
```

OTel collector 로그를 확인하십시오:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```


### 인증 오류 \{#auth-errors\}

비밀번호가 올바르게 설정되었는지 확인하십시오:

```bash
docker exec <clickstack-container> printenv POSTGRES_PASSWORD
```

자격 증명을 직접 테스트하십시오:

```bash
psql -h postgres-host -U otel_monitor -d postgres -c "SELECT version();"
```


## 다음 단계 \{#next-steps\}

PostgreSQL 메트릭 모니터링을 설정한 후 다음 단계를 수행합니다.

- 중요한 임계값(연결 제한, 높은 롤백 비율, 낮은 캐시 적중률)에 대한 [알림](/use-cases/observability/clickstack/alerts)을 설정합니다.
- `pg_stat_statements` 확장을 사용하여 쿼리 수준 모니터링을 활성화합니다.
- 서로 다른 엔드포인트와 서비스 이름을 사용하여 receiver 구성을 복제하고, 여러 PostgreSQL 인스턴스를 모니터링합니다.

## 프로덕션 환경으로 이전하기 \{#going-to-production\}

이 가이드는 빠른 설정을 위해 ClickStack에 기본 제공되는 OpenTelemetry Collector 구성을 확장합니다. 프로덕션 배포 환경에서는 자체 OTel collector를 운영하고 데이터를 ClickStack의 OTLP 엔드포인트로 전송할 것을 권장합니다. 프로덕션 환경 구성을 위해서는 [OpenTelemetry 데이터 전송](/use-cases/observability/clickstack/ingesting-data/opentelemetry)을 참조하십시오.