---
description: 'ClickHouse Compressor 文档'
slug: /operations/utilities/clickhouse-compressor
title: 'clickhouse-compressor'
doc_type: 'reference'
---

用于数据压缩和解压缩的简单程序。

### 示例 \{#examples\}

使用 LZ4 压缩数据：

```bash
$ ./clickhouse-compressor < input_file > output_file
```

将 LZ4 格式的数据解压缩：

```bash
$ ./clickhouse-compressor --decompress < input_file > output_file
```

使用 ZSTD 以压缩级别 5 压缩数据：

```bash
$ ./clickhouse-compressor --codec 'ZSTD(5)' < input_file > output_file
```

使用 4 字节 Delta 和 ZSTD 级别 10 对数据进行压缩。

```bash
$ ./clickhouse-compressor --codec 'Delta(4)' --codec 'ZSTD(10)' < input_file > output_file
```
