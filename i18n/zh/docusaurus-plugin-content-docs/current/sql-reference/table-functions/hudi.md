---
'description': '提供对 Amazon S3 中 Apache Hudi 表的只读表格接口。'
'sidebar_label': 'hudi'
'sidebar_position': 85
'slug': '/sql-reference/table-functions/hudi'
'title': 'hudi'
'doc_type': 'reference'
---


# hudi 表函数

提供对Amazon S3中Apache [Hudi](https://hudi.apache.org/) 表的只读表状接口。

## 语法 {#syntax}

```sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 参数 {#arguments}

| 参数                                     | 描述                                                                                                                                                                                                                                                                                                                                                                           |
|------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                                    | 指向S3中现有Hudi表的桶URL。                                                                                                                                                                                                                                                                                                                             |
| `aws_access_key_id`, `aws_secret_access_key` | 用于[AWS](https://aws.amazon.com/)账户用户的长期凭证。您可以使用这些凭证来验证您的请求。这些参数是可选的。如果未指定凭证，将使用ClickHouse配置中的凭证。有关更多信息，请参见[使用S3进行数据存储](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)。 |
| `format`                                 | 文件的[格式](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                                        |
| `structure`                              | 表的结构。格式为`'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                         |
| `compression`                            | 该参数是可选的。支持的值有：`none`，`gzip/gz`，`brotli/br`，`xz/LZMA`，`zstd/zst`。默认情况下，压缩类型将通过文件扩展名进行自动检测。                                                                                                                                                                                                                   |

## 返回值 {#returned_value}

具有指定结构的表，用于读取S3中指定Hudi表的数据。

## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（以字节为单位）。类型：`Nullable(UInt64)`。如果文件大小未知，则值为`NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为`NULL`。
- `_etag` — 文件的etag。类型：`LowCardinality(String)`。如果etag未知，则值为`NULL`。

## 相关内容 {#related}

- [Hudi引擎](/engines/table-engines/integrations/hudi.md)
- [Hudi集群表函数](/sql-reference/table-functions/hudiCluster.md)
