---
description: 'SET 语句说明'
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

将 `value` 赋给当前会话的 `param` [设置](/operations/settings/overview)。无法通过这种方式更改[服务器设置](../../operations/server-configuration-parameters/settings.md)。

你也可以在一条查询中，根据指定的设置配置文件一次性设置其中的所有值。

```sql
SET profile = '配置文件中的配置文件名称'
```

对于值为 true 的布尔类型设置项，可以通过省略赋值来使用简写语法。仅指定设置名称时，其值会自动设为 `1`（true）。

```sql
-- 以下两种写法等效：
SET force_index_by_date = 1
SET force_index_by_date
```

如需了解更多信息，请参阅[设置](../../operations/settings/settings.md)。
