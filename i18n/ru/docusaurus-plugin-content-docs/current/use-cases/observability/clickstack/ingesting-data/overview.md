---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: 'Загрузка данных в ClickStack'
sidebar_label: 'Обзор'
sidebar_position: 0
pagination_prev: null
pagination_next: use-cases/observability/clickstack/ingesting-data/opentelemetry
description: 'Обзор процесса загрузки данных в ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'observability', 'logs', 'monitoring', 'platform']
---

import Image from '@theme/IdealImage';
import architecture_with_flow from '@site/static/images/use-cases/observability/simple-architecture-with-flow.png';

Все данные поступают в ClickStack через **коллектор OpenTelemetry (OTel)**, который служит основной точкой входа для логов, метрик, трассировок и данных сессий.

<Image img={architecture_with_flow} alt="Simple architecture with flow" size="md" />

Этот коллектор предоставляет две конечные точки OTLP:

* **HTTP** — порт `4318`
* **gRPC** — порт `4317`

Пользователи могут отправлять данные на эти конечные точки либо напрямую из [языковых SDK](/use-cases/observability/clickstack/sdks), либо через совместимые с OTel агенты сбора данных, например, другие коллекторы OTel, собирающие метрики и логи инфраструктуры.

Более подробно:

* [**Языковые SDK**](/use-cases/observability/clickstack/sdks) отвечают за сбор телеметрии внутри вашего приложения — в первую очередь **трассировок** и **логов** — и экспорт этих данных в коллектор OpenTelemetry через конечную точку OTLP, который обрабатывает их загрузку в ClickHouse. Подробнее о языковых SDK, доступных в ClickStack, см. в разделе [SDK](/use-cases/observability/clickstack/sdks).

* **Агенты сбора данных** — это агенты, развёрнутые на периферии: на серверах, узлах Kubernetes или рядом с приложениями. Они собирают телеметрию инфраструктуры (например, логи, метрики) или получают события напрямую от приложений, инструментированных с помощью SDK. В этом случае агент работает на том же хосте, что и приложение, часто в виде sidecar или DaemonSet. Эти агенты пересылают данные в центральный коллектор OTel ClickStack, который выступает в роли [шлюза](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles), обычно развёрнутого один раз на кластер, центр обработки данных или регион. [Шлюз](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) получает события OTLP от агентов или приложений и обрабатывает их загрузку в ClickHouse. Подробнее см. в разделе [Коллектор OTel](/use-cases/observability/clickstack/ingesting-data/otel-collector). Эти агенты могут быть другими экземплярами коллектора OTel или альтернативными технологиями, такими как [Fluentd](https://www.fluentd.org/) или [Vector](https://vector.dev/).

:::note Совместимость с OpenTelemetry
Хотя ClickStack предлагает собственные языковые SDK и кастомизированный OpenTelemetry с расширенной телеметрией и функциями, пользователи также могут без проблем использовать свои существующие SDK и агенты OpenTelemetry.
:::
