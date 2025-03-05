---
slug: /sql-reference/table-functions/hudi
sidebar_position: 85
sidebar_label: hudi
title: "hudi"
description: "Amazon S3のApache Hudiテーブルへの読み取り専用のテーブルライクインターフェイスを提供します。"
---


# hudi テーブル関数

Amazon S3のApache [Hudi](https://hudi.apache.org/) テーブルへの読み取り専用のテーブルライクインターフェイスを提供します。

## 文法 {#syntax}

``` sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 引数 {#arguments}

- `url` — S3内の既存のHudiテーブルへのパスを持つバケットのURL。
- `aws_access_key_id`、`aws_secret_access_key` - [AWS](https://aws.amazon.com/) アカウントユーザーの長期的なクレデンシャル。これらを使用してリクエストを認証できます。これらのパラメータはオプションです。クレデンシャルが指定されていない場合、ClickHouseの設定から使用されます。詳細については、[S3をデータストレージに使用する](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)を参照してください。
- `format` — ファイルの[フォーマット](/interfaces/formats.md/#formats)。
- `structure` — テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'`。
- `compression` — パラメータはオプションです。サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、圧縮はファイル拡張子により自動検出されます。

**返される値**

指定されたHudiテーブルからデータを読み取るための指定された構造のテーブル。

**関連情報**

- [Hudiエンジン](/engines/table-engines/integrations/hudi.md)
- [Hudiクラスターテーブル関数](/sql-reference/table-functions/hudiCluster.md)
