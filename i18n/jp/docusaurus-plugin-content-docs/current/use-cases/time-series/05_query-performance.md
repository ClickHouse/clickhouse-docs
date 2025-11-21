---
title: 'クエリパフォーマンス - 時系列'
sidebar_label: 'クエリパフォーマンス'
description: '時系列クエリのパフォーマンス向上'
slug: /use-cases/time-series/query-performance
keywords: ['時系列', 'クエリパフォーマンス', '最適化', 'インデックス', 'パーティショニング', 'クエリチューニング', 'パフォーマンス']
show_related_blogs: true
doc_type: 'guide'
---



# 時系列クエリのパフォーマンス

ストレージの最適化が済んだら、次のステップはクエリパフォーマンスの向上です。
このセクションでは、`ORDER BY` キーの最適化とマテリアライズドビューの活用という 2 つの主要な手法を取り上げます。
これらのアプローチによって、クエリ時間を秒からミリ秒単位へ短縮できることを見ていきます。



## `ORDER BY`キーの最適化 {#time-series-optimize-order-by}

他の最適化を試みる前に、ClickHouseが可能な限り最速の結果を生成できるよう、ORDER BYキーを最適化する必要があります。
適切なキーの選択は、実行予定のクエリに大きく依存します。ほとんどのクエリが`project`列と`subproject`列でフィルタリングすると仮定します。
この場合、時間に対してもクエリを実行するため、`time`列と共にこれらをORDER BYキーに追加することが推奨されます。

`wikistat`と同じ列型を持ちながら、`(project, subproject, time)`でソートされた別バージョンのテーブルを作成しましょう。

```sql
CREATE TABLE wikistat_project_subproject
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = MergeTree
ORDER BY (project, subproject, time);
```

それでは、ORDER BYキー式がパフォーマンスにどれほど重要であるかを把握するために、複数のクエリを比較してみましょう。なお、以前のデータ型とコーデックの最適化は適用していないため、クエリパフォーマンスの違いはソート順のみに基づいています。

<table>
    <thead>
        <tr>
            <th  style={{ width: '36%' }}>クエリ</th>
            <th style={{ textAlign: 'right', width: '32%' }}>`(time)`</th>
            <th style={{ textAlign: 'right', width: '32%' }}>`(project, subproject, time)`</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
```sql
SELECT project, sum(hits) AS h
FROM wikistat
GROUP BY project
ORDER BY h DESC
LIMIT 10;
```       
            </td>
            <td style={{ textAlign: 'right' }}>2.381 sec</td>
            <td style={{ textAlign: 'right' }}>1.660 sec</td>
        </tr>

        <tr>
            <td>

```sql
SELECT subproject, sum(hits) AS h
FROM wikistat
WHERE project = 'it'
GROUP BY subproject
ORDER BY h DESC
LIMIT 10;
```

            </td>
            <td style={{ textAlign: 'right' }}>2.148 sec</td>
            <td style={{ textAlign: 'right' }}>0.058 sec</td>
        </tr>

        <tr>
            <td>

```sql
SELECT toStartOfMonth(time) AS m, sum(hits) AS h
FROM wikistat
WHERE (project = 'it') AND (subproject = 'zero')
GROUP BY m
ORDER BY m DESC
LIMIT 10;
```

            </td>
            <td style={{ textAlign: 'right' }}>2.192 sec</td>
            <td style={{ textAlign: 'right' }}>0.012 sec</td>
        </tr>

        <tr>
            <td>

```sql
SELECT path, sum(hits) AS h
FROM wikistat
WHERE (project = 'it') AND (subproject = 'zero')
GROUP BY path
ORDER BY h DESC
LIMIT 10;
```

            </td>
            <td style={{ textAlign: 'right' }}>2.968 sec</td>
            <td style={{ textAlign: 'right' }}>0.010 sec</td>
        </tr>


    </tbody>

</table>


## マテリアライズドビュー {#time-series-materialized-views}

もう一つの選択肢は、マテリアライズドビューを使用して、頻繁に実行されるクエリの結果を集約して保存することです。これらの結果は、元のテーブルの代わりにクエリできます。次のクエリが頻繁に実行される場合を想定します:

```sql
SELECT path, SUM(hits) AS v
FROM wikistat
WHERE toStartOfMonth(time) = '2015-05-01'
GROUP BY path
ORDER BY v DESC
LIMIT 10
```

