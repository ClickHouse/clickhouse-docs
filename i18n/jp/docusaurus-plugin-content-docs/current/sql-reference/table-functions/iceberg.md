---
slug: /sql-reference/table-functions/iceberg
sidebar_position: 90
sidebar_label: iceberg
title: "iceberg"
description: "Amazon S3、Azure、HDFS またはローカルに保存された Apache Iceberg テーブルへの読み取り専用テーブルライクインターフェースを提供します。"
---


# iceberg テーブル関数

Amazon S3、Azure、HDFS またはローカルに保存された Apache [Iceberg](https://iceberg.apache.org/) テーブルへの読み取り専用テーブルライクインターフェースを提供します。

## 構文 {#syntax}

``` sql
icebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3(named_collection[, option=value [,..]])

icebergAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzure(named_collection[, option=value [,..]])

icebergHDFS(path_to_table, [,format] [,compression_method])
icebergHDFS(named_collection[, option=value [,..]])

icebergLocal(path_to_table, [,format] [,compression_method])
icebergLocal(named_collection[, option=value [,..]])
```

## 引数 {#arguments}

引数の説明は、それぞれのテーブル関数 `s3`、`azureBlobStorage`、`HDFS` および `file` の引数の説明に一致します。
`format` は Iceberg テーブル内のデータファイルのフォーマットを表します。

**返される値**
指定された Iceberg テーブルからデータを読み取るための指定された構造を持つテーブル。

**例**

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse は現在、`icebergS3`、`icebergAzure`、`icebergHDFS` および `icebergLocal` テーブル関数および `IcebergS3`、`icebergAzure`、`IcebergHDFS` と `IcebergLocal` テーブルエンジンを介して Iceberg フォーマットのバージョン1と2の読み取りをサポートしています。
:::

## 名前付きコレクションの定義 {#defining-a-named-collection}

URL と認証情報を保存するための名前付きコレクションを構成する例を以下に示します。

```xml
<clickhouse>
    <named_collections>
        <iceberg_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test<access_key_id>
            <secret_access_key>test</secret_access_key>
            <format>auto</format>
            <structure>auto</structure>
        </iceberg_conf>
    </named_collections>
</clickhouse>
```

```sql
SELECT * FROM icebergS3(iceberg_conf, filename = 'test_table')
DESCRIBE icebergS3(iceberg_conf, filename = 'test_table')
```

**スキーマの進化**
現時点では、CH を利用して、時間の経過と共にスキーマが変更された iceberg テーブルを読み取ることができます。現在、列の追加や削除、列の順序が変更されたテーブルの読み取りをサポートしています。また、値が必要な列を NULL を許可する列に変更することも可能です。さらに、単純な型に対する許可された型変換をサポートしています。具体的には：
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) ただし P' > P であること。

現在、ネストされた構造や配列およびマップ内の要素の型の変更はできません。

**パーティションプルーニング**

ClickHouse は Iceberg テーブルに対する SELECT クエリ中のパーティションプルーニングをサポートしており、関連のないデータファイルをスキップすることでクエリ性能を最適化します。現在、これはアイデンティティ変換と時間ベースの変換（時間、日、月、年）のみで動作します。パーティションプルーニングを有効にするには、`use_iceberg_partition_pruning = 1` を設定してください。

**エイリアス**

テーブル関数 `iceberg` は現在 `icebergS3` のエイリアスです。

**関連情報**

- [Iceberg エンジン](/engines/table-engines/integrations/iceberg.md)
- [Iceberg クラスターテーブル関数](/sql-reference/table-functions/icebergCluster.md)
