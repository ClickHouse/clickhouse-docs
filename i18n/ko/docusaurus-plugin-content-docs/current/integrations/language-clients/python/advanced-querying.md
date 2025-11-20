---
'sidebar_label': '고급 쿼리'
'sidebar_position': 4
'keywords':
- 'clickhouse'
- 'python'
- 'query'
- 'advanced'
'description': 'ClickHouse Connect를 사용한 고급 쿼리'
'slug': '/integrations/language-clients/python/advanced-querying'
'title': '고급 쿼리'
'doc_type': 'reference'
---


# ClickHouse Connect로 데이터 쿼리하기: 고급 사용법 {#querying-data-with-clickhouse-connect--advanced-usage}

## QueryContexts {#querycontexts}

ClickHouse Connect는 `QueryContext` 내에서 표준 쿼리를 실행합니다. `QueryContext`에는 ClickHouse 데이터베이스에 대한 쿼리를 작성하는 데 사용되는 주요 구조와 결과를 `QueryResult` 또는 기타 응답 데이터 구조로 처리하는 데 사용되는 구성 정보가 포함되어 있습니다. 여기에는 쿼리 자체, 매개변수, 설정, 읽기 형식 및 기타 속성이 포함됩니다.

`QueryContext`는 클라이언트의 `create_query_context` 메서드를 사용하여 획득할 수 있습니다. 이 메서드는 핵심 쿼리 메서드와 동일한 매개변수를 사용합니다. 그런 다음 이 쿼리 컨텍스트는 `query`, `query_df` 또는 `query_np` 메서드에 `context` 키워드 인수로 전달될 수 있으며, 이는 해당 메서드의 다른 인수 대신 사용할 수 있습니다. 메서드 호출에 대해 지정된 추가 인수는 QueryContext의 모든 속성을 재정의합니다.

`QueryContext`의 가장 명확한 사용 사례는 서로 다른 바인딩 매개변수 값을 사용하여 동일한 쿼리를 전송하는 것입니다. 모든 매개변수 값은 사전과 함께 `QueryContext.set_parameters` 메서드를 호출하여 업데이트할 수 있으며, 단일 값은 원하는 `key`, `value` 쌍과 함께 `QueryContext.set_parameter`를 호출하여 업데이트할 수 있습니다.

```python
client.create_query_context(query='SELECT value1, value2 FROM data_table WHERE key = {k:Int32}',
                            parameters={'k': 2},
                            column_oriented=True)
result = client.query(context=qc)
assert result.result_set[1][0] == 'second_value2'
qc.set_parameter('k', 1)
result = test_client.query(context=qc)
assert result.result_set[1][0] == 'first_value2'
```

`QueryContext`는 스레드 안전하지 않지만, `QueryContext.updated_copy` 메서드를 호출하여 다중 스레드 환경에서 복사본을 얻을 수 있습니다.

## 스트리밍 쿼리 {#streaming-queries}

ClickHouse Connect 클라이언트는 스트림으로 데이터를 검색하기 위한 여러 메서드를 제공합니다(파이썬 생성기로 구현됨):

- `query_column_block_stream` -- 기본 파이썬 객체를 사용하여 열의 시퀀스로 쿼리 데이터를 블록으로 반환합니다.
- `query_row_block_stream` -- 기본 파이썬 객체를 사용하여 행의 블록으로 쿼리 데이터를 반환합니다.
- `query_rows_stream` -- 기본 파이썬 객체를 사용하여 행의 시퀀스로 쿼리 데이터를 반환합니다.
- `query_np_stream` -- 각 ClickHouse 쿼리 데이터 블록을 NumPy 배열로 반환합니다.
- `query_df_stream` -- 각 ClickHouse 블록의 쿼리 데이터를 Pandas DataFrame으로 반환합니다.
- `query_arrow_stream` -- PyArrow RecordBlocks 형식으로 쿼리 데이터를 반환합니다.
- `query_df_arrow_stream` -- 각 ClickHouse 블록의 쿼리 데이터를 `dataframe_library` 키워드 인수에 따라 화살표 지원 Pandas DataFrame 또는 Polars DataFrame으로 반환합니다(기본값은 "pandas").

각 메서드는 스트림을 소비하기 시작하기 위해 `with` 문을 통해 열어야 하는 `ContextStream` 객체를 반환합니다.

### 데이터 블록 {#data-blocks}

