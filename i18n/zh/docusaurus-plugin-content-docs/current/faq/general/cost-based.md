---
title: 'ClickHouse 是否支持基于成本的优化器'
toc_hidden: true
toc_priority: 10
slug: /faq/general/cost-based
description: 'ClickHouse 提供了一些基于成本的优化机制'
doc_type: 'reference'
keywords: ['CBE', 'optimizer']
---

# ClickHouse 是否有基于成本的优化器？ \{#does-clickhouse-have-a-cost-based-optimizer\}

ClickHouse 具备一些局部的基于成本的优化机制，例如：读取列的顺序由从磁盘读取压缩数据范围的成本来决定。

ClickHouse 也会基于列统计信息对 JOIN 的顺序进行重新排序，不过（截至 2025 年）这远不如 Postgres、Oracle、MS SQL Server 中的 CBE 那样先进。