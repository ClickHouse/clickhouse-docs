---
description: 'Функция табличного типа loop в ClickHouse используется для возврата результатов запроса в бесконечном цикле.'
slug: /sql-reference/table-functions/loop
title: 'loop'
---


# Функция табличного типа loop

**Синтаксис**

```sql
SELECT ... FROM loop(database, table);
SELECT ... FROM loop(database.table);
SELECT ... FROM loop(table);
SELECT ... FROM loop(other_table_function(...));
```

**Параметры**

- `database` — имя базы данных.
- `table` — имя таблицы.
- `other_table_function(...)` — другая табличная функция.
  Пример: `SELECT * FROM loop(numbers(10));`
  Здесь `other_table_function(...)` является `numbers(10)`.

**Возвращаемое значение**

Бесконечный цикл для возврата результатов запроса.

**Примеры**

Выбор данных из ClickHouse:

```sql
SELECT * FROM loop(test_database, test_table);
SELECT * FROM loop(test_database.test_table);
SELECT * FROM loop(test_table);
```

Или с использованием другой табличной функции:

```sql
SELECT * FROM loop(numbers(3)) LIMIT 7;
   ┌─number─┐
1. │      0 │
2. │      1 │
3. │      2 │
   └────────┘
   ┌─number─┐
4. │      0 │
5. │      1 │
6. │      2 │
   └────────┘
   ┌─number─┐
7. │      0 │
   └────────┘
``` 
```sql
SELECT * FROM loop(mysql('localhost:3306', 'test', 'test', 'user', 'password'));
...
```
