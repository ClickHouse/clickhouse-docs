---
'description': '重み付き算術平均を計算します。'
'sidebar_position': 113
'slug': '/sql-reference/aggregate-functions/reference/avgweighted'
'title': 'avgWeighted'
'doc_type': 'reference'
---


# avgWeighted

[加重算術平均](https://en.wikipedia.org/wiki/Weighted_arithmetic_mean) を計算します。

**構文**

```sql
avgWeighted(x, weight)
```

**引数**

- `x` — 値。
- `weight` — 値の重み。

`x` と `weight` はどちらも
[整数](../../../sql-reference/data-types/int-uint.md) または [浮動小数点](../../../sql-reference/data-types/float.md) でなければなりませんが、異なる型であることも可能です。

**返される値**

- すべての重みが 0 に等しい場合、または提供された重みパラメータが空の場合は `NaN` を返します。
- それ以外の場合は加重平均を返します。

**戻り値の型** は常に [Float64](../../../sql-reference/data-types/float.md) です。

**例**

クエリ:

```sql
SELECT avgWeighted(x, w)
FROM VALUES('x Int8, w Int8', (4, 1), (1, 0), (10, 2))
```

結果:

```text
┌─avgWeighted(x, weight)─┐
│                      8 │
└────────────────────────┘
```

**例**

クエリ:

```sql
SELECT avgWeighted(x, w)
FROM VALUES('x Int8, w Float64', (4, 1), (1, 0), (10, 2))
```

結果:

```text
┌─avgWeighted(x, weight)─┐
│                      8 │
└────────────────────────┘
```

**例**

クエリ:

```sql
SELECT avgWeighted(x, w)
FROM VALUES('x Int8, w Int8', (0, 0), (1, 0), (10, 0))
```

結果:

```text
┌─avgWeighted(x, weight)─┐
│                    nan │
└────────────────────────┘
```

**例**

クエリ:

```sql
CREATE TABLE test (t UInt8) ENGINE = Memory;
SELECT avgWeighted(t) FROM test
```

結果:

```text
┌─avgWeighted(x, weight)─┐
│                    nan │
└────────────────────────┘
```
