---
slug: /sql-reference/table-functions/gcs
sidebar_position: 70
sidebar_label: gcs
keywords: [gcs, bucket]
---

# gcs テーブル関数

[Google Cloud Storage](https://cloud.google.com/storage/) からデータを `SELECT` したり `INSERT` したりするためのテーブルのようなインターフェースを提供します。[`Storage Object User` IAM ロール](https://cloud.google.com/storage/docs/access-control/iam-roles) が必要です。

これは[s3 テーブル関数](../../sql-reference/table-functions/s3.md)のエイリアスです。

クラスターに複数のレプリカがある場合は、代わりに [s3Cluster 関数](../../sql-reference/table-functions/s3Cluster.md)（GCS で機能します）を使用して挿入を並列化することができます。

**構文**

```sql
gcs(url [, NOSIGN | hmac_key, hmac_secret] [,format] [,structure] [,compression_method])
gcs(named_collection[, option=value [,..]])
```

:::tip GCS
GCS テーブル関数は GCS XML API と HMAC キーを使用して Google Cloud Storage と統合されています。エンドポイントと HMAC に関する詳細については、[Google の相互運用性に関する文書]( https://cloud.google.com/storage/docs/interoperability)を参照してください。

:::

**パラメータ**

- `url` — ファイルへのバケットパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` および `{N..M}`（ここで `N`, `M` は数字、`'abc'`, `'def'` は文字列です）。
  :::note GCS
  GCS パスはこの形式になっている必要があります。Google XML API のエンドポイントが JSON API と異なるためです：
```text
  https://storage.googleapis.com/<bucket>/<folder>/<filename(s)>
  ```
  ~~https://storage.cloud.google.com~~ ではありません。
  :::
- `NOSIGN` — このキーワードが資格情報の代わりに提供されると、すべてのリクエストは署名されません。
- `hmac_key` と `hmac_secret` — 指定されたエンドポイントで使用する資格情報を指定するキー。オプションです。
- `format` — ファイルの[フォーマット](../../interfaces/formats.md#formats)。
- `structure` — テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'` です。
- `compression_method` — パラメータはオプションです。支持される値: `none`, `gzip` または `gz`, `brotli` または `br`, `xz` または `LZMA`, `zstd` または `zst`。デフォルトでは、ファイル拡張子によって圧縮方法を自動検出します。

引数は[名前付きコレクション](/operations/named-collections.md)を使用しても渡すことができます。この場合、`url`、`format`、`structure`、`compression_method`は同じように機能し、追加のパラメータがサポートされています：

 - `access_key_id` — `hmac_key`、オプション。
 - `secret_access_key` — `hmac_secret`、オプション。
 - `filename` — 指定された場合、urlに追加されます。
 - `use_environment_credentials` — デフォルトで有効、環境変数 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`、`AWS_CONTAINER_CREDENTIALS_FULL_URI`、`AWS_CONTAINER_AUTHORIZATION_TOKEN`、`AWS_EC2_METADATA_DISABLED` を使用して追加のパラメータを渡すことを許可します。
 - `no_sign_request` — デフォルトで無効。
 - `expiration_window_seconds` — デフォルト値は 120 です。

**返される値**

指定されたファイル内のデータを読み取るまたは書き込むための指定された構造を持つテーブル。

**例**

GCSファイル `https://storage.googleapis.com/my-test-bucket-768/data.csv` から最初の2行を選択する：

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

同様ですが、`gzip` 圧縮方式のファイルから：

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

## 使用法 {#usage}

GCS上に次のURIを持ついくつかのファイルがあると仮定します：

-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_1.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_2.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_3.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_4.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_1.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_2.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_3.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_4.csv'

1から3までの数字で終わるファイルの行数をカウントする：

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/some_file_{1..3}.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

```text
┌─count()─┐
│      18 │
└─────────┘
```

これら2つのディレクトリ内のすべてのファイルの行数をカウントする：

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
ファイルのリストに先頭ゼロのある数字範囲が含まれている場合は、各桁のために中かっこを使用するか、`?` を使用してください。
:::

`file-000.csv`、`file-001.csv`、...、`file-999.csv` と名付けられたファイルの行数をカウントする：

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/big_prefix/file-{000..999}.csv', 'CSV', 'name String, value UInt32');
```

```text
┌─count()─┐
│      12 │
└─────────┘
```

ファイル `test-data.csv.gz` にデータを挿入する：

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
VALUES ('test-data', 1), ('test-data-2', 2);
```

既存のテーブルからファイル `test-data.csv.gz` にデータを挿入する：

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
SELECT name, value FROM existing_table;
```

**グロブ**は再帰的なディレクトリトラバーサルに使用できます。以下の例では、`my-test-bucket-768` ディレクトリからすべてのファイルを再帰的に取得します：

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**', 'CSV', 'name String, value UInt32', 'gzip');
```

以下は、`my-test-bucket` ディレクトリ内の任意のフォルダから再帰的にすべての `test-data.csv.gz` ファイルからデータを取得します：

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip');
```

本番の使用ケースでは、[名前付きコレクション](/operations/named-collections.md)を使用することを推奨します。以下はその例です：
```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = '***',
        secret_access_key = '***';
SELECT count(*)
FROM gcs(creds, url='https://s3-object-url.csv')
```

## パーティション分割書き込み {#partitioned-write}

`GCS` テーブルにデータを挿入するときに `PARTITION BY` 式を指定すると、各パーティション値に対して別々のファイルが作成されます。データを別々のファイルに分割することで、読み取り操作の効率を向上させることができます。

**例**

1. キーにパーティション ID を使用すると、別々のファイルが作成されます：

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket/file_{_partition_id}.csv', 'CSV', 'a String, b UInt32, c UInt32')
    PARTITION BY a VALUES ('x', 2, 3), ('x', 4, 5), ('y', 11, 12), ('y', 13, 14), ('z', 21, 22), ('z', 23, 24);
```
その結果、データは `file_x.csv`、`file_y.csv`、および `file_z.csv` の3つのファイルに書き込まれます。

2. バケット名にパーティション ID を使用すると、異なるバケットにファイルが作成されます：

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket_{_partition_id}/file.csv', 'CSV', 'a UInt32, b UInt32, c UInt32')
    PARTITION BY a VALUES (1, 2, 3), (1, 4, 5), (10, 11, 12), (10, 13, 14), (20, 21, 22), (20, 23, 24);
```
その結果、データは異なるバケットにある `my_bucket_1/file.csv`、`my_bucket_10/file.csv`、および `my_bucket_20/file.csv` の3つのファイルに書き込まれます。

**関連項目**

-   [S3 テーブル関数](s3.md)
-   [S3 エンジン](../../engines/table-engines/integrations/s3.md)
