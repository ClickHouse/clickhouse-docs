---
slug: '/data-modeling/backfilling'
title: 'バックフィーリングデータ'
description: 'ClickHouse で大規模なデータセットをバックフィルする方法'
keywords:
- 'materialized views'
- 'backfilling'
- 'inserting data'
- 'resilient data load'
---

import nullTableMV from '@site/static/images/data-modeling/null_table_mv.png';
import Image from '@theme/IdealImage';



# データのバックフィル

ClickHouseに新しく触れているユーザーや、既存のデプロイメントを担当しているユーザーは、必然的に歴史的データでテーブルをバックフィルする必要があります。場合によっては、比較的シンプルですが、物理的なビューをポピュレートする必要がある場合は、より複雑になることがあります。このガイドでは、ユーザーが自分のユースケースに適用できるこのタスクのためのいくつかのプロセスをドキュメントしています。

:::note
このガイドは、ユーザーが[増分物理ビュー](/materialized-view/incremental-materialized-view)や、s3やgcsなどのテーブル関数を使用した[データのロード](/integrations/s3)の概念に既に慣れていることを前提としています。また、ユーザーが[オブジェクトストレージからの挿入パフォーマンスの最適化](/integrations/s3/performance)に関するガイドを読むことをお勧めしており、そのアドバイスはこのガイド全体の挿入に適用できます。
:::
## 例データセット {#example-dataset}

このガイドでは、PyPIデータセットを使用します。このデータセットの各行は、`pip`などのツールを使用したPythonパッケージのダウンロードを表します。

例えば、サブセットは単一の日 - `2024-12-17`をカバーしており、このデータは`https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/`で公開されています。ユーザーは以下のようにクエリを実行できます：

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 20.4億
└────────────┘

1行のセット。経過時間: 32.726秒。処理された行数: 20.4億行、170.05 KB (6200万行/s., 5.20 KB/s.)
ピークメモリ使用量: 239.50 MiB.
```

このバケットのフルデータセットには、320 GBを超えるパーケットファイルが含まれています。以下の例では、意図的にグロブパターンを使用してサブセットをターゲットにします。

ユーザーは、例えばKafkaやオブジェクトストレージからこのデータのストリームを消費していると仮定します。この日以降のデータに対して。データのスキーマは以下に示されています：

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
フルPyPIデータセットには、1兆行を超えるデータが含まれており、我々のパブリックデモ環境[clickpy.clickhouse.com](https://clickpy.clickhouse.com)で入手可能です。このデータセットの詳細や、デモで物理ビューを利用してパフォーマンスを向上させる方法、データが毎日ポピュレートされる方法については、[こちら](https://github.com/ClickHouse/clickpy)をご覧ください。
:::
## バックフィリングシナリオ {#backfilling-scenarios}

バックフィリングは、特定の時点からデータストリームが消費されるときに一般的に必要です。このデータは、[増分物理ビュー](/materialized-view/incremental-materialized-view)でClickHouseテーブルに挿入され、挿入されたブロックにトリガされます。これらのビューは、挿入の前にデータを変換したり、集計を計算してターゲットテーブルに結果を送信したりします。

我々は以下のシナリオをカバーすることを試みます：

1. **既存のデータ取り込みによるバックフィリング** - 新しいデータがロードされており、歴史的データがバックフィルされる必要があります。この歴史的データは特定されています。
2. **既存のテーブルに物理ビジュアルを追加** - 歴史的データがポピュレートされ、データが既にストリーミングされている設定に新しい物理ビューを追加する必要があります。

データはオブジェクトストレージからバックフィルされると仮定します。すべての場合で、データの挿入を中断しないようにすることを目指しています。

オブジェクトストレージから歴史的データをバックフィルすることをお勧めします。データは可能な限りパーケットにエクスポートされ、最適な読み取り性能と圧縮（ネットワーク転送の削減）のために。通常、約150MBのファイルサイズが好まれますが、ClickHouseは[70以上のファイルフォーマット](/interfaces/formats)をサポートしており、すべてのサイズのファイルを処理できます。
## 重複テーブルとビューの使用 {#using-duplicate-tables-and-views}

すべてのシナリオにおいて、我々は「重複テーブルとビュー」の概念に依存しています。これらのテーブルとビューは、ライブストリーミングデータに使用されるもののコピーを表し、バックフィルを孤立して実行できるようにし、失敗が発生した場合に復旧のための簡単な手段を提供します。例えば、以下のようなメインの`pypi` テーブルと、Pythonプロジェクトごとのダウンロード数を計算する物理ビューがあります：

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

メインテーブルと関連するビューをデータのサブセットを使用してポピュレートします：

```sql
INSERT INTO pypi SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{000..100}.parquet')

