### Расширение конфигурации коллектора \{#extending-collector-config\}

Дистрибутив ClickStack с OTel collector поддерживает расширение базовой конфигурации за счёт монтирования пользовательского файла конфигурации и задания переменной окружения.

Чтобы добавить пользовательские receivers, processors или pipelines:

1. Создайте пользовательский файл конфигурации с вашими дополнительными настройками
2. Смонтируйте файл по пути `/etc/otelcol-contrib/custom.config.yaml`
3. Задайте переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`

**Пример пользовательской конфигурации:**

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

**Разверните с автономным коллектором:**

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
В пользовательской конфигурации определяйте только новые receivers, processors и pipelines. Базовые processors (`memory_limiter`, `batch`) и exporters (`clickhouse`) уже заданы — ссылайтесь на них по имени. Пользовательская конфигурация объединяется с базовой и не может переопределять существующие компоненты.
:::

Для более сложных конфигураций обратитесь к [базовой конфигурации коллектора ClickStack](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml) и [документации по экспортёру ClickHouse](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options).


#### Структура конфигурации \{#configuration-structure\}

Для получения подробной информации о настройке OTel collector, включая [`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/), [`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) и [`processors`](https://opentelemetry.io/docs/collector/configuration/#processors), мы рекомендуем ознакомиться с [официальной документацией OpenTelemetry collector](https://opentelemetry.io/docs/collector/configuration).