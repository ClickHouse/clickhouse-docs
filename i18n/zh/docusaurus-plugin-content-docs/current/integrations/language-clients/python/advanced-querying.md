---
sidebar_label: '高级查询'
sidebar_position: 4
keywords: ['clickhouse', 'python', 'query', 'advanced']
description: '使用 ClickHouse Connect 进行高级查询'
slug: /integrations/language-clients/python/advanced-querying
title: '高级查询'
doc_type: 'reference'
---



# 使用 ClickHouse Connect 查询数据：高级用法 {#querying-data-with-clickhouse-connect--advanced-usage}


## QueryContexts（查询上下文） {#querycontexts}

ClickHouse Connect 在 `QueryContext` 中执行标准查询。`QueryContext` 包含用于构建 ClickHouse 数据库查询的关键结构，以及用于将结果处理为 `QueryResult` 或其他响应数据结构的配置。这包括查询本身、参数、设置、读取格式和其他属性。

可以使用客户端的 `create_query_context` 方法获取 `QueryContext`。此方法接受与核心查询方法相同的参数。然后可以将此查询上下文作为 `context` 关键字参数传递给 `query`、`query_df` 或 `query_np` 方法，以替代这些方法的任何或全部其他参数。请注意，为方法调用指定的额外参数将覆盖 QueryContext 的任何属性。

`QueryContext` 最典型的使用场景是使用不同的绑定参数值发送相同的查询。可以通过传入字典调用 `QueryContext.set_parameters` 方法来更新所有参数值，或者通过传入所需的 `key`、`value` 对调用 `QueryContext.set_parameter` 来更新单个值。

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

请注意，`QueryContext` 不是线程安全的，但可以通过调用 `QueryContext.updated_copy` 方法在多线程环境中获取副本。


## 流式查询 {#streaming-queries}

ClickHouse Connect 客户端提供了多种方法以流的形式检索数据(实现为 Python 生成器):

- `query_column_block_stream` -- 以数据块形式返回查询数据,作为使用原生 Python 对象的列序列
- `query_row_block_stream` -- 以行块形式返回查询数据,使用原生 Python 对象
- `query_rows_stream` -- 以行序列形式返回查询数据,使用原生 Python 对象
- `query_np_stream` -- 将每个 ClickHouse 查询数据块作为 NumPy 数组返回
- `query_df_stream` -- 将每个 ClickHouse 查询数据块作为 Pandas DataFrame 返回
- `query_arrow_stream` -- 以 PyArrow RecordBlocks 形式返回查询数据
- `query_df_arrow_stream` -- 将每个 ClickHouse 查询数据块作为基于 Arrow 的 Pandas DataFrame 或 Polars DataFrame 返回,具体取决于关键字参数 `dataframe_library`(默认为 "pandas")。

这些方法均返回一个 `ContextStream` 对象,必须通过 `with` 语句打开才能开始消费流。

### 数据块 {#data-blocks}

ClickHouse Connect 将主 `query` 方法的所有数据作为从 ClickHouse 服务器接收的数据块流进行处理。这些数据块以自定义的 "Native" 格式在 ClickHouse 之间传输。"数据块" 是二进制数据列的序列,其中每列包含相同数量的指定数据类型的数据值。(作为列式数据库,ClickHouse 以类似的形式存储这些数据。)查询返回的数据块大小由两个用户设置控制,这些设置可以在多个级别(用户配置文件、用户、会话或查询)设置。它们是:

