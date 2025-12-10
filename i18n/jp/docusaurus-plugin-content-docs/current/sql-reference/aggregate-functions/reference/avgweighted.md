---
description: '重み付き算術平均を計算します。'
sidebar_position: 113
slug: /sql-reference/aggregate-functions/reference/avgweighted
title: 'avgWeighted'
doc_type: 'reference'
---

# avgWeighted {#avgweighted}

[加重算術平均](https://en.wikipedia.org/wiki/Weighted_arithmetic_mean)を計算します。

**構文**

```sql
加重平均(x, weight)
```

**引数**

* `x` — 値。
* `weight` — 値に対応する重み。

`x` と `weight` はどちらも
[Integer](../../../sql-reference/data-types/int-uint.md) または [floating-point](../../../sql-reference/data-types/float.md)
である必要がありますが、型が異なっていてもかまいません。

**戻り値**

* すべての重みが 0 の場合、または指定された `weight` パラメータが空の場合は `NaN`。
* それ以外の場合は加重平均。

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

クエリ：

```sql
SELECT avgWeighted(x, w)
FROM VALUES('x Int8, w Float64', (4, 1), (1, 0), (10, 2))
```

結果：

```text
┌─avgWeighted(x, weight)─┐
│                      8 │
└────────────────────────┘
```

**例**

クエリ：

```sql
SELECT avgWeighted(x, w)
FROM VALUES('x Int8, w Int8', (0, 0), (1, 0), (10, 0))
```

結果：

```text
┌─avgWeighted(x, weight)─┐
│                    nan │
└────────────────────────┘
```

**例**

クエリ：

```sql
CREATE TABLE test (t UInt8) ENGINE = Memory;
SELECT avgWeighted(t) FROM test
```

結果：

```text
┌─avgWeighted(x, weight)─┐
│                    nan │
└────────────────────────┘
```
