---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-sdks
title: 'Миграция SDKs из Elastic'
pagination_prev: null
pagination_next: null
sidebar_label: 'Миграция SDKs'
sidebar_position: 6
description: 'Миграция SDKs из Elastic'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

The Elastic Stack предоставляет два типа языковых SDK для инструментирования приложений:

1. **[Официальные APM-агенты Elastic](https://www.elastic.co/docs/reference/apm-agents/)** – они разработаны специально для использования с Elastic Stack. В настоящее время для этих SDK нет возможности прямой миграции. Приложения, использующие их, потребуется переинструментировать с использованием соответствующих [ClickStack SDK](/use-cases/observability/clickstack/sdks).

2. **[Дистрибутивы OpenTelemetry от Elastic (EDOT SDK)](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/)** – это дистрибутивы стандартных OpenTelemetry SDK от Elastic, доступные для .NET, Java, Node.js, PHP и Python. Если ваше приложение уже использует EDOT SDK, повторно инструментировать код не требуется. Вместо этого вы можете просто перенастроить SDK для экспорта телеметрии в OTLP Collector, входящий в состав ClickStack. Подробности смотрите в разделе «[Migrating EDOT SDKs](#migrating-edot-sdks)».

:::note Используйте ClickStack SDK, когда это возможно
Хотя стандартные OpenTelemetry SDK поддерживаются, мы настоятельно рекомендуем использовать для каждого языка [**распространяемые ClickStack SDK**](/use-cases/observability/clickstack/sdks). Эти дистрибутивы включают дополнительное инструментирование, улучшенные значения по умолчанию и специальные расширения, разработанные для бесшовной работы с конвейером ClickStack и интерфейсом HyperDX. Используя ClickStack SDK, вы сможете задействовать расширенные возможности, такие как стек-трейсы исключений, которые недоступны в «чистых» OpenTelemetry или EDOT SDK.
:::

## Миграция EDOT SDKs \\{#migrating-edot-sdks\\}

Аналогично ClickStack SDKS на базе OpenTelemetry, Elastic Distributions of the OpenTelemetry SDKs (EDOT SDKs) представляют собой модифицированные версии официальных OpenTelemetry SDKs. Например, [EDOT Python SDK](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/python/) — это дистрибутив [OpenTelemetry Python SDK](https://opentelemetry.io/docs/languages/python/), модифицированный вендором и предназначенный для бесшовной работы с Elastic Observability.

Поскольку эти SDKS основаны на стандартных библиотеках OpenTelemetry, миграция на ClickStack тривиальна — повторная инструментация не требуется. Достаточно скорректировать конфигурацию, чтобы направлять данные телеметрии в ClickStack OpenTelemetry Collector.

Конфигурирование выполняется по стандартным механизмам OpenTelemetry. Для Python это обычно делается через переменные окружения, как описано в [документации OpenTelemetry Zero-Code Instrumentation](https://opentelemetry.io/docs/zero-code/python/configuration/).

Типичная конфигурация EDOT SDK может выглядеть следующим образом:

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=https://my-deployment.ingest.us-west1.gcp.cloud.es.io
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=ApiKey P....l"
```

Для миграции на ClickStack обновите endpoint так, чтобы он указывал на локальный OTLP Collector, и измените заголовок авторизации:

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>"
```

Ваш ключ API для приёма данных генерируется приложением HyperDX и его можно найти в разделе Team Settings → API Keys.

<Image img={ingestion_key} alt="Ingestion keys" size="lg" />
