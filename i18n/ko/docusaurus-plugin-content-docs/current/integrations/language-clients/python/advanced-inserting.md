---
'sidebar_label': '고급 삽입'
'sidebar_position': 5
'keywords':
- 'clickhouse'
- 'python'
- 'insert'
- 'advanced'
'description': 'ClickHouse Connect와 함께하는 고급 삽입'
'slug': '/integrations/language-clients/python/advanced-inserting'
'title': '고급 삽입'
'doc_type': 'reference'
---

## ClickHouse Connect를 통한 데이터 삽입: 고급 사용법 {#inserting-data-with-clickhouse-connect--advanced-usage}

### InsertContexts {#insertcontexts}

ClickHouse Connect는 모든 삽입을 `InsertContext` 내에서 실행합니다. `InsertContext`는 클라이언트 `insert` 메서드에 인수로 전달된 모든 값을 포함합니다. 또한, `InsertContext`가 원래 생성될 때, ClickHouse Connect는 효율적인 네이티브 형식 삽입을 위해 필요한 삽입 컬럼의 데이터 유형을 가져옵니다. `InsertContext`를 여러 삽입에 재사용하면 이 "프리 쿼리"를 피할 수 있으며, 삽입이 더 빠르고 효율적으로 실행됩니다.

`InsertContext`는 클라이언트 `create_insert_context` 메서드를 사용하여 획득할 수 있습니다. 이 메서드는 `insert` 함수와 동일한 인수를 사용합니다. 재사용을 위해서는 `InsertContext`의 `data` 속성만 수정해야 합니다. 이는 동일한 테이블에 새로운 데이터를 반복적으로 삽입하기 위해 재사용 가능한 객체를 제공하는 의도와 일치합니다.

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

`InsertContext`는 삽입 과정 중 업데이트되는 변경 가능한 상태를 포함하므로 스레드 안전하지 않습니다.

### 쓰기 형식 {#write-formats}
쓰기 형식은 현재 제한된 수의 유형에 대해 구현되어 있습니다. 대부분의 경우 ClickHouse Connect는 첫 번째 (널이 아닌) 데이터 값의 유형을 확인하여 컬럼에 대한 올바른 쓰기 형식을 자동으로 결정하려고 시도합니다. 예를 들어, `DateTime` 컬럼에 삽입을 하는 경우, 컬럼의 첫 번째 삽입 값이 Python 정수라면 ClickHouse Connect는 그것이 실제로는 epoch 초라는 가정 하에 정수 값을 직접 삽입합니다.

대부분의 경우 데이터 유형에 대해 쓰기 형식을 재정의할 필요는 없지만, `clickhouse_connect.datatypes.format` 패키지의 관련 메서드를 사용하여 전역 수준에서 설정할 수 있습니다.

#### 쓰기 형식 옵션 {#write-format-options}

| ClickHouse 유형       | 네이티브 Python 유형      | 쓰기 형식     | 비고                                                                                                    |
|-----------------------|-------------------------|-------------------|-------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                             |
| UInt64                | int                     |                   |                                                                                                             |
| [U]Int[128,256]       | int                     |                   |                                                                                                             |
| BFloat16              | float                   |                   |                                                                                                             |
| Float32               | float                   |                   |                                                                                                             |
| Float64               | float                   |                   |                                                                                                             |
| Decimal               | decimal.Decimal         |                   |                                                                                                             |
| String                | string                  |                   |                                                                                                             |
| FixedString           | bytes                   | string            | 문자열로 삽입할 경우, 추가 바이트는 0으로 설정됩니다.                                                      |
| Enum[8,16]            | string                  |                   |                                                                                                             |
| Date                  | datetime.date           | int               | ClickHouse는 날짜를 1970/01/01 이후 날짜로 저장합니다. int 유형은 이 "epoch 날짜" 값으로 간주됩니다.      |
| Date32                | datetime.date           | int               | Date와 동일하지만 더 넓은 범위의 날짜에 대해 사용됩니다.                                                 |
| DateTime              | datetime.datetime       | int               | ClickHouse는 DateTime을 epoch 초로 저장합니다. int 유형은 이 "epoch 초" 값으로 간주됩니다.               |
| DateTime64            | datetime.datetime       | int               | Python datetime.datetime은 마이크로초 정밀도로 제한됩니다. 원시 64비트 정수 값이 사용 가능합니다.         |
| Time                  | datetime.timedelta      | int, string, time | ClickHouse는 DateTime을 epoch 초로 저장합니다. int 유형은 이 "epoch 초" 값으로 간주됩니다.               |
| Time64                | datetime.timedelta      | int, string, time | Python datetime.timedelta는 마이크로초 정밀도로 제한됩니다. 원시 64비트 정수 값이 사용 가능합니다.       |
| IPv4                  | `ipaddress.IPv4Address` | string            | 적절히 포맷된 문자열은 IPv4 주소로 삽입될 수 있습니다.                                                   |
| IPv6                  | `ipaddress.IPv6Address` | string            | 적절히 포맷된 문자열은 IPv6 주소로 삽입될 수 있습니다.                                                   |
| Tuple                 | dict 또는 tuple         |                   |                                                                                                             |
| Map                   | dict                    |                   |                                                                                                             |
| Nested                | Sequence[dict]          |                   |                                                                                                             |
| UUID                  | uuid.UUID               | string            | 적절히 포맷된 문자열은 ClickHouse UUID로 삽입될 수 있습니다.                                             |
| JSON/Object('json')   | dict                    | string            | JSON 컬럼에 사전 또는 JSON 문자열을 삽입할 수 있습니다 (note `Object('json')`은 더 이상 사용되지 않습니다). |
| Variant               | object                  |                   | 현재 모든 변형은 문자열로 삽입되며 ClickHouse 서버에 의해 구문 분석됩니다.                              |
| Dynamic               | object                  |                   | 경고 - 현재 Dynamic 컬럼에 대한 삽입은 ClickHouse 문자열로 영구 저장됩니다.                               |

