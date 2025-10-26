---
slug: '/sql-reference/data-types/special-data-types/nothing'
sidebar_label: Nothing
sidebar_position: 60
description: 'Документация для типа данных Nothing специального'
title: Nothing
doc_type: reference
---
# Ничего

Единственное назначение этого типа данных — представлять случаи, когда значение не ожидается. Поэтому вы не можете создать значение типа `Nothing`.

Например, литерал [NULL](/sql-reference/syntax#null) имеет тип `Nullable(Nothing)`. Подробнее о [Nullable](../../../sql-reference/data-types/nullable.md).

Тип `Nothing` также может использоваться для обозначения пустых массивов:

```sql
SELECT toTypeName(array())
```

```text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```