---
'description': 'USE 语句的文档'
'sidebar_label': 'USE'
'sidebar_position': 53
'slug': '/sql-reference/statements/use'
'title': 'USE 语句'
---


# USE 语句

```sql
USE db
```

允许您为会话设置当前数据库。

当前数据库用于在查询中未通过点在表名前明确定义数据库时搜索表。

当使用 HTTP 协议时，无法执行此查询，因为没有会话的概念。
