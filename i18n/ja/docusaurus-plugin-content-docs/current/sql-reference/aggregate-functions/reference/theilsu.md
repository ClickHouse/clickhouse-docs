---
slug: /sql-reference/aggregate-functions/reference/theilsu
sidebar_position: 201
---

# theilsU

`theilsU` 関数は、テーブル内の二つのカラム間の関連性を測定する、[テイルのU不確実性係数](https://en.wikipedia.org/wiki/Contingency_table#Uncertainty_coefficient)を計算します。この値は、−1.0（100% の負の関連、すなわち完全な反転）から +1.0（100% の正の関連、すなわち完全な一致）までの範囲を持ちます。0.0の値は、関連性がないことを示します。

**構文**

``` sql
theilsU(column1, column2)
```

**引数**

- `column1` と `column2` は比較されるカラムです。

**返される値**

- -1 と 1 の間の値

**返り値の型**は常に [Float64](../../../sql-reference/data-types/float.md) です。

**例**

以下の二つのカラムは、お互いに小さな関連性を持っているため、`theilsU` の値は負の値になります。

``` sql
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
