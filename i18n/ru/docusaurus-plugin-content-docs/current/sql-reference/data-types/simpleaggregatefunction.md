---
slug: /sql-reference/data-types/simpleaggregatefunction
sidebar_position: 48
sidebar_label: SimpleAggregateFunction
---

# SimpleAggregateFunction

`SimpleAggregateFunction(name, types_of_arguments...)` — тип данных, который хранит текущее значение (промежуточное состояние) агрегатной функции, но не её полное состояние, как это делает [`AggregateFunction`](../../sql-reference/data-types/aggregatefunction.md). Эта оптимизация может быть применена к функциям, для которых выполняется следующее свойство: результат применения функции `f` к набору строк `S1 UNION ALL S2` может быть получен путем применения `f` к частям набора строк отдельно, а затем снова применения `f` к результатам: `f(S1 UNION ALL S2) = f(f(S1) UNION ALL f(S2))`. Это свойство гарантирует, что частичных результатов агрегации достаточно для вычисления комбинированного, поэтому нам не нужно хранить и обрабатывать дополнительные данные.

Общий способ получения значения агрегатной функции — это вызов агрегатной функции с суффиксом [-SimpleState](/sql-reference/aggregate-functions/combinators#-simplestate).

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
Значения `SimpleAggregateFunction(func, Type)` выглядят и хранятся так же, как и `Type`, так что вам не нужно применять функции с суффиксами `-Merge`/`-State`.

`SimpleAggregateFunction` имеет лучшую производительность, чем `AggregateFunction` с той же агрегатной функцией.
:::

**Параметры**

- Имя агрегатной функции.
- Типы аргументов агрегатной функции.

**Пример**

``` sql
CREATE TABLE simple (id UInt64, val SimpleAggregateFunction(sum, Double)) ENGINE=AggregatingMergeTree ORDER BY id;
```
