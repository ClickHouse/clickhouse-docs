---
'description': '从/到远程HTTP/HTTPS服务器查询数据。该引擎类似于文件引擎。'
'sidebar_label': 'URL'
'sidebar_position': 80
'slug': '/engines/table-engines/special/url'
'title': 'URL表引擎'
---




# URL 表引擎

从远程 HTTP/HTTPS 服务器查询数据。这个引擎类似于 [File](../../../engines/table-engines/special/file.md) 引擎。

语法: `URL(URL [,Format] [,CompressionMethod])`

- `URL` 参数必须符合统一资源定位符 (Uniform Resource Locator) 的结构。指定的 URL 必须指向使用 HTTP 或 HTTPS 的服务器。这不需要额外的头字段来获取服务器的响应。

- `Format` 必须是 ClickHouse 可以在 `SELECT` 查询中使用的格式，并且在必要时可以在 `INSERT` 中使用。有关支持的格式的完整列表，请参见 [Formats](/interfaces/formats#formats-overview)。

    如果未指定此参数，ClickHouse 将从 `URL` 参数的后缀自动检测格式。如果 `URL` 参数的后缀与任何支持的格式不匹配，则创建表将失败。例如，对于引擎表达式 `URL('http://localhost/test.json')`，将应用 `JSON` 格式。

- `CompressionMethod` 表示 HTTP 请求体是否应被压缩。如果启用了压缩，则 URL 引擎发送的 HTTP 数据包包含 'Content-Encoding' 头以指示使用了哪种压缩方法。

要启用压缩，请首先确保 `URL` 参数指定的远程 HTTP 端点支持相应的压缩算法。

支持的 `CompressionMethod` 应为以下之一：
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

如果未指定 `CompressionMethod`，则默认为 `auto`。这意味着 ClickHouse 会自动从 `URL` 参数的后缀检测压缩方法。如果后缀与上述任何压缩方法匹配，则应用相应的压缩，或者不会启用任何压缩。

例如，对于引擎表达式 `URL('http://localhost/test.gzip')`，将应用 `gzip` 压缩方法，但对于 `URL('http://localhost/test.fr')`，由于后缀 `fr` 与上述任何压缩方法不匹配，因此不会启用压缩。

## 使用方法 {#using-the-engine-in-the-clickhouse-server}

`INSERT` 和 `SELECT` 查询分别转化为 `POST` 和 `GET` 请求。要处理 `POST` 请求，远程服务器必须支持 [Chunked transfer encoding](https://en.wikipedia.org/wiki/Chunked_transfer_encoding)。

您可以使用 [max_http_get_redirects](/operations/settings/settings#max_http_get_redirects) 设置限制 HTTP GET 重定向的最大跳转次数。

## 示例 {#example}

**1.** 在服务器上创建一个 `url_engine_table` 表：

```sql
CREATE TABLE url_engine_table (word String, value UInt64)
ENGINE=URL('http://127.0.0.1:12345/', CSV)
```

**2.** 使用标准的 Python 3 工具创建一个基本的 HTTP 服务器并启动它：

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

**3.** 请求数据：

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

- 读取和写入可以并行进行
- 不支持：
    - `ALTER` 和 `SELECT...SAMPLE` 操作。
    - 索引。
    - 复制。

## 虚拟列 {#virtual-columns}

- `_path` — `URL` 的路径。类型：`LowCardinality(String)`。
- `_file` — `URL` 的资源名称。类型：`LowCardinality(String)`。
- `_size` — 资源的大小，单位为字节。类型：`Nullable(UInt64)`。如果大小未知，则值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为 `NULL`。
- `_headers` - HTTP 响应头。类型：`Map(LowCardinality(String), LowCardinality(String))`。

## 存储设置 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 允许在读取时跳过空文件。默认情况下禁用。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - 允许启用/禁用 URI 中路径的解码/编码。默认情况下启用。
