---
description: '집계 함수의 중간 상태를 저장하는 ClickHouse의 AggregateFunction 데이터 타입 문서입니다.'
keywords: ['AggregateFunction', 'Type']
sidebar_label: 'AggregateFunction'
sidebar_position: 46
slug: /sql-reference/data-types/aggregatefunction
title: 'AggregateFunction 타입'
doc_type: 'reference'
---

# AggregateFunction 데이터 타입 \{#aggregatefunction-type\}

## 설명 \{#description\}

ClickHouse의 모든 [집계 함수](/sql-reference/aggregate-functions)는
구현 방식에 따라 달라지는 중간 상태를 가지며, 이 상태는 `AggregateFunction`
데이터 타입으로 직렬화해 테이블에 저장할 수 있습니다. 이는 보통
[materialized view](../../sql-reference/statements/create/view.md)를 사용해 수행합니다.

`AggregateFunction` 타입과 함께 일반적으로 사용되는 집계 함수
[combinator](/sql-reference/aggregate-functions/combinators)는 두 가지가 있습니다:

- 집계 함수 이름 뒤에 붙여서 `AggregateFunction` 중간 상태를 생성하는
  [`-State`](/sql-reference/aggregate-functions/combinators#-state) 집계 함수 combinator.
- 중간 상태로부터 집계의 최종 결과를 얻는 데 사용되는
  [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 집계 함수 combinator.

## 구문 \{#syntax\}

```sql
AggregateFunction(aggregate_function_name, types_of_arguments...)
```

**매개변수**

* `aggregate_function_name` - 집계 함수의 이름입니다. 함수가 매개변수화된(parametric) 함수라면 해당 매개변수도 함께 지정해야 합니다.
* `types_of_arguments` - 집계 함수 인자들의 타입입니다.

예를 들어:

```sql
CREATE TABLE t
(
    column1 AggregateFunction(uniq, UInt64),
    column2 AggregateFunction(anyIf, String, UInt8),
    column3 AggregateFunction(quantiles(0.5, 0.9), UInt64)
) ENGINE = ...
```


## 사용 \{#usage\}

### 데이터 삽입 \{#data-insertion\}

`AggregateFunction` 타입의 컬럼이 있는 테이블에 데이터를 삽입하려면,
집계 함수와 [`-State`](/sql-reference/aggregate-functions/combinators#-state) 집계
함수 조합자를 사용한 `INSERT SELECT`를 사용할 수 있습니다.

예를 들어 `AggregateFunction(uniq, UInt64)` 타입 컬럼과
`AggregateFunction(quantiles(0.5, 0.9), UInt64)` 타입 컬럼에 데이터를 삽입하려면,
다음과 같은 조합자가 적용된 집계 함수를 사용합니다.

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

함수 `uniq` 및 `quantiles`와 달리, `uniqState` 및 `quantilesState`
(`-State` 콤비네이터가 추가된 형태)는 최종 값이 아니라 상태(state)를 반환합니다.
다시 말해, `AggregateFunction` 타입의 값을 반환합니다.

`SELECT` 쿼리 결과에서 `AggregateFunction` 타입의 값은
모든 ClickHouse 출력 포맷에서 구현별 이진 표현을 가집니다.

입력값으로부터 상태를 생성할 수 있도록 하는 세션(Session) 수준의 특별한 설정 `aggregate_function_input_format`이 있습니다.
다음과 같은 포맷을 지원합니다:

* `state` - 직렬화된 상태를 담은 이진 문자열(기본값)입니다.
  예를 들어 `SELECT` 쿼리로 데이터를 `TabSeparated` 포맷으로 덤프했다면,
  이 덤프를 `INSERT` 쿼리를 사용하여 다시 로드할 수 있습니다.
* `value` - 집계 함수의 인자 하나의 값, 또는 여러 인자의 경우 이들의 튜플을 입력으로 받으며, 이를 역직렬화하여 해당 상태를 구성합니다.
* `array` - 위의 value 옵션에서 설명한 값들의 Array를 입력으로 받으며, 배열의 모든 요소를 집계하여 상태를 구성합니다.


### 데이터 선택 \{#data-selection\}

`AggregatingMergeTree` 테이블에서 데이터를 조회할 때는 `GROUP BY` 절과,
데이터를 삽입할 때 사용한 것과 동일한 집계 함수를 사용하되,
[`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 조합자를 사용합니다.

`-Merge` 조합자가 추가된 집계 함수는 상태들의 집합을 입력으로 받아 이를 결합하고,
완전한 데이터 집계 결과를 반환합니다.

예를 들어, 다음 두 쿼리는 동일한 결과를 반환합니다.

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```


## 사용 예 \{#usage-example\}

[AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 엔진에 대한 설명을 참고하십시오.

## 관련 콘텐츠 \{#related-content\}

- 블로그 게시글: [Using Aggregate Combinators in ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate)
  조합자(combinator).
- [State](/sql-reference/aggregate-functions/combinators#-state) 조합자(combinator).