---
sidebar_label: '高级插入'
sidebar_position: 5
keywords: ['clickhouse', 'python', 'insert', 'advanced']
description: '使用 ClickHouse Connect 进行高级插入'
slug: /integrations/language-clients/python/advanced-inserting
title: '高级插入'
doc_type: 'reference'
---



## 使用 ClickHouse Connect 插入数据:高级用法 {#inserting-data-with-clickhouse-connect--advanced-usage}

### InsertContext 对象 {#insertcontexts}

ClickHouse Connect 在 `InsertContext` 中执行所有插入操作。`InsertContext` 包含作为参数传递给客户端 `insert` 方法的所有值。此外,当首次构造 `InsertContext` 时,ClickHouse Connect 会检索插入列所需的数据类型,以便进行高效的 Native 格式插入。通过在多次插入中重用 `InsertContext`,可以避免这种"预查询",从而更快速、更高效地执行插入操作。

可以使用客户端的 `create_insert_context` 方法获取 `InsertContext`。该方法接受与 `insert` 函数相同的参数。请注意,重用时只应修改 `InsertContext` 的 `data` 属性。这与其设计目的一致,即为向同一表重复插入新数据提供可重用对象。

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

`InsertContext` 包含在插入过程中会更新的可变状态,因此它们不是线程安全的。

### 写入格式 {#write-formats}

写入格式目前仅针对有限数量的类型实现。在大多数情况下,ClickHouse Connect 会通过检查第一个(非空)数据值的类型来自动确定列的正确写入格式。例如,如果向 `DateTime` 列插入数据,且该列的第一个插入值是 Python 整数,ClickHouse Connect 将直接插入该整数值,并假定它实际上是一个 Unix 时间戳(秒)。

在大多数情况下,无需覆盖数据类型的写入格式,但可以使用 `clickhouse_connect.datatypes.format` 包中的相关方法在全局级别进行覆盖。

#### 写入格式选项 {#write-format-options}


| ClickHouse 类型       | 原生 Python 类型        | 写入格式          | 说明                                                                                                        |
| --------------------- | ----------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------- |
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                             |
| UInt64                | int                     |                   |                                                                                                             |
| [U]Int[128,256]       | int                     |                   |                                                                                                             |
| BFloat16              | float                   |                   |                                                                                                             |
| Float32               | float                   |                   |                                                                                                             |
| Float64               | float                   |                   |                                                                                                             |
| Decimal               | decimal.Decimal         |                   |                                                                                                             |
| String                | string                  |                   |                                                                                                             |
| FixedString           | bytes                   | string            | 如果以字符串形式插入,额外的字节将被设置为零                                                                    |
| Enum[8,16]            | string                  |                   |                                                                                                             |
| Date                  | datetime.date           | int               | ClickHouse 将日期存储为自 1970 年 1 月 1 日以来的天数。int 类型将被视为此"纪元日期"值                           |
| Date32                | datetime.date           | int               | 与 Date 相同,但支持更广的日期范围                                                                             |
| DateTime              | datetime.datetime       | int               | ClickHouse 以纪元秒存储 DateTime。int 类型将被视为此"纪元秒"值                                                 |
| DateTime64            | datetime.datetime       | int               | Python datetime.datetime 的精度限制为微秒。可以使用原始的 64 位 int 值                                         |
| Time                  | datetime.timedelta      | int, string, time | ClickHouse 以纪元秒存储 DateTime。int 类型将被视为此"纪元秒"值                                                 |
| Time64                | datetime.timedelta      | int, string, time | Python datetime.timedelta 的精度限制为微秒。可以使用原始的 64 位 int 值                                        |
| IPv4                  | `ipaddress.IPv4Address` | string            | 格式正确的字符串可以作为 IPv4 地址插入                                                                         |
| IPv6                  | `ipaddress.IPv6Address` | string            | 格式正确的字符串可以作为 IPv6 地址插入                                                                         |
| Tuple                 | dict or tuple           |                   |                                                                                                             |
| Map                   | dict                    |                   |                                                                                                             |
| Nested                | Sequence[dict]          |                   |                                                                                                             |
| UUID                  | uuid.UUID               | string            | 格式正确的字符串可以作为 ClickHouse UUID 插入                                                                  |
| JSON/Object('json')   | dict                    | string            | 字典或 JSON 字符串均可插入到 JSON 列中(注意 `Object('json')` 已弃用)                                           |
| Variant               | object                  |                   | 目前所有变体都以字符串形式插入并由 ClickHouse 服务器解析                                                        |
| Dynamic               | object                  |                   | 警告 -- 目前插入到 Dynamic 列的任何数据都会以 ClickHouse String 形式持久化                                      |

