---
description: 'Документация по типу данных Time64 в ClickHouse, предназначенному для хранения диапазона времени с субсекундной точностью'
slug: /sql-reference/data-types/time64
sidebar_position: 17
sidebar_label: 'Time64'
title: 'Time64'
doc_type: 'reference'
---

# Time64 {#time64}

Тип данных `Time64` представляет время суток с дробными секундами.
Он не содержит компонентов календарной даты (день, месяц, год).
Параметр `precision` определяет количество знаков после запятой и, соответственно, размер тика.

Размер тика (precision): 10<sup>-precision</sup> секунды. Допустимый диапазон: 0..9. Наиболее часто используются значения: 3 (миллисекунды), 6 (микросекунды) и 9 (наносекунды).

**Синтаксис:**

```

Internally, `Time64` stores a signed 64-bit decimal (Decimal64) number of fractional seconds.
The tick resolution is determined by the `precision` parameter.
Time zones are not supported: specifying a time zone with `Time64` will throw an error.

Unlike `DateTime64`, `Time64` does not store a date component.
See also [`Time`](../../sql-reference/data-types/time.md).

Text representation range: [-999:59:59.000, 999:59:59.999] for `precision = 3`. In general, the minimum is `-999:59:59` and the maximum is `999:59:59` with up to `precision` fractional digits (for `precision = 9`, the minimum is `-999:59:59.999999999`).

## Implementation details {#implementation-details}

**Representation**.
Signed `Decimal64` value counting fractional second with `precision` fractional digits.

**Normalization**.
When parsing strings to `Time64`, the time components are normalized and not validated.
For example, `25:70:70` is interpreted as `26:11:10`.

**Negative values**.
Leading minus signs are supported and preserved.
Negative values typically arise from arithmetic operations on `Time64` values.
For `Time64`, negative inputs are preserved for both text (e.g., `'-01:02:03.123'`) and numeric inputs (e.g., `-3723.123`).

**Saturation**.
The time-of-day component is capped to the range [-999:59:59.xxx, 999:59:59.xxx] when converting to components or serialising to text.
The stored numeric value may exceed this range; however, any component extraction (hours, minutes, seconds) and textual representation use the saturated value.

**Time zones**.
`Time64` does not support time zones.
Specifying a time zone when creating a `Time64` type or value throws an error.
Likewise, attempts to apply or change the time zone on `Time64` columns is not supported and results in an error.

## Examples {#examples}

1. Creating a table with a `Time64`-type column and inserting data into it:

```

Внутренне тип `Time64` хранит знаковое 64-битное десятичное число (Decimal64), представляющее дробные секунды.
Разрешение тиков определяется параметром `precision`.
Часовые пояса не поддерживаются: указание часового пояса для `Time64` приведёт к ошибке.

В отличие от `DateTime64`, `Time64` не хранит дату.
См. также [`Time`](../../sql-reference/data-types/time.md).

Диапазон текстового представления значений: [-999:59:59.000, 999:59:59.999] для `precision = 3`. В общем случае минимум — `-999:59:59`, максимум — `999:59:59` с количеством дробных цифр до значения `precision` (для `precision = 9` минимум — `-999:59:59.999999999`).

## Подробности реализации {#implementation-details}

**Представление**.  
Знаковое значение типа `Decimal64`, представляющее количество долей секунды с `precision` знаками после запятой.

**Нормализация**.  
При разборе строк в значение типа `Time64` компоненты времени нормализуются, но не проверяются на корректность.  
Например, `25:70:70` интерпретируется как `26:11:10`.

**Отрицательные значения**.  
Ведущий знак минус поддерживается и сохраняется.  
Отрицательные значения обычно возникают в результате арифметических операций над значениями `Time64`.  
Для `Time64` отрицательные входные значения сохраняются как для текстовых (например, `'-01:02:03.123'`), так и для числовых входных данных (например, `-3723.123`).

**Сатурация (ограничение диапазона)**.  
Компонента времени суток ограничивается диапазоном [-999:59:59.xxx, 999:59:59.xxx] при преобразовании в компоненты или сериализации в текст.  
Сохраняемое числовое значение может выходить за этот диапазон; однако любое извлечение компонентов (часы, минуты, секунды) и текстовое представление используют ограниченное (сатурированное) значение.

**Часовые пояса**.  
`Time64` не поддерживает часовые пояса.  
Указание часового пояса при создании типа или значения `Time64` приводит к ошибке.  
Аналогично, попытки применить или изменить часовой пояс для столбцов `Time64` не поддерживаются и приводят к ошибке.

## Примеры {#examples}

1. Создание таблицы со столбцом типа `Time64` и вставка в неё данных:

```

```

```

```

```

2. Filtering on `Time64` values

```

2. Фильтрация по значениям типа `Time64`

```

```

```

```

```

```

```

Note: `toTime64` parses numeric literals as seconds with a fractional part according to the specified precision, so provide the intended fractional digits explicitly.

3. Inspecting the resulting type:

```

Примечание: `toTime64` разбирает числовые литералы как секунды с дробной частью в соответствии с указанной точностью, поэтому явно указывайте требуемое количество знаков после запятой.

3. Проверка получившегося типа:

```

```

```text
   ┌────────column─┬─type──────┐
1. │ 14:30:25.250 │ Time64(3) │
   └───────────────┴───────────┘
```

**См. также**

* [Функции преобразования типов](../../sql-reference/functions/type-conversion-functions.md)
* [Функции для работы с датами и временем](../../sql-reference/functions/date-time-functions.md)
* [Настройка `date_time_input_format`](../../operations/settings/settings-formats.md#date_time_input_format)
* [Настройка `date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format)
* [Параметр конфигурации сервера `timezone`](../../operations/server-configuration-parameters/settings.md#timezone)
* [Настройка `session_timezone`](../../operations/settings/settings.md#session_timezone)
* [Операторы для работы с датами и временем](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
* [Тип данных `Date`](../../sql-reference/data-types/date.md)
* [Тип данных `Time`](../../sql-reference/data-types/time.md)
* [Тип данных `DateTime`](../../sql-reference/data-types/datetime.md)
