---
sidebar_label: 'ClickHouseとApache Sparkの統合'
sidebar_position: 1
slug: /integrations/apache-spark
description: 'ClickHouseとのApache Sparkの導入'
keywords: ['clickhouse', 'Apache Spark', '移行', 'データ']
title: 'ClickHouseとApache Sparkの統合'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';


# ClickHouseとApache Sparkの統合

<br/>

[Apache Spark](https://spark.apache.org/)は、単一ノードマシンまたはクラスターでデータエンジニアリング、データサイエンス、および機械学習を実行するためのマルチランゲージエンジンです。

Apache SparkとClickHouseを接続する主な方法は2つあります：

1. [Spark Connector](./apache-spark/spark-native-connector) - Sparkコネクタは`DataSourceV2`を実装し、独自のカタログ管理を持っています。現時点では、ClickHouseとSparkを統合するための推奨方法です。
2. [Spark JDBC](./apache-spark/spark-jdbc) - [JDBCデータソース](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html)を使用してSparkとClickHouseを統合します。

<br/>
<br/>
どちらのソリューションも正常にテストされており、Java、Scala、PySpark、Spark SQLを含むさまざまなAPIと完全に互換性があります。
