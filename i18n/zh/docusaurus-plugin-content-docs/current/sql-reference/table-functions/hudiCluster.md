---
'description': '对 hudi 表函数的扩展。允许在指定集群中的多个节点上并行处理来自 Apache Hudi 表的文件。'
'sidebar_label': 'hudiCluster'
'sidebar_position': 86
'slug': '/sql-reference/table-functions/hudiCluster'
'title': 'hudiCluster 表函数'
'doc_type': 'reference'
---


# hudiCluster 表函数

这是对 [hudi](sql-reference/table-functions/hudi.md) 表函数的扩展。

允许在指定集群中的多个节点上并行处理存储在 Amazon S3 中的 Apache [Hudi](https://hudi.apache.org/) 表中的文件。在发起器上，它会创建与集群中所有节点的连接，并动态调度每个文件。在工作节点上，它会询问发起器下一个要处理的任务，并处理它。此过程会重复，直到所有任务完成。

## 语法 {#syntax}

```sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 参数 {#arguments}

| 参数                                         | 描述                                                                                                                                                                                                                                                                                                                                                                 |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                               | 用于构建用于连接远程和本地服务器的一组地址和连接参数的集群名称。                                                                                                                                                                                                                                                                                                       |
| `url`                                        | 存储在 S3 中的现有 Hudi 表的存储桶 URL。                                                                                                                                                                                                                                                                                                                                |
| `aws_access_key_id`, `aws_secret_access_key` | 用于 [AWS](https://aws.amazon.com/) 账户用户的长期凭证。您可以使用这些凭证来验证您的请求。这些参数是可选的。如果未指定凭证，则将使用 ClickHouse 配置中的凭证。有关更多信息，请参见 [使用 S3 进行数据存储](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)。                                               |
| `format`                                     | 文件的 [格式](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                               |
| `structure`                                  | 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                    |
| `compression`                                | 参数是可选的。支持的值：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下，压缩将通过文件扩展名自动检测。                                                                                                                                                                                                                                                    |

## 返回值 {#returned_value}

返回一个具有指定结构的表，以从 S3 中指定的 Hudi 表读取数据。

## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名称。类型：`LowCardinality(String)`。
- `_size` — 文件大小（以字节为单位）。类型：`Nullable(UInt64)`。如果文件大小未知，则值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为 `NULL`。
- `_etag` — 文件的 etag。类型：`LowCardinality(String)`。如果 etag 未知，则值为 `NULL`。

## 相关 {#related}

- [Hudi 引擎](engines/table-engines/integrations/hudi.md)
- [Hudi 表函数](sql-reference/table-functions/hudi.md)
