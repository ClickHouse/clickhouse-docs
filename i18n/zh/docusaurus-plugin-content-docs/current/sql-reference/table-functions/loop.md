---
'description': 'ClickHouse 中的 loop 表函数用于以无限循环的方式返回查询结果。'
'slug': '/sql-reference/table-functions/loop'
'title': '循环'
'doc_type': 'reference'
---


# loop 表函数

## 语法 {#syntax}

```sql
SELECT ... FROM loop(database, table);
SELECT ... FROM loop(database.table);
SELECT ... FROM loop(table);
SELECT ... FROM loop(other_table_function(...));
```

## 参数 {#arguments}

| 参数                        | 描述                                                                                                                |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------|
| `database`                  | 数据库名称。                                                                                                       |
| `table`                     | 表名称。                                                                                                          |
| `other_table_function(...)` | 其他表函数。示例：`SELECT * FROM loop(numbers(10));` 这里的 `other_table_function(...)` 是 `numbers(10)`。 |

## 返回值 {#returned_values}

无限循环以返回查询结果。

## 示例 {#examples}

从 ClickHouse 选择数据：

```sql
SELECT * FROM loop(test_database, test_table);
SELECT * FROM loop(test_database.test_table);
SELECT * FROM loop(test_table);
```

或使用其他表函数：

```sql
SELECT * FROM loop(numbers(3)) LIMIT 7;
   ┌─number─┐
1. │      0 │
2. │      1 │
3. │      2 │
   └────────┘
   ┌─number─┐
4. │      0 │
5. │      1 │
6. │      2 │
   └────────┘
   ┌─number─┐
7. │      0 │
   └────────┘
```
```sql
SELECT * FROM loop(mysql('localhost:3306', 'test', 'test', 'user', 'password'));
...
```
