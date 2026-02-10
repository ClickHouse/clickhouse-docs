---
title: 'chDB Python API 参考文档'
sidebar_label: 'Python API'
slug: /chdb/api/python
description: 'chDB 的完整 Python API 参考文档'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'api', 'reference']
doc_type: 'reference'
---

# Python API 参考文档 \{#python-api-reference\}

## 核心查询函数 \{#core-query-functions\}

### `chdb.query` \{#chdb-query\}

使用 chDB 引擎执行 SQL 查询。

这是主要的查询函数，使用内置的 ClickHouse 引擎执行 SQL 语句。支持多种输出格式，可用于内存数据库或基于文件的数据库。

**语法**

```python
chdb.query(sql, output_format='CSV', path='', udf_path='')
```

**参数**

| 参数              | 类型  | 默认值     | 说明                                                                                                                                                                                                                                          |
| --------------- | --- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`           | str | *必填*    | 要执行的 SQL 查询字符串                                                                                                                                                                                                                              |
| `output_format` | str | `"CSV"` | 结果输出格式。支持的格式：<br />• `"CSV"` - 逗号分隔值<br />• `"JSON"` - JSON 格式<br />• `"Arrow"` - Apache Arrow 格式<br />• `"Parquet"` - Parquet 格式<br />• `"DataFrame"` - Pandas DataFrame<br />• `"ArrowTable"` - PyArrow Table<br />• `"Debug"` - 启用详细日志输出 |
| `path`          | str | `""`    | 数据库文件路径。默认为内存数据库。<br />可以是文件路径，或使用 `":memory:"` 表示内存数据库                                                                                                                                                                                     |
| `udf_path`      | str | `""`    | 用户自定义函数（User-Defined Functions）目录路径                                                                                                                                                                                                         |

**返回值**

以指定格式返回查询结果：

| Return Type        | Condition                                             |
| ------------------ | ----------------------------------------------------- |
| `str`              | 对于 CSV、JSON 等文本格式                                     |
| `pd.DataFrame`     | 当 `output_format` 为 `"DataFrame"` 或 `"dataframe"` 时   |
| `pa.Table`         | 当 `output_format` 为 `"ArrowTable"` 或 `"arrowtable"` 时 |
| chdb result object | 对于其他格式                                                |

**异常**

| Exception     | Condition                    |
| ------------- | ---------------------------- |
| `ChdbError`   | 当 SQL 查询执行失败时                |
| `ImportError` | 如果 DataFrame/Arrow 格式所需的依赖缺失 |

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
>>> result = chdb.query("CREATE TABLE test (id INT) ENGINE = Memory", path="mydb.chdb")
```

```pycon
>>> # Query with UDF
>>> result = chdb.query("SELECT my_udf('test')", udf_path="/path/to/udfs")
```

***


### `chdb.sql` \{#chdb_sql\}

使用 chDB 引擎执行 SQL 查询。

这是主要的查询函数，用于通过内置的 ClickHouse 引擎执行 SQL 语句。支持多种输出格式，可用于内存数据库或基于文件的数据库。

**语法**

```python
chdb.sql(sql, output_format='CSV', path='', udf_path='')
```

**参数**

| Parameter       | Type | Default    | Description                                                                                                                                                                                                                                 |
| --------------- | ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`           | str  | *required* | 要执行的 SQL 查询字符串                                                                                                                                                                                                                              |
| `output_format` | str  | `"CSV"`    | 结果输出格式。支持的格式：<br />• `"CSV"` - 逗号分隔值<br />• `"JSON"` - JSON 格式<br />• `"Arrow"` - Apache Arrow 格式<br />• `"Parquet"` - Parquet 格式<br />• `"DataFrame"` - Pandas DataFrame<br />• `"ArrowTable"` - PyArrow Table<br />• `"Debug"` - 启用详细日志输出 |
| `path`          | str  | `""`       | 数据库文件路径。默认为内存数据库。<br />可以是文件路径，或使用 `":memory:"` 表示内存数据库                                                                                                                                                                                     |
| `udf_path`      | str  | `""`       | 用户自定义函数（UDF）目录路径                                                                                                                                                                                                                            |

**返回值**

返回查询结果，类型取决于指定的输出格式：

| Return Type        | Condition                                             |
| ------------------ | ----------------------------------------------------- |
| `str`              | 对于 CSV、JSON 等文本格式                                     |
| `pd.DataFrame`     | 当 `output_format` 为 `"DataFrame"` 或 `"dataframe"` 时   |
| `pa.Table`         | 当 `output_format` 为 `"ArrowTable"` 或 `"arrowtable"` 时 |
| chdb result object | 对于其他格式                                                |

**异常**

| Exception                 | Condition                    |
| ------------------------- | ---------------------------- |
| [`ChdbError`](#chdberror) | 当 SQL 查询执行失败时                |
| `ImportError`             | 如果 DataFrame/Arrow 格式所需的依赖缺失 |

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
>>> result = chdb.query("CREATE TABLE test (id INT) ENGINE = Memory", path="mydb.chdb")
```

```pycon
>>> # Query with UDF
>>> result = chdb.query("SELECT my_udf('test')", udf_path="/path/to/udfs")
```

***


### `chdb.to_arrowTable` \{#chdb-state-sqlitelike-to_arrowtable\}

将查询结果转换为 PyArrow 表。

将 chDB 查询结果转换为 PyArrow 表，以实现高效的列式数据处理。
如果结果为空，则返回一个空表。

**语法**

```python
chdb.to_arrowTable(res)
```

**参数**

| 参数    | 描述                          |
| ----- | --------------------------- |
| `res` | 包含二进制 Arrow 数据的 chDB 查询结果对象 |

**返回值**

| 返回类型       | 描述                          |
| ---------- | --------------------------- |
| `pa.Table` | 包含查询结果的 PyArrow 表（Table 对象） |

**异常**

| 错误类型          | 描述                     |
| ------------- | ---------------------- |
| `ImportError` | 如果未安装 pyarrow 或 pandas |

**示例**

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> table = chdb.to_arrowTable(result)
>>> print(table.to_pandas())
   id    msg
0   1  hello
```

***


### `chdb.to_df` \{#chdb_to_df\}

将查询结果转换为 pandas DataFrame。

通过先将 chDB 查询结果转换为 PyArrow 表，再使用多线程转换为 pandas DataFrame，以提升性能。

**语法**

```python
chdb.to_df(r)
```

**参数**

| 参数  | 描述                         |
| --- | -------------------------- |
| `r` | chDB 查询结果对象，内含二进制 Arrow 数据 |

**返回值**

| 返回类型           | 描述                       |
| -------------- | ------------------------ |
| `pd.DataFrame` | 包含查询结果的 pandas DataFrame |

**异常**

| 异常类型          | 条件                     |
| ------------- | ---------------------- |
| `ImportError` | 如果未安装 pyarrow 或 pandas |

**示例**

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> df = chdb.to_df(result)
>>> print(df)
   id    msg
0   1  hello
```


## 连接与会话管理 \{#connection-session-management\}

可以使用以下会话函数：

### `chdb.connect` \{#chdb-connect\}

创建到 chDB 后端服务器的连接。

