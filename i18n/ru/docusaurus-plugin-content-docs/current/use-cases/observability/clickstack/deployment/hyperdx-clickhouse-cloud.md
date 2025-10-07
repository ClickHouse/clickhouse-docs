---
'slug': '/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud'
'title': 'ClickHouse Cloud'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 1
'description': 'Развертывание ClickStack с ClickHouse Cloud'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import cloud_connect from '@site/static/images/use-cases/observability/clickhouse_cloud_connection.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';
import hyperdx_cloud_landing from '@site/static/images/use-cases/observability/hyperdx_cloud_landing.png';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';

<PrivatePreviewBadge/>

Этот вариант предназначен для пользователей, использующих ClickHouse Cloud. В этой модели развертывания как ClickHouse, так и HyperDX размещены в ClickHouse Cloud, минимизируя количество компонентов, которые пользователю необходимо самостоятельно развертывать.

Помимо сокращения управления инфраструктурой, эта модель развертывания обеспечивает интеграцию аутентификации с ClickHouse Cloud SSO/SAML. В отличие от развертываний на собственных серверах, также нет необходимости provision a MongoDB instance для хранения состояния приложения — такого как панели инструментов, сохраненные запросы, настройки пользователей и оповещения.

В этом режиме прием данных полностью зависит от пользователя. Вы можете загружать данные в ClickHouse Cloud, используя свой собственный размещенный сборщик OpenTelemetry, прямую загрузку из клиентских библиотек, нативные движки таблиц ClickHouse (такие как Kafka или S3), конвейеры ETL или ClickPipes — управляемый сервис загрузки ClickHouse Cloud. Этот подход предлагает самый простой и самый производительный способ работы с ClickStack.

### Подходит для {#suitable-for}

Эта модель развертывания идеальна в следующих сценариях:

1. У вас уже есть данные наблюдаемости в ClickHouse Cloud, и вы хотите визуализировать их с помощью HyperDX.
2. Вы управляете крупным развертыванием наблюдаемости и нуждаетесь в специализированной производительности и масштабируемости ClickStack с ClickHouse Cloud.
3. Вы уже используете ClickHouse Cloud для аналитики и хотите инструментировать свое приложение, используя библиотеки инструментирования ClickStack, отправляя данные в тот же кластер. В этом случае мы рекомендуем использовать [хранилища](/cloud/reference/warehouses) для изоляции вычислений для рабочих нагрузок наблюдаемости.

## Шаги развертывания {#deployment-steps}

