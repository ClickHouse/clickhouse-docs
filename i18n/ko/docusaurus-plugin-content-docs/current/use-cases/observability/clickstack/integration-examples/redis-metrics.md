---
'slug': '/use-cases/observability/clickstack/integrations/redis-metrics'
'title': 'ClickStack로 Redis 메트릭 모니터링'
'sidebar_label': 'Redis 메트릭'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack로 Redis 메트릭 모니터링'
'doc_type': 'guide'
'keywords':
- 'Redis'
- 'metrics'
- 'OTEL'
- 'ClickStack'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/import-redis-metrics-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';



# Monitoring Redis Metrics with ClickStack {#redis-metrics-clickstack}

:::note[TL;DR]
이 가이드는 OpenTelemetry 수집기의 Redis 수신기를 구성하여 ClickStack으로 Redis 성능 메트릭스를 모니터링하는 방법을 보여줍니다. 다음을 배울 수 있습니다:

- Redis 메트릭 수집을 위한 OTel 수집기 구성
- 사용자 지정 구성으로 ClickStack 배포
- Redis 성능을 시각화하기 위한 미리 구축된 대시보드 사용 (명령당 초, 메모리 사용량, 연결된 클라이언트, 캐시 성능)

통합 설정 전에 테스트할 수 있는 데모 데이터 세트가 제공됩니다.

소요 시간: 5-10 분
:::

## Integration with existing Redis {#existing-redis}

이 섹션에서는 ClickStack OTel 수집기를 Redis 수신기와 함께 구성하여 기존의 Redis 설치가 ClickStack으로 메트릭을 전송하도록 설정하는 방법을 다룹니다.

