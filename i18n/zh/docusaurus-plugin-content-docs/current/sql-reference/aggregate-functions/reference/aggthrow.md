---
description: '此函数可用于测试异常安全。它会在创建时以指定的概率抛出异常。'
sidebar_position: 101
slug: /sql-reference/aggregate-functions/reference/aggthrow
title: 'aggThrow'
doc_type: 'reference'
---

# aggThrow

此函数可用于测试异常安全性。它会在创建时按照指定概率抛出异常。

**语法**

```sql
aggThrow(throw_prob)
```

**参数**

* `throw_prob` — 在创建时抛出异常的概率。[Float64](../../data-types/float.md)。

**返回值**

* 抛出的异常：`Code: 503. DB::Exception: Aggregate function aggThrow has thrown exception successfully`。

**示例**

查询：

```sql
SELECT number % 2 AS even, aggThrow(number) FROM numbers(10) GROUP BY even;
```

结果：

```response
收到异常:
代码: 503. DB::Exception: 聚合函数 aggThrow 已成功抛出异常: 执行 AggregatingTransform 时。(AGGREGATE_FUNCTION_THROW)
```
