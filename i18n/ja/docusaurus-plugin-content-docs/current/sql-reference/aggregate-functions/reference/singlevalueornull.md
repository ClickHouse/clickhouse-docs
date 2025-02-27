---
slug: /sql-reference/aggregate-functions/reference/singlevalueornull
sidebar_position: 184
---

# singleValueOrNull

集約関数 `singleValueOrNull` は、サブクエリオペレーターを実装するために使用されます。例えば、 `x = ALL (SELECT ...)` のようなものです。この関数は、データ内に一つのユニークな非NULL値が存在するかどうかを確認します。
ユニークな値が一つのみ存在する場合、その値を返します。ユニークな値がゼロまたは二つ以上存在する場合は、NULLを返します。

**構文**

```sql
singleValueOrNull(x)
```

**パラメータ**

- `x` — 任意の[データ型](../../data-types/index.md)のカラム（[Map](../../data-types/map.md)、[Array](../../data-types/array.md)または[Tuple](../../data-types/tuple)タイプの[Nullable](../../data-types/nullable.md)ではないものを除く）。

**返される値**

- `x` に非NULLのユニークな値が一つある場合、そのユニークな値。
- ゼロまたは二つ以上の異なる値がある場合は `NULL`。

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
