---
'description': '创建一个临时的 Merge 表。该结构将通过对其列的联合和派生公共类型来从基础表中获取。'
'sidebar_label': '合并'
'sidebar_position': 130
'slug': '/sql-reference/table-functions/merge'
'title': '合并'
'doc_type': 'reference'
---


# merge Table Function

创建一个临时 [Merge](../../engines/table-engines/special/merge.md) 表。该结构将通过使用其列的并集和推导公共类型从基础表中派生。

## Syntax {#syntax}

```sql
merge(['db_name',] 'tables_regexp')
```
## Arguments {#arguments}

| Argument        | Description                                                                                                                                                                                                                                                                                     |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `db_name`       | 可选值（默认是 `currentDatabase()`）：<br/>    - 数据库名称,<br/>    - 返回数据库名称字符串的常量表达式，例如 `currentDatabase()`，<br/>    - `REGEXP(expression)`，其中 `expression` 是与数据库名称匹配的正则表达式。                                                 |
| `tables_regexp` | 用于匹配指定数据库或数据库中的表名称的正则表达式。                                                                                                                                                                                                                       |

## Related {#related}

- [Merge](../../engines/table-engines/special/merge.md) 表引擎
