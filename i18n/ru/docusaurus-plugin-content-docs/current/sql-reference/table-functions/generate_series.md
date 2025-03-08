---
slug: /sql-reference/table-functions/generate_series
sidebar_position: 146
sidebar_label: generate_series
title: "generate_series (generateSeries)"
description: "Возвращает таблицу с единственной колонкой 'generate_series' (UInt64), которая содержит целые числа от начала до конца включительно."
---


# generate_series (generateSeries) Функция Таблицы

`generate_series(START, STOP)` (псевдоним: `generateSeries`) - Возвращает таблицу с единственной колонкой 'generate_series' (UInt64), которая содержит целые числа от начала до конца включительно.

`generate_series(START, STOP, STEP)` - Возвращает таблицу с единственной колонкой 'generate_series' (UInt64), которая содержит целые числа от начала до конца включительно с пробелами между значениями, заданными параметром STEP.

Следующие запросы возвращают таблицы с одинаковым содержимым, но разными именами колонок:

``` sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

И следующие запросы возвращают таблицы с одинаковым содержимым, но разными именами колонок (при этом второй вариант более эффективен):

``` sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3) ;
```
