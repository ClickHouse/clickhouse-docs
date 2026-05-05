---
slug: /use-cases/observability/clickstack/getting-started/local-data
title: '로컬 로그 및 메트릭'
sidebar_position: 1
pagination_prev: null
pagination_next: null
toc_max_heading_level: 2
description: 'ClickStack의 로컬 및 시스템 데이터와 메트릭 시작하기'
doc_type: 'guide'
keywords: ['clickstack', '예제 데이터', '샘플 데이터셋', '로그', '관측성']
---

import Image from '@theme/IdealImage';
import hyperdx_20 from '@site/static/images/use-cases/observability/hyperdx-20.png';
import hyperdx_21 from '@site/static/images/use-cases/observability/hyperdx-21.png';
import hyperdx_22 from '@site/static/images/use-cases/observability/hyperdx-22.png';
import hyperdx_23 from '@site/static/images/use-cases/observability/hyperdx-23.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import select_service from '@site/static/images/clickstack/select_service.png';

이 시작 가이드는 시스템의 로컬 로그와 메트릭을 수집하여 ClickStack으로 전송하고, 이를 시각화 및 분석할 수 있도록 합니다.

**이 예제는 OSX와 Linux 시스템에서만 작동합니다**

<Tabs groupId="sample-logs">
  <TabItem value="관리형 ClickStack" label="관리형 ClickStack" default>
    이 가이드는 [관리형 ClickStack 시작 가이드](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)를 완료하고 [연결 자격 증명을 기록](/use-cases/observability/clickstack/getting-started/managed#next-steps)한 것을 전제로 합니다.

    <VerticalStepper headerLevel="h3">
      ### 사용자 정의 OpenTelemetry 구성 생성 \{#create-otel-configuration\}

      다음 내용으로 `custom-local-config.yaml` 파일을 생성하세요:

      ```yaml
      receivers:
        filelog:
          include:
            - /host/var/log/**/*.log        # Linux logs from host
            - /host/var/log/syslog
            - /host/var/log/messages
            - /host/private/var/log/*.log   # macOS logs from host
          start_at: beginning
          resource:
            service.name: "system-logs"

        hostmetrics:
          collection_interval: 1s
          scrapers:
            cpu:
              metrics:
                system.cpu.time:
                  enabled: true
                system.cpu.utilization:
                  enabled: true
            memory:
              metrics:
                system.memory.usage:
                  enabled: true
                system.memory.utilization:
                  enabled: true
            filesystem:
              metrics:
                system.filesystem.usage:
                  enabled: true
                system.filesystem.utilization:
                  enabled: true
            paging:
              metrics:
                system.paging.usage:
                  enabled: true
                system.paging.utilization:
                  enabled: true
                system.paging.faults:
                  enabled: true
            disk:
            load:
            network:
            processes:

      service:
        pipelines:
          logs/local:
            receivers: [filelog]
            processors:
              - memory_limiter
              - batch
            exporters:
              - clickhouse
          metrics/hostmetrics:
            receivers: [hostmetrics]
            processors:
              - memory_limiter
              - batch
            exporters:
              - clickhouse
      ```

      이 구성은 OSX 및 Linux 시스템의 시스템 로그와 메트릭을 수집하여 ClickStack으로 전송합니다. 이 구성은 새로운 리시버와 파이프라인을 추가하여 ClickStack 컬렉터를 확장하며, 기본 ClickStack 컬렉터에 이미 구성된 기존 `clickhouse` 익스포터와 프로세서(`memory_limiter`, `batch`)를 참조합니다.

      :::note 수집 타임스탬프
      이 구성은 수집 시 타임스탬프를 조정하여 각 이벤트에 업데이트된 시간 값을 할당합니다. 정확한 이벤트 시간을 유지하려면 로그 파일에서 OTel 프로세서 또는 연산자를 사용하여 [타임스탬프를 전처리하거나 파싱하세요](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching).

      이 예제 설정에서 receiver 또는 file processor가 파일의 시작 부분부터 읽도록 구성된 경우, 기존의 모든 로그 항목에는 원래 이벤트 시간이 아닌 처리 시점의 시간으로 동일한 조정된 타임스탬프가 할당됩니다. 파일에 추가되는 새로운 이벤트는 실제 생성 시간에 근사한 타임스탬프를 받게 됩니다.

      이 동작을 방지하려면 수신기 구성에서 시작 위치를 `end`로 설정하세요. 이렇게 하면 새 항목만 수집되며 실제 도착 시간에 가까운 타임스탬프가 기록됩니다.
      :::

      OpenTelemetry(OTel) 구성 구조에 대한 자세한 내용은 [공식 가이드](https://opentelemetry.io/docs/collector/configuration/)를 참조하시기 바랍니다.

      ### OpenTelemetry 수집기 시작하기 \{#start-the-otel-collector\}

      다음 명령어로 독립형 수집기를 실행하세요:

      ```shell
      docker run -d \
        -p 4317:4317 -p 4318:4318 \
        --user 0:0 \
        -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
        -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
        -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
        -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
        -v "$(pwd)/custom-local-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
        -v /var/log:/host/var/log:ro \
        -v /private/var/log:/host/private/var/log:ro \
        clickhouse/clickstack-otel-collector:latest
      ```

      컬렉터는 즉시 로컬 시스템 로그 및 메트릭 수집을 시작합니다.

      ### 서비스를 선택하세요 \{#select-your-service\}

      ClickHouse Cloud 메인 랜딩 페이지에서 Managed ClickStack 서비스를 선택하세요.

      <Image img={select_service} alt="서비스 선택" size="lg" />

      ### 시스템 로그 탐색하기 \{#navigate-to-the-hyperdx-ui\}

      왼쪽 메뉴에서 `ClickStack`을 선택하여 ClickStack UI로 이동하십시오. 자동으로 인증됩니다.

      검색 UI에 로컬 시스템 로그가 표시됩니다. 필터를 확장하여 `system.log`를 선택하세요:

      <Image img={hyperdx_20} alt="HyperDX 로컬 로그" size="lg" />

      ### 시스템 메트릭 탐색하기 \{#explore-system-metrics\}

      차트를 사용하여 메트릭을 탐색할 수 있습니다.

      왼쪽 메뉴에서 Chart Explorer로 이동하세요. 소스는 `Metrics`를 선택하고 집계 유형은 `Maximum`을 선택하세요.

      `Select a Metric` 메뉴에서 `system.memory.utilization (Gauge)`를 선택하기 전에 `memory`를 입력하세요.

      실행 버튼을 눌러 시간 경과에 따른 메모리 사용률을 시각화하세요.

      <Image img={hyperdx_21} alt="시간에 따른 메모리 사용량" size="lg" />

      숫자는 부동 소수점 `%`로 반환됩니다. 더 명확하게 표시하려면 `Set number format`을 선택하세요.

      <Image img={hyperdx_22} alt="숫자 형식" size="lg" />

      이후 메뉴에서 `Output format` 드롭다운에서 `Percentage`를 선택한 다음 `Apply`를 클릭하세요.

      <Image img={hyperdx_23} alt="메모리 소요 시간 비율(%)" size="lg" />
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack 오픈소스">
    <VerticalStepper>
      ### 사용자 정의 OpenTelemetry 구성 생성 \{#create-otel-configuration-oss\}

      다음 내용으로 `custom-local-config.yaml` 파일을 생성하세요:

      ```yaml
      receivers:
        filelog:
          include:
            - /host/var/log/**/*.log        # Linux logs from host
            - /host/var/log/syslog
            - /host/var/log/messages
            - /host/private/var/log/*.log   # macOS logs from host
          start_at: beginning
          resource:
            service.name: "system-logs"

        hostmetrics:
          collection_interval: 1s
          scrapers:
            cpu:
              metrics:
                system.cpu.time:
                  enabled: true
                system.cpu.utilization:
                  enabled: true
            memory:
              metrics:
                system.memory.usage:
                  enabled: true
                system.memory.utilization:
                  enabled: true
            filesystem:
              metrics:
                system.filesystem.usage:
                  enabled: true
                system.filesystem.utilization:
                  enabled: true
            paging:
              metrics:
                system.paging.usage:
                  enabled: true
                system.paging.utilization:
                  enabled: true
                system.paging.faults:
                  enabled: true
            disk:
            load:
            network:
            processes:

      service:
        pipelines:
          logs/local:
            receivers: [filelog]
            processors:
              - memory_limiter
              - batch
            exporters:
              - clickhouse
          metrics/hostmetrics:
            receivers: [hostmetrics]
            processors:
              - memory_limiter
              - batch
            exporters:
              - clickhouse
      ```

      이 구성은 OSX 및 Linux 시스템의 시스템 로그와 메트릭을 수집하여 ClickStack으로 전송합니다. 이 구성은 새로운 리시버와 파이프라인을 추가하여 ClickStack 컬렉터를 확장하며, 기본 ClickStack 컬렉터에 이미 구성되어 있는 기존 `clickhouse` 익스포터 및 프로세서(`memory_limiter`, `batch`)를 참조합니다.

      :::note 수집 타임스탬프
      이 구성은 수집 시 타임스탬프를 조정하여 각 이벤트에 업데이트된 시간 값을 할당합니다. 정확한 이벤트 시간을 유지하려면 로그 파일에서 OTel 프로세서 또는 연산자를 사용하여 [타임스탬프를 전처리하거나 파싱하세요](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching).

      이 예제 설정에서 receiver 또는 file processor가 파일의 시작 부분부터 읽도록 구성된 경우, 기존의 모든 로그 항목에는 원래 이벤트 시간이 아닌 처리 시점의 시간으로 동일한 조정된 타임스탬프가 할당됩니다. 파일에 추가되는 새로운 이벤트는 실제 생성 시간에 근사한 타임스탬프를 받게 됩니다.

      이 동작을 방지하려면 수신기 구성에서 시작 위치를 `end`로 설정하세요. 이렇게 하면 새 항목만 수집되며 실제 도착 시간에 가까운 타임스탬프가 기록됩니다.
      :::

      OpenTelemetry(OTel) 구성 구조에 대한 자세한 내용은 [공식 가이드](https://opentelemetry.io/docs/collector/configuration/)를 참조하시기 바랍니다.

      ### 사용자 지정 구성으로 ClickStack 시작 \{#start-clickstack\}

      사용자 정의 구성으로 all-in-one 컨테이너를 시작하려면 다음 docker 명령을 실행하세요:

      ```shell
      docker run -d --name clickstack \
        -p 8080:8080 -p 4317:4317 -p 4318:4318 \
        --user 0:0 \
        -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
        -v "$(pwd)/custom-local-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
        -v /var/log:/host/var/log:ro \
        -v /private/var/log:/host/private/var/log:ro \
        clickhouse/clickstack-all-in-one:latest
      ```

      :::note Root 사용자
      모든 시스템 로그에 접근하기 위해 collector를 root 사용자로 실행합니다. 이는 Linux 기반 시스템의 보호된 경로에서 로그를 수집하는 데 필요합니다. 그러나 이 방식은 프로덕션 환경에서는 권장되지 않습니다. 프로덕션 환경에서는 OpenTelemetry Collector를 로컬 에이전트로 배포하고, 대상 로그 소스에 접근하는 데 필요한 최소 권한만 부여해야 합니다.

      컨테이너 자체의 로그 파일과의 충돌을 방지하기 위해 호스트의 `/var/log`를 컨테이너 내부의 `/host/var/log`에 마운트한다는 점에 유의하세요.
      :::

      ### 시스템 로그 탐색하기 \{#navigate-to-the-hyperdx-ui-oss\}

      로컬에 배포하는 경우 [http://localhost:8080](http://localhost:8080)에 접속하여 ClickStack UI에 액세스하세요.

      데이터 소스는 미리 생성되어 있습니다. 검색 UI에는 로컬 시스템 로그가 표시됩니다. 필터를 확장하여 `system.log`를 선택하세요:

      <Image img={hyperdx_20} alt="HyperDX 로컬 로그" size="lg" />

      ### 시스템 메트릭 탐색하기 \{#explore-system-metrics-oss\}

      차트를 사용하여 메트릭을 탐색할 수 있습니다.

      왼쪽 메뉴에서 Chart Explorer로 이동하세요. 소스는 `Metrics`를 선택하고 집계 유형은 `Maximum`을 선택하세요.

      `Select a Metric` 메뉴에서 `system.memory.utilization (Gauge)`를 선택하기 전에 `memory`를 입력하세요.

      실행 버튼을 눌러 시간 경과에 따른 메모리 사용률을 시각화하세요.

      <Image img={hyperdx_21} alt="시간에 따른 메모리 사용량" size="lg" />

      숫자는 부동 소수점 `%`로 반환됩니다. 더 명확하게 표시하려면 `Set number format`을 선택하세요.

      <Image img={hyperdx_22} alt="숫자 형식" size="lg" />

      이후 메뉴에서 `Output format` 드롭다운에서 `Percentage`를 선택한 다음 `Apply`를 클릭하세요.

      <Image img={hyperdx_23} alt="메모리 사용 시간 비율(%)" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>