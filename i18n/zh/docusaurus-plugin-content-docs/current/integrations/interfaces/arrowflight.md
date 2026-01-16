---
description: 'ClickHouse 中 Apache Arrow Flight 接口的文档，允许 Flight SQL 客户端连接到 ClickHouse'
sidebar_label: 'Arrow Flight 接口'
sidebar_position: 26
slug: /interfaces/arrowflight
title: 'Arrow Flight 接口'
doc_type: 'reference'
---

# Apache Arrow Flight 接口 \{#apache-arrow-flight-interface\}

ClickHouse 支持与 [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) 协议集成——它是一个高性能的 RPC 框架，旨在通过 gRPC 使用 Arrow IPC 格式高效传输列式数据。

该接口允许 Flight SQL 客户端向 ClickHouse 发起查询，并以 Arrow 格式获取结果，为分析型工作负载提供高吞吐量和低延迟。

## 功能 \\{#features\\}

* 通过 Arrow Flight SQL 协议执行 SQL 查询
* 以 Apache Arrow 格式流式传输查询结果
* 与支持 Arrow Flight 的 BI 工具和自定义数据应用集成
* 基于 gRPC 的轻量级高性能通信

## 限制 \\{#limitations\\}

Arrow Flight 接口目前仍处于实验阶段，正在积极开发中。已知限制包括：

* 对 ClickHouse 特有的复杂 SQL 功能支持有限
* 尚未实现所有 Arrow Flight SQL 元数据操作
* 参考实现中未内置身份验证或 TLS 配置

如果遇到兼容性问题或希望参与贡献，请在 ClickHouse 仓库中[创建一个 issue](https://github.com/ClickHouse/ClickHouse/issues)。

## 运行 Arrow Flight 服务器 \{#running-server\}

要在自管理 ClickHouse 实例中启用 Arrow Flight 服务器，请在服务器配置文件中添加以下配置：

```xml
<clickhouse>
    <arrowflight_port>9005</arrowflight_port>
</clickhouse>
```

重启 ClickHouse 服务器。成功启动后，您应该会看到类似如下的日志消息：

```bash
{} <Information> Application: Arrow Flight compatibility protocol: 0.0.0.0:9005
```


## 通过 Arrow Flight SQL 连接 ClickHouse \{#connecting-to-clickhouse\}

可以使用任意支持 Arrow Flight SQL 的客户端。例如，使用 `pyarrow`：

```python
import pyarrow.flight

client = pyarrow.flight.FlightClient("grpc://localhost:9005")
ticket = pyarrow.flight.Ticket(b"SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket)

for batch in reader:
    print(batch.to_pandas())
```


## 兼容性 \\{#compatibility\\}

Arrow Flight 接口与支持 Arrow Flight SQL 的工具兼容，包括使用以下技术构建的自定义应用程序：

* Python (`pyarrow`)
* Java (`arrow-flight`)
* C++ 及其他兼容 gRPC 的语言

如果你所使用的工具提供原生 ClickHouse 连接器（例如 JDBC、ODBC），除非在性能或格式兼容性方面有明确的 Arrow Flight 需求，否则应优先选择使用该连接器。

## 查询取消 \\{#query-cancellation\\}

可以通过在客户端关闭 gRPC 连接来取消长时间运行的查询。更高级的取消功能计划在后续版本中提供。

---

有关更多详细信息，请参阅：

* [Apache Arrow Flight SQL 规范](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouse GitHub Issue #7554](https://github.com/ClickHouse/ClickHouse/issues/7554)