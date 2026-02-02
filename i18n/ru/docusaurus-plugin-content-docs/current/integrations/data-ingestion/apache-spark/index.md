---
sidebar_label: 'Интеграция Apache Spark с ClickHouse'
sidebar_position: 1
slug: /integrations/apache-spark
description: 'Введение в работу Apache Spark с ClickHouse'
keywords: ['clickhouse', 'Apache Spark', 'миграция', 'данные']
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

# Интеграция Apache Spark с ClickHouse \{#integrating-apache-spark-with-clickhouse\}

<ClickHouseSupportedBadge/>

[Apache Spark](https://spark.apache.org/) — это вычислительный движок с поддержкой нескольких языков для выполнения задач data engineering, data science и машинного обучения на отдельных узлах или в кластерах.

Существует два основных способа подключить Apache Spark к ClickHouse:

1. [Spark Connector](./apache-spark/spark-native-connector) — коннектор Spark реализует `DataSourceV2` и имеет собственное управление каталогом (Catalog). На данный момент это рекомендованный способ интеграции ClickHouse и Spark.
2. [Spark JDBC](./apache-spark/spark-jdbc) — интеграция Spark и ClickHouse
   с использованием [источника данных JDBC](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html).

<br/>

Оба решения успешно протестированы и полностью совместимы с различными API, включая Java, Scala, PySpark и Spark SQL.

### Среды выполнения Spark\{#spark-runtime-environment\}

#### Стандартные среды выполнения Spark\{#standard-spark-runtime\}

Коннектор Spark работает из коробки в средах, которые в значительной степени соответствуют эталонной среде выполнения Apache Spark, таких как Amazon EMR или развертывания Spark в Kubernetes.

#### Управляемые платформы Spark\{#managed-spark-platforms\}

Такие платформы, как [AWS Glue](./../aws-glue/index.md) и [Databricks](./databricks.md), вводят дополнительные абстракции и поведение, зависящее от среды.
Хотя основная интеграция остаётся прежней, они могут требовать отдельной конфигурации и дополнительных шагов настройки. Подробности см. на соответствующих страницах документации.