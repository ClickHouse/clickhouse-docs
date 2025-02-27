---
slug: /engines/table-engines/integrations/
sidebar_position: 40
sidebar_label:  統合
---

# 統合のためのテーブルエンジン

ClickHouseは、テーブルエンジンを含む外部システムとの統合のためのさまざまな手段を提供しています。他のテーブルエンジンと同様に、設定は`CREATE TABLE`または`ALTER TABLE`クエリを使用して行います。その後、ユーザーの視点からすると、設定された統合は通常のテーブルのように見えますが、それに対するクエリは外部システムにプロキシされます。この透過的なクエリ処理は、ディクショナリやテーブル関数のような他の統合方法に対するこのアプローチの主な利点の一つです。それらの方法では、各利用時にカスタムクエリメソッドを使用する必要があります。

<!-- このページの目次テーブルは自動的に生成されます 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAMLフロントマターのフィールドから: slug, description, title.

エラーを見つけた場合は、ページ自身のYMLフロントマターを編集してください。
-->
| ページ | 説明 |
|-----|-----|
| [Kafka](/engines/table-engines/integrations/kafka) | KafkaエンジンはApache Kafkaと連携し、データフローの公開または購読、フォールトトレラントストレージの整理、および利用可能になったストリームの処理を可能にします。 |
| [Iceberg Table Engine](/engines/table-engines/integrations/iceberg) | このエンジンは、Amazon S3、Azure、HDFS、およびローカルに保存されたテーブルの既存のApache Icebergテーブルとの読み取り専用の統合を提供します。 |
| [RabbitMQ Engine](/engines/table-engines/integrations/rabbitmq) | このエンジンはClickHouseとRabbitMQの統合を可能にします。 |
| [EmbeddedRocksDB Engine](/engines/table-engines/integrations/embedded-rocksdb) | このエンジンはClickHouseとRocksDBの統合を可能にします。 |
| [Hive](/engines/table-engines/integrations/hive) | HiveエンジンはHDFS Hiveテーブルに対して`SELECT`クエリを実行することを可能にします。 |
| [Hudi Table Engine](/engines/table-engines/integrations/hudi) | このエンジンは、Amazon S3における既存のApache Hudiテーブルとの読み取り専用の統合を提供します。 |
| [Redis](/engines/table-engines/integrations/redis) | このエンジンはClickHouseとRedisの統合を可能にします。 |
| [MySQLエンジンは、リモートのMySQLサーバーに保存されたデータに対して`SELECT`および`INSERT`クエリを実行することを可能にします。](/engines/table-engines/integrations/mysql) |  |
| [MaterializedPostgreSQL](/engines/table-engines/integrations/materialized-postgresql) | PostgreSQLテーブルの初期データダンプを持つClickHouseテーブルを作成し、レプリケーションプロセスを開始します。 |
| [S3 Table Engine](/engines/table-engines/integrations/s3) | このエンジンはAmazon S3エコシステムとの統合を提供します。HDFSエンジンに類似していますが、S3特有の機能を提供します。 |
| [HDFS](/engines/table-engines/integrations/hdfs) | このエンジンは、ClickHouseを介してHDFS上のデータを管理することで、Apache Hadoopエコシステムとの統合を提供します。このエンジンはファイルおよびURLエンジンに似ていますが、Hadoop特有の機能を提供します。 |
| [ExternalDistributed](/engines/table-engines/integrations/ExternalDistributed) | `ExternalDistributed`エンジンは、リモートサーバーのMySQLまたはPostgreSQLに保存されたデータに対して`SELECT`クエリを実行することを可能にします。シャーディングが可能なように、引数としてMySQLまたはPostgreSQLエンジンを受け入れます。 |
| [DeltaLake Table Engine](/engines/table-engines/integrations/deltalake) | このエンジンはAmazon S3における既存のDelta Lakeテーブルとの読み取り専用の統合を提供します。 |
| [PostgreSQL Table Engine](/engines/table-engines/integrations/postgresql) | PostgreSQLエンジンは、リモートのPostgreSQLサーバーに保存されたデータに対して`SELECT`および`INSERT`クエリを実行することを可能にします。 |
| [AzureBlobStorage Table Engine](/engines/table-engines/integrations/azureBlobStorage) | このエンジンはAzure Blob Storageエコシステムとの統合を提供します。 |
| [ODBC](/engines/table-engines/integrations/odbc) | ClickHouseがODBCを介して外部データベースに接続できるようにします。 |
| [JDBC](/engines/table-engines/integrations/jdbc) | ClickHouseがJDBCを介して外部データベースに接続できるようにします。 |
| [NATS Engine](/engines/table-engines/integrations/nats) | このエンジンはClickHouseとNATSを統合し、メッセージのトピックを公開または購読し、新しいメッセージが利用可能になると処理を行うことを可能にします。 |
| [SQLite](/engines/table-engines/integrations/sqlite) | このエンジンはデータをSQLiteにインポートおよびエクスポートし、ClickHouseからSQLiteテーブルへのクエリを直接サポートします。 |
| [S3Queue Table Engine](/engines/table-engines/integrations/s3queue) | このエンジンはAmazon S3エコシステムとの統合を提供し、ストリーミングインポートを可能にします。KafkaおよびRabbitMQエンジンに似ていますが、S3特有の機能を提供します。 |
| [AzureQueue Table Engine](/engines/table-engines/integrations/azure-queue) | このエンジンはAzure Blob Storageエコシステムとの統合を提供し、データのストリーミングインポートを可能にします。 |
| [TimeSeries Engine](/engines/table-engines/special/time_series) | 時間系列を格納するテーブルエンジンで、タイムスタンプおよびタグ（またはラベル）に関連付けられた値のセットを扱います。 |
| [MongoDB](/engines/table-engines/integrations/mongodb) | MongoDBエンジンはリモートコレクションからデータを読み取ることを可能にする読み取り専用のテーブルエンジンです。 |
