---
sidebar_label: '고급 데이터 삽입'
sidebar_position: 5
keywords: ['clickhouse', 'python', 'insert', 'advanced']
description: 'ClickHouse Connect를 사용한 고급 데이터 삽입'
slug: /integrations/language-clients/python/advanced-inserting
title: '고급 데이터 삽입'
doc_type: 'reference'
---

## ClickHouse Connect로 데이터 삽입: 고급 활용 \{#inserting-data-with-clickhouse-connect--advanced-usage\}

### InsertContexts \{#insertcontexts\}

ClickHouse Connect는 모든 insert를 `InsertContext` 내에서 실행합니다. `InsertContext`에는 클라이언트 `insert` 메서드에 인수로 전달되는 모든 값이 포함됩니다. 추가로, `InsertContext`가 처음 생성될 때 ClickHouse Connect는 Native 포맷 insert를 효율적으로 수행하는 데 필요한 insert 컬럼의 데이터 타입을 가져옵니다. 하나의 `InsertContext`를 여러 insert에 재사용하면 이러한 「사전 쿼리(pre-query)」를 피할 수 있어 insert가 더 빠르고 효율적으로 실행됩니다.

`InsertContext`는 클라이언트의 `create_insert_context` 메서드를 사용해 얻을 수 있습니다. 이 메서드는 `insert` 함수와 동일한 인수를 받습니다. 재사용을 위해서는 `InsertContext`의 `data` 속성만 수정해야 한다는 점에 유의하십시오. 이는 동일한 테이블에 새로운 데이터를 반복적으로 insert하기 위한 재사용 가능한 객체를 제공한다는 원래 목적과도 일치합니다.

```python
test_data = [[1, 'v1', 'v2'], [2, 'v3', 'v4']]
ic = test_client.create_insert_context(table='test_table', data='test_data')
client.insert(context=ic)
assert client.command('SELECT count() FROM test_table') == 2
new_data = [[3, 'v5', 'v6'], [4, 'v7', 'v8']]
ic.data = new_data
client.insert(context=ic)
qr = test_client.query('SELECT * FROM test_table ORDER BY key DESC')
assert qr.row_count == 4
assert qr[0][0] == 4
```

`InsertContext`에는 삽입 과정에서 갱신되는 가변 상태가 포함되어 있어 스레드 안전하지 않습니다.


### 쓰기 포맷 \{#write-formats\}

쓰기 포맷은 현재 일부 데이터 타입에 대해서만 구현되어 있습니다. 대부분의 경우 ClickHouse Connect는 첫 번째 null이 아닌 데이터 값의 타입을 확인하여 해당 컬럼에 알맞은 쓰기 포맷을 자동으로 결정하려고 시도합니다. 예를 들어 `DateTime` 컬럼에 데이터를 삽입하는 경우, 해당 컬럼의 첫 번째 삽입 값이 Python 정수라면 ClickHouse Connect는 이를 에포크 초로 간주하고 정수 값을 그대로 삽입합니다.

대부분의 경우 특정 데이터 타입에 대해 쓰기 포맷을 별도로 지정할 필요는 없지만, 전역 수준에서 이를 변경해야 하는 경우 `clickhouse_connect.datatypes.format` 패키지의 관련 메서드를 사용할 수 있습니다.

#### 쓰기 포맷 옵션 \{#write-format-options\}

