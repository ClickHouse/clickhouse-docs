---
'description': '创建一个临时 Merge 表。该结构将通过使用其列的联合和推导共同类型从基础表中导出。'
'sidebar_label': '合并'
'sidebar_position': 130
'slug': '/sql-reference/table-functions/merge'
'title': '合并'
---


# merge Table Function

创建一个临时 [Merge](../../engines/table-engines/special/merge.md) 表。该结构将通过对其列的联合以及推导公共类型来自底层表。

## Syntax {#syntax}

```sql
merge(['db_name',] 'tables_regexp')
```
## Arguments {#arguments}

| Argument        | Description                                                                                                                                                                                                                                                                                     |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `db_name`       | 可能值（可选，默认是 `currentDatabase()`）：<br/>    - 数据库名称,<br/>    - 返回数据库名称字符串的常数表达式，例如 `currentDatabase()`，<br/>    - `REGEXP(expression)`，其中 `expression` 是用于匹配数据库名称的正则表达式。 |
| `tables_regexp` | 用于匹配指定数据库或数据库中的表名称的正则表达式。                                                                                                                                                                                                                       |

## Related {#related}

- [Merge](../../engines/table-engines/special/merge.md) 表引擎
