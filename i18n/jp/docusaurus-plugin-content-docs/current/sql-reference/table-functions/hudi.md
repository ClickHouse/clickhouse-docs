---
slug: /sql-reference/table-functions/hudi
sidebar_position: 85
sidebar_label: hudi
title: "hudi"
description: "Amazon S3にあるApache Hudiテーブルへの読み取り専用のテーブルのようなインターフェースを提供します。"
---


# hudi テーブル関数

Amazon S3にあるApache [Hudi](https://hudi.apache.org/)テーブルへの読み取り専用のテーブルのようなインターフェースを提供します。

## 構文 {#syntax}

``` sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 引数 {#arguments}

- `url` — S3にある既存のHudiテーブルへのパスを含むバケットのURL。
- `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/)アカウントユーザーの長期資格情報。リクエストの認証に使用できます。これらのパラメータはオプションです。資格情報が指定されていない場合は、ClickHouseの設定から使用されます。詳細については[Using S3 for Data Storage](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)を参照してください。
- `format` — ファイルの[フォーマット](/interfaces/formats)。
- `structure` — テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'`。
- `compression` — パラメーターはオプションです。サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、圧縮はファイル拡張子によって自動検出されます。

**返される値**

指定されたHudiテーブルからデータを読み取るための指定された構造のテーブル。

**関連情報**

- [Hudiエンジン](/engines/table-engines/integrations/hudi.md)
- [Hudiクラスター テーブル関数](/sql-reference/table-functions/hudiCluster.md)
