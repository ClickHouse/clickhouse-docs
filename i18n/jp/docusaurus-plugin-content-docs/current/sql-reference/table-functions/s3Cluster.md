---
description: 'Amazon S3およびGoogle Cloud Storageからのファイルを指定されたクラスター内の多くのノードで並行して処理できるようにするs3テーブル関数の拡張。'
sidebar_label: 's3Cluster'
sidebar_position: 181
slug: /sql-reference/table-functions/s3Cluster
title: 's3Cluster'
---


# s3Cluster テーブル関数

これは[s3](sql-reference/table-functions/s3.md)テーブル関数の拡張です。

指定されたクラスター内の多くのノードで、[Amazon S3](https://aws.amazon.com/s3/)およびGoogle Cloud Storage [Google Cloud Storage](https://cloud.google.com/storage/)からのファイルを並行して処理することを可能にします。イニシエーターはクラスター内のすべてのノードへの接続を作成し、S3ファイルパスのアスタリスクを開示し、各ファイルを動的に配信します。ワーカーノードでは、イニシエーターに次の処理タスクを尋ね、それを処理します。すべてのタスクが完了するまで、このプロセスは繰り返されます。

**構文**

```sql
s3Cluster(cluster_name, url[, NOSIGN | access_key_id, secret_access_key,[session_token]][, format][, structure][, compression_method][, headers][, extra_credentials])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。
- `url` — ファイルまたはファイルの束へのパス。読み取り専用モードで以下のワイルドカードをサポートします： `*`, `**`, `?`, `{'abc','def'}`および`{N..M}`（ここで`N`、`M`は数字、`abc`、`def`は文字列）。詳細については[パスにおけるワイルドカード](../../engines/table-engines/integrations/s3.md#wildcards-in-path)を参照してください。
- `NOSIGN` — このキーワードが認証情報の代わりに提供される場合、すべてのリクエストは署名されません。
- `access_key_id`および`secret_access_key` — 指定されたエンドポイントで使用する資格情報を指定するキー。オプショナル。
- `session_token` - 指定されたキーとともに使用するセッショントークン。キーを渡す際はオプショナル。
- `format` — ファイルの[フォーマット](/sql-reference/formats)。
- `structure` — テーブルの構造。フォーマットは`'column1_name column1_type, column2_name column2_type, ...'`です。
- `compression_method` — パラメータはオプショナル。サポートされている値：`none`, `gzip`または`gz`, `brotli`または`br`, `xz`または`LZMA`, `zstd`または`zst`。デフォルトでは、ファイル拡張子によって圧縮メソッドを自動的に検出します。
- `headers` - オプショナル。S3リクエストにヘッダーを渡すことを許可します。形式は`headers(key=value)`です（例：`headers('x-amz-request-payer' = 'requester')`）。例については[こちら](/sql-reference/table-functions/s3#accessing-requester-pays-buckets)を参照してください。
- `extra_credentials` - オプショナル。`roleARN`はこのパラメータを介して渡すことができます。例については[こちら](/cloud/security/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)を参照してください。

引数は[名前付きコレクション](operations/named-collections.md)を使用しても渡すことができます。この場合、`url`、`access_key_id`、`secret_access_key`、`format`、`structure`、`compression_method`は同じように動作し、いくつかの追加パラメータがサポートされています：

 - `filename` — 指定されるとurlに付加されます。
 - `use_environment_credentials` — デフォルトで有効で、環境変数`AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`、`AWS_CONTAINER_CREDENTIALS_FULL_URI`、`AWS_CONTAINER_AUTHORIZATION_TOKEN`、`AWS_EC2_METADATA_DISABLED`を使用して追加パラメータを渡すことを許可します。
 - `no_sign_request` — デフォルトで無効。
 - `expiration_window_seconds` — デフォルト値は120です。

**返される値**

指定されたファイル内でデータを読み取るまたは書き込むための指定された構造を持つテーブル。

**例**

`cluster_simple`クラスター内のすべてのノードを使用して、`/root/data/clickhouse`および`/root/data/database/`フォルダー内のすべてのファイルからデータを選択します：

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

クラスター`cluster_simple`内のすべてのファイルの行の総数をカウントします：

:::tip
ファイルのリストに先頭ゼロのある数字範囲が含まれている場合は、各桁を別々の波括弧で囲む構文を使用するか、`?`を使用してください。
:::

本番環境での使用ケースでは、[名前付きコレクション](operations/named-collections.md)を使用することを推奨します。以下はその例です：
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

ユーザーは、s3関数に関するドキュメントに記載されているのと同じアプローチを使用できます[こちら](/sql-reference/table-functions/s3#accessing-public-buckets)。

## パフォーマンスの最適化 {#optimizing-performance}

s3関数のパフォーマンス最適化の詳細については、[こちらの詳細ガイド](/integrations/s3/performance)を参照してください。

**関連情報**

- [S3エンジン](../../engines/table-engines/integrations/s3.md)
- [s3テーブル関数](../../sql-reference/table-functions/s3.md)
