---
slug: /best-practices
keywords: ['Cloud', 'Primary key', 'Ordering key', 'Materialized Views', 'Best Practices', 'Bulk Inserts', 'Asynchronous Inserts', 'Avoid Mutations', 'Avoid Nullable Columns', 'Avoid Optimize Final', 'Partitioning Key']
title: 'Обзор'
hide_title: true
description: 'Целевая страница для раздела "Лучшие практики" в ClickHouse'
---


# Лучшие практики в ClickHouse {#best-practices-in-clickhouse}

В этом разделе представлены лучшие практики, которые вы должны учитывать, чтобы максимально эффективно использовать ClickHouse.

| Страница                                                               | Описание                                                                  |
|-----------------------------------------------------------------------|---------------------------------------------------------------------------|
| [Выбор первичного ключа](/best-practices/choosing-a-primary-key)     | Рекомендации по выбору эффективного первичного ключа в ClickHouse.        |
| [Выбор типов данных](/best-practices/select-data-types)               | Рекомендации по выбору подходящих типов данных.                           |
| [Использование материализованных представлений](/best-practices/use-materialized-views) | Когда и как извлечь выгоду из материализованных представлений.           |
| [Минимизация и оптимизация JOIN](/best-practices/minimize-optimize-joins) | Лучшие практики для минимизации и оптимизации операций JOIN.             |
| [Выбор ключа партиционирования](/best-practices/choosing-a-partitioning-key) | Как эффективно выбирать и применять ключи партиционирования.        |
| [Выбор стратегии вставки](/best-practices/selecting-an-insert-strategy) | Стратегии для эффективной вставки данных в ClickHouse.                   |
| [Индексы пропуска данных](/best-practices/use-data-skipping-indices-where-appropriate) | Когда применять индексы пропуска данных для повышения производительности. |
| [Избегайте мутаций](/best-practices/avoid-mutations)                 | Причины избегать мутаций и как проектировать без них.                    |
| [Избегайте OPTIMIZE FINAL](/best-practices/avoid-optimize-final)     | Почему `OPTIMIZE FINAL` может быть затратным и как это обойти.           |
| [Используйте JSON, где это уместно](/best-practices/use-json-where-appropriate) | Оценки при использовании колонок JSON в ClickHouse.                     |
