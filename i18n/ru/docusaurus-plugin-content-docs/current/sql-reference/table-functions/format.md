---
description: 'Парсит данные из аргументов в соответствии с указанным входным форматом. Если аргумент structure не указан, структура определяется по данным.'
slug: /sql-reference/table-functions/format
sidebar_position: 65
sidebar_label: 'format'
title: 'format'
doc_type: 'reference'
---



# Табличная функция format

Разбирает данные из аргументов в соответствии с указанным входным форматом. Если аргумент structure не задан, структура определяется по данным.



## Синтаксис {#syntax}

```sql
format(format_name, [structure], data)
```


## Аргументы {#arguments}

- `format_name` — [Формат](/sql-reference/formats) данных.
- `structure` — Структура таблицы. Необязательный параметр. Формат: 'column1_name column1_type, column2_name column2_type, ...'.
- `data` — Строковый литерал или константное выражение, возвращающее строку с данными в указанном формате.


## Возвращаемое значение {#returned_value}

Таблица с данными, распарсенными из аргумента `data` согласно указанному формату и заданной или извлечённой структуре.


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


## Связанные разделы {#related}

- [Форматы](../../interfaces/formats.md)
