---
title: 'Установка chDB для Python'
sidebar_label: 'Python'
slug: /chdb/install/python
description: 'Как установить chDB для Python'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'install']
---


# Установка chDB для Python

## Требования {#requirements}

Python 3.8+ на macOS и Linux (x86_64 и ARM64)

## Установка {#install}

```bash
pip install chdb
```

## Использование {#usage}

Пример CLI:

```python
python3 -m chdb [SQL] [OutputFormat]
```

```python
python3 -m chdb "SELECT 1, 'abc'" Pretty
```

Пример файла на Python:

```python
import chdb

res = chdb.query("SELECT 1, 'abc'", "CSV")
print(res, end="")
```

Запросы могут возвращать данные в любом [поддерживаемом формате](/interfaces/formats), а также в формате `Dataframe` и `Debug`.

## Репозиторий на GitHub {#github-repository}

Вы можете найти репозиторий GitHub для проекта по адресу [chdb-io/chdb](https://github.com/chdb-io/chdb).

## Ввод данных {#data-input}

Доступные методы для работы с форматами данных на диске и в памяти:

### Запрос на файле (Parquet, CSV, JSON, Arrow, ORC и 60+) {#query-on-file-parquet-csv-json-arrow-orc-and-60}

Вы можете выполнять SQL запросы и возвращать данные в нужном формате.

```python
import chdb
res = chdb.query('select version()', 'Pretty'); print(res)
```

**Работа с Parquet или CSV**

```python

# Смотрите больше форматов типов данных в tests/format_output.py
res = chdb.query('select * from file("data.parquet", Parquet)', 'JSON'); print(res)
res = chdb.query('select * from file("data.csv", CSV)', 'CSV'); print(res)
print(f"SQL прочитано {res.rows_read()} строк, {res.bytes_read()} байт, затраченное время {res.elapsed()} секунд")
```

**Вывод в формате Pandas DataFrame**
```python

# Смотрите больше информации в https://clickhouse.com/docs/interfaces/formats
chdb.query('select * from file("data.parquet", Parquet)', 'Dataframe')
```

### Запрос на таблице (Pandas DataFrame, Parquet файл/байты, Arrow байты) {#query-on-table-pandas-dataframe-parquet-filebytes-arrow-bytes}

**Запрос на Pandas DataFrame**

```python
import chdb.dataframe as cdf
import pandas as pd

# Объединить 2 DataFrames
df1 = pd.DataFrame({'a': [1, 2, 3], 'b': ["one", "two", "three"]})
df2 = pd.DataFrame({'c': [1, 2, 3], 'd': ["①", "②", "③"]})
ret_tbl = cdf.query(sql="select * from __tbl1__ t1 join __tbl2__ t2 on t1.a = t2.c",
                  tbl1=df1, tbl2=df2)
print(ret_tbl)

# Запрос на таблице DataFrame
print(ret_tbl.query('select b, sum(a) from __table__ group by b'))
```

### Запрос с состоянием сеанса {#query-with-stateful-session}

Сессии сохранят состояние запроса. Все состояния DDL и DML будут храниться в каталоге. Путь к каталогу можно передать в качестве аргумента. Если он не передан, будет создан временный каталог.

Если путь не указан, временный каталог будет удален, когда объект Session будет удален. В противном случае путь будет сохранен.

Обратите внимание, что база данных по умолчанию - это `_local`, а движок по умолчанию - `Memory`, что означает, что все данные будут храниться в памяти. Если вы хотите хранить данные на диске, вам следует создать другую базу данных.

```python
from chdb import session as chs

## Создать БД, Таблицу, Вид в временной сессии, автоматическая очистка при удалении сессии.
sess = chs.Session()
sess.query("CREATE DATABASE IF NOT EXISTS db_xxx ENGINE = Atomic")
sess.query("CREATE TABLE IF NOT EXISTS db_xxx.log_table_xxx (x String, y Int) ENGINE = Log;")
sess.query("INSERT INTO db_xxx.log_table_xxx VALUES ('a', 1), ('b', 3), ('c', 2), ('d', 5);")
sess.query(
    "CREATE VIEW db_xxx.view_xxx AS SELECT * FROM db_xxx.log_table_xxx LIMIT 4;"
)
print("Выбор из вида:\n")
print(sess.query("SELECT * FROM db_xxx.view_xxx", "Pretty"))
```

Смотрите также: [test_stateful.py](https://github.com/chdb-io/chdb/blob/main/tests/test_stateful.py).

### Запрос с Python DB-API 2.0 {#query-with-python-db-api-20}

```python
import chdb.dbapi as dbapi
print("версия драйвера chdb: {0}".format(dbapi.get_client_info()))

conn1 = dbapi.connect()
cur1 = conn1.cursor()
cur1.execute('select version()')
print("описание: ", cur1.description)
print("данные: ", cur1.fetchone())
cur1.close()
conn1.close()
```

### Запрос с UDF (Пользовательские Определенные Функции) {#query-with-udf-user-defined-functions}

```python
from chdb.udf import chdb_udf
from chdb import query

@chdb_udf()
def sum_udf(lhs, rhs):
    return int(lhs) + int(rhs)

print(query("select sum_udf(12,22)"))
```

Некоторые примечания по декоратору UDF (Пользовательская Определенная Функция) для chDB.
1. Функция должна быть статeless. Поддерживаются только UDF, не UDAF (Пользовательские Определенные Агрегатные Функции).
2. Тип возвращаемого значения по умолчанию - String. Если вы хотите изменить тип возвращаемого значения, вы можете передать его в качестве аргумента. Тип возвращаемого значения должен быть одним из [следующих](/sql-reference/data-types).
3. Функция должна принимать аргументы типа String. Поскольку входной формат - TabSeparated, все аргументы строковые.
4. Функция будет вызываться для каждой строки ввода. Например:
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
5. Функция должна быть чистой функцией Python. Вы должны импортировать все модули Python, используемые **внутри функции**.
    ```python
    def func_use_json(arg):
        import json
        ...
    ```
6. Используемый интерпретатор Python такой же, как и тот, который использовался для запуска скрипта. Вы можете получить его из `sys.executable`.

Смотрите также: [test_udf.py](https://github.com/chdb-io/chdb/blob/main/tests/test_udf.py).

### Движок таблиц Python {#python-table-engine}

### Запрос на Pandas DataFrame {#query-on-pandas-dataframe}

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

### Запрос на Arrow Table {#query-on-arrow-table}

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

### Запрос на экземпляре класса chdb.PyReader {#query-on-chdbpyreader-class-instance}

1. Вы должны унаследовать класс chdb.PyReader и реализовать метод `read`.
2. Метод `read` должен:
    1. возвращать список списков, первая размерность - колонка, вторая - строка, порядок колонок должен быть таким же, как и первый аргумент `col_names` метода `read`.
    1. возвращать пустой список, когда больше нет данных для чтения.
    1. быть stateful, курсор должен обновляться в методе `read`.
3. Необязательный метод `get_schema` может быть реализован для возврата схемы таблицы. Прототип: `def get_schema(self) -> List[Tuple[str, str]]:`, значение, возвращаемое функцией, - это список кортежей, каждый из которых содержит имя колонки и тип колонки. Тип колонки должен быть одним из [следующих](/sql-reference/data-types).

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

Смотрите также: [test_query_py.py](https://github.com/chdb-io/chdb/blob/main/tests/test_query_py.py).

## Ограничения {#limitations}

1. Поддерживаемые типы колонок: `pandas.Series`, `pyarrow.array`, `chdb.PyReader`
1. Поддерживаемые типы данных: Int, UInt, Float, String, Date, DateTime, Decimal
1. Тип объекта Python будет преобразован в String
1. Производительность Pandas DataFrame лучшая, Arrow Table лучше, чем PyReader

<br />

Для получения дополнительных примеров смотрите [examples](https://github.com/chdb-io/chdb/tree/main/examples) и [tests](https://github.com/chdb-io/chdb/tree/main/tests).
