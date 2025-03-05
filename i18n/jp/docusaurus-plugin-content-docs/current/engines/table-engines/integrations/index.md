---
slug: /engines/table-engines/integrations/
sidebar_position: 40
sidebar_label:  統合
---


# 統合のためのテーブルエンジン

ClickHouseは、テーブルエンジンを含む外部システムとの統合のためのさまざまな手段を提供しています。他のすべてのテーブルエンジンと同様に、設定は `CREATE TABLE` または `ALTER TABLE` クエリを使用して行われます。ユーザーの視点から見ると、設定された統合は通常のテーブルのように見えますが、それに対するクエリは外部システムにプロキシされます。この透過的なクエリ処理は、辞書やテーブル関数のような代替統合方法に対するこのアプローチの主要な利点の一つであり、各使用時にカスタムクエリメソッドを必要としません。

<!-- このページの目次テーブルは、 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
からYAMLフロントマターのフィールド：slug、description、titleから自動生成されます。

エラーを見つけた場合は、ページ自体のYMLフロントマターを編集してください。
-->
| ページ | 説明 |
|-----|-----|
| [Kafka](/docs/engines/table-engines/integrations/kafka) | KafkaエンジンはApache Kafkaと連携し、データフローの公開や購読、フォールトトレラントストレージの整理、ストリームの処理を行います。 |
| [Iceberg Table Engine](/docs/engines/table-engines/integrations/iceberg) | このエンジンは、Amazon S3、Azure、HDFSおよびローカルに保存されたテーブルの既存のApache Icebergテーブルとの読み取り専用の統合を提供します。 |
| [RabbitMQ Engine](/docs/engines/table-engines/integrations/rabbitmq) | このエンジンは、ClickHouseとRabbitMQとの統合を可能にします。 |
| [EmbeddedRocksDB Engine](/docs/engines/table-engines/integrations/embedded-rocksdb) | このエンジンは、ClickHouseとRocksDBとの統合を可能にします。 |
| [Hive](/docs/engines/table-engines/integrations/hive) | Hiveエンジンを使用すると、HDFSのHiveテーブルに対して `SELECT` クエリを実行できます。 |
| [Hudi Table Engine](/docs/engines/table-engines/integrations/hudi) | このエンジンは、Amazon S3の既存のApache Hudiテーブルとの読み取り専用の統合を提供します。 |
| [Redis](/docs/engines/table-engines/integrations/redis) | このエンジンは、ClickHouseとRedisとの統合を可能にします。 |
| [MySQLエンジンは、リモートMySQLサーバーに保存されたデータに対して `SELECT` および `INSERT` クエリを実行できます。](/docs/engines/table-engines/integrations/mysql) |  |
| [MaterializedPostgreSQL](/docs/engines/table-engines/integrations/materialized-postgresql) | PostgreSQLテーブルの初期データダンプを使用してClickHouseテーブルを作成し、レプリケーションプロセスを開始します。 |
| [S3 Table Engine](/docs/engines/table-engines/integrations/s3) | このエンジンは、Amazon S3エコシステムとの統合を提供します。HDFSエンジンに似ていますが、S3専用の機能を提供します。 |
| [HDFS](/docs/engines/table-engines/integrations/hdfs) | このエンジンは、ClickHouseを介してHDFS上のデータを管理することにより、Apache Hadoopエコシステムとの統合を提供します。このエンジンはFileおよびURLエンジンに似ていますが、Hadoop専用の機能を提供します。 |
| [ExternalDistributed](/docs/engines/table-engines/integrations/ExternalDistributed) | `ExternalDistributed`エンジンは、リモートサーバーのMySQLまたはPostgreSQLに保存されたデータに対して`SELECT`クエリを実行することを可能にします。MySQLまたはPostgreSQLエンジンを引数として受け取り、シャーディングが可能です。 |
| [DeltaLake Table Engine](/docs/engines/table-engines/integrations/deltalake) | このエンジンは、Amazon S3の既存のDelta Lakeテーブルとの読み取り専用の統合を提供します。 |
| [PostgreSQL Table Engine](/docs/engines/table-engines/integrations/postgresql) | PostgreSQLエンジンは、リモートPostgreSQLサーバーに保存されたデータに対して `SELECT` および `INSERT` クエリを実行できます。 |
| [AzureBlobStorage Table Engine](/docs/engines/table-engines/integrations/azureBlobStorage) | このエンジンは、Azure Blob Storageエコシステムとの統合を提供します。 |
| [ODBC](/docs/engines/table-engines/integrations/odbc) | ClickHouseがODBCを介して外部データベースに接続できるようにします。 |
| [JDBC](/docs/engines/table-engines/integrations/jdbc) | ClickHouseがJDBCを介して外部データベースに接続できるようにします。 |
| [NATS Engine](/docs/engines/table-engines/integrations/nats) | このエンジンは、ClickHouseとNATSを統合して、メッセージの発行や購読を行い、新しいメッセージが利用可能になると処理します。 |
| [SQLite](/docs/engines/table-engines/integrations/sqlite) | このエンジンは、SQLiteへのデータのインポートおよびエクスポートを可能にし、ClickHouseからSQLiteテーブルへのクエリをサポートします。 |
| [S3Queue Table Engine](/docs/engines/table-engines/integrations/s3queue) | このエンジンは、Amazon S3エコシステムとの統合を提供し、ストリーミングインポートを可能にします。KafkaおよびRabbitMQエンジンに似ていますが、S3専用の機能を提供します。 |
| [AzureQueue Table Engine](/docs/engines/table-engines/integrations/azure-queue) | このエンジンは、Azure Blob Storageエコシステムとの統合を提供し、ストリーミングデータのインポートを可能にします。 |
| [TimeSeries Engine](/docs/engines/table-engines/special/time_series) | タイムシリーズを保存するテーブルエンジンであり、タイムスタンプおよびタグ（またはラベル）に関連付けられた値のセットを表します。 |
| [MongoDB](/docs/engines/table-engines/integrations/mongodb) | MongoDBエンジンはリードオンリーテーブルエンジンであり、リモートコレクションからデータを読み取ることができます。 |
