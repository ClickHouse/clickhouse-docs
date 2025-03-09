---
slug: /operations/utilities/odbc-bridge
title: 'clickhouse-odbc-bridge'
---

简单的 HTTP 服务器，作为 ODBC 驱动的代理。主要动机是避免 ODBC 实现中的可能段错误或其他故障，这可能导致整个 clickhouse-server 进程崩溃。

该工具通过 HTTP 工作，而不是通过管道、共享内存或 TCP，因为：
- 实现更简单
- 调试更简单
- jdbc-bridge 可以以相同的方式实现

## 使用方法 {#usage}

`clickhouse-server` 在 odbc 表函数和 StorageODBC 内部使用此工具。 
但是它也可以作为独立工具从命令行使用，使用以下参数在 POST 请求 URL 中：
- `connection_string` -- ODBC 连接字符串。
- `sample_block` -- 使用 ClickHouse NamesAndTypesList 格式的列描述，名称用反引号包围，
  类型作为字符串。名称和类型用空格分隔，行用换行符分隔。
- `max_block_size` -- 可选参数，设置单个块的最大大小。
查询在 POST 主体中发送。响应以 RowBinary 格式返回。

## 示例: {#example}

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
