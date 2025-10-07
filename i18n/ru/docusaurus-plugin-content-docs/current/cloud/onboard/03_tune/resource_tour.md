---
'slug': '/cloud/get-started/cloud/resource-tour'
'title': 'Ресурсный тур'
'description': 'Обзор документации ClickHouse Cloud по ресурсам для оптимизации запросов,
  стратегиям масштабирования, мониторингу и лучшим практикам'
'keywords':
- 'clickhouse cloud'
'hide_title': true
'doc_type': 'guide'
---
import TableOfContentsBestPractices from '@site/i18n/ru/docusaurus-plugin-content-docs/current/best-practices/_snippets/_table_of_contents.md';
import TableOfContentsOptimizationAndPerformance from '@site/i18n/ru/docusaurus-plugin-content-docs/current/guides/best-practices/_snippets/_performance_optimizations_table_of_contents.md';
import TableOfContentsSecurity from '@site/i18n/ru/docusaurus-plugin-content-docs/current/cloud/_snippets/_security_table_of_contents.md';


# Обзор ресурсов

Эта статья предназначена для того, чтобы предоставить вам обзор ресурсов, доступных в документации, чтобы вы могли узнать, как максимально эффективно использовать ваше развертывание ClickHouse Cloud. Изучите ресурсы, организованные по следующим темам:

- [Техники оптимизации запросов и настройка производительности](#query-optimization)
- [Мониторинг](#monitoring)
- [Лучшие практики безопасности и функции соответствия](#security)
- [Оптимизация затрат и выставление счетов](#cost-optimization)

Перед тем, как углубиться в более специфические темы, мы рекомендуем вам начать с наших общих руководств по лучшим практикам ClickHouse, которые охватывают общие лучшие практики, которые следует соблюдать при использовании ClickHouse:

<TableOfContentsBestPractices />

## Техники оптимизации запросов и настройка производительности {#query-optimization}

<TableOfContentsOptimizationAndPerformance/>

## Мониторинг {#monitoring}

| Страница                                                          | Описание                                                                       |
|-------------------------------------------------------------------|-------------------------------------------------------------------------------|
| [Расширенная панель мониторинга](/cloud/manage/monitor/advanced-dashboard)  | Используйте встроенную расширенную панель мониторинга для отслеживания состояния и производительности сервиса |
| [Интеграция с Prometheus](/integrations/prometheus)              | Используйте Prometheus для мониторинга облачных сервисов                      |

## Безопасность {#security}

<TableOfContentsSecurity/>

## Оптимизация затрат и выставление счетов {#cost-optimization}

| Страница                                              | Описание                                                                                               |
|-------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| [Передача данных](/cloud/manage/network-data-transfer)| Понять, как ClickHouse Cloud измеряет переданные данные, входящие и исходящие                          |
| [Уведомления](/cloud/notifications)                   | Настройте уведомления для вашей услуги ClickHouse Cloud. Например, когда использование кредита превышает порог |