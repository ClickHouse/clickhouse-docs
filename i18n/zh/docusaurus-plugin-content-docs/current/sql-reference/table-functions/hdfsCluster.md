---
description: '允许在指定集群的多个节点上并行处理来自 HDFS 的文件。'
sidebar_label: 'hdfsCluster'
sidebar_position: 81
slug: /sql-reference/table-functions/hdfsCluster
title: 'hdfsCluster'
doc_type: 'reference'
---

# hdfsCluster 表函数 \{#hdfscluster-table-function\}

允许在指定集群的多个节点上并行处理来自 HDFS 的文件。在发起节点上，它会与集群中所有节点建立连接，展开 HDFS 文件路径中的星号通配符，并动态分派每个文件。在工作节点上，它会向发起节点请求下一个要处理的任务并对其进行处理。该过程会重复进行，直到所有任务都完成。

## 语法 \{#syntax\}

```sql
hdfsCluster(cluster_name, URI, format, structure)
```

## 参数 \{#arguments\}

| Argument       | Description                                                                                                                                                                                                                                                                                      |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name` | 用于构建到远程和本地服务器的一组地址和连接参数的集群名称。                                                                                                                                                                                                                                      |
| `URI`          | 指向单个文件或一组文件的 URI。只读模式下支持以下通配符：`*`、`**`、`?`、`{'abc','def'}` 和 `{N..M}`，其中 `N`、`M` 为数字，`abc`、`def` 为字符串。更多信息参见 [路径中的通配符](../../engines/table-engines/integrations/s3.md#wildcards-in-path)。 |
| `format`       | 文件的[格式](/sql-reference/formats)。                                                                                                                                                                                                                                                          |
| `structure`    | 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                |

## 返回值 \{#returned_value\}

具有指定结构的表，用于从指定文件中读取数据。

## 示例 \{#examples\}

1. 假设我们有一个名为 `cluster_simple` 的 ClickHouse 集群，并且在 HDFS 上有若干文件，其 URI 如下：

* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;1&#39;
* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;2&#39;
* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;3&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;1&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;2&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;3&#39;

2. 查询这些文件中的行数：

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3. 查询这两个目录中所有文件的总行数：

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
如果文件列表中包含带前导零的数字范围，请分别为每一位数字使用花括号语法，或使用 `?`。
:::

## 相关内容 \{#related\}

- [HDFS 引擎](../../engines/table-engines/integrations/hdfs.md)
- [HDFS 表函数](../../sql-reference/table-functions/hdfs.md)
