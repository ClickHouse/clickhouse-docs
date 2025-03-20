---
slug: /materialized-view/incremental-materialized-view
title: 増分マテリアライズドビュー
description: 増分マテリアライズドビューを利用してクエリを高速化する方法
keywords: [増分マテリアライズドビュー, クエリの高速化, クエリの最適化]
score: 10000
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';


# 増分マテリアライズドビュー

増分マテリアライズドビュー（Materialized Views）を使用することで、ユーザーはクエリ実行時の計算コストを挿入時に移行し、結果として `SELECT` クエリを高速化できます。

Postgresなどのトランザクショナルデータベースとは異なり、ClickHouseのマテリアライズドビューは、テーブルにデータが挿入される際にデータブロックに対してクエリを実行するトリガーに過ぎません。このクエリの結果は、二つ目の「ターゲット」テーブルに挿入されます。さらに行が挿入されると、結果は再びターゲットテーブルに送信され、中間結果が更新されてマージされます。このマージされた結果は、元のデータ全体にクエリを実行するのと同等です。

マテリアライズドビューの主な動機は、ターゲットテーブルに挿入される結果が、行に対する集約、フィルタリング、または変換の結果を表すことです。これらの結果は、元のデータの小さい表現（集約の場合の部分的なスケッチ）であることがよくあります。これにより、ターゲットテーブルから結果を読み取るためのクエリがシンプルになるため、同じ計算を元のデータで行うよりもクエリ時間が短くなり、計算（したがってクエリの待機時間）がクエリ時間から挿入時間にシフトされます。

