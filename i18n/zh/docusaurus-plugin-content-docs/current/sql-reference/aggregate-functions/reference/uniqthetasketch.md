---
'description': 'Calculates the approximate number of different argument values, using
  the Theta Sketch Framework.'
'sidebar_position': 209
'slug': '/sql-reference/aggregate-functions/reference/uniqthetasketch'
'title': 'uniqTheta'
---



计算不同参数值的近似数量，使用 [Theta Sketch Framework](https://datasketches.apache.org/docs/Theta/ThetaSketches.html#theta-sketch-framework)。

```sql
uniqTheta(x[, ...])
```

**参数**

该函数接受可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**返回值**

- 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数字。

**实现细节**

函数：

- 为聚合中的所有参数计算哈希，然后在计算中使用它。

- 使用 [KMV](https://datasketches.apache.org/docs/Theta/InverseEstimate.html) 算法来近似计算不同参数值的数量。

        使用 4096(2^12) 个 64 位 sketch。状态的大小约为 41 KB。

- 相对误差为 3.125%（95% 置信度），详见 [相对误差表](https://datasketches.apache.org/docs/Theta/ThetaErrorTable.html)。

**另请参见**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
