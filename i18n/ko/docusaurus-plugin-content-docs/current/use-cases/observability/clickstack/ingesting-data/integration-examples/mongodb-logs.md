---
slug: /use-cases/observability/clickstack/integrations/mongodb-logs
title: 'ClickStack을 사용한 MongoDB 로그 모니터링'
sidebar_label: 'MongoDB 로그'
pagination_prev: null
pagination_next: null
description: 'ClickStack을 사용한 MongoDB 로그 모니터링'
doc_type: 'guide'
keywords: ['MongoDB', '로그', 'OTel', 'ClickStack', '데이터베이스 모니터링', '느린 쿼리']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import log_view from '@site/static/images/clickstack/mongodb/log-view.png';
import search_view from '@site/static/images/clickstack/mongodb/search-view.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/mongodb/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/mongodb/example-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack을 사용한 MongoDB 로그 모니터링 \{#mongodb-logs-clickstack\}

:::note[TL;DR]
OTel `filelog` 수신기를 사용하여 ClickStack에서 MongoDB 서버 로그(4.4+ JSON 형식)를 수집하고 시각화합니다. 데모 데이터셋과 미리 구성된 대시보드가 포함되어 있습니다.
:::

## 기존 MongoDB 통합 \{#existing-mongodb\}

이 섹션에서는 ClickStack OTel collector 구성을 수정하여 기존 MongoDB 설치에서 ClickStack으로 로그를 전송하도록 설정하는 방법을 설명합니다.
기존 환경을 직접 구성하기 전에 MongoDB 통합을 테스트하려면 [&quot;데모 데이터셋&quot;](/use-cases/observability/clickstack/integrations/mongodb-logs#demo-dataset) 섹션의 사전 구성된 환경과 샘플 데이터를 사용해 테스트할 수 있습니다.

### 사전 요구 사항 \{#prerequisites\}

* 실행 중인 ClickStack 인스턴스
* 기존 자가 관리형 MongoDB 설치 환경(버전 4.4 이상)
* MongoDB 로그 파일에 대한 접근 권한

<VerticalStepper headerLevel="h4">
  #### MongoDB 로깅 구성 확인

  MongoDB 4.4 이상은 기본적으로 구조화된 JSON 로그를 출력합니다. 로그 파일 위치를 확인하세요:

  ```bash
  cat /etc/mongod.conf | grep -A 5 systemLog
  ```

  일반적인 MongoDB 로그 위치:

  * **Linux (apt/yum)**: `/var/log/mongodb/mongod.log`
  * **macOS (Homebrew)**: `/usr/local/var/log/mongodb/mongo.log`
  * **Docker**: 일반적으로 stdout에 기록되지만, `/var/log/mongodb/mongod.log`에 기록하도록 구성할 수도 있습니다

  MongoDB가 stdout으로 로그를 출력하고 있다면, `mongod.conf`를 업데이트하여 파일에 기록하도록 설정하십시오:

  ```yaml
  systemLog:
    destination: file
    path: /var/log/mongodb/mongod.log
    logAppend: true
  ```

  구성을 변경한 후 MongoDB를 재시작하십시오:

  ```bash
  # For systemd
  sudo systemctl restart mongod

  # For Docker
  docker restart <mongodb-container>
  ```

  #### MongoDB용 사용자 정의 OTel collector 구성 생성

  ClickStack에서는 사용자 정의 구성 파일을 마운트하고 환경 변수를 설정하여 기본 OpenTelemetry Collector 구성을 확장할 수 있습니다. 사용자 정의 구성은 OpAMP를 통해 HyperDX가 관리하는 기본 구성과 병합됩니다.

  다음 구성으로 `mongodb-monitoring.yaml` 파일을 생성하십시오:

  ```yaml
  receivers:
    filelog/mongodb:
      include:
        - /var/log/mongodb/mongod.log
      start_at: beginning
      operators:
        - type: json_parser
          parse_from: body
          parse_to: attributes
          timestamp:
            parse_from: attributes.t.$$date
            layout: '2006-01-02T15:04:05.000-07:00'
            layout_type: gotime
          severity:
            parse_from: attributes.s
            overwrite_text: true
            mapping:
              fatal: F
              error: E
              warn: W
              info: I
              debug:
                - D1
                - D2
                - D3
                - D4
                - D5

        - type: move
          from: attributes.msg
          to: body

        - type: add
          field: attributes.source
          value: "mongodb"

        - type: add
          field: resource["service.name"]
          value: "mongodb-production"

  service:
    pipelines:
      logs/mongodb:
        receivers: [filelog/mongodb]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  ```

  :::note

  * 사용자 지정 구성에서는 새로운 receiver와 pipeline만 정의하면 됩니다. processor(`memory_limiter`, `transform`, `batch`)와 exporter(`clickhouse`)는 기본 ClickStack 구성에 이미 정의되어 있으므로, 이름으로 참조만 하면 됩니다.
  * 이 구성은 수집기가 시작될 때 기존 로그를 모두 읽기 위해 `start_at: beginning`을 사용합니다. 프로덕션 배포에서는 수집기가 다시 시작될 때 로그를 다시 수집하지 않도록 `start_at: end`로 변경하십시오.
    :::

  #### 사용자 정의 설정을 로드하도록 ClickStack 구성하기

  기존 ClickStack 배포에서 사용자 정의 수집기 구성을 활성화하려면 다음 작업을 수행하십시오.

  1. 사용자 지정 구성 파일을 `/etc/otelcol-contrib/custom.config.yaml`에 마운트하십시오
  2. 환경 변수 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`을 설정하세요
  3. 수집기가 MongoDB 로그를 읽을 수 있도록 MongoDB 로그 디렉터리를 마운트하십시오

  <Tabs groupId="deployMethod">
    <TabItem value="docker-compose" label="Docker Compose" default>
      ClickStack 배포 구성을 업데이트하십시오:

      ```yaml
      services:
        clickstack:
          # ... 기존 구성 ...
          environment:
            - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
            # ... 기타 환경 변수 ...
          volumes:
            - ./mongodb-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
            - /var/log/mongodb:/var/log/mongodb:ro
            # ... 기타 볼륨 ...
      ```
    </TabItem>

    <TabItem value="docker-run" label="Docker Run (All-in-One Image)">
      Docker 올인원 이미지를 사용하는 경우 다음을 실행하십시오:

      ```bash
      docker run --name clickstack \
        -p 8080:8080 -p 4317:4317 -p 4318:4318 \
        -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
        -v "$(pwd)/mongodb-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
        -v /var/log/mongodb:/var/log/mongodb:ro \
        clickhouse/clickstack-all-in-one:latest
      ```
    </TabItem>
  </Tabs>

  :::note
  ClickStack 수집기에 MongoDB 로그 파일을 읽을 수 있는 적절한 권한이 부여되어 있는지 확인하십시오. 프로덕션 환경에서는 읽기 전용 마운트(`:ro`)를 사용하고 최소 권한 원칙을 준수하십시오.
  :::

  #### HyperDX에서 로그 확인

  구성이 완료되면 HyperDX에 로그인하여 로그가 정상적으로 수집되고 있는지 확인하십시오.

  <Image img={search_view} alt="MongoDB 로그 검색 화면" />

  <Image img={log_view} alt="MongoDB 로그 상세 화면" />
</VerticalStepper>

## 데모 데이터셋

프로덕션 시스템을 구성하기 전에 미리 생성된 샘플 데이터셋으로 MongoDB 통합을 테스트합니다.

<VerticalStepper headerLevel="h4">
  #### 샘플 데이터셋 다운로드

  샘플 로그 파일을 다운로드합니다.

  ```bash
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/mongodb/mongod.log
  ```

  #### 테스트용 collector 구성 생성

  다음 구성으로 `mongodb-demo.yaml` 파일을 생성합니다.

  ```yaml
  cat > mongodb-demo.yaml << 'EOF'
  receivers:
    filelog/mongodb:
      include:
        - /tmp/mongodb-demo/mongod.log
      start_at: beginning
      operators:
        - type: json_parser
          parse_from: body
          parse_to: attributes
          timestamp:
            parse_from: attributes.t.$$date
            layout: '2006-01-02T15:04:05.000-07:00'
            layout_type: gotime
          severity:
            parse_from: attributes.s
            overwrite_text: true
            mapping:
              fatal: F
              error: E
              warn: W
              info: I
              debug:
                - D1
                - D2
                - D3
                - D4
                - D5

        - type: move
          from: attributes.msg
          to: body

        - type: add
          field: attributes.source
          value: "mongodb-demo"

        - type: add
          field: resource["service.name"]
          value: "mongodb-demo"

  service:
    pipelines:
      logs/mongodb-demo:
        receivers: [filelog/mongodb]
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
    -v "$(pwd)/mongodb-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/mongod.log:/tmp/mongodb-demo/mongod.log:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  ## HyperDX에서 로그 확인

  ClickStack이 실행되면 다음을 수행합니다.

  1. [HyperDX](http://localhost:8080/)를 열고 계정에 로그인합니다(먼저 계정을 생성해야 할 수 있습니다)
  2. Search 보기로 이동한 다음 소스를 `Logs`로 설정합니다
  3. 시간 범위에 **2026-03-09 00:00:00 - 2026-03-10 00:00:00 (UTC)**가 포함되도록 설정합니다

  <Image img={search_view} alt="MongoDB 로그 검색 보기" />

  <Image img={log_view} alt="MongoDB 로그 상세 보기" />
</VerticalStepper>

## 대시보드 및 시각화 {#dashboards}

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/mongodb-logs-dashboard.json')} download="mongodb-logs-dashboard.json" eventName="docs.mongodb_logs_monitoring.dashboard_download">다운로드</TrackedLink> 대시보드 구성 \{#download\}

#### 미리 구성된 대시보드 가져오기 \{#import-dashboard\}

1. HyperDX를 열고 Dashboards 섹션으로 이동합니다.
2. 오른쪽 상단의 점 3개 메뉴 아래에서 "Import Dashboard"를 클릭합니다.

<Image img={import_dashboard} alt="Import Dashboard"/>

3. mongodb-logs-dashboard.json 파일을 업로드한 다음 가져오기를 완료합니다.

<Image img={finish_import} alt="Finish importing MongoDB logs dashboard"/>

#### 대시보드가 생성되며 모든 시각화가 미리 구성됩니다 {#created-dashboard}

데모 데이터셋의 경우 시간 범위를 **2026-03-09 00:00:00 - 2026-03-10 00:00:00 (UTC)**가 포함되도록 설정합니다.

<Image img={example_dashboard} alt="MongoDB logs dashboard"/>

</VerticalStepper>

## 문제 해결

**실제로 적용된 구성에 filelog 리시버가 포함되어 있는지 확인하십시오:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

**Collector에서 발생한 오류를 확인하십시오:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
```

**MongoDB가 JSON 형식의 로그를 출력하는지 확인하십시오(4.4+):**

```bash
tail -1 /var/log/mongodb/mongod.log | python3 -m json.tool
```

출력이 유효한 JSON이 아니라면, 사용 중인 MongoDB 버전에서 레거시 텍스트 로그 형식(4.4 이전)을 사용하고 있을 수 있습니다. 이 경우 `json_parser` 연산자를 `regex_parser`로 바꾸거나 MongoDB 4.4+로 업그레이드해야 합니다.


## 다음 단계

* 중요한 이벤트(오류 급증, 느린 쿼리 임곗값)에 대한 [경고](/use-cases/observability/clickstack/alerts)를 구성하세요
* 특정 사용 사례(레플리카 세트 모니터링, 연결 추적)를 위한 추가 [대시보드](/use-cases/observability/clickstack/dashboards)를 만드세요

## 프로덕션 환경으로 전환하기

이 가이드는 빠르게 설정할 수 있도록 ClickStack에 기본 제공되는 OpenTelemetry Collector를 확장해 사용합니다. 프로덕션 환경에 배포할 때는 자체 OTel collector를 실행하고 데이터를 ClickStack의 OTLP 엔드포인트로 전송하는 방식을 권장합니다. 프로덕션 구성을 위한 자세한 내용은 [OpenTelemetry 데이터 전송](/use-cases/observability/clickstack/ingesting-data/opentelemetry)을 참조하십시오.