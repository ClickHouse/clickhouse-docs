---
description: 'USE 语句文档'
sidebar_label: 'USE'
sidebar_position: 53
slug: /sql-reference/statements/use
title: 'USE 语句'
doc_type: 'reference'
---

# USE 语句

```sql
USE [DATABASE] db
```

允许为会话设置当前使用的数据库。

当前数据库用于在查询中查找表：如果在表名前未通过“数据库名.表名”的形式显式指定数据库，就会使用当前数据库。

使用 HTTP 协议时无法执行此查询，因为在该协议中不存在会话的概念。
