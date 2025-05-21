---
'description': '启用在集群内多个节点上同时处理与指定路径匹配的文件。发起者与工作节点建立连接，扩展文件路径中的通配符，并将文件读取任务委派给工作节点。每个工作节点都在向发起者查询下一个要处理的文件，重复该过程直至完成所有任务（读取所有文件）。'
'sidebar_label': '文件集群'
'sidebar_position': 61
'slug': '/sql-reference/table-functions/fileCluster'
'title': 'fileCluster'
---




# fileCluster 表函数

使得在集群内的多个节点上同时处理匹配指定路径的文件成为可能。发起者与工作节点建立连接，展开文件路径中的通配符，并将文件读取任务委派给工作节点。每个工作节点向发起者查询下一个要处理的文件，重复此过程直到所有任务完成（所有文件均已读取）。

:::note    
只有当初始指定路径匹配的文件集合在所有节点上都相同，并且其内容在不同节点之间一致时，此函数才能正常工作。  
如果这些文件在节点之间有所不同，则返回值无法预先确定，且依赖于工作节点从发起者请求任务的顺序。
:::

## 语法 {#syntax}

```sql
fileCluster(cluster_name, path[, format, structure, compression_method])
```

## 参数 {#arguments}

| 参数                  | 描述                                                                                                                                                                                      |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`        | 用于建立与远程和本地服务器的地址和连接参数集合的集群名称。                                                                                                                                  |
| `path`                | 从 [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path) 到文件的相对路径。路径支持 [globs](#globs-in-path)。                                                        |
| `format`              | 文件的 [格式](/sql-reference/formats)。类型：[字符串](../../sql-reference/data-types/string.md)。                                                                                        |
| `structure`           | 表结构，格式为 `'UserID UInt64, Name String'`。确定列的名称和类型。类型：[字符串](../../sql-reference/data-types/string.md)。                                                               |
| `compression_method`  | 压缩方法。支持的压缩类型为 `gz`、`br`、`xz`、`zst`、`lz4` 和 `bz2`。                                                                                                                          |

## 返回值 {#returned_value}

具有指定格式和结构的表，数据来自匹配指定路径的文件。

**示例**

给定一个名为 `my_cluster` 的集群，以及以下 `user_files_path` 设置的值：

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
同时，假设每个集群节点的 `user_files_path` 中都有文件 `test1.csv` 和 `test2.csv`，并且它们在不同节点中的内容是相同的：
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

现在，通过 `fileCluster` 表函数读取 `test1.csv` 和 `test2.csv` 的数据内容：

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

FileCluster 支持 [File](../../sql-reference/table-functions/file.md#globs-in-path) 表函数支持的所有模式。

## 相关 {#related}

- [File 表函数](../../sql-reference/table-functions/file.md)
