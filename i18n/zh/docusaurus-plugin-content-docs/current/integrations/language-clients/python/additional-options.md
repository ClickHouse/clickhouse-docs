---
sidebar_label: '附加选项'
sidebar_position: 3
keywords: ['clickhouse', 'python', 'options', 'settings']
description: 'ClickHouse Connect 的其他选项'
slug: /integrations/language-clients/python/additional-options
title: '附加选项'
doc_type: 'reference'
---



# 附加选项 {#additional-options}

ClickHouse Connect 为高级使用场景提供了多种附加选项。


## 全局设置 {#global-settings}

有少量设置可以全局控制 ClickHouse Connect 的行为。可以从顶层 `common` 包访问这些设置:

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
这些通用设置 `autogenerate_session_id`、`product_name` 和 `readonly` _必须_ 在使用 `clickhouse_connect.get_client` 方法创建客户端之前进行修改。客户端创建后更改这些设置不会影响现有客户端的行为。
:::

当前定义的全局设置如下:

| 设置名称                        | 默认值 | 选项                 | 描述                                                                                                                                                                                                                                                   |
| ----------------------------------- | ------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| autogenerate_session_id             | True    | True, False             | 为每个客户端会话自动生成新的 UUID(1) 会话 ID(如果未提供)。如果未提供会话 ID(无论是在客户端级别还是查询级别),ClickHouse 将为每个查询生成随机的内部 ID。                                            |
| dict_parameter_format               | 'json'  | 'json', 'map'           | 控制参数化查询是将 Python 字典转换为 JSON 还是 ClickHouse Map 语法。`json` 用于插入 JSON 列,`map` 用于 ClickHouse Map 列。                                                              |
| invalid_setting_action              | 'error' | 'drop', 'send', 'error' | 当提供无效或只读设置时(无论是针对客户端会话还是查询)采取的操作。如果为 `drop`,该设置将被忽略;如果为 `send`,该设置将被发送到 ClickHouse;如果为 `error`,将在客户端抛出 ProgrammingError。 |
| max_connection_age                  | 600     |                         | HTTP Keep Alive 连接保持打开/重用的最大秒数。这可以防止连接集中到负载均衡器/代理后面的单个 ClickHouse 节点。默认为 10 分钟。                                                     |
| product_name                        |         |                         | 与查询一起传递给 ClickHouse 的字符串,用于跟踪使用 ClickHouse Connect 的应用程序。格式应为 &lt;product name;&gl/&lt;product version&gt;。                                                                                       |
| readonly                            | 0       | 0, 1                    | 用于 19.17 之前版本的隐含 "read_only" ClickHouse 设置。可以设置为与 ClickHouse "read_only" 值匹配,以允许与非常旧的 ClickHouse 版本配合使用。                                                                  |
| send_os_user                        | True    | True, False             | 在发送到 ClickHouse 的客户端信息(HTTP User-Agent 字符串)中包含检测到的操作系统用户。                                                                                                                                                 |
| send_integration_tags               | True    | True, False             | 在发送到 ClickHouse 的客户端信息(HTTP User-Agent 字符串)中包含所使用的集成库/版本(例如 Pandas/SQLAlchemy 等)。                                                                                                               |
| use_protocol_version                | True    | True, False             | 使用客户端协议版本。这对于 `DateTime` 时区列是必需的,但与当前版本的 chproxy 不兼容。                                                                                                                               |
| max_error_size                      | 1024    |                         | 客户端错误消息中返回的最大字符数。将此设置设为 0 可获取完整的 ClickHouse 错误消息。默认为 1024 个字符。                                                                                  |
| http_buffer_size                    | 10MB    |                         | 用于 HTTP 流式查询的"内存"缓冲区大小(以字节为单位)。                                                                                                                                                                                    |
| preserve_pandas_datetime_resolution | False   | True, False             | 当为 True 且使用 pandas 2.x 时,保留 datetime64/timedelta64 数据类型分辨率(例如 's'、'ms'、'us'、'ns')。如果为 False(或在 pandas &lt;2.x 上),则强制转换为纳秒('ns')分辨率以保持兼容性。                                              |


## 压缩 {#compression}

ClickHouse Connect 支持对查询结果和插入数据使用 lz4、zstd、brotli 和 gzip 压缩。请始终注意,使用压缩通常需要在网络带宽/传输速度与 CPU 使用率(客户端和服务器端)之间进行权衡。

