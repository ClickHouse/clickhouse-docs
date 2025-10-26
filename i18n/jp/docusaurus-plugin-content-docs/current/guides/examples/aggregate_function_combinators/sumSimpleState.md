---
'slug': '/examples/aggregate-function-combinators/sumSimpleState'
'title': 'sumSimpleState'
'description': 'sumSimpleState コムビネーターの使用例'
'keywords':
- 'sum'
- 'state'
- 'simple'
- 'combinator'
- 'examples'
- 'sumSimpleState'
'sidebar_label': 'sumSimpleState'
'doc_type': 'reference'
---


# sumSimpleState {#sumsimplestate}

## 説明 {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) コンビネータは [`sum`](/sql-reference/aggregate-functions/reference/sum) 関数に適用でき、すべての入力値の合計を返します。結果は [`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction) タイプで返されます。

## 使用例 {#example-usage}

### 上昇票と下降票の追跡 {#tracking-post-votes}

投稿に対する票を追跡するテーブルを使用した実用例を見てみましょう。各投稿について、上昇票、下降票、および全体スコアの累計を維持したいと考えています。`SimpleAggregateFunction` タイプを使用した sum は、集計の全状態を保持するのではなく、累計のみを保存するため、このユースケースに適しています。その結果、処理が高速になり、部分的な集計状態のマージが不要になります。

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

次に、集計データを保存するターゲットテーブルを作成します:

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

その後、`SimpleAggregateFunction` タイプのカラムを持つマテリアライズドビューを作成します:
       
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

`SimpleState` コンビネータを使用してマテリアライズドビューにクエリを実行します:

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

## 参照 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
