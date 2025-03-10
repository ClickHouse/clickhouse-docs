---
slug: /cloud/bestpractices/avoid-mutations
sidebar_label: 避免变更
title: 避免变更
---

变更是指通过删除或更新操作来操作表数据的 [ALTER](/sql-reference/statements/alter/) 查询。最显著的例子是 ALTER TABLE … DELETE、UPDATE 等这样的查询。执行此类查询会产生数据分区的新变更版本。这意味着此类语句将触发对所有在变更之前插入的数据的整个数据分区进行重写，导致大量写入请求。

对于更新，您可以通过使用专门的表引擎，如 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree.md) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree.md)，来避免这些大量的写入请求，而不是使用默认的 MergeTree 表引擎。


## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
