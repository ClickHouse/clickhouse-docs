---
slug: /sql-reference/statements/select/all
sidebar_label: ALL
---


# Клауза ALL

Если в таблице есть несколько совпадающих строк, то `ALL` возвращает все из них. `SELECT ALL` идентичен `SELECT` без `DISTINCT`. Если указаны и `ALL`, и `DISTINCT`, будет выброшено исключение.

`ALL` также можно указать внутри агрегатной функции с таким же эффектом (noop), например:

```sql
SELECT sum(ALL number) FROM numbers(10);
```
равно

```sql
SELECT sum(number) FROM numbers(10);
```
