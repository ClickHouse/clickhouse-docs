---
description: 'Документация для оператора PARALLEL WITH'
sidebar_label: 'PARALLEL WITH'
sidebar_position: 53
slug: /sql-reference/statements/parallel_with
title: 'Оператор PARALLEL WITH'
---


# Оператор PARALLEL WITH

Позволяет выполнять несколько операторов параллельно.

## Синтаксис {#syntax}

```sql
statement1 PARALLEL WITH statement2 [PARALLEL WITH statement3 ...]
```

Выполняет операторы `statement1`, `statement2`, `statement3`, ... параллельно друг с другом. Вывод этих операторов игнорируется.

Выполнение операторов параллельно может быть быстрее, чем просто последовательность тех же операторов во многих случаях. Например, `statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` вероятно будет быстрее, чем `statement1; statement2; statement3`.

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

Настройка [max_threads](../../operations/settings/settings.md#max_threads) управляет количеством создаваемых потоков.

## Сравнение с UNION {#comparison-with-union}

Оператор `PARALLEL WITH` немного похож на [UNION](select/union.md), который также исполняет свои операнды параллельно. Однако есть несколько отличий:
- `PARALLEL WITH` не возвращает никаких результатов от выполнения своих операндов, он может только передать исключение, если оно возникло;
- `PARALLEL WITH` не требует, чтобы его операнды имели одинаковый набор результирующих столбцов;
- `PARALLEL WITH` может выполнять любые операторы (не только `SELECT`).
