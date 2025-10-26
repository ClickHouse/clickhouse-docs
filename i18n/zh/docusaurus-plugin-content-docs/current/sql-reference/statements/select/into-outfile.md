---
'description': 'INTO OUTFILE 子句的文档'
'sidebar_label': 'INTO OUTFILE'
'slug': '/sql-reference/statements/select/into-outfile'
'title': 'INTO OUTFILE 子句'
'doc_type': 'reference'
---


# INTO OUTFILE 子句

`INTO OUTFILE` 子句将 `SELECT` 查询的结果重定向到 **客户端** 侧的文件中。

支持压缩文件。压缩类型通过文件名的扩展名进行检测（默认使用模式 `'auto'`）。或者可以在 `COMPRESSION` 子句中明确指定。可以在 `LEVEL` 子句中为特定的压缩类型指定压缩级别。

**语法**

```sql
SELECT <expr_list> INTO OUTFILE file_name [AND STDOUT] [APPEND | TRUNCATE] [COMPRESSION type [LEVEL level]]
```

`file_name` 和 `type` 是字符串常量。支持的压缩类型有： `'none'`，`'gzip'`，`'deflate'`，`'br'`，`'xz'`，`'zstd'`，`'lz4'`，`'bz2'`。

`level` 是数字常量。支持范围内的正整数：`1-12` 对于 `lz4` 类型，`1-22` 对于 `zstd` 类型以及 `1-9` 对于其他压缩类型。

## 实现详情 {#implementation-details}

- 该功能可在 [命令行客户端](../../../interfaces/cli.md) 和 [clickhouse-local](../../../operations/utilities/clickhouse-local.md) 中使用。因此，通过 [HTTP 接口](../../../interfaces/http.md) 发送的查询将会失败。
- 如果已存在同名文件，查询将失败。
- 默认的 [输出格式](../../../interfaces/formats.md) 是 `TabSeparated`（如在命令行客户端批处理模式下）。使用 [FORMAT](format.md) 子句来更改它。
- 如果查询中提到了 `AND STDOUT`，则写入文件的输出也会显示在标准输出上。如果与压缩一起使用，明文将显示在标准输出上。
- 如果查询中提到了 `APPEND`，则输出会附加到已存在的文件。如果使用了压缩，则不能使用附加。
- 当写入已存在的文件时，必须使用 `APPEND` 或 `TRUNCATE`。

**示例**

使用 [命令行客户端](../../../interfaces/cli.md) 执行以下查询：

```bash
clickhouse-client --query="SELECT 1,'ABC' INTO OUTFILE 'select.gz' FORMAT CSV;"
zcat select.gz 
```

结果：

```text
1,"ABC"
```
