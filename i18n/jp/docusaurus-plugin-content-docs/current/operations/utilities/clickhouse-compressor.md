---
description: 'ClickHouse Compressor のドキュメント'
slug: /operations/utilities/clickhouse-compressor
title: 'clickhouse-compressor'
doc_type: 'reference'
---

データの圧縮および解凍を行うシンプルなプログラムです。

### 例 \{#examples\}

LZ4 でデータを圧縮します：

```bash
$ ./clickhouse-compressor < input_file > output_file
```

LZ4 形式のデータを展開します:

```bash
$ ./clickhouse-compressor --decompress < input_file > output_file
```

ZSTD のレベル 5 でデータを圧縮します:

```bash
$ ./clickhouse-compressor --codec 'ZSTD(5)' < input_file > output_file
```

4 バイトのデルタ圧縮と ZSTD レベル 10 を用いてデータを圧縮します。

```bash
$ ./clickhouse-compressor --codec 'Delta(4)' --codec 'ZSTD(10)' < input_file > output_file
```
