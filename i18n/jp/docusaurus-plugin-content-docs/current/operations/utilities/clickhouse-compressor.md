---
description: 'Clickhouse Compressorのドキュメント'
slug: /operations/utilities/clickhouse-compressor
title: 'clickhouse-compressor'
---

データ圧縮および解凍のためのシンプルなプログラムです。

### 例 {#examples}

LZ4でデータを圧縮する：
```bash
$ ./clickhouse-compressor < input_file > output_file
```

LZ4形式からデータを解凍する：
```bash
$ ./clickhouse-compressor --decompress < input_file > output_file
```

レベル5でのZSTDでデータを圧縮する：

```bash
$ ./clickhouse-compressor --codec 'ZSTD(5)' < input_file > output_file
```

4バイトのデルタおよびレベル10のZSTDでデータを圧縮する。

```bash
$ ./clickhouse-compressor --codec 'Delta(4)' --codec 'ZSTD(10)' < input_file > output_file
```
