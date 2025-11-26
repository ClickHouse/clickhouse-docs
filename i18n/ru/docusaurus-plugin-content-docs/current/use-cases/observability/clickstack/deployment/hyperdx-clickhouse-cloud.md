---
slug: /use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud
title: 'ClickHouse Cloud'
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: 'Развертывание ClickStack с ClickHouse Cloud'
doc_type: 'guide'
keywords: ['clickstack', 'развертывание', 'настройка', 'конфигурация', 'наблюдаемость']
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
import read_only from '@site/static/images/clickstack/read-only-access.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

<PrivatePreviewBadge />

::::note[Закрытый предварительный просмотр]
Эта функция находится в режиме закрытого предварительного просмотра ClickHouse Cloud. Если ваша организация заинтересована в получении приоритетного доступа,
<TrackedLink href="https://clickhouse.com/cloud/clickstack-private-preview" eventName="docs.clickstack_deployment.waitlist_cta">присоединяйтесь к списку ожидания</TrackedLink>.

Если вы впервые работаете с ClickHouse Cloud, нажмите
<TrackedLink href="/docs/cloud/overview" eventName="docs.clickstack_deployment.cloud_learn_more_cta">здесь</TrackedLink>, чтобы узнать больше, или <TrackedLink href="https://clickhouse.cloud/signUp" eventName="docs.clickstack_deployment.cloud_signup_cta" target="_blank" rel="noopener noreferrer">зарегистрируйтесь для бесплатной пробной версии</TrackedLink>, чтобы начать работу.
::::

Этот вариант предназначен для пользователей ClickHouse Cloud. В этом шаблоне развертывания и ClickHouse, и HyperDX размещаются в ClickHouse Cloud, что минимизирует количество компонентов, которые нужно размещать самостоятельно.

Помимо сокращения объёма управления инфраструктурой, этот шаблон развертывания гарантирует, что аутентификация интегрирована с SSO/SAML ClickHouse Cloud. В отличие от развёртываний с самостоятельным размещением, здесь также нет необходимости поднимать экземпляр MongoDB для хранения состояния приложения — такого как дашборды, сохранённые поиски, пользовательские настройки и оповещения.

В этом режиме ответственность за приём данных полностью лежит на пользователе. Вы можете выполнять ингестию данных в ClickHouse Cloud с помощью собственного развернутого коллектора OpenTelemetry, прямой ингестии из клиентских библиотек, нативных для ClickHouse движков таблиц (таких как Kafka или S3), ETL-пайплайнов или ClickPipes — управляемого сервиса ингестии ClickHouse Cloud. Такой подход обеспечивает самый простой и наиболее производительный способ эксплуатации ClickStack.

### Подходит для

Этот шаблон развертывания оптимален в следующих сценариях:

1. У вас уже есть данные наблюдаемости в ClickHouse Cloud, и вы хотите визуализировать их с помощью HyperDX.
2. Вы эксплуатируете крупную систему наблюдаемости и нуждаетесь в выделенной производительности и масштабируемости ClickStack с ClickHouse Cloud.
3. Вы уже используете ClickHouse Cloud для аналитики и хотите инструментировать своё приложение с помощью библиотек инструментирования ClickStack, отправляя данные в тот же кластер. В этом случае мы рекомендуем использовать [warehouses](/cloud/reference/warehouses) для изоляции вычислительных ресурсов под нагрузки наблюдаемости.


## Шаги развертывания {#deployment-steps}

