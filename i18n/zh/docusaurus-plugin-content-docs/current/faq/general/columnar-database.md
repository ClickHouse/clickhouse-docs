---
slug: /faq/general/columnar-database
title: '什么是列式数据库？'
toc_hidden: true
toc_priority: 101
description: '本页说明什么是列式数据库'
keywords: ['columnar database', 'column-oriented database', 'OLAP database', 'analytical database', 'data warehousing']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';


# 什么是列式数据库? {#what-is-a-columnar-database}

列式数据库独立存储每一列的数据。这使得查询时只需从磁盘读取所需的列数据。代价是影响整行的操作会变得相对更加昂贵。列式数据库的同义词是面向列的数据库管理系统。ClickHouse 是此类系统的典型代表。

列式数据库的主要优势包括:

- 仅使用众多列中少数几列的查询。
- 针对大量数据的聚合查询。
- 按列进行数据压缩。

以下是传统行式系统与列式数据库在构建报表时的差异示意图:

**传统行式**

<Image
  img={RowOriented}
  alt='传统行式数据库'
  size='md'
  border
/>

**列式**

<Image img={ColumnOriented} alt='列式数据库' size='md' border />

列式数据库是分析应用的首选,因为它允许在表中预留大量列以备不时之需,但在执行读取查询时无需为未使用的列付出代价(传统 OLTP 数据库在查询时会读取所有数据,因为数据是按行而非按列存储的)。面向列的数据库专为大数据处理和数据仓库而设计,通常通过低成本硬件的分布式集群进行原生扩展以提高吞吐量。ClickHouse 通过结合使用[分布式](../../engines/table-engines/special/distributed.md)表和[复制](../../engines/table-engines/mergetree-family/replication.md)表来实现这一点。

如果您想深入了解列式数据库的历史、它们与行式数据库的区别以及列式数据库的使用场景,请参阅[列式数据库指南](https://clickhouse.com/engineering-resources/what-is-columnar-database)。
