---
'slug': '/examples/aggregate-function-combinators/quantilesTimingIf'
'title': 'quantilesTimingIf'
'description': 'quantilesTimingIf コンビネータを使用した例'
'keywords':
- 'quantilesTiming'
- 'if'
- 'combinator'
- 'examples'
- 'quantilesTimingIf'
'sidebar_label': 'quantilesTimingIf'
'doc_type': 'reference'
---


# quantilesTimingIf {#quantilestimingif}

## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネータは、行が条件を満たす場合のタイミング値の分位数を計算するために [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming) 関数に適用できます。これを使用して、`quantilesTimingIf` 集約コンビネータ関数を利用します。

## 使用例 {#example-usage}

この例では、異なるエンドポイントのAPI応答時間を保存するテーブルを作成し、成功したリクエストの応答時間の分位数を計算するために `quantilesTimingIf` を使用します。

```sql title="Query"
CREATE TABLE api_responses(
    endpoint String,
    response_time_ms UInt32,
    is_successful UInt8
) ENGINE = Log;

INSERT INTO api_responses VALUES
    ('orders', 82, 1),
    ('orders', 94, 1),
    ('orders', 98, 1),
    ('orders', 87, 1),
    ('orders', 103, 1),
    ('orders', 92, 1),
    ('orders', 89, 1),
    ('orders', 105, 1),
    ('products', 45, 1),
    ('products', 52, 1),
    ('products', 48, 1),
    ('products', 51, 1),
    ('products', 49, 1),
    ('products', 53, 1),
    ('products', 47, 1),
    ('products', 50, 1),
    ('users', 120, 0),
    ('users', 125, 0),
    ('users', 118, 0),
    ('users', 122, 0),
    ('users', 121, 0),
    ('users', 119, 0),
    ('users', 123, 0),
    ('users', 124, 0);

SELECT
    endpoint,
    quantilesTimingIf(0, 0.25, 0.5, 0.75, 0.95, 0.99, 1.0)(response_time_ms, is_successful = 1) as response_time_quantiles
FROM api_responses
GROUP BY endpoint;
```

`quantilesTimingIf` 関数は、成功したリクエスト（is_successful = 1）のみ分位数を計算します。返される配列には、以下の分位数が順番に含まれています：
- 0 (最小値)
- 0.25 (第1四分位数)
- 0.5 (中央値)
- 0.75 (第3四分位数)
- 0.95 (95パーセンタイル)
- 0.99 (99パーセンタイル)
- 1.0 (最大値)

```response title="Response"
   ┌─endpoint─┬─response_time_quantiles─────────────────────────────────────────────┐
1. │ orders   │ [82, 87, 92, 98, 103, 104, 105]                                     │
2. │ products │ [45, 47, 49, 51, 52, 52, 53]                                        │
3. │ users    │ [nan, nan, nan, nan, nan, nan, nan]                                 │
   └──────────┴─────────────────────────────────────────────────────────────────────┘
```

## 参照 {#see-also}
- [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
