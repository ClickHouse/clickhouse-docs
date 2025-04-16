---
description: 'Документация для клаausa PARALLEL WITH'
sidebar_label: 'PARALLEL WITH'
sidebar_position: 53
slug: /sql-reference/statements/parallel_with
title: 'Клаusa PARALLEL WITH'
---


# Клаusa PARALLEL WITH

Позволяет выполнять несколько операторов параллельно.

## Синтаксис {#syntax}

```sql
statement1 PARALLEL WITH statement2 [PARALLEL WITH statement3 ...]
```

Выполняет операторы `statement1`, `statement2`, `statement3`, ... параллельно друг с другом. Вывод этих операторов игнорируется.

Выполнение операторов параллельно может быть быстрее, чем просто последовательное выполнение тех же операторов во многих случаях. Например, `statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` вероятно будет быстрее, чем `statement1; statement2; statement3`.

## Примеры {#examples}

Создает две таблицы параллельно:

```sql
CREATE TABLE table1(x Int32) ENGINE = MergeTree ORDER BY tuple()
PARALLEL WITH
CREATE TABLE table2(y String) ENGINE = MergeTree ORDER BY tuple();
```

Удаляет две таблицы параллельно:

```sql
DROP TABLE table1
PARALLEL WITH
DROP TABLE table2;
```

## Настройки {#settings}

Настройка [max_threads](../../operations/settings/settings.md#max_threads) управляет тем, сколько потоков будет запущено.

## Сравнение с UNION {#comparison-with-union}

Клаusa `PARALLEL WITH` немного напоминает [UNION](select/union.md), который также выполняет свои операнды параллельно. Однако есть некоторые отличия:
- `PARALLEL WITH` не возвращает никакие результаты от выполнения своих операндов, он может только повторно выбросить исключение от них, если такие имеются;
- `PARALLEL WITH` не требует, чтобы его операнды имели один и тот же набор столбцов результата;
- `PARALLEL WITH` может выполнять любые операторы (не только `SELECT`).
