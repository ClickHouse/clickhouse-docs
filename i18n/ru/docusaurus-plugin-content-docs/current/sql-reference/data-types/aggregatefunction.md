---
description: 'Документация по типу данных AggregateFunction в ClickHouse, который
хранит промежуточные состояния агрегатных функций'
keywords: ['AggregateFunction', 'Type']
sidebar_label: 'AggregateFunction'
sidebar_position: 46
slug: /sql-reference/data-types/aggregatefunction
title: 'Тип AggregateFunction'
doc_type: 'reference'
---

# Тип AggregateFunction {#aggregatefunction-type}

## Описание {#description}

Все [агрегатные функции](/sql-reference/aggregate-functions) в ClickHouse имеют
промежуточное состояние, зависящее от реализации, которое может быть
сериализовано в тип данных `AggregateFunction` и сохранено в таблице. Обычно это
делается с помощью [материализованного представления](../../sql-reference/statements/create/view.md).

С типом `AggregateFunction` обычно используются два [комбинатора](/sql-reference/aggregate-functions/combinators) агрегатных функций:

- Комбинатор агрегатной функции [`-State`](/sql-reference/aggregate-functions/combinators#-state), который при добавлении к имени агрегатной
  функции формирует промежуточные состояния `AggregateFunction`.
- Комбинатор агрегатной функции [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge), который используется для получения
  конечного результата агрегации из промежуточных состояний.

## Синтаксис {#syntax}

```sql
AggregateFunction(имя_агрегатной_функции, типы_аргументов...)
```

**Параметры**

* `aggregate_function_name` - Имя агрегатной функции. Если функция
  параметрическая, необходимо также указать её параметры.
* `types_of_arguments` - Типы аргументов агрегатной функции.

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

Чтобы вставить данные в таблицу со столбцами типа `AggregateFunction`, вы можете
использовать `INSERT SELECT` с агрегатными функциями и
комбинатором агрегатных функций
[`-State`](/sql-reference/aggregate-functions/combinators#-state).

Например, чтобы вставить данные в столбцы типов `AggregateFunction(uniq, UInt64)` и
`AggregateFunction(quantiles(0.5, 0.9), UInt64)`, нужно использовать следующие
агрегатные функции с комбинаторами.

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

В отличие от функций `uniq` и `quantiles`, `uniqState` и `quantilesState`
(с добавленным комбинатором `-State`) возвращают состояние, а не итоговое значение.
Другими словами, они возвращают значение типа `AggregateFunction`.

В результатах запроса `SELECT` значения типа `AggregateFunction` имеют
зависящее от реализации двоичное представление во всех форматах вывода ClickHouse.

Существует специальный параметр уровня сессии `aggregate_function_input_format`, который позволяет формировать состояние из входных значений.
Он поддерживает следующие форматы:

* `state` — двоичная строка с сериализованным состоянием (значение по умолчанию).
  Если вы выгружаете данные, например, в формат `TabSeparated` с помощью запроса `SELECT`,
  то этот дамп можно загрузить обратно с помощью запроса `INSERT`.
* `value` — формат будет ожидать одно значение аргумента агрегатной функции или, в случае нескольких аргументов, кортеж из них; это значение будет десериализовано для формирования соответствующего состояния.
* `array` — формат будет ожидать Array значений, как описано в варианте `value` выше; все элементы массива будут агрегированы для формирования состояния.


### Выборка данных {#data-selection}

При выборке данных из таблицы `AggregatingMergeTree` используйте предложение `GROUP BY`
и те же агрегатные функции, что и при вставке данных, но с комбинатором
[`-Merge`](/sql-reference/aggregate-functions/combinators#-merge).

Агрегатная функция с добавленным комбинатором `-Merge` принимает набор
состояний, объединяет их и возвращает результат полной агрегации данных.

Например, следующие два запроса возвращают один и тот же результат:

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```


## Пример использования {#usage-example}

См. описание табличного движка [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md).

## Связанные материалы {#related-content}

- Запись в блоге: [Использование агрегатных комбинаторов в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate)
  комбинатор MergeState.
- [State](/sql-reference/aggregate-functions/combinators#-state) комбинатор State.