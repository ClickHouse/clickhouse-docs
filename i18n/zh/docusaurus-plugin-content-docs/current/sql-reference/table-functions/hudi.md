---
description: '为存储在 Amazon S3 中的 Apache Hudi 表提供类似表的只读接口。'
sidebar_label: 'hudi'
sidebar_position: 85
slug: /sql-reference/table-functions/hudi
title: 'hudi'
doc_type: '参考'
---



# hudi 表函数

为存储在 Amazon S3 中的 Apache [Hudi](https://hudi.apache.org/) 表提供类似表的只读接口。



## 语法 {#syntax}

```sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```


## 参数 {#arguments}

| 参数                                     | 描述                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `url`                                        | 包含 S3 中现有 Hudi 表路径的存储桶 URL。                                                                                                                                                                                                                                                                            |
| `aws_access_key_id`, `aws_secret_access_key` | [AWS](https://aws.amazon.com/) 账户用户的长期凭证。您可以使用这些凭证对请求进行身份验证。这些参数为可选参数。如果未指定凭证,将使用 ClickHouse 配置中的凭证。更多信息请参阅[使用 S3 存储数据](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)。 |
| `format`                                     | 文件的[格式](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                                       |
| `structure`                                  | 表结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                                        |
| `compression`                                | 可选参数。支持的值:`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下,将根据文件扩展名自动检测压缩方式。                                                                                                                                                                                                                  |


## 返回值 {#returned_value}

返回一个具有指定结构的表，用于读取 S3 中指定的 Hudi 表数据。


## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型:`LowCardinality(String)`。
- `_file` — 文件名称。类型:`LowCardinality(String)`。
- `_size` — 文件大小(以字节为单位)。类型:`Nullable(UInt64)`。如果文件大小未知,则值为 `NULL`。
- `_time` — 文件最后修改时间。类型:`Nullable(DateTime)`。如果时间未知,则值为 `NULL`。
- `_etag` — 文件的 ETag。类型:`LowCardinality(String)`。如果 ETag 未知,则值为 `NULL`。


## 相关内容 {#related}

- [Hudi 引擎](/engines/table-engines/integrations/hudi.md)
- [Hudi 集群表函数](/sql-reference/table-functions/hudiCluster.md)
