---
title: 'DataStore 빠른 시작'
sidebar_label: '빠른 시작'
slug: /chdb/datastore/quickstart
description: 'DataStore 시작하기 - 설치, pandas에서 한 줄로 마이그레이션, 기본 사용 방법'
keywords: ['chdb', 'datastore', 'quickstart', 'installation', 'pandas', 'migration']
doc_type: 'guide'
---

# DataStore 빠른 시작 \{#datastore-quickstart\}

몇 분 만에 DataStore를 사용할 수 있습니다. 이 가이드에서는 설치 방법, pandas에서의 마이그레이션, 기본 사용 패턴을 설명합니다.

## 설치 \{#installation\}

`pip`으로 chDB를 설치합니다:

```bash
pip install "chdb>=4.0"
```

선택적 의존성:

```bash
# For pandas DataFrame support
pip install "chdb[pandas]>=4.0"

# For PyArrow support
pip install "chdb[arrow]>=4.0"

# All optional dependencies
pip install "chdb[all]>=4.0"
```


### 설치 확인 \{#verify\}

```python
import chdb
print(chdb.__version__)  # Should print 4.x.x or higher

from chdb import datastore as pd
print("DataStore ready!")
```


## Pandas에서 한 줄로 마이그레이션하기 \{#migration\}

DataStore를 사용하기 시작하는 가장 간단한 방법은 import 구문만 변경하는 것입니다:

```python
# Before (pandas)
import pandas as pd

# After (DataStore)
from chdb import datastore as pd
```

이제 완료되었습니다! 기존 pandas 코드는 앞으로 DataStore를 사용하며 SQL 최적화의 혜택을 누리게 됩니다.


### 마이그레이션 예제 \{#migration-example\}

```python
# Original pandas code
import pandas as pd

df = pd.read_csv("employees.csv")
result = (df[df['salary'] > 50000]
          .groupby('department')['salary']
          .agg(['mean', 'count'])
          .sort_values('mean', ascending=False))
print(result)

# DataStore version - just change the import!
from chdb import datastore as pd

df = pd.read_csv("employees.csv")
result = (df[df['salary'] > 50000]
          .groupby('department')['salary']
          .agg(['mean', 'count'])
          .sort_values('mean', ascending=False))
print(result)  # Same result, faster execution!
```


## 기본 사용법 \{#basic-usage\}

### DataStore 생성 \{#creating\}

```python
from chdb import datastore as pd

# From a dictionary
ds = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [25, 30, 35],
    'city': ['NYC', 'LA', 'NYC']
})

# From a pandas DataFrame
import pandas
pdf = pandas.DataFrame({'a': [1, 2, 3], 'b': [4, 5, 6]})
ds = pd.DataFrame(pdf)

# From a CSV file
ds = pd.read_csv("data.csv")

# From a Parquet file (recommended for large datasets)
ds = pd.read_parquet("data.parquet")
```


### 데이터 필터링 \{#filtering\}

```python
from chdb import datastore as pd

ds = pd.read_csv("employees.csv")

# Single condition
senior = ds[ds['age'] > 30]

# Multiple conditions (AND)
senior_nyc = ds[(ds['age'] > 30) & (ds['city'] == 'NYC')]

# Multiple conditions (OR)
young_or_senior = ds[(ds['age'] < 25) | (ds['age'] > 50)]

# Using filter method (SQL-style)
result = ds.filter(ds['salary'] > 50000)
```


### 컬럼 선택 \{#selecting\}

```python
# Pandas style
subset = ds[['name', 'age']]

# SQL style
subset = ds.select('name', 'age')
```


### 정렬 \{#sorting\}

```python
# Pandas style
sorted_ds = ds.sort_values('salary', ascending=False)

# SQL style
sorted_ds = ds.sort('salary', ascending=False)
```


### 그룹화 및 집계 \{#groupby\}

```python
from chdb import datastore as pd

ds = pd.read_csv("sales.csv")

# Group by single column
by_region = ds.groupby('region')['amount'].sum()

# Group by multiple columns
by_region_product = ds.groupby(['region', 'product']).agg({
    'amount': ['sum', 'mean'],
    'quantity': 'sum'
})

# Multiple aggregations
summary = ds.groupby('category').agg({
    'price': ['min', 'max', 'mean'],
    'quantity': 'sum'
})
```


### DataStore 조인 \{#joining\}

```python
from chdb import datastore as pd

employees = pd.read_csv("employees.csv")
departments = pd.read_csv("departments.csv")

# Inner join
result = employees.join(departments, on='dept_id', how='inner')

# Left join
result = employees.join(departments, on='dept_id', how='left')

# Using merge (pandas style)
result = pd.merge(employees, departments, on='dept_id')
```


## 결과 가져오기 \{#results\}

DataStore는 지연 평가(lazy evaluation) 방식을 사용하므로, 결과가 실제로 필요해질 때까지 연산이 실행되지 않습니다.

