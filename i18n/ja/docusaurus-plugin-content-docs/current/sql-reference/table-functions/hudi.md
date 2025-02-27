---
slug: /sql-reference/table-functions/hudi
sidebar_position: 85
sidebar_label: hudi
---

# hudi テーブル関数

Apache [Hudi](https://hudi.apache.org/) テーブルに対する読み取り専用のテーブルライクインターフェースを、Amazon S3に提供します。

## 構文 {#syntax}

``` sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 引数 {#arguments}

- `url` — S3内の既存のHudiテーブルへのパスを含むバケットのURL。
- `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) アカウントユーザーの長期的な認証情報。これを使用してリクエストを認証できます。これらのパラメータはオプションです。認証情報が指定されていない場合、ClickHouseの設定から使用されます。詳細については、[データストレージにS3を使用する](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) を参照してください。
- `format` — ファイルの[フォーマット](/interfaces/formats.md/#formats)。
- `structure` — テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'`。
- `compression` — このパラメータはオプションです。サポートされる値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、圧縮はファイル拡張子によって自動検出されます。

**返される値**

指定されたHudiテーブル内のデータを読み取るための、指定された構造のテーブル。

**関連情報**

- [Hudiエンジン](/engines/table-engines/integrations/hudi.md)
- [Hudiクラスターテーブル関数](/sql-reference/table-functions/hudiCluster.md)
