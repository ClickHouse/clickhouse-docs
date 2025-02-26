---
slug: /materialized-view/incremental-materialized-view
title: 増分マテリアライズドビュー
description: クエリを高速化するための増分マテリアライズドビューの使用方法
keywords: [増分マテリアライズドビュー, クエリの高速化, クエリ最適化]
---

# 増分マテリアライズドビュー

増分マテリアライズドビュー（マテリアライズドビュー）は、ユーザーがクエリ時間から挿入時間への計算コストを移行することを可能にし、結果として`SELECT`クエリが高速化されます。

Postgresのようなトランザクショナルデータベースとは異なり、ClickHouseのマテリアライズドビューは、テーブルにデータが挿入される際にデータブロックに対してクエリを実行するトリガーに過ぎません。このクエリの結果は、2つ目の「ターゲット」テーブルに挿入されます。さらに行が挿入されると、結果は再びターゲットテーブルに送信され、中間結果が更新され、マージされます。このマージされた結果は、元のデータ全体に対してクエリを実行するのと同等です。

マテリアライズドビューの主な動機は、ターゲットテーブルに挿入された結果が行に対する集約、フィルタリング、または変換の結果を表すことです。これらの結果は、元のデータの小さな表現（集約の場合は部分的なスケッチ）であることが多いです。これにより、ターゲットテーブルから結果を読み取るための結果クエリが単純になり、同じ計算を元のデータに対して行った場合よりもクエリ時間が短縮され、計算はクエリ時間から挿入時間へとシフトします。

