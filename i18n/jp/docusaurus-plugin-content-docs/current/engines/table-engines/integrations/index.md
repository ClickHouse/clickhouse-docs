---
description: '統合のためのテーブルエンジンに関するドキュメント'
sidebar_label: '統合'
sidebar_position: 40
slug: /engines/table-engines/integrations/
title: '統合のためのテーブルエンジン'
---


# 統合のためのテーブルエンジン

ClickHouseは、テーブルエンジンを含む外部システムとの統合のためのさまざまな手段を提供します。他のテーブルエンジンと同様に、設定は`CREATE TABLE`または`ALTER TABLE`クエリを使用して行います。ユーザーの視点から見ると、設定された統合は通常のテーブルのように見えますが、それに対するクエリは外部システムにプロキシされます。この透過的なクエリは、辞書やテーブル関数のような代替の統合方法に比べて、このアプローチの重要な利点の1つです。これらの代替手法では、各使用時にカスタムクエリメソッドを使用する必要があります。

<!-- このページの目次は自動的に生成されます
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAMLフロントマターのフィールドから: slug, description, title.

エラーを見つけた場合は、ページ自体のYMLフロントマターを編集してください。
-->
| ページ | 説明 |
|-----|-----|
| [Kafka](/engines/table-engines/integrations/kafka) | KafkaエンジンはApache Kafkaと連携し、データフローを公開したり購読したり、フォールトトレラントストレージを整理したり、ストリームが利用可能になると処理します。 |
| [Iceberg Table Engine](/engines/table-engines/integrations/iceberg) | このエンジンは、Amazon S3、Azure、HDFS、ローカルに保存されたテーブルにある既存のApache Icebergテーブルとの読み取り専用統合を提供します。 |
| [RabbitMQ Engine](/engines/table-engines/integrations/rabbitmq) | このエンジンは、ClickHouseとRabbitMQを統合することを可能にします。 |
| [EmbeddedRocksDB Engine](/engines/table-engines/integrations/embedded-rocksdb) | このエンジンは、ClickHouseとRocksDBを統合することを可能にします。 |
| [Hive](/engines/table-engines/integrations/hive) | Hiveエンジンは、HDFS Hiveテーブルに対して`SELECT`クエリを実行することを可能にします。 |
| [Hudi Table Engine](/engines/table-engines/integrations/hudi) | このエンジンは、Amazon S3にある既存のApache Hudiテーブルとの読み取り専用統合を提供します。 |
| [Redis](/engines/table-engines/integrations/redis) | このエンジンは、ClickHouseとRedisを統合することを可能にします。 |
| [MySQLエンジンは、リモートMySQLサーバーに保存されたデータに対して`SELECT`および`INSERT`クエリを実行することができます。](/engines/table-engines/integrations/mysql) | MySQLテーブルエンジンに関するドキュメント |
| [MaterializedPostgreSQL](/engines/table-engines/integrations/materialized-postgresql) | PostgreSQLテーブルの初期データダンプを持つClickHouseテーブルを作成し、レプリケーションプロセスを開始します。 |
| [S3 Table Engine](/engines/table-engines/integrations/s3) | このエンジンは、Amazon S3エコシステムとの統合を提供します。HDFSエンジンに似ていますが、S3特有の機能を提供します。 |
| [HDFS](/engines/table-engines/integrations/hdfs) | このエンジンは、ClickHouseを介してHDFS上のデータを管理することによって、Apache Hadoopエコシステムとの統合を提供します。このエンジンは、FileおよびURLエンジンに似ていますが、Hadoop特有の機能を提供します。 |
| [ExternalDistributed](/engines/table-engines/integrations/ExternalDistributed) | `ExternalDistributed`エンジンは、リモートサーバーのMySQLまたはPostgreSQLに保存されたデータに対して`SELECT`クエリを実行することを可能にします。引数としてMySQLまたはPostgreSQLエンジンを受け入れるため、シャーディングが可能です。 |
| [DeltaLake Table Engine](/engines/table-engines/integrations/deltalake) | このエンジンは、Amazon S3にある既存のDelta Lakeテーブルとの読み取り専用統合を提供します。 |
| [PostgreSQL Table Engine](/engines/table-engines/integrations/postgresql) | PostgreSQLエンジンは、リモートPostgreSQLサーバーに保存されたデータに対して`SELECT`および`INSERT`クエリを実行することを可能にします。 |
| [AzureBlobStorage Table Engine](/engines/table-engines/integrations/azureBlobStorage) | このエンジンは、Azure Blob Storageエコシステムとの統合を提供します。 |
| [ODBC](/engines/table-engines/integrations/odbc) | ClickHouseがODBCを介して外部データベースに接続することを可能にします。 |
| [JDBC](/engines/table-engines/integrations/jdbc) | ClickHouseがJDBCを介して外部データベースに接続することを可能にします。 |
| [NATS Engine](/engines/table-engines/integrations/nats) | このエンジンは、ClickHouseとNATSを統合してメッセージの公開または購読を行い、新しいメッセージが利用可能になると処理します。 |
| [SQLite](/engines/table-engines/integrations/sqlite) | このエンジンは、SQLiteにデータをインポートおよびエクスポートすることを可能にし、ClickHouseから直接SQLiteテーブルに対してクエリをサポートします。 |
| [S3Queue Table Engine](/engines/table-engines/integrations/s3queue) | このエンジンは、Amazon S3エコシステムとの統合を提供し、ストリーミングインポートを可能にします。KafkaおよびRabbitMQエンジンに似ていますが、S3特有の機能を提供します。 |
| [AzureQueue Table Engine](/engines/table-engines/integrations/azure-queue) | このエンジンは、Azure Blob Storageエコシステムとの統合を提供し、ストリーミングデータのインポートを可能にします。 |
| [TimeSeries Engine](/engines/table-engines/special/time_series) | タイムスタンプおよびタグ（またはラベル）に関連付けられた値のセットである時系列を格納するテーブルエンジンです。 |
| [MongoDB](/engines/table-engines/integrations/mongodb) | MongoDBエンジンは、リモートコレクションからデータを読み取ることができる読み取り専用テーブルエンジンです。 |
