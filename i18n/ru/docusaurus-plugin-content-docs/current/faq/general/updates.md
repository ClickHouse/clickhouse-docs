---
title: 'Поддерживает ли ClickHouse обновления в реальном времени?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/updates
description: 'ClickHouse поддерживает облегчённые обновления в реальном времени'
doc_type: 'reference'
keywords: ['обновления', 'реальное время']
---

# Поддерживает ли ClickHouse обновления в режиме реального времени? \\{#does-clickhouse-support-real-time-updates\\}

ClickHouse поддерживает оператор UPDATE и способен выполнять обновления в реальном времени с той же скоростью, с какой выполняет операции INSERT.

Это стало возможным благодаря [структуре данных patch parts](https://clickhouse.com/blog/updates-in-clickhouse-2-sql-style-updates#stage-3-patch-parts--updates-the-clickhouse-way), которая позволяет быстро применять изменения без существенного влияния на производительность запросов SELECT.

Кроме того, благодаря многоверсионному управлению конкурентным доступом (MVCC) и изоляции снимков (snapshot isolation) обновления обладают ACID‑свойствами.

:::info
Легковесные обновления впервые были представлены в версии ClickHouse 25.7.
:::