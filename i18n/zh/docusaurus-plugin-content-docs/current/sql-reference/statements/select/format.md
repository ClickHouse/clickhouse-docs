---
description: 'FORMAT 子句文档'
sidebar_label: 'FORMAT'
slug: /sql-reference/statements/select/format
title: 'FORMAT 子句'
doc_type: 'reference'
---



# FORMAT 子句 {#format-clause}

ClickHouse 支持多种[序列化格式](../../../interfaces/formats.md)，可用于查询结果等多种用途。为 `SELECT` 的输出选择格式有多种方式，其中一种是在查询末尾指定 `FORMAT format`，从而以特定格式获取结果数据。

使用特定格式可能是为了方便使用、与其他系统集成或提升性能。



## 默认格式 {#default-format}

如果省略 `FORMAT` 子句，则会使用默认格式。默认格式取决于配置以及用于访问 ClickHouse 服务器的接口。对于批处理模式下的 [HTTP 接口](../../../interfaces/http.md) 和 [命令行客户端](../../../interfaces/cli.md)，默认格式为 `TabSeparated`。对于交互式模式下的命令行客户端，默认格式为 `PrettyCompact`（生成紧凑且易读的表格）。



## 实现细节 {#implementation-details}

在使用命令行客户端时，数据始终以内部的高效格式（`Native`）在网络上传输。客户端会独立解析查询中的 `FORMAT` 子句并自行对数据进行格式化（从而减轻网络和服务器的额外负载）。
