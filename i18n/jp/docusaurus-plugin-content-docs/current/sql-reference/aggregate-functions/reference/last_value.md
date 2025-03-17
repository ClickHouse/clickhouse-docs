---
slug: /sql-reference/aggregate-functions/reference/last_value
sidebar_position: 160
title: "last_value"
description: "最後に遭遇した値を選択し、`anyLast`に似ていますが、NULLを受け入れることができます。"
---


# last_value

最後に遭遇した値を選択し、`anyLast`に似ていますが、NULLを受け入れることができます。  
ほとんどの場合、[ウィンドウ関数](../../window-functions/index.md)と一緒に使用するべきです。  
ウィンドウ関数を使用しない場合、ソースストリームが順序付けられていないと結果はランダムになります。

## examples {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) Values (1,null), (2,3), (4, 5), (6,null)
```

### example1 {#example1}
デフォルトではNULL値は無視されます。
```sql
select last_value(b) from test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### example2 {#example2}
NULL値は無視されます。
```sql
select last_value(b) ignore nulls from test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### example3 {#example3}
NULL値は受け入れられます。
```sql
select last_value(b) respect nulls from test_data
```

```text
┌─last_value_respect_nulls(b)─┐
│                        ᴺᵁᴸᴸ │
└─────────────────────────────┘
```

### example4 {#example4}
`ORDER BY`を使用したサブクエリで結果が安定します。
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
