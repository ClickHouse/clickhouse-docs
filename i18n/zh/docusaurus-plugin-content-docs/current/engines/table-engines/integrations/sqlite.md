---
description: '该引擎允许从 SQLite 导入数据并向 SQLite 导出数据，并支持在 ClickHouse 中直接查询 SQLite 表。'
sidebar_label: 'SQLite'
sidebar_position: 185
slug: /engines/table-engines/integrations/sqlite
title: 'SQLite 表引擎'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SQLite 表引擎

<CloudNotSupportedBadge/>

该引擎可从/向 SQLite 导入和导出数据，并支持在 ClickHouse 中直接查询 SQLite 表。



## 创建表 {#creating-a-table}

```sql
    CREATE TABLE [IF NOT EXISTS] [db.]table_name
    (
        name1 [type1],
        name2 [type2], ...
    ) ENGINE = SQLite('db_path', 'table')
```

**引擎参数**

- `db_path` — SQLite 数据库文件的路径。
- `table` — SQLite 数据库中表的名称。


## 使用示例 {#usage-example}

显示创建 SQLite 表的查询:

```sql
SHOW CREATE TABLE sqlite_db.table2;
```

```text
CREATE TABLE SQLite.table2
(
    `col1` Nullable(Int32),
    `col2` Nullable(String)
)
ENGINE = SQLite('sqlite.db','table2');
```

返回表中的数据:

```sql
SELECT * FROM sqlite_db.table2 ORDER BY col1;
```

```text
┌─col1─┬─col2──┐
│    1 │ text1 │
│    2 │ text2 │
│    3 │ text3 │
└──────┴───────┘
```

**另请参阅**

- [SQLite](../../../engines/database-engines/sqlite.md) 引擎
- [sqlite](../../../sql-reference/table-functions/sqlite.md) 表函数
