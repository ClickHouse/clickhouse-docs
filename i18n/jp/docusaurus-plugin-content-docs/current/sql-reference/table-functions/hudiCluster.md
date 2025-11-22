---
description: 'hudi テーブル関数を拡張したものです。Amazon S3 上の Apache Hudi テーブルからのファイルを、指定されたクラスタ内の多数のノードで並列処理できるようにします。'
sidebar_label: 'hudiCluster'
sidebar_position: 86
slug: /sql-reference/table-functions/hudiCluster
title: 'hudiCluster テーブル関数'
doc_type: 'reference'
---



# hudiCluster テーブル関数

これは [hudi](sql-reference/table-functions/hudi.md) テーブル関数の拡張です。

指定したクラスタ内の多数のノードを用いて、Amazon S3 上にある Apache [Hudi](https://hudi.apache.org/) テーブルのファイルを並列処理できるようにします。イニシエーターはクラスタ内のすべてのノードへの接続を確立し、各ファイルを動的に割り当てます。ワーカーノードは処理すべき次のタスクをイニシエーターに問い合わせ、そのタスクを処理します。これは、すべてのタスクが完了するまで繰り返されます。



## 構文 {#syntax}

```sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```


## 引数 {#arguments}

| 引数                                     | 説明                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cluster_name`                               | リモートサーバーおよびローカルサーバーへのアドレスセットと接続パラメータを構築するために使用されるクラスタ名。                                                                                                                                                                                                                                                                                                    |
| `url`                                        | S3内の既存のHudiテーブルへのパスを含むバケットURL。                                                                                                                                                                                                                                                                                                                            |
| `aws_access_key_id`, `aws_secret_access_key` | [AWS](https://aws.amazon.com/)アカウントユーザーの長期認証情報。リクエストの認証に使用できます。これらのパラメータは省略可能です。認証情報が指定されていない場合は、ClickHouse設定から使用されます。詳細については、[データストレージへのS3の使用](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)を参照してください。 |
| `format`                                     | ファイルの[フォーマット](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                                       |
| `structure`                                  | テーブルの構造。形式は`'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                        |
| `compression`                                | 省略可能なパラメータ。サポートされる値：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。デフォルトでは、圧縮はファイル拡張子によって自動検出されます。                                                                                                                                  |


## 戻り値 {#returned_value}

S3内の指定されたHudiテーブルのクラスタからデータを読み取るための、指定された構造を持つテーブル。


## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ(バイト単位)。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
- `_etag` — ファイルのetag。型: `LowCardinality(String)`。etagが不明な場合、値は `NULL` です。


## 関連項目 {#related}

- [Hudiエンジン](engines/table-engines/integrations/hudi.md)
- [Hudiテーブル関数](sql-reference/table-functions/hudi.md)
