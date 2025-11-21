---
title: 'chDB Python API 参考'
sidebar_label: 'Python API'
slug: /chdb/api/python
description: 'chDB Python API 完整参考文档'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'api', 'reference']
doc_type: 'reference'
---



# Python API 参考文档



## 核心查询函数 {#core-query-functions}

### `chdb.query` {#chdb-query}

使用 chDB 引擎执行 SQL 查询。

这是使用嵌入式 ClickHouse 引擎执行 SQL 语句的主要查询函数。支持多种输出格式,可以使用内存数据库或基于文件的数据库。

**语法**

```python
chdb.query(sql, output_format='CSV', path='', udf_path='')
```

**参数**

| 参数            | 类型 | 默认值     | 描述                                                                                                                                                                                                                                                                                                     |
| --------------- | ---- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`           | str  | _必需_ | 要执行的 SQL 查询字符串                                                                                                                                                                                                                                                                                                     |
| `output_format` | str  | `"CSV"`    | 结果的输出格式。支持的格式:<br/>• `"CSV"` - 逗号分隔值<br/>• `"JSON"` - JSON 格式<br/>• `"Arrow"` - Apache Arrow 格式<br/>• `"Parquet"` - Parquet 格式<br/>• `"DataFrame"` - Pandas DataFrame<br/>• `"ArrowTable"` - PyArrow Table<br/>• `"Debug"` - 启用详细日志记录 |
| `path`          | str  | `""`       | 数据库文件路径。默认为内存数据库。<br/>可以是文件路径或 `":memory:"` 表示内存数据库                                                                                                                                                                                               |
| `udf_path`      | str  | `""`       | 用户自定义函数目录的路径                                                                                                                                                                                                                                                                                        |

**返回值**

以指定格式返回查询结果:

| 返回类型        | 条件                                                |
| ------------------ | -------------------------------------------------------- |
| `str`              | 对于文本格式,如 CSV、JSON                          |
| `pd.DataFrame`     | 当 `output_format` 为 `"DataFrame"` 或 `"dataframe"` 时   |
| `pa.Table`         | 当 `output_format` 为 `"ArrowTable"` 或 `"arrowtable"` 时 |
| chdb result object | 对于其他格式                                        |

**异常**

| 异常     | 条件                                                        |
| ------------- | ---------------------------------------------------------------- |
| `ChdbError`   | 如果 SQL 查询执行失败                                 |
| `ImportError` | 如果 DataFrame/Arrow 格式缺少所需的依赖项 |

**示例**

```pycon
>>> # 基本 CSV 查询
>>> result = chdb.query("SELECT 1, 'hello'")
>>> print(result)
"1,hello"
```

```pycon
>>> # 使用 DataFrame 输出的查询
>>> df = chdb.query("SELECT 1 as id, 'hello' as msg", "DataFrame")
>>> print(df)
   id    msg
0   1  hello
```

```pycon
>>> # 使用基于文件的数据库的查询
>>> result = chdb.query("CREATE TABLE test (id INT) ENGINE = Memory", path="mydb.chdb")
```

```pycon
>>> # 使用 UDF 的查询
>>> result = chdb.query("SELECT my_udf('test')", udf_path="/path/to/udfs")
```

---

### `chdb.sql` {#chdb_sql}

使用 chDB 引擎执行 SQL 查询。

这是使用嵌入式 ClickHouse 引擎执行 SQL 语句的主要查询函数。支持多种输出格式,可以使用内存数据库或基于文件的数据库。

**语法**

```python
chdb.sql(sql, output_format='CSV', path='', udf_path='')
```

**参数**

| 参数            | 类型 | 默认值     | 描述                                                                                                                                                                                                                                                                                                     |
| --------------- | ---- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`           | str  | _必需_ | 要执行的 SQL 查询字符串                                                                                                                                                                                                                                                                                                     |
| `output_format` | str  | `"CSV"`    | 结果的输出格式。支持的格式:<br/>• `"CSV"` - 逗号分隔值<br/>• `"JSON"` - JSON 格式<br/>• `"Arrow"` - Apache Arrow 格式<br/>• `"Parquet"` - Parquet 格式<br/>• `"DataFrame"` - Pandas DataFrame<br/>• `"ArrowTable"` - PyArrow Table<br/>• `"Debug"` - 启用详细日志记录 |
| `path`          | str  | `""`       | 数据库文件路径。默认为内存数据库。<br/>可以是文件路径或 `":memory:"` 表示内存数据库                                                                                                                                                                                               |
| `udf_path`      | str  | `""`       | 用户自定义函数目录的路径                                                                                                                                                                                                                                                                                        |

**返回值**

以指定格式返回查询结果:


| 返回类型        | 条件                                                |
| ------------------ | -------------------------------------------------------- |
| `str`              | 用于文本格式,如 CSV、JSON                          |
| `pd.DataFrame`     | 当 `output_format` 为 `"DataFrame"` 或 `"dataframe"` 时   |
| `pa.Table`         | 当 `output_format` 为 `"ArrowTable"` 或 `"arrowtable"` 时 |
| chdb result object | 用于其他格式                                        |

**异常**

