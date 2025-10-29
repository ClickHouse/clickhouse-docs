---
'slug': '/data-modeling/backfilling'
'title': 'データのバックフィル'
'description': 'ClickHouseで大規模データセットをバックフィルする方法'
'keywords':
- 'materialized views'
- 'backfilling'
- 'inserting data'
- 'resilient data load'
'doc_type': 'guide'
---

import nullTableMV from '@site/static/images/data-modeling/null_table_mv.png';
import Image from '@theme/IdealImage';



# データのバックフィリング

ClickHouseに新しく関わっている場合でも、既存のデプロイを担当している場合でも、ユーザーは必然的にテーブルに履歴データをバックフィルする必要があります。場合によっては、これは比較的簡単ですが、マテリアライズドビューをポピュレートする必要がある場合は、より複雑になることがあります。このガイドでは、このタスクをユーザーが自身のユースケースに適用できるプロセスをドキュメント化しています。

:::note
このガイドでは、ユーザーが[インクリメンタルマテリアライズドビュー](/materialized-view/incremental-materialized-view)および[s3やgcsなどのテーブル関数を用いたデータロード](/integrations/s3)の概念について既に理解していることを前提としています。また、ユーザーに対して、[オブジェクトストレージからの挿入パフォーマンスの最適化](/integrations/s3/performance)に関するガイドを読むことをお勧めします。このアドバイスは、本ガイド全体の挿入に適用できます。
:::

## 例データセット {#example-dataset}

このガイド全体で、PyPIデータセットを使用します。このデータセットの各行は、`pip`のようなツールを使用したPythonパッケージのダウンロードを表しています。

例えば、サブセットは1日分、すなわち`2024-12-17`をカバーし、`https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/`で公開されています。ユーザーは次のようにクエリできます。

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 32.726 sec. Processed 2.04 billion rows, 170.05 KB (62.34 million rows/s., 5.20 KB/s.)
Peak memory usage: 239.50 MiB.
```

このバケットの完全なデータセットは、320 GBを超えるparquetファイルを含んでいます。以下の例では、意図的にグロブパターンを使用してサブセットをターゲットにしています。

ユーザーは、この日以降のデータをKafkaやオブジェクトストレージからのストリームとして消費すると仮定します。このデータのスキーマは以下に示されています。

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
1兆行を超える完全なPyPIデータセットは、私たちの公開デモ環境[clickpy.clickhouse.com](https://clickpy.clickhouse.com)で利用可能です。このデータセットの詳細、デモがマテリアライズドビューをどのように活用してパフォーマンスを向上させているか、またデータがどのように毎日ポピュレートされるかについては、[こちら](https://github.com/ClickHouse/clickpy)を参照してください。
:::

## バックフィルのシナリオ {#backfilling-scenarios}

バックフィリングは、通常、特定の時点からデータストリームが消費されるときに必要です。このデータは、[インクリメンタルマテリアライズドビュー](/materialized-view/incremental-materialized-view)とともにClickHouseテーブルに挿入され、挿入されるブロックに対してトリガーされます。これらのビューは、挿入前にデータを変換したり、集約を計算し、下流アプリケーションで使用するためにターゲットテーブルに結果を送信したりする場合があります。

以下のシナリオをカバーすることを試みます。

1. **既存のデータ取り込みによるデータのバックフィル** - 新しいデータが読み込まれ、履歴データをバックフィルする必要があります。この履歴データは特定されています。
2. **既存テーブルへのマテリアライズドビューの追加** - 履歴データがポピュレートされ、データが既にストリーミングされているセットアップに新しいマテリアライズドビューを追加する必要があります。

データはオブジェクトストレージからバックフィルされると仮定します。すべてのケースで、データ挿入の一時停止を避けることを目指します。

オブジェクトストレージからの履歴データのバックフィルを推奨します。データは、最適な読み取りパフォーマンスと圧縮（ネットワーク転送の減少）のために可能であればParquetにエクスポートする必要があります。ファイルサイズは約150MBが一般的に好まれますが、ClickHouseは[70以上のファイル形式](/interfaces/formats)をサポートしており、あらゆるサイズのファイルを処理できます。

## 重複テーブルとビューの使用 {#using-duplicate-tables-and-views}

すべてのシナリオで、「重複テーブルとビュー」の概念に依存します。これらのテーブルとビューは、ライブストリーミングデータに使用されるもののコピーを表し、バックフィルを隔離して実行することができ、障害が発生した場合に簡単に回復できる手段を提供します。たとえば、次の主な`pypi`テーブルとマテリアライズドビューがあり、Pythonプロジェクトごとのダウンロード数を計算します。

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

主テーブルと関連ビューをデータのサブセットでポピュレートします。

```sql
INSERT INTO pypi SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{000..100}.parquet')

