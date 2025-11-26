---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: 'Приём данных в ClickStack'
sidebar_label: 'Обзор'
sidebar_position: 0
pagination_prev: null
pagination_next: use-cases/observability/clickstack/ingesting-data/opentelemetry
description: 'Общий обзор приёма данных в ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'observability', 'logs', 'monitoring', 'platform']
---

import Image from '@theme/IdealImage';
import architecture_with_flow from '@site/static/images/use-cases/observability/simple-architecture-with-flow.png';

Все данные поступают в ClickStack через **OpenTelemetry (OTel) collector**, который служит основной точкой входа для логов, метрик, трейсов и данных сессий.

<Image img={architecture_with_flow} alt="Простая архитектура с потоком" size="md" />

Этот collector предоставляет два OTLP-эндпоинта:

* **HTTP** — порт `4318`
* **gRPC** — порт `4317`

Пользователи могут отправлять данные на эти эндпоинты либо напрямую из [языковых SDK](/use-cases/observability/clickstack/sdks), либо из совместимых с OTel агентов сбора данных, например других OTel collectors, собирающих метрики и логи инфраструктуры.

Более подробно:

* [**Языковые SDK**](/use-cases/observability/clickstack/sdks) отвечают за сбор телеметрии внутри вашего приложения — в первую очередь **трейсов** и **логов** — и экспорт этих данных в OpenTelemetry collector через OTLP-эндпоинт, который обеспечивает приём данных в ClickHouse. Дополнительные сведения о языковых SDK, доступных в ClickStack, см. в разделе [SDKs](/use-cases/observability/clickstack/sdks).

* **Агенты сбора данных** — это агенты, развёрнутые на периферии — на серверах, узлах Kubernetes или рядом с приложениями. Они собирают телеметрию инфраструктуры (например, логи, метрики) или принимают события напрямую от приложений, инструментированных с помощью SDK. В этом случае агент выполняется на том же хосте, что и приложение, часто как sidecar или ДемонСет. Эти агенты пересылают данные в центральный ClickStack OTel collector, который выступает в роли [шлюза](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles), обычно развёртываемого в единственном экземпляре на кластер, дата-центр или регион. [Шлюз](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) получает OTLP-события от агентов или приложений и обрабатывает ингестию данных в ClickHouse. Подробности см. в разделе [OTel collector](/use-cases/observability/clickstack/ingesting-data/otel-collector). Эти агенты могут представлять собой другие экземпляры OTel collector или альтернативные технологии, такие как [Fluentd](https://www.fluentd.org/) или [Vector](https://vector.dev/).

:::note Совместимость с OpenTelemetry
Хотя ClickStack предоставляет собственные языковые SDK и кастомный OpenTelemetry с расширенной телеметрией и функциональностью, пользователи также могут без доработок использовать свои существующие OpenTelemetry SDK и агентов.
:::
