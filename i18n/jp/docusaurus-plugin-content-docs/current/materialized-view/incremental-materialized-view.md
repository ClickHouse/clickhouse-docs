---
'slug': '/materialized-view/incremental-materialized-view'
'title': 'インクリメンタル マテリアライズド ビュー'
'description': 'インクリメンタル マテリアライズド ビューを使用してクエリを高速化する方法'
'keywords':
- 'incremental materialized views'
- 'speed up queries'
- 'query optimization'
'score': 10000
'doc_type': 'guide'
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import Image from '@theme/IdealImage';

## 背景 {#background}

インクリメンタルマテリアライズドビュー（Materialized Views）は、ユーザーがクエリ時の計算コストを挿入時にシフトさせることを可能にし、その結果、`SELECT` クエリが高速化されます。

Postgresのようなトランザクショナルデータベースとは異なり、ClickHouseのマテリアライズドビューは、データがテーブルに挿入される際にデータブロックに対してクエリを実行するトリガーに過ぎません。このクエリの結果は、2番目の「ターゲット」テーブルに挿入されます。さらに多くの行が挿入されると、結果は再度ターゲットテーブルに送信され、中間結果が更新およびマージされます。このマージ結果は、元のデータ全体に対してクエリを実行した結果に相当します。

マテリアライズドビューの主な目的是、ターゲットテーブルに挿入される結果が行に対する集計、フィルタリング、または変換の結果を表すことです。これらの結果は、元のデータの小さい表現（集計の場合は部分的なスケッチ）であることが多いです。これにより、ターゲットテーブルからの結果を読み取るためのクエリが単純になり、元のデータに対して同じ計算を行うよりもクエリ時間が短縮され、計算（およびクエリのレイテンシ）がクエリ時から挿入時に移行されます。