ClickHouseのマテリアライズドビューは、基づいているテーブルにデータが流入するにつれてリアルタイムで更新され、常に更新されるインデックスのように機能します。これは、他のデータベースではマテリアライズドビューが通常、クエリの静的スナップショットであり、リフレッシュされる必要がある（ClickHouseの[リフレッシャブルマテリアライズドビュー](/sql-reference/statements/create/view#refreshable-materialized-view)に類似）こととは対照的です。

<img src={require('./images/materialized-view-diagram.png').default}    
class='image'
alt='マテリアライズドビューの図'
style={{width: '500px'}} />

## 例 {#example}

投稿ごとの日ごとのアップ票数とダウン票数を取得したいとします。

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

これは、[`toStartOfDay`](/sql-reference/functions/date-time-functions#tostartofday)関数のおかげで、ClickHouseではかなりシンプルなクエリです：

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

このクエリはClickHouseのおかげですでに速いですが、さらに良い結果を得ることは可能でしょうか？

マテリアライズドビューを使用して、挿入時間にこれを計算したい場合、結果を受け取るためのテーブルが必要です。このテーブルは、日ごとに1行のみを保持する必要があります。既存の日に対する更新が行われた場合、他のカラムは既存の日の行にマージされる必要があります。この増分ステートをマージするには、他のカラムの部分的なステートを保存する必要があります。

これには、ClickHouseで特別なエンジンタイプが必要です：[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。これにより、同じ順序キーを持つすべての行が1行に置き換えられ、数値カラムの合計値が含まれます。以下のテーブルは、同じ日付の任意の行をマージし、数値カラムを合計します：

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

マテリアライズドビューを示すために、私たちの投票テーブルが空でまだデータを受け取っていないと仮定します。マテリアライズドビューは、挿入された`votes`データに対して上記の`SELECT`を実行し、結果を`up_down_votes_per_day`に送信します：

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

ここでの`TO`句は重要であり、結果が`up_down_votes_per_day`に送られることを示しています。

以前の挿入から投票テーブルを再構築します：

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

完了後、`up_down_votes_per_day`のサイズを確認できます - 日ごとに1行あるはずです：

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│	5723 │
└─────────┘
```

ここでは、`votes`から238百万の行が5000に効果的に減少しています。ここで重要なのは、もし新しい投票が`votes`テーブルに挿入されると、新しい値がそれぞれの日に`up_down_votes_per_day`に送られ、バックグラウンドで非同期的に自動的にマージされ、日ごとに1行だけが保持されるということです。したがって、`up_down_votes_per_day`は常に小さいだけでなく、最新の状態を保つことができます。

行のマージが非同期で行われるため、ユーザーがクエリを実行する際に1日あたりの投票が1件以上存在する場合があります。未処理の行がクエリ時にマージされることを確実にするためには、2つのオプションがあります：

- テーブル名に`FINAL`修飾子を使用します。上記のカウントクエリでこれを行いました。
- 最終テーブルで使用される順序キー（`CreationDate`）で集約し、指標を合計します。通常、これはより効率的で柔軟ですが（テーブルは他の用途にも使えるため）、前者は一部のクエリには簡単かもしれません。以下に両方を示します：

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

これにより、クエリの実行時間が0.133秒から0.004秒に短縮され、25倍以上の改善が得られました！

:::important 重要: `ORDER BY` = `GROUP BY`
ほとんどの場合、マテリアライズドビューの変換における`GROUP BY`句で使用されるカラムは、`SummingMergeTree`または`AggregatingMergeTree`テーブルエンジンを使用している場合、ターゲットテーブルの`ORDER BY`句で使用されるカラムと一致する必要があります。これらのエンジンは、バックグラウンドマージ操作中に同一の値を持つ行をマージするために`ORDER BY`カラムに依存しています。`GROUP BY`と`ORDER BY`のカラム間の不一致は、クエリパフォーマンスの非効率、最適でないマージ、またはデータの不整合を引き起こす可能性があります。
:::

### より複雑な例 {#a-more-complex-example}

上記の例では、マテリアライズドビューを使用して、日ごとに2つの合計を計算し維持しています。合計は、部分的なステートを維持するための最も単純な集約形式を表します。新しい値が到着する際に既存の値に加算することができます。しかし、ClickHouseのマテリアライズドビューは、任意の集約タイプに使用できます。

たとえば、投稿の統計を各日に対して計算したいとします：`Score`の99.9パーセンタイルと`CommentCount`の平均です。この計算を行うためのクエリは次のようになります：

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

以前と同様に、マテリアライズドビューを作成して、新しい投稿が`posts`テーブルに挿入されるときに上記のクエリを実行します。

例示の目的で、データをS3からロードするのを避けるために、`posts`と同じスキーマを持つ複製テーブル`posts_null`を作成します。しかし、このテーブルはデータを保存せず、マテリアライズドビューによって新しい行が挿入されたときにのみ使用されます。データの保存を防ぐために、[`Null`テーブルエンジンタイプ](/engines/table-engines/special/null)を使用します。

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Nullテーブルエンジンは強力な最適化です - `/dev/null`と考えてください。私たちのマテリアライズドビューは、`posts_null`テーブルに行が挿入されたときに、統計を計算して保存します - これは単にトリガーです。しかし、元のデータは保存されません。私たちの場合、原則として元の投稿を保存する必要がありますが、このアプローチは、生データのストレージオーバーヘッドを回避しながら集約を計算するために使用できます。

したがって、マテリアライズドビューは次のようになります：

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

集約関数の末尾に`State`というサフィックスを追加していることに注意してください。これにより、関数の集約状態が返され、最終結果ではなく部分的な状態が返されます。この状態は、他の状態とマージするための追加情報を含みます。たとえば、平均の場合、これはカウントとカラムの合計を含みます。

> 部分集約状態は、正しい結果を計算するためには必要です。たとえば、平均を計算するためには、区間の平均を単純に平均することは正しい結果を生じません。

次に、これらの部分集約状態を保存する`post_stats_per_day`というターゲットテーブルを作成します。

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

以前は`SummingMergeTree`がカウントを保存するのに十分でしたが、他の関数にはより高度なエンジンタイプが必要です：[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)。
ClickHouseが集約状態が保存されることを認識できるように、`Score_quantiles`と`AvgCommentCount`を`AggregateFunction`タイプとして定義し、部分状態のソース関数とそのソースカラムのタイプを指定します。`SummingMergeTree`のように、同じ`ORDER BY`キー値を持つ行はマージされます（上記の例では`Day`）。

マテリアライズドビューを通じて`post_stats_per_day`をポピュレートするには、`posts`からすべての行を`posts_null`に挿入できます：

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> 本番環境では、マテリアライズドビューを`posts`テーブルに添付するのが一般的です。ここでは、nullテーブルを示すために`posts_null`を使用しています。

最終的なクエリでは、関数に`Merge`サフィックスを使用する必要があります（カラムが部分集約状態を保存しているため）：

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

ここで`FINAL`を使用するのではなく、`GROUP BY`を使用していることに注意してください。

## マテリアライズドビューのフィルタと結合におけるソーステーブルの使用 {#using-source-table-in-filters-and-joins-in-materialized-views}

ClickHouseでマテリアライズドビューを使用する際には、マテリアライズドビューのクエリの実行中にソーステーブルがどのように扱われるかを理解することが重要です。具体的には、マテリアライズドビューのクエリ内のソーステーブルは、挿入されたデータブロックに置き換えられます。この動作は、正しく理解できていないと予期しない結果をもたらす可能性があります。

### 例のシナリオ {#example-scenario}

次の設定を考えてみましょう：

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

上記の例では、`mvw1`と`mvw2`という2つのマテリアライズドビューが、ソーステーブル`t0`への参照する方法にわずかな違いがある類似の操作を実行します。

`mvw1`内では、`t0`テーブルがJOINの右側のサブクエリ内の`(SELECT * FROM t0)`で直接参照されます。データが`t0`に挿入されると、マテリアライズドビューのクエリは挿入されたデータブロックが`t0`に置き換えられて実行されます。これにより、JOIN操作は新たに挿入された行のみに対してのみ実行され、全テーブルに対してではありません。

`vt0`をJOINする場合、ビューは`t0`からのすべてのデータを読み取ります。これにより、JOIN操作は新たに挿入されたブロックだけでなく`t0`のすべての行を考慮します。

### なぜこのように機能するのか {#why-this-works-like-that}

ワーキングしているキーポイントは、ClickHouseがマテリアライズドビューのクエリ内のソーステーブルを処理する方法です。マテリアライズドビューが挿入によってトリガーされると、ソーステーブル（この場合`t0`）は挿入されたデータブロックに置き換えられます。この動作は、クエリの最適化を可能にしますが、予期しない結果を回避するためには注意が必要です。

### 使用事例と注意点 {#use-cases-and-caveats}

実際には、この動作を利用して、ソーステーブルのデータのサブセットのみを処理する必要があるマテリアライズドビューを最適化することができます。たとえば、サブクエリを使用してソーステーブルをフィルタリングし、その後他のテーブルと結合することができます。これにより、マテリアライズドビューで処理されるデータの量を削減し、パフォーマンスを向上させることができます。

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

この例では、`IN (SELECT id FROM t0)`サブクエリから生成されたセットが新しく挿入された行だけであり、これにより`t1`をそれに対してフィルタリングするのに役立ちます。

## その他のアプリケーション {#other-applications}

上記では、マテリアライズドビューを使用して、部分的な集計を増分的に更新することに重点を置いています。これは、計算をクエリから挿入時間に移動させる一般的なユースケースですが、マテリアライズドビューには他の多くのアプリケーションがあります。

### フィルタリングと変換 {#filtering-and-transformation}

場合によっては、挿入時に行とカラムのサブセットのみを挿入したいことがあります。この場合、私たちの`posts_null`テーブルは挿入を受け取ることができ、挿入時に`posts`テーブルに行をフィルタリングする`SELECT`クエリを使用します。たとえば、私たちが`posts`テーブル内の`Tags`カラムを変換したいとします。これには、パイプ区切りのタグ名のリストが含まれています。これらを配列に変換することで、個々のタグ値で集約することが容易になります。

> `INSERT INTO SELECT`を実行する際に、この変換を実行できます。マテリアライズドビューを使用することで、ClickHouseのDDLにこのロジックをカプセル化し、`INSERT`をシンプルに保ちながら、新しい行に適用される変換を行います。

この変換のためのマテリアライズドビューは以下のように示されます：

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
   	SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```

### ルックアップテーブル {#lookup-table}

ユーザーは、ClickHouseの順序キーを選択する際に、フィルタおよび集約句で頻繁に使用されるカラムを考慮すべきです。これは、ユーザーが単一のカラムセットにカプセル化できないより多様なアクセスパターンを持っているシナリオに制約をもたらす可能性があります。たとえば、次の`comments`テーブルを考えてみましょう：

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

ここでの順序キーは、`PostId`で絞り込むクエリ向けにテーブルを最適化します。

ユーザーが特定の`UserId`でフィルタリングし、彼らの平均`Score`を計算しようとするとします：

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

これは速いですが（ClickHouseではデータが小さいため）、処理された行数からわかるように、完全なテーブルスキャンが必要です - 90.38百万。大規模なデータセットで、`UserId`によるフィルタリングに使用される`PostId`のルックアップのためにマテリアライズドビューを使用できます。この値を使用して効率的なルックアップを行います。

この例では、私たちのマテリアライズドビューは非常にシンプルで、挿入時に`comments`から`PostId`と`UserId`のみを選択します。これらの結果は、`UserId`で順序付けられたテーブル`comments_posts_users`に送信されます。同様に、以下に`Comments`テーブルのnullバージョンを作成し、ビューと`comments_posts_users`テーブルをポピュレートするために使用します：

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

これで、このビューをサブクエリで使用して、前のクエリを加速できます：

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

### チェイニング {#chaining}

マテリアライズドビューはチェイン可能であり、複雑なワークフローを確立できます。実用的な例として、この[ブログ投稿](https://clickhouse.com/blog/chaining-materialized-views)をお勧めします。
