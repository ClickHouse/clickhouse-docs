---
description: '用于从远程 HTTP/HTTPS 服务器读取或向其写入数据。该引擎类似于 File 引擎。'
sidebar_label: 'URL'
sidebar_position: 80
slug: /engines/table-engines/special/url
title: 'URL 表引擎'
doc_type: 'reference'
---



# URL 表引擎

对远程 HTTP/HTTPS 服务器进行数据查询与写入。该引擎类似于 [File](../../../engines/table-engines/special/file.md) 引擎。

语法：`URL(URL [,Format] [,CompressionMethod])`

- `URL` 参数必须符合统一资源定位符（URL）的结构。指定的 URL 必须指向一个使用 HTTP 或 HTTPS 的服务器。获取服务器响应不需要任何额外的请求头。

- `Format` 必须是 ClickHouse 在 `SELECT` 查询以及（如有需要）`INSERT` 中可以使用的格式。完整的支持格式列表参见 [Formats](/interfaces/formats#formats-overview)。

    如果没有指定该参数，ClickHouse 会根据 `URL` 参数的后缀自动检测格式。如果 `URL` 参数的后缀不匹配任何受支持的格式，则建表失败。例如，对于引擎表达式 `URL('http://localhost/test.json')`，将使用 `JSON` 格式。

- `CompressionMethod` 表示是否需要压缩 HTTP 消息体。如果启用压缩，由 URL 引擎发送的 HTTP 包会包含 `Content-Encoding` 头，用于指明所使用的压缩方法。

若要启用压缩，请首先确认由 `URL` 参数指定的远程 HTTP 端点支持相应的压缩算法。

支持的 `CompressionMethod` 必须是以下之一：
- gzip 或 gz
- deflate
- brotli 或 br
- lzma 或 xz
- zstd 或 zst
- lz4
- bz2
- snappy
- none
- auto

如果未指定 `CompressionMethod`，则默认为 `auto`。这意味着 ClickHouse 会根据 `URL` 参数的后缀自动检测压缩方法。如果后缀匹配上面列出的任一压缩方法，则会应用相应的压缩；否则将不会启用压缩。

例如，对于引擎表达式 `URL('http://localhost/test.gzip')`，将应用 `gzip` 压缩方法；而对于 `URL('http://localhost/test.fr')`，不会启用任何压缩，因为后缀 `fr` 不匹配上面列出的任何压缩方法。



## 用法 {#using-the-engine-in-the-clickhouse-server}

`INSERT` 和 `SELECT` 查询会分别转换为 `POST` 和 `GET` 请求。为了处理 `POST` 请求,远程服务器必须支持[分块传输编码](https://en.wikipedia.org/wiki/Chunked_transfer_encoding)。

可以使用 [max_http_get_redirects](/operations/settings/settings#max_http_get_redirects) 设置来限制 HTTP GET 重定向跳转的最大次数。


## 示例 {#example}

**1.** 在服务器上创建 `url_engine_table` 表：

```sql
CREATE TABLE url_engine_table (word String, value UInt64)
ENGINE=URL('http://127.0.0.1:12345/', CSV)
```

**2.** 使用标准 Python 3 工具创建一个基本的 HTTP 服务器并启动：

```python3
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

```bash
$ python3 server.py
```

**3.** 查询数据：

```sql
SELECT * FROM url_engine_table
```

```text
┌─word──┬─value─┐
│ Hello │     1 │
│ World │     2 │
└───────┴───────┘
```


## 实现细节 {#details-of-implementation}

- 读取和写入可以并行
- 不支持以下功能:
  - `ALTER` 和 `SELECT...SAMPLE` 操作。
  - 索引。
  - 复制。


## 虚拟列 {#virtual-columns}

- `_path` — `URL` 的路径。类型:`LowCardinality(String)`。
- `_file` — `URL` 的资源名称。类型:`LowCardinality(String)`。
- `_size` — 资源大小(字节)。类型:`Nullable(UInt64)`。如果大小未知,值为 `NULL`。
- `_time` — 文件最后修改时间。类型:`Nullable(DateTime)`。如果时间未知,值为 `NULL`。
- `_headers` — HTTP 响应头。类型:`Map(LowCardinality(String), LowCardinality(String))`。


## 存储设置 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 允许在读取时跳过空文件。默认为禁用。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - 允许启用/禁用 URI 路径的编码/解码。默认为启用。
