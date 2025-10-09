---
'description': '允许从指定集群中的多个节点并行处理来自 HDFS 的文件。'
'sidebar_label': 'hdfsCluster'
'sidebar_position': 81
'slug': '/sql-reference/table-functions/hdfsCluster'
'title': 'hdfsCluster'
'doc_type': 'reference'
---


# hdfsCluster 表函数

允许从指定集群中的多个节点并行处理 HDFS 中的文件。在发起者上，它创建与集群中所有节点的连接，暴露 HDFS 文件路径中的星号，并动态分派每个文件。在工作节点上，它向发起者请求处理的下一个任务并进行处理。这个过程会重复，直到所有任务完成。

## 语法 {#syntax}

```sql
hdfsCluster(cluster_name, URI, format, structure)
```

## 参数 {#arguments}

| 参数            | 描述                                                                                                                                                                                                                                                                                          |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`  | 用于构建对远程和本地服务器的地址和连接参数集的集群名称。                                                                                                                                                                                                                                      |
| `URI`           | 指向文件或一系列文件的 URI。在只读模式下支持以下通配符：`*`, `**`, `?`, `{'abc','def'}` 和 `{N..M}`，其中 `N`、`M` 是数字，`abc`、`def` 是字符串。有关更多信息，请参见 [路径中的通配符](../../engines/table-engines/integrations/s3.md#wildcards-in-path)。                             |
| `format`        | 文件的 [格式](/sql-reference/formats)。                                                                                                                                                                                                                                                      |
| `structure`     | 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                |

## 返回值 {#returned_value}

一个具有指定结构的表，用于读取指定文件中的数据。

## 示例 {#examples}

1.  假设我们有一个名为 `cluster_simple` 的 ClickHouse 集群，以及以下 URI 的几个文件位于 HDFS 上：

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  查询这些文件的行数：

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  查询这两个目录中所有文件的行数：

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
如果文件列表中包含带前导零的数字范围，请为每个数字单独使用带括号的结构或使用 `?`。
:::

## 相关 {#related}

- [HDFS 引擎](../../engines/table-engines/integrations/hdfs.md)
- [HDFS 表函数](../../sql-reference/table-functions/hdfs.md)
