---
description: 'Nothing 特殊数据类型文档'
sidebar_label: 'Nothing'
sidebar_position: 60
slug: /sql-reference/data-types/special-data-types/nothing
title: 'Nothing'
doc_type: 'reference'
---

# Nothing {#nothing}

此数据类型的唯一作用是表示不期望有值的情况。因此，无法创建一个类型为 `Nothing` 的值。

例如，字面量 [NULL](/sql-reference/syntax#null) 的类型是 `Nullable(Nothing)`。更多信息参见 [Nullable](../../../sql-reference/data-types/nullable.md)。

`Nothing` 类型也可用于表示空数组：

```sql
SELECT toTypeName(array())
```

```text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
