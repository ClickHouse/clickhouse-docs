
# fileCluster 表函数

启用在集群中多个节点上同时处理匹配指定路径的文件。发起者与工作节点建立连接，扩展文件路径中的通配符，并将文件读取任务委托给工作节点。每个工作节点都在向发起者查询下一个要处理的文件，重复此过程直至所有任务完成（所有文件被读取）。

:::note    
此函数仅在所有节点上匹配最初指定路径的文件集相同，且其内容在不同节点之间一致的情况下才能 _正常_ 运作。  
如果这些文件在节点之间存在差异，则返回值无法预先确定，取决于工作节点从发起者请求任务的顺序。
:::

## 语法 {#syntax}

```sql
fileCluster(cluster_name, path[, format, structure, compression_method])
```

## 参数 {#arguments}

| 参数                   | 描述                                                                                                                                                                        |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`         | 用于建立与远程和本地服务器的地址和连接参数集的集群名称。                                                                                                                  |
| `path`                 | 从 [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path) 访问文件的相对路径。文件路径也支持 [globs](#globs-in-path)。                |
| `format`               | 文件的 [格式](/sql-reference/formats)。类型： [String](../../sql-reference/data-types/string.md)。                                                                          |
| `structure`            | 表结构格式为 `'UserID UInt64, Name String'`。确定列的名称和类型。类型： [String](../../sql-reference/data-types/string.md)。                                            |
| `compression_method`   | 压缩方法。支持的压缩类型有 `gz`、`br`、`xz`、`zst`、`lz4` 和 `bz2`。                                                                                                     |

## 返回值 {#returned_value}

一个具有指定格式和结构的表，包含匹配指定路径的文件中的数据。

**示例**

假设一个名为 `my_cluster` 的集群，以及以下 `user_files_path` 的设置值：

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
此外，假设每个集群节点的 `user_files_path` 中有文件 `test1.csv` 和 `test2.csv`，且其内容在不同节点之间是一致的：
```bash
$ cat /var/lib/clickhouse/user_files/test1.csv
    1,"file1"
    11,"file11"

$ cat /var/lib/clickhouse/user_files/test2.csv
    2,"file2"
    22,"file22"
```

例如，可以通过在每个集群节点上执行以下两个查询来创建这些文件：
```sql
INSERT INTO TABLE FUNCTION file('file1.csv', 'CSV', 'i UInt32, s String') VALUES (1,'file1'), (11,'file11');
INSERT INTO TABLE FUNCTION file('file2.csv', 'CSV', 'i UInt32, s String') VALUES (2,'file2'), (22,'file22');
```

现在，利用 `fileCluster` 表函数读取 `test1.csv` 和 `test2.csv` 的数据内容：

```sql
SELECT * FROM fileCluster('my_cluster', 'file{1,2}.csv', 'CSV', 'i UInt32, s String') ORDER BY i, s
```

```response
┌──i─┬─s──────┐
│  1 │ file1  │
│ 11 │ file11 │
└────┴────────┘
┌──i─┬─s──────┐
│  2 │ file2  │
│ 22 │ file22 │
└────┴────────┘
```

## 路径中的通配符 {#globs-in-path}

所有由 [File](../../sql-reference/table-functions/file.md#globs-in-path) 表函数支持的模式都被 FileCluster 支持。

## 相关 {#related}

- [File 表函数](../../sql-reference/table-functions/file.md)
