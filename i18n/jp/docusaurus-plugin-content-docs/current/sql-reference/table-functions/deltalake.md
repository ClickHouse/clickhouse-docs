---
description: 'Amazon S3 上の Delta Lake テーブルに対して、読み取り専用のテーブルのようなインターフェイスを提供します。'
sidebar_label: 'deltaLake'
sidebar_position: 45
slug: /sql-reference/table-functions/deltalake
title: 'deltaLake'
doc_type: 'reference'
---

# deltaLake テーブル関数 \{#deltalake-table-function\}

Amazon S3、Azure Blob Storage、またはローカルにマウントされたファイルシステムにある [Delta Lake](https://github.com/delta-io/delta) テーブルに対して、読み書き両方（v25.10 以降）をサポートするテーブル形式インターフェイスを提供します。

## 構文 \{#syntax\}

`deltaLake` は `deltaLakeS3` のエイリアスであり、互換性維持のために提供されています。

```sql
deltaLake(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeS3(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

deltaLakeLocal(path, [,format])
```


## 引数 \{#arguments\}

引数の説明は、それぞれ `s3`、`azureBlobStorage`、`HDFS`、`file` のテーブル関数における引数の説明と同じです。  
`format` 引数は、Delta Lake テーブル内のデータファイルのフォーマットを指定します。

## 返される値 \{#returned_value\}

指定した Delta Lake テーブルとの間でデータを読み書きするための、指定した構造を持つテーブル。

## 例 \{#examples\}

### データの読み取り \{#reading-data\}

S3 上のテーブル `https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/` を考えます。
ClickHouse でこのテーブルからデータを読み取るには、次のコマンドを実行します:

```sql title="Query"
SELECT
    URL,
    UserAgent
FROM deltaLake('https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/')
WHERE URL IS NOT NULL
LIMIT 2
```

```response title="Response"
┌─URL───────────────────────────────────────────────────────────────────┬─UserAgent─┐
│ http://auto.ria.ua/search/index.kz/jobinmoscow/detail/55089/hasimages │         1 │
│ http://auto.ria.ua/search/index.kz/jobinmoscow.ru/gosushi             │         1 │
└───────────────────────────────────────────────────────────────────────┴───────────┘
```


### データの挿入 \{#inserting-data\}

`S3` ストレージ上の `s3://ch-docs-s3-bucket/people_10k/` にあるテーブルを例に考えます。
このテーブルにデータを挿入するには、まず実験的機能を有効にします。

```sql
SET allow_experimental_delta_lake_writes=1
```

次に、以下のように記述します：

```sql title="Query"
INSERT INTO TABLE FUNCTION deltaLake('s3://ch-docs-s3-bucket/people_10k/', '<access_key>', '<secret>') VALUES (10001, 'John', 'Smith', 'Male', 30)
```

```response title="Response"
Query id: 09069b47-89fa-4660-9e42-3d8b1dde9b17

Ok.

1 row in set. Elapsed: 3.426 sec.
```

挿入が正しく行われたかは、テーブルを再度読み込んで確認できます。

```sql title="Query"
SELECT *
FROM deltaLake('s3://ch-docs-s3-bucket/people_10k/', '<access_key>', '<secret>')
WHERE (firstname = 'John') AND (lastname = 'Smith')
```

```response title="Response"
Query id: 65032944-bed6-4d45-86b3-a71205a2b659

   ┌────id─┬─firstname─┬─lastname─┬─gender─┬─age─┐
1. │ 10001 │ John      │ Smith    │ Male   │  30 │
   └───────┴───────────┴──────────┴────────┴─────┘
```


## 仮想カラム \{#virtual-columns\}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルサイズ（バイト単位）。型: `Nullable(UInt64)`。ファイルサイズが不明な場合は `NULL`。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合は `NULL`。
- `_etag` — ファイルの ETag。型: `LowCardinality(String)`。ETag が不明な場合は `NULL`。

## 関連項目 \{#related\}

- [DeltaLake エンジン](engines/table-engines/integrations/deltalake.md)
- [DeltaLake クラスターテーブル関数](sql-reference/table-functions/deltalakeCluster.md)