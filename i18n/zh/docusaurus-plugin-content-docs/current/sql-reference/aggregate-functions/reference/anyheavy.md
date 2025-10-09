---
'description': '使用 heavy hitters 算法选择一个频繁出现的值。如果在每个查询执行线程中，有一个值出现的次数超过一半，则返回该值。通常情况下，结果是非确定性的。'
'sidebar_position': 104
'slug': '/sql-reference/aggregate-functions/reference/anyheavy'
'title': 'anyHeavy'
'doc_type': 'reference'
---


# anyHeavy

使用 [heavy hitters](https://doi.org/10.1145/762471.762473) 算法选择一个频繁出现的值。如果在每个查询执行线程中，有一个值出现的频率超过一半，则返回该值。通常，结果是非确定性的。

```sql
anyHeavy(column)
```

**参数**

- `column` – 列名。

**示例**

获取 [OnTime](../../../getting-started/example-datasets/ontime.md) 数据集，并选择 `AirlineID` 列中任何频繁出现的值。

```sql
SELECT anyHeavy(AirlineID) AS res
FROM ontime
```

```text
┌───res─┐
│ 19690 │
└───────┘
```
