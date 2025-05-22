---
'slug': '/faq/general/columnar-database'
'title': '什么是列式数据库？'
'toc_hidden': true
'toc_priority': 101
'description': '本页面描述了列式数据库的定义'
---

import Image from '@theme/IdealImage';
import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';

# 什么是列式数据库？ {#what-is-a-columnar-database}

列式数据库独立存储每一列的数据。这允许从磁盘读取数据仅针对任何给定查询中使用的列。代价是，影响整个行的操作变得相对更昂贵。列式数据库的同义词是列导向数据库管理系统。ClickHouse 就是这样一个系统的典型示例。

列式数据库的主要优势包括：

- 查询仅使用少数几列而不是许多列。
- 针对大量数据的聚合查询。
- 按列的数据压缩。

下面是传统行导向系统和列式数据库在构建报告时的区别示意图：

**传统行导向**
<Image img={RowOriented} alt="传统行导向数据库" size="md" border />

**列式**
<Image img={ColumnOriented} alt="列式数据库" size="md" border />

列式数据库是分析应用程序的首选，因为它允许在表中拥有许多列以备不时之需，但在读取查询执行时不会对未使用的列付出代价（传统的 OLTP 数据库在查询期间读取所有数据，因为数据按行而非列存储）。列导向数据库专为大数据处理和数据仓库设计，它们通常利用低成本硬件的分布式集群进行原生扩展，以增加吞吐量。ClickHouse 是通过结合 [distributed](../../engines/table-engines/special/distributed.md) 和 [replicated](../../engines/table-engines/mergetree-family/replication.md) 表来实现这一点的。

如果您想深入了解列式数据库的历史，了解它们与行导向数据库的区别以及列式数据库的使用案例，请参阅 [列式数据库指南](https://clickhouse.com/engineering-resources/what-is-columnar-database)。
