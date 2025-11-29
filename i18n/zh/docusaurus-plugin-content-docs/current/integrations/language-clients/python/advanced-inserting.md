---
sidebar_label: '高级插入'
sidebar_position: 5
keywords: ['clickhouse', 'python', 'insert', 'advanced']
description: '使用 ClickHouse Connect 的高级插入'
slug: /integrations/language-clients/python/advanced-inserting
title: '高级插入'
doc_type: 'reference'
---

## 使用 ClickHouse Connect 插入数据：进阶用法 {#inserting-data-with-clickhouse-connect--advanced-usage}

### InsertContexts {#insertcontexts}

ClickHouse Connect 在执行所有插入操作时都会在一个 `InsertContext` 中完成。`InsertContext` 包含了作为参数传递给客户端 `insert` 方法的所有值。此外，在最初构造 `InsertContext` 时，ClickHouse Connect 会获取插入列的数据类型，以便高效地执行使用 Native 格式的插入操作。通过在多次插入中重用同一个 `InsertContext`，可以避免这一步“预查询”，从而更快速、更高效地执行插入。

可以通过客户端的 `create_insert_context` 方法获取一个 `InsertContext`。该方法接受与 `insert` 函数相同的参数。请注意，为了复用，只有 `InsertContext` 的 `data` 属性应当被修改。这与其预期用途是一致的：为向同一张表重复插入新数据提供一个可复用的对象。

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

`InsertContext` 包含在插入过程中会被更新的可变状态，因此并不是线程安全的。


### 写入格式 {#write-formats}

当前仅对少量类型实现了写入格式支持。在大多数情况下，ClickHouse Connect 会尝试通过检查首个（非空）数据值的类型，自动推断列的正确写入格式。举例来说，如果要向 `DateTime` 列插入数据，并且该列的第一个插入值是一个 Python 整数，ClickHouse Connect 会在假定该值实际表示 Unix epoch 秒数的前提下，直接插入该整数值。

在大多数情况下，无需为某个数据类型显式指定写入格式，但可以使用 `clickhouse_connect.datatypes.format` 包中的相关方法在全局范围内进行重定义。

#### 写入格式选项 {#write-format-options}

| ClickHouse Type       | 原生 Python 类型        | 写入格式         | 备注                                                                                                        |
|-----------------------|-------------------------|-------------------|-------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                             |
| UInt64                | int                     |                   |                                                                                                             |
| [U]Int[128,256]       | int                     |                   |                                                                                                             |
| BFloat16              | float                   |                   |                                                                                                             |
| Float32               | float                   |                   |                                                                                                             |
| Float64               | float                   |                   |                                                                                                             |
| Decimal               | decimal.Decimal         |                   |                                                                                                             |
| String                | string                  |                   |                                                                                                             |
| FixedString           | bytes                   | string            | 如果以字符串形式插入，额外的字节将被填充为 0                                                               |
| Enum[8,16]            | string                  |                   |                                                                                                             |
| Date                  | datetime.date           | int               | ClickHouse 将 Date 以自 1970-01-01 起的天数存储。int 类型将被视为该“纪元日期”值                             |
| Date32                | datetime.date           | int               | 与 Date 相同，但支持更宽范围的日期                                                                         |
| DateTime              | datetime.datetime       | int               | ClickHouse 将 DateTime 以纪元秒存储。int 类型将被视为该“纪元秒”值                                          |
| DateTime64            | datetime.datetime       | int               | Python `datetime.datetime` 仅支持微秒精度。可使用原始 64 位 int 值                                         |
| Time                  | datetime.timedelta      | int, string, time | ClickHouse 将 DateTime 以纪元秒存储。int 类型将被视为该“纪元秒”值                                          |
| Time64                | datetime.timedelta      | int, string, time | Python `datetime.timedelta` 仅支持微秒精度。可使用原始 64 位 int 值                                        |
| IPv4                  | `ipaddress.IPv4Address` | string            | 可插入格式正确的字符串作为 IPv4 地址                                                                       |
| IPv6                  | `ipaddress.IPv6Address` | string            | 可插入格式正确的字符串作为 IPv6 地址                                                                       |
| Tuple                 | dict or tuple           |                   |                                                                                                             |
| Map                   | dict                    |                   |                                                                                                             |
| Nested                | Sequence[dict]          |                   |                                                                                                             |
| UUID                  | uuid.UUID               | string            | 可插入格式正确的字符串作为 ClickHouse UUID                                                                 |
| JSON/Object('json')   | dict                    | string            | 可以将字典或 JSON 字符串插入到 JSON 列中（注意 `Object('json')` 已被弃用）                                 |
| Variant               | object                  |                   | 当前所有 Variant 值都以字符串形式插入，并由 ClickHouse 服务器解析                                          |
| Dynamic               | object                  |                   | 警告 —— 当前对 Dynamic 列的任何插入都会以 ClickHouse String 类型持久化存储                                 |

