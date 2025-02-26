---
slug: /sql-reference/functions/uniqtheta-functions
sidebar_position: 210
sidebar_label: uniqTheta
---

# uniqTheta 関数

uniqTheta 関数は、二つの uniqThetaSketch オブジェクトに対して集合演算（∪ / ∩ / ×）を行い、その結果を含む新しい uniqThetaSketch オブジェクトを返します。

uniqThetaSketch オブジェクトは、集約関数 uniqTheta を使用して -State で構築されます。

UniqThetaSketch は、近似値の集合を格納するデータ構造です。
RoaringBitmap についての詳細は、[Theta Sketch Framework](https://datasketches.apache.org/docs/Theta/ThetaSketchFramework.html)を参照してください。

## uniqThetaUnion {#uniqthetaunion}

二つの uniqThetaSketch オブジェクトに対して和集合の計算（集合演算 ∪）を行い、その結果を新しい uniqThetaSketch として返します。

``` sql
uniqThetaUnion(uniqThetaSketch, uniqThetaSketch)
```

**引数**

- `uniqThetaSketch` – uniqThetaSketch オブジェクト。

**例**

``` sql
select finalizeAggregation(uniqThetaUnion(a, b)) as a_union_b, finalizeAggregation(a) as a_cardinality, finalizeAggregation(b) as b_cardinality
from
(select arrayReduce('uniqThetaState', [1, 2]) as a, arrayReduce('uniqThetaState', [2, 3, 4]) as b);
```

``` text
┌─a_union_b─┬─a_cardinality─┬─b_cardinality─┐
│         4 │             2 │             3 │
└───────────┴───────────────┴───────────────┘
```

## uniqThetaIntersect {#uniqthetaintersect}

二つの uniqThetaSketch オブジェクトに対して積集合の計算（集合演算 ∩）を行い、その結果を新しい uniqThetaSketch として返します。

``` sql
uniqThetaIntersect(uniqThetaSketch, uniqThetaSketch)
```

**引数**

- `uniqThetaSketch` – uniqThetaSketch オブジェクト。

**例**

``` sql
select finalizeAggregation(uniqThetaIntersect(a, b)) as a_intersect_b, finalizeAggregation(a) as a_cardinality, finalizeAggregation(b) as b_cardinality
from
(select arrayReduce('uniqThetaState', [1, 2]) as a, arrayReduce('uniqThetaState', [2, 3, 4]) as b);
```

``` text
┌─a_intersect_b─┬─a_cardinality─┬─b_cardinality─┐
│             1 │             2 │             3 │
└───────────────┴───────────────┴───────────────┘
```

## uniqThetaNot {#uniqthetanot}

二つの uniqThetaSketch オブジェクトに対して a_not_b の計算（集合演算 ×）を行い、その結果を新しい uniqThetaSketch として返します。

``` sql
uniqThetaNot(uniqThetaSketch, uniqThetaSketch)
```

**引数**

- `uniqThetaSketch` – uniqThetaSketch オブジェクト。

**例**

``` sql
select finalizeAggregation(uniqThetaNot(a, b)) as a_not_b, finalizeAggregation(a) as a_cardinality, finalizeAggregation(b) as b_cardinality
from
(select arrayReduce('uniqThetaState', [2, 3, 4]) as a, arrayReduce('uniqThetaState', [1, 2]) as b);
```

``` text
┌─a_not_b─┬─a_cardinality─┬─b_cardinality─┐
│       2 │             3 │             2 │
└─────────┴───────────────┴───────────────┘
```

**関連項目**

- [uniqThetaSketch](../../sql-reference/aggregate-functions/reference/uniqthetasketch.md#agg_function-uniqthetasketch)
