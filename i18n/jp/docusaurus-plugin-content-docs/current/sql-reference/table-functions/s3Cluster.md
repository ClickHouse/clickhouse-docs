---
slug: '/sql-reference/table-functions/s3Cluster'
sidebar_position: 181
sidebar_label: 's3Cluster'
title: 's3Cluster'
description: 'Amazon S3およびGoogle Cloud Storageから指定したクラスター内の多くのノードでファイルを並列処理することを可能にするs3テーブル関数の拡張。'
---


# s3Cluster テーブル関数

これは[s3](sql-reference/table-functions/s3.md)テーブル関数の拡張です。

Amazon S3とGoogle Cloud Storageからのファイルを指定したクラスター内の多くのノードで並列に処理することを可能にします。イニシエーターでは、クラスター内のすべてのノードへの接続を作成し、S3ファイルパス内のアスタリスクを開示し、各ファイルを動的にディスパッチします。ワーカーノードでは、イニシエーターに処理する次のタスクを尋ね、それを処理します。これはすべてのタスクが完了するまで繰り返されます。

**構文**

``` sql
s3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,structure] [,compression_method],[,headers])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスおよび接続パラメータのセットを構築するために使用されるクラスターの名前。
- `url` — ファイルまたはファイルのバンドルへのパス。読み取り専用モードでは次のワイルドカードをサポートします: `*`, `**`, `?`, `{'abc','def'}` および `{N..M}`、ここで `N`, `M` は数字、 `abc`, `def` は文字列です。詳細については、[パス内のワイルドカード](../../engines/table-engines/integrations/s3.md#wildcards-in-path)を参照してください。
- `NOSIGN` — このキーワードが資格情報の代わりに提供されると、すべてのリクエストは署名されません。
- `access_key_id` および `secret_access_key` — 指定されたエンドポイントで使用する資格情報を指定するキー。任意。
- `session_token` — 指定されたキーで使用するセッショントークン。キーを渡すときは任意。
- `format` — ファイルの[フォーマット](/sql-reference/formats)。
- `structure` — テーブルの構造。フォーマット `'column1_name column1_type, column2_name column2_type, ...'`。
- `compression_method` — パラメータは任意。サポートされる値: `none`, `gzip`または`gz`, `brotli`または`br`, `xz`または`LZMA`, `zstd`または`zst`。デフォルトでは、ファイル拡張子によって圧縮メソッドを自動検出します。
- `headers` - パラメータは任意。S3リクエストにヘッダーを渡すことを許可します。フォーマットは `headers(key=value)` で、例として `headers('x-amz-request-payer' = 'requester')` があります。使用例については[こちら](/sql-reference/table-functions/s3#accessing-requester-pays-buckets)を参照してください。

引数は[named collections](operations/named-collections.md)を使用して渡すこともできます。この場合、`url`、`access_key_id`、`secret_access_key`、`format`、`structure`、`compression_method`は同じように機能し、追加のパラメータがサポートされます:

- `filename` — 指定されている場合、urlに追加されます。
- `use_environment_credentials` — デフォルトで有効、環境変数 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`、 `AWS_CONTAINER_CREDENTIALS_FULL_URI`、 `AWS_CONTAINER_AUTHORIZATION_TOKEN`、 `AWS_EC2_METADATA_DISABLED`を使用して追加のパラメータを渡すことを許可します。
- `no_sign_request` — デフォルトで無効。
- `expiration_window_seconds` — デフォルト値は120。

**返される値**

指定されたファイルでデータを読み書きするための、指定された構造のテーブル。

**使用例**

`cluster_simple`クラスター内の`/root/data/clickhouse`および`/root/data/database/`フォルダー内のすべてのファイルからデータを選択します。

``` sql
SELECT * FROM s3Cluster(
    'cluster_simple',
    'http://minio1:9001/root/data/{clickhouse,database}/*',
    'minio',
    'minio123',
    'CSV',
    'name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
) ORDER BY (name, value, polygon);
```

クラスター`cluster_simple`内のすべてのファイルの行の合計をカウントします。

:::tip
ファイルのリストに先頭ゼロ付きの番号範囲が含まれている場合は、各数字を別々に括弧で囲む構文を使用するか、`?`を使用してください。
:::

本番環境での使用ケースでは、[named collections](operations/named-collections.md)を使用することをお勧めします。以下はその例です：
``` sql

CREATE NAMED COLLECTION creds AS
        access_key_id = 'minio',
        secret_access_key = 'minio123';
SELECT count(*) FROM s3Cluster(
    'cluster_simple', creds, url='https://s3-object-url.csv',
    format='CSV', structure='name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
)
```

## プライベートおよびパブリックバケットへのアクセス {#accessing-private-and-public-buckets}

ユーザーは、s3関数のドキュメントで同じアプローチを使用できます[こちら](/sql-reference/table-functions/s3#accessing-public-buckets)。

## パフォーマンスの最適化 {#optimizing-performance}

s3関数のパフォーマンスを最適化する詳細については、[詳細ガイド](/integrations/s3/performance)を参照してください。

**関連資料**

- [S3エンジン](../../engines/table-engines/integrations/s3.md)
- [s3テーブル関数](../../sql-reference/table-functions/s3.md)
