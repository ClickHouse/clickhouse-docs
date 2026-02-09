---
description: '为 Amazon S3 中的 Apache Hudi 表提供只读的类似表的接口。'
sidebar_label: 'hudi'
sidebar_position: 85
slug: /sql-reference/table-functions/hudi
title: 'hudi'
doc_type: 'reference'
---

# Hudi 表函数 \{#hudi-table-function\}

提供只读的类表接口，用于访问存储在 Amazon S3 中的 Apache [Hudi](https://hudi.apache.org/) 表。

## 语法 \{#syntax\}

```sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 参数 \{#arguments\}

| 参数                                          | 说明                                                                                                                                                                                                                                                                                                                                                                                  |
|----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                                        | 指向 S3 中现有 Hudi 表的 bucket URL 和路径。                                                                                                                                                                                                                                                                                                                                          |
| `aws_access_key_id`, `aws_secret_access_key` | [AWS](https://aws.amazon.com/) 账户用户的长期凭证。您可以使用这些凭证对请求进行身份验证。这些参数为可选项。如果未指定凭证，将使用 ClickHouse 配置中的凭证。更多信息请参见 [Using S3 for Data Storage](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)。 |
| `format`                                     | 文件的[格式](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                                                  |
| `structure`                                  | 表结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                                       |
| `compression`                                | 可选参数。支持的取值：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下，将根据文件扩展名自动检测压缩格式。                                                                                                                                                                                                                                                           |

## 返回值 \{#returned_value\}

一个具有指定结构的表，用于从 S3 中指定的 Hudi 表读取数据。

## 虚拟列 \{#virtual-columns\}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（字节数）。类型：`Nullable(UInt64)`。如果文件大小未知，则该值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则该值为 `NULL`。
- `_etag` — 文件的 etag 值。类型：`LowCardinality(String)`。如果 etag 未知，则该值为 `NULL`。

## 相关内容 \{#related\}

- [Hudi 引擎](/engines/table-engines/integrations/hudi.md)
- [Hudi 集群表函数](/sql-reference/table-functions/hudiCluster.md)
