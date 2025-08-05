---
description: 'The `theilsU` function calculates Theils'' U uncertainty coefficient,
  a value that measures the association between two columns in a table.'
sidebar_position: 201
slug: '/sql-reference/aggregate-functions/reference/theilsu'
title: 'theilsU'
---




# theilsU

`theilsU` 関数は、2 つのカラム間の関連性を測定する値である [TheilのU不確実性係数](https://en.wikipedia.org/wiki/Contingency_table#Uncertainty_coefficient) を計算します。その値は -1.0（100% の負の関連性、または完全な逆転）から +1.0（100% の正の関連性、または完全な一致）までの範囲です。値が 0.0 の場合は、関連性が存在しないことを示します。

**構文**

```sql
theilsU(column1, column2)
```

**引数**

- `column1` と `column2` は比較されるカラムです

**戻り値**

- -1 と 1 の間の値

**戻り値の型** は常に [Float64](../../../sql-reference/data-types/float.md) です。

**例**

以下に比較される 2 つのカラムは互いに小さな関連性を持っているため、`theilsU` の値は負になります：

```sql
SELECT
    theilsU(a ,b)
FROM
    (
        SELECT
            number % 10 AS a,
            number % 4 AS b
        FROM
            numbers(150)
    );
```

結果:

```response
┌────────theilsU(a, b)─┐
│ -0.30195720557678846 │
└──────────────────────┘
```
