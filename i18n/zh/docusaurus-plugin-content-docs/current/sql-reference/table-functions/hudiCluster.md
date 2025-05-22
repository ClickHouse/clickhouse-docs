
# hudiCluster 表函数

这是对[hudi](sql-reference/table-functions/hudi.md)表函数的扩展。

该函数允许在指定集群中的多个节点上并行处理存储在Amazon S3中的Apache [Hudi](https://hudi.apache.org/) 表的文件。在发起者上，它创建与集群中所有节点的连接并动态分配每个文件。在工作节点上，它向发起者请求下一个要处理的任务并进行处理。这个过程一直重复，直到所有任务完成。

## 语法 {#syntax}

```sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 参数 {#arguments}

| 参数                                            | 描述                                                                                                                                                                                                                                                                                                                                                                            |
|-------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                                  | 用于构建一组远程和本地服务器的地址和连接参数的集群名称。                                                                                                                                                                                                                                                                                                                             |
| `url`                                           | 包含现有Hudi表路径的存储桶url。在S3中。                                                                                                                                                                                                                                                                                                                                               |
| `aws_access_key_id`, `aws_secret_access_key`  | [AWS](https://aws.amazon.com/)帐户用户的长期凭据。您可以使用这些凭据来验证您的请求。这些参数是可选的。如果未指定凭据，则将使用ClickHouse配置中的凭据。有关更多信息，请参见[使用S3进行数据存储](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)。  |
| `format`                                        | 文件的[格式](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                                              |
| `structure`                                     | 表的结构。格式为`'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                                 |
| `compression`                                   | 该参数是可选的。支持的值：`none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。默认情况下，压缩将通过文件扩展名自动检测。                                                                                                                                                                                                                                           |

## 返回值 {#returned_value}

一个具有指定结构的表，用于从S3中指定的Hudi表读取数据。

## 相关 {#related}

- [Hudi引擎](engines/table-engines/integrations/hudi.md)
- [Hudi表函数](sql-reference/table-functions/hudi.md)
