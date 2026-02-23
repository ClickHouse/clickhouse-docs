---
slug: /use-cases/observability/clickstack/integrations/redis-metrics
title: 'ClickStack를 사용한 Redis 메트릭 모니터링'
sidebar_label: 'Redis 메트릭'
pagination_prev: null
pagination_next: null
description: 'ClickStack를 사용한 Redis 메트릭 모니터링'
doc_type: 'guide'
keywords: ['Redis', 'metrics', 'OTEL', 'ClickStack']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/import-redis-metrics-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack로 Redis 메트릭 모니터링하기 \{#redis-metrics-clickstack\}

:::note[요약]
이 가이드는 OpenTelemetry collector의 Redis receiver를 구성하여 ClickStack을 사용해 Redis 성능 메트릭을 모니터링하는 방법을 설명합니다. 다음 내용을 알 수 있습니다:

- Redis 메트릭을 수집하도록 OTel collector를 구성하는 방법
- 사용자 정의 구성을 적용하여 ClickStack을 배포하는 방법
- 미리 만들어진 대시보드를 사용해 Redis 성능(초당 명령 수, 메모리 사용량, 연결된 클라이언트 수, 캐시 성능)을 시각화하는 방법

운영 환경 Redis를 구성하기 전에 통합을 미리 테스트해 보고자 하는 경우, 샘플 메트릭이 포함된 데모 데이터셋을 사용할 수 있습니다.

소요 시간: 약 5~10분
:::

## 기존 Redis와의 통합 \{#existing-redis\}

이 섹션에서는 ClickStack OTel collector를 Redis receiver로 구성하여, 기존에 운영 중인 Redis 인스턴스에서 메트릭을 ClickStack으로 전송하도록 설정하는 방법을 다룹니다.

기존 환경을 설정하기 전에 Redis Metrics 통합을 먼저 테스트해 보고 싶다면, [다음 섹션](#demo-dataset)에 있는 사전 구성된 데모 데이터셋으로 테스트할 수 있습니다.

##### 사전 준비 사항 \{#prerequisites\}

- 실행 중인 ClickStack 인스턴스
- 기존 Redis 설치(버전 3.0 이상)
- ClickStack에서 Redis로의 네트워크 연결(기본 포트 6379)
- 인증이 활성화된 경우 Redis 암호

<VerticalStepper headerLevel="h4">
  #### Redis 연결 확인하기

  먼저 Redis에 연결할 수 있고 INFO 명령이 정상적으로 작동하는지 확인하세요:

  ```bash
  # Test connection
  redis-cli ping
  # Expected output: PONG

  # Test INFO command (used by metrics collector)
  redis-cli INFO server
  # Should display Redis server information
  ```

  Redis에서 인증을 요구하는 경우:

  ```bash
  redis-cli -a <your-password> ping
  ```

  **일반 Redis 엔드포인트:**

  * **로컬 설치 환경**: `localhost:6379`
  * **Docker**: 컨테이너 이름이나 서비스 이름을 사용합니다(예: `redis:6379`)
  * **원격 주소**: `<redis-host>:6379`

  #### 사용자 정의 OTel collector 구성 생성하기

  ClickStack을 사용하면 사용자 정의 구성 파일을 마운트하고 환경 변수를 설정하여 기본 OpenTelemetry 수집기 구성을 확장할 수 있습니다. 사용자 정의 구성은 HyperDX가 OpAMP를 통해 관리하는 기본 구성과 병합됩니다.

  다음 구성으로 `redis-metrics.yaml` 파일을 생성하세요:

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

  이 구성:

  * `localhost:6379`의 Redis에 연결합니다 (환경에 맞게 엔드포인트를 조정하십시오).
  * 10초마다 메트릭을 수집합니다.
  * 핵심 성능 지표(명령, 클라이언트, 메모리, 키스페이스 통계)를 수집합니다.
  * [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/resource/#service)에 따라 필수 `service.name` 리소스 속성을 **설정합니다**.
  * 전용 파이프라인을 통해 ClickHouse exporter로 메트릭을 전송합니다

  **수집되는 주요 메트릭:**

  * `redis.commands.processed` - 초당 처리되는 명령 수
  * `redis.clients.connected` - 연결된 클라이언트의 수
  * `redis.clients.blocked` - 블로킹 호출로 인해 대기 중인 클라이언트 수
  * `redis.memory.used` - Redis에서 사용 중인 메모리 양(바이트 단위)
  * `redis.memory.peak` - 최대 메모리 사용량
  * `redis.keyspace.hits` - 성공한 키 조회 횟수
  * `redis.keyspace.misses` - 키 조회 실패 횟수(캐시 적중률 계산에 사용)
  * `redis.keys.expired` - 만료된 키 개수
  * `redis.keys.evicted` - 메모리 부족으로 인해 제거된 키 수
  * `redis.connections.received` - 수신된 총 연결 수
  * `redis.connections.rejected` - 거부된 연결 수

  :::note

  * 사용자 정의 설정에서는 새 receiver, processor, pipeline만 정의하면 됩니다
  * `memory_limiter` 및 `batch` processor와 `clickhouse` exporter는 기본 ClickStack 구성에 이미 정의되어 있으므로, 이름만 지정해서 참조하면 됩니다
  * `resource` 프로세서는 OpenTelemetry 시맨틱 컨벤션에 따라 필수인 `service.name` 속성 값을 설정합니다
  * 프로덕션 환경에서 인증을 사용하는 경우, 비밀번호는 환경 변수 `${env:REDIS_PASSWORD}`에 저장합니다.
  * 필요에 따라 `collection_interval`을 조정하십시오(기본값은 10초이며, 값이 낮을수록 데이터 양이 증가합니다).
  * 여러 Redis 인스턴스를 사용하는 경우 각 인스턴스를 구분할 수 있도록 `service.name`을 각각 다르게 설정하십시오(예: `"redis-cache"`, `"redis-sessions"`)
    :::

  #### ClickStack에서 사용자 정의 구성 로드 설정하기

  기존 ClickStack 배포에서 사용자 정의 수집기 구성을 활성화하려면 다음 작업을 수행하십시오:

  1. 사용자 정의 구성 파일을 `/etc/otelcol-contrib/custom.config.yaml`에 마운트합니다.
  2. 환경 변수 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`을(를) 설정하십시오.
  3. ClickStack와 Redis 간 네트워크 연결이 가능해야 합니다

  ##### 옵션 1: Docker Compose

  ClickStack 배포 구성을 업데이트하세요:

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

  ##### 옵션 2: Docker run (올인원 이미지)

  `docker run`으로 올인원(all-in-one) 이미지를 사용하는 경우:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  **중요:** Redis가 다른 컨테이너에서 실행 중인 경우, Docker 네트워킹을 사용하세요:

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
    clickhouse/clickstack-all-in-one:latest
  ```

  #### HyperDX에서 메트릭 확인하기

  구성을 완료한 후 HyperDX에 로그인하여 메트릭이 정상적으로 수집되는지 확인하세요:

  1. Metrics Explorer로 이동하십시오
  2. `redis.`로 시작하는 메트릭을 검색합니다. (예: `redis.commands.processed`, `redis.memory.used`)
  3. 설정한 수집 간격에 따라 메트릭 데이터 포인트가 나타나는 것을 확인할 수 있습니다

  {/* <Image img={metrics_view} alt="Redis 메트릭 화면"/> */ }
</VerticalStepper>

## 데모 데이터셋 {#demo-dataset}

프로덕션 시스템을 구성하기 전에 Redis Metrics 통합을 테스트하려는 사용자를 위해, 현실적인 Redis Metrics 패턴이 포함된 미리 생성된 데이터셋을 제공합니다.

<VerticalStepper headerLevel="h4">

#### 샘플 메트릭 데이터셋 다운로드 \{#download-sample\}

현실적인 패턴이 포함된 24시간 분량의 Redis Metrics가 들어 있는 미리 생성된 메트릭 파일을 다운로드합니다:
```bash
# 게이지 메트릭 다운로드 (메모리, 단편화 비율)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-gauge.csv

# 합계 메트릭 다운로드 (명령어, 연결, 키스페이스 통계)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-sum.csv
```

이 데이터셋에는 다음과 같은 현실적인 패턴이 포함됩니다:
- **캐시 워밍 이벤트(06:00)** - 적중률이 30%에서 80%까지 상승
- **트래픽 급증(14:30-14:45)** - 연결 압력이 동반된 5배 트래픽 증가
- **메모리 압박(20:00)** - 키 제거와 캐시 성능 저하
- **일일 트래픽 패턴** - 업무 시간 피크, 저녁 시간 감소, 무작위 마이크로 스파이크

#### ClickStack 시작 \{#start-clickstack\}

ClickStack 인스턴스를 시작합니다:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

ClickStack이 완전히 시작될 때까지 약 30초 정도 기다립니다.

#### 메트릭을 ClickStack에 적재 {#load-metrics}

메트릭을 ClickHouse에 직접 적재합니다:
```bash
# 게이지 메트릭 적재 (메모리, 단편화)
cat redis-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# 합계 메트릭 적재 (명령어, 연결, 키스페이스)
cat redis-metrics-sum.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### HyperDX에서 메트릭 확인 {#verify-metrics}

메트릭이 적재되면, 미리 구성된 대시보드를 통해 가장 빠르게 메트릭을 확인할 수 있습니다.

[Dashboards and visualization](#dashboards) 섹션으로 이동하여 대시보드를 가져오고, 모든 Redis Metrics를 한 번에 확인하십시오.

:::note
데모 데이터셋의 시간 범위는 2025-10-20 00:00:00부터 2025-10-21 05:00:00까지입니다. HyperDX에서 설정한 시간 범위가 이 구간과 일치하는지 확인하십시오.

다음과 같은 흥미로운 패턴을 찾아보십시오:
- **06:00** - 캐시 워밍(낮은 적중률이 상승하는 구간)
- **14:30-14:45** - 트래픽 급증(높은 클라이언트 연결 수 및 일부 거부)
- **20:00** - 메모리 압박(키 제거가 시작되는 시점)
:::

</VerticalStepper>

## 대시보드와 시각화 {#dashboards}

ClickStack로 Redis를 모니터링하기 시작하는 데 도움이 되도록 Redis Metrics용 핵심 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-metrics-dashboard.json')} download="redis-metrics-dashboard.json" eventName="docs.redis_metrics_monitoring.dashboard_download">대시보드 구성 다운로드</TrackedLink> {#download}

#### 미리 만들어진 대시보드 가져오기 \{#import-dashboard\}

1. HyperDX를 열고 Dashboards 섹션으로 이동합니다.
2. 오른쪽 상단 줄임표(…) 메뉴에서 **Import Dashboard**를 클릭합니다.

<Image img={import_dashboard} alt="대시보드 가져오기 버튼"/>

3. `redis-metrics-dashboard.json` 파일을 업로드한 뒤 **Finish Import**를 클릭합니다.

<Image img={finish_import} alt="가져오기 완료 대화 상자"/>

#### 대시보드 보기 \{#created-dashboard\}

대시보드는 모든 시각화가 미리 구성된 상태로 생성됩니다.

<Image img={example_dashboard} alt="Redis Metrics 대시보드"/>

:::note
데모 데이터셋을 사용할 때는 시간 범위를 **2025-10-20 05:00:00 - 2025-10-21 05:00:00 (UTC)** 로 설정하십시오(로컬 시간대에 맞게 조정하십시오). 가져온 대시보드는 기본적으로 시간 범위가 지정되어 있지 않습니다.
:::

</VerticalStepper>

## 문제 해결 {#troubleshooting}

### 사용자 지정 구성 로드되지 않음

환경 변수 `CUSTOM_OTELCOL_CONFIG_FILE`이 올바르게 설정되었는지 확인하십시오.

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

사용자 정의 구성 파일이 `/etc/otelcol-contrib/custom.config.yaml` 경로에 마운트되어 있는지 확인하십시오:

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

사용자 지정 구성 내용을 열어 사람이 읽을 수 있는지 확인합니다:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```


### HyperDX에 메트릭이 표시되지 않는 경우

collector에서 Redis에 접근할 수 있는지 확인하십시오:

```bash
# From the ClickStack container
docker exec <clickstack-container> redis-cli -h <redis-host> ping
# Expected output: PONG
```

Redis에서 `INFO` 명령이 정상적으로 동작하는지 확인하십시오:

```bash
docker exec <clickstack-container> redis-cli -h <redis-host> INFO stats
# Should display Redis statistics
```

실제 적용 중인 설정에 Redis receiver가 포함되어 있는지 확인하십시오:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "redis:"
```

컬렉터 로그에서 오류를 확인하십시오:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i redis
# Look for connection errors or authentication failures
```


### 인증 오류

로그에서 인증 오류가 발생하는 경우:

```bash
# Verify Redis requires authentication
redis-cli CONFIG GET requirepass

# Test authentication
redis-cli -a <password> ping

# Ensure password is set in ClickStack environment
docker exec <clickstack-container> printenv REDIS_PASSWORD
```

구성을 업데이트하여 비밀번호를 사용하도록 하십시오:

```yaml
receivers:
  redis:
    endpoint: "redis:6379"
    password: ${env:REDIS_PASSWORD}
```


### 네트워크 연결 문제

ClickStack이 Redis에 연결할 수 없는 경우:

```bash
# Check if both containers are on the same network
docker network inspect <network-name>

# Test connectivity
docker exec <clickstack-container> ping redis
docker exec <clickstack-container> telnet redis 6379
```

Docker Compose 파일 또는 `docker run` 명령에서 두 컨테이너가 동일한 네트워크를 사용하도록 구성하십시오.


## 다음 단계 {#next-steps}

추가로 살펴보고 싶다면, 모니터링을 활용해 다음과 같은 작업을 시도해 보십시오.

- 중요한 메트릭(메모리 사용량 임계값, 연결 제한, 캐시 적중률 하락)에 대한 [알림](/use-cases/observability/clickstack/alerts)을 설정하십시오.
- 특정 사용 사례(복제 지연, 지속성 성능)를 위한 추가 대시보드를 생성하십시오.
- 서로 다른 엔드포인트와 서비스 이름으로 receiver 구성을 복사하여 여러 Redis 인스턴스를 모니터링하십시오.