### 특화된 삽입 메서드 {#specialized-insert-methods}

ClickHouse Connect는 일반 데이터 형식을 위한 특화된 삽입 메서드를 제공합니다:

- `insert_df` -- Pandas DataFrame을 삽입합니다. Python Sequence of Sequences `data` 인수 대신 이 메서드의 두 번째 매개변수는 Pandas DataFrame 인스턴스인 `df` 인수가 필요합니다. ClickHouse Connect는 DataFrame을 컬럼 지향 데이터 소스로 자동으로 처리하므로 `column_oriented` 매개변수는 필요하지 않거나 사용할 수 없습니다.
- `insert_arrow` -- PyArrow 테이블을 삽입합니다. ClickHouse Connect는 수정되지 않은 Arrow 테이블을 ClickHouse 서버에 전달하여 처리하므로 `table` 및 `arrow_table` 외에 `database` 및 `settings` 인수만 사용할 수 있습니다.
- `insert_df_arrow` -- Arrow 기반의 Pandas DataFrame 또는 Polars DataFrame을 삽입합니다. ClickHouse Connect는 DataFrame이 Pandas 또는 Polars 유형인지 자동으로 결정합니다. Pandas일 경우, 각 컬럼의 dtype 백엔드가 Arrow 기반인지 검증하며, 그렇지 않으면 오류가 발생합니다.

:::note
NumPy 배열은 유효한 Sequence of Sequences이며, 메인 `insert` 메서드에 대한 `data` 인수로 사용할 수 있으므로 특화된 메서드는 필요하지 않습니다.
:::

#### Pandas DataFrame 삽입 {#pandas-dataframe-insert}

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

#### PyArrow 테이블 삽입 {#pyarrow-table-insert}

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

#### Arrow 기반 DataFrame 삽입 (pandas 2.x) {#arrow-backed-dataframe-insert-pandas-2}

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

### 시간대 {#time-zones}

Python `datetime.datetime` 객체를 ClickHouse `DateTime` 또는 `DateTime64` 컬럼에 삽입할 때, ClickHouse Connect는 자동으로 시간대 정보를 처리합니다. ClickHouse는 모든 DateTime 값을 내부적으로 시간대가 없는 Unix 타임스탬프(epoch 이후의 초 또는 분수 초)로 저장하므로, 시간대 변환은 삽입 중 클라이언트 측에서 자동으로 이루어집니다.

#### 시간대 인식 datetime 객체 {#timezone-aware-datetime-objects}

시간대 인식 Python `datetime.datetime` 객체를 삽입하면 ClickHouse Connect는 자동으로 `.timestamp()`를 호출하여 Unix 타임스탬프로 변환합니다. 이때 시간대 오프셋이 올바르게 고려됩니다. 이는 어떤 시간대에서든 datetime 객체를 삽입할 수 있으며, 올바르게 UTC에 해당하는 타임스탬프으로 저장된다는 것을 의미합니다.

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

