---
'sidebar_label': 'Integrating Apache Spark with ClickHouse'
'sidebar_position': 1
'slug': '/integrations/apache-spark'
'description': 'Apache SparkとClickHouseの統合'
'keywords':
- 'clickhouse'
- 'Apache Spark'
- 'migrating'
- 'data'
'title': 'Integrating Apache Spark with ClickHouse'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';


# Apache Spark と ClickHouse の統合

<br/>

[Apache Spark](https://spark.apache.org/) は、単一ノードのマシンまたはクラスターでデータエンジニアリング、データサイエンス、および機械学習を実行するためのマルチ言語エンジンです。

Apache Spark と ClickHouse を接続する主な方法は二つです。

1. [Spark Connector](./apache-spark/spark-native-connector) - Spark コネクタは `DataSourceV2` を実装しており、独自のカタログ管理があります。現在、これが ClickHouse と Spark を統合する推奨の方法です。
2. [Spark JDBC](./apache-spark/spark-jdbc) - [JDBC データソース](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html) を使用して Spark と ClickHouse を統合します。

<br/>
<br/>
両方のソリューションは成功裏にテストされており、Java、Scala、PySpark、Spark SQL を含むさまざまな API と完全に互換性があります。
