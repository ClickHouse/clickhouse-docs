---
'description': 'FORMAT 子句的文档'
'sidebar_label': 'FORMAT'
'slug': '/sql-reference/statements/select/format'
'title': 'FORMAT 子句'
---


# FORMAT 子句

ClickHouse 支持多种 [序列化格式](../../../interfaces/formats.md)，可用于查询结果等多个方面。有多种方法可以选择 `SELECT` 输出格式，其中之一是在查询末尾指定 `FORMAT format` 以获取任何特定格式的结果数据。

特定格式可以用于便利性、与其他系统的集成或性能提升。

## 默认格式 {#default-format}

如果省略 `FORMAT` 子句，则使用默认格式，具体取决于设置和用于访问 ClickHouse 服务器的接口。对于 [HTTP 接口](../../../interfaces/http.md) 和批处理模式中的 [命令行客户端](../../../interfaces/cli.md)，默认格式为 `TabSeparated`。对于交互模式中的命令行客户端，默认格式为 `PrettyCompact`（它生成紧凑的易读表格）。

## 实现细节 {#implementation-details}

在使用命令行客户端时，数据始终以内部高效格式 (`Native`) 通过网络传输。客户端独立解释查询的 `FORMAT` 子句，并自行格式化数据（从而减轻网络和服务器的额外负担）。
