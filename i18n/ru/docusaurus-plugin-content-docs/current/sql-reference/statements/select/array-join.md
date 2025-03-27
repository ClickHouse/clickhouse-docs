---
description: 'Документация для оператора ARRAY JOIN'
sidebar_label: 'ARRAY JOIN'
slug: /sql-reference/statements/select/array-join
title: 'Оператор ARRAY JOIN'
---


# Оператор ARRAY JOIN

Операция, при которой таблицы с массивами столбцов создают новую таблицу, в которой находится столбец с каждым отдельным элементом массива из этого начального столбца, а значения других столбцов дублируются, является распространенной. Это основной случай того, что делает оператор `ARRAY JOIN`.

Его название связано с тем, что его можно рассматривать как выполнение `JOIN` с массивом или вложенной структурой данных. Намерение похоже на функцию [arrayJoin](/sql-reference/functions/array-join), но функциональность оператора шире.

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
- `LEFT ARRAY JOIN` - Результат `JOIN` содержит строки с пустыми массивами. Значение для пустого массива устанавливается в значение по умолчанию для типа элементов массива (обычно 0, пустая строка или NULL).

## Примеры базового ARRAY JOIN {#basic-array-join-examples}

Примеры ниже демонстрируют использование операторов `ARRAY JOIN` и `LEFT ARRAY JOIN`. Создадим таблицу со столбцом типа [Array](../../../sql-reference/data-types/array.md) и вставим в нее значения:

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

## Использование псевдонимов {#using-aliases}

При указании псевдонима для массива в операторе `ARRAY JOIN`, элемент массива может быть доступен через этот псевдоним, но сам массив доступен под оригинальным именем. Пример:

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

Используя псевдонимы, вы можете выполнить `ARRAY JOIN` с внешним массивом. Например:

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

Несколько массивов могут быть разделены запятыми в операторе `ARRAY JOIN`. В этом случае `JOIN` выполняется с ними одновременно (прямой суммой, а не декартовым произведением). Обратите внимание, что все массивы должны иметь одинаковый размер по умолчанию. Пример:

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

Пример ниже использует функцию [arrayEnumerate](/sql-reference/functions/array-functions#arrayenumeratearr):

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

Несколько массивов разного размера можно объединить, используя: `SETTINGS enable_unaligned_array_join = 1`. Пример:

```sql
SELECT s, arr, a, b
FROM arrays_test ARRAY JOIN arr as a, [['a','b'],['c']] as b
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

## ARRAY JOIN с вложенной структурой данных {#array-join-with-nested-data-structure}

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

При указании имен вложенных структур данных в `ARRAY JOIN` смысл остается тем же, что и в `ARRAY JOIN` со всеми элементами массива, из которых он состоит. Ниже приведены примеры:

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

Эта вариация также имеет смысл:

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

Можно использовать псевдоним для вложенной структуры данных, чтобы выбрать либо результат `JOIN`, либо исходный массив. Пример:

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

Пример использования функции [arrayEnumerate](/sql-reference/functions/array-functions#arrayenumeratearr):

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

Порядок выполнения запроса оптимизируется при запуске `ARRAY JOIN`. Хотя `ARRAY JOIN` всегда должен быть указан до [WHERE](../../../sql-reference/statements/select/where.md)/[PREWHERE](../../../sql-reference/statements/select/prewhere.md) в запросе, технически они могут выполняться в любом порядке, если результат `ARRAY JOIN` не используется для фильтрации. Порядок обработки контролируется оптимизатором запросов.

### Неподходящесть с короткозамыканием функции {#incompatibility-with-short-circuit-function-evaluation}

[Короткозамыкание функций](/operations/settings/settings#short_circuit_function_evaluation) - это функция, которая оптимизирует выполнение сложных выражений в специфических функциях, таких как `if`, `multiIf`, `and` и `or`. Она предотвращает возможные исключения, такие как деление на ноль, которые могут возникнуть во время выполнения этих функций.

`arrayJoin` всегда выполняется и не поддерживается для короткозамыкания функции. Это связано с тем, что это уникальная функция, обрабатываемая отдельно от всех других функций во время анализа и выполнения запроса и требующая дополнительной логики, которая не работает с короткозамыканием функции. Причина в том, что количество строк в результате зависит от результата `arrayJoin`, и внедрение ленивого выполнения `arrayJoin` слишком сложно и затратное.

## Связанный контент {#related-content}

- Блог: [Работа с данными временных рядов в ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
