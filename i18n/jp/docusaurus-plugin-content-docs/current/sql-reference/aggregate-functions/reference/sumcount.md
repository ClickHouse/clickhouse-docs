---
description: '数値の合計を計算すると同時に、行数をカウントします。この関数は ClickHouse のクエリオプティマイザーによって利用されます。クエリ内に複数の `sum`、`count`、`avg` 関数がある場合、それらは 1 つの `sumCount` 関数に置き換えられ、計算を再利用できます。この関数を明示的に呼び出す必要があるケースはほとんどありません。'
sidebar_position: 196
slug: /sql-reference/aggregate-functions/reference/sumcount
title: 'sumCount'
doc_type: 'reference'
---

数値の合計を計算すると同時に、行数をカウントします。この関数は ClickHouse のクエリオプティマイザーによって利用されます。クエリ内に複数の `sum`、`count`、`avg` 関数がある場合、それらは 1 つの `sumCount` 関数に置き換えられ、計算を再利用できます。この関数を明示的に呼び出す必要があるケースはほとんどありません。

**構文**

```sql
sumCount(x)
```

**引数**

* `x` — 入力値。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、または [Decimal](../../../sql-reference/data-types/decimal.md) でなければなりません。

**戻り値**

* タプル `(sum, count)`。ここで `sum` は数値の合計、`count` は NULL 以外の値を持つ行の数です。

型: [Tuple](../../../sql-reference/data-types/tuple.md)。

**例**

クエリ:

```sql
CREATE TABLE s_table (x Int8) ENGINE = Log;
INSERT INTO s_table SELECT number FROM numbers(0, 20);
INSERT INTO s_table VALUES (NULL);
SELECT sumCount(x) FROM s_table;
```

結果：

```text
┌─sumCount(x)─┐
│ (190,20)    │
└─────────────┘
```

**関連項目**

* [optimize&#95;syntax&#95;fuse&#95;functions](../../../operations/settings/settings.md#optimize_syntax_fuse_functions) 設定を参照してください。
