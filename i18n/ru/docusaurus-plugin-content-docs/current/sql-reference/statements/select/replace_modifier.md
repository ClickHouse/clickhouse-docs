---
description: 'Документация, описывающая модификатор REPLACE, который позволяет вызывать произвольную функцию для каждой строки, возвращаемой внешним табличным выражением запроса.'
sidebar_label: 'REPLACE'
slug: /sql-reference/statements/select/replace-modifier
title: 'Модификатор REPLACE'
keywords: ['REPLACE', 'modifier']
doc_type: 'reference'
---



# Модификатор REPLACE {#replace}

> Позволяет указать один или несколько [псевдонимов выражений](/sql-reference/syntax#expression-aliases).

Каждый псевдоним должен соответствовать имени столбца из оператора `SELECT *`. В списке выходных столбцов столбец, который соответствует псевдониму, заменяется выражением из `REPLACE`.

Этот модификатор не изменяет имена или порядок столбцов. Однако он может изменить значение и тип данных.

**Синтаксис:**

```sql
SELECT <expr> REPLACE( <expr> AS col_name) from [db.]table_name
```

**Пример:**

```sql
SELECT * REPLACE(i + 1 AS i) from columns_transformers;
```

```response
┌───i─┬──j─┬───k─┐
│ 101 │ 10 │ 324 │
│ 121 │  8 │  23 │
└─────┴────┴─────┘
```
