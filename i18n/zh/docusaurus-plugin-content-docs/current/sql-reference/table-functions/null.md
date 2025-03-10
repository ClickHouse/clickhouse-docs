---
slug: /sql-reference/table-functions/null
sidebar_position: 140
sidebar_label: null 函数
title: 'null'
description: '创建一个具有指定结构的临时表，使用 Null 表引擎。该函数用于方便测试编写和演示。'
---


# null 表函数

创建一个具有指定结构的临时表，使用 [Null](../../engines/table-engines/special/null.md) 表引擎。根据 `Null` 引擎的属性，表的数据会被忽略，表本身在查询执行后立即被删除。该函数用于方便测试编写和演示。

**语法**

``` sql
null('structure')
```

**参数**

- `structure` — 列和列类型的列表。 [字符串](../../sql-reference/data-types/string.md)。

**返回值**

一个具有指定结构的临时 `Null` 引擎表。

**示例**

使用 `null` 函数的查询：

``` sql
INSERT INTO function null('x UInt64') SELECT * FROM numbers_mt(1000000000);
```
可以替换为三个查询：

```sql
CREATE TABLE t (x UInt64) ENGINE = Null;
INSERT INTO t SELECT * FROM numbers_mt(1000000000);
DROP TABLE IF EXISTS t;
```

另见：

- [Null 表引擎](../../engines/table-engines/special/null.md)
