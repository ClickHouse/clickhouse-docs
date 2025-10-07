---
'description': '系统表包含一个特定表的过滤器，以及应该使用此行策略的角色和/或用户列表。'
'keywords':
- 'system table'
- 'row_policies'
'slug': '/operations/system-tables/row_policies'
'title': 'system.row_policies'
'doc_type': 'reference'
---


# system.row_policies

包含特定表的过滤器，以及应使用此行策略的角色和/或用户列表。

列：
- `name` ([String](../../sql-reference/data-types/string.md)) — 行策略的名称。

- `short_name` ([String](../../sql-reference/data-types/string.md)) — 行策略的简短名称。行策略的名称是复合的，例如：myfilter ON mydb.mytable。在这里，“myfilter ON mydb.mytable”是行策略的名称，“myfilter”是它的简短名称。

- `database` ([String](../../sql-reference/data-types/string.md)) — 数据库名称。

- `table` ([String](../../sql-reference/data-types/string.md)) — 表名称。如果是数据库的策略，则为空。

- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 行策略的 ID。

- `storage` ([String](../../sql-reference/data-types/string.md)) — 行策略存储的目录名称。

- `select_filter` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 用于过滤行的条件。

- `is_restrictive` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示行策略是否限制对行的访问，参见 [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)。值：
  - `0` — 行策略是，与 `AS PERMISSIVE` 子句一起定义。
  - `1` — 行策略是，与 `AS RESTRICTIVE` 子句一起定义。

- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示此行策略适用于所有角色和/或用户。

- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 适用行策略的角色和/或用户列表。

- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 此行策略适用于所有角色和/或用户，但不包括列出的角色和/或用户。

## See Also {#see-also}

- [SHOW POLICIES](/sql-reference/statements/show#show-policies)
