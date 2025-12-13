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


## Миграция агентов с Elastic {#migrating-agents-from-elastic}

Платформа Elastic Stack предоставляет ряд агентов для сбора данных наблюдаемости. В частности:

- Семейство [Beats](https://www.elastic.co/beats) — такие как [Filebeat](https://www.elastic.co/beats/filebeat), [Metricbeat](https://www.elastic.co/beats/metricbeat) и [Packetbeat](https://www.elastic.co/beats/packetbeat) — все они основаны на библиотеке `libbeat`. Эти Beats поддерживают [отправку данных в Elasticsearch, Kafka, Redis или Logstash](https://www.elastic.co/docs/reference/beats/filebeat/configuring-output) по протоколу Lumberjack.
- [`Elastic Agent`](https://www.elastic.co/elastic-agent) представляет собой унифицированный агент, способный собирать логи, метрики и трассировки. Этот агент может централизованно управляться через [Elastic Fleet Server](https://www.elastic.co/docs/reference/fleet/manage-elastic-agents-in-fleet) и поддерживает отправку данных в Elasticsearch, Logstash, Kafka или Redis.
- Elastic также предоставляет дистрибутив [OpenTelemetry Collector — EDOT](https://www.elastic.co/docs/reference/opentelemetry). Хотя в настоящее время он не может управляться через Fleet Server, он предлагает более гибкий и открытый путь для пользователей, мигрирующих на ClickStack.

Оптимальный путь миграции зависит от того, какие агент(ы) используются в данный момент. В последующих разделах мы описываем варианты миграции для каждого основного типа агента. Наша цель — свести к минимуму сложности и, где возможно, позволить пользователям продолжать использовать свои существующие агенты в ходе перехода.

## Предпочтительный путь миграции {#prefered-migration-path}

По возможности мы рекомендуем мигрировать на [OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector/) для сбора всех логов, метрик и трейсов, развёртывая коллектор на [периферии в роли агента](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles). Это обеспечивает наиболее эффективную передачу данных и позволяет избежать излишней архитектурной сложности и преобразований данных.

:::note Почему OpenTelemetry Collector?
OpenTelemetry Collector обеспечивает масштабируемое и независимое от поставщика решение для ингестии данных наблюдаемости. Мы понимаем, что некоторые организации эксплуатируют инфраструктуру из тысяч — или даже десятков тысяч — Elastic-агентов. Для таких пользователей сохранение совместимости с существующей агентской инфраструктурой может быть критически важным. Эта документация призвана поддержать такой подход, а также помочь командам постепенно перейти на сбор данных на базе OpenTelemetry.
:::

## Конечная точка OpenTelemetry в ClickHouse {#clickhouse-otel-endpoint}

Все данные поступают в ClickStack через экземпляр **OpenTelemetry (OTel) collector**, который является основной точкой входа для логов, метрик, трассировок и данных сессий. Мы рекомендуем использовать официальный [дистрибутив ClickStack](/use-cases/observability/clickstack/ingesting-data/opentelemetry#installing-otel-collector) этого коллектора, если он ещё не [включён в вашу модель развёртывания ClickStack](/use-cases/observability/clickstack/deployment).

Пользователи отправляют данные в этот коллектор из [языковых SDKs](/use-cases/observability/clickstack/sdks) или через агенты сбора данных, которые собирают метрики и логи инфраструктуры (например, OTel collector в роли [agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) или другие технологии, такие как [Fluentd](https://www.fluentd.org/) или [Vector](https://vector.dev/)).

**Мы предполагаем, что этот коллектор доступен на всех этапах миграции агентов**.

## Миграция с Beats {#migrating-to-beats}

Пользователи с крупными развертываниями Beats могут захотеть сохранить их при миграции на ClickStack.

**В настоящее время этот вариант протестирован только с Filebeat и поэтому подходит только для логов.**

Агенты Beats используют [Elastic Common Schema (ECS)](https://www.elastic.co/docs/reference/ecs), который сейчас [находится в процессе интеграции в спецификацию OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0199-support-elastic-common-schema-in-opentelemetry.md), используемую ClickStack. Однако эти [схемы по‑прежнему существенно различаются](https://www.elastic.co/docs/reference/ecs/ecs-otel-alignment-overview), и на данный момент пользователи сами отвечают за преобразование событий в формате ECS в формат OpenTelemetry до их ингестии в ClickStack.

Мы рекомендуем выполнять это преобразование с помощью [Vector](https://vector.dev) — лёгкого и высокопроизводительного конвейера данных для наблюдаемости, который поддерживает мощный язык трансформаций Vector Remap Language (VRL). 

Если ваши агенты Filebeat настроены на отправку данных в Kafka — поддерживаемый Beats вариант вывода, — Vector может забирать эти события из Kafka, применять к ним преобразование схемы с использованием VRL и затем пересылать их через OTLP в коллектор OpenTelemetry, поставляемый с ClickStack.

Кроме того, Vector также поддерживает приём событий по протоколу Lumberjack, используемому Logstash. Это позволяет агентам Beats отправлять данные напрямую в Vector, где к ним может быть применён тот же процесс трансформации перед пересылкой в коллектор OpenTelemetry ClickStack по OTLP.

Ниже мы показываем обе эти архитектуры.

<Image img={migrating_agents} alt="Migrating agents" size="lg" background/>

В следующем примере мы приводим начальные шаги по настройке Vector для приёма событий логов от Filebeat через протокол Lumberjack. Мы предоставляем VRL для сопоставления входящих событий ECS со спецификацией OTel перед отправкой их в коллектор OpenTelemetry ClickStack по OTLP. Пользователи, потребляющие события из Kafka, могут заменить источник Vector Logstash на [источник Kafka](https://vector.dev/docs/reference/configuration/sources/kafka/) — все остальные шаги остаются без изменений.

<VerticalStepper headerLevel="h3">
  ### Установка Vector

  Установите Vector, следуя [официальному руководству по установке](https://vector.dev/docs/setup/installation/).

  Это можно установить на том же экземпляре, что и ваш OTel collector Elastic Stack.

  Пользователи могут следовать лучшим практикам по архитектуре и безопасности при [переводе Vector в production](https://vector.dev/docs/setup/going-to-prod/).

  ### Настройка Vector

  Vector должен быть настроен для приёма событий по протоколу Lumberjack, имитируя экземпляр Logstash. Это достигается путём настройки [источника `logstash`](https://vector.dev/docs/reference/configuration/sources/logstash/) для Vector:

  ```yaml
  sources:
    beats:
      type: logstash
      address: 0.0.0.0:5044
      tls:
        enabled: false  # Установите значение true при использовании TLS
        # Файлы ниже генерируются в соответствии с инструкциями по адресу https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs
        # crt_file: logstash.crt
        # key_file: logstash.key
        # ca_file: ca.crt
        # verify_certificate: true
  ```

  :::note Конфигурация TLS
  Если требуется взаимная TLS-аутентификация (Mutual TLS), сгенерируйте сертификаты и ключи, используя руководство Elastic [«Configure SSL/TLS for the Logstash output»](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output). После этого их можно указать в конфигурации, как показано выше.
  :::

  События будут получены в формате ECS. Их можно преобразовать в схему OpenTelemetry с помощью трансформера Vector Remap Language (VRL). Настройка этого трансформера проста — файл скрипта хранится отдельно:

  ```yaml
  transforms:
    remap_filebeat:
      inputs: ["beats"]
      type: "remap"
      file: 'beat_to_otel.vrl'
  ```

  Обратите внимание, что он получает события из указанного выше источника `beats`. Наш скрипт преобразования (remap) показан ниже. Этот скрипт был протестирован только с событиями журналов, но может служить основой для других форматов.

  <details>
    <summary>VRL — из ECS в OTel</summary>

    ```javascript
    # Определение ключей для игнорирования на корневом уровне
    ignored_keys = ["@metadata"]

    # Определение префиксов ключей ресурсов
    resource_keys = ["host", "cloud", "agent", "service"]

    # Создание отдельных объектов для полей ресурсов и записей журнала
    resource_obj = {}
    log_record_obj = {}

    # Копирование всех неигнорируемых корневых ключей в соответствующие объекты
    root_keys = keys(.)
    for_each(root_keys) -> |_index, key| {
        if !includes(ignored_keys, key) {
            val, err = get(., [key])
            if err == null {
                # Проверка, является ли это полем ресурса
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

    # Выравнивание обоих объектов по отдельности
    flattened_resources = flatten(resource_obj, separator: ".")
    flattened_logs = flatten(log_record_obj, separator: ".")

    # Обработка атрибутов ресурсов
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

    # Обработка атрибутов записей журнала
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

    # Получение временной метки для timeUnixNano (преобразование в наносекунды)
    timestamp_nano = if exists(.@timestamp) {
        to_unix_timestamp!(parse_timestamp!(.@timestamp, format: "%Y-%m-%dT%H:%M:%S%.3fZ"), unit: "nanoseconds")
    } else {
        to_unix_timestamp(now(), unit: "nanoseconds")
    }

    # Получение поля message/body
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
    ```
  </details>

  Наконец, преобразованные события можно отправить в ClickStack через коллектор OpenTelemetry по протоколу OTLP. Для этого необходимо настроить приёмник OTLP в Vector, который получает события из преобразования `remap_filebeat`:

  ```yaml
  sinks:
    otlp:
      type: opentelemetry
      inputs: [remap_filebeat] # получает события из преобразования remap — см. ниже
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
  ```

  Значение `YOUR_INGESTION_API_KEY` генерируется ClickStack. Ключ можно найти в приложении HyperDX в разделе `Team Settings → API Keys`.

  <Image img={ingestion_key} alt="Ключи для ингестии" size="lg" />

  Итоговая полная конфигурация представлена ниже:

  ```yaml
  sources:
    beats:
      type: logstash
      address: 0.0.0.0:5044
      tls:
        enabled: false  # Установите значение true, если используете TLS
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
        type: http  # Используйте "grpc" для порта 4317
        uri: http://localhost:4318/v1/logs
        method: post
        encoding:
          codec: json
        framing:
          method: newline_delimited
        headers:
          content-type: application/json
  ```

  ### Настройка Filebeat

  Существующие установки Filebeat достаточно изменить для отправки событий в Vector. Для этого необходимо настроить выходной канал Logstash — при необходимости можно также настроить TLS:

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

## Миграция с Elastic Agent {#migrating-from-elastic-agent}

Elastic Agent объединяет различные Elastic Beats в единый пакет. Этот агент интегрируется с [Elastic Fleet](https://www.elastic.co/docs/reference/fleet/fleet-server), что позволяет централизованно оркестрировать и настраивать его.

У пользователей, у которых развернут Elastic Agent, есть несколько вариантов миграции:

- Настроить агент на отправку данных на конечную точку Vector по протоколу Lumberjack. **В настоящее время это протестировано только для пользователей, собирающих логи с помощью Elastic Agent.** Это может быть централизованно настроено через интерфейс Fleet в Kibana.
- [Запустить агент как Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/fleet/otel-agent). Elastic Agent включает встроенный EDOT Collector, который позволяет один раз инструментировать ваши приложения и инфраструктуру и отправлять данные нескольким поставщикам и в различные backend-системы. В этой конфигурации пользователи могут просто настроить EDOT collector на пересылку событий в ClickStack OTel collector по OTLP. **Этот подход поддерживает все типы событий.**

Ниже приводятся оба этих варианта.

### Отправка данных через Vector {#sending-data-via-vector}

<VerticalStepper headerLevel="h4">

#### Установка и настройка Vector {#install-configure-vector}

Установите и настройте Vector, используя [те же шаги](#install-vector), которые описаны для миграции с Filebeat.

#### Настройка Elastic Agent {#configure-elastic-agent}

Необходимо настроить Elastic Agent для отправки данных через протокол Logstash Lumberjack. Это [поддерживаемый вариант развертывания](https://www.elastic.co/docs/manage-data/ingest/ingest-reference-architectures/ls-networkbridge), и его можно настроить централизованно или [через конфигурационный файл агента `elastic-agent.yaml`](https://www.elastic.co/docs/reference/fleet/logstash-output), если вы разворачиваете без Fleet.

Централизованную конфигурацию через Kibana можно выполнить, добавив [Output в Fleet](https://www.elastic.co/docs/reference/fleet/fleet-settings#output-settings).

<Image img={add_logstash_output} alt="Добавление Logstash Output" size="md"/>

Этот Output затем может быть использован в [политике агента](https://www.elastic.co/docs/reference/fleet/agent-policy). Это автоматически приведёт к тому, что все агенты, использующие эту политику, будут отправлять свои данные в Vector.

<Image img={agent_output_settings} alt="Настройки агента" size="md"/>

Поскольку для этого требуется настройка защищённого взаимодействия по TLS, мы рекомендуем руководство ["Configure SSL/TLS for the Logstash output"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output), которому можно следовать, предполагая, что ваш экземпляр Vector выступает в роли Logstash.

Обратите внимание, что для этого пользователям необходимо настроить источник Logstash в Vector также на взаимную аутентификацию TLS (mTLS). Используйте ключи и сертификаты, [сгенерированные по руководству](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs), чтобы корректно настроить вход.

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: true  # Установите true, если вы используете TLS. 
      # Файлы ниже генерируются по шагам из https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs
      crt_file: logstash.crt
      key_file: logstash.key
      ca_file: ca.crt
      verify_certificate: true
```

</VerticalStepper>

### Запуск Elastic Agent как коллектора OpenTelemetry {#sending-data-via-vector}

Elastic Agent включает встроенный EDOT Collector, который позволяет один раз инструментировать ваши приложения и инфраструктуру и отправлять данные нескольким поставщикам и в разные бэкэнды.

:::note Интеграции и оркестрация агента
Пользователи, запускающие EDOT Collector, поставляемый с Elastic Agent, не смогут использовать [существующие интеграции, предлагаемые агентом](https://www.elastic.co/docs/reference/fleet/manage-integrations). Кроме того, коллектор не может централизованно управляться через Fleet — это вынуждает пользователя запускать [агент в автономном режиме](https://www.elastic.co/docs/reference/fleet/configure-standalone-elastic-agents) и самостоятельно управлять конфигурацией.
:::

Чтобы запустить Elastic Agent с EDOT Collector, обратитесь к [официальному руководству Elastic](https://www.elastic.co/docs/reference/fleet/otel-agent-transform). Вместо настройки конечной точки Elastic, как указано в руководстве, удалите существующие `exporters` и настройте вывод OTLP, отправляя данные в коллектор OpenTelemetry от ClickStack. Например, конфигурация для `exporters` будет следующей:

```yaml
exporters:
  # Экспортер для отправки логов и метрик в Elasticsearch Managed OTLP Input
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: ${YOUR_INGESTION_API_KEY}
    tls:
      insecure: true
```

`YOUR_INGESTION_API_KEY` здесь генерируется в ClickStack. Вы можете найти ключ в приложении HyperDX в разделе `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ключи для ингестии" size="lg" />

Если Vector был настроен на использование взаимной аутентификации TLS, с сертификатом и ключами, сгенерированными по шагам из руководства [&quot;Настройка SSL/TLS для вывода Logstash&quot;](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output), экспортёр `otlp` потребуется настроить соответствующим образом, например:

```yaml
exporters:
  # Экспортер для отправки логов и метрик в Elasticsearch Managed OTLP Input
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


## Миграция с Elastic OpenTelemetry collector {#migrating-from-elastic-otel-collector}

Пользователи, которые уже используют [Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/opentelemetry), могут просто перенастроить свои агенты на отправку данных в коллектор OpenTelemetry ClickStack по OTLP. Необходимые шаги совпадают с описанными выше для запуска [Elastic Agent в роли коллектора OpenTelemetry](#run-agent-as-otel). Этот подход может использоваться для всех типов данных.