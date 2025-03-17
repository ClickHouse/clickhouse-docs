---
title: chDBのPython用インストール
sidebar_label: Python
slug: /chdb/install/python
description: chDBをPythonにインストールする方法
keywords: [chdb, 組み込み, clickhouse-lite, python, インストール]
---


# chDBのPython用インストール

## 要件 {#requirements}

macOSとLinux（x86_64およびARM64）のPython 3.8以降

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

クエリは、任意の [サポートされているフォーマット](/interfaces/formats) および `Dataframe` と `Debug` を使用してデータを返すことができます。

## GitHubリポジトリ {#github-repository}

プロジェクトのGitHubリポジトリは [chdb-io/chdb](https://github.com/chdb-io/chdb) で見つけることができます。

## データ入力 {#data-input}

ディスク上およびメモリ内データ形式にアクセスするための以下のメソッドが利用可能です:

### ファイル上のクエリ (Parquet, CSV, JSON, Arrow, ORC および 60+) {#query-on-file-parquet-csv-json-arrow-orc-and-60}

SQLを実行して、希望するフォーマットのデータを返すことができます。

```python
import chdb
res = chdb.query('select version()', 'Pretty'); print(res)
```

**Parquet または CSV で作業する**

```python

# tests/format_output.pyで他のデータタイプフォーマットを参照してください
res = chdb.query('select * from file("data.parquet", Parquet)', 'JSON'); print(res)
res = chdb.query('select * from file("data.csv", CSV)', 'CSV');  print(res)
print(f"SQLは{res.rows_read()}行、{res.bytes_read()}バイト、経過時間{res.elapsed()}秒を読み込みました")
```

**Pandas DataFrame出力**
```python

# 詳細は https://clickhouse.com/docs/interfaces/formats を参照してください
chdb.query('select * from file("data.parquet", Parquet)', 'Dataframe')
```

### テーブル上のクエリ (Pandas DataFrame, Parquetファイル/バイト, Arrowバイト) {#query-on-table-pandas-dataframe-parquet-filebytes-arrow-bytes}

**Pandas DataFrame上のクエリ**

```python
import chdb.dataframe as cdf
import pandas as pd

# 2つのDataFrameを結合する
df1 = pd.DataFrame({'a': [1, 2, 3], 'b': ["one", "two", "three"]})
df2 = pd.DataFrame({'c': [1, 2, 3], 'd': ["①", "②", "③"]})
ret_tbl = cdf.query(sql="select * from __tbl1__ t1 join __tbl2__ t2 on t1.a = t2.c",
                  tbl1=df1, tbl2=df2)
print(ret_tbl)

# DataFrameテーブル上のクエリ
print(ret_tbl.query('select b, sum(a) from __table__ group by b'))
```

### 状態を持つセッションでのクエリ {#query-with-stateful-session}

セッションはクエリの状態を保持します。すべてのDDLおよびDMLの状態はディレクトリに保持されます。ディレクトリパスは引数として渡すことができます。渡さない場合、テンポラリディレクトリが作成されます。

パスが指定されていない場合、セッションオブジェクトが削除されるとテンポラリディレクトリが削除されます。そうでない場合、パスは保持されます。

デフォルトのデータベースは`_local`で、デフォルトエンジンは`Memory`です。これはすべてのデータがメモリに格納されることを意味します。ディスクにデータを保存したい場合は、別のデータベースを作成する必要があります。

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

詳細を参照してください: [test_stateful.py](https://github.com/chdb-io/chdb/blob/main/tests/test_stateful.py)。

### Python DB-API 2.0でのクエリ {#query-with-python-db-api-20}

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

### UDF（ユーザー定義関数）でのクエリ {#query-with-udf-user-defined-functions}

```python
from chdb.udf import chdb_udf
from chdb import query

@chdb_udf()
def sum_udf(lhs, rhs):
    return int(lhs) + int(rhs)

print(query("select sum_udf(12,22)"))
```

chDB Python UDF（ユーザー定義関数）デコレーターに関する注意点:
1. 関数はステートレスである必要があります。UDFのみがサポートされ、UDAF（ユーザー定義集約関数）はサポートされていません。
2. デフォルトの返り値の型はStringです。返り値の型を変更したい場合は、引数として返り値の型を渡すことができます。返り値の型は [以下のいずれか](/sql-reference/data-types) である必要があります。
3. 関数はString型の引数を受け取る必要があります。入力はTabSeparatedのため、すべての引数は文字列です。
4. 関数は入力の各行に対して呼び出されます。例:
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
5. 関数は純粋なPython関数である必要があります。関数内で使用されるすべてのPythonモジュールをインポートする必要があります。
    ```python
    def func_use_json(arg):
        import json
        ...
    ```
6. 使用されるPythonインタプリタは、スクリプトを実行するために使用されるインタプリタと同じです。`sys.executable`から取得できます。

詳細を参照してください: [test_udf.py](https://github.com/chdb-io/chdb/blob/main/tests/test_udf.py)。

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

### chdb.PyReaderクラスのインスタンス上のクエリ {#query-on-chdbpyreader-class-instance}

1. chdb.PyReaderクラスを継承し、`read`メソッドを実装する必要があります。
2. `read`メソッドは:
    1. 列名`col_names`の最初の次元が列、2番目の次元が行となるリストのリストを返す必要があります。列の順序は`read`の最初の引数`col_names`と同じであるべきです。
    1. 読み取るデータがこれ以上ない場合は空のリストを返す必要があります。
    1. ステートフルでなければならず、カーソルは`read`メソッド内で更新されるべきです。
3. テーブルのスキーマを返すためにオプションの`get_schema`メソッドを実装できます。プロトタイプは`def get_schema(self) -> List[Tuple[str, str]]:`で、戻り値は列名と列型を含むタプルのリストです。列型は [以下のいずれか](/sql-reference/data-types) であるべきです。

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

詳細を参照してください: [test_query_py.py](https://github.com/chdb-io/chdb/blob/main/tests/test_query_py.py)。

## 制限事項 {#limitations}

1. サポートされているカラム型: `pandas.Series`, `pyarrow.array`, `chdb.PyReader`
1. サポートされているデータ型: Int, UInt, Float, String, Date, DateTime, Decimal
1. Pythonオブジェクト型はStringに変換されます
1. Pandas DataFrameのパフォーマンスはすべての中で最も良く、ArrowテーブルはPyReaderより優れています

<br />

さらなる例については [examples](https://github.com/chdb-io/chdb/tree/main/examples) および [tests](https://github.com/chdb-io/chdb/tree/main/tests) を参照してください。
