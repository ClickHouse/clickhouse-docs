---
title: 'ClickHouse 是否具有基于成本的优化器'
toc_hidden: true
toc_priority: 10
slug: /faq/general/cost-based
description: 'ClickHouse 提供一定程度的基于成本的优化机制'
doc_type: 'reference'
keywords: ['CBE', 'optimizer']
---

# ClickHouse 是否有基于成本的优化器？

ClickHouse 提供了一些局部的基于成本的优化机制，例如：读取列的顺序会根据从磁盘读取压缩数据范围的开销来确定。

ClickHouse 还会基于列统计信息对 JOIN 顺序进行重排，不过就目前（截至 2025 年）而言，这一能力还远不如 Postgres、Oracle、MS SQL Server 中的基于成本优化器那样成熟和完善。