---
slug: /sql-reference/data-types/special-data-types/nothing
sidebar_position: 60
sidebar_label: Nothing
---

# Nothing

このデータ型の唯一の目的は、値が予期されない場合を表すことです。したがって、`Nothing` 型の値を作成することはできません。

例えば、リテラル [NULL](../../../sql-reference/syntax.md#null-literal) は `Nullable(Nothing)` 型を持ちます。詳細については [Nullable](../../../sql-reference/data-types/nullable.md)を参照してください。

`Nothing` 型は空の配列を示すためにも使用できます：

``` sql
SELECT toTypeName(array())
```

``` text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
