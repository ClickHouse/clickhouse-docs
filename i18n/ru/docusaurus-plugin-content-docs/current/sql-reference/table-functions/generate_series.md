---
slug: /sql-reference/table-functions/generate_series
sidebar_position: 146
sidebar_label: 'generate_series'
title: 'generate_series (generateSeries)'
description: 'Возвращает таблицу с одним столбцом `generate_series` (UInt64), содержащим целые числа от `start` до `stop` включительно.'
doc_type: 'reference'
---



# Табличная функция `generate_series`

Псевдоним: `generateSeries`



## Синтаксис {#syntax}

Возвращает таблицу с единственным столбцом 'generate_series' (`UInt64`), содержащим целые числа от start до stop включительно:

```sql
generate_series(START, STOP)
```

Возвращает таблицу с единственным столбцом 'generate_series' (`UInt64`), содержащим целые числа от start до stop включительно с шагом, заданным параметром `STEP`:

```sql
generate_series(START, STOP, STEP)
```


## Примеры {#examples}

Следующие запросы возвращают таблицы с одинаковым содержимым, но с разными именами столбцов:

```sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

Следующие запросы также возвращают таблицы с одинаковым содержимым, но с разными именами столбцов (второй вариант более эффективен):

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3);
```
