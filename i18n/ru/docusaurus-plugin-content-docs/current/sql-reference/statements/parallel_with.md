---
description: 'Документация по оператору PARALLEL WITH'
sidebar_label: 'PARALLEL WITH'
sidebar_position: 53
slug: /sql-reference/statements/parallel_with
title: 'Оператор PARALLEL WITH'
doc_type: 'reference'
---



# Оператор PARALLEL WITH

Позволяет выполнять несколько выражений параллельно.



## Синтаксис {#syntax}

```sql
statement1 PARALLEL WITH statement2 [PARALLEL WITH statement3 ...]
```

Выполняет операторы `statement1`, `statement2`, `statement3`, ... параллельно друг с другом. Вывод этих операторов игнорируется.

Параллельное выполнение операторов во многих случаях может быть быстрее, чем последовательное выполнение тех же операторов. Например, `statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` вероятно будет быстрее, чем `statement1; statement2; statement3`.


## Примеры {#examples}

Создаёт две таблицы параллельно:

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

Настройка [max_threads](../../operations/settings/settings.md#max_threads) определяет количество создаваемых потоков.


## Сравнение с UNION {#comparison-with-union}

Конструкция `PARALLEL WITH` в некоторой степени похожа на [UNION](select/union.md), который также выполняет свои операнды параллельно. Однако есть несколько отличий:

- `PARALLEL WITH` не возвращает результаты выполнения своих операндов, а может только пробросить исключение от них, если оно возникло;
- `PARALLEL WITH` не требует, чтобы его операнды имели одинаковый набор результирующих столбцов;
- `PARALLEL WITH` может выполнять любые операторы (не только `SELECT`).
