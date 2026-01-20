---
slug: '/examples/aggregate-function-combinators/sumSimpleState'
title: 'sumSimpleState'
description: 'sumSimpleState 集約関数コンビネータの使用例'
keywords: ['合計', '状態', 'シンプル', 'コンビネータ', '例', 'sumSimpleState']
sidebar_label: 'sumSimpleState'
doc_type: 'reference'
---

# sumSimpleState \{#sumsimplestate\}

## 説明 \{#description\}

[`sum`](/sql-reference/aggregate-functions/reference/sum) 関数に [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) コンビネータを適用すると、すべての入力値の合計を返します。戻り値の型は [`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction) です。

## 使用例 \{#example-usage\}

### 賛成票と反対票のトラッキング \{#tracking-post-votes\}

投稿に対する投票を追跡するテーブルを使った、実践的な例を見ていきます。
各投稿ごとに、賛成票、反対票、および全体スコアの累積合計を保持したいとします。
このユースケースでは、集計の全状態ではなく累積合計だけを保存すればよいので、
`SimpleAggregateFunction` 型に `sum` を組み合わせて使うのが適しています。
これにより処理が高速になり、部分的な集計状態をマージする必要もなくなります。

まず、生データ用のテーブルを作成します。

```sql title="Query"
CREATE TABLE raw_votes
(
    post_id UInt32,
    vote_type Enum8('upvote' = 1, 'downvote' = -1)
)
ENGINE = MergeTree()
ORDER BY post_id;
```

次に、集約されたデータを格納するターゲットテーブルを作成します。

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

次に、`SimpleAggregateFunction` 型の列を持つマテリアライズドビューを作成します。

```sql
CREATE MATERIALIZED VIEW mv_vote_processor TO vote_aggregates
AS
SELECT
  post_id,
  -- Initial value for sum state (1 if upvote, 0 otherwise)
  toUInt64(vote_type = 'upvote') AS upvotes,
  -- Initial value for sum state (1 if downvote, 0 otherwise)
  toUInt64(vote_type = 'downvote') AS downvotes,
  -- Initial value for sum state (1 for upvote, -1 for downvote)
  toInt64(vote_type) AS score
FROM raw_votes;
```

サンプルデータを挿入する：

```sql
INSERT INTO raw_votes VALUES
    (1, 'upvote'),
    (1, 'upvote'),
    (1, 'downvote'),
    (2, 'upvote'),
    (2, 'downvote'),
    (3, 'downvote');
```

`SimpleState` コンビネータを使用してマテリアライズドビューに対してクエリを実行します：

```sql
SELECT
  post_id,
  sum(upvotes) AS total_upvotes,
  sum(downvotes) AS total_downvotes,
  sum(score) AS total_score
FROM vote_aggregates -- Query the target table
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

## 関連項目 \{#see-also\}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
