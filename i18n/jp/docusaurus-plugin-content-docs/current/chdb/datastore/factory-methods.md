---
title: 'DataStore のファクトリーメソッド'
sidebar_label: 'ファクトリーメソッド'
slug: /chdb/datastore/factory-methods
description: 'ファイル、データベース、クラウドストレージ、データレイクから DataStore インスタンスを作成する'
keywords: ['chdb', 'datastore', 'factory', 'from_file', 'from_s3', 'uri', 'mysql', 'postgresql']
doc_type: 'reference'
---

# DataStore ファクトリーメソッド \{#datastore-factory-methods\}

DataStore は、ローカルファイル、データベース、クラウドストレージ、データレイクなど、さまざまなデータソースからインスタンスを生成するための 20 種類以上のファクトリーメソッドを提供します。

## ユニバーサル URI インターフェイス \{#uri\}

`uri()` メソッドは、ソースの種類を自動判別する、推奨される汎用的なエントリポイントです。

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


### URI 構文リファレンス \{#uri-syntax\}

| ソースタイプ | URI 形式 | 例 |
|-------------|------------|---------|
| ローカルファイル | `path/to/file` | `data.csv`, `/abs/path/data.parquet` |
| S3 | `s3://bucket/path` | `s3://mybucket/data.parquet?nosign=true` |
| GCS | `gs://bucket/path` | `gs://mybucket/data.csv` |
| Azure | `az://container/path` | `az://mycontainer/data.parquet` |
| HTTP/HTTPS | `https://url` | `https://example.com/data.csv` |
| MySQL | `mysql://user:pass@host:port/db/table` | `mysql://root:pass@localhost:3306/mydb/users` |
| PostgreSQL | `postgresql://user:pass@host:port/db/table` | `postgresql://postgres:pass@localhost:5432/mydb/users` |
| SQLite | `sqlite:///path?table=name` | `sqlite:///data.db?table=users` |
| ClickHouse | `clickhouse://host:port/db/table` | `clickhouse://localhost:9000/default/hits` |

---

## ファイルソース \{#file-sources\}

### `from_file` \{#from-file\}

ローカルまたはリモートのファイルから、フォーマットを自動判別して DataStore を作成します。

```python
DataStore.from_file(path, format=None, compression=None, **kwargs)
```

**パラメータ:**

| パラメータ         | 型   | デフォルト      | 説明                    |
| ------------- | --- | ---------- | --------------------- |
| `path`        | str | *required* | ファイルパス（ローカルまたは URL）   |
| `format`      | str | `None`     | ファイル形式（None の場合は自動検出） |
| `compression` | str | `None`     | 圧縮形式（None の場合は自動検出）   |

**サポートされている形式:** CSV, TSV, Parquet, JSON, JSONLines, ORC, Avro, Arrow

**例:**

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


### Pandas互換の読み込み関数 \{#pandas-read\}

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


## Cloud ストレージ \{#cloud-storage\}

### `from_s3` \{#from-s3\}

Amazon S3 から DataStore を作成します。

```python
DataStore.from_s3(url, access_key_id=None, secret_access_key=None, format=None, **kwargs)
```

**パラメータ:**

| パラメータ               | 型   | デフォルト      | 説明                       |
| ------------------- | --- | ---------- | ------------------------ |
| `url`               | str | *required* | S3 URL（s3://bucket/path） |
| `access_key_id`     | str | `None`     | AWS アクセスキー ID            |
| `secret_access_key` | str | `None`     | AWS シークレットアクセスキー         |
| `format`            | str | `None`     | ファイル形式（自動検出）             |

**例:**

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

Google Cloud Storage から DataStore を作成します。

```python
DataStore.from_gcs(url, credentials_path=None, **kwargs)
```

**使用例:**

```python
ds = DataStore.from_gcs("gs://bucket/data.parquet")
ds = DataStore.from_gcs("gs://bucket/data.parquet", credentials_path="/path/to/creds.json")
```


### `from_azure` \{#from-azure\}

Azure Blob Storage から DataStore を作成します。

```python
DataStore.from_azure(url, account_name=None, account_key=None, **kwargs)
```

**例：**

```python
ds = DataStore.from_azure(
    "az://container/data.parquet",
    account_name="myaccount",
    account_key="mykey"
)
```


### `from_hdfs` \{#from-hdfs\}

HDFS から DataStore を作成します。

```python
DataStore.from_hdfs(url, **kwargs)
```

**使用例:**

```python
ds = DataStore.from_hdfs("hdfs://namenode:8020/path/data.parquet")
```


### `from_url` \{#from-url\}

HTTP/HTTPS の URL から DataStore を作成します。

```python
DataStore.from_url(url, format=None, **kwargs)
```

**使用例:**

```python
ds = DataStore.from_url("https://example.com/data.csv")
ds = DataStore.from_url("https://raw.githubusercontent.com/user/repo/main/data.parquet")
```

***


## データベース \{#databases\}

### `from_mysql` \{#from-mysql\}

MySQL データベースから DataStore を作成します。

