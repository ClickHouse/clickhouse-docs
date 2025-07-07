---
'slug': '/materialized-view/incremental-materialized-view'
'title': 'インクリメンタルマテリアライズドビュー'
'description': 'クエリの高速化にインクリメンタルマテリアライズドビューを使用する方法'
'keywords':
- 'incremental materialized views'
- 'speed up queries'
- 'query optimization'
'score': 10000
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import Image from '@theme/IdealImage';

## 背景 {#background}

増分マテリアライズドビュー（Materialized Views）は、ユーザーがクエリ時の計算コストを挿入時に移行できるようにし、結果として`SELECT`クエリをより迅速に実行できるようにします。

Postgresのようなトランザクショナルデータベースとは異なり、ClickHouseのマテリアライズドビューは、テーブルにデータが挿入される際にデータのブロックに対してクエリを実行するトリガーに過ぎません。このクエリの結果は、別の「ターゲット」テーブルに挿入されます。更に行が挿入されると、結果は再びターゲットテーブルに送信され、中間結果が更新され、マージされます。このマージされた結果は、元のデータ全体に対してクエリを実行するのと同等です。

マテリアライズドビューの主な動機は、ターゲットテーブルに挿入された結果が行の集計、フィルタリング、または変換の結果を示すことです。これらの結果は、元のデータの小さな表現（集計の場合の部分的なスケッチ）となることがよくあります。これにより、ターゲットテーブルから結果を読み取るためのクエリがシンプルになり、同じ計算が元のデータに対して行われるよりもクエリ時間が短縮され、計算（およびその結果、クエリの待機時間）がクエリ時から挿入時に移されます。

