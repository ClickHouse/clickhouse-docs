---
slug: /data-modeling/backfilling
title: データのバックフィル
description: ClickHouseで大規模データセットのバックフィルを使用する方法
keywords: [マテリアライズドビュー, バックフィル, データ挿入, 耐障害性データロード]
---

# データのバックフィル

ClickHouseの初心者であろうと、既存の展開を担当しているユーザーであろうと、ユーザーは必ず過去のデータでテーブルをバックフィルする必要があります。場合によっては、これが比較的簡単なこともありますが、マテリアライズドビューを populated する必要がある場合は、より複雑になることがあります。このガイドでは、ユーザーが自分のユースケースに適用できるこのタスクに関するいくつかのプロセスを文書化しています。

:::note
このガイドでは、ユーザーが[インクリメンタルマテリアライズドビュー](/materialized-view)と、s3やgcsなどのテーブル関数を使用した[データロード](/integrations/s3)の概念にすでに慣れていることを前提としています。また、ユーザーには[オブジェクトストレージからの挿入パフォーマンスの最適化](/integrations/s3/performance)に関するガイドを読むことをお勧めします。このアドバイスは、このガイド全体の挿入に適用できます。
:::

## 例のデータセット {#example-dataset}

このガイド全体では、PyPIデータセットを使用します。このデータセットの各行は、`pip`などのツールを使用したPythonパッケージのダウンロードを表します。

たとえば、このサブセットは、単一の日 - `2024-12-17` をカバーしており、`https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/` で公開されています。ユーザーは次のようにクエリを実行できます。

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 20.40億
└────────────┘

1 row in set. Elapsed: 32.726 sec. Processed 2.04 billion rows, 170.05 KB (62.34 million rows/s., 5.20 KB/s.)
Peak memory usage: 239.50 MiB.
```

このバケットの全データセットは、320GBを超えるparquetファイルを含んでいます。以下の例では、意図的にグロブパターンを使用してサブセットをターゲットとします。

ユーザーは、この日以降のデータを、たとえばKafkaやオブジェクトストレージからのストリームとして受信していると仮定します。このデータのスキーマは以下の通りです。

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
1兆行を超える完全なPyPIデータセットは、私たちの公開デモ環境[clickpy.clickhouse.com](https://clickpy.clickhouse.com)で利用可能です。このデータセットの詳細、デモがパフォーマンスのためにマテリアライズドビューをどのように利用し、データがどのように日次でポピュレートされるかについては[こちら](https://github.com/ClickHouse/clickpy)をご覧ください。
:::

## バックフィルシナリオ {#backfilling-scenarios}

バックフィルは、通常、特定の時点からデータをストリーミングするときに必要です。このデータは[インクリメンタルマテリアライズドビュー](/materialized-view)を使用してClickHouseテーブルに挿入され、ブロックの挿入時にトリガーされます。これらのビューは、挿入の前にデータを変換したり、集計を計算してその結果を後のアプリケーションで使用するためのターゲットテーブルに送信する可能性があります。

以下のシナリオをカバーしようとします。

1. **既存のデータ取り込みでのバックフィル** - 新しいデータがロードされており、過去のデータをバックフィルする必要があります。この過去のデータは特定されています。
2. **既存のテーブルにマテリアライズドビューを追加** - 新しいマテリアライズドビューを、過去のデータがポピュレートされ、すでにデータがストリーミングされているセットアップに追加する必要があります。

すべてのケースで、データ挿入の中断を回避することを目指します。

私たちは、オブジェクトストレージから過去のデータをバックフィルすることをお勧めします。可能な場合は、最適な読み込みパフォーマンスと圧縮（ネットワーク転送の削減）に向けてデータをParquetにエクスポートする必要があります。ファイルサイズは通常約150MBが好まれますが、ClickHouseは[70以上のファイルフォーマット](/interfaces/formats)をサポートしており、あらゆるサイズのファイルを処理することができます。

## 重複テーブルとビューの使用 {#using-duplicate-tables-and-views}

すべてのシナリオにおいて、私たちは「重複テーブルとビュー」の概念に依存します。これらのテーブルとビューは、ライブストリーミングデータに使用されるテーブルとビューのコピーを表し、バックフィルを孤立して実行できるようにし、障害が発生した場合には簡単に回復できる手段を提供します。たとえば、以下の主要な`pypi`テーブルと、Pythonプロジェクトごとのダウンロード数を計算するマテリアライズドビューがあります。

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

私たちはメインテーブルと関連するビューに、データのサブセットでポピュレートします。

```sql
INSERT INTO pypi SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{000..100}.parquet')

