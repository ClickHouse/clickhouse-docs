---
description: '集約関数 `singleValueOrNull` は、`x = ALL (SELECT ...)` のようなサブクエリ演算子を実装するために使用されます。データ内に唯一の非NULL値が1つだけ存在するかどうかを確認します。'
sidebar_position: 184
slug: /sql-reference/aggregate-functions/reference/singlevalueornull
title: 'singleValueOrNull'
---


# singleValueOrNull

集約関数 `singleValueOrNull` は、`x = ALL (SELECT ...)` のようなサブクエリ演算子を実装するために使用されます。データ内に唯一の非NULL値が1つだけ存在するかどうかを確認します。唯一の値が1つだけであれば、それを返します。ゼロまたは少なくとも2つの異なる値がある場合は、NULLを返します。

**構文**

```sql
singleValueOrNull(x)
```

**パラメータ**

- `x` — 任意の [データ型](../../data-types/index.md) のカラム（[Map](../../data-types/map.md)、[Array](../../data-types/array.md)、または[Tuple](../../data-types/tuple) は [Nullable](../../data-types/nullable.md) 型にすることはできません）。

**返される値**

- `x` に唯一の非NULL値が1つだけ存在する場合、その唯一の値。
- ゼロまたは少なくとも2つの異なる値がある場合は `NULL`。

**例**

クエリ:

```sql
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
