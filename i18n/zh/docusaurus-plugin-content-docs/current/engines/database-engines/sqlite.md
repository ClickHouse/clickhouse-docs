---
'description': '允许连接到 SQLite 数据库并执行 `INSERT` 和 `SELECT` 查询，以在 ClickHouse 和 SQLite
  之间交换数据。'
'sidebar_label': 'SQLite'
'sidebar_position': 55
'slug': '/engines/database-engines/sqlite'
'title': 'SQLite'
'doc_type': 'reference'
---


# SQLite

允许连接到 [SQLite](https://www.sqlite.org/index.html) 数据库，并执行 `INSERT` 和 `SELECT` 查询，以在 ClickHouse 和 SQLite 之间交换数据。

## 创建数据库 {#creating-a-database}

```sql
CREATE DATABASE sqlite_database
ENGINE = SQLite('db_path')
```

**引擎参数**

- `db_path` — SQLite 数据库文件的路径。

## 数据类型支持 {#data_types-support}

|  SQLite   | ClickHouse                                              |
|---------------|---------------------------------------------------------|
| INTEGER       | [Int32](../../sql-reference/data-types/int-uint.md)     |
| REAL          | [Float32](../../sql-reference/data-types/float.md)      |
| TEXT          | [String](../../sql-reference/data-types/string.md)      |
| BLOB          | [String](../../sql-reference/data-types/string.md)      |

## 特性和建议 {#specifics-and-recommendations}

SQLite 将整个数据库（定义、表、索引和数据本身）存储为单个跨平台文件在主机上。在写入时，SQLite 会锁定整个数据库文件，因此写入操作是顺序执行的。读取操作可以进行多任务处理。
SQLite 不需要服务管理（例如启动脚本）或基于 `GRANT` 和密码的访问控制。访问控制通过赋予数据库文件本身的文件系统权限来处理。

## 使用示例 {#usage-example}

在 ClickHouse 中连接至 SQLite 的数据库：

```sql
CREATE DATABASE sqlite_db ENGINE = SQLite('sqlite.db');
SHOW TABLES FROM sqlite_db;
```

```text
┌──name───┐
│ table1  │
│ table2  │
└─────────┘
```

展示表格：

```sql
SELECT * FROM sqlite_db.table1;
```

```text
┌─col1──┬─col2─┐
│ line1 │    1 │
│ line2 │    2 │
│ line3 │    3 │
└───────┴──────┘
```
将 ClickHouse 表中的数据插入到 SQLite 表中：

```sql
CREATE TABLE clickhouse_table(`col1` String,`col2` Int16) ENGINE = MergeTree() ORDER BY col2;
INSERT INTO clickhouse_table VALUES ('text',10);
INSERT INTO sqlite_db.table1 SELECT * FROM clickhouse_table;
SELECT * FROM sqlite_db.table1;
```

```text
┌─col1──┬─col2─┐
│ line1 │    1 │
│ line2 │    2 │
│ line3 │    3 │
│ text  │   10 │
└───────┴──────┘
```