0行のセット。経過時間: 15.702秒。処理された行数: 4123万行、3.94 GB (263万行/s., 251.01 MB/s.)
ピークメモリ使用量: 977.49 MiB.

SELECT count() FROM pypi

┌──count()─┐
│ 20612750 │ -- 2061万
└──────────┘

1行のセット。経過時間: 0.004秒。

SELECT sum(count)
FROM pypi_downloads


┌─sum(count)─┐
│   20612750 │ -- 2061万
└────────────┘

1行のセット。経過時間: 0.006秒。処理された行数: 96150行、769.23 KB (1653万行/s., 132.26 MB/s.)
ピークメモリ使用量: 682.38 KiB.
```

他のサブセット `{101..200}` をロードしたいと仮定します。`pypi` に直接挿入できるかもしれませんが、重複テーブルを作成することでこのバックフィルを孤立して実行できます。

バックフィルが失敗した場合、メインテーブルには影響を与えず、単純に[truncate](/managing-data/truncate)して重複テーブルを再実行できます。

これらのビューの新しいコピーを作成するには、`CREATE TABLE AS`句を使ってサフィックス`_v2`を用います：

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

おおよそ同じサイズの2番目のサブセットでこれをポピュレートし、成功裏にロードされたことを確認します。

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')

0行のセット。経過時間: 17.545秒。処理された行数: 4080万行、3.90 GB (233万行/s., 222.29 MB/s.)
ピークメモリ使用量: 991.50 MiB.

SELECT count()
FROM pypi_v2

┌──count()─┐
│ 20400020 │ -- 2040万
└──────────┘

1行のセット。経過時間: 0.004秒。

SELECT sum(count)
FROM pypi_downloads_v2

┌─sum(count)─┐
│   20400020 │ -- 2040万
└────────────┘

1行のセット。経過時間: 0.006秒。処理された行数: 95490行、763.90 KB (1481万行/s., 118.45 MB/s.)
ピークメモリ使用量: 688.77 KiB.
```

2度目のロード中に失敗が発生した場合、単純に[truncate](/managing-data/truncate)して`pypi_v2`と`pypi_downloads_v2`を再度ロードすることができます。

