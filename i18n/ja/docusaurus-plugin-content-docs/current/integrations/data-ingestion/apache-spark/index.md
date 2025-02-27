---
sidebar_label: ClickHouseとのApache Sparkの統合
sidebar_position: 1
slug: /integrations/apache-spark
description: ClickHouseとApache Sparkの紹介
keywords: [ clickhouse, Apache Spark, 移行, データ ]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';

# ClickHouseとのApache Sparkの統合

<br/>

[Apache Spark](https://spark.apache.org/) は、単一ノードのマシンまたはクラスターでデータエンジニアリング、データサイエンス、および機械学習を実行するための多言語エンジンです。

Apache SparkとClickHouseを接続する主な方法は二つあります：

1. [Sparkコネクタ](./apache-spark/spark-native-connector) - Sparkコネクタは `DataSourceV2` を実装し、自身のカタログ管理を持っています。現時点では、ClickHouseとSparkを統合するための推奨方法です。
2. [Spark JDBC](./apache-spark/spark-jdbc) - [JDBCデータソース](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html) を使用して、SparkとClickHouseを統合します。

<br/>
<br/>
どちらのソリューションも成功裏にテストされており、Java、Scala、PySpark、Spark SQLを含むさまざまなAPIと完全に互換性があります。
