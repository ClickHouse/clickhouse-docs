---
slug: '/sql-reference/statements/select/all'
sidebar_label: ALL
description: 'Документация для ALL Оператора'
title: 'Оператор ALL'
doc_type: reference
---
# ALL Оператор

Если в таблице есть несколько совпадающих строк, то `ALL` возвращает все из них. `SELECT ALL` идентичен `SELECT` без `DISTINCT`. Если указаны и `ALL`, и `DISTINCT`, то будет вызвано исключение.

`ALL` можно указать внутри агрегатных функций, хотя это не имеет практического эффекта на результат запроса.

Например:

```sql
SELECT sum(ALL number) FROM numbers(10);
```

Эквивалентно:

```sql
SELECT sum(number) FROM numbers(10);
```