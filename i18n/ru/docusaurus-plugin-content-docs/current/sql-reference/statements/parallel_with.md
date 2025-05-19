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

Выполняет операторы `statement1`, `statement2`, `statement3` и т. д. параллельно друг с другом. Вывод этих операторов игнорируется.

Выполнение операторов параллельно может быть быстрее, чем просто последовательность тех же операторов во многих случаях. Например, `statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` будет скорее всего быстрее, чем `statement1; statement2; statement3`.

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

Настройка [max_threads](../../operations/settings/settings.md#max_threads) контролирует, сколько потоков будет запущено.

## Сравнение с UNION {#comparison-with-union}

Оператор `PARALLEL WITH` несколько похож на [UNION](select/union.md), который также выполняет свои операнды параллельно. Однако есть некоторые отличия:
- `PARALLEL WITH` не возвращает никаких результатов от выполнения своих операндов, он может только перехватить исключение от них, если таковое имеется;
- `PARALLEL WITH` не требует, чтобы его операнды имели одинаковый набор результирующих колонок;
- `PARALLEL WITH` может выполнять любые операторы (не только `SELECT`).

