---
'description': '一个扩展到 hudi 表函数的功能。允许在指定的集群中使用多个节点并行处理来自 Amazon S3 中 Apache Hudi 表的文件。'
'sidebar_label': 'hudiCluster'
'sidebar_position': 86
'slug': '/sql-reference/table-functions/hudiCluster'
'title': 'hudiCluster 表函数'
---




# hudiCluster 表函数

这是对[hudi](sql-reference/table-functions/hudi.md)表函数的扩展。

允许在指定集群中的多个节点上并行处理来自Apache [Hudi](https://hudi.apache.org/) 表的文件，存储在Amazon S3上。在发起者上，它创建与集群中所有节点的连接并动态分配每个文件。在工作节点上，它向发起者请求下一个要处理的任务并进行处理。重复此过程直到所有任务完成。

## 语法 {#syntax}

```sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 参数 {#arguments}

| 参数                                          | 描述                                                                                                                                                                                                                                                                                                                                                                    |
|-----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                                | 用于构建远程和本地服务器地址与连接参数集合的集群名称。                                                                                                                                                                                                                                                                                                               |
| `url`                                         | 存储在S3中现有Hudi表的桶URL和路径。                                                                                                                                                                                                                                                                                                                                  |
| `aws_access_key_id`, `aws_secret_access_key` | AWS（https://aws.amazon.com/）账户用户的长期凭证。您可以使用这些凭证来验证您的请求。这些参数是可选的。如果未指定凭证，则使用ClickHouse配置中的凭证。有关更多信息，请参见[使用S3进行数据存储](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)。                                           |
| `format`                                      | 文件的[格式](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                                  |
| `structure`                                   | 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                     |
| `compression`                                 | 此参数是可选的。支持的值：`none`，`gzip/gz`，`brotli/br`，`xz/LZMA`，`zstd/zst`。默认情况下，压缩将通过文件扩展名自动检测。                                                                                                                                                                                                                                     |

## 返回值 {#returned_value}

一个具有指定结构的表，用于从指定的Hudi表在S3中读取数据。

## 相关 {#related}

- [Hudi 引擎](engines/table-engines/integrations/hudi.md)
- [Hudi 表函数](sql-reference/table-functions/hudi.md)
