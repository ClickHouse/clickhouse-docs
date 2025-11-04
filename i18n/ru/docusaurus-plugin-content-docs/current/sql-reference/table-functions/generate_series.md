---
slug: '/sql-reference/table-functions/generate_series'
sidebar_label: generate_series
sidebar_position: 146
description: 'Возвращает таблицу с единственной колонкой `generate_series` (UInt64),'
title: 'generate_series (generateSeries)'
doc_type: reference
---
# generate_series Табличная Функция

Псевдоним: `generateSeries`

## Синтаксис {#syntax}

Возвращает таблицу с единственной колонкой 'generate_series' (`UInt64`), которая содержит целые числа от start до stop включительно:

```sql
generate_series(START, STOP)
```

Возвращает таблицу с единственной колонкой 'generate_series' (`UInt64`), которая содержит целые числа от start до stop включительно с интервалом между значениями, заданным `STEP`:

```sql
generate_series(START, STOP, STEP)
```

## Примеры {#examples}

Следующие запросы возвращают таблицы с одинаковым содержимым, но с разными названиями колонок:

```sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

А следующие запросы возвращают таблицы с одинаковым содержимым, но с разными названиями колонок (но второй вариант более эффективен):

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3);
```