---
'description': '该函数可用于测试异常安全性。它将在创建时以指定的概率抛出异常。'
'sidebar_position': 101
'slug': '/sql-reference/aggregate-functions/reference/aggthrow'
'title': 'aggThrow'
'doc_type': 'reference'
---


# aggThrow

该函数可用于测试异常安全性。它将在创建时以指定的概率抛出异常。

**语法**

```sql
aggThrow(throw_prob)
```

**参数**

- `throw_prob` — 创建时抛出异常的概率。[Float64](../../data-types/float.md)。

**返回值**

- 一个异常: `Code: 503. DB::Exception: Aggregate function aggThrow has thrown exception successfully`。

**示例**

查询：

```sql
SELECT number % 2 AS even, aggThrow(number) FROM numbers(10) GROUP BY even;
```

结果：

```response
Received exception:
Code: 503. DB::Exception: Aggregate function aggThrow has thrown exception successfully: While executing AggregatingTransform. (AGGREGATE_FUNCTION_THROW)
```