0 rows in set. Elapsed: 15.702 sec. Processed 41.23 million rows, 3.94 GB (2.63 million rows/s., 251.01 MB/s.)
Peak memory usage: 977.49 MiB.

SELECT count() FROM pypi

┌──count()─┐
│ 20612750 │ -- 20.61 million
└──────────┘

1 row in set. Elapsed: 0.004 sec.

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   20612750 │ -- 20.61 million
└────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 96.15 thousand rows, 769.23 KB (16.53 million rows/s., 132.26 MB/s.)
Peak memory usage: 682.38 KiB.
```

別のサブセット`{101..200}`を読み込みたいとします。`pypi`に直接挿入することもできますが、重複テーブルを作成することでこのバックフィルを隔離して行うことができます。

バックフィルが失敗した場合、主テーブルには影響を与えず、単に[トランケート](/managing-data/truncate)重複テーブルを実行し、繰り返すことができます。

これらのビューの新しいコピーを作成するには、`CREATE TABLE AS`句を使用し、サフィックス`_v2`を付けます。

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

これを約同じサイズの2番目のサブセットでポピュレートし、成功したロードを確認します。

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')

0 rows in set. Elapsed: 17.545 sec. Processed 40.80 million rows, 3.90 GB (2.33 million rows/s., 222.29 MB/s.)
Peak memory usage: 991.50 MiB.

SELECT count()
FROM pypi_v2

┌──count()─┐
│ 20400020 │ -- 20.40 million
└──────────┘

1 row in set. Elapsed: 0.004 sec.

SELECT sum(count)
FROM pypi_downloads_v2

┌─sum(count)─┐
│   20400020 │ -- 20.40 million
└────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 95.49 thousand rows, 763.90 KB (14.81 million rows/s., 118.45 MB/s.)
Peak memory usage: 688.77 KiB.
```

もしこの2回目のロード中に何らかの失敗があった場合は、単に[トランケート](/managing-data/truncate)を実行し、`pypi_v2`と`pypi_downloads_v2`を繰り返しデータをロードすることができます。

