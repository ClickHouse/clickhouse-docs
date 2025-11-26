---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-agents
title: 'Миграция агентов с Elastic'
pagination_prev: null
pagination_next: null
sidebar_label: 'Миграция агентов'
sidebar_position: 5
description: 'Миграция агентов с Elastic'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import add_logstash_output from '@site/static/images/use-cases/observability/add-logstash-output.png';
import agent_output_settings from '@site/static/images/use-cases/observability/agent-output-settings.png';
import migrating_agents from '@site/static/images/use-cases/observability/clickstack-migrating-agents.png';


## Миграция агентов с Elastic {#migrating-agents-from-elastic}

Elastic Stack предоставляет ряд агентов для сбора данных наблюдаемости (observability). В частности:

- [Семейство Beats](https://www.elastic.co/beats) — такие как [Filebeat](https://www.elastic.co/beats/filebeat), [Metricbeat](https://www.elastic.co/beats/metricbeat) и [Packetbeat](https://www.elastic.co/beats/packetbeat) — все они основаны на библиотеке `libbeat`. Эти Beats поддерживают [отправку данных в Elasticsearch, Kafka, Redis или Logstash](https://www.elastic.co/docs/reference/beats/filebeat/configuring-output) по протоколу Lumberjack.
- [`Elastic Agent`](https://www.elastic.co/elastic-agent) предоставляет единый агент, способный собирать логи, метрики и трейсы. Этот агент может централизованно управляться через [Elastic Fleet Server](https://www.elastic.co/docs/reference/fleet/manage-elastic-agents-in-fleet) и поддерживает отправку данных в Elasticsearch, Logstash, Kafka или Redis.
- Elastic также предоставляет дистрибутив [OpenTelemetry Collector — EDOT](https://www.elastic.co/docs/reference/opentelemetry). Хотя в настоящее время он не может управляться через Fleet Server, он предлагает более гибкий и открытый путь для пользователей, мигрирующих на ClickStack.

Оптимальный путь миграции зависит от того, какие агенты используются сейчас. В следующих разделах мы описываем варианты миграции для каждого основного типа агентов. Наша цель — минимизировать сложности и, где это возможно, позволить пользователям продолжать использовать свои текущие агенты в ходе перехода.



## Предпочтительный вариант миграции {#prefered-migration-path}

По возможности мы рекомендуем переходить на [OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector/) для сбора всех логов, метрик и трейсов, развернув коллектор на [периферии в роли агента](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles). Это обеспечивает наиболее эффективную передачу данных и позволяет избежать излишней сложности архитектуры и трансформации данных.

:::note Почему OpenTelemetry Collector?
OpenTelemetry Collector предоставляет устойчивое и независимое от вендора решение для ингестии данных наблюдаемости. Мы понимаем, что некоторые организации эксплуатируют парки из тысяч — или даже десятков тысяч — Elastic агентов. Для таких пользователей может быть критически важно сохранять совместимость с существующей инфраструктурой агентов. Данная документация призвана поддержать такой сценарий, одновременно помогая командам постепенно переходить на сбор данных на базе OpenTelemetry.
:::



## Конечная точка OpenTelemetry в ClickHouse {#clickhouse-otel-endpoint}

Все данные поступают в ClickStack через экземпляр **OpenTelemetry (OTel) collector**, который является основной точкой входа для логов, метрик, трейсов и данных сессий. Мы рекомендуем использовать официальный [дистрибутив ClickStack](/use-cases/observability/clickstack/ingesting-data/opentelemetry#installing-otel-collector) коллектора для этого экземпляра, если он [ещё не включён в вашу модель развертывания ClickStack](/use-cases/observability/clickstack/deployment).

Пользователи отправляют данные в этот коллектор из [языковых SDK](/use-cases/observability/clickstack/sdks) или через агенты сбора данных, собирающие инфраструктурные метрики и логи (например, OTel collector в роли [агента](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) или другие технологии, такие как [Fluentd](https://www.fluentd.org/) или [Vector](https://vector.dev/)).

**Мы предполагаем, что этот коллектор доступен для всех шагов миграции агентов**.



## Миграция с Beats {#migrating-to-beats}

Пользователи с обширными развертываниями Beat могут захотеть сохранить их при миграции на ClickStack.

**В настоящее время этот вариант протестирован только с Filebeat и поэтому подходит только для логов.**

Агенты Beats используют [Elastic Common Schema (ECS)](https://www.elastic.co/docs/reference/ecs), которая в настоящее время [находится в процессе объединения с OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0199-support-elastic-common-schema-in-opentelemetry.md) — спецификацией, используемой ClickStack. Однако эти [схемы всё ещё существенно различаются](https://www.elastic.co/docs/reference/ecs/ecs-otel-alignment-overview), и пользователи в настоящее время несут ответственность за преобразование событий в формате ECS в формат OpenTelemetry перед ингестией в ClickStack.

Мы рекомендуем выполнять это преобразование с помощью [Vector](https://vector.dev) — легковесного и высокопроизводительного конвейера данных наблюдаемости, который поддерживает мощный язык преобразований Vector Remap Language (VRL).

Если ваши агенты Filebeat настроены на отправку данных в Kafka — поддерживаемый выходной формат Beats — Vector может потреблять эти события из Kafka, применять преобразования схемы с помощью VRL, а затем пересылать их через OTLP в OpenTelemetry Collector, распространяемый с ClickStack.

В качестве альтернативы Vector также поддерживает приём событий по протоколу Lumberjack, используемому Logstash. Это позволяет агентам Beats отправлять данные напрямую в Vector, где может быть применён тот же процесс преобразования перед пересылкой в ClickStack OpenTelemetry Collector через OTLP.

Ниже мы иллюстрируем обе эти архитектуры.

<Image img={migrating_agents} alt='Миграция агентов' size='lg' background />

В следующем примере мы предоставляем начальные шаги по настройке Vector для приёма событий логов от Filebeat через протокол Lumberjack. Мы предоставляем VRL для сопоставления входящих событий ECS со спецификацией OTel перед отправкой их в ClickStack OpenTelemetry collector через OTLP. Пользователи, потребляющие события из Kafka, могут заменить источник Vector Logstash на [источник Kafka](https://vector.dev/docs/reference/configuration/sources/kafka/) — все остальные шаги остаются прежними.

<VerticalStepper headerLevel="h3">

### Установка Vector {#install-vector}

Установите Vector, используя [официальное руководство по установке](https://vector.dev/docs/setup/installation/).

Его можно установить на том же экземпляре, что и ваш Elastic Stack OTel collector.

Пользователи могут следовать лучшим практикам в отношении архитектуры и безопасности при [переводе Vector в продакшн](https://vector.dev/docs/setup/going-to-prod/).

### Настройка Vector {#configure-vector}

Vector должен быть настроен на приём событий по протоколу Lumberjack, имитируя экземпляр Logstash. Это можно достичь, настроив [источник `logstash`](https://vector.dev/docs/reference/configuration/sources/logstash/) для Vector:

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: false # Установите true, если используете TLS
      # Файлы ниже генерируются из шагов по адресу https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs
      # crt_file: logstash.crt
      # key_file: logstash.key
      # ca_file: ca.crt
      # verify_certificate: true
```

:::note Настройка TLS
Если требуется взаимный TLS, сгенерируйте сертификаты и ключи, используя руководство Elastic ["Configure SSL/TLS for the Logstash output"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output). Затем их можно указать в конфигурации, как показано выше.
:::

События будут приниматься в формате ECS. Их можно преобразовать в схему OpenTelemetry с помощью преобразователя Vector Remap Language (VRL). Настройка этого преобразователя проста — файл скрипта хранится в отдельном файле:

```yaml
transforms:
  remap_filebeat:
    inputs: ["beats"]
    type: "remap"
    file: "beat_to_otel.vrl"
```

Обратите внимание, что он получает события из указанного выше источника `beats`. Наш скрипт переназначения показан ниже. Этот скрипт был протестирован только с событиями логов, но может служить основой для других форматов.

<details>
<summary>VRL — ECS в OTel</summary>


```javascript
# Определите ключи для игнорирования на корневом уровне
ignored_keys = ["@metadata"]
```


# Определите префиксы ключей ресурсов
resource_keys = ["host", "cloud", "agent", "service"]



# Создайте отдельные объекты для полей ресурса и лог-записи
resource_obj = {}
log_record_obj = {}



# Копирование всех неигнорируемых корневых ключей в соответствующие объекты

root_keys = keys(.)
for_each(root_keys) -> |\_index, key| {
if !includes(ignored_keys, key) {
val, err = get(., [key])
if err == null { # Check if this is a resource field
is_resource = false
if includes(resource_keys, key) {
is_resource = true
}

            # Add to appropriate object
            if is_resource {
                resource_obj = set(resource_obj, [key], val) ?? resource_obj
            } else {
                log_record_obj = set(log_record_obj, [key], val) ?? log_record_obj
            }
        }
    }

}


# Разверните каждый объект отдельно
flattened_resources = flatten(resource_obj, separator: ".")
flattened_logs = flatten(log_record_obj, separator: ".")



# Обработка атрибутов ресурса

resource_attributes = []
resource_keys_list = keys(flattened_resources)
for_each(resource_keys_list) -> |\_index, field_key| {
field_value, err = get(flattened_resources, [field_key])
if err == null && field_value != null {
attribute, err = {
"key": field_key,
"value": {
"stringValue": to_string(field_value)
}
}
if (err == null) {
resource_attributes = push(resource_attributes, attribute)
}
}
}


# Обработка атрибутов записей лога

log_attributes = []
log_keys_list = keys(flattened_logs)
for_each(log_keys_list) -> |\_index, field_key| {
field_value, err = get(flattened_logs, [field_key])
if err == null && field_value != null {
attribute, err = {
"key": field_key,
"value": {
"stringValue": to_string(field_value)
}
}
if (err == null) {
log_attributes = push(log_attributes, attribute)
}
}
}


# Получение временной метки для timeUnixNano (преобразование в наносекунды)

timestamp_nano = if exists(.@timestamp) {
to_unix_timestamp!(parse_timestamp!(.@timestamp, format: "%Y-%m-%dT%H:%M:%S%.3fZ"), unit: "nanoseconds")
} else {
to_unix_timestamp(now(), unit: "nanoseconds")
}


# Получить поле message/body

body_value = if exists(.message) {
to_string!(.message)
} else if exists(.body) {
to_string!(.body)
} else {
""
}


# Создание структуры OpenTelemetry

. = {
"resourceLogs": [
{
"resource": {
"attributes": resource_attributes
},
"scopeLogs": [
{
"scope": {},
"logRecords": [
{
"timeUnixNano": to_string(timestamp_nano),
"severityNumber": 9,
"severityText": "info",
"body": {
"stringValue": body_value
},
"attributes": log_attributes
}
]
}
]
}
]
}

````

</details>

Наконец, преобразованные события можно отправить в ClickStack через OpenTelemetry collector по OTLP. Для этого необходимо настроить приёмник OTLP в Vector, который принимает события из преобразования `remap_filebeat`:

```yaml
sinks:
  otlp:
    type: opentelemetry
    inputs: [remap_filebeat] # принимает события из преобразования remap — см. ниже
    protocol:
      type: http  # Используйте "grpc" для порта 4317
      uri: http://localhost:4318/v1/logs # конечная точка логов для OTel collector
      method: post
      encoding:
        codec: json
      framing:
        method: newline_delimited
      headers:
        content-type: application/json
        authorization: ${YOUR_INGESTION_API_KEY}
````

Значение `YOUR_INGESTION_API_KEY` генерируется ClickStack. Ключ можно найти в приложении HyperDX в разделе `Team Settings → API Keys`.

<Image img={ingestion_key} alt='Ключи ингестии' size='lg' />

Полная итоговая конфигурация представлена ниже:

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled:
        false # Установите true, если используете TLS
        #crt_file: /data/elasticsearch-9.0.1/logstash/logstash.crt
        #key_file: /data/elasticsearch-9.0.1/logstash/logstash.key
        #ca_file: /data/elasticsearch-9.0.1/ca/ca.crt
        #verify_certificate: true

transforms:
  remap_filebeat:
    inputs: ["beats"]
    type: "remap"
    file: "beat_to_otel.vrl"

sinks:
  otlp:
    type: opentelemetry
    inputs: [remap_filebeat]
    protocol:
      type: http # Используйте "grpc" для порта 4317
      uri: http://localhost:4318/v1/logs
      method: post
      encoding:
        codec: json
      framing:
        method: newline_delimited
      headers:
        content-type: application/json
```

### Настройка Filebeat {#configure-filebeat}

Существующие установки Filebeat необходимо изменить для отправки событий в Vector. Для этого требуется настроить выходной канал Logstash — при необходимости можно также настроить TLS:


```yaml
# ------------------------------ Вывод Logstash -------------------------------
output.logstash:
  # Хосты Logstash
  hosts: ["localhost:5044"]

  # Необязательный параметр SSL. По умолчанию отключен.
  # Список корневых сертификатов для проверки HTTPS-серверов
  #ssl.certificate_authorities: ["/etc/pki/root/ca.pem"]

  # Сертификат для аутентификации SSL-клиента
  #ssl.certificate: "/etc/pki/client/cert.pem"

  # Ключ клиентского сертификата
  #ssl.key: "/etc/pki/client/cert.key"
```

</VerticalStepper>


## Миграция с Elastic Agent

Elastic Agent объединяет различные Elastic Beats в единый пакет. Этот агент интегрируется с [Elastic Fleet](https://www.elastic.co/docs/reference/fleet/fleet-server), что позволяет централизованно оркестровать и настраивать его.

У пользователей с развернутыми Elastic Agent есть несколько вариантов миграции:

* Настроить агент на отправку данных на конечную точку Vector по протоколу Lumberjack. **На данный момент это протестировано только для пользователей, собирающих журнальные данные (logs) с помощью Elastic Agent.** Такая конфигурация может выполняться централизованно через Fleet UI в Kibana.
* [Запустить агент как Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/fleet/otel-agent). Elastic Agent включает встроенный коллектор EDOT, который позволяет один раз инструментировать ваши приложения и инфраструктуру и отправлять данные нескольким поставщикам и в разные бекенд-системы. В этой конфигурации пользователи могут просто настроить коллектор EDOT на пересылку событий в ClickStack OTel collector по OTLP. **Этот подход поддерживает все типы событий.**

Ниже показаны оба этих варианта.

### Отправка данных через Vector

<VerticalStepper headerLevel="h4">
  #### Установка и настройка Vector

  Установите и настройте Vector, используя [те же шаги](#install-vector), что и описанные для миграции с Filebeat.

  #### Настройка Elastic Agent

  Необходимо настроить Elastic Agent на отправку данных по протоколу Logstash Lumberjack. Это [поддерживаемый вариант развертывания](https://www.elastic.co/docs/manage-data/ingest/ingest-reference-architectures/ls-networkbridge), и его можно либо настроить централизованно, либо [через конфигурационный файл агента `elastic-agent.yaml`](https://www.elastic.co/docs/reference/fleet/logstash-output), если развертывание выполняется без Fleet.

  Централизованную конфигурацию через Kibana можно выполнить, добавив [Output в Fleet](https://www.elastic.co/docs/reference/fleet/fleet-settings#output-settings).

  <Image img={add_logstash_output} alt="Добавление Logstash output" size="md" />

  Затем этот output может быть использован в [политике агента](https://www.elastic.co/docs/reference/fleet/agent-policy). Это автоматически приведет к тому, что все агенты, использующие эту политику, будут отправлять свои данные в Vector.

  <Image img={agent_output_settings} alt="Настройки агента" size="md" />

  Поскольку для этого требуется настройка защищенного взаимодействия по TLS, мы рекомендуем руководство [&quot;Configure SSL/TLS for the Logstash output&quot;](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output), которое можно использовать, предполагая, что ваш экземпляр Vector выступает в роли Logstash.

  Обратите внимание, что это также требует настройки источника Logstash в Vector для использования взаимной аутентификации TLS (mTLS). Используйте ключи и сертификаты, [сгенерированные в руководстве](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs), чтобы правильно настроить входящий источник (input).

  ```yaml
  sources:
    beats:
      type: logstash
      address: 0.0.0.0:5044
      tls:
        enabled: true  # Установите в true, если вы используете TLS. 
        # Файлы ниже генерируются по шагам из https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs
        crt_file: logstash.crt
        key_file: logstash.key
        ca_file: ca.crt
        verify_certificate: true
  ```
</VerticalStepper>

### Запуск Elastic Agent как OpenTelemetry collector

Elastic Agent включает встроенный коллектор EDOT, который позволяет один раз инструментировать ваши приложения и инфраструктуру и отправлять данные нескольким поставщикам и в разные бекенд-системы.

:::note Agent integrations and orchestration
Пользователи, запускающие коллектор EDOT, поставляемый с Elastic Agent, не смогут использовать [имеющиеся интеграции, предлагаемые агентом](https://www.elastic.co/docs/reference/fleet/manage-integrations). Кроме того, коллектор не может централизованно управляться через Fleet, что вынуждает пользователя запускать [агент в standalone-режиме](https://www.elastic.co/docs/reference/fleet/configure-standalone-elastic-agents) и управлять конфигурацией самостоятельно.
:::

Чтобы запустить Elastic Agent с коллектором EDOT, смотрите [официальное руководство Elastic](https://www.elastic.co/docs/reference/fleet/otel-agent-transform). Вместо настройки конечной точки Elastic, как указано в руководстве, удалите существующие `exporters` и настройте экспортёр OTLP — отправляя данные в ClickStack OpenTelemetry collector. Например, конфигурация для `exporters` будет выглядеть следующим образом:

```yaml
exporters:
  # Экспортёр для отправки логов и метрик в Elasticsearch Managed OTLP Input
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: ${YOUR_INGESTION_API_KEY}
    tls:
      insecure: true
```


Значение `YOUR_INGESTION_API_KEY` здесь генерируется ClickStack. Вы можете найти этот ключ в приложении HyperDX в разделе `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ключи для ингестии" size="lg" />

Если Vector был настроен на использование взаимного TLS, а сертификат и ключи сгенерированы с использованием шагов из руководства [&quot;Настроить SSL/TLS для вывода Logstash&quot;](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output), экспортер `otlp` необходимо настроить соответствующим образом, например:

```yaml
exporters:
  # Экспортер для отправки логов и метрик в управляемый OTLP-вход Elasticsearch
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: ${YOUR_INGESTION_API_KEY}
    tls:
      insecure: false
      ca_file: /path/to/ca.crt
      cert_file: /path/to/client.crt
      key_file: /path/to/client.key
```


## Миграция с Elastic OpenTelemetry Collector {#migrating-from-elastic-otel-collector}

Пользователи, которые уже используют [Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/opentelemetry), могут просто перенастроить свои агенты на отправку данных в коллектор OpenTelemetry ClickStack по OTLP. Необходимые шаги полностью совпадают с описанными выше для запуска [Elastic Agent в качестве коллектора OpenTelemetry](#run-agent-as-otel). Такой подход может использоваться для всех типов данных.
