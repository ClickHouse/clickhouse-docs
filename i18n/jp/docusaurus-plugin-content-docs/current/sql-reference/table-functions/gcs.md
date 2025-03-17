---
slug: '/sql-reference/table-functions/gcs'
sidebar_position: 70
sidebar_label: 'gcs'
keywords: [gcs, bucket]
title: 'gcs'
description: 'Google Cloud Storage からデータを `SELECT` および `INSERT` するためのテーブルのようなインターフェースを提供します。`Storage Object User` IAM ロールが必要です。'
---


# gcs テーブル関数

[Google Cloud Storage](https://cloud.google.com/storage/) からデータを `SELECT` および `INSERT` するためのテーブルのようなインターフェースを提供します。[`Storage Object User` IAM ロール](https://cloud.google.com/storage/docs/access-control/iam-roles)が必要です。

これは[s3 テーブル関数](../../sql-reference/table-functions/s3.md)のエイリアスです。

クラスターに複数のレプリカがある場合、挿入を並列化するために [s3Cluster 関数](../../sql-reference/table-functions/s3Cluster.md)（GCS と連携します）を代わりに使用できます。

**構文**

``` sql
gcs(url [, NOSIGN | hmac_key, hmac_secret] [,format] [,structure] [,compression_method])
gcs(named_collection[, option=value [,..]])
```

:::tip GCS
GCS テーブル関数は GCS XML API と HMAC キーを使用して Google Cloud Storage と統合されます。エンドポイントと HMAC の詳細については、[Google の相互運用性ドキュメント]( https://cloud.google.com/storage/docs/interoperability)を参照してください。

:::

**パラメーター**

- `url` — ファイルのバケットパス。読み取り専用モードで以下のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` および `{N..M}` （`N`, `M` — 数字、`'abc'`, `'def'` — 文字列）。
  :::note GCS
  GCS パスはこの形式であり、Google XML API のエンドポイントは JSON API とは異なります:
```text
  https://storage.googleapis.com/<bucket>/<folder>/<filename(s)>
  ```
  ~~https://storage.cloud.google.com~~ ではありません。
  :::
- `NOSIGN` — このキーワードを認証情報の代わりに提供すると、すべてのリクエストは署名されません。
- `hmac_key` および `hmac_secret` — 指定されたエンドポイントで使用する認証情報を指定するキー。オプション。
- `format` — ファイルの[フォーマット](/sql-reference/formats)。
- `structure` — テーブルの構造。形式 `'column1_name column1_type, column2_name column2_type, ...'`。
- `compression_method` — パラメーターはオプションです。サポートされている値: `none`, `gzip` または `gz`, `brotli` または `br`, `xz` または `LZMA`, `zstd` または `zst`。デフォルトでは、ファイル拡張子によって圧縮方法を自動検出します。

引数は[名付けられたコレクション](operations/named-collections.md)を使用して渡すこともできます。この場合、`url`, `format`, `structure`, `compression_method`は同じように機能し、いくつかの追加パラメーターがサポートされます:

 - `access_key_id` — `hmac_key`、オプション。
 - `secret_access_key` — `hmac_secret`、オプション。
 - `filename` — 指定された場合、url に追加されます。
 - `use_environment_credentials` — デフォルトで有効、環境変数 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED` を使用して追加のパラメーターを渡すことを許可します。
 - `no_sign_request` — デフォルトでは無効。
 - `expiration_window_seconds` — デフォルト値は 120。

**戻り値**

指定されたファイルでデータを読み書きするための指定された構造のテーブル。

**例**

GCS ファイル `https://storage.googleapis.com/my-test-bucket-768/data.csv` から最初の 2 行を選択:

``` sql
SELECT *
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/data.csv.gz', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2;
```

``` text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

圧縮方法が `gzip` のファイルからの同様のクエリ:

``` sql
SELECT *
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/data.csv.gz', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32', 'gzip')
LIMIT 2;
```

``` text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

## 使用法 {#usage}

以下の URI を持ついくつかの GCS ファイルがあるとしましょう:

-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_1.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_2.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_3.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_4.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_1.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_2.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_3.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_4.csv'

数字が 1 から 3 のファイルの行数をカウント:

``` sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/some_file_{1..3}.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

``` text
┌─count()─┐
│      18 │
└─────────┘
```

これら 2 つのディレクトリ内のすべてのファイルの総行数をカウント:

``` sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/*', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

``` text
┌─count()─┐
│      24 │
└─────────┘
```

:::warning
ファイルのリストに先頭ゼロを含む数字の範囲が含まれている場合は、各桁ごとに波括弧を使った構文を使用するか、`?` を使用してください。
:::

`file-000.csv`, `file-001.csv`, ... , `file-999.csv` という名前のファイルの総行数をカウント:

``` sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/big_prefix/file-{000..999}.csv', 'CSV', 'name String, value UInt32');
```

``` text
┌─count()─┐
│      12 │
└─────────┘
```

ファイル `test-data.csv.gz` にデータを挿入:

``` sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
VALUES ('test-data', 1), ('test-data-2', 2);
```

既存のテーブルからファイル `test-data.csv.gz` にデータを挿入:

``` sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
SELECT name, value FROM existing_table;
```

グロブ ** を使用して再帰的にディレクトリを横断できます。以下の例では、`my-test-bucket-768` ディレクトリからすべてのファイルを再帰的に取得します:

``` sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**', 'CSV', 'name String, value UInt32', 'gzip');
```

以下は、`my-test-bucket` ディレクトリ内の任意のフォルダから再帰的にすべての `test-data.csv.gz` ファイルからデータを取得します:

``` sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip');
```

本番使用の場合は、[名付けられたコレクション](operations/named-collections.md)を使用することをお勧めします。以下はその例です:
``` sql

CREATE NAMED COLLECTION creds AS
        access_key_id = '***',
        secret_access_key = '***';
SELECT count(*)
FROM gcs(creds, url='https://s3-object-url.csv')
```

## パーティション化された書き込み {#partitioned-write}

`GCS` テーブルにデータを挿入する際に `PARTITION BY` 式を指定すると、各パーティション値に対して別々のファイルが作成されます。データを別々のファイルに分割することで、読み取り操作の効率が向上します。

**例**

1. キー内のパーティション ID を使用すると、別々のファイルが作成されます:

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket/file_{_partition_id}.csv', 'CSV', 'a String, b UInt32, c UInt32')
    PARTITION BY a VALUES ('x', 2, 3), ('x', 4, 5), ('y', 11, 12), ('y', 13, 14), ('z', 21, 22), ('z', 23, 24);
```
その結果、データは 3 つのファイルに書き込まれます: `file_x.csv`, `file_y.csv`, および `file_z.csv`。

2. バケット名内のパーティション ID を使用すると、異なるバケットにファイルが作成されます:

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket_{_partition_id}/file.csv', 'CSV', 'a UInt32, b UInt32, c UInt32')
    PARTITION BY a VALUES (1, 2, 3), (1, 4, 5), (10, 11, 12), (10, 13, 14), (20, 21, 22), (20, 23, 24);
```
その結果、データは異なるバケット内の 3 つのファイルに書き込まれます: `my_bucket_1/file.csv`, `my_bucket_10/file.csv`, および `my_bucket_20/file.csv`。

**関連情報**

-   [S3 テーブル関数](s3.md)
-   [S3 エンジン](../../engines/table-engines/integrations/s3.md)
