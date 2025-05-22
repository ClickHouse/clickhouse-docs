---
'description': '对 hudi 表函数的扩展。允许在指定的集群中并行处理来自 Apache Hudi 表的文件，存储在 Amazon S3 中。'
'sidebar_label': 'hudiCluster'
'sidebar_position': 86
'slug': '/sql-reference/table-functions/hudiCluster'
'title': 'hudiCluster 表函数'
---


# hudiCluster 表函数

这是对 [hudi](sql-reference/table-functions/hudi.md) 表函数的扩展。

允许在指定集群中的多个节点上并行处理存储在 Amazon S3 中的 Apache [Hudi](https://hudi.apache.org/) 表文件。在发起者处，它与集群中的所有节点建立连接，并动态分配每个文件。在工作节点，它向发起者请求下一个要处理的任务并执行。这个过程重复进行，直到所有任务完成。

## 语法 {#syntax}

```sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 参数 {#arguments}

| 参数                                          | 描述                                                                                                                                                                                                                                                                                                                                                                          |
|-----------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                                | 用于构建一组远程和本地服务器地址及连接参数的集群名称。                                                                                                                                                                                                                                                                                                                     |
| `url`                                         | 指向 S3 中现有 Hudi 表的存储桶 URL。                                                                                                                                                                                                                                                                                                                                        |
| `aws_access_key_id`, `aws_secret_access_key` | [AWS](https://aws.amazon.com/) 账户用户的长期凭证。您可以使用这些凭证来验证请求。这些参数都是可选的。如果未指定凭证，则将使用 ClickHouse 配置中的凭证。有关更多信息，请参见[使用 S3 进行数据存储](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)。       |
| `format`                                      | 文件的 [格式](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                                      |
| `structure`                                   | 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                        |
| `compression`                                 | 该参数是可选的。支持的值有：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下，压缩将根据文件扩展名自动检测。                                                                                                                                                                                                          |

## 返回值 {#returned_value}

返回一个具有指定结构的表，以便从指定 S3 中的 Hudi 表读取数据。

## 相关 {#related}

- [Hudi 引擎](engines/table-engines/integrations/hudi.md)
- [Hudi 表函数](sql-reference/table-functions/hudi.md)
