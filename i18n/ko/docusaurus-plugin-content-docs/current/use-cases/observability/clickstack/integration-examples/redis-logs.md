---
'slug': '/use-cases/observability/clickstack/integrations/redis'
'title': 'ClickStack로 Redis 로그 모니터링'
'sidebar_label': 'Redis 로그'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack로 Redis 로그 모니터링'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/redis/redis-import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis/redis-logs-dashboard.png';
import log_view from '@site/static/images/clickstack/redis/redis-log-view.png';
import log from '@site/static/images/clickstack/redis/redis-log.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack를 이용한 Redis 로그 모니터링 {#redis-clickstack}

:::note[TL;DR]
이 가이드는 OpenTelemetry 수집기를 구성하여 Redis 서버 로그를 수집함으로써 ClickStack으로 Redis를 모니터링하는 방법을 보여줍니다. 다음을 배울 수 있습니다:

- Redis 로그 형식을 파싱하도록 OTel 수집기를 구성하는 방법
- 사용자 정의 구성으로 ClickStack 배포하는 방법
- Redis 메트릭(연결, 명령, 메모리, 오류)을 시각화하기 위해 미리 구축된 대시보드 사용하기

프로덕션 Redis를 구성하기 전에 통합을 테스트하고 싶다면 샘플 로그가 포함된 데모 데이터 세트를 사용할 수 있습니다.

소요 시간: 5-10분
:::

## 기존 Redis와의 통합 {#existing-redis}

