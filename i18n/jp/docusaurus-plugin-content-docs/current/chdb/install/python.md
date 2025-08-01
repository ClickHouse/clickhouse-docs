---
title: 'Installing chDB for Python'
sidebar_label: 'Python'
slug: '/chdb/install/python'
description: 'How to install chDB for Python'
keywords:
- 'chdb'
- 'embedded'
- 'clickhouse-lite'
- 'python'
- 'install'
---




# chDB のインストール

## 必要条件 {#requirements}

macOS および Linux (x86_64 および ARM64) 上の Python 3.8+

## インストール {#install}

```bash
pip install chdb
```

## 使用法 {#usage}

CLI の例:

```python
python3 -m chdb [SQL] [OutputFormat]
```

```python
python3 -m chdb "SELECT 1, 'abc'" Pretty
```

Python ファイルの例:

```python
import chdb

res = chdb.query("SELECT 1, 'abc'", "CSV")
print(res, end="")
```

クエリは、任意の [サポートされているフォーマット](/interfaces/formats)や `Dataframe`、`Debug` を使用してデータを返すことができます。

## GitHub リポジトリ {#github-repository}

プロジェクトの GitHub リポジトリは [chdb-io/chdb](https://github.com/chdb-io/chdb) で見つけることができます。

## データ入力 {#data-input}

ディスク上およびメモリ内のデータ形式にアクセスするための以下のメソッドが利用可能です。

### ファイルクエリ (Parquet, CSV, JSON, Arrow, ORC と 60+ 形式) {#query-on-file-parquet-csv-json-arrow-orc-and-60}

SQL を実行し、希望の形式のデータを返すことができます。

```python
import chdb
res = chdb.query('select version()', 'Pretty'); print(res)
```

**Parquet または CSV で操作する**

```python

# tests/format_output.py にてさらに多くのデータ型フォーマットを参照
res = chdb.query('select * from file("data.parquet", Parquet)', 'JSON'); print(res)
res = chdb.query('select * from file("data.csv", CSV)', 'CSV');  print(res)
print(f"SQL が {res.rows_read()} 行を読み取り、{res.bytes_read()} バイト、経過時間 {res.elapsed()} 秒")
```

**Pandas DataFrame 出力**
```python

# https://clickhouse.com/docs/interfaces/formats にてさらに参照
chdb.query('select * from file("data.parquet", Parquet)', 'Dataframe')
```

### テーブルクエリ (Pandas DataFrame, Parquet ファイル/バイト, Arrow バイト) {#query-on-table-pandas-dataframe-parquet-filebytes-arrow-bytes}

**Pandas DataFrame でのクエリ**

```python
import chdb.dataframe as cdf
import pandas as pd

# 2 つの DataFrame を結合
df1 = pd.DataFrame({'a': [1, 2, 3], 'b': ["one", "two", "three"]})
df2 = pd.DataFrame({'c': [1, 2, 3], 'd': ["①", "②", "③"]})
ret_tbl = cdf.query(sql="select * from __tbl1__ t1 join __tbl2__ t2 on t1.a = t2.c",
                  tbl1=df1, tbl2=df2)
print(ret_tbl)

# DataFrame テーブルでのクエリ
print(ret_tbl.query('select b, sum(a) from __table__ group by b'))
```

### ステートフルセッションを使用したクエリ {#query-with-stateful-session}

 セッションは、クエリの状態を保持します。すべての DDL および DML 状態はディレクトリに保持されます。ディレクトリパスは引数として渡すことができます。渡されない場合、一時ディレクトリが作成されます。

パスが指定されていない場合、セッションオブジェクトが削除されると一時ディレクトリも削除されます。さもなければ、パスが保持されます。

デフォルトのデータベースは `_local` で、デフォルトのエンジンは `Memory` であるため、すべてのデータがメモリに保存されます。ディスクにデータを保存したい場合は、別のデータベースを作成する必要があります。

```python
from chdb import session as chs

## 一時セッションで DB、テーブル、ビューを作成し、セッション削除時に自動的にクリーンアップ
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

こちらも参照: [test_stateful.py](https://github.com/chdb-io/chdb/blob/main/tests/test_stateful.py).

### Python DB-API 2.0 を使用したクエリ {#query-with-python-db-api-20}

```python
import chdb.dbapi as dbapi
print("chdb ドライバーのバージョン: {0}".format(dbapi.get_client_info()))

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

chDB Python UDF (ユーザー定義関数) デコレーターについてのいくつかの注意点。
1. 関数はステートレスである必要があります。UDF のみがサポートされており、UDAF (ユーザー定義集計関数) はサポートされていません。
2. デフォルトの戻り値の型は String です。戻り値の型を変更したい場合は、引数として戻り値の型を渡すことができます。戻り値の型は [以下のいずれか](/sql-reference/data-types) にする必要があります。
3. 関数は String 型の引数を取る必要があります。入力が TabSeparated であるため、全ての引数は文字列となります。
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
5. 関数は純粋な Python 関数である必要があります。関数内で使用されるすべての Python モジュールをインポートする必要があります。
    ```python
    def func_use_json(arg):
        import json
        ...
    ```
6. 使用される Python インタープリターは、スクリプトを実行するのに使用されるものと同じです。`sys.executable` から取得できます。

こちらも参照: [test_udf.py](https://github.com/chdb-io/chdb/blob/main/tests/test_udf.py).

### Python テーブルエンジン {#python-table-engine}

### Pandas DataFrame でのクエリ {#query-on-pandas-dataframe}

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

### Arrow テーブルでのクエリ {#query-on-arrow-table}

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

### chdb.PyReader クラスインスタンスでのクエリ {#query-on-chdbpyreader-class-instance}

1. chdb.PyReader クラスを継承し、`read` メソッドを実装する必要があります。
2. `read` メソッドは次のようにするべきです:
    1. 列の最初の次元、行の二次元のリストを返すこと。列の順序は最初の引数 `col_names` と同じである必要があります。
    1. 読み取るデータがもうない場合は空のリストを返すこと。
    1. ステートフルであり、カーソルは `read` メソッド内で更新される必要があります。
3. オプションで `get_schema` メソッドを実装して、テーブルのスキーマを返すことができます。プロトタイプは `def get_schema(self) -> List[Tuple[str, str]]:` であり、戻り値は各タプルが列名と列型を含むタプルのリストです。列型は [以下のいずれか](/sql-reference/data-types) である必要があります。

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

こちらも参照: [test_query_py.py](https://github.com/chdb-io/chdb/blob/main/tests/test_query_py.py).

## 制限事項 {#limitations}

1. サポートされているカラム型: `pandas.Series`, `pyarrow.array`, `chdb.PyReader`
1. サポートされているデータ型: Int, UInt, Float, String, Date, DateTime, Decimal
1. Python オブジェクト型は String に変換されます
1. Pandas DataFrame のパフォーマンスは最高で、Arrow テーブルは PyReader よりも優れています

<br />

さらに多くの例については、[examples](https://github.com/chdb-io/chdb/tree/main/examples) と [tests](https://github.com/chdb-io/chdb/tree/main/tests) を参照してください。
