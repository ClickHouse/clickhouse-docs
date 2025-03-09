---
slug: /sql-reference/statements/use
sidebar_position: 53
sidebar_label: USE
---


# USE 语句

``` sql
USE db
```

允许您设置会话的当前数据库。

当前数据库用于在查询中未在表名称之前明确定义数据库时查找表。

使用 HTTP 协议时无法执行此查询，因为没有会话的概念。
