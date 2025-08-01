---
description: 'Amazon S3内のApache Hudiテーブルに対する読み取り専用のテーブルのようなインターフェースを提供します。'
sidebar_label: 'hudi'
sidebar_position: 85
slug: '/sql-reference/table-functions/hudi'
title: 'hudi'
---




# hudi テーブル関数

Amazon S3 の Apache [Hudi](https://hudi.apache.org/) テーブルに対する読み取り専用のテーブルのようなインターフェースを提供します。

## 構文 {#syntax}

```sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 引数 {#arguments}

| 引数                                         | 説明                                                                                                                                                                                                                                                                                                                                                                                                |
|----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                                        | S3 にある既存の Hudi テーブルへのパスを持つバケット URL。                                                                                                                                                                                                                                                                                                                                           |
| `aws_access_key_id`, `aws_secret_access_key` | [AWS](https://aws.amazon.com/) アカウントユーザーの長期的な認証情報。これらを使用してリクエストを認証できます。これらのパラメータはオプションです。認証情報が指定されていない場合は、ClickHouse の設定から使用されます。詳細については、[Using S3 for Data Storage](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) を参照してください。     |
| `format`                                     | ファイルの[format](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                                                           |
| `structure`                                  | テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                                              |
| `compression`                                | パラメータはオプションです。サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、圧縮はファイル拡張子によって自動検出されます。                                                                                                                                                                                                                       |

## 戻り値 {#returned_value}

指定された S3 の Hudi テーブル内のデータを読み取るための指定された構造のテーブル。

## 関連 {#related}

- [Hudi エンジン](/engines/table-engines/integrations/hudi.md)
- [Hudi クラスタ テーブル関数](/sql-reference/table-functions/hudiCluster.md)
