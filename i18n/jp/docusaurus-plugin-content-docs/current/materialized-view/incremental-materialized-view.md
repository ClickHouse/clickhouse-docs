---
slug: /materialized-view/incremental-materialized-view
title: 'インクリメンタルマテリアライズドビュー'
description: 'インクリメンタルマテリアライズドビューを使用してクエリを高速化する方法'
keywords: ['インクリメンタルマテリアライズドビュー', 'クエリの高速化', 'クエリ最適化']
score: 10000
doc_type: 'guide'
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import Image from '@theme/IdealImage';

## 背景 {#background}

インクリメンタルマテリアライズドビュー（マテリアライズドビュー）を使用すると、計算コストをクエリ実行時からデータ挿入時に移すことができ、その結果、`SELECT` クエリを高速化できます。

Postgres のようなトランザクション型データベースとは異なり、ClickHouse のマテリアライズドビューは、テーブルにデータブロックが挿入される際にクエリを実行する単なるトリガーです。このクエリの結果は、2つ目の「ターゲット」テーブルに挿入されます。さらに行が挿入されると、その結果が再びターゲットテーブルに送られ、中間結果が更新・マージされます。このマージ済みの結果は、すべての元データに対してクエリを実行した場合と同等の結果になります。

マテリアライズドビューの主な目的は、ターゲットテーブルに挿入される結果が、行に対する集約、フィルタリング、または変換の結果を表している点にあります。これらの結果は、多くの場合、元のデータよりも小さな表現（集約の場合は部分的なスケッチ表現）になります。さらに、ターゲットテーブルから結果を読み出すためのクエリは単純であるため、同じ計算を元のデータ上で実行する場合と比べてクエリ時間が短くなり、計算（ひいてはクエリレイテンシ）をクエリ実行時から挿入時に移すことができます。

