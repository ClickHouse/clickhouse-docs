---
description: 'Документация по типу данных AggregateFunction в ClickHouse, предназначенному для хранения промежуточных состояний агрегатных функций'
keywords: ['AggregateFunction', 'Type']
sidebar_label: 'AggregateFunction'
sidebar_position: 46
slug: /sql-reference/data-types/aggregatefunction
title: 'Тип AggregateFunction'
doc_type: 'reference'
---



# Тип AggregateFunction



## Описание {#description}

Все [агрегатные функции](/sql-reference/aggregate-functions) в ClickHouse имеют
специфичное для реализации промежуточное состояние, которое может быть сериализовано в
тип данных `AggregateFunction` и сохранено в таблице. Обычно это делается с помощью
[материализованного представления](../../sql-reference/statements/create/view.md).

Существует два [комбинатора](/sql-reference/aggregate-functions/combinators) агрегатных функций,
которые обычно используются с типом `AggregateFunction`:

- Комбинатор агрегатных функций [`-State`](/sql-reference/aggregate-functions/combinators#-state), который при добавлении к имени агрегатной
  функции создаёт промежуточные состояния `AggregateFunction`.
- Комбинатор агрегатных функций [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge), который используется для получения итогового результата агрегации
  из промежуточных состояний.


## Синтаксис {#syntax}

```sql
AggregateFunction(aggregate_function_name, types_of_arguments...)
```

**Параметры**

- `aggregate_function_name` — название агрегатной функции. Если функция
  параметрическая, необходимо также указать её параметры.
- `types_of_arguments` — типы аргументов агрегатной функции.

Например:

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

Для вставки данных в таблицу со столбцами типа `AggregateFunction` можно
использовать `INSERT SELECT` с агрегатными функциями и
комбинатором агрегатных функций [`-State`](/sql-reference/aggregate-functions/combinators#-state).

Например, для вставки в столбцы типа `AggregateFunction(uniq, UInt64)` и
`AggregateFunction(quantiles(0.5, 0.9), UInt64)` необходимо использовать следующие
агрегатные функции с комбинаторами.

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

В отличие от функций `uniq` и `quantiles`, функции `uniqState` и `quantilesState`
(с добавленным комбинатором `-State`) возвращают состояние, а не конечное значение.
Другими словами, они возвращают значение типа `AggregateFunction`.

В результатах запроса `SELECT` значения типа `AggregateFunction` имеют
специфичное для реализации бинарное представление во всех выходных
форматах ClickHouse.

Если вы выгружаете данные, например, в формат `TabSeparated` с помощью запроса `SELECT`,
то эту выгрузку можно загрузить обратно с помощью запроса `INSERT`.

### Выборка данных {#data-selection}

При выборке данных из таблицы `AggregatingMergeTree` используйте конструкцию `GROUP BY`
и те же агрегатные функции, что и при вставке данных, но с
комбинатором [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge).

Агрегатная функция с добавленным комбинатором `-Merge` принимает набор
состояний, объединяет их и возвращает результат полной агрегации данных.

Например, следующие два запроса возвращают одинаковый результат:

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```


## Пример использования {#usage-example}

См. описание движка [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md).


## Связанный контент {#related-content}

- Блог: [Использование комбинаторов агрегатных функций в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- Комбинатор [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate).
- Комбинатор [State](/sql-reference/aggregate-functions/combinators#-state).
