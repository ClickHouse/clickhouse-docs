---
sidebar_label: '进阶插入'
sidebar_position: 5
keywords: ['clickhouse', 'python', 'insert', 'advanced']
description: '使用 ClickHouse Connect 实现进阶插入'
slug: /integrations/language-clients/python/advanced-inserting
title: '进阶插入'
doc_type: 'reference'
---



## 使用 ClickHouse Connect 插入数据：高级用法

### InsertContexts

ClickHouse Connect 会在 `InsertContext` 中执行所有插入操作。`InsertContext` 包含通过客户端 `insert` 方法传入的所有参数值。此外，在最初构造 `InsertContext` 时，ClickHouse Connect 会获取要插入列的数据类型，以便高效地使用 Native 格式进行插入。通过在多次插入时复用同一个 `InsertContext`，可以避免这一步“预查询”，从而更快速、更高效地执行插入。

可以使用客户端的 `create_insert_context` 方法获取一个 `InsertContext`。该方法接受与 `insert` 函数相同的参数。请注意，在复用时只应修改 `InsertContext` 的 `data` 属性。这也与其设计初衷保持一致，即为对同一张表重复插入新数据提供一个可重用的对象。

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

`InsertContext` 包含在插入过程中会被更新的可变状态，因此不是线程安全的。

### 写入格式

当前仅为有限数量的类型实现了写入格式。在大多数情况下，ClickHouse Connect 会尝试通过检查第一个（非空）数据值的类型来自动确定列的正确写入格式。比如，如果向一个 `DateTime` 列插入数据，并且该列第一个插入值是一个 Python 整数，ClickHouse Connect 会直接插入该整数值，并假定它实际上表示一个以秒为单位的 Unix 时间戳（epoch second）。

在大多数情况下，无需为某个数据类型显式覆盖写入格式，但可以使用 `clickhouse_connect.datatypes.format` 包中的相关方法在全局范围内进行设置。

#### 写入格式选项


