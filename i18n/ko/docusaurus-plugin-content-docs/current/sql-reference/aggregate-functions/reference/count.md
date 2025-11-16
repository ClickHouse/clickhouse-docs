---
'description': '행 또는 NULL이 아닌 값의 수를 계산합니다.'
'sidebar_position': 120
'slug': '/sql-reference/aggregate-functions/reference/count'
'title': 'count'
'doc_type': 'reference'
---


# count

행 수 또는 NULL이 아닌 값의 수를 계산합니다.

ClickHouse는 다음과 같은 `count` 구문을 지원합니다:

- `count(expr)` 또는 `COUNT(DISTINCT expr)`.
- `count()` 또는 `COUNT(*)`. `count()` 구문은 ClickHouse 전용입니다.

**인수**

함수는 다음을 받을 수 있습니다:

- 제로 매개변수.
- 하나의 [expression](/sql-reference/syntax#expressions).

**반환 값**

- 매개변수 없이 함수를 호출하면 행 수를 계산합니다.
- [expression](/sql-reference/syntax#expressions)이 전달되면, 함수는 이 표현식이 null이 아닌 값을 몇 번 반환했는지 계산합니다. 표현식이 [Nullable](../../../sql-reference/data-types/nullable.md) 타입의 값을 반환하는 경우, `count`의 결과는 `Nullable`이 아닙니다. 표현식이 모든 행에서 `NULL`을 반환하면 함수는 0을 반환합니다.

두 경우 모두 반환 값의 타입은 [UInt64](../../../sql-reference/data-types/int-uint.md)입니다.

**세부 사항**

ClickHouse는 `COUNT(DISTINCT ...)` 구문을 지원합니다. 이 구성의 동작은 [count_distinct_implementation](../../../operations/settings/settings.md#count_distinct_implementation) 설정에 따라 달라집니다. 이 설정은 어떤 [uniq\*](/sql-reference/aggregate-functions/reference/uniq) 함수가 작업을 수행하는 데 사용되는지를 정의합니다. 기본값은 [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact) 함수입니다.

`SELECT count() FROM table` 쿼리는 기본적으로 MergeTree의 메타데이터를 사용하여 최적화됩니다. 행 수준 보안을 사용해야 하는 경우, [optimize_trivial_count_query](/operations/settings/settings#optimize_trivial_count_query) 설정을 통해 최적화를 비활성화하세요.

그러나 `SELECT count(nullable_column) FROM table` 쿼리는 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 설정을 활성화하여 최적화할 수 있습니다. `optimize_functions_to_subcolumns = 1`일 경우, 함수는 전체 컬럼 데이터를 읽고 처리하는 대신 [null](../../../sql-reference/data-types/nullable.md#finding-null) 서브컬럼만 읽습니다. 쿼리 `SELECT count(n) FROM table`은 `SELECT sum(NOT n.null) FROM table`로 변환됩니다.

**COUNT(DISTINCT expr) 성능 향상**

`COUNT(DISTINCT expr)` 쿼리가 느린 경우, [`GROUP BY`](/sql-reference/statements/select/group-by) 절을 추가하는 것을 고려하세요. 이는 병렬 처리를 개선합니다. 또한 `COUNT(DISTINCT target_col)`과 함께 사용할 타겟 컬럼에 대한 인덱스를 만들기 위해 [projection](../../../sql-reference/statements/alter/projection.md)을 사용할 수 있습니다.

**예시**

예시 1:

```sql
SELECT count() FROM t
```

```text
┌─count()─┐
│       5 │
└─────────┘
```

예시 2:

```sql
SELECT name, value FROM system.settings WHERE name = 'count_distinct_implementation'
```

```text
┌─name──────────────────────────┬─value─────┐
│ count_distinct_implementation │ uniqExact │
└───────────────────────────────┴───────────┘
```

```sql
SELECT count(DISTINCT num) FROM t
```

```text
┌─uniqExact(num)─┐
│              3 │
└────────────────┘
```

이 예시는 `count(DISTINCT num)`이 `count_distinct_implementation` 설정 값을 기준으로 `uniqExact` 함수에 의해 수행됨을 보여줍니다.
