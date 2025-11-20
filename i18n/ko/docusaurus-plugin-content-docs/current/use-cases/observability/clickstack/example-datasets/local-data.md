---
'slug': '/use-cases/observability/clickstack/getting-started/local-data'
'title': '로컬 로그 및 메트릭'
'sidebar_position': 1
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack 로컬 및 시스템 데이터와 메트릭에 대한 시작하기'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'example data'
- 'sample dataset'
- 'logs'
- 'observability'
---

import Image from '@theme/IdealImage';
import hyperdx_20 from '@site/static/images/use-cases/observability/hyperdx-20.png';
import hyperdx_21 from '@site/static/images/use-cases/observability/hyperdx-21.png';
import hyperdx_22 from '@site/static/images/use-cases/observability/hyperdx-22.png';
import hyperdx_23 from '@site/static/images/use-cases/observability/hyperdx-23.png';

This getting started guide allows you to collect local logs and metrics from your system, sending them to ClickStack for visualization and analysis.

**This example works on OSX and Linux systems only**

:::note HyperDX in ClickHouse Cloud
이 샘플 데이터 세트는 흐름에 약간의 조정만으로 ClickHouse Cloud의 HyperDX와 함께 사용할 수 있습니다. ClickHouse Cloud에서 HyperDX를 사용하는 경우, 사용자는 [이 배포 모델의 시작 가이드](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)에 설명된 대로 로컬에서 OpenTelemetry 수집기가 실행 중이어야 합니다.
:::

<VerticalStepper>

## Create a custom OpenTelemetry configuration {#create-otel-configuration}

Create a `custom-local-config.yaml` file with the following content:

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

이 구성은 OSX 및 Linux 시스템의 시스템 로그 및 메트릭을 수집하여 ClickStack으로 전송합니다. 이 구성은 ClickStack 수집기를 확장하여 새로운 수신자와 파이프라인을 추가합니다. 이미 기본 ClickStack 수집기에 구성된 기존 `clickhouse` 내보내기 및 프로세서(`memory_limiter`, `batch`)를 참조합니다.

:::note Ingestion timestamps
이 구성은 수집 시 타임스탬프를 조정하여 각 이벤트에 업데이트된 시간 값을 할당합니다. 사용자는 이상적으로 로그 파일에서 OTel 프로세서 또는 연산자를 사용하여 [타임스탬프를 전처리하거나 파싱](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching)하여 정확한 이벤트 시간이 유지되도록 해야 합니다.

이 샘플 설정을 사용하면 수신자 또는 파일 프로세서가 파일 시작 부분에서 시작하도록 구성된 경우, 모든 기존 로그 항목은 처리 시간(원래 이벤트 시간 아님)으로 동일한 조정된 타임스탬프가 할당됩니다. 파일에 추가된 새로운 이벤트는 실제 생성 시간을 근사하는 타임스탬프를 받게 됩니다.

이러한 동작을 피하려면 수신자 구성에서 시작 위치를 `end`로 설정할 수 있습니다. 이렇게 하면 새로운 항목만 수집되고 실제 도착 시간에 가까운 타임스탬프가 설정됩니다.
:::

OpenTelemetry (OTel) 구성 구조에 대한 자세한 내용은 [공식 가이드](https://opentelemetry.io/docs/collector/configuration/)를 권장합니다.

## Start ClickStack with custom configuration {#start-clickstack}

Run the following docker command to start the all-in-one container with your custom configuration:

```shell
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  --user 0:0 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/custom-local-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log:/host/var/log:ro \
  -v /private/var/log:/host/private/var/log:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note Root user
우리는 모든 시스템 로그에 접근하기 위해 수집기를 루트 사용자로 실행합니다. 이는 Linux 기반 시스템의 보호 경로에서 로그를 캡처하는 데 필요합니다. 그러나 이 접근 방식은 프로덕션에서는 권장되지 않습니다. 프로덕션 환경에서는 OpenTelemetry Collector가 의도한 로그 소스에 접근하는 데 필요한 최소한의 권한만 가진 로컬 에이전트로 배포되어야 합니다.

호스트의 `/var/log`를 컨테이너 내부의 `/host/var/log`에 마운트하여 컨테이너의 로그 파일과의 충돌을 피하는 점도 주의하세요.
:::

If using HyperDX in ClickHouse Cloud with a standalone collector, use this command instead:

```shell
docker run -d \
  -p 4317:4317 -p 4318:4318 \
  --user 0:0 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -v "$(pwd)/custom-local-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log:/host/var/log:ro \
  -v /private/var/log:/host/private/var/log:ro \
  docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

수집기는 즉시 로컬 시스템 로그 및 메트릭을 수집하기 시작합니다.

## Navigate to the HyperDX UI {#navigate-to-the-hyperdx-ui}

Visit [http://localhost:8080](http://localhost:8080) to access the HyperDX UI if deploying locally. If using HyperDX in ClickHouse Cloud, select your service and `HyperDX` from the left menu.

## Explore system logs {#explore-system-logs}

The search UI should be populated with local system logs. Expand the filters to select the `system.log`:

<Image img={hyperdx_20} alt="HyperDX Local logs" size="lg"/>

## Explore system metrics {#explore-system-metrics}

We can explore our metrics using charts.

Navigate to the Chart Explorer via the left menu. Select the source `Metrics` and `Maximum` as the aggregation type. 

For the `Select a Metric` menu simply type `memory` before selecting `system.memory.utilization (Gauge)`.

Press the run button to visualize your memory utilization over time.

<Image img={hyperdx_21} alt="Memory over time" size="lg"/>

Note the number is returned as a floating point `%`. To render it more clearly, select `Set number format`. 

<Image img={hyperdx_22} alt="Number format" size="lg"/>

From the subsequent menu you can select `Percentage` from the `Output format` drop down before clicking `Apply`.

<Image img={hyperdx_23} alt="Memory % of time" size="lg"/>

</VerticalStepper>
