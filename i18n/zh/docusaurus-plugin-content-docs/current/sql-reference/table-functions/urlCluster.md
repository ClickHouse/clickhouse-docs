---
description: '允许在指定集群的多个节点上并行处理来自 URL 的文件。'
sidebar_label: 'urlCluster'
sidebar_position: 201
slug: /sql-reference/table-functions/urlCluster
title: 'urlCluster'
doc_type: 'reference'
---



# urlCluster 表函数

允许在指定集群的多个节点上并行处理来自 URL 的文件。在发起端，它会与集群中所有节点建立连接，展开 URL 文件路径中的星号通配符，并动态分发每个文件。在工作节点上，它向发起端请求下一个需要处理的任务并执行处理。此过程会重复进行，直到所有任务都完成。



## 语法 {#syntax}

```sql
urlCluster(cluster_name, URL, format, structure)
```


## 参数 {#arguments}

| 参数       | 描述                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cluster_name` | 集群名称,用于构建远程和本地服务器的地址集及连接参数。                                      |
| `URL`          | HTTP 或 HTTPS 服务器地址,可接受 `GET` 请求。类型:[String](../../sql-reference/data-types/string.md)。                               |
| `format`       | 数据[格式](/sql-reference/formats)。类型:[String](../../sql-reference/data-types/string.md)。                                                |
| `structure`    | 表结构,格式为 `'UserID UInt64, Name String'`。用于确定列名和类型。类型:[String](../../sql-reference/data-types/string.md)。 |


## 返回值 {#returned_value}

返回一个具有指定格式和结构的表,其数据来自定义的 `URL`。


## Examples {#examples}

从以 [CSV](/interfaces/formats/CSV) 格式返回数据的 HTTP 服务器获取包含 `String` 和 [UInt32](../../sql-reference/data-types/int-uint.md) 类型列的表的前 3 行。

1. 使用 Python 3 标准库创建并启动一个基本的 HTTP 服务器:

```python
from http.server import BaseHTTPRequestHandler, HTTPServer

class CSVHTTPServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/csv')
        self.end_headers()

        self.wfile.write(bytes('Hello,1\nWorld,2\n', "utf-8"))

if __name__ == "__main__":
    server_address = ('127.0.0.1', 12345)
    HTTPServer(server_address, CSVHTTPServer).serve_forever()
```

```sql
SELECT * FROM urlCluster('cluster_simple','http://127.0.0.1:12345', CSV, 'column1 String, column2 UInt32')
```


## URL 中的通配符 {#globs-in-url}

花括号 `{ }` 中的模式用于生成一组分片或指定故障转移地址。有关支持的模式类型和示例,请参阅 [remote](remote.md#globs-in-addresses) 函数的说明。
模式中的字符 `|` 用于指定故障转移地址。这些地址将按照模式中列出的顺序进行迭代。生成的地址数量受 [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 设置限制。


## 相关内容 {#related}

- [HDFS 引擎](/engines/table-engines/integrations/hdfs)
- [URL 表函数](/engines/table-engines/special/url)