データのロードが完了したので、[`ALTER TABLE MOVE PARTITION`](/sql-reference/statements/alter/partition#move-partition-to-table)句を使用して、重複テーブルから主テーブルにデータを移動できます。

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

0 rows in set. Elapsed: 1.401 sec.

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads

0 rows in set. Elapsed: 0.389 sec.
```

:::note パーティション名
上記の`MOVE PARTITION`呼び出しは、パーティション名`()`を使用しています。これはこのテーブル（パーティション化されていないテーブル）の単一のパーティションを表しています。パーティション化されたテーブルの場合、ユーザーは複数の`MOVE PARTITION`呼び出しを行う必要があります。現在のパーティション名は、[`system.parts`](/operations/system-tables/parts)テーブルから確認できます。例：`SELECT DISTINCT partition FROM system.parts WHERE (table = 'pypi_v2')`。
:::

これで、`pypi`および`pypi_downloads`に完全なデータが含まれていることを確認できます。`pypi_downloads_v2`と`pypi_v2`は安全に削除できます。

```sql
SELECT count()
FROM pypi

┌──count()─┐
│ 41012770 │ -- 41.01 million
└──────────┘

1 row in set. Elapsed: 0.003 sec.

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   41012770 │ -- 41.01 million
└────────────┘

1 row in set. Elapsed: 0.007 sec. Processed 191.64 thousand rows, 1.53 MB (27.34 million rows/s., 218.74 MB/s.)

SELECT count()
FROM pypi_v2
```

重要なのは、`MOVE PARTITION`操作が軽量で（ハードリンクを利用）原子的であり、すなわち失敗するか成功するかのどちらかであり、間の状態が存在しないことです。

以下のバックフィリングシナリオでは、このプロセスを大いに利用します。

このプロセスがユーザーに挿入操作のサイズを選択させることに注意してください。

より大きな挿入、すなわちより多くの行は、より少ない`MOVE PARTITION`操作を必要とします。しかし、これは、ネットワーク障害などによる挿入失敗のリスクに対してバランスを取る必要があります。ユーザーは、このプロセスを補完するために、ファイルをバッチ処理してリスクを減らすことができます。これは、例えば、範囲クエリ`WHERE timestamp BETWEEN 2024-12-17 09:00:00 AND 2024-12-17 10:00:00`やグロブパターンで実行できます。例えば、

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{201..300}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{301..400}.parquet')
--continued to all files loaded OR MOVE PARTITION call is performed
```

:::note
ClickPipesはオブジェクトストレージからデータをロードする際にこのアプローチを使用し、ターゲットテーブルとそのマテリアライズドビューの複製を自動的に作成し、ユーザーが上記の手順を実行する必要を避けています。また、複数のワーカースレッドを使用して、異なるサブセットを処理し（グロブパターンを介して）、それぞれに重複テーブルを持つことで、データを迅速に、正確に1回だけのセマンティクスでロードできます。関心のある方は、[このブログ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)でさらに詳細をご覧いただけます。
:::

## シナリオ1: 既存のデータ取り込みによるデータのバックフィル {#scenario-1-backfilling-data-with-existing-data-ingestion}

このシナリオでは、バックフィルに必要なデータが孤立したバケットにないと仮定し、フィルタリングが必要です。データはすでに挿入されており、履歴データをバックフィルするために特定できるタイムスタンプまたは単調増加カラムがあります。

このプロセスは以下の手順に従います。

1. チェックポイントを特定します - 履歴データを復元する必要があるタイムスタンプまたはカラムの値。
2. 主テーブルとマテリアライズドビューのターゲットテーブルの重複を作成します。
3. ステップ（2）で作成したターゲットテーブルを指すマテリアライズドビューのコピーを作成します。
4. ステップ（2）で作成した重複の主テーブルに挿入します。
5. 重複テーブルから元のバージョンにすべてのパーティションを移動します。重複テーブルをドロップします。

例えば、PyPIデータでデータが読み込まれているとします。最小のタイムスタンプを特定でき、そのため「チェックポイント」が特定されます。

```sql
SELECT min(timestamp)
FROM pypi

┌──────min(timestamp)─┐
│ 2024-12-17 09:00:00 │
└─────────────────────┘

1 row in set. Elapsed: 0.163 sec. Processed 1.34 billion rows, 5.37 GB (8.24 billion rows/s., 32.96 GB/s.)
Peak memory usage: 227.84 MiB.
```

上記から、`2024-12-17 09:00:00`より前のデータを読み込む必要があることがわかります。前述のプロセスを使用して、重複テーブルとビューを作成し、タイムスタンプに基づいてサブセットを読み込みます。

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
Parquetのタイムスタンプカラムでのフィルタリングは非常に効率的である可能性があります。ClickHouseは、読み込むべき完全なデータ範囲を特定するためにタイムスタンプカラムのみを読み込み、ネットワークトラフィックを最小限に抑えます。Parquetインデックス（最小-最大など）もClickHouseクエリエンジンによって活用されることがあります。
:::

この挿入が完了したら、関連するパーティションを移動できます。

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads
```

もし履歴データが孤立したバケットの場合、上記の時間フィルタは必要ありません。時間または単調増加カラムが利用できない場合は、履歴データを分離してください。

:::note ClickHouse CloudでのClickPipesの利用
ClickHouse Cloudユーザーは、データが自分のバケットに隔離できる場合（フィルタリングが不要）、履歴バックアップの復元にはClickPipesを使用する必要があります。これにより、複数のワーカーでロードを並列化し、ロード時間を短縮し、ClickPipesは上記のプロセスを自動化します - 主テーブルとマテリアライズドビューのための重複テーブルを作成します。
:::

## シナリオ2: 既存テーブルへのマテリアライズドビューの追加 {#scenario-2-adding-materialized-views-to-existing-tables}

既に大きなデータがポピュレートされていて、データが挿入されているセットアップに新しいマテリアライズドビューを追加する必要があることは珍しくありません。ここでは、ストリーム内のポイントを特定するために使用できるタイムスタンプまたは単調増加カラムが役立ち、データ取り込みの一時停止を回避します。以下の例では、両方のケースを仮定し、取り込みを一時停止しないアプローチを優先します。

:::note POPULATEを避ける
小さいデータセットで挿入が一時停止される場合を除き、マテリアライズドビューのバックフィルに[`POPULATE`](/sql-reference/statements/create/view#materialized-view)コマンドの使用は推奨しません。このオペレーターは、ポピュレートハッシュが完了した後にそのソーステーブルに挿入された行を見逃す可能性があります。さらに、このポピュレートはすべてのデータに対して実行され、大規模データセットでの中断やメモリ制限に脆弱です。
:::

### タイムスタンプまたは単調増加カラムが利用可能 {#timestamp-or-monotonically-increasing-column-available}

この場合、新しいマテリアライズドビューには、今後の任意のデータより大きい行のみに制限するフィルターが含まれていることをお勧めします。マテリアライズドビューは、その後、主テーブルの履歴データを使用してこの日からバックフィルできます。バックフィリングアプローチは、データサイズおよび関連するクエリの複雑性に依存します。

最も単純なアプローチは、次の手順を含みます。

1. 任意の近い将来の時間より大きい行のみを考慮するフィルターを持つマテリアライズドビューを作成します。
2. マテリアライズドビューのターゲットテーブルに挿入する`INSERT INTO SELECT`クエリを実行し、ビューの集約クエリでソーステーブルから読み込みます。

これは、ステップ（2）でデータのサブセットをターゲットにしたり、マテリアライズドビューのための重複ターゲットテーブルを使用することでさらに強化できます（挿入が完了したら元のにパーティションを添付）。

たとえば、以下のマテリアライズドビューは、時間ごとの最も人気のあるプロジェクトを計算します。

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

ターゲットテーブルを追加できますが、マテリアライズドビューを追加する前に、その`SELECT`句を変更し、近い将来の任意の時間より大きい行のみを考慮するフィルターを含めます - この場合、`2024-12-17 09:00:00`が将来の数分であると仮定します。

```sql
CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) AS hour,
 project, count() AS count
