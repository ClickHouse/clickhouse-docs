---
'description': '이것은 모든 것에 대한 별칭이지만, 때때로 `NULL` 값을 처리해야 할 필요가 있는 Window Functions와의
  호환성을 위해 도입되었습니다 (기본적으로 모든 ClickHouse 집계 함수는 NULL 값을 무시합니다).'
'sidebar_position': 137
'slug': '/sql-reference/aggregate-functions/reference/first_value'
'title': 'first_value'
'doc_type': 'reference'
---


# first_value

이는 [`any`](../../../sql-reference/aggregate-functions/reference/any.md)의 별칭이지만, [Window Functions](../../window-functions/index.md)와의 호환성을 위해 도입되었습니다. 이 경우 때때로 `NULL` 값을 처리하는 것이 필요합니다 (기본적으로 모든 ClickHouse 집계 함수는 NULL 값을 무시합니다).

이는 [Window Functions](../../window-functions/index.md)와 일반 집계 모두에서 null을 존중하는 수식을 선언할 수 있도록 지원합니다 (`RESPECT NULLS`).

`any`와 마찬가지로 Window Functions 없이 결과는 소스 스트림이 정렬되지 않은 경우 무작위일 수 있으며, 반환 유형이 입력 유형과 일치합니다 (입력이 Nullable이거나 -OrNull 조합기가 추가된 경우에만 Null이 반환됩니다).

## examples {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) VALUES (1,null), (2,3), (4, 5), (6,null);
```

### Example 1 {#example1}
기본적으로 NULL 값은 무시됩니다.
```sql
SELECT first_value(b) FROM test_data;
```

```text
┌─any(b)─┐
│      3 │
└────────┘
```

### Example 2 {#example2}
NULL 값은 무시됩니다.
```sql
SELECT first_value(b) ignore nulls FROM test_data
```

```text
┌─any(b) IGNORE NULLS ─┐
│                    3 │
└──────────────────────┘
```

### Example 3 {#example3}
NULL 값은 허용됩니다.
```sql
SELECT first_value(b) respect nulls FROM test_data
```

```text
┌─any(b) RESPECT NULLS ─┐
│                  ᴺᵁᴸᴸ │
└───────────────────────┘
```

### Example 4 {#example4}
`ORDER BY`와 함께 서브 쿼리를 사용하여 안정된 결과.
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
