---
'description': '数字の合計を計算し、同時に行数をカウントします。この関数はClickHouseのクエリオプティマイザーによって使用されます：クエリ内に複数の
  `sum`、`count` または `avg` 関数がある場合、それらは計算を再利用するために単一の `sumCount` 関数に置き換えることができます。この関数は明示的に使用する必要がほとんどありません。'
'sidebar_position': 196
'slug': '/sql-reference/aggregate-functions/reference/sumcount'
'title': 'sumCount'
'doc_type': 'reference'
---

数字の合計を計算し、同時に行数をカウントします。この関数は ClickHouse のクエリオプティマイザーによって使用されます。クエリに複数の `sum`、`count` または `avg` 関数がある場合、計算を再利用するために単一の `sumCount` 関数に置き換えることができます。この関数は明示的に使用する必要があることはほとんどありません。

**構文**

```sql
sumCount(x)
```

**引数**

- `x` — 入力値。必須: [整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点](../../../sql-reference/data-types/float.md)、または [小数](../../../sql-reference/data-types/decimal.md)。

**返される値**

- タプル `(sum, count)`。ここで `sum` は数字の合計、`count` はNULLでない値を持つ行の数です。

型: [タプル](../../../sql-reference/data-types/tuple.md)。

**例**

クエリ:

```sql
CREATE TABLE s_table (x Int8) ENGINE = Log;
INSERT INTO s_table SELECT number FROM numbers(0, 20);
INSERT INTO s_table VALUES (NULL);
SELECT sumCount(x) FROM s_table;
```

結果:

```text
┌─sumCount(x)─┐
│ (190,20)    │
└─────────────┘
```

**関連項目**

- [optimize_syntax_fuse_functions](../../../operations/settings/settings.md#optimize_syntax_fuse_functions) 設定。
