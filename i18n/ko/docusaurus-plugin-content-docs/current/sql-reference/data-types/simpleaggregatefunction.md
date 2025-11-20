---
'description': 'SimpleAggregateFunction 데이터 유형에 대한 문서'
'sidebar_label': 'SimpleAggregateFunction'
'sidebar_position': 48
'slug': '/sql-reference/data-types/simpleaggregatefunction'
'title': 'SimpleAggregateFunction 유형'
'doc_type': 'reference'
---


# SimpleAggregateFunction Type

## Description {#description}

`SimpleAggregateFunction` 데이터 유형은 집계 함수의 중간 상태를 저장하지만, [`AggregateFunction`](../../sql-reference/data-types/aggregatefunction.md) 유형처럼 전체 상태는 저장하지 않습니다.

이 최적화는 다음 속성이 성립하는 함수에 적용할 수 있습니다: 

> 함수 `f`를 행 집합 `S1 UNION ALL S2`에 적용하는 결과는 행 집합의 각 부분에 대해 `f`를 다시 적용하고 결과에 다시 `f`를 적용함으로써 얻을 수 있습니다: `f(S1 UNION ALL S2) = f(f(S1) UNION ALL f(S2))`.

이 속성은 부분 집계 결과가 결합된 결과를 계산하는 데 충분하다는 것을 보장하므로, 추가 데이터를 저장하고 처리할 필요가 없습니다. 예를 들어, `min` 또는 `max` 함수의 결과는 중간 단계에서 최종 결과를 계산하는 추가 단계가 필요하지 않지만, `avg` 함수는 최종 `Merge` 단계에서 평균을 얻기 위해 나눌 합계와 카운트를 추적해야 합니다.

집계 함수 값은 일반적으로 함수 이름에 [`-SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 조합자를 추가하여 집계 함수를 호출함으로써 생성됩니다.

## Syntax {#syntax}

```sql
SimpleAggregateFunction(aggregate_function_name, types_of_arguments...)
```

**Parameters**

- `aggregate_function_name` - 집계 함수의 이름.
- `Type` - 집계 함수 인수의 유형.

## Supported functions {#supported-functions}

다음의 집계 함수가 지원됩니다:

- [`any`](/sql-reference/aggregate-functions/reference/any)
- [`any_respect_nulls`](/sql-reference/aggregate-functions/reference/any)
- [`anyLast`](/sql-reference/aggregate-functions/reference/anylast)
- [`anyLast_respect_nulls`](/sql-reference/aggregate-functions/reference/anylast)
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`sumWithOverflow`](/sql-reference/aggregate-functions/reference/sumwithoverflow)
- [`groupBitAnd`](/sql-reference/aggregate-functions/reference/groupbitand)
- [`groupBitOr`](/sql-reference/aggregate-functions/reference/groupbitor)
- [`groupBitXor`](/sql-reference/aggregate-functions/reference/groupbitxor)
- [`groupArrayArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`groupUniqArrayArray`](../../sql-reference/aggregate-functions/reference/groupuniqarray.md)
- [`groupUniqArrayArrayMap`](../../sql-reference/aggregate-functions/combinators#-map)
- [`sumMap`](/sql-reference/aggregate-functions/reference/summap)
- [`minMap`](/sql-reference/aggregate-functions/reference/minmap)
- [`maxMap`](/sql-reference/aggregate-functions/reference/maxmap)

:::note
`SimpleAggregateFunction(func, Type)`의 값들은 동일한 `Type`을 가지므로, `AggregateFunction` 유형의 경우와는 달리 `-Merge`/`-State` 조합자를 적용할 필요가 없습니다.

`SimpleAggregateFunction` 유형은 동일한 집계 함수에 대해 `AggregateFunction`보다 더 나은 성능을 갖습니다.
:::

## Example {#example}

```sql
CREATE TABLE simple (id UInt64, val SimpleAggregateFunction(sum, Double)) ENGINE=AggregatingMergeTree ORDER BY id;
```
## Related Content {#related-content}

- 블로그: [ClickHouse에서 집계 조합자 사용하기](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)    - 블로그: [ClickHouse에서 집계 조합자 사용하기](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [AggregateFunction](/sql-reference/data-types/aggregatefunction) 유형.
