---
slug: /operations/utilities/clickhouse-compressor
title: clickhouse-compressor 
---

データの圧縮および解凍用のシンプルなプログラムです。

### 例 {#examples}

LZ4を使用してデータを圧縮する:
```bash
$ ./clickhouse-compressor < input_file > output_file
```

LZ4形式からデータを解凍する:
```bash
$ ./clickhouse-compressor --decompress < input_file > output_file
```

レベル5のZSTDを使用してデータを圧縮する:

```bash
$ ./clickhouse-compressor --codec 'ZSTD(5)' < input_file > output_file
```

4バイトのDeltaとレベル10のZSTDを使用してデータを圧縮する。

```bash
$ ./clickhouse-compressor --codec 'Delta(4)' --codec 'ZSTD(10)' < input_file > output_file
```
