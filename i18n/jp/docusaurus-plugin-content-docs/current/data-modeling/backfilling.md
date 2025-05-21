---
slug: /data-modeling/backfilling
title: 'データのバックフィリング'
description: 'ClickHouseで大規模データセットをバックフィルする方法'
keywords: ['マテリアライズドビュー', 'バックフィリング', 'データ挿入', 'レジリエントデータロード']
---

import nullTableMV from '@site/static/images/data-modeling/null_table_mv.png';
import Image from '@theme/IdealImage';

# データのバックフィリング

ClickHouseを初めて使用するユーザーや、既存のデプロイメントを担当するユーザーは、必ず歴史的データでテーブルをバックフィルする必要があります。場合によっては、これが比較的簡単ですが、マテリアライズドビューをポピュレートする必要がある場合、より複雑になることがあります。このガイドでは、このタスクのためのいくつかのプロセスを文書化しており、ユーザーは自分のユースケースに適用することができます。

:::note
このガイドでは、ユーザーがすでに[インクリメンタルマテリアライズドビュー](/materialized-view/incremental-materialized-view)と、`s3`や`gcs`といったテーブル関数を使用した[データローディング](/integrations/s3)の概念に精通していることを前提としています。また、ユーザーには、データ挿入パフォーマンスの最適化に関するガイドを読むことをお勧めします。このアドバイスは、このガイド全体での挿入に適用できます。
:::
## 例のデータセット {#example-dataset}

このガイドでは、PyPIデータセットを使用します。このデータセットの各行は、`pip`のようなツールを使用してPythonパッケージがダウンロードされたことを示します。

例えば、このサブセットは1日のデータ - `2024-12-17`をカバーしており、`https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/`で公開されています。ユーザーは次のクエリを実行できます：

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 20.4億
└────────────┘

1行の結果。経過時間: 32.726秒。2.04億行、170.05 KB (62.34百万行/s, 5.20 KB/s)を処理しました。
ピークメモリ使用量: 239.50 MiB。
```

このバケットの全データセットは320GBを超えるparquetファイルを含んでいます。以下の例では、意図的にグロブパターンを使用してサブセットをターゲットにしています。

ユーザーは、例えばKafkaやオブジェクトストレージから、この日以降のデータのストリームを消費していると仮定します。このデータのスキーマは以下の通りです：

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
全体のPyPIデータセットは、1兆行以上から構成されており、公開デモ環境 [clickpy.clickhouse.com](https://clickpy.clickhouse.com) で入手可能です。このデータセットの詳細については、デモがパフォーマンスのためにマテリアライズドビューをどのように利用しているか、およびデータが毎日どのようにポピュレートされるかについて、[こちら](https://github.com/ClickHouse/clickpy)をご覧ください。
:::
## バックフィリングシナリオ {#backfilling-scenarios}

バックフィリングは、通常、ある時点からデータのストリームが消費されるときに必要です。このデータは、[インクリメンタルマテリアライズドビュー](/materialized-view/incremental-materialized-view)を用いてClickHouseテーブルに挿入され、挿入されたブロックに基づいてトリガーされます。これらのビューは、挿入前にデータを変換したり、集計を計算したり、結果をターゲットテーブルに送信してダウンストリームアプリケーションでの後での使用のために送信したりする場合があります。

以下のシナリオをカバーすることを目指します：

1. **既存のデータ入力によるデータのバックフィリング** - 新しいデータがロードされ、歴史的データをバックフィルする必要があります。この歴史的データは特定されています。
2. **既存のテーブルへのマテリアライズドビューの追加** - 新しいマテリアライズドビューを、過去のデータがポピュレートされているセットアップに追加する必要があります。また、データはすでにストリーミングされています。

データはオブジェクトストレージからバックフィルされると仮定します。すべてのケースにおいて、データ挿入の停止を避けることを目指します。

私たちは、オブジェクトストレージから歴史的データをバックフィルすることをお勧めします。可能な場合は、optimalな読み取りパフォーマンスと圧縮（ネットワーク転送の削減）のために、データはParquetにエクスポートすべきです。通常、約150MBのファイルサイズが好まれますが、ClickHouseは[70を超えるファイル形式](/interfaces/formats)をサポートしており、あらゆるサイズのファイルを処理できます。
## 重複テーブルとビューの使用 {#using-duplicate-tables-and-views}

すべてのシナリオで、私たちは「重複テーブルとビュー」の概念に依存します。これらのテーブルとビューは、ライブストリーミングデータに使用されるもののコピーを表し、バックフィルを分離して実行でき、障害が発生した場合に簡単に復旧できます。例えば、次のような主要な`pypi`テーブルと、そのPythonプロジェクトごとのダウンロード数を計算するマテリアライズドビューがあります：

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

私たちは、データのサブセットで主要なテーブルと関連するビューをポピュレートします：

```sql
INSERT INTO pypi SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{000..100}.parquet')

