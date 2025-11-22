---
description: 'Nothing 特殊数据类型文档'
sidebar_label: 'Nothing'
sidebar_position: 60
slug: /sql-reference/data-types/special-data-types/nothing
title: 'Nothing'
doc_type: 'reference'
---

# Nothing

此数据类型的唯一用途是用来表示不需要值的情况。因此，你无法创建一个 `Nothing` 类型的值。

例如，字面量 [NULL](/sql-reference/syntax#null) 的类型是 `Nullable(Nothing)`。有关更多信息，请参阅 [Nullable](../../../sql-reference/data-types/nullable.md)。

`Nothing` 类型也可用于表示空数组：

```sql
SELECT toTypeName(array())
```

```text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
