---
'slug': '/use-cases/observability/clickstack/ingesting-data/overview'
'title': 'Загрузка данных в ClickStack'
'sidebar_label': 'Обзор'
'sidebar_position': 0
'pagination_prev': null
'pagination_next': 'use-cases/observability/clickstack/ingesting-data/opentelemetry'
'description': 'Обзор для загрузки данных в ClickStack'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import architecture_with_flow from '@site/static/images/use-cases/observability/simple-architecture-with-flow.png';

Все данные загружаются в ClickStack через **коллектор OpenTelemetry (OTel)**, который является основной точкой входа для логов, метрик, трасс и данных сессий.

<Image img={architecture_with_flow} alt="Простая архитектура с потоками" size="md"/>

Этот коллектор открывает два OTLP конечных точки:

- **HTTP** - порт `4318`
- **gRPC** - порт `4317`

Пользователи могут отправлять данные на эти конечные точки либо напрямую из [SDK языков программирования](/use-cases/observability/clickstack/sdks), либо из совместимых с OTel агентов сбора данных, например, других OTel коллекторов, собирающих метрики и логи инфраструктуры.

Более конкретно:

- [**SDK языков программирования**](/use-cases/observability/clickstack/sdks) отвечают за сбор телеметрии из вашего приложения - в частности, **трасс** и **логов** - и экспорт этих данных в коллектор OpenTelemetry через конечную точку OTLP, которая обрабатывает загрузку в ClickHouse. Для получения дополнительной информации о языковых SDK, доступных с ClickStack, см. [SDKs](/use-cases/observability/clickstack/sdks).

- **Агенты сбора данных** - это агенты, развернутые на краю - на серверах, узлах Kubernetes или рядом с приложениями. Они собирают телеметрию инфраструктуры (например, логи, метрики) или получают события напрямую из приложений, инструментированных SDK. В этом случае агент работает на том же хосте, что и приложение, часто как побочный контейнер или DaemonSet. Эти агенты перенаправляют данные в центральный OTel коллектор ClickStack, который выступает в качестве [шлюза](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles), обычно разворачиваемого один раз на кластер, дата-центр или регион. [Шлюз](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) получает OTLP события от агентов или приложений и обрабатывает загрузку в ClickHouse. См. [OTel коллектор](/use-cases/observability/clickstack/ingesting-data/otel-collector) для получения дополнительной информации. Эти агенты могут быть другими инстансами OTel коллектора или альтернативными технологиями, такими как [Fluentd](https://www.fluentd.org/) или [Vector](https://vector.dev/).

:::note Совместимость с OpenTelemetry
Хотя ClickStack предлагает свои собственные SDK языков программирования и кастомный OpenTelemetry с улучшенной телеметрией и функциями, пользователи также могут без проблем использовать свои существующие SDK и агенты OpenTelemetry.
:::
