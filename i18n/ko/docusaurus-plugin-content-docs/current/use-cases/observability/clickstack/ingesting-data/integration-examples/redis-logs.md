---
slug: /use-cases/observability/clickstack/integrations/redis
title: 'ClickStack를 사용한 Redis 로그 모니터링'
sidebar_label: 'Redis 로그'
pagination_prev: null
pagination_next: null
description: 'ClickStack를 사용한 Redis 로그 모니터링'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/redis/redis-import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis/redis-logs-dashboard.png';
import log_view from '@site/static/images/clickstack/redis/redis-log-view.png';
import log from '@site/static/images/clickstack/redis/redis-log.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack로 Redis 로그 모니터링하기 \{#redis-clickstack\}

:::note[요약]
이 가이드는 OpenTelemetry collector를 구성하여 Redis 서버 로그를 수집하도록 하고, ClickStack으로 Redis를 모니터링하는 방법을 다룹니다. 이 문서를 통해 다음 내용을 알 수 있습니다:

- Redis 로그 형식을 파싱하도록 OTel collector를 구성하는 방법
- 사용자 정의 설정으로 ClickStack을 배포하는 방법
- 미리 준비된 대시보드를 사용하여 Redis Metrics(연결 수, 명령 수, 메모리, 오류)를 시각화하는 방법

프로덕션 Redis를 구성하기 전에 연동을 테스트하고 싶다면 샘플 로그가 포함된 데모 데이터셋을 사용할 수 있습니다.

소요 시간: 5-10분
:::

## 기존 Redis와의 통합 \{#existing-redis\}

