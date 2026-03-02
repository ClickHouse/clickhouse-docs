---
title: 'DataStore 工厂方法'
sidebar_label: '工厂方法'
slug: /chdb/datastore/factory-methods
description: '从文件、数据库、云存储和数据湖创建 DataStore 实例'
keywords: ['chdb', 'datastore', 'factory', 'from_file', 'from_s3', 'uri', 'mysql', 'postgresql']
doc_type: 'reference'
---

# DataStore 工厂方法 \{#datastore-factory-methods\}

DataStore 提供了超过 20 种工厂方法，可从本地文件、数据库、云存储和数据湖等多种数据源创建实例。

## 通用 URI 接口 \{#uri\}

`uri()` 方法是推荐的通用入口，它会自动检测数据源类型：

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


### URI 语法参考 \{#uri-syntax\}

| 数据源类型 | URI 格式 | 示例 |
|-------------|------------|---------|
| 本地文件 | `path/to/file` | `data.csv`, `/abs/path/data.parquet` |
| S3 | `s3://bucket/path` | `s3://mybucket/data.parquet?nosign=true` |
| GCS | `gs://bucket/path` | `gs://mybucket/data.csv` |
| Azure | `az://container/path` | `az://mycontainer/data.parquet` |
| HTTP/HTTPS | `https://url` | `https://example.com/data.csv` |
| MySQL | `mysql://user:pass@host:port/db/table` | `mysql://root:pass@localhost:3306/mydb/users` |
| PostgreSQL | `postgresql://user:pass@host:port/db/table` | `postgresql://postgres:pass@localhost:5432/mydb/users` |
| SQLite | `sqlite:///path?table=name` | `sqlite:///data.db?table=users` |
| ClickHouse | `clickhouse://host:port/db/table` | `clickhouse://localhost:9000/default/hits` |

---

## 文件来源 \{#file-sources\}

### `from_file` \{#from-file\}

从本地或远程文件创建 DataStore，并自动检测文件格式。

```python
DataStore.from_file(path, format=None, compression=None, **kwargs)
```

**参数：**

| 参数            | 类型  | 默认值    | 描述                 |
| ------------- | --- | ------ | ------------------ |
| `path`        | str | *必填*   | 文件路径（本地路径或 URL）    |
| `format`      | str | `None` | 文件格式（为 None 时自动检测） |
| `compression` | str | `None` | 压缩类型（为 None 时自动检测） |

**支持的格式：** CSV、TSV、Parquet、JSON、JSONLines、ORC、Avro、Arrow

**示例：**

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


### 与 Pandas 兼容的读取函数 \{#pandas-read\}

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


## Cloud 存储 \{#cloud-storage\}

### `from_s3` \{#from-s3\}

从 Amazon S3 创建 DataStore 实例。

```python
DataStore.from_s3(url, access_key_id=None, secret_access_key=None, format=None, **kwargs)
```

**参数：**

| 参数                  | 类型  | 默认值    | 描述                       |
| ------------------- | --- | ------ | ------------------------ |
| `url`               | str | *必需*   | S3 URL（s3://bucket/path） |
| `access_key_id`     | str | `None` | AWS 访问密钥 ID              |
| `secret_access_key` | str | `None` | AWS 秘密访问密钥               |
| `format`            | str | `None` | 文件格式（自动检测）               |

**示例：**

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

从 Google Cloud Storage 创建一个 DataStore 实例。

```python
DataStore.from_gcs(url, credentials_path=None, **kwargs)
```

**示例：**

```python
ds = DataStore.from_gcs("gs://bucket/data.parquet")
ds = DataStore.from_gcs("gs://bucket/data.parquet", credentials_path="/path/to/creds.json")
```


### `from_azure` \{#from-azure\}

从 Azure Blob Storage 创建 DataStore。

```python
DataStore.from_azure(url, account_name=None, account_key=None, **kwargs)
```

**示例：**

```python
ds = DataStore.from_azure(
    "az://container/data.parquet",
    account_name="myaccount",
    account_key="mykey"
)
```


### `from_hdfs` \{#from-hdfs\}

从 HDFS 创建一个 DataStore 实例。

```python
DataStore.from_hdfs(url, **kwargs)
```

**示例：**

```python
ds = DataStore.from_hdfs("hdfs://namenode:8020/path/data.parquet")
```


### `from_url` \{#from-url\}

通过 HTTP/HTTPS URL 创建 DataStore。

```python
DataStore.from_url(url, format=None, **kwargs)
```

**示例：**

```python
ds = DataStore.from_url("https://example.com/data.csv")
ds = DataStore.from_url("https://raw.githubusercontent.com/user/repo/main/data.parquet")
```

***


## 数据库 \{#databases\}

### `from_mysql` \{#from-mysql\}

从 MySQL 数据库创建一个 DataStore。

```python
DataStore.from_mysql(host, database, table, user, password, port=3306, **kwargs)
```

**参数：**

