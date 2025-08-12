---
slug: '/examples/aggregate-function-combinators/avgState'
title: 'avgState'
description: 'avgState combinatorの使用例'
keywords:
- 'avg'
- 'state'
- 'combinator'
- 'examples'
- 'avgState'
sidebar_label: 'avgState'
---




# avgState {#avgState}

## 説明 {#description}

[`State`](/sql-reference/aggregate-functions/combinators#-state) コンビネータは、[`avg`](/sql-reference/aggregate-functions/reference/avg) 関数に適用でき、`AggregateFunction(avg, T)` 型の中間状態を生成します。ここで `T` は、平均のために指定された型です。

## 使用例 {#example-usage}

この例では、`AggregateFunction` 型をどのように使用し、`avgState` 関数と組み合わせてウェブサイトのトラフィックデータを集計するかを見ていきます。

まず、ウェブサイトのトラフィックデータのためのソーステーブルを作成します。

```sql
CREATE TABLE raw_page_views
(
    page_id UInt32,
    page_name String,
    response_time_ms UInt32,  -- ページ応答時間（ミリ秒）
    viewed_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (page_id, viewed_at);
```

次に、平均応答時間を保存する集約テーブルを作成します。`avg` は複雑な状態（合計とカウント）を必要とするため、`SimpleAggregateFunction` 型を使用できません。そのため、`AggregateFunction` 型を使用します。

```sql
CREATE TABLE page_performance
(
    page_id UInt32,
    page_name String,
    avg_response_time AggregateFunction(avg, UInt32)  -- avg 計算に必要な状態を保存
)
ENGINE = AggregatingMergeTree()
ORDER BY page_id;
```

新しいデータの挿入トリガーとして機能し、上記で定義されたターゲットテーブルに中間状態データを保存するインクリメンタルマテリアライズドビューを作成します。

```sql
CREATE MATERIALIZED VIEW page_performance_mv
TO page_performance
AS SELECT
    page_id,
    page_name,
    avgState(response_time_ms) AS avg_response_time  -- -State コンビネータを使用
FROM raw_page_views
GROUP BY page_id, page_name;
```

ソーステーブルに初期データを挿入し、ディスク上にパーツを作成します。

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
    (1, 'Homepage', 120),
    (1, 'Homepage', 135),
    (2, 'Products', 95),
    (2, 'Products', 105),
    (3, 'About', 80),
    (3, 'About', 90);
```

ディスク上に2番目のパーツを作成するためにさらにデータを挿入します。

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
(1, 'Homepage', 150),
(2, 'Products', 110),
(3, 'About', 70),
(4, 'Contact', 60),
(4, 'Contact', 65);
```

ターゲットテーブル `page_performance` を確認します。

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

`avg_response_time` カラムは `AggregateFunction(avg, UInt32)` タイプであり、中間状態情報を保存していることに注意してください。また、`avg_response_time` の行データは私たちにとって有用ではなく、`�, n, F, }` などの奇妙な文字が表示されています。これは端末がバイナリデータをテキストとして表示しようとしたためです。この理由は、`AggregateFunction` 型が状態を効率的な保存と計算のために最適化されたバイナリ形式で保存し、人間が読めない形式であるためです。このバイナリ状態は平均を計算するために必要なすべての情報を含んでいます。

これを利用するには、`Merge` コンビネータを使用します。

```sql
SELECT
    page_id,
    page_name,
    avgMerge(avg_response_time) AS average_response_time_ms
FROM page_performance
GROUP BY page_id, page_name
ORDER BY page_id;
```

これで正しい平均が表示されます。

```response
┌─page_id─┬─page_name─┬─average_response_time_ms─┐
│       1 │ Homepage  │                      135 │
│       2 │ Products  │       103.33333333333333 │
│       3 │ About     │                       80 │
│       4 │ Contact   │                     62.5 │
└─────────┴───────────┴──────────────────────────┘
```

## 関連項目 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`State`](/sql-reference/aggregate-functions/combinators#-state)