0行の結果。経過時間: 15.702秒。41.23百万行、3.94GB (2.63百万行/s。, 251.01MB/s)を処理しました。
ピークメモリ使用量: 977.49 MiB。

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

1行の結果。経過時間: 0.006秒。96.15千行を処理し、769.23 KB (16.53百万行/s。, 132.26MB/s)を処理しました。
ピークメモリ使用量: 682.38 KiB。
```

もし別のサブセット`{101..200}`を読み込む必要があるとします。私たちは`pypi`に直接挿入することもできますが、重複テーブルを作成することでこのバックフィルを分離して実行できます。

バックフィルが失敗した場合、私たちは主要なテーブルに影響を与えず、重複テーブルを[trunacate](/managing-data/truncate)し、再実行することができます。

これらのビューの新しいコピーを作成するためには、`CREATE TABLE AS`句を使ってサフィックスを`_v2`にします：

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

我々は、2番目のサブセット（おおよそ同じサイズ）を挿入し、成功したロードを確認します。

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')

0行の結果。経過時間: 17.545秒。40.80百万行、3.90GB (2.33百万行/s。, 222.29MB/s)を処理しました。
ピークメモリ使用量: 991.50 MiB。

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

1行の結果。経過時間: 0.006秒。95.49千行を処理し、763.90KB (14.81百万行/s。, 118.45MB/s)を処理しました。
ピークメモリ使用量: 688.77 KiB。
```

もしこの2回目のロード中に失敗が発生した場合、単に`pypi_v2`と`pypi_downloads_v2`を[truncate](/managing-data/truncate)し、データロードを再実行すれば済みます。

