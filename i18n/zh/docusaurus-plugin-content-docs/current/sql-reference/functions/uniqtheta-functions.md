
# uniqTheta 函数

uniqTheta 函数用于两个 uniqThetaSketch 对象进行集合操作计算，如 ∪ / ∩ / ×（并集/交集/差集），返回一个新的 uniqThetaSketch 对象，包含计算结果。

一个 uniqThetaSketch 对象是通过聚合函数 uniqTheta 与 -State 构造的。

UniqThetaSketch 是一种近似值集合的数据结构存储。有关 RoaringBitmap 的更多信息，请参见：[Theta Sketch Framework](https://datasketches.apache.org/docs/Theta/ThetaSketchFramework.html)。

## uniqThetaUnion {#uniqthetaunion}

两个 uniqThetaSketch 对象进行并集计算（集合操作 ∪），结果是一个新的 uniqThetaSketch。

```sql
uniqThetaUnion(uniqThetaSketch,uniqThetaSketch)
```

**参数**

- `uniqThetaSketch` – uniqThetaSketch 对象。

**示例**

```sql
select finalizeAggregation(uniqThetaUnion(a, b)) as a_union_b, finalizeAggregation(a) as a_cardinality, finalizeAggregation(b) as b_cardinality
from
(select arrayReduce('uniqThetaState',[1,2]) as a, arrayReduce('uniqThetaState',[2,3,4]) as b );
```

```text
┌─a_union_b─┬─a_cardinality─┬─b_cardinality─┐
│         4 │             2 │             3 │
└───────────┴───────────────┴───────────────┘
```

## uniqThetaIntersect {#uniqthetaintersect}

两个 uniqThetaSketch 对象进行交集计算（集合操作 ∩），结果是一个新的 uniqThetaSketch。

```sql
uniqThetaIntersect(uniqThetaSketch,uniqThetaSketch)
```

**参数**

- `uniqThetaSketch` – uniqThetaSketch 对象。

**示例**

```sql
select finalizeAggregation(uniqThetaIntersect(a, b)) as a_intersect_b, finalizeAggregation(a) as a_cardinality, finalizeAggregation(b) as b_cardinality
from
(select arrayReduce('uniqThetaState',[1,2]) as a, arrayReduce('uniqThetaState',[2,3,4]) as b );
```

```text
┌─a_intersect_b─┬─a_cardinality─┬─b_cardinality─┐
│             1 │             2 │             3 │
└───────────────┴───────────────┴───────────────┘
```

## uniqThetaNot {#uniqthetanot}

两个 uniqThetaSketch 对象进行 a_not_b 计算（集合操作 ×），结果是一个新的 uniqThetaSketch。

```sql
uniqThetaNot(uniqThetaSketch,uniqThetaSketch)
```

**参数**

- `uniqThetaSketch` – uniqThetaSketch 对象。

**示例**

```sql
select finalizeAggregation(uniqThetaNot(a, b)) as a_not_b, finalizeAggregation(a) as a_cardinality, finalizeAggregation(b) as b_cardinality
from
(select arrayReduce('uniqThetaState',[2,3,4]) as a, arrayReduce('uniqThetaState',[1,2]) as b );
```

```text
┌─a_not_b─┬─a_cardinality─┬─b_cardinality─┐
│       2 │             3 │             2 │
└─────────┴───────────────┴───────────────┘
```

**另见**

- [uniqThetaSketch](/sql-reference/aggregate-functions/reference/uniqthetasketch)
