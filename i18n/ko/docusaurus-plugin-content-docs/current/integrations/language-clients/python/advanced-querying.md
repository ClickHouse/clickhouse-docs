---
sidebar_label: '고급 쿼리'
sidebar_position: 4
keywords: ['clickhouse', 'python', '쿼리', 'advanced']
description: 'ClickHouse Connect를 사용한 고급 쿼리'
slug: /integrations/language-clients/python/advanced-querying
title: '고급 쿼리'
doc_type: 'reference'
---

# ClickHouse Connect로 데이터 쿼리하기: 고급 활용 \{#querying-data-with-clickhouse-connect--advanced-usage\}

## QueryContexts \{#querycontexts\}

ClickHouse Connect는 표준 쿼리를 `QueryContext` 내에서 실행합니다. `QueryContext`에는 ClickHouse 데이터베이스에 대해 쿼리를 구성하는 데 사용되는 핵심 구조와, 결과를 `QueryResult` 또는 다른 응답 데이터 구조로 처리하는 데 사용되는 설정이 포함됩니다. 여기에는 쿼리 자체, 파라미터, settings, 읽기 형식, 그리고 기타 속성이 포함됩니다.

`QueryContext`는 클라이언트의 `create_query_context` 메서드를 사용하여 얻을 수 있습니다. 이 메서드는 기본 쿼리 메서드와 동일한 파라미터를 받습니다. 이렇게 생성한 쿼리 컨텍스트는 `query`, `query_df`, `query_np` 메서드에 `context` 키워드 인자로 전달할 수 있으며, 이때 해당 메서드의 다른 인자 일부 또는 전부를 대신할 수 있습니다. 메서드 호출 시 추가로 지정한 인자는 QueryContext의 어떤 속성이든 이를 덮어쓴다는 점에 유의해야 합니다.

`QueryContext`의 가장 분명한 사용 사례는 동일한 쿼리에 대해 서로 다른 바인딩 파라미터 값을 사용해 전송하는 것입니다. 모든 파라미터 값은 딕셔너리를 인자로 하여 `QueryContext.set_parameters` 메서드를 호출함으로써 일괄 업데이트할 수 있으며, 개별 값은 원하는 `key`, `value` 쌍과 함께 `QueryContext.set_parameter`를 호출하여 갱신할 수 있습니다.

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

`QueryContext`는 스레드 세이프(thread-safe)가 아니지만, 멀티 스레드 환경에서도 `QueryContext.updated_copy` 메서드를 호출하여 복사본을 얻을 수 있습니다.


## Streaming queries \{#streaming-queries\}

ClickHouse Connect Client는 데이터 스트림(Python generator로 구현됨)으로 데이터를 가져오기 위한 여러 메서드를 제공합니다:

- `query_column_block_stream` -- 네이티브 Python 객체를 사용하여 쿼리 데이터를 컬럼 시퀀스로 블록 단위 반환합니다.
- `query_row_block_stream` -- 네이티브 Python 객체를 사용하여 쿼리 데이터를 행 블록으로 반환합니다.
- `query_rows_stream` -- 네이티브 Python 객체를 사용하여 쿼리 데이터를 행 시퀀스로 반환합니다.
- `query_np_stream` -- 각 ClickHouse 쿼리 데이터 블록을 NumPy 배열로 반환합니다.
- `query_df_stream` -- 각 ClickHouse 쿼리 데이터 블록을 Pandas DataFrame으로 반환합니다.
- `query_arrow_stream` -- 쿼리 데이터를 PyArrow RecordBlocks로 반환합니다.
- `query_df_arrow_stream` -- kwarg `dataframe_library` 값(기본값은 "pandas")에 따라 각 ClickHouse 쿼리 데이터 블록을 arrow 기반 Pandas DataFrame 또는 Polars DataFrame으로 반환합니다.