Следующее руководство предполагает, что вы уже создали сервис ClickHouse Cloud. Если вы еще не создали сервис, следуйте шагу ["Создание сервиса ClickHouse"](/getting-started/quick-start/cloud#1-create-a-clickhouse-service) из нашего руководства по быстрому началу.

<VerticalStepper headerLevel="h3">

### Скопировать учетные данные сервиса (по желанию) {#copy-service-credentials}

**Если у вас уже есть события наблюдаемости, которые вы хотите визуализировать в вашем сервисе, этот шаг можно пропустить.**

Перейдите к основному списку сервисов и выберите сервис, в котором вы хотите визуализировать события наблюдаемости с помощью HyperDX.

Нажмите кнопку `Connect` в навигационном меню. Откроется модальное окно с учетными данными вашего сервиса и набором инструкций о том, как подключиться через различные интерфейсы и языки. Выберите `HTTPS` из выпадающего списка и запишите конечную точку подключения и учетные данные.

<Image img={cloud_connect} alt="Подключение ClickHouse Cloud" size="lg"/>

### Развертывание сборщика Open Telemetry (по желанию) {#deploy-otel-collector} 

**Если у вас уже есть события наблюдаемости, которые вы хотите визуализировать в вашем сервисе, этот шаг можно пропустить.**

Этот шаг гарантирует, что таблицы создаются с помощью схемы Open Telemetry (OTel), которая может быть использована для создания источника данных в HyperDX. Это также предоставляет OLTP-эндпоинт, который может быть использован для загрузки [примеров наборов данных](/use-cases/observability/clickstack/sample-datasets) и отправки событий OTel в ClickStack.

:::note Использование стандартного сборщика Open Telemetry
Следующие инструкции используют стандартное распределение сборщика OTel, а не распределение ClickStack. Последнее требует сервера OpAMP для настройки. Это в настоящее время не поддерживается в закрытой предварительной версии. Конфигурация ниже воспроизводит версию, используемую распределением ClickStack, предоставляя OTLP-эндпоинт, на который могут быть отправлены события.
:::

Скачайте конфигурацию для сборщика OTel:

```bash
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/deployment/_snippets/otel-cloud-config.yaml
```

<details>
<summary>otel-cloud-config.yaml</summary>

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

</details>

Разверните сборщик, используя следующую команду Docker, установив соответствующие переменные окружения в соответствии с ранее записанными настройками подключения и используя соответствующую команду ниже в зависимости от вашей операционной системы.

```bash

# modify to your cloud endpoint
export CLICKHOUSE_ENDPOINT=
export CLICKHOUSE_PASSWORD=

# optionally modify 
export CLICKHOUSE_DATABASE=default


# osx
docker run --rm -it \
  -p 4317:4317 -p 4318:4318 \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -e CLICKHOUSE_DATABASE=${CLICKHOUSE_DATABASE} \
  --user 0:0 \
  -v "$(pwd)/otel-cloud-collector.yaml":/etc/otel/config.yaml \
  -v /var/log:/var/log:ro \
  -v /private/var/log:/private/var/log:ro \
  otel/opentelemetry-collector-contrib:latest \
  --config /etc/otel/config.yaml


# linux command


# docker run --network=host --rm -it \

#   -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \

#   -e CLICKHOUSE_USER=default \

#   -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \

#   -e CLICKHOUSE_DATABASE=${CLICKHOUSE_DATABASE} \

#   --user 0:0 \

#   -v "$(pwd)/otel-cloud-config.yaml":/etc/otel/config.yaml \

#   -v /var/log:/var/log:ro \

#   -v /private/var/log:/private/var/log:ro \

#   otel/opentelemetry-collector-contrib:latest \

#   --config /etc/otel/config.yaml
```

:::note
В производственной среде мы рекомендуем создать выделенного пользователя для загрузки, ограничив права доступа к необходимым базам данных и таблицам. См. ["Пользователь базы данных и загрузки"](/use-cases/observability/clickstack/production#database-ingestion-user) для получения дополнительных сведений.
:::

### Подключение к HyperDX {#connect-to-hyperdx}

Выберите свой сервис, затем выберите `HyperDX` в левом меню.

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

Вам не нужно будет создавать пользователя, вы будете автоматически аутентифицированы, после чего вам будет предложено создать источник данных.

Для пользователей, желающих только изучить интерфейс HyperDX, мы рекомендуем наши [пример наборов данных](/use-cases/observability/clickstack/sample-datasets), которые используют данные OTel.

<Image img={hyperdx_cloud_landing} alt="ClickHouse Cloud HyperDX Landing" size="lg"/>

### Создание источника данных {#create-a-datasource}

HyperDX является нативным для Open Telemetry, но не эксклюзивен для Open Telemetry - пользователи могут использовать свои собственные схемы таблиц, если это необходимо.

#### Использование схем Open Telemetry  {#using-otel-schemas}

Если вы используете сборщик OTel для создания базы данных и таблиц в ClickHouse, сохраните все значения по умолчанию в модели создаваемого источника, заполнив поле `Table` значением `otel_logs` — чтобы создать источник логов. Все другие настройки должны быть автоматически определены, что позволит вам нажать `Save New Source`.

<Image img={hyperdx_cloud_datasource} alt="Источник данных ClickHouse Cloud HyperDX" size="lg"/>

Чтобы создать источники для трассировок и метрик OTel, пользователи могут выбрать `Create New Source` в верхнем меню.

<Image img={hyperdx_create_new_source} alt="Создание нового источника HyperDX" size="lg"/>

Отсюда выберите необходимый тип источника, затем соответствующую таблицу, например для трассировок выберите таблицу `otel_traces`. Все настройки должны быть автоматически определены.

<Image img={hyperdx_create_trace_datasource} alt="Создание источника трассировки HyperDX" size="lg"/>

:::note Корреляция источников
Обратите внимание, что разные источники данных в ClickStack — такие как логи и трассировки — могут быть скоррелированы друг с другом. Чтобы это включить, необходимо дополнительное конфигурирование для каждого источника. Например, в источнике логов вы можете указать соответствующий источник трассировки, и наоборот в источнике трассировок. См. ["Скоррелированные источники"](/use-cases/observability/clickstack/config#correlated-sources) для получения дополнительных сведений.
:::

#### Использование пользовательских схем {#using-custom-schemas}

Пользователи, желающие подключить HyperDX к существующему сервису с данными, могут завершить настройки базы данных и таблиц по мере необходимости. Настройки будут автоматически определены, если таблицы соответствуют схемам Open Telemetry для ClickHouse.

Если вы используете свою собственную схему, мы рекомендуем создать источник логов, убедившись, что указаны необходимые поля - см. ["Настройки источника логов"](/use-cases/observability/clickstack/config#logs) для получения дополнительных сведений.

</VerticalStepper>

## Поддержка типа JSON {#json-type-support}

<BetaBadge/>

ClickStack имеет бета-поддержку [типа JSON](/interfaces/formats/JSON) с версии `2.0.4`.

Для преимуществ этого типа см. [Преимущества типа JSON](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type).

Для включения поддержки типа JSON пользователи должны установить следующие переменные окружения:

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - включает поддержку в сборщике OTel, гарантируя, что схемы создаются с использованием типа JSON.

Кроме того, пользователи должны обратиться по адресу support@clickhouse.com, чтобы убедиться, что JSON включен на их сервисе ClickHouse Cloud.
