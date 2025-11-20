---
slug: '/examples/aggregate-function-combinators/avgState'
title: 'avgState'
description: 'avgState コンビネーターの使用例'
keywords: ['avg', 'state', 'combinator', 'examples', 'avgState']
sidebar_label: 'avgState'
doc_type: 'reference'
---



# avgState {#avgState}


## 説明 {#description}

[`State`](/sql-reference/aggregate-functions/combinators#-state)コンビネータを[`avg`](/sql-reference/aggregate-functions/reference/avg)関数に適用すると、`AggregateFunction(avg, T)`型の中間状態が生成されます。ここで`T`は平均値の計算に使用される型です。


## 使用例 {#example-usage}

この例では、`AggregateFunction`型を`avgState`関数と組み合わせて使用し、ウェブサイトのトラフィックデータを集計する方法を説明します。

まず、ウェブサイトのトラフィックデータ用のソーステーブルを作成します:

```sql
CREATE TABLE raw_page_views
(
    page_id UInt32,
    page_name String,
    response_time_ms UInt32,  -- ページのレスポンス時間(ミリ秒)
    viewed_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (page_id, viewed_at);
```

平均レスポンス時間を格納する集計テーブルを作成します。`avg`は複雑な状態(合計とカウント)を必要とするため、`SimpleAggregateFunction`型を使用できないことに注意してください。そのため、`AggregateFunction`型を使用します:

```sql
CREATE TABLE page_performance
(
    page_id UInt32,
    page_name String,
    avg_response_time AggregateFunction(avg, UInt32)  -- avg計算に必要な状態を格納
)
ENGINE = AggregatingMergeTree()
ORDER BY page_id;
```

新しいデータの挿入トリガーとして機能し、上記で定義したターゲットテーブルに中間状態データを格納するインクリメンタルマテリアライズドビューを作成します:

```sql
CREATE MATERIALIZED VIEW page_performance_mv
TO page_performance
AS SELECT
    page_id,
    page_name,
    avgState(response_time_ms) AS avg_response_time  -- -Stateコンビネータを使用
FROM raw_page_views
GROUP BY page_id, page_name;
```

ソーステーブルに初期データを挿入し、ディスク上にパートを作成します:

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
    (1, 'Homepage', 120),
    (1, 'Homepage', 135),
    (2, 'Products', 95),
    (2, 'Products', 105),
    (3, 'About', 80),
    (3, 'About', 90);
```

さらにデータを挿入して、ディスク上に2つ目のパートを作成します:

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
(1, 'Homepage', 150),
(2, 'Products', 110),
(3, 'About', 70),
(4, 'Contact', 60),
(4, 'Contact', 65);
```

ターゲットテーブル`page_performance`を確認します:

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

`avg_response_time`カラムが`AggregateFunction(avg, UInt32)`型であり、中間状態情報を格納していることに注目してください。また、`avg_response_time`の行データは有用ではなく、`�, n, F, }`のような奇妙なテキスト文字が表示されます。これは、ターミナルがバイナリデータをテキストとして表示しようとしているためです。`AggregateFunction`型は、効率的なストレージと計算のために最適化されたバイナリ形式で状態を格納しており、人間が読めるようには設計されていません。このバイナリ状態には、平均を計算するために必要なすべての情報が含まれています。

これを利用するには、`Merge`コンビネータを使用します:

```sql
SELECT
    page_id,
    page_name,
    avgMerge(avg_response_time) AS average_response_time_ms
FROM page_performance
GROUP BY page_id, page_name
ORDER BY page_id;
```

これで正しい平均値が表示されます:


```response
┌─page_id─┬─page_name─┬─average_response_time_ms─┐
│       1 │ ホームページ  │                      135 │
│       2 │ 製品  │       103.33333333333333 │
│       3 │ 概要     │                       80 │
│       4 │ お問い合わせ   │                     62.5 │
└─────────┴───────────┴──────────────────────────┘
```


## 関連項目 {#see-also}

- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`State`](/sql-reference/aggregate-functions/combinators#-state)
