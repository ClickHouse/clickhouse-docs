---
title: 'Фабричные методы DataStore'
sidebar_label: 'Фабричные методы'
slug: /chdb/datastore/factory-methods
description: 'Создание экземпляров DataStore из файлов, баз данных, облачных хранилищ и озёр данных'
keywords: ['chdb', 'datastore', 'factory', 'from_file', 'from_s3', 'uri', 'mysql', 'postgresql']
doc_type: 'reference'
---

# Фабричные методы DataStore \{#datastore-factory-methods\}

DataStore предоставляет более 20 фабричных методов для создания экземпляров DataStore на основе различных источников данных, включая локальные файлы, базы данных, облачное хранилище и озера данных.

## Универсальный интерфейс URI \{#uri\}

Метод `uri()` — рекомендуемая универсальная точка входа, автоматически определяющая тип источника:

```python
from chdb.datastore import DataStore

# Local files
ds = DataStore.uri("data.csv")
ds = DataStore.uri("/path/to/data.parquet")

# Cloud storage
ds = DataStore.uri("s3://bucket/data.parquet?nosign=true")
ds = DataStore.uri("https://example.com/data.csv")

# Databases
ds = DataStore.uri("mysql://user:pass@host:3306/db/table")
ds = DataStore.uri("postgresql://user:pass@host:5432/db/table")
```


### Справочник по синтаксису URI \{#uri-syntax\}

| Тип источника | Формат URI | Пример |
|-------------|------------|---------|
| Локальный файл | `path/to/file` | `data.csv`, `/abs/path/data.parquet` |
| S3 | `s3://bucket/path` | `s3://mybucket/data.parquet?nosign=true` |
| GCS | `gs://bucket/path` | `gs://mybucket/data.csv` |
| Azure | `az://container/path` | `az://mycontainer/data.parquet` |
| HTTP/HTTPS | `https://url` | `https://example.com/data.csv` |
| MySQL | `mysql://user:pass@host:port/db/table` | `mysql://root:pass@localhost:3306/mydb/users` |
| PostgreSQL | `postgresql://user:pass@host:port/db/table` | `postgresql://postgres:pass@localhost:5432/mydb/users` |
| SQLite | `sqlite:///path?table=name` | `sqlite:///data.db?table=users` |
| ClickHouse | `clickhouse://host:port/db/table` | `clickhouse://localhost:9000/default/hits` |

---

## Файловые источники \{#file-sources\}

### `from_file` \{#from-file\}

Создаёт объект DataStore из локального или удалённого файла с автоматическим определением формата.

```python
DataStore.from_file(path, format=None, compression=None, **kwargs)
```

**Параметры:**

| Параметр      | Тип | По умолчанию | Описание                                               |
| ------------- | --- | ------------ | ------------------------------------------------------ |
| `path`        | str | *обязателен* | Путь к файлу (локальный путь или URL)                  |
| `format`      | str | `None`       | Формат файла (определяется автоматически, если `None`) |
| `compression` | str | `None`       | Тип сжатия (определяется автоматически, если `None`)   |

**Поддерживаемые форматы:** CSV, TSV, Parquet, JSON, JSONLines, ORC, Avro, Arrow

**Примеры:**

```python
from chdb.datastore import DataStore

# Auto-detect format from extension
ds = DataStore.from_file("data.csv")
ds = DataStore.from_file("data.parquet")
ds = DataStore.from_file("data.json")

# Explicit format
ds = DataStore.from_file("data.txt", format="CSV")

# With compression
ds = DataStore.from_file("data.csv.gz", compression="gzip")
```


### Функции чтения, совместимые с Pandas \{#pandas-read\}

```python
from chdb import datastore as pd

# CSV files
ds = pd.read_csv("data.csv")
ds = pd.read_csv("data.csv", sep=";", header=0, nrows=1000)

# Parquet files (recommended for large datasets)
ds = pd.read_parquet("data.parquet")
ds = pd.read_parquet("data.parquet", columns=['col1', 'col2'])

# JSON files
ds = pd.read_json("data.json")
ds = pd.read_json("data.jsonl", lines=True)

# Excel files
ds = pd.read_excel("data.xlsx", sheet_name="Sheet1")
```

***


## Облачное хранилище \{#cloud-storage\}

### `from_s3` \{#from-s3\}

Создаёт DataStore на основе Amazon S3.

```python
DataStore.from_s3(url, access_key_id=None, secret_access_key=None, format=None, **kwargs)
```

**Параметры:**

