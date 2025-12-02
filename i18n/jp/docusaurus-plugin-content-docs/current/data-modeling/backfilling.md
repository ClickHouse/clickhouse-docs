---
slug: /data-modeling/backfilling
title: 'データのバックフィル'
description: 'ClickHouse で大規模データセットをバックフィルする方法'
keywords: ['マテリアライズドビュー', 'バックフィル', 'データ挿入', 'レジリエントなデータロード']
doc_type: 'guide'
---

import nullTableMV from '@site/static/images/data-modeling/null_table_mv.png';
import Image from '@theme/IdealImage';


# データのバックフィル {#backfilling-data}

ClickHouse を新規に利用している場合でも、既存のデプロイメントを担当している場合でも、履歴データでテーブルをバックフィルする必要が生じることがあります。状況によっては比較的単純ですが、マテリアライズドビューをバックフィルする必要がある場合は、より複雑になることがあります。本ガイドでは、そのようなタスクに対してユーザーが自身のユースケースに適用できるいくつかの手順を説明します。

:::note
本ガイドでは、ユーザーがすでに [インクリメンタルマテリアライズドビュー](/materialized-view/incremental-materialized-view) の概念と、[S3 や GCS などのテーブル関数を用いたデータ読み込み](/integrations/s3) に精通していることを前提としています。また、[オブジェクトストレージからの挿入パフォーマンス最適化](/integrations/s3/performance) に関するガイドも併せて読むことを推奨します。そこでの推奨事項は、このガイド全体で行う挿入処理に適用できます。
:::



## サンプルデータセット {#example-dataset}

このガイド全体を通して、PyPI データセットを使用します。このデータセットの各行は、`pip` などのツールを用いた Python パッケージのダウンロードを表しています。

たとえば、このサブセットは 1 日分、`2024-12-17` を対象としており、`https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/` で公開されています。ユーザーは次のようにクエリを実行できます:

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 20億4000万
└────────────┘

1 row in set. Elapsed: 32.726 sec. Processed 20億4000万 rows, 170.05 KB (6234万 rows/s., 5.20 KB/s.)
Peak memory usage: 239.50 MiB.
```

このバケットの完全なデータセットには、320 GB を超える parquet ファイルが含まれています。以下の例では、意図的にグロブパターンを使ってサブセットを対象としています。

この日付以降のデータについては、ユーザーが Kafka やオブジェクトストレージなどから、このデータストリームをコンシュームしていることを前提とします。このデータのスキーマを以下に示します。

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
1兆行を超える完全な PyPI データセットは、公開デモ環境である [clickpy.clickhouse.com](https://clickpy.clickhouse.com) で利用できます。このデータセットの詳細（デモがパフォーマンス向上のためにマテリアライズドビューをどのように活用しているかや、データが毎日どのように取り込まれているかなど）については、[こちら](https://github.com/ClickHouse/clickpy) を参照してください。
:::


## バックフィルのシナリオ {#backfilling-scenarios}

バックフィルは通常、ある時点以降のデータストリームを取り込んでいる場合に必要になります。このデータは [インクリメンタルなマテリアライズドビュー](/materialized-view/incremental-materialized-view) を介して ClickHouse のテーブルに挿入され、ブロックが挿入されるたびにトリガーされます。これらのビューは、挿入前にデータを変換したり、集計を計算して、その結果をダウンストリームのアプリケーションで後から使用するためのターゲットテーブルに送信している場合があります。

ここでは、次のシナリオを扱います。

1. **既存のデータインジェストと並行したバックフィル** - 新しいデータがロードされている一方で、履歴データをバックフィルする必要があるケース。この履歴データはすでに特定されています。
2. **既存テーブルへのマテリアライズドビューの追加** - 履歴データがすでに投入され、かつデータストリームがすでに流れている構成に、新しいマテリアライズドビューを追加する必要があるケース。

データはオブジェクトストレージからバックフィルされるものとします。いずれの場合も、データ挿入の中断は避けることを目指します。

履歴データのバックフィルには、オブジェクトストレージ上のデータを用いて実施することを推奨します。データは、可能であれば Parquet にエクスポートしておくと、読み取り性能と圧縮率（ネットワーク転送量の削減）の観点で最適です。ファイルサイズは 150MB 前後が一般的に好まれますが、ClickHouse は [70 を超えるファイルフォーマット](/interfaces/formats) をサポートしており、あらゆるサイズのファイルを処理できます。



## 複製テーブルとビューの使用 {#using-duplicate-tables-and-views}

すべてのシナリオにおいては、「複製テーブルとビュー」という概念を前提とします。これらのテーブルとビューは、ライブストリーミングデータで使用されているもののコピーであり、バックフィル処理を本番の系統から切り離して実行し、障害が発生した場合でも容易にリカバリできるようにするためのものです。たとえば、次のようなメインの `pypi` テーブルとマテリアライズドビューがあり、各 Python プロジェクトごとのダウンロード数を計算します。

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

メインテーブルおよび関連ビューに、データの一部を投入します。

```sql
INSERT INTO pypi SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{000..100}.parquet')

