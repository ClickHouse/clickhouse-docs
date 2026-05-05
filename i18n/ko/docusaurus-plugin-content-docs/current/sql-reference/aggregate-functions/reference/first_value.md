---
description: 'any의 별칭(alias)이지만 Window Functions와의 호환성을 위해 도입되었습니다. Window Functions에서는 때때로 `NULL` 값을 처리해야 하는데, 기본적으로 모든 ClickHouse 집계 함수는 `NULL` 값을 무시합니다.'
slug: /sql-reference/aggregate-functions/reference/first_value
title: 'first_value'
doc_type: 'reference'
---

# first_value \{#first_value\}

[`any`](../../../sql-reference/aggregate-functions/reference/any.md)의 별칭이며, [Window Functions](../../window-functions/index.md)과의 호환성을 위해 도입되었습니다. 기본적으로 모든 ClickHouse 집계 함수는 `NULL` 값을 무시하므로, Window Functions에서는 때때로 이러한 `NULL` 값을 그대로 처리해야 할 때 이 함수를 사용합니다.

[Window Functions](../../window-functions/index.md)와 일반 집계 모두에서 `NULL` 값을 고려하도록 하는 수정자(`RESPECT NULLS`) 선언을 지원합니다.

`any`와 마찬가지로, Window Functions 없이 사용하면 소스 스트림이 정렬되어 있지 않은 경우 결과는 임의로 결정되며, 반환 타입은 입력 타입과 일치합니다(입력이 널 허용(Nullable)이거나 -OrNull 조합자가 추가된 경우에만 Null이 반환됩니다).

## 예시 \{#examples\}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) VALUES (1,null), (2,3), (4, 5), (6,null);
```

### 예시 1 \{#example1\}

기본적으로 NULL 값은 무시됩니다.

```sql
SELECT first_value(b) FROM test_data;
```

```text
┌─any(b)─┐
│      3 │
└────────┘
```

### 예시 2 \{#example2\}

NULL 값은 무시됩니다.

```sql
SELECT first_value(b) ignore nulls FROM test_data
```

```text
┌─any(b) IGNORE NULLS ─┐
│                    3 │
└──────────────────────┘
```

### 예시 3 \{#example3\}

NULL 값을 허용합니다.

```sql
SELECT first_value(b) respect nulls FROM test_data
```

```text
┌─any(b) RESPECT NULLS ─┐
│                  ᴺᵁᴸᴸ │
└───────────────────────┘
```

### Example 4 \{#example4\}

결과를 안정적으로 만들기 위해 `ORDER BY`가 포함된 서브쿼리를 사용합니다.

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
