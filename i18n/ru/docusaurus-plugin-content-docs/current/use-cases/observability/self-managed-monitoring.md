---
slug: /use-cases/observability/oss-monitoring
title: 'Самостоятельный мониторинг'
sidebar_label: 'Самостоятельный мониторинг'
description: 'Руководство по самостоятельному мониторингу'
doc_type: 'guide'
keywords: ['наблюдаемость', 'мониторинг', 'самостоятельный', 'метрики', 'состояние системы']
---

import ObservabilityIntegrations from '@site/docs/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/docs/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/docs/_snippets/_community_monitoring.md';


# Самостоятельно управляемый мониторинг {#cloud-monitoring}

Это руководство предоставляет корпоративным командам, оценивающим открытое ПО ClickHouse, исчерпывающую информацию о возможностях мониторинга и наблюдаемости для продуктивных развертываний. Корпоративные клиенты часто спрашивают о возможностях мониторинга «из коробки», интеграции с существующими стеками наблюдаемости, включая такие инструменты, как Datadog и AWS CloudWatch, а также о том, как возможности мониторинга ClickHouse соотносятся с самостоятельно размещёнными (self-hosted) развертываниями.

### Архитектура интеграции на базе Prometheus {#prometheus}
ClickHouse предоставляет метрики, совместимые с Prometheus, через различные конечные точки в зависимости от вашей модели развертывания, каждая из которых имеет свои эксплуатационные особенности:

**Самостоятельно управляемый/OSS ClickHouse**

Прямая серверная конечная точка Prometheus, доступная по стандартному endpoint `/metrics` на вашем сервере ClickHouse. Этот подход обеспечивает:
- Полный набор метрик: Весь доступный спектр метрик ClickHouse без встроенной фильтрации
- Метрики в реальном времени: Генерируются напрямую из системных таблиц при опросе

**Прямой доступ к системе** 

Выполняет запросы к системным таблицам в production-среде, что добавляет нагрузку от мониторинга и мешает переводу системы в неактивное состояние для экономии ресурсов.

<ObservabilityIntegrations/>

### Варианты развертывания ClickStack {#clickstack-deployment}

- [Helm](/use-cases/observability/clickstack/deployment/helm): Рекомендуется для сред отладки на базе Kubernetes. Позволяет выполнять настройку для конкретной среды, задавать лимиты ресурсов и масштабировать через `values.yaml`.
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose): Разворачивает каждый компонент (ClickHouse, HyperDX, OTel collector, MongoDB) отдельно.
- [Только HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only): Автономный контейнер HyperDX.

Полный перечень вариантов развертывания и деталей архитектуры приведён в [документации ClickStack](/use-cases/observability/clickstack/overview) и [руководстве по ингестии данных](/use-cases/observability/clickstack/ingesting-data/overview).

<DirectIntegrations/>

<CommunityMonitoring/>
