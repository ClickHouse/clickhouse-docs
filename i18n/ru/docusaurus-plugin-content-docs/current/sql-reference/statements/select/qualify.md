---
description: 'Документация для оператора QUALIFY'
sidebar_label: 'QUALIFY'
slug: /sql-reference/statements/select/qualify
title: 'Оператор QUALIFY'
---


# Оператор QUALIFY

Позволяет фильтровать результаты оконных функций. Это похоже на оператор [WHERE](../../../sql-reference/statements/select/where.md), но разница заключается в том, что `WHERE` выполняется перед оценкой оконных функций, в то время как `QUALIFY` выполняется после.

В операторе `QUALIFY` можно ссылаться на результаты оконных функций из оператора `SELECT` по их алиасу. В качестве альтернативы, оператор `QUALIFY` может фильтровать по результатам дополнительных оконных функций, которые не возвращаются в результах запроса.

## Ограничения {#limitations}

`QUALIFY` не может быть использован, если нет оконных функций для оценки. Вместо этого используйте `WHERE`.

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
