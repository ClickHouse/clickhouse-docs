---
'description': '查询权限设置。'
'sidebar_label': '查询权限'
'sidebar_position': 58
'slug': '/operations/settings/permissions-for-queries'
'title': '查询权限'
---




# 查询权限

ClickHouse中的查询可以分为几种类型：

1.  读取数据查询：`SELECT`，`SHOW`，`DESCRIBE`，`EXISTS`。
2.  写入数据查询：`INSERT`，`OPTIMIZE`。
3.  更改设置查询：`SET`，`USE`。
4.  [DDL](https://en.wikipedia.org/wiki/Data_definition_language) 查询：`CREATE`，`ALTER`，`RENAME`，`ATTACH`，`DETACH`，`DROP`，`TRUNCATE`。
5.  `KILL QUERY`。

以下设置根据查询类型来调节用户权限：

## readonly {#readonly}
限制读取数据、写入数据和更改设置查询的权限。

设置为1时，允许：

- 所有类型的读取查询（如SELECT及其等效查询）。
- 仅修改会话上下文的查询（如USE）。

设置为2时，允许上述类型的查询，以及：
- SET和CREATE TEMPORARY TABLE

  :::tip
  查询如EXISTS、DESCRIBE、EXPLAIN、SHOW PROCESSLIST等等同于SELECT，因为它们只是从系统表中选择。
  :::

可选值：

- 0 — 允许读取、写入和更改设置查询。
- 1 — 仅允许读取数据查询。
- 2 — 允许读取数据和更改设置查询。

默认值：0

:::note
设置 `readonly = 1` 后，用户无法在当前会话中更改 `readonly` 和 `allow_ddl` 设置。

在[HTTP接口](../../interfaces/http.md)中使用 `GET` 方法时，会自动设置 `readonly = 1`。要修改数据，请使用 `POST` 方法。

设置 `readonly = 1` 禁止用户更改设置。有一种方法可以阻止用户仅更改特定设置。同时，还有一种方法可以允许在 `readonly = 1` 限制下仅更改特定设置。详情请参见[设置约束](../../operations/settings/constraints-on-settings.md)。
:::


## allow_ddl {#allow_ddl}

允许或拒绝[DDL](https://en.wikipedia.org/wiki/Data_definition_language) 查询。

可选值：

- 0 — 不允许DDL查询。
- 1 — 允许DDL查询。

默认值：1

:::note
如果当前会话中 `allow_ddl = 0`，则无法执行 `SET allow_ddl = 1`。
:::


:::note KILL QUERY
可以在任何组合的readonly和allow_ddl设置下执行`KILL QUERY`。
:::
