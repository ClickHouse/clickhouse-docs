---
slug: /data-modeling/backfilling
title: 'データのバックフィル'
description: 'ClickHouse で大規模なデータセットをバックフィルする方法'
keywords: ['マテリアライズドビュー', 'バックフィル', 'データ挿入', '堅牢なデータロード']
doc_type: 'guide'
---

import nullTableMV from '@site/static/images/data-modeling/null_table_mv.png';
import Image from '@theme/IdealImage';


# データのバックフィル

ClickHouse を初めて利用する場合でも、既存のデプロイ環境を担当している場合でも、ユーザーは遅かれ早かれテーブルに履歴データをバックフィルする必要が出てきます。状況によっては比較的単純な場合もありますが、マテリアライズドビューにデータを投入する必要があると、より複雑になることがあります。このガイドでは、このタスクに対するいくつかのプロセスを説明し、ユーザーが自身のユースケースに適用できるようにします。

:::note
このガイドでは、ユーザーがすでに [インクリメンタルマテリアライズドビュー](/materialized-view/incremental-materialized-view) の概念および [s3 や gcs などのテーブル関数を用いたデータ読み込み](/integrations/s3) に精通していることを前提としています。また、[オブジェクトストレージからの挿入パフォーマンスの最適化](/integrations/s3/performance) に関するガイドもお読みいただくことをおすすめします。そこで説明しているアドバイスは、本ガイドで行う挿入処理全般にも適用できます。
:::



## サンプルデータセット {#example-dataset}

本ガイドでは、PyPIデータセットを使用します。このデータセットの各行は、`pip`などのツールを使用したPythonパッケージのダウンロードを表しています。

例えば、このサブセットは1日分（`2024-12-17`）をカバーしており、`https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/`で公開されています。ユーザーは次のようにクエリできます：

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 20.4億
└────────────┘

1 row in set. Elapsed: 32.726 sec. Processed 2.04 billion rows, 170.05 KB (62.34 million rows/s., 5.20 KB/s.)
ピークメモリ使用量: 239.50 MiB.
```

このバケットの完全なデータセットには、320 GB以上のparquetファイルが含まれています。以下の例では、意図的にglobパターンを使用してサブセットを対象としています。

この日付以降のデータについて、ユーザーがKafkaやオブジェクトストレージなどからこのデータのストリームを消費していることを前提としています。このデータのスキーマを以下に示します：

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
1兆行以上で構成される完全なPyPIデータセットは、公開デモ環境[clickpy.clickhouse.com](https://clickpy.clickhouse.com)で利用可能です。このデータセットの詳細（デモがパフォーマンス向上のためにマテリアライズドビューをどのように活用しているか、データが毎日どのように投入されているかなど）については、[こちら](https://github.com/ClickHouse/clickpy)を参照してください。
:::


## バックフィルのシナリオ {#backfilling-scenarios}

バックフィルは通常、特定の時点からデータストリームを取り込む際に必要となります。このデータは[増分マテリアライズドビュー](/materialized-view/incremental-materialized-view)を使用してClickHouseテーブルに挿入され、ブロックの挿入時にトリガーされます。これらのビューは、挿入前にデータを変換したり、集計を計算して結果をターゲットテーブルに送信し、下流のアプリケーションで後から使用できるようにします。

以下のシナリオについて説明します:

1. **既存のデータ取り込みと並行したデータのバックフィル** - 新しいデータが読み込まれている状況で、履歴データをバックフィルする必要があります。この履歴データは特定済みです。
2. **既存テーブルへのマテリアライズドビューの追加** - 履歴データが既に投入され、データがストリーミングされている環境に、新しいマテリアライズドビューを追加する必要があります。

データはオブジェクトストレージからバックフィルされることを前提としています。すべてのケースにおいて、データ挿入の中断を回避することを目指します。

履歴データのバックフィルはオブジェクトストレージから行うことを推奨します。最適な読み取りパフォーマンスと圧縮(ネットワーク転送の削減)を実現するため、可能な限りデータをParquet形式でエクスポートしてください。ファイルサイズは通常150MB程度が推奨されますが、ClickHouseは[70種類以上のファイル形式](/interfaces/formats)をサポートしており、あらゆるサイズのファイルを処理できます。


## 重複テーブルとビューの使用 {#using-duplicate-tables-and-views}

すべてのシナリオにおいて、「重複テーブルとビュー」の概念を利用します。これらのテーブルとビューは、ライブストリーミングデータに使用されるものの複製であり、バックフィルを独立して実行でき、障害が発生した場合の復旧を容易にします。例えば、以下のようなメインの`pypi`テーブルとマテリアライズドビューがあり、Pythonプロジェクトごとのダウンロード数を計算します:

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

メインテーブルと関連するビューにデータのサブセットを投入します:

```sql
INSERT INTO pypi SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{000..100}.parquet')

