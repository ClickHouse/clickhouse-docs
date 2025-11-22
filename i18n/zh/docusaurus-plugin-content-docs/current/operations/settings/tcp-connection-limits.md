---
description: 'TCP 连接限制。'
sidebar_label: 'TCP 连接限制'
slug: /operations/settings/tcp-connection-limits
title: 'TCP 连接限制'
doc_type: 'reference'
---



# TCP 连接数限制



## 概述 {#overview}

ClickHouse TCP 连接(即通过[命令行客户端](https://clickhouse.com/docs/interfaces/cli)建立的连接)可能会在执行一定数量的查询或经过一定时长后自动断开连接。
断开连接后,不会自动重新连接(除非通过其他方式触发,例如在命令行客户端中发送另一个查询)。

通过将服务器设置 `tcp_close_connection_after_queries_num`(用于查询数量限制)或 `tcp_close_connection_after_queries_seconds`(用于持续时长限制)设置为大于 0 来启用连接限制。
如果同时启用了两个限制,则连接会在首先达到任一限制时关闭。

达到限制并断开连接时,客户端会收到 `TCP_CONNECTION_LIMIT_REACHED` 异常,并且**触发断开连接的查询将不会被处理**。


## 查询限制 {#query-limits}

假设 `tcp_close_connection_after_queries_num` 设置为 N,则该连接允许执行 N 次成功查询。当执行第 N + 1 次查询时,客户端将断开连接。

每个已处理的查询都会计入查询限制。因此,在连接命令行客户端时,可能会自动执行一个初始系统警告查询,该查询也会计入限制。

当 TCP 连接处于空闲状态时(即在会话设置 `poll_interval` 指定的时间段内未处理任何查询),已计数的查询数量将重置为 0。这意味着如果连接出现空闲,单个连接中的总查询数可以超过 `tcp_close_connection_after_queries_num` 的限制。


## 持续时间限制 {#duration-limits}

连接持续时间从客户端建立连接时开始计算。
当 `tcp_close_connection_after_queries_seconds` 秒过后,客户端将在执行第一个查询时被断开连接。