0 行。経過時間: 15.702 秒。41.23 百万行、3.94 GB を処理しました (2.63 百万行/秒、251.01 MB/秒)。
ピーク時メモリ使用量: 977.49 MiB。

SELECT count() FROM pypi

┌──count()─┐
│ 20612750 │ -- 約 2,061 万行
└──────────┘

1 行。経過時間: 0.004 秒。

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   20612750 │ -- 20.61 million
└────────────┘

1 行。経過時間: 0.006 秒。96.15 千行、769.23 KB を処理しました (16.53 百万行/秒、132.26 MB/秒)。
ピーク時メモリ使用量: 682.38 KiB。
```

別のサブセット `{101..200}` を読み込みたいとします。`pypi` に直接 `INSERT` することもできますが、テーブルを複製して作成することで、このバックフィル処理を本番とは切り離して実行できます。

バックフィルが失敗した場合でも、メインテーブルには影響を与えないため、複製テーブルを[TRUNCATE](/managing-data/truncate)して再実行するだけで済みます。

これらのビューの新しいコピーを作成するには、接尾辞 `_v2` を付けて `CREATE TABLE AS` 句を使用します：

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

これにほぼ同じサイズの 2 つ目のサブセットを投入し、ロードが正常に完了したことを確認します。

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')

0 行が返されました。経過時間: 17.545 秒。40.80 百万行、3.90 GB を処理しました (2.33 百万行/秒、222.29 MB/秒)。
ピークメモリ使用量: 991.50 MiB。

SELECT count()
FROM pypi_v2

┌──count()─┐
│ 20400020 │ -- 2,040万件
└──────────┘

1 行が返されました。経過時間: 0.004 秒。

SELECT sum(count)
FROM pypi_downloads_v2

┌─sum(count)─┐
│   20400020 │ -- 2,040万件
└────────────┘

1 行が返されました。経過時間: 0.006 秒。95.49 千行、763.90 KB を処理しました (14.81 百万行/秒、118.45 MB/秒)。
ピークメモリ使用量: 688.77 KiB。
```


この 2 回目のロードのいずれかの時点で障害が発生した場合でも、単に `pypi_v2` および `pypi_downloads_v2` テーブルを [TRUNCATE](/managing-data/truncate) して、データロードをやり直すことができます。

