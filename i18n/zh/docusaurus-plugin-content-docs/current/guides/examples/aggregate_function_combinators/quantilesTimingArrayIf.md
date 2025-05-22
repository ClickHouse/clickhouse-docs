
# quantilesTimingArrayIf {#quantilestimingarrayif}

## 描述 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 和 [`If`](/sql-reference/aggregate-functions/combinators#-if) 
组合器可以应用于[`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
函数，以计算条件为真的行中数组的计时值的分位数，
使用 `quantilesTimingArrayIf` 聚合组合器函数。

## 示例用法 {#example-usage}

在这个例子中，我们将创建一个表，以存储不同端点的 API 响应时间，
我们将使用 `quantilesTimingArrayIf` 来计算成功请求的响应时间分位数。

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

`quantilesTimingArrayIf` 函数将仅计算成功率超过 95% 的端点的分位数。
返回的数组中按顺序包含以下分位数：
- 0 (最小值)
- 0.25 (第一个四分位数)
- 0.5 (中位数)
- 0.75 (第三个四分位数)
- 0.95 (95th 百分位数)
- 0.99 (99th 百分位数)
- 1.0 (最大值)

```response title="Response"
   ┌─endpoint─┬─response_time_quantiles─────────────────────────────────────────────┐
1. │ orders   │ [82, 87, 92, 98, 103, 104, 105]                                     │
2. │ products │ [45, 47, 49, 51, 52, 52, 53]                                        │
3. │ users    │ [nan, nan, nan, nan, nan, nan, nan]                                 │
   └──────────┴─────────────────────────────────────────────────────────────────────┘
```

## 另请参阅 {#see-also}
- [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
