---
slug: /sql-reference/table-functions/hdfsCluster
sidebar_position: 81
sidebar_label: hdfsCluster
title: 'hdfsCluster'
description: '允许从指定集群的多个节点并行处理 HDFS 中的文件。'
---


# hdfsCluster 表函数

允许从指定集群的多个节点并行处理 HDFS 中的文件。在发起者上，它创建到集群中所有节点的连接，公开 HDFS 文件路径中的星号，并动态调度每个文件。在工作节点上，它向发起者请求下一个任务并进行处理。这个过程会重复，直到所有任务完成。

**语法**

``` sql
hdfsCluster(cluster_name, URI, format, structure)
```

**参数**

- `cluster_name` — 用于建立到远程和本地服务器的一组地址和连接参数的集群名称。
- `URI` — 文件或一组文件的 URI。支持在只读模式下使用以下通配符： `*`, `**`, `?`, `{'abc','def'}` 以及 `{N..M}`，其中 `N`, `M` — 数字，`abc`, `def` — 字符串。有关更多信息，请参见 [路径中的通配符](../../engines/table-engines/integrations/s3.md#wildcards-in-path)。
- `format` — 文件的 [格式](/sql-reference/formats)。
- `structure` — 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。

**返回值**

一个按指定结构读取指定文件中的数据的表。

**示例**

1.  假设我们有一个名为 `cluster_simple` 的 ClickHouse 集群，以及在 HDFS 上具有以下 URI 的几个文件：

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  查询这些文件中的行数：

``` sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  查询这两个目录中所有文件的行数：

``` sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
如果你的文件列表包含有前导零的数字范围，请分别为每个数字使用大括号构造，或使用 `?`。
:::

**另请参见**

- [HDFS 引擎](../../engines/table-engines/integrations/hdfs.md)
- [HDFS 表函数](../../sql-reference/table-functions/hdfs.md)