データロードが完了したら、[`ALTER TABLE MOVE PARTITION`](/sql-reference/statements/alter/partition#move-partition-to-table) 句を使用して、複製テーブルからメインテーブルにデータを移動できます。

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

0行のセット。経過時間: 1.401秒

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads

0行のセット。経過時間: 0.389秒
```

:::note パーティション名
上記の `MOVE PARTITION` 呼び出しでは、パーティション名 `()` を使用しています。これは、このテーブル（パーティション分割されていない）の単一パーティションを表します。テーブルがパーティション分割されている場合は、各パーティションごとに 1 回ずつ、複数回 `MOVE PARTITION` を呼び出す必要があります。現在のパーティション名は、[`system.parts`](/operations/system-tables/parts) テーブルから取得できます（例: `SELECT DISTINCT partition FROM system.parts WHERE (table = 'pypi_v2')`）。
:::

これで、`pypi` と `pypi_downloads` に完全なデータが含まれていることを確認できます。`pypi_downloads_v2` と `pypi_v2` は安全に削除できます。

```sql
SELECT count()
FROM pypi

┌──count()─┐
│ 41012770 │ -- 約4101万
└──────────┘

1 行。経過時間: 0.003 秒。

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   41012770 │ -- 約4101万
└────────────┘

1 行。経過時間: 0.007 秒。191.64 千行、1.53 MB を処理しました (27.34 百万行/秒、218.74 MB/秒)。

SELECT count()
FROM pypi_v2
```

重要な点として、`MOVE PARTITION` 操作は軽量（ハードリンクを活用）かつアトミックであり、途中の中間状態を伴わずに失敗するか成功するかのどちらか一方だけが起こります。

このプロセスは、後述のバックフィルシナリオで集中的に利用します。

このプロセスでは、各 insert 操作のサイズをユーザーが選択する必要があることに注意してください。

より大きな insert、つまりより多くの行をまとめて書き込むほど、必要な `MOVE PARTITION` 操作の回数は少なくなります。ただし、ネットワーク中断などによる insert 失敗時のリカバリコストとのトレードオフを考慮する必要があります。ユーザーは、このプロセスにファイルのバッチ処理を組み合わせることでリスクを低減できます。これは、`WHERE timestamp BETWEEN 2024-12-17 09:00:00 AND 2024-12-17 10:00:00` のようなレンジクエリ、またはグロブパターンのいずれかで実行できます。例えば、次のようになります。

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{201..300}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{301..400}.parquet')
--全ファイルの読み込み完了まで継続、またはMOVE PARTITION呼び出しを実行
```

:::note
ClickPipes はオブジェクトストレージからデータをロードする際にこのアプローチを使用し、ターゲットテーブルとそのマテリアライズドビューの複製を自動的に作成することで、ユーザーが上記の手順を実行する必要がなくなります。さらに、複数のワーカースレッドを使用し、それぞれが glob パターンを使って異なるサブセットを自身の複製テーブルで処理することで、「厳密 1 回だけの処理 (exactly-once)」セマンティクスを保ちながら高速にデータをロードできます。興味がある方は、[このブログ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)でさらに詳しい内容を確認できます。
:::


## シナリオ 1: 既存のデータインジェストを利用したデータのバックフィル {#scenario-1-backfilling-data-with-existing-data-ingestion}

このシナリオでは、バックフィル対象のデータが専用のバケットに存在せず、フィルタリングが必要であると仮定します。データの挿入はすでに行われており、どこから履歴データをバックフィルする必要があるかを示すタイムスタンプまたは単調増加するカラムを特定できます。

このプロセスは次の手順で行います。

1. チェックポイントを特定します。履歴データを復元する必要がある起点となるタイムスタンプまたはカラム値を決めます。
2. メインテーブルおよびマテリアライズドビューのターゲットテーブルの複製を作成します。
3. 手順 (2) で作成したターゲットテーブルを参照するマテリアライズドビューのコピーを作成します。
4. 手順 (2) で作成した複製メインテーブルに対して挿入を実行します。
5. 複製テーブルのすべてのパーティションを元のテーブルに移動し、複製テーブルを削除します。

たとえば、PyPI データについて、すでにデータがロードされているとします。最小のタイムスタンプを特定でき、それにより「チェックポイント」を定義できます。

```sql
SELECT min(timestamp)
FROM pypi

┌──────min(timestamp)─┐
│ 2024-12-17 09:00:00 │
└─────────────────────┘

1行が返されました。経過時間: 0.163秒。処理された行数: 13億4000万行、5.37 GB (82億4000万行/秒、32.96 GB/秒)
ピークメモリ使用量: 227.84 MiB。
```

上記から、`2024-12-17 09:00:00` より前のデータをロードする必要があることが分かります。先ほどの手順を用いて、複製用のテーブルとビューを作成し、タイムスタンプでフィルタしてそのサブセットをロードします。

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
Parquet の timestamp 列に対してフィルタリングを行うと、非常に効率的です。ClickHouse は、読み込む必要のあるデータ範囲全体を特定するために timestamp 列だけを読み取り、ネットワークトラフィックを最小限に抑えます。min-max などの Parquet インデックスも、ClickHouse のクエリエンジンによって活用されます。
:::

この insert が完了したら、対応するパーティションを移動できます。

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads
```

履歴データが独立したバケットに分離されている場合は、上記の時間フィルターは不要です。時間列または単調増加する列が利用できない場合は、履歴データを分離してください。

:::note ClickHouse Cloud では ClickPipes を使うだけでよい
ClickHouse Cloud のユーザーは、データを専用のバケットに分離でき（かつフィルターが不要な）場合、履歴バックアップの復元には ClickPipes を使用することを推奨します。複数ワーカーによるロードの並列化でロード時間を短縮できるだけでなく、ClickPipes は上記のプロセスを自動化し、メインテーブルおよびマテリアライズドビューの両方に対して複製テーブルを作成します。
:::


## シナリオ 2: 既存テーブルへのマテリアライズドビューの追加 {#scenario-2-adding-materialized-views-to-existing-tables}

大量のデータがすでに格納されており、データの挿入が継続しているセットアップに対して、新しいマテリアライズドビューを追加する必要が生じることは珍しくありません。このような場合、ストリーム内のある地点を特定するために使用できるタイムスタンプ列または単調増加する列が役立ち、データのインジェストの一時停止を避けることができます。以下の例では両方のケースを想定し、インジェストの一時停止を避けるアプローチを優先しています。

:::note POPULATE の使用を避ける
[`POPULATE`](/sql-reference/statements/create/view#materialized-view) コマンドを使用してマテリアライズドビューをバックフィルする方法は、インジェストを停止している小規模なデータセット以外には推奨しません。この演算子は、POPULATE のハッシュ処理が完了した後にマテリアライズドビューが作成されるため、その間にソーステーブルへ挿入された行を取りこぼす可能性があります。さらに、この POPULATE は全データを対象に実行されるため、大規模なデータセットでは中断やメモリ制限の影響を受けやすくなります。
:::

### タイムスタンプまたは単調増加する列が利用可能な場合 {#timestamp-or-monotonically-increasing-column-available}

この場合、新しいマテリアライズドビューには、将来の任意の時刻より後の行に限定するフィルターを含めることを推奨します。その後、この日時以降についてメインテーブルの履歴データを使用してマテリアライズドビューをバックフィルできます。バックフィルの方法は、データサイズと関連クエリの複雑さに依存します。

最も簡単なアプローチは、以下の手順で構成されます。

1. 近い将来の任意の時刻より後の行のみを対象とするフィルター付きでマテリアライズドビューを作成します。
2. ビューの集約クエリを使用してソーステーブルから読み取り、マテリアライズドビューのターゲットテーブルに挿入する `INSERT INTO SELECT` クエリを実行します。

さらにこれを拡張して、手順 (2) でデータのサブセットを対象にしたり、マテリアライズドビュー用に複製したターゲットテーブルを使用したりできます（挿入完了後に元のテーブルにパーティションをアタッチすることで、障害発生時のリカバリーを容易にします）。

次のマテリアライズドビューは、1 時間あたりの最も人気のあるプロジェクトを計算するものです。

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

ターゲットテーブル自体は追加できますが、マテリアライズドビューを追加する前に、その `SELECT` 句を変更し、近い将来の任意の時刻より後の行のみを対象とするフィルターを含めます。この例では、`2024-12-17 09:00:00` が数分先の時刻であると仮定しています。

```sql
CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) AS hour,
 project, count() AS count
