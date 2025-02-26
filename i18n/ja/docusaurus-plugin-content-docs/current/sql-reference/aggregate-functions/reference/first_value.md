---
slug: /sql-reference/aggregate-functions/reference/first_value
sidebar_position: 137
---

# first_value

これは[`any`](../../../sql-reference/aggregate-functions/reference/any.md)のエイリアスですが、[ウィンドウ関数](../../window-functions/index.md)との互換性のために導入されました。ウィンドウ関数では、`NULL`値を処理する必要がある場合があります（デフォルトでは、全てのClickHouseの集約関数はNULL値を無視します）。

これは、[ウィンドウ関数](../../window-functions/index.md)の下でも通常の集約でも、NULLを尊重する修飾子（`RESPECT NULLS`）を宣言することをサポートしています。

`any`と同様に、ウィンドウ関数を使用しない場合、ソースストリームが順序付けされていないときは結果がランダムになることがあり、戻り値の型が入力型に一致する場合のみ結果が返されます（入力がNullableでない限りNULLが返されることはありません。-OrNullコンビネーターが追加されている場合を除きます）。

## 例 {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) Values (1,null), (2,3), (4, 5), (6,null);
```

### 例1 {#example1}
デフォルトでは、NULL値は無視されます。
```sql
select first_value(b) from test_data;
```

```text
┌─any(b)─┐
│      3 │
└────────┘
```

### 例2 {#example2}
NULL値は無視されます。
```sql
select first_value(b) ignore nulls from test_data
```

```text
┌─any(b) IGNORE NULLS ─┐
│                    3 │
└──────────────────────┘
```

### 例3 {#example3}
NULL値は受け入れられます。
```sql
select first_value(b) respect nulls from test_data
```

```text
┌─any(b) RESPECT NULLS ─┐
│                  ᴺᵁᴸᴸ │
└───────────────────────┘
```

### 例4 {#example4}
`ORDER BY`を用いたサブクエリで安定した結果。
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
