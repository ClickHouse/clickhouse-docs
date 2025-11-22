---
description: '包含 ZooKeeper 服务器请求参数及响应信息的系统表。'
keywords: ['system table', 'zookeeper_log']
slug: /operations/system-tables/zookeeper_log
title: 'system.zookeeper_log'
doc_type: 'reference'
---

# system.zookeeper_log

该表包含发往 ZooKeeper 服务器的请求参数以及从其返回的响应信息。

对于请求行，只有包含请求参数的列会被填充，其余列填充为默认值（`0` 或 `NULL`）。当响应到达时，响应中的数据会被补充到其他列中。

请求参数相关的列：

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器主机名。
- `type` ([Enum](../../sql-reference/data-types/enum.md)) — ZooKeeper 客户端中的事件类型。可以具有以下值之一：
  - `Request` — 请求已发送。
  - `Response` — 已收到响应。
  - `Finalize` — 连接丢失，未收到响应。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件发生的日期。
- `event_time` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 事件发生的日期和时间。
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 用于发出请求的 ZooKeeper 服务器的 IP 地址。
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 用于发出请求的 ZooKeeper 服务器端口。
- `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 服务器为每个连接分配的会话 ID。
- `xid` ([Int32](../../sql-reference/data-types/int-uint.md)) — 会话内请求的 ID。通常是顺序的请求编号。对于请求行和与其配对的 `response`/`finalize` 行，该值相同。
- `has_watch` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 请求是否设置了 [watch](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#ch_zkWatches)。
- `op_num` ([Enum](../../sql-reference/data-types/enum.md)) — 请求或响应的类型。
- `path` ([String](../../sql-reference/data-types/string.md)) — 请求中指定的 ZooKeeper 节点路径；如果该请求不需要指定路径，则为空字符串。
- `data` ([String](../../sql-reference/data-types/string.md)) — 写入 ZooKeeper 节点的数据（对于 `SET` 和 `CREATE` 请求——请求想要写入的内容；对于 `GET` 请求的响应——读取到的内容），或空字符串。
- `is_ephemeral` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 节点是否被创建为[临时节点（ephemeral）](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Ephemeral+Nodes)。
- `is_sequential` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 节点是否被创建为[顺序节点（sequential）](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Sequence+Nodes+--+Unique+Naming)。
- `version` ([Nullable(Int32)](../../sql-reference/data-types/nullable.md)) — 请求在执行时期望的 ZooKeeper 节点版本。`CHECK`、`SET`、`REMOVE` 请求支持该字段（如果请求不检查版本则为 `-1`；对于不支持版本检查的其他请求则为 `NULL`）。
- `requests_size` ([UInt32](../../sql-reference/data-types/int-uint.md)) — multi 请求中包含的请求数量（这是一种由多个连续的普通请求组成并以原子方式执行的特殊请求）。multi 请求中包含的所有请求将具有相同的 `xid`。
- `request_idx` ([UInt32](../../sql-reference/data-types/int-uint.md)) — multi 请求中所包含请求的序号（对于 multi 请求本身为 `0`，随后从 `1` 开始依次递增）。

响应参数相关的列：

* `zxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 事务 ID。由 ZooKeeper 服务器在成功执行请求后返回的序列号（如果请求未执行/返回错误/客户端不知道请求是否已执行，则为 `0`）。
* `error` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — 错误代码。可能具有多种取值，这里仅列出其中一些：
  * `ZOK` — 请求已成功执行。
  * `ZCONNECTIONLOSS` — 连接已丢失。
  * `ZOPERATIONTIMEOUT` — 请求执行超时。
  * `ZSESSIONEXPIRED` — 会话已过期。
  * `NULL` — 请求已完成。
* `watch_type` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch` 事件的类型（对于 `op_num` = `Watch` 的响应），其他响应为 `NULL`。
* `watch_state` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch` 事件的状态（对于 `op_num` = `Watch` 的响应），其他响应为 `NULL`。
* `path_created` ([String](../../sql-reference/data-types/string.md)) — 创建的 ZooKeeper 节点的路径（对于 `CREATE` 请求的响应），如果节点以 `sequential` 方式创建，则可能与 `path` 不同。
* `stat_czxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 导致创建此 ZooKeeper 节点的变更对应的 `zxid`。
* `stat_mzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 最近一次修改此 ZooKeeper 节点的变更对应的 `zxid`。
* `stat_pzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 最近一次修改此 ZooKeeper 节点子节点的变更对应的事务 ID。
* `stat_version` ([Int32](../../sql-reference/data-types/int-uint.md)) — 此 ZooKeeper 节点数据的变更次数。
* `stat_cversion` ([Int32](../../sql-reference/data-types/int-uint.md)) — 此 ZooKeeper 节点子节点的变更次数。
* `stat_dataLength` ([Int32](../../sql-reference/data-types/int-uint.md)) — 此 ZooKeeper 节点数据字段的长度。
* `stat_numChildren` ([Int32](../../sql-reference/data-types/int-uint.md)) — 此 ZooKeeper 节点子节点的数量。
* `children` ([Array(String)](../../sql-reference/data-types/array.md)) — 子 ZooKeeper 节点列表（对于 `LIST` 请求的响应）。

**示例**

查询：

```sql
SELECT * FROM system.zookeeper_log WHERE (session_id = '106662742089334927') AND (xid = '10858') FORMAT Vertical;
```

结果：


```text
第 1 行:
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

第 2 行:
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

**另请参阅**

* [ZooKeeper](../../operations/tips.md#zookeeper)
* [ZooKeeper 指南](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html)
