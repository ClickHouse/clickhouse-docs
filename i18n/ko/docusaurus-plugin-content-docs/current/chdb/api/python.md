---
title: 'chDB Python API 레퍼런스'
sidebar_label: 'Python API'
slug: /chdb/api/python
description: 'chDB를 위한 포괄적인 Python API 레퍼런스'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'api', 'reference']
doc_type: 'reference'
---

# Python API 레퍼런스 \{#python-api-reference\}

## 핵심 쿼리 함수 \{#core-query-functions\}

### `chdb.query` \{#chdb-query\}

chDB 엔진을 사용하여 SQL 쿼리를 실행합니다.

이 함수는 내장된 ClickHouse 엔진을 사용하여 SQL 문을 실행하는 주요 쿼리 함수입니다.
다양한 출력 형식을 지원하며, 메모리 기반 또는 파일 기반 데이터베이스 모두에서 사용할 수 있습니다.

**구문**

```python
chdb.query(sql, output_format='CSV', path='', udf_path='')
```

**매개변수**

| Parameter       | Type | Default    | Description                                                                                                                                                                                                                                             |
| --------------- | ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`           | str  | *required* | 실행할 SQL 쿼리 문자열                                                                                                                                                                                                                                          |
| `output_format` | str  | `"CSV"`    | 결과의 출력 형식. 지원되는 형식:<br />• `"CSV"` - 콤마로 구분된 값<br />• `"JSON"` - JSON 형식<br />• `"Arrow"` - Apache Arrow 형식<br />• `"Parquet"` - Parquet 형식<br />• `"DataFrame"` - Pandas DataFrame<br />• `"ArrowTable"` - PyArrow Table<br />• `"Debug"` - 자세한 로깅 활성화 |
| `path`          | str  | `""`       | 데이터베이스 파일 경로. 기본값은 메모리 내(in-memory) 데이터베이스입니다.<br />파일 경로이거나 메모리 내 데이터베이스의 경우 `":memory:"`일 수 있습니다                                                                                                                                                      |
| `udf_path`      | str  | `""`       | 사용자 정의 함수 디렉터리 경로                                                                                                                                                                                                                                       |

**반환값**

지정된 형식으로 쿼리 결과를 반환합니다:

| Return Type        | Condition                                             |
| ------------------ | ----------------------------------------------------- |
| `str`              | CSV, JSON 같은 텍스트 형식인 경우                               |
| `pd.DataFrame`     | `output_format`이 `"DataFrame"` 또는 `"dataframe"`인 경우   |
| `pa.Table`         | `output_format`이 `"ArrowTable"` 또는 `"arrowtable"`인 경우 |
| chdb result object | 그 외 형식인 경우                                            |

**예외**

| Exception     | Condition                           |
| ------------- | ----------------------------------- |
| `ChdbError`   | SQL 쿼리 실행이 실패한 경우                   |
| `ImportError` | DataFrame/Arrow 형식에 필요한 의존성이 누락된 경우 |

**예시**

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

***


### `chdb.sql` \{#chdb_sql\}

chDB 엔진을 사용하여 SQL 쿼리를 실행합니다.

내장된 ClickHouse 엔진을 사용해 SQL 문을 실행하는 핵심 쿼리 함수입니다.
다양한 출력 형식을 지원하며 메모리 기반 또는 파일 기반 데이터베이스 모두에서
동작합니다.

**구문**

```python
chdb.sql(sql, output_format='CSV', path='', udf_path='')
```

**매개변수**

| Parameter       | Type | Default    | Description                                                                                                                                                                                                                                               |
| --------------- | ---- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`           | str  | *required* | 실행할 SQL 쿼리 문자열                                                                                                                                                                                                                                            |
| `output_format` | str  | `"CSV"`    | 결과 출력 형식. 지원되는 형식:<br />• `"CSV"` - 콤마로 구분된 값<br />• `"JSON"` - JSON 형식<br />• `"Arrow"` - Apache Arrow 형식<br />• `"Parquet"` - Parquet 형식<br />• `"DataFrame"` - Pandas DataFrame<br />• `"ArrowTable"` - PyArrow Table<br />• `"Debug"` - 상세 로깅을 활성화합니다 |
| `path`          | str  | `""`       | 데이터베이스 파일 경로. 기본값은 인메모리 데이터베이스입니다.<br />파일 경로이거나, 인메모리 데이터베이스를 사용할 경우 `":memory:"`가 될 수 있습니다                                                                                                                                                              |
| `udf_path`      | str  | `""`       | 사용자 정의 함수(User-Defined Functions) 디렉터리 경로                                                                                                                                                                                                                 |

**반환값**

지정된 형식으로 쿼리 결과를 반환합니다:

| Return Type        | Condition                                             |
| ------------------ | ----------------------------------------------------- |
| `str`              | CSV, JSON과 같은 텍스트 형식인 경우                              |
| `pd.DataFrame`     | `output_format`이 `"DataFrame"` 또는 `"dataframe"`인 경우   |
| `pa.Table`         | `output_format`이 `"ArrowTable"` 또는 `"arrowtable"`인 경우 |
| chdb result object | 그 외 형식에 대해 반환되는 chdb 결과 객체                            |

**예외**

