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

用于为会话设置当前数据库。

如果在查询中未通过“数据库.表名”的形式显式指定数据库，则会使用当前数据库来查找表。

在使用 HTTP 协议时无法执行此查询，因为在该协议中不存在会话的概念。
