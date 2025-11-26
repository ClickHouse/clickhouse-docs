---
description: '最後に出現した値を選択します。`anyLast` と類似していますが、NULL を許容します。'
sidebar_position: 160
slug: /sql-reference/aggregate-functions/reference/last_value
title: 'last_value'
doc_type: 'reference'
---



# last_value

`anyLast` と同様に、最後に出現した値を選択しますが、NULL も許容します。
主に [Window Functions](../../window-functions/index.md)（ウィンドウ関数）と組み合わせて使用します。
Window Functions を使用しない場合、入力ストリームに順序付けがされていないと、結果はランダムになります。



## 使用例

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) VALUES (1,null), (2,3), (4, 5), (6,null)
```

### 例 1

`NULL` 値はデフォルトで無視されます。

```sql
SELECT last_value(b) FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### 例 2

NULL 値は無視されます。

```sql
SELECT last_value(b) ignore nulls FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### 例 3

NULL 値が許可されます。

```sql
SELECT last_value(b) respect nulls FROM test_data
```

```text
┌─last_value_respect_nulls(b)─┐
│                        ᴺᵁᴸᴸ │
└─────────────────────────────┘
```

### 例 4

`ORDER BY` を含むサブクエリで結果を安定化。

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
