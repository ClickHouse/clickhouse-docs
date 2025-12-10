---
description: 'SET 语句文档'
sidebar_label: 'SET'
sidebar_position: 50
slug: /sql-reference/statements/set
title: 'SET 语句'
doc_type: 'reference'
---

# SET 语句 {#set-statement}

```sql
SET param = value
```

将 `value` 赋给当前会话的 `param` [setting](/operations/settings/overview)。无法通过这种方式更改[服务器设置](../../operations/server-configuration-parameters/settings.md)。

你也可以在单个查询中，将指定 SETTINGS PROFILE 中的所有设置值一次性应用。

```sql
SET profile = 'profile-name-from-the-settings-file'
```

对于值为 true 的布尔类型设置，可以通过省略赋值来使用简写语法。仅指定设置名称时，它会自动被设为 `1`（true）。

```sql
-- 以下两种写法等效：
SET force_index_by_date = 1
SET force_index_by_date
```

## 设置查询参数 {#setting-query-parameters}

`SET` 语句还可以用于定义查询参数，只需在参数名称前添加前缀 `param_`。
查询参数允许您编写带占位符的通用查询，这些占位符会在执行时被实际值替换。

```sql
SET param_name = value
```

要在查询中使用查询参数，请按 `{name: datatype}` 这种语法进行引用：

```sql
SET param_id = 42;
SET param_name = 'John';

SELECT * FROM users
WHERE id = {id: UInt32}
AND name = {name: String};
```

当需要对同一个查询以不同的值多次执行时，查询参数尤其有用。

有关查询参数的更详细信息（包括与 `Identifier` 类型配合使用），请参阅[定义和使用查询参数](../../sql-reference/syntax.md#defining-and-using-query-parameters)。

更多信息，请参阅[Settings](../../operations/settings/settings.md)。
