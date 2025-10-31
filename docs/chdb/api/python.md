---
title: 'chDB Python API Reference'
sidebar_label: 'Python API'
slug: /chdb/api/python
description: 'Complete Python API reference for chDB'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'api', 'reference']
doc_type: 'reference'
---

# Python API Reference

## Core Query Functions {#core-query-functions}

### `chdb.query` {#chdb-query}

Execute SQL query using chDB engine.

This is the main query function that executes SQL statements using the embedded
ClickHouse engine. Supports various output formats and can work with in-memory
or file-based databases.

**Syntax**

```python
chdb.query(sql, output_format='CSV', path='', udf_path='')
```

**Parameters**

| Parameter       | Type  | Default    | Description                                                                                                                                                                                                                                                                                                     |
|-----------------|-------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`           | str   | *required* | SQL query string to execute                                                                                                                                                                                                                                                                                     |
| `output_format` | str   | `"CSV"`    | Output format for results. Supported formats:<br/>• `"CSV"` - Comma-separated values<br/>• `"JSON"` - JSON format<br/>• `"Arrow"` - Apache Arrow format<br/>• `"Parquet"` - Parquet format<br/>• `"DataFrame"` - Pandas DataFrame<br/>• `"ArrowTable"` - PyArrow Table<br/>• `"Debug"` - Enable verbose logging |
| `path`          | str   | `""`       | Database file path. Defaults to in-memory database.<br/>Can be a file path or `":memory:"` for in-memory database                                                                                                                                                                                               |
| `udf_path`      | str   | `""`       | Path to User-Defined Functions directory                                                                                                                                                                                                                                                                        |

**Returns**

Returns the query result in the specified format:

| Return Type        | Condition                                                |
|--------------------|----------------------------------------------------------|
| `str`              | For text formats like CSV, JSON                          |
| `pd.DataFrame`     | When `output_format` is `"DataFrame"` or `"dataframe"`   |
| `pa.Table`         | When `output_format` is `"ArrowTable"` or `"arrowtable"` |
| chdb result object | For other formats                                        |
 
**Raises**

| Exception     | Condition                                                        |
|---------------|------------------------------------------------------------------|
| `ChdbError`   | If the SQL query execution fails                                 |
| `ImportError` | If required dependencies are missing for DataFrame/Arrow formats |

**Examples**

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

---

### `chdb.sql` {#chdb_sql}

Execute SQL query using chDB engine.

This is the main query function that executes SQL statements using the embedded
ClickHouse engine. Supports various output formats and can work with in-memory
or file-based databases.

**Syntax**

```python
chdb.sql(sql, output_format='CSV', path='', udf_path='')
```

**Parameters**

| Parameter       | Type  | Default    | Description                                                                                                                                                                                                                                                                                              |
|-----------------|-------|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`           | str   | *required* | SQL query string to execute                                                                                                                                                                                                                                                                              |
| `output_format` | str   | `"CSV"`    | Output format for results. Supported formats:<br/>• `"CSV"` - Comma-separated values<br/>• `"JSON"` - JSON format<br/>• `"Arrow"` - Apache Arrow format<br/>• `"Parquet"` - Parquet format<br/>• `"DataFrame"` - Pandas DataFrame<br/>• `"ArrowTable"` - PyArrow Table<br/>• `"Debug"` - Enable verbose logging |
| `path`          | str   | `""`       | Database file path. Defaults to in-memory database.<br/>Can be a file path or `":memory:"` for in-memory database                                                                                                                                                                                         |
| `udf_path`      | str   | `""`       | Path to User-Defined Functions directory                                                                                                                                                                                                                                                                 |

**Returns**

Returns the query result in the specified format:

| Return Type        | Condition                                                |
|--------------------|----------------------------------------------------------|
| `str`              | For text formats like CSV, JSON                          |
| `pd.DataFrame`     | When `output_format` is `"DataFrame"` or `"dataframe"`   |
| `pa.Table`         | When `output_format` is `"ArrowTable"` or `"arrowtable"` |
| chdb result object | For other formats                                        |

**Raises**

