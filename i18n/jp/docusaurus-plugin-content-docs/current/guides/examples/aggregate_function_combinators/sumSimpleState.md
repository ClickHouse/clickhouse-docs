---
slug: '/examples/aggregate-function-combinators/sumSimpleState'
title: 'sumSimpleState'
description: 'sumSimpleState コンビネータの使用例'
keywords: ['sum', 'state', 'simple', 'combinator', 'examples', 'sumSimpleState']
sidebar_label: 'sumSimpleState'
doc_type: 'reference'
---



# sumSimpleState {#sumsimplestate}


## 説明 {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate)コンビネータを[`sum`](/sql-reference/aggregate-functions/reference/sum)関数に適用することで、すべての入力値の合計を返すことができます。結果は[`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction)型で返されます。


## 使用例 {#example-usage}

### 賛成票と反対票の追跡 {#tracking-post-votes}

投稿に対する投票を追跡するテーブルを使用した実用的な例を見てみましょう。
各投稿について、賛成票、反対票、および総合スコアの累計を維持する必要があります。`SimpleAggregateFunction`型とsumを使用することは、このユースケースに適しています。集計の完全な状態ではなく、累計のみを保存すればよいためです。その結果、処理が高速になり、部分的な集計状態のマージが不要になります。

まず、生データ用のテーブルを作成します:

```sql title="Query"
CREATE TABLE raw_votes
(
    post_id UInt32,
    vote_type Enum8('upvote' = 1, 'downvote' = -1)
)
ENGINE = MergeTree()
ORDER BY post_id;
```

次に、集計データを格納するターゲットテーブルを作成します:

```sql
CREATE TABLE vote_aggregates
(
    post_id UInt32,
    upvotes SimpleAggregateFunction(sum, UInt64),
    downvotes SimpleAggregateFunction(sum, UInt64),
    score SimpleAggregateFunction(sum, Int64)
)
ENGINE = AggregatingMergeTree()
ORDER BY post_id;
```

次に、`SimpleAggregateFunction`型のカラムを持つマテリアライズドビューを作成します:

```sql
CREATE MATERIALIZED VIEW mv_vote_processor TO vote_aggregates
AS
SELECT
  post_id,
  -- sum状態の初期値(賛成票の場合は1、それ以外は0)
  toUInt64(vote_type = 'upvote') AS upvotes,
  -- sum状態の初期値(反対票の場合は1、それ以外は0)
  toUInt64(vote_type = 'downvote') AS downvotes,
  -- sum状態の初期値(賛成票の場合は1、反対票の場合は-1)
  toInt64(vote_type) AS score
FROM raw_votes;
```

サンプルデータを挿入します:

```sql
INSERT INTO raw_votes VALUES
    (1, 'upvote'),
    (1, 'upvote'),
    (1, 'downvote'),
    (2, 'upvote'),
    (2, 'downvote'),
    (3, 'downvote');
```

`SimpleState`コンビネータを使用してマテリアライズドビューをクエリします:

```sql
SELECT
  post_id,
  sum(upvotes) AS total_upvotes,
  sum(downvotes) AS total_downvotes,
  sum(score) AS total_score
FROM vote_aggregates -- ターゲットテーブルをクエリ
GROUP BY post_id
ORDER BY post_id ASC;
```

```response
┌─post_id─┬─total_upvotes─┬─total_downvotes─┬─total_score─┐
│       1 │             2 │               1 │           1 │
│       2 │             1 │               1 │           0 │
│       3 │             0 │               1 │          -1 │
└─────────┴───────────────┴─────────────────┴─────────────┘
```


## 関連項目 {#see-also}

- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
