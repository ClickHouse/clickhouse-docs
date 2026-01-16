---
slug: /cloud/get-started/cloud/resource-tour
title: 'Обзор ресурсов'
description: 'Обзор ресурсов документации ClickHouse Cloud, посвящённых оптимизации запросов, стратегиям масштабирования, мониторингу и лучшим практикам'
keywords: ['clickhouse cloud']
hide_title: true
doc_type: 'guide'
---

import TableOfContentsBestPractices from '@site/i18n/ru/docusaurus-plugin-content-docs/current/best-practices/_snippets/_table_of_contents.md';
import TableOfContentsOptimizationAndPerformance from '@site/i18n/ru/docusaurus-plugin-content-docs/current/guides/best-practices/_snippets/_performance_optimizations_table_of_contents.md';
import TableOfContentsSecurity from '@site/i18n/ru/docusaurus-plugin-content-docs/current/cloud/_snippets/_security_table_of_contents.md';

# Обзор ресурсов \\{#resource-tour\\}

В этой статье представлен обзор доступных в документации ресурсов,
которые помогут вам максимально эффективно использовать развертывание ClickHouse Cloud.
Изучайте ресурсы, сгруппированные по следующим темам:

- [Методы оптимизации запросов и настройки производительности](#query-optimization)
- [Мониторинг](#monitoring)
- [Рекомендации по безопасности и возможности обеспечения соответствия требованиям](#security)
- [Оптимизация затрат и биллинг](#cost-optimization)

Прежде чем переходить к более узким темам, мы рекомендуем начать с наших общих
руководств по лучшим практикам работы с ClickHouse, в которых описаны общие рекомендации по использованию ClickHouse:

<TableOfContentsBestPractices />

## Методы оптимизации запросов и тонкая настройка производительности \\{#query-optimization\\}

<TableOfContentsOptimizationAndPerformance/>

## Мониторинг \\{#monitoring\\}

| Страница                                                                   | Описание                                                                     |
|----------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| [Расширенная панель мониторинга](/cloud/manage/monitor/advanced-dashboard) | Используйте встроенную расширенную панель для мониторинга состояния службы и производительности |
| [Интеграция с Prometheus](/integrations/prometheus)                        | Используйте Prometheus для мониторинга облачных служб                        |
| [Возможности облачного мониторинга](/use-cases/observability/cloud-monitoring) | Получите обзор встроенных возможностей мониторинга и вариантов интеграции |

## Безопасность \\{#security\\}

<TableOfContentsSecurity/>

## Оптимизация затрат и биллинга \\{#cost-optimization\\}

| Страница                                            | Описание                                                                                                   |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| [Data transfer](/cloud/manage/network-data-transfer)| Узнайте, как ClickHouse Cloud учитывает объем входящего и исходящего трафика                              |
| [Notifications](/cloud/notifications)               | Настройте уведомления для сервиса ClickHouse Cloud, например, когда использование кредитов превышает заданный порог |
