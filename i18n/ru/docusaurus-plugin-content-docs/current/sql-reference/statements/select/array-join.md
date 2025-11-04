---
slug: '/sql-reference/statements/select/array-join'
sidebar_label: 'ARRAY JOIN'
description: 'Документация для ARRAY JOIN Оператору'
title: 'Оператор ARRAY JOIN'
doc_type: reference
---
# ARRAY JOIN Оператор

Это распространенная операция для таблиц, которые содержат колонку массива, создать новую таблицу, в которой каждая строка соответствует отдельному элементу массива исходной колонки, в то время как значения других колонок дублируются. Это базовый случай того, что делает оператор `ARRAY JOIN`.

Название его происходит от того, что его можно рассматривать как выполнение `JOIN` с массивом или вложенной структурой данных. Намерение похоже на функцию [arrayJoin](/sql-reference/functions/array-join), но функциональность оператора шире.

Синтаксис:

```sql
SELECT <expr_list>
FROM <left_subquery>
[LEFT] ARRAY JOIN <array>
[WHERE|PREWHERE <expr>]
...
```

Поддерживаемые типы `ARRAY JOIN` перечислены ниже:

- `ARRAY JOIN` - В базовом случае пустые массивы не включаются в результат `JOIN`.
- `LEFT ARRAY JOIN` - Результат `JOIN` содержит строки с пустыми массивами. Значение для пустого массива устанавливается в значение по умолчанию для типа элемента массива (обычно 0, пустая строка или NULL).

## Основные примеры ARRAY JOIN {#basic-array-join-examples}

### ARRAY JOIN и LEFT ARRAY JOIN {#array-join-left-array-join-examples}

Примеры ниже демонстрируют использование операторов `ARRAY JOIN` и `LEFT ARRAY JOIN`. Давайте создадим таблицу с колонкой типа [Array](../../../sql-reference/data-types/array.md) и вставим в нее значения:

```sql
CREATE TABLE arrays_test
(
    s String,
    arr Array(UInt8)
) ENGINE = Memory;

INSERT INTO arrays_test
VALUES ('Hello', [1,2]), ('World', [3,4,5]), ('Goodbye', []);
```

```response
┌─s───────────┬─arr─────┐
│ Hello       │ [1,2]   │
│ World       │ [3,4,5] │
│ Goodbye     │ []      │
└─────────────┴─────────┘
```

Пример ниже использует оператор `ARRAY JOIN`:

```sql
SELECT s, arr
FROM arrays_test
ARRAY JOIN arr;
```

```response
┌─s─────┬─arr─┐
│ Hello │   1 │
│ Hello │   2 │
│ World │   3 │
│ World │   4 │
│ World │   5 │
└───────┴─────┘
```

Следующий пример использует оператор `LEFT ARRAY JOIN`:

```sql
SELECT s, arr
FROM arrays_test
LEFT ARRAY JOIN arr;
```

```response
┌─s───────────┬─arr─┐
│ Hello       │   1 │
│ Hello       │   2 │
│ World       │   3 │
│ World       │   4 │
│ World       │   5 │
│ Goodbye     │   0 │
└─────────────┴─────┘
```

### ARRAY JOIN и функция arrayEnumerate {#array-join-arrayEnumerate}

Эта функция обычно используется с `ARRAY JOIN`. Она позволяет посчитать что-то один раз для каждого массива после применения `ARRAY JOIN`. Пример:

```sql
SELECT
    count() AS Reaches,
    countIf(num = 1) AS Hits
FROM test.hits
ARRAY JOIN
    GoalsReached,
    arrayEnumerate(GoalsReached) AS num
WHERE CounterID = 160656
LIMIT 10
```

```text
┌─Reaches─┬──Hits─┐
│   95606 │ 31406 │
└─────────┴───────┘
```

В этом примере, Reaches - это количество конверсий (строки, полученные после применения `ARRAY JOIN`), а Hits - это количество просмотров страниц (строки до `ARRAY JOIN`). В данном случае, вы можете получить тот же результат более простым способом:

```sql
SELECT
    sum(length(GoalsReached)) AS Reaches,
    count() AS Hits
FROM test.hits
WHERE (CounterID = 160656) AND notEmpty(GoalsReached)
```

```text
┌─Reaches─┬──Hits─┐
│   95606 │ 31406 │
└─────────┴───────┘
```

### ARRAY JOIN и arrayEnumerateUniq {#array_join_arrayEnumerateUniq}

Эта функция полезна при использовании `ARRAY JOIN` и агрегации элементов массива.

В этом примере для каждого ID цели производится расчет количества конверсий (каждый элемент во вложенной структуре данных Goals - это цель, которая была достигнута, которую мы называем конверсией) и количества сессий. Без `ARRAY JOIN` мы бы посчитали количество сессий как sum(Sign). Но в данном случае строки были умножены на вложенную структуру Goals, поэтому для того, чтобы посчитать каждую сессию один раз после этого, мы применяем условие к значению функции `arrayEnumerateUniq(Goals.ID)`.