```python
DataStore.from_mysql(host, database, table, user, password, port=3306, **kwargs)
```

**パラメーター:**

| パラメーター     | 型   | デフォルト  | 説明         |
| ---------- | --- | ------ | ---------- |
| `host`     | str | *必須*   | MySQL ホスト名 |
| `database` | str | *必須*   | データベース名    |
| `table`    | str | *必須*   | テーブル名      |
| `user`     | str | *必須*   | ユーザー名      |
| `password` | str | *必須*   | パスワード      |
| `port`     | int | `3306` | ポート番号      |

**使用例:**

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

PostgreSQL データベースから DataStore を作成します。

```python
DataStore.from_postgresql(host, database, table, user, password, port=5432, **kwargs)
```

**使用例:**

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

ClickHouse サーバーから DataStore を作成します。

```python
DataStore.from_clickhouse(host, database, table, user=None, password=None, port=9000, **kwargs)
```

**例：**

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

MongoDB から DataStore を作成します。

```python
DataStore.from_mongodb(uri, database, collection, **kwargs)
```

**使用例:**

```python
ds = DataStore.from_mongodb(
    uri="mongodb://localhost:27017",
    database="mydb",
    collection="users"
)
```


### `from_sqlite` \{#from-sqlite\}

SQLite データベースから DataStore を作成します。

```python
DataStore.from_sqlite(database_path, table, **kwargs)
```

**例:**

```python
ds = DataStore.from_sqlite("data.db", table="users")

# Using URI
ds = DataStore.uri("sqlite:///data.db?table=users")
```

***


## データレイク \{#data-lakes\}

### `from_iceberg` \{#from-iceberg\}

Apache Iceberg テーブルから DataStore を作成します。

```python
DataStore.from_iceberg(path, **kwargs)
```

**使用例:**

```python
ds = DataStore.from_iceberg("/path/to/iceberg_table")
ds = DataStore.uri("iceberg://catalog/namespace/table")
```


### `from_delta` \{#from-delta\}

Delta Lake のテーブルから DataStore を作成します。

```python
DataStore.from_delta(path, **kwargs)
```

**例:**

```python
ds = DataStore.from_delta("/path/to/delta_table")
ds = DataStore.uri("deltalake:///path/to/delta_table")
```


### `from_hudi` \{#from-hudi\}

Apache Hudi テーブルから DataStore を作成します。

```python
DataStore.from_hudi(path, **kwargs)
```

**使用例:**

```python
ds = DataStore.from_hudi("/path/to/hudi_table")
ds = DataStore.uri("hudi:///path/to/hudi_table")
```

***


## インメモリ ソース \{#in-memory\}

### `from_df` / `from_dataframe` \{#from-df\}

pandas DataFrame から DataStore を作成します。

```python
DataStore.from_df(df, name=None)
DataStore.from_dataframe(df, name=None)  # alias
```

**使用例:**

```python
import pandas
from chdb.datastore import DataStore

pdf = pandas.DataFrame({'a': [1, 2, 3], 'b': ['x', 'y', 'z']})
ds = DataStore.from_df(pdf)
```


### `DataFrame` コンストラクタ \{#dataframe-constructor\}

pandas 風のコンストラクタを使用して DataStore を作成します。

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


## 特殊なデータソース \{#special-sources\}

### `from_numbers` \{#from-numbers\}

連番の数値を生成する DataStore を作成します（テスト用途に便利です）。

```python
DataStore.from_numbers(count, **kwargs)
```

**使用例:**

```python
ds = DataStore.from_numbers(1000000)  # 1M rows with 'number' column
result = ds.filter(ds['number'] % 2 == 0).head(10)  # Even numbers
```


### `from_random` \{#from-random\}

ランダムデータから DataStore を作成します。

```python
DataStore.from_random(rows, columns, **kwargs)
```

**使用例：**

```python
ds = DataStore.from_random(rows=1000, columns=5)
```


### `run_sql` \{#run-sql\}

生の SQL クエリから DataStore を生成します。

```python
DataStore.run_sql(query)
```

**例:**

```python
ds = DataStore.run_sql("""
    SELECT number, number * 2 as doubled
    FROM numbers(100)
    WHERE number % 10 = 0
""")
```

***


## 概要表 \{#summary\}

| Method | ソース種別 | 例 |
|--------|-------------|---------|
| `uri()` | 汎用 | `DataStore.uri("s3://bucket/data.parquet")` |
| `from_file()` | ローカル/リモートファイル | `DataStore.from_file("data.csv")` |
| `read_csv()` | CSVファイル | `pd.read_csv("data.csv")` |
| `read_parquet()` | Parquetファイル | `pd.read_parquet("data.parquet")` |
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
| `DataFrame()` | 辞書/DataFrame | `pd.DataFrame({'a': [1, 2, 3]})` |
| `from_numbers()` | 連番データ | `DataStore.from_numbers(1000000)` |
| `from_random()` | ランダムデータ | `DataStore.from_random(rows=1000, columns=5)` |
| `run_sql()` | 生のSQL | `DataStore.run_sql("SELECT * FROM ...")` |