---
title: 'chDBのPythonインストール'
sidebar_label: 'Python'
slug: /chdb/install/python
description: 'chDBをPythonにインストールする方法'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'install']
---


# chDBのPythonインストール

## 要件 {#requirements}

macOSおよびLinux (x86_64およびARM64) 用のPython 3.8+

## インストール {#install}

```bash
pip install chdb
```

## 使用法 {#usage}

CLIの例:

```python
python3 -m chdb [SQL] [出力形式]
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

クエリは、任意の [サポートされた形式](/interfaces/formats) とともにデータを返すことができます。また、`Dataframe` と `Debug` も使用できます。

## GitHubリポジトリ {#github-repository}

プロジェクトのGitHubリポジトリは [chdb-io/chdb](https://github.com/chdb-io/chdb) で見つけることができます。

## データ入力 {#data-input}

次のメソッドを使用して、オンディスクおよびインメモリデータ形式にアクセスできます。

### ファイル上のクエリ (Parquet, CSV, JSON, Arrow, ORC など60種類以上) {#query-on-file-parquet-csv-json-arrow-orc-and-60}

SQLを実行し、希望する形式のデータを返すことができます。

```python
import chdb
res = chdb.query('select version()', 'Pretty'); print(res)
```

**ParquetまたはCSVで作業する**

```python

# tests/format_output.pyでデータ型形式の詳細を確認してください
res = chdb.query('select * from file("data.parquet", Parquet)', 'JSON'); print(res)
res = chdb.query('select * from file("data.csv", CSV)', 'CSV');  print(res)
print(f"SQLで読み取った行: {res.rows_read()} 行, {res.bytes_read()} バイト, 経過時間: {res.elapsed()} 秒")
```

**Pandas DataFrame出力**
```python

# 詳細については https://clickhouse.com/docs/interfaces/formats を参照してください
chdb.query('select * from file("data.parquet", Parquet)', 'Dataframe')
```

### テーブル上のクエリ (Pandas DataFrame, Parquetファイル/バイト, Arrowバイト) {#query-on-table-pandas-dataframe-parquet-filebytes-arrow-bytes}

**Pandas DataFrameでのクエリ**

```python
import chdb.dataframe as cdf
import pandas as pd

# 2つのDataFrameを結合する
df1 = pd.DataFrame({'a': [1, 2, 3], 'b': ["one", "two", "three"]})
df2 = pd.DataFrame({'c': [1, 2, 3], 'd': ["①", "②", "③"]})
ret_tbl = cdf.query(sql="select * from __tbl1__ t1 join __tbl2__ t2 on t1.a = t2.c",
                  tbl1=df1, tbl2=df2)
print(ret_tbl)

# DataFrameテーブル上でのクエリ
print(ret_tbl.query('select b, sum(a) from __table__ group by b'))
```

### 状態を保持するセッションでのクエリ {#query-with-stateful-session}

セッションはクエリの状態を保持します。すべてのDDLおよびDML状態はディレクトリに保持されます。ディレクトリのパスは引数として渡すことができます。渡されない場合は、一時ディレクトリが作成されます。

パスが指定されない場合、一時ディレクトリはSessionオブジェクトが削除される際に削除されます。そうでなければ、パスは保持されます。

デフォルトのデータベースは`_local`で、デフォルトエンジンは`Memory`です。これにより、すべてのデータがメモリ内に保存されます。ディスクにデータを保存したい場合は、別のデータベースを作成する必要があります。

```python
from chdb import session as chs

## 一時セッションでDB、テーブル、ビューを作成し、セッションが削除されると自動的にクリーンアップされます。
sess = chs.Session()
sess.query("CREATE DATABASE IF NOT EXISTS db_xxx ENGINE = Atomic")
sess.query("CREATE TABLE IF NOT EXISTS db_xxx.log_table_xxx (x String, y Int) ENGINE = Log;")
sess.query("INSERT INTO db_xxx.log_table_xxx VALUES ('a', 1), ('b', 3), ('c', 2), ('d', 5);")
sess.query(
    "CREATE VIEW db_xxx.view_xxx AS SELECT * FROM db_xxx.log_table_xxx LIMIT 4;"
)
print("ビューから選択:\n")
print(sess.query("SELECT * FROM db_xxx.view_xxx", "Pretty"))
```

詳細は [test_stateful.py](https://github.com/chdb-io/chdb/blob/main/tests/test_stateful.py) を参照してください。

### Python DB-API 2.0を使用したクエリ {#query-with-python-db-api-20}

```python
import chdb.dbapi as dbapi
print("chdbドライバーバージョン: {0}".format(dbapi.get_client_info()))

