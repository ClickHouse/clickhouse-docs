---
title: 'chDB Python API Reference'
sidebar_label: 'Python API'
slug: /chdb/api/python
description: 'Complete Python API reference for chDB'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'api', 'reference']
doc_type: 'reference'
---

# Python API Reference

## Core Query Functions

### chdb.query(sql, output_format='CSV', path='', udf_path='')

Execute SQL query using chDB engine.

This is the main query function that executes SQL statements using the embedded
ClickHouse engine. Supports various output formats and can work with in-memory
or file-based databases.

* **Parameters:**
    * **sql** (*str*) – SQL query string to execute
    * **output_format** (*str, optional*) – Output format for results. Defaults to “CSV”.
      Supported formats include:
        - “CSV” - Comma-separated values
        - “JSON” - JSON format
        - “Arrow” - Apache Arrow format
        - “Parquet” - Parquet format
        - “DataFrame” - Pandas DataFrame
        - “ArrowTable” - PyArrow Table
        - “Debug” - Enable verbose logging
    * **path** (*str, optional*) – Database file path. Defaults to “” (in-memory database).
      Can be a file path or “:memory:” for in-memory database.
    * **udf_path** (*str, optional*) – Path to User-Defined Functions directory. Defaults to “”.
* **Returns:**
  *Query result in the specified format* –
    - str: For text formats like CSV, JSON
    - pd.DataFrame: When output_format is “DataFrame” or “dataframe”
    - pa.Table: When output_format is “ArrowTable” or “arrowtable”
    - chdb result object: For other formats
