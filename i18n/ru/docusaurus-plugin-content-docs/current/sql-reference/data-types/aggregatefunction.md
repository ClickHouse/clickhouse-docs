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
специфическое для реализации промежуточное состояние, которое может быть сериализовано
в тип данных `AggregateFunction` и сохранено в таблице. Обычно это реализуется с
помощью [материализованного представления](../../sql-reference/statements/create/view.md).

С типом `AggregateFunction` обычно используются два [комбинатора](/sql-reference/aggregate-functions/combinators)
агрегатных функций:

- Комбинатор агрегатной функции [`-State`](/sql-reference/aggregate-functions/combinators#-state), который, будучи добавленным к имени агрегатной
  функции, создает промежуточные состояния `AggregateFunction`.
- Комбинатор агрегатной функции [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge), который используется для получения итогового
  результата агрегации из промежуточных состояний.



## Синтаксис

```sql
AggregateFunction(имя_агрегатной_функции, типы_аргументов...)
```

**Параметры**

* `aggregate_function_name` - Имя агрегатной функции. Если функция
  параметризуемая, её параметры также должны быть указаны.
* `types_of_arguments` - Типы аргументов агрегатной функции.

например:

```sql
CREATE TABLE t
(
    column1 AggregateFunction(uniq, UInt64),
    column2 AggregateFunction(anyIf, String, UInt8),
    column3 AggregateFunction(quantiles(0.5, 0.9), UInt64)
) ENGINE = ...
```


## Использование

### Вставка данных

Чтобы вставить данные в таблицу со столбцами типа `AggregateFunction`, вы можете
использовать `INSERT SELECT` с агрегатными функциями и
комбинатором агрегатных функций [`-State`](/sql-reference/aggregate-functions/combinators#-state).

Например, чтобы вставить данные в столбцы типа `AggregateFunction(uniq, UInt64)` и
`AggregateFunction(quantiles(0.5, 0.9), UInt64)`, следует использовать следующие
агрегатные функции с этим комбинатором.

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

В отличие от функций `uniq` и `quantiles`, `uniqState` и `quantilesState`
(с добавленным комбинатором `-State`) возвращают состояние, а не итоговое значение.
Другими словами, они возвращают значение типа `AggregateFunction`.

В результатах запроса `SELECT` значения типа `AggregateFunction` имеют
зависящее от реализации двоичное представление во всех форматах вывода ClickHouse.

Если вы экспортируете данные, например, в формат `TabSeparated` с помощью запроса `SELECT`,
то затем этот дамп можно загрузить обратно с помощью запроса `INSERT`.

### Выборка данных

При выборке данных из таблицы `AggregatingMergeTree` используйте предложение `GROUP BY`
и те же агрегатные функции, что и при вставке данных, но с комбинатором
[`-Merge`](/sql-reference/aggregate-functions/combinators#-merge).

Агрегатная функция с добавленным к ней комбинатором `-Merge` принимает набор
состояний, объединяет их и возвращает результат полной агрегации данных.

Например, следующие два запроса возвращают один и тот же результат:

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```


## Пример использования {#usage-example}

См. описание движка таблицы [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md).



## Связанные материалы {#related-content}

- Статья в блоге: [Использование агрегатных комбинаторов в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- Комбинатор [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate).
- Комбинатор [State](/sql-reference/aggregate-functions/combinators#-state).
