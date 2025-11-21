---
title: 'ClickHouse 是否支持数据湖？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/datalake
description: 'ClickHouse 支持数据湖，包括 Iceberg、Delta Lake、Apache Hudi、Apache Paimon、Hive 等'
doc_type: 'reference'
keywords: ['数据湖', '湖仓']
---

# ClickHouse 是否支持数据湖？

ClickHouse 支持数据湖，包括 Iceberg、Delta Lake、Apache Hudi、Apache Paimon、Hive。

它支持 **读取** 和 **写入**，并且与分区裁剪、基于统计的裁剪、模式演进、位置删除（positional delete）、相等删除（equality delete）、时间穿梭（time travel）以及自省等特性完全兼容。

在 ClickHouse 中，数据湖可通过 **Unity**、**AWS Glue**、**REST**、**Polaris** 和 **Hive Metastore** 目录以及独立数据表的方式获得支持。

得益于分布式处理、高效的原生 Parquet 读取器以及数据文件缓存，数据湖上的查询性能十分出色。