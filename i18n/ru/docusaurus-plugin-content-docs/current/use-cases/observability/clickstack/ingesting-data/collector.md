---
slug: /use-cases/observability/clickstack/ingesting-data/otel-collector
pagination_prev: null
pagination_next: null
description: 'Коллектор OpenTelemetry для ClickStack — стек наблюдаемости ClickHouse'
sidebar_label: 'Коллектор OpenTelemetry'
title: 'Коллектор OpenTelemetry ClickStack'
doc_type: 'guide'
toc_max_heading_level: 2
keywords: ['ClickStack', 'коллектор OpenTelemetry', 'наблюдаемость ClickHouse', 'конфигурация коллектора OTel', 'OpenTelemetry для ClickHouse']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import clickstack_with_gateways from '@site/static/images/use-cases/observability/clickstack-with-gateways.png';
import clickstack_with_kafka from '@site/static/images/use-cases/observability/clickstack-with-kafka.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ExtendingConfig from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ingesting-data/_snippets/_extending_config.md';

На этой странице представлена подробная информация по настройке официального коллектора OpenTelemetry (OTel) для ClickStack.


## Роли коллектора \{#collector-roles\}

Коллекторы OpenTelemetry могут быть развернуты в двух основных ролях:

- **Agent** — экземпляры Agent собирают данные на периферии, например на серверах или узлах Kubernetes, либо принимают события непосредственно от приложений, инструментированных с помощью OpenTelemetry SDK. В последнем случае экземпляр Agent запускается вместе с приложением или на том же хосте, что и приложение (например, как sidecar или ДемонСет). Экземпляры Agent могут либо отправлять свои данные напрямую в ClickHouse, либо в экземпляр Gateway. В первом случае это называется [паттерн развертывания Agent](https://opentelemetry.io/docs/collector/deployment/agent/). 

- **Gateway** — экземпляры Gateway предоставляют автономный сервис (например, Развертывание в Kubernetes), как правило, на кластер, дата-центр или регион. Они принимают события от приложений (или других коллекторов, работающих как Agents) через единую OTLP-конечную точку. Обычно разворачивается группа экземпляров Gateway, при этом готовый балансировщик нагрузки используется для распределения нагрузки между ними. Если все Agents и приложения отправляют свои сигналы на эту единую конечную точку, это часто называют [паттерн развертывания Gateway](https://opentelemetry.io/docs/collector/deployment/gateway/). 

**Важно: Коллектор, включая вариант по умолчанию в поставке ClickStack, предполагает [роль Gateway, описанную ниже](#collector-roles), получая данные от Agents или SDK.**

Пользователи, развертывающие OTel collector в роли Agent, обычно используют [стандартную contrib-сборку коллектора](https://github.com/open-telemetry/opentelemetry-collector-contrib), а не версию ClickStack, но могут свободно применять и другие технологии, совместимые с OTLP, такие как [Fluentd](https://www.fluentd.org/) и [Vector](https://vector.dev/).

## Развертывание коллектора \{#configuring-the-collector\}

<br/>

<Tabs groupId="otel-collector">
  <TabItem value="managed-clickstack" label="Управляемый ClickStack" default>
    Мы [рекомендуем использовать официальный дистрибутив коллектора ClickStack](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector) в роли шлюза при отправке данных в Managed ClickStack, когда это возможно. Если вы решите развернуть свой собственный коллектор, убедитесь, что он включает [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).

    Чтобы развернуть дистрибутив ClickStack OTel-коннектора в режиме standalone, выполните следующую команду docker:

    ```shell
    docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
    ```

    :::note Обновление имени образа
    Образы ClickStack теперь публикуются как `clickhouse/clickstack-*` (ранее `docker.hyperdx.io/hyperdx/*`).
    :::

    Обратите внимание, что мы можем изменить целевой экземпляр ClickHouse, задав переменные окружения `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USERNAME` и `CLICKHOUSE_PASSWORD`. Значение `CLICKHOUSE_ENDPOINT` должно быть полным HTTP-эндпоинтом ClickHouse Cloud, включая протокол и порт — например, `https://99rr6dm6v3.us-central1.gcp.clickhouse.cloud:8443`.

    Подробнее о получении учётных данных Managed ClickStack см. [здесь](/cloud/guides/sql-console/gather-connection-details).

    :::note Пользователь для продакшена
    В продакшене следует использовать пользователя с [подходящими учётными данными](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user).
    :::

    ### Изменение конфигурации

    #### Настройка экземпляра Managed ClickStack

    Все Docker-образы, включающие OpenTelemetry collector, можно настроить для использования экземпляра Managed ClickStack через переменные окружения `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USERNAME` и `CLICKHOUSE_PASSWORD`:

    Например, образ «all-in-one»:

    ```shell
    export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
    export CLICKHOUSE_USER=<CLICKHOUSE_USER>
    export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
    ```

    ```shell
    docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
    ```

    <ExtendingConfig />

    #### Docker Compose

    При использовании Docker Compose изменяйте конфигурацию коллектора, используя те же переменные окружения, что и выше:

    ```yaml
      otel-collector:
        image: hyperdx/hyperdx-otel-collector
        environment:
          CLICKHOUSE_ENDPOINT: 'https://mxl4k3ul6a.us-east-2.aws.clickhouse-staging.com:8443'
          HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
          CLICKHOUSE_USER: 'default'
          CLICKHOUSE_PASSWORD: 'password'
          CUSTOM_OTELCOL_CONFIG_FILE: '/etc/otelcol-contrib/custom.config.yaml'
        ports:
          - '13133:13133' # health_check extension
          - '24225:24225' # fluentd receiver
          - '4317:4317' # OTLP gRPC receiver
          - '4318:4318' # OTLP http receiver
          - '8888:8888' # metrics extension
        volumes:
          - ./custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        restart: always
        networks:
          - internal
    ```
  </TabItem>

  <TabItem value="oss-clickstack" label="Open Source-версия ClickStack" default>
    Если вы управляете собственным коллектором OpenTelemetry в отдельном развертывании — например, при использовании дистрибутива только с HyperDX, — мы [по‑прежнему рекомендуем использовать официальный ClickStack‑дистрибутив коллектора](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector) для использования в роли шлюза, когда это возможно, но если вы решите использовать собственный, убедитесь, что он включает [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).

    Чтобы развернуть ClickStack‑дистрибутив OTel connector в автономном режиме, выполните следующую команду docker:

    ```shell
    docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
    ```

    :::note Обновление имени образа
    Образы ClickStack теперь публикуются как `clickhouse/clickstack-*` (ранее `docker.hyperdx.io/hyperdx/*`).
    :::

    Обратите внимание, что целевой экземпляр ClickHouse можно переопределить с помощью переменных окружения `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USERNAME` и `CLICKHOUSE_PASSWORD`. Значение `CLICKHOUSE_ENDPOINT` должно быть полным HTTP-эндпоинтом ClickHouse, включая протокол и порт — например, `http://localhost:8123`.

    **Эти переменные окружения могут использоваться с любыми Docker-дистрибутивами, которые содержат коннектор.**

    `OPAMP_SERVER_URL` должен указывать на ваше развёртывание HyperDX — например, `http://localhost:4320`. HyperDX по умолчанию предоставляет сервер OpAMP (Open Agent Management Protocol) по адресу `/v1/opamp` на порту `4320`. Убедитесь, что этот порт проброшен из контейнера, в котором запущен HyperDX (например, с помощью `-p 4320:4320`).

    :::note Открытие и подключение к порту OpAMP
    Чтобы коллектор смог подключиться к порту OpAMP, этот порт должен быть проброшен из контейнера HyperDX, например `-p 4320:4320`. Для локального тестирования пользователи OSX могут затем задать `OPAMP_SERVER_URL=http://host.docker.internal:4320`. Пользователи Linux могут запустить контейнер коллектора с опцией `--network=host`.
    :::

    :::note Пользователь для production-среды
    В production-среде следует использовать пользователя с [подходящими учетными данными](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user).
    :::

    ### Изменение конфигурации

    #### Настройка экземпляра ClickHouse

    Все образы Docker, которые включают коллектор OpenTelemetry, можно настроить на использование экземпляра ClickHouse через переменные окружения `OPAMP_SERVER_URL`, `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USERNAME` и `CLICKHOUSE_PASSWORD`:

    Например, образ «all-in-one»:

    ```shell
    export OPAMP_SERVER_URL=<OPAMP_SERVER_URL>
    export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
    export CLICKHOUSE_USER=<CLICKHOUSE_USER>
    export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
    ```

    ```shell
    docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
    ```

    <ExtendingConfig />

    #### Docker Compose

    При использовании Docker Compose изменяйте конфигурацию коллектора, используя те же переменные окружения, что и выше:

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
  </TabItem>
</Tabs>

## Обеспечение безопасности коллектора {#securing-the-collector}

<Tabs groupId="securing-collector">

<TabItem value="managed-clickstack" label="Managed ClickStack" default>

По умолчанию ClickStack OpenTelemetry Collector не защищён при развертывании вне Open Source‑дистрибутивов и не требует аутентификации на своих OTLP‑портах.

Чтобы защитить ингестию, укажите токен аутентификации при развертывании коллектора с помощью переменной окружения `OTLP_AUTH_TOKEN`. Например:

```sh
export CLICKHOUSE_ENDPOINT=<HTTPS_ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
export OTLP_AUTH_TOKEN="a_very_secure_string"

docker run \
  -e OTLP_AUTH_TOKEN=${OTLP_AUTH_TOKEN} \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -p 4317:4317 \
  -p 4318:4318 \
  clickhouse/clickstack-otel-collector:latest
```

Дополнительно мы рекомендуем:

- Настроить коллектор на взаимодействие с ClickHouse по HTTPS.
- Создать отдельного пользователя для приёма данных с ограниченными правами — см. ниже.
- Включить TLS для конечной точки OTLP, обеспечив шифрованное взаимодействие между SDKs/агентами и коллектором. Это можно настроить через [пользовательскую конфигурацию коллектора](#extending-collector-config).

### Создание пользователя для приёма данных {#creating-an-ingestion-user}

Мы рекомендуем создать отдельную базу данных и пользователя для OTel collector, чтобы выполнять ингестию в Managed ClickStack. У этого пользователя должны быть права на создание и вставку данных в [таблицы, создаваемые и используемые ClickStack](/use-cases/observability/clickstack/ingesting-data/schemas). 

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

Предполагается, что коллектор настроен на использование базы данных `otel`. Это можно контролировать через переменную окружения `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`. Передайте её в коллектор [аналогично другим переменным окружения](#modifying-otel-collector-configuration).

</TabItem>

<TabItem value="oss-clickstack" label="Open Source ClickStack" default>

Дистрибутив ClickStack с коллектором OpenTelemetry включает встроенную поддержку OpAMP (Open Agent Management Protocol), который используется для безопасной конфигурации и управления конечной точкой OTLP. При запуске пользователям необходимо указать переменную окружения `OPAMP_SERVER_URL` — она должна указывать на приложение HyperDX, которое предоставляет OpAMP API по адресу `/v1/opamp`.

Эта интеграция гарантирует, что конечная точка OTLP защищена с помощью автоматически сгенерированного ключа API для приёма данных (ingestion API key), создаваемого при развертывании приложения HyperDX. Все телеметрические данные, отправляемые в коллектор, должны включать этот API key для аутентификации. Найти ключ можно в приложении HyperDX в разделе `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ключи приёма данных" size="lg"/>

Для дополнительной защиты вашего развертывания мы рекомендуем:

- Настроить коллектор на взаимодействие с ClickHouse по HTTPS.
- Создать отдельного пользователя для приёма данных с ограниченными правами — см. ниже.
- Включить TLS для конечной точки OTLP, обеспечив шифрованное взаимодействие между SDKs/агентами и коллектором. Это можно настроить через [пользовательскую конфигурацию коллектора](#extending-collector-config).

### Создание пользователя для приёма данных {#creating-an-ingestion-user-oss}

Мы рекомендуем создать отдельную базу данных и пользователя для OTel collector, чтобы выполнять ингестию в ClickHouse. У этого пользователя должны быть права на создание и вставку данных в [таблицы, создаваемые и используемые ClickStack](/use-cases/observability/clickstack/ingesting-data/schemas). 

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

Предполагается, что коллектор настроен на использование базы данных `otel`. Это можно контролировать через переменную окружения `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`. Передайте её в образ, в котором запущен коллектор, [аналогично другим переменным окружения](#modifying-otel-collector-configuration).

</TabItem>
</Tabs>

## Обработка — фильтрация, трансформация и обогащение {#processing-filtering-transforming-enriching}

Пользователям в большинстве случаев потребуется фильтровать, трансформировать и обогащать сообщения событий во время ингестии. Поскольку конфигурацию коннектора ClickStack нельзя изменить, мы рекомендуем пользователям, которым требуется дополнительная фильтрация и обработка событий, либо:

- Развернуть собственную версию OTel collector, выполняющего фильтрацию и обработку, отправляя события в ClickStack collector по OTLP для ингестии в ClickHouse.
- Развернуть собственную версию OTel collector и отправлять события напрямую в ClickHouse с использованием ClickHouse exporter.

Если обработка выполняется с использованием OTel collector, мы рекомендуем выполнять трансформации на экземплярах gateway и минимизировать объём работ, выполняемых на экземплярах agent. Это позволит свести к минимуму потребление ресурсов агентами на периферии, работающими на серверах. Как правило, мы видим, что пользователи выполняют только фильтрацию (для минимизации ненужного сетевого трафика), установку временных меток (через операторы) и обогащение, которое требует контекста в агентах. Например, если экземпляры gateway находятся в другом Kubernetes‑кластере, k8s‑обогащение должно выполняться в агенте.

OpenTelemetry поддерживает следующие возможности обработки и фильтрации, которые вы можете использовать:

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

Обратите внимание на необходимость добавлять [заголовок авторизации с вашим ключом API для приёма данных API key](#securing-the-collector) во все OTLP-запросы.

Для более сложной конфигурации мы рекомендуем обратиться к [документации по OpenTelemetry collector](https://opentelemetry.io/docs/collector/).

## Оптимизация вставок {#optimizing-inserts}

Чтобы обеспечить высокую производительность операций вставки при одновременном соблюдении строгих гарантий согласованности, вам следует придерживаться нескольких простых правил при вставке данных обсервабилити в ClickHouse через коллектор ClickStack. При корректной настройке OTel collector следовать этим правилам должно быть несложно. Это также позволяет избежать [распространённых проблем](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse), с которыми пользователи сталкиваются при первом знакомстве с ClickHouse.

### Пакетирование {#batching}

По умолчанию каждый запрос `INSERT`, отправленный в ClickHouse, приводит к немедленному созданию части данных, содержащей данные из этого `INSERT` вместе с другой метаинформацией, которую нужно сохранять. Поэтому отправка меньшего количества `INSERT`‑запросов, каждый из которых содержит больше данных, по сравнению с отправкой большего количества `INSERT`‑запросов с меньшим объемом данных, уменьшит число необходимых операций записи. Мы рекомендуем вставлять данные достаточно крупными пакетами — как минимум по 1 000 строк за раз. Дополнительные подробности приведены [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

По умолчанию вставки в ClickHouse являются синхронными и идемпотентными, если данные идентичны. Для таблиц семейства движков MergeTree ClickHouse по умолчанию автоматически [дедуплицирует вставки](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). Это означает, что вставки устойчивы к сбоям в следующих случаях:

- (1) Если у узла, принимающего данные, возникают проблемы, запрос `INSERT` завершится по таймауту (или выдаст более специфичную ошибку) и не получит подтверждения.
- (2) Если данные были записаны узлом, но подтверждение не может быть возвращено отправителю запроса из‑за перебоев в сети, отправитель получит либо таймаут, либо сетевую ошибку.

С точки зрения коллектора различить (1) и (2) может быть сложно. Однако в обоих случаях неподтвержденную вставку можно просто немедленно повторить. Пока повторный запрос `INSERT` содержит те же данные в том же порядке, ClickHouse автоматически проигнорирует повторную вставку, если исходная (неподтвержденная) вставка уже была успешно выполнена.

По этой причине дистрибутив ClickStack с OTel collector использует [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md). Это гарантирует, что вставки отправляются как согласованные пакеты строк, удовлетворяющие указанным выше требованиям. Если от коллектора ожидается высокая пропускная способность (событий в секунду) и в каждой вставке можно отправлять как минимум 5 000 событий, этого пакетирования обычно достаточно для всего конвейера. В этом случае коллектор будет отправлять пакеты до того, как будет достигнут `timeout` batch processor, обеспечивая низкую сквозную задержку конвейера и стабильный размер пакетов.

### Используйте асинхронные вставки \{#use-asynchronous-inserts\}

Обычно пользователи вынуждены отправлять меньшие батчи, когда пропускная способность коллектора низкая, при этом они все равно ожидают доставки данных в ClickHouse с минимальной сквозной задержкой. В этом случае маленькие батчи отправляются при истечении `timeout` у batch processor. Это может вызывать проблемы и в таких сценариях требуются асинхронные вставки. Такая ситуация встречается редко, если вы отправляете данные в коллектор ClickStack, работающий в роли Gateway: выступая в качестве агрегатора, он сглаживает эту проблему — см. [Collector roles](#collector-roles).

Если невозможно гарантировать большие батчи, вы можете делегировать пакетирование ClickHouse, используя [Asynchronous Inserts](/best-practices/selecting-an-insert-strategy#asynchronous-inserts). При асинхронных вставках данные сначала вставляются в буфер, а затем записываются в хранилище базы данных позже, то есть асинхронно.

<Image img={observability_6} alt="Асинхронные вставки" size="md"/>

При [включенных асинхронных вставках](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), когда ClickHouse ① получает запрос INSERT, данные запроса ② сразу же записываются сначала во внутренний буфер в памяти. Когда ③ происходит следующий сброс (flush) буфера, данные из буфера [сортируются](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) и записываются как part в хранилище базы данных. Обратите внимание, что данные недоступны для запросов до тех пор, пока не будут сброшены в хранилище базы данных; параметры сброса буфера [настраиваются](/optimize/asynchronous-inserts).

Чтобы включить асинхронные вставки для коллектора, добавьте `async_insert=1` в строку подключения. Мы рекомендуем использовать `wait_for_async_insert=1` (значение по умолчанию), чтобы получить гарантии доставки — см. [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) подробности.

Данные из асинхронной вставки записываются после того, как буфер ClickHouse будет сброшен. Это происходит либо после превышения [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size), либо по истечении [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) миллисекунд с момента первого запроса INSERT. Если `async_insert_stale_timeout_ms` установлено в ненулевое значение, данные вставляются по прошествии `async_insert_stale_timeout_ms` миллисекунд с момента последнего запроса. Вы можете настраивать эти параметры для управления сквозной задержкой вашего конвейера. Дополнительные параметры, которые можно использовать для настройки сброса буфера, задокументированы [здесь](/operations/settings/settings#async_insert). Как правило, значения по умолчанию являются оптимальными.

:::note Рассмотрите адаптивные асинхронные вставки
В случаях, когда используется небольшое количество агентов с низкой пропускной способностью, но жесткими требованиями к сквозной задержке, могут быть полезны [адаптивные асинхронные вставки](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts). Как правило, они неприменимы к высоконагруженным сценариям обсервабилити, характерным для ClickHouse.
:::

Наконец, прежнее поведение дедупликации, связанное с синхронными вставками в ClickHouse, по умолчанию не включено при использовании асинхронных вставок. При необходимости см. параметр [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Полные сведения по настройке этой функции можно найти на этой [странице документации](/optimize/asynchronous-inserts#enabling-asynchronous-inserts) или в подробной [публикации в блоге](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).

## Масштабирование {#scaling}

OTel collector в составе ClickStack действует как экземпляр шлюза (Gateway) — см. раздел [Collector roles](#collector-roles). Это автономный сервис, как правило, по одному на каждый дата-центр или регион. Такие экземпляры получают события от приложений (или других коллекторов в роли агента) через единый OTLP endpoint. Обычно разворачивается несколько экземпляров коллектора, а стандартный балансировщик нагрузки используется для распределения трафика между ними.

<Image img={clickstack_with_gateways} alt="Масштабирование с помощью шлюзов" size="lg"/>

Цель этой архитектуры — разгрузить агентов от вычислительно затратной обработки, тем самым минимизируя их потребление ресурсов. Эти шлюзы ClickStack могут выполнять задачи трансформации, которые в противном случае пришлось бы выполнять агентам. Кроме того, агрегируя события от множества агентов, шлюзы могут отправлять в ClickHouse крупные партии событий, обеспечивая эффективную вставку данных. Эти коллекторы-шлюзы можно легко масштабировать по мере добавления новых агентов и источников SDK и роста пропускной способности событий. 

### Добавление Kafka {#adding-kafka}

Читатели могут заметить, что приведённые выше архитектуры не используют Kafka в качестве очереди сообщений.

Использование очереди Kafka как буфера сообщений — популярный шаблон проектирования, часто встречающийся в архитектурах логирования и получивший широкое распространение благодаря стеку ELK. Он даёт несколько преимуществ: прежде всего, помогает обеспечить более строгие гарантии доставки сообщений и упростить обработку обратного давления. Сообщения отправляются от агентов сбора в Kafka и записываются на диск. Теоретически кластер Kafka должен обеспечивать высокопроизводительный буфер сообщений, поскольку при последовательной записи данных на диск вычислительные затраты ниже, чем при разборе и обработке сообщений. В Elastic, например, токенизация и индексация создают значительные накладные расходы. Перемещая данные от агентов, вы также снижаете риск потери сообщений из‑за ротации логов на источнике. Наконец, Kafka предоставляет возможности повторного считывания сообщений и межрегиональной репликации, что может быть привлекательно для некоторых сценариев использования.

Однако ClickHouse способен очень быстро вставлять данные — миллионы строк в секунду на умеренном оборудовании. Обратное давление со стороны ClickHouse возникает редко. Часто использование очереди Kafka приводит к росту сложности архитектуры и затрат. Если вы можете исходить из принципа, что логи не нуждаются в тех же гарантиях доставки, что банковские транзакции и другие критически важные данные, мы рекомендуем избегать усложнения архитектуры за счёт Kafka.

Тем не менее, если вам нужны высокие гарантии доставки или возможность повторного воспроизведения данных (потенциально в несколько приёмников), Kafka может быть полезным архитектурным дополнением.

<Image img={observability_8} alt="Добавление Kafka" size="lg"/>

В этом случае агенты OTel можно настроить на отправку данных в Kafka через [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). В свою очередь, инстансы gateway потребляют сообщения с помощью [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). За дополнительными подробностями рекомендуем документацию Confluent и OTel.

:::note Конфигурация OTel collector
Дистрибутив ClickStack OpenTelemetry collector можно настроить для работы с Kafka с помощью [кастомной конфигурации коллектора](#extending-collector-config).
:::

## Оценка ресурсов {#estimating-resources}

Требования к ресурсам для OTel collector будут зависеть от пропускной способности событий, размера сообщений и объёма выполняемой обработки. Проект OpenTelemetry ведёт [бенчмарки](https://opentelemetry.io/docs/collector/benchmarks/), которыми пользователи могут воспользоваться для оценки требований к ресурсам.

[Согласно нашему опыту](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), экземпляр шлюза ClickStack с 3 ядрами и 12 ГБ ОЗУ может обрабатывать около 60&nbsp;тыс. событий в секунду. Это предполагает минимальный конвейер обработки, отвечающий только за переименование полей, без регулярных выражений.

Для экземпляров агентов, отвечающих за отправку событий на шлюз и только устанавливающих временную метку события, мы рекомендуем подбирать ресурсы на основе ожидаемого числа логов в секунду. Ниже приведены примерные значения, которые можно использовать в качестве отправной точки:

| Скорость логирования | Ресурсы для агентского коллектора |
|--------------|------------------------------|
| 1k/сек       | 0.2 CPU, 0.2 GiB            |
| 5k/сек       | 0.5 CPU, 0.5 GiB            |
| 10k/сек      | 1 CPU, 1 GiB                |

## Поддержка JSON \{#json-support\}

<BetaBadge/>

Начиная с версии `2.0.4`, ClickStack в бета-режиме поддерживает [тип JSON](/interfaces/formats/JSON).

:::warning Функция в бета-версии
Поддержка типа JSON в **ClickStack** является **функцией в бета-версии**. Хотя сам тип JSON готов к промышленной эксплуатации в ClickHouse 25.3+, его интеграция в ClickStack все еще активно развивается и может иметь ограничения, изменяться в будущем или содержать ошибки.
:::

### Преимущества типа JSON \{#benefits-json-type\}

Тип JSON предоставляет пользователям ClickStack следующие преимущества:

- **Сохранение типов** - Числа остаются числами, логические значения остаются логическими — больше не нужно превращать всё в строки. Это означает меньше приведений типов, более простые запросы и более точные агрегаты.
- **Столбцы на уровне путей** - Каждый JSON-путь становится отдельным подстолбцом, уменьшая объём операций ввода-вывода. Запросы считывают только нужные поля, обеспечивая существенный прирост производительности по сравнению со старым типом Map, который требовал чтения всего столбца для выборки одного конкретного поля.
- **Глубокая вложенность «просто работает»** - Естественная обработка сложных, глубоко вложенных структур без ручной развёртки (как это требовалось для типа Map) и последующего использования неудобных функций JSONExtract.
- **Динамические, эволюционирующие схемы** - Идеально для данных наблюдаемости, где команды со временем добавляют новые теги и атрибуты. JSON автоматически обрабатывает эти изменения без миграций схемы. 
- **Быстрые запросы, меньший объём памяти** - Типичные агрегаты по атрибутам вроде `LogAttributes` приводят к 5–10-кратному уменьшению объёма читаемых данных и существенному ускорению запросов, сокращая и время выполнения запросов, и пиковое потребление памяти.
- **Простое управление** - Нет необходимости заранее материализовывать столбцы ради производительности. Каждое поле становится отдельным подстолбцом, обеспечивая ту же скорость, что и нативные столбцы ClickHouse.

### Включение поддержки JSON \{#enabling-json-support\}

<Tabs groupId="json-support">

<TabItem value="managed-clickstack" label="Управляемый ClickStack" default>

Чтобы включить поддержку JSON в управляемом ClickStack, свяжитесь с нашей службой поддержки перед настройкой коллектора, описанной ниже. **Эта функция также должна быть включена в интерфейсе ClickStack (HyperDX) в ClickHouse Cloud.**

Чтобы включить эту поддержку для вашего коллектора, установите переменную окружения `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'`. Это гарантирует создание схем в ClickHouse с использованием типа JSON.

Например:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```

</TabItem>

<TabItem value="oss-clickstack" label="Open Source ClickStack" default>

Чтобы включить эту поддержку для коллектора, установите переменную окружения `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` в любом развертывании, где используется коллектор. Это гарантирует создание схем в ClickHouse с использованием типа JSON.

:::note Поддержка HyperDX
Чтобы выполнять запросы к типу JSON, поддержку также необходимо включить на уровне приложения HyperDX с помощью переменной окружения `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`.
:::

Например:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```

</TabItem>

</Tabs>

### Миграция со схем на основе Map к типу JSON {#migrating-from-map-based-schemas-to-json}

:::important Обратная совместимость
[Тип JSON](/interfaces/formats/JSON) **не совместим** с существующими схемами на основе Map. Включение этой функции приведёт к созданию новых таблиц с использованием типа `JSON` и требует ручной миграции данных.
:::

Чтобы выполнить миграцию со схем на основе Map, выполните следующие шаги:

<VerticalStepper headerLevel="h4">

#### Остановите OTel collector {#stop-the-collector}

#### Переименуйте существующие таблицы и обновите источники {#rename-existing-tables-sources}

Переименуйте существующие таблицы и обновите источники данных в HyperDX. 

Например:

```sql
RENAME TABLE otel_logs TO otel_logs_map;
RENAME TABLE otel_metrics TO otel_metrics_map;
```

#### Разверните OTel collector {#deploy-the-collector}

Разверните OTel collector с установленным параметром `OTEL_AGENT_FEATURE_GATE_ARG`.

#### Перезапустите контейнер HyperDX с поддержкой схемы JSON {#restart-the-hyperdx-container}

```shell
export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
```

#### Создайте новые источники данных {#create-new-data-sources}

Создайте новые источники данных в HyperDX, указывающие на таблицы с типом JSON.

</VerticalStepper>

#### Перенос существующих данных (необязательно) {#migrating-existing-data}

Чтобы перенести старые данные в новые таблицы формата JSON:

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
Рекомендуется только для наборов данных объемом менее ~10 миллиардов строк. Данные, ранее хранившиеся с типом Map, не сохраняли точность типов (все значения были строками). В результате эти старые данные будут отображаться как строки в новой схеме до тех пор, пока не будут вытеснены из хранения, что потребует дополнительного приведения типов на фронтенде. Тип для новых данных будет сохраняться при использовании типа JSON.
:::
