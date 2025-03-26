---
description: 'Создает временную таблицу Merge. Структура таблицы берется из первой таблицы, которая соответствует регекс.'
sidebar_label: 'merge'
sidebar_position: 130
slug: /sql-reference/table-functions/merge
title: 'merge'
---


# merge Табличная Функция

Создает временную [Merge](../../engines/table-engines/special/merge.md) таблицу. Структура таблицы берется из первой таблицы, которая соответствует регулярному выражению.

**Синтаксис**

```sql
merge(['db_name',] 'tables_regexp')
```
**Аргументы**

- `db_name` — Возможные значения (необязательно, по умолчанию `currentDatabase()`):
    - имя базы данных,
    - константное выражение, возвращающее строку с именем базы данных, например, `currentDatabase()`,
    - `REGEXP(expression)`, где `expression` — это регулярное выражение для совпадения с именами БД.

- `tables_regexp` — Регулярное выражение для совпадения с именами таблиц в указанной БД или БД.

**См. также**

- [Merge](../../engines/table-engines/special/merge.md) движок таблиц
