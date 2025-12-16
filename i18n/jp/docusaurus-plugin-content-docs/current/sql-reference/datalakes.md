---
description: 'データレイクに関するドキュメント'
sidebar_label: 'データレイク'
sidebar_position: 2
slug: /sql-reference/datalakes
title: 'データレイク'
doc_type: 'reference'
---

このセクションでは、ClickHouse によるデータレイクのサポートについて見ていきます。
ClickHouse は、Iceberg、Delta Lake、Hudi、AWS Glue、REST Catalog、Unity Catalog、Microsoft OneLake など、最も一般的なテーブルフォーマットおよびデータカタログの多くをサポートしています。

# オープンなテーブル形式 {#open-table-formats}

## Iceberg {#iceberg}

Amazon S3 および S3 互換サービス、HDFS、Azure、ローカルファイルシステムからの読み取りをサポートする [iceberg](https://clickhouse.com/docs/sql-reference/table-functions/iceberg) を参照してください。[icebergCluster](https://clickhouse.com/docs/sql-reference/table-functions/icebergCluster) は、`iceberg` 関数の分散版です。

## Delta Lake {#delta-lake}

Amazon S3 および S3 互換サービス、Azure、ローカルファイルシステムからの読み取りをサポートする [deltaLake](https://clickhouse.com/docs/sql-reference/table-functions/deltalake) を参照してください。[deltaLakeCluster](https://clickhouse.com/docs/sql-reference/table-functions/deltalakeCluster) は `deltaLake` 関数の分散版です。

## Hudi {#hudi}

Amazon S3 および S3 互換サービスからの読み取りをサポートする [hudi](https://clickhouse.com/docs/sql-reference/table-functions/hudi) を参照してください。[hudiCluster](https://clickhouse.com/docs/sql-reference/table-functions/hudiCluster) は `hudi` 関数の分散版です。

# データカタログ {#data-catalogs}

## AWS Glue {#aws-glue}

AWS Glue Data Catalog は Iceberg テーブルで利用できます。`iceberg` テーブルエンジン、または [DataLakeCatalog](https://clickhouse.com/docs/engines/database-engines/datalakecatalog) データベースエンジンと組み合わせて利用できます。

## Iceberg REST Catalog {#iceberg-rest-catalog}

Iceberg REST Catalog は Iceberg テーブルで利用できます。`iceberg` テーブルエンジンや [DataLakeCatalog](https://clickhouse.com/docs/engines/database-engines/datalakecatalog) データベースエンジンと組み合わせて使用できます。

## Unity Catalog {#unity-catalog}

Unity Catalog は Delta Lake テーブルと Iceberg テーブルの両方で利用できます。`iceberg` または `deltaLake` のテーブルエンジン、あるいは [DataLakeCatalog](https://clickhouse.com/docs/engines/database-engines/datalakecatalog) データベースエンジンと組み合わせて利用できます。

## Microsoft OneLake {#microsoft-onelake}

Microsoft OneLake は、Delta Lake テーブルおよび Iceberg テーブルの両方で使用できます。[DataLakeCatalog](https://clickhouse.com/docs/engines/database-engines/datalakecatalog) データベースエンジンと組み合わせて使用できます。