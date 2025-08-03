---
description: 'Amazon S3内のApache Hudiテーブルからファイルを指定されたクラスターの多数のノードで並列処理するための拡張機能。'
sidebar_label: 'hudiCluster'
sidebar_position: 86
slug: '/sql-reference/table-functions/hudiCluster'
title: 'hudiCluster Table Function'
---




# hudiCluster テーブル関数

これはこちらの [hudi](sql-reference/table-functions/hudi.md) テーブル関数への拡張です。

指定されたクラスタ内の多くのノードと並行して、Amazon S3 の Apache [Hudi](https://hudi.apache.org/) テーブルからファイルを処理できるようにします。イニシエーターは、クラスタ内のすべてのノードへの接続を作成し、各ファイルを動的にディスパッチします。ワーカーノードでは、イニシエーターに次の処理タスクについて尋ね、そのタスクを処理します。これをすべてのタスクが終了するまで繰り返します。

## 構文 {#syntax}

```sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 引数 {#arguments}

| 引数                                         | 説明                                                                                                                                                                                                                                                                                                                                                                               |
|--------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                             | リモートおよびローカルサーバへのアドレスと接続パラメータのセットを構築するために使用されるクラスタの名前。                                                                                                                                                                                                                                                                     |
| `url`                                      | S3 に存在する Hudi テーブルへのパスを含むバケット URL。                                                                                                                                                                                                                                                                                                                            |
| `aws_access_key_id`, `aws_secret_access_key` | [AWS](https://aws.amazon.com/) アカウントユーザーのための長期認証情報。これを使ってリクエストを認証できます。これらのパラメータはオプションです。認証情報が指定されていない場合、ClickHouse 設定から使用されます。詳細については、[データストレージに S3 を使用する](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)を参照してください。 |
| `format`                                   | ファイルの [format](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                                         |
| `structure`                                | テーブルの構造。形式 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                               |
| `compression`                              | パラメータはオプションです。サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、圧縮はファイル拡張子によって自動的に検出されます。                                                                                                                                                                                            |

## 戻り値 {#returned_value}

指定された Hudi テーブルからクラスタのデータを読み取るための、指定された構造のテーブル。

## 関連 {#related}

- [Hudi エンジン](engines/table-engines/integrations/hudi.md)
- [Hudi テーブル関数](sql-reference/table-functions/hudi.md)
