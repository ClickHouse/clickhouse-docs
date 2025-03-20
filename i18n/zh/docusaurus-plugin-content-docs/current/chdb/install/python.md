---
title: '安装 chDB for Python'
sidebar_label: 'Python'
slug: /chdb/install/python
description: '如何安装 chDB for Python'
keywords: ['chdb', '嵌入式', 'clickhouse-lite', 'python', '安装']
---


# 安装 chDB for Python

## 要求 {#requirements}

在 macOS 和 Linux (x86_64 和 ARM64) 上需要 Python 3.8+

## 安装 {#install}

```bash
pip install chdb
```

## 使用 {#usage}

CLI 示例:

```python
python3 -m chdb [SQL] [OutputFormat]
```

```python
python3 -m chdb "SELECT 1, 'abc'" Pretty
```

Python 文件示例:

```python
import chdb

res = chdb.query("SELECT 1, 'abc'", "CSV")
print(res, end="")
```

查询可以使用任何 [支持的格式](/interfaces/formats) 返回数据，也可以返回 `Dataframe` 和 `Debug`。

## GitHub 仓库 {#github-repository}

您可以在 [chdb-io/chdb](https://github.com/chdb-io/chdb) 找到该项目的 GitHub 仓库。

## 数据输入 {#data-input}

以下方法可用于访问磁盘和内存中的数据格式：

### 在文件上查询 (Parquet, CSV, JSON, Arrow, ORC 及 60+ 其他格式) {#query-on-file-parquet-csv-json-arrow-orc-and-60}

您可以执行 SQL 并返回所需格式的数据。

```python
import chdb
res = chdb.query('select version()', 'Pretty'); print(res)
```

**处理 Parquet 或 CSV**

```python

# 在 tests/format_output.py 中查看更多数据类型格式
res = chdb.query('select * from file("data.parquet", Parquet)', 'JSON'); print(res)
res = chdb.query('select * from file("data.csv", CSV)', 'CSV');  print(res)
print(f"SQL read {res.rows_read()} rows, {res.bytes_read()} bytes, elapsed {res.elapsed()} seconds")
```

**Pandas DataFrame 输出**
```python

# 请查看 https://clickhouse.com/docs/interfaces/formats
chdb.query('select * from file("data.parquet", Parquet)', 'Dataframe')
```

### 在表上查询 (Pandas DataFrame, Parquet 文件/字节, Arrow 字节) {#query-on-table-pandas-dataframe-parquet-filebytes-arrow-bytes}

**在 Pandas DataFrame 上查询**

```python
import chdb.dataframe as cdf
import pandas as pd

# 合并 2 个 DataFrame
df1 = pd.DataFrame({'a': [1, 2, 3], 'b': ["one", "two", "three"]})
df2 = pd.DataFrame({'c': [1, 2, 3], 'd': ["①", "②", "③"]})
ret_tbl = cdf.query(sql="select * from __tbl1__ t1 join __tbl2__ t2 on t1.a = t2.c",
                  tbl1=df1, tbl2=df2)
print(ret_tbl)

# 在 DataFrame 表上查询
print(ret_tbl.query('select b, sum(a) from __table__ group by b'))
```

### 使用有状态会话查询 {#query-with-stateful-session}

会话将保持查询的状态。所有 DDL 和 DML 状态将保存在一个目录中。可以将目录路径作为参数传入。如果未传入，将创建一个临时目录。

如果未指定路径，当会话对象被删除时，临时目录将被删除。否则，将保留该路径。

注意，默认数据库是 `_local`，默认引擎是 `Memory`，这意味着所有数据将存储在内存中。如果您想将数据存储在磁盘中，应该创建另一个数据库。

```python
from chdb import session as chs

## 在临时会话中创建数据库、表、视图，删除会话时自动清理。
sess = chs.Session()
sess.query("CREATE DATABASE IF NOT EXISTS db_xxx ENGINE = Atomic")
sess.query("CREATE TABLE IF NOT EXISTS db_xxx.log_table_xxx (x String, y Int) ENGINE = Log;")
sess.query("INSERT INTO db_xxx.log_table_xxx VALUES ('a', 1), ('b', 3), ('c', 2), ('d', 5);")
sess.query(
    "CREATE VIEW db_xxx.view_xxx AS SELECT * FROM db_xxx.log_table_xxx LIMIT 4;"
)
print("从视图中选择:\n")
print(sess.query("SELECT * FROM db_xxx.view_xxx", "Pretty"))
```

另请参见: [test_stateful.py](https://github.com/chdb-io/chdb/blob/main/tests/test_stateful.py)。

### 使用 Python DB-API 2.0 查询 {#query-with-python-db-api-20}

```python
import chdb.dbapi as dbapi
print("chdb 驱动版本: {0}".format(dbapi.get_client_info()))

conn1 = dbapi.connect()
cur1 = conn1.cursor()
cur1.execute('select version()')
print("描述: ", cur1.description)
print("数据: ", cur1.fetchone())
cur1.close()
conn1.close()
```

### 使用 UDF (用户定义函数) 查询 {#query-with-udf-user-defined-functions}

```python
from chdb.udf import chdb_udf
from chdb import query

@chdb_udf()
def sum_udf(lhs, rhs):
    return int(lhs) + int(rhs)

print(query("select sum_udf(12,22)"))
```

关于 chDB Python UDF (用户定义函数) 装饰器的一些说明。
1. 该函数应为无状态。仅支持 UDF，不支持 UDAF (用户定义聚合函数)。
2. 默认返回类型为字符串。如果您想更改返回类型，可以将其作为参数传入。返回类型应为 [以下类型之一](/sql-reference/data-types)。
3. 该函数应接受字符串类型的参数。由于输入为 TabSeparated，所有参数均为字符串。
4. 该函数将对每行输入进行调用。示例:
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
5. 该函数应为纯 Python 函数。您应导入所有在 **函数内部** 使用的 Python 模块。
    ```python
    def func_use_json(arg):
        import json
        ...
    ```
6. 使用的 Python 解释器与运行脚本时使用的解释器相同。您可以通过 `sys.executable` 获取它。

另请参见: [test_udf.py](https://github.com/chdb-io/chdb/blob/main/tests/test_udf.py)。

### Python 表引擎 {#python-table-engine}

### 在 Pandas DataFrame 上查询 {#query-on-pandas-dataframe}

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

### 在 Arrow 表上查询 {#query-on-arrow-table}

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

### 在 chdb.PyReader 类实例上查询 {#query-on-chdbpyreader-class-instance}

1. 您必须从 chdb.PyReader 类继承并实现 `read` 方法。
2. `read` 方法应:
    1. 返回一个列表的列表，第一个维度为列，第二个维度为行，列的顺序应与 `read` 的第一个参数 `col_names` 相同。
    2. 当没有更多数据可读时，返回一个空列表。
    3. 是有状态的，游标应在 `read` 方法中更新。
3. 可以实现可选的 `get_schema` 方法来返回表的模式。原型为 `def get_schema(self) -> List[Tuple[str, str]]:`，返回值是一个元组的列表，每个元组包含列名和列类型。列类型应为 [以下类型之一](/sql-reference/data-types)。

<br />

```python
import chdb

class myReader(chdb.PyReader):
    def __init__(self, data):
        self.data = data
        self.cursor = 0
        super().__init__(data)

    def read(self, col_names, count):
        print("Python 函数读取", col_names, count, self.cursor)
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

另请参见: [test_query_py.py](https://github.com/chdb-io/chdb/blob/main/tests/test_query_py.py)。

## 限制 {#limitations}

1. 支持的列类型: `pandas.Series`, `pyarrow.array`, `chdb.PyReader`
1. 支持的数据类型: Int, UInt, Float, String, Date, DateTime, Decimal
1. Python 对象类型将被转换为字符串
1. Pandas DataFrame 性能最佳，Arrow 表优于 PyReader

<br />

有关更多示例，请参见 [examples](https://github.com/chdb-io/chdb/tree/main/examples) 和 [tests](https://github.com/chdb-io/chdb/tree/main/tests)。
