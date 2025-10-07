---
'description': '该引擎允许通过 Apache Arrow Flight 查询远程数据集。'
'sidebar_label': 'ArrowFlight'
'sidebar_position': 186
'slug': '/engines/table-engines/integrations/arrowflight'
'title': 'ArrowFlight'
'doc_type': 'reference'
---


# ArrowFlight

ArrowFlight 表引擎使 ClickHouse 能够通过 [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) 协议查询远程数据集。  
此集成允许 ClickHouse 以高性能的列式 Arrow 格式从外部支持 Flight 的服务器获取数据。

## 创建表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name (name1 [type1], name2 [type2], ...)
    ENGINE = ArrowFlight('host:port', 'dataset_name' [, 'username', 'password']);
```

**引擎参数**

* `host:port` — 远程 Arrow Flight 服务器的地址。
* `dataset_name` — Flight 服务器上数据集的标识符。
* `username` - 用于基本 HTTP 样式身份验证的用户名。
* `password` - 用于基本 HTTP 样式身份验证的密码。  
如果未指定 `username` 和 `password`，则表示不使用身份验证  
（只有在 Arrow Flight 服务器允许的情况下才可以工作）。

## 使用示例 {#usage-example}

此示例展示如何创建一个从远程 Arrow Flight 服务器读取数据的表：

```sql
CREATE TABLE remote_flight_data
(
    id UInt32,
    name String,
    value Float64
) ENGINE = ArrowFlight('127.0.0.1:9005', 'sample_dataset');
```

将远程数据查询为本地表：

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

* 在 ClickHouse 中定义的模式必须与 Flight 服务器返回的模式匹配。
* 此引擎适用于联合查询、数据虚拟化和解耦存储与计算。

## 另见 {#see-also}

* [Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouse 中的 Arrow 格式集成](/interfaces/formats/Arrow)
