---
description: 'Amazon S3 上の Apache Hudi テーブルに対して、読み取り専用のテーブルライクなインターフェースを提供します。'
sidebar_label: 'hudi'
sidebar_position: 85
slug: /sql-reference/table-functions/hudi
title: 'hudi'
doc_type: 'reference'
---



# hudi テーブル関数

Amazon S3 上の Apache [Hudi](https://hudi.apache.org/) テーブルに対して、読み取り専用のテーブルと同様のインターフェースを提供します。



## 構文 {#syntax}

```sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```


## 引数 {#arguments}

| 引数                                     | 説明                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `url`                                        | S3内の既存のHudiテーブルへのパスを含むバケットURL。                                                                                                                                                                                                                                                                                                                            |
| `aws_access_key_id`, `aws_secret_access_key` | [AWS](https://aws.amazon.com/)アカウントユーザーの長期認証情報。リクエストの認証に使用できます。これらのパラメータは省略可能です。認証情報が指定されていない場合は、ClickHouseの設定から使用されます。詳細については、[データストレージへのS3の使用](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)を参照してください。 |
| `format`                                     | ファイルの[フォーマット](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                                       |
| `structure`                                  | テーブルの構造。形式は`'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                        |
| `compression`                                | 省略可能なパラメータ。サポートされる値: `none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。デフォルトでは、圧縮形式はファイル拡張子から自動検出されます。                                                                                                                                                                                                                  |


## 戻り値 {#returned_value}

S3内の指定されたHudiテーブルのデータを読み取るための、指定された構造を持つテーブル。


## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ(バイト単位)。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
- `_etag` — ファイルのetag。型: `LowCardinality(String)`。etagが不明な場合、値は `NULL` です。


## 関連項目 {#related}

- [Hudiエンジン](/engines/table-engines/integrations/hudi.md)
- [Hudiクラスターテーブル関数](/sql-reference/table-functions/hudiCluster.md)