0 rows in set. Elapsed: 15.702 sec. Processed 41.23 million rows, 3.94 GB (2.63 million rows/s., 251.01 MB/s.)
Peak memory usage: 977.49 MiB.

SELECT count() FROM pypi

┌──count()─┐
│ 20612750 │ -- 20.61百万
└──────────┘

1 row in set. Elapsed: 0.004 sec.

SELECT sum(count)
FROM pypi_downloads


┌─sum(count)─┐
│   20612750 │ -- 20.61百万
└────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 96.15千 rows, 769.23 KiB (16.53 million rows/s., 132.26 MB/s.)
Peak memory usage: 682.38 KiB.
```

別のサブセット `{101..200}` をロードしたいとします。`pypi` に直接挿入することもできますが、重複テーブルを作成することでこのバックフィルを孤立して行うことができます。

バックフィルが失敗した場合、メインテーブルに影響を与えることはなく、単に[トランケート](/managing-data/truncate)して重複テーブルを再実行できます。

これらのビューの新しいコピーを作成するには、`CREATE TABLE AS`句を`suffix _v2`とともに使用できます。

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

これを使用して、同様のサイズの2番目のサブセットをポピュレートし、正常にロードされたことを確認します。

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')

0 rows in set. Elapsed: 17.545 sec. Processed 40.80 million rows, 3.90 GB (2.33 million rows/s., 222.29 MB/s.)
Peak memory usage: 991.50 MiB.

SELECT count()
FROM pypi_v2

┌──count()─┐
│ 20400020 │ -- 20.40百万
└──────────┘

1 row in set. Elapsed: 0.004 sec.

SELECT sum(count)
FROM pypi_downloads_v2

┌─sum(count)─┐
│   20400020 │ -- 20.40百万
└────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 95.49千 rows, 763.90 KiB (14.81 million rows/s., 118.45 MB/s.)
Peak memory usage: 688.77 KiB.
```

この第2のロード中に何らかの失敗が発生した場合、単に[トランケート](/managing-data/truncate)して `pypi_v2` と `pypi_downloads_v2` を再ロードできます。

