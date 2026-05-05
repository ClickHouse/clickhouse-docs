---
title: 'chDB Python API リファレンス'
sidebar_label: 'Python API'
slug: /chdb/api/python
description: 'chDB 向け Python API の完全なリファレンス'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'api', 'reference']
doc_type: 'reference'
---

# Python API リファレンス \{#python-api-reference\}

## コアクエリ関数 \{#core-query-functions\}

### `chdb.query` \{#chdb-query\}

chDB エンジンを使用して SQL クエリを実行します。

これは、組み込みの ClickHouse エンジンを使用して SQL 文を実行する
メインのクエリ関数です。さまざまな出力形式をサポートし、インメモリ
データベースおよびファイルベースデータベースの両方で動作します。

**構文**

```python
chdb.query(sql, output_format='CSV', path='', udf_path='')
```

**パラメータ**

| パラメータ           | 型   | デフォルト      | 説明                                                                                                                                                                                                                                                 |
| --------------- | --- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`           | str | *required* | 実行する SQL クエリ文字列                                                                                                                                                                                                                                    |
| `output_format` | str | `"CSV"`    | 結果の出力形式。サポートされる形式:<br />• `"CSV"` - カンマ区切り値<br />• `"JSON"` - JSON 形式<br />• `"Arrow"` - Apache Arrow 形式<br />• `"Parquet"` - Parquet 形式<br />• `"DataFrame"` - Pandas DataFrame<br />• `"ArrowTable"` - PyArrow Table<br />• `"Debug"` - 詳細ログを有効化 |
| `path`          | str | `""`       | データベースファイルのパス。デフォルトはインメモリデータベースです。<br />ファイルパス、またはインメモリデータベース用の `":memory:"` を指定できます                                                                                                                                                               |
| `udf_path`      | str | `""`       | ユーザー定義関数 (UDF) ディレクトリへのパス                                                                                                                                                                                                                          |

**戻り値**

指定された形式でクエリ結果を返します:

| Return Type        | Condition                                               |
| ------------------ | ------------------------------------------------------- |
| `str`              | CSV や JSON などのテキスト形式の場合                                 |
| `pd.DataFrame`     | `output_format` が `"DataFrame"` または `"dataframe"` の場合   |
| `pa.Table`         | `output_format` が `"ArrowTable"` または `"arrowtable"` の場合 |
| chdb result object | 上記以外の形式の場合                                              |

**例外**

| Exception     | Condition                              |
| ------------- | -------------------------------------- |
| `ChdbError`   | SQL クエリの実行に失敗した場合                      |
| `ImportError` | DataFrame／Arrow 形式に必要な依存関係が不足している場合に発生 |

**使用例**

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

chDB エンジンを使用して SQL クエリを実行します。

これは、組み込みの ClickHouse エンジンを使用して SQL 文を実行する
主要なクエリ関数です。さまざまな出力形式をサポートし、インメモリおよび
ファイルベースのデータベースのどちらでも動作します。

**構文**

```python
chdb.sql(sql, output_format='CSV', path='', udf_path='')
```

**パラメータ**

| Parameter       | Type | Default    | Description                                                                                                                                                                                                                                           |
| --------------- | ---- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`           | str  | *required* | 実行する SQL クエリ文字列                                                                                                                                                                                                                                       |
| `output_format` | str  | `"CSV"`    | 結果の出力形式。サポートされる形式:<br />• `"CSV"` - カンマ区切り値<br />• `"JSON"` - JSON 形式<br />• `"Arrow"` - Apache Arrow 形式<br />• `"Parquet"` - Parquet 形式<br />• `"DataFrame"` - Pandas DataFrame<br />• `"ArrowTable"` - PyArrow Table<br />• `"Debug"` - 冗長なログ出力を有効化 |
| `path`          | str  | `""`       | データベースファイルのパス。デフォルトはインメモリデータベース。<br />ファイルパス、またはインメモリデータベース用の `":memory:"` を指定可能                                                                                                                                                                      |
| `udf_path`      | str  | `""`       | ユーザー定義関数 (User-Defined Functions) 用ディレクトリへのパス                                                                                                                                                                                                         |

**戻り値**

指定された形式でクエリ結果を返します:

| Return Type        | Condition                                               |
| ------------------ | ------------------------------------------------------- |
| `str`              | CSV や JSON などのテキスト形式の場合                                 |
| `pd.DataFrame`     | `output_format` が `"DataFrame"` または `"dataframe"` の場合   |
| `pa.Table`         | `output_format` が `"ArrowTable"` または `"arrowtable"` の場合 |
| chdb result object | 上記以外の形式の場合                                              |

**例外**

