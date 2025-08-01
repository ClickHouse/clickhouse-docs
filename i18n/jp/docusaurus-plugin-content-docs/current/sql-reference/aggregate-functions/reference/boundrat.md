---
description: 'Aggregate function that calculates the slope between the leftmost
  and rightmost points across a group of values.'
sidebar_position: 114
slug: '/sql-reference/aggregate-functions/reference/boundingRatio'
title: 'boundingRatio'
---



集約関数は、値のグループに対して左端点と右端点の間の傾きを計算します。

例:

サンプルデータ:
```sql
SELECT
    number,
    number * 1.5
FROM numbers(10)
```
```response
┌─number─┬─multiply(number, 1.5)─┐
│      0 │                     0 │
│      1 │                   1.5 │
│      2 │                     3 │
│      3 │                   4.5 │
│      4 │                     6 │
│      5 │                   7.5 │
│      6 │                     9 │
│      7 │                  10.5 │
│      8 │                    12 │
│      9 │                  13.5 │
└────────┴───────────────────────┘
```

boundingRatio() 関数は、上記のデータにおける左端点と右端点の間の直線の傾きを返します。この点は `(0,0)` と `(9,13.5)` です。

```sql
SELECT boundingRatio(number, number * 1.5)
FROM numbers(10)
```
```response
┌─boundingRatio(number, multiply(number, 1.5))─┐
│                                          1.5 │
└──────────────────────────────────────────────┘
```
