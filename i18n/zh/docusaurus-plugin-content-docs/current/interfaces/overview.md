---
'description': '网络接口、驱动程序和连接到 ClickHouse 的工具概述'
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
---


# 驱动程序和接口

ClickHouse 提供了三个网络接口（它们可以选择性地通过 TLS 包装以增加安全性）：

- [HTTP](http.md)，文档齐全，使用简单。
- [Native TCP](../interfaces/tcp.md)，开销较小。
- [gRPC](grpc.md)。

在大多数情况下，建议使用合适的工具或库，而不是直接与这些接口交互。以下是 ClickHouse 官方支持的：

- [命令行客户端](../interfaces/cli.md)
- [JDBC 驱动程序](../interfaces/jdbc.md)
- [ODBC 驱动程序](../interfaces/odbc.md)
- [C++ 客户端库](../interfaces/cpp.md)

ClickHouse 服务器为高级用户提供了嵌入式可视化接口：

- Play UI：在浏览器中打开 `/play`；
- 高级仪表板：在浏览器中打开 `/dashboard`；
- ClickHouse 工程师的二进制符号查看器：在浏览器中打开 `/binary`；

此外，还有各种第三方库可用于与 ClickHouse 进行交互：

- [客户端库](../interfaces/third-party/client-libraries.md)
- [集成](../interfaces/third-party/integrations.md)
- [可视化接口](../interfaces/third-party/gui.md)
