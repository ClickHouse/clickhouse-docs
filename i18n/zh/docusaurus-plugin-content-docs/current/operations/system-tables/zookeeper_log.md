---
'description': '系统表包含关于请求到ZooKeeper服务器的参数和它的响应的信息。'
'keywords':
- 'system table'
- 'zookeeper_log'
'slug': '/operations/system-tables/zookeeper_log'
'title': 'system.zookeeper_log'
---


# system.zookeeper_log

该表包含关于请求ZooKeeper服务器参数和其响应的信息。

对于请求，仅填充带有请求参数的列，其余列则填充默认值（`0`或`NULL`）。当响应到达时，响应中的数据将添加到其他列。

带有请求参数的列：

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的主机名。
- `type` ([Enum](../../sql-reference/data-types/enum.md)) — ZooKeeper客户端中的事件类型。可以有以下值：
    - `Request` — 请求已发送。
    - `Response` — 收到响应。
    - `Finalize` — 连接丢失，未收到响应。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件发生的日期。
- `event_time` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 事件发生的日期和时间。
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 用于发送请求的ZooKeeper服务器的IP地址。
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 用于发送请求的ZooKeeper服务器的端口。
- `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper服务器为每个连接设置的会话ID。
- `xid` ([Int32](../../sql-reference/data-types/int-uint.md)) — 会话内请求的ID。通常是一个顺序请求编号。它在请求行和配对的`response`/`finalize`行中是相同的。
- `has_watch` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 请求是否已设置[watch](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#ch_zkWatches)。
- `op_num` ([Enum](../../sql-reference/data-types/enum.md)) — 请求或响应的类型。
- `path` ([String](../../sql-reference/data-types/string.md)) — 在请求中指定的ZooKeeper节点的路径，如果请求不需要指定路径，则为空字符串。
- `data` ([String](../../sql-reference/data-types/string.md)) — 写入ZooKeeper节点的数据（对于`SET`和`CREATE`请求——请求想要写入的内容，对于`GET`请求的响应——读取的内容）或为空字符串。
- `is_ephemeral` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeper节点是否作为[临时节点](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Ephemeral+Nodes)创建。
- `is_sequential` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeper节点是否作为[顺序节点](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Sequence+Nodes+--+Unique+Naming)创建。
- `version` ([Nullable(Int32)](../../sql-reference/data-types/nullable.md)) — 请求在执行时所期望的ZooKeeper节点的版本。这对于`CHECK`、`SET`、`REMOVE`请求是支持的（如果请求不检查版本，则为`-1`，对于不支持版本检查的其他请求，则为`NULL`）。
- `requests_size` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 包含在多请求中的请求数量（这是一个特殊请求，由多个连续的普通请求组成，并以原子方式执行）。所有包含在多请求中的请求将具有相同的`xid`。
- `request_idx` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 包含在多请求中的请求编号（对于多请求——`0`，然后按顺序为`1`）。

带有请求响应参数的列：

- `zxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper事务ID。成功执行请求后，由ZooKeeper服务器发出的序列号（如果请求未执行/返回错误/客户端不知道请求是否执行，则为`0`）。
- `error` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — 错误代码。可以有多种值，以下是其中一些：
    - `ZOK` — 请求已成功执行。
    - `ZCONNECTIONLOSS` — 连接丢失。
    - `ZOPERATIONTIMEOUT` — 请求执行超时已过。
    - `ZSESSIONEXPIRED` — 会话已过期。
    - `NULL` — 请求已完成。
- `watch_type` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch`事件的类型（对于`op_num` = `Watch`的响应），对于其余响应：`NULL`。
- `watch_state` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch`事件的状态（对于`op_num` = `Watch`的响应），对于其余响应：`NULL`。
- `path_created` ([String](../../sql-reference/data-types/string.md)) — 创建的ZooKeeper节点的路径（对于`CREATE`请求的响应），如果节点作为`sequential`创建，则可能与`path`不同。
- `stat_czxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 导致此ZooKeeper节点被创建的更改的`zxid`。
- `stat_mzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 最后修改此ZooKeeper节点的更改的`zxid`。
- `stat_pzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 最后修改此ZooKeeper节点子项的更改的事务ID。
- `stat_version` ([Int32](../../sql-reference/data-types/int-uint.md)) — 此ZooKeeper节点数据的更改次数。
- `stat_cversion` ([Int32](../../sql-reference/data-types/int-uint.md)) — 此ZooKeeper节点子项的更改次数。
- `stat_dataLength` ([Int32](../../sql-reference/data-types/int-uint.md)) — 此ZooKeeper节点数据字段的长度。
- `stat_numChildren` ([Int32](../../sql-reference/data-types/int-uint.md)) — 此ZooKeeper节点的子项数量。
- `children` ([Array(String)](../../sql-reference/data-types/array.md)) — 子ZooKeeper节点的列表（对于`LIST`请求的响应）。

**示例**

查询：

```sql
SELECT * FROM system.zookeeper_log WHERE (session_id = '106662742089334927') AND (xid = '10858') FORMAT Vertical;
```

结果：

```text
Row 1:
──────
hostname:         clickhouse.eu-central1.internal
type:             Request
event_date:       2021-08-09
event_time:       2021-08-09 21:38:30.291792
address:          ::
port:             2181
session_id:       106662742089334927
xid:              10858
has_watch:        1
op_num:           List
path:             /clickhouse/task_queue/ddl
data:
is_ephemeral:     0
is_sequential:    0
version:          ᴺᵁᴸᴸ
requests_size:    0
request_idx:      0
zxid:             0
error:            ᴺᵁᴸᴸ
watch_type:       ᴺᵁᴸᴸ
watch_state:      ᴺᵁᴸᴸ
path_created:
stat_czxid:       0
stat_mzxid:       0
stat_pzxid:       0
stat_version:     0
stat_cversion:    0
stat_dataLength:  0
stat_numChildren: 0
children:         []

Row 2:
──────
type:             Response
event_date:       2021-08-09
event_time:       2021-08-09 21:38:30.292086
address:          ::
port:             2181
session_id:       106662742089334927
xid:              10858
has_watch:        1
op_num:           List
path:             /clickhouse/task_queue/ddl
data:
is_ephemeral:     0
is_sequential:    0
version:          ᴺᵁᴸᴸ
requests_size:    0
request_idx:      0
zxid:             16926267
error:            ZOK
watch_type:       ᴺᵁᴸᴸ
watch_state:      ᴺᵁᴸᴸ
path_created:
stat_czxid:       16925469
stat_mzxid:       16925469
stat_pzxid:       16926179
stat_version:     0
stat_cversion:    7
stat_dataLength:  0
stat_numChildren: 7
children:         ['query-0000000006','query-0000000005','query-0000000004','query-0000000003','query-0000000002','query-0000000001','query-0000000000']
```

**另见**

- [ZooKeeper](../../operations/tips.md#zookeeper)
- [ZooKeeper指南](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html)