* **Raises:**
    * [**ChdbError**](#chdb.ChdbError) – If the SQL query execution fails
    * **ImportError** – If required dependencies are missing for DataFrame/Arrow formats

### Examples

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

### chdb.sql(sql, output_format='CSV', path='', udf_path='')

Execute SQL query using chDB engine.

This is the main query function that executes SQL statements using the embedded
ClickHouse engine. Supports various output formats and can work with in-memory
or file-based databases.

* **Parameters:**
    * **sql** (*str*) – SQL query string to execute
    * **output_format** (*str, optional*) – Output format for results. Defaults to “CSV”.
      Supported formats include:
        - “CSV” - Comma-separated values
        - “JSON” - JSON format
        - “Arrow” - Apache Arrow format
        - “Parquet” - Parquet format
        - “DataFrame” - Pandas DataFrame
        - “ArrowTable” - PyArrow Table
        - “Debug” - Enable verbose logging
    * **path** (*str, optional*) – Database file path. Defaults to “” (in-memory database).
      Can be a file path or “:memory:” for in-memory database.
    * **udf_path** (*str, optional*) – Path to User-Defined Functions directory. Defaults to “”.
* **Returns:**
  *Query result in the specified format* –
    - str: For text formats like CSV, JSON
    - pd.DataFrame: When output_format is “DataFrame” or “dataframe”
    - pa.Table: When output_format is “ArrowTable” or “arrowtable”
    - chdb result object: For other formats
* **Raises:**
    * [**ChdbError**](#chdb.ChdbError) – If the SQL query execution fails
    * **ImportError** – If required dependencies are missing for DataFrame/Arrow formats

### Examples

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

### chdb.to_arrowTable(res)

Convert query result to PyArrow Table.

Converts a chDB query result to a PyArrow Table for efficient columnar data processing.
Returns an empty table if the result is empty.

* **Parameters:**
  **res** – chDB query result object containing binary Arrow data
* **Returns:**
  *pa.Table* – PyArrow Table containing the query results
* **Raises:**
  **ImportError** – If pyarrow or pandas are not installed

### Example

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> table = chdb.to_arrowTable(result)
>>> print(table.to_pandas())
   id    msg
0   1  hello
```

### chdb.to_df(r)

Convert query result to pandas DataFrame.

Converts a chDB query result to a pandas DataFrame by first converting to
PyArrow Table and then to pandas using multi-threading for better performance.

* **Parameters:**
  **r** – chDB query result object containing binary Arrow data
* **Returns:**
  *pd.DataFrame* – pandas DataFrame containing the query results
* **Raises:**
  **ImportError** – If pyarrow or pandas are not installed

### Example

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> df = chdb.to_df(result)
>>> print(df)
   id    msg
0   1  hello
```

## Connection and Session Management

**Session Functions**

### chdb.connect(connection_string: str = ':memory:') → [Connection](#chdb.state.sqlitelike.Connection)

Create a connection to chDB background server.

This function establishes a connection to the chDB (ClickHouse) database engine.
Only one open connection is allowed per process. Multiple calls with the same
connection string will return the same connection object.

* **Parameters:**
  **connection_string** (*str, optional*) – Database connection string. Defaults to “:memory:”.
  Supported connection string formats:

  **Basic formats:**
    - “:memory:” - In-memory database (default)
    - “test.db” - Relative path database file
    - “[file:test.db](file:test.db)” - Same as relative path
    - “/path/to/test.db” - Absolute path database file
    - “[file:/path/to/test.db](file:/path/to/test.db)” - Same as absolute path

  **With query parameters:**
    - “[file:test.db?param1=value1&param2=value2](file:test.db?param1=value1&param2=value2)” - Relative path with params
    - “[file::memory](file::memory):?verbose&log-level=test” - In-memory with params
    - “///path/to/test.db?param1=value1&param2=value2” - Absolute path with params

  **Query parameter handling:**

  Query parameters are passed to ClickHouse engine as startup arguments.
  Special parameter handling:
    - “mode=ro” becomes “–readonly=1” (read-only mode)
    - “verbose” enables verbose logging
    - “log-level=test” sets logging level

  For complete parameter list, see `clickhouse local --help --verbose`
* **Returns:**
  *Connection* – Database connection object that supports:
    - Creating cursors with `Connection.cursor()`
    - Direct queries with `Connection.query()`
    - Streaming queries with `Connection.send_query()`
    - Context manager protocol for automatic cleanup
* **Raises:**
  **RuntimeError** – If connection to database fails

#### WARNING
Only one connection per process is supported. Creating a new connection
will close any existing connection.

### Examples

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

#### SEE ALSO
- `Connection` - Database connection class
- `Cursor` - Database cursor for DB-API 2.0 operations

<a id="module-chdb.session"></a>

### *class* chdb.session.Session(path=None)

Bases: `object`

Session will keep the state of query.
If path is None, it will create a temporary directory and use it as the database path
and the temporary directory will be removed when the session is closed.
You can also pass in a path to create a database at that path where will keep your data.

You can also use a connection string to pass in the path and other parameters.
.. rubric:: Examples

- “:memory:” (for in-memory database)
- “test.db” (for relative path)
- “[file:test.db](file:test.db)” (same as above)
- “/path/to/test.db” (for absolute path)
- “[file:/path/to/test.db](file:/path/to/test.db)” (same as above)
- “[file:test.db?param1=value1&param2=value2](file:test.db?param1=value1&param2=value2)” (for relative path with query params)
- “[file::memory](file::memory):?verbose&log-level=test” (for in-memory database with query params)
- “///path/to/test.db?param1=value1&param2=value2” (for absolute path)

Connection string args handling:
: Connection string can contain query params like “[file:test.db?param1=value1&param2=value2](file:test.db?param1=value1&param2=value2)”
“param1=value1” will be passed to ClickHouse engine as start up args.
<br/>
For more details, see clickhouse local –help –verbose
Some special args handling:
- “mode=ro” would be “–readonly=1” for clickhouse (read-only mode)

#### IMPORTANT
- There can be only one session at a time. If you want to create a new session, you need to close the existing one.
- Creating a new session will close the existing one.

#### cleanup()

Cleanup session resources with exception handling.

This method attempts to close the session while suppressing any exceptions
that might occur during the cleanup process. It’s particularly useful in
error handling scenarios or when you need to ensure cleanup happens regardless
of the session state.

#### NOTE
This method will never raise an exception, making it safe to call in
finally blocks or destructors.

#### SEE ALSO
- [`close()`](#chdb.session.Session.close) - For explicit session closing with error propagation

### Examples

```pycon
>>> session = Session("test.db")
>>> try:
...     session.query("INVALID SQL")
... finally:
...     session.cleanup()  # Safe cleanup regardless of errors
```

#### close()

Close the session and cleanup resources.

This method closes the underlying connection and resets the global session state.
After calling this method, the session becomes invalid and cannot be used for
further queries.

#### NOTE
This method is automatically called when the session is used as a context manager
or when the session object is destroyed.

#### WARNING
Any attempt to use the session after calling close() will result in an error.

### Examples

```pycon
>>> session = Session("test.db")
>>> session.query("SELECT 1")
>>> session.close()  # Explicitly close the session
```

#### query(sql, fmt='CSV', udf_path='')

Execute a SQL query and return the results.

This method executes a SQL query against the session’s database and returns
the results in the specified format. The method supports various output formats
and maintains session state between queries.

* **Parameters:**
    * **sql** (*str*) – SQL query string to execute
    * **fmt** (*str, optional*) – Output format for results. Defaults to “CSV”.
      Available formats include:
        - “CSV” - Comma-separated values
        - “JSON” - JSON format
        - “TabSeparated” - Tab-separated values
        - “Pretty” - Pretty-printed table format
        - “JSONCompact” - Compact JSON format
        - “Arrow” - Apache Arrow format
        - “Parquet” - Parquet format
    * **udf_path** (*str, optional*) – Path to user-defined functions. Defaults to “”.
      If not specified, uses the UDF path from session initialization.
* **Returns:**
  Query results in the specified format. The exact return type depends on
  the format parameter:
    - String formats (CSV, JSON, etc.) return str
    - Binary formats (Arrow, Parquet) return bytes
* **Raises:**
    * **RuntimeError** – If the session is closed or invalid
    * **ValueError** – If the SQL query is malformed

#### NOTE
The “Debug” format is not supported and will be automatically converted
to “CSV” with a warning. For debugging, use connection string parameters
instead.

#### WARNING
This method executes the query synchronously and loads all results into
memory. For large result sets, consider using [`send_query()`](#chdb.session.Session.send_query) for
streaming results.

### Examples

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

#### SEE ALSO
- [`send_query()`](#chdb.session.Session.send_query) - For streaming query execution
- [`sql`](#chdb.session.Session.sql) - Alias for this method

#### send_query(sql, fmt='CSV') → StreamingResult

Execute a SQL query and return a streaming result iterator.

This method executes a SQL query against the session’s database and returns
a streaming result object that allows you to iterate over the results without
loading everything into memory at once. This is particularly useful for large
result sets.

* **Parameters:**
    * **sql** (*str*) – SQL query string to execute
    * **fmt** (*str, optional*) – Output format for results. Defaults to “CSV”.
      Available formats include:
        - “CSV” - Comma-separated values
        - “JSON” - JSON format
        - “TabSeparated” - Tab-separated values
        - “JSONCompact” - Compact JSON format
        - “Arrow” - Apache Arrow format
        - “Parquet” - Parquet format
* **Returns:**
  *StreamingResult* – A streaming result iterator that yields query results
  incrementally. The iterator can be used in for loops or converted to
  other data structures.
* **Raises:**
    * **RuntimeError** – If the session is closed or invalid
    * **ValueError** – If the SQL query is malformed

#### NOTE
The “Debug” format is not supported and will be automatically converted
to “CSV” with a warning. For debugging, use connection string parameters
instead.

#### WARNING
The returned StreamingResult object should be consumed promptly or stored
appropriately, as it maintains a connection to the database.

### Examples

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

#### SEE ALSO
- [`query()`](#chdb.session.Session.query) - For non-streaming query execution
- `chdb.state.sqlitelike.StreamingResult` - Streaming result iterator

#### sql(sql, fmt='CSV', udf_path='')

Execute a SQL query and return the results.

This method executes a SQL query against the session’s database and returns
the results in the specified format. The method supports various output formats
and maintains session state between queries.

* **Parameters:**
    * **sql** (*str*) – SQL query string to execute
    * **fmt** (*str, optional*) – Output format for results. Defaults to “CSV”.
      Available formats include:
        - “CSV” - Comma-separated values
        - “JSON” - JSON format
        - “TabSeparated” - Tab-separated values
        - “Pretty” - Pretty-printed table format
        - “JSONCompact” - Compact JSON format
        - “Arrow” - Apache Arrow format
        - “Parquet” - Parquet format
    * **udf_path** (*str, optional*) – Path to user-defined functions. Defaults to “”.
      If not specified, uses the UDF path from session initialization.
* **Returns:**
  Query results in the specified format. The exact return type depends on
  the format parameter:
    - String formats (CSV, JSON, etc.) return str
    - Binary formats (Arrow, Parquet) return bytes
* **Raises:**
    * **RuntimeError** – If the session is closed or invalid
    * **ValueError** – If the SQL query is malformed

#### NOTE
The “Debug” format is not supported and will be automatically converted
to “CSV” with a warning. For debugging, use connection string parameters
instead.

#### WARNING
This method executes the query synchronously and loads all results into
memory. For large result sets, consider using [`send_query()`](#chdb.session.Session.send_query) for
streaming results.

### Examples

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

#### SEE ALSO
- [`send_query()`](#chdb.session.Session.send_query) - For streaming query execution
- [`sql`](#chdb.session.Session.sql) - Alias for this method

**State Management**

<a id="module-chdb.state"></a>

### chdb.state.connect(connection_string: str = ':memory:') → [Connection](#chdb.state.sqlitelike.Connection)

Create a connection to chDB background server.

This function establishes a connection to the chDB (ClickHouse) database engine.
Only one open connection is allowed per process. Multiple calls with the same
connection string will return the same connection object.

* **Parameters:**
  **connection_string** (*str, optional*) – Database connection string. Defaults to “:memory:”.
  Supported connection string formats:

  **Basic formats:**
    - “:memory:” - In-memory database (default)
    - “test.db” - Relative path database file
    - “[file:test.db](file:test.db)” - Same as relative path
    - “/path/to/test.db” - Absolute path database file
    - “[file:/path/to/test.db](file:/path/to/test.db)” - Same as absolute path

  **With query parameters:**
    - “[file:test.db?param1=value1&param2=value2](file:test.db?param1=value1&param2=value2)” - Relative path with params
    - “[file::memory](file::memory):?verbose&log-level=test” - In-memory with params
    - “///path/to/test.db?param1=value1&param2=value2” - Absolute path with params

  **Query parameter handling:**

  Query parameters are passed to ClickHouse engine as startup arguments.
  Special parameter handling:
    - “mode=ro” becomes “–readonly=1” (read-only mode)
    - “verbose” enables verbose logging
    - “log-level=test” sets logging level

  For complete parameter list, see `clickhouse local --help --verbose`
* **Returns:**
  *Connection* – Database connection object that supports:
    - Creating cursors with `Connection.cursor()`
    - Direct queries with `Connection.query()`
    - Streaming queries with `Connection.send_query()`
    - Context manager protocol for automatic cleanup
* **Raises:**
  **RuntimeError** – If connection to database fails

#### WARNING
Only one connection per process is supported. Creating a new connection
will close any existing connection.

### Examples

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

#### SEE ALSO
- `Connection` - Database connection class
- `Cursor` - Database cursor for DB-API 2.0 operations

<a id="module-chdb.state.sqlitelike"></a>

### *class* chdb.state.sqlitelike.Connection(connection_string: str)

Bases: `object`

#### close() → None

Close the connection and cleanup resources.

This method closes the database connection and cleans up any associated
resources including active cursors. After calling this method, the
connection becomes invalid and cannot be used for further operations.

#### NOTE
This method is idempotent - calling it multiple times is safe.

#### WARNING
Any ongoing streaming queries will be cancelled when the connection
is closed. Ensure all important data is processed before closing.

### Examples

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

#### cursor() → [Cursor](#chdb.state.sqlitelike.Cursor)

Create a cursor object for executing queries.

This method creates a database cursor that provides the standard
DB-API 2.0 interface for executing queries and fetching results.
The cursor allows for fine-grained control over query execution
and result retrieval.

* **Returns:**
  *Cursor* – A cursor object for database operations

#### NOTE
Creating a new cursor will replace any existing cursor associated
with this connection. Only one cursor per connection is supported.

### Examples

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

#### SEE ALSO
- [`Cursor`](#chdb.state.sqlitelike.Cursor) - Database cursor implementation

#### query(query: str, format: str = 'CSV') → Any

Execute a SQL query and return the complete results.

This method executes a SQL query synchronously and returns the complete
result set. It supports various output formats and automatically applies
format-specific post-processing.

* **Parameters:**
    * **query** (*str*) – SQL query string to execute
    * **format** (*str, optional*) – Output format for results. Defaults to “CSV”.
      Supported formats:
        - “CSV” - Comma-separated values (string)
        - “JSON” - JSON format (string)
        - “Arrow” - Apache Arrow format (bytes)
        - “Dataframe” - Pandas DataFrame (requires pandas)
        - “Arrowtable” - PyArrow Table (requires pyarrow)
* **Returns:**
  *Query results in the specified format. Type depends on format* –
    - String formats return str
    - Arrow format returns bytes
    - dataframe format returns pandas.DataFrame
    - arrowtable format returns pyarrow.Table
* **Raises:**
    * **RuntimeError** – If query execution fails
    * **ImportError** – If required packages for format are not installed

#### WARNING
This method loads the entire result set into memory. For large
results, consider using [`send_query()`](#chdb.state.sqlitelike.Connection.send_query) for streaming.

### Examples

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

#### SEE ALSO
- [`send_query()`](#chdb.state.sqlitelike.Connection.send_query) - For streaming query execution

#### send_query(query: str, format: str = 'CSV') → StreamingResult

Execute a SQL query and return a streaming result iterator.

This method executes a SQL query and returns a StreamingResult object
that allows you to iterate over the results without loading everything
into memory at once. This is ideal for processing large result sets.

* **Parameters:**
    * **query** (*str*) – SQL query string to execute
    * **format** (*str, optional*) – Output format for results. Defaults to “CSV”.
      Supported formats:
        - “CSV” - Comma-separated values
        - “JSON” - JSON format
        - “Arrow” - Apache Arrow format (enables record_batch() method)
        - “dataframe” - Pandas DataFrame chunks
        - “arrowtable” - PyArrow Table chunks
* **Returns:**
  *StreamingResult* – A streaming iterator for query results that supports:
    - Iterator protocol (for loops)
    - Context manager protocol (with statements)
    - Manual fetching with fetch() method
    - PyArrow RecordBatch streaming (Arrow format only)
* **Raises:**
    * **RuntimeError** – If query execution fails
    * **ImportError** – If required packages for format are not installed

#### NOTE
Only the “Arrow” format supports the record_batch() method on the
returned StreamingResult.

### Examples

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

#### SEE ALSO
- [`query()`](#chdb.state.sqlitelike.Connection.query) - For non-streaming query execution

`StreamingResult` - Streaming result iterator

### *class* chdb.state.sqlitelike.Cursor(connection)

Bases: `object`

#### close() → None

Close the cursor and cleanup resources.

This method closes the cursor and cleans up any associated resources.
After calling this method, the cursor becomes invalid and cannot be
used for further operations.

#### NOTE
This method is idempotent - calling it multiple times is safe.
The cursor is also automatically closed when the connection is closed.

### Examples

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT 1")
>>> result = cursor.fetchone()
>>> cursor.close()  # Cleanup cursor resources
```

#### column_names() → list

Return a list of column names from the last executed query.

This method returns the column names from the most recently executed
SELECT query. The names are returned in the same order as they appear
in the result set.

* **Returns:**
  *list* – List of column name strings, or empty list if no query
  has been executed or the query returned no columns

### Examples

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name, email FROM users LIMIT 1")
>>> print(cursor.column_names())
['id', 'name', 'email']
```

#### SEE ALSO
- [`column_types()`](#chdb.state.sqlitelike.Cursor.column_types) - Get column type information
- [`description`](#chdb.state.sqlitelike.Cursor.description) - DB-API 2.0 column description

#### column_types() → list

Return a list of column types from the last executed query.

This method returns the ClickHouse column type names from the most
recently executed SELECT query. The types are returned in the same
order as they appear in the result set.

* **Returns:**
  *list* – List of ClickHouse type name strings, or empty list if no
  query has been executed or the query returned no columns

### Examples

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT toInt32(1), toString('hello')")
>>> print(cursor.column_types())
['Int32', 'String']
```

#### SEE ALSO
- [`column_names()`](#chdb.state.sqlitelike.Cursor.column_names) - Get column name information
- [`description`](#chdb.state.sqlitelike.Cursor.description) - DB-API 2.0 column description

#### commit() → None

Commit any pending transaction.

This method commits any pending database transaction. In ClickHouse,
most operations are auto-committed, but this method is provided for
DB-API 2.0 compatibility.

#### NOTE
ClickHouse typically auto-commits operations, so explicit commits
are usually not necessary. This method is provided for compatibility
with standard DB-API 2.0 workflow.

### Examples

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("INSERT INTO test VALUES (1, 'data')")
>>> cursor.commit()
```

#### *property* description *: list*

Return column description as per DB-API 2.0 specification.

This property returns a list of 7-item tuples describing each column
in the result set of the last executed SELECT query. Each tuple contains:
(name, type_code, display_size, internal_size, precision, scale, null_ok)

Currently, only name and type_code are provided, with other fields set to None.

* **Returns:**
  *list* – List of 7-tuples describing each column, or empty list if no
  SELECT query has been executed

#### NOTE
This follows the DB-API 2.0 specification for cursor.description.
Only the first two elements (name and type_code) contain meaningful
data in this implementation.

### Examples

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users LIMIT 1")
>>> for desc in cursor.description:
...     print(f"Column: {desc[0]}, Type: {desc[1]}")
Column: id, Type: Int32
Column: name, Type: String
```

#### SEE ALSO
- [`column_names()`](#chdb.state.sqlitelike.Cursor.column_names) - Get just column names
- [`column_types()`](#chdb.state.sqlitelike.Cursor.column_types) - Get just column types

#### execute(query: str) → None

Execute a SQL query and prepare results for fetching.

This method executes a SQL query and prepares the results for retrieval
using the fetch methods. It handles the parsing of result data and
automatic type conversion for ClickHouse data types.

* **Parameters:**
  **query** (*str*) – SQL query string to execute
* **Raises:**
  **Exception** – If query execution fails or result parsing fails

#### NOTE
This method follows DB-API 2.0 specifications for cursor.execute().
After execution, use fetchone(), fetchmany(), or fetchall() to
retrieve results.

#### NOTE
The method automatically converts ClickHouse data types to appropriate
Python types:

- Int/UInt types → int
- Float types → float
- String/FixedString → str
- DateTime → datetime.datetime
- Date → datetime.date
- Bool → bool

### Examples

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

#### SEE ALSO
- [`fetchone()`](#chdb.state.sqlitelike.Cursor.fetchone) - Fetch single row
- [`fetchmany()`](#chdb.state.sqlitelike.Cursor.fetchmany) - Fetch multiple rows
- [`fetchall()`](#chdb.state.sqlitelike.Cursor.fetchall) - Fetch all remaining rows

#### fetchall() → tuple

Fetch all remaining rows from the query result.

This method retrieves all remaining rows from the current query result
set starting from the current cursor position. It returns a tuple of
row tuples with appropriate Python type conversion applied.

* **Returns:**
  *tuple* – Tuple containing all remaining row tuples from the result set.
  Returns empty tuple if no rows are available.

#### WARNING
This method loads all remaining rows into memory at once. For large
result sets, consider using [`fetchmany()`](#chdb.state.sqlitelike.Cursor.fetchmany) to process results
in batches.

### Examples

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users")
>>> all_users = cursor.fetchall()
>>> for user_id, user_name in all_users:
...     print(f"User {user_id}: {user_name}")
```

#### SEE ALSO
- [`fetchone()`](#chdb.state.sqlitelike.Cursor.fetchone) - Fetch single row
- [`fetchmany()`](#chdb.state.sqlitelike.Cursor.fetchmany) - Fetch multiple rows in batches

#### fetchmany(size: int = 1) → tuple

Fetch multiple rows from the query result.

This method retrieves up to ‘size’ rows from the current query result
set. It returns a tuple of row tuples, with each row containing column
values with appropriate Python type conversion.

* **Parameters:**
  **size** (*int, optional*) – Maximum number of rows to fetch. Defaults to 1.
* **Returns:**
  *tuple* – Tuple containing up to ‘size’ row tuples. May contain fewer
  rows if the result set is exhausted.

#### NOTE
This method follows DB-API 2.0 specifications. It will return fewer
than ‘size’ rows if the result set is exhausted.

### Examples

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

#### SEE ALSO
- [`fetchone()`](#chdb.state.sqlitelike.Cursor.fetchone) - Fetch single row
- [`fetchall()`](#chdb.state.sqlitelike.Cursor.fetchall) - Fetch all remaining rows

#### fetchone() → tuple | None

Fetch the next row from the query result.

This method retrieves the next available row from the current query
result set. It returns a tuple containing the column values with
appropriate Python type conversion applied.

* **Returns:**
  *Optional[tuple]* – Next row as a tuple of column values, or None
  if no more rows are available

#### NOTE
This method follows DB-API 2.0 specifications. Column values are
automatically converted to appropriate Python types based on
ClickHouse column types.

### Examples

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users")
>>> row = cursor.fetchone()
>>> while row is not None:
...     user_id, user_name = row
...     print(f"User {user_id}: {user_name}")
...     row = cursor.fetchone()
```

#### SEE ALSO
- [`fetchmany()`](#chdb.state.sqlitelike.Cursor.fetchmany) - Fetch multiple rows
- [`fetchall()`](#chdb.state.sqlitelike.Cursor.fetchall) - Fetch all remaining rows

### chdb.state.sqlitelike.to_arrowTable(res)

Convert query result to PyArrow Table.

This function converts chdb query results to a PyArrow Table format,
which provides efficient columnar data access and interoperability
with other data processing libraries.

* **Parameters:**
  **res** – Query result object from chdb containing Arrow format data
* **Returns:**
  *pyarrow.Table* – PyArrow Table containing the query results
* **Raises:**
  **ImportError** – If pyarrow or pandas packages are not installed

#### NOTE
This function requires both pyarrow and pandas to be installed.
Install them with: `pip install pyarrow pandas`

#### WARNING
Empty results return an empty PyArrow Table with no schema.

### Examples

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

### chdb.state.sqlitelike.to_df(r)

Convert query result to Pandas DataFrame.

This function converts chdb query results to a Pandas DataFrame format
by first converting to PyArrow Table and then to DataFrame. This provides
convenient data analysis capabilities with Pandas API.

* **Parameters:**
  **r** – Query result object from chdb containing Arrow format data
* **Returns:**
  *pandas.DataFrame* – DataFrame containing the query results with
  appropriate column names and data types
* **Raises:**
  **ImportError** – If pyarrow or pandas packages are not installed

#### NOTE
This function uses multi-threading for the Arrow to Pandas conversion
to improve performance on large datasets.

#### SEE ALSO
- [`to_arrowTable()`](#chdb.state.sqlitelike.to_arrowTable) - For PyArrow Table format conversion

### Examples

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

## DataFrame Integration

### *class* chdb.dataframe.Table(\*args: Any, \*\*kwargs: Any)

Bases:

## Database API (DBAPI) 2.0 Interface

chDB provides a Python DB-API 2.0 compatible interface for database connectivity, allowing you to use chDB with tools and frameworks that expect standard database interfaces.

The chDB DB-API 2.0 interface includes:

- **Connections**: Database connection management with connection strings
- **Cursors**: Query execution and result retrieval
- **Type System**: DB-API 2.0 compliant type constants and converters
- **Error Handling**: Standard database exception hierarchy
- **Thread Safety**: Level 1 thread safety (threads may share modules but not connections)

**Core Functions**

### chdb.dbapi.connect(\*args, \*\*kwargs)

Initialize a new database connection.

* **Parameters:**
  **path** (*str, optional*) – Database file path. None for in-memory database.
* **Raises:**
  [**err.Error**](#chdb.dbapi.err.Error) – If connection cannot be established

### chdb.dbapi.get_client_info()

Get client version information.

Returns the chDB client version as a string for MySQLdb compatibility.

* **Returns:**
  *str* – Version string in format ‘major.minor.patch’

**Type Constructors**

### chdb.dbapi.Binary(x)

Return x as a binary type.

This function converts the input to bytes type for use with binary
database fields, following the DB-API 2.0 specification.

* **Parameters:**
  **x** – Input data to convert to binary
* **Returns:**
  *bytes* – The input converted to bytes

**Connection Class**

### *class* chdb.dbapi.connections.Connection(path=None)

Bases: `object`

DB-API 2.0 compliant connection to chDB database.

This class provides a standard DB-API interface for connecting to and interacting
with chDB databases. It supports both in-memory and file-based databases.

The connection manages the underlying chDB engine and provides methods for
executing queries, managing transactions (no-op for ClickHouse), and creating cursors.

* **Parameters:**
  **path** (*str, optional*) – Database file path. If None, uses in-memory database.
  Can be a file path like ‘database.db’ or None for ‘:memory:’
* **Variables:**
    * **encoding** (*str*) – Character encoding for queries, defaults to ‘utf8’
    * **open** (*bool*) – True if connection is open, False if closed

### Examples

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

#### NOTE
ClickHouse does not support traditional transactions, so commit() and rollback()
operations are no-ops but provided for DB-API compliance.

#### close()

Close the database connection.

Closes the underlying chDB connection and marks this connection as closed.
Subsequent operations on this connection will raise an Error.

* **Raises:**
  [**err.Error**](#chdb.dbapi.err.Error) – If connection is already closed

#### commit()

Commit the current transaction.

#### NOTE
This is a no-op for chDB/ClickHouse as it doesn’t support traditional
transactions. Provided for DB-API 2.0 compliance.

#### cursor(cursor=None)

Create a new cursor for executing queries.

* **Parameters:**
  **cursor** – Ignored, provided for compatibility
* **Returns:**
  *Cursor* – New cursor object for this connection
* **Raises:**
  [**err.Error**](#chdb.dbapi.err.Error) – If connection is closed

### Example

```pycon
>>> conn = Connection()
>>> cur = conn.cursor()
>>> cur.execute("SELECT 1")
>>> result = cur.fetchone()
```

#### escape(obj, mapping=None)

Escape a value for safe inclusion in SQL queries.

* **Parameters:**
    * **obj** – Value to escape (string, bytes, number, etc.)
    * **mapping** – Optional character mapping for escaping
* **Returns:**
  Escaped version of the input suitable for SQL queries

### Example

```pycon
>>> conn = Connection()
>>> safe_value = conn.escape("O'Reilly")
>>> query = f"SELECT * FROM users WHERE name = {safe_value}"
```

#### escape_string(s)

Escape a string value for SQL queries.

* **Parameters:**
  **s** (*str*) – String to escape
* **Returns:**
  *str* – Escaped string safe for SQL inclusion

#### *property* open

Check if the connection is open.

* **Returns:**
  *bool* – True if connection is open, False if closed

#### query(sql, fmt='CSV')

Execute a SQL query directly and return raw results.

This method bypasses the cursor interface and executes queries directly.
For standard DB-API usage, prefer using cursor() method.

* **Parameters:**
    * **sql** (*str or bytes*) – SQL query to execute
    * **fmt** (*str, optional*) – Output format. Defaults to “CSV”.
      Supported formats include “CSV”, “JSON”, “Arrow”, “Parquet”, etc.
* **Returns:**
  Query result in the specified format
* **Raises:**
  [**err.InterfaceError**](#chdb.dbapi.err.InterfaceError) – If connection is closed or query fails

### Example

```pycon
>>> conn = Connection()
>>> result = conn.query("SELECT 1, 'hello'", "CSV")
>>> print(result)
"1,hello\n"
```

#### *property* resp

Get the last query response.

* **Returns:**
  The raw response from the last query() call

#### NOTE
This property is updated each time query() is called directly.
It does not reflect queries executed through cursors.

#### rollback()

Roll back the current transaction.

#### NOTE
This is a no-op for chDB/ClickHouse as it doesn’t support traditional
transactions. Provided for DB-API 2.0 compliance.

**Cursor Class**

### *class* chdb.dbapi.cursors.Cursor(connection)

Bases: `object`

DB-API 2.0 cursor for executing queries and fetching results.

The cursor provides methods for executing SQL statements, managing query results,
and navigating through result sets. It supports parameter binding, bulk operations,
and follows DB-API 2.0 specifications.

Do not create Cursor instances directly. Use Connection.cursor() instead.

* **Variables:**
    * **description** (*tuple*) – Column metadata for the last query result
    * **rowcount** (*int*) – Number of rows affected by the last query (-1 if unknown)
    * **arraysize** (*int*) – Default number of rows to fetch at once (default: 1)
    * **lastrowid** – ID of the last inserted row (if applicable)
    * **max_stmt_length** (*int*) – Maximum statement size for executemany() (default: 1024000)

### Examples

```pycon
>>> conn = Connection()
>>> cur = conn.cursor()
>>> cur.execute("SELECT 1 as id, 'test' as name")
>>> result = cur.fetchone()
>>> print(result)  # (1, 'test')
>>> cur.close()
```

#### NOTE
See [DB-API 2.0 Cursor Objects](https://www.python.org/dev/peps/pep-0249/#cursor-objects)
for complete specification details.

#### callproc(procname, args=())

Execute a stored procedure (placeholder implementation).

* **Parameters:**
    * **procname** (*str*) – Name of stored procedure to execute
    * **args** (*sequence*) – Parameters to pass to the procedure
* **Returns:**
  *sequence* – The original args parameter (unmodified)

#### NOTE
chDB/ClickHouse does not support stored procedures in the traditional sense.
This method is provided for DB-API 2.0 compliance but does not perform
any actual operation. Use execute() for all SQL operations.

Compatibility Warning:
: This is a placeholder implementation. Traditional stored procedure
features like OUT/INOUT parameters, multiple result sets, and server
variables are not supported by the underlying ClickHouse engine.

#### close()

Close the cursor and free associated resources.

After closing, the cursor becomes unusable and any operation will raise an exception.
Closing a cursor exhausts all remaining data and releases the underlying cursor.

#### execute(query, args=None)

Execute a SQL query with optional parameter binding.

This method executes a single SQL statement with optional parameter substitution.
It supports multiple parameter placeholder styles for flexibility.

* **Parameters:**
    * **query** (*str*) – SQL query to execute
    * **args** (*tuple/list/dict, optional*) – Parameters to bind to placeholders
* **Returns:**
  *int* – Number of affected rows (-1 if unknown)

Parameter Styles:
: - Question mark style: “SELECT \* FROM users WHERE id = ?”
- Named style: “SELECT \* FROM users WHERE name = %(name)s”
- Format style: “SELECT \* FROM users WHERE age = %s” (legacy)

### Examples

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

* **Raises:**
    * [**ProgrammingError**](#chdb.dbapi.err.ProgrammingError) – If cursor is closed or query is malformed
    * [**InterfaceError**](#chdb.dbapi.err.InterfaceError) – If database error occurs during execution

#### executemany(query, args)

Execute a query multiple times with different parameter sets.

This method efficiently executes the same SQL query multiple times with
different parameter values. It’s particularly useful for bulk INSERT operations.

* **Parameters:**
    * **query** (*str*) – SQL query to execute multiple times
    * **args** (*sequence*) – Sequence of parameter tuples/dicts/lists for each execution
* **Returns:**
  *int* – Total number of affected rows across all executions

### Examples

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

#### NOTE
This method improves performance for multiple-row INSERT and UPDATE operations
by optimizing the query execution process.

#### fetchall()

Fetch all remaining rows from the query result.

* **Returns:**
  *list* – List of tuples representing all remaining rows
* **Raises:**
  [**ProgrammingError**](#chdb.dbapi.err.ProgrammingError) – If execute() has not been called first

#### WARNING
This method can consume large amounts of memory for big result sets.
Consider using fetchmany() for large datasets.

### Example

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> all_rows = cursor.fetchall()
>>> print(len(all_rows))  # Number of total rows
```

#### fetchmany(size=1)

Fetch multiple rows from the query result.

* **Parameters:**
  **size** (*int, optional*) – Number of rows to fetch. Defaults to 1.
  If not specified, uses cursor.arraysize.
* **Returns:**
  *list* – List of tuples representing the fetched rows
* **Raises:**
  [**ProgrammingError**](#chdb.dbapi.err.ProgrammingError) – If execute() has not been called first

### Example

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> rows = cursor.fetchmany(3)
>>> print(rows)  # [(1, 'Alice'), (2, 'Bob'), (3, 'Charlie')]
```

#### fetchone()

Fetch the next row from the query result.

* **Returns:**
  *tuple or None* – Next row as a tuple, or None if no more rows available
* **Raises:**
  [**ProgrammingError**](#chdb.dbapi.err.ProgrammingError) – If execute() has not been called first

### Example

```pycon
>>> cursor.execute("SELECT id, name FROM users LIMIT 3")
>>> row = cursor.fetchone()
>>> print(row)  # (1, 'Alice')
>>> row = cursor.fetchone()
>>> print(row)  # (2, 'Bob')
```

#### max_stmt_length *= 1024000*

Max statement size which [`executemany()`](#chdb.dbapi.cursors.Cursor.executemany) generates.

Default value is 1024000.

#### mogrify(query, args=None)

Return the exact query string that would be sent to the database.

This method shows the final SQL query after parameter substitution,
which is useful for debugging and logging purposes.

* **Parameters:**
    * **query** (*str*) – SQL query with parameter placeholders
    * **args** (*tuple/list/dict, optional*) – Parameters to substitute
* **Returns:**
  *str* – The final SQL query string with parameters substituted

### Example

```pycon
>>> cur.mogrify("SELECT * FROM users WHERE id = ?", (123,))
"SELECT * FROM users WHERE id = 123"
```

#### NOTE
This method follows the extension to DB-API 2.0 used by Psycopg.

#### nextset()

Move to the next result set (not supported).

* **Returns:**
  *None* – Always returns None as multiple result sets are not supported

#### NOTE
chDB/ClickHouse does not support multiple result sets from a single query.
This method is provided for DB-API 2.0 compliance but always returns None.

#### setinputsizes(\*args)

Set input sizes for parameters (no-op implementation).

* **Parameters:**
  **\*args** – Parameter size specifications (ignored)

#### NOTE
This method does nothing but is required by DB-API 2.0 specification.
chDB automatically handles parameter sizing internally.

#### setoutputsizes(\*args)

Set output column sizes (no-op implementation).

* **Parameters:**
  **\*args** – Column size specifications (ignored)

#### NOTE
This method does nothing but is required by DB-API 2.0 specification.
chDB automatically handles output sizing internally.

**Error Classes**

<a id="module-chdb.dbapi.err"></a>

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

- **Warning**: Non-fatal warnings during database operations
- **InterfaceError**: Problems with the database interface itself
- **DatabaseError**: Base class for all database-related errors
- **DataError**: Problems with data processing (invalid values, type errors)
- **OperationalError**: Database operational issues (connectivity, resources)
- **IntegrityError**: Constraint violations (foreign keys, uniqueness)
- **InternalError**: Database internal errors and corruption
- **ProgrammingError**: SQL syntax errors and API misuse
- **NotSupportedError**: Unsupported features or operations

#### NOTE
These exception classes are compliant with Python DB API 2.0 specification
and provide consistent error handling across different database operations.

#### SEE ALSO
- [Python Database API Specification v2.0](https://peps.python.org/pep-0249/)
- `chdb.dbapi.connections` - Database connection management
- `chdb.dbapi.cursors` - Database cursor operations

### Examples

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

### *exception* chdb.dbapi.err.DataError

Bases: [`DatabaseError`](#chdb.dbapi.err.DatabaseError)

Exception raised for errors that are due to problems with the processed data.

This exception is raised when database operations fail due to issues with
the data being processed, such as:

- Division by zero operations
- Numeric values out of range
- Invalid date/time values
- String truncation errors
- Type conversion failures
- Invalid data format for column type

* **Raises:**
  [**DataError**](#chdb.dbapi.err.DataError) – When data validation or processing fails

### Examples

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

### *exception* chdb.dbapi.err.DatabaseError

Bases: [`Error`](#chdb.dbapi.err.Error)

Exception raised for errors that are related to the database.

This is the base class for all database-related errors. It encompasses
all errors that occur during database operations and are related to the
database itself rather than the interface.

Common scenarios include:

- SQL execution errors
- Database connectivity issues
- Transaction-related problems
- Database-specific constraints violations

#### NOTE
This serves as the parent class for more specific database error types
such as [`DataError`](#chdb.dbapi.err.DataError), [`OperationalError`](#chdb.dbapi.err.OperationalError), etc.

### *exception* chdb.dbapi.err.Error

Bases: [`StandardError`](#chdb.dbapi.err.StandardError)

Exception that is the base class of all other error exceptions (not Warning).

This is the base class for all error exceptions in chdb, excluding warnings.
It serves as the parent class for all database error conditions that prevent
successful completion of operations.

#### NOTE
This exception hierarchy follows the Python DB API 2.0 specification.

#### SEE ALSO
- [`Warning`](#chdb.dbapi.err.Warning) - For non-fatal warnings that don’t prevent operation completion

### *exception* chdb.dbapi.err.IntegrityError

Bases: [`DatabaseError`](#chdb.dbapi.err.DatabaseError)

Exception raised when the relational integrity of the database is affected.

This exception is raised when database operations violate integrity constraints,
including:

- Foreign key constraint violations
- Primary key or unique constraint violations (duplicate keys)
- Check constraint violations
- NOT NULL constraint violations
- Referential integrity violations

* **Raises:**
  [**IntegrityError**](#chdb.dbapi.err.IntegrityError) – When database integrity constraints are violated

### Examples

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

### *exception* chdb.dbapi.err.InterfaceError

Bases: [`Error`](#chdb.dbapi.err.Error)

Exception raised for errors that are related to the database interface rather than the database itself.

This exception is raised when there are problems with the database interface
implementation, such as:

- Invalid connection parameters
- API misuse (calling methods on closed connections)
- Interface-level protocol errors
- Module import or initialization failures

* **Raises:**
  [**InterfaceError**](#chdb.dbapi.err.InterfaceError) – When database interface encounters errors unrelated to database operations

#### NOTE
These errors are typically programming errors or configuration issues
that can be resolved by fixing the client code or configuration.

### *exception* chdb.dbapi.err.InternalError

Bases: [`DatabaseError`](#chdb.dbapi.err.DatabaseError)

Exception raised when the database encounters an internal error.

This exception is raised when the database system encounters internal
errors that are not caused by the application, such as:

- Invalid cursor state (cursor is not valid anymore)
- Transaction state inconsistencies (transaction is out of sync)
- Database corruption issues
- Internal data structure corruption
- System-level database errors

* **Raises:**
  [**InternalError**](#chdb.dbapi.err.InternalError) – When database encounters internal inconsistencies

#### WARNING
Internal errors may indicate serious database problems that require
database administrator attention. These errors are typically not
recoverable through application-level retry logic.

#### NOTE
These errors are generally outside the control of the application
and may require database restart or repair operations.

### *exception* chdb.dbapi.err.NotSupportedError

Bases: [`DatabaseError`](#chdb.dbapi.err.DatabaseError)

Exception raised when a method or database API is not supported.

This exception is raised when the application attempts to use database
features or API methods that are not supported by the current database
configuration or version, such as:

- Requesting rollback() on connections without transaction support
- Using advanced SQL features not supported by the database version
- Calling methods not implemented by the current driver
- Attempting to use disabled database features

* **Raises:**
  [**NotSupportedError**](#chdb.dbapi.err.NotSupportedError) – When unsupported database features are accessed

### Examples

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

#### NOTE
Check database documentation and driver capabilities to avoid
these errors. Consider graceful fallbacks where possible.

### *exception* chdb.dbapi.err.OperationalError

Bases: [`DatabaseError`](#chdb.dbapi.err.DatabaseError)

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

* **Raises:**
  [**OperationalError**](#chdb.dbapi.err.OperationalError) – When database operations fail due to operational issues

#### NOTE
These errors are typically transient and may be resolved by retrying
the operation or addressing system-level issues.

#### WARNING
Some operational errors may indicate serious system problems that
require administrative intervention.

### *exception* chdb.dbapi.err.ProgrammingError

Bases: [`DatabaseError`](#chdb.dbapi.err.DatabaseError)

Exception raised for programming errors in database operations.

This exception is raised when there are programming errors in the
application’s database usage, including:

- Table or column not found
- Table or index already exists when creating
- SQL syntax errors in statements
- Wrong number of parameters specified in prepared statements
- Invalid SQL operations (e.g., DROP on non-existent objects)
- Incorrect usage of database API methods

* **Raises:**
  [**ProgrammingError**](#chdb.dbapi.err.ProgrammingError) – When SQL statements or API usage contains errors

### Examples

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

### *exception* chdb.dbapi.err.StandardError

Bases: `Exception`

Exception related to operation with chdb.

This is the base class for all chdb-related exceptions. It inherits from
Python’s built-in Exception class and serves as the root of the exception
hierarchy for database operations.

#### NOTE
This exception class follows the Python DB API 2.0 specification
for database exception handling.

### *exception* chdb.dbapi.err.Warning

Bases: [`StandardError`](#chdb.dbapi.err.StandardError)

Exception raised for important warnings like data truncations while inserting, etc.

This exception is raised when the database operation completes but with
important warnings that should be brought to the attention of the application.
Common scenarios include:

- Data truncation during insertion
- Precision loss in numeric conversions
- Character set conversion warnings

#### NOTE
This follows the Python DB API 2.0 specification for warning exceptions.

**Module Constants**

### chdb.dbapi.apilevel *= '2.0'*

str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str

Create a new string object from the given object. If encoding or
errors is specified, then the object must expose a data buffer
that will be decoded using the given encoding and error handler.
Otherwise, returns the result of object._\_str_\_() (if defined)
or repr(object).
encoding defaults to ‘utf-8’.
errors defaults to ‘strict’.

### chdb.dbapi.threadsafety *= 1*

int([x]) -> integer
int(x, base=10) -> integer

Convert a number or string to an integer, or return 0 if no arguments
are given.  If x is a number, return x._\_int_\_().  For floating-point
numbers, this truncates towards zero.

If x is not a number or if base is given, then x must be a string,
bytes, or bytearray instance representing an integer literal in the
given base.  The literal can be preceded by ‘+’ or ‘-’ and be surrounded
by whitespace.  The base defaults to 10.  Valid bases are 0 and 2-36.
Base 0 means to interpret the base from the string as an integer literal.
>>> int(‘0b100’, base=0)
4

### chdb.dbapi.paramstyle *= 'format'*

str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str

Create a new string object from the given object. If encoding or
errors is specified, then the object must expose a data buffer
that will be decoded using the given encoding and error handler.
Otherwise, returns the result of object._\_str_\_() (if defined)
or repr(object).
encoding defaults to ‘utf-8’.
errors defaults to ‘strict’.

**Type Constants**

### chdb.dbapi.STRING *= frozenset({247, 253, 254})*

Extended frozenset for DB-API 2.0 type comparison.

This class extends frozenset to support DB-API 2.0 type comparison semantics.
It allows for flexible type checking where individual items can be compared
against the set using both equality and inequality operators.

This is used for type constants like STRING, BINARY, NUMBER, etc. to enable
comparisons like “field_type == STRING” where field_type is a single type value.

### Examples

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

### chdb.dbapi.BINARY *= frozenset({249, 250, 251, 252})*

Extended frozenset for DB-API 2.0 type comparison.

This class extends frozenset to support DB-API 2.0 type comparison semantics.
It allows for flexible type checking where individual items can be compared
against the set using both equality and inequality operators.

This is used for type constants like STRING, BINARY, NUMBER, etc. to enable
comparisons like “field_type == STRING” where field_type is a single type value.

### Examples

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

### chdb.dbapi.NUMBER *= frozenset({0, 1, 3, 4, 5, 8, 9, 13})*

Extended frozenset for DB-API 2.0 type comparison.

This class extends frozenset to support DB-API 2.0 type comparison semantics.
It allows for flexible type checking where individual items can be compared
against the set using both equality and inequality operators.

This is used for type constants like STRING, BINARY, NUMBER, etc. to enable
comparisons like “field_type == STRING” where field_type is a single type value.

### Examples

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

### chdb.dbapi.DATE *= frozenset({10, 14})*

Extended frozenset for DB-API 2.0 type comparison.

This class extends frozenset to support DB-API 2.0 type comparison semantics.
It allows for flexible type checking where individual items can be compared
against the set using both equality and inequality operators.

This is used for type constants like STRING, BINARY, NUMBER, etc. to enable
comparisons like “field_type == STRING” where field_type is a single type value.

### Examples

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

### chdb.dbapi.TIME *= frozenset({11})*

Extended frozenset for DB-API 2.0 type comparison.

This class extends frozenset to support DB-API 2.0 type comparison semantics.
It allows for flexible type checking where individual items can be compared
against the set using both equality and inequality operators.

This is used for type constants like STRING, BINARY, NUMBER, etc. to enable
comparisons like “field_type == STRING” where field_type is a single type value.

### Examples

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

### chdb.dbapi.TIMESTAMP *= frozenset({7, 12})*

Extended frozenset for DB-API 2.0 type comparison.

This class extends frozenset to support DB-API 2.0 type comparison semantics.
It allows for flexible type checking where individual items can be compared
against the set using both equality and inequality operators.

This is used for type constants like STRING, BINARY, NUMBER, etc. to enable
comparisons like “field_type == STRING” where field_type is a single type value.

### Examples

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

### chdb.dbapi.DATETIME *= frozenset({7, 12})*

Extended frozenset for DB-API 2.0 type comparison.

This class extends frozenset to support DB-API 2.0 type comparison semantics.
It allows for flexible type checking where individual items can be compared
against the set using both equality and inequality operators.

This is used for type constants like STRING, BINARY, NUMBER, etc. to enable
comparisons like “field_type == STRING” where field_type is a single type value.

### Examples

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

### chdb.dbapi.ROWID *= frozenset({})*

Extended frozenset for DB-API 2.0 type comparison.

This class extends frozenset to support DB-API 2.0 type comparison semantics.
It allows for flexible type checking where individual items can be compared
against the set using both equality and inequality operators.

This is used for type constants like STRING, BINARY, NUMBER, etc. to enable
comparisons like “field_type == STRING” where field_type is a single type value.

### Examples

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

#### NOTE
- chDB’s DB-API 2.0 interface is compatible with most Python database tools
- The interface provides Level 1 thread safety (threads may share modules but not connections)
- Connection strings support the same parameters as chDB sessions
- All standard DB-API 2.0 exceptions are supported

#### WARNING
- Always close cursors and connections to avoid resource leaks
- Large result sets should be processed in batches
- Parameter binding syntax follows format style: `%s`

## User-Defined Functions (UDF)

User-defined functions module for chDB.

This module provides functionality for creating and managing user-defined functions (UDFs)
in chDB. It allows you to extend chDB’s capabilities by writing custom Python functions
that can be called from SQL queries.

### chdb.udf.chdb_udf(return_type='String')

Decorator for chDB Python UDF(User Defined Function).

* **Parameters:**
  **return_type** (*str*) – Return type of the function. Default is “String”.
  Should be one of the ClickHouse data types.

### Notes

1. The function should be stateless. Only UDFs are supported, not UDAFs.
2. Default return type is String. The return type should be one of the ClickHouse data types.
3. The function should take in arguments of type String. All arguments are strings.
4. The function will be called for each line of input.
5. The function should be pure python function. Import all modules used IN THE FUNCTION.
6. Python interpreter used is the same as the one used to run the script.

### Example

```python
@chdb_udf()
def sum_udf(lhs, rhs):
    return int(lhs) + int(rhs)

@chdb_udf()
def func_use_json(arg):
    import json
    # ... use json module
```

### chdb.udf.generate_udf(func_name, args, return_type, udf_body)

Generate UDF configuration and executable script files.

This function creates the necessary files for a User Defined Function (UDF) in chDB:
1. A Python executable script that processes input data
2. An XML configuration file that registers the UDF with ClickHouse

* **Parameters:**
    * **func_name** (*str*) – Name of the UDF function
    * **args** (*list*) – List of argument names for the function
    * **return_type** (*str*) – ClickHouse return type for the function
    * **udf_body** (*str*) – Python source code body of the UDF function

#### NOTE
This function is typically called by the @chdb_udf decorator and should not
be called directly by users.

## Utilities

Utility functions and helpers for chDB.

This module contains various utility functions for working with chDB, including
data type inference, data conversion helpers, and debugging utilities.

### chdb.utils.convert_to_columnar(items: List[Dict[str, Any]]) → Dict[str, List[Any]]

Converts a list of dictionaries into a columnar format.

This function takes a list of dictionaries and converts it into a dictionary
where each key corresponds to a column and each value is a list of column values.
Missing values in the dictionaries are represented as None.

* **Parameters:**
  **items** (*List[Dict[str, Any]]*) – A list of dictionaries to convert.
* **Returns:**
  *Dict[str, List[Any]]* –

  A dictionary with keys as column names and values as lists
  : of column values.

### Example

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

### chdb.utils.flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '_') → Dict[str, Any]

Flattens a nested dictionary.

This function takes a nested dictionary and flattens it, concatenating nested keys
with a separator. Lists of dictionaries are serialized to JSON strings.

* **Parameters:**
    * **d** (*Dict[str, Any]*) – The dictionary to flatten.
    * **parent_key** (*str, optional*) – The base key to prepend to each key. Defaults to “”.
    * **sep** (*str, optional*) – The separator to use between concatenated keys. Defaults to “_”.
* **Returns:**
  *Dict[str, Any]* – A flattened dictionary.

### Example

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

### chdb.utils.infer_data_type(values: List[Any]) → str

Infers the most suitable data type for a list of values.

This function examines a list of values and determines the most appropriate
data type that can represent all the values in the list. It considers integer,
unsigned integer, decimal, and float types, and defaults to “string” if the
values cannot be represented by any numeric type or if all values are None.

* **Parameters:**
  **values** (*List[Any]*) – A list of values to analyze. The values can be of any type.
* **Returns:**
  *str* –

  A string representing the inferred data type. Possible return values are:
  : ”int8”, “int16”, “int32”, “int64”, “int128”, “int256”, “uint8”, “uint16”,
  “uint32”, “uint64”, “uint128”, “uint256”, “decimal128”, “decimal256”,
  “float32”, “float64”, or “string”.

### Notes

- If all values in the list are None, the function returns “string”.
- If any value in the list is a string, the function immediately returns “string”.
- The function assumes that numeric values can be represented as integers,
  decimals, or floats based on their range and precision.

### chdb.utils.infer_data_types(column_data: Dict[str, List[Any]], n_rows: int = 10000) → List[tuple]

Infers data types for each column in a columnar data structure.

This function analyzes the values in each column and infers the most suitable
data type for each column, based on a sample of the data.

* **Parameters:**
    * **column_data** (*Dict[str, List[Any]]*) – A dictionary where keys are column names
      and values are lists of column values.
    * **n_rows** (*int, optional*) – The number of rows to sample for type inference.
      Defaults to 10000.
* **Returns:**
  *List[tuple]* –

  A list of tuples, each containing a column name and its
  : inferred data type.

## Abstract Base Classes

### *class* chdb.rwabc.PyReader(data: Any)

Bases: `ABC`

#### *abstractmethod* read(col_names: List[str], count: int) → List[Any]

Read a specified number of rows from the given columns and return a list of objects,
where each object is a sequence of values for a column.

* **Parameters:**
    * **col_names** (*List[str]*) – List of column names to read.
    * **count** (*int*) – Maximum number of rows to read.
* **Returns:**
  *List[Any]* – List of sequences, one for each column.

### *class* chdb.rwabc.PyWriter(col_names: List[str], types: List[type], data: Any)

Bases: `ABC`

#### *abstractmethod* finalize() → bytes

Assemble and return the final data from blocks. Must be implemented by subclasses.

* **Returns:**
  *bytes* – The final serialized data.

#### *abstractmethod* write(col_names: List[str], columns: List[List[Any]]) → None

Save columns of data to blocks. Must be implemented by subclasses.

* **Parameters:**
    * **col_names** (*List[str]*) – List of column names that are being written.
    * **columns** (*List[List[Any]]*) – List of columns data, each column is represented by a list.

## Exception Handling

### *class* chdb.ChdbError

Bases: `Exception`

Base exception class for chDB-related errors.

This exception is raised when chDB query execution fails or encounters
an error. It inherits from the standard Python Exception class and
provides error information from the underlying ClickHouse engine.

The exception message typically contains detailed error information
from ClickHouse, including syntax errors, type mismatches, missing
tables/columns, and other query execution issues.

* **Variables:**
  **args** – Tuple containing the error message and any additional arguments

### Examples

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

#### NOTE
This exception is automatically raised by chdb.query() and related
functions when the underlying ClickHouse engine reports an error.
You should catch this exception when handling potentially failing
queries to provide appropriate error handling in your application.

## Version Information

### chdb.chdb_version *= ('3', '6', '0')*

Built-in immutable sequence.

If no argument is given, the constructor returns an empty tuple.
If iterable is specified the tuple is initialized from iterable’s items.

If the argument is a tuple, the return value is the same object.

### chdb.engine_version *= '25.5.2.1'*

str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str

Create a new string object from the given object. If encoding or
errors is specified, then the object must expose a data buffer
that will be decoded using the given encoding and error handler.
Otherwise, returns the result of object._\_str_\_() (if defined)
or repr(object).
encoding defaults to ‘utf-8’.
errors defaults to ‘strict’.

### chdb.\_\_version_\_ *= '3.6.0'*

str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str

Create a new string object from the given object. If encoding or
errors is specified, then the object must expose a data buffer
that will be decoded using the given encoding and error handler.
Otherwise, returns the result of object._\_str_\_() (if defined)
or repr(object).
encoding defaults to ‘utf-8’.
errors defaults to ‘strict’.
