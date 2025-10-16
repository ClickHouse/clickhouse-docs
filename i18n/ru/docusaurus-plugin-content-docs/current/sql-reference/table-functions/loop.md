---
slug: '/sql-reference/table-functions/loop'
description: 'Функция таблицы LOOP в ClickHouse используется для возврата результатов'
title: loop
doc_type: reference
---
# loop Табличная Функция

## Синтаксис {#syntax}

```sql
SELECT ... FROM loop(database, table);
SELECT ... FROM loop(database.table);
SELECT ... FROM loop(table);
SELECT ... FROM loop(other_table_function(...));
```

## Аргументы {#arguments}

| Аргумент                    | Описание                                                                                                           |
|-----------------------------|--------------------------------------------------------------------------------------------------------------------|
| `database`                  | имя базы данных.                                                                                                   |
| `table`                     | имя таблицы.                                                                                                      |
| `other_table_function(...)` | другая табличная функция. Пример: `SELECT * FROM loop(numbers(10));` `other_table_function(...)` здесь это `numbers(10)`. |

## Возвращаемые значения {#returned_values}

Бесконечный цикл для возврата результатов запроса.

## Примеры {#examples}

Выбор данных из ClickHouse:

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