| Параметр            | Тип | Значение по умолчанию | Описание                                  |
| ------------------- | --- | --------------------- | ----------------------------------------- |
| `url`               | str | *обязателен*          | S3 URL (s3://bucket/path)                 |
| `access_key_id`     | str | `None`                | Идентификатор ключа доступа AWS           |
| `secret_access_key` | str | `None`                | Секретный ключ доступа AWS                |
| `format`            | str | `None`                | Формат файла (определяется автоматически) |

**Примеры:**

```python
from chdb.datastore import DataStore

# Anonymous access (public bucket)
ds = DataStore.from_s3("s3://bucket/data.parquet")

# With credentials
ds = DataStore.from_s3(
    "s3://bucket/data.parquet",
    access_key_id="AKIAIOSFODNN7EXAMPLE",
    secret_access_key="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
)

# Using URI with query parameters
ds = DataStore.uri("s3://bucket/data.parquet?nosign=true")
ds = DataStore.uri("s3://bucket/data.parquet?access_key_id=KEY&secret_access_key=SECRET")
```


### `from_gcs` \{#from-gcs\}

Создаёт DataStore из Google Cloud Storage.

```python
DataStore.from_gcs(url, credentials_path=None, **kwargs)
```

**Примеры:**

```python
ds = DataStore.from_gcs("gs://bucket/data.parquet")
ds = DataStore.from_gcs("gs://bucket/data.parquet", credentials_path="/path/to/creds.json")
```


### `from_azure` \{#from-azure\}

Создаёт DataStore из Azure Blob Storage.

```python
DataStore.from_azure(url, account_name=None, account_key=None, **kwargs)
```

**Примеры:**

```python
ds = DataStore.from_azure(
    "az://container/data.parquet",
    account_name="myaccount",
    account_key="mykey"
)
```


### `from_hdfs` \{#from-hdfs\}

Создаёт DataStore из HDFS.

```python
DataStore.from_hdfs(url, **kwargs)
```

**Примеры:**

```python
ds = DataStore.from_hdfs("hdfs://namenode:8020/path/data.parquet")
```


### `from_url` \{#from-url\}

Создаёт экземпляр DataStore из HTTP/HTTPS URL.

```python
DataStore.from_url(url, format=None, **kwargs)
```

**Примеры:**

```python
ds = DataStore.from_url("https://example.com/data.csv")
ds = DataStore.from_url("https://raw.githubusercontent.com/user/repo/main/data.parquet")
```

***


## Базы данных \{#databases\}

### `from_mysql` \{#from-mysql\}

Создаёт DataStore из базы данных MySQL.

```python
DataStore.from_mysql(host, database, table, user, password, port=3306, **kwargs)
```

**Параметры:**

| Параметр   | Тип | Значение по умолчанию | Описание         |
| ---------- | --- | --------------------- | ---------------- |
| `host`     | str | *обязателен*          | Хост MySQL       |
| `database` | str | *обязателен*          | Имя базы данных  |
| `table`    | str | *обязателен*          | Имя таблицы      |
| `user`     | str | *обязателен*          | Имя пользователя |
| `password` | str | *обязателен*          | Пароль           |
| `port`     | int | `3306`                | Номер порта      |

**Примеры:**

```python
ds = DataStore.from_mysql(
    host="localhost",
    database="mydb",
    table="users",
    user="root",
    password="password"
)

# Using URI
ds = DataStore.uri("mysql://root:password@localhost:3306/mydb/users")
```


### `from_postgresql` \{#from-postgresql\}

Создаёт объект DataStore из базы данных PostgreSQL.

```python
DataStore.from_postgresql(host, database, table, user, password, port=5432, **kwargs)
```

**Примеры:**

```python
ds = DataStore.from_postgresql(
    host="localhost",
    database="mydb",
    table="users",
    user="postgres",
    password="password"
)

# Using URI
ds = DataStore.uri("postgresql://postgres:password@localhost:5432/mydb/users")
```


### `from_clickhouse` \{#from-clickhouse\}

Создать DataStore на основе сервера ClickHouse.

```python
DataStore.from_clickhouse(host, database, table, user=None, password=None, port=9000, **kwargs)
```

**Примеры:**

```python
ds = DataStore.from_clickhouse(
    host="localhost",
    database="default",
    table="hits",
    user="default",
    password=""
)

# Connection-level mode (explore databases)
ds = DataStore.from_clickhouse(
    host="analytics.company.com",
    user="analyst",
    password="secret"
)
ds.databases()                  # List databases
ds.tables("production")         # List tables
result = ds.sql("SELECT * FROM production.users LIMIT 10")
```


### `from_mongodb` \{#from-mongodb\}

Создает DataStore на основе MongoDB.

```python
DataStore.from_mongodb(uri, database, collection, **kwargs)
```

**Примеры:**

```python
ds = DataStore.from_mongodb(
    uri="mongodb://localhost:27017",
    database="mydb",
    collection="users"
)
```


### `from_sqlite` \{#from-sqlite\}

Создаёт DataStore на основе базы данных SQLite.

```python
DataStore.from_sqlite(database_path, table, **kwargs)
```

**Примеры:**

```python
ds = DataStore.from_sqlite("data.db", table="users")

# Using URI
ds = DataStore.uri("sqlite:///data.db?table=users")
```

***


## Озера данных \{#data-lakes\}

### `from_iceberg` \{#from-iceberg\}

Создает DataStore из таблицы Apache Iceberg.

```python
DataStore.from_iceberg(path, **kwargs)
```

**Примеры:**

```python
ds = DataStore.from_iceberg("/path/to/iceberg_table")
ds = DataStore.uri("iceberg://catalog/namespace/table")
```


### `from_delta` \{#from-delta\}

Создаёт объект DataStore из таблицы Delta Lake.

```python
DataStore.from_delta(path, **kwargs)
```

**Примеры:**

```python
ds = DataStore.from_delta("/path/to/delta_table")
ds = DataStore.uri("deltalake:///path/to/delta_table")
```


### `from_hudi` \{#from-hudi\}

Создает DataStore из таблицы Apache Hudi.

```python
DataStore.from_hudi(path, **kwargs)
```

**Примеры:**

```python
ds = DataStore.from_hudi("/path/to/hudi_table")
ds = DataStore.uri("hudi:///path/to/hudi_table")
```

***


## Источники в оперативной памяти \{#in-memory\}

### `from_df` / `from_dataframe` \{#from-df\}

Создаёт объект DataStore из pandas DataFrame.

```python
DataStore.from_df(df, name=None)
DataStore.from_dataframe(df, name=None)  # alias
```

**Примеры:**

```python
import pandas
from chdb.datastore import DataStore

pdf = pandas.DataFrame({'a': [1, 2, 3], 'b': ['x', 'y', 'z']})
ds = DataStore.from_df(pdf)
```


### `DataFrame` Constructor \{#dataframe-constructor\}

Создание DataStore с помощью конструктора, аналогичного pandas.

```python
from chdb import datastore as pd

# From dictionary
ds = pd.DataFrame({
    'name': ['Alice', 'Bob'],
    'age': [25, 30]
})

# From pandas DataFrame
import pandas
pdf = pandas.DataFrame({'a': [1, 2, 3]})
ds = pd.DataFrame(pdf)
```

***


## Специальные источники \{#special-sources\}

### `from_numbers` \{#from-numbers\}

Создаёт DataStore с последовательными числами (удобно для тестирования).

```python
DataStore.from_numbers(count, **kwargs)
```

**Примеры:**

```python
ds = DataStore.from_numbers(1000000)  # 1M rows with 'number' column
result = ds.filter(ds['number'] % 2 == 0).head(10)  # Even numbers
```


### `from_random` \{#from-random\}

Создает DataStore со случайными данными.

```python
DataStore.from_random(rows, columns, **kwargs)
```

**Примеры:**

```python
ds = DataStore.from_random(rows=1000, columns=5)
```


### `run_sql` \{#run-sql\}

Создает DataStore из исходного SQL-запроса.

```python
DataStore.run_sql(query)
```

**Примеры:**

```python
ds = DataStore.run_sql("""
    SELECT number, number * 2 as doubled
    FROM numbers(100)
    WHERE number % 10 = 0
""")
```

***


## Сводная таблица \{#summary\}

| Метод | Тип источника | Пример |
|--------|-------------|---------|
| `uri()` | Универсальный | `DataStore.uri("s3://bucket/data.parquet")` |
| `from_file()` | Локальные/удалённые файлы | `DataStore.from_file("data.csv")` |
| `read_csv()` | Файлы CSV | `pd.read_csv("data.csv")` |
| `read_parquet()` | Файлы Parquet | `pd.read_parquet("data.parquet")` |
| `from_s3()` | Amazon S3 | `DataStore.from_s3("s3://bucket/path")` |
| `from_gcs()` | Google Cloud Storage | `DataStore.from_gcs("gs://bucket/path")` |
| `from_azure()` | Azure Blob | `DataStore.from_azure("az://container/path")` |
| `from_hdfs()` | HDFS | `DataStore.from_hdfs("hdfs://host/path")` |
| `from_url()` | HTTP/HTTPS | `DataStore.from_url("https://example.com/data.csv")` |
| `from_mysql()` | MySQL | `DataStore.from_mysql(host, db, table, user, pass)` |
| `from_postgresql()` | PostgreSQL | `DataStore.from_postgresql(host, db, table, user, pass)` |
| `from_clickhouse()` | ClickHouse | `DataStore.from_clickhouse(host, db, table)` |
| `from_mongodb()` | MongoDB | `DataStore.from_mongodb(uri, db, collection)` |
| `from_sqlite()` | SQLite | `DataStore.from_sqlite("data.db", table)` |
| `from_iceberg()` | Apache Iceberg | `DataStore.from_iceberg("/path/to/table")` |
| `from_delta()` | Delta Lake | `DataStore.from_delta("/path/to/table")` |
| `from_hudi()` | Apache Hudi | `DataStore.from_hudi("/path/to/table")` |
| `from_df()` | DataFrame библиотеки pandas | `DataStore.from_df(pandas_df)` |
| `DataFrame()` | словарь/DataFrame | `pd.DataFrame({'a': [1, 2, 3]})` |
| `from_numbers()` | Последовательные числа | `DataStore.from_numbers(1000000)` |
| `from_random()` | Случайные данные | `DataStore.from_random(rows=1000, columns=5)` |
| `run_sql()` | Сырой SQL | `DataStore.run_sql("SELECT * FROM ...")` |