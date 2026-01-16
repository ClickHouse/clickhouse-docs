---
description: 'Документация по клаузе ALL'
sidebar_label: 'ALL'
slug: /sql-reference/statements/select/all
title: 'Клауза ALL'
doc_type: 'reference'
---

# Оператор ALL \{#all-clause\}

Если в таблице есть несколько строк, удовлетворяющих условию, то `ALL` возвращает их все. `SELECT ALL` идентичен `SELECT` без `DISTINCT`. Если указаны и `ALL`, и `DISTINCT`, будет выброшено исключение.

`ALL` может указываться внутри агрегирующих функций, хотя это не оказывает практического влияния на результат запроса.

Например:

```sql
SELECT sum(ALL number) FROM numbers(10);
```

Эквивалентно:

```sql
SELECT sum(number) FROM numbers(10);
```