### 专用插入方法 {#specialized-insert-methods}

ClickHouse Connect 为常见数据格式提供了专用插入方法:

- `insert_df` -- 插入 Pandas DataFrame。此方法的第二个参数需要一个 `df` 参数(必须是 Pandas DataFrame 实例),而不是 Python Sequence of Sequences `data` 参数。ClickHouse Connect 会自动将 DataFrame 作为列式数据源处理,因此不需要也不提供 `column_oriented` 参数。
- `insert_arrow` -- 插入 PyArrow Table。ClickHouse Connect 将 Arrow 表原样传递给 ClickHouse 服务器进行处理,因此除了 `table` 和 `arrow_table` 之外,只有 `database` 和 `settings` 参数可用。
- `insert_df_arrow` -- 插入基于 Arrow 的 Pandas DataFrame 或 Polars DataFrame。ClickHouse Connect 会自动判断 DataFrame 是 Pandas 还是 Polars 类型。如果是 Pandas,将执行验证以确保每列的 dtype 后端都基于 Arrow,如果有任何列不是,将抛出错误。

:::note
NumPy 数组是有效的 Sequence of Sequences,可以用作主 `insert` 方法的 `data` 参数,因此不需要专用方法。
:::

#### Pandas DataFrame 插入 {#pandas-dataframe-insert}

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

#### PyArrow Table 插入 {#pyarrow-table-insert}

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

#### 基于 Arrow 的 DataFrame 插入(pandas 2.x) {#arrow-backed-dataframe-insert-pandas-2}

