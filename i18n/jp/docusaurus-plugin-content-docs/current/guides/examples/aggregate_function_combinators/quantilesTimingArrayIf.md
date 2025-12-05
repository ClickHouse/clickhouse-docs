---
slug: '/examples/aggregate-function-combinators/quantilesTimingArrayIf'
title: 'quantilesTimingArrayIf'
description: 'quantilesTimingArrayIf コンビネータの使用例'
keywords: ['quantilesTiming', 'array', 'if', 'combinator', 'examples', 'quantilesTimingArrayIf']
sidebar_label: 'quantilesTimingArrayIf'
doc_type: 'reference'
---



# quantilesTimingArrayIf {#quantilestimingarrayif}



## 説明 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) および [`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネーターは、[`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
関数に適用して、`quantilesTimingArrayIf` 集約コンビネーター関数を使用し、条件が真である行に対する配列内のタイミング値の分位数を計算できます。



## 使用例 {#example-usage}

この例では、さまざまなエンドポイントの API 応答時間を格納するテーブルを作成し、
`quantilesTimingArrayIf` を使用して、成功したリクエストの応答時間の分位数を計算します。

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

`quantilesTimingArrayIf` 関数は、成功率が 95% を上回るエンドポイントに対してのみ分位数を計算します。
返される配列には、次の分位数がこの順序で含まれます:

* 0（最小値）
* 0.25（第1四分位数）
* 0.5（中央値）
* 0.75（第3四分位数）
* 0.95（95 パーセンタイル）
* 0.99（99 パーセンタイル）
* 1.0（最大値）

```response title="Response"
   ┌─endpoint─┬─response_time_quantiles─────────────────────────────────────────────┐
1. │ orders   │ [82, 87, 92, 98, 103, 104, 105]                                     │
2. │ products │ [45, 47, 49, 51, 52, 52, 53]                                        │
3. │ users    │ [nan, nan, nan, nan, nan, nan, nan]                                 │
   └──────────┴─────────────────────────────────────────────────────────────────────┘
```


## 関連項目 {#see-also}
- [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