```text
┌─path──────────────────┬────────v─┐
│ -                     │ 89650862 │
│ Angelsberg            │ 19165753 │
│ Ana_Sayfa             │  6368793 │
│ Academy_Awards        │  4901276 │
│ Accueil_(homonymie)   │  3805097 │
│ Adolf_Hitler          │  2549835 │
│ 2015_in_spaceflight   │  2077164 │
│ Albert_Einstein       │  1619320 │
│ 19_Kids_and_Counting  │  1430968 │
│ 2015_Nepal_earthquake │  1406422 │
└───────────────────────┴──────────┘

10 rows in set. Elapsed: 2.285 sec. Processed 231.41 million rows, 9.22 GB (101.26 million rows/s., 4.03 GB/s.)
Peak memory usage: 1.50 GiB.
```

### マテリアライズドビューの作成 {#time-series-create-materialized-view}

次のマテリアライズドビューを作成できます:

```sql
CREATE TABLE wikistat_top
(
    `path` String,
    `month` Date,
    hits UInt64
)
ENGINE = SummingMergeTree
ORDER BY (month, hits);
```

```sql
CREATE MATERIALIZED VIEW wikistat_top_mv
TO wikistat_top
AS
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

### 宛先テーブルのバックフィル {#time-series-backfill-destination-table}

この宛先テーブルは、`wikistat`テーブルに新しいレコードが挿入されたときにのみデータが投入されるため、[バックフィル](/docs/data-modeling/backfilling)を行う必要があります。

最も簡単な方法は、[`INSERT INTO SELECT`](/docs/sql-reference/statements/insert-into#inserting-the-results-of-select)文を使用して、ビューの`SELECT`クエリ(変換)を[使用して](https://github.com/ClickHouse/examples/tree/main/ClickHouse_vs_ElasticSearch/DataAnalytics#variant-1---directly-inserting-into-the-target-table-by-using-the-materialized-views-transformation-query)マテリアライズドビューのターゲットテーブルに直接挿入することです:

```sql
INSERT INTO wikistat_top
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

生データセットのカーディナリティによっては(10億行あります!)、これはメモリ集約的なアプローチになる可能性があります。代わりに、最小限のメモリで済む方法を使用できます:

- Nullテーブルエンジンを使用して一時テーブルを作成する
- 通常使用されるマテリアライズドビューのコピーをその一時テーブルに接続する
- `INSERT INTO SELECT`クエリを使用して、生データセットからすべてのデータをその一時テーブルにコピーする
- 一時テーブルと一時マテリアライズドビューを削除する

このアプローチでは、生データセットの行がブロック単位で一時テーブルにコピーされ(この一時テーブルはこれらの行を保存しません)、各行ブロックに対して部分的な状態が計算されてターゲットテーブルに書き込まれ、これらの状態はバックグラウンドで段階的にマージされます。

```sql
CREATE TABLE wikistat_backfill
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = Null;
```

次に、`wikistat_backfill`から読み取り、`wikistat_top`に書き込むマテリアライズドビューを作成します:

```sql
CREATE MATERIALIZED VIEW wikistat_backfill_top_mv
TO wikistat_top
AS
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat_backfill
GROUP BY path, month;
```

そして最後に、初期の`wikistat`テーブルから`wikistat_backfill`にデータを投入します:

```sql
INSERT INTO wikistat_backfill
SELECT *
FROM wikistat;
```

このクエリが完了したら、バックフィルテーブルとマテリアライズドビューを削除できます:


```sql
DROP VIEW wikistat_backfill_top_mv;
DROP TABLE wikistat_backfill;
```

これで元のテーブルではなく、マテリアライズドビューに対してクエリを実行できるようになりました。

```sql
SELECT path, sum(hits) AS hits
FROM wikistat_top
WHERE month = '2015-05-01'
GROUP BY ALL
ORDER BY hits DESC
LIMIT 10;
```

```text
┌─path──────────────────┬─────hits─┐
│ -                     │ 89543168 │
│ Angelsberg            │  7047863 │
│ Ana_Sayfa             │  5923985 │
│ Academy_Awards        │  4497264 │
│ Accueil_(homonymie)   │  2522074 │
│ 2015_in_spaceflight   │  2050098 │
│ Adolf_Hitler          │  1559520 │
│ 19_Kids_and_Counting  │   813275 │
│ Andrzej_Duda          │   796156 │
│ 2015_Nepal_earthquake │   726327 │
└───────────────────────┴──────────┘

10行のセット。経過時間: 0.004秒
```

ここでのパフォーマンス改善は劇的です。
以前はこのクエリの結果を計算するのに 2 秒強かかっていましたが、今ではわずか 4 ミリ秒で済みます。
