---
description: 'ClickHouse 中 Apache Arrow Flight 接口的相关文档，允许 Flight SQL 客户端连接到 ClickHouse'
sidebar_label: 'Arrow Flight 接口'
sidebar_position: 26
slug: /interfaces/arrowflight
title: 'Arrow Flight 接口'
doc_type: 'reference'
---



# Apache Arrow Flight 接口

ClickHouse 支持与 [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) 协议集成——这是一种高性能 RPC 框架，旨在通过 gRPC 使用 Arrow IPC 格式高效传输列式数据。

该接口允许 Flight SQL 客户端查询 ClickHouse 并以 Arrow 格式获取结果，为分析型工作负载提供高吞吐量和低延迟。



## 功能特性 {#features}

- 通过 Arrow Flight SQL 协议执行 SQL 查询
- 以 Apache Arrow 格式流式传输查询结果
- 与支持 Arrow Flight 的 BI 工具和自定义数据应用集成
- 通过 gRPC 实现轻量级高性能通信


## 限制 {#limitations}

Arrow Flight 接口目前处于实验阶段,正在积极开发中。已知限制包括:

- 对 ClickHouse 特有的复杂 SQL 功能支持有限
- 尚未实现所有 Arrow Flight SQL 元数据操作
- 参考实现中未内置身份验证或 TLS 配置

如果您遇到兼容性问题或希望贡献代码,请在 ClickHouse 代码仓库中[创建 issue](https://github.com/ClickHouse/ClickHouse/issues)。


## 运行 Arrow Flight 服务器 {#running-server}

要在自托管的 ClickHouse 实例中启用 Arrow Flight 服务器,请在服务器配置文件中添加以下配置:

```xml
<clickhouse>
    <arrowflight_port>9005</arrowflight_port>
</clickhouse>
```

重启 ClickHouse 服务器。成功启动后,您将看到类似以下内容的日志消息:

```bash
{} <Information> Application: Arrow Flight 兼容协议: 0.0.0.0:9005
```


## 通过 Arrow Flight SQL 连接到 ClickHouse {#connecting-to-clickhouse}

您可以使用任何支持 Arrow Flight SQL 的客户端。例如,使用 `pyarrow`:

```python
import pyarrow.flight

client = pyarrow.flight.FlightClient("grpc://localhost:9005")
ticket = pyarrow.flight.Ticket(b"SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket)

for batch in reader:
    print(batch.to_pandas())
```


## 兼容性 {#compatibility}

Arrow Flight 接口与支持 Arrow Flight SQL 的工具兼容,包括使用以下技术构建的自定义应用程序:

- Python (`pyarrow`)
- Java (`arrow-flight`)
- C++ 及其他与 gRPC 兼容的语言

如果您的工具有可用的原生 ClickHouse 连接器(例如 JDBC、ODBC),建议优先使用原生连接器,除非因性能或格式兼容性需求而特别需要使用 Arrow Flight。


## Query Cancellation {#query-cancellation}

长时间运行的查询可以通过关闭客户端的 gRPC 连接来取消。未来计划支持更高级的取消功能。

---

更多详细信息请参阅：

- [Apache Arrow Flight SQL 规范](https://arrow.apache.org/docs/format/FlightSql.html)
- [ClickHouse GitHub Issue #7554](https://github.com/ClickHouse/ClickHouse/issues/7554)
