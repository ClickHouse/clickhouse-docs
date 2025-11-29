---
description: 's3 テーブル関数を拡張したものであり、指定したクラスター内の複数ノードで Amazon S3 および Google Cloud Storage 上のファイルを並列処理できます。'
sidebar_label: 's3Cluster'
sidebar_position: 181
slug: /sql-reference/table-functions/s3Cluster
title: 's3Cluster'
doc_type: 'reference'
---



# s3Cluster テーブル関数 {#s3cluster-table-function}

これは [s3](sql-reference/table-functions/s3.md) テーブル関数の拡張です。

指定したクラスタ内の多数のノードで、[Amazon S3](https://aws.amazon.com/s3/) および [Google Cloud Storage](https://cloud.google.com/storage/) 上のファイルを並列処理できます。イニシエーター側では、クラスタ内のすべてのノードへの接続を確立し、S3 ファイルパス中のアスタリスクを展開し、各ファイルを動的に割り当てます。ワーカーノード側では、処理すべき次のタスクをイニシエーターに問い合わせて、そのタスクを処理します。すべてのタスクが完了するまで、これを繰り返します。



## 構文 {#syntax}

```sql
s3Cluster(cluster_name, url[, NOSIGN | access_key_id, secret_access_key,[session_token]][, format][, structure][, compression_method][, headers][, extra_credentials])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```


## 引数 {#arguments}

| Argument                              | Description                                                                                                                                                                                             |
|---------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                        | リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスタ名。                                                                                         |
| `url`                                 | ファイルまたは複数ファイルへのパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{'abc','def'}` および `{N..M}`。ここで `N`, `M` は数値、`abc`, `def` は文字列です。詳細は [Wildcards In Path](../../engines/table-engines/integrations/s3.md#wildcards-in-path) を参照してください。 |
| `NOSIGN`                              | 資格情報の代わりにこのキーワードが指定された場合、すべてのリクエストは署名されません。                                                                                                             |
| `access_key_id` と `secret_access_key` | 指定されたエンドポイントで使用する資格情報を表すキー。省略可能。                                                                                                                                     |
| `session_token`                       | 指定されたキーとともに使用するセッショントークン。キーを指定する場合は省略可能。                                                                                                                                 |
| `format`                              | ファイルの [format](/sql-reference/formats)。                                                                                                                                                         |
| `structure`                           | テーブルの構造。形式: `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                          |
| `compression_method`                  | 省略可能なパラメータ。サポートされる値: `none`, `gzip` または `gz`, `brotli` または `br`, `xz` または `LZMA`, `zstd` または `zst`。デフォルトでは、ファイル拡張子により圧縮方式を自動検出します。                 |
| `headers`                             | 省略可能なパラメータ。S3 リクエストにヘッダーを渡すことができます。`headers(key=value)` 形式で指定します (例: `headers('x-amz-request-payer' = 'requester')`)。使用例は [こちら](/sql-reference/table-functions/s3#accessing-requester-pays-buckets) を参照してください。 |
| `extra_credentials`                   | 省略可能。`roleARN` をこのパラメータ経由で渡すことができます。例は [こちら](/cloud/data-sources/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role) を参照してください。                                          |

引数は [named collections](operations/named-collections.md) を使用して渡すこともできます。この場合、`url`, `access_key_id`, `secret_access_key`, `format`, `structure`, `compression_method` は同様に動作し、追加のパラメータがサポートされます:

| Argument                       | Description                                                                                                                                                                                                                       |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `filename`                     | 指定された場合、`url` に付加されます。                                                                                                                                                                                                 |
| `use_environment_credentials`  | デフォルトで有効です。環境変数 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED` を使用して追加パラメータを渡すことを許可します。 |
| `no_sign_request`              | デフォルトで無効です。                                                                                                                                                                                                              |
| `expiration_window_seconds`    | デフォルト値は 120 です。                                                                                                                                                                                                             |



## 返される値 {#returned_value}

指定した構造を持ち、指定したファイル内のデータを読み書きするためのテーブル。



## 例 {#examples}

次の例では、`cluster_simple` クラスター内のすべてのノードを使用して、`/root/data/clickhouse` および `/root/data/database/` ディレクトリ内のすべてのファイルからデータを選択します。

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

クラスタ `cluster_simple` 内のすべてのファイルに含まれる行数の合計をカウントします。

:::tip
ファイル一覧に先頭ゼロ付きの数値範囲が含まれている場合は、各桁ごとに波かっこを使った記法を用いるか、`?` を使用してください。
:::

本番環境で利用する場合は、[named collections](operations/named-collections.md) の使用を推奨します。以下はその例です。

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

ユーザーは、`s3` 関数について[こちら](/sql-reference/table-functions/s3#accessing-public-buckets)で説明されているのと同様の方法を利用できます。



## パフォーマンス最適化 {#optimizing-performance}

`s3` 関数のパフォーマンスを最適化する方法の詳細は、[詳細ガイド](/integrations/s3/performance) を参照してください。



## 関連項目 {#related}

- [S3 エンジン](../../engines/table-engines/integrations/s3.md)
- [S3 テーブル関数](../../sql-reference/table-functions/s3.md)