此函数会建立到 chDB（ClickHouse）数据库引擎的[连接](#chdb-state-sqlitelike-connection)。
每个进程最多只允许有一个活动连接。
多次使用相同连接字符串进行调用将返回同一个连接对象。

```python
chdb.connect(connection_string: str = ':memory:') → Connection
```

**参数：**

| 参数名                 | 类型  | 默认值          | 描述                 |
| ------------------- | --- | ------------ | ------------------ |
| `connection_string` | str | `":memory:"` | 数据库连接字符串。参见下文格式说明。 |

**基本格式**

| 格式                        | 描述         |
| ------------------------- | ---------- |
| `":memory:"`              | 内存数据库（默认）  |
| `"test.db"`               | 相对路径的数据库文件 |
| `"file:test.db"`          | 等同于相对路径    |
| `"/path/to/test.db"`      | 绝对路径的数据库文件 |
| `"file:/path/to/test.db"` | 等同于绝对路径    |

**带查询参数的格式**

| 格式                                                 | 描述        |
| -------------------------------------------------- | --------- |
| `"file:test.db?param1=value1&param2=value2"`       | 相对路径并带参数  |
| `"file::memory:?verbose&log-level=test"`           | 内存数据库并带参数 |
| `"///path/to/test.db?param1=value1&param2=value2"` | 绝对路径并带参数  |

**查询参数处理**

查询参数会作为启动参数传递给 ClickHouse 引擎。
特殊参数处理规则如下：

| 特殊参数             | 转换为            | 描述       |
| ---------------- | -------------- | -------- |
| `mode=ro`        | `--readonly=1` | 只读模式     |
| `verbose`        | （标志位）          | 启用详细日志记录 |
| `log-level=test` | （设置项）          | 设置日志级别   |

完整参数列表请参阅 `clickhouse local --help --verbose`

**返回值**

| 返回类型         | 描述                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Connection` | 数据库连接对象，支持：<br />• 使用 `Connection.cursor()` 创建游标<br />• 使用 `Connection.query()` 执行直接查询<br />• 使用 `Connection.send_query()` 执行流式查询<br />• 作为上下文管理器使用，以便自动清理资源 |

**异常**

| 异常类型           | 触发条件        |
| -------------- | ----------- |
| `RuntimeError` | 当连接数据库失败时抛出 |

:::warning
每个进程只支持一个连接。
创建新连接会关闭当前已有连接。
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

**另请参阅**

* [`Connection`](#chdb-state-sqlitelike-connection) - 数据库连接类
* [`Cursor`](#chdb-state-sqlitelike-cursor) - DB-API 2.0 操作的数据库游标


## 异常处理 \{#chdb-exceptions\}

### **class** `chdb.ChdbError` \{#chdb_chdbError\}

Bases: `Exception`

与 chDB 相关错误的基础异常类。

当 chDB 查询执行失败或遇到错误时，将抛出该异常。它继承自标准的 Python `Exception` 类，并提供来自底层 ClickHouse 引擎的错误信息。

---

### **class** `chdb.session.Session` \{#chdb_session_session\}

Bases: `object`

Session 将维护查询的状态。
如果 `path` 为 `None`，将创建一个临时目录并将其作为数据库路径使用，
并且在 session 关闭时会删除该临时目录。
你也可以传入一个路径，在该路径下创建数据库以持久化你的数据。

你还可以使用连接字符串传入路径和其他参数。

```python
class chdb.session.Session(path=None)
```

**示例**

| Connection String                                  | 描述          |
| -------------------------------------------------- | ----------- |
| `":memory:"`                                       | 内存数据库       |
| `"test.db"`                                        | 相对路径        |
| `"file:test.db"`                                   | 同上          |
| `"/path/to/test.db"`                               | 绝对路径        |
| `"file:/path/to/test.db"`                          | 同上          |
| `"file:test.db?param1=value1&param2=value2"`       | 带查询参数的相对路径  |
| `"file::memory:?verbose&log-level=test"`           | 带查询参数的内存数据库 |
| `"///path/to/test.db?param1=value1&param2=value2"` | 带查询参数的绝对路径  |

:::note Connection string args handling
包含查询参数的连接字符串，例如 “[file:test.db?param1=value1&amp;param2=value2](file:test.db?param1=value1\&param2=value2)”
其中的 “param1=value1” 将会作为启动参数传递给 ClickHouse 引擎。

更多详情请参阅 `clickhouse local --help --verbose`

部分特殊参数的处理方式：

* “mode=ro” 对于 ClickHouse 来说等同于 “--readonly=1”（只读模式）
  :::

:::warning 重要

* 同一时间只能有一个会话。如果你想创建一个新会话，需要先关闭已有会话。
* 创建新会话会自动关闭已有会话。
  :::

***


#### `cleanup` \{#cleanup\}

通过异常处理清理会话资源。

此方法会尝试关闭会话，并抑制在清理过程中可能出现的任何异常。在错误处理场景中尤为有用，或用于需要确保无论会话状态如何都要执行清理的场景。

**语法**

```python
cleanup()
```

:::note
此方法永远不会抛出异常，因此可以安全地在 `finally` 代码块或析构函数中调用。
:::

**示例**

```pycon
>>> session = Session("test.db")
>>> try:
...     session.query("INVALID SQL")
... finally:
...     session.cleanup()  # Safe cleanup regardless of errors
```

**另请参阅**

* [`close()`](#chdb-session-session-close) - 用于显式关闭会话并传播错误

***


#### `close` \{#close\}

关闭会话并释放资源。

此方法会关闭底层连接并重置会话的全局状态。
调用此方法后，会话将失效，无法再用于
后续查询。

**Syntax**

```python
close()
```

:::note
当会话作为上下文管理器使用，或会话对象被销毁时，会自动调用此方法。
:::

:::warning 重要
在调用 `close()` 之后尝试再次使用该会话将会导致错误。
:::

**示例**

```pycon
>>> session = Session("test.db")
>>> session.query("SELECT 1")
>>> session.close()  # Explicitly close the session
```

***


#### `query` \{#chdb-session-session-query\}

执行一条 SQL 查询并返回结果。

该方法会针对当前会话关联的数据库执行 SQL 查询，并以指定格式返回结果。该方法支持多种输出格式，并在多次查询之间维护会话状态。

**语法**

```python
query(sql, fmt='CSV', udf_path='')
```

**参数**

| 参数         | 类型  | 默认值     | 说明                                                                                                                                                                                                                                  |
| ---------- | --- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`      | str | *必填*    | 要执行的 SQL 查询字符串                                                                                                                                                                                                                      |
| `fmt`      | str | `"CSV"` | 结果输出格式。可用格式：<br />• `"CSV"` - 逗号分隔值<br />• `"JSON"` - JSON 格式<br />• `"TabSeparated"` - 制表符分隔值<br />• `"Pretty"` - 美观的表格打印格式<br />• `"JSONCompact"` - 紧凑 JSON 格式<br />• `"Arrow"` - Apache Arrow 格式<br />• `"Parquet"` - Parquet 格式 |
| `udf_path` | str | `""`    | 用户定义函数路径。如果未指定，则使用会话初始化时的 UDF 路径                                                                                                                                                                                                    |

**返回值**

以指定格式返回查询结果。
具体返回类型取决于 `fmt` 参数：

* 字符串格式（CSV、JSON 等）返回 `str`
* 二进制格式（Arrow、Parquet）返回 `bytes`

**异常**

| 异常             | 条件               |
| -------------- | ---------------- |
| `RuntimeError` | 如果会话已关闭或无效       |
| `ValueError`   | 如果 SQL 查询语句格式不正确 |

:::note
不支持 &quot;Debug&quot; 格式，会自动转换为 &quot;CSV&quot; 并给出警告。
如需调试，请改用连接字符串参数。
:::

:::warning Warning
此方法以同步方式执行查询，并将所有结果加载到内存中。对于较大的结果集，请考虑使用 [`send_query()`](#chdb-session-session-send_query) 以流式方式获取结果。
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
>>> session.query("CREATE TABLE test (id INT, name String) ENGINE = Memory")
>>> session.query("INSERT INTO test VALUES (1, 'Alice'), (2, 'Bob')")
>>> result = session.query("SELECT * FROM test ORDER BY id")
>>> print(result)
id,name
1,Alice
2,Bob
```

**另请参阅**

* [`send_query()`](#chdb-session-session-send_query) - 用于以流式方式执行查询
* [`sql`](#chdb-session-session-sql) - 此方法的别名

***


#### `send_query` \{#chdb-session-session-send_query\}

执行一条 SQL 查询并返回一个流式结果迭代器。

该方法会针对当前会话关联的数据库执行 SQL 查询，并返回一个流式结果对象，使您能够在不一次性将所有结果加载到内存中的情况下对结果进行迭代。这对大型结果集尤其有用。

**语法**

```python
send_query(sql, fmt='CSV') → StreamingResult
```

**参数**

| 参数    | 类型  | 默认值     | 描述                                                                                                                                                                                                     |
| ----- | --- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sql` | str | *必需*    | 要执行的 SQL 查询字符串                                                                                                                                                                                         |
| `fmt` | str | `"CSV"` | 结果输出的格式。可用格式：<br />• `"CSV"` - 逗号分隔值<br />• `"JSON"` - JSON 格式<br />• `"TabSeparated"` - 制表符分隔值<br />• `"JSONCompact"` - 紧凑 JSON 格式<br />• `"Arrow"` - Apache Arrow 格式<br />• `"Parquet"` - Parquet 格式 |

**返回值**

| 返回类型              | 描述                                          |
| ----------------- | ------------------------------------------- |
| `StreamingResult` | 以流式方式增量返回查询结果的迭代器。该迭代器可用于 for 循环，或转换为其他数据结构 |

**异常**

| 异常             | 条件                |
| -------------- | ----------------- |
| `RuntimeError` | 如果会话已关闭或无效        |
| `ValueError`   | 如果 SQL 查询语句不合法或有误 |

:::note
不支持 &quot;Debug&quot; 格式，会自动转换为 &quot;CSV&quot; 并给出警告。进行调试时，请改用连接字符串参数。
:::

:::warning
返回的 StreamingResult 对象应及时消费或妥善保存，因为它会保持与数据库的连接。
:::

**示例**

```pycon
>>> session = Session("test.db")
>>> session.query("CREATE TABLE big_table (id INT, data String) ENGINE = MergeTree() order by id")
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

**另请参阅**

* [`query()`](#chdb-session-session-query) - 用于执行非流式查询
* `chdb.state.sqlitelike.StreamingResult` - 流式结果迭代器

***


#### `sql` \{#chdb-session-session-sql\}

执行一条 SQL 查询并返回结果。

此方法在会话关联的数据库上执行一条 SQL 查询，并以指定格式返回结果。
该方法支持多种输出格式，并在多次查询之间保持会话状态。

**语法**

```python
sql(sql, fmt='CSV', udf_path='')
```

**参数**

| 参数         | 类型  | 默认值     | 描述                                                                                                                                                                                                                                   |
| ---------- | --- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sql`      | str | *必填*    | 要执行的 SQL 查询字符串                                                                                                                                                                                                                       |
| `fmt`      | str | `"CSV"` | 结果的输出格式。可用格式：<br />• `"CSV"` - 逗号分隔值<br />• `"JSON"` - JSON 格式<br />• `"TabSeparated"` - 制表符分隔值<br />• `"Pretty"` - 美化打印的表格格式<br />• `"JSONCompact"` - 紧凑 JSON 格式<br />• `"Arrow"` - Apache Arrow 格式<br />• `"Parquet"` - Parquet 格式 |
| `udf_path` | str | `""`    | 用户定义函数（UDF）的路径。如果未指定，则使用会话初始化时配置的 UDF 路径                                                                                                                                                                                             |

**返回值**

以指定格式返回查询结果。
确切的返回类型取决于 `fmt` 参数：

* 字符串格式（如 CSV、JSON 等）返回 `str`
* 二进制格式（如 Arrow、Parquet）返回 `bytes`

**抛出异常：**

| 异常             | 条件                |
| -------------- | ----------------- |
| `RuntimeError` | 会话已关闭或无效时         |
| `ValueError`   | SQL 查询语句格式错误或不合法时 |

:::note
不支持 “Debug” 格式，会自动转换为 “CSV” 并给出警告。若需调试，请改用连接字符串参数。
:::

:::warning Warning
此方法以同步方式执行查询，并将所有结果加载到内存中。
对于大型结果集，请考虑使用 [`send_query()`](#chdb-session-session-send_query) 进行流式结果处理。
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
>>> session.query("CREATE TABLE test (id INT, name String) ENGINE = MergeTree() order by id")
>>> session.query("INSERT INTO test VALUES (1, 'Alice'), (2, 'Bob')")
>>> result = session.query("SELECT * FROM test ORDER BY id")
>>> print(result)
id,name
1,Alice
2,Bob
```

**另请参阅**

* [`send_query()`](#chdb-session-session-send_query) - 用于流式执行查询
* [`sql`](#chdb-session-session-sql) - 此方法的别名


## 状态管理 \{#chdb-state-management\}

### `chdb.state.connect` \{#chdb_state_connect\}

创建到 chDB 后端服务器的[连接](#chdb-state-sqlitelike-connection)。

此函数会与 chDB（ClickHouse）数据库引擎建立连接。
每个进程最多只允许一个活动连接。对同一连接字符串的多次调用将返回相同的连接对象。

**语法**

```python
chdb.state.connect(connection_string: str = ':memory:') → Connection
```

**参数**

| 参数                                 | 类型  | 默认值          | 说明                 |
| ---------------------------------- | --- | ------------ | ------------------ |
| `connection_string(str, optional)` | str | `":memory:"` | 数据库连接字符串。参见下方格式说明。 |

**基础格式**

支持的连接字符串格式：

| 格式                        | 说明        |
| ------------------------- | --------- |
| `":memory:"`              | 内存数据库（默认） |
| `"test.db"`               | 相对路径数据库文件 |
| `"file:test.db"`          | 等同于相对路径   |
| `"/path/to/test.db"`      | 绝对路径数据库文件 |
| `"file:/path/to/test.db"` | 等同于绝对路径   |

**带查询参数的格式**

| 格式                                                 | 说明        |
| -------------------------------------------------- | --------- |
| `"file:test.db?param1=value1&param2=value2"`       | 带参数的相对路径  |
| `"file::memory:?verbose&log-level=test"`           | 带参数的内存数据库 |
| `"///path/to/test.db?param1=value1&param2=value2"` | 带参数的绝对路径  |

**查询参数处理**

查询参数会作为启动参数传递给 ClickHouse 引擎。
特殊参数处理规则：

| 特殊参数             | 转换为            | 说明     |
| ---------------- | -------------- | ------ |
| `mode=ro`        | `--readonly=1` | 只读模式   |
| `verbose`        | （标志）           | 启用详细日志 |
| `log-level=test` | （设置项）          | 设置日志级别 |

完整参数列表请参阅 `clickhouse local --help --verbose`

**返回值**

| 返回类型         | 说明                                                                                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Connection` | 数据库连接对象，支持：<br />• 使用 `Connection.cursor()` 创建游标<br />• 使用 `Connection.query()` 执行直接查询<br />• 使用 `Connection.send_query()` 执行流式查询<br />• 通过上下文管理器协议实现自动资源清理 |

**异常**

| 异常类型           | 条件          |
| -------------- | ----------- |
| `RuntimeError` | 当连接数据库失败时抛出 |

:::warning Warning
每个进程只支持一个连接。
创建新连接会关闭任何已有连接。
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

**另请参阅**

* `Connection` - 数据库连接类
* `Cursor` - 用于 DB-API 2.0 操作的数据库游标


### **class** `chdb.state.sqlitelike.Connection` \{#chdb-state-sqlitelike-connection\}

基类：`object`

**语法**

```python
class chdb.state.sqlitelike.Connection(connection_string: str)
```

***


#### `close` \{#chdb-session-session-close\}

关闭连接并清理资源。

此方法会关闭数据库连接，并清理/释放所有关联资源，包括活动游标。调用此方法后，连接将变为无效，无法再用于后续操作。

**语法**

```python
close() → None
```

:::note
此方法是幂等的，多次调用是安全的。
:::

:::warning 警告
当连接关闭时，任何正在进行的流式查询都会被取消。请确保在关闭连接前已处理完所有重要数据。
:::

**示例**

```pycon
>>> conn = connect("test.db")
>>> # Use connection for queries
>>> conn.query("CREATE TABLE test (id INT) ENGINE = Memory")
>>> # Close when done
>>> conn.close()
```

```pycon
>>> # Using with context manager (automatic cleanup)
>>> with connect("test.db") as conn:
...     conn.query("SELECT 1")
...     # Connection automatically closed
```

***


#### `cursor` \{#chdb-state-sqlitelike-connection-cursor\}

创建一个用于执行查询的 [Cursor](#chdb-state-sqlitelike-cursor) 对象。

此方法会创建一个数据库游标，提供符合 DB-API 2.0 标准的接口，用于执行查询并获取结果。
该游标允许对查询执行和结果检索进行细粒度控制。

**语法**

```python
cursor() → Cursor
```

**返回值**

| 返回类型     | 描述           |
| -------- | ------------ |
| `Cursor` | 用于数据库操作的游标对象 |

:::note
创建新游标会替换与此连接关联的任何现有游标。
每个连接仅支持一个游标。
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

* [`Cursor`](#chdb-state-sqlitelike-cursor) - 数据库游标实现

***


#### `query` \{#chdb-state-sqlitelike-connection-query\}

执行一条 SQL 查询并返回完整结果。

此方法以同步方式执行 SQL 查询并返回完整的
结果集。它支持多种输出格式，并会自动执行
针对特定格式的后处理。

**语法**

```python
query(query: str, format: str = 'CSV') → Any
```

**参数：**

| 参数       | 类型  | 默认值     | 描述                                                                                                                                                                                                                   |
| -------- | --- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`  | str | *必填*    | 要执行的 SQL 查询字符串                                                                                                                                                                                                       |
| `format` | str | `"CSV"` | 结果输出格式。支持的格式：<br />• `"CSV"` - 逗号分隔值（字符串）<br />• `"JSON"` - JSON 格式（字符串）<br />• `"Arrow"` - Apache Arrow 格式（字节）<br />• `"Dataframe"` - Pandas DataFrame（需要 pandas）<br />• `"Arrowtable"` - PyArrow Table（需要 pyarrow） |

**返回值**

| 返回类型               | 描述              |
| ------------------ | --------------- |
| `str`              | 字符串格式（CSV、JSON） |
| `bytes`            | Arrow 格式        |
| `pandas.DataFrame` | dataframe 格式    |
| `pyarrow.Table`    | arrowtable 格式   |

**异常**

| 异常             | 条件              |
| -------------- | --------------- |
| `RuntimeError` | 当查询执行失败时        |
| `ImportError`  | 当所需的格式相关依赖包未安装时 |

:::warning Warning
此方法会将整个结果集加载到内存中。对于较大的结果集，请考虑使用 [`send_query()`](#chdb-state-sqlitelike-connection-send_query) 进行流式处理。
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

**另请参阅**

* [`send_query()`](#chdb-state-sqlitelike-connection-send_query) - 用于流式执行查询

***


#### `send_query` \{#chdb-state-sqlitelike-connection-send_query\}

执行 SQL 查询并返回流式结果迭代器。

此方法会执行 SQL 查询并返回一个 `StreamingResult` 对象，
从而无需一次性将所有结果加载到内存中即可对结果进行迭代。
这对于处理大型结果集非常适合。

**语法**

```python
send_query(query: str, format: str = 'CSV') → StreamingResult
```

**参数**

| 参数       | 类型  | 默认值     | 描述                                                                                                                                                                                                                 |
| -------- | --- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `query`  | str | *必填*    | 要执行的 SQL 查询字符串                                                                                                                                                                                                     |
| `format` | str | `"CSV"` | 结果的输出格式。支持的格式：<br />• `"CSV"` - 逗号分隔值<br />• `"JSON"` - JSON 格式<br />• `"Arrow"` - Apache Arrow 格式（启用 `record&#95;batch()` 方法）<br />• `"dataframe"` - Pandas DataFrame 分块<br />• `"arrowtable"` - PyArrow Table 分块 |

**返回值**

| 返回类型              | 描述                                                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `StreamingResult` | 一个用于查询结果的流式迭代器，支持：<br />• 迭代器协议（for 循环）<br />• 上下文管理器协议（with 语句）<br />• 使用 `fetch()` 方法手动获取<br />• PyArrow RecordBatch 流式传输（仅 Arrow 格式） |

**异常**

| 异常类型           | 条件               |
| -------------- | ---------------- |
| `RuntimeError` | 查询执行失败时          |
| `ImportError`  | 所需的输出格式相关依赖包未安装时 |

:::note
只有 `"Arrow"` 格式在返回的 `StreamingResult` 上支持 `record_batch()` 方法。
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

* [`query()`](#chdb-state-sqlitelike-connection-query) - 用于执行非流式查询
* [`StreamingResult`](#chdb-state-sqlitelike-streamingresult) - 流式结果迭代器

***


### **class** `chdb.state.sqlitelike.StreamingResult` \{#chdb-state-sqlitelike-streamingresult\}

基类：`object`

用于处理大规模查询结果的流式结果迭代器。

此类提供用于流式处理查询结果的迭代器接口，而无需将整个结果集加载到内存中。它支持多种输出格式，并提供用于手动获取结果以及以 PyArrow RecordBatch 形式进行流式传输的方法。

```python
class chdb.state.sqlitelike.StreamingResult
```

***


#### `fetch` \{#streamingresult-fetch\}

获取下一段流式结果。

此方法从流式查询结果中检索下一段可用数据。返回数据的格式取决于启动流式查询时指定的格式。

**语法**

```python
fetch() → Any
```

**返回值**

| 返回类型    | 描述                       |
| ------- | ------------------------ |
| `str`   | 用于文本格式（如 CSV、JSON）       |
| `bytes` | 用于二进制格式（如 Arrow、Parquet） |
| `None`  | 当结果流已耗尽时                 |

**示例**

```pycon
>>> stream = conn.send_query("SELECT * FROM large_table")
>>> chunk = stream.fetch()
>>> while chunk is not None:
...     process_data(chunk)
...     chunk = stream.fetch()
```

***


#### `cancel` \{#streamingresult-cancel\}

取消流式查询并清理资源。

此方法会取消任何正在进行的流式查询并释放相关资源。当你希望在流尚未完全消费完之前停止处理结果时，应调用此方法。

**语法**

```python
cancel() → None
```

**示例**

```pycon
>>> stream = conn.send_query("SELECT * FROM very_large_table")
>>> for i, chunk in enumerate(stream):
...     if i >= 10:  # Only process first 10 chunks
...         stream.cancel()
...         break
...     process_data(chunk)
```

***


#### `close` \{#streamingresult-close\}

关闭流式结果并清理资源。

是 [`cancel()`](#streamingresult-cancel) 的别名。关闭流式结果迭代器并释放所有关联资源。

**语法**

```python
close() → None
```

***


#### `record_batch` \{#streamingresult-record_batch\}

创建一个用于高效批量处理的 PyArrow `RecordBatchReader`。

此方法会创建一个 PyArrow `RecordBatchReader`，用于以 Arrow 格式高效
迭代查询结果集。在使用 PyArrow 时，这是处理大型结果集的最高效方式。

**语法**

```python
record_batch(rows_per_batch: int = 1000000) → pa.RecordBatchReader
```

**参数**

| 参数               | 类型  | 默认值       | 描述      |
| ---------------- | --- | --------- | ------- |
| `rows_per_batch` | int | `1000000` | 每个批次的行数 |

**返回值**

| 返回类型                   | 描述                                    |
| ---------------------- | ------------------------------------- |
| `pa.RecordBatchReader` | 用于按批次迭代的 PyArrow RecordBatchReader 对象 |

:::note
此方法仅在流式查询是通过 `format="Arrow"` 启动时可用。
在其他格式下使用将会引发错误。
:::

**示例**

```pycon
>>> stream = conn.send_query("SELECT * FROM data", format="Arrow")
>>> reader = stream.record_batch(rows_per_batch=10000)
>>> for batch in reader:
...     print(f"Processing batch: {batch.num_rows} rows")
...     df = batch.to_pandas()
...     process_dataframe(df)
```

***


#### 迭代器协议 \{#streamingresult-iterator\}

`StreamingResult` 支持 Python 迭代器协议，因此可以直接在 `for` 循环中迭代使用：

```pycon
>>> stream = conn.send_query("SELECT number FROM numbers(1000000)")
>>> for chunk in stream:
...     print(f"Chunk size: {len(chunk)} bytes")
```

***


#### 上下文管理器协议 \{#streamingresult-context-manager\}

StreamingResult 支持上下文管理器协议，以便自动释放资源：

```pycon
>>> with conn.send_query("SELECT * FROM data") as stream:
...     for chunk in stream:
...         process(chunk)
>>> # Stream automatically closed
```

***


### **class** `chdb.state.sqlitelike.Cursor` \{#chdb-state-sqlitelike-cursor\}

基类：`object`

```python
class chdb.state.sqlitelike.Cursor(connection)
```

***


#### `close` \{#cursor-close-none\}

关闭游标并清理资源。

此方法会关闭游标并清理其关联的所有资源。
调用此方法后，游标将变为无效，无法再用于后续操作。

**语法**

```python
close() → None
```

:::note
该方法是幂等的，多次调用是安全的。
当连接关闭时，游标也会自动关闭。
:::

**示例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT 1")
>>> result = cursor.fetchone()
>>> cursor.close()  # Cleanup cursor resources
```

***


#### `column_names` \{#chdb-state-sqlitelike-cursor-column_names\}

返回上一次执行的查询的列名列表。

此方法返回最近一次执行的 SELECT 查询中的列名。列名的顺序与它们在结果集中出现的顺序相同。

**语法**

```python
column_names() → list
```

**返回值**

| 返回类型   | 描述                                |
| ------ | --------------------------------- |
| `list` | 列名字符串列表；如果未执行任何查询或查询未返回任何列，则返回空列表 |

**示例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name, email FROM users LIMIT 1")
>>> print(cursor.column_names())
['id', 'name', 'email']
```

**另请参阅**

* [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - 获取列类型信息
* [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0 列描述

***


#### `column_types` \{#chdb-state-sqlitelike-cursor-column_types\}

返回最近一次执行的查询的列类型列表。

此方法返回最近一次执行的 SELECT 查询中的 ClickHouse 列类型名称。
返回的类型顺序与它们在结果集中出现的顺序相同。

**语法**

```python
column_types() → list
```

**返回值**

| 返回类型   | 描述                                            |
| ------ | --------------------------------------------- |
| `list` | ClickHouse 类型名称字符串列表；如果尚未执行查询或查询未返回任何列，则返回空列表 |

**示例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT toInt32(1), toString('hello')")
>>> print(cursor.column_types())
['Int32', 'String']
```

**另请参阅**

* [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - 获取列名信息
* [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0 列描述

***


#### `commit` \{#commit\}

提交所有待处理的事务。

此方法会提交所有待处理的数据库事务。在 ClickHouse 中，
大多数操作都会自动提交，但仍提供此方法以保持与
DB-API 2.0 的兼容性。

:::note
ClickHouse 通常会自动提交操作，因此一般不需要显式提交。
提供此方法是为了与标准的 DB-API 2.0 工作流保持兼容。
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

***


#### `property description : list` \{#chdb-state-sqlitelike-cursor-description\}

根据 DB-API 2.0 规范返回列的描述信息。

此属性返回一个列表，列表中的每一项都是一个包含 7 个元素的元组，用于描述最近一次执行的 SELECT 查询结果集中的每一列。每个元组包含：
(name, type&#95;code, display&#95;size, internal&#95;size, precision, scale, null&#95;ok)

目前仅提供 name 和 type&#95;code，其余字段设置为 None。

**返回值**

| 返回类型   | 描述                                     |
| ------ | -------------------------------------- |
| `list` | 描述每一列的 7 元组列表，如果尚未执行过 SELECT 查询，则返回空列表 |

:::note
这遵循 DB-API 2.0 中对 cursor.description 的规范。
在本实现中，只有前两个元素（name 和 type&#95;code）包含有意义的数据。
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

* [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - 仅获取列名
* [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - 仅获取列类型

***


#### `execute` \{#execute\}

执行 SQL 查询并为获取结果做好准备。

此方法执行 SQL 查询，并为后续通过获取方法检索结果做好准备。
它负责解析结果数据，并对 ClickHouse 数据类型执行自动类型转换。

**语法**

```python
execute(query: str) → None
```

**参数：**

| 参数      | 类型  | 描述             |
| ------- | --- | -------------- |
| `query` | str | 要执行的 SQL 查询字符串 |

**抛出**

| 异常          | 条件              |
| ----------- | --------------- |
| `Exception` | 如果查询执行失败或结果解析失败 |

:::note
此方法遵循 DB-API 2.0 中对 `cursor.execute()` 的规范。
执行后，请使用 `fetchone()`、`fetchmany()` 或 `fetchall()` 来获取结果。
:::

:::note
该方法会自动将 ClickHouse 数据类型转换为适当的
Python 类型：

* Int/UInt 类型 → int
* Float 类型 → float
* String/FixedString → str
* DateTime → datetime.datetime
* Date → datetime.date
* Bool → bool
  :::

**示例**

```pycon
>>> cursor = conn.cursor()
>>>
>>> # Execute DDL
>>> cursor.execute("CREATE TABLE test (id INT, name String) ENGINE = Memory")
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

**另请参阅**

* [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 获取单行记录
* [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 获取多行记录
* [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 获取所有剩余记录

***


#### `fetchall` \{#chdb-state-sqlitelike-cursor-fetchall\}

从查询结果中获取所有剩余的行。

此方法从当前游标位置开始，获取当前查询结果集中所有剩余的行。它返回一个由行元组组成的元组，并对这些元组应用适当的 Python 类型转换。

**语法**

```python
fetchall() → tuple
```

**返回值：**

| 返回类型    | 描述                                     |
| ------- | -------------------------------------- |
| `tuple` | 包含结果集中所有剩余行（以元组形式）组成的元组。如果没有可用行，则返回空元组 |

:::warning 警告
此方法会一次性将所有剩余行加载到内存中。对于大型结果集，请考虑使用 [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) 分批处理结果。
:::

**示例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users")
>>> all_users = cursor.fetchall()
>>> for user_id, user_name in all_users:
...     print(f"User {user_id}: {user_name}")
```

**另请参阅**

* [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 获取单行
* [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 批量获取多行

***


#### `fetchmany` \{#chdb-state-sqlitelike-cursor-fetchmany\}

从查询结果中获取多行数据。

此方法从当前查询结果集中最多检索 `size` 行。它返回一个由行元组组成的元组，每一行包含经过适当 Python 类型转换的列值。

**语法**

```python
fetchmany(size: int = 1) → tuple
```

**参数**

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `size`    | int  | `1`     | 要获取的最大行数    |

**返回值**

| Return Type | Description                            |
| ----------- | -------------------------------------- |
| `tuple`     | 包含至多 `size` 个行元组的元组。如果结果集已耗尽，则可能包含更少的行 |

:::note
该方法遵循 DB-API 2.0 规范。如果结果集已耗尽，将返回少于 `size` 行的数据。
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

**另请参阅**

* [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 获取单行记录
* [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 获取所有剩余行记录

***


#### `fetchone` \{#chdb-state-sqlitelike-cursor-fetchone\}

从查询结果中获取下一行记录。

此方法从当前查询结果集中检索下一条可用记录。它返回一个元组，其中包含各列的值，并已进行相应的 Python 类型转换。

**语法**

```python
fetchone() → tuple | None
```

**返回值：**

| 返回类型              | 描述                              |
| ----------------- | ------------------------------- |
| `Optional[tuple]` | 下一行（以列值元组形式返回）；如果没有更多行，则返回 None |

:::note
此方法遵循 DB-API 2.0 规范。列值会根据
ClickHouse 列类型自动转换为合适的 Python 类型。
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

**另请参阅**

* [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 获取多行记录
* [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 获取所有剩余行记录

***


### `chdb.state.sqlitelike` \{#state-sqlitelike-to_arrowtable\}

将查询结果转换为 PyArrow Table。

此函数会将 chdb 查询结果转换为 PyArrow Table 格式，
该格式能够提供高效的列式数据访问，并与其他数据处理库良好互操作。

**语法**

```python
chdb.state.sqlitelike.to_arrowTable(res)
```

**参数：**

| 参数    | 类型 | 说明                            |
| ----- | -- | ----------------------------- |
| `res` | -  | 来自 chdb 的查询结果对象，包含 Arrow 格式数据 |

**返回值**

| 返回类型            | 说明                |
| --------------- | ----------------- |
| `pyarrow.Table` | 包含查询结果的 PyArrow 表 |

**异常**

| 异常类型          | 触发条件                          |
| ------------- | ----------------------------- |
| `ImportError` | 当未安装 pyarrow 或 pandas 包时抛出该异常 |

:::note
此函数要求同时安装 pyarrow 和 pandas。
可使用以下命令进行安装：`pip install pyarrow pandas`
:::

:::warning 警告
当查询结果为空时，将返回一个无 schema 的空 PyArrow 表。
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

***


### `chdb.state.sqlitelike.to_df` \{#state-sqlitelike-to_df\}

将查询结果转换为 Pandas DataFrame。

该函数会先将 chdb 查询结果转换为 PyArrow Table，然后再转换为 DataFrame，从而得到 Pandas DataFrame 格式的结果，以便结合 Pandas API 方便地进行数据分析。

**语法**

```python
chdb.state.sqlitelike.to_df(r)
```

**参数：**

| 参数  | 类型 | 描述                            |
| --- | -- | ----------------------------- |
| `r` | -  | 来自 chdb 的查询结果对象，包含 Arrow 格式数据 |

**返回值：**

| 返回类型               | 描述                             |
| ------------------ | ------------------------------ |
| `pandas.DataFrame` | 包含查询结果的 DataFrame，具有合适的列名和数据类型 |

**异常**

| 异常            | 条件                             |
| ------------- | ------------------------------ |
| `ImportError` | 当未安装 pyarrow 或 pandas 包时会抛出该异常 |

:::note
此函数在进行 Arrow 到 Pandas 的转换时使用多线程，
以提升处理大型数据集时的性能。
:::

**另请参阅**

* [`to_arrowTable()`](#chdb-state-sqlitelike-to_arrowtable) - 用于转换为 PyArrow Table 格式

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


## DataFrame 集成 \{#dataframe-integration\}

### **class** `chdb.dataframe.Table` \{#chdb-dataframe-table\}

基类：

```python
class chdb.dataframe.Table(*args: Any, **kwargs: Any)
```


## 数据库 API（DBAPI）2.0 接口 \{#database-api-interface\}

chDB 提供兼容 Python DB-API 2.0 的数据库连接接口，使你可以将 chDB 与需要标准数据库接口的工具和框架结合使用。

chDB 的 DB-API 2.0 接口包括：

- **Connections**：使用连接字符串进行数据库连接管理
- **Cursors**：查询执行与结果获取
- **Type System**：符合 DB-API 2.0 的类型常量与转换器
- **Error Handling**：标准的数据库异常层次结构
- **Thread Safety**：线程安全等级为 1（线程可以共享模块，但不能共享连接）

---

### 核心函数 \{#core-functions\}

数据库 API（DBAPI）2.0 接口实现了以下核心函数：

#### `chdb.dbapi.connect` \{#dbapi-connect\}

初始化一个新的数据库连接。

**语法**

```python
chdb.dbapi.connect(*args, **kwargs)
```

**参数**

| 参数     | 类型  | 默认值    | 描述                     |
| ------ | --- | ------ | ---------------------- |
| `path` | str | `None` | 数据库文件路径。`None` 表示内存数据库 |

**异常**

| 异常                                   | 条件         |
| ------------------------------------ | ---------- |
| [`err.Error`](#chdb-dbapi-err-error) | 在无法建立连接时抛出 |

***


#### `chdb.dbapi.get_client_info()` \{#dbapi-get-client-info\}

获取客户端版本信息。

返回 chDB 客户端版本字符串，用于与 MySQLdb 兼容。

**语法**

```python
chdb.dbapi.get_client_info()
```

**返回值**

| 返回类型  | 描述                                    |
| ----- | ------------------------------------- |
| `str` | 版本字符串，格式为 &#39;major.minor.patch&#39; |

***


### 类型构造函数 \{#type-constructors\}

#### `chdb.dbapi.Binary(x)` \{#dbapi-binary\}

以二进制类型返回 x。

此函数将输入转换为 `bytes` 类型，以用于二进制数据库字段，遵循 DB-API 2.0 规范。

**语法**

```python
chdb.dbapi.Binary(x)
```

**参数**

| Parameter | Type | Description  |
| --------- | ---- | ------------ |
| `x`       | -    | 要转换为二进制的输入数据 |

**返回值**

| Return Type | Description |
| ----------- | ----------- |
| `bytes`     | 转换为字节后的输入数据 |

***


### Connection 类 \{#connection-class\}

#### **class** `chdb.dbapi.connections.Connection(path=None)` \{#chdb-dbapi-connections-connection\}

Bases: `object`

符合 DB-API 2.0 规范的 chDB 数据库连接。

此类提供用于连接和操作 chDB 数据库的标准 DB-API 接口，支持内存型数据库和基于文件的数据库。

该连接负责管理底层 chDB 引擎，并提供执行查询、管理事务（在 ClickHouse 中为空操作 no-op）以及创建游标的方法。

```python
class chdb.dbapi.connections.Connection(path=None)
```

**参数**

| 参数     | 类型  | 默认值    | 说明                                                                                      |
| ------ | --- | ------ | --------------------------------------------------------------------------------------- |
| `path` | str | `None` | 数据库文件路径。若为 `None`，则使用内存数据库。可以是类似 `database.db` 的文件路径，也可以为 `None`，此时将使用 `:memory:` 内存数据库 |

**变量**

| 变量         | 类型   | 说明                            |
| ---------- | ---- | ----------------------------- |
| `encoding` | str  | 查询使用的字符编码，默认为 `utf8`          |
| `open`     | bool | 连接为打开状态时为 `True`，关闭时为 `False` |

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
...     cur.execute("CREATE TABLE users (id INT, name STRING) ENGINE = MergeTree() order by id")
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
ClickHouse 不支持传统事务，因此 `commit()` 和 `rollback()` 操作实际上是空操作（no-op），仅为满足 DB-API 兼容性而提供。
:::

***


#### `close` \{#dbapi-connection-close\}

关闭数据库连接。

关闭底层 chDB 连接并将该连接标记为已关闭。
之后对该连接的任何操作都会抛出 Error 异常。

**语法**

```python
close()
```

**引发**

| 异常                                   | 条件      |
| ------------------------------------ | ------- |
| [`err.Error`](#chdb-dbapi-err-error) | 如果连接已关闭 |

***


#### `commit` \{#dbapi-commit\}

提交当前事务。

**语法**

```python
commit()
```

:::note
对于 chDB/ClickHouse 来说，这是一项空操作，因为它不支持传统事务。提供此接口是为了符合 DB-API 2.0 规范。
:::

***


#### `cursor` \{#dbapi-cursor\}

创建一个用于执行查询的新游标（cursor）。

**语法**

```python
cursor(cursor=None)
```

**参数**

| 参数       | 类型 | 描述         |
| -------- | -- | ---------- |
| `cursor` | -  | 忽略，仅为兼容性保留 |

**返回值**

| 返回类型     | 描述         |
| -------- | ---------- |
| `Cursor` | 当前连接的新游标对象 |

**抛出**

| 异常                                   | 条件      |
| ------------------------------------ | ------- |
| [`err.Error`](#chdb-dbapi-err-error) | 如果连接已关闭 |

**示例**

```pycon
>>> conn = Connection()
>>> cur = conn.cursor()
>>> cur.execute("SELECT 1")
>>> result = cur.fetchone()
```

***


#### `escape` \{#escape\}

对值进行转义，以便安全地用于 SQL 查询中。

**语法**

```python
escape(obj, mapping=None)
```

**参数**

| 参数        | 类型 | 描述                |
| --------- | -- | ----------------- |
| `obj`     | -  | 要转义的值（字符串、字节、数字等） |
| `mapping` | -  | 用于转义的可选字符映射       |

**返回值**

| 返回类型 | 描述                |
| ---- | ----------------- |
| -    | 适用于 SQL 查询的已转义输入值 |

**示例**

```pycon
>>> conn = Connection()
>>> safe_value = conn.escape("O'Reilly")
>>> query = f"SELECT * FROM users WHERE name = {safe_value}"
```

***


#### `escape_string` \{#escape-string\}

对用于 SQL 查询的字符串值进行转义。

**语法**

```python
escape_string(s)
```

**参数**

| 参数  | 类型  | 描述      |
| --- | --- | ------- |
| `s` | str | 要转义的字符串 |

**返回值**

| 返回类型  | 描述                 |
| ----- | ------------------ |
| `str` | 在 SQL 中安全使用的已转义字符串 |

***


#### `property open` \{#property-open\}

检查连接是否处于打开状态。

**返回值**

| 返回类型   | 描述                         |
| ------ | -------------------------- |
| `bool` | 若连接已打开则为 True，若已关闭则为 False |

---

#### `query` \{#dbapi-query\}

直接执行 SQL 查询并返回原始结果。

此方法绕过游标接口，直接执行查询。
对于标准 DB-API 用法，建议优先使用 `cursor()` 方法。

**语法**

```python
query(sql, fmt='CSV')
```

**参数：**

| 参数    | 类型           | 默认值     | 描述                                                                                     |
| ----- | ------------ | ------- | -------------------------------------------------------------------------------------- |
| `sql` | str or bytes | *必需*    | 要执行的 SQL 查询                                                                            |
| `fmt` | str          | `"CSV"` | 输出格式。支持的格式包括 &quot;CSV&quot;、&quot;JSON&quot;、&quot;Arrow&quot;、&quot;Parquet&quot; 等。 |

**返回值**

| 返回类型 | 描述            |
| ---- | ------------- |
| -    | 使用指定格式返回的查询结果 |

**异常**

| 异常                                                     | 条件             |
| ------------------------------------------------------ | -------------- |
| [`err.InterfaceError`](#chdb-dbapi-err-interfaceerror) | 如果连接已关闭或查询执行失败 |

**示例**

```pycon
>>> conn = Connection()
>>> result = conn.query("SELECT 1, 'hello'", "CSV")
>>> print(result)
"1,hello\n"
```

***


#### `property resp` \{#property-resp\}

获取最后一次查询的响应。

**Returns**

| Return Type | Description         |
| ----------- | ------------------- |
| -           | 上一次调用 query() 的原始响应 |

:::note
每次直接调用 query() 时，此属性都会更新。
它不反映通过游标执行的查询。
:::

***

#### `rollback` \{#rollback\}

回滚当前事务。

**语法**

```python
rollback()
```

:::note
对于 chDB/ClickHouse 而言这是一个空操作（no-op），因为它不支持传统事务。该功能仅为符合 DB-API 2.0 规范而提供。
:::

***


### Cursor 类 \{#cursor-class\}

#### **class** `chdb.dbapi.cursors.Cursor` \{#chdb-dbapi-cursors-cursor\}

基类：`object`

用于执行查询和获取结果的 DB-API 2.0 游标（cursor）。

该游标提供用于执行 SQL 语句、管理查询结果以及在结果集中导航的方法。它支持参数绑定、批量操作，并遵循 DB-API 2.0 规范。

不要直接创建 Cursor 实例，请改用 `Connection.cursor()`。

```python
class chdb.dbapi.cursors.Cursor(connection)
```

| 变量                | 类型    | 描述                                   |
| ----------------- | ----- | ------------------------------------ |
| `description`     | tuple | 上一次查询结果的列元数据                         |
| `rowcount`        | int   | 受上一次查询影响的行数（未知时为 -1）                 |
| `arraysize`       | int   | 一次获取的默认行数（默认值：1）                     |
| `lastrowid`       | -     | 最后一条插入记录的 ID（如适用）                    |
| `max_stmt_length` | int   | `executemany()` 语句的最大长度（默认值：1024000） |

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
请参阅 [DB-API 2.0 Cursor Objects](https://www.python.org/dev/peps/pep-0249/#cursor-objects)
以获取完整的规范说明。
:::

***


#### `callproc` \{#callproc\}

执行存储过程（占位实现）。

**语法**

```python
callproc(procname, args=())
```

**参数**

| Parameter  | Type     | Description |
| ---------- | -------- | ----------- |
| `procname` | str      | 要执行的存储过程名称  |
| `args`     | sequence | 传递给该存储过程的参数 |

**返回值**

| Return Type | Description        |
| ----------- | ------------------ |
| `sequence`  | 原始的 `args` 参数（未修改） |

:::note
chDB/ClickHouse 不支持传统意义上的存储过程。
此方法仅为符合 DB-API 2.0 规范而提供，本身不会执行
任何实际操作。对所有 SQL 操作请使用 execute()。
:::

:::warning 兼容性
这是一个占位实现。传统存储过程中的特性（例如 OUT/INOUT 参数、
多个结果集以及服务器变量）并未被底层的 ClickHouse 引擎所支持。
:::

***


#### `close` \{#dbapi-cursor-close\}

关闭游标（cursor）并释放相关资源。

关闭之后，游标将变得不可用，任何操作都会抛出异常。
关闭游标会耗尽所有剩余数据并释放底层游标。

**语法**

```python
close()
```

***


#### `execute` \{#dbapi-execute\}

执行 SQL 查询（可选参数绑定）。

此方法执行单条 SQL 语句，并支持可选的参数替换。
它支持多种参数占位符样式，以提供更高的灵活性。

**语法**

```python
execute(query, args=None)
```

**参数**

| 参数      | 类型              | 默认值    | 描述          |
| ------- | --------------- | ------ | ----------- |
| `query` | str             | *必需*   | 要执行的 SQL 查询 |
| `args`  | tuple/list/dict | `None` | 绑定到占位符的参数   |

**返回值**

| 返回类型  | 描述              |
| ----- | --------------- |
| `int` | 受影响的行数（未知时为 -1） |

**参数样式**

| 样式      | 示例                                            |
| ------- | --------------------------------------------- |
| 问号占位样式  | `"SELECT * FROM users WHERE id = ?"`          |
| 命名占位样式  | `"SELECT * FROM users WHERE name = %(name)s"` |
| 百分号格式样式 | `"SELECT * FROM users WHERE age = %s"`（旧版）    |

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

**抛出异常**

| 异常                                                     | 条件             |
| ------------------------------------------------------ | -------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 当游标已关闭或查询格式错误时 |
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror)     | 如果在执行期间发生数据库错误 |

***


#### `executemany(query, args)` \{#chdb-dbapi-cursors-cursor-executemany\}

使用不同的参数集多次执行查询。

此方法可高效地针对不同的参数值多次执行相同的 SQL 查询，对批量 INSERT 操作尤其有用。

**语法**

```python
executemany(query, args)
```

**参数**

| 参数      | 类型       | 描述                        |
| ------- | -------- | ------------------------- |
| `query` | str      | 将被多次执行的 SQL 查询语句          |
| `args`  | sequence | 包含每次执行所用参数元组 / 字典 / 列表的序列 |

**返回值**

| 返回类型  | 描述            |
| ----- | ------------- |
| `int` | 在所有执行中受影响的总行数 |

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
此方法通过优化查询执行过程，提高多行 INSERT 和 UPDATE 操作的性能。
:::

***


#### `fetchall()` \{#dbapi-fetchall\}

从查询结果中获取剩余的所有行。

**语法**

```python
fetchall()
```

**返回值**

| 返回类型   | 描述           |
| ------ | ------------ |
| `list` | 包含所有剩余行的元组列表 |

**异常**

| 异常                                                     | 条件                 |
| ------------------------------------------------------ | ------------------ |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 如果之前尚未调用 execute() |

:::warning 警告
对于较大的结果集，此方法可能会消耗大量内存。
对于大型数据集，建议使用 `fetchmany()`。
:::

**示例**

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> all_rows = cursor.fetchall()
>>> print(len(all_rows))  # Number of total rows
```

***


#### `fetchmany` \{#dbapi-fetchmany\}

从查询结果中获取多行记录。

**语法**

```python
fetchmany(size=1)
```

**参数**

| 参数     | 类型  | 默认值 | 描述                                     |
| ------ | --- | --- | -------------------------------------- |
| `size` | int | `1` | 要获取的行数。如果未指定，则使用 `cursor.arraysize` 的值 |

**返回值**

| 返回类型   | 描述          |
| ------ | ----------- |
| `list` | 表示已获取行的元组列表 |

**异常**

| 异常                                                     | 条件                  |
| ------------------------------------------------------ | ------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 如果尚未先调用 `execute()` |

**示例**

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> rows = cursor.fetchmany(3)
>>> print(rows)  # [(1, 'Alice'), (2, 'Bob'), (3, 'Charlie')]
```

***


#### `fetchone` \{#dbapi-fetchone\}

从查询结果中获取下一行记录。

**语法**

```python
fetchone()
```

**返回值**

| 返回类型            | 描述                       |
| --------------- | ------------------------ |
| `tuple or None` | 以元组形式返回下一行；若无更多行则返回 None |

**异常**

| 异常                                                     | 条件                  |
| ------------------------------------------------------ | ------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 如果尚未先调用 `execute()` |

**示例**

```pycon
>>> cursor.execute("SELECT id, name FROM users LIMIT 3")
>>> row = cursor.fetchone()
>>> print(row)  # (1, 'Alice')
>>> row = cursor.fetchone()
>>> print(row)  # (2, 'Bob')
```

***


#### `max_stmt_length = 1024000` \{#max-stmt-length\}

由 [`executemany()`](#chdb-dbapi-cursors-cursor-executemany) 生成的语句的最大大小。

默认值为 1024000。

---

#### `mogrify` \{#mogrify\}

返回将要发送到数据库的完整查询字符串。

该方法会显示参数替换后的最终 SQL 查询，
这对于调试和日志记录非常有用。

**语法**

```python
mogrify(query, args=None)
```

**参数**

| 参数      | 类型              | 默认值    | 描述              |
| ------- | --------------- | ------ | --------------- |
| `query` | str             | *必需*   | 包含参数占位符的 SQL 查询 |
| `args`  | tuple/list/dict | `None` | 用于替换占位符的参数      |

**返回值**

| 返回类型  | 描述                   |
| ----- | -------------------- |
| `str` | 参数替换完成后的最终 SQL 查询字符串 |

**示例**

```pycon
>>> cur.mogrify("SELECT * FROM users WHERE id = ?", (123,))
"SELECT * FROM users WHERE id = 123"
```

:::note
此方法遵循 Psycopg 所使用的 DB-API 2.0 扩展。
:::

***


#### `nextset` \{#nextset\}

移动到下一个结果集（当前不支持）。

**语法**

```python
nextset()
```

**返回值**

| 返回类型   | 描述                     |
| ------ | ---------------------- |
| `None` | 始终返回 `None`，因为不支持多个结果集 |

:::note
chDB/ClickHouse 不支持在单个查询中返回多个结果集。
此方法仅为符合 DB-API 2.0 规范而提供，但始终返回 `None`。
:::

***


#### `setinputsizes` \{#setinputsizes\}

为参数设置输入大小（no-op 实现）。

**语法**

```python
setinputsizes(*args)
```

**参数**

| 参数      | 类型 | 说明          |
| ------- | -- | ----------- |
| `*args` | -  | 列大小参数（会被忽略） |

:::note
此方法本身不执行任何操作，但根据 DB-API 2.0 规范必须存在。
chDB 会在内部自动处理输出大小。
:::

***


#### `setoutputsizes` \{#setoutputsizes\}

设置输出列的大小（无操作实现）。

**语法**

```python
setoutputsizes(*args)
```

**参数**

| 参数      | 类型 | 说明          |
| ------- | -- | ----------- |
| `*args` | -  | 列大小参数（会被忽略） |

:::note
此方法本身不执行任何操作，但根据 DB-API 2.0 规范必须存在。
chDB 会在内部自动处理输出大小。
:::

***


### 错误类 \{#error-classes\}

chdb 数据库操作使用的异常类。

该模块提供了完整的异常类层次结构，用于处理 chdb 中与数据库相关的错误，遵循 Python Database API Specification v2.0。

异常层次结构如下所示：

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

每个异常类对应一种特定的数据库错误类别：

| Exception           | Description       |
| ------------------- | ----------------- |
| `Warning`           | 在数据库操作过程中出现的非致命警告 |
| `InterfaceError`    | 数据库接口本身出现的问题      |
| `DatabaseError`     | 所有数据库相关错误的基类      |
| `DataError`         | 数据处理问题（无效值、类型错误）  |
| `OperationalError`  | 数据库运行时问题（连接、资源等）  |
| `IntegrityError`    | 约束违规（外键、唯一性等）     |
| `InternalError`     | 数据库内部错误或数据损坏      |
| `ProgrammingError`  | SQL 语法错误和 API 误用  |
| `NotSupportedError` | 不受支持的特性或操作        |

:::note
这些异常类符合 Python DB API 2.0 规范，
并在不同的数据库操作中提供一致的错误处理方式。
:::

**另请参阅**

* [Python Database API Specification v2.0](https://peps.python.org/pep-0249/)
* `chdb.dbapi.connections` - 数据库连接管理
* `chdb.dbapi.cursors` - 数据库游标操作

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

***


#### **异常** `chdb.dbapi.err.DataError` \{#chdb-dbapi-err-dataerror\}

基类：[`DatabaseError`](#chdb-dbapi-err-databaseerror)

当由于处理数据时出现问题而导致错误时引发的异常。

当数据库操作因正在处理的数据存在问题而失败时，将引发此异常，例如：

* 除以零的操作
* 数值超出范围
* 无效的日期/时间值
* 字符串截断错误
* 类型转换失败
* 与列类型不匹配的数据格式无效

**引发**

| 异常                                       | 条件          |
| ---------------------------------------- | ----------- |
| [`DataError`](#chdb-dbapi-err-dataerror) | 当数据校验或处理失败时 |

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

***


#### **exception** `chdb.dbapi.err.DatabaseError` \{#chdb-dbapi-err-databaseerror\}

Bases: [`Error`](#chdb-dbapi-err-error)

与数据库相关错误所抛出的异常。

这是所有与数据库相关错误的基类。它涵盖了在数据库操作期间发生且归因于数据库本身（而非接口）的所有错误。

常见场景包括：

- SQL 执行错误
- 数据库连接问题
- 事务相关问题
- 违反数据库特定约束

:::note
它是更具体数据库错误类型的父类，例如 [`DataError`](#chdb-dbapi-err-dataerror)、[`OperationalError`](#chdb-dbapi-err-operationalerror) 等。
:::

---

#### **exception** `chdb.dbapi.err.Error` \{#chdb-dbapi-err-error\}

Bases: [`StandardError`](#chdb-dbapi-err-standarderror)

作为所有其他错误异常（不包括 Warning）的基类的异常。

这是 chdb 中所有错误异常（不包括警告）的基类。它是所有会阻止操作成功完成的数据库错误状态的父类。

:::note
该异常层次结构遵循 Python DB API 2.0 规范。
:::

**另见**

* [`Warning`](#chdb-dbapi-err-warning) - 不会阻止操作完成的非致命警告

#### **exception** `chdb.dbapi.err.IntegrityError` \{#chdb-dbapi-err-integrityerror\}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

当数据库的关系完整性受到影响时抛出的异常。

当数据库操作违反完整性约束时会抛出该异常，包括：

* 外键约束违规
* 主键或唯一约束违规（重复键）
* CHECK 约束违规
* NOT NULL 约束违规
* 参照完整性违规

**引发**

| 异常                                                 | 条件                |
| -------------------------------------------------- | ----------------- |
| [`IntegrityError`](#chdb-dbapi-err-integrityerror) | 当违反数据库完整性约束时抛出该异常 |

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

***


#### **exception** `chdb.dbapi.err.InterfaceError` \{#chdb-dbapi-err-interfaceerror\}

Bases: [`Error`](#chdb-dbapi-err-error)

当错误与数据库本身无关，而是与数据库接口相关时引发的异常。

当数据库接口实现出现问题时会引发此异常，例如：

- 无效的连接参数
- API 误用（在已关闭的连接上调用方法）
- 接口层协议错误
- 模块导入或初始化失败

**Raises**

| Exception                                          | Condition                                                                  |
|----------------------------------------------------|----------------------------------------------------------------------------|
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror) | 当数据库接口遇到与具体数据库操作无关的错误时抛出该异常 |

:::note
这些错误通常是编程错误或配置问题，可以通过修复客户端代码或配置来解决。
:::

---

#### **exception** `chdb.dbapi.err.InternalError` \{#chdb-dbapi-err-internalerror\}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

当数据库遇到内部错误时引发的异常。

当数据库系统遇到非由应用程序导致的内部错误时会引发此异常，例如：

* 无效的游标状态（游标已不再有效）
* 事务状态不一致（事务不同步）
* 数据库损坏问题
* 内部数据结构损坏
* 系统级数据库错误

**Raises**

| Exception                                        | Condition              |
| ------------------------------------------------ | ---------------------- |
| [`InternalError`](#chdb-dbapi-err-internalerror) | 当数据库遇到内部不一致或内部错误时抛出该异常 |

:::warning Warning
内部错误可能表明存在需要数据库管理员关注的严重数据库问题。
这些错误通常无法通过应用层的重试逻辑恢复。
:::

:::note
这些错误通常超出应用程序的控制范围，可能需要重启数据库或执行修复操作。
:::

---

#### **exception** `chdb.dbapi.err.NotSupportedError` \{#chdb-dbapi-err-notsupportederror\}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

当某个方法或数据库 API 不受支持时引发的异常。

当应用程序尝试使用当前数据库配置或版本不支持的数据库功能或 API 方法时会引发此异常，例如：

* 在不支持事务的连接上请求 `rollback()`
* 使用数据库版本不支持的高级 SQL 特性
* 调用当前驱动未实现的方法
* 尝试使用已禁用的数据库功能

**Raises**

| Exception                                                | Condition           |
| -------------------------------------------------------- | ------------------- |
| [`NotSupportedError`](#chdb-dbapi-err-notsupportederror) | 当访问不受支持的数据库功能时抛出该异常 |

**Examples**

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
检查数据库文档和驱动程序支持的特性，以避免出现这些错误。必要时考虑实现优雅降级。
:::

***


#### **exception** `chdb.dbapi.err.OperationalError` \{#chdb-dbapi-err-operationalerror\}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

为与数据库运行相关的错误而引发的异常。

当数据库运行过程中发生不一定受程序员控制的错误时会引发此异常，包括：

- 与数据库意外断开连接
- 找不到数据库服务器或无法访问
- 事务处理失败
- 处理过程中内存分配错误
- 磁盘空间或其他资源耗尽
- 数据库服务器内部错误
- 身份验证或授权失败

**Raises**

| Exception                                              | Condition                                               |
|--------------------------------------------------------|---------------------------------------------------------|
| [`OperationalError`](#chdb-dbapi-err-operationalerror) | 当数据库操作因运行层面的原因失败时抛出 |

:::note
这些错误通常是临时性的，可以通过重试操作或解决系统层面的问题来恢复。
:::

:::warning Warning
某些运行错误可能意味着严重的系统问题，需要管理员介入处理。
:::

---

#### **exception** `chdb.dbapi.err.ProgrammingError` \{#chdb-dbapi-err-programmingerror\}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

为数据库操作中的编程错误而引发的异常。

当应用在使用数据库时存在编程错误时会引发此异常，包括：

* 找不到表或列
* 创建时表或索引已存在
* 语句中的 SQL 语法错误
* 在预处理语句中指定的参数数量不正确
* 无效的 SQL 操作（例如，对不存在的对象执行 DROP）
* 不正确地使用数据库 API 方法

**Raises**

| Exception                                              | Condition                  |
| ------------------------------------------------------ | -------------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 当 SQL 语句或 API 的使用方式存在错误时抛出 |

**Examples**

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

***


#### **exception** `chdb.dbapi.err.StandardError` \{#chdb-dbapi-err-standarderror\}

Bases: `Exception`

与 chdb 操作相关的异常。

这是所有 chdb 相关异常的基类。它继承自 Python 内置的 Exception 类，并作为数据库操作异常层次结构的根节点。

:::note
此异常类遵循 Python DB API 2.0 规范对数据库异常处理的定义。
:::

---

#### **exception** `chdb.dbapi.err.Warning` \{#chdb-dbapi-err-warning\}

Bases: [`StandardError`](#chdb-dbapi-err-standarderror)

在出现重要警告（例如插入时的数据截断等）时抛出的异常。

当数据库操作已完成但伴随需要引起应用程序注意的重要警告时，会抛出此异常。常见场景包括：

- 插入过程中发生数据截断
- 数值转换时的精度丢失
- 字符集转换相关警告

:::note
此异常类型遵循 Python DB API 2.0 规范中对警告异常的定义。
:::

---

### 模块常量 \{#module-constants\}

#### `chdb.dbapi.apilevel = '2.0'` \{#apilevel\}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

从给定对象创建一个新的字符串对象。若指定了 encoding 或
errors，则该对象必须提供一个数据缓冲区，该缓冲区将使用给定的
编码和错误处理器进行解码。否则，返回 `object._\_str_\_()`（如果已定义）
或 `repr(object)` 的结果。

* encoding 默认为 ‘utf-8’。
* errors 默认为 ‘strict’。

***


#### `chdb.dbapi.threadsafety = 1` \{#threadsafety\}

```python
int([x]) -> integer
int(x, base=10) -> integer
```

将数字或字符串转换为整数；如果未提供任何参数，则返回 0。若 x 为数字，则返回 x.*&#95;int*&#95;() 的结果。对于浮点数，该转换会向零截断。

如果 x 不是数字，或者指定了 base，则 x 必须是一个字符串、bytes 或 bytearray 实例，用于表示给定进制下的一个整数字面量。字面量前可以有 ‘+’ 或 ‘-’，并且可以被空白字符包围。base 默认为 10。有效的进制为 0 和 2-36。base 为 0 表示根据字符串中整数字面量的写法推断进制。

```python
>>> int(‘0b100’, base=0)
4
```

***


#### `chdb.dbapi.paramstyle = 'format'` \{#paramstyle\}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

从给定对象创建一个新的字符串对象。如果指定了 encoding 或
errors，则该对象必须提供一个数据缓冲区，
该缓冲区将使用给定的编码和错误处理器进行解码。
否则，返回 object.*&#95;str*&#95;() 的结果（如果已定义），
或 repr(object) 的结果。
encoding 的默认值为 ‘utf-8’。
errors 的默认值为 ‘strict’。

***


### 类型常量 \{#type-constants\}

#### `chdb.dbapi.STRING = frozenset({247, 253, 254})` \{#string-type\}

用于 DB-API 2.0 类型比较的扩展 frozenset。

此类在 frozenset 的基础上进行了扩展，以支持 DB-API 2.0 的类型比较语义。
它允许更灵活的类型检查，其中单个项可以使用
相等和不等运算符与该集合进行比较。

这用于 STRING、BINARY、NUMBER 等类型常量，
以支持类似 “field&#95;type == STRING” 的比较，其中 field&#95;type 是单个类型值。

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.BINARY = frozenset({249, 250, 251, 252})` \{#binary-type\}

为 DB-API 2.0 类型比较扩展的 frozenset。

此类在 frozenset 的基础上进行扩展，以支持 DB-API 2.0 的类型比较语义。
它允许更灵活的类型检查，单个项可以使用相等和不等运算符
与该集合进行比较。

该类用于 STRING、BINARY、NUMBER 等类型常量，使得可以进行
诸如 “field&#95;type == STRING” 这样的比较，其中 field&#95;type 是单个类型值。

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.NUMBER = frozenset({0, 1, 3, 4, 5, 8, 9, 13})` \{#number-type\}

为 DB-API 2.0 类型比较扩展的 frozenset。

此类在 frozenset 的基础上进行了扩展，以支持符合 DB-API 2.0 语义的类型比较。
它允许进行更灵活的类型检查，其中单个项可以使用相等和不相等运算符
与该集合进行比较。

这用于诸如 STRING、BINARY、NUMBER 等类型常量，从而可以进行类似
“field&#95;type == STRING” 这样的比较，其中 field&#95;type 是一个单一类型值。

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.DATE = frozenset({10, 14})` \{#date-type\}

为 DB-API 2.0 类型比较扩展的 frozenset。

此类在 frozenset 的基础上进行了扩展，以支持 DB-API 2.0 的类型比较语义。
它支持更灵活的类型检查，允许使用相等和不等运算符将单个值
与该集合进行比较。

这用于 STRING、BINARY、NUMBER 等类型常量，以支持诸如
“field&#95;type == STRING” 这样的比较，其中 field&#95;type 是单个类型值。

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.TIME = frozenset({11})` \{#time-type\}

用于 DB-API 2.0 类型比较的扩展 frozenset。

此类在 frozenset 的基础上进行扩展，以支持 DB-API 2.0 的类型比较语义。
它允许进行更灵活的类型检查，单个元素既可以使用相等运算符，也可以使用不等运算符
与该集合进行比较。

这用于 STRING、BINARY、NUMBER 等类型常量，以支持类似
“field&#95;type == STRING” 这样的比较，其中 field&#95;type 为单一类型值。

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.TIMESTAMP = frozenset({7, 12})` \{#timestamp-type\}

用于 DB-API 2.0 类型比较的 frozenset 扩展。

此类在 `frozenset` 基础上进行了扩展，以支持 DB-API 2.0 的类型比较语义。
它允许进行更灵活的类型检查，使得单个值可以使用相等和不等运算符
与该集合进行比较。

它用于 STRING、BINARY、NUMBER 等类型常量，以支持类似
“field&#95;type == STRING” 这样的比较，其中 field&#95;type 是一个单一类型值。

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```


#### `chdb.dbapi.DATETIME = frozenset({7, 12})` \{#datetime-type\}

用于 DB-API 2.0 类型比较的扩展 `frozenset`。

此类在 `frozenset` 的基础上进行了扩展，以支持 DB-API 2.0 的类型比较语义。
它允许进行更灵活的类型检查，其中单个项可以使用相等和不等运算符
与该集合进行比较。

这用于 STRING、BINARY、NUMBER 等类型常量，以支持诸如
“field&#95;type == STRING” 这样的比较，其中 field&#95;type 是单个类型值。

**示例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.ROWID = frozenset({})` \{#rowid-type\}

用于 DB-API 2.0 类型比较的扩展 `frozenset`。

此类是对 `frozenset` 的扩展，以支持 DB-API 2.0 的类型比较语义。
它允许进行灵活的类型检查，单个元素可以使用相等和不等运算符
与集合进行比较。

这用于诸如 STRING、BINARY、NUMBER 等类型常量，从而可以进行
类似 “field&#95;type == STRING” 的比较，其中 field&#95;type 是单个类型值。

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

数据操作：

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

1. **连接管理**：操作完成后务必关闭连接和游标
2. **上下文管理器**：使用 `with` 语句实现自动清理
3. **批量处理**：对于大型结果集使用 `fetchmany()`
4. **错误处理**：将数据库操作包装在 try-except 块中
5. **参数绑定**：尽可能使用参数化查询
6. **内存管理**：对于超大数据集避免使用 `fetchall()`

:::note

* chDB 的 DB-API 2.0 接口与大多数 Python 数据库工具兼容
* 该接口提供 Level 1 线程安全（线程可以共享模块但不能共享连接）
* 连接字符串支持与 chDB 会话相同的参数
* 支持所有标准 DB-API 2.0 异常
  :::

:::warning 警告

* 务必关闭游标和连接以避免资源泄漏
* 大型结果集应分批处理
* 参数绑定语法遵循格式样式：`%s`
  :::


## 用户自定义函数（UDF） \{#user-defined-functions\}

chDB 的用户自定义函数模块。

该模块提供在 chDB 中创建和管理用户自定义函数（UDF）的功能。它允许你通过编写可从 SQL 查询中调用的自定义 Python 函数来扩展 chDB 的功能。

### `chdb.udf.chdb_udf` \{#chdb-udf\}

用于 chDB Python UDF（User Defined Function，用户自定义函数）的装饰器。

**语法**

```python
chdb.udf.chdb_udf(return_type='String')
```

**参数**

| 参数            | 类型  | 默认值        | 描述                              |
| ------------- | --- | ---------- | ------------------------------- |
| `return_type` | str | `"String"` | 函数的返回类型。应为 ClickHouse 支持的数据类型之一 |

**注意事项**

1. 函数必须是无状态的。仅支持 UDF，不支持 UDAF。
2. 默认返回类型为 String。返回类型必须是 ClickHouse 的某种数据类型。
3. 函数应接收 String 类型的参数。所有参数都是字符串。
4. 函数会对输入的每一行调用一次。
5. 函数必须是纯 Python 函数。所有在函数中使用的模块都必须在函数内部导入。
6. 使用的 Python 解释器与运行该脚本所用的解释器相同。

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

***


### `chdb.udf.generate_udf` \{#generate-udf\}

生成 UDF 的配置和可执行脚本文件。

此函数会为 chDB 中的用户自定义函数（UDF）创建所需文件：

1. 一个用于处理输入数据的 Python 可执行脚本
2. 一个将 UDF 注册到 ClickHouse 的 XML 配置文件

**语法**

```python
chdb.udf.generate_udf(func_name, args, return_type, udf_body)
```

**参数**

| 参数            | 类型   | 描述                     |
| ------------- | ---- | ---------------------- |
| `func_name`   | str  | UDF 函数的名称              |
| `args`        | list | 函数的参数名称列表              |
| `return_type` | str  | 该函数在 ClickHouse 中的返回类型 |
| `udf_body`    | str  | UDF 函数的 Python 源代码主体   |

:::note
此函数通常由 `@chdb_udf` 装饰器调用，用户不应直接调用。
:::

***


## 实用工具 \{#utilities\}

用于 chDB 的实用函数和辅助工具。

该模块包含多个用于处理 chDB 的实用函数，包括
数据类型推断、数据转换辅助函数以及调试工具。

---

### `chdb.utils.convert_to_columnar` \{#convert-to-columnar\}

将字典列表转换为列式格式。

此函数接收一个字典列表，并将其转换为一个字典，
其中每个键对应一列，每个值是该列值的列表。
字典中缺失的值会表示为 None。

**语法**

```python
chdb.utils.convert_to_columnar(items: List[Dict[str, Any]]) → Dict[str, List[Any]]
```

**参数**

| 参数      | 类型                     | 描述       |
| ------- | ---------------------- | -------- |
| `items` | `List[Dict[str, Any]]` | 待转换的字典列表 |

**返回值**

| 返回类型                   | 描述                    |
| ---------------------- | --------------------- |
| `Dict[str, List[Any]]` | 一个字典，其中键为列名，值为对应列值的列表 |

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

***


### `chdb.utils.flatten_dict` \{#flatten-dict\}

将嵌套字典展平。

此函数接受一个嵌套字典并将其展平，用分隔符连接嵌套键。
字典列表会被序列化为 JSON 字符串。

**语法**

```python
chdb.utils.flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '_') → Dict[str, Any]
```

**参数**

| 参数           | 类型               | 默认值   | 描述                |
| ------------ | ---------------- | ----- | ----------------- |
| `d`          | `Dict[str, Any]` | *必填*  | 需要展平处理的字典         |
| `parent_key` | str              | `""`  | 要添加到每个键前的基础（前缀）键名 |
| `sep`        | str              | `"_"` | 连接键名时使用的分隔符       |

**返回值**

| 返回类型             | 描述     |
| ---------------- | ------ |
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

***


### `chdb.utils.infer_data_type` \{#infer-data-type\}

为一个值列表推断最合适的数据类型。

该函数会检查一个值列表，并确定能够表示列表中所有值的最合适数据类型。它会考虑整数、无符号整数、小数和浮点数类型；如果值无法由任何数值类型表示，或者所有值都是 None，则默认为“string”。

**语法**

```python
chdb.utils.infer_data_type(values: List[Any]) → str
```

**参数**

| 参数       | 类型          | 描述                 |
| -------- | ----------- | ------------------ |
| `values` | `List[Any]` | 待分析的值列表。这些值可以是任意类型 |

**返回值**

| 返回类型  | 描述                                                                                                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `str` | 表示推断数据类型的字符串。可能的返回值包括：“int8”、“int16”、“int32”、“int64”、“int128”、“int256”、“uint8”、“uint16”、“uint32”、“uint64”、“uint128”、“uint256”、“decimal128”、“decimal256”、“float32”、“float64” 或 “string”。 |

:::note

* 如果列表中的所有值都是 None，则函数返回 “string”。
* 如果列表中任意一个值是字符串，函数会立即返回 “string”。
* 函数会根据数值的范围和精度，推断数值可以表示为整数、
  小数或浮点数。
  :::

***


### `chdb.utils.infer_data_types` \{#infer-data-types\}

为列式数据结构中的每一列推断数据类型。

该函数会分析每一列中的值，并基于数据样本为每一列推断最合适的
数据类型。

**语法**

```python
chdb.utils.infer_data_types`(column_data: Dict[str, List[Any]], n_rows: int = 10000) → List[tuple]
```

**参数**

| 参数            | 类型                     | 默认值     | 描述                    |
| ------------- | ---------------------- | ------- | --------------------- |
| `column_data` | `Dict[str, List[Any]]` | *必需*    | 一个字典，其中键为列名，值为对应列的值列表 |
| `n_rows`      | int                    | `10000` | 用于类型推断的采样行数           |

**返回值**

| 返回类型          | 描述                         |
| ------------- | -------------------------- |
| `List[tuple]` | 元组列表，其中每个元组包含一个列名及其推断的数据类型 |


## 抽象基类 \{#abstract-base-classes\}

### **class** `chdb.rwabc.PyReader`(data: Any)` \{#pyreader\}

继承自：`ABC`

```python
class chdb.rwabc.PyReader(data: Any)
```

***


#### **abstractmethod** `read` \{#read\}

从给定的列中读取指定数量的行，并返回一个对象列表，
其中每个对象都是对应某一列的一组值序列。

```python
abstractmethod (col_names: List[str], count: int) → List[Any]
```

**参数**

| Parameter   | Type        | Description |
| ----------- | ----------- | ----------- |
| `col_names` | `List[str]` | 要读取的列名列表    |
| `count`     | int         | 要读取的最大行数    |

**返回值**

| Return Type | Description    |
| ----------- | -------------- |
| `List[Any]` | 序列列表，每一列对应一个序列 |


### **class** `chdb.rwabc.PyWriter` \{#pywriter\}

继承自：`ABC`

```python
class chdb.rwabc.PyWriter(col_names: List[str], types: List[type], data: Any)
```

***


#### **abstractmethod** finalize \{#finalize\}

从各个数据块中组装并返回最终数据。必须由子类实现。

```python
abstractmethod finalize() → bytes
```

**返回值**

| 返回类型    | 描述        |
| ------- | --------- |
| `bytes` | 最终序列化后的数据 |

***


#### **abstractmethod** `write` \{#write\}

将数据列写入数据块中。必须由子类实现。

```python
abstractmethod write(col_names: List[str], columns: List[List[Any]]) → None
```

**参数**

| 参数          | 类型                | 描述               |
| ----------- | ----------------- | ---------------- |
| `col_names` | `List[str]`       | 要写入的列名列表         |
| `columns`   | `List[List[Any]]` | 列数据列表，每一列由一个列表表示 |


## 异常处理 \{#exception-handling\}

### **class** `chdb.ChdbError` \{#chdberror\}

基类：`Exception`

用于 chDB 相关错误的基础异常类。

当 chDB 查询执行失败或遇到错误时会抛出此异常。它继承自标准的 Python `Exception` 类，并提供来自底层 ClickHouse 引擎的错误信息。

异常信息通常包含来自 ClickHouse 的详细错误信息，包括语法错误、类型不匹配、缺少的表/列以及其他查询执行问题。

**变量**

| 变量     | 类型 | 描述               |
| ------ | -- | ---------------- |
| `args` | -  | 包含错误信息及任意附加参数的元组 |

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
当底层 ClickHouse 引擎报告错误时，`chdb.query()` 及相关函数会自动抛出此异常。
在处理可能失败的查询时，你应当捕获此异常，以便在应用程序中进行适当的错误处理。
:::


## 版本信息 \{#version-information\}

### `chdb.chdb_version = ('3', '6', '0')` \{#chdb-version\}

内置不可变序列（元组，`tuple`）。

如果没有提供参数，构造函数会返回一个空的 `tuple`。
如果指定了可迭代对象，则会使用该可迭代对象中的元素来初始化 `tuple`。

如果参数本身是一个 `tuple`，则返回值就是该对象本身。

---

### `chdb.engine_version = '25.5.2.1'` \{#engine-version\}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

从给定对象创建一个新的字符串对象。若指定了 encoding 或
errors 参数，则该对象必须暴露一个数据缓冲区，
并使用给定的编码和错误处理器对其进行解码。
否则，返回 object.*&#95;str*&#95;() 的结果（如果已定义），
否则返回 repr(object)。

* encoding 默认为 ‘utf-8’。
* errors 默认为 ‘strict’。

***


### `chdb.__version__ = '3.6.0'` \{#version\}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

从给定对象创建一个新的字符串对象。若指定了 encoding 或
errors，则该对象必须公开一个数据缓冲区，
该缓冲区会使用给定的编码和错误处理器进行解码。
否则，返回 object.*&#95;str*&#95;()（如果已定义）的结果，
或者 repr(object)。

* encoding 默认值为 ‘utf-8’。
* errors 默认值为 ‘strict’。