FROM pypi WHERE timestamp >= '2024-12-17 09:00:00'
GROUP BY hour, project
```

このビューが追加されると、このデータ以前のすべてのデータをマテリアライズドビューのためにバックフィルすることができます。

これを行う最も簡単な方法は、最近追加されたデータを無視するフィルターを用いた主テーブルからのマテリアライズドビューのクエリを実行し、結果をマテリアライズドビューのターゲットテーブルに`INSERT INTO SELECT`で挿入することです。たとえば、上記のビューの場合：

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
上記の例では、ターゲットテーブルは[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)です。この場合、元の集約クエリを単純に使用できます。 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)のようなより複雑なユースケースでは、集約のために`-State`関数を使用することになります。この例は[こちら](/integrations/s3/performance#be-aware-of-merges)で見られます。
:::

この場合、比較的軽量な集約が3秒未満で完了し、600MiB未満のメモリを使用しました。より複雑なまたは長時間実行される集約の場合、ユーザーは、前述の重複テーブルアプローチを使用することで、このプロセスをより耐障害性のあるものにできます。例えば、シャドウターゲットテーブル、すなわち`pypi_downloads_per_day_v2`を作成し、ここに挿入し、結果のパーティションを`pypi_downloads_per_day`に添付することです。

しばしば、マテリアライズドビューのクエリはより複雑で（そうでなければユーザーはビューを使用しないでしょう！）、リソースを消費します。よりまれなケースでは、クエリに必要なリソースがサーバーのそれを超えることがあります。これは、ClickHouseのマテリアライズドビューの利点の1つを強調します - それらはインクリメンタルであり、全データセットを一度に処理しません！

この場合、ユーザーにはいくつかのオプションがあります。

1. クエリを修正して、バックフィル範囲を指定します。例：`WHERE timestamp BETWEEN 2024-12-17 08:00:00 AND 2024-12-17 09:00:00`、`WHERE timestamp BETWEEN 2024-12-17 07:00:00 AND 2024-12-17 08:00:00`など。
2. [Nullテーブルエンジン](/engines/table-engines/special/null)を使用してマテリアライズドビューを充填します。これにより、マテリアライズドビューの典型的なインクリメンタルポピュレーションを複製し、設定可能なサイズのデータブロックでクエリを実行します。

（1）は、最も単純なアプローチで、しばしば十分です。簡略化のために例を含めていません。

以下で（2）をさらに探求します。

#### マテリアライズドビューを充填するためのNullテーブルエンジンの使用 {#using-a-null-table-engine-for-filling-materialized-views}

[Nullテーブルエンジン](/engines/table-engines/special/null)は、データを永続化しないストレージエンジンを提供します（テーブルエンジンの世界では`/dev/null`と考えてください）。これは矛盾しているように思えるかもしれませんが、マテリアライズドビューはこのテーブルエンジンに挿入されたデータで実行されます。これにより、元のデータを永続化いせずにマテリアライズドビューを構築でき、I/Oや関連するストレージを回避します。

重要な点は、このテーブルエンジンに付随するマテリアライズドビューは、挿入されるデータのブロックで実行され、結果をターゲットテーブルに送信します。これらのブロックは設定可能なサイズです。より大きなブロックは、効率的に処理できる可能性が高く（処理が速い）、より多くのリソース（主にメモリ）を消費します。このテーブルエンジンを使用することで、マテリアライズドビューをインクリメンタルに構築できるすなわち、一度に1ブロックずつ、メモリに全体の集約を保持する必要を回避できます。

<Image img={nullTableMV} size="md" alt="ClickHouseにおける非正規化"/>

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

ここでは、マテリアライズドビューを構築するために使用される行を受信するためにNullテーブル`pypi_v2`を作成します。必要なカラムのみをスキーマに制限していることに注意してください。私たちのマテリアライズドビューは、このテーブルに挿入された行に対して集約を行い（1ブロックずつ）、結果をターゲットテーブル`pypi_downloads_per_day`に送信します。

:::note
ここでターゲットテーブルとして`pypi_downloads_per_day`を使用しています。追加の耐障害性のために、ユーザーは重複テーブル`pypi_downloads_per_day_v2`を作成し、ビューのターゲットテーブルとしてこれを使用できます。挿入が完了すると、`pypi_downloads_per_day_v2`のパーティションを`pypi_downloads_per_day`に移動することができます。これにより、メモリの問題やサーバーの中断により挿入が失敗した場合の回復が可能になります。すなわち、`pypi_downloads_per_day_v2`をトランケートし、設定を調整し、再試行するだけです。
:::

このマテリアライズドビューをポピュレートするために、単に`pypi`から`pypi_v2`にバックフィルする関連データを挿入します。

```sql
INSERT INTO pypi_v2 SELECT timestamp, project FROM pypi WHERE timestamp < '2024-12-17 09:00:00'

