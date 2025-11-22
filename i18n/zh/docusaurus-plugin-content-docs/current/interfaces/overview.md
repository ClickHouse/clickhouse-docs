---
description: '连接 ClickHouse 的网络接口、驱动和工具概览'
keywords: ['clickhouse', 'network', 'interfaces', 'http', 'tcp', 'grpc', 'command-line',
  'client', 'jdbc', 'odbc', 'driver']
sidebar_label: '概览'
slug: /interfaces/overview
title: '驱动和接口'
doc_type: 'reference'
---

# 驱动与接口

ClickHouse 提供两个网络接口（可选地通过 TLS 封装以增强安全性）：

- [HTTP](http.md)，有完整文档支持，并且可以直接轻松使用。
- [原生 TCP](../interfaces/tcp.md)，开销更低。

在大多数情况下，建议使用合适的工具或库，而不是直接与这些接口交互。以下是 ClickHouse 官方支持的接口：

- [命令行客户端](../interfaces/cli.md)
- [JDBC 驱动](../interfaces/jdbc.md)
- [ODBC 驱动](../interfaces/odbc.md)
- [C++ 客户端库](../interfaces/cpp.md)

ClickHouse 还支持两种 RPC 协议：

- 专为 ClickHouse 设计的 [gRPC 协议](grpc.md)。
- [Apache Arrow Flight](arrowflight.md)。

ClickHouse 服务器为高级用户提供了内置可视化界面：

- Play UI：在浏览器中打开 `/play`；
- Advanced Dashboard：在浏览器中打开 `/dashboard`；
- 面向 ClickHouse 工程师的二进制符号查看器：在浏览器中打开 `/binary`；

同时还有多种用于操作 ClickHouse 的第三方库：

- [客户端库](../interfaces/third-party/client-libraries.md)
- [集成方案](../interfaces/third-party/integrations.md)
- [可视化界面](../interfaces/third-party/gui.md)