---
slug: /materialized-view/incremental-materialized-view
title: 'インクリメンタル マテリアライズドビュー'
description: 'インクリメンタル マテリアライズドビューを使用してクエリを高速化する方法'
keywords: ['インクリメンタル マテリアライズドビュー', 'クエリを高速化', 'クエリ最適化']
score: 10000
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import Image from '@theme/IdealImage';

## 背景 {#background}

インクリメンタル マテリアライズドビュー（Materialized Views）は、ユーザーがクエリ時間から挿入時間に計算コストを移行することを可能にし、結果として `SELECT` クエリを高速化します。

Postgres のようなトランザクショナルデータベースとは異なり、ClickHouseのマテリアライズドビューは、データがテーブルに挿入される際にデータブロックの上でクエリを実行するトリガーに過ぎません。このクエリの結果は、2番目の「ターゲット」テーブルに挿入されます。さらに行が挿入されると、結果は再びターゲットテーブルに送られ、中間結果が更新されマージされます。このマージされた結果は、元のデータ全体に対してクエリを実行した場合と同等です。

マテリアライズドビューの主な動機は、ターゲットテーブルに挿入される結果が、行に対する集約、フィルタリング、または変換の結果を表すことです。これらの結果は、元のデータのサイズが小さい（集約の場合は部分的なスケッチ）ことが多いです。これにより、ターゲットテーブルから結果を読み取るためのクエリが単純化され、同じ計算が元のデータに対して実行された場合よりもクエリ時間が速くなります。計算が挿入時間にシフトされることで、クエリレイテンシが短縮されます。

