---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-agents
title: 'Миграция агентов из Elastic'
pagination_prev: null
pagination_next: null
sidebar_label: 'Миграция агентов'
sidebar_position: 5
description: 'Миграция агентов из Elastic'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import add_logstash_output from '@site/static/images/use-cases/observability/add-logstash-output.png';
import agent_output_settings from '@site/static/images/use-cases/observability/agent-output-settings.png';
import migrating_agents from '@site/static/images/use-cases/observability/clickstack-migrating-agents.png';


## Миграция агентов из Elastic {#migrating-agents-from-elastic}

Elastic Stack предоставляет несколько агентов для сбора данных наблюдаемости. В частности:

- Семейство [Beats](https://www.elastic.co/beats) — такие как [Filebeat](https://www.elastic.co/beats/filebeat), [Metricbeat](https://www.elastic.co/beats/metricbeat) и [Packetbeat](https://www.elastic.co/beats/packetbeat) — все основаны на библиотеке `libbeat`. Эти агенты Beats поддерживают [отправку данных в Elasticsearch, Kafka, Redis или Logstash](https://www.elastic.co/docs/reference/beats/filebeat/configuring-output) по протоколу Lumberjack.
- [`Elastic Agent`](https://www.elastic.co/elastic-agent) предоставляет унифицированный агент, способный собирать логи, метрики и трассировки. Этот агент может централизованно управляться через [Elastic Fleet Server](https://www.elastic.co/docs/reference/fleet/manage-elastic-agents-in-fleet) и поддерживает отправку данных в Elasticsearch, Logstash, Kafka или Redis.
- Elastic также предоставляет дистрибутив [OpenTelemetry Collector - EDOT](https://www.elastic.co/docs/reference/opentelemetry). Хотя в настоящее время он не может управляться через Fleet Server, он предлагает более гибкий и открытый путь для пользователей, мигрирующих на ClickStack.

Оптимальный путь миграции зависит от используемых в настоящее время агентов. В следующих разделах мы описываем варианты миграции для каждого основного типа агентов. Наша цель — минимизировать трудности и, где это возможно, позволить пользователям продолжать использовать существующие агенты в процессе перехода.


## Рекомендуемый путь миграции {#prefered-migration-path}

По возможности рекомендуется выполнить миграцию на [OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector/) для сбора всех логов, метрик и трейсов с развертыванием коллектора [на периферии в роли агента](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles). Это наиболее эффективный способ передачи данных, позволяющий избежать архитектурной сложности и преобразования данных.

:::note Почему OpenTelemetry Collector?
OpenTelemetry Collector предоставляет устойчивое и независимое от вендора решение для приема данных наблюдаемости. Мы понимаем, что некоторые организации эксплуатируют парки из тысяч и даже десятков тысяч агентов Elastic. Для таких пользователей поддержание совместимости с существующей инфраструктурой агентов может иметь критическое значение. Данная документация предназначена для поддержки подобных сценариев, а также для помощи командам в постепенном переходе на сбор данных на основе OpenTelemetry.
:::


## Конечная точка OpenTelemetry в ClickHouse {#clickhouse-otel-endpoint}

Все данные поступают в ClickStack через экземпляр **коллектора OpenTelemetry (OTel)**, который служит основной точкой входа для логов, метрик, трассировок и данных сессий. Рекомендуется использовать официальный [дистрибутив ClickStack](/use-cases/observability/clickstack/ingesting-data/opentelemetry#installing-otel-collector) коллектора для этого экземпляра, если он еще не [входит в вашу модель развертывания ClickStack](/use-cases/observability/clickstack/deployment).

Пользователи отправляют данные в этот коллектор из [SDK для различных языков программирования](/use-cases/observability/clickstack/sdks) или через агенты сбора данных, которые собирают метрики и логи инфраструктуры (например, OTel-коллекторы в роли [агента](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) или другие технологии, такие как [Fluentd](https://www.fluentd.org/) или [Vector](https://vector.dev/)).

**Предполагается, что этот коллектор доступен на всех этапах миграции агентов**.


## Миграция с Beats {#migrating-to-beats}

Пользователи с развернутыми инфраструктурами Beat могут захотеть сохранить их при переходе на ClickStack.

**В настоящее время этот вариант протестирован только с Filebeat и поэтому подходит только для логов.**

Агенты Beats используют [Elastic Common Schema (ECS)](https://www.elastic.co/docs/reference/ecs), которая в настоящее время [находится в процессе интеграции с OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0199-support-elastic-common-schema-in-opentelemetry.md) — спецификацией, используемой ClickStack. Однако эти [схемы все еще существенно различаются](https://www.elastic.co/docs/reference/ecs/ecs-otel-alignment-overview), и пользователи в настоящее время должны самостоятельно преобразовывать события в формате ECS в формат OpenTelemetry перед загрузкой в ClickStack.

Мы рекомендуем выполнять это преобразование с помощью [Vector](https://vector.dev) — легковесного и высокопроизводительного конвейера данных наблюдаемости, который поддерживает мощный язык преобразований Vector Remap Language (VRL).

Если ваши агенты Filebeat настроены на отправку данных в Kafka — поддерживаемый выходной канал Beats — Vector может получать эти события из Kafka, применять преобразования схемы с помощью VRL, а затем пересылать их через OTLP в OpenTelemetry Collector, поставляемый с ClickStack.

В качестве альтернативы Vector также поддерживает прием событий по протоколу Lumberjack, используемому Logstash. Это позволяет агентам Beats отправлять данные напрямую в Vector, где может быть применен тот же процесс преобразования перед пересылкой в ClickStack OpenTelemetry Collector через OTLP.

Ниже мы показываем обе эти архитектуры.

<Image img={migrating_agents} alt='Миграция агентов' size='lg' background />

В следующем примере мы приводим начальные шаги по настройке Vector для приема событий логов от Filebeat через протокол Lumberjack. Мы предоставляем VRL для сопоставления входящих событий ECS со спецификацией OTel перед отправкой их в коллектор ClickStack OpenTelemetry через OTLP. Пользователи, получающие события из Kafka, могут заменить источник Vector Logstash на [источник Kafka](https://vector.dev/docs/reference/configuration/sources/kafka/) — все остальные шаги остаются прежними.

<VerticalStepper headerLevel="h3">

### Установка Vector {#install-vector}

Установите Vector, используя [официальное руководство по установке](https://vector.dev/docs/setup/installation/).

Его можно установить на том же экземпляре, что и ваш коллектор Elastic Stack OTel.

Пользователи могут следовать лучшим практикам в отношении архитектуры и безопасности при [переводе Vector в продакшн](https://vector.dev/docs/setup/going-to-prod/).

### Настройка Vector {#configure-vector}

Vector должен быть настроен на прием событий по протоколу Lumberjack, имитируя экземпляр Logstash. Это можно достичь, настроив [источник `logstash`](https://vector.dev/docs/reference/configuration/sources/logstash/) для Vector:

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

События будут приниматься в формате ECS. Их можно преобразовать в схему OpenTelemetry с помощью трансформера Vector Remap Language (VRL). Настройка этого трансформера проста — файл скрипта хранится в отдельном файле:

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
# Определить ключи для игнорирования на корневом уровне
ignored_keys = ["@metadata"]
```


# Задайте префиксы ключей ресурсов
resource_keys = ["host", "cloud", "agent", "service"]



# Создайте отдельные объекты для полей ресурса и записей журнала
resource_obj = {}
log_record_obj = {}



# Копирование всех неигнорируемых корневых ключей в соответствующие объекты

root_keys = keys(.)
for_each(root_keys) -> |\_index, key| {
if !includes(ignored_keys, key) {
val, err = get(., [key])
if err == null { # Проверка, является ли это полем ресурса
is_resource = false
if includes(resource_keys, key) {
is_resource = true
}

            # Добавление в соответствующий объект
            if is_resource {
                resource_obj = set(resource_obj, [key], val) ?? resource_obj
            } else {
                log_record_obj = set(log_record_obj, [key], val) ?? log_record_obj
            }
        }
    }

}


# Разверните оба объекта по отдельности
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

Наконец, преобразованные события можно отправить в ClickStack через коллектор OpenTelemetry по протоколу OTLP. Для этого необходимо настроить приёмник OTLP в Vector, который принимает события из преобразования `remap_filebeat` в качестве входных данных:

```yaml
sinks:
  otlp:
    type: opentelemetry
    inputs: [remap_filebeat] # получает события из преобразования remap — см. ниже
    protocol:
      type: http  # Используйте "grpc" для порта 4317
      uri: http://localhost:4318/v1/logs # конечная точка логов для коллектора OTel
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

<Image img={ingestion_key} alt='Ключи приёма данных' size='lg' />

Итоговая полная конфигурация приведена ниже:

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

Существующие установки Filebeat необходимо просто изменить для отправки событий в Vector. Для этого требуется настроить выход Logstash — при необходимости можно также настроить TLS:


```yaml
# ------------------------------ Вывод в Logstash -------------------------------
output.logstash:
  # Хосты Logstash
  hosts: ["localhost:5044"]

  # Опционально SSL. По умолчанию выключен.
  # Список корневых сертификатов для проверки HTTPS-серверов
  #ssl.certificate_authorities: ["/etc/pki/root/ca.pem"]

  # Сертификат для аутентификации SSL-клиента
  #ssl.certificate: "/etc/pki/client/cert.pem"

  # Ключ клиентского сертификата
  #ssl.key: "/etc/pki/client/cert.key"
```

</VerticalStepper>


## Миграция с Elastic Agent {#migrating-from-elastic-agent}

Elastic Agent объединяет различные Elastic Beats в единый пакет. Этот агент интегрируется с [Elastic Fleet](https://www.elastic.co/docs/reference/fleet/fleet-server), что позволяет централизованно оркестрировать и настраивать его.

Пользователи, у которых развернуты Elastic Agents, имеют несколько путей миграции:

- Настройте агент для отправки данных на конечную точку Vector по протоколу Lumberjack. **На данный момент это протестировано только для пользователей, собирающих данные журналов с помощью Elastic Agent.** Это можно централизованно настроить через интерфейс Fleet в Kibana.
- [Запустите агент как Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/fleet/otel-agent). Elastic Agent включает встроенный EDOT Collector, который позволяет инструментировать ваши приложения и инфраструктуру один раз и отправлять данные нескольким поставщикам и бэкендам. В этой конфигурации пользователи могут просто настроить EDOT-коллектор для пересылки событий в ClickStack OTel-коллектор по протоколу OTLP. **Этот подход поддерживает все типы событий.**

Ниже мы демонстрируем оба этих варианта.

### Отправка данных через Vector {#sending-data-via-vector}

<VerticalStepper headerLevel="h4">

#### Установка и настройка Vector {#install-configure-vector}

Установите и настройте Vector, используя [те же шаги](#install-vector), что задокументированы для миграции с Filebeat.

#### Настройка Elastic Agent {#configure-elastic-agent}

Elastic Agent необходимо настроить для отправки данных по протоколу Lumberjack (Logstash). Это [поддерживаемый шаблон развертывания](https://www.elastic.co/docs/manage-data/ingest/ingest-reference-architectures/ls-networkbridge), который можно настроить либо централизованно, либо [через файл конфигурации агента `elastic-agent.yaml`](https://www.elastic.co/docs/reference/fleet/logstash-output), если развертывание происходит без Fleet.

Централизованная настройка через Kibana может быть выполнена путем добавления [выхода (Output) в Fleet](https://www.elastic.co/docs/reference/fleet/fleet-settings#output-settings).

<Image img={add_logstash_output} alt='Добавить выход Logstash' size='md' />

Этот выход затем можно использовать в [политике агента](https://www.elastic.co/docs/reference/fleet/agent-policy). В этом случае все агенты, использующие эту политику, автоматически будут отправлять данные в Vector.

<Image img={agent_output_settings} alt='Настройки агента' size='md' />

Поскольку это требует настройки защищенной связи по TLS, мы рекомендуем руководство ["Configure SSL/TLS for the Logstash output"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output), которому можно следовать, предполагая, что экземпляр Vector пользователя выполняет роль Logstash.

Обратите внимание, что это требует от пользователей настройки источника Logstash в Vector с использованием взаимной TLS-аутентификации. Используйте ключи и сертификаты, [сгенерированные в руководстве](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs), для соответствующей настройки источника.

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: true # Установите в true, если вы используете TLS.
      # Файлы ниже генерируются на основе шагов по адресу https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs
      crt_file: logstash.crt
      key_file: logstash.key
      ca_file: ca.crt
      verify_certificate: true
```

</VerticalStepper>

### Запуск Elastic Agent в качестве OpenTelemetry-коллектора {#run-agent-as-otel}

Elastic Agent включает встроенный EDOT Collector, который позволяет инструментировать ваши приложения и инфраструктуру один раз и отправлять данные нескольким поставщикам и бэкендам.

:::note Интеграции агента и оркестровка
Пользователи, запускающие EDOT-коллектор, поставляемый вместе с Elastic Agent, не смогут воспользоваться [существующими интеграциями агента](https://www.elastic.co/docs/reference/fleet/manage-integrations). Кроме того, коллектор нельзя централизованно управлять через Fleet, что вынуждает пользователя запускать [агент в автономном режиме](https://www.elastic.co/docs/reference/fleet/configure-standalone-elastic-agents) и самостоятельно управлять конфигурацией.
:::

Чтобы запустить Elastic Agent с EDOT-коллектором, ознакомьтесь с [официальным руководством Elastic](https://www.elastic.co/docs/reference/fleet/otel-agent-transform). Вместо настройки конечной точки Elastic, как указано в руководстве, удалите существующие `exporters` и настройте OTLP-выход для отправки данных в ClickStack OpenTelemetry-коллектор. Например, конфигурация экспортеров будет выглядеть так:

```yaml
exporters:
  # Exporter to send logs and metrics to Elasticsearch Managed OTLP Input
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: ${YOUR_INGESTION_API_KEY}
    tls:
      insecure: true
```


`YOUR_INGESTION_API_KEY` здесь создаётся ClickStack. Вы можете найти ключ в приложении HyperDX в разделе `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ключи приёма данных" size="lg" />

Если Vector настроен на использование взаимного TLS, с сертификатом и ключами, сгенерированными по шагам из руководства [&quot;Configure SSL/TLS for the Logstash output&quot;](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output), экспортер `otlp` нужно будет настроить соответствующим образом, например:

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


## Миграция с коллектора Elastic OpenTelemetry {#migrating-from-elastic-otel-collector}

Пользователи, которые уже используют [Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/opentelemetry), могут просто перенастроить свои агенты для отправки данных в коллектор ClickStack OpenTelemetry по протоколу OTLP. Необходимые действия идентичны описанным выше для запуска [Elastic Agent в качестве коллектора OpenTelemetry](#run-agent-as-otel). Данный подход применим для всех типов данных.
