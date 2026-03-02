---
slug: /use-cases/observability/clickstack/integrations/host-logs
title: 'ClickStack를 사용한 호스트 로그 모니터링'
sidebar_label: '일반 호스트 로그'
pagination_prev: null
pagination_next: null
description: 'ClickStack를 사용한 일반 호스트 로그 모니터링'
doc_type: 'guide'
keywords: ['host logs', 'systemd', 'syslog', 'OTEL', 'ClickStack', 'system monitoring', 'server logs']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import log_view from '@site/static/images/clickstack/host-logs/log-view.png';
import search_view from '@site/static/images/clickstack/host-logs/search-view.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import logs_dashboard from '@site/static/images/clickstack/host-logs/host-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/host-logs/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# ClickStack로 호스트 로그 모니터링하기 \{#host-logs-clickstack\}

:::note[요약]
이 가이드는 OpenTelemetry collector를 구성하여 systemd, 커널(kernel), SSH, cron 및 기타 시스템 서비스의 로그를 수집함으로써 ClickStack으로 호스트 시스템 로그를 모니터링하는 방법을 설명합니다. 다음 내용을 학습하게 됩니다:

- OTel collector가 시스템 로그 파일을 읽도록 구성하는 방법
- 사용자 정의 구성을 적용하여 ClickStack을 배포하는 방법
- 미리 준비된 대시보드를 사용해 호스트 로그 인사이트(오류, 경고, 서비스 활동)를 시각화하는 방법

운영 환경 호스트를 구성하기 전에 통합을 테스트하려는 경우, 샘플 로그가 포함된 데모 데이터셋을 사용할 수 있습니다.

소요 시간: 5~10분
:::

## 기존 호스트와의 통합 \{#existing-hosts\}

이 섹션에서는 기존 호스트의 시스템 로그를 ClickStack으로 전송하도록 구성하는 방법을 다룹니다. 이를 위해 ClickStack OTel collector 구성을 수정하여 모든 시스템 로그 파일(syslog, auth, kernel, daemon, 애플리케이션 로그)을 읽어들이도록 설정합니다.

