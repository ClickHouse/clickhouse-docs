---
sidebar_label: 'Интеграция Apache Spark с ClickHouse'
sidebar_position: 1
slug: /integrations/apache-spark
description: 'Введение в Apache Spark с ClickHouse'
keywords: ['clickhouse', 'Apache Spark', 'миграция', 'данные']
title: 'Интеграция Apache Spark с ClickHouse'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';


# Интеграция Apache Spark с ClickHouse

<br/>

[Apache Spark](https://spark.apache.org/) — это многоязычный движок для выполнения задач по обработке данных, аналитике данных и машинному обучению на одноузловых машинах или кластерах.

Существует два основных способа подключения Apache Spark и ClickHouse:

1. [Spark Connector](./apache-spark/spark-native-connector) - Коннектор Spark реализует `DataSourceV2` и имеет собственное управление каталогом. На сегодняшний день это рекомендованный способ интеграции ClickHouse и Spark.
2. [Spark JDBC](./apache-spark/spark-jdbc) - Интеграция Spark и ClickHouse с использованием [JDBC data source](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html).

<br/>
<br/>
Обе решения были успешно протестированы и полностью совместимы с различными API, включая Java, Scala, PySpark и Spark SQL.
