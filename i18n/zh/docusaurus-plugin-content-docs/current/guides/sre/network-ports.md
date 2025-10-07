---
'slug': '/guides/sre/network-ports'
'sidebar_label': '网络端口'
'title': '网络端口'
'description': '可用网络端口及其用途的描述'
'doc_type': 'reference'
---


# 网络端口

:::note
描述为 **默认** 的端口表示该端口号配置在 `/etc/clickhouse-server/config.xml` 中。要自定义您的设置，请在 `/etc/clickhouse-server/config.d/` 中添加一个文件。有关详细信息，请参见 [配置文件](/operations/configuration-files) 文档。
:::

|端口|描述|云|OSS|
|----|-----------|-----|---|
|2181|ZooKeeper 默认服务端口。 **注意：有关 ClickHouse Keeper，请参见 `9181`**||✓|
|8123|HTTP 默认端口||✓|
|8443|HTTP SSL/TLS 默认端口|✓|✓|
|9000|原生协议端口（也称为 ClickHouse TCP 协议）。由 ClickHouse 应用程序和进程（如 `clickhouse-server`，`clickhouse-client` 和原生 ClickHouse 工具）使用。用于分布式查询的服务器间通信。||✓|
|9004|MySQL 模拟端口||✓|
|9005|PostgreSQL 模拟端口（也用于启用 SSL 的 ClickHouse 的安全通信）。||✓|
|9009|低级数据访问的服务器间通信端口。用于数据交换、复制和服务器间通信。||✓|
|9010|服务器间通信的 SSL/TLS||✓|
|9011|原生协议 PROXYv1 协议端口||✓|
|9019|JDBC 桥接||✓|
|9100|gRPC 端口||✓|
|9181|推荐的 ClickHouse Keeper 端口||✓|
|9234|推荐的 ClickHouse Keeper Raft 端口（如果启用 `<secure>1</secure>` 也用于安全通信）||✓|
|9363|Prometheus 默认指标端口||✓|
|9281|推荐的安全 SSL ClickHouse Keeper 端口||✓|
|9440|原生协议 SSL/TLS 端口|✓|✓|
|42000|Graphite 默认端口||✓|
