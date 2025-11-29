---
description: 'Документация по предложению QUALIFY'
sidebar_label: 'QUALIFY'
slug: /sql-reference/statements/select/qualify
title: 'Предложение QUALIFY'
doc_type: 'reference'
---



# Оператор QUALIFY {#qualify-clause}

Позволяет фильтровать результаты оконных функций. Аналогичен предложению [WHERE](../../../sql-reference/statements/select/where.md), но отличие в том, что `WHERE` применяется до вычисления оконных функций, тогда как `QUALIFY` — после.

В `QUALIFY` можно по псевдониму ссылаться на результаты оконных функций из предложения `SELECT`. Либо предложение `QUALIFY` может фильтровать по результатам дополнительных оконных функций, которые не возвращаются в результатах запроса.



## Ограничения {#limitations}

`QUALIFY` нельзя использовать, если в запросе нет оконных функций. Используйте вместо него `WHERE`.



## Примеры {#examples}

Пример:

```sql
SELECT number, COUNT() OVER (PARTITION BY number % 3) AS partition_count
FROM numbers(10)
QUALIFY partition_count = 4
ORDER BY number;
```

```text
┌─number─┬─partition_count─┐
│      0 │               4 │
│      3 │               4 │
│      6 │               4 │
│      9 │               4 │
└────────┴─────────────────┘
```