| Exception                 | Condition                              |
| ------------------------- | -------------------------------------- |
| [`ChdbError`](#chdberror) | SQL クエリの実行に失敗した場合                      |
| `ImportError`             | DataFrame／Arrow 形式に必要な依存関係が不足している場合に発生 |

**使用例**

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

クエリ結果を PyArrow Table に変換します。

chDB のクエリ結果を、効率的な列指向データ処理のために PyArrow Table に変換します。
結果が空の場合は空のテーブルを返します。

**構文**

```python
chdb.to_arrowTable(res)
```

**パラメーター**

| Parameter | Description                           |
| --------- | ------------------------------------- |
| `res`     | バイナリ形式の Arrow データを含む chDB クエリ結果オブジェクト |

**戻り値**

| Return type | Description                     |
| ----------- | ------------------------------- |
| `pa.Table`  | クエリ結果を含む PyArrow の Table オブジェクト |

**送出される例外**

| Error type    | Description                              |
| ------------- | ---------------------------------------- |
| `ImportError` | pyarrow または pandas がインストールされていない場合に送出される |

**使用例**

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> table = chdb.to_arrowTable(result)
>>> print(table.to_pandas())
   id    msg
0   1  hello
```

***


### `chdb.to_df` \{#chdb_to_df\}

クエリ結果を pandas の DataFrame に変換します。

chDB のクエリ結果を、まず PyArrow の Table に変換し、その後マルチスレッディングを用いて pandas に変換することで、より高い性能を実現します。

**構文**

```python
chdb.to_df(r)
```

**パラメータ**

| パラメータ | 説明                                    |
| ----- | ------------------------------------- |
| `r`   | バイナリ形式の Arrow データを含む chDB クエリ結果オブジェクト |

**戻り値**

| 戻り値の型          | 説明                          |
| -------------- | --------------------------- |
| `pd.DataFrame` | クエリ結果を含む pandas の DataFrame |

**送出される例外**

| 例外            | 条件                                 |
| ------------- | ---------------------------------- |
| `ImportError` | pyarrow または pandas がインストールされていない場合 |

**例**

```pycon
>>> result = chdb.query("SELECT 1 as id, 'hello' as msg", "Arrow")
>>> df = chdb.to_df(result)
>>> print(df)
   id    msg
0   1  hello
```


## 接続とセッション管理 \{#connection-session-management\}

利用可能なセッション関数は以下のとおりです。

### `chdb.connect` \{#chdb-connect\}

chDB のバックグラウンドサーバーへの接続を作成します。

この関数は chDB (ClickHouse) データベースエンジンへの[接続](#chdb-state-sqlitelike-connection)を確立します。
1 プロセスあたり開いておける接続は 1 つだけです。
同じ接続文字列で複数回呼び出した場合は、同一の接続オブジェクトが返されます。

```python
chdb.connect(connection_string: str = ':memory:') → Connection
```

**パラメーター:**

| Parameter           | Type | Default      | Description                        |
| ------------------- | ---- | ------------ | ---------------------------------- |
| `connection_string` | str  | `":memory:"` | データベース接続文字列。フォーマットの詳細は以下を参照してください。 |

**基本フォーマット**

| Format                    | Description          |
| ------------------------- | -------------------- |
| `":memory:"`              | インメモリのデータベース (デフォルト) |
| `"test.db"`               | 相対パスのデータベースファイル      |
| `"file:test.db"`          | 相対パス指定と同じ            |
| `"/path/to/test.db"`      | 絶対パスのデータベースファイル      |
| `"file:/path/to/test.db"` | 絶対パス指定と同じ            |

**クエリパラメーター付き**

| Format                                             | Description         |
| -------------------------------------------------- | ------------------- |
| `"file:test.db?param1=value1&param2=value2"`       | パラメーター付きの相対パス       |
| `"file::memory:?verbose&log-level=test"`           | パラメーター付きインメモリデータベース |
| `"///path/to/test.db?param1=value1&param2=value2"` | パラメーター付きの絶対パス       |

**クエリパラメーターの扱い**

クエリパラメーターは、ClickHouse エンジンに起動時引数として渡されます。
特別なパラメーターの処理:

| Special Parameter | Becomes        | Description |
| ----------------- | -------------- | ----------- |
| `mode=ro`         | `--readonly=1` | 読み取り専用モード   |
| `verbose`         | (flag)         | 詳細ログを有効にする  |
| `log-level=test`  | (setting)      | ログレベルを設定する  |

パラメーターの完全な一覧については、`clickhouse local --help --verbose` を参照してください。

**戻り値**

| Return Type  | Description                                                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Connection` | 次をサポートするデータベース接続オブジェクト:<br />• `Connection.cursor()` によるカーソルの作成<br />• `Connection.query()` による直接クエリ実行<br />• `Connection.send_query()` によるストリーミングクエリ実行<br />• 自動クリーンアップのためのコンテキストマネージャープロトコル |

**送出される例外**

| Exception      | Condition       |
| -------------- | --------------- |
| `RuntimeError` | データベース接続に失敗した場合 |

:::warning
1 プロセスあたりサポートされる接続数は 1 つのみです。
新しい接続を作成すると、既存の接続はクローズされます。
:::

**使用例**

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

**関連項目**

* [`Connection`](#chdb-state-sqlitelike-connection) - データベース接続クラス
* [`Cursor`](#chdb-state-sqlitelike-cursor) - DB-API 2.0 の操作用データベースカーソル


## 例外処理 \{#chdb-exceptions\}

### **class** `chdb.ChdbError` \{#chdb_chdbError\}

基底クラス: `Exception`

chDB 関連のエラーに対する基底例外クラスです。

この例外は、chDB のクエリ実行が失敗した場合やエラーが発生した場合にスローされます。標準の Python の Exception クラスを継承しており、基盤となる ClickHouse エンジンからのエラー情報を提供します。

---

### **class** `chdb.session.Session` \{#chdb_session_session\}

基底クラス: `object`

Session はクエリの状態を保持します。
`path` が None の場合は一時ディレクトリを作成してデータベースパスとして使用し、
セッションがクローズされるとその一時ディレクトリは削除されます。
データを永続的に保持するデータベースを作成するためのパスを指定して渡すこともできます。

パスおよびその他のパラメータを渡すために、接続文字列を使用することもできます。

```python
class chdb.session.Session(path=None)
```

**例**

| Connection String                                  | 説明                    |
| -------------------------------------------------- | --------------------- |
| `":memory:"`                                       | インメモリデータベース           |
| `"test.db"`                                        | 相対パス                  |
| `"file:test.db"`                                   | 上と同じ                  |
| `"/path/to/test.db"`                               | 絶対パス                  |
| `"file:/path/to/test.db"`                          | 上と同じ                  |
| `"file:test.db?param1=value1&param2=value2"`       | クエリパラメータ付き相対パス        |
| `"file::memory:?verbose&log-level=test"`           | クエリパラメータ付きインメモリデータベース |
| `"///path/to/test.db?param1=value1&param2=value2"` | クエリパラメータ付き絶対パス        |

:::note Connection string args handling
“[file:test.db?param1=value1&amp;param2=value2](file:test.db?param1=value1\&param2=value2)” のようにクエリパラメータを含む接続文字列では、
“param1=value1” は起動引数として ClickHouse エンジンに渡されます。

詳細については `clickhouse local –help –verbose` を参照してください。

一部の引数の特別な扱い:

* “mode=ro” は ClickHouse に対して “–readonly=1”（read-only mode）として扱われます
  :::

:::warning Important

* 同時に保持できるセッションは 1 つだけです。新しいセッションを作成する場合は、既存のセッションをクローズする必要があります。
* 新しいセッションを作成すると、既存のセッションはクローズされます。
  :::

***


#### `cleanup` \{#cleanup\}

例外処理付きでセッションリソースをクリーンアップします。

このメソッドは、クリーンアップ処理中に発生する可能性のある例外を抑制しつつ
セッションをクローズしようとします。特にエラーハンドリングの場面や、
セッションの状態に関わらず確実にクリーンアップを実行したい場合に有用です。

**構文**

```python
cleanup()
```

:::note
このメソッドは決して例外を発生させないため、`finally` ブロックやデストラクタ内で安全に呼び出すことができます。
:::

**使用例**

```pycon
>>> session = Session("test.db")
>>> try:
...     session.query("INVALID SQL")
... finally:
...     session.cleanup()  # Safe cleanup regardless of errors
```

**関連項目**

* [`close()`](#chdb-session-session-close) - エラー伝播を行う明示的なセッションのクローズ

***


#### `close` \{#close\}

セッションをクローズし、リソースをクリーンアップします。

このメソッドは内部の接続を閉じ、グローバルなセッション状態をリセットします。
このメソッドを呼び出した後は、セッションは無効となり、
以降のクエリには使用できません。

**構文**

```python
close()
```

:::note
このメソッドは、セッションがコンテキストマネージャーとして使用されたとき、
またはセッションオブジェクトが破棄されたときに自動的に呼び出されます。
:::

:::warning 重要
`close()` を呼び出した後にセッションを使用しようとすると、エラーが発生します。
:::

**使用例**

```pycon
>>> session = Session("test.db")
>>> session.query("SELECT 1")
>>> session.close()  # Explicitly close the session
```

***


#### `query` \{#chdb-session-session-query\}

SQL クエリを実行し、その結果を返します。

このメソッドは、セッションが接続しているデータベースに対して SQL クエリを実行し、
指定された形式で結果を返します。さまざまな出力形式をサポートし、
クエリ間でセッション状態を維持します。

**構文**

```python
query(sql, fmt='CSV', udf_path='')
```

**パラメータ**

| パラメータ      | 型   | デフォルト      | 説明                                                                                                                                                                                                                                              |
| ---------- | --- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`      | str | *required* | 実行する SQL クエリ文字列                                                                                                                                                                                                                                 |
| `fmt`      | str | `"CSV"`    | 結果の出力形式。利用可能な形式:<br />• `"CSV"` - カンマ区切り値<br />• `"JSON"` - JSON 形式<br />• `"TabSeparated"` - タブ区切り値<br />• `"Pretty"` - 整形済みのテーブル形式<br />• `"JSONCompact"` - コンパクトな JSON 形式<br />• `"Arrow"` - Apache Arrow 形式<br />• `"Parquet"` - Parquet 形式 |
| `udf_path` | str | `""`       | ユーザー定義関数へのパス。指定しない場合、セッション初期化時に設定された UDF パスが使用されます                                                                                                                                                                                              |

**戻り値**

指定された形式でクエリ結果を返します。
正確な戻り値の型は `fmt` パラメータに依存します:

* 文字列形式 (CSV, JSON など) は `str` を返します
* バイナリ形式 (Arrow, Parquet) は `bytes` を返します

**送出される例外**

| 例外             | 条件                    |
| -------------- | --------------------- |
| `RuntimeError` | セッションがクローズされているか不正な場合 |
| `ValueError`   | SQL クエリが不正な構文の場合      |

:::note
「Debug」形式はサポートされておらず、警告付きで自動的に
「CSV」に変換されます。
デバッグには、代わりに接続文字列パラメータを使用してください。
:::

:::warning Warning
このメソッドはクエリを同期的に実行し、すべての結果をメモリに
読み込みます。結果セットが大きい場合は、ストリーミングで結果を取得するために [`send_query()`](#chdb-session-session-send_query) の使用を検討してください。
:::

**使用例**

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

**関連項目**

* [`send_query()`](#chdb-session-session-send_query) - クエリをストリーミング実行するため
* [`sql`](#chdb-session-session-sql) - このメソッドのエイリアス

***


#### `send_query` \{#chdb-session-session-send_query\}

SQL クエリを実行し、ストリーミング結果イテレータを返します。

このメソッドは、セッションが接続しているデータベースに対して SQL クエリを実行し、
結果を一度にすべてメモリに読み込むことなく反復処理できるストリーミング結果オブジェクトを返します。
これは特に、結果セットが大きい場合に有用です。

**構文**

```python
send_query(sql, fmt='CSV') → StreamingResult
```

**パラメータ**

| Parameter | Type | Default    | Description                                                                                                                                                                                                    |
| --------- | ---- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`     | str  | *required* | 実行する SQL クエリ文字列                                                                                                                                                                                                |
| `fmt`     | str  | `"CSV"`    | 結果の出力形式。利用可能な形式:<br />• `"CSV"` - カンマ区切り値<br />• `"JSON"` - JSON 形式<br />• `"TabSeparated"` - タブ区切り値<br />• `"JSONCompact"` - コンパクト JSON 形式<br />• `"Arrow"` - Apache Arrow 形式<br />• `"Parquet"` - Parquet 形式 |

**戻り値**

| Return Type       | Description                                                    |
| ----------------- | -------------------------------------------------------------- |
| `StreamingResult` | クエリ結果を逐次的に返すストリーミング結果イテレータ。`for` ループで使用したり、他のデータ構造に変換して利用できます。 |

**送出される例外**

| Exception      | Condition                |
| -------------- | ------------------------ |
| `RuntimeError` | セッションがクローズされている、または無効な場合 |
| `ValueError`   | SQL クエリが不正な形式の場合         |

:::note
“Debug” フォーマットはサポートされておらず、警告付きで自動的に “CSV” に変換されます。デバッグを行う場合は、代わりに接続文字列パラメータを使用してください。
:::

:::warning
返される `StreamingResult` オブジェクトはデータベースへの接続を保持するため、速やかに消費するか、適切な方法で保存して扱ってください。
:::

**使用例**

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

**関連項目**

* [`query()`](#chdb-session-session-query) - 非ストリーミングのクエリ実行用
* `chdb.state.sqlitelike.StreamingResult` - ストリーミング結果イテレータ

***


#### `sql` \{#chdb-session-session-sql\}

SQL クエリを実行し、結果を返します。

このメソッドは、セッションのデータベースに対して SQL クエリを実行し、
指定された形式で結果を返します。さまざまな出力形式をサポートし、
クエリ間でセッション状態を保持します。

**構文**

```python
sql(sql, fmt='CSV', udf_path='')
```

**パラメータ**

| Parameter  | Type | Default    | Description                                                                                                                                                                                                                                           |
| ---------- | ---- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql`      | str  | *required* | 実行する SQL クエリ文字列                                                                                                                                                                                                                                       |
| `fmt`      | str  | `"CSV"`    | 結果の出力形式。利用可能な形式:<br />• `"CSV"` - カンマ区切り形式<br />• `"JSON"` - JSON 形式<br />• `"TabSeparated"` - タブ区切り形式<br />• `"Pretty"` - 表形式で見やすく整形された形式<br />• `"JSONCompact"` - コンパクトな JSON 形式<br />• `"Arrow"` - Apache Arrow 形式<br />• `"Parquet"` - Parquet 形式 |
| `udf_path` | str  | `""`       | ユーザー定義関数のパス。指定されていない場合は、セッション初期化時に設定された UDF パスが使用されます                                                                                                                                                                                                 |

**戻り値**

指定された形式でクエリ結果を返します。
正確な戻り値の型は `fmt` パラメータに依存します:

* 文字列形式 (CSV, JSON など) は `str` を返します
* バイナリ形式 (Arrow, Parquet) は `bytes` を返します

**例外:**

| Exception      | Condition             |
| -------------- | --------------------- |
| `RuntimeError` | セッションがクローズされているか無効な場合 |
| `ValueError`   | SQL クエリが不正な場合         |

:::note
`"Debug"` 形式はサポートされておらず、警告付きで自動的に
`"CSV"` に変換されます。デバッグ用途には、代わりに接続文字列パラメータを
使用してください。
:::

:::warning Warning
このメソッドはクエリを同期的に実行し、すべての結果をメモリに
ロードします。
結果セットが大きい場合は、結果をストリーミングするために [`send_query()`](#chdb-session-session-send_query) の使用を検討してください。
:::

**使用例**

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

**関連項目**

* [`send_query()`](#chdb-session-session-send_query) - クエリをストリーミングで実行するために使用
* [`sql`](#chdb-session-session-sql) - このメソッドの別名


## 状態管理 \{#chdb-state-management\}

### `chdb.state.connect` \{#chdb_state_connect\}

chDB バックグラウンドサーバーへの[Connection](#chdb-state-sqlitelike-connection)を作成します。

この関数は chDB (ClickHouse) データベースエンジンへの接続を確立します。
1 プロセスあたり開いていられる接続は 1 つだけです。同じ接続文字列で
複数回呼び出した場合、同じ接続オブジェクトが返されます。

**構文**

```python
chdb.state.connect(connection_string: str = ':memory:') → Connection
```

**パラメータ**

| Parameter                          | Type | Default      | Description                 |
| ---------------------------------- | ---- | ------------ | --------------------------- |
| `connection_string(str, optional)` | str  | `":memory:"` | データベース接続文字列。以下の形式を参照してください。 |

**基本的な形式**

サポートされる接続文字列形式:

| Format                    | Description         |
| ------------------------- | ------------------- |
| `":memory:"`              | インメモリデータベース (デフォルト) |
| `"test.db"`               | 相対パスのデータベースファイル     |
| `"file:test.db"`          | 相対パスと同等             |
| `"/path/to/test.db"`      | 絶対パスのデータベースファイル     |
| `"file:/path/to/test.db"` | 絶対パスと同等             |

**クエリパラメータ付き**

| Format                                             | Description  |
| -------------------------------------------------- | ------------ |
| `"file:test.db?param1=value1&param2=value2"`       | パラメータ付き相対パス  |
| `"file::memory:?verbose&log-level=test"`           | パラメータ付きインメモリ |
| `"///path/to/test.db?param1=value1&param2=value2"` | パラメータ付き絶対パス  |

**クエリパラメータの扱い**

クエリパラメータは、起動引数として ClickHouse エンジンに渡されます。
一部パラメータの特別な扱い:

| Special Parameter | Becomes        | Description |
| ----------------- | -------------- | ----------- |
| `mode=ro`         | `--readonly=1` | 読み取り専用モード   |
| `verbose`         | (flag)         | 詳細ログを有効にする  |
| `log-level=test`  | (setting)      | ログレベルを設定する  |

パラメータの完全な一覧は `clickhouse local --help --verbose` を参照してください。

**戻り値**

| Return Type  | Description                                                                                                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Connection` | 次の機能をサポートするデータベース接続オブジェクト:<br />• `Connection.cursor()` によるカーソルの作成<br />• `Connection.query()` による直接クエリ実行<br />• `Connection.send_query()` によるストリーミングクエリ<br />• コンテキストマネージャープロトコルに対応した自動クリーンアップ |

**送出される例外**

| Exception      | Condition            |
| -------------- | -------------------- |
| `RuntimeError` | データベースへの接続に失敗した場合に送出 |

:::warning 警告
プロセスごとにサポートされる接続は 1 つのみです。
新しい接続を作成すると、既存の接続は閉じられます。
:::

**使用例**

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

**関連項目**

* `Connection` - データベース接続クラス
* `Cursor` - DB-API 2.0 操作用のデータベースカーソル


### **class** `chdb.state.sqlitelike.Connection` \{#chdb-state-sqlitelike-connection\}

基底クラス: `object`

**構文**

```python
class chdb.state.sqlitelike.Connection(connection_string: str)
```

***


#### `close` \{#chdb-session-session-close\}

接続を閉じてリソースを解放します。

このメソッドはデータベース接続を閉じ、アクティブなカーソルを含む関連するリソースを解放します。このメソッドを呼び出した後は、接続は無効になり、以降の操作には使用できません。

**構文**

```python
close() → None
```

:::note
このメソッドは冪等であり、複数回呼び出しても安全です。
:::

:::warning 警告
接続を閉じると、進行中のストリーミングクエリはすべてキャンセルされます。接続を閉じる前に、重要なデータがすべて処理されていることを確認してください。
:::

**例**

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

クエリを実行するための [Cursor](#chdb-state-sqlitelike-cursor) オブジェクトを作成します。

このメソッドは、クエリの実行および結果の取得のための標準的な
DB-API 2.0 インターフェイスを提供するデータベースカーソルを作成します。
カーソルを使用することで、クエリ実行および結果取得を
きめ細かく制御できます。

**構文**

```python
cursor() → Cursor
```

**戻り値**

| 戻り値の型    | 説明                   |
| -------- | -------------------- |
| `Cursor` | データベース操作用のカーソルオブジェクト |

:::note
新しいカーソルを作成すると、この接続に関連付けられている
既存のカーソルは置き換えられます。1 つの接続で使用できるカーソルは 1 つだけです。
:::

**使用例**

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

* [`Cursor`](#chdb-state-sqlitelike-cursor) - データベースカーソルの実装

***


#### `query` \{#chdb-state-sqlitelike-connection-query\}

SQL クエリを実行し、完全な結果を返します。

このメソッドは SQL クエリを同期的に実行し、結果セット全体を返します。さまざまな出力フォーマットをサポートし、フォーマット固有の後処理を自動的に適用します。

**構文**

```python
query(query: str, format: str = 'CSV') → Any
```

**パラメータ:**

| Parameter | Type | Default    | Description                                                                                                                                                                                                                                  |
| --------- | ---- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`   | str  | *required* | 実行する SQL クエリ文字列                                                                                                                                                                                                                              |
| `format`  | str  | `"CSV"`    | 結果の出力フォーマット。サポートされるフォーマット:<br />• `"CSV"` - カンマ区切り値 (文字列)<br />• `"JSON"` - JSON 形式 (文字列)<br />• `"Arrow"` - Apache Arrow 形式 (バイト列)<br />• `"Dataframe"` - Pandas DataFrame (pandas が必要)<br />• `"Arrowtable"` - PyArrow Table (pyarrow が必要) |

**戻り値**

| Return Type        | Description                |
| ------------------ | -------------------------- |
| `str`              | 文字列形式 (CSV, JSON) のフォーマット用 |
| `bytes`            | Arrow フォーマット用              |
| `pandas.DataFrame` | DataFrame フォーマット用          |
| `pyarrow.Table`    | ArrowTable フォーマット用         |

**例外**

| Exception      | Condition                  |
| -------------- | -------------------------- |
| `RuntimeError` | クエリの実行に失敗した場合              |
| `ImportError`  | フォーマットに必要なパッケージが未インストールの場合 |

:::warning Warning
このメソッドは結果セット全体をメモリ上に読み込みます。大きな
結果セットを扱う場合は、ストリーミングのために [`send_query()`](#chdb-state-sqlitelike-connection-send_query) の使用を検討してください。
:::

**使用例**

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

* [`send_query()`](#chdb-state-sqlitelike-connection-send_query) - クエリをストリーミング実行する場合

***


#### `send_query` \{#chdb-state-sqlitelike-connection-send_query\}

SQL クエリを実行し、ストリーミング結果イテレータを返します。

このメソッドは SQL クエリを実行し、`StreamingResult` オブジェクトを返します。
これにより、すべての結果を一度にメモリに読み込むことなく結果を反復処理できます。
大規模な結果セットを処理する場合に最適です。

**構文**

```python
send_query(query: str, format: str = 'CSV') → StreamingResult
```

**パラメータ**

| Parameter | Type | Default    | Description                                                                                                                                                                                                                     |
| --------- | ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`   | str  | *required* | 実行する SQL クエリ文字列                                                                                                                                                                                                                 |
| `format`  | str  | `"CSV"`    | 結果の出力形式。サポートされている形式:<br />• `"CSV"` - カンマ区切り値<br />• `"JSON"` - JSON 形式<br />• `"Arrow"` - Apache Arrow 形式（`record_batch()` メソッドを有効化）<br />• `"dataframe"` - Pandas DataFrame のチャンク<br />• `"arrowtable"` - PyArrow Table のチャンク |

**戻り値**

| Return Type       | Description                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `StreamingResult` | クエリ結果用のストリーミングイテレータ。次をサポートします:<br />• イテレータプロトコル（for ループ）<br />• コンテキストマネージャプロトコル（with 文）<br />• `fetch()` メソッドによる手動フェッチ<br />• PyArrow RecordBatch のストリーミング（Arrow 形式のみ） |

**送出される例外**

| Exception      | Condition                  |
| -------------- | -------------------------- |
| `RuntimeError` | クエリ実行が失敗した場合               |
| `ImportError`  | 指定した形式に必要なパッケージが未インストールの場合 |

:::note
返される `StreamingResult` に対して `record_batch()` メソッドを利用できるのは “Arrow” 形式のみです。
:::

**使用例**

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

* [`query()`](#chdb-state-sqlitelike-connection-query) - ストリーミングしないクエリ実行用
* [`StreamingResult`](#chdb-state-sqlitelike-streamingresult) - ストリーミング結果のイテレータ

***


### **class** `chdb.state.sqlitelike.StreamingResult` \{#chdb-state-sqlitelike-streamingresult\}

Bases: `object`

大規模なクエリ結果を処理するためのストリーミング結果イテレータ。

このクラスは、結果セット全体をメモリに読み込むことなくクエリ結果をストリーミングするためのイテレータインターフェイスを提供します。さまざまな出力形式をサポートし、手動で結果を取得したり PyArrow RecordBatch をストリーミングしたりするためのメソッドを提供します。

```python
class chdb.state.sqlitelike.StreamingResult
```

***


#### `fetch` \{#streamingresult-fetch\}

ストリーミング結果の次の chunk を取得します。

このメソッドは、ストリーミング中のクエリ結果から利用可能な次の chunk のデータを取得します。返されるデータの形式は、ストリーミングクエリを開始した際に指定した形式に依存します。

**構文**

```python
fetch() → Any
```

**戻り値**

| 戻り値の型   | 説明                       |
| ------- | ------------------------ |
| `str`   | テキスト形式（CSV、JSON）の場合      |
| `bytes` | バイナリ形式（Arrow、Parquet）の場合 |
| `None`  | 結果ストリームを読み尽くした場合         |

**使用例**

```pycon
>>> stream = conn.send_query("SELECT * FROM large_table")
>>> chunk = stream.fetch()
>>> while chunk is not None:
...     process_data(chunk)
...     chunk = stream.fetch()
```

***


#### `cancel` \{#streamingresult-cancel\}

ストリーミングクエリをキャンセルし、リソースをクリーンアップします。

このメソッドは、進行中のストリーミングクエリをキャンセルし、関連する
リソースを解放します。ストリームをすべて処理し終える前に結果の処理を停止したい場合に呼び出してください。

**構文**

```python
cancel() → None
```

**使用例**

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

ストリーミング結果を閉じて、リソースをクリーンアップします。

[`cancel()`](#streamingresult-cancel) のエイリアスです。ストリーミング結果イテレータをクローズし、
関連するリソースを解放します。

**構文**

```python
close() → None
```

***


#### `record_batch` \{#streamingresult-record_batch\}

効率的なバッチ処理のための PyArrow RecordBatchReader を作成します。

このメソッドは、クエリ結果を Arrow 形式でバッチ単位に反復処理するための
PyArrow RecordBatchReader を作成します。PyArrow を使用して大きな結果セットを
処理する場合、これは最も効率的な方法です。

**構文**

```python
record_batch(rows_per_batch: int = 1000000) → pa.RecordBatchReader
```

**パラメータ**

| パラメータ            | 型   | デフォルト     | 説明       |
| ---------------- | --- | --------- | -------- |
| `rows_per_batch` | int | `1000000` | バッチごとの行数 |

**戻り値**

| 戻り値の型                  | 説明                                      |
| ---------------------- | --------------------------------------- |
| `pa.RecordBatchReader` | バッチを反復処理するための PyArrow RecordBatchReader |

:::note
このメソッドは、ストリーミングクエリが `format="Arrow"` で初期化された場合にのみ利用できます。
他のフォーマットで使用するとエラーが発生します。
:::

**使用例**

```pycon
>>> stream = conn.send_query("SELECT * FROM data", format="Arrow")
>>> reader = stream.record_batch(rows_per_batch=10000)
>>> for batch in reader:
...     print(f"Processing batch: {batch.num_rows} rows")
...     df = batch.to_pandas()
...     process_dataframe(df)
```

***


#### イテレータプロトコル \{#streamingresult-iterator\}

StreamingResult は Python のイテレータプロトコルをサポートしており、for ループで直接使用できます。

```pycon
>>> stream = conn.send_query("SELECT number FROM numbers(1000000)")
>>> for chunk in stream:
...     print(f"Chunk size: {len(chunk)} bytes")
```

***


#### コンテキストマネージャープロトコル \{#streamingresult-context-manager\}

StreamingResult は、リソースの自動クリーンアップのために
コンテキストマネージャープロトコルをサポートしています。

```pycon
>>> with conn.send_query("SELECT * FROM data") as stream:
...     for chunk in stream:
...         process(chunk)
>>> # Stream automatically closed
```

***


### **class** `chdb.state.sqlitelike.Cursor` \{#chdb-state-sqlitelike-cursor\}

基底クラス: `object`

```python
class chdb.state.sqlitelike.Cursor(connection)
```

***


#### `close` \{#cursor-close-none\}

カーソルを閉じてリソースをクリーンアップします。

このメソッドはカーソルを閉じ、関連するリソースをクリーンアップします。
このメソッドを呼び出した後、カーソルは無効となり、その後の操作には使用できません。

**構文**

```python
close() → None
```

:::note
このメソッドは冪等であり、複数回呼び出しても安全です。
接続がクローズされると、カーソルも自動的にクローズされます。
:::

**例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT 1")
>>> result = cursor.fetchone()
>>> cursor.close()  # Cleanup cursor resources
```

***


#### `column_names` \{#chdb-state-sqlitelike-cursor-column_names\}

直近に実行されたクエリから列名の一覧を返します。

このメソッドは、直前に実行された
SELECT クエリの列名を返します。列名は、結果セットに表示される順序と同じ順序で返されます。

**構文**

```python
column_names() → list
```

**戻り値**

| 戻り値の型  | 説明                                                       |
| ------ | -------------------------------------------------------- |
| `list` | 列名の文字列リスト。クエリがまだ実行されていない場合、またはクエリが列を返さなかった場合は空のリストを返します。 |

**使用例**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT id, name, email FROM users LIMIT 1")
>>> print(cursor.column_names())
['id', 'name', 'email']
```

**関連項目**

* [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - カラム型情報を取得
* [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0 におけるカラムの説明

***


#### `column_types` \{#chdb-state-sqlitelike-cursor-column_types\}

直近に実行されたクエリから、カラム型のリストを返します。

このメソッドは、直近に実行された SELECT クエリにおける ClickHouse のカラム型名を返します。型は、結果セット内に現れる順序と同じ順序で返されます。

**構文**

```python
column_types() → list
```

**Returns**

| Return Type | Description                                                            |
| ----------- | ---------------------------------------------------------------------- |
| `list`      | ClickHouse の型名を表す文字列のリスト。まだクエリが実行されていない場合、またはクエリが列を返さなかった場合は空のリストを返します |

**Examples**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT toInt32(1), toString('hello')")
>>> print(cursor.column_types())
['Int32', 'String']
```

**関連項目**

* [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - 列名情報を取得
* [`description`](#chdb-state-sqlitelike-cursor-description) - DB-API 2.0 の列説明情報

***


#### `commit` \{#commit\}

保留中のトランザクションをコミットします。

このメソッドは、保留中のデータベーストランザクションをコミットします。ClickHouse では
ほとんどの操作が自動コミットされますが、このメソッドは
DB-API 2.0 との互換性のために提供されています。

:::note
ClickHouse では通常、操作が自動コミットされるため、明示的なコミットは
ほとんどの場合不要です。このメソッドは標準的な DB-API 2.0 ワークフローとの
互換性のために提供されています。
:::

**構文**

```python
commit() → None
```

**Examples**

```pycon
>>> cursor = conn.cursor()
>>> cursor.execute("INSERT INTO test VALUES (1, 'data')")
>>> cursor.commit()
```

***


#### `property description : list` \{#chdb-state-sqlitelike-cursor-description\}

DB-API 2.0 仕様に準拠したカラムの説明を返します。

このプロパティは、直近に実行された SELECT クエリの結果セット内の
各カラムを表す 7 要素タプルのリストを返します。各タプルの内容は次のとおりです：
(name, type&#95;code, display&#95;size, internal&#95;size, precision, scale, null&#95;ok)

現在は name と type&#95;code のみが提供され、他のフィールドは None に設定されています。

**Returns**

| Return Type | Description                                         |
| ----------- | --------------------------------------------------- |
| `list`      | 各カラムを表す 7 要素タプルのリスト。SELECT クエリが実行されていない場合は空リストを返します |

:::note
これは cursor.description に関する DB-API 2.0 仕様に従います。
この実装では、最初の 2 つの要素 (name と type&#95;code) のみが
有効なデータを持ちます。
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

**関連項目**

* [`column_names()`](#chdb-state-sqlitelike-cursor-column_names) - カラム名のみを取得
* [`column_types()`](#chdb-state-sqlitelike-cursor-column_types) - カラムの型のみを取得

***


#### `execute` \{#execute\}

SQL クエリを実行し、フェッチ用に結果を準備します。

このメソッドは SQL クエリを実行し、`fetch` 系メソッドで取得するための結果を準備します。結果データの解析と、ClickHouse のデータ型に対する自動型変換を行います。

**構文**

```python
execute(query: str) → None
```

**パラメーター:**

| パラメーター  | 型   | 説明              |
| ------- | --- | --------------- |
| `query` | str | 実行する SQL クエリ文字列 |

**送出される例外**

| 例外          | 条件                            |
| ----------- | ----------------------------- |
| `Exception` | クエリの実行または結果のパースに失敗した場合に送出されます |

:::note
このメソッドは `cursor.execute()` に関する DB-API 2.0 の仕様に準拠しています。
実行後は `fetchone()`、`fetchmany()`、`fetchall()` を使用して
結果を取得します。
:::

:::note
このメソッドは ClickHouse のデータ型を自動的に適切な
Python の型に変換します:

* Int/UInt 型 → int
* Float 型 → float
* String/FixedString → str
* DateTime → datetime.datetime
* Date → datetime.date
* Bool → bool
  :::

**例**

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

**関連項目**

* [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 単一行を取得する
* [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 複数行を取得する
* [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 残りのすべての行を取得する

***


#### `fetchall` \{#chdb-state-sqlitelike-cursor-fetchall\}

クエリ結果から残りのすべての行を取得します。

このメソッドは、現在のカーソル位置を起点として、現在のクエリ結果セット内に残っているすべての行を取得します。各行を表すタプルに対して Python の適切な型変換を適用し、それらを要素とするタプルを返します。

**構文**

```python
fetchall() → tuple
```

**戻り値:**

| 戻り値の型   | 説明                                               |
| ------- | ------------------------------------------------ |
| `tuple` | 結果セットの残りの行タプルをすべて含むタプルです。利用可能な行がない場合は空のタプルを返します。 |

:::warning 警告
このメソッドは、残りの行をすべて一度にメモリに読み込みます。大きな結果セットの場合は、結果をバッチ処理するために [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) の使用を検討してください。
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

* [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 単一行を取得
* [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - バッチ処理で複数行を取得

***


#### `fetchmany` \{#chdb-state-sqlitelike-cursor-fetchmany\}

クエリ結果から複数の行を取得します。

このメソッドは、現在のクエリ結果セットから最大で `size` 行を取得します。各行を表すタプルを要素とするタプルを返し、各行には、Python の適切な型に変換されたカラム値が含まれます。

**構文**

```python
fetchmany(size: int = 1) → tuple
```

**パラメータ**

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `size`    | int  | `1`     | 取得する最大行数    |

**戻り値**

| Return Type | Description                                                        |
| ----------- | ------------------------------------------------------------------ |
| `tuple`     | 最大で &#39;size&#39; 個の行タプルを含むタプル。結果セットが尽きている場合は、含まれる行数が少なくなることがあります |

:::note
このメソッドは DB-API 2.0 の仕様に従います。結果セットが尽きている場合、
返される行数は「size」より少なくなります。
:::

**使用例**

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

* [`fetchone()`](#chdb-state-sqlitelike-cursor-fetchone) - 1 行を取得
* [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 残りの行をすべて取得

***


#### `fetchone` \{#chdb-state-sqlitelike-cursor-fetchone\}

クエリ結果から次の行を取得します。

このメソッドは、現在のクエリ結果セットから次に利用可能な行を取得します。取得した行は、カラム値が適切な Python 型に変換されたタプルとして返されます。

**構文**

```python
fetchone() → tuple | None
```

**戻り値:**

| 戻り値の型             | 説明                                                 |
| ----------------- | -------------------------------------------------- |
| `Optional[tuple]` | 次の行を、そのカラム値を要素とするタプルとして返します。これ以上行がなければ None を返します。 |

:::note
このメソッドは DB-API 2.0 仕様に準拠しています。カラム値は、
ClickHouse のカラム型に基づいて適切な Python 型に自動変換されます。
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

* [`fetchmany()`](#chdb-state-sqlitelike-cursor-fetchmany) - 複数行を取得
* [`fetchall()`](#chdb-state-sqlitelike-cursor-fetchall) - 残りの全行を取得

***


### `chdb.state.sqlitelike` \{#state-sqlitelike-to_arrowtable\}

クエリ結果を PyArrow Table に変換します。

この関数は、chdb のクエリ結果を PyArrow Table 形式に変換し、
効率的な列指向データアクセスと他のデータ処理ライブラリとの
相互運用性を提供します。

**構文**

```python
chdb.state.sqlitelike.to_arrowTable(res)
```

**パラメータ:**

| パラメータ | 型 | 説明                                 |
| ----- | - | ---------------------------------- |
| `res` | - | Arrow 形式データを含む chdb からのクエリ結果オブジェクト |

**戻り値**

| 戻り値の型           | 説明                    |
| --------------- | --------------------- |
| `pyarrow.Table` | クエリ結果を含む PyArrow テーブル |

**例外**

| 例外            | 条件                                  |
| ------------- | ----------------------------------- |
| `ImportError` | pyarrow または pandas パッケージが未インストールの場合 |

:::note
この関数を使用するには、pyarrow と pandas の両方がインストールされている必要があります。
次のコマンドでインストールしてください: `pip install pyarrow pandas`
:::

:::warning Warning
結果が空の場合、スキーマを持たない空の PyArrow テーブルを返します。
:::

**使用例**

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

クエリ結果を Pandas DataFrame に変換します。

この関数は、chdb のクエリ結果をいったん PyArrow Table に変換してから DataFrame に変換し、最終的に Pandas DataFrame 形式として扱えるようにします。これにより、Pandas API を用いた便利なデータ分析が可能になります。

**構文**

```python
chdb.state.sqlitelike.to_df(r)
```

**パラメータ:**

| パラメータ | 型 | 説明                                    |
| ----- | - | ------------------------------------- |
| `r`   | - | Arrow フォーマットのデータを含む、chdb のクエリ結果オブジェクト |

**戻り値**

| 戻り値の型              | 説明                                         |
| ------------------ | ------------------------------------------ |
| `pandas.DataFrame` | 適切な列名およびデータ型付きでクエリ結果を保持する DataFrame オブジェクト |

**例外**

| 例外            | 条件                             |
| ------------- | ------------------------------ |
| `ImportError` | pyarrow または pandas が未インストールの場合 |

:::note
この関数は、大規模なデータセットでのパフォーマンス向上のために、
Arrow から Pandas への変換処理でマルチスレッドを使用します。
:::

**関連項目**

* [`to_arrowTable()`](#chdb-state-sqlitelike-to_arrowtable) - PyArrow Table フォーマットへの変換用

**使用例**

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


## DataFrame 統合 \{#dataframe-integration\}

### **class** `chdb.dataframe.Table` \{#chdb-dataframe-table\}

基底クラス:

```python
class chdb.dataframe.Table(*args: Any, **kwargs: Any)
```


## Database API (DBAPI) 2.0 インターフェイス \{#database-api-interface\}

chDB はデータベース接続用に Python DB-API 2.0 互換インターフェイスを提供しており、標準的なデータベースインターフェイスに対応したツールやフレームワークで chDB を利用できます。

chDB の DB-API 2.0 インターフェイスには次の機能が含まれます:

- **Connections**: 接続文字列を用いたデータベース接続管理
- **Cursors**: クエリの実行および結果の取得
- **Type System**: DB-API 2.0 準拠の型定数とコンバーター
- **Error Handling**: 標準的なデータベース例外階層
- **Thread Safety**: レベル 1 のスレッドセーフ (スレッド間でモジュールは共有できるが、接続は共有できない)

---

### コア関数 \{#core-functions\}

Database API (DBAPI) 2.0 インターフェイスは、次のコア関数を実装します:

#### `chdb.dbapi.connect` \{#dbapi-connect\}

新しいデータベース接続を確立します。

**構文**

```python
chdb.dbapi.connect(*args, **kwargs)
```

**パラメータ**

| Parameter | Type | Default | Description                        |
| --------- | ---- | ------- | ---------------------------------- |
| `path`    | str  | `None`  | データベースファイルのパス。インメモリデータベースの場合は None |

**例外**

| Exception                            | Condition         |
| ------------------------------------ | ----------------- |
| [`err.Error`](#chdb-dbapi-err-error) | 接続を確立できない場合に発生します |

***


#### `chdb.dbapi.get_client_info()` \{#dbapi-get-client-info\}

クライアントバージョン情報を取得します。

MySQLdb 互換性のために、chDB クライアントのバージョンを文字列として返します。

**構文**

```python
chdb.dbapi.get_client_info()
```

**戻り値**

| Return Type | 説明                                      |
| ----------- | --------------------------------------- |
| `str`       | &#39;major.minor.patch&#39; 形式のバージョン文字列 |

***


### 型コンストラクタ \{#type-constructors\}

#### `chdb.dbapi.Binary(x)` \{#dbapi-binary\}

x をバイナリ型として返します。

この関数は、DB-API 2.0 仕様に従い、バイナリ型のデータベースフィールドで使用するために、入力を bytes 型に変換します。

**構文**

```python
chdb.dbapi.Binary(x)
```

**パラメータ**

| Parameter | Type | Description    |
| --------- | ---- | -------------- |
| `x`       | -    | バイナリに変換する入力データ |

**戻り値**

| Return Type | Description     |
| ----------- | --------------- |
| `bytes`     | バイト列に変換された入力データ |

***


### Connection クラス \{#connection-class\}

#### **class** `chdb.dbapi.connections.Connection(path=None)` \{#chdb-dbapi-connections-connection\}

Bases: `object`

chDB データベースへの DB-API 2.0 準拠コネクション。

このクラスは、chDB データベースへの接続および操作のための標準的な DB-API インターフェイスを提供します。インメモリおよびファイルベースの両方のデータベースをサポートします。

このコネクションは基盤となる chDB エンジンを管理し、クエリの実行、トランザクションの管理（ClickHouse では no-op となります）、カーソルの作成のためのメソッドを提供します。

```python
class chdb.dbapi.connections.Connection(path=None)
```

**パラメータ**

| Parameter | Type | Default | Description                                                                                                            |
| --------- | ---- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| `path`    | str  | `None`  | データベースファイルのパス。None の場合はインメモリデータベースを使用します。&#39;database.db&#39; のようなファイルパス、または &#39;:memory:&#39; を使用する場合は None を指定できます |

**変数**

| Variable   | Type | Description                                |
| ---------- | ---- | ------------------------------------------ |
| `encoding` | str  | クエリ文字列の文字エンコーディング。デフォルトは &#39;utf8&#39; です |
| `open`     | bool | 接続が開いていれば True、閉じていれば False です             |

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
ClickHouse は従来型のトランザクションをサポートしていないため、commit() および rollback()
操作は実質的に何も処理しませんが、DB-API への準拠のために提供されています。
:::

***


#### `close` \{#dbapi-connection-close\}

データベース接続を閉じます。

基盤となる chDB 接続を閉じ、この接続を閉じられたものとしてマークします。
この接続に対して後続の操作を行うと、Error がスローされます。

**構文**

```python
close()
```

**発生する例外**

| 例外                                   | 条件                |
| ------------------------------------ | ----------------- |
| [`err.Error`](#chdb-dbapi-err-error) | 接続がすでにクローズされている場合 |

***


#### `commit` \{#dbapi-commit\}

現在のトランザクションをコミットします。

**構文**

```python
commit()
```

:::note
従来型トランザクションをサポートしていない chDB/ClickHouse では、この操作は何も行いません（no-op）。
DB-API 2.0 準拠のために提供されています。
:::

***


#### `cursor` \{#dbapi-cursor\}

クエリを実行するための新しいカーソルを作成します。

**構文**

```python
cursor(cursor=None)
```

**パラメータ**

| パラメータ    | 型 | 説明                    |
| -------- | - | --------------------- |
| `cursor` | - | 後方互換性のために存在するが、使用されない |

**戻り値**

| 戻り値の型    | 説明                    |
| -------- | --------------------- |
| `Cursor` | この接続に対する新しいカーソルオブジェクト |

**送出される例外**

| 例外                                   | 条件             |
| ------------------------------------ | -------------- |
| [`err.Error`](#chdb-dbapi-err-error) | 接続がクローズされている場合 |

**使用例**

```pycon
>>> conn = Connection()
>>> cur = conn.cursor()
>>> cur.execute("SELECT 1")
>>> result = cur.fetchone()
```

***


#### `escape` \{#escape\}

SQL クエリに安全に含められるよう、値をエスケープします。

**構文**

```python
escape(obj, mapping=None)
```

**パラメーター**

| パラメーター    | 型 | 説明                      |
| --------- | - | ----------------------- |
| `obj`     | - | エスケープする値（文字列、バイト列、数値など） |
| `mapping` | - | エスケープに使用するオプションの文字マッピング |

**戻り値**

| 戻り値の型 | 説明                        |
| ----- | ------------------------- |
| -     | SQL クエリに適した形式にエスケープされた入力値 |

**例**

```pycon
>>> conn = Connection()
>>> safe_value = conn.escape("O'Reilly")
>>> query = f"SELECT * FROM users WHERE name = {safe_value}"
```

***


#### `escape_string` \{#escape-string\}

SQL クエリで使用するために文字列値をエスケープします。

**構文**

```python
escape_string(s)
```

**パラメータ**

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `s`       | str  | エスケープする文字列  |

**戻り値**

| Return Type | Description                 |
| ----------- | --------------------------- |
| `str`       | SQL に安全に埋め込めるようにエスケープされた文字列 |

***


#### `property open` \{#property-open\}

接続が開いているかどうかを確認します。

**戻り値**

| Return Type  | Description                                 |
|--------------|---------------------------------------------|
| `bool`       | 接続が開いていれば True、閉じていれば False |

---

#### `query` \{#dbapi-query\}

SQL クエリを直接実行し、生の結果を返します。

このメソッドはカーソルインターフェイスを経由せずにクエリを直接実行します。
標準的な DB-API の利用には、`cursor()` メソッドの使用を推奨します。

**構文**

```python
query(sql, fmt='CSV')
```

**パラメータ:**

| パラメータ | 型             | デフォルト   | 説明                                                  |
| ----- | ------------- | ------- | --------------------------------------------------- |
| `sql` | str または bytes | *必須*    | 実行する SQL クエリ                                        |
| `fmt` | str           | `"CSV"` | 出力形式。サポートされる形式には「CSV」「JSON」「Arrow」「Parquet」などがあります。 |

**戻り値**

| 戻り値の型 | 説明             |
| ----- | -------------- |
| -     | 指定された形式でのクエリ結果 |

**送出される例外**

| 例外                                                     | 条件                         |
| ------------------------------------------------------ | -------------------------- |
| [`err.InterfaceError`](#chdb-dbapi-err-interfaceerror) | 接続が閉じられている場合、またはクエリが失敗した場合 |

**例**

```pycon
>>> conn = Connection()
>>> result = conn.query("SELECT 1, 'hello'", "CSV")
>>> print(result)
"1,hello\n"
```

***


#### `property resp` \{#property-resp\}

最後に実行されたクエリのレスポンスを取得します。

**戻り値**

| 戻り値の型 | 説明                           |
| ----- | ---------------------------- |
| -     | 直近の `query()` 呼び出しによる生のレスポンス |

:::note
このプロパティは、`query()` が直接呼び出されるたびに更新されます。
カーソル経由で実行されたクエリは反映されません。
:::

---

#### `rollback` \{#rollback\}

現在のトランザクションをロールバックします。

**構文**

```python
rollback()
```

:::note
これは従来型のトランザクションをサポートしない chDB/ClickHouse に対しては
実質的に何も行いません（no-op） 。DB-API 2.0 準拠のために提供されています。
:::

***


### Cursor クラス \{#cursor-class\}

#### **class** `chdb.dbapi.cursors.Cursor` \{#chdb-dbapi-cursors-cursor\}

Bases: `object`

クエリを実行し、結果を取得するための DB-API 2.0 カーソルです。

このカーソルは、SQL ステートメントの実行、クエリ結果の管理、
および結果セット内の移動のためのメソッドを提供します。パラメータバインディングや
一括操作をサポートし、DB-API 2.0 仕様に準拠しています。

Cursor インスタンスを直接作成しないでください。代わりに `Connection.cursor()` を使用してください。

```python
class chdb.dbapi.cursors.Cursor(connection)
```

| Variable          | Type  | Description                                  |
| ----------------- | ----- | -------------------------------------------- |
| `description`     | tuple | 直前のクエリ結果の列メタデータ                              |
| `rowcount`        | int   | 直前のクエリで影響を受けた行数（不明な場合は -1）                   |
| `arraysize`       | int   | 一度にフェッチする行数のデフォルト値（デフォルト: 1）                 |
| `lastrowid`       | -     | 最後に挿入された行の ID（該当する場合）                        |
| `max_stmt_length` | int   | executemany() 用ステートメントの最大サイズ（デフォルト: 1024000） |

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
完全な仕様については、[DB-API 2.0 Cursor Objects](https://www.python.org/dev/peps/pep-0249/#cursor-objects)
を参照してください。
:::

***


#### `callproc` \{#callproc\}

ストアドプロシージャを実行します（プレースホルダーとしての実装）。

**構文**

```python
callproc(procname, args=())
```

**パラメーター**

| Parameter  | Type     | Description       |
| ---------- | -------- | ----------------- |
| `procname` | str      | 実行するストアドプロシージャの名前 |
| `args`     | sequence | プロシージャに渡すパラメーター   |

**戻り値**

| Return Type | Description         |
| ----------- | ------------------- |
| `sequence`  | 元の args 引数（変更されません） |

:::note
chDB/ClickHouse は、従来の意味でのストアドプロシージャをサポートしていません。
このメソッドは DB-API 2.0 準拠のために提供されていますが、
実際の処理は一切行いません。すべての SQL 操作には execute() を使用してください。
:::

:::warning Compatibility
これはプレースホルダー実装です。OUT/INOUT パラメーター、複数の結果セット、
サーバー変数といった従来のストアドプロシージャの機能は、
基盤となる ClickHouse エンジンではサポートされていません。
:::

***


#### `close` \{#dbapi-cursor-close\}

カーソルを閉じて、関連するリソースを解放します。

クローズ後、カーソルは使用不能となり、どのような操作も例外を送出します。
カーソルを閉じると、残りのすべてのデータが消費され、基盤となるカーソルが解放されます。

**構文**

```python
close()
```

***


#### `execute` \{#dbapi-execute\}

オプションのパラメータバインディング付きで SQL クエリを実行します。

このメソッドは、オプションのパラメータ置換付きで単一の SQL 文を実行します。
柔軟に利用できるよう、複数のパラメータプレースホルダー形式をサポートします。

**構文**

```python
execute(query, args=None)
```

**パラメーター**

| Parameter | Type            | Default | Description           |
| --------- | --------------- | ------- | --------------------- |
| `query`   | str             | *必須*    | 実行する SQL クエリ          |
| `args`    | tuple/list/dict | `None`  | プレースホルダーにバインドするパラメーター |

**戻り値**

| Return Type | Description         |
| ----------- | ------------------- |
| `int`       | 影響を受けた行数（不明な場合は -1） |

**パラメーター指定のスタイル**

| Style          | Example                                         |
| -------------- | ----------------------------------------------- |
| クエスチョンマーク形式    | `"SELECT * FROM users WHERE id = ?"`            |
| 名前付き形式         | `"SELECT * FROM users WHERE name = %(name)s"`   |
| フォーマット形式（レガシー） | `"SELECT * FROM users WHERE age = %s"` (legacy) |

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

**送出される例外**

| 例外                                                     | 条件                            |
| ------------------------------------------------------ | ----------------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | カーソルがクローズされている場合、またはクエリが不正な場合 |
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror)     | 実行中にデータベースエラーが発生した場合          |

***


#### `executemany(query, args)` \{#chdb-dbapi-cursors-cursor-executemany\}

異なるパラメータセットでクエリを複数回実行します。

このメソッドは、同じSQLクエリを異なるパラメータ値で複数回効率的に実行します。特に大量のINSERT操作に有用です。

**構文**

```python
executemany(query, args)
```

**パラメーター**

| Parameter | Type     | Description                        |
| --------- | -------- | ---------------------------------- |
| `query`   | str      | 複数回実行する SQL クエリ                    |
| `args`    | sequence | 各実行ごとのパラメーター（タプル / 辞書 / リスト）のシーケンス |

**戻り値**

| Return Type | Description          |
| ----------- | -------------------- |
| `int`       | すべての実行を通じて影響を受けた行の総数 |

**使用例**

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
この方法では、クエリ実行処理を最適化することで、複数行に対する INSERT および UPDATE 操作のパフォーマンスを向上させます。
:::

***


#### `fetchall()` \{#dbapi-fetchall\}

クエリ結果から残りのすべての行を取得します。

**構文**

```python
fetchall()
```

**戻り値**

| 戻り値の型  | 説明                 |
| ------ | ------------------ |
| `list` | 残りのすべての行を表すタプルのリスト |

**例外**

| 例外                                                     | 発生条件                       |
| ------------------------------------------------------ | -------------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 事前に execute() が呼び出されていない場合 |

:::warning 警告
このメソッドは、結果セットが大きい場合に大量のメモリを消費する可能性があります。
大規模なデータセットには `fetchmany()` の使用を検討してください。
:::

**例**

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> all_rows = cursor.fetchall()
>>> print(len(all_rows))  # Number of total rows
```

***


#### `fetchmany` \{#dbapi-fetchmany\}

クエリ結果から複数行を取得します。

**構文**

```python
fetchmany(size=1)
```

**パラメーター**

| Parameter | Type | Default | Description                                 |
| --------- | ---- | ------- | ------------------------------------------- |
| `size`    | int  | `1`     | 取得する行数。指定しない場合は cursor.arraysize の値が使用されます。 |

**戻り値**

| Return Type | Description     |
| ----------- | --------------- |
| `list`      | 取得した行を表すタプルのリスト |

**送出される例外**

| Exception                                              | Condition                  |
| ------------------------------------------------------ | -------------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 事前に execute() が呼び出されていない場合 |

**使用例**

```pycon
>>> cursor.execute("SELECT id, name FROM users")
>>> rows = cursor.fetchmany(3)
>>> print(rows)  # [(1, 'Alice'), (2, 'Bob'), (3, 'Charlie')]
```

***


#### `fetchone` \{#dbapi-fetchone\}

クエリ結果から次の行を取得します。

**構文**

```python
fetchone()
```

**戻り値**

| 戻り値の型           | 説明                                   |
| --------------- | ------------------------------------ |
| `tuple or None` | 次の行をタプルとして返す。利用可能な行がない場合は `None` を返す |

**発生する例外**

| 例外                                                     | 条件                           |
| ------------------------------------------------------ | ---------------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | 事前に `execute()` が呼び出されていない場合 |

**例**

```pycon
>>> cursor.execute("SELECT id, name FROM users LIMIT 3")
>>> row = cursor.fetchone()
>>> print(row)  # (1, 'Alice')
>>> row = cursor.fetchone()
>>> print(row)  # (2, 'Bob')
```

***


#### `max_stmt_length = 1024000` \{#max-stmt-length\}

[`executemany()`](#chdb-dbapi-cursors-cursor-executemany) によって生成されるステートメントの最大長。

デフォルト値は 1024000 です。

---

#### `mogrify` \{#mogrify\}

データベースに送信される正確なクエリ文字列を返します。

このメソッドは、パラメータ置換後の最終的な SQL クエリを表示し、
デバッグやログ出力の用途に役立ちます。

**構文**

```python
mogrify(query, args=None)
```

**パラメーター**

| Parameter | Type            | Default | Description                |
| --------- | --------------- | ------- | -------------------------- |
| `query`   | str             | *必須*    | パラメーター用プレースホルダーを含む SQL クエリ |
| `args`    | tuple/list/dict | `None`  | 置換に使用するパラメーター              |

**戻り値**

| Return Type | Description                 |
| ----------- | --------------------------- |
| `str`       | パラメーターが適用された最終的な SQL クエリ文字列 |

**例**

```pycon
>>> cur.mogrify("SELECT * FROM users WHERE id = ?", (123,))
"SELECT * FROM users WHERE id = 123"
```

:::note
このメソッドは、Psycopg が使用している DB-API 2.0 への拡張に準拠しています。
:::

***


#### `nextset` \{#nextset\}

次の結果セットに移動します（サポートされていません）。

**構文**

```python
nextset()
```

**戻り値**

| 戻り値の型  | 説明                                  |
| ------ | ----------------------------------- |
| `None` | 複数の結果セットはサポートされていないため、常に None を返します |

:::note
chDB/ClickHouse は、単一のクエリから複数の結果セットをサポートしていません。
このメソッドは DB-API 2.0 準拠のために提供されていますが、常に None を返します。
:::

***


#### `setinputsizes` \{#setinputsizes\}

パラメータの入力サイズを設定します（実際には何も行わない実装）。

**構文**

```python
setinputsizes(*args)
```

**パラメータ**

| Parameter | Type | Description    |
| --------- | ---- | -------------- |
| `*args`   | -    | 列サイズ指定（無視されます） |

:::note
このメソッド自体は何も行いませんが、DB-API 2.0 仕様で定められているため必要となります。
chDB は出力サイズの処理を内部で自動的に行います。
:::

***


#### `setoutputsizes` \{#setoutputsizes\}

出力列のサイズを設定します（実質的に何もしない実装です）。

**構文**

```python
setoutputsizes(*args)
```

**パラメータ**

| Parameter | Type | Description    |
| --------- | ---- | -------------- |
| `*args`   | -    | 列サイズ指定（無視されます） |

:::note
このメソッド自体は何も行いませんが、DB-API 2.0 仕様で定められているため必要となります。
chDB は出力サイズの処理を内部で自動的に行います。
:::

***


### エラークラス \{#error-classes\}

chdb データベース操作用の例外クラスです。

このモジュールは、Python Database API Specification v2.0 に従い、
chdb におけるデータベース関連エラーを処理するための完全な例外クラス階層を提供します。

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

各例外クラスは特定の種類のデータベースエラーを表します。

| Exception           | Description              |
| ------------------- | ------------------------ |
| `Warning`           | データベース操作中の致命的ではない警告      |
| `InterfaceError`    | データベースインターフェース自体に関する問題   |
| `DatabaseError`     | すべてのデータベース関連エラーの基底クラス    |
| `DataError`         | データ処理上の問題（無効な値、型エラーなど）   |
| `OperationalError`  | データベースの運用上の問題（接続、リソースなど） |
| `IntegrityError`    | 制約違反（外部キー、一意制約など）        |
| `InternalError`     | データベース内部エラーおよび破損状態       |
| `ProgrammingError`  | SQL 構文エラーおよび API の誤用     |
| `NotSupportedError` | サポートされていない機能または操作        |

:::note
これらの例外クラスは Python DB API 2.0 の仕様に準拠しており、
さまざまなデータベース操作に対して一貫したエラー処理を提供します。
:::

**関連項目**

* [Python Database API Specification v2.0](https://peps.python.org/pep-0249/)
* `chdb.dbapi.connections` - データベース接続管理
* `chdb.dbapi.cursors` - データベースカーソル操作

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

***


#### **exception** `chdb.dbapi.err.DataError` \{#chdb-dbapi-err-dataerror\}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

処理中のデータの問題が原因で発生するエラーに対して送出される例外です。

この例外は、次のような処理対象データに起因する問題により
データベース操作が失敗した場合に送出されます:

* ゼロによる除算
* 数値が許容範囲外である場合
* 不正な日付/時刻の値
* 文字列の切り詰めエラー
* 型変換の失敗
* カラム型に対して不正なデータ形式

**Raises**

| Exception                                | Condition          |
| ---------------------------------------- | ------------------ |
| [`DataError`](#chdb-dbapi-err-dataerror) | データの検証または処理が失敗した場合 |

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

***


#### **exception** `chdb.dbapi.err.DatabaseError` \{#chdb-dbapi-err-databaseerror\}

Bases: [`Error`](#chdb-dbapi-err-error)

データベースに関連するエラーに対して送出される例外です。

これは、すべてのデータベース関連エラーの基底クラスです。データベース操作の実行中に発生し、インターフェースではなくデータベース自体に起因するすべてのエラーを対象とします。

代表的なケースは次のとおりです。

- SQL 実行時のエラー
- データベース接続障害
- トランザクション関連の問題
- データベース固有の制約違反

:::note
これは、[`DataError`](#chdb-dbapi-err-dataerror)、[`OperationalError`](#chdb-dbapi-err-operationalerror) など、より特化したデータベースエラー型の親クラスとして機能します。
:::

---

#### **exception** `chdb.dbapi.err.Error` \{#chdb-dbapi-err-error\}

Bases: [`StandardError`](#chdb-dbapi-err-standarderror)

他のすべてのエラー例外（Warning を除く）の基底クラスとなる例外です。

これは、chdb におけるすべてのエラー例外（警告を除く）の基底クラスです。操作の正常な完了を妨げる、すべてのデータベースエラー状態の親クラスとして機能します。

:::note
この例外階層は、Python DB API 2.0 仕様に従っています。
:::

**See also**

* [`Warning`](#chdb-dbapi-err-warning) - 操作の完了を妨げない非致命的な警告用

#### **exception** `chdb.dbapi.err.IntegrityError` \{#chdb-dbapi-err-integrityerror\}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

データベースのリレーショナル整合性が損なわれた場合に送出される例外です。

この例外は、データベース操作が整合性制約に違反した場合に送出されます。たとえば、次のようなケースが含まれます。

* 外部キー制約違反
* 主キーまたは一意制約違反（重複キー）
* CHECK 制約違反
* NOT NULL 制約違反
* 参照整合性違反

**Raises**

| Exception                                          | Condition          |
| -------------------------------------------------- | ------------------ |
| [`IntegrityError`](#chdb-dbapi-err-integrityerror) | データベースの整合性制約違反時に送出 |

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

***


#### **exception** `chdb.dbapi.err.InterfaceError` \{#chdb-dbapi-err-interfaceerror\}

Bases: [`Error`](#chdb-dbapi-err-error)

データベース自体ではなく、データベースインターフェースに関連するエラーに対して送出される例外です。

この例外は、次のようなデータベースインターフェース実装上の問題がある場合に送出されます。

* 無効な接続パラメータ
* API の誤った使用（クローズ済み接続に対するメソッド呼び出し）
* インターフェースレベルでのプロトコルエラー
* モジュールのインポートまたは初期化の失敗

**送出される例外**

| 例外                                                 | 条件                               |
| -------------------------------------------------- | -------------------------------- |
| [`InterfaceError`](#chdb-dbapi-err-interfaceerror) | データベース操作とは無関係なインターフェースエラーが発生した場合 |

:::note
これらのエラーは通常、プログラミングエラーや設定ミスであり、
クライアントコードまたは設定を修正することで解決できます。
:::

***

#### **exception** `chdb.dbapi.err.InternalError` \{#chdb-dbapi-err-internalerror\}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

データベースで内部エラーが発生した際に送出される例外です。

この例外は、データベースシステムがアプリケーション起因ではない内部エラーに
遭遇した場合に送出されます。たとえば:

* 無効なカーソル状態（カーソルがもはや有効ではない）
* トランザクション状態の不整合（トランザクションが同期から外れている）
* データベース破損の問題
* 内部データ構造の破損
* システムレベルのデータベースエラー

**送出される例外**

| 例外                                               | 条件                   |
| ------------------------------------------------ | -------------------- |
| [`InternalError`](#chdb-dbapi-err-internalerror) | データベース内部の不整合が検出された場合 |

:::warning Warning
内部エラーは、データベース管理者の対応が必要となる重大な
データベース問題を示している可能性があります。これらのエラーは
通常、アプリケーションレベルでのリトライロジックでは回復できません。
:::

:::note
これらのエラーは一般的にアプリケーションの制御範囲外であり、
データベースの再起動や修復作業が必要になる場合があります。
:::

---

#### **exception** `chdb.dbapi.err.NotSupportedError` \{#chdb-dbapi-err-notsupportederror\}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

メソッドまたはデータベース API がサポートされていない場合に送出される例外です。

この例外は、アプリケーションが、現在のデータベース構成またはバージョンで
サポートされていないデータベース機能や API メソッドを使用しようとしたときに
送出されます。たとえば:

* トランザクションをサポートしない接続で `rollback()` を要求した場合
* データベースのバージョンでサポートされていない高度な SQL 機能の使用
* 現在のドライバーで実装されていないメソッドの呼び出し
* 無効化されているデータベース機能の使用を試みた場合

**送出される例外**

| 例外                                                       | 条件                      |
| -------------------------------------------------------- | ----------------------- |
| [`NotSupportedError`](#chdb-dbapi-err-notsupportederror) | 未サポートのデータベース機能にアクセスした場合 |

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
これらのエラーを回避するには、データベースのドキュメントとドライバーのサポート状況を確認してください。可能であれば、適切なフォールバック処理も検討してください。
:::

***


#### **exception** `chdb.dbapi.err.OperationalError` \{#chdb-dbapi-err-operationalerror\}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

データベースの操作に関連するエラーに対して送出される例外です。

この例外は、データベース操作中に発生し、必ずしもプログラマーの制御下にはないエラーに対して送出されます。例としては次のようなものがあります:

- データベースからの予期しない切断
- データベースサーバーが見つからない、または到達不能
- トランザクション処理の失敗
- 処理中のメモリ割り当てエラー
- ディスク容量またはその他リソースの枯渇
- データベースサーバー内部エラー
- 認証または認可の失敗

**送出される例外**

| 例外                                                 | 条件                               |
| -------------------------------------------------- | -------------------------------- |
| [`OperationalError`](#chdb-dbapi-err-operationalerror) | データベース操作が運用上の問題により失敗した場合 |

:::note
これらのエラーは一般的に一時的なものであり、操作をリトライするか、システムレベルの問題に対処することで解決する場合があります。
:::

:::warning 警告
一部の運用上のエラーは、管理者による対応が必要な重大なシステム障害を示している場合があります。
:::

---

#### **exception** `chdb.dbapi.err.ProgrammingError` \{#chdb-dbapi-err-programmingerror\}

Bases: [`DatabaseError`](#chdb-dbapi-err-databaseerror)

データベース操作におけるプログラミングエラーに対して送出される例外です。

この例外は、アプリケーションによるデータベースの利用方法にプログラミング上の誤りがある場合に送出されます。例としては次のようなものがあります:

* テーブルまたはカラムが見つからない
* 作成処理時に、テーブルまたはインデックスがすでに存在する
* ステートメント内のSQL構文エラー
* プリペアドステートメントで指定されたパラメーター数が不正
* 無効なSQL操作（例: 存在しないオブジェクトに対するDROP）
* データベースAPIメソッドの誤った使用方法

**Raises**

| Exception                                              | Condition                     |
| ------------------------------------------------------ | ----------------------------- |
| [`ProgrammingError`](#chdb-dbapi-err-programmingerror) | SQLステートメントまたはAPIの利用方法に誤りがある場合 |

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

chdb の操作に関連する例外。

これは、すべての chdb 関連の例外の基底クラスです。Python 組み込みの Exception クラスを継承しており、データベース操作における例外階層のルートとして機能します。

:::note
この例外クラスは、データベースの例外処理に関する Python DB API 2.0 仕様に準拠しています。
:::

---

#### **exception** `chdb.dbapi.err.Warning` \{#chdb-dbapi-err-warning\}

Bases: [`StandardError`](#chdb-dbapi-err-standarderror)

挿入時のデータ切り捨てなどの重要な警告に対してスローされる例外。

この例外は、データベース操作自体は完了したものの、アプリケーション側で注意喚起が必要な重要な警告が発生した場合にスローされます。一般的なシナリオとしては次のようなものがあります:

- 挿入時のデータ切り捨て
- 数値変換における精度の損失
- 文字セット変換に関する警告

:::note
これは、警告用例外に関する Python DB API 2.0 仕様に準拠しています。
:::

---

### モジュール定数 \{#module-constants\}

#### `chdb.dbapi.apilevel = '2.0'` \{#apilevel\}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

指定されたオブジェクトから新しい文字列オブジェクトを作成します。`encoding` または
`errors` が指定されている場合、そのオブジェクトはデータバッファを提供している必要があり、
そのバッファは指定されたエンコーディングおよびエラーハンドラーを使ってデコードされます。
それ以外の場合は、`object.__str__()`（定義されている場合）の結果、または
`repr(object)` を返します。

* `encoding` のデフォルトは ‘utf-8’ です。
* `errors` のデフォルトは ‘strict’ です。

***


#### `chdb.dbapi.threadsafety = 1` \{#threadsafety\}

```python
int([x]) -> integer
int(x, base=10) -> integer
```

数値または文字列を整数に変換します。引数が指定されない場合は 0 を返します。x が数値であれば、x.*&#95;int*&#95;() を返します。浮動小数点数の場合は 0 に向かって切り捨てます。

x が数値でない場合、または base が指定された場合、x は指定された基数の整数リテラルを表す文字列、bytes、または bytearray インスタンスである必要があります。リテラルの前には ‘+’ または ‘-’ を付けることができ、前後に空白を含めることもできます。基数のデフォルトは 10 です。有効な基数は 0 および 2〜36 です。基数 0 の場合は、その文字列を整数リテラルとして解釈し、表記から基数を判断します。

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

与えられたオブジェクトから新しい文字列オブジェクトを生成します。encoding または
errors が指定されている場合、オブジェクトはデータバッファを提供している必要があり、
そのバッファは指定されたエンコーディングとエラーハンドラーを用いてデコードされます。
それ以外の場合は、object.*&#95;str*&#95;()（定義されている場合）の戻り値、
または repr(object) を返します。
encoding のデフォルトは ‘utf-8’ です。
errors のデフォルトは ‘strict’ です。

***


### 型定数 \{#type-constants\}

#### `chdb.dbapi.STRING = frozenset({247, 253, 254})` \{#string-type\}

DB-API 2.0 の型比較用に拡張された frozenset です。

このクラスは frozenset を拡張して、DB-API 2.0 の型比較セマンティクスをサポートします。
これにより、個々の要素を等価演算子および非等価演算子の両方を使って
集合に対して柔軟に型チェックできるようにします。

STRING、BINARY、NUMBER などの型定数に対して使用され、
field&#95;type が単一の型値であるときに
「field&#95;type == STRING」のような比較を可能にします。

**使用例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.BINARY = frozenset({249, 250, 251, 252})` \{#binary-type\}

DB-API 2.0 の型比較のために拡張された frozenset です。

このクラスは frozenset を拡張して、DB-API 2.0 の型比較セマンティクスをサポートします。
個々の要素を、等価・非等価演算子の両方を用いて集合と比較できる柔軟な型チェックを可能にします。

これは STRING、BINARY、NUMBER などの型定数に対して使用され、
`field_type` が単一の型値である場合に `field_type == STRING` のような比較を行えるようにします。

**使用例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.NUMBER = frozenset({0, 1, 3, 4, 5, 8, 9, 13})` \{#number-type\}

DB-API 2.0 の型比較のために拡張された frozenset。

このクラスは frozenset を拡張して、DB-API 2.0 の型比較セマンティクスをサポートします。
個々の要素を、等価・非等価演算子の両方を用いて集合と比較できる柔軟な型チェックを可能にします。

これは STRING、BINARY、NUMBER などの型定数に対して使用され、
`field_type` が単一の型値である場合に `field_type == STRING` のような比較を行えるようにします。

**使用例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.DATE = frozenset({10, 14})` \{#date-type\}

DB-API 2.0 の型比較のために拡張された frozenset です。

このクラスは frozenset を拡張し、DB-API 2.0 の型比較セマンティクスをサポートします。
個々の要素に対し、等価演算子および非等価演算子の両方を用いた柔軟な型チェックを可能にします。

これは STRING、BINARY、NUMBER などの型定数に対して使用され、
`field_type` が単一の型値である場合に “field&#95;type == STRING” のような比較が
行えるようにします。

**使用例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.TIME = frozenset({11})` \{#time-type\}

DB-API 2.0 の型比較用に拡張された frozenset。

このクラスは frozenset を拡張し、DB-API 2.0 における型比較のセマンティクスをサポートします。
これにより、個々の要素を等価演算子および不等価演算子の両方を使って
集合に対して柔軟に型チェックを行えるようになります。

これは STRING、BINARY、NUMBER などの型定数に使用され、
`field_type` が単一の型値である場合に `field_type == STRING` のような
比較を可能にします。

**使用例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.TIMESTAMP = frozenset({7, 12})` \{#timestamp-type\}

DB-API 2.0 の型比較のために拡張された frozenset。

このクラスは frozenset を拡張し、DB-API 2.0 の型比較セマンティクスをサポートします。
個々の要素を等価演算子および不等価演算子の両方を使って集合と比較できる、
柔軟な型チェックを可能にします。

これは STRING、BINARY、NUMBER などの型定数に対して使用され、
`field_type` が単一の型値である場合に、`field_type == STRING` のような比較を
行えるようにします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```


#### `chdb.dbapi.DATETIME = frozenset({7, 12})` \{#datetime-type\}

DB-API 2.0 の型比較のために拡張された frozenset です。

このクラスは frozenset を拡張し、DB-API 2.0 の型比較セマンティクスをサポートします。
個々の要素を等価演算子および不等価演算子の両方を使って集合と比較できる、
柔軟な型チェックを可能にします。

これは STRING、BINARY、NUMBER などの型定数に対して使用され、
`field_type` が単一の型値である場合に、`field_type == STRING` のような比較を
行えるようにします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

***


#### `chdb.dbapi.ROWID = frozenset({})` \{#rowid-type\}

DB-API 2.0 の型比較のために拡張された frozenset。

このクラスは、DB-API 2.0 の型比較セマンティクスをサポートするために frozenset を拡張したものです。
これにより、個々の項目を、等価演算子および不等価演算子の両方を使用して
集合に対して柔軟に型チェックを行えるようになります。

これは STRING、BINARY、NUMBER などの型定数に対して使用され、
`field&#95;type` が単一の型値である場合に “field&#95;type == STRING” のような
比較を行えるようにします。

**例**

```pycon
>>> string_types = DBAPISet([FIELD_TYPE.STRING, FIELD_TYPE.VAR_STRING])
>>> FIELD_TYPE.STRING == string_types  # Returns True
>>> FIELD_TYPE.INT != string_types     # Returns True
>>> FIELD_TYPE.BLOB in string_types    # Returns False
```

**使用例**

基本的なクエリ例:

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

データ操作:

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

接続管理:

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

1. **接続管理**: 使用後は必ず接続とカーソルを閉じる
2. **コンテキストマネージャー**: 自動クリーンアップのために`with`文を使用する
3. **バッチ処理**: 大規模な結果セットには`fetchmany()`を使用する
4. **エラー処理**: データベース操作をtry-exceptブロックで囲む
5. **パラメータバインディング**: 可能な限りパラメータ化クエリを使用する
6. **メモリ管理**: 非常に大規模なデータセットでは`fetchall()`の使用を避ける

:::note

* chDBのDB-API 2.0インターフェースは、ほとんどのPythonデータベースツールと互換性がある
* このインターフェースはレベル1のスレッドセーフティを提供する（スレッドはモジュールを共有できるが、接続は共有できない）
* 接続文字列はchDBセッションと同じパラメータをサポートする
* すべての標準DB-API 2.0例外がサポートされている
  :::

:::warning 警告

* リソースリークを避けるため、必ずカーソルと接続を閉じる
* 大規模な結果セットはバッチで処理する
* パラメータバインディング構文はフォーマットスタイルに従う: `%s`
  :::


## ユーザー定義関数 (UDF) \{#user-defined-functions\}

chDB 向けのユーザー定義関数モジュール。

このモジュールは、chDB におけるユーザー定義関数 (UDF) の作成と管理のための機能を提供します。独自の Python 関数を定義し、それを SQL クエリから呼び出すことで、chDB の機能を拡張できます。

### `chdb.udf.chdb_udf` \{#chdb-udf\}

chDB の Python UDF（ユーザー定義関数）用デコレータ。

**構文**

```python
chdb.udf.chdb_udf(return_type='String')
```

**パラメータ**

| Parameter     | Type | Default    | Description                              |
| ------------- | ---- | ---------- | ---------------------------------------- |
| `return_type` | str  | `"String"` | 関数の戻り値の型。ClickHouse のデータ型のいずれかである必要があります |

**注意事項**

1. 関数はステートレスである必要があります。UDF のみがサポートされ、UDAF はサポートされません。
2. デフォルトの戻り値の型は String です。戻り値の型は ClickHouse のデータ型のいずれかである必要があります。
3. 関数は String 型（文字列型）の引数を受け取る必要があります。すべての引数は文字列です。
4. 関数は入力の各行に対して呼び出されます。
5. 関数は pure Python の関数である必要があります。使用するモジュールはすべてその関数内でインポートしてください。
6. 使用される Python インタープリタは、スクリプトの実行に使用されるものと同一です。

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

***


### `chdb.udf.generate_udf` \{#generate-udf\}

UDF の構成および実行スクリプトファイルを生成します。

この関数は、chDB の User Defined Function (UDF) に必要なファイルを作成します。

1. 入力データを処理する Python の実行スクリプト
2. UDF を ClickHouse に登録する XML 構成ファイル

**構文**

```python
chdb.udf.generate_udf(func_name, args, return_type, udf_body)
```

**パラメータ**

| パラメータ         | 型    | 説明                       |
| ------------- | ---- | ------------------------ |
| `func_name`   | str  | UDF 関数の名前                |
| `args`        | list | 関数の引数名のリスト               |
| `return_type` | str  | 関数の ClickHouse における戻り値型  |
| `udf_body`    | str  | UDF 関数の Python ソースコードの本体 |

:::note
この関数は通常 @chdb&#95;udf デコレータから呼び出されるものであり、ユーザーが直接呼び出すべきものではありません。
:::

***


## ユーティリティ \{#utilities\}

chDB 向けのユーティリティ関数およびヘルパー関数です。

このモジュールには、chDB を扱うための各種ユーティリティ関数が含まれており、
データ型推論、データ変換用ヘルパー、およびデバッグ用ユーティリティなどを提供します。

---

### `chdb.utils.convert_to_columnar` \{#convert-to-columnar\}

辞書のリストをカラム形式に変換します。

この関数は辞書のリストを受け取り、各キーがカラムに対応し、各値がそのカラムの値のリストとなる
辞書に変換します。辞書内で欠損している値は None として表現されます。

**構文**

```python
chdb.utils.convert_to_columnar(items: List[Dict[str, Any]]) → Dict[str, List[Any]]
```

**パラメーター**

| Parameter | Type                   | Description  |
| --------- | ---------------------- | ------------ |
| `items`   | `List[Dict[str, Any]]` | 変換する辞書のリストです |

**戻り値**

| Return Type            | Description                |
| ---------------------- | -------------------------- |
| `Dict[str, List[Any]]` | キーが列名、値が各列の値のリストである辞書を返します |

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

***


### `chdb.utils.flatten_dict` \{#flatten-dict\}

ネストされた辞書をフラット化します。

この関数はネストされた辞書を受け取り、セパレーターでネストされたキーを連結してフラット化します。
辞書のリストは JSON 文字列としてシリアライズされます。

**構文**

```python
chdb.utils.flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '_') → Dict[str, Any]
```

**パラメーター**

| パラメーター       | 型                | デフォルト | 説明                     |
| ------------ | ---------------- | ----- | ---------------------- |
| `d`          | `Dict[str, Any]` | *必須*  | フラット化する辞書              |
| `parent_key` | str              | `""`  | 各キーに前置するベースキー          |
| `sep`        | str              | `"_"` | 連結したキー間の区切り文字として使用する文字 |

**戻り値**

| 戻り値の型            | 説明         |
| ---------------- | ---------- |
| `Dict[str, Any]` | フラット化された辞書 |

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

***


### `chdb.utils.infer_data_type` \{#infer-data-type\}

値のリストに対して最も適したデータ型を推論します。

この関数は値のリストを調べ、そのリスト内のすべての値を表現できる
最も適切なデータ型を決定します。整数、符号なし整数、小数（decimal）、
および浮動小数点数型を考慮し、値がいずれの数値型でも表現できない場合、
またはすべての値が None の場合は「string」をデフォルトとして使用します。

**構文**

```python
chdb.utils.infer_data_type(values: List[Any]) → str
```

**パラメータ**

| Parameter | Type        | Description                 |
| --------- | ----------- | --------------------------- |
| `values`  | `List[Any]` | 解析する値のリスト。任意の型の値を含めることができます |

**戻り値**

| 戻り値の型 | 説明                                                                                                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `str` | 推論されたデータ型を表す文字列。返される可能性のある値は次のとおりです: 「int8」「int16」「int32」「int64」「int128」「int256」「uint8」「uint16」「uint32」「uint64」「uint128」「uint256」「decimal128」「decimal256」「float32」「float64」または「string」。 |

:::note

* リスト内のすべての値が None の場合、関数は「string」を返します。
* リスト内に 1 つでも文字列が含まれている場合、関数は直ちに「string」を返します。
* 関数は、数値がその範囲と精度に基づいて整数、小数（decimal）、または浮動小数点数として表現できると仮定します。
  :::

***


### `chdb.utils.infer_data_types` \{#infer-data-types\}

列指向データ構造の各列に対してデータ型を推論します。

この関数は各列内の値を分析し、データのサンプルに基づいて、
各列に最も適したデータ型を推論します。

**構文**

```python
chdb.utils.infer_data_types`(column_data: Dict[str, List[Any]], n_rows: int = 10000) → List[tuple]
```

**パラメータ**

| Parameter     | Type                   | Default    | Description         |
| ------------- | ---------------------- | ---------- | ------------------- |
| `column_data` | `Dict[str, List[Any]]` | *required* | キーが列名、値が列値のリストである辞書 |
| `n_rows`      | int                    | `10000`    | 型推論に使用するサンプリング行数    |

**戻り値**

| Return Type   | Description                   |
| ------------- | ----------------------------- |
| `List[tuple]` | 各要素が列名と推論されたデータ型を含むタプルから成るリスト |


## 抽象基底クラス \{#abstract-base-classes\}

### **class** `chdb.rwabc.PyReader`(data: Any)` \{#pyreader\}

基底クラス: `ABC`

```python
class chdb.rwabc.PyReader(data: Any)
```

***


#### **abstractmethod** `read` \{#read\}

指定された数の行を、与えられた列から読み取り、オブジェクトのリストを返します。
ここで各オブジェクトは、1 つの列に対する値の並びです。

```python
abstractmethod (col_names: List[str], count: int) → List[Any]
```

**パラメータ**

| パラメータ       | 型           | 説明         |
| ----------- | ----------- | ---------- |
| `col_names` | `List[str]` | 読み取る列名のリスト |
| `count`     | int         | 読み取る行数の上限  |

**戻り値**

| 戻り値の型       | 説明                    |
| ----------- | --------------------- |
| `List[Any]` | 各列に対応するシーケンスを要素とするリスト |


### **class** `chdb.rwabc.PyWriter` \{#pywriter\}

基底クラス: `ABC`

```python
class chdb.rwabc.PyWriter(col_names: List[str], types: List[type], data: Any)
```

***


#### **abstractmethod** finalize \{#finalize\}

ブロックから最終的なデータを組み立てて返します。サブクラスで必ず実装する必要があります。

```python
abstractmethod finalize() → bytes
```

**戻り値**

| 戻り値の型   | 説明              |
| ------- | --------------- |
| `bytes` | 最終的なシリアライズ済みデータ |

***


#### **abstractmethod** `write` \{#write\}

列データをブロックに保存します。サブクラスで実装する必要があります。

```python
abstractmethod write(col_names: List[str], columns: List[List[Any]]) → None
```

**パラメータ**

| Parameter   | Type              | Description                |
| ----------- | ----------------- | -------------------------- |
| `col_names` | `List[str]`       | 書き込み対象となる列名のリスト            |
| `columns`   | `List[List[Any]]` | 列データのリスト。各列は1つのリストとして表現される |


## 例外処理 \{#exception-handling\}

### **class** `chdb.ChdbError` \{#chdberror\}

Bases: `Exception`

chDB 関連のエラーに対する基底の例外クラスです。

この例外は、chDB のクエリ実行に失敗した場合やエラーが発生した場合に送出されます。標準の Python の Exception クラスを継承しており、基盤となる ClickHouse エンジンからのエラー情報を提供します。

例外メッセージには通常、ClickHouse からの詳細なエラー情報が含まれます。たとえば、構文エラー、型の不一致、テーブル／カラムの不足、その他のクエリ実行上の問題などです。

**変数**

| Variable | Type | Description            |
| -------- | ---- | ---------------------- |
| `args`   | -    | エラーメッセージおよび追加の引数を含むタプル |

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
この例外は、背後で動作する ClickHouse エンジンがエラーを報告した際に、
`chdb.query()` および関連関数によって自動的に送出されます。
失敗する可能性のあるクエリを実行する場合は、この例外を捕捉し、
アプリケーション内で適切なエラー処理を行ってください。
:::


## バージョン情報 \{#version-information\}

### `chdb.chdb_version = ('3', '6', '0')` \{#chdb-version\}

組み込みのイミュータブルなシーケンスです。

引数を指定しない場合、コンストラクターは空のタプルを返します。
`iterable` が指定された場合、タプルはそのイテラブルの要素から初期化されます。

引数がタプルである場合、戻り値は同一のオブジェクトになります。

---

### `chdb.engine_version = '25.5.2.1'` \{#engine-version\}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

指定されたオブジェクトから新しい文字列オブジェクトを作成します。`encoding` または
`errors` が指定された場合、そのオブジェクトは、指定されたエンコーディングとエラーハンドラーを使って
デコードされるデータバッファを公開している必要があります。
指定されていない場合は、object.*&#95;str*&#95;()（定義されていれば）の結果、
または repr(object) を返します。

* encoding のデフォルトは ‘utf-8’ です。
* errors のデフォルトは ‘strict’ です。

***


### `chdb.__version__ = '3.6.0'` \{#version\}

```python
str(object=’’) -> str
str(bytes_or_buffer[, encoding[, errors]]) -> str
```

指定されたオブジェクトから新しい文字列オブジェクトを作成します。`encoding` または
`errors` が指定された場合、そのオブジェクトは、指定されたエンコーディングとエラーハンドラーを使って
デコードされるデータバッファを公開している必要があります。
指定されていない場合は、object.*&#95;str*&#95;()（定義されていれば）の結果、
または repr(object) を返します。

* encoding のデフォルトは ‘utf-8’ です。
* errors のデフォルトは ‘strict’ です。
