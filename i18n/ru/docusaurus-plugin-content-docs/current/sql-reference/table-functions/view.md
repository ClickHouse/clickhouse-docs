---
slug: '/sql-reference/table-functions/view'
sidebar_label: представление
sidebar_position: 210
description: 'Преобразует подзапрос в таблицу. Функция реализует views.'
title: представление
doc_type: reference
---
# view Table Function

Преобразует подзапрос в таблицу. Функция реализует представления (см. [CREATE VIEW](/sql-reference/statements/create/view)). Результирующая таблица не хранит данные, а только сохраняет указанный `SELECT` запрос. При чтении из таблицы ClickHouse выполняет запрос и удаляет все ненужные столбцы из результата.

## Syntax {#syntax}

```sql
view(subquery)
```

## Arguments {#arguments}

- `subquery` — `SELECT` запрос.

## Returned value {#returned_value}

- Таблица.

## Examples {#examples}

Входная таблица:

```text
┌─id─┬─name─────┬─days─┐
│  1 │ January  │   31 │
│  2 │ February │   29 │
│  3 │ March    │   31 │
│  4 │ April    │   30 │
└────┴──────────┴──────┘
```

Запрос:

```sql
SELECT * FROM view(SELECT name FROM months);
```

Результат:

```text
┌─name─────┐
│ January  │
│ February │
│ March    │
│ April    │
└──────────┘
```

Вы можете использовать функцию `view` в качестве параметра для [remote](/sql-reference/table-functions/remote) и [cluster](/sql-reference/table-functions/cluster) таблиц:

```sql
SELECT * FROM remote(`127.0.0.1`, view(SELECT a, b, c FROM table_name));
```

```sql
SELECT * FROM cluster(`cluster_name`, view(SELECT a, b, c FROM table_name));
```

## Related {#related}

- [View Table Engine](/engines/table-engines/special/view/)