---
slug: /sql-reference/table-functions/merge
sidebar_position: 130
sidebar_label: merge
title: 'merge'
description: '创建一个临时的 Merge 表。表的结构取自第一个匹配正则表达式的表。'
---


# merge 表函数

创建一个临时的 [Merge](../../engines/table-engines/special/merge.md) 表。表的结构取自第一个匹配正则表达式的表。

**语法**

```sql
merge(['db_name',] 'tables_regexp')
```
**参数**

- `db_name` — 可选值（默认是 `currentDatabase()`）：
    - 数据库名称，
    - 返回字符串的常量表达式，例如 `currentDatabase()`，
    - `REGEXP(expression)`，其中 `expression` 是一个用来匹配数据库名称的正则表达式。

- `tables_regexp` — 用于匹配指定数据库或多个数据库中的表名称的正则表达式。

**另见**

- [Merge](../../engines/table-engines/special/merge.md) 表引擎
