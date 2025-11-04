---
'description': '允许在通过 Apache Arrow Flight 服务器暴露的数据上执行查询。'
'sidebar_label': 'arrowFlight'
'sidebar_position': 186
'slug': '/sql-reference/table-functions/arrowflight'
'title': 'arrowFlight'
'doc_type': 'reference'
---


# arrowFlight 表函数

允许对通过 [Apache Arrow Flight](../../interfaces/arrowflight.md) 服务器公开的数据执行查询。

**语法**

```sql
arrowFlight('host:port', 'dataset_name' [, 'username', 'password'])
```

**参数**

* `host:port` — Arrow Flight 服务器的地址。 [字符串](../../sql-reference/data-types/string.md).
* `dataset_name` — 在 Arrow Flight 服务器上可用的数据集或描述符的名称。 [字符串](../../sql-reference/data-types/string.md).
* `username` - 用于基本 HTTP 风格认证的用户名。
* `password` - 用于基本 HTTP 风格认证的密码。
如果未指定 `username` 和 `password`，这意味着不使用认证
（仅当 Arrow Flight 服务器允许时才有效）。

**返回值**

* 一个表示远程数据集的表对象。架构是从 Arrow Flight 响应中推断的。

**示例**

查询：

```sql
SELECT * FROM arrowFlight('127.0.0.1:9005', 'sample_dataset') ORDER BY id;
```

结果：

```text
┌─id─┬─name────┬─value─┐
│  1 │ foo     │ 42.1  │
│  2 │ bar     │ 13.3  │
│  3 │ baz     │ 77.0  │
└────┴─────────┴───────┘
```

**另请参阅**

* [Arrow Flight](../../engines/table-engines/integrations/arrowflight.md) 表引擎
* [Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
