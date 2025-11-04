---
slug: '/sql-reference/statements/select/qualify'
sidebar_label: QUALIFY
description: 'Документация для оператора QUALIFY'
title: 'Оператор QUALIFY'
doc_type: reference
---
# Клаузула QUALIFY

Позволяет фильтровать результаты оконных функций. Она аналогична клаузуле [WHERE](../../../sql-reference/statements/select/where.md), но разница заключается в том, что `WHERE` выполняется до оценки оконных функций, в то время как `QUALIFY` выполняется после.

В клаузуле `QUALIFY` возможно ссылаться на результаты оконных функций из клаузулы `SELECT` по их псевдониму. Кроме того, клаузула `QUALIFY` может фильтровать результаты дополнительных оконных функций, которые не возвращаются в результатах запроса.

## Ограничения {#limitations}

`QUALIFY` не может использоваться, если нет оконных функций для оценки. Используйте вместо этого `WHERE`.

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