ClickHouse Connect는 ClickHouse 서버로부터 수신되는 블록의 스트림으로 모든 데이터를 기본 `query` 메서드에서 처리합니다. 이러한 블록은 ClickHouse와의 전송에 사용되는 사용자 지정 "네이티브" 형식으로 전송됩니다. "블록"은 각 컬럼이 지정된 데이터 유형의 동일한 수의 데이터 값을 포함하는 이진 데이터의 컬럼 시퀀스입니다. (컬럼형 데이터베이스인 ClickHouse는 이 데이터를 유사한 형태로 저장합니다.) 쿼리에서 반환되는 블록의 크기는 여러 수준(사용자 프로필, 사용자, 세션 또는 쿼리)에서 설정할 수 있는 두 가지 사용자 설정에 의해 결정됩니다. 이들은 다음과 같습니다:

- [max_block_size](/operations/settings/settings#max_block_size) -- 행의 블록 크기 제한. 기본값 65536.
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- 바이트의 블록 크기에 대한 소프트 제한. 기본값 1,000,0000.

`preferred_block_size_setting`과 관계없이 각 블록은 절대로 `max_block_size` 행을 초과하지 않습니다. 쿼리의 유형에 따라 반환된 실제 블록은 어떤 크기일 수도 있습니다. 예를 들어, 여러 샤드를 커버하는 분산 테이블에 대한 쿼리는 각 샤드에서 직접 검색된 작은 블록을 포함할 수 있습니다.

클라이언트의 `query_*_stream` 메서드 중 하나를 사용할 때, 결과는 블록별로 반환됩니다. ClickHouse Connect는 한 번에 단일 블록만 로드합니다. 이렇게 하면 대량의 데이터를 메모리에 큰 결과 세트를 모두 로드할 필요 없이 처리할 수 있습니다. 애플리케이션은 블록의 수에 상관없이 처리할 수 있도록 준비해야 하며 각 블록의 정확한 크기는 제어할 수 없습니다.

### 느린 처리를 위한 HTTP 데이터 버퍼 {#http-data-buffer-for-slow-processing}

HTTP 프로토콜의 제한 사항으로 인해 블록이 ClickHouse 서버가 데이터를 스트리밍하는 속도보다 현저히 느리게 처리되면 ClickHouse 서버가 연결을 종료하게 되어 처리 스레드에서 예외가 발생합니다. 이러한 문제는 일반적인 `http_buffer_size` 설정을 사용하여 HTTP 스트리밍 버퍼의 버퍼 크기를 늘림으로써 어느 정도 완화할 수 있습니다(기본값은 10메가바이트). 충분한 메모리가 애플리케이션에 사용 가능한 경우, 큰 `http_buffer_size` 값은 이 상황에서 괜찮아야 합니다. 버퍼의 데이터는 `lz4` 또는 `zstd` 압축을 사용하는 경우 압축된 형태로 저장되므로, 이러한 압축 유형을 사용하면 사용 가능한 전체 버퍼를 늘릴 수 있습니다.

### StreamContexts {#streamcontexts}

각 `query_*_stream` 메서드(예: `query_row_block_stream`)는 ClickHouse `StreamContext` 객체를 반환하며, 이는 결합된 파이썬 컨텍스트/제너레이터입니다. 기본 사용법은 다음과 같습니다:

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <do something with each row of Python trip data>
```

`with` 문 없이 StreamContext를 사용하려고 하면 오류가 발생합니다. 파이썬 컨텍스트를 사용하면 스트림(이 경우 스트리밍 HTTP 응답)이 모든 데이터가 소비되지 않거나 처리 중 예외가 발생하더라도 올바르게 닫히게 됩니다. 또한, `StreamContext`는 스트림을 소비하기 위해 한 번만 사용할 수 있습니다. exit된 후 `StreamContext`를 사용하려고 하면 `StreamClosedError`가 발생합니다.

`StreamContext`의 `source` 속성을 사용하여 부모 `QueryResult` 객체에 접근할 수 있으며, 이는 컬럼 이름과 유형을 포함합니다.

### 스트림 유형 {#stream-types}

`query_column_block_stream` 메서드는 블록을 기본 파이썬 데이터 유형으로 저장된 컬럼 데이터의 시퀀스로 반환합니다. 위의 `taxi_trips` 쿼리를 사용하면 반환되는 데이터는 리스트가 되며, 리스트의 각 요소는 관련된 컬럼의 모든 데이터를 포함하는 또 다른 리스트(또는 튜플)가 됩니다. 따라서 `block[0]`는 문자열만 포함하는 튜플이 됩니다. 컬럼 지향 형식은 모든 컬럼의 값에 대한 집계 작업을 수행하는 데 가장 많이 사용됩니다(예: 총 요금을 합산).

`query_row_block_stream` 메서드는 블록을 전통적인 관계형 데이터베이스처럼 행의 시퀀스로 반환합니다. 택시 여행에 대해 반환되는 데이터는 리스트가 되며, 각 리스트 요소는 데이터 행을 나타내는 또 다른 리스트가 됩니다. 따라서 `block[0]`은 첫 번째 택시 여행의 모든 필드를(순서대로) 포함하고, `block[1]`은 두 번째 택시 여행의 모든 필드에 대한 행을 포함하게 됩니다. 행 지향 결과는 일반적으로 디스플레이 또는 변환 프로세스에 사용됩니다.

`query_row_stream`은 스트림을 반복할 때 자동으로 다음 블록으로 이동하는 편의 메서드입니다. 그렇지 않으면 `query_row_block_stream`과 동일합니다.

`query_np_stream` 메서드는 각 블록을 2차원 NumPy 배열로 반환합니다. 내부적으로 NumPy 배열은(일반적으로) 컬럼으로 저장되므로 별도의 행 또는 열 메서드가 필요하지 않습니다. NumPy 배열의 "형상"은 (컬럼, 행)으로 표현됩니다. NumPy 라이브러리는 NumPy 배열을 조작하는 여러 메서드를 제공합니다. 모든 컬럼이 동일한 NumPy dtype를 공유하는 경우 반환된 NumPy 배열은 하나의 dtype만 가지며, 내부 구조를 변경하지 않고도 재구성하거나 회전할 수 있습니다.

`query_df_stream` 메서드는 각 ClickHouse 블록을 2차원 Pandas DataFrame으로 반환합니다. 다음은 `StreamContext` 객체를 비동기적으로(단 한 번만) 사용할 수 있음을 보여주는 예입니다.

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <do something with the pandas DataFrame>
```

`query_df_arrow_stream` 메서드는 각 ClickHouse 블록을 PyArrow dtype 백엔드가 있는 DataFrame으로 반환합니다. 이 방법은 `dataframe_library` 매개변수를 통해 Pandas(2.x 이상) 및 Polars DataFrame을 모두 지원합니다(기본값은 "pandas"). 각 반복에서 PyArrow 레코드 배치에서 변환된 DataFrame을 제공하며, 특정 데이터 유형에 대한 성능과 메모리 효율성을 향상시킵니다.

마지막으로, `query_arrow_stream` 메서드는 ClickHouse `ArrowStream` 형식의 결과를 `pyarrow.ipc.RecordBatchStreamReader`로 반환하며, 이는 `StreamContext`로 감싸집니다. 스트림의 각 반복은 PyArrow RecordBlock을 반환합니다.

### 스트리밍 예제 {#streaming-examples}

#### 행 스트리밍 {#stream-rows}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()


# Stream large result sets row by row
with client.query_rows_stream("SELECT number, number * 2 as doubled FROM system.numbers LIMIT 100000") as stream:
    for row in stream:
        print(row)  # Process each row
        # Output:
        # (0, 0)
        # (1, 2)
        # (2, 4)
        # ....
```

#### 행 블록 스트리밍 {#stream-row-blocks}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()


# Stream in blocks of rows (more efficient than row-by-row)
with client.query_row_block_stream("SELECT number, number * 2 FROM system.numbers LIMIT 100000") as stream:
    for block in stream:
        print(f"Received block with {len(block)} rows")
        # Output:
        # Received block with 65409 rows
        # Received block with 34591 rows
```

#### Pandas DataFrames 스트리밍 {#stream-pandas-dataframes}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()


# Stream query results as Pandas DataFrames
with client.query_df_stream("SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000") as stream:
    for df in stream:
        # Process each DataFrame block
        print(f"Received DataFrame with {len(df)} rows")
        print(df.head(3))
        # Output:
        # Received DataFrame with 65409 rows
        #    number str
        # 0       0   0
        # 1       1   1
        # 2       2   2
        # Received DataFrame with 34591 rows
        #    number    str
        # 0   65409  65409
        # 1   65410  65410
        # 2   65411  65411
```

#### Arrow 배치 스트리밍 {#stream-arrow-batches}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()


# Stream query results as Arrow record batches
with client.query_arrow_stream("SELECT * FROM large_table") as stream:
    for arrow_batch in stream:
        # Process each Arrow batch
        print(f"Received Arrow batch with {arrow_batch.num_rows} rows")
        # Output:
        # Received Arrow batch with 65409 rows
        # Received Arrow batch with 34591 rows
```

## NumPy, Pandas, 및 Arrow 쿼리 {#numpy-pandas-and-arrow-queries}

ClickHouse Connect는 NumPy, Pandas, 및 Arrow 데이터 구조로 작업하기 위한 특화된 쿼리 메서드를 제공합니다. 이러한 메서드를 사용하면 수동 변환 없이 이러한 인기 있는 데이터 형식으로 직접 쿼리 결과를 검색할 수 있습니다.

### NumPy 쿼리 {#numpy-queries}

`query_np` 메서드는 ClickHouse Connect `QueryResult` 대신 쿼리 결과를 NumPy 배열로 반환합니다.

```python
import clickhouse_connect

client = clickhouse_connect.get_client()


# Query returns a NumPy array
np_array = client.query_np("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")

print(type(np_array))

# Output:

# <class "numpy.ndarray">

print(np_array)

# Output:

# [[0 0]

#  [1 2]

#  [2 4]

#  [3 6]

#  [4 8]]
```

### Pandas 쿼리 {#pandas-queries}

`query_df` 메서드는 ClickHouse Connect `QueryResult` 대신 쿼리 결과를 Pandas DataFrame으로 반환합니다.

```python
import clickhouse_connect

client = clickhouse_connect.get_client()


# Query returns a Pandas DataFrame
df = client.query_df("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")

print(type(df))

# Output: <class "pandas.core.frame.DataFrame">
print(df)

# Output:

#    number  doubled

# 0       0        0

# 1       1        2

# 2       2        4

# 3       3        6

# 4       4        8
```

### PyArrow 쿼리 {#pyarrow-queries}

`query_arrow` 메서드는 쿼리 결과를 PyArrow 테이블로 반환합니다. ClickHouse `Arrow` 형식을 직접 사용하므로, 메인 `query` 메서드와 공통된 세 가지 인수(`query`, `parameters`, 및 `settings`)만 허용합니다. 추가적으로 `use_strings`라는 매개변수가 있어, Arrow 테이블이 ClickHouse 문자열 형식을 문자열(참일 경우) 또는 바이트(거짓일 경우)로 렌더링할지를 결정합니다.

```python
import clickhouse_connect

client = clickhouse_connect.get_client()


# Query returns a PyArrow Table
arrow_table = client.query_arrow("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")

print(type(arrow_table))

# Output:

# <class "pyarrow.lib.Table">

print(arrow_table)

# Output:

# pyarrow.Table

# number: uint64 not null

# str: string not null

# ----

# number: [[0,1,2]]

# str: [["0","1","2"]]
```

### Arrow 지원 DataFrames {#arrow-backed-dataframes}

ClickHouse Connect는 `query_df_arrow` 및 `query_df_arrow_stream` 메서드를 통해 Arrow 결과에서 빠르고 메모리 효율적인 DataFrame 생성을 지원합니다. 이들은 Arrow 쿼리 메서드의 얇은 래퍼이며 가능한 경우 DataFrame으로 제로 복사 변환을 수행합니다:

- `query_df_arrow`: ClickHouse `Arrow` 출력 형식을 사용하여 쿼리를 실행하고 DataFrame을 반환합니다.
  - `dataframe_library='pandas'`의 경우 Arrow 기반 dtype(`pd.ArrowDtype`)을 사용하여 pandas 2.x DataFrame을 반환합니다. 이는 pandas 2.x가 필요하며 가능한 한 제로 복사 버퍼를 활용하여 뛰어난 성능과 낮은 메모리 오버헤드를 제공합니다.
  - `dataframe_library='polars'`의 경우 Arrow 테이블(`pl.from_arrow`)에서 생성된 Polars DataFrame을 반환하며, 이 역시 유사하게 효율적이며 데이터에 따라 제로 복사가 가능합니다.
- `query_df_arrow_stream`: Arrow 스트림 배치에서 변환된 DataFrame의 시퀀스로 결과를 스트리밍합니다(pandas 2.x 또는 Polars).

#### Arrow 지원 DataFrame으로 쿼리하기 {#query-to-arrow-backed-dataframe}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()


# Query returns a Pandas DataFrame with Arrow dtypes (requires pandas 2.x)
df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="pandas"
)

