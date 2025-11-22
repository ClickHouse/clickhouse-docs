---
description: 'Nothing 特殊データ型のドキュメント'
sidebar_label: 'Nothing'
sidebar_position: 60
slug: /sql-reference/data-types/special-data-types/nothing
title: 'Nothing'
doc_type: 'reference'
---

# Nothing

このデータ型の唯一の目的は、値が存在しないことが前提となるケースを表現することです。そのため、`Nothing` 型の値を作成することはできません。

例えば、リテラル [NULL](/sql-reference/syntax#null) は `Nullable(Nothing)` 型を持ちます。詳しくは [Nullable](../../../sql-reference/data-types/nullable.md) を参照してください。

`Nothing` 型は、空の配列を表すためにも使用できます。

```sql
SELECT toTypeName(array())
```

```text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
