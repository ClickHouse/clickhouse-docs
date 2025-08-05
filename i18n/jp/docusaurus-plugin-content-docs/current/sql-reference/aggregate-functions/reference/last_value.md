---
description: 'Selects the last encountered value, similar to `anyLast`, but could
  accept NULL.'
sidebar_position: 160
slug: '/sql-reference/aggregate-functions/reference/last_value'
title: 'last_value'
---




# last_value

最後に遭遇した値を選択します。これは `anyLast` に似ていますが、NULL を受け入れることができます。
主に [Window Functions](../../window-functions/index.md) と一緒に使用されるべきです。
ウィンドウ関数なしでは、ソースストリームが順序付けられていない場合、結果はランダムになります。

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
NULL 値はデフォルトで無視されます。
```sql
select last_value(b) from test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### example2 {#example2}
NULL 値は無視されます。
```sql
select last_value(b) ignore nulls from test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### example3 {#example3}
NULL 値は受け入れられます。
```sql
select last_value(b) respect nulls from test_data
```

```text
┌─last_value_respect_nulls(b)─┐
│                        ᴺᵁᴸᴸ │
└─────────────────────────────┘
```

### example4 {#example4}
`ORDER BY` を使用したサブクエリで安定した結果を取得します。
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