기존 환경을 구성하기 전에 호스트 로그 통합을 미리 테스트하고 싶은 경우, ["Demo dataset"](/use-cases/observability/clickstack/integrations/host-logs#demo-dataset) 섹션에 있는 사전 구성된 환경과 샘플 데이터를 사용하여 테스트할 수 있습니다.

##### 사전 준비 사항 \{#prerequisites\}

- 실행 중인 ClickStack 인스턴스
- syslog 파일이 있는 시스템
- ClickStack 설정 파일을 수정할 수 있는 권한

<VerticalStepper headerLevel="h4">
  #### syslog 파일 존재 여부 확인

  먼저 시스템에서 syslog 파일을 작성하고 있는지 확인하세요:

  ```bash
  # Check if syslog files exist (Linux)
  ls -la /var/log/syslog /var/log/messages

  # Or on macOS
  ls -la /var/log/system.log

  # View recent entries
  tail -20 /var/log/syslog
  ```

  일반적인 syslog 위치:

  * **Ubuntu/Debian**: `/var/log/syslog`
  * **RHEL/CentOS/Fedora**: `/var/log/messages`
  * **macOS**: `/var/log/system.log`

  #### 사용자 정의 OTel collector 구성 생성하기

  ClickStack을 사용하면 사용자 정의 구성 파일을 마운트하고 환경 변수를 설정하여 기본 OpenTelemetry Collector 구성을 확장할 수 있습니다.

  시스템 구성 정보가 포함된 `host-logs-monitoring.yaml` 파일을 생성하세요:

  <Tabs groupId="os-type">
    <TabItem value="modern-linux" label="최신 Linux (Ubuntu 24.04+)" default>
      ```yaml
      receivers:
        filelog/syslog:
          include:
            - /var/log/syslog
            - /var/log/**/*.log
          start_at: end
          operators:
            - type: regex_parser
              regex: '^(?P<timestamp>\S+) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
              parse_from: body
              parse_to: attributes
            
            - type: time_parser
              parse_from: attributes.timestamp
              layout_type: gotime
              layout: '2006-01-02T15:04:05.999999-07:00'
            
            - type: add
              field: attributes.source
              value: "host-logs"
            
            - type: add
              field: resource["service.name"]
              value: "host-production"

      service:
        pipelines:
          logs/host:
            receivers: [filelog/syslog]
            processors:
              - memory_limiter
              - transform
              - batch
            exporters:
              - clickhouse
      ```
    </TabItem>

    <TabItem value="legacy-linux" label="구버전 Linux (Ubuntu 20.04, RHEL, CentOS)">
      ```yaml
      receivers:
        filelog/syslog:
          include:
            - /var/log/syslog
            - /var/log/messages
            - /var/log/**/*.log
          start_at: end
          operators:
            - type: regex_parser
              regex: '^(?P<timestamp>\w+ \d+ \d{2}:\d{2}:\d{2}) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
              parse_from: body
              parse_to: attributes
            
            - type: time_parser
              parse_from: attributes.timestamp
              layout: '%b %d %H:%M:%S'
            
            - type: add
              field: attributes.source
              value: "host-logs"
            
            - type: add
              field: resource["service.name"]
              value: "host-production"

      service:
        pipelines:
          logs/host:
            receivers: [filelog/syslog]
            processors:
              - memory_limiter
              - transform
              - batch
            exporters:
              - clickhouse
      ```
    </TabItem>

    <TabItem value="macos" label="macOS">
      ```yaml
      receivers:
        filelog/syslog:
          include:
            - /var/log/system.log
            - /host/private/var/log/*.log
          start_at: end
          operators:
            - type: regex_parser
              regex: '^(?P<timestamp>\w+ \d+ \d{2}:\d{2}:\d{2}) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
              parse_from: body
              parse_to: attributes
            
            - type: time_parser
              parse_from: attributes.timestamp
              layout: '%b %d %H:%M:%S'
            
            - type: add
              field: attributes.source
              value: "host-logs"
            
            - type: add
              field: resource["service.name"]
              value: "host-production"

      service:
        pipelines:
          logs/host:
            receivers: [filelog/syslog]
            processors:
              - memory_limiter
              - transform
              - batch
            exporters:
              - clickhouse
      ```
    </TabItem>
  </Tabs>

  <br />

  모든 구성 항목:

  * 표준 경로에서 syslog 파일을 읽습니다
  * syslog 형식을 구문 분석하여 구조화된 필드(타임스탬프, 호스트 이름, 유닛/서비스, PID, 메시지)를 추출합니다.
  * 원본 로그 타임스탬프 유지
  * HyperDX에서 필터링할 수 있도록 `source: host-logs` 속성을 추가하십시오
  * 전용 파이프라인을 통해 로그를 ClickHouse exporter로 전달하기

  :::note

  * 사용자 정의 구성에서는 새로운 receiver와 pipeline만 정의합니다
  * 프로세서(`memory_limiter`, `transform`, `batch`)와 익스포터(`clickhouse`)는 기본 ClickStack 구성에 이미 정의되어 있으므로 이름으로만 참조하면 됩니다
  * 정규식 파서는 syslog 형식으로부터 systemd 유닛 이름, PID 및 기타 메타데이터를 추출합니다.
  * 이 구성에서는 컬렉터가 재시작될 때 로그를 다시 수집하지 않도록 `start_at: end`를 사용합니다. 테스트 시에는 `start_at: beginning`으로 변경하여 과거 로그를 즉시 확인하십시오.

  #### ClickStack에서 사용자 정의 구성 로드 설정하기

  기존 ClickStack 배포에서 사용자 정의 수집기 구성을 활성화하려면 다음을 수행하십시오:

  1. 커스텀 구성 파일을 `/etc/otelcol-contrib/custom.config.yaml` 경로에 마운트합니다.
  2. 환경 변수 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`를 설정합니다.
  3. collector가 syslog 로그를 읽을 수 있도록 syslog 디렉터리를 마운트하십시오

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
        - ./host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - /var/log:/var/log:ro
        # ... other volumes ...
  ```

  ##### 옵션 2: Docker Run (올인원 이미지)

  `docker run`으로 올인원 이미지를 사용하는 경우:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log:/var/log:ro \
    clickhouse/clickstack-all-in-one:latest
  ```

  :::note
  ClickStack 수집기가 syslog 파일을 읽을 수 있는 적절한 권한을 보유하고 있는지 확인하세요. 프로덕션 환경에서는 읽기 전용 마운트(`:ro`)를 사용하고 최소 권한 원칙을 준수하세요.
  :::

  #### HyperDX에서 로그 확인

  구성을 완료한 후 HyperDX에 로그인하여 로그가 수집되고 있는지 확인하세요:

  1. 검색 뷰로 이동하십시오
  2. Source를 「Logs」로 설정하십시오
  3. `source:host-logs`로 필터링하여 호스트별 로그를 확인하십시오
  4. `unit`, `hostname`, `pid`, `message` 등의 필드를 포함하는 구조화된 로그 항목을 확인할 수 있어야 합니다.

  <Image img={search_view} alt="검색 화면" />

  <Image img={log_view} alt="로그 뷰" />
</VerticalStepper>

## 데모 데이터셋 {#demo-dataset}

프로덕션 시스템을 구성하기 전에 호스트 로그 연동을 미리 테스트하려는 사용자를 위해, 현실적인 패턴을 가진 시스템 로그 샘플 데이터셋을 제공합니다.

<VerticalStepper headerLevel="h4">

#### 샘플 데이터셋 다운로드 \{#download-sample\}

샘플 로그 파일을 다운로드합니다:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
```

데이터셋에는 다음이 포함됩니다:
- 시스템 부팅 시퀀스
- SSH 로그인 활동(성공 및 실패 시도)
- 보안 인시던트(fail2ban 대응이 포함된 무차별 대입 공격)
- 예약된 유지 관리 작업(cron 잡, anacron)
- 서비스 재시작(rsyslog)
- 커널 메시지 및 방화벽 활동
- 정상 동작과 주목할 만한 이벤트가 혼합된 로그

#### 테스트용 Collector 구성 생성 \{#test-config\}

다음 구성을 사용하여 `host-logs-demo.yaml`이라는 파일을 생성합니다:

```yaml
cat > host-logs-demo.yaml << 'EOF'
receivers:
  filelog/journal:
    include:
      - /tmp/host-demo/journal.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\S+) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
        parse_from: body
        parse_to: attributes
      
      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%Y-%m-%dT%H:%M:%S%z'
      
      - type: add
        field: attributes.source
        value: "host-demo"
      
      - type: add
        field: resource["service.name"]
        value: "host-demo"

service:
  pipelines:
    logs/host-demo:
      receivers: [filelog/journal]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### 데모 구성으로 ClickStack 실행 {#run-demo}

데모 로그와 구성을 사용하여 ClickStack을 실행합니다:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/host-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/journal.log:/tmp/host-demo/journal.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

:::note
**이 명령은 로그 파일을 컨테이너에 직접 마운트합니다. 정적 데모 데이터를 사용한 테스트 목적을 위해 이렇게 구성되어 있습니다.**
:::

#### HyperDX에서 로그 확인 {#verify-demo-logs}

ClickStack이 실행되면 다음을 수행합니다:

1. [HyperDX](http://localhost:8080/)를 열고 계정으로 로그인합니다(먼저 계정을 생성해야 할 수 있습니다).
2. Search 뷰로 이동하여 source를 `Logs`로 설정합니다.
3. 시간 범위를 **2025-11-10 00:00:00 - 2025-11-13 00:00:00**으로 설정합니다.

<Image img={search_view} alt="Search 뷰"/>
<Image img={log_view} alt="Log 뷰"/>

:::note[Timezone Display]
HyperDX는 브라우저의 로컬 시간대를 기준으로 타임스탬프를 표시합니다. 데모 데이터는 **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)** 구간에 걸쳐 있습니다. 넓은 시간 범위를 설정하면 위치와 관계없이 데모 로그를 확인할 수 있습니다. 로그가 표시되면, 시각화를 더 명확하게 하기 위해 범위를 24시간으로 좁힐 수 있습니다.
:::

</VerticalStepper>

## 대시보드와 시각화 {#dashboards}

ClickStack으로 호스트 로그 모니터링을 시작하는 데 도움이 되도록, 시스템 로그용 핵심 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.host_logs_monitoring.dashboard_download">대시보드 구성 다운로드</TrackedLink> {#download}

#### 미리 구성된 대시보드 가져오기 \{#import-dashboard\}

1. HyperDX를 열고 Dashboards 섹션으로 이동합니다.
2. 오른쪽 상단의 줄임표 아이콘 메뉴에서 **Import Dashboard**를 클릭합니다.

<Image img={import_dashboard} alt="대시보드 가져오기 버튼"/>

3. `host-logs-dashboard.json` 파일을 업로드하고 **Finish Import**를 클릭합니다.

<Image img={finish_import} alt="가져오기 완료"/>

#### 대시보드 보기 \{#created-dashboard\}

대시보드는 모든 시각화가 사전 구성된 상태로 생성됩니다.

<Image img={logs_dashboard} alt="로그 대시보드"/>

주요 시각화는 다음을 포함합니다.
- 심각도별 시간 경과에 따른 로그 양
- 로그를 생성하는 상위 systemd 유닛
- SSH 로그인 활동(성공 vs 실패)
- 방화벽 활동(차단 vs 허용)
- 보안 이벤트(로그인 실패, 차단, 봉쇄)
- 서비스 재시작 활동

:::note
데모 데이터셋의 경우, 시간 범위를 **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**로 설정하십시오(로컬 시간대에 맞게 조정). 가져온 대시보드에는 기본적으로 시간 범위가 지정되어 있지 않습니다.
:::

</VerticalStepper>

## 문제 해결 {#troubleshooting}

### 사용자 정의 설정이 로드되지 않음

환경 변수가 설정되어 있는지 확인하십시오:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

사용자 정의 구성 파일이 마운트되어 있고 읽을 수 있는지 확인하십시오:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```


### HyperDX에 로그가 표시되지 않습니다

**syslog 파일이 존재하며 실제로 기록되고 있는지 확인하십시오.**

```bash
# Check if syslog exists
ls -la /var/log/syslog /var/log/messages

# Verify logs are being written
tail -f /var/log/syslog
```

**Collector가 로그를 읽을 수 있는지 확인하십시오.**

```bash
docker exec <container> cat /var/log/syslog | head -20
```

**실제 적용 중인 구성에 `filelog` 수신기가 포함되어 있는지 확인하십시오.**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

**수집기 로그에 오류가 있는지 확인하십시오.**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i "filelog\|syslog"
```

**데모 데이터셋을 사용하는 경우, 로그 파일에 액세스할 수 있는지 확인하십시오.**

```bash
docker exec <container> cat /tmp/host-demo/journal.log | wc -l
```


### 로그가 제대로 파싱되지 않는 경우

**선택한 설정과 syslog 형식이 일치하는지 확인하십시오.**

최신 Linux(Ubuntu 24.04 이상)의 경우:

```bash
# Should show ISO8601 format: 2025-11-17T20:55:44.826796+00:00
tail -5 /var/log/syslog
```

레거시 Linux 또는 macOS 환경:

```bash
# Should show traditional format: Nov 17 14:16:16
tail -5 /var/log/syslog
# or
tail -5 /var/log/system.log
```

사용 중인 형식이 여기와 다르다면 [Create custom OTel collector configuration](#custom-otel) 섹션에서 해당 형식에 맞는 설정 탭을 선택하십시오.


## 다음 단계 {#next-steps}

호스트 로그 모니터링을 설정한 후에는 다음 작업을 수행할 수 있습니다.

- 중요한 시스템 이벤트(서비스 장애, 인증 실패, 디스크 경고)에 대한 [알림](/use-cases/observability/clickstack/alerts)을 설정합니다.
- 특정 단위별로 필터링하여 개별 서비스를 모니터링합니다.
- 포괄적인 문제 해결을 위해 호스트 로그와 애플리케이션 로그를 연관시킵니다.
- 보안 관측을 위한 맞춤 대시보드(SSH 시도, sudo 사용, 방화벽 차단 등)를 생성합니다.

## 프로덕션 환경으로 이전하기 {#going-to-production}

이 가이드는 빠른 구성을 위해 ClickStack에 내장된 OpenTelemetry Collector를 기반으로 설정 방법을 확장하여 설명합니다. 프로덕션 환경에 배포할 때에는 별도의 OTel Collector를 운영하고, 데이터를 ClickStack의 OTLP 엔드포인트로 전송할 것을 권장합니다. 프로덕션 환경 구성을 위해서는 [OpenTelemetry 데이터 전송](/use-cases/observability/clickstack/ingesting-data/opentelemetry)을 참고하십시오.