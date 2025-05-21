---
description: 'この関数は例外安全性のテストに使用できます。
  指定された確率で作成時に例外をスローします。'
sidebar_position: 101
slug: /sql-reference/aggregate-functions/reference/aggthrow
title: 'aggThrow'
---


# aggThrow

この関数は例外安全性のテストに使用できます。指定された確率で作成時に例外をスローします。

**構文**

```sql
aggThrow(throw_prob)
```

**引数**

- `throw_prob` — 作成時にスローする確率。[Float64](../../data-types/float.md)。

**返される値**

- 例外: `Code: 503. DB::Exception: Aggregate function aggThrow has thrown exception successfully`.

**例**

クエリ:

```sql
SELECT number % 2 AS even, aggThrow(number) FROM numbers(10) GROUP BY even;
```

結果:

```response
受け取った例外:
Code: 503. DB::Exception: Aggregate function aggThrow has thrown exception successfully: While executing AggregatingTransform. (AGGREGATE_FUNCTION_THROW)
```
