---
title: 'クエリ性能 - 時系列'
sidebar_label: 'クエリ性能'
description: '時系列クエリ性能の向上'
slug: /use-cases/time-series/query-performance
keywords: ['time-series']
---


# 時系列クエリ性能

ストレージを最適化した後の次のステップは、クエリ性能を向上させることです。このセクションでは、2つの重要なテクニック、すなわち `ORDER BY` キーの最適化とマテリアライズドビューの使用について探ります。これらのアプローチによって、クエリ時間を秒単位からミリ秒単位に短縮できることを示します。

## ORDER BYキーの最適化 {#time-series-optimize-order-by}

他の最適化を試みる前に、ClickHouse が可能な限り最速の結果を生成できるように、オーダリングキーを最適化する必要があります。オーダリングキーを選択する際は、実行する予定のクエリに大きく依存します。たとえば、私たちのクエリのほとんどが `project` と `subproject` カラムでフィルタリングされるとしましょう。この場合、これらをオーダリングキーに追加するのは良いアイデアです。また、時間に基づいてクエリを実行するため、時間もオーダリングキーに含めます。

`wikistat` と同じカラム型を持ち、 `(project, subproject, time)` でオーダリングされたテーブルの別バージョンを作成しましょう。

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

次に、性能に対するオーダリングキーの重要性を理解するために、複数のクエリを比較してみましょう。前回のデータ型とコーデックの最適化は適用していませんので、クエリ性能の違いはソート順のみに基づいています。

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
            <td style={{ textAlign: 'right' }}>2.381秒</td>
            <td style={{ textAlign: 'right' }}>1.660秒</td>
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
            <td style={{ textAlign: 'right' }}>2.148秒</td>
            <td style={{ textAlign: 'right' }}>0.058秒</td>
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
            <td style={{ textAlign: 'right' }}>2.192秒</td>
            <td style={{ textAlign: 'right' }}>0.012秒</td>
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
            <td style={{ textAlign: 'right' }}>2.968秒</td>
            <td style={{ textAlign: 'right' }}>0.010秒</td>
        </tr>
    </tbody>
</table>

## マテリアライズドビュー {#time-series-materialized-views}

別のオプションは、人気のクエリの結果を集約し保存するためにマテリアライズドビューを使用することです。これらの結果は、元のテーブルの代わりにクエリできます。私たちのケースで頻繁に実行されるクエリが次のようなものだとしましょう：

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

10行がセットされています。経過時間：2.285秒。231.41兆行が処理されました、9.22 GB (101.26百万行/s.、4.03 GB/s.)。
ピークメモリ使用量：1.50 GiB。
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

### 受け入れ先テーブルのバックフィル {#time-series-backfill-destination-table}

この受け入れ先テーブルは、`wikistat` テーブルに新しいレコードが挿入されるときのみポピュレートされるため、[バックフィル](/docs/data-modeling/backfilling) を実施する必要があります。

これを行う最も簡単な方法は、[`INSERT INTO SELECT`](/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) ステートメントを使用して、マテリアライズドビューのターゲットテーブルに直接挿入することです。ビューのSELECTクエリ（変換）を使用します：

```sql
INSERT INTO wikistat_top
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

生データセットのカーディナリティに応じて（私たちには10億行があります！）、これはメモリ集約的なアプローチになる可能性があります。代わりに、最小メモリを要求する変種を使用することができます：

* Nullテーブルエンジンを使用して一時テーブルを作成
* 通常使用されるマテリアライズドビューのコピーをその一時テーブルに接続
* INSERT INTO SELECTクエリを使用して、生データセットのすべてのデータをその一時テーブルにコピー
* 一時テーブルと一時マテリアライズドビューを削除。

このアプローチでは、生データセットから行がブロック単位で一時テーブルにコピーされ（これらの行は保存されません）、各ブロックの行に対して部分状態が計算され、ターゲットテーブルに書き込まれます。この状態はバックグラウンドで徐々にマージされます。

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

次に、`wikistat_backfill` から読み込んで `wikistat_top` に書き込むマテリアライズドビューを作成します：

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

最後に、初期の `wikistat` テーブルから `wikistat_backfill` をポピュレートしましょう：

```sql
INSERT INTO wikistat_backfill
SELECT * 
FROM wikistat;
```

このクエリが終了したら、バックフィルテーブルとマテリアライズドビューを削除できます：

```sql
DROP VIEW wikistat_backfill_top_mv;
DROP TABLE wikistat_backfill;
```

これで、オリジナルテーブルの代わりにマテリアライズドビューをクエリできます：

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

10行がセットされています。経過時間：0.004秒。
```

ここでのパフォーマンスの改善は劇的です。以前はこのクエリの答えを計算するのに2秒以上かかっていましたが、今ではわずか4ミリ秒で済むようになりました。
