---
description: "Документация по clickhouse-compressor"
slug: /operations/utilities/clickhouse-compressor
title: "clickhouse-compressor"
doc_type: "reference"
---

Простая программа для сжатия и распаковки данных.

### Примеры {#examples}

Сжатие данных с использованием LZ4:

```bash
$ ./clickhouse-compressor < input_file > output_file
```

Распаковка данных из формата LZ4:

```bash
$ ./clickhouse-compressor --decompress < input_file > output_file
```

Сжатие данных с использованием ZSTD на уровне 5:

```bash
$ ./clickhouse-compressor --codec 'ZSTD(5)' < input_file > output_file
```

Сжатие данных с использованием Delta для четырёх байт и ZSTD на уровне 10.

```bash
$ ./clickhouse-compressor --codec 'Delta(4)' --codec 'ZSTD(10)' < input_file > output_file
```
