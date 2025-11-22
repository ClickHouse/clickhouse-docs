---
description: 'INTO OUTFILE 子句文档'
sidebar_label: 'INTO OUTFILE'
slug: /sql-reference/statements/select/into-outfile
title: 'INTO OUTFILE 子句'
doc_type: 'reference'
---



# INTO OUTFILE 子句

`INTO OUTFILE` 子句会将 `SELECT` 查询的结果重定向到**客户端**本地的文件中。

支持压缩文件。压缩类型通过文件扩展名进行检测（默认使用 `'auto'` 模式），也可以在 `COMPRESSION` 子句中显式指定。某种压缩类型的压缩级别可以在 `LEVEL` 子句中指定。

**语法**

```sql
SELECT <expr_list> INTO OUTFILE file_name [AND STDOUT] [APPEND | TRUNCATE] [COMPRESSION type [LEVEL level]]
```

`file_name` 和 `type` 是字符串字面量。支持的压缩类型包括：`'none'`、`'gzip'`、`'deflate'`、`'br'`、`'xz'`、`'zstd'`、`'lz4'`、`'bz2'`。

`level` 是数值字面量。支持的正整数范围如下：`lz4` 类型为 `1-12`，`zstd` 类型为 `1-22`，其他压缩类型为 `1-9`。


## 实现细节 {#implementation-details}

- 此功能在[命令行客户端](../../../interfaces/cli.md)和 [clickhouse-local](../../../operations/utilities/clickhouse-local.md) 中可用。因此,通过 [HTTP 接口](../../../interfaces/http.md)发送的查询将失败。
- 如果已存在同名文件,查询将失败。
- 默认[输出格式](../../../interfaces/formats.md)为 `TabSeparated`(与命令行客户端批处理模式相同)。使用 [FORMAT](format.md) 子句更改格式。
- 如果在查询中指定了 `AND STDOUT`,则写入文件的输出也会同时显示在标准输出中。如果使用了压缩,则在标准输出中显示明文。
- 如果在查询中指定了 `APPEND`,则输出将追加到现有文件中。如果使用了压缩,则无法使用追加模式。
- 写入已存在的文件时,必须使用 `APPEND` 或 `TRUNCATE`。

**示例**

使用[命令行客户端](../../../interfaces/cli.md)执行以下查询:

```bash
clickhouse-client --query="SELECT 1,'ABC' INTO OUTFILE 'select.gz' FORMAT CSV;"
zcat select.gz
```

结果:

```text
1,"ABC"
```
