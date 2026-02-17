---
description: 'SimpleAggregateFunction 데이터 타입에 대한 문서'
sidebar_label: 'SimpleAggregateFunction'
sidebar_position: 48
slug: /sql-reference/data-types/simpleaggregatefunction
title: 'SimpleAggregateFunction 타입'
doc_type: 'reference'
---

# SimpleAggregateFunction 데이터 타입 \{#simpleaggregatefunction-type\}

## Description \{#description\}

`SimpleAggregateFunction` 데이터 타입은 [`AggregateFunction`](../../sql-reference/data-types/aggregatefunction.md) 타입처럼 집계 함수의 전체 상태가 아니라, 집계 함수의 중간 상태만을 저장합니다.

이 최적화는 다음과 같은 성질을 만족하는 함수에 적용할 수 있습니다:

> 함수 `f`를 행 집합 `S1 UNION ALL S2`에 적용한 결과는,  
행 집합의 각 부분에 개별적으로 `f`를 적용한 뒤, 그 결과에 다시  
`f`를 적용함으로써 얻을 수 있습니다: `f(S1 UNION ALL S2) = f(f(S1) UNION ALL f(S2))`.

이 성질은 결합된 결과를 계산하는 데 부분 집계 결과만으로도 충분함을 보장하므로, 
추가 데이터를 저장하거나 처리할 필요가 없습니다. 예를 들어 `min` 또는 `max` 함수의 결과는 
중간 단계에서 최종 결과를 계산하기 위해 별도의 추가 단계가 필요하지 않지만, 
`avg` 함수는 최종적으로 중간 상태를 결합하는 `Merge` 단계에서 평균을 계산하기 위해 
합계와 개수를 함께 유지해야 하며, 이 두 값을 나누어 평균을 구합니다.

집계 함수 값은 일반적으로 함수 이름에 [`-SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 
콤비네이터를 붙여 집계 함수를 호출하여 생성합니다.

## 구문 \{#syntax\}

```sql
SimpleAggregateFunction(aggregate_function_name, types_of_arguments...)
```

**매개변수**

* `aggregate_function_name` - 집계 함수의 이름입니다.
* `Type` - 집계 함수 인수의 유형입니다.


## 지원되는 함수 \{#supported-functions\}

다음 집계 함수를 지원합니다:

- [`any`](/sql-reference/aggregate-functions/reference/any.md)
- [`any_respect_nulls`](/sql-reference/aggregate-functions/reference/any.md)
- [`anyLast`](/sql-reference/aggregate-functions/reference/anyLast.md)
- [`anyLast_respect_nulls`](/sql-reference/aggregate-functions/reference/anyLast.md)
- [`min`](/sql-reference/aggregate-functions/reference/min.md)
- [`max`](/sql-reference/aggregate-functions/reference/max.md)
- [`sum`](/sql-reference/aggregate-functions/reference/sum.md)
- [`sumWithOverflow`](/sql-reference/aggregate-functions/reference/sumWithOverflow.md)
- [`groupBitAnd`](/sql-reference/aggregate-functions/reference/groupBitAnd.md)
- [`groupBitOr`](/sql-reference/aggregate-functions/reference/groupBitOr.md)
- [`groupBitXor`](/sql-reference/aggregate-functions/reference/groupBitXor.md)
- [`groupArrayArray`](/sql-reference/aggregate-functions/reference/groupArrayArray.md)
- [`groupUniqArrayArray`](../../sql-reference/aggregate-functions/reference/groupUniqArray.md)
- [`groupUniqArrayArrayMap`](../../sql-reference/aggregate-functions/combinators#-map)
- [`sumMap` (`sumMappedArrays`)](/sql-reference/aggregate-functions/reference/sumMappedArrays.md)
- [`minMap` (`minMappedArrays`)](/sql-reference/aggregate-functions/reference/minMappedArrays.md)
- [`maxMap` (`maxMappedArrays`)](/sql-reference/aggregate-functions/reference/maxMappedArrays.md)

:::note
`SimpleAggregateFunction(func, Type)`의 값은 동일한 `Type`을 가지므로
`AggregateFunction` 타입과 달리 `-Merge`/`-State` 조합자를 적용할 필요가 없습니다.

동일한 집계 함수에 대해서는 `SimpleAggregateFunction` 타입이 `AggregateFunction`보다 성능이 더 좋습니다.
:::

## 예제 \{#example\}

```sql
CREATE TABLE simple (id UInt64, val SimpleAggregateFunction(sum, Double)) ENGINE=AggregatingMergeTree ORDER BY id;
```


## 관련 콘텐츠 \{#related-content\}

- 블로그: [Using Aggregate Combinators in ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)    - 블로그: [Using Aggregate Combinators in ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [AggregateFunction](/sql-reference/data-types/aggregatefunction) 데이터 타입.