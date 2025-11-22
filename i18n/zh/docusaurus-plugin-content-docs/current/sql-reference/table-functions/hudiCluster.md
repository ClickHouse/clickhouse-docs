---
description: 'hudi 表函数的扩展。用于在指定集群中利用多个节点并行处理位于 Amazon S3 上的 Apache Hudi 表中的文件。'
sidebar_label: 'hudiCluster'
sidebar_position: 86
slug: /sql-reference/table-functions/hudiCluster
title: 'hudiCluster 表函数'
doc_type: 'reference'
---



# hudiCluster 表函数

这是对 [hudi](sql-reference/table-functions/hudi.md) 表函数的扩展。

允许在指定集群中的多个节点上并行处理 Amazon S3 中 Apache [Hudi](https://hudi.apache.org/) 表的文件。在发起节点上，它会与集群中所有节点建立连接，并动态分发每个文件。在工作节点上，它会向发起节点请求下一个要处理的任务并对其进行处理。该过程会重复执行，直到所有任务完成为止。



## 语法 {#syntax}

```sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```


## 参数 {#arguments}

| 参数                                     | 描述                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cluster_name`                               | 集群名称,用于构建远程和本地服务器的地址集合及连接参数。                                                                                                                                                                                                                                    |
| `url`                                        | 存储桶 URL,包含 S3 中现有 Hudi 表的路径。                                                                                                                                                                                                                                                                                            |
| `aws_access_key_id`, `aws_secret_access_key` | [AWS](https://aws.amazon.com/) 账户用户的长期凭证。可用于验证请求。这些参数为可选参数。如果未指定凭证,将使用 ClickHouse 配置中的凭证。更多信息请参阅[使用 S3 进行数据存储](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)。 |
| `format`                                     | 文件的[格式](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                                       |
| `structure`                                  | 表结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                        |
| `compression`                                | 可选参数。支持的值:`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下,将根据文件扩展名自动检测压缩方式。                                                                                                                                                                                                                  |


## 返回值 {#returned_value}

返回一个具有指定结构的表,用于从 S3 中指定的 Hudi 表读取集群数据。


## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型:`LowCardinality(String)`。
- `_file` — 文件名称。类型:`LowCardinality(String)`。
- `_size` — 文件大小(以字节为单位)。类型:`Nullable(UInt64)`。如果文件大小未知,则值为 `NULL`。
- `_time` — 文件最后修改时间。类型:`Nullable(DateTime)`。如果时间未知,则值为 `NULL`。
- `_etag` — 文件的 ETag。类型:`LowCardinality(String)`。如果 ETag 未知,则值为 `NULL`。


## 相关内容 {#related}

- [Hudi 引擎](engines/table-engines/integrations/hudi.md)
- [Hudi 表函数](sql-reference/table-functions/hudi.md)
