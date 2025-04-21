---
description: 'Документация для типа данных Nothing'
sidebar_label: 'Nothing'
sidebar_position: 60
slug: /sql-reference/data-types/special-data-types/nothing
title: 'Nothing'
---


# Nothing

Единственной целью этого типа данных является представление случаев, когда значение не ожидается. Поэтому вы не можете создать значение типа `Nothing`.

Например, литерал [NULL](/sql-reference/syntax#null) имеет тип `Nullable(Nothing)`. См. подробнее про [Nullable](../../../sql-reference/data-types/nullable.md).

Тип `Nothing` также может использоваться для обозначения пустых массивов:

```sql
SELECT toTypeName(array())
```

```text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
