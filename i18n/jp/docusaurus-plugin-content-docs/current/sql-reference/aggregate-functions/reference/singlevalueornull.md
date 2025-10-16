---
'description': '集約関数 `singleValueOrNull` は、`x = ALL (SELECT ...)` のようなサブクエリ演算子を実装するために使用されます。それは、データに唯一の非NULL値が1つだけ存在するかどうかを確認します。'
'sidebar_position': 184
'slug': '/sql-reference/aggregate-functions/reference/singlevalueornull'
'title': 'singleValueOrNull'
'doc_type': 'reference'
---


# singleValueOrNull

集約関数 `singleValueOrNull` は、`x = ALL (SELECT ...)` のようなサブクエリ演算子を実装するために使用されます。この関数は、データ内に一意の非NULL値が1つだけ存在するかどうかを確認します。
一意の値が1つだけ存在する場合は、それを返します。ゼロまたは少なくとも2つの異なる値がある場合は、NULLを返します。

**構文**

```sql
singleValueOrNull(x)
```

**パラメーター**

- `x` — 任意の [データ型](../../data-types/index.md) のカラム（[Map](../../data-types/map.md)、[Array](../../data-types/array.md) または [Tuple](../../data-types/tuple) のように [Nullable](../../data-types/nullable.md) 型は使用できません）。

**返される値**

- `x` に一意の非NULL値が1つだけ存在する場合、その一意の値。
- ゼロまたは少なくとも2つの異なる値がある場合は、`NULL`。

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
