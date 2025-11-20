---
'description': '최소 `val` 값에 대한 `arg` 값을 계산합니다. 동일한 `val`을 가진 여러 행이 있을 경우, 어떤 연관된 `arg`가
  반환될지는 비결정적입니다.'
'sidebar_position': 110
'slug': '/sql-reference/aggregate-functions/reference/argmin'
'title': 'argMin'
'doc_type': 'reference'
---


# argMin

최소 `val` 값에 대한 `arg` 값을 계산합니다. 동일한 `val` 값을 가진 여러 행이 있는 경우, 반환되는 관련 `arg` 중 어느 것이든 결정적이지 않습니다. `arg`와 `min` 모두 [집계 함수](/sql-reference/aggregate-functions/index.md)로 동작하며, 처리 중에 [`Null`을 건너뛰고](/sql-reference/aggregate-functions/index.md#null-processing) 사용 가능한 `Null`이 아닌 값을 반환합니다.

**문법**

```sql
argMin(arg, val)
```

**인수**

- `arg` — 인수.
- `val` — 값.

**반환 값**

- 최소 `val` 값에 해당하는 `arg` 값.

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
SELECT argMin(user, salary) FROM salary
```

결과:

```text
┌─argMin(user, salary)─┐
│ worker               │
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
FROM VALUES((NULL, 0), ('a', 1), ('b', 2), ('c', 2), (NULL, NULL), ('d', NULL));

SELECT * FROM test;
┌─a────┬────b─┐
│ ᴺᵁᴸᴸ │    0 │
│ a    │    1 │
│ b    │    2 │
│ c    │    2 │
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │
│ d    │ ᴺᵁᴸᴸ │
└──────┴──────┘

SELECT argMin(a, b), min(b) FROM test;
┌─argMin(a, b)─┬─min(b)─┐
│ a            │      0 │ -- argMin = a because it the first not `NULL` value, min(b) is from another row!
└──────────────┴────────┘

SELECT argMin(tuple(a), b) FROM test;
┌─argMin(tuple(a), b)─┐
│ (NULL)              │ -- The a `Tuple` that contains only a `NULL` value is not `NULL`, so the aggregate functions won't skip that row because of that `NULL` value
└─────────────────────┘

SELECT (argMin((a, b), b) as t).1 argMinA, t.2 argMinB from test;
┌─argMinA─┬─argMinB─┐
│ ᴺᵁᴸᴸ    │       0 │ -- you can use `Tuple` and get both (all - tuple(*)) columns for the according max(b)
└─────────┴─────────┘

SELECT argMin(a, b), min(b) FROM test WHERE a IS NULL and b IS NULL;
┌─argMin(a, b)─┬─min(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- All aggregated rows contains at least one `NULL` value because of the filter, so all rows are skipped, therefore the result will be `NULL`
└──────────────┴────────┘

SELECT argMin(a, (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(a, tuple(b, a))─┬─min(tuple(b, a))─┐
│ d                      │ (NULL,NULL)      │ -- 'd' is the first not `NULL` value for the min
└────────────────────────┴──────────────────┘

SELECT argMin((a, b), (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(tuple(a, b), tuple(b, a))─┬─min(tuple(b, a))─┐
│ (NULL,NULL)                      │ (NULL,NULL)      │ -- argMin returns (NULL,NULL) here because `Tuple` allows to don't skip `NULL` and min(tuple(b, a)) in this case is minimal value for this dataset
└──────────────────────────────────┴──────────────────┘

SELECT argMin(a, tuple(b)) FROM test;
┌─argMin(a, tuple(b))─┐
│ d                   │ -- `Tuple` can be used in `min` to not skip rows with `NULL` values as b.
└─────────────────────┘
```

**참고**

- [Tuple](/sql-reference/data-types/tuple.md)
