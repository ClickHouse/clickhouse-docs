---
slug: /use-cases/observability/oss-monitoring
title: 'Самостоятельно управляемый мониторинг'
sidebar_label: 'Самостоятельно управляемый мониторинг'
description: 'Руководство по самостоятельному управлению мониторингом'
doc_type: 'guide'
keywords: ['наблюдаемость', 'мониторинг', 'самостоятельное управление', 'метрики', 'состояние системы']
---

import ObservabilityIntegrations from '@site/docs/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/docs/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/docs/_snippets/_community_monitoring.md';


# Мониторинг самостоятельно управляемых развертываний {#cloud-monitoring}

Это руководство предоставляет корпоративным командам, оценивающим ClickHouse с открытым исходным кодом, исчерпывающую информацию о возможностях мониторинга и наблюдаемости для производственных развертываний. Корпоративные клиенты часто интересуются готовыми функциями мониторинга, интеграцией с существующими стеками наблюдаемости, включая такие инструменты, как Datadog и AWS CloudWatch, а также тем, как мониторинг ClickHouse соотносится с самостоятельно размещаемыми развертываниями.

### Архитектура интеграции на основе Prometheus {#prometheus}

ClickHouse предоставляет метрики, совместимые с Prometheus, через различные конечные точки в зависимости от модели развертывания, каждая из которых имеет свои операционные характеристики:

**Самостоятельно управляемый ClickHouse/ClickHouse с открытым исходным кодом**

Прямая конечная точка Prometheus сервера, доступная через стандартную конечную точку /metrics на вашем сервере ClickHouse. Этот подход обеспечивает:

- Полное предоставление метрик: полный набор доступных метрик ClickHouse без встроенной фильтрации
- Метрики в реальном времени: генерируются непосредственно из системных таблиц при сборе

**Прямой доступ к системе**

Запросы к производственным системным таблицам добавляют нагрузку мониторинга и препятствуют переходу в режим простоя для экономии затрат

<ObservabilityIntegrations />

### Варианты развертывания ClickStack {#clickstack-deployment}

- [Helm](/use-cases/observability/clickstack/deployment/helm): рекомендуется для отладочных сред на базе Kubernetes. Позволяет настраивать конфигурацию для конкретной среды, ограничения ресурсов и масштабирование через `values.yaml`.
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose): развертывает каждый компонент (ClickHouse, HyperDX, сборщик OTel, MongoDB) по отдельности.
- [Только HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only): автономный контейнер HyperDX.

Полный перечень вариантов развертывания и подробности архитектуры см. в [документации ClickStack](/use-cases/observability/clickstack/overview) и [руководстве по приему данных](/use-cases/observability/clickstack/ingesting-data/overview).

<DirectIntegrations />

<CommunityMonitoring />
