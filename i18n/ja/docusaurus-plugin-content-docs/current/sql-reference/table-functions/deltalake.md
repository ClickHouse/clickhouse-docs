---
slug: /sql-reference/table-functions/deltalake
sidebar_position: 45
sidebar_label: deltaLake
---

# deltaLake テーブル関数

Amazon S3 にある [Delta Lake](https://github.com/delta-io/delta) テーブルへの読み取り専用のテーブルライクインターフェースを提供します。

## 構文 {#syntax}

``` sql
deltaLake(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 引数 {#arguments}

- `url` — S3 に存在する Delta Lake テーブルへのパスを含むバケットの URL。
- `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) アカウントユーザーの長期クレデンシャル。これらを使用してリクエストを認証できます。このパラメータはオプションです。クレデンシャルが指定されていない場合、ClickHouse の設定から使用されます。詳細については、[Using S3 for Data Storage](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)を参照してください。
- `format` — ファイルの [形式](/interfaces/formats.md/#formats)。
- `structure` — テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。
- `compression` — パラメータはオプションです。サポートされる値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、圧縮はファイル拡張子によって自動検出されます。

**返される値**

指定された構造のテーブルを返し、指定された Delta Lake テーブルにおけるデータの読み取りを行います。

**例**

S3 上のテーブル `https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/` から行を選択します:

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

**参照**

- [DeltaLake エンジン](/engines/table-engines/integrations/deltalake.md)
- [DeltaLake クラスターテーブル関数](/sql-reference/table-functions/deltalakeCluster.md)
