---
slug: /faq/general/columnar-database
title: 什么是列式数据库？
toc_hidden: true
toc_priority: 101
---

import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';


# 什么是列式数据库？ {#what-is-a-columnar-database}

列式数据库独立存储每个列的数据。这允许仅从磁盘读取在给定查询中使用的列的数据。代价是影响整个行的操作变得相对更昂贵。列式数据库的同义词是列导向数据库管理系统。ClickHouse 是此类系统的典型示例。

列式数据库的关键优势包括：

- 仅使用少数几个列的查询。
- 针对大量数据的聚合查询。
- 列式数据压缩。

以下是传统行式系统与列式数据库在构建报告时的差异示意图：

**传统行式**
<img src={RowOriented} alt="传统行式数据库" />

**列式**
<img src={ColumnOriented} alt="列式数据库" />

列式数据库是分析应用程序的首选，因为它允许在表中保留许多列，以防万一，但在读取查询执行时不支付未使用列的成本（传统的OLTP数据库在查询时读取所有数据，因为数据是按行存储的，而不是按列存储的）。列导向数据库设计用于大数据处理和数据仓库，它们通常使用分布式低成本硬件集群进行本地扩展，以增加吞吐量。ClickHouse 通过结合使用 [distributed](../../engines/table-engines/special/distributed.md) 和 [replicated](../../engines/table-engines/mergetree-family/replication.md) 表来实现这一点。

如果您想深入了解列式数据库的历史、它们与行式数据库的区别以及列式数据库的用例，请参阅 [列式数据库指南](https://clickhouse.com/engineering-resources/what-is-columnar-database)。
