---
sidebar_label: Additional Options
sidebar_position: 70
keywords: [clickhouse, python, client, connect, integrate]
slug: /en/integrations/language-clients/python/options
description: Advanced Usage Patterns in ClickHouse Connect
---

# Additional Options

ClickHouse Connect provides a number of additional options for advanced use cases

## Global Settings

There are a small number of settings that control ClickHouse Connect behavior globally.  They are accessed from the top
level `common` package:

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

Four global settings are currently defined:

| Setting Name            | Default | Options                 | Description                                                                                                                                                                                                                                                   |
|-------------------------|---------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| autogenerate_session_id | True    | True, False             | Autogenerate a new UUID(1) session id (if not provided) for each client session.  If no session id is provided (either at the client or query level, ClickHouse will generate random internal id for each query                                               |
| invalid_setting_action  | 'error' | 'drop', 'send', 'error' | Action to take when an invalid or readonly setting is provided (either for the client session or query).  If `drop`, the setting will be ignored, if `send`, the setting will be sent to ClickHouse, if `error` a client side ProgrammingError will be raised |
| dict_parameter_format   | 'json'  | 'json', 'map'           | This controls whether parameterized queries convert a Python dictionary to JSON or ClickHouse Map syntax. `json` should be used for inserts into JSON columns, `map` for ClickHouse Map columns                                                               |
| product_name            |         |                         | A string that is passed with the query to clickhouse for tracking the app using ClickHouse Connect.  Should be in the form &lt;product name;&gl/&lt;product version&gt;                                                                                       |

## Compression

ClickHouse Connect supports lz4, zstd, brotli, and gzip compression for both query results and inserts.  Always keep in mind
that using compression usually involves a tradeoff between network bandwidth/transfer speed against CPU usage (both on the
client and the server.)

To receive compressed data, the ClickHouse server `enable_http_compression` must be set to 1, or the user must have
permission to change the setting on a "per query" basis.

Compression is controlled by the `compress` parameter when calling the `clickhouse_connect.get_client` factory method.
By default, `compress` is set to `True`, which will trigger the default compression settings.  For queries executed
with the `query`, `query_np`, and `query_df` client methods,  ClickHouse Connect will add the `Accept-Encoding` header with 
the `lz4`, `zstd`, `br` (brotli, if the brotli library is installed), `gzip`, and `deflate` encodings to queries executed
with the `query` client method (and indirectly, `query_np` and `query_df`.  (For the majority of requests the ClickHouse 
server will return with a `zstd` compressed payload.)  For inserts, by default ClickHouse Connect will compress insert
blocks with `lz4` compression, and send the `Content-Encoding: lz4` HTTP header.

The `get_client` `compress` parameter can also be set to a specific compression method, one of `lz4`, `zstd`, `br`, or
`gzip`.  That method will then be used for both inserts and query results (if supported by the ClickHouse server.)  The required
`zstd` and `lz4` compression libraries are now installed by default with ClickHouse Connect.  If `br`/brotli is specified,
the brotli library must be installed separately.

Note that the `raw*` client methods don't use the compression specified by the client configuration.

We also recommend against using `gzip` compression, as it is significantly slower than the alternatives for both compressing
and decompressing data.

## HTTP Proxy Support

ClickHouse Connect adds basic HTTP proxy support using the urllib3 library.  It recognizes the standard `HTTP_PROXY` and
`HTTPS_PROXY` environment variables.  Note that using these environment variables will apply to any client created with the
`clickhouse_connect.get_client` method.  Alternatively, to configure per client, you can use the `http_proxy` or `https_proxy`
arguments to the get_client method. For details on the implementation of HTTP Proxy support, see the [urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies)
documentation.

To use a Socks proxy, you can send a urllib3 SOCKSProxyManager as the `pool_mgr` argument to `get_client`.  Note that
this will require installing the PySocks library either directly or using the `[socks]` option for the urllib3 dependency.


