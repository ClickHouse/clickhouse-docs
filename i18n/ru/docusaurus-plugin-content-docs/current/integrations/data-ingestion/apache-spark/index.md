---
sidebar_label: 'Интеграция Apache Spark с ClickHouse'
sidebar_position: 1
slug: /integrations/apache-spark
description: 'Введение в интеграцию Apache Spark с ClickHouse'
keywords: ['clickhouse', 'Apache Spark', 'миграция', 'данных']
title: 'Интеграция Apache Spark с ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Интеграция Apache Spark с ClickHouse

<ClickHouseSupportedBadge/>

[Apache Spark](https://spark.apache.org/) — это многоязычный движок для выполнения задач data engineering, data science и машинного обучения на отдельных серверах или в кластерах.

Существует два основных способа интеграции Apache Spark и ClickHouse:

1. [Spark Connector](./apache-spark/spark-native-connector) — коннектор Spark реализует интерфейс `DataSourceV2` и имеет собственную систему управления каталогом (Catalog). На сегодняшний день это рекомендуемый способ интеграции ClickHouse и Spark.
2. [Spark JDBC](./apache-spark/spark-jdbc) — интеграция Spark и ClickHouse с использованием [источника данных JDBC](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html).

<br/>

<br/>

Оба решения были успешно протестированы и полностью совместимы с различными API, включая Java, Scala, PySpark и Spark SQL.