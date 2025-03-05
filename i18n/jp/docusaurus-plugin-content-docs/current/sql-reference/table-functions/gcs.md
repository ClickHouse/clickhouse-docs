---
slug: /sql-reference/table-functions/gcs
sidebar_position: 70
sidebar_label: gcs
keywords: [gcs, bucket]
title: "gcs"
description: "Google Cloud Storageからデータを`SELECT`および`INSERT`するためのテーブルのようなインターフェイスを提供します。`Storage Object User` IAMロールが必要です。"
---


# gcs テーブル関数

Google Cloud Storageからデータを`SELECT`および`INSERT`するためのテーブルのようなインターフェイスを提供します。[Google Cloud Storage](https://cloud.google.com/storage/)からデータを操作します。 [`Storage Object User` IAMロール](https://cloud.google.com/storage/docs/access-control/iam-roles)が必要です。

これは、[s3テーブル関数](../../sql-reference/table-functions/s3.md)の別名です。

クラスター内に複数のレプリカがある場合は、挿入を並列化するためにGCSと連携する[s3Cluster関数](../../sql-reference/table-functions/s3Cluster.md)を代わりに使用できます。

**構文**

``` sql
gcs(url [, NOSIGN | hmac_key, hmac_secret] [,format] [,structure] [,compression_method])
gcs(named_collection[, option=value [,..]])
```

:::tip GCS
GCSテーブル関数は、GCS XML APIとHMACキーを使用してGoogle Cloud Storageと統合されています。エンドポイントとHMACの詳細については、[Google相互運用性ドキュメント](https://cloud.google.com/storage/docs/interoperability)を参照してください。

:::

**パラメーター**

- `url` — ファイルへのバケットパス。読み取り専用モードで以下のワイルドカードをサポートします： `*`, `**`, `?`, `{abc,def}`および`{N..M}`（ここで、`N`と`M`は数値、`'abc'`と`'def'`は文字列）。
  :::note GCS
  GCSパスはこの形式で、Google XML APIのエンドポイントがJSON APIとは異なるためです：
```text
  https://storage.googleapis.com/<bucket>/<folder>/<filename(s)>
  ```
  であり、~~https://storage.cloud.google.com~~ ではありません。
  :::
- `NOSIGN` — このキーワードを資格情報の代わりに指定すると、すべてのリクエストが署名されません。
- `hmac_key`と`hmac_secret` — 指定されたエンドポイントで使用する資格情報を指定するキー。オプション。
- `format` — ファイルの[フォーマット](../../interfaces/formats.md#formats)。
- `structure` — テーブルの構造。形式は`'column1_name column1_type, column2_name column2_type, ...'`。
- `compression_method` — このパラメーターはオプションです。サポートされている値：`none`, `gzip`または`gz`, `brotli`または`br`, `xz`または`LZMA`, `zstd`または`zst`。デフォルトでは、ファイル拡張子によって圧縮方法を自動検出します。

引数は[named collections](operations/named-collections.md)を使用して渡すこともできます。この場合、`url`、`format`、`structure`、`compression_method`は同様に動作し、以下の追加のパラメータがサポートされています：

 - `access_key_id` — `hmac_key`、オプション。
 - `secret_access_key` — `hmac_secret`、オプション。
 - `filename` — 指定した場合、urlに追加されます。
 - `use_environment_credentials` — デフォルトで有効、環境変数`AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`、`AWS_CONTAINER_CREDENTIALS_FULL_URI`、`AWS_CONTAINER_AUTHORIZATION_TOKEN`、`AWS_EC2_METADATA_DISABLED`を使用して追加のパラメータを渡すことを許可します。
 - `no_sign_request` — デフォルトでは無効。
 - `expiration_window_seconds` — デフォルト値は120です。

**返される値**

指定されたファイル内のデータを読み書きするための指定された構造のテーブル。

**例**

GCSファイル`https://storage.googleapis.com/my-test-bucket-768/data.csv`から最初の2行を選択します：

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

`gzip`圧縮方式のファイルからの同様のクエリ：

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

以下のURIのファイルが複数あると仮定します：

-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_1.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_2.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_3.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_4.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_1.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_2.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_3.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_4.csv'

1から3までの数字で終わるファイルの行数をカウントします：

``` sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/some_file_{1..3}.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

``` text
┌─count()─┐
│      18 │
└─────────┘
```

これら2つのディレクトリ内のすべてのファイルの行数をカウントします：

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
ファイルのリストに先頭ゼロを持つ数の範囲が含まれている場合は、各桁を個別に波括弧で囲むか、`?`を使用してください。
:::

`file-000.csv`、`file-001.csv`、...、`file-999.csv`という名前のファイル内の行数をカウントします：

``` sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/big_prefix/file-{000..999}.csv', 'CSV', 'name String, value UInt32');
```

``` text
┌─count()─┐
│      12 │
└─────────┘
```

ファイル`test-data.csv.gz`にデータを挿入します：

``` sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
VALUES ('test-data', 1), ('test-data-2', 2);
```

既存のテーブルからファイル`test-data.csv.gz`にデータを挿入します：

``` sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
SELECT name, value FROM existing_table;
```

グロブ ** は再帰的なディレクトリトラバーサルに使用できます。以下の例では、`my-test-bucket-768`ディレクトリからすべてのファイルを再帰的に取得します：

``` sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**', 'CSV', 'name String, value UInt32', 'gzip');
```

以下は、`my-test-bucket`ディレクトリ内の任意のフォルダからすべての`test-data.csv.gz`ファイルのデータを取得します：

``` sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip');
```

本番環境での使用には、[named collections](operations/named-collections.md)を使用することをお勧めします。以下はその例です：
``` sql

CREATE NAMED COLLECTION creds AS
        access_key_id = '***',
        secret_access_key = '***';
SELECT count(*)
FROM gcs(creds, url='https://s3-object-url.csv')
```

## パーティション別書き込み {#partitioned-write}

`GCS`テーブルにデータを挿入する際に`PARTITION BY`式を指定すると、各パーティション値ごとに別々のファイルが作成されます。データを別々のファイルに分割することで、読み込み操作の効率が向上します。

**例**

1. キーにパーティションIDを使用すると、別々のファイルが作成されます：

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket/file_{_partition_id}.csv', 'CSV', 'a String, b UInt32, c UInt32')
    PARTITION BY a VALUES ('x', 2, 3), ('x', 4, 5), ('y', 11, 12), ('y', 13, 14), ('z', 21, 22), ('z', 23, 24);
```
その結果、データは3つのファイルに書き込まれます：`file_x.csv`、`file_y.csv`、および`file_z.csv`。

2. バケット名にパーティションIDを使用すると、異なるバケットにファイルが作成されます：

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket_{_partition_id}/file.csv', 'CSV', 'a UInt32, b UInt32, c UInt32')
    PARTITION BY a VALUES (1, 2, 3), (1, 4, 5), (10, 11, 12), (10, 13, 14), (20, 21, 22), (20, 23, 24);
```
その結果、データは異なる3つのバケットに書き込まれます：`my_bucket_1/file.csv`、`my_bucket_10/file.csv`、および`my_bucket_20/file.csv`。

**参照**

-   [S3テーブル関数](s3.md)
-   [S3エンジン](../../engines/table-engines/integrations/s3.md)
