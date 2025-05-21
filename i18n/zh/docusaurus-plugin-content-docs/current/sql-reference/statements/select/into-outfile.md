---
'description': 'Documentation for INTO OUTFILE Clause'
'sidebar_label': 'INTO OUTFILE'
'slug': '/sql-reference/statements/select/into-outfile'
'title': 'INTO OUTFILE Clause'
---




# INTO OUTFILE 子句

`INTO OUTFILE` 子句将 `SELECT` 查询的结果重定向到 **客户端** 侧的文件中。

支持压缩文件。通过文件名的扩展名检测压缩类型（默认使用模式 `'auto'`）。或可以在 `COMPRESSION` 子句中明确指定。某种压缩类型的压缩级别可以在 `LEVEL` 子句中指定。

**语法**

```sql
SELECT <expr_list> INTO OUTFILE file_name [AND STDOUT] [APPEND | TRUNCATE] [COMPRESSION type [LEVEL level]]
```

`file_name` 和 `type` 是字符串文字。支持的压缩类型有：`'none'`、`'gzip'`、`'deflate'`、`'br'`、`'xz'`、`'zstd'`、`'lz4'`、`'bz2'`。

`level` 是数字文字。以下范围内的正整数被支持：`1-12` 用于 `lz4` 类型，`1-22` 用于 `zstd` 类型，以及 `1-9` 用于其他压缩类型。

## 实现细节 {#implementation-details}

- 此功能在 [命令行客户端](../../../interfaces/cli.md) 和 [clickhouse-local](../../../operations/utilities/clickhouse-local.md) 中可用。因此，通过 [HTTP 接口](../../../interfaces/http.md) 发送的查询将失败。
- 如果已经存在同名文件，查询将失败。
- 默认 [输出格式](../../../interfaces/formats.md) 为 `TabSeparated`（如同命令行客户端的批处理模式）。使用 [FORMAT](format.md) 子句更改它。
- 如果查询中提到 `AND STDOUT`，则写入文件的输出也会显示在标准输出上。如果与压缩一起使用，明文会显示在标准输出上。
- 如果查询中提到 `APPEND`，则输出将附加到现有文件。如果使用了压缩，则不能使用附加。
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
