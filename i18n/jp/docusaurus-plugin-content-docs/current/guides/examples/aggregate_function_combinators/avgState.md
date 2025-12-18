---
slug: '/examples/aggregate-function-combinators/avgState'
title: 'avgState'
description: 'avgState コンビネータの使用例'
keywords: ['avg', 'state', 'combinator', 'examples', 'avgState']
sidebar_label: 'avgState'
doc_type: 'reference'
---

# avgState {#avgState}

## 説明 {#description}

[`State`](/sql-reference/aggregate-functions/combinators#-state) コンビネータは、
[`avg`](/sql-reference/aggregate-functions/reference/avg) 関数に適用することで、
`AggregateFunction(avg, T)` 型の中間状態を生成できます。ここで `T` は、
平均の計算対象の型として指定された型です。

## 使用例 {#example-usage}

この例では、`AggregateFunction` 型と `avgState` 関数を組み合わせて、
ウェブサイトのトラフィックデータを集計する方法を見ていきます。

まず、ウェブサイトのトラフィックデータ用のソーステーブルを作成します。

```sql
CREATE TABLE raw_page_views
(
    page_id UInt32,
    page_name String,
    response_time_ms UInt32,  -- Page response time in milliseconds
    viewed_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (page_id, viewed_at);
```

平均応答時間を格納する集約テーブルを作成します。なお、`avg` は複合的な状態（合計値とカウント）を必要とするため、`SimpleAggregateFunction` 型は使用できません。そのため、`AggregateFunction` 型を使用します。

```sql
CREATE TABLE page_performance
(
    page_id UInt32,
    page_name String,
    avg_response_time AggregateFunction(avg, UInt32)  -- Stores the state needed for avg calculation
)
ENGINE = AggregatingMergeTree()
ORDER BY page_id;
```

増分更新マテリアライズドビューを作成します。このビューは新しいデータに対する挿入トリガーとして機能し、上で定義した対象テーブルに中間状態のデータを保存します。

```sql
CREATE MATERIALIZED VIEW page_performance_mv
TO page_performance
AS SELECT
    page_id,
    page_name,
    avgState(response_time_ms) AS avg_response_time  -- Using -State combinator
FROM raw_page_views
GROUP BY page_id, page_name;
```

ソーステーブルに初期データを挿入して、ディスク上にパーツを作成します:

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
    (1, 'Homepage', 120),
    (1, 'Homepage', 135),
    (2, 'Products', 95),
    (2, 'Products', 105),
    (3, 'About', 80),
    (3, 'About', 90);
```

ディスク上に2つ目のパートを作成するため、データをもう少し挿入します。

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
(1, 'Homepage', 150),
(2, 'Products', 110),
(3, 'About', 70),
(4, 'Contact', 60),
(4, 'Contact', 65);
```

ターゲットテーブル `page_performance` を確認します:

```sql
SELECT 
    page_id,
    page_name,
    avg_response_time,
    toTypeName(avg_response_time)
FROM page_performance
```

```response
┌─page_id─┬─page_name─┬─avg_response_time─┬─toTypeName(avg_response_time)──┐
│       1 │ Homepage  │ �                 │ AggregateFunction(avg, UInt32) │
│       2 │ Products  │ �                 │ AggregateFunction(avg, UInt32) │
│       3 │ About     │ �                 │ AggregateFunction(avg, UInt32) │
│       1 │ Homepage  │ �                 │ AggregateFunction(avg, UInt32) │
│       2 │ Products  │ n                 │ AggregateFunction(avg, UInt32) │
│       3 │ About     │ F                 │ AggregateFunction(avg, UInt32) │
│       4 │ Contact   │ }                 │ AggregateFunction(avg, UInt32) │
└─────────┴───────────┴───────────────────┴────────────────────────────────┘
```

`avg_response_time` 列は型 `AggregateFunction(avg, UInt32)` であり、
中間状態の情報を保持している点に注意してください。また、`avg_response_time`
に対応する行データは私たちにとって有用ではなく、`�, n, F, }` のような
奇妙な文字が表示されることにも気付くはずです。これは、ターミナルが
バイナリデータをテキストとして表示しようとした結果です。その理由は、
`AggregateFunction` 型が、その状態を人間の可読性ではなく、効率的な保存と
計算のために最適化されたバイナリ形式で保持しているためです。このバイナリ状態には、
平均値を計算するために必要なすべての情報が含まれています。

これを利用するには、`Merge` コンビネータを使用してください。

```sql
SELECT
    page_id,
    page_name,
    avgMerge(avg_response_time) AS average_response_time_ms
FROM page_performance
GROUP BY page_id, page_name
ORDER BY page_id;
```

これで正しい平均値が得られます。

```response
┌─page_id─┬─page_name─┬─average_response_time_ms─┐
│       1 │ Homepage  │                      135 │
│       2 │ Products  │       103.33333333333333 │
│       3 │ About     │                       80 │
│       4 │ Contact   │                     62.5 │
└─────────┴───────────┴──────────────────────────┘
```

## 関連情報 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`State`](/sql-reference/aggregate-functions/combinators#-state)
