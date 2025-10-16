---
'title': 'chDB Python API リファレンス'
'sidebar_label': 'Python API'
'slug': '/chdb/api/python'
'description': 'chDBの完全なPython APIリファレンス'
'keywords':
- 'chdb'
- 'embedded'
- 'clickhouse-lite'
- 'python'
- 'api'
- 'reference'
'doc_type': 'reference'
---



# Python API リファレンス
## コアクエリ関数 {#core-query-functions}
### `chdb.query` {#chdb-query}

chDBエンジンを使用してSQLクエリを実行します。

これは、組み込みのClickHouseエンジンを使用してSQL文を実行する主要なクエリ関数です。さまざまな出力形式をサポートし、メモリ内またはファイルベースのデータベースで動作することができます。

**構文**

```python
chdb.query(sql, output_format='CSV', path='', udf_path='')
```

**パラメータ**

| パラメータ       | 型    | デフォルト       | 説明                                                                                                                                                                                                                                                                                                     |
|-----------------|-------|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`           | str   | *必須*           | 実行するSQLクエリ文字列                                                                                                                                                                                                                                                                                  |
| `output_format` | str   | `"CSV"`          | 結果の出力形式。サポートされている形式:<br/>• `"CSV"` - カンマ区切り値<br/>• `"JSON"` - JSON形式<br/>• `"Arrow"` - Apache Arrow形式<br/>• `"Parquet"` - Parquet形式<br/>• `"DataFrame"` - Pandas DataFrame<br/>• `"ArrowTable"` - PyArrow Table<br/>• `"Debug"` - 詳細なロギングを有効化 |
| `path`          | str   | `""`             | データベースファイルパス。デフォルトはメモリ内データベースです。<br/>ファイルパスか、メモリ内データベース用の`":memory:"`を指定できます。                                                                                                                                                            |
| `udf_path`      | str   | `""`             | ユーザー定義関数ディレクトリへのパス                                                                                                                                                                                                                                                                  |

**返り値**

指定された形式でクエリ結果を返します。

| 戻り値の型          | 条件                                                    |
|--------------------|----------------------------------------------------------|
| `str`              | CSVやJSONのようなテキスト形式の場合                     |
| `pd.DataFrame`     | `output_format`が `"DataFrame"` または `"dataframe"` の場合 |
| `pa.Table`         | `output_format`が `"ArrowTable"` または `"arrowtable"` の場合 |
| chdb結果オブジェクト | その他の形式の場合                                      |
 
**例外**

| 例外            | 条件                                                        |
|----------------|--------------------------------------------------------------|
| `ChdbError`    | SQLクエリの実行が失敗した場合                                |
| `ImportError`  | DataFrame/Arrow形式に必要な依存関係が欠如している場合     |

**例**

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

chDBエンジンを使用してSQLクエリを実行します。

これは、組み込みのClickHouseエンジンを使用してSQL文を実行する主要なクエリ関数です。さまざまな出力形式をサポートし、メモリ内またはファイルベースのデータベースで動作することができます。

**構文**

```python
chdb.sql(sql, output_format='CSV', path='', udf_path='')
```

**パラメータ**

| パラメータ       | 型    | デフォルト       | 説明                                                                                                                                                                                                                                                                                                     |
|-----------------|-------|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`           | str   | *必須*           | 実行するSQLクエリ文字列                                                                                                                                                                                                                                                                                  |
| `output_format` | str   | `"CSV"`          | 結果の出力形式。サポートされている形式:<br/>• `"CSV"` - カンマ区切り値<br/>• `"JSON"` - JSON形式<br/>• `"Arrow"` - Apache Arrow形式<br/>• `"Parquet"` - Parquet形式<br/>• `"DataFrame"` - Pandas DataFrame<br/>• `"ArrowTable"` - PyArrow Table<br/>• `"Debug"` - 詳細なロギングを有効化 |
| `path`          | str   | `""`             | データベースファイルパス。デフォルトはメモリ内データベースです。<br/>ファイルパスか、メモリ内データベース用の`":memory:"`を指定できます。                                                                                                                                                            |
| `udf_path`      | str   | `""`             | ユーザー定義関数ディレクトリへのパス                                                                                                                                                                                                                                                                  |

**返り値**

指定された形式でクエリ結果を返します。

| 戻り値の型          | 条件                                                    |
|--------------------|----------------------------------------------------------|
| `str`              | CSVやJSONのようなテキスト形式の場合                     |
| `pd.DataFrame`     | `output_format`が `"DataFrame"` または `"dataframe"` の場合 |
| `pa.Table`         | `output_format`が `"ArrowTable"` または `"arrowtable"` の場合 |
| chdb結果オブジェクト | その他の形式の場合                                      |

**例外**