データロードが完了したら、[`ALTER TABLE MOVE PARTITION`](/sql-reference/statements/alter/partition#move-partition-to-table)句を使用して、重複テーブルから主テーブルにデータを移動させます。

```sql
ALTER TABLE pypi
 (MOVE PARTITION () FROM pypi_v2)

0行の結果。経過時間: 1.401秒。

ALTER TABLE pypi_downloads
 (MOVE PARTITION () FROM pypi_downloads_v2)

0行の結果。経過時間: 0.389秒。
```

:::note パーティション名
上記の`MOVE PARTITION`呼び出しはパーティション名を`()`として使用します。これは、このテーブルに対する単一のパーティション（パーティション化されていない）を表しています。パーティション化されたテーブルの場合、ユーザーは各パーティションごとに複数の`MOVE PARTITION`呼び出しを行う必要があります。現在のパーティションの名前は[`system.parts`](/operations/system-tables/parts)テーブルから確認できます。例: `SELECT DISTINCT partition FROM system.parts WHERE (table = 'pypi_v2')`.
:::

今、`pypi`と`pypi_downloads`が完全なデータを含むことを確認できます。`pypi_downloads_v2`と`pypi_v2`は安全にドロップできます。

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

1行の結果。経過時間: 0.007秒。191.64千行を処理し、1.53MB (27.34百万行/s。, 218.74MB/s)のデータを処理しています。

SELECT count()
FROM pypi_v2
```

重要なことに、`MOVE PARTITION`操作は軽量で（ハードリンクを利用）、原子的です。すなわち、途中経過の状態がなく、失敗するか成功するかのいずれかです。

私たちはこのプロセスを以下のバックフィリングシナリオで重視しています。

このプロセスでは、ユーザーが各挿入操作のサイズを選択する必要があることに注意してください。

大きな挿入、つまりより多くの行は、必要な`MOVE PARTITION`操作が少なくなることを意味します。ただし、これは挿入の失敗（ネットワークの中断など）の場合の回復にかかるコストとバランスを取る必要があります。ユーザーは、リスクを減らすためにファイルをバッチ処理することを補完できます。これは、範囲クエリ、例えば`WHERE timestamp BETWEEN 2024-12-17 09:00:00 AND 2024-12-17 10:00:00`やグロブパターンを用いて実行できます。例えば、

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{201..300}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{301..400}.parquet')
-- すべてのファイルをロードしたら、またはMOVE PARTITION呼び出しを行います
```

:::note
ClickPipesは、オブジェクトストレージからデータをロードする際にこのアプローチを使用し、ユーザーが上記の手順を実行する必要がなく、ターゲットテーブルとそのマテリアライズドビューの重複を自動的に作成します。さらに、異なるサブセット（グロブパターンを介して）を処理する複数のワーカースレッドを使用し、各スレッドごとに独自の重複テーブルを持つことで、データを迅速にロードし、正確一次セマンティクスを実現します。興味のある方は、[このブログ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)でさらに詳細を確認できます。
:::
## シナリオ1: 既存のデータ入力によるデータのバックフィリング {#scenario-1-backfilling-data-with-existing-data-ingestion}

このシナリオでは、バックフィルされるデータが孤立したバケットにないと仮定し、フィルタリングが必要です。データはすでに挿入されており、バックフィルする必要のある歴史的データを特定するためのタイムスタンプまたは単調増加のカラムを確認できます。

このプロセスは以下の手順に従います：

1. チェックポイントを特定します - これは、歴史的データを復元するためのタイムスタンプまたはカラム値です。
2. メインテーブルとマテリアライズドビューのターゲットテーブルの重複を作成します。
3. ステップ（2）で作成されたターゲットテーブルを指すマテリアライズドビューのコピーを作成します。
4. ステップ（2）で作成された重複メインテーブルに挿入します。
5. 重複テーブルのすべてのパーティションを元のバージョンに移動します。重複テーブルを削除します。

例えば、PyPIデータにおいてデータがロードされているとしましょう。最小のタイムスタンプを確認し、これが私たちの「チェックポイント」になります。

```sql
SELECT min(timestamp)
FROM pypi

┌──────min(timestamp)─┐
│ 2024-12-17 09:00:00 │
└─────────────────────┘

1行の結果。経過時間: 0.163秒。13.4億行、5.37GB (8.24億行/s。, 32.96GB/s)を処理しました。
ピークメモリ使用量: 227.84 MiB。
```

上記から、`2024-12-17 09:00:00`以前のデータをロードする必要があることがわかります。以前のプロセスを用いて重複テーブルとビューを作成し、タイムスタンプフィルターを適用してサブセットをロードします。

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

0行の結果。経過時間: 500.152秒。2.74億行、364.40GB (5.47百万行/s。, 728.59MB/s)を処理しました。
```
:::note
Parquetのタイムスタンプカラムのフィルタリングは非常に効率的です。ClickHouseは、全データ範囲を識別するためにタイムスタンプカラムのみを読み込み、ネットワークトラフィックを最小限に抑えます。最小-最大のようなParquetインデックスもClickHouseクエリエンジンによって利用される可能性があります。
:::

この挿入が完了すると、関連するパーティションを移動できます。

```sql
ALTER TABLE pypi
 (MOVE PARTITION () FROM pypi_v2)

ALTER TABLE pypi_downloads
 (MOVE PARTITION () FROM pypi_downloads_v2)
```

歴史的データが孤立したバケットにある場合、上記の時間フィルターは必要ありません。時間または単調増加のカラムが利用できない場合は、歴史的データを分離してください。

:::note ClickHouse CloudではClickPipesを使用するだけ
ClickHouse Cloudユーザーは、データをその独自のバケットに隔離できる場合、歴史的バックアップを復元するためにClickPipesを使用すべきです（フィルターは不要）。複数のワーカーでロードを並列化して、そのロード時間を短縮し、ClickPipesは上記のプロセスを自動化し、メインテーブルとマテリアライズドビューの両方の重複テーブルを作成します。
:::
## シナリオ2: 既存のテーブルへのマテリアライズドビューの追加 {#scenario-2-adding-materialized-views-to-existing-tables}

データがかなりポピュレートされ、データが挿入されているセットアップに新しいマテリアライズドビューを追加する必要があることは珍しくありません。ここでは、ストリーム中のポイントを識別するために使用できるタイムスタンプや単調増加のカラムが便利で、データ挿入の停止を回避できます。以下の例では、両方のケースを考慮し、挿入の停止を回避するアプローチを好みます。

:::note POPULATEを避ける
小規模データセット以外では、マテリアライズドビューのバックフィリングに[`POPULATE`](/sql-reference/statements/create/view#materialized-view)コマンドを使用することはお勧めしません。このオペレーターは、ポピュレートハッシュが完了した後にソーステーブルに挿入された行を見逃す可能性があります。さらに、このポピュレートはすべてのデータに対して実行され、大規模データセットにおいて中断やメモリ制限に脆弱です。
:::
### タイムスタンプまたは単調増加カラムが利用できる場合 {#timestamp-or-monotonically-increasing-column-available}

この場合、新しいマテリアライズドビューに、将来の任意のデータよりも大きい行のみを制限するフィルターを含めることをお勧めします。このマテリアライズドビューは、その後、メインテーブルの歴史的データからこの日付以降にバックフィルできます。バックフィリングアプローチは、データサイズと関連しているクエリの複雑性によって異なります。

最もシンプルなアプローチでは、以下の手順が含まれます：

1. 任意の近い将来の時点により大きい行のみを考慮するフィルターを含むマテリアライズドビューを作成します。
2. マテリアライズドビューのターゲットテーブルに挿入する`INSERT INTO SELECT`クエリを実行し、ビューの集計クエリでソーステーブルを読み込みます。

これは、ステップ（2）でデータのサブセットをターゲットに設定したり、マテリアライズドビューのために重複のターゲットテーブルを使用したりすることでさらに強化できます（挿入が完了した後に元のテーブルにパーティションをアタッチ）。

次のマテリアライズドビューを考えます。これは、毎時の最も人気のあるプロジェクトを計算します。

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

ターゲットテーブルを追加することはできますが、マテリアライズドビューを追加する前に、`SELECT`句を修正してのみ、近い将来の任意の時点より大きい行のみを考慮するフィルターを含めます。この場合、`2024-12-17 09:00:00`が数分後の時間であると仮定します。

```sql
CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project, count() AS count
FROM pypi WHERE timestamp >= '2024-12-17 09:00:00'
GROUP BY hour, project
```

このビューが追加されたら、このデータ以前のマテリアライズドビューの全データをバックフィルできます。

これを最も簡単に行う方法は、マテリアライズドビューのクエリをメインテーブルで実行し、最近追加されたデータを無視するフィルターを適用し、結果をマテリアライズドビューのターゲットテーブルに`INSERT INTO SELECT`で挿入することです。たとえば、上記のビューの場合：

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

0行の結果。経過時間: 2.830秒。798.89百万行、17.40GB (282.28百万行/s。, 6.15GB/s)を処理しました。
ピークメモリ使用量: 543.71 MiB。
```

:::note
上記の例では、ターゲットテーブルは[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)です。この場合、元の集計クエリを使用できます。より複雑なユースケースでは、[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)を利用するユーザーが、集計のために`-State`関数を使用することになります。これについての例は[こちら](/integrations/s3/performance#be-aware-of-merges)で見つけることができます。
:::

私たちのケースでは、これは比較的軽量な集計で、3秒未満で完了し、600MiB未満のメモリを使用します。より複雑または長時間実行される集計の場合、ユーザーは前述の重複テーブルアプローチを使用してこのプロセスをより堅牢にすることができます。例えば、シャドウターゲットテーブル（例：`pypi_downloads_per_day_v2`）を作成し、これに挿入し、結果として得られたパーティションを`pypi_downloads_per_day`に接続します。

しばしば、マテリアライズドビューのクエリはより複雑である可能性が高く（そうでない場合ユーザーはビューを使用しないでしょう！）、リソースを消費します。まれに、クエリに必要なリソースがサーバーのそれを超えてしまう場合があります。これはClickHouseのマテリアライズドビューの利点の一つを示しています。すなわち、それらはインクリメンタルであり、全データセットを一度に処理する必要がないのです！

この場合、ユーザーにはいくつかのオプションがあります：

1. クエリを変更して範囲をバックフィルします。例えば、`WHERE timestamp BETWEEN 2024-12-17 08:00:00 AND 2024-12-17 09:00:00`や、`WHERE timestamp BETWEEN 2024-12-17 07:00:00 AND 2024-12-17 08:00:00`など。
2. [Nullテーブルエンジン](/engines/table-engines/special/null)を使用してマテリアライズドビューを満たします。これは、通常のインクリメンタルマテリアルビューの人口を模倣し、データのブロック（構成可能なサイズ）に対してクエリを実行します。

（1）は最もシンプルなアプローチを提供することが多く、十分であることがよくあります。簡潔さのために例は含まれていません。

私たちは(2)を以下で探求します。
#### マテリアライズドビューに対するNullテーブルエンジンの使用 {#using-a-null-table-engine-for-filling-materialized-views}

[Nullテーブルエンジン](/engines/table-engines/special/null)は、データを永続化しないストレージエンジンを提供します（テーブルエンジンの世界では`/dev/null`のようなものと考えてください）。これは矛盾するように思えますが、挿入されたデータに対してマテリアライズドビューは依然として実行されます。これにより、オリジナルのデータを永続化せずにマテリアライズドビューを構築することが可能になります。これにより、I/Oおよび関連するストレージを回避できます。

重要なのは、テーブルエンジンに接続された任意のマテリアライズドビューが、挿入されるデータのブロックに対して依然として実行され、結果をターゲットテーブルに送信することです。これらのブロックは、構成可能なサイズです。大きなブロックは、より効率的にプロセスしやすい一方で、より多くのリソース（主にメモリ）を消費します。このテーブルエンジンを使用することにより、私たちはマテリアライズドビューをインクリメンタルに構築でき、全ての集計をメモリに保持する必要がなくなります。

<Image img={nullTableMV} size="md" alt="ClickHouseでの非正規化"/>

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

ここでは、行を受け取るために`pypi_v2`というNullテーブルを作成します。このテーブルは私たちのマテリアライズドビューを構築するために使用されます。必要なカラムのみを対象とするようにスキーマを限定する点に注目してください。私たちのマテリアライズドビューは、このテーブル（1つのブロックずつ）に挿入された行を集計し、`pypi_downloads_per_day`に結果を送信します。

:::note
ここでは`pypi_downloads_per_day`をターゲットテーブルとして使用しました。追加の堅牢性のために、ユーザーは重複テーブル`pypi_downloads_per_day_v2`を作成し、マテリアライズドビューのターゲットテーブルとして使用できます。挿入が完了した後に`pypi_downloads_per_day_v2`のパーティションを`pypi_downloads_per_day`に移動できるようにします。これにより、挿入がメモリの問題やサーバーの中断によって失敗した場合の回復が可能になります。すなわち、単に`pypi_downloads_per_day_v2`をトランケートし、設定を調整して再試行すれば済みます。
:::

このマテリアライズドビューをポピュレートするには、`pypi_v2`にバックフィルするための関連データを`pypi`から挿入します。

```sql
INSERT INTO pypi_v2 SELECT timestamp, project FROM pypi WHERE timestamp < '2024-12-17 09:00:00'

0行の結果。経過時間: 27.325秒。15億行、33.48GB (54.73百万行/s。, 1.23GB/s)を処理しました。
ピークメモリ使用量: 639.47 MiB。
```

ここでのメモリ使用量は`639.47 MiB`です。
##### パフォーマンスとリソースの調整 {#tuning-performance--resources}

上記のシナリオにおけるパフォーマンスと使用されるリソースは、いくつかの要因によって決まります。最初に調整を試みる前に、[Optimizing for S3 Insert and Read Performance guide](/integrations/s3/performance)の詳細が記載されたデータ挿入メカニクスを理解することをお勧めします。要約すると：

- **読み取りの並列性** - 読み取るために使用されるスレッドの数。[`max_threads`](/operations/settings/settings#max_threads)を通じて制御されます。ClickHouse Cloudでは、インスタンスのサイズによって決定され、デフォルトではvCPUの数に設定されます。この値を増やすことで、メモリ使用量が増える代わりに読み取りパフォーマンスが向上する可能性があります。
- **挿入の並列性** - 挿入に使用されるスレッドの数。[`max_insert_threads`](/operations/settings/settings#max_insert_threads)を通じて制御されます。ClickHouse Cloudではインスタンスのサイズに従い（2から4の間）OSSでは1に設定されています。この値を増やすことで、メモリ使用量が増加する代わりにパフォーマンスが向上する可能性があります。
- **挿入ブロックサイズ** - データはループ内で処理され、プル/パースされ、メモリ内の挿入ブロックに形成されます。この状態では、[partitioning key](/engines/table-engines/mergetree-family/custom-partitioning-key)に基づいています。これらのブロックはソート、最適化、圧縮され、新しい[data parts](/parts)としてストレージに書き込まれます。挿入ブロックのサイズは、設定[`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)と[`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（非圧縮）によって制御され、メモリ使用量とディスクI/Oに影響を与えます。より大きなブロックはより多くのメモリを使用しますが、部分が少なくなりI/Oとバックグラウンドマージを削減します。これらの設定は最小しきい値を示し（どちらかが最初に到達した場合にフラッシュがトリガーされます）、通常の設定を越えて変更する必要はありません。
- **マテリアライズドビューのブロックサイズ** - 上記の挿入に対してのメカニクスに加えて、マテリアライズドビューへの挿入前にブロックもより効率的な処理の場合に圧縮されます。これらのブロックのサイズは、設定[`min_insert_block_size_bytes_for_materialized_views`](/operations/settings/settings#min_insert_block_size_bytes_for_materialized_views)と[`min_insert_block_size_rows_for_materialized_views`](/operations/settings/settings#min_insert_block_size_rows_for_materialized_views)によって決まります。より大きなブロックはメモリ使用量の増大を伴うものの、より効率的な処理が可能になります。デフォルトでは、これらの設定は元のテーブル設定[`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)および[`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)の値に戻ります。

パフォーマンスを向上させるためには、[Tuning Threads and Block Size for Inserts](/integrations/s3/performance#tuning-threads-and-block-size-for-inserts)に記載されたガイドラインに従うことができます。ほとんどの場合、`min_insert_block_size_bytes_for_materialized_views`や`min_insert_block_size_rows_for_materialized_views`を変更する必要はありません。これらを変更する場合には、`min_insert_block_size_rows`と`min_insert_block_size_bytes`で議論されたベストプラクティスを適用してください。

メモリを最小限に抑えるために、これらの設定を実験してみることもユーザーが望む場合があります。結果としてパフォーマンスは下がることが避けられません。前述のクエリを用いて以下の例を示します。

`max_insert_threads`を1に設定することで、メモリオーバーヘッドを減少させます。

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1

0行の結果。経過時間: 27.752秒。1.50億行、33.48GB (53.89百万行/s。, 1.21GB/s)を処理しました。
ピークメモリ使用量: 506.78 MiB。
```

`max_threads`設定を1に減少させることで、さらにメモリを削減できます。

```sql
INSERT INTO pypi_v2
SELECT timestamp, project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1

Ok.

0行の結果。経過時間: 43.907秒。1.50億行、33.48GB (34.06百万行/s。, 762.54MB/s)を処理しました。
ピークメモリ使用量: 272.53 MiB。
```

最後に、メモリをさらなる節約するために`min_insert_block_size_rows`を0に設定（これをブロックサイズの決定要因として無効にする）し、`min_insert_block_size_bytes`を10485760（10MB）に設定します。

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1, min_insert_block_size_rows = 0, min_insert_block_size_bytes = 10485760

0行の結果。経過時間: 43.293秒。1.50億行、33.48GB (34.54百万行/s。, 773.36MB/s)を処理しました。
ピークメモリ使用量: 218.64 MiB。
```

最終的に、ブロックサイズを下げると、より多くの部分が生成され、より高いマージ圧力がかかります。[こちら](/integrations/s3/performance#be-aware-of-merges)で議論されたように、これらの設定は慎重に変更すべきです。
### タイムスタンプまたは単調増加カラムなし {#no-timestamp-or-monotonically-increasing-column}

上記のプロセスは、ユーザーがタイムスタンプまたは単調増加カラムを持っていることに依存しています。場合によっては、これが単純に利用できないことがあります。その場合、データの取り込みを一時停止する必要がありますが、以前に説明した多くのステップを利用する次のプロセスをお勧めします。

1. メインテーブルへの挿入を一時停止します。
2. `CREATE AS` 構文を使用して、メインターゲットテーブルの複製を作成します。
3. [`ALTER TABLE ATTACH`](/sql-reference/statements/alter/partition#attach-partitionpart) を使用して、元のターゲットテーブルから複製にパーティションを添付します。**注意:** このアタッチ操作は、以前に使用したムーブとは異なります。ハードリンクを利用し、元のテーブルのデータは保持されます。
4. 新しいマテリアライズドビューを作成します。
5. 挿入を再開します。**注意:** 挿入はターゲットテーブルのみを更新し、複製は元のデータのみ参照します。
6. タイムスタンプを持つデータに対して上記と同じプロセスを適用し、複製テーブルをソースとして、マテリアライズドビューをバックフィルします。

以下は、PyPI と前回の新しいマテリアライズドビュー `pypi_downloads_per_day` を使用した例です（タイムスタンプを使用できないと仮定します）：

```sql
SELECT count() FROM pypi

┌────count()─┐
│ 2039988137 │ -- 20.4億
└────────────┘

1 行がセットされました。経過時間: 0.003 秒。

-- (1) 挿入を一時停止
-- (2) ターゲットテーブルの複製を作成

CREATE TABLE pypi_v2 AS pypi

SELECT count() FROM pypi_v2

┌────count()─┐
│ 2039988137 │ -- 20.4億
└────────────┘

1 行がセットされました。経過時間: 0.004 秒。

-- (3) 元のターゲットテーブルから複製にパーティションを添付。

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

-- (4) 挿入を再開します。ここで1行を挿入してレプリケートします。

INSERT INTO pypi SELECT *
FROM pypi
LIMIT 1

SELECT count() FROM pypi

┌────count()─┐
│ 2039988138 │ -- 20.4億
└────────────┘

1 行がセットされました。経過時間: 0.003 秒。

-- pypi_v2 が前と同じ行数を含んでいることに注意してください

SELECT count() FROM pypi_v2
┌────count()─┐
│ 2039988137 │ -- 20.4億
└────────────┘

-- (5) バックフィルビューをバックアップ用の pypi_v2 を使用して行います。

INSERT INTO pypi_downloads_per_day SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi_v2
GROUP BY
    hour,
 project

0 行がセットされました。経過時間: 3.719 秒。処理した行数: 20.4億行、47.15 GB (548.57万行/s, 12.68 GB/s)。

DROP TABLE pypi_v2;
```

筆者段階では、`pypi_downloads_per_day` をバックフィルするために、前述の単純な `INSERT INTO SELECT` アプローチを使用しています。この操作は、より高い耐障害性のために、上記で文書化された Null テーブルアプローチを利用して強化することもできます。

この操作では、挿入を一時停止する必要がありますが、途中の操作は通常迅速に完了できるため、データの中断を最小限に抑えることができます。