| 异常                 | 条件                                                        |
| ------------------------- | ---------------------------------------------------------------- |
| [`ChdbError`](#chdberror) | SQL 查询执行失败时                                 |
| `ImportError`             | DataFrame/Arrow 格式所需的依赖项缺失时 |

**示例**

```pycon
>>> # 基本 CSV 查询
>>> result = chdb.query("SELECT 1, 'hello'")
>>> print(result)
"1,hello"
```

```pycon
>>> # DataFrame 输出查询
>>> df = chdb.query("SELECT 1 as id, 'hello' as msg", "DataFrame")
>>> print(df)
   id    msg
0   1  hello
```

```pycon
>>> # 基于文件的数据库查询
>>> result = chdb.query("CREATE TABLE test (id INT) ENGINE = Memory", path="mydb.chdb")
```

```pycon
>>> # 使用 UDF 的查询
>>> result = chdb.query("SELECT my_udf('test')", udf_path="/path/to/udfs")
```

---

### `chdb.to_arrowTable` {#chdb-state-sqlitelike-to_arrowtable}

将查询结果转换为 PyArrow Table。

将 chDB 查询结果转换为 PyArrow Table,以实现高效的列式数据处理。
如果结果为空,则返回空表。

**语法**

```python
chdb.to_arrowTable(res)
```

**参数**

| 参数 | 描述                                           |
| --------- | ----------------------------------------------------- |
| `res`     | 包含二进制 Arrow 数据的 chDB 查询结果对象 |

**返回值**

| 返回类型 | 描述                                |
| ----------- | ------------------------------------------ |
| `pa.Table`  | 包含查询结果的 PyArrow Table |

**异常**

| 错误类型    | 描述                            |
| ------------- | -------------------------------------- |
| `ImportError` | pyarrow 或 pandas 未安装时 |

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

将查询结果转换为 pandas DataFrame。

通过先转换为 PyArrow Table,然后使用多线程转换为 pandas,
将 chDB 查询结果转换为 pandas DataFrame,以获得更好的性能。

**语法**

```python
chdb.to_df(r)
```

**参数**

| 参数 | 描述                                           |
| --------- | ----------------------------------------------------- |
| `r`       | 包含二进制 Arrow 数据的 chDB 查询结果对象 |

**返回值**

| 返回类型    | 描述                                   |
| -------------- | --------------------------------------------- |
| `pd.DataFrame` | 包含查询结果的 pandas DataFrame |

**异常**

| 异常     | 条件                              |
| ------------- | -------------------------------------- |
| `ImportError` | pyarrow 或 pandas 未安装时 |

**示例**

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> df = chdb.to_df(result)
>>> print(df)
   id    msg
0   1  hello
```


## 连接和会话管理 {#connection-session-management}

以下会话函数可用:

### `chdb.connect` {#chdb-connect}

创建到 chDB 后台服务器的连接。

此函数建立到 chDB (ClickHouse) 数据库引擎的[连接](#chdb-state-sqlitelike-connection)。
每个进程只允许一个打开的连接。
使用相同连接字符串的多次调用将返回相同的连接对象。

```python
chdb.connect(connection_string: str = ':memory:') → Connection
```

**参数:**

| 参数                | 类型 | 默认值       | 描述                                           |
| ------------------- | ---- | ------------ | ---------------------------------------------- |
| `connection_string` | str  | `":memory:"` | 数据库连接字符串。请参阅下面的格式。           |

**基本格式**

| 格式                      | 描述                         |
| ------------------------- | ---------------------------- |
| `":memory:"`              | 内存数据库(默认)             |
| `"test.db"`               | 相对路径数据库文件           |
| `"file:test.db"`          | 与相对路径相同               |
| `"/path/to/test.db"`      | 绝对路径数据库文件           |
| `"file:/path/to/test.db"` | 与绝对路径相同               |

**带查询参数**

| 格式                                               | 描述                      |
| -------------------------------------------------- | ------------------------- |
| `"file:test.db?param1=value1&param2=value2"`       | 带参数的相对路径          |
| `"file::memory:?verbose&log-level=test"`           | 带参数的内存数据库        |
| `"///path/to/test.db?param1=value1&param2=value2"` | 带参数的绝对路径          |

**查询参数处理**

查询参数作为启动参数传递给 ClickHouse 引擎。
特殊参数处理:

| 特殊参数          | 转换为         | 描述                    |
| ----------------- | -------------- | ----------------------- |
| `mode=ro`         | `--readonly=1` | 只读模式                |
| `verbose`         | (标志)         | 启用详细日志记录        |
| `log-level=test`  | (设置)         | 设置日志级别            |

有关完整的参数列表,请参阅 `clickhouse local --help --verbose`

**返回值**

| 返回类型     | 描述                                                                                                                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Connection` | 数据库连接对象,支持:<br/>• 使用 `Connection.cursor()` 创建游标<br/>• 使用 `Connection.query()` 进行直接查询<br/>• 使用 `Connection.send_query()` 进行流式查询<br/>• 用于自动清理的上下文管理器协议 |

**异常**

| 异常           | 条件                            |
| -------------- | ------------------------------- |
| `RuntimeError` | 如果连接到数据库失败            |

:::warning
每个进程仅支持一个连接。
创建新连接将关闭任何现有连接。
:::

**示例**

```pycon
>>> # 内存数据库
>>> conn = connect()
>>> conn = connect(":memory:")
>>>
>>> # 基于文件的数据库
>>> conn = connect("my_data.db")
>>> conn = connect("/path/to/data.db")
>>>
>>> # 带参数
>>> conn = connect("data.db?mode=ro")  # 只读模式
>>> conn = connect(":memory:?verbose&log-level=debug")  # 调试日志
>>>
>>> # 使用上下文管理器进行自动清理
>>> with connect("data.db") as conn:
...     result = conn.query("SELECT 1")
...     print(result)
>>> # 连接自动关闭
```

**另请参阅**

- [`Connection`](#chdb-state-sqlitelike-connection) - 数据库连接类
- [`Cursor`](#chdb-state-sqlitelike-cursor) - 用于 DB-API 2.0 操作的数据库游标


## 异常处理 {#chdb-exceptions}

### **class** `chdb.ChdbError` {#chdb_chdbError}

基类：`Exception`

chDB 相关错误的基础异常类。

当 chDB 查询执行失败或遇到错误时会抛出此异常。它继承自 Python 标准的 Exception 类，并提供来自底层 ClickHouse 引擎的错误信息。

---

### **class** `chdb.session.Session` {#chdb_session_session}

基类：`object`

Session 会保持查询状态。
如果 path 为 None，将创建一个临时目录并将其用作数据库路径，
会话关闭时临时目录将被删除。
您也可以传入一个路径在该位置创建数据库以保存您的数据。

您也可以使用连接字符串来传入路径和其他参数。

```python
class chdb.session.Session(path=None)
```

**示例**

| 连接字符串                                  | 描述                          |
| -------------------------------------------------- | ------------------------------------ |
| `":memory:"`                                       | 内存数据库                   |
| `"test.db"`                                        | 相对路径                        |
| `"file:test.db"`                                   | 同上                        |
| `"/path/to/test.db"`                               | 绝对路径                        |
| `"file:/path/to/test.db"`                          | 同上                        |
| `"file:test.db?param1=value1&param2=value2"`       | 带查询参数的相对路径      |
| `"file::memory:?verbose&log-level=test"`           | 带查询参数的内存数据库 |
| `"///path/to/test.db?param1=value1&param2=value2"` | 带查询参数的绝对路径      |

:::note 连接字符串参数处理
包含查询参数的连接字符串，如 "[file:test.db?param1=value1&param2=value2](file:test.db?param1=value1&param2=value2)"
"param1=value1" 将作为启动参数传递给 ClickHouse 引擎。

有关更多详细信息，请参阅 `clickhouse local –help –verbose`

一些特殊参数处理：

- "mode=ro" 对于 ClickHouse 将转换为 "–readonly=1"（只读模式）
  :::

:::warning 重要

- 同一时间只能有一个会话。如果要创建新会话，需要先关闭现有会话。
- 创建新会话将自动关闭现有会话。
  :::

---

#### `cleanup` {#cleanup}

清理会话资源并处理异常。

此方法尝试关闭会话，同时抑制清理过程中可能发生的任何异常。它在错误处理场景中特别有用，或者当您需要确保无论会话状态如何都能完成清理时。

**语法**

```python
cleanup()
```

:::note
此方法永远不会抛出异常，因此可以安全地在 finally 块或析构函数中调用。
:::

**示例**

```pycon
>>> session = Session("test.db")
>>> try:
...     session.query("INVALID SQL")
... finally:
...     session.cleanup()  # 无论是否有错误都能安全清理
```

**另请参阅**

- [`close()`](#chdb-session-session-close) - 用于显式关闭会话并传播错误

---

#### `close` {#close}

关闭会话并清理资源。

此方法关闭底层连接并重置全局会话状态。
调用此方法后，会话将变为无效状态，无法用于后续查询。

**语法**

```python
close()
```

:::note
当会话用作上下文管理器或会话对象被销毁时，此方法会自动调用。
:::

:::warning 重要
调用 `close()` 后尝试使用会话将导致错误。
:::

**示例**

```pycon
>>> session = Session("test.db")
>>> session.query("SELECT 1")
>>> session.close()  # 显式关闭会话
```

---

#### `query` {#chdb-session-session-query}

执行 SQL 查询并返回结果。

此方法针对会话的数据库执行 SQL 查询，并以指定格式返回结果。该方法支持多种输出格式，并在查询之间维护会话状态。

**语法**

```python
query(sql, fmt='CSV', udf_path='')
```

**参数**


| 参数  | 类型 | 默认值    | 描述                                                                                                                                                                                                                                                                                                                         |
| ---------- | ---- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`      | str  | _必需_ | 要执行的 SQL 查询字符串                                                                                                                                                                                                                                                                                                                         |
| `fmt`      | str  | `"CSV"`    | 结果输出格式。可用格式：<br/>• `"CSV"` - 逗号分隔值<br/>• `"JSON"` - JSON 格式<br/>• `"TabSeparated"` - 制表符分隔值<br/>• `"Pretty"` - 美化打印的表格格式<br/>• `"JSONCompact"` - 紧凑 JSON 格式<br/>• `"Arrow"` - Apache Arrow 格式<br/>• `"Parquet"` - Parquet 格式 |
| `udf_path` | str  | `""`       | 用户自定义函数路径。如未指定，则使用会话初始化时的 UDF 路径                                                                                                                                                                                                                                     |

**返回值**

以指定格式返回查询结果。
具体返回类型取决于格式参数：

- 字符串格式（CSV、JSON 等）返回 str
- 二进制格式（Arrow、Parquet）返回 bytes

**异常**

| 异常      | 条件                           |
| -------------- | ----------------------------------- |
| `RuntimeError` | 会话已关闭或无效 |
| `ValueError`   | SQL 查询格式错误       |

:::note
不支持 "Debug" 格式，将自动转换为 "CSV" 并发出警告。
如需调试，请改用连接字符串参数。
:::

:::warning 警告
此方法同步执行查询并将所有结果加载到内存中。对于大型结果集，建议使用 [`send_query()`](#chdb-session-session-send_query) 进行流式结果处理。
:::

**示例**

```pycon
>>> session = Session("test.db")
>>>
>>> # 使用默认 CSV 格式的基本查询
>>> result = session.query("SELECT 1 as number")
>>> print(result)
number
1
```

```pycon
>>> # 使用 JSON 格式的查询
>>> result = session.query("SELECT 1 as number", fmt="JSON")
>>> print(result)
{"number": "1"}
```

```pycon
>>> # 包含表创建的复杂查询
>>> session.query("CREATE TABLE test (id INT, name String) ENGINE = Memory")
>>> session.query("INSERT INTO test VALUES (1, 'Alice'), (2, 'Bob')")
>>> result = session.query("SELECT * FROM test ORDER BY id")
>>> print(result)
id,name
1,Alice
2,Bob
```

**另请参阅**

- [`send_query()`](#chdb-session-session-send_query) - 用于流式查询执行
- [`sql`](#chdb-session-session-sql) - 此方法的别名

---

#### `send_query` {#chdb-session-session-send_query}

执行 SQL 查询并返回流式结果迭代器。

此方法针对会话数据库执行 SQL 查询，并返回一个流式结果对象，允许您迭代结果而无需一次性将所有内容加载到内存中。这对于大型结果集特别有用。

**语法**

```python
send_query(sql, fmt='CSV') → StreamingResult
```

**参数**

| 参数 | 类型 | 默认值    | 描述                                                                                                                                                                                                                                                                          |
| --------- | ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sql`     | str  | _必需_ | 要执行的 SQL 查询字符串                                                                                                                                                                                                                                                          |
| `fmt`     | str  | `"CSV"`    | 结果输出格式。可用格式：<br/>• `"CSV"` - 逗号分隔值<br/>• `"JSON"` - JSON 格式<br/>• `"TabSeparated"` - 制表符分隔值<br/>• `"JSONCompact"` - 紧凑 JSON 格式<br/>• `"Arrow"` - Apache Arrow 格式<br/>• `"Parquet"` - Parquet 格式 |

**返回值**

| 返回类型       | 描述                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `StreamingResult` | 流式结果迭代器，逐步生成查询结果。该迭代器可用于 for 循环或转换为其他数据结构 |

**异常**

| 异常      | 条件                           |
| -------------- | ----------------------------------- |
| `RuntimeError` | 会话已关闭或无效 |
| `ValueError`   | SQL 查询格式错误       |

:::note
不支持 "Debug" 格式，将自动转换为 "CSV" 并发出警告。如需调试，请改用连接字符串参数。
:::

:::warning
返回的 StreamingResult 对象应及时使用或妥善存储，因为它会维护与数据库的连接。
:::

**示例**


```pycon
>>> session = Session("test.db")
>>> session.query("CREATE TABLE big_table (id INT, data String) ENGINE = MergeTree() order by id")
>>>
>>> # 插入大型数据集
>>> for i in range(1000):
...     session.query(f"INSERT INTO big_table VALUES ({i}, 'data_{i}')")
>>>
>>> # 使用流式传输避免内存问题
>>> streaming_result = session.send_query("SELECT * FROM big_table ORDER BY id")
>>> for chunk in streaming_result:
...     print(f"Processing chunk: {len(chunk)} bytes")
...     # 处理数据块而无需加载整个结果集
```

```pycon
>>> # 使用上下文管理器
>>> with session.send_query("SELECT COUNT(*) FROM big_table") as stream:
...     for result in stream:
...         print(f"Count result: {result}")
```

**另请参阅**

- [`query()`](#chdb-session-session-query) - 用于非流式查询执行
- `chdb.state.sqlitelike.StreamingResult` - 流式结果迭代器

---

#### `sql` {#chdb-session-session-sql}

执行 SQL 查询并返回结果。

此方法对会话数据库执行 SQL 查询,并以指定格式返回结果。该方法支持多种输出格式,并在查询之间维护会话状态。

**语法**

```python
sql(sql, fmt='CSV', udf_path='')
```

**参数**

| 参数  | 类型 | 默认值    | 描述                                                                                                                                                                                                                                                                                                                         |
| ---------- | ---- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`      | str  | _必需_ | 要执行的 SQL 查询字符串                                                                                                                                                                                                                                                                                                         |
| `fmt`      | str  | `"CSV"`    | 结果的输出格式。可用格式:<br/>• `"CSV"` - 逗号分隔值<br/>• `"JSON"` - JSON 格式<br/>• `"TabSeparated"` - 制表符分隔值<br/>• `"Pretty"` - 美化打印的表格格式<br/>• `"JSONCompact"` - 紧凑 JSON 格式<br/>• `"Arrow"` - Apache Arrow 格式<br/>• `"Parquet"` - Parquet 格式 |
| `udf_path` | str  | `""`       | 用户定义函数的路径。如果未指定,则使用会话初始化时的 UDF 路径                                                                                                                                                                                                                                                                     |

**返回值**

以指定格式返回查询结果。
具体的返回类型取决于格式参数:

- 字符串格式(CSV、JSON 等)返回 str
- 二进制格式(Arrow、Parquet)返回 bytes

**抛出异常:**

| 异常      | 条件                           |
| -------------- | ----------------------------------- |
| `RuntimeError` | 如果会话已关闭或无效 |
| `ValueError`   | 如果 SQL 查询格式错误       |

:::note
不支持 "Debug" 格式,将自动转换为 "CSV" 并发出警告。对于调试,请改用连接字符串参数。
:::

:::warning 警告
此方法同步执行查询并将所有结果加载到内存中。
对于大型结果集,请考虑使用 [`send_query()`](#chdb-session-session-send_query) 进行流式传输。
:::

**示例**

```pycon
>>> session = Session("test.db")
>>>
>>> # 使用默认 CSV 格式的基本查询
>>> result = session.query("SELECT 1 as number")
>>> print(result)
number
1
```

```pycon
>>> # 使用 JSON 格式的查询
>>> result = session.query("SELECT 1 as number", fmt="JSON")
>>> print(result)
{"number": "1"}
```

```pycon
>>> # 包含表创建的复杂查询
>>> session.query("CREATE TABLE test (id INT, name String) ENGINE = MergeTree() order by id")
>>> session.query("INSERT INTO test VALUES (1, 'Alice'), (2, 'Bob')")
>>> result = session.query("SELECT * FROM test ORDER BY id")
>>> print(result)
id,name
1,Alice
2,Bob
```

**另请参阅**

- [`send_query()`](#chdb-session-session-send_query) - 用于流式查询执行
- [`sql`](#chdb-session-session-sql) - 此方法的别名


## 状态管理 {#chdb-state-management}

### `chdb.state.connect` {#chdb_state_connect}

创建到 chDB 后台服务器的[连接](#chdb-state-sqlitelike-connection)。

此函数建立到 chDB (ClickHouse) 数据库引擎的连接。
每个进程只允许一个打开的连接。使用相同连接字符串多次调用将返回相同的连接对象。

**语法**

```python
chdb.state.connect(connection_string: str = ':memory:') → Connection
```

**参数**

| 参数                               | 类型 | 默认值       | 描述                                           |
| ---------------------------------- | ---- | ------------ | ---------------------------------------------- |
| `connection_string(str, optional)` | str  | `":memory:"` | 数据库连接字符串。请参阅下面的格式。           |

**基本格式**

支持的连接字符串格式:

| 格式                      | 描述                         |
| ------------------------- | ---------------------------- |
| `":memory:"`              | 内存数据库(默认)             |
| `"test.db"`               | 相对路径数据库文件           |
| `"file:test.db"`          | 与相对路径相同               |
| `"/path/to/test.db"`      | 绝对路径数据库文件           |
| `"file:/path/to/test.db"` | 与绝对路径相同               |

**带查询参数**

| 格式                                               | 描述                      |
| -------------------------------------------------- | ------------------------- |
| `"file:test.db?param1=value1&param2=value2"`       | 带参数的相对路径          |
| `"file::memory:?verbose&log-level=test"`           | 带参数的内存数据库        |
| `"///path/to/test.db?param1=value1&param2=value2"` | 带参数的绝对路径          |

**查询参数处理**

查询参数作为启动参数传递给 ClickHouse 引擎。
特殊参数处理:

| 特殊参数          | 转换为         | 描述                    |
| ----------------- | -------------- | ----------------------- |
| `mode=ro`         | `--readonly=1` | 只读模式                |
| `verbose`         | (标志)         | 启用详细日志记录        |
| `log-level=test`  | (设置)         | 设置日志级别            |

有关完整的参数列表,请参阅 `clickhouse local --help --verbose`

**返回值**

| 返回类型     | 描述                                                                                                                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Connection` | 数据库连接对象,支持:<br/>• 使用 `Connection.cursor()` 创建游标<br/>• 使用 `Connection.query()` 进行直接查询<br/>• 使用 `Connection.send_query()` 进行流式查询<br/>• 用于自动清理的上下文管理器协议 |

**异常**

| 异常           | 条件                            |
| -------------- | ------------------------------- |
| `RuntimeError` | 如果连接到数据库失败            |

:::warning 警告
每个进程仅支持一个连接。
创建新连接将关闭任何现有连接。
:::

**示例**

```pycon
>>> # 内存数据库
>>> conn = connect()
>>> conn = connect(":memory:")
>>>
>>> # 基于文件的数据库
>>> conn = connect("my_data.db")
>>> conn = connect("/path/to/data.db")
>>>
>>> # 带参数
>>> conn = connect("data.db?mode=ro")  # 只读模式
>>> conn = connect(":memory:?verbose&log-level=debug")  # 调试日志
>>>
>>> # 使用上下文管理器进行自动清理
>>> with connect("data.db") as conn:
...     result = conn.query("SELECT 1")
...     print(result)
>>> # 连接自动关闭
```

**另请参阅**

- `Connection` - 数据库连接类
- `Cursor` - 用于 DB-API 2.0 操作的数据库游标

### **类** `chdb.state.sqlitelike.Connection` {#chdb-state-sqlitelike-connection}

基类: `object`

**语法**

```python
class chdb.state.sqlitelike.Connection(connection_string: str)
```

---

#### `close` {#chdb-session-session-close}

关闭连接并清理资源。

此方法关闭数据库连接并清理所有相关资源,包括活动游标。调用此方法后,连接将变为无效,无法用于后续操作。

**语法**

```python
close() → None
```

:::note
此方法是幂等的 - 多次调用是安全的。
:::

:::warning 警告
关闭连接时,任何正在进行的流式查询都将被取消。请确保在关闭之前处理所有重要数据。
:::

**示例**

```pycon
>>> conn = connect("test.db")
>>> # 使用连接进行查询
>>> conn.query("CREATE TABLE test (id INT) ENGINE = Memory")
>>> # 完成后关闭
>>> conn.close()
```


```pycon
>>> # 使用上下文管理器（自动清理）
>>> with connect("test.db") as conn:
...     conn.query("SELECT 1")
...     # 连接自动关闭
```

---

#### `cursor` {#chdb-state-sqlitelike-connection-cursor}

创建用于执行查询的 [Cursor](#chdb-state-sqlitelike-cursor) 对象。

此方法创建一个数据库游标，提供标准的 DB-API 2.0 接口用于执行查询和获取结果。游标允许对查询执行和结果检索进行细粒度控制。

**语法**

```python
cursor() → Cursor
```

**返回值**

| 返回类型 | 描述                             |
| ----------- | --------------------------------------- |
| `Cursor`    | 用于数据库操作的游标对象 |

:::note
创建新游标将替换与此连接关联的任何现有游标。每个连接仅支持一个游标。
:::

**示例**

```pycon
>>> conn = connect(":memory:")
>>> cursor = conn.cursor()
>>> cursor.execute("CREATE TABLE test (id INT, name String) ENGINE = Memory")
>>> cursor.execute("INSERT INTO test VALUES (1, 'Alice')")
>>> cursor.execute("SELECT * FROM test")
>>> rows = cursor.fetchall()
>>> print(rows)
((1, 'Alice'),)
```

**另请参阅**

- [`Cursor`](#chdb-state-sqlitelike-cursor) - 数据库游标实现

---

#### `query` {#chdb-state-sqlitelike-connection-query}

执行 SQL 查询并返回完整结果。

此方法同步执行 SQL 查询并返回完整的结果集。它支持多种输出格式，并自动应用特定格式的后处理。

**语法**

```python
query(query: str, format: str = 'CSV') → Any
```

**参数：**

| 参数 | 类型 | 默认值    | 描述                                                                                                                                                                                                                                                                                        |
| --------- | ---- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`   | str  | _必需_ | 要执行的 SQL 查询字符串                                                                                                                                                                                                                                                                        |
| `format`  | str  | `"CSV"`    | 结果的输出格式。支持的格式：<br/>• `"CSV"` - 逗号分隔值（字符串）<br/>• `"JSON"` - JSON 格式（字符串）<br/>• `"Arrow"` - Apache Arrow 格式（字节）<br/>• `"Dataframe"` - Pandas DataFrame（需要 pandas）<br/>• `"Arrowtable"` - PyArrow Table（需要 pyarrow） |

**返回值**

| 返回类型        | 描述                    |
| ------------------ | ------------------------------ |
| `str`              | 用于字符串格式（CSV、JSON） |
| `bytes`            | 用于 Arrow 格式               |
| `pandas.DataFrame` | 用于 dataframe 格式           |
| `pyarrow.Table`    | 用于 arrowtable 格式          |

**异常**

| 异常      | 条件                                         |
| -------------- | ------------------------------------------------- |
| `RuntimeError` | 查询执行失败时                          |
| `ImportError`  | 未安装格式所需的包时 |

:::warning 警告
此方法将整个结果集加载到内存中。对于大型结果，请考虑使用 [`send_query()`](#chdb-state-sqlitelike-connection-send_query) 进行流式处理。
:::

**示例**

```pycon
>>> conn = connect(":memory:")
>>>
>>> # 基本 CSV 查询
>>> result = conn.query("SELECT 1 as num, 'hello' as text")
>>> print(result)
num,text
1,hello
```

```pycon
>>> # DataFrame 格式
>>> df = conn.query("SELECT number FROM numbers(5)", "dataframe")
>>> print(df)
   number
0       0
1       1
2       2
3       3
4       4
```

**See also**

- [`send_query()`](#chdb-state-sqlitelike-connection-send_query) - 用于流式查询执行

---

#### `send_query` {#chdb-state-sqlitelike-connection-send_query}

执行 SQL 查询并返回流式结果迭代器。

此方法执行 SQL 查询并返回一个 StreamingResult 对象，允许您迭代结果而无需一次性将所有内容加载到内存中。这非常适合处理大型结果集。

**语法**

```python
send_query(query: str, format: str = 'CSV') → StreamingResult
```

**参数**


| 参数 | 类型 | 默认值    | 描述                                                                                                                                                                                                                                                                       |
| --------- | ---- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`   | str  | _必需_ | 要执行的 SQL 查询字符串                                                                                                                                                                                                                                                                       |
| `format`  | str  | `"CSV"`    | 结果输出格式。支持的格式：<br/>• `"CSV"` - 逗号分隔值<br/>• `"JSON"` - JSON 格式<br/>• `"Arrow"` - Apache Arrow 格式（启用 record_batch() 方法）<br/>• `"dataframe"` - Pandas DataFrame 分块<br/>• `"arrowtable"` - PyArrow Table 分块 |

**返回值**

| 返回类型       | 描述                                                                                                                                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StreamingResult` | 查询结果的流式迭代器，支持：<br/>• 迭代器协议（for 循环）<br/>• 上下文管理器协议（with 语句）<br/>• 使用 fetch() 方法手动获取<br/>• PyArrow RecordBatch 流式处理（仅 Arrow 格式） |

**异常**

| 异常      | 条件                                         |
| -------------- | ------------------------------------------------- |
| `RuntimeError` | 查询执行失败时                          |
| `ImportError`  | 未安装格式所需的包时 |

:::note
只有 "Arrow" 格式支持在返回的 StreamingResult 上使用 `record_batch()` 方法。
:::

**示例**

```pycon
>>> conn = connect(":memory:")
>>>
>>> # 基本流式处理
>>> stream = conn.send_query("SELECT number FROM numbers(1000)")
>>> for chunk in stream:
...     print(f"处理分块：{len(chunk)} 字节")
```

```pycon
>>> # 使用上下文管理器进行清理
>>> with conn.send_query("SELECT * FROM large_table") as stream:
...     chunk = stream.fetch()
...     while chunk:
...         process_data(chunk)
...         chunk = stream.fetch()
```

```pycon
>>> # 使用 RecordBatch 流式处理的 Arrow 格式
>>> stream = conn.send_query("SELECT * FROM data", "Arrow")
>>> reader = stream.record_batch(rows_per_batch=10000)
>>> for batch in reader:
...     print(f"批次形状：{batch.num_rows} x {batch.num_columns}")
```

**另请参阅**

- [`query()`](#chdb-state-sqlitelike-connection-query) - 用于非流式查询执行
- `StreamingResult` - 流式结果迭代器

---

### **class** `chdb.state.sqlitelike.Cursor` {#chdb-state-sqlitelike-cursor}

基类：`object`

```python
class chdb.state.sqlitelike.Cursor(connection)
```

---

#### `close` {#cursor-close-none}

关闭游标并清理资源。

此方法关闭游标并清理所有关联的资源。
调用此方法后，游标将变为无效状态，无法用于后续操作。

**语法**

```python
close() → None
```

:::note
此方法是幂等的 - 多次调用是安全的。
当连接关闭时，游标也会自动关闭。
:::

**示例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT 1")
>>> result = cursor.fetchone()
>>> cursor.close()  # 清理游标资源
```

---

#### `column_names` {#chdb-state-sqlitelike-cursor-column_names}

返回上次执行查询的列名列表。

此方法返回最近执行的 SELECT 查询的列名。
列名按照它们在结果集中出现的顺序返回。

**语法**

```python
column_names() → list
```

**返回值**

| 返回类型 | 描述                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| `list`      | 列名字符串列表，如果未执行查询或查询未返回列，则为空列表 |

**示例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name, email FROM users LIMIT 1")
>>> print(cursor.column_names())
['id', 'name', 'email']
```

**See also**

- [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - 获取列类型信息
- [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0 列描述

---

#### `column_types` {#chdb-state-sqlitelike-cursor-column_types}

返回上次执行查询的列类型列表。

此方法返回最近执行的 SELECT 查询的 ClickHouse 列类型名称。
类型按照它们在结果集中出现的顺序返回。

**语法**

```python
column_types() → list
```

**返回值**


| 返回类型 | 描述                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `list`      | ClickHouse 类型名称字符串列表,如果未执行查询或查询未返回列,则为空列表 |

**示例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT toInt32(1), toString('hello')")
>>> print(cursor.column_types())
['Int32', 'String']
```

**另请参阅**

- [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - 获取列名信息
- [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0 列描述

---

#### `commit` {#commit}

提交任何待处理的事务。

此方法提交任何待处理的数据库事务。在 ClickHouse 中,
大多数操作都是自动提交的,但提供此方法是为了
与 DB-API 2.0 兼容。

:::note
ClickHouse 通常会自动提交操作,因此通常不需要显式提交。
提供此方法是为了与标准 DB-API 2.0 工作流兼容。
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

此属性返回一个包含 7 项元组的列表,描述上次执行的 SELECT 查询结果集中的每一列。
每个元组包含:
(name, type_code, display_size, internal_size, precision, scale, null_ok)

目前仅提供 name 和 type_code,其他字段设置为 None。

**返回值**

| 返回类型 | 描述                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------- |
| `list`      | 描述每一列的 7 元组列表,如果未执行 SELECT 查询,则为空列表 |

:::note
这遵循 DB-API 2.0 规范中的 cursor.description。
在此实现中,仅前两个元素(name 和 type_code)包含有意义的数据。
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

**另请参阅**

- [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - 仅获取列名
- [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - 仅获取列类型

---

#### `execute` {#execute}

执行 SQL 查询并准备结果以供获取。

此方法执行 SQL 查询并准备结果,以便使用 fetch 方法检索。
它处理结果数据的解析以及 ClickHouse 数据类型的自动类型转换。

**语法**

```python
execute(query: str) → None
```

**参数:**

| 参数 | 类型 | 描述                 |
| --------- | ---- | --------------------------- |
| `query`   | str  | 要执行的 SQL 查询字符串 |

**异常**

| 异常   | 条件                                        |
| ----------- | ------------------------------------------------ |
| `Exception` | 如果查询执行失败或结果解析失败 |

:::note
此方法遵循 DB-API 2.0 规范中的 `cursor.execute()`。
执行后,使用 `fetchone()`、`fetchmany()` 或 `fetchall()` 来检索结果。
:::

:::note
该方法自动将 ClickHouse 数据类型转换为相应的 Python 类型:

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
>>> # 执行 DDL
>>> cursor.execute("CREATE TABLE test (id INT, name String) ENGINE = Memory")
>>>
>>> # 执行 DML
>>> cursor.execute("INSERT INTO test VALUES (1, 'Alice')")
>>>
>>> # 执行 SELECT 并获取结果
>>> cursor.execute("SELECT * FROM test")
>>> rows = cursor.fetchall()
>>> print(rows)
((1, 'Alice'),)
```

**另请参阅**

- [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 获取单行
- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 获取多行
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 获取所有剩余行


---

#### `fetchall` {#chdb-state-sqlitelike-cursor-fetchall}

获取查询结果中的所有剩余行。

此方法从当前游标位置开始检索查询结果集中的所有剩余行。返回一个元组，其中包含多个行元组，并已应用相应的 Python 类型转换。

**Syntax**

```python
fetchall() → tuple
```

**返回值:**

| 返回类型 | 描述 |
|-------------|-------------|
| `tuple` | 包含结果集中所有剩余行元组的元组。如果没有可用行，则返回空元组 |

:::warning 警告
此方法会一次性将所有剩余行加载到内存中。对于大型结果集，建议使用 [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) 分批处理结果。
:::

**Examples**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users")
>>> all_users = cursor.fetchall()
>>> for user_id, user_name in all_users:
...     print(f"User {user_id}: {user_name}")
```

**另请参阅**
- [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 获取单行
- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 分批获取多行

---

#### `fetchmany` {#chdb-state-sqlitelike-cursor-fetchmany}

从查询结果中获取多行。

此方法从当前查询结果集中检索最多 'size' 行。返回一个元组，其中包含多个行元组，每行包含已应用相应 Python 类型转换的列值。

**Syntax**

```python
fetchmany(size: int = 1) → tuple
```

**参数**

| 参数 | 类型 | 默认值 | 描述                     |
| --------- | ---- | ------- | ------------------------------- |
| `size`    | int  | `1`     | 要获取的最大行数 |

**返回值**

| 返回类型 | 描述                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `tuple`     | 包含最多 'size' 个行元组的元组。如果结果集已耗尽，可能包含更少的行 |

:::note
此方法遵循 DB-API 2.0 规范。如果结果集已耗尽，将返回少于 'size' 的行数。
:::

**Examples**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT * FROM large_table")
>>>
>>> # 分批处理结果
>>> while True:
...     batch = cursor.fetchmany(100)  # 每次获取 100 行
...     if not batch:
...         break
...     process_batch(batch)
```

**另请参阅**

- [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 获取单行
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 获取所有剩余行

---

#### `fetchone` {#chdb-state-sqlitelike-cursor-fetchone}

从查询结果中获取下一行。

此方法从当前查询结果集中检索下一个可用行。返回一个元组，其中包含已应用相应 Python 类型转换的列值。

**Syntax**

```python
fetchone() → tuple | None
```

**返回值:**

| 返回类型       | 描述                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| `Optional[tuple]` | 下一行的列值元组，如果没有更多可用行则返回 None |

:::note
此方法遵循 DB-API 2.0 规范。列值会根据 ClickHouse 列类型自动转换为相应的 Python 类型。
:::

**Examples**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users")
>>> row = cursor.fetchone()
>>> while row is not None:
...     user_id, user_name = row
...     print(f"User {user_id}: {user_name}")
...     row = cursor.fetchone()
```

**另请参阅**

- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 获取多行
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 获取所有剩余行

---

### `chdb.state.sqlitelike` {#state-sqlitelike-to_arrowtable}

将查询结果转换为 PyArrow Table。

此函数将 chdb 查询结果转换为 PyArrow Table 格式，该格式提供高效的列式数据访问，并可与其他数据处理库进行互操作。

**Syntax**

```python
chdb.state.sqlitelike.to_arrowTable(res)
```

**参数:**


| 参数 | 类型 | 描述                                                |
| --------- | ---- | ---------------------------------------------------------- |
| `res`     | -    | 来自 chdb 的查询结果对象,包含 Arrow 格式数据 |

**返回值**

| 返回类型     | 描述                                |
| --------------- | ------------------------------------------ |
| `pyarrow.Table` | 包含查询结果的 PyArrow 表 |

**异常**

| 异常     | 条件                                       |
| ------------- | ----------------------------------------------- |
| `ImportError` | 如果未安装 pyarrow 或 pandas 包 |

:::note
此函数需要同时安装 pyarrow 和 pandas。
安装命令:`pip install pyarrow pandas`
:::

:::warning 警告
空结果将返回一个没有架构的空 PyArrow 表。
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

此函数通过先转换为 PyArrow 表,然后再转换为 DataFrame,将 chdb 查询结果转换为 Pandas DataFrame 格式。这提供了使用 Pandas API 进行数据分析的便捷功能。

**语法**

```python
chdb.state.sqlitelike.to_df(r)
```

**参数:**

| 参数 | 类型 | 描述                                                |
| --------- | ---- | ---------------------------------------------------------- |
| `r`       | -    | 来自 chdb 的查询结果对象,包含 Arrow 格式数据 |

**返回值:**

| 返回类型        | 描述                                                                         |
| ------------------ | ----------------------------------------------------------------------------------- |
| `pandas.DataFrame` | 包含查询结果的 DataFrame,具有相应的列名和数据类型 |

**异常**

| 异常     | 条件                                       |
| ------------- | ----------------------------------------------- |
| `ImportError` | 如果未安装 pyarrow 或 pandas 包 |

:::note
此函数在 Arrow 到 Pandas 的转换过程中使用多线程,以提高大型数据集的性能。
:::

**另请参阅**

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

基类:

```python
class chdb.dataframe.Table(*args: Any, **kwargs: Any)
```


## 数据库 API (DBAPI) 2.0 接口 {#database-api-interface}

chDB 提供了与 Python DB-API 2.0 兼容的数据库连接接口,允许您在期望标准数据库接口的工具和框架中使用 chDB。

chDB DB-API 2.0 接口包括:

- **连接**: 通过连接字符串进行数据库连接管理
- **游标**: 查询执行和结果检索
- **类型系统**: 符合 DB-API 2.0 的类型常量和转换器
- **错误处理**: 标准数据库异常层次结构
- **线程安全**: 1 级线程安全(线程可以共享模块但不能共享连接)

---

### 核心函数 {#core-functions}

数据库 API (DBAPI) 2.0 接口实现了以下核心函数:

#### `chdb.dbapi.connect` {#dbapi-connect}

初始化新的数据库连接。

**语法**

```python
chdb.dbapi.connect(*args, **kwargs)
```

**参数**

| 参数   | 类型 | 默认值  | 描述                           |
| ------ | ---- | ------- | ------------------------------ |
| `path` | str  | `None`  | 数据库文件路径。None 表示内存数据库 |

**异常**

| 异常                                 | 条件           |
| ------------------------------------ | -------------- |
| [`err.Error`](#chdb-dbapi-err-error) | 无法建立连接时 |

---

#### `chdb.dbapi.get_client_info()` {#dbapi-get-client-info}

获取客户端版本信息。

返回 chDB 客户端版本字符串,以实现与 MySQLdb 的兼容性。

**语法**

```python
chdb.dbapi.get_client_info()
```

**返回值**

| 返回类型 | 描述                                 |
| -------- | ------------------------------------ |
| `str`    | 格式为 'major.minor.patch' 的版本字符串 |

---

### 类型构造函数 {#type-constructors}

#### `chdb.dbapi.Binary(x)` {#dbapi-binary}

将 x 作为二进制类型返回。

此函数将输入转换为 bytes 类型,用于二进制数据库字段,遵循 DB-API 2.0 规范。

**语法**

```python
chdb.dbapi.Binary(x)
```

**参数**

| 参数 | 类型 | 描述                 |
| ---- | ---- | -------------------- |
| `x`  | -    | 要转换为二进制的输入数据 |

**返回值**

| 返回类型 | 描述                 |
| -------- | -------------------- |
| `bytes`  | 转换为 bytes 的输入数据 |

---

### 连接类 {#connection-class}

#### **class** `chdb.dbapi.connections.Connection(path=None)` {#chdb-dbapi-connections-connection}

基类: `object`

符合 DB-API 2.0 的 chDB 数据库连接。

此类提供了标准的 DB-API 接口,用于连接和操作 chDB 数据库。它支持内存数据库和基于文件的数据库。

该连接管理底层的 chDB 引擎,并提供执行查询、管理事务(对于 ClickHouse 为空操作)和创建游标的方法。

```python
class chdb.dbapi.connections.Connection(path=None)
```

**参数**

| 参数   | 类型 | 默认值  | 描述                                                                                    |
| ------ | ---- | ------- | --------------------------------------------------------------------------------------- |
| `path` | str  | `None`  | 数据库文件路径。如果为 None,则使用内存数据库。可以是类似 'database.db' 的文件路径,或 None 表示 ':memory:' |

**变量**

| 变量       | 类型 | 描述                                  |
| ---------- | ---- | ------------------------------------- |
| `encoding` | str  | 查询的字符编码,默认为 'utf8'            |
| `open`     | bool | 连接打开时为 True,关闭时为 False |

**示例**

```pycon
>>> # 内存数据库
>>> conn = Connection()
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT 1")
>>> result = cursor.fetchall()
>>> conn.close()
```

```pycon
>>> # 基于文件的数据库
>>> conn = Connection('mydata.db')
>>> with conn.cursor() as cur:
...     cur.execute("CREATE TABLE users (id INT, name STRING) ENGINE = MergeTree() order by id")
...     cur.execute("INSERT INTO users VALUES (1, 'Alice')")
>>> conn.close()
```

```pycon
>>> # 上下文管理器用法
>>> with Connection() as cur:
...     cur.execute("SELECT version()")
...     version = cur.fetchone()
```

:::note
ClickHouse 不支持传统事务,因此 commit() 和 rollback() 操作为空操作,但为了符合 DB-API 而提供。
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

**引发异常**

| 异常                                 | 条件                            |
| ------------------------------------ | ------------------------------- |
| [`err.Error`](#chdb-dbapi-err-error) | 如果连接已关闭                  |

---

#### `commit` {#dbapi-commit}

提交当前事务。

**语法**

```python
commit()
```

:::note
对于 chDB/ClickHouse 来说,这是一个空操作,因为它不支持传统事务。
提供此方法是为了符合 DB-API 2.0 规范。
:::

---

#### `cursor` {#dbapi-cursor}

创建用于执行查询的新游标。

**语法**

```python
cursor(cursor=None)
```

**参数**

| 参数      | 类型 | 描述                                |
| --------- | ---- | ----------------------------------- |
| `cursor`  | -    | 已忽略,为兼容性而提供               |

**返回值**

| 返回类型    | 描述                                  |
| ----------- | ------------------------------------- |
| `Cursor`    | 此连接的新游标对象                    |

**引发异常**

| 异常                                 | 条件                    |
| ------------------------------------ | ----------------------- |
| [`err.Error`](#chdb-dbapi-err-error) | 如果连接已关闭          |

**示例**

```pycon
>>> conn = Connection()
>>> cur = conn.cursor()
>>> cur.execute("SELECT 1")
>>> result = cur.fetchone()
```

---

#### `escape` {#escape}

转义值以便安全地包含在 SQL 查询中。

**语法**

```python
escape(obj, mapping=None)
```

**参数**

| 参数      | 类型 | 描述                                          |
| --------- | ---- | --------------------------------------------- |
| `obj`     | -    | 要转义的值(字符串、字节、数字等)              |
| `mapping` | -    | 用于转义的可选字符映射                        |

**返回值**

| 返回类型    | 描述                                                  |
| ----------- | ----------------------------------------------------- |
| -           | 适用于 SQL 查询的输入转义版本                         |

**示例**

```pycon
>>> conn = Connection()
>>> safe_value = conn.escape("O'Reilly")
>>> query = f"SELECT * FROM users WHERE name = {safe_value}"
```

---

#### `escape_string` {#escape-string}

转义字符串值以用于 SQL 查询。

**语法**

```python
escape_string(s)
```

**参数**

| 参数      | 类型 | 描述             |
| --------- | ---- | ---------------- |
| `s`       | str  | 要转义的字符串   |

**返回值**

| 返回类型    | 描述                                  |
| ----------- | ------------------------------------- |
| `str`       | 可安全包含在 SQL 中的转义字符串       |

---

#### `property open` {#property-open}

检查连接是否打开。

**返回值**

| 返回类型    | 描述                                        |
| ----------- | ------------------------------------------- |
| `bool`      | 如果连接打开则为 True,如果关闭则为 False    |

---

#### `query` {#dbapi-query}

直接执行 SQL 查询并返回原始结果。

此方法绕过游标接口直接执行查询。
对于标准的 DB-API 使用,建议使用 cursor() 方法。

**语法**

```python
query(sql, fmt='CSV')
```

**参数:**

| 参数      | 类型         | 默认值     | 描述                                                                             |
| --------- | ------------ | ---------- | -------------------------------------------------------------------------------- |
| `sql`     | str or bytes | _必需_     | 要执行的 SQL 查询                                                                |
| `fmt`     | str          | `"CSV"`    | 输出格式。支持的格式包括 "CSV"、"JSON"、"Arrow"、"Parquet" 等。                  |

**返回值**

| 返回类型    | 描述                                 |
| ----------- | ------------------------------------ |
| -           | 指定格式的查询结果                   |

**引发异常**

| 异常                                                   | 条件                                   |
| ------------------------------------------------------ | -------------------------------------- |
| [`err.InterfaceError`](#chdb-dbapi-err-interfaceerror) | 如果连接已关闭或查询失败               |

**示例**

```pycon
>>> conn = Connection()
>>> result = conn.query("SELECT 1, 'hello'", "CSV")
>>> print(result)
"1,hello\n"
```

---

#### `property resp` {#property-resp}

获取最后一次查询的响应。

**返回值**

| 返回类型    | 描述                                        |
| ----------- | ------------------------------------------- |
| -           | 最后一次 query() 调用的原始响应             |

:::note
此属性在每次直接调用 query() 时更新。
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
对于 chDB/ClickHouse 来说,这是一个空操作,因为它不支持传统事务。提供此方法是为了符合 DB-API 2.0 规范。
:::

---

### Cursor 类 {#cursor-class}

#### **class** `chdb.dbapi.cursors.Cursor` {#chdb-dbapi-cursors-cursor}

基类:`object`

用于执行查询和获取结果的 DB-API 2.0 游标。

游标提供了执行 SQL 语句、管理查询结果和遍历结果集的方法。它支持参数绑定、批量操作,并遵循 DB-API 2.0 规范。

不要直接创建 Cursor 实例。请使用 `Connection.cursor()` 代替。

```python
class chdb.dbapi.cursors.Cursor(connection)
```

| 变量              | 类型  | 描述                                                 |
| ----------------- | ----- | ---------------------------------------------------- |
| `description`     | tuple | 最后一次查询结果的列元数据                           |
| `rowcount`        | int   | 最后一次查询影响的行数(未知时为 -1)                  |
| `arraysize`       | int   | 一次获取的默认行数(默认值:1)                        |
| `lastrowid`       | -     | 最后插入行的 ID(如适用)                              |
| `max_stmt_length` | int   | executemany() 的最大语句大小(默认值:1024000)         |

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
有关完整的规范详情,请参阅 [DB-API 2.0 Cursor Objects](https://www.python.org/dev/peps/pep-0249/#cursor-objects)。
:::

---

#### `callproc` {#callproc}

执行存储过程(占位符实现)。

**语法**

```python
callproc(procname, args=())
```

**参数**

| 参数       | 类型     | 描述                     |
| ---------- | -------- | ------------------------ |
| `procname` | str      | 要执行的存储过程名称     |
| `args`     | sequence | 传递给存储过程的参数     |

**返回值**

| 返回类型   | 描述                         |
| ---------- | ---------------------------- |
| `sequence` | 原始的 args 参数(未修改)     |

:::note
chDB/ClickHouse 不支持传统意义上的存储过程。提供此方法是为了符合 DB-API 2.0 规范,但不执行任何实际操作。请使用 execute() 执行所有 SQL 操作。
:::

:::warning 兼容性
这是一个占位符实现。底层 ClickHouse 引擎不支持传统存储过程的功能,如 OUT/INOUT 参数、多个结果集和服务器变量。
:::

---

#### `close` {#dbapi-cursor-close}

关闭游标并释放相关资源。

关闭后,游标将变得不可用,任何操作都会引发异常。关闭游标会耗尽所有剩余数据并释放底层游标。

**语法**

```python
close()
```

---

#### `execute` {#dbapi-execute}

执行带有可选参数绑定的 SQL 查询。

此方法执行单个 SQL 语句,并支持可选的参数替换。为了灵活性,它支持多种参数占位符样式。

**语法**

```python
execute(query, args=None)
```

**参数**

| 参数    | 类型            | 默认值     | 描述                     |
| ------- | --------------- | ---------- | ------------------------ |
| `query` | str             | _必需_     | 要执行的 SQL 查询        |
| `args`  | tuple/list/dict | `None`     | 绑定到占位符的参数       |

**返回值**

| 返回类型 | 描述                             |
| -------- | -------------------------------- |
| `int`    | 受影响的行数(未知时为 -1)        |

**参数样式**

| 样式       | 示例                                            |
| ---------- | ----------------------------------------------- |
| 问号样式   | `"SELECT * FROM users WHERE id = ?"`            |
| 命名样式   | `"SELECT * FROM users WHERE name = %(name)s"`   |
| 格式样式   | `"SELECT * FROM users WHERE age = %s"` (旧版)   |

**示例**


```pycon
>>> # 问号参数
>>> cur.execute("SELECT * FROM users WHERE id = ? AND age > ?", (123, 18))
>>>
>>> # 命名参数
>>> cur.execute("SELECT * FROM users WHERE name = %(name)s", {'name': 'Alice'})
>>>
>>> # 无参数
>>> cur.execute("SELECT COUNT(*) FROM users")
```

**抛出异常**

| 异常                                              | 条件                                 |
| ------------------------------------------------------ | ----------------------------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 游标已关闭或查询格式错误 |
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror)     | 执行期间发生数据库错误 |

---

#### `executemany(query, args)` {#chdb-dbapi-cursors-cursor-executemany}

使用不同的参数集多次执行查询。

此方法可高效地使用不同的参数值多次执行同一 SQL 查询。特别适用于批量 INSERT 操作。

**语法**

```python
executemany(query, args)
```

**参数**

| 参数 | 类型     | 描述                                                 |
| --------- | -------- | ----------------------------------------------------------- |
| `query`   | str      | 要多次执行的 SQL 查询                         |
| `args`    | sequence | 每次执行的参数元组/字典/列表序列 |

**返回值**

| 返回类型 | 描述                                         |
| ----------- | --------------------------------------------------- |
| `int`       | 所有执行中受影响的总行数 |

**示例**

```pycon
>>> # 使用问号参数批量插入
>>> users_data = [(1, 'Alice'), (2, 'Bob'), (3, 'Charlie')]
>>> cur.executemany("INSERT INTO users VALUES (?, ?)", users_data)
>>>
>>> # 使用命名参数批量插入
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

**返回值**

| 返回类型 | 描述                                    |
| ----------- | ---------------------------------------------- |
| `list`      | 表示所有剩余行的元组列表 |

**抛出异常**

| 异常                                              | 条件                              |
| ------------------------------------------------------ | -------------------------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 尚未先调用 execute() |

:::warning 警告
此方法对于大型结果集可能会消耗大量内存。
对于大型数据集,请考虑使用 `fetchmany()`。
:::

**示例**

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> all_rows = cursor.fetchall()
>>> print(len(all_rows))  # 总行数
```

---

#### `fetchmany` {#dbapi-fetchmany}

从查询结果中获取多行。

**语法**

```python
fetchmany(size=1)
```

**参数**

| 参数 | 类型 | 默认值 | 描述                                                      |
| --------- | ---- | ------- | ---------------------------------------------------------------- |
| `size`    | int  | `1`     | 要获取的行数。如果未指定,则使用 cursor.arraysize |

**返回值**

| 返回类型 | 描述                                  |
| ----------- | -------------------------------------------- |
| `list`      | 表示获取行的元组列表 |

**抛出异常**

| 异常                                              | 条件                              |
| ------------------------------------------------------ | -------------------------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 尚未先调用 execute() |

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

**返回值**

| 返回类型     | 描述                                            |
| --------------- | ------------------------------------------------------ |
| `tuple or None` | 下一行作为元组,如果没有更多行则为 None |

**抛出异常**

| 异常                                              | 条件                                |
| ------------------------------------------------------ | ---------------------------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 尚未先调用 `execute()` |

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

[`executemany()`](#chdb-dbapi-cursors-cursor-executemany) 生成的语句最大长度。

默认值为 1024000。

---

#### `mogrify` {#mogrify}

返回将发送到数据库的确切查询字符串。

此方法显示参数替换后的最终 SQL 查询,
可用于调试和日志记录。

**语法**

```python
mogrify(query, args=None)
```

**参数**

| 参数      | 类型            | 默认值     | 描述                              |
| --------- | --------------- | ---------- | --------------------------------- |
| `query`   | str             | _必需_     | 带参数占位符的 SQL 查询           |
| `args`    | tuple/list/dict | `None`     | 要替换的参数                      |

**返回值**

| 返回类型 | 描述                                |
| -------- | ----------------------------------- |
| `str`    | 替换参数后的最终 SQL 查询字符串     |

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

移动到下一个结果集(不支持)。

**语法**

```python
nextset()
```

**返回值**

| 返回类型 | 描述                                        |
| -------- | ------------------------------------------- |
| `None`   | 始终返回 None,因为不支持多个结果集          |

:::note
chDB/ClickHouse 不支持单个查询返回多个结果集。
提供此方法是为了符合 DB-API 2.0 规范,但始终返回 None。
:::

---

#### `setinputsizes` {#setinputsizes}

设置参数的输入大小(空操作实现)。

**语法**

```python
setinputsizes(*args)
```

**参数**

| 参数    | 类型 | 描述                         |
| ------- | ---- | ---------------------------- |
| `*args` | -    | 参数大小规范(被忽略)         |

:::note
此方法不执行任何操作,但 DB-API 2.0 规范要求提供。
chDB 会在内部自动处理参数大小。
:::

---

#### `setoutputsizes` {#setoutputsizes}

设置输出列大小(空操作实现)。

**语法**

```python
setoutputsizes(*args)
```

**参数**

| 参数    | 类型 | 描述                     |
| ------- | ---- | ------------------------ |
| `*args` | -    | 列大小规范(被忽略)       |

:::note
此方法不执行任何操作,但 DB-API 2.0 规范要求提供。
chDB 会在内部自动处理输出大小。
:::

---

### Error Classes {#error-classes}

chdb 数据库操作的异常类。

此模块提供了完整的异常类层次结构,用于处理
chdb 中与数据库相关的错误,遵循 Python Database API Specification v2.0。

异常层次结构如下:

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

每个异常类代表一个特定类别的数据库错误:

| 异常                | 描述                                     |
| ------------------- | ---------------------------------------- |
| `Warning`           | 数据库操作期间的非致命警告               |
| `InterfaceError`    | 数据库接口本身的问题                     |
| `DatabaseError`     | 所有数据库相关错误的基类                 |
| `DataError`         | 数据处理问题(无效值、类型错误)           |
| `OperationalError`  | 数据库操作问题(连接性、资源)             |
| `IntegrityError`    | 约束违规(外键、唯一性)                   |
| `InternalError`     | 数据库内部错误和损坏                     |
| `ProgrammingError`  | SQL 语法错误和 API 误用                  |
| `NotSupportedError` | 不支持的功能或操作                       |

:::note
这些异常类符合 Python DB API 2.0 规范,
并在不同的数据库操作中提供一致的错误处理。
:::


**另请参阅**

- [Python Database API Specification v2.0](https://peps.python.org/pep-0249/)
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

基类:[`DatabaseError`](#chdb-dbapi-err-databaseerror)

因处理的数据存在问题而引发的错误异常。

当数据库操作因正在处理的数据存在问题而失败时,会引发此异常,例如:

- 除以零操作
- 数值超出范围
- 无效的日期/时间值
- 字符串截断错误
- 类型转换失败
- 列类型的数据格式无效

**引发**

| 异常                                     | 条件                   |
| ---------------------------------------- | ---------------------- |
| [`DataError`](#chdb-dbapi-err-dataerror) | 当数据验证或处理失败时 |

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

基类:[`Error`](#chdb-dbapi-err-error)

与数据库相关的错误异常。

这是所有数据库相关错误的基类。它涵盖了数据库操作期间发生的所有与数据库本身相关的错误,而非与接口相关的错误。

常见场景包括:

- SQL 执行错误
- 数据库连接问题
- 事务相关问题
- 数据库特定的约束违规

:::note
这是更具体的数据库错误类型的父类,例如 [`DataError`](#chdb-dbapi-err-dataerror)、[`OperationalError`](#chdb-dbapi-err-operationalerror) 等。
:::

---

#### **exception** `chdb.dbapi.err.Error` {#chdb-dbapi-err-error}

基类:[`StandardError`](#chdb-dbapi-err-standarderror)

所有其他错误异常(不包括警告)的基类异常。

这是 chdb 中所有错误异常的基类,不包括警告。它作为所有阻止操作成功完成的数据库错误条件的父类。

:::note
此异常层次结构遵循 Python DB API 2.0 规范。
:::

**另请参阅**

- [`Warning`](#chdb-dbapi-err-warning) - 用于不会阻止操作完成的非致命警告

#### **exception** `chdb.dbapi.err.IntegrityError` {#chdb-dbapi-err-integrityerror}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

当数据库的关系完整性受到影响时引发的异常。

当数据库操作违反完整性约束时,会引发此异常,包括:

- 外键约束违规
- 主键或唯一约束违规(重复键)
- 检查约束违规
- NOT NULL 约束违规
- 引用完整性违规

**Raises**

| 异常                                               | 条件                       |
| -------------------------------------------------- | -------------------------- |
| [`IntegrityError`](#chdb-dbapi-err-integrityerror) | 当数据库完整性约束被违反时 |

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

Bases: [`Error`](#chdb-dbapi-err-error)

与数据库接口相关而非数据库本身相关的错误异常。


当数据库接口实现出现问题时会引发此异常,例如:

- 无效的连接参数
- API 误用(在已关闭的连接上调用方法)
- 接口级协议错误
- 模块导入或初始化失败

**引发**

| 异常                                          | 条件                                                                  |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror) | 当数据库接口遇到与数据库操作无关的错误时 |

:::note
这些错误通常是编程错误或配置问题,可以通过修复客户端代码或配置来解决。
:::

---

#### **异常** `chdb.dbapi.err.InternalError` {#chdb-dbapi-err-internalerror}

基类: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

当数据库遇到内部错误时引发的异常。

当数据库系统遇到非应用程序导致的内部错误时会引发此异常,例如:

- 无效的游标状态(游标不再有效)
- 事务状态不一致(事务不同步)
- 数据库损坏问题
- 内部数据结构损坏
- 系统级数据库错误

**引发**

| 异常                                        | 条件                                         |
| ------------------------------------------------ | ------------------------------------------------- |
| [`InternalError`](#chdb-dbapi-err-internalerror) | 当数据库遇到内部不一致时 |

:::warning 警告
内部错误可能表明存在需要数据库管理员关注的严重数据库问题。这些错误通常无法通过应用程序级重试逻辑恢复。
:::

:::note
这些错误通常超出应用程序的控制范围,可能需要重启数据库或执行修复操作。
:::

---

#### **异常** `chdb.dbapi.err.NotSupportedError` {#chdb-dbapi-err-notsupportederror}

基类: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

当方法或数据库 API 不受支持时引发的异常。

当应用程序尝试使用当前数据库配置或版本不支持的数据库功能或 API 方法时会引发此异常,例如:

- 在不支持事务的连接上请求 `rollback()`
- 使用数据库版本不支持的高级 SQL 功能
- 调用当前驱动程序未实现的方法
- 尝试使用已禁用的数据库功能

**引发**

| 异常                                                | 条件                                       |
| -------------------------------------------------------- | ----------------------------------------------- |
| [`NotSupportedError`](#chdb-dbapi-err-notsupportederror) | 当访问不受支持的数据库功能时 |

**示例**

```pycon
>>> # 在非事务连接上执行事务回滚
>>> connection.rollback()
NotSupportedError: Transactions are not supported
```

```pycon
>>> # 使用不受支持的 SQL 语法
>>> cursor.execute("SELECT * FROM table WITH (NOLOCK)")
NotSupportedError: WITH clause not supported in this database version
```

:::note
检查数据库文档和驱动程序功能以避免这些错误。在可能的情况下考虑优雅的降级方案。
:::

---

#### **异常** `chdb.dbapi.err.OperationalError` {#chdb-dbapi-err-operationalerror}

基类: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

针对与数据库操作相关的错误引发的异常。

此异常针对数据库操作期间发生且不一定在程序员控制范围内的错误引发,包括:

- 与数据库的意外断开连接
- 数据库服务器未找到或无法访问
- 事务处理失败
- 处理期间的内存分配错误
- 磁盘空间或资源耗尽
- 数据库服务器内部错误
- 身份验证或授权失败

**引发**

| 异常                                              | 条件                                               |
| ------------------------------------------------------ | ------------------------------------------------------- |
| [`OperationalError`](#chdb-dbapi-err-operationalerror) | 当数据库操作因操作问题而失败时 |

:::note
这些错误通常是暂时性的,可以通过重试操作或解决系统级问题来解决。
:::

:::warning 警告
某些操作错误可能表明存在需要管理员干预的严重系统问题。
:::

---

#### **异常** `chdb.dbapi.err.ProgrammingError` {#chdb-dbapi-err-programmingerror}

基类: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

针对数据库操作中的编程错误引发的异常。

当应用程序的数据库使用中存在编程错误时会引发此异常,包括:

- 表或列未找到
- 创建时表或索引已存在
- 语句中的 SQL 语法错误
- 预处理语句中指定的参数数量错误
- 无效的 SQL 操作(例如,对不存在的对象执行 DROP)
- 数据库 API 方法的错误使用

**引发**

| 异常                                              | 条件                                        |
| ------------------------------------------------------ | ------------------------------------------------ |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 当 SQL 语句或 API 使用包含错误时 |

**示例**


```pycon
>>> # 表未找到
>>> cursor.execute("SELECT * FROM nonexistent_table")
ProgrammingError: Table 'nonexistent_table' doesn't exist
```

```pycon
>>> # SQL 语法错误
>>> cursor.execute("SELCT * FROM users")
ProgrammingError: You have an error in your SQL syntax
```

```pycon
>>> # 参数数量错误
>>> cursor.execute("INSERT INTO users (name, age) VALUES (%s)", ('John',))
ProgrammingError: Column count doesn't match value count
```

---

#### **exception** `chdb.dbapi.err.StandardError` {#chdb-dbapi-err-standarderror}

基类:`Exception`

与 chdb 操作相关的异常。

这是所有 chdb 相关异常的基类。它继承自 Python 内置的 Exception 类,作为数据库操作异常层次结构的根类。

:::note
此异常类遵循 Python DB API 2.0 规范的数据库异常处理标准。
:::

---

#### **exception** `chdb.dbapi.err.Warning` {#chdb-dbapi-err-warning}

基类:[`StandardError`](#chdb-dbapi-err-standarderror)

针对重要警告(如插入时的数据截断等)引发的异常。

当数据库操作完成但存在应引起应用程序注意的重要警告时,会引发此异常。
常见场景包括:

- 插入期间的数据截断
- 数值转换中的精度损失
- 字符集转换警告

:::note
这遵循 Python DB API 2.0 规范的警告异常标准。
:::

---

### 模块常量 {#module-constants}

#### `chdb.dbapi.apilevel = '2.0'` {#apilevel}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

从给定对象创建一个新的字符串对象。如果指定了 encoding 或 errors 参数,则对象必须公开一个数据缓冲区,该缓冲区将使用给定的编码和错误处理程序进行解码。
否则,返回 `object._\_str_\_()` 的结果(如果已定义)或 `repr(object)`。

- encoding 默认为 'utf-8'。
- errors 默认为 'strict'。

---

#### `chdb.dbapi.threadsafety = 1` {#threadsafety}

```python
int([x]) -> integer
int(x, base=10) -> integer
```

将数字或字符串转换为整数,如果未提供参数则返回 0。如果 x 是数字,则返回 x._\_int_\_()。对于浮点数,这会向零截断。

如果 x 不是数字或指定了 base 参数,则 x 必须是表示给定进制整数字面量的字符串、bytes 或 bytearray 实例。字面量可以以 '+' 或 '-' 开头,并可以被空格包围。base 默认为 10。有效的进制为 0 和 2-36。
Base 0 表示从字符串中解释进制作为整数字面量。

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

从给定对象创建一个新的字符串对象。如果指定了 encoding 或 errors 参数,则对象必须公开一个数据缓冲区,该缓冲区将使用给定的编码和错误处理程序进行解码。
否则,返回 object._\_str_\_() 的结果(如果已定义)或 repr(object)。
encoding 默认为 'utf-8'。
errors 默认为 'strict'。

---

### 类型常量 {#type-constants}

#### `chdb.dbapi.STRING = frozenset({247, 253, 254})` {#string-type}

用于 DB-API 2.0 类型比较的扩展 frozenset。

此类扩展了 frozenset 以支持 DB-API 2.0 类型比较语义。
它允许灵活的类型检查,其中单个项可以使用相等和不等运算符与集合进行比较。

这用于 STRING、BINARY、NUMBER 等类型常量,以支持 "field_type == STRING" 这样的比较,其中 field_type 是单个类型值。

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # 返回 True
>>> FIELD_TYPE.INT != string_types     # 返回 True
>>> FIELD_TYPE.BLOB in string_types    # 返回 False
```

---


#### `chdb.dbapi.BINARY = frozenset({249, 250, 251, 252})` {#binary-type}

Extended frozenset for DB-API 2.0 type comparison.

This class extends frozenset to support DB-API 2.0 type comparison semantics.
It allows for flexible type checking where individual items can be compared
against the set using both equality and inequality operators.

This is used for type constants like STRING, BINARY, NUMBER, etc. to enable
comparisons like “field_type == STRING” where field_type is a single type value.

**Examples**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---

#### `chdb.dbapi.NUMBER = frozenset({0, 1, 3, 4, 5, 8, 9, 13})` {#number-type}

Extended frozenset for DB-API 2.0 type comparison.

This class extends frozenset to support DB-API 2.0 type comparison semantics.
It allows for flexible type checking where individual items can be compared
against the set using both equality and inequality operators.

This is used for type constants like STRING, BINARY, NUMBER, etc. to enable
comparisons like “field_type == STRING” where field_type is a single type value.

**Examples**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---

#### `chdb.dbapi.DATE = frozenset({10, 14})` {#date-type}

Extended frozenset for DB-API 2.0 type comparison.

This class extends frozenset to support DB-API 2.0 type comparison semantics.
It allows for flexible type checking where individual items can be compared
against the set using both equality and inequality operators.

This is used for type constants like STRING, BINARY, NUMBER, etc. to enable
comparisons like “field_type == STRING” where field_type is a single type value.

**Examples**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---

#### `chdb.dbapi.TIME = frozenset({11})` {#time-type}

Extended frozenset for DB-API 2.0 type comparison.

This class extends frozenset to support DB-API 2.0 type comparison semantics.
It allows for flexible type checking where individual items can be compared
against the set using both equality and inequality operators.

This is used for type constants like STRING, BINARY, NUMBER, etc. to enable
comparisons like “field_type == STRING” where field_type is a single type value.

**Examples**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---

#### `chdb.dbapi.TIMESTAMP = frozenset({7, 12})` {#timestamp-type}

Extended frozenset for DB-API 2.0 type comparison.

This class extends frozenset to support DB-API 2.0 type comparison semantics.
It allows for flexible type checking where individual items can be compared
against the set using both equality and inequality operators.

This is used for type constants like STRING, BINARY, NUMBER, etc. to enable
comparisons like “field_type == STRING” where field_type is a single type value.

**Examples**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

#### `chdb.dbapi.DATETIME = frozenset({7, 12})` {#datetime-type}

Extended frozenset for DB-API 2.0 type comparison.


This class extends frozenset to support DB-API 2.0 type comparison semantics.
It allows for flexible type checking where individual items can be compared
against the set using both equality and inequality operators.

This is used for type constants like STRING, BINARY, NUMBER, etc. to enable
comparisons like “field_type == STRING” where field_type is a single type value.

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # 返回 True
>>> FIELD_TYPE.INT != string_types     # 返回 True
>>> FIELD_TYPE.BLOB in string_types    # 返回 False
```

---

#### `chdb.dbapi.ROWID = frozenset({})` {#rowid-type}

用于 DB-API 2.0 类型比较的扩展 frozenset。

This class extends frozenset to support DB-API 2.0 type comparison semantics.
It allows for flexible type checking where individual items can be compared
against the set using both equality and inequality operators.

This is used for type constants like STRING, BINARY, NUMBER, etc. to enable
comparisons like “field_type == STRING” where field_type is a single type value.

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # 返回 True
>>> FIELD_TYPE.INT != string_types     # 返回 True
>>> FIELD_TYPE.BLOB in string_types    # 返回 False
```

**使用示例**

基本查询示例:

```python
import chdb.dbapi as dbapi

print("chdb 驱动版本: {0}".format(dbapi.get_client_info()))

```


# 创建连接和游标
conn = dbapi.connect()
cur = conn.cursor()



# 执行查询语句
cur.execute('SELECT version()')
print("description:", cur.description)
print("data:", cur.fetchone())



# 清理

cur.close()
conn.close()

````

数据操作：

```python
import chdb.dbapi as dbapi

conn = dbapi.connect()
cur = conn.cursor()
````


# 创建表
cur.execute("""
    CREATE TABLE employees (
        id UInt32,
        name String,
        department String,
        salary Decimal(10,2)
    ) ENGINE = Memory
""")



# 插入数据
cur.execute("""
    INSERT INTO employees VALUES
    (1, 'Alice', 'Engineering', 75000.00),
    (2, 'Bob', 'Marketing', 65000.00),
    (3, 'Charlie', 'Engineering', 80000.00)
""")



# 查询数据
cur.execute("SELECT * FROM employees WHERE department = 'Engineering'")



# 获取查询结果

print(&quot;列名:&quot;, [desc[0] for desc in cur.description])
for row in cur.fetchall():
print(row)

conn.close()

````

连接管理：

```python
import chdb.dbapi as dbapi
````


# 内存数据库（默认）
conn1 = dbapi.connect()



# 持久化的数据库文件
conn2 = dbapi.connect("./my_database.chdb")



# 使用参数的连接
conn3 = dbapi.connect("./my_database.chdb?log-level=debug&verbose")



# 只读连接
conn4 = dbapi.connect("./my_database.chdb?mode=ro")



# 自动清理连接

with dbapi.connect(&quot;test.chdb&quot;) as conn:
cur = conn.cursor()
cur.execute(&quot;SELECT count() FROM numbers(1000)&quot;)
result = cur.fetchone()
print(f&quot;Count: {result[0]}&quot;)
cur.close()

```

**最佳实践**

1. **连接管理**：操作完成后务必关闭连接和游标
2. **上下文管理器**：使用 `with` 语句实现自动清理
3. **批量处理**：处理大型结果集时使用 `fetchmany()`
4. **错误处理**：使用 try-except 块包装数据库操作
5. **参数绑定**：尽可能使用参数化查询
6. **内存管理**：处理超大数据集时避免使用 `fetchall()`

:::note
- chDB 的 DB-API 2.0 接口与大多数 Python 数据库工具兼容
- 该接口提供 Level 1 线程安全性(线程可以共享模块但不能共享连接)
- 连接字符串支持与 chDB 会话相同的参数
- 支持所有标准 DB-API 2.0 异常
:::

:::warning 警告
- 务必关闭游标和连接以避免资源泄漏
- 大型结果集应分批处理
- 参数绑定语法遵循格式样式:`%s`
:::
```


## 用户自定义函数 (UDF) {#user-defined-functions}

chDB 的用户自定义函数模块。

该模块提供在 chDB 中创建和管理用户自定义函数 (UDF) 的功能。通过编写可在 SQL 查询中调用的自定义 Python 函数,您可以扩展 chDB 的能力。

### `chdb.udf.chdb_udf` {#chdb-udf}

用于 chDB Python UDF(用户自定义函数)的装饰器。

**语法**

```python
chdb.udf.chdb_udf(return_type='String')
```

**参数**

| 参数          | 类型 | 默认值     | 描述                                                                    |
| ------------- | ---- | ---------- | ----------------------------------------------------------------------- |
| `return_type` | str  | `"String"` | 函数的返回类型。应为 ClickHouse 数据类型之一                             |

**注意事项**

1. 函数应该是无状态的。仅支持 UDF,不支持 UDAF。
2. 默认返回类型为 String。返回类型应为 ClickHouse 数据类型之一。
3. 函数应接受 String 类型的参数。所有参数都是字符串。
4. 函数将对输入的每一行调用一次。
5. 函数应为纯 Python 函数。在函数内部导入所有使用的模块。
6. 使用的 Python 解释器与运行脚本的解释器相同。

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

生成 UDF 配置和可执行脚本文件。

此函数为 chDB 中的用户自定义函数 (UDF) 创建必要的文件:

1. 处理输入数据的 Python 可执行脚本
2. 向 ClickHouse 注册 UDF 的 XML 配置文件

**语法**

```python
chdb.udf.generate_udf(func_name, args, return_type, udf_body)
```

**参数**

| 参数          | 类型 | 描述                                        |
| ------------- | ---- | ------------------------------------------- |
| `func_name`   | str  | UDF 函数的名称                              |
| `args`        | list | 函数的参数名称列表                          |
| `return_type` | str  | 函数的 ClickHouse 返回类型                  |
| `udf_body`    | str  | UDF 函数的 Python 源代码主体                |

:::note
此函数通常由 @chdb_udf 装饰器调用,用户不应直接调用。
:::

---


## 实用工具 {#utilities}

chDB 的实用函数和辅助工具。

此模块包含用于使用 chDB 的各种实用函数,包括数据类型推断、数据转换辅助工具和调试实用工具。

---

### `chdb.utils.convert_to_columnar` {#convert-to-columnar}

将字典列表转换为列式格式。

此函数接受一个字典列表,并将其转换为一个字典,其中每个键对应一列,每个值是该列值的列表。字典中缺失的值表示为 None。

**语法**

```python
chdb.utils.convert_to_columnar(items: List[Dict[str, Any]]) → Dict[str, List[Any]]
```

**参数**

| 参数      | 类型                   | 描述             |
| --------- | ---------------------- | ---------------- |
| `items`   | `List[Dict[str, Any]]` | 要转换的字典列表 |

**返回值**

| 返回类型               | 描述                                   |
| ---------------------- | -------------------------------------- |
| `Dict[str, List[Any]]` | 一个字典,键为列名,值为该列值的列表 |

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

展平嵌套字典。

此函数接受一个嵌套字典并将其展平,使用分隔符连接嵌套键。字典列表会被序列化为 JSON 字符串。

**语法**

```python
chdb.utils.flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '_') → Dict[str, Any]
```

**参数**

| 参数         | 类型             | 默认值 | 描述                       |
| ------------ | ---------------- | ------ | -------------------------- |
| `d`          | `Dict[str, Any]` | _必需_ | 要展平的字典               |
| `parent_key` | str              | `""`   | 要添加到每个键前面的基础键 |
| `sep`        | str              | `"_"`  | 连接键之间使用的分隔符     |

**返回值**

| 返回类型         | 描述         |
| ---------------- | ------------ |
| `Dict[str, Any]` | 展平后的字典 |

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

此函数检查值列表并确定可以表示列表中所有值的最合适数据类型。它会考虑整数、无符号整数、十进制和浮点类型,如果值无法用任何数值类型表示或所有值均为 None,则默认为 "string"。

**语法**

```python
chdb.utils.infer_data_type(values: List[Any]) → str
```

**参数**

| 参数     | 类型        | 描述                           |
| -------- | ----------- | ------------------------------ |
| `values` | `List[Any]` | 要分析的值列表。值可以是任何类型 |

**返回值**


| 返回类型 | 描述                                                                                                                                                                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `str`       | 表示推断出的数据类型的字符串。可能的返回值包括:"int8"、"int16"、"int32"、"int64"、"int128"、"int256"、"uint8"、"uint16"、"uint32"、"uint64"、"uint128"、"uint256"、"decimal128"、"decimal256"、"float32"、"float64" 或 "string"。 |

:::note

- 如果列表中的所有值均为 None,函数将返回 "string"。
- 如果列表中存在任何字符串值,函数将立即返回 "string"。
- 函数会根据数值的范围和精度,将其表示为整数、小数或浮点数。
  :::

---

### `chdb.utils.infer_data_types` {#infer-data-types}

推断列式数据结构中每列的数据类型。

该函数会分析每列中的值,并基于数据样本为每列推断最合适的数据类型。

**语法**

```python
chdb.utils.infer_data_types`(column_data: Dict[str, List[Any]], n_rows: int = 10000) → List[tuple]
```

**参数**

| 参数     | 类型                   | 默认值    | 描述                                                                    |
| ------------- | ---------------------- | ---------- | ------------------------------------------------------------------------------ |
| `column_data` | `Dict[str, List[Any]]` | _必需_ | 字典,其中键为列名,值为列值列表 |
| `n_rows`      | int                    | `10000`    | 用于类型推断的采样行数                                |

**返回值**

| 返回类型   | 描述                                                                |
| ------------- | -------------------------------------------------------------------------- |
| `List[tuple]` | 元组列表,每个元组包含一个列名及其推断出的数据类型 |


## 抽象基类 {#abstract-base-classes}

### **class** `chdb.rwabc.PyReader`(data: Any)` {#pyreader}

基类：`ABC`

```python
class chdb.rwabc.PyReader(data: Any)
```

---

#### **abstractmethod** `read` {#read}

从指定列中读取指定数量的行，并返回一个对象列表，其中每个对象是一列的值序列。

```python
abstractmethod (col_names: List[str], count: int) → List[Any]
```

**参数**

| 参数        | 类型        | 描述                    |
| ----------- | ----------- | ----------------------- |
| `col_names` | `List[str]` | 要读取的列名列表        |
| `count`     | int         | 要读取的最大行数        |

**返回值**

| 返回类型    | 描述                           |
| ----------- | ------------------------------ |
| `List[Any]` | 序列列表，每个列对应一个序列   |

### **class** `chdb.rwabc.PyWriter` {#pywriter}

基类：`ABC`

```python
class chdb.rwabc.PyWriter(col_names: List[str], types: List[type], data: Any)
```

---

#### **abstractmethod** finalize {#finalize}

从数据块中组装并返回最终数据。必须由子类实现。

```python
abstractmethod finalize() → bytes
```

**Returns**

| 返回类型    | 描述                 |
| ----------- | -------------------- |
| `bytes`     | 最终的序列化数据     |

---

#### **abstractmethod** `write` {#write}

将数据列保存到数据块中。必须由子类实现。

```python
abstractmethod write(col_names: List[str], columns: List[List[Any]]) → None
```

**参数**

| 参数        | 类型              | 描述                                       |
| ----------- | ----------------- | ------------------------------------------ |
| `col_names` | `List[str]`       | 正在写入的列名列表                         |
| `columns`   | `List[List[Any]]` | 列数据列表，每列用一个列表表示             |


## 异常处理 {#exception-handling}

### **class** `chdb.ChdbError` {#chdberror}

基类：`Exception`

chDB 相关错误的基础异常类。

当 chDB 查询执行失败或遇到错误时会抛出此异常。它继承自 Python 标准的 Exception 类，并提供来自底层 ClickHouse 引擎的错误信息。

异常消息通常包含来自 ClickHouse 的详细错误信息，包括语法错误、类型不匹配、缺失的表/列以及其他查询执行问题。

**变量**

| 变量 | 类型 | 描述                                                     |
| -------- | ---- | --------------------------------------------------------------- |
| `args`   | -    | 包含错误消息和任何附加参数的元组 |

**示例**

```pycon
>>> try:
...     result = chdb.query("SELECT * FROM non_existent_table")
... except chdb.ChdbError as e:
...     print(f"查询失败：{e}")
查询失败：表 'non_existent_table' 不存在
```

```pycon
>>> try:
...     result = chdb.query("SELECT invalid_syntax FROM")
... except chdb.ChdbError as e:
...     print(f"语法错误：{e}")
语法错误：'FROM' 附近存在语法错误
```

:::note
当底层 ClickHouse 引擎报告错误时，chdb.query() 和相关函数会自动抛出此异常。在处理可能失败的查询时，您应该捕获此异常，以便在应用程序中提供适当的错误处理。
:::


## 版本信息 {#version-information}

### `chdb.chdb_version = ('3', '6', '0')` {#chdb-version}

内置的不可变序列。

如果未提供参数,构造函数将返回一个空元组。
如果指定了可迭代对象,则从该可迭代对象的元素初始化元组。

如果参数是元组,则返回值为同一对象。

---

### `chdb.engine_version = '25.5.2.1'` {#engine-version}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

从给定对象创建一个新的字符串对象。如果指定了 encoding 或
errors 参数,则该对象必须提供一个数据缓冲区,
该缓冲区将使用给定的编码和错误处理程序进行解码。
否则,返回 object._\_str_\_() 的结果(如果已定义)
或 repr(object)。

- encoding defaults to ‘utf-8’.
- errors defaults to ‘strict’.

---

### `chdb.__version__ = '3.6.0'` {#version}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

从给定对象创建一个新的字符串对象。如果指定了 encoding 或
errors 参数,则该对象必须提供一个数据缓冲区,
该缓冲区将使用给定的编码和错误处理程序进行解码。
否则,返回 object._\_str_\_() 的结果(如果已定义)
或 repr(object)。

- encoding defaults to ‘utf-8’.
- errors defaults to ‘strict’.
