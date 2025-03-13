---
slug: /sql-reference/table-functions/merge
sidebar_position: 130
sidebar_label: merge
title: 'merge'
description: 'Создает временную таблицу Merge. Структура таблицы берется из первой найденной таблицы, которая соответствует регулярному выражению.'
---


# merge Table Function

Создает временную [Merge](../../engines/table-engines/special/merge.md) таблицу. Структура таблицы берется из первой найденной таблицы, которая соответствует регулярному выражению.

**Синтаксис**

```sql
merge(['db_name',] 'tables_regexp')
```
**Аргументы**

- `db_name` — Возможные значения (необязательно, по умолчанию `currentDatabase()`):
    - имя базы данных,
    - константное выражение, которое возвращает строку с именем базы данных, например, `currentDatabase()`,
    - `REGEXP(expression)`, где `expression` — регулярное выражение для сопоставления с именами БД.

- `tables_regexp` — Регулярное выражение для сопоставления с именами таблиц в указанной БД или БД.

**Смотрите также**

- [Merge](../../engines/table-engines/special/merge.md) движок таблицы
