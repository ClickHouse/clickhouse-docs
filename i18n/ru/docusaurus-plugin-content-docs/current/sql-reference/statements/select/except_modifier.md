---
description: 'Документация, описывающая модификатор EXCEPT, который задаёт имена одного или нескольких столбцов, подлежащих исключению из результата. Все соответствующие имена столбцов исключаются из вывода.'
sidebar_label: 'EXCEPT'
slug: /sql-reference/statements/select/except-modifier
title: 'Модификатор EXCEPT'
keywords: ['EXCEPT', 'modifier']
doc_type: 'reference'
---

# Модификатор EXCEPT \{#except\}

> Указывает имена одного или нескольких столбцов, которые следует исключить из результата. Все столбцы с такими именами исключаются из вывода.

## Синтаксис \{#syntax\}

```sql
SELECT <expr> EXCEPT ( col_name1 [, col_name2, col_name3, ...] ) FROM [db.]table_name
```

## Примеры \{#examples\}

```sql title="Query"
SELECT * EXCEPT (i) from columns_transformers;
```

```response title="Response"
┌──j─┬───k─┐
│ 10 │ 324 │
│  8 │  23 │
└────┴─────┘
```
