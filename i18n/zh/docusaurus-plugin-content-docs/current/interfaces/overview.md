---
description: '用于连接 ClickHouse 的网络接口、驱动和工具概览'
keywords: ['clickhouse', '网络', '接口', 'http', 'tcp', 'grpc', '命令行',
  '客户端', 'jdbc', 'odbc', '驱动']
sidebar_label: '概览'
slug: /interfaces/overview
title: '驱动与接口'
doc_type: 'reference'
---

# 驱动与接口 {#drivers-and-interfaces}

ClickHouse 提供了两个网络接口（可选择通过 TLS 封装以增强安全性）：

* [HTTP](http.md)，文档完善且便于直接使用。
* [原生 TCP](../interfaces/tcp.md)，开销更低。

在大多数情况下，推荐使用合适的工具或库，而不是直接与这些接口交互。以下是 ClickHouse 官方支持的方式：

* [命令行客户端](../interfaces/cli.md)
* [JDBC 驱动](../interfaces/jdbc.md)
* [ODBC 驱动](../interfaces/odbc.md)
* [C++ 客户端库](../interfaces/cpp.md)

ClickHouse 还支持两种 RPC 协议：

* 专为 ClickHouse 设计的 [gRPC 协议](grpc.md)。
* [Apache Arrow Flight](arrowflight.md)。

ClickHouse 服务器为高级用户提供了内置的可视化界面：

* Play UI：在浏览器中打开 `/play`；
* 高级仪表盘：在浏览器中打开 `/dashboard`；
* 面向 ClickHouse 工程师的二进制符号查看器：在浏览器中打开 `/binary`。

同时，还有大量用于配合 ClickHouse 使用的第三方库：

* [客户端库](../interfaces/third-party/client-libraries.md)
* [集成](../interfaces/third-party/integrations.md)
* [可视化界面](../interfaces/third-party/gui.md)