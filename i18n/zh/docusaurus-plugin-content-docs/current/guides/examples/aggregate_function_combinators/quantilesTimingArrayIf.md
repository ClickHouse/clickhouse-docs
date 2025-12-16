---
slug: '/examples/aggregate-function-combinators/quantilesTimingArrayIf'
title: 'quantilesTimingArrayIf'
description: 'quantilesTimingArrayIf 组合器使用示例'
keywords: ['quantilesTiming', 'array', 'if', 'combinator', 'examples', 'quantilesTimingArrayIf']
sidebar_label: 'quantilesTimingArrayIf'
doc_type: 'reference'
---

# quantilesTimingArrayIf {#quantilestimingarrayif}

## 描述 {#description}

可以将 [`Array`](/sql-reference/aggregate-functions/combinators#-array) 和 [`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器应用于 [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming) 函数，使用 `quantilesTimingArrayIf` 聚合组合器函数，对条件为真的行中数组里的时间值计算分位数。

## 使用示例 {#example-usage}

在本示例中，我们将创建一张表，用于存储不同接口的 API 响应时间，
并使用 `quantilesTimingArrayIf` 来计算成功请求的响应时间分位数。

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

`quantilesTimingArrayIf` 函数只会对成功率超过 95% 的端点计算分位数。
返回的数组按以下顺序包含这些分位数：

* 0（最小值）
* 0.25（第一四分位数）
* 0.5（中位数）
* 0.75（第三四分位数）
* 0.95（第 95 百分位）
* 0.99（第 99 百分位）
* 1.0（最大值）

```response title="Response"
   ┌─endpoint─┬─response_time_quantiles─────────────────────────────────────────────┐
1. │ orders   │ [82, 87, 92, 98, 103, 104, 105]                                     │
2. │ products │ [45, 47, 49, 51, 52, 52, 53]                                        │
3. │ users    │ [nan, nan, nan, nan, nan, nan, nan]                                 │
   └──────────┴─────────────────────────────────────────────────────────────────────┘
```

## 另请参阅 {#see-also}
- [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
- [`If 组合器`](/sql-reference/aggregate-functions/combinators#-if)
