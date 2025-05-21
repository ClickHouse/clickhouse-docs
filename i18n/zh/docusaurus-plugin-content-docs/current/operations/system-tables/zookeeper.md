---
'description': 'System table which exists only if ClickHouse Keeper or ZooKeeper are
  configured.'
'keywords':
- 'system table'
- 'zookeeper'
'slug': '/operations/system-tables/zookeeper'
'title': 'system.zookeeper'
---




# system.zookeeper

除非配置了 ClickHouse Keeper 或 ZooKeeper，否则表不存在。`system.zookeeper` 表展示了配置中定义的 Keeper 集群的数据。
查询必须在 `WHERE` 子句中具有 `'path ='` 条件或 `path IN` 条件，如下所示。这对应于您想获取数据的子节点的路径。

查询 `SELECT * FROM system.zookeeper WHERE path = '/clickhouse'` 输出 `/clickhouse` 节点下所有子节点的数据。
要输出所有根节点的数据，请写 `path = '/'`。
如果在 'path' 中指定的路径不存在，将抛出异常。

查询 `SELECT * FROM system.zookeeper WHERE path IN ('/', '/clickhouse')` 输出 `/` 和 `/clickhouse` 节点下所有子节点的数据。
如果指定的 'path' 集合中存在不存在的路径，将抛出异常。
可以用于批量进行 Keeper 路径查询。

列：

- `name` (String) — 节点的名称。
- `path` (String) — 节点的路径。
- `value` (String) — 节点值。
- `dataLength` (Int32) — 值的大小。
- `numChildren` (Int32) — 后代的数量。
- `czxid` (Int64) — 创建节点的事务 ID。
- `mzxid` (Int64) — 最后更改节点的事务 ID。
- `pzxid` (Int64) — 最后删除或添加后代的事务 ID。
- `ctime` (DateTime) — 节点创建时间。
- `mtime` (DateTime) — 节点最后修改时间。
- `version` (Int32) — 节点版本：节点被更改的次数。
- `cversion` (Int32) — 添加或移除后代的数量。
- `aversion` (Int32) — ACL 变更的次数。
- `ephemeralOwner` (Int64) — 对于临时节点，拥有此节点的会话 ID。

示例：

```sql
SELECT *
FROM system.zookeeper
WHERE path = '/clickhouse/tables/01-08/visits/replicas'
FORMAT Vertical
```

```text
Row 1:
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

Row 2:
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
