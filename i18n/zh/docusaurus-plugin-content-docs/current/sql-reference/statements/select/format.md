---
slug: /sql-reference/statements/select/format
sidebar_label: '格式'
---


# 格式子句

ClickHouse 支持多种 [序列化格式](../../../interfaces/formats.md)，这些格式可以用于查询结果等多个场景。有多种方式可以选择 `SELECT` 输出的格式，其中一种是在查询末尾指定 `FORMAT format` 以使用特定格式返回结果数据。

使用特定格式可能是出于方便、与其他系统的集成或性能提升的考虑。

## 默认格式 {#default-format}

如果省略 `FORMAT` 子句，将使用默认格式，该格式取决于设置和用于访问 ClickHouse 服务器的接口。对于 [HTTP 接口](../../../interfaces/http.md) 和以批处理模式运行的 [命令行客户端](../../../interfaces/cli.md)，默认格式为 `TabSeparated`。对于交互模式下的命令行客户端，默认格式为 `PrettyCompact`（它生成紧凑的人类可读表格）。

## 实现细节 {#implementation-details}

在使用命令行客户端时，数据总是以内部高效格式 (`Native`) 通过网络传输。客户端独立解读查询的 `FORMAT` 子句并自行格式化数据（从而减轻网络和服务器的额外负担）。
