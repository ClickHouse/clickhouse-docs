---
'description': 'ClickHouse压缩器文档'
'slug': '/operations/utilities/clickhouse-compressor'
'title': 'clickhouse-compressor'
---



简单的数据压缩和解压缩程序。

### 示例 {#examples}

使用 LZ4 压缩数据：
```bash
$ ./clickhouse-compressor < input_file > output_file
```

从 LZ4 格式解压缩数据：
```bash
$ ./clickhouse-compressor --decompress < input_file > output_file
```

以级别 5 使用 ZSTD 压缩数据：

```bash
$ ./clickhouse-compressor --codec 'ZSTD(5)' < input_file > output_file
```

使用四字节的 Delta 和 ZSTD 级别 10 压缩数据。

```bash
$ ./clickhouse-compressor --codec 'Delta(4)' --codec 'ZSTD(10)' < input_file > output_file
```
