---
description: 'Документация по типу данных Time в ClickHouse, который представляет диапазон времени с точностью до секунды'
slug: /sql-reference/data-types/time
sidebar_position: 15
sidebar_label: 'Time'
title: 'Time'
doc_type: 'reference'
---

# Time {#time}

Тип данных `Time` представляет время с компонентами часов, минут и секунд.
Он не зависит от какой-либо календарной даты и подходит для значений, которым не нужны компоненты дня, месяца и года.

Синтаксис:

```

Text representation range: [-999:59:59, 999:59:59].

Resolution: 1 second.

## Implementation details {#implementation-details}

**Representation and Performance**.
Data type `Time` internally stores a signed 32-bit integer that encodes the seconds.
Values of type `Time` and `DateTime` have the same byte size and thus comparable performance.

**Normalization**.
When parsing strings to `Time`, the time components are normalized and not validated.
For example, `25:70:70` is interpreted as `26:11:10`.

**Negative values**.
Leading minus signs are supported and preserved.
Negative values typically arise from arithmetic operations on `Time` values.
For `Time` type, negative inputs are preserved for both text (e.g., `'-01:02:03'`) and numeric inputs (e.g., `-3723`).

**Saturation**.
The time-of-day component is capped to the range [-999:59:59, 999:59:59].
Values with hours beyond 999 (or below -999) are represented and round-tripped via text as `999:59:59` (or `-999:59:59`).

**Time zones**.
`Time` does not support time zones, i.e. `Time` value are interpreted without regional context.
Specifying a time zone for `Time` as a type parameter or during value creation throws an error.
Likewise, attempts to apply or change the time zone on `Time` columns are not supported and result in an error.
`Time` values are not silently reinterpreted under different time zones.

## Examples {#examples}

**1.** Creating a table with a `Time`-type column and inserting data into it:

```

Диапазон текстового представления: [-999:59:59, 999:59:59].

Точность: 1 секунда.

## Подробности реализации {#implementation-details}

**Представление и производительность**.
Тип данных `Time` внутренне представляет собой знаковое 32-битное целое число, кодирующее количество секунд.
Значения типов `Time` и `DateTime` имеют одинаковый размер в байтах и, следовательно, сопоставимую производительность.

**Нормализация**.
При разборе строк в значение типа `Time` компоненты времени нормализуются, но не проходят проверку корректности.
Например, `25:70:70` интерпретируется как `26:11:10`.

**Отрицательные значения**.
Лидирующие знаки минус поддерживаются и сохраняются.
Отрицательные значения обычно возникают при выполнении арифметических операций над значениями `Time`.
Для типа `Time` отрицательные входные данные сохраняются как для текстовых (например, `'-01:02:03'`), так и для числовых значений (например, `-3723`).

**Ограничение значений (saturation)**.
Компонента времени суток ограничивается диапазоном [-999:59:59, 999:59:59].
Значения с количеством часов больше 999 (или меньше -999) в текстовом представлении и при обратном разборе передаются как `999:59:59` (или `-999:59:59`).

**Часовые пояса**.
`Time` не поддерживает часовые пояса, то есть значения `Time` интерпретируются без регионального контекста.
Указание часового пояса для `Time` как параметра типа или при создании значения приводит к ошибке.
Аналогично, попытки применить или изменить часовой пояс для столбцов типа `Time` не поддерживаются и приводят к ошибке.
Значения `Time` не переинтерпретируются автоматически при смене часового пояса.

## Примеры {#examples}

**1.** Создание таблицы со столбцом типа `Time` и запись данных в неё:

```

```

```

```

```

**2.** Filtering on `Time` values

```

**2.** Фильтрация по значениям поля `Time`

```

```

```

`Time` column values can be filtered using a string value in `WHERE` predicate. It will be converted to `Time` automatically:

```

Значения столбца `Time` можно фильтровать по строковому значению в предикате `WHERE`. Оно будет автоматически приведено к типу `Time`:

```

```

```

**3.** Inspecting the resulting type:

```

**3.** Проверка полученного типа:

```

```

```text
   ┌────column─┬─type─┐
1. │ 14:30:25 │ Time │
   └───────────┴──────┘
```

## См. также {#see-also}

- [Функции преобразования типов](../functions/type-conversion-functions.md)
- [Функции для работы с датами и временем](../functions/date-time-functions.md)
- [Функции для работы с массивами](../functions/array-functions.md)
- [Настройка `date_time_input_format`](../../operations/settings/settings-formats.md#date_time_input_format)
- [Настройка `date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format)
- [Параметр конфигурации сервера `timezone`](../../operations/server-configuration-parameters/settings.md#timezone)
- [Настройка `session_timezone`](../../operations/settings/settings.md#session_timezone)
- [Тип данных `DateTime`](datetime.md)
- [Тип данных `Date`](date.md)