| 例外                 | 条件                                                        |
|---------------------|--------------------------------------------------------------|
| [`ChdbError`](#chdberror) | SQLクエリの実行が失敗した場合                                |
| `ImportError`       | DataFrame/Arrow形式に必要な依存関係が欠如している場合     |

**例**

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

クエリ結果をPyArrow Tableに変換します。

chDBクエリの結果をPyArrow Tableに変換し、効率的な列指向データ処理のために使用します。
結果が空の場合は空のテーブルを返します。

**構文**

```python
chdb.to_arrowTable(res)
```

**パラメータ**

| パラメータ    | 説明                                             |
|--------------|--------------------------------------------------|
| `res`        | バイナリArrowデータを含むchDBクエリ結果オブジェクト |

**返り値**

| 戻り値の型 | 説明                               |
|-------------|-------------------------------------|
| `pa.Table`  | クエリ結果を含むPyArrow Table      |

**例外**

| エラーの種類    | 説明                                   |
|----------------|----------------------------------------|
| `ImportError`  | pyarrowまたはpandasがインストールされていない場合 |

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

chDBクエリの結果をpandas DataFrameに変換します。最初にPyArrow Tableに変換し、次にマルチスレッド処理を使用してpandasに変換します。

**構文**

```python
chdb.to_df(r)
```

**パラメータ**

| パラメータ  | 説明                                           |
|-------------|-------------------------------------------------|
| `r`         | バイナリArrowデータを含むchDBクエリ結果オブジェクト |

**返り値**

| 戻り値の型 | 説明                                 |
|-------------|----------------------------------------|
| `pd.DataFrame` | クエリ結果を含むpandas DataFrame     |

**例外**

| 例外            | 条件                               |
|----------------|-------------------------------------|
| `ImportError`  | pyarrowまたはpandasがインストールされていない場合 |

**例**

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> df = chdb.to_df(result)
>>> print(df)
   id    msg
0   1  hello
```
## 接続およびセッション管理 {#connection-session-management}

以下のセッション関数が利用可能です：
### `chdb.connect` {#chdb-connect}

chDBバックグラウンドサーバーへの接続を作成します。

この関数は、chDB (ClickHouse) データベースエンジンへの[接続](#chdb-state-sqlitelike-connection)を確立します。
プロセスごとに1つのオープン接続のみが許可されます。
同じ接続文字列での複数の呼び出しは、同じ接続オブジェクトを返します。

```python
chdb.connect(connection_string: str = ':memory:') → Connection
```

**パラメータ:**

| パラメータ           | 型    | デフォルト       | 説明                                    |
|----------------------|-------|------------------|------------------------------------------|
| `connection_string`  | str   | `":memory:"`     | データベース接続文字列。以下の形式を参照。 |

**基本形式**

| 形式                     | 説明                        |
|-------------------------|------------------------------|
| `":memory:"`            | メモリ内データベース（デフォルト） |
| `"test.db"`            | 相対パスデータベースファイル  |
| `"file:test.db"`       | 相対パスと同じ              |
| `"/path/to/test.db"`   | 絶対パスデータベースファイル  |
| `"file:/path/to/test.db"` | 絶対パスと同じ             |

**クエリパラメータ付き**

| 形式                                                  | 説明                   |
|-------------------------------------------------------|-----------------------|
| `"file:test.db?param1=value1&param2=value2"`         | パラメータ付き相対パス |
| `"file::memory:?verbose&log-level=test"`               | パラメータ付きメモリ内  |
| `"///path/to/test.db?param1=value1&param2=value2"`    | パラメータ付き絶対パス  |

**クエリパラメータの取扱い**

クエリパラメータはClickHouseエンジンにスタートアップ引数として渡されます。
特別なパラメータの取扱い：

| 特別パラメータ   | 変換先         | 説明                       |
|------------------|----------------|----------------------------|
| `mode=ro`        | `--readonly=1` | 読み取り専用モード        |
| `verbose`        | (フラグ)       | 詳細ロギングを有効にする  |
| `log-level=test` | (設定)         | ロギングレベルを設定      |

完全なパラメータリストについては、`clickhouse local --help --verbose`を参照してください。

**返り値**

| 戻り値の型  | 説明                                                                                                                                                                                                                                        |
|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Connection` | データベース接続オブジェクトで、次のことをサポートします：<br/>• `Connection.cursor()`でカーソルを作成<br/>• `Connection.query()`で直接クエリ<br/>• `Connection.send_query()`でストリーミングクエリ<br/>• 自動クリーンアップのためのコンテキストマネージャプロトコル |

**例外**

| 例外          | 条件                             |
|----------------|---------------------------------|
| `RuntimeError` | データベースへの接続に失敗した場合 |

:::warning
プロセスあたり1つの接続のみがサポートされています。新しい接続を作成すると、既存の接続が閉じられます。
:::

**例**

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

**参照**
- [`Connection`](#chdb-state-sqlitelike-connection) - データベース接続クラス
- [`Cursor`](#chdb-state-sqlitelike-cursor) - DB-API 2.0操作用のデータベースカーソル
## 例外処理 {#chdb-exceptions}
### **クラス** `chdb.ChdbError` {#chdb_chdbError}

基底クラス：`Exception`

chDB関連のエラーのための基本例外クラスです。

この例外は、chDBクエリの実行が失敗したり、エラーに遭遇した場合に発生します。標準のPython Exceptionクラスを継承し、基盤のClickHouseエンジンからのエラー情報を提供します。

---
### **クラス** `chdb.session.Session` {#chdb_session_session}

基底クラス：`object`

セッションはクエリの状態を保持します。
パスがNoneの場合、一時ディレクトリを作成し、それをデータベースパスとして使用し、セッションが閉じられると一時ディレクトリは削除されます。
データを保持するために指定したパスにデータベースを作成するためのパスを渡すこともできます。

接続文字列を使用して、パスや他のパラメータを渡すこともできます。

```python
class chdb.session.Session(path=None)
```

**例**

| 接続文字列                                      | 説明                             |
|-------------------------------------------------|----------------------------------|
| `":memory:"`                                    | メモリ内データベース             |
| `"test.db"`                                     | 相対パス                         |
| `"file:test.db"`                                | 上記と同じ                      |
| `"/path/to/test.db"`                            | 絶対パス                         |
| `"file:/path/to/test.db"`                       | 上記と同じ                      |
| `"file:test.db?param1=value1&param2=value2"`   | パラメータ付き相対パス         |
| `"file::memory:?verbose&log-level=test"`        | パラメータ付きメモリ内データベース |
| `"///path/to/test.db?param1=value1&param2=value2"` | パラメータ付き絶対パス         |

:::note 接続文字列引数の処理
“[file:test.db?param1=value1&param2=value2](file:test.db?param1=value1&param2=value2)”のように、クエリパラメータを含む接続文字列
“param1=value1”は、ClickHouseエンジンにスタートアップ引数として渡されます。

詳細については、`clickhouse local --help --verbose`を参照してください。

特別な引数の取扱い：
- “mode=ro”はClickHouse用に“–readonly=1”になります（読み取り専用モード）。
:::

:::warning 注意
- 同時に1つのセッションのみが存在できます。新しいセッションを作成する場合は、既存のセッションを閉じる必要があります。
- 新しいセッションを作成すると、既存のセッションが閉じられます。
:::

---
#### `cleanup` {#cleanup}

例外処理を伴うセッションリソースのクリーンアップ。

このメソッドは、クリーンアッププロセス中に発生する可能性のある例外を抑制しながら、セッションを閉じるように試みます。特にエラー処理シナリオや、セッションの状態にかかわらずクリーンアップを確実に行う必要があるときに便利です。

**構文**

```python
cleanup()
```

:::note
このメソッドは例外を発生させることはなく、finallyブロックやデストラクタ内で安全に呼び出すことができます。
:::

**例**

```pycon
>>> session = Session("test.db")
>>> try:
...     session.query("INVALID SQL")
... finally:
...     session.cleanup()  # Safe cleanup regardless of errors
```

**参照**
- [`close()`](#chdb-session-session-close) - エラー伝播を伴う明示的なセッションの閉鎖

---
#### `close` {#close}

セッションを閉じ、リソースをクリーンアップします。

このメソッドは基盤の接続を閉じ、グローバルセッション状態をリセットします。
このメソッドを呼び出した後、セッションは無効になり、さらなるクエリには使用できなくなります。

**構文**

```python
close()
```

:::note
このメソッドは、セッションがコンテキストマネージャとして使用されるか、セッションオブジェクトが破棄されるときに自動的に呼び出されます。
:::

:::warning 注意
`close()`を呼び出した後にセッションを使用しようとすると、エラーが発生します。
:::

**例**

```pycon
>>> session = Session("test.db")
>>> session.query("SELECT 1")
>>> session.close()  # Explicitly close the session
```

---
#### `query` {#chdb-session-session-query}

SQLクエリを実行し、結果を返します。

このメソッドは、セッションのデータベースに対してSQLクエリを実行し、指定された形式で結果を返します。このメソッドはさまざまな出力形式をサポートし、クエリ間でセッション状態を維持します。

**構文**

```python
query(sql, fmt='CSV', udf_path='')
```

**パラメータ**

| パラメータ  | 型    | デフォルト       | 説明                                                                                                                                                                                                                                                                                                                  |
|------------|-------|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`      | str   | *必須*           | 実行するSQLクエリ文字列                                                                                                                                                                                                                                                                                                  |
| `fmt`      | str   | `"CSV"`          | 結果の出力形式。利用可能な形式:<br/>• `"CSV"` - カンマ区切り値<br/>• `"JSON"` - JSON形式<br/>• `"TabSeparated"` - タブ区切り値<br/>• `"Pretty"` - 整形されたテーブル形式<br/>• `"JSONCompact"` - コンパクトJSON形式<br/>• `"Arrow"` - Apache Arrow形式<br/>• `"Parquet"` - Parquet形式 |
| `udf_path` | str   | `""`             | ユーザー定義関数へのパス。指定しない場合、セッション初期化からのUDFパスを使用します。                                                                                                                                                                                                                              |

**返り値**

指定された形式でクエリ結果を返します。
正確な戻り値の型はfmtパラメータによって異なります：
- 文字列形式（CSV、JSONなど）はstrを返します
- バイナリ形式（Arrow、Parquet）はbytesを返します

**例外**

| 例外          | 条件                           |
|--------------|---------------------------------|
| `RuntimeError` | セッションが閉じているか無効である場合 |
| `ValueError`   | SQLクエリが不正な場合           |

:::note
「Debug」形式はサポートされておらず、自動的に「CSV」に変換される際に警告が表示されます。
デバッグには、代わりに接続文字列パラメータを使用してください。
:::

:::warning 注意
このメソッドは同期的にクエリを実行し、すべての結果をメモリに読み込みます。大きな結果セットの場合は、[`send_query()`](#chdb-session-session-send_query)を使用してストリーミング結果を考慮してください。
:::

**例**

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

**参照**
- [`send_query()`](#chdb-session-session-send_query) - ストリーミングクエリ実行用
- [`sql`](#chdb-session-session-sql) - このメソッドのエイリアス

---
#### `send_query` {#chdb-session-session-send_query}

SQLクエリを実行し、ストリーミング結果イテレータを返します。

このメソッドは、セッションのデータベースに対してSQLクエリを実行し、すべての結果を一度にメモリに読み込むことなく繰り返し変数として結果をイテレートできるストリーミング結果オブジェクトを返します。これは特に大きな結果セットに役立ちます。

**構文**

```python
send_query(sql, fmt='CSV') → StreamingResult
```

**パラメータ**

| パラメータ  | 型    | デフォルト       | 説明                                                                                                                                                                                                                                                                    |
|------------|-------|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`      | str   | *必須*           | 実行するSQLクエリ文字列                                                                                                                                                                                                                                                    |
| `fmt`      | str   | `"CSV"`          | 結果の出力形式。利用可能な形式:<br/>• `"CSV"` - カンマ区切り値<br/>• `"JSON"` - JSON形式<br/>• `"TabSeparated"` - タブ区切り値<br/>• `"JSONCompact"` - コンパクトJSON形式<br/>• `"Arrow"` - Apache Arrow形式<br/>• `"Parquet"` - Parquet形式 |

**返り値**

| 戻り値の型       | 説明                                                                                                                                      |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| `StreamingResult` | クエリ結果を逐次に生成するストリーミング結果イテレータ。イテレータはforループで使用するか、他のデータ構造に変換できます。 |

**例外**

| 例外          | 条件                           |
|----------------|---------------------------------|
| `RuntimeError` | セッションが閉じているか無効である場合 |
| `ValueError`   | SQLクエリが不正な場合           |

:::note
「Debug」形式はサポートされておらず、自動的に「CSV」に変換される際に警告が表示されます。デバッグには、代わりに接続文字列パラメータを使用してください。
:::

:::warning
返されたStreamingResultオブジェクトは迅速に消費されるべきであり、適切に保管する必要があります。データベースへの接続を維持します。
:::

**例**

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

**参照**
- [`query()`](#chdb-session-session-query) - 非ストリーミングクエリ実行用
- `chdb.state.sqlitelike.StreamingResult` - ストリーミング結果イテレータ

---
#### `sql` {#chdb-session-session-sql}

SQLクエリを実行し、結果を返します。

このメソッドは、セッションのデータベースに対してSQLクエリを実行し、指定された形式で結果を返します。このメソッドはさまざまな出力形式をサポートし、クエリ間でセッション状態を維持します。

**構文**

```python
sql(sql, fmt='CSV', udf_path='')
```

**パラメータ**

| パラメータ  | 型    | デフォルト       | 説明                                                                                                                                                                                                                                                                                                                  |
|------------|-------|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sql`      | str   | *必須*           | 実行するSQLクエリ文字列                                                                                                                                                                                                                                                                                                  |
| `fmt`      | str   | `"CSV"`          | 結果の出力形式。利用可能な形式:<br/>• `"CSV"` - カンマ区切り値<br/>• `"JSON"` - JSON形式<br/>• `"TabSeparated"` - タブ区切り値<br/>• `"Pretty"` - 整形されたテーブル形式<br/>• `"JSONCompact"` - コンパクトJSON形式<br/>• `"Arrow"` - Apache Arrow形式<br/>• `"Parquet"` - Parquet形式 |
| `udf_path` | str   | `""`             | ユーザー定義関数へのパス。指定しない場合、セッション初期化からのUDFパスを使用します。                                                                                                                                                                                                                              |

**返り値**

指定された形式でクエリ結果を返します。
正確な戻り値の型はfmtパラメータによって異なります：
- 文字列形式（CSV、JSONなど）はstrを返します
- バイナリ形式（Arrow、Parquet）はbytesを返します

**例外:**

| 例外          | 条件                           |
|--------------|---------------------------------|
| `RuntimeError` | セッションが閉じているか無効である場合 |
| `ValueError`   | SQLクエリが不正な場合           |

:::note
「Debug」形式はサポートされておらず、自動的に「CSV」に変換される際に警告が表示されます。デバッグには、代わりに接続文字列パラメータを使用してください。
:::

:::warning 注意
このメソッドは同期的にクエリを実行し、すべての結果をメモリに読み込みます。
大きな結果セットの場合は、[`send_query()`](#chdb-session-session-send_query)を使用してストリーミング結果を考慮してください。
:::

**例**

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

**参照**
- [`send_query()`](#chdb-session-session-send_query) - ストリーミングクエリ実行用
- [`sql`](#chdb-session-session-sql) - このメソッドのエイリアス
## 状態管理 {#chdb-state-management}
### `chdb.state.connect` {#chdb_state_connect}

chDBバックグラウンドサーバーへの[接続](#chdb-state-sqlitelike-connection)を作成します。

この関数は、chDB (ClickHouse) データベースエンジンへの接続を確立します。プロセスごとに1つのオープン接続のみが許可されます。同じ接続文字列での複数の呼び出しは、同じ接続オブジェクトを返します。

**構文**

```python
chdb.state.connect(connection_string: str = ':memory:') → Connection
```

**パラメータ**

| パラメータ                          | 型    | デフォルト       | 説明                                    |
|-------------------------------------|-------|------------------|------------------------------------------|
| `connection_string(str, optional)`  | str   | `":memory:"`     | データベース接続文字列。以下の形式を参照。 |

**基本形式**

サポートされている接続文字列形式：

| 形式                    | 説明                        |
|-------------------------|------------------------------|
| `":memory:"`            | メモリ内データベース（デフォルト） |
| `"test.db"`            | 相対パスデータベースファイル  |
| `"file:test.db"`       | 相対パスと同じ              |
| `"/path/to/test.db"`   | 絶対パスデータベースファイル  |
| `"file:/path/to/test.db"` | 絶対パスと同じ             |

**クエリパラメータ付き**

| 形式                                                  | 説明                   |
|-------------------------------------------------------|-----------------------|
| `"file:test.db?param1=value1&param2=value2"`         | パラメータ付き相対パス |
| `"file::memory:?verbose&log-level=test"`               | パラメータ付きメモリ内  |
| `"///path/to/test.db?param1=value1&param2=value2"`    | パラメータ付き絶対パス  |

**クエリパラメータの取扱い**

クエリパラメータはClickHouseエンジンにスタートアップ引数として渡されます。
特別なパラメータの取扱い：

| 特別パラメータ   | 変換先         | 説明                       |
|------------------|----------------|----------------------------|
| `mode=ro`        | `--readonly=1` | 読み取り専用モード        |
| `verbose`        | (フラグ)       | 詳細ロギングを有効にする  |
| `log-level=test` | (設定)         | ロギングレベルを設定      |

完全なパラメータリストについては、`clickhouse local --help --verbose`を参照してください。

**返り値**

| 戻り値の型  | 説明                                                                                                                                                                                                                                        |
|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Connection` | データベース接続オブジェクトで、次のことをサポートします：<br/>• `Connection.cursor()`でカーソルを作成<br/>• `Connection.query()`で直接クエリ<br/>• `Connection.send_query()`でストリーミングクエリ<br/>• 自動クリーンアップのためのコンテキストマネージャプロトコル |

**例外**

| 例外          | 条件                             |
|----------------|---------------------------------|
| `RuntimeError` | データベースへの接続に失敗した場合 |

:::warning 注意
プロセスあたり1つの接続のみがサポートされています。新しい接続を作成すると、既存の接続が閉じられます。
:::

**例**

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

**参照**
- `Connection` - データベース接続クラス
- `Cursor` - DB-API 2.0操作用のデータベースカーソル
### **クラス** `chdb.state.sqlitelike.Connection` {#chdb-state-sqlitelike-connection}

基底クラス：`object`

**構文**

```python
class chdb.state.sqlitelike.Connection(connection_string: str)
```

---
#### `close` {#chdb-session-session-close}

接続を閉じ、リソースをクリーンアップします。

このメソッドはデータベース接続を閉じ、アクティブなカーソルを含む関連リソースをクリーンアップします。このメソッドを呼び出した後、接続は無効になり、さらなる操作には使用できなくなります。

**構文**

```python
close() → None
```

:::note
このメソッドは冪等です - 複数回呼び出すことは安全です。
:::

:::warning 注意
接続が閉じられたときに進行中のストリーミングクエリはキャンセルされます。閉じる前に全ての重要なデータが処理されていることを確認してください。
:::

**例**

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

#### `cursor` {#chdb-state-sqlitelike-connection-cursor}

クエリを実行するための [Cursor](#chdb-state-sqlitelike-cursor) オブジェクトを作成します。

このメソッドは、クエリを実行し、結果を取得するための標準DB-API 2.0インターフェースを提供するデータベースカーソルを作成します。カーソルは、クエリの実行および結果の取得に対して精密なコントロールを許可します。

**構文**

```python
cursor() → Cursor
```

**返す値**

| 戻り値の型  | 説明                             |
|--------------|---------------------------------|
| `Cursor`     | データベース操作用のカーソルオブジェクト |

:::note
新しいカーソルを作成すると、この接続に関連付けられた既存のカーソルが置き換えられます。接続ごとに1つのカーソルのみがサポートされています。
:::

**例**

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

**パラメーター:**

| パラメーター  | 型   | デフォルト    | 説明                                                                                                                                                                                                                                                                                   |
|----------------|-------|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `query`        | str   | *必須*        | 実行するSQLクエリ文字列                                                                                                                                                                                                                                                               |
| `format`       | str   | `"CSV"`       | 結果の出力形式。サポートされる形式:<br/>• `"CSV"` - カンマ区切り値（文字列）<br/>• `"JSON"` - JSON形式（文字列）<br/>• `"Arrow"` - Apache Arrow形式（バイト）<br/>• `"Dataframe"` - Pandas DataFrame（pandasが必要）<br/>• `"Arrowtable"` - PyArrow Table（pyarrowが必要） |

**返す値**

| 戻り値の型        | 説明                                    |
|-------------------|----------------------------------------|
| `str`             | 文字列形式（CSV、JSON）の場合          |
| `bytes`           | Arrow形式の場合                       |
| `pandas.DataFrame`| DataFrame形式の場合                    |
| `pyarrow.Table`   | arrowtable形式の場合                   |

**例外**

| 例外          | 条件                                             |
|---------------|--------------------------------------------------|
| `RuntimeError`| クエリの実行が失敗した場合                        |
| `ImportError` | 必要なパッケージがインストールされていない場合   |

:::warning 警告
このメソッドは、全結果セットをメモリにロードします。大きな結果の場合、[`send_query()`](#chdb-state-sqlitelike-connection-send_query) を使用してストリーミングを検討してください。
:::

**例**

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

**関連項目**
- [`send_query()`](#chdb-state-sqlitelike-connection-send_query) - ストリーミングクエリ実行用

---
#### `send_query` {#chdb-state-sqlitelike-connection-send_query}

SQLクエリを実行し、ストリーミング結果イテレータを返します。

このメソッドは、SQLクエリを実行し、結果を一度にすべてメモリにロードせずにイテレーションできるStreamingResultオブジェクトを返します。これは、大量の結果セットを処理するのに理想的です。

**構文**

```python
send_query(query: str, format: str = 'CSV') → StreamingResult
```

**パラメーター**

| パラメーター  | 型   | デフォルト    | 説明                                                                                                                                                                                                                                                                      |
|----------------|-------|-----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `query`        | str   | *必須*          | 実行するSQLクエリ文字列                                                                                                                                                                                                                                                   |
| `format`       | str   | `"CSV"`         | 結果の出力形式。サポートされる形式:<br/>• `"CSV"` - カンマ区切り値<br/>• `"JSON"` - JSON形式<br/>• `"Arrow"` - Apache Arrow形式（record_batch()メソッドを有効にします）<br/>• `"dataframe"` - Pandas DataFrameチャンク<br/>• `"arrowtable"` - PyArrow Tableチャンク |

**返す値**

| 戻り値の型       | 説明                                                                                                                                                                                                  |
|------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `StreamingResult` | クエリ結果のストリーミングイテレータ。サポートしています:<br/>• イテレータプロトコル（forループ）<br/>• コンテキストマネージャプロトコル（with文）<br/>• fetch()メソッドによる手動取得<br/>• PyArrow RecordBatchストリーミング（Arrow形式のみ） |

**例外**

| 例外          | 条件                                         |
|---------------|-----------------------------------------------|
| `RuntimeError`| クエリの実行が失敗した場合                     |
| `ImportError` | 必要なパッケージがインストールされていない場合 |

:::note
`record_batch()`メソッドは、返されたStreamingResultの“Arrow”形式のみがサポートしています。
:::

**例**

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

**関連項目**
- [`query()`](#chdb-state-sqlitelike-connection-query) - 非ストリーミングクエリ実行用
- `StreamingResult` - ストリーミング結果イテレータ

---
### **class** `chdb.state.sqlitelike.Cursor` {#chdb-state-sqlitelike-cursor}

基底: `object`

```python
class chdb.state.sqlitelike.Cursor(connection)
```

---
#### `close` {#cursor-close-none}

カーソルを閉じてリソースをクリーンアップします。

このメソッドは、カーソルを閉じ、関連付けられたリソースをクリーンアップします。このメソッドを呼び出した後、カーソルは無効になり、さらなる操作に使用できません。

**構文**

```python
close() → None
```

:::note
このメソッドは冪等です - 複数回呼び出しても安全です。
接続が閉じると、カーソルも自動的に閉じられます。
:::

**例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT 1")
>>> result = cursor.fetchone()
>>> cursor.close()  # Cleanup cursor resources
```

---
#### `column_names` {#chdb-state-sqlitelike-cursor-column_names}

最後に実行されたクエリのカラム名のリストを返します。

このメソッドは、最も最近実行されたSELECTクエリからカラム名を返します。名前は結果セットに表示される順序で返されます。

**構文**

```python
column_names() → list
```

**返す値**

| 戻り値の型  | 説明                                                                                                                     |
|--------------|-----------------------------------------------------------------------------------------------------------------------|
| `list`       | カラム名の文字列のリスト、またはクエリが実行されていない場合やクエリがカラムを返さなかった場合は空のリスト |

**例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name, email FROM users LIMIT 1")
>>> print(cursor.column_names())
['id', 'name', 'email']
```

**関連項目**
- [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - カラムタイプ情報を取得する
- [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0 カラムの説明

---
#### `column_types` {#chdb-state-sqlitelike-cursor-column_types}

最後に実行されたクエリのカラムタイプのリストを返します。

このメソッドは、最も最近実行されたSELECTクエリからClickHouseのカラムタイプ名を返します。タイプは結果セットに表示される順序で返されます。

**構文**

```python
column_types() → list
```

**返す値**

| 戻り値の型 | 説明 |
|-------------|-------------|
| `list`      | ClickHouseのタイプ名文字列のリスト、またはクエリが実行されていない場合やクエリがカラムを返さなかった場合は空のリスト |

**例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT toInt32(1), toString('hello')")
>>> print(cursor.column_types())
['Int32', 'String']
```

**関連項目**
- [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - カラム名情報を取得する
- [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0 カラムの説明

---
#### `commit` {#commit}

保留中のトランザクションをコミットします。

このメソッドは、保留中のデータベーストランザクションをコミットします。ClickHouseでは、ほとんどの操作が自動コミットされますが、このメソッドはDB-API 2.0の互換性のために提供されています。

:::note
ClickHouseは通常、操作を自動コミットするため、明示的なコミットは通常必要ありません。このメソッドは、標準DB-API 2.0ワークフローとの互換性のために提供されています。
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

DB-API 2.0仕様に基づきカラムの説明を返します。

このプロパティは、最後に実行されたSELECTクエリの結果セットの各カラムを説明する7項目のタプルのリストを返します。各タプルには次のものが含まれます：(name, type_code, display_size, internal_size, precision, scale, null_ok)

現在、nameとtype_codeのみが提供されており、他のフィールドはNoneに設定されています。

**返す値**

| 戻り値の型 | 説明 |
|-------------|-------------|
| `list`      | 各カラムを説明する7タプルのリスト、またはSELECTクエリが実行されていない場合は空のリスト |

:::note
これはcursor.descriptionのDB-API 2.0仕様に従っています。
この実装では、最初の2つの要素（nameとtype_code）のみが意味のあるデータを含みます。
:::

**例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name FROM users LIMIT 1")
>>> for desc in cursor.description:
...     print(f"Column: {desc[0]}, Type: {desc[1]}")
Column: id, Type: Int32
Column: name, Type: String
```

**関連項目**
- [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - カラム名のみを取得
- [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - カラムタイプのみを取得

---
#### `execute` {#execute}

SQLクエリを実行し、結果を取得するために準備します。

このメソッドは、SQLクエリを実行し、結果を取得するためのメソッドを使用する準備をします。結果データの解析とClickHouseデータタイプの自動型変換を処理します。

**構文**

```python
execute(query: str) → None
```

**パラメーター:**

| パラメーター  | 型       | 説明                     |
|---------------|----------|--------------------------|
| `query`       | str      | 実行するSQLクエリ文字列 |

**例外**

| 例外               | 条件                           |
|--------------------|----------------------------------|
| `Exception`        | クエリの実行が失敗するか、結果の解析が失敗する場合 |

:::note
このメソッドは`cursor.execute()`のDB-API 2.0仕様に従います。
実行後は、`fetchone()`、`fetchmany()`、または`fetchall()`を使用して結果を取得できます。
:::

:::note
このメソッドはClickHouseデータタイプを適切なPythonタイプに自動的に変換します：

- Int/UIntタイプ → int
- Floatタイプ → float
- String/FixedString → str
- DateTime → datetime.datetime
- Date → datetime.date
- Bool → bool
:::

**例**

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

**関連項目**
- [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 単一行を取得
- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 複数行を取得
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 残りのすべての行を取得

---
#### `fetchall` {#chdb-state-sqlitelike-cursor-fetchall}

クエリ結果の残りのすべての行を取得します。

このメソッドは、現在のカーソル位置から始まる現在のクエリ結果セットのすべての残りの行を取得します。適切なPython型変換が適用された行タプルのタプルを返します。

**構文**

```python
fetchall() → tuple
```

**返す値:**

| 戻り値の型 | 説明 |
|-------------|-------------|
| `tuple`     | 結果セットからのすべての残りの行タプルを含むタプル。行が利用できない場合は空のタプルを返します |

:::warning 警告
このメソッドは、すべての残りの行を一度にメモリにロードします。大きな結果セットの場合、[`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany)を使用してバッチで結果を処理することを検討してください。
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

このメソッドは、現在のクエリ結果セットから最大「size」行を取得します。各行には、適切なPython型変換が適用されたカラム値を含むタプルが返されます。

**構文**

```python
fetchmany(size: int = 1) → tuple
```

**パラメーター**

| パラメーター | 型   | デフォルト | 説明         |
|---------------|------|------------|--------------|
| `size`        | int  | `1`        | 取得する行の最大数 |

**返す値**

| 戻り値の型 | 説明                                                                                         |
|-------------|---------------------------------------------------------------------------------------------|
| `tuple`     | 'size'行タプルを含むタプル。結果セットが枯渇した場合は少ない行を含むことがあります |

:::note
このメソッドはDB-API 2.0仕様に従います。結果セットが枯渇した場合は、'size'行未満を返します。
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

このメソッドは、現在のクエリ結果セットから次に利用可能な行を取得します。適切なPython型変換が適用されたカラム値を含むタプルを返します。

**構文** 

```python
fetchone() → tuple | None
```

**返す値:**

| 戻り値の型       | 説明                                                                 |
|-------------------|---------------------------------------------------------------------|
| `Optional[tuple]` | 次の行をカラム値のタプルとして返します。行が利用できない場合はNoneを返します |

:::note
このメソッドはDB-API 2.0仕様に従います。カラム値はClickHouseのカラムタイプに基づいて、適切なPythonタイプに自動的に変換されます。
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

**関連項目**
- [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 複数行を取得
- [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 残りのすべての行を取得

---
### `chdb.state.sqlitelike` {#state-sqlitelike-to_arrowtable}

クエリ結果をPyArrow Tableに変換します。

この関数は、chdbクエリ結果をPyArrow Table形式に変換します。これにより、効率的な列指向データアクセスと他のデータ処理ライブラリとの相互運用性が提供されます。

**構文**

```python
chdb.state.sqlitelike.to_arrowTable(res)
```

**パラメーター:**

| パラメーター  | 型   | 説明                                                |
|---------------|-------|----------------------------------------------------|
| `res`         | -     | Arrow形式データを含むchdbのクエリ結果オブジェクト |

**返す値**

| 戻り値の型     | 説明                                |
|-----------------|-------------------------------------|
| `pyarrow.Table` | クエリ結果を含むPyArrow Table      |

**例外**

| 例外        | 条件                                       |
|--------------|-------------------------------------------|
| `ImportError`| pyarrowまたはpandasパッケージがインストールされていない場合 |

:::note
この関数は、pyarrowとpandasの両方がインストールされている必要があります。
インストールするには: `pip install pyarrow pandas`
:::

:::warning 警告
空の結果は、スキーマのない空のPyArrow Tableを返します。
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

この関数は、chdbクエリ結果を最初にPyArrow Tableに変換し、その後DataFrameに変換します。これにより、Pandas APIを使用した便利なデータ分析機能が提供されます。

**構文**

```python
chdb.state.sqlitelike.to_df(r)
```

**パラメーター:**

| パラメーター  | 型   | 説明                                                |
|---------------|-------|----------------------------------------------------|
| `r`           | -     | Arrow形式データを含むchdbのクエリ結果オブジェクト |

**返す値:**

| 戻り値の型        | 説明                                                                         |
|-------------------|------------------------------------------------------------------------------|
| `pandas.DataFrame`| 適切なカラム名とデータ型を持つクエリ結果を含むDataFrame                  |

**例外**

| 例外        | 条件                                       |
|--------------|-------------------------------------------|
| `ImportError`| pyarrowまたはpandasパッケージがインストールされていない場合 |

:::note
この関数は、ArrowからPandasへの変換のためにマルチスレッドを使用して、大きなデータセットのパフォーマンスを向上させます。
:::

**関連項目**
- [`to_arrowTable()`](#chdb-state-sqlitelike-to_arrowtable) - PyArrow Table形式への変換用

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

## DataFrame Integration {#dataframe-integration}
### **class** `chdb.dataframe.Table` {#chdb-dataframe-table}

基底:

```python
class chdb.dataframe.Table(*args: Any, **kwargs: Any)
```
## Database API (DBAPI) 2.0 Interface {#database-api-interface}

chDBは、データベース接続のためのPython DB-API 2.0互換インターフェースを提供し、標準のデータベースインターフェースを期待するツールやフレームワークでchDBを使用できるようにします。

chDBのDB-API 2.0インターフェースには以下が含まれます。

- **接続**: 接続文字列を使用したデータベース接続管理
- **カーソル**: クエリの実行および結果の取得
- **型システム**: DB-API 2.0準拠のタイプ定数とコンバータ
- **エラーハンドリング**: 標準データベース例外階層
- **スレッドセーフ**: レベル1スレッドセーフ（スレッドはモジュールを共有できますが、接続は共有できません）

---
### コア機能 {#core-functions}

データベースAPI（DBAPI）2.0インターフェースは、以下のコア機能を実装しています。
#### `chdb.dbapi.connect` {#dbapi-connect}

新しいデータベース接続を初期化します。

**構文**

```python
chdb.dbapi.connect(*args, **kwargs)
```

**パラメーター**

| パラメーター  | 型    | デフォルト   | 説明                                 |
|---------------|-------|--------------|--------------------------------------|
| `path`        | str   | `None`       | データベースファイルのパス。メモリ内データベースの場合はNone |

**例外**

| 例外                            | 条件                             |
|----------------------------------|----------------------------------|
| [`err.Error`](#chdb-dbapi-err-error) | 接続を確立できない場合            |

---
#### `chdb.dbapi.get_client_info()` {#dbapi-get-client-info}

クライアントバージョン情報を取得します。

MySQLdb互換のため、chDBクライアントバージョンを文字列として返します。

**構文**

```python
chdb.dbapi.get_client_info()
```

**返す値**

| 戻り値の型  | 説明                                  |
|--------------|----------------------------------------|
| `str`        | 'major.minor.patch'形式のバージョン文字列 |

---
### 型コンストラクタ {#type-constructors}
#### `chdb.dbapi.Binary(x)` {#dbapi-binary}

xをバイナリ型として返します。

この関数は、DB-API 2.0仕様に従って、入力をバイト型に変換します。

**構文**

```python
chdb.dbapi.Binary(x)
```

**パラメーター**

| パラメーター  | 型   | 説明                           |
|---------------|------|---------------------------------|
| `x`           | -    | バイナリに変換する入力データ   |

**返す値**

| 戻り値の型  | 説明                       |
|--------------|-----------------------------|
| `bytes`      | バイトに変換された入力     |

---
### 接続クラス {#connection-class}
#### **class** `chdb.dbapi.connections.Connection(path=None)` {#chdb-dbapi-connections-connection}

基底: `object`

DB-API 2.0準拠のchDBデータベースへの接続。

このクラスは、chDBデータベースへの接続と対話のための標準DB-APIインターフェースを提供します。メモリ内データベースとファイルベースのデータベースの両方をサポートしています。

接続は、基本的なchDBエンジンを管理し、クエリの実行、トランザクションの管理（ClickHouseでは無操作）、およびカーソルの作成に関するメソッドを提供します。

```python
class chdb.dbapi.connections.Connection(path=None)
```

**パラメーター**

| パラメーター  | 型   | デフォルト    | 説明                                                                                               |
|---------------|------|---------------|----------------------------------------------------------------------------------------------------|
| `path`        | str  | `None`        | データベースファイルのパス。Noneの場合はメモリ内データベースを使用します。'database.db'のようなファイルパスまたは':memory:'でNoneを指定できます。 |

**変数**

| 変数        | 型    | 説明                                              |
|--------------|-------|--------------------------------------------------|
| `encoding`   | str   | クエリの文字エンコーディング、デフォルトは'utf8' |
| `open`       | bool  | 接続が開いていればTrue、閉じていればFalse        |

**例**

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
ClickHouseでは伝統的なトランザクションはサポートされていないため、commit()およびrollback()操作は無操作ですが、DB-API準拠のために提供されています。
:::

---
#### `close` {#dbapi-connection-close}

データベース接続を閉じます。

基礎となるchDB接続を閉じ、この接続を閉じたものとしてマークします。
この接続でのその後の操作はエラーを発生させます。

**構文**

```python
close()
```

**例外**

| 例外                            | 条件                           |
|----------------------------------|----------------------------------|
| [`err.Error`](#chdb-dbapi-err-error) | すでに接続が閉じられている場合    |

---
#### `commit` {#dbapi-commit}

現在のトランザクションをコミットします。

**構文**

```python
commit()
```

:::note
これはchDB/ClickHouseにとって無操作であり、伝統的なトランザクションをサポートしていません。DB-API 2.0準拠のために提供されています。
:::

---
#### `cursor` {#dbapi-cursor}

クエリを実行するための新しいカーソルを作成します。

**構文**

```python
cursor(cursor=None)
```

**パラメーター**

| パラメーター  | 型   | 説明                            |
|---------------|------|---------------------------------|
| `cursor`      | -    | 無視され、互換性のために提供されます |

**返す値**

| 戻り値の型  | 説明                             |
|--------------|-----------------------------------|
| `Cursor`     | この接続用の新しいカーソルオブジェクト |

**例外**

| 例外                            | 条件                   |
|----------------------------------|------------------------|
| [`err.Error`](#chdb-dbapi-err-error) | 接続が閉じている場合    |

**例**

```pycon
>>> conn = Connection()
>>> cur = conn.cursor()
>>> cur.execute("SELECT 1")
>>> result = cur.fetchone()
```

---
#### `escape` {#escape}

値をSQLクエリに安全に含めるためにエスケープします。

**構文**

```python
escape(obj, mapping=None)
```

**パラメーター**

| パラメーター  | 型   | 説明                                       |
|---------------|------|---------------------------------------------|
| `obj`         | -    | エスケープする値（文字列、バイト、数値など）  |
| `mapping`     | -    | エスケープ用のオプションの文字マッピング       |

**返す値**

| 戻り値の型  | 説明                                                       |
|--------------|-----------------------------------------------------------|
| -            | SQLクエリに適したエスケープ版の入力                     |

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

**パラメーター**

| パラメーター  | 型   | 説明                          |
|---------------|------|-------------------------------|
| `s`           | str  | エスケープする文字列          |

**返す値**

| 戻り値の型  | 説明                                  |
|--------------|---------------------------------------|
| `str`        | SQLへの含めるに安全なエスケープされた文字列 |

---
#### `property open` {#property-open}

接続が開いているかどうかを確認します。

**返す値**

| 戻り値の型  | 説明                                  |
|--------------|----------------------------------------|
| `bool`       | 接続が開いていればTrue、閉じていればFalse |

---
#### `query` {#dbapi-query}

SQLクエリを直接実行し、生の結果を返します。

このメソッドはカーソルインターフェースをバイパスし、クエリを直接実行します。
標準DB-APIの使用のためには、cursor()メソッドを使用するのが好まれます。

**構文**

```python
query(sql, fmt='CSV')
```

**パラメーター:**

| パラメーター  | 型         | デフォルト    | 説明                                                             |
|---------------|------------|---------------|-----------------------------------------------------------------|
| `sql`         | str または bytes | *必須*           | 実行するSQLクエリ                                                 |
| `fmt`         | str        | `"CSV"`       | 出力形式。サポートされる形式には"CSV"、"JSON"、"Arrow"、"Parquet"などがあります。 |

**返す値**

| 戻り値の型  | 説明                                |
|--------------|--------------------------------------|
| -            | 指定された形式のクエリ結果            |

**例外**

| 例外                                              | 条件                                  |
|---------------------------------------------------|---------------------------------------|
| [`err.InterfaceError`](#chdb-dbapi-err-interfaceerror) | 接続が閉じているか、クエリが失敗した場合 |

**例**

```pycon
>>> conn = Connection()
>>> result = conn.query("SELECT 1, 'hello'", "CSV")
>>> print(result)
"1,hello\n"
```

---
#### `property resp` {#property-resp}

最後のクエリ応答を取得します。

**返す値**

| 戻り値の型  | 説明                                  |
|--------------|----------------------------------------|
| -            | 最後のquery()呼び出しからの生の応答    |

:::note
このプロパティは、query()が直接呼び出されるたびに更新されます。
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
これはchDB/ClickHouseにとって無操作であり、伝統的なトランザクションをサポートしていません。DB-API 2.0準拠のために提供されています。
:::

---
### カーソルクラス {#cursor-class}
#### **class** `chdb.dbapi.cursors.Cursor` {#chdb-dbapi-cursors-cursor}

基底: `object`

クエリを実行し、結果を取得するためのDB-API 2.0カーソル。

カーソルは、SQL文を実行し、クエリ結果を管理し、結果セットをナビゲートするためのメソッドを提供します。パラメータバインディング、大規模な操作をサポートし、DB-API 2.0仕様に従います。

Cursorインスタンスを直接作成しないでください。代わりに`Connection.cursor()`を使用してください。

```python
class chdb.dbapi.cursors.Cursor(connection)
```

| 変数          | 型    | 説明                                                 |
|---------------|-------|------------------------------------------------------|
| `description` | tuple | 最後のクエリ結果のカラムメタデータ                   |
| `rowcount`    | int   | 最後のクエリによって影響を受けた行数（不明な場合は-1） |
| `arraysize`   | int   | 一度に取得する行のデフォルト数（デフォルト: 1）      |
| `lastrowid`   | -     | 最後に挿入された行のID（該当する場合）               |
| `max_stmt_length` | int | executemany()のための最大ステートメントサイズ（デフォルト: 1024000） |

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
完全な仕様の詳細については [DB-API 2.0 Cursor Objects](https://www.python.org/dev/peps/pep-0249/#cursor-objects) を参照してください。
:::

---
#### `callproc` {#callproc}

ストアドプロシージャを実行します（プレースホルダ実装）。

**構文**

```python
callproc(procname, args=())
```

**パラメーター**

| パラメーター  | 型     | 説明                           |
|---------------|--------|----------------------------------|
| `procname`    | str    | 実行するストアドプロシージャの名前 |
| `args`        | sequence | プロシージャに渡すパラメータ    |

**返す値**

| 戻り値の型  | 説明                                |
|--------------|--------------------------------------|
| `sequence`   | オリジナルのargsパラメータ（変更されない） |

:::note
chDB/ClickHouseは伝統的なストアドプロシージャをサポートしていません。
このメソッドはDB-API 2.0準拠のために提供されていますが、実際の操作は行いません。すべてのSQL操作にはexecute()を使用してください。
:::

:::warning 互換性
これはプレースホルダ実装です。OUT/INOUTパラメータ、複数結果セット、サーバ変数などの伝統的なストアドプロシージャ機能は、基礎となるClickHouseエンジンではサポートされていません。
:::

---
#### `close` {#dbapi-cursor-close}

カーソルを閉じ、関連するリソースを解放します。

閉じた後、カーソルは無効になり、いかなる操作も例外を発生させます。
カーソルを閉じることは、残りのすべてのデータを消耗させ、基礎となるカーソルを解放します。

**構文**

```python
close()
```

---
#### `execute` {#dbapi-execute}

SQLクエリをオプションのパラメータバインディングで実行します。

このメソッドは、オプションのパラメータの置換を伴う単一のSQLステートメントを実行します。
柔軟性のために、複数のパラメータプレースホルダスタイルをサポートしています。

**構文**

```python
execute(query, args=None)
```

**パラメータ**

| パラメータ  | 型               | デフォルト      | 説明                          |
|-------------|------------------|------------------|-------------------------------|
| `query`     | str              | *必須*           | 実行するSQLクエリ             |
| `args`      | tuple/list/dict  | `None`           | プレースホルダにバインドするパラメータ |

**戻り値**

| 戻り値の型 | 説明                             |
|------------|-----------------------------------|
| `int`      | 影響を受けた行数 (-1 は不明)     |

**パラメータスタイル**

| スタイル             | 例                                                  |
|----------------------|-----------------------------------------------------|
| クエスチョンマークスタイル | `"SELECT * FROM users WHERE id = ?"`                   |
| 名前付きスタイル       | `"SELECT * FROM users WHERE name = %(name)s"`           |
| フォーマットスタイル    | `"SELECT * FROM users WHERE age = %s"` (レガシー)        |

**例**

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

**発生する例外**

| 例外                                              | 条件                                 |
|--------------------------------------------------|-------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | カーソルが閉じているか、クエリが不正な場合 |
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror)     | 実行中にデータベースエラーが発生した場合 |

---
#### `executemany(query, args)` {#chdb-dbapi-cursors-cursor-executemany}

異なるパラメータセットでクエリを複数回実行します。

このメソッドは、異なるパラメータ値で同一のSQLクエリを効率的に複数回実行します。
特にバルクINSERT操作に便利です。

**構文**

```python
executemany(query, args)
```

**パラメータ**

| パラメータ  | 型      | 説明                                                 |
|-------------|---------|-----------------------------------------------------|
| `query`     | str     | 複数回実行するSQLクエリ                             |
| `args`      | sequence | 各実行のためのパラメータタプル/辞書/リストのシーケンス |

**戻り値**

| 戻り値の型 | 説明                                         |
|------------|----------------------------------------------|
| `int`      | すべての実行での影響を受けた行の総数        |

**例**

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
このメソッドは、クエリ実行プロセスを最適化することにより、複数行のINSERTおよびUPDATE操作のパフォーマンスを向上させます。
:::

---
#### `fetchall()` {#dbapi-fetchall}

クエリ結果からすべての残りの行を取得します。

**構文**

```python
fetchall()
```

**戻り値**

| 戻り値の型 | 説明                                    |
|------------|------------------------------------------|
| `list`     | 残りのすべての行を表すタプルのリスト    |

**発生する例外**

| 例外                                              | 条件                               |
|--------------------------------------------------|------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | `execute()` が最初に呼び出されていない場合 |

:::warning 警告
このメソッドは、大きな結果セットで大量のメモリを消費する可能性があります。
大きなデータセットには `fetchmany()` の使用を検討してください。
:::

**例**

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> all_rows = cursor.fetchall()
>>> print(len(all_rows))  # Number of total rows
```

---
#### `fetchmany` {#dbapi-fetchmany}

クエリ結果から複数の行を取得します。

**構文**

```python
fetchmany(size=1)
```

**パラメータ**

| パラメータ  | 型   | デフォルト | 説明                                                   |
|-------------|------|------------|-------------------------------------------------------|
| `size`      | int  | `1`        | 取得する行数。指定しない場合はカーソルのarraysizeを使用 |

**戻り値**

| 戻り値の型 | 説明                                   |
|------------|----------------------------------------|
| `list`     | 取得した行を表すタプルのリスト         |

**発生する例外**

| 例外                                              | 条件                               |
|--------------------------------------------------|------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | `execute()` が最初に呼び出されていない場合 |

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

| 戻り値の型      | 説明                                                  |
|----------------|------------------------------------------------------|
| `tuple or None` | 次の行をタプルとして、行が利用できない場合は None を返します |

**発生する例外**

| 例外                                              | 条件                               |
|--------------------------------------------------|------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | `execute()` が最初に呼び出されていない場合 |

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

[`executemany()`](#chdb-dbapi-cursors-cursor-executemany) が生成する最大ステートメントサイズ。

デフォルト値は 1024000 です。

---
#### `mogrify` {#mogrify}

データベースに送信される正確なクエリ文字列を返します。

このメソッドは、パラメータの置換後に最終的なSQLクエリを表示します。
これはデバッグやログ目的に便利です。

**構文**

```python
mogrify(query, args=None)
```

**パラメータ**

| パラメータ  | 型               | デフォルト      | 説明                             |
|-------------|------------------|------------------|----------------------------------|
| `query`     | str               | *必須*           | パラメータプレースホルダを含むSQLクエリ |
| `args`      | tuple/list/dict   | `None`           | 置換するパラメータ             |

**戻り値**

| 戻り値の型 | 説明                                           |
|------------|------------------------------------------------|
| `str`      | パラメータが置換された最終的なSQLクエリ文字列 |

**例**

```pycon
>>> cur.mogrify("SELECT * FROM users WHERE id = ?", (123,))
"SELECT * FROM users WHERE id = 123"
```

:::note
このメソッドは、Psycopgによって使用されるDB-API 2.0への拡張に従います。
:::

---
#### `nextset` {#nextset}

次の結果セットに移動します（サポートされていません）。

**構文**

```python
nextset()
```

**戻り値**

| 戻り値の型 | 説明                                                |
|------------|----------------------------------------------------|
| `None`     | 複数の結果セットがサポートされていないため、常に None を返します |

:::note
chDB/ClickHouse は、単一のクエリからの複数の結果セットをサポートしていません。
このメソッドはDB-API 2.0の互換性のために提供されており、常に None を返します。
:::

---
#### `setinputsizes` {#setinputsizes}

パラメータの入力サイズを設定します（ノーオップ実装）。

**構文**

```python
setinputsizes(*args)
```

**パラメータ**

| パラメータ  | 型   | 説明                        |
|-------------|------|------------------------------|
| `*args`     | -    | パラメータサイズ仕様（無視される） |

:::note
このメソッドは何もしませんが、DB-API 2.0仕様によって要求されます。
chDBは内部でパラメータサイズを自動的に処理します。
:::

---
#### `setoutputsizes` {#setoutputsizes}

出力カラムサイズを設定します（ノーオップ実装）。

**構文**

```python
setoutputsizes(*args)
```

**パラメータ**

| パラメータ  | 型   | 説明                             |
|-------------|------|-----------------------------------|
| `*args`     | -    | カラムサイズ仕様（無視される）   |

:::note
このメソッドは何もしませんが、DB-API 2.0仕様によって要求されます。
chDBは内部で出力サイズを自動的に処理します。
:::

---
### エラークラス {#error-classes}

chdbデータベース操作のための例外クラス。

このモジュールは、chdbにおけるデータベース関連のエラーを処理するための例外クラスの完全な階層を提供し、PythonデータベースAPI仕様v2.0に従っています。

例外階層は次のように構成されています。

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

各例外クラスは、特定のカテゴリのデータベースエラーを表します：

| 例外              | 説明                                            |
|-------------------|------------------------------------------------|
| `Warning`         | データベース操作中の非致命的警告              |
| `InterfaceError`  | データベースインターフェイス自体の問題        |
| `DatabaseError`   | すべてのデータベース関連エラーのベースクラス  |
| `DataError`       | データ処理の問題（無効な値、型エラー）        |
| `OperationalError`| データベースの運用上の問題（接続性、リソース）|
| `IntegrityError`  | 制約違反（外部キー、一意性）                  |
| `InternalError`   | データベース内部のエラーと破損                |
| `ProgrammingError` | SQL構文エラーとAPIの誤用                     |
| `NotSupportedError` | サポートされていない機能や操作               |

:::note
これらの例外クラスはPython DB API 2.0仕様に準拠しており、異なるデータベース操作で一貫したエラー処理を提供します。
:::

**関連情報**
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
#### **例外** `chdb.dbapi.err.DataError` {#chdb-dbapi-err-dataerror}

ベース: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

処理されたデータの問題によって引き起こされるエラーに対して発生する例外。

データベース操作が処理されるデータの問題によって失敗した場合に発生します。例えば：

- ゼロ除算操作
- 範囲外の数値
- 無効な日付/時刻値
- 文字列の切り捨てエラー
- 型変換の失敗
- カラムタイプに対する無効なデータ形式

**発生する例外**

| 例外                                          | 条件                          |
|------------------------------------------------|-------------------------------|
| [`DataError`](#chdb-dbapi-err-dataerror)      | データの検証または処理が失敗した場合 |

**例**

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
#### **例外** `chdb.dbapi.err.DatabaseError` {#chdb-dbapi-err-databaseerror}

ベース: [`Error`](#chdb-dbapi-err-error)

データベースに関連するエラーに対して発生する例外。

これはすべてのデータベース関連エラーのベースクラスです。データベース操作中に発生するすべてのエラー、インターフェイス自体ではなくデータベースに関連するエラーを網羅します。

一般的なシナリオには以下が含まれます：

- SQL実行エラー
- データベース接続の問題
- トランザクション関連の問題
- データベース固有の制約違反

:::note
これは、[`DataError`](#chdb-dbapi-err-dataerror)、[`OperationalError`](#chdb-dbapi-err-operationalerror)などのより具体的なデータベースエラータイプの親クラスとして機能します。
:::

---
#### **例外** `chdb.dbapi.err.Error` {#chdb-dbapi-err-error}

ベース: [`StandardError`](#chdb-dbapi-err-standarderror)

その他のエラー例外（Warningではない）の基底クラスの例外。

これは、警告を除くすべてのchdb関連のエラー例外のベースクラスです。
操作の成功完了を妨げるすべてのデータベースエラー条件の親クラスとして機能します。

:::note
この例外階層はPython DB API 2.0仕様に従っています。
:::

**関連情報**
- [`Warning`](#chdb-dbapi-err-warning) - 操作の完了を妨げない非致命的警告用

#### **例外** `chdb.dbapi.err.IntegrityError` {#chdb-dbapi-err-integrityerror}

ベース: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

データベースの関係の整合性が影響を受けた際に発生する例外。

この例外は、データベース操作が整合性制約に違反した場合に発生します。例えば：

- 外部キー制約違反
- 主キーまたは一意制約違反（重複キー）
- チェック制約違反
- NOT NULL制約違反
- 参照整合性の違反

**発生する例外**

| 例外                                              | 条件                                            |
|--------------------------------------------------|------------------------------------------------|
| [`IntegrityError`](#chdb-dbapi-err-integrityerror) | データベースの整合性制約が違反された場合 |

**例**

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
#### **例外** `chdb.dbapi.err.InterfaceError` {#chdb-dbapi-err-interfaceerror}

ベース: [`Error`](#chdb-dbapi-err-error)

データベース自体ではなく、データベースインターフェイスに関連するエラーに対して発生する例外。

この例外は、データベースインターフェイスの実装に問題がある場合に発生します。例えば：

- 無効な接続パラメータ
- APIの誤用（閉じた接続でメソッドを呼び出す）
- インターフェイスレベルのプロトコルエラー
- モジュールのインポートや初期化の失敗

**発生する例外**

| 例外                                              | 条件                                                             |
|--------------------------------------------------|------------------------------------------------------------------|
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror) | データベースインターフェイスがデータベース操作とは無関係なエラーに遭遇した場合 |

:::note
これらのエラーは通常、プログラミングエラーや設定の問題であり、クライアントコードや設定を修正することで解決できます。
:::

---
#### **例外** `chdb.dbapi.err.InternalError` {#chdb-dbapi-err-internalerror}

ベース: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

データベースが内部エラーに遭遇した際に発生する例外。

この例外は、アプリケーションによって引き起こされない内部エラーがデータベースシステムに発生したときに発生します。例えば：

- 無効なカーソル状態（カーソルがもはや有効でない）
- トランザクションの状態の不整合（トランザクションが同期していない）
- データベース破損の問題
- 内部データ構造の破損
- システムレベルのデータベースエラー

**発生する例外**

| 例外                                              | 条件                                               |
|--------------------------------------------------|---------------------------------------------------|
| [`InternalError`](#chdb-dbapi-err-internalerror) | データベースが内部の不整合に遭遇した場合         |

:::warning 警告
内部エラーは、データベース管理者の注意を必要とする深刻なデータベースの問題を示す可能性があります。これらのエラーは通常、アプリケーションレベルの再試行ロジックでは回復できません。
:::

:::note
これらのエラーは通常、アプリケーションの制御の外にあり、データベースの再起動または修復操作が必要な場合があります。
:::

---
#### **例外** `chdb.dbapi.err.NotSupportedError` {#chdb-dbapi-err-notsupportederror}

ベース: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

メソッドまたはデータベースAPIがサポートされていない際に発生する例外。

この例外は、アプリケーションが現在のデータベース構成またはバージョンでサポートされていないデータベース機能やAPIメソッドを使用しようとしたときに発生します。例えば：

- トランザクションサポートのない接続で `rollback()` を要求する
- 現在のデータベースバージョンでサポートされていない高度なSQL機能を使用する
- 現在のドライバーによって実装されていないメソッドを呼び出す
- 無効化されたデータベース機能を使用しようとする

**発生する例外**

| 例外                                                | 条件                                             |
|----------------------------------------------------|-------------------------------------------------|
| [`NotSupportedError`](#chdb-dbapi-err-notsupportederror) | サポートされていないデータベース機能にアクセスした場合 |

**例**

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
これらのエラーを避けるために、データベースドキュメントおよびドライバーの機能を確認してください。可能であれば優雅なフォールバックを検討してください。
:::

---
#### **例外** `chdb.dbapi.err.OperationalError` {#chdb-dbapi-err-operationalerror}

ベース: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

データベースの操作に関連するエラーに対して発生する例外。

この例外は、データベース操作中に発生し、必ずしもプログラマーの制御下にないエラーです。例えば：

- データベースからの予期しない切断
- データベースサーバーが見つからないまたは到達不可能
- トランザクション処理の失敗
- 処理中のメモリ割り当てエラー
- ディスクスペースまたはリソースの枯渇
- データベースサーバーの内部エラー
- 認証や承認の失敗

**発生する例外**

| 例外                                              | 条件                                               |
|--------------------------------------------------|---------------------------------------------------|
| [`OperationalError`](#chdb-dbapi-err-operationalerror) | 運用上の問題によりデータベース操作が失敗した場合 |

:::note
これらのエラーは通常一過性のものであり、操作を再試行するか、システムレベルの問題に対処することで解決される場合があります。
:::

:::warning 警告
一部の運用エラーは、管理者の介入を必要とする深刻なシステム問題を示す可能性があります。
:::

---
#### **例外** `chdb.dbapi.err.ProgrammingError` {#chdb-dbapi-err-programmingerror}

ベース: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

データベース操作におけるプログラミングエラーに対して発生する例外。

この例外は、アプリケーションのデータベース使用におけるプログラミングエラーがある場合に発生します。例えば：

- テーブルやカラムが見つからない
- 作成時にテーブルやインデックスがすでに存在する
- ステートメントのSQL構文エラー
- 準備されたステートメントで指定されたパラメータの数が不正
- 無効なSQL操作（非存在オブジェクトへのDROPなど）
- データベースAPIメソッドの誤った使用

**発生する例外**

| 例外                                              | 条件                                          |
|--------------------------------------------------|-----------------------------------------------|
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | SQLステートメントやAPIの使用にエラーが含まれている場合 |

**例**

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
#### **例外** `chdb.dbapi.err.StandardError` {#chdb-dbapi-err-standarderror}

ベース: `Exception`

chdbとの操作に関連する例外。

これは、すべてのchdb関連の例外のベースクラスです。Pythonの組み込みExceptionクラスを拡張し、データベース操作の例外階層のルートとして機能します。

:::note
この例外クラスは、データベース例外処理のためのPython DB API 2.0仕様に従います。
:::

---
#### **例外** `chdb.dbapi.err.Warning` {#chdb-dbapi-err-warning}

ベース: [`StandardError`](#chdb-dbapi-err-standarderror)

挿入中のデータ切り捨てなど、重要な警告に対して発生する例外。

この例外は、データベース操作が完了したが、アプリケーションに注意を促すべき重要な警告がある場合に発生します。
一般的なシナリオには以下が含まれます：

- 挿入時のデータ切り捨て
- 数値変換における精度の損失
- 文字セット変換の警告

:::note
これは、警告例外のためのPython DB API 2.0仕様に従います。
:::

---
### モジュール定数 {#module-constants}
#### `chdb.dbapi.apilevel = '2.0'` {#apilevel}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

指定されたオブジェクトから新しい文字列オブジェクトを作成します。エンコーディングやエラーが指定されている場合、オブジェクトは指定されたエンコーディングとエラーハンドラーを使用してデコードされるデータバッファを持っている必要があります。
それ以外の場合、`object._\_str_\_()`（定義されていれば）または`repr(object)`の結果を返します。

- エンコーディングはデフォルトで‘utf-8’です。
- エラーはデフォルトで‘strict’です。

---
#### `chdb.dbapi.threadsafety = 1` {#threadsafety}

```python
int([x]) -> integer
int(x, base=10) -> integer
```

数または文字列を整数に変換するか、引数が与えられない場合は0を返します。xが数値である場合、x._\_int_\_()を返します。浮動小数点数の場合、これはゼロに向かって切り捨てます。

xが数字でない場合、または基数が与えられている場合、xは指定された基数における整数リテラルを表す文字列、バイト、またはバイト配列のインスタンスである必要があります。リテラルは‘+’または‘-’で先行することができ、空白に囲まれることができます。基数はデフォルトで10です。基数として0は、文字列から整数リテラルとして基数を解釈することを意味します。

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

指定されたオブジェクトから新しい文字列オブジェクトを作成します。エンコーディングやエラーが指定されている場合、そのオブジェクトは指定されたエンコーディングとエラーハンドラーを使用してデコードされるデータバッファを持っている必要があります。
それ以外の場合は、`object._\_str_\_()`（定義されていれば）または`repr(object)`の結果を返します。
エンコーディングはデフォルトで‘utf-8’です。
エラーはデフォルトで‘strict’です。

---
### 型定数 {#type-constants}
#### `chdb.dbapi.STRING = frozenset({247, 253, 254})` {#string-type}

DB-API 2.0型比較のための拡張されたfrozenset。

このクラスは、DB-API 2.0の型比較セマンティクスをサポートするためにfrozensetを拡張します。
それは、個別のアイテムを集合に対して等式と不等式の両方の演算子を使用して比較できる柔軟な型チェックを可能にします。

これは、STRING、BINARY、NUMBERなどの型定数に使用され、`field_type == STRING`のような比較を可能にします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.BINARY = frozenset({249, 250, 251, 252})` {#binary-type}

DB-API 2.0型比較のための拡張されたfrozenset。

このクラスは、DB-API 2.0の型比較セマンティクスをサポートするためにfrozensetを拡張します。
それは、個別のアイテムを集合に対して等式と不等式の両方の演算子を使用して比較できる柔軟な型チェックを可能にします。

これは、STRING、BINARY、NUMBERなどの型定数に使用され、`field_type == STRING`のような比較を可能にします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.NUMBER = frozenset({0, 1, 3, 4, 5, 8, 9, 13})` {#number-type}

DB-API 2.0型比較のための拡張されたfrozenset。

このクラスは、DB-API 2.0の型比較セマンティクスをサポートするためにfrozensetを拡張します。
それは、個別のアイテムを集合に対して等式と不等式の両方の演算子を使用して比較できる柔軟な型チェックを可能にします。

これは、STRING、BINARY、NUMBERなどの型定数に使用され、`field_type == STRING`のような比較を可能にします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.DATE = frozenset({10, 14})` {#date-type}

DB-API 2.0型比較のための拡張されたfrozenset。

このクラスは、DB-API 2.0の型比較セマンティクスをサポートするためにfrozensetを拡張します。
それは、個別のアイテムを集合に対して等式と不等式の両方の演算子を使用して比較できる柔軟な型チェックを可能にします。

これは、STRING、BINARY、NUMBERなどの型定数に使用され、`field_type == STRING`のような比較を可能にします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.TIME = frozenset({11})` {#time-type}

DB-API 2.0型比較のための拡張されたfrozenset。

このクラスは、DB-API 2.0の型比較セマンティクスをサポートするためにfrozensetを拡張します。
それは、個別のアイテムを集合に対して等式と不等式の両方の演算子を使用して比較できる柔軟な型チェックを可能にします。

これは、STRING、BINARY、NUMBERなどの型定数に使用され、`field_type == STRING`のような比較を可能にします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.TIMESTAMP = frozenset({7, 12})` {#timestamp-type}

DB-API 2.0型比較のための拡張されたfrozenset。

このクラスは、DB-API 2.0の型比較セマンティクスをサポートするためにfrozensetを拡張します。
それは、個別のアイテムを集合に対して等式と不等式の両方の演算子を使用して比較できる柔軟な型チェックを可能にします。

これは、STRING、BINARY、NUMBERなどの型定数に使用され、`field_type == STRING`のような比較を可能にします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```
#### `chdb.dbapi.DATETIME = frozenset({7, 12})` {#datetime-type}

DB-API 2.0型比較のための拡張されたfrozenset。

このクラスは、DB-API 2.0の型比較セマンティクスをサポートするためにfrozensetを拡張します。
それは、個別のアイテムを集合に対して等式と不等式の両方の演算子を使用して比較できる柔軟な型チェックを可能にします。

これは、STRING、BINARY、NUMBERなどの型定数に使用され、`field_type == STRING`のような比較を可能にします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

---
#### `chdb.dbapi.ROWID = frozenset({})` {#rowid-type}

DB-API 2.0型比較のための拡張されたfrozenset。

このクラスは、DB-API 2.0の型比較セマンティクスをサポートするためにfrozensetを拡張します。
それは、個別のアイテムを集合に対して等式と不等式の両方の演算子を使用して比較できる柔軟な型チェックを可能にします。

これは、STRING、BINARY、NUMBERなどの型定数に使用され、`field_type == STRING`のような比較を可能にします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

**使用例**

基本的なクエリ例：

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

データを扱う：

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

接続管理：

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

**ベストプラクティス**

1. **接続管理**: 作業が完了したら、常に接続とカーソルを閉じる
2. **コンテキストマネージャ**: 自動クリーンアップのために`with`ステートメントを使用
3. **バッチ処理**: 大きな結果セットには`fetchmany()`を使用
4. **エラーハンドリング**: データベース操作をtry-exceptブロックでラップ
5. **パラメータバインディング**: 可能な限りパラメータ化されたクエリを使用
6. **メモリ管理**: 非常に大きなデータセットに対して`fetchall()`を避ける

:::note
- chDBのDB-API 2.0インターフェイスはほとんどのPythonデータベースツールと互換性があります
- インターフェイスはレベル1のスレッドセーフ性を提供します（スレッドはモジュールを共有できますが、接続はできません）
- 接続文字列は、chDBセッションと同じパラメータをサポートします
- すべての標準DB-API 2.0例外がサポートされています
:::

:::warning 警告
- リソースのリークを避けるために、常にカーソルと接続を閉じる
- 大きな結果セットはバッチで処理する必要があります
- パラメータバインディングシンタックスはフォーマットスタイルに従います: `%s`
:::
## ユーザー定義関数 (UDF) {#user-defined-functions}

chDBのユーザー定義関数モジュール。

このモジュールは、chDBでのユーザー定義関数（UDF）の作成と管理のための機能を提供します。
標準SQLクエリから呼び出せるカスタムPython関数を書くことで、chDBの機能を拡張することができます。
### `chdb.udf.chdb_udf` {#chdb-udf}

chDB Python UDF（ユーザー定義関数）用のデコレーター。

**構文**

```python
chdb.udf.chdb_udf(return_type='String')
```

**パラメータ**

| パラメータ     | 型    | デフォルト      | 説明                                                           |
|----------------|-------|------------------|-----------------------------------------------------------------|
| `return_type`  | str   | `"String"`       | 関数の戻り値の型。ClickHouseのデータ型のいずれかである必要があります |

**注意事項**

1. 関数は無状態であるべきです。UDFのみがサポートされており、UDAFはサポートされていません。
2. デフォルトの戻り値の型はStringです。戻り値の型はClickHouseのデータ型のいずれかである必要があります。
3. 関数はString型の引数を受け取るべきです。すべての引数が文字列です。
4. 関数は各入力行のために呼び出されます。
5. 関数は純粋なPython関数であるべきです。関数内で使用されるすべてのモジュールをインポートしてください。
6. 使用するPythonインタープリターは、スクリプトを実行するために使用されるものと同じです。

**例**

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

UDF構成と実行可能スクリプトファイルを生成します。

この関数は、chDBでのユーザー定義関数（UDF）のための必要なファイルを作成します：
1. 入力データを処理するPython実行可能スクリプト
2. UDFをClickHouseに登録するためのXML構成ファイル

**構文**

```python
chdb.udf.generate_udf(func_name, args, return_type, udf_body)
```

**パラメータ**

| パラメータ     | 型    | 説明                                               |
|----------------|-------|----------------------------------------------------|
| `func_name`    | str   | UDF関数の名前                                     |
| `args`         | list  | 関数のための引数名のリスト                        |
| `return_type`  | str   | 関数のClickHouseの戻り値型                         |
| `udf_body`     | str   | UDF関数のPythonソースコード本体                   |

:::note
この関数は通常@chdb_udfデコレーターによって呼び出され、ユーザーが直接呼び出すべきではありません。
:::

---
## ユーティリティ {#utilities}

chDBのためのユーティリティ関数とヘルパー。

このモジュールは、データ型推論、データ変換ヘルパー、およびデバッグユーティリティを含む、chDBを操作するためのさまざまなユーティリティ関数を含んでいます。

---
### `chdb.utils.convert_to_columnar` {#convert-to-columnar}

辞書のリストを列指向形式に変換します。

この関数は、辞書のリストを受け取り、それを各キーがカラムに対応し、各値がカラム値のリストになる辞書に変換します。
辞書に欠けている値はNoneとして表現されます。

**構文**

```python
chdb.utils.convert_to_columnar(items: List[Dict[str, Any]]) → Dict[str, List[Any]]
```

**パラメータ**

| パラメータ  | 型                       | 説明                         |
|-------------|--------------------------|------------------------------|
| `items`     | `List[Dict[str, Any]]`   | 変換する辞書のリスト         |

**戻り値**

| 戻り値の型               | 説明                                                                     |
|--------------------------|-------------------------------------------------------------------------|
| `Dict[str, List[Any]]`   | キーがカラム名、値がカラム値のリストである辞書                        |

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
### `chdb.utils.flatten_dict` {#flatten-dict}

ネストされた辞書をフラット化します。

この関数はネストされた辞書を受け取り、それをフラット化し、ネストされたキーをセパレータで連結します。辞書のリストはJSON文字列にシリアライズされます。

**構文**

```python
chdb.utils.flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '_') → Dict[str, Any]
```

**パラメータ**

| パラメータ    | 型               | デフォルト    | 説明                                    |
|--------------|------------------|------------|----------------------------------------|
| `d`          | `Dict[str, Any]` | *必須*     | フラット化する辞書                      |
| `parent_key` | str              | `""`       | 各キーに追加するベースキー              |
| `sep`        | str              | `"_"`      | 連結されたキーの間に使用するセパレータ |

**返り値**

| 返り値の型        | 説明                              |
|------------------|----------------------------------|
| `Dict[str, Any]` | フラット化された辞書              |

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

値のリストに対して最も適切なデータ型を推測します。

この関数は値のリストを調べ、リスト内のすべての値を表すことができる最も適切なデータ型を決定します。整数、符号なし整数、小数、浮動小数点型を考慮し、数値型として表現できない場合や、すべての値がNoneの場合は「string」にデフォルト設定されます。

**構文**

```python
chdb.utils.infer_data_type(values: List[Any]) → str
```

**パラメータ**

| パラメータ  | 型        | 説明                                                |
|------------|-------------|-----------------------------------------------------|
| `values`   | `List[Any]` | 分析する値のリスト。値は任意の型である可能性があります |

**返り値**

| 返り値の型 | 説明                                                                                                                                                                                                                                                    |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `str`       | 推測されたデータ型を表す文字列。返される可能性のある値は「int8」、「int16」、「int32」、「int64」、「int128」、「int256」、「uint8」、「uint16」、「uint32」、「uint64」、「uint128」、「uint256」、「decimal128」、「decimal256」、「float32」、「float64」、または「string」です。 | 

:::note
- リスト内のすべての値がNoneの場合、関数は「string」を返します。
- リスト内の任意の値が文字列である場合、関数は即座に「string」を返します。
- 関数は数値が整数、小数、または浮動小数点として表現可能であると仮定しています。
:::

---
### `chdb.utils.infer_data_types` {#infer-data-types}

列指向データ構造内の各列に対してデータ型を推測します。

この関数は各列の値を分析し、データのサンプルに基づいて各列に最も適切なデータ型を推測します。

**構文**

```python
chdb.utils.infer_data_types`(column_data: Dict[str, List[Any]], n_rows: int = 10000) → List[tuple]
```

**パラメータ**

| パラメータ     | 型                   | デフォルト    | 説明                                                                   |
|---------------|------------------------|------------|-----------------------------------------------------------------------|
| `column_data` | `Dict[str, List[Any]]` | *必須*     | キーが列名、値が列の値のリストである辞書                           |
| `n_rows`      | int                    | `10000`    | データ型推測のためにサンプリングする行数                           |

**返り値**

| 返り値の型   | 説明                                                          |
|---------------|-------------------------------------------------------------|
| `List[tuple]` | 各列の名前と推測されたデータ型を含むタプルのリスト |

## Abstract Base Classes {#abstract-base-classes}
### **class** `chdb.rwabc.PyReader`(data: Any)` {#pyreader}

基底クラス: `ABC`

```python
class chdb.rwabc.PyReader(data: Any)
```

---
#### **abstractmethod** `read` {#read}

指定した列から指定された行数を読み取り、各オブジェクトが列の値のシーケンスであるオブジェクトのリストを返します。

```python
abstractmethod (col_names: List[str], count: int) → List[Any]
```

**パラメータ**

| パラメータ   | 型        | 説明                                   |
|-------------|-------------|--------------------------------------|
| `col_names` | `List[str]` | 読み取る列名のリスト                  |
| `count`     | int         | 読み取る最大行数                       |

**返り値**

| 返り値の型  | 説明                                     |
|--------------|-----------------------------------------|
| `List[Any]`  | 各列のシーケンスのリスト                 |

### **class** `chdb.rwabc.PyWriter` {#pywriter}

基底クラス: `ABC`

```python
class chdb.rwabc.PyWriter(col_names: List[str], types: List[type], data: Any)
```

---
#### **abstractmethod** finalize {#finalize}

ブロックから最終データを組み立てて返します。サブクラスで実装される必要があります。

```python
abstractmethod finalize() → bytes
```

**返り値**

| 返り値の型  | 説明                                |
|--------------|-------------------------------------|
| `bytes`      | 最終的にシリアライズされたデータ    |

---
#### **abstractmethod** `write` {#write}

データのカラムをブロックに保存します。サブクラスで実装される必要があります。

```python
abstractmethod write(col_names: List[str], columns: List[List[Any]]) → None
```

**パラメータ**

| パラメータ   | 型              | 説明                                                |
|-------------|-------------------|-----------------------------------------------------|
| `col_names` | `List[str]`       | 書き込むカラム名のリスト                             |
| `columns`   | `List[List[Any]]` | 各カラムをリストで表現したカラムデータのリスト       |

## Exception Handling {#exception-handling}
### **class** `chdb.ChdbError` {#chdberror}

基底クラス: `Exception`

chDB関連のエラーのための基本例外クラス。

この例外は、chDBクエリの実行が失敗したりエラーに遭遇したときに発生します。標準のPythonの例外クラスから継承し、基盤となるClickHouseエンジンからのエラー情報を提供します。

例外メッセージには、通常、ClickHouseからの詳細なエラー情報が含まれ、文法エラー、型不一致、テーブル/カラムの欠落、その他のクエリ実行の問題が含まれます。

**変数**

| 変数      | 型  | 説明                                                |
|-----------|-------|-----------------------------------------------------|
| `args`    | -     | エラーメッセージと追加の引数を含むタプル             |

**例**

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
この例外は、基礎となるClickHouseエンジンがエラーを報告したときにchdb.query()および関連関数によって自動的に発生します。潜在的に失敗するクエリを処理する際は、この例外をキャッチして、アプリケーションで適切なエラーハンドリングを提供してください。
:::

## Version Information {#version-information}
### `chdb.chdb_version = ('3', '6', '0')` {#chdb-version}

ビルトインの不変シーケンス。

引数が指定されない場合、コンストラクタは空のタプルを返します。イテラブルが指定されると、タプルはそのアイテムから初期化されます。

引数がタプルの場合、返り値は同じオブジェクトです。

---
### `chdb.engine_version = '25.5.2.1'` {#engine-version}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

与えられたオブジェクトから新しい文字列オブジェクトを作成します。エンコーディングまたはエラーが指定された場合、オブジェクトは与えられたエンコーディングおよびエラーハンドラを使用してデコードされるデータバッファを公開する必要があります。そうでない場合は、object._\_str_\_()（定義されている場合）またはrepr(object)の結果を返します。

- エンコーディングのデフォルトは「utf-8」です。
- エラーのデフォルトは「strict」です。

---
### `chdb.__version__ = '3.6.0'` {#version}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

与えられたオブジェクトから新しい文字列オブジェクトを作成します。エンコーディングまたはエラーが指定された場合、オブジェクトは与えられたエンコーディングおよびエラーハンドラを使用してデコードされるデータバッファを公開する必要があります。そうでない場合は、object._\_str_\_()（定義されている場合）またはrepr(object)の結果を返します。

- エンコーディングのデフォルトは「utf-8」です。
- エラーのデフォルトは「strict」です。
