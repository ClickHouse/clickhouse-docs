---
'description': 'ClickHouse 中 gRPC 接口的文档'
'sidebar_label': 'gRPC 接口'
'sidebar_position': 25
'slug': '/interfaces/grpc'
'title': 'gRPC 接口'
---


# gRPC 接口

## 介绍 {#grpc-interface-introduction}

ClickHouse 支持 [gRPC](https://grpc.io/) 接口。它是一个开源的远程过程调用系统，使用 HTTP/2 和 [Protocol Buffers](https://en.wikipedia.org/wiki/Protocol_Buffers)。ClickHouse 中 gRPC 的实现支持：

- SSL；
- 认证；
- 会话；
- 压缩；
- 通过同一通道的并行查询；
- 查询的取消；
- 获取进度和日志；
- 外部表。

接口的规范描述在 [clickhouse_grpc.proto](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto) 中。

## gRPC 配置 {#grpc-interface-configuration}

要使用 gRPC 接口，请在主 [服务器配置](../operations/configuration-files.md)中设置 `grpc_port`。其他配置选项请参见以下示例：

```xml
<grpc_port>9100</grpc_port>
    <grpc>
        <enable_ssl>false</enable_ssl>

        <!-- The following two files are used only if SSL is enabled -->
        <ssl_cert_file>/path/to/ssl_cert_file</ssl_cert_file>
        <ssl_key_file>/path/to/ssl_key_file</ssl_key_file>

        <!-- Whether server requests client for a certificate -->
        <ssl_require_client_auth>false</ssl_require_client_auth>

        <!-- The following file is used only if ssl_require_client_auth=true -->
        <ssl_ca_cert_file>/path/to/ssl_ca_cert_file</ssl_ca_cert_file>

        <!-- Default compression algorithm (applied if client doesn't specify another algorithm, see result_compression in QueryInfo).
             Supported algorithms: none, deflate, gzip, stream_gzip -->
        <compression>deflate</compression>

        <!-- Default compression level (applied if client doesn't specify another level, see result_compression in QueryInfo).
             Supported levels: none, low, medium, high -->
        <compression_level>medium</compression_level>

        <!-- Send/receive message size limits in bytes. -1 means unlimited -->
        <max_send_message_size>-1</max_send_message_size>
        <max_receive_message_size>-1</max_receive_message_size>

        <!-- Enable if you want to get detailed logs -->
        <verbose_logs>false</verbose_logs>
    </grpc>
```

## 内置客户端 {#grpc-client}

您可以使用提供的 [规范](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto) 在 gRPC 支持的任何编程语言中编写客户端。
或者您可以使用内置的 Python 客户端。它位于存储库中的 [utils/grpc-client/clickhouse-grpc-client.py](https://github.com/ClickHouse/ClickHouse/blob/master/utils/grpc-client/clickhouse-grpc-client.py)。内置客户端需要 [grpcio 和 grpcio-tools](https://grpc.io/docs/languages/python/quickstart) Python 模块。

客户端支持以下参数：

- `--help` – 显示帮助信息并退出。
- `--host HOST, -h HOST` – 服务器名称。默认值： `localhost`。还可以使用 IPv4 或 IPv6 地址。
- `--port PORT` – 要连接的端口。该端口应在 ClickHouse 服务器配置中启用（请参见 `grpc_port`）。默认值： `9100`。
- `--user USER_NAME, -u USER_NAME` – 用户名。默认值： `default`。
- `--password PASSWORD` – 密码。默认值：空字符串。
- `--query QUERY, -q QUERY` – 在使用非交互模式时处理的查询。
- `--database DATABASE, -d DATABASE` – 默认数据库。如果未指定，则使用服务器设置中当前数据库（默认是 `default`）。
- `--format OUTPUT_FORMAT, -f OUTPUT_FORMAT` – 结果输出 [格式](formats.md)。交互模式的默认值： `PrettyCompact`。
- `--debug` – 启用显示调试信息。

要以交互模式运行客户端，请在不带 `--query` 参数的情况下调用它。

在批处理模式下，可以通过 `stdin` 传递查询数据。

**客户端使用示例**

在以下示例中，创建一个表并从 CSV 文件加载数据。然后查询表的内容。

```bash
./clickhouse-grpc-client.py -q "CREATE TABLE grpc_example_table (id UInt32, text String) ENGINE = MergeTree() ORDER BY id;"
echo -e "0,Input data for\n1,gRPC protocol example" > a.csv
cat a.csv | ./clickhouse-grpc-client.py -q "INSERT INTO grpc_example_table FORMAT CSV"

./clickhouse-grpc-client.py --format PrettyCompact -q "SELECT * FROM grpc_example_table;"
```

结果：

```text
┌─id─┬─text──────────────────┐
│  0 │ Input data for        │
│  1 │ gRPC protocol example │
└────┴───────────────────────┘
```
