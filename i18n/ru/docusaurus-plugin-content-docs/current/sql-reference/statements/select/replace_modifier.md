---
description: 'Документация, описывающая модификатор APPLY, который позволяет вызывать некоторую функцию для каждой строки, возвращаемой внешним табличным выражением запроса.'
sidebar_label: 'REPLACE'
slug: /sql-reference/statements/select/replace-modifier
title: 'Модификатор REPLACE'
keywords: ['REPLACE', 'модификатор']
doc_type: 'reference'
---

> Позволяет указать один или несколько [псевдонимов выражений](/sql-reference/syntax#expression-aliases).

Каждый псевдоним должен совпадать с именем столбца в запросе `SELECT *`. В выходном списке столбцов столбец, который соответствует
псевдониму, заменяется выражением в этом `REPLACE`.

Этот модификатор не изменяет имена или порядок столбцов. Однако он может изменить значение и его тип.

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