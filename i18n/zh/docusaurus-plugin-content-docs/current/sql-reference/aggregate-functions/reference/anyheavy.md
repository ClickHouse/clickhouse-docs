---
'description': '使用重型击球手算法选择一个频繁出现的值。如果在每个查询执行线程中，有一个值在一半以上的情况下出现，则返回该值。通常，结果是非确定性的。'
'sidebar_position': 104
'slug': '/sql-reference/aggregate-functions/reference/anyheavy'
'title': 'anyHeavy'
---


# anyHeavy

选择使用 [heavy hitters](https://doi.org/10.1145/762471.762473) 算法的频繁出现值。如果在查询的每个执行线程中，有一个值出现的次数超过一半，该值将被返回。通常，结果是非确定性的。

```sql
anyHeavy(column)
```

**参数**

- `column` – 列名。

**示例**

以 [OnTime](../../../getting-started/example-datasets/ontime.md) 数据集为例，选择 `AirlineID` 列中的任何频繁出现的值。

```sql
SELECT anyHeavy(AirlineID) AS res
FROM ontime
```

```text
┌───res─┐
│ 19690 │
└───────┘
```
