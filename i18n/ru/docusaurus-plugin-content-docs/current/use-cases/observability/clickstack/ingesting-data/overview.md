---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: 'Загрузка данных в ClickStack'
sidebar_label: 'Обзор'
sidebar_position: 0
pagination_prev: null
pagination_next: use-cases/observability/clickstack/ingesting-data/opentelemetry
description: 'Обзор загрузки данных в ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'observability', 'logs', 'monitoring', 'platform']
---

import Image from '@theme/IdealImage';
import architecture_with_flow from '@site/static/images/use-cases/observability/simple-architecture-with-flow.png';

Все данные поступают в ClickStack через **коллектор OpenTelemetry (OTel)**, который является основной точкой входа для логов, метрик, трассировок и данных сессий.

<Image img={architecture_with_flow} alt="Простая архитектура с потоком" size="md" />

Этот коллектор предоставляет два OTLP-эндпоинта:

* **HTTP** — порт `4318`
* **gRPC** — порт `4317`

Пользователи могут отправлять данные на эти эндпоинты либо напрямую из [языковых SDK](/use-cases/observability/clickstack/sdks), либо из совместимых с OTel агентов сбора данных, например других OTel-коллекторов, собирающих инфраструктурные метрики и логи.

Более подробно:

* [**Языковые SDK**](/use-cases/observability/clickstack/sdks) отвечают за сбор телеметрии изнутри вашего приложения — в первую очередь **трассировок** и **логов** — и экспорт этих данных в коллектор OpenTelemetry через OTLP-эндпоинт, который выполняет загрузку данных в ClickHouse. Дополнительную информацию о языковых SDK, доступных в ClickStack, см. в разделе [SDKs](/use-cases/observability/clickstack/sdks).

* **Агенты сбора данных** — это агенты, развёртываемые на периферии — на серверах, узлах Kubernetes или рядом с приложениями. Они собирают телеметрию инфраструктуры (например, логи и метрики) или получают события напрямую от приложений, инструментированных с помощью SDK. В этом случае агент работает на том же хосте, что и приложение, часто в виде сайдкара или DaemonSet. Эти агенты пересылают данные в центральный OTel-коллектор ClickStack, который выполняет роль [шлюза](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles), обычно развёртываемого один раз на кластер, дата-центр или регион. [Шлюз](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) принимает OTLP-события от агентов или приложений и выполняет загрузку данных в ClickHouse. Подробности см. в разделе [OTel collector](/use-cases/observability/clickstack/ingesting-data/otel-collector). В качестве таких агентов могут выступать другие экземпляры OTel-коллектора или альтернативные технологии, такие как [Fluentd](https://www.fluentd.org/) или [Vector](https://vector.dev/).

:::note OpenTelemetry compatibility
Хотя ClickStack предлагает собственные языковые SDK и кастомный OpenTelemetry с расширенными возможностями телеметрии, пользователи также могут без проблем использовать свои существующие OpenTelemetry SDK и агентов.
:::
