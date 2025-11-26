---
description: 'Документация по операторам'
sidebar_label: 'Операторы'
sidebar_position: 38
slug: /sql-reference/operators/
title: 'Операторы'
doc_type: 'reference'
---

# Операторы

ClickHouse преобразует операторы в соответствующие функции на этапе разбора запроса, исходя из их приоритета, порядка выполнения и ассоциативности.

## Операторы доступа \{#access-operators\}

`a[N]` – обращение к элементу массива. Функция `arrayElement(a, N)`.

`a.N` – обращение к элементу кортежа. Функция `tupleElement(a, N)`.

## Оператор числового отрицания \{#numeric-negation-operator\}

`-a` – это функция `negate(a)`.

Для отрицания кортежей используйте [tupleNegate](../../sql-reference/functions/tuple-functions.md#tupleNegate).

## Операторы умножения и деления \{#multiplication-and-division-operators\}

`a * b` — функция `multiply(a, b)`.

Для умножения кортежа на число: [tupleMultiplyByNumber](../../sql-reference/functions/tuple-functions.md#tupleMultiplyByNumber), для скалярного произведения: [dotProduct](/sql-reference/functions/array-functions#arrayDotProduct).

`a / b` — функция `divide(a, b)`.

Для деления кортежа на число: [tupleDivideByNumber](../../sql-reference/functions/tuple-functions.md#tupleDivideByNumber).

`a % b` — функция `modulo(a, b)`.

## Операторы сложения и вычитания \{#addition-and-subtraction-operators\}

`a + b` – соответствует функции `plus(a, b)`.

Для сложения кортежей: [tuplePlus](../../sql-reference/functions/tuple-functions.md#tuplePlus).

`a - b` – соответствует функции `minus(a, b)`.

Для вычитания кортежей: [tupleMinus](../../sql-reference/functions/tuple-functions.md#tupleMinus).

## Операторы сравнения \{#comparison-operators\}

### Функция equals \{#equals-function\}

`a = b` – функция `equals(a, b)`.

`a == b` – функция `equals(a, b)`.

### функция notEquals \{#notequals-function\}

`a != b` – то же самое, что `notEquals(a, b)`.

`a <> b` – то же самое, что `notEquals(a, b)`.

### Функция lessOrEquals \{#lessorequals-function\}

`a <= b` — это функция `lessOrEquals(a, b)`.

### Функция greaterOrEquals \{#greaterorequals-function\}

`a >= b` — это функция `greaterOrEquals(a, b)`.

### функция less \{#less-function\}

`a < b` — это функция `less(a, b)`.

### функция greater \{#greater-function\}

`a > b` — функция `greater(a, b)`.

### Функция like \{#like-function\}

`a LIKE b` – функция `like(a, b)`.

### функция notLike \{#notlike-function\}

`a NOT LIKE b` – функция `notLike(a, b)`.

### Функция ilike \{#ilike-function\}

`a ILIKE b` — это функция `ilike(a, b)`.

### Функция BETWEEN \{#between-function\}

`a BETWEEN b AND c` – эквивалентно `a >= b AND a <= c`.

`a NOT BETWEEN b AND c` – эквивалентно `a < b OR a > c`.

## Операторы для работы с наборами данных \{#operators-for-working-with-data-sets\}

См. [операторы IN](../../sql-reference/operators/in.md) и [оператор EXISTS](../../sql-reference/operators/exists.md).

### в функции in \{#in-function\}

`a IN ...` – функция `in(a, b)`.

### Функция notIn \{#notin-function\}

`a NOT IN ...` – функция `notIn(a, b)`.

### функция globalIn \{#globalin-function\}

`a GLOBAL IN ...` — это функция `globalIn(a, b)`.

### Функция globalNotIn \{#globalnotin-function\}

`a GLOBAL NOT IN ...` – это функция `globalNotIn(a, b)`.

### функция in с подзапросом \{#in-subquery-function\}

`a = ANY (subquery)` – функция `in(a, subquery)`.  

### функция подзапроса notIn \{#notin-subquery-function\}

`a != ANY (subquery)` – то же, что и `a NOT IN (SELECT singleValueOrNull(*) FROM subquery)`.

### функция IN с подзапросом \{#in-subquery-function-1\}

`a = ALL (subquery)` – эквивалентно `a IN (SELECT singleValueOrNull(*) FROM subquery)`.

### Функция подзапроса notIn

`a != ALL (subquery)` — эквивалент функции `notIn(a, subquery)`.

**Примеры**

Запрос с ALL:

```sql
SELECT number AS a FROM numbers(10) WHERE a > ALL (SELECT number FROM numbers(3, 3));
```

Результат:

```text
┌─a─┐
│ 6 │
│ 7 │
│ 8 │
│ 9 │
└───┘
```

Запрос с оператором ANY:

```sql
SELECT number AS a FROM numbers(10) WHERE a > ANY (SELECT number FROM numbers(3, 3));
```

Результат:

```text
┌─a─┐
│ 4 │
│ 5 │
│ 6 │
│ 7 │
│ 8 │
│ 9 │
└───┘
```


## Операторы для работы с датой и временем \{#operators-for-working-with-dates-and-times\}

### EXTRACT

```sql
EXTRACT(part FROM date);
```

Извлекает части даты из заданного значения. Например, вы можете получить месяц из указанной даты или секунду из времени.

Параметр `part` определяет, какую часть даты нужно извлечь. Доступны следующие значения:

* `DAY` — день месяца. Возможные значения: 1–31.
* `MONTH` — номер месяца. Возможные значения: 1–12.
* `YEAR` — год.
* `SECOND` — секунда. Возможные значения: 0–59.
* `MINUTE` — минута. Возможные значения: 0–59.
* `HOUR` — час. Возможные значения: 0–23.

Параметр `part` нечувствителен к регистру.

Параметр `date` определяет дату или время для обработки. Поддерживаются типы [Date](../../sql-reference/data-types/date.md) и [DateTime](../../sql-reference/data-types/datetime.md).

Примеры:

```sql
SELECT EXTRACT(DAY FROM toDate('2017-06-15'));
SELECT EXTRACT(MONTH FROM toDate('2017-06-15'));
SELECT EXTRACT(YEAR FROM toDate('2017-06-15'));
```

В следующем примере мы создаём таблицу и вставляем в неё значение типа данных `DateTime`.

```sql
CREATE TABLE test.Orders
(
    OrderId UInt64,
    OrderName String,
    OrderDate DateTime
)
ENGINE = Log;
```

```sql
INSERT INTO test.Orders VALUES (1, 'Jarlsberg Cheese', toDateTime('2008-10-11 13:23:44'));
```

```sql
SELECT
    toYear(OrderDate) AS OrderYear,
    toMonth(OrderDate) AS OrderMonth,
    toDayOfMonth(OrderDate) AS OrderDay,
    toHour(OrderDate) AS OrderHour,
    toMinute(OrderDate) AS OrderMinute,
    toSecond(OrderDate) AS OrderSecond
FROM test.Orders;
```

```text
┌─OrderYear─┬─OrderMonth─┬─OrderDay─┬─OrderHour─┬─OrderMinute─┬─OrderSecond─┐
│      2008 │         10 │       11 │        13 │          23 │          44 │
└───────────┴────────────┴──────────┴───────────┴─────────────┴─────────────┘
```

Вы можете найти больше примеров в [tests](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00619_extract.sql).


### INTERVAL

Создает значение типа [Interval](../../sql-reference/data-types/special-data-types/interval.md), которое используется в арифметических операциях со значениями типов [Date](../../sql-reference/data-types/date.md) и [DateTime](../../sql-reference/data-types/datetime.md).

Типы интервалов:

* `SECOND`
* `MINUTE`
* `HOUR`
* `DAY`
* `WEEK`
* `MONTH`
* `QUARTER`
* `YEAR`

Вы также можете использовать строковый литерал при задании значения `INTERVAL`. Например, `INTERVAL 1 HOUR` эквивалентно `INTERVAL '1 hour'` или `INTERVAL '1' hour`.

:::tip\
Интервалы разных типов нельзя комбинировать. Нельзя использовать выражения вида `INTERVAL 4 DAY 1 HOUR`. Задавайте интервалы в единицах, которые не превосходят наименьшую единицу интервала, например `INTERVAL 25 HOUR`. Вы можете использовать последовательные операции, как в примере ниже.
:::

Примеры:

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL 4 DAY + INTERVAL 3 HOUR;
```

```text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay(4)), toIntervalHour(3))─┐
│ 2020-11-03 22:09:50 │                                    2020-11-08 01:09:50 │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL '4 day' + INTERVAL '3 hour';
```

```text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay(4)), toIntervalHour(3))─┐
│ 2020-11-03 22:12:10 │                                    2020-11-08 01:12:10 │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL '4' day + INTERVAL '3' hour;
```

```text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay('4')), toIntervalHour('3'))─┐
│ 2020-11-03 22:33:19 │                                        2020-11-08 01:33:19 │
└─────────────────────┴────────────────────────────────────────────────────────────┘
```

:::note\
Синтаксис `INTERVAL` или функция `addDays` всегда предпочтительнее. Простое сложение или вычитание (синтаксис вида `now() + ...`) не учитывает настройки часового пояса, например переход на летнее время.
:::

Примеры:

```sql
SELECT toDateTime('2014-10-26 00:00:00', 'Asia/Istanbul') AS time, time + 60 * 60 * 24 AS time_plus_24_hours, time + toIntervalDay(1) AS time_plus_1_day;
```

```text
┌────────────────time─┬──time_plus_24_hours─┬─────time_plus_1_day─┐
│ 2014-10-26 00:00:00 │ 2014-10-26 23:00:00 │ 2014-10-27 00:00:00 │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**См. также**

