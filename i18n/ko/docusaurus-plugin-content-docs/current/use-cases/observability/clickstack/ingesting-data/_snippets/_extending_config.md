### collector 구성 확장하기 \{#extending-collector-config\}

ClickStack 배포판의 OTel collector는 사용자 정의 구성 파일을 마운트하고 환경 변수를 설정하여 기본 구성을 확장할 수 있도록 지원합니다.

사용자 정의 receiver, processor 또는 pipeline을 추가하려면:

1. 추가 구성이 포함된 사용자 정의 구성 파일을 생성합니다.
2. 파일을 `/etc/otelcol-contrib/custom.config.yaml` 경로에 마운트합니다.
3. 환경 변수 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`를 설정합니다.

**사용자 정의 구성 예시:**

```yaml
receivers:
  # Collect logs from local files
  filelog:
    include:
      - /var/log/**/*.log
      - /var/log/syslog
      - /var/log/messages
    start_at: beginning

  # Collect host system metrics
  hostmetrics:
    collection_interval: 30s
    scrapers:
      cpu:
        metrics:
          system.cpu.utilization:
            enabled: true
      memory:
        metrics:
          system.memory.utilization:
            enabled: true
      disk:
      network:
      filesystem:
        metrics:
          system.filesystem.utilization:
            enabled: true

service:
  pipelines:
    # Logs pipeline
    logs/host:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
    
    # Metrics pipeline
    metrics/hostmetrics:
      receivers: [hostmetrics]
      processors:
        - memory_limiter
        - batch
      exporters:
        - clickhouse
```

**독립 실행형 컬렉터를 사용하여 배포:**

```bash
docker run -d \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  # -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-otel-collector:latest
```

:::note
사용자 정의 구성에서는 새로운 receiver, processor, pipeline만 정의합니다. 기본 processor인 `memory_limiter`, `batch`와 exporter인 `clickhouse`는 이미 정의되어 있으므로 이름으로만 참조하면 됩니다. 사용자 정의 구성은 기본 구성과 병합되며, 기존 구성 요소를 덮어쓸 수 없습니다.
:::

보다 복잡한 구성이 필요한 경우 [기본 ClickStack collector 구성](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml)과 [ClickHouse exporter 문서](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)를 참고하십시오.


#### 구성 구조 \{#configuration-structure\}

[`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/), [`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md), [`processors`](https://opentelemetry.io/docs/collector/configuration/#processors)를 포함한 OTel collector 구성에 대한 자세한 내용은 [공식 OpenTelemetry collector 문서](https://opentelemetry.io/docs/collector/configuration)를 참고하십시오.