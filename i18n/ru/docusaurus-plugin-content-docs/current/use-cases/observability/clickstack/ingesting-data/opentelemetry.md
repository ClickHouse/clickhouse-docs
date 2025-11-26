---
slug: /use-cases/observability/clickstack/ingesting-data/opentelemetry
pagination_prev: null
pagination_next: null
description: 'Ингестия данных с помощью OpenTelemetry для ClickStack — стека наблюдаемости ClickHouse'
title: 'Ингестия с использованием OpenTelemetry'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'traces', 'observability', 'telemetry']
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

Все данные поступают в ClickStack через экземпляр **OpenTelemetry (OTel) collector**, который является основной точкой входа для логов, метрик, трейсов и данных сессий. Для этого экземпляра мы рекомендуем использовать официальный [дистрибутив ClickStack](#installing-otel-collector) коллектора.

Пользователи отправляют данные в этот коллектор из [языковых SDK](/use-cases/observability/clickstack/sdks) или через агентов сбора данных, которые собирают инфраструктурные метрики и логи (например, OTel collectors в роли [agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) или другие технологии, такие как [Fluentd](https://www.fluentd.org/) или [Vector](https://vector.dev/)).


## Установка ClickStack OpenTelemetry collector {#installing-otel-collector}

ClickStack OpenTelemetry collector включён в большинство дистрибутивов ClickStack, включая:

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
- [Helm](/use-cases/observability/clickstack/deployment/helm)

### Автономный режим {#standalone}

ClickStack OTel collector также может быть развернут в автономном режиме, независимо от других компонентов стека.

Если вы используете дистрибутив [HyperDX-only](/use-cases/observability/clickstack/deployment/hyperdx-only), вы сами отвечаете за доставку данных в ClickHouse. Это можно сделать следующими способами:

- Запустить собственный OpenTelemetry collector и подключить его к ClickHouse — см. ниже.
- Отправлять данные напрямую в ClickHouse с использованием альтернативных инструментов, таких как [Vector](https://vector.dev/), [Fluentd](https://www.fluentd.org/) и т. д., или даже стандартный [OTel contrib collector distribution](https://github.com/open-telemetry/opentelemetry-collector-contrib).

:::note Мы рекомендуем использовать ClickStack OpenTelemetry collector
Это позволяет пользователям получить преимущества стандартизированной ингестии, фиксированных схем и готовой из коробки совместимости с интерфейсом HyperDX. Использование схемы по умолчанию обеспечивает автоматическое определение источников и преднастроенные сопоставления столбцов.
:::

Для получения дополнительных сведений см. раздел ["Deploying the collector"](/use-cases/observability/clickstack/ingesting-data/otel-collector).



## Отправка данных OpenTelemetry

Чтобы отправлять данные в ClickStack, укажите в настройках вашей инструментации OpenTelemetry следующие конечные точки, доступные коллектором OpenTelemetry:

* **HTTP (OTLP):** `http://localhost:4318`
* **gRPC (OTLP):** `localhost:4317`

Для большинства [языковых SDK](/use-cases/observability/clickstack/sdks) и библиотек телеметрии, поддерживающих OpenTelemetry, можно просто задать переменную окружения `OTEL_EXPORTER_OTLP_ENDPOINT` в приложении:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

Кроме того, требуется заголовок Authorization, содержащий ключ API для ингестии. Вы можете найти этот ключ в приложении HyperDX в разделе `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ingestion keys" size="lg" />

Для языковых SDK это можно задать либо с помощью функции `init`, либо через переменную окружения `OTEL_EXPORTER_OTLP_HEADERS`, например:

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<ВАШ_КЛЮЧ_API_ПРИЁМА>'
```

Агенты также должны включать этот заголовок авторизации во все OTLP‑запросы. Например, при развёртывании [дистрибутива contrib OTel collector](https://github.com/open-telemetry/opentelemetry-collector-contrib) в роли агента можно использовать OTLP‑экспортёр. Ниже приведён пример конфигурации агента, который читает этот [структурированный файл логов](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz). Обратите внимание, что нужно указать ключ авторизации для ингестии — см. `<YOUR_API_INGESTION_KEY>`.


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
      address: 0.0.0.0:9888 # Изменено, поскольку на одном хосте работают 2 коллектора
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]
```
