---
'description': '关于网络接口、驱动程序和连接到 ClickHouse 的工具的概述'
'keywords':
- 'clickhouse'
- 'network'
- 'interfaces'
- 'http'
- 'tcp'
- 'grpc'
- 'command-line'
- 'client'
- 'jdbc'
- 'odbc'
- 'driver'
'sidebar_label': '概述'
'slug': '/interfaces/overview'
'title': '驱动程序和接口'
'doc_type': 'reference'
---


# 驱动程序和接口

ClickHouse 提供了两种网络接口（它们可以选择性地用 TLS 包装以增强安全性）：

- [HTTP](http.md)，文档详细且易于直接使用。
- [Native TCP](../interfaces/tcp.md)，开销较小。

在大多数情况下，建议使用适当的工具或库，而不是直接与这些接口交互。以下是 ClickHouse 官方支持的工具：

- [命令行客户端](../interfaces/cli.md)
- [JDBC 驱动程序](../interfaces/jdbc.md)
- [ODBC 驱动程序](../interfaces/odbc.md)
- [C++ 客户端库](../interfaces/cpp.md)

ClickHouse 还支持两种 RPC 协议：
- [gRPC 协议](grpc.md)，专为 ClickHouse 设计。
- [Apache Arrow Flight](arrowflight.md)。

ClickHouse 服务器提供了嵌入式可视化界面，以满足高级用户需求：

- Play UI：在浏览器中打开 `/play`；
- 高级仪表板：在浏览器中打开 `/dashboard`；
- ClickHouse 工程师的二进制符号查看器：在浏览器中打开 `/binary`；

此外，还有广泛的第三方库可用于与 ClickHouse 进行交互：

- [客户端库](../interfaces/third-party/client-libraries.md)
- [集成](../interfaces/third-party/integrations.md)
- [可视化接口](../interfaces/third-party/gui.md)
