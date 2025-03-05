---
slug: /sql-reference/aggregate-functions/reference/singlevalueornull
sidebar_position: 184
title: "singleValueOrNull"
description: "集約関数 `singleValueOrNull` は、`x = ALL (SELECT ...)` のようなサブクエリ演算子を実装するために使用されます。この関数は、データに唯一の非NULL値が1つだけあるかどうかをチェックします。"
---


# singleValueOrNull

集約関数 `singleValueOrNull` は、`x = ALL (SELECT ...)` のようなサブクエリ演算子を実装するために使用されます。この関数は、データに唯一の非NULL値が1つだけあるかどうかをチェックします。  
唯一の非NULL値が1つだけの場合、それを返します。0または少なくとも2つの異なる値がある場合、NULLを返します。

**構文**

``` sql
singleValueOrNull(x)
```

**パラメータ**

- `x` — 任意の [データ型](../../data-types/index.md) のカラム（[Map](../../data-types/map.md)、[Array](../../data-types/array.md)、または [Tuple](../../data-types/tuple) の型は [Nullable](../../data-types/nullable.md) ではない必要があります）。

**返される値**

- `x` に唯一の非NULL値が1つだけある場合、そのユニークな値を返します。
- 0または少なくとも2つの異なる値がある場合、`NULL` を返します。

**例**

クエリ:

``` sql
CREATE TABLE test (x UInt8 NULL) ENGINE=Log;
INSERT INTO test (x) VALUES (NULL), (NULL), (5), (NULL), (NULL);
SELECT singleValueOrNull(x) FROM test;
```

結果:

```response
┌─singleValueOrNull(x)─┐
│                    5 │
└──────────────────────┘
```

クエリ:

```sql
INSERT INTO test (x) VALUES (10);
SELECT singleValueOrNull(x) FROM test;
```

結果:

```response
┌─singleValueOrNull(x)─┐
│                 ᴺᵁᴸᴸ │
└──────────────────────┘
```
