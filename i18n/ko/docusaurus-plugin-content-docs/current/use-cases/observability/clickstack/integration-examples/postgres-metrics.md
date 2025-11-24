---
'slug': '/use-cases/observability/clickstack/integrations/postgresql-metrics'
'title': 'ClickStack로 PostgreSQL 메트릭 모니터링'
'sidebar_label': 'PostgreSQL 메트릭'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack로 PostgreSQL 메트릭 모니터링'
'doc_type': 'guide'
'keywords':
- 'PostgreSQL'
- 'Postgres'
- 'metrics'
- 'OTEL'
- 'ClickStack'
- 'database monitoring'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/postgres/postgres-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Monitoring PostgreSQL Metrics with ClickStack {#postgres-metrics-clickstack}

:::note[TL;DR]
이 가이드는 OpenTelemetry 수집기의 PostgreSQL 리시버를 구성하여 ClickStack으로 PostgreSQL 성능 지표를 모니터링하는 방법을 보여줍니다. 다음을 배우게 됩니다:

- PostgreSQL 지표 수집을 위한 OTel 수집기 구성
- 사용자 지정 구성으로 ClickStack 배포
- PostgreSQL 성능을 시각화하기 위한 미리 구축된 대시보드 사용 (트랜잭션, 연결, 데이터베이스 크기, 캐시 적중 비율)

생산 PostgreSQL 데이터베이스를 구성하기 전에 통합을 테스트하고 싶은 경우 샘플 지표가 포함된 데모 데이터 세트를 사용할 수 있습니다.

소요 시간: 10-15 분
:::

## Integration with existing PostgreSQL {#existing-postgres}

이 섹션에서는 ClickStack OTel 수집기를 PostgreSQL 리시버로 구성하여 기존 PostgreSQL 설치가 지표를 ClickStack으로 전송하도록 구성하는 방법을 다룹니다.

자신의 기존 설정을 구성하기 전에 PostgreSQL 지표 통합을 테스트하고 싶다면 [다음 섹션](#demo-dataset)의 미리 구성된 데모 데이터 세트로 테스트할 수 있습니다.

##### Prerequisites {#prerequisites}
- ClickStack 인스턴스 실행 중
- 기존 PostgreSQL 설치 (버전 9.6 이상)
- ClickStack에서 PostgreSQL로의 네트워크 액세스 (기본 포트 5432)
- 적절한 권한이 있는 PostgreSQL 모니터링 사용자

<VerticalStepper headerLevel="h4">

#### Ensure monitoring user has required permissions {#monitoring-permissions}

PostgreSQL 리시버는 통계 뷰에 대한 읽기 액세스 권한이 있는 사용자가 필요합니다. 모니터링 사용자에게 `pg_monitor` 역할을 부여하십시오:

```sql
GRANT pg_monitor TO your_monitoring_user;
```

#### Create custom OTel collector configuration {#create-custom-config}

ClickStack은 사용자 지정 구성 파일을 마운트하고 환경 변수를 설정하여 OpenTelemetry 수집기 구성을 확장할 수 있도록 합니다.

`postgres-metrics.yaml`을 생성합니다:

```yaml
receivers:
  postgresql:
    endpoint: postgres-host:5432
    transport: tcp
    username: otel_monitor
    password: ${env:POSTGRES_PASSWORD}
    databases:
      - postgres
      - your_application_db # Replace with your actual database names
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
`tls: insecure: true` 설정은 개발/테스트를 위해 SSL 검증을 비활성화합니다. SSL이 활성화된 생산 PostgreSQL의 경우 이 줄을 제거하거나 적절한 인증서를 구성하십시오.
:::

#### Deploy ClickStack with custom configuration {#deploy-clickstack}

사용자 지정 구성을 마운트합니다:

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

#### Verify metrics collection {#verify-metrics}

구성이 완료되면 HyperDX에 로그인하고 지표가 흐르고 있는지 확인하십시오:

1. Metrics 탐색기로 이동
2. postgresql로 시작하는 지표 검색 (예: postgresql.backends, postgresql.commits)
3. 구성된 수집 간격에 따라 지표 데이터 포인트가 나타나는 것을 확인해야 합니다.

지표가 흐르면 [Dashboards and visualization](#dashboards) 섹션으로 진행하여 미리 구축된 대시보드를 가져옵니다.

</VerticalStepper>

## Demo dataset {#demo-dataset}

생산 시스템을 구성하기 전에 PostgreSQL 지표 통합을 테스트하려는 사용자에게는 현실적인 PostgreSQL 지표 패턴이 포함된 미리 생성된 데이터 세트를 제공합니다.

:::note[Database-level metrics only]
이 데모 데이터 세트는 샘플 데이터를 가볍게 유지하기 위해 데이터베이스 수준의 지표만 포함합니다. 실제 PostgreSQL 데이터베이스를 모니터링할 때 테이블 및 인덱스 지표가 자동으로 수집됩니다.
:::

<VerticalStepper headerLevel="h4">

#### Download the sample metrics dataset {#download-sample}

현실적인 패턴의 PostgreSQL 지표가 포함된 미리 생성된 지표 파일을 다운로드합니다 (24시간의 PostgreSQL 지표):

```bash

# Download gauge metrics (connections, database size)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-gauge.csv


# Download sum metrics (commits, rollbacks, operations)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-sum.csv
```

데이터 세트에는 다음과 같은 현실적인 패턴이 포함됩니다:
- **아침 연결 급증 (08:00)** - 로그인 러시
- **캐시 성능 문제 (11:00)** - Blocks_read 급증
- **애플리케이션 버그 (14:00-14:30)** - 롤백 비율이 15%로 급증
- **교착 상태 사건 (14:15, 16:30)** - 드문 교착 상태

#### Start ClickStack {#start-clickstack}

ClickStack 인스턴스를 시작합니다:

```bash
docker run -d --name clickstack-postgres-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

ClickStack이 완전히 시작되기까지 약 30초를 기다립니다.

#### Load metrics into ClickStack {#load-metrics}

지표를 ClickHouse로 직접 로드합니다:

```bash

# Load gauge metrics
cat postgres-metrics-gauge.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"


# Load sum metrics
cat postgres-metrics-sum.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### Verify metrics in HyperDX {#verify-metrics-demo}

로드가 완료되면 미리 구축된 대시보드를 통해 지표를 확인하는 가장 빠른 방법입니다.

[Dashboards and visualization](#dashboards) 섹션으로 진행하여 대시보드를 가져오고 동시에 많은 PostgreSQL 지표를 확인하십시오.

:::note
데모 데이터 세트의 시간 범위는 2025년 11월 10일 00:00:00부터 2025년 11월 11일 00:00:00까지입니다. HyperDX의 시간 범위가 이 창과 일치하는지 확인하십시오.
:::

</VerticalStepper>

## Dashboards and visualization {#dashboards}

ClickStack을 사용하여 PostgreSQL 모니터링을 시작하는 데 도움이 되는 PostgreSQL 지표에 대한 필수 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-metrics-dashboard.json')} download="postgres-metrics-dashboard.json" eventName="docs.postgres_metrics_monitoring.dashboard_download">Download</TrackedLink> the dashboard configuration {#download}

#### Import the pre-built dashboard {#import-dashboard}

1. HyperDX를 열고 대시보드 섹션으로 이동
2. 오른쪽 상단의 점 3개에서 **Import Dashboard** 클릭

<Image img={import_dashboard} alt="Import dashboard button"/>

3. `postgres-metrics-dashboard.json` 파일을 업로드하고 **Finish Import** 클릭

<Image img={finish_import} alt="Finish import dialog"/>

#### View the dashboard {#created-dashboard}

대시보드는 모든 시각화가 미리 구성된 상태로 생성됩니다:

<Image img={example_dashboard} alt="PostgreSQL metrics dashboard"/>

:::note
데모 데이터 세트의 경우 시간 범위가 2025년 11월 10일 00:00:00 - 2025년 11월 11일 00:00:00로 설정되어 있는지 확인하십시오.
:::

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### Custom config not loading {#troubleshooting-not-loading}

환경 변수가 설정되었는지 확인하십시오:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

사용자 정의 구성 파일이 마운트되었는지 확인하십시오:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### No metrics appearing in HyperDX {#no-metrics}

PostgreSQL에 접근할 수 있는지 확인하십시오:

```bash
docker exec <clickstack-container> psql -h postgres-host -U otel_monitor -d postgres -c "SELECT 1"
```

OTel 수집기 로그를 확인하십시오:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

### Authentication errors {#auth-errors}

비밀번호가 올바르게 설정되었는지 확인하십시오:

```bash
docker exec <clickstack-container> printenv POSTGRES_PASSWORD
```

자격 증명을 직접 테스트하십시오:

```bash
psql -h postgres-host -U otel_monitor -d postgres -c "SELECT version();"
```

## Next steps {#next-steps}

PostgreSQL 지표 모니터링을 설정한 후:

- [alerts](/use-cases/observability/clickstack/alerts) 설정하기 (연결 한도, 높은 롤백 비율, 낮은 캐시 적중 비율)
- `pg_stat_statements` 확장을 사용하여 쿼리 수준 모니터링 활성화
- 서로 다른 엔드포인트 및 서비스 이름으로 리시버 구성을 복제하여 여러 PostgreSQL 인스턴스를 모니터링

## Going to production {#going-to-production}

이 가이드는 ClickStack의 내장 OpenTelemetry Collector를 확장하여 빠르게 설정할 수 있도록 합니다. 생산 배포를 위해서는 자체 OTel Collector를 실행하고 ClickStack의 OTLP 엔드포인트로 데이터를 전송하는 것을 권장합니다. 생산 구성에 대한 자세한 내용은 [Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry)를 참조하십시오.
