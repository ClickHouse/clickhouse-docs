---
description: 'INTO OUTFILE 子句说明'
sidebar_label: 'INTO OUTFILE'
slug: /sql-reference/statements/select/into-outfile
title: 'INTO OUTFILE 子句'
doc_type: 'reference'
---

# INTO OUTFILE 子句 {#into-outfile-clause}

`INTO OUTFILE` 子句会将 `SELECT` 查询的结果重定向到**客户端**本地的文件中。

支持压缩文件。压缩类型通过文件扩展名自动检测（默认使用 `'auto'` 模式），也可以在 `COMPRESSION` 子句中显式指定。某种压缩类型的压缩级别可以在 `LEVEL` 子句中指定。

**语法**

```sql
SELECT <expr_list> INTO OUTFILE file_name [AND STDOUT] [APPEND | TRUNCATE] [COMPRESSION type [LEVEL level]]
```

`file_name` 和 `type` 是字符串字面量。支持的压缩类型包括：`'none'`、`'gzip'`、`'deflate'`、`'br'`、`'xz'`、`'zstd'`、`'lz4'`、`'bz2'`。

`level` 是数值字面量。支持的正整数范围为：`lz4` 类型为 `1-12`，`zstd` 类型为 `1-22`，其他压缩类型为 `1-9`。

## 实现细节 {#implementation-details}

* 此功能可在[命令行客户端](../../../interfaces/cli.md)和 [clickhouse-local](../../../operations/utilities/clickhouse-local.md) 中使用。因此，通过 [HTTP 接口](/interfaces/http) 发送的查询将会失败。
* 如果已存在同名文件，查询将会失败。
* 默认的[输出格式](../../../interfaces/formats.md)为 `TabSeparated`（与命令行客户端批处理模式相同）。使用 [FORMAT](format.md) 子句来更改输出格式。
* 如果在查询中包含 `AND STDOUT`，则写入文件的输出也会同时显示到标准输出上。如果启用了压缩，标准输出上显示的是未压缩的明文。
* 如果在查询中包含 `APPEND`，则输出会追加到已有文件中。如果使用压缩，则不能与 `APPEND` 同时使用。
* 当写入已存在的文件时，必须使用 `APPEND` 或 `TRUNCATE`。

**示例**

使用[命令行客户端](../../../interfaces/cli.md)执行以下查询：

```bash
clickhouse-client --query="SELECT 1,'ABC' INTO OUTFILE 'select.gz' FORMAT CSV;"
zcat select.gz 
```

结果：

```text
1,"ABC"
```
