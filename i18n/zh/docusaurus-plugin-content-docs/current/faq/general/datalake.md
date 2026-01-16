---
title: 'ClickHouse 是否支持数据湖？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/datalake
description: 'ClickHouse 支持数据湖，例如 Iceberg、Delta Lake、Apache Hudi、Apache Paimon、Hive 等'
doc_type: 'reference'
keywords: ['数据湖', '湖仓']
---

# ClickHouse 是否支持数据湖？ \{#does-clickhouse-support-data-lakes\}

ClickHouse 支持数据湖，包括 Iceberg、Delta Lake、Apache Hudi、Apache Paimon、Hive。

它支持**读取**和**写入**，并且与分区剪枝、基于统计的剪枝、模式演进、按位置删除、按相等条件删除、时间旅行（时光回溯）以及自省完全兼容。

ClickHouse 中的数据湖可以通过 **Unity**、**AWS Glue**、**REST**、**Polaris** 和 **Hive Metastore** 目录以及独立表进行访问。

得益于分布式处理、高效的原生 Parquet 读取器以及数据文件缓存，对数据湖的查询性能一流。