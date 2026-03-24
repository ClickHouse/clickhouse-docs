---
title: 'MergeTree による分析の高速化'
sidebar_label: 'クエリの高速化'
slug: /use-cases/data-lake/getting-started/accelerating-analytics
sidebar_position: 3
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/guides/connecting-catalogs
pagination_next: use-cases/data_lake/guides/writing-data
description: 'オープンテーブル形式から ClickHouse MergeTree テーブルにデータを読み込み、分析クエリを大幅に高速化します。'
keywords: ['データレイク', 'レイクハウス', 'MergeTree', '高速化', '分析', '転置索引', '全文索引', 'INSERT INTO SELECT']
doc_type: 'guide'
---

[前のセクション](/use-cases/data-lake/getting-started/connecting-catalogs)では、ClickHouse をデータカタログに接続し、オープンテーブル形式を直接クエリしました。保存先のままデータをクエリできるのは便利ですが、オープンテーブル形式は、ダッシュボードや運用レポートを支える低レイテンシかつ高並行性のワークロード向けには最適化されていません。こうしたユースケースでは、ClickHouse の [MergeTree](/engines/table-engines/mergetree-family/mergetree) エンジンにデータを読み込むことで、はるかに高いパフォーマンスを得られます。

MergeTree には、オープンテーブル形式を直接読み取る場合と比べて、いくつかの利点があります。

* **[スパースプライマリ索引](/guides/best-practices/sparse-primary-indexes)** - 選択したキーに基づいてディスク上のデータを並べ替えることで、クエリ時に無関係な広い範囲の行を ClickHouse がスキップできるようにします。
* **強化されたデータ型** - [JSON](/best-practices/use-json-where-appropriate)、[LowCardinality](/sql-reference/data-types/lowcardinality)、[Enum](/sql-reference/data-types/enum) などの型をネイティブにサポートし、よりコンパクトな保存と高速な処理を実現します。
* **[スキップ索引](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-data_skipping-indexes)** と **[全文索引](/engines/table-engines/mergetree-family/textindexes)** - クエリのフィルタ述語に一致しないグラニュールを ClickHouse がスキップできるようにする二次索引構造で、特にテキスト検索ワークロードで効果を発揮します。
* **自動コンパクションを伴う高速 INSERT** - ClickHouse は高スループットの INSERT 向けに設計されており、バックグラウンドでデータパーツを自動的にマージします。これは、オープンテーブル形式における compaction に相当します。
* **同時読み取り向けに最適化** - MergeTree の列指向ストレージレイアウトは、[複数のキャッシュレイヤー](/operations/caches) と組み合わせることで、高い並行性を伴うリアルタイム分析ワークロードをサポートします。これは、オープンテーブル形式が想定していない特性です。

このガイドでは、高速な分析のために、`INSERT INTO SELECT` を使用してカタログから MergeTree テーブルへデータを読み込む方法を示します。

## カタログに接続する \{#connect-catalog\}

[前回のガイド](/use-cases/data-lake/getting-started/connecting-catalogs)と同じ Unity Catalog の接続を使用し、Iceberg REST エンドポイント経由で接続します。

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg-rest')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace',
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql';
```

### テーブル一覧を表示する \{#list-tables\}

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

このテーブルには、ClickHouse の CI テスト実行による約2億8,300万行のログが含まれており、分析性能を検証するための現実的なデータセットとなっています。

```sql
SELECT count()
FROM unity.`icebench.single_day_log`

┌───count()─┐
│ 282634391 │ -- 282.63 million
└───────────┘

1 row in set. Elapsed: 1.265 sec.
```

## データレイクテーブルに対してクエリを実行する \{#query-lakehouse\}

スレッド名とインスタンスタイプでログをフィルタリングし、メッセージテキスト内のエラーを検索し、結果をロガーごとにグループ化するクエリを実行します。

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

このクエリに**9秒近く**かかるのは、ClickHouse がオブジェクトストレージ内のすべての Parquet ファイルを対象に、テーブル全体のスキャンを実行する必要があるためです。パーティション化によってパフォーマンスを改善できる可能性はありますが、`logger_name` のようなカラムはカーディナリティが高すぎて、効果的にパーティション化できない場合があります。また、データをさらに絞り込むための [テキストインデックス](/engines/table-engines/mergetree-family/mergetree#text) のようなインデックスもありません。こうした場面で MergeTree が真価を発揮します。

## MergeTree にデータを読み込む \{#load-data\}

### 最適化されたテーブルを作成する \{#create-table\}

スキーマを最適化するための工夫を加えた MergeTree テーブルを作成します。Iceberg スキーマとの主な違いとして、次の点に注目してください。

* **`Nullable` ラッパーを使用しない** - `Nullable` を取り除くことで、ストレージ効率とクエリ性能が向上します。
* **`level`、`instance_type`、`thread_name`、`check_name` の各カラムに `LowCardinality(String)` を使用** - 異なる値が少ないカラムを Dictionary エンコードし、圧縮率を高めるとともにフィルタリングを高速化します。
* **`message` カラムの [全文索引](/engines/table-engines/mergetree-family/textindexes)** - `hasToken(message, 'error')` のようなトークンベースのテキスト検索を高速化します。
* **`(instance_type, thread_name, toStartOfMinute(event_time))` の `ORDER BY` キー** - 一般的なフィルタパターンに合わせてディスク上のデータを配置し、[スパースプライマリ索引](/guides/best-practices/sparse-primary-indexes) が無関係なグラニュールをスキップできるようにします。

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

`INSERT INTO SELECT` を使用して、データレイクテーブルから約3億件のデータを ClickHouse のテーブルに読み込みます。

```sql
INSERT INTO single_day_log SELECT * FROM icebench.`icebench.single_day_log`

282634391 rows in set. Elapsed: 237.680 sec. Processed 282.63 million rows, 5.42 GB (1.19 million rows/s., 22.79 MB/s.)
Peak memory usage: 18.62 GiB.
```

## クエリを再実行する \{#reexecute-query\}

ここで同じクエリをMergeTreeテーブルに対して実行すると、パフォーマンスが大幅に向上することがわかります。

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

同じクエリは **0.22 秒** で完了するようになり、**約 40 倍高速化** されています。この改善をもたらしている主な最適化は 2 つあります。

* **スパースな主索引** - `ORDER BY (instance_type, thread_name, ...)` キーにより、ClickHouse は `instance_type = 'm6i.4xlarge'` と `thread_name = 'TCPHandler'` に一致するグラニュールへ直接スキップでき、処理対象の行数を 2 億 8,300 万行からわずか 1,400 万行まで削減できます。
* **全文索引** - `message` カラム上の `text_idx` 索引により、`hasToken(message, 'error')` はすべてのメッセージ文字列を走査するのではなく索引を使って評価できるため、ClickHouse が読み取る必要のあるデータをさらに減らせます。

その結果、このクエリはリアルタイムダッシュボードを十分に支えられる性能を発揮します。しかも、そのスケールとレイテンシは、オブジェクトストレージ上の Parquet ファイルをクエリする方法では実現できません。
