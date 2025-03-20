---
slug: /sql-reference/data-types/special-data-types/nothing
sidebar_position: 60
sidebar_label: Nothing
---


# Nothing

このデータ型の唯一の目的は、値が期待されないケースを表すことです。したがって、`Nothing`型の値を作成することはできません。

たとえば、リテラル [NULL](/sql-reference/syntax#null) は `Nullable(Nothing)` 型です。`Nullable` についての詳細は、[こちら](../../../sql-reference/data-types/nullable.md)をご覧ください。

`Nothing` 型は、空の配列を示すためにも使用できます：

``` sql
SELECT toTypeName(array())
```

``` text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