ClickHouseのマテリアライズドビューは、基盤となるテーブルにデータが流入する際にリアルタイムで更新され、継続的に更新されるインデックスのように機能します。これは、他のデータベースとは対照的で、他のデータベースではマテリアライズドビューは通常、再読み込みが必要な静的スナップショットです（ClickHouseの [Refreshable Materialized Views](/sql-reference/statements/create/view#refreshable-materialized-view) に似ています）。

<Image img={materializedViewDiagram} size="md" alt="Materialized view diagram"/>

## 例 {#example}

例の目的で、["スキーマ設計"](/data-modeling/schema-design) に記載のStack Overflowデータセットを使用します。

特定の投稿に対する毎日のアップボートおよびダウンボートの数を取得したいとしましょう。

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

これは、[`toStartOfDay`](/sql-reference/functions/date-time-functions#toStartOfDay) 関数のおかげで、ClickHouseではかなりシンプルなクエリです：

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

このクエリは、ClickHouseのおかげで既に高速ですが、さらに改善できますか？

マテリアライズドビューを使用して挿入時にこれを計算したい場合、結果を受け取るためのテーブルが必要です。このテーブルは、1日につき1行のみを保持する必要があります。既存の日に対して更新が受信された場合、他のカラムは既存の日の行にマージされるべきです。この増分状態のマージを実行するためには、他のカラムに対して部分的な状態を保存する必要があります。

これには、ClickHouseの特別なエンジンタイプが必要です：[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。これにより、同じ順序キーを持つすべての行が、数値列の合計値を含む1行に置き換えられます。以下のテーブルは、同じ日付の行をマージし、数値列を合計します：

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

マテリアライズドビューを示すために、投票テーブルが空でデータを受け取っていないと仮定します。マテリアライズドビューは、`votes` に挿入されたデータに対して上記の `SELECT` を実行し、結果を `up_down_votes_per_day` に送信します：

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

ここでの `TO` 句は重要で、結果が送られる場所、つまり `up_down_votes_per_day` を示しています。

以前の挿入から投票テーブルを再補充できます：

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

完了後、`up_down_votes_per_day` のサイズを確認できます - 1日あたり1行があるはずです：

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

私たちは、ここで238百万（`votes`）から5000に行数を効果的に削減しました。重要なのは、もし新しい投票が `votes` テーブルに挿入されると、新しい値がそれぞれの投票日に対して `up_down_votes_per_day` に送信され、それらはバックグラウンドで非同期に自動的にマージされ、1日につき1行のみを保持します。したがって、`up_down_votes_per_day` は常に小さく、最新の状態に保たれます。

行のマージは非同期であるため、ユーザーがクエリを実行したときに、1日あたり複数の投票が存在する可能性があります。クエリ時に未処理の行をマージするために、2つのオプションがあります：

- テーブル名に `FINAL` 修飾子を使用します。これは上記のカウントクエリで行いました。
- 最終テーブルで使用する順序キー、すなわち `CreationDate` で集計し、メトリクスを合計します。通常、これはより効率的で柔軟です（他の目的でもテーブルを使用できるため）が、一部のクエリにとっては前者が簡単かもしれません。以下に両方を示します：

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

これにより、クエリが0.133秒から0.004秒に高速化されました - 25倍以上の改善です！

:::important 重要： `ORDER BY` = `GROUP BY`
ほとんどのケースにおいて、マテリアライズドビュー変換の `GROUP BY` 句で使用されるカラムは、`SummingMergeTree` または `AggregatingMergeTree` テーブルエンジンを使用する場合のターゲットテーブルの `ORDER BY` 句で使用されるカラムと一致している必要があります。これらのエンジンは、バックグラウンドのマージ操作中に同じ値を持つ行をマージするために `ORDER BY` カラムに依存しています。 `GROUP BY` と `ORDER BY` カラムの不整合は、非効率なクエリパフォーマンス、最適でないマージ、またはデータの不整合を引き起こす可能性があります。
:::

### より複雑な例 {#a-more-complex-example}

上記の例では、マテリアライズドビューを使用して日に対して2つの合計を計算し維持しています。合計は、部分的な状態を維持する最も単純な集計の形式を示します - 新しい値が到着したときに単に既存の値に加算すればよいのです。しかし、ClickHouseのマテリアライズドビューは、あらゆる集計タイプに使用できます。

例えば、各日の投稿に対するいくつかの統計を計算したいとします： `Score` の99.9パーセンタイルおよび `CommentCount` の平均です。この計算のためのクエリは次のようになります：

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

前と同様に、新しいポストが `posts` テーブルに挿入される際に上記のクエリを実行するマテリアライズドビューを作成できます。

例の目的で、S3から投稿データをロードしないために、`posts` と同じスキーマを持つ重複テーブル `posts_null` を作成します。ただし、このテーブルはデータを保存せず、行が挿入される際にマテリアライズドビューによって使用されるだけです。データの保存を防ぐために、[`Null` テーブルエンジンタイプ](/engines/table-engines/special/null)を使用できます。

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Nullテーブルエンジンは強力な最適化です - `/dev/null` のように考えてください。マテリアライズドビューは、`posts_null` テーブルが挿入時に行を受信する際にサマリ統計を計算し保存します - これはトリガーに過ぎません。ただし、生データは保存されません。私たちのケースでは、元の投稿を保存することを望むでしょうが、このアプローチは生データのストレージオーバーヘッドを回避しながら集計を計算するのに使用できます。

したがって、マテリアライズドビューは次のようになります：

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

集計関数の末尾に `State` サフィックスを付けることに注意してください。これにより、関数の集計状態が最終結果ではなく返されます。これには、他の状態とマージするためにこの部分状態を許可する追加情報が含まれます。例えば、平均の場合、これにはカウントとカラムの合計が含まれます。

> 部分的な集計状態は、正しい結果を計算するために必要です。たとえば、平均を計算するために、サブレンジの平均を単に平均化することは、不正確な結果をもたらします。

次に、このビューのターゲットテーブル `post_stats_per_day` を作成し、これらの部分的な集計状態を保存します：

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

以前は、`SummingMergeTree` がカウントを保存するのに十分でしたが、他の関数にはより高度なエンジンタイプが必要です：[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)です。
ClickHouseが集計状態が保存されることを認識できるように、`Score_quantiles` と `AvgCommentCount` を `AggregateFunction` 型として定義し、部分状態のソース関数とそのソースカラムの型を指定します。`SummingMergeTree` と同様に、同じ `ORDER BY` キー値を持つ行がマージされます（上記の例の `Day`）。

マテリアライズドビューを通じて `post_stats_per_day` を埋めるには、`posts` からすべての行を `posts_null` に挿入するだけです：

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> 本番環境では、マテリアライズドビューを `posts` テーブルに接続するのが一般的です。ここでは、Nullテーブルを使用してNullテーブルをデモンストレーションしました。

最終クエリは、関数に対して `Merge` サフィックスを利用する必要があります（カラムが部分的な集計状態を保存するため）：

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

ここでは、`FINAL`を使用する代わりに `GROUP BY` を使用しています。

## その他のアプリケーション {#other-applications}

上記は主に、データの部分集計を逐次更新するためにマテリアライズドビューを使用することに焦点を当てており、計算をクエリ時から挿入時に移行しています。この一般的なユースケースを超えて、マテリアライズドビューには他にも多くのアプリケーションがあります。

### フィルタリングと変換 {#filtering-and-transformation}

特定の状況では、挿入時に行とカラムのサブセットのみを挿入したい場合があります。この場合、`posts_null` テーブルは挿入を受け付け、`posts` テーブルに挿入する前に行をフィルタリングする `SELECT` クエリを持つことができます。例えば、`posts` テーブルの `Tags` カラムを変換したいと仮定します。これには、タグ名のパイプ区切りリストが含まれています。これらを配列に変換することで、個々のタグ値での集計がより簡単になります。

> この変換は、`INSERT INTO SELECT` を実行するときに行うことができます。マテリアライズドビューを使用することで、このロジックをClickHouse DDLにカプセル化し、挿入をシンプルに保ち、新しい行に変換を適用できます。

この変換のためのマテリアライズドビューは以下の通りです：

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```

### ルックアップテーブル {#lookup-table}

ユーザーは、ClickHouseの順序キーを選択する際にアクセスパターンを考慮すべきです。フィルタと集計句で頻繁に使用されるカラムを使用する必要があります。これは、ユーザーが幅広いアクセスパターンを持ち、単一のカラムセットにカプセル化できないシナリオでは制限要因となる可能性があります。例えば、以下の `comments` テーブルを考えます：

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

ここでの順序キーは、`PostId` でフィルタリングするクエリに最適化されています。

特定の `UserId` でフィルタリングし、その平均 `Score` を計算したいとしましょう：

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

これは高速ですが（ClickHouseのデータは小さいため）、処理された行数から完全なテーブルスキャンが必要なことを示しています - 9038万行。大規模なデータセットの場合、ルックアップテーブルの `UserId` 列フィルタに `PostId` の順序キー値を使用するためにマテリアライズドビューを利用することができます。これらの値は、効率的なルックアップを実行するために使用できます。

この例では、マテリアライズドビューは非常にシンプルで、挿入時に `comments` から `PostId` と `UserId` のみを選択します。これらの結果は、`UserId` で順序付けられたテーブル `comments_posts_users` に送信されます。以下に `Comments` テーブルのNullバージョンを作成し、これを使用してビューと `comments_posts_users` テーブルを埋めます：

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

このビューをサブクエリとして使って、以前のクエリを加速させることができます：

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

### チェイニング / カスケーディングマテリアライズドビュー {#chaining}

マテリアライズドビューはチェイニング（またはカスケーディング）が可能で、複雑なワークフローを確立することができます。
詳細については、ガイド["Cascading materialized views"](https://clickhouse.com/docs/guides/developer/cascading-materialized-views)を参照してください。

## マテリアライズドビューとJOIN {#materialized-views-and-joins}

:::note リフレッシュ可能なマテリアライズドビュー
以下はインクリメンタルマテリアライズドビューのみに適用されます。リフレッシュ可能なマテリアライズドビューは、ターゲットデータセット全体に対して定期的にクエリを実行し、JOINを完全にサポートします。結果の鮮度の低下が容認できる場合は、複雑なJOINに利用を検討してください。
:::

ClickHouseのインクリメンタルマテリアライズドビューは、`JOIN` 操作を完全にサポートしますが、重要な制約があります：**マテリアライズドビューは、ソーステーブル（クエリの最左テーブル）への挿入時のみトリガーされます。** JOINの右側のテーブルはデータが変更されても更新をトリガーしません。この挙動は、データが挿入時に集約または変換される場合の**インクリメンタル**マテリアライズドビューを構築する際に特に重要です。

インクリメンタルマテリアライズドビューが `JOIN` を使って定義されている場合、`SELECT` クエリの最左テーブルがソースとして機能します。このテーブルに新しい行が挿入されると、ClickHouseはその新しい行のみを持ってマテリアライズドビュークエリを実行します。JOINの右側のテーブルはこの実行中に完全に読み込まれますが、それらだけの変更はビューをトリガーしません。

この挙動は、マテリアライズドビューにおけるJOINを静的ディメンションデータに対するスナップショットJOINに似たものにします。

これは、参照またはディメンションテーブルでのデータの強化にはうまく機能します。ただし、右側のテーブルへの更新（例：ユーザーメタデータ）は、マテリアライズドビューを遡及的に更新しません。データが更新されるには、ソーステーブルに新しい挿入が必要です。

### 例 {#materialized-views-and-joins-example}

[Stack Overflowデータセット](/data-modeling/schema-design) を使用した具体的な例を見ていきましょう。**ユーザーごとの毎日のバッジ数**を計算するマテリアライズドビューを使用し、`users` テーブルからユーザーの表示名を含めます。

テーブルスキーマは次の通りです：

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

`users` テーブルには既にデータが入っていると仮定します：

```sql
INSERT INTO users
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet');
```

マテリアライズドビューとその関連するターゲットテーブルは次のように定義されています：

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

:::note グルーピングと順序の整合性
マテリアライズドビューの `GROUP BY` 句には、 `DisplayName`、 `UserId`、および `Day` を含めて、`SummingMergeTree` ターゲットテーブルの `ORDER BY` に一致させる必要があります。これにより、行が正しく集計およびマージされます。これらのいずれかを省略すると、不正確な結果や非効率なマージを引き起こす可能性があります。
:::

バッジをポピュレートすると、ビューがトリガーされ、`daily_badges_by_user` テーブルがポピュレートされます。

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

特定のユーザーが達成したバッジを表示したい場合、次のクエリを書くことができます：

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

このユーザーに新しいバッジが与えられ、行が挿入されると、ビューが更新されます：

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

:::warning
ここでの挿入のレイテンシに注意してください。挿入されたユーザー行が全 `users` テーブルに対してJOINされており、挿入パフォーマンスに大きな影響を与えています。以下の「フィルタとJOINでのソーステーブルの使用」のセクションで、この問題に対するアプローチを提案します。
:::

逆に、新しいユーザー用のバッジを挿入した後、そのユーザーの行が挿入されると、マテリアライズドビューはユーザーのメトリクスを取得しません。

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

この場合、ビューはバッジ挿入のためだけに実行され、ユーザー行が存在する前です。ユーザーのために別のバッジを挿入すると、行が挿入されますが、期待通りです：

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

ただし、この結果が不正確であることに注意してください。

### マテリアライズドビュー内のJOINのためのベストプラクティス {#join-best-practices}

- **最左のテーブルをトリガーとして使用します。** `SELECT` ステートメントの左側のテーブルのみがマテリアライズドビューをトリガーします。右側のテーブルの変更は更新をトリガーしません。

- **結合データを事前挿入します。** ソーステーブルに行を挿入する前に、結合されたテーブル内のデータが存在することを確認してください。JOINは挿入時に評価されるため、データが不足すると、行の一致が失敗したり、NULLが生成されたりします。

- **結合から取得するカラムを限定します。** 結合されたテーブルから必要なカラムだけを選択し、メモリ使用を最小限に抑え、挿入時のレイテンシを減少させます（以下参照）。

- **挿入時のパフォーマンスを評価します。** JOINは挿入のコストを増加させます、特に大規模な右側のテーブルとの場合。代表的な運用データを使用して挿入率をベンチマークします。

- **単純なルックアップには辞書を推奨します。** キー-値ルックアップ（例：ユーザーIDから名前）には、コストのかかるJOIN操作を避けるために [Dictionaries](/dictionary) を使用します。

- **マージ効率のために `GROUP BY` と `ORDER BY` を揃えます。** `SummingMergeTree` または `AggregatingMergeTree` を使用する際には、`GROUP BY` がターゲットテーブルの `ORDER BY` 句と一致するようにして、効率的な行のマージを可能にします。

- **明示的なカラムエイリアスを使用します。** テーブルに重複するカラム名がある場合、曖昧さを避け、ターゲットテーブルにおいて正確な結果を得るためにエイリアスを使用してください。

- **挿入ボリュームと頻度を考慮します。** JOINは中程度の挿入作業負荷でうまく機能します。大量のスループットの取り込みの場合は、ステージングテーブル、事前結合、または辞書や [Refreshable Materialized Views](/materialized-view/refreshable-materialized-view) などの他のアプローチを検討してください。

### フィルタとJOINでのソーステーブルの使用 {#using-source-table-in-filters-and-joins-in-materialized-views}

ClickHouseでマテリアライズドビューを使用する際には、マテリアライズドビューのクエリ実行中にソーステーブルがどのように扱われるかを理解することが重要です。具体的には、マテリアライズドビューのクエリ内のソーステーブルは、挿入されたデータブロックで置き換えられます。この挙動が適切に理解されていない場合、いくつかの予期しない結果を引き起こす可能性があります。

#### 例のシナリオ {#example-scenario}

次のセットアップを考えてみましょう：

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

上記の例では、`mvw1` と `mvw2` の2つのマテリアライズドビューが、ソーステーブル `t0` の参照の仕方にわずかな違いがあるが同様の操作を実行します。

`mvw1` では、テーブル `t0` がJOINの右側の `(SELECT * FROM t0)` サブクエリ内で直接参照されています。データが `t0` に挿入されると、マテリアライズドビューのクエリが挿入されたデータブロックを使用して実行されます。これは、JOIN操作が新しく挿入された行に対してのみ実行され、テーブル全体ではないことを意味します。

`vt0` にJOINする2番目のケースでは、ビューは `t0` からすべてのデータを読み込みます。これにより、JOIN操作が `t0` 中のすべての行を考慮することが保証されます。

ClickHouseがマテリアライズドビューのクエリ内でソーステーブルをどのように扱うかが、主要な違いです。マテリアライズドビューが挿入によってトリガーされた場合、ソーステーブル（この場合は `t0`）は挿入されたデータブロックで置き換えられます。この挙動は、クエリを最適化するために活用可能ですが、予期しない結果を避けるために慎重な考慮が必要です。

### ユースケースと注意点 {#use-cases-and-caveats}

実際には、この挙動を利用して、ソーステーブルのデータのサブセットのみを処理する必要があるマテリアライズドビューを最適化することができます。例えば、他のテーブルと結合する前にソーステーブルをフィルタリングするためにサブクエリを使用できます。これにより、マテリアライズドビューによって処理されるデータ量を減らし、パフォーマンスを向上させることができます。

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

この例では、サブクエリの `IN (SELECT id FROM t0)` から構築されたセットには新しく挿入された行のみが含まれ、これを `t1` に対してフィルタリングするのに役立ちます。

#### Stack Overflowを使用した例 {#example-with-stack-overflow}

以前のマテリアライズドビューの例を考えてみましょう - **ユーザーごとの毎日のバッジ数**を計算し、`users` テーブルからユーザーの表示名を含めます。

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

このビューは、`badges` テーブルの挿入レイテンシに大きな影響を与えました e.g.

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

上記のアプローチを使用して、このビューを最適化できます。挿入されたバッジの行のユーザーIDを使用して、`users` テーブルにフィルタを追加します：

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

これにより、初回のバッジ挿入が高速化されるだけでなく：

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 132.118 sec. Processed 323.43 million rows, 4.69 GB (2.45 million rows/s., 35.49 MB/s.)
Peak memory usage: 1.99 GiB.
```

今後のバッジ挿入も効率的になります：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
```

上述の操作では、ユーザーID `2936484` のためにユーザーテーブルから1行のみが取得されます。このルックアップは、`Id` のテーブル順序キーでも最適化されています。

## マテリアライズドビューとユニオン {#materialized-views-and-unions}

`UNION ALL` クエリは、複数のソーステーブルからデータを組み合わせて単一の結果セットを生成するのに一般的に使用されます。

`UNION ALL`はインクリメンタルマテリアライズドビューでは直接サポートされていないが、各 `SELECT` ブランチごとに別々のマテリアライズドビューを作成し、それらの結果を共有ターゲットテーブルに書き込むことで、同じ結果を達成できます。

例として、Stack Overflowデータセットを使用します。以下の `badges` および `comments` テーブルは、ユーザーが獲得したバッジと、投稿に対するコメントを示します：

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

これらは次の `INSERT INTO` コマンドでポピュレートできます：

```sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')
```

ユーザー活動の統一ビューを作成したいと仮定し、これら2つのテーブルを組み合わせて各ユーザーの最終活動を表示します：

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

このクエリの結果を受け取るためのターゲットテーブルを用意していると仮定しましょう。このクエリの実行時の結果が正しくマージされることを保証するために、[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) テーブルエンジンと [AggregateFunction](/sql-reference/data-types/aggregatefunction) を使用している点にご注意ください：

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

`badges` または `comments` に新しい行が挿入されると、このテーブルが更新されることを望みます。問題に対する単純なアプローチは、前のユニオンクエリを持つマテリアライズドビューを作成しようとすることです：

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

これは文法的には有効ですが、意図しない結果を生じます - ビューは `comments` テーブルの挿入のみをトリガーします。例えば：

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
```

`badges` テーブルへの挿入はビューをトリガーせず、`user_activity` は更新を受け取らないことになります：

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
```

これを解決するために、各SELECT文用にマテリアライズドビューを単純に作成します：

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

どちらのテーブルに挿入しても正しい結果が得られます。例えば、`comments` テーブルに挿入する場合：

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
```

同様に、`badges` テーブルへの挿入も `user_activity` テーブルに反映されます：

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

## 並行処理と逐次処理 {#materialized-views-parallel-vs-sequential}

前の例で示したように、テーブルは複数のマテリアライズドビューのソースとして機能することができます。これらが実行される順序は、設定 [`parallel_view_processing`](/operations/settings/settings#parallel_view_processing) に依存します。

デフォルトでは、この設定は `0` (`false`) に等しく、マテリアライズドビューは `uuid` の順序で逐次実行されます。

例えば、次の `source` テーブルと3つのマテリアライズドビューを考えてみましょう。それぞれが `target` テーブルに行を送信します：

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

これら各ビューは、`target` テーブルに行を挿入する前に1秒間停止し、それぞれの名前と挿入時刻を含めています。

`source` テーブルに行を挿入すると、約3秒かかり、各ビューが逐次的に実行されます：

```sql
INSERT INTO source VALUES ('test')

1 row in set. Elapsed: 3.786 sec.
```

各行の到着を `SELECT` で確認できます：

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

これは、ビューの `uuid` と一致しています：

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

逆に、`parallel_view_processing=1` を有効にした場合に挿入するとどうなるかを考えてみましょう。この設定を有効にすると、ビューは並行して実行され、ターゲットテーブルに行が到着する順序が保証されません：

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

各ビューからの行の到着の順序は同じですが、これは保証されているわけではありません - 各行の挿入時刻の類似性によって示されています。また、挿入パフォーマンスが向上することにも注意してください。

### 並行処理を使用するタイミング {#materialized-views-when-to-use-parallel}

`parallel_view_processing=1` を有効にすると、挿入のスループットが大幅に向上する可能性があります。特に、単一のテーブルに複数のマテリアライズドビューが接続されている場合です。ただし、トレードオフを理解することが重要です。

- **挿入プレスの増加**：すべてのマテリアライズドビューが同時に実行されるため、CPUとメモリの使用量が増加します。それぞれのビューが重い計算やJOINを実行する場合、システムが過負荷になる可能性があります。
- **厳密な実行順序の必要性**：稀なワークフローでは、ビューの実行順序が重要な場合があります（例：チェイング依存関係）。並行実行は、一貫性のない状態や競合条件をもたらす可能性があります。このような状況を設計回避することは可能ですが、そのようなセットアップは脆弱であり、将来のバージョンで壊れる可能性があります。

:::note 過去のデフォルトと安定性
逐次実行は長い間デフォルトであり、エラーハンドリングの複雑さが一因でした。歴史的に、1つのマテリアライズドビューでの失敗が他の実行を妨げる可能性がありました。新しいバージョンでは、ブロックごとの失敗を隔離することでこれが改善されていますが、逐次実行は依然として明確な失敗セマンティクスを提供します。
:::

一般的に、`parallel_view_processing=1` を有効にするのは以下の場合です：

- 複数の独立したマテリアライズドビューがある
- 挿入パフォーマンスの最大化を目指している
- 同時にビュー実行を処理するシステムの能力を把握している

無効にしておくべき場合は：

- マテリアライズドビューが互いに依存している
- 予測可能で順序を整えた実行が必要
- 挿入動作をデバッグまたは監査しており、決定論的なリプレイを望む

## マテリアライズドビューと共通テーブル式（CTE） {#materialized-views-common-table-expressions-ctes}

**非再帰的**共通テーブル式（CTE）はマテリアライズドビューでサポートされています。

:::note 共通テーブル式はマテリアライズされません
ClickHouseはCTEをマテリアライズせず、代わりにCTE定義をクエリに直接置き換えます。このため、同じ式が複数回評価されることがあります（CTEが複数回使用された場合）。
:::

次に、各投稿タイプの日次活動を計算する例を考えてみましょう。

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

ここで、CTEは厳密には必要ではありませんが、例のために、ビューは期待通りに動作します：

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

ClickHouseでは、CTEがインライン化され、最適化の段階でクエリにコピー＆ペーストされて**マテリアライズされません**。これは以下を意味します：

- CTEがソーステーブル（すなわち、マテリアライズドビューに接続されているもの）とは異なるテーブルを参照し、`JOIN`または`IN`句で使用されると、それはサブクエリまたはJOINのように機能し、トリガーになりません。
- マテリアライズドビューは依然としてメインのソーステーブルへの挿入時にのみトリガーされますが、CTEは各挿入時に再実行されるため、特に参照されるテーブルが大きい場合には不要なオーバーヘッドを引き起こす可能性があります。

例えば、

```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

この場合、ユーザーのCTEは、投稿への各挿入時に再評価され、マテリアライズドビューは新しいユーザーが挿入されたときに更新されず、投稿が挿入されたときにのみ更新されます。

一般的に、CTEはマテリアライズドビューに接続されている同じソーステーブルで動作するロジックに使用するか、参照されるテーブルが小さいことを確認してパフォーマンスボトルネックを引き起こさないようにします。あるいは、[JOINのマテリアライズドビューとの同様の最適化を検討してください](/materialized-view/incremental-materialized-view#join-best-practices)。