자신의 기존 설정을 구성하기 전에 Redis 메트릭 통합을 테스트하고 싶다면, [다음 섹션](#demo-dataset)에서 미리 구성된 데모 데이터 세트를 테스트할 수 있습니다.

##### Prerequisites {#prerequisites}
- ClickStack 인스턴스 실행 중
- 기존 Redis 설치 (버전 3.0 이상)
- ClickStack에서 Redis로의 네트워크 접근 (기본 포트 6379)
- 인증이 활성화된 경우 Redis 비밀번호

<VerticalStepper headerLevel="h4">

#### Verify Redis connection {#verify-redis}

먼저, Redis에 연결할 수 있는지 확인하고 INFO 명령이 작동하는지 확인합니다:
```bash

# Test connection
redis-cli ping

# Expected output: PONG


# Test INFO command (used by metrics collector)
redis-cli INFO server

# Should display Redis server information
```

Redis가 인증을 요구하는 경우:
```bash
redis-cli -a <your-password> ping
```

**일반 Redis 엔드포인트:**
- **로컬 설치**: `localhost:6379`
- **Docker**: 컨테이너 이름이나 서비스 이름 사용 (예: `redis:6379`)
- **원격**: `<redis-host>:6379`

#### Create custom OTel collector configuration {#custom-otel}

ClickStack은 사용자 지정 구성 파일을 마운트하고 환경 변수를 설정하여 기본 OpenTelemetry 수집기 구성을 확장할 수 있습니다. 사용자 지정 구성은 HyperDX에 의해 관리되는 기본 구성과 병합됩니다.

다음 구성을 사용하여 `redis-metrics.yaml`라는 파일을 만듭니다:
```yaml title="redis-metrics.yaml"
receivers:
  redis:
    endpoint: "localhost:6379"
    collection_interval: 10s
    # Uncomment if Redis requires authentication
    # password: ${env:REDIS_PASSWORD}

    # Configure which metrics to collect
    metrics:
      redis.commands.processed:
        enabled: true
      redis.clients.connected:
        enabled: true
      redis.memory.used:
        enabled: true
      redis.keyspace.hits:
        enabled: true
      redis.keyspace.misses:
        enabled: true
      redis.keys.evicted:
        enabled: true
      redis.keys.expired:
        enabled: true

processors:
  resource:
    attributes:
      - key: service.name
        value: "redis"
        action: upsert

service:
  pipelines:
    metrics/redis:
      receivers: [redis]
      processors:
        - resource
        - memory_limiter
        - batch
      exporters:
        - clickhouse
```

이 구성은:
- `localhost:6379`에서 Redis에 연결합니다 (설정에 맞게 엔드포인트 조정)
- 10초마다 메트릭을 수집합니다
- 주요 성능 메트릭을 수집합니다 (명령, 클라이언트, 메모리, 키스페이스 통계)
- **필요한 `service.name` 리소스 속성을 설정**합니다 [OpenTelemetry의 의미론적 관례](https://opentelemetry.io/docs/specs/semconv/resource/#service)에 따라
- 전용 파이프라인을 통해 ClickHouse Exporter로 메트릭을 라우팅합니다

**수집된 주요 메트릭:**
- `redis.commands.processed` - 초당 처리된 명령 수
- `redis.clients.connected` - 연결된 클라이언트 수
- `redis.clients.blocked` - 차단 호출에서 차단된 클라이언트
- `redis.memory.used` - Redis가 사용하는 메모리 (바이트)
- `redis.memory.peak` - 최대 메모리 사용량
- `redis.keyspace.hits` - 성공적인 키 조회 수
- `redis.keyspace.misses` - 실패한 키 조회 수 (캐시 적중률 계산에 사용)
- `redis.keys.expired` - 만료된 키 수
- `redis.keys.evicted` - 메모리 압력으로 인해 제거된 키 수
- `redis.connections.received` - 수신된 총 연결 수
- `redis.connections.rejected` - 거부된 연결 수

:::note
- 사용자 지정 구성에서는 새로운 수신기, 프로세서 및 파이프라인만 정의합니다
- `memory_limiter` 및 `batch` 프로세서와 `clickhouse` exporter는 기본 ClickStack 구성에서 이미 정의되어 있으며, 이름으로 참조할 수 있습니다
- `resource` 프로세서는 OpenTelemetry 의미론적 관례에 따라 필요한 `service.name` 속성을 설정합니다
- 인증이 있는 프로덕션 환경에서는 비밀번호를 환경 변수로 저장합니다: `${env:REDIS_PASSWORD}`
- 필요에 따라 `collection_interval`을 조정합니다 (기본값 10초; 낮은 값은 데이터 용량을 증가시킴)
- 여러 Redis 인스턴스의 경우 `service.name`을 사용자 지정하여 구분합니다 (예: `"redis-cache"`, `"redis-sessions"`)
:::

#### Configure ClickStack to load custom configuration {#load-custom}

기존 ClickStack 배포에서 사용자 지정 수집기 구성을 활성화하려면 다음을 수행해야 합니다:

1. 사용자 지정 구성 파일을 `/etc/otelcol-contrib/custom.config.yaml`에 마운트합니다
2. 환경 변수를 설정합니다: `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. ClickStack과 Redis 간의 네트워크 연결을 보장합니다

##### Option 1: Docker Compose {#docker-compose}

ClickStack 배포 구성을 업데이트합니다:
```yaml
services:
  clickstack:
    # ... existing configuration ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # Optional: If Redis requires authentication
      # - REDIS_PASSWORD=your-redis-password
      # ... other environment variables ...
    volumes:
      - ./redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      # ... other volumes ...
    # If Redis is in the same compose file:
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    # Optional: Enable authentication
    # command: redis-server --requirepass your-redis-password
```

##### Option 2: Docker run (all-in-one image) {#all-in-one}

`docker run`으로 all-in-one 이미지를 사용하는 경우:
```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

**중요:** Redis가 다른 컨테이너에서 실행되고 있는 경우 Docker 네트워킹을 사용합니다:
```bash

# Create a network
docker network create monitoring


# Run Redis on the network
docker run -d --name redis --network monitoring redis:7-alpine


# Run ClickStack on the same network (update endpoint to "redis:6379" in config)
docker run --name clickstack \
  --network monitoring \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### Verify metrics in HyperDX {#verifying-metrics}

구성이 완료되면 HyperDX에 로그인하여 메트릭이 전송되는지 확인합니다:

1. 메트릭 탐색기로 이동합니다
2. `redis.`로 시작하는 메트릭을 검색합니다 (예: `redis.commands.processed`, `redis.memory.used`)
3. 설정한 수집 간격에서 메트릭 데이터 포인트가 나타나는 것을 확인해야 합니다

<!-- <Image img={metrics_view} alt="Redis Metrics view"/> -->

</VerticalStepper>

## Demo dataset {#demo-dataset}

프로덕션 시스템을 구성하기 전에 Redis 메트릭 통합을 테스트하고자 하는 사용자에게는 현실적인 Redis 메트릭 패턴을 갖춘 미리 생성된 데이터 세트를 제공합니다.

<VerticalStepper headerLevel="h4">

#### Download the sample metrics dataset {#download-sample}

현실적인 패턴이 포함된 Redis 메트릭의 24시간 분량을 미리 생성된 메트릭 파일을 다운로드합니다:
```bash

# Download gauge metrics (memory, fragmentation ratio)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-gauge.csv


# Download sum metrics (commands, connections, keyspace stats)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-sum.csv
```

데이터세트에는 현실적인 패턴이 포함되어 있습니다:
- **캐시 예열 이벤트 (06:00)** - 적중률이 30%에서 80%로 상승
- **트래픽 급증 (14:30-14:45)** - 5배의 트래픽 급증과 연결 압력
- **메모리 압력 (20:00)** - 키 제거 및 캐시 성능 저하
- **일일 트래픽 패턴** - 업무 시간의 피크, 저녁 하락, 랜덤한 미세 급증

#### Start ClickStack {#start-clickstack}

ClickStack 인스턴스를 시작합니다:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

ClickStack이 완전히 시작될 때까지 약 30초 대기합니다.

#### Load metrics into ClickStack {#load-metrics}

ClickHouse로 메트릭을 직접 로드합니다:
```bash

# Load gauge metrics (memory, fragmentation)
cat redis-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"


# Load sum metrics (commands, connections, keyspace)
cat redis-metrics-sum.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### Verify metrics in HyperDX {#verify-metrics}

로드가 완료되면 미리 구축된 대시보드를 통해 메트릭을 가장 빨리 확인할 수 있습니다.

[대시보드 및 시각화](#dashboards) 섹션으로 진행하여 대시보드를 가져오고 모든 Redis 메트릭을 한 번에 확인합니다.

:::note
데모 데이터 세트의 시간 범위는 2025-10-20 00:00:00부터 2025-10-21 05:00:00까지입니다. HyperDX에서의 시간 범위가 이 시간에 일치하는지 확인하세요.

다음과 같은 흥미로운 패턴을 찾아보세요:
- **06:00** - 캐시 예열 (낮은 적중률 상승)
- **14:30-14:45** - 트래픽 급증 (높은 클라이언트 연결, 일부 거부)
- **20:00** - 메모리 압력 (키 제거 시작)
:::

</VerticalStepper>

## Dashboards and visualization {#dashboards}

ClickStack으로 Redis 모니터링을 시작할 수 있도록 Redis 메트릭을 위한 필수 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-metrics-dashboard.json')} download="redis-metrics-dashboard.json" eventName="docs.redis_metrics_monitoring.dashboard_download">대시보드 구성 다운로드</TrackedLink> {#download}

#### Import the pre-built dashboard {#import-dashboard}

1. HyperDX를 열고 대시보드 섹션으로 이동합니다
2. 오른쪽 상단의 점 세 개 아래 **대시보드 가져오기**를 클릭합니다

<Image img={import_dashboard} alt="Import dashboard button"/>

3. `redis-metrics-dashboard.json` 파일을 업로드하고 **가져오기 완료**를 클릭합니다

<Image img={finish_import} alt="Finish import dialog"/>

#### View the dashboard {#created-dashboard}

모든 시각화가 미리 구성된 대시보드가 생성됩니다:

<Image img={example_dashboard} alt="Redis Metrics dashboard"/>

:::note
데모 데이터 세트의 경우 시간 범위를 2025-10-20 05:00:00 - 2025-10-21 05:00:00로 설정했는지 확인하세요.
:::

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### Custom config not loading {#troubleshooting-not-loading}

환경 변수 `CUSTOM_OTELCOL_CONFIG_FILE`가 올바르게 설정되었는지 확인하세요:
```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

사용자 지정 구성 파일이 `/etc/otelcol-contrib/custom.config.yaml`에 마운트되었는지 확인하세요:
```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

사용자 지정 구성 내용을 확인하여 읽을 수 있는지 확인하세요:
```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### No metrics appearing in HyperDX {#no-metrics}

수집기에서 Redis에 접근할 수 있는지 확인하세요:
```bash

# From the ClickStack container
docker exec <clickstack-container> redis-cli -h <redis-host> ping

# Expected output: PONG
```

Redis INFO 명령이 작동하는지 확인하세요:
```bash
docker exec <clickstack-container> redis-cli -h <redis-host> INFO stats

# Should display Redis statistics
```

유효한 구성이 Redis 수신기를 포함하고 있는지 확인하세요:
```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "redis:"
```

수집기 로그에서 오류를 확인하세요:
```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i redis

# Look for connection errors or authentication failures
```

### Authentication errors {#auth-errors}

로그에서 인증 오류가 발생하는 경우:
```bash

# Verify Redis requires authentication
redis-cli CONFIG GET requirepass


# Test authentication
redis-cli -a <password> ping


# Ensure password is set in ClickStack environment
docker exec <clickstack-container> printenv REDIS_PASSWORD
```

구성을 업데이트하여 비밀번호를 사용하세요:
```yaml
receivers:
  redis:
    endpoint: "redis:6379"
    password: ${env:REDIS_PASSWORD}
```

### Network connectivity issues {#network-issues}

ClickStack이 Redis에 접근할 수 없는 경우:
```bash

# Check if both containers are on the same network
docker network inspect <network-name>


# Test connectivity
docker exec <clickstack-container> ping redis
docker exec <clickstack-container> telnet redis 6379
```

Docker Compose 파일이나 `docker run` 명령이 두 컨테이너를 동일한 네트워크에 배치하는지 확인하세요.

## Next steps {#next-steps}

더 탐색하고 싶다면 모니터링을 실험할 수 있는 다음 단계는 다음과 같습니다:

- [알림](/use-cases/observability/clickstack/alerts) 설정 (메모리 사용량 한계, 연결 제한, 캐시 적중률 하락에 대한 알림)
- 특정 사용 사례에 대한 추가 대시보드 생성 (복제 지연, 지속성 성능)
- 다른 엔드포인트 및 서비스 이름으로 수신기 구성을 복제하여 여러 Redis 인스턴스 모니터링하기
