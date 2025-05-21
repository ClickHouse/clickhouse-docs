---
description: 'uniqTheta関数のドキュメント'
sidebar_label: 'uniqTheta'
sidebar_position: 210
slug: /sql-reference/functions/uniqtheta-functions
title: 'uniqTheta関数'
---


# uniqTheta関数

uniqTheta関数は、2つのuniqThetaSketchオブジェクトに対して、∪ / ∩ / ×（和集合/積集合/差集合）などの集合演算計算を行い、結果を含む新しいuniqThetaSketchオブジェクトを返します。

uniqThetaSketchオブジェクトは、集約関数uniqThetaと-Stateによって構築されます。

UniqThetaSketchは、近似値の集合を保存するデータ構造です。RoaringBitmapに関する詳細は、[Theta Sketch Framework](https://datasketches.apache.org/docs/Theta/ThetaSketchFramework.html)を参照してください。

## uniqThetaUnion {#uniqthetaunion}

2つのuniqThetaSketchオブジェクトで和集合計算（集合演算 ∪）を行い、結果として新しいuniqThetaSketchを取得します。

```sql
uniqThetaUnion(uniqThetaSketch,uniqThetaSketch)
```

**引数**

- `uniqThetaSketch` – uniqThetaSketchオブジェクト。

**例**

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

2つのuniqThetaSketchオブジェクトで積集合計算（集合演算 ∩）を行い、結果として新しいuniqThetaSketchを取得します。

```sql
uniqThetaIntersect(uniqThetaSketch,uniqThetaSketch)
```

**引数**

- `uniqThetaSketch` – uniqThetaSketchオブジェクト。

**例**

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

2つのuniqThetaSketchオブジェクトでa_not_b計算（集合演算 ×）を行い、結果として新しいuniqThetaSketchを取得します。

```sql
uniqThetaNot(uniqThetaSketch,uniqThetaSketch)
```

**引数**

- `uniqThetaSketch` – uniqThetaSketchオブジェクト。

**例**

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

**関連項目**

- [uniqThetaSketch](/sql-reference/aggregate-functions/reference/uniqthetasketch)