### 실행 시작하기 \{#execution-triggers\}

```python
# Automatic triggers
print(ds)           # Displaying results
len(ds)             # Getting row count
ds.columns          # Accessing properties
list(ds)            # Converting to list

# Explicit conversion
df = ds.to_df()     # Convert to pandas DataFrame
df = ds.to_pandas() # Same as to_df()
```


### 생성된 SQL 보기 \{#view-sql\}

```python
# See what SQL DataStore will execute
query = ds.filter(ds['age'] > 25).groupby('city').agg({'salary': 'mean'})
print(query.to_sql())
```

출력:

```sql
SELECT city, AVG(salary) AS mean
FROM file('data.csv', 'CSVWithNames')
WHERE age > 25
GROUP BY city
```


## 여러 데이터 소스 다루기 \{#data-sources\}

### 로컬 파일 \{#local-files\}

```python
from chdb import datastore as pd

# CSV
ds = pd.read_csv("data.csv")

# Parquet (best performance)
ds = pd.read_parquet("data.parquet")

# JSON
ds = pd.read_json("data.json")
```


### Cloud 스토리지 \{#cloud-storage\}

```python
from chdb.datastore import DataStore

# S3 (anonymous)
ds = DataStore.uri("s3://bucket/data.parquet?nosign=true")

# S3 (with credentials)
ds = DataStore.from_s3(
    "s3://bucket/data.parquet",
    access_key_id="KEY",
    secret_access_key="SECRET"
)

# HTTP/HTTPS
ds = DataStore.uri("https://example.com/data.csv")
```


### 데이터베이스 \{#databases\}

```python
from chdb.datastore import DataStore

# MySQL
ds = DataStore.from_mysql(
    host="localhost",
    database="mydb",
    table="users",
    user="root",
    password="pass"
)

# PostgreSQL
ds = DataStore.from_postgresql(
    host="localhost",
    database="mydb",
    table="users",
    user="postgres",
    password="pass"
)

# Using URI
ds = DataStore.uri("mysql://user:pass@localhost:3306/mydb/users")
```


## String 및 DateTime 연산 \{#accessors\}

### 문자열 연산 \{#string-ops\}

```python
# All pandas .str methods work
ds['name_upper'] = ds['name'].str.upper()
ds['name_len'] = ds['name'].str.len()
ds['has_a'] = ds['name'].str.contains('a')
```


### DateTime 연산 \{#datetime-ops\}

```python
# All pandas .dt methods work
ds['year'] = ds['date'].dt.year
ds['month'] = ds['date'].dt.month
ds['day_of_week'] = ds['date'].dt.dayofweek
```


### ClickHouse 확장 기능 \{#extensions\}

```python
# URL parsing (not available in pandas!)
ds['domain'] = ds['url'].url.domain()

# JSON extraction
ds['user_name'] = ds['json_data'].json.get_string('name')

# IP address operations
ds['is_ipv4'] = ds['ip_addr'].ip.is_ipv4_string()
```


## 모범 사례 \{#best-practices\}

### 1. 대용량 파일에는 Parquet을 사용하십시오 \{#use-parquet-for-large-files\}

```python
# CSV - slower, reads entire file
ds = pd.read_csv("large_data.csv")

# Parquet - faster, columnar format, reads only needed columns
ds = pd.read_parquet("large_data.parquet")
```


### 2. 먼저 필터링하기 \{#filter-early\}

```python
# Good - filter first, then aggregate
result = (ds
    .filter(ds['date'] >= '2024-01-01')
    .groupby('category')['amount'].sum()
)

# Less optimal - aggregate first
result = ds.groupby('category')['amount'].sum()
```


### 3. 필요한 컬럼만 선택합니다 \{#select-only-needed-columns\}

```python
# Good - select specific columns
result = ds.select('name', 'age', 'city').filter(ds['age'] > 25)

# Less optimal - work with all columns
result = ds.filter(ds['age'] > 25)
```


### 4. 복잡한 작업은 SQL로 수행 \{#use-sql-for-complex-operations\}

```python
# For complex queries, use SQL directly
ds = DataStore()
result = ds.sql("""
    SELECT category, 
           SUM(amount) as total,
           COUNT(*) as count,
           AVG(amount) as avg
    FROM file('sales.csv', 'CSVWithNames')
    WHERE date >= '2024-01-01'
    GROUP BY category
    HAVING total > 10000
    ORDER BY total DESC
    LIMIT 10
""")
```


## 다음 단계 \{#next-steps\}

- DataStore를 생성하는 다양한 [팩토리 메서드](factory-methods.md)를 확인하십시오
- SQL 스타일 연산을 위한 [쿼리 작성](query-building.md)을 살펴보십시오
- 문자열, datetime 등과 관련된 [Accessors](accessors.md)를 확인하십시오
- 최적화 팁은 [성능 가이드](../guides/pandas-performance.md)를 참조하십시오