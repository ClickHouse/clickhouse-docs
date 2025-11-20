---
slug: /cloud/get-started/cloud/resource-tour
title: 'Обзор ресурсов'
description: 'Обзор разделов документации ClickHouse Cloud по оптимизации запросов, стратегиям масштабирования, мониторингу и лучшим практикам'
keywords: ['clickhouse cloud']
hide_title: true
doc_type: 'guide'
---

import TableOfContentsBestPractices from '@site/docs/best-practices/_snippets/_table_of_contents.md';
import TableOfContentsOptimizationAndPerformance from '@site/docs/guides/best-practices/_snippets/_performance_optimizations_table_of_contents.md';
import TableOfContentsSecurity from '@site/docs/cloud/_snippets/_security_table_of_contents.md';


# Обзор ресурсов

Эта статья предназначена для того, чтобы дать вам обзор ресурсов в документации,
которые помогут максимально эффективно использовать ваш кластер ClickHouse Cloud.
Ознакомьтесь с ресурсами, сгруппированными по следующим темам:

- [Методы оптимизации запросов и настройки производительности](#query-optimization)
- [Мониторинг](#monitoring)
- [Рекомендации по безопасности и функции для обеспечения соответствия требованиям](#security)
- [Оптимизация затрат и биллинг](#cost-optimization)

Прежде чем переходить к более узким темам, мы рекомендуем начать с наших общих
руководств по лучшим практикам ClickHouse, которые описывают базовые рекомендации по работе
с ClickHouse:

<TableOfContentsBestPractices />



## Методы оптимизации запросов и настройка производительности {#query-optimization}

<TableOfContentsOptimizationAndPerformance />


## Мониторинг {#monitoring}

| Страница                                                                   | Описание                                                                      |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [Расширенная панель мониторинга](/cloud/manage/monitor/advanced-dashboard) | Используйте встроенную расширенную панель мониторинга для отслеживания состояния и производительности сервиса |
| [Интеграция с Prometheus](/integrations/prometheus)                        | Используйте Prometheus для мониторинга облачных сервисов                      |
| [Возможности мониторинга Cloud](/use-cases/observability/cloud-monitoring) | Ознакомьтесь с встроенными возможностями мониторинга и вариантами интеграции |


## Безопасность {#security}

<TableOfContentsSecurity />


## Оптимизация затрат и выставление счетов {#cost-optimization}

| Страница                                             | Описание                                                                                                  |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [Data transfer](/cloud/manage/network-data-transfer) | Узнайте, как ClickHouse Cloud учитывает объем входящего и исходящего трафика данных                       |
| [Notifications](/cloud/notifications)                | Настройте уведомления для вашего сервиса ClickHouse Cloud. Например, при превышении порога использования кредитов |
