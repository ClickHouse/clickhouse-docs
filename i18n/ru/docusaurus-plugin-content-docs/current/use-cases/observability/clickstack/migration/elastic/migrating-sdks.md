---
'slug': '/use-cases/observability/clickstack/migration/elastic/migrating-sdks'
'title': 'Миграция SDK из Elastic'
'pagination_prev': null
'pagination_next': null
'sidebar_label': 'Миграция SDK'
'sidebar_position': 6
'description': 'Миграция SDK из Elastic'
'show_related_blogs': true
'keywords':
- 'ClickStack'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

Elastic Stack предоставляет два типа языковых SDK для инструментирования приложений:

1. **[Официальные APM-агенты Elastic](https://www.elastic.co/docs/reference/apm-agents/)** – Эти агенты созданы специально для использования с Elastic Stack. В настоящее время нет прямого пути миграции для этих SDK. Приложения, которые их используют, должны быть повторно инструментированы с использованием соответствующих [ClickStack SDK](/use-cases/observability/clickstack/sdks).

2. **[Распределения OpenTelemetry от Elastic (EDOT SDK)](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/)** – Это распределения Elastic стандартных SDK OpenTelemetry, доступных для .NET, Java, Node.js, PHP и Python. Если ваше приложение уже использует EDOT SDK, вам не нужно повторно инструментировать свой код. Вместо этого вы можете просто перезаписать конфигурацию SDK для экспорта телеметрических данных в OTLP Collector, который включен в ClickStack. См. раздел ["Миграция EDOT SDK"](#migrating-edot-sdks) для получения дополнительных сведений.

:::note Используйте ClickStack SDK, где это возможно
Хотя стандартные SDK OpenTelemetry поддерживаются, мы настоятельно рекомендуем использовать [**дистрибутивы ClickStack SDK**](/use-cases/observability/clickstack/sdks) для каждого языка. Эти распределения включают дополнительное инструментирование, улучшенные настройки по умолчанию и пользовательские расширения, разработанные для работы в унисон с конвейером ClickStack и интерфейсом HyperDX. Используя ClickStack SDK, вы можете разблокировать расширенные функции, такие как трассировки стека исключений, которые недоступны с обычными OpenTelemetry или EDOT SDK.
:::

## Миграция EDOT SDK {#migrating-edot-sdks}

Аналогично ClickStack OpenTelemetry-базированным SDK, Распределения OpenTelemetry от Elastic (EDOT SDK) являются специализированными версиями официальных SDK OpenTelemetry. Например, [EDOT Python SDK](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/python/) является настроенным распределением [OpenTelemetry Python SDK](https://opentelemetry.io/docs/languages/python/), разработанным для беспрепятственной работы с Elastic Observability.

Поскольку эти SDK основаны на стандартных библиотеках OpenTelemetry, миграция на ClickStack является простой - повторное инструментирование не требуется. Вам нужно только настроить конфигурацию для направления телеметрических данных в ClickStack OpenTelemetry Collector.

Конфигурация следует стандартным механизмам OpenTelemetry. Для Python это обычно делается через переменные окружения, как описано в [документации OpenTelemetry Zero-Code Instrumentation](https://opentelemetry.io/docs/zero-code/python/configuration/).

Типичная конфигурация EDOT SDK может выглядеть так:

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=https://my-deployment.ingest.us-west1.gcp.cloud.es.io
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=ApiKey P....l"
```

Чтобы мигрировать на ClickStack, обновите конечную точку, указывающую на локальный OTLP Collector, и измените заголовок авторизации:

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>"
```

Ваш ключ API для загрузки генерируется приложением HyperDX и его можно найти в разделе Настройки команды → Ключи API.

<Image img={ingestion_key} alt="Ключи для загрузки" size="lg"/>
