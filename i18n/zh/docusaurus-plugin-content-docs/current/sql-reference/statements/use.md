---
'description': '文档关于 USE 语句'
'sidebar_label': 'USE'
'sidebar_position': 53
'slug': '/sql-reference/statements/use'
'title': 'USE 语句'
'doc_type': 'reference'
---


# USE 语句

```sql
USE [DATABASE] db
```

允许您为会话设置当前数据库。

当前数据库用于查找表，如果在查询中未通过点在表名前显式定义数据库。

使用 HTTP 协议时无法执行此查询，因为没有会话的概念。
