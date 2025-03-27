---
description: 'Документация для типа данных Nothing'
sidebar_label: 'Nothing'
sidebar_position: 60
slug: /sql-reference/data-types/special-data-types/nothing
title: 'Nothing'
---


# Nothing

Единственное назначение этого типа данных — представлять случаи, когда значение не ожидается. Поэтому вы не можете создать значение типа `Nothing`.

Например, литерал [NULL](/sql-reference/syntax#null) имеет тип `Nullable(Nothing)`. Узнайте больше о [Nullable](../../../sql-reference/data-types/nullable.md).

Тип `Nothing` также может использоваться для обозначения пустых массивов:

```sql
SELECT toTypeName(array())
```

```text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
