---
slug: /use-cases/observability/clickstack/ingesting-data/otel-collector
pagination_prev: null
pagination_next: null
description: 'OpenTelemetry collector для ClickStack — стек наблюдаемости ClickHouse'
sidebar_label: 'OpenTelemetry collector'
title: 'ClickStack OpenTelemetry Collector'
doc_type: 'guide'
keywords: ['ClickStack', 'OpenTelemetry collector', 'наблюдаемость ClickHouse', 'конфигурация OTel collector', 'OpenTelemetry ClickHouse']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import clickstack_with_gateways from '@site/static/images/use-cases/observability/clickstack-with-gateways.png';
import clickstack_with_kafka from '@site/static/images/use-cases/observability/clickstack-with-kafka.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

На этой странице представлены сведения о настройке официального коллектора OpenTelemetry (OTel) для ClickStack.


## Роли коллекторов {#collector-roles}

Коллекторы OpenTelemetry могут быть развернуты в двух основных ролях:

- **Агент** — экземпляры агента собирают данные на периферии, например на серверах или узлах Kubernetes, либо получают события непосредственно от приложений, инструментированных с помощью OpenTelemetry SDK. В последнем случае экземпляр агента запускается вместе с приложением или на том же хосте, что и приложение (например, в виде сайдкара или ДемонСета). Агенты могут либо отправлять свои данные напрямую в ClickHouse, либо на экземпляр шлюза. В первом случае это называется [паттерном развертывания Agent](https://opentelemetry.io/docs/collector/deployment/agent/). 

- **Шлюз** — экземпляры шлюза предоставляют автономный сервис (например, Развертывание в Kubernetes), как правило, для каждого кластера, дата-центра или региона. Они получают события от приложений (или других коллекторов, работающих как агенты) через единую точку входа OTLP. Обычно разворачивается набор экземпляров шлюза, а готовый балансировщик нагрузки используется для распределения нагрузки между ними. Если все агенты и приложения отправляют свои сигналы на эту единую точку входа, это часто называют [паттерном развертывания Gateway](https://opentelemetry.io/docs/collector/deployment/gateway/). 

**Важно: Коллектор, включая вариант по умолчанию в дистрибутивах ClickStack, настроен на работу в [роли шлюза, описанной ниже](#collector-roles), получая данные от агентов или SDK.**

Пользователи, разворачивающие коллекторы OTel в роли агента, обычно используют [стандартный contrib-дистрибутив коллектора](https://github.com/open-telemetry/opentelemetry-collector-contrib), а не версию ClickStack, но могут свободно применять и другие OTLP-совместимые технологии, такие как [Fluentd](https://www.fluentd.org/) и [Vector](https://vector.dev/).



## Развертывание коллектора

Если вы управляете собственным коллектором OpenTelemetry в отдельном развертывании — например, при использовании дистрибутива только с HyperDX, — мы [по‑прежнему рекомендуем использовать официальный дистрибутив коллектора ClickStack](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector) для роли шлюза, когда это возможно. Но если вы решите использовать собственный коллектор, убедитесь, что он включает [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).

### Автономный режим

Чтобы развернуть дистрибутив коллектора OTel из ClickStack в автономном режиме, выполните следующую команду docker:

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

Обратите внимание, что мы можем переопределить целевой экземпляр ClickHouse с помощью переменных окружения `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USERNAME` и `CLICKHOUSE_PASSWORD`. Значение `CLICKHOUSE_ENDPOINT` должно быть полным HTTP-адресом ClickHouse, включая протокол и порт — например, `http://localhost:8123`.

**Эти переменные окружения можно использовать с любыми Docker-дистрибутивами, которые включают коннектор.**

Переменная `OPAMP_SERVER_URL` должна указывать на ваше развертывание HyperDX — например, `http://localhost:4320`. HyperDX по умолчанию предоставляет сервер OpAMP (Open Agent Management Protocol) по адресу `/v1/opamp` на порту `4320`. Убедитесь, что этот порт проброшен из контейнера, в котором запущен HyperDX (например, с помощью `-p 4320:4320`).

:::note Публикация и подключение к порту OpAMP
Чтобы коллектор мог подключиться к порту OpAMP, он должен быть опубликован контейнером HyperDX, например `-p 4320:4320`. Для локального тестирования пользователи OSX могут затем установить `OPAMP_SERVER_URL=http://host.docker.internal:4320`. Пользователи Linux могут запустить контейнер коллектора с параметром `--network=host`.
:::

В рабочей (production) среде пользователи должны использовать пользователя с [подходящими учетными данными](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user).

### Изменение конфигурации

#### Использование Docker

Все Docker-образы, которые включают OpenTelemetry collector, можно настроить на использование экземпляра ClickHouse через переменные окружения `OPAMP_SERVER_URL`,`CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USERNAME` и `CLICKHOUSE_PASSWORD`:

Например, образ «all-in-one»:

```shell
export OPAMP_SERVER_URL=<OPAMP_SERVER_URL>
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

#### Docker Compose

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
      - '13133:13133' # расширение health_check
      - '24225:24225' # получатель fluentd
      - '4317:4317' # получатель OTLP gRPC
      - '4318:4318' # получатель OTLP http
      - '8888:8888' # расширение metrics
    restart: always
    networks:
      - internal
```

### Расширенная конфигурация

Дистрибутив ClickStack с компонентом OTel collector поддерживает расширение базовой конфигурации путём монтирования пользовательского файла конфигурации и установки переменной окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, управляемой HyperDX через OpAMP.


#### Расширение конфигурации коллектора

Чтобы добавить пользовательские приёмники (receivers), процессоры (processors) или конвейеры (pipelines):

1. Создайте пользовательский файл конфигурации с дополнительными настройками.
2. Смонтируйте файл по пути `/etc/otelcol-contrib/custom.config.yaml`.
3. Установите переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`.

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

**Развертывание с использованием образа «всё в одном»:**

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

**Развертывание с отдельным коллектором:**

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
В пользовательской конфигурации вы определяете только новые `receivers`, `processors` и `pipelines`. Базовые `processors` (`memory_limiter`, `batch`) и `exporters` (`clickhouse`) уже определены — ссылайтесь на них по имени. Пользовательская конфигурация объединяется с базовой и не может переопределять существующие компоненты.
:::

Для более сложных конфигураций обратитесь к [стандартной конфигурации коллектора ClickStack](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml) и [документации по ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options).

#### Структура конфигурации

Подробную информацию по настройке OTel collector, включая [`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/), [`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) и [`processors`](https://opentelemetry.io/docs/collector/configuration/#processors), рекомендуем искать в [официальной документации по OpenTelemetry collector](https://opentelemetry.io/docs/collector/configuration).


## Обеспечение безопасности коллектора

Дистрибутив ClickStack для коллектора OpenTelemetry включает встроенную поддержку OpAMP (Open Agent Management Protocol), который используется для безопасной настройки и управления OTLP-эндпоинтом. При запуске необходимо передать переменную окружения `OPAMP_SERVER_URL` — она должна указывать на приложение HyperDX, которое предоставляет OpAMP API по пути `/v1/opamp`.

Эта интеграция гарантирует, что OTLP-эндпоинт защищён с помощью автоматически сгенерированного ключа API для приёма данных (ingestion API key), создаваемого при развёртывании приложения HyperDX. Все телеметрические данные, отправляемые в коллектор, должны включать этот API key для аутентификации. Найти ключ можно в приложении HyperDX в разделе `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ключи для приёма данных" size="lg" />

Для дополнительной защиты вашего развёртывания мы рекомендуем:

* Настроить коллектор на взаимодействие с ClickHouse по HTTPS.
* Создать отдельного пользователя для ингестии с ограниченными правами — см. ниже.
* Включить TLS для OTLP-эндпоинта, чтобы обеспечить шифрованное взаимодействие между SDKs/агентами и коллектором. Это можно настроить через [пользовательскую конфигурацию коллектора](#extending-collector-config).

### Создание пользователя для ингестии

Мы рекомендуем создать отдельную базу данных и пользователя для OTel collector, используемого для ингестии данных в ClickHouse. У этого пользователя должны быть права на создание и вставку данных в [таблицы, создаваемые и используемые ClickStack](/use-cases/observability/clickstack/ingesting-data/schemas).

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

Предполагается, что коллектор настроен на использование базы данных `otel`. Это можно задать с помощью переменной окружения `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`. Передайте её образу, в котором запущен коллектор, [аналогично другим переменным окружения](#modifying-otel-collector-configuration).


## Обработка — фильтрация, трансформация и обогащение {#processing-filtering-transforming-enriching}

Пользователи, как правило, хотят выполнять фильтрацию, трансформацию и обогащение событийных сообщений во время ингестии. Поскольку конфигурацию коннектора ClickStack нельзя изменять, мы рекомендуем пользователям, которым требуется дополнительная фильтрация и обработка событий, либо:

- Развернуть собственную версию OTel collector, выполняющего фильтрацию и обработку и отправляющего события в ClickStack collector по протоколу OTLP для ингестии в ClickHouse.
- Развернуть собственную версию OTel collector и отправлять события напрямую в ClickHouse с помощью ClickHouse exporter.

Если обработка выполняется с использованием OTel collector, мы рекомендуем выполнять трансформации на инстансах-шлюзах (gateway) и минимизировать работу, выполняемую на агентских инстансах. Это обеспечит минимально возможное потребление ресурсов агентами на периферии, работающими на серверах. Обычно мы видим, что пользователи выполняют только фильтрацию (для минимизации ненужного сетевого трафика), установку временных меток (через операторы) и обогащение, которое требует контекста в агентах. Например, если инстансы-шлюзы находятся в другом кластере Kubernetes, обогащение k8s потребуется выполнять на агенте.

OpenTelemetry поддерживает следующие функции обработки и фильтрации, которыми могут воспользоваться пользователи:

- **Processors** — processors берут данные, собранные [receivers, и модифицируют или трансформируют](https://opentelemetry.io/docs/collector/transforming-telemetry/) их перед отправкой в exporters. Processors применяются в порядке, заданном в секции `processors` конфигурации collector. Они являются необязательными, но минимальный набор [обычно рекомендуется](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). При использовании OTel collector с ClickHouse мы рекомендуем ограничиться следующими processors:

- [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) используется для предотвращения ситуаций нехватки памяти на collector. См. раздел [Estimating Resources](#estimating-resources) для рекомендаций.
- Любой processor, выполняющий обогащение на основе контекста. Например, [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) позволяет автоматически задавать ресурсные атрибуты спанов, метрик и логов с использованием метаданных k8s, например обогащать события идентификатором исходного пода.
- [Tail или head sampling](https://opentelemetry.io/docs/concepts/sampling/), если это требуется для трассировок.
- [Базовая фильтрация](https://opentelemetry.io/docs/collector/transforming-telemetry/) — удаление ненужных событий, если это невозможно сделать через operator (см. ниже).
- [Batching](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) — критически важно при работе с ClickHouse, чтобы данные отправлялись батчами. См. раздел ["Optimizing inserts"](#optimizing-inserts).

- **Operators** — [operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) обеспечивают наиболее базовый уровень обработки, доступный на стороне receiver. Поддерживается базовый парсинг, позволяющий задавать такие поля, как Severity и Timestamp. Здесь поддерживаются JSON- и regex-парсинг, а также фильтрация событий и базовые трансформации. Мы рекомендуем выполнять фильтрацию событий именно здесь.

Мы рекомендуем пользователям избегать чрезмерной обработки событий с использованием operators или [transform processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md). Они могут приводить к значительным накладным расходам по памяти и CPU, особенно при JSON-парсинге. Весь объём обработки можно выполнять в ClickHouse во время вставки с использованием материализованных представлений и столбцов, за некоторыми исключениями — в частности, обогащение, зависящее от контекста, например добавление метаданных k8s. Для более подробной информации см. раздел [Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql).

### Пример {#example-processing}

Следующая конфигурация показывает сбор этого [неструктурированного файла логов](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz). Эта конфигурация может использоваться collector в роли агента, отправляющего данные в ClickStack gateway.

Обратите внимание на использование operators для извлечения структуры из строк логов (`regex_parser`) и фильтрации событий, а также processor для пакетирования событий и ограничения использования памяти.



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

Обратите внимание, что во всех взаимодействиях по протоколу OTLP необходимо добавлять [заголовок авторизации, содержащий ваш ключ API для приёма данных](#securing-the-collector).

Для более продвинутой настройки рекомендуем ознакомиться с [документацией по коллектору OpenTelemetry](https://opentelemetry.io/docs/collector/).


## Оптимизация вставок {#optimizing-inserts}

Чтобы добиться высокой производительности вставок при сохранении строгих гарантий согласованности, пользователям следует придерживаться простых правил при вставке данных наблюдаемости в ClickHouse через ClickStack collector. При корректной конфигурации OTel collector соблюдение этих правил не составит труда. Это также позволяет избежать [распространённых проблем](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse), с которыми пользователи сталкиваются при первом использовании ClickHouse.

### Пакетирование {#batching}

По умолчанию каждая вставка, отправленная в ClickHouse, приводит к тому, что ClickHouse немедленно создаёт часть данных в хранилище, содержащую данные из вставки вместе с другой метаинформацией, которую необходимо сохранить. Поэтому отправка меньшего количества вставок, каждая из которых содержит больше данных, по сравнению с отправкой большего количества вставок с меньшим объёмом данных, уменьшит количество необходимых операций записи. Мы рекомендуем вставлять данные достаточно крупными пакетами — не менее 1 000 строк за один раз. Дополнительные детали — [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

По умолчанию вставки в ClickHouse являются синхронными и идемпотентными при идентичности данных. Для таблиц семейства движков MergeTree ClickHouse по умолчанию автоматически [дедуплицирует вставки](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). Это означает, что вставки устойчивы к сбоям в следующих случаях:

- (1) Если у узла, принимающего данные, возникают проблемы, запрос на вставку завершится по тайм-ауту (или выдаст более специфичную ошибку) и не получит подтверждения.
- (2) Если данные были записаны узлом, но подтверждение не может быть возвращено отправителю запроса из‑за сетевых сбоев, отправитель получит либо тайм-аут, либо сетевую ошибку.

С точки зрения коллектора (1) и (2) могут быть трудны для различения. Однако в обоих случаях неподтверждённую вставку можно немедленно повторить. Пока повторный запрос вставки содержит те же данные в том же порядке, ClickHouse автоматически проигнорирует повторную вставку, если исходная (неподтверждённая) вставка завершилась успешно.

По этой причине дистрибутив ClickStack с OTel collector использует [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md). Это гарантирует, что вставки отправляются как согласованные пакеты строк, удовлетворяющие указанным выше требованиям. Если от коллектора ожидается высокая пропускная способность (событий в секунду) и как минимум 5000 событий могут быть отправлены в каждой вставке, это обычно единственное пакетирование, необходимое в конвейере. В этом случае коллектор будет сбрасывать пакеты до того, как будет достигнуто значение `timeout` batch processor, что гарантирует низкую сквозную задержку конвейера и стабильный размер пакетов.

### Используйте асинхронные вставки {#use-asynchronous-inserts}

Как правило, пользователи вынуждены отправлять более мелкие пакеты, когда пропускная способность коллектора низкая, но при этом они ожидают, что данные достигнут ClickHouse с минимальной сквозной задержкой. В этом случае небольшие пакеты отправляются при истечении `timeout` batch processor. Это может вызывать проблемы, и в таких случаях требуются асинхронные вставки. Такая ситуация встречается редко, если пользователи отправляют данные в ClickStack collector, работающий в роли шлюза (Gateway): выступая в роли агрегаторов, такие коллекторы снимают эту проблему — см. [Роли коллектора](#collector-roles).

Если гарантировать крупные пакеты невозможно, пользователи могут делегировать пакетирование ClickHouse, используя [асинхронные вставки](/best-practices/selecting-an-insert-strategy#asynchronous-inserts). При асинхронных вставках данные сначала вставляются во входной буфер в памяти, а затем записываются в хранилище базы данных позднее, то есть асинхронно.

<Image img={observability_6} alt="Async inserts" size="md"/>

При [включённых асинхронных вставках](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), когда ClickHouse ① получает запрос на вставку, данные запроса ② сразу же сначала записываются во входной буфер в оперативной памяти. Когда ③ происходит следующий сброс буфера, данные буфера [сортируются](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) и записываются как часть в хранилище базы данных. Обратите внимание, что данные недоступны для запросов до их сброса в хранилище базы данных; момент сброса буфера [настраивается](/optimize/asynchronous-inserts).

Чтобы включить асинхронные вставки для коллектора, добавьте `async_insert=1` в строку подключения. Мы рекомендуем использовать `wait_for_async_insert=1` (значение по умолчанию), чтобы получить гарантии доставки — см. [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) для получения дополнительных сведений.



Данные из асинхронной вставки записываются после сброса буфера ClickHouse. Это происходит либо после превышения значения [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size), либо по истечении [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) миллисекунд с момента первого запроса INSERT. Если параметр `async_insert_stale_timeout_ms` установлен в ненулевое значение, данные вставляются по истечении `async_insert_stale_timeout_ms` миллисекунд с момента последнего запроса. Пользователи могут настраивать эти параметры для управления сквозной задержкой своего конвейера обработки данных. Дополнительные настройки, которые можно использовать для тонкой настройки сброса буфера, задокументированы [здесь](/operations/settings/settings#async_insert). Как правило, значения по умолчанию оказываются достаточными.

:::note Рассмотрите использование адаптивных асинхронных вставок
В случаях, когда используется небольшое количество агентов с небольшой пропускной способностью, но строгими требованиями к сквозной задержке, могут быть полезны [адаптивные асинхронные вставки](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts). Как правило, они неприменимы к сценариям наблюдаемости с высокой пропускной способностью, характерным для ClickHouse.
:::

Наконец, предыдущее поведение дедупликации, связанное с синхронными вставками в ClickHouse, по умолчанию не включено при использовании асинхронных вставок. При необходимости см. настройку [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Полную информацию по настройке этой функции можно найти на этой [странице документации](/optimize/asynchronous-inserts#enabling-asynchronous-inserts) или в подробной [статье в блоге](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).



## Масштабирование {#scaling}

OTel collector в составе ClickStack выступает в роли шлюза (Gateway) — см. [Роли collector’ов](#collector-roles). Это отдельный сервис, как правило, один на дата-центр или регион. Он принимает события от приложений (или других коллекторов в роли агента) через единый OTLP endpoint. Обычно разворачивается несколько экземпляров коллектора, а стандартный балансировщик нагрузки распределяет трафик между ними.

<Image img={clickstack_with_gateways} alt="Масштабирование с использованием шлюзов" size="lg"/>

Цель этой архитектуры — разгрузить агентов от вычислительно затратной обработки, минимизировав их потребление ресурсов. Эти шлюзы ClickStack могут выполнять задачи трансформации, которые иначе пришлось бы выполнять агентам. Кроме того, агрегируя события от множества агентов, шлюзы могут отправлять в ClickHouse крупные пакеты данных, что обеспечивает эффективную вставку. Масштабировать такие шлюзы-коллекторы просто по мере добавления новых агентов и SDK-источников и роста объёма передаваемых событий. 

### Добавление Kafka {#adding-kafka}

Читатели могут заметить, что описанные выше архитектуры не используют Kafka как очередь сообщений.

Использование очереди Kafka в качестве буфера сообщений — распространённый шаблон в архитектурах логирования, популяризированный стеком ELK. Он даёт несколько преимуществ: в первую очередь, более строгие гарантии доставки сообщений и лучшие возможности работы с backpressure (обратным давлением). Сообщения отправляются от агентов сбора в Kafka и записываются на диск. Теоретически кластер Kafka должен обеспечивать высокопроизводительный буфер сообщений, поскольку затраты на линейную запись данных на диск ниже, чем на разбор и обработку сообщения. В Elastic, например, токенизация и индексация создают значительные накладные расходы. Перенеся данные с агентов, вы также снижаете риск потери сообщений из‑за ротации логов на источнике. Наконец, Kafka предоставляет возможности повторной доставки сообщений и кросс-региональной репликации, что может быть важно для некоторых сценариев.

Однако ClickHouse способен очень быстро вставлять данные — миллионы строк в секунду на умеренном оборудовании. Backpressure со стороны ClickHouse возникает редко. Часто использование очереди Kafka приводит лишь к росту сложности архитектуры и затрат. Если вы можете принять принцип, что логи не требуют таких же гарантий доставки, как банковские транзакции и другая критически важная информация, мы рекомендуем избегать дополнительной сложности с Kafka.

Тем не менее, если вам необходимы жёсткие гарантии доставки или возможность переигрывать данные (потенциально в несколько систем-получателей), Kafka может быть полезным архитектурным компонентом.

<Image img={observability_8} alt="Добавление Kafka" size="lg"/>

В этом случае агенты OTel могут быть настроены на отправку данных в Kafka с использованием [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). Шлюзы (Gateway-экземпляры), в свою очередь, потребляют сообщения с помощью [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). За дополнительными подробностями рекомендуем документацию Confluent и OTel.

:::note Конфигурация OTel collector
Дистрибутив ClickStack OpenTelemetry collector может быть настроен для работы с Kafka с использованием [пользовательской конфигурации коллектора](#extending-collector-config).
:::



## Оценка ресурсов {#estimating-resources}

Требования к ресурсам для коллектора OTel зависят от пропускной способности по событиям, размера сообщений и объёма выполняемой обработки. Проект OpenTelemetry поддерживает [бенчмарки](https://opentelemetry.io/docs/collector/benchmarks/), которые пользователи могут использовать для оценки требований к ресурсам.

[По нашему опыту](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), экземпляр шлюза ClickStack с 3 ядрами и 12 GB оперативной памяти может обрабатывать около 60 тыс. событий в секунду. При этом предполагается минимальный конвейер обработки, отвечающий только за переименование полей и не использующий регулярные выражения.

Для экземпляров агента, отвечающих за отправку событий в шлюз и только установку временной метки события, мы рекомендуем планировать ресурсы, исходя из ожидаемого числа логов в секунду. Ниже приведены ориентировочные значения, которые можно использовать как отправную точку:

| Скорость логирования | Ресурсы для агента-коллектора |
|----------------------|--------------------------------|
| 1k/second            | 0.2 CPU, 0.2 GiB              |
| 5k/second            | 0.5 CPU, 0.5 GiB              |
| 10k/second           | 1 CPU, 1 GiB                  |



## Поддержка JSON

<BetaBadge />

:::warning Бета‑функция
Поддержка типа JSON в **ClickStack** — это **функция в статусе бета**. Хотя сам тип JSON готов к промышленной эксплуатации в ClickHouse 25.3+, его интеграция в ClickStack всё ещё находится в активной разработке и может иметь ограничения, измениться в будущем или содержать ошибки.
:::

Начиная с версии `2.0.4`, ClickStack имеет бета‑поддержку [типа JSON](/interfaces/formats/JSON).

### Преимущества типа JSON

Тип JSON предоставляет пользователям ClickStack следующие преимущества:

* **Сохранение типов** — числа остаются числами, булевы значения остаются булевыми — больше не нужно сводить всё к строкам. Это означает меньше приведений типов, более простые запросы и более точные агрегации.
* **Столбцы на уровне путей** — каждый JSON‑путь становится собственным подстолбцом, что снижает объём операций ввода‑вывода. Запросы читают только нужные поля, обеспечивая значительный прирост производительности по сравнению со старым типом Map, при котором для выборки конкретного поля требовалось читать весь столбец.
* **Глубокая вложенность «просто работает»** — естественная поддержка сложных, глубоко вложенных структур без ручного «выпрямления» (как требовалось для типа Map) и последующего неудобного использования функций JSONExtract.
* **Динамические, эволюционирующие схемы** — идеально для данных наблюдаемости, где команды со временем добавляют новые теги и атрибуты. JSON обрабатывает эти изменения автоматически, без миграций схемы.
* **Быстрые запросы, меньше памяти** — типичные агрегации по атрибутам, таким как `LogAttributes`, читают в 5–10 раз меньше данных и заметно ускоряются, сокращая как время выполнения запросов, так и пиковое потребление памяти.
* **Простое управление** — нет необходимости заранее материализовывать столбцы ради производительности. Каждое поле становится собственным подстолбцом, обеспечивая ту же скорость, что и «родные» столбцы ClickHouse.

### Включение поддержки JSON

Чтобы включить эту поддержку для коллектора, задайте переменную окружения `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` в любом Развертывании, которое включает коллектор. Это гарантирует, что схемы в ClickHouse создаются с использованием типа JSON.

:::note Поддержка HyperDX
Чтобы иметь возможность выполнять запросы к типу JSON, поддержку также необходимо включить на уровне приложения HyperDX с помощью переменной окружения `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`.
:::

Например:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

### Миграция от схем на основе Map к типу JSON

:::important Обратная совместимость
[Тип JSON](/interfaces/formats/JSON) **не является обратно совместимым** с существующими схемами на основе Map. Включение этой функции создаст новые таблицы с использованием типа `JSON` и потребует ручной миграции данных.
:::

Чтобы перейти со схем на основе Map, выполните следующие шаги:

<VerticalStepper headerLevel="h4">
  #### Остановите OTel collector

  #### Переименуйте существующие таблицы и обновите источники

  Переименуйте существующие таблицы и обновите источники данных в HyperDX.

  Например:

  ```sql
  RENAME TABLE otel_logs TO otel_logs_map;
  RENAME TABLE otel_metrics TO otel_metrics_map;
  ```

  #### Разверните OTel collector

  Разверните OTel collector с установленным параметром `OTEL_AGENT_FEATURE_GATE_ARG`.

  #### Перезапустите контейнер HyperDX с поддержкой схемы JSON

  ```shell
  export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
  ```

  #### Создайте новые источники данных

  Создайте новые источники данных в HyperDX, указывающие на JSON-таблицы.
</VerticalStepper>

#### Миграция существующих данных (необязательно)

Чтобы перенести старые данные в новые JSON-таблицы:

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
Рекомендуется только для наборов данных объёмом менее ~10 миллиардов строк. Данные, ранее сохранённые с типом Map, не сохраняли точную типизацию (все значения были строками). В результате эти старые данные будут отображаться как строки в новой схеме, пока не устареют, что потребует приведения типов на стороне фронтенда. Тип для новых данных будет сохраняться при использовании типа JSON.
:::
