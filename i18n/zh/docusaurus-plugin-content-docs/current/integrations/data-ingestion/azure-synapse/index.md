---
sidebar_label: 'Azure Synapse'
slug: /integrations/azure-synapse
description: 'Azure Synapse 与 ClickHouse 的集成概述'
keywords: ['clickhouse', 'azure synapse', 'azure', 'synapse', 'microsoft', 'azure spark', 'data']
title: '将 Azure Synapse 与 ClickHouse 集成'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import sparkConfigViaNotebook from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_notebook_conf.png';
import sparkUICHSettings from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_ui_ch_settings.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 将 Azure Synapse 与 ClickHouse 集成

<ClickHouseSupportedBadge/>

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics) 是一项集成分析服务，将大数据、数据科学和数据仓库结合在一起，用于实现快速的大规模数据分析。
在 Synapse 中，Spark 池提供按需扩缩的 [Apache Spark](https://spark.apache.org) 集群，使用户能够运行复杂的数据转换、机器学习任务，以及与外部系统的集成。

本文将向你展示在 Azure Synapse 中使用 Apache Spark 时，如何集成 [ClickHouse Spark 连接器](/integrations/apache-spark/spark-native-connector)。

<TOCInline toc={toc}></TOCInline>



## 添加连接器依赖项 {#add-connector-dependencies}

Azure Synapse 支持三个级别的[包维护](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries)：

1. 默认包
2. Spark 池级别
3. 会话级别

<br />

请参照 [Apache Spark 池库管理指南](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)，将以下必需的依赖项添加到您的 Spark 应用程序中：

- `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` - [官方 Maven 仓库](https://mvnrepository.com/artifact/com.clickhouse.spark)
- `clickhouse-jdbc-{java_client_version}-all.jar` - [官方 Maven 仓库](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

请访问我们的 [Spark 连接器兼容性矩阵](/integrations/apache-spark/spark-native-connector#compatibility-matrix)文档，了解哪些版本适合您的需求。


## 将 ClickHouse 添加为 catalog {#add-clickhouse-as-catalog}

有多种方式可以将 Spark 配置添加到会话中:

- 加载自定义配置文件到会话
- 通过 Azure Synapse UI 添加配置
- 在 Synapse notebook 中添加配置

请参考[管理 Apache Spark 配置](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)并添加[连接器所需的 Spark 配置](/integrations/apache-spark/spark-native-connector#register-the-catalog-required)。

例如,您可以在 notebook 中使用以下设置配置 Spark 会话:

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

确保将其放在第一个单元格中,如下所示:

<Image
  img={sparkConfigViaNotebook}
  size='xl'
  alt='通过 notebook 设置 Spark 配置'
  border
/>

请访问 [ClickHouse Spark 配置页面](/integrations/apache-spark/spark-native-connector#configurations)了解更多设置。

:::info
使用 ClickHouse Cloud 时,请确保设置[所需的 Spark 配置](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings)。  
:::


## 设置验证 {#setup-verification}

要验证依赖项和配置是否已成功设置,请访问您会话的 Spark UI,然后进入 `Environment` 选项卡。
在其中查找与 ClickHouse 相关的设置:

<Image
  img={sparkUICHSettings}
  size='xl'
  alt='使用 Spark UI 验证 ClickHouse 设置'
  border
/>


## 其他资源 {#additional-resources}

- [ClickHouse Spark 连接器文档](/integrations/apache-spark)
- [Azure Synapse Spark 池概述](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
- [优化 Apache Spark 工作负载的性能](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
- [管理 Synapse 中 Apache Spark 池的库](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
- [管理 Synapse 中的 Apache Spark 配置](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
