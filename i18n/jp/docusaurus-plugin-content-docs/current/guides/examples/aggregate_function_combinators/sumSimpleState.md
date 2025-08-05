---
slug: '/examples/aggregate-function-combinators/sumSimpleState'
title: 'sumSimpleState'
description: 'sumSimpleStateコンビネータの使用例'
keywords:
- 'sum'
- 'state'
- 'simple'
- 'combinator'
- 'examples'
- 'sumSimpleState'
sidebar_label: 'sumSimpleState'
---





# sumSimpleState {#sumsimplestate}

## 説明 {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 組み合わせ子は、[`sum`](/sql-reference/aggregate-functions/reference/sum) 関数に適用され、すべての入力値の合計を返します。結果は[`SimpleAggregateFunction`](/sql-reference/data-types/simpleaggregatefunction)型で返されます。

## 使用例 {#example-usage}

### 投票の追跡 {#tracking-post-votes}

投稿に対する投票を追跡するテーブルを使用した実用的な例を見てみましょう。各投稿について、アップボート（賛成票）、ダウンボート（反対票）、および全体のスコアの累計を維持したいと考えています。合計を計算するために`SimpleAggregateFunction`型を使用することは、集計の全体の状態を保持する必要がないため、このユースケースに適しています。その結果、より迅速に処理でき、部分的な集約状態のマージを必要としません。

まず、原データ用のテーブルを作成します：

```sql title="Query"
CREATE TABLE raw_votes
(
    post_id UInt32,
    vote_type Enum8('upvote' = 1, 'downvote' = -1)
)
ENGINE = MergeTree()
ORDER BY post_id;
```

次に、集計データを保存するターゲットテーブルを作成します：

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

次に、`SimpleAggregateFunction`型のカラムを持つMaterialized Viewを作成します：

```sql
CREATE MATERIALIZED VIEW mv_vote_processor TO vote_aggregates
AS
SELECT
  post_id,
  -- 合計状態の初期値（アップボートの場合は1、そうでなければ0）
  toUInt64(vote_type = 'upvote') AS upvotes,
  -- 合計状態の初期値（ダウンボートの場合は1、そうでなければ0）
  toUInt64(vote_type = 'downvote') AS downvotes,
  -- 合計状態の初期値（アップボートの場合は1、ダウンボートの場合は-1）
  toInt64(vote_type) AS score
FROM raw_votes;
```

サンプルデータを挿入します：

```sql
INSERT INTO raw_votes VALUES
    (1, 'upvote'),
    (1, 'upvote'),
    (1, 'downvote'),
    (2, 'upvote'),
    (2, 'downvote'),
    (3, 'downvote');
```

`SimpleState` 組み合わせ子を使用して Materialized View にクエリを実行します：

```sql
SELECT
  post_id,
  sum(upvotes) AS total_upvotes,
  sum(downvotes) AS total_downvotes,
  sum(score) AS total_score
FROM vote_aggregates -- ターゲットテーブルにクエリ
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

## 関連情報 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
