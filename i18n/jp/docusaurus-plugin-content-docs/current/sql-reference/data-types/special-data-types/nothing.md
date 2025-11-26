---
description: 'Nothing 特殊データ型に関するドキュメント'
sidebar_label: 'Nothing'
sidebar_position: 60
slug: /sql-reference/data-types/special-data-types/nothing
title: 'Nothing'
doc_type: 'reference'
---

# Nothing

このデータ型の唯一の目的は、値が存在することが想定されていないケースを表すことです。そのため、`Nothing` 型の値を作成することはできません。

たとえば、リテラル [NULL](/sql-reference/syntax#null) は `Nullable(Nothing)` 型を持ちます。詳細は [Nullable](../../../sql-reference/data-types/nullable.md) を参照してください。

`Nothing` 型は空の配列を表すためにも使用することができます。

```sql
SELECT toTypeName(array())
```

```text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
