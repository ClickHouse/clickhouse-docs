---
'slug': '/faq/general/columnar-database'
'title': '列式数据库是什么？'
'toc_hidden': true
'toc_priority': 101
'description': '此页面描述了什么是列式数据库'
---

import Image from '@theme/IdealImage';
import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';


# 什么是列式数据库？{#what-is-a-columnar-database}

列式数据库独立存储每一列的数据。这使得只需读取当前查询涉及的列的数据，避免了读取不必要的数据。其代价在于，影响整行的操作变得相对更加昂贵。列式数据库的同义词是列导向数据库管理系统。ClickHouse 是此类系统的典型例子。

列式数据库的主要优势包括：

- 查询仅使用少数几列而不是所有列。
- 对大数据量的聚合查询。
- 列式数据压缩。

以下是传统行导向系统与列式数据库在构建报告时的差异示意图：

**传统行导向**
<Image img={RowOriented} alt="传统行导向数据库" size="md" border />

**列式**
<Image img={ColumnOriented} alt="列式数据库" size="md" border />

列式数据库是分析应用程序的首选，因为它允许在表中预留许多列以备不时之需，但在读取查询执行时间上不会对未使用的列产生额外成本（传统的 OLTP 数据库在查询时会读取所有数据，因为数据是以行而不是列的形式存储的）。列导向数据库专为大数据处理和数据仓库而设计，通常通过使用分布式低成本硬件集群原生扩展以提高吞吐量。ClickHouse通过组合 [distributed](../../engines/table-engines/special/distributed.md) 和 [replicated](../../engines/table-engines/mergetree-family/replication.md) 表来实现这一点。

如果您希望深入了解列式数据库的历史、与行导向数据库的区别以及列式数据库的使用案例，请参见 [列式数据库指南](https://clickhouse.com/engineering-resources/what-is-columnar-database)。
