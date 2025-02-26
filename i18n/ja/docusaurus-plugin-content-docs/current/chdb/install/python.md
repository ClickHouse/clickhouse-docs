---
title: chDBのPython用インストール
sidebar_label: Python
slug: /chdb/install/python
description: Python用のchDBをインストールする方法
keywords: [chdb, 組み込み, clickhouse-lite, python, インストール]
---

# chDBのPython用インストール

## 要件 {#requirements}

macOSおよびLinux（x86_64およびARM64）でのPython 3.8以上

## インストール {#install}

```bash
pip install chdb
```

## 使用法 {#usage}

CLIの例:

```python
python3 -m chdb [SQL] [OutputFormat]
```

```python
python3 -m chdb "SELECT 1, 'abc'" Pretty
```

Pythonファイルの例:

```python
import chdb

res = chdb.query("SELECT 1, 'abc'", "CSV")
print(res, end="")
```

クエリは、任意の[サポートされているフォーマット](/interfaces/formats)および`Dataframe`、`Debug`を使用してデータを返すことができます。

## GitHubリポジトリ {#github-repository}

プロジェクトのGitHubリポジトリは[chdb-io/chdb](https://github.com/chdb-io/chdb)で見つけることができます。

## データ入力 {#data-input}

ディスク上およびメモリ内データフォーマットにアクセスするための以下のメソッドが利用可能です。

### ファイルのクエリ（Parquet、CSV、JSON、Arrow、ORC、60+） {#query-on-file-parquet-csv-json-arrow-orc-and-60}

SQLを実行し、必要な形式のデータを返すことができます。

```python
import chdb
res = chdb.query('select version()', 'Pretty'); print(res)
```

**ParquetまたはCSVでの作業**

```python
# tests/format_output.pyにおける他のデータタイプ形式を参照
res = chdb.query('select * from file("data.parquet", Parquet)', 'JSON'); print(res)
res = chdb.query('select * from file("data.csv", CSV)', 'CSV');  print(res)
print(f"SQLが読み取った行数: {res.rows_read()} 行, バイト数: {res.bytes_read()} バイト, 経過時間: {res.elapsed()} 秒")
```

**Pandas DataFrame出力**
```python
# https://clickhouse.com/docs/interfaces/formatsで更に確認
chdb.query('select * from file("data.parquet", Parquet)', 'Dataframe')
```

### テーブルのクエリ（Pandas DataFrame、Parquetファイル/バイト、Arrowバイト） {#query-on-table-pandas-dataframe-parquet-filebytes-arrow-bytes}

**Pandas DataFrameでのクエリ**

```python
import chdb.dataframe as cdf
import pandas as pd
# 2つのDataFrameを結合
df1 = pd.DataFrame({'a': [1, 2, 3], 'b': ["one", "two", "three"]})
df2 = pd.DataFrame({'c': [1, 2, 3], 'd': ["①", "②", "③"]})
ret_tbl = cdf.query(sql="select * from __tbl1__ t1 join __tbl2__ t2 on t1.a = t2.c",
                  tbl1=df1, tbl2=df2)
print(ret_tbl)
# DataFrameテーブルに対するクエリ
print(ret_tbl.query('select b, sum(a) from __table__ group by b'))
```

### ステートフルセッションによるクエリ {#query-with-stateful-session}

セッションはクエリの状態を保持します。すべてのDDLおよびDMLの状態はディレクトリに保持されます。ディレクトリパスは引数として渡すことができます。渡されない場合、一時ディレクトリが作成されます。

パスが指定されていない場合、一時ディレクトリはセッションオブジェクトが削除されるときに削除されます。そうでない場合、パスは保持されます。

デフォルトのデータベースは`_local`で、デフォルトエンジンは`Memory`です。これはすべてのデータがメモリに保存されることを意味します。ディスクにデータを保存したい場合は、別のデータベースを作成する必要があります。

```python
from chdb import session as chs

## 一時セッションでDB、テーブル、ビューを作成, セッション削除時に自動クリーンアップ。
sess = chs.Session()
sess.query("CREATE DATABASE IF NOT EXISTS db_xxx ENGINE = Atomic")
sess.query("CREATE TABLE IF NOT EXISTS db_xxx.log_table_xxx (x String, y Int) ENGINE = Log;")
sess.query("INSERT INTO db_xxx.log_table_xxx VALUES ('a', 1), ('b', 3), ('c', 2), ('d', 5);")
sess.query(
    "CREATE VIEW db_xxx.view_xxx AS SELECT * FROM db_xxx.log_table_xxx LIMIT 4;"
)
print("ビューからの選択:\n")
print(sess.query("SELECT * FROM db_xxx.view_xxx", "Pretty"))
```

詳細はこちら: [test_stateful.py](https://github.com/chdb-io/chdb/blob/main/tests/test_stateful.py)。

### Python DB-API 2.0によるクエリ {#query-with-python-db-api-20}

```python
import chdb.dbapi as dbapi
print("chdbドライババージョン: {0}".format(dbapi.get_client_info()))

conn1 = dbapi.connect()
cur1 = conn1.cursor()
cur1.execute('select version()')
print("説明: ", cur1.description)
print("データ: ", cur1.fetchone())
cur1.close()
conn1.close()
```

### UDF（ユーザー定義関数）によるクエリ {#query-with-udf-user-defined-functions}

```python
from chdb.udf import chdb_udf
from chdb import query

@chdb_udf()
def sum_udf(lhs, rhs):
    return int(lhs) + int(rhs)

print(query("select sum_udf(12,22)"))
```

chDB Python UDF（ユーザー定義関数）デコレーターに関する注意事項:
1. 関数はステートレスであるべきです。UDFのみがサポートされており、UDAF（ユーザー定義集約関数）はサポートされていません。
2. デフォルトの返り値タイプはStringです。返り値の型を変更したい場合は、引数として返り値の型を渡すことができます。返り値の型は[以下のいずれか](/sql-reference/data-types)である必要があります。
3. 関数はStringタイプの引数を受け入れるべきです。入力がTabSeparatedであるため、すべての引数は文字列です。
4. 関数は各入力行ごとに呼び出されます。例:
    ```python
    def sum_udf(lhs, rhs):
        return int(lhs) + int(rhs)

    for line in sys.stdin:
        args = line.strip().split('\t')
        lhs = args[0]
        rhs = args[1]
        print(sum_udf(lhs, rhs))
        sys.stdout.flush()
    ```
5. 関数は純粋なPython関数である必要があります。関数内で使用されるすべてのPythonモジュールを**インポート**するべきです。
    ```python
    def func_use_json(arg):
        import json
        ...
    ```
6. 使用されるPythonインタープリターはスクリプトを実行するために使用されるものと同じです。`sys.executable`から取得できます。

詳細はこちら: [test_udf.py](https://github.com/chdb-io/chdb/blob/main/tests/test_udf.py)。

### Pythonテーブルエンジン {#python-table-engine}

### Pandas DataFrameでのクエリ {#query-on-pandas-dataframe}

```python
import chdb
import pandas as pd
df = pd.DataFrame(
    {
        "a": [1, 2, 3, 4, 5, 6],
        "b": ["tom", "jerry", "auxten", "tom", "jerry", "auxten"],
    }
)

chdb.query("SELECT b, sum(a) FROM Python(df) GROUP BY b ORDER BY b").show()
```

### Arrowテーブルでのクエリ {#query-on-arrow-table}

```python
import chdb
import pyarrow as pa
arrow_table = pa.table(
    {
        "a": [1, 2, 3, 4, 5, 6],
        "b": ["tom", "jerry", "auxten", "tom", "jerry", "auxten"],
    }
)

chdb.query(
    "SELECT b, sum(a) FROM Python(arrow_table) GROUP BY b ORDER BY b", "debug"
).show()
```

### chdb.PyReaderクラスインスタンスでのクエリ {#query-on-chdbpyreader-class-instance}

1. chdb.PyReaderクラスから継承し、`read`メソッドを実装する必要があります。
2. `read`メソッドは以下のことを行う必要があります:
    1. 列の最初の次元が列、行の次元が行であるリストのリストを返し、列の順序は`read`の最初の引数`col_names`と同じであること。
    2. 読むデータがもうないときは空のリストを返すこと。
    3. ステートフルであり、カーソルは`read`メソッド内で更新されること。
3. テーブルのスキーマを返すために任意の`get_schema`メソッドを実装することができます。プロトタイプは`def get_schema(self) -> List[Tuple[str, str]]:`です。返り値はタプルのリストで、各タプルには列名と列型が含まれます。列型は[以下のいずれか](/sql-reference/data-types)であるべきです。

<br />

```python
import chdb

class myReader(chdb.PyReader):
    def __init__(self, data):
        self.data = data
        self.cursor = 0
        super().__init__(data)

    def read(self, col_names, count):
        print("Python func read", col_names, count, self.cursor)
        if self.cursor >= len(self.data["a"]):
            return []
        block = [self.data[col] for col in col_names]
        self.cursor += len(block[0])
        return block

reader = myReader(
    {
        "a": [1, 2, 3, 4, 5, 6],
        "b": ["tom", "jerry", "auxten", "tom", "jerry", "auxten"],
    }
)

chdb.query(
    "SELECT b, sum(a) FROM Python(reader) GROUP BY b ORDER BY b"
).show()
```

詳細はこちら: [test_query_py.py](https://github.com/chdb-io/chdb/blob/main/tests/test_query_py.py)。

## 制限事項 {#limitations}

1. サポートされる列型: `pandas.Series`, `pyarrow.array`, `chdb.PyReader`
1. サポートされるデータ型: Int, UInt, Float, String, Date, DateTime, Decimal
1. Pythonオブジェクト型はStringに変換されます。
1. Pandas DataFrameのパフォーマンスは最高であり、ArrowテーブルはPyReaderよりも優れています。

<br />

さらに例を見たい場合は、[examples](https://github.com/chdb-io/chdb/tree/main/examples)および[test](https://github.com/chdb-io/chdb/tree/main/tests)を参照してください。
