---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-sdks
title: 'Миграция SDK с Elastic'
pagination_prev: null
pagination_next: null
sidebar_label: 'Миграция SDK'
sidebar_position: 6
description: 'Миграция SDK с Elastic'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

The Elastic Stack предоставляет два типа языковых SDK для инструментирования приложений:

1. **[Elastic Official APM agents](https://www.elastic.co/docs/reference/apm-agents/)** – они разработаны специально для использования с Elastic Stack. В настоящее время для этих SDK нет прямого пути миграции. Приложения, которые их используют, потребуется переинструментировать с помощью соответствующих [ClickStack SDK](/use-cases/observability/clickstack/sdks).

2. **[Elastic Distributions of OpenTelemetry (EDOT SDKs)](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/)** – это дистрибутивы стандартных SDK OpenTelemetry от Elastic, доступные для .NET, Java, Node.js, PHP и Python. Если ваше приложение уже использует EDOT SDK, вам не нужно заново инструментировать код. Вместо этого вы можете просто перенастроить SDK на экспорт телеметрических данных в OTLP Collector, включённый в ClickStack. Дополнительные сведения см. в разделе [&quot;Migrating EDOT SDKs&quot;](#migrating-edot-sdks).

:::note Use ClickStack SDKs where possible
Хотя стандартные SDK OpenTelemetry поддерживаются, мы настоятельно рекомендуем использовать [**распространяемые ClickStack SDK**](/use-cases/observability/clickstack/sdks) для каждого языка. Эти дистрибутивы включают дополнительное инструментирование, улучшенные настройки по умолчанию и пользовательские расширения, разработанные для бесшовной работы с конвейером ClickStack и интерфейсом HyperDX. Используя ClickStack SDK, вы получаете доступ к расширенным возможностям, таким как трассировки стеков исключений, которые недоступны в стандартных SDK OpenTelemetry или EDOT.
:::


## Миграция EDOT SDK {#migrating-edot-sdks}

Подобно SDK ClickStack на основе OpenTelemetry, Elastic Distributions of the OpenTelemetry SDKs (EDOT SDK) представляют собой кастомизированные версии официальных OpenTelemetry SDK. Например, [EDOT Python SDK](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/python/) — это дистрибутив [OpenTelemetry Python SDK](https://opentelemetry.io/docs/languages/python/), адаптированный вендором для бесшовной работы с Elastic Observability.

Поскольку эти SDK основаны на стандартных библиотеках OpenTelemetry, миграция на ClickStack выполняется просто — повторная инструментация не требуется. Необходимо лишь скорректировать конфигурацию, чтобы направить телеметрические данные в ClickStack OpenTelemetry Collector.

Конфигурация выполняется по стандартным механизмам OpenTelemetry. Для Python это обычно делается через переменные окружения, как описано в [документации OpenTelemetry Zero-Code Instrumentation](https://opentelemetry.io/docs/zero-code/python/configuration/).

Типичная конфигурация EDOT SDK может выглядеть следующим образом:

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=https://my-deployment.ingest.us-west1.gcp.cloud.es.io
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=ApiKey P....l"
```

Для миграции на ClickStack обновите endpoint, указав на локальный OTLP Collector, и измените заголовок авторизации:

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>"
```

Ваш API-ключ для приёма данных генерируется приложением HyperDX и находится в разделе Team Settings → API Keys.

<Image img={ingestion_key} alt='Ключи приёма данных' size='lg' />
