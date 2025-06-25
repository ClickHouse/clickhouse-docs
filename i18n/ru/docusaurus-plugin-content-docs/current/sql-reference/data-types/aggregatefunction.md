---
description: 'Документация для типа данных AggregateFunction в ClickHouse, который хранит промежуточные состояния агрегатных функций'
keywords: ['AggregateFunction', 'Тип']
sidebar_label: 'Тип AggregateFunction'
sidebar_position: 46
slug: /sql-reference/data-types/aggregatefunction
title: 'Тип AggregateFunction'
---


# Тип AggregateFunction

## Описание {#description}

Все [агрегатные функции](/sql-reference/aggregate-functions) в ClickHouse имеют промежуточное состояние, зависящее от реализации, которое может быть сериализовано в тип данных `AggregateFunction` и храниться в таблице. Это обычно происходит с помощью [материализованного представления](../../sql-reference/statements/create/view.md).

Существует два объединителя агрегатных функций [combinators](/sql-reference/aggregate-functions/combinators), которые обычно используются с типом `AggregateFunction`:

- Объединитель агрегатных функций [`-State`](/sql-reference/aggregate-functions/combinators#-state), который, будучи добавленным к имени агрегатной функции, производит промежуточные состояния `AggregateFunction`.
- Объединитель агрегатных функций [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge), который используется для получения окончательного результата агрегации из промежуточных состояний.

## Синтаксис {#syntax}

```sql
AggregateFunction(aggregate_function_name, types_of_arguments...)
```

**Параметры**

- `aggregate_function_name` - Имя агрегатной функции. Если функция параметризована, то её параметры также должны быть указаны.
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

Чтобы вставить данные в таблицу с колонками типа `AggregateFunction`, вы можете использовать `INSERT SELECT` с агрегатными функциями и 
объединителем агрегатной функции [`-State`](/sql-reference/aggregate-functions/combinators#-state).

Например, чтобы вставить данные в колонки типа `AggregateFunction(uniq, UInt64)` и
`AggregateFunction(quantiles(0.5, 0.9), UInt64)`, вы можете использовать следующие 
агрегатные функции с объединителями.

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

В отличие от функций `uniq` и `quantiles`, `uniqState` и `quantilesState`
(с добавленным объединителем `-State`) возвращают состояние, а не конечное значение.
Иными словами, они возвращают значение типа `AggregateFunction`.

В результатах запроса `SELECT` значения типа `AggregateFunction` имеют 
представления в двоичном формате, специфичные для реализации, для всех форматов 
вывода ClickHouse.

Если вы выгрузите данные, например, в формате `TabSeparated` с помощью запроса 
`SELECT`, то этот дамп можно будет загрузить обратно с помощью запроса `INSERT`.

### Выбор данных {#data-selection}

При выборе данных из таблицы `AggregatingMergeTree` используйте оператор `GROUP BY`
и те же агрегатные функции, что и при вставке данных, но используйте 
объединитель [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge).

Агрегатная функция с добавленным объединителем `-Merge` принимает набор состояний,
объединяет их и возвращает результат полной агрегации данных.

Например, следующие два запроса возвращают одинаковый результат:

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## Пример использования {#usage-example}

Смотрите описание движка [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md).

## Связанный контент {#related-content}

- Блог: [Использование объединителей агрегатов в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- Объединитель [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate).
- Объединитель [State](/sql-reference/aggregate-functions/combinators#-state).
