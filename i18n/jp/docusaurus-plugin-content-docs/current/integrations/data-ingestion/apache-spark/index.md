---
sidebar_label: Apache Spark と ClickHouse の統合
sidebar_position: 1
slug: /integrations/apache-spark
description: Apache Spark と ClickHouse の紹介
keywords: [ clickhouse, Apache Spark, 移行, データ ]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';


# Apache Spark と ClickHouse の統合

<br/>

[Apache Spark](https://spark.apache.org/) は、単一ノードのマシンまたはクラスターでデータエンジニアリング、データサイエンス、および機械学習を実行するためのマルチ言語エンジンです。

Apache Spark と ClickHouse を接続する主な方法は2つあります：

1. [Spark Connector](./apache-spark/spark-native-connector) - Spark コネクタは `DataSourceV2` を実装し、自身のカタログ管理を持っています。現在、これが ClickHouse と Spark を統合するための推奨方法です。
2. [Spark JDBC](./apache-spark/spark-jdbc) - [JDBC データソース](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html) を使用して Spark と ClickHouse を統合します。

<br/>
<br/>
両方のソリューションは成功裏にテストされており、Java、Scala、PySpark、および Spark SQL を含むさまざまな API と完全に互換性があります。
