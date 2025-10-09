---
slug: '/sql-reference/data-types/time64'
sidebar_label: Time64
sidebar_position: 17
description: 'Документация для типа данных Time64 в ClickHouse, который хранит временной'
title: Time64
doc_type: reference
---
# Time64

Тип данных `Time64` представляет собой время суток с долями секунд. 
Он не содержит календарных компонентов даты (день, месяц, год). 
Параметр `precision` определяет количество дробных цифр и, следовательно, размер тика.

Размер тика (точность): 10<sup>-precision</sup> секунд. Допустимый диапазон: 0..9. Общие значения: 3 (миллисекунды), 6 (микросекунды) и 9 (наносекунды).

**Синтаксис:**

```sql
Time64(precision)
```

Внутри `Time64` хранится_signed 64-битное десятичное (Decimal64) число долей секунд. 
Разрешение тика определяется параметром `precision`. 
Часовые пояса не поддерживаются: указание часового пояса при использовании `Time64` приведёт к ошибке.

В отличие от `DateTime64`, `Time64` не хранит компонент даты. 
Смотрите также [`Time`](../../sql-reference/data-types/time.md).

Диапазон текстового представления: [-999:59:59.000, 999:59:59.999] для `precision = 3`. В общем случае минимум составляет `-999:59:59`, а максимум составляет `999:59:59` с до `precision` дробными цифрами (для `precision = 9` минимум составляет `-999:59:59.999999999`).

## Implementation details {#implementation-details}

**Representation**. 
Подписанное значение `Decimal64`, подсчитывающее доли секунды с `precision` дробными цифрами.

**Normalization**. 
При анализе строк в `Time64` временные компоненты нормализуются и не валидируются. 
Например, `25:70:70` интерпретируется как `26:11:10`.

**Negative values**. 
Поддерживаются и сохраняются начальные знаки минус. 
Отрицательные значения обычно возникают в результате арифметических операций над значениями `Time64`. 
Для `Time64` отрицательные входные данные сохраняются как текстовые (например, `'-01:02:03.123'`) так и числовые (например, `-3723.123`).

**Saturation**. 
Компонент времени суток ограничен диапазоном [-999:59:59.xxx, 999:59:59.xxx] при преобразовании в компоненты или сериализации в текст. 
Хранимое числовое значение может превышать этот диапазон; однако любая извлечение компонентов (часы, минуты, секунды) и текстовое представление используют насыщенное значение.

**Time zones**. 
`Time64` не поддерживает часовые пояса. 
Указание часового пояса при создании типа или значения `Time64` приводит к ошибке. 
Аналогичным образом, попытки применить или изменить часовой пояс для колонок `Time64` не поддерживаются и приводят к ошибке.

## Examples {#examples}

1. Создание таблицы с колонкой типа `Time64` и вставка данных в неё:

```sql
CREATE TABLE tab64
(
    `event_id` UInt8,
    `time` Time64(3)
)
ENGINE = TinyLog;
```

```sql
-- Parse Time64
-- - from string,
-- - from a number of seconds since 00:00:00 (fractional part according to precision).
INSERT INTO tab64 VALUES (1, '14:30:25'), (2, 52225.123), (3, '14:30:25');

SELECT * FROM tab64 ORDER BY event_id;
```

```text
   ┌─event_id─┬────────time─┐
1. │        1 │ 14:30:25.000 │
2. │        2 │ 14:30:25.123 │
3. │        3 │ 14:30:25.000 │
   └──────────┴──────────────┘
```

2. Фильтрация по значениям `Time64`

```sql
SELECT * FROM tab64 WHERE time = toTime64('14:30:25', 3);
```

```text
   ┌─event_id─┬────────time─┐
1. │        1 │ 14:30:25.000 │
2. │        3 │ 14:30:25.000 │
   └──────────┴──────────────┘
```

```sql
SELECT * FROM tab64 WHERE time = toTime64(52225.123, 3);
```

```text
   ┌─event_id─┬────────time─┐
1. │        2 │ 14:30:25.123 │
   └──────────┴──────────────┘
```

Примечание: `toTime64` анализирует числовые литералы как секунды с дробной частью в соответствии с заданной точностью, поэтому указывайте намеренные дробные цифры явно.

3. Проверка результирующего типа:

```sql
SELECT CAST('14:30:25.250' AS Time64(3)) AS column, toTypeName(column) AS type;
```

```text
   ┌────────column─┬─type──────┐
1. │ 14:30:25.250 │ Time64(3) │
   └───────────────┴───────────┘
```

**Смотрите также**

- [Функции преобразования типов](../../sql-reference/functions/type-conversion-functions.md)
- [Функции для работы с датами и временем](../../sql-reference/functions/date-time-functions.md)
- [Параметр `date_time_input_format`](../../operations/settings/settings-formats.md#date_time_input_format)
- [Параметр `date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format)
- [Параметр конфигурации сервера `timezone`](../../operations/server-configuration-parameters/settings.md#timezone)
- [Параметр `session_timezone`](../../operations/settings/settings.md#session_timezone)
- [Операторы для работы с датами и временем](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
- [`Date` тип данных](../../sql-reference/data-types/date.md)
- [`Time` тип данных](../../sql-reference/data-types/time.md)
- [`DateTime` тип данных](../../sql-reference/data-types/datetime.md)