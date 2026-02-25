---
description: 'Справочник по функциям преобразования типов'
sidebar_label: 'Преобразование типов'
slug: /sql-reference/functions/type-conversion-functions
title: 'Функции преобразования типов'
doc_type: 'reference'
---

# Функции преобразования типов \{#type-conversion-functions\}

## Распространенные проблемы при преобразовании данных \{#common-issues-with-data-conversion\}

ClickHouse обычно использует [то же поведение, что и программы на C++](https://en.cppreference.com/w/cpp/language/implicit_conversion).

Функции `to<type>` и [cast](#CAST) в некоторых случаях ведут себя по-разному, например, в случае [LowCardinality](../data-types/lowcardinality.md): [cast](#CAST) удаляет признак [LowCardinality](../data-types/lowcardinality.md), а функции `to<type>` этого не делают. Аналогично с [Nullable](../data-types/nullable.md): это поведение несовместимо со стандартом SQL, и его можно изменить с помощью настройки [cast&#95;keep&#95;nullable](../../operations/settings/settings.md/#cast_keep_nullable).

:::note
Учитывайте возможную потерю данных, если значения типа данных преобразуются в тип с меньшим диапазоном (например, из `Int64` в `Int32`) или между
несовместимыми типами данных (например, из `String` в `Int`). Внимательно проверяйте, что результат соответствует ожиданиям.
:::

Пример:

```sql
SELECT
    toTypeName(toLowCardinality('') AS val) AS source_type,
    toTypeName(toString(val)) AS to_type_result_type,
    toTypeName(CAST(val, 'String')) AS cast_result_type

┌─source_type────────────┬─to_type_result_type────┬─cast_result_type─┐
│ LowCardinality(String) │ LowCardinality(String) │ String           │
└────────────────────────┴────────────────────────┴──────────────────┘

SELECT
    toTypeName(toNullable('') AS val) AS source_type,
    toTypeName(toString(val)) AS to_type_result_type,
    toTypeName(CAST(val, 'String')) AS cast_result_type

┌─source_type──────┬─to_type_result_type─┬─cast_result_type─┐
│ Nullable(String) │ Nullable(String)    │ String           │
└──────────────────┴─────────────────────┴──────────────────┘

SELECT
    toTypeName(toNullable('') AS val) AS source_type,
    toTypeName(toString(val)) AS to_type_result_type,
    toTypeName(CAST(val, 'String')) AS cast_result_type
SETTINGS cast_keep_nullable = 1

┌─source_type──────┬─to_type_result_type─┬─cast_result_type─┐
│ Nullable(String) │ Nullable(String)    │ Nullable(String) │
└──────────────────┴─────────────────────┴──────────────────┘
```


## Заметки о функциях `toString` \{#to-string-functions\}

Семейство функций `toString` позволяет преобразовывать числа, строки (но не фиксированные строки), даты и даты со временем друг в друга.
Каждая из этих функций принимает один аргумент.

- При преобразовании в строку или из строки значение форматируется или парсится по тем же правилам, что и для формата TabSeparated (и почти всех других текстовых форматов). Если строку нельзя распарсить, генерируется исключение и запрос отменяется.
- При преобразовании дат в числа или наоборот дате соответствует количество дней, прошедших с начала эпохи Unix.
- При преобразовании дат со временем в числа или наоборот дате со временем соответствует количество секунд, прошедших с начала эпохи Unix.
- Функция `toString` с аргументом типа `DateTime` может принимать второй аргумент типа String, содержащий название часового пояса, например: `Europe/Amsterdam`. В этом случае время форматируется в соответствии с указанным часовым поясом.

## Примечания о функциях `toDate`/`toDateTime` \{#to-date-and-date-time-functions\}

Форматы даты и даты-времени, используемые функциями `toDate`/`toDateTime`, определены следующим образом:

```response
YYYY-MM-DD
YYYY-MM-DD hh:mm:ss
```

В качестве исключения, при преобразовании из числовых типов UInt32, Int32, UInt64 или Int64 в Date, если число больше или равно 65536, оно интерпретируется как Unix timestamp (а не как количество дней) и округляется до даты.
Это позволяет поддержать распространённый случай вызова `toDate(unix_timestamp)`, который в противном случае привёл бы к ошибке и потребовал бы более громоздкого выражения `toDate(toDateTime(unix_timestamp))`.

Преобразование между датой и датой со временем выполняется естественным образом: путём добавления нулевого значения времени или отбрасывания времени.

Преобразование между числовыми типами осуществляется по тем же правилам, что и операции присваивания между различными числовыми типами в C++.

**Пример**

Запрос:

```sql
SELECT
    now() AS ts,
    time_zone,
    toString(ts, time_zone) AS str_tz_datetime
FROM system.time_zones
WHERE time_zone LIKE 'Europe%'
LIMIT 10
```

Результат:

```response
┌──────────────────ts─┬─time_zone─────────┬─str_tz_datetime─────┐
│ 2023-09-08 19:14:59 │ Europe/Amsterdam  │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Andorra    │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Astrakhan  │ 2023-09-08 23:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Athens     │ 2023-09-08 22:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Belfast    │ 2023-09-08 20:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Belgrade   │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Berlin     │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Bratislava │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Brussels   │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Bucharest  │ 2023-09-08 22:14:59 │
└─────────────────────┴───────────────────┴─────────────────────┘
```

См. также функцию [`toUnixTimestamp`](/sql-reference/functions/date-time-functions#toUnixTimestamp).

{/* 
  Содержимое тегов ниже при сборке фреймворка документации
  заменяется документацией, сгенерированной из system.functions. Пожалуйста, не изменяйте и не удаляйте эти теги.
  См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }


## CAST \{#CAST\}

Впервые представлена в версии: v1.1

Преобразует значение в указанный тип данных.
В отличие от функции reinterpret, CAST пытается получить то же значение в целевом типе.
Если это невозможно, выбрасывается исключение.

**Синтаксис**

```sql
CAST(x, T)
or CAST(x AS T)
or x::T
```

**Аргументы**

* `x` — значение любого типа. [`Any`](/sql-reference/data-types)
* `T` — целевой тип данных. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение, приведённое к целевому типу данных. [`Any`](/sql-reference/data-types)

**Примеры**

**Простое использование**

```sql title=Query
SELECT CAST(42, 'String')
```

```response title=Response
┌─CAST(42, 'String')─┐
│ 42                 │
└────────────────────┘
```

**Использование синтаксиса AS**

```sql title=Query
SELECT CAST('2025-01-01' AS Date)
```

```response title=Response
┌─CAST('2025-01-01', 'Date')─┐
│                 2025-01-01 │
└────────────────────────────┘
```

**Использование синтаксиса ::**

```sql title=Query
SELECT '123'::UInt32
```

```response title=Response
┌─CAST('123', 'UInt32')─┐
│                   123 │
└───────────────────────┘
```


## DATE \{#DATE\}

Добавлено в: v21.2

Преобразует аргумент в тип данных Date. Это псевдоним функции `toDate` для совместимости с MySQL. Работает так же, как `toDate`.

**Синтаксис**

```sql
DATE(expr)
```

**Аргументы**

* `expr` — Значение, которое нужно преобразовать. [`String`](/sql-reference/data-types/string) или [`UInt32`](/sql-reference/data-types/int-uint) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime)

**Возвращаемое значение**

Возвращает значение типа Date. [`Date`](/sql-reference/data-types/date)

**Примеры**

**Базовое использование**

```sql title=Query
SELECT DATE('2023-01-01')
```

```response title=Response
2023-01-01
```


## accurateCast \{#accurateCast\}

Добавлено в версии: v1.1

Преобразует значение в указанный тип данных. В отличие от [`CAST`](#CAST), `accurateCast` выполняет более строгую проверку типов и генерирует исключение, если преобразование приведёт к потере точности данных или если преобразование невозможно.

Эта функция безопаснее обычного `CAST`, поскольку предотвращает потерю точности и недопустимые преобразования.

**Синтаксис**

```sql
accurateCast(x, T)
```

**Аргументы**

* `x` — значение для преобразования. [`Any`](/sql-reference/data-types)
* `T` — имя целевого типа данных. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение, приведённое к целевому типу данных. [`Any`](/sql-reference/data-types)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT accurateCast(42, 'UInt16')
```

```response title=Response
┌─accurateCast(42, 'UInt16')─┐
│                        42 │
└───────────────────────────┘
```

**Преобразование строки в число**

```sql title=Query
SELECT accurateCast('123.45', 'Float64')
```

```response title=Response
┌─accurateCast('123.45', 'Float64')─┐
│                            123.45 │
└───────────────────────────────────┘
```


## accurateCastOrDefault \{#accurateCastOrDefault\}

Введена в версии: v21.1

Преобразует значение в указанный тип данных.
Аналогично [`accurateCast`](#accurateCast), но возвращает значение по умолчанию вместо выбрасывания исключения, если преобразование не может быть выполнено точно.

Если значение по умолчанию передано вторым аргументом, оно должно быть целевого типа.
Если значение по умолчанию не передано, используется значение по умолчанию целевого типа.

**Синтаксис**

```sql
accurateCastOrDefault(x, T[, default_value])
```

**Аргументы**

* `x` — Значение, которое нужно преобразовать. [`Any`](/sql-reference/data-types)
* `T` — Имя целевого типа данных. [`const String`](/sql-reference/data-types/string)
* `default_value` — Необязательный параметр. Значение по умолчанию, которое возвращается при неудачной попытке преобразования. [`Any`](/sql-reference/data-types)

**Возвращаемое значение**

Возвращает значение целевого типа данных или значение по умолчанию, если преобразование невозможно. [`Any`](/sql-reference/data-types)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT accurateCastOrDefault(42, 'String')
```

```response title=Response
┌─accurateCastOrDefault(42, 'String')─┐
│ 42                                  │
└─────────────────────────────────────┘
```

**Сбой преобразования с явным значением по умолчанию**

```sql title=Query
SELECT accurateCastOrDefault('abc', 'UInt32', 999::UInt32)
```

```response title=Response
┌─accurateCastOrDefault('abc', 'UInt32', 999)─┐
│                                         999 │
└─────────────────────────────────────────────┘
```

**Ошибка преобразования с неявным значением по умолчанию**

```sql title=Query
SELECT accurateCastOrDefault('abc', 'UInt32')
```

```response title=Response
┌─accurateCastOrDefault('abc', 'UInt32')─┐
│                                      0 │
└────────────────────────────────────────┘
```


## accurateCastOrNull \{#accurateCastOrNull\}

Впервые представлена в: v1.1

Преобразует значение в указанный тип данных.
Аналог [`accurateCast`](#accurateCast), но возвращает `NULL` вместо генерации исключения, если преобразование не может быть выполнено точно.

Эта функция сочетает безопасность [`accurateCast`](#accurateCast) с корректной обработкой ошибок.

**Синтаксис**

```sql
accurateCastOrNull(x, T)
```

**Аргументы**

* `x` — Значение, которое нужно преобразовать. [`Any`](/sql-reference/data-types)
* `T` — Имя целевого типа данных. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение, преобразованное к целевому типу данных, или `NULL`, если преобразование невозможно. [`Any`](/sql-reference/data-types)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT accurateCastOrNull(42, 'String')
```

```response title=Response
┌─accurateCastOrNull(42, 'String')─┐
│ 42                               │
└──────────────────────────────────┘
```

**При ошибке преобразования возвращается NULL**

```sql title=Query
SELECT accurateCastOrNull('abc', 'UInt32')
```

```response title=Response
┌─accurateCastOrNull('abc', 'UInt32')─┐
│                                ᴺᵁᴸᴸ │
└─────────────────────────────────────┘
```


## formatRow \{#formatRow\}

Введена в версии: v20.7

Преобразует произвольные выражения в строку в соответствии с заданным форматом.

:::note
Если формат содержит суффикс или префикс, он будет добавляться к каждой строке.
В этой функции поддерживаются только построчные форматы.
:::

**Синтаксис**

```sql
formatRow(format, x, y, ...)
```

**Аргументы**

* `format` — текстовый формат, например CSV, TSV. [`String`](/sql-reference/data-types/string)
* `x, y, ...` — выражения. [`Any`](/sql-reference/data-types)

**Возвращаемое значение**

Отформатированная строка. Для текстовых форматов обычно заканчивается символом новой строки. [`String`](/sql-reference/data-types/string)

**Примеры**

**Базовое использование**

```sql title=Query
SELECT formatRow('CSV', number, 'good')
FROM numbers(3)
```

```response title=Response
┌─formatRow('CSV', number, 'good')─┐
│ 0,"good"
                         │
│ 1,"good"
                         │
│ 2,"good"
                         │
└──────────────────────────────────┘
```

**С настраиваемым форматом**

```sql title=Query
SELECT formatRow('CustomSeparated', number, 'good')
FROM numbers(3)
SETTINGS format_custom_result_before_delimiter='<prefix>\n', format_custom_result_after_delimiter='<suffix>'
```

```response title=Response
┌─formatRow('CustomSeparated', number, 'good')─┐
│ <prefix>
0    good
<suffix>                   │
│ <prefix>
1    good
<suffix>                   │
│ <prefix>
2    good
<suffix>                   │
└──────────────────────────────────────────────┘
```


## formatRowNoNewline \{#formatRowNoNewline\}

Добавлена в: v20.7

То же, что и [`formatRow`](#formatRow), но удаляет символ перевода строки в конце каждой строки.

Преобразует произвольные выражения в строку с использованием заданного формата, но удаляет любые завершающие символы перевода строки из результата.

**Синтаксис**

```sql
formatRowNoNewline(format, x, y, ...)
```

**Аргументы**

* `format` — текстовый формат. Например, CSV, TSV. [`String`](/sql-reference/data-types/string)
* `x, y, ...` — выражения. [`Any`](/sql-reference/data-types)

**Возвращаемое значение**

Возвращает форматированную строку с удалёнными переводами строк. [`String`](/sql-reference/data-types/string)

**Примеры**

**Базовое использование**

```sql title=Query
SELECT formatRowNoNewline('CSV', number, 'good')
FROM numbers(3)
```

```response title=Response
┌─formatRowNoNewline('CSV', number, 'good')─┐
│ 0,"good"                                  │
│ 1,"good"                                  │
│ 2,"good"                                  │
└───────────────────────────────────────────┘
```


## fromUnixTimestamp64Micro \{#fromUnixTimestamp64Micro\}

Появилась в версии: v20.5

Преобразует Unix-метку времени в микросекундах в значение типа `DateTime64` с точностью до микросекунд.

Входное значение рассматривается как Unix-метка времени с точностью до микросекунд (количество микросекунд, прошедших с 1970-01-01 00:00:00 UTC).

**Синтаксис**

```sql
fromUnixTimestamp64Micro(value[, timezone])
```

**Аргументы**

* `value` — Unix-метка времени в микросекундах. [`Int64`](/sql-reference/data-types/int-uint)
* `timezone` — Необязательный параметр. Часовой пояс для возвращаемого значения. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение `DateTime64` с точностью до микросекунд. [`DateTime64(6)`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT fromUnixTimestamp64Micro(1640995200123456)
```

```response title=Response
┌─fromUnixTimestamp64Micro(1640995200123456)─┐
│                 2022-01-01 00:00:00.123456 │
└────────────────────────────────────────────┘
```


## fromUnixTimestamp64Milli \{#fromUnixTimestamp64Milli\}

Впервые появилась в: v20.5

Преобразует Unix-метку времени в миллисекундах в значение `DateTime64` с миллисекундной точностью.

Входное значение интерпретируется как Unix-метка времени с миллисекундной точностью (количество миллисекунд, прошедших с 1970-01-01 00:00:00 UTC).

**Синтаксис**

```sql
fromUnixTimestamp64Milli(value[, timezone])
```

**Аргументы**

* `value` — отметка времени Unix в миллисекундах. [`Int64`](/sql-reference/data-types/int-uint)
* `timezone` — необязательный параметр. Часовой пояс для возвращаемого значения. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Значение `DateTime64` с точностью до миллисекунд. [`DateTime64(3)`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT fromUnixTimestamp64Milli(1640995200123)
```

```response title=Response
┌─fromUnixTimestamp64Milli(1640995200123)─┐
│                 2022-01-01 00:00:00.123 │
└─────────────────────────────────────────┘
```


## fromUnixTimestamp64Nano \{#fromUnixTimestamp64Nano\}

Добавлена в версии: v20.5

Преобразует Unix‑временную метку в наносекундах в значение [`DateTime64`](/sql-reference/data-types/datetime64) с точностью до наносекунды.

Входное значение интерпретируется как Unix‑временная метка с точностью до наносекунды (количество наносекунд, прошедших с 1970-01-01 00:00:00 UTC).

:::note
Обратите внимание, что входное значение интерпретируется как метка времени в UTC, а не с учётом временной зоны, указанной во входном значении.
:::

**Синтаксис**

```sql
fromUnixTimestamp64Nano(value[, timezone])
```

**Аргументы**

* `value` — Unix-метка времени в наносекундах. [`Int64`](/sql-reference/data-types/int-uint)
* `timezone` — необязательный параметр. Часовой пояс для возвращаемого значения. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение `DateTime64` с точностью до наносекунд. [`DateTime64(9)`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT fromUnixTimestamp64Nano(1640995200123456789)
```

```response title=Response
┌─fromUnixTimestamp64Nano(1640995200123456789)─┐
│                2022-01-01 00:00:00.123456789 │
└──────────────────────────────────────────────┘
```


## fromUnixTimestamp64Second \{#fromUnixTimestamp64Second\}

Добавлена в версии: v24.12

Преобразует Unix‑метку времени в секундах в значение `DateTime64` с точностью до секунды.

Входное значение интерпретируется как Unix‑метка времени с точностью до секунды (количество секунд, прошедших с 1970-01-01 00:00:00 UTC).

**Синтаксис**

```sql
fromUnixTimestamp64Second(value[, timezone])
```

**Аргументы**

* `value` — Unix-таймстамп в секундах. [`Int64`](/sql-reference/data-types/int-uint)
* `timezone` — Необязательный параметр. Часовой пояс для возвращаемого значения. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение `DateTime64` с точностью до секунды. [`DateTime64(0)`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT fromUnixTimestamp64Second(1640995200)
```

```response title=Response
┌─fromUnixTimestamp64Second(1640995200)─┐
│                   2022-01-01 00:00:00 │
└───────────────────────────────────────┘
```


## parseDateTime \{#parseDateTime\}

Появилась в версии: v23.3

Разбирает строку с датой и временем в соответствии со строкой формата даты MySQL.

Эта функция является обратной для [`formatDateTime`](/sql-reference/functions/date-time-functions).
Она разбирает аргумент типа String, используя строку формата. Возвращает значение типа DateTime.

**Синтаксис**

```sql
parseDateTime(time_string, format[, timezone])
```

**Псевдонимы**: `TO_UNIXTIME`

**Аргументы**

* `time_string` — Строка, которую нужно преобразовать в DateTime. [`String`](/sql-reference/data-types/string)
* `format` — Строка формата, задающая способ разбора значения `time_string`. [`String`](/sql-reference/data-types/string)
* `timezone` — Необязательный параметр. Часовой пояс. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение DateTime, полученное разбором входной строки в соответствии со строкой формата в стиле MySQL. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTime('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')
```

```response title=Response
┌─parseDateTime('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                       2025-01-04 23:00:00 │
└───────────────────────────────────────────────────────────┘
```


## parseDateTime32BestEffort \{#parseDateTime32BestEffort\}

Появилась в версии: v20.9

Преобразует строковое представление даты и времени в тип данных [`DateTime`](/sql-reference/data-types/datetime).

Функция разбирает форматы [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601), [RFC 1123 - 5.2.14 RFC-822 Date and Time Specification](https://tools.ietf.org/html/rfc1123#page-55), формат ClickHouse и некоторые другие форматы даты и времени.

**Синтаксис**

```sql
parseDateTime32BestEffort(time_string[, time_zone])
```

**Аргументы**

* `time_string` — строка, содержащая дату и время для преобразования. [`String`](/sql-reference/data-types/string)
* `time_zone` — необязательный параметр. Часовой пояс, в соответствии с которым интерпретируется `time_string`. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `time_string` в виде значения типа `DateTime`. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTime32BestEffort('23/10/2025 12:12:57')
AS parseDateTime32BestEffort
```

```response title=Response
┌─parseDateTime32BestEffort─┐
│       2025-10-23 12:12:57 │
└───────────────────────────┘
```

**С учётом часового пояса**

```sql title=Query
SELECT parseDateTime32BestEffort('Sat, 18 Aug 2025 07:22:16 GMT', 'Asia/Istanbul')
AS parseDateTime32BestEffort
```

```response title=Response
┌─parseDateTime32BestEffort─┐
│       2025-08-18 10:22:16 │
└───────────────────────────┘
```

**Метка времени Unix**

```sql title=Query
SELECT parseDateTime32BestEffort('1284101485')
AS parseDateTime32BestEffort
```

```response title=Response
┌─parseDateTime32BestEffort─┐
│       2015-07-07 12:04:41 │
└───────────────────────────┘
```


## parseDateTime32BestEffortOrNull \{#parseDateTime32BestEffortOrNull\}

Добавлена в: v20.9

Аналогична [`parseDateTime32BestEffort`](#parseDateTime32BestEffort), за исключением того, что возвращает `NULL`, если встречает формат даты, который не удаётся обработать.

**Синтаксис**

```sql
parseDateTime32BestEffortOrNull(time_string[, time_zone])
```

**Аргументы**

* `time_string` — строка, содержащая дату и время для преобразования. [`String`](/sql-reference/data-types/string)
* `time_zone` — необязательный параметр. Часовой пояс, в соответствии с которым разбирается `time_string`. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает объект `DateTime`, полученный разбором строки, или `NULL`, если разбор не удался. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    parseDateTime32BestEffortOrNull('23/10/2025 12:12:57') AS valid,
    parseDateTime32BestEffortOrNull('invalid date') AS invalid
```

```response title=Response
┌─valid───────────────┬─invalid─┐
│ 2025-10-23 12:12:57 │    ᴺᵁᴸᴸ │
└─────────────────────┴─────────┘
```


## parseDateTime32BestEffortOrZero \{#parseDateTime32BestEffortOrZero\}

Добавлена в версии: v20.9

Аналог функции [`parseDateTime32BestEffort`](#parseDateTime32BestEffort), за исключением того, что при встрече нераспознаваемого формата даты возвращает нулевую дату или нулевое значение даты-времени.

**Синтаксис**

```sql
parseDateTime32BestEffortOrZero(time_string[, time_zone])
```

**Аргументы**

* `time_string` — строка, содержащая дату и время для преобразования. [`String`](/sql-reference/data-types/string)
* `time_zone` — необязательный параметр. Часовой пояс, в соответствии с которым разбирается `time_string`. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает объект `DateTime`, полученный при разборе строки, или нулевую дату (`1970-01-01 00:00:00`), если разбор завершается неудачей. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    parseDateTime32BestEffortOrZero('23/10/2025 12:12:57') AS valid,
    parseDateTime32BestEffortOrZero('invalid date') AS invalid
```

```response title=Response
┌─valid───────────────┬─invalid─────────────┐
│ 2025-10-23 12:12:57 │ 1970-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
```


## parseDateTime64 \{#parseDateTime64\}

Введена в версии v24.11

Разбирает строку даты и времени с подсекундной точностью в соответствии с форматом даты MySQL.

Эта функция является инверсией функции [`formatDateTime`](/sql-reference/functions/date-time-functions) для DateTime64.
Она разбирает аргумент типа String, используя строку формата. Возвращает тип DateTime64, который может представлять даты с 1900 по 2299 год с подсекундной точностью.

**Синтаксис**

```sql
parseDateTime64(time_string, format[, timezone])
```

**Аргументы**

* `time_string` — Строка, которую нужно преобразовать в DateTime64. [`String`](/sql-reference/data-types/string)
* `format` — Форматная строка, определяющая, как следует разбирать `time_string`. [`String`](/sql-reference/data-types/string)
* `timezone` — Необязательный параметр. Часовой пояс. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа DateTime64, полученное путём разбора входной строки в соответствии с форматной строкой в стиле MySQL. [`DateTime64`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTime64('2025-01-04 23:00:00.123', '%Y-%m-%d %H:%i:%s.%f')
```

```response title=Response
┌─parseDateTime64('2025-01-04 23:00:00.123', '%Y-%m-%d %H:%i:%s.%f')─┐
│                                       2025-01-04 23:00:00.123       │
└─────────────────────────────────────────────────────────────────────┘
```


## parseDateTime64BestEffort \{#parseDateTime64BestEffort\}

Добавлено в: v20.1

Аналог функции [`parseDateTimeBestEffort`](#parseDateTimeBestEffort), но дополнительно разбирает миллисекунды и микросекунды и возвращает тип данных [`DateTime64`](../../sql-reference/data-types/datetime64.md).

**Синтаксис**

```sql
parseDateTime64BestEffort(time_string[, precision[, time_zone]])
```

**Аргументы**

* `time_string` — Строка с датой или датой и временем для преобразования. [`String`](/sql-reference/data-types/string)
* `precision` — Необязательный параметр. Требуемая точность результата: `3` для миллисекунд, `6` для микросекунд. По умолчанию — `3`. [`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — Необязательный параметр. Часовой пояс. Функция разбирает `time_string` в соответствии с этим часовым поясом. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `time_string`, преобразованную к типу данных [`DateTime64`](../../sql-reference/data-types/datetime64.md). [`DateTime64`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTime64BestEffort('2025-01-01') AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2025-01-01 01:01:00.12346') AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2025-01-01 01:01:00.12346',6) AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2025-01-01 01:01:00.12346',3,'Asia/Istanbul') AS a, toTypeName(a) AS t
FORMAT PrettyCompactMonoBlock
```

```response title=Response
┌──────────────────────────a─┬─t──────────────────────────────┐
│ 2025-01-01 01:01:00.123000 │ DateTime64(3)                  │
│ 2025-01-01 00:00:00.000000 │ DateTime64(3)                  │
│ 2025-01-01 01:01:00.123460 │ DateTime64(6)                  │
│ 2025-12-31 22:01:00.123000 │ DateTime64(3, 'Asia/Istanbul') │
└────────────────────────────┴────────────────────────────────┘
```


## parseDateTime64BestEffortOrNull \{#parseDateTime64BestEffortOrNull\}

Добавлена в версии v20.1

То же, что и [`parseDateTime64BestEffort`](#parseDateTime64BestEffort), но возвращает `NULL`, если встречает формат даты, который не удаётся обработать.

**Синтаксис**

```sql
parseDateTime64BestEffortOrNull(time_string[, precision[, time_zone]])
```

**Аргументы**

* `time_string` — Строка, содержащая дату или дату со временем для преобразования. [`String`](/sql-reference/data-types/string)
* `precision` — Необязательный параметр. Требуемая точность: `3` для миллисекунд, `6` для микросекунд. По умолчанию: `3`. [`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — Необязательный параметр. Часовой пояс. Функция интерпретирует `time_string` в соответствии с указанным часовым поясом. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `time_string`, преобразованную в [`DateTime64`](../../sql-reference/data-types/datetime64.md), или `NULL`, если входное значение не удаётся разобрать. [`DateTime64`](/sql-reference/data-types/datetime64) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTime64BestEffortOrNull('2025-01-01 01:01:00.123') AS valid,
       parseDateTime64BestEffortOrNull('invalid') AS invalid
```

```response title=Response
┌─valid───────────────────┬─invalid─┐
│ 2025-01-01 01:01:00.123 │    ᴺᵁᴸᴸ │
└─────────────────────────┴─────────┘
```


## parseDateTime64BestEffortOrZero \{#parseDateTime64BestEffortOrZero\}

Введена в: v20.1

Аналог функции [`parseDateTime64BestEffort`](#parseDateTime64BestEffort), за исключением того, что при обнаружении формата даты, который не может быть обработан, возвращает нулевую дату или нулевое значение даты-времени.

**Синтаксис**

```sql
parseDateTime64BestEffortOrZero(time_string[, precision[, time_zone]])
```

**Аргументы**

* `time_string` — Строка, содержащая дату или дату и время для преобразования. [`String`](/sql-reference/data-types/string)
* `precision` — Необязательный аргумент. Требуемая точность: `3` для миллисекунд, `6` для микросекунд. Значение по умолчанию: `3`. [`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — Необязательный аргумент. Часовой пояс. Функция разбирает `time_string` в соответствии с указанным часовым поясом. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `time_string`, преобразованную в [`DateTime64`](../../sql-reference/data-types/datetime64.md), или нулевую дату/дату-время (`1970-01-01 00:00:00.000`), если входное значение не удаётся разобрать. [`DateTime64`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTime64BestEffortOrZero('2025-01-01 01:01:00.123') AS valid,
       parseDateTime64BestEffortOrZero('invalid') AS invalid
```

```response title=Response
┌─valid───────────────────┬─invalid─────────────────┐
│ 2025-01-01 01:01:00.123 │ 1970-01-01 00:00:00.000 │
└─────────────────────────┴─────────────────────────┘
```


## parseDateTime64BestEffortUS \{#parseDateTime64BestEffortUS\}

Добавлена в версии: v22.8

Аналогична [`parseDateTime64BestEffort`](#parseDateTime64BestEffort), за исключением того, что при неоднозначности эта функция предпочитает американский формат даты (`MM/DD/YYYY` и т. д.).

**Синтаксис**

```sql
parseDateTime64BestEffortUS(time_string [, precision [, time_zone]])
```

**Аргументы**

* `time_string` — строка, содержащая дату или дату и время для преобразования. [`String`](/sql-reference/data-types/string)
* `precision` — необязательный параметр. Требуемая точность: `3` — для миллисекунд, `6` — для микросекунд. По умолчанию: `3`. [`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — необязательный параметр. Часовой пояс. Функция интерпретирует `time_string` в соответствии с указанным часовым поясом. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `time_string`, преобразованную в [`DateTime64`](../../sql-reference/data-types/datetime64.md), используя американский формат даты по умолчанию в неоднозначных случаях. [`DateTime64`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTime64BestEffortUS('02/10/2025 12:30:45.123') AS us_format,
       parseDateTime64BestEffortUS('15/08/2025 10:15:30.456') AS fallback_to_standard
```

```response title=Response
┌─us_format───────────────┬─fallback_to_standard────┐
│ 2025-02-10 12:30:45.123 │ 2025-08-15 10:15:30.456 │
└─────────────────────────┴─────────────────────────┘
```


## parseDateTime64BestEffortUSOrNull \{#parseDateTime64BestEffortUSOrNull\}

Введена в версии: v22.8

Аналогична функции [`parseDateTime64BestEffort`](#parseDateTime64BestEffort), за исключением того, что при неоднозначности эта функция отдаёт предпочтение американскому формату дат (`MM/DD/YYYY` и т. д.) и возвращает `NULL`, если встречает формат даты, который не может быть обработан.

**Синтаксис**

```sql
parseDateTime64BestEffortUSOrNull(time_string[, precision[, time_zone]])
```

**Аргументы**

* `time_string` — Строка, содержащая дату или дату и время для преобразования. [`String`](/sql-reference/data-types/string)
* `precision` — Необязательный параметр. Требуемая точность. `3` для миллисекунд, `6` для микросекунд. По умолчанию: `3`. [`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — Необязательный параметр. Часовой пояс. Функция разбирает `time_string` с учетом этого часового пояса. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `time_string`, преобразованную в [`DateTime64`](../../sql-reference/data-types/datetime64.md) с использованием американского формата даты и времени, или `NULL`, если входное значение не удается разобрать. [`DateTime64`](/sql-reference/data-types/datetime64) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTime64BestEffortUSOrNull('02/10/2025 12:30:45.123') AS valid_us,
       parseDateTime64BestEffortUSOrNull('invalid') AS invalid
```

```response title=Response
┌─valid_us────────────────┬─invalid─┐
│ 2025-02-10 12:30:45.123 │    ᴺᵁᴸᴸ │
└─────────────────────────┴─────────┘
```


## parseDateTime64BestEffortUSOrZero \{#parseDateTime64BestEffortUSOrZero\}

Введено в версии: v22.8

Аналог функции [`parseDateTime64BestEffort`](#parseDateTime64BestEffort), за исключением того, что при неоднозначной интерпретации эта функция предпочитает формат даты, принятый в США (`MM/DD/YYYY` и т. д.), и возвращает нулевую дату или нулевое значение даты-времени, когда встречает формат даты, который не удаётся обработать.

**Синтаксис**

```sql
parseDateTime64BestEffortUSOrZero(time_string [, precision [, time_zone]])
```

**Аргументы**

* `time_string` — Строка, содержащая дату или дату и время для преобразования. [`String`](/sql-reference/data-types/string)
* `precision` — Необязательный параметр. Требуемая точность: `3` для миллисекунд, `6` для микросекунд. Значение по умолчанию: `3`. [`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — Необязательный параметр. Часовой пояс. Функция парсит `time_string` в соответствии с этим часовым поясом. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `time_string`, преобразованную в [`DateTime64`](../../sql-reference/data-types/datetime64.md) с использованием формата США, или нулевое значение даты/даты-времени (`1970-01-01 00:00:00.000`), если не удаётся разобрать входную строку. [`DateTime64`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTime64BestEffortUSOrZero('02/10/2025 12:30:45.123') AS valid_us,
       parseDateTime64BestEffortUSOrZero('invalid') AS invalid
```

```response title=Response
┌─valid_us────────────────┬─invalid─────────────────┐
│ 2025-02-10 12:30:45.123 │ 1970-01-01 00:00:00.000 │
└─────────────────────────┴─────────────────────────┘
```


## parseDateTime64InJodaSyntax \{#parseDateTime64InJodaSyntax\}

Добавлено в: v24.10

Разбирает строку даты и времени с субсекундной точностью в соответствии со строкой формата даты в стиле Joda.

Эта функция является обратной функцией к [`formatDateTimeInJodaSyntax`](/sql-reference/functions/date-time-functions#formatDateTimeInJodaSyntax) для DateTime64.
Она парсит аргумент типа String, используя форматную строку в стиле Joda. Возвращает значение типа DateTime64, которое может представлять даты с 1900 по 2299 год с субсекундной точностью.

См. [документацию Joda Time](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html) для описания шаблонов форматов.

**Синтаксис**

```sql
parseDateTime64InJodaSyntax(time_string, format[, timezone])
```

**Аргументы**

* `time_string` — Строка, подлежащая преобразованию в DateTime64. [`String`](/sql-reference/data-types/string)
* `format` — Строка формата в синтаксисе Joda, определяющая, как интерпретировать `time_string`. [`String`](/sql-reference/data-types/string)
* `timezone` — Необязательный параметр. Часовой пояс. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа DateTime64, полученное из входной строки в соответствии со строкой формата в стиле Joda. [`DateTime64`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTime64InJodaSyntax('2025-01-04 23:00:00.123', 'yyyy-MM-dd HH:mm:ss.SSS')
```

```response title=Response
┌─parseDateTime64InJodaSyntax('2025-01-04 23:00:00.123', 'yyyy-MM-dd HH:mm:ss.SSS')─┐
│                                                          2025-01-04 23:00:00.123   │
└────────────────────────────────────────────────────────────────────────────────────┘
```


## parseDateTime64InJodaSyntaxOrNull \{#parseDateTime64InJodaSyntaxOrNull\}

Добавлено в версии: v24.10

То же, что и [`parseDateTime64InJodaSyntax`](#parseDateTime64InJodaSyntax), но возвращает `NULL`, если не удаётся разобрать дату в заданном формате.

**Синтаксис**

```sql
parseDateTime64InJodaSyntaxOrNull(time_string, format[, timezone])
```

**Аргументы**

* `time_string` — Строка, которая будет разобрана в DateTime64. [`String`](/sql-reference/data-types/string)
* `format` — Строка формата в синтаксисе Joda, определяющая способ разбора `time_string`. [`String`](/sql-reference/data-types/string)
* `timezone` — Необязательный параметр. Часовой пояс. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение DateTime64, полученное из входной строки, или NULL, если разбор не удался. [`Nullable(DateTime64)`](/sql-reference/data-types/nullable)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTime64InJodaSyntaxOrNull('2025-01-04 23:00:00.123', 'yyyy-MM-dd HH:mm:ss.SSS')
```

```response title=Response
┌─parseDateTime64InJodaSyntaxOrNull('2025-01-04 23:00:00.123', 'yyyy-MM-dd HH:mm:ss.SSS')─┐
│                                                             2025-01-04 23:00:00.123      │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```


## parseDateTime64InJodaSyntaxOrZero \{#parseDateTime64InJodaSyntaxOrZero\}

Введена в версии v24.10

Аналог функции [`parseDateTime64InJodaSyntax`](#parseDateTime64InJodaSyntax), но возвращает нулевую дату, когда встречает формат даты, который не удаётся разобрать.

**Синтаксис**

```sql
parseDateTime64InJodaSyntaxOrZero(time_string, format[, timezone])
```

**Аргументы**

* `time_string` — Строка, которую нужно преобразовать в DateTime64. [`String`](/sql-reference/data-types/string)
* `format` — Строка формата в синтаксисе Joda, определяющая, как разбирать `time_string`. [`String`](/sql-reference/data-types/string)
* `timezone` — Необязательный аргумент. Часовой пояс. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает DateTime64, полученный из входной строки, или нулевой DateTime64, если разбор не удался. [`DateTime64`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTime64InJodaSyntaxOrZero('2025-01-04 23:00:00.123', 'yyyy-MM-dd HH:mm:ss.SSS')
```

```response title=Response
┌─parseDateTime64InJodaSyntaxOrZero('2025-01-04 23:00:00.123', 'yyyy-MM-dd HH:mm:ss.SSS')─┐
│                                                              2025-01-04 23:00:00.123     │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```


## parseDateTime64OrNull \{#parseDateTime64OrNull\}

Добавлена в: v24.11

Аналог функции [`parseDateTime64`](#parseDateTime64), но возвращает `NULL`, когда встречает дату в нераспознаваемом формате.

**Синтаксис**

```sql
parseDateTime64OrNull(time_string, format[, timezone])
```

**Аргументы**

* `time_string` — Строка, которую нужно разобрать в DateTime64. [`String`](/sql-reference/data-types/string)
* `format` — Строка формата, задающая способ разбора `time_string`. [`String`](/sql-reference/data-types/string)
* `timezone` — Необязательный параметр. Часовой пояс. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает DateTime64, полученный при разборе входной строки, или NULL, если разбор не удался. [`Nullable(DateTime64)`](/sql-reference/data-types/nullable)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTime64OrNull('2025-01-04 23:00:00.123', '%Y-%m-%d %H:%i:%s.%f')
```

```response title=Response
┌─parseDateTime64OrNull('2025-01-04 23:00:00.123', '%Y-%m-%d %H:%i:%s.%f')─┐
│                                            2025-01-04 23:00:00.123        │
└───────────────────────────────────────────────────────────────────────────┘
```


## parseDateTime64OrZero \{#parseDateTime64OrZero\}

Введена в версии v24.11

Аналог функции [`parseDateTime64`](#parseDateTime64), но возвращает нулевую дату, если встречает неподдающийся разбору формат даты.

**Синтаксис**

```sql
parseDateTime64OrZero(time_string, format[, timezone])
```

**Аргументы**

* `time_string` — Строка, которая будет преобразована в значение типа DateTime64. [`String`](/sql-reference/data-types/string)
* `format` — Строка формата, задающая способ разбора `time_string`. [`String`](/sql-reference/data-types/string)
* `timezone` — Необязательный параметр. Часовой пояс. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа DateTime64, полученное из входной строки, или нулевое значение типа DateTime64, если разбор не удался. [`DateTime64`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTime64OrZero('2025-01-04 23:00:00.123', '%Y-%m-%d %H:%i:%s.%f')
```

```response title=Response
┌─parseDateTime64OrZero('2025-01-04 23:00:00.123', '%Y-%m-%d %H:%i:%s.%f')─┐
│                                             2025-01-04 23:00:00.123       │
└───────────────────────────────────────────────────────────────────────────┘
```


## parseDateTimeBestEffort \{#parseDateTimeBestEffort\}

Впервые представлено в: v1.1

Преобразует дату и время в строковом представлении в тип данных DateTime.
Функция разбирает форматы [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html), [RFC 1123 - 5.2.14 RFC-822](https://datatracker.ietf.org/doc/html/rfc822) Date and Time Specification, форматы ClickHouse и некоторые другие форматы даты и времени.

Поддерживаемые нестандартные форматы:

* Строка, содержащая 9..10-значный UNIX timestamp.
* Строка с компонентами даты и времени: `YYYYMMDDhhmmss`, `DD/MM/YYYY hh:mm:ss`, `DD-MM-YY hh:mm`, `YYYY-MM-DD hh:mm:ss` и т. д.
* Строка с датой без компонента времени: `YYYY`, `YYYYMM`, `YYYY*MM`, `DD/MM/YYYY`, `DD-MM-YY` и т. д.
* Строка с днём и временем: `DD`, `DD hh`, `DD hh:mm`. В этом случае для `MM` подставляется значение `01`.
* Строка, включающая дату и время вместе с информацией о смещении часового пояса: `YYYY-MM-DD hh:mm:ss ±h:mm` и т. д.
* Метка времени в формате syslog: `Mmm dd hh:mm:ss`. Например, `Jun  9 14:20:32`.

Для всех форматов с разделителем функция разбирает названия месяцев, указанные полностью или в виде первых трёх букв названия месяца.
Если год не указан, считается, что он равен текущему году.

**Синтаксис**

```sql
parseDateTimeBestEffort(time_string[, time_zone])
```

**Аргументы**

* `time_string` — строка, содержащая дату и время для преобразования. [`String`](/sql-reference/data-types/string)
* `time_zone` — необязательный параметр. Часовой пояс, в соответствии с которым разбирается `time_string`. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `time_string` в виде `DateTime`. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTimeBestEffort('23/10/2025 12:12:57') AS parseDateTimeBestEffort
```

```response title=Response
┌─parseDateTimeBestEffort─┐
│     2025-10-23 12:12:57 │
└─────────────────────────┘
```

**С учетом часового пояса**

```sql title=Query
SELECT parseDateTimeBestEffort('Sat, 18 Aug 2025 07:22:16 GMT', 'Asia/Istanbul') AS parseDateTimeBestEffort
```

```response title=Response
┌─parseDateTimeBestEffort─┐
│     2025-08-18 10:22:16 │
└─────────────────────────┘
```

**Unix-время**

```sql title=Query
SELECT parseDateTimeBestEffort('1735689600') AS parseDateTimeBestEffort
```

```response title=Response
┌─parseDateTimeBestEffort─┐
│     2025-01-01 00:00:00 │
└─────────────────────────┘
```


## parseDateTimeBestEffortOrNull \{#parseDateTimeBestEffortOrNull\}

Впервые появилась в: v1.1

То же, что и [`parseDateTimeBestEffort`](#parseDateTimeBestEffort), за исключением того, что функция возвращает `NULL`, когда встречает формат даты, который не может быть обработан.
Функция разбирает [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601), [RFC 1123 - 5.2.14 RFC-822 Date and Time Specification](https://tools.ietf.org/html/rfc1123#page-55), форматы дат и времени ClickHouse, а также некоторые другие форматы.

Поддерживаемые нестандартные форматы:

* Строка, содержащая 9..10-значный Unix timestamp.
* Строка с компонентами даты и времени: `YYYYMMDDhhmmss`, `DD/MM/YYYY hh:mm:ss`, `DD-MM-YY hh:mm`, `YYYY-MM-DD hh:mm:ss` и т. д.
* Строка с датой без компонента времени: `YYYY`, `YYYYMM`, `YYYY*MM`, `DD/MM/YYYY`, `DD-MM-YY` и т. д.
* Строка с днём и временем: `DD`, `DD hh`, `DD hh:mm`. В этом случае вместо `MM` подставляется `01`.
* Строка, включающая дату и время вместе с информацией о смещении часового пояса: `YYYY-MM-DD hh:mm:ss ±h:mm` и т. д.
* Временная метка syslog: `Mmm dd hh:mm:ss`. Например, `Jun  9 14:20:32`.

Для всех форматов с разделителем функция разбирает названия месяцев как по полному написанию, так и по первым трём буквам.
Если год не указан, считается, что он равен текущему году.

**Синтаксис**

```sql
parseDateTimeBestEffortOrNull(time_string[, time_zone])
```

**Аргументы**

* `time_string` — строка, содержащая дату и время для преобразования. [`String`](/sql-reference/data-types/string)
* `time_zone` — необязательный параметр. Часовой пояс, в соответствии с которым интерпретируется `time_string`. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `time_string` в виде DateTime или `NULL`, если входное значение не удаётся разобрать. [`DateTime`](/sql-reference/data-types/datetime) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTimeBestEffortOrNull('23/10/2025 12:12:57') AS valid,
       parseDateTimeBestEffortOrNull('invalid') AS invalid
```

```response title=Response
┌─valid───────────────┬─invalid─┐
│ 2025-10-23 12:12:57 │    ᴺᵁᴸᴸ │
└─────────────────────┴─────────┘
```


## parseDateTimeBestEffortOrZero \{#parseDateTimeBestEffortOrZero\}

Введена в: v1.1

Аналог функции [`parseDateTimeBestEffort`](#parseDateTimeBestEffort), за исключением того, что она возвращает нулевую дату или нулевое значение дата-время, когда встречает формат даты, который не может быть обработан.
Функция разбирает форматы [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601), [RFC 1123 - 5.2.14 RFC-822 Date and Time Specification](https://tools.ietf.org/html/rfc1123#page-55), форматы ClickHouse и некоторые другие форматы даты и времени.

Поддерживаемые нестандартные форматы:

* Строка, содержащая 9..10-значную UNIX-временную метку.
* Строка с компонентами даты и времени: `YYYYMMDDhhmmss`, `DD/MM/YYYY hh:mm:ss`, `DD-MM-YY hh:mm`, `YYYY-MM-DD hh:mm:ss` и т. д.
* Строка с датой, но без компонента времени: `YYYY`, `YYYYMM`, `YYYY*MM`, `DD/MM/YYYY`, `DD-MM-YY` и т. д.
* Строка с днём и временем: `DD`, `DD hh`, `DD hh:mm`. В этом случае для `MM` подставляется значение `01`.
* Строка, которая включает дату и время вместе с информацией о смещении часового пояса: `YYYY-MM-DD hh:mm:ss ±h:mm` и т. д.
* Временная метка в формате syslog: `Mmm dd hh:mm:ss`. Например, `Jun  9 14:20:32`.

Для всех форматов с разделителями функция разбирает названия месяцев, указанные полностью или первыми тремя буквами названия месяца.
Если год не указан, считается, что он равен текущему году.

**Синтаксис**

```sql
parseDateTimeBestEffortOrZero(time_string[, time_zone])
```

**Аргументы**

* `time_string` — Строка, содержащая дату и время для преобразования. [`String`](/sql-reference/data-types/string)
* `time_zone` — Необязательный аргумент. Часовой пояс, в соответствии с которым интерпретируется `time_string`. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `time_string` как `DateTime` или нулевую дату/дату-время (`1970-01-01` или `1970-01-01 00:00:00`), если значение не удаётся разобрать. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTimeBestEffortOrZero('23/10/2025 12:12:57') AS valid,
       parseDateTimeBestEffortOrZero('invalid') AS invalid
```

```response title=Response
┌─valid───────────────┬─invalid─────────────┐
│ 2025-10-23 12:12:57 │ 1970-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
```


## parseDateTimeBestEffortUS \{#parseDateTimeBestEffortUS\}

Введена в: v1.1

Эта функция ведет себя так же, как [`parseDateTimeBestEffort`](#parseDateTimeBestEffort) для ISO-форматов дат, например `YYYY-MM-DD hh:mm:ss`, а также других форматов дат, где компоненты месяца и дня могут быть однозначно извлечены, например `YYYYMMDDhhmmss`, `YYYY-MM`, `DD hh` или `YYYY-MM-DD hh:mm:ss ±h:mm`.
Если компоненты месяца и дня не могут быть однозначно извлечены, например `MM/DD/YYYY`, `MM-DD-YYYY` или `MM-DD-YY`, функция отдает предпочтение формату даты США вместо `DD/MM/YYYY`, `DD-MM-YYYY` или `DD-MM-YY`.
В качестве исключения из предыдущего утверждения, если месяц больше 12 и меньше либо равен 31, эта функция переходит к поведению [`parseDateTimeBestEffort`](#parseDateTimeBestEffort), например `15/08/2020` разбирается как `2020-08-15`.

**Синтаксис**

```sql
parseDateTimeBestEffortUS(time_string[, time_zone])
```

**Аргументы**

* `time_string` — строка, содержащая дату и время для преобразования. [`String`](/sql-reference/data-types/string)
* `time_zone` — необязательный параметр. Часовой пояс, в соответствии с которым разбирается `time_string`. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `time_string` как `DateTime`, отдавая предпочтение американскому формату даты в неоднозначных случаях. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTimeBestEffortUS('02/10/2025') AS us_format,
       parseDateTimeBestEffortUS('15/08/2025') AS fallback_to_standard
```

```response title=Response
┌─us_format───────────┬─fallback_to_standard─┐
│ 2025-02-10 00:00:00 │  2025-08-15 00:00:00 │
└─────────────────────┴──────────────────────┘
```


## parseDateTimeBestEffortUSOrNull \{#parseDateTimeBestEffortUSOrNull\}

Впервые представлена в версии v1.1

Аналог функции [`parseDateTimeBestEffortUS`](#parseDateTimeBestEffortUS), за исключением того, что она возвращает `NULL`, когда встречает формат даты, который не может быть обработан.

Эта функция ведёт себя как [`parseDateTimeBestEffort`](#parseDateTimeBestEffort) для ISO-форматов дат, но в неоднозначных случаях предпочитает американский формат дат, возвращая `NULL` при ошибках разбора.

**Синтаксис**

```sql
parseDateTimeBestEffortUSOrNull(time_string[, time_zone])
```

**Аргументы**

* `time_string` — Строка, содержащая дату и время для преобразования. [`String`](/sql-reference/data-types/string)
* `time_zone` — Необязательный параметр. Часовой пояс, в соответствии с которым интерпретируется `time_string`. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `time_string` как DateTime с приоритетом американских форматов дат или `NULL`, если входное значение не удаётся разобрать. [`DateTime`](/sql-reference/data-types/datetime) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTimeBestEffortUSOrNull('02/10/2025') AS valid_us,
       parseDateTimeBestEffortUSOrNull('invalid') AS invalid
```

```response title=Response
┌─valid_us────────────┬─invalid─┐
│ 2025-02-10 00:00:00 │    ᴺᵁᴸᴸ │
└─────────────────────┴─────────┘
```


## parseDateTimeBestEffortUSOrZero \{#parseDateTimeBestEffortUSOrZero\}

Добавлено в версии: v1.1

Аналог функции [`parseDateTimeBestEffortUS`](#parseDateTimeBestEffortUS), но возвращает нулевую дату (`1970-01-01`) или нулевую дату со временем (`1970-01-01 00:00:00`), если встречает формат даты, который не может быть обработан.

Эта функция ведет себя так же, как [`parseDateTimeBestEffort`](#parseDateTimeBestEffort) для форматов дат ISO, но в неоднозначных случаях предпочитает американский формат даты и возвращает нулевое значение при ошибках парсинга.

**Синтаксис**

```sql
parseDateTimeBestEffortUSOrZero(time_string[, time_zone])
```

**Аргументы**

* `time_string` — Строка, содержащая дату и время для преобразования. [`String`](/sql-reference/data-types/string)
* `time_zone` — Необязательный. Часовой пояс, в соответствии с которым разбирается `time_string`. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `time_string` как `DateTime`, используя формат даты и времени, принятый в США, или нулевую дату/дату-время (`1970-01-01` или `1970-01-01 00:00:00`), если входное значение не удаётся разобрать. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTimeBestEffortUSOrZero('02/10/2025') AS valid_us,
       parseDateTimeBestEffortUSOrZero('invalid') AS invalid
```

```response title=Response
┌─valid_us────────────┬─invalid─────────────┐
│ 2025-02-10 00:00:00 │ 1970-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
```


## parseDateTimeInJodaSyntax \{#parseDateTimeInJodaSyntax\}

Появилась в версии v23.3

Разбирает строку с датой и временем в соответствии со строкой формата даты Joda.

Эта функция является обратной к [`formatDateTimeInJodaSyntax`](/sql-reference/functions/date-time-functions#formatDateTimeInJodaSyntax).
Она разбирает строковый аргумент, используя строку формата в стиле Joda. Возвращает тип DateTime.

Обратитесь к [документации Joda Time](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html) для ознакомления с шаблонами форматов.

**Синтаксис**

```sql
parseDateTimeInJodaSyntax(time_string, format[, timezone])
```

**Аргументы**

* `time_string` — Строка для преобразования в DateTime. [`String`](/sql-reference/data-types/string)
* `format` — Строка формата в синтаксисе Joda, определяющая, как разбирать `time_string`. [`String`](/sql-reference/data-types/string)
* `timezone` — Необязательный параметр. Часовой пояс. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа DateTime, полученное из входной строки в соответствии со строкой формата в стиле Joda. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTimeInJodaSyntax('2025-01-04 23:00:00', 'yyyy-MM-dd HH:mm:ss')
```

```response title=Response
┌─parseDateTimeInJodaSyntax('2025-01-04 23:00:00', 'yyyy-MM-dd HH:mm:ss')─┐
│                                                      2025-01-04 23:00:00 │
└──────────────────────────────────────────────────────────────────────────┘
```


## parseDateTimeInJodaSyntaxOrNull \{#parseDateTimeInJodaSyntaxOrNull\}

Введена в: v23.3

Аналог функции [`parseDateTimeInJodaSyntax`](#parseDateTimeInJodaSyntax), но возвращает `NULL` при непарсируемом формате даты.

**Синтаксис**

```sql
parseDateTimeInJodaSyntaxOrNull(time_string, format[, timezone])
```

**Аргументы**

* `time_string` — Строка, которая будет преобразована в DateTime. [`String`](/sql-reference/data-types/string)
* `format` — Строка формата в синтаксисе Joda, задающая способ разбора `time_string`. [`String`](/sql-reference/data-types/string)
* `timezone` — Необязательный аргумент. Часовой пояс. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает DateTime, полученный из входной строки, или NULL, если разбор завершается неудачно. [`Nullable(DateTime)`](/sql-reference/data-types/nullable)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTimeInJodaSyntaxOrNull('2025-01-04 23:00:00', 'yyyy-MM-dd HH:mm:ss')
```

```response title=Response
┌─parseDateTimeInJodaSyntaxOrNull('2025-01-04 23:00:00', 'yyyy-MM-dd HH:mm:ss')─┐
│                                                         2025-01-04 23:00:00    │
└────────────────────────────────────────────────────────────────────────────────┘
```


## parseDateTimeInJodaSyntaxOrZero \{#parseDateTimeInJodaSyntaxOrZero\}

Добавлена в: v23.3

Аналог функции [`parseDateTimeInJodaSyntax`](#parseDateTimeInJodaSyntax), но возвращает нулевую дату, если встречает неподдающийся разбору формат даты.

**Синтаксис**

```sql
parseDateTimeInJodaSyntaxOrZero(time_string, format[, timezone])
```

**Аргументы**

* `time_string` — Строка для разбора в DateTime. [`String`](/sql-reference/data-types/string)
* `format` — Строка формата в синтаксисе Joda, задающая способ разбора `time_string`. [`String`](/sql-reference/data-types/string)
* `timezone` — Необязательный параметр. Часовой пояс. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает DateTime, полученный из входной строки, или нулевой DateTime, если разбор не удался. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTimeInJodaSyntaxOrZero('2025-01-04 23:00:00', 'yyyy-MM-dd HH:mm:ss')
```

```response title=Response
┌─parseDateTimeInJodaSyntaxOrZero('2025-01-04 23:00:00', 'yyyy-MM-dd HH:mm:ss')─┐
│                                                          2025-01-04 23:00:00   │
└────────────────────────────────────────────────────────────────────────────────┘
```


## parseDateTimeOrNull \{#parseDateTimeOrNull\}

Добавлено в: v23.3

Аналог [`parseDateTime`](#parseDateTime), но возвращает `NULL`, когда встречает некорректный формат даты.

**Синтаксис**

```sql
parseDateTimeOrNull(time_string, format[, timezone])
```

**Псевдонимы**: `str_to_date`

**Аргументы**

* `time_string` — Строка для разбора в DateTime. [`String`](/sql-reference/data-types/string)
* `format` — Строка формата, определяющая, как следует разбирать `time_string`. [`String`](/sql-reference/data-types/string)
* `timezone` — Необязательный параметр. Часовой пояс. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает DateTime, полученный разбором входной строки, или NULL, если разбор не удался. [`Nullable(DateTime)`](/sql-reference/data-types/nullable)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTimeOrNull('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')
```

```response title=Response
┌─parseDateTimeOrNull('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                            2025-01-04 23:00:00  │
└─────────────────────────────────────────────────────────────────┘
```


## parseDateTimeOrZero \{#parseDateTimeOrZero\}

Впервые появилась в версии v23.3

Аналог функции [`parseDateTime`](#parseDateTime), но возвращает нулевую дату, если встречает дату в формате, который невозможно разобрать.

**Синтаксис**

```sql
parseDateTimeOrZero(time_string, format[, timezone])
```

**Аргументы**

* `time_string` — Строка, которая будет преобразована в DateTime. [`String`](/sql-reference/data-types/string)
* `format` — Строка формата, задающая способ разбора `time_string`. [`String`](/sql-reference/data-types/string)
* `timezone` — Необязательный параметр. Часовой пояс. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает DateTime, полученный из входной строки, или нулевое значение DateTime, если разбор не удался. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Пример использования**

```sql title=Query
SELECT parseDateTimeOrZero('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')
```

```response title=Response
┌─parseDateTimeOrZero('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                             2025-01-04 23:00:00 │
└─────────────────────────────────────────────────────────────────┘
```


## reinterpret \{#reinterpret\}

Добавлено в версии v1.1

Использует ту же исходную последовательность байт в памяти для заданного значения `x` и переинтерпретирует её как значение целевого типа.

**Синтаксис**

```sql
reinterpret(x, type)
```

**Аргументы**

* `x` — Произвольный тип. [`Any`](/sql-reference/data-types)
* `type` — Целевой тип. Если это массив, тип элементов массива должен иметь фиксированную длину. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Значение целевого типа. [`Any`](/sql-reference/data-types)

**Примеры**

**Пример использования**

```sql title=Query
SELECT reinterpret(toInt8(-1), 'UInt8') AS int_to_uint,
    reinterpret(toInt8(1), 'Float32') AS int_to_float,
    reinterpret('1', 'UInt32') AS string_to_int
```

```response title=Response
┌─int_to_uint─┬─int_to_float─┬─string_to_int─┐
│         255 │        1e-45 │            49 │
└─────────────┴──────────────┴───────────────┘
```

**Пример с массивом**

```sql title=Query
SELECT reinterpret(x'3108b4403108d4403108b4403108d440', 'Array(Float32)') AS string_to_array_of_Float32
```

```response title=Response
┌─string_to_array_of_Float32─┐
│ [5.626,6.626,5.626,6.626]  │
└────────────────────────────┘
```


## reinterpretAsDate \{#reinterpretAsDate\}

Введена в версии: v1.1

Переинтерпретирует входное значение как значение типа Date (предполагается порядок байт little endian), представляющее собой количество дней с начала Unix-эпохи 1970-01-01.

**Синтаксис**

```sql
reinterpretAsDate(x)
```

**Аргументы**

* `x` — количество дней, прошедших с начала эпохи Unix. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`UUID`](/sql-reference/data-types/uuid) или [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Дата. [`Date`](/sql-reference/data-types/date)

**Примеры**

**Пример использования**

```sql title=Query
SELECT reinterpretAsDate(65), reinterpretAsDate('A')
```

```response title=Response
┌─reinterpretAsDate(65)─┬─reinterpretAsDate('A')─┐
│            1970-03-07 │             1970-03-07 │
└───────────────────────┴────────────────────────┘
```


## reinterpretAsDateTime \{#reinterpretAsDateTime\}

Введена в версии: v1.1

Интерпретирует входное значение как значение типа DateTime (предполагая порядок байт little endian), которое представляет собой количество дней, прошедших с начала эпохи Unix (1970-01-01).

**Синтаксис**

```sql
reinterpretAsDateTime(x)
```

**Аргументы**

* `x` — число секунд с начала эпохи Unix. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`UUID`](/sql-reference/data-types/uuid) или [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Дата и время. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Пример использования**

```sql title=Query
SELECT reinterpretAsDateTime(65), reinterpretAsDateTime('A')
```

```response title=Response
┌─reinterpretAsDateTime(65)─┬─reinterpretAsDateTime('A')─┐
│       1970-01-01 01:01:05 │        1970-01-01 01:01:05 │
└───────────────────────────┴────────────────────────────┘
```


## reinterpretAsFixedString \{#reinterpretAsFixedString\}

Впервые появилась в версии v1.1

Интерпретирует входное значение как строку фиксированной длины (при условии порядка байтов little endian).
Нулевые байты в конце игнорируются, например, для значения UInt32 255 функция возвращает строку из одного символа.

**Синтаксис**

```sql
reinterpretAsFixedString(x)
```

**Аргументы**

* `x` — Значение для переинтерпретации в строку. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime)

**Возвращаемое значение**

Фиксированная строка, содержащая байты, соответствующие `x`. [`FixedString`](/sql-reference/data-types/fixedstring)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    reinterpretAsFixedString(toDateTime('1970-01-01 01:01:05')),
    reinterpretAsFixedString(toDate('1970-03-07'))
```

```response title=Response
┌─reinterpretAsFixedString(toDateTime('1970-01-01 01:01:05'))─┬─reinterpretAsFixedString(toDate('1970-03-07'))─┐
│ A                                                           │ A                                              │
└─────────────────────────────────────────────────────────────┴────────────────────────────────────────────────┘
```


## reinterpretAsFloat32 \{#reinterpretAsFloat32\}

Была добавлена в версии: v1.1

Интерпретирует входное значение как значение типа Float32.
В отличие от [`CAST`](#CAST), функция не пытается сохранять исходное значение — если целевой тип не может представить значение исходного типа, результат является неопределённым.

**Синтаксис**

```sql
reinterpretAsFloat32(x)
```

**Аргументы**

* `x` — значение, которое нужно переинтерпретировать как Float32. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`UUID`](/sql-reference/data-types/uuid) или [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Возвращает значение `x` после переинтерпретации. [`Float32`](/sql-reference/data-types/float)

**Примеры**

**Пример использования**

```sql title=Query
SELECT reinterpretAsUInt32(toFloat32(0.2)) AS x, reinterpretAsFloat32(x)
```

```response title=Response
┌──────────x─┬─reinterpretAsFloat32(x)─┐
│ 1045220557 │                     0.2 │
└────────────┴─────────────────────────┘
```


## reinterpretAsFloat64 \{#reinterpretAsFloat64\}

Впервые представлена в версии: v1.1

Переинтерпретирует входное значение как значение типа Float64.
В отличие от [`CAST`](#CAST), функция не пытается сохранить исходное значение — если целевой тип не может представить входное значение, результат не определён.

**Синтаксис**

```sql
reinterpretAsFloat64(x)
```

**Аргументы**

* `x` — значение, интерпретируемое как Float64. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`UUID`](/sql-reference/data-types/uuid) или [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Возвращает значение `x` после переинтерпретации. [`Float64`](/sql-reference/data-types/float)

**Примеры**

**Пример использования**

```sql title=Query
SELECT reinterpretAsUInt64(toFloat64(0.2)) AS x, reinterpretAsFloat64(x)
```

```response title=Response
┌───────────────────x─┬─reinterpretAsFloat64(x)─┐
│ 4596373779694328218 │                     0.2 │
└─────────────────────┴─────────────────────────┘
```


## reinterpretAsInt128 \{#reinterpretAsInt128\}

Введена в версии: v1.1

Интерпретирует входное значение как значение типа Int128.
В отличие от [`CAST`](#CAST), функция не пытается сохранить исходное значение — если в целевом типе невозможно представить входное значение, результат не определён.

**Синтаксис**

```sql
reinterpretAsInt128(x)
```

**Аргументы**

* `x` — значение для интерпретации как Int128. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`UUID`](/sql-reference/data-types/uuid) или [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Возвращает значение `x`, интерпретированное как [`Int128`](/sql-reference/data-types/int-uint).

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt64(257) AS x,
    toTypeName(x),
    reinterpretAsInt128(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int64         │ 257 │ Int128          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt16 \{#reinterpretAsInt16\}

Введена в версии: v1.1

Интерпретирует входное значение как значение типа Int16.
В отличие от [`CAST`](#CAST), функция не пытается сохранить исходное значение — если целевой тип не может представить значение входного типа, результат не определён.

**Синтаксис**

```sql
reinterpretAsInt16(x)
```

**Аргументы**

* `x` — значение, которое нужно переинтерпретировать как тип данных Int16. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`UUID`](/sql-reference/data-types/uuid) или [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Возвращает значение `x`, переинтерпретированное как [`Int16`](/sql-reference/data-types/int-uint).

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt8(257) AS x,
    toTypeName(x),
    reinterpretAsInt16(x) AS res,
    toTypeName(res)
```

```response title=Response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ Int8          │   1 │ Int16           │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt256 \{#reinterpretAsInt256\}

Впервые добавлена в версии: v1.1

Переинтерпретирует входное значение как значение типа Int256.
В отличие от [`CAST`](#CAST), функция не пытается сохранить исходное значение — если целевой тип не может представить значение входного типа, результат не определён.

**Синтаксис**

```sql
reinterpretAsInt256(x)
```

**Аргументы**

* `x` — значение, которое нужно интерпретировать как Int256. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`UUID`](/sql-reference/data-types/uuid) или [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Возвращает значение `x`, интерпретированное как [`Int256`](/sql-reference/data-types/int-uint).

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt128(257) AS x,
    toTypeName(x),
    reinterpretAsInt256(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int128        │ 257 │ Int256          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt32 \{#reinterpretAsInt32\}

Введена в версии: v1.1

Интерпретирует входное значение как значение типа Int32.
В отличие от [`CAST`](#CAST), функция не пытается сохранить исходное значение — если целевой тип не может представить значение исходного типа, результат не определён.

**Синтаксис**

```sql
reinterpretAsInt32(x)
```

**Аргументы**

* `x` — значение, которое нужно переинтерпретировать как Int32. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`UUID`](/sql-reference/data-types/uuid) или [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Возвращает переинтерпретированное значение `x`. [`Int32`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt16(257) AS x,
    toTypeName(x),
    reinterpretAsInt32(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int16         │ 257 │ Int32           │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt64 \{#reinterpretAsInt64\}

Введена в версии: v1.1

Переинтерпретирует входное значение как значение типа Int64.
В отличие от [`CAST`](#CAST), функция не пытается сохранить исходное значение — если целевой тип не может представить значение входного типа, результат не определён.

**Синтаксис**

```sql
reinterpretAsInt64(x)
```

**Аргументы**

* `x` — Значение, которое следует трактовать как Int64. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`UUID`](/sql-reference/data-types/uuid) или [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Возвращает значение `x`, интерпретированное как тип [`Int64`](/sql-reference/data-types/int-uint).

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt32(257) AS x,
    toTypeName(x),
    reinterpretAsInt64(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int32         │ 257 │ Int64           │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt8 \{#reinterpretAsInt8\}

Введена в версии v1.1

Интерпретирует входное значение как значение типа Int8.
В отличие от [`CAST`](#CAST), функция не пытается сохранить исходное значение — если целевой тип не может представить входное значение, результат неопределён.

**Синтаксис**

```sql
reinterpretAsInt8(x)
```

**Аргументы**

* `x` — Значение для переинтерпретации в Int8. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`UUID`](/sql-reference/data-types/uuid) или [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Возвращает значение `x`, переинтерпретированное как [`Int8`](/sql-reference/data-types/int-uint).

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt8(257) AS x,
    toTypeName(x),
    reinterpretAsInt8(x) AS res,
    toTypeName(res)
```

```response title=Response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ UInt8         │   1 │ Int8            │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsString \{#reinterpretAsString\}

Введена в: v1.1

Переинтерпретирует входное значение как строку (предполагается порядок байт little-endian).
Нулевые байты в конце игнорируются, например, для значения UInt32, равного 255, функция возвращает строку с одним символом.

**Синтаксис**

```sql
reinterpretAsString(x)
```

**Аргументы**

* `x` — значение, которое нужно переинтерпретировать в строку. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime)

**Возвращаемое значение**

Строка, содержащая байты, представляющие значение `x`. [`String`](/sql-reference/data-types/string)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    reinterpretAsString(toDateTime('1970-01-01 01:01:05')),
    reinterpretAsString(toDate('1970-03-07'))
```

```response title=Response
┌─reinterpretAsString(toDateTime('1970-01-01 01:01:05'))─┬─reinterpretAsString(toDate('1970-03-07'))─┐
│ A                                                      │ A                                         │
└────────────────────────────────────────────────────────┴───────────────────────────────────────────┘
```


## reinterpretAsUInt128 \{#reinterpretAsUInt128\}

Введено в: v1.1

Интерпретирует входное значение как значение типа UInt128.
В отличие от [`CAST`](#CAST), функция не пытается сохранить исходное значение — если целевой тип не может представить входной тип, результат является неопределённым.

**Синтаксис**

```sql
reinterpretAsUInt128(x)
```

**Аргументы**

* `x` — Значение для переинтерпретации как UInt128. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`UUID`](/sql-reference/data-types/uuid) или [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Возвращает значение `x`, переинтерпретированное как [`UInt128`](/sql-reference/data-types/int-uint).

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt64(257) AS x,
    toTypeName(x),
    reinterpretAsUInt128(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt64        │ 257 │ UInt128         │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt16 \{#reinterpretAsUInt16\}

Добавлена в: v1.1

Переинтерпретирует входное значение как значение типа UInt16.
В отличие от [`CAST`](#CAST), функция не пытается сохранить исходное значение — если целевой тип не может представить входное значение, результат не определён.

**Синтаксис**

```sql
reinterpretAsUInt16(x)
```

**Аргументы**

* `x` — Значение, которое нужно переинтерпретировать как UInt16. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`UUID`](/sql-reference/data-types/uuid) или [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Возвращает значение `x` после переинтерпретации. [`UInt16`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt8(257) AS x,
    toTypeName(x),
    reinterpretAsUInt16(x) AS res,
    toTypeName(res)
```

```response title=Response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ UInt8         │   1 │ UInt16          │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt256 \{#reinterpretAsUInt256\}

Добавлена в версии: v1.1

Интерпретирует входное значение как значение типа UInt256.
В отличие от [`CAST`](#CAST), функция не пытается сохранить исходное значение — если целевой тип не может представить входное значение, результат не определен.

**Синтаксис**

```sql
reinterpretAsUInt256(x)
```

**Аргументы**

* `x` — значение, которое нужно переинтерпретировать как UInt256. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`UUID`](/sql-reference/data-types/uuid) или [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Возвращает переинтерпретированное значение `x` типа [`UInt256`](/sql-reference/data-types/int-uint).

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt128(257) AS x,
    toTypeName(x),
    reinterpretAsUInt256(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt128       │ 257 │ UInt256         │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt32 \{#reinterpretAsUInt32\}

Введена в: v1.1

Интерпретирует входное значение как значение типа UInt32.
В отличие от [`CAST`](#CAST), функция не пытается сохранить исходное значение — если целевой тип не может представить входное значение, результат не определён.

**Синтаксис**

```sql
reinterpretAsUInt32(x)
```

**Аргументы**

* `x` — значение, которое нужно переинтерпретировать как UInt32. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`UUID`](/sql-reference/data-types/uuid) или [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Возвращает значение `x` после переинтерпретации. [`UInt32`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt16(257) AS x,
    toTypeName(x),
    reinterpretAsUInt32(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt16        │ 257 │ UInt32          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt64 \{#reinterpretAsUInt64\}

Введена в версии: v1.1

Интерпретирует входное значение как значение типа UInt64.
В отличие от [`CAST`](#CAST), функция не пытается сохранить исходное значение — если целевой тип не может представить входное значение, результат не определён.

**Синтаксис**

```sql
reinterpretAsUInt64(x)
```

**Аргументы**

* `x` — значение, интерпретируемое как UInt64. [`Int*`](/sql-reference/data-types/int-uint) или [`UInt*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`UUID`](/sql-reference/data-types/uuid) или [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Возвращает значение `x`, интерпретированное как [`UInt64`](/sql-reference/data-types/int-uint).

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt32(257) AS x,
    toTypeName(x),
    reinterpretAsUInt64(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt32        │ 257 │ UInt64          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt8 \{#reinterpretAsUInt8\}

Введена в версии: v1.1

Переинтерпретирует входное значение как значение типа UInt8.
В отличие от [`CAST`](#CAST), функция не пытается сохранить исходное значение — если целевой тип не может представить значения входного типа, результат является неопределённым.

**Синтаксис**

```sql
reinterpretAsUInt8(x)
```

**Аргументы**

* `x` — значение, которое нужно переинтерпретировать как значение типа UInt8. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`UUID`](/sql-reference/data-types/uuid) или [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Возвращает `x`, переинтерпретированное как [`UInt8`](/sql-reference/data-types/int-uint).

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt8(-1) AS val,
    toTypeName(val),
    reinterpretAsUInt8(val) AS res,
    toTypeName(res);
```

```response title=Response
┌─val─┬─toTypeName(val)─┬─res─┬─toTypeName(res)─┐
│  -1 │ Int8            │ 255 │ UInt8           │
└─────┴─────────────────┴─────┴─────────────────┘
```


## reinterpretAsUUID \{#reinterpretAsUUID\}

Введена в версии: v1.1

Принимает строку из 16 байт и возвращает UUID, интерпретируя каждую 8-байтную половину в порядке байтов little-endian. Если строка короче, функция работает так, как будто строка дополнена в конец необходимым количеством нулевых байтов. Если строка длиннее 16 байт, лишние байты в конце игнорируются.

**Синтаксис**

```sql
reinterpretAsUUID(fixed_string)
```

**Аргументы**

* `fixed_string` — байтовая строка в формате big-endian. [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Значение типа UUID. [`UUID`](/sql-reference/data-types/uuid)

**Примеры**

**Строка в UUID**

```sql title=Query
SELECT reinterpretAsUUID(reverse(unhex('000102030405060708090a0b0c0d0e0f')))
```

```response title=Response
┌─reinterpretAsUUID(reverse(unhex('000102030405060708090a0b0c0d0e0f')))─┐
│                                  08090a0b-0c0d-0e0f-0001-020304050607 │
└───────────────────────────────────────────────────────────────────────┘
```


## toBFloat16 \{#toBFloat16\}

Добавлена в версии v1.1

Преобразует входное значение в значение типа BFloat16.
Выбрасывает исключение при ошибке.

См. также:

* [`toBFloat16OrZero`](#toBFloat16OrZero).
* [`toBFloat16OrNull`](#toBFloat16OrNull).

**Синтаксис**

```sql
toBFloat16(expr)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Возвращает 16-битное значение формата brain floating point. [`BFloat16`](/sql-reference/data-types/float)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
toBFloat16(toFloat32(42.7)),
toBFloat16(toFloat32('42.7')),
toBFloat16('42.7')
FORMAT Vertical;
```

```response title=Response
toBFloat16(toFloat32(42.7)): 42.5
toBFloat16(t⋯32('42.7')):    42.5
toBFloat16('42.7'):          42.5
```


## toBFloat16OrNull \{#toBFloat16OrNull\}

Введена в версии v1.1

Преобразует входное значение типа String в значение типа BFloat16.
Если строка не представляет собой число с плавающей запятой, функция возвращает NULL.

Поддерживаемые аргументы:

* Строковые представления числовых значений.

Неподдерживаемые аргументы (возвращают `NULL`):

* Строковые представления двоичных и шестнадцатеричных значений.
* Числовые значения.

:::note
Функция допускает незаметную потерю точности при преобразовании из строкового представления.
:::

См. также:

* [`toBFloat16`](#toBFloat16).
* [`toBFloat16OrZero`](#toBFloat16OrZero).

**Синтаксис**

```sql
toBFloat16OrNull(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает 16-битное значение формата BFloat16, иначе `NULL`. [`BFloat16`](/sql-reference/data-types/float) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toBFloat16OrNull('0x5E'), -- unsupported arguments
       toBFloat16OrNull('12.3'), -- typical use
       toBFloat16OrNull('12.3456789') -- silent loss of precision
```

```response title=Response
\N
12.25
12.3125
```


## toBFloat16OrZero \{#toBFloat16OrZero\}

Добавлена в: v1.1

Преобразует входное значение типа String в значение типа BFloat16.
Если строка не представляет собой число с плавающей запятой, функция возвращает ноль.

Поддерживаемые аргументы:

* Строковые представления числовых значений.

Неподдерживаемые аргументы (возвращают `0`):

* Строковые представления двоичных и шестнадцатеричных чисел.
* Числовые значения.

:::note
Функция допускает бесшумную потерю точности при преобразовании из строкового представления.
:::

См. также:

* [`toBFloat16`](#toBFloat16).
* [`toBFloat16OrNull`](#toBFloat16OrNull).

**Синтаксис**

```sql
toBFloat16OrZero(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает 16-битное значение типа brain floating point, иначе `0`. [`BFloat16`](/sql-reference/data-types/float)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toBFloat16OrZero('0x5E'), -- unsupported arguments
       toBFloat16OrZero('12.3'), -- typical use
       toBFloat16OrZero('12.3456789') -- silent loss of precision
```

```response title=Response
0
12.25
12.3125
```


## toBool \{#toBool\}

Введена в версии v22.2.

Преобразует входное значение в значение типа Bool.

**Синтаксис**

```sql
toBool(expr)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строку. Для строк принимает &#39;true&#39; или &#39;false&#39; (без учета регистра). [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`String`](/sql-reference/data-types/string) или [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Возвращает `true` или `false` на основе результата вычисления аргумента. [`Bool`](/sql-reference/data-types/boolean)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toBool(toUInt8(1)),
    toBool(toInt8(-1)),
    toBool(toFloat32(1.01)),
    toBool('true'),
    toBool('false'),
    toBool('FALSE')
FORMAT Vertical
```

```response title=Response
toBool(toUInt8(1)):      true
toBool(toInt8(-1)):      true
toBool(toFloat32(1.01)): true
toBool('true'):          true
toBool('false'):         false
toBool('FALSE'):         false
```


## toDate \{#toDate\}

Введена в версии: v1.1

Преобразует входное значение в тип [`Date`](/sql-reference/data-types/date).
Поддерживает преобразование из типов String, FixedString, DateTime или числовых типов.

**Синтаксис**

```sql
toDate(x)
```

**Аргументы**

* `x` — входное значение для преобразования. [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring) или [`DateTime`](/sql-reference/data-types/datetime) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)

**Возвращаемое значение**

Возвращает преобразованное значение. [`Date`](/sql-reference/data-types/date)

**Примеры**

**Преобразование значения типа String в Date**

```sql title=Query
SELECT toDate('2025-04-15')
```

```response title=Response
2025-04-15
```

**Преобразование из DateTime в Date**

```sql title=Query
SELECT toDate(toDateTime('2025-04-15 10:30:00'))
```

```response title=Response
2025-04-15
```

**Преобразование целого числа в дату (Date)**

```sql title=Query
SELECT toDate(20297)
```

```response title=Response
2025-07-28
```


## toDate32 \{#toDate32\}

Введена в версии: v21.9

Преобразует аргумент к типу данных [Date32](../data-types/date32.md).
Если значение выходит за пределы допустимого диапазона, `toDate32` возвращает граничные значения, поддерживаемые [Date32](../data-types/date32.md).
Если аргумент имеет тип [`Date`](../data-types/date.md), его границы также учитываются.

**Синтаксис**

```sql
toDate32(expr)
```

**Аргументы**

* `expr` — значение, которое нужно преобразовать. [`String`](/sql-reference/data-types/string) или [`UInt32`](/sql-reference/data-types/int-uint) или [`Date`](/sql-reference/data-types/date)

**Возвращаемое значение**

Возвращает календарную дату типа [`Date32`](/sql-reference/data-types/date32).

**Примеры**

**В пределах допустимого диапазона**

```sql title=Query
SELECT toDate32('2025-01-01') AS value, toTypeName(value)
FORMAT Vertical
```

```response title=Response
Row 1:
──────
value:           2025-01-01
toTypeName(value): Date32
```

**За пределами диапазона**

```sql title=Query
SELECT toDate32('1899-01-01') AS value, toTypeName(value)
FORMAT Vertical
```

```response title=Response
Row 1:
──────
value:           1900-01-01
toTypeName(value): Date32
```


## toDate32OrDefault \{#toDate32OrDefault\}

Введена в: v21.11

Преобразует аргумент к типу данных [Date32](../data-types/date32.md). Если значение выходит за допустимый диапазон, `toDate32OrDefault` возвращает нижнюю границу диапазона, поддерживаемого [Date32](../data-types/date32.md). Если аргумент имеет тип [Date](../data-types/date.md), дополнительно учитываются его границы диапазона. Возвращает значение по умолчанию, если получен некорректный аргумент.

**Синтаксис**

```sql
toDate32OrDefault(expr[, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `default` — необязательный параметр. Значение по умолчанию, которое возвращается, если разбор не удался. [`Date32`](/sql-reference/data-types/date32)

**Возвращаемое значение**

Значение типа Date32 при успешном преобразовании, в противном случае возвращается значение по умолчанию, если оно передано, или 1900-01-01, если нет. [`Date32`](/sql-reference/data-types/date32)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toDate32OrDefault('1930-01-01', toDate32('2020-01-01'))
```

```response title=Response
1930-01-01
```

**Ошибка преобразования**

```sql title=Query
SELECT toDate32OrDefault('xx1930-01-01', toDate32('2020-01-01'))
```

```response title=Response
2020-01-01
```


## toDate32OrNull \{#toDate32OrNull\}

Введена в: v21.9

Преобразует входное значение в тип Date32, но возвращает `NULL`, если передан недопустимый аргумент.
Аналогична [`toDate32`](#toDate32), но возвращает `NULL`, если передан недопустимый аргумент.

**Синтаксис**

```sql
toDate32OrNull(x)
```

**Аргументы**

* `x` — строковое представление даты. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа `Date32` при успешном выполнении, иначе `NULL`. [`Date32`](/sql-reference/data-types/date32) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDate32OrNull('2025-01-01'), toDate32OrNull('invalid')
```

```response title=Response
┌─toDate32OrNull('2025-01-01')─┬─toDate32OrNull('invalid')─┐
│                   2025-01-01 │                      ᴺᵁᴸᴸ │
└──────────────────────────────┴───────────────────────────┘
```


## toDate32OrZero \{#toDate32OrZero\}

Добавлена в версии: v21.9

Преобразует входное значение в значение типа [Date32](../data-types/date32.md), но возвращает нижнюю границу [Date32](../data-types/date32.md), если получен некорректный аргумент.
Аналогично [toDate32](#toDate32), но возвращает нижнюю границу [Date32](../data-types/date32.md), если получен некорректный аргумент.

См. также:

* [`toDate32`](#toDate32)
* [`toDate32OrNull`](#toDate32OrNull)
* [`toDate32OrDefault`](#toDate32OrDefault)

**Синтаксис**

```sql
toDate32OrZero(x)
```

**Аргументы**

* `x` — строковое представление даты. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа Date32 в случае успешного преобразования, в противном случае — нижнюю границу типа Date32 (`1900-01-01`). [`Date32`](/sql-reference/data-types/date32)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDate32OrZero('2025-01-01'), toDate32OrZero('')
```

```response title=Response
┌─toDate32OrZero('2025-01-01')─┬─toDate32OrZero('')─┐
│                   2025-01-01 │         1900-01-01 │
└──────────────────────────────┴────────────────────┘
```


## toDateOrDefault \{#toDateOrDefault\}

Введена в версии: v21.11

Аналог функции [toDate](#toDate), но при неуспешном преобразовании возвращает значение по умолчанию — либо второй аргумент (если указан), либо нижнюю границу диапазона типа [Date](../data-types/date.md).

**Синтаксис**

```sql
toDateOrDefault(expr[, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `default` — необязательный аргумент. Значение по умолчанию, которое возвращается при неудачной попытке разбора. [`Date`](/sql-reference/data-types/date)

**Возвращаемое значение**

Значение типа Date при успешном преобразовании, в противном случае — значение по умолчанию, если оно указано, или 1970-01-01, если не указано. [`Date`](/sql-reference/data-types/date)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toDateOrDefault('2022-12-30')
```

```response title=Response
2022-12-30
```

**Ошибка преобразования**

```sql title=Query
SELECT toDateOrDefault('', CAST('2023-01-01', 'Date'))
```

```response title=Response
2023-01-01
```


## toDateOrNull \{#toDateOrNull\}

Добавлено в версии: v1.1

Преобразует входное значение в значение типа `Date`, но возвращает `NULL`, если получен недопустимый аргумент.
То же, что и [`toDate`](#toDate), но возвращает `NULL`, если получен недопустимый аргумент.

**Синтаксис**

```sql
toDateOrNull(x)
```

**Аргументы**

* `x` — Строковое представление даты. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа Date, если преобразование прошло успешно, в противном случае — `NULL`. [`Date`](/sql-reference/data-types/date) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDateOrNull('2025-12-30'), toDateOrNull('invalid')
```

```response title=Response
┌─toDateOrNull('2025-12-30')─┬─toDateOrNull('invalid')─┐
│                 2025-12-30 │                   ᴺᵁᴸᴸ │
└────────────────────────────┴────────────────────────┘
```


## toDateOrZero \{#toDateOrZero\}

Введена в: v1.1

Преобразует входное значение в значение типа [`Date`](../data-types/date.md), но возвращает нижнюю границу [`Date`](../data-types/date.md), если получен некорректный аргумент.
То же самое, что и [toDate](#toDate), но возвращает нижнюю границу [`Date`](../data-types/date.md), если получен некорректный аргумент.

См. также:

* [`toDate`](#toDate)
* [`toDateOrNull`](#toDateOrNull)
* [`toDateOrDefault`](#toDateOrDefault)

**Синтаксис**

```sql
toDateOrZero(x)
```

**Аргументы**

* `x` — Строковое представление даты. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа Date при успешном преобразовании, в противном случае — нижнюю границу типа Date (`1970-01-01`). [`Date`](/sql-reference/data-types/date)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDateOrZero('2025-12-30'), toDateOrZero('')
```

```response title=Response
┌─toDateOrZero('2025-12-30')─┬─toDateOrZero('')─┐
│                 2025-12-30 │       1970-01-01 │
└────────────────────────────┴──────────────────┘
```


## toDateTime \{#toDateTime\}

Введён в версии: v1.1

Преобразует входное значение к типу [DateTime](../data-types/datetime.md).

:::note
Если `expr` — число, оно интерпретируется как количество секунд с начала эпохи Unix (как отметка времени Unix).
Если `expr` — [String](../data-types/string.md), оно может быть интерпретировано как отметка времени Unix или как строковое представление даты / даты и времени.
Таким образом, разбор коротких строковых представлений чисел (до 4 цифр) явно отключён из-за неоднозначности: например, строка `'1999'` может быть как годом (неполным строковым представлением Date / DateTime), так и отметкой времени Unix. Более длинные числовые строки разрешены.
:::

**Синтаксис**

```sql
toDateTime(expr[, time_zone])
```

**Аргументы**

* `expr` — значение. [`String`](/sql-reference/data-types/string) или [`Int`](/sql-reference/data-types/int-uint) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime)
* `time_zone` — часовой пояс. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает дату и время. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDateTime('2025-01-01 00:00:00'), toDateTime(1735689600, 'UTC')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toDateTime('2025-01-01 00:00:00'): 2025-01-01 00:00:00
toDateTime(1735689600, 'UTC'):     2025-01-01 00:00:00
```


## toDateTime32 \{#toDateTime32\}

Введена в: v20.9

Преобразует входное значение в тип `DateTime`.
Поддерживает преобразование из `String`, `FixedString`, `Date`, `Date32`, `DateTime` или числовых типов (`(U)Int*`, `Float*`, `Decimal`).
`DateTime32` обеспечивает расширенный диапазон по сравнению с `DateTime`, поддерживая даты от `1900-01-01` до `2299-12-31`.

**Синтаксис**

```sql
toDateTime32(x[, timezone])
```

**Аргументы**

* `x` — Входное значение, которое требуется преобразовать. [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring) или [`UInt*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime) или [`DateTime64`](/sql-reference/data-types/datetime64)
* `timezone` — Необязательный параметр. Часовой пояс для возвращаемого значения `DateTime`. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает преобразованное значение. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Значение находится в допустимом диапазоне**

```sql title=Query
SELECT toDateTime64('2025-01-01 00:00:00.000', 3) AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64('20255-01-01 00:00:00.000', 3))─┐
│ 2025-01-01 00:00:00.000 │ DateTime64(3)                                          │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

**Как десятичное число с заданной точностью**

```sql title=Query
SELECT toDateTime64(1735689600.000, 3) AS value, toTypeName(value);
-- without the decimal point the value is still treated as Unix Timestamp in seconds
SELECT toDateTime64(1546300800000, 3) AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64(1735689600.000, 3))─┐
│ 2025-01-01 00:00:00.000 │ DateTime64(3)                            │
└─────────────────────────┴──────────────────────────────────────────┘
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800000, 3))─┐
│ 2282-12-31 00:00:00.000 │ DateTime64(3)                              │
└─────────────────────────┴────────────────────────────────────────────┘
```

**С указанием часового пояса**

```sql title=Query
SELECT toDateTime64('2025-01-01 00:00:00', 3, 'Asia/Istanbul') AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64('2025-01-01 00:00:00', 3, 'Asia/Istanbul'))─┐
│ 2025-01-01 00:00:00.000 │ DateTime64(3, 'Asia/Istanbul')                                      │
└─────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```


## toDateTime64 \{#toDateTime64\}

Добавлено в версии: v20.1

Преобразует переданное значение в значение типа [`DateTime64`](../data-types/datetime64.md).

**Синтаксис**

```sql
toDateTime64(expr, scale[, timezone])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)
* `scale` — шаг тика (точность): 10^(-scale) секунд. [`UInt8`](/sql-reference/data-types/int-uint)
* `timezone` — необязательный параметр. Часовой пояс для указанного объекта `DateTime64`. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает календарную дату и время суток с точностью до долей секунды. [`DateTime64`](/sql-reference/data-types/datetime64)

**Примеры**

**Значение находится в допустимом диапазоне**

```sql title=Query
SELECT toDateTime64('2025-01-01 00:00:00.000', 3) AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64('2025-01-01 00:00:00.000', 3))─┐
│ 2025-01-01 00:00:00.000 │ DateTime64(3)                                          │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

**В десятичное число с заданной точностью**

```sql title=Query
SELECT toDateTime64(1546300800.000, 3) AS value, toTypeName(value);
-- Without the decimal point the value is still treated as Unix Timestamp in seconds
SELECT toDateTime64(1546300800000, 3) AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800000, 3))─┐
│ 2282-12-31 00:00:00.000 │ DateTime64(3)                              │
└─────────────────────────┴────────────────────────────────────────────┘
```

**С часовым поясом**

```sql title=Query
SELECT toDateTime64('2025-01-01 00:00:00', 3, 'Asia/Istanbul') AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64('2025-01-01 00:00:00', 3, 'Asia/Istanbul'))─┐
│ 2025-01-01 00:00:00.000 │ DateTime64(3, 'Asia/Istanbul')                                      │
└─────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```


## toDateTime64OrDefault \{#toDateTime64OrDefault\}

Введена в версии: v21.11

Как и [toDateTime64](#toDateTime64), эта функция преобразует входное значение в значение типа [DateTime64](../data-types/datetime64.md),
но возвращает либо значение по умолчанию для [DateTime64](../data-types/datetime64.md),
либо указанное значение по умолчанию, если передан некорректный аргумент.

**Синтаксис**

```sql
toDateTime64OrDefault(expr, scale[, timezone, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `scale` — размер тика (точность): 10^-precision секунды. [`UInt8`](/sql-reference/data-types/int-uint)
* `timezone` — необязательный параметр. Часовой пояс. [`String`](/sql-reference/data-types/string)
* `default` — необязательный параметр. Значение по умолчанию, возвращаемое при неудачной попытке разбора. [`DateTime64`](/sql-reference/data-types/datetime64)

**Возвращаемое значение**

Значение типа DateTime64 при успешном преобразовании; в противном случае возвращает значение по умолчанию, если оно указано, или 1970-01-01 00:00:00.000, если нет. [`DateTime64`](/sql-reference/data-types/datetime64)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toDateTime64OrDefault('1976-10-18 00:00:00.30', 3)
```

```response title=Response
1976-10-18 00:00:00.300
```

**Ошибка преобразования**

```sql title=Query
SELECT toDateTime64OrDefault('1976-10-18 00:00:00 30', 3, 'UTC', toDateTime64('2001-01-01 00:00:00.00',3))
```

```response title=Response
2000-12-31 23:00:00.000
```


## toDateTime64OrNull \{#toDateTime64OrNull\}

Появилась в версии: v20.1

Преобразует входное значение в значение типа `DateTime64`, но возвращает `NULL`, если получен некорректный аргумент.
Аналогична функции `toDateTime64`, но возвращает `NULL`, если получен некорректный аргумент.

**Синтаксис**

```sql
toDateTime64OrNull(x)
```

**Аргументы**

* `x` — Строковое представление даты и времени с точностью до долей секунды. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа DateTime64 при успешном преобразовании, иначе — `NULL`. [`DateTime64`](/sql-reference/data-types/datetime64) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDateTime64OrNull('2025-12-30 13:44:17.123'), toDateTime64OrNull('invalid')
```

```response title=Response
┌─toDateTime64OrNull('2025-12-30 13:44:17.123')─┬─toDateTime64OrNull('invalid')─┐
│                         2025-12-30 13:44:17.123 │                          ᴺᵁᴸᴸ │
└─────────────────────────────────────────────────┴───────────────────────────────┘
```


## toDateTime64OrZero \{#toDateTime64OrZero\}

Введена в: v20.1

Преобразует входное значение в значение типа [DateTime64](../data-types/datetime64.md), но возвращает нижнюю границу диапазона значений [DateTime64](../data-types/datetime64.md), если получен некорректный аргумент.
Аналогична [toDateTime64](#toDateTime64), но возвращает нижнюю границу диапазона значений [DateTime64](../data-types/datetime64.md), если получен некорректный аргумент.

См. также:

* [toDateTime64](#toDateTime64).
* [toDateTime64OrNull](#toDateTime64OrNull).
* [toDateTime64OrDefault](#toDateTime64OrDefault).

**Синтаксис**

```sql
toDateTime64OrZero(x)
```

**Аргументы**

* `x` — Строковое представление даты со временем и субсекундной точностью. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа DateTime64 в случае успешного преобразования, в противном случае — нижнюю границу типа DateTime64 (`1970-01-01 00:00:00.000`). [`DateTime64`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDateTime64OrZero('2025-12-30 13:44:17.123'), toDateTime64OrZero('invalid')
```

```response title=Response
┌─toDateTime64OrZero('2025-12-30 13:44:17.123')─┬─toDateTime64OrZero('invalid')─┐
│                         2025-12-30 13:44:17.123 │             1970-01-01 00:00:00.000 │
└─────────────────────────────────────────────────┴─────────────────────────────────────┘
```


## toDateTimeOrDefault \{#toDateTimeOrDefault\}

Добавлена в: v21.11

Аналогична [toDateTime](#toDateTime), но при неуспешном преобразовании возвращает значение по умолчанию: либо третий аргумент (если он указан), либо нижнюю границу [DateTime](../data-types/datetime.md).

**Синтаксис**

```sql
toDateTimeOrDefault(expr[, timezone, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `timezone` — необязательный аргумент. Часовой пояс. [`String`](/sql-reference/data-types/string)
* `default` — необязательный аргумент. Значение по умолчанию, возвращаемое при неуспешном разборе. [`DateTime`](/sql-reference/data-types/datetime)

**Возвращаемое значение**

Значение типа DateTime при успешном разборе; в противном случае возвращается значение по умолчанию, если оно передано, или 1970-01-01 00:00:00, если нет. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toDateTimeOrDefault('2022-12-30 13:44:17')
```

```response title=Response
2022-12-30 13:44:17
```

**Ошибка преобразования**

```sql title=Query
SELECT toDateTimeOrDefault('', 'UTC', CAST('2023-01-01', 'DateTime(\'UTC\')'))
```

```response title=Response
2023-01-01 00:00:00
```


## toDateTimeOrNull \{#toDateTimeOrNull\}

Добавлена в версии: v1.1

Преобразует входное значение в значение типа `DateTime`, но возвращает `NULL`, если получен некорректный аргумент.
Аналогична [`toDateTime`](#toDateTime), но возвращает `NULL`, если получен некорректный аргумент.

**Синтаксис**

```sql
toDateTimeOrNull(x)
```

**Аргументы**

* `x` — строковое представление даты и времени. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа `DateTime` в случае успеха, иначе `NULL`. [`DateTime`](/sql-reference/data-types/datetime) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDateTimeOrNull('2025-12-30 13:44:17'), toDateTimeOrNull('invalid')
```

```response title=Response
┌─toDateTimeOrNull('2025-12-30 13:44:17')─┬─toDateTimeOrNull('invalid')─┐
│                     2025-12-30 13:44:17 │                        ᴺᵁᴸᴸ │
└─────────────────────────────────────────┴─────────────────────────────┘
```


## toDateTimeOrZero \{#toDateTimeOrZero\}

Появилась в версии: v1.1

Преобразует входное значение к типу [DateTime](../data-types/datetime.md), но возвращает нижнюю границу [DateTime](../data-types/datetime.md), если получен некорректный аргумент.
То же, что и [toDateTime](#toDateTime), но возвращает нижнюю границу [DateTime](../data-types/datetime.md), если получен некорректный аргумент.

**Синтаксис**

```sql
toDateTimeOrZero(x)
```

**Аргументы**

* `x` — строковое представление даты и времени. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа DateTime при успешном выполнении, в противном случае — нижнюю границу DateTime (`1970-01-01 00:00:00`). [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDateTimeOrZero('2025-12-30 13:44:17'), toDateTimeOrZero('invalid')
```

```response title=Response
┌─toDateTimeOrZero('2025-12-30 13:44:17')─┬─toDateTimeOrZero('invalid')─┐
│                     2025-12-30 13:44:17 │         1970-01-01 00:00:00 │
└─────────────────────────────────────────┴─────────────────────────────┘
```


## toDecimal128 \{#toDecimal128\}

Добавлено в: v18.12

Преобразует входное значение в значение типа [`Decimal(38, S)`](../data-types/decimal.md) с масштабом `S`.
В случае ошибки выбрасывает исключение.

Поддерживаемые аргументы:

* Значения или строковые представления типов (U)Int*.
* Значения или строковые представления типов Float*.

Неподдерживаемые аргументы:

* Значения или строковые представления значений Float* `NaN` и `Inf` (без учета регистра).
* Строковые представления двоичных и шестнадцатеричных значений, например: `SELECT toDecimal128('0xc0fe', 1);`.

:::note
Переполнение может произойти, если значение `expr` выходит за пределы `Decimal128`:`(-1*10^(38 - S), 1*10^(38 - S))`.
Избыточные цифры в дробной части отбрасываются (не округляются).
Избыточные цифры в целой части приводят к исключению.
:::

:::warning
При преобразованиях лишние цифры отбрасываются, и результат может быть неожиданным при работе со входными значениями Float32/Float64, так как операции выполняются с использованием инструкций с плавающей запятой.
Например: `toDecimal128(1.15, 2)` равно `1.14`, потому что 1.15 * 100 в формате с плавающей запятой равно 114.99.
Вы можете использовать входной параметр типа String, чтобы операции выполнялись над базовым целочисленным типом: `toDecimal128('1.15', 2) = 1.15`
:::

**Синтаксис**

```sql
toDecimal128(expr, S)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — параметр масштаба от 0 до 38, определяющий, сколько цифр может содержать дробная часть числа. [`UInt8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение типа `Decimal(38, S)` [`Decimal128(S)`](/sql-reference/data-types/decimal)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toDecimal128(99, 1) AS a, toTypeName(a) AS type_a,
    toDecimal128(99.67, 2) AS b, toTypeName(b) AS type_b,
    toDecimal128('99.67', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical
```

```response title=Response
Row 1:
──────
a:      99
type_a: Decimal(38, 1)
b:      99.67
type_b: Decimal(38, 2)
c:      99.67
type_c: Decimal(38, 3)
```


## toDecimal128OrDefault \{#toDecimal128OrDefault\}

Впервые появилась в версии: v21.11

Подобно функции [`toDecimal128`](#toDecimal128), эта функция преобразует входное значение в значение типа [Decimal(38, S)](../data-types/decimal.md), но в случае ошибки возвращает значение по умолчанию.

**Синтаксис**

```sql
toDecimal128OrDefault(expr, S[, default])
```

**Аргументы**

* `expr` — строковое представление числа. [`String`](/sql-reference/data-types/string)
* `S` — параметр масштаба от 0 до 38, определяющий, сколько цифр может иметь дробная часть числа. [`UInt8`](/sql-reference/data-types/int-uint)
* `default` — необязательный параметр. Значение по умолчанию, которое возвращается, если преобразование к типу Decimal128(S) завершилось неудачно. [`Decimal128(S)`](/sql-reference/data-types/decimal)

**Возвращаемое значение**

Значение типа Decimal(38, S) при успешном преобразовании, в противном случае возвращается значение по умолчанию, если оно задано, или 0, если нет. [`Decimal128(S)`](/sql-reference/data-types/decimal)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toDecimal128OrDefault(toString(1/42), 18)
```

```response title=Response
0.023809523809523808
```

**Ошибка преобразования**

```sql title=Query
SELECT toDecimal128OrDefault('Inf', 0, CAST('-1', 'Decimal128(0)'))
```

```response title=Response
-1
```


## toDecimal128OrNull \{#toDecimal128OrNull\}

Введена в версии: v20.1

Преобразует входное значение в значение типа [`Decimal(38, S)`](../data-types/decimal.md), но в случае ошибки возвращает `NULL`.
Аналог [`toDecimal128`](#toDecimal128), но возвращает `NULL` вместо генерации исключения при ошибках преобразования.

Поддерживаемые аргументы:

* Значения или строковые представления типа (U)Int*.
* Значения или строковые представления типа Float*.

Неподдерживаемые аргументы (возвращают `NULL`):

* Значения или строковые представления значений Float* `NaN` и `Inf` (без учета регистра).
* Строковые представления двоичных и шестнадцатеричных значений.
* Значения, выходящие за пределы диапазона `Decimal128`: `(-1*10^(38 - S), 1*10^(38 - S))`.

См. также:

* [`toDecimal128`](#toDecimal128).
* [`toDecimal128OrZero`](#toDecimal128OrZero).
* [`toDecimal128OrDefault`](#toDecimal128OrDefault).

**Синтаксис**

```sql
toDecimal128OrNull(expr, S)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — параметр масштаба от 0 до 38, задающий, сколько цифр может иметь дробная часть числа. [`UInt8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение типа Decimal(38, S) при успешном выполнении, в противном случае — `NULL`. [`Decimal128(S)`](/sql-reference/data-types/decimal) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDecimal128OrNull('42.7', 2), toDecimal128OrNull('invalid', 2)
```

```response title=Response
┌─toDecimal128OrNull('42.7', 2)─┬─toDecimal128OrNull('invalid', 2)─┐
│                         42.70 │                             ᴺᵁᴸᴸ │
└───────────────────────────────┴──────────────────────────────────┘
```


## toDecimal128OrZero \{#toDecimal128OrZero\}

Введена в версии: v20.1

Преобразует входное значение в значение типа [Decimal(38, S)](../data-types/decimal.md), но возвращает `0` в случае ошибки.
Аналог [`toDecimal128`](#toDecimal128), но возвращает `0` вместо генерации исключения при ошибках преобразования.

Поддерживаемые аргументы:

* Значения или строковые представления типа (U)Int*.
* Значения или строковые представления типа Float*.

Неподдерживаемые аргументы (возвращают `0`):

* Значения или строковые представления значений Float* `NaN` и `Inf` (без учета регистра).
* Строковые представления двоичных и шестнадцатеричных чисел.

:::note
Если входное значение выходит за пределы `Decimal128`:`(-1*10^(38 - S), 1*10^(38 - S))`, функция возвращает `0`.
:::

**Синтаксис**

```sql
toDecimal128OrZero(expr, S)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — параметр масштаба в диапазоне от 0 до 38, определяющий, сколько цифр может иметь дробная часть числа. [`UInt8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение типа Decimal(38, S) при успешном выполнении, в противном случае — `0`. [`Decimal128(S)`](/sql-reference/data-types/decimal)

**Примеры**

**Базовое использование**

```sql title=Query
SELECT toDecimal128OrZero('42.7', 2), toDecimal128OrZero('invalid', 2)
```

```response title=Response
┌─toDecimal128OrZero('42.7', 2)─┬─toDecimal128OrZero('invalid', 2)─┐
│                         42.70 │                             0.00 │
└───────────────────────────────┴──────────────────────────────────┘
```


## toDecimal256 \{#toDecimal256\}

Введена в: v20.8

Преобразует входное значение в значение типа [`Decimal(76, S)`](../data-types/decimal.md) с масштабом `S`. В случае ошибки выбрасывает исключение.

Поддерживаемые аргументы:

* Значения или строковые представления типов (U)Int*.
* Значения или строковые представления типов Float*.

Неподдерживаемые аргументы:

* Значения или строковые представления значений типа Float* `NaN` и `Inf` (регистронезависимо).
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toDecimal256('0xc0fe', 1);`.

:::note
Переполнение может произойти, если значение `expr` выходит за пределы `Decimal256`:`(-1*10^(76 - S), 1*10^(76 - S))`.
Лишние цифры в дробной части отбрасываются (без округления).
Лишние цифры в целой части приводят к исключению.
:::

:::warning
При преобразованиях лишние цифры отбрасываются, и поведение может быть неожиданным при работе с входными значениями Float32/Float64, так как операции выполняются с использованием инструкций с плавающей запятой.
Например: `toDecimal256(1.15, 2)` равно `1.14`, потому что 1.15 * 100 в формате с плавающей запятой равно 114.99.
Вы можете использовать строковый ввод, чтобы операции выполнялись над целочисленным типом: `toDecimal256('1.15', 2) = 1.15`
:::

**Синтаксис**

```sql
toDecimal256(expr, S)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — параметр масштаба от 0 до 76, определяющий, сколько цифр может быть в дробной части числа. [`UInt8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение типа `Decimal(76, S)`. [`Decimal256(S)`](/sql-reference/data-types/decimal)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toDecimal256(99, 1) AS a, toTypeName(a) AS type_a,
    toDecimal256(99.67, 2) AS b, toTypeName(b) AS type_b,
    toDecimal256('99.67', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical
```

```response title=Response
Row 1:
──────
a:      99
type_a: Decimal(76, 1)
b:      99.67
type_b: Decimal(76, 2)
c:      99.67
type_c: Decimal(76, 3)
```


## toDecimal256OrDefault \{#toDecimal256OrDefault\}

Введена в версии: v21.11

Аналогично функции [`toDecimal256`](#toDecimal256), эта функция преобразует входное значение в значение типа [Decimal(76, S)](../data-types/decimal.md), но в случае ошибки возвращает значение по умолчанию.

**Синтаксис**

```sql
toDecimal256OrDefault(expr, S[, default])
```

**Аргументы**

* `expr` — строковое представление числа. [`String`](/sql-reference/data-types/string)
* `S` — параметр масштаба от 0 до 76, определяющий, сколько цифр может иметь дробная часть числа. [`UInt8`](/sql-reference/data-types/int-uint)
* `default` — необязательный параметр. Значение по умолчанию, которое возвращается, если преобразование к типу Decimal256(S) не удалось. [`Decimal256(S)`](/sql-reference/data-types/decimal)

**Возвращаемое значение**

Значение типа Decimal(76, S) при успешном преобразовании, в противном случае возвращается значение по умолчанию, если оно задано, или 0, если нет. [`Decimal256(S)`](/sql-reference/data-types/decimal)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toDecimal256OrDefault(toString(1/42), 76)
```

```response title=Response
0.023809523809523808
```

**Ошибка преобразования**

```sql title=Query
SELECT toDecimal256OrDefault('Inf', 0, CAST('-1', 'Decimal256(0)'))
```

```response title=Response
-1
```


## toDecimal256OrNull \{#toDecimal256OrNull\}

Введена в версии v20.8

Преобразует входное значение в значение типа [`Decimal(76, S)`](../data-types/decimal.md), но возвращает `NULL` в случае ошибки.
Аналог функции [`toDecimal256`](#toDecimal256), но возвращает `NULL` вместо генерации исключения при ошибках преобразования.

Поддерживаемые аргументы:

* Значения или строковые представления типов (U)Int*.
* Значения или строковые представления типов Float*.

Неподдерживаемые аргументы (возвращают `NULL`):

* Значения или строковые представления значений Float* `NaN` и `Inf` (без учёта регистра).
* Строковые представления двоичных и шестнадцатеричных значений.
* Значения, выходящие за границы `Decimal256`: `(-1 * 10^(76 - S), 1 * 10^(76 - S))`.

См. также:

* [`toDecimal256`](#toDecimal256).
* [`toDecimal256OrZero`](#toDecimal256OrZero).
* [`toDecimal256OrDefault`](#toDecimal256OrDefault).

**Синтаксис**

```sql
toDecimal256OrNull(expr, S)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числового значения. [`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — параметр масштаба от 0 до 76, определяющий, сколько цифр может содержать дробная часть числа. [`UInt8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение Decimal(76, S), если операция завершилась успешно, в противном случае возвращает `NULL`. [`Decimal256(S)`](/sql-reference/data-types/decimal) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDecimal256OrNull('42.7', 2), toDecimal256OrNull('invalid', 2)
```

```response title=Response
┌─toDecimal256OrNull('42.7', 2)─┬─toDecimal256OrNull('invalid', 2)─┐
│                         42.70 │                             ᴺᵁᴸᴸ │
└───────────────────────────────┴──────────────────────────────────┘
```


## toDecimal256OrZero \{#toDecimal256OrZero\}

Введена в версии v20.8

Преобразует входное значение к типу [Decimal(76, S)](../data-types/decimal.md), но возвращает `0` в случае ошибки.
Аналог [`toDecimal256`](#toDecimal256), но возвращает `0` вместо генерации исключения при ошибках преобразования.

Поддерживаемые аргументы:

* Значения или строковые представления типа (U)Int*.
* Значения или строковые представления типа Float*.

Неподдерживаемые аргументы (возвращают `0`):

* Значения или строковые представления значений Float* `NaN` и `Inf` (без учёта регистра).
* Строковые представления двоичных и шестнадцатеричных значений.

:::note
Если входное значение выходит за границы `Decimal256`:`(-1*10^(76 - S), 1*10^(76 - S))`, функция возвращает `0`.
:::

См. также:

* [`toDecimal256`](#toDecimal256).
* [`toDecimal256OrNull`](#toDecimal256OrNull).
* [`toDecimal256OrDefault`](#toDecimal256OrDefault).

**Синтаксис**

```sql
toDecimal256OrZero(expr, S)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — параметр масштаба от 0 до 76, определяющий, сколько знаков после запятой может иметь дробная часть числа. [`UInt8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение Decimal(76, S) в случае успеха, иначе `0`. [`Decimal256(S)`](/sql-reference/data-types/decimal)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDecimal256OrZero('42.7', 2), toDecimal256OrZero('invalid', 2)
```

```response title=Response
┌─toDecimal256OrZero('42.7', 2)─┬─toDecimal256OrZero('invalid', 2)─┐
│                         42.70 │                             0.00 │
└───────────────────────────────┴──────────────────────────────────┘
```


## toDecimal32 \{#toDecimal32\}

Введена в: v18.12

Преобразует входное значение в значение типа [`Decimal(9, S)`](../data-types/decimal.md) с масштабом `S`. В случае ошибки генерирует исключение.

Поддерживаемые аргументы:

* Значения или строковые представления целочисленных типов (U)Int*.
* Значения или строковые представления типов Float*.

Неподдерживаемые аргументы:

* Значения или строковые представления значений Float* `NaN` и `Inf` (без учета регистра).
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toDecimal32('0xc0fe', 1);`.

:::note
Может произойти переполнение, если значение `expr` выходит за пределы `Decimal32`:`(-1*10^(9 - S), 1*10^(9 - S))`.
Лишние цифры в дробной части отбрасываются (не округляются).
Лишние цифры в целой части приводят к исключению.
:::

:::warning
При преобразовании лишние цифры отбрасываются, и поведение может оказаться неожиданным при работе со значениями Float32/Float64 на входе, так как операции выполняются с использованием инструкций с плавающей запятой.
Например: `toDecimal32(1.15, 2)` равно `1.14`, потому что 1.15 * 100 в формате с плавающей запятой равно 114.99.
Вы можете использовать строковое значение на входе, чтобы операции выполнялись над целочисленным типом: `toDecimal32('1.15', 2) = 1.15`
:::

**Синтаксис**

```sql
toDecimal32(expr, S)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — параметр масштаба от 0 до 9, определяющий количество цифр в дробной части числа. [`UInt8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение типа `Decimal(9, S)` [`Decimal32(S)`](/sql-reference/data-types/decimal)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toDecimal32(2, 1) AS a, toTypeName(a) AS type_a,
    toDecimal32(4.2, 2) AS b, toTypeName(b) AS type_b,
    toDecimal32('4.2', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical
```

```response title=Response
Row 1:
──────
a:      2
type_a: Decimal(9, 1)
b:      4.2
type_b: Decimal(9, 2)
c:      4.2
type_c: Decimal(9, 3)
```


## toDecimal32OrDefault \{#toDecimal32OrDefault\}

Появилась в версии: v21.11

Аналогично функции [`toDecimal32`](#toDecimal32), эта функция преобразует входное значение в значение типа [Decimal(9, S)](../data-types/decimal.md), но в случае ошибки возвращает значение по умолчанию.

**Синтаксис**

```sql
toDecimal32OrDefault(expr, S[, default])
```

**Аргументы**

* `expr` — строковое представление числа. [`String`](/sql-reference/data-types/string)
* `S` — параметр масштаба от 0 до 9, определяющий, сколько цифр может иметь дробная часть числа. [`UInt8`](/sql-reference/data-types/int-uint)
* `default` — необязательный аргумент. Значение по умолчанию, которое возвращается, если преобразование к типу Decimal32(S) не удалось. [`Decimal32(S)`](/sql-reference/data-types/decimal)

**Возвращаемое значение**

Значение типа Decimal(9, S) при успешном преобразовании, в противном случае — значение по умолчанию, если оно передано, или 0, если нет. [`Decimal32(S)`](/sql-reference/data-types/decimal)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toDecimal32OrDefault(toString(0.0001), 5)
```

```response title=Response
0.0001
```

**Ошибка преобразования**

```sql title=Query
SELECT toDecimal32OrDefault('Inf', 0, CAST('-1', 'Decimal32(0)'))
```

```response title=Response
-1
```


## toDecimal32OrNull \{#toDecimal32OrNull\}

Функция появилась в: v20.1

Преобразует входное значение в значение типа [`Decimal(9, S)`](../data-types/decimal.md), но в случае ошибки возвращает `NULL`.
Аналог функции [`toDecimal32`](#toDecimal32), но вместо генерации исключения при ошибках преобразования возвращает `NULL`.

Поддерживаемые аргументы:

* Значения или строковые представления типов (U)Int*.
* Значения или строковые представления типов Float*.

Неподдерживаемые аргументы (возвращается `NULL`):

* Значения или строковые представления значений Float* `NaN` и `Inf` (без учета регистра символов).
* Строковые представления двоичных и шестнадцатеричных значений.
* Значения, выходящие за допустимые пределы `Decimal32`:`(-1*10^(9 - S), 1*10^(9 - S))`.

См. также:

* [`toDecimal32`](#toDecimal32).
* [`toDecimal32OrZero`](#toDecimal32OrZero).
* [`toDecimal32OrDefault`](#toDecimal32OrDefault).

**Синтаксис**

```sql
toDecimal32OrNull(expr, S)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — параметр масштаба от 0 до 9, задающий, сколько цифр может иметь дробная часть числа. [`UInt8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение Decimal(9, S) при успешном выполнении, в противном случае — `NULL`. [`Decimal32(S)`](/sql-reference/data-types/decimal) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDecimal32OrNull('42.7', 2), toDecimal32OrNull('invalid', 2)
```

```response title=Response
┌─toDecimal32OrNull('42.7', 2)─┬─toDecimal32OrNull('invalid', 2)─┐
│                        42.70 │                            ᴺᵁᴸᴸ │
└──────────────────────────────┴─────────────────────────────────┘
```


## toDecimal32OrZero \{#toDecimal32OrZero\}

Появилась в версии v20.1

Преобразует входное значение в значение типа [Decimal(9, S)](../data-types/decimal.md), но в случае ошибки возвращает `0`.
Аналог [`toDecimal32`](#toDecimal32), но возвращает `0` вместо генерации исключения при ошибках преобразования.

Поддерживаемые аргументы:

* Значения или строковые представления типа (U)Int*.
* Значения или строковые представления типа Float*.

Неподдерживаемые аргументы (возвращают `0`):

* Значения или строковые представления значений Float* `NaN` и `Inf` (без учета регистра).
* Строковые представления двоичных и шестнадцатеричных значений.

:::note
Если входное значение выходит за пределы диапазона `Decimal32`:`(-1*10^(9 - S), 1*10^(9 - S))`, функция возвращает `0`.
:::

**Синтаксис**

```sql
toDecimal32OrZero(expr, S)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — параметр масштаба от 0 до 9, задающий, сколько цифр может содержать дробная часть числа. [`UInt8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение Decimal(9, S) при успешном выполнении, в противном случае — `0`. [`Decimal32(S)`](/sql-reference/data-types/decimal)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDecimal32OrZero('42.7', 2), toDecimal32OrZero('invalid', 2)
```

```response title=Response
┌─toDecimal32OrZero('42.7', 2)─┬─toDecimal32OrZero('invalid', 2)─┐
│                        42.70 │                            0.00 │
└──────────────────────────────┴─────────────────────────────────┘
```


## toDecimal64 \{#toDecimal64\}

Добавлена в версии v18.12

Преобразует входное значение в значение типа [`Decimal(18, S)`](../data-types/decimal.md) с масштабом `S`.
В случае ошибки выбрасывает исключение.

Поддерживаемые аргументы:

* Значения или строковые представления типов (U)Int*.
* Значения или строковые представления типов Float*.

Неподдерживаемые аргументы:

* Значения или строковые представления значений Float* `NaN` и `Inf` (регистр не учитывается).
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toDecimal64('0xc0fe', 1);`.

:::note
Может произойти переполнение, если значение `expr` выходит за пределы `Decimal64`:`(-1*10^(18 - S), 1*10^(18 - S))`.
Избыточные цифры в дробной части отбрасываются (без округления).
Избыточные цифры в целой части приведут к исключению.
:::

:::warning
При преобразованиях лишние цифры отбрасываются, и возможна неожиданная работа со значениями типов Float32/Float64, поскольку операции выполняются с использованием инструкций с плавающей запятой.
Например: `toDecimal64(1.15, 2)` равно `1.14`, потому что 1.15 * 100 в формате с плавающей запятой даёт 114.99.
Вы можете использовать строковый аргумент, чтобы операции выполнялись над целочисленным типом: `toDecimal64('1.15', 2) = 1.15`
:::

**Синтаксис**

```sql
toDecimal64(expr, S)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — параметр масштаба от 0 до 18, определяющий, сколько цифр может иметь дробная часть числа. [`UInt8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает десятичное значение. [`Decimal(18, S)`](/sql-reference/data-types/decimal)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toDecimal64(2, 1) AS a, toTypeName(a) AS type_a,
    toDecimal64(4.2, 2) AS b, toTypeName(b) AS type_b,
    toDecimal64('4.2', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical
```

```response title=Response
Row 1:
──────
a:      2.0
type_a: Decimal(18, 1)
b:      4.20
type_b: Decimal(18, 2)
c:      4.200
type_c: Decimal(18, 3)
```


## toDecimal64OrDefault \{#toDecimal64OrDefault\}

Добавлена в версии v21.11

Подобно функции [`toDecimal64`](#toDecimal64), эта функция преобразует входное значение в значение типа [Decimal(18, S)](../data-types/decimal.md), но в случае ошибки возвращает значение по умолчанию.

**Синтаксис**

```sql
toDecimal64OrDefault(expr, S[, default])
```

**Аргументы**

* `expr` — Строковое представление числа. [`String`](/sql-reference/data-types/string)
* `S` — Параметр масштаба от 0 до 18, определяющий количество знаков в дробной части числа. [`UInt8`](/sql-reference/data-types/int-uint)
* `default` — Необязательный параметр. Значение по умолчанию, возвращаемое при неудачном разборе строки в тип Decimal64(S). [`Decimal64(S)`](/sql-reference/data-types/decimal)

**Возвращаемое значение**

Значение типа Decimal(18, S) при успешном преобразовании, в противном случае — значение по умолчанию, если оно передано, или 0, если нет. [`Decimal64(S)`](/sql-reference/data-types/decimal)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toDecimal64OrDefault(toString(0.0001), 18)
```

```response title=Response
0.0001
```

**Ошибка преобразования**

```sql title=Query
SELECT toDecimal64OrDefault('Inf', 0, CAST('-1', 'Decimal64(0)'))
```

```response title=Response
-1
```


## toDecimal64OrNull \{#toDecimal64OrNull\}

Введена в версии: v20.1

Преобразует входное значение в значение типа [Decimal(18, S)](../data-types/decimal.md), но в случае ошибки возвращает `NULL`.
Аналогична функции [`toDecimal64`](#toDecimal64), но возвращает `NULL` вместо генерации исключения при ошибках преобразования.

Поддерживаемые аргументы:

* Значения или строковые представления типов (U)Int*.
* Значения или строковые представления типов Float*.

Неподдерживаемые аргументы (возвращают `NULL`):

* Значения или строковые представления значений Float* `NaN` и `Inf` (без учёта регистра).
* Строковые представления двоичных и шестнадцатеричных значений.
* Значения, выходящие за пределы `Decimal64`:`(-1*10^(18 - S), 1*10^(18 - S))`.

См. также:

* [`toDecimal64`](#toDecimal64).
* [`toDecimal64OrZero`](#toDecimal64OrZero).
* [`toDecimal64OrDefault`](#toDecimal64OrDefault).

**Синтаксис**

```sql
toDecimal64OrNull(expr, S)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — параметр масштаба от 0 до 18, определяющий, сколько цифр может иметь дробная часть числа. [`UInt8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение Decimal(18, S) при успешном выполнении, иначе `NULL`. [`Decimal64(S)`](/sql-reference/data-types/decimal) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDecimal64OrNull('42.7', 2), toDecimal64OrNull('invalid', 2)
```

```response title=Response
┌─toDecimal64OrNull('42.7', 2)─┬─toDecimal64OrNull('invalid', 2)─┐
│                        42.70 │                            ᴺᵁᴸᴸ │
└──────────────────────────────┴─────────────────────────────────┘
```


## toDecimal64OrZero \{#toDecimal64OrZero\}

Добавлена в: v20.1

Преобразует входное значение в значение типа [Decimal(18, S)](../data-types/decimal.md), но возвращает `0` в случае ошибки.
Аналог [`toDecimal64`](#toDecimal64), но возвращает `0` вместо генерации исключения при ошибках преобразования.

Поддерживаемые аргументы:

* Значения или строковые представления типа (U)Int*.
* Значения или строковые представления типа Float*.

Неподдерживаемые аргументы (возвращают `0`):

* Значения или строковые представления значений Float* `NaN` и `Inf` (без учёта регистра).
* Строковые представления двоичных и шестнадцатеричных значений.

:::note
Если входное значение выходит за границы `Decimal64`:`(-1*10^(18 - S), 1*10^(18 - S))`, функция возвращает `0`.
:::

См. также:

* [`toDecimal64`](#toDecimal64).
* [`toDecimal64OrNull`](#toDecimal64OrNull).
* [`toDecimal64OrDefault`](#toDecimal64OrDefault).

**Синтаксис**

```sql
toDecimal64OrZero(expr, S)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — параметр масштаба от 0 до 18, определяющий, сколько цифр может иметь дробная часть числа. [`UInt8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение Decimal(18, S) при успешном выполнении, иначе — `0`. [`Decimal64(S)`](/sql-reference/data-types/decimal)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDecimal64OrZero('42.7', 2), toDecimal64OrZero('invalid', 2)
```

```response title=Response
┌─toDecimal64OrZero('42.7', 2)─┬─toDecimal64OrZero('invalid', 2)─┐
│                        42.70 │                            0.00 │
└──────────────────────────────┴─────────────────────────────────┘
```


## toDecimalString \{#toDecimalString\}

Введена в версии v23.3

Преобразует числовое значение в String с указанным количеством знаков после запятой.

Функция округляет входное значение до заданного количества знаков после запятой. Если входное значение содержит меньше
дробных знаков, чем запрошено, результат дополняется нулями, чтобы получить ровно указанное количество дробных знаков.

**Синтаксис**

```sql
toDecimalString(number, scale)
```

**Аргументы**

* `number` — Числовое значение, которое нужно преобразовать в строку. Может быть любого числового типа (Int, UInt, Float, Decimal). [`Int8`](/sql-reference/data-types/int-uint) или [`Int16`](/sql-reference/data-types/int-uint) или [`Int32`](/sql-reference/data-types/int-uint) или [`Int64`](/sql-reference/data-types/int-uint) или [`UInt8`](/sql-reference/data-types/int-uint) или [`UInt16`](/sql-reference/data-types/int-uint) или [`UInt32`](/sql-reference/data-types/int-uint) или [`UInt64`](/sql-reference/data-types/int-uint) или [`Float32`](/sql-reference/data-types/float) или [`Float64`](/sql-reference/data-types/float) или [`Decimal`](/sql-reference/data-types/decimal)
* `scale` — Количество знаков после запятой. При необходимости результат будет округлён. [`UInt8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает строковое представление числа с ровно указанным количеством знаков после запятой. [`String`](/sql-reference/data-types/string)

**Примеры**

**Округление и форматирование числа**

```sql title=Query
SELECT toDecimalString(2.1456, 2)
```

```response title=Response
┌─toDecimalString(2.1456, 2)─┐
│ 2.15                       │
└────────────────────────────┘
```

**Заполнение нулями**

```sql title=Query
SELECT toDecimalString(5, 3)
```

```response title=Response
┌─toDecimalString(5, 3)─┐
│ 5.000                 │
└───────────────────────┘
```

**Различные числовые типы**

```sql title=Query
SELECT toDecimalString(CAST(123.456 AS Decimal(10,3)), 2) AS decimal_val,
       toDecimalString(CAST(42.7 AS Float32), 4) AS float_val
```

```response title=Response
┌─decimal_val─┬─float_val─┐
│ 123.46      │ 42.7000   │
└─────────────┴───────────┘
```


## toFixedString \{#toFixedString\}

Добавлено в версию v1.1

Преобразует аргумент типа [`String`](/sql-reference/data-types/string) в тип [`FixedString(N)`](/sql-reference/data-types/fixedstring) (строка фиксированной длины N).

Если строка содержит меньше байт, чем N, она дополняется нулевыми байтами справа.
Если строка содержит больше байт, чем N, выбрасывается исключение.

**Синтаксис**

```sql
toFixedString(s, N)
```

**Аргументы**

* `s` — строка, которую нужно преобразовать. [`String`](/sql-reference/data-types/string)
* `N` — длина результирующего FixedString. [`const UInt*`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает FixedString длиной N. [`FixedString(N)`](/sql-reference/data-types/fixedstring)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toFixedString('foo', 8) AS s;
```

```response title=Response
┌─s─────────────┐
│ foo\0\0\0\0\0 │
└───────────────┘
```


## toFloat32 \{#toFloat32\}

Появилась в версии: v1.1

Преобразует входное значение в значение типа [Float32](/sql-reference/data-types/float).
Генерирует исключение в случае ошибки.

Поддерживаемые аргументы:

* Значения типа (U)Int*.
* Строковые представления (U)Int8/16/32/128/256.
* Значения типа Float*, включая `NaN` и `Inf`.
* Строковые представления Float*, включая `NaN` и `Inf` (без учета регистра).

Неподдерживаемые аргументы:

* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toFloat32('0xc0fe');`.

См. также:

* [`toFloat32OrZero`](#toFloat32OrZero).
* [`toFloat32OrNull`](#toFloat32OrNull).
* [`toFloat32OrDefault`](#toFloat32OrDefault).

**Синтаксис**

```sql
toFloat32(expr)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Возвращает 32-битное число с плавающей запятой. [`Float32`](/sql-reference/data-types/float)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toFloat32(42.7),
    toFloat32('42.7'),
    toFloat32('NaN')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat32(42.7):   42.7
toFloat32('42.7'): 42.7
toFloat32('NaN'):  nan
```


## toFloat32OrDefault \{#toFloat32OrDefault\}

Добавлена в версии: v21.11

Подобно функции [`toFloat32`](#toFloat32), эта функция преобразует входное значение в значение типа [Float32](../data-types/float.md), но в случае ошибки возвращает значение по умолчанию.
Если значение `default` не передано, то в случае ошибки возвращается `0`.

**Синтаксис**

```sql
toFloat32OrDefault(expr[, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `default` — необязательный аргумент. Значение по умолчанию, которое возвращается, если разбор не удался. [`Float32`](/sql-reference/data-types/float)

**Возвращаемое значение**

Возвращает значение типа [`Float32`](/sql-reference/data-types/float) при успешном разборе, в противном случае — значение по умолчанию, если оно передано, или 0, если не передано.

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toFloat32OrDefault('8', CAST('0', 'Float32'))
```

```response title=Response
8
```

**Ошибка преобразования**

```sql title=Query
SELECT toFloat32OrDefault('abc', CAST('0', 'Float32'))
```

```response title=Response
0
```


## toFloat32OrNull \{#toFloat32OrNull\}

Введена в версии v1.1

Преобразует входное значение в значение типа [Float32](../data-types/float.md), но в случае ошибки возвращает `NULL`.
Аналог [`toFloat32`](#toFloat32), но возвращает `NULL` вместо генерации исключения при ошибках преобразования.

Поддерживаемые аргументы:

* Значения типов (U)Int*.
* Строковые представления типов (U)Int8/16/32/128/256.
* Значения типов Float*, включая `NaN` и `Inf`.
* Строковые представления типов Float*, включая `NaN` и `Inf` (без учета регистра).

Неподдерживаемые аргументы (возвращают `NULL`):

* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toFloat32OrNull('0xc0fe');`.
* Неверные строковые форматы.

См. также:

* [`toFloat32`](#toFloat32).
* [`toFloat32OrZero`](#toFloat32OrZero).
* [`toFloat32OrDefault`](#toFloat32OrDefault).

**Синтаксис**

```sql
toFloat32OrNull(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает 32-битное значение с плавающей запятой при успешном выполнении, иначе `NULL`. [`Float32`](/sql-reference/data-types/float) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toFloat32OrNull('42.7'),
    toFloat32OrNull('NaN'),
    toFloat32OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat32OrNull('42.7'): 42.7
toFloat32OrNull('NaN'):  nan
toFloat32OrNull('abc'):  \N
```


## toFloat32OrZero \{#toFloat32OrZero\}

Добавлена в версии: v1.1

Преобразует входное значение в значение типа [Float32](../data-types/float.md), но возвращает `0` в случае ошибки.
Аналог функции [`toFloat32`](#toFloat32), но возвращает `0` вместо генерации исключения при ошибках преобразования.

См. также:

* [`toFloat32`](#toFloat32).
* [`toFloat32OrNull`](#toFloat32OrNull).
* [`toFloat32OrDefault`](#toFloat32OrDefault).

**Синтаксис**

```sql
toFloat32OrZero(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает 32-битное число с плавающей запятой, иначе — `0`. [`Float32`](/sql-reference/data-types/float)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toFloat32OrZero('42.7'),
    toFloat32OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat32OrZero('42.7'): 42.7
toFloat32OrZero('abc'):  0
```


## toFloat64 \{#toFloat64\}

Введена в версии v1.1

Преобразует входное значение в значение типа [`Float64`](../data-types/float.md).
Выбрасывает исключение в случае ошибки.

Поддерживаемые аргументы:

* Значения типов (U)Int*.
* Строковые представления (U)Int8/16/32/128/256.
* Значения типов Float*, включая `NaN` и `Inf`.
* Строковые представления типов Float*, включая `NaN` и `Inf` (регистр не имеет значения).

Неподдерживаемые аргументы:

* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toFloat64('0xc0fe');`.

См. также:

* [`toFloat64OrZero`](#toFloat64OrZero).
* [`toFloat64OrNull`](#toFloat64OrNull).
* [`toFloat64OrDefault`](#toFloat64OrDefault).

**Синтаксис**

```sql
toFloat64(expr)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Возвращает 64-битное число с плавающей запятой. [`Float64`](/sql-reference/data-types/float)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toFloat64(42.7),
    toFloat64('42.7'),
    toFloat64('NaN')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat64(42.7):   42.7
toFloat64('42.7'): 42.7
toFloat64('NaN'):  nan
```


## toFloat64OrDefault \{#toFloat64OrDefault\}

Добавлено в: v21.11

Аналогично [`toFloat64`](#toFloat64), эта функция преобразует входное значение в значение типа [Float64](../data-types/float.md), но в случае ошибки возвращает значение по умолчанию.
Если значение параметра `default` не передано, то в случае ошибки возвращается `0`.

**Синтаксис**

```sql
toFloat64OrDefault(expr[, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `default` — необязательный параметр. Значение по умолчанию, возвращаемое при неудачном разборе. [`Float64`](/sql-reference/data-types/float)

**Возвращаемое значение**

Возвращает значение типа Float64 при успешном разборе, в противном случае возвращает значение по умолчанию, если оно передано, или 0, если не передано. [`Float64`](/sql-reference/data-types/float)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toFloat64OrDefault('8', CAST('0', 'Float64'))
```

```response title=Response
8
```

**Ошибка преобразования**

```sql title=Query
SELECT toFloat64OrDefault('abc', CAST('0', 'Float64'))
```

```response title=Response
0
```


## toFloat64OrNull \{#toFloat64OrNull\}

Введена в версии: v1.1

Преобразует входное значение к типу [Float64](../data-types/float.md), но возвращает `NULL` в случае ошибки.
Аналог [`toFloat64`](#toFloat64), но возвращает `NULL` вместо выбрасывания исключения при ошибках преобразования.

Поддерживаемые аргументы:

* Значения типа (U)Int*.
* Строковые представления (U)Int8/16/32/128/256.
* Значения типа Float*, включая `NaN` и `Inf`.
* Строковые представления значений типа Float*, включая `NaN` и `Inf` (без учета регистра).

Неподдерживаемые аргументы (возвращают `NULL`):

* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toFloat64OrNull('0xc0fe');`.
* Неверные строковые форматы.

См. также:

* [`toFloat64`](#toFloat64).
* [`toFloat64OrZero`](#toFloat64OrZero).
* [`toFloat64OrDefault`](#toFloat64OrDefault).

**Синтаксис**

```sql
toFloat64OrNull(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает 64-битное значение с плавающей запятой при успешном выполнении, в противном случае — `NULL`. [`Float64`](/sql-reference/data-types/float) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toFloat64OrNull('42.7'),
    toFloat64OrNull('NaN'),
    toFloat64OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat64OrNull('42.7'): 42.7
toFloat64OrNull('NaN'):  nan
toFloat64OrNull('abc'):  \N
```


## toFloat64OrZero \{#toFloat64OrZero\}

Добавлена в версии v1.1

Преобразует входное значение к типу [Float64](../data-types/float.md), но при ошибке возвращает `0`.
Аналог функции [`toFloat64`](#toFloat64), но возвращает `0` вместо генерации исключения при ошибках преобразования.

См. также:

* [`toFloat64`](#toFloat64).
* [`toFloat64OrNull`](#toFloat64OrNull).
* [`toFloat64OrDefault`](#toFloat64OrDefault).

**Синтаксис**

```sql
toFloat64OrZero(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает 64-битовое число с плавающей запятой при успешном выполнении, в противном случае `0`. [`Float64`](/sql-reference/data-types/float)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toFloat64OrZero('42.7'),
    toFloat64OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat64OrZero('42.7'): 42.7
toFloat64OrZero('abc'):  0
```


## toInt128 \{#toInt128\}

Введена в версии: v1.1

Преобразует входное значение в значение типа [Int128](/sql-reference/data-types/int-uint).
Генерирует исключение в случае ошибки.
Функция использует округление к нулю, то есть отбрасывает дробную часть чисел.

Поддерживаемые аргументы:

* Значения или строковые представления типа (U)Int*.
* Значения типа Float*.

Неподдерживаемые аргументы:

* Строковые представления значений типа Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toInt128('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона Int128, результат переполняется или выходит за нижнюю границу диапазона.
Это не считается ошибкой.
:::

См. также:

* [`toInt128OrZero`](#toInt128OrZero).
* [`toInt128OrNull`](#toInt128OrNull).
* [`toInt128OrDefault`](#toInt128OrDefault).

**Синтаксис**

```sql
toInt128(expr)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Возвращает 128-битное целое число. [`Int128`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt128(-128),
    toInt128(-128.8),
    toInt128('-128')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt128(-128):   -128
toInt128(-128.8): -128
toInt128('-128'): -128
```


## toInt128OrDefault \{#toInt128OrDefault\}

Введена в версии: v21.11

Подобно функции [`toInt128`](#toInt128), эта функция преобразует входное значение в значение типа [Int128](../data-types/int-uint.md), но в случае ошибки возвращает значение по умолчанию.
Если значение `default` не передано, в случае ошибки возвращается `0`.

**Синтаксис**

```sql
toInt128OrDefault(expr[, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `default` — необязательный аргумент. Значение по умолчанию, возвращаемое при неудачном разборе. [`Int128`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение типа Int128 при успешном разборе; в противном случае возвращает значение по умолчанию, если оно было передано, или 0, если нет. [`Int128`](/sql-reference/data-types/int-uint)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toInt128OrDefault('-128', CAST('-1', 'Int128'))
```

```response title=Response
-128
```

**Ошибка преобразования**

```sql title=Query
SELECT toInt128OrDefault('abc', CAST('-1', 'Int128'))
```

```response title=Response
-1
```


## toInt128OrNull \{#toInt128OrNull\}

Добавлено в v20.8

Как и [`toInt128`](#toInt128), эта функция преобразует входное значение в значение типа [Int128](../data-types/int-uint.md), но в случае ошибки возвращает `NULL`.

Поддерживаемые аргументы:

* Строковые представления типов (U)Int*.

Неподдерживаемые аргументы (возвращают `NULL`):

* Строковые представления значений типов Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toInt128OrNull('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [Int128](../data-types/int-uint.md), происходит переполнение или выход результата за нижнюю границу диапазона.
Это не считается ошибкой.
:::

См. также:

* [`toInt128`](#toInt128).
* [`toInt128OrZero`](#toInt128OrZero).
* [`toInt128OrDefault`](#toInt128OrDefault).

**Синтаксис**

```sql
toInt128OrNull(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа Int128, иначе `NULL`, если преобразование не удалось. [`Int128`](/sql-reference/data-types/int-uint) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt128OrNull('-128'),
    toInt128OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt128OrNull('-128'): -128
toInt128OrNull('abc'):  \N
```


## toInt128OrZero \{#toInt128OrZero\}

Представлена в: v20.8

Преобразует входное значение к типу [Int128](/sql-reference/data-types/int-uint), но возвращает `0` в случае ошибки.
Аналог [`toInt128`](#toInt128), но возвращает `0` вместо выброса исключения.

См. также:

* [`toInt128`](#toInt128).
* [`toInt128OrNull`](#toInt128OrNull).
* [`toInt128OrDefault`](#toInt128OrDefault).

**Синтаксис**

```sql
toInt128OrZero(x)
```

**Аргументы**

* `x` — входное значение, которое нужно преобразовать. [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring) или [`Float*`](/sql-reference/data-types/float) или [`Decimal`](/sql-reference/data-types/decimal) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime)

**Возвращаемое значение**

Возвращает преобразованное входное значение, в противном случае — `0`, если преобразование не удалось. [`Int128`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toInt128OrZero('123')
```

```response title=Response
123
```

**При ошибке преобразования возвращается ноль**

```sql title=Query
SELECT toInt128OrZero('abc')
```

```response title=Response
0
```


## toInt16 \{#toInt16\}

Введена в версии: v1.1

Преобразует входное значение в значение типа [`Int16`](../data-types/int-uint.md).
Вызывает исключение в случае ошибки.

Поддерживаемые аргументы:

* Значения или строковые представления типа (U)Int*.
* Значения типа Float*.

Неподдерживаемые аргументы:

* Строковые представления значений Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toInt16('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [Int16](../data-types/int-uint.md), происходит переполнение или выход результата за нижнюю границу диапазона.
Это не считается ошибкой.
Например: `SELECT toInt16(32768) == -32768;`.
:::

:::note
Функция использует [округление к нулю](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), то есть отбрасывает дробную часть чисел.
:::

См. также:

* [`toInt16OrZero`](#toInt16OrZero).
* [`toInt16OrNull`](#toInt16OrNull).
* [`toInt16OrDefault`](#toInt16OrDefault).

**Синтаксис**

```sql
toInt16(expr)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Возвращает 16-битное целое число. [`Int16`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt16(-16),
    toInt16(-16.16),
    toInt16('-16')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt16(-16):    -16
toInt16(-16.16): -16
toInt16('-16'):  -16
```


## toInt16OrDefault \{#toInt16OrDefault\}

Добавлена в: v21.11

Как и функция [`toInt16`](#toInt16), эта функция преобразует входное значение в значение типа [Int16](../data-types/int-uint.md), но в случае ошибки возвращает значение по умолчанию.
Если значение `default` не передано, то в случае ошибки возвращается `0`.

**Синтаксис**

```sql
toInt16OrDefault(expr[, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `default` — необязательный параметр. Значение по умолчанию, которое возвращается при неудачной попытке преобразования. [`Int16`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение типа Int16 при успешном преобразовании, в противном случае возвращает значение по умолчанию, если оно передано, или 0, если нет. [`Int16`](/sql-reference/data-types/int-uint)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toInt16OrDefault('-16', CAST('-1', 'Int16'))
```

```response title=Response
-16
```

**Неудачное преобразование**

```sql title=Query
SELECT toInt16OrDefault('abc', CAST('-1', 'Int16'))
```

```response title=Response
-1
```


## toInt16OrNull \{#toInt16OrNull\}

Введена в версии: v1.1

Подобно функции [`toInt16`](#toInt16), эта функция преобразует входное значение в значение типа [Int16](../data-types/int-uint.md), но в случае ошибки возвращает `NULL`.

Поддерживаемые аргументы:

* Строковые представления значений типов (U)Int*.

Неподдерживаемые аргументы (возвращают `NULL`):

* Строковые представления значений типов Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например: `SELECT toInt16OrNull('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [Int16](../data-types/int-uint.md), происходит переполнение или выход результата за нижнюю границу (underflow).
Это не считается ошибкой.
:::

См. также:

* [`toInt16`](#toInt16).
* [`toInt16OrZero`](#toInt16OrZero).
* [`toInt16OrDefault`](#toInt16OrDefault).

**Синтаксис**

```sql
toInt16OrNull(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа `Int16`, в противном случае — `NULL`, если преобразование не удалось. [`Int16`](/sql-reference/data-types/int-uint) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt16OrNull('-16'),
    toInt16OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt16OrNull('-16'): -16
toInt16OrNull('abc'): \N
```


## toInt16OrZero \{#toInt16OrZero\}

Впервые представлена в: v1.1

Как и [`toInt16`](#toInt16), эта функция преобразует входное значение в значение типа [Int16](../data-types/int-uint.md), но в случае ошибки возвращает `0`.

Поддерживаемые аргументы:

* Строковые представления целых типов (U)Int*.

Неподдерживаемые аргументы (возвращают `0`):

* Строковые представления значений типов Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toInt16OrZero('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [Int16](../data-types/int-uint.md), происходит переполнение или потеря значимости результата.
Это не считается ошибкой.
:::

См. также:

* [`toInt16`](#toInt16).
* [`toInt16OrNull`](#toInt16OrNull).
* [`toInt16OrDefault`](#toInt16OrDefault).

**Синтаксис**

```sql
toInt16OrZero(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа Int16, а в случае неуспешного преобразования — `0`. [`Int16`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt16OrZero('16'),
    toInt16OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt16OrZero('16'): 16
toInt16OrZero('abc'): 0
```


## toInt256 \{#toInt256\}

Введена в версии: v1.1

Преобразует входное значение в значение типа [Int256](/sql-reference/data-types/int-uint).
Вызывает исключение в случае ошибки.
Функция использует округление к нулю, то есть отбрасывает дробную часть числа.

Поддерживаемые аргументы:

* Значения или строковые представления типа (U)Int*.
* Значения типа Float*.

Неподдерживаемые аргументы:

* Строковые представления значений Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toInt256('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона Int256, происходит переполнение результата сверху или снизу.
Это не считается ошибкой.
:::

См. также:

* [`toInt256OrZero`](#toInt256OrZero).
* [`toInt256OrNull`](#toInt256OrNull).
* [`toInt256OrDefault`](#toInt256OrDefault).

**Синтаксис**

```sql
toInt256(expr)
```

**Аргументы**

* `expr` — выражение, результатом которого является число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Возвращает целое число с разрядностью 256 бит. [`Int256`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt256(-256),
    toInt256(-256.256),
    toInt256('-256')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt256(-256):     -256
toInt256(-256.256): -256
toInt256('-256'):   -256
```


## toInt256OrDefault \{#toInt256OrDefault\}

Введена в версии v21.11

Аналогично [`toInt256`](#toInt256), эта функция преобразует входное значение в значение типа [Int256](../data-types/int-uint.md), но возвращает значение по умолчанию в случае ошибки.
Если параметр `default` не указан, то в случае ошибки возвращается `0`.

**Синтаксис**

```sql
toInt256OrDefault(expr[, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `default` — необязательный параметр. Значение по умолчанию, возвращаемое в случае неуспешного парсинга. [`Int256`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение типа Int256 в случае успешного преобразования; в противном случае возвращает значение по умолчанию, если оно задано, или 0, если нет. [`Int256`](/sql-reference/data-types/int-uint)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toInt256OrDefault('-256', CAST('-1', 'Int256'))
```

```response title=Response
-256
```

**Ошибка преобразования**

```sql title=Query
SELECT toInt256OrDefault('abc', CAST('-1', 'Int256'))
```

```response title=Response
-1
```


## toInt256OrNull \{#toInt256OrNull\}

Добавлена в: v20.8

Как и [`toInt256`](#toInt256), эта функция преобразует входное значение в значение типа [Int256](../data-types/int-uint.md), но возвращает `NULL` в случае ошибки.

Поддерживаемые аргументы:

* Строковые представления целочисленных типов (U)Int*.

Неподдерживаемые аргументы (возвращают `NULL`):

* Строковые представления значений Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например, `SELECT toInt256OrNull('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [Int256](../data-types/int-uint.md), происходит переполнение или выход результата за пределы допустимого диапазона.
Это не считается ошибкой.
:::

См. также:

* [`toInt256`](#toInt256).
* [`toInt256OrZero`](#toInt256OrZero).
* [`toInt256OrDefault`](#toInt256OrDefault).

**Синтаксис**

```sql
toInt256OrNull(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа Int256, в противном случае `NULL`, если преобразование не удалось. [`Int256`](/sql-reference/data-types/int-uint) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt256OrNull('-256'),
    toInt256OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt256OrNull('-256'): -256
toInt256OrNull('abc'):  \N
```


## toInt256OrZero \{#toInt256OrZero\}

Добавлена в: v20.8

Преобразует входное значение к типу [Int256](/sql-reference/data-types/int-uint), но возвращает `0` в случае ошибки.
Аналог функции [`toInt256`](#toInt256), но возвращает `0` вместо выброса исключения.

См. также:

* [`toInt256`](#toInt256).
* [`toInt256OrNull`](#toInt256OrNull).
* [`toInt256OrDefault`](#toInt256OrDefault).

**Синтаксис**

```sql
toInt256OrZero(x)
```

**Аргументы**

* `x` — входное значение для преобразования. [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring) или [`Float*`](/sql-reference/data-types/float) или [`Decimal`](/sql-reference/data-types/decimal) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime)

**Возвращаемое значение**

Возвращает преобразованное входное значение, в противном случае `0`, если преобразование невозможно. [`Int256`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toInt256OrZero('123')
```

```response title=Response
123
```

**При ошибке преобразования возвращается ноль**

```sql title=Query
SELECT toInt256OrZero('abc')
```

```response title=Response
0
```


## toInt32 \{#toInt32\}

Появилась в версии: v1.1

Преобразует входное значение в значение типа [`Int32`](../data-types/int-uint.md).
Выбрасывает исключение в случае ошибки.

Поддерживаемые аргументы:

* Значения или строковые представления типов (U)Int*.
* Значения типа Float*.

Неподдерживаемые аргументы:

* Строковые представления значений Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toInt32('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона типа [Int32](../data-types/int-uint.md), происходит переполнение или выход за нижнюю границу диапазона.
Это не считается ошибкой.
Например: `SELECT toInt32(2147483648) == -2147483648;`
:::

:::note
Функция использует [округление к нулю](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), то есть отбрасывает дробную часть чисел.
:::

См. также:

* [`toInt32OrZero`](#toInt32OrZero).
* [`toInt32OrNull`](#toInt32OrNull).
* [`toInt32OrDefault`](#toInt32OrDefault).

**Синтаксис**

```sql
toInt32(expr)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Возвращает 32-битное целочисленное значение. [`Int32`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt32(-32),
    toInt32(-32.32),
    toInt32('-32')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt32(-32):    -32
toInt32(-32.32): -32
toInt32('-32'):  -32
```


## toInt32OrDefault \{#toInt32OrDefault\}

Введена в: v21.11

Подобно [`toInt32`](#toInt32), эта функция преобразует входное значение в значение типа [Int32](../data-types/int-uint.md), но в случае ошибки возвращает значение по умолчанию.
Если значение `default` не передано, в случае ошибки возвращается `0`.

**Синтаксис**

```sql
toInt32OrDefault(expr[, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `default` — необязательный параметр. Значение по умолчанию, возвращаемое при неудачном преобразовании. [`Int32`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение типа Int32 при успешном преобразовании, иначе — значение по умолчанию, если оно задано, или 0, если нет. [`Int32`](/sql-reference/data-types/int-uint)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toInt32OrDefault('-32', CAST('-1', 'Int32'))
```

```response title=Response
-32
```

**Ошибка преобразования**

```sql title=Query
SELECT toInt32OrDefault('abc', CAST('-1', 'Int32'))
```

```response title=Response
-1
```


## toInt32OrNull \{#toInt32OrNull\}

Добавлено в: v1.1

Аналогично функции [`toInt32`](#toInt32), эта функция преобразует входное значение в значение типа [Int32](../data-types/int-uint.md), но возвращает `NULL` в случае ошибки.

Поддерживаемые аргументы:

* Строковые представления (U)Int*.

Неподдерживаемые аргументы (возвращают `NULL`):

* Строковые представления значений Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toInt32OrNull('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [Int32](../data-types/int-uint.md), происходит переполнение или выход результата за нижнюю границу диапазона.
Это не считается ошибкой.
:::

См. также:

* [`toInt32`](#toInt32).
* [`toInt32OrZero`](#toInt32OrZero).
* [`toInt32OrDefault`](#toInt32OrDefault).

**Синтаксис**

```sql
toInt32OrNull(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа Int32, в противном случае `NULL`, если преобразование не удалось. [`Int32`](/sql-reference/data-types/int-uint) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt32OrNull('-32'),
    toInt32OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt32OrNull('-32'): -32
toInt32OrNull('abc'): \N
```


## toInt32OrZero \{#toInt32OrZero\}

Введена в версии: v1.1

Подобно функции [`toInt32`](#toInt32), эта функция преобразует входное значение в значение типа [Int32](../data-types/int-uint.md), но в случае ошибки возвращает `0`.

Поддерживаемые аргументы:

* Строковые представления (U)Int*.

Неподдерживаемые аргументы (возвращают `0`):

* Строковые представления значений Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toInt32OrZero('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах типа [Int32](../data-types/int-uint.md), происходит переполнение или потеря значимости результата.
Это не считается ошибкой.
:::

См. также:

* [`toInt32`](#toInt32).
* [`toInt32OrNull`](#toInt32OrNull).
* [`toInt32OrDefault`](#toInt32OrDefault).

**Синтаксис**

```sql
toInt32OrZero(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа Int32 или `0` в случае неуспешного преобразования. [`Int32`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt32OrZero('32'),
    toInt32OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt32OrZero('32'): 32
toInt32OrZero('abc'): 0
```


## toInt64 \{#toInt64\}

Добавлена в: v1.1

Преобразует входное значение в значение типа [`Int64`](../data-types/int-uint.md).
Выбрасывает исключение в случае ошибки.

Поддерживаемые аргументы:

* Значения или строковые представления типов (U)Int*.
* Значения типов Float*.

Неподдерживаемые аргументы:

* Строковые представления значений Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toInt64('0xc0fe');`.

:::note
Если входное значение не может быть представлено в диапазоне [Int64](../data-types/int-uint.md), происходит переполнение или выход за нижнюю границу.
Это не считается ошибкой.
Например: `SELECT toInt64(9223372036854775808) == -9223372036854775808;`
:::

:::note
Функция использует [округление к нулю](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), то есть отбрасывает дробную часть чисел.
:::

См. также:

* [`toInt64OrZero`](#toInt64OrZero).
* [`toInt64OrNull`](#toInt64OrNull).
* [`toInt64OrDefault`](#toInt64OrDefault).

**Синтаксис**

```sql
toInt64(expr)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. Поддерживаются: значения или строковые представления типа (U)Int*, значения типа Float*. Не поддерживаются: строковые представления значений типа Float* (включая NaN и Inf), строковые представления двоичных и шестнадцатеричных чисел. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Возвращает 64-битное целое число. [`Int64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt64(-64),
    toInt64(-64.64),
    toInt64('-64')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt64(-64):    -64
toInt64(-64.64): -64
toInt64('-64'):  -64
```


## toInt64OrDefault \{#toInt64OrDefault\}

Введена в: v21.11

Аналогично функции [`toInt64`](#toInt64), эта функция преобразует входное значение в значение типа [Int64](../data-types/int-uint.md), но в случае ошибки возвращает значение по умолчанию.
Если параметр `default` не задан, то в случае ошибки возвращается `0`.

**Синтаксис**

```sql
toInt64OrDefault(expr[, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `default` — необязательный параметр. Значение по умолчанию, которое возвращается при неуспешном разборе. [`Int64`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение типа Int64 при успешном преобразовании, иначе возвращает значение по умолчанию, если оно задано, или 0, если нет. [`Int64`](/sql-reference/data-types/int-uint)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toInt64OrDefault('-64', CAST('-1', 'Int64'))
```

```response title=Response
-64
```

**Ошибка преобразования**

```sql title=Query
SELECT toInt64OrDefault('abc', CAST('-1', 'Int64'))
```

```response title=Response
-1
```


## toInt64OrNull \{#toInt64OrNull\}

Введена в версии: v1.1

Подобно функции [`toInt64`](#toInt64), эта функция преобразует входное значение в значение типа [Int64](../data-types/int-uint.md), но возвращает `NULL` в случае ошибки.

Поддерживаемые аргументы:

* Строковые представления (U)Int*.

Неподдерживаемые аргументы (возвращают `NULL`):

* Строковые представления значений Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toInt64OrNull('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [Int64](../data-types/int-uint.md), происходит переполнение или потеря значимости (underflow) результата.
Это не считается ошибкой.
:::

См. также:

* [`toInt64`](#toInt64).
* [`toInt64OrZero`](#toInt64OrZero).
* [`toInt64OrDefault`](#toInt64OrDefault).

**Синтаксис**

```sql
toInt64OrNull(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа Int64 или `NULL`, если преобразование не удалось. [`Int64`](/sql-reference/data-types/int-uint) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt64OrNull('-64'),
    toInt64OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt64OrNull('-64'): -64
toInt64OrNull('abc'): \N
```


## toInt64OrZero \{#toInt64OrZero\}

Добавлена в версии: v1.1

Преобразует входное значение в тип [Int64](/sql-reference/data-types/int-uint), но в случае ошибки возвращает `0`.
Аналог [`toInt64`](#toInt64), но возвращает `0` вместо выбрасывания исключения.

См. также:

* [`toInt64`](#toInt64).
* [`toInt64OrNull`](#toInt64OrNull).
* [`toInt64OrDefault`](#toInt64OrDefault).

**Синтаксис**

```sql
toInt64OrZero(x)
```

**Аргументы**

* `x` — входное значение для преобразования. [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring) или [`Float*`](/sql-reference/data-types/float) или [`Decimal`](/sql-reference/data-types/decimal) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Date`](/sql-reference/data-types/date) или [`DateTime`](/sql-reference/data-types/datetime)

**Возвращаемое значение**

Возвращает преобразованное входное значение, либо `0`, если преобразование не удалось. [`Int64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toInt64OrZero('123')
```

```response title=Response
123
```

**При неуспешном преобразовании возвращается ноль**

```sql title=Query
SELECT toInt64OrZero('abc')
```

```response title=Response
0
```


## toInt8 \{#toInt8\}

Появилась в версии: v1.1

Преобразует входное значение в значение типа [`Int8`](../data-types/int-uint.md).
Выбрасывает исключение в случае ошибки.

Поддерживаемые аргументы:

* Значения или строковые представления типа (U)Int*.
* Значения типа Float*.

Неподдерживаемые аргументы:

* Строковые представления значений типа Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toInt8('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [Int8](../data-types/int-uint.md), происходит переполнение или понижение (underflow) результата.
Это не считается ошибкой.
Например: `SELECT toInt8(128) == -128;`.
:::

:::note
Функция использует [округление к нулю](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), то есть отбрасывает дробную часть чисел.
:::

См. также:

* [`toInt8OrZero`](#toInt8OrZero).
* [`toInt8OrNull`](#toInt8OrNull).
* [`toInt8OrDefault`](#toInt8OrDefault).

**Синтаксис**

```sql
toInt8(expr)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Возвращает значение 8-битного целого числа. [`Int8`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt8(-8),
    toInt8(-8.8),
    toInt8('-8')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt8(-8):   -8
toInt8(-8.8): -8
toInt8('-8'): -8
```


## toInt8OrDefault \{#toInt8OrDefault\}

Добавлена в версии: v21.11

Подобно функции [`toInt8`](#toInt8), эта функция преобразует входное значение в значение типа [Int8](../data-types/int-uint.md), но в случае ошибки возвращает значение по умолчанию.
Если значение `default` не передано, то в случае ошибки возвращается `0`.

**Синтаксис**

```sql
toInt8OrDefault(expr[, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `default` — необязательный аргумент. Значение по умолчанию, возвращаемое при неудачном разборе. [`Int8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение типа Int8 при успешном преобразовании, в противном случае — значение по умолчанию, если оно задано, или 0, если нет. [`Int8`](/sql-reference/data-types/int-uint)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toInt8OrDefault('-8', CAST('-1', 'Int8'))
```

```response title=Response
-8
```

**Ошибка преобразования**

```sql title=Query
SELECT toInt8OrDefault('abc', CAST('-1', 'Int8'))
```

```response title=Response
-1
```


## toInt8OrNull \{#toInt8OrNull\}

Добавлено в: v1.1

Подобно функции [`toInt8`](#toInt8), эта функция преобразует входное значение в значение типа [Int8](../data-types/int-uint.md), но возвращает `NULL` в случае ошибки.

Поддерживаемые аргументы:

* Строковые представления (U)Int*.

Неподдерживаемые аргументы (возвращают `NULL`):

* Строковые представления значений Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toInt8OrNull('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [Int8](../data-types/int-uint.md), происходит переполнение или выход за нижнюю границу диапазона результата.
Это не считается ошибкой.
:::

См. также:

* [`toInt8`](#toInt8).
* [`toInt8OrZero`](#toInt8OrZero).
* [`toInt8OrDefault`](#toInt8OrDefault).

**Синтаксис**

```sql
toInt8OrNull(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа Int8, а при неудачном преобразовании — `NULL`. [`Int8`](/sql-reference/data-types/int-uint) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt8OrNull('-8'),
    toInt8OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt8OrNull('-8'):  -8
toInt8OrNull('abc'): \N
```


## toInt8OrZero \{#toInt8OrZero\}

Введена в: v1.1

Аналогично [`toInt8`](#toInt8), эта функция преобразует входное значение в значение типа [Int8](../data-types/int-uint.md), но в случае ошибки возвращает `0`.

Поддерживаемые аргументы:

* Строковые представления (U)Int*.

Неподдерживаемые аргументы (возвращают `0`):

* Строковые представления значений типов Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например: `SELECT toInt8OrZero('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [Int8](../data-types/int-uint.md), происходит переполнение или выход результата за допустимые границы.
Это не считается ошибкой.
:::

См. также:

* [`toInt8`](#toInt8).
* [`toInt8OrNull`](#toInt8OrNull).
* [`toInt8OrDefault`](#toInt8OrDefault).

**Синтаксис**

```sql
toInt8OrZero(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа Int8, в противном случае — `0`, если преобразование не удалось. [`Int8`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toInt8OrZero('8'),
    toInt8OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt8OrZero('8'): 8
toInt8OrZero('abc'): 0
```


## toInterval \{#toInterval\}

Введена в: v25.4

Создаёт значение типа Interval из числового значения и строки с единицей измерения.

Эта функция предоставляет унифицированный способ создания интервалов разных типов (секунды, минуты, часы, дни, недели, месяцы, кварталы, годы)
в рамках одной функции за счёт указания единицы измерения в виде строкового аргумента. Строка с единицей измерения нечувствительна к регистру.

Это эквивалентно вызову специализированных функций, таких как `toIntervalSecond`, `toIntervalMinute`, `toIntervalDay` и т. д.,
но позволяет указывать единицу измерения динамически в виде строкового параметра.

**Синтаксис**

```sql
toInterval(value, unit)
```

**Аргументы**

* `value` — числовое значение, задающее количество единиц. Может иметь любой числовой тип: [`Int8`](/sql-reference/data-types/int-uint), [`Int16`](/sql-reference/data-types/int-uint), [`Int32`](/sql-reference/data-types/int-uint), [`Int64`](/sql-reference/data-types/int-uint), [`UInt8`](/sql-reference/data-types/int-uint), [`UInt16`](/sql-reference/data-types/int-uint), [`UInt32`](/sql-reference/data-types/int-uint), [`UInt64`](/sql-reference/data-types/int-uint), [`Float32`](/sql-reference/data-types/float) или [`Float64`](/sql-reference/data-types/float).
* `unit` — единица времени. Должна быть строкой-константой. Допустимые значения: &#39;nanosecond&#39;, &#39;microsecond&#39;, &#39;millisecond&#39;, &#39;second&#39;, &#39;minute&#39;, &#39;hour&#39;, &#39;day&#39;, &#39;week&#39;, &#39;month&#39;, &#39;quarter&#39;, &#39;year&#39;. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа Interval. Конкретный тип результата зависит от единицы: IntervalNanosecond, IntervalMicrosecond, IntervalMillisecond, IntervalSecond, IntervalMinute, IntervalHour, IntervalDay, IntervalWeek, IntervalMonth, IntervalQuarter или IntervalYear. [`Interval`](/sql-reference/data-types/int-uint)

**Примеры**

**Создание интервалов с различными единицами времени**

```sql title=Query
SELECT
    toInterval(5, 'second') AS seconds,
    toInterval(3, 'day') AS days,
    toInterval(2, 'month') AS months
```

```response title=Response
┌─seconds─┬─days─┬─months─┐
│ 5       │ 3    │ 2      │
└─────────┴──────┴────────┘
```

**Использование интервалов в арифметике дат**

```sql title=Query
SELECT
    now() AS current_time,
    now() + toInterval(1, 'hour') AS one_hour_later,
    now() - toInterval(7, 'day') AS week_ago
```

```response title=Response
┌─────────current_time─┬──one_hour_later─────┬────────────week_ago─┐
│ 2025-01-04 10:30:00  │ 2025-01-04 11:30:00 │ 2024-12-28 10:30:00 │
└──────────────────────┴─────────────────────┴─────────────────────┘
```

**Динамическое создание интервала**

```sql title=Query
SELECT toDate('2025-01-01') + toInterval(number, 'day') AS dates
FROM numbers(5)
```

```response title=Response
┌──────dates─┐
│ 2025-01-01 │
│ 2025-01-02 │
│ 2025-01-03 │
│ 2025-01-04 │
│ 2025-01-05 │
└────────────┘
```


## toIntervalDay \{#toIntervalDay\}

Добавлена в версии: v1.1

Возвращает интервал длиной `n` дней типа данных [`IntervalDay`](../data-types/special-data-types/interval.md).

**Синтаксис**

```sql
toIntervalDay(n)
```

**Аргументы**

* `n` — количество дней. Целые числа или их строковые представления, а также числа с плавающей запятой. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает интервал длительностью `n` дней. [`Interval`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalDay(5) AS interval_to_days
SELECT date + interval_to_days AS result
```

```response title=Response
┌─────result─┐
│ 2025-06-20 │
└────────────┘
```


## toIntervalHour \{#toIntervalHour\}

Введена в версии: v1.1

Возвращает интервал продолжительностью `n` часов типа данных [`IntervalHour`](../data-types/special-data-types/interval.md).

**Синтаксис**

```sql
toIntervalHour(n)
```

**Аргументы**

* `n` — количество часов. Целые числа или их строковые представления, а также числа с плавающей точкой. [`Int*`](/sql-reference/data-types/int-uint) или [`UInt*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает интервал продолжительностью `n` часов. [`Interval`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalHour(12) AS interval_to_hours
SELECT date + interval_to_hours AS result
```

```response title=Response
┌──────────────result─┐
│ 2025-06-15 12:00:00 │
└─────────────────────┘
```


## toIntervalMicrosecond \{#toIntervalMicrosecond\}

Появилась в версии: v22.6

Возвращает интервал продолжительностью `n` микросекунд типа данных [`IntervalMicrosecond`](../../sql-reference/data-types/special-data-types/interval.md).

**Синтаксис**

```sql
toIntervalMicrosecond(n)
```

**Аргументы**

* `n` — количество микросекунд. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает интервал в `n` микросекунд. [`Interval`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH
    toDateTime('2025-06-15') AS date,
    toIntervalMicrosecond(30) AS interval_to_microseconds
SELECT date + interval_to_microseconds AS result
```

```response title=Response
┌─────────────────────result─┐
│ 2025-06-15 00:00:00.000030 │
└────────────────────────────┘
```


## toIntervalMillisecond \{#toIntervalMillisecond\}

Введена в: v22.6

Возвращает интервал `n` миллисекунд типа данных [IntervalMillisecond](../../sql-reference/data-types/special-data-types/interval.md).

**Синтаксис**

```sql
toIntervalMillisecond(n)
```

**Аргументы**

* `n` — число миллисекунд. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает интервал величиной `n` миллисекунд. [`Interval`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH
    toDateTime('2025-06-15') AS date,
    toIntervalMillisecond(30) AS interval_to_milliseconds
SELECT date + interval_to_milliseconds AS result
```

```response title=Response
┌──────────────────result─┐
│ 2025-06-15 00:00:00.030 │
└─────────────────────────┘
```


## toIntervalMinute \{#toIntervalMinute\}

Функция впервые появилась в: v1.1

Возвращает интервал продолжительностью `n` минут типа данных [`IntervalMinute`](../data-types/special-data-types/interval.md).

**Синтаксис**

```sql
toIntervalMinute(n)
```

**Аргументы**

* `n` — количество минут. Целые числа или их строковые представления, а также числа с плавающей запятой. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает интервал длительностью `n` минут. [`Interval`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalMinute(12) AS interval_to_minutes
SELECT date + interval_to_minutes AS result
```

```response title=Response
┌──────────────result─┐
│ 2025-06-15 00:12:00 │
└─────────────────────┘
```


## toIntervalMonth \{#toIntervalMonth\}

Введена в версии: v1.1

Возвращает интервал длиной `n` месяцев типа данных [`IntervalMonth`](../../sql-reference/data-types/special-data-types/interval.md).

**Синтаксис**

```sql
toIntervalMonth(n)
```

**Аргументы**

* `n` — количество месяцев. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает интервал продолжительностью `n` месяцев. [`Interval`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalMonth(1) AS interval_to_month
SELECT date + interval_to_month AS result
```

```response title=Response
┌─────result─┐
│ 2025-07-15 │
└────────────┘
```


## toIntervalNanosecond \{#toIntervalNanosecond\}

Появилась в версии: v22.6

Возвращает интервал в `n` наносекунд типа данных [`IntervalNanosecond`](../../sql-reference/data-types/special-data-types/interval.md).

**Синтаксис**

```sql
toIntervalNanosecond(n)
```

**Аргументы**

* `n` — число наносекунд. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает интервал продолжительностью `n` наносекунд. [`Interval`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH
    toDateTime('2025-06-15') AS date,
    toIntervalNanosecond(30) AS interval_to_nanoseconds
SELECT date + interval_to_nanoseconds AS result
```

```response title=Response
┌────────────────────────result─┐
│ 2025-06-15 00:00:00.000000030 │
└───────────────────────────────┘
```


## toIntervalQuarter \{#toIntervalQuarter\}

Появилось в версии: v1.1

Возвращает интервал длиной `n` кварталов типа данных [`IntervalQuarter`](../../sql-reference/data-types/special-data-types/interval.md).

**Синтаксис**

```sql
toIntervalQuarter(n)
```

**Аргументы**

* `n` — Количество кварталов. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает интервал на `n` кварталов. [`Interval`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalQuarter(1) AS interval_to_quarter
SELECT date + interval_to_quarter AS result
```

```response title=Response
┌─────result─┐
│ 2025-09-15 │
└────────────┘
```


## toIntervalSecond \{#toIntervalSecond\}

Введена в версии: v1.1

Возвращает интервал продолжительностью `n` секунд типа данных [`IntervalSecond`](../data-types/special-data-types/interval.md).

**Синтаксис**

```sql
toIntervalSecond(n)
```

**Аргументы**

* `n` — количество секунд. Целые числа или их строковые представления, а также числа с плавающей запятой. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает интервал длительностью `n` секунд. [`Interval`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalSecond(30) AS interval_to_seconds
SELECT date + interval_to_seconds AS result
```

```response title=Response
┌──────────────result─┐
│ 2025-06-15 00:00:30 │
└─────────────────────┘
```


## toIntervalWeek \{#toIntervalWeek\}

Добавлено в: v1.1

Возвращает интервал длительностью `n` недель типа данных [`IntervalWeek`](../../sql-reference/data-types/special-data-types/interval.md).

**Синтаксис**

```sql
toIntervalWeek(n)
```

**Аргументы**

* `n` — количество недель. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает интервал продолжительностью `n` недель. [`Interval`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalWeek(1) AS interval_to_week
SELECT date + interval_to_week AS result
```

```response title=Response
┌─────result─┐
│ 2025-06-22 │
└────────────┘
```


## toIntervalYear \{#toIntervalYear\}

Появилась в версии: v1.1

Возвращает интервал длительностью `n` лет типа данных [`IntervalYear`](../../sql-reference/data-types/special-data-types/interval.md).

**Синтаксис**

```sql
toIntervalYear(n)
```

**Аргументы**

* `n` — количество лет. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает интервал длительностью `n` лет. [`Interval`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH
    toDate('2024-06-15') AS date,
    toIntervalYear(1) AS interval_to_year
SELECT date + interval_to_year AS result
```

```response title=Response
┌─────result─┐
│ 2025-06-15 │
└────────────┘
```


## toLowCardinality \{#toLowCardinality\}

Введена в: v18.12

Преобразует входной аргумент в вариант типа данных [LowCardinality](../data-types/lowcardinality.md) с тем же типом данных.

:::tip
Чтобы преобразовать тип данных `LowCardinality` в обычный тип данных, используйте функцию [CAST](#CAST).
Например: `CAST(x AS String)`.
:::

**Синтаксис**

```sql
toLowCardinality(expr)
```

**Аргументы**

* `expr` — выражение, результатом которого будет один из поддерживаемых типов данных: [`String`](/sql-reference/data-types/string), [`FixedString`](/sql-reference/data-types/fixedstring), [`Date`](/sql-reference/data-types/date), [`DateTime`](/sql-reference/data-types/datetime), [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float).

**Возвращаемое значение**

Возвращает исходное значение, преобразованное к типу данных `LowCardinality`. [`LowCardinality`](/sql-reference/data-types/lowcardinality)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toLowCardinality('1')
```

```response title=Response
┌─toLowCardinality('1')─┐
│ 1                     │
└───────────────────────┘
```


## toString \{#toString\}

Добавлено в: v1.1

Преобразует значения в их строковое представление.
Для аргументов типа DateTime функция может принимать второй аргумент типа String, содержащий имя часового пояса.

**Синтаксис**

```sql
toString(value[, timezone])
```

**Аргументы**

* `value` — Значение, которое нужно преобразовать в строку. [`Any`](/sql-reference/data-types)
* `timezone` — Необязательный аргумент. Название часового пояса для преобразования DateTime. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает строковое представление входного значения. [`String`](/sql-reference/data-types/string)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    now() AS ts,
    time_zone,
    toString(ts, time_zone) AS str_tz_datetime
FROM system.time_zones
WHERE time_zone LIKE 'Europe%'
LIMIT 10
```

```response title=Response
┌──────────────────ts─┬─time_zone─────────┬─str_tz_datetime─────┐
│ 2023-09-08 19:14:59 │ Europe/Amsterdam  │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Andorra    │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Astrakhan  │ 2023-09-08 23:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Athens     │ 2023-09-08 22:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Belfast    │ 2023-09-08 20:14:59 │
└─────────────────────┴───────────────────┴─────────────────────┘
```


## toStringCutToZero \{#toStringCutToZero\}

Добавлено в: v1.1

Принимает аргумент типа [String](/sql-reference/data-types/string) или [FixedString](/sql-reference/data-types/fixedstring) и возвращает строку типа String, содержащую копию исходной строки, обрезанную при первом нулевом байте.

Нулевые байты (\0) считаются терминаторами строки.
Эта функция полезна для обработки строк в стиле C или бинарных данных, где нулевые байты обозначают конец значимого содержимого.

**Синтаксис**

```sql
toStringCutToZero(s)
```

**Аргументы**

* `s` — обрабатываемое значение типа String или FixedString. [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Возвращает строку типа String, содержащую символы до первого нулевого байта. [`String`](/sql-reference/data-types/string)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toStringCutToZero('hello'),
    toStringCutToZero('hello\0world')
```

```response title=Response
┌─toStringCutToZero('hello')─┬─toStringCutToZero('hello\\0world')─┐
│ hello                      │ hello                             │
└────────────────────────────┴───────────────────────────────────┘
```


## toTime \{#toTime\}

Добавлено в версии: v1.1

Преобразует входное значение в тип [Time](/sql-reference/data-types/time).
Поддерживает преобразование из типов String, FixedString, DateTime или числовых типов, представляющих количество секунд с полуночи.

**Синтаксис**

```sql
toTime(x)
```

**Аргументы**

* `x` — входное значение для преобразования. [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring) или [`DateTime`](/sql-reference/data-types/datetime) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)

**Возвращаемое значение**

Возвращает преобразованное значение. [`Time`](/sql-reference/data-types/time)

**Примеры**

**Преобразование String в Time**

```sql title=Query
SELECT toTime('14:30:25')
```

```response title=Response
14:30:25
```

**Преобразование из DateTime в Time**

```sql title=Query
SELECT toTime(toDateTime('2025-04-15 14:30:25'))
```

```response title=Response
14:30:25
```

**Преобразование целого числа в значение времени**

```sql title=Query
SELECT toTime(52225)
```

```response title=Response
14:30:25
```


## toTime64 \{#toTime64\}

Добавлена в версии: v25.6

Преобразует входное значение в тип [Time64](/sql-reference/data-types/time64).
Поддерживает преобразование из типов String, FixedString, DateTime64 или числовых типов, представляющих количество микросекунд с полуночи.
Обеспечивает микросекундную точность значений времени.

**Синтаксис**

```sql
toTime64(x)
```

**Аргументы**

* `x` — Входное значение для преобразования. [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring) или [`DateTime64`](/sql-reference/data-types/datetime64) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)

**Возвращаемое значение**

Возвращает преобразованное входное значение с точностью до микросекунд. [`Time64(6)`](/sql-reference/data-types/time64)

**Примеры**

**Преобразование String в Time64**

```sql title=Query
SELECT toTime64('14:30:25.123456')
```

```response title=Response
14:30:25.123456
```

**Преобразование из DateTime64 в Time64**

```sql title=Query
SELECT toTime64(toDateTime64('2025-04-15 14:30:25.123456', 6))
```

```response title=Response
14:30:25.123456
```

**Преобразование целых чисел в Time64**

```sql title=Query
SELECT toTime64(52225123456)
```

```response title=Response
14:30:25.123456
```


## toTime64OrNull \{#toTime64OrNull\}

Появилось в версии: v25.6

Преобразует входное значение в значение типа `Time64`, но при ошибке возвращает `NULL`.
Аналог функции [`toTime64`](#toTime64), но возвращает `NULL` вместо выброса исключения при ошибках преобразования.

См. также:

* [`toTime64`](#toTime64)
* [`toTime64OrZero`](#toTime64OrZero)

**Синтаксис**

```sql
toTime64OrNull(x)
```

**Аргументы**

* `x` — Строковое представление времени с точностью до долей секунды. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа Time64 при успешном преобразовании, в противном случае — `NULL`. [`Time64`](/sql-reference/data-types/time64) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toTime64OrNull('12:30:45.123'), toTime64OrNull('invalid')
```

```response title=Response
┌─toTime64OrNull('12:30:45.123')─┬─toTime64OrNull('invalid')─┐
│                   12:30:45.123 │                      ᴺᵁᴸᴸ │
└────────────────────────────────┴───────────────────────────┘
```


## toTime64OrZero \{#toTime64OrZero\}

Введено в: v25.6

Преобразует входное значение в значение типа Time64, но возвращает `00:00:00.000` в случае ошибки.
Аналог функции [`toTime64`](#toTime64), но возвращает `00:00:00.000` вместо генерации исключения при ошибках преобразования.

**Синтаксис**

```sql
toTime64OrZero(x)
```

**Аргументы**

* `x` — Строковое представление времени с точностью до долей секунды. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа Time64 при успешном выполнении, в противном случае — `00:00:00.000`. [`Time64`](/sql-reference/data-types/time64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toTime64OrZero('12:30:45.123'), toTime64OrZero('invalid')
```

```response title=Response
┌─toTime64OrZero('12:30:45.123')─┬─toTime64OrZero('invalid')─┐
│                   12:30:45.123 │             00:00:00.000 │
└────────────────────────────────┴──────────────────────────┘
```


## toTimeOrNull \{#toTimeOrNull\}

Введена в версии v1.1

Преобразует входное значение в значение типа Time, но в случае ошибки возвращает `NULL`.
Аналог функции [`toTime`](#toTime), но возвращает `NULL` вместо выбрасывания исключения при ошибке преобразования.

См. также:

* [`toTime`](#toTime)
* [`toTimeOrZero`](#toTimeOrZero)

**Синтаксис**

```sql
toTimeOrNull(x)
```

**Аргументы**

* `x` — строковое представление времени. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа [`Time`](/sql-reference/data-types/time) при успешном преобразовании, в противном случае — [`NULL`](/sql-reference/syntax#null).

**Примеры**

**Пример использования**

```sql title=Query
SELECT toTimeOrNull('12:30:45'), toTimeOrNull('invalid')
```

```response title=Response
┌─toTimeOrNull('12:30:45')─┬─toTimeOrNull('invalid')─┐
│                 12:30:45 │                    ᴺᵁᴸᴸ │
└──────────────────────────┴─────────────────────────┘
```


## toTimeOrZero \{#toTimeOrZero\}

Добавлена в: v1.1

Преобразует входное значение в тип Time, но в случае ошибки возвращает `00:00:00`.
Аналогична функции toTime, но вместо генерации исключения при ошибках преобразования возвращает `00:00:00`.

**Синтаксис**

```sql
toTimeOrZero(x)
```

**Аргументы**

* `x` — строковое представление времени. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа Time в случае успешного выполнения, иначе `00:00:00`. [`Time`](/sql-reference/data-types/time)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toTimeOrZero('12:30:45'), toTimeOrZero('invalid')
```

```response title=Response
┌─toTimeOrZero('12:30:45')─┬─toTimeOrZero('invalid')─┐
│                 12:30:45 │                00:00:00 │
└──────────────────────────┴─────────────────────────┘
```


## toUInt128 \{#toUInt128\}

Введена в версии v1.1

Преобразует входное значение в значение типа [`UInt128`](/sql-reference/functions/type-conversion-functions#toUInt128).
Выбрасывает исключение в случае ошибки.
Функция использует округление в сторону нуля, то есть обрезает дробную часть чисел.

Поддерживаемые аргументы:

* Значения или строковые представления типа (U)Int*.
* Значения типа Float*.

Неподдерживаемые аргументы:

* Строковые представления значений Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toUInt128('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона UInt128, происходит переполнение или выход за нижнюю границу диапазона результата.
Это не считается ошибкой.
:::

См. также:

* [`toUInt128OrZero`](#toUInt128OrZero).
* [`toUInt128OrNull`](#toUInt128OrNull).
* [`toUInt128OrDefault`](#toUInt128OrDefault).

**Синтаксис**

```sql
toUInt128(expr)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числового значения. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Возвращает 128-битное целое число без знака. [`UInt128`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt128(128),
    toUInt128(128.8),
    toUInt128('128')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt128(128):   128
toUInt128(128.8): 128
toUInt128('128'): 128
```


## toUInt128OrDefault \{#toUInt128OrDefault\}

Введена в версии v21.11

Подобно функции [`toUInt128`](#toUInt128), эта функция преобразует входное значение в значение типа [`UInt128`](../data-types/int-uint.md), но в случае ошибки возвращает значение по умолчанию.
Если аргумент `default` не передан, то в случае ошибки возвращается `0`.

**Синтаксис**

```sql
toUInt128OrDefault(expr[, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `default` — необязательный параметр. Значение по умолчанию, возвращаемое при неудачном разборе. [`UInt128`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение типа UInt128 при успешном разборе, в противном случае возвращает значение по умолчанию, если оно задано, или 0, если нет. [`UInt128`](/sql-reference/data-types/int-uint)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toUInt128OrDefault('128', CAST('0', 'UInt128'))
```

```response title=Response
128
```

**Неуспешное преобразование**

```sql title=Query
SELECT toUInt128OrDefault('abc', CAST('0', 'UInt128'))
```

```response title=Response
0
```


## toUInt128OrNull \{#toUInt128OrNull\}

Добавлена в: v21.6

Как и [`toUInt128`](#toUInt128), эта функция преобразует входное значение в значение типа [`UInt128`](../data-types/int-uint.md), но возвращает `NULL` в случае ошибки.

Поддерживаемые аргументы:

* Строковые представления типов (U)Int*.

Неподдерживаемые аргументы (возвращают `NULL`):

* Строковые представления значений типов Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toUInt128OrNull('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [`UInt128`](../data-types/int-uint.md), происходит переполнение или потеря значимости результата.
Это не считается ошибкой.
:::

См. также:

* [`toUInt128`](#toUInt128).
* [`toUInt128OrZero`](#toUInt128OrZero).
* [`toUInt128OrDefault`](#toUInt128OrDefault).

**Синтаксис**

```sql
toUInt128OrNull(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа UInt128, иначе — `NULL`, если преобразование не удалось. [`UInt128`](/sql-reference/data-types/int-uint) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt128OrNull('128'),
    toUInt128OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt128OrNull('128'): 128
toUInt128OrNull('abc'): \N
```


## toUInt128OrZero \{#toUInt128OrZero\}

Введена в версии: v1.1

Аналогично функции [`toUInt128`](#toUInt128), эта функция преобразует входное значение в значение типа [`UInt128`](../data-types/int-uint.md), но в случае ошибки возвращает `0`.

Поддерживаемые аргументы:

* Строковые представления типов (U)Int*.

Неподдерживаемые аргументы (возвращают `0`):

* Строковые представления значений Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toUInt128OrZero('0xc0fe');`.

:::note
Если входное значение не может быть представлено в диапазоне значений типа [`UInt128`](../data-types/int-uint.md), происходит переполнение или выход результата за нижнюю границу допустимого диапазона.
Это не считается ошибкой.
:::

См. также:

* [`toUInt128`](#toUInt128).
* [`toUInt128OrNull`](#toUInt128OrNull).
* [`toUInt128OrDefault`](#toUInt128OrDefault).

**Синтаксис**

```sql
toUInt128OrZero(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа UInt128 или `0` в случае, если преобразование не удалось. [`UInt128`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt128OrZero('128'),
    toUInt128OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt128OrZero('128'): 128
toUInt128OrZero('abc'): 0
```


## toUInt16 \{#toUInt16\}

Добавлено в: v1.1

Преобразует входное значение в значение типа [`UInt16`](../data-types/int-uint.md).
Вызывает исключение в случае ошибки.

Поддерживаемые аргументы:

* Значения или строковые представления типов (U)Int*.
* Значения типов Float*.

Неподдерживаемые аргументы:

* Строковые представления значений типов Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toUInt16('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона значений [`UInt16`](../data-types/int-uint.md), происходит переполнение или выход за нижнюю границу результата.
Это не считается ошибкой.
Например: `SELECT toUInt16(65536) == 0;`.
:::

:::note
Функция использует [округление к нулю](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), то есть отбрасывает дробные разряды чисел.
:::

См. также:

* [`toUInt16OrZero`](#toUInt16OrZero).
* [`toUInt16OrNull`](#toUInt16OrNull).
* [`toUInt16OrDefault`](#toUInt16OrDefault).

**Синтаксис**

```sql
toUInt16(expr)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Возвращает 16-битное беззнаковое целое число. [`UInt16`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt16(16),
    toUInt16(16.16),
    toUInt16('16')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt16(16):    16
toUInt16(16.16): 16
toUInt16('16'):  16
```


## toUInt16OrDefault \{#toUInt16OrDefault\}

Введена в: v21.11

Аналогично [`toUInt16`](#toUInt16), эта функция преобразует входное значение в тип [UInt16](../data-types/int-uint.md), но в случае ошибки возвращает значение по умолчанию.
Если значение `default` не передано, в случае ошибки возвращается `0`.

**Синтаксис**

```sql
toUInt16OrDefault(expr[, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `default` — необязательный параметр. Значение по умолчанию, возвращаемое, если преобразование не удалось. [`UInt16`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение типа UInt16 при успешном преобразовании, в противном случае — значение по умолчанию, если оно указано, или 0, если нет. [`UInt16`](/sql-reference/data-types/int-uint)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toUInt16OrDefault('16', CAST('0', 'UInt16'))
```

```response title=Response
16
```

**Ошибка преобразования**

```sql title=Query
SELECT toUInt16OrDefault('abc', CAST('0', 'UInt16'))
```

```response title=Response
0
```


## toUInt16OrNull \{#toUInt16OrNull\}

Введена в версии: v1.1

Подобно [`toUInt16`](#toUInt16), эта функция преобразует входное значение в значение типа [`UInt16`](../data-types/int-uint.md), но возвращает `NULL` в случае ошибки.

Поддерживаемые аргументы:

* Строковые представления (U)Int8/16/32/128/256.

Неподдерживаемые аргументы (возвращают `NULL`):

* Строковые представления значений типа Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toUInt16OrNull('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [`UInt16`](../data-types/int-uint.md), происходит переполнение или выход результата за пределы диапазона (underflow).
Это не считается ошибкой.
:::

См. также:

* [`toUInt16`](#toUInt16).
* [`toUInt16OrZero`](#toUInt16OrZero).
* [`toUInt16OrDefault`](#toUInt16OrDefault).

**Синтаксис**

```sql
toUInt16OrNull(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа `UInt16` или `NULL` при неудачном преобразовании. [`UInt16`](/sql-reference/data-types/int-uint) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt16OrNull('16'),
    toUInt16OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt16OrNull('16'):  16
toUInt16OrNull('abc'): \N
```


## toUInt16OrZero \{#toUInt16OrZero\}

Появилась в версии: v1.1

Подобно функции [`toUInt16`](#toUInt16), эта функция преобразует входное значение в значение типа [`UInt16`](../data-types/int-uint.md), но возвращает `0` в случае ошибки.

Поддерживаемые аргументы:

* Строковые представления значений типов (U)Int8/16/32/128/256.

Неподдерживаемые аргументы (возвращают `0`):

* Строковые представления значений типов с плавающей запятой (Float*), включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toUInt16OrZero('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона типа [`UInt16`](../data-types/int-uint.md), происходит переполнение или выход результата за нижнюю границу диапазона.
Это не считается ошибкой.
:::

См. также:

* [`toUInt16`](#toUInt16).
* [`toUInt16OrNull`](#toUInt16OrNull).
* [`toUInt16OrDefault`](#toUInt16OrDefault).

**Синтаксис**

```sql
toUInt16OrZero(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа UInt16, в противном случае — `0`, если преобразование не удалось. [`UInt16`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt16OrZero('16'),
    toUInt16OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt16OrZero('16'):  16
toUInt16OrZero('abc'): 0
```


## toUInt256 \{#toUInt256\}

Введена в версии: v1.1

Преобразует входное значение в значение типа UInt256.
Вызывает исключение в случае ошибки.
Функция использует округление к нулю, то есть отбрасывает дробные разряды чисел.

Поддерживаемые аргументы:

* Значения или строковые представления типов (U)Int*.
* Значения типов Float*.

Неподдерживаемые аргументы:

* Строковые представления значений типов Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toUInt256('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона UInt256, результат переполняется или выходит за нижнюю границу диапазона.
Это не считается ошибкой.
:::

См. также:

* [`toUInt256OrZero`](#toUInt256OrZero).
* [`toUInt256OrNull`](#toUInt256OrNull).
* [`toUInt256OrDefault`](#toUInt256OrDefault).

**Синтаксис**

```sql
toUInt256(expr)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Возвращает 256-битное беззнаковое целое число. [`UInt256`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt256(256),
    toUInt256(256.256),
    toUInt256('256')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt256(256):     256
toUInt256(256.256): 256
toUInt256('256'):   256
```


## toUInt256OrDefault \{#toUInt256OrDefault\}

Добавлено в: v21.11

Подобно функции [`toUInt256`](#toUInt256), эта функция преобразует входное значение в тип [UInt256](../data-types/int-uint.md), но в случае ошибки возвращает значение по умолчанию.
Если аргумент `default` не передан, то в случае ошибки возвращается `0`.

**Синтаксис**

```sql
toUInt256OrDefault(expr[, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `default` — необязательный параметр. Значение по умолчанию, которое возвращается при неуспешном разборе. [`UInt256`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение типа UInt256 при успешном преобразовании, иначе возвращает значение по умолчанию, если оно задано, или 0, если нет. [`UInt256`](/sql-reference/data-types/int-uint)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toUInt256OrDefault('-256', CAST('0', 'UInt256'))
```

```response title=Response
0
```

**Ошибка преобразования**

```sql title=Query
SELECT toUInt256OrDefault('abc', CAST('0', 'UInt256'))
```

```response title=Response
0
```


## toUInt256OrNull \{#toUInt256OrNull\}

Добавлена в версии: v20.8

Как и [`toUInt256`](#toUInt256), эта функция преобразует входное значение в значение типа [`UInt256`](../data-types/int-uint.md), но возвращает `NULL` в случае ошибки.

Поддерживаемые аргументы:

* Строковые представления целочисленных типов (U)Int*.

Неподдерживаемые аргументы (возвращают `NULL`):

* Строковые представления значений типов Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toUInt256OrNull('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона значений [`UInt256`](../data-types/int-uint.md), происходит переполнение или занижение результата.
Это не считается ошибкой.
:::

См. также:

* [`toUInt256`](#toUInt256).
* [`toUInt256OrZero`](#toUInt256OrZero).
* [`toUInt256OrDefault`](#toUInt256OrDefault).

**Синтаксис**

```sql
toUInt256OrNull(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа UInt256 или `NULL` при неуспешном преобразовании. [`UInt256`](/sql-reference/data-types/int-uint) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt256OrNull('256'),
    toUInt256OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt256OrNull('256'): 256
toUInt256OrNull('abc'): \N
```


## toUInt256OrZero \{#toUInt256OrZero\}

Появилась в версии: v20.8

Как и [`toUInt256`](#toUInt256), эта функция преобразует входное значение в значение типа [`UInt256`](../data-types/int-uint.md), но в случае ошибки возвращает `0`.

Поддерживаемые аргументы:

* Строковые представления (U)Int*.

Неподдерживаемые аргументы (возвращают `0`):

* Строковые представления значений Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например, `SELECT toUInt256OrZero('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [`UInt256`](../data-types/int-uint.md), происходит переполнение или занижение результата.
Это не считается ошибкой.
:::

См. также:

* [`toUInt256`](#toUInt256).
* [`toUInt256OrNull`](#toUInt256OrNull).
* [`toUInt256OrDefault`](#toUInt256OrDefault).

**Синтаксис**

```sql
toUInt256OrZero(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа UInt256, или `0` в случае неуспешного преобразования. [`UInt256`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt256OrZero('256'),
    toUInt256OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt256OrZero('256'): 256
toUInt256OrZero('abc'): 0
```


## toUInt32 \{#toUInt32\}

Добавлено в версии: v1.1

Преобразует входное значение к типу [`UInt32`](../data-types/int-uint.md).
Выбрасывает исключение в случае ошибки.

Поддерживаемые аргументы:

* Значения или строковые представления типов (U)Int*.
* Значения типа Float*.

Неподдерживаемые аргументы:

* Строковые представления значений Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toUInt32('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона типа [`UInt32`](../data-types/int-uint.md), результат выходит за верхнюю или нижнюю границу диапазона.
Это не считается ошибкой.
Например: `SELECT toUInt32(4294967296) == 0;`
:::

:::note
Функция использует [округление к нулю](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), то есть отбрасывает дробную часть числа.
:::

См. также:

* [`toUInt32OrZero`](#toUInt32OrZero).
* [`toUInt32OrNull`](#toUInt32OrNull).
* [`toUInt32OrDefault`](#toUInt32OrDefault).

**Синтаксис**

```sql
toUInt32(expr)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Возвращает значение 32-битного беззнакового целого числа. [`UInt32`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt32(32),
    toUInt32(32.32),
    toUInt32('32')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt32(32):    32
toUInt32(32.32): 32
toUInt32('32'):  32
```


## toUInt32OrDefault \{#toUInt32OrDefault\}

Добавлена в версии: v21.11

Как и [`toUInt32`](#toUInt32), эта функция преобразует входное значение в значение типа [UInt32](../data-types/int-uint.md), но в случае ошибки возвращает значение по умолчанию.
Если значение `default` не передано, в случае ошибки возвращается `0`.

**Синтаксис**

```sql
toUInt32OrDefault(expr[, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `default` — необязательный аргумент. Значение по умолчанию, которое возвращается при неуспешном разборе. [`UInt32`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение типа `UInt32` при успешном преобразовании, в противном случае — значение по умолчанию, если оно передано, или `0`, если нет. [`UInt32`](/sql-reference/data-types/int-uint)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toUInt32OrDefault('32', CAST('0', 'UInt32'))
```

```response title=Response
32
```

**Неуспешное преобразование**

```sql title=Query
SELECT toUInt32OrDefault('abc', CAST('0', 'UInt32'))
```

```response title=Response
0
```


## toUInt32OrNull \{#toUInt32OrNull\}

Введена в версии: v1.1

Как и [`toUInt32`](#toUInt32), эта функция преобразует входное значение в значение типа [`UInt32`](../data-types/int-uint.md), но возвращает `NULL` в случае ошибки.

Поддерживаемые аргументы:

* Строковые представления (U)Int8/16/32/128/256.

Неподдерживаемые аргументы (функция возвращает `NULL`):

* Строковые представления значений типов Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toUInt32OrNull('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [`UInt32`](../data-types/int-uint.md), происходит переполнение или выход результата за нижнюю границу диапазона.
Это не считается ошибкой.
:::

См. также:

* [`toUInt32`](#toUInt32).
* [`toUInt32OrZero`](#toUInt32OrZero).
* [`toUInt32OrDefault`](#toUInt32OrDefault).

**Синтаксис**

```sql
toUInt32OrNull(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа `UInt32`, при неуспешном преобразовании — `NULL`. [`UInt32`](/sql-reference/data-types/int-uint) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt32OrNull('32'),
    toUInt32OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt32OrNull('32'):  32
toUInt32OrNull('abc'): \N
```


## toUInt32OrZero \{#toUInt32OrZero\}

Введена в версии v1.1

Аналогично [`toUInt32`](#toUInt32), эта функция преобразует входное значение в значение типа [`UInt32`](../data-types/int-uint.md), но возвращает `0` в случае ошибки.

Поддерживаемые аргументы:

* Строковые представления (U)Int8/16/32/128/256.

Неподдерживаемые аргументы (возвращают `0`):

* Строковые представления значений типа Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toUInt32OrZero('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [`UInt32`](../data-types/int-uint.md), происходит переполнение или выход результата за нижнюю границу диапазона.
Это не считается ошибкой.
:::

См. также:

* [`toUInt32`](#toUInt32).
* [`toUInt32OrNull`](#toUInt32OrNull).
* [`toUInt32OrDefault`](#toUInt32OrDefault).

**Синтаксис**

```sql
toUInt32OrZero(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа UInt32, в противном случае `0`, если преобразование не удалось. [`UInt32`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt32OrZero('32'),
    toUInt32OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt32OrZero('32'):  32
toUInt32OrZero('abc'): 0
```


## toUInt64 \{#toUInt64\}

Добавлено в: v1.1

Преобразует входное значение в значение типа [`UInt64`](../data-types/int-uint.md).
Вызывает исключение в случае ошибки.

Поддерживаемые аргументы:

* Значения или строковые представления типа (U)Int*.
* Значения типа Float*.

Неподдерживаемые типы:

* Строковые представления значений типа Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toUInt64('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [`UInt64`](../data-types/int-uint.md), происходит переполнение или, наоборот, выход за нижнюю границу диапазона.
Это не считается ошибкой.
Например: `SELECT toUInt64(18446744073709551616) == 0;`
:::

:::note
Функция использует [округление к нулю](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), то есть отбрасывает дробную часть чисел.
:::

Смотрите также:

* [`toUInt64OrZero`](#toUInt64OrZero).
* [`toUInt64OrNull`](#toUInt64OrNull).
* [`toUInt64OrDefault`](#toUInt64OrDefault).

**Синтаксис**

```sql
toUInt64(expr)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Возвращает значение 64-битного целого числа без знака. [`UInt64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt64(64),
    toUInt64(64.64),
    toUInt64('64')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt64(64):    64
toUInt64(64.64): 64
toUInt64('64'):  64
```


## toUInt64OrDefault \{#toUInt64OrDefault\}

Появилась в версии: v21.11

Как и [`toUInt64`](#toUInt64), эта функция преобразует входное значение в значение типа [UInt64](../data-types/int-uint.md), но при ошибке возвращает значение по умолчанию.
Если значение `default` не передано, то в случае ошибки возвращается `0`.

**Синтаксис**

```sql
toUInt64OrDefault(expr[, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `default` — необязательный аргумент. Значение по умолчанию, которое возвращается, если парсинг не удался. [`UInt64`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

При успешном преобразовании возвращает значение типа UInt64, в противном случае возвращает значение по умолчанию, если оно передано, или 0, если нет. [`UInt64`](/sql-reference/data-types/int-uint)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toUInt64OrDefault('64', CAST('0', 'UInt64'))
```

```response title=Response
64
```

**Ошибка преобразования**

```sql title=Query
SELECT toUInt64OrDefault('abc', CAST('0', 'UInt64'))
```

```response title=Response
0
```


## toUInt64OrNull \{#toUInt64OrNull\}

Введена в: v1.1

Как и [`toUInt64`](#toUInt64), эта функция преобразует входное значение в значение типа [`UInt64`](../data-types/int-uint.md), но возвращает `NULL` в случае ошибки.

Поддерживаемые аргументы:

* Строковые представления целочисленных типов (U)Int*.

Неподдерживаемые аргументы (возвращают `NULL`):

* Строковые представления значений типов Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toUInt64OrNull('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [`UInt64`](../data-types/int-uint.md), происходит переполнение или выход результата за пределы диапазона (underflow).
Это не считается ошибкой.
:::

См. также:

* [`toUInt64`](#toUInt64).
* [`toUInt64OrZero`](#toUInt64OrZero).
* [`toUInt64OrDefault`](#toUInt64OrDefault).

**Синтаксис**

```sql
toUInt64OrNull(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа UInt64, в противном случае — `NULL`, если преобразование не удалось. [`UInt64`](/sql-reference/data-types/int-uint) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt64OrNull('64'),
    toUInt64OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt64OrNull('64'):  64
toUInt64OrNull('abc'): \N
```


## toUInt64OrZero \{#toUInt64OrZero\}

Введена в версии v1.1

Как и [`toUInt64`](#toUInt64), эта функция преобразует входное значение в значение типа [`UInt64`](../data-types/int-uint.md), но возвращает `0` в случае ошибки.

Поддерживаемые аргументы:

* Строковые представления типов (U)Int*.

Неподдерживаемые аргументы (возвращают `0`):

* Строковые представления значений типа Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toUInt64OrZero('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [`UInt64`](../data-types/int-uint.md), происходит переполнение или выход результата за нижнюю границу диапазона (underflow).
Это не считается ошибкой.
:::

См. также:

* [`toUInt64`](#toUInt64).
* [`toUInt64OrNull`](#toUInt64OrNull).
* [`toUInt64OrDefault`](#toUInt64OrDefault).

**Синтаксис**

```sql
toUInt64OrZero(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа UInt64, в противном случае `0`, если преобразование не удалось. [`UInt64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt64OrZero('64'),
    toUInt64OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt64OrZero('64'):  64
toUInt64OrZero('abc'): 0
```


## toUInt8 \{#toUInt8\}

Появилась в версии: v1.1

Преобразует входное значение в значение типа [`UInt8`](../data-types/int-uint.md).
В случае ошибки выбрасывает исключение.

Поддерживаемые аргументы:

* Значения или строковые представления типов (U)Int*.
* Значения типов Float*.

Неподдерживаемые аргументы:

* Строковые представления значений типов Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toUInt8('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [UInt8](../data-types/int-uint.md), происходит переполнение или выход результата за нижнюю границу диапазона (underflow).
Это не считается ошибкой.
Например: `SELECT toUInt8(256) == 0;`.
:::

:::note
Функция использует [округление к нулю](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), то есть отбрасывает дробную часть числа.
:::

См. также:

* [`toUInt8OrZero`](#toUInt8OrZero).
* [`toUInt8OrNull`](#toUInt8OrNull).
* [`toUInt8OrDefault`](#toUInt8OrDefault).

**Синтаксис**

```sql
toUInt8(expr)
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Возвращает 8-битное беззнаковое целое число. [`UInt8`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt8(8),
    toUInt8(8.8),
    toUInt8('8')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt8(8):   8
toUInt8(8.8): 8
toUInt8('8'): 8
```


## toUInt8OrDefault \{#toUInt8OrDefault\}

Добавлено в: v21.11

Подобно [`toUInt8`](#toUInt8), эта функция преобразует входное значение в значение типа [UInt8](../data-types/int-uint.md), но возвращает значение по умолчанию в случае ошибки.
Если значение `default` не передано, то в случае ошибки возвращается `0`.

**Синтаксис**

```sql
toUInt8OrDefault(expr[, default])
```

**Аргументы**

* `expr` — выражение, возвращающее число или строковое представление числа. [`String`](/sql-reference/data-types/string) или [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)
* `default` — необязательный параметр. Значение по умолчанию, которое возвращается, если разобрать значение не удалось. [`UInt8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает значение типа `UInt8` при успешном преобразовании, в противном случае возвращает значение по умолчанию, если оно передано, или `0`, если нет. [`UInt8`](/sql-reference/data-types/int-uint)

**Примеры**

**Успешное преобразование**

```sql title=Query
SELECT toUInt8OrDefault('8', CAST('0', 'UInt8'))
```

```response title=Response
8
```

**Ошибка преобразования**

```sql title=Query
SELECT toUInt8OrDefault('abc', CAST('0', 'UInt8'))
```

```response title=Response
0
```


## toUInt8OrNull \{#toUInt8OrNull\}

Введена в версии v1.1

Как и [`toUInt8`](#toUInt8), эта функция преобразует входное значение в значение типа [`UInt8`](../data-types/int-uint.md), но возвращает `NULL` в случае ошибки.

Поддерживаемые аргументы:

* Строковые представления значений типов (U)Int8/16/32/128/256.

Неподдерживаемые аргументы (возвращают `NULL`):

* Строковые представления обычных чисел с плавающей точкой (Float*), включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например `SELECT toUInt8OrNull('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах типа [`UInt8`](../data-types/int-uint.md), происходит переполнение или выход результата за пределы диапазона.
Это не считается ошибкой.
:::

См. также:

* [`toUInt8`](#toUInt8).
* [`toUInt8OrZero`](#toUInt8OrZero).
* [`toUInt8OrDefault`](#toUInt8OrDefault).

**Синтаксис**

```sql
toUInt8OrNull(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа UInt8, в противном случае при неудачном преобразовании — `NULL`. [`UInt8`](/sql-reference/data-types/int-uint) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt8OrNull('42'),
    toUInt8OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt8OrNull('42'):  42
toUInt8OrNull('abc'): \N
```


## toUInt8OrZero \{#toUInt8OrZero\}

Введена в: v1.1

Как и [`toUInt8`](#toUInt8), эта функция преобразует входное значение в значение типа [`UInt8`](../data-types/int-uint.md), но возвращает `0` в случае ошибки.

Поддерживаемые аргументы:

* Строковые представления целочисленных значений типов (U)Int8/16/32/128/256.

Неподдерживаемые аргументы (возвращают `0`):

* Строковые представления обычных значений типов Float*, включая `NaN` и `Inf`.
* Строковые представления двоичных и шестнадцатеричных значений, например: `SELECT toUInt8OrZero('0xc0fe');`.

:::note
Если входное значение не может быть представлено в пределах диапазона [`UInt8`](../data-types/int-uint.md), происходит переполнение или выход результата за пределы диапазона.
Это не считается ошибкой.
:::

См. также:

* [`toUInt8`](#toUInt8).
* [`toUInt8OrNull`](#toUInt8OrNull).
* [`toUInt8OrDefault`](#toUInt8OrDefault).

**Синтаксис**

```sql
toUInt8OrZero(x)
```

**Аргументы**

* `x` — строковое представление числа. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение типа UInt8, в противном случае — `0`, если преобразование выполнить не удалось. [`UInt8`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUInt8OrZero('-8'),
    toUInt8OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt8OrZero('-8'):  0
toUInt8OrZero('abc'): 0
```


## toUUID \{#toUUID\}

Введено в версии: v1.1

Преобразует значение типа String в значение типа UUID.

**Синтаксис**

```sql
toUUID(string)
```

**Аргументы**

* `string` — UUID в виде строки. [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)

**Возвращаемое значение**

Возвращает UUID на основе его строкового представления. [`UUID`](/sql-reference/data-types/uuid)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toUUID('61f0c404-5cb3-11e7-907b-a6006ad3dba0') AS uuid
```

```response title=Response
┌─────────────────────────────────uuid─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0 │
└──────────────────────────────────────┘
```


## toUUIDOrZero \{#toUUIDOrZero\}

Добавлена в версии: v20.12

Преобразует входное значение в значение типа [UUID](../data-types/uuid.md), но в случае ошибки возвращает нулевой UUID.
Аналогична [`toUUID`](/sql-reference/functions/type-conversion-functions#toUUID), но возвращает нулевой UUID (`00000000-0000-0000-0000-000000000000`) вместо генерации исключения при ошибках преобразования.

Поддерживаемые аргументы:

* Строковые представления UUID в стандартном формате (8-4-4-4-12 шестнадцатеричных цифр).
* Строковые представления UUID без дефисов (32 шестнадцатеричные цифры).

Неподдерживаемые аргументы (возвращают нулевой UUID):

* Неверные строковые форматы.
* Типы, отличные от строк.

**Синтаксис**

```sql
toUUIDOrZero(x)
```

**Аргументы**

* `x` — строковое представление UUID. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение UUID в случае успеха, иначе — нулевой UUID (`00000000-0000-0000-0000-000000000000`). [`UUID`](/sql-reference/data-types/uuid)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    toUUIDOrZero('550e8400-e29b-41d4-a716-446655440000') AS valid_uuid,
    toUUIDOrZero('invalid-uuid') AS invalid_uuid
```

```response title=Response
┌─valid_uuid───────────────────────────┬─invalid_uuid─────────────────────────┐
│ 550e8400-e29b-41d4-a716-446655440000 │ 00000000-0000-0000-0000-000000000000 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## toUnixTimestamp64Micro \{#toUnixTimestamp64Micro\}

Введена в версии: v20.5

Преобразует значение типа [`DateTime64`](/sql-reference/data-types/datetime64) в значение типа [`Int64`](/sql-reference/data-types/int-uint) с фиксированной точностью до микросекунд.
Входное значение масштабируется в большую или меньшую сторону в зависимости от его точности.

:::note
Результирующее значение задаётся относительно UTC, а не относительно часового пояса входного значения.
:::

**Синтаксис**

```sql
toUnixTimestamp64Micro(value)
```

**Аргументы**

* `value` — значение типа DateTime64 с любой точностью. [`DateTime64`](/sql-reference/data-types/datetime64)

**Возвращаемое значение**

Возвращает Unix‑метку времени в микросекундах. [`Int64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH toDateTime64('2025-02-13 23:31:31.011123', 6, 'UTC') AS dt64
SELECT toUnixTimestamp64Micro(dt64);
```

```response title=Response
┌─toUnixTimestamp64Micro(dt64)─┐
│               1739489491011123 │
└────────────────────────────────┘
```


## toUnixTimestamp64Milli \{#toUnixTimestamp64Milli\}

Добавлена в версии: v20.5

Преобразует значение типа [`DateTime64`](/sql-reference/data-types/datetime64) в значение типа [`Int64`](/sql-reference/data-types/int-uint) с фиксированной точностью до миллисекунд.
Входное значение соответствующим образом масштабируется (увеличивается или уменьшается) в зависимости от его точности.

:::note
Возвращаемое значение отсчитывается относительно UTC, а не относительно часового пояса входного значения.
:::

**Синтаксис**

```sql
toUnixTimestamp64Milli(value)
```

**Аргументы**

* `value` — значение типа DateTime64 с любой точностью. [`DateTime64`](/sql-reference/data-types/datetime64)

**Возвращаемое значение**

Возвращает Unix‑метку времени в миллисекундах. [`Int64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH toDateTime64('2025-02-13 23:31:31.011', 3, 'UTC') AS dt64
SELECT toUnixTimestamp64Milli(dt64);
```

```response title=Response
┌─toUnixTimestamp64Milli(dt64)─┐
│                1739489491011 │
└──────────────────────────────┘
```


## toUnixTimestamp64Nano \{#toUnixTimestamp64Nano\}

Впервые представлена в версии v20.5

Преобразует [`DateTime64`](/sql-reference/data-types/datetime64) в значение [`Int64`](/sql-reference/functions/type-conversion-functions#toInt64) с фиксированной наносекундной точностью.
Входное значение масштабируется вверх или вниз в зависимости от его точности.

:::note
Выходное значение задаётся относительно UTC, а не относительно часового пояса исходного значения.
:::

**Синтаксис**

```sql
toUnixTimestamp64Nano(value)
```

**Аргументы**

* `value` — значение типа DateTime64 с любой точностью. [`DateTime64`](/sql-reference/data-types/datetime64)

**Возвращаемое значение**

Возвращает метку времени Unix в наносекундах. [`Int64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH toDateTime64('2025-02-13 23:31:31.011123456', 9, 'UTC') AS dt64
SELECT toUnixTimestamp64Nano(dt64);
```

```response title=Response
┌─toUnixTimestamp64Nano(dt64)────┐
│            1739489491011123456 │
└────────────────────────────────┘
```


## toUnixTimestamp64Second \{#toUnixTimestamp64Second\}

Добавлено в: v24.12

Преобразует [`DateTime64`](/sql-reference/data-types/datetime64) в значение [`Int64`](/sql-reference/data-types/int-uint) с фиксированной секундной точностью.
Входное значение масштабируется вверх или вниз в зависимости от его точности.

:::note
Выходное значение задаётся относительно UTC, а не относительно часового пояса входного значения.
:::

**Синтаксис**

```sql
toUnixTimestamp64Second(value)
```

**Аргументы**

* `value` — значение DateTime64 с любой точностью. [`DateTime64`](/sql-reference/data-types/datetime64)

**Возвращаемое значение**

Возвращает Unix-метку времени в секундах. [`Int64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH toDateTime64('2025-02-13 23:31:31.011', 3, 'UTC') AS dt64
SELECT toUnixTimestamp64Second(dt64);
```

```response title=Response
┌─toUnixTimestamp64Second(dt64)─┐
│                    1739489491 │
└───────────────────────────────┘
```

{/*AUTOGENERATED_END*/ }
