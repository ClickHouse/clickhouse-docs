import Image from '@theme/IdealImage';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import otel_collector_start from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import advanced_otel_collector from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Вам будет предложено выбрать источник ингестии. Управляемый ClickStack поддерживает ряд источников ингестии, включая OpenTelemetry и [Vector](https://vector.dev/), а также возможность отправлять данные напрямую в ClickHouse по вашей собственной схеме.

<Image img={select_source} size="md" alt="Выбор источника" border />

:::note[Рекомендуется OpenTelemetry]
Использование OpenTelemetry настоятельно рекомендуется в качестве формата ингестии данных.
Оно обеспечивает самый простой и оптимизированный опыт использования, с готовыми схемами, специально разработанными для эффективной работы с ClickStack.
:::

<Tabs groupId="ingestion-sources">
  <TabItem value="open-telemetry" label="OpenTelemetry" default>
    Для отправки данных OpenTelemetry в управляемый ClickStack рекомендуется использовать OpenTelemetry Collector. Коллектор действует как шлюз, принимающий данные OpenTelemetry от ваших приложений (и других коллекторов) и передающий их в ClickHouse Cloud.

    Если у вас еще не запущен коллектор, запустите его, выполнив приведенные ниже шаги. Если у вас уже есть работающие коллекторы, также предоставлен пример конфигурации.

    ### Запустите коллектор \{#start-a-collector\}

    Далее предполагается рекомендуемый подход с использованием **дистрибутива OpenTelemetry Collector от ClickStack**, который включает дополнительную обработку и оптимизирован специально для ClickHouse Cloud. Если вы планируете использовать собственный OpenTelemetry Collector, см. раздел [&quot;Настройка существующих коллекторов&quot;](#configure-existing-collectors)

    Чтобы быстро начать работу, скопируйте и выполните показанную команду Docker.

    <Image img={otel_collector_start} size="md" alt="Источник данных OTel collector" border />

    Эта команда должна содержать предварительно заполненные учетные данные для подключения `CLICKHOUSE_ENDPOINT` и `CLICKHOUSE_PASSWORD`.

    :::note[Развертывание в production]
    Хотя эта команда использует пользователя `default` для подключения к Managed ClickStack, при [переходе в production](/use-cases/observability/clickstack/production#create-a-user) следует создать отдельного пользователя и изменить конфигурацию.
    :::

    Выполнение этой команды запускает коллектор ClickStack с конечными точками OTLP, доступными на портах 4317 (gRPC) и 4318 (HTTP). Если у вас уже настроены инструментация и агенты OpenTelemetry, вы можете сразу начать отправку телеметрических данных на эти конечные точки.

    ### Настройте существующие коллекторы \{#configure-existing-collectors\}

    Также можно настроить собственные существующие коллекторы OpenTelemetry или использовать собственный дистрибутив коллектора.

    :::note[Требуется экспортер ClickHouse]
    Если вы используете собственный дистрибутив, например [contrib-образ](https://github.com/open-telemetry/opentelemetry-collector-contrib), убедитесь, что он включает [экспортер ClickHouse](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).
    :::

    Для этого предоставлен пример конфигурации OpenTelemetry Collector, использующий экспортер ClickHouse с соответствующими настройками и предоставляющий OTLP-приемники. Данная конфигурация соответствует интерфейсам и поведению, ожидаемым дистрибутивом ClickStack.

    Пример этой конфигурации приведён ниже (переменные окружения будут предзаполнены при копировании из UI):

    ```yaml file=docs/use-cases/observability/clickstack/deployment/_snippets/otel-cloud-config.yaml
    receivers:
      otlp/hyperdx:
        protocols:
          grpc:
            include_metadata: true
            endpoint: '0.0.0.0:4317'
          http:
            cors:
              allowed_origins: ['*']
              allowed_headers: ['*']
            include_metadata: true
            endpoint: '0.0.0.0:4318'
    processors:
      transform:
        log_statements:
          - context: log
            error_mode: ignore
            statements:
              # JSON parsing: Extends log attributes with the fields from structured log body content, either as an OTEL map or
              # as a string containing JSON content.
              - set(log.cache, ExtractPatterns(log.body, "(?P<0>(\\{.*\\}))")) where
                IsString(log.body)
              - merge_maps(log.attributes, ParseJSON(log.cache["0"]), "upsert")
                where IsMap(log.cache)
              - flatten(log.attributes) where IsMap(log.cache)
              - merge_maps(log.attributes, log.body, "upsert") where IsMap(log.body)
          - context: log
            error_mode: ignore
            conditions:
              - severity_number == 0 and severity_text == ""
            statements:
              # Infer: extract the first log level keyword from the first 256 characters of the body
              - set(log.cache["substr"], log.body.string) where Len(log.body.string)
                < 256
              - set(log.cache["substr"], Substring(log.body.string, 0, 256)) where
                Len(log.body.string) >= 256
              - set(log.cache, ExtractPatterns(log.cache["substr"],
                "(?i)(?P<0>(alert|crit|emerg|fatal|error|err|warn|notice|debug|dbug|trace))"))
              # Infer: detect FATAL
              - set(log.severity_number, SEVERITY_NUMBER_FATAL) where
                IsMatch(log.cache["0"], "(?i)(alert|crit|emerg|fatal)")
              - set(log.severity_text, "fatal") where log.severity_number ==
                SEVERITY_NUMBER_FATAL
              # Infer: detect ERROR
              - set(log.severity_number, SEVERITY_NUMBER_ERROR) where
                IsMatch(log.cache["0"], "(?i)(error|err)")
              - set(log.severity_text, "error") where log.severity_number ==
                SEVERITY_NUMBER_ERROR
              # Infer: detect WARN
              - set(log.severity_number, SEVERITY_NUMBER_WARN) where
                IsMatch(log.cache["0"], "(?i)(warn|notice)")
              - set(log.severity_text, "warn") where log.severity_number ==
                SEVERITY_NUMBER_WARN
              # Infer: detect DEBUG
              - set(log.severity_number, SEVERITY_NUMBER_DEBUG) where
                IsMatch(log.cache["0"], "(?i)(debug|dbug)")
              - set(log.severity_text, "debug") where log.severity_number ==
                SEVERITY_NUMBER_DEBUG
              # Infer: detect TRACE
              - set(log.severity_number, SEVERITY_NUMBER_TRACE) where
                IsMatch(log.cache["0"], "(?i)(trace)")
              - set(log.severity_text, "trace") where log.severity_number ==
                SEVERITY_NUMBER_TRACE
              # Infer: else
              - set(log.severity_text, "info") where log.severity_number == 0
              - set(log.severity_number, SEVERITY_NUMBER_INFO) where log.severity_number == 0
          - context: log
            error_mode: ignore
            statements:
              # Normalize the severity_text case
              - set(log.severity_text, ConvertCase(log.severity_text, "lower"))
      resourcedetection:
        detectors:
          - env
          - system
          - docker
        timeout: 5s
        override: false
      batch:
      memory_limiter:
        # 80% of maximum memory up to 2G, adjust for low memory environments
        limit_mib: 1500
        # 25% of limit up to 2G, adjust for low memory environments
        spike_limit_mib: 512
        check_interval: 5s
    connectors:
      routing/logs:
        default_pipelines: [logs/out-default]
        error_mode: ignore
        table:
          - context: log
            statement: route() where IsMatch(attributes["rr-web.event"], ".*")
            pipelines: [logs/out-rrweb]
    exporters:
      debug:
        verbosity: detailed
        sampling_initial: 5
        sampling_thereafter: 200
      clickhouse/rrweb:
        database: ${env:CLICKHOUSE_DATABASE}
        endpoint: ${env:CLICKHOUSE_ENDPOINT}
        password: ${env:CLICKHOUSE_PASSWORD}
        username: ${env:CLICKHOUSE_USER}
        ttl: 720h
        logs_table_name: hyperdx_sessions
        timeout: 5s
        retry_on_failure:
          enabled: true
          initial_interval: 5s
          max_interval: 30s
          max_elapsed_time: 300s
      clickhouse:
        database: ${env:CLICKHOUSE_DATABASE}
        endpoint: ${env:CLICKHOUSE_ENDPOINT}
        password: ${env:CLICKHOUSE_PASSWORD}
        username: ${env:CLICKHOUSE_USER}
        ttl: 720h
        timeout: 5s
        retry_on_failure:
          enabled: true
          initial_interval: 5s
          max_interval: 30s
          max_elapsed_time: 300s
    extensions:
      health_check:
        endpoint: :13133
    service:
      pipelines:
        traces:
          receivers: [otlp/hyperdx]
          processors: [memory_limiter, batch]
          exporters: [clickhouse]
        metrics:
          receivers: [otlp/hyperdx]
          processors: [memory_limiter, batch]
          exporters: [clickhouse]
        logs/in:
          receivers: [otlp/hyperdx]
          exporters: [routing/logs]
        logs/out-default:
          receivers: [routing/logs]
          processors: [memory_limiter, transform, batch]
          exporters: [clickhouse]
        logs/out-rrweb:
          receivers: [routing/logs]
          processors: [memory_limiter, batch]
          exporters: [clickhouse/rrweb]

    ```

    <Image img={advanced_otel_collector} size="md" alt="Расширенный источник данных для OTel collector" border />

    For further details on configuring OpenTelemetry collectors, see [&quot;Ingesting with OpenTelemetry.&quot;](/use-cases/observability/clickstack/ingesting-data/opentelemetry)
  </TabItem>

  <TabItem value="вектор" label="Vector" default>
    Скоро
  </TabItem>

  <TabItem value="другое" label="Прочее" default>
    Скоро
  </TabItem>
</Tabs>