### 专用插入方法 {#specialized-insert-methods}

ClickHouse Connect 为常见数据格式提供了专用插入方法：

- `insert_df` -- 插入一个 Pandas DataFrame。与向主 `insert` 方法传递一个「序列的序列」类型的 Python `data` 参数不同，此方法的第二个参数为 `df`，且必须是一个 Pandas DataFrame 实例。ClickHouse Connect 会自动将该 DataFrame 作为列式数据源进行处理，因此不需要也不提供 `column_oriented` 参数。
- `insert_arrow` -- 插入一个 PyArrow Table。ClickHouse Connect 会将 Arrow 表原样传递给 ClickHouse 服务器处理，因此除了 `table` 和 `arrow_table` 以外，只能额外指定 `database` 和 `settings` 参数。
- `insert_df_arrow` -- 插入一个以 Arrow 为后端的 Pandas DataFrame 或一个 Polars DataFrame。ClickHouse Connect 会自动判断该 DataFrame 是 Pandas 类型还是 Polars 类型。如果是 Pandas，将执行校验以确保每一列的 dtype 后端都是基于 Arrow 的，否则将抛出错误。

:::note
NumPy 数组是一个有效的「序列的序列」（Sequence of Sequences），可以作为主 `insert` 方法的 `data` 参数使用，因此不需要专用方法。
:::

#### 在 Pandas DataFrame 中插入数据 {#pandas-dataframe-insert}

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


#### PyArrow 表插入 {#pyarrow-table-insert}

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


#### 基于 Arrow 的 DataFrame 插入（pandas 2.x） {#arrow-backed-dataframe-insert-pandas-2}

```python
import clickhouse_connect
import pandas as pd

client = clickhouse_connect.get_client()

# 转换为 Arrow 支持的数据类型以提升性能 {#convert-to-arrow-backed-dtypes-for-better-performance}
df = pd.DataFrame({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Joe"],
    "age": [25, 30, 28],
}).convert_dtypes(dtype_backend="pyarrow")

client.insert_df_arrow("users", df)
```


### 时区 {#time-zones}

当将 Python 的 `datetime.datetime` 对象插入到 ClickHouse 的 `DateTime` 或 `DateTime64` 列中时，ClickHouse Connect 会自动处理时区信息。由于 ClickHouse 在内部将所有 DateTime 值存储为不带时区信息的 Unix 时间戳（自 Unix 纪元起的秒数或其小数部分），因此在插入时，时区转换会在客户端自动完成。

#### 带有时区信息的 datetime 对象 {#timezone-aware-datetime-objects}

如果插入一个带有时区信息的 Python `datetime.datetime` 对象，ClickHouse Connect 会自动调用 `.timestamp()` 将其转换为 Unix 时间戳，并正确处理时区偏移。也就是说，可以插入任意时区的 datetime 对象，它们都会以对应的 UTC 等效时间戳被正确存储。

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
client.command("CREATE TABLE events (event_time DateTime) ENGINE Memory")

# 插入时区感知的 datetime 对象 {#insert-timezone-aware-datetime-objects}
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
# 输出： {#output}
# (datetime.datetime(2023, 6, 15, 10, 30),) {#datetimedatetime2023-6-15-10-30}
# (datetime.datetime(2023, 6, 15, 16, 30),) {#datetimedatetime2023-6-15-16-30}
# (datetime.datetime(2023, 6, 15, 1, 30),) {#datetimedatetime2023-6-15-1-30}
```

在这个示例中，这三个 datetime 对象由于处于不同时区，分别表示不同的时间点。每个对象都会被正确转换为对应的 Unix 时间戳并存储到 ClickHouse 中。

:::note
使用 pytz 时，必须通过 `localize()` 方法为一个“朴素”（naive）的 datetime 对象附加时区信息。直接向 datetime 构造函数传入 `tzinfo=` 会导致使用错误的历史偏移量。对于 UTC，`tzinfo=pytz.UTC` 可以正常工作。更多信息请参阅 [pytz 文档](https://pythonhosted.org/pytz/#localized-times-and-date-arithmetic)。
:::


#### 不含时区信息的 datetime 对象 {#timezone-naive-datetime-objects}

如果你插入一个不含时区信息的 Python `datetime.datetime` 对象（即没有 `tzinfo`），`.timestamp()` 方法会将其按系统本地时区进行解释。为避免歧义，建议：

1. 插入数据时始终使用带时区信息的 datetime 对象，或
2. 确保系统时区设置为 UTC，或
3. 在插入前手动转换为 Unix（epoch）时间戳

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()

# 推荐做法：始终使用带时区信息的 datetime 对象 {#recommended-always-use-timezone-aware-datetimes}
utc_time = datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)
client.insert('events', [[utc_time]], column_names=['event_time'])

# 替代方法：手动转换为 epoch 时间戳 {#alternative-convert-to-epoch-timestamp-manually}
naive_time = datetime(2023, 6, 15, 10, 30, 0)
epoch_timestamp = int(naive_time.replace(tzinfo=pytz.UTC).timestamp())
client.insert('events', [[epoch_timestamp]], column_names=['event_time'])
```


