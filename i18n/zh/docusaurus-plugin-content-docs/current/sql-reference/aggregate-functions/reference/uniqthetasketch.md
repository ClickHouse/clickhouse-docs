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

- 计算聚合中所有参数的哈希值，然后在计算中使用它。

- 使用 [KMV](https://datasketches.apache.org/docs/Theta/InverseEstimate.html) 算法来近似不同参数值的数量。

        使用4096(2^12) 64位 sketch。状态的大小约为41 KB。

- 相对误差为3.125%（95%置信度），有关详细信息，请参见 [相对误差表](https://datasketches.apache.org/docs/Theta/ThetaErrorTable.html)。

**另请参阅**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
