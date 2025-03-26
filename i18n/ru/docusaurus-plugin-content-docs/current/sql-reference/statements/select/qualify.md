---
description: 'Документация для клaузулы QUALIFY'
sidebar_label: 'QUALIFY'
slug: /sql-reference/statements/select/qualify
title: 'Клaузула QUALIFY'
---


# Клaузула QUALIFY

Позволяет фильтровать результаты оконных функций. Это аналогично клaузуле [WHERE](../../../sql-reference/statements/select/where.md), но отличие в том, что `WHERE` выполняется до вычисления оконных функций, в то время как `QUALIFY` выполняется после.

Возможно использование результатов оконных функций из клaузулы `SELECT` в клaузуле `QUALIFY` по их псевдониму. Кроме того, клaузула `QUALIFY` может фильтровать результаты дополнительных оконных функций, которые не возвращаются в результатах запроса.

## Ограничения {#limitations}

`QUALIFY` нельзя использовать, если нет оконных функций для оценки. Вместо этого используйте `WHERE`.

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