이 섹션에서는 ClickStack OTel collector 구성을 수정하여, 기존 Redis 환경에서 생성되는 로그를 ClickStack으로 전송하도록 설정하는 방법을 다룹니다.
자체 Redis 환경을 구성하기 전에 Redis 통합을 미리 시험해 보고자 한다면, ["데모 데이터셋"](/use-cases/observability/clickstack/integrations/redis#demo-dataset) 섹션의 사전 구성된 환경과 샘플 데이터를 사용해 테스트할 수 있습니다.

### 사전 준비사항 \{#prerequisites\}

- 실행 중인 ClickStack 인스턴스
- 기존에 설치된 Redis(버전 3.0 이상)
- Redis 로그 파일에 대한 접근 권한

<VerticalStepper headerLevel="h4">
  #### Redis 로깅 구성 확인하기

  먼저 Redis 로깅 구성을 확인하세요. Redis에 연결하여 로그 파일 위치를 확인하세요:

  ```bash
  redis-cli CONFIG GET logfile
  ```

  Redis 로그의 일반적인 위치:

  * **Linux (apt/yum)**: `/var/log/redis/redis-server.log`
  * **macOS (Homebrew)**: `/usr/local/var/log/redis.log`
  * **Docker**: 기본적으로 `stdout`으로 로그가 출력되지만 `/data/redis.log`에 기록하도록 설정할 수 있습니다.

  Redis가 stdout으로 로그를 기록하는 경우, `redis.conf`를 업데이트하여 파일로 기록하도록 설정하세요:

  ```bash
  # Log to file instead of stdout
  logfile /var/log/redis/redis-server.log

  # Set log level (options: debug, verbose, notice, warning)
  loglevel notice
  ```

  구성을 변경한 후 Redis를 재시작하세요:

  ```bash
  # For systemd
  sudo systemctl restart redis

  # For Docker
  docker restart <redis-container>
  ```

  #### 사용자 정의 OTel collector 구성 생성하기

  ClickStack을 사용하면 사용자 정의 구성 파일을 마운트하고 환경 변수를 설정하여 기본 OpenTelemetry Collector 구성을 확장할 수 있습니다. 사용자 정의 구성은 HyperDX가 OpAMP를 통해 관리하는 기본 구성과 병합됩니다.

  다음 구성으로 `redis-monitoring.yaml` 파일을 생성하세요:

  ```yaml
  receivers:
    filelog/redis:
      include:
        - /var/log/redis/redis-server.log
      start_at: beginning
      operators:
        - type: regex_parser
          regex: '^(?P\d+):(?P\w+) (?P\d{2} \w+ \d{4} \d{2}:\d{2}:\d{2})\.\d+ (?P[.\-*#]) (?P.*)$'
          parse_from: body
          parse_to: attributes
        
        - type: time_parser
          parse_from: attributes.timestamp
          layout: '%d %b %Y %H:%M:%S'
        
        - type: add
          field: attributes.source
          value: "redis"
        
        - type: add
          field: resource["service.name"]
          value: "redis-production"

  service:
    pipelines:
      logs/redis:
        receivers: [filelog/redis]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  ```

  이 구성:

  * 표준 경로에서 Redis 로그를 읽습니다
  * 정규식을 사용해 Redis 로그 형식을 파싱하고, 구조화된 필드(`pid`, `role`, `timestamp`, `log_level`, `message`)를 추출합니다.
  * HyperDX에서 필터링할 때 사용할 `source: redis` 속성을 추가합니다
  * 전용 파이프라인을 통해 로그를 ClickHouse exporter로 전달합니다

  :::note

  * 사용자 정의 구성에서는 새 receiver와 pipeline만 정의하면 됩니다
  * 프로세서(`memory_limiter`, `transform`, `batch`)와 익스포터(`clickhouse`)는 기본 ClickStack 구성에 이미 정의되어 있으므로 이름만 참조하면 됩니다.
  * `time_parser` 연산자는 Redis 로그에서 타임스탬프를 추출하여 원본 로그의 기록 시점을 보존합니다
  * 이 구성은 수집기가 시작될 때 `start_at: beginning`을 사용하여 모든 기존 로그를 읽도록 하므로, 즉시 로그를 확인할 수 있습니다. 프로덕션 환경에서 수집기 재시작 시 로그를 다시 수집하지 않으려면 `start_at: end`로 변경하십시오.
    :::

  #### ClickStack에서 사용자 정의 구성 로드 설정하기

  기존 ClickStack 배포에서 사용자 정의 수집기 구성을 활성화하려면 다음 작업을 수행하십시오:

  1. 사용자 정의 구성 파일을 `/etc/otelcol-contrib/custom.config.yaml`에 마운트하십시오
  2. 환경 변수 `CUSTOM_OTELCOL_CONFIG_FILE`를 `/etc/otelcol-contrib/custom.config.yaml`로 설정합니다.
  3. collector가 Redis 로그 디렉터리를 읽을 수 있도록 해당 디렉터리를 마운트합니다

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
        - ./redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - /var/log/redis:/var/log/redis:ro
        # ... other volumes ...
  ```

  ##### 옵션 2: Docker Run (올인원 이미지)

  Docker에서 올인원 이미지를 사용하는 경우 다음을 실행하세요:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log/redis:/var/log/redis:ro \
    clickhouse/clickstack-all-in-one:latest
  ```

  :::note
  ClickStack 수집기가 Redis 로그 파일을 읽을 수 있는 적절한 권한을 보유하고 있는지 확인하세요. 프로덕션 환경에서는 읽기 전용 마운트(`:ro`)를 사용하고 최소 권한 원칙을 준수하세요.
  :::

  #### HyperDX에서 로그 확인

  구성을 완료한 후 HyperDX에 로그인하여 로그가 수집되고 있는지 확인하세요:

  <Image img={log_view} alt="로그 보기" />

  <Image img={log} alt="로그" />
</VerticalStepper>

## 데모 데이터 세트 {#demo-dataset}

프로덕션 시스템을 설정하기 전에 Redis 연동을 테스트하려는 사용자를 위해, 현실적인 패턴을 포함한 사전 생성 Redis 로그의 샘플 데이터 세트를 제공합니다.

<VerticalStepper headerLevel="h4">

#### 샘플 데이터 세트 다운로드 \{#download-sample\}

샘플 로그 파일을 다운로드합니다:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-server.log
```

#### 테스트용 수집기 구성 생성 \{#test-config\}

다음 구성이 포함된 `redis-demo.yaml` 파일을 생성합니다:

```yaml
cat > redis-demo.yaml << 'EOF'
receivers:
  filelog/redis:
    include:
      - /tmp/redis-demo/redis-server.log
    start_at: beginning  # 데모 데이터에 대해 처음부터 읽습니다
    operators:
      - type: regex_parser
        regex: '^(?P<pid>\d+):(?P<role>\w+) (?P<timestamp>\d{2} \w+ \d{4} \d{2}:\d{2}:\d{2})\.\d+ (?P<log_level>[.\-*#]) (?P<message>.*)$'
        parse_from: body
        parse_to: attributes
      
      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%d %b %Y %H:%M:%S'
      
      - type: add
        field: attributes.source
        value: "redis-demo"
      
      - type: add
        field: resource["service.name"]
        value: "redis-demo"

service:
  pipelines:
    logs/redis-demo:
      receivers: [filelog/redis]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### 데모 구성을 사용하여 ClickStack 실행 {#run-demo}

데모 로그와 구성을 사용하여 ClickStack을 실행합니다:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/redis-server.log:/tmp/redis-demo/redis-server.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

:::note
**이 명령은 로그 파일을 컨테이너에 직접 마운트합니다. 정적 데모 데이터를 사용한 테스트 목적을 위해 이렇게 구성되어 있습니다.**
:::

## HyperDX에서 로그 확인 {#verify-demo-logs}

ClickStack이 실행되면 다음을 수행합니다:

1. [HyperDX](http://localhost:8080/)를 열고 계정으로 로그인합니다 (먼저 계정을 생성해야 할 수 있습니다)
2. Search 뷰로 이동한 후 Source를 `Logs`로 설정합니다
3. 시간 범위를 **2025-10-26 10:00:00 - 2025-10-29 10:00:00**으로 설정합니다

:::note[Timezone Display]
HyperDX는 브라우저의 로컬 시간대를 기준으로 타임스탬프를 표시합니다. 데모 데이터는 **2025-10-27 10:00:00 - 2025-10-28 10:00:00 (UTC)** 범위를 포함합니다. 넓은 시간 범위를 사용하면 어느 위치에서 접속하더라도 데모 로그를 확인할 수 있습니다. 로그가 보이면, 더 명확한 시각화를 위해 범위를 24시간 구간으로 좁혀 볼 수 있습니다.
:::

<Image img={log_view} alt="로그 뷰"/>

<Image img={log} alt="로그"/>

</VerticalStepper>

## 대시보드와 시각화 {#dashboards}

ClickStack으로 Redis를 모니터링하기 시작하는 데 도움이 되도록 Redis 로그에 대한 핵심 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-logs-dashboard.json')} download="redis-logs-dashboard.json" eventName="docs.redis_logs_monitoring.dashboard_download">대시보드 구성 다운로드</TrackedLink> {#download}

#### 사전 구성된 대시보드 가져오기 \{#import-dashboard\}

1. HyperDX를 열고 Dashboards 섹션으로 이동합니다.
2. 오른쪽 상단의 줄임표(더보기) 메뉴에서 "Import Dashboard"를 클릭합니다.

<Image img={import_dashboard} alt="대시보드 가져오기"/>

3. redis-logs-dashboard.json 파일을 업로드하고 가져오기를 완료합니다.

<Image img={finish_import} alt="가져오기 완료"/>

#### 모든 시각화가 미리 설정된 상태로 대시보드가 생성됩니다 \{#created-dashboard\}

:::note
데모 데이터셋을 사용하는 경우 시간 범위를 **2025-10-27 10:00:00 - 2025-10-28 10:00:00 (UTC)** 로 설정합니다(로컬 시간대에 맞게 조정하십시오). 가져온 대시보드는 기본적으로 시간 범위가 지정되어 있지 않습니다.
:::

<Image img={example_dashboard} alt="예시 대시보드"/>

</VerticalStepper>

## 문제 해결 {#troubleshooting}

### 사용자 정의 구성(custom config)이 로드되지 않음

**환경 변수가 올바르게 설정되어 있는지 확인하십시오.**

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
# Expected output: /etc/otelcol-contrib/custom.config.yaml
```

**사용자 정의 구성 파일이 마운트되었는지 확인하십시오.**

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
# Expected output: Should show file size and permissions
```

**커스텀 구성 내용을 확인하십시오.**

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
# Should display your redis-monitoring.yaml content
```

**유효한 구성에 filelog 수신기(receiver)가 포함되어 있는지 확인하십시오.**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
# Should show your filelog/redis receiver configuration
```


### HyperDX에 로그가 표시되지 않는 경우

**Redis가 로그를 파일에 기록하도록 설정되어 있는지 확인하십시오.**

```bash
redis-cli CONFIG GET logfile
# Expected output: Should show a file path, not empty string
# Example: 1) "logfile" 2) "/var/log/redis/redis-server.log"
```

**Redis에서 로그가 계속 생성되는지 확인하십시오.**

```bash
tail -f /var/log/redis/redis-server.log
# Should show recent log entries in Redis format
```

**컬렉터가 로그를 읽을 수 있는지 확인하십시오:**

```bash
docker exec <container> cat /var/log/redis/redis-server.log
# Should display Redis log entries
```

**수집기 로그에서 오류를 확인하십시오.**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
# Look for any error messages related to filelog or Redis
```

**docker-compose를 사용하는 경우 공유 볼륨을 확인하십시오.**

```bash
# Check both containers are using the same volume
docker volume inspect <volume-name>
# Verify both containers have the volume mounted
```


### 로그가 정상적으로 파싱되지 않는 경우

**Redis 로그 형식이 예상 패턴과 일치하는지 확인하십시오.**

```bash
# Redis Logs should look like:
# 12345:M 28 Oct 2024 14:23:45.123 * Server started
tail -5 /var/log/redis/redis-server.log
```

Redis 로그의 형식이 다른 경우 `regex_parser` operator에서 정규식 패턴을 조정해야 할 수도 있습니다. 표준 형식은 다음과 같습니다.

* `pid:role timestamp level message`
* 예시: `12345:M 28 Oct 2024 14:23:45.123 * Server started`


## 다음 단계 {#next-steps}

더 살펴보고 싶다면, 대시보드를 활용하여 시도해 볼 수 있는 다음 단계를 살펴보십시오.

- 중요 메트릭(오류율, 지연 시간 임계값)에 대한 [알림](/use-cases/observability/clickstack/alerts)을 설정하십시오.
- 특정 사용 사례(API 모니터링, 보안 이벤트)를 위한 추가 [대시보드](/use-cases/observability/clickstack/dashboards)를 생성하십시오.