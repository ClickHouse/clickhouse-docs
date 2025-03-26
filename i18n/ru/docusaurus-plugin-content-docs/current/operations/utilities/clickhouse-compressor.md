---
description: 'Документация для Clickhouse Compressor'
slug: /operations/utilities/clickhouse-compressor
title: 'clickhouse-compressor'
---

Программа для сжатия и распаковки данных.

### Примеры {#examples}

Сжать данные с использованием LZ4:
```bash
$ ./clickhouse-compressor < input_file > output_file
```

Распаковать данные из формата LZ4:
```bash
$ ./clickhouse-compressor --decompress < input_file > output_file
```

Сжать данные с использованием ZSTD на уровне 5:

```bash
$ ./clickhouse-compressor --codec 'ZSTD(5)' < input_file > output_file
```

Сжать данные с использованием Delta на четыре байта и ZSTD на уровне 10.

```bash
$ ./clickhouse-compressor --codec 'Delta(4)' --codec 'ZSTD(10)' < input_file > output_file
```
