---
description: '仅在配置了 ClickHouse Keeper 或 ZooKeeper 时存在的系统表。它提供对配置中定义的 Keeper 集群数据的访问。'
keywords: ['系统表', 'zookeeper']
slug: /operations/system-tables/zookeeper
title: 'system.zookeeper'
doc_type: 'reference'
---

# system.zookeeper

除非配置了 ClickHouse Keeper 或 ZooKeeper，否则该表不会存在。`system.zookeeper` 表提供对配置中定义的 Keeper 集群数据的访问。
查询必须在 `WHERE` 子句中设置 `path =` 条件或 `path IN` 条件，如下所示。这表示你希望获取其子节点数据的路径。

查询 `SELECT * FROM system.zookeeper WHERE path = '/clickhouse'` 会输出 `/clickhouse` 节点下所有子节点的数据。
要输出所有根节点的数据，请写 `path = '/'`。
如果在 &#39;path&#39; 中指定的路径不存在，将抛出异常。

查询 `SELECT * FROM system.zookeeper WHERE path IN ('/', '/clickhouse')` 会输出 `/` 和 `/clickhouse` 节点下所有子节点的数据。
如果在指定的 &#39;path&#39; 集合中存在不存在的路径，将抛出异常。
它可用于批量执行多个 Keeper 路径查询。

查询 `SELECT * FROM system.zookeeper WHERE path = '/clickhouse' AND zookeeperName = 'auxiliary_cluster'` 会输出 `auxiliary_cluster` ZooKeeper 集群中的数据。
如果指定的 &#39;auxiliary&#95;cluster&#39; 不存在，将抛出异常。

Columns:

* `name` (String) — 节点名称。
* `path` (String) — 节点路径。
* `value` (String) — 节点值。
* `zookeeperName` (String) — 默认 ZooKeeper 集群或某个辅助 ZooKeeper 集群的名称。
* `dataLength` (Int32) — 值的大小。
* `numChildren` (Int32) — 子节点数量。
* `czxid` (Int64) — 创建该节点的事务 ID。
* `mzxid` (Int64) — 最后修改该节点的事务 ID。
* `pzxid` (Int64) — 最后删除或添加子节点的事务 ID。
* `ctime` (DateTime) — 节点创建时间。
* `mtime` (DateTime) — 节点最后一次修改时间。
* `version` (Int32) — 节点版本：节点被修改的次数。
* `cversion` (Int32) — 添加或删除子节点的次数。
* `aversion` (Int32) — ACL 被修改的次数。
* `ephemeralOwner` (Int64) — 对于临时节点，拥有该节点的会话 ID。

Example:

```sql
SELECT *
FROM system.zookeeper
WHERE path = '/clickhouse/tables/01-08/visits/replicas'
FORMAT Vertical
```

```text
第 1 行:
──────
name:           example01-08-1
value:
czxid:          932998691229
mzxid:          932998691229
ctime:          2015-03-27 16:49:51
mtime:          2015-03-27 16:49:51
version:        0
cversion:       47
aversion:       0
ephemeralOwner: 0
dataLength:     0
numChildren:    7
pzxid:          987021031383
path:           /clickhouse/tables/01-08/visits/replicas

第 2 行:
──────
name:           example01-08-2
value:
czxid:          933002738135
mzxid:          933002738135
ctime:          2015-03-27 16:57:01
mtime:          2015-03-27 16:57:01
version:        0
cversion:       37
aversion:       0
ephemeralOwner: 0
dataLength:     0
numChildren:    7
pzxid:          987021252247
path:           /clickhouse/tables/01-08/visits/replicas
```
