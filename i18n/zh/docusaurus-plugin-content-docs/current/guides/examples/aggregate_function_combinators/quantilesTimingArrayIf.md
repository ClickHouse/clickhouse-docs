---
'slug': '/examples/aggregate-function-combinators/quantilesTimingArrayIf'
'title': 'quantilesTimingArrayIf'
'description': '使用 quantilesTimingArrayIf 组合器的示例'
'keywords':
- 'quantilesTiming'
- 'array'
- 'if'
- 'combinator'
- 'examples'
- 'quantilesTimingArrayIf'
'sidebar_label': 'quantilesTimingArrayIf'
---


# quantilesTimingArrayIf {#quantilestimingarrayif}

## Description {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 和 [`If`](/sql-reference/aggregate-functions/combinators#-if) 
组合器可应用于[`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
函数，以计算条件为真的行中数组中时间值的分位数，使用 `quantilesTimingArrayIf` 聚合组合器函数。

## Example Usage {#example-usage}

在此示例中，我们将创建一个表，存储不同端点的 API 响应时间，
并使用 `quantilesTimingArrayIf` 计算成功请求的响应时间分位数。

```sql title="Query"
CREATE TABLE api_responses(
    endpoint String,
    response_times_ms Array(UInt32),
    success_rate Float32
) ENGINE = Log;

INSERT INTO api_responses VALUES
    ('orders', [82, 94, 98, 87, 103, 92, 89, 105], 0.98),
    ('products', [45, 52, 48, 51, 49, 53, 47, 50], 0.95),
    ('users', [120, 125, 118, 122, 121, 119, 123, 124], 0.92);

SELECT
    endpoint,
    quantilesTimingArrayIf(0, 0.25, 0.5, 0.75, 0.95, 0.99, 1.0)(response_times_ms, success_rate >= 0.95) as response_time_quantiles
FROM api_responses
GROUP BY endpoint;
```

`quantilesTimingArrayIf` 函数将只计算成功率超过 95% 的端点的分位数。
返回的数组按顺序包含以下分位数：
- 0 (最小值)
- 0.25 (第一个四分位数)
- 0.5 (中位数)
- 0.75 (第三个四分位数)
- 0.95 (第 95 个百分位数)
- 0.99 (第 99 个百分位数)
- 1.0 (最大值)

```response title="Response"
   ┌─endpoint─┬─response_time_quantiles─────────────────────────────────────────────┐
1. │ orders   │ [82, 87, 92, 98, 103, 104, 105]                                     │
2. │ products │ [45, 47, 49, 51, 52, 52, 53]                                        │
3. │ users    │ [nan, nan, nan, nan, nan, nan, nan]                                 │
   └──────────┴─────────────────────────────────────────────────────────────────────┘
```

## See also {#see-also}
- [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
