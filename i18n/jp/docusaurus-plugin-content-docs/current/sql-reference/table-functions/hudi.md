---
description: 'Apache Hudi テーブルへの読み取り専用のテーブルのようなインターフェースを Amazon S3 で提供します。'
sidebar_label: 'hudi'
sidebar_position: 85
slug: /sql-reference/table-functions/hudi
title: 'hudi'
---


# hudi テーブル関数

Amazon S3 で Apache [Hudi](https://hudi.apache.org/) テーブルへの読み取り専用のテーブルのようなインターフェースを提供します。

## 構文 {#syntax}

```sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 引数 {#arguments}

- `url` — S3 内の既存の Hudi テーブルへのパスを含むバケットの URL。
- `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) アカウントユーザーの長期的な資格情報。これを使用してリクエストを認証できます。これらのパラメータはオプションです。資格情報が指定されていない場合、ClickHouse 設定から使用されます。詳細については、[データストレージに S3 を使用する](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)を参照してください。
- `format` — ファイルの[形式](/interfaces/formats)。
- `structure` — テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。
- `compression` — このパラメータはオプションです。サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、圧縮はファイル拡張子によって自動的に検出されます。

**返される値**

指定された Hudi テーブルのデータを読み取るための指定された構造のテーブル。

**関連情報**

- [Hudi エンジン](/engines/table-engines/integrations/hudi.md)
- [Hudi クラスター テーブル関数](/sql-reference/table-functions/hudiCluster.md)
