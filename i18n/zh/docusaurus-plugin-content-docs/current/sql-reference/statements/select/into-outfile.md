
# INTO OUTFILE 子句

`INTO OUTFILE` 子句将 `SELECT` 查询的结果重定向到 **客户端** 侧的一个文件。

支持压缩文件。压缩类型由文件名的扩展名检测（默认模式为 `'auto'`）。或者可以在 `COMPRESSION` 子句中明确指定。可以在 `LEVEL` 子句中为特定的压缩类型指定压缩级别。

**语法**

```sql
SELECT <expr_list> INTO OUTFILE file_name [AND STDOUT] [APPEND | TRUNCATE] [COMPRESSION type [LEVEL level]]
```

`file_name` 和 `type` 是字符串文字。支持的压缩类型包括：`'none'`、`'gzip'`、`'deflate'`、`'br'`、`'xz'`、`'zstd'`、`'lz4'`、`'bz2'`。

`level` 是数值文字。支持的正整数范围为：`1-12` 对于 `lz4` 类型，`1-22` 对于 `zstd` 类型，以及 `1-9` 对于其他压缩类型。

## 实现细节 {#implementation-details}

- 此功能在 [命令行客户端](../../../interfaces/cli.md) 和 [clickhouse-local](../../../operations/utilities/clickhouse-local.md) 中可用。因此，通过 [HTTP 接口](../../../interfaces/http.md) 发送的查询将失败。
- 如果已存在同名文件，则查询将失败。
- 默认 [输出格式](../../../interfaces/formats.md) 为 `TabSeparated` （如在命令行客户端批处理模式中）。使用 [FORMAT](format.md) 子句进行更改。
- 如果查询中提到 `AND STDOUT`，则写入文件的输出也会在标准输出中显示。如果使用压缩，则原文将显示在标准输出中。
- 如果查询中提到 `APPEND`，则输出将附加到现有文件中。如果使用压缩，则不能使用附加。
- 当向已存在的文件写入时，必须使用 `APPEND` 或 `TRUNCATE`。

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
