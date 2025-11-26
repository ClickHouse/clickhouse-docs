---
description: 'この関数は、例外安全性をテストするために使用できます。
  指定した確率で生成時に例外をスローします。'
sidebar_position: 101
slug: /sql-reference/aggregate-functions/reference/aggthrow
title: 'aggThrow'
doc_type: 'reference'
---

# aggThrow

この関数は、例外安全性をテストするために使用できます。指定した確率で、生成時に例外をスローします。

**構文**

```sql
aggThrow(throw_prob)
```

**引数**

* `throw_prob` — 作成時に例外をスローする確率。[Float64](../../data-types/float.md)。

**戻り値**

* 例外: `Code: 503. DB::Exception: Aggregate function aggThrow has thrown exception successfully`。

**例**

クエリ:

```sql
SELECT number % 2 AS even, aggThrow(number) FROM numbers(10) GROUP BY even;
```

結果:

```response
例外を受信しました：
コード: 503. DB::Exception: 集約関数 aggThrow が正常に例外をスローしました: AggregatingTransform の実行中。(AGGREGATE_FUNCTION_THROW)
```
