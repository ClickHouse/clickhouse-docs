---
description: 'Документация по модификатору APPLY, который позволяет вызывать функцию для каждой строки, возвращаемой внешним табличным выражением запроса.'
sidebar_label: 'APPLY'
slug: /sql-reference/statements/select/apply-modifier
title: 'Модификатор APPLY'
keywords: ['APPLY', 'modifier']
doc_type: 'reference'
---

# Модификатор APPLY \{#apply\}

> Позволяет выполнить функцию для каждой строки, возвращаемой внешним табличным выражением запроса.

## Синтаксис \{#syntax\}

```sql
SELECT <expr> APPLY( <func> ) FROM [db.]table_name
```

## Пример \{#example\}

```sql
CREATE TABLE columns_transformers (i Int64, j Int16, k Int64) ENGINE = MergeTree ORDER by (i);
INSERT INTO columns_transformers VALUES (100, 10, 324), (120, 8, 23);
SELECT * APPLY(sum) FROM columns_transformers;
```

```response
┌─sum(i)─┬─sum(j)─┬─sum(k)─┐
│    220 │     18 │    347 │
└────────┴────────┴────────┘
```
