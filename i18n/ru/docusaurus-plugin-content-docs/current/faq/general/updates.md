---
title: 'Поддерживает ли ClickHouse обновления в реальном времени?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/updates
description: 'ClickHouse поддерживает легковесные обновления в реальном времени'
doc_type: 'reference'
keywords: ['updates', 'real-time']
---

# Поддерживает ли ClickHouse обновления в реальном времени?

ClickHouse поддерживает оператор UPDATE и способен выполнять обновления в реальном времени так же быстро, как и INSERT.

Это становится возможным благодаря [структуре данных patch parts](https://clickhouse.com/blog/updates-in-clickhouse-2-sql-style-updates#stage-3-patch-parts--updates-the-clickhouse-way), которая позволяет быстро применять изменения без значительного влияния на производительность запросов SELECT.

Кроме того, благодаря MVCC (многоверсионному управлению параллельным доступом) и изоляции снимков обновления обладают свойствами ACID.

:::info
Лёгкие обновления впервые появились в ClickHouse версии 25.7.
:::