---
description: 'Табличная функция loop в ClickHouse предназначена для возврата результатов запроса в бесконечном цикле.'
slug: /sql-reference/table-functions/loop
title: 'loop'
doc_type: 'reference'
---



# Табличная функция `loop`



## Синтаксис {#syntax}

```sql
SELECT ... FROM loop(database, table);
SELECT ... FROM loop(database.table);
SELECT ... FROM loop(table);
SELECT ... FROM loop(other_table_function(...));
```


## Аргументы {#arguments}

| Аргумент                    | Описание                                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `database`                  | Имя базы данных.                                                                                                     |
| `table`                     | Имя таблицы.                                                                                                         |
| `other_table_function(...)` | Другая табличная функция. Пример: `SELECT * FROM loop(numbers(10));` `other_table_function(...)` здесь — `numbers(10)`. |


## Возвращаемые значения {#returned_values}

Бесконечный цикл возврата результатов запроса.


## Примеры {#examples}

Выборка данных из ClickHouse:

```sql
SELECT * FROM loop(test_database, test_table);
SELECT * FROM loop(test_database.test_table);
SELECT * FROM loop(test_table);
```

Или с использованием других табличных функций:

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
