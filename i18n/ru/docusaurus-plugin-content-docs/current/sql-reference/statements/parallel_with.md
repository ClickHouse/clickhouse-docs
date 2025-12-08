---
description: 'Документация по предложению PARALLEL WITH'
sidebar_label: 'PARALLEL WITH'
sidebar_position: 53
slug: /sql-reference/statements/parallel_with
title: 'Предложение PARALLEL WITH'
doc_type: 'reference'
---

# Предложение PARALLEL WITH {#parallel-with-clause}

Позволяет выполнять несколько операторов параллельно.

## Синтаксис {#syntax}

```sql
инструкция1 PARALLEL WITH инструкция2 [PARALLEL WITH инструкция3 ...]
```

Выполняет операторы `statement1`, `statement2`, `statement3`, ... параллельно друг с другом. Результат выполнения этих операторов отбрасывается.

Параллельное выполнение операторов во многих случаях может быть быстрее, чем их последовательный запуск. Например, `statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` скорее всего будет выполнено быстрее, чем `statement1; statement2; statement3`.

## Примеры {#examples}

Создаёт две таблицы одновременно:

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

Параметр [max_threads](../../operations/settings/settings.md#max_threads) определяет, сколько потоков будет создано.

## Сравнение с UNION {#comparison-with-union}

Конструкция `PARALLEL WITH` немного похожа на [UNION](select/union.md), который также выполняет свои операнды параллельно. Однако есть некоторые отличия:
- `PARALLEL WITH` не возвращает результатов выполнения своих операндов, он может только пробросить исключение из них, если оно произошло;
- `PARALLEL WITH` не требует, чтобы его операнды имели одинаковый набор результирующих столбцов;
- `PARALLEL WITH` может выполнять любые операторы (не только `SELECT`).
