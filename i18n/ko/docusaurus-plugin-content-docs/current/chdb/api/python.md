---
'title': 'chDB Python API 참조'
'sidebar_label': 'Python API'
'slug': '/chdb/api/python'
'description': 'chDB에 대한 전체 Python API 참조'
'keywords':
- 'chdb'
- 'embedded'
- 'clickhouse-lite'
- 'python'
- 'api'
- 'reference'
'doc_type': 'reference'
---


# Python API Reference
## Core Query Functions {#core-query-functions}
### `chdb.query` {#chdb-query}

chDB 엔진을 사용하여 SQL 쿼리를 실행합니다.

이것은 임베디드 ClickHouse 엔진을 사용하여 SQL 문을 실행하는 주요 쿼리 함수입니다. 다양한 출력 형식을 지원하며 메모리 내 또는 파일 기반 데이터베이스에서 작업할 수 있습니다.

**구문**

```python
chdb.query(sql, output_format='CSV', path='', udf_path='')
```

**매개변수**

| 매개변수          | 유형    | 기본값      | 설명                                                                                                                                                                                                                                                                                                     |
|-------------------|---------|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`             | str     | *필수*      | 실행할 SQL 쿼리 문자열                                                                                                                                                                                                                                                                                  |
| `output_format`   | str     | `"CSV"`     | 결과의 출력 형식. 지원되는 형식:<br/>• `"CSV"` - 쉼표로 구분된 값<br/>• `"JSON"` - JSON 형식<br/>• `"Arrow"` - Apache Arrow 형식<br/>• `"Parquet"` - Parquet 형식<br/>• `"DataFrame"` - Pandas DataFrame<br/>• `"ArrowTable"` - PyArrow Table<br/>• `"Debug"` - 자세한 로깅 활성화 |
| `path`            | str     | `""`        | 데이터베이스 파일 경로. 기본값은 메모리 내 데이터베이스입니다.<br/>파일 경로일 수 있으며, 메모리 내 데이터베이스를 위해 `":memory:"`로 설정할 수 있습니다.                                                                                                                                     |
| `udf_path`        | str     | `""`        | 사용자 정의 함수 디렉터리 경로                                                                                                                                                                                                                                                                          |

**반환값**

지정된 형식으로 쿼리 결과를 반환합니다:

| 반환 유형               | 조건                                                |
|------------------------|----------------------------------------------------|
| `str`                  | CSV, JSON과 같은 텍스트 형식의 경우                |
| `pd.DataFrame`         | `output_format`이 `"DataFrame"` 또는 `"dataframe"`인 경우 |
| `pa.Table`             | `output_format`이 `"ArrowTable"` 또는 `"arrowtable"`인 경우 |
| chdb 결과 객체        | 기타 형식의 경우                                    |
 
**예외 발생**

| 예외            | 조건                                                     |
|-----------------|---------------------------------------------------------|
| `ChdbError`     | SQL 쿼리 실행에 실패한 경우                            |
| `ImportError`   | DataFrame/Arrow 형식에 필요한 종속성이 누락된 경우 |

**예제**

```pycon
>>> # Basic CSV query
>>> result = chdb.query("SELECT 1, 'hello'")
>>> print(result)
"1,hello"
```

```pycon
>>> # Query with DataFrame output
>>> df = chdb.query("SELECT 1 as id, 'hello' as msg", "DataFrame")
>>> print(df)
   id    msg
0   1  hello
```

```pycon
>>> # Query with file-based database
>>> result = chdb.query("CREATE TABLE test (id INT) ENGINE = Memory", path="mydb.chdb")
```

```pycon
>>> # Query with UDF
>>> result = chdb.query("SELECT my_udf('test')", udf_path="/path/to/udfs")
```

---
### `chdb.sql` {#chdb_sql}

chDB 엔진을 사용하여 SQL 쿼리를 실행합니다.

이것은 임베디드 ClickHouse 엔진을 사용하여 SQL 문을 실행하는 주요 쿼리 함수입니다. 다양한 출력 형식을 지원하며 메모리 내 또는 파일 기반 데이터베이스에서 작업할 수 있습니다.

**구문**

```python
chdb.sql(sql, output_format='CSV', path='', udf_path='')
```

**매개변수**

| 매개변수          | 유형    | 기본값      | 설명                                                                                                                                                                                                                                                                                              |
|-------------------|---------|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`             | str     | *필수*      | 실행할 SQL 쿼리 문자열                                                                                                                                                                                                                                                                              |
| `output_format`   | str     | `"CSV"`     | 결과의 출력 형식. 지원되는 형식:<br/>• `"CSV"` - 쉼표로 구분된 값<br/>• `"JSON"` - JSON 형식<br/>• `"Arrow"` - Apache Arrow 형식<br/>• `"Parquet"` - Parquet 형식<br/>• `"DataFrame"` - Pandas DataFrame<br/>• `"ArrowTable"` - PyArrow Table<br/>• `"Debug"` - 자세한 로깅 활성화 |
| `path`            | str     | `""`        | 데이터베이스 파일 경로. 기본값은 메모리 내 데이터베이스입니다.<br/>파일 경로일 수 있으며, 메모리 내 데이터베이스를 위해 `":memory:"`로 설정할 수 있습니다.                                                                                                                                         |
| `udf_path`        | str     | `""`        | 사용자 정의 함수 디렉터리 경로                                                                                                                                                                                                                                                                          |

**반환값**

지정된 형식으로 쿼리 결과를 반환합니다:

| 반환 유형               | 조건                                                |
|------------------------|----------------------------------------------------|
| `str`                  | CSV, JSON과 같은 텍스트 형식의 경우                |
| `pd.DataFrame`         | `output_format`이 `"DataFrame"` 또는 `"dataframe"`인 경우 |
| `pa.Table`             | `output_format`이 `"ArrowTable"` 또는 `"arrowtable"`인 경우 |
| chdb 결과 객체        | 기타 형식의 경우                                    |

**예외 발생**

