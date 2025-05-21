---
'description': 'FORMAT子句的文档'
'sidebar_label': '格式'
'slug': '/sql-reference/statements/select/format'
'title': 'FORMAT Clause'
---




# FORMAT Clause

ClickHouse 支持多种 [序列化格式](../../../interfaces/formats.md)，可以用于查询结果等多个方面。有多种方式可以选择 `SELECT` 输出格式，其中之一是在查询末尾指定 `FORMAT format` 以获取特定格式的结果数据。

特定格式可以用于方便，与其他系统集成或性能提升。

## Default Format {#default-format}

如果省略 `FORMAT` 子句，则使用默认格式，该格式取决于设置以及用于访问 ClickHouse 服务器的接口。对于 [HTTP 接口](../../../interfaces/http.md) 和以批处理模式的 [命令行客户端](../../../interfaces/cli.md)，默认格式为 `TabSeparated`。对于以交互模式运行的命令行客户端，默认格式为 `PrettyCompact`（它生成紧凑的人类可读表格）。

## Implementation Details {#implementation-details}

当使用命令行客户端时，数据始终以内部高效格式（`Native`）通过网络传输。客户端独立解释查询的 `FORMAT` 子句，并自行格式化数据（从而减轻网络和服务器的额外负担）。