データのロードが完了したら、[`ALTER TABLE MOVE PARTITION`](/sql-reference/statements/alter/partition#move-partition-to-table)句を使用して、重複テーブルからメインテーブルにデータを移動できます。

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

0行のセット。経過時間: 1.401秒。

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads

0行のセット。経過時間: 0.389秒。
```

:::note パーティション名
上記の`MOVE PARTITION`呼び出しは、パーティション名`()`を使用しています。これは、このテーブルの単一パーティションを表します（パーティションはありません）。パーティションされたテーブルの場合、ユーザーは各パーティションごとに複数の`MOVE PARTITION`呼び出しを行う必要があります。現在のパーティション名は、[`system.parts`](/operations/system-tables/parts)テーブルから調べることができます。例：`SELECT DISTINCT partition FROM system.parts WHERE (table = 'pypi_v2')`.
:::

これで`pypi` と `pypi_downloads`が完全なデータを含んでいることを確認できます。`pypi_downloads_v2` と `pypi_v2`は安全に削除できます。

```sql
SELECT count()
FROM pypi

┌──count()─┐
│ 41012770 │ -- 4101万
└──────────┘

1行のセット。経過時間: 0.003秒。

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   41012770 │ -- 4101万
└────────────┘

1行のセット。経過時間: 0.007秒。処理された行数: 191.64千行、1.53 MB (2734万行/s., 218.74 MB/s.)

SELECT count()
FROM pypi_v2
```

重要なのは、`MOVE PARTITION`操作は軽量で（ハードリンクを利用）、原子的であり、すなわち中間状態なしに失敗するか成功するかのいずれかです。

このプロセスは、以下のバックフィリングシナリオで広く利用されます。

このプロセスでは、ユーザーが各挿入操作のサイズを選択する必要があることに注意してください。

より大きな挿入、すなわちより多くの行は、必要な`MOVE PARTITION`操作を減らすことを意味します。しかし、これはネットワークの中断による挿入失敗時のコストとバランスを取る必要があります。ユーザーは、リスクを低減するためにファイルをバッチ処理することを補完できます。これは、リストされる範囲のクエリ（例：`WHERE timestamp BETWEEN 2024-12-17 09:00:00 AND 2024-12-17 10:00:00`）やグロブパターンを使用して行うことができます。例えば、

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{201..300}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{301..400}.parquet')
--すべてのファイルがロードされるまで続く OR MOVE PARTITION 呼び出しが実行される
```

:::note
ClickPipesは、オブジェクトストレージからデータをロードする際にこのアプローチを使用し、ターゲットテーブルとその物理ビューの重複を自動的に作成し、ユーザーに上記のステップを実行する必要を避けます。異なるサブセットを処理する複数のワーカースレッドを使用することで、データを迅速にロードし、正確に一度だけのセマンティクスを実現します。興味のある方は、[このブログ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)で詳細をご覧ください。
:::
## シナリオ 1: 既存のデータ取り込みによるバックフィリング {#scenario-1-backfilling-data-with-existing-data-ingestion}

このシナリオでは、バックフィルするデータが孤立したバケットに存在せず、フィルタリングが必要であると仮定します。データは既に挿入されており、タイムスタンプや単調増加列を特定でき、そこから歴史的データをバックフィルする必要があります。

このプロセスは以下のステップに従います：

1. チェックポイントを特定する - タイムスタンプまたは歴史的データを復元する必要がある列の値。
2. メインテーブルと物理ビューのターゲットテーブルの重複を作成する。
3. ステップ（2）で作成したターゲットテーブルを指す物理ビューのコピーを作成する。
4. ステップ（2）で作成した重複メインテーブルに挿入する。
5. 重複テーブルから元のバージョンにすべてのパーティションを移動し、重複テーブルを削除する。

例えば、PyPIデータで必要なデータがロードされていると仮定します。最小タイムスタンプを特定できるため、我々の「チェックポイント」がわかります。

```sql
SELECT min(timestamp)
FROM pypi

┌──────min(timestamp)─┐
│ 2024-12-17 09:00:00 │
└─────────────────────┘

1行のセット。経過時間: 0.163秒。処理された行数: 13.4億行、5.37 GB (8.24億行/s., 32.96 GB/s.)
ピークメモリ使用量: 227.84 MiB.
```

上記から、`2024-12-17 09:00:00`より前のデータをロードする必要があることがわかります。先ほどのプロセスを用いて、重複テーブルとビューを作成し、タイムスタンプにフィルタをかけたサブセットをロードします。

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

0行のセット。経過時間: 500.152秒。処理された行数: 27.4億行、364.40 GB (5.47万行/s., 728.59 MB/s.)
```
:::note
パーケットのタイムスタンプ列をフィルタリングすることは非常に効率的です。ClickHouseは、ロードするフルデータ範囲を特定するためにタイムスタンプ列だけを読み取ります。パーケットインデックス（例えばmin-max）もClickHouseクエリエンジンによって利用できます。
:::

この挿入が完了したら、関連するパーティションを移動できます。

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads
```

もし歴史的データが孤立したバケットであれば、上記の時間フィルタは必要ありません。時間または単調増加列が利用できない場合は、歴史的データを分離します。

:::note ClickHouse CloudでClickPipesを使うだけ
ClickHouse Cloudのユーザーは、データが自分のバケットに孤立させられる場合、歴史的バックアップを復元するためにClickPipesを使用するべきです（この場合フィルタは必要ありません）。複数のワーカーを用いたロードを並列化し、これによってロード時間を短縮し、ClickPipesは上記のプロセスを自動化します - メインテーブルと物理ビューの両方の重複テーブルを作成します。
:::
## シナリオ 2: 既存のテーブルに物理ビューを追加 {#scenario-2-adding-materialized-views-to-existing-tables}

新しい物理ビューを追加する必要がある設定には、かなりのデータがポピュレートされ、データが挿入されることは珍しくありません。時刻または単調増加列が利用できると、ストリーム内のポイントを特定するのに役立ち、データ取り込みの中断を避けることができます。以下の例では、両方のケースが想定されており、データ取り込みを中断を避けるアプローチを優先します。

:::note POPULATEを避ける
小さなデータセットで取り込みが一時停止されている場合を除いて、物理ビューのバックフィルに[`POPULATE`](/sql-reference/statements/create/view#materialized-view)コマンドの使用は推奨されません。このオペレーターは、ポピュレートハッシュが完了した後にソーステーブルに挿入された行を見逃す可能性があります。さらに、このポピュレートはすべてのデータに対して実行され、大規模なデータセットでの中断やメモリの制限に対して脆弱です。
:::
### タイムスタンプまたは単調増加列が利用できる場合 {#timestamp-or-monotonically-increasing-column-available}

この場合、我々は新しい物理ビューに、未来の任意のデータよりも大きい行のみに制限するフィルタを含めることをお勧めします。この物理ビューは、その後、メインテーブルの歴史的データを使用してこの日からバックフィルされることになります。バックフィルのアプローチは、データサイズと関連クエリの複雑さに依存します。

最も単純なアプローチは、次のステップを含みます：

1. 任意の時間の近い未来よりも大きい行のみを考慮するフィルタを用いて物理ビューを作成します。
2. `INSERT INTO SELECT`クエリを実行し、物理ビューのターゲットテーブルに挿入し、集約クエリでソーステーブルから読み取ります。

これは追加のサブデータにターゲットを定めるためにステップ（2）で強化することができ、または失敗後の復旧を容易にするために物理ビューのための重複したターゲットテーブルを使用することができます（挿入が完了した後に元のテーブルにパーティションをアタッチ）。

以下は、毎時最も人気のあるプロジェクトを計算する物理ビューです。

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

ターゲットテーブルを追加できますが、物理ビューを追加する前に、その`SELECT`節を変更して、任意の近い未来の時間よりも大きい行のみを考慮するようにします。この場合、`2024-12-17 09:00:00`を近くの時間と仮定します。

```sql
CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project, count() AS count
FROM pypi WHERE timestamp >= '2024-12-17 09:00:00'
GROUP BY hour, project
```

このビューが追加されたら、上述の日付より前のこのビューのすべてのデータをバックフィルすることができます。

最も簡単な方法は、フィルタを追加したメインテーブルから物理ビューのクエリを実行し、`INSERT INTO SELECT`を介してビューのターゲットテーブルに結果を挿入することです。例えば、上記のビューにおいて：

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

0行のセット。経過時間: 2.830秒。処理された行数: 798.89百万行、17.40 GB (282.28万行/s., 6.15 GB/s.)
ピークメモリ使用量: 543.71 MiB.
```

:::note
上記の例では、ターゲットテーブルは[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)です。この場合、元の集約クエリを単純に使用できます。より複雑なユースケースでは、[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)を利用し、集計には`-State`関数を使用します。これについての例は[こちら](/integrations/s3/performance#be-aware-of-merges)で見ることができます。
:::

我々の場合、これは比較的軽量な集約で、3秒以内で完了し、600MiB未満のメモリを使用します。より複雑または長時間実行される集約の場合、ユーザーは、このプロセスをより堅牢にするために従来の重複テーブルアプローチを使用し、シャドウターゲットテーブル（例：`pypi_downloads_per_day_v2`）を作成し、このテーブルに挿入し、その結果のパーティションを`pypi_downloads_per_day`にアタッチすることができます。

物理ビューのクエリは、より複雑であることが多く（さもなければユーザーはビューを使用しないでしょう！）、リソースを消費することがあります。まれなケースでは、クエリのリソースがサーバーの限界を超えることもあります。これがClickHouseの物理ビューの利点の一つを示しています。それは、インクリメンタルであり、全データセットを一度に処理しないということです！

この場合、ユーザーは以下の選択肢があります：

1. クエリを変更してレンジをバックフィルします。例：`WHERE timestamp BETWEEN 2024-12-17 08:00:00 AND 2024-12-17 09:00:00`、`WHERE timestamp BETWEEN 2024-12-17 07:00:00 AND 2024-12-17 08:00:00`など。
2. [Nullテーブルエンジン](/engines/table-engines/special/null)を使用して物理ビューを埋めます。これは、物理ビューの通常のインクリメンタルな生成を再現し、データブロック（設定可能なサイズ）を繰り返しクエリ実行します。

（1）は、最も簡単なアプローチであり、しばしば十分です。簡潔さのために例を含めません。

以下で（2）をさらに探ります。
#### Nullテーブルエンジンを使用して物理ビューを埋める {#using-a-null-table-engine-for-filling-materialized-views}

[Nullテーブルエンジン](/engines/table-engines/special/null)は、データを永続化しないストレージエンジンを提供します（テーブルエンジンの世界での`/dev/null`だと思ってください）。これは矛盾しているように思えますが、物理ビューはこのテーブルエンジンに挿入されたデータに対しても実行されます。これにより、元のデータを永続化せずに物理ビューを構築でき、I/Oや関連するストレージを回避できます。

重要なのは、テーブルエンジンに接続された物理ビューは、挿入時にデータのブロックに対しても実行され、それらの結果をターゲットテーブルに送信します。これらのブロックは設定可能なサイズです。より大きなブロックは、より効率的（そして迅速に処理される）ですが、リソース（主にメモリ）をより消費します。このテーブルエンジンの使用により、物理ビューをインクリメンタルに構築、すなわち1ブロックずつ処理できます。全集計をメモリ内に保持する必要がありません。

<Image img={nullTableMV} size="md" alt="ClickHouseにおける非正規化"/>

<br />

以下の例を考えてみましょう：

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

ここでは、物理ビューを構築するために、行を受け取るためのNullテーブル`pypi_v2`を作成します。必要なカラムだけをスキーマに制限していることに注意してください。我々の物理ビューは、このテーブルに挿入された行に対して集約を実行し（1ブロックずつ）、結果をターゲットテーブル`pypi_downloads_per_day`に送信します。

:::note
ここでターゲットテーブルとして`pypi_downloads_per_day`を使用しました。追加の堅牢性のために、ユーザーは重複テーブル`pypi_downloads_per_day_v2`を作成し、物理ビューのターゲットテーブルとしてこのテーブルを使用することができます。挿入が完了した後に、`pypi_downloads_per_day_v2`のパーティションを`pypi_downloads_per_day`に移動できます。これにより、挿入がメモリの問題やサーバーの中断によって失敗した場合の復旧が可能になります。つまり、`pypi_downloads_per_day_v2`をトランケートし、設定を調整して再試行すればいいのです。
:::

この物理ビューを埋めるために、次のように`pypi`から`pypi_v2`にバックフィルする関連データを挿入します。

```sql
INSERT INTO pypi_v2 SELECT timestamp, project FROM pypi WHERE timestamp < '2024-12-17 09:00:00'

0行のセット。経過時間: 27.325秒。処理された行数: 15億行、33.48 GB (54.73万行/s., 1.23 GB/s.)
ピークメモリ使用量: 639.47 MiB.
```

ここでのメモリ使用量は`639.47 MiB`です。
##### パフォーマンスとリソースの調整 {#tuning-performance--resources}

上記のシナリオでのパフォーマンスとリソースの使用は、いくつかの要因によって決まります。調整を試みる前に、読者には[読むためのスレッドの使用](/integrations/s3/performance#using-threads-for-reads)セクションで詳細にドキュメントされた挿入メカニクスを理解することをお勧めします。まとめると：

- **読み取りの並列性** - 読み取るために使用されるスレッドの数。[`max_threads`](/operations/settings/settings#max_threads)を通じて制御されます。ClickHouse Cloudでは、これはインスタンスサイズによって決定され、デフォルトでvCPUの数になります。この値を増やすことで、メモリ使用量は増加しますが、読み取りパフォーマンスが向上する可能性があります。
- **挿入の並列性** - 挿入するために使用される挿入スレッドの数。これは[`max_insert_threads`](/operations/settings/settings#max_insert_threads)を通じて制御されます。ClickHouse Cloudでは、これはインスタンスサイズ（2〜4の間）によって決定され、OSSでは1に設定されます。この値を増やすことで、メモリ使用量は増加しますが、パフォーマンスが向上する可能性があります。
- **挿入ブロックサイズ** - データはループで処理され、データが取得され、解析され、メモリ内の挿入ブロックに作成されます。これらのブロックは、[パーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key)に基づいています。これらのブロックはソートされ、最適化され、圧縮され、新しい[data parts](/parts)としてストレージに書き込まれます。挿入ブロックのサイズは、[`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)と[`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（非圧縮）によって制御され、メモリ使用量とディスクI/Oに影響を与えます。大きなブロックはメモリをより多く使用しますが、部品を減らし、I/Oやバックグラウンドのマージを削減します。これらの設定は最小スレッショルドを表し（どちらかが最初に到達するとフラッシュがトリガされます）。
- **物理ビューのブロックサイズ** - メイン挿入の上記のメカニクスに加えて、物理ビューに挿入される前に、ブロックもより効率的に処理されるように圧縮されます。これらのブロックのサイズは、[`min_insert_block_size_bytes_for_materialized_views`](/operations/settings/settings#min_insert_block_size_bytes_for_materialized_views)と[`min_insert_block_size_rows_for_materialized_views`](/operations/settings/settings#min_insert_block_size_rows_for_materialized_views)によって決定されます。大きなブロックは、より大きなメモリ使用量の犠牲に、効率的な処理を可能にします。デフォルトでは、これらの設定はソーステーブル設定[`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)および[`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)の値に戻ります。

パフォーマンスを向上させるために、ユーザーは[挿入のためのスレッドとブロックサイズの調整](/integrations/s3/performance#tuning-threads-and-block-size-for-inserts)セクションで示されたガイドラインに従うことができます。ほとんどの場合、パフォーマンスを改善するために`min_insert_block_size_bytes_for_materialized_views`や`min_insert_block_size_rows_for_materialized_views`を変更する必要はありません。これらを変更する場合は、`min_insert_block_size_rows`や`min_insert_block_size_bytes`と同様のベストプラクティスを使用してください。

メモリを最小限に抑えるために、ユーザーはこれらの設定で実験することを望むかもしれません。これにより、間違いなくパフォーマンスが低下します。先ほどのクエリを使用して、以下の例を示します。

`max_insert_threads`を1に下げることで、メモリオーバーヘッドを削減します。

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1

0行のセット。経過時間: 27.752秒。処理された行数: 15億行、33.48 GB (53.89万行/s., 1.21 GB/s.)
ピークメモリ使用量: 506.78 MiB.
```

さらに、`max_threads`設定を1に下げることでメモリをさらに減らすことができます。

```sql
INSERT INTO pypi_v2
SELECT timestamp, project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1

Ok.

0行のセット。経過時間: 43.907秒。処理された行数: 15億行、33.48 GB (34.06万行/s., 762.54 MB/s.)
ピークメモリ使用量: 272.53 MiB.
```

最後に、`min_insert_block_size_rows`を0に設定してブロックサイズの判断要因として無効にし、`min_insert_block_size_bytes`を10485760（10MiB）に設定することで、メモリをさらに減らすことができます。

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1, min_insert_block_size_rows = 0, min_insert_block_size_bytes = 10485760

0行のセット。経過時間: 43.293秒。処理された行数: 15億行、33.48 GB (34.54万行/s., 773.36 MB/s.)
ピークメモリ使用量: 218.64 MiB.
```

最後に、ブロックサイズを低くすると部品が増え、マージ圧力が増加することに注意してください。これらの設定は慎重に変更する必要があります[こちら](/integrations/s3/performance#be-aware-of-merges)で議論されています。
```
### タイムスタンプまたは単調増加カラムなし {#no-timestamp-or-monotonically-increasing-column}

上記のプロセスは、ユーザーがタイムスタンプまたは単調増加カラムを持っていることに依存しています。場合によっては、これが単純に利用できないことがあります。この場合、ユーザーに取り込みを一時停止する必要がありますが、以前に説明したステップの多くを利用する以下のプロセスをお勧めします。

1. メインテーブルへの挿入を一時停止します。
2. `CREATE AS`構文を使用して、メインターゲットテーブルの複製を作成します。
3. [`ALTER TABLE ATTACH`](/sql-reference/statements/alter/partition#attach-partitionpart)を使用して、元のターゲットテーブルから複製にパーティションを添付します。 **注:** この添付操作は以前の移動とは異なります。ハードリンクを利用するため、元のテーブルのデータは保持されます。
4. 新しいマテリアライズドビューを作成します。
5. 挿入を再開します。 **注:** 挿入はターゲットテーブルのみを更新し、複製は元のデータのみを参照します。
6. マテリアライズドビューをバックフィルします。タイムスタンプのあるデータに対して上記で使用したのと同じプロセスを適用し、ソースとして複製テーブルを使用します。

以下の例では、PyPIと以前の新しいマテリアライズドビュー `pypi_downloads_per_day` を使用します（タイムスタンプが使用できないと仮定します）：

```sql
SELECT count() FROM pypi

┌────count()─┐
│ 2039988137 │ -- 20.4 億
└────────────┘

1 行がセットに含まれています。経過時間: 0.003 秒。

-- (1) 挿入を一時停止
-- (2) 目標テーブルの複製を作成

CREATE TABLE pypi_v2 AS pypi

SELECT count() FROM pypi_v2

┌────count()─┐
│ 2039988137 │ -- 20.4 億
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

-- (4) 挿入を再開します。ここで、単一の行を挿入してレプリケートします。

INSERT INTO pypi SELECT *
FROM pypi
LIMIT 1

SELECT count() FROM pypi

┌────count()─┐
│ 2039988138 │ -- 20.4 億
└────────────┘

1 行がセットに含まれています。経過時間: 0.003 秒。

-- pypi_v2が以前と同じ行数を含んでいることに注意してください。

SELECT count() FROM pypi_v2
┌────count()─┐
│ 2039988137 │ -- 20.4 億
└────────────┘

-- (5) バックフィルをバックアップ pypi_v2 を使用して行います。

INSERT INTO pypi_downloads_per_day SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi_v2
GROUP BY
    hour,
 project

0 行がセットに含まれています。経過時間: 3.719 秒。処理された行数: 20.4 億、データサイズ: 47.15 GB (548.57 百万行/秒、12.68 GB/秒)。

DROP TABLE pypi_v2;
```

次の最後から2番目のステップでは、前年に説明されたシンプルな `INSERT INTO SELECT` アプローチを使用して `pypi_downloads_per_day` にバックフィルを行います。これは、前述のNullテーブルアプローチを使用して強化することもでき、より強靭性のために複製テーブルをオプションで使用できます。

この操作には挿入を一時停止する必要がありますが、中間操作は通常迅速に完了でき、データの中断を最小限に抑えます。
