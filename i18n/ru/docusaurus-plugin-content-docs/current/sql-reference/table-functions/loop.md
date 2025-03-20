---
slug: /sql-reference/table-functions/loop
title: 'loop'
description: 'Функция таблицы loop в ClickHouse используется для возврата результатов запроса в бесконечном цикле.'
---


# Функция таблицы loop

**Синтаксис**

``` sql
SELECT ... FROM loop(database, table);
SELECT ... FROM loop(database.table);
SELECT ... FROM loop(table);
SELECT ... FROM loop(other_table_function(...));
```

**Параметры**

- `database` — название базы данных.
- `table` — название таблицы.
- `other_table_function(...)` — другая функция таблицы.
  Пример: `SELECT * FROM loop(numbers(10));`
  `other_table_function(...)` здесь — это `numbers(10)`.

**Возвращаемое значение**

Бесконечный цикл для возврата результатов запроса.

**Примеры**

Выбор данных из ClickHouse:

``` sql
SELECT * FROM loop(test_database, test_table);
SELECT * FROM loop(test_database.test_table);
SELECT * FROM loop(test_table);
```

Или с использованием другой функции таблицы:

``` sql
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
``` sql
SELECT * FROM loop(mysql('localhost:3306', 'test', 'test', 'user', 'password'));
...
```
