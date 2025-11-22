---
description: '查询权限相关设置。'
sidebar_label: '查询权限'
sidebar_position: 58
slug: /operations/settings/permissions-for-queries
title: '查询权限'
doc_type: 'reference'
---



# 查询权限

ClickHouse 中的查询可以分为几种类型：

1.  读取数据的查询：`SELECT`、`SHOW`、`DESCRIBE`、`EXISTS`。
2.  写入数据的查询：`INSERT`、`OPTIMIZE`。
3.  更改设置的查询：`SET`、`USE`。
4.  [DDL](https://en.wikipedia.org/wiki/Data_definition_language) 查询：`CREATE`、`ALTER`、`RENAME`、`ATTACH`、`DETACH`、`DROP`、`TRUNCATE`。
5.  `KILL QUERY`。

以下设置按查询类型控制用户权限：



## readonly {#readonly}

限制读取数据、写入数据和更改设置查询的权限。

当设置为 1 时,允许:

- 所有类型的读取查询(如 SELECT 及等效查询)。
- 仅修改会话上下文的查询(如 USE)。

当设置为 2 时,除上述内容外还允许:

- SET 和 CREATE TEMPORARY TABLE

  :::tip
  诸如 EXISTS、DESCRIBE、EXPLAIN、SHOW PROCESSLIST 等查询等同于 SELECT,因为它们只是从系统表中执行查询。
  :::

可能的值:

- 0 — 允许读取、写入和更改设置查询。
- 1 — 仅允许读取数据查询。
- 2 — 允许读取数据和更改设置查询。

默认值:0

:::note
设置 `readonly = 1` 后,用户无法在当前会话中更改 `readonly` 和 `allow_ddl` 设置。

在 [HTTP 接口](../../interfaces/http.md) 中使用 `GET` 方法时,会自动设置 `readonly = 1`。要修改数据,请使用 `POST` 方法。

设置 `readonly = 1` 会禁止用户更改设置。可以通过某种方式仅禁止用户更改特定设置。此外,还可以在 `readonly = 1` 限制下仅允许更改特定设置。详情请参阅[设置约束](../../operations/settings/constraints-on-settings.md)。
:::


## allow_ddl {#allow_ddl}

允许或禁止 [DDL](https://en.wikipedia.org/wiki/Data_definition_language) 查询。

可选值：

- 0 — 禁止 DDL 查询。
- 1 — 允许 DDL 查询。

默认值：1

:::note
如果当前会话的 `allow_ddl = 0`，则无法执行 `SET allow_ddl = 1`。
:::

:::note KILL QUERY
`KILL QUERY` 可以在 readonly 和 allow_ddl 设置的任意组合下执行。
:::
