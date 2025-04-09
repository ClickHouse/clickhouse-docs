---
slug: /sql-reference/table-functions/sqlite
sidebar_position: 185
sidebar_label: sqlite
title: sqlite
description: '允许对存储在 SQLite 数据库中的数据进行查询。'
---


# sqlite 表函数

允许对存储在 [SQLite](../../engines/database-engines/sqlite.md) 数据库中的数据进行查询。

**语法**

```sql
sqlite('db_path', 'table_name')
```

**参数**

- `db_path` — SQLite 数据库文件的路径。 [字符串](../../sql-reference/data-types/string.md)。
- `table_name` — SQLite 数据库中表的名称。 [字符串](../../sql-reference/data-types/string.md)。

**返回值**

- 一个与原始 `SQLite` 表具有相同列的表对象。

**示例**

查询：

``` sql
SELECT * FROM sqlite('sqlite.db', 'table1') ORDER BY col2;
```

结果：

``` text
┌─col1──┬─col2─┐
│ line1 │    1 │
│ line2 │    2 │
│ line3 │    3 │
└───────┴──────┘
```

**另请参阅**

- [SQLite](../../engines/table-engines/integrations/sqlite.md) 表引擎
