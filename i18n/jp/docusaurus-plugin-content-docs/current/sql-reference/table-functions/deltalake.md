---
slug: /sql-reference/table-functions/deltalake
sidebar_position: 45
sidebar_label: deltaLake
title: "deltaLake"
description: "Amazon S3 の Delta Lake テーブルに対する読み取り専用のテーブルライクインターフェースを提供します。"
---


# deltaLake テーブル関数

Amazon S3 の [Delta Lake](https://github.com/delta-io/delta) テーブルに対する読み取り専用のテーブルライクインターフェースを提供します。

## 構文 {#syntax}

``` sql
deltaLake(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 引数 {#arguments}

- `url` — S3 内の既存の Delta Lake テーブルへのパスを含むバケット URL。
- `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) アカウントユーザーの長期的な資格情報。これらを使用してリクエストを認証できます。これらのパラメータはオプションです。資格情報が指定されていない場合、ClickHouse 設定から使用されます。詳細については、[S3 をデータストレージとして使用する](engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)を参照してください。
- `format` — ファイルの [フォーマット](/interfaces/formats)。
- `structure` — テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'`。
- `compression` — パラメータはオプションです。サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、圧縮はファイル拡張子で自動検出されます。

**返される値**

指定された Delta Lake テーブルの指定された構造でデータを読み取るためのテーブル。

**例**

S3 のテーブル `https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/` から行を選択します：

``` sql
SELECT
    URL,
    UserAgent
FROM deltaLake('https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/')
WHERE URL IS NOT NULL
LIMIT 2
```

``` response
┌─URL───────────────────────────────────────────────────────────────────┬─UserAgent─┐
│ http://auto.ria.ua/search/index.kz/jobinmoscow/detail/55089/hasimages │         1 │
│ http://auto.ria.ua/search/index.kz/jobinmoscow.ru/gosushi             │         1 │
└───────────────────────────────────────────────────────────────────────┴───────────┘
```

**関連情報**

- [DeltaLake エンジン](engines/table-engines/integrations/deltalake.md)
- [DeltaLake クラスターテーブル関数](sql-reference/table-functions/deltalakeCluster.md)
