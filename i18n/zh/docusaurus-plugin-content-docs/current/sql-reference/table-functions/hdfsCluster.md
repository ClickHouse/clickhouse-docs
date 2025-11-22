---
description: '允许在指定集群中的多个节点上并行处理来自 HDFS 的文件。'
sidebar_label: 'hdfsCluster'
sidebar_position: 81
slug: /sql-reference/table-functions/hdfsCluster
title: 'hdfsCluster'
doc_type: 'reference'
---



# hdfsCluster 表函数

允许在指定集群的多个节点上并行处理来自 HDFS 的文件。在发起节点上，它会与集群中所有节点建立连接，展开 HDFS 文件路径中的 `*` 通配符，并动态分发每个文件。在工作节点上，它会向发起节点请求下一个待处理任务并对其进行处理。这个过程会反复执行，直到所有任务都完成为止。



## 语法 {#syntax}

```sql
hdfsCluster(cluster_name, URI, format, structure)
```


## 参数 {#arguments}

| 参数       | 描述                                                                                                                                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cluster_name` | 集群名称,用于构建远程和本地服务器的地址集及连接参数。                                                                                                                                                                                |
| `URI`          | 文件或文件集的 URI。在只读模式下支持以下通配符:`*`、`**`、`?`、`{'abc','def'}` 和 `{N..M}`,其中 `N`、`M` 为数字,`abc`、`def` 为字符串。更多信息请参阅[路径中的通配符](../../engines/table-engines/integrations/s3.md#wildcards-in-path)。 |
| `format`       | 文件的[格式](/sql-reference/formats)。                                                                                                                                                                                                                                                |
| `structure`    | 表结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                    |


## 返回值 {#returned_value}

返回一个具有指定结构的表，用于读取指定文件中的数据。


## 示例 {#examples}

1.  假设我们有一个名为 `cluster_simple` 的 ClickHouse 集群,以及 HDFS 上具有以下 URI 的多个文件:

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  查询这些文件中的行数:

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  查询这两个目录中所有文件的行数:

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
如果文件列表中包含带前导零的数字范围,请对每个数字分别使用大括号构造,或使用 `?`。
:::


## 相关内容 {#related}

- [HDFS 引擎](../../engines/table-engines/integrations/hdfs.md)
- [HDFS 表函数](../../sql-reference/table-functions/hdfs.md)
