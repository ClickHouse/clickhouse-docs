---
sidebar_label: '附加选项'
sidebar_position: 3
keywords: ['clickhouse', 'python', 'options', 'settings']
description: 'ClickHouse Connect 的附加选项'
slug: /integrations/language-clients/python/additional-options
title: '附加选项'
doc_type: 'reference'
---



# 其他选项 {#additional-options}

ClickHouse Connect 为高级场景提供了多种额外选项。



## 全局设置

有少量设置用于在全局范围内控制 ClickHouse Connect 的行为。可以从顶层的 `common` 包中进行访问：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
这些常用设置 `autogenerate_session_id`、`product_name` 和 `readonly` 在使用 `clickhouse_connect.get_client` 方法创建客户端之前*必须*修改。在客户端创建之后再更改这些设置，不会影响已存在客户端的行为。
:::

当前定义了以下全局设置：

| Setting Name                                    | Default         | Options                                         | Description                                                                                                                                                                           |
| ----------------------------------------------- | --------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| autogenerate&#95;session&#95;id                 | True            | True, False                                     | 为每个客户端会话自动生成一个新的 UUID(1) 会话 ID（如果未提供）。如果在客户端或查询级别都未提供会话 ID，ClickHouse 将为每个查询生成一个随机的内部 ID。                                                                                             |
| dict&#95;parameter&#95;format                   | &#39;json&#39;  | &#39;json&#39;, &#39;map&#39;                   | 控制参数化查询是将 Python 字典转换为 JSON 还是 ClickHouse Map 语法。`json` 适用于插入到 JSON 列，`map` 适用于 ClickHouse Map 列。                                                                                     |
| invalid&#95;setting&#95;action                  | &#39;error&#39; | &#39;drop&#39;, &#39;send&#39;, &#39;error&#39; | 当提供了无效或只读设置（用于客户端会话或查询）时要采取的操作。如果为 `drop`，该设置将被忽略；如果为 `send`，该设置会被发送到 ClickHouse；如果为 `error`，则会在客户端抛出 ProgrammingError 异常。                                                            |
| max&#95;connection&#95;age                      | 600             |                                                 | HTTP Keep Alive 连接保持打开/复用的最长时间（秒）。这可以防止在负载均衡器/代理后端将连接过度集中到单个 ClickHouse 节点。默认值为 10 分钟。                                                                                                |
| product&#95;name                                |                 |                                                 | 一个随查询一同传递给 ClickHouse 的字符串，用于跟踪使用 ClickHouse Connect 的应用。应采用 &lt;product name;&amp;gl/&lt;product version&gt; 的格式。                                                                    |
| readonly                                        | 0               | 0, 1                                            | 针对 19.17 之前版本的隐式 &quot;read&#95;only&quot; ClickHouse 设置。可以将其设置为与 ClickHouse &quot;read&#95;only&quot; 设置的值一致，以便与非常旧的 ClickHouse 版本兼容。                                                |
| send&#95;os&#95;user                            | True            | True, False                                     | 在发送到 ClickHouse 的客户端信息（HTTP User-Agent 字符串）中包含检测到的操作系统用户。                                                                                                                             |
| send&#95;integration&#95;tags                   | True            | True, False                                     | 在发送到 ClickHouse 的客户端信息（HTTP User-Agent 字符串）中包含所使用的集成库及其版本（例如 Pandas/SQLAlchemy 等）。                                                                                                    |
| use&#95;protocol&#95;version                    | True            | True, False                                     | 使用客户端协议版本。对于 `DateTime` 时区列是必需的，但与当前版本的 chproxy 不兼容。                                                                                                                                  |
| max&#95;error&#95;size                          | 1024            |                                                 | 在客户端错误消息中返回的最大字符数。将此设置为 0 可获取完整的 ClickHouse 错误消息。默认值为 1024 个字符。                                                                                                                       |
| http&#95;buffer&#95;size                        | 10MB            |                                                 | 用于 HTTP 流式查询的“内存中”缓冲区大小（字节）。                                                                                                                                                          |
| preserve&#95;pandas&#95;datetime&#95;resolution | False           | True, False                                     | 当为 True 且使用 pandas 2.x 时，会保留 datetime64/timedelta64 dtype 的分辨率（例如 &#39;s&#39;、&#39;ms&#39;、&#39;us&#39;、&#39;ns&#39;）。如果为 False（或使用 pandas &lt;2.x），则会强制转换为纳秒（&#39;ns&#39;）分辨率以保证兼容性。 |


## 压缩 {#compression}

