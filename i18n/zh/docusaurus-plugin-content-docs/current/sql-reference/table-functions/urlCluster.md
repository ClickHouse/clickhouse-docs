---
description: '允许在指定集群的多个节点上并行处理通过 URL 获取的文件。'
sidebar_label: 'urlCluster'
sidebar_position: 201
slug: /sql-reference/table-functions/urlCluster
title: 'urlCluster'
doc_type: 'reference'
---



# urlCluster 表函数 {#urlcluster-table-function}

允许在指定集群的多个节点上并行处理通过 URL 访问的文件。在发起端，它会与集群中所有节点建立连接，展开 URL 文件路径中的星号，并动态分发每个文件。在工作节点上，它会向发起端请求下一个要处理的任务并进行处理。该过程会重复进行，直到所有任务完成。



## 语法 {#syntax}

```sql
urlCluster(cluster_name, URL, format, structure)
```


## 参数 {#arguments}

| 参数           | 描述                                                                                                                                                     |
|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name` | 用于构建远程和本地服务器地址及连接参数集合的集群名称。                                                                                                    |
| `URL`          | 可以接受 `GET` 请求的 HTTP 或 HTTPS 服务器地址。类型：[String](../../sql-reference/data-types/string.md)。                                               |
| `format`       | 数据的[格式](/sql-reference/formats)。类型：[String](../../sql-reference/data-types/string.md)。                                                         |
| `structure`    | 以 `'UserID UInt64, Name String'` 形式表示的表结构。用于确定列名和数据类型。类型：[String](../../sql-reference/data-types/string.md)。                     |



## 返回值 {#returned_value}

一个具有指定格式和结构，并包含来自指定 `URL` 中数据的表。



## 示例 {#examples}

从 HTTP 服务器获取一个表的前 3 行，该表包含 `String` 和 [UInt32](../../sql-reference/data-types/int-uint.md) 类型的列，服务器以 [CSV](/interfaces/formats/CSV) 格式返回结果。

1. 使用 Python 3 标准库创建一个简单的 HTTP 服务器并启动它：

```python
from http.server import BaseHTTPRequestHandler, HTTPServer

class CSVHTTPServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/csv')
        self.end_headers()

        self.wfile.write(bytes('你好,1\n世界,2\n', "utf-8"))

if __name__ == "__main__":
    server_address = ('127.0.0.1', 12345)
    HTTPServer(server_address, CSVHTTPServer).serve_forever()
```

```sql
SELECT * FROM urlCluster('cluster_simple','http://127.0.0.1:12345', CSV, 'column1 String, column2 UInt32')
```


## URL 中的通配符 {#globs-in-url}

花括号 `{ }` 中的模式可用于生成一组分片，或用于指定故障转移地址。支持的模式类型及示例，参见 [remote](remote.md#globs-in-addresses) 函数的描述。
模式内的字符 `|` 用于指定故障转移地址。它们会按照在模式中出现的顺序进行迭代。生成的地址数量受 [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 设置的限制。



## 相关内容 {#related}

-   [HDFS 引擎](/engines/table-engines/integrations/hdfs)
-   [URL 表函数](/engines/table-engines/special/url)
