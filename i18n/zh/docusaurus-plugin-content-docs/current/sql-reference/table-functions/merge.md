---
'description': 'Creates a temporary Merge table. The structure will be derived from
  underlying tables by using a union of their columns and by deriving common types.'
'sidebar_label': 'Merge'
'sidebar_position': 130
'slug': '/sql-reference/table-functions/merge'
'title': 'merge'
---




# merge 表函数

创建一个临时的 [Merge](../../engines/table-engines/special/merge.md) 表。结构将通过对底层表的列进行联合以及推导公共类型来派生。

## 语法 {#syntax}

```sql
merge(['db_name',] 'tables_regexp')
```
## 参数 {#arguments}

| 参数            | 描述                                                                                                                                                                                                                                                                                     |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `db_name`       | 可选值（默认是 `currentDatabase()`）：<br/>    - 数据库名称,<br/>    - 返回字符串的常量表达式，例如 `currentDatabase()`,<br/>    - `REGEXP(expression)`，其中 `expression` 是用于匹配数据库名称的正则表达式。                                   |
| `tables_regexp` | 用于匹配指定数据库或数据库中的表名称的正则表达式。                                                                                                                                                                                                                                     |

## 相关 {#related}

- [Merge](../../engines/table-engines/special/merge.md) 表引擎
