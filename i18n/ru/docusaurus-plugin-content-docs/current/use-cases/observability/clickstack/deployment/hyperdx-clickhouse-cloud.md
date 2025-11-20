---
slug: /use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud
title: "ClickHouse Cloud"
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: "Развертывание ClickStack с ClickHouse Cloud"
doc_type: "guide"
keywords:
  ["clickstack", "deployment", "setup", "configuration", "observability"]
---

import Image from "@theme/IdealImage"
import PrivatePreviewBadge from "@theme/badges/PrivatePreviewBadge"
import BetaBadge from "@theme/badges/BetaBadge"
import cloud_connect from "@site/static/images/use-cases/observability/clickhouse_cloud_connection.png"
import hyperdx_cloud from "@site/static/images/use-cases/observability/hyperdx_cloud.png"
import hyperdx_cloud_landing from "@site/static/images/use-cases/observability/hyperdx_cloud_landing.png"
import hyperdx_cloud_datasource from "@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png"
import hyperdx_create_new_source from "@site/static/images/use-cases/observability/hyperdx_create_new_source.png"
import hyperdx_create_trace_datasource from "@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png"
import read_only from "@site/static/images/clickstack/read-only-access.png"
import { TrackedLink } from "@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink"
import JSONSupport from "@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md"

<PrivatePreviewBadge />

::::note[Закрытое превью]
Эта функция находится в режиме закрытого превью ClickHouse Cloud. Если ваша организация заинтересована в получении приоритетного доступа,

<TrackedLink
  href='https://clickhouse.com/cloud/clickstack-private-preview'
  eventName='docs.clickstack_deployment.waitlist_cta'
>
  присоединяйтесь к списку ожидания
</TrackedLink>
.

Если вы впервые работаете с ClickHouse Cloud, нажмите

<TrackedLink
  href='/docs/cloud/overview'
  eventName='docs.clickstack_deployment.cloud_learn_more_cta'
>
  здесь
</TrackedLink>
, чтобы узнать больше, или
<TrackedLink
  href='https://clickhouse.cloud/signUp'
  eventName='docs.clickstack_deployment.cloud_signup_cta'
  target='_blank'
  rel='noopener noreferrer'
>
  зарегистрируйтесь для получения бесплатного пробного периода
</TrackedLink>
, чтобы начать работу. ::::

Этот вариант предназначен для пользователей ClickHouse Cloud. При такой схеме развертывания и ClickHouse, и HyperDX размещаются в ClickHouse Cloud, что минимизирует количество компонентов, которые необходимо размещать самостоятельно.

Помимо упрощения управления инфраструктурой, эта схема развертывания обеспечивает интеграцию аутентификации с ClickHouse Cloud SSO/SAML. В отличие от самостоятельно размещаемых развертываний, также отсутствует необходимость выделять экземпляр MongoDB для хранения состояния приложения — такого как дашборды, сохраненные поиски, пользовательские настройки и оповещения.

В этом режиме загрузка данных полностью остается на усмотрение пользователя. Вы можете загружать данные в ClickHouse Cloud, используя собственный размещенный коллектор OpenTelemetry, прямую загрузку из клиентских библиотек, нативные движки таблиц ClickHouse (такие как Kafka или S3), ETL-конвейеры или ClickPipes — управляемый сервис загрузки ClickHouse Cloud. Этот подход обеспечивает наиболее простой и производительный способ работы с ClickStack.

### Подходит для {#suitable-for}

Эта схема развертывания идеальна в следующих сценариях:

1. У вас уже есть данные наблюдаемости в ClickHouse Cloud, и вы хотите визуализировать их с помощью HyperDX.
2. Вы управляете крупным развертыванием наблюдаемости и нуждаетесь в выделенной производительности и масштабируемости ClickStack с ClickHouse Cloud.
3. Вы уже используете ClickHouse Cloud для аналитики и хотите инструментировать свое приложение с помощью библиотек инструментирования ClickStack, отправляя данные в тот же кластер. В этом случае мы рекомендуем использовать [хранилища](/cloud/reference/warehouses) для изоляции вычислительных ресурсов для рабочих нагрузок наблюдаемости.


## Шаги развертывания {#deployment-steps}

