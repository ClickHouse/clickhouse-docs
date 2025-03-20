---
slug: /interfaces/grpc
sidebar_position: 19
sidebar_label: gRPC接口
---


# gRPC接口

## 介绍 {#grpc-interface-introduction}

ClickHouse支持[gRPC](https://grpc.io/)接口。它是一个开源的远程过程调用系统，使用HTTP/2和[Protocol Buffers](https://en.wikipedia.org/wiki/Protocol_Buffers)。ClickHouse中的gRPC实现支持：

- SSL；
- 身份验证；
- 会话；
- 压缩；
- 通过同一通道并行查询；
- 取消查询；
- 获取进度和日志；
- 外部表。

接口的规范描述在[clickhouse_grpc.proto](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto)。

## gRPC配置 {#grpc-interface-configuration}

要使用gRPC接口，请在主[服务器配置](../operations/configuration-files.md)中设置`grpc_port`。其他配置选项请参见以下示例：

```xml
<grpc_port>9100</grpc_port>
    <grpc>
        <enable_ssl>false</enable_ssl>

        <!-- 只有在启用SSL时，以下两个文件才会被使用 -->
        <ssl_cert_file>/path/to/ssl_cert_file</ssl_cert_file>
        <ssl_key_file>/path/to/ssl_key_file</ssl_key_file>

        <!-- 服务器是否请求客户端提供证书 -->
        <ssl_require_client_auth>false</ssl_require_client_auth>

        <!-- 只有在ssl_require_client_auth=true时，以下文件才会被使用 -->
        <ssl_ca_cert_file>/path/to/ssl_ca_cert_file</ssl_ca_cert_file>

        <!-- 默认压缩算法（如果客户端没有指定其他算法，则应用，见QueryInfo中的result_compression）。
             支持的算法：none, deflate, gzip, stream_gzip -->
        <compression>deflate</compression>

        <!-- 默认压缩级别（如果客户端没有指定其他级别，则应用，见QueryInfo中的result_compression）。
             支持的级别：none, low, medium, high -->
        <compression_level>medium</compression_level>

        <!-- 发送/接收消息的大小限制（以字节为单位）。-1表示无限制 -->
        <max_send_message_size>-1</max_send_message_size>
        <max_receive_message_size>-1</max_receive_message_size>

        <!-- 如果您想要获取详细日志，请启用 -->
        <verbose_logs>false</verbose_logs>
    </grpc>
```

## 内置客户端 {#grpc-client}

您可以使用提供的[规范](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto)在任何支持gRPC的编程语言中编写客户端。或者，您可以使用内置的Python客户端。它位于存储库中的[utils/grpc-client/clickhouse-grpc-client.py](https://github.com/ClickHouse/ClickHouse/blob/master/utils/grpc-client/clickhouse-grpc-client.py)。内置客户端需要[grpcio和grpcio-tools](https://grpc.io/docs/languages/python/quickstart) Python模块。

客户端支持以下参数：

- `--help` – 显示帮助信息并退出。
- `--host HOST, -h HOST` – 服务器名称。默认值为：`localhost`。您还可以使用IPv4或IPv6地址。
- `--port PORT` – 要连接的端口。该端口应在ClickHouse服务器配置中启用（见`grpc_port`）。默认值：`9100`。
- `--user USER_NAME, -u USER_NAME` – 用户名。默认值：`default`。
- `--password PASSWORD` – 密码。默认值：空字符串。
- `--query QUERY, -q QUERY` – 在使用非交互模式时处理的查询。
- `--database DATABASE, -d DATABASE` – 默认数据库。如果未指定，则使用服务器设置中的当前数据库（默认为`default`）。
- `--format OUTPUT_FORMAT, -f OUTPUT_FORMAT` – 结果输出[格式](formats.md)。交互模式的默认值：`PrettyCompact`。
- `--debug` – 启用调试信息显示。

要在交互模式下运行客户端，请在不带`--query`参数的情况下调用它。

在批处理模式中，可以通过`stdin`传递查询数据。

**客户端使用示例**

在以下示例中，创建一个表并从CSV文件加载数据。然后对表的内容进行查询。

``` bash
./clickhouse-grpc-client.py -q "CREATE TABLE grpc_example_table (id UInt32, text String) ENGINE = MergeTree() ORDER BY id;"
echo -e "0,Input data for\n1,gRPC protocol example" > a.csv
cat a.csv | ./clickhouse-grpc-client.py -q "INSERT INTO grpc_example_table FORMAT CSV"

./clickhouse-grpc-client.py --format PrettyCompact -q "SELECT * FROM grpc_example_table;"
```

结果：

``` text
┌─id─┬─text──────────────────┐
│  0 │ Input data for        │
│  1 │ gRPC protocol example │
└────┴───────────────────────┘
```
