---
description: 'Документация для функций работы с датами и временем'
sidebar_label: 'Даты и Время'
sidebar_position: 45
slug: /sql-reference/functions/date-time-functions
title: 'Функции для работы с датами и временем'
---

# Функции для работы с датами и временем

Большинство функций в этом разделе принимают необязательный аргумент часового пояса, например `Europe/Amsterdam`. В этом случае используется указанный часовой пояс вместо локального (по умолчанию).

**Пример**

```sql
SELECT
    toDateTime('2016-06-15 23:00:00') AS time,
    toDate(time) AS date_local,
    toDate(time, 'Asia/Yekaterinburg') AS date_yekat,
    toString(time, 'US/Samoa') AS time_samoa
```

```text
┌────────────────time─┬─date_local─┬─date_yekat─┬─time_samoa──────────┐
│ 2016-06-15 23:00:00 │ 2016-06-15 │ 2016-06-16 │ 2016-06-15 09:00:00 │
└─────────────────────┴────────────┴────────────┴─────────────────────┘
```
## makeDate {#makedate}

Создает [Date](../data-types/date.md)
- из аргументов год, месяц и день, или
- из аргументов год и номер дня в году.

**Синтаксис**

```sql
makeDate(year, month, day);
makeDate(year, day_of_year);
```

Псевдонимы:
- `MAKEDATE(year, month, day);`
- `MAKEDATE(year, day_of_year);`

**Аргументы**

- `year` — Год. [Целое число](../data-types/int-uint.md), [С плавающей запятой](../data-types/float.md) или [Десятичное](../data-types/decimal.md).
- `month` — Месяц. [Целое число](../data-types/int-uint.md), [С плавающей запятой](../data-types/float.md) или [Десятичное](../data-types/decimal.md).
- `day` — День. [Целое число](../data-types/int-uint.md), [С плавающей запятой](../data-types/float.md) или [Десятичное](../data-types/decimal.md).
- `day_of_year` — Номер дня в году. [Целое число](../data-types/int-uint.md), [С плавающей запятой](../data-types/float.md) или [Десятичное](../data-types/decimal.md).

**Возвращаемое значение**

- Дата, созданная из аргументов. [Date](../data-types/date.md).

**Пример**

Создать дату из года, месяца и дня:

```sql
SELECT makeDate(2023, 2, 28) AS Date;
```

Результат:

```text
┌───────date─┐
│ 2023-02-28 │
└────────────┘
```

Создать дату из года и номера дня в году:

```sql
SELECT makeDate(2023, 42) AS Date;
```

Результат:

```text
┌───────date─┐
│ 2023-02-11 │
└────────────┘
```
## makeDate32 {#makedate32}

Создает дату типа [Date32](../../sql-reference/data-types/date32.md) из года, месяца, дня (или опционально года и дня).

**Синтаксис**

```sql
makeDate32(year, [month,] day)
```

**Аргументы**

- `year` — Год. [Целое число](../../sql-reference/data-types/int-uint.md), [С плавающей запятой](../../sql-reference/data-types/float.md) или [Десятичное](../../sql-reference/data-types/decimal.md).
- `month` — Месяц (необязательный). [Целое число](../../sql-reference/data-types/int-uint.md), [С плавающей запятой](../../sql-reference/data-types/float.md) или [Десятичное](../../sql-reference/data-types/decimal.md).
- `day` — День. [Целое число](../../sql-reference/data-types/int-uint.md), [С плавающей запятой](../../sql-reference/data-types/float.md) или [Десятичное](../../sql-reference/data-types/decimal.md).

:::note
Если `month` опущен, то `day` должен принимать значение от `1` до `365`, в противном случае оно должно принимать значение от `1` до `31`.
:::

**Возвращаемые значения**

- Дата, созданная из аргументов. [Date32](../../sql-reference/data-types/date32.md).

**Примеры**

Создать дату из года, месяца и дня:

Запрос:

```sql
SELECT makeDate32(2024, 1, 1);
```

Результат:

```response
2024-01-01
```

Создать дату из года и номера дня в году:

Запрос:

```sql
SELECT makeDate32(2024, 100);
```

Результат:

```response
2024-04-09
```
## makeDateTime {#makedatetime}

Создает [DateTime](../data-types/datetime.md) из аргументов года, месяца, дня, часа, минуты и секунды.

**Синтаксис**

```sql
makeDateTime(year, month, day, hour, minute, second[, timezone])
```

**Аргументы**