```sql
SELECT
    Goals.ID AS GoalID,
    sum(Sign) AS Reaches,
    sumIf(Sign, num = 1) AS Visits
FROM test.visits
ARRAY JOIN
    Goals,
    arrayEnumerateUniq(Goals.ID) AS num
WHERE CounterID = 160656
GROUP BY GoalID
ORDER BY Reaches DESC
LIMIT 10
```

```text
┌──GoalID─┬─Reaches─┬─Visits─┐
│   53225 │    3214 │   1097 │
│ 2825062 │    3188 │   1097 │
│   56600 │    2803 │    488 │
│ 1989037 │    2401 │    365 │
│ 2830064 │    2396 │    910 │
│ 1113562 │    2372 │    373 │
│ 3270895 │    2262 │    812 │
│ 1084657 │    2262 │    345 │
│   56599 │    2260 │    799 │
│ 3271094 │    2256 │    812 │
└─────────┴─────────┴────────┘
```

## Использование Псевдонимов {#using-aliases}

Для массива в операторе `ARRAY JOIN` можно указать псевдоним. В этом случае элемент массива можно получить по этому псевдониму, но сам массив доступен по оригинальному имени. Пример:

```sql
SELECT s, arr, a
FROM arrays_test
ARRAY JOIN arr AS a;
```

```response
┌─s─────┬─arr─────┬─a─┐
│ Hello │ [1,2]   │ 1 │
│ Hello │ [1,2]   │ 2 │
│ World │ [3,4,5] │ 3 │
│ World │ [3,4,5] │ 4 │
│ World │ [3,4,5] │ 5 │
└───────┴─────────┴───┘
```

Используя псевдонимы, вы можете выполнять `ARRAY JOIN` с внешним массивом. Например:

```sql
SELECT s, arr_external
FROM arrays_test
ARRAY JOIN [1, 2, 3] AS arr_external;
```

```response
┌─s───────────┬─arr_external─┐
│ Hello       │            1 │
│ Hello       │            2 │
│ Hello       │            3 │
│ World       │            1 │
│ World       │            2 │
│ World       │            3 │
│ Goodbye     │            1 │
│ Goodbye     │            2 │
│ Goodbye     │            3 │
└─────────────┴──────────────┘
```

Несколько массивов могут быть разделены запятыми в операторе `ARRAY JOIN`. В этом случае `JOIN` выполняется с ними одновременно (прямое суммирование, а не декартово произведение). Обратите внимание, что все массивы должны иметь одинаковый размер по умолчанию. Пример:

```sql
SELECT s, arr, a, num, mapped
FROM arrays_test
ARRAY JOIN arr AS a, arrayEnumerate(arr) AS num, arrayMap(x -> x + 1, arr) AS mapped;
```

```response
┌─s─────┬─arr─────┬─a─┬─num─┬─mapped─┐
│ Hello │ [1,2]   │ 1 │   1 │      2 │
│ Hello │ [1,2]   │ 2 │   2 │      3 │
│ World │ [3,4,5] │ 3 │   1 │      4 │
│ World │ [3,4,5] │ 4 │   2 │      5 │
│ World │ [3,4,5] │ 5 │   3 │      6 │
└───────┴─────────┴───┴─────┴────────┘
```

Пример ниже использует функцию [arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate):

```sql
SELECT s, arr, a, num, arrayEnumerate(arr)
FROM arrays_test
ARRAY JOIN arr AS a, arrayEnumerate(arr) AS num;
```

```response
┌─s─────┬─arr─────┬─a─┬─num─┬─arrayEnumerate(arr)─┐
│ Hello │ [1,2]   │ 1 │   1 │ [1,2]               │
│ Hello │ [1,2]   │ 2 │   2 │ [1,2]               │
│ World │ [3,4,5] │ 3 │   1 │ [1,2,3]             │
│ World │ [3,4,5] │ 4 │   2 │ [1,2,3]             │
│ World │ [3,4,5] │ 5 │   3 │ [1,2,3]             │
└───────┴─────────┴───┴─────┴─────────────────────┘
```

Несколько массивов с разными размерами могут быть соединены с помощью: `SETTINGS enable_unaligned_array_join = 1`. Пример:

```sql
SELECT s, arr, a, b
FROM arrays_test ARRAY JOIN arr AS a, [['a','b'],['c']] AS b
SETTINGS enable_unaligned_array_join = 1;
```

```response
┌─s───────┬─arr─────┬─a─┬─b─────────┐
│ Hello   │ [1,2]   │ 1 │ ['a','b'] │
│ Hello   │ [1,2]   │ 2 │ ['c']     │
│ World   │ [3,4,5] │ 3 │ ['a','b'] │
│ World   │ [3,4,5] │ 4 │ ['c']     │
│ World   │ [3,4,5] │ 5 │ []        │
│ Goodbye │ []      │ 0 │ ['a','b'] │
│ Goodbye │ []      │ 0 │ ['c']     │
└─────────┴─────────┴───┴───────────┘
```

## ARRAY JOIN с Вложенной Структурой Данных {#array-join-with-nested-data-structure}

