---
'description': 'FORMAT 子句的文档'
'sidebar_label': 'FORMAT'
'slug': '/sql-reference/statements/select/format'
'title': 'FORMAT 子句'
---


# FORMAT 子句

ClickHouse 支持广泛的 [序列化格式](../../../interfaces/formats.md)，可以用于查询结果等多种场景。选择 `SELECT` 输出格式的方法有多种，其中一种是在查询末尾指定 `FORMAT format` 来以特定格式获取结果数据。

使用特定格式可能是出于方便、与其他系统集成或性能提升的考虑。

## 默认格式 {#default-format}

如果省略 `FORMAT` 子句，则使用默认格式，该格式取决于访问 ClickHouse 服务器所用的设置和接口。对于 [HTTP 接口](../../../interfaces/http.md) 和以批处理模式运行的 [命令行客户端](../../../interfaces/cli.md)，默认格式为 `TabSeparated`。对于以交互模式运行的命令行客户端，默认格式为 `PrettyCompact`（它生成紧凑的人类可读表格）。

## 实现细节 {#implementation-details}

在使用命令行客户端时，数据始终以内部高效格式（`Native`）通过网络传输。客户端独立解析查询的 `FORMAT` 子句，并自行格式化数据（从而减轻了网络和服务器的额外负担）。
