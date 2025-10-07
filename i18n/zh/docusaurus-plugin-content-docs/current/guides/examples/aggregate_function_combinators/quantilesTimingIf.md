---
'slug': '/examples/aggregate-function-combinators/quantilesTimingIf'
'title': 'quantilesTimingIf'
'description': '使用 quantilesTimingIf 组合器的示例'
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

## 描述 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可以应用于 [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming) 函数，以计算条件为真的行的时间值分位数，使用 `quantilesTimingIf` 聚合组合器函数。

## 示例用法 {#example-usage}

在这个例子中，我们将创建一个表，用于存储不同端点的 API 响应时间，我们将使用 `quantilesTimingIf` 计算成功请求的响应时间分位数。

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

`quantilesTimingIf` 函数将仅计算成功请求的分位数 (is_successful = 1)。返回的数组包含以下按顺序排列的分位数：
- 0 (最小值)
- 0.25 (第一个四分位数)
- 0.5 (中位数)
- 0.75 (第三个四分位数)
- 0.95 (第95百分位数)
- 0.99 (第99百分位数)
- 1.0 (最大值)

```response title="Response"
   ┌─endpoint─┬─response_time_quantiles─────────────────────────────────────────────┐
1. │ orders   │ [82, 87, 92, 98, 103, 104, 105]                                     │
2. │ products │ [45, 47, 49, 51, 52, 52, 53]                                        │
3. │ users    │ [nan, nan, nan, nan, nan, nan, nan]                                 │
   └──────────┴─────────────────────────────────────────────────────────────────────┘
```

## 参见 {#see-also}
- [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
- [`If 组合器`](/sql-reference/aggregate-functions/combinators#-if)
