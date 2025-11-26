---
description: 'TCP 连接数限制。'
sidebar_label: 'TCP 连接数限制'
slug: /operations/settings/tcp-connection-limits
title: 'TCP 连接数限制'
doc_type: 'reference'
---



# TCP 连接数限制



## 概览 {#overview}

您可能会遇到 ClickHouse 的 TCP 连接（例如，通过[命令行客户端](https://clickhouse.com/docs/interfaces/cli)建立的连接）
在执行一定数量的查询或经过一段时间后自动断开。
在断开连接后，不会发生自动重连（除非通过其他操作触发，
比如在命令行客户端中再次发送查询）。

可以通过设置服务端配置项来启用连接限制：
`tcp_close_connection_after_queries_num`（按查询数量限制）
或 `tcp_close_connection_after_queries_seconds`（按持续时间限制），并将其值设置为大于 0。
如果两个限制都被启用，则连接会在任一限制先被触发时关闭。

在触发限制并断开连接时，客户端会收到
`TCP_CONNECTION_LIMIT_REACHED` 异常，且**导致此次断开的那个查询不会被执行**。



## 查询限制 {#query-limits}

假设 `tcp_close_connection_after_queries_num` 设置为 N，则该连接允许进行
N 次成功查询。在第 N + 1 次查询时，客户端会断开连接。

处理的每个查询都会计入查询限制。因此，当使用命令行客户端连接时，
可能会自动发出一次初始系统警告查询，这个查询同样计入限制内。

当一个 TCP 连接处于空闲状态（即在一段时间内未处理查询，
该时间由会话设置 `poll_interval` 指定）时，至此为止统计的查询次数会重置为 0。
这意味着，如果连接在中途出现空闲，同一个连接中的总查询次数可以超过
`tcp_close_connection_after_queries_num`。



## 持续时间限制 {#duration-limits}

连接持续时间从客户端建立连接的瞬间开始计时。
在经过 `tcp_close_connection_after_queries_seconds` 秒后，客户端在其之后发出的第一条查询时会被断开连接。
