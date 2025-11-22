---
description: '`theilsU` 関数は Theil の U 不確実性係数を計算します。これは、テーブル内の 2 つの列間の関連性を測定する指標です。'
sidebar_position: 201
slug: /sql-reference/aggregate-functions/reference/theilsu
title: 'theilsU'
doc_type: 'reference'
---

# theilsU

`theilsU` 関数は、[Theil&#39;s U 不確実性係数](https://en.wikipedia.org/wiki/Contingency_table#Uncertainty_coefficient) を計算します。これは、テーブル内の 2 つの列間の関連の強さを測る指標です。値は −1.0（100% の負の関連、または完全な反転）から +1.0（100% の正の関連、または完全な一致）までの範囲を取り、0.0 は関連が存在しないことを示します。

**構文**

```sql
theilsU(column1, column2)
```

**引数**

* `column1` と `column2` は比較対象となる列です

**返り値**

* -1 から 1 の範囲の値

**戻り値の型** は常に [Float64](../../../sql-reference/data-types/float.md) です。

**例**

以下で比較されている 2 つの列は互いの関連性が小さいため、`theilsU` の値は負になります。

```sql
SELECT
    theilsU(a, b)
FROM
    (
        SELECT
            number % 10 AS a,
            number % 4 AS b
        FROM
            numbers(150)
    );
```

結果：

```response
┌────────theilsU(a, b)─┐
│ -0.30195720557678846 │
└──────────────────────┘
```
