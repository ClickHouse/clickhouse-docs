---
'description': 'Clickhouse Compressorのドキュメント'
'slug': '/operations/utilities/clickhouse-compressor'
'title': 'clickhouse-compressor'
'doc_type': 'reference'
---

シンプルなデータ圧縮と復元のプログラム。

### 例 {#examples}

LZ4を使用してデータを圧縮する：
```bash
$ ./clickhouse-compressor < input_file > output_file
```

LZ4形式からデータを復元する：
```bash
$ ./clickhouse-compressor --decompress < input_file > output_file
```

レベル5でZSTDを使用してデータを圧縮する：

```bash
$ ./clickhouse-compressor --codec 'ZSTD(5)' < input_file > output_file
```

4バイトのデルタとZSTDレベル10でデータを圧縮する。

```bash
$ ./clickhouse-compressor --codec 'Delta(4)' --codec 'ZSTD(10)' < input_file > output_file
```
