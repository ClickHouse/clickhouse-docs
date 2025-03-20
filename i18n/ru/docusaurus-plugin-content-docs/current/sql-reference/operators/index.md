---
slug: /sql-reference/operators/
sidebar_position: 38
sidebar_label: Операторы
displayed_sidebar: sqlreference
---


# Операторы

ClickHouse преобразует операторы в соответствующие функции на этапе разбора запроса в зависимости от их приоритета, порядка и ассоциативности.

## Операторы доступа {#access-operators}

`a[N]` – Доступ к элементу массива. Функция `arrayElement(a, N)`.

`a.N` – Доступ к элементу кортежа. Функция `tupleElement(a, N)`.

## Оператор численного отрицания {#numeric-negation-operator}

`-a` – Функция `negate(a)`.

Для отрицания кортежа: [tupleNegate](../../sql-reference/functions/tuple-functions.md#tuplenegate).

## Операторы умножения и деления {#multiplication-and-division-operators}

`a * b` – Функция `multiply(a, b)`.

Для умножения кортежа на число: [tupleMultiplyByNumber](../../sql-reference/functions/tuple-functions.md#tuplemultiplybynumber), для скалярного произведения: [dotProduct](/sql-reference/functions/array-functions#arraydotproduct).

`a / b` – Функция `divide(a, b)`.

Для деления кортежа на число: [tupleDivideByNumber](../../sql-reference/functions/tuple-functions.md#tupledividebynumber).

`a % b` – Функция `modulo(a, b)`.

## Операторы сложения и вычитания {#addition-and-subtraction-operators}

`a + b` – Функция `plus(a, b)`.

Для сложения кортежей: [tuplePlus](../../sql-reference/functions/tuple-functions.md#tupleplus).

`a - b` – Функция `minus(a, b)`.

Для вычитания кортежей: [tupleMinus](../../sql-reference/functions/tuple-functions.md#tupleminus).

## Операторы сравнения {#comparison-operators}

### equals функция {#equals-function}
`a = b` – Функция `equals(a, b)`.

`a == b` – Функция `equals(a, b)`.

### notEquals функция {#notequals-function}
`a != b` – Функция `notEquals(a, b)`.

`a <> b` – Функция `notEquals(a, b)`.

### lessOrEquals функция {#lessorequals-function}
`a <= b` – Функция `lessOrEquals(a, b)`.

### greaterOrEquals функция {#greaterorequals-function}
`a >= b` – Функция `greaterOrEquals(a, b)`.

### less функция {#less-function}
`a < b` – Функция `less(a, b)`.

### greater функция {#greater-function}
`a > b` – Функция `greater(a, b)`.

### like функция {#like-function}
`a LIKE s` – Функция `like(a, b)`.

### notLike функция {#notlike-function}
`a NOT LIKE s` – Функция `notLike(a, b)`.

### ilike функция {#ilike-function}
`a ILIKE s` – Функция `ilike(a, b)`.

### BETWEEN функция {#between-function}
`a BETWEEN b AND c` – То же самое, что `а >= b AND a <= c`.

`a NOT BETWEEN b AND c` – То же самое, что `a < b OR a > c`.

## Операторы для работы с наборами данных {#operators-for-working-with-data-sets}

Смотрите [IN операторы](../../sql-reference/operators/in.md) и [EXISTS](../../sql-reference/operators/exists.md) оператор.

### in функция {#in-function}
`a IN ...` – Функция `in(a, b)`.

### notIn функция {#notin-function}
`a NOT IN ...` – Функция `notIn(a, b)`.

### globalIn функция {#globalin-function}
`a GLOBAL IN ...` – Функция `globalIn(a, b)`.

### globalNotIn функция {#globalnotin-function}
`a GLOBAL NOT IN ...` – Функция `globalNotIn(a, b)`.

### in подзапрос функция {#in-subquery-function}
`a = ANY (subquery)` – Функция `in(a, subquery)`.

### notIn подзапрос функция {#notin-subquery-function}
`a != ANY (subquery)` – То же самое, что `a NOT IN (SELECT singleValueOrNull(*) FROM subquery)`.

### in подзапрос функция {#in-subquery-function-1}
`a = ALL (subquery)` – То же самое, что `a IN (SELECT singleValueOrNull(*) FROM subquery)`.

### notIn подзапрос функция {#notin-subquery-function-1}
`a != ALL (subquery)` – Функция `notIn(a, subquery)`.


**Примеры**

Запрос с ALL:

``` sql
SELECT number AS a FROM numbers(10) WHERE a > ALL (SELECT number FROM numbers(3, 3));
```

Результат:

``` text
┌─a─┐
│ 6 │
│ 7 │
│ 8 │
│ 9 │
└───┘
```

Запрос с ANY:

``` sql
SELECT number AS a FROM numbers(10) WHERE a > ANY (SELECT number FROM numbers(3, 3));
```

Результат:

``` text
┌─a─┐
│ 4 │
│ 5 │
│ 6 │
│ 7 │
│ 8 │
│ 9 │
└───┘
```

## Операторы для работы с датами и временем {#operators-for-working-with-dates-and-times}

### EXTRACT {#extract}

``` sql
EXTRACT(part FROM date);
```

Извлекает части из заданной даты. Например, вы можете извлечь месяц из заданной даты или секунду из времени.

Параметр `part` определяет, какую часть даты извлекать. Доступные значения:

- `DAY` — День месяца. Возможные значения: 1–31.
- `MONTH` — Номер месяца. Возможные значения: 1–12.
- `YEAR` — Год.
- `SECOND` — Секунда. Возможные значения: 0–59.
- `MINUTE` — Минуты. Возможные значения: 0–59.
- `HOUR` — Час. Возможные значения: 0–23.

Параметр `part` не чувствителен к регистру.

Параметр `date` определяет дату или время для обработки. Поддерживаются типы [Date](../../sql-reference/data-types/date.md) или [DateTime](../../sql-reference/data-types/datetime.md).

Примеры:

``` sql
SELECT EXTRACT(DAY FROM toDate('2017-06-15'));
SELECT EXTRACT(MONTH FROM toDate('2017-06-15'));
SELECT EXTRACT(YEAR FROM toDate('2017-06-15'));
```

В следующем примере мы создаем таблицу и вставляем в неё значение с типом `DateTime`.

``` sql
CREATE TABLE test.Orders
(
    OrderId UInt64,
    OrderName String,
    OrderDate DateTime
)
ENGINE = Log;
```

``` sql
INSERT INTO test.Orders VALUES (1, 'Jarlsberg Cheese', toDateTime('2008-10-11 13:23:44'));
```

``` sql
SELECT
    toYear(OrderDate) AS OrderYear,
    toMonth(OrderDate) AS OrderMonth,
    toDayOfMonth(OrderDate) AS OrderDay,
    toHour(OrderDate) AS OrderHour,
    toMinute(OrderDate) AS OrderMinute,
    toSecond(OrderDate) AS OrderSecond
FROM test.Orders;
```

``` text
┌─OrderYear─┬─OrderMonth─┬─OrderDay─┬─OrderHour─┬─OrderMinute─┬─OrderSecond─┐
│      2008 │         10 │       11 │        13 │          23 │          44 │
└───────────┴────────────┴──────────┴───────────┴─────────────┴─────────────┘
```

Вы можете увидеть больше примеров в [tests](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00619_extract.sql).

### INTERVAL {#interval}

Создает значение типа [Interval](../../sql-reference/data-types/special-data-types/interval.md), которое должно использоваться в арифметических операциях с значениями типов [Date](../../sql-reference/data-types/date.md) и [DateTime](../../sql-reference/data-types/datetime.md).

Типы интервалов:
- `SECOND`
- `MINUTE`
- `HOUR`
- `DAY`
- `WEEK`
- `MONTH`
- `QUARTER`
- `YEAR`

Вы также можете использовать строковый литерал при установке значения `INTERVAL`. Например, `INTERVAL 1 HOUR` эквивалентно `INTERVAL '1 hour'` или `INTERVAL '1' hour`.

:::tip    
Интервалы с разными типами не могут быть объединены. Вы не можете использовать выражения вида `INTERVAL 4 DAY 1 HOUR`. Укажите интервалы в единицах, которые меньше или равны наименьшей единице интервала, например, `INTERVAL 25 HOUR`. Вы можете использовать последовательные операции, как в примере ниже.
:::

Примеры:

``` sql
SELECT now() AS current_date_time, current_date_time + INTERVAL 4 DAY + INTERVAL 3 HOUR;
```

``` text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay(4)), toIntervalHour(3))─┐
│ 2020-11-03 22:09:50 │                                    2020-11-08 01:09:50 │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

``` sql
SELECT now() AS current_date_time, current_date_time + INTERVAL '4 day' + INTERVAL '3 hour';
```

``` text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay(4)), toIntervalHour(3))─┐
│ 2020-11-03 22:12:10 │                                    2020-11-08 01:12:10 │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

``` sql
SELECT now() AS current_date_time, current_date_time + INTERVAL '4' day + INTERVAL '3' hour;
```

``` text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay('4')), toIntervalHour('3'))─┐
│ 2020-11-03 22:33:19 │                                        2020-11-08 01:33:19 │
└─────────────────────┴────────────────────────────────────────────────────────────┘
```

:::note    
Синтаксис `INTERVAL` или функция `addDays` всегда предпочтительнее. Простое сложение или вычитание (синтаксис вида `now() + ...`) не учитывает настройки времени. Например, переход на летнее/зимнее время.
:::

Примеры:

``` sql
SELECT toDateTime('2014-10-26 00:00:00', 'Asia/Istanbul') AS time, time + 60 * 60 * 24 AS time_plus_24_hours, time + toIntervalDay(1) AS time_plus_1_day;
```

``` text
┌────────────────time─┬──time_plus_24_hours─┬─────time_plus_1_day─┐
│ 2014-10-26 00:00:00 │ 2014-10-26 23:00:00 │ 2014-10-27 00:00:00 │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**Смотрите также**

- Тип данных [Interval](../../sql-reference/data-types/special-data-types/interval.md)
- Функции преобразования типов [toInterval](/sql-reference/functions/type-conversion-functions#tointervalyear)

## Логический И оператор {#logical-and-operator}

Синтаксис `SELECT a AND b` — вычисляет логическое и (`AND`) для `a` и `b` с помощью функции [and](/sql-reference/functions/logical-functions#and).

## Логический ИЛИ оператор {#logical-or-operator}

Синтаксис `SELECT a OR b` — вычисляет логическое или (`OR`) для `a` и `b` с помощью функции [or](/sql-reference/functions/logical-functions#or).

## Логический отрицания оператор {#logical-negation-operator}

Синтаксис `SELECT NOT a` — вычисляет логическое отрицание (`NOT`) для `a` с помощью функции [not](/sql-reference/functions/logical-functions#not).

## Условный оператор {#conditional-operator}

`a ? b : c` – Функция `if(a, b, c)`.

Примечание:

Условный оператор вычисляет значения `b` и `c`, затем проверяет, выполняется ли условие `a`, и возвращает соответствующее значение. Если `b` или `C` — это функция [arrayJoin()](/sql-reference/functions/array-join), каждая строка будет дублироваться независимо от условия "a".

## Условное выражение {#conditional-expression}

``` sql
CASE [x]
    WHEN a THEN b
    [WHEN ... THEN ...]
    [ELSE c]
END
```

Если `x` указан, то используется функция `transform(x, [a, ...], [b, ...], c)`. В противном случае – `multiIf(a, b, ..., c)`.

Если в выражении нет клаузи `ELSE c`, то значение по умолчанию — `NULL`.

Функция `transform` не работает с `NULL`.

## Оператор конкатенации {#concatenation-operator}

`s1 || s2` – Функция `concat(s1, s2)`. 

## Оператор создания лямбда {#lambda-creation-operator}

`x -> expr` – Функция `lambda(x, expr)`.

Следующие операторы не имеют приоритета, так как они являются скобками:

## Оператор создания массива {#array-creation-operator}

`[x1, ...]` – Функция `array(x1, ...)`.

## Оператор создания кортежа {#tuple-creation-operator}

`(x1, x2, ...)` – Функция `tuple(x2, x2, ...)`.

## Ассоциативность {#associativity}

Все бинарные операторы имеют левую ассоциативность. Например, `1 + 2 + 3` преобразуется в `plus(plus(1, 2), 3)`.
Иногда это работает не так, как вы ожидаете. Например, `SELECT 4 > 2 > 3` вернет 0.

Для эффективности функции `and` и `or` принимают любое количество аргументов. Соответствующие цепочки операторов `AND` и `OR` преобразуются в один вызов этих функций.

## Проверка на `NULL` {#checking-for-null}

ClickHouse поддерживает операторы `IS NULL` и `IS NOT NULL`.

### IS NULL {#is_null}

- Для значений типа [Nullable](../../sql-reference/data-types/nullable.md) оператор `IS NULL` возвращает:
    - `1`, если значение `NULL`.
    - `0` в противном случае.
- Для других значений оператор `IS NULL` всегда возвращает `0`.

Можно оптимизировать, включая настройку [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns). При `optimize_functions_to_subcolumns = 1` функция читает только [null](../../sql-reference/data-types/nullable.md#finding-null) подколонку, а не считывает и обрабатывает все данные колонки. Запрос `SELECT n IS NULL FROM table` преобразуется в `SELECT n.null FROM TABLE`.

<!-- -->

``` sql
SELECT x+100 FROM t_null WHERE y IS NULL
```

``` text
┌─plus(x, 100)─┐
│          101 │
└──────────────┘
```

### IS NOT NULL {#is_not_null}

- Для значений типа [Nullable](../../sql-reference/data-types/nullable.md) оператор `IS NOT NULL` возвращает:
    - `0`, если значение `NULL`.
    - `1` в противном случае.
- Для других значений оператор `IS NOT NULL` всегда возвращает `1`.

<!-- -->

``` sql
SELECT * FROM t_null WHERE y IS NOT NULL
```

``` text
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

Можно оптимизировать, включая настройку [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns). При `optimize_functions_to_subcolumns = 1` функция читает только [null](../../sql-reference/data-types/nullable.md#finding-null) подколонку, а не считывает и обрабатывает все данные колонки. Запрос `SELECT n IS NOT NULL FROM table` преобразуется в `SELECT NOT n.null FROM TABLE`.