print(df.dtypes)

# Output:

# number    uint64[pyarrow]

# str       string[pyarrow]

# dtype: object


# Or use Polars
polars_df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="polars"
)
print(df.dtypes)

# Output:

# [UInt64, String]



# Streaming into batches of DataFrames (polars shown)
with client.query_df_arrow_stream(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000", dataframe_library="polars"
) as stream:
    for df_batch in stream:
        print(f"Received {type(df_batch)} batch with {len(df_batch)} rows and dtypes: {df_batch.dtypes}")
        # Output:
        # Received <class 'polars.dataframe.frame.DataFrame'> batch with 65409 rows and dtypes: [UInt64, String]
        # Received <class 'polars.dataframe.frame.DataFrame'> batch with 34591 rows and dtypes: [UInt64, String]
```

#### 주의 사항 및 경고 {#notes-and-caveats}

- Arrow 타입 매핑: Arrow 형식으로 데이터를 반환할 때 ClickHouse는 가장 가까운 지원되는 Arrow 유형으로 타입을 매핑합니다. 일부 ClickHouse 타입은 원래의 Arrow에 해당하는 것이 없으며 Arrow 필드에서 원시 바이트로 반환됩니다(일반적으로 `BINARY` 또는 `FIXED_SIZE_BINARY`).
  - 예시: `IPv4`는 Arrow `UINT32`로 표현됩니다; `IPv6` 및 대형 정수(`Int128/UInt128/Int256/UInt256`)는 일반적으로 원시 바이트가 있는 `FIXED_SIZE_BINARY`/ `BINARY`로 표현됩니다.
  - 이러한 경우 DataFrame 컬럼은 Arrow 필드에 의해 지원되는 바이트 값을 포함합니다. 이를 해석/변환하는 것은 ClickHouse 의미에 따라 클라이언트 코드에 달려 있습니다.
- 지원되지 않는 Arrow 데이터 유형(예: UUID/ENUM과 같은 진정한 Arrow 유형)은 포함되지 않으며, 값은 출력에 대해 가장 가까운 지원되는 Arrow 유형(일반적으로 이진 바이트)으로 표시됩니다.
- Pandas 요청사항: Arrow 기반 dtype는 pandas 2.x를 필요로 합니다. 구버전 pandas에서는 `query_df`(비-Arrow)를 사용하십시오.
- 문자열 대 바이트: `use_strings` 옵션(서버 설정 `output_format_arrow_string_as_string`에 의해 지원되는 경우)은 ClickHouse `String` 컬럼이 Arrow 문자열로 반환되는지 또는 바이트로 반환되는지를 제어합니다.

#### ClickHouse/Arrow 타입 변환 불일치 예제 {#mismatched-clickhousearrow-type-conversion-examples}

ClickHouse가 컬럼을 원시 이진 데이터(e.g., `FIXED_SIZE_BINARY` 또는 `BINARY`)로 반환하는 경우, 이러한 바이트를 적절한 파이썬 타입으로 변환하는 것은 애플리케이션 코드의 책임입니다. 아래의 예시는 일부 변환이 DataFrame 라이브러리 API를 사용하여 가능하지만, 다른 일부는 성능을 희생하고 유연성을 유지하는 `struct.unpack`과 같은 순수 파이썬 접근법이 필요할 수 있음을 보여줍니다.

`Date` 컬럼은 `UINT16`(Unix 기준 1970-01-01로부터의 일 수)으로 도착할 수 있습니다. DataFrame 내에서 변환하는 것은 효율적이며 간단합니다:
```python

