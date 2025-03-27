---
description: 'Парсит данные из аргументов по указанному входному формату. Если аргумент структуры не указан, он извлекается из данных.'
slug: /sql-reference/table-functions/format
sidebar_position: 65
sidebar_label: 'format'
title: 'format'
---


# Функция таблицы format

Парсит данные из аргументов по указанному входному формату. Если аргумент структуры не указан, он извлекается из данных.

**Синтаксис**

```sql
format(format_name, [structure], data)
```

**Параметры**

- `format_name` — [формат](/sql-reference/formats) данных.
- `structure` - Структура таблицы. Необязательный. Формат 'column1_name column1_type, column2_name column2_type, ...'.
- `data` — Строковый литерал или константное выражение, возвращающее строку, содержащую данные в указанном формате.

**Возвращаемое значение**

Таблица с данными, распарсенными из аргумента `data` по указанному формату и заданной или извлеченной структуре.

**Примеры**

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

**См. также**

- [Форматы](../../interfaces/formats.md)
