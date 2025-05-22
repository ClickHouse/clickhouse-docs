
# anyHeavy

通过使用 [heavy hitters](https://doi.org/10.1145/762471.762473) 算法选择一个经常出现的值。如果在查询的每个执行线程中，有一个值出现的次数超过一半，则返回该值。通常，结果是非确定性的。

```sql
anyHeavy(column)
```

**参数**

- `column` – 列名。

**示例**

获取 [OnTime](../../../getting-started/example-datasets/ontime.md) 数据集，并选择 `AirlineID` 列中任何经常出现的值。

```sql
SELECT anyHeavy(AirlineID) AS res
FROM ontime
```

```text
┌───res─┐
│ 19690 │
└───────┘
```
