---
'slug': '/use-cases/observability/clickstack/migration/elastic/migrating-agents'
'title': 'Перенос агентов из Elastic'
'pagination_prev': null
'pagination_next': null
'sidebar_label': 'Перенос агентов'
'sidebar_position': 5
'description': 'Перенос агентов из Elastic'
'show_related_blogs': true
'keywords':
- 'ClickStack'
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import add_logstash_output from '@site/static/images/use-cases/observability/add-logstash-output.png';
import agent_output_settings from '@site/static/images/use-cases/observability/agent-output-settings.png';
import migrating_agents from '@site/static/images/use-cases/observability/clickstack-migrating-agents.png';

## Миграция агентов из Elastic {#migrating-agents-from-elastic}

Elastic Stack предоставляет ряд агентов для сбора данных по наблюдаемости. В частности:

- Семейство [Beats](https://www.elastic.co/beats) - такие как [Filebeat](https://www.elastic.co/beats/filebeat), [Metricbeat](https://www.elastic.co/beats/metricbeat) и [Packetbeat](https://www.elastic.co/beats/packetbeat) - все основаны на библиотеке `libbeat`. Эти Beats поддерживают [отправку данных в Elasticsearch, Kafka, Redis или Logstash](https://www.elastic.co/docs/reference/beats/filebeat/configuring-output) по протоколу Lumberjack.
- [`Elastic Agent`](https://www.elastic.co/elastic-agent) предоставляет единый агент, способный собирать логи, метрики и трассировки. Этот агент может управляться централизованно через [Elastic Fleet Server](https://www.elastic.co/docs/reference/fleet/manage-elastic-agents-in-fleet) и поддерживает вывод в Elasticsearch, Logstash, Kafka или Redis.
- Elastic также предоставляет дистрибутив [OpenTelemetry Collector - EDOT](https://www.elastic.co/docs/reference/opentelemetry). Хотя в настоящее время его нельзя оркестровать через Fleet Server, он предлагает более гибкий и открытый путь для пользователей, переходящих на ClickStack.

Лучший путь миграции зависит от текущих агентов. В следующих разделах мы документируем варианты миграции для каждого основного типа агентов. Наша цель - минимизировать трение и по возможности позволить пользователям продолжать использовать свои существующие агенты в процессе перехода.

## Предпочтительный путь миграции {#prefered-migration-path}

По возможности мы рекомендуем мигрировать к [OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector/) для сбора всех логов, метрик и трассировок, развертывая коллектор на [границе в роли агента](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles). Это представляет собой наиболее эффективное средство передачи данных и избегает архитектурной сложности и преобразования данных.

:::note Почему OpenTelemetry Collector?
OpenTelemetry Collector предоставляет устойчивое и независимое от поставщика решение для приема данных по наблюдаемости. Мы понимаем, что некоторые организации управляют флотами из тысяч — или даже десятков тысяч — агентов Elastic. Для этих пользователей поддержание совместимости с существующей инфраструктурой агентов может быть критически важным. Эта документация предназначена для поддержки этого, а также для помощи командам в постепенном переходе на коллекцию на основе OpenTelemetry.
:::

## ClickHouse OpenTelemetry endpoint {#clickhouse-otel-endpoint}

Все данные поступают в ClickStack через экземпляр **OpenTelemetry (OTel) collector**, который служит основной точкой входа для логов, метрик, трассировок и данных сессий. Мы рекомендуем использовать официальный [дистрибутив ClickStack](/use-cases/observability/clickstack/ingesting-data/opentelemetry#installing-otel-collector) коллекторов для этого экземпляра, если он не [уже включен в вашу модель развертывания ClickStack](/use-cases/observability/clickstack/deployment).

Пользователи отправляют данные в этот коллектор из [SDK для языков программирования](/use-cases/observability/clickstack/sdks) или через агентов сбора данных, собирающих метрики и логи инфраструктуры (такие как OTel коллектора в роли [агента](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) или других технологий, например, [Fluentd](https://www.fluentd.org/) или [Vector](https://vector.dev/)).

**Мы предполагаем, что этот коллектор доступен для всех этапов миграции агентов**.

## Миграция от beats {#migrating-to-beats}

Пользователи с развернутыми Beats могут захотеть сохранить их при миграции на ClickStack.

**В настоящее время эта опция была протестирована только с Filebeat и, следовательно, подходит только для 로그ов.**

Агенты Beats используют [Elastic Common Schema (ECS)](https://www.elastic.co/docs/reference/ecs), который в настоящее время [находится в процессе интеграции в спецификацию OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0199-support-elastic-common-schema-in-opentelemetry.md), используемую ClickStack. Тем не менее, эти [схемы все еще значительно отличаются](https://www.elastic.co/docs/reference/ecs/ecs-otel-alignment-overview), и пользователи в настоящее время несут ответственность за преобразование событий в формате ECS в формат OpenTelemetry перед отправкой в ClickStack.

Мы рекомендуем выполнять это преобразование с помощью [Vector](https://vector.dev), легковесного и высокопроизводительного конвейера данных по наблюдаемости, который поддерживает мощный язык преобразования под названием Vector Remap Language (VRL).

Если ваши агенты Filebeat настроены на отправку данных в Kafka - поддерживаемый вывод Beats - Vector может получать эти события из Kafka, применять схемные преобразования с использованием VRL и затем пересылать их через OTLP в OpenTelemetry Collector, распределенный с ClickStack.

В качестве альтернативы Vector также поддерживает получение событий по протоколу Lumberjack, используемому Logstash. Это позволяет агентам Beats отправлять данные напрямую в Vector, где тот же процесс преобразования может быть применен перед отправкой в ClickStack OpenTelemetry Collector через OTLP.

Мы иллюстрируем обе эти архитектуры ниже.

<Image img={migrating_agents} alt="Migrating agents" size="lg" background/>

В следующем примере мы предоставим начальные шаги для настройки Vector на получение лог-событий от Filebeat через протокол Lumberjack. Мы предоставим VRL для сопоставления входящих событий ECS со спецификацией OTel, прежде чем отправить их в ClickStack OpenTelemetry collector через OTLP. Пользователи, потребляющие события из Kafka, могут заменить источник Vector Logstash на [Kafka source](https://vector.dev/docs/reference/configuration/sources/kafka/) - все остальные шаги остаются прежними.

<VerticalStepper headerLevel="h3">

### Установите vector {#install-vector}

Установите Vector, следуя [официальному руководству по установке](https://vector.dev/docs/setup/installation/).

Это можно установить на том же экземпляре, что и ваш Elastic Stack OTel collector.

Пользователи могут следовать лучшим практикам в отношении архитектуры и безопасности при [перемещении Vector в продакшн](https://vector.dev/docs/setup/going-to-prod/).

### Настройте vector {#configure-vector}

Vector должен быть настроен для получения событий по протоколу Lumberjack, подражая экземпляру Logstash. Это можно сделать, настроив [`logstash` source](https://vector.dev/docs/reference/configuration/sources/logstash/) для Vector:

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: false  # Set to true if you're using TLS
      # The files below are generated from the steps at https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs
      # crt_file: logstash.crt
      # key_file: logstash.key
      # ca_file: ca.crt
      # verify_certificate: true
```

:::note Настройка TLS
Если требуется взаимная аутентификация TLS, создайте сертификаты и ключи, используя руководство Elastic ["Настройка SSL/TLS для вывода Logstash"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output). Эти сертификаты могут затем быть указаны в конфигурации, как показано выше.
:::

События будут получать в формате ECS. Их можно преобразовать в схему OpenTelemetry с помощью трансформатора Vector Remap Language (VRL). Конфигурация этого трансформатора проста - с сценарным файлом, хранящимся в отдельном файле:

```yaml
transforms:
  remap_filebeat:
    inputs: ["beats"]
    type: "remap"
    file: 'beat_to_otel.vrl'
```

Обратите внимание, что он получает события из вышеуказанного `beats` source. Наш сценарий remap показан ниже. Этот сценарий был протестирован только с лог-событиями, но может служить основой для других форматов.

<details>
<summary>VRL - ECS в OTel</summary>

```javascript

# Define keys to ignore at root level
ignored_keys = ["@metadata"]


# Define resource key prefixes
resource_keys = ["host", "cloud", "agent", "service"]


# Create separate objects for resource and log record fields
resource_obj = {}
log_record_obj = {}


# Copy all non-ignored root keys to appropriate objects
root_keys = keys(.)
for_each(root_keys) -> |_index, key| {
    if !includes(ignored_keys, key) {
        val, err = get(., [key])
        if err == null {
            # Check if this is a resource field
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


# Flatten both objects separately
flattened_resources = flatten(resource_obj, separator: ".")
flattened_logs = flatten(log_record_obj, separator: ".")


# Process resource attributes
resource_attributes = []
resource_keys_list = keys(flattened_resources)
for_each(resource_keys_list) -> |_index, field_key| {
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


# Process log record attributes
log_attributes = []
log_keys_list = keys(flattened_logs)
for_each(log_keys_list) -> |_index, field_key| {
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


# Get timestamp for timeUnixNano (convert to nanoseconds)
timestamp_nano = if exists(.@timestamp) {
    to_unix_timestamp!(parse_timestamp!(.@timestamp, format: "%Y-%m-%dT%H:%M:%S%.3fZ"), unit: "nanoseconds")
} else {
    to_unix_timestamp(now(), unit: "nanoseconds")
}


# Get message/body field
body_value = if exists(.message) {
    to_string!(.message)
} else if exists(.body) {
    to_string!(.body)
} else {
    ""
}


# Create the OpenTelemetry structure
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
```

</details>

Наконец, преобразованные события могут быть отправлены в ClickStack через OpenTelemetry collector по OTLP. Это требует настройки OTLP sink в Vector, который принимает события из трансформации `remap_filebeat` в качестве входных данных:

```yaml
sinks:
  otlp:
    type: opentelemetry
    inputs: [remap_filebeat] # receives events from a remap transform - see below
    protocol:
      type: http  # Use "grpc" for port 4317
      uri: http://localhost:4318/v1/logs # logs endpoint for the OTel collector 
      method: post
      encoding:
        codec: json
      framing:
        method: newline_delimited
      headers:
        content-type: application/json
        authorization: ${YOUR_INGESTION_API_KEY}
```

`YOUR_INGESTION_API_KEY` тут выдается ClickStack. Вы можете найти ключ в приложении HyperDX в разделе `Настройки команды → Ключи API`.

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

Наша окончательная полная конфигурация показана ниже:

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: false  # Set to true if you're using TLS
        #crt_file: /data/elasticsearch-9.0.1/logstash/logstash.crt
        #key_file: /data/elasticsearch-9.0.1/logstash/logstash.key
        #ca_file: /data/elasticsearch-9.0.1/ca/ca.crt
        #verify_certificate: true

transforms:
  remap_filebeat:
    inputs: ["beats"]
    type: "remap"
    file: 'beat_to_otel.vrl'

sinks:
  otlp:
    type: opentelemetry
    inputs: [remap_filebeat]
    protocol:
      type: http  # Use "grpc" for port 4317
      uri: http://localhost:4318/v1/logs
      method: post
      encoding:
        codec: json
      framing:
        method: newline_delimited
      headers:
        content-type: application/json
```

### Настройте Filebeat {#configure-filebeat}

Существующие установки Filebeat просто нужно изменить, чтобы они отправляли свои события в Vector. Это требует настройки вывода Logstash - опять же, TLS можно настроить опционально:

```yaml

# ------------------------------ Logstash Output -------------------------------
output.logstash:
  # The Logstash hosts
  hosts: ["localhost:5044"]

  # Optional SSL. By default is off.
  # List of root certificates for HTTPS server verifications
  #ssl.certificate_authorities: ["/etc/pki/root/ca.pem"]

  # Certificate for SSL client authentication
  #ssl.certificate: "/etc/pki/client/cert.pem"

  # Client Certificate Key
  #ssl.key: "/etc/pki/client/cert.key"
```

</VerticalStepper>

## Миграция от Elastic Agent {#migrating-from-elastic-agent}

Elastic Agent объединяет различные Elastic Beats в один пакет. Этот агент интегрируется с [Elastic Fleet](https://www.elastic.co/docs/reference/fleet/fleet-server), что позволяет централизованно организовывать и настраивать его.

Пользователи с установленными Elastic Agents имеют несколько путей миграции:

- Настройте агент на отправку в конечную точку Vector по протоколу Lumberjack. **В настоящее время эта опция тестировалась только для пользователей, собирающих данные логов с помощью Elastic Agent.** Это можно централизованно настроить через интерфейс Fleet в Kibana.
- [Запустите агент как Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/fleet/otel-agent). Elastic Agent включает встроенный EDOT Collector, который позволяет вам инструментировать ваши приложения и инфраструктуру один раз и отправлять данные нескольким поставщикам и бэкендам. В этой конфигурации пользователи могут просто настроить EDOT collector для пересылки событий в ClickStack OTel collector по OTLP. **Этот подход поддерживает все типы событий.**

Мы демонстрируем оба этих варианта ниже.

### Отправка данных через Vector {#sending-data-via-vector}

<VerticalStepper headerLevel="h4">

#### Установите и настройте Vector {#install-configure-vector}

Установите и настройте Vector, используя [те же шаги](#install-vector), что и те, которые задокументированы для миграции от Filebeat.

#### Настройте Elastic Agent {#configure-elastic-agent}

Elastic Agent необходимо настроить для отправки данных через протокол Logstash Lumberjack. Это [поддерживаемый паттерн развертывания](https://www.elastic.co/docs/manage-data/ingest/ingest-reference-architectures/ls-networkbridge) и может быть настроен централизованно или [через файл конфигурации агента `elastic-agent.yaml`](https://www.elastic.co/docs/reference/fleet/logstash-output), если развертывание происходит без Fleet.

Централизованная конфигурация через Kibana может быть достигнута путем добавления [вывода в Fleet](https://www.elastic.co/docs/reference/fleet/fleet-settings#output-settings).

<Image img={add_logstash_output} alt="Add Logstash output" size="md"/>

Этот вывод затем может быть использован в [политике агента](https://www.elastic.co/docs/reference/fleet/agent-policy). Это автоматически означает, что любые агенты, использующие эту политику, будут отправлять свои данные в Vector.

<Image img={agent_output_settings} alt="Agent settings" size="md"/>

Поскольку это требует настройки защищенной связи по TLS, мы рекомендуем руководство ["Настройка SSL/TLS для вывода Logstash"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output), которое может быть выполнено с учетом того, что ваша экземпляр Vector выполняет роль Logstash.

Обратите внимание, что это требует от пользователей настройки источника Logstash в Vector также для взаимного TLS. Используйте ключи и сертификаты, [сгенерированные в руководстве](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs), чтобы правильно настроить вход.

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: true  # Set to true if you're using TLS. 
      # The files below are generated from the steps at https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs
      crt_file: logstash.crt
      key_file: logstash.key
      ca_file: ca.crt
      verify_certificate: true
```

</VerticalStepper>

### Запустите Elastic Agent как OpenTelemetry collector {#run-agent-as-otel}

Elastic Agent включает встроенный EDOT Collector, который позволяет вам инструментировать ваши приложения и инфраструктуру один раз и отправлять данные нескольким поставщикам и бэкендам.

:::note Интеграции и оркестрация агентов
Пользователи, запускающие EDOT collector, распределенный с Elastic Agent, не смогут использовать [существующие интеграции, предлагаемые агентом](https://www.elastic.co/docs/reference/fleet/manage-integrations). Более того, коллектор не может быть централизованно управляем Fleet - заставляя пользователя запускать [агента в режиме автономной работы](https://www.elastic.co/docs/reference/fleet/configure-standalone-elastic-agents) и самостоятельно управлять конфигурацией.
:::

Чтобы запустить Elastic Agent с EDOT collector, смотрите [официальное руководство Elastic](https://www.elastic.co/docs/reference/fleet/otel-agent-transform). Вместо настройки конечной точки Elastic, как указано в руководстве, удалите существующие `exporters` и настройте вывод OTLP, отправляя данные в ClickStack OpenTelemetry collector. Например, конфигурация для экспортеров станет:

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

`YOUR_INGESTION_API_KEY` здесь выдается ClickStack. Вы можете найти ключ в приложении HyperDX в разделе `Настройки команды → Ключи API`.

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

Если Vector был настроен на использование взаимного TLS, при этом сертификаты и ключи были сгенерированы с использованием шагов из руководства ["Настройка SSL/TLS для вывода Logstash"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output), экспортёр `otlp` будет необходимо настроить соответствующим образом, например:

```yaml
exporters:
  # Exporter to send logs and metrics to Elasticsearch Managed OTLP Input
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

## Миграция от Elastic OpenTelemetry collector {#migrating-from-elastic-otel-collector}

Пользователи, уже использующие [Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/opentelemetry), могут просто перенастроить своих агентов для отправки в ClickStack OpenTelemetry collector через OTLP. Этапы, необходимые для этого, идентичны тем, что описаны выше для запуска [Elastic Agent как OpenTelemetry collector](#run-agent-as-otel). Этот подход можно использовать для всех типов данных.