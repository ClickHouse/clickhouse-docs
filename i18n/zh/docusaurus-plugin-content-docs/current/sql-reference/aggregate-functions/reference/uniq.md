---
'description': '计算参数的不同值的近似数量。'
'sidebar_position': 204
'slug': '/sql-reference/aggregate-functions/reference/uniq'
'title': 'uniq'
'doc_type': 'reference'
---


# uniq

计算参数的不同值的近似数量。

```sql
uniq(x[, ...])
```

**参数**

该函数接受可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**返回值**

- 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数字。

**实现细节**

函数：

- 对聚合中的所有参数计算哈希值，然后在计算中使用它。

- 使用自适应采样算法。对于计算状态，该函数使用元素哈希值的样本，最多为 65536。该算法非常准确，并且在 CPU 上非常高效。当查询包含多个这样的函数时，使用 `uniq` 的速度几乎与其他聚合函数相当。

- 提供确定性的结果（不依赖于查询处理顺序）。

我们建议在几乎所有场景中使用此函数。

**另请参阅**

- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
