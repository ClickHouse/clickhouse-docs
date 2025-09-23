---
sidebar_label: 'Integrating Apache Spark with ClickHouse'
sidebar_position: 1
slug: /integrations/apache-spark
description: 'Introduction to Apache Spark with ClickHouse'
keywords: ['clickhouse', 'Apache Spark', 'migrating', 'data']
title: 'Integrating Apache Spark with ClickHouse'
doc_type: 'guide'
integration_type: ['data ingestion']
integration_logo: '/static/images/integrations/logos/apache_spark_logo.svg'
integration_title: 'Apache Spark'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';

# Integrating Apache Spark with ClickHouse

<br/>

[Apache Spark](https://spark.apache.org/) is a multi-language engine for executing data engineering, data
science, and machine learning on single-node machines or clusters.

There are two main ways to connect Apache Spark and ClickHouse:

1. [Spark Connector](./apache-spark/spark-native-connector) - The Spark connector implements the `DataSourceV2` and has its own Catalog
   management. As of today, this is the recommended way to integrate ClickHouse and Spark.
2. [Spark JDBC](./apache-spark/spark-jdbc) - Integrate Spark and ClickHouse
   using a [JDBC data source](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html).

<br/>
<br/>
Both solutions have been successfully tested and are fully compatible with various APIs, including Java, Scala, PySpark, and Spark SQL.
