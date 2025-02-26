---
slug: /engines/table-engines/integrations/iceberg
sidebar_position: 90
sidebar_label: Iceberg
title: "Iceberg テーブルエンジン"
description: "このエンジンは、Amazon S3、Azure、HDFS およびローカルに保存されたテーブル内の既存の Apache Iceberg テーブルとの読み取り専用統合を提供します。"
---

# Iceberg テーブルエンジン

:::warning 
Iceberg データを ClickHouse で扱う際には、[Iceberg テーブル関数](/sql-reference/table-functions/iceberg.md) の使用をお勧めします。Iceberg テーブル関数は現在十分な機能を提供しており、Iceberg テーブルに対する部分的な読み取り専用インターフェースを提供します。

Iceberg テーブルエンジンは使用可能ですが、制限がある場合があります。ClickHouse は元々、外部で変更されるスキーマを持つテーブルをサポートするようには設計されていないため、Iceberg テーブルエンジンの機能に影響を与える可能性があります。その結果、通常のテーブルで機能する一部の機能は利用できない場合や、特に古いアナライザーを使用している場合には正しく動作しない場合があります。

最適な互換性のために、Iceberg テーブルエンジンのサポートを改善し続ける間、Iceberg テーブル関数の使用を推奨します。
:::

このエンジンは、Amazon S3、Azure、HDFS およびローカルに保存されたテーブル内の既存の Apache [Iceberg](https://iceberg.apache.org/) テーブルとの読み取り専用統合を提供します。

## テーブルの作成 {#create-table}

Iceberg テーブルは、ストレージ内に既に存在している必要があります。このコマンドは新しいテーブルを作成するための DDL パラメータを受け付けません。

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

引数の説明は、エンジン `S3`、`AzureBlobStorage`、`HDFS` および `File` の引数の説明と一致します。
`format` は Iceberg テーブル内のデータファイルの形式を表します。

エンジンパラメータは、[Named Collections](../../../operations/named-collections.md) を使用して指定できます。

**例**

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

名前付きコレクションを使用する場合:

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

テーブルエンジン `Iceberg` は現在、`IcebergS3` のエイリアスです。

**スキーマの進化**
現在、CH を使用して、時間の経過とともにスキーマが変更された Iceberg テーブルを読み取ることができます。現在、カラムが追加および削除され、その順序が変更されたテーブルの読み取りをサポートしています。また、必須の値を持つカラムを NULL が許可されるカラムに変更することもできます。さらに、次の単純な型の型変換もサポートしています:
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) ただし、P' > P であること。

現在のところ、ネストされた構造や配列およびマップ内の要素の型を変更することはできません。

テーブル作成時に動的スキーマ推論を用いてスキーマが変更されたテーブルを読み取るには、allow_dynamic_metadata_for_data_lakes を true に設定してください。

**パーティション プルーニング**

ClickHouse は Iceberg テーブルに対する SELECT クエリ中のパーティション プルーニングをサポートしており、関連性のないデータファイルをスキップすることでクエリのパフォーマンスを最適化します。現在、これはアイデンティティトランスフォームと時間ベースのトランスフォーム（時間、日、月、年）のみで機能します。パーティション プルーニングを有効にするには、`use_iceberg_partition_pruning = 1` を設定してください。

### データキャッシュ {#data-cache}

`Iceberg` テーブルエンジンとテーブル関数は、`S3`、`AzureBlobStorage`、`HDFS` ストレージと同様にデータキャッシングをサポートしています。詳細はこちらを参照してください [here](../../../engines/table-engines/integrations/s3.md#data-cache)。

## 関連項目 {#see-also}

- [iceberg テーブル関数](/sql-reference/table-functions/iceberg.md)
