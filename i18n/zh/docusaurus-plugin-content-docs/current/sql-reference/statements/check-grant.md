---
description: 'CHECK GRANT 文档'
sidebar_label: 'CHECK GRANT'
sidebar_position: 56
slug: /sql-reference/statements/check-grant
title: 'CHECK GRANT 语句'
doc_type: 'reference'
---

`CHECK GRANT` 查询用于检查当前用户/角色是否已被授予某项特定权限。



## 语法 {#syntax}

查询的基本语法如下：

```sql
CHECK GRANT privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*}
```

- `privilege` — 权限类型。


## 示例 {#examples}

如果用户已被授予该权限,则 `check_grant` 响应结果为 `1`。否则,`check_grant` 响应结果为 `0`。

如果 `table_1.col1` 存在且当前用户已被授予 `SELECT`/`SELECT(col1)` 权限或具有该权限的角色,则响应结果为 `1`。

```sql
CHECK GRANT SELECT(col1) ON table_1;
```

```text
┌─result─┐
│      1 │
└────────┘
```

如果 `table_2.col2` 不存在,或当前用户未被授予 `SELECT`/`SELECT(col2)` 权限或具有该权限的角色,则响应结果为 `0`。

```sql
CHECK GRANT SELECT(col2) ON table_2;
```

```text
┌─result─┐
│      0 │
└────────┘
```


## 通配符 {#wildcard}

在指定权限时,可以使用星号(`*`)代替表名或数据库名。有关通配符规则的详细信息,请参阅 [通配符授权](../../sql-reference/statements/grant.md#wildcard-grants)。
