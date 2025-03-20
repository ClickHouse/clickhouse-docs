---
description: '包含有关支持的数据类型的信息'
slug: /operations/system-tables/data_type_families
title: 'system.data_type_families'
keywords: ['system table', 'data_type_families', 'data types']
---

包含有关支持的[data types](../../sql-reference/data-types/index.md)的信息。

列：

- `name` ([String](../../sql-reference/data-types/string.md)) — 数据类型名称。
- `case_insensitive` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 表示是否可以在查询中使用不区分大小写的数据类型名称的属性。例如，`Date`和`date`都是有效的。
- `alias_to` ([String](../../sql-reference/data-types/string.md)) — `name`的别名所代表的数据类型名称。

**示例**

``` sql
SELECT * FROM system.data_type_families WHERE alias_to = 'String'
```

``` text
┌─name───────┬─case_insensitive─┬─alias_to─┐
│ LONGBLOB   │                1 │ String   │
│ LONGTEXT   │                1 │ String   │
│ TINYTEXT   │                1 │ String   │
│ TEXT       │                1 │ String   │
│ VARCHAR    │                1 │ String   │
│ MEDIUMBLOB │                1 │ String   │
│ BLOB       │                1 │ String   │
│ TINYBLOB   │                1 │ String   │
│ CHAR       │                1 │ String   │
│ MEDIUMTEXT │                1 │ String   │
└────────────┴──────────────────┴──────────┘
```

**另请参见**

- [Syntax](../../sql-reference/syntax.md) — 有关支持的语法的信息。