- [max_block_size](/operations/settings/settings#max_block_size) -- 数据块的行数大小限制。默认值为 65536。
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- 数据块的字节大小软限制。默认值为 1,000,0000。

无论 `preferred_block_size_setting` 如何设置,每个数据块的行数永远不会超过 `max_block_size`。根据查询类型的不同,实际返回的数据块可以是任意大小。例如,对覆盖多个分片的分布式表的查询可能包含直接从每个分片检索的较小数据块。

使用客户端的 `query_*_stream` 方法之一时,结果以逐块的方式返回。ClickHouse Connect 一次只加载一个数据块。这允许处理大量数据,而无需将整个大型结果集加载到内存中。请注意,应用程序应准备好处理任意数量的数据块,并且无法控制每个数据块的确切大小。

### 用于慢速处理的 HTTP 数据缓冲区 {#http-data-buffer-for-slow-processing}

由于 HTTP 协议的限制,如果数据块的处理速度明显慢于 ClickHouse 服务器流式传输数据的速度,ClickHouse 服务器将关闭连接,导致在处理线程中抛出异常。可以通过使用通用的 `http_buffer_size` 设置增加 HTTP 流缓冲区的大小(默认为 10 兆字节)来缓解这种情况。如果应用程序有足够的可用内存,在这种情况下使用较大的 `http_buffer_size` 值应该没有问题。如果使用 `lz4` 或 `zstd` 压缩,缓冲区中的数据将以压缩形式存储,因此使用这些压缩类型将增加可用的总缓冲区容量。

### StreamContexts {#streamcontexts}

每个 `query_*_stream` 方法(如 `query_row_block_stream`)都返回一个 ClickHouse `StreamContext` 对象,它是一个组合的 Python 上下文/生成器。基本用法如下:

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <对每行 Python 行程数据执行某些操作>
```

请注意,尝试在没有 `with` 语句的情况下使用 StreamContext 将引发错误。使用 Python 上下文可确保即使未消费所有数据和/或在处理过程中引发异常,流(在本例中为流式 HTTP 响应)也会被正确关闭。此外,`StreamContext` 只能使用一次来消费流。尝试在 `StreamContext` 退出后使用它将产生 `StreamClosedError`。

您可以使用 `StreamContext` 的 `source` 属性来访问父 `QueryResult` 对象,其中包括列名和类型。

### 流类型 {#stream-types}


`query_column_block_stream` 方法将数据块作为列数据序列返回,以原生 Python 数据类型存储。使用上述 `taxi_trips` 查询时,返回的数据将是一个列表,其中列表的每个元素是另一个列表(或元组),包含相应列的所有数据。因此 `block[0]` 将是一个仅包含字符串的元组。列式格式最常用于对列中的所有值执行聚合操作,例如累加总票价。

`query_row_block_stream` 方法将数据块作为行序列返回,类似于传统关系数据库。对于出租车行程数据,返回的数据将是一个列表,其中列表的每个元素是另一个表示数据行的列表。因此 `block[0]` 将包含第一次出租车行程的所有字段(按顺序),`block[1]` 将包含第二次出租车行程的所有字段,依此类推。行式结果通常用于显示或转换处理。

`query_row_stream` 是一个便捷方法,在遍历流时会自动移动到下一个数据块。除此之外,它与 `query_row_block_stream` 完全相同。

`query_np_stream` 方法将每个数据块作为二维 NumPy 数组返回。在内部,NumPy 数组(通常)以列的形式存储,因此不需要单独的行或列方法。NumPy 数组的"形状"将表示为(列数,行数)。NumPy 库提供了许多操作 NumPy 数组的方法。请注意,如果查询中的所有列共享相同的 NumPy dtype,则返回的 NumPy 数组也将只有一个 dtype,并且可以在不实际更改其内部结构的情况下进行重塑/旋转。

`query_df_stream` 方法将每个 ClickHouse 数据块作为二维 Pandas DataFrame 返回。以下示例展示了 `StreamContext` 对象可以以延迟方式用作上下文(但只能使用一次)。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <对 pandas DataFrame 执行某些操作>
```

`query_df_arrow_stream` 方法将每个 ClickHouse 数据块作为具有 PyArrow dtype 后端的 DataFrame 返回。此方法通过 `dataframe_library` 参数(默认为 `"pandas"`)支持 Pandas(2.x 或更高版本)和 Polars DataFrame。每次迭代都会生成从 PyArrow 记录批次转换的 DataFrame,为某些数据类型提供更好的性能和内存效率。

最后,`query_arrow_stream` 方法将 ClickHouse `ArrowStream` 格式的结果作为包装在 `StreamContext` 中的 `pyarrow.ipc.RecordBatchStreamReader` 返回。流的每次迭代都会返回 PyArrow RecordBlock。

### 流式查询示例 {#streaming-examples}

#### 流式读取行 {#stream-rows}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

```


# 按行流式读取大型结果集

with client.query&#95;rows&#95;stream(&quot;SELECT number, number * 2 as doubled FROM system.numbers LIMIT 100000&quot;) as stream:
for row in stream:
print(row)  # 处理每一行

# 输出：

# (0, 0)

# (1, 2)

# (2, 4)

# ....

````

#### 流式处理行块 {#stream-row-blocks}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 以数据块形式流式读取行（比逐行读取更高效）

with client.query&#95;row&#95;block&#95;stream(&quot;SELECT number, number * 2 FROM system.numbers LIMIT 100000&quot;) as stream:
for block in stream:
print(f&quot;Received block with {len(block)} rows&quot;)

# 输出：

# 接收到包含 65409 行的块

# 接收到包含 34591 行的块

````

#### 流式传输 Pandas DataFrames {#stream-pandas-dataframes}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 以 Pandas DataFrame 流式读取查询结果

with client.query&#95;df&#95;stream(&quot;SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000&quot;) as stream:
for df in stream:

# 处理每个 DataFrame 块

print(f&quot;Received DataFrame with {len(df)} rows&quot;)
print(df.head(3))

# 输出：

# Received DataFrame with 65409 rows

# number str

# 0       0   0

# 1       1   1

# 2       2   2

# Received DataFrame with 34591 rows

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


# 以 Arrow 记录批次流式传输查询结果

with client.query&#95;arrow&#95;stream(&quot;SELECT * FROM large&#95;table&quot;) as stream:
for arrow&#95;batch in stream:

# 处理每个 Arrow 批次

print(f&quot;Received Arrow batch with {arrow_batch.num_rows} rows&quot;)

# 输出：

# 收到包含 65409 行的 Arrow 批次

# 收到包含 34591 行的 Arrow 批次

```
```


## NumPy、Pandas 和 Arrow 查询 {#numpy-pandas-and-arrow-queries}

ClickHouse Connect 提供了专门的查询方法用于处理 NumPy、Pandas 和 Arrow 数据结构。通过这些方法,您可以直接以这些常用数据格式获取查询结果,无需手动转换。

### NumPy 查询 {#numpy-queries}

`query_np` 方法以 NumPy 数组形式返回查询结果,而非 ClickHouse Connect 的 `QueryResult` 对象。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

```


# 查询返回 NumPy 数组
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

`query_df` 方法以 Pandas DataFrame 的形式返回查询结果,而非 ClickHouse Connect 的 `QueryResult`。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 查询返回 Pandas DataFrame
df = client.query_df("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")



print(type(df))

# 输出：<class "pandas.core.frame.DataFrame">

print(df)

# 输出：

# number doubled

# 0 0 0

# 1 1 2

# 2 2 4

# 3 3 6

# 4 4 8

````

### PyArrow 查询 {#pyarrow-queries}

`query_arrow` 方法以 PyArrow Table 形式返回查询结果。它直接使用 ClickHouse 的 `Arrow` 格式，因此只接受与主 `query` 方法相同的三个参数：`query`、`parameters` 和 `settings`。此外，还有一个额外参数 `use_strings`，用于确定 Arrow Table 是否将 ClickHouse String 类型渲染为字符串（True 时）或字节（False 时）。

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

# number: uint64 not null

# str: string not null

# ----

# number: [[0,1,2]]

# str: [[&quot;0&quot;,&quot;1&quot;,&quot;2&quot;]]

````

### Arrow 支持的 DataFrame {#arrow-backed-dataframes}

ClickHouse Connect 通过 `query_df_arrow` 和 `query_df_arrow_stream` 方法支持从 Arrow 结果快速、高效地创建 DataFrame。这些方法是 Arrow 查询方法的轻量级封装,并在可能的情况下执行零拷贝转换为 DataFrame:

- `query_df_arrow`: 使用 ClickHouse `Arrow` 输出格式执行查询并返回 DataFrame。
  - 对于 `dataframe_library='pandas'`,返回使用 Arrow 支持的数据类型(`pd.ArrowDtype`)的 pandas 2.x DataFrame。这需要 pandas 2.x,并在可能的情况下利用零拷贝缓冲区以实现出色的性能和低内存开销。
  - 对于 `dataframe_library='polars'`,返回从 Arrow 表创建的 Polars DataFrame(`pl.from_arrow`),同样高效,并且根据数据可以实现零拷贝。
- `query_df_arrow_stream`: 将结果作为从 Arrow 流批次转换的 DataFrame 序列(pandas 2.x 或 Polars)进行流式传输。

#### 查询到 Arrow 支持的 DataFrame {#query-to-arrow-backed-dataframe}

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
# 输出:
# number    uint64[pyarrow]
# str       string[pyarrow]
# dtype: object



# 或者使用 Polars
polars_df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="polars"
)
print(df.dtypes)
# 输出：
# [UInt64, String]