ClickHouseのマテリアライズドビューは、基盤となるテーブルにデータが流れ込む際にリアルタイムで更新され、継続的に更新されるインデックスのように機能します。これは、マテリアライズドビューが一般に静的なクエリのスナップショットであり、リフレッシュする必要がある他のデータベースとは対照的です（ClickHouseの [リフレッシャブル マテリアライズドビュー](/sql-reference/statements/create/view#refreshable-materialized-view) に類似しています）。

<Image img={materializedViewDiagram} size="md" alt="マテリアライズドビューの図"/>
## 例 {#example}

例の目的のために、["スキーマ設計"](/data-modeling/schema-design) に文書化された Stack Overflow データセットを使用します。

投稿の日ごとのアップボートおよびダウンボートの数を取得すると仮定します。

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

これは、[`toStartOfDay`](/sql-reference/functions/date-time-functions#tostartofday) 関数のおかげで、ClickHouseにおいてはかなりシンプルなクエリです：

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

このクエリはすでにClickHouseのおかげで速いですが、さらに良くすることはできますか？

インサート時にマテリアライズドビューを使用してこれを計算したい場合、結果を受け取るためのテーブルが必要です。このテーブルは日ごとに1行だけ保持する必要があります。既存の日に対する更新が受信された場合、他のカラムは既存の日の行にマージされるべきです。このインクリメンタルな状態のマージを行うには、他のカラム用の部分的な状態を保持する必要があります。

これには、ClickHouseで特別なエンジンタイプが必要です：[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。これは、同じ順序キーを持つすべての行を、数値カラムの合計値を持つ1行に置き換えます。次のテーブルは、同じ日付を持つ行をマージし、数値カラムを合計します：

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

マテリアライズドビューを示すために、投票テーブルが空でありデータを受け取っていないと仮定します。マテリアライズドビューは、挿入された `votes` データに対して上記の `SELECT` を実行し、結果を `up_down_votes_per_day` に送信します：

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

ここで、`TO` 句は重要であり、結果が送信される場所を示しています、つまり `up_down_votes_per_day`です。

以前のインサートから投票テーブルを再補充できます：

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

完了したら、`up_down_votes_per_day` のサイズを確認できます - 日ごとに1行があるはずです：

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

ここで行数を238百万行（`votes`で）から5000行に効果的に減らしました。しかし重要なのは、もし新しい投票が `votes` テーブルに挿入されると、それに応じた日の `up_down_votes_per_day` に新しい値が送信され、バックグラウンドで非同期に自動的にマージされることです - 日ごとに1行だけ保持します。したがって、`up_down_votes_per_day` は常に少量かつ最新の状態に保たれます。

行のマージが非同期であるため、ユーザーがクエリを実行する際に、日ごとに1つ以上の投票が存在する可能性があります。未処理の行がクエリ時にマージされることを確実にするために、2つのオプションがあります：

- テーブル名に `FINAL` 修飾子を使用します。これは、上記のカウントクエリで行いました。
- 最終テーブルで使用される順序キー（すなわち `CreationDate`）で集約し、メトリックを合計します。通常、これはより効率的で柔軟です（テーブルは他の目的にも使用できる）が、前者は一部のクエリにとってはシンプルかもしれません。以下に両方を示します：

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

この結果、クエリ時間は0.133秒から0.004秒に短縮されました – 25倍以上の改善です！

:::important 注意: `ORDER BY` = `GROUP BY`
ほとんどの場合、マテリアライズドビューの変換における `GROUP BY` 句で使用されるカラムは、ターゲットテーブルの `ORDER BY` 句で使用されるカラムと一貫性があるべきです。これは、`SummingMergeTree` または `AggregatingMergeTree` テーブルエンジンを使用する場合に特に重要です。これらのエンジンは、バックグラウンドマージ操作中に同一の値を持つ行をマージするために `ORDER BY` カラムに依存しています。`GROUP BY` と `ORDER BY` カラムの不一致は、クエリパフォーマンスの低下、最適でないマージ、またはデータの不整合を引き起こす可能性があります。
:::
### より複雑な例 {#a-more-complex-example}

上記の例では、マテリアライズドビューを使用して日ごとに2つの合計を計算および維持しました。合計は、部分的な状態を維持するための最も単純な集約の形を表します - 新しい値が到着する際に既存の値に追加するだけです。しかし、ClickHouseのマテリアライズドビューは、あらゆる集約型で使用可能です。

日ごとに投稿に関するいくつかの統計を計算したいと仮定します: `Score` の99.9パーセンタイルと `CommentCount` の平均値。これを計算するためのクエリは次のようになります：

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

前述の通り、新しい投稿が `posts` テーブルに挿入されるにつれて、上記のクエリを実行するマテリアライズドビューを作成できます。

例の目的のため、S3から投稿データをロードせずに済むように、`posts` と同じスキーマのテーブル `posts_null` を作成します。ただし、このテーブルはデータを保持せず、単にマテリアライズドビューによって行が挿入されるときに使用されます。データの保存を防ぐために、[`Null` テーブルエンジンタイプ](/engines/table-engines/special/null)を使用します。

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Nullテーブルエンジンは強力な最適化です - それを `/dev/null` と考えましょう。マテリアライズドビューは、`posts_null` テーブルが挿入時に行を受け取るときにサマリ統計を計算および保存します - これは単なるトリガーです。しかし、原データは保存されません。私たちのケースでは、元の投稿を保存する必要があると思われるかもしれませんが、このアプローチを使うことで、原データのストレージオーバーヘッドを避けつつ集約を計算できます。

このマテリアライズドビューは次のようになります：

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

集約関数の末尾に `State` サフィックスを追加することに注意してください。これにより、関数の集約状態が返され、最終的な結果ではなくなります。この集約状態は、他の状態とマージするために必要な追加情報を含みます。たとえば、平均の場合、これはカラムのカウントと合計を含みます。

> 部分集約状態は、正確な結果を計算するために必要です。たとえば、平均を計算する場合、サブレンジの平均を単に平均化することでは不正確な結果が得られます。

次に、このビューのターゲットテーブル `post_stats_per_day` を作成し、これらの部分的な集約状態をストレージします：

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

前の `SummingMergeTree` がカウントを保存するのに十分だったのですが、他の関数には、より高度なエンジンタイプが必要です：[ `AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree)。ClickHouseが集約状態を保存することを理解するために、`Score_quantiles` と `AvgCommentCount` を `AggregateFunction` タイプとして定義し、部分的な状態の関数ソースとそのソースカラムの型を指定します。`SummingMergeTree` と同様に、同じ `ORDER BY` キー値を持つ行がマージされます（上記の例では `Day`）。

マテリアライズドビューを介して `post_stats_per_day` をポピュレートするには、次のように `posts` からすべての行を `posts_null` に挿入できます：

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> 本番環境では、マテリアライズドビューを `posts` テーブルに接続することが考えられます。ここでは、Nullテーブルを使用してNullテーブルをデモンストレーションしています。

最終的なクエリでは、関数の `Merge` サフィックスを使用する必要があります（カラムは部分的な集約状態を保存します）：

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

ここで `FINAL` の代わりに `GROUP BY` を使用しています。
## その他の用途 {#other-applications}

上記は、マテリアライズドビューを使用してデータの部分集約をインクリメンタルに更新することに主に焦点を当てています。したがって、計算をクエリから挿入時間に移行しています。この一般的なユースケースを超えて、マテリアライズドビューにはさまざまな他のアプリケーションがあります。
### フィルタリングと変換 {#filtering-and-transformation}

場合によっては、挿入時に行とカラムのサブセットのみを挿入することを希望するかもしれません。この場合、`posts_null` テーブルは挿入時に行をフィルタリングする `SELECT` クエリで挿入を受け入れることができます。たとえば、`posts` テーブルの `Tags` カラムを変換したいとします。これは、パイプで区切られたタグ名のリストを含みます。これらを配列に変換することで、個々のタグ値で集約を行いやすくなります。

> この変換を行う際に `INSERT INTO SELECT` を実行できます。マテリアライズドビューは、このロジックをClickHouse DDLにカプセル化し、挿入をシンプルに保ちながら、任意の新しい行に変換を適用できるようにします。

この変換のためのマテリアライズドビューは次のように示されます：

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```
### ルックアップテーブル {#lookup-table}

ユーザーは、ClickHouseの順序キーを選択する際にアクセスパターンを考慮する必要があります。フィルタリングおよび集約句で頻繁に使用されるカラムを使用すべきです。これは、ユーザーが特定のカラムのセットにカプセル化できない多様なアクセスパターンを持つシナリオでは制約となる可能性があります。たとえば、次の `comments` テーブルを考えてみましょう：

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

ここでの順序キーは、`PostId` でフィルタリングするクエリを最適化します。

ユーザーが特定の `UserId` でフィルタリングし、平均 `Score` を計算したいと仮定します：

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

これは速いですが（ClickHouseではデータが小さい）、この処理にはフルテーブルスキャンが必要であることを示しています - 処理された行数は90.38百万です。大規模なデータセットの場合、マテリアライズドビューを使用して、フィルタリングカラム `UserId` に対して `PostId` の順序キー値をルックアップすることができます。これらの値を使用して、効率的なルックアップを実行できます。

この例では、マテリアライズドビューは非常にシンプルで、挿入時に `comments` から `PostId` と `UserId` のみを選択します。これらの結果は、`comments_posts_users` テーブルに送信され、`UserId` で順序付けされます。このようにして、以下に示す `Comments` テーブルのNullバージョンを作成し、これを利用してビューと `comments_posts_users` テーブルをポピュレートします：

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

これで、このビューをサブクエリで使用して、前のクエリを加速することができます：

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
### チェイニング {#chaining}

マテリアライズドビューはチェインすることができ、複雑なワークフローを確立することが可能です。実際の例については、この [ブログ記事](https://clickhouse.com/blog/chaining-materialized-views) を読むことをお勧めします。
## マテリアライズドビューとJOIN {#materialized-views-and-joins}

:::note リフレッシャブル マテリアライズドビュー
次のことはインクリメンタル マテリアライズドビューのみに適用されます。リフレッシャブル マテリアライズドビューは、フルターゲットデータセットに対して定期的にクエリを実行し、JOINを完全にサポートします。結果の新鮮さの低下が許容されるなら、複雑なJOINの場合にはこれらの使用を考慮してください。
:::

ClickHouseのインクリメンタルマテリアライズドビューは、`JOIN` 操作を完全にサポートしますが、一つの重要な制約があります： **マテリアライズドビューは、ソーステーブル（クエリ内の左最初のテーブル）への挿入でのみトリガーされます**。JOINの右側のテーブルで変更があっても、それらの変更は更新をトリガーしません。この動作は、挿入時にデータが集計または変換される**インクリメンタル** マテリアライズドビューを構築する際に特に重要です。

`JOIN` を使用してインクリメンタルマテリアライズドビューを定義するとき、`SELECT` クエリ内の最も左のテーブルがソースとして機能します。このテーブルに新しい行が挿入されると、ClickHouseはその新しく挿入された行のみでマテリアライズドビューのクエリを実行します。JOINの右側のテーブルは、この実行時に完全に読み取られますが、それらのデータが単独で変更されてもビューはトリガーされません。

この動作により、マテリアライズドビューのJOINは、静的な次元データに対するスナップショットJOINのようになります。

これは、参照や次元テーブルでデータを強化する際にうまく機能します。ただし、右側のテーブル（例：ユーザーメタデータ）の更新は、マテリアライズドビューに対して遡及的に更新されません。更新されたデータが見えるようにするには、ソーステーブルに新しい挿入が必要です。
### 例 {#materialized-views-and-joins-example}

[Stack Overflow データセット](/data-modeling/schema-design) を使用して具体的な例を見てみましょう。ユーザーごとの**日ごとのバッジ数**を計算するためのマテリアライズドビューを使用します。同時に、`users` テーブルからのユーザーの表示名も含めます。

リマインダーとして、テーブルスキーマは次のようになります。

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

`users` テーブルがすでに事前にポピュレートされていると仮定します：

```sql
INSERT INTO users
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet');
```

マテリアライズドビューおよびその関連するターゲットテーブルは次のように定義されます：

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

:::note グルーピングと順序整列
マテリアライズドビュー内の `GROUP BY` 句には、ターゲットテーブルの `ORDER BY` 句と一致する `DisplayName`、`UserId`、`Day` を含める必要があります。これにより、行が正しく集約されマージされます。これらのいずれかを省略すると、誤った結果または非効率的なマージが生じる可能性があります。
:::

バッジを補充すると、ビューがトリガーされ、`daily_badges_by_user` テーブルがポピュレートされます。

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

特定のユーザーが獲得したバッジを確認したい場合、次のクエリを実行できます：

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

このユーザーが新しいバッジを受け取ると、行が挿入され、ビューが更新されます：

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

ただし、この結果は不正確です。
### マテリアライズドビューにおけるJOINのベストプラクティス {#join-best-practices}

- **左最初のテーブルをトリガーとして使用します。** `SELECT` ステートメントの左側のテーブルのみがマテリアライズドビューをトリガーします。右側のテーブルに対する変更は、更新をトリガーしません。

- **結合済みデータを事前挿入します。** 結合テーブルのデータが存在していることを確認してからソーステーブルに行を挿入します。JOINは挿入時に評価されるため、データが欠けていると未一致の行やnullが発生します。

- **結合から引き出すカラムを制限します。** メモリ使用量を最小限に抑え、挿入時のレイテンシを削減するために、結合テーブルから必要なカラムだけを選択します（以下を参照）。

- **挿入時のパフォーマンスを評価してください。** JOINは特に右側の大きなテーブルを伴う場合、挿入コストを増加させます。代表的な本番データを使用して挿入速度をベンチマークしてください。

- **単純なルックアップには辞書を好む。** キー値ルックアップ（例：ユーザーIDから名前）には、コストの高いJOIN操作を避けるために[Dictionaries](/dictionary)を使用してください。

- **マージ効率のために `GROUP BY` と `ORDER BY` を整合させます。** `SummingMergeTree` または `AggregatingMergeTree` を使用する際は、`GROUP BY` がターゲットテーブルの `ORDER BY` 句と一致するようにし、効率的な行のマージを可能にします。

- **明示的なカラムエイリアスを使用します。** テーブルにオーバーラップするカラム名がある場合、エイリアスを使用して曖昧さを防ぎ、ターゲットテーブルの正確な結果を確保します。

- **挿入量と頻度を考慮します。** JOINは中程度の挿入負荷に適しています。高スループットの取り込みには、ステージングテーブル、事前結合、または辞書や[リフレッシャブルマテリアライズドビュー](/materialized-view/refreshable-materialized-view)などの他のアプローチを検討してください。
### マテリアライズドビュー内でのソーステーブルの使用 {#using-source-table-in-filters-and-joins-in-materialized-views}

ClickHouseにおけるマテリアライズドビューを使用する際には、マテリアライズドビューのクエリの実行中にソーステーブルがどのように扱われるかを理解することが重要です。特に、マテリアライズドビューのクエリ内のソーステーブルは、挿入されたデータブロックで置き換えられます。この動作は、適切に理解されていない場合、予期しない結果を引き起こす可能性があります。
#### 例シナリオ {#example-scenario}

次のセットアップを考えます：

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

上記の例では、`mvw1` と `mvw2` という2つのマテリアライズドビューが類似の操作を実行しますが、ソーステーブル `t0` の参照方法にわずかな違いがあります。

`mvw1`では、右側のJOINの中でテーブル`t0`が直接参照されます。`t0`にデータが挿入されると、マテリアライズドビューのクエリは挿入されたデータブロックを使って実行されます。これは、JOINが新しく挿入された行のみに対して行われることを意味します。

2番目の場合、`vt0`をJOINすると、ビューは`t0`からの全データを読み取ります。これにより、JOIN操作は `t0` 内のすべての行を考慮に入れることができ、新しく挿入されたブロックのみではなくなります。

重要な違いは、マテリアライズドビューのクエリがトリガーされたときのソーステーブル（この場合の`t0`）の扱い方にあります。マテリアライズドビューがトリガーされると、ソーステーブルは挿入ブロックのデータで置き換えられます。この動作をうまく利用すれば、クエリを最適化できますが、適切に理解しないと予期しない結果が生じる可能性があります。

### 使用例と注意事項 {#use-cases-and-caveats}

実際には、この動作を利用して、ソーステーブルのデータのサブセットのみを処理する必要がある Materialized View を最適化できます。例えば、他のテーブルと結合する前に、サブクエリを使用してソーステーブルをフィルタリングできます。これにより、Materialized View が処理するデータ量を減らし、パフォーマンスを向上させることができます。

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

この例では、`IN (SELECT id FROM t0)` サブクエリから構築されたセットは、新しく挿入された行のみで構成されており、`t1` に対するフィルタとして役立ちます。
#### Stack Overflow の例 {#example-with-stack-overflow}

以前の [Materialized View の例](/materialized-view/incremental-materialized-view#example) を考慮して、ユーザーごとの **日次バッジ** を計算するため、`users` テーブルからユーザーの表示名を含めることを想定します。

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

このビューは、`badges` テーブルへの挿入遅延に大きな影響を与えました。例えば、

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

上記のアプローチを使用することで、このビューを最適化できます。挿入されたバッジ行のユーザー ID を使用して `users` テーブルにフィルタを追加します：

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

この変更により、初期のバッジ挿入のスピードアップが期待できます：

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 132.118 sec. Processed 323.43 million rows, 4.69 GB (2.45 million rows/s., 35.49 MB/s.)
Peak memory usage: 1.99 GiB.
```

また、将来のバッジ挿入が効率的になります。

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
```

上記の操作では、ユーザー ID `2936484` に対してユーザー テーブルから 1 行のみが取得されます。このルックアップも `Id` のテーブルオーダリングキーで最適化されています。
## Materialized Views と UNION {#materialized-views-and-unions}

`UNION ALL` クエリは、多数のソース テーブルからデータを 1 つの結果セットに結合するためによく使用されます。

`UNION ALL` は Incremental Materialized Views では直接サポートされていませんが、各 `SELECT` ブランチに対して別々の Materialized View を作成し、その結果を共有ターゲットテーブルに書き込むことによって、同じ結果を得ることができます。

例として、Stack Overflow データセットを使用します。以下は、ユーザーが取得したバッジと、投稿に対して行ったコメントを表す `badges` テーブルと `comments` テーブルです。

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

これらは次の `INSERT INTO` コマンドでポピュレートできます。

```sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')
```

ユーザーの活動を統一したビューを作成し、これら 2 つのテーブルを組み合わせて各ユーザーの最終活動を表示するとしましょう：

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

このクエリの結果を受け取るためのターゲットテーブルを持っていると仮定します。ここでは、[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) テーブルエンジンと、結果が正しくマージされることを保証するための [AggregateFunction](/sql-reference/data-types/aggregatefunction) の使用に注意してください。

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

このテーブルが `badges` または `comments` に新しい行が挿入されるたびに更新されるようにしたい場合、ナイーブなアプローチとしては、以前の UNION クエリで Materialized View を作成しようとするかもしれません：

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

これは文法的に有効ですが、意図しない結果を生じさせます - ビューは `comments` テーブルへの挿入のみをトリガーします。例えば：

```sql
INSERT INTO comments VALUES (99999999, 23121, 1, '答えは42です', now(), 2936484, 'gingerwizard');

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

`badges` テーブルへの挿入はビューをトリガーしますが、`user_activity` には更新が反映されません：

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

これを解決するには、各 SELECT 文ごとに Materialized View を作成します：

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

いずれかのテーブルに挿入した場合に、正しい結果が得られるようになります。たとえば、`comments` テーブルに挿入すると、

```sql
INSERT INTO comments VALUES (99999999, 23121, 1, '答えは42です', now(), 2936484, 'gingerwizard');

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

前の例で示したように、テーブルは複数の Materialized Views のソースとして機能することがあります。これらが実行される順序は、設定 [`parallel_view_processing`](/operations/settings/settings#parallel_view_processing) に依存します。

デフォルトでは、この設定は `0` (`false`) に等しく、Materialized Views は `uuid` 順に逐次実行されます。

例えば、以下の `source` テーブルと、行を `target` テーブルに送信する 3 つの Materialized Views を考えてみましょう：

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

各ビューは、`target` テーブルに行を挿入する前に 1 秒間一時停止することに注意してください。挿入されたメッセージも含めています。

テーブル `source` に行を挿入すると、約 3 秒かかります。各ビューは逐次実行されます：

```sql
INSERT INTO source VALUES ('test')

1 row in set. Elapsed: 3.786 sec.
```

各行の到着を確認するために `SELECT` を実行できます：

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

これは、ビューの `uuid` に一致します：

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

逆に、`parallel_view_processing=1` を有効にした状態で行を挿入すると、ビューが並行して実行され、`target` テーブルに行が到着する順序に保証がなくなります：

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

各ビューからの行の到着順は同じですが、これは保証されていないことに注意してください - 各行の挿入時間の類似性がそれを示しています。また、挿入パフォーマンスの向上にも注意してください。
### 並行処理を使用すべきとき {#materialized-views-when-to-use-parallel}

`parallel_view_processing=1` を有効にすると挿入スループットが大幅に向上することがあります。特に、複数の Materialized Views が単一のテーブルに接続されている場合は顕著です。しかし、取引のトレードオフを理解することが重要です：

- **挿入圧力の増加**: すべての Materialized Views が同時に実行され、CPU とメモリの使用量が増加します。各ビューが重い計算や JOIN を実行する場合、システムの負荷が増す可能性があります。
- **厳密な実行順序の必要性**: ビューの実行順序が重要な稀なワークフロー（例えば、連鎖依存がある場合）では、並行実行が状態不整合やレースコンディションを引き起こすことがあります。このようなセットアップは設計可能ですが、脆弱であり、将来のバージョンで破綻する可能性があります。

:::note 歴史的なデフォルトと安定性
逐次実行は長い間デフォルトでしたが、エラーハンドリングの複雑さの一因でもあります。以前は、1 つの Materialized View の失敗が他のビューの実行を妨げる可能性がありました。新しいバージョンでは、ブロックごとに失敗を分離することでこれが改善されましたが、逐次処理は依然としてより明確な失敗セマンティクスを提供します。
:::

一般的に、次の場合に `parallel_view_processing=1` を有効にします：

- 複数の独立した Materialized Views がある
- 挿入パフォーマンスを最大化しようとしている
- 同時実行するビューの実行に関するシステムの容量を認識している

次の場合は無効のままにします：
- Materialized Views が相互依存している
- 予測可能で順序のある実行が必要
- 挿入挙動のデバッグまたは監査を行っており、決定論的なリプレイが必要

## Materialized Views と共通テーブル式（CTE） {#materialized-views-common-table-expressions-ctes}

**非再帰的** 共通テーブル式（CTE）は、Materialized Views でサポートされています。

:::note 共通テーブル式は **マテリアライズされない**
ClickHouse は CTE をマテリアライズしません; 代わりに CTE の定義をクエリに直接置き換え、同じ式が複数回評価される原因となることがあります（CTE が複数回使用される場合）。
:::

以下の例を考えてみましょう - この例では、各投稿タイプの毎日のアクティビティを計算します。

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
    WHERE Score > 0 AND PostTypeId IN (1, 2)  -- 質問または回答
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

ここでは、CTE は厳密には必要ありませんが、例示の目的からこのビューは期待どおりに動作します：

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

ClickHouse では、CTE はインライン化されるため、それらは効果的に最適化中にクエリにコピー＆ペーストされ、**マテリアライズされません**。これにより次のような意味があります：

- CTE がソーステーブルと異なるテーブルを参照し（つまり、Materialized View に接続されているテーブル）、`JOIN` または `IN` 句で使用される場合、それはサブクエリまたは結合のように動作します。
- Materialized View はメインのソーステーブルへの挿入時のみにトリガーされますが、CTE は毎回再実行されるため、特に参照されるテーブルが大きい場合に不要なオーバーヘッドを引き起こす可能性があります。

例えば、次のクエリを考えてみましょう。

```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

この場合、ユーザーの CTE は投稿への挿入ごとに再評価され、Materialized View は新しいユーザーが挿入されたときには更新されません - 投稿が挿入されたときのみ更新されます。

一般的に、CTE は Materialized View が接続されているソーステーブル内で操作するロジックに使用するか、または参照されるテーブルが小さく、パフォーマンスボトルネックを引き起こす可能性が低いことを確認してください。あるいは、[Materialized Views の JOIN に関する最適化と同様の最適化](/materialized-view/incremental-materialized-view#join-best-practices)を検討してください。
