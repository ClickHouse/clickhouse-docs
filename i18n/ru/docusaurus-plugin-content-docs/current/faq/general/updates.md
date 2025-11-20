---
title: 'Поддерживает ли ClickHouse обновления в режиме реального времени?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/updates
description: 'ClickHouse поддерживает легковесные обновления в режиме реального времени'
doc_type: 'reference'
keywords: ['updates', 'real-time']
---

# Поддерживает ли ClickHouse обновления в режиме реального времени?

ClickHouse поддерживает оператор UPDATE и может выполнять обновления в режиме реального времени с той же скоростью, что и INSERT.

Это возможно благодаря [структуре данных patch parts](https://clickhouse.com/blog/updates-in-clickhouse-2-sql-style-updates#stage-3-patch-parts--updates-the-clickhouse-way), которая позволяет быстро применять изменения без существенного влияния на производительность SELECT-запросов.

Кроме того, благодаря MVCC (multi-version concurrency control) и snapshot isolation, обновления обладают свойствами ACID.

:::info
Облегчённые обновления впервые были представлены в ClickHouse версии 25.7.
:::