# 流式传输到 DataFrame 批次(以 polars 为例)

with client.query_df_arrow_stream(
"SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000", dataframe_library="polars"
) as stream:
for df_batch in stream:
print(f"Received {type(df_batch)} batch with {len(df_batch)} rows and dtypes: {df_batch.dtypes}") # Output: # Received <class 'polars.dataframe.frame.DataFrame'> batch with 65409 rows and dtypes: [UInt64, String] # Received <class 'polars.dataframe.frame.DataFrame'> batch with 34591 rows and dtypes: [UInt64, String]

```

#### 注意事项和注意点 {#notes-and-caveats}
- Arrow 类型映射:当以 Arrow 格式返回数据时,ClickHouse 会将类型映射到最接近的受支持 Arrow 类型。某些 ClickHouse 类型没有原生的 Arrow 等效类型,会以原始字节形式在 Arrow 字段中返回(通常为 `BINARY` 或 `FIXED_SIZE_BINARY`)。
  - 示例:`IPv4` 表示为 Arrow `UINT32`;`IPv6` 和大整数(`Int128/UInt128/Int256/UInt256`)通常表示为包含原始字节的 `FIXED_SIZE_BINARY`/`BINARY`。
  - 在这些情况下,DataFrame 列将包含由 Arrow 字段支持的字节值;需要由客户端代码根据 ClickHouse 语义来解释/转换这些字节。
- 不支持的 Arrow 数据类型(例如作为真正 Arrow 类型的 UUID/ENUM)不会被输出;这些值会使用最接近的受支持 Arrow 类型(通常为二进制字节)来表示输出。
- Pandas 要求:Arrow 支持的 dtype 需要 pandas 2.x。对于较旧的 pandas 版本,请改用 `query_df`(非 Arrow)。
- 字符串与二进制:`use_strings` 选项(当服务器设置 `output_format_arrow_string_as_string` 支持时)控制 ClickHouse `String` 列是作为 Arrow 字符串还是二进制返回。

#### ClickHouse/Arrow 类型转换不匹配示例 {#mismatched-clickhousearrow-type-conversion-examples}

当 ClickHouse 将列作为原始二进制数据返回时(例如 `FIXED_SIZE_BINARY` 或 `BINARY`),应用程序代码需要负责将这些字节转换为适当的 Python 类型。以下示例说明某些转换可以使用 DataFrame 库 API 实现,而其他转换可能需要使用纯 Python 方法如 `struct.unpack`(这会牺牲性能但保持灵活性)。

```


