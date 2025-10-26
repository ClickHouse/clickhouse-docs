---
'title': 'chDB Python API 参考'
'sidebar_label': 'Python API'
'slug': '/chdb/api/python'
'description': '完整的 chDB Python API 参考'
'keywords':
- 'chdb'
- 'embedded'
- 'clickhouse-lite'
- 'python'
- 'api'
- 'reference'
'doc_type': 'reference'
---


# Python API Reference
## Core Query Functions {#core-query-functions}
### `chdb.query` {#chdb-query}

使用 chDB 引擎执行 SQL 查询。

这是主要的查询函数，它使用嵌入式 ClickHouse 引擎执行 SQL 语句。支持多种输出格式，并且可以与内存或基于文件的数据库一起使用。

**语法**

```python
chdb.query(sql, output_format='CSV', path='', udf_path='')
```

**参数**

| 参数             | 类型  | 默认值        | 描述                                                                                                                                                                                                                                                                                                     |
|------------------|-------|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`            | str   | *必填*       | 要执行的 SQL 查询字符串                                                                                                                                                                                                                                                                               |
| `output_format`  | str   | `"CSV"`      | 结果的输出格式。支持的格式：<br/>• `"CSV"` - 逗号分隔值<br/>• `"JSON"` - JSON 格式<br/>• `"Arrow"` - Apache Arrow 格式<br/>• `"Parquet"` - Parquet 格式<br/>• `"DataFrame"` - Pandas DataFrame<br/>• `"ArrowTable"` - PyArrow 表<br/>• `"Debug"` - 启用详细日志记录 |
| `path`           | str   | `""`         | 数据库文件路径。默认为内存数据库。<br/>可以是文件路径或 `":memory:"` 表示内存数据库                                                                                                                                                                                                                |
| `udf_path`       | str   | `""`         | 用户定义函数目录的路径                                                                                                                                                                                                                                                                                 |

**返回值**

以指定格式返回查询结果：

| 返回类型              | 条件                                                  |
|-----------------------|------------------------------------------------------|
| `str`                 | 对于文本格式，如 CSV、JSON                          |
| `pd.DataFrame`        | 当 `output_format` 为 `"DataFrame"` 或 `"dataframe"` 时  |
| `pa.Table`            | 当 `output_format` 为 `"ArrowTable"` 或 `"arrowtable"` 时 |
| chdb 结果对象        | 对于其他格式                                          |

**抛出异常**

| 异常            | 条件                                                          |
|-----------------|---------------------------------------------------------------|
| `ChdbError`     | 如果 SQL 查询执行失败                                        |
| `ImportError`   | 如果缺少 DataFrame/Arrow 格式所需的依赖项                       |

**示例**

```pycon
>>> # Basic CSV query
>>> result = chdb.query("SELECT 1, 'hello'")
>>> print(result)
"1,hello"
```

```pycon
>>> # Query with DataFrame output
>>> df = chdb.query("SELECT 1 as id, 'hello' as msg", "DataFrame")
>>> print(df)
   id    msg
0   1  hello
```

```pycon
>>> # Query with file-based database
>>> result = chdb.query("CREATE TABLE test (id INT)", path="mydb.chdb")
```

```pycon
>>> # Query with UDF
>>> result = chdb.query("SELECT my_udf('test')", udf_path="/path/to/udfs")
```

---
### `chdb.sql` {#chdb_sql}

使用 chDB 引擎执行 SQL 查询。

这是主要的查询函数，它使用嵌入式 ClickHouse 引擎执行 SQL 语句。支持多种输出格式，并且可以与内存或基于文件的数据库一起使用。

**语法**

```python
chdb.sql(sql, output_format='CSV', path='', udf_path='')
```

**参数**

| 参数             | 类型  | 默认值        | 描述                                                                                                                                                                                                                                                                                                    |
|------------------|-------|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`            | str   | *必填*       | 要执行的 SQL 查询字符串                                                                                                                                                                                                                                                                               |
| `output_format`  | str   | `"CSV"`      | 结果的输出格式。支持的格式：<br/>• `"CSV"` - 逗号分隔值<br/>• `"JSON"` - JSON 格式<br/>• `"Arrow"` - Apache Arrow 格式<br/>• `"Parquet"` - Parquet 格式<br/>• `"DataFrame"` - Pandas DataFrame<br/>• `"ArrowTable"` - PyArrow 表<br/>• `"Debug"` - 启用详细日志记录 |
| `path`           | str   | `""`         | 数据库文件路径。默认为内存数据库。<br/>可以是文件路径或 `":memory:"` 表示内存数据库                                                                                                                                                                                                                |
| `udf_path`       | str   | `""`         | 用户定义函数目录的路径                                                                                                                                                                                                                                                                                 |

**返回值**

以指定格式返回查询结果：

| 返回类型              | 条件                                                  |
|-----------------------|------------------------------------------------------|
| `str`                 | 对于文本格式，如 CSV、JSON                          |
| `pd.DataFrame`        | 当 `output_format` 为 `"DataFrame"` 或 `"dataframe"` 时  |
| `pa.Table`            | 当 `output_format` 为 `"ArrowTable"` 或 `"arrowtable"` 时 |
| chdb 结果对象        | 对于其他格式                                          |

**抛出异常**

