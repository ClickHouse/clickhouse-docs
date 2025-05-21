---
'description': 'Provides a read-only table-like interface to Apache Hudi tables in
  Amazon S3.'
'sidebar_label': 'hudi'
'sidebar_position': 85
'slug': '/sql-reference/table-functions/hudi'
'title': 'hudi'
---




# hudi 表函数

提供对 Amazon S3 中 Apache [Hudi](https://hudi.apache.org/) 表的只读表状接口。

## 语法 {#syntax}

```sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 参数 {#arguments}

| 参数                                          | 描述                                                                                                                                                                                                                                                                                                                                                                           |
|-----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                                        | 具有现有 Hudi 表路径的 Bucket URL。                                                                                                                                                                                                                                                                                                                             |
| `aws_access_key_id`, `aws_secret_access_key` | AWS 账号用户的长期凭证。您可以使用这些凭证来验证您的请求。这些参数是可选的。如果未指定凭证，则将使用 ClickHouse 配置中的凭证。有关更多信息，请参见 [使用 S3 进行数据存储](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)。 |
| `format`                                     | 文件的 [格式](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                                        |
| `structure`                                  | 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                         |
| `compression`                                | 参数是可选的。支持的值：`none`，`gzip/gz`，`brotli/br`，`xz/LZMA`，`zstd/zst`。默认情况下，压缩将通过文件扩展名自动检测。                                                                                                                                                                                                                   |

## 返回值 {#returned_value}

具有指定结构的表，用于读取在 S3 中指定的 Hudi 表中的数据。

## 相关 {#related}

- [Hudi 引擎](/engines/table-engines/integrations/hudi.md)
- [Hudi 集群表函数](/sql-reference/table-functions/hudiCluster.md)
