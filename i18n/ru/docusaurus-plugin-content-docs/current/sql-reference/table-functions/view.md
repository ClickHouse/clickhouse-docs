---
description: 'Преобразует подзапрос в таблицу. Функция реализует представления.'
sidebar_label: 'view'
sidebar_position: 210
slug: /sql-reference/table-functions/view
title: 'view'
doc_type: 'reference'
---



# Табличная функция view

Преобразует подзапрос в таблицу. Эта функция реализует представления (см. [CREATE VIEW](/sql-reference/statements/create/view)). Получающаяся таблица не хранит данные, а только указанный запрос `SELECT`. При чтении из таблицы ClickHouse выполняет запрос и удаляет все ненужные столбцы из результата.



## Синтаксис {#syntax}

```sql
view(subquery)
```


## Аргументы {#arguments}

- `subquery` — запрос `SELECT`.


## Возвращаемое значение {#returned_value}

- Таблица.


## Примеры {#examples}

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

Функцию `view` можно использовать в качестве параметра табличных функций [remote](/sql-reference/table-functions/remote) и [cluster](/sql-reference/table-functions/cluster):

```sql
SELECT * FROM remote(`127.0.0.1`, view(SELECT a, b, c FROM table_name));
```

```sql
SELECT * FROM cluster(`cluster_name`, view(SELECT a, b, c FROM table_name));
```


## Связанные разделы {#related}

- [Движок таблиц View](/engines/table-engines/special/view/)
