---
description: 'Odbc Bridge 文档'
slug: /operations/utilities/odbc-bridge
title: 'clickhouse-odbc-bridge'
doc_type: 'reference'
---

一个简单的 HTTP 服务器，用作 ODBC 驱动程序的代理。设计它的主要动机是，ODBC 实现中可能出现的段错误（segfault）或其他错误，可能会导致整个 clickhouse-server 进程崩溃。

该工具通过 HTTP 工作，而不是通过管道、共享内存或 TCP 进行通信，原因是：
- 实现更简单
- 调试更简单
- jdbc-bridge 可以以同样的方式实现

## 用法 {#usage}

`clickhouse-server` 在 ODBC 表函数和 StorageODBC 引擎中使用此工具。
不过它也可以作为独立工具从命令行使用，在 POST 请求的 URL 中指定以下参数：
- `connection_string` -- ODBC 连接字符串。
- `sample_block` -- ClickHouse NamesAndTypesList 格式的列描述，名称使用反引号包裹，
  类型为字符串。名称和类型以空格分隔，各行以换行分隔。
- `max_block_size` -- 可选参数，用于设置单个数据块的最大大小。

查询在 POST 请求的请求体中发送，响应以 RowBinary 格式返回。

## 示例： {#example}

```bash
$ clickhouse-odbc-bridge --http-port 9018 --daemon

$ curl -d "query=SELECT PageID, ImpID, AdType FROM Keys ORDER BY PageID, ImpID" --data-urlencode "connection_string=DSN=ClickHouse;DATABASE=stat" --data-urlencode "sample_block=columns format version: 1
3 columns:
\`PageID\` String
\`ImpID\` String
\`AdType\` String
"  "http://localhost:9018/" > result.txt

$ cat result.txt
12246623837185725195925621517
```
