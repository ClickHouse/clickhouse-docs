---
description: 'Amazon S3 上の Apache Hudi テーブルに対する、読み取り専用のテーブルのようなインターフェースを提供します。'
sidebar_label: 'hudi'
sidebar_position: 85
slug: /sql-reference/table-functions/hudi
title: 'hudi'
doc_type: 'reference'
---

# hudi テーブル関数 {#hudi-table-function}

Amazon S3 上の Apache [Hudi](https://hudi.apache.org/) テーブルに対して、読み取り専用のテーブルライクなインターフェースを提供します。

## 構文 {#syntax}

```sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 引数 {#arguments}

| Argument                                     | Description                                                                                                                                                                                                                                                                                                                                                                           |
|----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                                        | S3 内の既存の Hudi テーブルへのパスを含むバケットの URL。                                                                                                                                                                                                                                                                                                                             |
| `aws_access_key_id`, `aws_secret_access_key` | [AWS](https://aws.amazon.com/) アカウントユーザーの長期認証情報です。リクエストを認証するために使用できます。これらのパラメータは省略可能です。認証情報が指定されていない場合は、ClickHouse の設定に定義されたものが使用されます。詳細については、[Using S3 for Data Storage](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) を参照してください。 |
| `format`                                     | ファイルの[フォーマット](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                                        |
| `structure`                                  | テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                         |
| `compression`                                | 省略可能なパラメータ。指定可能な値は `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst` です。既定では、圧縮形式はファイル拡張子によって自動検出されます。                                                                                                                                                                                                                   |

## 返される値 {#returned_value}

S3 上の指定した Hudi テーブルのデータを読み取るための、指定した構造を持つテーブル。

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルサイズ（バイト単位）。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新日時。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
- `_etag` — ファイルの ETag。型: `LowCardinality(String)`。ETag が不明な場合、値は `NULL` です。

## 関連項目 {#related}

- [Hudi エンジン](/engines/table-engines/integrations/hudi.md)
- [Hudi クラスターテーブル関数](/sql-reference/table-functions/hudiCluster.md)
