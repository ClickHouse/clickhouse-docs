---
sidebar_label: 'Azure Synapse'
slug: /integrations/azure-synapse
description: 'Azure Synapse 与 ClickHouse 介绍'
keywords: ['clickhouse', 'azure synapse', 'azure', 'synapse', 'microsoft', 'azure spark', '数据']
title: '集成 Azure Synapse 与 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import sparkConfigViaNotebook from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_notebook_conf.png';
import sparkUICHSettings from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_ui_ch_settings.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

<ClickHouseSupportedBadge />

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics) 是一项集成式分析服务，结合了大数据、数据科学和数据仓库能力，可实现快速的大规模数据分析。
在 Synapse 中，Spark 池提供按需、可扩展的 [Apache Spark](https://spark.apache.org) 集群，让您能够执行复杂的数据转换、机器学习任务，以及与外部系统的集成。

本文将介绍在 Azure Synapse 中使用 Apache Spark 时，如何集成 [ClickHouse Spark 连接器](/integrations/apache-spark/spark-native-connector)。

<TOCInline toc={toc} />

## 添加 连接器 依赖项 \{#add-connector-dependencies\}

Azure Synapse 支持三个级别的[包管理](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries)：

1. 默认包
2. Spark 池级
3. 会话级

<br />

按照 [Apache Spark 池库管理指南](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)进行操作，并将以下必需依赖项添加到 Spark 应用程序中

* `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` - [官方 Maven 仓库](https://mvnrepository.com/artifact/com.clickhouse.spark)
* `clickhouse-jdbc-{java_client_version}-all.jar` - [官方 Maven 仓库](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

请参阅我们的 [Spark 连接器 Compatibility Matrix](/integrations/apache-spark/spark-native-connector#compatibility-matrix) 文档，了解哪些版本适合您的需求。

## 将 ClickHouse 添加为目录 \{#add-clickhouse-as-catalog\}

可以通过多种方式将 Spark 配置添加到会话中：

* 使用随会话一起加载的自定义配置文件
* 通过 Azure Synapse UI 添加配置
* 在 Synapse 笔记本中添加配置

请按照[管理 Apache Spark 配置](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
中的说明操作，并添加[连接器所需的 Spark 配置](/integrations/apache-spark/spark-native-connector#register-the-catalog-required)。

例如，您可以在笔记本中使用以下设置来配置 Spark 会话：

```python
%%configure -f
{
    "conf": {
        "spark.sql.catalog.clickhouse": "com.clickhouse.spark.ClickHouseCatalog",
        "spark.sql.catalog.clickhouse.host": "<clickhouse host>",
        "spark.sql.catalog.clickhouse.protocol": "https",
        "spark.sql.catalog.clickhouse.http_port": "<port>",
        "spark.sql.catalog.clickhouse.user": "<username>",
        "spark.sql.catalog.clickhouse.password": "password",
        "spark.sql.catalog.clickhouse.database": "default"
    }
}
```

请确保它会如下所示，位于第一个单元中：

<Image img={sparkConfigViaNotebook} size="xl" alt="通过 notebook 设置 Spark 配置" border />

如需了解更多设置，请访问 [ClickHouse Spark 配置页面](/integrations/apache-spark/spark-native-connector#configurations)。

:::info
使用 ClickHouse Cloud 时，请务必设置[所需的 Spark 配置](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings)。
:::

## 设置验证 \{#setup-verification\}

要验证依赖项和配置是否已成功完成设置，请访问当前会话的 Spark UI，并进入 `Environment` 选项卡。
在该页面中，查找与 ClickHouse 相关的设置：

<Image img={sparkUICHSettings} size="xl" alt="使用 Spark UI 验证 ClickHouse 设置" border />

## 更多资源 \{#additional-resources\}

* [ClickHouse Spark 连接器 文档](/integrations/apache-spark)
* [Azure Synapse Spark 池概述](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
* [优化 Apache Spark 工作负载的性能](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
* [管理 Synapse 中 Apache Spark 池的库](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
* [管理 Synapse 中的 Apache Spark 配置](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)