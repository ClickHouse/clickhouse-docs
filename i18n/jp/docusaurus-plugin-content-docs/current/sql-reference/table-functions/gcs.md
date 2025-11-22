---
description: 'Google Cloud Storage 上のデータを `SELECT` および `INSERT` で操作するための、テーブルに似たインターフェイスを提供します。利用には `Storage Object User` IAM ロールが必要です。'
keywords: ['gcs', 'bucket']
sidebar_label: 'gcs'
sidebar_position: 70
slug: /sql-reference/table-functions/gcs
title: 'gcs'
doc_type: 'reference'
---



# gcs テーブル関数

[Google Cloud Storage](https://cloud.google.com/storage/) から `SELECT` および `INSERT` でデータを操作するためのテーブルのようなインターフェイスを提供します。[`Storage Object User` IAM ロール](https://cloud.google.com/storage/docs/access-control/iam-roles)が必要です。

これは [s3 テーブル関数](../../sql-reference/table-functions/s3.md) のエイリアスです。

クラスタ内にレプリカが複数存在する場合は、[s3Cluster 関数](../../sql-reference/table-functions/s3Cluster.md)（GCS でも動作します）を使用して INSERT を並列化できます。



## 構文 {#syntax}

```sql
gcs(url [, NOSIGN | hmac_key, hmac_secret] [,format] [,structure] [,compression_method])
gcs(named_collection[, option=value [,..]])
```

:::tip GCS
GCSテーブル関数は、GCS XML APIとHMACキーを使用してGoogle Cloud Storageと統合されます。
エンドポイントとHMACの詳細については、[Googleの相互運用性に関するドキュメント](https://cloud.google.com/storage/docs/interoperability)を参照してください。
:::


## 引数 {#arguments}

| 引数                     | 説明                                                                                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                        | ファイルへのバケットパス。読み取り専用モードでは次のワイルドカードに対応：`*`、`**`、`?`、`{abc,def}`、および `{N..M}`（`N`、`M` は数値、`'abc'`、`'def'` は文字列）。                       |
| `NOSIGN`                     | このキーワードが認証情報の代わりに指定された場合、すべてのリクエストは署名されません。                                                                                                |
| `hmac_key` および `hmac_secret` | 指定されたエンドポイントで使用する認証情報を指定するキー。省略可能。                                                                                                                      |
| `format`                     | ファイルの[フォーマット](/sql-reference/formats)。                                                                                                                                        |
| `structure`                  | テーブルの構造。形式：`'column1_name column1_type, column2_name column2_type, ...'`。                                                                                            |
| `compression_method`         | 省略可能なパラメータ。対応する値：`none`、`gzip` または `gz`、`brotli` または `br`、`xz` または `LZMA`、`zstd` または `zst`。デフォルトでは、ファイル拡張子から圧縮方式を自動検出します。 |

:::note GCS
Google XML APIのエンドポイントはJSON APIと異なるため、GCSパスは次の形式になります：

```text
  https://storage.googleapis.com/<bucket>/<folder>/<filename(s)>
```

~~https://storage.cloud.google.com~~ではありません。
:::

引数は[名前付きコレクション](operations/named-collections.md)を使用して渡すこともできます。この場合、`url`、`format`、`structure`、`compression_method`は同じように動作し、いくつかの追加パラメータに対応します：

| パラメータ                     | 説明                                                                                                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `access_key_id`               | `hmac_key`、省略可能。                                                                                                                                                                                                             |
| `secret_access_key`           | `hmac_secret`、省略可能。                                                                                                                                                                                                          |
| `filename`                    | 指定された場合、URLに追加されます。                                                                                                                                                                                                 |
| `use_environment_credentials` | デフォルトで有効。環境変数 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`、`AWS_CONTAINER_CREDENTIALS_FULL_URI`、`AWS_CONTAINER_AUTHORIZATION_TOKEN`、`AWS_EC2_METADATA_DISABLED` を使用して追加パラメータを渡すことができます。 |
| `no_sign_request`             | デフォルトで無効。                                                                                                                                                                                                              |
| `expiration_window_seconds`   | デフォルト値は120。                                                                                                                                                                                                             |


## 戻り値 {#returned_value}

指定されたファイル内のデータの読み取りまたは書き込みを行うための、指定された構造を持つテーブル。


## 例 {#examples}

GCSファイル `https://storage.googleapis.com/my-test-bucket-768/data.csv` のテーブルから最初の2行を選択する:

```sql
SELECT *
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/data.csv.gz', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2;
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

同様の例で、`gzip`圧縮されたファイルから取得する場合:

```sql
SELECT *
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/data.csv.gz', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32', 'gzip')
LIMIT 2;
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```


## 使用方法 {#usage}

GCS上に以下のURIを持つ複数のファイルがあるとします:

- 'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_1.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_2.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_3.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_4.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_1.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_2.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_3.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_4.csv'

1から3の数字で終わるファイルの行数をカウントします:

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/some_file_{1..3}.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

```text
┌─count()─┐
│      18 │
└─────────┘
```

これら2つのディレクトリ内のすべてのファイルの総行数をカウントします:

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/*', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

```text
┌─count()─┐
│      24 │
└─────────┘
```

:::warning
ファイルのリストに先頭ゼロ付きの数値範囲が含まれる場合は、各桁ごとに波括弧を使用した構文を使用するか、`?`を使用してください。
:::

`file-000.csv`、`file-001.csv`、...、`file-999.csv`という名前のファイルの総行数をカウントします:

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/big_prefix/file-{000..999}.csv', 'CSV', 'name String, value UInt32');
```

```text
┌─count()─┐
│      12 │
└─────────┘
```

ファイル`test-data.csv.gz`にデータを挿入します:

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
VALUES ('test-data', 1), ('test-data-2', 2);
```

既存のテーブルからファイル`test-data.csv.gz`にデータを挿入します:

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
SELECT name, value FROM existing_table;
```

Glob \*\*は再帰的なディレクトリ走査に使用できます。以下の例では、`my-test-bucket-768`ディレクトリから再帰的にすべてのファイルを取得します:

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**', 'CSV', 'name String, value UInt32', 'gzip');
```

以下は、`my-test-bucket-768`ディレクトリ内の任意のフォルダから再帰的にすべての`test-data.csv.gz`ファイルのデータを取得します:

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip');
```

本番環境のユースケースでは、[名前付きコレクション](operations/named-collections.md)の使用を推奨します。以下は例です:

```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = '***',
        secret_access_key = '***';
SELECT count(*)
FROM gcs(creds, url='https://s3-object-url.csv')
```


## パーティション分割書き込み {#partitioned-write}

`GCS`テーブルへのデータ挿入時に`PARTITION BY`式を指定すると、パーティション値ごとに個別のファイルが作成されます。データを個別のファイルに分割することで、読み取り操作の効率が向上します。

**例**

1. キーにパーティションIDを使用すると、個別のファイルが作成されます:

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket/file_{_partition_id}.csv', 'CSV', 'a String, b UInt32, c UInt32')
    PARTITION BY a VALUES ('x', 2, 3), ('x', 4, 5), ('y', 11, 12), ('y', 13, 14), ('z', 21, 22), ('z', 23, 24);
```

結果として、データは3つのファイルに書き込まれます:`file_x.csv`、`file_y.csv`、`file_z.csv`

2. バケット名にパーティションIDを使用すると、異なるバケットにファイルが作成されます:

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket_{_partition_id}/file.csv', 'CSV', 'a UInt32, b UInt32, c UInt32')
    PARTITION BY a VALUES (1, 2, 3), (1, 4, 5), (10, 11, 12), (10, 13, 14), (20, 21, 22), (20, 23, 24);
```

結果として、データは異なるバケット内の3つのファイルに書き込まれます:`my_bucket_1/file.csv`、`my_bucket_10/file.csv`、`my_bucket_20/file.csv`


## 関連項目 {#related}

- [S3テーブル関数](s3.md)
- [S3エンジン](../../engines/table-engines/integrations/s3.md)
