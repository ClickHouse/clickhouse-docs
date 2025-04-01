---
description: 'Документация по типу данных SimpleAggregateFunction'
sidebar_label: 'SimpleAggregateFunction'
sidebar_position: 48
slug: /sql-reference/data-types/simpleaggregatefunction
title: 'Тип SimpleAggregateFunction'
---


# Тип SimpleAggregateFunction

## Описание {#description}

Тип данных `SimpleAggregateFunction` хранит промежуточное состояние агрегатной функции, но не её полное состояние, как это делает тип [`AggregateFunction`](../../sql-reference/data-types/aggregatefunction.md).

Эта оптимизация может быть применена к функциям, для которых выполняется следующее свойство:

> результат применения функции `f` к набору строк `S1 UNION ALL S2` можно получить, применив `f` к частям набора строк отдельно, а затем снова применив `f` к результатам: `f(S1 UNION ALL S2) = f(f(S1) UNION ALL f(S2))`.

Это свойство гарантирует, что частичные результаты агрегации достаточно для вычисления комбинированного результата, поэтому нам не нужно хранить и обрабатывать какие-либо дополнительные данные. Например, результат функций `min` или `max` не требует дополнительных шагов для вычисления окончательного результата из промежуточных шагов, в то время как функция `avg` требует отслеживания суммы и количества, которые будут делиться для получения среднего в окончательном шаге `Merge`, который объединяет промежуточные состояния.

Значения агрегатной функции обычно производятся путем вызова агрегатной функции с добавленным к имени функции комбинирующим вариантом [`-SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate).

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
- [`anyLast`](/sql-reference/aggregate-functions/reference/anylast)
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
Значения `SimpleAggregateFunction(func, Type)` имеют тот же `Type`, поэтому в отличие от типа `AggregateFunction` нет необходимости применять комбинирующие варианты `-Merge`/`-State`.

Тип `SimpleAggregateFunction` имеет лучшую производительность, чем `AggregateFunction` для одинаковых агрегатных функций.
:::

## Пример {#example}

```sql
CREATE TABLE simple (id UInt64, val SimpleAggregateFunction(sum, Double)) ENGINE=AggregatingMergeTree ORDER BY id;
```
## Связанный контент {#related-content}

- Блог: [Использование агрегатных комбинирующих функций в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)   
- [Тип AggregateFunction](/sql-reference/data-types/aggregatefunction).
