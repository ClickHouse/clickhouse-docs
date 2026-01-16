---
slug: /faq/general/columnar-database
title: '什么是列式数据库？'
toc_hidden: true
toc_priority: 101
description: '本页介绍列式数据库的基本概念'
keywords: ['列式数据库', '面向列的数据库', 'OLAP 数据库', '分析型数据库', '数据仓库']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';


# 什么是列式数据库？ \{#what-is-a-columnar-database\}

列式数据库会将每一列的数据独立存储。这样在执行任意查询时，只需从磁盘读取该查询实际使用到的那些列的数据。代价是，对整行产生影响的操作成本会相应提高。列式数据库也常被称为“面向列的数据库管理系统”。ClickHouse 是此类系统的典型代表。

列式数据库的主要优势包括：

- 查询只涉及众多列中的少数几列。
- 针对海量数据执行聚合查询。
- 以列为粒度的数据压缩。

下面的示意图展示了在构建报表时，传统行式系统和列式数据库之间的差异：

**传统行式**
<Image img={RowOriented} alt="传统行式数据库" size="md" border />

**列式**
<Image img={ColumnOriented} alt="列式数据库" size="md" border />

列式数据库是分析型应用的首选，因为它允许在表中设置大量列以便在需要时使用，但在执行读取查询时，并不会为未使用的列付出代价（传统 OLTP 数据库在查询时会读取所有数据，因为数据是按行而不是按列存储的）。面向列的数据库是为大数据处理和数据仓库而设计的，通常可以通过由低成本硬件组成的分布式集群进行原生扩展以提高吞吐量。ClickHouse 通过[分布式](../../engines/table-engines/special/distributed.md)表和[复制](../../engines/table-engines/mergetree-family/replication.md)表的组合来实现这一点。

如果您希望深入了解列式数据库的历史、它与行式数据库的差异以及列式数据库的典型使用场景，请参阅[列式数据库指南](https://clickhouse.com/engineering-resources/what-is-columnar-database)。
