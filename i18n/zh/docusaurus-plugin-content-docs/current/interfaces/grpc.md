---
description: 'ClickHouse 中 gRPC 接口的文档'
sidebar_label: 'gRPC 接口'
sidebar_position: 25
slug: /interfaces/grpc
title: 'gRPC 接口'
doc_type: 'reference'
---



# gRPC 接口



## 简介 {#grpc-interface-introduction}

ClickHouse 支持 [gRPC](https://grpc.io/) 接口。gRPC 是一个开源远程过程调用系统,使用 HTTP/2 和 [Protocol Buffers](https://en.wikipedia.org/wiki/Protocol_Buffers)。ClickHouse 的 gRPC 实现支持:

- SSL;
- 身份验证;
- 会话;
- 压缩;
- 通过同一通道执行并行查询;
- 取消查询;
- 获取进度和日志;
- 外部表。

接口规范详见 [clickhouse_grpc.proto](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto)。


## gRPC 配置 {#grpc-interface-configuration}

要使用 gRPC 接口,需在主[服务器配置](../operations/configuration-files.md)中设置 `grpc_port`。其他配置选项见以下示例:

```xml
<grpc_port>9100</grpc_port>
    <grpc>
        <enable_ssl>false</enable_ssl>

        <!-- 以下两个文件仅在启用 SSL 时使用 -->
        <ssl_cert_file>/path/to/ssl_cert_file</ssl_cert_file>
        <ssl_key_file>/path/to/ssl_key_file</ssl_key_file>

        <!-- 服务器是否要求客户端提供证书 -->
        <ssl_require_client_auth>false</ssl_require_client_auth>

        <!-- 以下文件仅在 ssl_require_client_auth=true 时使用 -->
        <ssl_ca_cert_file>/path/to/ssl_ca_cert_file</ssl_ca_cert_file>

        <!-- 默认压缩算法(当客户端未指定其他算法时应用,参见 QueryInfo 中的 result_compression)。
             支持的算法:none、deflate、gzip、stream_gzip -->
        <compression>deflate</compression>

        <!-- 默认压缩级别(当客户端未指定其他级别时应用,参见 QueryInfo 中的 result_compression)。
             支持的级别:none、low、medium、high -->
        <compression_level>medium</compression_level>

        <!-- 发送/接收消息大小限制,单位为字节。-1 表示无限制 -->
        <max_send_message_size>-1</max_send_message_size>
        <max_receive_message_size>-1</max_receive_message_size>

        <!-- 如需获取详细日志,请启用此选项 -->
        <verbose_logs>false</verbose_logs>
    </grpc>
```


## 内置客户端 {#grpc-client}

您可以使用提供的[规范](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto)以任何 gRPC 支持的编程语言编写客户端。
或者您可以使用内置的 Python 客户端。它位于代码仓库的 [utils/grpc-client/clickhouse-grpc-client.py](https://github.com/ClickHouse/ClickHouse/blob/master/utils/grpc-client/clickhouse-grpc-client.py) 中。内置客户端需要 [grpcio 和 grpcio-tools](https://grpc.io/docs/languages/python/quickstart) Python 模块。

客户端支持以下参数:

- `--help` – 显示帮助信息并退出。
- `--host HOST, -h HOST` – 服务器名称。默认值:`localhost`。您也可以使用 IPv4 或 IPv6 地址。
- `--port PORT` – 要连接的端口。此端口应在 ClickHouse 服务器配置中启用(参见 `grpc_port`)。默认值:`9100`。
- `--user USER_NAME, -u USER_NAME` – 用户名。默认值:`default`。
- `--password PASSWORD` – 密码。默认值:空字符串。
- `--query QUERY, -q QUERY` – 在非交互模式下要处理的查询。
- `--database DATABASE, -d DATABASE` – 默认数据库。如果未指定,则使用服务器设置中的当前数据库(默认为 `default`)。
- `--format OUTPUT_FORMAT, -f OUTPUT_FORMAT` – 结果输出[格式](formats.md)。交互模式的默认值:`PrettyCompact`。
- `--debug` – 启用显示调试信息。

要在交互模式下运行客户端,请在调用时不带 `--query` 参数。

在批处理模式下,查询数据可以通过 `stdin` 传递。

**客户端使用示例**

在以下示例中,创建了一个表并从 CSV 文件加载数据。然后查询表的内容。

```bash
./clickhouse-grpc-client.py -q "CREATE TABLE grpc_example_table (id UInt32, text String) ENGINE = MergeTree() ORDER BY id;"
echo -e "0,Input data for\n1,gRPC protocol example" > a.csv
cat a.csv | ./clickhouse-grpc-client.py -q "INSERT INTO grpc_example_table FORMAT CSV"

./clickhouse-grpc-client.py --format PrettyCompact -q "SELECT * FROM grpc_example_table;"
```

结果:

```text
┌─id─┬─text──────────────────┐
│  0 │ Input data for        │
│  1 │ gRPC protocol example │
└────┴───────────────────────┘
```
