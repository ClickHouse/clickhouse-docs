
# sqlite 表函数

允许对存储在 [SQLite](../../engines/database-engines/sqlite.md) 数据库中的数据进行查询。

## 语法 {#syntax}

```sql
sqlite('db_path', 'table_name')
```

## 参数 {#arguments}

- `db_path` — SQLite 数据库文件的路径。 [String](../../sql-reference/data-types/string.md)。
- `table_name` — SQLite 数据库中的表名。 [String](../../sql-reference/data-types/string.md)。

## 返回值 {#returned_value}

- 一个表对象，具有与原始 `SQLite` 表相同的列。

## 示例 {#example}

查询：

```sql
SELECT * FROM sqlite('sqlite.db', 'table1') ORDER BY col2;
```

结果：

```text
┌─col1──┬─col2─┐
│ line1 │    1 │
│ line2 │    2 │
│ line3 │    3 │
└───────┴──────┘
```

## 相关 {#related}

- [SQLite](../../engines/table-engines/integrations/sqlite.md) 表引擎
