---
'description': '该引擎允许将数据导入和导出到 SQLite，并支持直接从 ClickHouse 查询 SQLite 表。'
'sidebar_label': 'SQLite'
'sidebar_position': 185
'slug': '/engines/table-engines/integrations/sqlite'
'title': 'SQLite'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SQLite

<CloudNotSupportedBadge/>

该引擎允许将数据导入和导出到 SQLite，并支持直接从 ClickHouse 查询 SQLite 表。

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
- `table` — SQLite 数据库中的表名。

## 使用示例 {#usage-example}

展示创建 SQLite 表的查询：

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

从表中返回数据：

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

**另见**

- [SQLite](../../../engines/database-engines/sqlite.md) 引擎
- [sqlite](../../../sql-reference/table-functions/sqlite.md) 表函数
