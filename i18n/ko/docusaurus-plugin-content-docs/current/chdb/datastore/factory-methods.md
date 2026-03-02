---
title: 'DataStore 팩터리 메서드'
sidebar_label: '팩터리 메서드'
slug: /chdb/datastore/factory-methods
description: '파일, 데이터베이스, 클라우드 스토리지, 데이터 레이크에서 DataStore 인스턴스를 생성합니다'
keywords: ['chdb', 'datastore', 'factory', 'from_file', 'from_s3', 'uri', 'mysql', 'postgresql']
doc_type: 'reference'
---

# DataStore 팩토리 메서드 \{#datastore-factory-methods\}

DataStore에는 로컬 파일, 데이터베이스, Cloud 스토리지, 데이터 레이크 등 다양한 데이터 소스에서 인스턴스를 생성할 수 있는 20개 이상의 팩토리 메서드가 있습니다.

## Universal URI Interface \{#uri\}

`uri()` 메서드는 소스 유형을 자동으로 감지하는 권장 범용 진입점입니다.

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


### URI 구문 참조 \{#uri-syntax\}

| 소스 유형 | URI 형식 | 예시 |
|-------------|------------|---------|
| 로컬 파일 | `path/to/file` | `data.csv`, `/abs/path/data.parquet` |
| S3 | `s3://bucket/path` | `s3://mybucket/data.parquet?nosign=true` |
| GCS | `gs://bucket/path` | `gs://mybucket/data.csv` |
| Azure | `az://container/path` | `az://mycontainer/data.parquet` |
| HTTP/HTTPS | `https://url` | `https://example.com/data.csv` |
| MySQL | `mysql://user:pass@host:port/db/table` | `mysql://root:pass@localhost:3306/mydb/users` |
| PostgreSQL | `postgresql://user:pass@host:port/db/table` | `postgresql://postgres:pass@localhost:5432/mydb/users` |
| SQLite | `sqlite:///path?table=name` | `sqlite:///data.db?table=users` |
| ClickHouse | `clickhouse://host:port/db/table` | `clickhouse://localhost:9000/default/hits` |

---

## 파일 소스 \{#file-sources\}

### `from_file` \{#from-file\}

자동 형식 감지를 통해 로컬 또는 원격 파일에서 DataStore를 생성합니다.

```python
DataStore.from_file(path, format=None, compression=None, **kwargs)
```

**매개변수:**

| 매개변수          | 타입  | 기본값    | 설명                    |
| ------------- | --- | ------ | --------------------- |
| `path`        | str | *필수*   | 파일 경로(로컬 또는 URL)      |
| `format`      | str | `None` | 파일 형식(`None`이면 자동 감지) |
| `compression` | str | `None` | 압축 형식(`None`이면 자동 감지) |

**지원 형식:** CSV, TSV, Parquet, JSON, JSONLines, ORC, Avro, Arrow

**예제:**

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


### Pandas와 호환되는 읽기 함수 \{#pandas-read\}

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


## Cloud 스토리지 \{#cloud-storage\}

### `from_s3` \{#from-s3\}

Amazon S3 기반으로 DataStore를 생성합니다.

```python
DataStore.from_s3(url, access_key_id=None, secret_access_key=None, format=None, **kwargs)
```

**매개변수:**

