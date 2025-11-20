---
'description': 'ClickHouse에서 집계 함수의 중간 상태를 저장하는 AggregateFunction 데이터 유형에 대한 문서'
'keywords':
- 'AggregateFunction'
- 'Type'
'sidebar_label': 'AggregateFunction'
'sidebar_position': 46
'slug': '/sql-reference/data-types/aggregatefunction'
'title': 'AggregateFunction 유형'
'doc_type': 'reference'
---


# AggregateFunction Type

## Description {#description}

ClickHouse의 모든 [Aggregate functions](/sql-reference/aggregate-functions) 는 
`AggregateFunction` 데이터 유형으로 직렬화할 수 있는 구현별 중간 상태를 가지고 있으며, 이를 테이블에 저장할 수 있습니다. 이는 일반적으로 
[물리화된 뷰](../../sql-reference/statements/create/view.md)를 통해 수행됩니다.

`AggregateFunction` 유형과 함께 일반적으로 사용되는 두 가지 집계 함수 [combinators](/sql-reference/aggregate-functions/combinators)가 있습니다:

- [`-State`](/sql-reference/aggregate-functions/combinators#-state) 집계 함수 combinator는 집계 함수 이름에 추가되면 `AggregateFunction` 중간 상태를 생성합니다.
- [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 집계 함수 combinator는 중간 상태에서 집계의 최종 결과를 얻는 데 사용됩니다.

## Syntax {#syntax}

```sql
AggregateFunction(aggregate_function_name, types_of_arguments...)
```

**Parameters**

- `aggregate_function_name` - 집계 함수의 이름입니다. 함수가 매개변수를 요구하는 경우 해당 매개변수도 지정해야 합니다.
- `types_of_arguments` - 집계 함수 인자의 유형입니다.

예를 들어:

```sql
CREATE TABLE t
(
    column1 AggregateFunction(uniq, UInt64),
    column2 AggregateFunction(anyIf, String, UInt8),
    column3 AggregateFunction(quantiles(0.5, 0.9), UInt64)
) ENGINE = ...
```

## Usage {#usage}

### Data Insertion {#data-insertion}

`AggregateFunction` 유형의 컬럼이 있는 테이블에 데이터를 삽입하려면 
집계 함수와 [`-State`](/sql-reference/aggregate-functions/combinators#-state) 집계 함수 combinator를 사용하여 `INSERT SELECT`를 사용할 수 있습니다.

예를 들어, `AggregateFunction(uniq, UInt64)` 및
`AggregateFunction(quantiles(0.5, 0.9), UInt64)` 유형의 컬럼에 삽입하려면 
다음 집계 함수와 combinators를 사용할 수 있습니다.

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

함수 `uniq` 및 `quantiles`와는 대조적으로, `uniqState` 및 `quantilesState` 
(여기에 `-State` combinator가 추가됨)는 최종 값이 아닌 상태를 반환합니다. 
즉, 이들은 `AggregateFunction` 유형의 값을 반환합니다.

`SELECT` 쿼리의 결과에서 `AggregateFunction` 유형의 값은 
ClickHouse 출력 형식에 대해 구현별 이진 표현을 가지고 있습니다.

예를 들어 `TabSeparated` 형식으로 데이터를 덤프하면 `SELECT` 쿼리를 통해 
이 덤프를 다시 로드할 수 있습니다.

### Data Selection {#data-selection}

`AggregatingMergeTree` 테이블에서 데이터를 선택할 때는 `GROUP BY` 절과 
데이터를 삽입할 때 사용한 것과 동일한 집계 함수, 그러나 [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 
combinator를 사용해야 합니다.

`-Merge` combinator가 추가된 집계 함수는 상태 집합을 가져와 결합하고 
완전한 데이터 집계의 결과를 반환합니다.

예를 들어, 아래의 두 쿼리는 동일한 결과를 반환합니다:

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## Usage Example {#usage-example}

[AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 엔진 설명을 참조하십시오.

## Related Content {#related-content}

- 블로그: [ClickHouse에서 Aggregate Combinators 사용하기](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate) combinator.
- [State](/sql-reference/aggregate-functions/combinators#-state) combinator.