# Polars
df = df.with_columns(pl.col("event_date").cast(pl.Date))


# Pandas
df["event_date"] = pd.to_datetime(df["event_date"], unit="D")
```

`Int128`과 같은 컬럼은 원시 바이트가 있는 `FIXED_SIZE_BINARY`로 도착할 수 있습니다. Polars는 128비트 정수를 원래 지원합니다:
```python

# Polars - native support
df = df.with_columns(pl.col("data").bin.reinterpret(dtype=pl.Int128, endianness="little"))
```

NumPy 2.3 현재 128비트 정수 dtype은 공개되어 있지 않으므로, 순수 파이썬에 의존하여 다음과 같은 작업을 수행할 수 있습니다:

```python

# Assuming we have a pandas dataframe with an Int128 column of dtype fixed_size_binary[16][pyarrow]

print(df)

# Output:

#   str_col                                        int_128_col

# 0    num1  b'\\x15}\\xda\\xeb\\x18ZU\\x0fn\\x05\\x01\\x00\\x00\\x00...

# 1    num2  b'\\x08\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00...

# 2    num3  b'\\x15\\xdfp\\x81r\\x9f\\x01\\x00\\x00\\x00\\x00\\x00\\x...

print([int.from_bytes(n, byteorder="little") for n in df["int_128_col"].to_list()])

