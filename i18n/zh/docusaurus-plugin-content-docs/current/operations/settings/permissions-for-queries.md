---
slug: /operations/settings/permissions-for-queries
sidebar_position: 58
sidebar_label: '查询权限'
title: '查询权限'
description: '查询权限设置。'
---


# 查询权限

ClickHouse中的查询可以分为几种类型：

1.  读取数据查询: `SELECT`, `SHOW`, `DESCRIBE`, `EXISTS`。
2.  写入数据查询: `INSERT`, `OPTIMIZE`。
3.  修改设置查询: `SET`, `USE`。
4.  [DDL](https://en.wikipedia.org/wiki/Data_definition_language) 查询: `CREATE`, `ALTER`, `RENAME`, `ATTACH`, `DETACH`, `DROP`, `TRUNCATE`。
5.  `KILL QUERY`。

以下设置按照查询类型调节用户权限：

## readonly {#readonly}
限制读取数据、写入数据和修改设置查询的权限。

当设置为1时，允许：

- 所有类型的读取查询（如SELECT和等效查询）。
- 仅修改会话上下文的查询（如USE）。

当设置为2时，允许上述内容外加：
- SET和CREATE TEMPORARY TABLE

  :::tip
  如EXISTS、DESCRIBE、EXPLAIN、SHOW PROCESSLIST等查询等同于SELECT，因为它们只从系统表中选择。
  :::

可选值：

- 0 — 允许读取、写入和修改设置的查询。
- 1 — 仅允许读取数据查询。
- 2 — 允许读取数据和修改设置的查询。

默认值: 0

:::note
设置`readonly = 1`后，用户无法在当前会话中更改`readonly`和`allow_ddl`设置。

在[HTTP接口](../../interfaces/http.md)中使用`GET`方法时，`readonly = 1`会自动设置。要修改数据，请使用`POST`方法。

设置`readonly = 1`禁止用户更改设置。也有方法禁止用户仅更改特定设置。还有方法在`readonly = 1`限制下仅允许更改特定设置。有关详细信息，请参见[设置约束](../../operations/settings/constraints-on-settings.md)。
:::


## allow_ddl {#allow_ddl}

允许或拒绝[DDL](https://en.wikipedia.org/wiki/Data_definition_language)查询。

可选值：

- 0 — 不允许DDL查询。
- 1 — 允许DDL查询。

默认值: 1

:::note
如果当前会话的`allow_ddl = 0`，则无法运行`SET allow_ddl = 1`。
:::


:::note KILL QUERY
`KILL QUERY`可以与任何组合的readonly和allow_ddl设置一起执行。
:::