Следующее руководство предполагает, что вы уже создали сервис ClickHouse Cloud. Если вы не создали сервис, следуйте шагу ["Создать сервис ClickHouse"](/getting-started/quick-start/cloud#1-create-a-clickhouse-service) из нашего руководства быстрого запуска.

<VerticalStepper headerLevel="h3">

### Копирование учетных данных сервиса (опционально) {#copy-service-credentials}

**Если у вас есть существующие события наблюдаемости, которые вы хотите визуализировать в вашем сервисе, этот шаг можно пропустить.**

Перейдите к основному списку сервисов и выберите сервис, в который вы намерены отправлять события наблюдаемости для визуализации в HyperDX.

Нажмите кнопку `Connect` в меню навигации. Откроется модальное окно, предлагающее учетные данные вашего сервиса вместе с набором инструкций по подключению через различные интерфейсы и языки. Выберите `HTTPS` из выпадающего списка и запишите конечную точку подключения и учетные данные.

<Image img={cloud_connect} alt='Подключение к ClickHouse Cloud' size='lg' />

### Развертывание коллектора OpenTelemetry (опционально) {#deploy-otel-collector}

**Если у вас есть существующие события наблюдаемости, которые вы хотите визуализировать в вашем сервисе, этот шаг можно пропустить.**

Этот шаг обеспечивает создание таблиц со схемой OpenTelemetry (OTel), которая в свою очередь может быть использована без проблем для создания источника данных в HyperDX. Это также предоставляет конечную точку OLTP, которую можно использовать для загрузки [примерных наборов данных](/use-cases/observability/clickstack/sample-datasets) и отправки событий OTel в ClickStack.

:::note Использование стандартного коллектора OpenTelemetry
Следующие инструкции используют стандартный дистрибутив коллектора OTel, а не дистрибутив ClickStack. Последний требует сервера OpAMP для настройки. На данный момент это не поддерживается в приватной предварительной версии. Приведенная ниже конфигурация воспроизводит версию, используемую в дистрибутиве ClickStack коллектора, и предоставляет конечную точку OTLP, на которую можно отправлять события.
:::

Скачайте конфигурацию для коллектора OTel:

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

```

</details>

Разверните коллектор с помощью следующей команды Docker, указав соответствующие переменные окружения для параметров подключения, записанных ранее, и выбрав подходящую команду ниже в зависимости от вашей операционной системы.
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



# команда Linux



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
В производственной среде рекомендуется создать выделенного пользователя для приёма данных, ограничив права доступа только необходимыми базами данных и таблицами. Подробнее см. в разделе ["База данных и пользователь для приёма данных"](/use-cases/observability/clickstack/production#database-ingestion-user).
:::

### Подключение к HyperDX {#connect-to-hyperdx}

Выберите ваш сервис, затем выберите `HyperDX` в левом меню.

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

Вам не потребуется создавать пользователя — аутентификация произойдёт автоматически, после чего вам будет предложено создать источник данных.

Для пользователей, желающих только ознакомиться с интерфейсом HyperDX, рекомендуем использовать наши [примеры наборов данных](/use-cases/observability/clickstack/sample-datasets), которые содержат данные OTel.

<Image img={hyperdx_cloud_landing} alt="ClickHouse Cloud HyperDX Landing" size="lg"/>

### Права пользователей {#user-permissions}

Пользователи, обращающиеся к HyperDX, автоматически проходят аутентификацию с использованием учётных данных консоли ClickHouse Cloud. Доступ контролируется через права SQL-консоли, настраиваемые в параметрах сервиса.

#### Настройка доступа пользователей {#configure-access}

1. Перейдите к вашему сервису в консоли ClickHouse Cloud
2. Откройте **Settings** → **SQL Console Access**
3. Установите соответствующий уровень прав для каждого пользователя:
   - **Service Admin → Full Access** — требуется для включения оповещений
   - **Service Read Only → Read Only** — позволяет просматривать данные наблюдаемости и создавать дашборды
   - **No access** — доступ к HyperDX отсутствует

<Image img={read_only} alt="ClickHouse Cloud Read Only"/>

:::important Для оповещений требуются права администратора
Чтобы включить оповещения, хотя бы один пользователь с правами **Service Admin** (соответствующими **Full Access** в выпадающем списке SQL Console Access) должен войти в HyperDX хотя бы один раз. Это создаёт выделенного пользователя в базе данных, который выполняет запросы оповещений.
:::

### Создание источника данных {#create-a-datasource}

HyperDX изначально поддерживает Open Telemetry, но не ограничивается им — пользователи могут использовать собственные схемы таблиц при необходимости.

#### Использование схем Open Telemetry  {#using-otel-schemas}

Если вы используете указанный выше сборщик OTel для создания базы данных и таблиц в ClickHouse, сохраните все значения по умолчанию в модели создания источника, заполнив поле `Table` значением `otel_logs` — для создания источника логов. Все остальные настройки должны определиться автоматически, что позволит вам нажать `Save New Source`.

<Image img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX Datasource" size="lg"/>

Для создания источников трассировок и метрик OTel пользователи могут выбрать `Create New Source` в верхнем меню.

<Image img={hyperdx_create_new_source} alt="HyperDX create new source" size="lg"/>

Здесь выберите требуемый тип источника, а затем соответствующую таблицу, например, для трассировок выберите таблицу `otel_traces`. Все настройки должны определиться автоматически.

<Image img={hyperdx_create_trace_datasource} alt="HyperDX create trace source" size="lg"/>

:::note Корреляция источников
Обратите внимание, что различные источники данных в ClickStack — такие как логи и трассировки — могут быть связаны друг с другом. Для этого требуется дополнительная настройка каждого источника. Например, в источнике логов можно указать соответствующий источник трассировок, и наоборот в источнике трассировок. Подробнее см. в разделе ["Связанные источники"](/use-cases/observability/clickstack/config#correlated-sources).
:::

#### Использование пользовательских схем {#using-custom-schemas}

Пользователи, желающие подключить HyperDX к существующему сервису с данными, могут заполнить настройки базы данных и таблиц по мере необходимости. Настройки будут определены автоматически, если таблицы соответствуют схемам Open Telemetry для ClickHouse.

При использовании собственной схемы рекомендуется создать источник логов, убедившись, что указаны необходимые поля — подробнее см. в разделе ["Настройки источника логов"](/use-cases/observability/clickstack/config#logs).

</VerticalStepper>

<JSONSupport/>

Кроме того, пользователям следует обратиться по адресу support@clickhouse.com, чтобы убедиться, что JSON включён в их сервисе ClickHouse Cloud.
```
