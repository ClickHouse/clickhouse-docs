---
slug: /sql-reference/table-functions/s3Cluster
sidebar_position: 181
sidebar_label: s3Cluster
title: "s3Cluster テーブル関数"
---
これは、[s3](/sql-reference/table-functions/s3.md) テーブル関数への拡張です。

指定されたクラスタ内の多くのノードから、[Amazon S3](https://aws.amazon.com/s3/) および [Google Cloud Storage](https://cloud.google.com/storage/) のファイルを並列処理することを可能にします。イニシエータは、クラスタ内のすべてのノードへの接続を作成し、S3ファイルパスのアスタリスクを開示し、各ファイルを動的に配送します。ワーカーノードでは、イニシエータに次に処理するタスクについて尋ね、処理します。これは、すべてのタスクが完了するまで繰り返されます。

**構文**

``` sql
s3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,structure] [,compression_method],[,headers])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスおよび接続パラメータのセットを構築するために使用されるクラスタの名前。
- `url` — ファイルまたはファイルの束へのパス。読み取り専用モードで次のワイルドカードをサポートします： `*`, `**`, `?`, `{'abc','def'}` および `{N..M}` ここで、`N` および `M` は数字、`abc` および `def` は文字列です。詳細については、[パス内のワイルドカード](../../engines/table-engines/integrations/s3.md#wildcards-in-path)を参照してください。
- `NOSIGN` — このキーワードが資格情報の代わりに提供されると、すべてのリクエストは署名されません。
- `access_key_id` および `secret_access_key` — 指定されたエンドポイントで使用する資格情報を指定するキー。オプション。
- `session_token` - 指定されたキーで使用するセッショントークン。キーを渡す際にオプションです。
- `format` — ファイルの[フォーマット](../../interfaces/formats.md#formats)。
- `structure` — テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'` です。
- `compression_method` — パラメータはオプションです。サポートされている値： `none`, `gzip` または `gz`, `brotli` または `br`, `xz` または `LZMA`, `zstd` または `zst`。デフォルトでは、ファイル拡張子によって圧縮方法を自動検出します。
- `headers` - パラメータはオプションです。S3リクエストにヘッダーを渡すことを可能にします。形式 `headers(key=value)` で渡してください。例： `headers('x-amz-request-payer' = 'requester')`。使用例については[こちら](/sql-reference/table-functions/s3#accessing-requester-pays-buckets)を参照してください。

引数は、[名前付きコレクション](/operations/named-collections.md)を使用して渡すこともできます。この場合、`url`、`access_key_id`、`secret_access_key`、`format`、`structure`、`compression_method`は同様に機能し、いくつかの追加パラメータがサポートされます：

 - `filename` — 指定された場合、urlに追加されます。
 - `use_environment_credentials` — デフォルトで有効、環境変数 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`、`AWS_CONTAINER_CREDENTIALS_FULL_URI`、`AWS_CONTAINER_AUTHORIZATION_TOKEN`、`AWS_EC2_METADATA_DISABLED` を使用して追加パラメータを渡すことを可能にします。
 - `no_sign_request` — デフォルトで無効。
 - `expiration_window_seconds` — デフォルト値は120です。

**返される値**

指定されたファイルでデータを読み書きするための、指定された構造を持つテーブル。

**例**

`cluster_simple` クラスター内の `/root/data/clickhouse` および `/root/data/database/` フォルダー内のすべてのファイルからデータを選択します：

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

クラスター `cluster_simple` 内のすべてのファイルの行数をカウントします：

:::tip
ファイルのリストに先頭ゼロが含まれている場合は、各数字を個別に波括弧で囲む構文を使用するか、`?` を使用してください。
:::

本番環境の場合は、[名前付きコレクション](/operations/named-collections.md)を使用することをお勧めします。以下はその例です：
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

ユーザーは、s3 関数の文書で説明されているのと同じアプローチを使用できます [こちら](/sql-reference/table-functions/s3#accessing-public-buckets)。

## パフォーマンスの最適化 {#optimizing-performance}

s3 関数のパフォーマンスを最適化する方法の詳細については、[こちらの詳細ガイド](/integrations/s3/performance)を参照してください。

**参照**

- [S3エンジン](../../engines/table-engines/integrations/s3.md)
- [s3テーブル関数](../../sql-reference/table-functions/s3.md)
