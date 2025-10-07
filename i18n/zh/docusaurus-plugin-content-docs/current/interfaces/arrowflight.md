---
'description': 'ClickHouse 中 Apache Arrow Flight 接口的文档，允许 Flight SQL 客户端连接到 ClickHouse'
'sidebar_label': 'Arrow Flight 接口'
'sidebar_position': 26
'slug': '/interfaces/arrowflight'
'title': 'Arrow Flight 接口'
'doc_type': 'reference'
---


# Apache Arrow Flight 接口

ClickHouse 支持与 [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) 协议的集成——这是一种高性能的 RPC 框架，旨在通过 gRPC 使用 Arrow IPC 格式高效传输列式数据。

该接口允许 Flight SQL 客户端查询 ClickHouse 并以 Arrow 格式检索结果，为分析工作负载提供高吞吐量和低延迟。

## 功能 {#features}

* 通过 Arrow Flight SQL 协议执行 SQL 查询
* 以 Apache Arrow 格式流式传输查询结果
* 与支持 Arrow Flight 的 BI 工具和自定义数据应用集成
* 通过 gRPC 进行轻量级且高性能的通信

## 限制 {#limitations}

Arrow Flight 接口目前处于实验阶段，并处于积极开发中。已知限制包括：

* 对复杂的 ClickHouse 特有 SQL 特性的支持有限
* 并非所有 Arrow Flight SQL 元数据操作都已实现
* 参考实现中没有内置的身份验证或 TLS 配置

如果您遇到兼容性问题或想要贡献，请在 ClickHouse 上 [创建一个问题](https://github.com/ClickHouse/ClickHouse/issues)。

## 运行 Arrow Flight 服务器 {#running-server}

要在自管理的 ClickHouse 实例中启用 Arrow Flight 服务器，请向您的服务器配置添加以下配置：

```xml
<clickhouse>
    <arrowflight_port>9005</arrowflight_port>
</clickhouse>
```

重启 ClickHouse 服务器。成功启动后，您应该会看到类似的日志消息：

```bash
{} <Information> Application: Arrow Flight compatibility protocol: 0.0.0.0:9005
```

## 通过 Arrow Flight SQL 连接到 ClickHouse {#connecting-to-clickhouse}

您可以使用任何支持 Arrow Flight SQL 的客户端。例如，使用 `pyarrow`：

```python
import pyarrow.flight

client = pyarrow.flight.FlightClient("grpc://localhost:9005")
ticket = pyarrow.flight.Ticket(b"SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket)

for batch in reader:
    print(batch.to_pandas())
```

## 兼容性 {#compatibility}

Arrow Flight 接口与支持 Arrow Flight SQL 的工具兼容，包括使用以下技术构建的自定义应用：

* Python (`pyarrow`)
* Java (`arrow-flight`)
* C++ 和其他兼容 gRPC 的语言

如果您的工具（例如 JDBC、ODBC）有原生的 ClickHouse 连接器，请优先使用它，除非出于性能或格式兼容性需要特别要求 Arrow Flight。

## 查询取消 {#query-cancellation}

通过关闭客户端的 gRPC 连接，可以取消长时间运行的查询。计划支持更高级的取消功能。

---

有关更多详细信息，请参见：

* [Apache Arrow Flight SQL 规范](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouse GitHub 问题 #7554](https://github.com/ClickHouse/ClickHouse/issues/7554)