이러한 각 메서드는 스트림을 소비하기 시작하려면 `with` 문으로 열어야 하는 `ContextStream` 객체를 반환합니다.

### 데이터 블록 \{#data-blocks\}

ClickHouse Connect는 기본 `query` 메서드에서 나오는 모든 데이터를 ClickHouse 서버로부터 수신하는 블록 스트림으로 처리합니다. 이 블록들은 ClickHouse와의 송·수신 시 커스텀 "Native" 포맷으로 전송됩니다. "블록"은 단순히 이진 데이터 컬럼들로 이루어진 시퀀스로, 각 컬럼에는 지정된 데이터 타입의 데이터 값이 동일한 개수만큼 들어 있습니다. (컬럼형 데이터베이스인 ClickHouse도 이 데이터를 이와 유사한 형태로 저장합니다.) 쿼리에서 반환되는 블록의 크기는 여러 수준(사용자 프로필, 사용자, 세션, 쿼리)에서 설정할 수 있는 두 가지 사용자 설정에 의해 결정됩니다. 다음과 같습니다:

- [max_block_size](/operations/settings/settings#max_block_size) -- 블록 크기를 행 기준으로 제한합니다. 기본값은 65536입니다.
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- 블록 크기를 바이트 기준으로 제한하는 소프트 제한입니다. 기본값은 1,000,0000입니다.

`preferred_block_size_setting`과 관계없이 각 블록은 `max_block_size` 행을 초과하지 않습니다. 쿼리 유형에 따라 실제로 반환되는 블록의 크기는 달라질 수 있습니다. 예를 들어, 여러 세그먼트를 포함하는 분산 테이블에 대한 쿼리에는 각 세그먼트에서 직접 가져온 더 작은 블록들이 포함될 수 있습니다.

Client의 `query_*_stream` 메서드 중 하나를 사용할 때 결과는 블록 단위로 반환됩니다. ClickHouse Connect는 한 번에 하나의 블록만 로드합니다. 이를 통해 대규모 결과 집합 전체를 메모리에 로드하지 않고도 대량의 데이터를 처리할 수 있습니다. 애플리케이션은 임의 개수의 블록을 처리할 수 있도록 준비되어 있어야 하며, 각 블록의 정확한 크기는 제어할 수 없다는 점에 유의해야 합니다.

### 처리 속도가 느린 경우의 HTTP 데이터 버퍼 \{#http-data-buffer-for-slow-processing\}

HTTP 프로토콜의 제약으로 인해 블록이 처리되는 속도가 ClickHouse 서버가 데이터를 스트리밍하는 속도보다 현저히 느린 경우, ClickHouse 서버가 연결을 종료하게 되며 그 결과 처리 스레드에서 예외(Exception)가 발생합니다. 이러한 상황은 공통 설정인 `http_buffer_size`를 사용하여 HTTP 스트리밍 버퍼의 크기(기본값 10메가바이트)를 늘려 어느 정도 완화할 수 있습니다. 애플리케이션에서 사용 가능한 메모리가 충분하다면 `http_buffer_size` 값을 크게 설정해도 문제되지 않습니다. `lz4` 또는 `zstd` 압축을 사용하는 경우 버퍼의 데이터는 압축된 형태로 저장되므로, 이러한 압축 방식을 사용하면 전체적으로 활용 가능한 버퍼 용량이 늘어납니다.

### StreamContexts \{#streamcontexts\}

각 `query_*_stream` 메서드(예: `query_row_block_stream`)는 Python 컨텍스트와 제너레이터가 결합된 ClickHouse `StreamContext` 객체를 반환합니다. 기본적인 사용 방법은 다음과 같습니다.

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <do something with each row of Python trip data>
```

`with` 문 없이 `StreamContext`를 사용하려고 하면 오류가 발생합니다. Python 컨텍스트 관리자를 사용하면 스트림(이 경우 스트리밍 HTTP 응답)이 모든 데이터를 소비하지 않았거나 처리 중 예외가 발생한 경우에도 올바르게 닫히도록 보장합니다. 또한 `StreamContext`는 스트림을 한 번만 소비하는 데 사용할 수 있습니다. `StreamContext` 블록을 빠져나온 후 다시 사용하려고 하면 `StreamClosedError`가 발생합니다.

`StreamContext`의 `source` 속성을 사용하면 상위 `QueryResult` 객체에 접근할 수 있으며, 여기에는 컬럼 이름과 타입이 포함됩니다.


### 스트림 타입 \{#stream-types\}

`query_column_block_stream` 메서드는 블록을 기본 Python 데이터 타입으로 저장된 컬럼 데이터 시퀀스로 반환합니다. 위의 `taxi_trips` 쿼리를 사용할 때 반환되는 데이터는 리스트이며, 이 리스트의 각 요소는 해당 컬럼의 모든 데이터를 담고 있는 또 다른 리스트(또는 튜플)입니다. 따라서 `block[0]`은 문자열만 포함하는 튜플이 됩니다. 컬럼 지향 포맷은 컬럼의 모든 값에 대해 총 요금 합산과 같은 집계 연산을 수행할 때 가장 많이 사용됩니다.

`query_row_block_stream` 메서드는 전통적인 관계형 데이터베이스처럼 블록을 행 시퀀스로 반환합니다. `taxi_trips`의 경우 반환되는 데이터는 리스트이며, 이 리스트의 각 요소는 데이터의 한 행을 나타내는 또 다른 리스트입니다. 따라서 `block[0]`에는 첫 번째 taxi trip의 모든 필드(순서대로)가 포함되고, `block[1]`에는 두 번째 taxi trip의 모든 필드를 담은 한 행이 포함되는 식입니다. 행 지향 결과는 일반적으로 화면 표시나 변환 처리에 사용됩니다.

`query_row_stream`은 스트림을 순회(iteration)할 때 자동으로 다음 블록으로 이동해 주는 편의 메서드입니다. 그 외에는 `query_row_block_stream`과 동일합니다.

`query_np_stream` 메서드는 각 블록을 2차원 NumPy array로 반환합니다. 내부적으로 NumPy array는 (일반적으로) 컬럼 기준으로 저장되므로, 별도의 행 또는 컬럼 전용 메서드는 필요하지 않습니다. NumPy array의 「shape」는 (컬럼 수, 행 수)로 표현됩니다. NumPy 라이브러리는 NumPy array를 조작하기 위한 다양한 메서드를 제공합니다. 쿼리의 모든 컬럼이 동일한 NumPy dtype을 공유하는 경우, 반환된 NumPy array도 하나의 dtype만 가지게 되며, 내부 구조를 실제로 변경하지 않고도 재구성하거나 회전할 수 있습니다.

`query_df_stream` 메서드는 각 ClickHouse Block을 2차원 Pandas DataFrame으로 반환합니다. 다음은 `StreamContext` 객체를 지연(deferred) 방식으로 컨텍스트에 사용할 수 있음을 보여 주는 예시입니다(단, 한 번만 사용할 수 있습니다).

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <do something with the pandas DataFrame>
```

`query_df_arrow_stream` 메서드는 각 ClickHouse Block을 PyArrow dtype 백엔드를 사용하는 DataFrame으로 반환합니다. 이 메서드는 `dataframe_library` 매개변수(기본값 `"pandas"`)를 통해 Pandas(2.x 이상)와 Polars DataFrame을 모두 지원합니다. 각 반복에서 PyArrow record batch를 변환한 DataFrame이 생성되며, 특정 데이터 타입에 대해 더 나은 성능과 메모리 효율성을 제공합니다.

마지막으로, `query_arrow_stream` 메서드는 ClickHouse `ArrowStream` 형식의 결과를 `StreamContext`로 래핑된 `pyarrow.ipc.RecordBatchStreamReader`로 반환합니다. 스트림의 각 반복에서는 PyArrow RecordBlock을 반환합니다.


### 스트리밍 예시 \{#streaming-examples\}

#### 행 스트리밍하기 \{#stream-rows\}

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


#### 행 블록 스트리밍하기 \{#stream-row-blocks\}

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


#### Pandas DataFrame 스트리밍 \{#stream-pandas-dataframes\}

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


#### Arrow 배치 스트리밍 \{#stream-arrow-batches\}

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


## NumPy, Pandas, 및 Arrow 쿼리 \{#numpy-pandas-and-arrow-queries\}

ClickHouse Connect는 NumPy, Pandas, Arrow 데이터 구조를 다루기 위한 특화된 쿼리 메서드를 제공합니다. 이러한 메서드를 사용하면 수동 변환 없이도 쿼리 결과를 이러한 널리 사용되는 데이터 형식으로 직접 받을 수 있습니다.

### NumPy 쿼리 \{#numpy-queries\}

`query_np` 메서드는 쿼리 결과를 ClickHouse Connect의 `QueryResult` 대신 NumPy 배열 형태로 반환합니다.

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


### Pandas 쿼리 \{#pandas-queries\}

`query_df` 메서드는 쿼리 결과를 ClickHouse Connect의 `QueryResult` 대신 Pandas DataFrame으로 반환합니다.

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


### PyArrow 쿼리 \{#pyarrow-queries\}

`query_arrow` 메서드는 쿼리 결과를 PyArrow Table로 반환합니다. ClickHouse `Arrow` 포맷을 직접 사용하므로, 기본 `query` 메서드와 공통으로 사용하는 인자는 `query`, `parameters`, `settings` 세 개만 허용합니다. 여기에 더해 Arrow Table이 ClickHouse String 타입을 문자열(True인 경우)로 렌더링할지, 바이트(False인 경우)로 렌더링할지를 결정하는 `use_strings` 인자가 있습니다.

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


### Arrow 기반 DataFrame \{#arrow-backed-dataframes\}

ClickHouse Connect는 `query_df_arrow` 및 `query_df_arrow_stream` 메서드를 통해 Arrow 결과로부터 빠르고 메모리 효율적인 DataFrame 생성을 지원합니다. 이 메서드들은 Arrow 쿼리 메서드에 대한 가벼운 래퍼이며, 가능한 경우 DataFrame으로의 zero‑copy 변환을 수행합니다:

- `query_df_arrow`: ClickHouse `Arrow` 출력 포맷을 사용하여 쿼리를 실행하고 DataFrame을 반환합니다.
  - `dataframe_library='pandas'`인 경우, Arrow 기반 dtype(`pd.ArrowDtype`)을 사용하는 pandas 2.x DataFrame을 반환합니다. 이를 위해서는 pandas 2.x가 필요하며, 가능한 경우 zero‑copy 버퍼를 활용하여 뛰어난 성능과 낮은 메모리 오버헤드를 제공합니다.
  - `dataframe_library='polars'`인 경우, Arrow 테이블로부터 생성된 Polars DataFrame(`pl.from_arrow`)을 반환합니다. 이 역시 유사하게 효율적이며, 데이터에 따라 zero‑copy가 가능할 수 있습니다.
- `query_df_arrow_stream`: Arrow 스트림 배치에서 변환된 DataFrame(pandas 2.x 또는 Polars)들의 시퀀스로 결과를 스트리밍합니다.

#### Arrow 기반 DataFrame으로 쿼리 실행하기 \{#query-to-arrow-backed-dataframe\}

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


#### 참고 사항 및 주의점 \{#notes-and-caveats\}

- Arrow 타입 매핑: 데이터를 Arrow 형식으로 반환할 때 ClickHouse는 타입을 지원되는 Arrow 타입 중 가장 유사한 타입으로 매핑합니다. 일부 ClickHouse 타입은 네이티브 Arrow 대응 타입이 없어 Arrow 필드에서 원시 바이트(보통 `BINARY` 또는 `FIXED_SIZE_BINARY`)로 반환됩니다.
  - 예시: `IPv4`는 Arrow `UINT32`로 표현되고, `IPv6` 및 큰 정수 타입(`Int128/UInt128/Int256/UInt256`)은 종종 원시 바이트를 담은 `FIXED_SIZE_BINARY`/`BINARY`로 표현됩니다.
  - 이러한 경우 DataFrame 컬럼에는 해당 Arrow 필드를 기반으로 하는 바이트 값이 들어가며, 그 바이트를 ClickHouse 의미에 맞게 해석/변환하는 책임은 클라이언트 코드에 있습니다.
- 지원되지 않는 Arrow 데이터 타입(예: 네이티브 Arrow 타입으로서의 UUID/ENUM)은 출력 시 사용되지 않으며, 값은 출력용으로 지원되는 가장 가까운 Arrow 타입(종종 바이너리 바이트)으로 표현됩니다.
- Pandas 요구사항: Arrow 기반 dtypes는 pandas 2.x가 필요합니다. 더 오래된 pandas 버전에서는 `query_df`(non‑Arrow)를 대신 사용하십시오.
- 문자열 vs 바이너리: `use_strings` 옵션은(서버 SETTING `output_format_arrow_string_as_string`에서 지원되는 경우) ClickHouse `String` 컬럼을 Arrow 문자열로 반환할지, 아니면 바이너리로 반환할지를 제어합니다.

#### 불일치하는 ClickHouse/Arrow 타입 변환 예시 \{#mismatched-clickhousearrow-type-conversion-examples\}

ClickHouse가 컬럼을 원시 바이너리 데이터(예: `FIXED_SIZE_BINARY` 또는 `BINARY`)로 반환하는 경우, 이 바이트를 적절한 Python 타입으로 변환하는 책임은 애플리케이션 코드에 있습니다. 아래 예시는 일부 변환은 DataFrame 라이브러리 API를 사용해 수행할 수 있지만, 다른 경우에는 `struct.unpack`과 같은 순수 Python 방식을 사용해야 할 수 있음을 보여 줍니다(이 방식은 성능을 희생하지만 유연성을 유지합니다).

`Date` 컬럼은 `UINT16`(Unix epoch, 1970‑01‑01 이후의 일 수)으로 반환될 수 있습니다. DataFrame 내부에서 변환하는 방식은 효율적이고 간단합니다:

```python
# Polars
df = df.with_columns(pl.col("event_date").cast(pl.Date))

# Pandas
df["event_date"] = pd.to_datetime(df["event_date"], unit="D")
```

`Int128`과 같은 컬럼은 원시 바이트를 포함한 `FIXED_SIZE_BINARY` 형식으로 전달될 수 있습니다. Polars는 128비트 정수에 대해 네이티브 지원을 제공합니다.

```python
# Polars - native support
df = df.with_columns(pl.col("data").bin.reinterpret(dtype=pl.Int128, endianness="little"))
```

NumPy 2.3 기준으로는 공개된 128비트 정수 dtype이 없으므로 순수 Python을 사용해야 하며, 다음과 같이 작성할 수 있습니다:

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

핵심 요지는 다음과 같습니다. 애플리케이션 코드는 선택한 DataFrame 라이브러리의 기능과 허용 가능한 성능 트레이드오프를 기준으로 이러한 변환을 처리해야 합니다. DataFrame 네이티브 변환 기능을 사용할 수 없는 경우에는 순수 Python 방식도 여전히 하나의 선택지입니다.


## Read formats \{#read-formats\}

Read formats는 클라이언트의 `query`, `query_np`, `query_df` 메서드가 반환하는 값의 데이터 타입을 제어합니다. (`raw_query`와 `query_arrow`는 ClickHouse로부터 들어오는 데이터를 수정하지 않으므로 포맷 제어가 적용되지 않습니다.) 예를 들어 UUID에 대한 read format을 기본값인 `native` 포맷에서 대체 포맷인 `string` 포맷으로 변경하면, `UUID` 컬럼에 대한 ClickHouse 쿼리 결과는 Python UUID 객체 대신 문자열 값(표준 8-4-4-4-12 RFC 1422 형식 사용)으로 반환됩니다.

모든 포매팅 함수의 &quot;data type&quot; 인수에는 와일드카드를 포함할 수 있습니다. 포맷은 소문자로 된 단일 문자열입니다.

Read formats는 여러 수준에서 설정할 수 있습니다:

* 전역적으로, `clickhouse_connect.datatypes.format` 패키지에 정의된 메서드를 사용해 설정할 수 있습니다. 이 설정은 모든 쿼리에 대해 지정된 데이터 타입의 포맷을 제어합니다.

```python
from clickhouse_connect.datatypes.format import set_read_format

# Return both IPv6 and IPv4 values as strings
set_read_format('IPv*', 'string')

# Return all Date types as the underlying epoch second or epoch day
set_read_format('Date*', 'int')
```

* 전체 쿼리 수준에서 선택적인 `query_formats` 딕셔너리 인자를 사용합니다. 이 경우 지정된 데이터 타입의 컬럼(또는 서브컬럼)은 모두 구성된 포맷을 사용합니다.

```python
# Return any UUID column as a string
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```

* 특정 컬럼 값에 대해서는 선택적 `column_formats` 딕셔너리 인자를 사용할 수 있습니다. 키는 ClickHouse가 반환하는 컬럼 이름이며, 값은 데이터 컬럼에 대한 포맷이거나, ClickHouse 타입 이름을 키로 하고 쿼리 포맷을 값으로 갖는 2단계 &quot;format&quot; 딕셔너리입니다. 이 2차 딕셔너리는 Tuple 또는 Map과 같은 중첩 컬럼 타입에 사용할 수 있습니다.

```python
# Return IPv6 values in the `dev_address` column as strings
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```


### 읽기 포맷 옵션 (Python 타입) \{#read-format-options-python-types\}

| ClickHouse Type       | 네이티브 Python 타입    | 읽기 포맷         | 설명                                                                                                              |
|-----------------------|-------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                                   |
| UInt64                | int                     | signed            | Superset은 현재 큰 부호 없는 UInt64 값을 처리하지 못합니다                                                       |
| [U]Int[128,256]       | int                     | string            | Pandas 및 NumPy의 int 값은 최대 64비트이므로, 이 타입들은 문자열로 반환될 수 있습니다                            |
| BFloat16              | float                   | -                 | 모든 Python float는 내부적으로 64비트입니다                                                                       |
| Float32               | float                   | -                 | 모든 Python float는 내부적으로 64비트입니다                                                                       |
| Float64               | float                   | -                 |                                                                                                                   |
| Decimal               | decimal.Decimal         | -                 |                                                                                                                   |
| String                | string                  | bytes             | ClickHouse String 컬럼에는 고유한 인코딩이 없으므로, 가변 길이 바이너리 데이터에도 사용됩니다                    |
| FixedString           | bytes                   | string            | FixedString은 고정 크기 바이트 배열이지만, 때때로 Python 문자열로 처리됩니다                                     |
| Enum[8,16]            | string                  | string, int       | Python enum은 빈 문자열을 허용하지 않으므로, 모든 enum은 문자열 또는 내부 int 값으로 표현됩니다                 |
| Date                  | datetime.date           | int               | ClickHouse는 Date를 1970/01/01 이후 일(day) 수로 저장합니다. 이 값은 int로도 사용할 수 있습니다                 |
| Date32                | datetime.date           | int               | Date와 동일하지만, 더 넓은 날짜 범위를 지원합니다                                                                 |
| DateTime              | datetime.datetime       | int               | ClickHouse는 DateTime을 epoch 초 단위로 저장합니다. 이 값은 int로도 사용할 수 있습니다                           |
| DateTime64            | datetime.datetime       | int               | Python datetime.datetime은 마이크로초 정밀도로 제한됩니다. 원시 64비트 int 값으로도 사용할 수 있습니다           |
| Time                  | datetime.timedelta      | int, string, time | 시각은 Unix 타임스탬프로 저장됩니다. 이 값은 int로도 사용할 수 있습니다                                          |
| Time64                | datetime.timedelta      | int, string, time | Python datetime.timedelta는 마이크로초 정밀도로 제한됩니다. 원시 64비트 int 값으로도 사용할 수 있습니다          |
| IPv4                  | `ipaddress.IPv4Address` | string            | IP 주소는 문자열로 읽을 수 있으며, 올바르게 포맷된 문자열은 IP 주소로 삽입할 수 있습니다                         |
| IPv6                  | `ipaddress.IPv6Address` | string            | IP 주소는 문자열로 읽을 수 있으며, 올바르게 포맷된 값은 IP 주소로 삽입할 수 있습니다                             |
| Tuple                 | dict or tuple           | tuple, json       | Named tuple은 기본적으로 딕셔너리로 반환됩니다. Named tuple은 JSON 문자열로도 반환할 수 있습니다                 |
| Map                   | dict                    | -                 |                                                                                                                   |
| Nested                | Sequence[dict]          | -                 |                                                                                                                   |
| UUID                  | uuid.UUID               | string            | UUID는 RFC 4122에 따라 포맷된 문자열로 읽을 수 있습니다<br/>                                                     |
| JSON                  | dict                    | string            | 기본적으로 Python 딕셔너리가 반환됩니다. `string` 포맷을 사용하면 JSON 문자열이 반환됩니다                       |
| Variant               | object                  | -                 | 값에 저장된 ClickHouse 데이터 타입에 대응하는 Python 타입을 반환합니다                                           |
| Dynamic               | object                  | -                 | 값에 저장된 ClickHouse 데이터 타입에 대응하는 Python 타입을 반환합니다                                           |

## 외부 데이터 \{#external-data\}

ClickHouse 쿼리는 모든 ClickHouse 포맷의 외부 데이터를 사용할 수 있습니다. 이 바이너리 데이터는 데이터 처리를 위해 쿼리 문자열과 함께 전송됩니다. External Data 기능에 대한 자세한 내용은 [여기](/engines/table-engines/special/external-data.md)에 있습니다. 클라이언트의 `query*` 메서드는 이 기능을 활용하기 위해 선택적인 `external_data` 파라미터를 허용합니다. `external_data` 파라미터의 값은 `clickhouse_connect.driver.external.ExternalData` 객체여야 합니다. 이 객체의 생성자는 다음 인수를 받습니다:

| Name          | Type              | Description                                                                                   |
| ------------- | ----------------- | --------------------------------------------------------------------------------------------- |
| file&#95;path | str               | 외부 데이터를 읽어올 로컬 시스템 상의 파일 경로입니다. `file_path` 또는 `data` 중 하나는 반드시 지정해야 합니다                      |
| file&#95;name | str               | 외부 데이터 「파일」의 이름입니다. 지정하지 않으면 `file_path`에서 (확장자를 제외하고) 자동으로 결정됩니다                             |
| data          | bytes             | (파일에서 읽는 대신) 바이너리 형태의 외부 데이터입니다. `data` 또는 `file_path` 중 하나는 반드시 지정해야 합니다                     |
| fmt           | str               | 데이터의 ClickHouse [Input Format](/sql-reference/formats.mdx)입니다. 기본값은 `TSV`입니다                  |
| types         | str or seq of str | 외부 데이터에 포함된 컬럼 데이터 타입 목록입니다. 문자열일 경우 타입은 콤마로 구분해야 합니다. `types` 또는 `structure` 중 하나는 반드시 필요합니다 |
| structure     | str or seq of str | 데이터 내 컬럼 이름 + 데이터 타입의 목록입니다(예시 참조). `structure` 또는 `types` 중 하나는 반드시 필요합니다                    |
| mime&#95;type | str               | 파일 데이터의 선택적 MIME 타입입니다. 현재 ClickHouse는 이 HTTP 서브헤더를 무시합니다                                     |

「movie」 데이터가 포함된 외부 CSV 파일을 쿼리와 함께 전송하여, 그 데이터를 ClickHouse 서버에 이미 존재하는 `directors` 테이블과 조인하려면 다음과 같이 합니다:

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

추가 외부 데이터 파일은 생성자와 동일한 매개변수를 받는 `add_file` 메서드를 사용하여 초기 `ExternalData` 객체에 추가할 수 있습니다. HTTP의 경우 모든 외부 데이터는 `multipart/form-data` 파일 업로드의 일부로 전송됩니다.


## Time zones \{#time-zones\}

ClickHouse의 DateTime 및 DateTime64 값에 시간대를 적용하는 방법은 여러 가지가 있습니다. 내부적으로 ClickHouse 서버는 모든 DateTime 또는 `DateTime64` 객체를 항상 시간대 정보가 없는 숫자로 저장하며, 이는 1970-01-01 00:00:00 UTC 시간부터의 초를 나타냅니다. `DateTime64` 값의 경우, 정밀도에 따라 표현이 epoch 기준 밀리초, 마이크로초 또는 나노초가 됩니다. 그 결과, 어떤 시간대 정보도 항상 클라이언트 측에서 적용됩니다. 이 과정에는 상당한 추가 계산이 필요하므로, 성능이 중요한 애플리케이션에서는 사용자 표시 및 변환을 제외하고는 DateTime 타입을 epoch 타임스탬프로 취급하는 것이 권장됩니다(예를 들어 Pandas Timestamps는 성능 향상을 위해 항상 epoch 나노초를 나타내는 64비트 정수입니다).

쿼리에서 시간대 정보를 포함하는 데이터 타입, 특히 Python `datetime.datetime` 객체를 사용할 때 `clickhouse-connect`는 다음과 같은 우선순위 규칙에 따라 클라이언트 측 시간대를 적용합니다.

1. 쿼리에 대해 쿼리 메서드 파라미터 `client_tzs`가 지정된 경우, 해당 컬럼에 지정된 시간대를 적용합니다.
2. ClickHouse 컬럼에 시간대 메타데이터가 있는 경우(예: DateTime64(3, 'America/Denver') 타입인 경우), ClickHouse 컬럼 시간대를 적용합니다. (이 시간대 메타데이터는 ClickHouse 23.2 버전 이전의 DateTime 컬럼에서는 clickhouse-connect에서 사용할 수 없습니다.)
3. 쿼리에 대해 쿼리 메서드 파라미터 `query_tz`가 지정된 경우, 「쿼리 시간대」를 적용합니다.
4. 쿼리 또는 세션에 시간대 설정이 적용된 경우, 해당 시간대를 적용합니다. (이 기능은 아직 ClickHouse 서버에 릴리스되지 않았습니다.)
5. 마지막으로, 클라이언트의 `apply_server_timezone` 파라미터가 True(기본값)로 설정된 경우, ClickHouse 서버 시간대를 적용합니다.

이 규칙에 따라 적용된 시간대가 UTC인 경우, `clickhouse-connect`는 항상 시간대 정보가 없는 Python `datetime.datetime` 객체를 반환합니다. 필요하다면 애플리케이션 코드에서 이 시간대 정보가 없는 객체에 추가 시간대 정보를 부여할 수 있습니다.