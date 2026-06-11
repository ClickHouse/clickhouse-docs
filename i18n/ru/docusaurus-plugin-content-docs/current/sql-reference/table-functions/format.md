---
description: 'Разбирает данные из аргументов в соответствии с указанным входным форматом. Если аргумент `structure` не указан, он автоматически определяется по данным.'
slug: /sql-reference/table-functions/format
sidebar_position: 65
sidebar_label: 'format'
title: 'format'
doc_type: 'reference'
---

Разбирает данные из аргументов в соответствии с указанным входным форматом. Если аргумент `structure` не указан, он автоматически определяется по данным.

## Синтаксис \{#syntax\}

```sql
format(format_name, [structure], data)
```

## Аргументы \{#arguments\}

* `format_name` — [формат](/sql-reference/formats) данных.
* `structure` — структура таблицы. Необязательный параметр. Формат: `column1_name column1_type, column2_name column2_type, ...`.
* `data` — строковый литерал или константное выражение, которое возвращает строку с данными в заданном формате.

## Возвращаемое значение \{#returned_value\}

Таблица с данными, полученными при разборе аргумента `data` в соответствии с указанным форматом и заданной или определённой структурой.

## Примеры \{#examples\}

Без аргумента `structure`:

```sql title="Query"
SELECT * FROM format(JSONEachRow,
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

```response title="Response"
┌───b─┬─a─────┐
│ 111 │ Hello │
│ 123 │ World │
│ 112 │ Hello │
│ 124 │ World │
└─────┴───────┘
```

```sql title="Query"
DESC format(JSONEachRow,
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

```response title="Response"
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ b    │ Nullable(Float64) │              │                    │         │                  │                │
│ a    │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

С аргументом `structure`:

```sql title="Query"
SELECT * FROM format(JSONEachRow, 'a String, b UInt32',
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

```response title="Response"
┌─a─────┬───b─┐
│ Hello │ 111 │
│ World │ 123 │
│ Hello │ 112 │
│ World │ 124 │
└───────┴─────┘
```

## См. также \{#related\}

* [Форматы](../../interfaces/formats.md)