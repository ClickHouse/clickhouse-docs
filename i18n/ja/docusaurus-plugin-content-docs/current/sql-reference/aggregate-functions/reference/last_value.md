---
slug: /sql-reference/aggregate-functions/reference/last_value
sidebar_position: 160
---

# last_value

最後に遭遇した値を選択します。これは`anyLast`に似ていますが、NULLを受け入れることができます。
主に、[ウィンドウ関数](../../window-functions/index.md)と共に使用されるべきです。
ウィンドウ関数がない場合、ソースストリームが順序付けられていない場合、結果はランダムになります。

## 例 {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) Values (1,null), (2,3), (4, 5), (6,null)
```

### 例1 {#example1}
NULL値はデフォルトで無視されます。
```sql
select last_value(b) from test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### 例2 {#example2}
NULL値は無視されます。
```sql
select last_value(b) ignore nulls from test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### 例3 {#example3}
NULL値は受け入れられます。
```sql
select last_value(b) respect nulls from test_data
```

```text
┌─last_value_respect_nulls(b)─┐
│                        ᴺᵁᴸᴸ │
└─────────────────────────────┘
```

### 例4 {#example4}
サブクエリを使用して`ORDER BY`で安定した結果を得ます。
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
