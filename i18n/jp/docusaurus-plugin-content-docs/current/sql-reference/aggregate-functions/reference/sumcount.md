---
description: '数値の合計を計算し、同時に行数をカウントします。この関数は ClickHouse のクエリ最適化器によって使用されます。クエリ内に複数の `sum`、`count` または `avg` 関数がある場合、それらは単一の `sumCount` 関数に置き換えられて計算を再利用できます。この関数は明示的に使用する必要がほとんどありません。'
sidebar_position: 196
slug: /sql-reference/aggregate-functions/reference/sumcount
title: 'sumCount'
---

数値の合計を計算し、同時に行数をカウントします。この関数は ClickHouse のクエリ最適化器によって使用されます。クエリ内に複数の `sum`、`count` または `avg` 関数がある場合、それらは単一の `sumCount` 関数に置き換えられて計算を再利用できます。この関数は明示的に使用する必要がほとんどありません。

**構文**

```sql
sumCount(x)
```

**引数**

- `x` — 入力値、[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、または [Decimal](../../../sql-reference/data-types/decimal.md) でなければなりません。

**戻り値**

- タプル `(sum, count)`。ここで、`sum` は数値の合計であり、`count` は NULL でない値を持つ行の数です。

タイプ: [Tuple](../../../sql-reference/data-types/tuple.md)。

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

**その他の情報**

- [optimize_syntax_fuse_functions](../../../operations/settings/settings.md#optimize_syntax_fuse_functions) 設定。
