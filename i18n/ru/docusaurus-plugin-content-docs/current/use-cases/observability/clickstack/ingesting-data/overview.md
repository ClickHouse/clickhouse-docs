---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: 'Приём данных в ClickStack'
sidebar_label: 'Обзор'
sidebar_position: 0
pagination_prev: null
pagination_next: use-cases/observability/clickstack/ingesting-data/opentelemetry
description: 'Обзор приёма данных в ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'наблюдаемость', 'логи', 'мониторинг', 'платформа']
---

import Image from '@theme/IdealImage';
import architecture_with_flow from '@site/static/images/use-cases/observability/simple-architecture-with-flow.png';

Все данные поступают в ClickStack через **сборщик OpenTelemetry (OTel)**, который выступает основной точкой входа для логов, метрик, трейсов и данных сессий.

<Image img={architecture_with_flow} alt="Простая архитектура с потоком" size="md" />

Этот сборщик предоставляет два OTLP-эндпоинта:

* **HTTP** — порт `4318`
* **gRPC** — порт `4317`

Пользователи могут отправлять данные на эти эндпоинты либо напрямую из [языковых SDKs](/use-cases/observability/clickstack/sdks), либо из совместимых с OTel агентов сбора данных, например других OTel collectors, которые собирают метрики и логи инфраструктуры.

Подробнее:

* [**Языковые SDKs**](/use-cases/observability/clickstack/sdks) отвечают за сбор телеметрии изнутри вашего приложения — в первую очередь **трейсов** и **логов** — и экспорт этих данных в OpenTelemetry collector через OTLP-эндпоинт, который выполняет приём в ClickHouse. Дополнительную информацию о языковых SDKs, доступных в ClickStack, см. в разделе [SDKs](/use-cases/observability/clickstack/sdks).

* **Агенты сбора данных** — это агенты, развёрнутые на периферии — на серверах, узлах Kubernetes или рядом с приложениями. Они собирают телеметрию инфраструктуры (например, логи, метрики) или получают события напрямую от приложений, инструментированных с помощью SDKs. В этом случае агент работает на том же хосте, что и приложение, часто как сайдкар или ДемонСет. Эти агенты пересылают данные в центральный OTel collector ClickStack, который выступает в роли [шлюза](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles), обычно развёртываемого один раз на кластер, дата-центр или регион. [Шлюз](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) получает OTLP-события от агентов или приложений и выполняет ингестию в ClickHouse. Подробности см. в разделе [OTel collector](/use-cases/observability/clickstack/ingesting-data/otel-collector). Эти агенты могут быть другими экземплярами OTel collector или альтернативными технологиями, такими как [Fluentd](https://www.fluentd.org/) или [Vector](https://vector.dev/).

:::note Совместимость с OpenTelemetry
Хотя ClickStack предоставляет собственные языковые SDKs и модифицированный OpenTelemetry с расширенной телеметрией и дополнительными возможностями, пользователи также могут бесшовно использовать свои существующие OpenTelemetry SDKs и агентов.
:::
