---
slug: /engines/table-engines/integrations/iceberg
sidebar_position: 90
sidebar_label: Iceberg
title: "Icebergテーブルエンジン"
description: "このエンジンは、Amazon S3、Azure、HDFS、およびローカルに保存されたテーブル内の既存のApache Icebergテーブルとの読み取り専用統合を提供します。"
---


# Icebergテーブルエンジン

:::warning 
ClickHouseでIcebergデータを操作するためには、[Icebergテーブル関数](/sql-reference/table-functions/iceberg.md)の使用をお勧めします。Icebergテーブル関数は現在、Icebergテーブルの部分的な読み取り専用インターフェースを提供する十分な機能を持っています。

Icebergテーブルエンジンは利用可能ですが、制限がある場合があります。ClickHouseは元々、外部で変更されるスキーマを持つテーブルをサポートするようには設計されておらず、これがIcebergテーブルエンジンの機能に影響を及ぼす可能性があります。そのため、通常のテーブルで機能する一部の機能が利用できない場合や、特に古いアナライザーを使用する際に正しく機能しない場合があります。

最適な互換性を確保するために、Icebergテーブルエンジンのサポートを改善し続ける間は、Icebergテーブル関数の使用を推奨します。
:::

このエンジンは、Amazon S3、Azure、HDFS、およびローカルに保存されたテーブル内の既存のApache [Iceberg](https://iceberg.apache.org/) テーブルとの読み取り専用統合を提供します。

## テーブルの作成 {#create-table}

Icebergテーブルは既にストレージ内に存在している必要があります。このコマンドは新しいテーブルを作成するためのDDLパラメータを取りません。

``` sql
CREATE TABLE iceberg_table_s3
    ENGINE = IcebergS3(url,  [, NOSIGN | access_key_id, secret_access_key, [session_token]], format, [,compression])

CREATE TABLE iceberg_table_azure
    ENGINE = IcebergAzure(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])

CREATE TABLE iceberg_table_hdfs
    ENGINE = IcebergHDFS(path_to_table, [,format] [,compression_method])

CREATE TABLE iceberg_table_local
    ENGINE = IcebergLocal(path_to_table, [,format] [,compression_method])
```

**エンジン引数**

引数の説明は、エンジン`S3`、`AzureBlobStorage`、`HDFS`、および`File`の引数の説明と一致します。
`format`は、Icebergテーブル内のデータファイルのフォーマットを示します。

エンジンパラメータは、[Named Collections](../../../operations/named-collections.md)を使用して指定できます。

**例**

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

Named Collectionsを使用する場合:

``` xml
<clickhouse>
    <named_collections>
        <iceberg_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test</access_key_id>
            <secret_access_key>test</secret_access_key>
        </iceberg_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3(iceberg_conf, filename = 'test_table')
```

**エイリアス**

テーブルエンジン`Iceberg`は現在、`IcebergS3`のエイリアスです。

**スキーマの進化**
現在、CHの助けを借りて、時間の経過とともにスキーマが変更されたIcebergテーブルを読み取ることができます。現在、カラムが追加され、削除され、順序が変更されたテーブルの読み取りをサポートしています。値が必要なカラムをNULLが許可されるカラムに変更することもできます。また、単純な型に対して許可されている型変換をサポートしています。具体的には:
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) ただし、P' > P

現在、ネストされた構造や配列およびマップ内の要素の型を変更することはできません。

作成時に動的スキーマ推論を使用してスキーマが変更されたテーブルを読み取るには、テーブル作成時に `allow_dynamic_metadata_for_data_lakes = true` を設定します。

**パーティションプルーニング**

ClickHouseは、IcebergテーブルのSELECTクエリ中にパーティションプルーニングをサポートしています。これにより、関連しないデータファイルをスキップすることでクエリ性能が最適化されます。現在、アイデンティティ変換および時間ベースの変換（時間、日、月、年）のみで機能します。パーティションプルーニングを有効にするには、 `use_iceberg_partition_pruning = 1` を設定します。

### データキャッシュ {#data-cache}

`Iceberg`テーブルエンジンおよびテーブル関数は、`S3`、`AzureBlobStorage`、`HDFS`ストレージと同様にデータキャッシュをサポートしています。詳細は[こちら](../../../engines/table-engines/integrations/s3.md#data-cache)を参照してください。

## 参照 {#see-also}

- [icebergテーブル関数](/sql-reference/table-functions/iceberg.md)
