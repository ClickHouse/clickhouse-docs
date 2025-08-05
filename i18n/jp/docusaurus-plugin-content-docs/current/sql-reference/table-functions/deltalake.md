---
description: 'Provides a read-only table-like interface to the Delta Lake tables
  in Amazon S3.'
sidebar_label: 'deltaLake'
sidebar_position: 45
slug: '/sql-reference/table-functions/deltalake'
title: 'deltaLake'
---




# deltaLake テーブル関数

Amazon S3 または Azure Blob Storage 内の [Delta Lake](https://github.com/delta-io/delta) テーブルへの読み取り専用のテーブルのようなインターフェースを提供します。

## 構文 {#syntax}

`deltaLake` は `deltaLakeS3` のエイリアスであり、互換性のためにサポートされています。

```sql
deltaLake(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeS3(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
```

## 引数 {#arguments}

引数の説明は、それぞれのテーブル関数 `s3`、`azureBlobStorage`、`HDFS` および `file` の引数の説明と一致します。
`format` は Delta Lake テーブル内のデータファイルのフォーマットを表します。

## 戻り値 {#returned_value}

指定された Delta Lake テーブルからデータを読み取るための指定された構造のテーブル。

## 例 {#examples}

S3 にあるテーブル `https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/` からの行の選択:

```sql
SELECT
    URL,
    UserAgent
FROM deltaLake('https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/')
WHERE URL IS NOT NULL
LIMIT 2
```

```response
┌─URL───────────────────────────────────────────────────────────────────┬─UserAgent─┐
│ http://auto.ria.ua/search/index.kz/jobinmoscow/detail/55089/hasimages │         1 │
│ http://auto.ria.ua/search/index.kz/jobinmoscow.ru/gosushi             │         1 │
└───────────────────────────────────────────────────────────────────────┴───────────┘
```

## 関連項目 {#related}

- [DeltaLake エンジン](engines/table-engines/integrations/deltalake.md)
- [DeltaLake クラスターテーブル関数](sql-reference/table-functions/deltalakeCluster.md)
