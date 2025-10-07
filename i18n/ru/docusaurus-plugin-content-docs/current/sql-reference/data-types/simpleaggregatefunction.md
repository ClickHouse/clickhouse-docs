---
slug: '/sql-reference/data-types/simpleaggregatefunction'
sidebar_label: SimpleAggregateFunction
sidebar_position: 48
description: 'Документация для типа данных SimpleAggregateFunction'
title: 'Тип SimpleAggregateFunction'
doc_type: reference
---
# Тип SimpleAggregateFunction

## Описание {#description}

Тип данных `SimpleAggregateFunction` хранит промежуточное состояние агрегатной функции, но не её полное состояние, как это делает тип [`AggregateFunction`](../../sql-reference/data-types/aggregatefunction.md).

Эта оптимизация может быть применена к функциям, для которых выполняется следующее свойство:

> Результат применения функции `f` к множеству строк `S1 UNION ALL S2` можно получить, применив `f` к частям множества строк отдельно, а затем снова применив `f` к результатам: `f(S1 UNION ALL S2) = f(f(S1) UNION ALL f(S2))`.

Это свойство гарантирует, что частичные результаты агрегации достаточно для вычисления объединенного результата, таким образом, нам не нужно хранить и обрабатывать какие-либо дополнительные данные. Например, результат функций `min` или `max` не требует дополнительных шагов для вычисления окончательного результата из промежуточных шагов, тогда как функция `avg` требует отслеживания суммы и количества, которые будут делиться, чтобы получить среднее значение на финальном этапе `Merge`, который объединяет промежуточные состояния.

Значения агрегатных функций обычно получаются путём вызова агрегатной функции с добавлением комбинирующего оператора [`-SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) к имени функции.

## Синтаксис {#syntax}

```sql
SimpleAggregateFunction(aggregate_function_name, types_of_arguments...)
```

**Параметры**

- `aggregate_function_name` - Имя агрегатной функции.
- `Type` - Типы аргументов агрегатной функции.

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
Значения `SimpleAggregateFunction(func, Type)` имеют тот же `Type`, 
так что в отличие от типа `AggregateFunction` нет необходимости применять 
комбинирующие операторы `-Merge`/`-State`.

Тип `SimpleAggregateFunction` имеет лучшую производительность, чем `AggregateFunction`
для тех же агрегатных функций.
:::

## Пример {#example}

```sql
CREATE TABLE simple (id UInt64, val SimpleAggregateFunction(sum, Double)) ENGINE=AggregatingMergeTree ORDER BY id;
```
## Связанный контент {#related-content}

- Блог: [Использование агрегатных комбинаторов в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)    - Блог: [Использование агрегатных комбинаторов в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- Тип [`AggregateFunction`](/sql-reference/data-types/aggregatefunction).