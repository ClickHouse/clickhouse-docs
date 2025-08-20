---
slug: '/examples/aggregate-function-combinators/quantilesTimingIf'
title: 'quantilesTimingIf'
description: '使用quantilesTimingIf結合子的示例'
keywords:
- 'quantilesTiming'
- 'if'
- 'combinator'
- 'examples'
- 'quantilesTimingIf'
sidebar_label: 'quantilesTimingIf'
---




# quantilesTimingIf {#quantilestimingif}

## Description {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if)コンビネータは、`quantilesTiming`関数に適用でき、条件が真である行のタイミング値の分位数を計算するために、`quantilesTimingIf`集計コンビネータ関数を使用します。

## Example Usage {#example-usage}

この例では、異なるエンドポイントのAPI応答時間を格納するテーブルを作成し、成功したリクエストの応答時間の分位数を計算するために`quantilesTimingIf`を使用します。

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

`quantilesTimingIf`関数は、成功したリクエスト（is_successful = 1）のみに対して分位数を計算します。返される配列には、次の順序で分位数が含まれます：
- 0 （最小値）
- 0.25 （第一四分位数）
- 0.5 （中央値）
- 0.75 （第三四分位数）
- 0.95 （95パーセンタイル）
- 0.99 （99パーセンタイル）
- 1.0 （最大値）

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
