---
slug: '/examples/aggregate-function-combinators/avgState'
title: 'avgState'
description: 'avgStateコンビネーターの使用例'
keywords: ['avg', 'state', 'combinator', 'examples', 'avgState']
sidebar_label: 'avgState'
---


# avgState {#avgState}

## 説明 {#description}

[`State`](/sql-reference/aggregate-functions/combinators#-state) コンビネーターは、 
[`avg`](/sql-reference/aggregate-functions/reference/avg) 関数に適用され、 
`AggregateFunction(avg, T)` 型の中間状態を生成します。ここで、`T` は 
平均値のために指定された型です。

## 使用例 {#example-usage}

この例では、`AggregateFunction` 型を使用し、`avgState` 関数を 
利用してウェブサイトのトラフィックデータを集約する方法を見ていきます。

まず、ウェブサイトのトラフィックデータのソーステーブルを作成します：

```sql
CREATE TABLE raw_page_views
(
    page_id UInt32,
    page_name String,
    response_time_ms UInt32,  -- ページの応答時間（ミリ秒単位）
    viewed_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (page_id, viewed_at);
```

次に、平均応答時間を保存する集約テーブルを作成します。 
`avg` は複雑な状態（合計とカウント）が必要なため、`SimpleAggregateFunction` 型を 
使用することができません。そのため、`AggregateFunction` 型を使用します：

```sql
CREATE TABLE page_performance
(
    page_id UInt32,
    page_name String,
    avg_response_time AggregateFunction(avg, UInt32)  -- avg計算に必要な状態を保存
)
ENGINE = AggregatingMergeTree()
ORDER BY page_id;
```

新しいデータに対する挿入トリガーとして機能し、上記で定義したターゲットテーブルに中間状態データを保存する 
インクリメンタルマテリアライズドビューを作成します：

```sql
CREATE MATERIALIZED VIEW page_performance_mv
TO page_performance
AS SELECT
    page_id,
    page_name,
    avgState(response_time_ms) AS avg_response_time  -- -Stateコンビネーターの使用
FROM raw_page_views
GROUP BY page_id, page_name;
```

ソーステーブルに初期データを挿入し、ディスク上にパーツを作成します：

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
    (1, 'Homepage', 120),
    (1, 'Homepage', 135),
    (2, 'Products', 95),
    (2, 'Products', 105),
    (3, 'About', 80),
    (3, 'About', 90);
```

もう少しデータを挿入して、ディスク上に二つ目のパーツを作成します：

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
(1, 'Homepage', 150),
(2, 'Products', 110),
(3, 'About', 70),
(4, 'Contact', 60),
(4, 'Contact', 65);
```

ターゲットテーブル `page_performance` を調べます：

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

`avg_response_time` カラムの型は `AggregateFunction(avg, UInt32)` であり、中間状態情報を保存しています。さらに、 
`avg_response_time` の行データは私たちには役立たないものであり、`�, n, F, }` のような奇妙な文字が表示されます。 
これは、端末がバイナリデータをテキストとして表示しようとした結果です。この理由は、`AggregateFunction` 型が 
効率的なストレージと計算のために最適化されたバイナリ形式で状態を保存しているためであり、人間が読みやすくする 
ためではありません。このバイナリ状態には、平均値を計算するために必要なすべての情報が含まれています。

これを利用するために、`Merge` コンビネーターを使用します：

```sql
SELECT
    page_id,
    page_name,
    avgMerge(avg_response_time) AS average_response_time_ms
FROM page_performance
GROUP BY page_id, page_name
ORDER BY page_id;
```

これで正しい平均値が表示されます：

```response
┌─page_id─┬─page_name─┬─average_response_time_ms─┐
│       1 │ Homepage  │                      135 │
│       2 │ Products  │       103.33333333333333 │
│       3 │ About     │                       80 │
│       4 │ Contact   │                     62.5 │
└─────────┴───────────┴──────────────────────────┘
```

## 参照 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`State`](/sql-reference/aggregate-functions/combinators#-state)
