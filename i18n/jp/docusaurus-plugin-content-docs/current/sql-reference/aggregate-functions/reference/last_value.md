---
'description': '最後に遭遇した値を選択します。これは `anyLast` に似ていますが、NULLを受け入れることができます。'
'sidebar_position': 160
'slug': '/sql-reference/aggregate-functions/reference/last_value'
'title': 'last_value'
'doc_type': 'reference'
---


# last_value

最後に遭遇した値を選択します。`anyLast`と似ていますが、NULLを受け入れることができます。主に [Window Functions](../../window-functions/index.md) と一緒に使用すべきです。ウィンドウ関数なしでは、ソースストリームが順序付けられていない場合、結果はランダムになります。

## examples {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) VALUES (1,null), (2,3), (4, 5), (6,null)
```

### Example 1 {#example1}
NULL値はデフォルトで無視されます。
```sql
SELECT last_value(b) FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### Example 2 {#example2}
NULL値は無視されます。
```sql
SELECT last_value(b) ignore nulls FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### Example 3 {#example3}
NULL値は受け入れられます。
```sql
SELECT last_value(b) respect nulls FROM test_data
```

```text
┌─last_value_respect_nulls(b)─┐
│                        ᴺᵁᴸᴸ │
└─────────────────────────────┘
```

### Example 4 {#example4}
`ORDER BY`を使用したサブクエリによって安定した結果が得られます。
```sql
SELECT
    last_value_respect_nulls(b),
    last_value(b)
FROM
(
    SELECT *
    FROM test_data
    ORDER BY a ASC
)
```

```text
┌─last_value_respect_nulls(b)─┬─last_value(b)─┐
│                        ᴺᵁᴸᴸ │             5 │
└─────────────────────────────┴───────────────┘
```
