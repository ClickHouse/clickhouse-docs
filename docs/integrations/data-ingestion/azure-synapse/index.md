---
sidebar_label: 'Azure Synapse'
slug: /integrations/azure-synapse
description: 'Introduction to Azure Synapse with ClickHouse'
keywords: ['clickhouse', 'azure synapse', 'azure', 'synapse', 'microsoft', 'azure spark', 'data']
title: 'Integrating Azure Synapse with ClickHouse'
doc_type: 'overview'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import sparkConfigViaNotebook from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_notebook_conf.png';
import sparkUICHSettings from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_ui_ch_settings.png';

# Integrating Azure Synapse with ClickHouse

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics) is an integrated analytics service that combines big data, data science and warehousing to enable fast, large-scale data analysis.
Within Synapse, Spark pools provide on-demand, scalable [Apache Spark](https://spark.apache.org) clusters that let users run complex data transformations, machine learning, and integrations with external systems.

This article will show you how to integrate the [ClickHouse Spark connector](/integrations/apache-spark/spark-native-connector) when working with Apache Spark within Azure Synapse.

<TOCInline toc={toc}></TOCInline>

## Add the connector's dependencies {#add-connector-dependencies}
Azure Synapse supports three levels of [packages maintenance](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries):
1. Default packages
2. Spark pool level
3. Session level

<br/>

Follow the [Manage libraries for Apache Spark pools guide](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages) and add the following required dependencies to your Spark application
- `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` - [official maven](https://mvnrepository.com/artifact/com.clickhouse.spark)
- `clickhouse-jdbc-{java_client_version}-all.jar` - [official maven](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

Please visit our [Spark Connector Compatibility Matrix](/integrations/apache-spark/spark-native-connector#compatibility-matrix) docs to understand which versions suit your needs.

## Add ClickHouse as a catalog {#add-clickhouse-as-catalog}

There are a variety of ways to add Spark configs to your session:
* Custom configuration file to load with your session
* Add configurations via Azure Synapse UI
* Add configurations in your Synapse notebook

Follow this [Manage Apache Spark configuration](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration) 
and add the [connector required Spark configurations](/integrations/apache-spark/spark-native-connector#register-the-catalog-required).

For instance, you can configure your Spark session in your notebook with these settings:

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

Make sure it will be in the first cell as follows:

<Image img={sparkConfigViaNotebook} size="xl" alt="Setting Spark configurations via notebook" border/>

Please visit the [ClickHouse Spark configurations page](/integrations/apache-spark/spark-native-connector#configurations) for additional settings.

:::info
When working with ClickHouse Cloud Please make sure to set the [required Spark settings](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings).  
:::

## Setup verification {#setup-verification}

To verify that the dependencies and configurations were set successfully, please visit your session's Spark UI, and go to your `Environment` tab.
There, look for your ClickHouse related settings:

<Image img={sparkUICHSettings} size="xl" alt="Verifying ClickHouse settings using Spark UI" border/>

## Additional resources {#additional-resources}

- [ClickHouse Spark Connector Docs](/integrations/apache-spark)
- [Azure Synapse Spark Pools Overview](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
- [Optimize performance for Apache Spark workloads](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
- [Manage libraries for Apache Spark pools in Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
- [Manage Apache Spark configuration in Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
