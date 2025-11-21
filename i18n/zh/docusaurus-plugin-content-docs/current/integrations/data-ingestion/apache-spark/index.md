---
sidebar_label: '将 Apache Spark 与 ClickHouse 集成'
sidebar_position: 1
slug: /integrations/apache-spark
description: 'Apache Spark 与 ClickHouse 集成简介'
keywords: ['clickhouse', 'Apache Spark', '数据迁移', '数据']
title: '将 Apache Spark 与 ClickHouse 集成'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 将 Apache Spark 与 ClickHouse 集成

<ClickHouseSupportedBadge/>

[Apache Spark](https://spark.apache.org/) 是一个多语言引擎，可在单机或集群上执行数据工程、数据科学和机器学习任务。

将 Apache Spark 与 ClickHouse 连接有两种主要方式：

1. [Spark Connector](./apache-spark/spark-native-connector) - Spark Connector 实现了 `DataSourceV2`，并且拥有自己的 Catalog 管理。目前，这是集成 ClickHouse 与 Spark 的推荐方式。
2. [Spark JDBC](./apache-spark/spark-jdbc) - 使用 [JDBC 数据源](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html) 集成 Spark 和 ClickHouse。

<br/>

<br/>

这两种方案都经过了充分测试，并且与包括 Java、Scala、PySpark 和 Spark SQL 在内的各种 API 完全兼容。