| Exception                 | Condition                           |
| ------------------------- | ----------------------------------- |
| [`ChdbError`](#chdberror) | SQL 쿼리 실행에 실패한 경우                   |
| `ImportError`             | DataFrame/Arrow 형식에 필요한 의존성이 누락된 경우 |

**예시**

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

***


### `chdb.to_arrowTable` \{#chdb-state-sqlitelike-to_arrowtable\}

쿼리 결과를 PyArrow Table로 변환합니다.

chDB 쿼리 결과를 PyArrow Table로 변환하여 열 지향 데이터 처리를 효율적으로 수행합니다.
결과가 비어 있으면 빈 테이블을 반환합니다.

**구문**

```python
chdb.to_arrowTable(res)
```

**매개변수**

| 매개변수  | 설명                                     |
| ----- | -------------------------------------- |
| `res` | 바이너리 Arrow 데이터를 포함하는 chDB 쿼리 결과 객체입니다. |

**반환값**

| 반환 타입      | 설명                            |
| ---------- | ----------------------------- |
| `pa.Table` | 쿼리 결과를 포함하는 PyArrow Table입니다. |

**예외**

| 오류 타입         | 설명                                      |
| ------------- | --------------------------------------- |
| `ImportError` | pyarrow 또는 pandas가 설치되어 있지 않은 경우 발생합니다. |

**예시**

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> table = chdb.to_arrowTable(result)
>>> print(table.to_pandas())
   id    msg
0   1  hello
```

***


### `chdb.to_df` \{#chdb_to_df\}

쿼리 결과를 pandas DataFrame으로 변환합니다.

chDB 쿼리 결과를 먼저 PyArrow Table로 변환한 다음, 보다 나은 성능을 위해 멀티스레딩을 사용하여 pandas DataFrame으로 변환합니다.

**구문**

```python
chdb.to_df(r)
```

**매개변수**

| 매개변수 | 설명                               |
| ---- | -------------------------------- |
| `r`  | Arrow 이진 데이터를 포함하는 chDB 쿼리 결과 객체 |

**반환값**

| 반환 타입          | 설명                           |
| -------------- | ---------------------------- |
| `pd.DataFrame` | 쿼리 결과를 포함하는 pandas DataFrame |

**예외**

| 예외            | 조건                               |
| ------------- | -------------------------------- |
| `ImportError` | pyarrow 또는 pandas가 설치되어 있지 않은 경우 |

**예제**

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> df = chdb.to_df(result)
>>> print(df)
   id    msg
0   1  hello
```


## 연결 및 세션 관리 \{#connection-session-management\}

다음 세션 FUNCTION을 사용할 수 있습니다:

### `chdb.connect` \{#chdb-connect\}

chDB 백그라운드 서버에 연결을 생성합니다.

이 함수는 chDB (ClickHouse) 데이터베이스 엔진에 대한 [Connection](#chdb-state-sqlitelike-connection)을 설정합니다.
프로세스마다 하나의 활성 연결만 허용됩니다.
동일한 연결 문자열로 이 함수를 여러 번 호출하면 동일한 연결 객체를 반환합니다.

```python
chdb.connect(connection_string: str = ':memory:') → Connection
```

**매개변수:**

| Parameter           | Type | Default      | Description                      |
| ------------------- | ---- | ------------ | -------------------------------- |
| `connection_string` | str  | `":memory:"` | 데이터베이스 연결 문자열입니다. 아래 형식을 참고하십시오. |

**기본 형식**

| Format                    | Description       |
| ------------------------- | ----------------- |
| `":memory:"`              | 메모리 내 데이터베이스(기본값) |
| `"test.db"`               | 상대 경로 데이터베이스 파일   |
| `"file:test.db"`          | 상대 경로와 동일한 의미     |
| `"/path/to/test.db"`      | 절대 경로 데이터베이스 파일   |
| `"file:/path/to/test.db"` | 절대 경로와 동일한 의미     |

**쿼리 매개변수 사용**

| Format                                             | Description           |
| -------------------------------------------------- | --------------------- |
| `"file:test.db?param1=value1&param2=value2"`       | 매개변수가 있는 상대 경로        |
| `"file::memory:?verbose&log-level=test"`           | 매개변수가 있는 메모리 내 데이터베이스 |
| `"///path/to/test.db?param1=value1&param2=value2"` | 매개변수가 있는 절대 경로        |

**쿼리 매개변수 처리**

쿼리 매개변수는 ClickHouse 엔진에 시작 인수(arguments)로 전달됩니다.
특수 매개변수 처리는 다음과 같습니다.

| Special Parameter | Becomes        | Description |
| ----------------- | -------------- | ----------- |
| `mode=ro`         | `--readonly=1` | 읽기 전용 모드    |
| `verbose`         | (flag)         | 상세 로깅 활성화   |
| `log-level=test`  | (setting)      | 로깅 레벨 설정    |

전체 매개변수 목록은 `clickhouse local --help --verbose`를 참고하십시오.

**반환값**

| Return Type  | Description                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Connection` | 다음을 지원하는 데이터베이스 연결 객체:<br />• `Connection.cursor()`로 커서 생성<br />• `Connection.query()`로 직접 쿼리 실행<br />• `Connection.send_query()`로 스트리밍 쿼리 실행<br />• 자동 정리를 위한 컨텍스트 매니저 프로토콜 지원 |

**예외**

| Exception      | Condition            |
| -------------- | -------------------- |
| `RuntimeError` | 데이터베이스 연결에 실패한 경우 발생 |

:::warning
프로세스당 하나의 연결만 지원됩니다.
새 연결을 생성하면 기존 연결은 모두 종료됩니다.
:::

**예시**

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

**함께 보기**

* [`Connection`](#chdb-state-sqlitelike-connection) - 데이터베이스 연결 클래스
* [`Cursor`](#chdb-state-sqlitelike-cursor) - DB-API 2.0 작업을 위한 데이터베이스 커서


## 예외 처리 \{#chdb-exceptions\}

### **class** `chdb.ChdbError` \{#chdb_chdbError\}

Bases: `Exception`

chDB와 관련된 오류를 위한 기본 예외 클래스입니다.

이 예외는 chDB 쿼리 실행이 실패하거나 오류가 발생했을 때 발생합니다.
표준 Python `Exception` 클래스를 상속하며, 백엔드 ClickHouse 엔진에서
제공하는 오류 정보를 전달합니다.

---

### **class** `chdb.session.Session` \{#chdb_session_session\}

Bases: `object`

Session은 쿼리 상태를 유지합니다.
`path`가 None이면 임시 디렉터리를 생성해 데이터베이스 경로로 사용하며,
세션이 종료되면 해당 임시 디렉터리가 제거됩니다.
또한 경로를 직접 전달해 해당 경로에 데이터베이스를 생성하고 그곳에 데이터를 보존할 수도 있습니다.

또한 연결 문자열을 사용해 경로 및 기타 매개변수를 전달할 수도 있습니다.

```python
class chdb.session.Session(path=None)
```

**예시**

| Connection String                                  | 설명                       |
| -------------------------------------------------- | ------------------------ |
| `":memory:"`                                       | 인메모리 데이터베이스              |
| `"test.db"`                                        | 상대 경로                    |
| `"file:test.db"`                                   | 위와 동일                    |
| `"/path/to/test.db"`                               | 절대 경로                    |
| `"file:/path/to/test.db"`                          | 위와 동일                    |
| `"file:test.db?param1=value1&param2=value2"`       | 쿼리 파라미터가 포함된 상대 경로       |
| `"file::memory:?verbose&log-level=test"`           | 쿼리 파라미터가 포함된 인메모리 데이터베이스 |
| `"///path/to/test.db?param1=value1&param2=value2"` | 쿼리 파라미터가 포함된 절대 경로       |

:::note Connection string args handling
「[file:test.db?param1=value1&amp;param2=value2](file:test.db?param1=value1\&param2=value2)」와 같이 쿼리 파라미터를 포함하는 Connection string의
「param1=value1」은 시작 인자(start up args)로 ClickHouse 엔진에 전달됩니다.

자세한 내용은 `clickhouse local –help –verbose`를 참조하십시오.

특수 인자 처리 예시는 다음과 같습니다.

* 「mode=ro」는 ClickHouse에서 「–readonly=1」로 처리됩니다(읽기 전용 모드).
  :::

:::warning 중요

* 동시에 존재할 수 있는 세션은 하나뿐입니다. 새 세션을 생성하려면 기존 세션을 먼저 종료해야 합니다.
* 새 세션을 생성하면 기존 세션이 종료됩니다.
  :::

***


#### `cleanup` \{#cleanup\}

예외 처리를 포함하여 세션 리소스를 정리합니다.

이 메서드는 정리 과정에서 발생할 수 있는 예외를 무시하고 세션을 닫으려고 시도합니다.
오류 처리 시나리오에서 특히 유용하며, 세션 상태와 관계없이 정리가 항상 수행되도록 해야 할 때 사용할 수 있습니다.

**구문**

```python
cleanup()
```

:::note
이 메서드는 절대 예외를 발생시키지 않으므로 `finally` 블록이나 소멸자에서 안전하게 호출할 수 있습니다.
:::

**예시**

```pycon
>>> session = Session("test.db")
>>> try:
...     session.query("INVALID SQL")
... finally:
...     session.cleanup()  # Safe cleanup regardless of errors
```

**참고**

* [`close()`](#chdb-session-session-close) - 오류 전파를 포함하여 세션을 명시적으로 종료할 때 사용합니다.

***


#### `close` \{#close\}

세션을 종료하고 리소스를 정리합니다.

이 메서드는 내부 연결을 닫고 전역 세션 상태를 재설정합니다.
이 메서드를 호출한 이후에는 세션이 무효화되어 추가 쿼리를
실행하는 데 더 이상 사용할 수 없습니다.

**Syntax**

```python
close()
```

:::note
이 메서드는 세션을 컨텍스트 매니저로 사용할 때나
세션 객체가 소멸될 때 자동으로 호출됩니다.
:::

:::warning Important
`close()`를 호출한 이후에 세션을 사용하려 하면 오류가 발생합니다.
:::

**예제**

```pycon
>>> session = Session("test.db")
>>> session.query("SELECT 1")
>>> session.close()  # Explicitly close the session
```

***


#### `query` \{#chdb-session-session-query\}

SQL 쿼리를 실행하고 결과를 반환합니다.

이 메서드는 세션의 데이터베이스에 대해 SQL 쿼리를 실행하고 지정된 형식으로 결과를 반환합니다. 이 메서드는 다양한 출력 형식을 지원하며 쿼리를 연속해서 실행할 때 세션 상태를 유지합니다.

**구문**

```python
query(sql, fmt='CSV', udf_path='')
```

**매개변수**

| 매개변수       | 타입  | 기본값        | 설명                                                                                                                                                                                                                                                                         |
| ---------- | --- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`      | str | *required* | 실행할 SQL 쿼리 문자열                                                                                                                                                                                                                                                             |
| `fmt`      | str | `"CSV"`    | 결과 출력 형식. 사용 가능한 형식:<br />• `"CSV"` - 콤마로 구분된 값 형식<br />• `"JSON"` - JSON 형식<br />• `"TabSeparated"` - 탭으로 구분된 값 형식<br />• `"Pretty"` - 테이블을 사람이 보기 좋게 출력하는 형식<br />• `"JSONCompact"` - Compact JSON 형식<br />• `"Arrow"` - Apache Arrow 형식<br />• `"Parquet"` - Parquet 형식 |
| `udf_path` | str | `""`       | 사용자 정의 함수 경로. 지정하지 않으면 세션 초기화 시 설정된 UDF 경로를 사용합니다.                                                                                                                                                                                                                         |

**반환값**

지정된 형식으로 쿼리 결과를 반환합니다.
정확한 반환 타입은 `fmt` 매개변수에 따라 달라집니다:

* 문자열 형식(CSV, JSON 등)은 `str`을 반환합니다.
* 바이너리 형식(Arrow, Parquet)은 `bytes`를 반환합니다.

**예외**

| Exception      | Condition             |
| -------------- | --------------------- |
| `RuntimeError` | 세션이 닫혀 있거나 유효하지 않은 경우 |
| `ValueError`   | SQL 쿼리 구문이 잘못된 경우     |

:::note
&quot;Debug&quot; 형식은 지원되지 않으며, 경고와 함께 자동으로
&quot;CSV&quot; 형식으로 변환됩니다.
디버깅에는 연결 문자열 매개변수를 사용하십시오.
:::

:::warning Warning
이 메서드는 쿼리를 동기적으로 실행하고 모든 결과를 메모리에
적재합니다. 결과 행 수가 많은 경우, 스트리밍 결과를 위해
[`send_query()`](#chdb-session-session-send_query)를 사용하는 것을 고려하십시오.
:::

**예시**

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

**관련 항목**

* [`send_query()`](#chdb-session-session-send_query) - 스트리밍 쿼리 실행
* [`sql`](#chdb-session-session-sql) - 이 메서드의 별칭

***


#### `send_query` \{#chdb-session-session-send_query\}

SQL 쿼리를 실행하고 스트리밍 방식의 결과 이터레이터를 반환합니다.

이 메서드는 세션의 데이터베이스에 SQL 쿼리를 실행하고,
모든 결과를 한 번에 메모리에 로드하지 않고도 결과를 순차적으로 순회할 수 있는
스트리밍 결과 객체를 반환합니다. 특히 결과 집합이 큰 경우 유용합니다.

**구문**

```python
send_query(sql, fmt='CSV') → StreamingResult
```

**매개변수**

| Parameter | Type | Default    | Description                                                                                                                                                                                                                   |
| --------- | ---- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`     | str  | *required* | 실행할 SQL 쿼리 문자열                                                                                                                                                                                                                |
| `fmt`     | str  | `"CSV"`    | 결과의 출력 형식입니다. 사용 가능한 형식:<br />• `"CSV"` - 쉼표로 구분된 값<br />• `"JSON"` - JSON 형식<br />• `"TabSeparated"` - 탭으로 구분된 값<br />• `"JSONCompact"` - Compact JSON 형식<br />• `"Arrow"` - Apache Arrow 형식<br />• `"Parquet"` - Parquet 형식 |

**반환값**

| Return Type       | Description                                                                         |
| ----------------- | ----------------------------------------------------------------------------------- |
| `StreamingResult` | 쿼리 결과를 스트리밍 방식으로 순차적으로 반환하는 이터레이터입니다. 이 이터레이터는 for 루프에서 사용하거나 다른 데이터 구조로 변환할 수 있습니다 |

**예외**

| Exception      | Condition             |
| -------------- | --------------------- |
| `RuntimeError` | 세션이 닫혔거나 유효하지 않은 경우   |
| `ValueError`   | SQL 쿼리 형식이 올바르지 않은 경우 |

:::note
“Debug” 형식은 지원되지 않으며, 경고와 함께 자동으로
“CSV”로 변환됩니다. 디버깅에는 대신 연결 문자열 매개변수를 사용하십시오.
:::

:::warning
반환된 `StreamingResult` 객체는 데이터베이스에 대한 연결을 유지하므로, 신속하게 사용을 완료하거나 적절히 저장해야 합니다.
:::

**예시**

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

**관련 항목**

* [`query()`](#chdb-session-session-query) - 스트리밍이 아닌 쿼리 실행용
* `chdb.state.sqlitelike.StreamingResult` - 스트리밍 결과 이터레이터

***


#### `sql` \{#chdb-session-session-sql\}

SQL 쿼리를 실행하고 결과를 반환합니다.

이 메서드는 세션의 데이터베이스에 대해 SQL 쿼리를 실행하고
지정된 형식으로 결과를 반환합니다. 또한 다양한 출력 형식을 지원하며
쿼리 간에 세션 상태를 유지합니다.

**구문**

```python
sql(sql, fmt='CSV', udf_path='')
```

**매개변수**

| Parameter  | Type | Default    | Description                                                                                                                                                                                                                                                  |
| ---------- | ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sql`      | str  | *required* | 실행할 SQL 쿼리 문자열                                                                                                                                                                                                                                               |
| `fmt`      | str  | `"CSV"`    | 결과 출력 형식. 사용 가능한 형식:<br />• `"CSV"` - 콤마로 구분된 값<br />• `"JSON"` - JSON 형식<br />• `"TabSeparated"` - 탭으로 구분된 값<br />• `"Pretty"` - 가독성이 높은 테이블 형식<br />• `"JSONCompact"` - Compact JSON 형식<br />• `"Arrow"` - Apache Arrow 형식<br />• `"Parquet"` - Parquet 형식 |
| `udf_path` | str  | `""`       | 사용자 정의 함수(UDF) 경로. 지정하지 않으면 세션 초기화 시 설정된 UDF 경로를 사용합니다.                                                                                                                                                                                                      |

**반환값**

지정된 형식으로 쿼리 결과를 반환합니다.
정확한 반환 타입은 `fmt` 매개변수에 따라 달라집니다:

* 문자열 형식(CSV, JSON 등)은 `str`을 반환합니다.
* 이진 형식(Arrow, Parquet)은 `bytes`를 반환합니다.

**예외:**

| Exception      | Condition             |
| -------------- | --------------------- |
| `RuntimeError` | 세션이 닫혀 있거나 유효하지 않은 경우 |
| `ValueError`   | SQL 쿼리 문법이 잘못된 경우     |

:::note
“Debug” 형식은 지원되지 않으며, 경고와 함께 자동으로
“CSV”로 변환됩니다. 디버깅에는 대신 연결 문자열 매개변수를
사용하십시오.
:::

:::warning Warning
이 메서드는 쿼리를 동기적으로 실행하고 모든 결과를 메모리에
적재합니다.
결과 집합이 큰 경우 스트리밍 결과를 위해 [`send_query()`](#chdb-session-session-send_query) 사용을 고려하십시오.
:::

**예시**

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

**참고**

* [`send_query()`](#chdb-session-session-send_query) - 스트리밍 쿼리 실행을 위한 메서드
* [`sql`](#chdb-session-session-sql) - 이 메서드의 별칭


## 상태 관리 \{#chdb-state-management\}

### `chdb.state.connect` \{#chdb_state_connect\}

chDB 백그라운드 서버에 대한 [Connection](#chdb-state-sqlitelike-connection)을 생성합니다.

이 함수는 chDB (ClickHouse) 데이터베이스 엔진에 대한 연결을 설정합니다.
프로세스당 열린 연결은 한 개만 허용됩니다. 동일한
연결 문자열로 여러 번 호출하면 동일한 연결 객체를 반환합니다.

**구문**

```python
chdb.state.connect(connection_string: str = ':memory:') → Connection
```

**매개변수**

| 매개변수                               | 타입  | 기본값          | 설명                               |
| ---------------------------------- | --- | ------------ | -------------------------------- |
| `connection_string(str, optional)` | str | `":memory:"` | 데이터베이스 연결 문자열입니다. 아래 형식을 참고하십시오. |

**기본 형식**

지원되는 연결 문자열 형식은 다음과 같습니다:

| 형식                        | 설명                |
| ------------------------- | ----------------- |
| `":memory:"`              | 메모리 내 데이터베이스(기본값) |
| `"test.db"`               | 상대 경로 데이터베이스 파일   |
| `"file:test.db"`          | 상대 경로와 동일         |
| `"/path/to/test.db"`      | 절대 경로 데이터베이스 파일   |
| `"file:/path/to/test.db"` | 절대 경로와 동일         |

**쿼리 매개변수 포함 형식**

| 형식                                                 | 설명                |
| -------------------------------------------------- | ----------------- |
| `"file:test.db?param1=value1&param2=value2"`       | 매개변수가 있는 상대 경로    |
| `"file::memory:?verbose&log-level=test"`           | 매개변수가 있는 메모리 내 DB |
| `"///path/to/test.db?param1=value1&param2=value2"` | 매개변수가 있는 절대 경로    |

**쿼리 매개변수 처리**

쿼리 매개변수는 시작 인수로 ClickHouse 엔진에 전달됩니다.
특별 매개변수 처리 방식은 다음과 같습니다:

| 특수 매개변수          | 변환값            | 설명         |
| ---------------- | -------------- | ---------- |
| `mode=ro`        | `--readonly=1` | 읽기 전용 모드   |
| `verbose`        | (flag)         | 자세한 로깅 활성화 |
| `log-level=test` | (setting)      | 로깅 레벨 설정   |

전체 매개변수 목록은 `clickhouse local --help --verbose`를 참고하십시오.

**반환값**

| 반환 타입        | 설명                                                                                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Connection` | 다음을 지원하는 데이터베이스 연결 객체입니다:<br />• `Connection.cursor()`로 커서 생성<br />• `Connection.query()`로 직접 쿼리 실행<br />• `Connection.send_query()`로 스트리밍 쿼리 실행<br />• 자동 정리를 위한 컨텍스트 관리자 프로토콜 지원 |

**예외**

| 예외 타입          | 발생 조건          |
| -------------- | -------------- |
| `RuntimeError` | 데이터베이스 연결 실패 시 |

:::warning Warning
프로세스당 하나의 연결만 지원됩니다.
새 연결을 생성하면 기존 연결이 모두 종료됩니다.
:::

**예시**

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

* `Connection` - 데이터베이스 연결 클래스
* `Cursor` - DB-API 2.0 작업을 위한 데이터베이스 커서


### **class** `chdb.state.sqlitelike.Connection` \{#chdb-state-sqlitelike-connection\}

기반 클래스: `object`

**구문**

```python
class chdb.state.sqlitelike.Connection(connection_string: str)
```

***


#### `close` \{#chdb-session-session-close\}

연결을 닫고 리소스를 정리합니다.

이 메서드는 데이터베이스 연결을 닫고 활성 커서를 포함한 관련 리소스를 모두 정리합니다. 이 메서드를 호출한 후에는
연결이 더 이상 유효하지 않으며 이후 작업에 사용할 수 없습니다.

**Syntax**

```python
close() → None
```

:::note
이 메서드는 멱등적입니다. 여러 번 호출해도 안전합니다.
:::

:::warning Warning
실행 중인 모든 스트리밍 쿼리는 연결이 종료되면 취소됩니다. 연결을 종료하기 전에 중요한 데이터가 모두 처리되었는지 확인하십시오.
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

***


#### `cursor` \{#chdb-state-sqlitelike-connection-cursor\}

쿼리를 실행하기 위한 [Cursor](#chdb-state-sqlitelike-cursor) 객체를 생성합니다.

이 메서드는 쿼리 실행 및 결과 가져오기를 위한 표준
DB-API 2.0 인터페이스를 제공하는 데이터베이스 커서를 생성합니다.
커서를 사용하면 쿼리 실행과 결과 조회를 세밀하게 제어할 수 있습니다.

**구문**

```python
cursor() → Cursor
```

**반환값**

| 반환 타입    | 설명                  |
| -------- | ------------------- |
| `Cursor` | 데이터베이스 작업을 위한 커서 객체 |

:::note
새 커서를 생성하면 이 커넥션과 연결된 기존 커서는 교체됩니다.
커넥션 하나당 하나의 커서만 지원됩니다.
:::

**예제**

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

**참고**

* [`Cursor`](#chdb-state-sqlitelike-cursor) - 데이터베이스 커서 구현체

***


#### `query` \{#chdb-state-sqlitelike-connection-query\}

SQL 쿼리를 실행하고 전체 결과를 반환합니다.

이 메서드는 SQL 쿼리를 동기적으로 실행하고 전체 결과 집합을 반환합니다. 다양한 출력 형식을 지원하며, 형식별 후처리를 자동으로 적용합니다.

**구문**

```python
query(query: str, format: str = 'CSV') → Any
```

**매개변수:**

| Parameter | Type | Default    | Description                                                                                                                                                                                                                               |
| --------- | ---- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`   | str  | *required* | 실행할 SQL 쿼리 문자열                                                                                                                                                                                                                            |
| `format`  | str  | `"CSV"`    | 결과 출력 형식입니다. 지원되는 형식:<br />• `"CSV"` - 콤마로 구분된 값(string)<br />• `"JSON"` - JSON 형식(string)<br />• `"Arrow"` - Apache Arrow 형식(bytes)<br />• `"Dataframe"` - Pandas DataFrame(pandas 필요)<br />• `"Arrowtable"` - PyArrow Table(pyarrow 필요) |

**반환값**

| Return Type        | Description                 |
| ------------------ | --------------------------- |
| `str`              | 문자열 형식(CSV, JSON)에 대해 반환됩니다 |
| `bytes`            | Arrow 형식에 대해 반환됩니다          |
| `pandas.DataFrame` | dataframe 형식에 대해 반환됩니다      |
| `pyarrow.Table`    | arrowtable 형식에 대해 반환됩니다     |

**예외**

| Exception      | Condition               |
| -------------- | ----------------------- |
| `RuntimeError` | 쿼리 실행이 실패한 경우           |
| `ImportError`  | 형식에 필요한 패키지가 설치되지 않은 경우 |

:::warning Warning
이 메서드는 전체 결과 집합을 메모리에 로드합니다. 결과가 큰 경우,
스트리밍을 위해 [`send_query()`](#chdb-state-sqlitelike-connection-send_query) 사용을 고려하십시오.
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

**관련 항목**

* [`send_query()`](#chdb-state-sqlitelike-connection-send_query) - 스트리밍 방식 쿼리 실행용

***


#### `send_query` \{#chdb-state-sqlitelike-connection-send_query\}

SQL 쿼리를 실행하고 스트리밍 결과 이터레이터를 반환합니다.

이 메서드는 SQL 쿼리를 실행하고 StreamingResult 객체를 반환하며,
이를 통해 모든 결과를 한 번에 메모리에 로드하지 않고 순차적으로
결과를 순회(iterate)할 수 있습니다. 대용량 결과 집합을 처리하는 데 적합합니다.

**Syntax**

```python
send_query(query: str, format: str = 'CSV') → StreamingResult
```

**매개변수**

| Parameter | Type | Default    | Description                                                                                                                                                                                                                    |
| --------- | ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `query`   | str  | *required* | 실행할 SQL 쿼리 문자열                                                                                                                                                                                                                 |
| `format`  | str  | `"CSV"`    | 결과 출력 형식입니다. 지원되는 형식:<br />• `"CSV"` - 쉼표로 구분된 값<br />• `"JSON"` - JSON 형식<br />• `"Arrow"` - Apache Arrow 형식 (`record_batch()` 메서드 사용 가능)<br />• `"dataframe"` - Pandas DataFrame 청크<br />• `"arrowtable"` - PyArrow Table 청크 |

**반환값**

| Return Type       | Description                                                                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StreamingResult` | 다음을 지원하는 쿼리 결과용 스트리밍 이터레이터입니다:<br />• 이터레이터 프로토콜(for 루프용)<br />• 컨텍스트 매니저 프로토콜(with 문용)<br />• `fetch()` 메서드를 통한 수동 데이터 가져오기<br />• PyArrow RecordBatch 스트리밍(Arrow 형식에서만 지원) |

**예외**

| Exception      | Condition                     |
| -------------- | ----------------------------- |
| `RuntimeError` | 쿼리 실행에 실패한 경우                 |
| `ImportError`  | `format`에 필요한 패키지가 설치되지 않은 경우 |

:::note
반환된 StreamingResult에서 `record_batch()` 메서드를 지원하는 형식은 「Arrow」 형식뿐입니다.
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

**관련 항목**

* [`query()`](#chdb-state-sqlitelike-connection-query) - 스트리밍이 아닌 쿼리 실행용
* [`StreamingResult`](#chdb-state-sqlitelike-streamingresult) - 스트리밍 결과를 위한 이터레이터

***


### **class** `chdb.state.sqlitelike.StreamingResult` \{#chdb-state-sqlitelike-streamingresult\}

Bases: `object`

대용량 쿼리 결과를 처리하기 위한 스트리밍 결과 이터레이터입니다.

이 클래스는 전체 결과 집합을 메모리에 모두 적재하지 않고 쿼리 결과를 스트리밍하기 위한 이터레이터 인터페이스를 제공합니다. 다양한 출력 형식을 지원하며, 결과를 수동으로 가져오는 메서드와 PyArrow `RecordBatch` 스트리밍 기능을 제공합니다.

```python
class chdb.state.sqlitelike.StreamingResult
```

***


#### `fetch` \{#streamingresult-fetch\}

스트리밍 결과에서 다음 청크를 가져옵니다.

이 메서드는 스트리밍 쿼리 결과에서 사용 가능한 다음 데이터 청크를
가져옵니다. 반환되는 데이터 형식은 스트리밍 쿼리를 시작할 때
지정한 형식에 따라 달라집니다.

**구문**

```python
fetch() → Any
```

**반환값**

| 반환 타입   | 설명                        |
| ------- | ------------------------- |
| `str`   | 텍스트 형식(CSV, JSON)인 경우     |
| `bytes` | 이진 형식(Arrow, Parquet)인 경우 |
| `None`  | 결과 스트림이 모두 소진된 경우         |

**예시**

```pycon
>>> stream = conn.send_query("SELECT * FROM large_table")
>>> chunk = stream.fetch()
>>> while chunk is not None:
...     process_data(chunk)
...     chunk = stream.fetch()
```

***


#### `cancel` \{#streamingresult-cancel\}

스트리밍 쿼리를 취소하고 리소스를 정리합니다.

이 메서드는 진행 중인 스트리밍 쿼리를 취소하고 관련된 리소스를 해제합니다.
스트림이 모두 소진되기 전에 결과 처리를 중단하려는 경우 호출해야 합니다.

**구문**

```python
cancel() → None
```

**예제**

```pycon
>>> stream = conn.send_query("SELECT * FROM very_large_table")
>>> for i, chunk in enumerate(stream):
...     if i >= 10:  # Only process first 10 chunks
...         stream.cancel()
...         break
...     process_data(chunk)
```

***


#### `close` \{#streamingresult-close\}

스트리밍 결과를 닫고 리소스를 정리합니다.

[`cancel()`](#streamingresult-cancel)에 대한 별칭입니다. 스트리밍 결과 이터레이터를 닫고
관련된 리소스를 모두 해제합니다.

**Syntax**

```python
close() → None
```

***


#### `record_batch` \{#streamingresult-record_batch\}

효율적인 배치 처리를 위한 PyArrow `RecordBatchReader`를 생성합니다.

이 메서드는 PyArrow `RecordBatchReader`를 생성하여
Arrow 형식의 쿼리 결과를 효율적으로 순회할 수 있도록 합니다.
PyArrow를 사용할 때 대규모 결과 집합을 처리하는 가장 효율적인 방법입니다.

**문법**

```python
record_batch(rows_per_batch: int = 1000000) → pa.RecordBatchReader
```

**매개변수**

| 매개변수             | 타입  | 기본값       | 설명           |
| ---------------- | --- | --------- | ------------ |
| `rows_per_batch` | int | `1000000` | 배치당 행(row) 수 |

**반환값**

| 반환 타입                  | 설명                                               |
| ---------------------- | ------------------------------------------------ |
| `pa.RecordBatchReader` | 배치를 순회(iteration)하기 위한 PyArrow RecordBatchReader |

:::note
이 메서드는 스트리밍 쿼리가 `format="Arrow"`로 시작된 경우에만 사용할 수 있습니다.
다른 포맷으로 사용하면 오류가 발생합니다.
:::

**예시**

```pycon
>>> stream = conn.send_query("SELECT * FROM data", format="Arrow")
>>> reader = stream.record_batch(rows_per_batch=10000)
>>> for batch in reader:
...     print(f"Processing batch: {batch.num_rows} rows")
...     df = batch.to_pandas()
...     process_dataframe(df)
```

***


#### 이터레이터 프로토콜 \{#streamingresult-iterator\}

StreamingResult는 Python 이터레이터 프로토콜을 지원하므로 for 루프에서
바로 사용할 수 있습니다:

```pycon
>>> stream = conn.send_query("SELECT number FROM numbers(1000000)")
>>> for chunk in stream:
...     print(f"Chunk size: {len(chunk)} bytes")
```

***


#### 컨텍스트 매니저 프로토콜 \{#streamingresult-context-manager\}

StreamingResult는 리소스를 자동으로 정리하기 위한 컨텍스트 매니저 프로토콜을 지원합니다.

```pycon
>>> with conn.send_query("SELECT * FROM data") as stream:
...     for chunk in stream:
...         process(chunk)
>>> # Stream automatically closed
```

***


### **class** `chdb.state.sqlitelike.Cursor` \{#chdb-state-sqlitelike-cursor\}

베이스 클래스: `object`

```python
class chdb.state.sqlitelike.Cursor(connection)
```

***


#### `close` \{#cursor-close-none\}

커서를 닫고 리소스를 정리합니다.

이 메서드는 커서를 닫고 연관된 모든 리소스를 정리합니다.
이 메서드를 호출하면 커서는 더 이상 유효하지 않으며,
추가 작업에 사용할 수 없습니다.

**Syntax**

```python
close() → None
```

:::note
이 메서드는 멱등적입니다. 여러 번 호출해도 안전하게 동작합니다.
커서는 연결이 닫힐 때 자동으로 함께 닫힙니다.
:::

**예시**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT 1")
>>> result = cursor.fetchone()
>>> cursor.close()  # Cleanup cursor resources
```

***


#### `column_names` \{#chdb-state-sqlitelike-cursor-column_names\}

마지막으로 실행된 쿼리의 컬럼 이름 목록을 반환합니다.

이 메서드는 가장 최근에 실행된
SELECT 쿼리의 컬럼 이름을 반환합니다. 이름은 결과 집합에
나타나는 순서와 동일한 순서로 반환됩니다.

**구문**

```python
column_names() → list
```

**반환값**

| 반환 타입  | 설명                                                               |
| ------ | ---------------------------------------------------------------- |
| `list` | 컬럼 이름 문자열 목록입니다. 아직 쿼리를 실행하지 않았거나 쿼리가 어떤 컬럼도 반환하지 않은 경우 빈 목록입니다. |

**예시**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name, email FROM users LIMIT 1")
>>> print(cursor.column_names())
['id', 'name', 'email']
```

**함께 보기**

* [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - 컬럼 타입 정보를 가져옵니다
* [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0 컬럼 설명

***


#### `column_types` \{#chdb-state-sqlitelike-cursor-column_types\}

마지막으로 실행된 쿼리에서 컬럼 타입 목록을 반환합니다.

이 메서드는 가장 최근에 실행된 SELECT 쿼리에서 ClickHouse 컬럼 타입 이름을
반환합니다. 타입은 결과 집합에 나타나는 순서와 동일한 순서로 반환됩니다.

**Syntax**

```python
column_types() → list
```

**반환값**

| 반환 타입  | 설명                                                                       |
| ------ | ------------------------------------------------------------------------ |
| `list` | ClickHouse 타입 이름 문자열 리스트이며, 아직 쿼리가 실행되지 않았거나 쿼리가 컬럼을 반환하지 않은 경우 빈 리스트입니다 |

**예시**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT toInt32(1), toString('hello')")
>>> print(cursor.column_types())
['Int32', 'String']
```

**함께 보기**

* [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - 컬럼 이름 정보
* [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0 컬럼 설명

***


#### `commit` \{#commit\}

보류 중인 트랜잭션을 커밋합니다.

이 메서드는 보류 중인 데이터베이스 트랜잭션을 커밋합니다. ClickHouse에서는
대부분의 작업이 자동으로 커밋되지만, 이 메서드는 DB-API 2.0과의
호환성을 위해 제공됩니다.

:::note
ClickHouse는 일반적으로 작업을 자동으로 커밋하므로, 명시적인 커밋은
대부분 필요하지 않습니다. 이 메서드는 표준 DB-API 2.0 워크플로우와의
호환성을 위해 제공됩니다.
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

***


#### `property description : list` \{#chdb-state-sqlitelike-cursor-description\}

DB-API 2.0 사양에 따라 컬럼 설명을 반환합니다.

이 속성은 마지막으로 실행된 SELECT 쿼리의 결과 집합에 있는 각 컬럼을
설명하는 7개 항목으로 구성된 튜플의 목록을 반환합니다. 각 튜플은 다음을 포함합니다:
(name, type&#95;code, display&#95;size, internal&#95;size, precision, scale, null&#95;ok)

현재는 name과 type&#95;code만 제공되며, 나머지 필드는 None으로 설정됩니다.

**반환값**

| Return Type | Description                                           |
| ----------- | ----------------------------------------------------- |
| `list`      | 각 컬럼을 설명하는 7-튜플의 목록. SELECT 쿼리가 실행되지 않았다면 빈 목록을 반환합니다 |

:::note
cursor.description에 대한 DB-API 2.0 사양을 따릅니다.
이 구현에서는 처음 두 요소(name 및 type&#95;code)만 의미 있는
데이터를 포함합니다.
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

**함께 보기**

* [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - 컬럼 이름만 반환합니다
* [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - 컬럼 타입만 반환합니다

***


#### `execute` \{#execute\}

SQL 쿼리를 실행하고 결과를 가져올 수 있도록 준비합니다.

이 메서드는 SQL 쿼리를 실행하고 fetch 메서드를 사용하여 결과를 조회할 수 있도록 준비합니다.
결과 데이터의 파싱과 ClickHouse 데이터 타입에 대한 자동 형 변환을 수행합니다.

**구문**

```python
execute(query: str) → None
```

**매개변수:**

| Parameter | Type | Description    |
| --------- | ---- | -------------- |
| `query`   | str  | 실행할 SQL 쿼리 문자열 |

**발생 예외**

| Exception   | Condition                   |
| ----------- | --------------------------- |
| `Exception` | 쿼리 실행이 실패하거나 결과 파싱이 실패하는 경우 |

:::note
이 메서드는 `cursor.execute()`에 대한 DB-API 2.0 명세를 따릅니다.
실행 후에는 `fetchone()`, `fetchmany()`, 또는 `fetchall()`을 사용하여
결과를 가져옵니다.
:::

:::note
이 메서드는 ClickHouse 데이터 타입을 자동으로 적절한 Python 타입으로
변환합니다:

* Int/UInt 타입 → int
* Float 타입 → float
* String/FixedString → str
* DateTime → datetime.datetime
* Date → datetime.date
* Bool → bool
  :::

**예제**

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

**관련 항목**

* [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 단일 행 가져오기
* [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 여러 행 가져오기
* [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 남은 모든 행 가져오기

***


#### `fetchall` \{#chdb-state-sqlitelike-cursor-fetchall\}

쿼리 결과에서 남아 있는 모든 행을 가져옵니다.

이 메서드는 현재 커서 위치부터 시작하여 현재 쿼리 결과 집합에 남아 있는
모든 행을 가져옵니다. 적절한 Python 타입 변환이 적용된, 각 행을 나타내는
튜플들로 구성된 튜플을 반환합니다.

**Syntax**

```python
fetchall() → tuple
```

**반환값:**

| 반환 타입   | 설명                                                          |
| ------- | ----------------------------------------------------------- |
| `tuple` | 결과 집합에서 남아 있는 모든 행 튜플을 포함한 튜플입니다. 사용 가능한 행이 없으면 빈 튜플을 반환합니다 |

:::warning 경고
이 메서드는 남아 있는 모든 행을 한 번에 메모리에 로드합니다. 결과 집합이 큰 경우,
[`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany)를 사용하여 결과를 배치로 처리하는 것이 좋습니다.
:::

**예제**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users")
>>> all_users = cursor.fetchall()
>>> for user_id, user_name in all_users:
...     print(f"User {user_id}: {user_name}")
```

**함께 보기**

* [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 단일 행 가져오기
* [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 여러 행 한꺼번에 가져오기

***


#### `fetchmany` \{#chdb-state-sqlitelike-cursor-fetchmany\}

쿼리 결과에서 여러 행을 가져옵니다.

이 메서드는 현재 쿼리 결과 집합에서 최대 ‘size’개의 행을 가져옵니다.
반환값은 행 튜플로 구성된 튜플이며, 각 행에는 적절한 Python 타입으로 변환된 컬럼 값들이 포함됩니다.

**Syntax**

```python
fetchmany(size: int = 1) → tuple
```

**매개변수**

| 매개변수   | 타입  | 기본값 | 설명          |
| ------ | --- | --- | ----------- |
| `size` | int | `1` | 가져올 최대 행 개수 |

**반환값**

| 반환 타입   | 설명                                                                        |
| ------- | ------------------------------------------------------------------------- |
| `tuple` | 최대 &#39;size&#39;개의 행 튜플을 포함하는 튜플입니다. 결과 집합이 모두 소진된 경우 더 적은 행을 포함할 수 있습니다 |

:::note
이 메서드는 DB-API 2.0 사양을 따릅니다. 결과 집합이 모두 소진된 경우
반환되는 행의 수는 &#39;size&#39;보다 적을 수 있습니다.
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

**함께 보기**

* [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 단일 행 가져오기
* [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 남은 모든 행 가져오기

***


#### `fetchone` \{#chdb-state-sqlitelike-cursor-fetchone\}

쿼리 결과에서 다음 행을 가져옵니다.

이 메서드는 현재 쿼리 결과 집합에서 사용 가능한 다음 행을 가져와,
컬럼 값이 들어 있는 튜플을 반환합니다. 이때 적절한 Python 타입 변환이 적용됩니다.

**구문**

```python
fetchone() → tuple | None
```

**반환값:**

| 반환 타입             | 설명                                              |
| ----------------- | ----------------------------------------------- |
| `Optional[tuple]` | 다음 행을 컬럼 값의 튜플로 반환하며, 더 이상 행이 없으면 `None`을 반환합니다 |

:::note
이 메서드는 DB-API 2.0 사양을 따릅니다. 컬럼 값은
ClickHouse 컬럼 타입에 따라 적절한 Python 타입으로 자동 변환됩니다.
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

**함께 보기**

* [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 여러 행 가져오기
* [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 남은 모든 행 가져오기

***


### `chdb.state.sqlitelike` \{#state-sqlitelike-to_arrowtable\}

쿼리 결과를 PyArrow Table로 변환합니다.

이 함수는 chdb 쿼리 결과를 PyArrow Table 형식으로 변환하여,
열 지향(columnar) 방식의 효율적인 데이터 접근과
다른 데이터 처리 라이브러리와의 상호 운용성을 제공합니다.

**구문**

```python
chdb.state.sqlitelike.to_arrowTable(res)
```

**매개변수:**

| 매개변수  | 타입 | 설명                                |
| ----- | -- | --------------------------------- |
| `res` | -  | Arrow 형식 데이터를 포함하는 chdb의 쿼리 결과 객체 |

**반환값**

| 반환 타입           | 설명                      |
| --------------- | ----------------------- |
| `pyarrow.Table` | 쿼리 결과를 포함하는 PyArrow 테이블 |

**예외**

| 예외            | 조건                                   |
| ------------- | ------------------------------------ |
| `ImportError` | pyarrow 또는 pandas 패키지가 설치되어 있지 않은 경우 |

:::note
이 함수는 pyarrow와 pandas가 모두 설치되어 있어야 합니다.
다음 명령으로 설치합니다: `pip install pyarrow pandas`
:::

:::warning Warning
결과가 비어 있는 경우 스키마가 없는 빈 PyArrow 테이블을 반환합니다.
:::

**예제**

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

***


### `chdb.state.sqlitelike.to_df` \{#state-sqlitelike-to_df\}

쿼리 결과를 Pandas DataFrame으로 변환합니다.

이 함수는 chdb 쿼리 결과를 먼저 PyArrow Table로 변환한 뒤 DataFrame으로 변환하여,
Pandas API를 활용한 데이터 분석을 편리하게 수행할 수 있도록 합니다.

**구문**

```python
chdb.state.sqlitelike.to_df(r)
```

**매개변수:**

| 매개변수 | 타입 | 설명                                |
| ---- | -- | --------------------------------- |
| `r`  | -  | Arrow 형식 데이터를 포함하는 chdb의 쿼리 결과 객체 |

**반환값:**

| 반환 타입              | 설명                                            |
| ------------------ | --------------------------------------------- |
| `pandas.DataFrame` | 적절한 컬럼 이름과 데이터 타입으로 구성된 쿼리 결과를 포함하는 DataFrame |

**예외**

| 예외            | 조건                                   |
| ------------- | ------------------------------------ |
| `ImportError` | pyarrow 또는 pandas 패키지가 설치되어 있지 않은 경우 |

:::note
이 함수는 대규모 데이터셋에서 성능을 향상하기 위해
Arrow에서 Pandas로 변환할 때 멀티스레딩을 사용합니다.
:::

**함께 보기**

* [`to_arrowTable()`](#chdb-state-sqlitelike-to_arrowtable) - PyArrow Table 형식 변환용

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


## DataFrame 통합 \{#dataframe-integration\}

### **class** `chdb.dataframe.Table` \{#chdb-dataframe-table\}

기반 클래스:

```python
class chdb.dataframe.Table(*args: Any, **kwargs: Any)
```


## Database API (DBAPI) 2.0 Interface \{#database-api-interface\}

chDB는 데이터베이스 연결을 위해 Python DB-API 2.0과 호환되는 인터페이스를 제공하여, 표준 데이터베이스 인터페이스를 사용하는 도구 및 프레임워크에서 chDB를 사용할 수 있도록 합니다.

chDB DB-API 2.0 인터페이스에는 다음이 포함됩니다:

- **Connections**: 연결 문자열을 사용한 데이터베이스 연결 관리
- **Cursors**: 쿼리 실행 및 결과 조회
- **Type System**: DB-API 2.0을 준수하는 타입 상수 및 변환기
- **Error Handling**: 표준 데이터베이스 예외 계층 구조
- **Thread Safety**: 레벨 1 스레드 안전성(스레드는 모듈은 공유할 수 있지만 연결은 공유할 수 없음)

---

### 핵심 함수 \{#core-functions\}

Database API (DBAPI) 2.0 인터페이스는 다음 핵심 함수를 구현합니다:

#### `chdb.dbapi.connect` \{#dbapi-connect\}

새 데이터베이스 연결을 생성합니다.

**구문**

```python
chdb.dbapi.connect(*args, **kwargs)
```

**매개변수**

| 매개변수   | 형식  | 기본값    | 설명                                        |
| ------ | --- | ------ | ----------------------------------------- |
| `path` | str | `None` | 데이터베이스 파일 경로입니다. 인메모리 데이터베이스인 경우 None입니다. |

**예외**

| 예외                                   | 조건                    |
| ------------------------------------ | --------------------- |
| [`err.Error`](#chdb-dbapi-err-error) | 연결을 설정할 수 없을 때 발생합니다. |

***


#### `chdb.dbapi.get_client_info()` \{#dbapi-get-client-info\}

클라이언트 버전 정보를 반환합니다.

MySQLdb와의 호환성을 위해 chDB 클라이언트 버전을 문자열로 반환합니다.

**구문**

```python
chdb.dbapi.get_client_info()
```

**반환값**

| 반환 타입 | 설명                                      |
| ----- | --------------------------------------- |
| `str` | 버전 문자열(형식: &#39;major.minor.patch&#39;) |

***


### 타입 생성자 \{#type-constructors\}

#### `chdb.dbapi.Binary(x)` \{#dbapi-binary\}

x를 이진 형식으로 반환합니다.

이 함수는 DB-API 2.0 명세를 따르며, 바이너리 데이터베이스 필드에서 사용할 수 있도록 입력값을 `bytes` 형식으로 변환합니다.

**구문**

```python
chdb.dbapi.Binary(x)
```

**매개변수**

| 매개변수 | 타입 | 설명                   |
| ---- | -- | -------------------- |
| `x`  | -  | 이진(binary)으로 변환할 입력값 |

**반환값**

| 반환 타입   | 설명              |
| ------- | --------------- |
| `bytes` | 입력값을 바이트로 변환한 값 |

***


### Connection 클래스 \{#connection-class\}

#### **class** `chdb.dbapi.connections.Connection(path=None)` \{#chdb-dbapi-connections-connection\}

Bases: `object`

chDB 데이터베이스에 대한 DB-API 2.0 규격을 준수하는 커넥션입니다.

이 클래스는 chDB 데이터베이스에 연결하고 상호 작용하기 위한 표준 DB-API 인터페이스를 제공합니다. 인메모리 데이터베이스와 파일 기반 데이터베이스를 모두 지원합니다.

이 커넥션은 내부 chDB 엔진을 관리하며, 쿼리 실행, 트랜잭션 관리(ClickHouse에서는 no-op), 커서 생성 등을 위한 메서드를 제공합니다.

```python
class chdb.dbapi.connections.Connection(path=None)
```

**매개변수**

| Parameter | Type | Default | Description                                                                                                                  |
| --------- | ---- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `path`    | str  | `None`  | 데이터베이스 파일 경로입니다. None이면 메모리 내 데이터베이스를 사용합니다. &#39;database.db&#39;와 같은 파일 경로를 지정하거나, &#39;:memory:&#39;용으로 None을 지정할 수 있습니다. |

**변수**

| Variable   | Type | Description                               |
| ---------- | ---- | ----------------------------------------- |
| `encoding` | str  | 쿼리에 사용할 문자 인코딩으로, 기본값은 &#39;utf8&#39;입니다. |
| `open`     | bool | 연결이 열려 있으면 True, 닫혀 있으면 False입니다.         |

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
ClickHouse는 전통적인 의미의 트랜잭션을 지원하지 않으므로 `commit()` 및 `rollback()`
연산은 실질적으로 아무 동작도 수행하지 않지만, DB-API 호환성을 위해 제공됩니다.
:::

***


#### `close` \{#dbapi-connection-close\}

데이터베이스 연결을 닫습니다.

하위 chDB 연결을 닫고, 이 연결을 닫힌 상태로 표시합니다.
이후 이 연결에 대한 작업은 Error를 발생시킵니다.

**구문**

```python
close()
```

**발생 가능한 예외**

| 예외                                   | 조건           |
| ------------------------------------ | ------------ |
| [`err.Error`](#chdb-dbapi-err-error) | 연결이 이미 닫힌 경우 |

***


#### `commit` \{#dbapi-commit\}

현재 트랜잭션을 커밋합니다.

**구문**

```python
commit()
```

:::note
chDB/ClickHouse는 전통적인 트랜잭션을 지원하지 않으므로 별도의 동작을 수행하지 않습니다.
DB-API 2.0 규격 준수를 위해 제공됩니다.
:::

***


#### `cursor` \{#dbapi-cursor\}

쿼리를 실행할 새 커서를 생성합니다.

**구문**

```python
cursor(cursor=None)
```

**매개변수**

| 매개변수     | 타입 | 설명                  |
| -------- | -- | ------------------- |
| `cursor` | -  | 호환성을 위해 제공되지만 무시됩니다 |

**반환값**

| 반환 타입    | 설명               |
| -------- | ---------------- |
| `Cursor` | 이 연결에 대한 새 커서 객체 |

**예외**

| 예외                                   | 조건           |
| ------------------------------------ | ------------ |
| [`err.Error`](#chdb-dbapi-err-error) | 연결이 닫혀 있는 경우 |

**예제**

```pycon
>>> conn = Connection()
>>> cur = conn.cursor()
>>> cur.execute("SELECT 1")
>>> result = cur.fetchone()
```

***


#### `escape` \{#escape\}

SQL 쿼리에 안전하게 포함될 수 있도록 값을 이스케이프합니다.

**구문**

```python
escape(obj, mapping=None)
```

**매개변수**

| 매개변수      | 유형 | 설명                                      |
| --------- | -- | --------------------------------------- |
| `obj`     | -  | 이스케이프할 값 (문자열(string), bytes, number 등) |
| `mapping` | -  | 이스케이프에 사용할 선택적 문자 매핑                    |

**반환값**

| 반환 유형 | 설명                               |
| ----- | -------------------------------- |
| -     | SQL 쿼리에서 사용하기에 적합하도록 이스케이프된 입력 값 |

**예제**

```pycon
>>> conn = Connection()
>>> safe_value = conn.escape("O'Reilly")
>>> query = f"SELECT * FROM users WHERE name = {safe_value}"
```

***


#### `escape_string` \{#escape-string\}

SQL 쿼리용 문자열 값을 이스케이프합니다.

**구문**

```python
escape_string(s)
```

**매개변수**

| 매개변수 | 타입  | 설명         |
| ---- | --- | ---------- |
| `s`  | str | 이스케이프할 문자열 |

**반환값**

| 반환 타입 | 설명                       |
| ----- | ------------------------ |
| `str` | SQL에 포함해도 안전한 이스케이프된 문자열 |

***


#### `property open` \{#property-open\}

연결이 열려 있는지 확인합니다.

**반환 값**

| 반환 형식   | 설명                                           |
|-------------|-----------------------------------------------|
| `bool`      | 연결이 열려 있으면 `True`, 닫혀 있으면 `False` |

---

#### `query` \{#dbapi-query\}

SQL 쿼리를 직접 실행하고 원시 결과를 반환합니다.

이 메서드는 커서 인터페이스를 건너뛰고 쿼리를 직접 실행합니다.
표준 DB-API 사용에서는 cursor() 메서드 사용을 권장합니다.

**구문**

```python
query(sql, fmt='CSV')
```

**매개변수:**

| Parameter | Type         | Default    | Description                                                                                        |
| --------- | ------------ | ---------- | -------------------------------------------------------------------------------------------------- |
| `sql`     | str or bytes | *required* | 실행할 SQL 쿼리                                                                                         |
| `fmt`     | str          | `"CSV"`    | 출력 형식. 지원 형식으로는 &quot;CSV&quot;, &quot;JSON&quot;, &quot;Arrow&quot;, &quot;Parquet&quot; 등이 있습니다. |

**반환값**

| Return Type | Description         |
| ----------- | ------------------- |
| -           | 지정한 형식으로 반환되는 쿼리 결과 |

**예외**

| Exception                                              | Condition             |
| ------------------------------------------------------ | --------------------- |
| [`err.InterfaceError`](#chdb-dbapi-err-interfaceerror) | 연결이 닫혀 있거나 쿼리가 실패한 경우 |

**예제**

```pycon
>>> conn = Connection()
>>> result = conn.query("SELECT 1, 'hello'", "CSV")
>>> print(result)
"1,hello\n"
```

***


#### `property resp` \{#property-resp\}

마지막 쿼리 응답을 가져옵니다.

**반환값**

| 반환 타입    | 설명                                     |
|--------------|------------------------------------------|
| -            | 마지막 query() 호출에서 반환된 원시 응답 |

:::note
이 속성은 query()가 직접 호출될 때마다 업데이트됩니다.
커서를 통해 실행된 쿼리는 반영하지 않습니다.
:::

---

#### `rollback` \{#rollback\}

현재 트랜잭션을 롤백합니다.

**구문**

```python
rollback()
```

:::note
chDB/ClickHouse는 전통적인 트랜잭션을 지원하지 않으므로 이 메서드는 실제로 아무 동작도 하지 않습니다.
DB-API 2.0 규격 준수를 위해 제공됩니다.
:::

***


### Cursor 클래스 \{#cursor-class\}

#### **class** `chdb.dbapi.cursors.Cursor` \{#chdb-dbapi-cursors-cursor\}

Bases: `object`

쿼리를 실행하고 결과를 가져오는 DB-API 2.0용 커서입니다.

이 커서는 SQL 문을 실행하고 쿼리 결과를 관리하며,
결과 집합을 탐색하기 위한 메서드를 제공합니다. 매개변수 바인딩, 대량 작업 등을 지원하며,
DB-API 2.0 사양을 따릅니다.

`Cursor` 인스턴스를 직접 생성하지 마십시오. 대신 `Connection.cursor()`를 사용하십시오.

```python
class chdb.dbapi.cursors.Cursor(connection)
```

| Variable          | Type  | Description                                  |
| ----------------- | ----- | -------------------------------------------- |
| `description`     | tuple | 마지막 쿼리 결과의 컬럼 메타데이터                          |
| `rowcount`        | int   | 마지막 쿼리로 영향을 받은 행 수 (알 수 없으면 -1)              |
| `arraysize`       | int   | 한 번에 가져올 기본 행 개수 (기본값: 1)                    |
| `lastrowid`       | -     | 마지막으로 삽입된 행의 ID (해당되는 경우)                    |
| `max_stmt_length` | int   | executemany()에서 사용할 문장의 최대 크기 (기본값: 1024000) |

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
완전한 명세는 [DB-API 2.0 Cursor Objects](https://www.python.org/dev/peps/pep-0249/#cursor-objects)를 참조하십시오.
:::

***


#### `callproc` \{#callproc\}

저장 프로시저를 실행합니다(형식상 구현).

**구문**

```python
callproc(procname, args=())
```

**매개변수**

| Parameter  | Type     | Description    |
| ---------- | -------- | -------------- |
| `procname` | str      | 실행할 저장 프로시저 이름 |
| `args`     | sequence | 프로시저에 전달할 매개변수 |

**반환값**

| Return Type | Description            |
| ----------- | ---------------------- |
| `sequence`  | 원래의 args 매개변수(수정되지 않음) |

:::note
chDB/ClickHouse는 전통적인 의미의 저장 프로시저를 지원하지 않습니다.
이 메서드는 DB-API 2.0 규격 준수를 위해 제공되지만 실제로는
아무 작업도 수행하지 않습니다. 모든 SQL 작업에는 execute()를 사용하십시오.
:::

:::warning Compatibility
이 구현은 자리 표시자용(placeholder)입니다. OUT/INOUT 매개변수, 여러 결과 집합,
서버 변수와 같은 전통적인 저장 프로시저 기능은 기본 ClickHouse 엔진에서
지원되지 않습니다.
:::

***


#### `close` \{#dbapi-cursor-close\}

커서를 닫고 관련된 리소스를 해제합니다.

커서를 닫은 이후에는 커서를 사용할 수 없으며, 해당 커서에서 수행하는 모든 연산은 예외를 발생시킵니다.
커서를 닫으면 남아 있는 모든 데이터를 소진하고, 내부 커서에 대한 리소스를 해제합니다.

**구문**

```python
close()
```

***


#### `execute` \{#dbapi-execute\}

선택적인 매개변수 바인딩과 함께 SQL 쿼리를 실행합니다.

이 메서드는 선택적인 매개변수 치환과 함께 단일 SQL 문을 실행합니다.
유연성을 위해 여러 가지 매개변수 플레이스홀더 스타일을 지원합니다.

**구문**

```python
execute(query, args=None)
```

**매개변수**

| 매개변수    | 유형              | 기본값    | 설명                |
| ------- | --------------- | ------ | ----------------- |
| `query` | str             | *필수*   | 실행할 SQL 쿼리        |
| `args`  | tuple/list/dict | `None` | 플레이스홀더에 바인딩할 매개변수 |

**반환값**

| 반환 유형 | 설명                        |
| ----- | ------------------------- |
| `int` | 영향을 받은 행 수 (알 수 없는 경우 -1) |

**매개변수 스타일**

| 스타일               | 예시                                            |
| ----------------- | --------------------------------------------- |
| Question mark 스타일 | `"SELECT * FROM users WHERE id = ?"`          |
| Named 스타일         | `"SELECT * FROM users WHERE name = %(name)s"` |
| Format 스타일        | `"SELECT * FROM users WHERE age = %s"` (레거시)  |

**예시**

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

**발생 예외**

| 예외                                                     | 조건                       |
| ------------------------------------------------------ | ------------------------ |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 커서가 닫혀 있거나 쿼리 형식이 잘못된 경우 |
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror)     | 실행 중에 데이터베이스 오류가 발생하는 경우 |

***


#### `executemany(query, args)` \{#chdb-dbapi-cursors-cursor-executemany\}

서로 다른 매개변수 집합으로 동일한 쿼리를 여러 번 실행합니다.

이 메서드는 동일한 SQL 쿼리를 서로 다른 매개변수 값과 함께 여러 번 효율적으로 실행합니다. 대량 INSERT 작업을 수행할 때 특히 유용합니다.

**구문**

```python
executemany(query, args)
```

**매개변수**

| 매개변수    | 타입       | 설명                             |
| ------- | -------- | ------------------------------ |
| `query` | str      | 여러 번 실행할 SQL 쿼리                |
| `args`  | sequence | 각 실행에 사용할 매개변수 튜플/딕셔너리/리스트 시퀀스 |

**반환값**

| 반환 타입 | 설명                     |
| ----- | ---------------------- |
| `int` | 모든 실행에 걸쳐 영향을 받은 총 행 수 |

**예시**

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
이 메서드는 여러 행에 대한 `INSERT` 및 `UPDATE` 작업에서
쿼리 실행 과정을 최적화하여 성능을 향상합니다.
:::

***


#### `fetchall()` \{#dbapi-fetchall\}

쿼리 결과에서 아직 가져오지 않은 모든 행을 가져옵니다.

**구문**

```python
fetchall()
```

**반환값**

| 반환 타입  | 설명                       |
| ------ | ------------------------ |
| `list` | 남아 있는 모든 행을 나타내는 튜플의 리스트 |

**예외**

| 예외                                                     | 조건                       |
| ------------------------------------------------------ | ------------------------ |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 먼저 execute()가 호출되지 않은 경우 |

:::warning Warning
이 메서드는 결과 집합이 큰 경우 많은 메모리를 사용할 수 있습니다.
대규모 데이터셋의 경우 `fetchmany()` 사용을 고려하십시오.
:::

**예시**

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> all_rows = cursor.fetchall()
>>> print(len(all_rows))  # Number of total rows
```

***


#### `fetchmany` \{#dbapi-fetchmany\}

쿼리 결과에서 여러 행을 조회합니다.

**구문**

```python
fetchmany(size=1)
```

**매개변수**

| 매개변수(Parameter) | 타입(Type) | 기본값(Default) | 설명(Description)                                |
| --------------- | -------- | ------------ | ---------------------------------------------- |
| `size`          | int      | `1`          | 가져올 행 수입니다. 지정하지 않으면 cursor.arraysize 값이 사용됩니다 |

**반환값**

| 반환 타입(Return Type) | 설명(Description)       |
| ------------------ | --------------------- |
| `list`             | 가져온 행을 나타내는 튜플 리스트입니다 |

**예외**

| 예외(Exception)                                          | 조건(Condition)            |
| ------------------------------------------------------ | ------------------------ |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | execute()가 먼저 호출되지 않은 경우 |

**예시**

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> rows = cursor.fetchmany(3)
>>> print(rows)  # [(1, 'Alice'), (2, 'Bob'), (3, 'Charlie')]
```

***


#### `fetchone` \{#dbapi-fetchone\}

쿼리 결과에서 다음 행을 가져옵니다.

**구문**

```python
fetchone()
```

**반환값**

| 반환 타입           | 설명                                             |
| --------------- | ---------------------------------------------- |
| `tuple or None` | 다음 행을 tuple로 반환하며, 더 이상 반환할 행이 없으면 None을 반환합니다 |

**예외**

| 예외                                                     | 조건                         |
| ------------------------------------------------------ | -------------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | `execute()`가 먼저 호출되지 않은 경우 |

**예제**

```pycon
>>> cursor.execute("SELECT id, name FROM users LIMIT 3")
>>> row = cursor.fetchone()
>>> print(row)  # (1, 'Alice')
>>> row = cursor.fetchone()
>>> print(row)  # (2, 'Bob')
```

***


#### `max_stmt_length = 1024000` \{#max-stmt-length\}

[`executemany()`](#chdb-dbapi-cursors-cursor-executemany)가 생성하는 statement의 최대 크기입니다.

기본값은 1024000입니다.

---

#### `mogrify` \{#mogrify\}

데이터베이스로 전송될 정확한 쿼리 문자열을 그대로 반환합니다.

이 메서드는 파라미터 치환이 적용된 최종 SQL 쿼리를 보여주므로
디버깅 및 로깅에 유용합니다.

**구문**

```python
mogrify(query, args=None)
```

**매개변수**

| 매개변수    | 타입              | 기본값    | 설명                      |
| ------- | --------------- | ------ | ----------------------- |
| `query` | str             | *필수*   | 파라미터 자리 표시자가 포함된 SQL 쿼리 |
| `args`  | tuple/list/dict | `None` | 치환할 파라미터                |

**반환값**

| 반환 타입 | 설명                      |
| ----- | ----------------------- |
| `str` | 파라미터가 치환된 최종 SQL 쿼리 문자열 |

**예제**

```pycon
>>> cur.mogrify("SELECT * FROM users WHERE id = ?", (123,))
"SELECT * FROM users WHERE id = 123"
```

:::note
이 메서드는 Psycopg에서 사용하는 DB-API 2.0 확장 규약을 따릅니다.
:::

***


#### `nextset` \{#nextset\}

다음 결과 집합으로 이동합니다(지원되지 않음).

**구문**

```python
nextset()
```

**반환값**

| 반환 타입  | 설명                                      |
| ------ | --------------------------------------- |
| `None` | 여러 개의 결과 세트를 지원하지 않으므로 항상 `None`을 반환합니다 |

:::note
chDB/ClickHouse는 단일 쿼리에서 여러 개의 결과 세트를 지원하지 않습니다.
이 메서드는 DB-API 2.0 규격을 준수하기 위해 제공되지만 항상 `None`을 반환합니다.
:::

***


#### `setinputsizes` \{#setinputsizes\}

매개변수의 입력 크기를 설정합니다(동작하지 않는 no-op 구현).

**구문**

```python
setinputsizes(*args)
```

**매개변수**

| 매개변수    | 타입 | 설명                 |
| ------- | -- | ------------------ |
| `*args` | -  | 매개변수 크기 지정 사양(무시됨) |

:::note
이 메서드는 아무 작업도 수행하지 않지만 DB-API 2.0 명세에서 요구되는 메서드입니다.
chDB는 매개변수 크기 지정을 내부적으로 자동으로 처리합니다.
:::

***


#### `setoutputsizes` \{#setoutputsizes\}

출력 컬럼 크기를 설정합니다(동작하지 않는 no-op 구현).

**구문**

```python
setoutputsizes(*args)
```

**매개변수**

| 매개변수    | 타입 | 설명             |
| ------- | -- | -------------- |
| `*args` | -  | 컬럼 크기 지정값(무시됨) |

:::note
이 메서드는 아무 동작도 하지 않지만 DB-API 2.0 사양에 의해 필요합니다.
chDB는 출력 크기 설정을 내부적으로 자동으로 처리합니다.
:::

***


### 오류 클래스 \{#error-classes\}

chdb 데이터베이스 작업을 위한 예외 클래스입니다.

이 모듈은 Python Database API Specification v2.0을 따르는 chdb의
데이터베이스 관련 오류를 처리하기 위한 완전한 예외 클래스 계층 구조를 제공합니다.

예외 클래스 계층 구조는 다음과 같습니다.

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

각 예외 클래스는 특정 데이터베이스 오류 범주를 나타냅니다:

| Exception           | Description                  |
| ------------------- | ---------------------------- |
| `Warning`           | 데이터베이스 작업 중 발생하는 비치명적 경고     |
| `InterfaceError`    | 데이터베이스 인터페이스 자체와 관련된 문제      |
| `DatabaseError`     | 모든 데이터베이스 관련 오류의 기본 클래스      |
| `DataError`         | 데이터 처리 관련 문제(잘못된 값, 타입 오류 등) |
| `OperationalError`  | 데이터베이스 운영상의 문제(연결, 리소스 등)    |
| `IntegrityError`    | 제약 조건 위반(외래 키, 유일성 등)        |
| `InternalError`     | 데이터베이스 내부 오류 및 손상            |
| `ProgrammingError`  | SQL 문법 오류 및 API 오용           |
| `NotSupportedError` | 지원되지 않는 기능 또는 작업             |

:::note
이 예외 클래스는 Python DB API 2.0 명세를 준수하며,
다양한 데이터베이스 작업에서 일관된 방식의 오류 처리를 제공합니다.
:::

**함께 보기**

* [Python Database API Specification v2.0](https://peps.python.org/pep-0249/)
* `chdb.dbapi.connections` - 데이터베이스 연결 관리
* `chdb.dbapi.cursors` - 데이터베이스 커서 작업

**예시**

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

***


#### **exception** `chdb.dbapi.err.DataError` \{#chdb-dbapi-err-dataerror\}

기반 클래스: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

데이터 처리 과정에서 발생한 문제로 인해 생기는 오류에 대해 사용되는 예외입니다.

이 예외는 다음과 같이 처리 중인 데이터의 문제로 인해 데이터베이스 작업이 실패할 때 발생합니다.

* 0으로 나누는 연산
* 범위를 벗어난 숫자 값
* 유효하지 않은 날짜/시간 값
* 문자열 잘림 오류
* 형식 변환 실패
* 컬럼 타입에 맞지 않는 데이터 포맷

**발생 조건**

| 예외                                       | 조건                       |
| ---------------------------------------- | ------------------------ |
| [`DataError`](#chdb-dbapi-err-dataerror) | 데이터 검증 또는 처리에 실패했을 때 발생함 |

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

***


#### **exception** `chdb.dbapi.err.DatabaseError` \{#chdb-dbapi-err-databaseerror\}

기반 클래스: [`Error`](#chdb-dbapi-err-error)

데이터베이스와 관련된 오류가 발생했을 때 사용되는 예외 클래스입니다.

이 클래스는 모든 데이터베이스 관련 오류의 기본 클래스입니다. 데이터베이스 작업 중에 발생하는 오류 중 인터페이스가 아니라 데이터베이스 자체와 관련된 모든 오류를 포함합니다.

일반적인 예시는 다음과 같습니다.

- SQL 실행 오류
- 데이터베이스 연결 문제
- 트랜잭션 관련 문제
- 데이터베이스 고유의 제약 조건 위반

:::note
이는 [`DataError`](#chdb-dbapi-err-dataerror), [`OperationalError`](#chdb-dbapi-err-operationalerror) 등과 같은 보다 구체적인 데이터베이스 오류 유형의 부모 클래스 역할을 합니다.
:::

---

#### **exception** `chdb.dbapi.err.Error` \{#chdb-dbapi-err-error\}

Bases: [`StandardError`](#chdb-dbapi-err-standarderror)

다른 모든 오류 예외(Warning 제외)의 기본 클래스인 예외입니다.

이 예외는 chdb에서 Warning을 제외한 모든 오류 예외의 기본 클래스입니다.
작업이 성공적으로 완료되는 것을 막는 모든 데이터베이스 오류 상태의
상위 클래스로 사용됩니다.

:::note
이 예외 계층 구조는 Python DB API 2.0 명세를 따릅니다.
:::

**함께 보기**

- [`Warning`](#chdb-dbapi-err-warning) - 작업 완료를 막지 않는 비치명적인 경고에 사용됩니다

#### **exception** `chdb.dbapi.err.IntegrityError` \{#chdb-dbapi-err-integrityerror\}

기반 클래스: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

데이터베이스의 관계 무결성이 손상될 때 발생하는 예외입니다.

이 예외는 데이터베이스 작업이 무결성 제약 조건을 위반할 때 발생하며,
다음이 포함됩니다:

* 외래 키 제약 조건 위반
* 기본 키 또는 고유 제약 조건 위반(중복 키)
* CHECK 제약 조건 위반
* NOT NULL 제약 조건 위반
* 참조 무결성 위반

**발생 예외**

| 예외                                                 | 조건                      |
| -------------------------------------------------- | ----------------------- |
| [`IntegrityError`](#chdb-dbapi-err-integrityerror) | 데이터베이스 무결성 제약 조건이 위반될 때 |

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

***


#### **exception** `chdb.dbapi.err.InterfaceError` \{#chdb-dbapi-err-interfaceerror\}

Bases: [`Error`](#chdb-dbapi-err-error)

데이터베이스 자체가 아니라 데이터베이스 인터페이스와 관련된 오류가 발생했을 때 사용되는 예외입니다.

이 예외는 다음과 같은 데이터베이스 인터페이스 구현 문제 발생 시 발생합니다:

- 잘못된 연결 매개변수
- API 오용 (예: 닫힌 연결에서 메서드를 호출하는 경우)
- 인터페이스 수준 프로토콜 오류
- 모듈 import 또는 초기화 실패

**발생 예외**

| 예외                                               | 조건                                                                           |
|----------------------------------------------------|--------------------------------------------------------------------------------|
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror) | 데이터베이스 인터페이스에서 데이터베이스 연산과 무관한 오류가 발생했을 때 발생합니다 |

:::note
이러한 오류는 일반적으로 프로그래밍 오류이거나 구성 문제이며,
클라이언트 코드 또는 구성을 수정하여 해결할 수 있습니다.
:::

---

#### **exception** `chdb.dbapi.err.InternalError` \{#chdb-dbapi-err-internalerror\}

기반 클래스: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

데이터베이스에서 내부 오류가 발생했을 때 발생하는 예외입니다.

이 예외는 데이터베이스 시스템에서 애플리케이션이 아닌 원인으로 인한
내부 오류가 발생할 때 발생하며, 예시는 다음과 같습니다.

- 잘못된 커서 상태(커서가 더 이상 유효하지 않음)
- 트랜잭션 상태 불일치(트랜잭션이 동기화되지 않음)
- 데이터베이스 손상 문제
- 내부 데이터 구조 손상
- 시스템 수준 데이터베이스 오류

**발생 조건**

| 예외 | 조건 |
|-----------|-----------|
| [`InternalError`](#chdb-dbapi-err-internalerror) | 데이터베이스에서 내부 불일치가 발생했을 때 |

:::warning Warning
내부 오류는 데이터베이스 관리자(DBA)의 조치가 필요한 심각한 데이터베이스
문제를 의미할 수 있습니다. 이러한 오류는 일반적으로 애플리케이션 수준의
재시도 로직으로는 복구할 수 없습니다.
:::

:::note
이러한 오류는 일반적으로 애플리케이션에서 제어할 수 있는 범위를 벗어나며,
데이터베이스 재시작 또는 복구 작업이 필요할 수 있습니다.
:::

---

#### **exception** `chdb.dbapi.err.NotSupportedError` \{#chdb-dbapi-err-notsupportederror\}

기반 클래스: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

메서드나 데이터베이스 API가 지원되지 않을 때 발생하는 예외입니다.

애플리케이션이 현재 데이터베이스 구성 또는 버전에서 지원하지 않는
데이터베이스 기능이나 API 메서드를 사용하려고 시도할 때 이 예외가
발생합니다. 예시는 다음과 같습니다.

* 트랜잭션을 지원하지 않는 커넥션에서 `rollback()`을 요청하는 경우
* 데이터베이스 버전에서 지원하지 않는 고급 SQL 기능을 사용하는 경우
* 현재 드라이버에서 구현되지 않은 메서드를 호출하는 경우
* 비활성화된 데이터베이스 기능을 사용하려고 시도하는 경우

**발생 예외**

| 예외                                                       | 조건                           |
| -------------------------------------------------------- | ---------------------------- |
| [`NotSupportedError`](#chdb-dbapi-err-notsupportederror) | 지원되지 않는 데이터베이스 기능에 접근하려고 할 때 |

**예시**

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
이러한 오류를 피하기 위해 데이터베이스 문서와 드라이버 기능을 확인하십시오. 가능한 경우 원활한 대체 처리(fallback)를 구현하는 것이 좋습니다.
:::

***


#### **exception** `chdb.dbapi.err.OperationalError` \{#chdb-dbapi-err-operationalerror\}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

데이터베이스의 운영과 관련된 오류에 대해 발생하는 예외입니다.

이 예외는 데이터베이스를 운영하는 과정에서 발생하며, 프로그래머의 직접적인 통제 범위에 있지 않을 수도 있는 오류에 대해 발생합니다. 예시는 다음과 같습니다:

- 데이터베이스와의 예기치 않은 연결 끊김
- 데이터베이스 서버를 찾을 수 없거나 접근할 수 없음
- 트랜잭션 처리 실패
- 처리 중 메모리 할당 오류
- 디스크 공간 또는 리소스 고갈
- 데이터베이스 서버 내부 오류
- 인증 또는 권한 부여 실패

**Raises**

| Exception                                              | Condition                                                         |
|--------------------------------------------------------|-------------------------------------------------------------------|
| [`OperationalError`](#chdb-dbapi-err-operationalerror) | 운영상의 문제로 인해 데이터베이스 작업이 실패할 때 발생합니다 |

:::note
이러한 오류는 일반적으로 일시적이며, 작업을 다시 시도하거나 시스템 수준 문제를 해결하면 복구될 수 있습니다.
:::

:::warning Warning
일부 운영 관련 오류는 관리자 개입이 필요한 심각한 시스템 문제를 나타낼 수 있습니다.
:::

---

#### **exception** `chdb.dbapi.err.ProgrammingError` \{#chdb-dbapi-err-programmingerror\}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

데이터베이스 작업 중 프로그래밍 오류가 발생했을 때 발생하는 예외입니다.

이 예외는 애플리케이션에서 데이터베이스를 사용하는 과정에 프로그래밍 오류가 있을 때 발생하며, 예를 들면 다음과 같습니다:

* 테이블 또는 컬럼을 찾을 수 없음
* 테이블 또는 인덱스 생성 시 이미 존재함
* SQL 문에서 SQL 문법 오류가 발생함
* 준비된 SQL 문에서 지정된 매개변수 개수가 잘못됨
* 유효하지 않은 SQL 작업 수행 (예: 존재하지 않는 객체에 대한 DROP)
* 데이터베이스 API 메서드를 잘못 사용함

**Raises**

| Exception                                              | Condition                   |
| ------------------------------------------------------ | --------------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | SQL 문 또는 API 사용에 오류가 포함된 경우 |

**Examples**

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

***


#### **exception** `chdb.dbapi.err.StandardError` \{#chdb-dbapi-err-standarderror\}

Bases: `Exception`

chdb와 관련된 작업 중 발생하는 예외입니다.

이 클래스는 모든 chdb 관련 예외의 기반 클래스입니다. Python 내장 Exception 클래스를 상속하며,
데이터베이스 작업에 대한 예외 계층 구조의 루트 역할을 합니다.

:::note
이 예외 클래스는 데이터베이스 예외 처리를 위한 Python DB API 2.0 사양을 따릅니다.
:::

---

#### **exception** `chdb.dbapi.err.Warning` \{#chdb-dbapi-err-warning\}

기반 클래스: [`StandardError`](#chdb-dbapi-err-standarderror)

INSERT 중 데이터 잘림과 같은 중요한 경고에 대해 발생하는 예외입니다.

이 예외는 데이터베이스 작업 자체는 완료되었지만,
애플리케이션에 반드시 알려야 할 중요한 경고가 함께 발생했을 때 발생합니다.
일반적인 사례는 다음과 같습니다:

- INSERT 중 데이터 잘림
- 숫자 변환 시 정밀도 손실
- 문자 집합 변환 관련 경고

:::note
이 예외는 경고 예외에 대한 Python DB API 2.0 명세를 따릅니다.
:::

---

### 모듈 상수 \{#module-constants\}

#### `chdb.dbapi.apilevel = '2.0'` \{#apilevel\}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

주어진 객체로부터 새로운 문자열 객체를 생성합니다. `encoding` 또는
`errors`가 지정된 경우, 해당 객체는 지정된 인코딩과 오류 처리기를 사용해
디코딩할 수 있는 데이터 버퍼를 제공해야 합니다.
그렇지 않으면 `object._\_str_\_()`(정의된 경우)의 결과
또는 `repr(object)`를 반환합니다.

* encoding의 기본값은 ‘utf-8’입니다.
* errors의 기본값은 ‘strict’입니다.

***


#### `chdb.dbapi.threadsafety = 1` \{#threadsafety\}

```python
int([x]) -> integer
int(x, base=10) -> integer
```

숫자나 문자열을 정수로 변환하거나, 인수가 주어지지 않으면 0을 반환합니다. x가 숫자이면 x.**int**()을 반환합니다. 부동소수점 숫자인 경우 0을 향해 절단되어(소수 부분이 버려져) 변환됩니다.

x가 숫자가 아니거나 base가 주어진 경우, x는 지정된 진법의 정수 리터럴을 나타내는 문자열, bytes, bytearray 인스턴스여야 합니다. 리터럴 앞에는 「+」 또는 「-」가 올 수 있으며, 공백으로 둘러싸여 있어도 됩니다. 기본 진법은 10입니다. 허용되는 진법은 0 및 2-36입니다. base가 0이면 문자열에 포함된 정수 리터럴 표기법을 기준으로 진법을 해석함을 의미합니다.

```python
>>> int(‘0b100’, base=0)
4
```

***


#### `chdb.dbapi.paramstyle = 'format'` \{#paramstyle\}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

주어진 객체에서 새로운 문자열 객체를 생성합니다. `encoding` 또는
`errors`가 지정된 경우, 해당 객체는 지정된 인코딩과 에러 처리기를 사용해
디코딩할 수 있는 데이터 버퍼를 노출해야 합니다.
그렇지 않으면, object.*&#95;str*&#95;() (정의된 경우)의 결과나
repr(object)를 반환합니다.
`encoding`의 기본값은 「utf-8」입니다.
`errors`의 기본값은 「strict」입니다.

***


### 형 상수 \{#type-constants\}

#### `chdb.dbapi.STRING = frozenset({247, 253, 254})` \{#string-type\}

DB-API 2.0 타입 비교를 위한 확장된 frozenset입니다.

이 클래스는 frozenset을 확장하여 DB-API 2.0 타입 비교 규칙을 지원합니다.
개별 항목을 집합과 동등/비동등 연산자를 사용해 비교할 수 있도록
유연한 타입 체크를 제공합니다.

이는 STRING, BINARY, NUMBER 등의 타입 상수에 사용되어
`field_type`이 단일 타입 값일 때 `field_type == STRING`과 같은
비교를 가능하게 합니다.

**예시**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.BINARY = frozenset({249, 250, 251, 252})` \{#binary-type\}

DB-API 2.0 타입 비교를 위한 확장된 frozenset입니다.

이 클래스는 DB-API 2.0 타입 비교 의미를 지원하도록 frozenset을 확장합니다.
단일 항목을 집합과 동등 및 부등 연산자로 비교할 수 있도록 하여
유연한 타입 검사를 가능하게 합니다.

이 클래스는 STRING, BINARY, NUMBER 등의 타입 상수에 사용되며,
field&#95;type이 단일 타입 값일 때 「field&#95;type == STRING」과 같은
비교를 수행할 수 있도록 합니다.

**예시**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.NUMBER = frozenset({0, 1, 3, 4, 5, 8, 9, 13})` \{#number-type\}

DB-API 2.0 타입 비교를 위한 확장된 frozenset입니다.

이 클래스는 DB-API 2.0 타입 비교 의미론을 지원하도록 frozenset을 확장한 것입니다.
개별 항목을 집합에 포함된 값과 동등/비동등 연산자를 사용하여 비교할 수 있도록
유연한 타입 검사 기능을 제공합니다.

이 클래스는 STRING, BINARY, NUMBER 등과 같은 타입 상수에 사용되며,
field&#95;type이 단일 타입 값일 때 「field&#95;type == STRING」과 같은
비교를 가능하게 합니다.

**예시**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.DATE = frozenset({10, 14})` \{#date-type\}

DB-API 2.0 타입 비교를 위한 확장된 frozenset입니다.

이 클래스는 frozenset을 확장하여 DB-API 2.0 타입 비교 의미 체계를 지원합니다.
개별 항목을 동등 및 부등 연산자를 모두 사용해 집합과 비교할 수 있도록
유연한 타입 검사를 제공합니다.

이는 STRING, BINARY, NUMBER 등과 같은 타입 상수에 사용되며,
`field_type`이 단일 타입 값일 때 `field_type == STRING`과 같은
비교를 가능하게 합니다.

**예시**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.TIME = frozenset({11})` \{#time-type\}

DB-API 2.0 타입 비교를 위해 확장된 frozenset입니다.

이 클래스는 DB-API 2.0 타입 비교 의미론을 지원하도록 frozenset을 확장한 것입니다.
각 항목을 집합과 등호 및 부등호 연산자를 사용해 비교할 수 있도록
유연한 타입 검사를 제공합니다.

이 클래스는 STRING, BINARY, NUMBER 등의 타입 상수에 사용되며,
field&#95;type이 단일 타입 값일 때 「field&#95;type == STRING」과 같은
비교를 가능하게 합니다.

**예시**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.TIMESTAMP = frozenset({7, 12})` \{#timestamp-type\}

DB-API 2.0 타입 비교를 위한 확장된 frozenset입니다.

이 클래스는 DB-API 2.0 타입 비교 규칙을 지원하도록 frozenset을 확장한 것입니다.
개별 항목을 집합에 대해 동등/비동등 연산자를 사용해 비교할 수 있도록
유연한 타입 검사를 지원합니다.

이는 STRING, BINARY, NUMBER 등과 같은 타입 상수에 사용되어,
field&#95;type이 단일 타입 값일 때 「field&#95;type == STRING」과 같은
비교를 가능하게 합니다.

**예시**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```


#### `chdb.dbapi.DATETIME = frozenset({7, 12})` \{#datetime-type\}

DB-API 2.0 타입 비교를 위한 확장된 frozenset입니다.

이 클래스는 frozenset을 상속하여 DB-API 2.0 타입 비교 의미를 지원합니다.
개별 항목을 집합과 비교할 때 동등/비동등 연산자를 모두 사용할 수 있어
유연한 타입 검사가 가능하도록 합니다.

이는 STRING, BINARY, NUMBER 등의 타입 상수에 사용되며,
`field_type`이 단일 타입 값일 때 `field_type == STRING`과 같은
비교를 가능하게 합니다.

**예시**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.ROWID = frozenset({})` \{#rowid-type\}

DB-API 2.0 타입 비교를 위한 확장된 frozenset입니다.

이 클래스는 DB-API 2.0 타입 비교 의미 체계를 지원하도록 frozenset을 확장한 것입니다.
개별 항목을 등호 및 부등호 연산자를 사용하여 Set과 비교할 수 있도록
유연한 타입 검사를 지원합니다.

이는 STRING, BINARY, NUMBER 등과 같은 타입 상수에 사용되어,
field&#95;type이 단일 타입 값일 때 「field&#95;type == STRING」과 같은
비교를 수행할 수 있도록 합니다.

**예시**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

**사용 예**

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

데이터 처리:

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

1. **연결 관리**: 사용이 끝나면 항상 연결과 커서를 닫습니다
2. **컨텍스트 관리자**: 자동 정리를 위해 `with` 구문을 사용합니다
3. **배치 처리**: 큰 결과 집합에는 `fetchmany()`를 사용합니다
4. **오류 처리**: 데이터베이스 작업을 try-except 블록으로 감쌉니다
5. **파라미터 바인딩**: 가능한 경우 파라미터화된 쿼리를 사용합니다
6. **메모리 관리**: 매우 큰 데이터 세트에는 `fetchall()` 사용을 피합니다

:::note

* chDB의 DB-API 2.0 인터페이스는 대부분의 Python 데이터베이스 도구와 호환됩니다
* 인터페이스는 Level 1 스레드 안전성을 제공합니다(스레드는 모듈은 공유할 수 있지만 연결은 공유할 수 없음)
* 연결 문자열은 chDB 세션과 동일한 파라미터를 지원합니다
* 모든 표준 DB-API 2.0 예외를 지원합니다
  :::

:::warning 경고

* 리소스 누수를 피하기 위해 항상 커서와 연결을 닫습니다
* 큰 결과 집합은 배치로 처리해야 합니다
* 파라미터 바인딩 구문은 포맷 스타일 `%s`를 따릅니다
  :::


## 사용자 정의 함수(UDF) \{#user-defined-functions\}

chDB용 사용자 정의 함수 모듈입니다.

이 모듈은 chDB에서 사용자 정의 함수(UDF)를 생성하고 관리하기 위한 기능을 제공합니다.
직접 작성한 Python 함수를 통해 chDB 기능을 확장하고,
해당 함수를 SQL 쿼리에서 호출하여 사용할 수 있도록 합니다.

### `chdb.udf.chdb_udf` \{#chdb-udf\}

chDB Python UDF(User Defined Function)용 데코레이터입니다.

**구문**

```python
chdb.udf.chdb_udf(return_type='String')
```

**매개변수**

| Parameter     | Type | Default    | Description                                |
| ------------- | ---- | ---------- | ------------------------------------------ |
| `return_type` | str  | `"String"` | 함수의 반환 타입입니다. ClickHouse 데이터 타입 중 하나여야 합니다 |

**참고 사항**

1. 함수는 상태를 가지지 않아야 합니다(stateless). UDF만 지원되며, UDAF는 지원되지 않습니다.
2. 기본 반환 타입은 String입니다. 반환 타입은 ClickHouse 데이터 타입 중 하나여야 합니다.
3. 함수는 String 타입의 인수를 받아야 합니다. 모든 인수는 문자열입니다.
4. 함수는 입력의 각 줄마다 호출됩니다.
5. 함수는 순수한(pure) Python 함수여야 합니다. 함수 내에서 사용하는 모든 모듈을 임포트해야 합니다.
6. 사용되는 Python 인터프리터는 스크립트를 실행하는 인터프리터와 동일합니다.

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

***


### `chdb.udf.generate_udf` \{#generate-udf\}

UDF 구성 및 실행 스크립트 파일을 생성합니다.

이 함수는 chDB에서 사용자 정의 함수(UDF)에 필요한 파일을 생성합니다:

1. 입력 데이터를 처리하는 Python 실행 스크립트 파일
2. UDF를 ClickHouse에 등록하는 XML 구성 파일

**구문**

```python
chdb.udf.generate_udf(func_name, args, return_type, udf_body)
```

**매개변수**

| Parameter     | Type | Description             |
| ------------- | ---- | ----------------------- |
| `func_name`   | str  | UDF 함수 이름               |
| `args`        | list | 함수의 인자 이름 목록            |
| `return_type` | str  | 함수의 ClickHouse 반환 타입    |
| `udf_body`    | str  | UDF 함수의 Python 소스 코드 본문 |

:::note
이 함수는 보통 @chdb&#95;udf 데코레이터로 호출되며,
사용자가 직접 호출해서는 안 됩니다.
:::

***


## 유틸리티 \{#utilities\}

chDB용 유틸리티 함수와 헬퍼를 제공합니다.

이 모듈에는 chDB를 사용할 때 유용한 다양한 유틸리티 함수가 포함되어 있으며,
데이터 타입 추론, 데이터 변환을 돕는 헬퍼, 디버깅 유틸리티 등을 제공합니다.

---

### `chdb.utils.convert_to_columnar` \{#convert-to-columnar\}

딕셔너리 목록을 컬럼형 포맷으로 변환합니다.

이 FUNCTION은 딕셔너리 목록을 입력으로 받아, 각 키가 컬럼에 대응되고
각 값이 해당 컬럼 값들의 목록이 되는 딕셔너리로 변환합니다.
딕셔너리에서 누락된 값은 None으로 표현됩니다.

**구문**

```python
chdb.utils.convert_to_columnar(items: List[Dict[str, Any]]) → Dict[str, List[Any]]
```

**매개변수**

| 매개변수    | 타입                     | 설명            |
| ------- | ---------------------- | ------------- |
| `items` | `List[Dict[str, Any]]` | 변환할 딕셔너리의 리스트 |

**반환값**

| 반환 타입                  | 설명                           |
| ---------------------- | ---------------------------- |
| `Dict[str, List[Any]]` | 키는 컬럼 이름이고 값은 컬럼 값 리스트인 딕셔너리 |

**예시**

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

***


### `chdb.utils.flatten_dict` \{#flatten-dict\}

중첩된 딕셔너리를 평탄화합니다.

이 함수는 중첩된 딕셔너리를 받아, 중첩된 키를 구분자로 연결하여 평탄화합니다.
딕셔너리의 리스트는 JSON 문자열로 직렬화됩니다.

**Syntax**

```python
chdb.utils.flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '_') → Dict[str, Any]
```

**매개변수**

| 매개변수         | 타입               | 기본값   | 설명                |
| ------------ | ---------------- | ----- | ----------------- |
| `d`          | `Dict[str, Any]` | *필수*  | 평탄화할 딕셔너리         |
| `parent_key` | str              | `""`  | 각 키 앞에 붙일 기준 키    |
| `sep`        | str              | `"_"` | 결합된 키 사이에 사용할 구분자 |

**반환값**

| 반환 타입            | 설명        |
| ---------------- | --------- |
| `Dict[str, Any]` | 평탄화된 딕셔너리 |

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

***


### `chdb.utils.infer_data_type` \{#infer-data-type\}

값 목록에 대해 가장 적합한 데이터 타입을 추론합니다.

이 함수는 값 목록을 검사하여 목록의 모든 값을 표현할 수 있는 가장 적절한
데이터 타입을 결정합니다. 정수, 부호 없는 정수, 10진수, 부동소수점 타입을 고려하며,
값을 어떤 숫자 타입으로도 표현할 수 없거나 모든 값이 None인 경우 기본적으로 「string」을 사용합니다.

**구문**

```python
chdb.utils.infer_data_type(values: List[Any]) → str
```

**매개변수**

| 매개변수     | 타입          | 설명                                 |
| -------- | ----------- | ---------------------------------- |
| `values` | `List[Any]` | 분석할 값들의 리스트입니다. 값은 임의의 타입일 수 있습니다. |

**반환값**

| 반환 타입 | 설명                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `str` | 추론된 데이터 타입을 나타내는 문자열입니다. 가능한 반환 값은 &quot;int8&quot;, &quot;int16&quot;, &quot;int32&quot;, &quot;int64&quot;, &quot;int128&quot;, &quot;int256&quot;, &quot;uint8&quot;, &quot;uint16&quot;, &quot;uint32&quot;, &quot;uint64&quot;, &quot;uint128&quot;, &quot;uint256&quot;, &quot;decimal128&quot;, &quot;decimal256&quot;, &quot;float32&quot;, &quot;float64&quot;, 또는 &quot;string&quot;입니다. |

:::note

* 리스트의 모든 값이 None이면 함수는 &quot;string&quot;을 반환합니다.
* 리스트에 하나라도 문자열 값이 있으면 함수는 즉시 &quot;string&quot;을 반환합니다.
* 이 함수는 숫자 값이 범위와 정밀도에 따라 정수, 십진수, 또는 부동소수점으로 표현될 수 있다고 가정합니다.
  :::

***


### `chdb.utils.infer_data_types` \{#infer-data-types\}

열 지향 데이터 구조에서 각 컬럼의 데이터 타입을 추론합니다.

이 함수는 각 컬럼의 값을 분석하여, 샘플 데이터를 기반으로
각 컬럼에 가장 적합한 데이터 타입을 추론합니다.

**구문**

```python
chdb.utils.infer_data_types`(column_data: Dict[str, List[Any]], n_rows: int = 10000) → List[tuple]
```

**매개변수**

| 매개변수          | 타입                     | 기본값        | 설명                              |
| ------------- | ---------------------- | ---------- | ------------------------------- |
| `column_data` | `Dict[str, List[Any]]` | *required* | 키는 컬럼 이름이고 값은 컬럼 값 리스트인 딕셔너리입니다 |
| `n_rows`      | int                    | `10000`    | 타입 추론을 위해 샘플링할 행 개수             |

**반환값**

| 반환 타입         | 설명                                    |
| ------------- | ------------------------------------- |
| `List[tuple]` | 각 항목이 컬럼 이름과 추론된 데이터 타입을 포함하는 튜플인 리스트 |


## 추상 베이스 클래스 \{#abstract-base-classes\}

### **class** `chdb.rwabc.PyReader`(data: Any)` \{#pyreader\}

상속: `ABC`

```python
class chdb.rwabc.PyReader(data: Any)
```

***


#### **abstractmethod** `read` \{#read\}

지정된 컬럼들에서 주어진 개수만큼 행을 읽고, 각 컬럼에 대한 값 시퀀스를 담은 객체 목록을 반환합니다.
각 객체는 하나의 컬럼에 대한 값 시퀀스입니다.

```python
abstractmethod (col_names: List[str], count: int) → List[Any]
```

**매개변수**

| 매개변수        | 타입          | 설명           |
| ----------- | ----------- | ------------ |
| `col_names` | `List[str]` | 읽을 컬럼 이름의 목록 |
| `count`     | int         | 읽을 행의 최대 개수  |

**반환값**

| 반환 타입       | 설명                       |
| ----------- | ------------------------ |
| `List[Any]` | 각 컬럼에 대해 하나씩 존재하는 시퀀스 목록 |


### **class** `chdb.rwabc.PyWriter` \{#pywriter\}

기반 클래스: `ABC`

```python
class chdb.rwabc.PyWriter(col_names: List[str], types: List[type], data: Any)
```

***


#### **abstractmethod** finalize \{#finalize\}

블록에서 최종 데이터를 조합해 반환합니다. 서브클래스에서 반드시 구현해야 합니다.

```python
abstractmethod finalize() → bytes
```

**반환값**

| 반환 타입   | 설명          |
| ------- | ----------- |
| `bytes` | 최종 직렬화된 데이터 |

***


#### **abstractmethod** `write` \{#write\}

컬럼 데이터를 블록에 저장합니다. 하위 클래스에서 반드시 구현해야 합니다.

```python
abstractmethod write(col_names: List[str], columns: List[List[Any]]) → None
```

**매개변수**

| 매개변수        | 타입                | 설명                                |
| ----------- | ----------------- | --------------------------------- |
| `col_names` | `List[str]`       | 쓰여지는 컬럼 이름 목록                     |
| `columns`   | `List[List[Any]]` | 컬럼 데이터 목록으로, 각 컬럼은 하나의 리스트로 표현됩니다 |


## 예외 처리 \{#exception-handling\}

### **class** `chdb.ChdbError` \{#chdberror\}

기반 클래스: `Exception`

chDB 관련 오류에 대한 기본 예외 클래스입니다.

이 예외는 chDB 쿼리 실행이 실패하거나 오류가 발생했을 때 발생합니다.
표준 Python `Exception` 클래스를 상속하며, 내부 ClickHouse 엔진에서 제공하는
오류 정보를 노출합니다.

예외 메시지에는 일반적으로 ClickHouse에서 발생한 상세한 오류 정보가 포함되며,
문법 오류, 타입 불일치, 누락된 테이블/컬럼, 그 외 쿼리 실행과 관련된
다양한 문제에 대한 정보를 담고 있습니다.

**변수**

| 변수     | 타입 | 설명                     |
| ------ | -- | ---------------------- |
| `args` | -  | 오류 메시지와 추가 인자를 포함하는 튜플 |

**예제**

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
이 예외는 하위 ClickHouse 엔진에서 오류를 보고할 때 chdb.query() 및 관련
함수에 의해 자동으로 발생합니다.
애플리케이션에서 적절한 오류 처리를 위해, 실패할 가능성이 있는
쿼리를 다룰 때 이 예외를 잡아서 처리해야 합니다.
:::


## 버전 정보 \{#version-information\}

### `chdb.chdb_version = ('3', '6', '0')` \{#chdb-version\}

내장 불변 시퀀스입니다.

인수를 전달하지 않으면 생성자는 비어 있는 튜플을 반환합니다.
`iterable`이 지정되면 튜플은 해당 `iterable`의 항목으로 초기화됩니다.

인수가 튜플인 경우 반환 값은 동일한 객체를 그대로 반환합니다.

---

### `chdb.engine_version = '25.5.2.1'` \{#engine-version\}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

주어진 객체로부터 새 문자열 객체를 생성합니다. `encoding` 또는
`errors`가 지정된 경우, 객체는 지정된 인코딩과 에러 처리기를 사용해
디코딩할 수 있는 데이터 버퍼를 노출해야 합니다.
그렇지 않으면 object.*&#95;str*&#95;() (정의된 경우)의 결과
또는 repr(object)를 반환합니다.

* `encoding`의 기본값은 ‘utf-8’입니다.
* `errors`의 기본값은 ‘strict’입니다.

***


### `chdb.__version__ = '3.6.0'` \{#version\}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

주어진 객체로부터 새로운 문자열 객체를 생성합니다. `encoding` 또는
`errors`가 지정된 경우, 해당 객체는 주어진 인코딩과 오류 처리기를 사용해
디코딩할 데이터 버퍼를 노출해야 합니다.
그렇지 않으면 object.*&#95;str*&#95;() (정의된 경우) 또는 repr(object)의
결과를 반환합니다.

* encoding의 기본값은 ‘utf-8’입니다.
* errors의 기본값은 ‘strict’입니다.