Данное руководство предполагает, что вы уже создали сервис ClickHouse Cloud. Если вы еще не создали сервис, выполните шаг [«Создание сервиса ClickHouse»](/getting-started/quick-start/cloud#1-create-a-clickhouse-service) из нашего руководства по быстрому старту.

<VerticalStepper headerLevel="h3">

### Копирование учетных данных сервиса (необязательно) {#copy-service-credentials}

**Если у вас уже есть события наблюдаемости, которые вы хотите визуализировать в вашем сервисе, этот шаг можно пропустить.**

Перейдите к основному списку сервисов и выберите сервис, в котором вы планируете хранить события наблюдаемости для визуализации в HyperDX.

Нажмите кнопку `Connect` в навигационном меню. Откроется модальное окно с учетными данными вашего сервиса и набором инструкций по подключению через различные интерфейсы и языки программирования. Выберите `HTTPS` из выпадающего списка и запишите конечную точку подключения и учетные данные.

<Image img={cloud_connect} alt='Подключение к ClickHouse Cloud' size='lg' />

### Развертывание Open Telemetry Collector (необязательно) {#deploy-otel-collector}

**Если у вас уже есть события наблюдаемости, которые вы хотите визуализировать в вашем сервисе, этот шаг можно пропустить.**

Этот шаг обеспечивает создание таблиц со схемой Open Telemetry (OTel), которая в дальнейшем может быть использована для беспрепятственного создания источника данных в HyperDX. Это также предоставляет конечную точку OTLP, которую можно использовать для загрузки [примеров наборов данных](/use-cases/observability/clickstack/sample-datasets) и отправки событий OTel в ClickStack.

:::note Использование стандартного Open Telemetry collector
Следующие инструкции используют стандартный дистрибутив OTel collector, а не дистрибутив ClickStack. Последний требует сервер OpAMP для конфигурации. В настоящее время это не поддерживается в закрытой предварительной версии. Приведенная ниже конфигурация воспроизводит версию, используемую дистрибутивом ClickStack для collector, предоставляя конечную точку OTLP, на которую могут отправляться события.
:::

Загрузите конфигурацию для OTel collector:

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
          # Парсинг JSON: расширяет атрибуты лога полями из структурированного содержимого тела лога — либо в виде карты OTEL, либо
          # в виде строки с JSON-содержимым.
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
          # Определение: извлечение первого ключевого слова уровня лога из первых 256 символов тела
          - set(log.cache["substr"], log.body.string) where Len(log.body.string)
            < 256
          - set(log.cache["substr"], Substring(log.body.string, 0, 256)) where
            Len(log.body.string) >= 256
          - set(log.cache, ExtractPatterns(log.cache["substr"],
            "(?i)(?P<0>(alert|crit|emerg|fatal|error|err|warn|notice|debug|dbug|trace))"))
          # Определение: обнаружение FATAL
          - set(log.severity_number, SEVERITY_NUMBER_FATAL) where
            IsMatch(log.cache["0"], "(?i)(alert|crit|emerg|fatal)")
          - set(log.severity_text, "fatal") where log.severity_number ==
            SEVERITY_NUMBER_FATAL
          # Определение: обнаружение ERROR
          - set(log.severity_number, SEVERITY_NUMBER_ERROR) where
            IsMatch(log.cache["0"], "(?i)(error|err)")
          - set(log.severity_text, "error") where log.severity_number ==
            SEVERITY_NUMBER_ERROR
          # Определение: обнаружение WARN
          - set(log.severity_number, SEVERITY_NUMBER_WARN) where
            IsMatch(log.cache["0"], "(?i)(warn|notice)")
          - set(log.severity_text, "warn") where log.severity_number ==
            SEVERITY_NUMBER_WARN
          # Определение: обнаружение DEBUG
          - set(log.severity_number, SEVERITY_NUMBER_DEBUG) where
            IsMatch(log.cache["0"], "(?i)(debug|dbug)")
          - set(log.severity_text, "debug") where log.severity_number ==
            SEVERITY_NUMBER_DEBUG
          # Определение: обнаружение TRACE
          - set(log.severity_number, SEVERITY_NUMBER_TRACE) where
            IsMatch(log.cache["0"], "(?i)(trace)")
          - set(log.severity_text, "trace") where log.severity_number ==
            SEVERITY_NUMBER_TRACE
          # Определение: в остальных случаях
          - set(log.severity_text, "info") where log.severity_number == 0
          - set(log.severity_number, SEVERITY_NUMBER_INFO) where log.severity_number == 0
      - context: log
        error_mode: ignore
        statements:
          # Нормализация регистра поля severity_text
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
    # 80% от максимальной памяти (до 2 ГБ), настройте для сред с ограниченной памятью
    limit_mib: 1500
    # 25% от лимита (до 2 ГБ), настройте для сред с ограниченной памятью
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

```

</details>

Разверните коллектор с помощью следующей команды Docker, установив соответствующие переменные окружения в значения параметров подключения, записанных ранее, и используя команду ниже, соответствующую вашей операционной системе.
```


```bash
# укажите адрес вашего облачного экземпляра
export CLICKHOUSE_ENDPOINT=
export CLICKHOUSE_PASSWORD=
# при необходимости измените 
export CLICKHOUSE_DATABASE=default
```


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



# Команда Linux



# docker run --network=host --rm -it \

# -e CLICKHOUSE&#95;ENDPOINT=${CLICKHOUSE_ENDPOINT} \

# -e CLICKHOUSE&#95;USER=default \

# -e CLICKHOUSE&#95;PASSWORD=${CLICKHOUSE_PASSWORD} \

# -e CLICKHOUSE&#95;DATABASE=${CLICKHOUSE_DATABASE} \

# --user 0:0 \

# -v &quot;$(pwd)/otel-cloud-config.yaml&quot;:/etc/otel/config.yaml \

# -v /var/log:/var/log:ro \

# -v /private/var/log:/private/var/log:ro \

# otel/opentelemetry-collector-contrib:latest \

# --config /etc/otel/config.yaml

```

:::note
В производственной среде рекомендуется создать выделенного пользователя для приёма данных, ограничив права доступа к необходимым базе данных и таблицам. Подробнее см. ["База данных и пользователь для приёма данных"](/use-cases/observability/clickstack/production#database-ingestion-user).
:::

### Подключение к HyperDX {#connect-to-hyperdx}

Выберите ваш сервис, затем выберите `HyperDX` в левом меню.

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

Вам не потребуется создавать пользователя — вы будете автоматически аутентифицированы, после чего вам будет предложено создать источник данных.

Для пользователей, желающих только ознакомиться с интерфейсом HyperDX, рекомендуем наши [примеры наборов данных](/use-cases/observability/clickstack/sample-datasets), которые используют данные OTel.

<Image img={hyperdx_cloud_landing} alt="ClickHouse Cloud HyperDX Landing" size="lg"/>

### Права пользователей {#user-permissions}

Пользователи, обращающиеся к HyperDX, автоматически аутентифицируются с использованием учетных данных консоли ClickHouse Cloud. Доступ контролируется через права SQL-консоли, настроенные в параметрах сервиса.

#### Настройка доступа пользователей {#configure-access}

1. Перейдите к вашему сервису в консоли ClickHouse Cloud
2. Откройте **Settings** → **SQL Console Access**
3. Установите соответствующий уровень прав для каждого пользователя:
   - **Service Admin → Full Access** — требуется для включения оповещений
   - **Service Read Only → Read Only** — позволяет просматривать данные наблюдаемости и создавать дашборды
   - **No access** — не позволяет получить доступ к HyperDX

<Image img={read_only} alt="ClickHouse Cloud Read Only"/>

:::important Для оповещений требуются права администратора
Чтобы включить оповещения, хотя бы один пользователь с правами **Service Admin** (соответствующими **Full Access** в выпадающем списке SQL Console Access) должен войти в HyperDX хотя бы один раз. Это создаёт выделенного пользователя в базе данных, который выполняет запросы оповещений.
:::

### Создание источника данных {#create-a-datasource}

HyperDX изначально поддерживает Open Telemetry, но не ограничивается им — пользователи могут использовать собственные схемы таблиц при необходимости.

#### Использование схем Open Telemetry  {#using-otel-schemas}

Если вы используете указанный выше OTel collector для создания базы данных и таблиц в ClickHouse, сохраните все значения по умолчанию в модели создания источника, заполнив поле `Table` значением `otel_logs` — для создания источника логов. Все остальные настройки должны быть определены автоматически, что позволит вам нажать `Save New Source`.

<Image img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX Datasource" size="lg"/>

Для создания источников трассировок и метрик OTel пользователи могут выбрать `Create New Source` в верхнем меню.

<Image img={hyperdx_create_new_source} alt="HyperDX create new source" size="lg"/>

Здесь выберите требуемый тип источника, а затем соответствующую таблицу, например, для трассировок выберите таблицу `otel_traces`. Все настройки должны быть определены автоматически.

<Image img={hyperdx_create_trace_datasource} alt="HyperDX create trace source" size="lg"/>

:::note Корреляция источников
Обратите внимание, что различные источники данных в ClickStack — такие как логи и трассировки — могут коррелировать друг с другом. Для этого требуется дополнительная настройка каждого источника. Например, в источнике логов можно указать соответствующий источник трассировок, и наоборот в источнике трассировок. Подробнее см. ["Коррелированные источники"](/use-cases/observability/clickstack/config#correlated-sources).
:::

#### Использование пользовательских схем {#using-custom-schemas}

Пользователи, желающие подключить HyperDX к существующему сервису с данными, могут заполнить настройки базы данных и таблиц по мере необходимости. Настройки будут определены автоматически, если таблицы соответствуют схемам Open Telemetry для ClickHouse.

При использовании собственной схемы рекомендуется создать источник логов, убедившись, что указаны необходимые поля — подробнее см. ["Настройки источника логов"](/use-cases/observability/clickstack/config#logs).

</VerticalStepper>

<JSONSupport/>

Кроме того, пользователям следует обратиться по адресу support@clickhouse.com, чтобы убедиться, что JSON включён в их сервисе ClickHouse Cloud.
```
