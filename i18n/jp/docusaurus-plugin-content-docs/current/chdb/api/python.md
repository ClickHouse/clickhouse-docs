---
title: 'chDB Python API リファレンス'
sidebar_label: 'Python API'
slug: /chdb/api/python
description: 'chDB 用 Python API の完全リファレンス'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'api', 'reference']
doc_type: 'reference'
---



# Python API リファレンス



## コアクエリ関数 {#core-query-functions}

### `chdb.query` {#chdb-query}

chDBエンジンを使用してSQLクエリを実行します。

これは、組み込みのClickHouseエンジンを使用してSQLステートメントを実行するメインクエリ関数です。さまざまな出力形式をサポートし、インメモリデータベースまたはファイルベースのデータベースで動作します。

**構文**

```python
chdb.query(sql, output_format='CSV', path='', udf_path='')
```

**パラメータ**

| パラメータ       | 型 | デフォルト    | 説明                                                                                                                                                                                                                                                                                                     |
| --------------- | ---- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`           | str  | _必須_ | 実行するSQLクエリ文字列                                                                                                                                                                                                                                                                                     |
| `output_format` | str  | `"CSV"`    | 結果の出力形式。サポートされている形式:<br/>• `"CSV"` - カンマ区切り値<br/>• `"JSON"` - JSON形式<br/>• `"Arrow"` - Apache Arrow形式<br/>• `"Parquet"` - Parquet形式<br/>• `"DataFrame"` - Pandas DataFrame<br/>• `"ArrowTable"` - PyArrow Table<br/>• `"Debug"` - 詳細ログを有効化 |
| `path`          | str  | `""`       | データベースファイルのパス。デフォルトはインメモリデータベース。<br/>ファイルパスまたはインメモリデータベースの場合は`":memory:"`を指定可能                                                                                                                                                                                               |
| `udf_path`      | str  | `""`       | ユーザー定義関数ディレクトリへのパス                                                                                                                                                                                                                                                                        |

**戻り値**

指定された形式でクエリ結果を返します:

| 戻り値の型        | 条件                                                |
| ------------------ | -------------------------------------------------------- |
| `str`              | CSVやJSONなどのテキスト形式の場合                          |
| `pd.DataFrame`     | `output_format`が`"DataFrame"`または`"dataframe"`の場合   |
| `pa.Table`         | `output_format`が`"ArrowTable"`または`"arrowtable"`の場合 |
| chdb結果オブジェクト | その他の形式の場合                                        |

**例外**

| 例外     | 条件                                                        |
| ------------- | ---------------------------------------------------------------- |
| `ChdbError`   | SQLクエリの実行が失敗した場合                                 |
| `ImportError` | DataFrame/Arrow形式に必要な依存関係が不足している場合 |

**例**

```pycon
>>> # 基本的なCSVクエリ
>>> result = chdb.query("SELECT 1, 'hello'")
>>> print(result)
"1,hello"
```

```pycon
>>> # DataFrame出力を使用したクエリ
>>> df = chdb.query("SELECT 1 as id, 'hello' as msg", "DataFrame")
>>> print(df)
   id    msg
0   1  hello
```

```pycon
>>> # ファイルベースのデータベースを使用したクエリ
>>> result = chdb.query("CREATE TABLE test (id INT) ENGINE = Memory", path="mydb.chdb")
```

```pycon
>>> # UDFを使用したクエリ
>>> result = chdb.query("SELECT my_udf('test')", udf_path="/path/to/udfs")
```

---

### `chdb.sql` {#chdb_sql}

chDBエンジンを使用してSQLクエリを実行します。

これは、組み込みのClickHouseエンジンを使用してSQLステートメントを実行するメインクエリ関数です。さまざまな出力形式をサポートし、インメモリデータベースまたはファイルベースのデータベースで動作します。

**構文**

```python
chdb.sql(sql, output_format='CSV', path='', udf_path='')
```

**パラメータ**

| パラメータ       | 型 | デフォルト    | 説明                                                                                                                                                                                                                                                                                                     |
| --------------- | ---- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`           | str  | _必須_ | 実行するSQLクエリ文字列                                                                                                                                                                                                                                                                                     |
| `output_format` | str  | `"CSV"`    | 結果の出力形式。サポートされている形式:<br/>• `"CSV"` - カンマ区切り値<br/>• `"JSON"` - JSON形式<br/>• `"Arrow"` - Apache Arrow形式<br/>• `"Parquet"` - Parquet形式<br/>• `"DataFrame"` - Pandas DataFrame<br/>• `"ArrowTable"` - PyArrow Table<br/>• `"Debug"` - 詳細ログを有効化 |
| `path`          | str  | `""`       | データベースファイルのパス。デフォルトはインメモリデータベース。<br/>ファイルパスまたはインメモリデータベースの場合は`":memory:"`を指定可能                                                                                                                                                                                               |
| `udf_path`      | str  | `""`       | ユーザー定義関数ディレクトリへのパス                                                                                                                                                                                                                                                                        |

**戻り値**

指定された形式でクエリ結果を返します:


| 戻り値の型        | 条件                                                |
| ------------------ | -------------------------------------------------------- |
| `str`              | CSV、JSONなどのテキスト形式の場合                          |
| `pd.DataFrame`     | `output_format` が `"DataFrame"` または `"dataframe"` の場合   |
| `pa.Table`         | `output_format` が `"ArrowTable"` または `"arrowtable"` の場合 |
| chdb result object | その他の形式の場合                                        |

**例外**