```python
import clickhouse_connect
import pandas as pd

client = clickhouse_connect.get_client()

````


# 转换为 Arrow 支持的数据类型以提升性能

df = pd.DataFrame({
"id": [1, 2, 3],
"name": ["Alice", "Bob", "Joe"],
"age": [25, 30, 28],
}).convert_dtypes(dtype_backend="pyarrow")

client.insert_df_arrow("users", df)

````

### 时区 {#time-zones}

将 Python `datetime.datetime` 对象插入 ClickHouse `DateTime` 或 `DateTime64` 列时,ClickHouse Connect 会自动处理时区信息。由于 ClickHouse 内部将所有 DateTime 值存储为无时区的 Unix 时间戳(自纪元以来的秒数或小数秒数),因此时区转换会在插入时自动在客户端完成。

#### 带时区的 datetime 对象 {#timezone-aware-datetime-objects}

如果插入带时区的 Python `datetime.datetime` 对象,ClickHouse Connect 会自动调用 `.timestamp()` 将其转换为 Unix 时间戳,该时间戳会正确处理时区偏移量。这意味着您可以插入任何时区的 datetime 对象,它们都会被正确存储为对应的 UTC 时间戳。

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

在此示例中,三个 datetime 对象因时区不同而代表不同的时间点。每个对象都会被正确转换为对应的 Unix 时间戳并存储到 ClickHouse 中。

:::note
使用 pytz 时,必须使用 `localize()` 方法为 naive datetime 对象附加时区信息。直接向 datetime 构造函数传递 `tzinfo=` 参数会使用错误的历史偏移量。对于 UTC,使用 `tzinfo=pytz.UTC` 可以正常工作。更多信息请参阅 [pytz 文档](https://pythonhosted.org/pytz/#localized-times-and-date-arithmetic)。
:::

#### Timezone-naive datetime 对象 {#timezone-naive-datetime-objects}

如果插入 timezone-naive 的 Python `datetime.datetime` 对象(即不含 `tzinfo` 的对象),`.timestamp()` 方法会将其解释为系统本地时区的时间。为避免歧义,建议:

1. 插入时始终使用 timezone-aware datetime 对象,或
2. 确保系统时区设置为 UTC,或
3. 插入前手动转换为 epoch 时间戳

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
````


# 推荐：始终使用带时区信息的 datetime
utc_time = datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)
client.insert('events', [[utc_time]], column_names=['event_time'])



# 另一种方法：手动转换为 Unix 时间戳

naive&#95;time = datetime(2023, 6, 15, 10, 30, 0)
epoch&#95;timestamp = int(naive&#95;time.replace(tzinfo=pytz.UTC).timestamp())
client.insert(&#39;events&#39;, [[epoch&#95;timestamp]], column&#95;names=[&#39;event&#95;time&#39;])

````

#### 带有时区元数据的 DateTime 列 {#datetime-columns-with-timezone-metadata}

ClickHouse 列可以定义时区元数据(例如 `DateTime('America/Denver')` 或 `DateTime64(3, 'Asia/Tokyo')`)。此元数据不会影响数据的存储方式(仍以 UTC 时间戳形式存储),但会控制从 ClickHouse 查询数据时所使用的时区。

向此类列插入数据时,ClickHouse Connect 会将 Python datetime 对象转换为 Unix 时间戳(如果存在时区信息则将其纳入计算)。查询数据时,ClickHouse Connect 将返回转换为列时区的 datetime 对象,无论插入时使用的是何种时区。

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
````


# 创建带有洛杉矶时区信息的表
client.command("CREATE TABLE events (event_time DateTime('America/Los_Angeles')) ENGINE Memory")



# 插入纽约时间（美国东部夏令时间 EDT 10:30，对应世界协调时 UTC 14:30）
ny_tz = pytz.timezone("America/New_York")
data = ny_tz.localize(datetime(2023, 6, 15, 10, 30, 0))
client.insert("events", [[data]], column_names=["event_time"])



# 查询返回时，时间会自动转换为洛杉矶时区

# 纽约时间上午 10:30 (UTC-4) = 14:30 UTC = 洛杉矶时间上午 7:30 (UTC-7)

results = client.query("select * from events")
print(*results.result_rows, sep="\n")

# 输出：

# (datetime.datetime(2023, 6, 15, 7, 30, tzinfo=<DstTzInfo 'America/Los_Angeles' PDT-1 day, 17:00:00 DST>),)

```

```


## 文件插入 {#file-inserts}

`clickhouse_connect.driver.tools` 包提供了 `insert_file` 方法,允许直接从文件系统将数据插入到现有的 ClickHouse 表中。数据解析由 ClickHouse 服务器负责。`insert_file` 接受以下参数:

| 参数         | 类型            | 默认值            | 描述                                                                                                                      |
| ------------ | --------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| client       | Client          | _必需_            | 用于执行插入操作的 `driver.Client`                                                                                        |
| table        | str             | _必需_            | 要插入数据的 ClickHouse 表。允许使用完整表名(包括数据库)。                                                               |
| file_path    | str             | _必需_            | 数据文件的本地文件系统路径                                                                                                |
| fmt          | str             | CSV, CSVWithNames | 文件的 ClickHouse 输入格式。如果未提供 `column_names`,则默认为 CSVWithNames                                               |
| column_names | Sequence of str | _None_            | 数据文件中的列名列表。对于包含列名的格式,此参数非必需                                                                        |
| database     | str             | _None_            | 表所在的数据库。如果表名已完全限定则忽略此参数。如果未指定,插入操作将使用客户端数据库                                     |
| settings     | dict            | _None_            | 参见[设置说明](driver-api.md#settings-argument)。                                                                         |
| compression  | str             | _None_            | 用于 Content-Encoding HTTP 标头的 ClickHouse 压缩类型(zstd、lz4、gzip)                                            |

对于包含不一致数据或非常规格式的日期/时间值的文件,此方法支持适用于数据导入的设置(例如 `input_format_allow_errors_num` 和 `input_format_allow_errors_ratio`)。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```
