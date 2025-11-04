---
'description': 'Amazon S3 における Delta Lake テーブルへの読み取り専用テーブルのようなインターフェースを提供します。'
'sidebar_label': 'deltaLake'
'sidebar_position': 45
'slug': '/sql-reference/table-functions/deltalake'
'title': 'deltaLake'
'doc_type': 'reference'
---


# deltaLake テーブル関数

Amazon S3、Azure Blob Storage、またはローカルにマウントされたファイルシステムでの [Delta Lake](https://github.com/delta-io/delta) テーブルに対する読み取り専用のテーブルのようなインターフェースを提供します。

## 構文 {#syntax}

`deltaLake` は `deltaLakeS3` の別名であり、互換性のためにサポートされています。

```sql
deltaLake(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeS3(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

deltaLakeLocal(path, [,format])
```

## 引数 {#arguments}

引数の説明は、テーブル関数 `s3`、`azureBlobStorage`、`HDFS` および `file` の引数の説明と一致します。`format` は Delta Lake テーブル内のデータファイルの形式を示します。

## 戻り値 {#returned_value}

指定された Delta Lake テーブルからデータを読み取るための指定された構造のテーブル。

## 例 {#examples}

S3 `https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/` からのテーブルの行を選択する：

```sql
SELECT
    URL,
    UserAgent
FROM deltaLake('https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/')
WHERE URL IS NOT NULL
LIMIT 2
```

```response
┌─URL───────────────────────────────────────────────────────────────────┬─UserAgent─┐
│ http://auto.ria.ua/search/index.kz/jobinmoscow/detail/55089/hasimages │         1 │
│ http://auto.ria.ua/search/index.kz/jobinmoscow.ru/gosushi             │         1 │
└───────────────────────────────────────────────────────────────────────┴───────────┘
```

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルサイズ（バイト単位)。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終変更時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
- `_etag` — ファイルのetag。型: `LowCardinality(String)`。etagが不明な場合、値は `NULL` です。

## 関連 {#related}

- [DeltaLake エンジン](engines/table-engines/integrations/deltalake.md)
- [DeltaLake クラスタテーブル関数](sql-reference/table-functions/deltalakeCluster.md)
