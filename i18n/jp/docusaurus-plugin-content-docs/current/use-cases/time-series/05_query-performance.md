---
'title': 'クエリ パフォーマンス - 時系列'
'sidebar_label': 'クエリ パフォーマンス'
'description': '時系列クエリパフォーマンスの向上'
'slug': '/use-cases/time-series/query-performance'
'keywords':
- 'time-series'
'show_related_blogs': true
'doc_type': 'guide'
---


# 時系列クエリのパフォーマンス

ストレージを最適化した後、次のステップはクエリパフォーマンスの向上です。 
このセクションでは、`ORDER BY` キーの最適化とマテリアライズドビューの使用という2つの重要な手法を探ります。 
これらのアプローチがクエリの時間を数秒からミリ秒に短縮できることを見ていきます。

## ORDER BY キーの最適化 {#time-series-optimize-order-by}

他の最適化を試みる前に、ClickHouseが最も迅速な結果を生成できるように、順序キーを最適化する必要があります。 
適切なキーの選択は、実行するクエリによって大きく異なります。たとえば、私たちのクエリの大部分が `project` および `subproject` カラムでフィルタリングされるとします。 
この場合、時間に基づいてクエリを行うため、これらを順序キーに追加するのが良いアイデアです：

同じカラム型を持ち、`(project, subproject, time)` で順序付けされたテーブルの別のバージョンを作成しましょう。

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

今、パフォーマンスに対する私たちの順序キー式の重要性を理解するために、複数のクエリを比較してみましょう。前述のデータ型とコーデックの最適化が適用されていないことに注意してください。したがって、クエリパフォーマンスの違いは、ソート順に基づいてのみ分かれます。

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

## マテリアライズドビュー {#time-series-materialized-views}

別のオプションは、人気のあるクエリの結果を集約して保存するためにマテリアライズドビューを使用することです。これらの結果は、元のテーブルの代わりにクエリを実行できます。私たちのケースでは、次のクエリが非常に頻繁に実行されるとします：

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

次のマテリアライズドビューを作成できます：

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

### デスティネーションテーブルのバックフィル {#time-series-backfill-destination-table}

このデスティネーションテーブルは、`wikistat` テーブルに新しいレコードが挿入されるときのみ populated されるため、[バックフィル](/docs/data-modeling/backfilling)を行う必要があります。

これを行う最も簡単な方法は、マテリアライズドビューのターゲットテーブルに直接挿入するための [`INSERT INTO SELECT`](/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) ステートメントを使用し、ビューのSELECTクエリ（変換）を用いることです：

```sql
INSERT INTO wikistat_top
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

生データセットのカーディナリティによっては（1億行あるため！）、これはメモリ集約的なアプローチになる可能性があります。代わりに、最小限のメモリを必要とするバリアントを使用できます：

* Nullテーブルエンジンを使用して一時テーブルを作成
* 通常使用するマテリアライズドビューのコピーをその一時テーブルに接続
* INSERT INTO SELECTクエリを使用し、生データセットからその一時テーブルにすべてのデータをコピー
* 一時テーブルと一時マテリアライズドビューをドロップ。

このアプローチでは、生データセットの行がブロック単位で一時テーブルにコピーされ（これにはこれらの行は保存されません）、各行ブロックに対して部分的な状態が計算され、ターゲットテーブルに書き込まれ、この状態がバックグラウンドでインクリメンタルにマージされます。

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

次に、`wikistat_backfill` から読み取って `wikistat_top` に書き込むためのマテリアライズドビューを作成します。

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

そして最後に、初回の `wikistat` テーブルから `wikistat_backfill` にデータを供給します：

```sql
INSERT INTO wikistat_backfill
SELECT * 
FROM wikistat;
```

そのクエリが完了すると、バックフィルテーブルとマテリアライズドビューを削除できます：

```sql
DROP VIEW wikistat_backfill_top_mv;
DROP TABLE wikistat_backfill;
```

これで元のテーブルの代わりにマテリアライズドビューをクエリできます：

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

10 rows in set. Elapsed: 0.004 sec.
```

ここでのパフォーマンスの改善は劇的です。 
以前はこのクエリの答えを計算するのに2秒以上かかっていましたが、今ではわずか4ミリ秒です。
