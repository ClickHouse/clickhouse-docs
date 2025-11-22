---
description: '在集群内的多个节点上，并行处理与指定路径匹配的文件。发起节点会与工作节点建立连接，展开文件路径中的通配符模式，并将读文件任务分派给各个工作节点。每个工作节点都会向发起节点请求下一个要处理的文件，如此反复，直到所有任务完成（所有文件均已读取）。'
sidebar_label: 'fileCluster'
sidebar_position: 61
slug: /sql-reference/table-functions/fileCluster
title: 'fileCluster'
doc_type: 'reference'
---



# fileCluster 表函数

允许在集群中的多个节点上同时处理与指定路径匹配的文件。发起节点会与工作节点建立连接，展开文件路径中的通配符，并将读文件任务分派给各个工作节点。每个工作节点都会向发起节点请求下一个要处理的文件，并重复这一过程，直到所有任务完成（所有文件都被读取）。

:::note    
只有当所有节点上与初始指定路径匹配的文件集合完全相同，且这些文件在各个节点上的内容保持一致时，此函数才能_正确_运行。  
如果这些文件在不同节点之间存在差异，则返回值将无法预先确定，并取决于各个工作节点向发起节点请求任务的顺序。
:::



## 语法 {#syntax}

```sql
fileCluster(cluster_name, path[, format, structure, compression_method])
```


## 参数 {#arguments}

| 参数             | 描述                                                                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster_name`       | 集群名称,用于构建远程和本地服务器的地址集和连接参数。                                                                  |
| `path`               | 文件相对于 [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path) 的相对路径。文件路径还支持[通配符](#globs-in-path)。 |
| `format`             | 文件的[格式](/sql-reference/formats)。类型:[String](../../sql-reference/data-types/string.md)。                                                                           |
| `structure`          | 表结构,格式为 `'UserID UInt64, Name String'`。用于确定列名和类型。类型:[String](../../sql-reference/data-types/string.md)。                             |
| `compression_method` | 压缩方法。支持的压缩类型包括 `gz`、`br`、`xz`、`zst`、`lz4` 和 `bz2`。                                                                                     |


## 返回值 {#returned_value}

返回一个具有指定格式和结构的表,其数据来自匹配指定路径的文件。

**示例**

假设有一个名为 `my_cluster` 的集群,且 `user_files_path` 配置项的值如下:

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

同时,假设每个集群节点的 `user_files_path` 目录中都存在 `test1.csv` 和 `test2.csv` 文件,且这些文件在不同节点上的内容完全相同:

```bash
$ cat /var/lib/clickhouse/user_files/test1.csv
    1,"file1"
    11,"file11"

$ cat /var/lib/clickhouse/user_files/test2.csv
    2,"file2"
    22,"file22"
```

例如,可以在每个集群节点上执行以下两个查询来创建这些文件:

```sql
INSERT INTO TABLE FUNCTION file('file1.csv', 'CSV', 'i UInt32, s String') VALUES (1,'file1'), (11,'file11');
INSERT INTO TABLE FUNCTION file('file2.csv', 'CSV', 'i UInt32, s String') VALUES (2,'file2'), (22,'file22');
```

现在,通过 `fileCluster` 表函数读取 `test1.csv` 和 `test2.csv` 的数据内容:

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


## 相关内容 {#related}

- [File 表函数](../../sql-reference/table-functions/file.md)
