---
description: 'SET 语句文档'
sidebar_label: 'SET'
sidebar_position: 50
slug: /sql-reference/statements/set
title: 'SET 语句'
doc_type: 'reference'
---

# SET 语句

```sql
SET 参数 = 值
```

将当前会话中的 `param` [设置](/operations/settings/overview) 设置为 `value`。不能通过这种方式更改[服务器设置](../../operations/server-configuration-parameters/settings.md)。

你也可以在单个查询中，一次性应用指定设置配置文件中的所有值。

```sql
SET profile = '设置文件中的配置文件名称'
```

对于值为 true 的布尔类型设置，你可以通过省略赋值来使用简写语法。仅指定设置名称时，它会自动被设置为 `1`（true）。

```sql
-- 以下两种写法等效：
SET force_index_by_date = 1
SET force_index_by_date
```

如需了解更多信息，请参阅[设置](../../operations/settings/settings.md)。
