---
slug: '/sql-reference/table-functions/format'
sidebar_label: format
sidebar_position: 65
description: 'Парсинг данных из аргументов в соответствии с указанным входным форматом.'
title: format
doc_type: reference
---
# format Table Function

Парсит данные из аргументов в соответствии с заданным форматом ввода. Если аргумент structure не указан, он извлекается из данных.

## Синтаксис {#syntax}

```sql
format(format_name, [structure], data)
```

## Аргументы {#arguments}

- `format_name` — [формат](/sql-reference/formats) данных.
- `structure` - Структура таблицы. Необязательный. Формат 'column1_name column1_type, column2_name column2_type, ...'.
- `data` — Строковый литерал или константное выражение, которое возвращает строку, содержащую данные в заданном формате.

## Возвращаемое значение {#returned_value}

Таблица с данными, распарсенными из аргумента `data` в соответствии с заданным форматом и указанной или извлеченной структурой.

## Примеры {#examples}

Без аргумента `structure`:

**Запрос:**
```sql
SELECT * FROM format(JSONEachRow,
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**Результат:**

```response
┌───b─┬─a─────┐
│ 111 │ Hello │
│ 123 │ World │
│ 112 │ Hello │
│ 124 │ World │
└─────┴───────┘
```

**Запрос:**
```sql
DESC format(JSONEachRow,
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**Результат:**

```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ b    │ Nullable(Float64) │              │                    │         │                  │                │
│ a    │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

С аргументом `structure`:

**Запрос:**
```sql
SELECT * FROM format(JSONEachRow, 'a String, b UInt32',
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**Результат:**
```response
┌─a─────┬───b─┐
│ Hello │ 111 │
│ World │ 123 │
│ Hello │ 112 │
│ World │ 124 │
└───────┴─────┘
```

## Связанные {#related}

- [Форматы](../../interfaces/formats.md)