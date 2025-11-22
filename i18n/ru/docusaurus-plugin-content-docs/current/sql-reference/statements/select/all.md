---
description: 'Документация по клаузе ALL'
sidebar_label: 'ALL'
slug: /sql-reference/statements/select/all
title: 'Клауза ALL'
doc_type: 'reference'
---

# Клауза ALL

Если в таблице есть несколько строк, удовлетворяющих условию, то `ALL` возвращает их все. `SELECT ALL` идентичен `SELECT` без `DISTINCT`. Если одновременно указаны `ALL` и `DISTINCT`, будет сгенерировано исключение.

`ALL` может указываться внутри агрегатных функций, хотя это не оказывает практического влияния на результат запроса.

Например:

```sql
SELECT sum(ALL number) FROM numbers(10);
```

Эквивалентно:

```sql
SELECT sum(number) FROM numbers(10);
```