이 섹션에서는 ClickStack OTel 수집기 구성을 수정하여 기존 Redis 설치가 ClickStack으로 로그를 전송하도록 구성하는 방법을 다룹니다. 자신의 기존 설정을 구성하기 전에 Redis 통합을 테스트하고 싶다면 ["데모 데이터 세트"](/use-cases/observability/clickstack/integrations/redis#demo-dataset) 섹션에서 미리 구성된 설정과 샘플 데이터를 테스트할 수 있습니다.

### 전제 조건 {#prerequisites}
- ClickStack 인스턴스 실행 중
- 기존 Redis 설치 (버전 3.0 이상)
- Redis 로그 파일에 대한 접근 권한

<VerticalStepper headerLevel="h4">

#### Redis 로깅 구성 확인 {#verify-redis}

먼저, Redis 로깅 구성을 확인합니다. Redis에 연결하고 로그 파일 위치를 확인하십시오:

```bash
redis-cli CONFIG GET logfile
```

일반적인 Redis 로그 위치:
- **Linux (apt/yum)**: `/var/log/redis/redis-server.log`
- **macOS (Homebrew)**: `/usr/local/var/log/redis.log`
- **Docker**: 종종 stdout에 로그되지만 `/data/redis.log`에 쓸 수 있도록 구성할 수 있습니다.

Redis가 stdout에 로그를 기록하고 있다면, `redis.conf`를 업데이트하여 파일에 작성하도록 구성합니다:

```bash

# Log to file instead of stdout
logfile /var/log/redis/redis-server.log


# Set log level (options: debug, verbose, notice, warning)
loglevel notice
```

구성을 변경한 후 Redis를 재시작합니다:

```bash

# For systemd
sudo systemctl restart redis


# For Docker
docker restart <redis-container>
```

#### 사용자 정의 OTel 수집기 구성 생성 {#custom-otel}

ClickStack은 사용자 정의 구성 파일을 마운트하고 환경 변수를 설정하여 기본 OpenTelemetry Collector 구성을 확장할 수 있게 해줍니다. 사용자 정의 구성은 HyperDX에 의해 관리되는 기본 구성과 병합됩니다.

다음 구성을 가진 `redis-monitoring.yaml`이라는 파일을 생성합니다:
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

이 구성은 다음을 수행합니다:
- 표준 위치에서 Redis 로그를 읽습니다.
- 구조적 필드(`pid`, `role`, `timestamp`, `log_level`, `message`)를 추출하기 위해 regex를 사용하여 Redis의 로그 형식을 파싱합니다.
- HyperDX에서 필터링을 위해 `source: redis` 속성을 추가합니다.
- 전용 파이프라인을 통해 ClickHouse 내보내기로 로그를 라우팅합니다.

:::note
- 사용자 정의 구성에서는 새 수신기와 파이프라인만 정의합니다.
- 프로세서(`memory_limiter`, `transform`, `batch`)와 내보내기(`clickhouse`)는 이미 기본 ClickStack 구성에 정의되어 있으므로 이름으로 참조하면 됩니다.
- `time_parser` 연산자는 Redis 로그에서 타임스탬프를 추출하여 원래 로그 타이밍을 유지합니다.
- 이 구성은 수집기가 시작될 때 모든 기존 로그를 읽기 위해 `start_at: beginning`을 사용하여 즉시 로그를 볼 수 있게 합니다. 수집기 재시작 시 로그 재수집을 피하려는 프로덕션 배포의 경우 `start_at: end`로 변경하십시오.
:::

#### ClickStack에서 사용자 정의 구성 로드 구성 {#load-custom}

기존 ClickStack 배포에서 사용자 정의 수집기 구성을 활성화하려면 다음을 수행해야 합니다:

1. 사용자 정의 구성 파일을 `/etc/otelcol-contrib/custom.config.yaml`에 마운트합니다.
2. 환경 변수 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`를 설정합니다.
3. 수집기가 로그를 읽을 수 있도록 Redis 로그 디렉토리를 마운트합니다.

##### 옵션 1: 도커 컴포즈 {#docker-compose}

ClickStack 배포 구성 업데이트:
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

##### 옵션 2: 도커 실행 (올인원 이미지) {#all-in-one}

도커와 함께 올인원 이미지를 사용하는 경우 다음을 실행합니다:
```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log/redis:/var/log/redis:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
ClickStack 수집기가 Redis 로그 파일을 읽을 수 있는 적절한 권한을 가지고 있는지 확인하십시오. 프로덕션에서는 읽기 전용 마운트를 사용(`:ro`)하고 최소 권한의 원칙을 따르십시오.
:::

#### HyperDX에서 로그 확인하기 {#verifying-logs}

구성이 완료되면 HyperDX에 로그인하고 로그가 흐르고 있는지 확인하십시오:

<Image img={log_view} alt="로그 뷰"/>

<Image img={log} alt="로그"/>

</VerticalStepper>

## 데모 데이터 세트 {#demo-dataset}

프로덕션 시스템을 구성하기 전에 Redis 통합을 테스트하고자 하는 사용자에게, 현실적인 패턴의 사전 생성된 Redis 로그 샘플 데이터 세트를 제공합니다.

<VerticalStepper headerLevel="h4">

#### 샘플 데이터 세트 다운로드 {#download-sample}

샘플 로그 파일을 다운로드합니다:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-server.log
```

#### 테스트 수집기 구성 생성 {#test-config}

다음 구성을 가진 `redis-demo.yaml`이라는 파일을 생성합니다:

```yaml
cat > redis-demo.yaml << 'EOF'
receivers:
  filelog/redis:
    include:
      - /tmp/redis-demo/redis-server.log
    start_at: beginning  # Read from beginning for demo data
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

#### 데모 구성으로 ClickStack 실행 {#run-demo}

데모 로그와 구성으로 ClickStack을 실행합니다:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/redis-server.log:/tmp/redis-demo/redis-server.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
**이는 로그 파일을 컨테이너에 직접 마운트합니다. 이는 정적 데모 데이터로 테스트 목적으로 수행됩니다.**
:::

## HyperDX에서 로그 확인 {#verify-demo-logs}

ClickStack이 실행되고 나면:

1. [HyperDX](http://localhost:8080/)를 열고 계정에 로그인합니다. 먼저 계정을 생성해야 할 수도 있습니다.
2. 로그인한 후 이 [링크](http://localhost:8080/search?from=1761577200000&to=1761663600000&isLive=false&source=690280cfd3754c36b73402cc&where=&select=Timestamp,ServiceName,SeverityText,Body&whereLanguage=lucene&orderBy=&filters=[])를 엽니다. 아래 스크린샷과 동일하게 표시되는 것을 확인해야 합니다.

:::note
로그가 보이지 않으면, 시간 범위가 2025-10-27 10:00:00 - 2025-10-28 10:00:00으로 설정되어 있고 'Logs'가 소스로 선택되었는지 확인하십시오. 올바른 시간 범위의 결과를 얻기 위해서는 링크를 사용하는 것이 중요합니다.
:::

<Image img={log_view} alt="로그 뷰"/>

<Image img={log} alt="로그"/>

</VerticalStepper>

## 대시보드 및 시각화 {#dashboards}

ClickStack으로 Redis를 모니터링하는 데 도움이 되도록 Redis 로그의 필수 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-logs-dashboard.json')} download="redis-logs-dashboard.json" eventName="docs.redis_logs_monitoring.dashboard_download">대시보드 구성 다운로드</TrackedLink> {#download}

#### 미리 구축된 대시보드 가져오기 {#import-dashboard}

1. HyperDX를 열고 대시보드 섹션으로 이동합니다.
2. 오른쪽 상단의 점 3개 아래에서 "대시보드 가져오기"를 클릭합니다.

<Image img={import_dashboard} alt="대시보드 가져오기"/>

3. redis-logs-dashboard.json 파일을 업로드하고 가져오기 완료를 클릭합니다.

<Image img={finish_import} alt="가져오기 완료"/>

#### 모든 시각화가 미리 구성된 상태로 대시보드가 생성됩니다 {#created-dashboard}

:::note
시간 범위가 2025-10-27 10:00:00 - 2025-10-28 10:00:00으로 설정되어 있는지 확인하십시오. 가져온 대시보드는 기본적으로 시간 범위가 지정되지 않습니다.
:::

<Image img={example_dashboard} alt="예시 대시보드"/>

</VerticalStepper>

## 문제 해결 {#troubleshooting}

### 사용자 정의 구성이 로드되지 않음 {#troubleshooting-not-loading}

**환경 변수가 올바르게 설정되었는지 확인하십시오:**
```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE

# Expected output: /etc/otelcol-contrib/custom.config.yaml
```

**사용자 정의 구성 파일이 마운트되었는지 확인하십시오:**
```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml

# Expected output: Should show file size and permissions
```

**사용자 정의 구성 내용을 조회하십시오:**
```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml

# Should display your redis-monitoring.yaml content
```

**효과적인 구성에 filelog 수신기가 포함되었는지 확인하십시오:**
```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog

# Should show your filelog/redis receiver configuration
```

### HyperDX에 로그가 나타나지 않음 {#no-logs}

**Redis가 로그를 파일로 작성하고 있는지 확인하십시오:**
```bash
redis-cli CONFIG GET logfile

# Expected output: Should show a file path, not empty string

# Example: 1) "logfile" 2) "/var/log/redis/redis-server.log"
```

**Redis가 활동적으로 로깅 중인지 확인하십시오:**
```bash
tail -f /var/log/redis/redis-server.log

# Should show recent log entries in Redis format
```

**수집기가 로그를 읽을 수 있는지 확인하십시오:**
```bash
docker exec <container> cat /var/log/redis/redis-server.log

# Should display Redis log entries
```

**수집기 로그에서 오류를 확인하십시오:**
```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log

# Look for any error messages related to filelog or Redis
```

**도커 컴포즈를 사용하는 경우 공유 볼륨을 확인하십시오:**
```bash

# Check both containers are using the same volume
docker volume inspect <volume-name>

# Verify both containers have the volume mounted
```

### 로그가 올바르게 파싱되지 않음 {#logs-not-parsing}

**Redis 로그 형식이 예상 패턴과 일치하는지 확인하십시오:**
```bash

# Redis Logs should look like:

# 12345:M 28 Oct 2024 14:23:45.123 * Server started
tail -5 /var/log/redis/redis-server.log
```

Redis 로그가 다른 형식을 갖고 있다면 `regex_parser` 연산자에서 regex 패턴을 조정해야 할 수 있습니다. 표준 형식은 다음과 같습니다:
- `pid:role timestamp level message`
- 예: `12345:M 28 Oct 2024 14:23:45.123 * Server started`

## 다음 단계 {#next-steps}

더 탐색하고 싶다면 대시보드 실험을 위한 다음 단계를 제공합니다.

- 중요 메트릭(오류 비율, 대기 시간 한계)을 위한 [알림](/use-cases/observability/clickstack/alerts) 설정
- 특정 사용 사례(API 모니터링, 보안 이벤트)를 위한 추가 [대시보드](/use-cases/observability/clickstack/dashboards) 생성