conn1 = dbapi.connect()
cur1 = conn1.cursor()
cur1.execute('select version()')
print("説明: ", cur1.description)
print("データ: ", cur1.fetchone())
cur1.close()
conn1.close()
```

### UDF (ユーザー定義関数) を使用したクエリ {#query-with-udf-user-defined-functions}

```python
from chdb.udf import chdb_udf
from chdb import query

@chdb_udf()
def sum_udf(lhs, rhs):
    return int(lhs) + int(rhs)

print(query("select sum_udf(12,22)"))
```

chDB Python UDF（ユーザー定義関数）デコレーターに関するいくつかの注意点。
1. 関数はステートレスである必要があります。UDFのみがサポートされており、UDAF（ユーザー定義集約関数）はサポートされていません。
2. デフォルトの戻り値の型はStringです。戻り値の型を変更したい場合は、引数として返す型を渡すことができます。戻り値の型は次のいずれかである必要があります [以下](/sql-reference/data-types)。
3. 関数はString型の引数を受け取る必要があります。入力がTabSeparatedであるため、すべての引数は文字列です。
4. 関数は各入力行に対して呼び出されます。例:
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
5. 関数は純粋なPython関数である必要があります。使用するすべてのPythonモジュールは**関数内で**インポートする必要があります。
    ```python
    def func_use_json(arg):
        import json
        ...
    ```
6. 使用されるPythonインタプリタは、スクリプトを実行するために使用されるものと同じです。`sys.executable`から取得できます。

詳細は [test_udf.py](https://github.com/chdb-io/chdb/blob/main/tests/test_udf.py) を参照してください。

### Pythonテーブルエンジン {#python-table-engine}

### Pandas DataFrame上のクエリ {#query-on-pandas-dataframe}

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

### Arrowテーブル上のクエリ {#query-on-arrow-table}

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

### chdb.PyReaderクラスインスタンス上のクエリ {#query-on-chdbpyreader-class-instance}

1. chdb.PyReaderクラスを継承し、`read`メソッドを実装する必要があります。
2. `read`メソッドは次のようにする必要があります:
    1. リストのリストを返し、最初の次元はカラム、2番目の次元は行とします。カラムの順序は`read`の最初の引数`col_names`と同じである必要があります。
    2. 読み取るデータがなくなった場合は空のリストを返します。
    3. ステートフルである必要があります。カーソルは`read`メソッド内で更新される必要があります。
3. オプションの`get_schema`メソッドを実装して、テーブルのスキーマを返すことができます。プロトタイプは`def get_schema(self) -> List[Tuple[str, str]]:`であり、返り値はタプルのリストです。各タプルにはカラム名とカラム型が含まれています。カラム型は次のいずれかである必要があります [以下](/sql-reference/data-types)。

<br />

```python
import chdb

class myReader(chdb.PyReader):
    def __init__(self, data):
        self.data = data
        self.cursor = 0
        super().__init__(data)

    def read(self, col_names, count):
        print("Python関数が読み込む", col_names, count, self.cursor)
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

詳細は [test_query_py.py](https://github.com/chdb-io/chdb/blob/main/tests/test_query_py.py) を参照してください。

## 制限事項 {#limitations}

1. サポートされているカラム型: `pandas.Series`, `pyarrow.array`, `chdb.PyReader`
1. サポートされているデータ型: Int, UInt, Float, String, Date, DateTime, Decimal
1. Pythonオブジェクト型はStringに変換されます
1. Pandas DataFrameのパフォーマンスは最も良好で、ArrowテーブルはPyReaderよりも優れています

<br />

詳細な例については [examples](https://github.com/chdb-io/chdb/tree/main/examples) および [tests](https://github.com/chdb-io/chdb/tree/main/tests) をご覧ください。
