---
slug: /materialized-view/incremental-materialized-view
title: 'インクリメンタルマテリアライズドビュー'
description: 'インクリメンタルマテリアライズドビューを使ってクエリを高速化する方法'
keywords: ['incremental materialized views', 'speed up queries', 'query optimization']
score: 10000
doc_type: 'guide'
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import Image from '@theme/IdealImage';


## 背景 {#background}

インクリメンタルマテリアライズドビュー(Materialized Views)により、計算コストをクエリ実行時から挿入時にシフトすることができ、結果として`SELECT`クエリが高速化されます。

Postgresのようなトランザクショナルデータベースとは異なり、ClickHouseのマテリアライズドビューは、テーブルへのデータ挿入時にデータブロックに対してクエリを実行するトリガーです。このクエリの結果は、2番目の「ターゲット」テーブルに挿入されます。さらに行が挿入されると、結果は再びターゲットテーブルに送られ、中間結果が更新およびマージされます。このマージされた結果は、元のデータ全体に対してクエリを実行した場合と同等になります。

マテリアライズドビューの主な目的は、ターゲットテーブルに挿入される結果が、行に対する集計、フィルタリング、または変換の結果を表すことです。これらの結果は、元のデータよりも小さな表現であることが多く(集計の場合は部分的なスケッチ)、ターゲットテーブルから結果を読み取るクエリがシンプルであることと相まって、元のデータに対して同じ計算を実行する場合よりもクエリ時間が高速になります。これにより、計算(したがってクエリレイテンシ)がクエリ実行時から挿入時にシフトされます。

