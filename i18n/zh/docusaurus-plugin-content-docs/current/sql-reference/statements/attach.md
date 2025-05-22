将表或字典附加到数据库，例如在将数据库移动到另一台服务器时。

**语法**

```sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

该查询不会在磁盘上创建数据，而是假定数据已经在适当的位置，并仅将指定的表、字典或数据库的信息添加到服务器中。在执行 `ATTACH` 查询后，服务器将知道表、字典或数据库的存在。

如果之前已经分离了一个表（[DETACH](../../sql-reference/statements/detach.md) 查询），意味着其结构是已知的，则可以使用简写而无需定义结构。

## 附加现有表 {#attach-existing-table}

**语法**

```sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

该查询在服务器启动时使用。服务器将表元数据存储为文件，并以 `ATTACH` 查询的形式在启动时简单运行这些文件（系统表除外，系统表在服务器上显式创建）。

如果表被永久分离，则在服务器启动时不会重新附加，因此需要明确使用 `ATTACH` 查询。

## 创建新表并附加数据 {#create-new-table-and-attach-data}

### 指定表数据路径 {#with-specified-path-to-table-data}

该查询使用提供的结构创建一个新表，并附加来自 `user_files` 中提供目录的表数据。

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

### 指定表 UUID {#with-specified-table-uuid}

该查询使用提供的结构创建一个新表，并附加来自指定 UUID 的表的数据。
它由 [Atomic](../../engines/database-engines/atomic.md) 数据库引擎支持。

**语法**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```

## 将 MergeTree 表附加为 ReplicatedMergeTree {#attach-mergetree-table-as-replicatedmergetree}

允许将非复制的 MergeTree 表附加为 ReplicatedMergeTree。ReplicatedMergeTree 表将使用 `default_replica_path` 和 `default_replica_name` 设置的值创建。如果需要，也可以将复制表作为常规 MergeTree 附加。

请注意，此查询不会影响 ZooKeeper 中表的数据。这意味着您必须使用 `SYSTEM RESTORE REPLICA` 将元数据添加到 ZooKeeper，或在附加后使用 `SYSTEM DROP REPLICA ... FROM ZKPATH ...` 清除它。

如果您试图为现有的 ReplicatedMergeTree 表添加副本，请注意，转换后的 MergeTree 表中的所有本地数据将被分离。

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

获取表的 ZooKeeper 路径和副本名称：

```sql
SELECT replica_name, zookeeper_path FROM system.replicas WHERE table='test';
```
结果：
```sql
┌─replica_name─┬─zookeeper_path─────────────────────────────────────────────┐
│ r1           │ /clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1 │
└──────────────┴────────────────────────────────────────────────────────────┘
```
将表附加为非复制并删除 ZooKeeper 中副本的数据：
```sql
DETACH TABLE test;
ATTACH TABLE test AS NOT REPLICATED;
SYSTEM DROP REPLICA 'r1' FROM ZKPATH '/clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1';
```

## 附加现有字典 {#attach-existing-dictionary}

附加先前分离的字典。

**语法**

```sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

## 附加现有数据库 {#attach-existing-database}

附加先前分离的数据库。

**语法**

```sql
ATTACH DATABASE [IF NOT EXISTS] name [ENGINE=<database engine>] [ON CLUSTER cluster]
```
