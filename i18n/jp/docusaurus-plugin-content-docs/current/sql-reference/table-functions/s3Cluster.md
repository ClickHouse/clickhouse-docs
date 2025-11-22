---
description: '指定されたクラスタ内の多数のノードで、Amazon S3 および Google Cloud Storage 上のファイルを並列処理できる s3 テーブル関数の拡張機能。'
sidebar_label: 's3Cluster'
sidebar_position: 181
slug: /sql-reference/table-functions/s3Cluster
title: 's3Cluster'
doc_type: 'reference'
---



# s3Cluster テーブル関数

これは [s3](sql-reference/table-functions/s3.md) テーブル関数の拡張です。

指定されたクラスター内の多数のノードで並列に、[Amazon S3](https://aws.amazon.com/s3/) および [Google Cloud Storage](https://cloud.google.com/storage/) からファイルを処理できるようにします。イニシエーターノードでは、クラスター内のすべてのノードへの接続を確立し、S3 ファイルパス中のワイルドカード（*）を展開して、各ファイルを動的に割り当てます。ワーカーノードでは、処理すべき次のタスクをイニシエーターに問い合わせ、そのタスクを処理します。すべてのタスクが完了するまで、この処理が繰り返されます。



## 構文 {#syntax}

```sql
s3Cluster(cluster_name, url[, NOSIGN | access_key_id, secret_access_key,[session_token]][, format][, structure][, compression_method][, headers][, extra_credentials])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```


## 引数 {#arguments}

| 引数                                | 説明                                                                                                                                                                                                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster_name`                          | リモートサーバーおよびローカルサーバーへのアドレスセットと接続パラメータを構築するために使用されるクラスター名。                                                                                                                                                                                 |
| `url`                                   | ファイルまたは複数のファイルへのパス。読み取り専用モードで以下のワイルドカードをサポート：`*`、`**`、`?`、`{'abc','def'}`、および `{N..M}`（`N`、`M` は数値、`abc`、`def` は文字列）。詳細については、[パス内のワイルドカード](../../engines/table-engines/integrations/s3.md#wildcards-in-path)を参照してください。 |
| `NOSIGN`                                | このキーワードが認証情報の代わりに指定された場合、すべてのリクエストは署名されません。                                                                                                                                                                                                         |
| `access_key_id` および `secret_access_key` | 指定されたエンドポイントで使用する認証情報を指定するキー。オプション。                                                                                                                                                                                                               |
| `session_token`                         | 指定されたキーと共に使用するセッショントークン。キーを渡す場合はオプション。                                                                                                                                                                                                             |
| `format`                                | ファイルの[フォーマット](/sql-reference/formats)。                                                                                                                                                                                                                                 |
| `structure`                             | テーブルの構造。フォーマット：`'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                     |
| `compression_method`                    | オプションのパラメータ。サポートされる値：`none`、`gzip` または `gz`、`brotli` または `br`、`xz` または `LZMA`、`zstd` または `zst`。デフォルトでは、ファイル拡張子から圧縮方式を自動検出します。                                                                                                          |
| `headers`                               | オプションのパラメータ。S3リクエストでヘッダーを渡すことができます。`headers(key=value)` の形式で渡します。例：`headers('x-amz-request-payer' = 'requester')`。使用例については[こちら](/sql-reference/table-functions/s3#accessing-requester-pays-buckets)を参照してください。                             |
| `extra_credentials`                     | オプション。このパラメータを介して `roleARN` を渡すことができます。例については[こちら](/cloud/data-sources/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)を参照してください。                                                                                                              |

引数は[名前付きコレクション](operations/named-collections.md)を使用して渡すこともできます。この場合、`url`、`access_key_id`、`secret_access_key`、`format`、`structure`、`compression_method` は同じように機能し、いくつかの追加パラメータがサポートされます：

| 引数                      | 説明                                                                                                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `filename`                    | 指定された場合、URLに追加されます。                                                                                                                                                                                                 |
| `use_environment_credentials` | デフォルトで有効。環境変数 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`、`AWS_CONTAINER_CREDENTIALS_FULL_URI`、`AWS_CONTAINER_AUTHORIZATION_TOKEN`、`AWS_EC2_METADATA_DISABLED` を使用して追加パラメータを渡すことができます。 |
| `no_sign_request`             | デフォルトで無効。                                                                                                                                                                                                              |
| `expiration_window_seconds`   | デフォルト値は120。                                                                                                                                                                                                             |


## 戻り値 {#returned_value}

指定されたファイル内のデータを読み書きするための、指定された構造のテーブル。


## Examples {#examples}

`cluster_simple` クラスタのすべてのノードを使用して、`/root/data/clickhouse` および `/root/data/database/` フォルダ内のすべてのファイルからデータを選択します:

```sql
SELECT * FROM s3Cluster(
    'cluster_simple',
    'http://minio1:9001/root/data/{clickhouse,database}/*',
    'minio',
    'ClickHouse_Minio_P@ssw0rd',
    'CSV',
    'name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
) ORDER BY (name, value, polygon);
```

クラスタ `cluster_simple` 内のすべてのファイルの総行数をカウントします:

:::tip
ファイルのリストに先頭ゼロ付きの数値範囲が含まれている場合は、各桁ごとに中括弧を使用した構文を使用するか、`?` を使用してください。
:::

本番環境では、[名前付きコレクション](operations/named-collections.md) の使用を推奨します。以下に例を示します:

```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = 'minio',
        secret_access_key = 'ClickHouse_Minio_P@ssw0rd';
SELECT count(*) FROM s3Cluster(
    'cluster_simple', creds, url='https://s3-object-url.csv',
    format='CSV', structure='name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
)
```


## プライベートバケットとパブリックバケットへのアクセス {#accessing-private-and-public-buckets}

s3関数と同じアプローチを使用できます。詳細は[こちら](/sql-reference/table-functions/s3#accessing-public-buckets)を参照してください。


## パフォーマンスの最適化 {#optimizing-performance}

s3関数のパフォーマンス最適化の詳細については、[詳細ガイド](/integrations/s3/performance)をご参照ください。


## 関連項目 {#related}

- [S3エンジン](../../engines/table-engines/integrations/s3.md)
- [s3テーブル関数](../../sql-reference/table-functions/s3.md)
