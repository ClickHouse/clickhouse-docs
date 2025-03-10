---
slug: /sql-reference/data-types/special-data-types/nothing
sidebar_position: 60
sidebar_label: Ничто
---


# Ничто

Единственной целью этого типа данных является представление случаев, когда значение не ожидается. Поэтому вы не можете создать значение типа `Nothing`.

Например, литерал [NULL](/sql-reference/syntax#null) имеет тип `Nullable(Nothing)`. Дополнительную информацию о [Nullable](../../../sql-reference/data-types/nullable.md) можно найти здесь.

Тип `Nothing` также может использоваться для обозначения пустых массивов:

``` sql
SELECT toTypeName(array())
```

``` text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
