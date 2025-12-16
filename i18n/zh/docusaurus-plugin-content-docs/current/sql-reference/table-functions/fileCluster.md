---
description: '在集群中的多个节点上同时处理匹配指定路径的文件。发起节点会与工作节点建立连接，展开文件路径中的 glob 模式，并将文件读取任务委派给各工作节点。每个工作节点都会向发起节点请求下一个要处理的文件，如此循环，直到所有任务完成（所有文件都被读取）。'
sidebar_label: 'fileCluster'
sidebar_position: 61
slug: /sql-reference/table-functions/fileCluster
title: 'fileCluster'
doc_type: 'reference'
---

# fileCluster 表函数 {#filecluster-table-function}

允许在集群中的多个节点上并行处理与指定路径匹配的文件。发起节点会与工作节点建立连接，展开文件路径中的通配符（globs），并将读文件任务分派给各个工作节点。每个工作节点都会向发起节点请求下一个要处理的文件，如此循环，直到所有任务完成（所有文件都被读取）。

:::note    
仅当所有节点上与最初指定路径匹配的文件集合完全相同，且这些文件的内容在不同节点之间保持一致时，该函数才能_正确_运行。  
如果这些文件在不同节点之间存在差异，则返回值无法预先确定，并且取决于各工作节点向发起节点请求任务的先后顺序。
:::

## 语法 {#syntax}

```sql
fileCluster(cluster_name, path[, format, structure, compression_method])
```

## 参数 {#arguments}

| 参数                 | 说明                                                                                                                                                                               |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`       | 用于构建到远程和本地服务器的一组地址和连接参数的集群名称。                                                                                                                         |
| `path`               | 从 [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path) 开始的文件相对路径。文件路径同样支持使用 [globs](#globs-in-path)。                  |
| `format`             | 文件的[格式](/sql-reference/formats)。类型：[String](../../sql-reference/data-types/string.md)。                                                                                  |
| `structure`          | 以 `'UserID UInt64, Name String'` 形式指定的表结构。用于确定列名和类型。类型：[String](../../sql-reference/data-types/string.md)。                                               |
| `compression_method` | 压缩方法。支持的压缩类型包括 `gz`、`br`、`xz`、`zst`、`lz4` 和 `bz2`。                                                                                                             |

## 返回值 {#returned_value}

具有指定格式和结构，并包含来自匹配指定路径的文件的数据的表。

**示例**

假设集群名为 `my_cluster`，并且设置 `user_files_path` 的值如下：

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

此外，假设在每个集群节点的 `user_files_path` 目录下都有 `test1.csv` 和 `test2.csv` 文件，并且各节点上的文件内容完全相同：

```bash
$ cat /var/lib/clickhouse/user_files/test1.csv
    1,"file1"
    11,"file11"

$ cat /var/lib/clickhouse/user_files/test2.csv
    2,"file2"
    22,"file22"
```

例如，可以在集群的每个节点上执行以下两个查询来创建这些文件：

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

FileCluster 同样支持 [File](../../sql-reference/table-functions/file.md#globs-in-path) 表函数所支持的所有模式。

## 相关 {#related}

- [file 表函数](../../sql-reference/table-functions/file.md)
