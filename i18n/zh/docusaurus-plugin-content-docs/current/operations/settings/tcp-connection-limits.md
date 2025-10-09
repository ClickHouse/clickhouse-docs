---
'description': 'TCP 连接限制。'
'sidebar_label': 'TCP 连接限制'
'slug': '/operations/settings/tcp-connection-limits'
'title': 'TCP 连接限制'
'doc_type': 'reference'
---


# TCP 连接限制

## 概述 {#overview}

您可能会发现 ClickHouse 的 TCP 连接（即通过 [命令行客户端](https://clickhouse.com/docs/interfaces/cli)）在执行一定数量的查询或持续时间后自动断开。
断开后，不会自动重新连接（除非通过其他方式触发，例如在命令行客户端发送另一个查询）。

连接限制通过设置服务器选项 `tcp_close_connection_after_queries_num`（用于查询限制）或 `tcp_close_connection_after_queries_seconds`（用于持续时间限制）为大于 0 的值来启用。
如果同时启用了两个限制，则当任一限制首先触发时，连接将关闭。

当触碰限制并断开时，客户端会收到 `TCP_CONNECTION_LIMIT_REACHED` 异常，并且 **导致断开的查询将不会被处理**。

## 查询限制 {#query-limits}

假设 `tcp_close_connection_after_queries_num` 设置为 N，则连接允许 N 次成功查询。然后在查询 N + 1 时，客户端将断开连接。

每个处理的查询都会计入查询限制。因此，当连接命令行客户端时，可能会有一个自动的初始系统警告查询，这会计入限制。

当 TCP 连接处于空闲状态（即，在一段时间内没有处理查询，具体时间由会话设置 `poll_interval` 指定）时，到目前为止计入的查询数量将重置为 0。
这意味着在单个连接中查询的总数可以超过 `tcp_close_connection_after_queries_num`，如果出现空闲状态。

## 持续时间限制 {#duration-limits}

连接持续时间从客户端连接时开始计算。
在经过 `tcp_close_connection_after_queries_seconds` 秒后，客户端在第一个查询时会断开连接。
