---
'slug': '/use-cases/observability/clickstack/ingesting-data/otel-collector'
'pagination_prev': null
'pagination_next': null
'description': 'OpenTelemetry коллектор для ClickStack - Стек мониторинга ClickHouse'
'sidebar_label': 'OpenTelemetry Collector'
'title': 'ClickStack OpenTelemetry Collector'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import clickstack_with_gateways from '@site/static/images/use-cases/observability/clickstack-with-gateways.png';
import clickstack_with_kafka from '@site/static/images/use-cases/observability/clickstack-with-kafka.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

Эта страница содержит детали настройки официального коллектора OpenTelemetry (OTel) для ClickStack.

## Роли коллектора {#collector-roles}

Коллекторы OpenTelemetry могут быть развернуты в двух основных ролях:

- **Агент** - Экземпляры агентов собирают данные на границе, например, на серверах или на узлах Kubernetes, или принимают события непосредственно от приложений, инструментированных с помощью OpenTelemetry SDK. В последнем случае экземпляр агента работает вместе с приложением или на том же хосте, что и приложение (например, как сайдкар или DaemonSet). Агенты могут отправлять свои данные напрямую в ClickHouse или на экземпляр шлюза. В первом случае это называется [шаблоном развертывания агента](https://opentelemetry.io/docs/collector/deployment/agent/).

- **Шлюз** - Экземпляры шлюзов предоставляют отдельный сервис (например, развертывание в Kubernetes), как правило, на кластер, центр обработки данных или регион. Эти экземпляры принимают события от приложений (или других коллекторов в роли агентов) через единую точку доступа OTLP. Обычно развертывается набор экземпляров шлюзов, с использованием готового балансировщика нагрузки для распределения нагрузки между ними. Если все агенты и приложения отправляют свои сигналы на эту единую точку, это часто называется [шаблоном развертывания шлюза](https://opentelemetry.io/docs/collector/deployment/gateway/).

**Важно: Коллектор, включая стандартные сборки ClickStack, предполагает [роль шлюза, описанную ниже](#collector-roles), получая данные от агентов или SDK.**

Пользователи, развертывающие OTel коллекторы в роли агента, обычно используют [стандартное распределение коллектора contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib) и не версию ClickStack, но могут свободно использовать другие совместимые с OTLP технологии, такие как [Fluentd](https://www.fluentd.org/) и [Vector](https://vector.dev/).

## Развертывание коллектора {#configuring-the-collector}

Если вы управляете своим собственным коллекторами OpenTelemetry в отдельном развертывании - например, при использовании только дистрибутива HyperDX - мы [рекомендуем все же использовать официальное распределение ClickStack коллектора](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector) для роли шлюза, где это возможно, но если вы решите привнести свой, убедитесь, что он включает [экспортер ClickHouse](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).

### Отдельный {#standalone}

Чтобы развернуть распределение ClickStack OTel.connector в настольном режиме, выполните следующую команду docker:

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

Обратите внимание, что мы можем переопределить целевой экземпляр ClickHouse с помощью переменных окружения для `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USERNAME` и `CLICKHOUSE_PASSWORD`. Значение `CLICKHOUSE_ENDPOINT` должно быть полным HTTP-адресом ClickHouse, включая протокол и порт—например, `http://localhost:8123`.

**Эти переменные окружения могут быть использованы с любым из дистрибутивов docker, которые включают коннектор.**

Значение `OPAMP_SERVER_URL` должно указывать на вашу развертку HyperDX - например, `http://localhost:4320`. HyperDX открывает сервер OpAMP (Open Agent Management Protocol) по адресу `/v1/opamp` на порту `4320` по умолчанию. Убедитесь, что этот порт открыт из контейнера, в котором работает HyperDX (например, с использованием `-p 4320:4320`).

:::note Открытие и подключение к порту OpAMP
Чтобы коллектор мог подключаться к порту OpAMP, он должен быть открыт контейнером HyperDX, например, `-p 4320:4320`. Для локального тестирования пользователи OSX могут установить `OPAMP_SERVER_URL=http://host.docker.internal:4320`. Пользователи Linux могут запустить контейнер коллектора с параметром `--network=host`.
:::

Пользователи должны использовать пользователя с [соответствующими учетными данными](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user) в продакшене.

### Изменение конфигурации {#modifying-otel-collector-configuration}

#### Использование docker {#using-docker}

Все образы docker, которые включают OpenTelemetry.collector, могут быть настроены для использования экземпляра ClickHouse с помощью переменных окружения `OPAMP_SERVER_URL`,`CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USERNAME` и `CLICKHOUSE_PASSWORD`:

Например, образ all-in-one:

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

С Docker Compose измените конфигурацию коллектора с использованием тех же переменных окружения, как указано выше:

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

В настоящее время ClickStack распределение OTel.collector не поддерживает изменение файла конфигурации. Если вам нужна более сложная конфигурация, например, [настройка TLS](#securing-the-collector) или изменение размера пакета, мы рекомендуем скопировать и изменить [стандартную конфигурацию](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml) и развернуть собственную версию OTel.collector, используя экспортер ClickHouse, задокументированный [здесь](/observability/integrating-opentelemetry#exporting-to-clickhouse) и [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options).

Стандартная конфигурация ClickStack для коллектора OpenTelemetry (OTel) доступна [здесь](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml).

#### Структура конфигурации {#configuration-structure}

Для деталей о конфигурации OTel.collectors, включая [`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/), [`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md), и [`processors`](https://opentelemetry.io/docs/collector/configuration/#processors), мы рекомендуем [официальную документацию коллектора OpenTelemetry](https://opentelemetry.io/docs/collector/configuration).

## Безопасность коллектора {#securing-the-collector}

Распределение ClickStack коллектора OpenTelemetry включает встроенную поддержку OpAMP (Open Agent Management Protocol), который используется для безопасной настройки и управления точкой доступа OTLP. При запуске пользователи должны предоставить переменную окружения `OPAMP_SERVER_URL` — она должна указывать на приложение HyperDX, которое хостит API OpAMP по адресу `/v1/opamp`.

Эта интеграция обеспечивает безопасность точки доступа OTLP, используя авто-сгенерированный ключ API для приема данных, созданный при развертывании приложения HyperDX. Все данные телеметрии, отправляемые в коллектор, должны включать этот ключ API для аутентификации. Вы можете найти ключ в приложении HyperDX в разделе `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

Чтобы дополнительно обезопасить ваше развертывание, мы рекомендуем:

- Настроить коллектор для связи с ClickHouse через HTTPS.
- Создать отдельного пользователя для приема данных с ограниченными правами - подробности ниже.
- Включить TLS для точки доступа OTLP, чтобы обеспечить шифрованную коммуникацию между SDK/агентами и коллектором. **В настоящее время это требует от пользователей развертывания стандартного распределения коллектора и самостоятельного управления конфигурацией**.

### Создание пользователя для приема данных {#creating-an-ingestion-user}

Мы рекомендуем создать отдельную базу данных и пользователя для OTel.collector для приема данных в ClickHouse. У этого пользователя должны быть права на создание и вставку в [таблицы, созданные и используемые ClickStack](/use-cases/observability/clickstack/ingesting-data/schemas).

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

Это предполагает, что коллектор был настроен на использование базы данных `otel`. Это можно контролировать с помощью переменной окружения `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`. Передайте это изображению, в котором размещен коллектор [аналогично другим переменным окружения](#modifying-otel-collector-configuration).

## Обработка - фильтрация, преобразование и обогащение {#processing-filtering-transforming-enriching}

Пользователи безусловно захотят фильтровать, преобразовывать и обогащать сообщения событий во время приема данных. Поскольку конфигурация для коннектора ClickStack не может быть изменена, мы рекомендуем пользователям, которым требуется дальнейшая фильтрация событий и обработка:

- Развернуть собственную версию OTel.collector, выполняющую фильтрацию и обработку, отправляя события в ClickStack коллектор через OTLP для приема в ClickHouse.
- Развернуть собственную версию OTel.collector и отправлять события напрямую в ClickHouse, используя экспортер ClickHouse.

Если обработка осуществляется с помощью OTel.collector, мы рекомендуем выполнять преобразования на экземплярах шлюзов и минимизировать любую работу, выполняемую на экземплярах агентов. Это гарантирует минимальные требования к ресурсам для агентов на границе, работающих на серверах. Обычно мы видим, что пользователи выполняют только фильтрацию (чтобы минимизировать ненужное сетевое использование), установку временных меток (через операторы) и обогащение, которое требует контекста в агентах. Например, если экземпляры шлюзов находятся в другом кластере Kubernetes, обогащение k8s необходимо проводить в агенте.

OpenTelemetry поддерживает следующие функции обработки и фильтрации, которые пользователи могут использовать:

- **Процессоры** - Процессоры обрабатывают данные, собранные [приемниками и модифицируют или преобразовывают](https://opentelemetry.io/docs/collector/transforming-telemetry/) их перед отправкой экспортерам. Процессоры применяются в порядке, указанном в разделе `processors` конфигурации коллектора. Эти элементы являются необязательными, но минимальный набор [обычно рекомендуется](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). При использовании OTel.collector с ClickHouse мы рекомендуем ограничить количество процессоров до:

- [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) используется для предотвращения ситуации с нехваткой памяти на коллекторе. См. [Оценка ресурсов](#estimating-resources) для рекомендаций.
- Любой процессор, который выполняет обогащение на основе контекста. Например, [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) позволяет автоматически устанавливать атрибуты ресурсов для диапазонов, метрик и логов с метаданными k8s, например, обогащение событий их идентификатором Pod источника.
- [Требования к выборке с хвоста или начала](https://opentelemetry.io/docs/concepts/sampling/), если они необходимы для трассировок.
- [Базовая фильтрация](https://opentelemetry.io/docs/collector/transforming-telemetry/) - Удаление событий, которые не требуются, если это нельзя сделать с помощью оператора (см. ниже).
- [Пакетирование](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - необходимо при работе с ClickHouse, чтобы убедиться, что данные отправляются пакетами. См. ["Оптимизация вставок"](#optimizing-inserts).

- **Операторы** - [Операторы](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) предоставляют основную единицу обработки, доступную на приемнике. Поддерживается базовый анализ, позволяющий устанавливать поля такие, как степень и временная метка. Поддерживаются разбор JSON и регулярные выражения, а также фильтрация событий и базовые преобразования. Мы рекомендуем выполнять фильтрацию событий здесь.

Мы рекомендуем пользователям избегать чрезмерной обработки событий с помощью операторов или [преобразовательных процессоров](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md). Эти операции могут потреблять значительные ресурсы памяти и CPU, особенно при разборе JSON. Во многих случаях выполнять всю обработку можно в ClickHouse во время вставки с помощью материализованных представлений и колонок с некоторыми исключениями - в частности, контекстно-осознанным обогащением, например, добавлением метаданных k8s. Для получения более детальной информации смотрите [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql).

### Пример {#example-processing}

Следующая конфигурация показывает сборку [неструктурированного лог-файла](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz). Эта конфигурация может быть использована коллектором в роли агента, отправляющим данные в шлюз ClickStack.

Обратите внимание на использование операторов для извлечения структуры из лог строк (`regex_parser`) и фильтрации событий, а также на процессор для пакетирования событий и ограничения использования памяти.

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
  # HTTP setup
  otlphttp/hdx:
    endpoint: 'http://localhost:4318'
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    compression: gzip

  # gRPC setup (alternative)
  otlp/hdx:
    endpoint: 'localhost:4317'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]

```

Обратите внимание на необходимость включения [заголовка авторизации, содержащего ваш ключ API приема данных](#securing-the-collector) в любой связи OTLP.

Для более сложной конфигурации мы предлагаем [документацию по коллекторам OpenTelemetry](https://opentelemetry.io/docs/collector/).

## Оптимизация вставок {#optimizing-inserts}

Чтобы добиться высокой производительности вставки при получении сильных гарантий согласованности, пользователи должны следовать простым правилам при вставке данных наблюдаемости в ClickHouse через коллектор ClickStack. При правильной настройке OTel.collector следующие правила должны быть простыми для исполнения. Это также помогает избежать [распространенных проблем](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse), с которыми сталкиваются пользователи при первом использовании ClickHouse.

### Пакетирование {#batching}

По умолчанию каждая вставка, отправленная в ClickHouse, вызывает немедленное создание части хранилища, содержащей данные из вставки вместе с другой метаинформацией, которую необходимо сохранить. Таким образом, отправка меньшего количества вставок, каждая из которых содержит больше данных, по сравнению с отправкой большего количества вставок, каждая из которых содержит меньше данных, уменьшит количество необходимых записей. Мы рекомендуем вставлять данные довольно крупными пакетами, как минимум, по 1000 строк за раз. Дополнительные сведения [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

По умолчанию вставки в ClickHouse являются синхронными и идемпотентными, если они идентичны. Для таблиц, принадлежащих семейству движков merge tree, ClickHouse будет по умолчанию автоматически [удалять дубликаты вставок](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). Это означает, что вставки являются толерантными в случаях, таких как следующие:

- (1) Если узел, получающий данные, имеет проблемы, запрос на вставку завершится по времени (или выдаст более конкретную ошибку) и не получит подтверждения.
- (2) Если данные были записаны узлом, но подтверждение не может быть возвращено отправителю запроса из-за сетевых перебоев, отправитель либо получит тайм-аут, либо сетевую ошибку.

С точки зрения коллектора (1) и (2) может быть трудно различить. Однако в обоих случаях неподтвержденная вставка может быть немедленно повторена. При условии, что повторный запрос вставки содержит те же данные в том же порядке, ClickHouse автоматически проигнорирует повторный запрос вставки, если оригинальная (неподтвержденная) вставка успешно выполнена.

По этой причине ClickStack распределение OTel.collector использует [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md). Это гарантирует, что вставки отправляются как согласованные пакеты строк, удовлетворяющие указанным выше требованиям. Если ожидается, что коллектор будет иметь высокую пропускную способность (событий в секунду), и как минимум 5000 событий могут быть отправлены в каждой вставке, это обычно единственное пакетирование, требуемое в конвейере. В этом случае коллектор сбросит пакеты до достижения `timeout` процессора пакетирования, гарантируя, что задержка в конце конвейера остается низкой, а размеры пакетов - согласованными.

### Использование асинхронных вставок {#use-asynchronous-inserts}

Как правило, пользователи вынуждены отправлять меньшие пакеты, когда пропускная способность коллектора низка, но они все равно ожидают, что данные достигнут ClickHouse с минимальной задержкой. В этом случае при истечении `timeout` процессора пакетирования отправляются небольшие пакеты. Это может вызвать проблемы и, когда требуется асинхронная вставка. Эта проблема возникает редко, если пользователи отправляют данные в коллектор ClickStack, который действует как шлюз - действуя как агрегаторы, они смягчают эту проблему - см. [Роли коллектора](#collector-roles).

Если обеспечить большие пакеты невозможно, пользователи могут делегировать пакетирование ClickHouse, используя [асинхронные вставки](/best-practices/selecting-an-insert-strategy#asynchronous-inserts). С асинхронными вставками данные сначала вставляются в буфер, а затем записываются в хранилище базы данных позже или асинхронно.

<Image img={observability_6} alt="Async inserts" size="md"/>

При [включенных асинхронных вставках](/optimize/asynchronous-inserts#enabling-asynchronous-inserts) когда ClickHouse ① получает запрос на вставку, данные запроса ② немедленно записываются в буфер в оперативной памяти. Когда ③ происходит следующий сброс буфера, данные буфера сортируются [/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns] и записываются как часть в хранилище базы данных. Обратите внимание, что данные не могут быть ифицированы запросами, прежде чем они будут сброшены в БД; сброс буфера [настраивается](/optimize/asynchronous-inserts).

Чтобы включить асинхронные вставки для коллектора, добавьте `async_insert=1` в строку подключения. Мы рекомендуем пользователям использовать `wait_for_async_insert=1` (по умолчанию) для получения гарантий доставки - смотрите [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) для получения дополнительных подробностей.

Данные из асинхронной вставки вставляются после сброса буфера ClickHouse. Это происходит либо после превышения [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size), либо после [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) миллисекунд с момента первого запроса INSERT. Если `async_insert_stale_timeout_ms` установлен на ненулевое значение, данные вставляются после `async_insert_stale_timeout_ms миллисекунд` с момента последнего запроса. Пользователи могут настраивать эти параметры, чтобы контролировать задержку в конце своего конвейера. Дополнительные настройки, которые могут быть использованы для регулировки сброса буфера, задокументированы [здесь](/operations/settings/settings#async_insert). Как правило, значения по умолчанию являются адекватными.

:::note Рассмотрите возможность адаптивных асинхронных вставок
В случаях, когда используется небольшое количество агентов с низкой пропускной способностью, но строгими требованиями к задержке, [адаптивные асинхронные вставки](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) могут быть полезными. Как правило, они не применяются в сценариях наблюдаемости с высоким уровнем пропускной способности, как видно на примере ClickHouse.
:::

Наконец, предыдущее поведение дедупликации, связанное с синхронными вставками в ClickHouse, не включено по умолчанию при использовании асинхронных вставок. При необходимости смотрите настройку [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Полные детали конфигурации этой функции могут быть найдены на этой [странице документации](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), или в глубоком блоге [посте](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).

## Масштабирование {#scaling}

Коллектор ClickStack OTel работает как экземпляр шлюза - см. [Роли коллектора](#collector-roles). Они предоставляют отдельный сервис, обычно на центр обработки данных или регион. Эти экземпляры принимают события от приложений (или других коллекторов в роли агентов) через единую точку доступа OTLP. Обычно развертывается набор экземпляров коллектора, с использованием готового балансировщика нагрузки для распределения нагрузки между ними.

<Image img={clickstack_with_gateways} alt="Scaling with gateways" size="lg"/>

Цель этой архитектуры - разгрузить ресурсоемкую обработку от агентов, минимизируя их потребление ресурсов. Эти шлюзы ClickStack могут выполнять преобразования, которые в противном случае потребовалось бы выполнять агентам. Более того, агрегируя события от многочисленных агентов, шлюзы могут гарантировать, что большие пакеты отправляются в ClickHouse - что позволяет эффективно вставлять данные. Эти коллекторы-шлюзы могут легко масштабироваться, поскольку в них добавляются новые агенты и источники SDK, и увеличивается пропускная способность событий.

### Добавление Kafka {#adding-kafka}

Читатели могут заметить, что вышеуказанные архитектуры не используют Kafka в качестве очереди сообщений.

Использование очереди Kafka в качестве буфера сообщений - это популярный шаблон проектирования, используемый в архитектурах логирования, который был популяризирован стеком ELK. Он предоставляет несколько преимуществ: в первую очередь, он помогает обеспечить более сильные гарантии доставки сообщений и помогает справляться с обратным давлением. Сообщения отправляются от агентов сбора в Kafka и записываются на диск. В теории кластеризованный экземпляр Kafka должен обеспечивать высокую пропускную способность буфера сообщений, поскольку он несет меньшие вычислительные затраты на запись данных линейно на диск, чем на разбор и обработку сообщения. Например, в Elastic токенизация и индексирование создают значительные накладные расходы. Перемещая данные от агентов, вы также уменьшаете риск потери сообщений в результате ротации логов на источнике. Наконец, он предлагает некоторые возможности репликации сообщений и межрегиональной репликации, которые могут быть привлекательны для некоторых сценариев использования.

Тем не менее, ClickHouse может обрабатывать вставку данных очень быстро - миллионы строк в секунду на среднем оборудовании. Обратное давление со стороны ClickHouse редко наблюдается. Часто использование очереди Kafka означает увеличение архитектурной сложности и затрат. Если вы можете принять принцип, что логи не требуют тех же гарантий доставки, что транзакции в банке и другие критические данные, мы рекомендуем избегать сложности Kafka.

Однако, если вам требуются высокие гарантии доставки или возможность воспроизведения данных (возможно, для нескольких источников), Kafka может быть полезным архитектурным дополнением.

<Image img={observability_8} alt="Adding kafka" size="lg"/>

В этом случае агенты OTel могут быть настроены для отправки данных в Kafka через [экспортер Kafka](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). Экземпляры шлюза, в свою очередь, принимают сообщения, используя [приемник Kafka](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). Мы рекомендуем документацию Confluent и OTel для получения дополнительной информации.

:::note Конфигурация OTel.collector
Распределение ClickStack OpenTelemetry коллектора не может быть использовано с Kafka, поскольку это требует изменения конфигурации. Пользователи будут вынуждены развернуть стандартный OTel.collector с использованием экспортёра ClickHouse.
:::

## Оценка ресурсов {#estimating-resources}

Требования к ресурсам для OTel.collector будут зависеть от пропускной способности событий, размера сообщений и объема выполняемой обработки. Проект OpenTelemetry поддерживает [бенчмарки, которые пользователи](https://opentelemetry.io/docs/collector/benchmarks/) могут использовать для оценки ресурсоемкости.

[По нашему опыту](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), экземпляр шлюза ClickStack с 3 ядрами и 12 ГБ ОЗУ может обработать около 60 000 событий в секунду. Это предполагает минимальную обработку на трубопроводе, ответственной за переименование полей и отсутствие регулярных выражений.

Для экземпляров агентов, отвечающих за отправку событий в шлюз, и лишь устанавливающих временную метку на событие, мы рекомендуем пользователям ориентироваться по предполагаемым логам в секунду. Следующие значения представляют собой приблизительные цифры, которые пользователи могут использовать в качестве отправной точки:

| Скорость логирования | Ресурсы для коллектора агента |
|----------------------|-------------------------------|
| 1k/секунду          | 0.2CPU, 0.2GiB               |
| 5k/секунду          | 0.5 CPU, 0.5GiB              |
| 10k/секунду         | 1 CPU, 1GiB                  |

## Поддержка JSON {#json-support}

<BetaBadge/>

ClickStack имеет бета-версию поддержки [типа JSON](/interfaces/formats/JSON) с версии `2.0.4`.

### Преимущества типа JSON {#benefits-json-type}

Тип JSON предлагает следующие преимущества пользователям ClickStack:

- **Сохранение типа** - Числа остаются числами, логические значения остаются логическими — больше не требуется преобразовывать всё в строки. Это означает меньше преобразований, более простые запросы и более точную агрегацию.
- **Столбцы на уровне пути** - Каждый JSON путь становится своим собственным подстолбцом, уменьшая ввод/вывод. Запросы читают только необходимые поля, обеспечивая значительное увеличение производительности по сравнению со старым типом Map, который требовал прочитать целый столбец, чтобы запросить конкретное поле.
- **Глубокая вложенность работает без проблем** - Естественно обрабатывать сложные, глубоко вложенные структуры без ручного упрощения (как это требует тип Map) и последующих ненужных функций JSONExtract.
- **Динамические, развивающиеся схемы** - Идеально подходит для данных наблюдаемости, где команды добавляют новые теги и атрибуты с течением времени. JSON автоматически обрабатывает эти изменения, без необходимости миграции схем. 
- **Быстрее запросы, меньше памяти** - Типичные агрегации по атрибутам, таким как `LogAttributes`, показывают на 5–10 раз меньше считываемых данных и резкое увеличение скорости, сокращая как время выполнения запроса, так и пиковое использование памяти.
- **Простое управление** - Нет необходимости предварительно материализовать столбцы для достижения производительности. Каждое поле становится своим собственным подстолбцом, обеспечивая ту же скорость, что и родные столбцы ClickHouse.

### Включение поддержки JSON {#enabling-json-support}

Чтобы включить эту поддержку для коллектора, установите переменную окружения `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` на любом развертывании, которое включает коллектор. Это гарантирует, что схемы создаются в ClickHouse с использованием типа JSON.

:::note Поддержка HyperDX
Чтобы запросить тип JSON, поддержка также должна быть включена в слое приложения HyperDX через переменную окружения `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`.
:::

Например:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

### Миграция от схем на основе карты к типу JSON {#migrating-from-map-based-schemas-to-json}

:::important Обратная совместимость
Тип [JSON](/interfaces/formats/JSON) не является обратно совместимым с существующими схемами, основанными на картах. Новые таблицы будут создаваться с использованием типа `JSON`.
:::

Для миграции от схем, основанных на картах, выполните следующие шаги:

<VerticalStepper headerLevel="h4">

#### Остановите OTel.collector {#stop-the-collector}

#### Переименуйте существующие таблицы и обновите источники {#rename-existing-tables-sources}

Переименуйте существующие таблицы и обновите источники данных в HyperDX. 

Например:

```sql
RENAME TABLE otel_logs TO otel_logs_map;
RENAME TABLE otel_metrics TO otel_metrics_map;
```

#### Разверните коллектор  {#deploy-the-collector}

Разверните коллектор с установленной переменной `OTEL_AGENT_FEATURE_GATE_ARG`.

#### Перезапустите контейнер HyperDX с поддержкой схемы JSON {#restart-the-hyperdx-container}

```shell
export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
```

#### Создайте новые источники данных {#create-new-data-sources}

Создайте новые источники данных в HyperDX, указывающие на таблицы JSON.

</VerticalStepper>

#### Миграция существующих данных (необязательно) {#migrating-existing-data}

Чтобы переместить старые данные в новые таблицы JSON:

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
Рекомендуется только для наборов данных меньше ~10 миллиардов строк. Данные, ранее сохраненные с типом Map, не сохраняли точность типов (все значения были строками). В результате эти старые данные будут отображаться как строки в новой схеме, пока они не будут устаревшими, требуя некоторого приведения типов на фронтенде. Тип для новых данных будет сохранен с типом JSON.
:::
