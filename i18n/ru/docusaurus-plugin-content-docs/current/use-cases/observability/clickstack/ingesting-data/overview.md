---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: 'Загрузка данных в ClickStack'
sidebar_label: 'Обзор'
sidebar_position: 0
pagination_prev: null
pagination_next: use-cases/observability/clickstack/ingesting-data/opentelemetry
description: 'Обзор загрузки данных в ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'наблюдаемость', 'логи', 'мониторинг', 'платформа']
---

import Image from '@theme/IdealImage';
import architecture_with_flow from '@site/static/images/use-cases/observability/simple-architecture-with-flow.png';

Все данные поступают в ClickStack через **коллектор OpenTelemetry (OTel)**, который выступает основной точкой входа для логов, метрик, трейсов и данных сессий.

<Image img={architecture_with_flow} alt="Простая архитектура с потоками данных" size="md" />

Этот коллектор предоставляет два OTLP-эндпойнта:

* **HTTP** — порт `4318`
* **gRPC** — порт `4317`

Пользователи могут отправлять данные на эти эндпойнты либо напрямую из [SDK для языков программирования](/use-cases/observability/clickstack/sdks), либо из совместимых с OTel агентов сбора данных, например других OTel-коллекторов, собирающих метрики и логи инфраструктуры.

Подробнее:

* [**SDK для языков программирования**](/use-cases/observability/clickstack/sdks) отвечают за сбор телеметрии из вашего приложения — в первую очередь **трейсов** и **логов** — и экспорт этих данных в коллектор OpenTelemetry через OTLP-эндпойнт, который обрабатывает приём данных в ClickHouse. Для получения дополнительной информации о доступных в ClickStack SDK см. раздел [SDKs](/use-cases/observability/clickstack/sdks).

* **Агенты сбора данных** — это агенты, развернутые на периферии — на серверах, узлах Kubernetes или рядом с приложениями. Они собирают телеметрию инфраструктуры (например, логи, метрики) или принимают события напрямую от приложений, инструментированных с помощью SDK. В этом случае агент запускается на том же хосте, что и приложение, часто как sidecar или DaemonSet. Эти агенты пересылают данные в центральный OTel-коллектор ClickStack, который выполняет роль [шлюза](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles), как правило, развернутого по одному на кластер, дата-центр или регион. [Шлюз](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) получает OTLP-события от агентов или приложений и обрабатывает приём данных в ClickHouse. Подробнее см. раздел [OTel collector](/use-cases/observability/clickstack/ingesting-data/otel-collector). Эти агенты могут быть другими экземплярами OTel-коллектора или альтернативными технологиями, такими как [Fluentd](https://www.fluentd.org/) или [Vector](https://vector.dev/).

:::note OpenTelemetry compatibility
Хотя ClickStack предлагает собственные SDK для языков и кастомный коллектор OpenTelemetry с расширенной телеметрией и функциональностью, пользователи также могут без доработок использовать свои существующие OpenTelemetry SDK и агенты.
:::
