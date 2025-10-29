---
'description': 'CHECK GRANT 的文档'
'sidebar_label': 'CHECK GRANT'
'sidebar_position': 56
'slug': '/sql-reference/statements/check-grant'
'title': 'CHECK GRANT 语句'
'doc_type': 'reference'
---

`CHECK GRANT` 查询用于检查当前用户/角色是否被授予特定权限。

## 语法 {#syntax}

查询的基本语法如下：

```sql
CHECK GRANT privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*}
```

- `privilege` — 权限类型。

## 示例 {#examples}

如果用户之前被授予该权限，则响应 `check_grant` 将为 `1`。否则，响应 `check_grant` 将为 `0`。

如果 `table_1.col1` 存在并且当前用户被授予 `SELECT`/`SELECT(con)` 权限或角色（具有该权限），则响应为 `1`。
```sql
CHECK GRANT SELECT(col1) ON table_1;
```

```text
┌─result─┐
│      1 │
└────────┘
```
如果 `table_2.col2` 不存在，或者当前用户没有被授予 `SELECT`/`SELECT(con)` 权限或角色（具有该权限），则响应为 `0`。
```sql
CHECK GRANT SELECT(col2) ON table_2;
```

```text
┌─result─┐
│      0 │
└────────┘
```

## 通配符 {#wildcard}
指定权限时，可以使用星号（`*`）代替表名或数据库名。请查看 [WILDCARD GRANTS](../../sql-reference/statements/grant.md#wildcard-grants) 以获取通配符规则。
