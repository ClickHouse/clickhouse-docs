---
slug: /cloud/get-started/cloud/resource-tour
title: 'Обзор ресурсов'
description: 'Обзор ресурсов документации ClickHouse Cloud, посвящённых оптимизации запросов, стратегиям масштабирования, мониторингу и лучшим практикам'
keywords: ['clickhouse cloud']
hide_title: true
doc_type: 'guide'
---

import TableOfContentsBestPractices from '@site/docs/best-practices/_snippets/_table_of_contents.md';
import TableOfContentsOptimizationAndPerformance from '@site/docs/guides/best-practices/_snippets/_performance_optimizations_table_of_contents.md';
import TableOfContentsSecurity from '@site/docs/cloud/_snippets/_security_table_of_contents.md';


# Обзор ресурсов

Эта статья призвана дать вам обзор доступных в документации ресурсов, которые помогут максимально эффективно использовать ваше развертывание ClickHouse Cloud.
Ознакомьтесь с ресурсами, сгруппированными по следующим темам:

- [Методы оптимизации запросов и настройка производительности](#query-optimization)
- [Мониторинг](#monitoring)
- [Рекомендации по безопасности и возможности для обеспечения соответствия требованиям](#security)
- [Оптимизация затрат и выставление счетов](#cost-optimization)

Прежде чем переходить к более узким темам, мы рекомендуем начать с наших руководств по лучшим практикам работы с ClickHouse, в которых описаны основные рекомендации по его использованию:

<TableOfContentsBestPractices />



## Методы оптимизации запросов и настройка производительности {#query-optimization}

<TableOfContentsOptimizationAndPerformance />


## Мониторинг {#monitoring}

| Страница                                                                   | Описание                                                                      |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [Advanced dashboard](/cloud/manage/monitor/advanced-dashboard)             | Используйте встроенную расширенную панель мониторинга для отслеживания состояния и производительности сервиса |
| [Prometheus integration](/integrations/prometheus)                         | Используйте Prometheus для мониторинга облачных сервисов                      |
| [Cloud Monitoring Capabilities](/use-cases/observability/cloud-monitoring) | Ознакомьтесь с обзором встроенных возможностей мониторинга и вариантов интеграции |


## Безопасность {#security}

<TableOfContentsSecurity />


## Оптимизация затрат и выставление счетов {#cost-optimization}

| Страница                                             | Описание                                                                                                  |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [Data transfer](/cloud/manage/network-data-transfer) | Узнайте, как ClickHouse Cloud учитывает объем входящего и исходящего трафика данных                       |
| [Notifications](/cloud/notifications)                | Настройте уведомления для вашего сервиса ClickHouse Cloud. Например, при превышении порога использования кредитов |
