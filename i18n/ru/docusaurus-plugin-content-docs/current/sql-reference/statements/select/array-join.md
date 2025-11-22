---
description: 'Документация по оператору ARRAY JOIN'
sidebar_label: 'ARRAY JOIN'
slug: /sql-reference/statements/select/array-join
title: 'Оператор ARRAY JOIN'
doc_type: 'reference'
---



# Оператор ARRAY JOIN

Для таблиц, содержащих столбец-массив, распространена операция создания новой таблицы, которая содержит строку для каждого отдельного элемента массива из исходного столбца, при этом значения других столбцов дублируются. Это базовый вариант того, что делает оператор `ARRAY JOIN`.

Название связано с тем, что его можно рассматривать как выполнение `JOIN` с массивом или вложенной структурой данных. Его назначение похоже на функцию [arrayJoin](/sql-reference/functions/array-join), но функциональность оператора шире.

Синтаксис:

```sql
SELECT <expr_list>
FROM <left_subquery>
[LEFT] ARRAY JOIN <array>
[WHERE|PREWHERE <expr>]
...
```

Поддерживаемые типы `ARRAY JOIN` перечислены ниже:

* `ARRAY JOIN` — в обычном случае пустые массивы не включаются в результат `JOIN`.
* `LEFT ARRAY JOIN` — результат `JOIN` содержит строки с пустыми массивами. Значение для пустого массива устанавливается в значение по умолчанию для типа элемента массива (обычно 0, пустая строка или NULL).


## Базовые примеры ARRAY JOIN {#basic-array-join-examples}

### ARRAY JOIN и LEFT ARRAY JOIN {#array-join-left-array-join-examples}

Приведенные ниже примеры демонстрируют использование конструкций `ARRAY JOIN` и `LEFT ARRAY JOIN`. Создадим таблицу со столбцом типа [Array](../../../sql-reference/data-types/array.md) и вставим в неё значения:

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

В следующем примере используется конструкция `ARRAY JOIN`:

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

В следующем примере используется конструкция `LEFT ARRAY JOIN`:

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

Эта функция обычно используется с `ARRAY JOIN`. Она позволяет подсчитать что-либо только один раз для каждого массива после применения `ARRAY JOIN`. Пример:

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

В этом примере Reaches — это количество конверсий (строки, полученные после применения `ARRAY JOIN`), а Hits — это количество просмотров страниц (строки до применения `ARRAY JOIN`). В данном случае тот же результат можно получить более простым способом:

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

Эта функция полезна при использовании `ARRAY JOIN` и агрегировании элементов массива.

В этом примере для каждого идентификатора цели вычисляется количество конверсий (каждый элемент во вложенной структуре данных Goals представляет собой достигнутую цель, которую мы называем конверсией) и количество сессий. Без `ARRAY JOIN` мы бы подсчитали количество сессий как sum(Sign). Однако в данном случае строки были размножены вложенной структурой Goals, поэтому для того, чтобы подсчитать каждую сессию только один раз, мы применяем условие к значению функции `arrayEnumerateUniq(Goals.ID)`.

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


## Использование псевдонимов {#using-aliases}

Для массива в предложении `ARRAY JOIN` можно указать псевдоним. В этом случае элемент массива доступен по псевдониму, а сам массив — по исходному имени. Пример:

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

С помощью псевдонимов можно выполнить `ARRAY JOIN` с внешним массивом. Например:

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

В предложении `ARRAY JOIN` можно указать несколько массивов через запятую. В этом случае `JOIN` выполняется с ними одновременно (прямая сумма, а не декартово произведение). Обратите внимание, что по умолчанию все массивы должны иметь одинаковый размер. Пример:

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

В примере ниже используется функция [arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate):

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

Несколько массивов разного размера можно объединить с помощью настройки `SETTINGS enable_unaligned_array_join = 1`. Пример:

```sql
SELECT s, arr, a, b
FROM arrays_test ARRAY JOIN arr AS a, [['a','b'],['c']] AS b
SETTINGS enable_unaligned_array_join = 1;
```


```response
┌─s───────┬─arr─────┬─a─┬─b─────────┐
│ Привет   │ [1,2]   │ 1 │ ['a','b'] │
│ Привет   │ [1,2]   │ 2 │ ['c']     │
│ Мир   │ [3,4,5] │ 3 │ ['a','b'] │
│ Мир   │ [3,4,5] │ 4 │ ['c']     │
│ Мир   │ [3,4,5] │ 5 │ []        │
│ До свидания │ []      │ 0 │ ['a','b'] │
│ До свидания │ []      │ 0 │ ['c']     │
└─────────┴─────────┴───┴───────────┘
```


## ARRAY JOIN с вложенными структурами данных {#array-join-with-nested-data-structure}

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

При указании имён вложенных структур данных в `ARRAY JOIN` результат аналогичен применению `ARRAY JOIN` ко всем элементам массивов, из которых она состоит. Примеры приведены ниже:

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

Также допустим следующий вариант:

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

Для вложенной структуры данных можно использовать псевдоним, чтобы получить доступ как к результату `JOIN`, так и к исходному массиву. Пример:

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


## Детали реализации {#implementation-details}

Порядок выполнения запроса оптимизируется при использовании `ARRAY JOIN`. Хотя `ARRAY JOIN` всегда должен указываться перед секцией [WHERE](../../../sql-reference/statements/select/where.md)/[PREWHERE](../../../sql-reference/statements/select/prewhere.md) в запросе, технически они могут выполняться в любом порядке, если только результат `ARRAY JOIN` не используется для фильтрации. Порядок обработки контролируется оптимизатором запросов.

### Несовместимость с ленивым вычислением функций {#incompatibility-with-short-circuit-function-evaluation}

[Ленивое вычисление функций](/operations/settings/settings#short_circuit_function_evaluation) — это возможность, которая оптимизирует выполнение сложных выражений в определённых функциях, таких как `if`, `multiIf`, `and` и `or`. Она предотвращает возникновение потенциальных исключений, таких как деление на ноль, во время выполнения этих функций.

Функция `arrayJoin` всегда выполняется полностью и не поддерживает ленивое вычисление. Это связано с тем, что она является уникальной функцией, обрабатываемой отдельно от всех других функций на этапах анализа и выполнения запроса, и требует дополнительной логики, несовместимой с механизмом ленивого вычисления функций. Причина в том, что количество строк в результате зависит от результата работы `arrayJoin`, и реализация ленивого выполнения `arrayJoin` является слишком сложной и ресурсоёмкой.


## Связанный контент {#related-content}

- Блог: [Работа с данными временных рядов в ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
