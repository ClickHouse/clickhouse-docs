---
description: 'Документация по ClickHouse Compressor'
slug: /operations/utilities/clickhouse-compressor
title: 'clickhouse-compressor'
doc_type: 'reference'
---

Простая программа для сжатия и распаковки данных.

### Примеры {#examples}

Сжатие данных с помощью LZ4:

```bash
$ ./clickhouse-compressor < input_file > output_file
```

Распаковка данных из формата LZ4:

```bash
$ ./clickhouse-compressor --decompress < input_file > output_file
```

Сжимайте данные с помощью ZSTD с уровнем сжатия 5:

```bash
$ ./clickhouse-compressor --codec 'ZSTD(5)' < input_file > output_file
```

Сжимайте данные с дельтой 4 байта и ZSTD уровня 10.

```bash
$ ./clickhouse-compressor --codec 'Delta(4)' --codec 'ZSTD(10)' < input_file > output_file
```