`Date` 列可能以 `UINT16` 类型的形式出现（表示自 Unix 时间纪元 1970‑01‑01 起的天数）。在 DataFrame 内进行转换既高效又简单明了：

```python
# Polars
df = df.with_columns(pl.col("event_date").cast(pl.Date))
```


# Pandas

df[&quot;event&#95;date&quot;] = pd.to&#95;datetime(df[&quot;event&#95;date&quot;], unit=&quot;D&quot;)

```
```


像 `Int128` 这样的列可能会以携带原始字节的 `FIXED_SIZE_BINARY` 形式表示。Polars 原生支持 128 位整数：

```python
# Polars - 原生支持
df = df.with_columns(pl.col("data").bin.reinterpret(dtype=pl.Int128, endianness="little"))
```

截至 NumPy 2.3，目前还没有公开的 128 位整数 dtype，因此我们必须回退到纯 Python，可以像这样做：


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

关键要点：应用程序代码必须根据所选 DataFrame 库的能力以及可接受的性能权衡来处理这些转换。当 DataFrame 原生转换不可用时，纯 Python 方法仍可作为备选方案。
```


## 读取格式 {#read-formats}

读取格式控制客户端 `query`、`query_np` 和 `query_df` 方法返回值的数据类型。(`raw_query` 和 `query_arrow` 不会修改来自 ClickHouse 的传入数据,因此格式控制不适用。)例如,如果将 UUID 的读取格式从默认的 `native` 格式更改为 `string` 格式,则 ClickHouse 查询 `UUID` 列时将返回字符串值(使用标准的 8-4-4-4-12 RFC 1422 格式),而不是 Python UUID 对象。

任何格式化函数的"数据类型"参数都可以包含通配符。格式为单个小写字符串。

读取格式可以在多个层级设置:

- 全局层级,使用 `clickhouse_connect.datatypes.format` 包中定义的方法。这将控制所有查询中已配置数据类型的格式。

```python
from clickhouse_connect.datatypes.format import set_read_format

```


# 将 IPv6 和 IPv4 的值都作为字符串返回
set_read_format('IPv*', 'string')



# 将所有 Date 类型作为底层的纪元秒或纪元日返回

set_read_format('Date\*', 'int')

````
- 对于整个查询,使用可选的 `query_formats` 字典参数。在这种情况下,指定数据类型的任何列(或子列)都将使用配置的格式。
```python
# 将任何 UUID 列作为字符串返回
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
````

- 对于特定列中的值,使用可选的 `column_formats` 字典参数。键是 ClickHouse 返回的列名,值为数据列的格式或包含 ClickHouse 类型名称和查询格式值的第二级 "format" 字典。此辅助字典可用于嵌套列类型,如 Tuple 或 Map。

```python
# 将 `dev_address` 列中的 IPv6 值作为字符串返回
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```

### 读取格式选项(Python 类型) {#read-format-options-python-types}

| ClickHouse 类型       | 原生 Python 类型        | 读取格式          | 注释                                                                                                              |
| --------------------- | ----------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                                   |
| UInt64                | int                     | signed            | Superset 目前不支持处理大的无符号 UInt64 值                                                   |
| [U]Int[128,256]       | int                     | string            | Pandas 和 NumPy 的 int 值最大为 64 位,因此这些值可以作为字符串返回                              |
| BFloat16              | float                   | -                 | 所有 Python 浮点数在内部都是 64 位                                                                          |
| Float32               | float                   | -                 | 所有 Python 浮点数在内部都是 64 位                                                                          |
| Float64               | float                   | -                 |                                                                                                                   |
| Decimal               | decimal.Decimal         | -                 |                                                                                                                   |
| String                | string                  | bytes             | ClickHouse String 列没有固有编码,因此它们也用于可变长度的二进制数据        |
| FixedString           | bytes                   | string            | FixedString 是固定大小的字节数组,但有时被视为 Python 字符串                              |
| Enum[8,16]            | string                  | string, int       | Python 枚举不接受空字符串,因此所有枚举都呈现为字符串或底层的 int 值 |
| Date                  | datetime.date           | int               | ClickHouse 将 Date 存储为自 1970 年 1 月 1 日以来的天数。此值可作为 int 获取                               |
| Date32                | datetime.date           | int               | 与 Date 相同,但支持更广泛的日期范围                                                                      |
| DateTime              | datetime.datetime       | int               | ClickHouse 以纪元秒存储 DateTime。此值可作为 int 获取                                    |
| DateTime64            | datetime.datetime       | int               | Python datetime.datetime 的精度限制为微秒。原始的 64 位 int 值可用               |
| Time                  | datetime.timedelta      | int, string, time | 时间点保存为 Unix 时间戳。此值可作为 int 获取                                 |
| Time64                | datetime.timedelta      | int, string, time | Python datetime.timedelta 的精度限制为微秒。原始的 64 位 int 值可用              |
| IPv4                  | `ipaddress.IPv4Address` | string            | IP 地址可以作为字符串读取,格式正确的字符串可以作为 IP 地址插入                |
| IPv6                  | `ipaddress.IPv6Address` | string            | IP 地址可以作为字符串读取,格式正确的字符串可以作为 IP 地址插入                        |
| Tuple                 | dict or tuple           | tuple, json       | 命名元组默认作为字典返回。命名元组也可以作为 JSON 字符串返回               |
| Map                   | dict                    | -                 |                                                                                                                   |
| Nested                | Sequence[dict]          | -                 |                                                                                                                   |
| UUID                  | uuid.UUID               | string            | UUID 可以作为按照 RFC 4122 格式化的字符串读取<br/>                                                       |
| JSON                  | dict                    | string            | 默认返回 Python 字典。`string` 格式将返回 JSON 字符串                         |
| Variant               | object                  | -                 | 返回与该值存储的 ClickHouse 数据类型匹配的 Python 类型                                 |
| Dynamic               | object                  | -                 | 返回与该值存储的 ClickHouse 数据类型匹配的 Python 类型                                 |


## 外部数据 {#external-data}

ClickHouse 查询可以接受任何 ClickHouse 格式的外部数据。这些二进制数据会与查询字符串一起发送,用于数据处理。外部数据功能的详细信息请参见[此处](/engines/table-engines/special/external-data.md)。客户端的 `query*` 方法接受一个可选的 `external_data` 参数来使用此功能。`external_data` 参数的值应为 `clickhouse_connect.driver.external.ExternalData` 对象。该对象的构造函数接受以下参数:

| 名称      | 类型              | 描述                                                                                                                                   |
| --------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| file_path | str               | 本地系统中用于读取外部数据的文件路径。`file_path` 或 `data` 二者必须提供其一                              |
| file_name | str               | 外部数据"文件"的名称。如果未提供,将从 `file_path` 中确定(不含扩展名)                           |
| data      | bytes             | 二进制形式的外部数据(而非从文件读取)。`data` 或 `file_path` 二者必须提供其一                                |
| fmt       | str               | 数据的 ClickHouse [输入格式](/sql-reference/formats.mdx)。默认为 `TSV`                                                      |
| types     | str or seq of str | 外部数据中的列数据类型列表。如果是字符串,类型应以逗号分隔。`types` 或 `structure` 二者必须提供其一 |
| structure | str or seq of str | 数据中列名 + 数据类型的列表(参见示例)。`structure` 或 `types` 二者必须提供其一                                       |
| mime_type | str               | 文件数据的可选 MIME 类型。目前 ClickHouse 会忽略此 HTTP 子标头                                                         |

要发送包含外部 CSV 文件(包含"电影"数据)的查询,并将该数据与 ClickHouse 服务器上已存在的 `directors` 表进行组合:

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

可以使用 `add_file` 方法向初始 `ExternalData` 对象添加额外的外部数据文件,该方法接受与构造函数相同的参数。对于 HTTP,所有外部数据都作为 `multi-part/form-data` 文件上传的一部分进行传输。


## 时区 {#time-zones}

ClickHouse 提供了多种机制来为 DateTime 和 DateTime64 值应用时区。在内部,ClickHouse 服务器始终将任何 DateTime 或 `DateTime64` 对象存储为一个时区无关的数值,表示自纪元时间(1970-01-01 00:00:00 UTC)以来的秒数。对于 `DateTime64` 值,根据精度设置,其表示形式可以是自纪元以来的毫秒、微秒或纳秒。因此,任何时区信息的应用始终在客户端进行。请注意,这会产生额外的计算开销,因此在性能敏感的应用程序中,建议将 DateTime 类型作为纪元时间戳处理,仅在用户显示和转换时例外(例如,Pandas Timestamps 始终使用 64 位整数表示纪元纳秒,以提升性能)。

在查询中使用时区感知的数据类型时——特别是 Python 的 `datetime.datetime` 对象——`clickhouse-connect` 会按照以下优先级规则在客户端应用时区:

1. 如果为查询指定了查询方法参数 `client_tzs`,则应用特定列的时区
2. 如果 ClickHouse 列包含时区元数据(即类型为 DateTime64(3, 'America/Denver') 等),则应用 ClickHouse 列的时区。(注意:对于 ClickHouse 23.2 版本之前的 DateTime 列,clickhouse-connect 无法获取此时区元数据)
3. 如果为查询指定了查询方法参数 `query_tz`,则应用"查询时区"。
4. 如果对查询或会话应用了时区设置,则应用该时区。(此功能尚未在 ClickHouse 服务器中发布)
5. 最后,如果客户端的 `apply_server_timezone` 参数设置为 True(默认值),则应用 ClickHouse 服务器时区。

请注意,如果根据这些规则应用的时区是 UTC,`clickhouse-connect` 将_始终_返回一个时区无关的 Python `datetime.datetime` 对象。如有需要,应用程序代码可以随后为这个时区无关的对象添加额外的时区信息。
