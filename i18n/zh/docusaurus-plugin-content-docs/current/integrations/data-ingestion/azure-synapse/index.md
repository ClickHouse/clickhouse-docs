---
'sidebar_label': 'Azure Synapse'
'slug': '/integrations/azure-synapse'
'description': 'Introduction to Azure Synapse with ClickHouse'
'keywords':
- 'clickhouse'
- 'azure synapse'
- 'azure'
- 'synapse'
- 'microsoft'
- 'azure spark'
- 'data'
'title': 'Integrating Azure Synapse with ClickHouse'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import sparkConfigViaNotebook from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_notebook_conf.png';
import sparkUICHSettings from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_ui_ch_settings.png';


# 将 Azure Synapse 与 ClickHouse 集成

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics) 是一项集成的分析服务，结合了大数据、数据科学和仓库，以实现快速、大规模的数据分析。在 Synapse 中，Spark 池提供按需可扩展的 [Apache Spark](https://spark.apache.org) 集群，让用户能够运行复杂的数据转换、机器学习和与外部系统的集成。

本文将展示如何在 Azure Synapse 中与 Apache Spark 一起集成 [ClickHouse Spark 连接器](/integrations/apache-spark/spark-native-connector)。

<TOCInline toc={toc}></TOCInline>

## 添加连接器的依赖 {#add-connector-dependencies}
Azure Synapse 支持三种级别的 [包维护方式](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries)：
1. 默认包
2. Spark 池级别
3. 会话级别

<br/>

请遵循 [管理 Apache Spark 池的库指南](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)，并将以下所需依赖项添加到您的 Spark 应用程序中：
   - `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` - [官方 maven](https://mvnrepository.com/artifact/com.clickhouse.spark)
   - `clickhouse-jdbc-{java_client_version}-all.jar` - [官方 maven](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

请访问我们的 [Spark 连接器兼容性矩阵](/integrations/apache-spark/spark-native-connector#compatibility-matrix) 文档，以了解哪些版本适合您的需求。

## 将 ClickHouse 添加为目录 {#add-clickhouse-as-catalog}

有多种方法可以将 Spark 配置添加到您的会话中：
* 自定义配置文件以随您的会话加载
* 通过 Azure Synapse UI 添加配置
* 在您的 Synapse 笔记本中添加配置

请遵循 [管理 Apache Spark 配置](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration) 
并添加 [连接器所需的 Spark 配置](/integrations/apache-spark/spark-native-connector#register-the-catalog-required)。

例如，您可以使用以下设置在笔记本中配置 Spark 会话：

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

确保它放在第一个单元格中，如下所示：

<Image img={sparkConfigViaNotebook} size="xl" alt="通过笔记本设置 Spark 配置" border/>

请访问 [ClickHouse Spark 配置页面](/integrations/apache-spark/spark-native-connector#configurations) 获取更多设置。

:::info
在使用 ClickHouse Cloud 时，请确保设置 [所需的 Spark 设置](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings)。  
:::

## 设置验证 {#setup-verification}

要验证依赖项和配置是否成功设置，请访问您会话的 Spark UI，并转到您的 `Environment` 选项卡。在那里，查找与 ClickHouse 相关的设置：

<Image img={sparkUICHSettings} size="xl" alt="使用 Spark UI 验证 ClickHouse 设置" border/>

## 其他资源 {#additional-resources}

- [ClickHouse Spark 连接器文档](/integrations/apache-spark)
- [Azure Synapse Spark 池概述](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
- [优化 Apache Spark 工作负载的性能](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
- [在 Synapse 中管理 Apache Spark 池的库](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
- [在 Synapse 中管理 Apache Spark 配置](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
