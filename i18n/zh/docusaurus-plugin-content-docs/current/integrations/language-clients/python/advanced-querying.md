---
sidebar_label: '高级查询'
sidebar_position: 4
keywords: ['clickhouse', 'python', 'query', 'advanced']
description: '使用 ClickHouse Connect 进行高级查询'
slug: /integrations/language-clients/python/advanced-querying
title: '高级查询'
doc_type: 'reference'
---



# 使用 ClickHouse Connect 查询数据：进阶用法 {#querying-data-with-clickhouse-connect--advanced-usage}



## QueryContexts

ClickHouse Connect 会在 `QueryContext` 中执行标准查询。`QueryContext` 包含用于针对 ClickHouse 数据库构建查询的关键结构，以及用于将结果处理为 `QueryResult` 或其他响应数据结构的配置。其中包括查询本身、参数、设置、读取格式以及其他属性。

可以使用客户端的 `create_query_context` 方法获取一个 `QueryContext`。该方法接受与核心查询方法相同的参数。随后，可以将该查询上下文作为 `context` 关键字参数传递给 `query`、`query_df` 或 `query_np` 方法，以替代这些方法中的部分或全部其他参数。请注意，在方法调用中额外指定的参数会覆盖 QueryContext 的对应属性。

`QueryContext` 最典型的使用场景是使用不同的绑定参数值发送相同的查询。可以通过调用 `QueryContext.set_parameters` 方法并传入一个字典来更新所有参数值，或者通过调用 `QueryContext.set_parameter` 并传入所需的 `key`、`value` 对来更新任意单个参数值。

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

请注意，`QueryContext` 实例本身不是线程安全的，但在多线程环境中可以通过调用 `QueryContext.updated_copy` 方法获取副本。


## 流式查询

ClickHouse Connect 客户端提供了多种方法，以流的形式（实现为 Python 生成器）获取数据：

* `query_column_block_stream` -- 使用原生 Python 对象，以列序列形式按块返回查询数据
* `query_row_block_stream` -- 使用原生 Python 对象，以行块形式返回查询数据
* `query_rows_stream` -- 使用原生 Python 对象，以行序列形式返回查询数据
* `query_np_stream` -- 将每个 ClickHouse 查询数据块返回为一个 NumPy 数组
* `query_df_stream` -- 将每个 ClickHouse 查询数据块返回为一个 Pandas DataFrame
* `query_arrow_stream` -- 以 PyArrow RecordBlocks 形式返回查询数据
* `query_df_arrow_stream` -- 根据关键字参数 `dataframe_library` 的取值（默认为 “pandas”），将每个 ClickHouse 查询数据块返回为基于 arrow 的 Pandas DataFrame 或 Polars DataFrame。

这些方法都会返回一个 `ContextStream` 对象，必须通过 `with` 语句打开才能开始消费流。

### 数据块

ClickHouse Connect 将来自主 `query` 方法的所有数据视为从 ClickHouse 服务器接收的一系列数据块。这些数据块以自定义的 “Native” 格式在 ClickHouse 与客户端之间传输。“块”只是一个二进制数据列的序列，其中每一列都包含相同数量、指定数据类型的数据值。（作为列式数据库，ClickHouse 以类似的形式存储这些数据。）查询返回的数据块大小由两个用户设置控制，这两个设置可以在多个层级上配置（用户配置文件、用户、会话或查询）。它们是：

