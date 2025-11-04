---
slug: '/interfaces/formats/SQLInsert'
description: 'Документация для формата SQLInsert'
title: SQLInsert
keywords: ['SQLInsert']
doc_type: reference
input_format: false
output_format: true
---
| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## Описание {#description}

Выводит данные в виде последовательности операторов `INSERT INTO table (columns...) VALUES (...), (...) ...;`.

## Пример использования {#example-usage}

Пример:

```sql
SELECT number AS x, number + 1 AS y, 'Hello' AS z FROM numbers(10) FORMAT SQLInsert SETTINGS output_format_sql_insert_max_batch_size = 2
```

```sql
INSERT INTO table (x, y, z) VALUES (0, 1, 'Hello'), (1, 2, 'Hello');
INSERT INTO table (x, y, z) VALUES (2, 3, 'Hello'), (3, 4, 'Hello');
INSERT INTO table (x, y, z) VALUES (4, 5, 'Hello'), (5, 6, 'Hello');
INSERT INTO table (x, y, z) VALUES (6, 7, 'Hello'), (7, 8, 'Hello');
INSERT INTO table (x, y, z) VALUES (8, 9, 'Hello'), (9, 10, 'Hello');
```

Чтобы прочитать данные, выведенные в этом формате, вы можете использовать формат ввода [MySQLDump](../formats/MySQLDump.md).

## Настройки формата {#format-settings}

| Настройка                                                                                                                                 | Описание                                         | По умолчанию   |
|-------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------|----------------|
| [`output_format_sql_insert_max_batch_size`](../../operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size)       | Максимальное количество строк в одном операторе INSERT. | `65505`        |
| [`output_format_sql_insert_table_name`](../../operations/settings/settings-formats.md/#output_format_sql_insert_table_name)               | Имя таблицы в выходном операторе INSERT.              | `'table'`      |
| [`output_format_sql_insert_include_column_names`](../../operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names) | Включить имена колонок в оператор INSERT.            | `true`         |
| [`output_format_sql_insert_use_replace`](../../operations/settings/settings-formats.md/#output_format_sql_insert_use_replace)             | Использовать оператор REPLACE вместо INSERT.         | `false`        |
| [`output_format_sql_insert_quote_names`](../../operations/settings/settings-formats.md/#output_format_sql_insert_quote_names)             | Обрамлять имена колонок символами "\`".           | `true`         |