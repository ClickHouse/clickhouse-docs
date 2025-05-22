---
'description': 'Google Cloud Storage からデータを `SELECT` および `INSERT` するためのテーブルのようなインターフェースを提供します。
  `Storage Object User` IAM ロールが必要です。'
'keywords':
- 'gcs'
- 'bucket'
'sidebar_label': 'gcs'
'sidebar_position': 70
'slug': '/sql-reference/table-functions/gcs'
'title': 'gcs'
---





# gcs テーブル関数

`SELECT` と `INSERT` データを [Google Cloud Storage](https://cloud.google.com/storage/) から操作するためのテーブルのようなインターフェースを提供します。 [`Storage Object User` IAMロール](https://cloud.google.com/storage/docs/access-control/iam-roles) が必要です。

これは [s3 テーブル関数](../../sql-reference/table-functions/s3.md) のエイリアスです。

クラスタに複数のレプリカがある場合、挿入を並列化するために [s3Cluster 関数](../../sql-reference/table-functions/s3Cluster.md) (GCS で動作します) を代わりに使用できます。

## 構文 {#syntax}

```sql
gcs(url [, NOSIGN | hmac_key, hmac_secret] [, format] [, structure] [, compression_method])
gcs(named_collection[, option=value [,..]])
```

:::tip GCS
GCS テーブル関数は、GCS XML API と HMAC キーを使用して Google Cloud Storage と統合します。エンドポイントと HMAC に関する詳細については、[Google の相互運用性ドキュメント]( https://cloud.google.com/storage/docs/interoperability) を参照してください。
:::

## 引数 {#arguments}

| 引数                           | 説明                                                                                                                                                                              |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                          | ファイルへのバケットパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` 及び `{N..M}` （ここで、`N` と `M` は数、`'abc'` と `'def'` は文字列）。                           |
| `NOSIGN`                       | このキーワードが認証情報の代わりに提供されると、すべてのリクエストは署名されません。                                                                                                     |
| `hmac_key` と `hmac_secret`   | 指定されたエンドポイントで使用するための認証情報を示すキー。オプションです。                                                                                                           |
| `format`                       | ファイルの [format](/sql-reference/formats)。                                                                                                                                       |
| `structure`                    | テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                        |
| `compression_method`           | パラメータはオプションです。サポートされている値: `none`, `gzip` または `gz`, `brotli` または `br`, `xz` または `LZMA`, `zstd` または `zst`。デフォルトでは、ファイル拡張子で圧縮方法を自動検出します。               |

:::note GCS
GCS パスはこの形式です。なぜなら Google XML API のエンドポイントは JSON API とは異なるからです：

```text
  https://storage.googleapis.com/<bucket>/<folder>/<filename(s)>
```

そして ~~https://storage.cloud.google.com~~ ではありません。
:::

引数は [named collections](operations/named-collections.md) を使用しても渡すことができます。この場合、`url`, `format`, `structure`, `compression_method` は同じように機能し、追加のパラメータがサポートされます：

| パラメータ                     | 説明                                                                                                                                                                                                                       |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `access_key_id`               | `hmac_key`、オプションです。                                                                                                                                                                                             |
| `secret_access_key`           | `hmac_secret`、オプションです。                                                                                                                                                                                          |
| `filename`                    | 指定されている場合、URL に追加されます。                                                                                                                                                                                  |
| `use_environment_credentials` | デフォルトで有効、環境変数 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED` を使用して追加のパラメータを渡せます。           |
| `no_sign_request`             | デフォルトで無効です。                                                                                                                                                                                                    |
| `expiration_window_seconds`   | デフォルト値は 120 秒です。                                                                                                                                                                                              |

## 戻り値 {#returned_value}

指定されたファイルでのデータ読み取りまたは書き込みのための指定された構造のテーブル。

## 例 {#examples}

GCSファイル `https://storage.googleapis.com/my-test-bucket-768/data.csv` から最初の2行を選択：

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

同様ですが、`gzip` 圧縮メソッドのファイルから：

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

GCS上に次のURIのいくつかのファイルがあると仮定します：

-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_1.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_2.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_3.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_4.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_1.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_2.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_3.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_4.csv'

1から3の数字で終わるファイルの行数をカウント：

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/some_file_{1..3}.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

```text
┌─count()─┐
│      18 │
└─────────┘
```

これらの二つのディレクトリ内のすべてのファイルの総行数をカウント：

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
ファイルのリストに先頭ゼロのある数値範囲が含まれている場合は、各桁ごとにブレースを使用するか、`?` を使用してください。
:::

`file-000.csv`, `file-001.csv`, ... , `file-999.csv` というファイルの総行数をカウント：

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/big_prefix/file-{000..999}.csv', 'CSV', 'name String, value UInt32');
```

```text
┌─count()─┐
│      12 │
└─────────┘
```

ファイル `test-data.csv.gz` にデータを挿入：

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
VALUES ('test-data', 1), ('test-data-2', 2);
```

既存のテーブルからファイル `test-data.csv.gz` にデータを挿入：

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
SELECT name, value FROM existing_table;
```

** は再帰的なディレクトリトラバーサルに使用できます。次の例を考えてみてください。`my-test-bucket-768` ディレクトリからすべてのファイルを再帰的に取得します：

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**', 'CSV', 'name String, value UInt32', 'gzip');
```

以下は、`my-test-bucket` ディレクトリ内の任意のフォルダーから再帰的にすべての `test-data.csv.gz` ファイルからデータを取得します：

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip');
```

プロダクションユースケースでは [named collections](operations/named-collections.md) を使用することをお勧めします。以下はその例です：
```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = '***',
        secret_access_key = '***';
SELECT count(*)
FROM gcs(creds, url='https://s3-object-url.csv')
```

## パーティショニング書き込み {#partitioned-write}

データを `GCS` テーブルに挿入するときに `PARTITION BY` 式を指定すると、各パーティション価値ごとに個別のファイルが作成されます。データを別々のファイルに分割することで、読み取り操作の効率が改善されます。

**例**

1. キーにパーティションIDを使用すると、別々のファイルが作成されます：

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket/file_{_partition_id}.csv', 'CSV', 'a String, b UInt32, c UInt32')
    PARTITION BY a VALUES ('x', 2, 3), ('x', 4, 5), ('y', 11, 12), ('y', 13, 14), ('z', 21, 22), ('z', 23, 24);
```
その結果、データは三つのファイルに書き込まれます: `file_x.csv`, `file_y.csv`, および `file_z.csv`。

2. バケット名にパーティションIDを使用すると、異なるバケットにファイルが作成されます：

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket_{_partition_id}/file.csv', 'CSV', 'a UInt32, b UInt32, c UInt32')
    PARTITION BY a VALUES (1, 2, 3), (1, 4, 5), (10, 11, 12), (10, 13, 14), (20, 21, 22), (20, 23, 24);
```
その結果、データは異なるバケットに三つのファイルに書き込まれます: `my_bucket_1/file.csv`, `my_bucket_10/file.csv`, および `my_bucket_20/file.csv`。

## 関連 {#related}
- [S3 テーブル関数](s3.md)
- [S3 エンジン](../../engines/table-engines/integrations/s3.md)

