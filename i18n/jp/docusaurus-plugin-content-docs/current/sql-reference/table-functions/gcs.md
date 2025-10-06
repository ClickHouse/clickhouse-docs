---
'description': 'Google Cloud Storageからデータを`SELECT`および`INSERT`するためのテーブルのようなインターフェースを提供します。`Storage
  Object User` IAMロールが必要です。'
'keywords':
- 'gcs'
- 'bucket'
'sidebar_label': 'gcs'
'sidebar_position': 70
'slug': '/sql-reference/table-functions/gcs'
'title': 'gcs'
'doc_type': 'reference'
---


# gcs テーブル関数

`SELECT` および [Google Cloud Storage](https://cloud.google.com/storage/) からデータを `INSERT` するためのテーブルのようなインターフェースを提供します。 [`Storage Object User` IAM ロール](https://cloud.google.com/storage/docs/access-control/iam-roles) が必要です。

これは [s3 テーブル関数](../../sql-reference/table-functions/s3.md) のエイリアスです。

クラスター内に複数のレプリカがある場合、挿入を並列化するために GCS で動作する [s3Cluster 関数](../../sql-reference/table-functions/s3Cluster.md) を使用できます。

## 構文 {#syntax}

```sql
gcs(url [, NOSIGN | hmac_key, hmac_secret] [,format] [,structure] [,compression_method])
gcs(named_collection[, option=value [,..]])
```

:::tip GCS
GCS テーブル関数は GCS XML API と HMAC キーを使用して Google Cloud Storage と統合されます。 
エンドポイントと HMAC についての詳細は [Google 相互運用性ドキュメント]( https://cloud.google.com/storage/docs/interoperability) を参照してください。
:::

## 引数 {#arguments}

| 引数                        | 説明                                                                                                                                                          |
|-----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                       | ファイルへのバケットパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` および `{N..M}` ただし、`N`, `M` は数値、`'abc'`, `'def'` は文字列です。                   |
| `NOSIGN`                    | このキーワードを認証情報の代わりに指定した場合、すべてのリクエストは署名されません。                                                                                      |
| `hmac_key` と `hmac_secret` | 指定されたエンドポイントで使用するための認証情報を指定するキー。オプショナルです。                                                                                   |
| `format`                    | ファイルの [形式](/sql-reference/formats)。                                                                                                                                 |
| `structure`                 | テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'` です。                                                                    |
| `compression_method`        | パラメータはオプショナルです。サポートされている値: `none`, `gzip` または `gz`, `brotli` または `br`, `xz` または `LZMA`, `zstd` または `zst`。デフォルトでは、ファイル拡張子によって圧縮方式を自動検出します。 |

:::note GCS
GCS パスは、Google XML API のエンドポイントが JSON API とは異なるため、次の形式になります:

```text
https://storage.googleapis.com/<bucket>/<folder>/<filename(s)>
```

および ~~https://storage.cloud.google.com~~ ではありません。
:::

引数は [名前付きコレクション](operations/named-collections.md) を使用して渡すこともできます。この場合、`url`、`format`、`structure`、`compression_method` は同じように機能し、いくつかの追加パラメータがサポートされます：

| パラメータ                     | 説明                                                                                                                                                                            |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `access_key_id`               | `hmac_key`、オプショナルです。                                                                                                                                                 |
| `secret_access_key`           | `hmac_secret`、オプショナルです。                                                                                                                                              |
| `filename`                    | 指定された場合、url に追加されます。                                                                                                                                             |
| `use_environment_credentials` | デフォルトで有効、環境変数 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`、`AWS_CONTAINER_CREDENTIALS_FULL_URI`、`AWS_CONTAINER_AUTHORIZATION_TOKEN`、`AWS_EC2_METADATA_DISABLED`を使用して追加のパラメータを渡すことを可能にします。 |
| `no_sign_request`             | デフォルトで無効です。                                                                                                                                                        |
| `expiration_window_seconds`   | デフォルト値は 120 です。                                                                                                                                                     |

## 戻り値 {#returned_value}

指定されたファイルにデータを読み書きするための指定された構造のテーブル。

## 例 {#examples}

GCS ファイル `https://storage.googleapis.com/my-test-bucket-768/data.csv` からの最初の 2 行を選択します:

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

同様のもので、`gzip` 圧縮方法を使用したファイルからのもの：

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

次の URIs を持つ複数のファイルが GCS にあるとします：

- 'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_1.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_2.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_3.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_4.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_1.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_2.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_3.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_4.csv'

数字が 1 から 3 のファイルの行数をカウントします：

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/some_file_{1..3}.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

```text
┌─count()─┐
│      18 │
└─────────┘
```

これらの 2 つのディレクトリ内のすべてのファイルの合計行数をカウントします：

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
ファイルのリストに先頭ゼロを含む数字の範囲がある場合、各桁を別々に波括弧で囲むか、`?` を使用してください。
:::

`file-000.csv`、`file-001.csv`、...、`file-999.csv` という名前のファイルの合計行数をカウントします：

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/big_prefix/file-{000..999}.csv', 'CSV', 'name String, value UInt32');
```

```text
┌─count()─┐
│      12 │
└─────────┘
```

ファイル `test-data.csv.gz` にデータを挿入します：

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
VALUES ('test-data', 1), ('test-data-2', 2);
```

既存のテーブルからファイル `test-data.csv.gz` にデータを挿入します：

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
SELECT name, value FROM existing_table;
```

グロブ ** は再帰的なディレクトリのトラバースに使用できます。以下の例を考えると、`my-test-bucket-768` ディレクトリからすべてのファイルを再帰的に取得します：

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**', 'CSV', 'name String, value UInt32', 'gzip');
```

以下は、`my-test-bucket` ディレクトリ内の任意のフォルダーからすべての `test-data.csv.gz` ファイルを再帰的に取得します：

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip');
```

生産用途においては、[名前付きコレクション](operations/named-collections.md) の使用を推奨します。以下はその例です：
```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = '***',
        secret_access_key = '***';
SELECT count(*)
FROM gcs(creds, url='https://s3-object-url.csv')
```

## パーティション書き込み {#partitioned-write}

`GCS` テーブルにデータを挿入する際に `PARTITION BY` 式を指定すると、各パーティション値に対して個別のファイルが作成されます。データを個別のファイルに分割することで、読み取り操作の効率が向上します。

**例**

1. キーにパーティション ID を使用すると、個別のファイルが作成されます：

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket/file_{_partition_id}.csv', 'CSV', 'a String, b UInt32, c UInt32')
    PARTITION BY a VALUES ('x', 2, 3), ('x', 4, 5), ('y', 11, 12), ('y', 13, 14), ('z', 21, 22), ('z', 23, 24);
```
その結果、データは `file_x.csv`、`file_y.csv`、`file_z.csv` の 3 つのファイルに書き込まれます。

2. バケット名にパーティション ID を使用すると、異なるバケットにファイルが作成されます：

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket_{_partition_id}/file.csv', 'CSV', 'a UInt32, b UInt32, c UInt32')
    PARTITION BY a VALUES (1, 2, 3), (1, 4, 5), (10, 11, 12), (10, 13, 14), (20, 21, 22), (20, 23, 24);
```
その結果、データは異なるバケットの 3 つのファイルに書き込まれます: `my_bucket_1/file.csv`、`my_bucket_10/file.csv`、`my_bucket_20/file.csv`。

## 関連 {#related}
- [S3 テーブル関数](s3.md)
- [S3 エンジン](../../engines/table-engines/integrations/s3.md)
