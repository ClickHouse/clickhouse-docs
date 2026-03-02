---
description: '`anyLast`와 유사하게 마지막으로 나타난 값을 선택하지만, NULL도 허용합니다.'
slug: /sql-reference/aggregate-functions/reference/last_value
title: 'last_value'
doc_type: 'reference'
---

# last_value \{#last_value\}

`anyLast`와 유사하게 마지막으로 나타난 값을 선택하지만, NULL 값도 허용합니다.
대부분 [Window Functions](../../window-functions/index.md)와 함께 사용됩니다.
Window Functions를 사용하지 않고 소스 스트림이 정렬되어 있지 않으면 결과는 임의로 결정됩니다.

## 예제 \{#examples\}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) VALUES (1,null), (2,3), (4, 5), (6,null)
```

### 예시 1 \{#example1\}

기본 설정에서는 NULL 값이 무시됩니다.

```sql
SELECT last_value(b) FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### 예시 2 \{#example2\}

NULL 값은 무시됩니다.

```sql
SELECT last_value(b) ignore nulls FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### 예시 3 \{#example3\}

NULL 값을 허용합니다.

```sql
SELECT last_value(b) respect nulls FROM test_data
```

```text
┌─last_value_respect_nulls(b)─┐
│                        ᴺᵁᴸᴸ │
└─────────────────────────────┘
```

### Example 4 \{#example4\}

`ORDER BY`가 있는 서브쿼리를 사용하여 결과를 안정화한 예입니다.

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
