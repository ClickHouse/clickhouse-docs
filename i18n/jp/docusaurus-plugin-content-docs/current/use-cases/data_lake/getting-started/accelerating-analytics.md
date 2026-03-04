---
title: 'MergeTree による分析の高速化'
sidebar_label: 'クエリの高速化'
slug: /use-cases/data-lake/getting-started/accelerating-analytics
sidebar_position: 3
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/getting-started/connecting-catalogs
pagination_next: use-cases/data_lake/getting-started/writing-data
description: 'オープンなテーブルフォーマットから ClickHouse の MergeTree テーブルにデータをロードして、分析クエリを劇的に高速化します。'
keywords: ['data lake', 'lakehouse', 'MergeTree', 'accelerate', 'analytics', 'inverted index', 'full-text index', 'INSERT INTO SELECT']
doc_type: 'guide'
---

[前のセクション](/use-cases/data-lake/getting-started/connecting-catalogs)では、ClickHouse をデータカタログに接続し、オープンなテーブルフォーマットに直接クエリを実行しました。データをその場でクエリできるのは便利ですが、レイクハウスフォーマットはダッシュボードや運用レポーティングを支える、低レイテンシかつ高い同時実行性が求められるワークロード向けには最適化されていません。これらのユースケースでは、データを ClickHouse の [MergeTree](/engines/table-engines/mergetree-family/mergetree) エンジンにロードすることで、性能を劇的に向上できます。

MergeTree には、オープンなテーブルフォーマットを直接読み取る場合と比較して、次のような利点があります:

- **[Sparse primary index](/optimize/sparse-primary-indexes)** - 選択したキーでディスク上のデータを並べ替えて配置し、クエリ時に ClickHouse が不要な行の大きな範囲をスキップできるようにします。
- **強化されたデータ型** - [JSON](/sql-reference/data-types/json)、[LowCardinality](/sql-reference/data-types/lowcardinality)、[Enum](/sql-reference/data-types/enum) などの型をネイティブにサポートし、よりコンパクトな保存と高速な処理を可能にします。
- **[Skip indices](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-data_skipping-indexes)** と **[full-text indices](/engines/table-engines/mergetree-family/invertedindexes)** - ClickHouse がクエリのフィルタ条件と一致しない granule をスキップできるセカンダリの索引構造であり、特にテキスト検索ワークロードに有効です。
- **自動コンパクション付き高速挿入** - ClickHouse は高スループットな挿入向けに設計されており、バックグラウンドでデータパーツを自動的にマージします。これはオープンなテーブルフォーマットにおけるコンパクションに相当します。
- **同時読み取りに最適化** - MergeTree の列指向ストレージレイアウトは、[複数のキャッシュレイヤー](/operations/caches)と組み合わせることで、高い同時実行性を持つリアルタイム分析ワークロードをサポートします。一方で、オープンなテーブルフォーマットはこうした用途を想定して設計されていません。

このガイドでは、分析クエリを高速化するために、カタログから MergeTree テーブルに `INSERT INTO SELECT` を使ってデータをロードする方法を説明します。

## カタログに接続する \{#connect-catalog\}

[前のガイド](/use-cases/data-lake/getting-started/connecting-catalogs)と同じ Unity Catalog 接続を使用して、Iceberg REST エンドポイント経由で接続します。

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg-rest')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace',
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql';
```


### テーブル一覧 \{#list-tables\}

```sql
SHOW TABLES FROM unity

┌─name───────────────────────────────────────────────┐
│ unity.logs                                         │
│ unity.single_day_log                               │
└────────────────────────────────────────────────────┘
```


### スキーマを確認する \{#explore-schema\}

```sql
SHOW CREATE TABLE unity.`icebench.single_day_log`

CREATE TABLE unity.`icebench.single_day_log`
(
    `pull_request_number` Nullable(Int64),
    `commit_sha` Nullable(String),
    `check_start_time` Nullable(DateTime64(6, 'UTC')),
    `check_name` Nullable(String),
    `instance_type` Nullable(String),
    `instance_id` Nullable(String),
    `event_date` Nullable(Date32),
    `event_time` Nullable(DateTime64(6, 'UTC')),
    `event_time_microseconds` Nullable(DateTime64(6, 'UTC')),
    `thread_name` Nullable(String),
    `thread_id` Nullable(Decimal(20, 0)),
    `level` Nullable(String),
    `query_id` Nullable(String),
    `logger_name` Nullable(String),
    `message` Nullable(String),
    `revision` Nullable(Int64),
    `source_file` Nullable(String),
    `source_line` Nullable(Decimal(20, 0)),
    `message_format_string` Nullable(String)
)
ENGINE = Iceberg('s3://...')
```

このテーブルには、ClickHouse の CI テスト実行から得られた約 2 億 8,300 万行のログが含まれており、分析パフォーマンスを検証するのに適した現実的なデータセットとなっています。

```sql
SELECT count()
FROM unity.`icebench.single_day_log`

┌───count()─┐
│ 282634391 │ -- 282.63 million
└───────────┘

1 row in set. Elapsed: 1.265 sec.
```


## レイクハウステーブルに対するクエリ \{#query-lakehouse\}

スレッド名とインスタンスタイプでログをフィルタし、メッセージテキスト内のエラーを検索し、`logger` ごとに結果をグループ化するクエリを実行します。

```sql
SELECT
    logger_name,
    count() AS c
FROM icebench.`icebench.single_day_log`
WHERE (thread_name = 'TCPHandler')
    AND (instance_type = 'm6i.4xlarge')
    AND hasToken(message, 'error')
GROUP BY logger_name
ORDER BY c DESC
LIMIT 5

