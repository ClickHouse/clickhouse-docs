---
'description': 'Clickhouse Compressor에 대한 문서'
'slug': '/operations/utilities/clickhouse-compressor'
'title': 'clickhouse-compressor'
'doc_type': 'reference'
---

간단한 데이터 압축 및 압축 해제 프로그램입니다.

### 예제 {#examples}

LZ4로 데이터 압축:
```bash
$ ./clickhouse-compressor < input_file > output_file
```

LZ4 형식에서 데이터 압축 해제:
```bash
$ ./clickhouse-compressor --decompress < input_file > output_file
```

레벨 5에서 ZSTD로 데이터 압축:

```bash
$ ./clickhouse-compressor --codec 'ZSTD(5)' < input_file > output_file
```

4바이트 델타와 ZSTD 레벨 10으로 데이터 압축.

```bash
$ ./clickhouse-compressor --codec 'Delta(4)' --codec 'ZSTD(10)' < input_file > output_file
```