| 매개변수                | 유형  | 기본값        | 설명                    |
| ------------------- | --- | ---------- | --------------------- |
| `url`               | str | *required* | S3 URL (s3://버킷/path) |
| `access_key_id`     | str | `None`     | AWS 액세스 키 ID          |
| `secret_access_key` | str | `None`     | AWS 비밀 액세스 키          |
| `format`            | str | `None`     | 파일 형식(자동 감지됨)         |

**예제:**

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

Google Cloud Storage에서 DataStore를 생성합니다.

```python
DataStore.from_gcs(url, credentials_path=None, **kwargs)
```

**예제:**

```python
ds = DataStore.from_gcs("gs://bucket/data.parquet")
ds = DataStore.from_gcs("gs://bucket/data.parquet", credentials_path="/path/to/creds.json")
```


### `from_azure` \{#from-azure\}

Azure Blob Storage로부터 DataStore를 생성합니다.

```python
DataStore.from_azure(url, account_name=None, account_key=None, **kwargs)
```

**예제:**

```python
ds = DataStore.from_azure(
    "az://container/data.parquet",
    account_name="myaccount",
    account_key="mykey"
)
```


### `from_hdfs` \{#from-hdfs\}

HDFS를 기반으로 DataStore를 생성합니다.

```python
DataStore.from_hdfs(url, **kwargs)
```

**예제:**

```python
ds = DataStore.from_hdfs("hdfs://namenode:8020/path/data.parquet")
```


### `from_url` \{#from-url\}

HTTP/HTTPS URL에서 DataStore를 생성합니다.

```python
DataStore.from_url(url, format=None, **kwargs)
```

**예시:**

```python
ds = DataStore.from_url("https://example.com/data.csv")
ds = DataStore.from_url("https://raw.githubusercontent.com/user/repo/main/data.parquet")
```

***


## 데이터베이스 \{#databases\}

### `from_mysql` \{#from-mysql\}

MySQL 데이터베이스에서 DataStore를 생성합니다.

```python
DataStore.from_mysql(host, database, table, user, password, port=3306, **kwargs)
```

**매개변수:**

| 매개변수       | 타입  | 기본값    | 설명        |
| ---------- | --- | ------ | --------- |
| `host`     | str | *필수*   | MySQL 호스트 |
| `database` | str | *필수*   | 데이터베이스 이름 |
| `table`    | str | *필수*   | 테이블 이름    |
| `user`     | str | *필수*   | 사용자 이름    |
| `password` | str | *필수*   | 비밀번호      |
| `port`     | int | `3306` | 포트 번호     |

**예제:**

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

PostgreSQL 데이터베이스로부터 DataStore를 생성합니다.

```python
DataStore.from_postgresql(host, database, table, user, password, port=5432, **kwargs)
```

**예제:**

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

ClickHouse 서버에서 DataStore를 생성합니다.

```python
DataStore.from_clickhouse(host, database, table, user=None, password=None, port=9000, **kwargs)
```

**예제:**

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

MongoDB로부터 DataStore를 생성합니다.

```python
DataStore.from_mongodb(uri, database, collection, **kwargs)
```

**예제:**

```python
ds = DataStore.from_mongodb(
    uri="mongodb://localhost:27017",
    database="mydb",
    collection="users"
)
```


### `from_sqlite` \{#from-sqlite\}

SQLite 데이터베이스에서 DataStore를 생성합니다.

```python
DataStore.from_sqlite(database_path, table, **kwargs)
```

**예시:**

```python
ds = DataStore.from_sqlite("data.db", table="users")

# Using URI
ds = DataStore.uri("sqlite:///data.db?table=users")
```

***


## 데이터 레이크 \{#data-lakes\}

### `from_iceberg` \{#from-iceberg\}

Apache Iceberg 테이블을 기반으로 DataStore를 생성합니다.

```python
DataStore.from_iceberg(path, **kwargs)
```

**예시:**

```python
ds = DataStore.from_iceberg("/path/to/iceberg_table")
ds = DataStore.uri("iceberg://catalog/namespace/table")
```


### `from_delta` \{#from-delta\}

Delta Lake 테이블에서 DataStore를 생성합니다.

```python
DataStore.from_delta(path, **kwargs)
```

**예제:**

```python
ds = DataStore.from_delta("/path/to/delta_table")
ds = DataStore.uri("deltalake:///path/to/delta_table")
```


### `from_hudi` \{#from-hudi\}

Apache Hudi 테이블을 기반으로 DataStore를 생성합니다.

```python
DataStore.from_hudi(path, **kwargs)
```

**예시:**

```python
ds = DataStore.from_hudi("/path/to/hudi_table")
ds = DataStore.uri("hudi:///path/to/hudi_table")
```

***


## 메모리 내 소스 \{#in-memory\}

### `from_df` / `from_dataframe` \{#from-df\}

pandas DataFrame으로부터 DataStore를 생성합니다.

```python
DataStore.from_df(df, name=None)
DataStore.from_dataframe(df, name=None)  # alias
```

**예시:**

```python
import pandas
from chdb.datastore import DataStore

pdf = pandas.DataFrame({'a': [1, 2, 3], 'b': ['x', 'y', 'z']})
ds = DataStore.from_df(pdf)
```


### `DataFrame` 생성자 \{#dataframe-constructor\}

pandas 스타일의 생성자를 사용하여 DataStore 인스턴스를 생성합니다.

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


## 특수 데이터 소스 \{#special-sources\}

### `from_numbers` \{#from-numbers\}

연속된 숫자를 사용하는 DataStore를 생성합니다(테스트에 유용합니다).

```python
DataStore.from_numbers(count, **kwargs)
```

**예시:**

```python
ds = DataStore.from_numbers(1000000)  # 1M rows with 'number' column
result = ds.filter(ds['number'] % 2 == 0).head(10)  # Even numbers
```


### `from_random` \{#from-random\}

무작위 데이터를 사용하여 DataStore를 생성합니다.

```python
DataStore.from_random(rows, columns, **kwargs)
```

**예제:**

```python
ds = DataStore.from_random(rows=1000, columns=5)
```


### `run_sql` \{#run-sql\}

원시 SQL 쿼리를 사용해 DataStore를 생성합니다.

```python
DataStore.run_sql(query)
```

**예시:**

```python
ds = DataStore.run_sql("""
    SELECT number, number * 2 as doubled
    FROM numbers(100)
    WHERE number % 10 = 0
""")
```

***


## 요약 표 \{#summary\}

| Method | 소스 유형 | 예시 |
|--------|-------------|---------|
| `uri()` | 범용 | `DataStore.uri("s3://bucket/data.parquet")` |
| `from_file()` | 로컬/원격 파일 | `DataStore.from_file("data.csv")` |
| `read_csv()` | CSV 파일 | `pd.read_csv("data.csv")` |
| `read_parquet()` | Parquet 파일 | `pd.read_parquet("data.parquet")` |
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
| `DataFrame()` | 딕셔너리/DataFrame | `pd.DataFrame({'a': [1, 2, 3]})` |
| `from_numbers()` | 연속된 숫자 | `DataStore.from_numbers(1000000)` |
| `from_random()` | 무작위 데이터 | `DataStore.from_random(rows=1000, columns=5)` |
| `run_sql()` | 원시 SQL | `DataStore.run_sql("SELECT * FROM ...")` |