0 rows in set. 経過時間: 15.702秒 処理済み 41.23百万行、3.94 GB (2.63百万行/秒、251.01 MB/秒)
ピークメモリ使用量: 977.49 MiB.

SELECT count() FROM pypi

┌──count()─┐
│ 20612750 │ -- 20.61百万
└──────────┘

1 row in set. 経過時間: 0.004秒

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   20612750 │ -- 20.61百万
└────────────┘

1 row in set. 経過時間: 0.006秒 処理済み 96.15千行、769.23 KB (16.53百万行/秒、132.26 MB/秒)
ピークメモリ使用量: 682.38 KiB.
```

別のサブセット`{101..200}`を読み込みたいとします。`pypi`に直接挿入することもできますが、重複テーブルを作成することで、このバックフィルを独立して実行できます。

バックフィルが失敗した場合でも、メインテーブルには影響を与えず、重複テーブルを単に[truncate](/managing-data/truncate)して再実行できます。

これらのビューの新しいコピーを作成するには、サフィックス`_v2`を付けて`CREATE TABLE AS`句を使用できます:

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

ほぼ同じサイズの2番目のサブセットでこれを投入し、読み込みが成功したことを確認します。

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')

0 rows in set. 経過時間: 17.545秒 処理済み 40.80百万行、3.90 GB (2.33百万行/秒、222.29 MB/秒)
ピークメモリ使用量: 991.50 MiB.

SELECT count()
FROM pypi_v2

┌──count()─┐
│ 20400020 │ -- 20.40百万
└──────────┘

1 row in set. 経過時間: 0.004秒

SELECT sum(count)
FROM pypi_downloads_v2

┌─sum(count)─┐
│   20400020 │ -- 20.40百万
└────────────┘

1 row in set. 経過時間: 0.006秒 処理済み 95.49千行、763.90 KB (14.81百万行/秒、118.45 MB/秒)
ピークメモリ使用量: 688.77 KiB.
```


この 2 回目のロードの途中のいずれかの時点で障害が発生した場合でも、`pypi_v2` と `pypi_downloads_v2` を単に[TRUNCATE](/managing-data/truncate) して、データロードをやり直すことができます。

