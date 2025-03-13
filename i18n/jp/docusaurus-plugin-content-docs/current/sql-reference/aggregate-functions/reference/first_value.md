---
slug: /sql-reference/aggregate-functions/reference/first_value
sidebar_position: 137
title: "first_value"
description: "これは `any` のエイリアスですが、ウィンドウ関数との互換性を考慮して導入されました。ウィンドウ関数では、時として `NULL` 値を処理する必要があります（デフォルトでは、すべての ClickHouse 集約関数は NULL 値を無視します）。"
---


# first_value

これは [`any`](../../../sql-reference/aggregate-functions/reference/any.md) のエイリアスですが、ウィンドウ関数との互換性を考慮して導入されました。[ウィンドウ関数](../../window-functions/index.md)では、時として `NULL` 値を処理する必要があります（デフォルトでは、すべての ClickHouse 集約関数は NULL 値を無視します）。

`RESPECT NULLS` という修飾子を宣言して、NULL を尊重することができます。これは [ウィンドウ関数](../../window-functions/index.md) の場合でも、通常の集約処理でも同様です。

`any` と同様に、ウィンドウ関数がない場合、ソースストリームが順序付けられていないと結果はランダムになり、戻り値の型が入力の型と一致する場合（入力が Nullable である場合、または -OrNull 組み合わせが追加された場合にのみ Null が返されます）に結果が返されます。

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
デフォルトでは、NULL 値は無視されます。
```sql
select first_value(b) from test_data;
```

```text
┌─any(b)─┐
│      3 │
└────────┘
```

### example2 {#example2}
NULL 値は無視されます。
```sql
select first_value(b) ignore nulls from test_data
```

```text
┌─any(b) IGNORE NULLS ─┐
│                    3 │
└──────────────────────┘
```

### example3 {#example3}
NULL 値は受け入れられます。
```sql
select first_value(b) respect nulls from test_data
```

```text
┌─any(b) RESPECT NULLS ─┐
│                  ᴺᵁᴸᴸ │
└───────────────────────┘
```

### example4 {#example4}
`ORDER BY` を使ったサブクエリで安定化された結果。
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
