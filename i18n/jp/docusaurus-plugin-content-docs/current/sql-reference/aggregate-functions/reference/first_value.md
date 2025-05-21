---
description: 'ウィンドウ関数との互換性のために導入されたエイリアスで、時には `NULL` 値を処理する必要があります（デフォルトではすべてのClickHouse集約関数はNULL値を無視します）。'
sidebar_position: 137
slug: /sql-reference/aggregate-functions/reference/first_value
title: 'first_value'
---


# first_value

これは [`any`](../../../sql-reference/aggregate-functions/reference/any.md) のエイリアスですが、時には `NULL` 値を処理する必要がある[ウィンドウ関数](../../window-functions/index.md)との互換性のために導入されました（デフォルトではすべてのClickHouse集約関数はNULL値を無視します）。

これは、[ウィンドウ関数](../../window-functions/index.md)と通常の集約の両方で、NULLを尊重する修飾子（`RESPECT NULLS`）を宣言することをサポートしています。

`any`と同様に、ウィンドウ関数なしでは、ソースストリームが順序付けられていない場合、結果はランダムになります。また、返される型が入力型と一致する場合（入力がNullableである場合のみNULLが返されます。または -OrNull 組み合わせが追加された場合のみです）。

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
NULL値は受け入れられます。
```sql
select first_value(b) respect nulls from test_data
```

```text
┌─any(b) RESPECT NULLS ─┐
│                  ᴺᵁᴸᴸ │
└───────────────────────┘
```

### example4 {#example4}
`ORDER BY`を使ったサブクエリで安定した結果を得ます。
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
