---
sidebar_label: '将 Apache Spark 与 ClickHouse 集成'
sidebar_position: 1
slug: /integrations/apache-spark
description: 'Apache Spark 与 ClickHouse 集成简介'
keywords: ['clickhouse', 'Apache Spark', '迁移', '数据']
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

# 将 Apache Spark 集成到 ClickHouse 中 \{#integrating-apache-spark-with-clickhouse\}

<ClickHouseSupportedBadge/>

[Apache Spark](https://spark.apache.org/) 是一个多语言引擎，可在单机或集群上执行数据工程、数据科学和机器学习任务。

将 Apache Spark 与 ClickHouse 连接主要有两种方式：

1. [Spark Connector](./apache-spark/spark-native-connector) - Spark 连接器实现了 `DataSourceV2`，并拥有自己的目录管理功能。目前，这是集成 ClickHouse 和 Spark 的首选方式。
2. [Spark JDBC](./apache-spark/spark-jdbc) - 使用 [JDBC 数据源](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html) 集成 Spark 和 ClickHouse。

<br/>

这两种方案都已经过成功测试，并与包括 Java、Scala、PySpark 和 Spark SQL 在内的各类 API 完全兼容。

### Spark 运行时环境\{#spark-runtime-environment\}

#### 标准 Spark 运行时\{#standard-spark-runtime\}

Spark Connector 可以在与上游 Apache Spark 运行时高度一致的环境中开箱即用，例如 Amazon EMR 或基于 Kubernetes 的 Spark 部署。

#### 托管 Spark 平台\{#managed-spark-platforms\}

诸如 [AWS Glue](./../aws-glue/index.md) 和 [Databricks](./databricks.md) 等平台会引入额外的抽象层和特定于环境的行为。
尽管核心集成保持不变，但这些平台可能需要单独的配置和设置步骤。有关详细信息，请参阅各自的文档页面。