#### 带有时区元数据的 DateTime 列 {#datetime-columns-with-timezone-metadata}

ClickHouse 列可以定义时区元数据（例如 `DateTime('America/Denver')` 或 `DateTime64(3, 'Asia/Tokyo')`）。这些元数据本身不会影响数据的存储方式（仍然以 UTC 时间戳存储），但会控制从 ClickHouse 查询数据时所使用的时区。

向此类列插入数据时，ClickHouse Connect 会将 Python 的 datetime 对象转换为 Unix 时间戳（如果该对象带有时区信息，则会考虑该时区）。当你查询这些数据时，ClickHouse Connect 会将 datetime 转换为该列所定义的时区后返回，而不管你在插入时使用的是哪个时区。

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()

# 创建带有洛杉矶时区元数据的表 {#create-table-with-los-angeles-timezone-metadata}
client.command("CREATE TABLE events (event_time DateTime('America/Los_Angeles')) ENGINE Memory")

# 插入纽约时间(东部夏令时上午 10:30,即 UTC 14:30) {#insert-a-new-york-time-1030-am-edt-which-is-1430-utc}
ny_tz = pytz.timezone("America/New_York")
data = ny_tz.localize(datetime(2023, 6, 15, 10, 30, 0))
client.insert("events", [[data]], column_names=["event_time"])

# 查询时,时间会自动转换为洛杉矶时区 {#when-queried-back-the-time-is-automatically-converted-to-los-angeles-timezone}
# 纽约上午 10:30(UTC-4)= UTC 14:30 = 洛杉矶上午 7:30(UTC-7) {#1030-am-new-york-utc-4-1430-utc-730-am-los-angeles-utc-7}
results = client.query("select * from events")
print(*results.result_rows, sep="\n")
# 输出: {#output}
# (datetime.datetime(2023, 6, 15, 7, 30, tzinfo=<DstTzInfo 'America/Los_Angeles' PDT-1 day, 17:00:00 DST>),) {#datetimedatetime2023-6-15-7-30-tzinfodsttzinfo-americalos_angeles-pdt-1-day-170000-dst}
```


## 文件插入 {#file-inserts}

`clickhouse_connect.driver.tools` 包中包含 `insert_file` 方法，可将数据直接从文件系统插入到现有的 ClickHouse 表中。数据解析由 ClickHouse 服务器负责。`insert_file` 接受以下参数：

| Parameter        | Type            | Default           | Description                                                              |
| ---------------- | --------------- | ----------------- | ------------------------------------------------------------------------ |
| client           | Client          | *Required*        | 用于执行插入操作的 `driver.Client`                                                |
| table            | str             | *Required*        | 要插入数据的 ClickHouse 表。允许使用完整表名（包括数据库名）。                                    |
| file&#95;path    | str             | *Required*        | 数据文件在本地文件系统中的路径                                                          |
| fmt              | str             | CSV, CSVWithNames | 文件的 ClickHouse 输入格式（Input Format）。如果未提供 `column_names`，则默认为 CSVWithNames |
| column&#95;names | Sequence of str | *None*            | 数据文件中的列名列表。对于自身包含列名的格式则不必提供                                              |
| database         | str             | *None*            | 表所在的数据库。如果表名已完全限定则忽略此参数。若未指定，则插入操作将使用 client 的数据库                        |
| settings         | dict            | *None*            | 参见[设置说明](driver-api.md#settings-argument)。                               |
| compression      | str             | *None*            | 用于 Content-Encoding HTTP 头的受支持的 ClickHouse 压缩类型（zstd、lz4、gzip）           |

对于数据不一致或日期/时间值采用非常规格式的文件，此方法同样识别适用于数据导入的相关设置（例如 `input_format_allow_errors_num` 和 `input_format_allow_errors_num`）。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```
