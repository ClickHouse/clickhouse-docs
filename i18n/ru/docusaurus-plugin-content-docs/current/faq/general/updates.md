---
title: 'Поддерживает ли ClickHouse обновления в режиме реального времени?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/updates
description: 'ClickHouse поддерживает легковесные обновления в режиме реального времени'
doc_type: 'reference'
keywords: ['обновления', 'режим реального времени']
---

# Поддерживает ли ClickHouse обновления в реальном времени?

ClickHouse поддерживает оператор UPDATE и способен выполнять обновления в реальном времени с той же скоростью, с которой выполняет INSERT.

Это возможно благодаря [структуре данных patch parts](https://clickhouse.com/blog/updates-in-clickhouse-2-sql-style-updates#stage-3-patch-parts--updates-the-clickhouse-way), которая позволяет быстро применять изменения без заметного влияния на производительность запросов SELECT.

Кроме того, за счёт MVCC (multi-version concurrency control, многоверсионного управления конкурентным доступом) и snapshot isolation обновления обеспечивают ACID‑свойства.

:::info
Облегчённые обновления впервые были представлены в версии ClickHouse 25.7.
:::