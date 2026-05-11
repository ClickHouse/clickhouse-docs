---
description: 'ClickHouse Compressor 문서'
slug: /operations/utilities/clickhouse-compressor
title: 'clickhouse-compressor'
doc_type: 'reference'
---

데이터를 압축하고 압축 해제하는 간단한 프로그램입니다.

### 예시 \{#examples\}

LZ4를 사용하여 데이터를 압축하십시오:

```bash
$ ./clickhouse-compressor < input_file > output_file
```

LZ4 형식의 데이터를 압축 해제합니다:

```bash
$ ./clickhouse-compressor --decompress < input_file > output_file
```

ZSTD 레벨 5로 데이터를 압축하십시오:

```bash
$ ./clickhouse-compressor --codec 'ZSTD(5)' < input_file > output_file
```

4바이트 Delta 인코딩과 ZSTD 레벨 10을 사용하여 데이터를 압축합니다.

```bash
$ ./clickhouse-compressor --codec 'Delta(4)' --codec 'ZSTD(10)' < input_file > output_file
```
