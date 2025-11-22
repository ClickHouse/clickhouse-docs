---
description: '此引擎支持通过 Apache Arrow Flight 查询远程数据集。'
sidebar_label: 'ArrowFlight'
sidebar_position: 186
slug: /engines/table-engines/integrations/arrowflight
title: 'ArrowFlight 表引擎'
doc_type: 'reference'
---



# ArrowFlight 表引擎

ArrowFlight 表引擎使 ClickHouse 能够通过 [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) 协议查询远程数据集。
这种集成允许 ClickHouse 高性能地从支持 Flight 的外部服务器获取 Arrow 列式数据。



## 创建表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name (name1 [type1], name2 [type2], ...)
    ENGINE = ArrowFlight('host:port', 'dataset_name' [, 'username', 'password']);
```

**引擎参数**

- `host:port` — 远程 Arrow Flight 服务器地址。
- `dataset_name` — Flight 服务器上的数据集标识符。
- `username` - 用于基本 HTTP 身份验证的用户名。
- `password` - 用于基本 HTTP 身份验证的密码。
  如果未指定 `username` 和 `password`,则表示不使用身份验证
  (仅在 Arrow Flight 服务器允许的情况下有效)。


## 使用示例 {#usage-example}

此示例演示如何创建一个从远程 Arrow Flight 服务器读取数据的表：

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

- ClickHouse 中定义的架构必须与 Flight 服务器返回的架构一致。
- 该引擎适用于联邦查询、数据虚拟化以及存储计算分离等场景。


## 另请参阅 {#see-also}

- [Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
- [ClickHouse 中的 Arrow 格式集成](/interfaces/formats/Arrow)
