---
slug: /sql-reference/statements/select/qualify
sidebar_label: QUALIFY
---


# Клавиша QUALIFY

Позволяет фильтровать результаты оконных функций. Это похоже на клаузу [WHERE](../../../sql-reference/statements/select/where.md), но разница в том, что `WHERE` выполняется перед вычислением оконных функций, тогда как `QUALIFY` выполняется после этого.

В `QUALIFY` можно ссылаться на результаты оконных функций из клаузи `SELECT` по их псевдониму. В качестве альтернативы, клаuza `QUALIFY` может фильтровать по результатам дополнительных оконных функций, которые не возвращаются в результатах запроса.

## Ограничения {#limitations}

`QUALIFY` не может быть использован, если нет оконных функций для вычисления. Используйте вместо этого `WHERE`.

## Примеры {#examples}

Пример:

``` sql
SELECT number, COUNT() OVER (PARTITION BY number % 3) AS partition_count
FROM numbers(10)
QUALIFY partition_count = 4
ORDER BY number;
```

``` text
┌─number─┬─partition_count─┐
│      0 │               4 │
│      3 │               4 │
│      6 │               4 │
│      9 │               4 │
└────────┴─────────────────┘
```
