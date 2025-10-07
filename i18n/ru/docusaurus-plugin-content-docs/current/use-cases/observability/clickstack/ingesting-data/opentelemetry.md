---
'slug': '/use-cases/observability/clickstack/ingesting-data/opentelemetry'
'pagination_prev': null
'pagination_next': null
'description': 'Прием данных с OpenTelemetry для ClickStack - Платформа мониторинга
  ClickHouse'
'title': 'Сбор данных с OpenTelemetry'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

Все данные попадают в ClickStack через экземпляр **коллектора OpenTelemetry (OTel)**, который выступает в качестве основной точки входа для логов, метрик, трассировок и данных сессий. Мы рекомендуем использовать официальное [распределение ClickStack](#installing-otel-collector) коллектора для этого экземпляра.

Пользователи отправляют данные в этот коллектор из [языковых SDK](/use-cases/observability/clickstack/sdks) или через агенты сбора данных, собирающие метрики и логи инфраструктуры (такие OTel коллекторы в роли [агента](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) или другие технологии, например, [Fluentd](https://www.fluentd.org/) или [Vector](https://vector.dev/)).

## Установка коллектора OpenTelemetry ClickStack {#installing-otel-collector}

Коллектор OpenTelemetry ClickStack включен в большинство распределений ClickStack, включая:

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
- [Helm](/use-cases/observability/clickstack/deployment/helm)

### Автономно {#standalone}

Коллектор OTel ClickStack также может быть развернут автономно, независимо от других компонентов стека.

Если вы используете распределение [только HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only), вы сами отвечаете за доставку данных в ClickHouse. Это можно сделать следующим образом:

- Запустив собственный коллектор OpenTelemetry и указав его на ClickHouse - смотрите ниже.
- Отправляя данные напрямую в ClickHouse, используя альтернативные инструменты, такие как [Vector](https://vector.dev/), [Fluentd](https://www.fluentd.org/) и т.д., или даже стандартное [распределение OTel contrib collector](https://github.com/open-telemetry/opentelemetry-collector-contrib).

:::note Мы рекомендуем использовать коллектор OpenTelemetry ClickStack
Это позволяет пользователям получить выгоду от стандартизированного ввода, принудительных схем и готовой совместимости с интерфейсом HyperDX. Использование стандартной схемы позволяет автоматически обнаруживать источники и предварительно настраивать соответствия колонок.
:::

Для получения дополнительной информации смотрите ["Развертывание коллектора"](/use-cases/observability/clickstack/ingesting-data/otel-collector).

## Отправка данных OpenTelemetry {#sending-otel-data}

Чтобы отправить данные в ClickStack, укажите вашу инструментализацию OpenTelemetry на следующие конечные точки, доступные через коллектор OpenTelemetry:

- **HTTP (OTLP):** `http://localhost:4318`
- **gRPC (OTLP):** `localhost:4317`

Для большинства [языковых SDK](/use-cases/observability/clickstack/sdks) и библиотек телеметрии, поддерживающих OpenTelemetry, пользователи могут просто установить переменную окружения `OTEL_EXPORTER_OTLP_ENDPOINT` в вашем приложении:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

Кроме того, требуется заголовок авторизации, содержащий ключ API для ввода данных. Вы можете найти ключ в приложении HyperDX под `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ключи ввода" size="lg"/>

Для языковых SDK это можно установить либо с помощью функции `init`, либо через переменную окружения `OTEL_EXPORTER_OTLP_HEADERS`, например:

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

Агенты также должны включать этот заголовок авторизации в любое OTLP-соединение. Например, если вы развертываете [распределение OTel collector contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib) в роли агента, они могут использовать OTLP-экспортер. Пример конфигурации агента, обрабатывающей этот [структурированный журнальный файл](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz), показан ниже. Обратите внимание на необходимость указания ключа авторизации - смотрите `<YOUR_API_INGESTION_KEY>`.

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
  # HTTP setup
  otlphttp/hdx:
    endpoint: 'http://localhost:4318'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip

  # gRPC setup (alternative)
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
      address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]
```
