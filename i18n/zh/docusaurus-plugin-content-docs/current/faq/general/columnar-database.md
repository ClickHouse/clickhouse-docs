---
'slug': '/faq/general/columnar-database'
'title': '什么是列式数据库？'
'toc_hidden': true
'toc_priority': 101
'description': '本页面描述了什么是列式数据库。'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';


# 什么是列式数据库？ {#what-is-a-columnar-database}

列式数据库独立存储每一列的数据。这允许仅从磁盘读取在任何给定查询中使用的那些列的数据。代价是影响整行的操作变得相对更昂贵。列式数据库的同义词是列导向数据库管理系统。ClickHouse 是这种系统的典型示例。

列式数据库的主要优势包括：

- 只使用众多列中的少数几列的查询。
- 针对大量数据的聚合查询。
- 列式数据压缩。

下面是传统行式系统与列式数据库在构建报告时的区别插图：

**传统行式**
<Image img={RowOriented} alt="传统行式数据库" size="md" border />

**列式**
<Image img={ColumnOriented} alt="列式数据库" size="md" border />

列式数据库是分析应用的首选，因为它允许表中有许多列以备不时之需，但在读取查询执行时不会为未使用的列付出代价（传统的OLTP数据库在查询时读取所有数据，因为数据是按行存储的，而不是按列）。列导向数据库旨在处理大数据和数据仓库，它们通常采用低成本硬件的分布式集群来提高吞吐量。ClickHouse 通过结合 [distributed](../../engines/table-engines/special/distributed.md) 和 [replicated](../../engines/table-engines/mergetree-family/replication.md) 表来实现这一点。

如果您想深入了解列式数据库的历史、它们与行式数据库的区别以及列式数据库的用例，请参阅 [列式数据库指南](https://clickhouse.com/engineering-resources/what-is-columnar-database)。
