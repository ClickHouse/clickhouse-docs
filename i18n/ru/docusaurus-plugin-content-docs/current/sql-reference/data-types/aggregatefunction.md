---
slug: '/sql-reference/data-types/aggregatefunction'
sidebar_label: 'Тип AggregateFunction'
sidebar_position: 46
description: 'Документация для типа данных AggregateFunction в ClickHouse, который'
title: 'Тип AggregateFunction'
keywords: ['AggregateFunction', 'Тип']
doc_type: reference
---
# Тип AggregateFunction

## Описание {#description}

Все [Агрегатные функции](/sql-reference/aggregate-functions) в ClickHouse имеют
между состоянием, специфичный для реализации, который может быть сериализован в тип данных `AggregateFunction` и сохранен в таблице. Обычно это делается с помощью [материализованного представления](../../sql-reference/statements/create/view.md).

Существует два агрегатных функции [комбинатора](/sql-reference/aggregate-functions/combinators), которые обычно используются с типом `AggregateFunction`:

- Комбинатор [`-State`](/sql-reference/aggregate-functions/combinators#-state) агрегационной функции, который, когда добавляется к имени агрегатной функции, производит промежуточные состояния `AggregateFunction`.
- Комбинатор [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) агрегационной функции, который используется для получения окончательного результата агрегации из промежуточных состояний.

## Синтаксис {#syntax}

```sql
AggregateFunction(aggregate_function_name, types_of_arguments...)
```

**Параметры**

- `aggregate_function_name` - Имя агрегатной функции. Если функция
   является параметрической, то ее параметры также должны быть указаны.
- `types_of_arguments` - Типы аргументов агрегатной функции.

например:

```sql
CREATE TABLE t
(
    column1 AggregateFunction(uniq, UInt64),
    column2 AggregateFunction(anyIf, String, UInt8),
    column3 AggregateFunction(quantiles(0.5, 0.9), UInt64)
) ENGINE = ...
```

## Использование {#usage}

### Вставка данных {#data-insertion}

Для вставки данных в таблицу с колонками типа `AggregateFunction` можно использовать `INSERT SELECT` с агрегатными функциями и
комбинатором [`-State`](/sql-reference/aggregate-functions/combinators#-state) агрегатной функции.

Например, для вставки в колонки типа `AggregateFunction(uniq, UInt64)` и
`AggregateFunction(quantiles(0.5, 0.9), UInt64)` вы бы использовали следующие
агрегатные функции с комбинаторами.

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

В отличие от функций `uniq` и `quantiles`, `uniqState` и `quantilesState`
(с добавленным комбинатором `-State`) возвращают состояние, а не окончательное значение.
Другими словами, они возвращают значение типа `AggregateFunction`.

В результатах запроса `SELECT` значения типа `AggregateFunction` имеют
специфичные для реализации бинарные представления для всех форматов вывода ClickHouse.

Если вы сбрасываете данные, например, в формате `TabSeparated` с помощью запроса `SELECT`, то этот сброс может быть загружен обратно с помощью запроса `INSERT`.

### Выбор данных {#data-selection}

При выборе данных из таблицы `AggregatingMergeTree` используйте оператор `GROUP BY`
и те же агрегатные функции, что и при вставке данных, но используйте
комбинатор [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge).

Агрегатная функция с добавленным комбинатором `-Merge` берет набор
состояний, комбинирует их и возвращает результат полной агрегации данных.

Например, следующие два запроса возвращают одинаковый результат:

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## Пример использования {#usage-example}

Смотрите описание двигателя [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md).

## Связанный контент {#related-content}

- Блог: [Использование агрегатных комбинаторов в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- Комбинатор [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate).
- Комбинатор [State](/sql-reference/aggregate-functions/combinators#-state).