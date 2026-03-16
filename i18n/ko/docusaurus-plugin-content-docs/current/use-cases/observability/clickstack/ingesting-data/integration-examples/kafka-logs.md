---
slug: /use-cases/observability/clickstack/integrations/kafka-logs
title: 'ClickStack를 이용한 Kafka 로그 모니터링'
sidebar_label: 'Kafka 로그'
pagination_prev: null
pagination_next: null
description: 'ClickStack를 이용한 Kafka 로그 모니터링'
doc_type: 'guide'
keywords: ['Kafka', '로그', 'OTEL', 'ClickStack', '브로커 모니터링', 'Log4j']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import log_view from '@site/static/images/clickstack/kafka/logs/log-view.png';
import search_view from '@site/static/images/clickstack/kafka/logs/search-view.png';
import finish_import from '@site/static/images/clickstack/kafka/logs/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/kafka/logs/example-dashboard.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack를 이용한 Kafka 로그 모니터링 \{#kafka-logs-clickstack\}

:::note[TL;DR]
OTel `filelog` 수신기를 사용해 ClickStack에서 Kafka 브로커 로그(Log4j 형식)를 수집하고 시각화합니다. 데모 데이터셋과 미리 구성된 대시보드가 포함되어 있습니다.
:::

## 기존 Kafka 통합 \{#existing-kafka\}

