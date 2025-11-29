---
description: 'Документация по типу данных SimpleAggregateFunction'
sidebar_label: 'SimpleAggregateFunction'
sidebar_position: 48
slug: /sql-reference/data-types/simpleaggregatefunction
title: 'Тип данных SimpleAggregateFunction'
doc_type: 'reference'
---



# Тип SimpleAggregateFunction {#simpleaggregatefunction-type}



## Описание {#description}

Тип данных `SimpleAggregateFunction` хранит промежуточное состояние 
агрегатной функции, но не её полное состояние, как это делает тип 
[`AggregateFunction`](../../sql-reference/data-types/aggregatefunction.md).

Эта оптимизация может быть применена к функциям, для которых выполняется 
следующее свойство: 

> результат применения функции `f` к набору строк `S1 UNION ALL S2` может быть 
получен путём раздельного применения `f` к частям набора строк, а затем 
повторного применения `f` к результатам: `f(S1 UNION ALL S2) = f(f(S1) UNION ALL f(S2))`.

Это свойство гарантирует, что частичных результатов агрегации достаточно для
вычисления объединённого результата, поэтому нам не нужно хранить и обрабатывать
избыточные данные. Например, результат функций `min` или `max` не требует
дополнительных шагов для вычисления окончательного результата из
промежуточных шагов, тогда как функция `avg` требует хранения суммы и
количества, которые затем делятся для получения среднего значения
на заключительном шаге `Merge`, объединяющем промежуточные состояния.

Значения агрегатных функций обычно получаются путём вызова агрегатной функции
с комбинатором [`-SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate), добавленным к имени функции.



## Синтаксис {#syntax}

```sql
SimpleAggregateFunction(aggregate_function_name, types_of_arguments...)
```

**Параметры**

* `aggregate_function_name` — имя агрегатной функции.
* `Type` — типы аргументов агрегатной функции.


## Поддерживаемые функции {#supported-functions}

Поддерживаются следующие агрегатные функции:

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
Значения типа `SimpleAggregateFunction(func, Type)` имеют тот же тип `Type`, 
поэтому в отличие от типа `AggregateFunction` нет необходимости применять 
комбинаторы `-Merge`/`-State`.

Тип `SimpleAggregateFunction` обеспечивает более высокую производительность, чем `AggregateFunction`
для одних и тех же агрегатных функций.
:::



## Пример {#example}



```sql
CREATE TABLE simple (id UInt64, val SimpleAggregateFunction(sum, Double)) ENGINE=AggregatingMergeTree ORDER BY id;
```

## Связанные материалы {#related-content}

* Блог: [Использование агрегатных комбинаторов в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)    - Блог: [Использование агрегатных комбинаторов в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
* Тип данных [AggregateFunction](/sql-reference/data-types/aggregatefunction).