이 예에서 세 개의 datetime 객체는 서로 다른 시간대를 가지고 있으므로 서로 다른 시간 지점을 나타냅니다. 각 객체는 자신의 Unix 타임스탬프로 올바르게 변환되어 ClickHouse에 저장됩니다.

:::note
pytz를 사용할 경우, 시간대 정보를 naive datetime에 붙이기 위해 `localize()` 메서드를 사용해야 합니다. `tzinfo=`를 datetime 생성자에 직접 전달하면 잘못된 역사적 오프셋이 사용됩니다. UTC의 경우, `tzinfo=pytz.UTC`가 올바르게 작동합니다. 자세한 내용은 [pytz docs](https://pythonhosted.org/pytz/#localized-times-and-date-arithmetic)를 참조하십시오.
:::

#### 시간대 비인식 datetime 객체 {#timezone-naive-datetime-objects}

시간대 비인식 Python `datetime.datetime` 객체(즉, `tzinfo`가 없는 객체)를 삽입하면 `.timestamp()` 메서드는 이를 시스템의 로컬 시간대로 해석합니다. 모호성을 피하기 위해 다음을 권장합니다:

1. 삽입 시 항상 시간대 인식 datetime 객체를 사용하거나,
2. 시스템의 시간대가 UTC로 설정되어 있는지 확인하거나,
3. 삽입 전에 수동으로 epoch 타임스탬프으로 변환합니다.

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

#### 시간대 메타데이터가 있는 DateTime 컬럼 {#datetime-columns-with-timezone-metadata}

ClickHouse 컬럼은 시간대 메타데이터로 정의될 수 있습니다(예: `DateTime('America/Denver')` 또는 `DateTime64(3, 'Asia/Tokyo')`). 이 메타데이터는 데이터가 저장되는 방식(여전히 UTC 타임스탬프)에는 영향을 미치지 않지만, ClickHouse에서 데이터 쿼리 시 어떤 시간대가 사용되는지를 제어합니다.

이러한 컬럼에 삽입할 때 ClickHouse Connect는 Python datetime을 Unix 타임스탬프로 변환합니다(시간대가 있을 경우 이를 고려). 데이터를 조회할 때 ClickHouse Connect는 삽입 시 사용한 시간대와 관계없이 컬럼의 시간대에 맞게 변환된 datetime을 반환합니다.

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

## 파일 삽입 {#file-inserts}

`clickhouse_connect.driver.tools` 패키지에는 파일 시스템에서 기존 ClickHouse 테이블로 데이터를 직접 삽입할 수 있는 `insert_file` 메서드가 포함되어 있습니다. 구문 분석은 ClickHouse 서버에 위임됩니다. `insert_file`은 다음 매개변수를 받습니다:

| 매개변수    | 유형            | 기본값           | 설명                                                                                                               |
|--------------|-----------------|-------------------|---------------------------------------------------------------------------------------------------------------------------|
| client       | Client          | *필수*            | 삽입을 수행하는 `driver.Client`                                                                                       |
| table        | str             | *필수*            | 삽입할 ClickHouse 테이블. 데이터베이스를 포함한 전체 테이블 이름이 허용됩니다.                                            |
| file_path    | str             | *필수*            | 데이터 파일의 네이티브 파일 시스템 경로                                                                               |
| fmt          | str             | CSV, CSVWithNames | 파일의 ClickHouse 입력 형식. `column_names`가 제공되지 않은 경우 CSVWithNames로 간주됩니다.                           |
| column_names | Sequence of str | *없음*            | 데이터 파일의 컬럼 이름 목록. 컬럼 이름을 포함하는 형식에 대해서는 필요하지 않습니다.                                    |
| database     | str             | *없음*            | 테이블의 데이터베이스. 테이블이 완전히 정격화되면 무시됩니다. 지정되지 않으면 삽입은 클라이언트 데이터베이스를 사용합니다. |
| settings     | dict            | *없음*            | [설정 설명](driver-api.md#settings-argument) 참조.                                                                        |
| compression  | str             | *없음*            | Content-Encoding HTTP 헤더에 사용되는 인정된 ClickHouse 압축 유형(zstd, lz4, gzip)                                     |

데이터가 일관되지 않거나 비정상적인 형식의 날짜/시간 값이 포함된 파일의 경우, 데이터 가져오기 시 적용되는 설정(`input_format_allow_errors_num` 및 `input_format_allow_errors_num`)이 이 메서드에서 인식됩니다.

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```