FROM pypi WHERE timestamp >= '2024-12-17 09:00:00'
GROUP BY hour, project
```

このビューを追加したら、この時点より前のデータをすべてマテリアライズドビューに対してバックフィルできます。

これを行う最も簡単な方法は、最近追加されたデータを除外するフィルターを指定してメインテーブルに対してマテリアライズドビューのクエリを実行し、その結果を `INSERT INTO SELECT` を用いてビューのターゲットテーブルに挿入することです。たとえば、上記のビューでは次のようになります。

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

OK.

セット内の行数: 0 行。経過時間: 2.830 秒。処理行数: 7.9889 億行、17.40 GB (2.8228 億行/秒、6.15 GB/秒)。
ピークメモリ使用量: 543.71 MiB。
```

:::note
上記の例では、対象テーブルは [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) です。この場合は、元の集約クエリをそのまま使用できます。より複雑なユースケースで [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) を利用する場合は、集約のために `-State` 関数を使用します。この例は[こちら](/integrations/s3/performance#be-aware-of-merges)で確認できます。
:::


このケースでは、比較的軽量な集約で、3 秒未満で完了し、メモリ使用量も 600MiB 未満です。より複雑または長時間実行される集約の場合は、前述の複製テーブルのアプローチ、すなわちシャドウ用のターゲットテーブル（例: `pypi_downloads_per_day_v2`）を作成し、そこに `INSERT` してから、その結果のパーティションを `pypi_downloads_per_day` にアタッチすることで、このプロセスをより堅牢にできます。

多くの場合、マテリアライズドビューのクエリはより複雑で（そうでなければユーザーがビューを使わないことも多いため、これは珍しくありません）、リソースを消費します。まれに、クエリに必要なリソースがサーバーの能力を超えることもあります。これは、ClickHouse のマテリアライズドビューの利点の 1 つを示しています。すなわち、マテリアライズドビューはインクリメンタルに処理され、一度にデータセット全体を処理するわけではない、という点です。

このような場合、ユーザーにはいくつかの選択肢があります。

1. クエリを変更して範囲ごとにバックフィルします。例: `WHERE timestamp BETWEEN 2024-12-17 08:00:00 AND 2024-12-17 09:00:00`、`WHERE timestamp BETWEEN 2024-12-17 07:00:00 AND 2024-12-17 08:00:00` など。
2. [Null table engine](/engines/table-engines/special/null) を使用してマテリアライズドビューを満たします。これは、マテリアライズドビューの一般的なインクリメンタルなデータ投入を再現し、設定可能なサイズのデータブロックに対してクエリを実行します。

(1) は最も単純なアプローチであり、多くの場合これで十分です。簡潔さのため、ここでは例を示しません。

(2) については、この後で詳しく説明します。

#### マテリアライズドビューを埋めるために Null table engine を使用する {#using-a-null-table-engine-for-filling-materialized-views}

[Null table engine](/engines/table-engines/special/null) は、データを永続化しないストレージエンジンを提供します（テーブルエンジン版の `/dev/null` のようなものだと考えてください）。一見すると矛盾しているように見えますが、このテーブルエンジンに挿入されたデータに対しても、マテリアライズドビューは引き続き実行されます。これにより、元データを永続化することなくマテリアライズドビューを構築でき、I/O とそれに伴うストレージ消費を回避できます。

重要な点として、このテーブルエンジンにアタッチされたマテリアライズドビューは、データが挿入される際にブロック単位で処理を実行し、その結果をターゲットテーブルに送信します。これらのブロックのサイズは設定可能です。ブロックを大きくすると、潜在的にはより効率的になり（処理も高速になります）が、その一方で、より多くのリソース（主にメモリ）を消費します。このテーブルエンジンを使用することで、マテリアライズドビューをインクリメンタル、つまり 1 ブロックずつ構築でき、集約全体をメモリ上に保持する必要を回避できます。

<Image img={nullTableMV} size="md" alt="ClickHouse における非正規化" />

<br />

次の例を考えてみましょう。

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

ここでは、行を受け取るための Null テーブル `pypi_v2` を作成し、それらの行を使ってマテリアライズドビューを構築します。必要なカラムだけにスキーマを制限している点に注目してください。マテリアライズドビューは、このテーブルに挿入された行に対して（1 ブロックずつ）集約を実行し、その結果をターゲットテーブル `pypi_downloads_per_day` に送ります。

:::note
ここでは、ターゲットテーブルとして `pypi_downloads_per_day` を使用しています。追加の堅牢性のために、ユーザーは複製テーブル `pypi_downloads_per_day_v2` を作成し、前の例で示したように、これをビューのターゲットテーブルとして使用することもできます。挿入が完了したら、`pypi_downloads_per_day_v2` のパーティションを `pypi_downloads_per_day` に移動できます。これにより、メモリ問題やサーバー中断が原因で挿入が失敗した場合でも復旧が可能になります。すなわち、`pypi_downloads_per_day_v2` を TRUNCATE して設定を調整し、再試行するだけで済みます。
:::

このマテリアライズドビューにデータを投入するには、`pypi` から `pypi_v2` へバックフィル対象の関連データを挿入するだけです。

```sql
INSERT INTO pypi_v2 SELECT timestamp, project FROM pypi WHERE timestamp < '2024-12-17 09:00:00'

0行のセット。経過時間: 27.325秒。処理: 15億行、33.48 GB (5473万行/秒、1.23 GB/秒)
ピークメモリ使用量: 639.47 MiB。
```

ここではメモリ使用量が `639.47 MiB` になっていることに注目してください。


##### パフォーマンスとリソースのチューニング {#tuning-performance--resources}

上記のシナリオにおけるパフォーマンスとリソース使用量は、複数の要因によって決まります。チューニングを行う前に、[Optimizing for S3 Insert and Read Performance guide](/integrations/s3/performance) の [Using Threads for Reads](/integrations/s3/performance#using-threads-for-reads) セクションで詳細に説明されている挿入メカニズムを理解しておくことを推奨します。要点は次のとおりです。

* **読み取りの並列度 (Read Parallelism)** - 読み取りに使用されるスレッド数です。[`max_threads`](/operations/settings/settings#max_threads) によって制御されます。ClickHouse Cloud ではインスタンスサイズによって決定され、デフォルトでは vCPU の数になります。この値を増やすと、メモリ使用量が増える代わりに読み取りパフォーマンスが向上する可能性があります。
* **挿入の並列度 (Insert Parallelism)** - 挿入に使用される insert スレッド数です。[`max_insert_threads`](/operations/settings/settings#max_insert_threads) によって制御されます。ClickHouse Cloud ではインスタンスサイズ (2〜4 の範囲) によって決定され、OSS では 1 に設定されています。この値を増やすと、メモリ使用量が増える代わりにパフォーマンスが向上する可能性があります。
* **挿入ブロックサイズ (Insert Block Size)** - データはループ内で処理され、[partitioning key](/engines/table-engines/mergetree-family/custom-partitioning-key) に基づいて取り出され、パースされ、インメモリの挿入ブロックに形成されます。これらのブロックはソート、最適化、圧縮され、新しい [data parts](/parts) としてストレージに書き込まれます。挿入ブロックのサイズは、設定 [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) と [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) (非圧縮) によって制御され、メモリ使用量とディスク I/O に影響します。大きなブロックはメモリを多く使用しますが、作成される parts が少なくなり、I/O とバックグラウンドマージが減少します。これらの設定は最小しきい値を表し、いずれかに到達するとフラッシュがトリガーされます。
* **マテリアライズドビューのブロックサイズ (Materialized view block size)** - 上記のメイン挿入用メカニズムに加えて、マテリアライズドビューに挿入される前にも、より効率的に処理できるようブロックがまとめられます。これらのブロックサイズは、設定 [`min_insert_block_size_bytes_for_materialized_views`](/operations/settings/settings#min_insert_block_size_bytes_for_materialized_views) および [`min_insert_block_size_rows_for_materialized_views`](/operations/settings/settings#min_insert_block_size_rows_for_materialized_views) によって決定されます。ブロックを大きくするとメモリ使用量が増える代わりに、処理効率が向上します。デフォルトでは、これらの設定はソーステーブルの設定 [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) および [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) の値をそれぞれ継承します。

パフォーマンス向上のために、ユーザーは [Optimizing for S3 Insert and Read Performance guide](/integrations/s3/performance) の [Tuning Threads and Block Size for Inserts](/integrations/s3/performance#tuning-threads-and-block-size-for-inserts) セクションで示されているガイドラインに従うことができます。ほとんどの場合、パフォーマンス向上のために `min_insert_block_size_bytes_for_materialized_views` と `min_insert_block_size_rows_for_materialized_views` を変更する必要はありません。これらを変更する場合は、`min_insert_block_size_rows` と `min_insert_block_size_bytes` について説明したのと同じベストプラクティスを適用してください。

メモリ使用量を最小化するために、ユーザーはこれらの設定を調整してみることもできますが、その場合パフォーマンスは必然的に低下します。前述のクエリを使い、以下に例を示します。

`max_insert_threads` を 1 に下げると、メモリのオーバーヘッドを削減できます。

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

`max_threads` 設定を 1 に下げることで、メモリ使用量をさらに削減できます。

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


最後に、`min_insert_block_size_rows` を 0（ブロックサイズを決定する要因として無効化）に、`min_insert_block_size_bytes` を 10485760（10MiB）に設定することで、メモリ使用量をさらに削減できます。

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1, min_insert_block_size_rows = 0, min_insert_block_size_bytes = 10485760

0 rows in set. Elapsed: 43.293 sec. Processed 1.50 billion rows, 33.48 GB (34.54 million rows/s., 773.36 MB/s.)
ピークメモリ使用量: 218.64 MiB。
```

最後に、ブロックサイズを小さくするとパーツ数が増え、マージ処理の負荷が高くなることに注意してください。[こちら](/integrations/s3/performance#be-aware-of-merges)で説明しているように、これらの設定は慎重に変更する必要があります。

### タイムスタンプまたは単調増加カラムがない場合 {#no-timestamp-or-monotonically-increasing-column}

上記のプロセスは、ユーザーがタイムスタンプまたは単調増加カラムを持っていることを前提としています。場合によっては、そもそもそれが存在しないことがあります。その場合には、以前に説明した多くの手順を活用しつつ、ユーザー側で取り込みを一時停止する必要がある、次のプロセスを推奨します。

1. メインテーブルへの INSERT を一時停止します。
2. `CREATE AS` 構文を使用して、メインの対象テーブルの複製を作成します。
3. 元の対象テーブルから複製テーブルに対して [`ALTER TABLE ATTACH`](/sql-reference/statements/alter/partition#attach-partitionpart) を使用してパーティションをアタッチします。**注意:** このアタッチ操作は、前に使用した move とは異なります。ハードリンクを利用しますが、元のテーブル内のデータは保持されます。
4. 新しいマテリアライズドビューを作成します。
5. INSERT を再開します。**注意:** INSERT は対象テーブルのみを更新し、複製テーブルは更新しません。複製テーブルは元のデータのみを参照します。
6. 上記のタイムスタンプ付きデータに対して使用したのと同じプロセスを適用しつつ、複製テーブルをソースとして使用して、マテリアライズドビューをバックフィルします。

PyPI と、前に作成した新しいマテリアライズドビュー `pypi_downloads_per_day` を使用する次の例を考えます（タイムスタンプを使用できないと仮定します）:

```sql
SELECT count() FROM pypi

┌────count()─┐
│ 2039988137 │ -- 20.4億
└────────────┘

結果セット 1 行。経過時間: 0.003 秒。

-- (1) 挿入を一時停止する
-- (2) 対象テーブルの複製を作成する

CREATE TABLE pypi_v2 AS pypi

SELECT count() FROM pypi_v2

┌────count()─┐
│ 2039988137 │ -- 20.4億
└────────────┘

結果セット 1 行。経過時間: 0.004 秒。

-- (3) 元の対象テーブルのパーティションを複製テーブルにアタッチする。

ALTER TABLE pypi_v2
 (ATTACH PARTITION tuple() FROM pypi)

-- (4) 新しいマテリアライズドビューを作成する

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

-- (4) 挿入を再開する。ここでは 1 行を挿入して状況を再現する。

INSERT INTO pypi SELECT *
FROM pypi
LIMIT 1

SELECT count() FROM pypi

┌────count()─┐
│ 2039988138 │ -- 20.4億
└────────────┘

結果セット 1 行。経過時間: 0.003 秒。

-- pypi_v2 には以前と同じ行数が含まれていることに注目してください

SELECT count() FROM pypi_v2
┌────count()─┐
│ 2039988137 │ -- 20.4億
└────────────┘

-- (5) バックアップである pypi_v2 を使ってビューをバックフィルする

INSERT INTO pypi_downloads_per_day SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi_v2
GROUP BY
    hour,
 project

結果セット 0 行。経過時間: 3.719 秒。20.4 億行、47.15 GB を処理しました (548.57 百万行/秒、12.68 GB/秒)。
```


DROP TABLE pypi&#95;v2;

```

最後から2番目のステップでは、[前述](#timestamp-or-monotonically-increasing-column-available)のシンプルな`INSERT INTO SELECT`アプローチを使用して`pypi_downloads_per_day`をバックフィルします。[上記](#using-a-null-table-engine-for-filling-materialized-views)で説明したNullテーブルアプローチを使用して強化することも可能で、オプションで複製テーブルを使用することでより高い耐障害性を実現できます。

この操作では挿入の一時停止が必要ですが、中間操作は通常迅速に完了するため、データの中断を最小限に抑えることができます。
```
