---
title: 'ClickHouse 支持数据湖吗？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/datalake
description: 'ClickHouse 支持包括 Iceberg、Delta Lake、Apache Hudi、Apache Paimon、Hive 在内的数据湖'
doc_type: 'reference'
keywords: ['data lake', 'lakehouse']
---

# ClickHouse 是否支持数据湖？

ClickHouse 支持数据湖，包括 Iceberg、Delta Lake、Apache Hudi、Apache Paimon 和 Hive。

它支持**读取**和**写入**，并与分区裁剪、基于统计信息的裁剪、模式演进、位置删除、等值删除、时间旅行和自省等功能完全兼容。

ClickHouse 中的数据湖支持通过 **Unity**、**AWS Glue**、**REST**、**Polaris** 和 **Hive Metastore** 目录，以及直接访问单个表的方式进行集成。

得益于分布式处理、高效的原生 Parquet 读取器以及数据文件缓存，对数据湖的查询性能非常出色。