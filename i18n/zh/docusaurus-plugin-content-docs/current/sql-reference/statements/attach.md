---
description: 'ATTACH 语句文档'
sidebar_label: 'ATTACH'
sidebar_position: 40
slug: /sql-reference/statements/attach
title: 'ATTACH 语句'
doc_type: 'reference'
---

用于附加表或字典，例如在将数据库迁移到另一台服务器时使用。

**语法**

```sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

该查询不会在磁盘上创建任何数据，而是假定数据已经存放在相应位置，仅向服务器添加有关指定表、字典或数据库的信息。执行 `ATTACH` 查询后，服务器就会知晓该表、字典或数据库的存在。

如果某个表之前已被分离（[DETACH](../../sql-reference/statements/detach.md) 查询），即其结构已知，则可以在不重新定义结构的情况下使用简写形式。


## 附加现有表 {#attach-existing-table}

**语法**

```sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

此查询用于服务器启动时。服务器将表的元数据以包含 `ATTACH` 查询的文件形式存储,并在启动时直接执行这些查询(某些系统表除外,这些系统表会在服务器上显式创建)。

如果表被永久分离,服务器启动时不会自动重新附加,因此需要显式使用 `ATTACH` 查询。


## 创建新表并附加数据 {#create-new-table-and-attach-data}

### 指定表数据路径 {#with-specified-path-to-table-data}

该查询根据提供的结构创建新表,并从 `user_files` 中指定的目录附加表数据。

**语法**

```sql
ATTACH TABLE name FROM 'path/to/data/' (col1 Type1, ...)
```

**示例**

查询:

```sql
DROP TABLE IF EXISTS test;
INSERT INTO TABLE FUNCTION file('01188_attach/test/data.TSV', 'TSV', 's String, n UInt8') VALUES ('test', 42);
ATTACH TABLE test FROM '01188_attach/test' (s String, n UInt8) ENGINE = File(TSV);
SELECT * FROM test;
```

结果:

```sql
┌─s────┬──n─┐
│ test │ 42 │
└──────┴────┘
```

### 指定表 UUID {#with-specified-table-uuid}

该查询根据提供的结构创建新表,并附加具有指定 UUID 的表中的数据。
此功能由 [Atomic](../../engines/database-engines/atomic.md) 数据库引擎支持。

**语法**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```


## 将 MergeTree 表附加为 ReplicatedMergeTree {#attach-mergetree-table-as-replicatedmergetree}

允许将非复制的 MergeTree 表附加为 ReplicatedMergeTree。ReplicatedMergeTree 表将使用 `default_replica_path` 和 `default_replica_name` 设置的值创建。也可以将复制表附加为常规 MergeTree。

请注意,此查询不会影响 ZooKeeper 中的表数据。这意味着在附加后,您必须使用 `SYSTEM RESTORE REPLICA` 在 ZooKeeper 中添加元数据,或使用 `SYSTEM DROP REPLICA ... FROM ZKPATH ...` 清除元数据。

如果您尝试向现有的 ReplicatedMergeTree 表添加副本,请注意,转换后的 MergeTree 表中的所有本地数据都将被分离。

**语法**

```sql
ATTACH TABLE [db.]name AS [NOT] REPLICATED
```

**将表转换为复制表**

```sql
DETACH TABLE test;
ATTACH TABLE test AS REPLICATED;
SYSTEM RESTORE REPLICA test;
```

**将表转换为非复制表**

获取表的 ZooKeeper 路径和副本名称:

```sql
SELECT replica_name, zookeeper_path FROM system.replicas WHERE table='test';
```

结果:

```sql
┌─replica_name─┬─zookeeper_path─────────────────────────────────────────────┐
│ r1           │ /clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1 │
└──────────────┴────────────────────────────────────────────────────────────┘
```

将表附加为非复制表并从 ZooKeeper 中删除副本数据:

```sql
DETACH TABLE test;
ATTACH TABLE test AS NOT REPLICATED;
SYSTEM DROP REPLICA 'r1' FROM ZKPATH '/clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1';
```


## 附加现有字典 {#attach-existing-dictionary}

附加先前已分离的字典。

**语法**

```sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```


## 附加现有数据库 {#attach-existing-database}

附加先前已分离的数据库。

**语法**

```sql
ATTACH DATABASE [IF NOT EXISTS] name [ENGINE=<database engine>] [ON CLUSTER cluster]
```