ClickHouse Connect 对查询结果和插入操作都支持 lz4、zstd、brotli 和 gzip 压缩。请始终记住，启用压缩通常意味着要在网络带宽/传输速度与 CPU 使用率（客户端和服务器端）之间进行权衡。

若要接收压缩数据，必须将 ClickHouse 服务器的 `enable_http_compression` 设置为 1，或者用户必须拥有在“每个查询”级别修改该设置的权限。

在调用 `clickhouse_connect.get_client` 工厂方法时，可以通过 `compress` 参数来控制压缩。默认情况下，`compress` 被设置为 `True`，这会启用默认的压缩设置。对于使用 `query`、`query_np` 和 `query_df` 客户端方法执行的查询，ClickHouse Connect 会在请求中添加 `Accept-Encoding` 头，其中包含 `lz4`、`zstd`、`br`（brotli，如果已安装 brotli 库）、`gzip` 和 `deflate` 编码。（对于大多数请求，ClickHouse 服务器会返回使用 `zstd` 压缩的响应。）对于插入操作，默认情况下 ClickHouse Connect 会使用 `lz4` 压缩插入块，并发送 `Content-Encoding: lz4` HTTP 头。

`get_client` 的 `compress` 参数也可以设置为特定的压缩方式之一：`lz4`、`zstd`、`br` 或 `gzip`。如果 ClickHouse 服务器支持，该方式将同时用于插入和查询结果。所需的 `zstd` 和 `lz4` 压缩库现在会随 ClickHouse Connect 默认安装。如果指定 `br`/brotli，则必须单独安装 brotli 库。

请注意，`raw*` 客户端方法不会使用客户端配置中指定的压缩方式。

我们同样不建议使用 `gzip` 压缩，因为在数据压缩和解压缩方面，它明显比其他选项更慢。



## HTTP 代理支持 {#http-proxy-support}

ClickHouse Connect 使用 `urllib3` 库提供基本的 HTTP 代理支持。它会识别标准的 `HTTP_PROXY` 和 `HTTPS_PROXY` 环境变量。请注意，使用这些环境变量会影响通过 `clickhouse_connect.get_client` 方法创建的所有客户端。如果希望针对单个客户端进行配置，可以在调用 `get_client` 方法时使用 `http_proxy` 或 `https_proxy` 参数。有关 HTTP 代理支持实现的详细信息，请参阅 [urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies) 文档。

要使用 SOCKS 代理，可以将 `urllib3` 的 `SOCKSProxyManager` 作为 `pool_mgr` 参数传递给 `get_client`。请注意，这需要安装 PySocks 库，可以直接安装，或者通过为 `urllib3` 依赖添加 `[socks]` 选项来安装。



## “旧版” JSON 数据类型 {#old-json-data-type}

实验性的 `Object`（或 `Object('json')`）数据类型已被弃用，不应在生产环境中使用。ClickHouse Connect 仍然对该数据类型提供有限支持，以保持向后兼容性。请注意，此支持不包括那些预期返回“顶层”或“父级” JSON 值（以字典或等价形式）的查询，此类查询将会导致异常。



## “新” Variant/Dynamic/JSON 数据类型（实验性特性） {#new-variantdynamicjson-datatypes-experimental-feature}

从 0.8.0 版本开始，`clickhouse-connect` 对新的（同样为实验性）ClickHouse 类型 Variant、Dynamic 和 JSON 提供实验性支持。

### 使用说明 {#usage-notes}
- JSON 数据可以以 Python 字典的形式插入，或以包含 JSON 对象 `{}` 的 JSON 字符串形式插入。不支持其他形式的 JSON 数据。
- 在查询中对这些类型使用子列/路径时，将返回相应子列的类型。
- 其他使用说明请参阅 ClickHouse 的[文档](https://clickhouse.com/docs)。

### 已知限制 {#known-limitations}
- 在使用这些类型之前，必须先在 ClickHouse 的设置中分别启用它们。
- “新”的 JSON 类型从 ClickHouse 24.8 版本开始可用。
- 由于内部格式发生更改，`clickhouse-connect` 仅与 ClickHouse 24.7 及之后版本中的 Variant 类型兼容。
- 返回的 JSON 对象只会返回 `max_dynamic_paths` 数量的元素（默认值为 1024）。这一点将在未来的版本中修复。
- 向 `Dynamic` 列插入数据时，始终会写入 Python 值的字符串表示形式。一旦 https://github.com/ClickHouse/ClickHouse/issues/70395 得到修复，此问题将在未来版本中修复。
- 新类型的实现尚未使用 C 代码进行优化，因此性能可能会比更简单、已成熟的数据类型稍慢。