要接收压缩数据,ClickHouse 服务器的 `enable_http_compression` 必须设置为 1,或者用户必须具有按查询更改该设置的权限。

压缩由调用 `clickhouse_connect.get_client` 工厂方法时的 `compress` 参数控制。默认情况下,`compress` 设置为 `True`,这将触发默认压缩设置。对于使用 `query`、`query_np` 和 `query_df` 客户端方法执行的查询,ClickHouse Connect 将添加包含 `lz4`、`zstd`、`br`(brotli,如果已安装 brotli 库)、`gzip` 和 `deflate` 编码的 `Accept-Encoding` 请求头(对于 `query` 客户端方法以及间接使用的 `query_np` 和 `query_df`)。(对于大多数请求,ClickHouse 服务器将返回 `zstd` 压缩的响应数据。)对于插入操作,默认情况下 ClickHouse Connect 将使用 `lz4` 压缩来压缩插入块,并发送 `Content-Encoding: lz4` HTTP 请求头。

`get_client` 的 `compress` 参数也可以设置为特定的压缩方法,可选值为 `lz4`、`zstd`、`br` 或 `gzip`。该方法将同时用于插入和查询结果(如果 ClickHouse 服务器支持)。所需的 `zstd` 和 `lz4` 压缩库现在默认随 ClickHouse Connect 一起安装。如果指定 `br`/brotli,则必须单独安装 brotli 库。

请注意,`raw*` 客户端方法不使用客户端配置中指定的压缩。

我们还建议不要使用 `gzip` 压缩,因为它在压缩和解压缩数据方面都明显慢于其他替代方案。


## HTTP 代理支持 {#http-proxy-support}

ClickHouse Connect 通过 `urllib3` 库提供基本的 HTTP 代理支持。它能够识别标准的 `HTTP_PROXY` 和 `HTTPS_PROXY` 环境变量。请注意,使用这些环境变量将对所有通过 `clickhouse_connect.get_client` 方法创建的客户端生效。如需为单个客户端单独配置代理,可以在调用 get_client 方法时使用 `http_proxy` 或 `https_proxy` 参数。有关 HTTP 代理支持实现的详细信息,请参阅 [urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies) 文档。

要使用 SOCKS 代理,可以将 `urllib3` 的 `SOCKSProxyManager` 作为 `pool_mgr` 参数传递给 `get_client`。请注意,这需要安装 PySocks 库,可以直接安装或通过 `urllib3` 依赖项的 `[socks]` 选项安装。


## "旧版" JSON 数据类型 {#old-json-data-type}

实验性的 `Object`(或 `Object('json')`)数据类型已被弃用,不应在生产环境中使用。ClickHouse Connect 为保持向后兼容性,继续为该数据类型提供有限支持。请注意,此支持不包括预期返回"顶层"或"父级" JSON 值作为字典或等效形式的查询,此类查询将导致异常。


## "新"Variant/Dynamic/JSON 数据类型(实验性功能) {#new-variantdynamicjson-datatypes-experimental-feature}

从 0.8.0 版本开始,`clickhouse-connect` 为新的(同样是实验性的)ClickHouse 类型 Variant、Dynamic 和 JSON 提供实验性支持。

### 使用说明 {#usage-notes}

- JSON 数据可以作为 Python 字典或包含 JSON 对象 `{}` 的 JSON 字符串插入。不支持其他形式的 JSON 数据。
- 对这些类型使用子列/路径的查询将返回子列的类型。
- 有关其他使用说明,请参阅 ClickHouse 主[文档](https://clickhouse.com/docs)。

### 已知限制 {#known-limitations}

- 使用前必须在 ClickHouse 设置中启用这些类型。
- "新"JSON 类型从 ClickHouse 24.8 版本开始可用
- 由于内部格式变更,`clickhouse-connect` 仅与 ClickHouse 24.7 版本及以后的 Variant 类型兼容
- 返回的 JSON 对象将仅返回 `max_dynamic_paths` 数量的元素(默认为 1024)。这将在未来版本中修复。
- 插入到 `Dynamic` 列的数据将始终是 Python 值的字符串表示形式。一旦 https://github.com/ClickHouse/ClickHouse/issues/70395 修复后,这将在未来版本中得到修复。
- 新类型的实现尚未在 C 代码中进行优化,因此性能可能比更简单、成熟的数据类型稍慢。
