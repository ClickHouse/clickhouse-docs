---
description: 'ATTACH 语句文档'
sidebar_label: 'ATTACH'
sidebar_position: 40
slug: /sql-reference/statements/attach
title: 'ATTACH 语句'
doc_type: 'reference'
---

用于附加一张表或一个字典，例如在将数据库迁移到另一台服务器时使用。

**语法**

```sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

该查询不会在磁盘上创建任何数据，而是假定数据已经位于合适的位置，只是向服务器添加关于指定表、字典或数据库的信息。执行 `ATTACH` 查询后，服务器将获知该表、字典或数据库的存在。

如果某个表此前已被分离（通过 [DETACH](../../sql-reference/statements/detach.md) 查询），即其结构是已知的，则可以在不定义结构的情况下使用简写语法。

## 附加已有表 \\{#attach-existing-table\\}

**语法**

```sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

在启动服务器时会使用此查询。服务器将表的元数据存储为包含 `ATTACH` 语句的文件，并在启动时直接运行这些语句（部分系统表除外，这些系统表会在服务器上显式创建）。

如果表被永久分离，那么在服务器启动时它不会被重新附加，因此你需要显式执行 `ATTACH` 查询。

## 创建新表并附加数据 \\{#create-new-table-and-attach-data\\}

### 使用指定的表数据路径 \\{#with-specified-path-to-table-data\\}

该查询会按照提供的结构创建一个新表，并从 `user_files` 中指定的目录附加表数据。

**语法**

```sql
ATTACH TABLE name FROM 'path/to/data/' (col1 Type1, ...)
```

**示例**

查询：

```sql
DROP TABLE IF EXISTS test;
INSERT INTO TABLE FUNCTION file('01188_attach/test/data.TSV', 'TSV', 's String, n UInt8') VALUES ('test', 42);
ATTACH TABLE test FROM '01188_attach/test' (s String, n UInt8) ENGINE = File(TSV);
SELECT * FROM test;
```

结果：

```sql
┌─s────┬──n─┐
│ test │ 42 │
└──────┴────┘
```

### 使用指定的表 UUID \\{#with-specified-table-uuid\\}

此查询会根据提供的表结构创建一个新表，并将具有指定 UUID 的表中的数据附加到该表。
该功能由 [Atomic](../../engines/database-engines/atomic.md) 数据库引擎提供支持。

**语法**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```

## 将 MergeTree 表附加为 ReplicatedMergeTree \\{#attach-mergetree-table-as-replicatedmergetree\\}

允许将非复制的 MergeTree 表附加为 ReplicatedMergeTree。ReplicatedMergeTree 表将使用 `default_replica_path` 和 `default_replica_name` 设置的值创建。也可以将复制表附加为常规 MergeTree 表。

请注意，此查询不会影响 ZooKeeper 中该表的数据。这意味着在附加之后，必须使用 `SYSTEM RESTORE REPLICA` 向 ZooKeeper 中添加元数据，或者使用 `SYSTEM DROP REPLICA ... FROM ZKPATH ...` 将其清除。

如果你尝试为现有的 ReplicatedMergeTree 表添加副本，请注意，转换后的 MergeTree 表中的所有本地数据都会被分离（detached）。

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

获取该表在 ZooKeeper 中的路径和副本名称：

```sql
SELECT replica_name, zookeeper_path FROM system.replicas WHERE table='test';
```

结果：

```sql
┌─replica_name─┬─zookeeper_path─────────────────────────────────────────────┐
│ r1           │ /clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1 │
└──────────────┴────────────────────────────────────────────────────────────┘
```

将表附加为非复制表，并删除该副本在 ZooKeeper 中的数据：

```sql
DETACH TABLE test;
ATTACH TABLE test AS NOT REPLICATED;
SYSTEM DROP REPLICA 'r1' FROM ZKPATH '/clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1';
```

## 附加现有字典 \\{#attach-existing-dictionary\\}

将之前已分离的字典重新附加。

**语法**

```sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

## 附加现有数据库 \\{#attach-existing-database\\}

重新附加先前已分离的数据库。

**语法**

```sql
ATTACH DATABASE [IF NOT EXISTS] name [ENGINE=<database engine>] [ON CLUSTER cluster]
```
