---
'description': 'Amazon S3とGoogle Cloud Storageからのファイルを指定されたクラスター内の多数のノードで並行処理することを可能にするs3テーブル関数への拡張。'
'sidebar_label': 's3Cluster'
'sidebar_position': 181
'slug': '/sql-reference/table-functions/s3Cluster'
'title': 's3Cluster'
'doc_type': 'reference'
---


# s3Cluster テーブル関数

これは[s3](sql-reference/table-functions/s3.md) テーブル関数の拡張です。

指定されたクラスタ内の多数のノードで、[Amazon S3](https://aws.amazon.com/s3/)やGoogle Cloud Storage [Google Cloud Storage](https://cloud.google.com/storage/) からファイルを並行して処理することを可能にします。イニシエータはクラスタ内のすべてのノードへの接続を作成し、S3ファイルパス内のアスタリスクを開示し、それぞれのファイルを動的に配信します。ワーカーノードは次の処理タスクについてイニシエータに問い合わせ、それを処理します。このプロセスは全てのタスクが完了するまで繰り返されます。

## 構文 {#syntax}

```sql
s3Cluster(cluster_name, url[, NOSIGN | access_key_id, secret_access_key,[session_token]][, format][, structure][, compression_method][, headers][, extra_credentials])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```

## 引数 {#arguments}

| 引数                                   | 説明                                                                                                                                                                                   |
|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                        | リモートおよびローカルサーバーへのアドレスおよび接続パラメータのセットを構築するために使用されるクラスタの名前。                                                                                     |
| `url`                                 | ファイルまたは一連のファイルへのパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{'abc','def'}` および `{N..M}` ここで `N`, `M` は数字、`abc`, `def` は文字列です。詳細は[パスのワイルドカード](../../engines/table-engines/integrations/s3.md#wildcards-in-path)を参照してください。 |
| `NOSIGN`                              | 認証情報の代わりにこのキーワードが提供されると、すべてのリクエストは署名されません。                                                                                                                                             |
| `access_key_id` および `secret_access_key` | 指定されたエンドポイントで使用する認証情報を指定するキー。オプションです。                                                                                                                                                 |
| `session_token`                       | 指定されたキーに使用するセッショントークン。キーを渡す際にはオプションです。                                                                                                                                                     |
| `format`                              | ファイルの[フォーマット](/sql-reference/formats)。                                                                                                                                              |
| `structure`                           | テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                   |
| `compression_method`                  | パラメータはオプションです。サポートされている値: `none`, `gzip` または `gz`, `brotli` または `br`, `xz` または `LZMA`, `zstd` または `zst`。デフォルトでは、ファイル拡張子によって圧縮方式を自動検出します。                                        |
| `headers`                             | パラメータはオプションです。S3リクエストにヘッダーを渡すことができます。`headers(key=value)`の形式で渡します。例: `headers('x-amz-request-payer' = 'requester')`。使用例は[ここ]( /sql-reference/table-functions/s3#accessing-requester-pays-buckets)を参照してください。                     |
| `extra_credentials`                   | オプションです。`roleARN`をこのパラメータで渡すことができます。例は[こちら]( /cloud/security/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)を参照してください。                                       |

引数は[named collections](operations/named-collections.md)を使用しても渡すことができます。この場合、`url`, `access_key_id`, `secret_access_key`, `format`, `structure`, `compression_method`は同様に機能し、いくつかの追加パラメータがサポートされます。

| 引数                             | 説明                                                                                                                                                                          |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `filename`                       | 指定されている場合、urlに追加されます。                                                                                                                                      |
| `use_environment_credentials`     | デフォルトで有効です。環境変数`AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED`を使用して追加パラメータを渡すことを可能にします。 |
| `no_sign_request`                | デフォルトで無効です。                                                                                                                                                       |
| `expiration_window_seconds`      | デフォルト値は120です。                                                                                                                                                     |

## 返される値 {#returned_value}

指定されたファイル内のデータを読み書きするための、指定された構造のテーブル。

## 例 {#examples}

`cluster_simple`クラスタのすべてのノードを使用して、`/root/data/clickhouse`および`/root/data/database/`フォルダ内のすべてのファイルからデータを選択します。

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

`cluster_simple`クラスタ内のすべてのファイルの行の合計数をカウントします。

:::tip
ファイルのリストに先頭ゼロを持つ数の範囲が含まれている場合は、各桁ごとにブレースを使って構築するか`?`を使用してください。
:::

本番環境での使用ケースでは、[named collections](operations/named-collections.md)を使用することをお勧めします。以下はその例です：
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

ユーザーはs3関数の文書と同様のアプローチを使用できます[こちら]( /sql-reference/table-functions/s3#accessing-public-buckets)。

## パフォーマンスの最適化 {#optimizing-performance}

s3関数のパフォーマンスを最適化する詳細については[当社の詳細ガイド]( /integrations/s3/performance)を参照してください。

## 関連項目 {#related}

- [S3エンジン](../../engines/table-engines/integrations/s3.md)
- [s3テーブル関数](../../sql-reference/table-functions/s3.md)
