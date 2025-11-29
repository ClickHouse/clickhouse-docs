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

## QueryContexts {#querycontexts}

ClickHouse Connect 会在 `QueryContext` 中执行常规查询。`QueryContext` 包含用于针对 ClickHouse 数据库构建查询的关键结构，以及用于将结果处理为 `QueryResult` 或其他响应数据结构的配置。这其中包括查询本身、参数、设置、读取格式以及其他属性。

可以使用客户端的 `create_query_context` 方法获取一个 `QueryContext`。该方法接受与核心查询方法相同的参数。随后，可以将该查询上下文通过 `context` 关键字参数传递给 `query`、`query_df` 或 `query_np` 方法，用来替代这些方法的部分或全部其他参数。请注意，为方法调用额外指定的参数将会覆盖 `QueryContext` 上的任何属性。

`QueryContext` 最典型的用例是使用不同的绑定参数值发送同一个查询。可以通过调用 `QueryContext.set_parameters` 方法并传入一个字典来更新所有参数值，或者通过调用 `QueryContext.set_parameter` 并传入所需的 `key`、`value` 对来更新任意单个参数值。

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

请注意，`QueryContext` 不是线程安全的，但在多线程环境中可以通过调用 `QueryContext.updated_copy` 方法来获取其副本。


## 流式查询 {#streaming-queries}

ClickHouse Connect 客户端提供多种以流（实现为 Python 生成器）形式检索数据的方法：

- `query_column_block_stream` -- 使用原生 Python 对象，按块以列序列的形式返回查询数据
- `query_row_block_stream` -- 使用原生 Python 对象，按块以行块的形式返回查询数据
- `query_rows_stream` -- 使用原生 Python 对象，以行序列的形式返回查询数据
- `query_np_stream` -- 将查询数据的每个 ClickHouse 块返回为一个 NumPy 数组
- `query_df_stream` -- 将查询数据的每个 ClickHouse 块返回为一个 Pandas DataFrame
- `query_arrow_stream` -- 以 PyArrow RecordBlocks 形式返回查询数据
- `query_df_arrow_stream` -- 将查询数据的每个 ClickHouse 块返回为由 Arrow 支持的 Pandas DataFrame 或 Polars DataFrame，具体取决于关键字参数 `dataframe_library`（默认值为 "pandas"）。

上述每个方法都会返回一个 `ContextStream` 对象，必须在 `with` 语句中打开该对象，才能开始读取流数据。

### 数据块 {#data-blocks}

ClickHouse Connect 将来自主要 `query` 方法的所有数据，作为从 ClickHouse 服务器接收的数据块流进行处理。这些数据块使用 ClickHouse 自定义的 “Native” 格式进行双向传输。一个“块（block）”本质上就是一组二进制数据列的序列，其中每一列都包含相同数量且具有指定数据类型的数据值。（作为列式数据库，ClickHouse 以类似的形式存储这些数据。）查询返回的数据块大小由两个用户设置控制，这两个设置可以在多个层级（用户配置、用户、会话或查询）中进行配置。它们是：