| ClickHouse Type       | 기본 Python 타입        | 쓰기 포맷         | 설명                                                                                                        |
|-----------------------|-------------------------|-------------------|-------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                             |
| UInt64                | int                     |                   |                                                                                                             |
| [U]Int[128,256]       | int                     |                   |                                                                                                             |
| BFloat16              | float                   |                   |                                                                                                             |
| Float32               | float                   |                   |                                                                                                             |
| Float64               | float                   |                   |                                                                                                             |
| Decimal               | decimal.Decimal         |                   |                                                                                                             |
| String                | string                  |                   |                                                                                                             |
| FixedString           | bytes                   | string            | 문자열로 삽입하는 경우, 남는 바이트는 0으로 채워집니다                                                      |
| Enum[8,16]            | string                  |                   |                                                                                                             |
| Date                  | datetime.date           | int               | ClickHouse는 Date를 1970년 01/01 이후 경과한 일(day) 수로 저장합니다. int 타입 값은 이 「epoch 날짜」 값으로 간주됩니다 |
| Date32                | datetime.date           | int               | Date와 동일하지만, 더 넓은 날짜 범위를 지원합니다                                                           |
| DateTime              | datetime.datetime       | int               | ClickHouse는 DateTime을 epoch 초(second)로 저장합니다. int 타입 값은 이 「epoch 초」 값으로 간주됩니다       |
| DateTime64            | datetime.datetime       | int               | Python `datetime.datetime`은 마이크로초 정밀도까지로 제한됩니다. 원시 64비트 int 값을 그대로 사용할 수 있습니다 |
| Time                  | datetime.timedelta      | int, string, time | ClickHouse는 DateTime을 epoch 초(second)로 저장합니다. int 타입 값은 이 「epoch 초」 값으로 간주됩니다       |
| Time64                | datetime.timedelta      | int, string, time | Python `datetime.timedelta`은 마이크로초 정밀도까지로 제한됩니다. 원시 64비트 int 값을 그대로 사용할 수 있습니다 |
| IPv4                  | `ipaddress.IPv4Address` | string            | 올바른 형식의 문자열을 IPv4 주소로 삽입할 수 있습니다                                                      |
| IPv6                  | `ipaddress.IPv6Address` | string            | 올바른 형식의 문자열을 IPv6 주소로 삽입할 수 있습니다                                                      |
| Tuple                 | dict 또는 tuple         |                   |                                                                                                             |
| Map                   | dict                    |                   |                                                                                                             |
| Nested                | Sequence[dict]          |                   |                                                                                                             |
| UUID                  | uuid.UUID               | string            | 올바른 형식의 문자열을 ClickHouse UUID로 삽입할 수 있습니다                                                 |
| JSON/Object('json')   | dict                    | string            | dict 또는 JSON 문자열을 JSON 컬럼에 삽입할 수 있습니다 (`Object('json')`은 더 이상 사용되지 않습니다)        |
| Variant               | object                  |                   | 현재 모든 Variant 값은 String으로 삽입되며 ClickHouse 서버에 의해 파싱됩니다                               |
| Dynamic               | object                  |                   | 경고 — 현재 Dynamic 컬럼으로의 모든 insert 작업 결과는 ClickHouse String으로 영구 저장됩니다               |

### Specialized insert methods \{#specialized-insert-methods\}

ClickHouse Connect는 일반적인 데이터 형식에 대해 특화된 insert 메서드를 제공합니다:

- `insert_df` -- Pandas DataFrame을 삽입합니다. Python Sequence of Sequences인 `data` 인자를 사용하는 대신, 이 메서드의 두 번째 파라미터로는 `df` 인자를 사용해야 하며, 이는 반드시 Pandas DataFrame 인스턴스여야 합니다. ClickHouse Connect는 DataFrame을 컬럼 지향 데이터 소스로 자동 처리하므로 `column_oriented` 파라미터는 필요하지도 않고 사용할 수도 없습니다.
- `insert_arrow` -- PyArrow Table을 삽입합니다. ClickHouse Connect는 Arrow 테이블을 수정하지 않은 상태로 ClickHouse 서버에 그대로 전달하여 처리하므로, `table` 및 `arrow_table` 외에 사용할 수 있는 인자는 `database`와 `settings`뿐입니다.
- `insert_df_arrow` -- Arrow를 백엔드로 사용하는 Pandas DataFrame 또는 Polars DataFrame을 삽입합니다. ClickHouse Connect는 DataFrame이 Pandas 타입인지 Polars 타입인지 자동으로 판별합니다. Pandas인 경우, 각 컬럼의 dtype 백엔드가 Arrow 기반인지 검증하며, 그렇지 않은 컬럼이 하나라도 있으면 오류를 발생시킵니다.

:::note
NumPy 배열은 유효한 Sequence of Sequences이므로 기본 `insert` 메서드의 `data` 인자로 사용할 수 있으며, 따라서 별도의 특화 메서드는 필요하지 않습니다.
:::

#### Pandas DataFrame 삽입 \{#pandas-dataframe-insert\}

```python
import clickhouse_connect
import pandas as pd

client = clickhouse_connect.get_client()

df = pd.DataFrame({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Joe"],
    "age": [25, 30, 28],
})

client.insert_df("users", df)
```


#### PyArrow 테이블 삽입 \{#pyarrow-table-insert\}