ClickHouseのマテリアライズドビューは、データが基づくテーブルに流れ込むにつれてリアルタイムで更新され、常に更新されるインデックスのように機能します。これは、マテリアライズドビューが通常クエリの静的なスナップショットであり、更新が必要な他のデータベースとは対照的です（ClickHouseの[Refreshable Materialized Views](/sql-reference/statements/create/view#refreshable-materialized-view)に類似）。

<Image img={materializedViewDiagram} size="md" alt="マテリアライズドビューの図"/>
## 例 {#example}

例の目的のために、["スキーマ設計"](/data-modeling/schema-design)で文書化されたStack Overflowデータセットを使用します。

例えば、投稿ごとの日に対するアップボートおよびダウンボートの数を取得したいとします。

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

これは、[`toStartOfDay`](/sql-reference/functions/date-time-functions#tostartofday)関数のおかげでClickHouseではかなりシンプルなクエリです:

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

このクエリは既にClickHouseによって速く処理されますが、さらに良くできますか？

挿入時にマテリアライズドビューを使用してこれを計算したい場合、結果を受け取るためのテーブルが必要です。このテーブルは、1日に対して1行のみを保持する必要があります。既存の日に対する更新が受信された場合、他のカラムは既存の日の行にマージされる必要があります。このインクリメンタルな状態のマージが行われるためには、他のカラムの部分的な状態を保存する必要があります。

これには、ClickHouseの特別なエンジンタイプが必要です: [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。これにより、同じ順序キーを持つすべての行が1つの行に置き換えられ、その行には数値カラムの合計値が含まれます。次のテーブルは、同じ日付の行をマージし、数値カラムを合計します:

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

マテリアライズドビューを示すために、投票テーブルが空でデータをまだ受信していないと仮定します。マテリアライズドビューは、`votes`に挿入されたデータに対して上記の`SELECT`を実行し、結果を`up_down_votes_per_day`に送信します:

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

ここでの`TO`句は重要であり、結果が送信される場所、すなわち`up_down_votes_per_day`を示しています。

以前の挿入から投票テーブルを再ポピュレートできます:

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

完了したら、`up_down_votes_per_day`のサイズを確認できます - 1日に対して1行保有しているはずです:

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

ここでは、238百万行（`votes`内）の数を5000に効果的に削減しましたが、重要なのは新しい投票が`votes`テーブルに挿入されると、それぞれの日に新しい値が`up_down_votes_per_day`に送信され、バックグラウンドで非同期に自動的にマージされることです - 1日に対して1行だけを保持します。したがって、`up_down_votes_per_day`は常に小さく、最新の状態を保ちます。

行のマージが非同期で行われるため、ユーザーがクエリを実行したときに、1日に対して複数の投票がある場合があります。未処理の行がクエリ時にマージされることを確実にするために、2つのオプションがあります：

- テーブル名に`FINAL`修飾子を使用します。これは上記のカウントクエリで行いました。
- 最終テーブルで使用している順序キー（すなわち`CreationDate`）で集計し、メトリックスを合計します。通常、これはより効率的で柔軟性があります（テーブルは他の用途にも使用可能）、しかし前者は一部のクエリでは簡単です。以下の両方を示します:

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

これにより、クエリの速度が0.133秒から0.004秒に向上し、25倍以上の改善となりました！

:::important 注意: `ORDER BY` = `GROUP BY`
ほとんどの場合、マテリアライズドビューの変換において`GROUP BY`句で使用されるカラムは、`SummingMergeTree`または`AggregatingMergeTree`テーブルエンジンを使用する場合、ターゲットテーブルの`ORDER BY`句で使用されるカラムと一致している必要があります。これらのエンジンは、バックグラウンドでのマージ操作中に同一の値を持つ行をマージするために`ORDER BY`カラムに依存しています。`GROUP BY`と`ORDER BY`カラムの不整合は、クエリのパフォーマンスを低下させ、最適でないマージやデータの不一致を引き起こす可能性があります。
:::

### より複雑な例 {#a-more-complex-example}

上記の例は、日に対して2つの合計を計算および維持するためにマテリアライズドビューを使用しています。合計は、部分的な状態を維持するための最も単純な形式の集計を表します - 新しい値が到着すると、単に既存の値に追加できます。ただし、ClickHouseのマテリアライズドビューは、任意の集計タイプに使用できます。

例えば、各日に対する投稿に関する統計を計算したいとします: `Score`の99.9パーセンタイルと`CommentCount`の平均。これを計算するクエリは次のようになります:

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

前述の通り、このクエリを毎回新しい投稿が`posts`テーブルに挿入されるたびに実行するマテリアライズドビューを作成できます。

例の目的のために、S3からの投稿データの読み込みを避けるために、`posts`と同じスキーマを持つ複製テーブル`posts_null`を作成します。しかし、このテーブルはデータを保存せず、単にマテリアライズドビューによって行が挿入される際に使用されるだけです。データの保存を防ぐために、[`Null`テーブルエンジンタイプ](/engines/table-engines/special/null)を使用できます。

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Nullテーブルエンジンは強力な最適化です - `/dev/null`のように考えてください。マテリアライズドビューは、`posts_null`に行が挿入される際に私たちのサマリー統計を計算し、保存します - 単にトリガーに過ぎません。ただし、元のデータは保存されません。私たちのケースでは、おそらく元の投稿を保存したいですが、このアプローチは生のデータのストレージオーバーヘッドを避けながら集計を計算するために使用されることがあります。

したがって、マテリアライズドビューは次のようになります:

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

集計関数の末尾に接尾辞`State`を追加することに注目してください。これにより、集約関数の状態の状態が返されることが保証され、最終結果ではなく、他の状態とマージできる追加情報が含まれます。例えば、平均の場合、これにはカウントとカラムの合計が含まれます。

> 部分的な集約状態は、正確な結果を計算するために必要です。例えば、平均を計算する場合、部分範囲の平均を単純に加重平均することは、不正確な結果を生む可能性があります。

次に、このビューのターゲットテーブル`post_stats_per_day`を作成し、これらの部分的な集約状態を保存します:

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

以前はカウントを保存するために`SummingMergeTree`が十分でしたが、他の関数にはより高度なエンジンタイプが必要です: [`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree)。ClickHouseが集約状態を保存することを認識できるように、`Score_quantiles`および`AvgCommentCount`をタイプ`AggregateFunction`として定義し、部分状態のソース関数とそのソースカラムのタイプを指定します。`SummingMergeTree`と同様に、同じ`ORDER BY`キー値を持つ行がマージされます（上記の例では`Day`です）。

マテリアライズドビューを介して`post_stats_per_day`をポピュレートするには、単に`posts`からすべての行を`posts_null`に挿入します:

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> 本番環境では、マテリアライズドビューを`posts`テーブルに接続することが期待されます。ここではNullテーブルを使用して、Nullテーブルを示すために`posts_null`を使用しました。

最後のクエリは、関数に`Merge`接尾辞を使用する必要があります（列が部分的な集約状態を保存しているため）:

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

ここでは、`FINAL`を使用する代わりに`GROUP BY`を使用しています。
## その他のアプリケーション {#other-applications}

上記は、主にマテリアライズドビューを使用してデータの部分的集約を増分的に更新することに焦点を当てています。従って、計算をクエリから挿入時に移動させています。この一般的な使用ケースを越えて、マテリアライズドビューには多くのその他のアプリケーションがあります。
### フィルタリングと変換 {#filtering-and-transformation}

特定の状況では、挿入時に行とカラムのサブセットのみを挿入することを望むかもしれません。この場合、`posts_null`テーブルが挿入を受け入れ、`SELECT`クエリが行をフィルタリングして`posts`テーブルへの挿入を行うことができます。例えば、`posts`テーブル内の`Tags`カラムを変換したいとします。これは、パイプで区切られたタグ名のリストを含みます。これを配列に変換することで、個々のタグ値による集計がより簡単になります。

> この変換は、`INSERT INTO SELECT`を実行するときに行うことができます。マテリアライズドビューは、このロジックをClickHouseのDDLでカプセル化し、挿入を簡素化し、新しい行に対して変換を適用できます。

この変換のためのマテリアライズドビューは次のように示されます:

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```
### ルックアップテーブル {#lookup-table}

ユーザーは、ClickHouseの順序キーを選択する際にアクセスパターンを考慮すべきです。フィルターや集計句で頻繁に使用されるカラムを使用する必要があります。これは、ユーザーが単一のカラムのセットにカプセル化できない、より多様なアクセスパターンを持つシナリオに制限される可能性があります。例えば、次の`comments`テーブルを考えてみましょう:

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

ここでの順序キーは、`PostId`でフィルタリングするクエリのためにテーブルを最適化します。

特定の`UserId`でフィルタリングし、その平均`Score`を計算したいとします:

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

これは高速ですが（ClickHouseではデータが小さいため）、処理された行数からフルテーブルスキャンが必要であることがわかります - 90.38百万行。より大きなデータセットでは、マテリアライズドビューを使用してフィルタリングカラム`UserId`のために順序キー`PostId`をルックアップすることができます。これらの値を使用して効率的にルックアップします。

この例では、マテリアライズドビューは非常にシンプルで、挿入時に`comments`から`PostId`と`UserId`のみを選択します。これにより結果は、`UserId`で順序付けられた`comments_posts_users`というテーブルに送信されます。以下に、コメントテーブルのNullバージョンを作成し、これを使用してビューをポピュレートし、`comments_posts_users`テーブルを作成します:

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

これにより、以前のクエリを加速するためにサブクエリでこのビューを使用できます:

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
### チェイン {#chaining}

マテリアライズドビューはチェインでき、複雑なワークフローを確立することができます。実用的な例については、[このブログ記事](https://clickhouse.com/blog/chaining-materialized-views)を読むことをお勧めします。
## マテリアライズドビューとJOIN {#materialized-views-and-joins}

:::note Refreshable Materialized Views
以下は増分マテリアライズドビューにのみ適用されます。リフレッシュ可能なマテリアライズドビューは、ターゲットデータセット全体に対して定期的にクエリを実行し、JOINを完全にサポートします。複雑なJOINにリザルトの新鮮さが許容できる場合は、それを検討してください。
:::

ClickHouseの増分マテリアライズドビューは、`JOIN`操作を完全にサポートしますが、1つの重要な制約があります: **マテリアライズドビューはソーステーブル（クエリの左側）への挿入時のみトリガーされます。** JOINの右側のテーブルは、たとえデータが変更されても更新をトリガーしません。この動作は、挿入時にデータが集約または変換される**増分**マテリアライズドビューを構築する際に特に重要です。

増分マテリアライズドビューが`JOIN`を使用して定義されると、`SELECT`クエリの最も左側のテーブルがソースとして機能します。このテーブルに新しい行が挿入されると、ClickHouseはその新しく挿入された行でのみマテリアライズドビュークエリを実行します。JOIN内の右側のテーブルはこの実行中に完全に読み取られますが、それ自体がトリガーされることはありません。

この動作により、マテリアライズドビュー内のJOINは、静的な次元データに対するスナップショットJOINに似たものとなります。

これは、参照または次元テーブルを使用してデータを付加するのに適しています。ただし、右側のテーブル（例えば、ユーザーメタデータ）への更新は、マテリアライズドビューを遡及的に更新しません。更新されたデータを見るためには、ソーステーブルに新しい挿入が到着する必要があります。
### 例 {#materialized-views-and-joins-example}

具体的な例を通じて、[Stack Overflowデータセット](/data-modeling/schema-design)を使用してみましょう。ユーザーごとの**日次バッジ**を計算するためにマテリアライズドビューを使用し、`users`テーブルからのユーザーの表示名を含めます。

思い出してください、私たちのテーブルスキーマは次のとおりです:

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

`users`テーブルは事前にポピュレートされていると仮定します:

```sql
INSERT INTO users
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet');
```

マテリアライズドビューとその関連ターゲットテーブルは次のように定義されています:

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

:::note グルーピングおよび整列の整合性
マテリアライズドビューの`GROUP BY`句は、ターゲットテーブルの`ORDER BY`句と一致する必要があります。これにより、行が正しく集約およびマージされます。これらのいずれかを省略すると、不正確な結果や効率的でないマージにつながる可能性があります。
:::

バッジをポピュレートすると、ビューがトリガーされ、`daily_badges_by_user`テーブルがポピュレートされます。

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

特定のユーザーが獲得したバッジを見ることができるように次のクエリを書くことができます:

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

このユーザーが新しいバッジを受け取ると、行が挿入され、ビューが更新されます:

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
挿入の待機時間に注意してください。挿入されたユーザーロウは、全体の`users`テーブルに対して結合されるため、挿入パフォーマンスに大きな影響を与えます。これに対応する方法を、["Using Source Table in Filters and Joins"](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views)で提案します。
:::

一方、新しいユーザーのためにバッジを挿入し、その後ユーザーの行が挿入された場合、マテリアライズドビューはユーザーの指標を捉えることに失敗します。

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

この場合、ビューはバッジの挿入に対してのみ実行され、そのユーザー行が存在する前に実行されます。もしそのユーザーのために別のバッジを挿入すると、行が挿入されるのは予想通りです:

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

ただし、この結果は不正確です。
### マテリアライズドビューのJOINに関するベストプラクティス {#join-best-practices}

- **左側のテーブルをトリガーとして使用する。**  `SELECT`文の左側のテーブルのみがマテリアライズドビューをトリガーします。右側のテーブルに対する変更は更新をトリガーしません。

- **結合データを事前に挿入する。** ソーステーブルに行を挿入する前に、結合テーブルのデータが存在することを確認します。JOINは挿入時に評価されるため、データが欠落すると、行が一致しないかnullになります。

- **結合から取り出す列を制限する。** 必要な列のみを結合テーブルから選択し、メモリ使用量を最小限に抑え、挿入時の待機時間を減らします（以下を参照）。

- **挿入時のパフォーマンスを評価する。** JOINは挿入のコストを増加させ、特に右側の大きなテーブルで顕著です。代表的な本番データを使用して挿入レートをベンチマーク化します。

- **単純なルックアップには辞書を優先する。** キー-バリューのルックアップ（例：ユーザーIDから名前）には[辞書](/dictionary)を使用し、高額なJOIN操作を回避します。

- **マージの効率のために`GROUP BY`と`ORDER BY`を整合させる。**  `SummingMergeTree`または`AggregatingMergeTree`を使用する場合、`GROUP BY`がターゲットテーブルの`ORDER BY`句と一致することを確認し、効率的な行のマージを可能にします。

- **明示的な列エイリアスを使用する。** テーブルに重複する列名がある場合、エイリアスを使用してあいまいさを防ぎ、ターゲットテーブルで正確な結果を確保します。

- **挿入量と頻度を考慮する。** JOINは中程度の挿入負荷でうまく機能します。高スループットのインジェクションには、ステージングテーブル、事前の結合、または辞書や[リフレッシュ可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view)などの他のアプローチを検討してください。
### マテリアライズドビュー内のソーステーブルの使用 {#using-source-table-in-filters-and-joins-in-materialized-views}

ClickHouseでマテリアライズドビューを使用する場合、マテリアライズドビューのクエリ実行中にソーステーブルがどのように扱われるかを理解することが重要です。具体的には、マテリアライズドビューのクエリ内のソーステーブルは挿入されたデータブロックに置き換えられます。この動作は、正しく理解されていない場合にいくつかの思ってもみない結果を導く可能性があります。
#### 例のシナリオ {#example-scenario}

以下のセットアップを考えてみましょう:

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

上記の例では、`mvw1`と`mvw2`という2つのマテリアライズドビューが似たような操作を実行していますが、ソーステーブル`t0`を参照する方法にわずかな違いがあります。

`mvw1`の中では、`t0`テーブルがJOINの右側にある`(SELECT * FROM t0)`サブクエリの中で直接参照されています。`t0`にデータが挿入されると、マテリアライズドビューのクエリは、挿入されたデータブロックが`t0`を置き換えた状態で実行されます。これは、JOIN操作が新しく挿入された行にのみ実行されることを意味します。

JOINに`vt0`を使用する場合、ビューは`t0`からのすべてのデータを読み取ります。これにより、JOIN操作が`t0`内のすべての行を考慮し、新しく挿入されたブロックに限定されることがなくなります。

ClickHouseがマテリアライズドビューのクエリ内のソーステーブルをどのように扱うかにおける重要な違いです。マテリアライズドビューが挿入によってトリガーされると、ソーステーブル（この場合は`t0`）は挿入されたデータブロックに置き換えられます。この動作は、クエリを最適化するために利用できますが、期待しない結果を避けるためには注意が必要です。
### 利用ケースと注意事項 {#use-cases-and-caveats}

実際には、この動作を使用して、ソーステーブルのデータのサブセットのみを処理する必要があるMaterialized Viewを最適化することができます。たとえば、他のテーブルと結合する前にサブクエリを使用してソーステーブルをフィルタリングできます。これにより、Materialized Viewによって処理されるデータ量を削減し、パフォーマンスを向上させることができます。

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

この例では、`IN (SELECT id FROM t0)`サブクエリから構築されたセットには、新しく挿入された行のみが含まれているため、`t1`をそれに対してフィルタリングするのに役立ちます。
#### Stack Overflowの例 {#example-with-stack-overflow}

ユーザーごとの**日次バッジ**を計算するための[以前のMaterialized Viewの例](/materialized-view/incremental-materialized-view#example)を考えてみましょう。この例では、`users`テーブルからユーザーの表示名を含みます。

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

このビューは、`badges`テーブルへの挿入遅延に大きな影響を与えました。例えば、

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

上記のアプローチを使用して、このビューを最適化できます。挿入されたバッジ行のユーザーIDを使用して、`users`テーブルにフィルタを追加します：

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

これにより、初期バッジの挿入が高速化されるだけでなく：

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 132.118 sec. Processed 323.43 million rows, 4.69 GB (2.45 million rows/s., 35.49 MB/s.)
Peak memory usage: 1.99 GiB.
```

将来のバッジ挿入も効率的になります：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
```

上記の操作では、ユーザーID `2936484`のユーザーテーブルから1行のみが取得されます。このルックアップも`Id`のテーブルオーダリングキーによって最適化されています。
## Materialized ViewsとUNION {#materialized-views-and-unions}

`UNION ALL`クエリは、複数のソーステーブルからデータを単一の結果セットに結合するために一般的に使用されます。

`UNION ALL`はIncremental Materialized Viewsでは直接サポートされていませんが、各`SELECT`ブランチについて個別のMaterialized Viewを作成し、その結果を共有ターゲットテーブルに書き込むことで同じ結果を得ることができます。

例としてStack Overflowデータセットを使用します。以下の`badges`と`comments`テーブルは、ユーザーが獲得したバッジと投稿に対するコメントを表しています。

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
ORDER BY CreationDate;

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
ORDER BY UserId;
```

これらは次の`INSERT INTO`コマンドでポピュレートできます：

```sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet');
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet');
```

ユーザーの活動を統合するビューを作成したいとしましょう。これには、これら2つのテーブルを結合して各ユーザーの最終活動を示します：

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
LIMIT 10;
```

このクエリの結果を受け取るためのターゲットテーブルを作成したと仮定します。結果が正しくマージされるように、[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)テーブルエンジンと[AggregateFunction](/sql-reference/data-types/aggregatefunction)を使用します。

```sql
CREATE TABLE user_activity
(
    `UserId` String,
    `last_description` AggregateFunction(argMax, String, DateTime64(3, 'UTC')),
    `activity_type` AggregateFunction(argMax, String, DateTime64(3, 'UTC')),
    `last_activity` SimpleAggregateFunction(max, DateTime64(3, 'UTC'))
)
ENGINE = AggregatingMergeTree
ORDER BY UserId;
```

このテーブルが`badges`または`comments`に新しい行が挿入されると更新されるようにしたい場合、この問題に対する素朴なアプローチは、前述のUNIONクエリでMaterialized Viewを作成しようとすることです：

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
ORDER BY last_activity DESC;
```

これは文法的には有効ですが、意図しない結果を生じさせます - このビューは`comments`テーブルへの挿入のみをトリガーします。例えば：

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
│ 2936484 │ The answer is 42 │ comment       │ 2025-04-15 09:56:19.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.005 sec.
```

`badges`テーブルへの挿入はビューをトリガーし、`user_activity`は更新されません：

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

これを解決するために、各SELECT文のためにMaterialized Viewを作成するだけです：

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

どちらのテーブルに挿入しても、正しい結果が得られます。例えば、`comments`テーブルに挿入する場合：

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

同様に、`badges`テーブルへの挿入も`user_activity`テーブルに反映されます：

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

┌─UserId──┬─description──┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ gingerwizard │ badge         │ 2025-04-15 10:20:18.000 │
└─────────┴──────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.006 sec.
```
## 並列処理と逐次処理 {#materialized-views-parallel-vs-sequential}

前の例で示したように、1つのテーブルが複数のMaterialized Viewsのソースとして機能することができます。これらが実行される順序は、設定[`parallel_view_processing`](/operations/settings/settings#parallel_view_processing)によります。

デフォルトでは、この設定は`0` (`false`)であり、これはMaterialized Viewsが`uuid`順に逐次実行されることを意味します。

例えば、次の`source`テーブルと3つのMaterialized Viewsを考えてみましょう。それぞれは`target`テーブルに行を送信します。

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

各ビューは、`target`テーブルに行を挿入する前に1秒間一時停止することに注意してください。また、名前と挿入時間を含んでいます。

テーブル`source`に1行挿入するには約3秒かかり、各ビューが逐次実行されます：

```sql
INSERT INTO source VALUES ('test');

1 row in set. Elapsed: 3.786 sec.
```

各行の到着を`SELECT`で確認できます：

```sql
SELECT
    message,
    from,
    now
FROM target
ORDER BY now ASC;

┌─message─┬─from─┬───────────────────────────now─┐
│ test    │ mv3  │ 2025-04-15 14:52:01.306162309 │
│ test    │ mv1  │ 2025-04-15 14:52:02.307693521 │
│ test    │ mv2  │ 2025-04-15 14:52:03.309250283 │
└─────────┴──────┴───────────────────────────────┘

3 rows in set. Elapsed: 0.015 sec.
```

これは、ビューの`uuid`と一致します：

```sql
SELECT
    name,
 uuid
FROM system.tables
WHERE name IN ('mv_1', 'mv_2', 'mv_3')
ORDER BY uuid ASC;

┌─name─┬─uuid─────────────────────────────────┐
│ mv_3 │ ba5e36d0-fa9e-4fe8-8f8c-bc4f72324111 │
│ mv_1 │ b961c3ac-5a0e-4117-ab71-baa585824d43 │
│ mv_2 │ e611cc31-70e5-499b-adcc-53fb12b109f5 │
└──────┴──────────────────────────────────────┘

3 rows in set. Elapsed: 0.004 sec.
```

対照的に、`parallel_view_processing=1`を有効にして行を挿入した場合、ビューは並列に実行され、`target`テーブルに到着する行の順序は保証されません。

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
ORDER BY now ASC;

┌─message─┬─from─┬───────────────────────────now─┐
│ test    │ mv3  │ 2025-04-15 19:47:32.242937372 │
│ test    │ mv1  │ 2025-04-15 19:47:32.243058183 │
│ test    │ mv2  │ 2025-04-15 19:47:32.337921800 │
└─────────┴──────┴───────────────────────────────┘

3 rows in set. Elapsed: 0.004 sec.
```

各ビューからの行の到着順序は同じですが、これは保証されていません - 各行の挿入時間の類似性が示すように。また、挿入パフォーマンスが向上したことにも注意してください。
### 並列処理を使用する時 {#materialized-views-when-to-use-parallel}

`parallel_view_processing=1`を有効にすることで挿入スループットが大幅に向上する可能性があります。特に、単一のテーブルに複数のMaterialized Viewsが接続されている場合には特に顕著です。しかし、トレードオフを理解することが重要です：

- **挿入圧の増加**：すべてのMaterialized Viewsが同時に実行されるため、CPUとメモリの使用量が増加します。各ビューが重い計算やJOINを実行する場合、システムがオーバーロードされることがあります。
- **厳格な実行順序の必要性**：ビューの実行順序が重要な稀なワークフロー（例：連鎖する依存関係）では、並列実行が不整合な状態やレース条件につながる可能性があります。このような状況に対応する設計は可能ですが、そのようなセットアップは脆弱であり、将来のバージョンで壊れる可能性があります。

:::note 歴史的デフォルトと安定性
逐次実行は長い間デフォルトであり、部分的にエラーハンドリングの複雑さが原因でした。歴史的に、1つのMaterialized Viewの失敗が他の実行を妨げる可能性がありました。新しいバージョンでは、ブロックごとに失敗を隔離することで改善されていますが、逐次実行は依然として明確な失敗セマンティクスを提供します。
:::

一般的に、`parallel_view_processing=1`を有効にするのは以下のような場合です：

- 複数の独立したMaterialized Viewsがある場合
- 挿入パフォーマンスを最大化することを目指している場合
- 並行ビュー実行を処理するというシステムの能力を理解している場合

無効にするべき場合は：
- Materialized Viewsが相互に依存している場合
- 予測可能で秩序ある実行が要求される場合
- 挿入動作をデバッグまたは監査し、決定論的リプレイを求める場合
## Materialized Viewsと共通テーブル式（CTEs） {#materialized-views-common-table-expressions-ctes}

**再帰的でない**共通テーブル式（CTE）はMaterialized Viewsでサポートされています。

:::note 共通テーブル式は**マテリアライズされない**
ClickHouseはCTEをマテリアライズしません。代わりに、CTE定義をクエリに直接置き換え、同じ式の複数回の評価を引き起こすことがあります（CTEが複数回使用された場合）。
:::

以下の例は、各投稿タイプのデイリーアクティビティを計算します。

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

CTEはこの場合厳密には必要ありませんが、例のために、ビューは期待通りに動作します：

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet');
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
LIMIT 10;

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

ClickHouseでは、CTEがインライン化されます。これは、最適化中にCTEがクエリに効果的にコピー＆ペーストされ、**マテリアライズされない**ことを意味します。これには以下の意味があります：

- CTEがソーステーブル（Materialized Viewに接続されているテーブル）とは異なるテーブルを参照し、`JOIN`や`IN`句で使用される場合、それはサブクエリや結合のように振る舞い、トリガーにはなりません。
- Materialized Viewはメインソーステーブルへの挿入時のみトリガーされますが、CTEは挿入ごとに再実行されるため、特に参照テーブルが大きい場合には不要なオーバーヘッドが発生する可能性があります。

例えば、

```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users);
```

この場合、ユーザーCTEは各`posts`への挿入ごとに再評価され、Materialized Viewは新しいユーザーが挿入されても更新されません - 挿入が発生した場合のみ更新されます。

一般的に、Materialized Viewに接続されているソーステーブル上で機能するロジックにCTEsを使用するか、参照されるテーブルが小さく、パフォーマンスのボトルネックを引き起こさないと確信している場合にCTEを使用してください。また、[Materialized Viewsに関するJOINの最適化](/materialized-view/incremental-materialized-view#join-best-practices)を考慮するのも良いでしょう。
