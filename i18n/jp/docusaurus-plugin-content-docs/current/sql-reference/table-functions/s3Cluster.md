---
slug: /sql-reference/table-functions/s3Cluster
sidebar_position: 181
sidebar_label: s3Cluster
title: "s3Cluster"
description: "指定したクラスター内の多数のノードで、Amazon S3およびGoogle Cloud Storageからのファイルを並列に処理するためのs3テーブル関数の拡張です。"
---


# s3Cluster テーブル関数

これは[s3](sql-reference/table-functions/s3.md)テーブル関数の拡張です。

指定したクラスター内の多数のノードで、[Amazon S3](https://aws.amazon.com/s3/)および[Google Cloud Storage](https://cloud.google.com/storage/)からのファイルを並行して処理します。イニシエーターは、クラスター内のすべてのノードへの接続を作成し、S3ファイルパス内のアスタリスクを開示し、各ファイルを動的に配信します。ワーカーノードでは、イニシエーターに次の処理タスクを要求し、それを処理します。すべてのタスクが完了するまでこのプロセスが繰り返されます。

**構文**

``` sql
s3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,structure] [,compression_method],[,headers])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。
- `url` — ファイルまたはファイル群へのパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{'abc','def'}` および `{N..M}` ただし、`N`, `M`は数字、`abc`, `def`は文字列です。詳細については、[Wildcards In Path](../../engines/table-engines/integrations/s3.md#wildcards-in-path)を参照してください。
- `NOSIGN` — このキーワードを資格情報の代わりに提供すると、すべてのリクエストが署名されません。
- `access_key_id` および `secret_access_key` — 指定されたエンドポイントと一緒に使用する資格情報を指定するキー。オプションです。
- `session_token` - 指定されたキーと使用するセッショントークン。キーを渡す場合はオプションです。
- `format` — ファイルの[形式](../../interfaces/formats.md#formats)。
- `structure` — テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。
- `compression_method` — パラメータはオプションです。サポートされる値: `none`, `gzip`または`gz`, `brotli`または`br`, `xz`または`LZMA`, `zstd`または`zst`。デフォルトでは、ファイル拡張子によって圧縮方法が自動検出されます。
- `headers` - パラメータはオプションです。S3リクエストにヘッダーを渡すことを可能にします。書式は `headers(key=value)` つまり `headers('x-amz-request-payer' = 'requester')`の形式です。使用例については[こちら](/sql-reference/table-functions/s3#accessing-requester-pays-buckets)を参照してください。

引数は[名前付きコレクション](operations/named-collections.md)を使用して渡すこともできます。この場合、`url`, `access_key_id`, `secret_access_key`, `format`, `structure`, `compression_method`は同様に機能し、いくつかの追加パラメータがサポートされます：

 - `filename` — 指定された場合、URLに追加されます。
 - `use_environment_credentials` — デフォルトで有効になっており、環境変数 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED`を使用して追加パラメータを渡すことを可能にします。
 - `no_sign_request` — デフォルトで無効になっています。
 - `expiration_window_seconds` — デフォルト値は120です。

**返される値**

指定されたファイル内のデータを読み書きするための指定された構造のテーブル。

**例**

`cluster_simple` クラスター内の `/root/data/clickhouse` および `/root/data/database/` フォルダー内のすべてのファイルからデータを選択します。すべてのノードを使用します：

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

クラスター `cluster_simple` 内のすべてのファイルの合計行数をカウントします：

:::tip
ファイルのリストに先頭ゼロを含む数字範囲が含まれている場合は、各桁ごとにブレースを使用する構文か `?` を使用してください。
:::

本番用のユースケースでは、[名前付きコレクション](operations/named-collections.md)を使用することをお勧めします。ここに例があります：
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

ユーザーは、s3関数へのアプローチと同じ方法を使用できます [こちら](/sql-reference/table-functions/s3#accessing-public-buckets)。

## パフォーマンスの最適化 {#optimizing-performance}

s3関数のパフォーマンス最適化の詳細については、[私たちの詳細ガイド](/integrations/s3/performance)を参照してください。

**参照**

- [S3エンジン](../../engines/table-engines/integrations/s3.md)
- [s3テーブル関数](../../sql-reference/table-functions/s3.md)
