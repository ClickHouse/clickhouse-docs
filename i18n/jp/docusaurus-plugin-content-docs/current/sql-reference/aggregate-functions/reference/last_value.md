---
description: '最後に出現した値を選択します。`anyLast` に似ていますが、NULL も受け付けます。'
sidebar_position: 160
slug: /sql-reference/aggregate-functions/reference/last_value
title: 'last_value'
doc_type: 'reference'
---



# last_value

`anyLast` と同様に最後に出現した値を選択しますが、NULL を受け入れることができます。
主に [Window Functions](../../window-functions/index.md) と組み合わせて使用します。
Window Functions を使用しない場合、入力ストリームが順序付けられていなければ結果はランダムになります。



## 例 {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) VALUES (1,null), (2,3), (4, 5), (6,null)
```

### 例 1 {#example1}

デフォルトではNULL値は無視されます。

```sql
SELECT last_value(b) FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### 例 2 {#example2}

NULL値は無視されます。

```sql
SELECT last_value(b) ignore nulls FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### 例 3 {#example3}

NULL値は受け入れられます。

```sql
SELECT last_value(b) respect nulls FROM test_data
```

```text
┌─last_value_respect_nulls(b)─┐
│                        ᴺᵁᴸᴸ │
└─────────────────────────────┘
```

### 例 4 {#example4}

`ORDER BY`を使用したサブクエリによる安定した結果。

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
