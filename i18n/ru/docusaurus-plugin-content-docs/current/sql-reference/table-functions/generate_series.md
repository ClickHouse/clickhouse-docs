---
slug: /sql-reference/table-functions/generate_series
sidebar_position: 146
sidebar_label: 'generate_series'
title: 'generate_series (generateSeries)'
description: 'Возвращает таблицу с одной колонкой `generate_series` (UInt64), которая содержит целые числа от start до stop включительно.'
---


# Функция Таблицы generate_series (generateSeries)

`generate_series(START, STOP)` (псевдоним: `generateSeries`) - Возвращает таблицу с одной колонкой 'generate_series' (UInt64), которая содержит целые числа от start до stop включительно.

`generate_series(START, STOP, STEP)` - Возвращает таблицу с одной колонкой 'generate_series' (UInt64), которая содержит целые числа от start до stop включительно, с интервалом между значениями, заданным STEP. 

Следующие запросы возвращают таблицы с одинаковым содержимым, но с разными именами колонок:

```sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

А следующие запросы возвращают таблицы с одинаковым содержимым, но с разными именами колонок (при этом второй вариант более эффективен):

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3);
```
