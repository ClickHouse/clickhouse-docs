---
description: '包含发送到 ZooKeeper 服务器的请求参数及其响应参数信息的系统表。'
keywords: ['system table', 'zookeeper_log']
slug: /operations/system-tables/zookeeper_log
title: 'system.zookeeper_log'
doc_type: 'reference'
---

# system.zookeeper&#95;log \\{#systemzookeeper&#95;log\\}

该表包含向 ZooKeeper 服务器发起请求时的参数以及服务器响应相关的信息。

对于请求，只会填充包含请求参数的列，其余列填充默认值（`0` 或 `NULL`）。当收到响应时，会将响应中的数据补充到其他列中。

包含请求参数的列：

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器主机名。
* `type` ([Enum](../../sql-reference/data-types/enum.md)) — ZooKeeper 客户端中的事件类型。可以具有以下值之一：
  * `Request` — 请求已发送。
  * `Response` — 已接收到响应。
  * `Finalize` — 连接丢失，未接收到响应。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件发生的日期。
* `event_time` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 事件发生的日期和时间。
* `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 用于发起请求的 ZooKeeper 服务器的 IP 地址。
* `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 用于发起请求的 ZooKeeper 服务器端口。
* `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 服务器为每个连接设置的会话 ID。
* `xid` ([Int32](../../sql-reference/data-types/int-uint.md)) — 会话内请求的 ID。通常是按顺序递增的请求编号。对于请求行以及与之配对的 `response`/`finalize` 行，该值相同。
* `has_watch` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 请求是否设置了 [watch](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#ch_zkWatches)。
* `op_num` ([Enum](../../sql-reference/data-types/enum.md)) — 请求或响应的类型。
* `path` ([String](../../sql-reference/data-types/string.md)) — 请求中指定的 ZooKeeper 节点路径；如果请求不需要指定路径，则为空字符串。
* `data` ([String](../../sql-reference/data-types/string.md)) — 写入 ZooKeeper 节点的数据（对于 `SET` 和 `CREATE` 请求 — 请求要写入的内容；对于 `GET` 请求的响应 — 实际读取到的内容），或为空字符串。
* `is_ephemeral` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 节点是否被创建为 [ephemeral](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Ephemeral+Nodes) 节点。
* `is_sequential` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 节点是否被创建为 [sequential](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Sequence+Nodes+--+Unique+Naming) 节点。
* `version` ([Nullable(Int32)](../../sql-reference/data-types/nullable.md)) — 请求在执行时期望的 ZooKeeper 节点版本。适用于 `CHECK`、`SET`、`REMOVE` 请求（如果请求不检查版本，则该字段为特殊值 `-1`；对于不支持版本检查的其他请求则为 `NULL`）。
* `requests_size` ([UInt32](../../sql-reference/data-types/int-uint.md)) — multi 请求中包含的请求数量（这是一种特殊请求，由若干个连续的普通请求组成，并以原子方式执行它们）。multi 请求中包含的所有请求都具有相同的 `xid`。
* `request_idx` ([UInt32](../../sql-reference/data-types/int-uint.md)) — multi 请求中某个子请求的序号（对 multi 请求本身为 `0`，随后子请求从 `1` 开始依次递增）。

包含请求响应参数的列：

* `zxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 事务 ID。由 ZooKeeper 服务器在成功执行请求后发出的序列号（如果请求未执行/返回错误/客户端不知道请求是否已执行，则为 `0`）。
* `error` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — 错误代码。可能取多个值，这里仅列出部分：
  * `ZOK` — 请求执行成功。
  * `ZCONNECTIONLOSS` — 连接丢失。
  * `ZOPERATIONTIMEOUT` — 请求执行超时。
  * `ZSESSIONEXPIRED` — 会话已过期。
  * `NULL` — 请求已完成。
* `watch_type` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch` 事件的类型（对于 `op_num` = `Watch` 的响应），其他响应中为 `NULL`。
* `watch_state` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch` 事件的状态（对于 `op_num` = `Watch` 的响应），其他响应中为 `NULL`。
* `path_created` ([String](../../sql-reference/data-types/string.md)) — 已创建 ZooKeeper 节点的路径（针对 `CREATE` 请求的响应），如果节点以 `sequential` 方式创建，则可能与 `path` 不同。
* `stat_czxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 导致创建此 ZooKeeper 节点的变更的 `zxid`。
* `stat_mzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 最近一次修改此 ZooKeeper 节点的变更的 `zxid`。
* `stat_pzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 最近一次修改此 ZooKeeper 节点子节点的变更的事务 ID。
* `stat_version` ([Int32](../../sql-reference/data-types/int-uint.md)) — 针对此 ZooKeeper 节点数据进行的变更次数。
* `stat_cversion` ([Int32](../../sql-reference/data-types/int-uint.md)) — 针对此 ZooKeeper 节点子节点进行的变更次数。
* `stat_dataLength` ([Int32](../../sql-reference/data-types/int-uint.md)) — 此 ZooKeeper 节点数据字段的长度。
* `stat_numChildren` ([Int32](../../sql-reference/data-types/int-uint.md)) — 此 ZooKeeper 节点的子节点数量。
* `children` ([Array(String)](../../sql-reference/data-types/array.md)) — 子 ZooKeeper 节点列表（针对 `LIST` 请求的响应）。

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

**另请参阅**

* [ZooKeeper](../../operations/tips.md#zookeeper)
* [ZooKeeper 指南](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html)