| Exception                 | Condition                                                        |
|---------------------------|------------------------------------------------------------------|
| [`ChdbError`](#chdberror) | If the SQL query execution fails                                 |
| `ImportError`             | If required dependencies are missing for DataFrame/Arrow formats |

**Examples**

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

---

### `chdb.to_arrowTable` {#chdb-state-sqlitelike-to_arrowtable}

Convert query result to PyArrow Table.

Converts a chDB query result to a PyArrow Table for efficient columnar data processing.
Returns an empty table if the result is empty.

**Syntax**

```python
chdb.to_arrowTable(res)
```

**Parameters**

| Parameter    | Description                                           |
|--------------|-------------------------------------------------------|
| `res`        | chDB query result object containing binary Arrow data |

**Returns**

| Return type | Description                                |
|-------------|--------------------------------------------|
| `pa.Table`  | PyArrow Table containing the query results |

**Raises**

| Error type    | Description                            |
|---------------|----------------------------------------|
| `ImportError` | If pyarrow or pandas are not installed |

**Example**

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> table = chdb.to_arrowTable(result)
>>> print(table.to_pandas())
   id    msg
0   1  hello
```

---

### `chdb.to_df` {#chdb_to_df}

Convert query result to pandas DataFrame.

Converts a chDB query result to a pandas DataFrame by first converting to
PyArrow Table and then to pandas using multi-threading for better performance.

**Syntax**

```python
chdb.to_df(r)
```

**Parameters**

| Parameter  | Description                                           |
|------------|-------------------------------------------------------|
| `r`        | chDB query result object containing binary Arrow data |

**Returns**

| Return Type | Description |
|-------------|-------------|
| `pd.DataFrame` | pandas DataFrame containing the query results |

**Raises**

| Exception     | Condition                              |
|---------------|----------------------------------------|
| `ImportError` | If pyarrow or pandas are not installed |

**Example**

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> df = chdb.to_df(result)
>>> print(df)
   id    msg
0   1  hello
```

## Connection and Session Management {#connection-session-management}

The following Session Functions are available:

### `chdb.connect` {#chdb-connect}

Create a connection to chDB background server.

This function establishes a [Connection](#chdb-state-sqlitelike-connection) to the chDB (ClickHouse) database engine.
Only one open connection is allowed per process.
Multiple calls with the same connection string will return the same connection object.

```python
chdb.connect(connection_string: str = ':memory:') → Connection
```

**Parameters:**

| Parameter           | Type  | Default      | Description                                    |
|---------------------|-------|--------------|------------------------------------------------|
| `connection_string` | str   | `":memory:"` | Database connection string. See formats below. |

**Basic formats**

| Format                    | Description                  |
|---------------------------|------------------------------|
| `":memory:"`              | In-memory database (default) |
| `"test.db"`               | Relative path database file  |
| `"file:test.db"`          | Same as relative path        |
| `"/path/to/test.db"`      | Absolute path database file  |
| `"file:/path/to/test.db"` | Same as absolute path        |

**With query parameters**

| Format                                             | Description               |
|----------------------------------------------------|---------------------------|
| `"file:test.db?param1=value1&param2=value2"`       | Relative path with params |
| `"file::memory:?verbose&log-level=test"`           | In-memory with params     |
| `"///path/to/test.db?param1=value1&param2=value2"` | Absolute path with params |

**Query parameter handling**

Query parameters are passed to ClickHouse engine as startup arguments.
Special parameter handling:

| Special Parameter  | Becomes        | Description             |
|--------------------|----------------|-------------------------|
| `mode=ro`          | `--readonly=1` | Read-only mode          |
| `verbose`          | (flag)         | Enables verbose logging |
| `log-level=test`   | (setting)      | Sets logging level      |

For a complete parameter list, see `clickhouse local --help --verbose`

**Returns**

| Return Type  | Description                                                                                                                                                                                                                                        |
|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Connection` | Database connection object that supports:<br/>• Creating cursors with `Connection.cursor()`<br/>• Direct queries with `Connection.query()`<br/>• Streaming queries with `Connection.send_query()`<br/>• Context manager protocol for automatic cleanup |

**Raises**

| Exception      | Condition                       |
|----------------|---------------------------------|
| `RuntimeError` | If connection to database fails |

:::warning
Only one connection per process is supported.
Creating a new connection will close any existing connection.
:::

**Examples**

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

**See also**
- [`Connection`](#chdb-state-sqlitelike-connection) - Database connection class
- [`Cursor`](#chdb-state-sqlitelike-cursor) - Database cursor for DB-API 2.0 operations

## Exception Handling {#chdb-exceptions}

### **class** `chdb.ChdbError` {#chdb_chdbError}

Bases: `Exception`

Base exception class for chDB-related errors.

This exception is raised when chDB query execution fails or encounters
an error. It inherits from the standard Python Exception class and
provides error information from the underlying ClickHouse engine.

---

### **class** `chdb.session.Session` {#chdb_session_session}

Bases: `object`

Session will keep the state of query.
If path is None, it will create a temporary directory and use it as the database path
and the temporary directory will be removed when the session is closed.
You can also pass in a path to create a database at that path where will keep your data.

You can also use a connection string to pass in the path and other parameters.

```python
class chdb.session.Session(path=None)
```

**Examples**

| Connection String                                  | Description                          |
|----------------------------------------------------|--------------------------------------|
| `":memory:"`                                       | In-memory database                   |
| `"test.db"`                                        | Relative path                        |
| `"file:test.db"`                                   | Same as above                        |
| `"/path/to/test.db"`                               | Absolute path                        |
| `"file:/path/to/test.db"`                          | Same as above                        |
| `"file:test.db?param1=value1&param2=value2"`       | Relative path with query params      |
| `"file::memory:?verbose&log-level=test"`           | In-memory database with query params |
| `"///path/to/test.db?param1=value1&param2=value2"` | Absolute path with query params      |

:::note Connection string args handling
Connection strings containing query params like “[file:test.db?param1=value1&param2=value2](file:test.db?param1=value1&param2=value2)”
“param1=value1” will be passed to ClickHouse engine as start up args.

For more details, see `clickhouse local –help –verbose`

Some special args handling:
- “mode=ro” would be “–readonly=1” for clickhouse (read-only mode)
:::

:::warning Important
- There can be only one session at a time. If you want to create a new session, you need to close the existing one.
- Creating a new session will close the existing one.
:::

---

#### `cleanup` {#cleanup}

Cleanup session resources with exception handling.

This method attempts to close the session while suppressing any exceptions
that might occur during the cleanup process. It’s particularly useful in
error handling scenarios or when you need to ensure cleanup happens regardless
of the session state.

**Syntax**

```python
cleanup()
```

:::note
This method will never raise an exception, making it safe to call in
finally blocks or destructors.
:::

**Examples**

```pycon
>>> session = Session("test.db")
>>> try:
...     session.query("INVALID SQL")
... finally:
...     session.cleanup()  # Safe cleanup regardless of errors
```

**See also**
- [`close()`](#chdb-session-session-close) - For explicit session closing with error propagation

---

#### `close` {#close}

Close the session and cleanup resources.

This method closes the underlying connection and resets the global session state.
After calling this method, the session becomes invalid and cannot be used for
further queries.

**Syntax**

```python
close()
```

:::note
This method is automatically called when the session is used as a context manager
or when the session object is destroyed.
:::

:::warning Important
Any attempt to use the session after calling `close()` will result in an error.
:::

**Examples**

```pycon
>>> session = Session("test.db")
>>> session.query("SELECT 1")
>>> session.close()  # Explicitly close the session
```

---

#### `query` {#chdb-session-session-query}

Execute a SQL query and return the results.

This method executes a SQL query against the session’s database and returns
the results in the specified format. The method supports various output formats
and maintains session state between queries.

**Syntax**

```python
query(sql, fmt='CSV', udf_path='')
```

**Parameters**

| Parameter  | Type  | Default    | Description                                                                                                                                                                                                                                                                                                                  |
|------------|-------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`      | str   | *required* | SQL query string to execute                                                                                                                                                                                                                                                                                                  |
| `fmt`      | str   | `"CSV"`    | Output format for results. Available formats:<br/>• `"CSV"` - Comma-separated values<br/>• `"JSON"` - JSON format<br/>• `"TabSeparated"` - Tab-separated values<br/>• `"Pretty"` - Pretty-printed table format<br/>• `"JSONCompact"` - Compact JSON format<br/>• `"Arrow"` - Apache Arrow format<br/>• `"Parquet"` - Parquet format |
| `udf_path` | str   | `""`       | Path to user-defined functions. If not specified, uses the UDF path from session initialization                                                                                                                                                                                                                              |

**Returns**

Returns query results in the specified format.
The exact return type depends on the format parameter:
- String formats (CSV, JSON, etc.) return str
- Binary formats (Arrow, Parquet) return bytes

**Raises**

| Exception      | Condition                           |
|----------------|-------------------------------------|
| `RuntimeError` | If the session is closed or invalid |
| `ValueError`   | If the SQL query is malformed       |

:::note
The “Debug” format is not supported and will be automatically converted
to “CSV” with a warning.
For debugging, use connection string parameters instead.
:::

:::warning Warning
This method executes the query synchronously and loads all results into
memory. For large result sets, consider using [`send_query()`](#chdb-session-session-send_query) for
streaming results.
:::

**Examples**

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

**See also**
- [`send_query()`](#chdb-session-session-send_query) - For streaming query execution
- [`sql`](#chdb-session-session-sql) - Alias for this method

---

#### `send_query` {#chdb-session-session-send_query}

Execute a SQL query and return a streaming result iterator.

This method executes a SQL query against the session’s database and returns
a streaming result object that allows you to iterate over the results without
loading everything into memory at once. This is particularly useful for large
result sets.

**Syntax**

```python
send_query(sql, fmt='CSV') → StreamingResult
```

**Parameters**

| Parameter  | Type  | Default    | Description                                                                                                                                                                                                                                                                    |
|------------|-------|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`      | str   | *required* | SQL query string to execute                                                                                                                                                                                                                                                    |
| `fmt`      | str   | `"CSV"`    | Output format for results. Available formats:<br/>• `"CSV"` - Comma-separated values<br/>• `"JSON"` - JSON format<br/>• `"TabSeparated"` - Tab-separated values<br/>• `"JSONCompact"` - Compact JSON format<br/>• `"Arrow"` - Apache Arrow format<br/>• `"Parquet"` - Parquet format |

**Returns**

| Return Type       | Description                                                                                                                                      |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| `StreamingResult` | A streaming result iterator that yields query results incrementally. The iterator can be used in for loops or converted to other data structures |

**Raises**

| Exception      | Condition                           |
|----------------|-------------------------------------|
| `RuntimeError` | If the session is closed or invalid |
| `ValueError`   | If the SQL query is malformed       |

:::note
The “Debug” format is not supported and will be automatically converted
to “CSV” with a warning. For debugging, use connection string parameters instead.
:::

:::warning
The returned StreamingResult object should be consumed promptly or stored appropriately, as it maintains a connection to the database.
:::

**Examples**

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

**See also**
- [`query()`](#chdb-session-session-query) - For non-streaming query execution
- `chdb.state.sqlitelike.StreamingResult` - Streaming result iterator

---

#### `sql` {#chdb-session-session-sql}

Execute a SQL query and return the results.

This method executes a SQL query against the session’s database and returns
the results in the specified format. The method supports various output formats
and maintains session state between queries.

**Syntax**

```python
sql(sql, fmt='CSV', udf_path='')
```

**Parameters**

| Parameter  | Type  | Default    | Description                                                                                                                                                                                                                                                                                                                  |
|------------|-------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`      | str   | *required* | SQL query string to execute                                                                                                                                                                                                                                                                                                  |
| `fmt`      | str   | `"CSV"`    | Output format for results. Available formats:<br/>• `"CSV"` - Comma-separated values<br/>• `"JSON"` - JSON format<br/>• `"TabSeparated"` - Tab-separated values<br/>• `"Pretty"` - Pretty-printed table format<br/>• `"JSONCompact"` - Compact JSON format<br/>• `"Arrow"` - Apache Arrow format<br/>• `"Parquet"` - Parquet format |
| `udf_path` | str   | `""`       | Path to user-defined functions. If not specified, uses the UDF path from session initialization                                                                                                                                                                                                                              |

**Returns**

Returns query results in the specified format.
The exact return type depends on the format parameter:
- String formats (CSV, JSON, etc.) return str
- Binary formats (Arrow, Parquet) return bytes

**Raises:**

| Exception      | Condition                           |
|----------------|-------------------------------------|
| `RuntimeError` | If the session is closed or invalid |
| `ValueError`   | If the SQL query is malformed       |

:::note
The “Debug” format is not supported and will be automatically converted
to “CSV” with a warning. For debugging, use connection string parameters
instead.
:::

:::warning Warning
This method executes the query synchronously and loads all results into
memory.
For large result sets, consider using [`send_query()`](#chdb-session-session-send_query) for streaming results.
:::

**Examples**

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

**See also**
- [`send_query()`](#chdb-session-session-send_query) - For streaming query execution
- [`sql`](#chdb-session-session-sql) - Alias for this method

## State Management {#chdb-state-management}

### `chdb.state.connect` {#chdb_state_connect}

Create a [Connection](#chdb-state-sqlitelike-connection) to the chDB background server.

This function establishes a connection to the chDB (ClickHouse) database engine.
Only one open connection is allowed per process. Multiple calls with the same
connection string will return the same connection object.

**Syntax**

```python
chdb.state.connect(connection_string: str = ':memory:') → Connection
```

**Parameters**

| Parameter                          | Type  | Default      | Description                                    |
|------------------------------------|-------|--------------|------------------------------------------------|
| `connection_string(str, optional)` | str   | `":memory:"` | Database connection string. See formats below. |

**Basic formats**

Supported connection string formats:

| Format                    | Description                  |
|---------------------------|------------------------------|
| `":memory:"`              | In-memory database (default) |
| `"test.db"`               | Relative path database file  |
| `"file:test.db"`          | Same as relative path        |
| `"/path/to/test.db"`      | Absolute path database file  |
| `"file:/path/to/test.db"` | Same as absolute path        |

**With query parameters**

| Format                                             | Description               |
|----------------------------------------------------|---------------------------|
| `"file:test.db?param1=value1&param2=value2"`       | Relative path with params |
| `"file::memory:?verbose&log-level=test"`           | In-memory with params     |
| `"///path/to/test.db?param1=value1&param2=value2"` | Absolute path with params |

**Query parameter handling**

Query parameters are passed to ClickHouse engine as startup arguments.
Special parameter handling:

| Special Parameter  | Becomes        | Description             |
|--------------------|----------------|-------------------------|
| `mode=ro`          | `--readonly=1` | Read-only mode          |
| `verbose`          | (flag)         | Enables verbose logging |
| `log-level=test`   | (setting)      | Sets logging level      |

For a complete parameter list, see `clickhouse local --help --verbose`

**Returns**

| Return Type  | Description                                                                                                                                                                                                                                        |
|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Connection` | Database connection object that supports:<br/>• Creating cursors with `Connection.cursor()`<br/>• Direct queries with `Connection.query()`<br/>• Streaming queries with `Connection.send_query()`<br/>• Context manager protocol for automatic cleanup |

**Raises**

| Exception      | Condition                       |
|----------------|---------------------------------|
| `RuntimeError` | If connection to database fails |

:::warning Warning
Only one connection per process is supported.
Creating a new connection will close any existing connection.
:::

**Examples**

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

**See also**
- `Connection` - Database connection class
- `Cursor` - Database cursor for DB-API 2.0 operations

### **class** `chdb.state.sqlitelike.Connection` {#chdb-state-sqlitelike-connection}

Bases: `object`

**Syntax**

```python
class chdb.state.sqlitelike.Connection(connection_string: str)
```

---

#### `close` {#chdb-session-session-close}

Close the connection and cleanup resources.

This method closes the database connection and cleans up any associated
resources including active cursors. After calling this method, the
connection becomes invalid and cannot be used for further operations.

**Syntax**

```python
close() → None
```

:::note
This method is idempotent - calling it multiple times is safe.
:::

:::warning Warning
Any ongoing streaming queries will be cancelled when the connection
is closed. Ensure all important data is processed before closing.
:::

**Examples**

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

---

#### `cursor` {#chdb-state-sqlitelike-connection-cursor}

Create a [Cursor](#chdb-state-sqlitelike-cursor) object for executing queries.

This method creates a database cursor that provides the standard
DB-API 2.0 interface for executing queries and fetching results.
The cursor allows for fine-grained control over query execution
and result retrieval.

**Syntax**

```python
cursor() → Cursor
```

**Returns**

| Return Type  | Description                             |
|--------------|-----------------------------------------|
| `Cursor`     | A cursor object for database operations |

:::note
Creating a new cursor will replace any existing cursor associated
with this connection. Only one cursor per connection is supported.
:::

**Examples**

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

**See also**
- [`Cursor`](#chdb-state-sqlitelike-cursor) - Database cursor implementation

---

#### `query` {#chdb-state-sqlitelike-connection-query}

Execute a SQL query and return the complete results.

This method executes a SQL query synchronously and returns the complete
result set. It supports various output formats and automatically applies
format-specific post-processing.

**Syntax**

```python
query(query: str, format: str = 'CSV') → Any
```

**Parameters:**

| Parameter  | Type  | Default    | Description                                                                                                                                                                                                                                                                                   |
|------------|-------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `query`    | str   | *required* | SQL query string to execute                                                                                                                                                                                                                                                                   |
| `format`   | str   | `"CSV"`    | Output format for results. Supported formats:<br/>• `"CSV"` - Comma-separated values (string)<br/>• `"JSON"` - JSON format (string)<br/>• `"Arrow"` - Apache Arrow format (bytes)<br/>• `"Dataframe"` - Pandas DataFrame (requires pandas)<br/>• `"Arrowtable"` - PyArrow Table (requires pyarrow) |

**Returns**

| Return Type        | Description                    |
|--------------------|--------------------------------|
| `str`              | For string formats (CSV, JSON) |
| `bytes`            | For Arrow format               |
| `pandas.DataFrame` | For dataframe format           |
| `pyarrow.Table`    | For arrowtable format          |

**Raises**

| Exception      | Condition                                         |
|----------------|---------------------------------------------------|
| `RuntimeError` | If query execution fails                          |
| `ImportError`  | If required packages for format are not installed |

:::warning Warning
This method loads the entire result set into memory. For large
results, consider using [`send_query()`](#chdb-state-sqlitelike-connection-send_query) for streaming.
:::

**Examples**

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

**See also**
- [`send_query()`](#chdb-state-sqlitelike-connection-send_query) - For streaming query execution

---

#### `send_query` {#chdb-state-sqlitelike-connection-send_query}

Execute a SQL query and return a streaming result iterator.

This method executes a SQL query and returns a StreamingResult object
that allows you to iterate over the results without loading everything
into memory at once. This is ideal for processing large result sets.

**Syntax**

```python
send_query(query: str, format: str = 'CSV') → StreamingResult
```

**Parameters**

| Parameter  | Type  | Default    | Description                                                                                                                                                                                                                                                                  |
|------------|-------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `query`    | str   | *required* | SQL query string to execute                                                                                                                                                                                                                                                  |
| `format`   | str   | `"CSV"`    | Output format for results. Supported formats:<br/>• `"CSV"` - Comma-separated values<br/>• `"JSON"` - JSON format<br/>• `"Arrow"` - Apache Arrow format (enables record_batch() method)<br/>• `"dataframe"` - Pandas DataFrame chunks<br/>• `"arrowtable"` - PyArrow Table chunks |

**Returns**

| Return Type       | Description                                                                                                                                                                                                                              |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `StreamingResult` | A streaming iterator for query results that supports:<br/>• Iterator protocol (for loops)<br/>• Context manager protocol (with statements)<br/>• Manual fetching with fetch() method<br/>• PyArrow RecordBatch streaming (Arrow format only) |

**Raises**

| Exception      | Condition                                         |
|----------------|---------------------------------------------------|
| `RuntimeError` | If query execution fails                          |
| `ImportError`  | If required packages for format are not installed |

:::note
Only the “Arrow” format supports the `record_batch()` method on the returned StreamingResult.
:::

**Examples**

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

**See also**
- [`query()`](#chdb-state-sqlitelike-connection-query) - For non-streaming query execution
- `StreamingResult` - Streaming result iterator

---

### **class** `chdb.state.sqlitelike.Cursor` {#chdb-state-sqlitelike-cursor}

Bases: `object`

```python
class chdb.state.sqlitelike.Cursor(connection)
```

---

#### `close` {#cursor-close-none}

Close the cursor and cleanup resources.

This method closes the cursor and cleans up any associated resources.
After calling this method, the cursor becomes invalid and cannot be
used for further operations.

**Syntax**

```python
close() → None
```

:::note
This method is idempotent - calling it multiple times is safe.
The cursor is also automatically closed when the connection is closed.
:::

**Examples**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT 1")
>>> result = cursor.fetchone()
>>> cursor.close()  # Cleanup cursor resources
```

---

#### `column_names` {#chdb-state-sqlitelike-cursor-column_names}

Return a list of column names from the last executed query.

This method returns the column names from the most recently executed
SELECT query. The names are returned in the same order as they appear
in the result set.

**Syntax**

```python
column_names() → list
```

**Returns**

| Return Type  | Description                                                                                               |
|--------------|-----------------------------------------------------------------------------------------------------------|
| `list`       | List of column name strings, or empty list if no query has been executed or the query returned no columns |

**Examples**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name, email FROM users LIMIT 1")
>>> print(cursor.column_names())
['id', 'name', 'email']
```

**See also**
- [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - Get column type information
- [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0 column description

---

#### `column_types` {#chdb-state-sqlitelike-cursor-column_types}

Return a list of column types from the last executed query.

This method returns the ClickHouse column type names from the most
recently executed SELECT query. The types are returned in the same
order as they appear in the result set.

**Syntax**

```python
column_types() → list
```

**Returns**

| Return Type | Description |
|-------------|-------------|
| `list` | List of ClickHouse type name strings, or empty list if no query has been executed or the query returned no columns |

**Examples**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT toInt32(1), toString('hello')")
>>> print(cursor.column_types())
['Int32', 'String']
```

**See also**
- [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - Get column name information
- [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0 column description

---

#### `commit` {#commit}

Commit any pending transaction.

This method commits any pending database transaction. In ClickHouse,
most operations are auto-committed, but this method is provided for
DB-API 2.0 compatibility.

:::note
ClickHouse typically auto-commits operations, so explicit commits
are usually not necessary. This method is provided for compatibility
with standard DB-API 2.0 workflow.
:::

**Syntax**

```python
commit() → None
```

**Examples**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("INSERT INTO test VALUES (1, 'data')")
>>> cursor.commit()
```

---

#### `property description : list` {#chdb-state-sqlitelike-cursor-description}

Return column description as per DB-API 2.0 specification.

This property returns a list of 7-item tuples describing each column
in the result set of the last executed SELECT query. Each tuple contains:
(name, type_code, display_size, internal_size, precision, scale, null_ok)

Currently, only name and type_code are provided, with other fields set to None.

**Returns**

| Return Type | Description |
|-------------|-------------|
| `list` | List of 7-tuples describing each column, or empty list if no SELECT query has been executed |

:::note
This follows the DB-API 2.0 specification for cursor.description.
Only the first two elements (name and type_code) contain meaningful
data in this implementation.
:::

**Examples**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users LIMIT 1")
>>> for desc in cursor.description:
...     print(f"Column: {desc[0]}, Type: {desc[1]}")
Column: id, Type: Int32
Column: name, Type: String
```

**See also**
- [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - Get just column names
- [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - Get just column types

---

#### `execute` {#execute}

Execute a SQL query and prepare results for fetching.

This method executes a SQL query and prepares the results for retrieval
using the fetch methods. It handles the parsing of result data and
automatic type conversion for ClickHouse data types.

**Syntax**

```python
execute(query: str) → None
```

**Parameters:**

| Parameter  | Type  | Description                 |
|------------|-------|-----------------------------|
| `query`    | str   | SQL query string to execute |

**Raises**

| Exception | Condition |
|-----------|-----------|
| `Exception` | If query execution fails or result parsing fails |

:::note
This method follows DB-API 2.0 specifications for `cursor.execute()`.
After execution, use `fetchone()`, `fetchmany()`, or `fetchall()` to
retrieve results.
:::

:::note
The method automatically converts ClickHouse data types to appropriate
Python types:

- Int/UInt types → int
- Float types → float
- String/FixedString → str
- DateTime → datetime.datetime
- Date → datetime.date
- Bool → bool
:::

**Examples**

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

**See also**
- [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - Fetch single row
- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - Fetch multiple rows
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - Fetch all remaining rows

---

#### `fetchall` {#chdb-state-sqlitelike-cursor-fetchall}

Fetch all remaining rows from the query result.

This method retrieves all remaining rows from the current query result
set starting from the current cursor position. It returns a tuple of
row tuples with appropriate Python type conversion applied.

**Syntax**

```python
fetchall() → tuple
```

**Returns:**

| Return Type | Description |
|-------------|-------------|
| `tuple` | Tuple containing all remaining row tuples from the result set. Returns empty tuple if no rows are available |

:::warning Warning
This method loads all remaining rows into memory at once. For large
result sets, consider using [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) to process results
in batches.
:::

**Examples**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users")
>>> all_users = cursor.fetchall()
>>> for user_id, user_name in all_users:
...     print(f"User {user_id}: {user_name}")
```

**See also**
- [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - Fetch single row
- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - Fetch multiple rows in batches

---

#### `fetchmany` {#chdb-state-sqlitelike-cursor-fetchmany}

Fetch multiple rows from the query result.

This method retrieves up to ‘size’ rows from the current query result
set. It returns a tuple of row tuples, with each row containing column
values with appropriate Python type conversion.

**Syntax**

```python
fetchmany(size: int = 1) → tuple
```

**Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `size` | int | `1` | Maximum number of rows to fetch |

**Returns**

| Return Type | Description                                                                                     |
|-------------|-------------------------------------------------------------------------------------------------|
| `tuple`     | Tuple containing up to 'size' row tuples. May contain fewer rows if the result set is exhausted |

:::note
This method follows DB-API 2.0 specifications. It will return fewer
than ‘size’ rows if the result set is exhausted.
:::

**Examples**

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

**See also**
- [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - Fetch single row
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - Fetch all remaining rows

---

#### `fetchone` {#chdb-state-sqlitelike-cursor-fetchone}

Fetch the next row from the query result.

This method retrieves the next available row from the current query
result set. It returns a tuple containing the column values with
appropriate Python type conversion applied.

**Syntax** 

```python
fetchone() → tuple | None
```

**Returns:**

| Return Type       | Description                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| `Optional[tuple]` | Next row as a tuple of column values, or None if no more rows are available |

:::note
This method follows DB-API 2.0 specifications. Column values are
automatically converted to appropriate Python types based on
ClickHouse column types.
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

**See also**
- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - Fetch multiple rows
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - Fetch all remaining rows

---

### `chdb.state.sqlitelike` {#state-sqlitelike-to_arrowtable}

Convert query result to PyArrow Table.

This function converts chdb query results to a PyArrow Table format,
which provides efficient columnar data access and interoperability
with other data processing libraries.

**Syntax**

```python
chdb.state.sqlitelike.to_arrowTable(res)
```

**Parameters:**

| Parameter  | Type  | Description                                                |
|------------|-------|------------------------------------------------------------|
| `res`      | -     | Query result object from chdb containing Arrow format data |

**Returns**

| Return Type     | Description                                |
|-----------------|--------------------------------------------|
| `pyarrow.Table` | PyArrow Table containing the query results |

**Raises**

| Exception     | Condition                                       |
|---------------|-------------------------------------------------|
| `ImportError` | If pyarrow or pandas packages are not installed |

:::note
This function requires both pyarrow and pandas to be installed.
Install them with: `pip install pyarrow pandas`
:::

:::warning Warning
Empty results return an empty PyArrow Table with no schema.
:::

**Examples**

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

Convert query result to Pandas DataFrame.

This function converts chdb query results to a Pandas DataFrame format
by first converting to PyArrow Table and then to DataFrame. This provides
convenient data analysis capabilities with Pandas API.

**Syntax**

```python
chdb.state.sqlitelike.to_df(r)
```

**Parameters:**

| Parameter  | Type  | Description                                                |
|------------|-------|------------------------------------------------------------|
| `r`        | -     | Query result object from chdb containing Arrow format data |

**Returns:**

| Return Type        | Description                                                                         |
|--------------------|-------------------------------------------------------------------------------------|
| `pandas.DataFrame` | DataFrame containing the query results with appropriate column names and data types |

**Raises**

| Exception     | Condition                                       |
|---------------|-------------------------------------------------|
| `ImportError` | If pyarrow or pandas packages are not installed |

:::note
This function uses multi-threading for the Arrow to Pandas conversion
to improve performance on large datasets.
:::

**See also**
- [`to_arrowTable()`](#chdb-state-sqlitelike-to_arrowtable) - For PyArrow Table format conversion

**Examples**

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

## DataFrame Integration {#dataframe-integration}

### **class** `chdb.dataframe.Table` {#chdb-dataframe-table}

Bases:

```python
class chdb.dataframe.Table(*args: Any, **kwargs: Any)
```

## Database API (DBAPI) 2.0 Interface {#database-api-interface}

chDB provides a Python DB-API 2.0 compatible interface for database connectivity, allowing you to use chDB with tools and frameworks that expect standard database interfaces.

The chDB DB-API 2.0 interface includes:

- **Connections**: Database connection management with connection strings
- **Cursors**: Query execution and result retrieval
- **Type System**: DB-API 2.0 compliant type constants and converters
- **Error Handling**: Standard database exception hierarchy
- **Thread Safety**: Level 1 thread safety (threads may share modules but not connections)

---

### Core Functions {#core-functions}

The Database API (DBAPI) 2.0 Interface implements the following core functions:

#### `chdb.dbapi.connect` {#dbapi-connect}

Initialize a new database connection.

**Syntax**

```python
chdb.dbapi.connect(*args, **kwargs)
```

**Parameters**

| Parameter  | Type  | Default  | Description                                     |
|------------|-------|----------|-------------------------------------------------|
| `path`     | str   | `None`   | Database file path. None for in-memory database |

**Raises**

| Exception                            | Condition                           |
|--------------------------------------|-------------------------------------|
| [`err.Error`](#chdb-dbapi-err-error) | If connection cannot be established |

---

#### `chdb.dbapi.get_client_info()` {#dbapi-get-client-info}

Get client version information.

Returns the chDB client version as a string for MySQLdb compatibility.

**Syntax**

```python
chdb.dbapi.get_client_info()
```

**Returns**

| Return Type  | Description                                  |
|--------------|----------------------------------------------|
| `str`        | Version string in format 'major.minor.patch' |

---

### Type constructors {#type-constructors}

#### `chdb.dbapi.Binary(x)` {#dbapi-binary}

Return x as a binary type.

This function converts the input to bytes type for use with binary
database fields, following the DB-API 2.0 specification.

**Syntax**

```python
chdb.dbapi.Binary(x)
```

**Parameters**

| Parameter  | Type  | Description                     |
|------------|-------|---------------------------------|
| `x`        | -     | Input data to convert to binary |

**Returns**

| Return Type  | Description                  |
|--------------|------------------------------|
| `bytes`      | The input converted to bytes |

---

### Connection Class {#connection-class}

#### **class** `chdb.dbapi.connections.Connection(path=None)` {#chdb-dbapi-connections-connection}

Bases: `object`

DB-API 2.0 compliant connection to chDB database.

This class provides a standard DB-API interface for connecting to and interacting
with chDB databases. It supports both in-memory and file-based databases.

The connection manages the underlying chDB engine and provides methods for
executing queries, managing transactions (no-op for ClickHouse), and creating cursors.

```python
class chdb.dbapi.connections.Connection(path=None)
```

**Parameters**

| Parameter  | Type  | Default  | Description                                                                                                        |
|------------|-------|----------|--------------------------------------------------------------------------------------------------------------------|
| `path`     | str   | `None`   | Database file path. If None, uses in-memory database. Can be a file path like 'database.db' or None for ':memory:' |

**Variables**

| Variable   | Type  | Description                                        |
|------------|-------|----------------------------------------------------|
| `encoding` | str   | Character encoding for queries, defaults to 'utf8' |
| `open`     | bool  | True if connection is open, False if closed        |

**Examples**

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
ClickHouse does not support traditional transactions, so commit() and rollback()
operations are no-ops but provided for DB-API compliance.
:::

---

#### `close` {#dbapi-connection-close}

Close the database connection.

Closes the underlying chDB connection and marks this connection as closed.
Subsequent operations on this connection will raise an Error.

**Syntax**

```python
close()
```

**Raises**

| Exception                            | Condition                       |
|--------------------------------------|---------------------------------|
| [`err.Error`](#chdb-dbapi-err-error) | If connection is already closed |

---

#### `commit` {#dbapi-commit}

Commit the current transaction.

**Syntax**

```python
commit()
```

:::note
This is a no-op for chDB/ClickHouse as it doesn’t support traditional
transactions. Provided for DB-API 2.0 compliance.
:::

---

#### `cursor` {#dbapi-cursor}

Create a new cursor for executing queries.

**Syntax**

```python
cursor(cursor=None)
```

**Parameters**

| Parameter  | Type  | Description                         |
|------------|-------|-------------------------------------|
| `cursor`   | -     | Ignored, provided for compatibility |

**Returns**

| Return Type  | Description                           |
|--------------|---------------------------------------|
| `Cursor`     | New cursor object for this connection |

**Raises**

| Exception                            | Condition               |
|--------------------------------------|-------------------------|
| [`err.Error`](#chdb-dbapi-err-error) | If connection is closed |

**Example**

```pycon
>>> conn = Connection()
>>> cur = conn.cursor()
>>> cur.execute("SELECT 1")
>>> result = cur.fetchone()
```

---

#### `escape` {#escape}

Escape a value for safe inclusion in SQL queries.

**Syntax**

```python
escape(obj, mapping=None)
```

**Parameters**

| Parameter  | Type  | Description                                   |
|------------|-------|-----------------------------------------------|
| `obj`      | -     | Value to escape (string, bytes, number, etc.) |
| `mapping`  | -     | Optional character mapping for escaping       |

**Returns**

| Return Type  | Description                                           |
|--------------|-------------------------------------------------------|
| -            | Escaped version of the input suitable for SQL queries |

**Example**

```pycon
>>> conn = Connection()
>>> safe_value = conn.escape("O'Reilly")
>>> query = f"SELECT * FROM users WHERE name = {safe_value}"
```

---

#### `escape_string` {#escape-string}

Escape a string value for SQL queries.

**Syntax**

```python
escape_string(s)
```

**Parameters**

| Parameter  | Type  | Description      |
|------------|-------|------------------|
| `s`        | str   | String to escape |

**Returns**

| Return Type  | Description                           |
|--------------|---------------------------------------|
| `str`        | Escaped string safe for SQL inclusion |

---

#### `property open` {#property-open}

Check if the connection is open.

**Returns**

| Return Type  | Description                                 |
|--------------|---------------------------------------------|
| `bool`       | True if connection is open, False if closed |

---

#### `query` {#dbapi-query}

Execute a SQL query directly and return raw results.

This method bypasses the cursor interface and executes queries directly.
For standard DB-API usage, prefer using cursor() method.

**Syntax**

```python
query(sql, fmt='CSV')
```

**Parameters:**

| Parameter  | Type         | Default    | Description                                                                      |
|------------|--------------|------------|----------------------------------------------------------------------------------|
| `sql`      | str or bytes | *required* | SQL query to execute                                                             |
| `fmt`      | str          | `"CSV"`    | Output format. Supported formats include "CSV", "JSON", "Arrow", "Parquet", etc. |

**Returns**

| Return Type  | Description                          |
|--------------|--------------------------------------|
| -            | Query result in the specified format |

**Raises**

| Exception                                              | Condition                              |
|--------------------------------------------------------|----------------------------------------|
| [`err.InterfaceError`](#chdb-dbapi-err-interfaceerror) | If connection is closed or query fails |

**Example**

```pycon
>>> conn = Connection()
>>> result = conn.query("SELECT 1, 'hello'", "CSV")
>>> print(result)
"1,hello\n"
```

---

#### `property resp` {#property-resp}

Get the last query response.

**Returns**

| Return Type  | Description                                 |
|--------------|---------------------------------------------|
| -            | The raw response from the last query() call |

:::note
This property is updated each time query() is called directly.
It does not reflect queries executed through cursors.
:::

---

#### `rollback` {#rollback}

Roll back the current transaction.

**Syntax**

```python
rollback()
```

:::note
This is a no-op for chDB/ClickHouse as it doesn’t support traditional
transactions. Provided for DB-API 2.0 compliance.
:::

---

### Cursor Class {#cursor-class}

#### **class** `chdb.dbapi.cursors.Cursor` {#chdb-dbapi-cursors-cursor}

Bases: `object`

DB-API 2.0 cursor for executing queries and fetching results.

The cursor provides methods for executing SQL statements, managing query results,
and navigating through result sets. It supports parameter binding, bulk operations,
and follows DB-API 2.0 specifications.

Do not create Cursor instances directly. Use `Connection.cursor()` instead.

```python
class chdb.dbapi.cursors.Cursor(connection)
```

| Variable          | Type  | Description                                                 |
|-------------------|-------|-------------------------------------------------------------|
| `description`     | tuple | Column metadata for the last query result                   |
| `rowcount`        | int   | Number of rows affected by the last query (-1 if unknown)   |
| `arraysize`       | int   | Default number of rows to fetch at once (default: 1)        |
| `lastrowid`       | -     | ID of the last inserted row (if applicable)                 |
| `max_stmt_length` | int   | Maximum statement size for executemany() (default: 1024000) |

**Examples**

```pycon
>>> conn = Connection()
>>> cur = conn.cursor()
>>> cur.execute("SELECT 1 as id, 'test' as name")
>>> result = cur.fetchone()
>>> print(result)  # (1, 'test')
>>> cur.close()
```

:::note
See [DB-API 2.0 Cursor Objects](https://www.python.org/dev/peps/pep-0249/#cursor-objects)
for complete specification details.
:::

---

#### `callproc` {#callproc}

Execute a stored procedure (placeholder implementation).

**Syntax**

```python
callproc(procname, args=())
```

**Parameters**

| Parameter  | Type     | Description                         |
|------------|----------|-------------------------------------|
| `procname` | str      | Name of stored procedure to execute |
| `args`     | sequence | Parameters to pass to the procedure |

**Returns**

| Return Type  | Description                              |
|--------------|------------------------------------------|
| `sequence`   | The original args parameter (unmodified) |

:::note
chDB/ClickHouse does not support stored procedures in the traditional sense.
This method is provided for DB-API 2.0 compliance but does not perform
any actual operation. Use execute() for all SQL operations.
:::

:::warning Compatibility
This is a placeholder implementation. Traditional stored procedure
features like OUT/INOUT parameters, multiple result sets, and server
variables are not supported by the underlying ClickHouse engine.
:::

---

#### `close` {#dbapi-cursor-close}

Close the cursor and free associated resources.

After closing, the cursor becomes unusable and any operation will raise an exception.
Closing a cursor exhausts all remaining data and releases the underlying cursor.

**Syntax**

```python
close()
```

---

#### `execute` {#dbapi-execute}

Execute a SQL query with optional parameter binding.

This method executes a single SQL statement with optional parameter substitution.
It supports multiple parameter placeholder styles for flexibility.

**Syntax**

```python
execute(query, args=None)
```

**Parameters**

| Parameter  | Type            | Default    | Description                        |
|------------|-----------------|------------|------------------------------------|
| `query`    | str             | *required* | SQL query to execute               |
| `args`     | tuple/list/dict | `None`     | Parameters to bind to placeholders |

**Returns**

| Return Type  | Description                             |
|--------------|-----------------------------------------|
| `int`        | Number of affected rows (-1 if unknown) |

**Parameter Styles**

| Style               | Example                                         |
|---------------------|-------------------------------------------------|
| Question mark style | `"SELECT * FROM users WHERE id = ?"`            |
| Named style         | `"SELECT * FROM users WHERE name = %(name)s"`   |
| Format style        | `"SELECT * FROM users WHERE age = %s"` (legacy) |

**Examples**

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

**Raises**

| Exception                                              | Condition                                 |
|--------------------------------------------------------|-------------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | If cursor is closed or query is malformed |
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror)     | If database error occurs during execution |

---

#### `executemany(query, args)` {#chdb-dbapi-cursors-cursor-executemany}

Execute a query multiple times with different parameter sets.

This method efficiently executes the same SQL query multiple times with
different parameter values. It’s particularly useful for bulk INSERT operations.

**Syntax**

```python
executemany(query, args)
```

**Parameters**

| Parameter  | Type     | Description                                                 |
|------------|----------|-------------------------------------------------------------|
| `query`    | str      | SQL query to execute multiple times                         |
| `args`     | sequence | Sequence of parameter tuples/dicts/lists for each execution |

**Returns**

| Return Type  | Description                                         |
|--------------|-----------------------------------------------------|
| `int`        | Total number of affected rows across all executions |

**Examples**

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
This method improves performance for multiple-row INSERT and UPDATE operations
by optimizing the query execution process.
:::

---

#### `fetchall()` {#dbapi-fetchall}

Fetch all remaining rows from the query result.

**Syntax**

```python
fetchall()
```

**Returns**

| Return Type  | Description                                    |
|--------------|------------------------------------------------|
| `list`       | List of tuples representing all remaining rows |

**Raises**

| Exception                                              | Condition                              |
|--------------------------------------------------------|----------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | If execute() has not been called first |

:::warning Warning
This method can consume large amounts of memory for big result sets.
Consider using `fetchmany()` for large datasets.
:::

**Example**

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> all_rows = cursor.fetchall()
>>> print(len(all_rows))  # Number of total rows
```

---

#### `fetchmany` {#dbapi-fetchmany}

Fetch multiple rows from the query result.

**Syntax**

```python
fetchmany(size=1)
```

**Parameters**

| Parameter  | Type  | Default  | Description                                                      |
|------------|-------|----------|------------------------------------------------------------------|
| `size`     | int   | `1`      | Number of rows to fetch. If not specified, uses cursor.arraysize |

**Returns**

| Return Type  | Description                                  |
|--------------|----------------------------------------------|
| `list`       | List of tuples representing the fetched rows |

**Raises**

| Exception                                              | Condition                              |
|--------------------------------------------------------|----------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | If execute() has not been called first |

**Example**

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> rows = cursor.fetchmany(3)
>>> print(rows)  # [(1, 'Alice'), (2, 'Bob'), (3, 'Charlie')]
```

---

#### `fetchone` {#dbapi-fetchone}

Fetch the next row from the query result.

**Syntax**

```python
fetchone()
```

**Returns**

| Return Type     | Description                                            |
|-----------------|--------------------------------------------------------|
| `tuple or None` | Next row as a tuple, or None if no more rows available |

**Raises**

| Exception                                              | Condition                              |
|--------------------------------------------------------|----------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | If `execute()` has not been called first |

**Example**

```pycon
>>> cursor.execute("SELECT id, name FROM users LIMIT 3")
>>> row = cursor.fetchone()
>>> print(row)  # (1, 'Alice')
>>> row = cursor.fetchone()
>>> print(row)  # (2, 'Bob')
```

---

#### `max_stmt_length = 1024000` {#max-stmt-length}

Max statement size which [`executemany()`](#chdb-dbapi-cursors-cursor-executemany) generates.

Default value is 1024000.

---

#### `mogrify` {#mogrify}

Return the exact query string that would be sent to the database.

This method shows the final SQL query after parameter substitution,
which is useful for debugging and logging purposes.

**Syntax**

```python
mogrify(query, args=None)
```

**Parameters**

| Parameter  | Type            | Default    | Description                           |
|------------|-----------------|------------|---------------------------------------|
| `query`    | str             | *required* | SQL query with parameter placeholders |
| `args`     | tuple/list/dict | `None`     | Parameters to substitute              |

**Returns**

| Return Type  | Description                                            |
|--------------|--------------------------------------------------------|
| `str`        | The final SQL query string with parameters substituted |

**Example**

```pycon
>>> cur.mogrify("SELECT * FROM users WHERE id = ?", (123,))
"SELECT * FROM users WHERE id = 123"
```

:::note
This method follows the extension to DB-API 2.0 used by Psycopg.
:::

---

#### `nextset` {#nextset}

Move to the next result set (not supported).

**Syntax**

```python
nextset()
```

**Returns**

| Return Type  | Description                                                   |
|--------------|---------------------------------------------------------------|
| `None`       | Always returns None as multiple result sets are not supported |

:::note
chDB/ClickHouse does not support multiple result sets from a single query.
This method is provided for DB-API 2.0 compliance but always returns None.
:::

---

#### `setinputsizes` {#setinputsizes}

Set input sizes for parameters (no-op implementation).

**Syntax**

```python
setinputsizes(*args)
```

**Parameters**

| Parameter  | Type  | Description                             |
|------------|-------|-----------------------------------------|
| `*args`    | -     | Parameter size specifications (ignored) |

:::note
This method does nothing but is required by DB-API 2.0 specification.
chDB automatically handles parameter sizing internally.
:::

---

#### `setoutputsizes` {#setoutputsizes}

Set output column sizes (no-op implementation).

**Syntax**

```python
setoutputsizes(*args)
```

**Parameters**

| Parameter  | Type  | Description                          |
|------------|-------|--------------------------------------|
| `*args`    | -     | Column size specifications (ignored) |

:::note
This method does nothing but is required by DB-API 2.0 specification.
chDB automatically handles output sizing internally.
:::

---

### Error Classes {#error-classes}

Exception classes for chdb database operations.

This module provides a complete hierarchy of exception classes for handling
database-related errors in chdb, following the Python Database API Specification v2.0.

The exception hierarchy is structured as follows:

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

Each exception class represents a specific category of database errors:

| Exception           | Description                                                 |
|---------------------|-------------------------------------------------------------|
| `Warning`           | Non-fatal warnings during database operations               |
| `InterfaceError`    | Problems with the database interface itself                 |
| `DatabaseError`     | Base class for all database-related errors                  |
| `DataError`         | Problems with data processing (invalid values, type errors) |
| `OperationalError`  | Database operational issues (connectivity, resources)       |
| `IntegrityError`    | Constraint violations (foreign keys, uniqueness)            |
| `InternalError`     | Database internal errors and corruption                     |
| `ProgrammingError`  | SQL syntax errors and API misuse                            |
| `NotSupportedError` | Unsupported features or operations                          |

:::note
These exception classes are compliant with Python DB API 2.0 specification
and provide consistent error handling across different database operations.
:::

**See also**
- [Python Database API Specification v2.0](https://peps.python.org/pep-0249/)
- `chdb.dbapi.connections` - Database connection management
- `chdb.dbapi.cursors` - Database cursor operations

**Examples**

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

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

Exception raised for errors that are due to problems with the processed data.

This exception is raised when database operations fail due to issues with
the data being processed, such as:

- Division by zero operations
- Numeric values out of range
- Invalid date/time values
- String truncation errors
- Type conversion failures
- Invalid data format for column type

**Raises**

| Exception | Condition |
|-----------|-----------|
| [`DataError`](#chdb-dbapi-err-dataerror) | When data validation or processing fails |

**Examples**

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

Bases: [`Error`](#chdb-dbapi-err-error)

Exception raised for errors that are related to the database.

This is the base class for all database-related errors. It encompasses
all errors that occur during database operations and are related to the
database itself rather than the interface.

Common scenarios include:

- SQL execution errors
- Database connectivity issues
- Transaction-related problems
- Database-specific constraints violations

:::note
This serves as the parent class for more specific database error types
such as [`DataError`](#chdb-dbapi-err-dataerror), [`OperationalError`](#chdb-dbapi-err-operationalerror), etc.
:::

---

#### **exception** `chdb.dbapi.err.Error` {#chdb-dbapi-err-error}

Bases: [`StandardError`](#chdb-dbapi-err-standarderror)

Exception that is the base class of all other error exceptions (not Warning).

This is the base class for all error exceptions in chdb, excluding warnings.
It serves as the parent class for all database error conditions that prevent
successful completion of operations.

:::note
This exception hierarchy follows the Python DB API 2.0 specification.
:::

**See also**
- [`Warning`](#chdb-dbapi-err-warning) - For non-fatal warnings that don’t prevent operation completion

#### **exception** `chdb.dbapi.err.IntegrityError` {#chdb-dbapi-err-integrityerror}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

Exception raised when the relational integrity of the database is affected.

This exception is raised when database operations violate integrity constraints,
including:

- Foreign key constraint violations
- Primary key or unique constraint violations (duplicate keys)
- Check constraint violations
- NOT NULL constraint violations
- Referential integrity violations

**Raises**

| Exception                                          | Condition                                        |
|----------------------------------------------------|--------------------------------------------------|
| [`IntegrityError`](#chdb-dbapi-err-integrityerror) | When database integrity constraints are violated |

**Examples**

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

Exception raised for errors that are related to the database interface rather than the database itself.

This exception is raised when there are problems with the database interface
implementation, such as:

- Invalid connection parameters
- API misuse (calling methods on closed connections)
- Interface-level protocol errors
- Module import or initialization failures

**Raises**

| Exception                                          | Condition                                                                  |
|----------------------------------------------------|----------------------------------------------------------------------------|
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror) | When database interface encounters errors unrelated to database operations |

:::note
These errors are typically programming errors or configuration issues
that can be resolved by fixing the client code or configuration.
:::

---

#### **exception** `chdb.dbapi.err.InternalError` {#chdb-dbapi-err-internalerror}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

Exception raised when the database encounters an internal error.

This exception is raised when the database system encounters internal
errors that are not caused by the application, such as:

- Invalid cursor state (cursor is not valid anymore)
- Transaction state inconsistencies (transaction is out of sync)
- Database corruption issues
- Internal data structure corruption
- System-level database errors

**Raises**

| Exception | Condition |
|-----------|-----------|
| [`InternalError`](#chdb-dbapi-err-internalerror) | When database encounters internal inconsistencies |

:::warning Warning
Internal errors may indicate serious database problems that require
database administrator attention. These errors are typically not
recoverable through application-level retry logic.
:::

:::note
These errors are generally outside the control of the application
and may require database restart or repair operations.
:::

---

#### **exception** `chdb.dbapi.err.NotSupportedError` {#chdb-dbapi-err-notsupportederror}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

Exception raised when a method or database API is not supported.

This exception is raised when the application attempts to use database
features or API methods that are not supported by the current database
configuration or version, such as:

- Requesting `rollback()` on connections without transaction support
- Using advanced SQL features not supported by the database version
- Calling methods not implemented by the current driver
- Attempting to use disabled database features

**Raises**

| Exception                                                | Condition                                       |
|----------------------------------------------------------|-------------------------------------------------|
| [`NotSupportedError`](#chdb-dbapi-err-notsupportederror) | When unsupported database features are accessed |

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
Check database documentation and driver capabilities to avoid
these errors. Consider graceful fallbacks where possible.
:::

---

#### **exception** `chdb.dbapi.err.OperationalError` {#chdb-dbapi-err-operationalerror}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

Exception raised for errors that are related to the database’s operation.

This exception is raised for errors that occur during database operation
and are not necessarily under the control of the programmer, including:

- Unexpected disconnection from database
- Database server not found or unreachable
- Transaction processing failures
- Memory allocation errors during processing
- Disk space or resource exhaustion
- Database server internal errors
- Authentication or authorization failures

**Raises**

| Exception                                              | Condition                                               |
|--------------------------------------------------------|---------------------------------------------------------|
| [`OperationalError`](#chdb-dbapi-err-operationalerror) | When database operations fail due to operational issues |

:::note
These errors are typically transient and may be resolved by retrying
the operation or addressing system-level issues.
:::

:::warning Warning
Some operational errors may indicate serious system problems that
require administrative intervention.
:::

---

#### **exception** `chdb.dbapi.err.ProgrammingError` {#chdb-dbapi-err-programmingerror}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

Exception raised for programming errors in database operations.

This exception is raised when there are programming errors in the
application’s database usage, including:

- Table or column not found
- Table or index already exists when creating
- SQL syntax errors in statements
- Wrong number of parameters specified in prepared statements
- Invalid SQL operations (e.g., DROP on non-existent objects)
- Incorrect usage of database API methods

**Raises**

| Exception                                              | Condition                                        |
|--------------------------------------------------------|--------------------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | When SQL statements or API usage contains errors |

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

---

#### **exception** `chdb.dbapi.err.StandardError` {#chdb-dbapi-err-standarderror}

Bases: `Exception`

Exception related to operation with chdb.

This is the base class for all chdb-related exceptions. It inherits from
Python’s built-in Exception class and serves as the root of the exception
hierarchy for database operations.

:::note
This exception class follows the Python DB API 2.0 specification
for database exception handling.
:::

---

#### **exception** `chdb.dbapi.err.Warning` {#chdb-dbapi-err-warning}

Bases: [`StandardError`](#chdb-dbapi-err-standarderror)

Exception raised for important warnings like data truncations while inserting, etc.

This exception is raised when the database operation completes but with
important warnings that should be brought to the attention of the application.
Common scenarios include:

- Data truncation during insertion
- Precision loss in numeric conversions
- Character set conversion warnings

:::note
This follows the Python DB API 2.0 specification for warning exceptions.
:::

---

### Module Constants {#module-constants}

#### `chdb.dbapi.apilevel = '2.0'` {#apilevel}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

Create a new string object from the given object. If encoding or
errors is specified, then the object must expose a data buffer
that will be decoded using the given encoding and error handler.
Otherwise, returns the result of `object._\_str_\_()` (if defined)
or `repr(object)`.

- encoding defaults to ‘utf-8’.
- errors defaults to ‘strict’.

---

#### `chdb.dbapi.threadsafety = 1` {#threadsafety}

```python
int([x]) -> integer
int(x, base=10) -> integer
```

Convert a number or string to an integer, or return 0 if no arguments
are given.  If x is a number, return x._\_int_\_().  For floating-point
numbers, this truncates towards zero.

If x is not a number or if base is given, then x must be a string,
bytes, or bytearray instance representing an integer literal in the
given base.  The literal can be preceded by ‘+’ or ‘-’ and be surrounded
by whitespace.  The base defaults to 10.  Valid bases are 0 and 2-36.
Base 0 means to interpret the base from the string as an integer literal.

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

Create a new string object from the given object. If encoding or
errors is specified, then the object must expose a data buffer
that will be decoded using the given encoding and error handler.
Otherwise, returns the result of object._\_str_\_() (if defined)
or repr(object).
encoding defaults to ‘utf-8’.
errors defaults to ‘strict’.

---

### Type Constants {#type-constants}

#### `chdb.dbapi.STRING = frozenset({247, 253, 254})` {#string-type}

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

**Examples**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---

#### `chdb.dbapi.ROWID = frozenset({})` {#rowid-type}

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

**Usage Examples**

Basic Query Example:

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

Working with Data:

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

Connection Management:

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

**Best Practices**

1. **Connection Management**: Always close connections and cursors when done
2. **Context Managers**: Use `with` statements for automatic cleanup
3. **Batch Processing**: Use `fetchmany()` for large result sets
4. **Error Handling**: Wrap database operations in try-except blocks
5. **Parameter Binding**: Use parameterized queries when possible
6. **Memory Management**: Avoid `fetchall()` for very large datasets

:::note
- chDB’s DB-API 2.0 interface is compatible with most Python database tools
- The interface provides Level 1 thread safety (threads may share modules but not connections)
- Connection strings support the same parameters as chDB sessions
- All standard DB-API 2.0 exceptions are supported
:::

:::warning Warning
- Always close cursors and connections to avoid resource leaks
- Large result sets should be processed in batches
- Parameter binding syntax follows format style: `%s`
:::

## User-Defined Functions (UDF) {#user-defined-functions}

User-defined functions module for chDB.

This module provides functionality for creating and managing user-defined functions (UDFs)
in chDB. It allows you to extend chDB’s capabilities by writing custom Python functions
that can be called from SQL queries.

### `chdb.udf.chdb_udf` {#chdb-udf}

Decorator for chDB Python UDF(User Defined Function).

**Syntax**

```python
chdb.udf.chdb_udf(return_type='String')
```

**Parameters**

| Parameter     | Type  | Default    | Description                                                             |
|---------------|-------|------------|-------------------------------------------------------------------------|
| `return_type` | str   | `"String"` | Return type of the function. Should be one of the ClickHouse data types |

**Notes**

1. The function should be stateless. Only UDFs are supported, not UDAFs.
2. Default return type is String. The return type should be one of the ClickHouse data types.
3. The function should take in arguments of type String. All arguments are strings.
4. The function will be called for each line of input.
5. The function should be pure python function. Import all modules used IN THE FUNCTION.
6. Python interpreter used is the same as the one used to run the script.

**Example**

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

Generate UDF configuration and executable script files.

This function creates the necessary files for a User Defined Function (UDF) in chDB:
1. A Python executable script that processes input data
2. An XML configuration file that registers the UDF with ClickHouse

**Syntax**

```python
chdb.udf.generate_udf(func_name, args, return_type, udf_body)
```

**Parameters**

| Parameter     | Type  | Description                                 |
|---------------|-------|---------------------------------------------|
| `func_name`   | str   | Name of the UDF function                    |
| `args`        | list  | List of argument names for the function     |
| `return_type` | str   | ClickHouse return type for the function     |
| `udf_body`    | str   | Python source code body of the UDF function |

:::note
This function is typically called by the @chdb_udf decorator and should not
be called directly by users.
:::

---

## Utilities {#utilities}

Utility functions and helpers for chDB.

This module contains various utility functions for working with chDB, including
data type inference, data conversion helpers, and debugging utilities.

---

### `chdb.utils.convert_to_columnar` {#convert-to-columnar}

Converts a list of dictionaries into a columnar format.

This function takes a list of dictionaries and converts it into a dictionary
where each key corresponds to a column and each value is a list of column values.
Missing values in the dictionaries are represented as None.

**Syntax**

```python
chdb.utils.convert_to_columnar(items: List[Dict[str, Any]]) → Dict[str, List[Any]]
```

**Parameters**

| Parameter  | Type                   | Description                       |
|------------|------------------------|-----------------------------------|
| `items`    | `List[Dict[str, Any]]` | A list of dictionaries to convert |

**Returns**

| Return Type            | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| `Dict[str, List[Any]]` | A dictionary with keys as column names and values as lists of column values |

**Example**

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

Flattens a nested dictionary.

This function takes a nested dictionary and flattens it, concatenating nested keys
with a separator. Lists of dictionaries are serialized to JSON strings.

**Syntax**

```python
chdb.utils.flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '_') → Dict[str, Any]
```

**Parameters**

| Parameter    | Type             | Default    | Description                                    |
|--------------|------------------|------------|------------------------------------------------|
| `d`          | `Dict[str, Any]` | *required* | The dictionary to flatten                      |
| `parent_key` | str              | `""`       | The base key to prepend to each key            |
| `sep`        | str              | `"_"`      | The separator to use between concatenated keys |

**Returns**

| Return Type      | Description            |
|------------------|------------------------|
| `Dict[str, Any]` | A flattened dictionary |

**Example**

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

Infers the most suitable data type for a list of values.

This function examines a list of values and determines the most appropriate
data type that can represent all the values in the list. It considers integer,
unsigned integer, decimal, and float types, and defaults to “string” if the
values cannot be represented by any numeric type or if all values are None.

**Syntax**

```python
chdb.utils.infer_data_type(values: List[Any]) → str
```

**Parameters**

| Parameter  | Type        | Description                                                |
|------------|-------------|------------------------------------------------------------|
| `values`   | `List[Any]` | A list of values to analyze. The values can be of any type |

**Returns**

| Return Type | Description                                                                                                                                                                                                                                                 |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `str`       | A string representing the inferred data type. Possible return values are: ”int8”, “int16”, “int32”, “int64”, “int128”, “int256”, “uint8”, “uint16”,“uint32”, “uint64”, “uint128”, “uint256”, “decimal128”, “decimal256”, “float32”, “float64”, or “string”. | 

:::note
- If all values in the list are None, the function returns “string”.
- If any value in the list is a string, the function immediately returns “string”.
- The function assumes that numeric values can be represented as integers,
  decimals, or floats based on their range and precision.
:::

---

### `chdb.utils.infer_data_types` {#infer-data-types}

Infers data types for each column in a columnar data structure.

This function analyzes the values in each column and infers the most suitable
data type for each column, based on a sample of the data.

**Syntax**

```python
chdb.utils.infer_data_types`(column_data: Dict[str, List[Any]], n_rows: int = 10000) → List[tuple]
```

**Parameters**

| Parameter     | Type                   | Default    | Description                                                                    |
|---------------|------------------------|------------|--------------------------------------------------------------------------------|
| `column_data` | `Dict[str, List[Any]]` | *required* | A dictionary where keys are column names and values are lists of column values |
| `n_rows`      | int                    | `10000`    | The number of rows to sample for type inference                                |

**Returns**

| Return Type   | Description                                                                |
|---------------|----------------------------------------------------------------------------|
| `List[tuple]` | A list of tuples, each containing a column name and its inferred data type |

## Abstract Base Classes {#abstract-base-classes}

### **class** `chdb.rwabc.PyReader`(data: Any)` {#pyreader}

Bases: `ABC`

```python
class chdb.rwabc.PyReader(data: Any)
```

---

#### **abstractmethod** `read` {#read}

Read a specified number of rows from the given columns and return a list of objects,
where each object is a sequence of values for a column.

```python
abstractmethod (col_names: List[str], count: int) → List[Any]
```

**Parameters**

| Parameter   | Type        | Description                    |
|-------------|-------------|--------------------------------|
| `col_names` | `List[str]` | List of column names to read   |
| `count`     | int         | Maximum number of rows to read |

**Returns**

| Return Type  | Description                            |
|--------------|----------------------------------------|
| `List[Any]`  | List of sequences, one for each column |

### **class** `chdb.rwabc.PyWriter` {#pywriter}

Bases: `ABC`

```python
class chdb.rwabc.PyWriter(col_names: List[str], types: List[type], data: Any)
```

---

#### **abstractmethod** finalize {#finalize}

Assemble and return the final data from blocks. Must be implemented by subclasses.

```python
abstractmethod finalize() → bytes
```

**Returns**

| Return Type  | Description               |
|--------------|---------------------------|
| `bytes`      | The final serialized data |

---

#### **abstractmethod** `write` {#write}

Save columns of data to blocks. Must be implemented by subclasses.

```python
abstractmethod write(col_names: List[str], columns: List[List[Any]]) → None
```

**Parameters**

| Parameter   | Type              | Description                                                |
|-------------|-------------------|------------------------------------------------------------|
| `col_names` | `List[str]`       | List of column names that are being written                |
| `columns`   | `List[List[Any]]` | List of columns data, each column is represented by a list |

## Exception Handling {#exception-handling}

### **class** `chdb.ChdbError` {#chdberror}

Bases: `Exception`

Base exception class for chDB-related errors.

This exception is raised when chDB query execution fails or encounters
an error. It inherits from the standard Python Exception class and
provides error information from the underlying ClickHouse engine.

The exception message typically contains detailed error information
from ClickHouse, including syntax errors, type mismatches, missing
tables/columns, and other query execution issues.

**Variables**

| Variable  | Type  | Description                                                     |
|-----------|-------|-----------------------------------------------------------------|
| `args`    | -     | Tuple containing the error message and any additional arguments |

**Examples**

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
This exception is automatically raised by chdb.query() and related
functions when the underlying ClickHouse engine reports an error.
You should catch this exception when handling potentially failing
queries to provide appropriate error handling in your application.
:::

## Version Information {#version-information}

### `chdb.chdb_version = ('3', '6', '0')` {#chdb-version}

Built-in immutable sequence.

If no argument is given, the constructor returns an empty tuple.
If iterable is specified the tuple is initialized from iterable’s items.

If the argument is a tuple, the return value is the same object.

---

### `chdb.engine_version = '25.5.2.1'` {#engine-version}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

Create a new string object from the given object. If encoding or
errors is specified, then the object must expose a data buffer
that will be decoded using the given encoding and error handler.
Otherwise, returns the result of object._\_str_\_() (if defined)
or repr(object).

- encoding defaults to ‘utf-8’.
- errors defaults to ‘strict’.

---

### `chdb.__version__ = '3.6.0'` {#version}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

Create a new string object from the given object. If encoding or
errors is specified, then the object must expose a data buffer
that will be decoded using the given encoding and error handler.
Otherwise, returns the result of object._\_str_\_() (if defined)
or repr(object).

- encoding defaults to ‘utf-8’.
- errors defaults to ‘strict’.