- `year` — Год. [Целое число](../data-types/int-uint.md), [С плавающей запятой](../data-types/float.md) или [Десятичное](../data-types/decimal.md).
- `month` — Месяц. [Целое число](../data-types/int-uint.md), [С плавающей запятой](../data-types/float.md) или [Десятичное](../data-types/decimal.md).
- `day` — День. [Целое число](../data-types/int-uint.md), [С плавающей запятой](../data-types/float.md) или [Десятичное](../data-types/decimal.md).
- `hour` — Час. [Целое число](../data-types/int-uint.md), [С плавающей запятой](../data-types/float.md) или [Десятичное](../data-types/decimal.md).
- `minute` — Минута. [Целое число](../data-types/int-uint.md), [С плавающей запятой](../data-types/float.md) или [Десятичное](../data-types/decimal.md).
- `second` — Секунда. [Целое число](../data-types/int-uint.md), [С плавающей запятой](../data-types/float.md) или [Десятичное](../data-types/decimal.md).
- `timezone` — [Часовой пояс](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения (необязательный).

**Возвращаемое значение**

- Дата и время, созданные из аргументов. [DateTime](../data-types/datetime.md).

**Пример**

```sql
SELECT makeDateTime(2023, 2, 28, 17, 12, 33) AS DateTime;
```

Результат:

```text
┌────────────DateTime─┐
│ 2023-02-28 17:12:33 │
└─────────────────────┘
```
## makeDateTime64 {#makedatetime64}

Создает значение типа [DateTime64](../../sql-reference/data-types/datetime64.md) из его компонентов: год, месяц, день, час, минута, секунда. С опциональной точностью до субсекунд.

**Синтаксис**

```sql
makeDateTime64(year, month, day, hour, minute, second[, precision])
```

**Аргументы**

- `year` — Год (0-9999). [Целое число](../../sql-reference/data-types/int-uint.md), [С плавающей запятой](../../sql-reference/data-types/float.md) или [Десятичное](../../sql-reference/data-types/decimal.md).
- `month` — Месяц (1-12). [Целое число](../../sql-reference/data-types/int-uint.md), [С плавающей запятой](../../sql-reference/data-types/float.md) или [Десятичное](../../sql-reference/data-types/decimal.md).
- `day` — День (1-31). [Целое число](../../sql-reference/data-types/int-uint.md), [С плавающей запятой](../../sql-reference/data-types/float.md) или [Десятичное](../../sql-reference/data-types/decimal.md).
- `hour` — Час (0-23). [Целое число](../../sql-reference/data-types/int-uint.md), [С плавающей запятой](../../sql-reference/data-types/float.md) или [Десятичное](../../sql-reference/data-types/decimal.md).
- `minute` — Минута (0-59). [Целое число](../../sql-reference/data-types/int-uint.md), [С плавающей запятой](../../sql-reference/data-types/float.md) или [Десятичное](../../sql-reference/data-types/decimal.md).
- `second` — Секунда (0-59). [Целое число](../../sql-reference/data-types/int-uint.md), [С плавающей запятой](../../sql-reference/data-types/float.md) или [Десятичное](../../sql-reference/data-types/decimal.md).
- `precision` — Опциональная точность компонента субсекунд (0-9). [Целое число](../../sql-reference/data-types/int-uint.md).

**Возвращаемое значение**

- Дата и время, созданные из предоставленных аргументов. [DateTime64](../../sql-reference/data-types/datetime64.md).

**Пример**

```sql
SELECT makeDateTime64(2023, 5, 15, 10, 30, 45, 779, 5);
```

```response
┌─makeDateTime64(2023, 5, 15, 10, 30, 45, 779, 5)─┐
│                       2023-05-15 10:30:45.00779 │
└─────────────────────────────────────────────────┘
```
## timestamp {#timestamp}

Преобразует первый аргумент 'expr' в тип [DateTime64(6)](../data-types/datetime64.md).
Если предоставлен второй аргумент 'expr_time', он добавляет указанное время к преобразованному значению.

**Синтаксис**

```sql
timestamp(expr[, expr_time])
```

Псевдоним: `TIMESTAMP`

**Аргументы**

- `expr` - Дата или дата с временем. [Строка](../data-types/string.md).
- `expr_time` - Необязательный параметр. Время для добавления. [Строка](../data-types/string.md).

**Примеры**

```sql
SELECT timestamp('2023-12-31') as ts;
```

Результат:

```text
┌─────────────────────────ts─┐
│ 2023-12-31 00:00:00.000000 │
└────────────────────────────┘
```

```sql
SELECT timestamp('2023-12-31 12:00:00', '12:00:00.11') as ts;
```

Результат:

```text
┌─────────────────────────ts─┐
│ 2024-01-01 00:00:00.110000 │
└────────────────────────────┘
```

**Возвращаемое значение**

- [DateTime64](../data-types/datetime64.md)(6)
## timeZone {#timezone}

Возвращает часовой пояс текущей сессии, т.е. значение настройки [session_timezone](../../operations/settings/settings.md#session_timezone).
Если функция выполняется в контексте распределенной таблицы, то она создает нормальный столбец со значениями, относящимися к каждому шард, в противном случае возвращает постоянное значение.

**Синтаксис**

```sql
timeZone()
```

Псевдоним: `timezone`.

**Возвращаемое значение**

- Часовой пояс. [Строка](../data-types/string.md).

**Пример**

```sql
SELECT timezone()
```

Результат:

```response
┌─timezone()─────┐
│ America/Denver │
└────────────────┘
```

**Смотрите также**

- [serverTimeZone](#servertimezone)
## serverTimeZone {#servertimezone}

Возвращает часовой пояс сервера, т.е. значение настройки [timezone](../../operations/server-configuration-parameters/settings.md#timezone).
Если функция выполняется в контексте распределенной таблицы, то она создает нормальный столбец со значениями, относящимися к каждому шард. В противном случае возвращает постоянное значение.

**Синтаксис**

```sql
serverTimeZone()
```

Псевдоним: `serverTimezone`.

**Возвращаемое значение**

- Часовой пояс. [Строка](../data-types/string.md).

**Пример**

```sql
SELECT serverTimeZone()
```

Результат:

```response
┌─serverTimeZone()─┐
│ UTC              │
└──────────────────┘
```

**Смотрите также**

- [timeZone](#timezone)
## toTimeZone {#totimezone}

Преобразует дату или дату с временем в указанный часовой пояс. Не изменяет внутреннее значение (количество unix-секунд) данных, только атрибут часового пояса значения и строковое представление значения изменяются.

**Синтаксис**

```sql
toTimezone(value, timezone)
```

Псевдоним: `toTimezone`.

**Аргументы**

- `value` — Время или дата и время. [DateTime64](../data-types/datetime64.md).
- `timezone` — Часовой пояс для возвращаемого значения. [Строка](../data-types/string.md). Этот аргумент является постоянным, потому что `toTimezone` изменяет часовой пояс столбца (часовой пояс является атрибутом типов `DateTime*`).

**Возвращаемое значение**

- Дата и время. [DateTime](../data-types/datetime.md).

**Пример**

```sql
SELECT toDateTime('2019-01-01 00:00:00', 'UTC') AS time_utc,
    toTypeName(time_utc) AS type_utc,
    toInt32(time_utc) AS int32utc,
    toTimeZone(time_utc, 'Asia/Yekaterinburg') AS time_yekat,
    toTypeName(time_yekat) AS type_yekat,
    toInt32(time_yekat) AS int32yekat,
    toTimeZone(time_utc, 'US/Samoa') AS time_samoa,
    toTypeName(time_samoa) AS type_samoa,
    toInt32(time_samoa) AS int32samoa
FORMAT Vertical;
```

Результат:

```text
Row 1:
──────
time_utc:   2019-01-01 00:00:00
type_utc:   DateTime('UTC')
int32utc:   1546300800
time_yekat: 2019-01-01 05:00:00
type_yekat: DateTime('Asia/Yekaterinburg')
int32yekat: 1546300800
time_samoa: 2018-12-31 13:00:00
type_samoa: DateTime('US/Samoa')
int32samoa: 1546300800
```

**Смотрите также**

- [formatDateTime](#formatdatetime) - поддерживает неконстантный часовой пояс.
- [toString](type-conversion-functions.md#tostring) - поддерживает неконстантный часовой пояс.
## timeZoneOf {#timezoneof}

Возвращает название часового пояса типов [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

**Синтаксис**

```sql
timeZoneOf(value)
```

Псевдоним: `timezoneOf`.

**Аргументы**

- `value` — Дата и время. [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

- Название часового пояса. [Строка](../data-types/string.md).

**Пример**

```sql
SELECT timezoneOf(now());
```

Результат:
```text
┌─timezoneOf(now())─┐
│ Etc/UTC           │
└───────────────────┘
```
## timeZoneOffset {#timezoneoffset}

Возвращает смещение часового пояса в секундах от [UTC](https://en.wikipedia.org/wiki/Coordinated_Universal_Time).
Функция учитывает [летнее время](https://en.wikipedia.org/wiki/Daylight_saving_time) и исторические изменения часового пояса на указанную дату и время.
Для вычисления смещения используется [база данных часовых поясов IANA](https://www.iana.org/time-zones).

**Синтаксис**

```sql
timeZoneOffset(value)
```

Псевдоним: `timezoneOffset`.

**Аргументы**

- `value` — Дата и время. [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

- Смещение от UTC в секундах. [Int32](../data-types/int-uint.md).

**Пример**

```sql
SELECT toDateTime('2021-04-21 10:20:30', 'America/New_York') AS Time, toTypeName(Time) AS Type,
       timeZoneOffset(Time) AS Offset_in_seconds, (Offset_in_seconds / 3600) AS Offset_in_hours;
```

Результат:

```text
┌────────────────Time─┬─Type─────────────────────────┬─Offset_in_seconds─┬─Offset_in_hours─┐
│ 2021-04-21 10:20:30 │ DateTime('America/New_York') │            -14400 │              -4 │
└─────────────────────┴──────────────────────────────┴───────────────────┴─────────────────┘
```
## toYear {#toyear}

Возвращает компонент года (н.э.) из даты или даты с временем.

**Синтаксис**

```sql
toYear(value)
```

Псевдоним: `YEAR`

**Аргументы**

- `value` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Год указанной даты/времени. [UInt16](../data-types/int-uint.md).

**Пример**

```sql
SELECT toYear(toDateTime('2023-04-21 10:20:30'))
```

Результат:

```response
┌─toYear(toDateTime('2023-04-21 10:20:30'))─┐
│                                      2023 │
└───────────────────────────────────────────┘
```
## toQuarter {#toquarter}

Возвращает квартал (1-4) даты или даты с временем.

**Синтаксис**

```sql
toQuarter(value)
```

Псевдоним: `QUARTER`

**Аргументы**

- `value` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Квартал года (1, 2, 3 или 4) указанной даты/времени. [UInt8](../data-types/int-uint.md).

**Пример**

```sql
SELECT toQuarter(toDateTime('2023-04-21 10:20:30'))
```

Результат:

```response
┌─toQuarter(toDateTime('2023-04-21 10:20:30'))─┐
│                                            2 │
└──────────────────────────────────────────────┘
```
## toMonth {#tomonth}

Возвращает компонент месяца (1-12) даты или даты с временем.

**Синтаксис**

```sql
toMonth(value)
```

Псевдоним: `MONTH`

**Аргументы**

- `value` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Месяц года (1 - 12) указанной даты/времени. [UInt8](../data-types/int-uint.md).

**Пример**

```sql
SELECT toMonth(toDateTime('2023-04-21 10:20:30'))
```

Результат:

```response
┌─toMonth(toDateTime('2023-04-21 10:20:30'))─┐
│                                          4 │
└────────────────────────────────────────────┘
```
## toDayOfYear {#todayofyear}

Возвращает номер дня в году (1-366) даты или даты с временем.

**Синтаксис**

```sql
toDayOfYear(value)
```

Псевдоним: `DAYOFYEAR`

**Аргументы**

- `value` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Номер дня в году (1 - 366) указанной даты/времени. [UInt16](../data-types/int-uint.md).

**Пример**

```sql
SELECT toDayOfYear(toDateTime('2023-04-21 10:20:30'))
```

Результат:

```response
┌─toDayOfYear(toDateTime('2023-04-21 10:20:30'))─┐
│                                            111 │
└────────────────────────────────────────────────┘
```
## toDayOfMonth {#todayofmonth}

Возвращает номер дня в месяце (1-31) даты или даты с временем.

**Синтаксис**

```sql
toDayOfMonth(value)
```

Псевдонимы: `DAYOFMONTH`, `DAY`

**Аргументы**

- `value` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Номер дня в месяце (1 - 31) указанной даты/времени. [UInt8](../data-types/int-uint.md).

**Пример**

```sql
SELECT toDayOfMonth(toDateTime('2023-04-21 10:20:30'))
```

Результат:

```response
┌─toDayOfMonth(toDateTime('2023-04-21 10:20:30'))─┐
│                                              21 │
└─────────────────────────────────────────────────┘
```
## toDayOfWeek {#todayofweek}

Возвращает номер дня в неделе даты или даты с временем.

Двухаргументная форма `toDayOfWeek()` позволяет вам указать, начинается ли неделя с понедельника или воскресенья, и должен ли возвращаемый результат находиться в диапазоне от 0 до 6 или от 1 до 7. Если аргумент режима опущен, по умолчанию используется режим 0. Часовой пояс даты можно указать в качестве третьего аргумента.

| Режим | Первый день недели | Диапазон                                          |
|-------|--------------------|--------------------------------------------------|
| 0     | Понедельник        | 1-7: Понедельник = 1, Вторник = 2, ..., Воскресенье = 7  |
| 1     | Понедельник        | 0-6: Понедельник = 0, Вторник = 1, ..., Воскресенье = 6  |
| 2     | Воскресенье        | 0-6: Воскресенье = 0, Понедельник = 1, ..., Суббота = 6 |
| 3     | Воскресенье        | 1-7: Воскресенье = 1, Понедельник = 2, ..., Суббота = 7 |

**Синтаксис**

```sql
toDayOfWeek(t[, mode[, timezone]])
```

Псевдоним: `DAYOFWEEK`.

**Аргументы**

- `t` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)
- `mode` - определяет, какой первый день недели. Возможные значения: 0, 1, 2 или 3. См. таблицу выше для различий.
- `timezone` - необязательный параметр, он ведет себя как любая другая функция преобразования

Первый аргумент также может быть указан как [Строка](../data-types/string.md) в формате, поддерживаемом [parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort). Поддержка строковых аргументов существует только по причинам совместимости с MySQL, на которые рассчитывают определенные сторонние инструменты. Поскольку поддержка строковых аргументов в будущем может быть сделана зависимой от новых настроек совместимости с MySQL и потому, что парсинг строк обычно медленный, рекомендуется не использовать его.

**Возвращаемое значение**

- День недели (1-7), в зависимости от выбранного режима, указанной даты/времени

**Пример**

Следующая дата - 21 апреля 2023 года, который был пятницей:

```sql
SELECT
    toDayOfWeek(toDateTime('2023-04-21')),
    toDayOfWeek(toDateTime('2023-04-21'), 1)
```

Результат:

```response
┌─toDayOfWeek(toDateTime('2023-04-21'))─┬─toDayOfWeek(toDateTime('2023-04-21'), 1)─┐
│                                     5 │                                        4 │
└───────────────────────────────────────┴──────────────────────────────────────────┘
```
## toHour {#tohour}

Возвращает часовую компоненту (0-24) даты с временем.

Предполагает, что если часы переводятся вперед, то на один час и происходит это в 2 часа, а если часы переводятся назад, то на один час и происходит это в 3 часа. (что не всегда именно так происходит - это зависит от часового пояса).

**Синтаксис**

```sql
toHour(value)
```

Псевдоним: `HOUR`

**Аргументы**

- `value` - [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Час дня (0 - 23) указанной даты/времени. [UInt8](../data-types/int-uint.md).

**Пример**

```sql
SELECT toHour(toDateTime('2023-04-21 10:20:30'))
```

Результат:

```response
┌─toHour(toDateTime('2023-04-21 10:20:30'))─┐
│                                        10 │
└───────────────────────────────────────────┘
```
## toMinute {#tominute}

Возвращает минутную компоненту (0-59) даты с временем.

**Синтаксис**

```sql
toMinute(value)
```

Псевдоним: `MINUTE`

**Аргументы**

- `value` - [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Минута часа (0 - 59) указанной даты/времени. [UInt8](../data-types/int-uint.md).

**Пример**

```sql
SELECT toMinute(toDateTime('2023-04-21 10:20:30'))
```

Результат:

```response
┌─toMinute(toDateTime('2023-04-21 10:20:30'))─┐
│                                          20 │
└─────────────────────────────────────────────┘
```
## toSecond {#tosecond}

Возвращает секунду (0-59) даты с временем. Високосные секунды не учитываются.

**Синтаксис**

```sql
toSecond(value)
```

Псевдоним: `SECOND`

**Аргументы**

- `value` - [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Секунда в минуте (0 - 59) указанной даты/времени. [UInt8](../data-types/int-uint.md).

**Пример**

```sql
SELECT toSecond(toDateTime('2023-04-21 10:20:30'))
```

Результат:

```response
┌─toSecond(toDateTime('2023-04-21 10:20:30'))─┐
│                                          30 │
└─────────────────────────────────────────────┘
```
## toMillisecond {#tomillisecond}

Возвращает миллисекундную компоненту (0-999) даты с временем.

**Синтаксис**

```sql
toMillisecond(value)
```

*Аргументы**

- `value` - [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

Псевдоним: `MILLISECOND`

```sql
SELECT toMillisecond(toDateTime64('2023-04-21 10:20:30.456', 3))
```

Результат:

```response
┌──toMillisecond(toDateTime64('2023-04-21 10:20:30.456', 3))─┐
│                                                        456 │
└────────────────────────────────────────────────────────────┘
```

**Возвращаемое значение**

- Миллисекунда в минуте (0 - 59) указанной даты/времени. [UInt16](../data-types/int-uint.md).
## toUnixTimestamp {#tounixtimestamp}

Преобразует строку, дату или дату с временем в [Unix Timestamp](https://en.wikipedia.org/wiki/Unix_time) в представлении `UInt32`.

Если функция вызывается со строкой, она принимает необязательный аргумент часового пояса.

**Синтаксис**

```sql
toUnixTimestamp(date)
toUnixTimestamp(str, [timezone])
```

**Возвращаемое значение**

- Возвращает Unix timestamp. [UInt32](../data-types/int-uint.md).

**Пример**

```sql
SELECT
    '2017-11-05 08:07:47' AS dt_str,
    toUnixTimestamp(dt_str) AS from_str,
    toUnixTimestamp(dt_str, 'Asia/Tokyo') AS from_str_tokyo,
    toUnixTimestamp(toDateTime(dt_str)) AS from_datetime,
    toUnixTimestamp(toDateTime64(dt_str, 0)) AS from_datetime64,
    toUnixTimestamp(toDate(dt_str)) AS from_date,
    toUnixTimestamp(toDate32(dt_str)) AS from_date32
FORMAT Vertical;
```

Результат:

```text
Row 1:
──────
dt_str:          2017-11-05 08:07:47
from_str:        1509869267
from_str_tokyo:  1509836867
from_datetime:   1509869267
from_datetime64: 1509869267
from_date:       1509840000
from_date32:     1509840000
```

:::note
Тип возвращаемого значения `toStartOf*`, `toLastDayOf*`, `toMonday`, `timeSlot` функций, описанных ниже, определяется параметром конфигурации [enable_extended_results_for_datetime_functions](/operations/settings/settings#enable_extended_results_for_datetime_functions), который по умолчанию равен `0`.

Поведение для
* `enable_extended_results_for_datetime_functions = 0`:
  * Функции `toStartOfYear`, `toStartOfISOYear`, `toStartOfQuarter`, `toStartOfMonth`, `toStartOfWeek`, `toLastDayOfWeek`, `toLastDayOfMonth`, `toMonday` возвращают `Date` или `DateTime`.
  * Функции `toStartOfDay`, `toStartOfHour`, `toStartOfFifteenMinutes`, `toStartOfTenMinutes`, `toStartOfFiveMinutes`, `toStartOfMinute`, `timeSlot` возвращают `DateTime`. Хотя эти функции могут принимать значения расширенных типов `Date32` и `DateTime64` в качестве аргумента, передача им времени за пределами нормального диапазона (год 1970 до 2149 для `Date` / 2106 для `DateTime`) приведет к неправильным результатам.
* `enable_extended_results_for_datetime_functions = 1`:
  * Функции `toStartOfYear`, `toStartOfISOYear`, `toStartOfQuarter`, `toStartOfMonth`, `toStartOfWeek`, `toLastDayOfWeek`, `toLastDayOfMonth`, `toMonday` возвращают `Date` или `DateTime`, если их аргументом является `Date` или `DateTime`, и возвращают `Date32` или `DateTime64`, если их аргументом является `Date32` или `DateTime64`.
  * Функции `toStartOfDay`, `toStartOfHour`, `toStartOfFifteenMinutes`, `toStartOfTenMinutes`, `toStartOfFiveMinutes`, `toStartOfMinute`, `timeSlot` возвращают `DateTime`, если их аргументом является `Date` или `DateTime`, и возвращают `DateTime64`, если их аргументом является `Date32` или `DateTime64`.
:::
## toStartOfYear {#tostartofyear}

Округляет дату или дату с временем до первого дня года. Возвращает дату в виде объекта `Date`.

**Синтаксис**

```sql
toStartOfYear(value)
```

**Аргументы**

- `value` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Первый день года указанной даты/времени. [Date](../data-types/date.md).

**Пример**

```sql
SELECT toStartOfYear(toDateTime('2023-04-21 10:20:30'))
```

Результат:

```response
┌─toStartOfYear(toDateTime('2023-04-21 10:20:30'))─┐
│                                       2023-01-01 │
└──────────────────────────────────────────────────┘
```
## toStartOfISOYear {#tostartofisoyear}

Округляет дату или дату с временем до первого дня ISO года, который может отличаться от "обычного" года. (См. [https://en.wikipedia.org/wiki/ISO_week_date](https://en.wikipedia.org/wiki/ISO_week_date).)

**Синтаксис**

```sql
toStartOfISOYear(value)
```

**Аргументы**

- `value` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Первый день года указанной даты/времени. [Date](../data-types/date.md).

**Пример**

```sql
SELECT toStartOfISOYear(toDateTime('2023-04-21 10:20:30'))
```

Результат:

```response
┌─toStartOfISOYear(toDateTime('2023-04-21 10:20:30'))─┐
│                                          2023-01-02 │
└─────────────────────────────────────────────────────┘
```
## toStartOfQuarter {#tostartofquarter}

Округляет дату или дату с временем до первого дня квартала. Первым днем квартала является либо 1 января, 1 апреля, 1 июля или 1 октября.
Возвращает дату.

**Синтаксис**

```sql
toStartOfQuarter(value)
```

**Аргументы**

- `value` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Первый день квартала указанной даты/времени. [Date](../data-types/date.md).

**Пример**

```sql
SELECT toStartOfQuarter(toDateTime('2023-04-21 10:20:30'))
```

Результат:

```response
┌─toStartOfQuarter(toDateTime('2023-04-21 10:20:30'))─┐
│                                          2023-04-01 │
└─────────────────────────────────────────────────────┘
```
## toStartOfMonth {#tostartofmonth}

Округляет дату или дату с временем до первого дня месяца. Возвращает дату.

**Синтаксис**

```sql
toStartOfMonth(value)
```

**Аргументы**

- `value` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Первый день месяца указанной даты/времени. [Date](../data-types/date.md).

**Пример**

```sql
SELECT toStartOfMonth(toDateTime('2023-04-21 10:20:30'))
```

Результат:

```response
┌─toStartOfMonth(toDateTime('2023-04-21 10:20:30'))─┐
│                                        2023-04-01 │
└───────────────────────────────────────────────────┘
```

:::note
Поведение разбора неправильных дат зависит от реализации. ClickHouse может вернуть нулевую дату, выбросить исключение или выполнить "естественное" переполнение.
:::
## toLastDayOfMonth {#tolastdayofmonth}

Округляет дату или дату с временем до последнего дня месяца. Возвращает дату.

**Синтаксис**

```sql
toLastDayOfMonth(value)
```

Псевдоним: `LAST_DAY`

**Аргументы**

- `value` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Последний день месяца указанной даты/времени. [Date](../data-types/date.md).

**Пример**

```sql
SELECT toLastDayOfMonth(toDateTime('2023-04-21 10:20:30'))
```

Результат:

```response
┌─toLastDayOfMonth(toDateTime('2023-04-21 10:20:30'))─┐
│                                          2023-04-30 │
└─────────────────────────────────────────────────────┘
```
## toMonday {#tomonday}

Округляет дату или дату с временем до ближайшего понедельника. Возвращает дату.

**Синтаксис**

```sql
toMonday(value)
```

**Аргументы**

- `value` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Дата ближайшего понедельника на или до указанной даты. [Дата](../data-types/date.md).

**Пример**

```sql
SELECT
    toMonday(toDateTime('2023-04-21 10:20:30')), /* пятница */
    toMonday(toDate('2023-04-24')), /* уже понедельник */
```

Результат:

```response
┌─toMonday(toDateTime('2023-04-21 10:20:30'))─┬─toMonday(toDate('2023-04-24'))─┐
│                                  2023-04-17 │                     2023-04-24 │
└─────────────────────────────────────────────┴────────────────────────────────┘
```
## toStartOfWeek {#tostartofweek}

Округляет дату или дату с временем вниз до ближайшего воскресенья или понедельника. Возвращает дату. Аргумент mode работает точно так же, как аргумент mode в функции `toWeek()`. Если режим не указан, по умолчанию используется 0.

**Синтаксис**

```sql
toStartOfWeek(t[, mode[, timezone]])
```

**Аргументы**

- `t` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)
- `mode` - определяет первый день недели, как описано в функции [toWeek()](#toweek)
- `timezone` - необязательный параметр, ведет себя как любая другая функция преобразования

**Возвращаемое значение**

- Дата ближайшего воскресенья или понедельника до или на указанной дате, в зависимости от режима. [Дата](../data-types/date.md).

**Пример**

```sql
SELECT
    toStartOfWeek(toDateTime('2023-04-21 10:20:30')), /* пятница */
    toStartOfWeek(toDateTime('2023-04-21 10:20:30'), 1), /* пятница */
    toStartOfWeek(toDate('2023-04-24')), /* понедельник */
    toStartOfWeek(toDate('2023-04-24'), 1) /* понедельник */
FORMAT Vertical
```

Результат:

```response
Row 1:
──────
toStartOfWeek(toDateTime('2023-04-21 10:20:30')):    2023-04-16
toStartOfWeek(toDateTime('2023-04-21 10:20:30'), 1): 2023-04-17
toStartOfWeek(toDate('2023-04-24')):                 2023-04-23
toStartOfWeek(toDate('2023-04-24'), 1):              2023-04-24
```
## toLastDayOfWeek {#tolastdayofweek}

Округляет дату или дату с временем вверх до ближайшей субботы или воскресенья. Возвращает дату.
Аргумент mode работает точно так же, как аргумент mode в функции `toWeek()`. Если режим не указан, предполагается, что mode равен 0.

**Синтаксис**

```sql
toLastDayOfWeek(t[, mode[, timezone]])
```

**Аргументы**

- `t` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)
- `mode` - определяет последний день недели, как описано в функции [toWeek](#toweek)
- `timezone` - необязательный параметр, ведет себя как любая другая функция преобразования

**Возвращаемое значение**

- Дата ближайшего воскресенья или понедельника на или после указанной даты, в зависимости от режима. [Дата](../data-types/date.md).

**Пример**

```sql
SELECT
    toLastDayOfWeek(toDateTime('2023-04-21 10:20:30')), /* пятница */
    toLastDayOfWeek(toDateTime('2023-04-21 10:20:30'), 1), /* пятница */
    toLastDayOfWeek(toDate('2023-04-22')), /* суббота */
    toLastDayOfWeek(toDate('2023-04-22'), 1) /* суббота */
FORMAT Vertical
```

Результат:

```response
Row 1:
──────
toLastDayOfWeek(toDateTime('2023-04-21 10:20:30')):    2023-04-22
toLastDayOfWeek(toDateTime('2023-04-21 10:20:30'), 1): 2023-04-23
toLastDayOfWeek(toDate('2023-04-22')):                 2023-04-22
toLastDayOfWeek(toDate('2023-04-22'), 1):              2023-04-23
```
## toStartOfDay {#tostartofday}

Округляет дату с временем вниз до начала дня.

**Синтаксис**

```sql
toStartOfDay(value)
```

**Аргументы**

- `value` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Начало дня указанной даты/времени. [DateTime](../data-types/datetime.md).

**Пример**

```sql
SELECT toStartOfDay(toDateTime('2023-04-21 10:20:30'))
```

Результат:

```response
┌─toStartOfDay(toDateTime('2023-04-21 10:20:30'))─┐
│                             2023-04-21 00:00:00 │
└─────────────────────────────────────────────────┘
```
## toStartOfHour {#tostartofhour}

Округляет дату с временем вниз до начала часа.

**Синтаксис**

```sql
toStartOfHour(value)
```

**Аргументы**

- `value` - [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Начало часа указанной даты/времени. [DateTime](../data-types/datetime.md).

**Пример**

```sql
SELECT
    toStartOfHour(toDateTime('2023-04-21 10:20:30')),
    toStartOfHour(toDateTime64('2023-04-21', 6))
```

Результат:

```response
┌─toStartOfHour(toDateTime('2023-04-21 10:20:30'))─┬─toStartOfHour(toDateTime64('2023-04-21', 6))─┐
│                              2023-04-21 10:00:00 │                          2023-04-21 00:00:00 │
└──────────────────────────────────────────────────┴──────────────────────────────────────────────┘
```
## toStartOfMinute {#tostartofminute}

Округляет дату с временем вниз до начала минуты.

**Синтаксис**

```sql
toStartOfMinute(value)
```

**Аргументы**

- `value` - [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Начало минуты указанной даты/времени. [DateTime](../data-types/datetime.md).

**Пример**

```sql
SELECT
    toStartOfMinute(toDateTime('2023-04-21 10:20:30')),
    toStartOfMinute(toDateTime64('2023-04-21 10:20:30.5300', 8))
FORMAT Vertical
```

Результат:

```response
Row 1:
──────
toStartOfMinute(toDateTime('2023-04-21 10:20:30')):           2023-04-21 10:20:00
toStartOfMinute(toDateTime64('2023-04-21 10:20:30.5300', 8)): 2023-04-21 10:20:00
```
## toStartOfSecond {#tostartofsecond}

Отсекает субсекунды.

**Синтаксис**

```sql
toStartOfSecond(value, [timezone])
```

**Аргументы**

- `value` — Дата и время. [DateTime64](../data-types/datetime64.md).
- `timezone` — [Часовой пояс](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения (необязательный). Если не указан, функция использует часовой пояс параметра `value`. [Строка](../data-types/string.md).

**Возвращаемое значение**

- Входное значение без субсекунд. [DateTime64](../data-types/datetime64.md).

**Примеры**

Запрос без часового пояса:

```sql
WITH toDateTime64('2020-01-01 10:20:30.999', 3) AS dt64
SELECT toStartOfSecond(dt64);
```

Результат:

```text
┌───toStartOfSecond(dt64)─┐
│ 2020-01-01 10:20:30.000 │
└─────────────────────────┘
```

Запрос с часовым поясом:

```sql
WITH toDateTime64('2020-01-01 10:20:30.999', 3) AS dt64
SELECT toStartOfSecond(dt64, 'Asia/Istanbul');
```

Результат:

```text
┌─toStartOfSecond(dt64, 'Asia/Istanbul')─┐
│                2020-01-01 13:20:30.000 │
└────────────────────────────────────────┘
```

**Смотрите также**

- [Параметр конфигурации сервера Timezone](../../operations/server-configuration-parameters/settings.md#timezone)
## toStartOfMillisecond {#tostartofmillisecond}

Округляет дату с временем вниз до начала миллисекунд.

**Синтаксис**

```sql
toStartOfMillisecond(value, [timezone])
```

**Аргументы**

- `value` — Дата и время. [DateTime64](../../sql-reference/data-types/datetime64.md).
- `timezone` — [Часовой пояс](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения (необязательный). Если не указан, функция использует часовой пояс параметра `value`. [Строка](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Входное значение с субмиллисекундами. [DateTime64](../../sql-reference/data-types/datetime64.md).

**Примеры**

Запрос без часового пояса:

```sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMillisecond(dt64);
```

Результат:

```text
┌────toStartOfMillisecond(dt64)─┐
│ 2020-01-01 10:20:30.999000000 │
└───────────────────────────────┘
```

Запрос с часовым поясом:

```sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMillisecond(dt64, 'Asia/Istanbul');
```

Результат:

```text
┌─toStartOfMillisecond(dt64, 'Asia/Istanbul')─┐
│               2020-01-01 12:20:30.999000000 │
└─────────────────────────────────────────────┘
```

## toStartOfMicrosecond {#tostartofmicrosecond}

Округляет дату с временем вниз до начала микросекунд.

**Синтаксис**

```sql
toStartOfMicrosecond(value, [timezone])
```

**Аргументы**

- `value` — Дата и время. [DateTime64](../../sql-reference/data-types/datetime64.md).
- `timezone` — [Часовой пояс](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения (необязательный). Если не указан, функция использует часовой пояс параметра `value`. [Строка]( ../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Входное значение с субмикросекундами. [DateTime64](../../sql-reference/data-types/datetime64.md).

**Примеры**

Запрос без часового пояса:

```sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMicrosecond(dt64);
```

Результат:

```text
┌────toStartOfMicrosecond(dt64)─┐
│ 2020-01-01 10:20:30.999999000 │
└───────────────────────────────┘
```

Запрос с часовым поясом:

```sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMicrosecond(dt64, 'Asia/Istanbul');
```

Результат:

```text
┌─toStartOfMicrosecond(dt64, 'Asia/Istanbul')─┐
│               2020-01-01 12:20:30.999999000 │
└─────────────────────────────────────────────┘
```

**Смотрите также**

- [Параметр конфигурации сервера Timezone](../../operations/server-configuration-parameters/settings.md#timezone)
## toStartOfNanosecond {#tostartofnanosecond}

Округляет дату с временем вниз до начала наносекунд.

**Синтаксис**

```sql
toStartOfNanosecond(value, [timezone])
```

**Аргументы**

- `value` — Дата и время. [DateTime64](../../sql-reference/data-types/datetime64.md).
- `timezone` — [Часовой пояс](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения (необязательный). Если не указан, функция использует часовой пояс параметра `value`. [Строка](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Входное значение с наносекундами. [DateTime64](../../sql-reference/data-types/datetime64.md).

**Примеры**

Запрос без часового пояса:

```sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfNanosecond(dt64);
```

Результат:

```text
┌─────toStartOfNanosecond(dt64)─┐
│ 2020-01-01 10:20:30.999999999 │
└───────────────────────────────┘
```

Запрос с часовым поясом:

```sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfNanosecond(dt64, 'Asia/Istanbul');
```

Результат:

```text
┌─toStartOfNanosecond(dt64, 'Asia/Istanbul')─┐
│              2020-01-01 12:20:30.999999999 │
└────────────────────────────────────────────┘
```

**Смотрите также**

- [Параметр конфигурации сервера Timezone](../../operations/server-configuration-parameters/settings.md#timezone)
## toStartOfFiveMinutes {#tostartoffiveminutes}

Округляет дату с временем вниз до начала пятиминутного интервала.

**Синтаксис**

```sql
toStartOfFiveMinutes(value)
```

**Аргументы**

- `value` - [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Начало пятиминутного интервала указанной даты/времени. [DateTime](../data-types/datetime.md).

**Пример**

```sql
SELECT
    toStartOfFiveMinutes(toDateTime('2023-04-21 10:17:00')),
    toStartOfFiveMinutes(toDateTime('2023-04-21 10:20:00')),
    toStartOfFiveMinutes(toDateTime('2023-04-21 10:23:00'))
FORMAT Vertical
```

Результат:

```response
Row 1:
──────
toStartOfFiveMinutes(toDateTime('2023-04-21 10:17:00')): 2023-04-21 10:15:00
toStartOfFiveMinutes(toDateTime('2023-04-21 10:20:00')): 2023-04-21 10:20:00
toStartOfFiveMinutes(toDateTime('2023-04-21 10:23:00')): 2023-04-21 10:20:00
```
## toStartOfTenMinutes {#tostartoftenminutes}

Округляет дату с временем вниз до начала десятиминутного интервала.

**Синтаксис**

```sql
toStartOfTenMinutes(value)
```

**Аргументы**

- `value` - [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Начало десятиминутного интервала указанной даты/времени. [DateTime](../data-types/datetime.md).

**Пример**

```sql
SELECT
    toStartOfTenMinutes(toDateTime('2023-04-21 10:17:00')),
    toStartOfTenMinutes(toDateTime('2023-04-21 10:20:00')),
    toStartOfTenMinutes(toDateTime('2023-04-21 10:23:00'))
FORMAT Vertical
```

Результат:

```response
Row 1:
──────
toStartOfTenMinutes(toDateTime('2023-04-21 10:17:00')): 2023-04-21 10:10:00
toStartOfTenMinutes(toDateTime('2023-04-21 10:20:00')): 2023-04-21 10:20:00
toStartOfTenMinutes(toDateTime('2023-04-21 10:23:00')): 2023-04-21 10:20:00
```
## toStartOfFifteenMinutes {#tostartoffifteenminutes}

Округляет дату с временем вниз до начала пятнадцатиминутного интервала.

**Синтаксис**

```sql
toStartOfFifteenMinutes(value)
```

**Аргументы**

- `value` - [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Начало пятнадцатиминутного интервала указанной даты/времени. [DateTime](../data-types/datetime.md).

**Пример**

```sql
SELECT
    toStartOfFifteenMinutes(toDateTime('2023-04-21 10:17:00')),
    toStartOfFifteenMinutes(toDateTime('2023-04-21 10:20:00')),
    toStartOfFifteenMinutes(toDateTime('2023-04-21 10:23:00'))
FORMAT Vertical
```

Результат:

```response
Row 1:
──────
toStartOfFifteenMinutes(toDateTime('2023-04-21 10:17:00')): 2023-04-21 10:15:00
toStartOfFifteenMinutes(toDateTime('2023-04-21 10:20:00')): 2023-04-21 10:15:00
toStartOfFifteenMinutes(toDateTime('2023-04-21 10:23:00')): 2023-04-21 10:15:00
```
## toStartOfInterval {#tostartofinterval}

Эта функция обобщает другие функции `toStartOf*()` с синтаксисом `toStartOfInterval(date_or_date_with_time, INTERVAL x unit [, time_zone])`.
Например,
- `toStartOfInterval(t, INTERVAL 1 YEAR)` возвращает то же самое, что и `toStartOfYear(t)`,
- `toStartOfInterval(t, INTERVAL 1 MONTH)` возвращает то же самое, что и `toStartOfMonth(t)`,
- `toStartOfInterval(t, INTERVAL 1 DAY)` возвращает то же самое, что и `toStartOfDay(t)`,
- `toStartOfInterval(t, INTERVAL 15 MINUTE)` возвращает то же самое, что и `toStartOfFifteenMinutes(t)`.

Расчет выполняется относительно конкретных моментов времени:

| Интервал    | Начало                  |
|-------------|------------------------|
| ГОД         | год 0                 |
| КВАРТАЛ     | 1900 Q1                |
| МЕСЯЦ       | Январь 1900           |
| НЕДЕЛЯ      | 1970, 1-я неделя (01-05) |
| ДЕНЬ        | 1970-01-01             |
| ЧАС         | (*)                    |
| МИНУТА      | 1970-01-01 00:00:00    |
| СЕКУНДА     | 1970-01-01 00:00:00    |
| МИЛЛИСЕКУНДА| 1970-01-01 00:00:00    |
| МИКРОСЕКУНДА| 1970-01-01 00:00:00    |
| НАНОСЕКУНДА | 1970-01-01 00:00:00    |

(*) интервалы часов являются специальными: расчет всегда выполняется относительно 00:00:00 (полночь) текущего дня. В результате только
    значения часов от 1 до 23 полезны.

Если был указан параметр `WEEK`, `toStartOfInterval` предполагает, что недели начинаются с понедельника. Обратите внимание, что это поведение отличается от функции `toStartOfWeek`, в которой недели по умолчанию начинаются с воскресенья.

**Синтаксис**

```sql
toStartOfInterval(value, INTERVAL x unit[, time_zone])
toStartOfInterval(value, INTERVAL x unit[, origin[, time_zone]])
```
Псевдонимы: `time_bucket`, `date_bin`.

Вторая перегрузка эмулирует функцию `time_bucket()` TimescaleDB, соответственно функцию `date_bin()` PostgreSQL, например.

```SQL
SELECT toStartOfInterval(toDateTime('2023-01-01 14:45:00'), INTERVAL 1 MINUTE, toDateTime('2023-01-01 14:35:30'));
```

Результат:

```reference
┌───toStartOfInterval(...)─┐
│      2023-01-01 14:44:30 │
└──────────────────────────┘
```

**Смотрите также**
- [date_trunc](#date_trunc)
## toTime {#totime}

Преобразует дату с временем в определенную фиксированную дату, сохраняя время.

**Синтаксис**

```sql
toTime(date[, timezone])
```

**Аргументы**

- `date` — Дата для преобразования во время. [Дата](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md).
- `timezone` (необязательный) — Часовой пояс для возвращаемого значения. [Строка](../data-types/string.md).

**Возвращаемое значение**

- DateTime с установленной датой в `1970-01-02`, сохраняя время. [DateTime](../data-types/datetime.md).

:::note
Если входной аргумент `date` содержал компоненты субсекунд,
они будут отброшены в возвращаемом значении `DateTime` с точностью до секунды.
:::

**Пример**

Запрос:

```sql
SELECT toTime(toDateTime64('1970-12-10 01:20:30.3000',3)) AS result, toTypeName(result);
```

Результат:

```response
┌──────────────result─┬─toTypeName(result)─┐
│ 1970-01-02 01:20:30 │ DateTime           │
└─────────────────────┴────────────────────┘
```
## toRelativeYearNum {#torelativeyearnum}

Преобразует дату или дату с временем в количество лет, прошедших с определенной фиксированной точки в прошлом.

**Синтаксис**

```sql
toRelativeYearNum(date)
```

**Аргументы**

- `date` — Дата или дата с временем. [Дата](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

- Количество лет от фиксированной отправной точки в прошлом. [UInt16](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT
    toRelativeYearNum(toDate('2002-12-08')) AS y1,
    toRelativeYearNum(toDate('2010-10-26')) AS y2
```

Результат:

```response
┌───y1─┬───y2─┐
│ 2002 │ 2010 │
└──────┴──────┘
```
## toRelativeQuarterNum {#torelativequarternum}

Преобразует дату или дату с временем в количество кварталов, прошедших с определенной фиксированной точки в прошлом.

**Синтаксис**

```sql
toRelativeQuarterNum(date)
```

**Аргументы**

- `date` — Дата или дата с временем. [Дата](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

- Количество кварталов от фиксированной отправной точки в прошлом. [UInt32](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT
  toRelativeQuarterNum(toDate('1993-11-25')) AS q1,
  toRelativeQuarterNum(toDate('2005-01-05')) AS q2
```

Результат:

```response
┌───q1─┬───q2─┐
│ 7975 │ 8020 │
└──────┴──────┘
```
## toRelativeMonthNum {#torelativemonthnum}

Преобразует дату или дату с временем в количество месяцев, прошедших с определенной фиксированной точки в прошлом.

**Синтаксис**

```sql
toRelativeMonthNum(date)
```

**Аргументы**

- `date` — Дата или дата с временем. [Дата](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

- Количество месяцев от фиксированной отправной точки в прошлом. [UInt32](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT
  toRelativeMonthNum(toDate('2001-04-25')) AS m1,
  toRelativeMonthNum(toDate('2009-07-08')) AS m2
```

Результат:

```response
┌────m1─┬────m2─┐
│ 24016 │ 24115 │
└───────┴───────┘
```
## toRelativeWeekNum {#torelativeweeknum}

Преобразует дату или дату с временем в количество недель, прошедших с определенной фиксированной точки в прошлом.

**Синтаксис**

```sql
toRelativeWeekNum(date)
```

**Аргументы**

- `date` — Дата или дата с временем. [Дата](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

- Количество недель от фиксированной отправной точки в прошлом. [UInt32](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT
  toRelativeWeekNum(toDate('2000-02-29')) AS w1,
  toRelativeWeekNum(toDate('2001-01-12')) AS w2
```

Результат:

```response
┌───w1─┬───w2─┐
│ 1574 │ 1619 │
└──────┴──────┘
```
## toRelativeDayNum {#torelativedaynum}

Преобразует дату или дату с временем в количество дней, прошедших с определенной фиксированной точки в прошлом.

**Синтаксис**

```sql
toRelativeDayNum(date)
```

**Аргументы**

- `date` — Дата или дата с временем. [Дата](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

- Количество дней от фиксированной отправной точки в прошлом. [UInt32](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT
  toRelativeDayNum(toDate('1993-10-05')) AS d1,
  toRelativeDayNum(toDate('2000-09-20')) AS d2
```

Результат:

```response
┌───d1─┬────d2─┐
│ 8678 │ 11220 │
└──────┴───────┘
```
## toRelativeHourNum {#torelativehournum}

Преобразует дату или дату с временем в количество часов, прошедших с определенной фиксированной точки в прошлом.

**Синтаксис**

```sql
toRelativeHourNum(date)
```

**Аргументы**

- `date` — Дата или дата с временем. [Дата](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

- Количество часов от фиксированной отправной точки в прошлом. [UInt32](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT
  toRelativeHourNum(toDateTime('1993-10-05 05:20:36')) AS h1,
  toRelativeHourNum(toDateTime('2000-09-20 14:11:29')) AS h2
```

Результат:

```response
┌─────h1─┬─────h2─┐
│ 208276 │ 269292 │
└────────┴────────┘
```
## toRelativeMinuteNum {#torelativeminutenum}

Преобразует дату или дату с временем в количество минут, прошедших с определенной фиксированной точки в прошлом.

**Синтаксис**

```sql
toRelativeMinuteNum(date)
```

**Аргументы**

- `date` — Дата или дата с временем. [Дата](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

- Количество минут от фиксированной отправной точки в прошлом. [UInt32](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT
  toRelativeMinuteNum(toDateTime('1993-10-05 05:20:36')) AS m1,
  toRelativeMinuteNum(toDateTime('2000-09-20 14:11:29')) AS m2
```

Результат:

```response
┌───────m1─┬───────m2─┐
│ 12496580 │ 16157531 │
└──────────┴──────────┘
```
## toRelativeSecondNum {#torelativesecondnum}

Преобразует дату или дату с временем в количество секунд, прошедших с определенной фиксированной точки в прошлом.

**Синтаксис**

```sql
toRelativeSecondNum(date)
```

**Аргументы**

- `date` — Дата или дата с временем. [Дата](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

- Количество секунд от фиксированной отправной точки в прошлом. [UInt32](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT
  toRelativeSecondNum(toDateTime('1993-10-05 05:20:36')) AS s1,
  toRelativeSecondNum(toDateTime('2000-09-20 14:11:29')) AS s2
```

Результат:

```response
┌────────s1─┬────────s2─┐
│ 749794836 │ 969451889 │
└───────────┴───────────┘
```
## toISOYear {#toisoyear}

Преобразует дату или дату с временем в ISO-год как число UInt16.

**Синтаксис**

```sql
toISOYear(value)
```

**Аргументы**

- `value` — Значение с датой или датой с временем. [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)

**Возвращаемое значение**

- Входное значение, преобразованное в номер ISO-года. [UInt16](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT
  toISOYear(toDate('2024/10/02')) as year1,
  toISOYear(toDateTime('2024-10-02 01:30:00')) as year2
```

Результат:

```response
┌─year1─┬─year2─┐
│  2024 │  2024 │
└───────┴───────┘
```
## toISOWeek {#toisoweek}

Преобразует дату или дату с временем в число UInt8, содержащее номер ISO-недели.

**Синтаксис**

```sql
toISOWeek(value)
```

**Аргументы**

- `value` — Значение с датой или датой с временем.

**Возвращаемое значение**

- `value`, преобразованное в номер текущей ISO-недели. [UInt8](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT
  toISOWeek(toDate('2024/10/02')) AS week1,
  toISOWeek(toDateTime('2024/10/02 01:30:00')) AS week2
```

Ответ:

```response
┌─week1─┬─week2─┐
│    40 │    40 │
└───────┴───────┘
```
## toWeek {#toweek}

Эта функция возвращает номер недели для даты или даты с временем. Двухаргументная форма `toWeek()` позволяет указать, начинается ли неделя с воскресенья или понедельника и должен ли возвращаемый результат быть в диапазоне от 0 до 53 или от 1 до 53. Если аргумент mode опущен, используется режим по умолчанию 0.

`toISOWeek()` - это функция совместимости, которая эквивалентна `toWeek(date,3)`.

В следующей таблице описывается, как работает аргумент mode.

| Режим | Первый день недели | Диапазон | Недея 1 это первая неделя ...    |
|------|-------------------|-------|-------------------------------|
| 0    | Воскресенье       | 0-53  | с воскресеньем в этом году    |
| 1    | Понедельник       | 0-53  | с 4 или более днями в этом году |
| 2    | Воскресенье       | 1-53  | с воскресеньем в этом году    |
| 3    | Понедельник       | 1-53  | с 4 или более днями в этом году |
| 4    | Воскресенье       | 0-53  | с 4 или более днями в этом году |
| 5    | Понедельник       | 0-53  | с понедельником в этом году    |
| 6    | Воскресенье       | 1-53  | с 4 или более днями в этом году |
| 7    | Понедельник       | 1-53  | с понедельником в этом году    |
| 8    | Воскресенье       | 1-53  | содержит 1 января            |
| 9    | Понедельник       | 1-53  | содержит 1 января            |

Для значений режима с смыслом "с 4 или более днями в этом году" недели нумеруются в соответствии с ISO 8601:1988:

- Если неделя, содержащая 1 января, имеет 4 или более дней в новом году, она будет неделей 1.

- В противном случае это последняя неделя предыдущего года, а следующая неделя - неделя 1.

Для значений режима с смыслом "содержит 1 января" неделя, содержащая 1 января, считается неделей 1. Не имеет значения, сколько дней в новом году неделя содержала, даже если это всего лишь один день. То есть, если последняя неделя декабря содержит 1 января следующего года, это будет неделя 1 следующего года.

**Синтаксис**

```sql
toWeek(t[, mode[, time_zone]])
```

Псевдоним: `WEEK`

**Аргументы**

- `t` – Дата или ДатаВремя.
- `mode` – Необязательный параметр, диапазон значений [0,9], по умолчанию 0.
- `timezone` – Необязательный параметр, ведет себя как любая другая функция преобразования.

Первый аргумент также может быть указан как [Строка](../data-types/string.md) в формате, поддерживаемом [parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort). Поддержка строковых аргументов существует только по причинам совместимости с MySQL, что ожидается определенными сторонними инструментами. Поскольку поддержка строковых аргументов может в будущем зависеть от новых настроек совместимости с MySQL и потому что парсинг строк обычно медленный, рекомендуется не использовать это.

**Пример**

```sql
SELECT toDate('2016-12-27') AS date, toWeek(date) AS week0, toWeek(date,1) AS week1, toWeek(date,9) AS week9;
```

```text
┌───────date─┬─week0─┬─week1─┬─week9─┐
│ 2016-12-27 │    52 │    52 │     1 │
└────────────┴───────┴───────┴───────┘
```
## toYearWeek {#toyearweek}

Возвращает год и неделю для даты. Год в результате может отличаться от года в аргументе даты для первой и последней недели года.

Аргумент mode работает так же, как аргумент mode для `toWeek()`. Для синтаксиса с одним аргументом используется значение режима 0.

`toISOYear()` - это функция совместимости, которая эквивалентна `intDiv(toYearWeek(date,3),100)`.

:::warning
Номер недели, возвращаемый `toYearWeek()`, может отличаться от того, что возвращает `toWeek()`. `toWeek()` всегда возвращает номер недели в контексте данного года, и если `toWeek()` возвращает `0`, `toYearWeek()` возвращает значение, соответствующее последней неделе предыдущего года. См. `prev_yearWeek` в примере ниже.
:::

**Синтаксис**

```sql
toYearWeek(t[, mode[, timezone]])
```

Псевдоним: `YEARWEEK`

Первый аргумент также может быть указан как [Строка](../data-types/string.md) в формате, поддерживаемом [parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort). Поддержка строковых аргументов существует только по причинам совместимости с MySQL, что ожидается определенными сторонними инструментами. Поскольку поддержка строковых аргументов может в будущем зависеть от новых настроек совместимости с MySQL и потому что парсинг строк обычно медленный, рекомендуется не использовать это.

**Пример**

```sql
SELECT toDate('2016-12-27') AS date, toYearWeek(date) AS yearWeek0, toYearWeek(date,1) AS yearWeek1, toYearWeek(date,9) AS yearWeek9, toYearWeek(toDate('2022-01-01')) AS prev_yearWeek;
```

```text
┌───────date─┬─yearWeek0─┬─yearWeek1─┬─yearWeek9─┬─prev_yearWeek─┐
│ 2016-12-27 │    201652 │    201652 │    201701 │        202152 │
└────────────┴───────────┴───────────┴───────────┴───────────────┘
```
## toDaysSinceYearZero {#todayssinceyearzero}

Возвращает для данной даты количество дней, прошедших с [1 января 0000](https://en.wikipedia.org/wiki/Year_zero) по [пролептическому григорианскому календарю, определенному ISO 8601](https://en.wikipedia.org/wiki/Gregorian_calendar#Proleptic_Gregorian_calendar). Расчет такой же, как в функции MySQL [`TO_DAYS()`](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_to-days).

**Синтаксис**

```sql
toDaysSinceYearZero(date[, time_zone])
```

Псевдоним: `TO_DAYS`

**Аргументы**

- `date` — Дата, от которой рассчитывается количество дней, прошедших с года ноль. [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).
- `time_zone` — Константное значение типа строки или выражение, представляющее часовой пояс. [Строковые типы](../data-types/string.md)

**Возвращаемое значение**

Количество дней, прошедших с даты 0000-01-01. [UInt32](../data-types/int-uint.md).

**Пример**

```sql
SELECT toDaysSinceYearZero(toDate('2023-09-08'));
```

Результат:

```text
┌─toDaysSinceYearZero(toDate('2023-09-08')))─┐
│                                     713569 │
└────────────────────────────────────────────┘
```

**Смотрите также**

- [fromDaysSinceYearZero](#fromdayssinceyearzero)
```yaml
title: 'Функции работы с датами и временем'
sidebar_label: 'Функции даты и времени'
keywords: ['функции', 'дата', 'время']
description: 'Обзор функций ClickHouse для работы с датами и временем.'
```

## fromDaysSinceYearZero {#fromdayssinceyearzero}

Возвращает для данного числа дней, прошедших с [1 января 0000](https://en.wikipedia.org/wiki/Year_zero), соответствующую дату в [пролептическом григорианском календаре, определенном ISO 8601](https://en.wikipedia.org/wiki/Gregorian_calendar#Proleptic_Gregorian_calendar). Вычисление такое же, как в функции MySQL [`FROM_DAYS()`](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_from-days).

Результат непредсказуем, если он не может быть представлен в пределах типа [Date](../data-types/date.md).

**Синтаксис**

```sql
fromDaysSinceYearZero(days)
```

Псевдоним: `FROM_DAYS`

**Аргументы**

- `days` — Число дней, прошедших с года ноль.

**Возвращаемое значение**

Дата, соответствующая числу дней, прошедших с года ноль. [Date](../data-types/date.md).

**Пример**

```sql
SELECT fromDaysSinceYearZero(739136), fromDaysSinceYearZero(toDaysSinceYearZero(toDate('2023-09-08')));
```

Результат:

```text
┌─fromDaysSinceYearZero(739136)─┬─fromDaysSinceYearZero(toDaysSinceYearZero(toDate('2023-09-08')))─┐
│                    2023-09-08 │                                                       2023-09-08 │
└───────────────────────────────┴──────────────────────────────────────────────────────────────────┘
```

**См. также**

- [toDaysSinceYearZero](#todayssinceyearzero)
## fromDaysSinceYearZero32 {#fromdayssinceyearzero32}

Как [fromDaysSinceYearZero](#fromdayssinceyearzero), но возвращает [Date32](../data-types/date32.md).
## age {#age}

Возвращает компонент `unit` разности между `startdate` и `enddate`. Разность вычисляется с точностью 1 наносекунда. Например, разность между `2021-12-29` и `2022-01-01` составляет 3 дня для единицы `day`, 0 месяцев для единицы `month`, 0 лет для единицы `year`.

Для альтернативы функции `age` см. функцию `date_diff`.

**Синтаксис**

```sql
age('unit', startdate, enddate, [timezone])
```

**Аргументы**

- `unit` — Тип интервала для результата. [String](../data-types/string.md).
    Возможные значения:

    - `nanosecond`, `nanoseconds`, `ns`
    - `microsecond`, `microseconds`, `us`, `u`
    - `millisecond`, `milliseconds`, `ms`
    - `second`, `seconds`, `ss`, `s`
    - `minute`, `minutes`, `mi`, `n`
    - `hour`, `hours`, `hh`, `h`
    - `day`, `days`, `dd`, `d`
    - `week`, `weeks`, `wk`, `ww`
    - `month`, `months`, `mm`, `m`
    - `quarter`, `quarters`, `qq`, `q`
    - `year`, `years`, `yyyy`, `yy`

- `startdate` — Первое значение времени для вычитания (уменьшаемое). [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

- `enddate` — Второе значение времени, из которого вычитается (уменьшаемое). [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

- `timezone` — [Имя часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) (опционально). Если указано, он применяется как к `startdate`, так и к `enddate`. Если не указано, используются часовые пояса `startdate` и `enddate`. Если они не совпадают, результат непредсказуем. [String](../data-types/string.md).

**Возвращаемое значение**

Разность между `enddate` и `startdate`, выраженная в `unit`. [Int](../data-types/int-uint.md).

**Пример**

```sql
SELECT age('hour', toDateTime('2018-01-01 22:30:00'), toDateTime('2018-01-02 23:00:00'));
```

Результат:

```text
┌─age('hour', toDateTime('2018-01-01 22:30:00'), toDateTime('2018-01-02 23:00:00'))─┐
│                                                                                24 │
└───────────────────────────────────────────────────────────────────────────────────┘
```

```sql
SELECT
    toDate('2022-01-01') AS e,
    toDate('2021-12-29') AS s,
    age('day', s, e) AS day_age,
    age('month', s, e) AS month__age,
    age('year', s, e) AS year_age;
```

Результат:

```text
┌──────────e─┬──────────s─┬─day_age─┬─month__age─┬─year_age─┐
│ 2022-01-01 │ 2021-12-29 │       3 │          0 │        0 │
└────────────┴────────────┴─────────┴────────────┴──────────┘
```
## date_diff {#date_diff}

Возвращает количество пересеченных границ указанного `unit` между `startdate` и `enddate`. Разность вычисляется с использованием относительных единиц, например разность между `2021-12-29` и `2022-01-01` составляет 3 дня для единицы `day` (см. [toRelativeDayNum](#torelativedaynum)), 1 месяц для единицы `month` (см. [toRelativeMonthNum](#torelativemonthnum)) и 1 год для единицы `year` (см. [toRelativeYearNum](#torelativeyearnum)).

Если была указана единица `week`, `date_diff` предполагает, что недели начинаются с понедельника. Обратите внимание, что это поведение отличается от функции `toWeek()`, в которой недели по умолчанию начинаются с воскресенья.

Для альтернативы функции `date_diff` см. функцию `age`.

**Синтаксис**

```sql
date_diff('unit', startdate, enddate, [timezone])
```

Псевдонимы: `dateDiff`, `DATE_DIFF`, `timestampDiff`, `timestamp_diff`, `TIMESTAMP_DIFF`.

**Аргументы**

- `unit` — Тип интервала для результата. [String](../data-types/string.md).
    Возможные значения:

    - `nanosecond`, `nanoseconds`, `ns`
    - `microsecond`, `microseconds`, `us`, `u`
    - `millisecond`, `milliseconds`, `ms`
    - `second`, `seconds`, `ss`, `s`
    - `minute`, `minutes`, `mi`, `n`
    - `hour`, `hours`, `hh`, `h`
    - `day`, `days`, `dd`, `d`
    - `week`, `weeks`, `wk`, `ww`
    - `month`, `months`, `mm`, `m`
    - `quarter`, `quarters`, `qq`, `q`
    - `year`, `years`, `yyyy`, `yy`

- `startdate` — Первое значение времени для вычитания (уменьшаемое). [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

- `enddate` — Второе значение времени, из которого вычитается (уменьшаемое). [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

- `timezone` — [Имя часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) (опционально). Если указано, он применяется как к `startdate`, так и к `enddate`. Если не указано, используются часовые пояса `startdate` и `enddate`. Если они не совпадают, результат непредсказуем. [String](../data-types/string.md).

**Возвращаемое значение**

Разность между `enddate` и `startdate`, выраженная в `unit`. [Int](../data-types/int-uint.md).

**Пример**

```sql
SELECT dateDiff('hour', toDateTime('2018-01-01 22:00:00'), toDateTime('2018-01-02 23:00:00'));
```

Результат:

```text
┌─dateDiff('hour', toDateTime('2018-01-01 22:00:00'), toDateTime('2018-01-02 23:00:00'))─┐
│                                                                                     25 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql
SELECT
    toDate('2022-01-01') AS e,
    toDate('2021-12-29') AS s,
    dateDiff('day', s, e) AS day_diff,
    dateDiff('month', s, e) AS month__diff,
    dateDiff('year', s, e) AS year_diff;
```

Результат:

```text
┌──────────e─┬──────────s─┬─day_diff─┬─month__diff─┬─year_diff─┐
│ 2022-01-01 │ 2021-12-29 │        3 │           1 │         1 │
└────────────┴────────────┴──────────┴─────────────┴───────────┘
```
## date\_trunc {#date_trunc}

Обрезает данные даты и времени до указанной части даты.

**Синтаксис**

```sql
date_trunc(unit, value[, timezone])
```

Псевдоним: `dateTrunc`.

**Аргументы**

- `unit` — Тип интервала, к которому нужно обрезать результат. [String Literal](/sql-reference/syntax#string).
    Возможные значения:

    - `nanosecond` - Совместим только с DateTime64
    - `microsecond` - Совместим только с DateTime64
    - `milisecond` - Совместим только с DateTime64
    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

    Аргумент `unit` нечувствителен к регистру.

- `value` — Дата и время. [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).
- `timezone` — [Имя часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения (опционально). Если не указано, функция использует часовой пояс параметра `value`. [String](../data-types/string.md).

**Возвращаемое значение**

Если аргумент unit равен Год, Квартал, Месяц или Неделя,
- и аргумент value является Date32 или DateTime64, то возвращается [Date32](../data-types/date32.md),
- в противном случае возвращается [Date](../data-types/date.md).

Если аргумент unit равен День, Час, Минута или Секунда,
- и аргумент value является Date32 или DateTime64, то возвращается [DateTime64](../data-types/datetime64.md),
- в противном случае возвращается [DateTime](../data-types/datetime.md).

Если аргумент unit равен Миллисекунда, Микросекунда или Наносекунда, то возвращается [DateTime64](../data-types/datetime64.md) с масштабом 3 или 6 или 9 (в зависимости от аргумента unit).

**Пример**

Запрос без часового пояса:

```sql
SELECT now(), date_trunc('hour', now());
```

Результат:

```text
┌───────────────now()─┬─date_trunc('hour', now())─┐
│ 2020-09-28 10:40:45 │       2020-09-28 10:00:00 │
└─────────────────────┴───────────────────────────┘
```

Запрос с указанным часовым поясом:

```sql
SELECT now(), date_trunc('hour', now(), 'Asia/Istanbul');
```

Результат:

```text
┌───────────────now()─┬─date_trunc('hour', now(), 'Asia/Istanbul')─┐
│ 2020-09-28 10:46:26 │                        2020-09-28 13:00:00 │
└─────────────────────┴────────────────────────────────────────────┘
```

**См. также**

- [toStartOfInterval](#tostartofinterval)
## date\_add {#date_add}

Добавляет временной интервал или интервал даты к предоставленной дате или дате с временем.

Если сложение приводит к значению вне пределов типа данных, результат непредсказуем.

**Синтаксис**

```sql
date_add(unit, value, date)
```

Альтернативный синтаксис:

```sql
date_add(date, INTERVAL value unit)
```

Псевдонимы: `dateAdd`, `DATE_ADD`.

**Аргументы**

- `unit` — Тип интервала для добавления. Обратите внимание: это не [String](../data-types/string.md) и не должно быть заключено в кавычки.
    Возможные значения:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — Значение интервала для добавления. [Int](../data-types/int-uint.md).
- `date` — Дата или дата с временем, к которой добавляется `value`. [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

Дата или дата с временем, полученная путем добавления `value`, выраженного в `unit`, к `date`. [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

**Пример**

```sql
SELECT date_add(YEAR, 3, toDate('2018-01-01'));
```

Результат:

```text
┌─plus(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                    2021-01-01 │
└───────────────────────────────────────────────┘
```

```sql
SELECT date_add(toDate('2018-01-01'), INTERVAL 3 YEAR);
```

Результат:

```text
┌─plus(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                    2021-01-01 │
└───────────────────────────────────────────────┘
```



**См. также**

- [addDate](#adddate)
## date\_sub {#date_sub}

Вычитает временной интервал или интервал даты из предоставленной даты или даты с временем.

Если вычитание приводит к значению вне пределов типа данных, результат непредсказуем.

**Синтаксис**

```sql
date_sub(unit, value, date)
```

Альтернативный синтаксис:

```sql
date_sub(date, INTERVAL value unit)
```

Псевдонимы: `dateSub`, `DATE_SUB`.

**Аргументы**

- `unit` — Тип интервала для вычитания. Обратите внимание: это не [String](../data-types/string.md) и не должно быть заключено в кавычки.

    Возможные значения:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — Значение интервала для вычитания. [Int](../data-types/int-uint.md).
- `date` — Дата или дата с временем, из которой вычитается `value`. [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

Дата или дата с временем, полученная путем вычитания `value`, выраженного в `unit`, из `date`. [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

**Пример**

```sql
SELECT date_sub(YEAR, 3, toDate('2018-01-01'));
```

Результат:

```text
┌─minus(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                     2015-01-01 │
└────────────────────────────────────────────────┘
```

```sql
SELECT date_sub(toDate('2018-01-01'), INTERVAL 3 YEAR);
```

Результат:

```text
┌─minus(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                     2015-01-01 │
└────────────────────────────────────────────────┘
```


**См. также**

- [subDate](#subdate)
## timestamp\_add {#timestamp_add}

Добавляет указанное значение времени к предоставленной дате или значению даты и времени.

Если сложение приводит к значению вне пределов типа данных, результат непредсказуем.

**Синтаксис**

```sql
timestamp_add(date, INTERVAL value unit)
```

Псевдонимы: `timeStampAdd`, `TIMESTAMP_ADD`.

**Аргументы**

- `date` — Дата или дата с временем. [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).
- `value` — Значение интервала для добавления. [Int](../data-types/int-uint.md).
- `unit` — Тип интервала для добавления. [String](../data-types/string.md).
    Возможные значения:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

**Возвращаемое значение**

Дата или дата с временем, к которому добавлено указанное `value`, выраженное в `unit`. [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

**Пример**

```sql
select timestamp_add(toDate('2018-01-01'), INTERVAL 3 MONTH);
```

Результат:

```text
┌─plus(toDate('2018-01-01'), toIntervalMonth(3))─┐
│                                     2018-04-01 │
└────────────────────────────────────────────────┘
```
## timestamp\_sub {#timestamp_sub}

Вычитает временной интервал из предоставленной даты или даты с временем.

Если вычитание приводит к значению вне пределов типа данных, результат непредсказуем.

**Синтаксис**

```sql
timestamp_sub(unit, value, date)
```

Псевдонимы: `timeStampSub`, `TIMESTAMP_SUB`.

**Аргументы**

- `unit` — Тип интервала для вычитания. [String](../data-types/string.md).
    Возможные значения:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — Значение интервала для вычитания. [Int](../data-types/int-uint.md).
- `date` — Дата или дата с временем. [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

Дата или дата с временем, полученная путем вычитания `value`, выраженного в `unit`, из `date`. [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

**Пример**

```sql
select timestamp_sub(MONTH, 5, toDateTime('2018-12-18 01:02:03'));
```

Результат:

```text
┌─minus(toDateTime('2018-12-18 01:02:03'), toIntervalMonth(5))─┐
│                                          2018-07-18 01:02:03 │
└──────────────────────────────────────────────────────────────┘
```
## addDate {#adddate}

Добавляет временной интервал к предоставленной дате, дате с временем или строковому представлению даты / даты с временем.

Если сложение приводит к значению вне пределов типа данных, результат непредсказуем.

**Синтаксис**

```sql
addDate(date, interval)
```

**Аргументы**

- `date` — Дата или дата с временем, к которой добавляется `interval`. [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md), [DateTime64](../data-types/datetime64.md) или [String](../data-types/string.md)
- `interval` — Интервал для добавления. [Interval](../data-types/special-data-types/interval.md).

**Возвращаемое значение**

Дата или дата с временем, полученная путем добавления `interval` к `date`. [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

**Пример**

```sql
SELECT addDate(toDate('2018-01-01'), INTERVAL 3 YEAR);
```

Результат:

```text
┌─addDate(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                       2021-01-01 │
└──────────────────────────────────────────────────┘
```

Псевдоним: `ADDDATE`

**См. также**

- [date_add](#date_add)
## subDate {#subdate}

Вычитает временной интервал из предоставленной даты, даты с временем или строкового представления даты / даты с временем.

Если вычитание приводит к значению вне пределов типа данных, результат непредсказуем.

**Синтаксис**

```sql
subDate(date, interval)
```

**Аргументы**

- `date` — Дата или дата с временем, из которой вычитается `interval`. [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md), [DateTime64](../data-types/datetime64.md) или [String](../data-types/string.md)
- `interval` — Интервал для вычитания. [Interval](../data-types/special-data-types/interval.md).

**Возвращаемое значение**

Дата или дата с временем, полученная путем вычитания `interval` из `date`. [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

**Пример**

```sql
SELECT subDate(toDate('2018-01-01'), INTERVAL 3 YEAR);
```

Результат:

```text
┌─subDate(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                       2015-01-01 │
└──────────────────────────────────────────────────┘
```

Псевдоним: `SUBDATE`

**См. также**

- [date_sub](#date_sub)
## now {#now}

Возвращает текущую дату и время в момент анализа запроса. Функция является константным выражением.

Псевдоним: `current_timestamp`.

**Синтаксис**

```sql
now([timezone])
```

**Аргументы**

- `timezone` — [Имя часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения (опционально). [String](../data-types/string.md).

**Возвращаемое значение**

- Текущая дата и время. [DateTime](../data-types/datetime.md).

**Пример**

Запрос без часового пояса:

```sql
SELECT now();
```

Результат:

```text
┌───────────────now()─┐
│ 2020-10-17 07:42:09 │
└─────────────────────┘
```

Запрос с указанным часовым поясом:

```sql
SELECT now('Asia/Istanbul');
```

Результат:

```text
┌─now('Asia/Istanbul')─┐
│  2020-10-17 10:42:23 │
└──────────────────────┘
```
## now64 {#now64}

Возвращает текущее время с долями секунды в момент анализа запроса. Функция является константным выражением.

**Синтаксис**

```sql
now64([scale], [timezone])
```

**Аргументы**

- `scale` - Размер тика (точность): 10<sup>-precision</sup> секунд. Допустимый диапазон: [ 0 : 9 ]. Обычно используются - 3 (по умолчанию) (миллисекунды), 6 (микросекунды), 9 (наносекунды).
- `timezone` — [Имя часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения (опционально). [String](../data-types/string.md).

**Возвращаемое значение**

- Текущая дата и время с долями секунды. [DateTime64](../data-types/datetime64.md).

**Пример**

```sql
SELECT now64(), now64(9, 'Asia/Istanbul');
```

Результат:

```text
┌─────────────────now64()─┬─────now64(9, 'Asia/Istanbul')─┐
│ 2022-08-21 19:34:26.196 │ 2022-08-21 22:34:26.196542766 │
└─────────────────────────┴───────────────────────────────┘
```
## nowInBlock {#nowInBlock}

Возвращает текущую дату и время в момент обработки каждого блока данных. В отличие от функции [now](#now), это не константное выражение, и возвращаемое значение будет различаться в разных блоках для долгих запросов.

Имеет смысл использовать эту функцию для генерации текущего времени в длительных запросах INSERT SELECT.

**Синтаксис**

```sql
nowInBlock([timezone])
```

**Аргументы**

- `timezone` — [Имя часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения (опционально). [String](../data-types/string.md).

**Возвращаемое значение**

- Текущая дата и время в момент обработки каждого блока данных. [DateTime](../data-types/datetime.md).

**Пример**

```sql
SELECT
    now(),
    nowInBlock(),
    sleep(1)
FROM numbers(3)
SETTINGS max_block_size = 1
FORMAT PrettyCompactMonoBlock
```

Результат:

```text
┌───────────────now()─┬────────nowInBlock()─┬─sleep(1)─┐
│ 2022-08-21 19:41:19 │ 2022-08-21 19:41:19 │        0 │
│ 2022-08-21 19:41:19 │ 2022-08-21 19:41:20 │        0 │
│ 2022-08-21 19:41:19 │ 2022-08-21 19:41:21 │        0 │
└─────────────────────┴─────────────────────┴──────────┘
```
## today {#today}

Возвращает текущую дату в момент анализа запроса. Это то же самое, что 'toDate(now())' и имеет псевдонимы: `curdate`, `current_date`.

**Синтаксис**

```sql
today()
```

**Аргументы**

- Нет

**Возвращаемое значение**

- Текущая дата. [DateTime](../data-types/datetime.md).

**Пример**

Запрос:

```sql
SELECT today() AS today, curdate() AS curdate, current_date() AS current_date FORMAT Pretty
```

**Результат**:

Выполнение приведенного выше запроса 3 марта 2024 года вернет следующий ответ:

```response
┏━━━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━━━━━━┓
┃      today ┃    curdate ┃ current_date ┃
┡━━━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━━━━━━┩
│ 2024-03-03 │ 2024-03-03 │   2024-03-03 │
└────────────┴────────────┴──────────────┘
```
## yesterday {#yesterday}

Принимает ноль аргументов и возвращает дату вчера в один из моментов анализа запроса. То же самое, что и 'today() - 1'.
## timeSlot {#timeslot}

Округляет время до начала полудо-часового интервала.

**Синтаксис**

```sql
timeSlot(time[, time_zone])
```

**Аргументы**

- `time` — Время, которое нужно округлить до начала полудо-часового интервала. [DateTime](../data-types/datetime.md)/[Date32](../data-types/date32.md)/[DateTime64](../data-types/datetime64.md).
- `time_zone` — Константное значение типа String или выражение, представляющее часовой пояс. [String](../data-types/string.md).

:::note
Хотя эта функция может принимать значения расширенных типов `Date32` и `DateTime64` в качестве аргумента, передача ей времени за пределами обычного диапазона (год 1970 до 2149 для `Date` / 2106 для `DateTime`) даст некорректные результаты.
:::

**Тип возвращаемого значения**

- Возвращает время, округленное до начала полудо-часового интервала. [DateTime](../data-types/datetime.md).

**Пример**

Запрос:

```sql
SELECT timeSlot(toDateTime('2000-01-02 03:04:05', 'UTC'));
```

Результат:

```response
┌─timeSlot(toDateTime('2000-01-02 03:04:05', 'UTC'))─┐
│                                2000-01-02 03:00:00 │
└────────────────────────────────────────────────────┘
```
## toYYYYMM {#toyyyymm}

Преобразует дату или дату с временем в число UInt32, содержащее номер года и месяца (YYYY \* 100 + MM). Принимает второй необязательный аргумент часового пояса. Если предоставлен, часовой пояс должен быть строковым константным значением.

Эта функция является противоположной функции `YYYYMMDDToDate()`.

**Пример**

```sql
SELECT
    toYYYYMM(now(), 'US/Eastern')
```

Результат:

```text
┌─toYYYYMM(now(), 'US/Eastern')─┐
│                        202303 │
└───────────────────────────────┘
```
## toYYYYMMDD {#toyyyymmdd}

Преобразует дату или дату с временем в число UInt32, содержащее номер года, месяца и дня (YYYY \* 10000 + MM \* 100 + DD). Принимает второй необязательный аргумент часового пояса. Если предоставлен, часовой пояс должен быть строковым константным значением.

**Пример**

```sql
SELECT toYYYYMMDD(now(), 'US/Eastern')
```

Результат:

```response
┌─toYYYYMMDD(now(), 'US/Eastern')─┐
│                        20230302 │
└─────────────────────────────────┘
```
## toYYYYMMDDhhmmss {#toyyyymmddhhmmss}

Преобразует дату или дату с временем в число UInt64, содержащее номер года, месяца, дня, часов, минут и секунд (YYYY \* 10000000000 + MM \* 100000000 + DD \* 1000000 + hh \* 10000 + mm \* 100 + ss). Принимает второй необязательный аргумент часового пояса. Если предоставлен, часовой пояс должен быть строковым константным значением.

**Пример**

```sql
SELECT toYYYYMMDDhhmmss(now(), 'US/Eastern')
```

Результат:

```response
┌─toYYYYMMDDhhmmss(now(), 'US/Eastern')─┐
│                        20230302112209 │
└───────────────────────────────────────┘
```
## YYYYMMDDToDate {#yyyymmddtodate}

Преобразует число, содержащее номер года, месяца и дня, в [Date](../data-types/date.md).

Эта функция является противоположной функции `toYYYYMMDD()`.

Вывод непредсказуем, если входные данные не кодируют допустимое значение Date.

**Синтаксис**

```sql
YYYYMMDDToDate(yyyymmdd);
```

**Аргументы**

- `yyyymmdd` - Число, представляющее год, месяц и день. [Integer](../data-types/int-uint.md), [Float](../data-types/float.md) или [Decimal](../data-types/decimal.md).

**Возвращаемое значение**

- дата, созданная из аргументов. [Date](../data-types/date.md).

**Пример**

```sql
SELECT YYYYMMDDToDate(20230911);
```

Результат:

```response
┌─toYYYYMMDD(20230911)─┐
│           2023-09-11 │
└──────────────────────┘
```
## YYYYMMDDToDate32 {#yyyymmddtodate32}

Как функция `YYYYMMDDToDate()`, но производит [Date32](../data-types/date32.md).
## YYYYMMDDhhmmssToDateTime {#yyyymmddhhmmsstodatetime}

Преобразует число, содержащее год, месяц, день, часы, минуты и секунды, в [DateTime](../data-types/datetime.md).

Вывод непредсказуем, если входные данные не кодируют допустимое значение DateTime.

Эта функция является противоположной функции `toYYYYMMDDhhmmss()`.

**Синтаксис**

```sql
YYYYMMDDhhmmssToDateTime(yyyymmddhhmmss[, timezone]);
```

**Аргументы**

- `yyyymmddhhmmss` - Число, представляющее год, месяц и день. [Integer](../data-types/int-uint.md), [Float](../data-types/float.md) или [Decimal](../data-types/decimal.md).
- `timezone` - [Часовой пояс](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения (опционально).

**Возвращаемое значение**

- дата и время, созданные из аргументов. [DateTime](../data-types/datetime.md).

**Пример**

```sql
SELECT YYYYMMDDToDateTime(20230911131415);
```

Результат:

```response
┌──────YYYYMMDDhhmmssToDateTime(20230911131415)─┐
│                           2023-09-11 13:14:15 │
└───────────────────────────────────────────────┘
```
## YYYYMMDDhhmmssToDateTime64 {#yyyymmddhhmmsstodatetime64}

Как функция `YYYYMMDDhhmmssToDate()`, но производит [DateTime64](../data-types/datetime64.md).

Принимает дополнительный необязательный параметр `precision` после параметра `timezone`.
## changeYear {#changeyear}

Изменяет компонент года даты или даты времени.

**Синтаксис**
```sql

changeYear(date_or_datetime, value)
```

**Аргументы**

- `date_or_datetime` - [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)
- `value` - новое значение года. [Integer](../../sql-reference/data-types/int-uint.md).

**Возвращаемое значение**

- Тот же тип, что и `date_or_datetime`.

**Пример**

```sql
SELECT changeYear(toDate('1999-01-01'), 2000), changeYear(toDateTime64('1999-01-01 00:00:00.000', 3), 2000);
```

Результат:

```sql
┌─changeYear(toDate('1999-01-01'), 2000)─┬─changeYear(toDateTime64('1999-01-01 00:00:00.000', 3), 2000)─┐
│                             2000-01-01 │                                      2000-01-01 00:00:00.000 │
└────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```
## changeMonth {#changemonth}

Изменяет компонент месяца даты или даты времени.

**Синтаксис**

```sql
changeMonth(date_or_datetime, value)
```

**Аргументы**

- `date_or_datetime` - [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)
- `value` - новое значение месяца. [Integer](../../sql-reference/data-types/int-uint.md).

**Возвращаемое значение**

- Возвращает значение того же типа, что и `date_or_datetime`.

**Пример**

```sql
SELECT changeMonth(toDate('1999-01-01'), 2), changeMonth(toDateTime64('1999-01-01 00:00:00.000', 3), 2);
```

Результат:

```sql
┌─changeMonth(toDate('1999-01-01'), 2)─┬─changeMonth(toDateTime64('1999-01-01 00:00:00.000', 3), 2)─┐
│                           1999-02-01 │                                    1999-02-01 00:00:00.000 │
└──────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```
## changeDay {#changeday}

Изменяет компонент дня даты или даты времени.

**Синтаксис**

```sql
changeDay(date_or_datetime, value)
```

**Аргументы**

- `date_or_datetime` - [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md)
- `value` - новое значение дня. [Integer](../../sql-reference/data-types/int-uint.md).

**Возвращаемое значение**

- Возвращает значение того же типа, что и `date_or_datetime`.

**Пример**

```sql
SELECT changeDay(toDate('1999-01-01'), 5), changeDay(toDateTime64('1999-01-01 00:00:00.000', 3), 5);
```

Результат:

```sql
┌─changeDay(toDate('1999-01-01'), 5)─┬─changeDay(toDateTime64('1999-01-01 00:00:00.000', 3), 5)─┐
│                         1999-01-05 │                                  1999-01-05 00:00:00.000 │
└────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

## changeHour {#changehour}

Изменяет компонент часа даты или даты с временем.

**Синтаксис**

```sql
changeHour(date_or_datetime, value)
```

**Аргументы**

- `date_or_datetime` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [ДатаВремя](../data-types/datetime.md) или [ДатаВремя64](../data-types/datetime64.md)
- `value` - новое значение часа. [Целое число](../../sql-reference/data-types/int-uint.md).

**Возвращаемое значение**

- Возвращает значение того же типа, что и `date_or_datetime`. Если входное значение - это [Дата](../data-types/date.md), возвращает [ДатаВремя](../data-types/datetime.md). Если входное значение - это [Date32](../data-types/date32.md), возвращает [ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
SELECT changeHour(toDate('1999-01-01'), 14), changeHour(toDateTime64('1999-01-01 00:00:00.000', 3), 14);
```

Результат:

```sql
┌─changeHour(toDate('1999-01-01'), 14)─┬─changeHour(toDateTime64('1999-01-01 00:00:00.000', 3), 14)─┐
│                  1999-01-01 14:00:00 │                                    1999-01-01 14:00:00.000 │
└──────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```
## changeMinute {#changeminute}

Изменяет компонент минуты даты или даты с временем.

**Синтаксис**

```sql
changeMinute(date_or_datetime, value)
```

**Аргументы**

- `date_or_datetime` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [ДатаВремя](../data-types/datetime.md) или [ДатаВремя64](../data-types/datetime64.md)
- `value` - новое значение минуты. [Целое число](../../sql-reference/data-types/int-uint.md).

**Возвращаемое значение**

- Возвращает значение того же типа, что и `date_or_datetime`. Если входное значение - это [Дата](../data-types/date.md), возвращает [ДатаВремя](../data-types/datetime.md). Если входное значение - это [Date32](../data-types/date32.md), возвращает [ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
    SELECT changeMinute(toDate('1999-01-01'), 15), changeMinute(toDateTime64('1999-01-01 00:00:00.000', 3), 15);
```

Результат:

```sql
┌─changeMinute(toDate('1999-01-01'), 15)─┬─changeMinute(toDateTime64('1999-01-01 00:00:00.000', 3), 15)─┐
│                    1999-01-01 00:15:00 │                                      1999-01-01 00:15:00.000 │
└────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```
## changeSecond {#changesecond}

Изменяет компонент секунды даты или даты с временем.

**Синтаксис**

```sql
changeSecond(date_or_datetime, value)
```

**Аргументы**

- `date_or_datetime` - [Дата](../data-types/date.md), [Date32](../data-types/date32.md), [ДатаВремя](../data-types/datetime.md) или [ДатаВремя64](../data-types/datetime64.md)
- `value` - новое значение секунды. [Целое число](../../sql-reference/data-types/int-uint.md).

**Возвращаемое значение**

- Возвращает значение того же типа, что и `date_or_datetime`. Если входное значение - это [Дата](../data-types/date.md), возвращает [ДатаВремя](../data-types/datetime.md). Если входное значение - это [Date32](../data-types/date32.md), возвращает [ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
SELECT changeSecond(toDate('1999-01-01'), 15), changeSecond(toDateTime64('1999-01-01 00:00:00.000', 3), 15);
```

Результат:

```sql
┌─changeSecond(toDate('1999-01-01'), 15)─┬─changeSecond(toDateTime64('1999-01-01 00:00:00.000', 3), 15)─┐
│                    1999-01-01 00:00:15 │                                      1999-01-01 00:00:15.000 │
└────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```
## addYears {#addyears}

Добавляет указанное количество лет к дате, дате с временем или дате/дате с временем в виде строки.

**Синтаксис**

```sql
addYears(date, num)
```

**Параметры**

- `date`: Дата / дата с временем, к которой нужно добавить указанное количество лет. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество лет для добавления. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date` плюс `num` лет. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addYears(date, 1) AS add_years_with_date,
    addYears(date_time, 1) AS add_years_with_date_time,
    addYears(date_time_string, 1) AS add_years_with_date_time_string
```

```response
┌─add_years_with_date─┬─add_years_with_date_time─┬─add_years_with_date_time_string─┐
│          2025-01-01 │      2025-01-01 00:00:00 │         2025-01-01 00:00:00.000 │
└─────────────────────┴──────────────────────────┴─────────────────────────────────┘
```
## addQuarters {#addquarters}

Добавляет указанное количество кварталов к дате, дате с временем или дате/дате с временем в виде строки.

**Синтаксис**

```sql
addQuarters(date, num)
```

**Параметры**

- `date`: Дата / дата с временем, к которой нужно добавить указанное количество кварталов. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество кварталов для добавления. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date` плюс `num` кварталов. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addQuarters(date, 1) AS add_quarters_with_date,
    addQuarters(date_time, 1) AS add_quarters_with_date_time,
    addQuarters(date_time_string, 1) AS add_quarters_with_date_time_string
```

```response
┌─add_quarters_with_date─┬─add_quarters_with_date_time─┬─add_quarters_with_date_time_string─┐
│             2024-04-01 │         2024-04-01 00:00:00 │            2024-04-01 00:00:00.000 │
└────────────────────────┴─────────────────────────────┴────────────────────────────────────┘
```
## addMonths {#addmonths}

Добавляет указанное количество месяцев к дате, дате с временем или дате/дате с временем в виде строки.

**Синтаксис**

```sql
addMonths(date, num)
```

**Параметры**

- `date`: Дата / дата с временем, к которой нужно добавить указанное количество месяцев. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество месяцев для добавления. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date` плюс `num` месяцев. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addMonths(date, 6) AS add_months_with_date,
    addMonths(date_time, 6) AS add_months_with_date_time,
    addMonths(date_time_string, 6) AS add_months_with_date_time_string
```

```response
┌─add_months_with_date─┬─add_months_with_date_time─┬─add_months_with_date_time_string─┐
│           2024-07-01 │       2024-07-01 00:00:00 │          2024-07-01 00:00:00.000 │
└──────────────────────┴───────────────────────────┴──────────────────────────────────┘
```
## addWeeks {#addweeks}

Добавляет указанное количество недель к дате, дате с временем или дате/дате с временем в виде строки.

**Синтаксис**

```sql
addWeeks(date, num)
```

**Параметры**

- `date`: Дата / дата с временем, к которой нужно добавить указанное количество недель. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество недель для добавления. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date` плюс `num` недель. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addWeeks(date, 5) AS add_weeks_with_date,
    addWeeks(date_time, 5) AS add_weeks_with_date_time,
    addWeeks(date_time_string, 5) AS add_weeks_with_date_time_string
```

```response
┌─add_weeks_with_date─┬─add_weeks_with_date_time─┬─add_weeks_with_date_time_string─┐
│          2024-02-05 │      2024-02-05 00:00:00 │         2024-02-05 00:00:00.000 │
└─────────────────────┴──────────────────────────┴─────────────────────────────────┘
```
## addDays {#adddays}

Добавляет указанное количество дней к дате, дате с временем или дате/дате с временем в виде строки.

**Синтаксис**

```sql
addDays(date, num)
```

**Параметры**

- `date`: Дата / дата с временем, к которой нужно добавить указанное количество дней. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество дней для добавления. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date` плюс `num` дней. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addDays(date, 5) AS add_days_with_date,
    addDays(date_time, 5) AS add_days_with_date_time,
    addDays(date_time_string, 5) AS add_days_with_date_time_string
```

```response
┌─add_days_with_date─┬─add_days_with_date_time─┬─add_days_with_date_time_string─┐
│         2024-01-06 │     2024-01-06 00:00:00 │        2024-01-06 00:00:00.000 │
└────────────────────┴─────────────────────────┴────────────────────────────────┘
```
## addHours {#addhours}

Добавляет указанное количество часов к дате, дате с временем или дате/дате с временем в виде строки.

**Синтаксис**

```sql
addHours(date, num)
```

**Параметры**

- `date`: Дата / дата с временем, к которой нужно добавить указанное количество часов. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество часов для добавления. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date` плюс `num` часов. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addHours(date, 12) AS add_hours_with_date,
    addHours(date_time, 12) AS add_hours_with_date_time,
    addHours(date_time_string, 12) AS add_hours_with_date_time_string
```

```response
┌─add_hours_with_date─┬─add_hours_with_date_time─┬─add_hours_with_date_time_string─┐
│ 2024-01-01 12:00:00 │      2024-01-01 12:00:00 │         2024-01-01 12:00:00.000 │
└─────────────────────┴──────────────────────────┴─────────────────────────────────┘
```
## addMinutes {#addminutes}

Добавляет указанное количество минут к дате, дате с временем или дате/дате с временем в виде строки.

**Синтаксис**

```sql
addMinutes(date, num)
```

**Параметры**

- `date`: Дата / дата с временем, к которой нужно добавить указанное количество минут. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество минут для добавления. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date` плюс `num` минут. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addMinutes(date, 20) AS add_minutes_with_date,
    addMinutes(date_time, 20) AS add_minutes_with_date_time,
    addMinutes(date_time_string, 20) AS add_minutes_with_date_time_string
```

```response
┌─add_minutes_with_date─┬─add_minutes_with_date_time─┬─add_minutes_with_date_time_string─┐
│   2024-01-01 00:20:00 │        2024-01-01 00:20:00 │           2024-01-01 00:20:00.000 │
└───────────────────────┴────────────────────────────┴───────────────────────────────────┘
```
## addSeconds {#addseconds}

Добавляет указанное количество секунд к дате, дате с временем или дате/дате с временем в виде строки.

**Синтаксис**

```sql
addSeconds(date, num)
```

**Параметры**

- `date`: Дата / дата с временем, к которой нужно добавить указанное количество секунд. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество секунд для добавления. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date` плюс `num` секунд. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addSeconds(date, 30) AS add_seconds_with_date,
    addSeconds(date_time, 30) AS add_seconds_with_date_time,
    addSeconds(date_time_string, 30) AS add_seconds_with_date_time_string
```

```response
┌─add_seconds_with_date─┬─add_seconds_with_date_time─┬─add_seconds_with_date_time_string─┐
│   2024-01-01 00:00:30 │        2024-01-01 00:00:30 │           2024-01-01 00:00:30.000 │
└───────────────────────┴────────────────────────────┴───────────────────────────────────┘
```
## addMilliseconds {#addmilliseconds}

Добавляет указанное количество миллисекунд к дате с временем или дате с временем в виде строки.

**Синтаксис**

```sql
addMilliseconds(date_time, num)
```

**Параметры**

- `date_time`: Дата с временем, к которой нужно добавить указанное количество миллисекунд. [ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество миллисекунд для добавления. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date_time` плюс `num` миллисекунд. [ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addMilliseconds(date_time, 1000) AS add_milliseconds_with_date_time,
    addMilliseconds(date_time_string, 1000) AS add_milliseconds_with_date_time_string
```

```response
┌─add_milliseconds_with_date_time─┬─add_milliseconds_with_date_time_string─┐
│         2024-01-01 00:00:01.000 │                2024-01-01 00:00:01.000 │
└─────────────────────────────────┴────────────────────────────────────────┘
```
## addMicroseconds {#addmicroseconds}

Добавляет указанное количество микросекунд к дате с временем или дате с временем в виде строки.

**Синтаксис**

```sql
addMicroseconds(date_time, num)
```

**Параметры**

- `date_time`: Дата с временем, к которой нужно добавить указанное количество микросекунд. [ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество микросекунд для добавления. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date_time` плюс `num` микросекунд. [ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addMicroseconds(date_time, 1000000) AS add_microseconds_with_date_time,
    addMicroseconds(date_time_string, 1000000) AS add_microseconds_with_date_time_string
```

```response
┌─add_microseconds_with_date_time─┬─add_microseconds_with_date_time_string─┐
│      2024-01-01 00:00:01.000000 │             2024-01-01 00:00:01.000000 │
└─────────────────────────────────┴────────────────────────────────────────┘
```
## addNanoseconds {#addnanoseconds}

Добавляет указанное количество наносекунд к дате с временем или дате с временем в виде строки.

**Синтаксис**

```sql
addNanoseconds(date_time, num)
```

**Параметры**

- `date_time`: Дата с временем, к которой нужно добавить указанное количество наносекунд. [ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество наносекунд для добавления. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date_time` плюс `num` наносекунд. [ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addNanoseconds(date_time, 1000) AS add_nanoseconds_with_date_time,
    addNanoseconds(date_time_string, 1000) AS add_nanoseconds_with_date_time_string
```

```response
┌─add_nanoseconds_with_date_time─┬─add_nanoseconds_with_date_time_string─┐
│  2024-01-01 00:00:00.000001000 │         2024-01-01 00:00:00.000001000 │
└────────────────────────────────┴───────────────────────────────────────┘
```
## addInterval {#addinterval}

Добавляет интервал к другому интервалу или к кортежу интервалов.

**Синтаксис**

```sql
addInterval(interval_1, interval_2)
```

**Параметры**

- `interval_1`: Первый интервал или кортеж интервалов. [интервал](../data-types/special-data-types/interval.md), [кортеж](../data-types/tuple.md)([интервал](../data-types/special-data-types/interval.md)).
- `interval_2`: Второй интервал для добавления. [интервал](../data-types/special-data-types/interval.md).

**Возвращаемое значение**

- Возвращает кортеж интервалов. [кортеж](../data-types/tuple.md)([интервал](../data-types/special-data-types/interval.md)).

:::note
Интервалы одного типа будут объединены в один интервал. Например, если передать `toIntervalDay(1)` и `toIntervalDay(2)`, то результат будет `(3)`, а не `(1,1)`.
:::

**Пример**

Запрос:

```sql
SELECT addInterval(INTERVAL 1 DAY, INTERVAL 1 MONTH);
SELECT addInterval((INTERVAL 1 DAY, INTERVAL 1 YEAR), INTERVAL 1 MONTH);
SELECT addInterval(INTERVAL 2 DAY, INTERVAL 1 DAY);
```

Результат:

```response
┌─addInterval(toIntervalDay(1), toIntervalMonth(1))─┐
│ (1,1)                                             │
└───────────────────────────────────────────────────┘
┌─addInterval((toIntervalDay(1), toIntervalYear(1)), toIntervalMonth(1))─┐
│ (1,1,1)                                                                │
└────────────────────────────────────────────────────────────────────────┘
┌─addInterval(toIntervalDay(2), toIntervalDay(1))─┐
│ (3)                                             │
└─────────────────────────────────────────────────┘
```
## addTupleOfIntervals {#addtupleofintervals}

Последовательно добавляет кортеж интервалов к дате или к дате с временем.

**Синтаксис**

```sql
addTupleOfIntervals(interval_1, interval_2)
```

**Параметры**

- `date`: Первый интервал или кортеж интервалов. [дата](../data-types/date.md)/[date32](../data-types/date32.md)/[датаВремя](../data-types/datetime.md)/[датаВремя64](../data-types/datetime64.md).
- `intervals`: Кортеж интервалов, который нужно добавить к `date`. [кортеж](../data-types/tuple.md)([интервал](../data-types/special-data-types/interval.md)).

**Возвращаемое значение**

- Возвращает `date` с добавленными `intervals`. [дата](../data-types/date.md)/[date32](../data-types/date32.md)/[датаВремя](../data-types/datetime.md)/[датаВремя64](../data-types/datetime64.md).

**Пример**

Запрос:

```sql
WITH toDate('2018-01-01') AS date
SELECT addTupleOfIntervals(date, (INTERVAL 1 DAY, INTERVAL 1 MONTH, INTERVAL 1 YEAR))
```

Результат:

```response
┌─addTupleOfIntervals(date, (toIntervalDay(1), toIntervalMonth(1), toIntervalYear(1)))─┐
│                                                                           2019-02-02 │
└──────────────────────────────────────────────────────────────────────────────────────┘
```
## subtractYears {#subtractyears}

Вычитает указанное количество лет из даты, даты с временем или даты/даты с временем в виде строки.

**Синтаксис**

```sql
subtractYears(date, num)
```

**Параметры**

- `date`: Дата / дата с временем, из которой нужно вычесть указанное количество лет. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество лет для вычитания. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date` минус `num` лет. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractYears(date, 1) AS subtract_years_with_date,
    subtractYears(date_time, 1) AS subtract_years_with_date_time,
    subtractYears(date_time_string, 1) AS subtract_years_with_date_time_string
```

```response
┌─subtract_years_with_date─┬─subtract_years_with_date_time─┬─subtract_years_with_date_time_string─┐
│               2023-01-01 │           2023-01-01 00:00:00 │              2023-01-01 00:00:00.000 │
└──────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```
## subtractQuarters {#subtractquarters}

Вычитает указанное количество кварталов из даты, даты с временем или даты/даты с временем в виде строки.

**Синтаксис**

```sql
subtractQuarters(date, num)
```

**Параметры**

- `date`: Дата / дата с временем, из которой нужно вычесть указанное количество кварталов. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество кварталов для вычитания. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date` минус `num` кварталов. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractQuarters(date, 1) AS subtract_quarters_with_date,
    subtractQuarters(date_time, 1) AS subtract_quarters_with_date_time,
    subtractQuarters(date_time_string, 1) AS subtract_quarters_with_date_time_string
```

```response
┌─subtract_quarters_with_date─┬─subtract_quarters_with_date_time─┬─subtract_quarters_with_date_time_string─┐
│                  2023-10-01 │              2023-10-01 00:00:00 │                 2023-10-01 00:00:00.000 │
└─────────────────────────────┴──────────────────────────────────┴─────────────────────────────────────────┘
```
## subtractMonths {#subtractmonths}

Вычитает указанное количество месяцев из даты, даты с временем или даты/даты с временем в виде строки.

**Синтаксис**

```sql
subtractMonths(date, num)
```

**Параметры**

- `date`: Дата / дата с временем, из которой нужно вычесть указанное количество месяцев. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество месяцев для вычитания. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date` минус `num` месяцев. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractMonths(date, 1) AS subtract_months_with_date,
    subtractMonths(date_time, 1) AS subtract_months_with_date_time,
    subtractMonths(date_time_string, 1) AS subtract_months_with_date_time_string
```

```response
┌─subtract_months_with_date─┬─subtract_months_with_date_time─┬─subtract_months_with_date_time_string─┐
│                2023-12-01 │            2023-12-01 00:00:00 │               2023-12-01 00:00:00.000 │
└───────────────────────────┴────────────────────────────────┴───────────────────────────────────────┘
```
## subtractWeeks {#subtractweeks}

Вычитает указанное количество недель из даты, даты с временем или даты/даты с временем в виде строки.

**Синтаксис**

```sql
subtractWeeks(date, num)
```

**Параметры**

- `date`: Дата / дата с временем, из которой нужно вычесть указанное количество недель. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество недель для вычитания. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date` минус `num` недель. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractWeeks(date, 1) AS subtract_weeks_with_date,
    subtractWeeks(date_time, 1) AS subtract_weeks_with_date_time,
    subtractWeeks(date_time_string, 1) AS subtract_weeks_with_date_time_string
```

```response
 ┌─subtract_weeks_with_date─┬─subtract_weeks_with_date_time─┬─subtract_weeks_with_date_time_string─┐
 │               2023-12-25 │           2023-12-25 00:00:00 │              2023-12-25 00:00:00.000 │
 └──────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```
## subtractDays {#subtractdays}

Вычитает указанное количество дней из даты, даты с временем или даты/даты с временем в виде строки.

**Синтаксис**

```sql
subtractDays(date, num)
```

**Параметры**

- `date`: Дата / дата с временем, из которой нужно вычесть указанное количество дней. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество дней для вычитания. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date` минус `num` дней. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[ДатаВремя](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractDays(date, 31) AS subtract_days_with_date,
    subtractDays(date_time, 31) AS subtract_days_with_date_time,
    subtractDays(date_time_string, 31) AS subtract_days_with_date_time_string
```

```response
┌─subtract_days_with_date─┬─subtract_days_with_date_time─┬─subtract_days_with_date_time_string─┐
│              2023-12-01 │          2023-12-01 00:00:00 │             2023-12-01 00:00:00.000 │
└─────────────────────────┴──────────────────────────────┴─────────────────────────────────────┘
```
## subtractHours {#subtracthours}

Вычитает указанное количество часов из даты, даты с временем или даты/даты с временем в виде строки.

**Синтаксис**

```sql
subtractHours(date, num)
```

**Параметры**

- `date`: Дата / дата с временем, из которой нужно вычесть указанное количество часов. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[Datetime](../data-types/datetime.md)/[Datetime64](../data-types/datetime64.md), [Строка](../data-types/string.md).
- `num`: Количество часов для вычитания. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date` минус `num` часов. [Дата](../data-types/date.md)/[Date32](../data-types/date32.md)/[Datetime](../data-types/datetime.md)/[ДатаВремя64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractHours(date, 12) AS subtract_hours_with_date,
    subtractHours(date_time, 12) AS subtract_hours_with_date_time,
    subtractHours(date_time_string, 12) AS subtract_hours_with_date_time_string
```

```response
┌─subtract_hours_with_date─┬─subtract_hours_with_date_time─┬─subtract_hours_with_date_time_string─┐
│      2023-12-31 12:00:00 │           2023-12-31 12:00:00 │              2023-12-31 12:00:00.000 │
└──────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```
```yaml
title: 'subtractMinutes'
sidebar_label: 'subtractMinutes'
keywords: ['subtract', 'minutes', 'date', 'time']
description: 'Subtracts a specified number of minutes from a date, a date with time or a string-encoded date / date with time.'
```

## subtractMinutes {#subtractminutes}

Вычитает указанное количество минут из даты, даты с временем или даты/даты с временем в виде строки.

**Синтаксис**

```sql
subtractMinutes(date, num)
```

**Параметры**

- `date`: Дата / дата с временем, от которой нужно вычесть указанное количество минут. [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md), [String](../data-types/string.md).
- `num`: Количество минут, которые нужно вычесть. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date` минус `num` минут. [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractMinutes(date, 30) AS subtract_minutes_with_date,
    subtractMinutes(date_time, 30) AS subtract_minutes_with_date_time,
    subtractMinutes(date_time_string, 30) AS subtract_minutes_with_date_time_string
```

```response
┌─subtract_minutes_with_date─┬─subtract_minutes_with_date_time─┬─subtract_minutes_with_date_time_string─┐
│        2023-12-31 23:30:00 │             2023-12-31 23:30:00 │                2023-12-31 23:30:00.000 │
└────────────────────────────┴─────────────────────────────────┴────────────────────────────────────────┘
```
## subtractSeconds {#subtractseconds}

Вычитает указанное количество секунд из даты, даты с временем или даты/даты с временем в виде строки.

**Синтаксис**

```sql
subtractSeconds(date, num)
```

**Параметры**

- `date`: Дата / дата с временем, из которой нужно вычесть указанное количество секунд. [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md), [String](../data-types/string.md).
- `num`: Количество секунд, которые нужно вычесть. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date` минус `num` секунд. [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractSeconds(date, 60) AS subtract_seconds_with_date,
    subtractSeconds(date_time, 60) AS subtract_seconds_with_date_time,
    subtractSeconds(date_time_string, 60) AS subtract_seconds_with_date_time_string
```

```response
┌─subtract_seconds_with_date─┬─subtract_seconds_with_date_time─┬─subtract_seconds_with_date_time_string─┐
│        2023-12-31 23:59:00 │             2023-12-31 23:59:00 │                2023-12-31 23:59:00.000 │
└────────────────────────────┴─────────────────────────────────┴────────────────────────────────────────┘
```
## subtractMilliseconds {#subtractmilliseconds}

Вычитает указанное количество миллисекунд из даты с временем или даты с временем в виде строки.

**Синтаксис**

```sql
subtractMilliseconds(date_time, num)
```

**Параметры**

- `date_time`: Дата с временем, из которой нужно вычесть указанное количество миллисекунд. [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md), [String](../data-types/string.md).
- `num`: Количество миллисекунд, которые нужно вычесть. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date_time` минус `num` миллисекунд. [DateTime64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractMilliseconds(date_time, 1000) AS subtract_milliseconds_with_date_time,
    subtractMilliseconds(date_time_string, 1000) AS subtract_milliseconds_with_date_time_string
```

```response
┌─subtract_milliseconds_with_date_time─┬─subtract_milliseconds_with_date_time_string─┐
│              2023-12-31 23:59:59.000 │                     2023-12-31 23:59:59.000 │
└──────────────────────────────────────┴─────────────────────────────────────────────┘
```
## subtractMicroseconds {#subtractmicroseconds}

Вычитает указанное количество микросекунд из даты с временем или даты с временем в виде строки.

**Синтаксис**

```sql
subtractMicroseconds(date_time, num)
```

**Параметры**

- `date_time`: Дата с временем, из которой нужно вычесть указанное количество микросекунд. [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md), [String](../data-types/string.md).
- `num`: Количество микросекунд, которые нужно вычесть. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date_time` минус `num` микросекунд. [DateTime64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractMicroseconds(date_time, 1000000) AS subtract_microseconds_with_date_time,
    subtractMicroseconds(date_time_string, 1000000) AS subtract_microseconds_with_date_time_string
```

```response
┌─subtract_microseconds_with_date_time─┬─subtract_microseconds_with_date_time_string─┐
│           2023-12-31 23:59:59.000000 │                  2023-12-31 23:59:59.000000 │
└──────────────────────────────────────┴─────────────────────────────────────────────┘
```
## subtractNanoseconds {#subtractnanoseconds}

Вычитает указанное количество наносекунд из даты с временем или даты с временем в виде строки.

**Синтаксис**

```sql
subtractNanoseconds(date_time, num)
```

**Параметры**

- `date_time`: Дата с временем, из которой нужно вычесть указанное количество наносекунд. [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md), [String](../data-types/string.md).
- `num`: Количество наносекунд, которые нужно вычесть. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md).

**Возвращаемое значение**

- Возвращает `date_time` минус `num` наносекунд. [DateTime64](../data-types/datetime64.md).

**Пример**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractNanoseconds(date_time, 1000) AS subtract_nanoseconds_with_date_time,
    subtractNanoseconds(date_time_string, 1000) AS subtract_nanoseconds_with_date_time_string
```

```response
┌─subtract_nanoseconds_with_date_time─┬─subtract_nanoseconds_with_date_time_string─┐
│       2023-12-31 23:59:59.999999000 │              2023-12-31 23:59:59.999999000 │
└─────────────────────────────────────┴────────────────────────────────────────────┘
```
## subtractInterval {#subtractinterval}

Прибавляет отрицательный интервал к другому интервалу или кортежу интервалов.

**Синтаксис**

```sql
subtractInterval(interval_1, interval_2)
```

**Параметры**

- `interval_1`: Первый интервал или интервал кортежей. [interval](../data-types/special-data-types/interval.md), [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md)).
- `interval_2`: Второй интервал, который будет отрицаться. [interval](../data-types/special-data-types/interval.md).

**Возвращаемое значение**

- Возвращает кортеж интервалов. [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md)).

:::note
Интервалы одного типа будут объединены в один интервал. Например, если передать `toIntervalDay(2)` и `toIntervalDay(1)`, то результат будет `(1)`, а не `(2,1)`.
:::

**Пример**

Запрос:

```sql
SELECT subtractInterval(INTERVAL 1 DAY, INTERVAL 1 MONTH);
SELECT subtractInterval((INTERVAL 1 DAY, INTERVAL 1 YEAR), INTERVAL 1 MONTH);
SELECT subtractInterval(INTERVAL 2 DAY, INTERVAL 1 DAY);
```

Результат:

```response
┌─subtractInterval(toIntervalDay(1), toIntervalMonth(1))─┐
│ (1,-1)                                                 │
└────────────────────────────────────────────────────────┘
┌─subtractInterval((toIntervalDay(1), toIntervalYear(1)), toIntervalMonth(1))─┐
│ (1,1,-1)                                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
┌─subtractInterval(toIntervalDay(2), toIntervalDay(1))─┐
│ (1)                                                  │
└──────────────────────────────────────────────────────┘
```
## subtractTupleOfIntervals {#subtracttupleofintervals}

Последовательно вычитает кортеж интервалов из даты или даты с временем.

**Синтаксис**

```sql
subtractTupleOfIntervals(interval_1, interval_2)
```

**Параметры**

- `date`: Первая дата или интервал кортежей. [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md).
- `intervals`: Кортеж интервалов, которые нужно вычесть из `date`. [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md)).

**Возвращаемое значение**

- Возвращает `date` с вычтенными `intervals`. [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md).

**Пример**

Запрос:

```sql
WITH toDate('2018-01-01') AS date SELECT subtractTupleOfIntervals(date, (INTERVAL 1 DAY, INTERVAL 1 YEAR))
```

Результат:

```response
┌─subtractTupleOfIntervals(date, (toIntervalDay(1), toIntervalYear(1)))─┐
│                                                            2016-12-31 │
└───────────────────────────────────────────────────────────────────────┘
```
## timeSlots {#timeslots}

Для временного интервала, начинающегося с 'StartTime' и продолжающегося в течение 'Duration' секунд, возвращает массив моментов времени, состоящий из точек этого интервала, округленных вниз до 'Size' в секундах. 'Size' — это необязательный параметр, установленный по умолчанию на 1800 (30 минут). Это необходимо, например, при поиске просмотров страниц в соответствующей сессии. Принимает DateTime и DateTime64 в качестве аргумента 'StartTime'. Для DateTime аргументы 'Duration' и 'Size' должны быть `UInt32`. Для 'DateTime64' они должны быть `Decimal64`. Возвращает массив DateTime/DateTime64 (тип возвращаемого значения совпадает с типом 'StartTime'). Для DateTime64 масштаб возвращаемого значения может отличаться от масштаба 'StartTime' — принимается самый высокий масштаб среди всех переданных аргументов.

**Синтаксис**

```sql
timeSlots(StartTime, Duration,\[, Size\])
```

**Пример**

```sql
SELECT timeSlots(toDateTime('2012-01-01 12:20:00'), toUInt32(600));
SELECT timeSlots(toDateTime('1980-12-12 21:01:02', 'UTC'), toUInt32(600), 299);
SELECT timeSlots(toDateTime64('1980-12-12 21:01:02.1234', 4, 'UTC'), toDecimal64(600.1, 1), toDecimal64(299, 0));
```

Результат:

```text
┌─timeSlots(toDateTime('2012-01-01 12:20:00'), toUInt32(600))─┐
│ ['2012-01-01 12:00:00','2012-01-01 12:30:00']               │
└─────────────────────────────────────────────────────────────┘
┌─timeSlots(toDateTime('1980-12-12 21:01:02', 'UTC'), toUInt32(600), 299)─┐
│ ['1980-12-12 20:56:13','1980-12-12 21:01:12','1980-12-12 21:06:11']     │
└─────────────────────────────────────────────────────────────────────────┘
┌─timeSlots(toDateTime64('1980-12-12 21:01:02.1234', 4, 'UTC'), toDecimal64(600.1, 1), toDecimal64(299, 0))─┐
│ ['1980-12-12 20:56:13.0000','1980-12-12 21:01:12.0000','1980-12-12 21:06:11.0000']                        │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
## formatDateTime {#formatdatetime}

Форматирует время согласно заданной строке формата. Формат является константным выражением, поэтому вы не можете иметь несколько форматов для одного столбца результата.

formatDateTime использует стиль формата MySQL datetime, см. https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format.

Обратная операция этой функции — [parseDateTime](/sql-reference/functions/type-conversion-functions#parsedatetime).

Псевдоним: `DATE_FORMAT`.

**Синтаксис**

```sql
formatDateTime(Time, Format[, Timezone])
```

**Возвращаемое значение(я)**

Возвращает значения времени и даты в соответствии с определенным форматом.

**Поля замены**

Используя поля замены, вы можете определить шаблон для результирующей строки. В колонке «Пример» показан результат форматирования для `2018-01-02 22:33:44`.

| Заполнитель | Описание                                                                                                                                                                                         | Пример   |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| %a       | сокращенное название дня недели (Пн-Вс)                                                                                                                                                                  | Пн       |
| %b       | сокращенное название месяца (Янв-Дек)                                                                                                                                                                    | Янв       |
| %c       | месяц как целое число (01-12), см. 'Примечание 4' ниже                                                                                                                                              | 01        |
| %C       | год, деленный на 100 и округленный до целого (00-99)                                                                                                                                                | 20        |
| %d       | день месяца, с нулевым заполнением (01-31)                                                                                                                                                               | 02        |
| %D       | Короткая дата в формате MM/DD/YY, эквивалентная %m/%d/%y                                                                                                                                                         | 01/02/18  |
| %e       | день месяца, с пробеловым заполнением ( 1-31)                                                                                                                                                              | &nbsp; 2  |
| %f       | дробная секунда, см. 'Примечание 1' и 'Примечание 2' ниже                                                                                                                                                  | 123456    |
| %F       | короткая дата в формате YYYY-MM-DD, эквивалентная %Y-%m-%d                                                                                                                                                       | 2018-01-02 |
| %g       | двухзначный год, выровненный по стандарту ISO 8601, сокращенный от четырехзначной записи                                                                                                                    | 18       |
| %G       | год в четырехзначном формате для номера недели ISO, рассчитанный на основе года численности недель [определяемого стандартом ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), обычно полезен только с %V | 2018        |
| %h       | час в 12-часовом формате (01-12)                                                                                                                                                                          | 09        |
| %H       | час в 24-часовом формате (00-23)                                                                                                                                                                          | 22        |
| %i       | минуты (00-59)                                                                                                                                                                                      | 33        |
| %I       | час в 12-часовом формате (01-12)                                                                                                                                                                          | 10        |
| %j       | день в году (001-366)                                                                                                                                                                           | 002       |
| %k       | час в 24-часовом формате (00-23), см. 'Примечание 4' ниже                                                                                                                                                      | 14        |
| %l       | час в 12-часовом формате (01-12), см. 'Примечание 4' ниже                                                                                                                                                      | 09        |
| %m       | месяц как целое число (01-12)                                                                                                                                                                  | 01        |
| %M       | полное название месяца (Январь-Декабрь), см. 'Примечание 3' ниже                                                                                                                                              | Январь   |
| %n       | символ новой строки ('')                                                                                                                                                                             |           |
| %p       | обозначение AM или PM                                                                                                                                                                                | PM        |
| %Q       | Квартал (1-4)                                                                                                                                                                                       | 1         |
| %r       | время в формате 12-часового формата HH:MM AM/PM, эквивалентное %h:%i %p                                                                                                                                                    | 10:30 PM  |
| %R       | время в 24-часовом формате HH:MM, эквивалентное %H:%i                                                                                                                                                             | 22:33     |
| %s       | секунды (00-59)                                                                                                                                                                                      | 44        |
| %S       | секунды (00-59)                                                                                                                                                                                      | 44        |
| %t       | символ горизонтальной табуляции (')                                                                                                                                                                        |           |
| %T       | ISO 8601 формат времени (HH:MM:SS), эквивалентный %H:%i:%S                                                                                                                                             | 22:33:44  |
| %u       | ISO 8601 день недели как число с понедельником как 1 (1-7)                                                                                                                                                   | 2         |
| %V       | номер недели ISO 8601 (01-53)                                                                                                                                                                        | 01        |
| %w       | день недели как целое число с воскресеньем как 0 (0-6)                                                                                                                                                  | 2         |
| %W       | полное название дня недели (Понедельник-Воскресенье)                                                                                                                                                                   | Понедельник    |
| %y       | Год, последние две цифры (00-99)                                                                                                                                                                       | 18        |
| %Y       | Год                                                                                                                                                                                                | 2018      |
| %z       | Смещение времени от UTC, записанное в формате +HHMM или -HHMM                                                                                                                                                              | -0500     |
| %%       | символ %                                                                                                                                                                                            | %         |

Примечание 1: В версиях ClickHouse, предшествующих v23.4, `%f` выводит один ноль (0), если форматированное значение является датой, Date32 или DateTime (которые не имеют дробных секунд) или DateTime64 с нулевой точностью. Предыдущее поведение можно восстановить, установив параметр `formatdatetime_f_prints_single_zero = 1`.

Примечание 2: В версиях ClickHouse, предшествующих v25.1, `%f` выводит столько же знаков, сколько указано в масштабе DateTime64, вместо фиксированных 6 знаков. Предыдущее поведение можно восстановить, установив параметр `formatdatetime_f_prints_scale_number_of_digits= 1`.

Примечание 3: В версиях ClickHouse, предшествующих v23.4, `%M` выводит минуты (00-59), а не полное название месяца (Январь-Декабрь). Предыдущее поведение можно восстановить, установив параметр `formatdatetime_parsedatetime_m_is_month_name = 0`.

Примечание 4: В версиях ClickHouse, предшествующих v23.11, функция `parseDateTime()` требовала начальных нулей для форматтеров `%c` (месяц) и `%l`/`%k` (час), например, `07`. В более поздних версиях начальный ноль можно опустить, например, `7`. Предыдущее поведение можно восстановить, установив параметр `parsedatetime_parse_without_leading_zeros = 0`. Обратите внимание, что функция `formatDateTime()` по умолчанию все еще выводит начальные нули для `%c` и `%l`/`%k`, чтобы не нарушать существующие случаи использования. Это поведение можно изменить, установив параметр `formatdatetime_format_without_leading_zeros = 1`.

**Пример**

```sql
SELECT formatDateTime(toDate('2010-01-04'), '%g')
```

Результат:

```text
┌─formatDateTime(toDate('2010-01-04'), '%g')─┐
│ 10                                         │
└────────────────────────────────────────────┘
```

```sql
SELECT formatDateTime(toDateTime64('2010-01-04 12:34:56.123456', 7), '%f')
```

Результат:

```text
┌─formatDateTime(toDateTime64('2010-01-04 12:34:56.123456', 7), '%f')─┐
│ 1234560                                                             │
└─────────────────────────────────────────────────────────────────────┘
```

Дополнительно, функция `formatDateTime` может принимать третий строковый аргумент, содержащий название часового пояса. Пример: `Asia/Istanbul`. В этом случае время форматируется в соответствии с указанным часовым поясом.

**Пример**

```sql
SELECT
    now() AS ts,
    time_zone,
    formatDateTime(ts, '%T', time_zone) AS str_tz_time
FROM system.time_zones
WHERE time_zone LIKE 'Europe%'
LIMIT 10

┌──────────────────ts─┬─time_zone─────────┬─str_tz_time─┐
│ 2023-09-08 19:13:40 │ Europe/Amsterdam  │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Andorra    │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Astrakhan  │ 23:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Athens     │ 22:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Belfast    │ 20:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Belgrade   │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Berlin     │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Bratislava │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Brussels   │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Bucharest  │ 22:13:40    │
└─────────────────────┴───────────────────┴─────────────┘
```

**См. также**

- [formatDateTimeInJodaSyntax](#formatdatetimeinjodasyntax)
## formatDateTimeInJodaSyntax {#formatdatetimeinjodasyntax}

Похож на formatDateTime, за исключением того, что форматирует datetime в стиле Joda, а не в стиле MySQL. Смотрите https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html.

Обратная операция этой функции — [parseDateTimeInJodaSyntax](/sql-reference/functions/type-conversion-functions#parsedatetimeinjodasyntax).

**Поля замены**

Используя поля замены, вы можете определить шаблон для результирующей строки.

| Заполнитель | Описание                              | Презентация  | Примеры                           |
| ----------- | ---------------------------------------- | ------------- | ---------------------------------- |
| G           | эра                                      | текст          | Н.Э.                                 |
| C           | век эры (>=0)                     | число        | 20                                 |
| Y           | год эры (>=0)                        | год          | 1996                               |
| x           | недельный год (пока не поддерживается)             | год          | 1996                               |
| w           | неделя недельного года (пока не поддерживается)     | число        | 27                                 |
| e           | день недели                              | число        | 2                                  |
| E           | день недели                              | текст          | Вторник; Вт                       |
| y           | год                                     | год          | 1996                               |
| D           | день в году                              | число        | 189                                |
| M           | месяц года                            | месяц         | Июль; Июл; 07                      |
| d           | день месяца                             | число        | 10                                 |
| a           | половина дня                           | текст          | PM                                 |
| K           | час половины дня (0~11)                   | число        | 0                                  |
| h           | час секунды (1~12)              | число        | 12                                 |
| H           | час дня (0~23)                       | число        | 0                                  |
| k           | час дня (1~24)                  | число        | 24                                 |
| m           | минуты часа                           | число        | 30                                 |
| s           | секунды минуты                         | число        | 55                                 |
| S           | дробная секунда                       | число        | 978                                |
| z           | часовой пояс                                | текст          | Восточное стандартное время; EST         |
| Z           | смещение часового пояса                         | зона          | -0800; -0812                       |
| '           | экранирование для текста                          | разделитель     |                                    |
| ''          | одиночная кавычка                             | литерал       | '                                  |

**Пример**

```sql
SELECT formatDateTimeInJodaSyntax(toDateTime('2010-01-04 12:34:56'), 'yyyy-MM-dd HH:mm:ss')
```

Результат:

```java
┌─formatDateTimeInJodaSyntax(toDateTime('2010-01-04 12:34:56'), 'yyyy-MM-dd HH:mm:ss')─┐
│ 2010-01-04 12:34:56                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```
## dateName {#datename}

Возвращает указанную часть даты.

**Синтаксис**

```sql
dateName(date_part, date)
```

**Аргументы**

- `date_part` — Часть даты. Возможные значения: 'year', 'quarter', 'month', 'week', 'dayofyear', 'day', 'weekday', 'hour', 'minute', 'second'. [String](../data-types/string.md).
- `date` — Дата. [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).
- `timezone` — Часовой пояс. Необязательный. [String](../data-types/string.md).

**Возвращаемое значение**

- Указанная часть даты. [String](/sql-reference/data-types/string)

**Пример**

```sql
WITH toDateTime('2021-04-14 11:22:33') AS date_value
SELECT
    dateName('year', date_value),
    dateName('month', date_value),
    dateName('day', date_value);
```

Результат:

```text
┌─dateName('year', date_value)─┬─dateName('month', date_value)─┬─dateName('day', date_value)─┐
│ 2021                         │ April                         │ 14                          │
└──────────────────────────────┴───────────────────────────────┴─────────────────────────────┘
```
## monthName {#monthname}

Возвращает название месяца.

**Синтаксис**

```sql
monthName(date)
```

**Аргументы**

- `date` — Дата или дата с временем. [Date](../data-types/date.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

- Название месяца. [String](/sql-reference/data-types/string)

**Пример**

```sql
WITH toDateTime('2021-04-14 11:22:33') AS date_value
SELECT monthName(date_value);
```

Результат:

```text
┌─monthName(date_value)─┐
│ April                 │
└───────────────────────┘
```
```yaml
title: 'fromUnixTimestamp'
sidebar_label: 'fromUnixTimestamp'
keywords: ['fromUnixTimestamp', 'Unix timestamp', 'calendar date', 'time of day']
description: 'This function converts a Unix timestamp to a calendar date and a time of a day.'
```

## fromUnixTimestamp {#fromunixtimestamp}

Эта функция конвертирует метку времени Unix в календарную дату и время суток.

Её можно вызвать двумя способами:

Когда указан единственный аргумент типа [Integer](../data-types/int-uint.md), она возвращает значение типа [DateTime](../data-types/datetime.md), то есть ведёт себя как [toDateTime](../../sql-reference/functions/type-conversion-functions.md#todatetime).

Псевдоним: `FROM_UNIXTIME`.

**Пример:**

```sql
SELECT fromUnixTimestamp(423543535);
```

Результат:

```text
┌─fromUnixTimestamp(423543535)─┐
│          1983-06-04 10:58:55 │
└──────────────────────────────┘
```

Когда переданы два или три аргумента, где первый аргумент имеет тип [Integer](../data-types/int-uint.md), [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md), второй аргумент — это строка формата константы, а третий аргумент — необязательная строка временной зоны, то функция возвращает значение типа [String](/sql-reference/data-types/string), то есть ведёт себя как [formatDateTime](#formatdatetime). В этом случае используется [формат стиля даты MySQL](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format).

**Пример:**

```sql
SELECT fromUnixTimestamp(1234334543, '%Y-%m-%d %R:%S') AS DateTime;
```

Результат:

```text
┌─DateTime────────────┐
│ 2009-02-11 14:42:23 │
└─────────────────────┘
```

**См. Также**

- [fromUnixTimestampInJodaSyntax](#fromunixtimestampinjodasyntax)
## fromUnixTimestampInJodaSyntax {#fromunixtimestampinjodasyntax}

То же самое, что и [fromUnixTimestamp](#fromunixtimestamp), но при вызове вторым способом (два или три аргумента) форматирование выполняется с использованием [стиля Joda](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html), а не стиля MySQL.

**Пример:**

```sql
SELECT fromUnixTimestampInJodaSyntax(1234334543, 'yyyy-MM-dd HH:mm:ss', 'UTC') AS DateTime;
```

Результат:

```text
┌─DateTime────────────┐
│ 2009-02-11 06:42:23 │
└─────────────────────┘
```
## toModifiedJulianDay {#tomodifiedjulianday}

Конвертирует дату в текстовом формате [Proleptic Gregorian calendar](https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar) `YYYY-MM-DD` в число [Modified Julian Day](https://en.wikipedia.org/wiki/Julian_day#Variants) в Int32. Эта функция поддерживает даты с `0000-01-01` по `9999-12-31`. Она вызывает исключение, если аргумент не может быть разобран как дата или дата недействительна.

**Синтаксис**

```sql
toModifiedJulianDay(date)
```

**Аргументы**

- `date` — Дата в текстовом формате. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).

**Возвращаемое значение**

- Число Modified Julian Day. [Int32](../data-types/int-uint.md).

**Пример**

```sql
SELECT toModifiedJulianDay('2020-01-01');
```

Результат:

```text
┌─toModifiedJulianDay('2020-01-01')─┐
│                             58849 │
└───────────────────────────────────┘
```
## toModifiedJulianDayOrNull {#tomodifiedjuliandayornull}

Похоже на [toModifiedJulianDay()](#tomodifiedjulianday), но вместо вызова исключений возвращает `NULL`.

**Синтаксис**

```sql
toModifiedJulianDayOrNull(date)
```

**Аргументы**

- `date` — Дата в текстовом формате. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).

**Возвращаемое значение**

- Число Modified Julian Day. [Nullable(Int32)](../data-types/int-uint.md).

**Пример**

```sql
SELECT toModifiedJulianDayOrNull('2020-01-01');
```

Результат:

```text
┌─toModifiedJulianDayOrNull('2020-01-01')─┐
│                                   58849 │
└─────────────────────────────────────────┘
```
## fromModifiedJulianDay {#frommodifiedjulianday}

Конвертирует число [Modified Julian Day](https://en.wikipedia.org/wiki/Julian_day#Variants) в дату в текстовом формате [Proleptic Gregorian calendar](https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar) `YYYY-MM-DD`. Эта функция поддерживает номера дней с `-678941` по `2973483` (что соответствует 0000-01-01 и 9999-12-31 соответственно). Она вызывает исключение, если номер дня выходит за пределы поддерживаемого диапазона.

**Синтаксис**

```sql
fromModifiedJulianDay(day)
```

**Аргументы**

- `day` — Число Modified Julian Day. [Любые целые типы](../data-types/int-uint.md).

**Возвращаемое значение**

- Дата в текстовом формате. [String](../data-types/string.md)

**Пример**

```sql
SELECT fromModifiedJulianDay(58849);
```

Результат:

```text
┌─fromModifiedJulianDay(58849)─┐
│ 2020-01-01                   │
└──────────────────────────────┘
```
## fromModifiedJulianDayOrNull {#frommodifiedjuliandayornull}

Похоже на [fromModifiedJulianDayOrNull()](#frommodifiedjuliandayornull), но вместо вызова исключений возвращает `NULL`.

**Синтаксис**

```sql
fromModifiedJulianDayOrNull(day)
```

**Аргументы**

- `day` — Число Modified Julian Day. [Любые целые типы](../data-types/int-uint.md).

**Возвращаемое значение**

- Дата в текстовом формате. [Nullable(String)](../data-types/string.md)

**Пример**

```sql
SELECT fromModifiedJulianDayOrNull(58849);
```

Результат:

```text
┌─fromModifiedJulianDayOrNull(58849)─┐
│ 2020-01-01                         │
└────────────────────────────────────┘
```
## toUTCTimestamp {#toutctimestamp}

Конвертирует значение типа DateTime/DateTime64 из другой временной зоны в метку времени в UTC. Эта функция в основном включена для совместимости с Apache Spark и подобными фреймворками.

**Синтаксис**

```sql
toUTCTimestamp(time_val, time_zone)
```

**Аргументы**

- `time_val` — Константное значение типа DateTime/DateTime64 или выражение. [Типы DateTime/DateTime64](../data-types/datetime.md)
- `time_zone` — Константное строковое значение или выражение, представляющее временную зону. [Строковые типы](../data-types/string.md)

**Возвращаемое значение**

- DateTime/DateTime64 в текстовом формате

**Пример**

```sql
SELECT toUTCTimestamp(toDateTime('2023-03-16'), 'Asia/Shanghai');
```

Результат:

```text
┌─toUTCTimestamp(toDateTime('2023-03-16'), 'Asia/Shanghai')┐
│                                     2023-03-15 16:00:00 │
└─────────────────────────────────────────────────────────┘
```
## fromUTCTimestamp {#fromutctimestamp}

Конвертирует значение типа DateTime/DateTime64 из временной зоны UTC в метку времени в другой временной зоне. Эта функция в основном включена для совместимости с Apache Spark и подобными фреймворками.

**Синтаксис**

```sql
fromUTCTimestamp(time_val, time_zone)
```

**Аргументы**

- `time_val` — Константное значение типа DateTime/DateTime64 или выражение. [Типы DateTime/DateTime64](../data-types/datetime.md)
- `time_zone` — Константное строковое значение или выражение, представляющее временную зону. [Строковые типы](../data-types/string.md)

**Возвращаемое значение**

- DateTime/DateTime64 в текстовом формате

**Пример**

```sql
SELECT fromUTCTimestamp(toDateTime64('2023-03-16 10:00:00', 3), 'Asia/Shanghai');
```

Результат:

```text
┌─fromUTCTimestamp(toDateTime64('2023-03-16 10:00:00',3), 'Asia/Shanghai')─┐
│                                                 2023-03-16 18:00:00.000 │
└─────────────────────────────────────────────────────────────────────────┘
```
## UTCTimestamp {#utctimestamp}

Возвращает текущую дату и время на момент анализа запроса. Функция является константным выражением.

:::note
Эта функция выдаёт тот же результат, что и `now('UTC')`. Она была добавлена только для поддержки MySQL, и [`now`](#now) является предпочтительным вариантом использования.
:::

**Синтаксис**

```sql
UTCTimestamp()
```

Псевдоним: `UTC_timestamp`.

**Возвращаемое значение**

- Возвращает текущую дату и время на момент анализа запроса. [DateTime](../data-types/datetime.md).

**Пример**

Запрос:

```sql
SELECT UTCTimestamp();
```

Результат:

```response
┌──────UTCTimestamp()─┐
│ 2024-05-28 08:32:09 │
└─────────────────────┘
```
## timeDiff {#timediff}

Возвращает разницу между двумя датами или датами с часовыми значениями. Разница рассчитывается в единицах секунд. Это то же самое, что и `dateDiff`, и было добавлено только для поддержки MySQL. `dateDiff` рекомендуется использовать.

**Синтаксис**

```sql
timeDiff(first_datetime, second_datetime)
```

**Аргументы**

- `first_datetime` — Константное значение типа DateTime/DateTime64 или выражение. [Типы DateTime/DateTime64](../data-types/datetime.md)
- `second_datetime` — Константное значение типа DateTime/DateTime64 или выражение. [Типы DateTime/DateTime64](../data-types/datetime.md)

**Возвращаемое значение**

Разница между двумя датами или датами с часовыми значениями в секундах.

**Пример**

Запрос:

```sql
timeDiff(toDateTime64('1927-01-01 00:00:00', 3), toDate32('1927-01-02'));
```

**Результат**:

```response
┌─timeDiff(toDateTime64('1927-01-01 00:00:00', 3), toDate32('1927-01-02'))─┐
│                                                                    86400 │
└──────────────────────────────────────────────────────────────────────────┘
```
## Related content {#related-content}

- Блог: [Работа с данными временных рядов в ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
