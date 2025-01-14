---
title: Java
keywords: [clickhouse, java, jdbc, client, integrate, r2dbc]
description: Options for connecting to ClickHouse from Java
slug: /en/integrations/java
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Java Clients Overview

- [Client-V2](./client-v2.md)
- [Client-V1 (Old)](./client-v1.md)
- [JDBC Driver](./jdbc-driver.md)
- [R2DBC Driver](./r2dbc.md)

## ClickHouse Client

Java client is a library implementing own API that abstracts details of network communications with ClickHouse server. Currently HTTP Interface is supported only. The library provide utilities to work with different ClickHouse formats and other related functions.

Java Client was developed far back in 2015. Its codebase became very hard to maintain, API is confusing, it is hard to optimize it further. So we have refactored it in 2024 into a new component  `client-v2`. It has clear API, lighter codebase and more performance improvements, better ClickHouse formats support (RowBinary & Native mainly). JDBC will use this client in near feature.  

### Supported Data Types

|**Data Type**          |**Client V2 Support**|**Client V1 Support**|
|-----------------------|---------------------|---------------------|
|Int8                   |✔                    |✔                    |
|Int16                  |✔                    |✔                    |
|Int32                  |✔                    |✔                    |
|Int64                  |✔                    |✔                    |
|Int128                 |✔                    |✔                    |
|Int256                 |✔                    |✔                    |
|UInt8                  |✔                    |✔                    |
|UInt16                 |✔                    |✔                    |
|UInt32                 |✔                    |✔                    |
|UInt64                 |✔                    |✔                    |
|UInt128                |✔                    |✔                    |
|UInt256                |✔                    |✔                    |
|Float32                |✔                    |✔                    |
|Float64                |✔                    |✔                    |
|Decimal                |✔                    |✔                    |
|Decimal32              |✔                    |✔                    |
|Decimal64              |✔                    |✔                    |
|Decimal128             |✔                    |✔                    |
|Decimal256             |✔                    |✔                    |
|Bool                   |✔                    |✔                    |
|String                 |✔                    |✔                    |
|FixedString            |✔                    |✔                    |
|Nullable               |✔                    |✔                    |
|Date                   |✔                    |✔                    |
|Date32                 |✔                    |✔                    |
|DateTime               |✔                    |✔                    |
|DateTime32             |✔                    |✔                    |
|DateTime64             |✔                    |✔                    |
|Interval               |✗                    |✗                    |
|Enum                   |✔                    |✔                    |
|Enum8                  |✔                    |✔                    |
|Enum16                 |✔                    |✔                    |
|Array                  |✔                    |✔                    |
|Map                    |✔                    |✔                    |
|Nested                 |✔                    |✔                    |
|Tuple                  |✔                    |✔                    |
|UUID                   |✔                    |✔                    |
|IPv4                   |✔                    |✔                    |
|IPv6                   |✔                    |✔                    |
|Object                 |✗                    |✔                    |
|Point                  |✔                    |✔                    |
|Nothing                |✔                    |✔                    |
|MultiPolygon           |✔                    |✔                    |
|Ring                   |✔                    |✔                    |
|Polygon                |✔                    |✔                    |
|SimpleAggregateFunction|✔                    |✔                    |
|AggregateFunction      |✗                    |✔                    |

[ClickHouse Data Types](/docs/en/sql-reference/data-types)

:::note
- AggregatedFunction - :warning: does not support `SELECT * FROM table ...`
- Decimal - `SET output_format_decimal_trailing_zeros=1` in 21.9+ for consistency
- Enum - can be treated as both string and integer
- UInt64 - mapped to `long` in client-v1 
:::

### Features

Table of features of the clients:

| Name                                         | Client V2 | Client V1 | Comments
|----------------------------------------------|:---------:|:---------:|:---------:|
| Http Connection                              |✔       |✔      | |
| Http Compression (LZ4)                       |✔       |✔      | |
| Server Response Compression - LZ4            |✔       |✔      | | 
| Client Request Compression - LZ4             |✔       |✔      | |
| HTTPs                                        |✔       |✔      | |
| Client SSL Cert (mTLS)                       |✔       |✔      | |
| Http Proxy                                   |✔       |✔      | |
| POJO SerDe                                   |✔       |✗      | |
| Connection Pool                              |✔       |✔      | When Apache HTTP Client used |
| Named Parameters                             |✔       |✔      | |
| Retry on failure                             |✔       |✔      | |
| Failover                                     |✗       |✔      | |
| Load-balancing                               |✗       |✔      | |
| Server auto-discovery                        |✗       |✔      | |
| Log Comment                                  |✔       |✔      | |
| Session Roles                                |✔       |✔      | |
| SSL Client Authentication                    |✔       |✔      | |
| Session timezone                             |✔       |✔      | |


JDBC Drive inherits same features as underlying client implementation. Other JDBC features are listed on its [page](/docs/en/integrations/java/jdbc-driver#features).

### Compatibility

- All projects in this repo are tested with all [active LTS versions](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease) of ClickHouse.
- [Support policy](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- We recommend to upgrade client continuously to not miss security fixes and new improvements
- If you have an issue with migration to v2 API - [create an issue](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=) and we will respond!


[ChangeLog](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md)