- [max_block_size](/operations/settings/settings#max_block_size) -- 以行数为单位限制数据块的大小。默认值为 65536。
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- 以字节为单位对数据块大小的软限制。默认值为 1,000,000。

无论 `preferred_block_size_setting` 如何设置，每个数据块的行数都不会超过 `max_block_size`。根据查询类型的不同，实际返回的数据块大小可以有所不同。例如，对覆盖多个分片的分布式表进行查询时，结果中可能包含从每个分片直接获取的较小数据块。

当使用任一客户端的 `query_*_stream` 方法时，结果会按数据块逐块返回。ClickHouse Connect 一次只加载一个数据块。这样可以在无需将整个大型结果集全部加载到内存中的情况下处理大量数据。请注意，应用程序应做好准备以处理任意数量的数据块，并且无法精确控制每个数据块的大小。

### 处理速度较慢时的 HTTP 数据缓冲区 {#http-data-buffer-for-slow-processing}

由于 HTTP 协议的限制，如果数据块的处理速度显著慢于 ClickHouse 服务器推送数据的速度，ClickHouse 服务器会关闭连接，从而在处理线程中抛出异常。可以通过使用通用的 `http_buffer_size` 设置来增大 HTTP 流式缓冲区（默认大小为 10 兆字节），以在一定程度上缓解这一问题。在应用程序可用内存充足的情况下，在这种场景中使用较大的 `http_buffer_size` 值通常是可以接受的。如果使用 `lz4` 或 `zstd` 压缩，缓冲区中的数据会以压缩形式存储，因此使用这些压缩类型会扩大整体可用缓冲容量。

### StreamContexts {#streamcontexts}

每个 `query_*_stream` 方法（例如 `query_row_block_stream`）都会返回一个 ClickHouse 的 `StreamContext` 对象，它是一个结合了 Python 上下文管理器和生成器的对象。基本用法如下：

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <处理每行 Python 行程数据>
```

请注意，尝试在没有使用 `with` 语句的情况下使用 `StreamContext` 会引发错误。使用 Python 上下文管理器可以确保流（在本例中为 HTTP 流式响应）即使在未完全消费所有数据和/或在处理过程中抛出异常的情况下，也能被正确关闭。此外，`StreamContext` 只能使用一次来消费流。在 `StreamContext` 退出后再次尝试使用它将会抛出 `StreamClosedError` 异常。

你可以使用 `StreamContext` 的 `source` 属性来访问其父级 `QueryResult` 对象，其中包含列名和类型。


### 流类型 {#stream-types}

`query_column_block_stream` 方法会将块（block）作为一系列按列存储的数据返回，并使用原生的 Python 数据类型。结合上面的 `taxi_trips` 查询示例，返回的数据将是一个列表，其中每个元素又是另一个列表（或元组），包含对应列的所有数据。因此，`block[0]` 将是一个只包含字符串的元组。列式格式最常用于对某一列的全部值执行聚合操作，例如对总车费求和。

`query_row_block_stream` 方法会将块作为一系列行返回，类似于传统的关系型数据库。对于 taxi trips，返回的数据是一个列表，其中每个元素是另一个列表，表示一行数据。因此，`block[0]` 将按顺序包含第一条 taxi trip 的所有字段，`block[1]` 将包含第二条 taxi trip 的所有字段对应的一行数据，依此类推。面向行的结果通常用于展示或转换处理流程。

`query_row_stream` 是一个便捷方法，在遍历流时会自动移动到下一个块。在其他方面，它与 `query_row_block_stream` 完全相同。

`query_np_stream` 方法将每个块返回为一个二维 NumPy 数组。在内部，NumPy 数组通常按列存储，因此不需要为行或列分别提供不同的方法。NumPy 数组的 “shape” 将表示为 (columns, rows)。NumPy 库提供了许多用于操作 NumPy 数组的方法。请注意，如果查询中的所有列共享相同的 NumPy dtype，返回的 NumPy 数组也只会有一个 dtype，并且可以在不改变其内部结构的情况下进行 reshape/旋转。

`query_df_stream` 方法将每个 ClickHouse Block 作为一个二维 Pandas DataFrame 返回。下面是一个示例，展示了 `StreamContext` 对象可以以延迟（惰性）的方式用作上下文（但只能使用一次）。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <对 pandas DataFrame 进行操作>
```

`query_df_arrow_stream` 方法会将每个 ClickHouse Block 作为 DataFrame 返回，并使用 PyArrow 作为 dtype 后端。该方法通过 `dataframe_library` 参数（默认为 `"pandas"`）同时支持 Pandas（2.x 或更高版本）和 Polars 的 DataFrame。每次迭代都会返回一个由 PyArrow record batch 转换而来的 DataFrame，从而在某些数据类型上提供更好的性能和内存效率。

最后，`query_arrow_stream` 方法会返回一个 ClickHouse `ArrowStream` 格式的结果，其类型为包装在 `StreamContext` 中的 `pyarrow.ipc.RecordBatchStreamReader`。流的每次迭代都会返回一个 PyArrow RecordBlock。


### 流式传输示例 {#streaming-examples}

#### 流式传输行 {#stream-rows}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# 逐行流式处理大型结果集 {#stream-large-result-sets-row-by-row}
with client.query_rows_stream("SELECT number, number * 2 as doubled FROM system.numbers LIMIT 100000") as stream:
    for row in stream:
        print(row)  # 处理每一行
        # 输出：
        # (0, 0)
        # (1, 2)
        # (2, 4)
        # ....
```


#### 流式行数据块 {#stream-row-blocks}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# 以数据块方式流式传输（比逐行处理更高效） {#stream-in-blocks-of-rows-more-efficient-than-row-by-row}
with client.query_row_block_stream("SELECT number, number * 2 FROM system.numbers LIMIT 100000") as stream:
    for block in stream:
        print(f"收到包含 {len(block)} 行的数据块")
        # 输出：
        # 收到包含 65409 行的数据块
        # 收到包含 34591 行的数据块
```


#### 以流式方式传输 Pandas DataFrame {#stream-pandas-dataframes}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# 以流式方式将查询结果作为 Pandas DataFrames 返回 {#stream-query-results-as-pandas-dataframes}
with client.query_df_stream("SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000") as stream:
    for df in stream:
        # 处理每个 DataFrame 数据块
        print(f"Received DataFrame with {len(df)} rows")
        print(df.head(3))
        # 输出:
        # 接收到包含 65409 行的 DataFrame
        #    number str
        # 0       0   0
        # 1       1   1
        # 2       2   2
        # 接收到包含 34591 行的 DataFrame
        #    number    str
        # 0   65409  65409
        # 1   65410  65410
        # 2   65411  65411
```


#### 流式传输 Arrow 批处理 {#stream-arrow-batches}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# 以 Arrow 记录批次的形式流式传输查询结果 {#stream-query-results-as-arrow-record-batches}
with client.query_arrow_stream("SELECT * FROM large_table") as stream:
    for arrow_batch in stream:
        # 处理每个 Arrow 批次
        print(f"Received Arrow batch with {arrow_batch.num_rows} rows")
        # 输出:
        # 已接收包含 65409 行的 Arrow 批次
        # 已接收包含 34591 行的 Arrow 批次
```


## NumPy、Pandas 和 Arrow 查询 {#numpy-pandas-and-arrow-queries}

ClickHouse Connect 提供了用于处理 NumPy、Pandas 和 Arrow 数据结构的专用查询方法。通过这些方法，可以直接以这些常用数据格式获取查询结果，而无需手动进行格式转换。

### NumPy 查询 {#numpy-queries}

`query_np` 方法会将查询结果作为 NumPy 数组返回，而不是返回 ClickHouse Connect 的 `QueryResult` 对象。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# 查询返回 NumPy 数组 {#query-returns-a-numpy-array}
np_array = client.query_np("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")

print(type(np_array))
# 输出: {#output}
# <class "numpy.ndarray"> {#class-numpyndarray}

print(np_array)
# 输出: {#output}
# [[0 0] {#0-0}
#  [1 2] {#1-2}
#  [2 4] {#2-4}
#  [3 6] {#3-6}
#  [4 8]] {#4-8}
```


### Pandas 查询 {#pandas-queries}

`query_df` 方法会将查询结果作为 Pandas DataFrame 返回，而不是 ClickHouse Connect 的 `QueryResult`。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# 查询返回 Pandas DataFrame {#query-returns-a-pandas-dataframe}
df = client.query_df("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")

print(type(df))
# 输出: <class "pandas.core.frame.DataFrame"> {#output-class-pandascoreframedataframe}
print(df)
# 输出: {#output}
#    number  doubled {#number-doubled}
# 0       0        0 {#0-0-0}
# 1       1        2 {#1-1-2}
# 2       2        4 {#2-2-4}
# 3       3        6 {#3-3-6}
# 4       4        8 {#4-4-8}
```


### PyArrow 查询 {#pyarrow-queries}

`query_arrow` 方法会以 PyArrow Table 的形式返回查询结果。它直接使用 ClickHouse 的 `Arrow` 格式，因此只接受与主 `query` 方法相同的三个参数：`query`、`parameters` 和 `settings`。另外还有一个附加参数 `use_strings`，用于决定 Arrow Table 在渲染 ClickHouse 的 String 类型时，是作为字符串（当为 `True`）还是作为字节（当为 `False`）。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# 查询返回一个 PyArrow 表 {#query-returns-a-pyarrow-table}
arrow_table = client.query_arrow("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")

print(type(arrow_table))
# 输出： {#output}
# <class "pyarrow.lib.Table"> {#class-pyarrowlibtable}

print(arrow_table)
# 输出： {#output}
# pyarrow.Table {#pyarrowtable}
# number: uint64 not null {#number-uint64-not-null}
# str: string not null {#str-string-not-null}
# ----
# number: [[0,1,2]] {#number-012}
# str: [["0","1","2"]] {#str-012}
```


### 基于 Arrow 的 DataFrame {#arrow-backed-dataframes}

ClickHouse Connect 通过 `query_df_arrow` 和 `query_df_arrow_stream` 方法，支持从 Arrow 查询结果快速且高效地创建 DataFrame，并节省内存。这些方法是对 Arrow 查询方法的轻量封装，并在可能的情况下执行零拷贝转换为 DataFrame：

- `query_df_arrow`：使用 ClickHouse 的 `Arrow` 输出格式执行查询并返回一个 DataFrame。
  - 对于 `dataframe_library='pandas'`，返回使用基于 Arrow 的 dtypes（`pd.ArrowDtype`）的 pandas 2.x DataFrame。这需要 pandas 2.x，并在可能的情况下利用零拷贝缓冲区，从而实现卓越的性能和较低的内存开销。
  - 对于 `dataframe_library='polars'`，返回一个由 Arrow 表（`pl.from_arrow`）创建的 Polars DataFrame，其同样高效，并且根据数据情况可以实现零拷贝。
- `query_df_arrow_stream`：以 DataFrame（pandas 2.x 或 Polars）序列的形式流式返回结果，这些 DataFrame 是由 Arrow 流式批次转换而来的。

#### 查询基于 Arrow 的 DataFrame {#query-to-arrow-backed-dataframe}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# 查询返回带有 Arrow 数据类型的 Pandas DataFrame(需要 pandas 2.x) {#query-returns-a-pandas-dataframe-with-arrow-dtypes-requires-pandas-2x}
df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="pandas"
)

print(df.dtypes)
# 输出: {#output}
# number    uint64[pyarrow] {#number-uint64pyarrow}
# str       string[pyarrow] {#str-stringpyarrow}
# dtype: object {#dtype-object}

# 或使用 Polars {#or-use-polars}
polars_df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="polars"
)
print(df.dtypes)
# 输出: {#output}
# [UInt64, String] {#uint64-string}


# 以批次方式流式传输 DataFrame(以 polars 为例) {#streaming-into-batches-of-dataframes-polars-shown}
with client.query_df_arrow_stream(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000", dataframe_library="polars"
) as stream:
    for df_batch in stream:
        print(f"接收到 {type(df_batch)} 批次,包含 {len(df_batch)} 行,数据类型: {df_batch.dtypes}")
        # 输出:
        # 接收到 <class 'polars.dataframe.frame.DataFrame'> 批次,包含 65409 行,数据类型: [UInt64, String]
        # 接收到 <class 'polars.dataframe.frame.DataFrame'> 批次,包含 34591 行,数据类型: [UInt64, String]
```


#### 注意事项和说明 {#notes-and-caveats}

- Arrow 类型映射：当以 Arrow 格式返回数据时，ClickHouse 会将类型映射到最接近且受支持的 Arrow 类型。某些 ClickHouse 类型没有原生的 Arrow 等价类型，会作为原始字节返回在 Arrow 字段中（通常为 `BINARY` 或 `FIXED_SIZE_BINARY`）。
  - 示例：`IPv4` 表示为 Arrow `UINT32`；`IPv6` 和大整数（`Int128/UInt128/Int256/UInt256`）通常表示为带原始字节的 `FIXED_SIZE_BINARY`/`BINARY`。
  - 在这些情况下，DataFrame 列将包含由 Arrow 字段承载的字节值；需要由客户端代码根据 ClickHouse 语义来解释/转换这些字节。
- 不支持的 Arrow 数据类型（例如作为真正 Arrow 类型的 UUID/ENUM）不会被输出；其值在输出时会使用最接近的受支持 Arrow 类型表示（通常为二进制字节）。
- Pandas 要求：基于 Arrow 的 dtypes 需要 pandas 2.x。对于旧版本的 pandas，请改用 `query_df`（非 Arrow）。
- 字符串 vs 二进制：`use_strings` 选项（在服务器设置 `output_format_arrow_string_as_string` 启用时有效）控制 ClickHouse 的 `String` 列是作为 Arrow 字符串还是作为二进制返回。

#### 不匹配的 ClickHouse/Arrow 类型转换示例 {#mismatched-clickhousearrow-type-conversion-examples}

当 ClickHouse 以原始二进制数据形式返回列数据（例如 `FIXED_SIZE_BINARY` 或 `BINARY`）时，应用程序代码需要负责将这些字节转换为合适的 Python 类型。下面的示例展示了一些转换可以通过 DataFrame 库 API 完成，而其他转换则可能需要使用纯 Python 方法（例如 `struct.unpack`，这会牺牲一定性能但具备更高的灵活性）。

`Date` 列可能以 `UINT16` 的形式返回（自 Unix 纪元（1970‑01‑01）起算的天数）。在 DataFrame 中完成转换既高效又简单：

```python
# Polars {#polars}
df = df.with_columns(pl.col("event_date").cast(pl.Date))

# Pandas {#pandas}
df["event_date"] = pd.to_datetime(df["event_date"], unit="D")
```

类似 `Int128` 的列可能会以包含原始字节的 `FIXED_SIZE_BINARY` 类型出现。Polars 对 128 位整数提供了原生支持：

```python
# Polars - 原生支持 {#polars-native-support}
df = df.with_columns(pl.col("data").bin.reinterpret(dtype=pl.Int128, endianness="little"))
```

截至 NumPy 2.3，尚不存在公开的 128 位整数 dtype，因此我们必须改用纯 Python，可以像下面这样写：

```python
# 假设我们有一个 pandas DataFrame,其中包含一个数据类型为 fixed_size_binary[16][pyarrow] 的 Int128 列 {#assuming-we-have-a-pandas-dataframe-with-an-int128-column-of-dtype-fixed_size_binary16pyarrow}

print(df)
# 输出: {#output}
#   str_col                                        int_128_col {#str_col-int_128_col}
# 0    num1  b'\\x15}\\xda\\xeb\\x18ZU\\x0fn\\x05\\x01\\x00\\x00\\x00... {#0-num1-bx15xdaxebx18zux0fnx05x01x00x00x00}
# 1    num2  b'\\x08\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00... {#1-num2-bx08x00x00x00x00x00x00x00x00x00x00}
# 2    num3  b'\\x15\\xdfp\\x81r\\x9f\\x01\\x00\\x00\\x00\\x00\\x00\\x... {#2-num3-bx15xdfpx81rx9fx01x00x00x00x00x00x}

print([int.from_bytes(n, byteorder="little") for n in df["int_128_col"].to_list()])
# 输出: {#output}
# [1234567898765432123456789, 8, 456789123456789] {#1234567898765432123456789-8-456789123456789}
```

关键要点是：应用程序代码必须根据所选 DataFrame 库的能力以及可接受的性能权衡来处理这些转换。当 DataFrame 原生转换不可用时，仍然可以采用纯 Python 的方式来实现。


## 读取格式 {#read-formats}

读取格式用于控制客户端 `query`、`query_np` 和 `query_df` 方法返回值的数据类型。（`raw_query` 和 `query_arrow` 不会修改来自 ClickHouse 的原始数据，因此不适用格式控制。）例如，如果将 UUID 的读取格式从默认的 `native` 格式更改为可选的 `string` 格式，那么对 `UUID` 列的 ClickHouse 查询结果将以字符串形式返回（使用标准的 8-4-4-4-12 RFC 1422 格式），而不是 Python UUID 对象。

任何格式化函数的 “data type” 参数都可以包含通配符。该参数值必须是一个全部为小写的字符串。

读取格式可以在多个层级进行设置：

* 全局设置，使用 `clickhouse_connect.datatypes.format` 包中定义的方法。这将控制所有查询中已配置数据类型的格式。

```python
from clickhouse_connect.datatypes.format import set_read_format

# 将 IPv6 和 IPv4 值以字符串形式返回 {#return-both-ipv6-and-ipv4-values-as-strings}
set_read_format('IPv*', 'string')

# 将所有 Date 类型以底层的 epoch 秒或 epoch 天形式返回 {#return-all-date-types-as-the-underlying-epoch-second-or-epoch-day}
set_read_format('Date*', 'int')
```

* 对整个查询，可以使用可选的 `query_formats` 字典参数。在这种情况下，任何属于指定数据类型的列（或子列）都会使用配置的格式。

```python
# 将所有 UUID 列作为字符串返回 {#return-any-uuid-column-as-a-string}
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```

* 对于特定列中的值，可以使用可选的 `column_formats` 字典参数。其键为 ClickHouse 返回的列名，值可以是该数据列的格式，或者是一个第二层级的「format」字典，其中键为 ClickHouse 类型名，值为查询格式。该第二层级字典可用于 Tuple 或 Map 等嵌套列类型。

```python
# 将 `dev_address` 列中的 IPv6 值以字符串形式返回 {#return-ipv6-values-in-the-dev_address-column-as-strings}
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```


### 读取格式选项（Python 类型） {#read-format-options-python-types}

| ClickHouse Type       | Native Python Type  | Read Formats      | Comments                                                                                                          |
|-----------------------|---------------------|-------------------|-------------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                 | -                 |                                                                                                                   |
| UInt64                | int                 | signed            | Superset 当前不支持处理较大的无符号 UInt64 值                                                                     |
| [U]Int[128,256]       | int                 | string            | Pandas 和 NumPy 的 int 值最多为 64 位，因此这些类型会以字符串形式返回                                             |
| BFloat16              | float               | -                 | 所有 Python 浮点数在内部都是 64 位                                                                                |
| Float32               | float               | -                 | 所有 Python 浮点数在内部都是 64 位                                                                                |
| Float64               | float               | -                 |                                                                                                                   |
| Decimal               | decimal.Decimal     | -                 |                                                                                                                   |
| String                | string              | bytes             | ClickHouse 的 String 列没有固有编码，因此也可用于可变长度的二进制数据                                             |
| FixedString           | bytes               | string            | FixedString 是固定大小的字节数组，但有时会被当作 Python 字符串处理                                                |
| Enum[8,16]            | string              | string, int       | Python 枚举不接受空字符串，因此所有枚举都会表示为字符串或其底层的 int 值                                          |
| Date                  | datetime.date       | int               | ClickHouse 将 Date 存储为自 1970-01-01 起的天数。该值可以作为 int 获取                                            |
| Date32                | datetime.date       | int               | 与 Date 相同，但支持更宽的日期范围                                                                               |
| DateTime              | datetime.datetime   | int               | ClickHouse 以自 Unix 纪元以来的秒数存储 DateTime。该值可以作为 int 获取                                          |
| DateTime64            | datetime.datetime   | int               | Python 的 datetime.datetime 仅支持微秒精度，可获取原始的 64 位 int 值                                            |
| Time                  | datetime.timedelta  | int, string, time | 时间点以 Unix 时间戳保存。该值可以作为 int 获取                                                                   |
| Time64                | datetime.timedelta  | int, string, time | Python 的 datetime.timedelta 仅支持微秒精度，可获取原始的 64 位 int 值                                           |
| IPv4                  | `ipaddress.IPv4Address` | string        | IP 地址可以按字符串读取，格式正确的字符串可以作为 IP 地址插入                                                     |
| IPv6                  | `ipaddress.IPv6Address` | string        | IP 地址可以按字符串读取，格式正确的字符串可以作为 IP 地址插入                                                     |
| Tuple                 | dict or tuple       | tuple, json       | 命名元组默认以字典形式返回，也可以返回为 JSON 字符串                                                              |
| Map                   | dict                | -                 |                                                                                                                   |
| Nested                | Sequence[dict]      | -                 |                                                                                                                   |
| UUID                  | uuid.UUID           | string            | UUID 可以按字符串读取，并以符合 RFC 4122 的格式表示<br/>                                                          |
| JSON                  | dict                | string            | 默认返回 Python 字典对象。`string` 格式会返回 JSON 字符串                                                         |
| Variant               | object              | -                 | 返回与该值所存储的 ClickHouse 数据类型相匹配的 Python 类型                                                         |
| Dynamic               | object              | -                 | 返回与该值所存储的 ClickHouse 数据类型相匹配的 Python 类型                                                         |

## 外部数据 {#external-data}

ClickHouse 查询可以接受任意 ClickHouse 格式的外部数据。该二进制数据会与查询字符串一同发送，用于参与数据处理。External Data 功能的详细信息见[此处](/engines/table-engines/special/external-data.md)。客户端的 `query*` 方法接受一个可选的 `external_data` 参数以利用该功能。`external_data` 参数的值应为一个 `clickhouse_connect.driver.external.ExternalData` 对象。该对象的构造函数接受以下参数：

| Name          | Type              | Description                                                         |
| ------------- | ----------------- | ------------------------------------------------------------------- |
| file&#95;path | str               | 本地系统路径中用于读取外部数据的文件路径。`file_path` 和 `data` 至少需要提供一个                  |
| file&#95;name | str               | 外部数据“文件”的名称。如果未提供，将根据 `file_path` 推断（不包含扩展名）                        |
| data          | bytes             | 二进制形式的外部数据（而不是从文件中读取）。`data` 和 `file_path` 至少需要提供一个                 |
| fmt           | str               | 数据的 ClickHouse [Input Format](/sql-reference/formats.mdx)。默认为 `TSV` |
| types         | str or seq of str | 外部数据中列的数据类型列表。如果为字符串，类型之间应使用逗号分隔。`types` 和 `structure` 至少需要提供一个     |
| structure     | str or seq of str | 数据中的“列名 + 数据类型”列表（参见示例）。`structure` 和 `types` 至少需要提供一个              |
| mime&#95;type | str               | 文件数据的可选 MIME 类型。目前 ClickHouse 会忽略该 HTTP 子头                          |

要发送一个包含“movie”数据的外部 CSV 文件的查询，并将该数据与 ClickHouse 服务器上已存在的 `directors` 表进行联结使用：

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

可以使用 `add_file` 方法向初始的 `ExternalData` 对象添加额外的外部数据文件，该方法接受与构造函数相同的参数。对于 HTTP，所有外部数据都会作为 `multipart/form-data` 文件上传的一部分进行传输。


## 时区 {#time-zones}

有多种机制可将时区应用到 ClickHouse 的 DateTime 和 DateTime64 值上。在内部，ClickHouse 服务器始终将任何 DateTime 或 `DateTime64` 对象存储为一个不含时区信息的数值，表示自 Unix 纪元（1970-01-01 00:00:00 UTC）以来的秒数。对于 `DateTime64` 值，根据精度不同，其表示形式可以是自纪元以来的毫秒、微秒或纳秒。因此，任何时区信息的应用始终发生在客户端。请注意，这会引入一定的额外计算开销，所以在对性能敏感的应用中，建议将 DateTime 类型视为纪元时间戳，仅在用户展示和转换时才使用时区（例如，Pandas Timestamps 始终是一个表示纪元纳秒的 64 位整数，以提升性能）。

在查询中使用带时区感知的数据类型时——特别是 Python 的 `datetime.datetime` 对象——`clickhouse-connect` 会按以下优先级规则在客户端应用时区：

1. 如果在查询中为查询方法参数 `client_tzs` 指定了值，则会应用相应列的时区
2. 如果 ClickHouse 列具有时区元数据（即其类型类似于 DateTime64(3, 'America/Denver')），则会应用该 ClickHouse 列的时区。（注意：对于 ClickHouse 23.2 之前版本的 DateTime 列，clickhouse-connect 无法获取该时区元数据）
3. 如果在查询中为查询方法参数 `query_tz` 指定了值，则会应用该“查询时区”
4. 如果为查询或会话设置了时区，则会应用该时区。（此功能在 ClickHouse 服务器中尚未发布）
5. 最后，如果客户端参数 `apply_server_timezone` 被设置为 True（默认值），则会应用 ClickHouse 服务器的时区。

请注意，如果根据上述规则最终应用的时区是 UTC，`clickhouse-connect` 将_始终_返回一个不含时区信息的 Python `datetime.datetime` 对象。随后，如有需要，应用代码可以为这个不含时区信息的对象补充额外的时区信息。