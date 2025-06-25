---
description: 'Документация для оператора ALL'
sidebar_label: 'ALL'
slug: /sql-reference/statements/select/all
title: 'Оператор ALL'
---


# Оператор ALL

Если в таблице есть несколько подходящих строк, тогда `ALL` возвращает все из них. `SELECT ALL` эквивалентен `SELECT` без `DISTINCT`. Если указаны как `ALL`, так и `DISTINCT`, будет выброшено исключение.

`ALL` может быть указан внутри агрегатных функций, хотя это не оказывает практического эффекта на результат запроса.

Например:

```sql
SELECT sum(ALL number) FROM numbers(10);
```

Эквивалентно:

```sql
SELECT sum(number) FROM numbers(10);
```
