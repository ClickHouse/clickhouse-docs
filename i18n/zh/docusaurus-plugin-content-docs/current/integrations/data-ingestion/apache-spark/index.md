---
sidebar_label: '将 Apache Spark 与 ClickHouse 集成'
sidebar_position: 1
slug: /integrations/apache-spark
description: 'Apache Spark 与 ClickHouse 的介绍'
keywords: [ 'clickhouse', 'Apache Spark', 'migrating', 'data' ]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';


# 将 Apache Spark 与 ClickHouse 集成

<br/>

[Apache Spark](https://spark.apache.org/) 是一个多语言引擎，用于在单节点机器或集群上执行数据工程、数据科学和机器学习。

将 Apache Spark 和 ClickHouse 连接有两种主要方式：

1. [Spark 连接器](./apache-spark/spark-native-connector) - Spark 连接器实现了 `DataSourceV2` 并拥有自己的目录管理。截至目前，这是推荐的将 ClickHouse 和 Spark 集成的方式。
2. [Spark JDBC](./apache-spark/spark-jdbc) - 通过 [JDBC 数据源](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html) 将 Spark 和 ClickHouse 集成。

<br/>
<br/>
这两种解决方案已成功测试，并与多种 API 完全兼容，包括 Java、Scala、PySpark 和 Spark SQL。
