---
'slug': '/examples/aggregate-function-combinators/avgState'
'title': 'avgState'
'description': 'avgState コミネータを使用した例'
'keywords':
- 'avg'
- 'state'
- 'combinator'
- 'examples'
- 'avgState'
'sidebar_label': 'avgState'
'doc_type': 'reference'
---


# avgState {#avgState}

## 説明 {#description}

[`State`](/sql-reference/aggregate-functions/combinators#-state) コンビネータは、[`avg`](/sql-reference/aggregate-functions/reference/avg) 関数に適用することができ、`AggregateFunction(avg, T)`タイプの中間状態を生成します。ここで `T` は指定された平均の型です。

## 使用例 {#example-usage}

この例では、`AggregateFunction`タイプをどのように使用し、`avgState`関数とともにウェブサイトのトラフィックデータを集約するかを見ていきます。

最初に、ウェブサイトのトラフィックデータのソーステーブルを作成します：

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

平均応答時間を保存する集約テーブルを作成します。`avg`は複雑な状態（合計とカウント）を必要とするため、`SimpleAggregateFunction`タイプを使用できないため、`AggregateFunction`タイプを使用します：

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

新しいデータの挿入トリガーとして機能し、上で定義されたターゲットテーブルに中間状態データを保存する増分マテリアライズドビューを作成します：

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

さらにデータを挿入して、ディスク上に二つ目のパーツを作成します：

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
(1, 'Homepage', 150),
(2, 'Products', 110),
(3, 'About', 70),
(4, 'Contact', 60),
(4, 'Contact', 65);
```

ターゲットテーブル`page_performance`を調査します：

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

`avg_response_time`カラムが`AggregateFunction(avg, UInt32)`型であり、中間状態情報を保存していることに注意してください。また、`avg_response_time`の行データは私たちにとって有用ではなく、`�, n, F, }`のような奇妙なテキスト文字が表示されます。これはターミナルがバイナリデータをテキストとして表示しようとするためです。この理由は、`AggregateFunction`タイプが状態を効率的なストレージと計算のために最適化されたバイナリ形式で保存しているためで、人間が読める形式ではありません。このバイナリ状態には、平均を計算するために必要なすべての情報が含まれています。

これを利用するために、`Merge`コンビネータを使用します：

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
