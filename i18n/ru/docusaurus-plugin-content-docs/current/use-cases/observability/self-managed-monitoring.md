---
slug: /use-cases/observability/oss-monitoring
title: 'Самоуправляемый мониторинг'
sidebar_label: 'Самоуправляемый мониторинг'
description: 'Руководство по самоуправляемому мониторингу'
doc_type: 'guide'
keywords: ['наблюдаемость', 'мониторинг', 'самоуправляемый', 'метрики', 'состояние системы']
---

import ObservabilityIntegrations from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_community_monitoring.md';

Это руководство предоставляет корпоративным командам, оценивающим ClickHouse open-source, исчерпывающую информацию о возможностях мониторинга и обсервабилити для промышленных развертываний. Корпоративные заказчики часто спрашивают о встроенных возможностях мониторинга, интеграции с существующими стеками обсервабилити, включая такие инструменты, как Datadog и AWS CloudWatch, а также о том, как мониторинг ClickHouse соотносится с развертываниями в собственной инфраструктуре.

### Архитектура интеграции на базе Prometheus \{#prometheus\}

ClickHouse предоставляет метрики, совместимые с Prometheus, через различные конечные точки в зависимости от вашей модели развертывания, каждая из которых имеет свои эксплуатационные особенности:

**Самостоятельно управляемый / OSS ClickHouse**

Прямая серверная конечная точка Prometheus, доступная по стандартному пути `/metrics` на вашем сервере ClickHouse. Этот подход обеспечивает:

- Полный охват метрик: весь доступный набор метрик ClickHouse без встроенной фильтрации
- Метрики в реальном времени: генерируются напрямую из системных таблиц при опросе

**Прямой доступ к системе**

Выполняет запросы к системным таблицам в продуктивной среде, что добавляет нагрузку на систему мониторинга и не позволяет использовать режимы простоя для экономии ресурсов

<ObservabilityIntegrations/>

### Варианты развертывания ClickStack \{#clickstack-deployment\}

- [Helm](/use-cases/observability/clickstack/deployment/helm): Рекомендуется для отладочных сред на базе Kubernetes. Позволяет настраивать параметры среды, задавать лимиты ресурсов и масштабирование через `values.yaml`.
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose): Разворачивает каждый компонент (ClickHouse, HyperDX, OTel collector, MongoDB) отдельно.
- [Только HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only): Автономный контейнер HyperDX.

Полный перечень вариантов развертывания и подробные сведения об архитектуре приведены в [документации по ClickStack](/use-cases/observability/clickstack/overview) и [руководстве по ингестии данных](/use-cases/observability/clickstack/ingesting-data/overview).

<DirectIntegrations/>

<CommunityMonitoring/>