┌─logger_name──────────────┬────c─┐
│ executeQuery             │ 6907 │
│ TCPHandler               │ 4145 │
│ TCP-Session              │  790 │
│ PostgreSQLConnectionPool │  530 │
│ ContextAccess (default)  │  392 │
└──────────────────────────┴──────┘

5 rows in set. Elapsed: 8.921 sec. Processed 282.63 million rows, 5.42 GB (31.68 million rows/s., 607.26 MB/s.)
Peak memory usage: 4.35 GiB.
```

このクエリは、オブジェクトストレージ内のすべての Parquet ファイルに対して ClickHouse がフルテーブルスキャンを実行する必要があるため、実行に約 **9 秒** を要します。パーティション分割を行えばパフォーマンスを改善できますが、`logger_name` のようなカラムはカーディナリティが高すぎて、パーティションキーとしては効果的でない可能性があります。さらに、データをより絞り込むための [Text indices](/engines/table-engines/mergetree-family/mergetree#text) のようなインデックスも定義されていません。ここで MergeTree が真価を発揮します。


## MergeTree にデータを読み込む \{#load-data\}

### 最適化されたテーブルを作成する \{#create-table\}

スキーマを最適化するために、いくつか工夫を施した MergeTree テーブルを作成します。Iceberg のスキーマと比較すると、いくつかの重要な違いがあります。

* **`Nullable` ラッパーを使用しない** - `Nullable` を削除すると、ストレージ効率とクエリのパフォーマンスが向上します。
* **`level`、`instance_type`、`thread_name`、`check_name` カラムに対する `LowCardinality(String)`** - 値の種類が少ないカラムを辞書エンコードし、圧縮率の向上とフィルタリングの高速化を実現します。
* **`message` カラムに対する[全文テキスト索引](/engines/table-engines/mergetree-family/invertedindexes)** - `hasToken(message, 'error')` のようなトークンベースのテキスト検索を高速化します。
* **`(instance_type, thread_name, toStartOfMinute(event_time))` の `ORDER BY` キー** - ディスク上のデータ配置をよく使われるフィルタパターンに合わせることで、[スパースなプライマリ索引](/guides/best-practices/sparse-primary-indexes)が不要なグラニュールをスキップできるようにします。

```sql
SET enable_full_text_index = 1;

CREATE TABLE single_day_log
(
    `pull_request_number` Int64,
    `commit_sha` String,
    `check_start_time` DateTime64(6, 'UTC'),
    `check_name` LowCardinality(String),
    `instance_type` LowCardinality(String),
    `instance_id` String,
    `event_date` Date32,
    `event_time` DateTime64(6, 'UTC'),
    `event_time_microseconds` DateTime64(6, 'UTC'),
    `thread_name` LowCardinality(String),
    `thread_id` Decimal(20, 0),
    `level` LowCardinality(String),
    `query_id` String,
    `logger_name` String,
    `message` String,
    `revision` Int64,
    `source_file` String,
    `source_line` Decimal(20, 0),
    `message_format_string` String,
    INDEX text_idx(message) TYPE text(tokenizer = splitByNonAlpha)
)
ENGINE = MergeTree
ORDER BY (instance_type, thread_name, toStartOfMinute(event_time))
```


### カタログからデータを挿入する \{#insert-data\}

`INSERT INTO SELECT` を使用して、レイクハウスのテーブルから約 3 億件の行を ClickHouse テーブルにロードします。

```sql
INSERT INTO single_day_log SELECT * FROM icebench.`icebench.single_day_log`

282634391 rows in set. Elapsed: 237.680 sec. Processed 282.63 million rows, 5.42 GB (1.19 million rows/s., 22.79 MB/s.)
Peak memory usage: 18.62 GiB.
```


## クエリを再実行する \{#reexecute-query\}

同じクエリを MergeTree テーブルに対して再度実行すると、パフォーマンスが劇的に向上していることが確認できます。

```sql
SELECT
    logger_name,
    count() AS c
FROM single_day_log
WHERE (thread_name = 'TCPHandler')
    AND (instance_type = 'm6i.4xlarge')
    AND hasToken(message, 'error')
GROUP BY logger_name
ORDER BY c DESC
LIMIT 5

┌─logger_name──────────────┬────c─┐
│ executeQuery             │ 6907 │
│ TCPHandler               │ 4145 │
│ TCP-Session              │  790 │
│ PostgreSQLConnectionPool │  530 │
│ ContextAccess (default)  │  392 │
└──────────────────────────┴──────┘

5 rows in set. Elapsed: 0.220 sec. Processed 13.84 million rows, 2.85 GB (62.97 million rows/s., 12.94 GB/s.)
Peak memory usage: 1.12 GiB.
```

同じクエリが現在では **0.22 秒** で完了し、**約 40 倍の高速化** が得られています。これは、次の 2 つの重要な最適化によってもたらされています。

* **スパースなプライマリ索引** - `ORDER BY (instance_type, thread_name, ...)` キーにより、ClickHouse は `instance_type = 'm6i.4xlarge'` および `thread_name = 'TCPHandler'` に一致する granule に直接スキップでき、処理される行数を 2 億 8300 万行からわずか 1400 万行まで削減できます。
* **全文索引** - `message` カラム上の `text_idx` 索引により、`hasToken(message, 'error')` をすべての message 文字列をスキャンするのではなく索引経由で解決できるため、ClickHouse が読み取る必要のあるデータ量をさらに削減します。

その結果、このクエリはリアルタイムダッシュボードを余裕を持って駆動できるようになり、オブジェクトストレージ上の Parquet ファイルへのクエリでは実現できないスケールとレイテンシ特性を備えます。
