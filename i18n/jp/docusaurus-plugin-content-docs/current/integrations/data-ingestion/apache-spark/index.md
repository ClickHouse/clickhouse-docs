---
'sidebar_label': 'Apache SparkとClickHouseの統合'
'sidebar_position': 1
'slug': '/integrations/apache-spark'
'description': 'ClickHouseとのApache Sparkの導入'
'keywords':
- 'clickhouse'
- 'Apache Spark'
- 'migrating'
- 'data'
'title': 'Apache SparkとClickHouseの統合'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';


# Apache SparkとClickHouseの統合

<br/>

[Apache Spark](https://spark.apache.org/) は、データエンジニアリング、データサイエンス、機械学習を単一ノードのマシンまたはクラスターで実行するためのマルチランゲージエンジンです。

Apache SparkとClickHouseを接続する主な方法は2つあります：

1. [Spark Connector](./apache-spark/spark-native-connector) - Sparkコネクタは`DataSourceV2`を実装しており、独自のカタログ管理を持っています。現在、これがClickHouseとSparkを統合するための推奨方法です。
2. [Spark JDBC](./apache-spark/spark-jdbc) - [JDBCデータソース](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html)を使用してSparkとClickHouseを統合します。

<br/>
<br/>
両方のソリューションは成功裏にテストされており、Java、Scala、PySpark、Spark SQLを含むさまざまなAPIと完全に互換性があります。