```python
import clickhouse_connect
import pyarrow as pa

client = clickhouse_connect.get_client()

arrow_table = pa.table({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Joe"],
    "age": [25, 30, 28],
})

client.insert_arrow("users", arrow_table)
```


#### Arrow 기반 DataFrame 삽입 (pandas 2.x) \{#arrow-backed-dataframe-insert-pandas-2\}

```python
import clickhouse_connect
import pandas as pd

client = clickhouse_connect.get_client()

# Convert to Arrow-backed dtypes for better performance
df = pd.DataFrame({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Joe"],
    "age": [25, 30, 28],
}).convert_dtypes(dtype_backend="pyarrow")

client.insert_df_arrow("users", df)
```


### 시간대 \{#time-zones\}

Python `datetime.datetime` 객체를 ClickHouse `DateTime` 또는 `DateTime64` 컬럼에 삽입할 때 ClickHouse Connect는 시간대 정보를 자동으로 처리합니다. ClickHouse는 모든 DateTime 값을 내부적으로 시간대 정보가 없는 Unix 타임스탬프(에포크 이후의 초 또는 소수 초 단위 값)로 저장하므로, 삽입 시 클라이언트 측에서 시간대 변환이 자동으로 수행됩니다.

#### 타임존 인식 datetime 객체 \{#timezone-aware-datetime-objects\}

타임존 정보가 포함된 Python `datetime.datetime` 객체를 삽입하면 ClickHouse Connect는 자동으로 `.timestamp()`를 호출하여 이를 Unix 타임스탬프로 변환합니다. 이때 타임존 오프셋이 올바르게 반영됩니다. 따라서 어떤 타임존의 datetime 객체든 삽입할 수 있으며, 해당 시점이 UTC에 해당하는 타임스탬프로 정확하게 저장됩니다.

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
client.command("CREATE TABLE events (event_time DateTime) ENGINE Memory")

# Insert timezone-aware datetime objects
denver_tz = pytz.timezone('America/Denver')
tokyo_tz = pytz.timezone('Asia/Tokyo')

data = [
    [datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)],
    [denver_tz.localize(datetime(2023, 6, 15, 10, 30, 0))],
    [tokyo_tz.localize(datetime(2023, 6, 15, 10, 30, 0))]
]

client.insert('events', data, column_names=['event_time'])
results = client.query("SELECT * from events")
print(*results.result_rows, sep="\n")
# Output:
# (datetime.datetime(2023, 6, 15, 10, 30),)
# (datetime.datetime(2023, 6, 15, 16, 30),)
# (datetime.datetime(2023, 6, 15, 1, 30),)
```

이 예에서 세 개의 datetime 객체는 서로 다른 타임존을 가지므로 서로 다른 시점을 나타냅니다. 각 객체는 해당 Unix 타임스탬프로 정확하게 변환되어 ClickHouse에 저장됩니다.

:::note
pytz를 사용할 때는 `localize()` 메서드를 사용하여 타임존 정보를 naive datetime에 설정해야 합니다. `tzinfo=`를 datetime 생성자에 직접 전달하면 과거 시점에 대해 잘못된 오프셋이 적용됩니다. UTC의 경우 `tzinfo=pytz.UTC`는 올바르게 동작합니다. 자세한 내용은 [pytz 문서](https://pythonhosted.org/pytz/#localized-times-and-date-arithmetic)를 참고하십시오.
:::


#### 타임존 정보가 없는 datetime 객체 \{#timezone-naive-datetime-objects\}

타임존 정보가 없는 (`tzinfo`가 없는) Python `datetime.datetime` 객체를 삽입하면, `.timestamp()` 메서드는 해당 객체를 시스템의 로컬 타임존으로 해석합니다. 모호성을 피하기 위해 다음과 같은 방법을 권장합니다:

1. 데이터 삽입 시 항상 타임존 정보가 있는(timezone-aware) datetime 객체를 사용하십시오.
2. 시스템 타임존을 UTC로 설정하십시오.
3. 삽입 전에 수동으로 epoch 타임스탬프로 변환하십시오.

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()

# Recommended: Always use timezone-aware datetimes
utc_time = datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)
client.insert('events', [[utc_time]], column_names=['event_time'])

# Alternative: Convert to epoch timestamp manually
naive_time = datetime(2023, 6, 15, 10, 30, 0)
epoch_timestamp = int(naive_time.replace(tzinfo=pytz.UTC).timestamp())
client.insert('events', [[epoch_timestamp]], column_names=['event_time'])
```