# Output:

# [1234567898765432123456789, 8, 456789123456789]
```

핵심 포인트: 애플리케이션 코드는 선택한 DataFrame 라이브러리의 기능과 허용 가능한 성능 거래를 바탕으로 이러한 변환을 처리해야 합니다. DataFrame 네이티브 변환이 불가능할 경우, 순수 파이썬 접근 방식을 선택할 수 있습니다.

## 읽기 형식 {#read-formats}

읽기 형식은 클라이언트 `query`, `query_np`, 및 `query_df` 메서드에서 반환되는 값의 데이터 유형을 제어합니다. (`raw_query` 및 `query_arrow`는 ClickHouse로부터 들어오는 데이터를 수정하지 않으므로 형식 제어가 적용되지 않습니다.) 예를 들어, UUID의 읽기 형식이 기본 `native` 형식에서 대체 `string` 형식으로 변경되면 ClickHouse의 `UUID` 컬럼 쿼리는 파이썬 UUID 객체 대신 문자열 값으로 반환됩니다.

형식 지정 기능의 "데이터 유형" 인수에는 와일드카드가 포함될 수 있습니다. 형식은 단일 소문자 문자열입니다.

읽기 형식은 여러 수준에서 설정될 수 있습니다:

- 전역적으로, `clickhouse_connect.datatypes.format` 패키지에 정의된 메서드를 사용하여 설정합니다. 이렇게 하면 모든 쿼리에 대해 구성된 데이터 유형의 형식을 제어할 수 있습니다.
```python
from clickhouse_connect.datatypes.format import set_read_format


