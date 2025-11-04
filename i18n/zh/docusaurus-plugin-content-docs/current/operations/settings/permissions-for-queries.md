---
'description': '查询权限的设置。'
'sidebar_label': '查询的权限'
'sidebar_position': 58
'slug': '/operations/settings/permissions-for-queries'
'title': '查询的权限'
'doc_type': 'reference'
---


# 查询权限

在 ClickHouse 中，查询可以分为几种类型：

1. 读取数据查询： `SELECT`、`SHOW`、`DESCRIBE`、`EXISTS`。
2. 写入数据查询： `INSERT`、`OPTIMIZE`。
3. 更改设置查询： `SET`、`USE`。
4. [DDL](https://en.wikipedia.org/wiki/Data_definition_language) 查询： `CREATE`、`ALTER`、`RENAME`、`ATTACH`、`DETACH`、`DROP`、`TRUNCATE`。
5. `KILL QUERY`。

以下设置根据查询类型调节用户权限：

## readonly {#readonly}
限制读取数据、写入数据和更改设置查询的权限。

当设置为 1 时，允许：

- 所有类型的读取查询（如 SELECT 及其等效查询）。
- 仅修改会话上下文的查询（如 USE）。

当设置为 2 时，允许上述操作加上：
- SET 和 CREATE TEMPORARY TABLE

  :::tip
  查询如 EXISTS、DESCRIBE、EXPLAIN、SHOW PROCESSLIST 等等等效于 SELECT，因为它们只是从系统表中选择数据。
  :::

可能的值：

- 0 — 允许读取、写入和更改设置查询。
- 1 — 仅允许读取数据查询。
- 2 — 允许读取数据和更改设置查询。

默认值： 0

:::note
在将 `readonly = 1` 设置后，用户无法在当前会话中更改 `readonly` 和 `allow_ddl` 设置。

在使用 [HTTP 接口](../../interfaces/http.md) 中的 `GET` 方法时，`readonly = 1` 会自动设置。要修改数据，请使用 `POST` 方法。

设置 `readonly = 1` 禁止用户更改设置。有一种方法可以禁止用户仅更改特定设置。还可以在 `readonly = 1` 限制下允许更改特定设置。有关详细信息，请参见 [设置约束](../../operations/settings/constraints-on-settings.md)。
:::

## allow_ddl {#allow_ddl}

允许或拒绝 [DDL](https://en.wikipedia.org/wiki/Data_definition_language) 查询。

可能的值：

- 0 — 不允许 DDL 查询。
- 1 — 允许 DDL 查询。

默认值： 1

:::note
如果当前会话中 `allow_ddl = 0`，则无法运行 `SET allow_ddl = 1`。
:::

:::note KILL QUERY
可以使用任意组合的 readonly 和 allow_ddl 设置执行 `KILL QUERY`。
:::
