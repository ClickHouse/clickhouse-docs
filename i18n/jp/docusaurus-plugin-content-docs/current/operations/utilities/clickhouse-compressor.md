---
description: "ClickHouse Compressorのドキュメント"
slug: /operations/utilities/clickhouse-compressor
title: "clickhouse-compressor"
doc_type: "reference"
---

データの圧縮と解凍を行うシンプルなプログラムです。

### 例 {#examples}

LZ4でデータを圧縮:

```bash
$ ./clickhouse-compressor < input_file > output_file
```

LZ4形式のデータを解凍:

```bash
$ ./clickhouse-compressor --decompress < input_file > output_file
```

ZSTDレベル5でデータを圧縮:

```bash
$ ./clickhouse-compressor --codec 'ZSTD(5)' < input_file > output_file
```

4バイトのDeltaとZSTDレベル10でデータを圧縮:

```bash
$ ./clickhouse-compressor --codec 'Delta(4)' --codec 'ZSTD(10)' < input_file > output_file
```