ClickHouseのマテリアライズドビューは、基盤となるテーブルにデータが流入するにつれてリアルタイムで更新され、常に更新されるインデックスのように機能します。これは、他のデータベースでマテリアライズドビューが通常静的なスナップショットであり、更新が必要であるのと対照的です（ClickHouseの [refreshable materialized views](/sql-reference/statements/create/view#refreshable-materialized-view) に類似）。

<img src={materializedViewDiagram}
     class="image"
     alt="マテリアライズドビュー図"
     style={{width: '500px'}} />

## 例 {#example}

ある投稿の1日ごとの上票と下票の数を取得したいとします。

```sql
CREATE TABLE votes
(
    `Id` UInt32,
    `PostId` Int32,
    `VoteTypeId` UInt8,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `BountyAmount` UInt8
)
ENGINE = MergeTree
ORDER BY (VoteTypeId, CreationDate, PostId)

INSERT INTO votes SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 29.359 sec. Processed 238.98 million rows, 2.13 GB (8.14 million rows/s., 72.45 MB/s.)
```

このクエリは、ClickHouseのおかげで合理的にシンプルで、[`toStartOfDay`](/sql-reference/functions/date-time-functions#tostartofday) 関数を利用できます：

```sql
SELECT toStartOfDay(CreationDate) AS day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY day
ORDER BY day ASC
LIMIT 10

┌─────────────────day─┬─UpVotes─┬─DownVotes─┐
│ 2008-07-31 00:00:00 │   	6 │     	0 │
│ 2008-08-01 00:00:00 │ 	182 │    	50 │
│ 2008-08-02 00:00:00 │ 	436 │   	107 │
│ 2008-08-03 00:00:00 │ 	564 │   	100 │
│ 2008-08-04 00:00:00 │	1306 │   	259 │
│ 2008-08-05 00:00:00 │	1368 │   	269 │
│ 2008-08-06 00:00:00 │	1701 │   	211 │
│ 2008-08-07 00:00:00 │	1544 │   	211 │
│ 2008-08-08 00:00:00 │	1241 │   	212 │
│ 2008-08-09 00:00:00 │ 	576 │    	46 │
└─────────────────────┴─────────┴───────────┘

10 rows in set. Elapsed: 0.133 sec. Processed 238.98 million rows, 2.15 GB (1.79 billion rows/s., 16.14 GB/s.)
Peak memory usage: 363.22 MiB.
```

このクエリはすでにClickHouseによって高速ですが、さらに良くすることはできますか？

挿入時にマテリアライズドビューを使用してこれを計算したい場合、結果を受け取るテーブルが必要です。このテーブルは、1日ごとに1行のみを保持する必要があります。既存の日に対する更新が受信された場合、他のカラムは既存の日の行にマージされる必要があります。この増分状態のマージを行うには、他のカラムの部分的な状態を保存しておく必要があります。

これにはClickHouseの特別なエンジンタイプが必要です：[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。これにより、同じ順序キーを持つすべての行が1行に置き換えられ、数値カラムの合計値が含まれます。次のテーブルは、同じ日付の行をマージし、数値カラムを合計します：

```sql
CREATE TABLE up_down_votes_per_day
(
  `Day` Date,
  `UpVotes` UInt32,
  `DownVotes` UInt32
)
ENGINE = SummingMergeTree
ORDER BY Day
```

マテリアライズドビューを示すために、votesテーブルが空であり、まだデータを受信していないと仮定しましょう。私たちのマテリアライズドビューは、`votes`に挿入されるデータに対して上記の `SELECT` を実行し、その結果を `up_down_votes_per_day` に送信します：

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

ここでの `TO` クレーズは重要で、結果が送信される場所を示します、すなわち `up_down_votes_per_day` です。

先ほどの挿入からvotesテーブルに再挿入できます：

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

完了すると、`up_down_votes_per_day` のサイズを確認できます - 1日ごとに1行があるはずです：

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│	5723 │
└─────────┘
```

ここでは、`votes` から238百万行を5000行に効果的に減少させています。しかし、重要なのは、新しい票が `votes` テーブルに挿入されると、それぞれの日に対する新しい値が `up_down_votes_per_day` に送信され、非同期的にバックグラウンドで自動的にマージされ、1日ごとに1行だけが保持されることです。そのため、`up_down_votes_per_day` は常に小さく、最新の状態であると言えます。

行のマージは非同期で行われるため、ユーザーがクエリを実行する際には、1日に複数の投票があるかもしれません。保留中の行がクエリ時にマージされることを保証するには、以下の2つのオプションがあります：

- テーブル名に `FINAL` 修飾子を使用する。上記のカウントクエリでこれを行いました。
- 最終テーブルで使用される順序キー（即ち `CreationDate` ）で集約し、メトリクスを合計する。通常、こちらがより効率的で柔軟ですが（テーブルは他の目的にも使用可能）、前者は一部のクエリには簡単かもしれません。以下に両方を示します：

```sql
SELECT
	Day,
	UpVotes,
	DownVotes
FROM up_down_votes_per_day
FINAL
ORDER BY Day ASC
LIMIT 10

10 rows in set. Elapsed: 0.004 sec. Processed 8.97 thousand rows, 89.68 KB (2.09 million rows/s., 20.89 MB/s.)
Peak memory usage: 289.75 KiB.

SELECT Day, sum(UpVotes) AS UpVotes, sum(DownVotes) AS DownVotes
FROM up_down_votes_per_day
GROUP BY Day
ORDER BY Day ASC
LIMIT 10
┌────────Day─┬─UpVotes─┬─DownVotes─┐
│ 2008-07-31 │   	6 │     	0 │
│ 2008-08-01 │ 	182 │    	50 │
│ 2008-08-02 │ 	436 │   	107 │
│ 2008-08-03 │ 	564 │   	100 │
│ 2008-08-04 │	1306 │   	259 │
│ 2008-08-05 │	1368 │   	269 │
│ 2008-08-06 │	1701 │   	211 │
│ 2008-08-07 │	1544 │   	211 │
│ 2008-08-08 │	1241 │   	212 │
│ 2008-08-09 │ 	576 │    	46 │
└────────────┴─────────┴───────────┘

10 rows in set. Elapsed: 0.010 sec. Processed 8.97 thousand rows, 89.68 KB (907.32 thousand rows/s., 9.07 MB/s.)
Peak memory usage: 567.61 KiB.
```

これにより、クエリの実行時間が0.133秒から0.004秒に短縮されました - 25倍以上の改善です！

:::important 重要： `ORDER BY` = `GROUP BY`
通常、マテリアライズドビューの変換で使用される `GROUP BY` 句のカラムは、`SummingMergeTree` または `AggregatingMergeTree` テーブルエンジンを使用する場合、ターゲットテーブルの `ORDER BY` 句で使用されるカラムと一致している必要があります。これらのエンジンは、バックグラウンドで行をマージする際に同じ値を持つ行をマージするために `ORDER BY` カラムに依存します。 `GROUP BY` と `ORDER BY` カラム間の不一致は、クエリパフォーマンスの非効率さ、最適でないマージ、またはデータの不一致を引き起こす可能性があります。
:::

### より複雑な例 {#a-more-complex-example}

上記の例では、マテリアライズドビューを使用して1日ごとに2つの合計を計算および維持しました。合計は、部分的な状態を維持する最も単純な集約の形を表します - 新しい値を到着したときに既存の値に加えるだけです。しかし、ClickHouseのマテリアライズドビューは、あらゆる集約タイプに使用することができます。

投稿ごとに1日ごとの統計を計算したいとします： `Score` の99.9パーセンタイルと `CommentCount` の平均。これを計算するクエリは次のようになります：

```sql
SELECT
	toStartOfDay(CreationDate) AS Day,
	quantile(0.999)(Score) AS Score_99th,
	avg(CommentCount) AS AvgCommentCount
FROM posts
GROUP BY Day
ORDER BY Day DESC
LIMIT 10

	┌─────────────────Day─┬────────Score_99th─┬────AvgCommentCount─┐
 1. │ 2024-03-31 00:00:00 │  5.23700000000008 │ 1.3429811866859624 │
 2. │ 2024-03-30 00:00:00 │             	5 │ 1.3097158891616976 │
 3. │ 2024-03-29 00:00:00 │  5.78899999999976 │ 1.2827635327635327 │
 4. │ 2024-03-28 00:00:00 │             	7 │  1.277746158224246 │
 5. │ 2024-03-27 00:00:00 │ 5.738999999999578 │ 1.2113264918282023 │
 6. │ 2024-03-26 00:00:00 │             	6 │ 1.3097536945812809 │
 7. │ 2024-03-25 00:00:00 │             	6 │ 1.2836721018539201 │
 8. │ 2024-03-24 00:00:00 │ 5.278999999999996 │ 1.2931667891256429 │
 9. │ 2024-03-23 00:00:00 │ 6.253000000000156 │  1.334061135371179 │
10. │ 2024-03-22 00:00:00 │ 9.310999999999694 │ 1.2388059701492538 │
	└─────────────────────┴───────────────────┴────────────────────┘

10 rows in set. Elapsed: 0.113 sec. Processed 59.82 million rows, 777.65 MB (528.48 million rows/s., 6.87 GB/s.)
Peak memory usage: 658.84 MiB.
```

以前と同様に、新しい投稿が `posts` テーブルに挿入されるときに上記のクエリを実行するマテリアライズドビューを作成できます。

例の目的上、投稿データをS3からロードするのを避けるために、`posts` と同じスキーマを持つ重複テーブル `posts_null` を作成します。しかし、このテーブルはデータを格納せず、行が挿入されたときにマテリアライズドビューによって使用されるだけです。データの格納を防ぐために、[`Null` テーブルエンジンタイプ](/engines/table-engines/special/null) を使用できます。

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Nullテーブルエンジンは強力な最適化です - `/dev/null` のように考えてください。私たちのマテリアライズドビューは、`posts_null` テーブルが挿入時に行を受け取るときにサマリー統計を計算し保存します - それは単なるトリガーです。しかし、一次データは保存されません。私たちの場合、元の投稿を保存したいかもしれませんが、このアプローチは生データの保存オーバーヘッドを回避しつつ集約を計算するのに使用できます。

マテリアライズドビューは次のようになります：

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

集約関数の最後に `State` サフィックスを追加していることに注意してください。これにより、関数の集約状態が最終結果の代わりに返され、他の状態とマージできる追加情報が含まれます。たとえば、平均の場合、これにはカウントとカラムの合計が含まれます。

> 部分集約状態は、正しい結果を計算するために必要です。たとえば、平均を計算するために、サブ範囲の平均を単に平均化することは不正確な結果を生じます。

次に、このビュー `post_stats_per_day` のためのターゲットテーブルを作成し、これらの部分集約状態を保存します：

```sql
CREATE TABLE post_stats_per_day
(
  `Day` Date,
  `Score_quantiles` AggregateFunction(quantile(0.999), Int32),
  `AvgCommentCount` AggregateFunction(avg, UInt8)
)
ENGINE = AggregatingMergeTree
ORDER BY Day
```

以前に `SummingMergeTree` がカウントを保存するのに十分でしたが、他の関数にはより高度なエンジンタイプが必要です： [`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree)。
集約状態が保存されることをClickHouseに知らせるために、`Score_quantiles` と `AvgCommentCount` のタイプを `AggregateFunction` と定義し、部分状態のソース関数とそのソースカラムのタイプを指定します。`SummingMergeTree` のように、`ORDER BY` キーの値が同じ行はマージされます（上記の例の `Day`）。

マテリアライズドビューを通じて `post_stats_per_day` にポピュレートするために、`posts` からすべての行を `posts_null` に単純に挿入できます：

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> 本番環境では、通常マテリアライズドビューを `posts` テーブルに接続します。ここでは、Nullテーブルを使用してデモを行いました。

私たちの最終クエリは、関数に対して `Merge` のサフィックスを利用する必要があります（カラムが部分集約状態を保存しているため）：

```sql
SELECT
	Day,
	quantileMerge(0.999)(Score_quantiles),
	avgMerge(AvgCommentCount)
FROM post_stats_per_day
GROUP BY Day
ORDER BY Day DESC
LIMIT 10
```

ここでは `FINAL` の代わりに `GROUP BY` を使用しています。

## マテリアライズドビュー内でのソーステーブルのフィルタやジョインの使用 {#using-source-table-in-filters-and-joins-in-materialized-views}

ClickHouseのマテリアライズドビューで作業する際には、マテリアライズドビューのクエリの実行中にソーステーブルがどのように扱われるかを理解することが重要です。特に、マテリアライズドビューのクエリ内のソーステーブルは、挿入されたデータブロックによって置き換えられます。この動作を適切に理解しないと、予期しない結果を引き起こす可能性があります。

### 例のシナリオ {#example-scenario}

以下のセットアップを考えてみましょう：

```sql
CREATE TABLE t0 (`c0` Int) ENGINE = Memory;
CREATE TABLE mvw1_inner (`c0` Int) ENGINE = Memory;
CREATE TABLE mvw2_inner (`c0` Int) ENGINE = Memory;

CREATE VIEW vt0 AS SELECT * FROM t0;

CREATE MATERIALIZED VIEW mvw1 TO mvw1_inner
AS SELECT count(*) AS c0
    FROM t0
    LEFT JOIN ( SELECT * FROM t0 ) AS x ON t0.c0 = x.c0;


CREATE MATERIALIZED VIEW mvw2 TO mvw2_inner
AS SELECT count(*) AS c0
    FROM t0
    LEFT JOIN vt0 ON t0.c0 = vt0.c0;

INSERT INTO t0 VALUES (1),(2),(3);

INSERT INTO t0 VALUES (1),(2),(3),(4),(5);

SELECT * FROM mvw1;
   ┌─c0─┐
1. │  3 │
2. │  5 │
   └────┘

SELECT * FROM mvw2;
   ┌─c0─┐
1. │  3 │
2. │  8 │
   └────┘
```

### 説明 {#explanation}

上記の例では、`mvw1` と `mvw2` という二つのマテリアライズドビューがあり、互いに似た操作を実行していますが、ソーステーブル `t0` への参照の方法にわずかな違いがあります。

`mvw1` では、テーブル `t0` がJOINの右側にある `(SELECT * FROM t0)` サブクエリ内で直接参照されています。データが `t0` に挿入されると、マテリアライズドビューのクエリは挿入されたデータブロックで `t0` を置き換えて実行されます。これにより、JOIN操作が新たに挿入された行だけに実行され、テーブル全体ではなく、新しく挿入された行のみが考慮されます。

vt0をJOINする2番目のケースでは、ビューが` t0` からすべてのデータを読み取ります。これにより、JOIN操作は新しく挿入されたブロックだけでなく、`t0` のすべての行を考慮することができます。

### なぜこのような動作をするのか {#why-this-works-like-that}

ClickHouseがマテリアライズドビューのクエリ内のソーステーブルをどのように扱うかに重要な違いがあります。マテリアライズドビューが挿入によってトリガーされると、ソーステーブル（この場合 `t0` ）は挿入されたデータブロックによって置き換えられます。この動作は、クエリを最適化するために利用できますが、予期しない結果を避けるためには注意が必要です。

### 使用例と警告 {#use-cases-and-caveats}

実際には、この動作を利用して、ソーステーブルのデータのサブセットのみを処理する必要があるマテリアライズドビューを最適化することができます。たとえば、ソーステーブルをフィルタリングしてから他のテーブルにJOINするためにサブクエリを使用できます。これにより、マテリアライズドビューが処理するデータ量を減らし、パフォーマンスを向上させることができます。

```sql
CREATE TABLE t0 (id UInt32, value String) ENGINE = MergeTree() ORDER BY id;
CREATE TABLE t1 (id UInt32, description String) ENGINE = MergeTree() ORDER BY id;
INSERT INTO t1 VALUES (1, 'A'), (2, 'B'), (3, 'C');

CREATE TABLE mvw1_target_table (id UInt32, value String, description String) ENGINE = MergeTree() ORDER BY id;

CREATE MATERIALIZED VIEW mvw1 TO mvw1_target_table AS
SELECT t0.id, t0.value, t1.description
FROM t0
JOIN (SELECT * FROM t1 WHERE t1.id IN (SELECT id FROM t0)) AS t1
ON t0.id = t1.id;
```

この例では、`IN (SELECT id FROM t0)` サブクエリから構築されたセットが新しく挿入された行のみを持ち、これを使って `t1` に対するフィルタリングを行います。

## その他のアプリケーション {#other-applications}

上記では、主にマテリアライズドビューを使用してデータの部分集約をインクリメンタルに更新することに焦点を当て、計算をクエリから挿入時に移行しました。この一般的な使用例を超えて、マテリアライズドビューには他の多くのアプリケーションがあります。

### フィルタリングと変換 {#filtering-and-transformation}

特定の状況では、挿入時に行とカラムのサブセットのみを挿入したい場合があります。この場合、`posts_null` テーブルが挿入を受け取り、`posts` テーブルへの挿入前に行をフィルタリングする `SELECT` クエリが考えられます。たとえば、`posts` テーブル内の `Tags` カラムを変換したいとします。これは、パイプ区切りのタグ名リストを含んでいます。これを配列に変換することで、個々のタグ値で集約する際にもっと簡単に処理できます。

> この変換を `INSERT INTO SELECT` の実行時に行うことができます。マテリアライズドビューを使用すると、このロジックをClickHouse DDLにカプセル化し、挿入がシンプルになり、変換が新しい行に適用されます。

この変換のためのマテリアライズドビューは次のようになります：

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
   	SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```

### ルックアップテーブル {#lookup-table}

ユーザーは、フィルタや集約句で頻繁に使用されるカラムとともにClickHouseの順序キーを選択する際にアクセスパターンを考慮すべきです。これは、ユーザーが単一のカラムセットにカプセル化できない多様なアクセスパターンを持つシナリオには制約がある可能性があります。たとえば、次の `comments` テーブルを考えてみましょう：

```sql
CREATE TABLE comments
(
	`Id` UInt32,
	`PostId` UInt32,
	`Score` UInt16,
	`Text` String,
	`CreationDate` DateTime64(3, 'UTC'),
	`UserId` Int32,
	`UserDisplayName` LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY PostId

0 rows in set. Elapsed: 46.357 sec. Processed 90.38 million rows, 11.14 GB (1.95 million rows/s., 240.22 MB/s.)
```

ここでの順序キーは `PostId` でフィルタリングされるクエリの最適化に役立ちます。

ユーザーが特定の `UserId` でフィルタリングし、彼らの平均 `Score` を計算したいとします：

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.778 sec. Processed 90.38 million rows, 361.59 MB (116.16 million rows/s., 464.74 MB/s.)
Peak memory usage: 217.08 MiB.
```

ClickHouseにはデータが小さいため高速ですが、処理された行数から、これが90.38百万行のフルテーブルスキャンを必要とすることがわかります。大規模なデータセットでは、マテリアライズドビューを使用して、フィルタリングカラム `UserId` の `PostId` の順序キー値をルックアップすることができます。これらの値は、その後効率的なルックアップを実施するために使用されます。

この例では、マテリアライズドビューは非常にシンプルで、`comments` から `PostId` と `UserId` だけを選択します。これらの結果は `comments_posts_users` テーブルに送信され、`UserId` で並び替えられます。以下に `Comments` テーブルのNULLバージョンを作成し、これを使用してビューと `comments_posts_users` テーブルをポピュレートします：

```sql
CREATE TABLE comments_posts_users (
  PostId UInt32,
  UserId Int32
) ENGINE = MergeTree ORDER BY UserId


CREATE TABLE comments_null AS comments
ENGINE = Null

CREATE MATERIALIZED VIEW comments_posts_users_mv TO comments_posts_users AS
SELECT PostId, UserId FROM comments_null

INSERT INTO comments_null SELECT * FROM comments

0 rows in set. Elapsed: 5.163 sec. Processed 90.38 million rows, 17.25 GB (17.51 million rows/s., 3.34 GB/s.)
```

このビューをサブクエリで使用すると、前のクエリを加速できます：

```sql
SELECT avg(Score)
FROM comments
WHERE PostId IN (
	SELECT PostId
	FROM comments_posts_users
	WHERE UserId = 8592047
) AND UserId = 8592047


   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.012 sec. Processed 88.61 thousand rows, 771.37 KB (7.09 million rows/s., 61.73 MB/s.)
```

### チェーン化 {#chaining}

マテリアライズドビューはチェーン化でき、複雑なワークフローを確立できます。実用的な例については、この [ブログ記事](https://clickhouse.com/blog/chaining-materialized-views) をお勧めします。
