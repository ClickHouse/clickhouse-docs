---
'description': '系统表，包含特定表的过滤器，以及应该使用此行策略的角色和/或用户列表。'
'keywords':
- 'system table'
- 'row_policies'
'slug': '/operations/system-tables/row_policies'
'title': '系统.row_policies'
---




# system.row_policies

包含特定表的过滤器，以及应使用此行策略的角色和/或用户列表。

列：
- `name` ([String](../../sql-reference/data-types/string.md)) — 行策略的名称。

- `short_name` ([String](../../sql-reference/data-types/string.md)) — 行策略的短名称。行策略的名称是复合的，例如：myfilter ON mydb.mytable。在这里，"myfilter ON mydb.mytable" 是行策略的名称，"myfilter" 是它的短名称。

- `database` ([String](../../sql-reference/data-types/string.md)) — 数据库名称。

- `table` ([String](../../sql-reference/data-types/string.md)) — 表名称。如果策略适用于数据库，则为空。

- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 行策略 ID。

- `storage` ([String](../../sql-reference/data-types/string.md)) — 存储行策略的目录名称。

- `select_filter` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 用于过滤行的条件。

- `is_restrictive` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示行策略是否限制对行的访问，请参见 [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)。值：
  - `0` — 行策略是通过 `AS PERMISSIVE` 子句定义的。
  - `1` — 行策略是通过 `AS RESTRICTIVE` 子句定义的。

- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示行策略设置适用于所有角色和/或用户。

- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 行策略应用于的角色和/或用户列表。

- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 行策略适用于所有角色和/或用户，除了列出的那些。

## 另请参见 {#see-also}

- [SHOW POLICIES](/sql-reference/statements/show#show-policies)
