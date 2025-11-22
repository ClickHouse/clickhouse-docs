---
description: 'FORMAT 子句相关文档'
sidebar_label: 'FORMAT'
slug: /sql-reference/statements/select/format
title: 'FORMAT 子句'
doc_type: 'reference'
---



# FORMAT 子句

ClickHouse 支持多种[序列化格式](../../../interfaces/formats.md)，可用于查询结果等多种用途。为 `SELECT` 的输出选择格式有多种方式，其中之一是在查询末尾指定 `FORMAT format`，以任意指定格式获取结果数据。

可以根据需要选择特定格式，例如为了使用方便、与其他系统集成或提升性能。



## 默认格式 {#default-format}

如果省略 `FORMAT` 子句,将使用默认格式,具体取决于访问 ClickHouse 服务器时使用的设置和接口。对于 [HTTP 接口](../../../interfaces/http.md) 和批处理模式下的[命令行客户端](../../../interfaces/cli.md),默认格式为 `TabSeparated`。对于交互模式下的命令行客户端,默认格式为 `PrettyCompact`(生成紧凑的易读表格)。


## 实现细节 {#implementation-details}

使用命令行客户端时,数据始终以内部高效格式(`Native`)在网络上传输。客户端会独立解析查询中的 `FORMAT` 子句并自行格式化数据(从而减轻网络和服务器的额外负担)。
