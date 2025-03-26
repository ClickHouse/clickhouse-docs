---
description: 'Документация для типа данных AggregateFunction в ClickHouse, который хранит промежуточные состояния агрегатных функций'
sidebar_label: 'AggregateFunction'
sidebar_position: 46
slug: /sql-reference/data-types/aggregatefunction
title: 'AggregateFunction'
---


# AggregateFunction

Агрегатные функции имеют промежуточное состояние, определяемое реализацией, которое может быть сериализовано в тип данных `AggregateFunction(...)` и сохранено в таблице, обычно с помощью [материализованного представления](../../sql-reference/statements/create/view.md). Обычный способ получения состояния агрегатной функции — это вызов агрегатной функции с суффиксом `-State`. Чтобы получить окончательный результат агрегации в будущем, необходимо использовать ту же агрегатную функцию с суффиксом `-Merge`.

`AggregateFunction(name, types_of_arguments...)` — параметрический тип данных.

**Параметры**

- Название агрегатной функции. Если функция параметрическая, укажите также ее параметры.

- Типы аргументов агрегатной функции.

**Пример**

```sql
CREATE TABLE t
(
    column1 AggregateFunction(uniq, UInt64),
    column2 AggregateFunction(anyIf, String, UInt8),
    column3 AggregateFunction(quantiles(0.5, 0.9), UInt64)
) ENGINE = ...
```

[uniq](/sql-reference/aggregate-functions/reference/uniq), anyIf ([any](/sql-reference/aggregate-functions/reference/any)+[If](/sql-reference/aggregate-functions/combinators#-if)) и [quantiles](../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) — это агрегатные функции, поддерживаемые в ClickHouse.

## Использование {#usage}

### Вставка данных {#data-insertion}

Для вставки данных используйте `INSERT SELECT` с агрегатными функциями `-State`.

**Примеры функций**

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

В отличие от соответствующих функций `uniq` и `quantiles`, функции с суффиксом `-State` возвращают состояние, а не окончательное значение. Другими словами, они возвращают значение типа `AggregateFunction`.

В результатах запроса `SELECT` значения типа `AggregateFunction` имеют двоичное представление, специфичное для реализации, для всех форматов вывода ClickHouse. Если вы выгрузите данные, например, в формате `TabSeparated` с помощью запроса `SELECT`, то эти данные могут быть загружены обратно с помощью запроса `INSERT`.

### Выбор данных {#data-selection}

При выборе данных из таблицы `AggregatingMergeTree` используйте оператор `GROUP BY` и те же агрегатные функции, что и при вставке данных, но с использованием суффикса `-Merge`.

Агрегатная функция с суффиксом `-Merge` принимает набор состояний, объединяет их и возвращает результат полной агрегации данных.

Например, следующие два запроса возвращают одинаковый результат:

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## Пример использования {#usage-example}

Смотрите описание движка [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md).


## Связанные материалы {#related-content}

- Блог: [Использование агрегатных комбинаторов в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
