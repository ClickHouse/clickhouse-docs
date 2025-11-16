---
'description': 'RawBLOB 형식에 대한 Documentation'
'keywords':
- 'RawBLOB'
'slug': '/interfaces/formats/RawBLOB'
'title': 'RawBLOB'
'doc_type': 'reference'
---

## 설명 {#description}

`RawBLOB` 포맷은 모든 입력 데이터를 단일 값으로 읽습니다. [`String`](/sql-reference/data-types/string.md) 유형의 단일 필드로 구성된 테이블만 파싱할 수 있습니다. 결과는 구분자 및 이스케이프 없이 이진 형식으로 출력됩니다. 여러 값이 출력되면 형식이 모호해지고, 데이터를 다시 읽을 수 없게 됩니다.

### 원시 형식 비교 {#raw-formats-comparison}

아래는 `RawBLOB`와 [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md) 형식의 비교입니다.

`RawBLOB`:
- 데이터는 이진 형식으로 출력되며, 이스케이프가 없습니다;
- 값 사이에 구분자가 없습니다;
- 각 값의 끝에는 개행이 없습니다.

`TabSeparatedRaw`:
- 데이터는 이스케이프 없이 출력됩니다;
- 행에는 탭으로 구분된 값이 포함됩니다;
- 각 행의 마지막 값 뒤에는 줄바꿈이 있습니다.

다음은 `RawBLOB`와 [RowBinary](./RowBinary/RowBinary.md) 형식의 비교입니다.

`RawBLOB`:
- 문자열 필드는 길이가 접두사로 붙지 않고 출력됩니다.

`RowBinary`:
- 문자열 필드는 길이가 varint 형식 (부호 없는 [LEB128](https://en.wikipedia.org/wiki/LEB128)) 으로 표현되고, 그 뒤에 문자열의 바이트가 옵니다.

빈 데이터가 `RawBLOB` 입력으로 전달되면 ClickHouse는 예외를 발생시킵니다:

```text
Code: 108. DB::Exception: No data to insert
```

## 예제 사용법 {#example-usage}

```bash title="Query"
$ clickhouse-client --query "CREATE TABLE {some_table} (a String) ENGINE = Memory;"
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT RawBLOB"
$ clickhouse-client --query "SELECT * FROM {some_table} FORMAT RawBLOB" | md5sum
```

```text title="Response"
f9725a22f9191e064120d718e26862a9  -
```

## 형식 설정 {#format-settings}
