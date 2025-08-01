---
description: 'Calculates the sum of the numbers and counts the number of rows at
  the same time. The function is used by ClickHouse query optimizer: if there are
  multiple `sum`, `count` or `avg` functions in a query, they can be replaced to single
  `sumCount` function to reuse the calculations. The function is rarely needed to
  use explicitly.'
sidebar_position: 196
slug: '/sql-reference/aggregate-functions/reference/sumcount'
title: 'sumCount'
---



数字の合計を計算し、同時に行数をカウントします。この関数は ClickHouse のクエリオプティマイザによって使用されます。クエリに複数の `sum`、`count` または `avg` 関数がある場合、それらは計算を再利用するために単一の `sumCount` 関数に置き換えられることがあります。この関数は明示的に使用する必要があることは稀です。

**構文**

```sql
sumCount(x)
```

**引数**

- `x` — 入力値。必ず [整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点数](../../../sql-reference/data-types/float.md)、または [小数](../../../sql-reference/data-types/decimal.md) でなければなりません。

**戻り値**

- タプル `(sum, count)` で、`sum` は数値の合計、`count` はNULLでない値を持つ行の数です。

タイプ: [タプル](../../../sql-reference/data-types/tuple.md)。

**例**

クエリ:

```sql
CREATE TABLE s_table (x Int8) Engine = Log;
INSERT INTO s_table SELECT number FROM numbers(0, 20);
INSERT INTO s_table VALUES (NULL);
SELECT sumCount(x) from s_table;
```

結果:

```text
┌─sumCount(x)─┐
│ (190,20)    │
└─────────────┘
```

**関連項目**

- [optimize_syntax_fuse_functions](../../../operations/settings/settings.md#optimize_syntax_fuse_functions) 設定。
