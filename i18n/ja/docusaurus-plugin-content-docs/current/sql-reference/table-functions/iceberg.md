---
slug: /sql-reference/table-functions/iceberg
sidebar_position: 90
sidebar_label: iceberg
---

# iceberg テーブル関数

Apache [Iceberg](https://iceberg.apache.org/) テーブルへの読み取り専用のテーブルライクインターフェースを提供します。これらのテーブルは、Amazon S3、Azure、HDFS、またはローカルに保存されたものです。

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

引数の説明は、`s3`、`azureBlobStorage`、`HDFS`、および `file` のテーブル関数の引数に関する説明と一致します。`format` は、Iceberg テーブル内のデータファイルのフォーマットを表します。

**返される値**  
指定された Iceberg テーブルからデータを読み取るための指定された構造のテーブル。

**例**

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse は現在、`icebergS3`、`icebergAzure`、`icebergHDFS` および `icebergLocal` テーブル関数を通じて Iceberg フォーマットの v1 および v2 の読み取りをサポートしています。また、`IcebergS3`、`icebergAzure`、`IcebergHDFS` および `IcebergLocal` テーブルエンジンもサポートしています。
:::

## 名前付きコレクションの定義 {#defining-a-named-collection}

URL と資格情報を保存するための名前付きコレクションの設定例は次のとおりです。

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
現在、CHの助けを借りて、時間の経過とともにスキーマが変更された iceberg テーブルを読み取ることができます。現在、カラムが追加されたり削除されたり、順序が変更されたテーブルを読み取ることをサポートしています。また、値が必須のカラムをNULLが許可されるカラムに変更することもできます。さらに、次の単純型の型キャストが許可されています：  
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) ただし P' > P。

現在、ネストされた構造や配列およびマップ内の要素の型を変更することはできません。

**パーティションプルーニング**

ClickHouse は、Iceberg テーブルの SELECT クエリ中にパーティションプルーニングをサポートしており、関連のないデータファイルをスキップすることによってクエリパフォーマンスを最適化します。現在のところ、アイデンティティトランスフォームと時間ベースのトランスフォーム（時間、日、月、年）のみに対応しています。パーティションプルーニングを有効にするには、`use_iceberg_partition_pruning = 1` を設定します。

**エイリアス**

テーブル関数 `iceberg` は現在 `icebergS3` のエイリアスです。

**参考資料**

- [Iceberg エンジン](/engines/table-engines/integrations/iceberg.md)
- [Iceberg クラスターテーブル関数](/sql-reference/table-functions/icebergCluster.md)
