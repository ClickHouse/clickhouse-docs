---
description: 'RawBLOB 형식에 대한 문서'
keywords: ['RawBLOB']
slug: /interfaces/formats/RawBLOB
title: 'RawBLOB'
doc_type: 'reference'
---



## Description \{#description\}

`RawBLOB` 포맷은 모든 입력 데이터를 하나의 값으로 읽어 들입니다. [`String`](/sql-reference/data-types/string.md) 타입 또는 유사한 타입의 단일 필드로 구성된 테이블만 파싱할 수 있습니다.
결과는 구분자나 이스케이프 없이 이진 포맷으로 출력됩니다. 한 개가 넘는 값이 출력되면 포맷이 모호해져 데이터를 다시 읽어들이는 것이 불가능해집니다.

### Raw 포맷 비교 \{#raw-formats-comparison\}

아래는 `RawBLOB` 포맷과 [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md) 포맷의 비교입니다.

`RawBLOB`:

* 데이터가 이스케이프 없이 바이너리 포맷으로 출력됩니다.
* 값 사이에 구분자가 없습니다.
* 각 값 끝에 줄 바꿈(new line)이 없습니다.

`TabSeparatedRaw`:

* 데이터가 이스케이프 없이 출력됩니다.
* 각 행은 탭으로 구분된 값들을 포함합니다.
* 각 행의 마지막 값 뒤에 줄 바꿈 문자(line feed)가 있습니다.

다음은 `RawBLOB` 포맷과 [RowBinary](./RowBinary/RowBinary.md) 포맷의 비교입니다.

`RawBLOB`:

* String 필드는 길이 접두어 없이 그대로 출력됩니다.

`RowBinary`:

* String 필드는 varint 포맷의 길이(부호 없는 [LEB128] (https://en.wikipedia.org/wiki/LEB128))와, 이에 이어지는 문자열 바이트로 표현됩니다.

`RawBLOB` 입력에 비어 있는 데이터가 전달되면, ClickHouse는 예외를 발생시킵니다:

```text
Code: 108. DB::Exception: No data to insert
```


## 사용 예 \{#example-usage\}

```bash title="Query"
$ clickhouse-client --query "CREATE TABLE {some_table} (a String) ENGINE = Memory;"
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT RawBLOB"
$ clickhouse-client --query "SELECT * FROM {some_table} FORMAT RawBLOB" | md5sum
```

```text title="Response"
f9725a22f9191e064120d718e26862a9  -
```


## 형식 설정 \{#format-settings\}