* [max&#95;block&#95;size](/operations/settings/settings#max_block_size) -- 对数据块的行数限制。默认值为 65536。
* [preferred&#95;block&#95;size&#95;bytes](/operations/settings/settings#preferred_block_size_bytes) -- 对数据块字节数的软限制。默认值为 1,000,0000。

无论 `preferred_block_size_setting` 如何设置，每个数据块都不会超过 `max_block_size` 行。根据查询类型的不同，实际返回的数据块可以是任意大小。例如，针对包含多个分片的分布式表执行查询时，结果中可能会包含从每个分片直接检索到的较小数据块。

使用客户端的 `query_*_stream` 方法时，结果会按块逐个返回。ClickHouse Connect 一次只加载一个数据块。这样可以在无需将完整的大型结果集全部加载到内存中的情况下处理大量数据。请注意，应用程序应准备好处理任意数量的数据块，并且无法精确控制每个数据块的大小。

### 用于慢速处理的 HTTP 数据缓冲区

由于 HTTP 协议的限制，如果数据块的处理速度明显慢于 ClickHouse 服务器流式发送数据的速度，ClickHouse 服务器将关闭连接，从而在处理线程中抛出异常。可以通过增大 HTTP 流式缓冲区的缓冲大小（默认为 10 兆字节）在一定程度上缓解此问题，可使用通用设置 `http_buffer_size` 进行配置。在应用程序可用内存充足的情况下，在这种场景中将 `http_buffer_size` 设置为较大值通常是可行的。如果使用 `lz4` 或 `zstd` 压缩，缓冲区中的数据将以压缩形式存储，因此使用这些压缩类型会增加整体可用缓冲区的容量。

### StreamContexts

每个 `query_*_stream` 方法（如 `query_row_block_stream`）都会返回一个 ClickHouse 的 `StreamContext` 对象，它是 Python 上下文与生成器的组合。其基本用法如下：

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <处理每行 Python 行程数据>
```

请注意，如果尝试在没有使用 `with` 语句的情况下使用 `StreamContext`，将会引发错误。使用 Python 上下文管理器可以确保流（在本例中为 HTTP 流式响应）即使在未完全消费所有数据和/或在处理过程中抛出异常时，也能被正确关闭。另外，`StreamContext` 只能用于消费该流一次。在 `StreamContext` 退出之后再次尝试使用它将会产生 `StreamClosedError`。

你可以使用 `StreamContext` 的 `source` 属性访问其父级 `QueryResult` 对象，其中包含列名和类型。

### 流类型


`query_column_block_stream` 方法将块（block）以列数据序列的形式返回，并使用原生 Python 数据类型进行存储。基于上面的 `taxi_trips` 查询，返回的数据将是一个列表，其中每个元素本身又是一个列表（或元组），包含与某一列关联的全部数据。因此，`block[0]` 将是一个只包含字符串的元组。列式格式最常用于对某一列中的所有值执行聚合操作，例如汇总所有车费总额。

`query_row_block_stream` 方法会像传统关系型数据库那样，将块作为行序列返回。对于 taxi trips，返回的数据将是一个列表，其中每个元素是另一个表示一行数据的列表。因此，`block[0]` 会按顺序包含第一条 taxi trip 的所有字段，`block[1]` 会包含第二条 taxi trip 的所有字段行，依此类推。面向行的结果通常用于展示或用于转换处理流程。

`query_row_stream` 是一个便捷方法，在遍历流时会自动移动到下一个块。除此之外，它与 `query_row_block_stream` 完全相同。

`query_np_stream` 方法将每个块返回为一个二维 NumPy 数组。NumPy 数组在内部通常按列存储，因此不需要单独的行或列方法。NumPy 数组的 “shape” 将表示为 (列, 行)。NumPy 库提供了许多用于操作 NumPy 数组的方法。注意，如果查询中的所有列共享相同的 NumPy dtype，返回的 NumPy 数组也将只具有一种 dtype，并且可以在不真正改变其内部结构的情况下进行重塑（reshape）或旋转（rotate）。

`query_df_stream` 方法将每个 ClickHouse 块（Block）返回为一个二维 Pandas DataFrame。下面是一个示例，展示了如何以延迟（deferred）的方式将 `StreamContext` 对象用作上下文（但只能使用一次）。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <在此处理 pandas DataFrame>
```

`query_df_arrow_stream` 方法会将每个 ClickHouse Block 以使用 PyArrow dtype 后端的 DataFrame 形式返回。该方法通过 `dataframe_library` 参数（默认为 `"pandas"`）同时支持 Pandas（2.x 或更高版本）和 Polars DataFrame。每次迭代都会返回一个由 PyArrow record batch 转换而来的 DataFrame，从而在某些数据类型上提供更好的性能与内存效率。

最后，`query_arrow_stream` 方法会返回一个 ClickHouse `ArrowStream` 格式的结果，其类型为包装在 `StreamContext` 中的 `pyarrow.ipc.RecordBatchStreamReader`。该流的每次迭代都会返回一个 PyArrow RecordBlock。

### 流式处理示例

#### 按行流式读取

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
```


# 逐行流式读取大型结果集

with client.query&#95;rows&#95;stream(&quot;SELECT number, number * 2 as doubled FROM system.numbers LIMIT 100000&quot;) as stream:
for row in stream:
print(row)  # 处理每一行

# 输出：

# (0, 0)

# (1, 2)

# (2, 4)

# ....

````

#### 流式传输行块 {#stream-row-blocks}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 以数据块形式流式获取行（比逐行处理更高效）

with client.query&#95;row&#95;block&#95;stream(&quot;SELECT number, number * 2 FROM system.numbers LIMIT 100000&quot;) as stream:
for block in stream:
print(f&quot;Received block with {len(block)} rows&quot;)

# 输出：

# 收到包含 65409 行的数据块

# 收到包含 34591 行的数据块

````

#### 流式传输 Pandas DataFrames {#stream-pandas-dataframes}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 以流式方式将查询结果读取为 Pandas DataFrame

with client.query&#95;df&#95;stream(&quot;SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000&quot;) as stream:
for df in stream:

# 处理每个 DataFrame 块

print(f&quot;Received DataFrame with {len(df)} rows&quot;)
print(df.head(3))

# 输出：

# 接收到包含 65409 行的 DataFrame

# number str

# 0       0   0

# 1       1   1

# 2       2   2

# 接收到包含 34591 行的 DataFrame

# number    str

# 0   65409  65409

# 1   65410  65410

# 2   65411  65411

````

#### 流式传输 Arrow 批次 {#stream-arrow-batches}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 以 Arrow 记录批流式获取查询结果

with client.query&#95;arrow&#95;stream(&quot;SELECT * FROM large&#95;table&quot;) as stream:
for arrow&#95;batch in stream:

# 处理每个 Arrow 记录批

print(f&quot;Received Arrow batch with {arrow_batch.num_rows} rows&quot;)

# 输出:

# 收到包含 65409 行的 Arrow 记录批

# 收到包含 34591 行的 Arrow 记录批

```
```


## NumPy、Pandas 和 Arrow 查询

ClickHouse Connect 提供了用于处理 NumPy、Pandas 和 Arrow 数据结构的专用查询方法。通过这些方法，您可以直接以这些常用数据格式获取查询结果，而无需手动转换。

### NumPy 查询

`query_np` 方法会将查询结果以 NumPy 数组的形式返回，而不是 ClickHouse Connect 的 `QueryResult`。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
```


# 查询返回一个 NumPy 数组
np_array = client.query_np("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")



print(type(np_array))

# 输出：

# <class "numpy.ndarray">


print(np&#95;array)

# 输出：

# [[0 0]

# [1 2]

# [2 4]

# [3 6]

# [4 8]]

````

### Pandas 查询 {#pandas-queries}

`query_df` 方法以 Pandas DataFrame 形式返回查询结果,而非 ClickHouse Connect 的 `QueryResult`。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 查询返回一个 Pandas DataFrame
df = client.query_df("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")



print(type(df))

# 输出: <class "pandas.core.frame.DataFrame">

print(df)

# 输出:

# number doubled

# 0 0 0

# 1 1 2

# 2 2 4

# 3 3 6

# 4 4 8

````

### PyArrow 查询 {#pyarrow-queries}

`query_arrow` 方法以 PyArrow Table 形式返回查询结果。该方法直接使用 ClickHouse 的 `Arrow` 格式,因此仅接受与主 `query` 方法共有的三个参数:`query`、`parameters` 和 `settings`。此外,还有一个额外参数 `use_strings`,用于确定 Arrow Table 是将 ClickHouse String 类型渲染为字符串(True)还是字节(False)。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

````


# 查询返回一个 PyArrow 表
arrow_table = client.query_arrow("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")



print(type(arrow_table))

# 输出：

# <class "pyarrow.lib.Table">


print(arrow&#95;table)

# 输出：

# pyarrow.Table

# number: uint64 非空

# str: string 非空

# ----

# number: [[0,1,2]]

# str: [[&quot;0&quot;,&quot;1&quot;,&quot;2&quot;]]

````

### 基于 Arrow 的 DataFrame {#arrow-backed-dataframes}

ClickHouse Connect 通过 `query_df_arrow` 和 `query_df_arrow_stream` 方法支持从 Arrow 结果快速、高效地创建 DataFrame。这些方法是 Arrow 查询方法的轻量级封装,可在条件允许时执行零拷贝转换为 DataFrame:

- `query_df_arrow`: 使用 ClickHouse `Arrow` 输出格式执行查询并返回 DataFrame。
  - 当 `dataframe_library='pandas'` 时,返回使用基于 Arrow 的数据类型(`pd.ArrowDtype`)的 pandas 2.x DataFrame。此功能需要 pandas 2.x,并在条件允许时利用零拷贝缓冲区以实现出色的性能和低内存开销。
  - 当 `dataframe_library='polars'` 时,返回从 Arrow 表创建的 Polars DataFrame(`pl.from_arrow`),同样高效,并且根据数据情况可以实现零拷贝。
- `query_df_arrow_stream`: 将结果以 DataFrame 序列(pandas 2.x 或 Polars)的形式流式传输,这些 DataFrame 从 Arrow 流批次转换而来。

#### 查询到基于 Arrow 的 DataFrame {#query-to-arrow-backed-dataframe}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 查询返回使用 Arrow 数据类型的 Pandas DataFrame（需要 pandas 2.x）
df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="pandas"
)



print(df.dtypes)
# 输出：
# number    uint64[pyarrow]
# str       string[pyarrow]
# dtype: object



# 或使用 Polars
polars_df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="polars"
)
print(df.dtypes)
# 输出：
# [UInt64, String]




# 流式传输为 DataFrame 批次(以 polars 为例)

with client.query_df_arrow_stream(
"SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000", dataframe_library="polars"
) as stream:
for df_batch in stream:
print(f"接收到 {type(df_batch)} 批次,包含 {len(df_batch)} 行,数据类型为:{df_batch.dtypes}") # 输出: # Received <class 'polars.dataframe.frame.DataFrame'> batch with 65409 rows and dtypes: [UInt64, String] # Received <class 'polars.dataframe.frame.DataFrame'> batch with 34591 rows and dtypes: [UInt64, String]

```

#### 注意事项和限制 {#notes-and-caveats}
- Arrow 类型映射:以 Arrow 格式返回数据时,ClickHouse 会将类型映射到最接近的受支持 Arrow 类型。某些 ClickHouse 类型没有原生的 Arrow 等效类型,将以原始字节形式在 Arrow 字段中返回(通常为 `BINARY` 或 `FIXED_SIZE_BINARY`)。
  - 示例:`IPv4` 表示为 Arrow `UINT32`;`IPv6` 和大整数(`Int128/UInt128/Int256/UInt256`)通常表示为包含原始字节的 `FIXED_SIZE_BINARY`/`BINARY`。
  - 在这些情况下,DataFrame 列将包含由 Arrow 字段支持的字节值;需要由客户端代码根据 ClickHouse 语义解释/转换这些字节。
- 不支持的 Arrow 数据类型(例如作为真正 Arrow 类型的 UUID/ENUM)不会被输出;值将使用最接近的受支持 Arrow 类型(通常为二进制字节)表示。
- Pandas 要求:Arrow 支持的数据类型需要 pandas 2.x。对于较旧的 pandas 版本,请改用 `query_df`(非 Arrow)。
- 字符串与二进制:`use_strings` 选项(当服务器设置 `output_format_arrow_string_as_string` 支持时)控制 ClickHouse `String` 列是作为 Arrow 字符串还是二进制形式返回。

#### ClickHouse/Arrow 类型转换不匹配示例 {#mismatched-clickhousearrow-type-conversion-examples}

当 ClickHouse 将列作为原始二进制数据返回时(例如 `FIXED_SIZE_BINARY` 或 `BINARY`),应用程序代码需负责将这些字节转换为适当的 Python 类型。以下示例说明某些转换可以使用 DataFrame 库 API 实现,而其他转换可能需要使用纯 Python 方法(如 `struct.unpack`)(这会牺牲性能但保持灵活性)。

```


`Date` 列可能会被表示为 `UINT16`（自 Unix 纪元 1970‑01‑01 起的天数）。在 DataFrame 内部进行转换既高效又简单：

```python
# Polars
df = df.with_columns(pl.col("event_date").cast(pl.Date))
```


# Pandas

df[&quot;event&#95;date&quot;] = pd.to&#95;datetime(df[&quot;event&#95;date&quot;], unit=&quot;D&quot;)

```
```


像 `Int128` 这样的列可能会以携带原始字节的 `FIXED_SIZE_BINARY` 类型到达。Polars 提供对 128 位整数的原生支持：

```python
# Polars - 原生支持
df = df.with_columns(pl.col("data").bin.reinterpret(dtype=pl.Int128, endianness="little"))
```

截至 NumPy 2.3，目前还没有公开的 128 位整数数据类型（dtype），因此我们必须回退到纯 Python，可以像这样做：


```python
# 假设我们有一个 pandas DataFrame,其中包含一个数据类型为 fixed_size_binary[16][pyarrow] 的 Int128 列
```


print(df)
# 输出：
#   str_col                                        int_128_col
# 0    num1  b'\\x15}\\xda\\xeb\\x18ZU\\x0fn\\x05\\x01\\x00\\x00\\x00...
# 1    num2  b'\\x08\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00...
# 2    num3  b'\\x15\\xdfp\\x81r\\x9f\\x01\\x00\\x00\\x00\\x00\\x00\\x...



print([int.from&#95;bytes(n, byteorder=&quot;little&quot;) for n in df[&quot;int&#95;128&#95;col&quot;].to&#95;list()])

# 输出：

# [1234567898765432123456789, 8, 456789123456789]

```

关键要点：应用程序代码必须根据所选 DataFrame 库的功能和可接受的性能权衡来处理这些转换。当 DataFrame 原生转换不可用时，纯 Python 方法仍可作为备选方案。
```


## 读取格式

读取格式控制客户端 `query`、`query_np` 和 `query_df` 方法返回值的数据类型。（`raw_query` 和 `query_arrow` 不会修改 ClickHouse 返回的原始数据，因此不受格式控制影响。）例如，如果将 UUID 的读取格式从默认的 `native` 格式更改为可选的 `string` 格式，那么对 `UUID` 列的 ClickHouse 查询结果将以字符串形式返回（使用标准的 8-4-4-4-12 RFC 1422 格式），而不是 Python UUID 对象。

任何格式化函数的 “data type” 参数都可以包含通配符。格式名称是一个全部小写的字符串。

读取格式可以在多个层级上进行设置：

* 全局设置：使用 `clickhouse_connect.datatypes.format` 包中定义的方法。这将控制所有查询中已配置数据类型的格式。

```python
from clickhouse_connect.datatypes.format import set_read_format
```


# 将 IPv6 和 IPv4 的值都以字符串形式返回
set_read_format('IPv*', 'string')



# 将所有 Date 类型返回为其底层的纪元秒数或纪元天数

set&#95;read&#95;format(&#39;Date*&#39;, &#39;int&#39;)

````
- 对于整个查询,可使用可选的 `query_formats` 字典参数。此时,所有指定数据类型的列(或子列)都将使用配置的格式。
```python
# 将所有 UUID 列以字符串形式返回
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
````

* 对于特定列中的值，可以使用可选的 `column_formats` 字典参数。键是 ClickHouse 返回的列名，值可以是该数据列的格式，或者是第二层的 &quot;format&quot; 字典，其中键为 ClickHouse 类型名称、值为查询格式。这个第二层字典可用于 Tuple、Map 等嵌套列类型。

```python
# 将 `dev_address` 列中的 IPv6 值以字符串形式返回
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```

### 读取格式选项（Python 类型）

| ClickHouse Type       | 原生 Python 类型            | 读取格式              | 注释                                                       |
| --------------------- | ----------------------- | ----------------- | -------------------------------------------------------- |
| Int[8-64], UInt[8-32] | int                     | -                 |                                                          |
| UInt64                | int                     | signed            | Superset 当前无法处理范围较大的无符号 UInt64 值                         |
| [U]Int[128,256]       | int                     | string            | Pandas 和 NumPy 的 int 值最多为 64 位，因此这些类型会以字符串形式返回           |
| BFloat16              | float                   | -                 | 所有 Python float 在内部都是 64 位                               |
| Float32               | float                   | -                 | 所有 Python float 在内部都是 64 位                               |
| Float64               | float                   | -                 |                                                          |
| Decimal               | decimal.Decimal         | -                 |                                                          |
| String                | string                  | bytes             | ClickHouse String 列没有固有的字符编码，因此也用于可变长度二进制数据              |
| FixedString           | bytes                   | string            | FixedString 是固定大小的字节数组，但有时会被当作 Python 字符串处理              |
| Enum[8,16]            | string                  | string, int       | Python 枚举类型不接受空字符串，因此所有枚举都渲染为字符串或其底层 int 值               |
| Date                  | datetime.date           | int               | ClickHouse 将 Date 存储为自 01/01/1970 起的天数。该值可作为 int 获取      |
| Date32                | datetime.date           | int               | 与 Date 相同，但支持更宽范围的日期                                     |
| DateTime              | datetime.datetime       | int               | ClickHouse 将 DateTime 以自 Unix 纪元以来的秒数存储。该值可作为 int 获取     |
| DateTime64            | datetime.datetime       | int               | Python datetime.datetime 仅支持到微秒精度。可以以原始的 64 位 int 值形式获取  |
| Time                  | datetime.timedelta      | int, string, time | 时间点以 Unix 时间戳保存。该值可作为 int 获取                             |
| Time64                | datetime.timedelta      | int, string, time | Python datetime.timedelta 仅支持到微秒精度。可以以原始的 64 位 int 值形式获取 |
| IPv4                  | `ipaddress.IPv4Address` | string            | IP 地址可以作为字符串读取，格式正确的字符串可以作为 IP 地址插入                      |
| IPv6                  | `ipaddress.IPv6Address` | string            | IP 地址可以作为字符串读取，格式正确的字符串可以作为 IP 地址插入                      |
| Tuple                 | dict or tuple           | tuple, json       | 具名元组默认作为字典返回。具名元组也可以作为 JSON 字符串返回                        |
| Map                   | dict                    | -                 |                                                          |
| Nested                | Sequence[dict]          | -                 |                                                          |
| UUID                  | uuid.UUID               | string            | UUID 可以作为按 RFC 4122 格式化的字符串读取<br />                      |
| JSON                  | dict                    | string            | 默认返回 Python 字典。`string` 格式将返回 JSON 字符串                   |
| Variant               | object                  | -                 | 返回与该值对应的 ClickHouse 数据类型所匹配的 Python 类型                   |
| Dynamic               | object                  | -                 | 返回与该值对应的 ClickHouse 数据类型所匹配的 Python 类型                   |


## 外部数据

ClickHouse 查询可以以任意 ClickHouse 支持的格式接收外部数据。该二进制数据会连同查询字符串一并发送，用于处理数据。External Data 功能的详细说明见[此处](/engines/table-engines/special/external-data.md)。客户端的 `query*` 方法接受一个可选的 `external_data` 参数以利用此功能。`external_data` 参数的值应为 `clickhouse_connect.driver.external.ExternalData` 对象。该对象的构造函数接受如下参数：

| Name          | Type              | Description                                                         |
| ------------- | ----------------- | ------------------------------------------------------------------- |
| file&#95;path | str               | 本地系统路径中用于读取外部数据的文件路径。`file_path` 或 `data` 至少需要提供一个                  |
| file&#95;name | str               | 外部数据“文件”的名称。如果未提供，将从 `file_path` 中推断（不含扩展名）                         |
| data          | bytes             | 二进制形式的外部数据（而不是从文件中读取）。`data` 或 `file_path` 至少需要提供一个                 |
| fmt           | str               | 数据的 ClickHouse [Input Format](/sql-reference/formats.mdx)，默认为 `TSV` |
| types         | str or seq of str | 外部数据中列数据类型的列表。如果为字符串，类型之间应以逗号分隔。`types` 或 `structure` 至少需要提供一个      |
| structure     | str or seq of str | 数据中“列名 + 数据类型”的列表（参见示例）。`structure` 或 `types` 至少需要提供一个              |
| mime&#95;type | str               | 文件数据的可选 MIME 类型。目前 ClickHouse 会忽略该 HTTP 子头字段                        |

要发送一条查询，该查询附带一个包含 “movie” 数据的外部 CSV 文件，并将该数据与 ClickHouse 服务器上已存在的 `directors` 表进行关联：

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

可以使用 `add_file` 方法将额外的外部数据文件添加到初始的 `ExternalData` 对象中，该方法接受与构造函数相同的参数。对于 HTTP，所有外部数据都会作为 `multipart/form-data` 文件上传的一部分进行传输。


## 时区 {#time-zones}
有多种机制可将时区应用到 ClickHouse 的 DateTime 和 DateTime64 值上。在内部，ClickHouse 服务器始终以不含时区信息（time zone naive）的数字形式存储任何 DateTime 或 `DateTime64` 对象，该数字表示自纪元（1970-01-01 00:00:00 UTC 时间）以来的秒数。对于 `DateTime64` 值，其表示形式可以是自纪元以来的毫秒、微秒或纳秒，具体取决于精度。因此，任何时区信息的应用始终在客户端完成。请注意，这会带来一定的额外计算开销，因此在对性能要求较高的应用中，建议将 DateTime 类型视为纪元时间戳，仅在用户展示和转换时再进行处理（例如，Pandas 的 Timestamps 始终是表示纪元纳秒的 64 位整数，以提升性能）。

在查询中使用具备时区感知的数据类型时——尤其是 Python 的 `datetime.datetime` 对象——`clickhouse-connect` 会按照以下优先级规则在客户端应用时区：

1. 如果为查询指定了查询方法参数 `client_tzs`，则使用为对应列指定的时区
2. 如果 ClickHouse 列具有时区元数据（即该列类型类似 DateTime64(3, 'America/Denver')），则使用 ClickHouse 列上的时区。（注意：对于 ClickHouse 23.2 之前版本中的 DateTime 列，clickhouse-connect 无法获取该时区元数据）
3. 如果为查询指定了查询方法参数 `query_tz`，则使用该“查询时区”
4. 如果在查询或会话上设置了时区，则使用该时区。（此功能在当前版本的 ClickHouse 服务器中尚未发布）
5. 最后，如果客户端参数 `apply_server_timezone` 被设置为 True（默认值），则使用 ClickHouse 服务器的时区。

请注意，如果根据上述规则应用的时区为 UTC，则 `clickhouse-connect` 将 _始终_ 返回一个不带时区信息（time zone naive）的 Python `datetime.datetime` 对象。之后，如有需要，应用程序代码可以为该不含时区信息的对象添加额外的时区信息。
