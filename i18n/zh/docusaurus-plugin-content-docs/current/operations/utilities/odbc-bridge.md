---
description: 'Odbc Bridge 文档'
slug: /operations/utilities/odbc-bridge
title: 'clickhouse-odbc-bridge'
doc_type: 'reference'
---

一个简单的 HTTP 服务器，用作 ODBC 驱动程序的代理。设计该工具的主要原因在于：ODBC 实现中可能出现段错误（segfault）或其他故障，进而导致整个 clickhouse-server 进程崩溃。

该工具通过 HTTP 提供服务，而不是使用管道、共享内存或 TCP，因为：
- 更容易实现
- 更容易调试
- jdbc-bridge 可以采用相同方式实现



## 用法 {#usage}

`clickhouse-server` 在 ODBC 表函数和 StorageODBC 内部使用此工具。
但它也可以作为独立工具从命令行使用,通过在 POST 请求 URL 中指定以下参数:

- `connection_string` -- ODBC 连接字符串。
- `sample_block` -- ClickHouse NamesAndTypesList 格式的列描述,名称使用反引号,
  类型为字符串。名称和类型之间用空格分隔,行之间用换行符分隔。
- `max_block_size` -- 可选参数,设置单个块的最大大小。

查询在 POST 请求体中发送。响应以 RowBinary 格式返回。


## 示例 {#example}

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
