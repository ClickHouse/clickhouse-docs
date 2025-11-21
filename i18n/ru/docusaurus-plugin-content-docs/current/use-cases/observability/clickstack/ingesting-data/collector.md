---
slug: /use-cases/observability/clickstack/ingesting-data/otel-collector
pagination_prev: null
pagination_next: null
description: 'Коллектор OpenTelemetry для ClickStack — стек наблюдаемости ClickHouse'
sidebar_label: 'Коллектор OpenTelemetry'
title: 'ClickStack OpenTelemetry Collector'
doc_type: 'guide'
keywords: ['ClickStack', 'Коллектор OpenTelemetry', 'наблюдаемость ClickHouse', 'конфигурация коллектора OTel', 'OpenTelemetry ClickHouse']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import clickstack_with_gateways from '@site/static/images/use-cases/observability/clickstack-with-gateways.png';
import clickstack_with_kafka from '@site/static/images/use-cases/observability/clickstack-with-kafka.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

На этой странице приведены подробные сведения о настройке официального коллектора ClickStack OpenTelemetry (OTel).


## Роли коллектора {#collector-roles}

Коллекторы OpenTelemetry могут развертываться в двух основных ролях:

- **Агент** — экземпляры агентов собирают данные на периферии, например на серверах или узлах Kubernetes, либо получают события напрямую от приложений, инструментированных с помощью OpenTelemetry SDK. В последнем случае экземпляр агента работает вместе с приложением или на том же хосте (например, в виде sidecar или DaemonSet). Агенты могут отправлять данные либо напрямую в ClickHouse, либо на экземпляр шлюза. В первом случае это называется [шаблоном развертывания агента](https://opentelemetry.io/docs/collector/deployment/agent/).

- **Шлюз** — экземпляры шлюзов предоставляют автономный сервис (например, развертывание в Kubernetes), обычно на уровне кластера, центра обработки данных или региона. Они получают события от приложений (или других коллекторов в роли агентов) через единую конечную точку OTLP. Как правило, развертывается набор экземпляров шлюзов с готовым балансировщиком нагрузки для распределения нагрузки между ними. Если все агенты и приложения отправляют свои сигналы на эту единую конечную точку, это часто называется [шаблоном развертывания шлюза](https://opentelemetry.io/docs/collector/deployment/gateway/).

**Важно: коллектор, в том числе в дистрибутивах ClickStack по умолчанию, выполняет [роль шлюза, описанную ниже](#collector-roles), получая данные от агентов или SDK.**

Пользователи, развертывающие коллекторы OTel в роли агента, обычно используют [дистрибутив collector contrib по умолчанию](https://github.com/open-telemetry/opentelemetry-collector-contrib), а не версию ClickStack, но могут свободно использовать другие технологии, совместимые с OTLP, такие как [Fluentd](https://www.fluentd.org/) и [Vector](https://vector.dev/).


## Развертывание коллектора {#configuring-the-collector}

Если вы управляете собственным коллектором OpenTelemetry в автономном развертывании — например, при использовании дистрибутива только для HyperDX — мы [рекомендуем по возможности использовать официальный дистрибутив коллектора ClickStack](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector) для роли шлюза, но если вы решите использовать собственный коллектор, убедитесь, что он включает [экспортер ClickHouse](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).

### Автономный режим {#standalone}

Чтобы развернуть дистрибутив ClickStack коннектора OTel в автономном режиме, выполните следующую команду docker:

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

Обратите внимание, что целевой экземпляр ClickHouse можно переопределить с помощью переменных окружения `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USERNAME` и `CLICKHOUSE_PASSWORD`. Переменная `CLICKHOUSE_ENDPOINT` должна содержать полный HTTP-эндпоинт ClickHouse, включая протокол и порт — например, `http://localhost:8123`.

**Эти переменные окружения можно использовать с любыми дистрибутивами docker, которые включают коннектор.**

Переменная `OPAMP_SERVER_URL` должна указывать на ваше развертывание HyperDX — например, `http://localhost:4320`. HyperDX по умолчанию предоставляет сервер OpAMP (Open Agent Management Protocol) по адресу `/v1/opamp` на порту `4320`. Убедитесь, что этот порт открыт из контейнера, в котором работает HyperDX (например, с помощью `-p 4320:4320`).

:::note Открытие и подключение к порту OpAMP
Чтобы коллектор мог подключиться к порту OpAMP, он должен быть открыт контейнером HyperDX, например `-p 4320:4320`. Для локального тестирования пользователи macOS могут установить `OPAMP_SERVER_URL=http://host.docker.internal:4320`. Пользователи Linux могут запустить контейнер коллектора с параметром `--network=host`.
:::

В производственной среде следует использовать пользователя с [соответствующими учетными данными](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user).

### Изменение конфигурации {#modifying-otel-collector-configuration}

#### Использование docker {#using-docker}

Все образы docker, которые включают коллектор OpenTelemetry, можно настроить для использования экземпляра ClickHouse с помощью переменных окружения `OPAMP_SERVER_URL`, `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USERNAME` и `CLICKHOUSE_PASSWORD`:

Например, универсальный образ:

```shell
export OPAMP_SERVER_URL=<OPAMP_SERVER_URL>
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

#### Docker Compose {#docker-compose-otel}

При использовании Docker Compose измените конфигурацию коллектора, используя те же переменные окружения, что и выше:

```yaml
otel-collector:
  image: hyperdx/hyperdx-otel-collector
  environment:
    CLICKHOUSE_ENDPOINT: "https://mxl4k3ul6a.us-east-2.aws.clickhouse-staging.com:8443"
    HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
    CLICKHOUSE_USER: "default"
    CLICKHOUSE_PASSWORD: "password"
    OPAMP_SERVER_URL: "http://app:${HYPERDX_OPAMP_PORT}"
  ports:
    - "13133:13133" # health_check extension
    - "24225:24225" # fluentd receiver
    - "4317:4317" # OTLP gRPC receiver
    - "4318:4318" # OTLP http receiver
    - "8888:8888" # metrics extension
  restart: always
  networks:
    - internal
```

### Расширенная конфигурация {#advanced-configuration}

Дистрибутив ClickStack коллектора OTel поддерживает расширение базовой конфигурации путем монтирования пользовательского файла конфигурации и установки переменной окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, управляемой HyperDX через OpAMP.


#### Расширение конфигурации коллектора {#extending-collector-config}

Чтобы добавить пользовательские приёмники, процессоры или конвейеры:

1. Создайте пользовательский файл конфигурации с дополнительными настройками
2. Смонтируйте файл по пути `/etc/otelcol-contrib/custom.config.yaml`
3. Установите переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`

**Пример пользовательской конфигурации:**

```yaml
receivers:
  # Сбор логов из локальных файлов
  filelog:
    include:
      - /var/log/**/*.log
      - /var/log/syslog
      - /var/log/messages
    start_at: beginning

  # Сбор метрик хост-системы
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
    # Конвейер логов
    logs/host:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse

    # Конвейер метрик
    metrics/hostmetrics:
      receivers: [hostmetrics]
      processors:
        - memory_limiter
        - batch
      exporters:
        - clickhouse
```

**Развёртывание с универсальным образом:**

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

**Развёртывание с автономным коллектором:**

```bash
docker run -d \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

:::note
В пользовательской конфигурации определяются только новые приёмники, процессоры и конвейеры. Базовые процессоры (`memory_limiter`, `batch`) и экспортёры (`clickhouse`) уже определены — ссылайтесь на них по имени. Пользовательская конфигурация объединяется с базовой и не может переопределять существующие компоненты.
:::

Для более сложных конфигураций обратитесь к [конфигурации коллектора ClickStack по умолчанию](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml) и [документации экспортёра ClickHouse](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options).

#### Структура конфигурации {#configuration-structure}

Подробную информацию о настройке коллекторов OTel, включая [`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/), [`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) и [`processors`](https://opentelemetry.io/docs/collector/configuration/#processors), см. в [официальной документации коллектора OpenTelemetry](https://opentelemetry.io/docs/collector/configuration).


## Обеспечение безопасности коллектора {#securing-the-collector}

Дистрибутив ClickStack коллектора OpenTelemetry включает встроенную поддержку OpAMP (Open Agent Management Protocol), который используется для безопасной настройки и управления конечной точкой OTLP. При запуске необходимо указать переменную окружения `OPAMP_SERVER_URL` — она должна указывать на приложение HyperDX, которое размещает OpAMP API по адресу `/v1/opamp`.

Эта интеграция обеспечивает защиту конечной точки OTLP с помощью автоматически сгенерированного ключа API для приёма данных, который создаётся при развёртывании приложения HyperDX. Все телеметрические данные, отправляемые в коллектор, должны включать этот ключ API для аутентификации. Ключ можно найти в приложении HyperDX в разделе `Team Settings → API Keys`.

<Image img={ingestion_key} alt='Ключи приёма данных' size='lg' />

Для дополнительной защиты развёртывания рекомендуется:

- Настроить коллектор для взаимодействия с ClickHouse по протоколу HTTPS.
- Создать выделенного пользователя для приёма данных с ограниченными правами — см. ниже.
- Включить TLS для конечной точки OTLP, обеспечивая шифрованное взаимодействие между SDK/агентами и коллектором. Это можно настроить через [пользовательскую конфигурацию коллектора](#extending-collector-config).

### Создание пользователя для приёма данных {#creating-an-ingestion-user}

Рекомендуется создать выделенную базу данных и пользователя для коллектора OTel для приёма данных в ClickHouse. Этот пользователь должен иметь возможность создавать и вставлять данные в [таблицы, создаваемые и используемые ClickStack](/use-cases/observability/clickstack/ingesting-data/schemas).

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

Предполагается, что коллектор настроен на использование базы данных `otel`. Это можно контролировать через переменную окружения `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`. Передайте её в образ, на котором размещён коллектор, [аналогично другим переменным окружения](#modifying-otel-collector-configuration).


## Обработка — фильтрация, преобразование и обогащение {#processing-filtering-transforming-enriching}

Пользователи неизбежно захотят фильтровать, преобразовывать и обогащать сообщения о событиях во время приёма данных. Поскольку конфигурация коннектора ClickStack не может быть изменена, мы рекомендуем пользователям, которым требуется дополнительная фильтрация и обработка событий, выбрать один из следующих вариантов:

- Развернуть собственную версию коллектора OTel, выполняющую фильтрацию и обработку, и отправлять события в коллектор ClickStack через OTLP для приёма в ClickHouse.
- Развернуть собственную версию коллектора OTel и отправлять события напрямую в ClickHouse с использованием экспортера ClickHouse.

Если обработка выполняется с использованием коллектора OTel, мы рекомендуем выполнять преобразования на экземплярах шлюза и минимизировать любую работу на экземплярах агента. Это обеспечит минимальные требования к ресурсам для агентов на периферии, работающих на серверах. Обычно пользователи выполняют только фильтрацию (для минимизации ненужного использования сети), установку временных меток (через операторы) и обогащение, которое требует контекста в агентах. Например, если экземпляры шлюза находятся в другом кластере Kubernetes, обогащение k8s должно происходить в агенте.

OpenTelemetry поддерживает следующие возможности обработки и фильтрации, которые могут использовать пользователи:

- **Процессоры** — процессоры принимают данные, собранные [приёмниками, и изменяют или преобразуют](https://opentelemetry.io/docs/collector/transforming-telemetry/) их перед отправкой экспортерам. Процессоры применяются в порядке, указанном в разделе `processors` конфигурации коллектора. Они являются необязательными, но минимальный набор [обычно рекомендуется](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). При использовании коллектора OTel с ClickHouse мы рекомендуем ограничиться следующими процессорами:

- [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) используется для предотвращения ситуаций нехватки памяти на коллекторе. См. рекомендации в разделе [Оценка ресурсов](#estimating-resources).
- Любой процессор, выполняющий обогащение на основе контекста. Например, [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) позволяет автоматически устанавливать атрибуты ресурсов для трассировок, метрик и логов с метаданными k8s, например обогащать события идентификатором исходного пода.
- [Выборка по хвосту или по началу](https://opentelemetry.io/docs/concepts/sampling/), если требуется для трассировок.
- [Базовая фильтрация](https://opentelemetry.io/docs/collector/transforming-telemetry/) — отбрасывание ненужных событий, если это невозможно сделать через оператор (см. ниже).
- [Пакетирование](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) — необходимо при работе с ClickHouse для обеспечения отправки данных пакетами. См. раздел [«Оптимизация вставок»](#optimizing-inserts).

- **Операторы** — [операторы](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) предоставляют базовую единицу обработки, доступную на уровне приёмника. Поддерживается базовый разбор, позволяющий устанавливать такие поля, как Severity и Timestamp. Здесь поддерживается разбор JSON и регулярных выражений, а также фильтрация событий и базовые преобразования. Мы рекомендуем выполнять фильтрацию событий на этом уровне.

Мы рекомендуем пользователям избегать избыточной обработки событий с использованием операторов или [процессоров преобразования](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md). Они могут создавать значительные накладные расходы по памяти и процессору, особенно при разборе JSON. Возможно выполнять всю обработку в ClickHouse во время вставки с помощью материализованных представлений и столбцов, за некоторыми исключениями — в частности, обогащение с учётом контекста, например добавление метаданных k8s. Для получения дополнительной информации см. раздел [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql).

### Пример {#example-processing}

Следующая конфигурация демонстрирует сбор данных из этого [неструктурированного файла логов](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz). Эта конфигурация может использоваться коллектором в роли агента, отправляющим данные в шлюз ClickStack.

Обратите внимание на использование операторов для извлечения структуры из строк логов (`regex_parser`) и фильтрации событий, а также процессора для пакетирования событий и ограничения использования памяти.


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
      authorization: <YOUR_INGESTION_API_KEY>
    compression: gzip

  # Настройка gRPC (альтернативный вариант)
  otlp/hdx:
    endpoint: 'localhost:4317'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
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

Обратите внимание на необходимость включить [заголовок авторизации с вашим ключом API для загрузки данных](#securing-the-collector) во все OTLP-взаимодействия.

Для более гибкой конфигурации мы рекомендуем ознакомиться с [документацией по OpenTelemetry Collector](https://opentelemetry.io/docs/collector/).


## Оптимизация вставок {#optimizing-inserts}

Для достижения высокой производительности вставок при обеспечении строгих гарантий согласованности пользователи должны следовать простым правилам при вставке данных Observability в ClickHouse через коллектор ClickStack. При правильной конфигурации коллектора OTel соблюдение этих правил не должно вызывать затруднений. Это также позволяет избежать [распространённых проблем](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse), с которыми сталкиваются пользователи при первом использовании ClickHouse.

### Пакетирование {#batching}

По умолчанию каждая вставка, отправленная в ClickHouse, приводит к немедленному созданию части хранилища, содержащей данные из вставки вместе с другими метаданными, которые необходимо сохранить. Поэтому отправка меньшего количества вставок, каждая из которых содержит больше данных, по сравнению с отправкой большего количества вставок, каждая из которых содержит меньше данных, сократит количество необходимых операций записи. Мы рекомендуем вставлять данные достаточно большими пакетами, содержащими не менее 1000 строк за раз. Дополнительные подробности [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

По умолчанию вставки в ClickHouse являются синхронными и идемпотентными при идентичности. Для таблиц семейства движков merge tree ClickHouse по умолчанию автоматически [дедуплицирует вставки](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). Это означает, что вставки устойчивы к следующим ситуациям:

- (1) Если узел, получающий данные, испытывает проблемы, запрос вставки завершится по таймауту (или получит более конкретную ошибку) и не получит подтверждение.
- (2) Если данные были записаны узлом, но подтверждение не может быть возвращено отправителю запроса из-за сетевых прерываний, отправитель получит либо таймаут, либо сетевую ошибку.

С точки зрения коллектора случаи (1) и (2) может быть сложно различить. Однако в обоих случаях неподтверждённую вставку можно просто немедленно повторить. Пока повторный запрос вставки содержит те же данные в том же порядке, ClickHouse автоматически проигнорирует повторную вставку, если исходная (неподтверждённая) вставка была успешной.

По этой причине дистрибутив ClickStack коллектора OTel использует [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md). Это гарантирует, что вставки отправляются согласованными пакетами строк, удовлетворяющими вышеуказанным требованиям. Если ожидается, что коллектор будет иметь высокую пропускную способность (событий в секунду) и в каждой вставке можно отправлять не менее 5000 событий, обычно это единственное пакетирование, необходимое в конвейере. В этом случае коллектор будет сбрасывать пакеты до достижения `timeout` процессора пакетов, обеспечивая низкую сквозную задержку конвейера и согласованный размер пакетов.

### Использование асинхронных вставок {#use-asynchronous-inserts}

Обычно пользователи вынуждены отправлять меньшие пакеты, когда пропускная способность коллектора низкая, но при этом они всё ещё ожидают, что данные достигнут ClickHouse с минимальной сквозной задержкой. В этом случае небольшие пакеты отправляются при истечении `timeout` процессора пакетов. Это может вызвать проблемы, и именно тогда требуются асинхронные вставки. Эта проблема возникает редко, если пользователи отправляют данные в коллектор ClickStack, действующий как шлюз — выступая в роли агрегаторов, они смягчают эту проблему — см. [Роли коллектора](#collector-roles).

Если большие пакеты не могут быть гарантированы, пользователи могут делегировать пакетирование ClickHouse, используя [асинхронные вставки](/best-practices/selecting-an-insert-strategy#asynchronous-inserts). При асинхронных вставках данные сначала вставляются в буфер, а затем записываются в хранилище базы данных позже или асинхронно соответственно.

<Image img={observability_6} alt='Асинхронные вставки' size='md' />

При [включённых асинхронных вставках](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), когда ClickHouse ① получает запрос вставки, данные запроса ② немедленно записываются сначала в буфер в памяти. Когда ③ происходит следующий сброс буфера, данные буфера [сортируются](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) и записываются как часть в хранилище базы данных. Обратите внимание, что данные недоступны для поиска запросами до сброса в хранилище базы данных; сброс буфера [настраивается](/optimize/asynchronous-inserts).

Чтобы включить асинхронные вставки для коллектора, добавьте `async_insert=1` в строку подключения. Мы рекомендуем пользователям использовать `wait_for_async_insert=1` (по умолчанию) для получения гарантий доставки — см. [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) для получения дополнительных подробностей.


Данные из асинхронной вставки (`async insert`) вставляются после сброса буфера ClickHouse. Это происходит либо после превышения значения [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size), либо по истечении [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) миллисекунд с момента первого запроса INSERT. Если параметр `async_insert_stale_timeout_ms` имеет ненулевое значение, данные вставляются через заданное в `async_insert_stale_timeout_ms` количество миллисекунд с момента последнего запроса. Пользователи могут настраивать эти параметры для управления сквозной задержкой в своём конвейере обработки данных. Дополнительные параметры, которые можно использовать для настройки сброса буфера, задокументированы [здесь](/operations/settings/settings#async_insert). Как правило, значения по умолчанию в большинстве случаев являются оптимальными.

:::note Рассмотрите адаптивные асинхронные вставки
В случаях, когда используется небольшое количество агентов с низкой пропускной способностью, но жёсткими требованиями к сквозной задержке, могут быть полезны [адаптивные асинхронные вставки](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts). В целом, они неприменимы к высоконагруженным сценариям Observability, характерным для ClickHouse.
:::

Наконец, прежнее поведение дедупликации, связанное с синхронными вставками в ClickHouse, по умолчанию не используется при асинхронных вставках. При необходимости см. настройку [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Полную информацию по настройке этой функции можно найти на этой [странице документации](/optimize/asynchronous-inserts#enabling-asynchronous-inserts) или в подробной [публикации в блоге](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).



## Масштабирование {#scaling}

Коллектор ClickStack OTel работает как экземпляр Gateway — см. [Роли коллектора](#collector-roles). Они предоставляют автономный сервис, обычно на каждый центр обработки данных или регион. Они получают события от приложений (или других коллекторов в роли агента) через единую конечную точку OTLP. Обычно развертывается набор экземпляров коллектора с готовым балансировщиком нагрузки для распределения нагрузки между ними.

<Image img={clickstack_with_gateways} alt='Масштабирование с помощью шлюзов' size='lg' />

Цель данной архитектуры — разгрузить агенты от вычислительно интенсивной обработки, тем самым минимизируя использование их ресурсов. Эти шлюзы ClickStack могут выполнять задачи преобразования, которые в противном случае должны были бы выполняться агентами. Кроме того, агрегируя события от множества агентов, шлюзы могут обеспечить отправку больших пакетов в ClickHouse, что позволяет эффективно вставлять данные. Эти коллекторы-шлюзы легко масштабируются по мере добавления новых агентов и источников SDK и увеличения пропускной способности событий.

### Добавление Kafka {#adding-kafka}

Читатели могут заметить, что описанные выше архитектуры не используют Kafka в качестве очереди сообщений.

Использование очереди Kafka в качестве буфера сообщений является популярным шаблоном проектирования в архитектурах логирования и было популяризировано стеком ELK. Это дает несколько преимуществ: в первую очередь, помогает обеспечить более надежные гарантии доставки сообщений и справляться с обратным давлением. Сообщения отправляются от агентов сбора в Kafka и записываются на диск. Теоретически кластеризованный экземпляр Kafka должен обеспечивать высокопроизводительный буфер сообщений, поскольку линейная запись данных на диск требует меньших вычислительных затрат, чем разбор и обработка сообщения. Например, в Elastic токенизация и индексирование требуют значительных накладных расходов. Перемещая данные от агентов, вы также снижаете риск потери сообщений в результате ротации логов в источнике. Наконец, это предоставляет возможности повторной отправки сообщений и межрегиональной репликации, что может быть привлекательно для некоторых сценариев использования.

Однако ClickHouse способен очень быстро вставлять данные — миллионы строк в секунду на оборудовании средней мощности. Обратное давление со стороны ClickHouse возникает редко. Часто использование очереди Kafka означает большую архитектурную сложность и затраты. Если вы можете принять принцип, что логи не требуют таких же гарантий доставки, как банковские транзакции и другие критически важные данные, мы рекомендуем избегать сложности Kafka.

Однако если вам требуются высокие гарантии доставки или возможность повторной отправки данных (потенциально в несколько источников), Kafka может стать полезным архитектурным дополнением.

<Image img={observability_8} alt='Добавление Kafka' size='lg' />

В этом случае агенты OTel можно настроить для отправки данных в Kafka через [экспортер Kafka](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). Экземпляры шлюзов, в свою очередь, потребляют сообщения с помощью [приемника Kafka](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). Для получения дополнительной информации рекомендуем обратиться к документации Confluent и OTel.

:::note Конфигурация коллектора OTel
Дистрибутив коллектора ClickStack OpenTelemetry можно настроить для работы с Kafka, используя [пользовательскую конфигурацию коллектора](#extending-collector-config).
:::


## Оценка ресурсов {#estimating-resources}

Требования к ресурсам для коллектора OTel зависят от пропускной способности событий, размера сообщений и объема выполняемой обработки. Проект OpenTelemetry предоставляет [бенчмарки](https://opentelemetry.io/docs/collector/benchmarks/), которые можно использовать для оценки требований к ресурсам.

[По нашему опыту](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), экземпляр шлюза ClickStack с 3 ядрами и 12 ГБ оперативной памяти способен обрабатывать около 60 тысяч событий в секунду. Это при условии минимального конвейера обработки, отвечающего за переименование полей, без использования регулярных выражений.

Для экземпляров агентов, отвечающих за отправку событий на шлюз и только устанавливающих временную метку события, рекомендуется выбирать размер на основе ожидаемого количества логов в секунду. Ниже приведены приблизительные значения, которые можно использовать в качестве отправной точки:

| Частота логирования | Ресурсы для агента коллектора |
| -------------------- | ----------------------------- |
| 1 тыс./сек.          | 0,2 CPU, 0,2 ГиБ              |
| 5 тыс./сек.          | 0,5 CPU, 0,5 ГиБ              |
| 10 тыс./сек.         | 1 CPU, 1 ГиБ                  |


## Поддержка JSON {#json-support}

<BetaBadge />

:::warning Бета-функция
Поддержка типа JSON в **ClickStack** является **бета-функцией**. Хотя сам тип JSON готов к использованию в production в ClickHouse 25.3+, его интеграция в ClickStack всё ещё находится в активной разработке и может иметь ограничения, измениться в будущем или содержать ошибки
:::

ClickStack имеет бета-поддержку [типа JSON](/interfaces/formats/JSON) начиная с версии `2.0.4`.

### Преимущества типа JSON {#benefits-json-type}

Тип JSON предоставляет пользователям ClickStack следующие преимущества:

- **Сохранение типов** — числа остаются числами, булевы значения остаются булевыми, больше не нужно преобразовывать всё в строки. Это означает меньше приведений типов, более простые запросы и более точные агрегации.
- **Колонки на уровне путей** — каждый путь JSON становится отдельной подколонкой, что снижает объём операций ввода-вывода. Запросы читают только необходимые поля, обеспечивая значительный прирост производительности по сравнению со старым типом Map, который требовал чтения всей колонки для запроса конкретного поля.
- **Глубокая вложенность работает без проблем** — естественная обработка сложных, глубоко вложенных структур без ручного выравнивания (как требуется для типа Map) и последующих неудобных функций JSONExtract.
- **Динамические, развивающиеся схемы** — идеально подходит для данных наблюдаемости, где команды со временем добавляют новые теги и атрибуты. JSON обрабатывает эти изменения автоматически, без миграций схемы.
- **Более быстрые запросы, меньше памяти** — типичные агрегации по атрибутам, таким как `LogAttributes`, показывают в 5–10 раз меньший объём чтения данных и значительное ускорение, сокращая как время выполнения запроса, так и пиковое использование памяти.
- **Простое управление** — нет необходимости предварительно материализовывать колонки для повышения производительности. Каждое поле становится отдельной подколонкой, обеспечивая ту же скорость, что и нативные колонки ClickHouse.

### Включение поддержки JSON {#enabling-json-support}

Чтобы включить эту поддержку для коллектора, установите переменную окружения `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` в любом развёртывании, которое включает коллектор. Это гарантирует, что схемы будут созданы в ClickHouse с использованием типа JSON.

:::note Поддержка HyperDX
Для выполнения запросов к типу JSON поддержка также должна быть включена на уровне приложения HyperDX через переменную окружения `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`.
:::

Например:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

### Миграция со схем на основе Map на тип JSON {#migrating-from-map-based-schemas-to-json}

:::important Обратная совместимость
[Тип JSON](/interfaces/formats/JSON) **не обратно совместим** с существующими схемами на основе Map. Включение этой функции создаст новые таблицы с использованием типа `JSON` и потребует ручной миграции данных.
:::

Для миграции со схем на основе Map выполните следующие шаги:

<VerticalStepper headerLevel="h4">

#### Остановите коллектор OTel {#stop-the-collector}

#### Переименуйте существующие таблицы и обновите источники {#rename-existing-tables-sources}

Переименуйте существующие таблицы и обновите источники данных в HyperDX.

Например:

```sql
RENAME TABLE otel_logs TO otel_logs_map;
RENAME TABLE otel_metrics TO otel_metrics_map;
```

#### Разверните коллектор {#deploy-the-collector}

Разверните коллектор с установленной переменной `OTEL_AGENT_FEATURE_GATE_ARG`.

#### Перезапустите контейнер HyperDX с поддержкой схемы JSON {#restart-the-hyperdx-container}

```shell
export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
```

#### Создайте новые источники данных {#create-new-data-sources}

Создайте новые источники данных в HyperDX, указывающие на таблицы JSON.

</VerticalStepper>

#### Миграция существующих данных (опционально) {#migrating-existing-data}

Чтобы переместить старые данные в новые таблицы JSON:

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
Рекомендуется только для наборов данных размером менее ~10 миллиардов строк. Данные, ранее сохранённые с типом Map, не сохраняли точность типов (все значения были строками). В результате эти старые данные будут отображаться как строки в новой схеме до тех пор, пока не устареют, что потребует некоторого приведения типов на фронтенде. Тип для новых данных будет сохранён с типом JSON.
:::
