---
description: 'Google Cloud Storage からデータを `SELECT` および `INSERT` するためのテーブルに似たインターフェイスを提供します。`Storage Object User` IAM ロールが必要です。'
keywords: ['gcs', 'bucket']
sidebar_label: 'gcs'
sidebar_position: 70
slug: /sql-reference/table-functions/gcs
title: 'gcs'
doc_type: 'reference'
---



# gcs テーブル関数

[Google Cloud Storage](https://cloud.google.com/storage/) からデータを `SELECT` および `INSERT` するためのテーブル形式のインターフェイスを提供します。[`Storage Object User` IAM ロール](https://cloud.google.com/storage/docs/access-control/iam-roles)の付与が必要です。

これは [s3 テーブル関数](../../sql-reference/table-functions/s3.md) のエイリアスです。

クラスター内に複数のレプリカがある場合は、代わりに [s3Cluster 関数](../../sql-reference/table-functions/s3Cluster.md)（GCS でも動作します）を使用して、INSERT の実行を並列化できます。



## 構文

```sql
gcs(url [, NOSIGN | hmac_key, hmac_secret] [,format] [,structure] [,compression_method])
gcs(named_collection[, option=value [,..]])
```

:::tip GCS
GCS Table Function は、GCS XML API と HMAC キーを使用して Google Cloud Storage と連携します。
エンドポイントと HMAC の詳細については、[Google interoperability docs](https://cloud.google.com/storage/docs/interoperability) を参照してください。
:::


## 引数

| Argument                     | Description                                                                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `url`                        | ファイルへのバケットパス。読み取り専用モードでは、次のワイルドカードをサポートします: `*`、`**`、`?`、`{abc,def}`、および `{N..M}`。ここで `N`、`M` は数値、`'abc'`、`'def'` は文字列です。           |
| `NOSIGN`                     | 資格情報の代わりにこのキーワードが指定された場合、すべてのリクエストは署名されません。                                                                                         |
| `hmac_key` and `hmac_secret` | 指定されたエンドポイントで使用する資格情報を指定するためのキー。省略可能です。                                                                                             |
| `format`                     | ファイルの[フォーマット](/sql-reference/formats)。                                                                                              |
| `structure`                  | テーブルの構造。形式: `'column1_name column1_type, column2_name column2_type, ...'`。                                                          |
| `compression_method`         | このパラメータは省略可能です。サポートされる値: `none`、`gzip` または `gz`、`brotli` または `br`、`xz` または `LZMA`、`zstd` または `zst`。デフォルトでは、ファイル拡張子により圧縮方式が自動検出されます。 |

:::note GCS
GCS パスは次の形式です。これは、Google XML API のエンドポイントが JSON API と異なるためです。

```text
  https://storage.googleapis.com/<bucket>/<folder>/<filename(s)>
```

and not ~~[https://storage.cloud.google.com](https://storage.cloud.google.com)~~.
:::

引数は [named collections](operations/named-collections.md) を使って渡すこともできます。この場合、`url`、`format`、`structure`、`compression_method` は同様に動作し、さらにいくつかの追加パラメータがサポートされます。

| Parameter                     | Description                                                                                                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `access_key_id`               | `hmac_key`。省略可能。                                                                                                                                                                    |
| `secret_access_key`           | `hmac_secret`。省略可能。                                                                                                                                                                 |
| `filename`                    | 指定された場合、URL の末尾に付加されます。                                                                                                                                                             |
| `use_environment_credentials` | デフォルトで有効。環境変数 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`、`AWS_CONTAINER_CREDENTIALS_FULL_URI`、`AWS_CONTAINER_AUTHORIZATION_TOKEN`、`AWS_EC2_METADATA_DISABLED` を使用して追加パラメータを渡すことができます。 |
| `no_sign_request`             | デフォルトでは無効。                                                                                                                                                                          |
| `expiration_window_seconds`   | デフォルト値は 120。                                                                                                                                                                        |


## 返される値 {#returned_value}

指定されたファイル内のデータを読み書きするための、指定された構造を持つテーブルです。



## 例

GCS ファイル `https://storage.googleapis.com/my-test-bucket-768/data.csv` にあるテーブルから先頭 2 行を選択します：

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

同様ですが、`gzip` 圧縮形式のファイルから読み込む場合は次のとおりです：

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


## 使用方法

GCS 上に、次の URI のファイルが複数存在するとします:

* &#39;[https://storage.googleapis.com/my-test-bucket-768/some&#95;prefix/some&#95;file&#95;1.csv](https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_1.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/some&#95;prefix/some&#95;file&#95;2.csv](https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_2.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/some&#95;prefix/some&#95;file&#95;3.csv](https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_3.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/some&#95;prefix/some&#95;file&#95;4.csv](https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_4.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/another&#95;prefix/some&#95;file&#95;1.csv](https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_1.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/another&#95;prefix/some&#95;file&#95;2.csv](https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_2.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/another&#95;prefix/some&#95;file&#95;3.csv](https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_3.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/another&#95;prefix/some&#95;file&#95;4.csv](https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_4.csv)&#39;

末尾が 1 から 3 の数字で終わるファイルの行数をカウントします:

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/some_file_{1..3}.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

```text
┌─count()─┐
│      18 │
└─────────┘
```

これら 2 つのディレクトリ内にあるすべてのファイルの行の総数をカウントします。

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
ファイル一覧に先頭にゼロが付いた番号範囲が含まれている場合は、各桁を別々に波かっこで指定する構文を使うか、`?` を使用してください。
:::

`file-000.csv`、`file-001.csv`、...、`file-999.csv` という名前のファイルに含まれる行数の合計を数えます。

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/big_prefix/file-{000..999}.csv', 'CSV', 'name String, value UInt32');
```

```text
┌─count()─┐
│      12 │
└─────────┘
```

ファイル `test-data.csv.gz` にデータを書き込みます:

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
VALUES ('test-data', 1), ('test-data-2', 2);
```

既存のテーブルからファイル `test-data.csv.gz` にデータを書き出します:

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
SELECT name, value FROM existing_table;
```

Glob ** はディレクトリを再帰的に走査するために使用できます。以下の例のように、`my-test-bucket-768` ディレクトリ配下のすべてのファイルを再帰的に取得します。

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**', 'CSV', 'name String, value UInt32', 'gzip');
```

以下は、`my-test-bucket` ディレクトリ配下の任意のフォルダにあるすべての `test-data.csv.gz` ファイルから、再帰的にデータを取得します：

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip');
```

本番環境での利用では、[named collections](operations/named-collections.md) を使用することを推奨します。以下はその例です。

```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = '***',
        secret_access_key = '***';
SELECT count(*)
FROM gcs(creds, url='https://s3-object-url.csv')
```


## パーティション分割書き込み

`GCS` テーブルにデータを挿入する際に `PARTITION BY` 式を指定すると、各パーティション値ごとに別々のファイルが作成されます。データを個別のファイルに分割することで、読み取り処理の効率が向上します。

**例**

1. キーにパーティション ID を含めると、個別のファイルが作成されます：

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket/file_{_partition_id}.csv', 'CSV', 'a String, b UInt32, c UInt32')
    PARTITION BY a VALUES ('x', 2, 3), ('x', 4, 5), ('y', 11, 12), ('y', 13, 14), ('z', 21, 22), ('z', 23, 24);
```

その結果、データは `file_x.csv`、`file_y.csv`、`file_z.csv` の3つのファイルに書き込まれます。

2. バケット名にパーティション ID を含めると、ファイルは別々のバケットに作成されます。

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket_{_partition_id}/file.csv', 'CSV', 'a UInt32, b UInt32, c UInt32')
    PARTITION BY a VALUES (1, 2, 3), (1, 4, 5), (10, 11, 12), (10, 13, 14), (20, 21, 22), (20, 23, 24);
```

その結果、データはそれぞれ異なるバケット内の 3 つのファイル `my_bucket_1/file.csv`、`my_bucket_10/file.csv`、`my_bucket_20/file.csv` に書き込まれます。


## 関連項目 {#related}
- [S3 テーブル関数](s3.md)
- [S3 エンジン](../../engines/table-engines/integrations/s3.md)