| 例外                 | 条件                                                        |
| ------------------------- | ---------------------------------------------------------------- |
| [`ChdbError`](#chdberror) | SQLクエリの実行に失敗した場合                                 |
| `ImportError`             | DataFrame/Arrow形式に必要な依存関係が不足している場合 |

**例**

```pycon
>>> # 基本的なCSVクエリ
>>> result = chdb.query("SELECT 1, 'hello'")
>>> print(result)
"1,hello"
```

```pycon
>>> # DataFrame出力を使用したクエリ
>>> df = chdb.query("SELECT 1 as id, 'hello' as msg", "DataFrame")
>>> print(df)
   id    msg
0   1  hello
```

```pycon
>>> # ファイルベースのデータベースを使用したクエリ
>>> result = chdb.query("CREATE TABLE test (id INT) ENGINE = Memory", path="mydb.chdb")
```

```pycon
>>> # UDFを使用したクエリ
>>> result = chdb.query("SELECT my_udf('test')", udf_path="/path/to/udfs")
```

---

### `chdb.to_arrowTable` {#chdb-state-sqlitelike-to_arrowtable}

クエリ結果をPyArrow Tableに変換します。

chDBクエリ結果を効率的なカラムナーデータ処理のためにPyArrow Tableに変換します。
結果が空の場合は空のテーブルを返します。

**構文**

```python
chdb.to_arrowTable(res)
```

**パラメータ**

| パラメータ | 説明                                           |
| --------- | ----------------------------------------------------- |
| `res`     | バイナリArrowデータを含むchDBクエリ結果オブジェクト |

**戻り値**

| 戻り値の型 | 説明                                |
| ----------- | ------------------------------------------ |
| `pa.Table`  | クエリ結果を含むPyArrow Table |

**例外**

| エラー型    | 説明                            |
| ------------- | -------------------------------------- |
| `ImportError` | pyarrowまたはpandasがインストールされていない場合 |

**例**

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> table = chdb.to_arrowTable(result)
>>> print(table.to_pandas())
   id    msg
0   1  hello
```

---

### `chdb.to_df` {#chdb_to_df}

クエリ結果をpandas DataFrameに変換します。

chDBクエリ結果を、まずPyArrow Tableに変換し、次にマルチスレッドを使用してpandasに変換することで、より高いパフォーマンスでpandas DataFrameに変換します。

**構文**

```python
chdb.to_df(r)
```

**パラメータ**

| パラメータ | 説明                                           |
| --------- | ----------------------------------------------------- |
| `r`       | バイナリArrowデータを含むchDBクエリ結果オブジェクト |

**戻り値**

| 戻り値の型    | 説明                                   |
| -------------- | --------------------------------------------- |
| `pd.DataFrame` | クエリ結果を含むpandas DataFrame |

**例外**

| 例外     | 条件                              |
| ------------- | -------------------------------------- |
| `ImportError` | pyarrowまたはpandasがインストールされていない場合 |

**例**

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> df = chdb.to_df(result)
>>> print(df)
   id    msg
0   1  hello
```


## 接続とセッション管理 {#connection-session-management}

以下のセッション関数が利用可能です：

### `chdb.connect` {#chdb-connect}

chDBバックグラウンドサーバーへの接続を作成します。

この関数は、chDB（ClickHouse）データベースエンジンへの[接続](#chdb-state-sqlitelike-connection)を確立します。
プロセスごとに開くことができる接続は1つのみです。
同じ接続文字列で複数回呼び出した場合、同じ接続オブジェクトが返されます。

```python
chdb.connect(connection_string: str = ':memory:') → Connection
```

**パラメータ：**

| パラメータ           | 型 | デフォルト      | 説明                                    |
| ------------------- | ---- | ------------ | ---------------------------------------------- |
| `connection_string` | str  | `":memory:"` | データベース接続文字列。以下の形式を参照してください。 |

**基本形式**

| 形式                    | 説明                  |
| ------------------------- | ---------------------------- |
| `":memory:"`              | インメモリデータベース（デフォルト） |
| `"test.db"`               | 相対パスのデータベースファイル  |
| `"file:test.db"`          | 相対パスと同じ        |
| `"/path/to/test.db"`      | 絶対パスのデータベースファイル  |
| `"file:/path/to/test.db"` | 絶対パスと同じ        |

**クエリパラメータ付き**

| 形式                                             | 説明               |
| -------------------------------------------------- | ------------------------- |
| `"file:test.db?param1=value1&param2=value2"`       | パラメータ付き相対パス |
| `"file::memory:?verbose&log-level=test"`           | パラメータ付きインメモリ     |
| `"///path/to/test.db?param1=value1&param2=value2"` | パラメータ付き絶対パス |

**クエリパラメータの処理**

クエリパラメータは起動引数としてClickHouseエンジンに渡されます。
特殊なパラメータの処理：

| 特殊パラメータ | 変換後        | 説明             |
| ----------------- | -------------- | ----------------------- |
| `mode=ro`         | `--readonly=1` | 読み取り専用モード          |
| `verbose`         | (フラグ)         | 詳細ログを有効化 |
| `log-level=test`  | (設定)      | ログレベルを設定      |

完全なパラメータリストについては、`clickhouse local --help --verbose`を参照してください

**戻り値**

| 戻り値の型  | 説明                                                                                                                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Connection` | 以下をサポートするデータベース接続オブジェクト：<br/>• `Connection.cursor()`によるカーソルの作成<br/>• `Connection.query()`による直接クエリ<br/>• `Connection.send_query()`によるストリーミングクエリ<br/>• 自動クリーンアップのためのコンテキストマネージャプロトコル |

**例外**

| 例外      | 条件                       |
| -------------- | ------------------------------- |
| `RuntimeError` | データベースへの接続が失敗した場合 |

:::warning
プロセスごとに1つの接続のみがサポートされます。
新しい接続を作成すると、既存の接続はすべて閉じられます。
:::

**例**

```pycon
>>> # インメモリデータベース
>>> conn = connect()
>>> conn = connect(":memory:")
>>>
>>> # ファイルベースのデータベース
>>> conn = connect("my_data.db")
>>> conn = connect("/path/to/data.db")
>>>
>>> # パラメータ付き
>>> conn = connect("data.db?mode=ro")  # 読み取り専用モード
>>> conn = connect(":memory:?verbose&log-level=debug")  # デバッグログ
>>>
>>> # 自動クリーンアップのためのコンテキストマネージャを使用
>>> with connect("data.db") as conn:
...     result = conn.query("SELECT 1")
...     print(result)
>>> # 接続は自動的に閉じられます
```

**関連項目**

- [`Connection`](#chdb-state-sqlitelike-connection) - データベース接続クラス
- [`Cursor`](#chdb-state-sqlitelike-cursor) - DB-API 2.0操作用のデータベースカーソル


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

**使用例**

| Connection String                                  | Description                          |
| -------------------------------------------------- | ------------------------------------ |
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

**構文**

```python
cleanup()
```

:::note
This method will never raise an exception, making it safe to call in
finally blocks or destructors.
:::

**使用例**

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

**構文**

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

**使用例**

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

**構文**

```python
query(sql, fmt='CSV', udf_path='')
```

**Parameters**


| パラメータ  | 型 | デフォルト    | 説明                                                                                                                                                                                                                                                                                                                         |
| ---------- | ---- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`      | str  | _必須_ | 実行するSQLクエリ文字列                                                                                                                                                                                                                                                                                                                         |
| `fmt`      | str  | `"CSV"`    | 結果の出力形式。利用可能な形式:<br/>• `"CSV"` - カンマ区切り値<br/>• `"JSON"` - JSON形式<br/>• `"TabSeparated"` - タブ区切り値<br/>• `"Pretty"` - 整形されたテーブル形式<br/>• `"JSONCompact"` - コンパクトJSON形式<br/>• `"Arrow"` - Apache Arrow形式<br/>• `"Parquet"` - Parquet形式 |
| `udf_path` | str  | `""`       | ユーザー定義関数へのパス。指定しない場合は、セッション初期化時のUDFパスを使用                                                                                                                                                                                                                                     |

**戻り値**

指定された形式でクエリ結果を返します。
正確な戻り値の型は、形式パラメータによって異なります:

- 文字列形式(CSV、JSONなど)は str を返す
- バイナリ形式(Arrow、Parquet)は bytes を返す

**例外**

| 例外      | 条件                           |
| -------------- | ----------------------------------- |
| `RuntimeError` | セッションが閉じられているか無効な場合 |
| `ValueError`   | SQLクエリの形式が不正な場合       |

:::note
「Debug」形式はサポートされておらず、警告とともに自動的に「CSV」に変換されます。
デバッグには、代わりに接続文字列パラメータを使用してください。
:::

:::warning 警告
このメソッドはクエリを同期的に実行し、すべての結果をメモリに読み込みます。大きな結果セットの場合は、ストリーミング結果のために [`send_query()`](#chdb-session-session-send_query) の使用を検討してください。
:::

**例**

```pycon
>>> session = Session("test.db")
>>>
>>> # デフォルトのCSV形式での基本的なクエリ
>>> result = session.query("SELECT 1 as number")
>>> print(result)
number
1
```

```pycon
>>> # JSON形式でのクエリ
>>> result = session.query("SELECT 1 as number", fmt="JSON")
>>> print(result)
{"number": "1"}
```

```pycon
>>> # テーブル作成を含む複雑なクエリ
>>> session.query("CREATE TABLE test (id INT, name String) ENGINE = Memory")
>>> session.query("INSERT INTO test VALUES (1, 'Alice'), (2, 'Bob')")
>>> result = session.query("SELECT * FROM test ORDER BY id")
>>> print(result)
id,name
1,Alice
2,Bob
```

**関連項目**

- [`send_query()`](#chdb-session-session-send_query) - ストリーミングクエリ実行用
- [`sql`](#chdb-session-session-sql) - このメソッドのエイリアス

---

#### `send_query` {#chdb-session-session-send_query}

SQLクエリを実行し、ストリーミング結果イテレータを返します。

このメソッドは、セッションのデータベースに対してSQLクエリを実行し、すべてを一度にメモリに読み込むことなく結果を反復処理できるストリーミング結果オブジェクトを返します。これは、大きな結果セットに特に有用です。

**構文**

```python
send_query(sql, fmt='CSV') → StreamingResult
```

**パラメータ**

| パラメータ | 型 | デフォルト    | 説明                                                                                                                                                                                                                                                                          |
| --------- | ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sql`     | str  | _必須_ | 実行するSQLクエリ文字列                                                                                                                                                                                                                                                          |
| `fmt`     | str  | `"CSV"`    | 結果の出力形式。利用可能な形式:<br/>• `"CSV"` - カンマ区切り値<br/>• `"JSON"` - JSON形式<br/>• `"TabSeparated"` - タブ区切り値<br/>• `"JSONCompact"` - コンパクトJSON形式<br/>• `"Arrow"` - Apache Arrow形式<br/>• `"Parquet"` - Parquet形式 |

**戻り値**

| 戻り値の型       | 説明                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `StreamingResult` | クエリ結果を段階的に生成するストリーミング結果イテレータ。イテレータはforループで使用したり、他のデータ構造に変換したりできます |

**例外**

| 例外      | 条件                           |
| -------------- | ----------------------------------- |
| `RuntimeError` | セッションが閉じられているか無効な場合 |
| `ValueError`   | SQLクエリの形式が不正な場合       |

:::note
The “Debug” format is not supported and will be automatically converted
to “CSV” with a warning. For debugging, use connection string parameters instead.
:::

:::warning
返されたStreamingResultオブジェクトは、データベースへの接続を維持するため、速やかに消費するか適切に保存する必要があります。
:::

**例**


```pycon
>>> session = Session("test.db")
>>> session.query("CREATE TABLE big_table (id INT, data String) ENGINE = MergeTree() order by id")
>>>
>>> # 大規模データセットを挿入
>>> for i in range(1000):
...     session.query(f"INSERT INTO big_table VALUES ({i}, 'data_{i}')")
>>>
>>> # メモリ問題を回避するために結果をストリーミング
>>> streaming_result = session.send_query("SELECT * FROM big_table ORDER BY id")
>>> for chunk in streaming_result:
...     print(f"Processing chunk: {len(chunk)} bytes")
...     # 結果セット全体をロードせずにチャンクを処理
```

```pycon
>>> # コンテキストマネージャーを使用
>>> with session.send_query("SELECT COUNT(*) FROM big_table") as stream:
...     for result in stream:
...         print(f"Count result: {result}")
```

**関連項目**

- [`query()`](#chdb-session-session-query) - 非ストリーミングクエリ実行用
- `chdb.state.sqlitelike.StreamingResult` - ストリーミング結果イテレータ

---

#### `sql` {#chdb-session-session-sql}

SQLクエリを実行して結果を返します。

このメソッドは、セッションのデータベースに対してSQLクエリを実行し、
指定された形式で結果を返します。このメソッドは様々な出力形式をサポートし、
クエリ間でセッション状態を維持します。

**構文**

```python
sql(sql, fmt='CSV', udf_path='')
```

**パラメータ**

| パラメータ  | 型 | デフォルト    | 説明                                                                                                                                                                                                                                                                                                                         |
| ---------- | ---- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`      | str  | _必須_ | 実行するSQLクエリ文字列                                                                                                                                                                                                                                                                                                         |
| `fmt`      | str  | `"CSV"`    | 結果の出力形式。利用可能な形式:<br/>• `"CSV"` - カンマ区切り値<br/>• `"JSON"` - JSON形式<br/>• `"TabSeparated"` - タブ区切り値<br/>• `"Pretty"` - 整形されたテーブル形式<br/>• `"JSONCompact"` - コンパクトJSON形式<br/>• `"Arrow"` - Apache Arrow形式<br/>• `"Parquet"` - Parquet形式 |
| `udf_path` | str  | `""`       | ユーザー定義関数へのパス。指定されない場合、セッション初期化時のUDFパスを使用                                                                                                                                                                                                                                                     |

**戻り値**

指定された形式でクエリ結果を返します。
正確な戻り値の型はformatパラメータに依存します:

- 文字列形式(CSV、JSONなど)はstrを返す
- バイナリ形式(Arrow、Parquet)はbytesを返す

**例外:**

| 例外      | 条件                           |
| -------------- | ----------------------------------- |
| `RuntimeError` | セッションが閉じられているか無効な場合 |
| `ValueError`   | SQLクエリが不正な形式の場合       |

:::note
"Debug"形式はサポートされておらず、警告とともに自動的に
"CSV"に変換されます。デバッグには、代わりに接続文字列パラメータを
使用してください。
:::

:::warning 警告
このメソッドはクエリを同期的に実行し、すべての結果を
メモリにロードします。
大規模な結果セットの場合は、ストリーミング結果のために[`send_query()`](#chdb-session-session-send_query)の使用を検討してください。
:::

**例**

```pycon
>>> session = Session("test.db")
>>>
>>> # デフォルトのCSV形式での基本的なクエリ
>>> result = session.query("SELECT 1 as number")
>>> print(result)
number
1
```

```pycon
>>> # JSON形式でのクエリ
>>> result = session.query("SELECT 1 as number", fmt="JSON")
>>> print(result)
{"number": "1"}
```

```pycon
>>> # テーブル作成を含む複雑なクエリ
>>> session.query("CREATE TABLE test (id INT, name String) ENGINE = MergeTree() order by id")
>>> session.query("INSERT INTO test VALUES (1, 'Alice'), (2, 'Bob')")
>>> result = session.query("SELECT * FROM test ORDER BY id")
>>> print(result)
id,name
1,Alice
2,Bob
```

**関連項目**

- [`send_query()`](#chdb-session-session-send_query) - ストリーミングクエリ実行用
- [`sql`](#chdb-session-session-sql) - このメソッドのエイリアス


## 状態管理 {#chdb-state-management}

### `chdb.state.connect` {#chdb_state_connect}

chDBバックグラウンドサーバーへの[Connection](#chdb-state-sqlitelike-connection)を作成します。

この関数はchDB（ClickHouse）データベースエンジンへの接続を確立します。
プロセスごとに開くことができる接続は1つのみです。同じ接続文字列で複数回呼び出した場合、同じ接続オブジェクトが返されます。

**構文**

```python
chdb.state.connect(connection_string: str = ':memory:') → Connection
```

**パラメータ**

| パラメータ                          | 型 | デフォルト      | 説明                                    |
| ---------------------------------- | ---- | ------------ | ---------------------------------------------- |
| `connection_string(str, optional)` | str  | `":memory:"` | データベース接続文字列。以下の形式を参照してください。 |

**基本形式**

サポートされている接続文字列の形式：

| 形式                    | 説明                  |
| ------------------------- | ---------------------------- |
| `":memory:"`              | インメモリデータベース（デフォルト） |
| `"test.db"`               | 相対パスのデータベースファイル  |
| `"file:test.db"`          | 相対パスと同じ        |
| `"/path/to/test.db"`      | 絶対パスのデータベースファイル  |
| `"file:/path/to/test.db"` | 絶対パスと同じ        |

**クエリパラメータ付き**

| 形式                                             | 説明               |
| -------------------------------------------------- | ------------------------- |
| `"file:test.db?param1=value1&param2=value2"`       | パラメータ付き相対パス |
| `"file::memory:?verbose&log-level=test"`           | パラメータ付きインメモリ     |
| `"///path/to/test.db?param1=value1&param2=value2"` | パラメータ付き絶対パス |

**クエリパラメータの処理**

クエリパラメータは起動引数としてClickHouseエンジンに渡されます。
特殊なパラメータの処理：

| 特殊パラメータ | 変換後        | 説明             |
| ----------------- | -------------- | ----------------------- |
| `mode=ro`         | `--readonly=1` | 読み取り専用モード          |
| `verbose`         | (flag)         | 詳細ログを有効化 |
| `log-level=test`  | (setting)      | ログレベルを設定      |

完全なパラメータリストについては、`clickhouse local --help --verbose`を参照してください

**戻り値**

| 戻り値の型  | 説明                                                                                                                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Connection` | 以下をサポートするデータベース接続オブジェクト：<br/>• `Connection.cursor()`によるカーソルの作成<br/>• `Connection.query()`による直接クエリ<br/>• `Connection.send_query()`によるストリーミングクエリ<br/>• 自動クリーンアップのためのコンテキストマネージャプロトコル |

**例外**

| 例外      | 条件                       |
| -------------- | ------------------------------- |
| `RuntimeError` | データベースへの接続が失敗した場合 |

:::warning 警告
プロセスごとに1つの接続のみがサポートされています。
新しい接続を作成すると、既存の接続はすべて閉じられます。
:::

**例**

```pycon
>>> # インメモリデータベース
>>> conn = connect()
>>> conn = connect(":memory:")
>>>
>>> # ファイルベースのデータベース
>>> conn = connect("my_data.db")
>>> conn = connect("/path/to/data.db")
>>>
>>> # パラメータ付き
>>> conn = connect("data.db?mode=ro")  # 読み取り専用モード
>>> conn = connect(":memory:?verbose&log-level=debug")  # デバッグログ
>>>
>>> # 自動クリーンアップのためのコンテキストマネージャを使用
>>> with connect("data.db") as conn:
...     result = conn.query("SELECT 1")
...     print(result)
>>> # 接続は自動的に閉じられます
```

**関連項目**

- `Connection` - データベース接続クラス
- `Cursor` - DB-API 2.0操作用のデータベースカーソル

### **class** `chdb.state.sqlitelike.Connection` {#chdb-state-sqlitelike-connection}

基底クラス: `object`

**構文**

```python
class chdb.state.sqlitelike.Connection(connection_string: str)
```

---

#### `close` {#chdb-session-session-close}

接続を閉じてリソースをクリーンアップします。

このメソッドはデータベース接続を閉じ、アクティブなカーソルを含む関連するすべてのリソースをクリーンアップします。このメソッドを呼び出した後、接続は無効になり、それ以降の操作には使用できません。

**構文**

```python
close() → None
```

:::note
このメソッドは冪等性があります - 複数回呼び出しても安全です。
:::

:::warning 警告
接続が閉じられると、実行中のストリーミングクエリはすべてキャンセルされます。閉じる前に、重要なデータがすべて処理されていることを確認してください。
:::

**例**

```pycon
>>> conn = connect("test.db")
>>> # クエリに接続を使用
>>> conn.query("CREATE TABLE test (id INT) ENGINE = Memory")
>>> # 完了したら閉じる
>>> conn.close()
```


```pycon
>>> # コンテキストマネージャーを使用（自動クリーンアップ）
>>> with connect("test.db") as conn:
...     conn.query("SELECT 1")
...     # 接続は自動的にクローズされます
```

---

#### `cursor` {#chdb-state-sqlitelike-connection-cursor}

クエリを実行するための[Cursor](#chdb-state-sqlitelike-cursor)オブジェクトを作成します。

このメソッドは、クエリの実行と結果の取得のための標準的なDB-API 2.0インターフェースを提供するデータベースカーソルを作成します。カーソルを使用することで、クエリの実行と結果の取得をきめ細かく制御できます。

**構文**

```python
cursor() → Cursor
```

**戻り値**

| 戻り値の型 | 説明                             |
| ----------- | --------------------------------------- |
| `Cursor`    | データベース操作用のカーソルオブジェクト |

:::note
新しいカーソルを作成すると、この接続に関連付けられている既存のカーソルが置き換えられます。接続ごとに1つのカーソルのみがサポートされています。
:::

**例**

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

**関連項目**

- [`Cursor`](#chdb-state-sqlitelike-cursor) - データベースカーソルの実装

---

#### `query` {#chdb-state-sqlitelike-connection-query}

SQLクエリを実行し、完全な結果を返します。

このメソッドは、SQLクエリを同期的に実行し、完全な結果セットを返します。さまざまな出力形式をサポートし、形式固有の後処理を自動的に適用します。

**構文**

```python
query(query: str, format: str = 'CSV') → Any
```

**パラメータ:**

| パラメータ | 型 | デフォルト    | 説明                                                                                                                                                                                                                                                                                        |
| --------- | ---- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`   | str  | _必須_ | 実行するSQLクエリ文字列                                                                                                                                                                                                                                                                                        |
| `format`  | str  | `"CSV"`    | 結果の出力形式。サポートされている形式:<br/>• `"CSV"` - カンマ区切り値（文字列）<br/>• `"JSON"` - JSON形式（文字列）<br/>• `"Arrow"` - Apache Arrow形式（バイト列）<br/>• `"Dataframe"` - Pandas DataFrame（pandasが必要）<br/>• `"Arrowtable"` - PyArrow Table（pyarrowが必要） |

**戻り値**

| 戻り値の型        | 説明                    |
| ------------------ | ------------------------------ |
| `str`              | 文字列形式（CSV、JSON）の場合 |
| `bytes`            | Arrow形式の場合               |
| `pandas.DataFrame` | dataframe形式の場合           |
| `pyarrow.Table`    | arrowtable形式の場合          |

**例外**

| 例外      | 条件                                         |
| -------------- | ------------------------------------------------- |
| `RuntimeError` | クエリの実行が失敗した場合                          |
| `ImportError`  | 形式に必要なパッケージがインストールされていない場合 |

:::warning 警告
このメソッドは結果セット全体をメモリに読み込みます。大きな結果の場合は、ストリーミングのために[`send_query()`](#chdb-state-sqlitelike-connection-send_query)の使用を検討してください。
:::

**例**

```pycon
>>> conn = connect(":memory:")
>>>
>>> # 基本的なCSVクエリ
>>> result = conn.query("SELECT 1 as num, 'hello' as text")
>>> print(result)
num,text
1,hello
```

```pycon
>>> # DataFrame形式
>>> df = conn.query("SELECT number FROM numbers(5)", "dataframe")
>>> print(df)
   number
0       0
1       1
2       2
3       3
4       4
```

**関連項目**

- [`send_query()`](#chdb-state-sqlitelike-connection-send_query) - ストリーミングクエリ実行用

---

#### `send_query` {#chdb-state-sqlitelike-connection-send_query}

SQLクエリを実行し、ストリーミング結果イテレータを返します。

このメソッドは、SQLクエリを実行し、すべてを一度にメモリに読み込むことなく結果を反復処理できるStreamingResultオブジェクトを返します。これは大きな結果セットを処理する場合に最適です。

**構文**

```python
send_query(query: str, format: str = 'CSV') → StreamingResult
```

**パラメータ**


| パラメータ | 型 | デフォルト    | 説明                                                                                                                                                                                                                                                                       |
| --------- | ---- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`   | str  | _必須_ | 実行するSQLクエリ文字列                                                                                                                                                                                                                                                                       |
| `format`  | str  | `"CSV"`    | 結果の出力形式。サポートされている形式:<br/>• `"CSV"` - カンマ区切り値<br/>• `"JSON"` - JSON形式<br/>• `"Arrow"` - Apache Arrow形式（record_batch()メソッドを有効化）<br/>• `"dataframe"` - Pandas DataFrameチャンク<br/>• `"arrowtable"` - PyArrow Tableチャンク |

**戻り値**

| 戻り値の型       | 説明                                                                                                                                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StreamingResult` | クエリ結果のストリーミングイテレータで、以下をサポート:<br/>• イテレータプロトコル（forループ）<br/>• コンテキストマネージャプロトコル（with文）<br/>• fetch()メソッドによる手動フェッチ<br/>• PyArrow RecordBatchストリーミング（Arrow形式のみ） |

**例外**

| 例外      | 条件                                         |
| -------------- | ------------------------------------------------- |
| `RuntimeError` | クエリの実行が失敗した場合                          |
| `ImportError`  | 形式に必要なパッケージがインストールされていない場合 |

:::note
返されるStreamingResultの`record_batch()`メソッドをサポートするのは"Arrow"形式のみです。
:::

**例**

```pycon
>>> conn = connect(":memory:")
>>>
>>> # 基本的なストリーミング
>>> stream = conn.send_query("SELECT number FROM numbers(1000)")
>>> for chunk in stream:
...     print(f"チャンクを処理中: {len(chunk)} バイト")
```

```pycon
>>> # クリーンアップのためのコンテキストマネージャの使用
>>> with conn.send_query("SELECT * FROM large_table") as stream:
...     chunk = stream.fetch()
...     while chunk:
...         process_data(chunk)
...         chunk = stream.fetch()
```

```pycon
>>> # RecordBatchストリーミングを使用したArrow形式
>>> stream = conn.send_query("SELECT * FROM data", "Arrow")
>>> reader = stream.record_batch(rows_per_batch=10000)
>>> for batch in reader:
...     print(f"バッチの形状: {batch.num_rows} x {batch.num_columns}")
```

**関連項目**

- [`query()`](#chdb-state-sqlitelike-connection-query) - 非ストリーミングクエリ実行用
- `StreamingResult` - ストリーミング結果イテレータ

---

### **class** `chdb.state.sqlitelike.Cursor` {#chdb-state-sqlitelike-cursor}

Bases: `object`

```python
class chdb.state.sqlitelike.Cursor(connection)
```

---

#### `close` {#cursor-close-none}

カーソルを閉じてリソースをクリーンアップします。

このメソッドはカーソルを閉じ、関連するすべてのリソースをクリーンアップします。
このメソッドを呼び出した後、カーソルは無効になり、それ以降の操作には
使用できません。

**構文**

```python
close() → None
```

:::note
このメソッドは冪等性があります - 複数回呼び出しても安全です。
カーソルは接続が閉じられたときにも自動的に閉じられます。
:::

**例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT 1")
>>> result = cursor.fetchone()
>>> cursor.close()  # カーソルリソースをクリーンアップ
```

---

#### `column_names` {#chdb-state-sqlitelike-cursor-column_names}

最後に実行されたクエリのカラム名のリストを返します。

このメソッドは、最後に実行されたSELECTクエリのカラム名を返します。
名前は結果セットに表示される順序と同じ順序で返されます。

**構文**

```python
column_names() → list
```

**戻り値**

| 戻り値の型 | 説明                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| `list`      | カラム名文字列のリスト、またはクエリが実行されていない場合やクエリがカラムを返さなかった場合は空のリスト |

**例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name, email FROM users LIMIT 1")
>>> print(cursor.column_names())
['id', 'name', 'email']
```

**See also**

- [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - カラム型情報の取得
- [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0カラム記述

---

#### `column_types` {#chdb-state-sqlitelike-cursor-column_types}

最後に実行されたクエリのカラム型のリストを返します。

このメソッドは、最後に実行されたSELECTクエリのClickHouseカラム型名を返します。
型は結果セットに表示される順序と同じ順序で返されます。

**構文**

```python
column_types() → list
```

**戻り値**


| 戻り値の型 | 説明                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `list`      | ClickHouseの型名文字列のリスト。クエリが実行されていない場合、またはクエリが列を返さなかった場合は空のリスト |

**例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT toInt32(1), toString('hello')")
>>> print(cursor.column_types())
['Int32', 'String']
```

**関連項目**

- [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - 列名情報を取得
- [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0の列記述

---

#### `commit` {#commit}

保留中のトランザクションをコミットします。

このメソッドは保留中のデータベーストランザクションをコミットします。ClickHouseでは
ほとんどの操作が自動コミットされますが、このメソッドはDB-API 2.0との
互換性のために提供されています。

:::note
ClickHouseは通常、操作を自動コミットするため、明示的なコミットは
通常必要ありません。このメソッドは標準的なDB-API 2.0ワークフローとの
互換性のために提供されています。
:::

**構文**

```python
commit() → None
```

**例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("INSERT INTO test VALUES (1, 'data')")
>>> cursor.commit()
```

---

#### `property description : list` {#chdb-state-sqlitelike-cursor-description}

DB-API 2.0仕様に従って列の記述を返します。

このプロパティは、最後に実行されたSELECTクエリの結果セット内の各列を
記述する7項目のタプルのリストを返します。各タプルには以下が含まれます:
(name, type_code, display_size, internal_size, precision, scale, null_ok)

現在、nameとtype_codeのみが提供され、他のフィールドはNoneに設定されています。

**戻り値**

| 戻り値の型 | 説明                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------- |
| `list`      | 各列を記述する7要素タプルのリスト。SELECTクエリが実行されていない場合は空のリスト |

:::note
これはcursor.descriptionのDB-API 2.0仕様に従っています。
この実装では、最初の2つの要素(nameとtype_code)のみが意味のある
データを含んでいます。
:::

**例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users LIMIT 1")
>>> for desc in cursor.description:
...     print(f"列: {desc[0]}, 型: {desc[1]}")
列: id, 型: Int32
列: name, 型: String
```

**関連項目**

- [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - 列名のみを取得
- [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - 列の型のみを取得

---

#### `execute` {#execute}

SQLクエリを実行し、結果の取得を準備します。

このメソッドはSQLクエリを実行し、fetchメソッドを使用して結果を取得できるように
準備します。結果データの解析とClickHouseデータ型の自動型変換を処理します。

**構文**

```python
execute(query: str) → None
```

**パラメータ:**

| パラメータ | 型 | 説明                 |
| --------- | ---- | --------------------------- |
| `query`   | str  | 実行するSQLクエリ文字列 |

**例外**

| 例外   | 条件                                        |
| ----------- | ------------------------------------------------ |
| `Exception` | クエリの実行または結果の解析が失敗した場合 |

:::note
このメソッドは`cursor.execute()`のDB-API 2.0仕様に従っています。
実行後、`fetchone()`、`fetchmany()`、または`fetchall()`を使用して
結果を取得してください。
:::

:::note
このメソッドはClickHouseデータ型を適切なPython型に自動変換します:

- Int/UInt型 → int
- Float型 → float
- String/FixedString → str
- DateTime → datetime.datetime
- Date → datetime.date
- Bool → bool
  :::

**例**

```pycon
>>> cursor = conn.cursor()
>>>
>>> # DDLを実行
>>> cursor.execute("CREATE TABLE test (id INT, name String) ENGINE = Memory")
>>>
>>> # DMLを実行
>>> cursor.execute("INSERT INTO test VALUES (1, 'Alice')")
>>>
>>> # SELECTを実行して結果を取得
>>> cursor.execute("SELECT * FROM test")
>>> rows = cursor.fetchall()
>>> print(rows)
((1, 'Alice'),)
```

**関連項目**

- [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 単一行を取得
- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 複数行を取得
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 残りのすべての行を取得


---

#### `fetchall` {#chdb-state-sqlitelike-cursor-fetchall}

クエリ結果から残りのすべての行を取得します。

このメソッドは、現在のカーソル位置から現在のクエリ結果セットの残りのすべての行を取得します。適切なPython型変換が適用された行タプルのタプルを返します。

**構文**

```python
fetchall() → tuple
```

**戻り値:**

| 戻り値の型 | 説明 |
|-------------|-------------|
| `tuple` | 結果セットの残りのすべての行タプルを含むタプル。利用可能な行がない場合は空のタプルを返します |

:::warning 警告
このメソッドは残りのすべての行を一度にメモリに読み込みます。大きな結果セットの場合は、結果をバッチで処理するために[`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany)の使用を検討してください。
:::

**例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users")
>>> all_users = cursor.fetchall()
>>> for user_id, user_name in all_users:
...     print(f"User {user_id}: {user_name}")
```

**関連項目**
- [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 単一行を取得
- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 複数行をバッチで取得

---

#### `fetchmany` {#chdb-state-sqlitelike-cursor-fetchmany}

クエリ結果から複数行を取得します。

このメソッドは、現在のクエリ結果セットから最大'size'行を取得します。各行が適切なPython型変換された列値を含む行タプルのタプルを返します。

**構文**

```python
fetchmany(size: int = 1) → tuple
```

**パラメータ**

| パラメータ | 型 | デフォルト | 説明                     |
| --------- | ---- | ------- | ------------------------------- |
| `size`    | int  | `1`     | 取得する最大行数 |

**戻り値**

| 戻り値の型 | 説明                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `tuple`     | 最大'size'個の行タプルを含むタプル。結果セットが使い果たされた場合、より少ない行を含む可能性があります |

:::note
このメソッドはDB-API 2.0仕様に従います。結果セットが使い果たされた場合、'size'より少ない行を返します。
:::

**例**

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

**関連項目**

- [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 単一行を取得
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 残りのすべての行を取得

---

#### `fetchone` {#chdb-state-sqlitelike-cursor-fetchone}

クエリ結果から次の行を取得します。

このメソッドは、現在のクエリ結果セットから次に利用可能な行を取得します。適切なPython型変換が適用された列値を含むタプルを返します。

**構文**

```python
fetchone() → tuple | None
```

**戻り値:**

| 戻り値の型       | 説明                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| `Optional[tuple]` | 列値のタプルとしての次の行、または利用可能な行がない場合はNone |

:::note
このメソッドはDB-API 2.0仕様に従います。列値はClickHouseの列型に基づいて自動的に適切なPython型に変換されます。
:::

**例**

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

- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 複数行を取得
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 残りのすべての行を取得

---

### `chdb.state.sqlitelike` {#state-sqlitelike-to_arrowtable}

クエリ結果をPyArrow Tableに変換します。

この関数はchdbクエリ結果をPyArrow Table形式に変換します。これにより、効率的な列指向データアクセスと他のデータ処理ライブラリとの相互運用性が提供されます。

**構文**

```python
chdb.state.sqlitelike.to_arrowTable(res)
```

**パラメータ:**


| パラメータ | 型 | 説明                                                |
| --------- | ---- | ---------------------------------------------------------- |
| `res`     | -    | Arrow形式のデータを含むchdbクエリ結果オブジェクト |

**戻り値**

| 戻り値の型     | 説明                                |
| --------------- | ------------------------------------------ |
| `pyarrow.Table` | クエリ結果を含むPyArrow Table |

**例外**

| 例外     | 条件                                       |
| ------------- | ----------------------------------------------- |
| `ImportError` | pyarrowまたはpandasパッケージがインストールされていない場合 |

:::note
この関数を使用するには、pyarrowとpandasの両方がインストールされている必要があります。
インストールするには: `pip install pyarrow pandas`
:::

:::warning 警告
空の結果の場合、スキーマのない空のPyArrow Tableが返されます。
:::

**例**

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

クエリ結果をPandas DataFrameに変換します。

この関数は、chdbクエリ結果をまずPyArrow Tableに変換し、次にDataFrameに変換することで、Pandas DataFrame形式に変換します。これにより、Pandas APIを使用した便利なデータ分析機能が提供されます。

**構文**

```python
chdb.state.sqlitelike.to_df(r)
```

**パラメータ:**

| パラメータ | 型 | 説明                                                |
| --------- | ---- | ---------------------------------------------------------- |
| `r`       | -    | Arrow形式のデータを含むchdbクエリ結果オブジェクト |

**戻り値:**

| 戻り値の型        | 説明                                                                         |
| ------------------ | ----------------------------------------------------------------------------------- |
| `pandas.DataFrame` | 適切な列名とデータ型を持つクエリ結果を含むDataFrame |

**例外**

| 例外     | 条件                                       |
| ------------- | ----------------------------------------------- |
| `ImportError` | pyarrowまたはpandasパッケージがインストールされていない場合 |

:::note
この関数は、大規模なデータセットでのパフォーマンスを向上させるために、ArrowからPandasへの変換でマルチスレッドを使用します。
:::

**関連項目**

- [`to_arrowTable()`](#chdb-state-sqlitelike-to_arrowtable) - PyArrow Table形式への変換

**例**

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


## DataFrame統合 {#dataframe-integration}

### **class** `chdb.dataframe.Table` {#chdb-dataframe-table}

基底クラス:

```python
class chdb.dataframe.Table(*args: Any, **kwargs: Any)
```


## Database API (DBAPI) 2.0 インターフェース {#database-api-interface}

chDBは、データベース接続のためのPython DB-API 2.0互換インターフェースを提供しており、標準的なデータベースインターフェースを想定したツールやフレームワークでchDBを使用できます。

chDB DB-API 2.0インターフェースには以下が含まれます:

- **接続**: 接続文字列によるデータベース接続管理
- **カーソル**: クエリの実行と結果の取得
- **型システム**: DB-API 2.0準拠の型定数とコンバータ
- **エラー処理**: 標準的なデータベース例外階層
- **スレッドセーフティ**: レベル1のスレッドセーフティ(スレッドはモジュールを共有できますが、接続は共有できません)

---

### コア関数 {#core-functions}

Database API (DBAPI) 2.0インターフェースは、以下のコア関数を実装しています:

#### `chdb.dbapi.connect` {#dbapi-connect}

新しいデータベース接続を初期化します。

**構文**

```python
chdb.dbapi.connect(*args, **kwargs)
```

**パラメータ**

| パラメータ | 型 | デフォルト | 説明                                     |
| --------- | ---- | ------- | ----------------------------------------------- |
| `path`    | str  | `None`  | データベースファイルパス。インメモリデータベースの場合はNone |

**例外**

| 例外                            | 条件                           |
| ------------------------------------ | ----------------------------------- |
| [`err.Error`](#chdb-dbapi-err-error) | 接続を確立できない場合 |

---

#### `chdb.dbapi.get_client_info()` {#dbapi-get-client-info}

クライアントバージョン情報を取得します。

MySQLdb互換性のために、chDBクライアントバージョンを文字列として返します。

**構文**

```python
chdb.dbapi.get_client_info()
```

**戻り値**

| 戻り値の型 | 説明                                  |
| ----------- | -------------------------------------------- |
| `str`       | 'major.minor.patch'形式のバージョン文字列 |

---

### 型コンストラクタ {#type-constructors}

#### `chdb.dbapi.Binary(x)` {#dbapi-binary}

xをバイナリ型として返します。

この関数は、DB-API 2.0仕様に従い、バイナリデータベースフィールドで使用するために入力をbytes型に変換します。

**構文**

```python
chdb.dbapi.Binary(x)
```

**パラメータ**

| パラメータ | 型 | 説明                     |
| --------- | ---- | ------------------------------- |
| `x`       | -    | バイナリに変換する入力データ |

**戻り値**

| 戻り値の型 | 説明                  |
| ----------- | ---------------------------- |
| `bytes`     | bytesに変換された入力 |

---

### Connectionクラス {#connection-class}

#### **class** `chdb.dbapi.connections.Connection(path=None)` {#chdb-dbapi-connections-connection}

基底クラス: `object`

chDBデータベースへのDB-API 2.0準拠の接続。

このクラスは、chDBデータベースへの接続と対話のための標準的なDB-APIインターフェースを提供します。インメモリデータベースとファイルベースのデータベースの両方をサポートしています。

この接続は、基盤となるchDBエンジンを管理し、クエリの実行、トランザクションの管理(ClickHouseでは何も行いません)、カーソルの作成のためのメソッドを提供します。

```python
class chdb.dbapi.connections.Connection(path=None)
```

**パラメータ**

| パラメータ | 型 | デフォルト | 説明                                                                                                        |
| --------- | ---- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| `path`    | str  | `None`  | データベースファイルパス。Noneの場合、インメモリデータベースを使用します。'database.db'のようなファイルパス、または':memory:'の場合はNoneを指定できます |

**変数**

| 変数   | 型 | 説明                                        |
| ---------- | ---- | -------------------------------------------------- |
| `encoding` | str  | クエリの文字エンコーディング、デフォルトは'utf8' |
| `open`     | bool | 接続が開いている場合はTrue、閉じている場合はFalse        |

**例**

```pycon
>>> # インメモリデータベース
>>> conn = Connection()
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT 1")
>>> result = cursor.fetchall()
>>> conn.close()
```

```pycon
>>> # ファイルベースのデータベース
>>> conn = Connection('mydata.db')
>>> with conn.cursor() as cur:
...     cur.execute("CREATE TABLE users (id INT, name STRING) ENGINE = MergeTree() order by id")
...     cur.execute("INSERT INTO users VALUES (1, 'Alice')")
>>> conn.close()
```

```pycon
>>> # コンテキストマネージャの使用
>>> with Connection() as cur:
...     cur.execute("SELECT version()")
...     version = cur.fetchone()
```

:::note
ClickHouseは従来のトランザクションをサポートしていないため、commit()とrollback()操作は何も行いませんが、DB-API準拠のために提供されています。
:::

---

#### `close` {#dbapi-connection-close}


データベース接続を閉じます。

基盤となるchDB接続を閉じ、この接続を閉じた状態としてマークします。
この接続に対する後続の操作はErrorを発生させます。

**構文**

```python
close()
```

**発生する例外**

| 例外                                 | 条件                            |
| ------------------------------------ | ------------------------------- |
| [`err.Error`](#chdb-dbapi-err-error) | 接続が既に閉じられている場合    |

---

#### `commit` {#dbapi-commit}

現在のトランザクションをコミットします。

**構文**

```python
commit()
```

:::note
chDB/ClickHouseは従来型のトランザクションをサポートしていないため、このメソッドは何も実行しません。DB-API 2.0準拠のために提供されています。
:::

---

#### `cursor` {#dbapi-cursor}

クエリを実行するための新しいカーソルを作成します。

**構文**

```python
cursor(cursor=None)
```

**パラメータ**

| パラメータ | 型   | 説明                                |
| --------- | ---- | ----------------------------------- |
| `cursor`  | -    | 無視されます。互換性のために提供されています |

**戻り値**

| 戻り値の型  | 説明                                  |
| ----------- | ------------------------------------- |
| `Cursor`    | この接続用の新しいカーソルオブジェクト |

**発生する例外**

| 例外                                 | 条件                    |
| ------------------------------------ | ----------------------- |
| [`err.Error`](#chdb-dbapi-err-error) | 接続が閉じられている場合 |

**例**

```pycon
>>> conn = Connection()
>>> cur = conn.cursor()
>>> cur.execute("SELECT 1")
>>> result = cur.fetchone()
```

---

#### `escape` {#escape}

SQLクエリに安全に含めるために値をエスケープします。

**構文**

```python
escape(obj, mapping=None)
```

**パラメータ**

| パラメータ | 型   | 説明                                          |
| --------- | ---- | --------------------------------------------- |
| `obj`     | -    | エスケープする値（文字列、バイト、数値など）   |
| `mapping` | -    | エスケープ用のオプションの文字マッピング       |

**戻り値**

| 戻り値の型  | 説明                                                  |
| ----------- | ----------------------------------------------------- |
| -           | SQLクエリに適した入力のエスケープ済みバージョン        |

**例**

```pycon
>>> conn = Connection()
>>> safe_value = conn.escape("O'Reilly")
>>> query = f"SELECT * FROM users WHERE name = {safe_value}"
```

---

#### `escape_string` {#escape-string}

SQLクエリ用に文字列値をエスケープします。

**構文**

```python
escape_string(s)
```

**パラメータ**

| パラメータ | 型   | 説明             |
| --------- | ---- | ---------------- |
| `s`       | str  | エスケープする文字列 |

**戻り値**

| 戻り値の型  | 説明                                  |
| ----------- | ------------------------------------- |
| `str`       | SQLに安全に含めることができるエスケープ済み文字列 |

---

#### `property open` {#property-open}

接続が開いているかどうかを確認します。

**戻り値**

| 戻り値の型  | 説明                                        |
| ----------- | ------------------------------------------- |
| `bool`      | 接続が開いている場合はTrue、閉じている場合はFalse |

---

#### `query` {#dbapi-query}

SQLクエリを直接実行し、生の結果を返します。

このメソッドはカーソルインターフェースをバイパスし、クエリを直接実行します。
標準的なDB-APIの使用には、cursor()メソッドの使用を推奨します。

**構文**

```python
query(sql, fmt='CSV')
```

**パラメータ:**

| パラメータ | 型           | デフォルト | 説明                                                                             |
| --------- | ------------ | ---------- | -------------------------------------------------------------------------------- |
| `sql`     | str or bytes | _必須_     | 実行するSQLクエリ                                                                 |
| `fmt`     | str          | `"CSV"`    | 出力形式。サポートされる形式には"CSV"、"JSON"、"Arrow"、"Parquet"などがあります    |

**戻り値**

| 戻り値の型  | 説明                                 |
| ----------- | ------------------------------------ |
| -           | 指定された形式でのクエリ結果          |

**発生する例外**

| 例外                                                   | 条件                                   |
| ------------------------------------------------------ | -------------------------------------- |
| [`err.InterfaceError`](#chdb-dbapi-err-interfaceerror) | 接続が閉じられているかクエリが失敗した場合 |

**例**

```pycon
>>> conn = Connection()
>>> result = conn.query("SELECT 1, 'hello'", "CSV")
>>> print(result)
"1,hello\n"
```

---

#### `property resp` {#property-resp}

最後のクエリレスポンスを取得します。

**戻り値**

| 戻り値の型  | 説明                                        |
| ----------- | ------------------------------------------- |
| -           | 最後のquery()呼び出しからの生のレスポンス    |

:::note
このプロパティはquery()が直接呼び出されるたびに更新されます。
カーソルを通じて実行されたクエリは反映されません。
:::

---

#### `rollback` {#rollback}


現在のトランザクションをロールバックします。

**構文**

```python
rollback()
```

:::note
chDB/ClickHouseは従来型のトランザクションをサポートしていないため、この操作は何も実行しません。DB-API 2.0準拠のために提供されています。
:::

---

### Cursorクラス {#cursor-class}

#### **class** `chdb.dbapi.cursors.Cursor` {#chdb-dbapi-cursors-cursor}

基底クラス: `object`

クエリの実行と結果の取得を行うためのDB-API 2.0カーソルです。

カーソルは、SQL文の実行、クエリ結果の管理、結果セットのナビゲーションを行うメソッドを提供します。パラメータバインディング、一括操作をサポートし、DB-API 2.0仕様に準拠しています。

Cursorインスタンスを直接作成しないでください。代わりに`Connection.cursor()`を使用してください。

```python
class chdb.dbapi.cursors.Cursor(connection)
```

| 変数              | 型    | 説明                                                        |
| ----------------- | ----- | ----------------------------------------------------------- |
| `description`     | tuple | 最後のクエリ結果のカラムメタデータ                           |
| `rowcount`        | int   | 最後のクエリで影響を受けた行数（不明な場合は-1）              |
| `arraysize`       | int   | 一度に取得する行数のデフォルト値（デフォルト: 1）             |
| `lastrowid`       | -     | 最後に挿入された行のID（該当する場合）                        |
| `max_stmt_length` | int   | executemany()の最大ステートメントサイズ（デフォルト: 1024000）|

**例**

```pycon
>>> conn = Connection()
>>> cur = conn.cursor()
>>> cur.execute("SELECT 1 as id, 'test' as name")
>>> result = cur.fetchone()
>>> print(result)  # (1, 'test')
>>> cur.close()
```

:::note
完全な仕様の詳細については、[DB-API 2.0 Cursor Objects](https://www.python.org/dev/peps/pep-0249/#cursor-objects)を参照してください。
:::

---

#### `callproc` {#callproc}

ストアドプロシージャを実行します（プレースホルダー実装）。

**構文**

```python
callproc(procname, args=())
```

**パラメータ**

| パラメータ | 型       | 説明                                |
| ---------- | -------- | ----------------------------------- |
| `procname` | str      | 実行するストアドプロシージャの名前   |
| `args`     | sequence | プロシージャに渡すパラメータ         |

**戻り値**

| 戻り値の型  | 説明                                     |
| ----------- | ---------------------------------------- |
| `sequence`  | 元のargsパラメータ（変更なし）            |

:::note
chDB/ClickHouseは従来の意味でのストアドプロシージャをサポートしていません。
このメソッドはDB-API 2.0準拠のために提供されていますが、実際の操作は実行しません。すべてのSQL操作にはexecute()を使用してください。
:::

:::warning 互換性
これはプレースホルダー実装です。OUT/INOUTパラメータ、複数の結果セット、サーバー変数などの従来のストアドプロシージャ機能は、基盤となるClickHouseエンジンではサポートされていません。
:::

---

#### `close` {#dbapi-cursor-close}

カーソルを閉じ、関連するリソースを解放します。

閉じた後、カーソルは使用できなくなり、いかなる操作も例外を発生させます。
カーソルを閉じると、残りのすべてのデータが消費され、基盤となるカーソルが解放されます。

**構文**

```python
close()
```

---

#### `execute` {#dbapi-execute}

オプションのパラメータバインディングを使用してSQLクエリを実行します。

このメソッドは、オプションのパラメータ置換を使用して単一のSQL文を実行します。
柔軟性のために複数のパラメータプレースホルダースタイルをサポートしています。

**構文**

```python
execute(query, args=None)
```

**パラメータ**

| パラメータ | 型              | デフォルト | 説明                               |
| --------- | --------------- | ---------- | ---------------------------------- |
| `query`   | str             | _必須_     | 実行するSQLクエリ                   |
| `args`    | tuple/list/dict | `None`     | プレースホルダーにバインドするパラメータ |

**戻り値**

| 戻り値の型  | 説明                                    |
| ----------- | --------------------------------------- |
| `int`       | 影響を受けた行数（不明な場合は-1）       |

**パラメータスタイル**

| スタイル             | 例                                              |
| ------------------- | ----------------------------------------------- |
| 疑問符スタイル       | `"SELECT * FROM users WHERE id = ?"`            |
| 名前付きスタイル     | `"SELECT * FROM users WHERE name = %(name)s"`   |
| フォーマットスタイル | `"SELECT * FROM users WHERE age = %s"` (レガシー) |

**例**


```pycon
>>> # 疑問符パラメータ
>>> cur.execute("SELECT * FROM users WHERE id = ? AND age > ?", (123, 18))
>>>
>>> # 名前付きパラメータ
>>> cur.execute("SELECT * FROM users WHERE name = %(name)s", {'name': 'Alice'})
>>>
>>> # パラメータなし
>>> cur.execute("SELECT COUNT(*) FROM users")
```

**発生する例外**

| 例外                                              | 条件                                 |
| ------------------------------------------------------ | ----------------------------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | カーソルが閉じられている、またはクエリの形式が不正な場合 |
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror)     | 実行中にデータベースエラーが発生した場合 |

---

#### `executemany(query, args)` {#chdb-dbapi-cursors-cursor-executemany}

異なるパラメータセットでクエリを複数回実行します。

このメソッドは、異なるパラメータ値で同じSQLクエリを効率的に複数回実行します。特に一括INSERT操作に有用です。

**構文**

```python
executemany(query, args)
```

**パラメータ**

| パラメータ | 型     | 説明                                                 |
| --------- | -------- | ----------------------------------------------------------- |
| `query`   | str      | 複数回実行するSQLクエリ                         |
| `args`    | sequence | 各実行のパラメータタプル/辞書/リストのシーケンス |

**戻り値**

| 戻り値の型 | 説明                                         |
| ----------- | --------------------------------------------------- |
| `int`       | すべての実行で影響を受けた行の合計数 |

**例**

```pycon
>>> # 疑問符パラメータを使用した一括挿入
>>> users_data = [(1, 'Alice'), (2, 'Bob'), (3, 'Charlie')]
>>> cur.executemany("INSERT INTO users VALUES (?, ?)", users_data)
>>>
>>> # 名前付きパラメータを使用した一括挿入
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
このメソッドは、クエリ実行プロセスを最適化することで、複数行のINSERTおよびUPDATE操作のパフォーマンスを向上させます。
:::

---

#### `fetchall()` {#dbapi-fetchall}

クエリ結果から残りのすべての行を取得します。

**構文**

```python
fetchall()
```

**戻り値**

| 戻り値の型 | 説明                                    |
| ----------- | ---------------------------------------------- |
| `list`      | 残りのすべての行を表すタプルのリスト |

**発生する例外**

| 例外                                              | 条件                              |
| ------------------------------------------------------ | -------------------------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | execute()が事前に呼び出されていない場合 |

:::warning 警告
このメソッドは、大きな結果セットに対して大量のメモリを消費する可能性があります。
大規模なデータセットには`fetchmany()`の使用を検討してください。
:::

**例**

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> all_rows = cursor.fetchall()
>>> print(len(all_rows))  # 合計行数
```

---

#### `fetchmany` {#dbapi-fetchmany}

クエリ結果から複数の行を取得します。

**構文**

```python
fetchmany(size=1)
```

**パラメータ**

| パラメータ | 型 | デフォルト | 説明                                                      |
| --------- | ---- | ------- | ---------------------------------------------------------------- |
| `size`    | int  | `1`     | 取得する行数。指定されていない場合はcursor.arraysizeを使用 |

**戻り値**

| 戻り値の型 | 説明                                  |
| ----------- | -------------------------------------------- |
| `list`      | 取得した行を表すタプルのリスト |

**発生する例外**

| 例外                                              | 条件                              |
| ------------------------------------------------------ | -------------------------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | execute()が事前に呼び出されていない場合 |

**例**

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> rows = cursor.fetchmany(3)
>>> print(rows)  # [(1, 'Alice'), (2, 'Bob'), (3, 'Charlie')]
```

---

#### `fetchone` {#dbapi-fetchone}

クエリ結果から次の行を取得します。

**構文**

```python
fetchone()
```

**戻り値**

| 戻り値の型     | 説明                                            |
| --------------- | ------------------------------------------------------ |
| `tuple or None` | 次の行をタプルとして返す。行がない場合はNone |

**発生する例外**

| 例外                                              | 条件                                |
| ------------------------------------------------------ | ---------------------------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | `execute()`が事前に呼び出されていない場合 |

**例**


```pycon
>>> cursor.execute("SELECT id, name FROM users LIMIT 3")
>>> row = cursor.fetchone()
>>> print(row)  # (1, 'Alice')
>>> row = cursor.fetchone()
>>> print(row)  # (2, 'Bob')
```

---

#### `max_stmt_length = 1024000` {#max-stmt-length}

[`executemany()`](#chdb-dbapi-cursors-cursor-executemany) が生成するステートメントの最大サイズ。

デフォルト値は 1024000 です。

---

#### `mogrify` {#mogrify}

データベースに送信される正確なクエリ文字列を返します。

このメソッドは、パラメータ置換後の最終的な SQL クエリを表示します。
デバッグやログ記録の目的に有用です。

**構文**

```python
mogrify(query, args=None)
```

**パラメータ**

| パラメータ | 型              | デフォルト | 説明                                  |
| --------- | --------------- | ---------- | ------------------------------------- |
| `query`   | str             | _必須_     | パラメータプレースホルダを含む SQL クエリ |
| `args`    | tuple/list/dict | `None`     | 置換するパラメータ                     |

**戻り値**

| 戻り値の型 | 説明                                                    |
| ----------- | ------------------------------------------------------ |
| `str`       | パラメータが置換された最終的な SQL クエリ文字列          |

**例**

```pycon
>>> cur.mogrify("SELECT * FROM users WHERE id = ?", (123,))
"SELECT * FROM users WHERE id = 123"
```

:::note
このメソッドは Psycopg で使用されている DB-API 2.0 の拡張に従っています。
:::

---

#### `nextset` {#nextset}

次の結果セットに移動します(サポートされていません)。

**構文**

```python
nextset()
```

**戻り値**

| 戻り値の型 | 説明                                                           |
| ----------- | ------------------------------------------------------------- |
| `None`      | 複数の結果セットがサポートされていないため、常に None を返します |

:::note
chDB/ClickHouse は単一のクエリからの複数の結果セットをサポートしていません。
このメソッドは DB-API 2.0 準拠のために提供されていますが、常に None を返します。
:::

---

#### `setinputsizes` {#setinputsizes}

パラメータの入力サイズを設定します(何も実行しない実装)。

**構文**

```python
setinputsizes(*args)
```

**パラメータ**

| パラメータ | 型 | 説明                                    |
| --------- | ---- | --------------------------------------- |
| `*args`   | -    | パラメータサイズの指定(無視されます)      |

:::note
このメソッドは何も実行しませんが、DB-API 2.0 仕様で必要とされています。
chDB は内部的にパラメータサイズを自動的に処理します。
:::

---

#### `setoutputsizes` {#setoutputsizes}

出力カラムのサイズを設定します(何も実行しない実装)。

**構文**

```python
setoutputsizes(*args)
```

**パラメータ**

| パラメータ | 型 | 説明                                 |
| --------- | ---- | ------------------------------------ |
| `*args`   | -    | カラムサイズの指定(無視されます)       |

:::note
このメソッドは何も実行しませんが、DB-API 2.0 仕様で必要とされています。
chDB は内部的に出力サイズを自動的に処理します。
:::

---

### Error Classes {#error-classes}

chdb データベース操作の例外クラス。

このモジュールは、Python Database API Specification v2.0 に従って、
chdb におけるデータベース関連エラーを処理するための完全な例外クラス階層を提供します。

例外階層は以下のように構成されています:

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

各例外クラスは、データベースエラーの特定のカテゴリを表します:

| 例外                | 説明                                                        |
| ------------------- | ----------------------------------------------------------- |
| `Warning`           | データベース操作中の致命的でない警告                          |
| `InterfaceError`    | データベースインターフェース自体の問題                        |
| `DatabaseError`     | すべてのデータベース関連エラーの基底クラス                    |
| `DataError`         | データ処理の問題(無効な値、型エラー)                         |
| `OperationalError`  | データベース操作上の問題(接続性、リソース)                    |
| `IntegrityError`    | 制約違反(外部キー、一意性)                                   |
| `InternalError`     | データベース内部エラーと破損                                 |
| `ProgrammingError`  | SQL 構文エラーと API の誤用                                  |
| `NotSupportedError` | サポートされていない機能または操作                            |

:::note
これらの例外クラスは Python DB API 2.0 仕様に準拠しており、
異なるデータベース操作間で一貫したエラー処理を提供します。
:::


**関連項目**

- [Python Database API Specification v2.0](https://peps.python.org/pep-0249/)
- `chdb.dbapi.connections` - データベース接続管理
- `chdb.dbapi.cursors` - データベースカーソル操作

**例**

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

基底クラス: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

処理されるデータに関する問題によって発生するエラーに対して送出される例外です。

この例外は、処理されるデータに関する問題によってデータベース操作が失敗した場合に送出されます。例えば以下のような場合です:

- ゼロ除算操作
- 範囲外の数値
- 無効な日付/時刻値
- 文字列切り捨てエラー
- 型変換の失敗
- カラム型に対する無効なデータ形式

**送出される例外**

| 例外                                     | 条件                                     |
| ---------------------------------------- | ---------------------------------------- |
| [`DataError`](#chdb-dbapi-err-dataerror) | データの検証または処理が失敗した場合 |

**例**

```pycon
>>> # SQLでのゼロ除算
>>> cursor.execute("SELECT 1/0")
DataError: Division by zero
```

```pycon
>>> # 無効な日付形式
>>> cursor.execute("INSERT INTO table VALUES ('invalid-date')")
DataError: Invalid date format
```

---

#### **exception** `chdb.dbapi.err.DatabaseError` {#chdb-dbapi-err-databaseerror}

基底クラス: [`Error`](#chdb-dbapi-err-error)

データベースに関連するエラーに対して送出される例外です。

これはすべてのデータベース関連エラーの基底クラスです。インターフェースではなくデータベース自体に関連する、データベース操作中に発生するすべてのエラーを包含します。

一般的なシナリオには以下が含まれます:

- SQL実行エラー
- データベース接続の問題
- トランザクション関連の問題
- データベース固有の制約違反

:::note
これは[`DataError`](#chdb-dbapi-err-dataerror)、[`OperationalError`](#chdb-dbapi-err-operationalerror)などのより具体的なデータベースエラー型の親クラスとして機能します。
:::

---

#### **exception** `chdb.dbapi.err.Error` {#chdb-dbapi-err-error}

基底クラス: [`StandardError`](#chdb-dbapi-err-standarderror)

他のすべてのエラー例外(警告を除く)の基底クラスとなる例外です。

これは警告を除く、chdbにおけるすべてのエラー例外の基底クラスです。操作の正常な完了を妨げるすべてのデータベースエラー条件の親クラスとして機能します。

:::note
この例外階層はPython DB API 2.0仕様に従っています。
:::

**関連項目**

- [`Warning`](#chdb-dbapi-err-warning) - 操作の完了を妨げない致命的でない警告用

#### **exception** `chdb.dbapi.err.IntegrityError` {#chdb-dbapi-err-integrityerror}

基底クラス: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

データベースのリレーショナル整合性が影響を受けた場合に送出される例外です。

この例外は、データベース操作が整合性制約に違反した場合に送出されます。以下が含まれます:

- 外部キー制約違反
- 主キーまたは一意制約違反(重複キー)
- チェック制約違反
- NOT NULL制約違反
- 参照整合性違反

**送出される例外**

| 例外                                               | 条件                                         |
| -------------------------------------------------- | ------------------------------------------------ |
| [`IntegrityError`](#chdb-dbapi-err-integrityerror) | データベース整合性制約が違反された場合 |

**例**

```pycon
>>> # 重複する主キー
>>> cursor.execute("INSERT INTO users (id, name) VALUES (1, 'John')")
>>> cursor.execute("INSERT INTO users (id, name) VALUES (1, 'Jane')")
IntegrityError: Duplicate entry '1' for key 'PRIMARY'
```

```pycon
>>> # 外部キー違反
>>> cursor.execute("INSERT INTO orders (user_id) VALUES (999)")
IntegrityError: Cannot add or update a child row: foreign key constraint fails
```

---

#### **exception** `chdb.dbapi.err.InterfaceError` {#chdb-dbapi-err-interfaceerror}

基底クラス: [`Error`](#chdb-dbapi-err-error)

データベース自体ではなく、データベースインターフェースに関連するエラーに対して送出される例外です。


この例外は、データベースインターフェースの実装に問題がある場合に発生します。例：

- 無効な接続パラメータ
- APIの誤用（クローズされた接続でのメソッド呼び出しなど）
- インターフェースレベルのプロトコルエラー
- モジュールのインポートまたは初期化の失敗

**発生する例外**

| 例外                                          | 条件                                                                  |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror) | データベースインターフェースがデータベース操作に関連しないエラーに遭遇した場合 |

:::note
これらのエラーは通常、プログラミングエラーまたは設定の問題であり、クライアントコードまたは設定を修正することで解決できます。
:::

---

#### **exception** `chdb.dbapi.err.InternalError` {#chdb-dbapi-err-internalerror}

基底クラス: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

データベースが内部エラーに遭遇した場合に発生する例外です。

この例外は、データベースシステムがアプリケーションに起因しない内部エラーに遭遇した場合に発生します。例：

- 無効なカーソル状態（カーソルが無効になった場合）
- トランザクション状態の不整合（トランザクションが同期していない場合）
- データベース破損の問題
- 内部データ構造の破損
- システムレベルのデータベースエラー

**発生する例外**

| 例外                                        | 条件                                         |
| ------------------------------------------------ | ------------------------------------------------- |
| [`InternalError`](#chdb-dbapi-err-internalerror) | データベースが内部的な不整合に遭遇した場合 |

:::warning 警告
内部エラーは、データベース管理者の対応が必要な深刻なデータベース問題を示している可能性があります。これらのエラーは通常、アプリケーションレベルの再試行ロジックでは回復できません。
:::

:::note
これらのエラーは一般的にアプリケーションの制御外であり、データベースの再起動または修復操作が必要になる場合があります。
:::

---

#### **exception** `chdb.dbapi.err.NotSupportedError` {#chdb-dbapi-err-notsupportederror}

基底クラス: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

メソッドまたはデータベースAPIがサポートされていない場合に発生する例外です。

この例外は、アプリケーションが現在のデータベース設定またはバージョンでサポートされていないデータベース機能またはAPIメソッドを使用しようとした場合に発生します。例：

- トランザクションサポートのない接続で`rollback()`を要求する場合
- データベースバージョンでサポートされていない高度なSQL機能を使用する場合
- 現在のドライバで実装されていないメソッドを呼び出す場合
- 無効化されたデータベース機能を使用しようとする場合

**発生する例外**

| 例外                                                | 条件                                       |
| -------------------------------------------------------- | ----------------------------------------------- |
| [`NotSupportedError`](#chdb-dbapi-err-notsupportederror) | サポートされていないデータベース機能にアクセスした場合 |

**例**

```pycon
>>> # 非トランザクション接続でのトランザクションロールバック
>>> connection.rollback()
NotSupportedError: Transactions are not supported
```

```pycon
>>> # サポートされていないSQL構文の使用
>>> cursor.execute("SELECT * FROM table WITH (NOLOCK)")
NotSupportedError: WITH clause not supported in this database version
```

:::note
これらのエラーを回避するには、データベースのドキュメントとドライバの機能を確認してください。可能な場合は、適切なフォールバックを検討してください。
:::

---

#### **exception** `chdb.dbapi.err.OperationalError` {#chdb-dbapi-err-operationalerror}

基底クラス: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

データベースの操作に関連するエラーが発生した場合に発生する例外です。

この例外は、データベース操作中に発生し、必ずしもプログラマの制御下にないエラーに対して発生します。以下を含みます：

- データベースからの予期しない切断
- データベースサーバが見つからない、または到達不能
- トランザクション処理の失敗
- 処理中のメモリ割り当てエラー
- ディスク容量またはリソースの枯渇
- データベースサーバの内部エラー
- 認証または認可の失敗

**発生する例外**

| 例外                                              | 条件                                               |
| ------------------------------------------------------ | ------------------------------------------------------- |
| [`OperationalError`](#chdb-dbapi-err-operationalerror) | 運用上の問題によりデータベース操作が失敗した場合 |

:::note
これらのエラーは通常一時的なものであり、操作を再試行するか、システムレベルの問題に対処することで解決できる場合があります。
:::

:::warning 警告
一部の運用エラーは、管理者の介入が必要な深刻なシステム問題を示している可能性があります。
:::

---

#### **exception** `chdb.dbapi.err.ProgrammingError` {#chdb-dbapi-err-programmingerror}

基底クラス: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

データベース操作におけるプログラミングエラーに対して発生する例外です。

この例外は、アプリケーションのデータベース使用にプログラミングエラーがある場合に発生します。以下を含みます：

- テーブルまたはカラムが見つからない
- 作成時にテーブルまたはインデックスが既に存在する
- ステートメントのSQL構文エラー
- プリペアドステートメントで指定されたパラメータ数が間違っている
- 無効なSQL操作（例：存在しないオブジェクトに対するDROP）
- データベースAPIメソッドの誤った使用

**発生する例外**

| 例外                                              | 条件                                        |
| ------------------------------------------------------ | ------------------------------------------------ |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | SQLステートメントまたはAPIの使用にエラーが含まれている場合 |

**例**


```pycon
>>> # テーブルが見つかりません
>>> cursor.execute("SELECT * FROM nonexistent_table")
ProgrammingError: テーブル 'nonexistent_table' は存在しません
```

```pycon
>>> # SQL 構文エラー
>>> cursor.execute("SELCT * FROM users")
ProgrammingError: SQL 構文に誤りがあります
```

```pycon
>>> # パラメーター数が正しくありません
>>> cursor.execute("INSERT INTO users (name, age) VALUES (%s)", ('John',))
ProgrammingError: 列数が値の数と一致しません
```

---

#### **exception** `chdb.dbapi.err.StandardError` {#chdb-dbapi-err-standarderror}

Bases: `Exception`

chdb に対する操作に関連する例外です。

これは、すべての chdb 関連の例外の基底クラスです。Python の組み込みクラス Exception を継承しており、データベース操作に関する例外階層のルートとして機能します。

:::note
この例外クラスは、データベースの例外処理に関する Python DB API 2.0 仕様に準拠しています。
:::

---

#### **exception** `chdb.dbapi.err.Warning` {#chdb-dbapi-err-warning}

Bases: [`StandardError`](#chdb-dbapi-err-standarderror)

挿入時のデータ切り捨てなど、重要な警告に対して送出される例外です。

この例外は、データベース操作自体は完了したものの、アプリケーション側で注意すべき重要な警告が発生した場合に送出されます。代表的なケースとしては次のようなものがあります。

- 挿入時のデータ切り捨て
- 数値変換における精度の損失
- 文字セット変換に関する警告

:::note
これは、警告用の例外に関する Python DB API 2.0 仕様に準拠しています。
:::

---

### モジュール定数 {#module-constants}

#### `chdb.dbapi.apilevel = '2.0'` {#apilevel}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

指定されたオブジェクトから新しい文字列オブジェクトを作成します。encoding または errors が指定されている場合、オブジェクトはデータバッファを公開している必要があり、そのバッファは指定されたエンコーディングとエラーハンドラを使ってデコードされます。指定されていない場合は、`object._\_str_\_()` が定義されていればその結果を、定義されていなければ `repr(object)` を返します。

- encoding の既定値は ‘utf-8’ です。
- errors の既定値は ‘strict’ です。

---

#### `chdb.dbapi.threadsafety = 1` {#threadsafety}

```python
int([x]) -> integer
int(x, base=10) -> integer
```

数値または文字列を整数に変換します。引数が与えられない場合は 0 を返します。x が数値であれば、x._\_int_\_() を返します。浮動小数点数の場合は 0 に向かって切り捨てます。

x が数値でない場合、または base が指定されている場合、x は指定された基数で表現された整数リテラルを表す文字列、bytes、または bytearray インスタンスである必要があります。リテラルの前には ‘+’ または ‘-’ を付けることができ、前後に空白を含んでもかまいません。base の既定値は 10 です。有効な基数は 0 および 2〜36 です。base が 0 の場合は、文字列を整数リテラルとして解釈して基数を決定します。

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

DB-API 2.0 の型比較のために拡張された frozenset です。

このクラスは frozenset を拡張し、DB-API 2.0 の型比較セマンティクスをサポートします。個々の要素をこの集合に対して等価演算子および非等価演算子の両方で比較できるようにすることで、柔軟な型チェックを可能にします。

これは STRING、BINARY、NUMBER などの型定数に対して使用され、`field_type` が単一の型値である場合に “field_type == STRING” のような比較を行えるようにします。

**使用例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---


#### `chdb.dbapi.BINARY = frozenset({249, 250, 251, 252})` {#binary-type}

DB-API 2.0 の型比較のために拡張された frozenset です。

このクラスは frozenset を拡張し、DB-API 2.0 の型比較のセマンティクスをサポートします。個々の要素を集合に対して等価・非等価の演算子で比較できる柔軟な型チェックを可能にします。

これは STRING、BINARY、NUMBER などの型定数に使用され、field_type が単一の型値である場合に「field_type == STRING」のような比較を可能にします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # True を返す
>>> FIELD_TYPE.INT != string_types     # True を返す
>>> FIELD_TYPE.BLOB in string_types    # False を返す
```

---

#### `chdb.dbapi.NUMBER = frozenset({0, 1, 3, 4, 5, 8, 9, 13})` {#number-type}

DB-API 2.0 の型比較のために拡張された frozenset です。

このクラスは frozenset を拡張し、DB-API 2.0 の型比較のセマンティクスをサポートします。個々の要素を集合に対して等価・非等価の演算子で比較できる柔軟な型チェックを可能にします。

これは STRING、BINARY、NUMBER などの型定数に使用され、field_type が単一の型値である場合に「field_type == STRING」のような比較を可能にします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # True を返す
>>> FIELD_TYPE.INT != string_types     # True を返す
>>> FIELD_TYPE.BLOB in string_types    # False を返す
```

---

#### `chdb.dbapi.DATE = frozenset({10, 14})` {#date-type}

DB-API 2.0 の型比較のために拡張された frozenset です。

このクラスは frozenset を拡張し、DB-API 2.0 の型比較のセマンティクスをサポートします。個々の要素を集合に対して等価・非等価の演算子で比較できる柔軟な型チェックを可能にします。

これは STRING、BINARY、NUMBER などの型定数に使用され、field_type が単一の型値である場合に「field_type == STRING」のような比較を可能にします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # True を返す
>>> FIELD_TYPE.INT != string_types     # True を返す
>>> FIELD_TYPE.BLOB in string_types    # False を返す
```

---

#### `chdb.dbapi.TIME = frozenset({11})` {#time-type}

DB-API 2.0 の型比較のために拡張された frozenset です。

このクラスは frozenset を拡張し、DB-API 2.0 の型比較のセマンティクスをサポートします。個々の要素を集合に対して等価・非等価の演算子で比較できる柔軟な型チェックを可能にします。

これは STRING、BINARY、NUMBER などの型定数に使用され、field_type が単一の型値である場合に「field_type == STRING」のような比較を可能にします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # True を返す
>>> FIELD_TYPE.INT != string_types     # True を返す
>>> FIELD_TYPE.BLOB in string_types    # False を返す
```

---

#### `chdb.dbapi.TIMESTAMP = frozenset({7, 12})` {#timestamp-type}

DB-API 2.0 の型比較のために拡張された frozenset です。

このクラスは frozenset を拡張し、DB-API 2.0 の型比較のセマンティクスをサポートします。個々の要素を集合に対して等価・非等価の演算子で比較できる柔軟な型チェックを可能にします。

これは STRING、BINARY、NUMBER などの型定数に使用され、field_type が単一の型値である場合に「field_type == STRING」のような比較を可能にします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # True を返す
>>> FIELD_TYPE.INT != string_types     # True を返す
>>> FIELD_TYPE.BLOB in string_types    # False を返す
```

#### `chdb.dbapi.DATETIME = frozenset({7, 12})` {#datetime-type}

DB-API 2.0 の型比較のために拡張された frozenset です。


このクラスは frozenset を拡張し、DB-API 2.0 の型比較セマンティクスをサポートします。
個々の要素を集合に対して、等価・非等価の両方の演算子を用いて比較できる柔軟な型チェックを可能にします。

これは STRING、BINARY、NUMBER などの型定数に対して使用され、field_type が単一の型値である場合に
「field_type == STRING」のような比較を行えるようにします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # True を返す
>>> FIELD_TYPE.INT != string_types     # True を返す
>>> FIELD_TYPE.BLOB in string_types    # False を返す
```

---

#### `chdb.dbapi.ROWID = frozenset({})` {#rowid-type}

DB-API 2.0 の型比較用に拡張された frozenset です。

このクラスは frozenset を拡張し、DB-API 2.0 の型比較セマンティクスをサポートします。
個々の要素を集合に対して、等価・非等価の両方の演算子を用いて比較できる柔軟な型チェックを可能にします。

これは STRING、BINARY、NUMBER などの型定数に対して使用され、field_type が単一の型値である場合に
「field_type == STRING」のような比較を行えるようにします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # True を返す
>>> FIELD_TYPE.INT != string_types     # True を返す
>>> FIELD_TYPE.BLOB in string_types    # False を返す
```

**使用例**

基本的なクエリ例:

```python
import chdb.dbapi as dbapi

print("chdb ドライバーのバージョン: {0}".format(dbapi.get_client_info()))

```


# 接続とカーソルを作成
conn = dbapi.connect()
cur = conn.cursor()



# クエリを実行
cur.execute('SELECT version()')
print("description:", cur.description)
print("data:", cur.fetchone())



# 後処理

cur.close()
conn.close()

````

データの操作:

```python
import chdb.dbapi as dbapi

conn = dbapi.connect()
cur = conn.cursor()
````


# テーブルを作成
cur.execute("""
    CREATE TABLE employees (
        id UInt32,
        name String,
        department String,
        salary Decimal(10,2)
    ) ENGINE = Memory
""")



# データを挿入
cur.execute("""
    INSERT INTO employees VALUES
    (1, 'Alice', 'Engineering', 75000.00),
    (2, 'Bob', 'Marketing', 65000.00),
    (3, 'Charlie', 'Engineering', 80000.00)
""")



# データを問い合わせる
cur.execute("SELECT * FROM employees WHERE department = 'Engineering'")



# 結果の取得

print(&quot;列名:&quot;, [desc[0] for desc in cur.description])
for row in cur.fetchall():
print(row)

conn.close()

````

接続管理:

```python
import chdb.dbapi as dbapi
````


# インメモリ・データベース（デフォルト）
conn1 = dbapi.connect()



# 永続的なデータベースファイル
conn2 = dbapi.connect("./my_database.chdb")



# パラメータ付き接続
conn3 = dbapi.connect("./my_database.chdb?log-level=debug&verbose")



# 読み取り専用接続
conn4 = dbapi.connect("./my_database.chdb?mode=ro")



# 接続の自動クリーンアップ

with dbapi.connect(&quot;test.chdb&quot;) as conn:
cur = conn.cursor()
cur.execute(&quot;SELECT count() FROM numbers(1000)&quot;)
result = cur.fetchone()
print(f&quot;Count: {result[0]}&quot;)
cur.close()

```

**ベストプラクティス**

1. **接続管理**: 処理完了時には必ず接続とカーソルをクローズする
2. **コンテキストマネージャー**: 自動クリーンアップのために `with` 文を使用する
3. **バッチ処理**: 大規模な結果セットには `fetchmany()` を使用する
4. **エラー処理**: データベース操作を try-except ブロックで囲む
5. **パラメータバインディング**: 可能な限りパラメータ化クエリを使用する
6. **メモリ管理**: 非常に大規模なデータセットでは `fetchall()` の使用を避ける

:::note
- chDB の DB-API 2.0 インターフェースは、ほとんどの Python データベースツールと互換性があります
- このインターフェースはレベル1のスレッドセーフティを提供します(スレッドはモジュールを共有できますが、接続は共有できません)
- 接続文字列は chDB セッションと同じパラメータをサポートします
- すべての標準 DB-API 2.0 例外がサポートされています
:::

:::warning 警告
- リソースリークを避けるため、必ずカーソルと接続をクローズしてください
- 大規模な結果セットはバッチで処理する必要があります
- パラメータバインディング構文はフォーマットスタイルに従います: `%s`
:::
```


## ユーザー定義関数（UDF） {#user-defined-functions}

chDB用のユーザー定義関数モジュール。

このモジュールは、chDBでユーザー定義関数（UDF）を作成・管理する機能を提供します。SQLクエリから呼び出せるカスタムPython関数を記述することで、chDBの機能を拡張できます。

### `chdb.udf.chdb_udf` {#chdb-udf}

chDB Python UDF（ユーザー定義関数）用のデコレータ。

**構文**

```python
chdb.udf.chdb_udf(return_type='String')
```

**パラメータ**

| パラメータ     | 型 | デフォルト    | 説明                                                             |
| ------------- | ---- | ---------- | ----------------------------------------------------------------------- |
| `return_type` | str  | `"String"` | 関数の戻り値の型。ClickHouseのデータ型のいずれかを指定する必要があります |

**注意事項**

1. 関数はステートレスである必要があります。UDFのみがサポートされており、UDAFはサポートされていません。
2. デフォルトの戻り値の型はStringです。戻り値の型はClickHouseのデータ型のいずれかである必要があります。
3. 関数はString型の引数を受け取る必要があります。すべての引数は文字列です。
4. 関数は入力の各行に対して呼び出されます。
5. 関数は純粋なPython関数である必要があります。関数内で使用するすべてのモジュールは関数内でインポートしてください。
6. 使用されるPythonインタープリタは、スクリプトの実行に使用されるものと同じです。

**例**

```python
@chdb_udf()
def sum_udf(lhs, rhs):
    return int(lhs) + int(rhs)

@chdb_udf()
def func_use_json(arg):
    import json
    # ... jsonモジュールを使用
```

---

### `chdb.udf.generate_udf` {#generate-udf}

UDF設定ファイルと実行可能スクリプトファイルを生成します。

この関数は、chDBでユーザー定義関数（UDF）に必要なファイルを作成します：

1. 入力データを処理するPython実行可能スクリプト
2. UDFをClickHouseに登録するXML設定ファイル

**構文**

```python
chdb.udf.generate_udf(func_name, args, return_type, udf_body)
```

**パラメータ**

| パラメータ     | 型 | 説明                                 |
| ------------- | ---- | ------------------------------------------- |
| `func_name`   | str  | UDF関数の名前                    |
| `args`        | list | 関数の引数名のリスト     |
| `return_type` | str  | 関数のClickHouse戻り値の型     |
| `udf_body`    | str  | UDF関数のPythonソースコード本体 |

:::note
この関数は通常@chdb_udfデコレータによって呼び出されるため、ユーザーが直接呼び出すべきではありません。
:::

---


## ユーティリティ {#utilities}

chDBのユーティリティ関数とヘルパー。

このモジュールには、データ型推論、データ変換ヘルパー、デバッグユーティリティなど、chDBを操作するための各種ユーティリティ関数が含まれています。

---

### `chdb.utils.convert_to_columnar` {#convert-to-columnar}

辞書のリストをカラム形式に変換します。

この関数は辞書のリストを受け取り、各キーがカラムに対応し、各値がカラム値のリストである辞書に変換します。
辞書内の欠損値はNoneとして表現されます。

**構文**

```python
chdb.utils.convert_to_columnar(items: List[Dict[str, Any]]) → Dict[str, List[Any]]
```

**パラメータ**

| パラメータ | 型                     | 説明                       |
| --------- | ---------------------- | -------------------------- |
| `items`   | `List[Dict[str, Any]]` | 変換する辞書のリスト        |

**戻り値**

| 戻り値の型              | 説明                                                                         |
| ---------------------- | --------------------------------------------------------------------------- |
| `Dict[str, List[Any]]` | キーがカラム名、値がカラム値のリストである辞書                                  |

**例**

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

ネストされた辞書を平坦化します。

この関数はネストされた辞書を受け取り、ネストされたキーをセパレータで連結して平坦化します。辞書のリストはJSON文字列にシリアライズされます。

**構文**

```python
chdb.utils.flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '_') → Dict[str, Any]
```

**パラメータ**

| パラメータ    | 型               | デフォルト  | 説明                                            |
| ------------ | ---------------- | ---------- | ---------------------------------------------- |
| `d`          | `Dict[str, Any]` | _必須_     | 平坦化する辞書                                   |
| `parent_key` | str              | `""`       | 各キーの前に付加するベースキー                     |
| `sep`        | str              | `"_"`      | 連結されたキーの間に使用するセパレータ              |

**戻り値**

| 戻り値の型        | 説明                   |
| ---------------- | ---------------------- |
| `Dict[str, Any]` | 平坦化された辞書        |

**例**

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

値のリストに最も適したデータ型を推論します。

この関数は値のリストを検査し、リスト内のすべての値を表現できる最も適切なデータ型を決定します。整数、符号なし整数、小数、浮動小数点型を考慮し、値がいずれの数値型でも表現できない場合、またはすべての値がNoneの場合は「string」をデフォルトとします。

**構文**

```python
chdb.utils.infer_data_type(values: List[Any]) → str
```

**パラメータ**

| パラメータ | 型          | 説明                                                        |
| --------- | ----------- | ---------------------------------------------------------- |
| `values`  | `List[Any]` | 分析する値のリスト。値は任意の型を取ることができます           |

**戻り値**


| 戻り値の型 | 説明                                                                                                                                                                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `str`       | 推論されたデータ型を表す文字列。返される可能性のある値は次のとおりです:"int8"、"int16"、"int32"、"int64"、"int128"、"int256"、"uint8"、"uint16"、"uint32"、"uint64"、"uint128"、"uint256"、"decimal128"、"decimal256"、"float32"、"float64"、または"string"。 |

:::note

- リスト内のすべての値がNoneの場合、関数は"string"を返します。
- リスト内のいずれかの値が文字列の場合、関数は直ちに"string"を返します。
- 関数は、数値がその範囲と精度に基づいて整数、小数、または浮動小数点数として表現できることを前提としています。
  :::

---

### `chdb.utils.infer_data_types` {#infer-data-types}

列指向データ構造内の各列のデータ型を推論します。

この関数は各列の値を分析し、データのサンプルに基づいて各列に最も適したデータ型を推論します。

**構文**

```python
chdb.utils.infer_data_types`(column_data: Dict[str, List[Any]], n_rows: int = 10000) → List[tuple]
```

**パラメータ**

| パラメータ     | 型                   | デフォルト    | 説明                                                                    |
| ------------- | ---------------------- | ---------- | ------------------------------------------------------------------------------ |
| `column_data` | `Dict[str, List[Any]]` | _必須_ | キーが列名で値が列の値のリストである辞書 |
| `n_rows`      | int                    | `10000`    | 型推論のためにサンプリングする行数                                |

**戻り値**

| 戻り値の型   | 説明                                                                |
| ------------- | -------------------------------------------------------------------------- |
| `List[tuple]` | 列名と推論されたデータ型を含むタプルのリスト |


## 抽象基底クラス {#abstract-base-classes}

### **class** `chdb.rwabc.PyReader`(data: Any)` {#pyreader}

基底クラス: `ABC`

```python
class chdb.rwabc.PyReader(data: Any)
```

---

#### **abstractmethod** `read` {#read}

指定されたカラムから指定された行数を読み取り、オブジェクトのリストを返します。
各オブジェクトは、カラムの値のシーケンスです。

```python
abstractmethod (col_names: List[str], count: int) → List[Any]
```

**パラメータ**

| パラメータ   | 型        | 説明                    |
| ----------- | ----------- | ------------------------------ |
| `col_names` | `List[str]` | 読み取るカラム名のリスト   |
| `count`     | int         | 読み取る最大行数 |

**戻り値**

| 戻り値の型 | 説明                            |
| ----------- | -------------------------------------- |
| `List[Any]` | 各カラムに対応するシーケンスのリスト |

### **class** `chdb.rwabc.PyWriter` {#pywriter}

基底クラス: `ABC`

```python
class chdb.rwabc.PyWriter(col_names: List[str], types: List[type], data: Any)
```

---

#### **abstractmethod** finalize {#finalize}

ブロックから最終データを組み立てて返します。サブクラスで実装する必要があります。

```python
abstractmethod finalize() → bytes
```

**戻り値**

| 戻り値の型 | 説明               |
| ----------- | ------------------------- |
| `bytes`     | 最終的なシリアライズされたデータ |

---

#### **abstractmethod** `write` {#write}

データのカラムをブロックに保存します。サブクラスで実装する必要があります。

```python
abstractmethod write(col_names: List[str], columns: List[List[Any]]) → None
```

**パラメータ**

| パラメータ   | 型              | 説明                                                |
| ----------- | ----------------- | ---------------------------------------------------------- |
| `col_names` | `List[str]`       | 書き込まれるカラム名のリスト                |
| `columns`   | `List[List[Any]]` | カラムデータのリスト。各カラムはリストで表されます |


## 例外処理 {#exception-handling}

### **class** `chdb.ChdbError` {#chdberror}

Bases: `Exception`

chDB関連のエラーに対する基底例外クラスです。

この例外は、chDBのクエリ実行が失敗した場合やエラーが発生した場合に送出されます。標準のPython Exceptionクラスを継承し、基盤となるClickHouseエンジンからのエラー情報を提供します。

例外メッセージには通常、構文エラー、型の不一致、テーブル/カラムの欠落、その他のクエリ実行に関する問題など、ClickHouseからの詳細なエラー情報が含まれます。

**変数**

| 変数 | 型 | 説明                                                     |
| -------- | ---- | --------------------------------------------------------------- |
| `args`   | -    | エラーメッセージと追加の引数を含むタプル |

**例**

```pycon
>>> try:
...     result = chdb.query("SELECT * FROM non_existent_table")
... except chdb.ChdbError as e:
...     print(f"Query failed: {e}")
クエリが失敗しました: テーブル 'non_existent_table' は存在しません
```

```pycon
>>> try:
...     result = chdb.query("SELECT invalid_syntax FROM")
... except chdb.ChdbError as e:
...     print(f"Syntax error: {e}")
構文エラー: 'FROM' 付近で構文エラーが発生しました
```

:::note
この例外は、基盤となるClickHouseエンジンがエラーを報告した際に、chdb.query()および関連する関数によって自動的に送出されます。
失敗する可能性のあるクエリを処理する際には、この例外をキャッチして、アプリケーションで適切なエラー処理を行う必要があります。
:::


## バージョン情報 {#version-information}

### `chdb.chdb_version = ('3', '6', '0')` {#chdb-version}

組み込みの変更不可能な（イミュータブルな）シーケンスです。

引数が指定されない場合、コンストラクタは空のタプルを返します。
iterable が指定された場合、その要素からタプルが初期化されます。

引数がタプルの場合、戻り値は同じオブジェクトになります。

---

### `chdb.engine_version = '25.5.2.1'` {#engine-version}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

指定されたオブジェクトから新しい文字列オブジェクトを作成します。encoding または
errors が指定された場合、オブジェクトはデコード対象となるデータバッファを公開している必要があり、
指定されたエンコーディングとエラーハンドラを使ってデコードされます。
それ以外の場合は、object.__str__()（定義されている場合）の結果、
または repr(object) を返します。

- encoding のデフォルトは ‘utf-8’ です。
- errors のデフォルトは ‘strict’ です。

---

### `chdb.__version__ = '3.6.0'` {#version}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

指定されたオブジェクトから新しい文字列オブジェクトを作成します。encoding または
errors が指定された場合、オブジェクトはデコード対象となるデータバッファを公開している必要があり、
指定されたエンコーディングとエラーハンドラを使ってデコードされます。
それ以外の場合は、object.__str__()（定義されている場合）の結果、
または repr(object) を返します。

- encoding のデフォルトは ‘utf-8’ です。
- errors のデフォルトは ‘strict’ です。
