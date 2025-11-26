---
title: 'クエリパフォーマンス - 時系列データ'
sidebar_label: 'クエリパフォーマンス'
description: '時系列クエリのパフォーマンス向上'
slug: /use-cases/time-series/query-performance
keywords: ['time-series', 'query performance', 'optimization', 'indexing', 'partitioning', 'query tuning', 'performance']
show_related_blogs: true
doc_type: 'guide'
---



# 時系列クエリのパフォーマンス

ストレージの最適化が完了したら、次のステップはクエリパフォーマンスの向上です。
このセクションでは、`ORDER BY` キーの最適化とマテリアライズドビューの活用という 2 つの主要な手法を解説します。
これらのアプローチによって、クエリ時間を秒単位からミリ秒単位まで短縮できることを見ていきます。



## `ORDER BY` キーの最適化

他の最適化に取り組む前に、ClickHouse が可能な限り高速に結果を返せるよう、まず `ORDER BY` キーを最適化する必要があります。
最適なキーの選択は、主に実行するクエリに依存します。たとえば、ほとんどのクエリが `project` と `subproject` カラムでフィルタするとします。
この場合、時間でも検索を行うため、これらのカラムに加えて `time` カラムも `ORDER BY` キーに含めるのが有効です。

`wikistat` と同じカラム型を持ちつつ、`(project, subproject, time)` を `ORDER BY` とするテーブルの別バージョンを作成してみましょう。

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

ここで複数のクエリを比較して、ソートキー式がパフォーマンスにどの程度重要かを見てみましょう。なお、ここでは前回行ったデータ型やコーデックの最適化は適用していないため、クエリのパフォーマンス差はすべてソート順のみを原因とするものです。

<table>
  <thead>
    <tr>
      <th style={{ width: '36%' }}>クエリ</th>
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

      <td style={{ textAlign: 'right' }}>2.381 秒</td>
      <td style={{ textAlign: 'right' }}>1.660 秒</td>
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

      <td style={{ textAlign: 'right' }}>2.148 秒</td>
      <td style={{ textAlign: 'right' }}>0.058 秒</td>
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

      <td style={{ textAlign: 'right' }}>2.192 秒</td>
      <td style={{ textAlign: 'right' }}>0.012 秒</td>
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

      <td style={{ textAlign: 'right' }}>2.968 秒</td>
      <td style={{ textAlign: 'right' }}>0.010 秒</td>
    </tr>
  </tbody>
</table>


## マテリアライズドビュー

別の方法として、マテリアライズドビューを使用して、よく実行されるクエリの結果を集計・保存することができます。以降は、元のテーブルではなく、これらの結果に対してクエリを実行します。ここでは、次のクエリがかなり頻繁に実行されるケースを想定します。

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

10行のセット。経過時間: 2.285秒。処理済み: 2億3141万行、9.22 GB (1億126万行/秒、4.03 GB/秒)
ピークメモリ使用量: 1.50 GiB。
```

### マテリアライズドビューを作成する

次のマテリアライズドビューを作成します。

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

### 宛先テーブルのバックフィル

この宛先テーブルは `wikistat` テーブルに新しいレコードが挿入されたときにのみデータが投入されるため、[バックフィル](/docs/data-modeling/backfilling)を行う必要があります。

これを行う最も簡単な方法は、[`INSERT INTO SELECT`](/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) ステートメントを使用し、ビューの `SELECT` クエリ（変換処理）を[利用して](https://github.com/ClickHouse/examples/tree/main/ClickHouse_vs_ElasticSearch/DataAnalytics#variant-1---directly-inserting-into-the-target-table-by-using-the-materialized-views-transformation-query)、マテリアライズドビューのターゲットテーブルに直接挿入することです。

```sql
INSERT INTO wikistat_top
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

生データセットのカーディナリティによっては（ここでは 10 億行あります！）、この方法はメモリを多く消費する可能性があります。代わりに、必要なメモリを最小限に抑えられる別の手法を使うこともできます。

* Null テーブルエンジンを持つ一時テーブルを作成する
* 通常使用しているマテリアライズドビューのコピーをその一時テーブルに接続する
* `INSERT INTO SELECT` クエリを使用して、生データセットからすべてのデータをその一時テーブルにコピーする
* 一時テーブルと一時マテリアライズドビューを削除する。

この方法では、生データセットの行がブロック単位で一時テーブル（これらの行は一切保存されません）にコピーされ、各行ブロックごとに部分状態が計算されてターゲットテーブルに書き込まれます。ターゲットテーブルでは、これらの状態がバックグラウンドでインクリメンタルにマージされます。

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

次に、`wikistat_backfill` から読み取り、`wikistat_top` に書き込むマテリアライズドビューを作成します。

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

最後に、最初の `wikistat` テーブルから `wikistat_backfill` テーブルにデータを投入します。

```sql
INSERT INTO wikistat_backfill
SELECT * 
FROM wikistat;
```

そのクエリの実行が完了したら、バックフィル用テーブルとマテリアライズドビューを削除できます。


```sql
DROP VIEW wikistat_backfill_top_mv;
DROP TABLE wikistat_backfill;
```

これで、元のテーブルではなくマテリアライズドビューに対してクエリを実行できるようになりました。

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

10行が返されました。経過時間: 0.004秒
```

ここでのパフォーマンス向上は飛躍的です。
以前はこのクエリの結果を算出するのに 2 秒強を要していましたが、現在ではわずか 4 ミリ秒です。