ClickHouseのマテリアライズドビューは、基となるテーブルにデータが流入するとリアルタイムで更新され、継続的に更新されるインデックスのように機能します。これは、マテリアライズドビューが通常、更新が必要なクエリの静的スナップショットである他のデータベース(ClickHouseの[リフレッシュ可能なマテリアライズドビュー](/sql-reference/statements/create/view#refreshable-materialized-view)と同様)とは対照的です。

<Image
  img={materializedViewDiagram}
  size='md'
  alt='マテリアライズドビューの図'
/>


## 例 {#example}

例として、["スキーマ設計"](/data-modeling/schema-design)で説明されているStack Overflowデータセットを使用します。

投稿に対する1日あたりのアップ投票数とダウン投票数を取得したいとします。

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

[`toStartOfDay`](/sql-reference/functions/date-time-functions#toStartOfDay)関数のおかげで、ClickHouseでは比較的シンプルなクエリになります:

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

このクエリはClickHouseのおかげで既に高速ですが、さらに改善できるでしょうか?

マテリアライズドビューを使用して挿入時にこれを計算したい場合、結果を受け取るテーブルが必要です。このテーブルは1日あたり1行のみを保持する必要があります。既存の日に対して更新を受け取った場合、他のカラムは既存の日の行にマージされる必要があります。この増分状態のマージを実現するには、他のカラムの部分的な状態を保存する必要があります。

これにはClickHouseの特別なエンジンタイプである[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)が必要です。これは、同じソートキーを持つすべての行を、数値カラムの合計値を含む1つの行に置き換えます。次のテーブルは、同じ日付を持つすべての行をマージし、すべての数値カラムを合計します:

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

マテリアライズドビューを実演するために、votesテーブルが空でまだデータを受け取っていないと仮定します。マテリアライズドビューは`votes`に挿入されたデータに対して上記の`SELECT`を実行し、結果を`up_down_votes_per_day`に送信します:

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

ここでの`TO`句が重要で、結果の送信先、つまり`up_down_votes_per_day`を示しています。


先ほどのinsertからvotesテーブルを再投入できます：

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

完了後、`up_down_votes_per_day`のサイズを確認できます - 1日あたり1行になっているはずです：

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

クエリ結果を保存することで、行数を2億3800万行（`votes`テーブル内）から5000行に効果的に削減しました。ここで重要なのは、`votes`テーブルに新しい投票が挿入されると、新しい値がそれぞれの日付に対応する`up_down_votes_per_day`に送信され、バックグラウンドで非同期に自動的にマージされ、1日あたり1行のみが保持されることです。したがって、`up_down_votes_per_day`は常にコンパクトで最新の状態を保ちます。

行のマージは非同期で行われるため、ユーザーがクエリを実行する際に1日あたり複数の投票が存在する可能性があります。クエリ時に未処理の行が確実にマージされるようにするには、2つのオプションがあります：

- テーブル名に`FINAL`修飾子を使用する。上記のcountクエリではこれを使用しました。
- 最終テーブルで使用されている順序キー（すなわち`CreationDate`）で集計し、メトリクスを合計する。通常、この方法はより効率的で柔軟性があります（テーブルを他の用途にも使用できます）が、前者の方が一部のクエリではシンプルになります。以下に両方を示します：

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

これによりクエリが0.133秒から0.004秒に高速化され、25倍以上の改善を実現しました！

:::important 重要：`ORDER BY` = `GROUP BY`
`SummingMergeTree`または`AggregatingMergeTree`テーブルエンジンを使用する場合、マテリアライズドビューの変換における`GROUP BY`句で使用される列は、ターゲットテーブルの`ORDER BY`句で使用される列と一致させる必要があります。これらのエンジンは、バックグラウンドマージ操作中に同一の値を持つ行をマージする際に`ORDER BY`列に依存します。`GROUP BY`と`ORDER BY`の列が一致していないと、クエリパフォーマンスの低下、最適でないマージ、さらにはデータの不整合につながる可能性があります。
:::

### より複雑な例 {#a-more-complex-example}


上記の例では、1 日あたり 2 つの合計値を計算・維持するために Materialized Views を使用しています。合計値は、部分状態を維持するうえで最も単純な集計形式です。新しい値が到着したときに既存の値に単に加算すればよいからです。ただし、ClickHouse の Materialized Views はあらゆる集計タイプに利用できます。

次に、各日ごとに投稿の統計量を計算したいとします。`Score` の 99.9 パーセンタイルと `CommentCount` の平均です。これを計算するためのクエリは次のようになります。

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

10行を取得しました。経過時間: 0.113秒。処理済み: 5982万行、777.65 MB (5億2848万行/秒、6.87 GB/秒)
ピークメモリ使用量: 658.84 MiB。
```

以前と同様に、`posts` テーブルに新しい投稿が挿入されるたびに上記のクエリを実行するマテリアライズドビューを作成できます。

例として、また S3 から投稿データを読み込むことを避けるために、`posts` と同じスキーマを持つ複製テーブル `posts_null` を作成します。ただし、このテーブル自体には一切データを保存せず、行が挿入される際にマテリアライズドビューからのみ参照されます。データの保存を防ぐには、[`Null` テーブルエンジンタイプ](/engines/table-engines/special/null) を使用できます。

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Null テーブルエンジンは強力な最適化機構であり、`/dev/null` のようなものだと考えることができます。`posts_null` テーブルが挿入時に行を受け取ると、マテリアライズドビューはサマリ統計を計算して保存しますが、それ自体は単なるトリガーにすぎません。一方で、生データは保存されません。今回のケースではおそらく元の投稿も保存しておきたいところですが、このアプローチを使えば、生データの保存コストをかけずに集約を計算できます。

したがって、マテリアライズドビューは次のようになります。

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

集約関数の末尾にサフィックスとして `State` を付与している点に注目してください。これにより、最終結果ではなく、その関数の集約状態が返されます。ここには、この部分的な状態を他の状態とマージできるようにする追加情報が含まれます。たとえば平均値の場合、カラムの件数と合計が含まれます。

> 正しい結果を計算するには、部分集約状態が必要です。たとえば平均値を計算する際に、単に各部分範囲の平均値同士の平均を取っても正しい結果にはなりません。

次に、このビュー `post_stats_per_day` 用の、これらの部分集約状態を保存する対象テーブルを作成します。


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

以前は `SummingMergeTree` でカウントを保存するだけなら十分でしたが、他の関数のためには、より高度なエンジン型である [`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree) が必要です。
集約状態を保存することを ClickHouse に認識させるために、`Score_quantiles` と `AvgCommentCount` を型 `AggregateFunction` として定義し、部分状態を生成する元の関数と、その元となる列の型を指定します。`SummingMergeTree` と同様に、同じ `ORDER BY` キー値を持つ行はマージされます（上記の例では `Day`）。

マテリアライズドビューを介して `post_stats_per_day` を埋めるには、`posts` から `posts_null` にすべての行をそのまま挿入すればかまいません:

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> 本番環境では、通常マテリアライズドビューを `posts` テーブルにアタッチします。ここでは、ヌルテーブルを示すために `posts_null` を使用しています。

最終的なクエリでは、（カラムに部分集約状態が保存されているため）関数には `Merge` というサフィックスを付けて使用する必要があります。

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

上記では主に、マテリアライズドビューを使用してデータの部分集計を段階的に更新し、計算をクエリ時から挿入時に移行することに焦点を当てました。この一般的なユースケース以外にも、マテリアライズドビューには多数の用途があります。

### フィルタリングと変換 {#filtering-and-transformation}

状況によっては、挿入時に行と列のサブセットのみを挿入したい場合があります。この場合、`posts_null` テーブルが挿入を受け取り、`SELECT` クエリで行をフィルタリングしてから `posts` テーブルに挿入することができます。例えば、`posts` テーブルの `Tags` 列を変換したいとします。この列にはパイプ区切りのタグ名リストが含まれています。これを配列に変換することで、個々のタグ値による集計が容易になります。

> この変換は `INSERT INTO SELECT` の実行時に行うこともできます。マテリアライズドビューを使用すると、このロジックを ClickHouse の DDL にカプセル化し、`INSERT` をシンプルに保ちながら、すべての新しい行に変換を適用できます。

この変換のためのマテリアライズドビューは以下の通りです：

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```

### ルックアップテーブル {#lookup-table}

ClickHouse のソートキーを選択する際には、アクセスパターンを考慮する必要があります。フィルタや集計句で頻繁に使用される列を使用すべきです。しかし、単一の列セットではカバーできないより多様なアクセスパターンを持つシナリオでは、これが制約となる場合があります。例えば、以下の `comments` テーブルを考えてみましょう：

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

ここでのソートキーは、`PostId` でフィルタリングするクエリに対してテーブルを最適化します。

特定の `UserId` でフィルタリングし、その平均 `Score` を計算したいとします：

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

高速ではありますが（ClickHouse にとってはデータが小さい）、処理された行数（9038万行）から、これがフルテーブルスキャンを必要とすることがわかります。より大きなデータセットの場合、マテリアライズドビューを使用して、フィルタリング列 `UserId` に対するソートキー値 `PostId` をルックアップできます。これらの値を使用して、効率的なルックアップを実行できます。

この例では、マテリアライズドビューは非常にシンプルで、挿入時に `comments` から `PostId` と `UserId` のみを選択します。これらの結果は、`UserId` でソートされた `comments_posts_users` テーブルに送信されます。以下では `Comments` テーブルの Null バージョンを作成し、これを使用してビューと `comments_posts_users` テーブルにデータを投入します：

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

このビューをサブクエリで使用して、先ほどのクエリを高速化できます：

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

```


1 行がセットに含まれます。経過時間: 0.012 秒。88.61 千行、771.37 KB を処理しました (7.09 百万行/秒、61.73 MB/秒)。

```

### マテリアライズドビューのチェーン/カスケード {#chaining}

マテリアライズドビューはチェーン(カスケード)させることができ、複雑なワークフローを構築できます。
詳細については、ガイド["Cascading materialized views"](https://clickhouse.com/docs/guides/developer/cascading-materialized-views)を参照してください。
```


## マテリアライズドビューとJOIN {#materialized-views-and-joins}

:::note リフレッシュ可能なマテリアライズドビュー
以下はインクリメンタルマテリアライズドビューにのみ適用されます。リフレッシュ可能なマテリアライズドビューは、完全なターゲットデータセットに対して定期的にクエリを実行し、JOINを完全にサポートします。結果の鮮度の低下が許容できる場合は、複雑なJOINにこれらの使用を検討してください。
:::

ClickHouseのインクリメンタルマテリアライズドビューは`JOIN`操作を完全にサポートしますが、1つの重要な制約があります：**マテリアライズドビューはソーステーブル(クエリ内の最も左側のテーブル)への挿入時にのみトリガーされます。** JOINの右側のテーブルは、データが変更されても更新をトリガーしません。この動作は、挿入時にデータが集約または変換される**インクリメンタル**マテリアライズドビューを構築する際に特に重要です。

インクリメンタルマテリアライズドビューが`JOIN`を使用して定義されている場合、`SELECT`クエリ内の最も左側のテーブルがソースとして機能します。このテーブルに新しい行が挿入されると、ClickHouseはマテリアライズドビュークエリを新しく挿入された行_のみ_で実行します。JOINの右側のテーブルはこの実行中に完全に読み取られますが、それらへの変更だけではビューをトリガーしません。

この動作により、マテリアライズドビュー内のJOINは静的なディメンションデータに対するスナップショット結合に似たものになります。

これは参照テーブルやディメンションテーブルでデータをエンリッチする場合にうまく機能します。ただし、右側のテーブル(例:ユーザーメタデータ)への更新は、マテリアライズドビューを遡及的に更新しません。更新されたデータを確認するには、ソーステーブルに新しい挿入が到着する必要があります。

### 例 {#materialized-views-and-joins-example}

[Stack Overflowデータセット](/data-modeling/schema-design)を使用した具体的な例を見ていきましょう。マテリアライズドビューを使用して、`users`テーブルからのユーザーの表示名を含む**ユーザーごとの日次バッジ数**を計算します。

念のため、テーブルスキーマは次のとおりです:

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

`users`テーブルは事前に入力されていると仮定します:

```sql
INSERT INTO users
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet');
```

マテリアライズドビューとそれに関連するターゲットテーブルは次のように定義されます:

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

:::note グループ化と順序の整合性
マテリアライズドビューの`GROUP BY`句には、`SummingMergeTree`ターゲットテーブルの`ORDER BY`と一致するように`DisplayName`、`UserId`、`Day`を含める必要があります。これにより、行が正しく集約およびマージされることが保証されます。これらのいずれかを省略すると、不正確な結果や非効率的なマージにつながる可能性があります。
:::

ここでバッジを入力すると、ビューがトリガーされ、`daily_badges_by_user`テーブルが入力されます。

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

特定のユーザーが獲得したバッジを表示したい場合、次のクエリを記述できます:


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

8行を取得しました。経過時間: 0.018秒。処理済み: 32.77千行、642.14 KB (1.86百万行/秒、36.44 MB/秒)
```

ここで、このユーザーが新しいバッジを獲得して行が挿入されると、ビューが更新されます。

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 件の結果。経過時間: 7.517 sec.

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

9 件の結果。経過時間: 0.017 秒。処理: 32.77 千行、 642.27 KB (1.96 百万行/秒、 38.50 MB/s.)
```

:::warning
ここでの挿入のレイテンシーに注意してください。挿入されたユーザー行は `users` テーブル全体と結合されるため、挿入性能に大きな影響を与えます。これに対処する方法については、後述の [&quot;マテリアライズドビューでフィルタや JOIN にソーステーブルを使用する&quot;](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views) で説明します。
:::

逆に、新しいユーザーに対するバッジを先に挿入し、その後にユーザーの行を挿入した場合、マテリアライズドビューはそのユーザーのメトリクスを取り込めません。

```sql
INSERT INTO badges VALUES (53505059, 23923286, 'Good Answer', now(), 'Bronze', 0);
INSERT INTO users VALUES (23923286, 1, now(),  'brand_new_user', now(), 'UK', 1, 1, 0);
```


```sql
SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'brand_new_user';

0 rows in set. Elapsed: 0.017 sec. Processed 32.77 thousand rows, 644.32 KB (1.98 million rows/s., 38.94 MB/s.)
```

この場合、ビューはユーザー行が存在する前のバッジ挿入に対してのみ実行されます。ユーザーに別のバッジを挿入すると、期待通りに行が挿入されます:

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

ただし、この結果は正しくないことに注意してください。

### マテリアライズドビューにおけるJOINのベストプラクティス {#join-best-practices}

- **最も左側のテーブルをトリガーとして使用する。** `SELECT`文の左側にあるテーブルのみがマテリアライズドビューをトリガーします。右側のテーブルへの変更は更新をトリガーしません。

- **結合データを事前に挿入する。** ソーステーブルに行を挿入する前に、結合テーブル内のデータが存在することを確認してください。JOINは挿入時に評価されるため、データが欠落していると、一致しない行やnull値が生じます。

- **結合から取得する列を制限する。** メモリ使用量を最小限に抑え、挿入時のレイテンシを削減するために、結合テーブルから必要な列のみを選択してください(以下を参照)。

- **挿入時のパフォーマンスを評価する。** JOINは挿入のコストを増加させます。特に右側のテーブルが大きい場合に顕著です。本番環境を代表するデータを使用して挿入レートをベンチマークしてください。

- **単純なルックアップにはディクショナリを優先する。** コストの高いJOIN操作を避けるために、キーバリューのルックアップ(例: ユーザーIDから名前)には[ディクショナリ](/dictionary)を使用してください。

- **マージ効率のために`GROUP BY`と`ORDER BY`を一致させる。** `SummingMergeTree`または`AggregatingMergeTree`を使用する場合、効率的な行のマージを可能にするために、`GROUP BY`がターゲットテーブルの`ORDER BY`句と一致することを確認してください。

- **明示的な列エイリアスを使用する。** テーブルに重複する列名がある場合、曖昧さを防ぎ、ターゲットテーブルで正しい結果を保証するためにエイリアスを使用してください。

- **挿入量と頻度を考慮する。** JOINは中程度の挿入ワークロードで適切に機能します。高スループットの取り込みの場合は、ステージングテーブル、事前結合、またはディクショナリや[リフレッシュ可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view)などの他のアプローチの使用を検討してください。

### フィルタと結合におけるソーステーブルの使用 {#using-source-table-in-filters-and-joins-in-materialized-views}

ClickHouseでマテリアライズドビューを使用する際には、マテリアライズドビューのクエリ実行中にソーステーブルがどのように扱われるかを理解することが重要です。具体的には、マテリアライズドビューのクエリ内のソーステーブルは、挿入されたデータブロックに置き換えられます。この動作を適切に理解していないと、予期しない結果につながる可能性があります。

#### シナリオ例 {#example-scenario}

次のセットアップを考えてみましょう:

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


#### 説明 {#explanation}

上記の例では、2つのマテリアライズドビュー `mvw1` と `mvw2` があり、類似した操作を実行しますが、ソーステーブル `t0` の参照方法にわずかな違いがあります。

`mvw1` では、テーブル `t0` がJOINの右側の `(SELECT * FROM t0)` サブクエリ内で直接参照されています。`t0` にデータが挿入されると、マテリアライズドビューのクエリは挿入されたデータブロックで `t0` を置き換えて実行されます。つまり、JOIN操作はテーブル全体ではなく、新しく挿入された行に対してのみ実行されます。

`vt0` を結合する2番目のケースでは、ビューは `t0` からすべてのデータを読み取ります。これにより、JOIN操作は新しく挿入されたブロックだけでなく、`t0` のすべての行を考慮します。

主な違いは、ClickHouseがマテリアライズドビューのクエリ内でソーステーブルをどのように処理するかにあります。マテリアライズドビューが挿入によってトリガーされると、ソーステーブル（この場合は `t0`）は挿入されたデータブロックに置き換えられます。この動作はクエリの最適化に活用できますが、予期しない結果を避けるために慎重な検討が必要です。

### ユースケースと注意点 {#use-cases-and-caveats}

実際には、この動作を利用して、ソーステーブルのデータのサブセットのみを処理する必要があるマテリアライズドビューを最適化できます。たとえば、サブクエリを使用してソーステーブルをフィルタリングしてから他のテーブルと結合することができます。これにより、マテリアライズドビューが処理するデータ量を削減し、パフォーマンスを向上させることができます。

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

この例では、`IN (SELECT id FROM t0)` サブクエリから構築されるセットには新しく挿入された行のみが含まれるため、これを使用して `t1` をフィルタリングできます。

#### Stack Overflowの例 {#example-with-stack-overflow}

`users` テーブルからユーザーの表示名を含む**ユーザーごとの日次バッジ数**を計算する[以前のマテリアライズドビューの例](/materialized-view/incremental-materialized-view#example)を考えてみましょう。

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

このビューは `badges` テーブルの挿入レイテンシに大きな影響を与えました。例えば：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

上記のアプローチを使用して、このビューを最適化できます。挿入されたバッジ行のユーザーIDを使用して、`users` テーブルにフィルタを追加します：

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

これにより、最初のバッジ挿入が高速化されるだけでなく：

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

```


セット内の行数: 0。経過時間: 132.118 秒。処理行数: 3.2343 億行、4.69 GB (2.45 百万行/秒、35.49 MB/秒)。
ピークメモリ使用量: 1.99 GiB。

````

また、今後のバッジ挿入も効率的に行えることを意味します：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
````

上記の操作では、ユーザー ID `2936484` に対して `users` テーブルから 1 行だけが取得されます。この検索も、`Id` をテーブルの並び替えキーとして使用することで最適化されています。


## マテリアライズドビューとユニオン {#materialized-views-and-unions}

`UNION ALL`クエリは、複数のソーステーブルのデータを単一の結果セットに結合する際によく使用されます。

インクリメンタルマテリアライズドビューでは`UNION ALL`を直接サポートしていませんが、各`SELECT`ブランチごとに個別のマテリアライズドビューを作成し、それらの結果を共通のターゲットテーブルに書き込むことで、同じ結果を実現できます。

この例では、Stack Overflowデータセットを使用します。以下の`badges`テーブルと`comments`テーブルは、それぞれユーザーが獲得したバッジと投稿に対するコメントを表しています:

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
```

これらのテーブルには、以下の`INSERT INTO`コマンドでデータを投入できます:

```sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')
```

これら2つのテーブルを結合して、各ユーザーの最新のアクティビティを表示する統合ビューを作成したいとします:

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
```

このクエリの結果を受け取るターゲットテーブルがあると仮定します。結果が正しくマージされるように、[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)テーブルエンジンと[AggregateFunction](/sql-reference/data-types/aggregatefunction)を使用している点に注意してください:

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
```

`badges`または`comments`のいずれかに新しい行が挿入されたときにこのテーブルを更新したい場合、単純なアプローチとして、前述のユニオンクエリを使用してマテリアライズドビューを作成することが考えられます:

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
```

これは構文的には有効ですが、意図しない結果を生成します。このビューは`comments`テーブルへの挿入のみをトリガーします。例えば:

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

```


┌─UserId──┬─description──────┬─activity&#95;type─┬───────────last&#95;activity─┐
│ 2936484 │ 答えは 42 です │ comment       │ 2025-04-15 09:56:19.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 行が結果セットに含まれています。 経過時間: 0.005 秒。

````

`badges`テーブルへの挿入はビューをトリガーしないため、`user_activity`は更新されません:

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

1行のセット。経過時間: 0.005秒
````

この問題を解決するには、各 `SELECT` 文に対応する `materialized view` を作成します。

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
```

どちらのテーブルに挿入しても、正しい結果が得られるようになりました。例えば、`comments` テーブルに挿入する場合は次のとおりです。

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

1行のセット。経過時間: 0.006秒
```

同様に、`badges` テーブルへのデータ挿入は `user_activity` テーブルにも反映されます。

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

1行のセット。経過時間: 0.006秒
```


## 並列処理と逐次処理 {#materialized-views-parallel-vs-sequential}

前の例で示したように、1つのテーブルは複数のマテリアライズドビューのソースとして機能できます。これらが実行される順序は、設定 [`parallel_view_processing`](/operations/settings/settings#parallel_view_processing) に依存します。

デフォルトでは、この設定は `0` (`false`) であり、マテリアライズドビューは `uuid` の順序で逐次実行されます。

例えば、以下の `source` テーブルと3つのマテリアライズドビューを考えてみましょう。それぞれが `target` テーブルに行を送信します:

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

各ビューは `target` テーブルに行を挿入する前に1秒間停止し、同時にビュー名と挿入時刻も含めていることに注意してください。

テーブル `source` に行を挿入すると約3秒かかり、各ビューは逐次実行されます:

```sql
INSERT INTO source VALUES ('test')

1 row in set. Elapsed: 3.786 sec.
```

`SELECT` を使用して各ビューからの行の到着を確認できます:

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

これはビューの `uuid` と一致しています:

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

逆に、`parallel_view_processing=1` を有効にして行を挿入した場合に何が起こるか考えてみましょう。これを有効にすると、ビューは並列に実行され、ターゲットテーブルに行が到着する順序は保証されません:

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


各ビューから到着する行の順序は同じですが、これは保証されません。各行の挿入時刻が類似していることからもわかります。また、挿入パフォーマンスが向上している点にも注目してください。

### 並列処理を使用するタイミング {#materialized-views-when-to-use-parallel}

上記のように、`parallel_view_processing=1`を有効にすると、特に単一のテーブルに複数のマテリアライズドビューがアタッチされている場合、挿入スループットを大幅に向上させることができます。ただし、トレードオフを理解することが重要です:

- **挿入負荷の増加**: すべてのマテリアライズドビューが同時に実行されるため、CPUとメモリの使用量が増加します。各ビューが重い計算やJOINを実行する場合、システムに過負荷がかかる可能性があります。
- **厳密な実行順序の必要性**: ビューの実行順序が重要となる稀なワークフロー(例:連鎖的な依存関係)では、並列実行により状態の不整合や競合状態が発生する可能性があります。これを回避する設計は可能ですが、そのような設定は脆弱であり、将来のバージョンで動作しなくなる可能性があります。

:::note 歴史的なデフォルトと安定性
逐次実行は、エラー処理の複雑さもあり、長い間デフォルトでした。歴史的に、1つのマテリアライズドビューでの失敗が他のビューの実行を妨げる可能性がありました。新しいバージョンでは、ブロックごとに失敗を分離することでこれを改善していますが、逐次実行は依然としてより明確な失敗セマンティクスを提供します。
:::

一般的に、以下の場合に`parallel_view_processing=1`を有効にします:

- 複数の独立したマテリアライズドビューがある場合
- 挿入パフォーマンスを最大化することを目指している場合
- 同時ビュー実行を処理するシステムの容量を把握している場合

以下の場合は無効のままにします:

- マテリアライズドビューが相互に依存関係を持つ場合
- 予測可能で順序付けられた実行が必要な場合
- 挿入動作のデバッグや監査を行っており、決定論的な再現が必要な場合


## マテリアライズドビューと共通テーブル式（CTE） {#materialized-views-common-table-expressions-ctes}

**非再帰的な**共通テーブル式（CTE）はマテリアライズドビューでサポートされています。

:::note 共通テーブル式はマテリアライズ化**されません**
ClickHouseはCTEをマテリアライズ化しません。代わりに、CTE定義を直接クエリに置換するため、CTEが複数回使用される場合、同じ式が複数回評価される可能性があります。
:::

各投稿タイプの日次アクティビティを計算する以下の例を考えてみましょう。

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

ここではCTEは厳密には不要ですが、例示の目的として、ビューは期待通りに動作します：

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
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

10 rows in set. Elapsed: 0.013 sec. Processed 11.45 thousand rows, 663.87 KB (866.53 thousand rows/s., 50.26 MB/s.)
Peak memory usage: 989.53 KiB.
```

ClickHouseでは、CTEはインライン化されます。つまり、最適化時にクエリに実質的にコピー＆ペーストされ、マテリアライズ化**されません**。これは次のことを意味します：

- CTEがソーステーブル（マテリアライズドビューがアタッチされているテーブル）とは異なるテーブルを参照し、`JOIN`または`IN`句で使用される場合、トリガーではなくサブクエリまたは結合のように動作します。
- マテリアライズドビューは依然としてメインソーステーブルへの挿入時にのみトリガーされますが、CTEは挿入のたびに再実行されるため、特に参照されるテーブルが大きい場合、不要なオーバーヘッドが発生する可能性があります。

例えば、


```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

この場合、`users` の CTE は `posts` への挿入ごとに再評価され、マテリアライズドビューは新しいユーザーが挿入されたときには更新されず、`posts` が挿入されたときにのみ更新されます。

一般的には、マテリアライズドビューが紐付いているソーステーブル自体に対して動作するロジックに CTE を使用するか、参照しているテーブルが小さく、パフォーマンスのボトルネックになりにくいことを確認してください。あるいは、[マテリアライズドビューでの JOIN と同様の最適化](/materialized-view/incremental-materialized-view#join-best-practices)を検討してください。
