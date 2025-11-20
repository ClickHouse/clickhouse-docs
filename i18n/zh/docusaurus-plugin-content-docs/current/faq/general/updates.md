---
title: 'ClickHouse 是否支持实时更新？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/updates
description: 'ClickHouse 支持轻量级的实时更新'
doc_type: 'reference'
keywords: ['updates', 'real-time']
---

# ClickHouse 是否支持实时更新？

ClickHouse 支持 `UPDATE` 语句，并且可以像执行 `INSERT` 一样快速地执行实时更新。

这得益于 [patch parts 数据结构](https://clickhouse.com/blog/updates-in-clickhouse-2-sql-style-updates#stage-3-patch-parts--updates-the-clickhouse-way)，它可以在不显著影响 `SELECT` 性能的情况下快速应用变更。

此外，由于 MVCC（多版本并发控制）和快照隔离，更新操作具备 ACID 特性。

:::info
轻量级更新功能首次在 ClickHouse 25.7 版本中引入。
:::