* Тип данных [Interval](../../sql-reference/data-types/special-data-types/interval.md)
* Функции преобразования типов [toInterval](/sql-reference/functions/type-conversion-functions#tointervalyear)


## Оператор логического И \{#logical-and-operator\}

Синтаксис `SELECT a AND b` — вычисляет логическую конъюнкцию `a` и `b` с помощью функции [and](/sql-reference/functions/logical-functions#and).

## Оператор логического ИЛИ \{#logical-or-operator\}

Синтаксис `SELECT a OR b` вычисляет логическую дизъюнкцию выражений `a` и `b` с помощью функции [or](/sql-reference/functions/logical-functions#or).

## Оператор логического отрицания \{#logical-negation-operator\}

Синтаксис `SELECT NOT a` вычисляет логическое отрицание выражения `a` с помощью функции [not](/sql-reference/functions/logical-functions#not).

## Условный оператор \{#conditional-operator\}

`a ? b : c` – функция `if(a, b, c)`.

Примечание:

Условный оператор сначала вычисляет значения `b` и `c`, затем проверяет, выполняется ли условие `a`, и возвращает соответствующее значение. Если `b` или `C` является функцией [arrayJoin()](/sql-reference/functions/array-join), каждая строка будет продублирована независимо от условия `a`.

## Условное выражение

```sql
CASE [x]
    WHEN a THEN b
    [WHEN ... THEN ...]
    [ELSE c]
END
```

Если параметр `x` задан, используется функция `transform(x, [a, ...], [b, ...], c)`. В противном случае — `multiIf(a, b, ..., c)`.

Если в выражении отсутствует конструкция `ELSE c`, значением по умолчанию является `NULL`.

Функция `transform` не работает с `NULL`.


## Оператор конкатенации \{#concatenation-operator\}

`s1 || s2` — то же, что функция `concat(s1, s2)`.

## Оператор создания лямбда-выражения \{#lambda-creation-operator\}

`x -> expr` – это функция `lambda(x, expr)`.

Следующие операторы не имеют приоритета, так как являются скобками:

## Оператор создания массива \{#array-creation-operator\}

`[x1, ...]` – это функция `array(x1, ...)`.

## Оператор создания кортежа \{#tuple-creation-operator\}

`(x1, x2, ...)` – То же, что и функция `tuple(x1, x2, ...)`.

## Ассоциативность \{#associativity\}

Все бинарные операторы являются левоассоциативными. Например, `1 + 2 + 3` преобразуется в `plus(plus(1, 2), 3)`.
Иногда это работает не так, как вы ожидаете. Например, `SELECT 4 > 2 > 3` вернёт 0.

Для повышения эффективности функции `and` и `or` принимают любое количество аргументов. Соответствующие цепочки операторов `AND` и `OR` преобразуются в один вызов этих функций.

## Проверка на `NULL` \{#checking-for-null\}

ClickHouse поддерживает операторы `IS NULL` и `IS NOT NULL`.

### IS NULL \

* Для значений типа [Nullable](../../sql-reference/data-types/nullable.md) оператор `IS NULL` возвращает:
  * `1`, если значение равно `NULL`;
  * `0` во всех остальных случаях.
* Для остальных типов значений оператор `IS NULL` всегда возвращает `0`.

Работу оператора можно оптимизировать, включив настройку [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns). При `optimize_functions_to_subcolumns = 1` функция читает только подколонку [null](../../sql-reference/data-types/nullable.md#finding-null) вместо чтения и обработки данных всей колонки. Запрос `SELECT n IS NULL FROM table` преобразуется в `SELECT n.null FROM TABLE`.

{/* */ }

```sql
SELECT x+100 FROM t_null WHERE y IS NULL
```

```text
┌─plus(x, 100)─┐
│          101 │
└──────────────┘
```


### IS NOT NULL \

* Для значений типа [Nullable](../../sql-reference/data-types/nullable.md) оператор `IS NOT NULL` возвращает:
  * `0`, если значение `NULL`;
  * `1` во всех остальных случаях.
* Для значений других типов оператор `IS NOT NULL` всегда возвращает `1`.

{/* */ }

```sql
SELECT * FROM t_null WHERE y IS NOT NULL
```

```text
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

Можно оптимизировать, включив настройку [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns). При `optimize_functions_to_subcolumns = 1` функция читает только подстолбец [null](../../sql-reference/data-types/nullable.md#finding-null) вместо чтения и обработки данных всего столбца. Запрос `SELECT n IS NOT NULL FROM table` преобразуется в `SELECT NOT n.null FROM TABLE`.
