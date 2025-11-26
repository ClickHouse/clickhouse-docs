---
slug: /sql-reference/table-functions/generate_series
sidebar_position: 146
sidebar_label: 'generate_series'
title: 'generate_series (generateSeries)'
description: 'Возвращает таблицу с единственным столбцом `generate_series` (UInt64), содержащим целые числа в диапазоне от start до stop включительно.'
doc_type: 'reference'
---



# Табличная функция generate_series

Псевдоним: `generateSeries`



## Синтаксис

Возвращает таблицу с единственным столбцом &#39;generate&#95;series&#39; (`UInt64`), содержащим целые числа от start до stop включительно:

```sql
generate_series(START, STOP)
```

Возвращает таблицу с единственным столбцом &#39;generate&#95;series&#39; (`UInt64`), содержащим целые числа от `start` до `stop` включительно с шагом `STEP`:

```sql
generate_series(START, STOP, STEP)
```


## Примеры

Следующие запросы возвращают таблицы с одинаковым содержимым, но разными именами столбцов:

```sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

Следующие запросы возвращают таблицы с тем же содержимым, но с другими именами столбцов (при этом второй вариант выполняется эффективнее):

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3);
```