| 예외                  | 조건                                                 |
|-----------------------|-----------------------------------------------------|
| [`ChdbError`](#chdberror) | SQL 쿼리 실행에 실패한 경우                         |
| `ImportError`         | DataFrame/Arrow 형식에 필요한 종속성이 누락된 경우 |

**예제**

```pycon
>>> # Basic CSV query
>>> result = chdb.query("SELECT 1, 'hello'")
>>> print(result)
"1,hello"
```

```pycon
>>> # Query with DataFrame output
>>> df = chdb.query("SELECT 1 as id, 'hello' as msg", "DataFrame")
>>> print(df)
   id    msg
0   1  hello
```

```pycon
>>> # Query with file-based database
>>> result = chdb.query("CREATE TABLE test (id INT) ENGINE = Memory", path="mydb.chdb")
```

```pycon
>>> # Query with UDF
>>> result = chdb.query("SELECT my_udf('test')", udf_path="/path/to/udfs")
```

---
### `chdb.to_arrowTable` {#chdb-state-sqlitelike-to_arrowtable}

쿼리 결과를 PyArrow Table로 변환합니다.

chDB 쿼리 결과를 PyArrow Table로 변환하여 효율적인 컬럼형 데이터 처리를 수행합니다. 결과가 비어 있는 경우 빈 테이블을 반환합니다.

**구문**

```python
chdb.to_arrowTable(res)
```

**매개변수**

| 매개변수 | 설명                                            |
|-----------|-------------------------------------------------|
| `res`     | 이진 Arrow 데이터를 포함하는 chDB 쿼리 결과 객체 |

**반환값**

| 반환 유형 | 설명                               |
|-----------|------------------------------------|
| `pa.Table` | 쿼리 결과를 포함하는 PyArrow Table |

**예외 발생**

| 오류 유형     | 설명                               |
|---------------|------------------------------------|
| `ImportError` | pyarrow 또는 pandas가 설치되지 않은 경우 |

**예제**

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> table = chdb.to_arrowTable(result)
>>> print(table.to_pandas())
   id    msg
0   1  hello
```

---
### `chdb.to_df` {#chdb_to_df}

쿼리 결과를 pandas DataFrame으로 변환합니다.

chDB 쿼리 결과를 pandas DataFrame으로 변환하기 위해 먼저 PyArrow Table로 변환한 후, 멀티 스레딩을 사용하여 성능을 향상시킵니다.

**구문**

```python
chdb.to_df(r)
```

**매개변수**

| 매개변수 | 설명                                         |
|-----------|----------------------------------------------|
| `r`       | 이진 Arrow 데이터를 포함하는 chDB 쿼리 결과 객체 |

**반환값**

| 반환 유형        | 설명                          |
|------------------|-------------------------------|
| `pd.DataFrame`   | 쿼리 결과를 포함하는 pandas DataFrame |

**예외 발생**

| 예외                | 조건                                     |
|---------------------|-------------------------------------------|
| `ImportError`       | pyarrow 또는 pandas가 설치되지 않은 경우 |

**예제**

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> df = chdb.to_df(result)
>>> print(df)
   id    msg
0   1  hello
```
## Connection and Session Management {#connection-session-management}

다음 세션 함수가 제공됩니다:
### `chdb.connect` {#chdb-connect}

chDB 백그라운드 서버에 연결을 생성합니다.

이 함수는 chDB(ClickHouse) 데이터베이스 엔진에 대한 [Connection](#chdb-state-sqlitelike-connection)을 설정합니다.
프로세스당 하나의 열린 연결만 허용됩니다.
같은 연결 문자열로 여러 번 호출하면 동일한 연결 객체가 반환됩니다.

```python
chdb.connect(connection_string: str = ':memory:') → Connection
```

**매개변수:**

| 매개변수              | 유형    | 기본값      | 설명                                      |
|----------------------|---------|--------------|------------------------------------------|
| `connection_string`  | str     | `":memory:"` | 데이터베이스 연결 문자열. 아래 형식 참조. |

**기본 형식**

| 형식                    | 설명                          |
|-------------------------|-------------------------------|
| `":memory:"`            | 메모리 내 데이터베이스(기본값) |
| `"test.db"`             | 상대 경로 데이터베이스 파일    |
| `"file:test.db"`        | 상대 경로와 동일               |
| `"/path/to/test.db"`    | 절대 경로 데이터베이스 파일    |
| `"file:/path/to/test.db"` | 절대 경로와 동일               |

**쿼리 매개변수와 함께**

| 형식                                                 | 설명                        |
|-------------------------------------------------------|-----------------------------|
| `"file:test.db?param1=value1&param2=value2"`         | 매개변수가 있는 상대 경로    |
| `"file::memory:?verbose&log-level=test"`              | 매개변수가 있는 메모리       |
| `"///path/to/test.db?param1=value1&param2=value2"`   | 매개변수가 있는 절대 경로    |

**쿼리 매개변수 처리**

쿼리 매개변수는 시작 인수로 ClickHouse 엔진에 전달됩니다.
특별 매개변수 처리:

| 특별 매개변수  | 변환되는 내용       | 설명                     |
|------------------|-------------------|-------------------------|
| `mode=ro`        | `--readonly=1`    | 읽기 전용 모드           |
| `verbose`        | (플래그)          | 자세한 로깅 활성화       |
| `log-level=test` | (설정)            | 로깅 수준 설정           |

전체 매개변수 목록은 `clickhouse local --help --verbose`를 참조하십시오.

**반환값**

| 반환 유형  | 설명                                                                                                                                                                                                                                        |
|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Connection` | 다음을 지원하는 데이터베이스 연결 객체:<br/>• `Connection.cursor()`로 커서 생성하기<br/>• `Connection.query()`로 직접 쿼리하기<br/>• `Connection.send_query()`로 스트리밍 쿼리하기<br/>• 자동 정리를 위한 컨텍스트 관리 프로토콜 |

**예외 발생**

| 예외            | 조건                              |
|-----------------|------------------------------------|
| `RuntimeError`   | 데이터베이스에 연결할 수 없는 경우  |

:::warning
프로세스당 하나의 연결만 지원됩니다.
새 연결을 생성하면 기존 연결이 종료됩니다.
:::

**예제**

```pycon
>>> # In-memory database
>>> conn = connect()
>>> conn = connect(":memory:")
>>>
>>> # File-based database
>>> conn = connect("my_data.db")
>>> conn = connect("/path/to/data.db")
>>>
>>> # With parameters
>>> conn = connect("data.db?mode=ro")  # Read-only mode
>>> conn = connect(":memory:?verbose&log-level=debug")  # Debug logging
>>>
>>> # Using context manager for automatic cleanup
>>> with connect("data.db") as conn:
...     result = conn.query("SELECT 1")
...     print(result)
>>> # Connection automatically closed
```

**참고**
- [`Connection`](#chdb-state-sqlitelike-connection) - 데이터베이스 연결 클래스
- [`Cursor`](#chdb-state-sqlitelike-cursor) - DB-API 2.0 작업을 위한 데이터베이스 커서
## Exception Handling {#chdb-exceptions}
### **class** `chdb.ChdbError` {#chdb_chdbError}

Bases: `Exception`

chDB 관련 오류에 대한 기본 예외 클래스입니다.

이 예외는 chDB 쿼리 실행에 실패하거나 오류가 발생하는 경우 발생합니다. 표준 Python Exception 클래스에서 상속하며, 기본 ClickHouse 엔진에서 오류 정보를 제공합니다.

---
### **class** `chdb.session.Session` {#chdb_session_session}

Bases: `object`

세션은 쿼리 상태를 유지합니다.
경로가 None인 경우 임시 디렉터리를 만들어 데이터베이스 경로로 사용하며, 세션이 종료될 때 임시 디렉터리는 삭제됩니다.
데이터를 유지할 경로를 제공하여 데이터베이스를 생성할 수도 있습니다.

연결 문자열을 사용하여 경로와 기타 매개변수를 전달할 수도 있습니다.

```python
class chdb.session.Session(path=None)
```

**예제**

| 연결 문자열                                        | 설명                                 |
|-----------------------------------------------------|-------------------------------------|
| `":memory:"`                                        | 메모리 내 데이터베이스               |
| `"test.db"`                                         | 상대 경로                            |
| `"file:test.db"`                                    | 위와 동일                          |
| `"/path/to/test.db"`                                | 절대 경로                            |
| `"file:/path/to/test.db"`                           | 위와 동일                          |
| `"file:test.db?param1=value1&param2=value2"`         | 쿼리 매개변수가 있는 상대 경로       |
| `"file::memory:?verbose&log-level=test"`             | 쿼리 매개변수가 있는 메모리 데이터베이스 |
| `"///path/to/test.db?param1=value1&param2=value2"` | 쿼리 매개변수가 있는 절대 경로       |

:::note 연결 문자열 인자 처리

Connection strings containing query params like “[file:test.db?param1=value1&param2=value2](file:test.db?param1=value1&param2=value2)”
“param1=value1” will be passed to ClickHouse engine as start up args.

더 많은 세부정보는 `clickhouse local –help –verbose`을 참고하십시오.

특별 인자 처리:
- “mode=ro”는 clickhouse에 대해 “–readonly=1”이 됩니다(읽기 전용 모드)
:::

:::warning 중요
- 한 번에 하나의 세션만 있을 수 있습니다. 새 세션을 만들려면 기존 세션을 닫아야 합니다.
- 새 세션을 만들면 기존 세션이 닫힙니다.
:::

---
#### `cleanup` {#cleanup}

예외 처리와 함께 세션 리소스를 정리합니다.

이 메서드는 정리 과정에서 발생할 수 있는 예외를 무시하면서 세션을 닫으려고 합니다. 이는 오류 처리 시나리오나 세션 상태에 관계없이 정리가 발생하도록 해야 할 때 유용합니다.

**구문**

```python
cleanup()
```

:::note
이 메서드는 결코 예외를 발생시키지 않으므로 finally 블록이나 소멸자에서 호출하기 안전합니다.
:::

**예제**

```pycon
>>> session = Session("test.db")
>>> try:
...     session.query("INVALID SQL")
... finally:
...     session.cleanup()  # Safe cleanup regardless of errors
```

**참고**
- [`close()`](#chdb-session-session-close) - 오류 전파가 있는 명시적인 세션 닫기를 위한 메서드

---
#### `close` {#close}

세션을 닫고 리소스를 정리합니다.

이 메서드는 기본 연결을 닫고 전역 세션 상태를 리셋합니다.
이 메서드를 호출한 후 세션은 유효하지 않게 되며 더 이상 쿼리에 사용할 수 없습니다.

**구문**

```python
close()
```

:::note
이 메서드는 세션이 컨텍스트 관리자로 사용되거나 세션 객체가 파괴될 때 자동으로 호출됩니다.
:::

:::warning 중요
`close()` 호출 이후에 세션을 사용하려고 하면 오류가 발생합니다.
:::

**예제**

```pycon
>>> session = Session("test.db")
>>> session.query("SELECT 1")
>>> session.close()  # Explicitly close the session
```

---
#### `query` {#chdb-session-session-query}

SQL 쿼리를 실행하고 결과를 반환합니다.

이 메서드는 세션의 데이터베이스에 대한 SQL 쿼리를 실행하고 지정된 형식으로 결과를 반환합니다. 이 메서드는 다양한 출력 형식을 지원하며 쿼리 간의 세션 상태를 유지합니다.

**구문**

```python
query(sql, fmt='CSV', udf_path='')
```

**매개변수**

| 매개변수          | 유형    | 기본값      | 설명                                                                                                                                                                                                                                                                                                                  |
|-------------------|---------|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`             | str     | *필수*      | 실행할 SQL 쿼리 문자열                                                                                                                                                                                                                                                                                                  |
| `fmt`             | str     | `"CSV"`     | 결과의 출력 형식. 사용 가능한 형식:<br/>• `"CSV"` - 쉼표로 구분된 값<br/>• `"JSON"` - JSON 형식<br/>• `"TabSeparated"` - 탭으로 구분된 값<br/>• `"Pretty"` - 예쁘게 출력된 테이블 형식<br/>• `"JSONCompact"` - 압축된 JSON 형식<br/>• `"Arrow"` - Apache Arrow 형식<br/>• `"Parquet"` - Parquet 형식 |
| `udf_path`        | str     | `""`        | 사용자 정의 함수 경로. 지정하지 않으면 세션 초기화에서 UDF 경로를 사용합니다.                                                                                                                                                                                                                                           |

**반환값**

지정된 형식으로 쿼리 결과를 반환합니다.
정확한 반환 유형은 형식 매개변수에 따라 다릅니다:
- 문자열 형식 (CSV, JSON 등)은 str을 반환합니다.
- 이진 형식 (Arrow, Parquet)은 bytes를 반환합니다.

**예외 발생**

| 예외            | 조건                              |
|-----------------|------------------------------------|
| `RuntimeError`     | 세션이 닫혀있거나 유효하지 않은 경우 |
| `ValueError`   | SQL 쿼리가 잘못된 경우             |

:::note
"Debug" 형식은 지원되지 않으며 경고와 함께 "CSV"로 자동 변환됩니다.
디버깅할 때는 대신 연결 문자열 매개변수를 사용하세요.
:::

:::warning 경고
이 메서드는 쿼리를 동기적으로 실행하고 모든 결과를 메모리에 로드합니다. 큰 결과 집합의 경우 [`send_query()`](#chdb-session-session-send_query) 사용을 고려하세요.
:::

**예제**

```pycon
>>> session = Session("test.db")
>>>
>>> # Basic query with default CSV format
>>> result = session.query("SELECT 1 as number")
>>> print(result)
number
1
```

```pycon
>>> # Query with JSON format
>>> result = session.query("SELECT 1 as number", fmt="JSON")
>>> print(result)
{"number": "1"}
```

```pycon
>>> # Complex query with table creation
>>> session.query("CREATE TABLE test (id INT, name String) ENGINE = Memory")
>>> session.query("INSERT INTO test VALUES (1, 'Alice'), (2, 'Bob')")
>>> result = session.query("SELECT * FROM test ORDER BY id")
>>> print(result)
id,name
1,Alice
2,Bob
```

**참조**
- [`send_query()`](#chdb-session-session-send_query) - 스트리밍 쿼리 실행을 위한 메서드
- [`sql`](#chdb-session-session-sql) - 이 메서드의 별칭

---
#### `send_query` {#chdb-session-session-send_query}

SQL 쿼리를 실행하고 스트리밍 결과 반복자를 반환합니다.

이 메서드는 세션의 데이터베이스에 대한 SQL 쿼리를 실행하고 모든 데이터를 한 번에 메모리에 로드하지 않고 결과를 반복할 수 있는 스트리밍 결과 객체를 반환합니다. 이는 특히 큰 결과 집합에 유용합니다.

**구문**

```python
send_query(sql, fmt='CSV') → StreamingResult
```

**매개변수**

| 매개변수       | 유형    | 기본값      | 설명                                                                                                                                                                                                                                                                    |
|----------------|---------|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`          | str     | *필수*      | 실행할 SQL 쿼리 문자열                                                                                                                                                                                                                                                    |
| `fmt`          | str     | `"CSV"`     | 결과의 출력 형식. 사용 가능한 형식:<br/>• `"CSV"` - 쉼표로 구분된 값<br/>• `"JSON"` - JSON 형식<br/>• `"TabSeparated"` - 탭으로 구분된 값<br/>• `"JSONCompact"` - 압축된 JSON 형식<br/>• `"Arrow"` - Apache Arrow 형식<br/>• `"Parquet"` - Parquet 형식 |

**반환값**

| 반환 유형       | 설명                                                                                                                     |
|-----------------|--------------------------------------------------------------------------------------------------------------------------|
| `StreamingResult` | 쿼리 결과를 점진적으로 생성하는 스트리밍 결과 반복자. 반복자는 for 루프에서 사용할 수 있거나 다른 데이터 구조로 변환될 수 있습니다. |

**예외 발생**

| 예외            | 조건                              |
|-----------------|------------------------------------|
| `RuntimeError`     | 세션이 닫혀 있거나 유효하지 않은 경우 |
| `ValueError`   | SQL 쿼리가 잘못된 경우             |

:::note
"Debug" 형식은 지원되지 않으며 경고와 함께 "CSV"로 자동 변환됩니다. 디버깅할 때는 대신 연결 문자열 매개변수를 사용하세요.
:::

:::warning
반환된 StreamingResult 객체는 즉시 소비되거나 적절히 저장되어야 하며, 데이터베이스에 대한 연결을 유지합니다.
:::

**예제**

```pycon
>>> session = Session("test.db")
>>> session.query("CREATE TABLE big_table (id INT, data String) ENGINE = MergeTree() order by id")
>>>
>>> # Insert large dataset
>>> for i in range(1000):
...     session.query(f"INSERT INTO big_table VALUES ({i}, 'data_{i}')")
>>>
>>> # Stream results to avoid memory issues
>>> streaming_result = session.send_query("SELECT * FROM big_table ORDER BY id")
>>> for chunk in streaming_result:
...     print(f"Processing chunk: {len(chunk)} bytes")
...     # Process chunk without loading entire result set
```

```pycon
>>> # Using with context manager
>>> with session.send_query("SELECT COUNT(*) FROM big_table") as stream:
...     for result in stream:
...         print(f"Count result: {result}")
```

**참조**
- [`query()`](#chdb-session-session-query) - 비스트리밍 쿼리 실행을 위한 메서드
- `chdb.state.sqlitelike.StreamingResult` - 스트리밍 결과 반복자

---
#### `sql` {#chdb-session-session-sql}

SQL 쿼리를 실행하고 결과를 반환합니다.

이 메서드는 세션의 데이터베이스에 대한 SQL 쿼리를 실행하고 지정된 형식으로 결과를 반환합니다. 이 메서드는 다양한 출력 형식을 지원하며 쿼리 간의 세션 상태를 유지합니다.

**구문**

```python
sql(sql, fmt='CSV', udf_path='')
```

**매개변수**

| 매개변수          | 유형    | 기본값      | 설명                                                                                                                                                                                                                                                                                                                  |
|-------------------|---------|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`             | str     | *필수*      | 실행할 SQL 쿼리 문자열                                                                                                                                                                                                                                                                                                  |
| `fmt`             | str     | `"CSV"`     | 결과의 출력 형식. 사용 가능한 형식:<br/>• `"CSV"` - 쉼표로 구분된 값<br/>• `"JSON"` - JSON 형식<br/>• `"TabSeparated"` - 탭으로 구분된 값<br/>• `"Pretty"` - 예쁘게 출력된 테이블 형식<br/>• `"JSONCompact"` - 압축된 JSON 형식<br/>• `"Arrow"` - Apache Arrow 형식<br/>• `"Parquet"` - Parquet 형식 |
| `udf_path`        | str     | `""`        | 사용자 정의 함수 경로. 지정하지 않으면 세션 초기화에서 UDF 경로를 사용합니다.                                                                                                                                                                                                                                           |

**반환값**

지정된 형식으로 쿼리 결과를 반환합니다.
정확한 반환 유형은 형식 매개변수에 따라 다릅니다:
- 문자열 형식 (CSV, JSON 등)은 str을 반환합니다.
- 이진 형식 (Arrow, Parquet)은 bytes를 반환합니다.

**예외 발생:**

| 예외            | 조건                              |
|-----------------|------------------------------------|
| `RuntimeError`     | 세션이 닫혀있거나 유효하지 않은 경우 |
| `ValueError`   | SQL 쿼리가 잘못된 경우             |

:::note
"Debug" 형식은 지원되지 않으며 경고와 함께 "CSV"로 자동 변환됩니다. 디버깅할 때는 대신 연결 문자열 매개변수를 사용하세요.
:::

:::warning 경고
이 메서드는 쿼리를 동기적으로 실행하고 모든 결과를 메모리에 로드합니다. 큰 결과 집합의 경우 [`send_query()`](#chdb-session-session-send_query) 사용을 고려하세요.
:::

**예제**

```pycon
>>> session = Session("test.db")
>>>
>>> # Basic query with default CSV format
>>> result = session.query("SELECT 1 as number")
>>> print(result)
number
1
```

```pycon
>>> # Query with JSON format
>>> result = session.query("SELECT 1 as number", fmt="JSON")
>>> print(result)
{"number": "1"}
```

```pycon
>>> # Complex query with table creation
>>> session.query("CREATE TABLE test (id INT, name String) ENGINE = MergeTree() order by id")
>>> session.query("INSERT INTO test VALUES (1, 'Alice'), (2, 'Bob')")
>>> result = session.query("SELECT * FROM test ORDER BY id")
>>> print(result)
id,name
1,Alice
2,Bob
```

**참조**
- [`send_query()`](#chdb-session-session-send_query) - 스트리밍 쿼리 실행을 위한 메서드
- [`sql`](#chdb-session-session-sql) - 이 메서드의 별칭
## State Management {#chdb-state-management}
### `chdb.state.connect` {#chdb_state_connect}

chDB 백그라운드 서버에 대한 [Connection](#chdb-state-sqlitelike-connection)을 생성합니다.

이 함수는 chDB(ClickHouse) 데이터베이스 엔진에 대한 연결을 설정합니다.
프로세스당 하나의 열린 연결만 허용됩니다. 여러 번 같은 연결 문자열로 호출하면 동일한 연결 객체가 반환됩니다.

**구문**

```python
chdb.state.connect(connection_string: str = ':memory:') → Connection
```

**매개변수**

| 매개변수                           | 유형    | 기본값      | 설명                                      |
|------------------------------------|---------|--------------|------------------------------------------|
| `connection_string(str, optional)` | str     | `":memory:"` | 데이터베이스 연결 문자열. 아래 형식 참조. |

**기본 형식**

지원되는 연결 문자열 형식:

| 형식                    | 설명                          |
|-------------------------|-------------------------------|
| `":memory:"`            | 메모리 내 데이터베이스(기본값) |
| `"test.db"`             | 상대 경로 데이터베이스 파일    |
| `"file:test.db"`        | 상대 경로와 동일               |
| `"/path/to/test.db"`    | 절대 경로 데이터베이스 파일    |
| `"file:/path/to/test.db"` | 절대 경로와 동일               |

**쿼리 매개변수와 함께**

| 형식                                                 | 설명                        |
|-------------------------------------------------------|-----------------------------|
| `"file:test.db?param1=value1&param2=value2"`         | 매개변수가 있는 상대 경로    |
| `"file::memory:?verbose&log-level=test"`              | 매개변수가 있는 메모리       |
| `"///path/to/test.db?param1=value1&param2=value2"`   | 매개변수가 있는 절대 경로    |

**쿼리 매개변수 처리**

쿼리 매개변수는 시작 인수로 ClickHouse 엔진에 전달됩니다.
특별 매개변수 처리:

| 특별 매개변수  | 변환되는 내용       | 설명                     |
|------------------|-------------------|-------------------------|
| `mode=ro`        | `--readonly=1`    | 읽기 전용 모드           |
| `verbose`        | (플래그)          | 자세한 로깅 활성화       |
| `log-level=test` | (설정)            | 로깅 수준 설정           |

전체 매개변수 목록은 `clickhouse local --help --verbose`를 참조하십시오.

**반환값**

| 반환 유형  | 설명                                                                                                                                                                                                                                        |
|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Connection` | 다음을 지원하는 데이터베이스 연결 객체:<br/>• `Connection.cursor()`로 커서 생성하기<br/>• `Connection.query()`로 직접 쿼리하기<br/>• `Connection.send_query()`로 스트리밍 쿼리하기<br/>• 자동 정리를 위한 컨텍스트 관리 프로토콜 |

**예외 발생**

| 예외            | 조건                              |
|-----------------|------------------------------------|
| `RuntimeError`   | 데이터베이스에 연결할 수 없는 경우  |

:::warning 경고
프로세스당 하나의 연결만 지원됩니다.
새 연결을 생성하면 기존 연결이 종료됩니다.
:::

**예제**

```pycon
>>> # In-memory database
>>> conn = connect()
>>> conn = connect(":memory:")
>>>
>>> # File-based database
>>> conn = connect("my_data.db")
>>> conn = connect("/path/to/data.db")
>>>
>>> # With parameters
>>> conn = connect("data.db?mode=ro")  # Read-only mode
>>> conn = connect(":memory:?verbose&log-level=debug")  # Debug logging
>>>
>>> # Using context manager for automatic cleanup
>>> with connect("data.db") as conn:
...     result = conn.query("SELECT 1")
...     print(result)
>>> # Connection automatically closed
```

**참고**
- `Connection` - 데이터베이스 연결 클래스
- `Cursor` - DB-API 2.0 작업을 위한 데이터베이스 커서
### **class** `chdb.state.sqlitelike.Connection` {#chdb-state-sqlitelike-connection}

Bases: `object`

**구문**

```python
class chdb.state.sqlitelike.Connection(connection_string: str)
```

---
#### `close` {#chdb-session-session-close}

연결을 닫고 리소스를 정리합니다.

이 메서드는 데이터베이스 연결을 닫고 활동 중인 커서를 포함한 모든 관련 리소스를 정리합니다. 이 메서드를 호출한 후 연결은 유효하지 않게 되며 더 이상 추가 작업에 사용할 수 없습니다.

**구문**

```python
close() → None
```

:::note
이 메서드는 멱등성입니다 - 여러 번 호출하는 것은 안전합니다.
:::

:::warning 경고
연결이 닫힐 때 진행 중인 스트리밍 쿼리는 취소됩니다. 닫기 전에 모든 중요한 데이터가 처리되었는지 확인하십시오.
:::

**예제**

```pycon
>>> conn = connect("test.db")
>>> # Use connection for queries
>>> conn.query("CREATE TABLE test (id INT) ENGINE = Memory")
>>> # Close when done
>>> conn.close()
```

```pycon
>>> # Using with context manager (automatic cleanup)
>>> with connect("test.db") as conn:
...     conn.query("SELECT 1")
...     # Connection automatically closed
```

---
#### `cursor` {#chdb-state-sqlitelike-connection-cursor}

쿼리를 실행하기 위한 [Cursor](#chdb-state-sqlitelike-cursor) 객체를 생성합니다.

이 메서드는 쿼리를 실행하고 결과를 가져오는 표준 DB-API 2.0 인터페이스를 제공하는 데이터베이스 커서를 만듭니다. 커서는 쿼리 실행 및 결과 검색에 대한 세밀한 제어를 허용합니다.

**구문**

```python
cursor() → Cursor
```

**반환값**

| 반환 유형  | 설명                             |
|------------|----------------------------------|
| `Cursor`   | 데이터베이스 작업을 위한 커서 객체 |

:::note
새로운 커서를 생성하면 이 연결과 관련된 기존 커서는 대체됩니다. 연결 당 하나의 커서만 지원됩니다.
:::

**예시**

```pycon
>>> conn = connect(":memory:")
>>> cursor = conn.cursor()
>>> cursor.execute("CREATE TABLE test (id INT, name String) ENGINE = Memory")
>>> cursor.execute("INSERT INTO test VALUES (1, 'Alice')")
>>> cursor.execute("SELECT * FROM test")
>>> rows = cursor.fetchall()
>>> print(rows)
((1, 'Alice'),)
```

**참조**
- [`Cursor`](#chdb-state-sqlitelike-cursor) - 데이터베이스 커서 구현

---
#### `query` {#chdb-state-sqlitelike-connection-query}

SQL 쿼리를 실행하고 전체 결과를 반환합니다.

이 메서드는 SQL 쿼리를 동기식으로 실행하고 전체 결과 집합을 반환합니다. 다양한 출력 형식을 지원하며 형식에 맞는 후처리를 자동으로 적용합니다.

**구문**

```python
query(query: str, format: str = 'CSV') → Any
```

**매개변수:**

| 매개변수  | 유형  | 기본값    | 설명                                                                                                                                                                                                                                                                                  |
|------------|-------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `query`    | str   | *필수*    | 실행할 SQL 쿼리 문자열                                                                                                                                                                                                                                                               |
| `format`   | str   | `"CSV"`    | 결과의 출력 형식. 지원되는 형식:<br/>• `"CSV"` - 쉼표로 구분된 값 (문자열)<br/>• `"JSON"` - JSON 형식 (문자열)<br/>• `"Arrow"` - Apache Arrow 형식 (바이트)<br/>• `"Dataframe"` - Pandas DataFrame (pandas 필요)<br/>• `"Arrowtable"` - PyArrow Table (pyarrow 필요) |

**반환값**

| 반환 유형          | 설명                                   |
|--------------------|----------------------------------------|
| `str`              | 문자열 형식의 경우 (CSV, JSON)         |
| `bytes`            | Arrow 형식의 경우                       |
| `pandas.DataFrame` | 데이터프레임 형식의 경우                |
| `pyarrow.Table`    | arrowtable 형식의 경우                 |

**예외**

| 예외          | 조건                                    |
|---------------|-----------------------------------------|
| `RuntimeError` | 쿼리 실행 실패 시                      |
| `ImportError`  | 형식에 필요한 패키지가 설치되지 않았을 경우 |

:::warning 경고
이 메서드는 전체 결과 집합을 메모리에 로드합니다. 대규모 결과를 처리할 경우, [`send_query()`](#chdb-state-sqlitelike-connection-send_query)를 사용하여 스트리밍하는 것을 고려하십시오.
:::

**예시**

```pycon
>>> conn = connect(":memory:")
>>>
>>> # Basic CSV query
>>> result = conn.query("SELECT 1 as num, 'hello' as text")
>>> print(result)
num,text
1,hello
```

```pycon
>>> # DataFrame format
>>> df = conn.query("SELECT number FROM numbers(5)", "dataframe")
>>> print(df)
   number
0       0
1       1
2       2
3       3
4       4
```

**참조**
- [`send_query()`](#chdb-state-sqlitelike-connection-send_query) - 비스트리밍 쿼리 실행을 위한

---
#### `send_query` {#chdb-state-sqlitelike-connection-send_query}

SQL 쿼리를 실행하고 스트리밍 결과 반복자를 반환합니다.

이 메서드는 SQL 쿼리를 실행하고 결과를 한 번에 모두 로드하지 않고 반복할 수 있는 StreamingResult 객체를 반환합니다. 이는 대규모 결과 집합을 처리하는 데 이상적입니다.

**구문**

```python
send_query(query: str, format: str = 'CSV') → StreamingResult
```

**매개변수**

| 매개변수  | 유형  | 기본값    | 설명                                                                                                                                                                                                                         |
|------------|-------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `query`    | str   | *필수*    | 실행할 SQL 쿼리 문자열                                                                                                                                                                                                       |
| `format`   | str   | `"CSV"`    | 결과의 출력 형식. 지원되는 형식:<br/>• `"CSV"` - 쉼표로 구분된 값<br/>• `"JSON"` - JSON 형식<br/>• `"Arrow"` - Apache Arrow 형식 (record_batch() 메서드 사용 가능)<br/>• `"dataframe"` - Pandas DataFrame 청크<br/>• `"arrowtable"` - PyArrow Table 청크 |

**반환값**

| 반환 유형        | 설명                                                                                                                                                                                              |
|------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `StreamingResult` | 쿼리 결과에 대한 스트리밍 반복기를 제공합니다:<br/>• 반복자 프로토콜 (for 루프)<br/>• 컨텍스트 관리자 프로토콜 (with 문)<br/>• fetch() 메서드를 통한 수동 가져오기<br/>• PyArrow RecordBatch 스트리밍 (Arrow 형식 전용) |

**예외**

| 예외          | 조건                                    |
|---------------|-----------------------------------------|
| `RuntimeError` | 쿼리 실행 실패 시                      |
| `ImportError`  | 형식에 필요한 패키지가 설치되지 않았을 경우 |

:::note
반환된 StreamingResult에서 `record_batch()` 메서드를 지원하는 것은 "Arrow" 형식만 가능합니다.
:::

**예시**

```pycon
>>> conn = connect(":memory:")
>>>
>>> # Basic streaming
>>> stream = conn.send_query("SELECT number FROM numbers(1000)")
>>> for chunk in stream:
...     print(f"Processing chunk: {len(chunk)} bytes")
```

```pycon
>>> # Using context manager for cleanup
>>> with conn.send_query("SELECT * FROM large_table") as stream:
...     chunk = stream.fetch()
...     while chunk:
...         process_data(chunk)
...         chunk = stream.fetch()
```

```pycon
>>> # Arrow format with RecordBatch streaming
>>> stream = conn.send_query("SELECT * FROM data", "Arrow")
>>> reader = stream.record_batch(rows_per_batch=10000)
>>> for batch in reader:
...     print(f"Batch shape: {batch.num_rows} x {batch.num_columns}")
```

**참조**
- [`query()`](#chdb-state-sqlitelike-connection-query) - 비스트리밍 쿼리 실행을 위한
- `StreamingResult` - 스트리밍 결과 반복자

---
### **class** `chdb.state.sqlitelike.Cursor` {#chdb-state-sqlitelike-cursor}

기초: `object`

```python
class chdb.state.sqlitelike.Cursor(connection)
```

---
#### `close` {#cursor-close-none}

커서를 닫고 리소스를 정리합니다.

이 메서드는 커서를 닫고 관련된 리소스를 정리합니다. 이 메서드를 호출한 후 커서는 유효하지 않게 되어 더 이상 작업을 수행할 수 없습니다.

**구문**

```python
close() → None
```

:::note
이 메서드는 항등적입니다 - 여러 번 호출해도 안전합니다. 연결이 닫힐 때 커서도 자동으로 닫힙니다.
:::

**예시**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT 1")
>>> result = cursor.fetchone()
>>> cursor.close()  # Cleanup cursor resources
```

---
#### `column_names` {#chdb-state-sqlitelike-cursor-column_names}

마지막으로 실행된 쿼리의 컬럼 이름 목록을 반환합니다.

이 메서드는 가장 최근에 실행된 SELECT 쿼리의 컬럼 이름을 반환합니다. 이름은 결과 집합에 나타나는 순서와 동일하게 반환됩니다.

**구문**

```python
column_names() → list
```

**반환값**

| 반환 유형  | 설명                                                                                                      |
|------------|-----------------------------------------------------------------------------------------------------------|
| `list`     | 컬럼 이름 문자열 목록, 쿼리가 실행되지 않았거나 쿼리가 컬럼을 반환하지 않는 경우 빈 목록 반환 |

**예시**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name, email FROM users LIMIT 1")
>>> print(cursor.column_names())
['id', 'name', 'email']
```

**참조**
- [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - 컬럼 유형 정보 가져오기
- [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0 컬럼 설명

---
#### `column_types` {#chdb-state-sqlitelike-cursor-column_types}

마지막으로 실행된 쿼리의 컬럼 유형 목록을 반환합니다.

이 메서드는 가장 최근에 실행된 SELECT 쿼리의 ClickHouse 컬럼 유형 이름을 반환합니다. 유형은 결과 집합에 나타나는 순서와 동일하게 반환됩니다.

**구문**

```python
column_types() → list
```

**반환값**

| 반환 유형 | 설명 |
|-----------|-------|
| `list`    | ClickHouse 유형 이름 문자열 목록, 쿼리가 실행되지 않았거나 쿼리가 컬럼을 반환하지 않는 경우 빈 목록 반환 |

**예시**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT toInt32(1), toString('hello')")
>>> print(cursor.column_types())
['Int32', 'String']
```

**참조**
- [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - 컬럼 이름 정보 가져오기
- [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0 컬럼 설명

---
#### `commit` {#commit}

보류 중인 트랜잭션을 커밋합니다.

이 메서드는 보류 중인 데이터베이스 트랜잭션을 커밋합니다. ClickHouse에서는 대부분의 작업이 자동 커밋되지만, 이 메서드는 DB-API 2.0 호환성을 위해 제공됩니다.

:::note
ClickHouse는 일반적으로 작업을 자동으로 커밋하므로 명시적인 커밋은 보통 필요하지 않습니다. 이 메서드는 표준 DB-API 2.0 워크플로우와의 호환성을 위해 제공됩니다.
:::

**구문**

```python
commit() → None
```

**예시**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("INSERT INTO test VALUES (1, 'data')")
>>> cursor.commit()
```

---
#### `property description : list` {#chdb-state-sqlitelike-cursor-description}

DB-API 2.0 사양에 따라 컬럼 설명을 반환합니다.

이 속성은 가장 최근에 실행된 SELECT 쿼리의 결과 집합에서 각 컬럼을 설명하는 7개 항목의 튜플 목록을 반환합니다. 각 튜플은 다음을 포함합니다: (name, type_code, display_size, internal_size, precision, scale, null_ok)

현재는 name과 type_code만 제공되며, 나머지 필드는 None으로 설정되어 있습니다.

**반환값**

| 반환 유형 | 설명 |
|-----------|-------|
| `list`    | 각 컬럼을 설명하는 7개의 튜플 목록, 또는 SELECT 쿼리가 실행되지 않은 경우 빈 목록 반환 |

:::note
이 구현은 cursor.description에 대한 DB-API 2.0 사양을 따릅니다. 첫 번째 두 요소 (name 및 type_code)만 의미 있는 데이터를 포함합니다.
:::

**예시**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users LIMIT 1")
>>> for desc in cursor.description:
...     print(f"Column: {desc[0]}, Type: {desc[1]}")
Column: id, Type: Int32
Column: name, Type: String
```

**참조**
- [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - 컬럼 이름만 가져오기
- [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - 컬럼 유형만 가져오기

---
#### `execute` {#execute}

SQL 쿼리를 실행하고 결과를 가져올 준비를 합니다.

이 메서드는 SQL 쿼리를 실행하고 fetch 메서드를 사용하여 결과를 검색할 준비를 합니다. 결과 데이터의 구문 분석 및 ClickHouse 데이터 유형에 대한 자동 유형 변환을 처리합니다.

**구문**

```python
execute(query: str) → None
```

**매개변수:**

| 매개변수  | 유형  | 설명                                  |
|------------|-------|---------------------------------------|
| `query`    | str   | 실행할 SQL 쿼리 문자열               |

**예외**

| 예외          | 조건 |
|---------------|------|
| `Exception`   | 쿼리 실행 실패 또는 결과 구문 분석 실패 시 |

:::note
이 메서드는 `cursor.execute()`에 대한 DB-API 2.0 사양을 따릅니다. 실행 후, `fetchone()`, `fetchmany()`, 또는 `fetchall()`을 사용하여 결과를 검색하십시오.
:::

:::note
이 메서드는 ClickHouse 데이터 유형을 적절한 Python 유형으로 자동 변환합니다:

- Int/UInt 유형 → int
- Float 유형 → float
- String/FixedString → str
- DateTime → datetime.datetime
- Date → datetime.date
- Bool → bool
:::

**예시**

```pycon
>>> cursor = conn.cursor()
>>>
>>> # Execute DDL
>>> cursor.execute("CREATE TABLE test (id INT, name String) ENGINE = Memory")
>>>
>>> # Execute DML
>>> cursor.execute("INSERT INTO test VALUES (1, 'Alice')")
>>>
>>> # Execute SELECT and fetch results
>>> cursor.execute("SELECT * FROM test")
>>> rows = cursor.fetchall()
>>> print(rows)
((1, 'Alice'),)
```

**참조**
- [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 단일 행 가져오기
- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 여러 행 가져오기
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 남은 모든 행 가져오기

---
#### `fetchall` {#chdb-state-sqlitelike-cursor-fetchall}

쿼리 결과에서 모든 남은 행을 가져옵니다.

이 메서드는 현재 커서 위치에서 시작하여 현재 쿼리 결과 집합에서 남은 모든 행을 검색합니다. 적절한 Python 유형 변환이 적용된 행 튜플의 튜플을 반환합니다.

**구문**

```python
fetchall() → tuple
```

**반환값:**

| 반환 유형 | 설명 |
|-----------|-------|
| `tuple`    | 결과 집합에서 남은 모든 행 튜플을 포함하는 튜플. 사용할 수 있는 행이 없으면 빈 튜플 반환 |

:::warning 경고
이 메서드는 모든 남은 행을 한 번에 메모리에 로드합니다. 대규모 결과 집합을 처리할 경우, [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany)를 사용하여 배치 방식으로 결과를 처리하는 것을 고려하십시오.
:::

**예시**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users")
>>> all_users = cursor.fetchall()
>>> for user_id, user_name in all_users:
...     print(f"User {user_id}: {user_name}")
```

**참조**
- [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 단일 행 가져오기
- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 여러 행 배치로 가져오기

---
#### `fetchmany` {#chdb-state-sqlitelike-cursor-fetchmany}

쿼리 결과에서 여러 행을 가져옵니다.

이 메서드는 현재 쿼리 결과 집합에서 최대 ‘size’ 행을 검색합니다. 각 행은 적절한 Python 유형 변환이 적용된 컬럼 값을 포함하는 행 튜플을 반환합니다.

**구문**

```python
fetchmany(size: int = 1) → tuple
```

**매개변수**

| 매개변수 | 유형 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `size`    | int  | `1`     | 가져올 최대 행 수 |

**반환값**

| 반환 유형 | 설명                                                                                   |
|-----------|---------------------------------------------------------------------------------------|
| `tuple`   | 최대 'size' 행 튜플을 포함하는 튜플. 결과 집합이 소진된 경우 더 적은 행을 포함할 수 있음 |

:::note
이 메서드는 DB-API 2.0 사양을 따릅니다. 결과 집합이 소진된 경우 ‘size’보다 적은 행을 반환합니다.
:::

**예시**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT * FROM large_table")
>>>
>>> # Process results in batches
>>> while True:
...     batch = cursor.fetchmany(100)  # Fetch 100 rows at a time
...     if not batch:
...         break
...     process_batch(batch)
```

**참조**
- [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 단일 행 가져오기
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 남은 모든 행 가져오기

---
#### `fetchone` {#chdb-state-sqlitelike-cursor-fetchone}

쿼리 결과에서 다음 행을 가져옵니다.

이 메서드는 현재 쿼리 결과 집합에서 다음 사용 가능한 행을 검색합니다. 적절한 Python 유형 변환이 적용된 컬럼 값을 포함하는 튜플을 반환합니다.

**구문**

```python
fetchone() → tuple | None
```

**반환값:**

| 반환 유형       | 설명                                                                 |
|------------------|----------------------------------------------------------------------|
| `Optional[tuple]` | 다음 행을 컬럼 값의 튜플로 반환, 더 이상 행이 없으면 None 반환 |

:::note
이 메서드는 DB-API 2.0 사양을 따릅니다. 컬럼 값은 ClickHouse 컬럼 유형에 따라 자동으로 적절한 Python 유형으로 변환됩니다.
:::

**예시**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users")
>>> row = cursor.fetchone()
>>> while row is not None:
...     user_id, user_name = row
...     print(f"User {user_id}: {user_name}")
...     row = cursor.fetchone()
```

**참조**
- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 여러 행 가져오기
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 남은 모든 행 가져오기

---
### `chdb.state.sqlitelike` {#state-sqlitelike-to_arrowtable}

쿼리 결과를 PyArrow Table로 변환합니다.

이 함수는 chdb 쿼리 결과를 PyArrow Table 형식으로 변환하며, 이는 효율적인 컬럼형 데이터 접근과 다른 데이터 처리 라이브러리와의 상호 운용성을 제공합니다.

**구문**

```python
chdb.state.sqlitelike.to_arrowTable(res)
```

**매개변수:**

| 매개변수  | 유형  | 설명                                                 |
|------------|-------|-----------------------------------------------------|
| `res`      | -     | Arrow 형식 데이터를 포함하는 chdb의 쿼리 결과 객체 |

**반환값**

| 반환 유형     | 설명                                |
|---------------|-------------------------------------|
| `pyarrow.Table` | 쿼리 결과를 포함하는 PyArrow Table |

**예외**

| 예외         | 조건                                       |
|--------------|--------------------------------------------|
| `ImportError` | pyarrow 또는 pandas 패키지가 설치되지 않았을 경우 |

:::note
이 기능은 pyarrow와 pandas가 모두 설치되어 있어야 합니다. 설치하려면: `pip install pyarrow pandas`
:::

:::warning 경고
빈 결과는 스키마가 없는 빈 PyArrow Table을 반환합니다.
:::

**예시**

```pycon
>>> import chdb
>>> result = chdb.query("SELECT 1 as num, 'hello' as text", "Arrow")
>>> table = to_arrowTable(result)
>>> print(table.schema)
num: int64
text: string
>>> print(table.to_pandas())
   num   text
0    1  hello
```

---
### `chdb.state.sqlitelike.to_df` {#state-sqlitelike-to_df}

쿼리 결과를 Pandas DataFrame으로 변환합니다.

이 함수는 chdb 쿼리 결과를 PyArrow Table로 변환한 다음 DataFrame 형식으로 변환하여 Pandas API로 편리한 데이터 분석 기능을 제공합니다.

**구문**

```python
chdb.state.sqlitelike.to_df(r)
```

**매개변수:**

| 매개변수  | 유형  | 설명                                                 |
|------------|-------|-----------------------------------------------------|
| `r`        | -     | Arrow 형식 데이터를 포함하는 chdb의 쿼리 결과 객체 |

**반환값:**

| 반환 유형        | 설명                                                                           |
|------------------|--------------------------------------------------------------------------------|
| `pandas.DataFrame` | 적절한 컬럼 이름과 데이터 유형을 포함하는 쿼리 결과의 DataFrame                |

**예외**

| 예외         | 조건                                       |
|--------------|--------------------------------------------|
| `ImportError` | pyarrow 또는 pandas 패키지가 설치되지 않았을 경우 |

:::note
이 기능은 대규모 데이터셋에 대한 성능 향상을 위해 Arrow에서 Pandas로 변환할 때 멀티스레딩을 사용합니다.
:::

**참조**
- [`to_arrowTable()`](#chdb-state-sqlitelike-to_arrowtable) - PyArrow Table 형식 변환을 위한

**예시**

```pycon
>>> import chdb
>>> result = chdb.query("SELECT 1 as num, 'hello' as text", "Arrow")
>>> df = to_df(result)
>>> print(df)
   num   text
0    1  hello
>>> print(df.dtypes)
num      int64
text    object
dtype: object
```
## 데이터프레임 통합 {#dataframe-integration}
### **class** `chdb.dataframe.Table` {#chdb-dataframe-table}

기초:

```python
class chdb.dataframe.Table(*args: Any, **kwargs: Any)
```
## 데이터베이스 API (DBAPI) 2.0 인터페이스 {#database-api-interface}

chDB는 데이터베이스 연결을 위한 Python DB-API 2.0 호환 인터페이스를 제공하여, 표준 데이터베이스 인터페이스를 기대하는 도구 및 프레임워크와 함께 사용할 수 있도록 합니다.

chDB DB-API 2.0 인터페이스에는 다음이 포함됩니다:

- **연결**: 연결 문자열을 사용한 데이터베이스 연결 관리
- **커서**: 쿼리 실행 및 결과 검색
- **형식 시스템**: DB-API 2.0 준수 형식 상수 및 변환기
- **오류 처리**: 표준 데이터베이스 예외 계층
- **스레드 안전성**: 레벨 1 스레드 안전성 (스레드는 모듈을 공유할 수 있지만 연결은 공유할 수 없습니다)

---
### 핵심 기능 {#core-functions}

데이터베이스 API (DBAPI) 2.0 인터페이스는 다음 핵심 기능을 구현합니다:
#### `chdb.dbapi.connect` {#dbapi-connect}

새로운 데이터베이스 연결을 초기화합니다.

**구문**

```python
chdb.dbapi.connect(*args, **kwargs)
```

**매개변수**

| 매개변수  | 유형  | 기본값  | 설명                                     |
|------------|-------|----------|------------------------------------------|
| `path`     | str   | `None`   | 데이터베이스 파일 경로. 메모리 내 데이터베이스의 경우 None |

**예외**

| 예외                                 | 조건                                   |
|---------------------------------------|----------------------------------------|
| [`err.Error`](#chdb-dbapi-err-error) | 연결을 설정할 수 없을 경우            |

---
#### `chdb.dbapi.get_client_info()` {#dbapi-get-client-info}

클라이언트 버전 정보를 가져옵니다.

MySQLdb 호환성을 위한 문자열 형식으로 chDB 클라이언트 버전을 반환합니다.

**구문**

```python
chdb.dbapi.get_client_info()
```

**반환값**

| 반환 유형  | 설명                                  |
|------------|---------------------------------------|
| `str`      | `'major.minor.patch'` 형식의 버전 문자열 |

---
### 형식 생성자 {#type-constructors}
#### `chdb.dbapi.Binary(x)` {#dbapi-binary}

x를 바이너리 유형으로 반환합니다.

이 함수는 입력을 bytes 유형으로 변환하여 바이너리 데이터베이스 필드에 사용합니다. DB-API 2.0 사양을 따릅니다.

**구문**

```python
chdb.dbapi.Binary(x)
```

**매개변수**

| 매개변수  | 유형  | 설명                     |
|------------|-------|-------------------------|
| `x`        | -     | 바이너리로 변환할 입력 데이터 |

**반환값**

| 반환 유형  | 설명                  |
|------------|----------------------|
| `bytes`    | 바이트로 변환된 입력  |

---
### 연결 클래스 {#connection-class}
#### **class** `chdb.dbapi.connections.Connection(path=None)` {#chdb-dbapi-connections-connection}

기초: `object`

DB-API 2.0 준수 chDB 데이터베이스의 연결.

이 클래스는 chDB 데이터베이스에 연결하고 상호작용하기 위한 표준 DB-API 인터페이스를 제공합니다. 메모리 내 데이터베이스와 파일 기반 데이터베이스 모두를 지원합니다.

연결은 기본 chDB 엔진을 관리하고 쿼리 실행, 트랜잭션 관리(ClickHouse의 경우 사용하지 않음), 커서 생성 메서드를 제공합니다.

```python
class chdb.dbapi.connections.Connection(path=None)
```

**매개변수**

| 매개변수  | 유형  | 기본값  | 설명                                                                                                           |
|------------|-------|----------|-----------------------------------------------------------------------------------------------------------------|
| `path`     | str   | `None`   | 데이터베이스 파일 경로. None일 경우 메모리 내 데이터베이스를 사용합니다. 'database.db'와 같은 파일 경로일 수 있으며 ':memory:'의 경우 None으로 설정됩니다. |

**변수**

| 변수       | 유형  | 설명                                          |
|------------|-------|-----------------------------------------------|
| `encoding` | str   | 쿼리의 문자 인코딩, 기본값은 'utf8'          |
| `open`     | bool  | 연결이 열려 있으면 True, 닫혀 있으면 False   |

**예시**

```pycon
>>> # In-memory database
>>> conn = Connection()
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT 1")
>>> result = cursor.fetchall()
>>> conn.close()
```

```pycon
>>> # File-based database
>>> conn = Connection('mydata.db')
>>> with conn.cursor() as cur:
...     cur.execute("CREATE TABLE users (id INT, name STRING) ENGINE = MergeTree() order by id")
...     cur.execute("INSERT INTO users VALUES (1, 'Alice')")
>>> conn.close()
```

```pycon
>>> # Context manager usage
>>> with Connection() as cur:
...     cur.execute("SELECT version()")
...     version = cur.fetchone()
```

:::note
ClickHouse는 전통적인 트랜잭션을 지원하지 않으므로 commit() 및 rollback() 작업은 아무 작업도 하지 않지만 DB-API 준수를 위해 제공됩니다.
:::

---
#### `close` {#dbapi-connection-close}

데이터베이스 연결을 닫습니다.

기본 chDB 연결을 닫고 이 연결을 닫은 것으로 표시합니다. 이 연결에서의 후속 작업은 오류를 발생시킵니다.

**구문**

```python
close()
```

**예외**

| 예외                                 | 조건                                   |
|---------------------------------------|----------------------------------------|
| [`err.Error`](#chdb-dbapi-err-error) | 연결이 이미 닫힌 경우                |

---
#### `commit` {#dbapi-commit}

현재 트랜잭션을 커밋합니다.

**구문**

```python
commit()
```

:::note
이 작업은 chDB/ClickHouse에 대한 no-op(아무 작업도 하지 않음)입니다. 전통적인 트랜잭션을 지원하지 않기 때문입니다. DB-API 2.0 호환성을 위해 제공됩니다.
:::

---
#### `cursor` {#dbapi-cursor}

쿼리를 실행하기 위한 새 커서를 만듭니다.

**구문**

```python
cursor(cursor=None)
```

**매개변수**

| 매개변수  | 유형 | 설명                              |
|------------|------|-----------------------------------|
| `cursor`   | -    | 호환성을 위해 제공된 무시됨 입력 |

**반환값**

| 반환 유형  | 설명                             |
|------------|----------------------------------|
| `Cursor`   | 이 연결을 위한 새 커서 객체     |

**예외**

| 예외                                 | 조건                     |
|---------------------------------------|--------------------------|
| [`err.Error`](#chdb-dbapi-err-error) | 연결이 닫힌 경우        |

**예시**

```pycon
>>> conn = Connection()
>>> cur = conn.cursor()
>>> cur.execute("SELECT 1")
>>> result = cur.fetchone()
```

---
#### `escape` {#escape}

SQL 쿼리에 안전하게 포함시키기 위한 값을 이스케이프합니다.

**구문**

```python
escape(obj, mapping=None)
```

**매개변수**

| 매개변수  | 유형  | 설명                                   |
|------------|-------|-----------------------------------------|
| `obj`      | -     | 이스케이프 할 값 (문자열, 바이트, 숫자 등) |
| `mapping`  | -     | 이스케이프를 위한 선택적 문자 매핑      |

**반환값**

| 반환 유형  | 설명                                                  |
|------------|-------------------------------------------------------|
| -          | SQL 쿼리에 적합한 이스케이프된 입력 버전             |

**예시**

```pycon
>>> conn = Connection()
>>> safe_value = conn.escape("O'Reilly")
>>> query = f"SELECT * FROM users WHERE name = {safe_value}"
```

---
#### `escape_string` {#escape-string}

SQL 쿼리에 사용할 문자열 값을 이스케이프합니다.

**구문**

```python
escape_string(s)
```

**매개변수**

| 매개변수  | 유형  | 설명                      |
|------------|-------|---------------------------|
| `s`        | str   | 이스케이프할 문자열        |

**반환값**

| 반환 유형  | 설명                              |
|------------|-----------------------------------|
| `str`      | SQL 포함에 안전한 이스케이프된 문자열 |

---
#### `property open` {#property-open}

연결이 열려 있는지 확인합니다.

**반환값**

| 반환 유형  | 설명                                     |
|------------|------------------------------------------|
| `bool`     | 연결이 열려 있으면 True, 닫혀 있으면 False |

---
#### `query` {#dbapi-query}

SQL 쿼리를 직접 실행하고 원시 결과를 반환합니다.

이 메서드는 커서 인터페이스를 우회하고 쿼리를 직접 실행합니다. 표준 DB-API 사용을 위해서는 cursor() 메서드를 사용하는 것이 좋습니다.

**구문**

```python
query(sql, fmt='CSV')
```

**매개변수:**

| 매개변수  | 유형          | 기본값    | 설명                                                                       |
|------------|---------------|------------|-----------------------------------------------------------------------------|
| `sql`      | str 또는 bytes | *필수*    | 실행할 SQL 쿼리                                                            |
| `fmt`      | str           | `"CSV"`    | 출력 형식. 지원되는 형식에는 "CSV", "JSON", "Arrow", "Parquet" 등이 포함됩니다. |

**반환값**

| 반환 유형  | 설명                                |
|------------|-------------------------------------|
| -          | 지정된 형식으로 쿼리 결과           |

**예외**

| 예외                                                  | 조건                                |
|-------------------------------------------------------|-------------------------------------|
| [`err.InterfaceError`](#chdb-dbapi-err-interfaceerror) | 연결이 닫혀 있거나 쿼리가 실패한 경우 |

**예시**

```pycon
>>> conn = Connection()
>>> result = conn.query("SELECT 1, 'hello'", "CSV")
>>> print(result)
"1,hello\n"
```

---
#### `property resp` {#property-resp}

마지막 쿼리 응답을 가져옵니다.

**반환값**

| 반환 유형  | 설명                                  |
|------------|---------------------------------------|
| -          | 마지막 query() 호출의 원시 응답      |

:::note
이 속성은 query()가 직접 호출될 때마다 업데이트됩니다. 커스를 통해 실행된 쿼리는 반영되지 않습니다.
:::

---
#### `rollback` {#rollback}

현재 트랜잭션을 롤백합니다.

**구문**

```python
rollback()
```

:::note
이 작업은 chDB/ClickHouse에 대한 no-op(아무 작업도 하지 않음)입니다. 전통적인 트랜잭션을 지원하지 않기 때문입니다. DB-API 2.0 호환성을 위해 제공됩니다.
:::

---
### 커서 클래스 {#cursor-class}
#### **class** `chdb.dbapi.cursors.Cursor` {#chdb-dbapi-cursors-cursor}

기초: `object`

쿼리 실행 및 결과 가져오기에 대한 DB-API 2.0 커서.

커서는 SQL 문 실행, 쿼리 결과 관리 및 결과 집합 탐색을 위한 메서드를 제공합니다. 매개변수 바인딩, 대량 작업을 지원하며 DB-API 2.0 사양을 따릅니다.

Cursor 인스턴스를 직접 생성하지 마십시오. 대신 `Connection.cursor()`를 사용하십시오.

```python
class chdb.dbapi.cursors.Cursor(connection)
```

| 변수               | 유형  | 설명                                         |
|--------------------|-------|----------------------------------------------|
| `description`      | 튜플  | 마지막 쿼리 결과에 대한 컬럼 메타데이터   |
| `rowcount`         | int   | 마지막 쿼리에 의해 영향을 받은 행 수 (-1이면 알 수 없음) |
| `arraysize`        | int   | 기본적으로 한 번에 가져올 행 수 (기본값: 1) |
| `lastrowid`        | -     | 마지막으로 삽입된 행의 ID (해당 시)        |
| `max_stmt_length`  | int   | executemany()에 대한 최대 문장 크기 (기본값: 1024000) |

**예시**

```pycon
>>> conn = Connection()
>>> cur = conn.cursor()
>>> cur.execute("SELECT 1 as id, 'test' as name")
>>> result = cur.fetchone()
>>> print(result)  # (1, 'test')
>>> cur.close()
```

:::note
[DB-API 2.0 Cursor Objects](https://www.python.org/dev/peps/pep-0249/#cursor-objects)에서 전체 사양 세부정보를 확인하세요.
:::

---
#### `callproc` {#callproc}

저장 프로시저를 실행합니다 (플레이스홀더 구현).

**구문**

```python
callproc(procname, args=())
```

**매개변수**

| 매개변수  | 유형     | 설명                                    |
|------------|----------|-----------------------------------------|
| `procname` | str      | 실행할 저장 프로시저의 이름            |
| `args`     | 시퀀스  | 프로시저에 전달할 매개변수              |

**반환값**

| 반환 유형  | 설명                                 |
|------------|---------------------------------------|
| `시퀀스`   | 원본 args 매개변수(수정되지 않음)   |

:::note
chDB/ClickHouse는 전통적인 의미에서 저장 프로시저를 지원하지 않습니다. 이 메서드는 DB-API 2.0 준수를 위해 제공되지만 실제 작업을 수행하지 않습니다. 모든 SQL 작업에는 execute()를 사용하십시오.
:::

:::warning 호환성
이것은 플레이스홀더 구현입니다. OUT/INOUT 매개변수, 여러 결과 집합 및 서버 변수를 포함한 전통적인 저장 프로시저 기능은 기본 ClickHouse 엔진에서 지원되지 않습니다.
:::

---
#### `close` {#dbapi-cursor-close}

커서를 닫고 관련된 리소스를 해제합니다.

닫은 후, 커서는 더 이상 사용이 불가능해지며 모든 작업은 예외를 발생시킵니다. 커서를 닫으면 남아있는 모든 데이터가 소진되고 기본 커서가 해제됩니다.

**구문**

```python
close()
```

---
#### `execute` {#dbapi-execute}

옵션 매개변수 바인딩이 포함된 SQL 쿼리를 실행합니다.

이 메소드는 선택적인 매개변수 치환을 사용하여 단일 SQL 문을 실행합니다. 유연성을 위해 여러 매개변수 자리 표시자 스타일을 지원합니다.

**구문**

```python
execute(query, args=None)
```

**매개변수**

| 매개변수  | 유형            | 기본값    | 설명                                |
|------------|-----------------|------------|------------------------------------|
| `query`    | str             | *필수*     | 실행할 SQL 쿼리                     |
| `args`     | tuple/list/dict | `None`     | 자리 표시자에 바인딩할 매개변수       |

**반환**

| 반환 유형  | 설명                                    |
|--------------|----------------------------------------|
| `int`        | 영향을 받은 행 수 (-1은 알 수 없음)       |

**매개변수 스타일**

| 스타일               | 예시                                             |
|---------------------|---------------------------------------------------|
| 물음표 스타일       | `"SELECT * FROM users WHERE id = ?"`              |
| 명명된 스타일       | `"SELECT * FROM users WHERE name = %(name)s"`     |
| 포맷 스타일         | `"SELECT * FROM users WHERE age = %s"` (레거시)   |

**예제**

```pycon
>>> # Question mark parameters
>>> cur.execute("SELECT * FROM users WHERE id = ? AND age > ?", (123, 18))
>>>
>>> # Named parameters
>>> cur.execute("SELECT * FROM users WHERE name = %(name)s", {'name': 'Alice'})
>>>
>>> # No parameters
>>> cur.execute("SELECT COUNT(*) FROM users")
```

**발생하는 예외**

| 예외                                              | 조건                                   |
|--------------------------------------------------|----------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 커서가 닫혀 있거나 쿼리가 잘못된 경우    |
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror)   | 실행 중 데이터베이스 오류가 발생한 경우  |

---
#### `executemany(query, args)` {#chdb-dbapi-cursors-cursor-executemany}

다양한 매개변수 집합으로 쿼리를 여러 번 실행합니다.

이 메소드는 다른 매개변수 값으로 동일한 SQL 쿼리를 여러 번 효율적으로 실행합니다. 대량 INSERT 작업에 특히 유용합니다.

**구문**

```python
executemany(query, args)
```

**매개변수**

| 매개변수  | 유형      | 설명                                         |
|------------|-----------|---------------------------------------------|
| `query`    | str       | 여러 번 실행할 SQL 쿼리                     |
| `args`     | 시퀀스    | 각 실행에 대한 매개변수 튜플/딕트/리스트    |

**반환**

| 반환 유형  | 설명                                           |
|--------------|-----------------------------------------------|
| `int`        | 모든 실행에서 영향을 받은 행 수의 합계       |

**예제**

```pycon
>>> # Bulk insert with question mark parameters
>>> users_data = [(1, 'Alice'), (2, 'Bob'), (3, 'Charlie')]
>>> cur.executemany("INSERT INTO users VALUES (?, ?)", users_data)
>>>
>>> # Bulk insert with named parameters
>>> users_data = [
...     {'id': 1, 'name': 'Alice'},
...     {'id': 2, 'name': 'Bob'}
... ]
>>> cur.executemany(
...     "INSERT INTO users VALUES (%(id)s, %(name)s)",
...     users_data
... )
```

:::note
이 메소드는 쿼리 실행 과정을 최적화하여 여러 행 INSERT 및 UPDATE 작업의 성능을 향상시킵니다.
:::

---
#### `fetchall()` {#dbapi-fetchall}

쿼리 결과에서 남아 있는 모든 행을 가져옵니다.

**구문**

```python
fetchall()
```

**반환**

| 반환 유형  | 설명                                       |
|--------------|---------------------------------------------|
| `list`       | 남아 있는 모든 행을 나타내는 튜플 목록     |

**발생하는 예외**

| 예외                                              | 조건                                      |
|--------------------------------------------------|-------------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 먼저 execute()가 호출되지 않은 경우         |

:::warning 경고
이 메소드는 큰 결과 세트에 대해 많은 메모리를 소비할 수 있습니다.
큰 데이터 세트의 경우 `fetchmany()` 사용을 고려하세요.
:::

**예제**

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> all_rows = cursor.fetchall()
>>> print(len(all_rows))  # Number of total rows
```

---
#### `fetchmany` {#dbapi-fetchmany}

쿼리 결과에서 여러 행을 가져옵니다.

**구문**

```python
fetchmany(size=1)
```

**매개변수**

| 매개변수  | 유형   | 기본값  | 설명                                           |
|------------|--------|----------|-----------------------------------------------|
| `size`     | int    | `1`      | 가져올 행 수입니다. 지정되지 않은 경우 커서의 arraysize 사용 |

**반환**

| 반환 유형  | 설명                                       |
|--------------|---------------------------------------------|
| `list`       | 가져온 행을 나타내는 튜플 목록              |

**발생하는 예외**

| 예외                                              | 조건                                      |
|--------------------------------------------------|-------------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 먼저 execute()가 호출되지 않은 경우         |

**예제**

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> rows = cursor.fetchmany(3)
>>> print(rows)  # [(1, 'Alice'), (2, 'Bob'), (3, 'Charlie')]
```

---
#### `fetchone` {#dbapi-fetchone}

쿼리 결과에서 다음 행을 가져옵니다.

**구문**

```python
fetchone()
```

**반환**

| 반환 유형     | 설명                                         |
|-----------------|---------------------------------------------|
| `tuple or None` | 다음 행을 튜플로 나타내며, 더 이상 행이 없으면 None을 반환  |

**발생하는 예외**

| 예외                                              | 조건                                      |
|--------------------------------------------------|-------------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | `execute()`가 먼저 호출되지 않은 경우     |

**예제**

```pycon
>>> cursor.execute("SELECT id, name FROM users LIMIT 3")
>>> row = cursor.fetchone()
>>> print(row)  # (1, 'Alice')
>>> row = cursor.fetchone()
>>> print(row)  # (2, 'Bob')
```

---
#### `max_stmt_length = 1024000` {#max-stmt-length}

[`executemany()`](#chdb-dbapi-cursors-cursor-executemany)가 생성하는 최대 문장 크기입니다.

기본값은 1024000입니다.

---
#### `mogrify` {#mogrify}

데이터베이스에 전송될 정확한 쿼리 문자열을 반환합니다.

이 메소드는 매개변수 치환 후 최종 SQL 쿼리를 보여줍니다. 이는 디버깅 및 로깅 목적으로 유용합니다.

**구문**

```python
mogrify(query, args=None)
```

**매개변수**

| 매개변수  | 유형            | 기본값    | 설명                                   |
|------------|-----------------|------------|-----------------------------------------|
| `query`    | str             | *필수*     | 매개변수 자리 표시자가 포함된 SQL 쿼리   |
| `args`     | tuple/list/dict | `None`     | 대체할 매개변수                         |

**반환**

| 반환 유형  | 설명                                       |
|--------------|---------------------------------------------|
| `str`        | 매개변수가 대체된 최종 SQL 쿼리 문자열     |

**예제**

```pycon
>>> cur.mogrify("SELECT * FROM users WHERE id = ?", (123,))
"SELECT * FROM users WHERE id = 123"
```

:::note
이 메소드는 Psycopg에서 사용되는 DB-API 2.0 확장을 따릅니다.
:::

---
#### `nextset` {#nextset}

다음 결과 집합으로 이동합니다 (지원되지 않음).

**구문**

```python
nextset()
```

**반환**

| 반환 유형  | 설명                                           |
|--------------|-----------------------------------------------|
| `None`       | 항상 None을 반환하며 여러 결과 집합이 지원되지 않음 |

:::note
chDB/ClickHouse는 단일 쿼리에서 여러 결과 집합을 지원하지 않습니다. 이 메소드는 DB-API 2.0 준수를 위해 제공되지만 항상 None을 반환합니다.
:::

---
#### `setinputsizes` {#setinputsizes}

매개변수의 입력 크기를 설정합니다 (no-op 구현).

**구문**

```python
setinputsizes(*args)
```

**매개변수**

| 매개변수  | 유형  | 설명                                         |
|------------|-------|-----------------------------------------------|
| `*args`    | -     | 매개변수 크기 사양 (무시됨)                   |

:::note
이 메소드는 아무 작업도 하지 않지만 DB-API 2.0 사양에 의해 요구됩니다. chDB는 내부적으로 매개변수 크기를 자동으로 처리합니다.
:::

---
#### `setoutputsizes` {#setoutputsizes}

출력 열 크기를 설정합니다 (no-op 구현).

**구문**

```python
setoutputsizes(*args)
```

**매개변수**

| 매개변수  | 유형  | 설명                                     |
|------------|-------|-----------------------------------------|
| `*args`    | -     | 열 크기 사양 (무시됨)                    |

:::note
이 메소드는 아무 작업도 하지 않지만 DB-API 2.0 사양에 의해 요구됩니다. chDB는 내부적으로 출력 크기를 자동으로 처리합니다.
:::

---
### 오류 클래스 {#error-classes}

chdb 데이터베이스 작업에 대한 예외 클래스입니다.

이 모듈은 Python 데이터베이스 API 사양 v2.0을 따르며 chdb의 데이터베이스 관련 오류를 처리하기 위한 완전한 예외 클래스 계층을 제공합니다.

예외 계층 구조는 다음과 같습니다:

```default
StandardError
├── Warning
└── Error
    ├── InterfaceError
    └── DatabaseError
        ├── DataError
        ├── OperationalError
        ├── IntegrityError
        ├── InternalError
        ├── ProgrammingError
        └── NotSupportedError
```

각 예외 클래스는 데이터베이스 오류의 특정 범주를 나타냅니다:

| 예외               | 설명                                              |
|---------------------|--------------------------------------------------|
| `Warning`           | 데이터베이스 작업 중 비치명적 경고              |
| `InterfaceError`    | 데이터베이스 인터페이스 자체에 대한 문제         |
| `DatabaseError`     | 모든 데이터베이스 관련 오류의 기본 클래스       |
| `DataError`         | 데이터 처리 문제 (잘못된 값, 유형 오류)         |
| `OperationalError`  | 데이터베이스 운영 문제 (연결성, 리소스)        |
| `IntegrityError`    | 제약 조건 위반 (외래 키, 고유성)               |
| `InternalError`     | 데이터베이스 내부 오류 및 데이터 손상           |
| `ProgrammingError`  | SQL 구문 오류 및 API 오용                      |
| `NotSupportedError` | 지원되지 않는 기능 또는 작업                    |

:::note
이 예외 클래스는 Python DB API 2.0 사양을 준수하며 서로 다른 데이터베이스 작업에서 일관된 오류 처리를 제공합니다.
:::

**참조**
- [Python Database API 사양 v2.0](https://peps.python.org/pep-0249/)
- `chdb.dbapi.connections` - 데이터베이스 연결 관리
- `chdb.dbapi.cursors` - 데이터베이스 커서 작업

**예제**

```pycon
>>> try:
...     cursor.execute("SELECT * FROM nonexistent_table")
... except ProgrammingError as e:
...     print(f"SQL Error: {e}")
...
SQL Error: Table 'nonexistent_table' doesn't exist
```

```pycon
>>> try:
...     cursor.execute("INSERT INTO users (id) VALUES (1), (1)")
... except IntegrityError as e:
...     print(f"Constraint violation: {e}")
...
Constraint violation: Duplicate entry '1' for key 'PRIMARY'
```

---
#### **예외** `chdb.dbapi.err.DataError` {#chdb-dbapi-err-dataerror}

기반: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

처리된 데이터 문제로 인해 발생한 오류에 대한 예외입니다.

이 예외는 데이터베이스 작업이 처리되는 데이터와 관련된 문제로 인해 실패할 때 발생합니다. 예를 들면:

- 영(0)으로 나누기 작업
- 범위를 초과한 숫자 값
- 잘못된 날짜/시간 값
- 문자열 자르기 오류
- 유형 변환 실패
- 열 유형에 대한 잘못된 데이터 형식

**발생하는 예외**

| 예외 | 조건 |
|-----------|-----------|
| [`DataError`](#chdb-dbapi-err-dataerror) | 데이터 유효성 검사 또는 처리 실패 시 |

**예제**

```pycon
>>> # Division by zero in SQL
>>> cursor.execute("SELECT 1/0")
DataError: Division by zero
```

```pycon
>>> # Invalid date format
>>> cursor.execute("INSERT INTO table VALUES ('invalid-date')")
DataError: Invalid date format
```

---
#### **예외** `chdb.dbapi.err.DatabaseError` {#chdb-dbapi-err-databaseerror}

기반: [`Error`](#chdb-dbapi-err-error)

데이터베이스와 관련된 오류에 대해 발생하는 예외입니다.

이것은 모든 데이터베이스 관련 오류의 기본 클래스입니다. 데이터베이스 작업 중 발생하는 오류와 인터페이스와 관련된 것이 아니라 데이터베이스 자체와 관련된 모든 오류를 포괄합니다.

일반적인 시나리오는 다음과 같습니다:

- SQL 실행 오류
- 데이터베이스 연결 문제
- 트랜잭션 관련 문제
- 데이터베이스 특정 제약 조건 위반

:::note
이는 [`DataError`](#chdb-dbapi-err-dataerror), [`OperationalError`](#chdb-dbapi-err-operationalerror)와 같은 더 구체적인 데이터베이스 오류 유형의 부모 클래스 역할을 합니다.
:::

---
#### **예외** `chdb.dbapi.err.Error` {#chdb-dbapi-err-error}

기반: [`StandardError`](#chdb-dbapi-err-standarderror)

모든 다른 오류 예외의 기본 클래스입니다 (Warning 제외).

이것은 chdb의 모든 오류 예외에 대한 기본 클래스입니다. 작업의 성공적인 완료를 방해하는 데이터베이스 오류 조건에 대한 부모 클래스 역할을 합니다.

:::note
이 예외 계층 구조는 Python DB API 2.0 사양을 따릅니다.
:::

**참조**
- [`Warning`](#chdb-dbapi-err-warning) - 작업 완성을 방해하지 않는 비치명적인 경고에 대해

#### **예외** `chdb.dbapi.err.IntegrityError` {#chdb-dbapi-err-integrityerror}

기반: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

데이터베이스의 관계 무결성에 영향을 미치는 경우 발생하는 예외입니다.

이 예외는 데이터베이스 작업이 무결성 제약 조건을 위반할 때 발생합니다. 포함되는 사항은 다음과 같습니다:

- 외래 키 제약 조건 위반
- 기본 키 또는 고유 제약 조건 위반 (중복 키)
- 체크 제약 조건 위반
- NOT NULL 제약 조건 위반
- 참조 무결성 위반

**발생하는 예외**

| 예외                                              | 조건                                          |
|--------------------------------------------------|-----------------------------------------------|
| [`IntegrityError`](#chdb-dbapi-err-integrityerror) | 데이터베이스 무결성 제약 조건 위반 시        |

**예제**

```pycon
>>> # Duplicate primary key
>>> cursor.execute("INSERT INTO users (id, name) VALUES (1, 'John')")
>>> cursor.execute("INSERT INTO users (id, name) VALUES (1, 'Jane')")
IntegrityError: Duplicate entry '1' for key 'PRIMARY'
```

```pycon
>>> # Foreign key violation
>>> cursor.execute("INSERT INTO orders (user_id) VALUES (999)")
IntegrityError: Cannot add or update a child row: foreign key constraint fails
```

---
#### **예외** `chdb.dbapi.err.InterfaceError` {#chdb-dbapi-err-interfaceerror}

기반: [`Error`](#chdb-dbapi-err-error)

데이터베이스 자체보다는 데이터베이스 인터페이스와 관련된 오류에 대해 발생하는 예외입니다.

이 예외는 데이터베이스 인터페이스 구현에 문제가 있을 때 발생합니다. 예를 들면:

- 잘못된 연결 매개변수
- API 오용 (닫힌 연결에서 메소드 호출)
- 인터페이스 수준 프로토콜 오류
- 모듈 가져오기 또는 초기화 실패

**발생하는 예외**

| 예외                                              | 조건                                        |
|--------------------------------------------------|----------------------------------------------|
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror) | 데이터베이스 인터페이스에서 데이터베이스 작업과 관련되지 않은 오류가 발생한 경우 |

:::note
이러한 오류는 일반적으로 프로그래밍 오류나 구성 문제로, 클라이언트 코드나 구성을 수정하여 해결할 수 있습니다.
:::

---
#### **예외** `chdb.dbapi.err.InternalError` {#chdb-dbapi-err-internalerror}

기반: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

데이터베이스가 내부 오류를 만났을 때 발생하는 예외입니다.

이 예외는 데이터베이스 시스템이 응용 프로그램에 의해 유발되지 않은 내부 오류를 만났을 때 발생합니다. 예를 들면:

- 잘못된 커서 상태 (커서가 더 이상 유효하지 않음)
- 트랜잭션 상태 불일치 (트랜잭션이 동기화되지 않음)
- 데이터베이스 손상 문제
- 내부 데이터 구조 손상
- 시스템 수준 데이터베이스 오류

**발생하는 예외**

| 예외                                              | 조건                                          |
|--------------------------------------------------|-----------------------------------------------|
| [`InternalError`](#chdb-dbapi-err-internalerror) | 데이터베이스가 내부 불일치를 만났을 경우     |

:::warning 경고
내부 오류는 데이터베이스 관리자 주의가 필요한 심각한 데이터베이스 문제를 나타낼 수 있습니다. 이러한 오류는 일반적으로 응용 프로그램 수준의 재시도 논리를 통해 복구할 수 없습니다.
:::

:::note
이러한 오류는 일반적으로 응용 프로그램의 제어를 벗어나며 데이터베이스 재시작이나 복구 작업이 필요할 수 있습니다.
:::

---
#### **예외** `chdb.dbapi.err.NotSupportedError` {#chdb-dbapi-err-notsupportederror}

기반: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

메소드나 데이터베이스 API가 지원되지 않을 때 발생하는 예외입니다.

이 예외는 응용 프로그램이 현재 데이터베이스 구성 또는 버전에서 지원되지 않는 데이터베이스 기능이나 API 메소드를 사용하려고 할 때 발생합니다. 예를 들면:

- 트랜잭션 지원이 없는 연결에서 `rollback()` 요청
- 데이터베이스 버전에서 지원하지 않는 고급 SQL 기능 사용
- 현재 드라이버에 의해 구현되지 않은 메소드 호출
- 비활성화된 데이터베이스 기능 사용 시도

**발생하는 예외**

| 예외                                                   | 조건                                            |
|-------------------------------------------------------|------------------------------------------------|
| [`NotSupportedError`](#chdb_dbapi_err_notsupportederror) | 지원되지 않는 데이터베이스 기능에 접근할 때    |

**예제**

```pycon
>>> # Transaction rollback on non-transactional connection
>>> connection.rollback()
NotSupportedError: Transactions are not supported
```

```pycon
>>> # Using unsupported SQL syntax
>>> cursor.execute("SELECT * FROM table WITH (NOLOCK)")
NotSupportedError: WITH clause not supported in this database version
```

:::note
이러한 오류를 피하기 위해 데이터베이스 문서와 드라이버 기능을 확인하십시오. 가능한 경우 우아한 대체 방법을 고려하십시오.
:::

---
#### **예외** `chdb.dbapi.err.OperationalError` {#chdb-dbapi-err-operationalerror}

기반: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

데이터베이스의 작업과 관련된 오류에 대해 발생하는 예외입니다.

이 예외는 데이터베이스 작업 중 발생하는 오류로, 프로그래머의 제어 하에 있지 않을 수도 있습니다. 예를 들면:

- 데이터베이스에서의 예기치 않은 연결 종료
- 데이터베이스 서버를 찾지 못하거나 접근할 수 없음
- 트랜잭션 처리 실패
- 처리 중 메모리 할당 오류
- 디스크 공간 또는 자원 소진
- 데이터베이스 서버 내부 오류
- 인증 또는 권한 오류

**발생하는 예외**

| 예외                                              | 조건                                       |
|--------------------------------------------------|-------------------------------------------|
| [`OperationalError`](#chdb-dbapi-err-operationalerror) | 운영 문제로 인해 데이터베이스 작업이 실패한 경우 |

:::note
이러한 오류는 일반적으로 일시적이며, 작업을 다시 시도하거나 시스템 수준의 문제를 해결하여 해결할 수 있습니다.
:::

:::warning 경고
일부 운영 오류는 관리 개입이 필요한 심각한 시스템 문제를 나타낼 수 있습니다.
:::

---
#### **예외** `chdb.dbapi.err.ProgrammingError` {#chdb-dbapi-err-programmingerror}

기반: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

데이터베이스 작업의 프로그래밍 오류에 대해 발생하는 예외입니다.

이 예외는 응용 프로그램의 데이터베이스 사용에서 프로그래밍 오류가 있을 때 발생합니다. 예를 들면:

- 테이블 또는 컬럼을 찾을 수 없음
- 생성 시 이미 존재하는 테이블 또는 인덱스
- 문에서 SQL 구문 오류
- 준비된 문에서 지정된 잘못된 매개변수 수
- 잘못된 SQL 작업 (예: 존재하지 않는 객체에 대한 DROP)
- 데이터베이스 API 메소드의 잘못된 사용

**발생하는 예외**

| 예외                                              | 조건                                        |
|--------------------------------------------------|--------------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | SQL 문 또는 API 사용에 오류가 포함된 경우   |

**예제**

```pycon
>>> # Table not found
>>> cursor.execute("SELECT * FROM nonexistent_table")
ProgrammingError: Table 'nonexistent_table' doesn't exist
```

```pycon
>>> # SQL syntax error
>>> cursor.execute("SELCT * FROM users")
ProgrammingError: You have an error in your SQL syntax
```

```pycon
>>> # Wrong parameter count
>>> cursor.execute("INSERT INTO users (name, age) VALUES (%s)", ('John',))
ProgrammingError: Column count doesn't match value count
```

---
#### **예외** `chdb.dbapi.err.StandardError` {#chdb-dbapi-err-standarderror}

기반: `Exception`

chdb와의 작업과 관련된 예외입니다.

이것은 모든 chdb 관련 예외의 기본 클래스입니다. Python의 기본 Exception 클래스에서 상속받으며 데이터베이스 작업을 위한 예외 계층 구조의 루트 역할을 합니다.

:::note
이 예외 클래스는 데이터베이스 예외 처리를 위해 Python DB API 2.0 사양을 따릅니다.
:::

---
#### **예외** `chdb.dbapi.err.Warning` {#chdb-dbapi-err-warning}

기반: [`StandardError`](#chdb-dbapi-err-standarderror)

삽입 중 데이터 잘림과 같은 중요한 경고에 대해 발생하는 예외입니다.

이 예외는 데이터베이스 작업이 완료되었지만 응용 프로그램이 주목해야 하는 중요한 경고가 있을 때 발생합니다. 일반적인 시나리오는 다음과 같습니다:

- 삽입 중 데이터 잘림
- 숫자 변환에서의 정밀도 손실
- 문자 집합 변환 경고

:::note
이는 경고 예외에 대한 Python DB API 2.0 사양을 따릅니다.
:::

---
### 모듈 상수 {#module-constants}
#### `chdb.dbapi.apilevel = '2.0'` {#apilevel}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

주어진 객체에서 새 문자열 객체를 생성합니다. 인코딩이나 오류가 지정되면 객체는 주어진 인코딩 및 오류 처리기를 사용하여 디코딩될 데이터 버퍼를 노출해야 합니다. 그렇지 않으면 `object.__str__()`의 결과(정의된 경우) 또는 `repr(object)`를 반환합니다.

- 인코딩의 기본값은 'utf-8'입니다.
- 오류의 기본값은 'strict'입니다.

---
#### `chdb.dbapi.threadsafety = 1` {#threadsafety}

```python
int([x]) -> integer
int(x, base=10) -> integer
```

숫자 또는 문자열을 정수로 변환하거나 인수가 주어지지 않으면 0을 반환합니다. x가 숫자인 경우 x.__int__()를 반환합니다. 부동 소수점 수의 경우, 이는 0쪽으로 잘라내어집니다.

x가 숫자가 아니거나 base가 지정되면, x는 주어진 진수로 정수 리터럴을 나타내는 문자열, 바이트 또는 바이트 배열 인스턴스여야 합니다. 리터럴은 ‘+’ 또는 ‘-’로 선행될 수 있으며 공백으로 둘러쌓일 수 있습니다. 기본 진수는 10입니다. 유효한 진수는 0 및 2-36입니다. 기본 0은 문자열에서 진수를 정수 리터럴로 해석하는 것을 의미합니다.

```python
>>> int(‘0b100’, base=0)
4
```

---
#### `chdb.dbapi.paramstyle = 'format'` {#paramstyle}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

주어진 객체에서 새 문자열 객체를 생성합니다. 인코딩이나 오류가 지정되면, 객체는 주어진 인코딩 및 오류 처리기를 사용하여 디코딩될 데이터 버퍼를 노출해야 합니다. 그렇지 않으면 `object.__str__()`의 결과(정의된 경우) 또는 `repr(object)`를 반환합니다. 인코딩의 기본값은 'utf-8'입니다. 오류의 기본값은 'strict'입니다.

---
### 유형 상수 {#type-constants}
#### `chdb.dbapi.STRING = frozenset({247, 253, 254})` {#string-type}

DB-API 2.0 유형 비교를 위한 확장된 frozenset입니다.

이 클래스는 DB-API 2.0 유형 비교 의미론을 지원하기 위해 frozenset을 확장합니다. 개별 항목을 동등성과 부등식 연산자 모두를 사용하여 집합과 비교할 수 있는 유연한 유형 검사 기능을 제공합니다.

이는 STRING, BINARY, NUMBER 등과 같은 유형 상수에서 사용되며 “field_type == STRING”과 같은 비교를 가능하게 합니다. 여기서 field_type은 단일 유형 값입니다.

**예제**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.BINARY = frozenset({249, 250, 251, 252})` {#binary-type}

DB-API 2.0 유형 비교를 위한 확장된 frozenset입니다.

이 클래스는 DB-API 2.0 유형 비교 의미론을 지원하기 위해 frozenset을 확장합니다. 개별 항목을 동등성과 부등식 연산자 모두를 사용하여 집합과 비교할 수 있는 유연한 유형 검사 기능을 제공합니다.

이는 STRING, BINARY, NUMBER 등과 같은 유형 상수에서 사용되며 “field_type == STRING”과 같은 비교를 가능하게 합니다. 여기서 field_type은 단일 유형 값입니다.

**예제**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.NUMBER = frozenset({0, 1, 3, 4, 5, 8, 9, 13})` {#number-type}

DB-API 2.0 유형 비교를 위한 확장된 frozenset입니다.

이 클래스는 DB-API 2.0 유형 비교 의미론을 지원하기 위해 frozenset을 확장합니다. 개별 항목을 동등성과 부등식 연산자 모두를 사용하여 집합과 비교할 수 있는 유연한 유형 검사 기능을 제공합니다.

이는 STRING, BINARY, NUMBER 등과 같은 유형 상수에서 사용되며 “field_type == STRING”과 같은 비교를 가능하게 합니다. 여기서 field_type은 단일 유형 값입니다.

**예제**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.DATE = frozenset({10, 14})` {#date-type}

DB-API 2.0 유형 비교를 위한 확장된 frozenset입니다.

이 클래스는 DB-API 2.0 유형 비교 의미론을 지원하기 위해 frozenset을 확장합니다. 개별 항목을 동등성과 부등식 연산자 모두를 사용하여 집합과 비교할 수 있는 유연한 유형 검사 기능을 제공합니다.

이는 STRING, BINARY, NUMBER 등과 같은 유형 상수에서 사용되며 “field_type == STRING”과 같은 비교를 가능하게 합니다. 여기서 field_type은 단일 유형 값입니다.

**예제**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.TIME = frozenset({11})` {#time-type}

DB-API 2.0 유형 비교를 위한 확장된 frozenset입니다.

이 클래스는 DB-API 2.0 유형 비교 의미론을 지원하기 위해 frozenset을 확장합니다. 개별 항목을 동등성과 부등식 연산자 모두를 사용하여 집합과 비교할 수 있는 유연한 유형 검사 기능을 제공합니다.

이는 STRING, BINARY, NUMBER 등과 같은 유형 상수에서 사용되며 “field_type == STRING”과 같은 비교를 가능하게 합니다. 여기서 field_type은 단일 유형 값입니다.

**예제**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.TIMESTAMP = frozenset({7, 12})` {#timestamp-type}

DB-API 2.0 유형 비교를 위한 확장된 frozenset입니다.

이 클래스는 DB-API 2.0 유형 비교 의미론을 지원하기 위해 frozenset을 확장합니다. 개별 항목을 동등성과 부등식 연산자 모두를 사용하여 집합과 비교할 수 있는 유연한 유형 검사 기능을 제공합니다.

이는 STRING, BINARY, NUMBER 등과 같은 유형 상수에서 사용되며 “field_type == STRING”과 같은 비교를 가능하게 합니다. 여기서 field_type은 단일 유형 값입니다.

**예제**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```
#### `chdb.dbapi.DATETIME = frozenset({7, 12})` {#datetime-type}

DB-API 2.0 유형 비교를 위한 확장된 frozenset입니다.

이 클래스는 DB-API 2.0 유형 비교 의미론을 지원하기 위해 frozenset을 확장합니다. 개별 항목을 동등성과 부등식 연산자 모두를 사용하여 집합과 비교할 수 있는 유연한 유형 검사 기능을 제공합니다.

이는 STRING, BINARY, NUMBER 등과 같은 유형 상수에서 사용되며 “field_type == STRING”과 같은 비교를 가능하게 합니다. 여기서 field_type은 단일 유형 값입니다.

**예제**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.ROWID = frozenset({})` {#rowid-type}

DB-API 2.0 유형 비교를 위한 확장된 frozenset입니다.

이 클래스는 DB-API 2.0 유형 비교 의미론을 지원하기 위해 frozenset을 확장합니다. 개별 항목을 동등성과 부등식 연산자 모두를 사용하여 집합과 비교할 수 있는 유연한 유형 검사 기능을 제공합니다.

이는 STRING, BINARY, NUMBER 등과 같은 유형 상수에서 사용되며 “field_type == STRING”과 같은 비교를 가능하게 합니다. 여기서 field_type은 단일 유형 값입니다.

**예제**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

**사용 예제**

기본 쿼리 예제:

```python
import chdb.dbapi as dbapi

print("chdb driver version: {0}".format(dbapi.get_client_info()))


# Create connection and cursor
conn = dbapi.connect()
cur = conn.cursor()


# Execute query
cur.execute('SELECT version()')
print("description:", cur.description)
print("data:", cur.fetchone())


# Clean up
cur.close()
conn.close()
```

데이터 작업:

```python
import chdb.dbapi as dbapi

conn = dbapi.connect()
cur = conn.cursor()


# Create table
cur.execute("""
    CREATE TABLE employees (
        id UInt32,
        name String,
        department String,
        salary Decimal(10,2)
    ) ENGINE = Memory
""")


# Insert data
cur.execute("""
    INSERT INTO employees VALUES
    (1, 'Alice', 'Engineering', 75000.00),
    (2, 'Bob', 'Marketing', 65000.00),
    (3, 'Charlie', 'Engineering', 80000.00)
""")


# Query data
cur.execute("SELECT * FROM employees WHERE department = 'Engineering'")


# Fetch results
print("Column names:", [desc[0] for desc in cur.description])
for row in cur.fetchall():
    print(row)

conn.close()
```

연결 관리:

```python
import chdb.dbapi as dbapi


# In-memory database (default)
conn1 = dbapi.connect()


# Persistent database file
conn2 = dbapi.connect("./my_database.chdb")


# Connection with parameters
conn3 = dbapi.connect("./my_database.chdb?log-level=debug&verbose")


# Read-only connection
conn4 = dbapi.connect("./my_database.chdb?mode=ro")


# Automatic connection cleanup
with dbapi.connect("test.chdb") as conn:
    cur = conn.cursor()
    cur.execute("SELECT count() FROM numbers(1000)")
    result = cur.fetchone()
    print(f"Count: {result[0]}")
    cur.close()
```

**모범 사례**

1. **연결 관리**: 작업이 끝나면 항상 연결 및 커서를 닫으세요.
2. **컨텍스트 관리자**: 자동 정리를 위해 `with` 문을 사용하세요.
3. **배치 처리**: 큰 결과 세트는 `fetchmany()`를 사용하세요.
4. **오류 처리**: 데이터베이스 작업을 try-except 블록으로 감싸세요.
5. **매개변수 바인딩**: 가능한 경우 매개변수화된 쿼리를 사용하세요.
6. **메모리 관리**: 매우 큰 데이터 세트의 경우 `fetchall()`을 피하세요.

:::note
- chDB의 DB-API 2.0 인터페이스는 대부분의 Python 데이터베이스 도구와 호환됩니다.
- 이 인터페이스는 Level 1 스레드 안전성을 제공합니다 (스레드는 모듈을 공유할 수 있지만 연결은 공유할 수 없음).
- 연결 문자열은 chDB 세션과 동일한 매개변수를 지원합니다.
- 모든 표준 DB-API 2.0 예외가 지원됩니다.
:::

:::warning 경고
- 항상 자원 누수를 피하기 위해 커서와 연결을 닫으세요.
- 큰 결과 세트는 배치로 처리해야 합니다.
- 매개변수 바인딩 구문은 포맷 스타일을 따릅니다: `%s`
:::
## 사용자 정의 함수 (UDF) {#user-defined-functions}

chDB를 위한 사용자 정의 함수 모듈입니다.

이 모듈은 chDB에서 사용자 정의 함수 (UDF)를 생성하고 관리하기 위한 기능을 제공합니다. 이를 통해 SQL 쿼리에서 호출할 수 있는 사용자 정의 Python 함수를 작성하여 chDB의 기능을 확장할 수 있습니다.
### `chdb.udf.chdb_udf` {#chdb-udf}

chDB Python UDF(사용자 정의 함수)에 대한 데코레이터입니다.

**구문**

```python
chdb.udf.chdb_udf(return_type='String')
```

**매개변수**

| 매개변수     | 유형  | 기본값    | 설명                                                             |
|---------------|-------|------------|------------------------------------------------------------------|
| `return_type` | str   | `"String"` | 함수의 반환 유형. ClickHouse 데이터 유형 중 하나여야 합니다.   |

**비고**

1. 함수는 상태 비저장이어야 합니다. UDF만 지원되며 UDAF는 지원되지 않습니다.
2. 기본 반환 유형은 String입니다. 반환 유형은 ClickHouse 데이터 유형 중 하나여야 합니다.
3. 함수는 String 유형의 인수를 받아야 합니다. 모든 인수는 문자열입니다.
4. 함수는 입력의 각 행마다 호출됩니다.
5. 함수는 순수한 Python 함수여야 하며, 함수에서 사용되는 모든 모듈을 가져와야 합니다.
6. 사용되는 Python 인터프리터는 스크립트를 실행하는 데 사용되는 것과 동일합니다.

**예제**

```python
@chdb_udf()
def sum_udf(lhs, rhs):
    return int(lhs) + int(rhs)

@chdb_udf()
def func_use_json(arg):
    import json
    # ... use json module
```

---
### `chdb.udf.generate_udf` {#generate-udf}

UDF 구성 및 실행 가능 스크립트 파일을 생성합니다.

이 함수는 chDB에서 사용자 정의 함수 (UDF)를 위해 필요한 파일을 생성합니다:
1. 입력 데이터를 처리하는 Python 실행 가능 스크립트
2. ClickHouse에 UDF를 등록하는 XML 구성 파일

**구문**

```python
chdb.udf.generate_udf(func_name, args, return_type, udf_body)
```

**매개변수**

| 매개변수     | 유형  | 설명                                             |
|---------------|-------|---------------------------------------------------|
| `func_name`   | str   | UDF 함수의 이름                                  |
| `args`        | list  | 함수의 인수 이름 목록                           |
| `return_type` | str   | 함수의 ClickHouse 반환 유형                     |
| `udf_body`    | str   | UDF 함수의 Python 소스 코드 본문                |

:::note
이 함수는 일반적으로 @chdb_udf 데코레이터에 의해 호출되며, 사용자가 직접 호출해서는 안 됩니다.
:::

---
## 유틸리티 {#utilities}

chDB를 위한 유틸리티 함수 및 도우미입니다.

이 모듈은 데이터 유형 추론, 데이터 변환 도우미 및 디버깅 유틸리티 등 chDB 작업을 위한 다양한 유틸리티 함수를 포함하고 있습니다.

---
### `chdb.utils.convert_to_columnar` {#convert-to-columnar}

사전 목록을 컬럼형(format)으로 변환합니다.

이 함수는 사전 목록을 받아 각 키가 컬럼에 해당하고 각 값이 컬럼 값의 목록인 사전으로 변환합니다. 사전에서 누락된 값은 None으로 나타냅니다.

**구문**

```python
chdb.utils.convert_to_columnar(items: List[Dict[str, Any]]) → Dict[str, List[Any]]
```

**매개변수**

| 매개변수  | 유형                   | 설명                                   |
|------------|------------------------|---------------------------------------|
| `items`    | `List[Dict[str, Any]]` | 변환할 사전 목록                     |

**반환**

| 반환 유형            | 설명                                                           |
|------------------------|---------------------------------------------------------------|
| `Dict[str, List[Any]]` | 키가 컬럼 이름이고 값이 컬럼 값 목록인 사전                  |

**예제**

```pycon
>>> items = [
...     {"name": "Alice", "age": 30, "city": "New York"},
...     {"name": "Bob", "age": 25},
...     {"name": "Charlie", "city": "San Francisco"}
... ]
>>> convert_to_columnar(items)
{
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [30, 25, None],
    'city': ['New York', None, 'San Francisco']
}
```
### `chdb.utils.flatten_dict` {#flatten-dict}

중첩된 딕셔너리를 평탄화합니다.

이 기능은 중첩된 딕셔너리를 받아서 평탄화하며, 중첩된 키를 구분자로 연결합니다. 딕셔너리의 리스트는 JSON 문자열로 직렬화됩니다.

**문법**

```python
chdb.utils.flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '_') → Dict[str, Any]
```

**매개변수**

| 매개변수     | 유형                | 기본값     | 설명                                         |
|--------------|---------------------|------------|----------------------------------------------|
| `d`          | `Dict[str, Any]`    | *필수*    | 평탄화할 딕셔너리                           |
| `parent_key` | str                 | `""`      | 각 키 앞에 추가할 기본 키                  |
| `sep`        | str                 | `"_"`     | 연결된 키 사이에 사용할 구분자             |

**반환값**

| 반환 유형       | 설명                                |
|-----------------|-------------------------------------|
| `Dict[str, Any]` | 평탄화된 딕셔너리                    |

**예시**

```pycon
>>> nested_dict = {
...     "a": 1,
...     "b": {
...         "c": 2,
...         "d": {
...             "e": 3
...         }
...     },
...     "f": [4, 5, {"g": 6}],
...     "h": [{"i": 7}, {"j": 8}]
... }
>>> flatten_dict(nested_dict)
{
    'a': 1,
    'b_c': 2,
    'b_d_e': 3,
    'f_0': 4,
    'f_1': 5,
    'f_2_g': 6,
    'h': '[{"i": 7}, {"j": 8}]'
}
```

---
### `chdb.utils.infer_data_type` {#infer-data-type}

값 목록에 대해 가장 적합한 데이터 유형을 추론합니다.

이 기능은 값 목록을 검사하고 목록의 모든 값을 나타낼 수 있는 가장 적절한 데이터 유형을 결정합니다. 정수, 부호 없는 정수, 소수 및 부동 소수점 유형을 고려하며, 값이 숫자 유형으로 나타낼 수 없거나 모든 값이 None인 경우 “문자열”로 기본 설정됩니다.

**문법**

```python
chdb.utils.infer_data_type(values: List[Any]) → str
```

**매개변수**

| 매개변수   | 유형            | 설명                                           |
|-------------|-----------------|------------------------------------------------|
| `values`    | `List[Any]`     | 분석할 값 목록. 값은 어떤 유형일 수 있습니다. |

**반환값**

| 반환 유형 | 설명                                                                                                                                                                                                                                 |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `str`     | 추론된 데이터 유형을 나타내는 문자열. 가능한 반환 값은: “int8”, “int16”, “int32”, “int64”, “int128”, “int256”, “uint8”, “uint16”, “uint32”, “uint64”, “uint128”, “uint256”, “decimal128”, “decimal256”, “float32”, “float64”, 또는 “문자열”입니다. |

:::note
- 목록의 모든 값이 None인 경우, 함수는 “문자열”을 반환합니다.
- 목록의 값 중 하나라도 문자열인 경우, 함수는 즉시 “문자열”을 반환합니다.
- 함수는 숫자 값을 범위 및 정밀도에 따라 정수, 소수, 또는 부동 소수점으로 나타낼 수 있다고 가정합니다.
:::

---
### `chdb.utils.infer_data_types` {#infer-data-types}

컬럼형 데이터 구조의 각 컬럼에 대한 데이터 유형을 추론합니다.

이 기능은 각 컬럼의 값을 분석하고 데이터 샘플에 따라 각 컬럼에 가장 적합한 데이터 유형을 추론합니다.

**문법**

```python
chdb.utils.infer_data_types`(column_data: Dict[str, List[Any]], n_rows: int = 10000) → List[tuple]
```

**매개변수**

| 매개변수      | 유형                     | 기본값      | 설명                                                                      |
|---------------|--------------------------|--------------|---------------------------------------------------------------------------|
| `column_data` | `Dict[str, List[Any]]`   | *필수*      | 키가 컬럼 이름이고 값이 컬럼 값 목록인 딕셔너리                        |
| `n_rows`      | int                      | `10000`     | 유형 추론을 위해 샘플링할 행의 수                                       |

**반환값**

| 반환 유형     | 설명                                                        |
|---------------|-------------------------------------------------------------|
| `List[tuple]` | 각 튜플이 컬럼 이름과 추론된 데이터 유형을 포함하는 튜플의 리스트 |

## Abstract Base Classes {#abstract-base-classes}
### **class** `chdb.rwabc.PyReader`(data: Any)` {#pyreader}

기초: `ABC`

```python
class chdb.rwabc.PyReader(data: Any)
```

---
#### **abstractmethod** `read` {#read}

지정된 컬럼에서 행의 수를 읽고, 각 객체가 컬럼의 값을 위한 값의 시퀀스인 객체 목록을 반환합니다.

```python
abstractmethod (col_names: List[str], count: int) → List[Any]
```

**매개변수**

| 매개변수   | 유형             | 설명                                         |
|-------------|------------------|----------------------------------------------|
| `col_names` | `List[str]`      | 읽을 컬럼 이름 목록                          |
| `count`     | int              | 읽을 최대 행 수                              |

**반환값**

| 반환 유형  | 설명                                   |
|------------|----------------------------------------|
| `List[Any]` | 각 컬럼에 대해 하나의 시퀀스 목록     |
### **class** `chdb.rwabc.PyWriter` {#pywriter}

기초: `ABC`

```python
class chdb.rwabc.PyWriter(col_names: List[str], types: List[type], data: Any)
```

---
#### **abstractmethod** finalize {#finalize}

블록에서 최종 데이터를 조합하고 반환합니다. 하위 클래스에서 구현해야 합니다.

```python
abstractmethod finalize() → bytes
```

**반환값**

| 반환 유형  | 설명                                   |
|------------|----------------------------------------|
| `bytes`    | 최종 직렬화된 데이터                   |

---
#### **abstractmethod** `write` {#write}

데이터의 컬럼을 블록에 저장합니다. 하위 클래스에서 구현해야 합니다.

```python
abstractmethod write(col_names: List[str], columns: List[List[Any]]) → None
```

**매개변수**

| 매개변수   | 유형                | 설명                                                    |
|-------------|---------------------|----------------------------------------------------------|
| `col_names` | `List[str]`        | 작성 중인 컬럼 이름 목록                                |
| `columns`   | `List[List[Any]]`   | 각 컬럼이 리스트로 표현되는 컬럼 데이터 목록            |
## Exception Handling {#exception-handling}
### **class** `chdb.ChdbError` {#chdberror}

기초: `Exception`

chDB 관련 오류의 기본 예외 클래스입니다.

이 예외는 chDB 쿼리 실행이 실패하거나 오류가 발생할 때 발생합니다. 이는 표준 Python 예외 클래스에서 상속하며, 기본 ClickHouse 엔진에서 오류 정보를 제공합니다.

예외 메시지에는 일반적으로 ClickHouse의 상세한 오류 정보가 포함되어 있으며, 구문 오류, 유형 불일치, 누락된 테이블/컬럼 및 기타 쿼리 실행 문제를 포함합니다.

**변수**

| 변수     | 유형  | 설명                                                        |
|----------|-------|-------------------------------------------------------------|
| `args`   | -     | 오류 메시지와 추가 인수를 포함하는 튜플                     |

**예시**

```pycon
>>> try:
...     result = chdb.query("SELECT * FROM non_existent_table")
... except chdb.ChdbError as e:
...     print(f"Query failed: {e}")
Query failed: Table 'non_existent_table' doesn't exist
```

```pycon
>>> try:
...     result = chdb.query("SELECT invalid_syntax FROM")
... except chdb.ChdbError as e:
...     print(f"Syntax error: {e}")
Syntax error: Syntax error near 'FROM'
```

:::note
이 예외는 ClickHouse 엔진이 오류를 보고할 때 chdb.query() 및 관련 함수에 의해 자동으로 발생합니다. 실패할 수 있는 쿼리를 처리할 때 이 예외를 잡아 적절한 오류 처리를 제공해야 합니다.
:::
## Version Information {#version-information}
### `chdb.chdb_version = ('3', '6', '0')` {#chdb-version}

내장된 불변 시퀀스입니다.

인수를 제공하지 않으면, 생성자는 빈 튜플을 반환합니다. iterable이 지정되면, 튜플은 iterable의 항목으로 초기화됩니다.

인수가 튜플인 경우, 반환 값은 동일한 객체입니다.

---
### `chdb.engine_version = '25.5.2.1'` {#engine-version}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

주어진 객체에서 새로운 문자열 객체를 생성합니다. 인코딩이나 오류가 지정되면, 객체는 주어진 인코딩과 오류 처리기를 사용하여 디코딩될 데이터 버퍼를 노출해야 합니다. 그렇지 않으면, object.__str__() (정의된 경우) 또는 repr(object)의 결과를 반환합니다.

- 인코딩의 기본값은 ‘utf-8’입니다.
- 오류의 기본값은 ‘strict’입니다.

---
### `chdb.__version__ = '3.6.0'` {#version}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

주어진 객체에서 새로운 문자열 객체를 생성합니다. 인코딩이나 오류가 지정되면, 객체는 주어진 인코딩과 오류 처리기를 사용하여 디코딩될 데이터 버퍼를 노출해야 합니다. 그렇지 않으면, object.__str__() (정의된 경우) 또는 repr(object)의 결과를 반환합니다.

- 인코딩의 기본값은 ‘utf-8’입니다.
- 오류의 기본값은 ‘strict’입니다.