`ARRAY JOIN` также работает с [вложенными структурами данных](../../../sql-reference/data-types/nested-data-structures/index.md):

```sql
CREATE TABLE nested_test
(
    s String,
    nest Nested(
    x UInt8,
    y UInt32)
) ENGINE = Memory;

INSERT INTO nested_test
VALUES ('Hello', [1,2], [10,20]), ('World', [3,4,5], [30,40,50]), ('Goodbye', [], []);
```

```response
┌─s───────┬─nest.x──┬─nest.y─────┐
│ Hello   │ [1,2]   │ [10,20]    │
│ World   │ [3,4,5] │ [30,40,50] │
│ Goodbye │ []      │ []         │
└─────────┴─────────┴────────────┘
```

```sql
SELECT s, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN nest;
```

```response
┌─s─────┬─nest.x─┬─nest.y─┐
│ Hello │      1 │     10 │
│ Hello │      2 │     20 │
│ World │      3 │     30 │
│ World │      4 │     40 │
│ World │      5 │     50 │
└───────┴────────┴────────┘
```

При указании имен вложенных структур данных в `ARRAY JOIN` смысл остается тем же, что и у `ARRAY JOIN` с элементами массива, из которых они состоят. Примеры приведены ниже:

```sql
SELECT s, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN `nest.x`, `nest.y`;
```

```response
┌─s─────┬─nest.x─┬─nest.y─┐
│ Hello │      1 │     10 │
│ Hello │      2 │     20 │
│ World │      3 │     30 │
│ World │      4 │     40 │
│ World │      5 │     50 │
└───────┴────────┴────────┘
```

Эта вариация тоже имеет смысл:

```sql
SELECT s, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN `nest.x`;
```

```response
┌─s─────┬─nest.x─┬─nest.y─────┐
│ Hello │      1 │ [10,20]    │
│ Hello │      2 │ [10,20]    │
│ World │      3 │ [30,40,50] │
│ World │      4 │ [30,40,50] │
│ World │      5 │ [30,40,50] │
└───────┴────────┴────────────┘
```

Псевдоним можно использовать для вложенной структуры данных, чтобы выбрать либо результат `JOIN`, либо исходный массив. Пример:

```sql
SELECT s, `n.x`, `n.y`, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN nest AS n;
```

```response
┌─s─────┬─n.x─┬─n.y─┬─nest.x──┬─nest.y─────┐
│ Hello │   1 │  10 │ [1,2]   │ [10,20]    │
│ Hello │   2 │  20 │ [1,2]   │ [10,20]    │
│ World │   3 │  30 │ [3,4,5] │ [30,40,50] │
│ World │   4 │  40 │ [3,4,5] │ [30,40,50] │
│ World │   5 │  50 │ [3,4,5] │ [30,40,50] │
└───────┴─────┴─────┴─────────┴────────────┘
```

Пример использования функции [arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate):

```sql
SELECT s, `n.x`, `n.y`, `nest.x`, `nest.y`, num
FROM nested_test
ARRAY JOIN nest AS n, arrayEnumerate(`nest.x`) AS num;
```

```response
┌─s─────┬─n.x─┬─n.y─┬─nest.x──┬─nest.y─────┬─num─┐
│ Hello │   1 │  10 │ [1,2]   │ [10,20]    │   1 │
│ Hello │   2 │  20 │ [1,2]   │ [10,20]    │   2 │
│ World │   3 │  30 │ [3,4,5] │ [30,40,50] │   1 │
│ World │   4 │  40 │ [3,4,5] │ [30,40,50] │   2 │
│ World │   5 │  50 │ [3,4,5] │ [30,40,50] │   3 │
└───────┴─────┴─────┴─────────┴────────────┴─────┘
```

## Подробности реализации {#implementation-details}

Порядок выполнения запроса оптимизируется при запуске `ARRAY JOIN`. Хотя `ARRAY JOIN` всегда должен быть указан перед оператором [WHERE](../../../sql-reference/statements/select/where.md)/[PREWHERE](../../../sql-reference/statements/select/prewhere.md) в запросе, технически их можно выполнять в любом порядке, если результат `ARRAY JOIN` используется для фильтрации. Порядок обработки контролируется оптимизатором запросов.

### Несовместимость с функцией короткого замыкания {#incompatibility-with-short-circuit-function-evaluation}

[Функция короткого замыкания](/operations/settings/settings#short_circuit_function_evaluation) - это функция, которая оптимизирует выполнение сложных выражений в специфичных функциях, таких как `if`, `multiIf`, `and` и `or`. Она предотвращает потенциальные исключения, такие как деление на ноль, которые могут возникнуть во время выполнения этих функций.

`arrayJoin` всегда выполняется и не поддерживает короткое замыкание. Это потому, что это уникальная функция, обрабатываемая отдельно от всех других функций во время анализа и выполнения запроса, и требует дополнительной логики, которая не работает с коротким замыканием. Причина в том, что количество строк в результате зависит от результата arrayJoin, и слишком сложно и затратно реализовать ленивое выполнение `arrayJoin`.

## Связанный контент {#related-content}

- Блог: [Работа с данными временных рядов в ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)