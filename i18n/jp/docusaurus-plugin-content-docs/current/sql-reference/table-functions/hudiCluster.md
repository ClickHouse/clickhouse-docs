---
description: 'hudi テーブル関数の拡張です。指定したクラスタ内の多数のノードで、Amazon S3 上の Apache Hudi テーブルのファイルを並列処理できます。'
sidebar_label: 'hudiCluster'
sidebar_position: 86
slug: /sql-reference/table-functions/hudiCluster
title: 'hudiCluster テーブル関数'
doc_type: 'reference'
---



# hudiCluster テーブル関数

これは [hudi](sql-reference/table-functions/hudi.md) テーブル関数の拡張機能です。

指定したクラスタ内の多数のノードを使って、Amazon S3 上の Apache [Hudi](https://hudi.apache.org/) テーブル内のファイルを並列処理できます。イニシエータでは、クラスタ内のすべてのノードへの接続を確立し、各ファイルを動的に割り当てます。ワーカーノードでは、次に処理すべきタスクをイニシエータに問い合わせて、そのタスクを処理します。すべてのタスクが完了するまで、これを繰り返します。



## 構文

```sql
hudiCluster(cluster_name, URL[, aws_access_key_id, aws_secret_access_key][, format][, structure][, compression])
```


## 引数 {#arguments}

| 引数                                         | 説明                                                                                                                                                                                                                                                                                                                                                                                   |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                               | リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構成するために使用されるクラスター名。                                                                                                                                                                                                                                                                           |
| `url`                                        | S3 内の既存の Hudi テーブルへのパスを含むバケットの URL。                                                                                                                                                                                                                                                                                                                             |
| `aws_access_key_id`, `aws_secret_access_key` | [AWS](https://aws.amazon.com/) アカウントユーザー向けの長期的な認証情報。リクエストの認証に使用できます。これらのパラメータは省略可能です。認証情報が指定されていない場合は、ClickHouse の設定から取得されます。詳細は [Using S3 for Data Storage](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) を参照してください。 |
| `format`                                     | ファイルの [フォーマット](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                                     |
| `structure`                                  | テーブルの構造。`'column1_name column1_type, column2_name column2_type, ...'` という形式で指定します。                                                                                                                                                                                                                                                                                |
| `compression`                                | 省略可能なパラメータ。サポートされる値は `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst` です。既定では、圧縮形式はファイル拡張子から自動検出されます。                                                                                                                                                                                                                          |



## 返される値 {#returned_value}

S3 上の指定した Hudi テーブルに対し、クラスタからデータを読み取るための、指定した構造を持つテーブル。



## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルサイズ（バイト単位）。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
- `_etag` — ファイルの etag。型: `LowCardinality(String)`。etag が不明な場合、値は `NULL` です。



## 関連項目 {#related}

- [Hudi エンジン](engines/table-engines/integrations/hudi.md)
- [Hudi テーブル関数](sql-reference/table-functions/hudi.md)
