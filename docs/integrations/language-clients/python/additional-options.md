---
sidebar_label: 'Additional Options'
sidebar_position: 3
keywords: ['clickhouse', 'python', 'options', 'settings']
description: 'Additional Options for ClickHouse Connect'
slug: /integrations/language-clients/python/additional-options
title: 'Additional Options'
doc_type: 'reference'
---

# Additional options {#additional-options}

ClickHouse Connect provides a number of additional options for advanced use cases.

## Global settings {#global-settings}

There are a small number of settings that control ClickHouse Connect behavior globally. They are accessed from the top level `common` package:

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
These common settings `autogenerate_session_id`, `product_name`, and `readonly` should _always_ be modified before creating a client with the `clickhouse_connect.get_client` method. Changing these settings after client creation does not affect the behavior of existing clients.
:::

The following global settings are currently defined:

| Setting Name                        | Default | Options                 | Description                                                                                                                                                                                                                                                   |
|-------------------------------------|---------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| autogenerate_session_id             | True    | True, False             | Autogenerate a new UUID(1) session ID (if not provided) for each client session. If no session ID is provided (either at the client or query level), ClickHouse will generate a random internal ID for each query.                                            |
| dict_parameter_format               | 'json'  | 'json', 'map'           | This controls whether parameterized queries convert a Python dictionary to JSON or ClickHouse Map syntax. `json` should be used for inserts into JSON columns, `map` for ClickHouse Map columns.                                                              |
| invalid_setting_action              | 'error' | 'drop', 'send', 'error' | Action to take when an invalid or readonly setting is provided (either for the client session or query). If `drop`, the setting will be ignored, if `send`, the setting will be sent to ClickHouse, if `error` a client side ProgrammingError will be raised. |
| max_connection_age                  | 600     |                         | Maximum seconds that an HTTP Keep Alive connection will be kept open/reused. This prevents bunching of connections against a single ClickHouse node behind a load balancer/proxy. Defaults to 10 minutes.                                                     |
| product_name                        |         |                         | A string that is passed with the query to ClickHouse for tracking the app using ClickHouse Connect. Should be in the form &lt;product name;&gl/&lt;product version&gt;.                                                                                       |
| readonly                            | 0       | 0, 1                    | Implied "read_only" ClickHouse settings for versions prior to 19.17. Can be set to match the ClickHouse "read_only" value for settings to allow operation with very old ClickHouse versions.                                                                  |
| send_os_user                        | True    | True, False             | Include the detected operating system user in client information sent to ClickHouse (HTTP User-Agent string).                                                                                                                                                 |
| send_integration_tags               | True    | True, False             | Include the used integration libraries/version (e.g. Pandas/SQLAlchemy/etc.) in client information sent to ClickHouse (HTTP User-Agent string).                                                                                                               |
| use_protocol_version                | True    | True, False             | Use the client protocol version. This is needed for `DateTime` timezone columns but breaks with the current version of chproxy.                                                                                                                               |
| max_error_size                      | 1024    |                         | Maximum number of characters that will be returned in a client error messages. Use 0 for this setting to get the full ClickHouse error message. Defaults to 1024 characters.                                                                                  |
| http_buffer_size                    | 10MB    |                         | Size (in bytes) of the "in-memory" buffer used for HTTP streaming queries.                                                                                                                                                                                    |
| preserve_pandas_datetime_resolution | False   | True, False             | When True and using pandas 2.x, preserves the datetime64/timedelta64 dtype resolution (e.g., 's', 'ms', 'us', 'ns'). If False (or on pandas &lt;2.x), coerces to nanosecond ('ns') resolution for compatibility.                                              |

## Compression {#compression}

ClickHouse Connect supports lz4, zstd, brotli, and gzip compression for both query results and inserts. Always keep in mind that using compression usually involves a tradeoff between network bandwidth/transfer speed against CPU usage (both on the client and the server.)

To receive compressed data, the ClickHouse server `enable_http_compression` must be set to 1, or the user must have permission to change the setting on a "per query" basis.

Compression is controlled by the `compress` parameter when calling the `clickhouse_connect.get_client` factory method. By default, `compress` is set to `True`, which will trigger the default compression settings. For queries executed with the `query`, `query_np`, and `query_df` client methods,  ClickHouse Connect will add the `Accept-Encoding` header with
the `lz4`, `zstd`, `br` (brotli, if the brotli library is installed), `gzip`, and `deflate` encodings to queries executed with the `query` client method (and indirectly, `query_np` and `query_df`). (For the majority of requests the ClickHouse
server will return with a `zstd` compressed payload.) For inserts, by default ClickHouse Connect will compress insert blocks with `lz4` compression, and send the `Content-Encoding: lz4` HTTP header.

The `get_client` `compress` parameter can also be set to a specific compression method, one of `lz4`, `zstd`, `br`, or `gzip`. That method will then be used for both inserts and query results (if supported by the ClickHouse server.) The required `zstd` and `lz4` compression libraries are now installed by default with ClickHouse Connect. If `br`/brotli is specified, the brotli library must be installed separately.

Note that the `raw*` client methods don't use the compression specified by the client configuration.

We also recommend against using `gzip` compression, as it is significantly slower than the alternatives for both compressing and decompressing data.

## HTTP proxy support {#http-proxy-support}

ClickHouse Connect adds basic HTTP proxy support using the `urllib3` library. It recognizes the standard `HTTP_PROXY` and `HTTPS_PROXY` environment variables. Note that using these environment variables will apply to any client created with the `clickhouse_connect.get_client` method. Alternatively, to configure per client, you can use the `http_proxy` or `https_proxy` arguments to the get_client method. For details on the implementation of HTTP Proxy support, see the [urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies) documentation.

To use a SOCKS proxy, you can send a `urllib3` `SOCKSProxyManager` as the `pool_mgr` argument to `get_client`. Note that this will require installing the PySocks library either directly or using the `[socks]` option for the `urllib3` dependency.

## "Old" JSON data type {#old-json-data-type}

The experimental `Object` (or `Object('json')`) data type is deprecated and should be avoided in a production environment. ClickHouse Connect continues to provide limited support for the data type for backward compatibility. Note that this support does not include queries that are expected to return "top level" or "parent" JSON values as dictionaries or the equivalent, and such queries will result in an exception.

## "New" Variant/Dynamic/JSON datatypes (experimental feature) {#new-variantdynamicjson-datatypes-experimental-feature}

Beginning with the 0.8.0 release, `clickhouse-connect` provides experimental support for the new (also experimental) ClickHouse types Variant, Dynamic, and JSON.

### Usage notes {#usage-notes}
- JSON data can be inserted as either a Python dictionary or a JSON string containing a JSON object `{}`. Other forms of JSON data are not supported.
- Queries using subcolumns/paths for these types will return the type of the sub column.
- See the main ClickHouse [documentation](https://clickhouse.com/docs) for other usage notes.

### Known limitations {#known-limitations}
- Each of these types must be enabled in the ClickHouse settings before using.
- The "new" JSON type is available starting with the ClickHouse 24.8 release
- Due to internal format changes, `clickhouse-connect` is only compatible with Variant types beginning with the ClickHouse 24.7 release
- Returned JSON objects will only return the `max_dynamic_paths` number of elements (which defaults to 1024). This will be fixed in a future release.
- Inserts into `Dynamic` columns will always be the String representation of the Python value. This will be fixed in a future release, once https://github.com/ClickHouse/ClickHouse/issues/70395 has been fixed.
- The implementation for the new types has not been optimized in C code, so performance may be somewhat slower than for simpler, established data types.
