---
description: 'Документация о специальном типе данных Nothing'
sidebar_label: 'Nothing'
sidebar_position: 60
slug: /sql-reference/data-types/special-data-types/nothing
title: 'Nothing'
doc_type: 'reference'
---

# Nothing

Единственное назначение этого типа данных — описывать случаи, когда значение не ожидается. Поэтому вы не можете создать значение типа `Nothing`.

Например, литерал [NULL](/sql-reference/syntax#null) имеет тип `Nullable(Nothing)`. См. подробнее о [Nullable](../../../sql-reference/data-types/nullable.md).

Тип `Nothing` также может использоваться для обозначения пустых массивов:

```sql
SELECT toTypeName(array())
```

```text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