| ClickHouse Type             | Native Python Type      | Write Formats     | Comments                                                                       |
| --------------------------- | ----------------------- | ----------------- | ------------------------------------------------------------------------------ |
| Int[8-64], UInt[8-32]       | int                     | -                 |                                                                                |
| UInt64                      | int                     |                   |                                                                                |
| [U]Int[128,256]             | int                     |                   |                                                                                |
| BFloat16                    | float                   |                   |                                                                                |
| Float32                     | float                   |                   |                                                                                |
| Float64                     | float                   |                   |                                                                                |
| Decimal                     | decimal.Decimal         |                   |                                                                                |
| String                      | string                  |                   |                                                                                |
| FixedString                 | bytes                   | string            | 如果作为字符串插入，多余的字节会被置为 0                                                          |
| Enum[8,16]                  | string                  |                   |                                                                                |
| Date                        | datetime.date           | int               | ClickHouse 将 Date 存储为自 01/01/1970 起的天数。`int` 类型将被视为该“纪元日期（epoch date）”值        |
| Date32                      | datetime.date           | int               | 与 Date 相同，但支持更宽范围的日期                                                           |
| DateTime                    | datetime.datetime       | int               | ClickHouse 将 DateTime 存储为纪元秒数（epoch seconds）。`int` 类型将被视为该“纪元秒（epoch second）”值 |
| DateTime64                  | datetime.datetime       | int               | Python `datetime.datetime` 仅支持微秒精度。原始 64 位 `int` 值是可用的                         |
| Time                        | datetime.timedelta      | int, string, time | ClickHouse 将 DateTime 存储为纪元秒数（epoch seconds）。`int` 类型将被视为该“纪元秒（epoch second）”值 |
| Time64                      | datetime.timedelta      | int, string, time | Python `datetime.timedelta` 仅支持微秒精度。原始 64 位 `int` 值是可用的                        |
| IPv4                        | `ipaddress.IPv4Address` | string            | 格式正确的字符串可以作为 IPv4 地址插入                                                         |
| IPv6                        | `ipaddress.IPv6Address` | string            | 格式正确的字符串可以作为 IPv6 地址插入                                                         |
| Tuple                       | dict or tuple           |                   |                                                                                |
| Map                         | dict                    |                   |                                                                                |
| Nested                      | Sequence[dict]          |                   |                                                                                |
| UUID                        | uuid.UUID               | string            | 格式正确的字符串可以作为 ClickHouse UUID 插入                                                |
| JSON/Object(&#39;json&#39;) | dict                    | string            | 可以将字典或 JSON 字符串插入到 JSON 列中（注意 `Object('json')` 已被弃用）                           |
| Variant                     | object                  |                   | 目前所有 Variant 值都会以 String 形式插入，并由 ClickHouse 服务器进行解析                            |
| Dynamic                     | object                  |                   | 警告：目前向 Dynamic 列执行的任何写入都会以 ClickHouse String 的形式持久化存储                          |

### Specialized insert methods

ClickHouse Connect 为常见数据格式提供了专门的插入方法：

* `insert_df` -- 插入一个 Pandas DataFrame。与使用 Python Sequence of Sequences 作为 `data` 参数不同，此方法的第二个参数需要一个 `df` 参数，且必须是 Pandas DataFrame 实例。ClickHouse Connect 会自动将 DataFrame 作为列式数据源进行处理，因此不需要也无法使用 `column_oriented` 参数。
* `insert_arrow` -- 插入一个 PyArrow Table。ClickHouse Connect 会将 Arrow 表原样传递给 ClickHouse 服务器进行处理，因此除了 `table` 和 `arrow_table` 外，仅支持 `database` 和 `settings` 参数。
* `insert_df_arrow` -- 插入基于 Arrow 的 Pandas DataFrame 或 Polars DataFrame。ClickHouse Connect 将自动判断 DataFrame 是 Pandas 还是 Polars 类型。对于 Pandas，将执行校验以确保每一列的 dtype backend 都是基于 Arrow 的，如果有任何一列不是，则会抛出错误。

:::note
NumPy 数组是一个有效的 Sequence of Sequences，可以作为主 `insert` 方法的 `data` 参数，因此不需要专门的方法。
:::

#### Pandas DataFrame 插入

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

#### 使用 PyArrow Table 插入数据

```python
import clickhouse_connect
import pyarrow as pa
```


client = clickhouse_connect.get_client()

arrow_table = pa.table({
"id": [1, 2, 3],
"name": ["Alice", "Bob", "Joe"],
"age": [25, 30, 28],
})

client.insert_arrow("users", arrow_table)

````

#### 基于 Arrow 的 DataFrame 插入（pandas 2.x） {#arrow-backed-dataframe-insert-pandas-2}

```python
import clickhouse_connect
import pandas as pd

client = clickhouse_connect.get_client()

````


# 将数据类型转换为基于 Arrow 的 dtype 以提升性能

df = pd.DataFrame({
"id": [1, 2, 3],
"name": ["Alice", "Bob", "Joe"],
"age": [25, 30, 28],
}).convert_dtypes(dtype_backend="pyarrow")

client.insert_df_arrow("users", df)

````

### 时区 {#time-zones}

当将 Python 的 `datetime.datetime` 对象插入到 ClickHouse 的 `DateTime` 或 `DateTime64` 列时，ClickHouse Connect 会自动处理时区信息。由于 ClickHouse 在内部将所有 DateTime 值存储为不含时区信息的 Unix 时间戳（自 Unix 纪元以来的秒数或其小数部分），因此在插入过程中，时区转换会在客户端自动完成。

#### 带时区信息的 datetime 对象 {#timezone-aware-datetime-objects}

如果插入的是带时区信息的 Python `datetime.datetime` 对象，ClickHouse Connect 会自动调用 `.timestamp()` 将其转换为 Unix 时间戳，并正确考虑时区偏移量。这意味着您可以插入任意时区的 datetime 对象，它们都会被正确地存储为对应的 UTC 时间戳。

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
client.command("CREATE TABLE events (event_time DateTime) ENGINE Memory")

````


# 插入带时区信息的 datetime 对象
denver_tz = pytz.timezone('America/Denver')
tokyo_tz = pytz.timezone('Asia/Tokyo')

data = [
    [datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)],
    [denver_tz.localize(datetime(2023, 6, 15, 10, 30, 0))],
    [tokyo_tz.localize(datetime(2023, 6, 15, 10, 30, 0))]
]



client.insert(&#39;events&#39;, data, column&#95;names=[&#39;event&#95;time&#39;])
results = client.query(&quot;SELECT * from events&quot;)
print(*results.result&#95;rows, sep=&quot;\n&quot;)

# 输出：

# (datetime.datetime(2023, 6, 15, 10, 30),)

# (datetime.datetime(2023, 6, 15, 16, 30),)

# (datetime.datetime(2023, 6, 15, 1, 30),)

````

在本示例中，这三个 datetime 对象由于处于不同时区，因此表示的是不同的时间点。每个对象都会被正确转换为对应的 Unix 时间戳，并存储到 ClickHouse 中。

:::note
使用 pytz 时，必须通过 `localize()` 方法为一个 naive datetime 附加时区信息。直接在 datetime 构造函数中传入 `tzinfo=` 会导致使用错误的历史偏移量。对于 UTC，`tzinfo=pytz.UTC` 是正确的用法。更多信息参见 [pytz 文档](https://pythonhosted.org/pytz/#localized-times-and-date-arithmetic)。
:::

#### 不含时区信息（timezone‑naive）的 datetime 对象 {#timezone-naive-datetime-objects}

如果插入的是一个不含时区信息的 Python `datetime.datetime` 对象（即没有 `tzinfo`），`.timestamp()` 方法会将其解释为系统本地时区的时间。为避免歧义，建议：

1. 插入数据时始终使用带时区信息的 datetime 对象，或
2. 确保系统时区设置为 UTC，或
3. 在插入前手动转换为纪元时间戳（epoch timestamp）

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
````


# 推荐：始终使用带时区信息的日期时间
utc_time = datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)
client.insert('events', [[utc_time]], column_names=['event_time'])



# 备选方案：手动转换为 Unix 时间戳

naive&#95;time = datetime(2023, 6, 15, 10, 30, 0)
epoch&#95;timestamp = int(naive&#95;time.replace(tzinfo=pytz.UTC).timestamp())
client.insert(&#39;events&#39;, [[epoch&#95;timestamp]], column&#95;names=[&#39;event&#95;time&#39;])

````

#### 带有时区元数据的 DateTime 列 {#datetime-columns-with-timezone-metadata}

ClickHouse 列在定义时可以附带时区元数据（例如 `DateTime('America/Denver')` 或 `DateTime64(3, 'Asia/Tokyo')`）。这些元数据不会影响数据的存储方式（仍然作为 UTC 时间戳存储），但会控制从 ClickHouse 查询数据时所使用的时区。

向此类列中插入数据时，ClickHouse Connect 会将 Python 的 datetime 转换为 Unix 时间戳（如果 datetime 带有时区，则会考虑其时区信息）。当你查询这些数据时，ClickHouse Connect 会返回已转换为该列时区的 datetime，而不管你在插入时使用的是什么时区。

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
````


# 创建包含洛杉矶时区元数据的表
client.command("CREATE TABLE events (event_time DateTime('America/Los_Angeles')) ENGINE Memory")



# 插入纽约时间（美国东部夏令时间 10:30，对应协调世界时 UTC 14:30）
ny_tz = pytz.timezone("America/New_York")
data = ny_tz.localize(datetime(2023, 6, 15, 10, 30, 0))
client.insert("events", [[data]], column_names=["event_time"])



# 在查询结果中，时间会自动转换为洛杉矶时区

# 10:30 AM New York (UTC-4) = 14:30 UTC = 7:30 AM Los Angeles (UTC-7)

results = client.query("select * from events")
print(*results.result_rows, sep="\n")

# 输出：

# (datetime.datetime(2023, 6, 15, 7, 30, tzinfo=<DstTzInfo 'America/Los_Angeles' PDT-1 day, 17:00:00 DST>),)

```

```


## 文件插入

`clickhouse_connect.driver.tools` 包中包含 `insert_file` 方法，可将数据直接从文件系统插入到已有的 ClickHouse 表中。解析工作由 ClickHouse 服务器负责。`insert_file` 接受以下参数：

| Parameter        | Type            | Default           | Description                                                   |
| ---------------- | --------------- | ----------------- | ------------------------------------------------------------- |
| client           | Client          | *Required*        | 用于执行插入操作的 `driver.Client`                                     |
| table            | str             | *Required*        | 要插入数据的 ClickHouse 表。允许使用完整表名（包括数据库名）。                         |
| file&#95;path    | str             | *Required*        | 数据文件在本机文件系统中的路径                                               |
| fmt              | str             | CSV, CSVWithNames | 文件的 ClickHouse 输入格式。如果未提供 `column_names`，则默认使用 CSVWithNames   |
| column&#95;names | Sequence of str | *None*            | 数据文件中的列名列表。对于自身包含列名的格式则不需要该参数                                 |
| database         | str             | *None*            | 表所属的数据库。如果表名已完全限定则忽略该参数。如果未指定，插入操作将使用 client 的当前数据库           |
| settings         | dict            | *None*            | 参见 [settings description](driver-api.md#settings-argument)。   |
| compression      | str             | *None*            | 用于 Content-Encoding HTTP 头的 ClickHouse 已支持压缩类型（zstd、lz4、gzip） |

对于数据不一致，或日期/时间值使用非常规格式的文件，此方法同样支持适用于数据导入的相关设置（例如 `input_format_allow_errors_num` 和 `input_format_allow_errors_num`）。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```
