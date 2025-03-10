---
slug: /sql-reference/data-types/aggregatefunction
sidebar_position: 46
sidebar_label: AggregateFunction
---


# AggregateFunction

Агрегатные функции имеют промежуточное состояние с определением реализации, которое может быть сериализовано в тип данных `AggregateFunction(...)` и сохранено в таблице, обычно с помощью [материализованного представления](../../sql-reference/statements/create/view.md).
Общий способ получения состояния агрегатной функции заключается в вызове агрегатной функции с суффиксом `-State`.
Чтобы получить окончательный результат агрегации в будущем, вы должны использовать ту же агрегатную функцию с суффиксом `-Merge`.

`AggregateFunction(name, types_of_arguments...)` — параметрический тип данных.

**Параметры**

- Имя агрегатной функции. Если функция параметрическая, укажите также её параметры.

- Типы аргументов агрегатной функции.

**Пример**

``` sql
CREATE TABLE t
(
    column1 AggregateFunction(uniq, UInt64),
    column2 AggregateFunction(anyIf, String, UInt8),
    column3 AggregateFunction(quantiles(0.5, 0.9), UInt64)
) ENGINE = ...
```

[uniq](/sql-reference/aggregate-functions/reference/uniq), anyIf ([any](/sql-reference/aggregate-functions/reference/any)+[If](/sql-reference/aggregate-functions/combinators#-if)) и [quantiles](../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) являются агрегатными функциями, поддерживаемыми в ClickHouse.

## Usage {#usage}

### Data Insertion {#data-insertion}

Чтобы вставить данные, используйте `INSERT SELECT` с агрегатными функциями `-State`.

**Примеры функций**

``` sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

В отличие от соответствующих функций `uniq` и `quantiles`, функции с суффиксом `-State` возвращают состояние, вместо окончательного значения. Другими словами, они возвращают значение типа `AggregateFunction`.

В результатах запроса `SELECT` значения типа `AggregateFunction` имеют специфическое для реализации двоичное представление для всех форматов вывода ClickHouse. Если экспортировать данные, например, в формате `TabSeparated` с помощью запроса `SELECT`, то этот экспорт можно загрузить обратно с помощью запроса `INSERT`.

### Data Selection {#data-selection}

При выборке данных из таблицы `AggregatingMergeTree` используйте оператор `GROUP BY` и те же агрегатные функции, что и при вставке данных, но с использованием суффикса `-Merge`.

Агрегатная функция с суффиксом `-Merge` принимает набор состояний, объединяет их и возвращает результат полной агрегации данных.

Например, следующие два запроса возвращают один и тот же результат:

``` sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## Использование примера {#usage-example}

Смотрите описание двигателя [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md).


## Связанное содержимое {#related-content}

- Блог: [Использование агрегатных комбинаций в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
