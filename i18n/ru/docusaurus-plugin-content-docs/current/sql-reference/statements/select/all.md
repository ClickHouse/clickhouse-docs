---
description: 'Документация для оператора ALL'
sidebar_label: 'ALL'
slug: /sql-reference/statements/select/all
title: 'Оператор ALL'
---


# Оператор ALL

Если в таблице имеется несколько строк, соответствующих условию, то `ALL` возвращает все из них. `SELECT ALL` идентичен `SELECT` без `DISTINCT`. Если указаны одновременно `ALL` и `DISTINCT`, будет выброшено исключение.

`ALL` также может быть указан внутри агрегатной функции с тем же эффектом (no-op), например:

```sql
SELECT sum(ALL number) FROM numbers(10);
```
равно

```sql
SELECT sum(number) FROM numbers(10);
```