# Return both IPv6 and IPv4 values as strings
set_read_format('IPv*', 'string')


# Return all Date types as the underlying epoch second or epoch day
set_read_format('Date*', 'int')
```
- 전체 쿼리에 대해, 선택적 `query_formats` 사전 인수를 사용합니다. 이 경우 지정된 데이터 유형의 모든 컬럼(또는 서브컬럼)은 구성된 형식을 사용하게 됩니다.
```python

# Return any UUID column as a string
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```
- 특정 컬럼의 값에 대해, 선택적 `column_formats` 사전 인수를 사용합니다. 여기서 키는 ClickHouse에서 반환된 컬럼 이름이며, 데이터 컬럼의 형식 또는 ClickHouse 유형 이름과 쿼리 형식의 값을 가진 2차 "형식" 사전입니다. 이 보조 사전은 튜플이나 맵과 같은 중첩하는 컬럼 타입에 사용할 수 있습니다.
```python

# Return IPv6 values in the `dev_address` column as strings
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```

### 읽기 형식 옵션 (파이썬 타입) {#read-format-options-python-types}

| ClickHouse Type       | Native Python Type      | Read Formats      | Comments                                                                                                          |
|-----------------------|-------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                                   |
| UInt64                | int                     | signed            | Superset는 현재 큰 unsigned UInt64 값을 처리하지 않습니다                                                   |
| [U]Int[128,256]       | int                     | string            | Pandas 및 NumPy int 값은 최대 64비트이므로, 문자열로 반환될 수 있습니다                              |
| BFloat16              | float                   | -                 | 모든 파이썬 부동 소수점 수는 내부적으로 64비트입니다                                                                          |
| Float32               | float                   | -                 | 모든 파이썬 부동 소수점 수는 내부적으로 64비트입니다                                                                          |
| Float64               | float                   | -                 |                                                                                                                   |
| Decimal               | decimal.Decimal         | -                 |                                                                                                                   |
| String                | string                  | bytes             | ClickHouse String 컬럼에는 본래 인코딩이 없으므로, 길이가 변동하는 이진 데이터에도 사용됩니다        |
| FixedString           | bytes                   | string            | FixedStrings는 고정 크기 바이트 배열이지만, 때때로 파이썬 문자열로 처리됩니다                              |
| Enum[8,16]            | string                  | string, int       | 파이썬 열거형은 빈 문자열을 수용하지 않으므로, 모든 열거형은 문자열 또는 기본 int 값으로 렌더링됩니다. |
| Date                  | datetime.date           | int               | ClickHouse는 Date를 01/01/1970 이후의 일 수로 저장합니다. 이 값은 int로 제공됩니다.                               |
| Date32                | datetime.date           | int               | Date와 동일하나 날짜 범위가 넓습니다                                                                      |
| DateTime              | datetime.datetime       | int               | ClickHouse는 DateTime을 epoch 초 단위로 저장합니다. 이 값은 int로 제공됩니다.                                    |
| DateTime64            | datetime.datetime       | int               | 파이썬 datetime.datetime은 마이크로초 정밀도로 제한됩니다. 원시 64비트 int 값이 제공됩니다.               |
| Time                  | datetime.timedelta      | int, string, time | 시간은 Unix 타임스탬프 형식으로 저장됩니다. 이 값은 int로 제공됩니다.                                 |
| Time64                | datetime.timedelta      | int, string, time | 파이썬 datetime.timedelta는 마이크로초 정밀도로 제한됩니다. 원시 64비트 int 값이 제공됩니다.              |
| IPv4                  | `ipaddress.IPv4Address` | string            | IP 주소는 문자열로 읽을 수 있으며, 적절하게 포맷된 문자열은 IP 주소로 삽입할 수 있습니다.                |
| IPv6                  | `ipaddress.IPv6Address` | string            | IP 주소는 문자열로 읽을 수 있으며, 적절하게 포맷된 문자열은 IP 주소로 삽입할 수 있습니다.                |
| Tuple                 | dict or tuple           | tuple, json       | 기본적으로 반환되는 명명된 튜플은 사전 형태입니다. 명명된 튜플은 JSON 문자열로도 반환 가능                                                  |
| Map                   | dict                    | -                 |                                                                                                                   |
| Nested                | Sequence[dict]          | -                 |                                                                                                                   |
| UUID                  | uuid.UUID               | string            | UUID는 RFC 4122에 따라 포맷된 문자열로 읽을 수 있습니다.<br/>                                                       |
| JSON                  | dict                    | string            | 기본적으로 파이썬 사전이 반환됩니다. `string` 형식은 JSON 문자열을 반환합니다.                         |
| Variant               | object                  | -                 | ClickHouse 데이터 유형에 대해 저장된 값에 대한 일치하는 파이썬 유형을 반환합니다.                                  |
| Dynamic               | object                  | -                 | ClickHouse 데이터 유형에 대해 저장된 값에 대한 일치하는 파이썬 유형을 반환합니다.                                  |

## 외부 데이터 {#external-data}

ClickHouse 쿼리는 ClickHouse 형식의 외부 데이터를 수락할 수 있습니다. 이 이진 데이터는 데이터 처리를 위해 쿼리 문자열과 함께 전송됩니다. 외부 데이터 기능에 대한 자세한 내용은 [여기](/engines/table-engines/special/external-data.md)에서 확인하십시오. 클라이언트 `query*` 메서드는 이 기능을 활용하기 위해 선택적 `external_data` 매개변수를 수용합니다. `external_data` 매개변수의 값은 `clickhouse_connect.driver.external.ExternalData` 객체이어야 합니다. 해당 객체의 생성자는 다음 인수를 수용합니다:

| Name      | Type              | Description                                                                                                                                   |
|-----------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| file_path | str               | 외부 데이터를 읽어오는 로컬 시스템 경로의 파일 경로. `file_path` 또는 `data` 중 하나가 필요합니다.                              |
| file_name | str               | 외부 데이터 "파일"의 이름. 제공되지 않으면 `file_path`에서 확인됩니다(확장자 제외).                           |
| data      | bytes             | 파일 대신 이진 형태의 외부 데이터. `data` 또는 `file_path` 중 하나가 필요합니다.                                |
| fmt       | str               | 데이터의 ClickHouse [입력 형식](/sql-reference/formats.mdx). 기본적으로 `TSV`로 설정됩니다.                                                      |
| types     | str or seq of str | 외부 데이터의 컬럼 데이터 유형 리스트. 문자열인 경우, 형태는 쉼표로 구분됩니다. `types` 또는 `structure`가 필요합니다. |
| structure | str or seq of str | 데이터의 컬럼 이름 + 데이터 유형 리스트(예제 참조). `structure` 또는 `types` 중 하나가 필요합니다.                                       |
| mime_type | str               | 파일 데이터의 선택적 MIME 타입. 현재 ClickHouse는 이 HTTP 서브헤더를 무시합니다.                                                         |

"영화" 데이터가 포함된 외부 CSV 파일과 ClickHouse 서버에 이미 존재하는 `directors` 테이블을 결합하여 쿼리를 전송하려면:

```python
import clickhouse_connect
from clickhouse_connect.driver.external import ExternalData

