---
slug: /data-modeling/backfilling
title: バックフィリングデータ
description: ClickHouseで大規模データセットをバックフィルする方法
keywords: [マテリアライズドビュー, バックフィリング, データ挿入, レジリエントデータロード]
---

import nullTableMV from '@site/static/images/data-modeling/null_table_mv.png';

# バックフィリングデータ

ClickHouseを初めて使う方でも、既存のデプロイメントを管理している方でも、ユーザーは歴史的データでテーブルをバックフィルする必要が必ずあります。場合によってはこれが比較的簡単ですが、マテリアライズドビューにデータを格納する必要がある場合は、さらに複雑になることがあります。このガイドでは、ユーザーが自分のユースケースに適用できるいくつかのプロセスを文書化しています。

:::note
このガイドは、ユーザーがすでに [インクリメンタルマテリアライズドビュー](/materialized-view/incremental-materialized-view) および [S3やGCSなどのテーブル関数を使用したデータロード](/integrations/s3)の概念に親しんでいることを前提としています。また、データ挿入全般にわたって適用できるアドバイスを含む、 [オブジェクトストレージからの挿入パフォーマンスの最適化に関するガイド](/integrations/s3/performance)を読むことをお勧めします。
:::
## サンプルデータセット {#example-dataset}

このガイド全体で、我々はPyPIデータセットを使用します。このデータセットの各行は、`pip`のようなツールを使用したPythonパッケージのダウンロードを表します。

たとえば、このサブセットは1日（`2024-12-17`）を対象としており、 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/` で公開されています。ユーザーは次のクエリを使用して確認できます：

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 20.40億
└────────────┘

1行の結果。経過時間: 32.726秒。 処理した行数: 20.40億、170.05 KB (62.34百万行/秒、5.20 KB/秒)
ピークメモリ使用量: 239.50 MiB.
```

このバケットに含まれるフルデータセットは、320 GB以上のパーケットファイルから構成されています。以下の例では、あえてグロブパターンを使用してサブセットをターゲットにします。

ユーザーは、たとえばKafkaやオブジェクトストレージからこのデータのストリームを消費していると仮定します。この日の後のデータについてです。このデータのスキーマは以下の通りです。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')
FORMAT PrettyCompactNoEscapesMonoBlock
SETTINGS describe_compact_output = 1

┌─name───────────────┬─type────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ timestamp │ Nullable(DateTime64(6))                                                                                                                 │
│ country_code       │ Nullable(String)                                                                                                                        │
│ url │ Nullable(String)                                                                                                                        │
│ project            │ Nullable(String)                                                                                                                        │
│ file │ Tuple(filename Nullable(String), project Nullable(String), version Nullable(String), type Nullable(String))                             │
│ installer          │ Tuple(name Nullable(String), version Nullable(String))                                                                                  │
│ python             │ Nullable(String)                                                                                                                        │
│ implementation     │ Tuple(name Nullable(String), version Nullable(String))                                                                                  │
│ distro             │ Tuple(name Nullable(String), version Nullable(String), id Nullable(String), libc Tuple(lib Nullable(String), version Nullable(String))) │
│ system │ Tuple(name Nullable(String), release Nullable(String))                                                                                  │
│ cpu                │ Nullable(String)                                                                                                                        │
│ openssl_version    │ Nullable(String)                                                                                                                        │
│ setuptools_version │ Nullable(String)                                                                                                                        │
│ rustc_version      │ Nullable(String)                                                                                                                        │
│ tls_protocol       │ Nullable(String)                                                                                                                        │
│ tls_cipher         │ Nullable(String)                                                                                                                        │
└────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

