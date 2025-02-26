---
slug: /operations/utilities/clickhouse-compressor
title: clickhouse-compressor 
---

データの圧縮および解凍のためのシンプルなプログラムです。

### 例 {#examples}

LZ4でデータを圧縮する：
```bash
$ ./clickhouse-compressor < input_file > output_file
```

LZ4形式からデータを解凍する：
```bash
$ ./clickhouse-compressor --decompress < input_file > output_file
```

ZSTDレベル5でデータを圧縮する：

```bash
$ ./clickhouse-compressor --codec 'ZSTD(5)' < input_file > output_file
```

4バイトのデルタおよびZSTDレベル10でデータを圧縮する。

```bash
$ ./clickhouse-compressor --codec 'Delta(4)' --codec 'ZSTD(10)' < input_file > output_file
```