client = clickhouse_connect.get_client()
ext_data = ExternalData(file_path='/data/movies.csv',
                        fmt='CSV',
                        structure=['movie String', 'year UInt16', 'rating Decimal32(3)', 'director String'])
result = client.query('SELECT name, avg(rating) FROM directors INNER JOIN movies ON directors.name = movies.director GROUP BY directors.name',
                      external_data=ext_data).result_rows
```

초기 `ExternalData` 객체에 추가 외부 데이터 파일은 생성자와 같은 매개변수를 사용하는 `add_file` 메서드를 통해 추가할 수 있습니다. HTTP의 경우, 모든 외부 데이터는 `multi-part/form-data` 파일 업로드의 일환으로 전송됩니다.

## 시간대 {#time-zones}

ClickHouse DateTime 및 DateTime64 값에 시간대를 적용하기 위한 여러 메커니즘이 있습니다. 내부적으로 ClickHouse 서버는 모든 DateTime 또는 `DateTime64` 객체를 기준으로 삼아 에포크인 1970-01-01 00:00:00 UTC 시간 이후의 초를 나타내는 시간대 무관 숫자로 저장합니다. `DateTime64` 값은 정밀도에 따라 에포크 이후 밀리초, 마이크로초 또는 나노초의 형태로 표현될 수 있습니다. 따라서 시간대 정보의 적용은 항상 클라이언트 측에서 발생합니다. 이것은 의미 있는 추가 계산을 포함하므로 성능이 중요한 애플리케이션에서는 DateTime 유형을 사용자 표시 및 변환 외에 에포크 타임스탬프(예: Pandas Timestamps는 항상 에포크 나노초를 나타내는 64비트 정수)를 처리하는 것이 좋습니다.

쿼리 중 시간대 인식 데이터 유형(특히 파이썬 `datetime.datetime` 객체)을 사용할 때, `clickhouse-connect`는 다음과 같은 우선 순위 규칙을 사용하여 클라이언트 측 시간대를 적용합니다:

1. 쿼리에 대해 쿼리 메서드 매개변수 `client_tzs`가 지정되면 특정 컬럼의 시간대가 적용됩니다.
2. ClickHouse 컬럼에 시간대 메타데이터가 있는 경우(예: `DateTime64(3, 'America/Denver')`와 같은 유형), ClickHouse 컬럼 시간대가 적용됩니다. (이 메타데이터는 ClickHouse 버전 23.2 이전의 DateTime 컬럼에 대해 `clickhouse-connect`에서 사용할 수 없습니다.)
3. 쿼리 메서드 매개변수 `query_tz`가 지정되면 "쿼리 시간대"가 적용됩니다.
4. 쿼리 또는 세션에 시간대 설정이 적용된 경우, 해당 시간대가 적용됩니다. (이 기능은 ClickHouse 서버에 아직 출시되지 않았습니다.)
5. 마지막으로, 클라이언트 `apply_server_timezone` 매개변수가 True로 설정된 경우(기본값), ClickHouse 서버 시간대가 적용됩니다.

이 규칙에 따라 적용된 시간대가 UTC인 경우, `clickhouse-connect`는 _항상_ 시간대 무관 파이썬 `datetime.datetime` 객체를 반환합니다. 원할 경우, 추가 시간대 정보를 이 시간대 무관 객체에 추가할 수 있습니다.