이 섹션에서는 ClickStack OTel collector 구성을 수정하여 기존 Kafka 설치에서 브로커 로그를 ClickStack으로 전송하도록 구성하는 방법을 설명합니다.
기존 환경을 직접 구성하기 전에 Kafka 로그 통합을 테스트하려면 ["Demo dataset"](/use-cases/observability/clickstack/integrations/kafka-logs#demo-dataset) 섹션의 미리 구성된 설정과 샘플 데이터를 사용해 테스트할 수 있습니다.

### 사전 요구 사항 \{#prerequisites\}

* ClickStack 인스턴스가 실행 중임
* 기존 Kafka 설치(버전 2.0 이상)
* Kafka 로그 파일(`server.log`, `controller.log` 등)에 대한 접근 권한

<VerticalStepper headerLevel="h4">
  #### Kafka 로깅 구성 확인

  Kafka는 Log4j를 사용하며, `kafka.logs.dir` 시스템 속성 또는 `LOG_DIR` 환경 변수에 지정된 디렉터리에 로그를 기록합니다. 로그 파일 위치를 확인하십시오:

  ```bash
  # Default locations
  ls $KAFKA_HOME/logs/      # Standard Apache Kafka (defaults to <install-dir>/logs/)
  ls /var/log/kafka/        # RPM/DEB package installations
  ```

  주요 Kafka 로그 파일:

  * **`server.log`**: 일반 브로커 로그(시작, 연결, 복제, 오류 관련)
  * **`controller.log`**: 컨트롤러 관련 이벤트(리더 선출, 파티션 재할당)
  * **`state-change.log`**: 파티션 및 레플리카 상태 전환

  Kafka의 기본 Log4j 패턴은 다음과 같은 로그 줄을 생성합니다:

  ```text
  [2026-03-09 14:23:45,123] INFO [KafkaServer id=0] started (kafka.server.KafkaServer)
  ```

  :::note
  Docker 기반 Kafka 배포(예: `confluentinc/cp-kafka`)의 경우, 기본 Log4j 구성에는 콘솔 어펜더만 포함되어 있고 파일 어펜더가 없으므로 로그는 stdout에만 기록됩니다. `filelog` 수신기를 사용하려면 `log4j.properties`에 파일 어펜더를 추가하거나 stdout을 파이프(예: `| tee /var/log/kafka/server.log`)하는 방식으로 로그를 파일로 리디렉션해야 합니다.
  :::

  #### Kafka를 위한 사용자 지정 OTel collector 구성 만들기

  ClickStack를 사용하면 사용자 지정 구성 파일을 마운트하고 환경 변수를 설정하여 기본 OpenTelemetry Collector 구성을 확장할 수 있습니다. 사용자 지정 구성은 OpAMP를 통해 HyperDX가 관리하는 기본 구성과 머지됩니다.

  다음 구성으로 `kafka-logs-monitoring.yaml` 파일을 생성하세요:

  ```yaml
  receivers:
    filelog/kafka:
      include:
        - /var/log/kafka/server.log
        - /var/log/kafka/controller.log  # optional, only exists if log4j is configured with separate file appenders
        - /var/log/kafka/state-change.log  # optional, same as above
      start_at: beginning
      multiline:
        line_start_pattern: '^\[\d{4}-\d{2}-\d{2}'
      operators:
        - type: regex_parser
          regex: '^\[(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})\] (?P<severity>\w+) (?P<message>.*)'
          parse_from: body
          parse_to: attributes
          timestamp:
            parse_from: attributes.timestamp
            layout: '%Y-%m-%d %H:%M:%S,%L'
          severity:
            parse_from: attributes.severity

        - type: move
          from: attributes.message
          to: body

        - type: add
          field: attributes.source
          value: "kafka"

        - type: add
          field: resource["service.name"]
          value: "kafka-production"

  service:
    pipelines:
      logs/kafka:
        receivers: [filelog/kafka]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  ```

  :::note

  * 사용자 지정 구성에서는 새 수신기와 파이프라인만 정의하면 됩니다. 프로세서(`memory_limiter`, `transform`, `batch`)와 exporter(`clickhouse`)는 기본 ClickStack 구성에 이미 정의되어 있으므로 이름으로 참조만 하면 됩니다.
  * `multiline` 구성은 스택 트레이스가 하나의 로그 항목으로 수집되도록 합니다.
  * 이 구성은 collector가 시작될 때 기존 로그를 모두 읽기 위해 `start_at: beginning`을 사용합니다. 프로덕션 배포에서는 collector가 재시작될 때 로그를 다시 수집하지 않도록 `start_at: end`로 변경하십시오.
    :::

  #### 사용자 지정 구성을 로드하도록 ClickStack 설정

  기존 ClickStack 배포에서 사용자 지정 collector 구성을 활성화하려면 다음 작업을 수행해야 합니다.

  1. 사용자 지정 구성 파일을 `/etc/otelcol-contrib/custom.config.yaml` 경로에 마운트하세요
  2. 환경 변수 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`를 설정하세요
  3. collector가 로그를 읽을 수 있도록 Kafka 로그 디렉터리를 마운트하세요

  <Tabs groupId="deployMethod">
    <TabItem value="docker-compose" label="Docker Compose" default>
      ClickStack 배포 구성을 업데이트하세요:

      ```yaml
      services:
        clickstack:
          # ... 기존 구성 ...
          environment:
            - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
            # ... 기타 환경 변수 ...
          volumes:
            - ./kafka-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
            - /var/log/kafka:/var/log/kafka:ro
            # ... 기타 볼륨 ...
      ```
    </TabItem>

    <TabItem value="docker-run" label="Docker Run (All-in-One Image)">
      Docker와 함께 올인원 이미지를 사용하는 경우 다음을 실행하십시오:

      ```bash
      docker run --name clickstack \
        -p 8080:8080 -p 4317:4317 -p 4318:4318 \
        -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
        -v "$(pwd)/kafka-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
        -v /var/log/kafka:/var/log/kafka:ro \
        clickhouse/clickstack-all-in-one:latest
      ```
    </TabItem>
  </Tabs>

  :::note
  ClickStack collector가 Kafka 로그 파일을 읽을 수 있는 적절한 권한을 보유하고 있는지 확인하십시오. 운영 환경에서는 읽기 전용 마운트(`:ro`)를 사용하고 최소 권한 원칙을 준수하십시오.
  :::

  #### HyperDX에서 로그 확인

  구성이 완료되면 HyperDX에 로그인하여 로그가 정상적으로 수집되고 있는지 확인하십시오.

  <Image img={search_view} alt="검색 화면" />

  <Image img={log_view} alt="로그 뷰" />
</VerticalStepper>

## 데모 데이터셋

프로덕션 시스템을 구성하기 전에 미리 생성된 샘플 데이터셋으로 Kafka 로그 통합을 테스트합니다.

<VerticalStepper headerLevel="h4">
  #### 샘플 데이터셋 다운로드

  샘플 로그 파일을 다운로드합니다.

  ```bash
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/server.log
  ```

  #### 테스트용 collector 구성 생성

  다음 구성으로 `kafka-logs-demo.yaml` 파일을 생성합니다.

  ```yaml
  cat > kafka-logs-demo.yaml << 'EOF'
  receivers:
    filelog/kafka:
      include:
        - /tmp/kafka-demo/server.log
      start_at: beginning
      multiline:
        line_start_pattern: '^\[\d{4}-\d{2}-\d{2}'
      operators:
        - type: regex_parser
          regex: '^\[(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})\] (?P<severity>\w+) (?P<message>.*)'
          parse_from: body
          parse_to: attributes
          timestamp:
            parse_from: attributes.timestamp
            layout: '%Y-%m-%d %H:%M:%S,%L'
          severity:
            parse_from: attributes.severity

        - type: move
          from: attributes.message
          to: body

        - type: add
          field: attributes.source
          value: "kafka-demo"

        - type: add
          field: resource["service.name"]
          value: "kafka-demo"

  service:
    pipelines:
      logs/kafka-demo:
        receivers: [filelog/kafka]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  EOF
  ```

  #### 데모 구성으로 ClickStack 실행

  데모 로그와 구성으로 ClickStack을 실행합니다.

  ```bash
  docker run --name clickstack-demo \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/kafka-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/server.log:/tmp/kafka-demo/server.log:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  ## HyperDX에서 로그 확인

  ClickStack이 실행되면 다음 단계를 수행합니다.

  1. [HyperDX](http://localhost:8080/)를 열고 계정에 로그인합니다(먼저 계정을 생성해야 할 수 있습니다)
  2. Search 보기로 이동한 다음 소스를 `Logs`로 설정합니다
  3. 시간 범위에 **2026-03-09 00:00:00 - 2026-03-10 00:00:00 (UTC)**가 포함되도록 설정합니다

  <Image img={search_view} alt="Search view" />

  <Image img={log_view} alt="Log view" />
</VerticalStepper>

## 대시보드 및 시각화

<VerticalStepper headerLevel="h4">
  #### <TrackedLink href={useBaseUrl('/examples/kafka-logs-dashboard.json')} download="kafka-logs-dashboard.json" eventName="docs.kafka_logs_monitoring.dashboard_download">다운로드</TrackedLink>할 대시보드 구성 파일

  #### 미리 구성된 대시보드 가져오기

  1. HyperDX를 열고 Dashboards 섹션으로 이동합니다.
  2. 오른쪽 상단의 점 3개 메뉴에서 &quot;Import Dashboard&quot;를 클릭합니다.

  <Image img={import_dashboard} alt="대시보드 가져오기" />

  3. kafka-logs-dashboard.json 파일을 업로드한 다음 &quot;Finish Import&quot;를 클릭합니다.

  <Image img={finish_import} alt="Kafka 로그 대시보드 가져오기 완료" />

  #### 대시보드가 생성되면 모든 시각화가 미리 구성됩니다

  데모 데이터셋을 보려면 시간 범위에 **2026-03-09 00:00:00 - 2026-03-10 00:00:00 (UTC)**가 포함되도록 설정합니다.

  <Image img={example_dashboard} alt="Kafka 로그 예시 대시보드" />
</VerticalStepper>

## 문제 해결

**실제로 적용된 구성에 filelog 수신기가 포함되어 있는지 확인하십시오:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

**collector 오류 검사:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
```

**Kafka 로그 형식이 예상 패턴과 일치하는지 확인하십시오:**

```bash
tail -1 /var/log/kafka/server.log
```

Kafka 설치에서 사용자 지정 Log4j 패턴을 사용하는 경우, 이에 맞게 `regex_parser` 정규식을 조정하십시오.


## 다음 단계

* 중요한 이벤트(브로커 장애, 복제 오류, 컨슈머 그룹 문제)에 대한 [알림](/use-cases/observability/clickstack/alerts)을 설정하십시오
* 보다 포괄적인 Kafka 모니터링을 위해 [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics)와 함께 사용하십시오
* 특정 사용 사례(컨트롤러 이벤트, 파티션 재할당)에 맞는 추가 [대시보드](/use-cases/observability/clickstack/dashboards)를 생성하십시오

## 프로덕션 환경으로 전환하기 \{#demo-dataset\}

이 가이드는 빠르게 설정할 수 있도록 ClickStack에 내장된 OpenTelemetry Collector를 확장합니다. 프로덕션 배포에는 자체 OTel collector를 실행하고 데이터를 ClickStack의 OTLP 엔드포인트로 전송하는 것을 권장합니다. 프로덕션 환경 구성은 [OpenTelemetry 데이터 전송](/use-cases/observability/clickstack/ingesting-data/opentelemetry)을 참조하십시오.