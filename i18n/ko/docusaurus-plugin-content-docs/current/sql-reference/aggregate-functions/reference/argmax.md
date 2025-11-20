---
'description': '최대 `val` 값에 대한 `arg` 값을 계산합니다.'
'sidebar_position': 109
'slug': '/sql-reference/aggregate-functions/reference/argmax'
'title': 'argMax'
'doc_type': 'reference'
---


# argMax

최대 `val` 값에 대한 `arg` 값을 계산합니다. 동일한 `val`이 최대인 여러 행이 있는 경우, 관련된 `arg` 중 어떤 것이 반환되는지는 결정적이지 않습니다. 두 부분인 `arg`와 `max`는 [집계 함수](/sql-reference/aggregate-functions/index.md)처럼 동작하며, 처리 중에 [Null을 건너뜁니다](/sql-reference/aggregate-functions/index.md#null-processing) 그리고 사용할 수 있는 `Null` 값이 아닌 값을 반환합니다.

**구문**

```sql
argMax(arg, val)
```

**매개변수**

- `arg` — 인자.
- `val` — 값.

**반환 값**

- 최대 `val` 값에 해당하는 `arg` 값.

유형: `arg` 유형과 일치합니다.

**예시**

입력 테이블:

```text
┌─user─────┬─salary─┐
│ director │   5000 │
│ manager  │   3000 │
│ worker   │   1000 │
└──────────┴────────┘
```

쿼리:

```sql
SELECT argMax(user, salary) FROM salary;
```

결과:

```text
┌─argMax(user, salary)─┐
│ director             │
└──────────────────────┘
```

**확장 예시**

```sql
CREATE TABLE test
(
    a Nullable(String),
    b Nullable(Int64)
)
ENGINE = Memory AS
SELECT *
FROM VALUES(('a', 1), ('b', 2), ('c', 2), (NULL, 3), (NULL, NULL), ('d', NULL));

SELECT * FROM test;
┌─a────┬────b─┐
│ a    │    1 │
│ b    │    2 │
│ c    │    2 │
│ ᴺᵁᴸᴸ │    3 │
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │
│ d    │ ᴺᵁᴸᴸ │
└──────┴──────┘

SELECT argMax(a, b), max(b) FROM test;
┌─argMax(a, b)─┬─max(b)─┐
│ b            │      3 │ -- argMax = 'b' because it the first not Null value, max(b) is from another row!
└──────────────┴────────┘

SELECT argMax(tuple(a), b) FROM test;
┌─argMax(tuple(a), b)─┐
│ (NULL)              │ -- The a `Tuple` that contains only a `NULL` value is not `NULL`, so the aggregate functions won't skip that row because of that `NULL` value
└─────────────────────┘

SELECT (argMax((a, b), b) as t).1 argMaxA, t.2 argMaxB FROM test;
┌─argMaxA─┬─argMaxB─┐
│ ᴺᵁᴸᴸ    │       3 │ -- you can use Tuple and get both (all - tuple(*)) columns for the according max(b)
└─────────┴─────────┘

SELECT argMax(a, b), max(b) FROM test WHERE a IS NULL AND b IS NULL;
┌─argMax(a, b)─┬─max(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- All aggregated rows contains at least one `NULL` value because of the filter, so all rows are skipped, therefore the result will be `NULL`
└──────────────┴────────┘

SELECT argMax(a, (b,a)) FROM test;
┌─argMax(a, tuple(b, a))─┐
│ c                      │ -- There are two rows with b=2, `Tuple` in the `Max` allows to get not the first `arg`
└────────────────────────┘

SELECT argMax(a, tuple(b)) FROM test;
┌─argMax(a, tuple(b))─┐
│ b                   │ -- `Tuple` can be used in `Max` to not skip Nulls in `Max`
└─────────────────────┘
```

**참고**

- [튜플](/sql-reference/data-types/tuple.md)
