---
slug: /use-cases/observability/clickstack/ingesting-data/otel-collector
pagination_prev: null
pagination_next: null
description: 'Коллектор OpenTelemetry для ClickStack — стек наблюдаемости ClickHouse'
sidebar_label: 'Коллектор OpenTelemetry'
title: 'Коллектор OpenTelemetry ClickStack'
doc_type: 'guide'
keywords: ['ClickStack', 'коллектор OpenTelemetry', 'наблюдаемость ClickHouse', 'конфигурация коллектора OTel', 'OpenTelemetry для ClickHouse']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import clickstack_with_gateways from '@site/static/images/use-cases/observability/clickstack-with-gateways.png';
import clickstack_with_kafka from '@site/static/images/use-cases/observability/clickstack-with-kafka.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

На этой странице представлена подробная информация по настройке официального коллектора OpenTelemetry (OTel) для ClickStack.

## Роли коллектора {#collector-roles}

Коллекторы OpenTelemetry могут быть развернуты в двух основных ролях:

- **Agent** — экземпляры Agent собирают данные на периферии, например на серверах или узлах Kubernetes, либо принимают события непосредственно от приложений, инструментированных с помощью OpenTelemetry SDK. В последнем случае экземпляр Agent запускается вместе с приложением или на том же хосте, что и приложение (например, как sidecar или ДемонСет). Экземпляры Agent могут либо отправлять свои данные напрямую в ClickHouse, либо в экземпляр Gateway. В первом случае это называется [паттерн развертывания Agent](https://opentelemetry.io/docs/collector/deployment/agent/). 

- **Gateway** — экземпляры Gateway предоставляют автономный сервис (например, Развертывание в Kubernetes), как правило, на кластер, дата-центр или регион. Они принимают события от приложений (или других коллекторов, работающих как Agents) через единую OTLP-конечную точку. Обычно разворачивается группа экземпляров Gateway, при этом готовый балансировщик нагрузки используется для распределения нагрузки между ними. Если все Agents и приложения отправляют свои сигналы на эту единую конечную точку, это часто называют [паттерн развертывания Gateway](https://opentelemetry.io/docs/collector/deployment/gateway/). 

**Важно: Коллектор, включая вариант по умолчанию в поставке ClickStack, предполагает [роль Gateway, описанную ниже](#collector-roles), получая данные от Agents или SDK.**

Пользователи, развертывающие OTel collector в роли Agent, обычно используют [стандартную contrib-сборку коллектора](https://github.com/open-telemetry/opentelemetry-collector-contrib), а не версию ClickStack, но могут свободно применять и другие технологии, совместимые с OTLP, такие как [Fluentd](https://www.fluentd.org/) и [Vector](https://vector.dev/).

## Развертывание коллектора {#configuring-the-collector}

Если вы управляете собственным коллектором OpenTelemetry в автономном развертывании — например, при использовании дистрибутива HyperDX-only, — мы [по‑прежнему рекомендуем использовать официальный дистрибутив коллектора ClickStack](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector) в роли шлюза, где это возможно, но если вы решите использовать собственный вариант, убедитесь, что он включает [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).

### Автономный режим {#standalone}

Чтобы развернуть дистрибутив коннектора OTel ClickStack в автономном режиме, выполните следующую docker-команду:

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```

Обратите внимание, что мы можем переопределить целевой экземпляр ClickHouse с помощью переменных среды `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USERNAME` и `CLICKHOUSE_PASSWORD`. Значение `CLICKHOUSE_ENDPOINT` должно быть полным HTTP‑эндпоинтом ClickHouse, включая протокол и порт — например, `http://localhost:8123`.

**Эти переменные среды можно использовать с любыми docker-дистрибутивами, которые включают коннектор.**

`OPAMP_SERVER_URL` должен указывать на ваше развертывание HyperDX — например, `http://localhost:4320`. HyperDX по умолчанию поднимает сервер OpAMP (Open Agent Management Protocol) по пути `/v1/opamp` на порту `4320`. Убедитесь, что этот порт проброшен из контейнера, в котором запущен HyperDX (например, с помощью `-p 4320:4320`).

:::note Exposing and connecting to the OpAMP port
Чтобы коллектор смог подключиться к порту OpAMP, он должен быть проброшен из контейнера HyperDX, например `-p 4320:4320`. Для локального тестирования пользователи macOS могут задать `OPAMP_SERVER_URL=http://host.docker.internal:4320`. Пользователи Linux могут запускать контейнер коллектора с параметром `--network=host`.
:::

В production-среде пользователям следует использовать пользователя с [соответствующими учётными данными](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user).


### Изменение конфигурации {#modifying-otel-collector-configuration}

#### Использование Docker {#using-docker}

Все образы Docker, включающие OpenTelemetry collector, можно настроить для работы с экземпляром ClickHouse через переменные окружения `OPAMP_SERVER_URL`, `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USERNAME` и `CLICKHOUSE_PASSWORD`:

Например, универсальный (all-in-one) образ:

```shell
export OPAMP_SERVER_URL=<OPAMP_SERVER_URL>
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

:::note Изменение имени образа
Образы ClickStack теперь публикуются под именем `clickhouse/clickstack-*` (ранее `docker.hyperdx.io/hyperdx/*`).
:::


#### Docker Compose {#docker-compose-otel}

В Docker Compose измените конфигурацию коллектора, используя те же переменные окружения, что и выше:

```yaml
  otel-collector:
    image: hyperdx/hyperdx-otel-collector
    environment:
      CLICKHOUSE_ENDPOINT: 'https://mxl4k3ul6a.us-east-2.aws.clickhouse-staging.com:8443'
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      CLICKHOUSE_USER: 'default'
      CLICKHOUSE_PASSWORD: 'password'
      OPAMP_SERVER_URL: 'http://app:${HYPERDX_OPAMP_PORT}'
    ports:
      - '13133:13133' # health_check extension
      - '24225:24225' # fluentd receiver
      - '4317:4317' # OTLP gRPC receiver
      - '4318:4318' # OTLP http receiver
      - '8888:8888' # metrics extension
    restart: always
    networks:
      - internal
```

### Расширенная конфигурация {#advanced-configuration}

Дистрибутив OTel collector в составе ClickStack поддерживает расширение базовой конфигурации за счёт монтирования пользовательского конфигурационного файла и задания переменной окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, управляемой HyperDX через OpAMP.

#### Расширение конфигурации коллектора {#extending-collector-config}

Чтобы добавить пользовательские приёмники (receivers), процессоры (processors) или конвейеры (pipelines):

1. Создайте пользовательский файл конфигурации с вашей дополнительной конфигурацией
2. Смонтируйте файл по пути `/etc/otelcol-contrib/custom.config.yaml`
3. Установите переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`

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

**Развертывание с использованием образа all-in-one:**

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  clickhouse/clickstack-all-in-one:latest
```

**Развертывание с автономным коллектором:**

```bash
docker run -d \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-otel-collector:latest
```

:::note
В пользовательской конфигурации вы определяете только новые `receivers`, `processors` и `pipelines`. Базовые `processors` (`memory_limiter`, `batch`) и `exporters` (`clickhouse`) уже определены — ссылайтесь на них по имени. Пользовательская конфигурация объединяется с базовой и не может переопределять уже существующие компоненты.
:::

Для более сложных конфигураций обратитесь к [конфигурации коллектора ClickStack по умолчанию](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml) и к [документации по экспортеру ClickHouse](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options).


#### Структура конфигурации {#configuration-structure}

Подробную информацию о настройке OTel collector, включая [`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/), [`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) и [`processors`](https://opentelemetry.io/docs/collector/configuration/#processors), см. в [официальной документации по OpenTelemetry collector](https://opentelemetry.io/docs/collector/configuration).

## Обеспечение безопасности коллектора {#securing-the-collector}

Дистрибутив ClickStack с коллектором OpenTelemetry включает встроенную поддержку OpAMP (Open Agent Management Protocol), который используется для безопасной конфигурации и управления конечной точкой OTLP. При запуске пользователям необходимо указать переменную окружения `OPAMP_SERVER_URL` — она должна указывать на приложение HyperDX, которое предоставляет OpAMP API по адресу `/v1/opamp`.

Эта интеграция гарантирует, что конечная точка OTLP защищена с помощью автоматически сгенерированного ключа API для приёма данных (ingestion API key), создаваемого при развертывании приложения HyperDX. Все телеметрические данные, отправляемые в коллектор, должны включать этот API key для аутентификации. Найти ключ можно в приложении HyperDX в разделе `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ключи приёма данных" size="lg"/>

Для дополнительной защиты вашего развертывания мы рекомендуем:

- Настроить коллектор на взаимодействие с ClickHouse по HTTPS.
- Создать отдельного пользователя для приёма данных с ограниченными правами — см. ниже.
- Включить TLS для конечной точки OTLP, обеспечив шифрованное взаимодействие между SDKs/агентами и коллектором. Это можно настроить через [пользовательскую конфигурацию коллектора](#extending-collector-config).

### Создание пользователя для ингестии {#creating-an-ingestion-user}

Мы рекомендуем создать отдельную базу данных и пользователя для коллектора OTel для ингестии данных в ClickHouse. У этого пользователя должны быть права на создание и вставку данных в [таблицы, созданные и используемые ClickStack](/use-cases/observability/clickstack/ingesting-data/schemas).

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

Предполагается, что коллектор настроен на использование базы данных `otel`. Этим можно управлять через переменную окружения `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`. Передайте её в образ контейнера с коллектором [аналогично другим переменным окружения](#modifying-otel-collector-configuration).

## Обработка — фильтрация, трансформация и обогащение {#processing-filtering-transforming-enriching}

Пользователям в большинстве случаев потребуется фильтровать, трансформировать и обогащать сообщения событий во время ингестии. Поскольку конфигурацию коннектора ClickStack нельзя изменить, мы рекомендуем пользователям, которым требуется дополнительная фильтрация и обработка событий, либо:

- Развернуть собственную версию OTel collector, выполняющего фильтрацию и обработку, отправляя события в ClickStack collector по OTLP для ингестии в ClickHouse.
- Развернуть собственную версию OTel collector и отправлять события напрямую в ClickHouse с использованием ClickHouse exporter.

Если обработка выполняется с использованием OTel collector, мы рекомендуем выполнять трансформации на экземплярах gateway и минимизировать объём работ, выполняемых на экземплярах agent. Это позволит свести к минимуму потребление ресурсов агентами на периферии, работающими на серверах. Как правило, мы видим, что пользователи выполняют только фильтрацию (для минимизации ненужного сетевого трафика), установку временных меток (через операторы) и обогащение, которое требует контекста в агентах. Например, если экземпляры gateway находятся в другом Kubernetes‑кластере, k8s‑обогащение должно выполняться в агенте.

OpenTelemetry поддерживает следующие возможности обработки и фильтрации, которыми могут пользоваться пользователи:

- **Processors** — processors принимают данные, собранные [receivers, и модифицируют или трансформируют их](https://opentelemetry.io/docs/collector/transforming-telemetry/) перед отправкой в exporters. Processors применяются в порядке, указанном в секции `processors` конфигурации collector. Они необязательны, но минимальный набор [обычно рекомендуется](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). При использовании OTel collector с ClickHouse мы рекомендуем ограничиться следующими processors:

- [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) используется для предотвращения ситуаций с нехваткой памяти на collector. См. рекомендации в разделе [Estimating Resources](#estimating-resources).
- Любой processor, который выполняет обогащение на основе контекста. Например, [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) позволяет автоматически устанавливать resource‑атрибуты spans, metrics и logs с k8s‑метаданными, например обогащать события идентификатором исходного пода.
- [Tail или head sampling](https://opentelemetry.io/docs/concepts/sampling/), если это требуется для трейсов.
- [Базовая фильтрация](https://opentelemetry.io/docs/collector/transforming-telemetry/) — отбрасывание ненужных событий, если это нельзя сделать через operator (см. ниже).
- [Batching](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) — критически важно при работе с ClickHouse, чтобы данные отправлялись пакетами. См. ["Optimizing inserts"](#optimizing-inserts).

- **Operators** — [operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) предоставляют самый базовый уровень обработки, доступный на стороне receiver. Поддерживается базовый парсинг, позволяющий устанавливать такие поля, как Severity и Timestamp. Здесь поддерживаются JSON‑ и regex‑парсинг, а также фильтрация событий и базовые трансформации. Мы рекомендуем выполнять фильтрацию событий на этом уровне.

Мы рекомендуем пользователям избегать чрезмерной обработки событий с использованием operators или [transform processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md). Они могут приводить к значительным накладным расходам по памяти и CPU, особенно при JSON‑парсинге. Возможно выполнять всю обработку в ClickHouse на этапе вставки с помощью материализованных представлений и столбцов с некоторыми исключениями — в частности, для контекстно‑зависимого обогащения, например добавления k8s‑метаданных. Для более подробной информации см. [Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql).

### Пример {#example-processing}

Следующая конфигурация демонстрирует сбор данных из этого [неструктурированного файла логов](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz). Эту конфигурацию может использовать коллектор в роли агента, отправляющий данные на шлюз ClickStack.

Обратите внимание на использование операторов для извлечения структуры из строк логов (`regex_parser`) и фильтрации событий, а также процессора для пакетирования событий и ограничения потребления памяти.

```yaml file=code_snippets/ClickStack/config-unstructured-logs-with-processor.yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-unstructured.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P<ip>[\d.]+)\s+-\s+-\s+\[(?P<timestamp>[^\]]+)\]\s+"(?P<method>[A-Z]+)\s+(?P<url>[^\s]+)\s+HTTP/[^\s]+"\s+(?P<status>\d+)\s+(?P<size>\d+)\s+"(?P<referrer>[^"]*)"\s+"(?P<user_agent>[^"]*)"'
        timestamp:
          parse_from: attributes.timestamp
          layout: '%d/%b/%Y:%H:%M:%S %z'
          #22/Jan/2019:03:56:14 +0330
processors:
  batch:
    timeout: 1s
    send_batch_size: 100
  memory_limiter:
    check_interval: 1s
    limit_mib: 2048
    spike_limit_mib: 256
exporters:
  # Настройка HTTP
  otlphttp/hdx:
    endpoint: 'http://localhost:4318'
    headers:
      authorization: <ВАШ_КЛЮЧ_API_ПРИЁМА>
    compression: gzip

  # Настройка gRPC (альтернативный вариант)
  otlp/hdx:
    endpoint: 'localhost:4317'
    headers:
      authorization: <ВАШ_КЛЮЧ_API_ПРИЁМА>
    compression: gzip
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Изменено, поскольку на одном хосте работают 2 коллектора
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]

```

Note the need to include an [authorization header containing your ingestion API key](#securing-the-collector) in any OTLP communication.

For more advanced configuration, we suggest the [OpenTelemetry collector documentation](https://opentelemetry.io/docs/collector/).

## Optimizing inserts {#optimizing-inserts}

In order to achieve high insert performance while obtaining strong consistency guarantees, users should adhere to simple rules when inserting Observability data into ClickHouse via the ClickStack collector. With the correct configuration of the OTel collector, the following rules should be straightforward to follow. This also avoids [common issues](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse) users encounter when using ClickHouse for the first time.

### Batching {#batching}

By default, each insert sent to ClickHouse causes ClickHouse to immediately create a part of storage containing the data from the insert together with other metadata that needs to be stored. Therefore sending a smaller amount of inserts that each contain more data, compared to sending a larger amount of inserts that each contain less data, will reduce the number of writes required. We recommend inserting data in fairly large batches of at least 1,000 rows at a time. Further details [here](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

By default, inserts into ClickHouse are synchronous and idempotent if identical. For tables of the merge tree engine family, ClickHouse will, by default, automatically [deduplicate inserts](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). This means inserts are tolerant in cases like the following:

- (1) If the node receiving the data has issues, the insert query will time out (or get a more specific error) and not receive an acknowledgment.
- (2) If the data got written by the node, but the acknowledgement can't be returned to the sender of the query because of network interruptions, the sender will either get a timeout or a network error.

From the collector's perspective, (1) and (2) can be hard to distinguish. However, in both cases, the unacknowledged insert can just be retried immediately. As long as the retried insert query contains the same data in the same order, ClickHouse will automatically ignore the retried insert if the original (unacknowledged) insert succeeded.

For this reason, the ClickStack distribution of the OTel collector uses the [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md). This ensures inserts are sent as consistent batches of rows satisfying the above requirements. If a collector is expected to have high throughput (events per second), and at least 5000 events can be sent in each insert, this is usually the only batching required in the pipeline. In this case the collector will flush batches before the batch processor's `timeout` is reached, ensuring the end-to-end latency of the pipeline remains low and batches are of a consistent size.

### Use asynchronous inserts {#use-asynchronous-inserts}

Typically, users are forced to send smaller batches when the throughput of a collector is low, and yet they still expect data to reach ClickHouse within a minimum end-to-end latency. In this case, small batches are sent when the `timeout` of the batch processor expires. This can cause problems and is when asynchronous inserts are required. This issue is rare if users are sending data to the ClickStack collector acting as a Gateway - by acting as aggregators, they alleviate this problem - see [Collector roles](#collector-roles).

If large batches cannot be guaranteed, users can delegate batching to ClickHouse using [Asynchronous Inserts](/best-practices/selecting-an-insert-strategy#asynchronous-inserts). With asynchronous inserts, data is inserted into a buffer first and then written to the database storage later or asynchronously respectively.

<Image img={observability_6} alt="Async inserts" size="md"/>

With [asynchronous inserts enabled](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), when ClickHouse ① receives an insert query, the query's data is ② immediately written into an in-memory buffer first. When ③ the next buffer flush takes place, the buffer's data is [sorted](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) and written as a part to the database storage. Note, that the data is not searchable by queries before being flushed to the database storage; the buffer flush is [configurable](/optimize/asynchronous-inserts).

To enable asynchronous inserts for the collector, add `async_insert=1` to the connection string. We recommend users use `wait_for_async_insert=1` (the default) to get delivery guarantees - see [here](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) for further details.

Data from an async insert is inserted once the ClickHouse buffer is flushed. This occurs either after the [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) is exceeded or after [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) milliseconds since the first INSERT query. If the `async_insert_stale_timeout_ms` is set to a non-zero value, the data is inserted after `async_insert_stale_timeout_ms milliseconds` since the last query. Users can tune these settings to control the end-to-end latency of their pipeline. Further settings that can be used to tune buffer flushing are documented [here](/operations/settings/settings#async_insert). Generally, defaults are appropriate.

:::note Consider Adaptive Asynchronous Inserts
In cases where a low number of agents are in use, with low throughput but strict end-to-end latency requirements, [adaptive asynchronous inserts](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) may be useful. Generally, these are not applicable to high throughput Observability use cases, as seen with ClickHouse.
:::

Finally, the previous deduplication behavior associated with synchronous inserts into ClickHouse is not enabled by default when using asynchronous inserts. If required, see the setting [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Full details on configuring this feature can be found on this [docs page](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), or with a deep dive [blog post](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).

## Scaling {#scaling}

The ClickStack OTel collector acts a Gateway instance - see [Collector roles](#collector-roles). These provide a standalone service, typically per data center or per region. These receive events from applications (or other collectors in the agent role) via a single OTLP endpoint. Typically a set of collector instances are deployed, with an out-of-the-box load balancer used to distribute the load amongst them.

<Image img={clickstack_with_gateways} alt="Scaling with gateways" size="lg"/>

The objective of this architecture is to offload computationally intensive processing from the agents, thereby minimizing their resource usage. These ClickStack gateways can perform transformation tasks that would otherwise need to be done by agents. Furthermore, by aggregating events from many agents, the gateways can ensure large batches are sent to ClickHouse - allowing efficient insertion. These gateway collectors can easily be scaled as more agents and SDK sources are added and event throughput increases. 

### Adding Kafka {#adding-kafka}

Readers may notice the above architectures do not use Kafka as a message queue.

Using a Kafka queue as a message buffer is a popular design pattern seen in logging architectures and was popularized by the ELK stack. It provides a few benefits: principally, it helps provide stronger message delivery guarantees and helps deal with backpressure. Messages are sent from collection agents to Kafka and written to disk. In theory, a clustered Kafka instance should provide a high throughput message buffer since it incurs less computational overhead to write data linearly to disk than parse and process a message. In Elastic, for example, tokenization and indexing incurs significant overhead. By moving data away from the agents, you also incur less risk of losing messages as a result of log rotation at the source. Finally, it offers some message reply and cross-region replication capabilities, which might be attractive for some use cases.

However, ClickHouse can handle inserting data very quickly - millions of rows per second on moderate hardware. Backpressure from ClickHouse is rare. Often, leveraging a Kafka queue means more architectural complexity and cost. If you can embrace the principle that logs do not need the same delivery guarantees as bank transactions and other mission-critical data, we recommend avoiding the complexity of Kafka.

However, if you require high delivery guarantees or the ability to replay data (potentially to multiple sources), Kafka can be a useful architectural addition.

<Image img={observability_8} alt="Adding kafka" size="lg"/>

In this case, OTel agents can be configured to send data to Kafka via the [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). Gateway instances, in turn, consume messages using the [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). We recommend the Confluent and OTel documentation for further details.

:::note OTel collector configuration
The ClickStack OpenTelemetry collector distribution can be configured with Kafka using [custom collector configuration](#extending-collector-config).
:::

## Estimating resources {#estimating-resources}

Resource requirements for the OTel collector will depend on the event throughput, the size of messages and amount of processing performed. The OpenTelemetry project maintains [benchmarks users](https://opentelemetry.io/docs/collector/benchmarks/) can use to estimate resource requirements.

[In our experience](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), a ClickStack gateway instance with 3 cores and 12GB of RAM can handle around 60k events per second. This assumes a minimal processing pipeline responsible for renaming fields and no regular expressions.

For agent instances responsible for shipping events to a gateway, and only setting the timestamp on the event, we recommend users size based on the anticipated logs per second. The following represent approximate numbers users can use as a starting point:

| Logging rate | Resources to collector agent |
|--------------|------------------------------|
| 1k/second    | 0.2CPU, 0.2GiB              |
| 5k/second    | 0.5 CPU, 0.5GiB             |
| 10k/second   | 1 CPU, 1GiB                 |

## JSON support {#json-support}

<BetaBadge/>

:::warning Beta Feature
JSON type support in **ClickStack** is a **beta feature**. While the JSON type itself is production-ready in ClickHouse 25.3+, its integration within ClickStack is still under active development and may have limitations, change in the future, or contain bugs
:::

ClickStack has beta support for the [JSON type](/interfaces/formats/JSON) from version `2.0.4`.

### Benefits of the JSON type {#benefits-json-type}

The JSON type offers the following benefits to ClickStack users:

- **Type preservation** - Numbers stay numbers, booleans stay booleans—no more flattening everything into strings. This means fewer casts, simpler queries, and more accurate aggregations.
- **Path-level columns** - Each JSON path becomes its own sub-column, reducing I/O. Queries only read the fields they need, unlocking major performance gains over the old Map type which required the entire column to be read in order to query a specific field.
- **Deep nesting just works** - Naturally handle complex, deeply nested structures without manual flattening (as required by the Map type) and subsequent awkward JSONExtract functions.
- **Dynamic, evolving schemas** - Perfect for observability data where teams add new tags and attributes over time. JSON handles these changes automatically, without schema migrations. 
- **Faster queries, lower memory** - Typical aggregations over attributes like `LogAttributes` see 5-10x less data read and dramatic speedups, cutting both query time and peak memory usage.
- **Simple management** - No need to pre-materialize columns for performance. Each field becomes its own sub-column, delivering the same speed as native ClickHouse columns.

### Enabling JSON support {#enabling-json-support}

To enable this support for the collector, set the environment variable `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` on any deployment that includes the collector. This ensures the schemas are created in ClickHouse using the JSON type.

:::note HyperDX support
In order to query the JSON type, support must also be enabled in the HyperDX application layer via the environment variable `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`.
:::

For example:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```

### Migrating from map-based schemas to the JSON type {#migrating-from-map-based-schemas-to-json}

:::important Backwards compatibility
The [JSON type](/interfaces/formats/JSON) is **not backwards compatible** with existing map-based schemas. Enabling this feature will create new tables using the `JSON` type and requires manual data migration.
:::

To migrate from the Map-based schemas, follow these steps:

<VerticalStepper headerLevel="h4">

#### Stop the OTel collector {#stop-the-collector}

#### Rename existing tables and update sources {#rename-existing-tables-sources}

Rename existing tables and update data sources in HyperDX. 

For example:

```sql
RENAME TABLE otel_logs TO otel_logs_map;
RENAME TABLE otel_metrics TO otel_metrics_map;
```

#### Deploy the collector  {#deploy-the-collector}

Deploy the collector with `OTEL_AGENT_FEATURE_GATE_ARG` set.

#### Restart the HyperDX container with JSON schema support {#restart-the-hyperdx-container}

```shell
export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
```

#### Create new data sources {#create-new-data-sources}

Create new data sources in HyperDX pointing to the JSON tables.

</VerticalStepper>

#### Migrating existing data (optional) {#migrating-existing-data}

To move old data into the new JSON tables:

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
Рекомендуется только для наборов данных объемом менее ~10 миллиардов строк. Данные, ранее хранившиеся с типом Map, не сохраняли точность типов (все значения были строками). В результате эти старые данные будут отображаться как строки в новой схеме до тех пор, пока не будут вытеснены из хранения, что потребует дополнительного приведения типов на фронтенде. Тип для новых данных будет сохраняться при использовании типа JSON.
:::
