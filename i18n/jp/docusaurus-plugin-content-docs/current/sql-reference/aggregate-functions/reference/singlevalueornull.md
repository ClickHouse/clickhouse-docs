---
description: '集約関数 `singleValueOrNull` は、`x = ALL (SELECT ...)` のようなサブクエリ演算子を実装するために使用されます。データ内に一意な非 NULL の値がちょうど 1 つだけ存在するかどうかを判定します。'
sidebar_position: 184
slug: /sql-reference/aggregate-functions/reference/singlevalueornull
title: 'singleValueOrNull'
doc_type: 'reference'
---

# singleValueOrNull {#singlevalueornull}

集約関数 `singleValueOrNull` は、`x = ALL (SELECT ...)` のようなサブクエリの演算子を実装するために使用されます。データ内にただ 1 つだけ、一意な非 NULL 値が存在するかどうかを判定します。
一意な値が 1 つだけ存在する場合、その値を返します。値が 0 個、または相異なる値が 2 個以上存在する場合は、NULL を返します。

**構文**

```sql
singleValueOrNull(x)
```

**パラメーター**

* `x` — 任意の [データ型](../../data-types/index.md) の列（ただし [Nullable](../../data-types/nullable.md) 型にできない [Map](../../data-types/map.md)、[Array](../../data-types/array.md)、[Tuple](../../data-types/tuple) 型は除く）。

**戻り値**

* `x` の中に一意な非 NULL 値がちょうど 1 つだけ存在する場合、その一意な値。
* 0 個、または 2 個以上の異なる値が存在する場合は `NULL`。

**例**

クエリ:

```sql
CREATE TABLE test (x UInt8 NULL) ENGINE=Log;
INSERT INTO test (x) VALUES (NULL), (NULL), (5), (NULL), (NULL);
SELECT singleValueOrNull(x) FROM test;
```

結果：

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