データロードが完了したら、[`ALTER TABLE MOVE PARTITION`](/sql-reference/statements/alter/partition#move-partition-to-table)句を使用して、重複テーブルからメインテーブルにデータを移動できます。

```sql
ALTER TABLE pypi
 (MOVE PARTITION () FROM pypi_v2)

0 rows in set. Elapsed: 1.401 sec.

ALTER TABLE pypi_downloads
 (MOVE PARTITION () FROM pypi_downloads_v2)

0 rows in set. Elapsed: 0.389 sec.
```

:::note パーティション名
上記の`MOVE PARTITION`呼び出しでは、パーティション名 `()` が使用されています。これは、このテーブルの唯一のパーティションを表しています（パーティションされていない）。テーブルがパーティションされている場合、ユーザーは各パーティションごとに複数の `MOVE PARTITION` 呼び出しを行う必要があります。現在のパーティションの名前は、[`system.parts`](/operations/system-tables/parts)テーブルから取得できます。たとえば、`SELECT DISTINCT partition FROM system.parts WHERE (table = 'pypi_v2')` のように確認できます。
:::

これで、`pypi` と `pypi_downloads` が完全なデータを含むことを確認できます。`pypi_downloads_v2` と `pypi_v2` は安全に削除できます。

```sql
SELECT count()
FROM pypi

┌──count()─┐
│ 41012770 │ -- 41.01百万
└──────────┘

1 row in set. Elapsed: 0.003 sec.

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   41012770 │ -- 41.01百万
└────────────┘

1 row in set. Elapsed: 0.007 sec. Processed 191.64千 rows, 1.53 MB (27.34 million rows/s., 218.74 MB/s.)

SELECT count()
FROM pypi_v2
```

重要なことに、`MOVE PARTITION` 操作は軽量（ハードリンクを利用）であり、アトミックです。つまり、中間状態がなく、成功または失敗しかありません。

私たちは、このプロセスを以下のバックフィルシナリオで重用します。

このプロセスでは、ユーザーに各挿入操作のサイズを決定する必要があります。

より大きな挿入、すなわちより多くの行は、必要な `MOVE PARTITION` 操作を減少させます。ただし、これは、挿入の失敗（たとえば、ネットワークの中断による回復時）におけるコストとバランスを取る必要があります。ユーザーは、リスクを減らすためにファイルをバッチ処理することでこのプロセスを補完できます。これは、範囲クエリ（例: `WHERE timestamp BETWEEN 2024-12-17 09:00:00 AND 2024-12-17 10:00:00`）やグロブパターンを使用して実行できます。たとえば、

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{201..300}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{301..400}.parquet')
-- すべてのファイルがロードされるまで続行または MOVE PARTITION が実行される
```

:::note
ClickPipesは、オブジェクトストレージからデータをロードする際にこのアプローチを使用し、ターゲットテーブルとそのマテリアライズドビューの重複を自動生成し、ユーザーが上記の手順を実行する必要がなくなります。異なるサブセット（グロブパターンを介して）を処理する各スレッドで複数のワーカースレッドを使用することにより、データをすばやくロードし、正確に一度のセマンティクスを持たせることができます。さらに詳細を知りたい方は、[このブログ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)を参照してください。
:::

## シナリオ1: 既存のデータ取り込みでのバックフィル {#scenario-1-backfilling-data-with-existing-data-ingestion}

このシナリオでは、バックフィルするデータが孤立したバケットにないと仮定し、フィルタリングが必要です。データはすでに挿入されており、履歴データをバックフィルする必要があるタイムスタンプまたは単調増加列を特定できます。

このプロセスは次のステップにしたがって進行します。

1. チェックポイントを特定します - 履歴データを復元する必要のあるタイムスタンプまたは列の値。
2. メインテーブルとマテリアライズドビューのターゲットテーブルの重複を作成します。
3. ステップ(2)で作成したターゲットテーブルを指すマテリアライズドビューのコピーを作成します。
4. ステップ(2)で作成した重複メインテーブルに挿入します。
5. 重複テーブルから元のバージョンにすべてのパーティションを移動します。重複テーブルを削除します。

たとえば、PyPIデータの場合、データがロードされたと仮定します。最小のタイムスタンプを特定できるため、これが「チェックポイント」となります。

```sql
SELECT min(timestamp)
FROM pypi

┌──────min(timestamp)─┐
│ 2024-12-17 09:00:00 │
└─────────────────────┘

1 row in set. Elapsed: 0.163 sec. Processed 1.34 billion rows, 5.37 GB (8.24 billion rows/s., 32.96 GB/s.)
Peak memory usage: 227.84 MiB.
```

上記より、`2024-12-17 09:00:00`より前のデータをロードする必要があることがわかります。以前のプロセスを使用して、重複テーブルとビューを作成し、タイムスタンプのフィルタを使用してサブセットをロードします。

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
Parquetのタイムスタンプ列のフィルタリングは非常に効率的である可能性があります。ClickHouseは、ネットワークトラフィックを最小限に抑えるため、タイムスタンプ列のみを読み取ることで読み込むデータの範囲を特定します。Parquetインデックス（最小-最大など）もClickHouseクエリエンジンによって利用できます。
:::

この挿入が完了したら、関連するパーティションを移動できます。

```sql
ALTER TABLE pypi
 (MOVE PARTITION () FROM pypi_v2)

ALTER TABLE pypi_downloads
 (MOVE PARTITION () FROM pypi_downloads_v2)
```

もし、履歴データが孤立したバケットにある場合は、上記のタイムフィルタは必要ありません。時間または単調増加列が利用できない場合は、履歴データを特定します。

:::note ClickHouse CloudでClickPipesを使用するだけ
ClickHouse Cloudのユーザーは、データが独自のバケットに孤立できる場合は、履歴バックアップを復元するためにClickPipesを使用する必要があります（フィルタが必要ない場合）。大量の作業を持つ複数の作業者でロードを並列化し、ロード時間を短縮し、ClickPipesは上記のプロセスを自動化します - メインテーブルとマテリアライズドビューの重複テーブルを作成します。
:::

## シナリオ2: 既存のテーブルにマテリアライズドビューを追加 {#scenario-2-adding-materialized-views-to-existing-tables}

重要なデータがポピュレートされている設定に新しいマテリアライズドビューを追加する必要があることは珍しくありません。タイムスタンプまたは単調増加する列は、ストリーム内のポイントを特定するのに役立ち、中断を避けることができます。以下の例では、両方のケースを想定し、データ取り込みの中断を回避するアプローチを優先します。

:::note POPULATEを避ける
小規模データセットのバックフィル以外のマテリアライズドビューに[`POPULATE`](/sql-reference/statements/create/view#materialized-view)コマンドを使用することはお勧めしません。このオペレーターは、ポピュレートハッシュが終了する前に、ソーステーブルに挿入された行を失う可能性があります。さらに、このポピュレートはすべてのデータに対して実行され、大規模データセットでは中断やメモリ制限に対して脆弱です。
:::

### タイムスタンプまたは単調増加列が利用可能 {#timestamp-or-monotonically-increasing-column-available}

この場合、新しいマテリアライズドビューには、未来の任意のデータよりも大きい行に制限するフィルタを含めることをお勧めします。マテリアライズドビューは、主テーブルからこの日付以降の履歴データを使ってバックフィルされることができます。バックフィルのアプローチは、データサイズおよび関連クエリの複雑さに依存します。

最もシンプルなアプローチには、次のステップが含まれます。

1. 任意の近い未来の時間よりも大きい行だけを考慮するフィルタを持つマテリアライズドビューを作成します。
2. マテリアライズドビューのターゲットテーブルに挿入する `INSERT INTO SELECT` クエリを実行し、ソーステーブルからビューの集約クエリを読み取ります。

これはまた、ステップ(2)でデータのサブセットをターゲットにしたり、マテリアライズドビューのために重複ターゲットテーブルを使用することで（挿入が完了した後に元のにパーティションを接続する）失敗後の回復を容易にすることができます。

以下のマテリアライズドビューを考慮してください。これは、時間ごとの最も人気のあるプロジェクトを計算します。

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

ターゲットテーブルを追加できますが、マテリアライズドビューを追加する前に、その `SELECT` 句を修正し、未来の任意の時間よりも大きい行だけを考慮するフィルタを追加します。ここでは、「2024-12-17 09:00:00」が数分先と見なされます。

```sql
CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project, count() AS count
FROM pypi WHERE timestamp >= '2024-12-17 09:00:00'
GROUP BY hour, project
```    

このビューが追加されたら、そのデータよりも前にマテリアライズドビューのすべてのデータをバックフィルできます。

最も簡単な方法は、最近追加されたデータを無視するフィルタを持って、主テーブルのクエリを実行し、結果をマテリアライズドビューのターゲットテーブルに挿入する `INSERT INTO SELECT`を実行することです。たとえば、上記のビューについては次のようになります。

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
上記の例では、ターゲットテーブルは[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)です。この場合、元の集約クエリを使用できます。より複雑なユースケースで[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)を活用する場合、ユーザーは集計のために`-State`関数を使用します。この例の詳細は[こちら](/integrations/s3/performance#be-aware-of-merges)で見つけることができます。
:::

私たちのケースでは、これは比較的軽量な集約であり、3秒未満で完了し、600MiB未満のメモリを使用します。より複雑または長時間実行される集約の場合、ユーザーは以前の重複テーブルアプローチを使用して、このプロセスをより堅牢にすることができます。つまり、シャドウターゲットテーブル（たとえば、`pypi_downloads_per_day_v2`）を作成し、ここに挿入し、その結果のパーティションを`pypi_downloads_per_day`に接続することです。

しばしば、マテリアライズドビューのクエリはより複雑になり（さもなければユーザーはビューを使用しません！）、リソースを消費します。稀なケースでは、クエリのリソースがサーバーを超えることがあります。これは、ClickHouseのマテリアライズドビューの利点の1つを強調しています - それらはインクリメンタルであり、全データセットを一度に処理することはありません！

この場合、ユーザーにはいくつかの選択肢があります。

1. クエリを修正して範囲をバックフィルする（例: `WHERE timestamp BETWEEN 2024-12-17 08:00:00 AND 2024-12-17 09:00:00`、`WHERE timestamp BETWEEN 2024-12-17 07:00:00 AND 2024-12-17 08:00:00`など）。
2. [Nullテーブルエンジン](/engines/table-engines/special/null)を使用してマテリアライズドビューを満たす。これにより、通常のインクリメンタルなマテリアライズドビューの構築が復元され、データのブロック単位でクエリが実行されます（サイズは設定可能）。

（1）は最もシンプルなアプローチを表しており、しばしば十分です。簡潔にするため、例は含めていません。

以下で（2）をさらに詳しく見ていきます。

#### マテリアライズドビューの充填にNullテーブルエンジンを使用 {#using-a-null-table-engine-for-filling-materialized-views}

[Nullテーブルエンジン](/engines/table-engines/special/null)は、データを保持しないストレージエンジンを提供します（テーブルエンジンの世界の`/dev/null`のように考えてください）。これは矛盾しているように思えますが、マテリアライズドビューは、このテーブルエンジンに挿入されたデータで引き続き実行されます。これにより、元のデータを保存することなくマテリアライズドビューを構築でき、I/Oおよび関連するストレージを回避します。

重要なのは、このテーブルエンジンに接続されているすべてのマテリアライズドビューは、挿入されるデータのブロック単位で引き続き実行され、結果をターゲットテーブルに送信します。これらのブロックはサイズを設定可能であり、より大きなブロックはより効率的（かつ迅速）に処理される可能性がありますが、より多くのリソース（主にメモリ）を消費します。このテーブルエンジンの使用により、マテリアライズドビューをインクリメンタルに、つまり1回のブロックずつ構築でき、全体の集計をメモリに保持する必要がなくなります。

<img src={require('./images/null_table_mv.png').default}
  class='image'
  alt='ClickHouseにおける非正規化'
  style={{width: '50%', background: 'none' }} />

<br />

次の例を考えます。

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

ここでは、マテリアライズドビューを構築するために`pypi_v2`というNullテーブルを作成します。どうやって、必要な列だけに限ったスキーマを制限します。私たちのマテリアライズドビューは、このテーブルに挿入された行（1回のブロックずつ）に対して集約を実行し、結果をターゲットテーブル`pypi_downloads_per_day`に送信します。

:::note
ここでは、ターゲットテーブルとして`pypi_downloads_per_day`を使用しました。追加の耐久性のため、ユーザーは以前の例のように、マテリアライズドビューのターゲットテーブルとして重複テーブル`pypi_downloads_per_day_v2`を作成することができます。挿入完了後に`pypi_downloads_per_day_v2`のパーティションを`pypi_downloads_per_day`に移動できます。これにより、メモリの問題やサーバーの中断による挿入の失敗時に回復が可能になります。つまり、単に`pypi_downloads_per_day_v2`をトランケートし、設定を調整して再試行するだけです。
:::

このマテリアライズドビューをポピュレートするために、私たちは単に`pypi`から`pypi_v2`にバックフィルするための関連データを挿入します。

```sql
INSERT INTO pypi_v2 SELECT timestamp, project FROM pypi WHERE timestamp < '2024-12-17 09:00:00'

0 rows in set. Elapsed: 27.325 sec. Processed 1.50 billion rows, 33.48 GB (54.73 million rows/s., 1.23 GB/s.)
Peak memory usage: 639.47 MiB.
```

ここで、メモリ使用量が `639.47 MiB` であることに注意してください。

##### パフォーマンスとリソースの調整 {#tuning-performance--resources}

上記のシナリオにおけるパフォーマンスと使用されるリソースは、多くの要因によって決まります。チューニングを試みる前に、挿入メカニクスについて詳しく説明された文書を理解することをお勧めします[ここ](/integrations/s3/performance#using-threads-for-reads)。概略には次のようになります。

- **読み取りの並列性** - 読みに使用されるスレッドの数。[`max_threads`](/operations/settings/settings#max_threads)で制御されます。ClickHouse Cloudでは、これはインスタンスサイズによって決まり、通常はvCPU数に基づいています。この値を増やすことで、メモリ使用量が増加する代償として読み取り性能を向上させることができます。
- **挿入の並列性** - 挿入に使用されるスレッドの数。[`max_insert_threads`](/operations/settings/settings#max_insert_threads)で制御され、ClickHouse Cloudではインスタンスサイズ（2から4の間）によって決定され、OSSでは1に設定されています。この値を増やすことで、メモリ使用量が増加する代償としてパフォーマンスを向上させることができます。
- **挿入ブロックサイズ** - データはループで処理され、プル、パースされ、[パーティションキー](/engines/table-engines/mergetree-family/custom-partitioning-key)に基づいてメモリ挿入ブロックに形成されます。これらのブロックは並べ替えられ、最適化され、圧縮され、新しい[データパーツ](/parts)としてストレージに書き込まれます。挿入ブロックのサイズは、[`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)と[`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（非圧縮）で制御され、メモリ使用とディスクI/Oに影響します。より大きなブロックはより多くのメモリを使用しますが、より少ないパーツを作成し、I/Oとバックグラウンドマージを減少させます。これらの設定は最小スレッシュホールドを表し（どちらかが最初に到達した場合、フラッシュがトリガーされます）。
- **マテリアライズドビューのブロックサイズ** - さらに、主挿入に先立ってマテリアライズドビューへの挿入のために、ブロックも効率的に処理されるように圧縮されます。これらのブロックのサイズは、[`min_insert_block_size_bytes_for_materialized_views`](/operations/settings/settings#min_insert_block_size_bytes_for_materialized_views)と[`min_insert_block_size_rows_for_materialized_views`](/operations/settings/settings#min_insert_block_size_rows_for_materialized_views)の設定によって決まります。より大きなブロックは、より大きなメモリ使用量の代償として、より効率的な処理を許可します。デフォルトでは、これらの設定はソーステーブルの設定[`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)と[`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)の値に戻ります。

パフォーマンス向上のために、ユーザーは[ここ](/integrations/s3/performance#tuning-threads-and-block-size-for-inserts)で概説されたガイドラインに従うことができます。ほとんどの場合、パフォーマンス向上のために`min_insert_block_size_bytes_for_materialized_views`および`min_insert_block_size_rows_for_materialized_views`を変更する必要はありません。これらを変更した場合、`min_insert_block_size_rows`および`min_insert_block_size_bytes`の推奨最良実施に従い、同じベストプラクティスを利用してください。

メモリを最小限にするために、ユーザーはこれらの設定での実験を望むかもしれません。これは必然的にパフォーマンスを低下させます。以前のクエリを使用して、以下のように例を示します。

`max_insert_threads`を1に下げるとメモリのオーバーヘッドが削減されます。

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

`max_threads`を1に設定すると、さらにメモリを低下させることができます。

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

最終的には、`min_insert_block_size_rows`を0（ブロックサイズの決定要素として無効化）し、`min_insert_block_size_bytes`を10485760（10MiB）に設定することで、さらなるメモリ削減が可能です。

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

最終的に、ブロックサイズを下げると、より多くのパーツが生成され、マージプレッシャが増加することに注意してください。これらの設定は慎重に変更すべきです[ここ](/integrations/s3/performance#be-aware-of-merges)で言及しています。

### タイムスタンプまたは単調増加列がない場合 {#no-timestamp-or-monotonically-increasing-column}
上記のプロセスは、ユーザーがタイムスタンプまたは単調増加カラムを持っていることに依存しています。これが利用できない場合、ユーザーにはデータの取り込みを一時停止する必要がありますが、以下のプロセスをお勧めします。これは、前述の多くのステップを利用しながらも、ユーザーが取り込みを一時停止することを必要とします。

1. メインテーブルへの挿入を一時停止します。
2. `CREATE AS` 構文を使用して、メインのターゲットテーブルの複製を作成します。
3. [`ALTER TABLE ATTACH`](/sql-reference/statements/alter/partition#attach-partitionpart) を使用して、元のターゲットテーブルから複製にパーティションを添付します。**注意:** このアタッチ操作は、以前に使用した移動とは異なります。ハードリンクに依存しながら、元のテーブルのデータは保持されます。
4. 新しいマテリアライズドビューを作成します。
5. 挿入を再開します。**注意:** 挿入はターゲットテーブルのみを更新し、複製は元のデータのみを参照します。
6. タイムスタンプのあるデータに対して上記と同じプロセスを適用し、複製テーブルをソースとしてマテリアライズドビューをバックフィルします。

以下は、PyPIと以前の新しいマテリアライズドビュー `pypi_downloads_per_day` を使用した例です（タイムスタンプが使用できないと仮定します）。

```sql
SELECT count() FROM pypi

┌────count()─┐
│ 2039988137 │ -- 20億3998万8137
└────────────┘

1 行がセットに含まれています。経過時間: 0.003 秒。

-- (1) 挿入を一時停止
-- (2) ターゲットテーブルの複製を作成

CREATE TABLE pypi_v2 AS pypi

SELECT count() FROM pypi_v2

┌────count()─┐
│ 2039988137 │ -- 20億3998万8137
└────────────┘

1 行がセットに含まれています。経過時間: 0.004 秒。

-- (3) 元のターゲットテーブルから複製にパーティションを添付します。

ALTER TABLE pypi_v2
 (ATTACH PARTITION tuple() FROM pypi)

-- (4) 新しいマテリアライズドビューを作成します。

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

-- (5) 挿入を再開します。ここでは一行を挿入することで複製しています。

INSERT INTO pypi SELECT *
FROM pypi
LIMIT 1

SELECT count() FROM pypi

┌────count()─┐
│ 2039988138 │ -- 20億3998万8138
└────────────┘

1 行がセットに含まれています。経過時間: 0.003 秒。

-- pypi_v2が以前と同じ行数を保持していることに注意してください

SELECT count() FROM pypi_v2
┌────count()─┐
│ 2039988137 │ -- 20億3998万8137
└────────────┘

-- (6) バックフィルで pypi_v2 を使用します。

INSERT INTO pypi_downloads_per_day SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi_v2
GROUP BY
    hour,
 project

0 行がセットに含まれています。経過時間: 3.719 秒。処理された行数: 20億行、サイズ: 47.15 GB (548.57万行/秒、12.68 GB/秒)。

DROP TABLE pypi_v2;
```

最後から二番目のステップでは、私たちのシンプルな `INSERT INTO SELECT` アプローチを使用して `pypi_downloads_per_day` をバックフィルします。これは、上記でドキュメント化されたNullテーブルアプローチを使用して強化することも可能であり、より堅牢性を加えるために複製テーブルをオプションとして使用することができます。

この操作は挿入を一時停止する必要がありますが、中間操作は通常迅速に完了できるため、データの中断を最小限に抑えることができます。
