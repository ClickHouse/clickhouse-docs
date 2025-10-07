---
'sidebar_label': '将 Apache Spark 与 ClickHouse 集成'
'sidebar_position': 1
'slug': '/integrations/apache-spark'
'description': 'Apache Spark 与 ClickHouse 的介绍'
'keywords':
- 'clickhouse'
- 'Apache Spark'
- 'migrating'
- 'data'
'title': '将 Apache Spark 与 ClickHouse 集成'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';


# 将 Apache Spark 与 ClickHouse 集成

<br/>

[Apache Spark](https://spark.apache.org/) 是一个多语言引擎，用于在单节点机器或集群上执行数据工程、数据科学和机器学习。

连接 Apache Spark 和 ClickHouse 有两种主要方式：

1. [Spark Connector](./apache-spark/spark-native-connector) - Spark 连接器实现了 `DataSourceV2` 并拥有自己的目录管理。到目前为止， 这是集成 ClickHouse 和 Spark 的推荐方法。
2. [Spark JDBC](./apache-spark/spark-jdbc) - 使用 [JDBC 数据源](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html) 集成 Spark 和 ClickHouse。

<br/>
<br/>
这两种解决方案都已成功测试，并与 Java、Scala、PySpark 和 Spark SQL 等各种 API 完全兼容。
