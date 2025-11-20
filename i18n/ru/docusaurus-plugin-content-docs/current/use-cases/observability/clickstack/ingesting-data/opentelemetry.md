---
slug: /use-cases/observability/clickstack/ingesting-data/opentelemetry
pagination_prev: null
pagination_next: null
description: 'Сбор данных с помощью OpenTelemetry для ClickStack — стека наблюдаемости ClickHouse'
title: 'Сбор данных с помощью OpenTelemetry'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'traces', 'observability', 'telemetry']
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

Все данные поступают в ClickStack через экземпляр **коллектора OpenTelemetry (OTel)**, который служит основной точкой входа для логов, метрик, трейсов и данных сессий. Для этого экземпляра мы рекомендуем использовать официальную [дистрибуцию коллектора ClickStack](#installing-otel-collector).

Пользователи отправляют данные в этот коллектор из [языковых SDK](/use-cases/observability/clickstack/sdks) или через агенты сбора данных, которые собирают метрики и логи инфраструктуры (такие как OTel-коллекторы в роли [агента](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) или другие технологии, например [Fluentd](https://www.fluentd.org/) или [Vector](https://vector.dev/)).


## Установка коллектора ClickStack OpenTelemetry {#installing-otel-collector}

Коллектор ClickStack OpenTelemetry входит в состав большинства дистрибутивов ClickStack, включая:

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
- [Helm](/use-cases/observability/clickstack/deployment/helm)

### Автономное развертывание {#standalone}

Коллектор ClickStack OTel также можно развернуть автономно, независимо от других компонентов стека.

Если вы используете дистрибутив [HyperDX-only](/use-cases/observability/clickstack/deployment/hyperdx-only), вы самостоятельно отвечаете за доставку данных в ClickHouse. Это можно сделать следующими способами:

- Запустить собственный коллектор OpenTelemetry и настроить его на отправку данных в ClickHouse — см. ниже.
- Отправлять данные напрямую в ClickHouse с помощью альтернативных инструментов, таких как [Vector](https://vector.dev/), [Fluentd](https://www.fluentd.org/) и т. д., или даже стандартного [дистрибутива OTel contrib collector](https://github.com/open-telemetry/opentelemetry-collector-contrib).

:::note Мы рекомендуем использовать коллектор ClickStack OpenTelemetry
Это позволяет использовать стандартизированный прием данных, строгие схемы и готовую совместимость с интерфейсом HyperDX. Использование схемы по умолчанию обеспечивает автоматическое определение источников и предварительно настроенное сопоставление столбцов.
:::

Подробнее см. раздел [«Развертывание коллектора»](/use-cases/observability/clickstack/ingesting-data/otel-collector).


## Отправка данных OpenTelemetry {#sending-otel-data}

Чтобы отправить данные в ClickStack, настройте вашу инструментацию OpenTelemetry на следующие конечные точки, предоставляемые коллектором OpenTelemetry:

- **HTTP (OTLP):** `http://localhost:4318`
- **gRPC (OTLP):** `localhost:4317`

Для большинства [SDK языков программирования](/use-cases/observability/clickstack/sdks) и библиотек телеметрии, поддерживающих OpenTelemetry, пользователи могут просто установить переменную окружения `OTEL_EXPORTER_OTLP_ENDPOINT` в своем приложении:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

Кроме того, требуется заголовок авторизации, содержащий ключ API для приема данных. Ключ можно найти в приложении HyperDX в разделе `Team Settings → API Keys`.

<Image img={ingestion_key} alt='Ключи приема данных' size='lg' />

Для SDK языков программирования это можно задать либо через функцию `init`, либо через переменную окружения `OTEL_EXPORTER_OTLP_HEADERS`, например:

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

Агенты также должны включать этот заголовок авторизации во все коммуникации OTLP. Например, при развертывании [contrib-дистрибутива коллектора OTel](https://github.com/open-telemetry/opentelemetry-collector-contrib) в роли агента можно использовать экспортер OTLP. Пример конфигурации агента, обрабатывающего этот [файл структурированных логов](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz), показан ниже. Обратите внимание на необходимость указания ключа авторизации — см. `<YOUR_API_INGESTION_KEY>`.


```yaml
# clickhouse-agent-config.yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
exporters:
  # Настройка HTTP
  otlphttp/hdx:
    endpoint: 'http://localhost:4318'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
 
  # Настройка gRPC (альтернативный вариант)
  otlp/hdx:
    endpoint: 'localhost:4317'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
processors:
  batch:
    timeout: 5s
    send_batch_size: 1000
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Изменено, так как на одном хосте работают 2 коллектора
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]
```