| 参数         | 类型  | 默认值    | 说明         |
| ---------- | --- | ------ | ---------- |
| `host`     | str | *必填*   | MySQL 主机地址 |
| `database` | str | *必填*   | 数据库名       |
| `table`    | str | *必填*   | 表名         |
| `user`     | str | *必填*   | 用户名        |
| `password` | str | *必填*   | 密码         |
| `port`     | int | `3306` | 端口号        |

**示例：**

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

从 PostgreSQL 数据库创建一个 DataStore 实例。

```python
DataStore.from_postgresql(host, database, table, user, password, port=5432, **kwargs)
```

**示例：**

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

基于 ClickHouse 服务器创建一个 DataStore。

```python
DataStore.from_clickhouse(host, database, table, user=None, password=None, port=9000, **kwargs)
```

**示例：**

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

基于 MongoDB 创建 DataStore。

```python
DataStore.from_mongodb(uri, database, collection, **kwargs)
```

**示例：**

```python
ds = DataStore.from_mongodb(
    uri="mongodb://localhost:27017",
    database="mydb",
    collection="users"
)
```


### `from_sqlite` \{#from-sqlite\}

基于 SQLite 数据库创建 DataStore。

```python
DataStore.from_sqlite(database_path, table, **kwargs)
```

**示例：**

```python
ds = DataStore.from_sqlite("data.db", table="users")

# Using URI
ds = DataStore.uri("sqlite:///data.db?table=users")
```

***


## 数据湖 \{#data-lakes\}

### `from_iceberg` \{#from-iceberg\}

基于 Apache Iceberg 表创建 DataStore。

```python
DataStore.from_iceberg(path, **kwargs)
```

**示例：**

```python
ds = DataStore.from_iceberg("/path/to/iceberg_table")
ds = DataStore.uri("iceberg://catalog/namespace/table")
```


### `from_delta` \{#from-delta\}

基于 Delta Lake 表创建 DataStore。

```python
DataStore.from_delta(path, **kwargs)
```

**示例：**

```python
ds = DataStore.from_delta("/path/to/delta_table")
ds = DataStore.uri("deltalake:///path/to/delta_table")
```


### `from_hudi` \{#from-hudi\}

从 Apache Hudi 表创建一个 DataStore。

```python
DataStore.from_hudi(path, **kwargs)
```

**示例：**

```python
ds = DataStore.from_hudi("/path/to/hudi_table")
ds = DataStore.uri("hudi:///path/to/hudi_table")
```

***


## 内存数据源 \{#in-memory\}

### `from_df` / `from_dataframe` \{#from-df\}

使用 pandas DataFrame 创建 DataStore。

```python
DataStore.from_df(df, name=None)
DataStore.from_dataframe(df, name=None)  # alias
```

**示例：**

```python
import pandas
from chdb.datastore import DataStore

pdf = pandas.DataFrame({'a': [1, 2, 3], 'b': ['x', 'y', 'z']})
ds = DataStore.from_df(pdf)
```


### `DataFrame` 构造函数 \{#dataframe-constructor\}

以类似于 pandas 的方式构造 DataStore。

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


## 特殊数据源 \{#special-sources\}

### `from_numbers` \{#from-numbers\}

创建一个包含连续数字的 DataStore（用于测试）。

```python
DataStore.from_numbers(count, **kwargs)
```

**示例：**

```python
ds = DataStore.from_numbers(1000000)  # 1M rows with 'number' column
result = ds.filter(ds['number'] % 2 == 0).head(10)  # Even numbers
```


### `from_random` \{#from-random\}

创建包含随机数据的 DataStore。

```python
DataStore.from_random(rows, columns, **kwargs)
```

**示例：**

```python
ds = DataStore.from_random(rows=1000, columns=5)
```


### `run_sql` \{#run-sql\}

根据原始 SQL 查询创建 DataStore。

```python
DataStore.run_sql(query)
```

**示例：**

```python
ds = DataStore.run_sql("""
    SELECT number, number * 2 as doubled
    FROM numbers(100)
    WHERE number % 10 = 0
""")
```

***


## 汇总表 \{#summary\}

| Method | Source Type | Example |
|--------|-------------|---------|
| `uri()` | 通用 | `DataStore.uri("s3://bucket/data.parquet")` |
| `from_file()` | 本地/远程文件 | `DataStore.from_file("data.csv")` |
| `read_csv()` | CSV 文件 | `pd.read_csv("data.csv")` |
| `read_parquet()` | Parquet 文件 | `pd.read_parquet("data.parquet")` |
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
| `from_df()` | pandas DataFrame | `DataStore.from_df(pandas_df)` |
| `DataFrame()` | 字典 / DataFrame | `pd.DataFrame({'a': [1, 2, 3]})` |
| `from_numbers()` | 连续数字序列 | `DataStore.from_numbers(1000000)` |
| `from_random()` | 随机数据 | `DataStore.from_random(rows=1000, columns=5)` |
| `run_sql()` | 原始 SQL 查询 | `DataStore.run_sql("SELECT * FROM ...")` |