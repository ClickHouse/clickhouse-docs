---
'description': 'USE语句文档'
'sidebar_label': 'USE'
'sidebar_position': 53
'slug': '/sql-reference/statements/use'
'title': 'USE语句'
---




# USE 语句

```sql
USE db
```

允许您为会话设置当前数据库。

当前数据库用于搜索表格，如果查询中未通过表名之前的点明确定义数据库。

在使用 HTTP 协议时，无法执行此查询，因为没有会话的概念。