0 rows in set. Elapsed: 27.325 sec. Processed 1.50 billion rows, 33.48 GB (54.73 million rows/s., 1.23 GB/s.)
Peak memory usage: 639.47 MiB.
```

ここでのメモリ使用量は`639.47 MiB`です。

##### パフォーマンスとリソースの調整 {#tuning-performance--resources}

上記のシナリオでのパフォーマンスとリソース使用量は、いくつかの要因によって決まります。調整を試みる前に、読者が[最適化のためのS3挿入および読み取りパフォーマンスガイド](/integrations/s3/performance)の[使用スレッドのリファレンス](/integrations/s3/performance#using-threads-for-reads)セクションで詳細に記載されている挿入メカニズムを理解することをお勧めします。要約すると：

- **読み取りの並列性** - 読み取りに使用されるスレッドの数。[`max_threads`](/operations/settings/settings#max_threads)を通じて制御されます。ClickHouse Cloudでは、インスタンスのサイズによって決定され、デフォルトではvCPUの数になっています。この値を増やすと、メモリ使用量は多くなりますが、読み取りパフォーマンスが向上する可能性があります。
- **挿入の並列性** - 挿入に使用されるスレッドの数。[`max_insert_threads`](/operations/settings/settings#max_insert_threads)を通じて制御されます。ClickHouse Cloudでは、インスタンスのサイズ（2〜4の範囲）が決定し、OSSでは1に設定されています。この値を増やすと、メモリ使用量を増やしながらパフォーマンスが向上する可能性があります。
- **挿入ブロックサイズ** - データはループで処理され、プルされ、解析され、[パーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key)に基づいてメモリ内の挿入ブロックに形成されます。これらのブロックは、ソート、最適化、圧縮され、新しい[data parts](/parts)としてストレージに書き込まれます。挿入ブロックのサイズは、設定[`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)および[`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（非圧縮）を通じて制御され、メモリ使用量およびディスクI/Oに影響を与えます。より大きなブロックは、より多くのメモリを使用しますが、部品の数が減り、I/Oおよびバックグラウンドマージが減少します。これらの設定は最小しきい値を表し（最初に到達したほうがフラッシュをトリガーします）。
- **マテリアライズドビューのブロックサイズ** - 主な挿入に関する上記メカニズムに加え、マテリアライズドビューへの挿入前に、より効率的な処理のためにブロックが圧縮されます。これらのブロックのサイズは、設定[`min_insert_block_size_bytes_for_materialized_views`](/operations/settings/settings#min_insert_block_size_bytes_for_materialized_views)および[`min_insert_block_size_rows_for_materialized_views`](/operations/settings/settings#min_insert_block_size_rows_for_materialized_views)によって決定されます。より大きなブロックは、より効率的な処理を可能にしますが、メモリ使用量が増加します。デフォルトでは、これらの設定は、ソーステーブル設定[`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)および[`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)の値に戻ります。

パフォーマンスを向上させるために、ユーザーは[挿入のためのスレッドとブロックサイズの調整](/integrations/s3/performance#tuning-threads-and-block-size-for-inserts)セクションで概説されたガイドラインに従うことができます。通常、パフォーマンス向上のために`min_insert_block_size_bytes_for_materialized_views`および`min_insert_block_size_rows_for_materialized_views`を変更する必要はありません。これらを変更する場合は、`min_insert_block_size_rows`および`min_insert_block_size_bytes`に関して考えたとおりのベストプラクティスを使用してください。

メモリを最小限に抑えるために、ユーザーはこれらの設定を実験することを検討する場合があります。これは、パフォーマンスを低下させることになります。前述のクエリを使用して、以下に例を示します。

`max_insert_threads`を1に設定すると、メモリオーバーヘッドが減少します。

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

`max_threads`設定を1に減少させることで、さらにメモリを減少させることができます。

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

最後に、`min_insert_block_size_rows`を0に設定して（ブロックサイズの決定要因として無効にする）、`min_insert_block_size_bytes`を10485760（10MiB）に設定することでさらにメモリを減少できます。

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

最後に、ブロックサイズを小さくすると部品の数が増え、マージ圧力が高まることに注意してください。これらの設定は慎重に変更する必要があります。[こちらで詳しく説明しています](/integrations/s3/performance#be-aware-of-merges)。

### タイムスタンプまたは単調増加カラムがない場合 {#no-timestamp-or-monotonically-increasing-column}

上記のプロセスは、ユーザーがタイムスタンプまたは単調増加カラムを持っていることを前提としています。場合によってはこれは単に利用できないことがあります。この場合、以下のプロセスを推奨します。これは、以前に概説された多くの手順を活用しますが、ユーザーは取り込みを一時停止する必要があります。

1. 主テーブルへの挿入を一時停止します。
2. `CREATE AS`文を使用して主ターゲットテーブルの複製を作成します。
3. [`ALTER TABLE ATTACH`](/sql-reference/statements/alter/partition#attach-partitionpart)を使用して、元のターゲットテーブルから重複テーブルにパーティションを添付します。 **注意:** このアタッチ操作は、以前に使用した移動とは異なります。ハードリンクに依存してはいますが、元のテーブル内のデータは保存されます。
4. 新しいマテリアライズドビューを作成します。
5. 挿入を再開します。 **注意:** 挿入はターゲットテーブルのみを更新し、重複テーブルは元のデータのみを参照します。
6. マテリアライズドビューをバックフィルし、上記のタイムスタンプでデータに対して使用したプロセスを適用します。重複テーブルをソースとして使用します。

次の例では、PyPIと以前の新しいマテリアライズドビュー`pypi_downloads_per_day`を使用し（タイムスタンプを使用できないと仮定）、考えてみましょう。

```sql
SELECT count() FROM pypi

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 0.003 sec.

-- (1) Pause inserts
-- (2) Create a duplicate of our target table

CREATE TABLE pypi_v2 AS pypi

SELECT count() FROM pypi_v2

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 0.004 sec.

-- (3) Attach partitions from the original target table to the duplicate.

ALTER TABLE pypi_v2
 (ATTACH PARTITION tuple() FROM pypi)

-- (4) Create our new materialized views

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

-- (4) Restart inserts. We replicate here by inserting a single row.

INSERT INTO pypi SELECT *
FROM pypi
LIMIT 1

SELECT count() FROM pypi

┌────count()─┐
│ 2039988138 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 0.003 sec.

-- notice how pypi_v2 contains same number of rows as before

SELECT count() FROM pypi_v2
┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

-- (5) Backfill the view using the backup pypi_v2

INSERT INTO pypi_downloads_per_day SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi_v2
GROUP BY
    hour,
 project

0 rows in set. Elapsed: 3.719 sec. Processed 2.04 billion rows, 47.15 GB (548.57 million rows/s., 12.68 GB/s.)

DROP TABLE pypi_v2;
```

最後から2番目のステップでは、先に説明したシンプルな`INSERT INTO SELECT`アプローチを利用して`pypi_downloads_per_day`をバックフィルします。このプロセスは、[上で示した](#using-a-null-table-engine-for-filling-materialized-views)Nullテーブルアプローチを使用して強化することもでき、重複テーブルを使用して耐障害性を高めます。

この操作は挿入を一時停止する必要がありますが、中間操作は通常迅速に完了することができ、データの中断を最小限に抑えることができます。