ClickHouse のマテリアライズドビューは、それらが基づくテーブルにデータが流入するのに合わせてリアルタイムに更新され、継続的に更新されるインデックスのように機能します。これは、他の多くのデータベースにおける、更新が必要な静的なクエリ結果のスナップショットとしてのマテリアライズドビュー（ClickHouse の [Refreshable Materialized Views](/sql-reference/statements/create/view#refreshable-materialized-view) に類似）とは対照的です。

<Image img={materializedViewDiagram} size="md" alt="マテリアライズドビューの図"/>

## 例 {#example}

例として、[&quot;Schema Design&quot;](/data-modeling/schema-design) で説明されている Stack Overflow のデータセットを使用します。

ある投稿について、1 日あたりの賛成票と反対票の数を取得したいとします。

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

これは、[`toStartOfDay`](/sql-reference/functions/date-time-functions#toStartOfDay) 関数のおかげで、ClickHouse では比較的単純なクエリです。

```sql
SELECT toStartOfDay(CreationDate) AS day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY day
ORDER BY day ASC
LIMIT 10

┌─────────────────day─┬─UpVotes─┬─DownVotes─┐
│ 2008-07-31 00:00:00 │       6 │         0 │
│ 2008-08-01 00:00:00 │     182 │        50 │
│ 2008-08-02 00:00:00 │     436 │       107 │
│ 2008-08-03 00:00:00 │     564 │       100 │
│ 2008-08-04 00:00:00 │    1306 │       259 │
│ 2008-08-05 00:00:00 │    1368 │       269 │
│ 2008-08-06 00:00:00 │    1701 │       211 │
│ 2008-08-07 00:00:00 │    1544 │       211 │
│ 2008-08-08 00:00:00 │    1241 │       212 │
│ 2008-08-09 00:00:00 │     576 │        46 │
└─────────────────────┴─────────┴───────────┘

10 rows in set. Elapsed: 0.133 sec. Processed 238.98 million rows, 2.15 GB (1.79 billion rows/s., 16.14 GB/s.)
Peak memory usage: 363.22 MiB.
```

このクエリは ClickHouse のおかげですでに高速ですが、さらに高速化できるでしょうか？

これをマテリアライズドビューを使って挿入時に計算する場合、その結果を受け取るためのテーブルが必要です。このテーブルは 1 日あたり 1 行だけを保持する必要があります。既存の日付に対して更新があった場合は、他のカラムは既存の日付の行にマージされる必要があります。このようにインクリメンタルな状態をマージできるようにするには、他のカラムについても部分的な状態を保存しておく必要があります。

そのためには、ClickHouse では特別なテーブルエンジンである [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) を使用します。これは、同じソートキーを持つすべての行を、数値カラムの値を合計した 1 行に置き換えます。次のテーブルは、同じ日付を持つ行をマージし、数値カラムを合計します。

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

マテリアライズドビューを説明するために、まず `votes` テーブルが空で、まだデータを一切受け取っていない状態を想定します。マテリアライズドビューは、`votes` に挿入されたデータに対して上記の `SELECT` を実行し、その結果を `up_down_votes_per_day` に格納します。

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

ここでの `TO` 句が重要で、結果の送信先、つまり `up_down_votes_per_day` を指定します。

先ほどの `INSERT` 文を使って `votes` テーブルに再度データを投入できます。

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

処理が完了したら、`up_down_votes_per_day` の行数を確認します。1 日につき 1 行になっているはずです。

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

ここでは、クエリ結果を保存することで、`votes` にあった 2 億 3800 万行を 5000 行まで効果的に削減しました。ここで重要なのは、新しい投票が `votes` テーブルに挿入されると、その日の `up_down_votes_per_day` に新しい値が送られ、バックグラウンドで非同期的に自動マージされる点です。その結果、1 日あたり 1 行のみが保持されます。したがって、`up_down_votes_per_day` は常に小さく、かつ最新の状態に保たれます。

行のマージは非同期で行われるため、ユーザがクエリを実行した時点では 1 日あたり複数の行が存在する場合があります。クエリ実行時に未マージの行も確実に統合するには、次の 2 つの方法があります。

* テーブル名に `FINAL` 修飾子を使用する。上記のカウントクエリではこの方法を使用しました。
* 最終テーブルで使用している並び替えキー、すなわち `CreationDate` で集約し、メトリクスを合計する。この方法は一般的により効率的かつ柔軟（テーブルを他の用途にも利用可能）ですが、前者のほうが一部のクエリでは単純になる場合があります。以下に両方の方法を示します。

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
│ 2008-07-31 │       6 │         0 │
│ 2008-08-01 │     182 │        50 │
│ 2008-08-02 │     436 │       107 │
│ 2008-08-03 │     564 │       100 │
│ 2008-08-04 │    1306 │       259 │
│ 2008-08-05 │    1368 │       269 │
│ 2008-08-06 │    1701 │       211 │
│ 2008-08-07 │    1544 │       211 │
│ 2008-08-08 │    1241 │       212 │
│ 2008-08-09 │     576 │        46 │
└────────────┴─────────┴───────────┘

10 rows in set. Elapsed: 0.010 sec. Processed 8.97 thousand rows, 89.68 KB (907.32 thousand rows/s., 9.07 MB/s.)
Peak memory usage: 567.61 KiB.
```

これにより、クエリの実行時間は 0.133 秒から 0.004 秒へ短縮され、25 倍以上の高速化が実現しました！

:::important 重要: `ORDER BY` = `GROUP BY`
ほとんどの場合、`SummingMergeTree` または `AggregatingMergeTree` テーブルエンジンを使用する際は、マテリアライズドビュー変換の `GROUP BY` 句で使用される列を、対象テーブルの `ORDER BY` 句で使用される列と一致させる必要があります。これらのエンジンは、バックグラウンドのマージ処理中に同一の値を持つ行をマージするために `ORDER BY` 列に依存しています。`GROUP BY` 列と `ORDER BY` 列が一致していないと、クエリパフォーマンスの低下、不十分なマージ、さらにはデータ不整合を引き起こす可能性があります。
:::

### さらに複雑な例 {#a-more-complex-example}

上記の例では、マテリアライズドビューを使用して、1 日あたり 2 つの合計値を計算および保持しています。合計値は部分的な状態を保持するための最も単純な集約形式であり、新しい値が到着したときに既存の値にただ加算していけば済みます。ただし、ClickHouse のマテリアライズドビューは、あらゆる種類の集約に対して使用できます。

次に、各日の投稿に対していくつかの統計量を計算したいとします。具体的には、`Score` の 99.9 パーセンタイルと `CommentCount` の平均です。これを計算するクエリは次のようになります。

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
│ 2024-03-31 00:00:00 │  5.23700000000008 │ 1.3429811866859624 │
│ 2024-03-30 00:00:00 │                 5 │ 1.3097158891616976 │
│ 2024-03-29 00:00:00 │  5.78899999999976 │ 1.2827635327635327 │
│ 2024-03-28 00:00:00 │                 7 │  1.277746158224246 │
│ 2024-03-27 00:00:00 │ 5.738999999999578 │ 1.2113264918282023 │
│ 2024-03-26 00:00:00 │                 6 │ 1.3097536945812809 │
│ 2024-03-25 00:00:00 │                 6 │ 1.2836721018539201 │
│ 2024-03-24 00:00:00 │ 5.278999999999996 │ 1.2931667891256429 │
│ 2024-03-23 00:00:00 │ 6.253000000000156 │  1.334061135371179 │
│ 2024-03-22 00:00:00 │ 9.310999999999694 │ 1.2388059701492538 │
└─────────────────────┴───────────────────┴────────────────────┘

10 rows in set. Elapsed: 0.113 sec. Processed 59.82 million rows, 777.65 MB (528.48 million rows/s., 6.87 GB/s.)
Peak memory usage: 658.84 MiB.
```

前と同様に、`posts` テーブルに新しい投稿が挿入されるたびに、上記のクエリを実行するマテリアライズドビューを作成できます。

この例では、S3 から投稿データを読み込まないようにするため、`posts` と同じスキーマを持つ複製テーブル `posts_null` を作成します。ただし、このテーブルはデータを一切保存せず、行が挿入された際にマテリアライズドビューによってのみ使用されます。データの保存を防ぐために、[`Null` テーブルエンジン](/engines/table-engines/special/null) を使用できます。

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Null テーブルエンジンは強力な最適化機構で、`/dev/null` のようなものだと考えることができます。`posts_null` テーブルに行が挿入されたタイミングで、マテリアライズドビューが要約統計量を計算して保存します。これは単なるトリガーにすぎません。ただし、生データ自体は保存されません。今回のケースでは元の `posts` も保存しておきたいと考えるのが自然ですが、この方法を用いると、生データのストレージオーバーヘッドを発生させずに集計を計算できます。

したがって、マテリアライズドビューは次のようになります。

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

集約関数の末尾にサフィックス `State` を付けていることに注目してください。これにより、関数の最終結果ではなく、集約状態が返されるようになります。この状態には、この部分的な状態を他の状態とマージできるようにするための追加情報が含まれます。例えば平均値の場合、この状態には列の件数と合計が含まれます。

> 部分的な集約状態は、正しい結果を計算するために必要です。例えば平均値を計算する場合、単純に各部分範囲の平均値同士を平均しても、正しい結果にはなりません。

次に、これらの部分的な集約状態を保存する、このビュー `post_stats_per_day` のターゲットテーブルを作成します。

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

以前は `SummingMergeTree` でカウントを保存するには十分でしたが、他の関数のためにはより高度なテーブルエンジンが必要です。そのため、[`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree) を使用します。
ClickHouse に集約状態が保存されることを認識させるために、`Score_quantiles` と `AvgCommentCount` を型 `AggregateFunction` として定義し、部分状態の元となる関数と、そのソースカラムの型を指定します。`SummingMergeTree` と同様に、同じ `ORDER BY` キー値を持つ行はマージされます（上記の例では `Day`）。

マテリアライズドビュー経由で `post_stats_per_day` にデータを投入するには、`posts` から `posts_null` にすべての行をそのまま挿入するだけです。

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> 本番環境では通常、マテリアライズドビューは `posts` テーブルにアタッチします。ここではヌルテーブルを示すために `posts_null` を使用しています。

最終的なクエリでは（カラムに部分集約状態が保存されているため）、`Merge` 接尾辞付きの関数を使用する必要があります。

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

ここでは `FINAL` ではなく `GROUP BY` を使用していることに注意してください。

## その他の用途 {#other-applications}

ここまでは主に、マテリアライズドビューを使用してデータの部分集計をインクリメンタルに更新し、計算をクエリ実行時から挿入時へと移動する方法に焦点を当てました。この一般的なユースケースに加えて、マテリアライズドビューには他にもさまざまな用途があります。

### フィルタリングと変換 {#filtering-and-transformation}

状況によっては、挿入時に行や列の一部だけを取り込めばよい場合があります。この場合、`posts_null` テーブルで挿入を受け付け、`posts` テーブルへ挿入する前に `SELECT` クエリで行をフィルタリングすることができます。例えば、`posts` テーブル内の `Tags` 列を変換したいとします。この列にはパイプ区切りのタグ名リストが含まれています。これを配列に変換することで、個々のタグ値ごとに集計しやすくなります。

> この変換は、`INSERT INTO SELECT` を実行する際に行うこともできます。マテリアライズドビューを使用すると、このロジックを ClickHouse の DDL 内にカプセル化でき、`INSERT` 自体はシンプルなまま、すべての新規行に対して変換が適用されるようにできます。

この変換用のマテリアライズドビューを以下に示します。

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```

### ルックアップテーブル {#lookup-table}

ユーザーは ClickHouse のソートキーを選択する際、自身のアクセスパターンを考慮する必要があります。フィルタ句や集約句で頻繁に使用されるカラムを含めるべきです。これは、アクセスパターンが多様で単一のカラム集合では表現しきれないシナリオにおいては制約となり得ます。たとえば、次のような `comments` テーブルを考えてみます。

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

ここで指定しているソートキーは、`PostId` でフィルタするクエリに対してテーブルを最適化します。

特定の `UserId` でフィルタし、その平均 `Score` を計算したいユーザーがいると仮定します。

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

┌──────────avg(Score)─┐
│ 0.18181818181818182 │
└─────────────────────┘

1 row in set. Elapsed: 0.778 sec. Processed 90.38 million rows, 361.59 MB (116.16 million rows/s., 464.74 MB/s.)
Peak memory usage: 217.08 MiB.
```

ClickHouse にとってはデータ量が小さいため高速ではありますが、処理された行数（9038 万行）から、このクエリではテーブル全体のフルスキャンが行われていることが分かります。より大きなデータセットの場合、`UserId` 列でフィルタリングする際に、並び替えキーである `PostId` の値を参照するためにマテリアライズドビューを利用できます。これらの値を使って効率的にルックアップを行うことができます。

この例では、マテリアライズドビューは非常に単純で、`comments` への insert 時に `PostId` と `UserId` のみを選択します。これらの結果は、`UserId` で並び替えられた `comments_posts_users` テーブルに送られます。以下で `Comments` テーブルの空のバージョンを作成し、これを使ってビューおよび `comments_posts_users` テーブルを埋めます。

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

これで、このビューをサブクエリとして利用し、先ほどのクエリを高速化できます。

```sql
SELECT avg(Score)
FROM comments
WHERE PostId IN (
        SELECT PostId
        FROM comments_posts_users
        WHERE UserId = 8592047
) AND UserId = 8592047

┌──────────avg(Score)─┐
│ 0.18181818181818182 │
└─────────────────────┘

1 row in set. Elapsed: 0.012 sec. Processed 88.61 thousand rows, 771.37 KB (7.09 million rows/s., 61.73 MB/s.)
```

1 行がセットに含まれました。経過時間: 0.012 秒。処理: 88.61 千行、771.37 KB (7.09 百万行/秒、61.73 MB/秒)。

```sql
CREATE TABLE badges
(
    `Id` UInt32,
    `UserId` Int32,
    `Name` LowCardinality(String),
    `Date` DateTime64(3, 'UTC'),
    `Class` Enum8('Gold' = 1, 'Silver' = 2, 'Bronze' = 3),
    `TagBased` Bool
)
ENGINE = MergeTree
ORDER BY UserId

CREATE TABLE users
(
    `Id` Int32,
    `Reputation` UInt32,
    `CreationDate` DateTime64(3, 'UTC'),
    `DisplayName` LowCardinality(String),
    `LastAccessDate` DateTime64(3, 'UTC'),
    `Location` LowCardinality(String),
    `Views` UInt32,
    `UpVotes` UInt32,
    `DownVotes` UInt32
)
ENGINE = MergeTree
ORDER BY Id;
```

## マテリアライズドビューと JOIN {#materialized-views-and-joins}

:::note リフレッシュ型マテリアライズドビュー
以下の内容はインクリメンタルマテリアライズドビューにのみ適用されます。リフレッシュ型マテリアライズドビューは、対象となる全データセットに対して定期的にクエリを実行するため、JOIN を完全にサポートします。結果の鮮度の低下をある程度許容できる場合は、複雑な JOIN ではこちらの利用を検討してください。
:::

ClickHouse のインクリメンタルマテリアライズドビューは `JOIN` 演算を完全にサポートしますが、1 つ重要な制約があります。それは、**マテリアライズドビューはソーステーブル（クエリ内の最も左側のテーブル）への挿入時にのみトリガーされる**という点です。JOIN の右側のテーブルは、そのデータが変更されても更新をトリガーしません。この挙動は、挿入時にデータを集約または変換する **インクリメンタル** マテリアライズドビューを構築する際に特に重要です。

`JOIN` を使ってインクリメンタルマテリアライズドビューを定義した場合、`SELECT` クエリ内の最も左側のテーブルがソースとして機能します。このテーブルに新しい行が挿入されると、ClickHouse はマテリアライズドビューのクエリを、その新しく挿入された行に対してのみ実行します。JOIN の右側のテーブルは、この実行時に全件が読み込まれますが、それらのテーブルだけが変更されてもビューはトリガーされません。

この挙動により、マテリアライズドビューにおける JOIN は、静的なディメンションデータに対するスナップショット JOIN に近い動作になります。

これは、リファレンステーブルやディメンションテーブルを用いてデータを付加する用途にはうまく機能します。しかし、右側のテーブル（例：ユーザーメタデータ）に対する更新は、マテリアライズドビューを遡って更新することはありません。更新されたデータを反映させるには、ソーステーブルに新しい行が挿入される必要があります。

### 例 {#materialized-views-and-joins-example}

[Stack Overflow データセット](/data-modeling/schema-design) を用いた具体例を見ていきます。ここでは、`users` テーブルからユーザーの表示名を含めて、**ユーザーごとの日次バッジ数** を計算するマテリアライズドビューを作成します。

おさらいとして、テーブルスキーマは次のとおりです。

```sql
INSERT INTO users
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet');
```

`users` テーブルにはあらかじめデータが投入されているものとします。

```sql
CREATE TABLE daily_badges_by_user
(
    Day Date,
    UserId Int32,
    DisplayName LowCardinality(String),
    Gold UInt32,
    Silver UInt32,
    Bronze UInt32
)
ENGINE = SummingMergeTree
ORDER BY (DisplayName, UserId, Day);

CREATE MATERIALIZED VIEW daily_badges_by_user_mv TO daily_badges_by_user AS
SELECT
    toDate(Date) AS Day,
    b.UserId,
    u.DisplayName,
    countIf(Class = 'Gold') AS Gold,
    countIf(Class = 'Silver') AS Silver,
    countIf(Class = 'Bronze') AS Bronze
FROM badges AS b
LEFT JOIN users AS u ON b.UserId = u.Id
GROUP BY Day, b.UserId, u.DisplayName;
```

マテリアライズドビューとそれに関連付けられたターゲットテーブルは、次のように定義されます。

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

:::note Grouping and Ordering Alignment
マテリアライズドビューの `GROUP BY` 句には、`SummingMergeTree` のターゲットテーブルの `ORDER BY` と整合させるために、`DisplayName`、`UserId`、`Day` を含めなければなりません。これにより、行が正しく集約およびマージされます。これらのいずれかを省略すると、結果が不正確になったり、マージが非効率になったりする可能性があります。
:::

ここでバッジを投入すると、ビューがトリガーされ、`daily_badges_by_user` テーブルにデータが書き込まれます。

```sql
SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'gingerwizard'

┌────────Day─┬──UserId─┬─DisplayName──┬─Gold─┬─Silver─┬─Bronze─┐
│ 2023-02-27 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-02-28 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2013-10-30 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2024-03-04 │ 2936484 │ gingerwizard │    0 │      1 │      0 │
│ 2024-03-05 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-04-17 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2013-11-18 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-10-31 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
└────────────┴─────────┴──────────────┴──────┴────────┴────────┘

8 rows in set. Elapsed: 0.018 sec. Processed 32.77 thousand rows, 642.14 KB (1.86 million rows/s., 36.44 MB/s.)
```

特定のユーザーが獲得したバッジを確認したい場合、次のようなクエリを実行できます。

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.

SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'gingerwizard'
┌────────Day─┬──UserId─┬─DisplayName──┬─Gold─┬─Silver─┬─Bronze─┐
│ 2013-10-30 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2013-11-18 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-02-27 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-02-28 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-04-17 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-10-31 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2024-03-04 │ 2936484 │ gingerwizard │    0 │      1 │      0 │
│ 2024-03-05 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2025-04-13 │ 2936484 │ gingerwizard │    1 │      0 │      0 │
└────────────┴─────────┴──────────────┴──────┴────────┴────────┘

9 rows in set. Elapsed: 0.017 sec. Processed 32.77 thousand rows, 642.27 KB (1.96 million rows/s., 38.50 MB/s.)
```

これで、このユーザーが新しいバッジを獲得し、行が挿入されると、ビューが更新されます。

```sql
INSERT INTO badges VALUES (53505059, 23923286, 'Good Answer', now(), 'Bronze', 0);
INSERT INTO users VALUES (23923286, 1, now(),  'brand_new_user', now(), 'UK', 1, 1, 0);
```

:::warning
ここでの挿入レイテンシに注意してください。挿入されたユーザー行は `users` テーブル全体と結合されるため、挿入パフォーマンスが大きく低下します。これに対処する方法については、以下の [&quot;Using source table in filters and joins&quot;](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views) で説明します。
:::

逆に、新しいユーザーに対して先にバッジを挿入し、その後でユーザー行を挿入した場合、マテリアライズドビューはそのユーザーのメトリクスを取りこぼしてしまいます。

```sql
SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'brand_new_user';

0 rows in set. Elapsed: 0.017 sec. Processed 32.77 thousand rows, 644.32 KB (1.98 million rows/s., 38.94 MB/s.)
```

```sql
INSERT INTO badges VALUES (53505060, 23923286, 'Teacher', now(), 'Bronze', 0);

SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'brand_new_user'

┌────────Day─┬───UserId─┬─DisplayName────┬─Gold─┬─Silver─┬─Bronze─┐
│ 2025-04-13 │ 23923286 │ brand_new_user │    0 │      0 │      1 │
└────────────┴──────────┴────────────────┴──────┴────────┴────────┘

1 row in set. Elapsed: 0.018 sec. Processed 32.77 thousand rows, 644.48 KB (1.87 million rows/s., 36.72 MB/s.)
```

このケースでは、この `view` はユーザー行が存在する前のバッジ挿入時にのみ実行されます。ユーザー用に別のバッジを挿入すると、想定どおり行が挿入されます。

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
│  3 │
│  5 │
└────┘

SELECT * FROM mvw2;
┌─c0─┐
│  3 │
│  8 │
└────┘
```

ただし、この結果は正しくありません。

### マテリアライズドビューにおける JOIN のベストプラクティス {#join-best-practices}

* **左端のテーブルをトリガーとして使用する。** `SELECT` 文の左側のテーブルだけがマテリアライズドビューをトリガーします。右側のテーブルへの変更では更新はトリガーされません。

* **JOIN するデータを事前に挿入しておく。** 結合対象のテーブル内のデータは、ソーステーブルに行を挿入する前に存在していることを必ず確認してください。JOIN は挿入時に評価されるため、データが欠けているとマッチしない行や null になります。

* **JOIN から取得する列を絞り込む。** メモリ使用量を最小化し、挿入時のレイテンシを削減するために、JOIN 先テーブルからは必要な列だけを選択します（後述）。

* **挿入時のパフォーマンスを評価する。** JOIN は、特に右側のテーブルが大きい場合、挿入処理のコストを増加させます。本番環境を代表するデータセットを使って挿入レートをベンチマークしてください。

* **単純なルックアップには Dictionary を優先する。** 高コストな JOIN を避けるため、キー・バリューのルックアップ（例: ユーザー ID から名前など）には [Dictionaries](/dictionary) を使用してください。

* **マージ効率のために `GROUP BY` と `ORDER BY` を揃える。** `SummingMergeTree` や `AggregatingMergeTree` を使用する場合、ターゲットテーブルでは `GROUP BY` が `ORDER BY` 句と一致するようにして、行マージを効率良く行えるようにします。

* **明示的なカラムエイリアスを使用する。** テーブル間で列名が重複している場合は、エイリアスを使用して曖昧さを回避し、ターゲットテーブルで正しい結果を得られるようにします。

* **挿入ボリュームと頻度を考慮する。** JOIN は中程度の挿入ワークロードには適していますが、高スループットなインジェストでは、ステージングテーブル、事前 JOIN、あるいは Dictionaries や [Refreshable Materialized Views](/materialized-view/refreshable-materialized-view) などの別のアプローチを検討してください。

### フィルターや JOIN でのソーステーブルの使用 {#using-source-table-in-filters-and-joins-in-materialized-views}

ClickHouse のマテリアライズドビューを扱う際には、マテリアライズドビューのクエリ実行中にソーステーブルがどのように扱われるかを理解しておくことが重要です。具体的には、マテリアライズドビューのクエリ内のソーステーブルは、挿入されたデータブロックに置き換えられます。この挙動を正しく理解していないと、予期しない結果につながる可能性があります。

#### 例となるシナリオ {#example-scenario}

次のようなセットアップを考えます：

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

#### 解説 {#explanation}

上記の例では、`mvw1` と `mvw2` という 2 つのマテリアライズドビューがあり、同様の処理を行いますが、ソーステーブル `t0` の参照方法にわずかな違いがあります。

`mvw1` では、テーブル `t0` は JOIN の右側にある `(SELECT * FROM t0)` サブクエリ内で直接参照されています。`t0` にデータが挿入されると、マテリアライズドビューのクエリは、`t0` の代わりに挿入されたデータブロックを用いて実行されます。これは、JOIN 処理がテーブル全体ではなく、新たに挿入された行のみに対して行われることを意味します。

2 つ目のケースである `vt0` との JOIN では、そのビューは `t0` からすべてのデータを読み出します。これにより、JOIN 処理は新たに挿入されたブロックだけでなく、`t0` にあるすべての行を対象とすることが保証されます。

重要な違いは、ClickHouse がマテリアライズドビューのクエリ内でソーステーブルをどのように扱うかにあります。マテリアライズドビューが INSERT によってトリガーされた場合、ソーステーブル（この例では `t0`）は挿入されたデータブロックに置き換えられます。この挙動はクエリの最適化に活用できますが、想定外の結果を避けるためには慎重な検討が必要です。

### ユースケースと注意点 {#use-cases-and-caveats}

実際には、この挙動を利用して、ソーステーブルのデータの一部のみを処理すればよいマテリアライズドビューを最適化することができます。例えば、他のテーブルと JOIN を行う前に、サブクエリを使ってソーステーブルをフィルタリングできます。これにより、マテリアライズドビューが処理するデータ量を減らし、パフォーマンスを向上させることができます。

```sql
CREATE MATERIALIZED VIEW daily_badges_by_user_mv TO daily_badges_by_user
AS SELECT
    toDate(Date) AS Day,
    b.UserId,
    u.DisplayName,
    countIf(Class = 'Gold') AS Gold,
    countIf(Class = 'Silver') AS Silver,
    countIf(Class = 'Bronze') AS Bronze
FROM badges AS b
LEFT JOIN users AS u ON b.UserId = u.Id
GROUP BY Day, b.UserId, u.DisplayName;
```

この例では、`IN (SELECT id FROM t0)` サブクエリから構築される集合には、新しく挿入された行のみが含まれます。これにより、その集合を使って `t1` をフィルタリングできます。

#### Stack Overflow を用いた例 {#example-with-stack-overflow}

ユーザーごとの**1 日あたりのバッジ数**を計算し、さらに `users` テーブルからユーザーの表示名を含めるために、[前述のマテリアライズドビューの例](/materialized-view/incremental-materialized-view#example)を考えてみます。

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

このビューにより、`badges` テーブルへの挿入レイテンシが大きく影響を受けました。例えば、次のようになります。

```sql
CREATE MATERIALIZED VIEW daily_badges_by_user_mv TO daily_badges_by_user
AS SELECT
    toDate(Date) AS Day,
    b.UserId,
    u.DisplayName,
    countIf(Class = 'Gold') AS Gold,
    countIf(Class = 'Silver') AS Silver,
    countIf(Class = 'Bronze') AS Bronze
FROM badges AS b
LEFT JOIN
(
    SELECT
        Id,
        DisplayName
    FROM users
    WHERE Id IN (
        SELECT UserId
        FROM badges
    )
) AS u ON b.UserId = u.Id
GROUP BY
    Day,
    b.UserId,
    u.DisplayName
```

上記のアプローチを用いて、このビューを最適化します。挿入されたバッジ行のユーザー ID を使って `users` テーブルにフィルター条件を追加します。

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 132.118 sec. Processed 323.43 million rows, 4.69 GB (2.45 million rows/s., 35.49 MB/s.)
Peak memory usage: 1.99 GiB.
```

これは初回の badges の挿入を高速化するだけでなく、

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
```

0 行。経過時間: 132.118 秒。処理済み 323.43 百万行、4.69 GB (2.45 百万行/秒、35.49 MB/秒)。
最大メモリ使用量: 1.99 GiB。

````sql
CREATE TABLE stackoverflow.comments
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
ORDER BY CreationDate

CREATE TABLE stackoverflow.badges
(
    `Id` UInt32,
    `UserId` Int32,
    `Name` LowCardinality(String),
    `Date` DateTime64(3, 'UTC'),
    `Class` Enum8('Gold' = 1, 'Silver' = 2, 'Bronze' = 3),
    `TagBased` Bool
)
ENGINE = MergeTree
ORDER BY UserId
```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
````sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')
```sql
CREATE TABLE stackoverflow.comments
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
ORDER BY CreationDate

CREATE TABLE stackoverflow.badges
(
    `Id` UInt32,
    `UserId` Int32,
    `Name` LowCardinality(String),
    `Date` DateTime64(3, 'UTC'),
    `Class` Enum8('Gold' = 1, 'Silver' = 2, 'Bronze' = 3),
    `TagBased` Bool
)
ENGINE = MergeTree
ORDER BY UserId
```sql
SELECT
 UserId,
 argMax(description, event_time) AS last_description,
 argMax(activity_type, event_time) AS activity_type,
    max(event_time) AS last_activity
FROM
(
    SELECT
 UserId,
 CreationDate AS event_time,
        Text AS description,
        'comment' AS activity_type
    FROM stackoverflow.comments
    UNION ALL
    SELECT
 UserId,
        Date AS event_time,
        Name AS description,
        'badge' AS activity_type
    FROM stackoverflow.badges
)
GROUP BY UserId
ORDER BY last_activity DESC
LIMIT 10
```sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')
```sql
CREATE TABLE user_activity
(
    `UserId` String,
    `last_description` AggregateFunction(argMax, String, DateTime64(3, 'UTC')),
    `activity_type` AggregateFunction(argMax, String, DateTime64(3, 'UTC')),
    `last_activity` SimpleAggregateFunction(max, DateTime64(3, 'UTC'))
)
ENGINE = AggregatingMergeTree
ORDER BY UserId
```sql
SELECT
 UserId,
 argMax(description, event_time) AS last_description,
 argMax(activity_type, event_time) AS activity_type,
    max(event_time) AS last_activity
FROM
(
    SELECT
 UserId,
 CreationDate AS event_time,
        Text AS description,
        'comment' AS activity_type
    FROM stackoverflow.comments
    UNION ALL
    SELECT
 UserId,
        Date AS event_time,
        Name AS description,
        'badge' AS activity_type
    FROM stackoverflow.badges
)
GROUP BY UserId
ORDER BY last_activity DESC
LIMIT 10
```sql
CREATE MATERIALIZED VIEW user_activity_mv TO user_activity AS
SELECT
 UserId,
 argMaxState(description, event_time) AS last_description,
 argMaxState(activity_type, event_time) AS activity_type,
    max(event_time) AS last_activity
FROM
(
    SELECT
 UserId,
 CreationDate AS event_time,
        Text AS description,
        'comment' AS activity_type
    FROM stackoverflow.comments
    UNION ALL
    SELECT
 UserId,
        Date AS event_time,
        Name AS description,
        'badge' AS activity_type
    FROM stackoverflow.badges
)
GROUP BY UserId
ORDER BY last_activity DESC
```sql
CREATE TABLE user_activity
(
    `UserId` String,
    `last_description` AggregateFunction(argMax, String, DateTime64(3, 'UTC')),
    `activity_type` AggregateFunction(argMax, String, DateTime64(3, 'UTC')),
    `last_activity` SimpleAggregateFunction(max, DateTime64(3, 'UTC'))
)
ENGINE = AggregatingMergeTree
ORDER BY UserId
```sql
INSERT INTO comments VALUES (99999999, 23121, 1, 'The answer is 42', now(), 2936484, 'gingerwizard');

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId

┌─UserId──┬─description──────┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ The answer is 42 │ comment       │ 2025-04-15 09:56:19.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.005 sec.
```sql
CREATE MATERIALIZED VIEW user_activity_mv TO user_activity AS
SELECT
 UserId,
 argMaxState(description, event_time) AS last_description,
 argMaxState(activity_type, event_time) AS activity_type,
    max(event_time) AS last_activity
FROM
(
    SELECT
 UserId,
 CreationDate AS event_time,
        Text AS description,
        'comment' AS activity_type
    FROM stackoverflow.comments
    UNION ALL
    SELECT
 UserId,
        Date AS event_time,
        Name AS description,
        'badge' AS activity_type
    FROM stackoverflow.badges
)
GROUP BY UserId
ORDER BY last_activity DESC
```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId;

┌─UserId──┬─description──────┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ The answer is 42 │ comment       │ 2025-04-15 09:56:19.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.005 sec.
```sql
INSERT INTO comments VALUES (99999999, 23121, 1, 'The answer is 42', now(), 2936484, 'gingerwizard');

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId
```sql
DROP TABLE user_activity_mv;
TRUNCATE TABLE user_activity;

CREATE MATERIALIZED VIEW comment_activity_mv TO user_activity AS
SELECT
 UserId,
 argMaxState(Text, CreationDate) AS last_description,
 argMaxState('comment', CreationDate) AS activity_type,
    max(CreationDate) AS last_activity
FROM stackoverflow.comments
GROUP BY UserId;

CREATE MATERIALIZED VIEW badges_activity_mv TO user_activity AS
SELECT
 UserId,
 argMaxState(Name, Date) AS last_description,
 argMaxState('badge', Date) AS activity_type,
    max(Date) AS last_activity
FROM stackoverflow.badges
GROUP BY UserId;
````

`badges`テーブルへの挿入はビューをトリガーしないため、`user_activity`は更新されません:

```sql
INSERT INTO comments VALUES (99999999, 23121, 1, 'The answer is 42', now(), 2936484, 'gingerwizard');

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId;

┌─UserId──┬─description──────┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ The answer is 42 │ comment       │ 2025-04-15 10:18:47.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.006 sec.
````

この問題を解決するには、各 `SELECT` 文ごとにマテリアライズドビューを作成するだけです。

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId

┌─UserId──┬─description──┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ gingerwizard │ badge         │ 2025-04-15 10:20:18.000 │
└─────────┴──────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.006 sec.
```

どちらのテーブルに挿入しても、正しい結果が得られるようになりました。たとえば、`comments` テーブルに対して次のように挿入します。

```sql
CREATE TABLE source
(
    `message` String
)
ENGINE = MergeTree
ORDER BY tuple();

CREATE TABLE target
(
    `message` String,
    `from` String,
    `now` DateTime64(9),
    `sleep` UInt8
)
ENGINE = MergeTree
ORDER BY tuple();

CREATE MATERIALIZED VIEW mv_2 TO target
AS SELECT
    message,
    'mv2' AS from,
    now64(9) as now,
    sleep(1) as sleep
FROM source;

CREATE MATERIALIZED VIEW mv_3 TO target
AS SELECT
    message,
    'mv3' AS from,
    now64(9) as now,
    sleep(1) as sleep
FROM source;

CREATE MATERIALIZED VIEW mv_1 TO target
AS SELECT
    message,
    'mv1' AS from,
    now64(9) as now,
    sleep(1) as sleep
FROM source;
```

同様に、`badges` テーブルへの INSERT 操作は、`user_activity` テーブルにも反映されます。

```sql
INSERT INTO source VALUES ('test')

1 row in set. Elapsed: 3.786 sec.
```

## 並列処理と逐次処理 {#materialized-views-parallel-vs-sequential}

前の例で示したように、1つのテーブルは複数のマテリアライズドビューのソースとして機能できます。これらが実行される順序は、設定 [`parallel_view_processing`](/operations/settings/settings#parallel_view_processing) によって決まります。

デフォルトでは、この設定は `0` (`false`) であり、マテリアライズドビューは `uuid` の順番で逐次的に実行されます。

たとえば、次のような `source` テーブルと、それぞれが行を `target` テーブルに送信する3つのマテリアライズドビューを考えます。

```sql
SELECT
    message,
    from,
    now
FROM target
ORDER BY now ASC

┌─message─┬─from─┬───────────────────────────now─┐
│ test    │ mv3  │ 2025-04-15 14:52:01.306162309 │
│ test    │ mv1  │ 2025-04-15 14:52:02.307693521 │
│ test    │ mv2  │ 2025-04-15 14:52:03.309250283 │
└─────────┴──────┴───────────────────────────────┘

3 rows in set. Elapsed: 0.015 sec.
```

それぞれのビューは、自身の名前と挿入時刻を含めつつ、`target` テーブルに行を挿入する前に 1 秒間一時停止することに注意してください。

`source` テーブルに 1 行を挿入する処理には約 3 秒かかり、それぞれのビューが順番に実行されます。

```sql
SELECT
    name,
 uuid
FROM system.tables
WHERE name IN ('mv_1', 'mv_2', 'mv_3')
ORDER BY uuid ASC

┌─name─┬─uuid─────────────────────────────────┐
│ mv_3 │ ba5e36d0-fa9e-4fe8-8f8c-bc4f72324111 │
│ mv_1 │ b961c3ac-5a0e-4117-ab71-baa585824d43 │
│ mv_2 │ e611cc31-70e5-499b-adcc-53fb12b109f5 │
└──────┴──────────────────────────────────────┘

3 rows in set. Elapsed: 0.004 sec.
```

`SELECT` 文で各行が取り込まれたことを確認できます：

```sql
TRUNCATE target;
SET parallel_view_processing = 1;

INSERT INTO source VALUES ('test');

1 row in set. Elapsed: 1.588 sec.

SELECT
    message,
    from,
    now
FROM target
ORDER BY now ASC

┌─message─┬─from─┬───────────────────────────now─┐
│ test    │ mv3  │ 2025-04-15 19:47:32.242937372 │
│ test    │ mv1  │ 2025-04-15 19:47:32.243058183 │
│ test    │ mv2  │ 2025-04-15 19:47:32.337921800 │
└─────────┴──────┴───────────────────────────────┘

3 rows in set. Elapsed: 0.004 sec.
```

これはビューの `uuid` に対応します。

```sql
CREATE TABLE daily_post_activity
(
    Day Date,
 PostType String,
 PostsCreated SimpleAggregateFunction(sum, UInt64),
 AvgScore AggregateFunction(avg, Int32),
 TotalViews SimpleAggregateFunction(sum, UInt64)
)
ENGINE = AggregatingMergeTree
ORDER BY (Day, PostType);

CREATE MATERIALIZED VIEW daily_post_activity_mv TO daily_post_activity AS
WITH filtered_posts AS (
    SELECT
 toDate(CreationDate) AS Day,
 PostTypeId,
 Score,
 ViewCount
    FROM posts
    WHERE Score > 0 AND PostTypeId IN (1, 2)  -- Question or Answer
)
SELECT
    Day,
    CASE PostTypeId
        WHEN 1 THEN 'Question'
        WHEN 2 THEN 'Answer'
    END AS PostType,
    count() AS PostsCreated,
    avgState(Score) AS AvgScore,
    sum(ViewCount) AS TotalViews
FROM filtered_posts
GROUP BY Day, PostTypeId;
```

一方で、`parallel_view_processing=1` を有効にした状態で行を挿入するとどうなるかを考えてみましょう。これを有効にするとビューは並列に実行されるため、行が対象テーブルに到達する順序は一切保証されません。

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
```

各ビューから到着する行の順序はここでは同じになっていますが、これは保証されていません。各行の挿入時刻が近いことからも分かるとおりです。また、挿入パフォーマンスが改善されている点にも注目してください。

### 並列処理を利用するタイミング {#materialized-views-when-to-use-parallel}

`parallel_view_processing=1` を有効にすると、特に 1 つのテーブルに複数の Materialized Views がアタッチされている場合に、上記のとおり挿入スループットを大きく向上させることができます。ただし、その際のトレードオフを理解しておくことが重要です。

- **挿入負荷の増加**: すべての Materialized Views が同時に実行されるため、CPU およびメモリ使用量が増加します。各ビューが重い計算や JOIN を実行する場合、システムに過大な負荷がかかる可能性があります。
- **厳密な実行順序の必要性**: ビューの実行順序が重要になる（たとえば連鎖した依存関係がある）ワークフローではまれに、並列実行によって不整合な状態やレースコンディションが発生する可能性があります。設計上の工夫で回避することも可能ですが、そのような構成は脆く、将来のバージョンで動作しなくなるおそれがあります。

:::note Historical defaults and stability
逐次実行は長い間デフォルトであり、その一因はエラー処理の複雑さにあります。歴史的には、1 つのマテリアライズドビューで障害が発生すると、他のビューの実行が妨げられることがありました。新しいバージョンでは、ブロック単位で障害を分離することでこれを改善していますが、逐次実行は依然として失敗時の挙動がより明確になります。
:::

一般的には、次のような場合に `parallel_view_processing=1` を有効にします。

- 複数の独立した Materialized Views がある場合
- 挿入パフォーマンスを最大化したい場合
- ビューの同時実行を処理できるシステムのキャパシティを把握している場合

次のような場合は無効のままにしておきます。
- Materialized Views 同士に依存関係がある場合
- 予測可能で順序どおりの実行が必要な場合
- 挿入動作をデバッグまたは監査しており、決定的なリプレイを行いたい場合

## マテリアライズドビューと共通テーブル式 (CTE) {#materialized-views-common-table-expressions-ctes}

**非再帰の**共通テーブル式 (CTE) はマテリアライズドビューでサポートされています。

:::note 共通テーブル式は**マテリアライズされません**
ClickHouse は CTE をマテリアライズせず、代わりに CTE の定義をクエリ内に直接展開します。その結果、CTE が複数回使用される場合には、同じ式が複数回評価される可能性があります。
:::

次の例では、各投稿タイプごとの日次アクティビティを計算します。

```sql
SELECT
    Day,
    PostType,
    avgMerge(AvgScore) AS AvgScore,
    sum(PostsCreated) AS PostsCreated,
    sum(TotalViews) AS TotalViews
FROM daily_post_activity
GROUP BY
    Day,
    PostType
ORDER BY Day DESC
LIMIT 10

┌────────Day─┬─PostType─┬───────────AvgScore─┬─PostsCreated─┬─TotalViews─┐
│ 2024-03-31 │ Question │ 1.3317757009345794 │          214 │       9728 │
│ 2024-03-31 │ Answer   │ 1.4747191011235956 │          356 │          0 │
│ 2024-03-30 │ Answer   │ 1.4587912087912087 │          364 │          0 │
│ 2024-03-30 │ Question │ 1.2748815165876777 │          211 │       9606 │
│ 2024-03-29 │ Question │ 1.2641509433962264 │          318 │      14552 │
│ 2024-03-29 │ Answer   │ 1.4706927175843694 │          563 │          0 │
│ 2024-03-28 │ Answer   │  1.601637107776262 │          733 │          0 │
│ 2024-03-28 │ Question │ 1.3530864197530865 │          405 │      24564 │
│ 2024-03-27 │ Question │ 1.3225806451612903 │          434 │      21346 │
│ 2024-03-27 │ Answer   │ 1.4907539118065434 │          703 │          0 │
└────────────┴──────────┴────────────────────┴──────────────┴────────────┘

10 rows in set. Elapsed: 0.013 sec. Processed 11.45 thousand rows, 663.87 KB (866.53 thousand rows/s., 50.26 MB/s.)
Peak memory usage: 989.53 KiB.
```

ここでは CTE は厳密には不要ですが、例示のために使用しており、このビューは期待どおりに動作します。

```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

```sql
SELECT
    Day,
    PostType,
    avgMerge(AvgScore) AS AvgScore,
    sum(PostsCreated) AS PostsCreated,
    sum(TotalViews) AS TotalViews
FROM daily_post_activity
GROUP BY
    Day,
    PostType
ORDER BY Day DESC
LIMIT 10

┌────────Day─┬─PostType─┬───────────AvgScore─┬─PostsCreated─┬─TotalViews─┐
│ 2024-03-31 │ Question │ 1.3317757009345794 │          214 │       9728 │
│ 2024-03-31 │ Answer   │ 1.4747191011235956 │          356 │          0 │
│ 2024-03-30 │ Answer   │ 1.4587912087912087 │          364 │          0 │
│ 2024-03-30 │ Question │ 1.2748815165876777 │          211 │       9606 │
│ 2024-03-29 │ Question │ 1.2641509433962264 │          318 │      14552 │
│ 2024-03-29 │ Answer   │ 1.4706927175843694 │          563 │          0 │
│ 2024-03-28 │ Answer   │  1.601637107776262 │          733 │          0 │
│ 2024-03-28 │ Question │ 1.3530864197530865 │          405 │      24564 │
│ 2024-03-27 │ Question │ 1.3225806451612903 │          434 │      21346 │
│ 2024-03-27 │ Answer   │ 1.4907539118065434 │          703 │          0 │
└────────────┴──────────┴────────────────────┴──────────────┴────────────┘

10行のセット。経過時間: 0.013秒。処理済み: 11.45千行、663.87 KB (866.53千行/秒、50.26 MB/秒)
ピークメモリ使用量: 989.53 KiB。
```

ClickHouse では、CTE はインライン展開されるため、最適化の際にクエリ内へ実質的にコピー＆ペーストされたような形になり、**マテリアライズされません**。これは次のことを意味します。

* CTE がソーステーブル（つまりマテリアライズドビューが紐づいているテーブル）とは別のテーブルを参照していて、`JOIN` や `IN` 句で使用されている場合、それはトリガーではなくサブクエリや JOIN と同様に動作します。
* マテリアライズドビューは依然としてメインのソーステーブルへの挿入時にのみトリガーされますが、CTE は挿入のたびに再実行されます。そのため、特に参照されるテーブルが大きい場合には、不要なオーバーヘッドを引き起こす可能性があります。

例えば、

```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

この場合、`users` の CTE は `posts` への挿入のたびに再評価され、マテリアライズドビューは新しい行が `users` に挿入されても更新されず、`posts` に挿入が行われたときにのみ更新されます。

一般的には、CTE はマテリアライズドビューが関連付けられている同じソーステーブルに対して動作するロジックに使用するか、参照するテーブルが小さく、パフォーマンスのボトルネックになりにくいことを確認してください。あるいは、[JOIN を伴うマテリアライズドビューに対する同様の最適化](/materialized-view/incremental-materialized-view#join-best-practices)の適用を検討してください。
