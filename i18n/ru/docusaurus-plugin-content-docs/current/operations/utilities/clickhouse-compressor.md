---
slug: '/operations/utilities/clickhouse-compressor'
description: 'Документация для Clickhouse Compressor'
title: clickhouse-compressor
doc_type: reference
---
Простая программа для сжатия и разжатия данных.

### Примеры {#examples}

Сжать данные с помощью LZ4:
```bash
$ ./clickhouse-compressor < input_file > output_file
```

Разжать данные из формата LZ4:
```bash
$ ./clickhouse-compressor --decompress < input_file > output_file
```

Сжать данные с помощью ZSTD на уровне 5:

```bash
$ ./clickhouse-compressor --codec 'ZSTD(5)' < input_file > output_file
```

Сжать данные с помощью Delta из четырех байтов и ZSTD на уровне 10.

```bash
$ ./clickhouse-compressor --codec 'Delta(4)' --codec 'ZSTD(10)' < input_file > output_file
```