#### 타임존 메타데이터가 있는 DateTime 컬럼 \{#datetime-columns-with-timezone-metadata\}

ClickHouse 컬럼은 타임존 메타데이터와 함께 정의할 수 있습니다(예: `DateTime('America/Denver')` 또는 `DateTime64(3, 'Asia/Tokyo')`). 이 메타데이터는 데이터가 저장되는 방식(여전히 UTC 타임스탬프로 저장됨)에는 영향을 주지 않지만, ClickHouse에서 데이터를 다시 쿼리할 때 어떤 타임존을 사용할지를 제어합니다.

이러한 컬럼에 데이터를 삽입할 때 ClickHouse Connect는 Python datetime을 Unix 타임스탬프로 변환합니다(존재하는 경우 해당 datetime의 타임존을 반영합니다). 데이터를 다시 쿼리하면 ClickHouse Connect는 삽입 시 사용한 타임존과 관계없이 해당 컬럼의 타임존으로 변환된 datetime을 반환합니다.

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()

# Create table with Los Angeles timezone metadata
client.command("CREATE TABLE events (event_time DateTime('America/Los_Angeles')) ENGINE Memory")

# Insert a New York time (10:30 AM EDT, which is 14:30 UTC)
ny_tz = pytz.timezone("America/New_York")
data = ny_tz.localize(datetime(2023, 6, 15, 10, 30, 0))
client.insert("events", [[data]], column_names=["event_time"])

# When queried back, the time is automatically converted to Los Angeles timezone
# 10:30 AM New York (UTC-4) = 14:30 UTC = 7:30 AM Los Angeles (UTC-7)
results = client.query("select * from events")
print(*results.result_rows, sep="\n")
# Output:
# (datetime.datetime(2023, 6, 15, 7, 30, tzinfo=<DstTzInfo 'America/Los_Angeles' PDT-1 day, 17:00:00 DST>),)
```


## 파일 삽입 \{#file-inserts\}

`clickhouse_connect.driver.tools` 패키지에는 파일 시스템에서 기존 ClickHouse 테이블로 데이터를 직접 삽입할 수 있게 해 주는 `insert_file` 메서드가 포함되어 있습니다. 파싱은 ClickHouse 서버에서 처리합니다. `insert_file`은 다음 매개변수를 사용합니다:

| Parameter        | Type            | Default           | Description                                                                                                |
| ---------------- | --------------- | ----------------- | ---------------------------------------------------------------------------------------------------------- |
| client           | Client          | *Required*        | 삽입을 수행하는 데 사용되는 `driver.Client`                                                                            |
| table            | str             | *Required*        | 데이터를 삽입할 ClickHouse 테이블입니다. 데이터베이스를 포함한 전체 테이블 이름을 사용할 수 있습니다.                                             |
| file&#95;path    | str             | *Required*        | 데이터 파일의 로컬 파일 시스템 경로                                                                                       |
| fmt              | str             | CSV, CSVWithNames | 파일의 ClickHouse Input Format입니다. `column_names`가 제공되지 않으면 CSVWithNames로 간주합니다                               |
| column&#95;names | Sequence of str | *None*            | 데이터 파일에 있는 컬럼 이름 목록입니다. 컬럼 이름을 포함하는 형식에서는 필수 항목이 아닙니다                                                      |
| database         | str             | *None*            | 테이블이 속한 데이터베이스입니다. 테이블 이름이 완전한 이름(fully qualified)인 경우에는 이 값은 무시됩니다. 지정하지 않으면 클라이언트의 기본 데이터베이스를 사용하여 삽입합니다 |
| settings         | dict            | *None*            | [settings 설명](driver-api.md#settings-argument)을 참조하십시오.                                                    |
| compression      | str             | *None*            | Content-Encoding HTTP 헤더에 사용되는, ClickHouse에서 인식되는 압축 타입(zstd, lz4, gzip)입니다                                |

데이터가 불규칙하거나 날짜/시간 값의 형식이 일반적이지 않은 파일의 경우, `input_format_allow_errors_num` 및 `input_format_allow_errors_num`과 같이 데이터 가져오기(import)에 적용되는 settings가 이 메서드에도 동일하게 적용됩니다.

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```
