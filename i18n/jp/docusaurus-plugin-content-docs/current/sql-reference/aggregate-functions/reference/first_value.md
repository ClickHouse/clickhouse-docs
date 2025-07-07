---
'description': 'It is an alias for any but it was introduced for compatibility with
  Window Functions, where sometimes it is necessary to process `NULL` values (by default
  all ClickHouse aggregate functions ignore NULL values).'
'sidebar_position': 137
'slug': '/sql-reference/aggregate-functions/reference/first_value'
'title': 'first_value'
---




# first_value

これは[`any`](../../../sql-reference/aggregate-functions/reference/any.md)の別名ですが、[ウィンドウ関数](../../window-functions/index.md)との互換性のために導入されました。ここでは、時には`NULL`値を処理する必要があります（デフォルトでは、すべてのClickHouseの集約関数はNULL値を無視します）。

`RESPECT NULLS`修飾子を宣言してNULLを尊重することができ、これは[ウィンドウ関数](../../window-functions/index.md)および通常の集約の両方で動作します。

`any`と同様に、ウィンドウ関数がない場合、ソースストリームが順序付けられていない場合、結果はランダムになります。また、返り値の型が入力の型と一致する場合（入力がNullableの場合のみNullが返され、-OrNullコンビネータが追加されます）。

## examples {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) Values (1,null), (2,3), (4, 5), (6,null);
```

### example1 {#example1}
デフォルトでは、NULL値は無視されます。
```sql
select first_value(b) from test_data;
```

```text
┌─any(b)─┐
│      3 │
└────────┘
```

### example2 {#example2}
NULL値は無視されます。
```sql
select first_value(b) ignore nulls from test_data
```

```text
┌─any(b) IGNORE NULLS ─┐
│                    3 │
└──────────────────────┘
```

### example3 {#example3}
NULL値が受け入れられます。
```sql
select first_value(b) respect nulls from test_data
```

```text
┌─any(b) RESPECT NULLS ─┐
│                  ᴺᵁᴸᴸ │
└───────────────────────┘
```

### example4 {#example4}
`ORDER BY`を使用したサブクエリを利用して安定した結果を得ることができます。
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