:::note
フルPyPIデータセットは、1兆行以上から構成されており、私たちのパブリックデモ環境 [clickpy.clickhouse.com](https://clickpy.clickhouse.com) で利用可能です。このデータセットに関する詳しい情報、特にデモがパフォーマンスのためにマテリアライズドビューをどのように利用しているか、データが毎日どのように流入しているかについては [こちら](https://github.com/ClickHouse/clickpy) を参照してください。
:::
## バックフィリングシナリオ {#backfilling-scenarios}

バックフィリングは、通常、時点からデータのストリームを消費している場合に必要です。このデータは、[インクリメンタルマテリアライズドビュー](/materialized-view/incremental-materialized-view)とともにClickHouseテーブルに挿入され、ブロックが挿入されるたびにトリガーされます。これらのビューは、挿入前にデータを変換したり、集約を計算して、後のアプリケーションで使用するためにターゲットテーブルに結果を送信したりする場合があります。

以下のシナリオをカバーしようと思います：

1. **既存のデータ取り込みでのデータのバックフィル** - 新しいデータがロードされており、歴史的データのバックフィルが必要です。この歴史的データは特定されています。
2. **既存のテーブルへのマテリアライズドビューの追加** - 新しいマテリアライズドビューを、歴史的データがすでに充填された設定に追加する必要があります。

すべてのケースで、データがオブジェクトストレージからバックフィルされると仮定します。この過程では、データ挿入に一時停止がないように目指します。

我々は、歴史的データはオブジェクトストレージからバックフィルすることをお勧めします。最適な読み取りパフォーマンスと圧縮（ネットワーク転送の削減）のために、できる限りデータはパーケット形式でエクスポートされるべきです。ファイルサイズは約150MBが通常好まれますが、ClickHouseは [70以上のファイル形式](/interfaces/formats) をサポートしており、あらゆるサイズのファイルを処理できます。
## 重複テーブルとビューの使用 {#using-duplicate-tables-and-views}

すべてのシナリオにおいて、私たちは「重複テーブルとビュー」という概念に依存しています。これらのテーブルとビューは、ライブストリーミングデータに使用されるもののコピーを表しており、バックフィルを単独で実行することを可能にし、失敗が発生した場合には簡単に回復できる手段を提供します。例えば、以下のような主な `pypi` テーブルとマテリアライズドビューがあります。これは、各Pythonプロジェクトのダウンロード数を計算します：

```sql
CREATE TABLE pypi
(
    `timestamp` DateTime,
    `country_code` LowCardinality(String),
    `project` String,
    `type` LowCardinality(String),
    `installer` LowCardinality(String),
    `python_minor` LowCardinality(String),
    `system` LowCardinality(String),
    `on` String
)
ENGINE = MergeTree
ORDER BY (project, timestamp)

CREATE TABLE pypi_downloads
(
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY project

CREATE MATERIALIZED VIEW pypi_downloads_mv TO pypi_downloads
AS SELECT
 project,
    count() AS count
FROM pypi
GROUP BY project
```

メインテーブルと関連するビューにデータのサブセットを充填します：

```sql
INSERT INTO pypi SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{000..100}.parquet')

0行の結果。経過時間: 15.702秒。処理した行数: 41.23百万、3.94GB (2.63百万行/秒、251.01MB/秒)
ピークメモリ使用量: 977.49 MiB.

SELECT count() FROM pypi

┌──count()─┐
│ 20612750 │ -- 20.61百万
└──────────┘

1行の結果。経過時間: 0.004秒。

SELECT sum(count)
FROM pypi_downloads


┌─sum(count)─┐
│   20612750 │ -- 20.61百万
└────────────┘

1行の結果。経過時間: 0.006秒。処理した行数: 96.15千、769.23KB (16.53百万行/秒、132.26MB/秒)
ピークメモリ使用量: 682.38 KiB.
```

別のサブセット `{101..200}` をロードしたいとします。`pypi` に直接挿入することも可能ですが、重複テーブルを作成することで、このバックフィルを独立して行うことができます。

バックフィルが失敗した場合、メインテーブルには影響を与えず、単に [truncate](/managing-data/truncate) 重複テーブルを処理し、繰り返すことができます。

これらのビューの新しいコピーを作成するには、`CREATE TABLE AS` 句をサフィックス `_v2` を使って使用します：

```sql
CREATE TABLE pypi_v2 AS pypi

CREATE TABLE pypi_downloads_v2 AS pypi_downloads

CREATE MATERIALIZED VIEW pypi_downloads_mv_v2 TO pypi_downloads_v2
AS SELECT
 project,
    count() AS count
FROM pypi_v2
GROUP BY project
```

2番目のサブセット（ほぼ同じサイズ）でこのテーブルを充填し、成功したロードを確認します。

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')

0行の結果。経過時間: 17.545秒。処理した行数: 40.80百万、3.90GB (2.33百万行/秒、222.29MB/秒)
ピークメモリ使用量: 991.50 MiB.

SELECT count()
FROM pypi_v2

┌──count()─┐
│ 20400020 │ -- 20.40百万
└──────────┘

1行の結果。経過時間: 0.004秒。

SELECT sum(count)
FROM pypi_downloads_v2

┌─sum(count)─┐
│   20400020 │ -- 20.40百万
└────────────┘

1行の結果。経過時間: 0.006秒。処理した行数: 95.49千、763.90KB (14.81百万行/秒、118.45MB/秒)
ピークメモリ使用量: 688.77 KiB.
```

この2回目のロード中に失敗が発生した場合、単に [truncate](/managing-data/truncate) `pypi_v2` と `pypi_downloads_v2` を処理し、データのロードを繰り返すことができます。

データロードが完了したら、[`ALTER TABLE MOVE PARTITION`](/sql-reference/statements/alter/partition#move-partition-to-table) 句を使って、重複テーブルからメインテーブルへデータを移動できます。

```sql
ALTER TABLE pypi
 (MOVE PARTITION () FROM pypi_v2)

0行の結果。経過時間: 1.401秒。

ALTER TABLE pypi_downloads
 (MOVE PARTITION () FROM pypi_downloads_v2)

0行の結果。経過時間: 0.389秒。
```

:::note パーティション名
上記の `MOVE PARTITION` 呼び出しは、パーティション名 `()` を使用しています。これは、（パーティションされていない）このテーブルの単一パーティションを表します。パーティションされたテーブルの場合、ユーザーは各パーティションのために複数の `MOVE PARTITION` 呼び出しを行う必要があります。現在のパーティション名は、[`system.parts`](/operations/system-tables/parts) テーブルから確立できます。例えば `SELECT DISTINCT partition FROM system.parts WHERE (table = 'pypi_v2')`のように。
:::

これで、`pypi` と `pypi_downloads` が完全なデータを含んでいることを確認できます。`pypi_downloads_v2` と `pypi_v2` は安全に削除できます。

```sql
SELECT count()
FROM pypi

┌──count()─┐
│ 41012770 │ -- 41.01百万
└──────────┘

1行の結果。経過時間: 0.003秒。

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   41012770 │ -- 41.01百万
└────────────┘

1行の結果。経過時間: 0.007秒。処理した行数: 191.64千、1.53MB (27.34百万行/秒、218.74MB/秒)

SELECT count()
FROM pypi_v2
```

重要なのは、`MOVE PARTITION` 操作が軽量（ハードリンクを利用）かつ原子的であることです。つまり、失敗するか成功するかのいずれかで、中間状態は存在しません。

我々は、以下のバックフィリングシナリオでこのプロセスを重視して利用します。

このプロセスが、ユーザーが各挿入操作のサイズを選択することを要求することに注意してください。

より大きな挿入、すなわちより多くの行は、必要な `MOVE PARTITION` 操作が少なくなることを意味します。しかし、これはネットワークの中断などによる挿入失敗の際のコストとのバランスを取る必要があります。ユーザーは、リスクを減少させるためにファイルのバッチ処理を補完できます。これは、`WHERE timestamp BETWEEN 2024-12-17 09:00:00 AND 2024-12-17 10:00:00` やグロブパターンを使用して行うことができます。例えば、

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{201..300}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{301..400}.parquet')
--すべてのファイルがロードされるまで続行 OR MOVE PARTITION 呼び出しが実行される
```

:::note
ClickPipesはオブジェクトストレージからデータをロードする際にこのアプローチを使用しており、ターゲットテーブルとそのマテリアライズドビューの重複を自動的に作成し、ユーザーが上記のステップを実行する必要を回避します。また、異なるサブセット（グロブパターンを介して）を処理する各ワーカースレッドを使用することで、データを迅速にロードし、正確なセマンティクスで処理できます。興味がある方は、[このブログ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)でさらなる詳細を見つけることができます。
:::
## シナリオ1: 既存のデータ取り込みでのデータバックフィル {#scenario-1-backfilling-data-with-existing-data-ingestion}

このシナリオでは、バックフィルするデータが孤立したバケットに保存されていないため、フィルタリングが必要であると仮定します。すでにデータが挿入されており、バックフィルが必要な歴史的データを特定するためのタイムスタンプまたは単調増加カラムを特定できます。

このプロセスは、以下のステップに従います：

1. チェックポイントを特定します。これは、過去のデータを復元する必要があるタイムスタンプまたはカラム値です。
2. メインテーブル及びマテリアライズドビュー用の対象テーブルの重複を作成します。
3. ステップ（2）で作成したターゲットテーブルを指すマテリアライズドビューのコピーを作成します。
4. ステップ（2）で作成した重複メインテーブルに挿入します。
5. 重複テーブルから元のバージョンにすべてのパーティションを移動します。重複テーブルを削除します。

例えば、PyPIデータをロードしたとしましょう。最小のタイムスタンプを特定でき、これが「チェックポイント」となります。

```sql
SELECT min(timestamp)
FROM pypi

┌──────min(timestamp)─┐
│ 2024-12-17 09:00:00 │
└─────────────────────┘

1行の結果。経過時間: 0.163秒。処理した行数: 13.4億、5.37GB (8.24億行/秒、32.96GB/秒)
ピークメモリ使用量: 227.84 MiB.
```

上記から、`2024-12-17 09:00:00` より前にデータをロードする必要があることが分かります。以前のプロセスを使用して、重複テーブルとビューを作成し、タイムスタンプにフィルタをかけてサブセットをロードします。

```sql
CREATE TABLE pypi_v2 AS pypi

CREATE TABLE pypi_downloads_v2 AS pypi_downloads

CREATE MATERIALIZED VIEW pypi_downloads_mv_v2 TO pypi_downloads_v2
AS SELECT project, count() AS count
FROM pypi_v2
GROUP BY project

INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-*.parquet')
WHERE timestamp < '2024-12-17 09:00:00'

0行の結果。経過時間: 500.152秒。処理した行数: 27.4億、364.40GB (5.47百万行/秒、728.59MB/秒)
```
:::note
パーケットではタイムスタンプ列に基づいてフィルタリングすることが非常に効率的です。ClickHouseは、読み込む必要があるデータ範囲を特定するためにタイムスタンプ列のみを読み取るため、ネットワークトラフィックが最小限に抑えられます。パーケットインデックス（最小-最大など）もClickHouseクエリエンジンによって活用される可能性があります。
:::

この挿入が完了すると、関連するパーティションを移動できます。

```sql
ALTER TABLE pypi
 (MOVE PARTITION () FROM pypi_v2)

ALTER TABLE pypi_downloads
 (MOVE PARTITION () FROM pypi_downloads_v2)
```

歴史的データが孤立したバケットの場合、上記の時間フィルタは不要です。タイムまたは単調増加カラムが利用できない場合は、歴史的データを隔離してください。

:::note ClickHouse CloudでClickPipesを利用
ClickHouse Cloudのユーザーは、データが独自のバケットに隔離されている場合（フィルタが不要であれば）歴史的バックアップを復元するためにClickPipesを使用すべきです。複数のワーカーによる並列処理によってロード時間を短縮し、ClickPipesは上記のプロセスを自動化し、メインテーブルとマテリアライズドビューの両方の重複テーブルを作成します。
:::
## シナリオ2: 既存のテーブルへのマテリアライズドビューの追加 {#scenario-2-adding-materialized-views-to-existing-tables}

新しいマテリアライズドビューを、すでに大量のデータが充填された設定に追加する必要があるのは珍しくありません。この場合には、ストリーム内のポイントを特定するのに役立つタイムスタンプや単調増加カラムが有用で、データの取り込み時に一時停止を回避します。以下の例では、両方のケースを想定し、取り込み時の一時停止を回避するアプローチを優先します。

:::note POPULATEの使用を避ける
小規模データセットのバックフィリング以外では、[`POPULATE`](/sql-reference/statements/create/view#materialized-view) コマンドを使用することはお勧めしません。このオペレーターは、ソーステーブルに挿入された行を見逃す可能性があり、マテリアライズドビューはポピュレートハッシュが完了した後に作成されます。さらに、このポピュレートはすべてのデータに対して実行され、大規模データセットでは中断やメモリ制限に脆弱です。
:::
### タイムスタンプまたは単調増加カラムが利用可能 {#timestamp-or-monotonically-increasing-column-available}

この場合、新しいマテリアライズドビューには、将来の任意のデータよりも大きい行に制限するフィルタを含めることをお勧めします。このマテリアライズドビューは、その後、メインテーブルの歴史的データからこの日付以降のデータでバックフィルできます。バックフィリングのアプローチは、データサイズと関連するクエリの複雑さによって異なります。

私たちの最も単純なアプローチは、以下のステップに従います：

1. 任意の近い未来の時刻よりも大きい行のみを考慮するフィルタを含むマテリアライズドビューを作成します。
2. `INSERT INTO SELECT` クエリを実行し、マテリアライズドビューのターゲットテーブルに挿入し、集約クエリを使用してソーステーブルから読み込みます。

これをさらに強化して、ステップ（2）でデータのサブセットをターゲットにしたり、マテリアライズドビュー用の重複ターゲットテーブルを使用（挿入完了後に元のテーブルにパーティションを付ける）したりして、失敗後の回復を容易にできます。

以下のマテリアライズドビューを考えます。これにより、時間ごとの最も人気のあるプロジェクトが計算されます。

```sql
CREATE TABLE pypi_downloads_per_day
(
    `hour` DateTime,
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, hour)


CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi
GROUP BY
    hour,
 project
```

ターゲットテーブルを追加することはできますが、マテリアライズドビューを追加する前に、`SELECT`句を修正して、任意の未来の時間よりも大きい行のみにフィルタが適用されるようにします。この場合、`2024-12-17 09:00:00` は数分後と仮定します。

```sql
CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project, count() AS count
FROM pypi WHERE timestamp >= '2024-12-17 09:00:00'
GROUP BY hour, project
```

このビューが追加されると、上記のデータ以前のすべてのデータがバックフィルされます。

これを行う最も簡単な手段は、以前のデータを無視するフィルタを適用したマテリアライズドビューから主テーブルに対してクエリを実行し、`INSERT INTO SELECT` を介して結果をビューのターゲットテーブルに挿入するだけです。例えば、上記のビューの場合：

```sql
INSERT INTO pypi_downloads_per_day SELECT
 toStartOfHour(timestamp) AS hour,
 project,
    count() AS count
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
GROUP BY
    hour,
 project

Ok.

0行の結果。経過時間: 2.830秒。処理した行数: 798.89百万、17.40GB (282.28百万行/秒、6.15GB/秒)
ピークメモリ使用量: 543.71 MiB.
```

:::note
上記の例では、ターゲットテーブルは[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)です。この場合、元の集約クエリを単純に使用できます。より複雑な使用例では、[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)を活用するために、集約に対して`-State`関数を使用します。この例は[こちら](/integrations/s3/performance#be-aware-of-merges)をご覧ください。
:::

この例では、比較的軽量な集約が3秒未満で完了し、メモリ使用量は600MiB未満です。より複雑または長時間実行される集約の場合、ユーザーは前述の重複テーブルアプローチを使用して、このプロセスをより回復力のあるものにできます。つまり、シャドウターゲットテーブル（例：`pypi_downloads_per_day_v2`）を作成し、これに挿入し、その結果のパーティションを `pypi_downloads_per_day` に付けるのです。

マテリアライズドビューのクエリは複雑であることが多く（ユーザーがビューを使用しない限り、それは普通のことです）リソースを消費します。稀に、クエリのリソースがサーバーの制限を超えることがあります。これが、ClickHouseのマテリアライズドビューの利点の一つです。つまり、増分的であり、一度に全データセットを処理することはありません！

この場合、ユーザーは以下の選択肢があります：

1. `WHERE timestamp BETWEEN 2024-12-17 08:00:00 AND 2024-12-17 09:00:00` のように範囲をバックフィルするためにクエリを修正します。
2. [Nullテーブルエンジン](/engines/table-engines/special/null)を使用してマテリアライズドビューを埋めます。これにより、可変サイズのデータブロックを使用してマテリアライズドビューの典型的な増分的な生成を再現できます。

(1)が最も簡単なアプローチですが、一般的には十分です。冗長のため例を含めません。

(2)については、以下でさらに探ります。
#### マテリアライズドビューを構築するためのNullテーブルエンジンの使用 {#using-a-null-table-engine-for-filling-materialized-views}

[Nullテーブルエンジン](/engines/table-engines/special/null)は、データを永続化しないストレージエンジンを提供します（テーブルエンジンの世界での`/dev/null`のようなものです）。これは矛盾しているように思えますが、マテリアライズドビューはこのテーブルエンジンに挿入されたデータで実行されます。これにより、元のデータを永続化することなく、マテリアライズドビューを構築できます - I/Oとその関連ストレージを回避します。

重要なのは、テーブルエンジンに接続されたマテリアライズドビューは、挿入時にデータのブロックを実行し、それらの結果をターゲットテーブルに送信することです。これらのブロックは可変サイズです。大きなブロックはより効率的で（および処理が迅速）、リソース（主にメモリ）を多く消費します。このテーブルエンジンを使うことにより、一度に全体の集約をメモリに保持する必要なく、インクリメンタルにマテリアライズドビューを構築できます。

<img src={nullTableMV} class="image" alt="ClickHouseにおける非正規化" style={{width: '50%', background: 'none'}} />

<br />

次の例を考えてみましょう：

```sql
CREATE TABLE pypi_v2
(
    `timestamp` DateTime,
    `project` String
)
ENGINE = Null

CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv_v2 TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi_v2
GROUP BY
    hour,
 project
```

ここでは、マテリアライズドビューの構築に使用される行を受け取るための`pypi_v2`というNullテーブルを作成します。必要なカラムのみにスキーマを制限していることに注意してください。私たちのマテリアライズドビューは、このテーブルに挿入された行（1ブロックずつ）に対して集約を行い、その結果をターゲットテーブルである`pypi_downloads_per_day`に送ります。

:::note
ここでは`pypi_downloads_per_day`をターゲットテーブルとして使用しました。さらなる回復力のために、ユーザーは重複テーブルである`pypi_downloads_per_day_v2`を作成し、ビューのターゲットテーブルとして使用することができます。挿入が完了したら、`pypi_downloads_per_day_v2`のパーティションを`pypi_downloads_per_day`に戻すことができます。これにより、挿入がメモリの問題やサーバーの中断による失敗で失敗した場合の回復が可能になります。つまり、単に`pypi_downloads_per_day_v2`をトランケートし、設定を調整し、再試行するだけです。
:::

このマテリアライズドビューを埋めるには、`pypi` から`pypi_v2` にバックフィルするための関連データを挿入します。

```sql
INSERT INTO pypi_v2 SELECT timestamp, project FROM pypi WHERE timestamp < '2024-12-17 09:00:00'

0行の結果。経過時間: 27.325秒。処理した行数: 15.0億、33.48GB (54.73百万行/秒、1.23GB/秒)
ピークメモリ使用量: 639.47 MiB.
```

ここでのメモリ使用量は`639.47 MiB`です。
##### パフォーマンスとリソースの調整 {#tuning-performance--resources}

上記のシナリオでのパフォーマンスとリソースに影響を与える要素はいくつかあります。読者は、調整を試みる前に、詳細に文書化された挿入メカニクスを理解することをお勧めします [here](/integrations/s3/performance#using-threads-for-reads) での説明を参考にしてください。要約すると：

- **読み取りの並列性** - 読み取りに使用されるスレッドの数。[`max_threads`](/operations/settings/settings#max_threads)を通じて制御されます。ClickHouse Cloudでこれがインスタンスサイズによって決定され、デフォルトはvCPUの数になります。この値を増加させると、より多くのメモリ使用量を伴って読み取りパフォーマンスが向上する可能性があります。
- **挿入の並列性** - 挿入に使用されるスレッドの数。[`max_insert_threads`](/operations/settings/settings#max_insert_threads)を通じて制御されます。ClickHouse Cloudでこれはインスタンスサイズに基づいて決定され（2から4の範囲）、OSSでは1に設定されています。この値を増加させることで、より多くのメモリ使用量を伴ってパフォーマンスが向上する可能性があります。
- **挿入ブロックサイズ** - データはループ内で処理され、パーティショニングキーに基づいてメモリ内挿入ブロックに引き出され、解析され、構築されます。[データパーツ](/parts)としてストレージに書き込まれるまで、これらのブロックはソートされ、最適化され、圧縮されます。挿入ブロックのサイズは、[`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) と [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) （圧縮されていない）により制御され、メモリ使用量とディスクI/Oに影響を与えます。大きなブロックはより多くのメモリを使用しますが、より少ないパーツを作成し、I/Oを削減し、バックグラウンドマージを減少させます。これらの設定は最小閾値を表し（いずれかが最初に達成されるとフラッシュがトリガーされます）。
- **マテリアライズドビューブロックサイズ** - メイン挿入に対する上記のメカニクスに加えて、マテリアライズドビューへの挿入の前に、ブロックもより効率的な処理のために圧縮されます。これらのブロックのサイズは、[`min_insert_block_size_bytes_for_materialized_views`](/operations/settings/settings#min_insert_block_size_bytes_for_materialized_views) と [`min_insert_block_size_rows_for_materialized_views`](/operations/settings/settings#min_insert_block_size_rows_for_materialized_views) により決定されます。大きなブロックは、より多くのメモリ使用量を伴ってより効率的な処理を可能にします。デフォルトでは、これらの設定はソーステーブルの設定 [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) および [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) の値に戻ります。

パフォーマンスを改善するには、ユーザーは [here](/integrations/s3/performance#tuning-threads-and-block-size-for-inserts) に示されているガイドラインに従うことができます。通常のケースでは、`min_insert_block_size_bytes_for_materialized_views` と `min_insert_block_size_rows_for_materialized_views`の変更は、パフォーマンス改善には必要ないはずです。もしこれらが変更される場合は、`min_insert_block_size_rows` と `min_insert_block_size_bytes`に関して議論された同様のベストプラクティスを使用してください。

メモリ使用量を最小化するために、ユーザーはこれらの設定を調整することをお勧めします。これは必然的にパフォーマンスを抑制します。前述のクエリを使用して、以下に例を示します。

`max_insert_threads`を1に下げると、メモリオーバーヘッドが減少します。

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1

0行の結果。経過時間: 27.752秒。処理した行数: 15.0億、33.48GB (53.89百万行/秒、1.21GB/秒)
ピークメモリ使用量: 506.78 MiB.
```

さらに、`max_threads` 設定を1に下げることで、メモリを減らすことができます。

```sql
INSERT INTO pypi_v2
SELECT timestamp, project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1

Ok.

0行の結果。経過時間: 43.907秒。処理した行数: 15.0億、33.48GB (34.06百万行/秒、762.54MB/秒)
ピークメモリ使用量: 272.53 MiB.
```

最後に、`min_insert_block_size_rows`を0に設定（ブロックサイズの決定要因を無効化）し、`min_insert_block_size_bytes`を10485760（10MiB）に設定することで、さらにメモリを減少させることができます。

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1, min_insert_block_size_rows = 0, min_insert_block_size_bytes = 10485760

0行の結果。経過時間: 43.293秒。処理した行数: 15.0億、33.48GB (34.54百万行/秒、773.36MB/秒)
ピークメモリ使用量: 218.64 MiB.
```

最後に、ブロックサイズを下げると、パーツが増え、より大きなマージプレッシャーがかかることに注意してください。 [here](/integrations/s3/performance#be-aware-of-merges)で話し合ったように、これらの設定は慎重に変更する必要があります。
### タイムスタンプまたは単調増加カラムがない場合 {#no-timestamp-or-monotonically-increasing-column}

上記のプロセスは、ユーザーがタイムスタンプまたは単調増加カラムを持っていることに依存しています。場合によっては、これが単純に存在しないこともあります。この場合、我々はユーザーにデータ取り込みを一時停止する必要がある、前述の多くのステップを利用する次のプロセスを推奨します。

1. メインテーブルへの挿入を一時停止します。
2. `CREATE AS`構文を使用して、メインのターゲットテーブルの複製を作成します。
3. 元のターゲットテーブルから複製にパーティションを添付します。 [`ALTER TABLE ATTACH`](/sql-reference/statements/alter/partition#attach-partitionpart)を使用します。 **注意:** この添付操作は、以前に使用された移動とは異なります。ハードリンクに依存しながら、元のテーブルのデータは保持されます。
4. 新しいマテリアライズドビューを作成します。
5. 挿入を再開します。 **注意:** 挿入はターゲットテーブルのみを更新し、複製は元のデータのみを参照します。
6. タイムスタンプを持つデータに対して上記と同じプロセスを適用し、複製テーブルをソースとして使用してマテリアライズドビューをバックフィルします。

以下は、PyPIと以前の新しいマテリアライズドビュー`pypi_downloads_per_day`を使用した例です（タイムスタンプを使用できないと仮定します）：

```sql
SELECT count() FROM pypi

┌────count()─┐
│ 2039988137 │ -- 20.4 億
└────────────┘

1 row in set. Elapsed: 0.003 sec.

-- (1) 挿入を一時停止
-- (2) ターゲットテーブルの複製を作成

CREATE TABLE pypi_v2 AS pypi

SELECT count() FROM pypi_v2

┌────count()─┐
│ 2039988137 │ -- 20.4 億
└────────────┘

1 row in set. Elapsed: 0.004 sec.

-- (3) 元のターゲットテーブルから複製にパーティションを添付します。

ALTER TABLE pypi_v2
 (ATTACH PARTITION tuple() FROM pypi)

-- (4) 新しいマテリアライズドビューを作成

CREATE TABLE pypi_downloads_per_day
(
    `hour` DateTime,
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, hour)


CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi
GROUP BY
    hour,
 project

-- (4) 挿入を再開します。ここでは1行を挿入することでレプリケートします。

INSERT INTO pypi SELECT *
FROM pypi
LIMIT 1

SELECT count() FROM pypi

┌────count()─┐
│ 2039988138 │ -- 20.4 億
└────────────┘

1 row in set. Elapsed: 0.003 sec.

-- pypi_v2が以前と同じ行数であることに注意してください

SELECT count() FROM pypi_v2
┌────count()─┐
│ 2039988137 │ -- 20.4 億
└────────────┘

-- (5) バックアップのpypi_v2を使用してビューをバックフィル

INSERT INTO pypi_downloads_per_day SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi_v2
GROUP BY
    hour,
 project

0 rows in set. Elapsed: 3.719 sec. Processed 20.4 億 rows, 47.15 GB (548.57 million rows/s., 12.68 GB/s.)

DROP TABLE pypi_v2;
```

この前のステップでは、我々は`INSERT INTO SELECT`アプローチを使用して `pypi_downloads_per_day`をバックフィルしています。これは、上記で文書化されたNullテーブルアプローチを用いて強化することもでき、より高い耐障害性を得るために複製テーブルをオプションで使用することもできます。

この操作は挿入を一時停止する必要がありますが、中間操作は通常迅速に完了できるため、データの中断を最小限に抑えることができます。
