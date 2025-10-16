---
'description': 'これは任意のためのエイリアスですが、ウィンドウ関数との互換性を考慮して導入されました。時には、`NULL` 値を処理する必要があります（デフォルトではすべての
  ClickHouse 集約関数は NULL 値を無視します）。'
'sidebar_position': 137
'slug': '/sql-reference/aggregate-functions/reference/first_value'
'title': 'first_value'
'doc_type': 'reference'
---


# first_value

これは[`any`](../../../sql-reference/aggregate-functions/reference/any.md)のエイリアスですが、[ウィンドウ関数](../../window-functions/index.md)との互換性のために導入されました。ここでは、場合によって`NULL`値を処理する必要があります（デフォルトでは、すべてのClickHouseの集約関数はNULL値を無視します）。

これは、[ウィンドウ関数](../../window-functions/index.md)および通常の集約において、NULLを尊重するための修飾子（`RESPECT NULLS`）を宣言することをサポートしています。

`any`と同様に、ウィンドウ関数がない場合、入力ストリームが順序付けされていないと結果はランダムになります。また、戻り値の型は入力型と一致する必要があります（Nullは、入力がNullableである場合のみ返されます、または -OrNull 組み合わせが追加される必要があります）。

## examples {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) VALUES (1,null), (2,3), (4, 5), (6,null);
```

### Example 1 {#example1}
デフォルトでは、NULL値は無視されます。
```sql
SELECT first_value(b) FROM test_data;
```

```text
┌─any(b)─┐
│      3 │
└────────┘
```

### Example 2 {#example2}
NULL値は無視されます。
```sql
SELECT first_value(b) ignore nulls FROM test_data
```

```text
┌─any(b) IGNORE NULLS ─┐
│                    3 │
└──────────────────────┘
```

### Example 3 {#example3}
NULL値は受け入れられます。
```sql
SELECT first_value(b) respect nulls FROM test_data
```

```text
┌─any(b) RESPECT NULLS ─┐
│                  ᴺᵁᴸᴸ │
└───────────────────────┘
```

### Example 4 {#example4}
`ORDER BY`を使用したサブクエリによって安定した結果が得られます。
```sql
SELECT
    first_value_respect_nulls(b),
    first_value(b)
FROM
(
    SELECT *
    FROM test_data
    ORDER BY a ASC
)
```

```text
┌─any_respect_nulls(b)─┬─any(b)─┐
│                 ᴺᵁᴸᴸ │      3 │
└──────────────────────┴────────┘
```
