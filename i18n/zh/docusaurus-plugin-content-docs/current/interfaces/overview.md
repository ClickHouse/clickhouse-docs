---
slug: /interfaces/overview
sidebar_label: 概述
sidebar_position: 1
keywords: [clickhouse, 网络, 接口, http, tcp, grpc, 命令行, 客户端, jdbc, odbc, 驱动]
description: ClickHouse 提供三个网络接口
---


# 驱动和接口

ClickHouse 提供三个网络接口（可以选择性地使用 TLS 进行额外的安全保护）：

- [HTTP](http.md)，文档齐全且易于直接使用。
- [Native TCP](../interfaces/tcp.md)，开销更小。
- [gRPC](grpc.md)。

在大多数情况下，建议使用合适的工具或库，而不是直接与这些接口交互。以下是 ClickHouse 官方支持的项目：

- [命令行客户端](../interfaces/cli.md)
- [JDBC 驱动](../interfaces/jdbc.md)
- [ODBC 驱动](../interfaces/odbc.md)
- [C++ 客户端库](../interfaces/cpp.md)

ClickHouse 服务器为高级用户提供了嵌入式可视化接口：

- Play UI：在浏览器中打开 `/play`；
- 高级仪表板：在浏览器中打开 `/dashboard`；
- ClickHouse 工程师的二进制符号查看器：在浏览器中打开 `/binary`；

此外，还有广泛的第三方库可用于与 ClickHouse 的交互：

- [客户端库](../interfaces/third-party/client-libraries.md)
- [集成](../interfaces/third-party/integrations.md)
- [可视化接口](../interfaces/third-party/gui.md)
