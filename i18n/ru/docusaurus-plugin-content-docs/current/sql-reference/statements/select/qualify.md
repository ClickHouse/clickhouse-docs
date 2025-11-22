---
description: 'Документация по клаузе QUALIFY'
sidebar_label: 'QUALIFY'
slug: /sql-reference/statements/select/qualify
title: 'Клауза QUALIFY'
doc_type: 'reference'
---



# Предложение QUALIFY

Позволяет фильтровать результаты работы оконных функций. Похоже на предложение [WHERE](../../../sql-reference/statements/select/where.md), но разница в том, что `WHERE` выполняется до вычисления оконных функций, а `QUALIFY` — после.

В предложении `QUALIFY` можно ссылаться на результаты оконных функций из предложения `SELECT` по их псевдонимам. Кроме того, предложение `QUALIFY` может фильтровать по результатам дополнительных оконных функций, которые не возвращаются в результатах запроса.



## Ограничения {#limitations}

`QUALIFY` нельзя использовать, если нет оконных функций для вычисления. Используйте `WHERE`.


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
