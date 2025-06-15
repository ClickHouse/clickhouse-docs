---
title: 'Installing chDB for Python'
sidebar_label: 'Python'
slug: /chdb/install/python
description: 'How to install chDB for Python'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'install']
---

# Installing chDB for Python

## Requirements {#requirements}

Python 3.8+ on macOS and Linux (x86_64 and ARM64)

## Install {#install}

```bash
pip install chdb
```

## Usage {#usage}

CLI example:

```python
python3 -m chdb [SQL] [OutputFormat]
```

```python
python3 -m chdb "SELECT 1, 'abc'" Pretty
```

Python file example:

```python
import chdb

res = chdb.query("SELECT 1, 'abc'", "CSV")
print(res, end="")
```

Queries can return data using any [supported format](/interfaces/formats) as well as `Dataframe` and `Debug`.

## GitHub repository {#github-repository}

You can find the GitHub repository for the project at [chdb-io/chdb](https://github.com/chdb-io/chdb).

## Data Input {#data-input}

The following methods are available to access on-disk and in-memory data formats:

### Query On File (Parquet, CSV, JSON, Arrow, ORC and 60+) {#query-on-file-parquet-csv-json-arrow-orc-and-60}

You can execute SQL and return desired format data.

```python
import chdb
res = chdb.query('select version()', 'Pretty'); print(res)
```

**Work with Parquet or CSV**

```python
# See more data type format in tests/format_output.py
res = chdb.query('select * from file("data.parquet", Parquet)', 'JSON'); print(res)
res = chdb.query('select * from file("data.csv", CSV)', 'CSV');  print(res)
print(f"SQL read {res.rows_read()} rows, {res.bytes_read()} bytes, elapsed {res.elapsed()} seconds")
```

**Pandas DataFrame output**
```python
# See more in https://clickhouse.com/docs/interfaces/formats
chdb.query('select * from file("data.parquet", Parquet)', 'Dataframe')
```

### Query on table (Pandas DataFrame, Parquet file/bytes, Arrow bytes) {#query-on-table-pandas-dataframe-parquet-filebytes-arrow-bytes}

**Query On Pandas DataFrame**

```python
import chdb.dataframe as cdf
import pandas as pd
# Join 2 DataFrames
df1 = pd.DataFrame({'a': [1, 2, 3], 'b': ["one", "two", "three"]})
df2 = pd.DataFrame({'c': [1, 2, 3], 'd': ["①", "②", "③"]})
ret_tbl = cdf.query(sql="select * from __tbl1__ t1 join __tbl2__ t2 on t1.a = t2.c",
                  tbl1=df1, tbl2=df2)
print(ret_tbl)
# Query on the DataFrame Table
print(ret_tbl.query('select b, sum(a) from __table__ group by b'))
```

### Query with stateful session {#query-with-stateful-session}

 Sessions will keep the state of query. All DDL and DML state will be kept in a directory. Directory path can be passed in as an argument. If it is not passed, a temporary directory will be created.

If the path is not specified, the temporary directory will be deleted when the Session object is deleted. Otherwise, the path will be kept.

Note that the default database is `_local` and the default engine is `Memory` which means all data will be stored in memory. If you want to store data in disk, you should create another database.

```python
from chdb import session as chs

## Create DB, Table, View in temp session, auto cleanup when session is deleted.
sess = chs.Session()
sess.query("CREATE DATABASE IF NOT EXISTS db_xxx ENGINE = Atomic")
sess.query("CREATE TABLE IF NOT EXISTS db_xxx.log_table_xxx (x String, y Int) ENGINE = Log;")
sess.query("INSERT INTO db_xxx.log_table_xxx VALUES ('a', 1), ('b', 3), ('c', 2), ('d', 5);")
sess.query(
    "CREATE VIEW db_xxx.view_xxx AS SELECT * FROM db_xxx.log_table_xxx LIMIT 4;"
)
print("Select from view:\n")
print(sess.query("SELECT * FROM db_xxx.view_xxx", "Pretty"))
```

See also: [test_stateful.py](https://github.com/chdb-io/chdb/blob/main/tests/test_stateful.py).

### Query with Python DB-API 2.0 {#query-with-python-db-api-20}

```python
import chdb.dbapi as dbapi
print("chdb driver version: {0}".format(dbapi.get_client_info()))

conn1 = dbapi.connect()
cur1 = conn1.cursor()
cur1.execute('select version()')
print("description: ", cur1.description)
print("data: ", cur1.fetchone())
cur1.close()
conn1.close()
```

### Query with UDF (User Defined Functions) {#query-with-udf-user-defined-functions}

```python
from chdb.udf import chdb_udf
from chdb import query

@chdb_udf()
def sum_udf(lhs, rhs):
    return int(lhs) + int(rhs)

print(query("select sum_udf(12,22)"))
```

Some notes on the chDB Python UDF (User Defined Function) decorator.
1. The function should be stateless. Only UDFs are supported, not UDAFs (User Defined Aggregation Function).
2. Default return type is String. If you want to change the return type, you can pass in the return type as an argument. The return type should be one of [the following](/sql-reference/data-types).
3. The function should take in arguments of type String. As the input is TabSeparated, all arguments are strings.
4. The function will be called for each line of input. Example:
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
5. The function should be a pure Python function. You should import all Python modules used **inside the function**.
    ```python
    def func_use_json(arg):
        import json
        ...
    ```
6. The Python interpreter used is the same as the one used to run the script. You can get it from `sys.executable`.

see also: [test_udf.py](https://github.com/chdb-io/chdb/blob/main/tests/test_udf.py).

### Python table engine {#python-table-engine}

### Query on Pandas DataFrame {#query-on-pandas-dataframe}

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

### Query on Arrow Table {#query-on-arrow-table}

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

### Query on chdb.PyReader class instance {#query-on-chdbpyreader-class-instance}

1. You must inherit from chdb.PyReader class and implement the `read` method.
2. The `read` method should:
    1. return a list of lists, the first dimension is the column, the second dimension is the row, the columns order should be the same as the first arg `col_names` of `read`.
    1. return an empty list when there is no more data to read.
    1. be stateful, the cursor should be updated in the `read` method.
3. An optional `get_schema` method can be implemented to return the schema of the table. The prototype is `def get_schema(self) -> List[Tuple[str, str]]:`, the return value is a list of tuples, each tuple contains the column name and the column type. The column type should be one of [the following](/sql-reference/data-types).

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

See also: [test_query_py.py](https://github.com/chdb-io/chdb/blob/main/tests/test_query_py.py).

## Limitations {#limitations}

1. Column types supported: `pandas.Series`, `pyarrow.array`,`chdb.PyReader`
1. Data types supported: Int, UInt, Float, String, Date, DateTime, Decimal
1. Python Object type will be converted to String
1. Pandas DataFrame performance is all of the best, Arrow Table is better than PyReader

<br />

For more examples, see [examples](https://github.com/chdb-io/chdb/tree/main/examples) and [tests](https://github.com/chdb-io/chdb/tree/main/tests).

