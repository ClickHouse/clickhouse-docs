---
description: '指定されたクラスタ内の多くのノードで、Amazon S3およびGoogle Cloud Storageからファイルを並列処理するs3テーブル関数の拡張機能。'
sidebar_label: 's3クラスタ'
sidebar_position: 181
slug: '/sql-reference/table-functions/s3Cluster'
title: 's3Cluster'
---




# s3Cluster テーブル関数

これは [s3](sql-reference/table-functions/s3.md) テーブル関数の拡張です。

指定されたクラスター内の多数のノードで、[Amazon S3](https://aws.amazon.com/s3/) および Google Cloud Storage [Google Cloud Storage](https://cloud.google.com/storage/) のファイルを並行処理することができます。イニシエーターはクラスター内のすべてのノードに接続を作成し、S3ファイルパスのアスタリスクを開示し、それぞれのファイルを動的に配信します。ワーカーノードはイニシエーターに次の処理タスクを尋ねてそれを処理します。これはすべてのタスクが完了するまで繰り返されます。

## 構文 {#syntax}

```sql
s3Cluster(cluster_name, url[, NOSIGN | access_key_id, secret_access_key,[session_token]][, format][, structure][, compression_method][, headers][, extra_credentials])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```

## 引数 {#arguments}

| 引数                                  | 説明                                                                                                                                                                                             |
|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                        | リモートおよびローカルサーバーへのアドレスと接続パラメーターのセットを構築するために使用されるクラスターの名前。                                                                                         |
| `url`                                 | ファイルまたは複数のファイルのパス。読み取り専用モードで次のワイルドカードをサポート：`*`, `**`, `?`, `{'abc','def'}` および `{N..M}` ここで `N`, `M` は数字、`abc`, `def` は文字列です。詳細については [パス内のワイルドカード](../../engines/table-engines/integrations/s3.md#wildcards-in-path)を参照してください。 |
| `NOSIGN`                              | このキーワードが資格情報の代わりに提供されると、すべてのリクエストは署名されません。                                                                                                             |
| `access_key_id` と `secret_access_key` | 指定されたエンドポイントで使用する資格情報を指定するキー。オプション。                                                                                                                                     |
| `session_token`                       | 指定されたキーで使用するセッショントークン。キーを渡す場合はオプション。                                                                                                                                 |
| `format`                              | ファイルの [形式](/sql-reference/formats)。                                                                                                                                                         |
| `structure`                           | テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                          |
| `compression_method`                  | パラメーターはオプションです。サポートされる値：`none`, `gzip` または `gz`, `brotli` または `br`, `xz` または `LZMA`, `zstd` または `zst`。デフォルトでは、ファイル拡張子によって圧縮方式を自動検出します。                 |
| `headers`                             | パラメーターはオプションです。S3リクエストにヘッダを渡すことを許可します。形式 `headers(key=value)` で渡してください。例 `headers('x-amz-request-payer' = 'requester')`。使用例は [こちら](/sql-reference/table-functions/s3#accessing-requester-pays-buckets)。 |
| `extra_credentials`                   | オプション。`roleARN` はこのパラメーターを介して渡すことができます。使用例は [こちら](/cloud/security/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)。                                          |

引数は [名前付きコレクション](operations/named-collections.md) を使用しても渡すことができます。この場合、`url`、`access_key_id`、`secret_access_key`、`format`、`structure`、`compression_method` は同様に機能し、一部の追加パラメーターがサポートされます。

| 引数                       | 説明                                                                                                                                                                                                                       |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `filename`                 | 指定された場合、URLに追加されます。                                                                                                                                                                                     |
| `use_environment_credentials`  | デフォルトで有効で、環境変数 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`、`AWS_CONTAINER_CREDENTIALS_FULL_URI`、`AWS_CONTAINER_AUTHORIZATION_TOKEN`、`AWS_EC2_METADATA_DISABLED`を使用して追加パラメーターを渡すことを許可します。 |
| `no_sign_request`          | デフォルトで無効です。                                                                                                                                                                                                  |
| `expiration_window_seconds` | デフォルト値は120です。                                                                                                                                                                                                 |

## 戻り値 {#returned_value}

指定されたファイルでデータを読み書きするための指定された構造のテーブル。

## 例 {#examples}

`cluster_simple` クラスター内のすべてのノードを使用して、`/root/data/clickhouse` と `/root/data/database/` フォルダー内のすべてのファイルからデータを選択します。

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

`cluster_simple` クラスター内のすべてのファイルの合計行数をカウントします：

:::tip
ファイルリストに先頭ゼロを含む数値範囲がある場合は、各桁を個別に波括弧で囲むか、`?` を使用してください。
:::

本番環境での使用例として、[名前付きコレクション](operations/named-collections.md)を使用することをお勧めします。以下はその例です：
```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = 'minio',
        secret_access_key = 'ClickHouse_Minio_P@ssw0rd';
SELECT count(*) FROM s3Cluster(
    'cluster_simple', creds, url='https://s3-object-url.csv',
    format='CSV', structure='name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
)
```

## プライベートおよびパブリックバケットへのアクセス {#accessing-private-and-public-buckets}

ユーザーは、s3関数に関する文書で説明されたのと同じアプローチを使用できます [こちら](/sql-reference/table-functions/s3#accessing-public-buckets)。

## パフォーマンスの最適化 {#optimizing-performance}

s3関数のパフォーマンス最適化に関する詳細は、[我々の詳細なガイド](/integrations/s3/performance)を参照してください。

## 関連 {#related}

- [S3エンジン](../../engines/table-engines/integrations/s3.md)
- [s3テーブル関数](../../sql-reference/table-functions/s3.md)
