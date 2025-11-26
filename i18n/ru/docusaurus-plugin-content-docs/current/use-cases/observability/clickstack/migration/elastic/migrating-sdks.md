---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-sdks
title: 'Миграция SDK из Elastic'
pagination_prev: null
pagination_next: null
sidebar_label: 'Миграция SDK'
sidebar_position: 6
description: 'Миграция SDK из Elastic'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

Elastic Stack предоставляет два типа SDK для разных языков программирования для инструментирования приложений:

1. **[Официальные APM-агенты Elastic](https://www.elastic.co/docs/reference/apm-agents/)** – они разработаны специально для использования с Elastic Stack. В настоящее время для этих SDK нет прямого пути миграции. Приложения, использующие их, потребуется переинструментировать, используя соответствующие [ClickStack SDKs](/use-cases/observability/clickstack/sdks).

2. **[Дистрибутивы OpenTelemetry от Elastic (EDOT SDKs)](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/)** – это дистрибутивы стандартных OpenTelemetry SDKs от Elastic, доступные для .NET, Java, Node.js, PHP и Python. Если ваше приложение уже использует EDOT SDK, вам не нужно заново инструментировать код. Вместо этого вы можете просто перенастроить SDK для экспорта телеметрических данных в OTLP Collector, включённый в ClickStack. См. раздел [&quot;Миграция EDOT SDKs&quot;](#migrating-edot-sdks) для получения дополнительной информации.

:::note Используйте ClickStack SDKs, когда это возможно
Хотя стандартные OpenTelemetry SDKs поддерживаются, мы настоятельно рекомендуем использовать [**ClickStack-distributed SDKs**](/use-cases/observability/clickstack/sdks) для каждого языка. Эти дистрибутивы включают дополнительное инструментирование, улучшенные значения по умолчанию и пользовательские расширения, разработанные для бесшовной работы с конвейером ClickStack и интерфейсом HyperDX. Используя ClickStack SDKs, вы получаете доступ к расширенным возможностям, таким как трассировки стеков исключений, которые недоступны в стандартных OpenTelemetry или EDOT SDKs.
:::


## Миграция EDOT SDKs

Аналогично ClickStack SDKs на базе OpenTelemetry, Elastic Distributions of the OpenTelemetry SDKs (EDOT SDKs) представляют собой кастомизированные версии официальных OpenTelemetry SDKs. Например, [EDOT Python SDK](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/python/) — это модифицированный поставщиком дистрибутив [OpenTelemetry Python SDK](https://opentelemetry.io/docs/languages/python/), разработанный для бесшовной работы с Elastic Observability.

Поскольку эти SDKs основаны на стандартных библиотеках OpenTelemetry, миграция на ClickStack выполняется просто — повторная инструментация не требуется. Нужно лишь скорректировать конфигурацию, чтобы направлять телеметрию в ClickStack OpenTelemetry Collector.

Конфигурация выполняется с использованием стандартных механизмов OpenTelemetry. Для Python это, как правило, делается через переменные окружения, как описано в [документации OpenTelemetry Zero-Code Instrumentation](https://opentelemetry.io/docs/zero-code/python/configuration/).

Типичная конфигурация EDOT SDK может выглядеть следующим образом:

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<имя-приложения>
export OTEL_EXPORTER_OTLP_ENDPOINT=https://my-deployment.ingest.us-west1.gcp.cloud.es.io
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=ApiKey P....l"
```

Чтобы перейти на ClickStack, обновите конечную точку (endpoint), чтобы она указывала на локальный OTLP Collector, и измените заголовок Authorization:

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<имя-приложения>
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_HEADERS="authorization=<ВАШ_КЛЮЧ_API_ПРИЁМА>"
```

Ключ API для приёма данных генерируется приложением HyperDX и доступен в разделе Team Settings → API Keys.

<Image img={ingestion_key} alt="Ключи для приёма данных" size="lg" />