データロードが完了したら、複製テーブルからメインテーブルへデータを移動するために、[`ALTER TABLE MOVE PARTITION`](/sql-reference/statements/alter/partition#move-partition-to-table) 句を使用できます。

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

0 rows in set. Elapsed: 1.401 sec.

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads

0 rows in set. Elapsed: 0.389 sec.
```

:::note パーティション名
上記の `MOVE PARTITION` 呼び出しは、パーティション名 `()` を使用しています。これは、このテーブルに存在する単一のパーティション（テーブル自体はパーティション分割されていない）を表します。パーティション分割されているテーブルでは、各パーティションごとに 1 回ずつ、複数の `MOVE PARTITION` 呼び出しを実行する必要があります。現在のパーティション名は、[`system.parts`](/operations/system-tables/parts) テーブルから取得できます。例: `SELECT DISTINCT partition FROM system.parts WHERE (table = 'pypi_v2')`。
:::

これで、`pypi` と `pypi_downloads` に完全なデータが含まれていることを確認できます。`pypi_downloads_v2` と `pypi_v2` は安全に削除してかまいません。

```sql
SELECT count()
FROM pypi

┌──count()─┐
│ 41012770 │ -- 4101万
└──────────┘

1 row in set. Elapsed: 0.003 sec.

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   41012770 │ -- 4101万
└────────────┘

1 row in set. Elapsed: 0.007 sec. Processed 191.64 thousand rows, 1.53 MB (27.34 million rows/s., 218.74 MB/s.)

SELECT count()
FROM pypi_v2
```

重要な点として、`MOVE PARTITION` 操作はハードリンクを利用することで軽量かつアトミックです。つまり、中間状態を残さず、失敗するか成功するかのどちらか一方になります。

このプロセスは、後述のバックフィルシナリオで多用します。

このプロセスでは、ユーザーが各挿入操作のサイズを選択する必要があることに注意してください。

より大きな挿入、すなわちより多くの行を一度に挿入すると、必要な `MOVE PARTITION` 操作の回数は減少します。ただし、ネットワーク中断などによる挿入失敗時の復旧コストとのバランスを取る必要があります。ユーザーは、ファイルをバッチ処理することで、このプロセスを補完し、リスクを低減できます。これは範囲クエリ（例：`WHERE timestamp BETWEEN 2024-12-17 09:00:00 AND 2024-12-17 10:00:00`）またはグロブパターンのいずれかで実行できます。例えば、次のように実行できます。

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{201..300}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{301..400}.parquet')
--すべてのファイルが読み込まれるまで続行するか、MOVE PARTITION呼び出しを実行
```

:::note
ClickPipes はオブジェクトストレージからデータをロードする際にこの手法を用い、ターゲットテーブルおよびそのマテリアライズドビューの複製を自動的に作成することで、ユーザーが上記の手順を実行する必要をなくします。さらに、複数のワーカースレッドを使用し、それぞれが異なるサブセット（glob パターンを使用）を処理し、専用の複製テーブルを持つことで、厳密な「1 回だけ」セマンティクスを維持しつつ、高速にデータをロードできます。詳細に興味がある方は、[このブログ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)を参照してください。
:::


## シナリオ1: 既存のデータ取り込みを伴うデータのバックフィル {#scenario-1-backfilling-data-with-existing-data-ingestion}

このシナリオでは、バックフィルするデータが独立したバケットに存在せず、フィルタリングが必要であることを前提としています。データは既に挿入されており、履歴データをバックフィルする必要がある基準となるタイムスタンプまたは単調増加カラムを特定できます。

このプロセスは以下の手順に従います:

1. チェックポイントを特定する - 履歴データを復元する必要がある基準となるタイムスタンプまたはカラム値を特定します。
2. メインテーブルとマテリアライズドビューのターゲットテーブルの複製を作成します。
3. 手順(2)で作成したターゲットテーブルを参照するマテリアライズドビューのコピーを作成します。
4. 手順(2)で作成した複製メインテーブルにデータを挿入します。
5. 複製テーブルから元のバージョンにすべてのパーティションを移動します。複製テーブルを削除します。

例えば、PyPIデータにおいてデータがロードされているとします。最小タイムスタンプを特定することで、「チェックポイント」を決定できます。

```sql
SELECT min(timestamp)
FROM pypi

┌──────min(timestamp)─┐
│ 2024-12-17 09:00:00 │
└─────────────────────┘

1 row in set. Elapsed: 0.163 sec. Processed 1.34 billion rows, 5.37 GB (8.24 billion rows/s., 32.96 GB/s.)
Peak memory usage: 227.84 MiB.
```

上記から、`2024-12-17 09:00:00`より前のデータをロードする必要があることがわかります。先述のプロセスを使用して、複製テーブルとビューを作成し、タイムスタンプでフィルタリングしてサブセットをロードします。

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

0 rows in set. Elapsed: 500.152 sec. Processed 2.74 billion rows, 364.40 GB (5.47 million rows/s., 728.59 MB/s.)
```

:::note
Parquetのタイムスタンプカラムに対するフィルタリングは非常に効率的です。ClickHouseはロードする完全なデータ範囲を特定するためにタイムスタンプカラムのみを読み取り、ネットワークトラフィックを最小化します。min-maxなどのParquetインデックスも、ClickHouseクエリエンジンによって活用されます。
:::

この挿入が完了したら、関連するパーティションを移動できます。

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads
```

履歴データが独立したバケットにある場合、上記の時間フィルタは不要です。時間カラムまたは単調カラムが利用できない場合は、履歴データを分離してください。

:::note ClickHouse CloudではClickPipesを使用してください
ClickHouse Cloudユーザーは、データを独自のバケットに分離できる場合(フィルタが不要な場合)、履歴バックアップの復元にClickPipesを使用してください。複数のワーカーでロードを並列化してロード時間を短縮するだけでなく、ClickPipesは上記のプロセスを自動化し、メインテーブルとマテリアライズドビューの両方の複製テーブルを作成します。
:::


## シナリオ2: 既存のテーブルにマテリアライズドビューを追加する {#scenario-2-adding-materialized-views-to-existing-tables}

大量のデータが既に投入され、データの挿入が継続されているセットアップに対して、新しいマテリアライズドビューを追加する必要が生じることは珍しくありません。ストリーム内の特定の時点を識別するために使用できるタイムスタンプまたは単調増加列は、この場合に有用であり、データ取り込みの一時停止を回避できます。以下の例では、両方のケースを想定し、取り込みの一時停止を回避するアプローチを優先します。

:::note POPULATEの使用を避ける
取り込みが一時停止されている小規模なデータセット以外では、マテリアライズドビューのバックフィルに[`POPULATE`](/sql-reference/statements/create/view#materialized-view)コマンドを使用することは推奨しません。この演算子は、populateハッシュが完了した後にマテリアライズドビューが作成されるため、ソーステーブルに挿入された行を見逃す可能性があります。さらに、このpopulateはすべてのデータに対して実行されるため、大規模なデータセットでは中断やメモリ制限の影響を受けやすくなります。
:::

### タイムスタンプまたは単調増加列が利用可能な場合 {#timestamp-or-monotonically-increasing-column-available}

この場合、新しいマテリアライズドビューには、将来の任意の日時より大きい行に制限するフィルタを含めることを推奨します。その後、メインテーブルの履歴データを使用して、この日時からマテリアライズドビューをバックフィルできます。バックフィルのアプローチは、データサイズと関連するクエリの複雑さに依存します。

最もシンプルなアプローチには、以下の手順が含まれます:

1. 近い将来の任意の時刻より大きい行のみを考慮するフィルタを持つマテリアライズドビューを作成します。
2. マテリアライズドビューのターゲットテーブルに挿入する`INSERT INTO SELECT`クエリを実行し、ビューの集約クエリを使用してソーステーブルから読み取ります。

これは、手順(2)でデータのサブセットをターゲットにしたり、マテリアライズドビュー用の複製ターゲットテーブルを使用したり(挿入完了後に元のテーブルにパーティションをアタッチ)することで、障害後の復旧を容易にするためにさらに強化できます。

以下のマテリアライズドビューを考えてみましょう。これは、1時間ごとの最も人気のあるプロジェクトを計算します。

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

ターゲットテーブルを追加できますが、マテリアライズドビューを追加する前に、その`SELECT`句を変更して、近い将来の任意の時刻より大きい行のみを考慮するフィルタを含めます。この場合、`2024-12-17 09:00:00`が数分後であると仮定します。

```sql
CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) AS hour,
 project, count() AS count
FROM pypi WHERE timestamp >= '2024-12-17 09:00:00'
GROUP BY hour, project
```

このビューが追加されたら、この日時より前のマテリアライズドビューのすべてのデータをバックフィルできます。

これを行う最もシンプルな方法は、最近追加されたデータを無視するフィルタを使用してメインテーブル上でマテリアライズドビューのクエリを実行し、`INSERT INTO SELECT`を介して結果をビューのターゲットテーブルに挿入することです。例えば、上記のビューの場合:

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

0 rows in set. Elapsed: 2.830 sec. Processed 798.89 million rows, 17.40 GB (282.28 million rows/s., 6.15 GB/s.)
Peak memory usage: 543.71 MiB.
```

:::note
上記の例では、ターゲットテーブルは[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)です。この場合、元の集約クエリをそのまま使用できます。[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)を活用するより複雑なユースケースでは、ユーザーは集約に`-State`関数を使用します。この例は[こちら](/integrations/s3/performance#be-aware-of-merges)で確認できます。
:::


このケースでは、比較的軽量な集計であり、3秒未満で完了し、600MiB未満のメモリを使用します。より複雑な、または長時間実行される集計の場合、ユーザーは前述の重複テーブルアプローチを使用することで、このプロセスをより堅牢にすることができます。つまり、シャドウターゲットテーブル(例:`pypi_downloads_per_day_v2`)を作成し、そこに挿入し、結果として得られるパーティションを`pypi_downloads_per_day`にアタッチします。

マテリアライズドビューのクエリは、より複雑になることがよくあります(そうでなければユーザーはビューを使用しないため、珍しいことではありません)し、リソースを消費します。まれなケースでは、クエリに必要なリソースがサーバーの能力を超えることがあります。これは、ClickHouseマテリアライズドビューの利点の1つを示しています。つまり、インクリメンタルであり、データセット全体を一度に処理しないということです。

この場合、ユーザーにはいくつかのオプションがあります:

1. クエリを変更して範囲をバックフィルする。例:`WHERE timestamp BETWEEN 2024-12-17 08:00:00 AND 2024-12-17 09:00:00`、`WHERE timestamp BETWEEN 2024-12-17 07:00:00 AND 2024-12-17 08:00:00`など。
2. [Nullテーブルエンジン](/engines/table-engines/special/null)を使用してマテリアライズドビューを埋める。これは、マテリアライズドビューの典型的なインクリメンタルな投入を再現し、設定可能なサイズのデータブロックに対してクエリを実行します。

(1)は最もシンプルなアプローチであり、多くの場合十分です。簡潔さのため、例は含めません。

以下では(2)をさらに詳しく説明します。

#### マテリアライズドビューの埋め込みにNullテーブルエンジンを使用する {#using-a-null-table-engine-for-filling-materialized-views}

[Nullテーブルエンジン](/engines/table-engines/special/null)は、データを永続化しないストレージエンジンを提供します(テーブルエンジンの世界における`/dev/null`と考えてください)。これは矛盾しているように見えますが、マテリアライズドビューは、このテーブルエンジンに挿入されたデータに対して引き続き実行されます。これにより、元のデータを永続化せずにマテリアライズドビューを構築できます。つまり、I/Oと関連するストレージを回避できます。

重要なことに、テーブルエンジンにアタッチされたマテリアライズドビューは、データが挿入される際にデータブロックに対して引き続き実行され、その結果をターゲットテーブルに送信します。これらのブロックは設定可能なサイズです。より大きなブロックは、より効率的(かつ処理が高速)になる可能性がありますが、より多くのリソース(主にメモリ)を消費します。このテーブルエンジンを使用することで、マテリアライズドビューをインクリメンタルに、つまり一度に1ブロックずつ構築できます。これにより、集計全体をメモリに保持する必要がなくなります。

<Image img={nullTableMV} size='md' alt='Denormalization in ClickHouse' />

<br />

次の例を考えてみましょう:

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

ここでは、マテリアライズドビューの構築に使用される行を受け取るために、Nullテーブル`pypi_v2`を作成します。スキーマを必要な列のみに制限していることに注意してください。マテリアライズドビューは、このテーブルに挿入された行に対して(一度に1ブロックずつ)集計を実行し、結果をターゲットテーブル`pypi_downloads_per_day`に送信します。

:::note
ここでは、ターゲットテーブルとして`pypi_downloads_per_day`を使用しています。追加の堅牢性を得るために、ユーザーは重複テーブル`pypi_downloads_per_day_v2`を作成し、前の例で示したように、これをビューのターゲットテーブルとして使用できます。挿入が完了したら、`pypi_downloads_per_day_v2`のパーティションを`pypi_downloads_per_day`に移動できます。これにより、メモリの問題やサーバーの中断により挿入が失敗した場合に回復できます。つまり、`pypi_downloads_per_day_v2`をトランケートし、設定を調整して、再試行するだけです。
:::

このマテリアライズドビューを投入するには、`pypi`から`pypi_v2`にバックフィルする関連データを単純に挿入します。

```sql
INSERT INTO pypi_v2 SELECT timestamp, project FROM pypi WHERE timestamp < '2024-12-17 09:00:00'

0 rows in set. Elapsed: 27.325 sec. Processed 1.50 billion rows, 33.48 GB (54.73 million rows/s., 1.23 GB/s.)
Peak memory usage: 639.47 MiB.
```

ここでのメモリ使用量が`639.47 MiB`であることに注意してください。


##### パフォーマンスとリソースのチューニング {#tuning-performance--resources}

上記のシナリオにおけるパフォーマンスとリソース使用量は、いくつかの要因によって決定されます。チューニングを試みる前に、[S3の挿入と読み取りパフォーマンスの最適化ガイド](/integrations/s3/performance)の[読み取りにスレッドを使用する](/integrations/s3/performance#using-threads-for-reads)セクションで詳細に説明されている挿入メカニズムを理解することを推奨します。要約すると:

- **読み取り並列性** - 読み取りに使用されるスレッド数。[`max_threads`](/operations/settings/settings#max_threads)で制御されます。ClickHouse Cloudでは、インスタンスサイズによって決定され、デフォルトではvCPU数に設定されます。この値を増やすと、メモリ使用量が増加する代わりに読み取りパフォーマンスが向上する可能性があります。
- **挿入並列性** - 挿入に使用される挿入スレッド数。[`max_insert_threads`](/operations/settings/settings#max_insert_threads)で制御されます。ClickHouse Cloudでは、インスタンスサイズによって決定され(2から4の間)、OSSでは1に設定されます。この値を増やすと、メモリ使用量が増加する代わりにパフォーマンスが向上する可能性があります。
- **挿入ブロックサイズ** - データはループ内で処理され、[パーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key)に基づいて取得、解析され、メモリ内挿入ブロックに形成されます。これらのブロックはソート、最適化、圧縮され、新しい[データパート](/parts)としてストレージに書き込まれます。挿入ブロックのサイズは、設定[`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)と[`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)(非圧縮)によって制御され、メモリ使用量とディスクI/Oに影響します。ブロックが大きいほどメモリ使用量は増えますが、作成されるパート数が減少し、I/Oとバックグラウンドマージが削減されます。これらの設定は最小しきい値を表します(いずれかが最初に到達するとフラッシュがトリガーされます)。
- **マテリアライズドビューのブロックサイズ** - メイン挿入の上記のメカニズムに加えて、マテリアライズドビューへの挿入前に、より効率的な処理のためにブロックも集約されます。これらのブロックのサイズは、設定[`min_insert_block_size_bytes_for_materialized_views`](/operations/settings/settings#min_insert_block_size_bytes_for_materialized_views)と[`min_insert_block_size_rows_for_materialized_views`](/operations/settings/settings#min_insert_block_size_rows_for_materialized_views)によって決定されます。ブロックが大きいほど、メモリ使用量が増加する代わりに、より効率的な処理が可能になります。デフォルトでは、これらの設定はそれぞれソーステーブルの設定[`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)と[`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)の値に戻ります。

パフォーマンスを向上させるには、[S3の挿入と読み取りパフォーマンスの最適化ガイド](/integrations/s3/performance)の[挿入のためのスレッドとブロックサイズのチューニング](/integrations/s3/performance#tuning-threads-and-block-size-for-inserts)セクションで概説されているガイドラインに従ってください。ほとんどの場合、パフォーマンスを向上させるために`min_insert_block_size_bytes_for_materialized_views`と`min_insert_block_size_rows_for_materialized_views`を変更する必要はありません。これらを変更する場合は、`min_insert_block_size_rows`と`min_insert_block_size_bytes`について説明したのと同じベストプラクティスを使用してください。

メモリを最小化するには、これらの設定を試してみることができます。ただし、これは必然的にパフォーマンスを低下させます。先ほどのクエリを使用して、以下に例を示します。

`max_insert_threads`を1に下げると、メモリオーバーヘッドが削減されます。

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1

0 rows in set. Elapsed: 27.752 sec. Processed 1.50 billion rows, 33.48 GB (53.89 million rows/s., 1.21 GB/s.)
Peak memory usage: 506.78 MiB.
```

`max_threads`設定を1に減らすことで、メモリをさらに削減できます。

```sql
INSERT INTO pypi_v2
SELECT timestamp, project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1

Ok.

0 rows in set. Elapsed: 43.907 sec. Processed 1.50 billion rows, 33.48 GB (34.06 million rows/s., 762.54 MB/s.)
Peak memory usage: 272.53 MiB.
```


最後に、`min_insert_block_size_rows`を0に設定(ブロックサイズの決定要因として無効化)し、`min_insert_block_size_bytes`を10485760(10MiB)に設定することで、メモリをさらに削減できます。

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1, min_insert_block_size_rows = 0, min_insert_block_size_bytes = 10485760

0 rows in set. Elapsed: 43.293 sec. Processed 1.50 billion rows, 33.48 GB (34.54 million rows/s., 773.36 MB/s.)
Peak memory usage: 218.64 MiB.
```

なお、ブロックサイズを小さくすると、より多くのパートが生成され、マージの負荷が高まることに注意してください。[こちら](/integrations/s3/performance#be-aware-of-merges)で説明されているように、これらの設定は慎重に変更する必要があります。

### タイムスタンプまたは単調増加列がない場合 {#no-timestamp-or-monotonically-increasing-column}

上記のプロセスは、タイムスタンプまたは単調増加列が存在することを前提としています。場合によっては、これらが利用できないことがあります。この場合、以前に説明した手順の多くを活用しつつ、インジェストを一時停止する必要がある次のプロセスを推奨します。

1. メインテーブルへの挿入を一時停止します。
2. `CREATE AS`構文を使用して、メインターゲットテーブルの複製を作成します。
3. [`ALTER TABLE ATTACH`](/sql-reference/statements/alter/partition#attach-partitionpart)を使用して、元のターゲットテーブルからパーティションを複製にアタッチします。**注意:** このアタッチ操作は、以前使用した移動とは異なります。ハードリンクに依存しますが、元のテーブルのデータは保持されます。
4. 新しいマテリアライズドビューを作成します。
5. 挿入を再開します。**注意:** 挿入はターゲットテーブルのみを更新し、元のデータのみを参照する複製は更新されません。
6. 複製テーブルをソースとして使用し、タイムスタンプを持つデータに対して上記で使用したのと同じプロセスを適用して、マテリアライズドビューをバックフィルします。

PyPIと以前の新しいマテリアライズドビュー`pypi_downloads_per_day`を使用した次の例を考えてみましょう(タイムスタンプを使用できないと仮定します):

```sql
SELECT count() FROM pypi

┌────count()─┐
│ 2039988137 │ -- 20.4億
└────────────┘

1 row in set. Elapsed: 0.003 sec.

-- (1) 挿入を一時停止
-- (2) ターゲットテーブルの複製を作成

CREATE TABLE pypi_v2 AS pypi

SELECT count() FROM pypi_v2

┌────count()─┐
│ 2039988137 │ -- 20.4億
└────────────┘

1 row in set. Elapsed: 0.004 sec.

-- (3) 元のターゲットテーブルからパーティションを複製にアタッチ

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

-- (4) 挿入を再開。ここでは単一行を挿入することで再現

INSERT INTO pypi SELECT *
FROM pypi
LIMIT 1

SELECT count() FROM pypi

┌────count()─┐
│ 2039988138 │ -- 20.4億
└────────────┘

1 row in set. Elapsed: 0.003 sec.

-- pypi_v2が以前と同じ行数を含んでいることに注意

SELECT count() FROM pypi_v2
┌────count()─┐
│ 2039988137 │ -- 20.4億
└────────────┘

-- (5) バックアップpypi_v2を使用してビューをバックフィル

INSERT INTO pypi_downloads_per_day SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi_v2
GROUP BY
    hour,
 project

0 rows in set. Elapsed: 3.719 sec. Processed 2.04 billion rows, 47.15 GB (548.57 million rows/s., 12.68 GB/s.)
```


DROP TABLE pypi&#95;v2;

```

最後から2番目のステップでは、[前述](#timestamp-or-monotonically-increasing-column-available)のシンプルな`INSERT INTO SELECT`アプローチを使用して`pypi_downloads_per_day`をバックフィルします。これは、[上記](#using-a-null-table-engine-for-filling-materialized-views)で説明したNullテーブルアプローチを使用して拡張することもでき、オプションで複製テーブルを使用することでより高い耐障害性を実現できます。

この操作では挿入を一時停止する必要がありますが、中間操作は通常迅速に完了するため、データの中断を最小限に抑えられます。
```
