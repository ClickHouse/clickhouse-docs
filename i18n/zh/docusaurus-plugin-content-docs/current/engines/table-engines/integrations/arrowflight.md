---
description: '此引擎允许通过 Apache Arrow Flight 查询远程数据集。'
sidebar_label: 'ArrowFlight'
sidebar_position: 186
slug: /engines/table-engines/integrations/arrowflight
title: 'ArrowFlight 表引擎'
doc_type: 'reference'
---



# ArrowFlight 表引擎

ArrowFlight 表引擎使 ClickHouse 能够通过 [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) 协议查询远程数据集。
此集成允许 ClickHouse 高效地从支持 Flight 的外部服务器获取列式 Arrow 格式的数据。



## 创建表

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name (name1 [type1], name2 [type2], ...)
    ENGINE = ArrowFlight('host:port', 'dataset_name' [, 'username', 'password']);
```

**引擎参数**

* `host:port` — 远程 Arrow Flight 服务器的地址。
* `dataset_name` — Flight 服务器上数据集的标识符。
* `username` — 用于 HTTP 基本认证的用户名。
* `password` — 用于 HTTP 基本认证的密码。
  如果未指定 `username` 和 `password`，则表示不使用认证
  （仅当 Arrow Flight 服务器允许无认证访问时才可用）。


## 使用示例

本示例演示如何创建一个从远程 Arrow Flight 服务器读取数据的表：

```sql
CREATE TABLE remote_flight_data
(
    id UInt32,
    name String,
    value Float64
) ENGINE = ArrowFlight('127.0.0.1:9005', 'sample_dataset');
```

像查询本地表一样查询远程数据：

```sql
SELECT * FROM remote_flight_data ORDER BY id;
```

```text
┌─id─┬─name────┬─value─┐
│  1 │ foo     │ 42.1  │
│  2 │ bar     │ 13.3  │
│  3 │ baz     │ 77.0  │
└────┴─────────┴───────┘
```


## 注意事项 {#notes}

* 在 ClickHouse 中定义的 schema 必须与 Flight 服务器返回的 schema 一致。
* 此引擎适用于联邦查询、数据虚拟化，以及将存储与计算解耦的场景。



## 另请参阅 {#see-also}

* [Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouse 中的 Arrow 格式集成](/interfaces/formats/Arrow)