| 异常                 | 条件                                                          |
|----------------------|---------------------------------------------------------------|
| [`ChdbError`](#chdberror) | 如果 SQL 查询执行失败                                        |
| `ImportError`        | 如果缺少 DataFrame/Arrow 格式所需的依赖项                       |

**示例**

```pycon
>>> # Basic CSV query
>>> result = chdb.query("SELECT 1, 'hello'")
>>> print(result)
"1,hello"
```

```pycon
>>> # Query with DataFrame output
>>> df = chdb.query("SELECT 1 as id, 'hello' as msg", "DataFrame")
>>> print(df)
   id    msg
0   1  hello
```

```pycon
>>> # Query with file-based database
>>> result = chdb.query("CREATE TABLE test (id INT)", path="mydb.chdb")
```

```pycon
>>> # Query with UDF
>>> result = chdb.query("SELECT my_udf('test')", udf_path="/path/to/udfs")
```

---
### `chdb.to_arrowTable` {#chdb-state-sqlitelike-to_arrowtable}

将查询结果转换为 PyArrow 表。

将 chDB 查询结果转换为 PyArrow 表，以便高效的列式数据处理。如果结果为空，则返回一个空表。

**语法**

```python
chdb.to_arrowTable(res)
```

**参数**

| 参数      | 描述                                           |
|-----------|------------------------------------------------|
| `res`     | 包含二进制 Arrow 数据的 chDB 查询结果对象 |

**返回值**

| 返回类型   | 描述                                 |
|------------|---------------------------------------|
| `pa.Table` | 包含查询结果的 PyArrow 表          |

**抛出异常**

| 错误类型     | 描述                            |
|--------------|---------------------------------|
| `ImportError` | 如果未安装 pyarrow 或 pandas |

**示例**

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> table = chdb.to_arrowTable(result)
>>> print(table.to_pandas())
   id    msg
0   1  hello
```

---
### `chdb.to_df` {#chdb_to_df}

将查询结果转换为 Pandas DataFrame。

通过首先转换为 PyArrow 表，然后使用多线程转换为 Pandas，以获得更好的性能，将 chDB 查询结果转换为 Pandas DataFrame。

**语法**

```python
chdb.to_df(r)
```

**参数**

| 参数      | 描述                                           |
|-----------|------------------------------------------------|
| `r`       | 包含二进制 Arrow 数据的 chDB 查询结果对象 |

**返回值**

| 返回类型           | 描述                              |
|--------------------|-----------------------------------|
| `pd.DataFrame`     | 包含查询结果的 Pandas DataFrame |

**抛出异常**

| 异常            | 条件                              |
|------------------|-----------------------------------|
| `ImportError`    | 如果未安装 pyarrow 或 pandas       |

**示例**

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> df = chdb.to_df(result)
>>> print(df)
   id    msg
0   1  hello
```
## Connection and Session Management {#connection-session-management}

以下会话函数可用：
### `chdb.connect` {#chdb-connect}

创建一个与 chDB 后台服务器的连接。

此函数与 chDB (ClickHouse) 数据库引擎建立 [连接](#chdb-state-sqlitelike-connection)。每个进程仅允许一个打开的连接。多次使用相同连接字符串调用将返回相同的连接对象。

```python
chdb.connect(connection_string: str = ':memory:') → Connection
```

**参数：**

| 参数                  | 类型  | 默认值         | 描述                                    |
|-----------------------|-------|----------------|-----------------------------------------|
| `connection_string`   | str   | `":memory:"`   | 数据库连接字符串。见下文格式。 |

**基本格式**

| 格式                      | 描述                       |
|---------------------------|----------------------------|
| `":memory:"`              | 内存数据库（默认）         |
| `"test.db"`               | 相对路径数据库文件         |
| `"file:test.db"`          | 与相对路径相同             |
| `"/path/to/test.db"`      | 绝对路径数据库文件         |
| `"file:/path/to/test.db"` | 与绝对路径相同             |

**带查询参数的格式**

| 格式                                             | 描述                        |
|--------------------------------------------------|-----------------------------|
| `"file:test.db?param1=value1&param2=value2"`       | 带参数的相对路径            |
| `"file::memory:?verbose&log-level=test"`           | 带参数的内存数据库          |
| `"///path/to/test.db?param1=value1&param2=value2"` | 带参数的绝对路径            |

**查询参数处理**

查询参数作为启动参数传递给 ClickHouse 引擎。特殊参数处理：

| 特殊参数         | 变为              | 描述                    |
|-------------------|-------------------|-------------------------|
| `mode=ro`         | `--readonly=1`     | 只读模式                |
| `verbose`         | （标志）          | 启用详细日志记录        |
| `log-level=test`  | （设置）          | 设置日志级别            |

有关完整的参数列表，请参见 `clickhouse local --help --verbose`

**返回值**

| 返回类型    | 描述                                                                                                                                                                                                                                      |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Connection` | 支持的数据库连接对象：<br/>• 使用 `Connection.cursor()` 创建游标<br/>• 使用 `Connection.query()` 直接查询<br/>• 使用 `Connection.send_query()` 流式查询<br/>• 支持自动清理的上下文管理器协议     |

**抛出异常**

| 异常          | 条件                       |
|---------------|-----------------------------|
| `RuntimeError` | 如果连接到数据库失败     |

:::warning
每个进程只支持一个连接。
创建新连接将关闭任何现有的连接。
:::

**示例**

```pycon
>>> # In-memory database
>>> conn = connect()
>>> conn = connect(":memory:")
>>>
>>> # File-based database
>>> conn = connect("my_data.db")
>>> conn = connect("/path/to/data.db")
>>>
>>> # With parameters
>>> conn = connect("data.db?mode=ro")  # Read-only mode
>>> conn = connect(":memory:?verbose&log-level=debug")  # Debug logging
>>>
>>> # Using context manager for automatic cleanup
>>> with connect("data.db") as conn:
...     result = conn.query("SELECT 1")
...     print(result)
>>> # Connection automatically closed
```

**另见**
- [`Connection`](#chdb-state-sqlitelike-connection) - 数据库连接类
- [`Cursor`](#chdb-state-sqlitelike-cursor) - 用于 DB-API 2.0 操作的数据库游标
## Exception Handling {#chdb-exceptions}
### **class** `chdb.ChdbError` {#chdb_chdbError}

基类：`Exception`

chDB 相关错误的基异常类。

当 chDB 查询执行失败或遇到错误时，会引发此异常。它继承自标准 Python Exception 类，并提供来自底层 ClickHouse 引擎的错误信息。

---
### **class** `chdb.session.Session` {#chdb_session_session}

基类：`object`

会话将保持查询状态。
如果路径为 None，它将创建一个临时目录并将其用作数据库路径，并在会话关闭时删除临时目录。
您还可以传入路径以在该路径创建一个数据库，以存放数据。

您也可以使用连接字符串传递路径和其他参数。

```python
class chdb.session.Session(path=None)
```

**示例**

| 连接字符串                                  | 描述                          |
|----------------------------------------------|-------------------------------|
| `":memory:"`                                 | 内存数据库                   |
| `"test.db"`                                  | 相对路径                    |
| `"file:test.db"`                             | 与上述相同                   |
| `"/path/to/test.db"`                         | 绝对路径                     |
| `"file:/path/to/test.db"`                    | 与上述相同                   |
| `"file:test.db?param1=value1&param2=value2"` | 带查询参数的相对路径         |
| `"file::memory:?verbose&log-level=test"`     | 带查询参数的内存数据库       |
| `"///path/to/test.db?param1=value1&param2=value2"` | 带查询参数的绝对路径         |

:::note 连接字符串参数处理
包含查询参数的连接字符串如 "[file:test.db?param1=value1&param2=value2](file:test.db?param1=value1&param2=value2)"
“param1=value1”将作为启动参数传递给 ClickHouse 引擎。

有关更多详细信息，请参见 `clickhouse local --help --verbose`

一些特殊参数处理：
- “mode=ro”会变为“--readonly=1”用于 clickhouse（只读模式）
:::

:::warning 重要
- 任何时候只能有一个会话。如果您想创建新会话，您需要关闭现有会话。
- 创建新会话将关闭现有会话。
:::

---
#### `cleanup` {#cleanup}

带有异常处理的清理会话资源。

此方法尝试关闭会话，同时抑制清理过程中可能发生的任何异常。在错误处理场景中或当您需要确保无论会话状态如何都进行清理时，这尤其有用。

**语法**

```python
cleanup()
```

:::note
此方法永远不会引发异常，所以在 finally 块或析构函数中调用是安全的。
:::

**示例**

```pycon
>>> session = Session("test.db")
>>> try:
...     session.query("INVALID SQL")
... finally:
...     session.cleanup()  # Safe cleanup regardless of errors
```

**另见**
- [`close()`](#chdb-session-session-close) - 用于显式会话关闭并进行错误传播

---
#### `close` {#close}

关闭会话并清理资源。

此方法关闭底层连接并重置全局会话状态。调用此方法后，会话变为无效，不能用于进一步的查询。

**语法**

```python
close()
```

:::note
当会话作为上下文管理器使用或当会话对象被销毁时，自动调用此方法。
:::

:::warning 重要
在调用 `close()` 后，任何尝试使用会话的行为都将导致错误。
:::

**示例**

```pycon
>>> session = Session("test.db")
>>> session.query("SELECT 1")
>>> session.close()  # Explicitly close the session
```

---
#### `query` {#chdb-session-session-query}

执行 SQL 查询并返回结果。

此方法针对会话的数据库执行 SQL 查询，并以指定格式返回结果。该方法支持多种输出格式，并在查询之间保持会话状态。

**语法**

```python
query(sql, fmt='CSV', udf_path='')
```

**参数**

| 参数      | 类型  | 默认值        | 描述                                                                                                                                                                                                                                                                                                                 |
|-----------|-------|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`     | str   | *必填*       | 要执行的 SQL 查询字符串                                                                                                                                                                                                                                                                                             |
| `fmt`     | str   | `"CSV"`      | 结果的输出格式。可用格式：<br/>• `"CSV"` - 逗号分隔值<br/>• `"JSON"` - JSON 格式<br/>• `"TabSeparated"` - 制表符分隔值<br/>• `"Pretty"` - 美化显示的表格格式<br/>• `"JSONCompact"` - 紧凑的 JSON 格式<br/>• `"Arrow"` - Apache Arrow 格式<br/>• `"Parquet"` - Parquet 格式 |
| `udf_path`| str   | `""`         | 用户定义函数的路径。如果未指定，则使用会话初始化的 UDF 路径                                                                                                                                                                                                                                                      |

**返回值**

以指定格式返回查询结果。
确切的返回类型取决于格式参数：
- 字符串格式（CSV，JSON 等）返回 str
- 二进制格式（Arrow，Parquet）返回 bytes

**抛出异常**

| 异常          | 条件                           |
|---------------|--------------------------------|
| `RuntimeError` | 如果会话被关闭或无效          |
| `ValueError`   | 如果 SQL 查询格式不正确       |

:::note
“不支持调试”格式，将自动转换为“CSV”并发出警告。
对于调试，请使用连接字符串参数。
:::

:::warning 警告
此方法同步执行查询并将所有结果加载到内存中。对于大型结果集，请考虑使用 [`send_query()`](#chdb-session-session-send_query) 进行流式结果。
:::

**示例**

```pycon
>>> session = Session("test.db")
>>>
>>> # Basic query with default CSV format
>>> result = session.query("SELECT 1 as number")
>>> print(result)
number
1
```

```pycon
>>> # Query with JSON format
>>> result = session.query("SELECT 1 as number", fmt="JSON")
>>> print(result)
{"number": "1"}
```

```pycon
>>> # Complex query with table creation
>>> session.query("CREATE TABLE test (id INT, name String)")
>>> session.query("INSERT INTO test VALUES (1, 'Alice'), (2, 'Bob')")
>>> result = session.query("SELECT * FROM test ORDER BY id")
>>> print(result)
id,name
1,Alice
2,Bob
```

**另见**
- [`send_query()`](#chdb-session-session-send_query) - 用于流式查询执行
- [`sql`](#chdb-session-session-sql) - 此方法的别名

---
#### `send_query` {#chdb-session-session-send_query}

执行 SQL 查询并返回流式结果迭代器。

此方法针对会话的数据库执行 SQL 查询，并返回一个流式结果对象，允许您在不一次性将所有结果加载到内存中的情况下迭代结果。这对于大型结果集特别有用。

**语法**

```python
send_query(sql, fmt='CSV') → StreamingResult
```

**参数**

| 参数      | 类型  | 默认值        | 描述                                                                                                                                                                                                                                                                    |
|-----------|-------|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`     | str   | *必填*       | 要执行的 SQL 查询字符串                                                                                                                                                                                                                                                    |
| `fmt`     | str   | `"CSV"`      | 结果的输出格式。可用格式：<br/>• `"CSV"` - 逗号分隔值<br/>• `"JSON"` - JSON 格式<br/>• `"TabSeparated"` - 制表符分隔值<br/>• `"JSONCompact"` - 紧凑的 JSON 格式<br/>• `"Arrow"` - Apache Arrow 格式<br/>• `"Parquet"` - Parquet 格式 |

**返回值**

| 返回类型       | 描述                                                                                                                                      |
|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `StreamingResult` | 一个流式结果迭代器，可逐步产生查询结果。迭代器可以在 for 循环中使用或转换为其他数据结构 |

**抛出异常**

| 异常          | 条件                           |
|---------------|--------------------------------|
| `RuntimeError` | 如果会话被关闭或无效          |
| `ValueError`   | 如果 SQL 查询格式不正确       |

:::note
“不支持调试”格式，将自动转换为“CSV”并发出警告。对于调试，请使用连接字符串参数。
:::

:::warning
返回的 StreamingResult 对象应及时消耗或适当存储，因为它保持与数据库的连接。
:::

**示例**

```pycon
>>> session = Session("test.db")
>>> session.query("CREATE TABLE big_table (id INT, data String)")
>>>
>>> # Insert large dataset
>>> for i in range(1000):
...     session.query(f"INSERT INTO big_table VALUES ({i}, 'data_{i}')")
>>>
>>> # Stream results to avoid memory issues
>>> streaming_result = session.send_query("SELECT * FROM big_table ORDER BY id")
>>> for chunk in streaming_result:
...     print(f"Processing chunk: {len(chunk)} bytes")
...     # Process chunk without loading entire result set
```

```pycon
>>> # Using with context manager
>>> with session.send_query("SELECT COUNT(*) FROM big_table") as stream:
...     for result in stream:
...         print(f"Count result: {result}")
```

**另见**
- [`query()`](#chdb-session-session-query) - 用于非流式查询执行
- `chdb.state.sqlitelike.StreamingResult` - 流式结果迭代器

---
#### `sql` {#chdb-session-session-sql}

执行 SQL 查询并返回结果。

此方法针对会话的数据库执行 SQL 查询，并以指定格式返回结果。该方法支持多种输出格式，并在查询之间保持会话状态。

**语法**

```python
sql(sql, fmt='CSV', udf_path='')
```

**参数**

| 参数      | 类型  | 默认值        | 描述                                                                                                                                                                                                                                                                                                                  |
|-----------|-------|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`     | str   | *必填*       | 要执行的 SQL 查询字符串                                                                                                                                                                                                                                                                                             |
| `fmt`     | str   | `"CSV"`      | 结果的输出格式。可用格式：<br/>• `"CSV"` - 逗号分隔值<br/>• `"JSON"` - JSON 格式<br/>• `"TabSeparated"` - 制表符分隔值<br/>• `"Pretty"` - 美化显示的表格格式<br/>• `"JSONCompact"` - 紧凑的 JSON 格式<br/>• `"Arrow"` - Apache Arrow 格式<br/>• `"Parquet"` - Parquet 格式 |
| `udf_path`| str   | `""`         | 用户定义函数的路径。如果未指定，则使用会话初始化的 UDF 路径                                                                                                                                                                                                                                                      |

**返回值**

以指定格式返回查询结果。
确切的返回类型取决于格式参数：
- 字符串格式（CSV，JSON 等）返回 str
- 二进制格式（Arrow，Parquet）返回 bytes

**抛出异常：**

| 异常          | 条件                           |
|---------------|--------------------------------|
| `RuntimeError` | 如果会话被关闭或无效          |
| `ValueError`   | 如果 SQL 查询格式不正确       |

:::note
“不支持调试”格式，将自动转换为“CSV”并发出警告。对于调试，请使用连接字符串参数。
:::

:::warning 警告
此方法同步执行查询并将所有结果加载到内存中。
对于大型结果集，请考虑使用 [`send_query()`](#chdb-session-session-send_query) 进行流式结果。
:::

**示例**

```pycon
>>> session = Session("test.db")
>>>
>>> # Basic query with default CSV format
>>> result = session.query("SELECT 1 as number")
>>> print(result)
number
1
```

```pycon
>>> # Query with JSON format
>>> result = session.query("SELECT 1 as number", fmt="JSON")
>>> print(result)
{"number": "1"}
```

```pycon
>>> # Complex query with table creation
>>> session.query("CREATE TABLE test (id INT, name String)")
>>> session.query("INSERT INTO test VALUES (1, 'Alice'), (2, 'Bob')")
>>> result = session.query("SELECT * FROM test ORDER BY id")
>>> print(result)
id,name
1,Alice
2,Bob
```

**另见**
- [`send_query()`](#chdb-session-session-send_query) - 用于流式查询执行
- [`sql`](#chdb-session-session-sql) - 此方法的别名
## State Management {#chdb-state-management}
### `chdb.state.connect` {#chdb_state_connect}

创建与 chDB 后台服务器的 [连接](#chdb-state-sqlitelike-connection)。

此函数与 chDB (ClickHouse) 数据库引擎建立连接。
每个进程仅允许一个打开的连接。多次使用相同连接字符串调用将返回相同的连接对象。

**语法**

```python
chdb.state.connect(connection_string: str = ':memory:') → Connection
```

**参数**

| 参数                          | 类型  | 默认值        | 描述                                    |
|-------------------------------|-------|---------------|-----------------------------------------|
| `connection_string(str, optional)` | str   | `":memory:"` | 数据库连接字符串。见下文格式。 |

**基本格式**

支持的连接字符串格式：

| 格式                      | 描述                       |
|---------------------------|----------------------------|
| `":memory:"`              | 内存数据库（默认）         |
| `"test.db"`               | 相对路径数据库文件         |
| `"file:test.db"`          | 与相对路径相同             |
| `"/path/to/test.db"`      | 绝对路径数据库文件         |
| `"file:/path/to/test.db"` | 与绝对路径相同             |

**带查询参数的格式**

| 格式                                             | 描述                        |
|--------------------------------------------------|-----------------------------|
| `"file:test.db?param1=value1&param2=value2"`       | 带参数的相对路径            |
| `"file::memory:?verbose&log-level=test"`           | 带参数的内存数据库          |
| `"///path/to/test.db?param1=value1&param2=value2"` | 带参数的绝对路径            |

**查询参数处理**

查询参数作为启动参数传递给 ClickHouse 引擎。特殊参数处理：

| 特殊参数         | 变为              | 描述                    |
|-------------------|-------------------|-------------------------|
| `mode=ro`         | `--readonly=1`     | 只读模式                |
| `verbose`         | （标志）          | 启用详细日志记录        |
| `log-level=test`  | （设置）          | 设置日志级别            |

有关完整的参数列表，请参见 `clickhouse local --help --verbose`

**返回值**

| 返回类型    | 描述                                                                                                                                                                                                                                      |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Connection` | 支持的数据库连接对象：<br/>• 使用 `Connection.cursor()` 创建游标<br/>• 使用 `Connection.query()` 直接查询<br/>• 使用 `Connection.send_query()` 流式查询<br/>• 支持自动清理的上下文管理器协议     |

**抛出异常**

| 异常          | 条件                       |
|---------------|-----------------------------|
| `RuntimeError` | 如果连接到数据库失败     |

:::warning 警告
每个进程只支持一个连接。
创建新连接将关闭任何现有的连接。
:::

**示例**

```pycon
>>> # In-memory database
>>> conn = connect()
>>> conn = connect(":memory:")
>>>
>>> # File-based database
>>> conn = connect("my_data.db")
>>> conn = connect("/path/to/data.db")
>>>
>>> # With parameters
>>> conn = connect("data.db?mode=ro")  # Read-only mode
>>> conn = connect(":memory:?verbose&log-level=debug")  # Debug logging
>>>
>>> # Using context manager for automatic cleanup
>>> with connect("data.db") as conn:
...     result = conn.query("SELECT 1")
...     print(result)
>>> # Connection automatically closed
```

**另见**
- `Connection` - 数据库连接类
- `Cursor` - 用于 DB-API 2.0 操作的数据库游标
### **class** `chdb.state.sqlitelike.Connection` {#chdb-state-sqlitelike-connection}

基类：`object`

**语法**

```python
class chdb.state.sqlitelike.Connection(connection_string: str)
```

---
#### `close` {#chdb-session-session-close}

关闭连接并清理资源。

此方法关闭数据库连接并清理任何相关资源，包括活动游标。调用此方法后，连接变为无效，不能用于进一步的操作。

**语法**

```python
close() → None
```

:::note
此方法是幂等的 - 多次调用是安全的。
:::

:::warning 警告
任何正在进行的流式查询将在连接关闭时被取消。在关闭之前，请确保处理所有重要数据。
:::

**示例**

```pycon
>>> conn = connect("test.db")
>>> # Use connection for queries
>>> conn.query("CREATE TABLE test (id INT)")
>>> # Close when done
>>> conn.close()
```

```pycon
>>> # Using with context manager (automatic cleanup)
>>> with connect("test.db") as conn:
...     conn.query("SELECT 1")
...     # Connection automatically closed
```

---
#### `cursor` {#chdb-state-sqlitelike-connection-cursor}

创建一个 [Cursor](#chdb-state-sqlitelike-cursor) 对象以执行查询。

此方法创建一个数据库游标，提供标准的
DB-API 2.0 接口来执行查询和提取结果。
游标允许对查询执行和结果检索进行精细控制。

**语法**

```python
cursor() → Cursor
```

**返回**

| 返回类型   | 描述                                  |
|------------|---------------------------------------|
| `Cursor`   | 用于数据库操作的游标对象             |

:::note
创建新游标将替换与此连接相关的任何现有游标。每个连接仅支持一个游标。
:::

**示例**

```pycon
>>> conn = connect(":memory:")
>>> cursor = conn.cursor()
>>> cursor.execute("CREATE TABLE test (id INT, name String)")
>>> cursor.execute("INSERT INTO test VALUES (1, 'Alice')")
>>> cursor.execute("SELECT * FROM test")
>>> rows = cursor.fetchall()
>>> print(rows)
((1, 'Alice'),)
```

**另请参见**
- [`Cursor`](#chdb-state-sqlitelike-cursor) - 数据库游标实现

---
#### `query` {#chdb-state-sqlitelike-connection-query}

执行 SQL 查询并返回完整结果。

此方法同步执行 SQL 查询并返回完整
结果集。它支持各种输出格式并自动应用
格式特定的后处理。

**语法**

```python
query(query: str, format: str = 'CSV') → Any
```

**参数：**

| 参数       | 类型   | 默认值       | 描述                                                                                                                                                                                                                           |
|------------|--------|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `query`    | str    | *必需*      | 要执行的 SQL 查询字符串                                                                                                                                                                                                        |
| `format`   | str    | `"CSV"`      | 结果的输出格式。支持的格式：<br/>• `"CSV"` - 逗号分隔值（字符串）<br/>• `"JSON"` - JSON 格式（字符串）<br/>• `"Arrow"` - Apache Arrow 格式（字节）<br/>• `"Dataframe"` - Pandas DataFrame（需要 pandas）<br/>• `"Arrowtable"` - PyArrow 表（需要 pyarrow） |

**返回**

| 返回类型               | 描述                                 |
|------------------------|--------------------------------------|
| `str`                  | 对于字符串格式（CSV，JSON）          |
| `bytes`                | 对于 Arrow 格式                      |
| `pandas.DataFrame`     | 对于数据框格式                       |
| `pyarrow.Table`        | 对于箭头表格式                       |

**引发**

| 异常            | 条件                                             |
|----------------|--------------------------------------------------|
| `RuntimeError` | 如果查询执行失败                               |
| `ImportError`  | 如果所需的格式包未安装                         |

:::warning 警告
此方法将整个结果集加载到内存中。对于大型结果，请考虑使用 [`send_query()`](#chdb-state-sqlitelike-connection-send_query) 进行流式处理。
:::

**示例**

```pycon
>>> conn = connect(":memory:")
>>>
>>> # Basic CSV query
>>> result = conn.query("SELECT 1 as num, 'hello' as text")
>>> print(result)
num,text
1,hello
```

```pycon
>>> # DataFrame format
>>> df = conn.query("SELECT number FROM numbers(5)", "dataframe")
>>> print(df)
   number
0       0
1       1
2       2
3       3
4       4
```

**另请参见**
- [`send_query()`](#chdb-state-sqlitelike-connection-send_query) - 用于流式查询执行

---
#### `send_query` {#chdb-state-sqlitelike-connection-send_query}

执行 SQL 查询并返回流式结果迭代器。

此方法执行 SQL 查询并返回一个 StreamingResult 对象
，允许您迭代结果而不一次性加载所有内容。
这对于处理大型结果集非常理想。

**语法**

```python
send_query(query: str, format: str = 'CSV') → StreamingResult
```

**参数**

| 参数       | 类型   | 默认值       | 描述                                                                                                                                                                                                  |
|------------|--------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `query`    | str    | *必需*      | 要执行的 SQL 查询字符串                                                                                                                                                                            |
| `format`   | str    | `"CSV"`      | 结果的输出格式。支持的格式：<br/>• `"CSV"` - 逗号分隔值<br/>• `"JSON"` - JSON 格式<br/>• `"Arrow"` - Apache Arrow 格式（启用 record_batch() 方法）<br/>• `"dataframe"` - Pandas DataFrame 片段<br/>• `"arrowtable"` - PyArrow 表片段 |

**返回**

| 返回类型              | 描述                                                                                                                                                                                                 |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `StreamingResult`    | 一个流式迭代器，用于查询结果，支持：<br/>• 迭代器协议（for 循环）<br/>• 上下文管理器协议（with 语句）<br/>• 使用 fetch() 方法手动提取<br/>• PyArrow RecordBatch 流式（仅限 Arrow 格式） |

**引发**

| 异常            | 条件                                             |
|----------------|--------------------------------------------------|
| `RuntimeError` | 如果查询执行失败                               |
| `ImportError`  | 如果所需的格式包未安装                         |

:::note
仅 “Arrow” 格式支持返回的 StreamingResult 上的 `record_batch()` 方法。
:::

**示例**

```pycon
>>> conn = connect(":memory:")
>>>
>>> # Basic streaming
>>> stream = conn.send_query("SELECT number FROM numbers(1000)")
>>> for chunk in stream:
...     print(f"Processing chunk: {len(chunk)} bytes")
```

```pycon
>>> # Using context manager for cleanup
>>> with conn.send_query("SELECT * FROM large_table") as stream:
...     chunk = stream.fetch()
...     while chunk:
...         process_data(chunk)
...         chunk = stream.fetch()
```

```pycon
>>> # Arrow format with RecordBatch streaming
>>> stream = conn.send_query("SELECT * FROM data", "Arrow")
>>> reader = stream.record_batch(rows_per_batch=10000)
>>> for batch in reader:
...     print(f"Batch shape: {batch.num_rows} x {batch.num_columns}")
```

**另请参见**
- [`query()`](#chdb-state-sqlitelike-connection-query) - 用于非流式查询执行
- `StreamingResult` - 流式结果迭代器

---
### **class** `chdb.state.sqlitelike.Cursor` {#chdb-state-sqlitelike-cursor}

基于：`object`

```python
class chdb.state.sqlitelike.Cursor(connection)
```

---
#### `close` {#cursor-close-none}

关闭游标并清理资源。

此方法关闭游标并清理任何相关资源。
调用此方法后，游标变得无效，无法用于进一步操作。

**语法**

```python
close() → None
```

:::note
此方法是幂等的 - 多次调用是安全的。
连接关闭时，游标也会自动关闭。
:::

**示例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT 1")
>>> result = cursor.fetchone()
>>> cursor.close()  # Cleanup cursor resources
```

---
#### `column_names` {#chdb-state-sqlitelike-cursor-column_names}

从最后执行的查询中返回列名列表。

此方法返回最近执行的 SELECT 查询中的列名。名称的返回顺序与它们在结果集中的出现顺序相同。

**语法**

```python
column_names() → list
```

**返回**

| 返回类型 | 描述                                                                                     |
|----------|------------------------------------------------------------------------------------------|
| `list`   | 列名字符串的列表，如果没有执行查询或查询未返回列，则返回空列表                           |

**示例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name, email FROM users LIMIT 1")
>>> print(cursor.column_names())
['id', 'name', 'email']
```

**另请参见**
- [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - 获取列类型信息
- [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0 列描述

---
#### `column_types` {#chdb-state-sqlitelike-cursor-column_types}

返回最后执行的查询中的列类型列表。

此方法返回最近执行的 SELECT 查询中的 ClickHouse 列类型名称。类型的返回顺序与它们在结果集中的出现顺序相同。

**语法**

```python
column_types() → list
```

**返回**

| 返回类型 | 描述                                                                         |
|----------|------------------------------------------------------------------------------|
| `list`   | ClickHouse 类型名称字符串的列表，如果没有执行查询或查询未返回列，则返回空列表 |

**示例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT toInt32(1), toString('hello')")
>>> print(cursor.column_types())
['Int32', 'String']
```

**另请参见**
- [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - 获取列名信息
- [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0 列描述

---
#### `commit` {#commit}

提交任何待处理的事务。

此方法提交任何待处理的数据库事务。在 ClickHouse 中，
大多数操作是自动提交的，但此方法用于
DB-API 2.0 兼容性。

:::note
ClickHouse 通常自动提交操作，因此通常不需要显式提交。
此方法的提供是为了与标准 DB-API 2.0 工作流兼容。
:::

**语法**

```python
commit() → None
```

**示例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("INSERT INTO test VALUES (1, 'data')")
>>> cursor.commit()
```

---
#### `property description : list` {#chdb-state-sqlitelike-cursor-description}

根据 DB-API 2.0 规范返回列描述。

此属性返回描述最后执行的 SELECT 查询中每列的 7 项元组列表。每个元组包含：
(name, type_code, display_size, internal_size, precision, scale, null_ok)

目前，仅提供名称和类型代码，其他字段设置为 None。

**返回**

| 返回类型 | 描述                                                                                |
|----------|-------------------------------------------------------------------------------------|
| `list`   | 描述每一列的 7 元组列表，如果没有执行 SELECT 查询，则返回空列表                   |

:::note
这遵循 DB-API 2.0 关于 cursor.description 的规范。
在此实现中，只有前两个元素（名称和类型代码）包含有意义的数据。
:::

**示例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users LIMIT 1")
>>> for desc in cursor.description:
...     print(f"Column: {desc[0]}, Type: {desc[1]}")
Column: id, Type: Int32
Column: name, Type: String
```

**另请参见**
- [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - 仅获取列名
- [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - 仅获取列类型

---
#### `execute` {#execute}

执行 SQL 查询并准备结果以供提取。

此方法执行 SQL 查询并准备结果以供使用
提取方法检索。它处理结果数据的解析和
ClickHouse 数据类型的自动类型转换。

**语法**

```python
execute(query: str) → None
```

**参数：**

| 参数       | 类型   | 描述                           |
|------------|--------|---------------------------------|
| `query`    | str    | 要执行的 SQL 查询字符串       |

**引发**

| 异常      | 条件                       |
|------------|----------------------------|
| `Exception` | 如果查询执行失败或结果解析失败 |

:::note
此方法遵循 DB-API 2.0 规范，适用于 `cursor.execute()`。
执行后，使用 `fetchone()`、`fetchmany()` 或 `fetchall()` 来
检索结果。
:::

:::note
该方法会自动将 ClickHouse 数据类型转换为适当的
Python 类型：

- Int/UInt 类型 → int
- Float 类型 → float
- String/FixedString → str
- DateTime → datetime.datetime
- Date → datetime.date
- Bool → bool
:::

**示例**

```pycon
>>> cursor = conn.cursor()
>>>
>>> # Execute DDL
>>> cursor.execute("CREATE TABLE test (id INT, name String)")
>>>
>>> # Execute DML
>>> cursor.execute("INSERT INTO test VALUES (1, 'Alice')")
>>>
>>> # Execute SELECT and fetch results
>>> cursor.execute("SELECT * FROM test")
>>> rows = cursor.fetchall()
>>> print(rows)
((1, 'Alice'),)
```

**另请参见**
- [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 获取单行
- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 获取多行
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 获取所有剩余行

---
#### `fetchall` {#chdb-state-sqlitelike-cursor-fetchall}

从查询结果中获取所有剩余行。

此方法检索当前查询结果集中的所有剩余行，从当前游标位置开始。
它返回一个行元组的元组，并应用适当的 Python 类型转换。

**语法**

```python
fetchall() → tuple
```

**返回：**

| 返回类型 | 描述                               |
|----------|------------------------------------|
| `tuple`  | 包含结果集所有剩余行元组的元组。如果没有行可用，则返回空元组 |

:::warning 警告
此方法一次性加载所有剩余行到内存中。对于大型结果集，请考虑使用 [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) 来批量处理结果。
:::

**示例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users")
>>> all_users = cursor.fetchall()
>>> for user_id, user_name in all_users:
...     print(f"User {user_id}: {user_name}")
```

**另请参见**
- [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 获取单行
- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 批量获取多行

---
#### `fetchmany` {#chdb-state-sqlitelike-cursor-fetchmany}

从查询结果中获取多行。

此方法从当前查询结果集中检索多达 'size' 行。它返回一个行元组的元组，每一行包含适当的 Python 类型转换的列值。

**语法**

```python
fetchmany(size: int = 1) → tuple
```

**参数**

| 参数       | 类型   | 默认值 | 描述                       |
|------------|--------|--------|-----------------------------|
| `size`     | int    | `1`    | 要获取的最大行数         |

**返回**

| 返回类型 | 描述                                                                           |
|----------|-----------------------------------------------------------------------------------|
| `tuple`  | 包含多达 'size' 行元组的元组。如果结果集耗尽，可能包含更少的行               |

:::note
此方法遵循 DB-API 2.0 规范。如果结果集耗尽，它会返回少于 'size' 的行。
:::

**示例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT * FROM large_table")
>>>
>>> # Process results in batches
>>> while True:
...     batch = cursor.fetchmany(100)  # Fetch 100 rows at a time
...     if not batch:
...         break
...     process_batch(batch)
```

**另请参见**
- [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 获取单行
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 获取所有剩余行

---
#### `fetchone` {#chdb-state-sqlitelike-cursor-fetchone}

从查询结果中获取下一行。

此方法从当前查询结果集中检索下一个可用行。它返回一个元组，包含适当的 Python 类型转换的列值。

**语法**

```python
fetchone() → tuple | None
```

**返回：**

| 返回类型       | 描述                                                                        |
|----------------|-------------------------------------------------------------------------------|
| `Optional[tuple]` | 下一行作为列值的元组，如果没有更多行可用，则返回 None                  |

:::note
此方法遵循 DB-API 2.0 规范。列值根据
ClickHouse 列类型自动转换为适当的 Python 类型。
:::

**示例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users")
>>> row = cursor.fetchone()
>>> while row is not None:
...     user_id, user_name = row
...     print(f"User {user_id}: {user_name}")
...     row = cursor.fetchone()
```

**另请参见**
- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 获取多行
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 获取所有剩余行

---
### `chdb.state.sqlitelike` {#state-sqlitelike-to_arrowtable}

将查询结果转换为 PyArrow 表。

此函数将 chdb 查询结果转换为 PyArrow 表格式，
提供高效的列式数据访问和与其他数据处理库的互操作性。

**语法**

```python
chdb.state.sqlitelike.to_arrowTable(res)
```

**参数：**

| 参数       | 类型   | 描述                                             |
|------------|--------|----------------------------------------------------|
| `res`      | -      | 从 chdb 查询结果对象，包含 Arrow 格式数据      |

**返回**

| 返回类型         | 描述                                   |
|-------------------|----------------------------------------|
| `pyarrow.Table`   | 包含查询结果的 PyArrow 表              |

**引发**

| 异常         | 条件                                       |
|---------------|---------------------------------------------|
| `ImportError` | 如果未安装 pyarrow 或 pandas 包         |

:::note
此函数需要同时安装 pyarrow 和 pandas。
使用以下命令安装：`pip install pyarrow pandas`
:::

:::warning 警告
空结果返回一个没有模式的空 PyArrow 表。
:::

**示例**

```pycon
>>> import chdb
>>> result = chdb.query("SELECT 1 as num, 'hello' as text", "Arrow")
>>> table = to_arrowTable(result)
>>> print(table.schema)
num: int64
text: string
>>> print(table.to_pandas())
   num   text
0    1  hello
```

---
### `chdb.state.sqlitelike.to_df` {#state-sqlitelike-to_df}

将查询结果转换为 Pandas DataFrame。

此函数通过先转换为 PyArrow 表，然后再转换为 DataFrame，将 chdb 查询结果转换为 Pandas DataFrame 格式。这样提供了使用 Pandas API 进行便捷数据分析的能力。

**语法**

```python
chdb.state.sqlitelike.to_df(r)
```

**参数：**

| 参数       | 类型   | 描述                                             |
|------------|--------|----------------------------------------------------|
| `r`        | -      | 从 chdb 查询结果对象，包含 Arrow 格式数据      |

**返回：**

| 返回类型            | 描述                                                                           |
|--------------------|---------------------------------------------------------------------------------|
| `pandas.DataFrame` | 包含查询结果的 DataFrame，具有适当的列名和数据类型                                |

**引发**

| 异常          | 条件                                     |
|---------------|-------------------------------------------|
| `ImportError` | 如果未安装 pyarrow 或 pandas 包          |

:::note
此函数使用多线程将 Arrow 转换为 Pandas，以提高大型数据集的性能。
:::

**另请参见**
- [`to_arrowTable()`](#chdb-state-sqlitelike-to_arrowtable) - 用于 PyArrow 表格式转换

**示例**

```pycon
>>> import chdb
>>> result = chdb.query("SELECT 1 as num, 'hello' as text", "Arrow")
>>> df = to_df(result)
>>> print(df)
   num   text
0    1  hello
>>> print(df.dtypes)
num      int64
text    object
dtype: object
```
## DataFrame 集成 {#dataframe-integration}
### **class** `chdb.dataframe.Table` {#chdb-dataframe-table}

基于：

```python
class chdb.dataframe.Table(*args: Any, **kwargs: Any)
```
## 数据库 API (DBAPI) 2.0 接口 {#database-api-interface}

chDB 提供与数据库连接的 Python DB-API 2.0 兼容接口，允许您将 chDB 与期望标准数据库接口的工具和框架一起使用。

chDB DB-API 2.0 接口包括：

- **连接**：数据库连接管理与连接字符串
- **游标**：查询执行和结果检索
- **类型系统**：与 DB-API 2.0 兼容的类型常量和转换器
- **错误处理**：标准数据库异常层次结构
- **线程安全**：级别 1 线程安全（线程可以共享模块但不能共享连接）

---
### 核心功能 {#core-functions}

数据库 API (DBAPI) 2.0 接口实现以下核心功能：
#### `chdb.dbapi.connect` {#dbapi-connect}

初始化新的数据库连接。

**语法**

```python
chdb.dbapi.connect(*args, **kwargs)
```

**参数**

| 参数       | 类型   | 默认值  | 描述                                        |
|------------|--------|---------|-----------------------------------------------|
| `path`     | str    | `None`  | 数据库文件路径。对于内存数据库为 None |

**引发**

| 异常                            | 条件                              |
|----------------------------------|-----------------------------------|
| [`err.Error`](#chdb-dbapi-err-error) | 如果无法建立连接                      |

---
#### `chdb.dbapi.get_client_info()` {#dbapi-get-client-info}

获取客户端版本信息。

返回 chDB 客户端版本的字符串，以兼容 MySQLdb。

**语法**

```python
chdb.dbapi.get_client_info()
```

**返回**

| 返回类型  | 描述                                           |
|------------|------------------------------------------------|
| `str`      | 版本字符串，格式为 'major.minor.patch'       |

---
### 类型构造器 {#type-constructors}
#### `chdb.dbapi.Binary(x)` {#dbapi-binary}

将 x 作为二进制类型返回。

此函数将输入转换为字节类型，以用于数据库字段，符合 DB-API 2.0 规范。

**语法**

```python
chdb.dbapi.Binary(x)
```

**参数**

| 参数       | 类型   | 描述                                      |
|------------|--------|--------------------------------------------|
| `x`        | -      | 要转换为二进制的输入数据                    |

**返回**

| 返回类型  | 描述                         |
|------------|------------------------------|
| `bytes`    | 转换为字节的输入              |

---
### 连接类 {#connection-class}
#### **class** `chdb.dbapi.connections.Connection(path=None)` {#chdb-dbapi-connections-connection}

基于：`object`

与 chDB 数据库的 DB-API 2.0 兼容连接。

此类提供与 chDB 数据库连接和交互的标准 DB-API 接口。它支持内存和基于文件的数据库。

连接管理底层的 chDB 引擎，提供执行查询、管理事务（对于 ClickHouse 为无操作）和创建游标的方法。

```python
class chdb.dbapi.connections.Connection(path=None)
```

**参数**

| 参数       | 类型   | 默认值  | 描述                                                                                          |
|------------|--------|----------|-------------------------------------------------------------------------------------------------|
| `path`     | str    | `None`   | 数据库文件路径。如果为 None，则使用内存数据库。可以是类似 'database.db' 的文件路径或 ':memory:'  |

**变量**

| 变量       | 类型   | 描述                                         |
|------------|--------|-----------------------------------------------|
| `encoding` | str    | 查询的字符编码，默认为 'utf8'                 |
| `open`     | bool   | 如果连接处于打开状态则为 True，若已关闭则为 False |

**示例**

```pycon
>>> # In-memory database
>>> conn = Connection()
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT 1")
>>> result = cursor.fetchall()
>>> conn.close()
```

```pycon
>>> # File-based database
>>> conn = Connection('mydata.db')
>>> with conn.cursor() as cur:
...     cur.execute("CREATE TABLE users (id INT, name STRING)")
...     cur.execute("INSERT INTO users VALUES (1, 'Alice')")
>>> conn.close()
```

```pycon
>>> # Context manager usage
>>> with Connection() as cur:
...     cur.execute("SELECT version()")
...     version = cur.fetchone()
```

:::note
ClickHouse 不支持传统事务，因此 commit() 和 rollback()
操作为无操作，但为了兼容 DB-API 提供。
:::

---
#### `close` {#dbapi-connection-close}

关闭数据库连接。

关闭底层的 chDB 连接并将此连接标记为已关闭。
对此连接的后续操作将引发错误。

**语法**

```python
close()
```

**引发**

| 异常                            | 条件                             |
|--------------------------------  |-----------------------------------|
| [`err.Error`](#chdb-dbapi-err-error) | 如果连接已关闭                      |

---
#### `commit` {#dbapi-commit}

提交当前事务。

**语法**

```python
commit()
```

:::note
这对于 chDB/ClickHouse 是无操作的，因为它不支持传统事务。 为了兼容 DB-API 2.0 提供。
:::

---
#### `cursor` {#dbapi-cursor}

创建一个新的游标以执行查询。

**语法**

```python
cursor(cursor=None)
```

**参数**

| 参数       | 类型   | 描述                                   |
|------------|--------|-----------------------------------------|
| `cursor`   | -      | 被忽略，提供兼容性                     |

**返回**

| 返回类型   | 描述                                 |
|------------|---------------------------------------|
| `Cursor`   | 此连接的新游标对象                   |

**引发**

| 异常                            | 条件                                 |
|----------------------------------|---------------------------------------|
| [`err.Error`](#chdb-dbapi-err-error) | 如果连接已关闭                           |

**示例**

```pycon
>>> conn = Connection()
>>> cur = conn.cursor()
>>> cur.execute("SELECT 1")
>>> result = cur.fetchone()
```

---
#### `escape` {#escape}

转义值以安全地包括在 SQL 查询中。

**语法**

```python
escape(obj, mapping=None)
```

**参数**

| 参数       | 类型   | 描述                                    |
|------------|--------|------------------------------------------|
| `obj`      | -      | 要转义的值（字符串，字节，数字等）        |
| `mapping`  | -      | 可选字符映射以进行转义                 |

**返回**

| 返回类型  | 描述                                                    |
|------------|---------------------------------------------------------|
| -          | 输入的转义版本，适合于 SQL 查询                         |

**示例**

```pycon
>>> conn = Connection()
>>> safe_value = conn.escape("O'Reilly")
>>> query = f"SELECT * FROM users WHERE name = {safe_value}"
```

---
#### `escape_string` {#escape-string}

对字符串值进行转义以用于 SQL 查询。

**语法**

```python
escape_string(s)
```

**参数**

| 参数       | 类型   | 描述                       |
|------------|--------|-----------------------------|
| `s`        | str    | 要转义的字符串               |

**返回**

| 返回类型  | 描述                                  |
|------------|---------------------------------------|
| `str`      | 安全的转义字符串以包括在 SQL 中      |

---
#### `property open` {#property-open}

检查连接是否打开。

**返回**

| 返回类型  | 描述                                    |
|------------|------------------------------------------|
| `bool`     | 如果连接是打开的，则为 True，关闭时为 False |

---
#### `query` {#dbapi-query}

直接执行 SQL 查询并返回原始结果。

此方法绕过游标接口，直接执行查询。
对于标准的 DB-API 使用，建议使用 cursor() 方法。

**语法**

```python
query(sql, fmt='CSV')
```

**参数：**

| 参数          | 类型         | 默认值      | 描述                                                                      |
|---------------|--------------|--------------|---------------------------------------------------------------------------|
| `sql`         | str 或 bytes | *必需*      | 要执行的 SQL 查询                                                         |
| `fmt`         | str          | `"CSV"`      | 输出格式。支持的格式包括 "CSV"、"JSON"、"Arrow"、"Parquet" 等等 |

**返回**

| 返回类型  | 描述                              |
|------------|-----------------------------------|
| -          | 以指定格式返回的查询结果          |

**引发**

| 异常                                              | 条件                                |
|--------------------------------------------------|-------------------------------------|
| [`err.InterfaceError`](#chdb-dbapi-err-interfaceerror) | 如果连接已关闭或查询失败           |

**示例**

```pycon
>>> conn = Connection()
>>> result = conn.query("SELECT 1, 'hello'", "CSV")
>>> print(result)
"1,hello\n"
```

---
#### `property resp` {#property-resp}

获取最后查询响应。

**返回**

| 返回类型  | 描述                                    |
|------------|------------------------------------------|
| -          | 来自最后一次 query() 调用的原始响应   |

:::note
每次直接调用 query() 时，此属性都会更新。
它不反映通过游标执行的查询。
:::

---
#### `rollback` {#rollback}

回滚当前事务。

**语法**

```python
rollback()
```

:::note
这对于 chDB/ClickHouse 是无操作的，因为它不支持传统事务。 为了兼容 DB-API 2.0 提供。
:::

---
### 游标类 {#cursor-class}
#### **class** `chdb.dbapi.cursors.Cursor` {#chdb-dbapi-cursors-cursor}

基于：`object`

用于执行查询和获取结果的 DB-API 2.0 游标。

游标提供执行 SQL 语句、管理查询结果和在结果集间导航的方法。它支持参数绑定、批量操作，并遵循 DB-API 2.0 规范。

请勿直接创建 Cursor 实例。请使用 `Connection.cursor()` 代替。

```python
class chdb.dbapi.cursors.Cursor(connection)
```

| 变量            | 类型   | 描述                                          |
|-----------------|--------|-----------------------------------------------|
| `description`   | tuple  | 最近查询结果的列元数据                       |
| `rowcount`      | int    | 最近查询影响的行数（如果未知则为 -1）       |
| `arraysize`     | int    | 默认一次获取行数（默认为 1）                 |
| `lastrowid`     | -      | 最近插入行的 ID（如果适用）                  |
| `max_stmt_length` | int   | executemany() 的最大语句大小（默认为 1024000） |

**示例**

```pycon
>>> conn = Connection()
>>> cur = conn.cursor()
>>> cur.execute("SELECT 1 as id, 'test' as name")
>>> result = cur.fetchone()
>>> print(result)  # (1, 'test')
>>> cur.close()
```

:::note
请参见 [DB-API 2.0 Cursor 对象](https://www.python.org/dev/peps/pep-0249/#cursor-objects) 获取完整的规范细节。
:::

---
#### `callproc` {#callproc}

执行存储过程（占位实现）。

**语法**

```python
callproc(procname, args=())
```

**参数**

| 参数         | 类型     | 描述                                       |
|--------------|----------|---------------------------------------------|
| `procname`   | str      | 要执行的存储过程名称                        |
| `args`       | sequence | 传递给过程的参数                           |

**返回**

| 返回类型   | 描述                                     |
|-------------|------------------------------------------|
| `sequence`  | 原始的 args 参数（未修改）                |

:::note
chDB/ClickHouse 不支持传统意义上的存储过程。
此方法用于 DB-API 2.0 兼容性，但不执行任何实际操作。请使用 execute() 执行所有 SQL 操作。
:::

:::warning 兼容性
这是一个占位实现。传统存储过程的特性，如 OUT/INOUT 参数、多结果集和服务器变量，未被底层 ClickHouse 引擎支持。
:::

---
#### `close` {#dbapi-cursor-close}

关闭游标并释放相关资源。

关闭后，游标变得不可用，任何操作都会引发异常。
关闭游标会耗尽所有剩余数据，并释放底层游标。

**语法**

```python
close()
```


#### `execute` {#dbapi-execute}

执行带有可选参数绑定的 SQL 查询。

此方法执行单个 SQL 语句，并可选地进行参数替换。
它支持多种参数占位符样式，以提高灵活性。

**语法**

```python
execute(query, args=None)
```

**参数**

| 参数        | 类型               | 默认值      | 描述                                |
|-------------|-------------------|-------------|-------------------------------------|
| `query`     | str               | *必填*      | 要执行的 SQL 查询                    |
| `args`      | tuple/list/dict   | `None`      | 要绑定到占位符的参数                 |

**返回**

| 返回类型    | 描述                                   |
|-------------|----------------------------------------|
| `int`       | 受影响的行数（-1 如果未知）            |

**参数样式**

| 样式                 | 示例                                               |
|----------------------|----------------------------------------------------|
| 问号样式            | `"SELECT * FROM users WHERE id = ?"`             |
| 命名样式            | `"SELECT * FROM users WHERE name = %(name)s"`      |
| 格式样式            | `"SELECT * FROM users WHERE age = %s"`（遗留） |

**示例**

```pycon
>>> # Question mark parameters
>>> cur.execute("SELECT * FROM users WHERE id = ? AND age > ?", (123, 18))
>>>
>>> # Named parameters
>>> cur.execute("SELECT * FROM users WHERE name = %(name)s", {'name': 'Alice'})
>>>
>>> # No parameters
>>> cur.execute("SELECT COUNT(*) FROM users")
```

**引发异常**

| 异常                                                  | 条件                                      |
|-------------------------------------------------------|-------------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 如果游标已关闭或查询格式不正确           |
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror)     | 如果在执行过程中发生数据库错误           |

---
#### `executemany(query, args)` {#chdb-dbapi-cursors-cursor-executemany}

使用不同参数集多次执行查询。

此方法高效地多次执行相同的 SQL 查询，并使用不同的参数值。它特别适合用于批量 INSERT 操作。

**语法**

```python
executemany(query, args)
```

**参数**

| 参数        | 类型      | 描述                                         |
|-------------|-----------|----------------------------------------------|
| `query`     | str       | 要多次执行的 SQL 查询                        |
| `args`      | sequence  | 每次执行的参数元组/字典/列表序列            |

**返回**

| 返回类型    | 描述                                             |
|-------------|--------------------------------------------------|
| `int`       | 所有执行中受影响的行的总数                       |

**示例**

```pycon
>>> # Bulk insert with question mark parameters
>>> users_data = [(1, 'Alice'), (2, 'Bob'), (3, 'Charlie')]
>>> cur.executemany("INSERT INTO users VALUES (?, ?)", users_data)
>>>
>>> # Bulk insert with named parameters
>>> users_data = [
...     {'id': 1, 'name': 'Alice'},
...     {'id': 2, 'name': 'Bob'}
... ]
>>> cur.executemany(
...     "INSERT INTO users VALUES (%(id)s, %(name)s)",
...     users_data
... )
```

:::note
此方法通过优化查询执行过程来提高多行 INSERT 和 UPDATE 操作的性能。
:::

---
#### `fetchall()` {#dbapi-fetchall}

从查询结果中获取所有剩余行。

**语法**

```python
fetchall()
```

**返回**

| 返回类型    | 描述                                     |
|-------------|------------------------------------------|
| `list`      | 表示所有剩余行的元组列表                 |

**引发异常**

| 异常                                                  | 条件                                       |
|-------------------------------------------------------|--------------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 如果没有先调用 `execute()`                 |

:::warning 警告
此方法对于大型结果集可能会消耗大量内存。
考虑在处理大数据集时使用 `fetchmany()`。
:::

**示例**

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> all_rows = cursor.fetchall()
>>> print(len(all_rows))  # Number of total rows
```

---
#### `fetchmany` {#dbapi-fetchmany}

从查询结果中获取多个行。

**语法**

```python
fetchmany(size=1)
```

**参数**

| 参数        | 类型  | 默认值  | 描述                            |
|-------------|-------|---------|----------------------------------|
| `size`      | int   | `1`     | 要获取的行数。如果未指定，则使用 cursor.arraysize |

**返回**

| 返回类型    | 描述                                  |
|-------------|---------------------------------------|
| `list`      | 表示获取行的元组列表                  |

**引发异常**

| 异常                                                  | 条件                                       |
|-------------------------------------------------------|--------------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 如果没有先调用 `execute()`                 |

**示例**

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> rows = cursor.fetchmany(3)
>>> print(rows)  # [(1, 'Alice'), (2, 'Bob'), (3, 'Charlie')]
```

---
#### `fetchone` {#dbapi-fetchone}

从查询结果中获取下一行。

**语法**

```python
fetchone()
```

**返回**

| 返回类型                 | 描述                                                          |
|--------------------------|--------------------------------------------------------------|
| `tuple or None`         | 下一行作为元组，如果没有更多行，则返回 None                  |

**引发异常**

| 异常                                                  | 条件                                       |
|-------------------------------------------------------|--------------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 如果没有先调用 `execute()`                 |

**示例**

```pycon
>>> cursor.execute("SELECT id, name FROM users LIMIT 3")
>>> row = cursor.fetchone()
>>> print(row)  # (1, 'Alice')
>>> row = cursor.fetchone()
>>> print(row)  # (2, 'Bob')
```

---
#### `max_stmt_length = 1024000` {#max-stmt-length}

[`executemany()`](#chdb-dbapi-cursors-cursor-executemany) 生成的最大语句大小。

默认值为 1024000。

---
#### `mogrify` {#mogrify}

返回将发送到数据库的确切查询字符串。

此方法显示参数替换后的最终 SQL 查询，适合用于调试和日志记录。

**语法**

```python
mogrify(query, args=None)
```

**参数**

| 参数        | 类型              | 默认值      | 描述                                |
|-------------|-------------------|-------------|-------------------------------------|
| `query`     | str               | *必填*      | 带参数占位符的 SQL 查询             |
| `args`      | tuple/list/dict   | `None`      | 要替换的参数                        |

**返回**

| 返回类型    | 描述                                          |
|-------------|-----------------------------------------------|
| `str`       | 带参数替换的最终 SQL 查询字符串              |

**示例**

```pycon
>>> cur.mogrify("SELECT * FROM users WHERE id = ?", (123,))
"SELECT * FROM users WHERE id = 123"
```

:::note
此方法遵循 Psycopg 使用的 DB-API 2.0 扩展。
:::

---
#### `nextset` {#nextset}

移动到下一个结果集（不支持）。

**语法**

```python
nextset()
```

**返回**

| 返回类型    | 描述                                         |
|-------------|----------------------------------------------|
| `None`      | 始终返回 None，因为不支持多个结果集         |

:::note
chDB/ClickHouse 不支持来自单个查询的多个结果集。
此方法是为了遵循 DB-API 2.0 规范，但始终返回 None。
:::

---
#### `setinputsizes` {#setinputsizes}

为参数设置输入大小（无操作实现）。

**语法**

```python
setinputsizes(*args)
```

**参数**

| 参数        | 类型  | 描述                                 |
|-------------|-------|----------------------------------------|
| `*args`     | -     | 参数大小规格（被忽略）                 |

:::note
此方法没有任何功能，但根据 DB-API 2.0 规范是必需的。
chDB 自动处理参数大小。
:::

---
#### `setoutputsizes` {#setoutputsizes}

设置输出列大小（无操作实现）。

**语法**

```python
setoutputsizes(*args)
```

**参数**

| 参数        | 类型  | 描述                              |
|-------------|-------|-------------------------------------|
| `*args`     | -     | 列大小规格（被忽略）                |

:::note
此方法没有任何功能，但根据 DB-API 2.0 规范是必需的。
chDB 自动处理输出大小。
:::

---
### 错误类 {#error-classes}

用于 chdb 数据库操作的异常类。

该模块提供了一个完整的异常类层次结构，用于处理 chdb 中与数据库相关的错误，遵循 Python 数据库 API 规范 v2.0。

异常层次结构如下：

```default
StandardError
├── Warning
└── Error
    ├── InterfaceError
    └── DatabaseError
        ├── DataError
        ├── OperationalError
        ├── IntegrityError
        ├── InternalError
        ├── ProgrammingError
        └── NotSupportedError
```

每个异常类表示特定类别的数据库错误：

| 异常             | 描述                                                 |
|-------------------|-----------------------------------------------------|
| `Warning`         | 数据库操作期间的非致命警告                         |
| `InterfaceError`  | 数据库接口本身的问题                                |
| `DatabaseError`   | 所有与数据库相关的错误的基类                        |
| `DataError`       | 数据处理中的问题（无效值、类型错误）                |
| `OperationalError`| 数据库操作问题（连接性、资源）                      |
| `IntegrityError`  | 约束违反（外键、唯一性）                            |
| `InternalError`   | 数据库内部错误和损坏                                |
| `ProgrammingError` | SQL 语法错误和 API 滥用                           |
| `NotSupportedError`| 不支持的功能或操作                                 |

:::note
这些异常类符合 Python DB API 2.0 规范，并为不同数据库操作提供一致的错误处理。
:::

**另见**
- [Python 数据库 API 规范 v2.0](https://peps.python.org/pep-0249/)
- `chdb.dbapi.connections` - 数据库连接管理
- `chdb.dbapi.cursors` - 数据库游标操作

**示例**

```pycon
>>> try:
...     cursor.execute("SELECT * FROM nonexistent_table")
... except ProgrammingError as e:
...     print(f"SQL Error: {e}")
...
SQL Error: Table 'nonexistent_table' doesn't exist
```

```pycon
>>> try:
...     cursor.execute("INSERT INTO users (id) VALUES (1), (1)")
... except IntegrityError as e:
...     print(f"Constraint violation: {e}")
...
Constraint violation: Duplicate entry '1' for key 'PRIMARY'
```

---
#### **exception** `chdb.dbapi.err.DataError` {#chdb-dbapi-err-dataerror}

基于：[`DatabaseError`](#chdb-dbapi-err-databaseerror)

因处理数据的问题而引发的异常。

当数据库操作因处理数据的问题而失败时，会引发此异常，例如：

- 零除法操作
- 数值超出范围
- 无效的日期/时间值
- 字符串截断错误
- 类型转换失败
- 列类型的数据格式无效

**引发**

| 异常                          | 条件                                            |
|-------------------------------|-------------------------------------------------|
| [`DataError`](#chdb-dbapi-err-dataerror) | 当数据验证或处理失败时                          |

**示例**

```pycon
>>> # Division by zero in SQL
>>> cursor.execute("SELECT 1/0")
DataError: Division by zero
```

```pycon
>>> # Invalid date format
>>> cursor.execute("INSERT INTO table VALUES ('invalid-date')")
DataError: Invalid date format
```

---
#### **exception** `chdb.dbapi.err.DatabaseError` {#chdb-dbapi-err-databaseerror}

基于：[`Error`](#chdb-dbapi-err-error)

与数据库相关的错误引发的异常。

这是所有与数据库相关的错误的基类。它包括所有在数据库操作期间发生的错误，这些错误与数据库本身有关，而不是接口。

常见场景包括：

- SQL 执行错误
- 数据库连接问题
- 交易相关问题
- 数据库特定的约束违规

:::note
这作为更具体的数据库错误类型（如 [`DataError`](#chdb-dbapi-err-dataerror)，[`OperationalError`](#chdb-dbapi-err-operationalerror) 等）的父类。
:::

---
#### **exception** `chdb.dbapi.err.Error` {#chdb-dbapi-err-error}

基于：[`StandardError`](#chdb-dbapi-err-standarderror)

所有其他错误异常的基类（非 Warning）。

这是 chdb 中所有错误异常的基类，不包括警告。
它作为所有阻止操作成功完成的数据库错误条件的父类。

:::note
此异常层次结构遵循 Python DB API 2.0 规范。
:::

**另见**
- [`Warning`](#chdb_dbapi_err_warning) - 适用于不会阻止操作完成的重要非致命警告
#### **exception** `chdb.dbapi.err.IntegrityError` {#chdb-dbapi-err-integrityerror}

基于：[`DatabaseError`](#chdb-dbapi-err-databaseerror)

影响数据库关系完整性的异常。

当数据库操作违反完整性约束时，会引发此异常，包括：

- 外键约束违反
- 主键或唯一约束违反（重复键）
- 检查约束违反
- NOT NULL 约束违反
- 参照完整性违反

**引发**

| 异常                                                | 条件                                            |
|-----------------------------------------------------|-------------------------------------------------|
| [`IntegrityError`](#chdb-dbapi-err-integrityerror) | 当数据库完整性约束被违反时                      |

**示例**

```pycon
>>> # Duplicate primary key
>>> cursor.execute("INSERT INTO users (id, name) VALUES (1, 'John')")
>>> cursor.execute("INSERT INTO users (id, name) VALUES (1, 'Jane')")
IntegrityError: Duplicate entry '1' for key 'PRIMARY'
```

```pycon
>>> # Foreign key violation
>>> cursor.execute("INSERT INTO orders (user_id) VALUES (999)")
IntegrityError: Cannot add or update a child row: foreign key constraint fails
```

---
#### **exception** `chdb.dbapi.err.InterfaceError` {#chdb-dbapi-err-interfaceerror}

基于：[`Error`](#chdb-dbapi-err-error)

与数据库接口相关的错误引发的异常，而不是与数据库本身有关的错误。

当数据库接口实现中出现问题时，便会引发此异常，例如：

- 无效的连接参数
- API 滥用（在已关闭连接上调用方法）
- 接口级协议错误
- 模块导入或初始化失败

**引发**

| 异常                                                | 条件                                                                |
|-----------------------------------------------------|-----------------------------------------------------------------------|
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror) | 当数据库接口遇到与数据库操作无关的错误时                            |

:::note
这些错误通常是编程错误或配置问题，可以通过修复客户端代码或配置来解决。
:::

---
#### **exception** `chdb.dbapi.err.InternalError` {#chdb-dbapi-err-internalerror}

基于：[`DatabaseError`](#chdb-dbapi-err-databaseerror)

当数据库遇到内部错误时引发的异常。

当数据库系统遇到应用程序未导致的内部错误时，会引发此异常，例如：

- 无效的游标状态（游标不再有效）
- 事务状态不一致（事务不同步）
- 数据库损坏问题
- 内部数据结构损坏
- 系统级数据库错误

**引发**

| 异常                               | 条件                                         |
|----------------------------------|-------------------------------------------|
| [`InternalError`](#chdb-dbapi-err-internalerror) | 当数据库遇到内部不一致时                        |

:::warning 警告
内部错误可能表明需要数据库管理员关注的严重数据库问题。这些错误通常无法通过应用程序级重试逻辑恢复。
:::

:::note
这些错误通常超出了应用程序的控制范围，可能需要数据库重启或修复操作。
:::

---
#### **exception** `chdb.dbapi.err.NotSupportedError` {#chdb-dbapi-err-notsupportederror}

基于：[`DatabaseError`](#chdb-dbapi-err-databaseerror)

当不支持某个方法或数据库 API 时引发的异常。

当应用程序尝试使用当前数据库配置或版本不支持的数据库功能或 API 方法时，会引发此异常，例如：

- 在没有事务支持的连接上请求 `rollback()`
- 使用当前数据库版本不支持的高级 SQL 功能
- 调用当前驱动程序未实现的方法
- 尝试使用被禁用的数据库功能

**引发**

| 异常                                                | 条件                                        |
|-----------------------------------------------------|----------------------------------------------|
| [`NotSupportedError`](#chdb_dbapi_err_notsupportederror) | 当访问不支持的数据库功能时                    |

**示例**

```pycon
>>> # Transaction rollback on non-transactional connection
>>> connection.rollback()
NotSupportedError: Transactions are not supported
```

```pycon
>>> # Using unsupported SQL syntax
>>> cursor.execute("SELECT * FROM table WITH (NOLOCK)")
NotSupportedError: WITH clause not supported in this database version
```

:::note
检查数据库文档和驱动程序功能，以避免这些错误。在可能的情况下考虑优雅降级。
:::

---
#### **exception** `chdb.dbapi.err.OperationalError` {#chdb-dbapi-err-operationalerror}

基于：[`DatabaseError`](#chdb_dbapi_err_databaseerror)

与数据库操作相关的错误引发的异常。

当数据库操作期间发生错误且不一定在程序员的控制之内时，会引发此异常，包括：

- 意外与数据库断开连接
- 找不到或无法访问数据库服务器
- 事务处理失败
- 处理过程中的内存分配错误
- 磁盘空间或资源耗尽
- 数据库服务器内部错误
- 身份验证或授权失败

**引发**

| 异常                                              | 条件                                             |
|----------------------------------------------------|--------------------------------------------------|
| [`OperationalError`](#chdb-dbapi-err-operationalerror) | 当因操作问题导致数据库操作失败时                |

:::note
这些错误通常是暂时性的，可能通过重试操作或解决系统级问题来解决。
:::

:::warning 警告
有些操作错误可能表示需要管理干预的严重系统问题。
:::

---
#### **exception** `chdb.dbapi.err.ProgrammingError` {#chdb-dbapi-err-programmingerror}

基于：[`DatabaseError`](#chdb-dbapi-err-databaseerror)

数据库操作中的编程错误引发的异常。

当应用程序在使用数据库时出现编程错误时，会引发此异常，包括：

- 表或列不存在
- 创建时表或索引已存在
- 语句中的 SQL 语法错误
- 在准备语句中指定的参数数量错误
- 无效的 SQL 操作（例如，非现有对象的 DROP 操作）
- 数据库 API 方法使用不当

**引发**

| 异常                                              | 条件                                        |
|----------------------------------------------------|--------------------------------------------|
| [`ProgrammingError`](#chdb_dbapi_err_programmingerror) | 当 SQL 语句或 API 使用中存在错误时         |

**示例**

```pycon
>>> # Table not found
>>> cursor.execute("SELECT * FROM nonexistent_table")
ProgrammingError: Table 'nonexistent_table' doesn't exist
```

```pycon
>>> # SQL syntax error
>>> cursor.execute("SELCT * FROM users")
ProgrammingError: You have an error in your SQL syntax
```

```pycon
>>> # Wrong parameter count
>>> cursor.execute("INSERT INTO users (name, age) VALUES (%s)", ('John',))
ProgrammingError: Column count doesn't match value count
```

---
#### **exception** `chdb.dbapi.err.StandardError` {#chdb-dbapi-err-standarderror}

基于：`Exception`

与 chdb 操作相关的异常。

这是所有 chdb 相关异常的基类。它继承自 Python 内置的 Exception 类，并作为数据库操作异常层次结构的根。

:::note
此异常类遵循 Python DB API 2.0 规范，用于数据库异常处理。
:::

---
#### **exception** `chdb.dbapi.err.Warning` {#chdb-dbapi-err-warning}

基于：[`StandardError`](#chdb-dbapi-err-standarderror)

因重要警告而引发的异常，例如插入时的数据截断等。

当数据库操作完成但存在重要警告时引发此异常，这些警告应引起应用程序的注意。
常见场景包括：

- 插入时数据截断
- 数值转换中的精度损失
- 字符集转换警告

:::note
这遵循 Python DB API 2.0 规范的警告异常。
:::

---
### 模块常量 {#module-constants}
#### `chdb.dbapi.apilevel = '2.0'` {#apilevel}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

使用给定对象创建一个新字符串对象。如果指定了编码或错误，则该对象必须暴露一个数据缓冲区，该缓冲区将使用给定的编码和错误处理解码。否则，返回 `object.__str__()` 的结果（如果定义了）或 `repr(object)`。

- 编码默认为 ‘utf-8’。
- 错误默认为 ‘strict’。

---
#### `chdb.dbapi.threadsafety = 1` {#threadsafety}

```python
int([x]) -> integer
int(x, base=10) -> integer
```

将数字或字符串转换为整数，如果未给出参数，则返回 0。如果 x 是数字，则返回 x.__int__()。对于浮点数，这将向零截断。

如果 x 不是数字或给出了基数，则 x 必须是表示给定基数下的整数字面量的字符串、字节或字节数组实例。字面量可以用 ‘+’ 或 ‘-’ 前缀，并用空格包围。基数默认为 10。有效基数为 0 和 2-36。基数 0 意味着根据字符串解释基数作为整数字面量。

```python
>>> int(‘0b100’, base=0)
4
```

---
#### `chdb.dbapi.paramstyle = 'format'` {#paramstyle}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

使用给定对象创建一个新字符串对象。如果编码或错误被指定，则该对象必须暴露一个数据缓冲区，该缓冲区将使用给定的编码和错误处理解码。否则，返回对象.__str__() 的结果（如果定义了）或 repr(object）。编码默认为 ‘utf-8’。错误默认为 ‘strict’。

---
### 类型常量 {#type-constants}
#### `chdb.dbapi.STRING = frozenset({247, 253, 254})` {#string-type}

用于 DB-API 2.0 类型比较的扩展 frozenset。

此类扩展了 frozenset，以支持 DB-API 2.0 类型比较语义。它允许灵活的类型检查，其中单个项可以使用等号和不等号运算符与集合进行比较。

这用于像 STRING、BINARY、NUMBER 等的类型常量，以启用像 “field_type == STRING” 的比较，其中 field_type 是单个类型值。

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.BINARY = frozenset({249, 250, 251, 252})` {#binary-type}

用于 DB-API 2.0 类型比较的扩展 frozenset。

此类扩展了 frozenset，以支持 DB-API 2.0 类型比较语义。它允许灵活的类型检查，其中单个项可以使用等号和不等号运算符与集合进行比较。

这用于像 STRING、BINARY、NUMBER 等的类型常量，以启用像 “field_type == STRING” 的比较，其中 field_type 是单个类型值。

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.NUMBER = frozenset({0, 1, 3, 4, 5, 8, 9, 13})` {#number-type}

用于 DB-API 2.0 类型比较的扩展 frozenset。

此类扩展了 frozenset，以支持 DB-API 2.0 类型比较语义。它允许灵活的类型检查，其中单个项可以使用等号和不等号运算符与集合进行比较。

这用于像 STRING、BINARY、NUMBER 等的类型常量，以启用像 “field_type == STRING” 的比较，其中 field_type 是单个类型值。

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.DATE = frozenset({10, 14})` {#date-type}

用于 DB-API 2.0 类型比较的扩展 frozenset。

此类扩展了 frozenset，以支持 DB-API 2.0 类型比较语义。它允许灵活的类型检查，其中单个项可以使用等号和不等号运算符与集合进行比较。

这用于像 STRING、BINARY、NUMBER 等的类型常量，以启用像 “field_type == STRING” 的比较，其中 field_type 是单个类型值。

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.TIME = frozenset({11})` {#time-type}

用于 DB-API 2.0 类型比较的扩展 frozenset。

此类扩展了 frozenset，以支持 DB-API 2.0 类型比较语义。它允许灵活的类型检查，其中单个项可以使用等号和不等号运算符与集合进行比较。

这用于像 STRING、BINARY、NUMBER 等的类型常量，以启用像 “field_type == STRING” 的比较，其中 field_type 是单个类型值。

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.TIMESTAMP = frozenset({7, 12})` {#timestamp-type}

用于 DB-API 2.0 类型比较的扩展 frozenset。

此类扩展了 frozenset，以支持 DB-API 2.0 类型比较语义。它允许灵活的类型检查，其中单个项可以使用等号和不等号运算符与集合进行比较。

这用于像 STRING、BINARY、NUMBER 等的类型常量，以启用像 “field_type == STRING” 的比较，其中 field_type 是单个类型值。

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```
#### `chdb.dbapi.DATETIME = frozenset({7, 12})` {#datetime-type}

用于 DB-API 2.0 类型比较的扩展 frozenset。

此类扩展了 frozenset，以支持 DB-API 2.0 类型比较语义。它允许灵活的类型检查，其中单个项可以使用等号和不等号运算符与集合进行比较。

这用于像 STRING、BINARY、NUMBER 等的类型常量，以启用像 “field_type == STRING” 的比较，其中 field_type 是单个类型值。

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.ROWID = frozenset({})` {#rowid-type}

用于 DB-API 2.0 类型比较的扩展 frozenset。

此类扩展了 frozenset，以支持 DB-API 2.0 类型比较语义。它允许灵活的类型检查，其中单个项可以使用等号和不等号运算符与集合进行比较。

这用于像 STRING、BINARY、NUMBER 等的类型常量，以启用像 “field_type == STRING” 的比较，其中 field_type 是单个类型值。

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

**使用示例**

基本查询示例：

```python
import chdb.dbapi as dbapi

print("chdb driver version: {0}".format(dbapi.get_client_info()))


# Create connection and cursor
conn = dbapi.connect()
cur = conn.cursor()


# Execute query
cur.execute('SELECT version()')
print("description:", cur.description)
print("data:", cur.fetchone())


# Clean up
cur.close()
conn.close()
```

处理数据：

```python
import chdb.dbapi as dbapi

conn = dbapi.connect()
cur = conn.cursor()


# Create table
cur.execute("""
    CREATE TABLE employees (
        id UInt32,
        name String,
        department String,
        salary Decimal(10,2)
    ) ENGINE = Memory
""")


# Insert data
cur.execute("""
    INSERT INTO employees VALUES
    (1, 'Alice', 'Engineering', 75000.00),
    (2, 'Bob', 'Marketing', 65000.00),
    (3, 'Charlie', 'Engineering', 80000.00)
""")


# Query data
cur.execute("SELECT * FROM employees WHERE department = 'Engineering'")


# Fetch results
print("Column names:", [desc[0] for desc in cur.description])
for row in cur.fetchall():
    print(row)

conn.close()
```

连接管理：

```python
import chdb.dbapi as dbapi


# In-memory database (default)
conn1 = dbapi.connect()


# Persistent database file
conn2 = dbapi.connect("./my_database.chdb")


# Connection with parameters
conn3 = dbapi.connect("./my_database.chdb?log-level=debug&verbose")


# Read-only connection
conn4 = dbapi.connect("./my_database.chdb?mode=ro")


# Automatic connection cleanup
with dbapi.connect("test.chdb") as conn:
    cur = conn.cursor()
    cur.execute("SELECT count() FROM numbers(1000)")
    result = cur.fetchone()
    print(f"Count: {result[0]}")
    cur.close()
```

**最佳实践**

1. **连接管理**：完成后始终关闭连接和游标
2. **上下文管理器**：使用 `with` 语句进行自动清理
3. **批量处理**：对于大结果集使用 `fetchmany()`
4. **错误处理**：将数据库操作包装在 try-except 块中
5. **参数绑定**：尽可能使用参数化查询
6. **内存管理**：避免对非常大的数据集使用 `fetchall()`

:::note
- chDB 的 DB-API 2.0 接口与大多数 Python 数据库工具兼容
- 该接口提供 1 级线程安全（线程可以共享模块，但不能共享连接）
- 连接字符串支持与 chDB 会话相同的参数
- 支持所有标准的 DB-API 2.0 异常
:::

:::warning 警告
- 始终关闭游标和连接以避免资源泄漏
- 大结果集应按批处理
- 参数绑定语法遵循格式样式：`%s`
:::
## 用户定义函数 (UDF) {#user-defined-functions}

用于 chDB 的用户定义函数模块。

此模块提供了在 chDB 中创建和管理用户定义函数 (UDF) 的功能。
它允许您通过编写自定义 Python 函数来扩展 chDB 的能力，这些函数可以从 SQL 查询中调用。
### `chdb.udf.chdb_udf` {#chdb-udf}

用于 chDB Python UDF（用户定义函数）的装饰器。

**语法**

```python
chdb.udf.chdb_udf(return_type='String')
```

**参数**

| 参数          | 类型  | 默认值       | 描述                                                      |
|---------------|-------|---------------|---------------------------------------------------------|
| `return_type` | str   | `"String"`    | 函数的返回类型。应该是 ClickHouse 数据类型之一          |

**注意事项**

1. 函数应无状态。仅支持 UDF，不支持 UDAF。
2. 默认返回类型为字符串。返回类型应为 ClickHouse 数据类型之一。
3. 函数应接受字符串类型的参数。所有参数均为字符串。
4. 该函数将对每行输入调用。
5. 函数应为纯 Python 函数。在函数中导入所有使用的模块。
6. 使用的 Python 解释器与运行脚本时使用的相同。

**示例**

```python
@chdb_udf()
def sum_udf(lhs, rhs):
    return int(lhs) + int(rhs)

@chdb_udf()
def func_use_json(arg):
    import json
    # ... use json module
```

---
### `chdb.udf.generate_udf` {#generate-udf}

生成用户定义函数 (UDF) 的配置和可执行脚本文件。

此函数创建 chDB 中用户定义函数 (UDF) 所需的文件：
1. 处理输入数据的 Python 可执行脚本
2. 将 UDF 注册到 ClickHouse 的 XML 配置文件

**语法**

```python
chdb.udf.generate_udf(func_name, args, return_type, udf_body)
```

**参数**

| 参数          | 类型  | 描述                                   |
|---------------|-------|-----------------------------------------|
| `func_name`   | str   | UDF 函数的名称                          |
| `args`        | list  | 函数的参数名称列表                      |
| `return_type` | str   | 函数的 ClickHouse 返回类型              |
| `udf_body`    | str   | UDF 函数的 Python 源代码主体            |

:::note
此函数通常由 @chdb_udf 装饰器调用，用户不应直接调用。
:::

---
## 工具 {#utilities}

与 chDB 一起使用的实用函数和帮助程序。

此模块包含用于与 chDB 配合使用的各种实用函数，包括数据类型推断、数据转换帮助程序和调试工具。

---
### `chdb.utils.convert_to_columnar` {#convert-to-columnar}

将字典列表转换为列式格式。

此函数接受字典列表，并将其转换为一个字典，其中每个键对应于一列，每个值是该列值的列表。
字典中缺失的值表示为 None。

**语法**

```python
chdb.utils.convert_to_columnar(items: List[Dict[str, Any]]) → Dict[str, List[Any]]
```

**参数**

| 参数        | 类型                   | 描述                         |
|-------------|------------------------|-------------------------------|
| `items`     | `List[Dict[str, Any]]` | 要转换的字典列表              |

**返回**

| 返回类型             | 描述                                                                 |
|---------------------|--------------------------------------------------------------------------|
| `Dict[str, List[Any]]` | 一个字典，键作为列名，值作为列值的列表                                    |

**示例**

```pycon
>>> items = [
...     {"name": "Alice", "age": 30, "city": "New York"},
...     {"name": "Bob", "age": 25},
...     {"name": "Charlie", "city": "San Francisco"}
... ]
>>> convert_to_columnar(items)
{
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [30, 25, None],
    'city': ['New York', None, 'San Francisco']
}
```

---
### `chdb.utils.flatten_dict` {#flatten-dict}

扁平化嵌套字典。

此函数接受一个嵌套字典并将其扁平化，使用分隔符连接嵌套密钥。字典列表序列化为 JSON 字符串。

**语法**

```python
chdb.utils.flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '_') → Dict[str, Any]
```

**参数**

| 参数         | 类型               | 默认       | 描述                                                |
|--------------|--------------------|------------|-----------------------------------------------------|
| `d`          | `Dict[str, Any]`   | *必需*     | 要扁平化的字典                                      |
| `parent_key` | str                | `""`       | 预先附加到每个键的基本键                             |
| `sep`        | str                | `"_"`      | 用于连接密钥之间的分隔符                             |

**返回**

| 返回类型      | 描述                          |
|---------------|-------------------------------|
| `Dict[str, Any]` | 一个扁平化字典                 |

**示例**

```pycon
>>> nested_dict = {
...     "a": 1,
...     "b": {
...         "c": 2,
...         "d": {
...             "e": 3
...         }
...     },
...     "f": [4, 5, {"g": 6}],
...     "h": [{"i": 7}, {"j": 8}]
... }
>>> flatten_dict(nested_dict)
{
    'a': 1,
    'b_c': 2,
    'b_d_e': 3,
    'f_0': 4,
    'f_1': 5,
    'f_2_g': 6,
    'h': '[{"i": 7}, {"j": 8}]'
}
```

---
### `chdb.utils.infer_data_type` {#infer-data-type}

推断值列表的最合适数据类型。

此函数检查值列表并确定可以表示列表中所有值的最适合的数据类型。它考虑整数、无符号整数、十进制和浮点类型，如果值不能由任何数字类型表示或所有值为 None，则默认为“string”。

**语法**

```python
chdb.utils.infer_data_type(values: List[Any]) → str
```

**参数**

| 参数        | 类型              | 描述                                        |
|-------------|-------------------|---------------------------------------------|
| `values`    | `List[Any]`       | 要分析的值列表。值可以是任何类型           |

**返回**

| 返回类型   | 描述                                                                                                                                               |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `str`      | 一个表示推断数据类型的字符串。可能的返回值为：”int8”、 “int16”、 “int32”、 “int64”、 “int128”、 “int256”、 “uint8”、 “uint16”、 “uint32”、 “uint64”、 “uint128”、 “uint256”、 “decimal128”、 “decimal256”、 “float32”、 “float64” 或 “string”。 |

:::note
- 如果列表中的所有值都是 None，函数返回“string”。
- 如果列表中的任何值是字符串，函数将立即返回“string”。
- 函数假定数值可以根据其范围和精度表示为整数、十进制或浮点数。
:::

---
### `chdb.utils.infer_data_types` {#infer-data-types}

推断列式数据结构中每列的数据类型。

此函数分析每列中的值并根据数据的示例推断每列的最适合数据类型。

**语法**

```python
chdb.utils.infer_data_types`(column_data: Dict[str, List[Any]], n_rows: int = 10000) → List[tuple]
```

**参数**

| 参数          | 类型                    | 默认      | 描述                                                                |
|---------------|-------------------------|-----------|---------------------------------------------------------------------|
| `column_data` | `Dict[str, List[Any]]`  | *必需*    | 一个字典，其中键是列名，值是列值的列表                             |
| `n_rows`      | int                     | `10000`   | 用于类型推断的样本行数                                            |

**返回**

| 返回类型    | 描述                                                                 |
|-------------|----------------------------------------------------------------------|
| `List[tuple]` | 一个元组列表，每个元组包含一个列名及其推断数据类型 |

## 抽象基类 {#abstract-base-classes}
### **class** `chdb.rwabc.PyReader`(data: Any)` {#pyreader}

基类: `ABC`

```python
class chdb.rwabc.PyReader(data: Any)
```

---
#### **abstractmethod** `read` {#read}

从给定列读取指定数量的行并返回对象列表，每个对象是列值的序列。

```python
abstractmethod (col_names: List[str], count: int) → List[Any]
```

**参数**

| 参数       | 类型            | 描述                       |
|------------|-----------------|----------------------------|
| `col_names` | `List[str]`     | 要读取的列名列表          |
| `count`     | int             | 最大读取行数              |

**返回**

| 返回类型   | 描述                           |
|------------|--------------------------------|
| `List[Any]` | 按列返回的序列列表             |
### **class** `chdb.rwabc.PyWriter` {#pywriter}

基类: `ABC`

```python
class chdb.rwabc.PyWriter(col_names: List[str], types: List[type], data: Any)
```

---
#### **abstractmethod** finalize {#finalize}

组装并返回来自区块的最终数据。必须由子类实现。

```python
abstractmethod finalize() → bytes
```

**返回**

| 返回类型   | 描述                      |
|------------|---------------------------|
| `bytes`    | 最终序列化的数据          |

---
#### **abstractmethod** `write` {#write}

将数据列保存到区块中。必须由子类实现。

```python
abstractmethod write(col_names: List[str], columns: List[List[Any]]) → None
```

**参数**

| 参数       | 类型                | 描述                                                    |
|------------|---------------------|---------------------------------------------------------|
| `col_names` | `List[str]`         | 正在写入的列名列表                                     |
| `columns`   | `List[List[Any]]`   | 列数据列表，每列由一个列表表示                        |

## 异常处理 {#exception-handling}
### **class** `chdb.ChdbError` {#chdberror}

基类: `Exception`

chDB 相关错误的基本异常类。

当 chDB 查询执行失败或遇到错误时，引发此异常。它继承自标准 Python Exception 类，并提供来自底层 ClickHouse 引擎的错误信息。

异常消息通常包含来自 ClickHouse 的详细错误信息，包括语法错误、类型不匹配、缺少表/列及其他查询执行问题。

**变量**

| 变量       | 类型  | 描述                                        |
|------------|-------|--------------------------------------------|
| `args`     | -     | 包含错误消息及其他附加参数的元组                |

**示例**

```pycon
>>> try:
...     result = chdb.query("SELECT * FROM non_existent_table")
... except chdb.ChdbError as e:
...     print(f"Query failed: {e}")
Query failed: Table 'non_existent_table' doesn't exist
```

```pycon
>>> try:
...     result = chdb.query("SELECT invalid_syntax FROM")
... except chdb.ChdbError as e:
...     print(f"Syntax error: {e}")
Syntax error: Syntax error near 'FROM'
```

:::note
当底层 ClickHouse 引擎报告错误时，此异常由 chdb.query() 和相关函数自动引发。
您应在处理可能失败的查询时捕获此异常，以在您的应用程序中提供适当的错误处理。
:::
## 版本信息 {#version-information}
### `chdb.chdb_version = ('3', '6', '0')` {#chdb-version}

内置不可变序列。

如果未给出参数，构造函数返回一个空元组。
如果指定了可迭代对象，则元组从可迭代对象的项初始化。

如果参数是一个元组，则返回值是相同的对象。

---
### `chdb.engine_version = '25.5.2.1'` {#engine-version}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

从给定对象创建一个新的字符串对象。如果指定了编码或错误，则对象必须暴露一个数据缓冲区，该缓冲区将使用给定的编码和错误处理程序进行解码。否则，返回对象.__str__()（如果定义）或 repr(object）的结果。

- 编码默认为 ‘utf-8’。
- 错误默认为 ‘strict’。

---
### `chdb.__version__ = '3.6.0'` {#version}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

从给定对象创建一个新的字符串对象。如果指定了编码或错误，则对象必须暴露一个数据缓冲区，该缓冲区将使用给定的编码和错误处理程序进行解码。否则，返回对象.__str__()（如果定义）或 repr(object）的结果。

- 编码默认为 ‘utf-8’。
- 错误默认为 ‘strict’。
